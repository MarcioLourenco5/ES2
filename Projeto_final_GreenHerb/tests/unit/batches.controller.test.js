/**
 * Testes de Unidade — batches.controller.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnicas: Particionamento de Equivalência (PE) + Análise de Valores Limite (BVA)
 * Unidades testadas: create, update, getById, remove, applyPlan, registerLoss, calculateProductivity
 *
 * Classes de Equivalência — create:
 *   CE-BC1 (V) — planId + herbId + quantity presentes, plano existe → 201
 *   CE-BC2 (I) — campos obrigatórios ausentes                       → 400
 *   CE-BC3 (I) — planId de plano inexistente                        → 404
 *
 * Classes de Equivalência — update:
 *   CE-BU1 (V) — status válido                  → 200
 *   CE-BU2 (I) — status inválido / inexistente  → 400
 *   CE-BU3 (I) — id inexistente                 → 404
 *
 * Classes de Equivalência — applyPlan:
 *   CE-AP1 (V) — planId de plano regular        → 200
 *   CE-AP2 (I) — planId ausente                 → 400
 *   CE-AP3 (I) — plano inexistente              → 404
 *   CE-AP4 (I) — plano pontual sem authorizedBy → 403
 *
 * BVA — registerLoss (losses ≥ 0):
 *   BVA-RL1: losses = -1 → rejeitado (abaixo do mínimo)
 *   BVA-RL2: losses = 0  → aceite   (limite inferior)
 *   BVA-RL3: losses = 50 → aceite   (valor nominal)
 *   BVA-RL4: losses ausente → 400
 *
 * Classes de Equivalência — calculateProductivity:
 *   CE-CP1 (V) — lote concluído (endDate presente)  → 200
 *   CE-CP2 (I) — lote não concluído (endDate null)  → 422
 *   CE-CP3 (I) — id inexistente                     → 404
 */

const { getAll, getById, create, update, remove, applyPlan, registerLoss, splitBatch, calculateProductivity } =
  require('../../src/controllers/batches.controller');
const { batches, plans } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  return res;
}

const PLAN_REGULAR  = { id: 1, type: 'regular',  name: 'P. Regular',  authorizedBy: 2 };
const PLAN_PONTUAL  = { id: 2, type: 'pontual',  name: 'P. Pontual',  authorizedBy: null };
const BASE_BATCH    = { id: 1, planId: 1, herbId: 1, status: 'ativo', quantity: 100, losses: 0, endDate: null };

beforeEach(() => {
  batches.length = 0;
  plans.length   = 0;
  plans.push({ ...PLAN_REGULAR }, { ...PLAN_PONTUAL });
  batches.push({ ...BASE_BATCH });
});

