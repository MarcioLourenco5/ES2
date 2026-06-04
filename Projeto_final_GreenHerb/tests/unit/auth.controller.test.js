/**
 * Testes de Unidade — auth.controller.js (refresh + me)
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência (PE)
 * Unidades testadas: refresh(req, res), me(req, res)
 *
 * Classes de Equivalência — refresh:
 *   CE-RF1 (V) — refreshToken presente e válido, user existe → 200
 *   CE-RF2 (I) — refreshToken ausente                       → 400 REFRESH_TOKEN_REQUIRED
 *   CE-RF3 (I) — refreshToken inválido / expirado           → 401 TOKEN_INVALID
 *   CE-RF4 (I) — token válido mas userId não existe         → 401 TOKEN_INVALID
 *
 * Classes de Equivalência — me:
 *   CE-ME1 (V) — req.user.id existente → 200 sem passwordHash
 *   CE-ME2 (I) — req.user.id inexistente → 404 USER_NOT_FOUND
 */

jest.mock('jsonwebtoken', () => ({
  sign:   jest.fn().mockReturnValue('new.mock.jwt.token'),
  verify: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn().mockReturnValue('$2a$10$mocked'),
  compare:  jest.fn(),
}));

jest.mock('../../src/services/auth.service', () => ({
  authenticate: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const { authenticate } = require('../../src/services/auth.service');
const { login, refresh, me } = require('../../src/controllers/auth.controller');
const { users } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  users.length = 0;
  users.push(
    { id: 1, username: 'admin',   passwordHash: '$2a$10$mocked', role: 'Administrador', active: true },
    { id: 2, username: 'tecnico', passwordHash: '$2a$10$mocked', role: 'Técnico',        active: true }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// login
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — login', () => {
  test('TU-AU-007 | CE-LG1 | credenciais válidas → propaga 200 e tokens do serviço', async () => {
    authenticate.mockResolvedValue({ success: true, status: 200, data: { token: 'jwt', refreshToken: 'refresh', user: { id: 1 } } });
    const req = { body: { username: 'admin', password: 'Admin@1234' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'jwt', refreshToken: 'refresh' }));
  });

  test('TU-AU-008 | CE-LG2 | credenciais inválidas → propaga status e code do serviço', async () => {
    authenticate.mockResolvedValue({ success: false, status: 401, error: 'Credenciais inválidas', code: 'CREDENTIALS_INVALID' });
    const req = { body: { username: 'admin', password: 'errada' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas', code: 'CREDENTIALS_INVALID' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// refresh
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — refresh', () => {
  test('TU-AU-001 | CE-RF1 | refreshToken válido e user existe → 200 com novo token', async () => {
    jwt.verify.mockReturnValue({ id: 1 });
    const req = { body: { refreshToken: 'valid.refresh.token' } };
    const res = mockRes();
    await refresh(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.token).toBe('new.mock.jwt.token');
  });

  test('TU-AU-002 | CE-RF2 | refreshToken ausente → 400 REFRESH_TOKEN_REQUIRED', async () => {
    const req = { body: {} };
    const res = mockRes();
    await refresh(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.code).toBe('REFRESH_TOKEN_REQUIRED');
  });

  test('TU-AU-003 | CE-RF3 | refreshToken inválido (jwt.verify lança exceção) → 401 TOKEN_INVALID', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });
    const req = { body: { refreshToken: 'invalid.token' } };
    const res = mockRes();
    await refresh(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.code).toBe('TOKEN_INVALID');
  });

  test('TU-AU-004 | CE-RF4 | token válido mas userId inexistente → 401 TOKEN_INVALID', async () => {
    jwt.verify.mockReturnValue({ id: 999 });
    const req = { body: { refreshToken: 'valid.but.unknown.user' } };
    const res = mockRes();
    await refresh(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.code).toBe('TOKEN_INVALID');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// me
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — me', () => {
  test('TU-AU-005 | CE-ME1 | req.user.id existente → 200 sem passwordHash', () => {
    const req = { user: { id: 1 } };
    const res = mockRes();
    me(req, res);
    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.username).toBe('admin');
    expect(body.passwordHash).toBeUndefined();
  });

  test('TU-AU-006 | CE-ME2 | req.user.id inexistente → 404 USER_NOT_FOUND', () => {
    const req = { user: { id: 999 } };
    const res = mockRes();
    me(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    const body = res.json.mock.calls[0][0];
    expect(body.code).toBe('USER_NOT_FOUND');
  });
});
