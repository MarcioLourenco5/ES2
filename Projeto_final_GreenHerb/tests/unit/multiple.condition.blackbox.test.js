// Testes Multiple Condition com tabela de decisão reduzida.
// Objetivo: cobrir casos nominais, inválidos relevantes e limites sem explosão combinatória.

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn((value) => `hash:${value}`),
  compareSync: jest.fn((plain, hash) => hash === `hash:${plain}`),
}), { virtual: true });

const batchesController = require('../../src/controllers/batches.controller');
const measurementsController = require('../../src/controllers/measurements.controller');
const alertsController = require('../../src/controllers/alerts.controller');
const { batches, plans, measurements, alerts } = require('../../src/data/mockData');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

function seedPlansAndBatches() {
  plans.length = 0;
  plans.push(
    {
      id: 1,
      herbId: 1,
      type: 'regular',
      name: 'Plano Regular Manjericão',
      temperature: { min: 18, max: 28 },
      humidity: { min: 40, max: 80 },
      luminosity: { min: 5000, max: 25000 },
      cycleDays: 90,
      status: 'ativo',
      createdBy: 2,
      authorizedBy: null,
      createdAt: '2025-01-01',
    },
    {
      id: 2,
      herbId: 1,
      type: 'pontual',
      name: 'Plano Pontual Sem Autorização',
      temperature: { min: 18, max: 28 },
      humidity: { min: 40, max: 80 },
      luminosity: { min: 5000, max: 25000 },
      cycleDays: 10,
      status: 'ativo',
      createdBy: 2,
      authorizedBy: null,
      createdAt: '2025-01-01',
    },
    {
      id: 3,
      herbId: 1,
      type: 'pontual',
      name: 'Plano Pontual Autorizado',
      temperature: { min: 18, max: 28 },
      humidity: { min: 40, max: 80 },
      luminosity: { min: 5000, max: 25000 },
      cycleDays: 10,
      status: 'ativo',
      createdBy: 2,
      authorizedBy: 2,
      createdAt: '2025-01-01',
    }
  );

  batches.length = 0;
  batches.push({
    id: 1,
    planId: 1,
    herbId: 1,
    status: 'ativo',
    quantity: 100,
    losses: 0,
    productivity: null,
    startDate: '2025-01-01',
    endDate: null,
    createdBy: 3,
  });
}

function seedAlerts(status = 'pendente') {
  alerts.length = 0;
  alerts.push({
    id: 1,
    batchId: 1,
    measurementId: null,
    type: 'Informativo',
    message: 'Temperatura ligeiramente elevada',
    status,
    resolution: status === 'pendente' ? null : 'Resolvido',
    justification: status === 'pendente' ? null : 'Já tratado anteriormente',
    resolvedAt: status === 'pendente' ? null : '2025-01-02T10:00:00Z',
    resolvedBy: status === 'pendente' ? null : 2,
  });
}

describe('Multiple Condition Black-Box — batchesController.applyPlan', () => {
  beforeEach(seedPlansAndBatches);

  test('TU-BA-MC-001 | nominal regular: lote existe, planId enviado, plano regular existe → aplica plano', () => {
    const req = { params: { id: 1 }, body: { planId: 1 }, user: { id: 2 } };
    const res = mockResponse();

    batchesController.applyPlan(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Plano aplicado ao lote',
      batch: expect.objectContaining({ id: 1, planId: 1 }),
    }));
  });

  test('TU-BA-MC-002 | nominal pontual: lote existe, plano pontual autorizado existe → aplica plano', () => {
    const req = { params: { id: 1 }, body: { planId: 3 }, user: { id: 2 } };
    const res = mockResponse();

    batchesController.applyPlan(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      batch: expect.objectContaining({ id: 1, planId: 3 }),
    }));
  });

  test('TU-BA-MC-003 | inválido: lote inexistente mascara restantes condições → 404', () => {
    const req = { params: { id: 999 }, body: { planId: 1 }, user: { id: 2 } };
    const res = mockResponse();

    batchesController.applyPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-BA-MC-004 | inválido: lote existe mas planId não é enviado → 400', () => {
    const req = { params: { id: 1 }, body: {}, user: { id: 2 } };
    const res = mockResponse();

    batchesController.applyPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-BA-MC-005 | inválido: lote existe e planId foi enviado, mas plano não existe → 404', () => {
    const req = { params: { id: 1 }, body: { planId: 999 }, user: { id: 2 } };
    const res = mockResponse();

    batchesController.applyPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-BA-MC-006 | inválido de regra: plano pontual sem autorização → 403', () => {
    const req = { params: { id: 1 }, body: { planId: 2 }, user: { id: 2 } };
    const res = mockResponse();

    batchesController.applyPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('Multiple Condition + BVA Black-Box — measurementsController.create', () => {
  beforeEach(() => {
    seedPlansAndBatches();
    measurements.length = 0;
    alerts.length = 0;
  });

  function createMeasurement(body) {
    const req = { body, user: { id: 3 } };
    const res = mockResponse();
    measurementsController.create(req, res);
    return res;
  }

  test('TU-ME-MC-001 | inválido: body incompleto mascara lote/plano/limites → 400', () => {
    const res = createMeasurement({ batchId: 1, temperature: 22, humidity: 65 });

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-ME-MC-002 | nominal: batch e plano existem, temperatura e humidade dentro dos limites → sem alertas', () => {
    const res = createMeasurement({ batchId: 1, temperature: 22, humidity: 65, luminosity: 15000 });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ alertsGenerated: [] }));
  });

  test.each([
    ['TU-ME-MC-003', 'mínimo de temperatura', 18, 65],
    ['TU-ME-MC-004', 'máximo de temperatura', 28, 65],
    ['TU-ME-MC-005', 'mínimo de humidade', 22, 40],
    ['TU-ME-MC-006', 'máximo de humidade', 22, 80],
  ])('%s | BVA válido: valor exatamente no %s → sem alerta', (_id, _label, temperature, humidity) => {
    const res = createMeasurement({ batchId: 1, temperature, humidity, luminosity: 15000 });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ alertsGenerated: [] }));
  });

  test.each([
    ['TU-ME-MC-007', 'temperatura abaixo do mínimo', 17, 65, 'Temperatura'],
    ['TU-ME-MC-008', 'temperatura acima do máximo', 29, 65, 'Temperatura'],
    ['TU-ME-MC-009', 'humidade abaixo do mínimo', 22, 39, 'Humidade'],
    ['TU-ME-MC-010', 'humidade acima do máximo', 22, 81, 'Humidade'],
  ])('%s | BVA inválido: %s → gera alerta específico', (_id, _label, temperature, humidity, expectedMessage) => {
    const res = createMeasurement({ batchId: 1, temperature, humidity, luminosity: 15000 });

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.alertsGenerated).toHaveLength(1);
    expect(payload.alertsGenerated[0].message).toContain(expectedMessage);
  });

  test('TU-ME-MC-011 | condição múltipla crítica: temperatura e humidade fora dos limites → gera dois alertas', () => {
    const res = createMeasurement({ batchId: 1, temperature: 34, humidity: 91, luminosity: 15000 });

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.alertsGenerated).toHaveLength(2);
    expect(payload.alertsGenerated).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'Crítico', message: expect.stringContaining('Temperatura') }),
      expect.objectContaining({ type: 'Crítico', message: expect.stringContaining('Humidade') }),
    ]));
  });

  test('TU-ME-MC-012 | inválido contextual: batch inexistente → 404', () => {
    const res = createMeasurement({ batchId: 999, temperature: 34, humidity: 91, luminosity: 15000 });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/lote/i) }));
  });

  test('TU-ME-MC-013 | inválido contextual: batch existe mas plano associado não existe → 422', () => {
    batches[0].planId = 999;

    const res = createMeasurement({ batchId: 1, temperature: 34, humidity: 91, luminosity: 15000 });

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/plano/i) }));
  });
});

