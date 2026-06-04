const { getAll, getById, resolve, ignore } = require('../../src/controllers/alerts.controller');
const { alerts } = require('../../src/data/mockData');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('BVA — Justificação para ignorar alerta [10, 500]', () => {
  beforeEach(() => {
    alerts.length = 0;
    alerts.push({
      id: 1,
      batchId: 1,
      measurementId: null,
      type: 'Informativo',
      message: 'Teste',
      status: 'pendente',
      resolution: null,
      justification: null,
      resolvedAt: null,
      resolvedBy: null,
    });
  });

  test('TU-AL-001 | justification = 9 chars → rejeitado', () => {
    const req = {
      params: { id: 1 },
      body: { justification: 'a'.repeat(9) },
      user: { id: 2 },
    };
    const res = mockResponse();

    ignore(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  test('TU-AL-002 | justification = 10 chars → aceite', () => {
    const req = {
      params: { id: 1 },
      body: { justification: 'a'.repeat(10) },
      user: { id: 2 },
    };
    const res = mockResponse();

    ignore(req, res);

    expect(res.json).toHaveBeenCalled();
    expect(alerts[0].status).toBe('ignorado');
  });

  test('TU-AL-003 | justification = 250 chars → aceite', () => {
    const req = {
      params: { id: 1 },
      body: { justification: 'a'.repeat(250) },
      user: { id: 2 },
    };
    const res = mockResponse();

    ignore(req, res);

    expect(res.json).toHaveBeenCalled();
    expect(alerts[0].status).toBe('ignorado');
  });

  test('TU-AL-004 | justification = 500 chars → aceite', () => {
    const req = {
      params: { id: 1 },
      body: { justification: 'a'.repeat(500) },
      user: { id: 2 },
    };
    const res = mockResponse();

    ignore(req, res);

    expect(res.json).toHaveBeenCalled();
    expect(alerts[0].status).toBe('ignorado');
  });

  test('TU-AL-005 | justification = 501 chars → rejeitado', () => {
    const req = {
      params: { id: 1 },
      body: { justification: 'a'.repeat(501) },
      user: { id: 2 },
    };
    const res = mockResponse();

    ignore(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll / getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll / getById', () => {
  test('TU-AL-006 | GET /alerts → devolve lista de alertas', () => {
    const res = mockResponse();
    getAll({}, res);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ status: 'pendente' })]));
  });

  test('TU-AL-007 | GET /alerts/:id existente → devolve alerta', () => {
    const res = mockResponse();
    getById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test('TU-AL-008 | GET /alerts/:id inexistente → 404', () => {
    const res = mockResponse();
    getById({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// resolve
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — resolve', () => {
  test('TU-AL-009 | PATCH /alerts/:id/resolve inexistente → 404', () => {
    const res = mockResponse();
    resolve({ params: { id: 999 }, body: {}, user: { id: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-AL-010 | PATCH /alerts/:id/resolve pendente → status resolvido e resolvedBy', () => {
    const res = mockResponse();
    resolve({ params: { id: 1 }, body: { justification: 'Ação corretiva aplicada' }, user: { id: 2 } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'resolvido', resolution: 'Resolvido', resolvedBy: 2 }));
  });

  test('TU-AL-011 | PATCH /alerts/:id/resolve já processado (ignorado) → 422', () => {
    alerts[0].status = 'ignorado';
    const res = mockResponse();
    resolve({ params: { id: 1 }, body: {}, user: { id: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ignore — tipo de justification
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — ignore (tipo de justification)', () => {
  test('TU-AL-012 | justification não é string (número) → 422', () => {
    const res = mockResponse();
    ignore({ params: { id: 1 }, body: { justification: 123 }, user: { id: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(422);
  });
});