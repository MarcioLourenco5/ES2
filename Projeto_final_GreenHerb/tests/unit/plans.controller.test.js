/**
 * Testes de Unidade — plans.controller.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência (PE)
 * Unidades testadas: getAll, getById, create, update, remove
 *
 * Classes de Equivalência — create:
 *   CE-PC1 (V) — herbId + type válido + name → 201
 *   CE-PC2 (I) — type inválido               → 400 PLAN_TYPE_INVALID
 *
 * Classes de Equivalência — update:
 *   CE-PU1 (V) — id existente, id preservado → 200
 *   CE-PU2 (I) — type inválido               → 400
 *   CE-PU3 (I) — id inexistente              → 404
 */

const plansController = require('../../src/controllers/plans.controller');
const { plans } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return { params: {}, body: {}, user: { id: 2 }, ...overrides };
}

beforeEach(() => {
  plans.length = 0;
  plans.push(
    {
      id: 1, herbId: 1, type: 'regular', name: 'Plano Regular',
      temperature: { min: 18, max: 28 }, humidity: { min: 40, max: 80 },
      luminosity: { min: 5000, max: 25000 }, cycleDays: 90,
      status: 'ativo', createdBy: 2, authorizedBy: null, createdAt: '2025-01-01',
    },
    {
      id: 2, herbId: 1, type: 'pontual', name: 'Plano Pontual Sem Autorização',
      temperature: { min: 18, max: 28 }, humidity: { min: 40, max: 80 },
      luminosity: { min: 5000, max: 25000 }, cycleDays: 30,
      status: 'ativo', createdBy: 2, authorizedBy: null, createdAt: '2025-01-01',
    },
    {
      id: 3, herbId: 1, type: 'pontual', name: 'Plano Pontual Autorizado',
      temperature: { min: 18, max: 28 }, humidity: { min: 40, max: 80 },
      luminosity: { min: 5000, max: 25000 }, cycleDays: 30,
      status: 'ativo', createdBy: 2, authorizedBy: 2, createdAt: '2025-01-01',
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll', () => {
  test('TU-PC-001 | GET /plans → devolve lista de planos', () => {
    const res = mockRes();
    plansController.getAll(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getById', () => {
  test('TU-PC-002 | id existente → devolve plano', () => {
    const res = mockRes();
    plansController.getById(mockReq({ params: { id: 1 } }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Plano Regular' }));
  });

  test('TU-PC-003 | id inexistente → 404', () => {
    const res = mockRes();
    plansController.getById(mockReq({ params: { id: 999 } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — create', () => {
  test('TU-PC-004 | CE-PC2 | type inválido → 400 PLAN_TYPE_INVALID', () => {
    const res = mockRes();
    plansController.create(mockReq({ body: { herbId: 1, type: 'inexistente', name: 'X', temperature: { min: 18, max: 28 }, humidity: { min: 40, max: 80 }, luminosity: { min: 5000, max: 25000 }, cycleDays: 90 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'PLAN_TYPE_INVALID' }));
  });

  test('TU-PC-005 | CE-PC1 | campos válidos → 201, status ativo e createdBy do utilizador', () => {
    const res = mockRes();
    plansController.create(mockReq({ body: { herbId: 1, type: 'regular', name: 'Plano Novo', temperature: { min: 18, max: 28 }, humidity: { min: 40, max: 80 }, luminosity: { min: 5000, max: 25000 }, cycleDays: 90 }, user: { id: 2 } }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Plano Novo', status: 'ativo', createdBy: 2 }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// update
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — update', () => {
  test('TU-PC-006 | CE-PU3 | id inexistente → 404', () => {
    const res = mockRes();
    plansController.update(mockReq({ params: { id: 999 }, body: { name: 'x' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-PC-007 | CE-PU2 | type inválido → 400', () => {
    const res = mockRes();
    plansController.update(mockReq({ params: { id: 1 }, body: { type: 'semanal' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-PC-008 | CE-PU1 | body com id fraudulento → 200 e id original preservado', () => {
    const res = mockRes();
    plansController.update(mockReq({ params: { id: 1 }, body: { id: 99, name: 'Atualizado' } }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Atualizado' }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// remove
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — remove', () => {
  test('TU-PC-009 | id inexistente → 404', () => {
    const res = mockRes();
    plansController.remove(mockReq({ params: { id: 999 } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-PC-010 | id existente → 204 e plano removido da lista', () => {
    const res = mockRes();
    plansController.remove(mockReq({ params: { id: 3 } }), res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(plans.find(p => p.id === 3)).toBeUndefined();
  });
});

describe('White-box — create — plano pontual com validação completa via controller', () => {
  test('TU-PC-011 | plano pontual válido com authorizedBy e parâmetros completos → 201 e persistência', () => {
    const initialLength = plans.length;
    const res = mockRes();

    plansController.create(mockReq({
      body: {
        herbId: 1,
        type: 'pontual',
        name: 'Plano Pontual Controller',
        temperature: { min: 20, max: 26 },
        humidity: { min: 45, max: 75 },
        luminosity: { min: 8000, max: 22000 },
        cycleDays: 120,
        authorizedBy: 2,
      },
      user: { id: 2 },
    }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(plans.length).toBe(initialLength + 1);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      type: 'pontual',
      authorizedBy: 2,
      status: 'ativo',
      createdBy: 2,
    }));
  });

  test('TU-PC-012 | plano pontual com authorizedBy válido mas parâmetro inválido → 400 e não persiste', () => {
    const initialLength = plans.length;
    const res = mockRes();

    plansController.create(mockReq({
      body: {
        herbId: 1,
        type: 'pontual',
        name: 'Plano Pontual Inválido',
        temperature: { min: 20, max: 26 },
        humidity: { min: 70, max: 50 },
        luminosity: { min: 8000, max: 22000 },
        cycleDays: 120,
        authorizedBy: 2,
      },
      user: { id: 2 },
    }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'PLAN_HUMIDITY_RANGE_INVALID' }));
    expect(plans.length).toBe(initialLength);
  });
});

