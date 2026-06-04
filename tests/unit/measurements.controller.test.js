/**
 * Testes de Unidade — measurements.controller.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnicas: Particionamento de Equivalência (PE) + Análise de Valores Limite (BVA)
 * Unidade testada: create(req, res)
 *
 * Classes de Equivalência — campos obrigatórios:
 *   CE-M1 (V) — batchId + temperature + humidity + luminosity presentes  → 201
 *   CE-M2 (I) — campo obrigatório ausente                                → 400
 *   CE-M3 (I) — batchId não identifica lote existente                    → 404
 *
 * BVA — Temperatura: intervalo plano [18, 28] ºC
 *   desvio ≤ 2 → Informativo    (ex.: temp=29, dev=1)
 *   desvio > 2 e ≤ 5 → Aviso   (ex.: temp=31, dev=3)
 *   desvio > 5 → Crítico        (ex.: temp=34, dev=6)
 *
 * BVA — Humidade: intervalo plano [40, 80] %
 *   desvio ≤ 5 → Informativo    (ex.: hum=85, dev=5)
 *   desvio > 5 e ≤ 10 → Aviso  (ex.: hum=88, dev=8)
 *   desvio > 10 → Crítico       (ex.: hum=95, dev=15)
 *
 * Nota: o controlador também valida luminosity contra o plano, gerando alerta quando está fora dos limites.
 */

const { getAll, getById, create } = require('../../src/controllers/measurements.controller');
const { measurements, alerts, batches, plans } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

const BASE_PLAN = {
  id: 1,
  herbId: 1,
  type: 'regular',
  name: 'Plano Teste',
  temperature: { min: 18, max: 28 },
  humidity:    { min: 40, max: 80 },
  luminosity:  { min: 5000, max: 25000 },
  cycleDays: 90,
  status: 'ativo',
  createdBy: 2,
  authorizedBy: null,
};

const BASE_BATCH = { id: 1, planId: 1, herbId: 1, status: 'ativo', quantity: 100, losses: 0 };

