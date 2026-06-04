const { ignore } = require('../../src/controllers/alerts.controller');
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

  test('TU-A01 | justification = 9 chars → rejeitado', () => {
    const req = {
      params: { id: 1 },
      body: { justification: 'a'.repeat(9) },
      user: { id: 2 },
    };
    const res = mockResponse();

    ignore(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  test('TU-A02 | justification = 10 chars → aceite', () => {
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

  test('TU-A03 | justification = 250 chars → aceite', () => {
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

  test('TU-A04 | justification = 500 chars → aceite', () => {
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

  test('TU-A05 | justification = 501 chars → rejeitado', () => {
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