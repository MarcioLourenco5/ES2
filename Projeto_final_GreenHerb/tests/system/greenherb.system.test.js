const request = require('supertest');
const app = require('../../src/app');

function unique(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

function validPlan(overrides = {}) {
  return {
    herbId: 1,
    type: 'regular',
    name: unique('PlanoSistema'),
    temperature: { min: 20, max: 26 },
    humidity: { min: 40, max: 80 },
    luminosity: { min: 5000, max: 25000 },
    cycleDays: 90,
    ...overrides,
  };
}

describe('Testes de Sistema — GREENHERB E2E', () => {
  let adminToken;
  let responsavelToken;
  let tecnicoToken;

  beforeAll(async () => {
    const admin = await request(app).post('/auth/login').send({ username: 'admin', password: 'Admin@1234' }).expect(200);
    const responsavel = await request(app).post('/auth/login').send({ username: 'responsavel', password: 'Resp@1234' }).expect(200);
    const tecnico = await request(app).post('/auth/login').send({ username: 'tecnico', password: 'Tech@1234' }).expect(200);
    adminToken = admin.body.token;
    responsavelToken = responsavel.body.token;
    tecnicoToken = tecnico.body.token;
  });

  test('TS-01 | ciclo completo de lote com tarefa, medição, divisão, fecho, produtividade e auditoria', async () => {
    const herb = await request(app)
      .post('/herbs')
      .set(auth(responsavelToken))
      .send({ name: unique('ErvaSistema'), scientificName: unique('Species'), description: 'Criada no fluxo TS-01' })
      .expect(201);

    const plan = await request(app)
      .post('/plans')
      .set(auth(responsavelToken))
      .send(validPlan({ herbId: herb.body.id }))
      .expect(201);

    const batch = await request(app)
      .post('/batches')
      .set(auth(tecnicoToken))
      .send({ planId: plan.body.id, herbId: herb.body.id, quantity: 100 })
      .expect(201);

    await request(app)
      .post('/tasks')
      .set(auth(tecnicoToken))
      .send({ batchId: batch.body.id, type: 'rega', scheduledDate: '2026-01-02', assignedTo: 3 })
      .expect(201);

    await request(app)
      .post('/measurements')
      .set(auth(tecnicoToken))
      .send({ batchId: batch.body.id, temperature: 22, humidity: 60, luminosity: 15000 })
      .expect(201);

    const split = await request(app)
      .post(`/batches/${batch.body.id}/split`)
      .set(auth(responsavelToken))
      .send({ quantity: 25 })
      .expect(201);
    expect(split.body.originalBatch.quantity).toBe(75);
    expect(split.body.newBatch.parentBatchId).toBe(batch.body.id);

    const closed = await request(app)
      .put(`/batches/${batch.body.id}`)
      .set(auth(tecnicoToken))
      .send({ status: 'concluído', endDate: batch.body.startDate, losses: 5 })
      .expect(200);
    expect(closed.body.productivity).toBeCloseTo(93.33, 2);

    const productivity = await request(app)
      .get(`/batches/${batch.body.id}/productivity`)
      .set(auth(tecnicoToken))
      .expect(200);
    expect(productivity.body.productivity).toBeCloseTo(93.33, 2);

    const audit = await request(app).get('/audit').set(auth(adminToken)).expect(200);
    const actions = audit.body.map(entry => entry.action);
    expect(actions).toEqual(expect.arrayContaining(['CREATE_BATCH', 'CREATE_TASK', 'SPLIT_BATCH', 'UPDATE_BATCH', 'CALCULATE_BATCH_PRODUCTIVITY']));
  });

  test('TS-02 | gestão de incidente: medição fora dos limites gera alerta crítico, plano de emergência é aplicado e alerta é resolvido', async () => {
    const plan = await request(app).post('/plans').set(auth(responsavelToken)).send(validPlan()).expect(201);
    const batch = await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: plan.body.id, herbId: 1, quantity: 50 }).expect(201);

    const measurement = await request(app)
      .post('/measurements')
      .set(auth(tecnicoToken))
      .send({ batchId: batch.body.id, temperature: 35, humidity: 25, luminosity: 15000 })
      .expect(201);
    expect(measurement.body.alertsGenerated).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'Crítico' })]));

    const emergencyPlan = await request(app)
      .post('/plans')
      .set(auth(responsavelToken))
      .send(validPlan({ type: 'emergência', name: unique('EmergenciaSistema') }))
      .expect(201);

    await request(app)
      .post(`/batches/${batch.body.id}/apply-plan`)
      .set(auth(responsavelToken))
      .send({ planId: emergencyPlan.body.id })
      .expect(200);

    const alertId = measurement.body.alertsGenerated[0].id;
    const resolved = await request(app)
      .patch(`/alerts/${alertId}/resolve`)
      .set(auth(responsavelToken))
      .send({ justification: 'Plano de emergência aplicado ao lote.' })
      .expect(200);
    expect(resolved.body.status).toBe('resolvido');
  });

  test('TS-03 | plano pontual sem autorização falha e com autorização é criado e aplicado ao lote', async () => {
    await request(app)
      .post('/plans')
      .set(auth(responsavelToken))
      .send(validPlan({ type: 'pontual', name: unique('PontualSemAutorizacao') }))
      .expect(403);

    const authorizedPlan = await request(app)
      .post('/plans')
      .set(auth(responsavelToken))
      .send(validPlan({ type: 'pontual', authorizedBy: 2, name: unique('PontualAutorizado') }))
      .expect(201);

    const regularPlan = await request(app).post('/plans').set(auth(responsavelToken)).send(validPlan()).expect(201);
    const batch = await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: regularPlan.body.id, herbId: 1, quantity: 20 }).expect(201);

    const applied = await request(app)
      .post(`/batches/${batch.body.id}/apply-plan`)
      .set(auth(responsavelToken))
      .send({ planId: authorizedPlan.body.id })
      .expect(200);
    expect(applied.body.batch.planId).toBe(authorizedPlan.body.id);
  });

  test('TS-04 | auditoria existe após operações de escrita e contém utilizador, ação e timestamp', async () => {
    const before = await request(app).get('/audit').set(auth(adminToken)).expect(200);
    const herb = await request(app)
      .post('/herbs')
      .set(auth(responsavelToken))
      .send({ name: unique('ErvaAuditoria'), scientificName: unique('AuditSpecies') })
      .expect(201);

    const after = await request(app).get('/audit').set(auth(adminToken)).expect(200);
    expect(after.body.length).toBeGreaterThan(before.body.length);
    expect(after.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        userId: expect.any(Number),
        action: 'CREATE_HERB',
        timestamp: expect.any(String),
        details: expect.objectContaining({ herbId: herb.body.id }),
      }),
    ]));
  });
});