beforeEach(() => {
  measurements.length = 0;
  alerts.length = 0;
  batches.length = 0;
  plans.length = 0;
  batches.push({ ...BASE_BATCH });
  plans.push({
    ...BASE_PLAN,
    temperature: { ...BASE_PLAN.temperature },
    humidity:    { ...BASE_PLAN.humidity },
    luminosity:  { ...BASE_PLAN.luminosity },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PE — campos obrigatórios
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — campos obrigatórios', () => {
  test('TU-ME-001 | CE-M1 | todos os campos presentes (FFFF), dentro dos limites → 201 e alertsGenerated=[]', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data.alertsGenerated).toHaveLength(0);
  });

  test('TU-ME-002 | CE-M2 | humidity ausente (FFTF) → 400', () => {
    const req = { body: { batchId: 1, temperature: 22, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-ME-003 | CE-M2 | luminosity ausente (FFFT) → 400', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 60 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-ME-004 | CE-M2 | batchId ausente (TFFF) → 400', () => {
    const req = { body: { temperature: 22, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-ME-016 | CE-M2 | temperature ausente (FTFF) → 400', () => {
    const req = { body: { batchId: 1, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-ME-005 | CE-M3 | batchId inexistente → 404', () => {
    const req = { body: { batchId: 999, temperature: 35, humidity: 99, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/lote/i) }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BVA — Temperatura: tipos de alerta com base no desvio
// Limites do plano: [18, 28] ºC
// desvio ≤ 2 → Informativo | desvio > 2 e ≤ 5 → Aviso | desvio > 5 → Crítico
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — Temperatura: tipos de alerta [18, 28] ºC', () => {
  test('TU-ME-006 | BVA-T-válido | temp=22 (dentro dos limites) → sem alerta de temperatura', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    expect(alertsGenerated.filter(a => a.message.includes('Temperatura'))).toHaveLength(0);
  });

  test('TU-ME-007 | BVA-T-Informativo | temp=29 (desvio=1, ≤2) → alerta tipo Informativo', () => {
    const req = { body: { batchId: 1, temperature: 29, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const tempAlert = alertsGenerated.find(a => a.message.includes('Temperatura'));
    expect(tempAlert).toBeDefined();
    expect(tempAlert.type).toBe('Informativo');
  });

  test('TU-ME-008 | BVA-T-Aviso | temp=31 (desvio=3, >2 e ≤5) → alerta tipo Aviso', () => {
    const req = { body: { batchId: 1, temperature: 31, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const tempAlert = alertsGenerated.find(a => a.message.includes('Temperatura'));
    expect(tempAlert).toBeDefined();
    expect(tempAlert.type).toBe('Aviso');
  });

  test('TU-ME-009 | BVA-T-Crítico | temp=34 (desvio=6, >5) → alerta tipo Crítico', () => {
    const req = { body: { batchId: 1, temperature: 34, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const tempAlert = alertsGenerated.find(a => a.message.includes('Temperatura'));
    expect(tempAlert).toBeDefined();
    expect(tempAlert.type).toBe('Crítico');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BVA — Humidade: tipos de alerta com base no desvio
// Limites do plano: [40, 80] %
// desvio ≤ 5 → Informativo | desvio > 5 e ≤ 10 → Aviso | desvio > 10 → Crítico
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — Humidade: tipos de alerta [40, 80] %', () => {
  test('TU-ME-010 | BVA-H-válido | hum=60 (dentro dos limites) → sem alerta de humidade', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    expect(alertsGenerated.filter(a => a.message.includes('Humidade'))).toHaveLength(0);
  });

  test('TU-ME-011 | BVA-H-Informativo | hum=85 (desvio=5, ≤5) → alerta tipo Informativo', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 85, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const humAlert = alertsGenerated.find(a => a.message.includes('Humidade'));
    expect(humAlert).toBeDefined();
    expect(humAlert.type).toBe('Informativo');
  });

  test('TU-ME-012 | BVA-H-Aviso | hum=88 (desvio=8, >5 e ≤10) → alerta tipo Aviso', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 88, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const humAlert = alertsGenerated.find(a => a.message.includes('Humidade'));
    expect(humAlert).toBeDefined();
    expect(humAlert.type).toBe('Aviso');
  });

  test('TU-ME-013 | BVA-H-Crítico | hum=95 (desvio=15, >10) → alerta tipo Crítico', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 95, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const humAlert = alertsGenerated.find(a => a.message.includes('Humidade'));
    expect(humAlert).toBeDefined();
    expect(humAlert.type).toBe('Crítico');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BVA — Luminosidade: tipos de alerta com base no desvio
// Limites do plano: [5000, 25000] lux
// desvio ≤ 500 → Informativo | desvio > 500 e ≤ 2000 → Aviso | desvio > 2000 → Crítico
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — Luminosidade: tipos de alerta [5000, 25000] lux', () => {
  test('TU-ME-017 | BVA-L-válido | lum=15000 (dentro dos limites) → sem alerta de luminosidade', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    expect(alertsGenerated.filter(a => a.message.includes('Luminosidade'))).toHaveLength(0);
  });

  test('TU-ME-018 | BVA-L-Informativo | lum=25300 (desvio=300, ≤500) → alerta tipo Informativo', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 60, luminosity: 25300 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const lumAlert = alertsGenerated.find(a => a.message.includes('Luminosidade'));
    expect(lumAlert).toBeDefined();
    expect(lumAlert.type).toBe('Informativo');
  });

  test('TU-ME-019 | BVA-L-Aviso | lum=26000 (desvio=1000, >500 e ≤2000) → alerta tipo Aviso', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 60, luminosity: 26000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const lumAlert = alertsGenerated.find(a => a.message.includes('Luminosidade'));
    expect(lumAlert).toBeDefined();
    expect(lumAlert.type).toBe('Aviso');
  });

  test('TU-ME-020 | BVA-L-Crítico | lum=28000 (desvio=3000, >2000) → alerta tipo Crítico', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 60, luminosity: 28000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const lumAlert = alertsGenerated.find(a => a.message.includes('Luminosidade'));
    expect(lumAlert).toBeDefined();
    expect(lumAlert.type).toBe('Crítico');
  });

  test('TU-ME-021 | BVA-L-abaixo | lum=4700 (desvio=300, abaixo mínimo) → alerta tipo Informativo', () => {
    const req = { body: { batchId: 1, temperature: 22, humidity: 60, luminosity: 4700 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const { alertsGenerated } = res.json.mock.calls[0][0];
    const lumAlert = alertsGenerated.find(a => a.message.includes('Luminosidade'));
    expect(lumAlert).toBeDefined();
    expect(lumAlert.type).toBe('Informativo');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MC — Múltipla Condição
// Validação: if (!batchId || temperature===undefined || humidity===undefined || luminosity===undefined)
// Qualquer combinação de campos ausentes → mesmo erro 400
// ─────────────────────────────────────────────────────────────────────────────
describe('MC — Múltipla Condição (create)', () => {
  test('TU-ME-014 | MC-M1 | temperature + humidity ambos ausentes → 400 (qualquer campo ausente dispara o mesmo erro)', () => {
    const req = { body: { batchId: 1, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-ME-015 | MC-M2 | batchId ausente + temperatura fora dos limites → 400 (campos ausentes verificado antes de gerar alertas)', () => {
    // mesmo que temperatura seria Crítico, a validação de campos ausentes ocorre primeiro
    const req = { body: { temperature: 34, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(alerts).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll / getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll / getById', () => {
  beforeEach(() => {
    measurements.push({ id: 1, batchId: 1, temperature: 22, humidity: 65, luminosity: 15000, timestamp: '2025-01-01T10:00:00Z' });
  });

  test('TU-ME-022 | GET /measurements → devolve lista de medições', () => {
    const res = mockRes();
    getAll({}, res);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
  });

  test('TU-ME-023 | GET /measurements/:id existente → devolve medição', () => {
    const res = mockRes();
    getById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ temperature: 22 }));
  });

  test('TU-ME-024 | GET /measurements/:id inexistente → 404', () => {
    const res = mockRes();
    getById({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BVA — limites exatos de classificação (complemento)
// Plan fixture: temp [18,28], humidity [40,80], luminosity [5000,25000]
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — Limites exatos de classificação de alertas', () => {
  test('TU-ME-025 | BVA-T-limite-Informativo | temp=30 (desvio=2, limite superior Informativo) → Informativo', () => {
    const req = { body: { batchId: 1, temperature: 30, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(alerts.at(-1)).toEqual(expect.objectContaining({ type: 'Informativo' }));
  });

  test('TU-ME-026 | BVA-T-limite-Aviso | temp=33 (desvio=5, limite superior Aviso) → Aviso', () => {
    const req = { body: { batchId: 1, temperature: 33, humidity: 60, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(alerts.at(-1)).toEqual(expect.objectContaining({ type: 'Aviso' }));
  });

  test('TU-ME-027 | BVA-H-limite-Aviso | hum=90 (desvio=10, limite superior Aviso) → Aviso', () => {
    const req = { body: { batchId: 1, temperature: 23, humidity: 90, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(alerts.at(-1)).toEqual(expect.objectContaining({ type: 'Aviso' }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Multiple Condition — complemento
// ─────────────────────────────────────────────────────────────────────────────
describe('MC — Condições simultâneas de alerta', () => {
  test('TU-ME-028 | temperature + humidity ambos fora dos limites → gera 2 alertas Crítico', () => {
    const req = { body: { batchId: 1, temperature: 34, humidity: 91, luminosity: 15000 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    const payload = res.json.mock.calls[0][0];
    expect(payload.alertsGenerated).toHaveLength(2);
    expect(payload.alertsGenerated).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'Crítico', message: expect.stringContaining('Temperatura') }),
      expect.objectContaining({ type: 'Crítico', message: expect.stringContaining('Humidade') }),
    ]));
  });

  test('TU-ME-029 | batchId existe mas planId do lote não existe → 422', () => {
    batches[0].planId = 999;
    const req = { body: { batchId: 1, temperature: 100, humidity: 1, luminosity: 1 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/plano/i) }));
  });
});
