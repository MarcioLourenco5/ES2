/**
 * Testes de Unidade — audit.controller.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência (PE)
 * Unidades testadas: getAll, getById, addLog
 *
 * Classes de Equivalência — getById:
 *   CE-AG1 (V) — id existente   → 200
 *   CE-AG2 (I) — id inexistente → 404
 *
 * Classes de Equivalência — addLog:
 *   CE-AL1 (V) — userId, action, resource, details → registo guardado
 *   CE-AL2 (V) — details omitido → defaults a {}
 */

const auditController = require('../../src/controllers/audit.controller');
const { auditLogs } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  auditLogs.length = 0;
  auditLogs.push({ id: 1, userId: 1, action: 'login', resource: 'POST /auth/login', timestamp: '2025-01-01T08:00:00Z', details: {} });
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll', () => {
  test('TU-AD-007 | GET /audit → devolve lista de logs de auditoria', () => {
    const res = mockRes();
    auditController.getAll({ params: {}, body: {} }, res);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ action: 'login' })]));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getById', () => {
  test('TU-AD-008 | CE-AG1 | id existente → devolve registo com resource', () => {
    const res = mockRes();
    auditController.getById({ params: { id: 1 }, body: {} }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1, resource: 'POST /auth/login' }));
  });

  test('TU-AD-009 | CE-AG2 | id inexistente → 404', () => {
    const res = mockRes();
    auditController.getById({ params: { id: 999 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// addLog
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — addLog', () => {
  test('TU-AD-010 | CE-AL1 | regista userId, ação, recurso, details e timestamp', () => {
    auditController.addLog(2, 'create', 'POST /plans', { planId: 10 });
    const last = auditLogs.at(-1);
    expect(last).toEqual(expect.objectContaining({ userId: 2, action: 'create', resource: 'POST /plans', details: { planId: 10 } }));
    expect(last.timestamp).toBeDefined();
  });

  test('TU-AD-011 | CE-AL2 | details omitido → defaults a {}', () => {
    auditController.addLog(3, 'update', 'PATCH /tasks/1');
    expect(auditLogs.at(-1)).toEqual(expect.objectContaining({ userId: 3, action: 'update', resource: 'PATCH /tasks/1', details: {} }));
  });
});