describe('Multiple Condition Black-Box — alertsController.resolve', () => {
  beforeEach(() => seedAlerts('pendente'));

  test('TU-AL-MC-001 | nominal: alerta existe e está pendente → resolve alerta', () => {
    const req = { params: { id: 1 }, body: { justification: 'Condição corrigida.' }, user: { id: 2 } };
    const res = mockResponse();

    alertsController.resolve(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      status: 'resolvido',
      resolution: 'Resolvido',
      resolvedBy: 2,
    }));
  });

  test('TU-AL-MC-002 | inválido: alerta inexistente mascara estado e justificação → 404', () => {
    const req = { params: { id: 999 }, body: { justification: 'Condição corrigida.' }, user: { id: 2 } };
    const res = mockResponse();

    alertsController.resolve(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-AL-MC-003 | inválido: alerta existe mas já foi processado → 422', () => {
    seedAlerts('resolvido');
    const req = { params: { id: 1 }, body: { justification: 'Nova tentativa.' }, user: { id: 2 } };
    const res = mockResponse();

    alertsController.resolve(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });
});

describe('Multiple Condition + BVA Black-Box — alertsController.ignore', () => {
  beforeEach(() => seedAlerts('pendente'));

  test('TU-AL-MC-004 | nominal no limite inferior: alerta pendente e justificação com 10 caracteres → ignora alerta', () => {
    const req = { params: { id: 1 }, body: { justification: 'a'.repeat(10) }, user: { id: 2 } };
    const res = mockResponse();

    alertsController.ignore(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      status: 'ignorado',
      resolution: 'Ignorado',
      justification: 'a'.repeat(10),
      resolvedBy: 2,
    }));
  });

  test('TU-AL-MC-005 | nominal no limite superior: alerta pendente e justificação com 500 caracteres → ignora alerta', () => {
    const justification = 'b'.repeat(500);
    const req = { params: { id: 1 }, body: { justification }, user: { id: 2 } };
    const res = mockResponse();

    alertsController.ignore(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      status: 'ignorado',
      justification,
    }));
  });

  test('TU-AL-MC-006 | inválido: alerta inexistente mascara estado e justificação → 404', () => {
    const req = { params: { id: 999 }, body: { justification: 'Justificação válida.' }, user: { id: 2 } };
    const res = mockResponse();

    alertsController.ignore(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-AL-MC-007 | inválido: alerta existe mas já foi processado → 422', () => {
    seedAlerts('resolvido');
    const req = { params: { id: 1 }, body: { justification: 'Justificação válida.' }, user: { id: 2 } };
    const res = mockResponse();

    alertsController.ignore(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  test.each([
    ['TU-AL-MC-008', 'ausente', {}],
    ['TU-AL-MC-009', 'não textual', { justification: 12345 }],
    ['TU-AL-MC-010', 'abaixo do limite inferior', { justification: 'a'.repeat(9) }],
    ['TU-AL-MC-011', 'acima do limite superior', { justification: 'a'.repeat(501) }],
  ])('%s | inválido: alerta pendente mas justificação %s → 422', (_id, _label, body) => {
    const req = { params: { id: 1 }, body, user: { id: 2 } };
    const res = mockResponse();

    alertsController.ignore(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });
});
