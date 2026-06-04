/**
 * Testes de Unidade — auditService.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência (PE)
 * Unidade testada: log(userId, action, resource, details)
 *
 * Classes de Equivalência:
 *   CE-AD1 (V) — userId + action + resource presentes → entrada criada
 *   CE-AD2 (I) — action ausente/null               → erro
 *   CE-AD3 (I) — resource ausente/null             → erro
 *   CE-AD4 (V) — details omitido                  → default {}
 *   CE-AD5 (V) — userId null (operação sem auth)  → aceite com userId null
 */

const { log } = require('../../src/services/auditService');
const { auditLogs } = require('../../src/data/mockData');

beforeEach(() => {
  auditLogs.length = 0;
});

describe('PE — log()', () => {
  test('TU-AD-001 | CE-AD1 | campos válidos → entrada persistida em auditLogs e devolvida', () => {
    const entry = log(1, 'CREATE_PLAN', 'plans', { planId: 42 });
    expect(entry).toMatchObject({
      userId: 1,
      action: 'CREATE_PLAN',
      resource: 'plans',
      details: { planId: 42 },
    });
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(auditLogs).toContain(entry);
  });

  test('TU-AD-002 | CE-AD4 | details omitido → details = {}', () => {
    const entry = log(1, 'DELETE_BATCH', 'batches');
    expect(entry.details).toEqual({});
    expect(auditLogs).toContain(entry);
  });

  test('TU-AD-003 | CE-AD5 | userId null → entrada criada com userId null', () => {
    const entry = log(null, 'SYSTEM_EVENT', 'system');
    expect(entry.userId).toBeNull();
    expect(auditLogs).toContain(entry);
  });

  test('TU-AD-004 | CE-AD2 | action ausente → lança erro', () => {
    expect(() => log(1, null, 'plans')).toThrow();
  });

  test('TU-AD-005 | CE-AD3 | resource ausente → lança erro', () => {
    expect(() => log(1, 'CREATE_PLAN', null)).toThrow();
  });

  test('TU-AD-006 | múltiplas entradas → ids incrementais e todas persistidas', () => {
    log(1, 'CREATE_PLAN', 'plans');
    log(2, 'CREATE_BATCH', 'batches');
    expect(auditLogs).toHaveLength(2);
    expect(auditLogs[0].id).toBe(1);
    expect(auditLogs[1].id).toBe(2);
  });
});
