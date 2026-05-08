/**
 * Testes de Unidade — auth.service.js
 * Sprint 1 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência
 * Unidade testada: authenticate(username, password, usersStore)
 *
 * Classes de equivalência — Username:
 *   CE-U1 (V) — username válido, utilizador existe, password correcta → 200
 *   CE-U2 (I) — string vazia ""                                        → 400 USERNAME_INVALID
 *   CE-U3 (I) — null ou undefined                                      → 400 USERNAME_REQUIRED
 *   CE-U4 (I) — utilizador inexistente no sistema                      → 401 CREDENTIALS_INVALID
 *   CE-U5 (I) — string composta só por espaços                         → 400 USERNAME_INVALID
 *   CE-U6 (I) — utilizador com active=false                            → 403 USER_INACTIVE
 *
 * Classes de equivalência — Password:
 *   CE-P1 (V) — password correcta (≥ 8 chars, corresponde ao user)    → 200
 *   CE-P2 (I) — string vazia ""                                        → 400 PASSWORD_INVALID
 *   CE-P3 (I) — null ou undefined                                      → 400 PASSWORD_REQUIRED
 *   CE-P4 (I) — password incorrecta (utilizador existe)                → 401 CREDENTIALS_INVALID
 *   CE-P5 (I) — string composta só por espaços                         → 400 PASSWORD_INVALID
 */

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn().mockReturnValue('$2a$10$mockedHashValue'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const { authenticate } = require('../../src/services/auth.service');
const ERRORS = require('../../src/config/errors');

const mockUsers = [
  { id: 1, username: 'admin',       passwordHash: '$2a$10$mock', role: 'Administrador', active: true  },
  { id: 2, username: 'responsavel', passwordHash: '$2a$10$mock', role: 'Responsável',   active: true  },
  { id: 3, username: 'tecnico',     passwordHash: '$2a$10$mock', role: 'Técnico',       active: true  },
  { id: 4, username: 'inativo',     passwordHash: '$2a$10$mock', role: 'Técnico',       active: false },
];

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// CLASSES DE EQUIVALÊNCIA — Username
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — Username', () => {

  test('TU-A01 | CE-U1 | username válido + password correcta → 200', async () => {
    bcrypt.compare.mockResolvedValue(true);
    const result = await authenticate('admin', 'Admin@1234', mockUsers);
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
  });

  test('TU-A02 | CE-U2 | username vazio → 400 USERNAME_INVALID', async () => {
    const result = await authenticate('', 'Admin@1234', mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.USERNAME_INVALID);
  });

  test('TU-A03 | CE-U3 | username null → 400 USERNAME_REQUIRED', async () => {
    const result = await authenticate(null, 'Admin@1234', mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.USERNAME_REQUIRED);
  });

  test('TU-A04 | CE-U3 | username undefined → 400 USERNAME_REQUIRED', async () => {
    const result = await authenticate(undefined, 'Admin@1234', mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.USERNAME_REQUIRED);
  });

  test('TU-A05 | CE-U4 | username inexistente → 401 CREDENTIALS_INVALID', async () => {
    const result = await authenticate('fantasma', 'Admin@1234', mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
    expect(result.code).toBe(ERRORS.CREDENTIALS_INVALID);
  });

  test('TU-A06 | CE-U5 | username só com espaços → 400 USERNAME_INVALID', async () => {
    const result = await authenticate('   ', 'Admin@1234', mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.USERNAME_INVALID);
  });

  test('TU-A07 | CE-U6 | utilizador inativo → 403 USER_INACTIVE', async () => {
    const result = await authenticate('inativo', 'Admin@1234', mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(403);
    expect(result.code).toBe(ERRORS.USER_INACTIVE);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CLASSES DE EQUIVALÊNCIA — Password
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — Password', () => {

  test('TU-A08 | CE-P1 | password correcta → 200', async () => {
    bcrypt.compare.mockResolvedValue(true);
    const result = await authenticate('admin', 'Admin@1234', mockUsers);
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
  });

  test('TU-A09 | CE-P2 | password vazia → 400 PASSWORD_INVALID', async () => {
    const result = await authenticate('admin', '', mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PASSWORD_INVALID);
  });

  test('TU-A10 | CE-P3 | password null → 400 PASSWORD_REQUIRED', async () => {
    const result = await authenticate('admin', null, mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PASSWORD_REQUIRED);
  });

  test('TU-A11 | CE-P3 | password undefined → 400 PASSWORD_REQUIRED', async () => {
    const result = await authenticate('admin', undefined, mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PASSWORD_REQUIRED);
  });

  test('TU-A12 | CE-P4 | password incorrecta (utilizador existe) → 401 CREDENTIALS_INVALID', async () => {
    bcrypt.compare.mockResolvedValue(false);
    const result = await authenticate('admin', 'SenhaErrada1', mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
    expect(result.code).toBe(ERRORS.CREDENTIALS_INVALID);
  });

  test('TU-A13 | CE-P5 | password só com espaços → 400 PASSWORD_INVALID', async () => {
    const result = await authenticate('admin', '        ', mockUsers);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PASSWORD_INVALID);
  });

test('TU-A14 | CE-U2 + CE-P2 | username e password vazios → 400 USERNAME_INVALID', async () => {
    // Nota: Assume-se que a validação do username ocorre primeiro na lógica do serviço
    const result = await authenticate('', '', mockUsers);
    
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    // Validamos se ele retorna o erro do primeiro campo inválido detectado
    expect(result.code).toBe(ERRORS.USERNAME_INVALID);
  });

  test('TU-A15 | CE-U3 + CE-P3 | username e password null/undefined → 400 USERNAME_REQUIRED', async () => {
    const result = await authenticate(undefined, undefined, mockUsers);
    
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.USERNAME_REQUIRED);
  });

});
