/**
 * Testes de Unidade — Middleware de Autorização para Importação CSV
 * Sprint 2 — Plataforma GREENHERB
 *
 * RF-03: Importação de Catálogo via CSV
 * Regra de negócio: Apenas utilizadores com perfil "Administrador" podem importar CSV.
 *
 * Cadeia de middleware no endpoint POST /herbs/import:
 *   requireAuth → authorize('Administrador') → importCsv (controller)
 *
 * Tipo: Caixa-Preta (Black Box) / Unidade middleware
 * Técnica: Particionamento de Equivalência
 *
 * TU-HI-003/TI-H03 — requireAuth:
 *   CE-RA1 (I) — Pedido sem header Authorization              → 401 Unauthorized
 *   CE-RA2 (I) — Token inválido/expirado                      → 401 Unauthorized
 *   CE-RA3 (V) — Token válido                                 → next() chamado
 *
 * TU-HI-002/TI-H02 — authorize('Administrador'):
 *   CE-AU1 (I) — req.user ausente (não autenticado)           → 401 Unauthorized
 *   CE-AU2 (I) — role = "Técnico" (perfil insuficiente)       → 403 Forbidden
 *   CE-AU3 (V) — role = "Administrador" (perfil autorizado)   → next() chamado
 *
 * TU-HI-001/TI-H01 — importCsv (full chain):
 *   CE-IC1 (V) — Admin autenticado + CSV válido               → 200 OK + imported > 0
 */

const jwt = require('jsonwebtoken');
const { requireAuth, authorize } = require('../../src/middleware/auth.middleware');
const { importCsv } = require('../../src/controllers/herbs.controller');
const { importHerbsFromCsv } = require('../../src/services/herbs.service');
const { herbs } = require('../../src/data/mockData');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('jsonwebtoken');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

function mockRequest(overrides = {}) {
  return {
    headers: {},
    body: {},
    params: {},
    user: null,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TU-HI-003 / TI-H03 — requireAuth  (CE-RA1, CE-RA2, CE-RA3)
// ─────────────────────────────────────────────────────────────────────────────
describe('TU-HI-003 / TI-H03 | PE — requireAuth (Unidade middleware)', () => {

  test('CE-RA1 | Pedido sem header Authorization → 401 Unauthorized', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token de autenticação não fornecido' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('CE-RA1 | Header Authorization sem prefixo Bearer → 401 Unauthorized', () => {
    const req = mockRequest({ headers: { authorization: 'Basic xyz' } });
    const res = mockResponse();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token de autenticação não fornecido' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('CE-RA2 | Token inválido (JWT verify lança erro) → 401 Unauthorized', () => {
    jwt.verify.mockImplementation(() => { throw new Error('jwt malformed'); });

    const req = mockRequest({ headers: { authorization: 'Bearer token.invalido' } });
    const res = mockResponse();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token inválido ou expirado' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('CE-RA3 | Token válido → req.user preenchido e next() chamado', () => {
    const fakeUser = { id: 1, username: 'admin', role: 'Administrador' };
    jwt.verify.mockReturnValue(fakeUser);

    const req = mockRequest({ headers: { authorization: 'Bearer token.valido' } });
    const res = mockResponse();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TU-HI-002 / TI-H02 — authorize('Administrador')  (CE-AU1, CE-AU2, CE-AU3)
// ─────────────────────────────────────────────────────────────────────────────
describe('TU-HI-002 / TI-H02 | PE — authorize("Administrador") (Unidade middleware)', () => {

  test('CE-AU1 | req.user ausente → 401 Unauthorized', () => {
    const req = mockRequest(); // sem user
    const res = mockResponse();
    const next = jest.fn();

    const middleware = authorize('Administrador');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Não autenticado' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('CE-AU2 | role = "Técnico" → 403 Forbidden', () => {
    const req = mockRequest({ user: { id: 3, username: 'tecnico', role: 'Técnico' } });
    const res = mockResponse();
    const next = jest.fn();

    const middleware = authorize('Administrador');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Acesso negado: perfil insuficiente' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('CE-AU3 | role = "Administrador" → next() chamado', () => {
    const req = mockRequest({ user: { id: 1, username: 'admin', role: 'Administrador' } });
    const res = mockResponse();
    const next = jest.fn();

    const middleware = authorize('Administrador');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TU-HI-001 / TI-H01 — importCsv com Administrador autenticado  (CE-IC1)
// ─────────────────────────────────────────────────────────────────────────────
describe('TU-HI-001 / TI-H01 | PE — importCsv controller (full chain)', () => {

  beforeEach(() => {
    herbs.length = 0;
    herbs.push(
      { id: 1, name: 'Manjericão', scientificName: 'Ocimum basilicum', description: 'Erva aromática mediterrânea', createdAt: '2025-01-01' },
      { id: 2, name: 'Hortelã', scientificName: 'Mentha spicata', description: 'Erva refrescante', createdAt: '2025-01-01' },
      { id: 3, name: 'Alecrim', scientificName: 'Rosmarinus officinalis', description: 'Erva aromática resistente', createdAt: '2025-01-01' }
    );
  });

  test('CE-IC1 | Admin autenticado + CSV válido → 200 OK com imported > 0', () => {
    const csvData = 'name,scientificName\nErvaDoce,Pimpinella anisum\nCamomila,Matricaria chamomilla';

    const req = mockRequest({
      user: { id: 1, username: 'admin', role: 'Administrador' },
      body: { data: csvData },
    });
    const res = mockResponse();

    importCsv(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        imported: 2,
        skipped: 0,
      })
    );
  });

  test('Admin autenticado + CSV com dados inválidos → 200 com skipped > 0', () => {
    const csvData = 'name,scientificName\nErvaMista,Pimpinella anisum\n,Falsa';

    const req = mockRequest({
      user: { id: 1, username: 'admin', role: 'Administrador' },
      body: { data: csvData },
    });
    const res = mockResponse();

    importCsv(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        imported: 1,
        skipped: 1,
      })
    );
  });

  test('Admin autenticado + CSV sem dados (body vazio) → 400 IMPORT_DATA_REQUIRED', () => {
    const req = mockRequest({
      user: { id: 1, username: 'admin', role: 'Administrador' },
      body: {},
    });
    const res = mockResponse();

    importCsv(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
