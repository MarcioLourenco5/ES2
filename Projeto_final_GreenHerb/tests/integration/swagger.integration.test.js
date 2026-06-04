const request = require('supertest');
const app = require('../../src/app');
const XLSX = require('xlsx');
const { auditLogs } = require('../../src/data/mockData');

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
    name: unique('PlanoInt'),
    temperature: { min: 20, max: 26 },
    humidity: { min: 40, max: 80 },
    luminosity: { min: 5000, max: 25000 },
    cycleDays: 90,
    ...overrides,
  };
}

function validUser(overrides = {}) {
  return {
    username: unique('userInt'),
    password: 'Teste@1234',
    role: 'Técnico',
    email: `${unique('user')}@greenherb.pt`,
    ...overrides,
  };
}


function workbookBase64(rows) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Herbs');
  return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
}

function validHerb(overrides = {}) {
  const name = unique('ErvaInt');
  return {
    name,
    scientificName: `${name} scientificus`,
    description: 'Erva criada por teste de integração',
    ...overrides,
  };
}

describe('Sprint 4 - Integração Swagger/OpenAPI com endpoints reais', () => {
  let adminToken;
  let responsavelToken;
  let tecnicoToken;
  let refreshToken;
  let createdUserId;
  let createdHerbId;
  let basePlanId;
  let pontualPlanId;
  let baseBatchId;
  let batchToConcludeId;
  let batchToCompromiseId;
  let taskId;
  let alertToResolveId;
  let alertToIgnoreId;
  let csvReportId;
  let excelReportId;
  let automationRuleId = 1;

  describe('Swagger/OpenAPI', () => {
    test('TI-SW-001 - GET /swagger.json devolve OpenAPI 3.x', async () => {
      const res = await request(app).get('/swagger.json').expect(200);
      expect(res.body.openapi).toMatch(/^3\./);
      expect(res.body.info.title).toBe('GREENHERB API');
    });

    test('TI-SW-002 - Swagger documenta os recursos principais do Sprint 4', async () => {
      const res = await request(app).get('/swagger.json').expect(200);
      expect(res.body.paths).toEqual(expect.objectContaining({
        '/auth/login': expect.any(Object),
        '/users': expect.any(Object),
        '/herbs': expect.any(Object),
        '/plans': expect.any(Object),
        '/batches': expect.any(Object),
        '/batches/{id}/split': expect.any(Object),
        '/tasks': expect.any(Object),
        '/measurements': expect.any(Object),
        '/alerts': expect.any(Object),
        '/automation': expect.any(Object),
        '/reports': expect.any(Object),
        '/audit': expect.any(Object),
      }));
    });

    test('TI-SW-003 - Swagger declara autenticação bearer JWT', async () => {
      const res = await request(app).get('/swagger.json').expect(200);
      expect(res.body.components.securitySchemes.bearerAuth).toEqual(expect.objectContaining({
        type: 'http',
        scheme: 'bearer',
      }));
    });
  });

  describe('Autenticação e headers Authorization', () => {
    test('TI-AU-001 - POST /auth/login com credenciais válidas autentica Administrador', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'admin', password: 'Admin@1234' })
        .expect(200);
      adminToken = res.body.token;
      refreshToken = res.body.refreshToken;
      expect(adminToken).toEqual(expect.any(String));
      expect(refreshToken).toEqual(expect.any(String));
      expect(res.body.user.role).toBe('Administrador');
    });

    test('TI-AU-002 - POST /auth/login autentica Responsável e Técnico', async () => {
      const responsavel = await request(app).post('/auth/login').send({ username: 'responsavel', password: 'Resp@1234' }).expect(200);
      const tecnico = await request(app).post('/auth/login').send({ username: 'tecnico', password: 'Tech@1234' }).expect(200);
      responsavelToken = responsavel.body.token;
      tecnicoToken = tecnico.body.token;
      expect(responsavel.body.user.role).toBe('Responsável');
      expect(tecnico.body.user.role).toBe('Técnico');
    });

    test('TI-AU-003 - POST /auth/login rejeita password errada', async () => {
      await request(app).post('/auth/login').send({ username: 'admin', password: 'Errada@1234' }).expect(401);
    });

    test('TI-AU-004 - POST /auth/login rejeita username inexistente', async () => {
      await request(app).post('/auth/login').send({ username: 'naoexiste', password: 'Admin@1234' }).expect(401);
    });

    test('TI-AU-005 - POST /auth/login valida username obrigatório', async () => {
      await request(app).post('/auth/login').send({ password: 'Admin@1234' }).expect(400);
    });

    test('TI-AU-006 - POST /auth/login valida password obrigatória', async () => {
      await request(app).post('/auth/login').send({ username: 'admin' }).expect(400);
    });

    test('TI-AU-007 - POST /auth/refresh com refreshToken válido devolve novo token', async () => {
      const res = await request(app).post('/auth/refresh').send({ refreshToken }).expect(200);
      expect(res.body.token).toEqual(expect.any(String));
    });

    test('TI-AU-008 - POST /auth/refresh rejeita refreshToken inválido', async () => {
      await request(app).post('/auth/refresh').send({ refreshToken: 'token-invalido' }).expect(401);
    });

    test('TI-AU-009 - GET /auth/me devolve utilizador autenticado', async () => {
      const res = await request(app).get('/auth/me').set(auth(adminToken)).expect(200);
      expect(res.body.username).toBe('admin');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    test('TI-AU-010 - GET /auth/me sem token devolve 401', async () => {
      await request(app).get('/auth/me').expect(401);
    });
  });

  describe('Users e RBAC', () => {
    test('TI-US-001 - GET /users lista utilizadores autenticado', async () => {
      const res = await request(app).get('/users').set(auth(adminToken)).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).not.toHaveProperty('passwordHash');
    });

    test('TI-US-002 - GET /users sem token devolve 401', async () => {
      await request(app).get('/users').expect(401);
    });

    test('TI-US-003 - Técnico não pode criar utilizadores', async () => {
      await request(app).post('/users').set(auth(tecnicoToken)).send(validUser()).expect(403);
    });

    test('TI-US-004 - Responsável não pode criar utilizadores', async () => {
      await request(app).post('/users').set(auth(responsavelToken)).send(validUser()).expect(403);
    });

    test('TI-US-005 - Administrador cria utilizador válido', async () => {
      const res = await request(app).post('/users').set(auth(adminToken)).send(validUser()).expect(201);
      createdUserId = res.body.id;
      expect(res.body.role).toBe('Técnico');
      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    test('TI-US-006 - POST /users valida campos obrigatórios', async () => {
      await request(app).post('/users').set(auth(adminToken)).send({ username: unique('semRole'), password: 'Teste@1234' }).expect(400);
    });

    test('TI-US-007 - POST /users rejeita role fora do enum real', async () => {
      await request(app).post('/users').set(auth(adminToken)).send(validUser({ role: 'Operador' })).expect(400);
    });

    test('TI-US-008 - POST /users rejeita username duplicado', async () => {
      await request(app).post('/users').set(auth(adminToken)).send({ username: 'admin', password: 'Teste@1234', role: 'Técnico' }).expect(409);
    });

    test('TI-US-009 - GET /users/:id consulta utilizador existente', async () => {
      const res = await request(app).get(`/users/${createdUserId}`).set(auth(adminToken)).expect(200);
      expect(res.body.id).toBe(createdUserId);
    });

    test('TI-US-010 - GET /users/:id inexistente devolve 404', async () => {
      await request(app).get('/users/999999').set(auth(adminToken)).expect(404);
    });

    test('TI-US-011 - PUT /users/:id atualiza dados', async () => {
      const res = await request(app).put(`/users/${createdUserId}`).set(auth(adminToken)).send({ email: 'alterado@greenherb.pt' }).expect(200);
      expect(res.body.email).toBe('alterado@greenherb.pt');
    });

    test('TI-US-012 - DELETE /users/:id elimina utilizador', async () => {
      await request(app).delete(`/users/${createdUserId}`).set(auth(adminToken)).expect(204);
    });
  });

  describe('Herbs e importação CSV adaptada ao endpoint real', () => {
    test('TI-HB-001 - GET /herbs lista catálogo autenticado', async () => {
      const res = await request(app).get('/herbs').set(auth(tecnicoToken)).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('TI-HB-002 - POST /herbs sem token devolve 401', async () => {
      await request(app).post('/herbs').send(validHerb()).expect(401);
    });

    test('TI-HB-003 - Técnico não pode criar ervas', async () => {
      await request(app).post('/herbs').set(auth(tecnicoToken)).send(validHerb()).expect(403);
    });

    test('TI-HB-004 - Responsável cria erva válida', async () => {
      const res = await request(app).post('/herbs').set(auth(responsavelToken)).send(validHerb()).expect(201);
      createdHerbId = res.body.id;
      expect(res.body.name).toEqual(expect.any(String));
    });

    test('TI-HB-005 - POST /herbs valida name obrigatório', async () => {
      await request(app).post('/herbs').set(auth(responsavelToken)).send({ scientificName: 'Sem nome' }).expect(400);
    });

    test('TI-HB-006 - GET /herbs/:id consulta erva existente', async () => {
      const res = await request(app).get(`/herbs/${createdHerbId}`).set(auth(tecnicoToken)).expect(200);
      expect(res.body.id).toBe(createdHerbId);
    });

    test('TI-HB-007 - GET /herbs/:id inexistente devolve 404', async () => {
      await request(app).get('/herbs/999999').set(auth(tecnicoToken)).expect(404);
    });

    test('TI-HB-008 - PUT /herbs/:id atualiza erva', async () => {
      const res = await request(app).put(`/herbs/${createdHerbId}`).set(auth(responsavelToken)).send({ description: 'Descrição atualizada' }).expect(200);
      expect(res.body.description).toBe('Descrição atualizada');
    });

    test('TI-HB-009 - Administrador importa CSV com 3 linhas válidas via body.data', async () => {
      const a = unique('CSV_A');
      const b = unique('CSV_B');
      const c = unique('CSV_C');
      const csv = `name,scientificName,description\n${a},${a} sci,Desc A\n${b},${b} sci,Desc B\n${c},${c} sci,Desc C`;
      const res = await request(app).post('/herbs/import').set(auth(adminToken)).send({ data: csv }).expect(200);
      expect(res.body.imported).toBe(3);
    });

    test('TI-HB-016 - Administrador importa Excel .xlsx em base64 via /herbs/import', async () => {
      const a = unique('XLSX_A');
      const b = unique('XLSX_B');
      const data = workbookBase64([
        ['name', 'scientificName', 'description'],
        [a, `${a} sci`, 'Desc A'],
        [b, `${b} sci`, 'Desc B'],
      ]);
      const res = await request(app).post('/herbs/import').set(auth(adminToken)).send({ data, format: 'Excel' }).expect(200);
      expect(res.body.imported).toBe(2);
      expect(res.body.skipped).toBe(0);
    });

    test('TI-HB-010 - POST /herbs/import rejeita ficheiro/conteúdo em falta', async () => {
      await request(app).post('/herbs/import').set(auth(adminToken)).send({}).expect(400);
    });

    test('TI-HB-011 - POST /herbs/import rejeita linha com nome vazio', async () => {
      const csv = 'name,scientificName,description\n,Mentha spicata,Erva';
      await request(app).post('/herbs/import').set(auth(adminToken)).send({ data: csv }).expect(422);
    });

    test('TI-HB-012 - POST /herbs/import aceita CSV misto e reporta erros', async () => {
      const ok = unique('CSV_OK');
      const csv = `name,scientificName,description\n${ok},${ok} sci,Válida\n,Sci inválida,Inválida`;
      const res = await request(app).post('/herbs/import').set(auth(adminToken)).send({ data: csv }).expect(200);
      expect(res.body.imported).toBe(1);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
    });

    test('TI-HB-013 - Responsável não pode importar CSV', async () => {
      const csv = `name,scientificName,description\n${unique('CSV_RBAC')},Sci,Desc`;
      await request(app).post('/herbs/import').set(auth(responsavelToken)).send({ data: csv }).expect(403);
    });

    test('TI-HB-014 - POST /herbs/import rejeita linha com colunas a mais', async () => {
      const csv = `name,scientificName,description\n${unique('CSV_BAD')},Sci,Desc,ColunaExtra`;
      await request(app).post('/herbs/import').set(auth(adminToken)).send({ data: csv }).expect(422);
    });

    test('TI-HB-015 - DELETE /herbs/:id elimina erva', async () => {
      await request(app).delete(`/herbs/${createdHerbId}`).set(auth(adminToken)).expect(204);
    });
  });

  describe('Plans', () => {
    test('TI-PL-001 - POST /plans sem Authorization devolve 401', async () => {
      await request(app).post('/plans').send(validPlan()).expect(401);
    });

    test('TI-PL-002 - Técnico não pode criar plano', async () => {
      await request(app).post('/plans').set(auth(tecnicoToken)).send(validPlan()).expect(403);
    });

    test('TI-PL-003 - Responsável cria plano regular válido', async () => {
      const res = await request(app).post('/plans').set(auth(responsavelToken)).send(validPlan()).expect(201);
      basePlanId = res.body.id;
      expect(res.body.type).toBe('regular');
      expect(res.body.temperature).toEqual({ min: 20, max: 26 });
    });

    test('TI-PL-004 - Administrador cria plano de emergência válido', async () => {
      const res = await request(app).post('/plans').set(auth(adminToken)).send(validPlan({ type: 'emergência' })).expect(201);
      expect(res.body.type).toBe('emergência');
    });

    test('TI-PL-005 - GET /plans/:id confirma persistência do plano criado', async () => {
      const res = await request(app).get(`/plans/${basePlanId}`).set(auth(tecnicoToken)).expect(200);
      expect(res.body.id).toBe(basePlanId);
    });

    test('TI-PL-006 - POST /plans rejeita type inválido', async () => {
      await request(app).post('/plans').set(auth(responsavelToken)).send(validPlan({ type: 'sazonal' })).expect(400);
    });

    test('TI-PL-007 - POST /plans rejeita temperatura fora dos limites de especificação', async () => {
      await request(app).post('/plans').set(auth(responsavelToken)).send(validPlan({ temperature: { min: 17, max: 26 } })).expect(400);
    });

    test('TI-PL-008 - Plano pontual sem authorizedBy é rejeitado', async () => {
      await request(app).post('/plans').set(auth(responsavelToken)).send(validPlan({ type: 'pontual' })).expect(403);
    });

    test('TI-PL-009 - Plano pontual com authorizedBy inexistente é rejeitado', async () => {
      await request(app).post('/plans').set(auth(responsavelToken)).send(validPlan({ type: 'pontual', authorizedBy: 999999 })).expect(403);
    });

    test('TI-PL-010 - Plano pontual com authorizedBy de Responsável ativo é aceite', async () => {
      const res = await request(app).post('/plans').set(auth(responsavelToken)).send(validPlan({ type: 'pontual', authorizedBy: 2 })).expect(201);
      pontualPlanId = res.body.id;
      expect(res.body.authorizedBy).toBe(2);
    });
  });

  describe('Batches e produtividade', () => {
    test('TI-BA-001 - POST /batches valida planId obrigatório', async () => {
      await request(app).post('/batches').set(auth(tecnicoToken)).send({ herbId: 1, quantity: 50 }).expect(400);
    });

    test('TI-BA-002 - POST /batches com planId inexistente devolve 404', async () => {
      await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: 999999, herbId: 1, quantity: 50 }).expect(404);
    });

    test('TI-BA-003 - POST /batches cria lote associado a plano', async () => {
      const res = await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: basePlanId, herbId: 1, quantity: 100 }).expect(201);
      baseBatchId = res.body.id;
      expect(res.body.planId).toBe(basePlanId);
      expect(res.body.status).toBe('ativo');
    });

    test('TI-BA-004 - GET /batches/:id confirma associação planId', async () => {
      const res = await request(app).get(`/batches/${baseBatchId}`).set(auth(tecnicoToken)).expect(200);
      expect(res.body.planId).toBe(basePlanId);
    });

    test('TI-BA-005 - POST /batches/:id/apply-plan exige planId', async () => {
      await request(app).post(`/batches/${baseBatchId}/apply-plan`).set(auth(responsavelToken)).send({}).expect(400);
    });

    test('TI-BA-006 - POST /batches/:id/apply-plan aplica plano pontual autorizado', async () => {
      const res = await request(app).post(`/batches/${baseBatchId}/apply-plan`).set(auth(responsavelToken)).send({ planId: pontualPlanId }).expect(200);
      expect(res.body.batch.planId).toBe(pontualPlanId);
      // Repor plano regular para testes ambientais previsíveis.
      await request(app).post(`/batches/${baseBatchId}/apply-plan`).set(auth(responsavelToken)).send({ planId: basePlanId }).expect(200);
    });

    test('TI-BA-016 - POST /batches/:id/split divide parcialmente lote ativo', async () => {
      const created = await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: basePlanId, herbId: 1, quantity: 80 }).expect(201);
      const res = await request(app).post(`/batches/${created.body.id}/split`).set(auth(responsavelToken)).send({ quantity: 20 }).expect(201);
      expect(res.body.originalBatch.quantity).toBe(60);
      expect(res.body.newBatch).toEqual(expect.objectContaining({ parentBatchId: created.body.id, quantity: 20, status: 'ativo' }));
    });

    test('TI-BA-017 - POST /batches/:id/split rejeita divisão total', async () => {
      const created = await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: basePlanId, herbId: 1, quantity: 30 }).expect(201);
      await request(app).post(`/batches/${created.body.id}/split`).set(auth(responsavelToken)).send({ quantity: 30 }).expect(422);
    });

    test('TI-BA-007 - PATCH /batches/:id/losses rejeita perdas negativas', async () => {
      await request(app).patch(`/batches/${baseBatchId}/losses`).set(auth(tecnicoToken)).send({ losses: -1 }).expect(400);
    });

    test('TI-BA-008 - PATCH /batches/:id/losses rejeita perdas superiores à quantidade', async () => {
      await request(app).patch(`/batches/${baseBatchId}/losses`).set(auth(tecnicoToken)).send({ losses: 101 }).expect(422);
    });

    test('TI-BA-009 - PUT /batches/:id rejeita endDate anterior a startDate', async () => {
      await request(app).put(`/batches/${baseBatchId}`).set(auth(tecnicoToken)).send({ status: 'concluído', endDate: '2024-12-31' }).expect(400);
    });

    test('TI-BA-010 - PUT /batches/:id rejeita status fora do enum', async () => {
      await request(app).put(`/batches/${baseBatchId}`).set(auth(tecnicoToken)).send({ status: 'cancelado' }).expect(400);
    });

    test('TI-BA-011 - PUT /batches/:id calcula produtividade com losses=0', async () => {
      const created = await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: basePlanId, herbId: 1, quantity: 100 }).expect(201);
      batchToConcludeId = created.body.id;
      const res = await request(app).put(`/batches/${batchToConcludeId}`).set(auth(tecnicoToken)).send({ status: 'concluído', endDate: created.body.startDate, losses: 0 }).expect(200);
      expect(res.body.productivity).toBe(100);
    });

    test('TI-BA-012 - GET /batches/:id/productivity devolve produtividade descontada por losses', async () => {
      const created = await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: basePlanId, herbId: 1, quantity: 100 }).expect(201);
      const id = created.body.id;
      await request(app).put(`/batches/${id}`).set(auth(tecnicoToken)).send({ status: 'concluído', endDate: created.body.startDate, losses: 20 }).expect(200);
      const res = await request(app).get(`/batches/${id}/productivity`).set(auth(tecnicoToken)).expect(200);
      expect(res.body.productivity).toBe(80);
    });

    test('TI-BA-013 - PUT /batches/:id permite transição para comprometido', async () => {
      const created = await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: basePlanId, herbId: 1, quantity: 50 }).expect(201);
      batchToCompromiseId = created.body.id;
      const res = await request(app).put(`/batches/${batchToCompromiseId}`).set(auth(tecnicoToken)).send({ status: 'comprometido' }).expect(200);
      expect(res.body.status).toBe('comprometido');
    });

    test('TI-BA-014 - PUT /batches/:id impede transição a partir de estado terminal', async () => {
      await request(app).put(`/batches/${batchToCompromiseId}`).set(auth(tecnicoToken)).send({ status: 'ativo' }).expect(400);
    });

    test('TI-BA-015 - PUT /batches/:id inexistente devolve 404', async () => {
      await request(app).put('/batches/999999').set(auth(tecnicoToken)).send({ status: 'comprometido' }).expect(404);
    });
  });

  describe('Tasks', () => {
    test('TI-TA-001 - POST /tasks cria tarefa válida', async () => {
      const res = await request(app).post('/tasks').set(auth(tecnicoToken)).send({ batchId: baseBatchId, type: 'rega', scheduledDate: '2026-01-02', assignedTo: 3 }).expect(201);
      taskId = res.body.id;
      expect(res.body.status).toBe('pendente');
    });

    test('TI-TA-002 - POST /tasks valida batchId obrigatório', async () => {
      await request(app).post('/tasks').set(auth(tecnicoToken)).send({ type: 'rega', scheduledDate: '2026-01-02' }).expect(400);
    });

    test('TI-TA-003 - POST /tasks valida type obrigatório/enum', async () => {
      await request(app).post('/tasks').set(auth(tecnicoToken)).send({ batchId: baseBatchId, scheduledDate: '2026-01-02' }).expect(400);
      await request(app).post('/tasks').set(auth(tecnicoToken)).send({ batchId: baseBatchId, type: 'limpeza', scheduledDate: '2026-01-02' }).expect(400);
    });

    test('TI-TA-004 - POST /tasks rejeita batchId inexistente', async () => {
      await request(app).post('/tasks').set(auth(tecnicoToken)).send({ batchId: 999999, type: 'rega', scheduledDate: '2026-01-02' }).expect(404);
    });

    test('TI-TA-005 - GET /tasks lista tarefas', async () => {
      const res = await request(app).get('/tasks').set(auth(tecnicoToken)).expect(200);
      expect(res.body.some(t => t.id === taskId)).toBe(true);
    });

    test('TI-TA-006 - GET /tasks/:id consulta tarefa por ID', async () => {
      const res = await request(app).get(`/tasks/${taskId}`).set(auth(tecnicoToken)).expect(200);
      expect(res.body.id).toBe(taskId);
    });

    test('TI-TA-007 - PATCH /tasks/:id atualiza tarefa', async () => {
      const res = await request(app).patch(`/tasks/${taskId}`).set(auth(tecnicoToken)).send({ status: 'concluída' }).expect(200);
      expect(res.body.status).toBe('concluída');
    });

    test('TI-TA-008 - GET /tasks/:id inexistente devolve 404', async () => {
      await request(app).get('/tasks/999999').set(auth(tecnicoToken)).expect(404);
    });

    test('TI-TA-009 - DELETE /tasks/:id elimina tarefa', async () => {
      await request(app).delete(`/tasks/${taskId}`).set(auth(responsavelToken)).expect(204);
    });
  });

  describe('Measurements e Alerts', () => {
    test('TI-ME-001 - POST /measurements sem Authorization devolve 401', async () => {
      await request(app).post('/measurements').send({ batchId: baseBatchId, temperature: 22, humidity: 60, luminosity: 15000 }).expect(401);
    });

    test('TI-ME-002 - POST /measurements rejeita batchId ausente', async () => {
      await request(app).post('/measurements').set(auth(tecnicoToken)).send({ temperature: 22, humidity: 60, luminosity: 15000 }).expect(400);
    });

    test('TI-ME-003 - POST /measurements exige valores de sensor', async () => {
      await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: baseBatchId }).expect(400);
    });

    test('TI-ME-004 - POST /measurements rejeita tipos inválidos nos sensores e batchId', async () => {
      await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: baseBatchId, temperature: '22', humidity: 60, luminosity: 15000 }).expect(400);
      await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: baseBatchId, temperature: 22, humidity: null, luminosity: 15000 }).expect(400);
      await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: baseBatchId, temperature: 22, humidity: 60, luminosity: [] }).expect(400);
      await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: 'abc', temperature: 22, humidity: 60, luminosity: 15000 }).expect(400);
    });

    test('TI-ME-005 - POST /measurements com batchId inexistente devolve 404', async () => {
      await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: 999999, temperature: 22, humidity: 60, luminosity: 15000 }).expect(404);
    });

    test('TI-ME-006 - Medição dentro dos limites não gera alerta', async () => {
      const res = await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: baseBatchId, temperature: 22, humidity: 60, luminosity: 15000 }).expect(201);
      expect(res.body.alertsGenerated).toHaveLength(0);
    });

    test('TI-ME-007 - Desvio pequeno de temperatura gera alerta Informativo', async () => {
      const res = await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: baseBatchId, temperature: 27, humidity: 60, luminosity: 15000 }).expect(201);
      expect(res.body.alertsGenerated).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'Informativo' })]));
    });

    test('TI-ME-008 - Desvio médio de temperatura gera alerta Aviso', async () => {
      const res = await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: baseBatchId, temperature: 30, humidity: 60, luminosity: 15000 }).expect(201);
      expect(res.body.alertsGenerated).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'Aviso' })]));
    });

    test('TI-ME-009 - Desvio crítico de temperatura gera alerta Crítico', async () => {
      const res = await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: baseBatchId, temperature: 32, humidity: 60, luminosity: 15000 }).expect(201);
      alertToResolveId = res.body.alertsGenerated[0].id;
      expect(res.body.alertsGenerated).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'Crítico' })]));
    });

    test('TI-ME-010 - Duas violações ambientais geram dois alertas', async () => {
      const res = await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: baseBatchId, temperature: 32, humidity: 29, luminosity: 15000 }).expect(201);
      alertToIgnoreId = res.body.alertsGenerated[0].id;
      expect(res.body.alertsGenerated.length).toBeGreaterThanOrEqual(2);
      expect(res.body.alertsGenerated).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'Crítico', message: expect.stringContaining('Temperatura') }),
        expect.objectContaining({ type: 'Crítico', message: expect.stringContaining('Humidade') }),
      ]));
    });

    test('TI-ME-011 - Lote existente sem plano associado devolve 422', async () => {
      const plan = await request(app).post('/plans').set(auth(responsavelToken)).send(validPlan()).expect(201);
      const batch = await request(app).post('/batches').set(auth(tecnicoToken)).send({ planId: plan.body.id, herbId: 1, quantity: 10 }).expect(201);
      await request(app).delete(`/plans/${plan.body.id}`).set(auth(adminToken)).expect(204);
      await request(app).post('/measurements').set(auth(tecnicoToken)).send({ batchId: batch.body.id, temperature: 32, humidity: 60, luminosity: 15000 }).expect(422);
    });

    test('TI-AL-001 - PATCH /alerts/:id/resolve sem token devolve 401', async () => {
      await request(app).patch(`/alerts/${alertToResolveId}/resolve`).send({}).expect(401);
    });

    test('TI-AL-002 - PATCH /alerts/:id/resolve resolve sem justificação', async () => {
      const res = await request(app).patch(`/alerts/${alertToResolveId}/resolve`).set(auth(responsavelToken)).send({}).expect(200);
      expect(res.body.status).toBe('resolvido');
    });

    test('TI-AL-003 - PATCH /alerts/:id/resolve impede reprocessamento', async () => {
      await request(app).patch(`/alerts/${alertToResolveId}/resolve`).set(auth(responsavelToken)).send({}).expect(422);
    });

    test('TI-AL-004 - PATCH /alerts/:id/ignore exige justificação', async () => {
      await request(app).patch(`/alerts/${alertToIgnoreId}/ignore`).set(auth(responsavelToken)).send({}).expect(422);
    });

    test('TI-AL-005 - PATCH /alerts/:id/ignore rejeita justificação com 9 chars', async () => {
      await request(app).patch(`/alerts/${alertToIgnoreId}/ignore`).set(auth(responsavelToken)).send({ justification: '123456789' }).expect(422);
    });

    test('TI-AL-006 - PATCH /alerts/:id/ignore aceita justificação válida', async () => {
      const res = await request(app).patch(`/alerts/${alertToIgnoreId}/ignore`).set(auth(responsavelToken)).send({ justification: 'Justificação válida para ignorar o alerta.' }).expect(200);
      expect(res.body.status).toBe('ignorado');
    });
  });

  describe('Reports', () => {
    test('TI-RP-001 - POST /reports sem token devolve 401', async () => {
      await request(app).post('/reports').send({ type: 'batch_summary', format: 'CSV' }).expect(401);
    });

    test('TI-RP-002 - Técnico não pode gerar relatório', async () => {
      await request(app).post('/reports').set(auth(tecnicoToken)).send({ type: 'batch_summary', format: 'CSV' }).expect(403);
    });

    test('TI-RP-003 - POST /reports rejeita formato inválido', async () => {
      await request(app).post('/reports').set(auth(responsavelToken)).send({ type: 'batch_summary', format: 'PDF' }).expect(400);
    });

    test('TI-RP-004 - POST /reports rejeita tipo inválido', async () => {
      await request(app).post('/reports').set(auth(responsavelToken)).send({ type: 'inventario', format: 'CSV' }).expect(400);
    });

    test('TI-RP-005 - POST /reports cria relatório CSV de lotes', async () => {
      const res = await request(app).post('/reports').set(auth(responsavelToken)).send({ type: 'batch_summary', format: 'CSV', batchId: baseBatchId }).expect(201);
      csvReportId = res.body.id;
      expect(res.body.format).toBe('CSV');
    });

    test('TI-RP-006 - GET /reports/:id/export exporta CSV com dados reais', async () => {
      const res = await request(app).get(`/reports/${csvReportId}/export`).set(auth(responsavelToken)).expect(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('id,planId,herbId,status');
      expect(res.text).toContain(String(baseBatchId));
    });

    test('TI-RP-007 - POST /reports cria relatório CSV de medições', async () => {
      const report = await request(app).post('/reports').set(auth(responsavelToken)).send({ type: 'measurements', format: 'CSV', batchId: baseBatchId }).expect(201);
      const res = await request(app).get(`/reports/${report.body.id}/export`).set(auth(responsavelToken)).expect(200);
      expect(res.text).toContain('temperature');
    });

    test('TI-RP-008 - POST /reports cria relatório de auditoria CSV', async () => {
      const report = await request(app).post('/reports').set(auth(adminToken)).send({ type: 'audit', format: 'CSV' }).expect(201);
      const res = await request(app).get(`/reports/${report.body.id}/export`).set(auth(adminToken)).expect(200);
      expect(res.text).toContain('action');
    });

    test('TI-RP-009 - POST /reports cria relatório Excel realista', async () => {
      const res = await request(app).post('/reports').set(auth(responsavelToken)).send({ type: 'batch_summary', format: 'Excel', batchId: baseBatchId }).expect(201);
      excelReportId = res.body.id;
      expect(res.body.format).toBe('Excel');
    });

    test('TI-RP-010 - GET /reports/:id/export devolve XML compatível com Excel', async () => {
      const res = await request(app).get(`/reports/${excelReportId}/export`).set(auth(responsavelToken)).expect(200);
      expect(res.headers['content-type']).toContain('application/vnd.ms-excel');
      expect(res.text).toContain('<?mso-application progid="Excel.Sheet"?>');
      expect(res.text).toContain('<Workbook');
      expect(res.text).toContain('<Worksheet');
    });
  });

  describe('Automation', () => {
    test('TI-AT-001 - GET /automation lista regras', async () => {
      const res = await request(app).get('/automation').set(auth(adminToken)).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      automationRuleId = res.body[0].id;
    });

    test('TI-AT-002 - GET /automation/:id lê modo inicial da regra', async () => {
      const res = await request(app).get(`/automation/${automationRuleId}`).set(auth(adminToken)).expect(200);
      expect(['Manual', 'Automático']).toContain(res.body.mode);
    });

    test('TI-AT-003 - PATCH /automation/:id/mode comuta para Automático', async () => {
      const res = await request(app).patch(`/automation/${automationRuleId}/mode`).set(auth(responsavelToken)).send({ mode: 'Automático' }).expect(200);
      expect(res.body.rule.mode).toBe('Automático');
    });

    test('TI-AT-004 - PATCH /automation/:id/mode reverte para Manual', async () => {
      const res = await request(app).patch(`/automation/${automationRuleId}/mode`).set(auth(responsavelToken)).send({ mode: 'Manual' }).expect(200);
      expect(res.body.rule.mode).toBe('Manual');
    });

    test('TI-AT-005 - PATCH /automation/:id/mode rejeita modo inválido', async () => {
      await request(app).patch(`/automation/${automationRuleId}/mode`).set(auth(responsavelToken)).send({ mode: 'Híbrido' }).expect(400);
    });

    test('TI-AT-006 - Técnico não pode comutar modo de automação', async () => {
      await request(app).patch(`/automation/${automationRuleId}/mode`).set(auth(tecnicoToken)).send({ mode: 'Automático' }).expect(403);
    });

    test('TI-AT-007 - POST /automation cria regra válida', async () => {
      const res = await request(app).post('/automation').set(auth(responsavelToken)).send({ name: unique('Regra'), trigger: 'temperature > 30', action: 'notificar', mode: 'Manual' }).expect(201);
      expect(res.body.mode).toBe('Manual');
    });
  });

  describe('Audit', () => {
    test('TI-AD-001 - GET /audit sem token devolve 401', async () => {
      await request(app).get('/audit').expect(401);
    });

    test('TI-AD-002 - Técnico não pode consultar auditoria', async () => {
      await request(app).get('/audit').set(auth(tecnicoToken)).expect(403);
    });


    test('TI-AU-005 - GET /auth/me com token expirado devolve 401', async () => {
  const tokenExpirado = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Um token JWT já caducado
  await request(app)
    .get('/auth/me')
    .set('Authorization', `Bearer ${tokenExpirado}`)
    .expect(401); // O sistema deve rejeitar com Não Autorizado
});

    test('TI-AD-003 - Administrador consulta auditoria e encontra ações relevantes', async () => {
      const res = await request(app).get('/audit').set(auth(adminToken)).expect(200);
      const actions = res.body.map(log => log.action);
      expect(actions).toEqual(expect.arrayContaining([
        'CREATE_USER',
        'CREATE_HERB',
        'IMPORT_HERBS_CSV',
        'CREATE_PLAN',
        'CREATE_BATCH',
        'APPLY_PLAN_TO_BATCH',
        'UPDATE_BATCH',
        'CREATE_TASK',
        'CREATE_MEASUREMENT',
        'RESOLVE_ALERT',
        'IGNORE_ALERT',
        'GENERATE_REPORT',
        'EXPORT_REPORT',
        'SET_AUTOMATION_MODE',
      ]));
      expect(auditLogs.length).toBeGreaterThanOrEqual(actions.length);
    });
  });
});
