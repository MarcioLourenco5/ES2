/**
 * Testes de Unidade — tasks.controller.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência (PE)
 * Unidades testadas: create, update, getById, remove
 *
 * Classes de Equivalência — create:
 *   CE-TC1 (V) — batchId + type + scheduledDate válidos → 201
 *   CE-TC2 (I) — campos obrigatórios ausentes           → 400
 *   CE-TC3 (I) — type inválido / inexistente            → 400
 *
 * Classes de Equivalência — update:
 *   CE-TU1 (V) — status válido                  → 200
 *   CE-TU2 (I) — status inválido / inexistente  → 400
 *   CE-TU3 (I) — id inexistente                 → 404
 *
 * Classes de Equivalência — getById:
 *   CE-TG1 (V) — id existente   → 200
 *   CE-TG2 (I) — id inexistente → 404
 *
 * Classes de Equivalência — remove:
 *   CE-TR1 (V) — id existente   → 204
 *   CE-TR2 (I) — id inexistente → 404
 */

const { getAll, getById, create, update, remove } = require('../../src/controllers/tasks.controller');
const { tasks } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  tasks.length = 0;
  tasks.push({ id: 1, batchId: 1, type: 'rega', status: 'pendente', scheduledDate: '2025-02-01', assignedTo: 3 });
});

// ─────────────────────────────────────────────────────────────────────────────
// getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getById', () => {
  test('TU-TA-001 | CE-TG1 | id existente → 200', () => {
    const res = mockRes();
    getById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-TA-002 | CE-TG2 | id inexistente → 404', () => {
    const res = mockRes();
    getById({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — create', () => {
  test('TU-TA-003 | CE-TC1 | batchId + type + scheduledDate válidos → 201', () => {
    const req = { body: { batchId: 1, type: 'colheita', scheduledDate: '2025-03-01', assignedTo: 2 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.type).toBe('colheita');
    expect(body.status).toBe('pendente');
  });

  test('TU-TA-004 | CE-TC2 | scheduledDate ausente (FFT) → 400', () => {
    const req = { body: { batchId: 1, type: 'rega' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-TA-005 | CE-TC2 | body vazio (TTT) → 400', () => {
    const req = { body: {} };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-TA-014 | CE-TC2 | batchId ausente (TFF) → 400 "campos obrigatórios"', () => {
    const req = { body: { type: 'rega', scheduledDate: '2025-03-01' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/obrigatórios/i);
  });

  test('TU-TA-015 | CE-TC2 | type ausente (FTF) → 400 "campos obrigatórios"', () => {
    const req = { body: { batchId: 1, scheduledDate: '2025-03-01' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/obrigatórios/i);
  });

  test('TU-TA-006 | CE-TC3 | type inválido ("tipo inexistente") → 400 com mensagem de erro', () => {
    const req = { body: { batchId: 1, type: 'tipo_inexistente', scheduledDate: '2025-03-01' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/type inválido/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// update
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — update', () => {
  test('TU-TA-007 | CE-TU1 | status válido ("concluída") → 200', () => {
    const req = { params: { id: 1 }, body: { status: 'concluída' } };
    const res = mockRes();
    update(req, res);
    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.status).toBe('concluída');
  });

  test('TU-TA-008 | CE-TU2 | status inválido ("tipo inexistente") → 400 com mensagem de erro', () => {
    const req = { params: { id: 1 }, body: { status: 'status_inexistente' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/status inválido/i);
  });

  test('TU-TA-009 | CE-TU3 | id inexistente → 404', () => {
    const req = { params: { id: 999 }, body: { status: 'concluída' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// remove
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — remove', () => {
  test('TU-TA-010 | CE-TR1 | id existente → 204', () => {
    const res = mockRes();
    remove({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('TU-TA-011 | CE-TR2 | id inexistente → 404', () => {
    const res = mockRes();
    remove({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MC — Múltipla Condição
// create: campos ausentes verificado antes de validar type
// update: id inexistente verificado antes de validar status
// ─────────────────────────────────────────────────────────────────────────────
describe('MC — Múltipla Condição', () => {
  test('TU-TA-012 | MC-T1 | create: type inválido + scheduledDate ausente → 400 "campos obrigatórios" (campos verificados antes do enum)', () => {
    // scheduledDate ausente → !scheduledDate=true → short-circuit antes do check de type enum
    const req = { body: { batchId: 1, type: 'tipo_inexistente' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/obrigatórios/i);
    expect(body.error).not.toMatch(/type inválido/i);
  });

  test('TU-TA-013 | MC-T2 | update: status inválido + id inexistente → 404 (id verificado antes do status)', () => {
    // findIndex devolve -1 → 404 antes de validar status
    const req = { params: { id: 999 }, body: { status: 'status_inexistente' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ── Tabela de verdade completa: !batchId || !type || !scheduledDate ──────────
  test('TU-TA-016 | MC-T3 | type + scheduledDate ausentes (FTT) → 400', () => {
    const req = { body: { batchId: 1 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });

  test('TU-TA-017 | MC-T4 | batchId + scheduledDate ausentes (TFT) → 400', () => {
    const req = { body: { type: 'rega' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });

  test('TU-TA-018 | MC-T5 | batchId + type ausentes (TTF) → 400', () => {
    const req = { body: { scheduledDate: '2025-03-01' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll', () => {
  test('TU-TA-019 | GET /tasks → devolve lista de tarefas', () => {
    const res = mockRes();
    getAll({}, res);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ type: 'rega' })]));
  });
});