// ─────────────────────────────────────────────────────────────────────────────
// getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getById', () => {
  test('TU-BA-001 | id existente → 200', () => {
    const res = mockRes();
    getById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-BA-002 | id inexistente → 404', () => {
    const res = mockRes();
    getById({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — create', () => {
  test('TU-BA-003 | CE-BC1 | planId + herbId + quantity válidos, plano existe → 201', () => {
    const req = { body: { planId: 1, herbId: 1, quantity: 50 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.planId).toBe(1);
    expect(body.quantity).toBe(50);
  });

  test('TU-BA-004 | CE-BC2 | campos obrigatórios ausentes (sem quantity) → 400', () => {
    const req = { body: { planId: 1, herbId: 1 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-BA-005 | CE-BC3 | planId de plano inexistente → 404', () => {
    const req = { body: { planId: 999, herbId: 1, quantity: 50 }, user: { id: 3 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// update
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — update', () => {
  test('TU-BA-006 | CE-BU1 | status válido ("concluído") → 200', () => {
    const req = { params: { id: 1 }, body: { status: 'concluído', endDate: '2025-04-01' } };
    const res = mockRes();
    update(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-BA-007 | CE-BU2 | status inválido ("tipo inexistente") → 400 com mensagem de erro', () => {
    const req = { params: { id: 1 }, body: { status: 'status_inexistente' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/status inválido/i);
  });

  test('TU-BA-008 | CE-BU3 | id inexistente → 404', () => {
    const req = { params: { id: 999 }, body: { status: 'concluído' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Transições de estado — política defensiva da equipa (enunciado §10)
// Tabela:  ativo→concluído ✅  ativo→comprometido ✅
//          terminal→outro ❌   no-op (mesmo estado) ✅
// ─────────────────────────────────────────────────────────────────────────────
describe('Transições de estado de lote', () => {
  test('TU-BA-023 | ativo → concluído → 200 (transição permitida)', () => {
    batches[0].status = 'ativo';
    const req = { params: { id: 1 }, body: { status: 'concluído', endDate: '2025-04-01' } };
    const res = mockRes();
    update(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0].status).toBe('concluído');
  });

  test('TU-BA-024 | ativo → comprometido → 200 (transição permitida)', () => {
    batches[0].status = 'ativo';
    const req = { params: { id: 1 }, body: { status: 'comprometido' } };
    const res = mockRes();
    update(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0].status).toBe('comprometido');
  });

  test('TU-BA-025 | concluído → ativo → 400 BATCH_TRANSITION_INVALID', () => {
    batches[0].status = 'concluído';
    const req = { params: { id: 1 }, body: { status: 'ativo' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/BATCH_TRANSITION_INVALID/);
  });

  test('TU-BA-026 | concluído → comprometido → 400 BATCH_TRANSITION_INVALID', () => {
    batches[0].status = 'concluído';
    const req = { params: { id: 1 }, body: { status: 'comprometido' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/BATCH_TRANSITION_INVALID/);
  });

  test('TU-BA-027 | comprometido → ativo → 400 BATCH_TRANSITION_INVALID', () => {
    batches[0].status = 'comprometido';
    const req = { params: { id: 1 }, body: { status: 'ativo' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/BATCH_TRANSITION_INVALID/);
  });

  test('TU-BA-028 | concluído → concluído (no-op) → 200', () => {
    batches[0].status = 'concluído';
    batches[0].endDate = '2025-04-01';
    const req = { params: { id: 1 }, body: { status: 'concluído', endDate: '2025-04-01' } };
    const res = mockRes();
    update(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-BA-029 | update outros campos sem mudar estado terminal → 200', () => {
    batches[0].status = 'concluído';
    batches[0].endDate = '2025-04-01';
    const req = { params: { id: 1 }, body: { status: 'concluído', notes: 'obs final' } };
    const res = mockRes();
    update(req, res);
    expect(res.json).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// remove
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — remove', () => {
  test('TU-BA-009 | id existente → 204', () => {
    const res = mockRes();
    remove({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('TU-BA-010 | id inexistente → 404', () => {
    const res = mockRes();
    remove({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// applyPlan
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — applyPlan', () => {
  test('TU-BA-011 | CE-AP1 | planId de plano regular → 200', () => {
    const req = { params: { id: 1 }, body: { planId: 1 } };
    const res = mockRes();
    applyPlan(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-BA-012 | CE-AP2 | planId ausente → 400', () => {
    const req = { params: { id: 1 }, body: {} };
    const res = mockRes();
    applyPlan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-BA-013 | CE-AP3 | plano inexistente → 404', () => {
    const req = { params: { id: 1 }, body: { planId: 999 } };
    const res = mockRes();
    applyPlan(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-BA-014 | CE-AP4 | plano pontual sem authorizedBy → 403', () => {
    const req = { params: { id: 1 }, body: { planId: 2 } };
    const res = mockRes();
    applyPlan(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// registerLoss — BVA (losses ≥ 0)
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — registerLoss (losses ≥ 0)', () => {
  test('TU-BA-015 | BVA-RL1 | losses = -1 (abaixo do mínimo) → 400', () => {
    const req = { params: { id: 1 }, body: { losses: -1 } };
    const res = mockRes();
    registerLoss(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-BA-016 | BVA-RL2 | losses = 0 (limite inferior) → aceite', () => {
    const req = { params: { id: 1 }, body: { losses: 0 } };
    const res = mockRes();
    registerLoss(req, res);
    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.batch.losses).toBe(0);
  });

  test('TU-BA-017 | BVA-RL3 | losses = 50 (valor nominal) → aceite', () => {
    const req = { params: { id: 1 }, body: { losses: 50 } };
    const res = mockRes();
    registerLoss(req, res);
    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.batch.losses).toBe(50);
  });

  test('TU-BA-018 | BVA-RL4 | losses ausente → 400', () => {
    const req = { params: { id: 1 }, body: {} };
    const res = mockRes();
    registerLoss(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-BA-019 | id inexistente → 404', () => {
    const req = { params: { id: 999 }, body: { losses: 0 } };
    const res = mockRes();
    registerLoss(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateProductivity
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — calculateProductivity', () => {
  test('TU-BA-020 | CE-CP1 | lote com endDate → 200 e productivity calculada', () => {
    batches[0].endDate = '2025-04-01';
    batches[0].quantity = 100;
    batches[0].losses = 20;
    const req = { params: { id: 1 } };
    const res = mockRes();
    calculateProductivity(req, res);
    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.productivity).toBe(80);
  });

  test('TU-BA-021 | CE-CP2 | lote sem endDate (não concluído) → 422', () => {
    batches[0].endDate = null;
    const req = { params: { id: 1 } };
    const res = mockRes();
    calculateProductivity(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  test('TU-BA-022 | CE-CP3 | id inexistente → 404', () => {
    const req = { params: { id: 999 } };
    const res = mockRes();
    calculateProductivity(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll', () => {
  test('TU-BA-030 | GET /batches → devolve lista de lotes', () => {
    const res = mockRes();
    getAll({}, res);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// applyPlan — lote inexistente (complemento CE-AP1..4)
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — applyPlan (lote inexistente)', () => {
  test('TU-BA-031 | lote inexistente → 404 antes de verificar planId', () => {
    const req = { params: { id: 999 }, body: { planId: 1 } };
    const res = mockRes();
    applyPlan(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// registerLoss — BVA ponto adicional
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — registerLoss (ponto adicional)', () => {
  test('TU-BA-032 | losses = 1 (primeiro ponto acima do mínimo) → aceite', () => {
    const req = { params: { id: 1 }, body: { losses: 1 } };
    const res = mockRes();
    registerLoss(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ batch: expect.objectContaining({ losses: 1 }) }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateProductivity — perdas totais
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — calculateProductivity (perdas totais)', () => {
  test('TU-BA-033 | losses = quantity → productivity = 0%', () => {
    batches[0].endDate   = '2025-04-01';
    batches[0].quantity  = 100;
    batches[0].losses    = 100;
    const req = { params: { id: 1 } };
    const res = mockRes();
    calculateProductivity(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ productivity: 0 }));
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// splitBatch — divisão parcial de lote (enunciado §4 e §5.3)
// ─────────────────────────────────────────────────────────────────────────────
describe('PE/BVA — splitBatch', () => {
  test('TU-BA-034 | lote ativo e quantity válida → 201 com lote filho', () => {
    const req = { params: { id: 1 }, body: { quantity: 25 }, user: { id: 2 } };
    const res = mockRes();
    splitBatch(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.originalBatch.quantity).toBe(75);
    expect(body.newBatch).toEqual(expect.objectContaining({ parentBatchId: 1, quantity: 25, status: 'ativo' }));
  });

  test('TU-BA-035 | quantity igual à quantidade disponível → 422', () => {
    const req = { params: { id: 1 }, body: { quantity: 100 }, user: { id: 2 } };
    const res = mockRes();
    splitBatch(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  test('TU-BA-036 | lote concluído não pode ser dividido → 400', () => {
    batches[0].status = 'concluído';
    const req = { params: { id: 1 }, body: { quantity: 10 }, user: { id: 2 } };
    const res = mockRes();
    splitBatch(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-BA-037 | lote inexistente → 404', () => {
    const req = { params: { id: 999 }, body: { quantity: 10 }, user: { id: 2 } };
    const res = mockRes();
    splitBatch(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
