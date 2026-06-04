/**
 * Testes de Unidade — users.controller.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência (PE)
 * Unidade testada: create, update, getById, remove
 *
 * Classes de Equivalência — create:
 *   CE-UC1 (V) — username + password + role válidos → 201
 *   CE-UC2 (I) — campos obrigatórios ausentes       → 400
 *   CE-UC3 (I) — role inválido / inexistente         → 400
 *   CE-UC4 (I) — username duplicado                  → 409
 *
 * Classes de Equivalência — update:
 *   CE-UU1 (V) — dados válidos                → 200
 *   CE-UU2 (I) — role inválido                → 400
 *   CE-UU3 (I) — id inexistente               → 404
 *
 * Classes de Equivalência — getById:
 *   CE-UG1 (V) — id existente                 → 200
 *   CE-UG2 (I) — id inexistente               → 404
 *
 * Classes de Equivalência — remove:
 *   CE-UR1 (V) — id existente                 → 204
 *   CE-UR2 (I) — id inexistente               → 404
 */

const { getAll, getById, create, update, remove } = require('../../src/controllers/users.controller');
const { users } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  users.length = 0;
  users.push(
    { id: 1, username: 'admin',    passwordHash: 'hash1', role: 'Administrador', email: 'admin@test.pt', active: true },
    { id: 2, username: 'tecnico',  passwordHash: 'hash2', role: 'Técnico',       email: 'tec@test.pt',   active: true }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll', () => {
  test('TU-US-001 | getAll → retorna lista de utilizadores', () => {
    const res = mockRes();
    getAll({}, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-US-020 | getAll → nenhum utilizador expõe passwordHash', () => {
    const res = mockRes();
    getAll({}, res);
    const list = res.json.mock.calls[0][0];
    list.forEach(u => expect(u).not.toHaveProperty('passwordHash'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getById', () => {
  test('TU-US-002 | CE-UG1 | id existente → 200', () => {
    const req = { params: { id: 1 } };
    const res = mockRes();
    getById(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-US-021 | getById → não expõe passwordHash', () => {
    const req = { params: { id: 1 } };
    const res = mockRes();
    getById(req, res);
    expect(res.json.mock.calls[0][0]).not.toHaveProperty('passwordHash');
  });

  test('TU-US-003 | CE-UG2 | id inexistente → 404', () => {
    const req = { params: { id: 999 } };
    const res = mockRes();
    getById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — create', () => {
  test('TU-US-004 | CE-UC1 | dados válidos → 201', () => {
    const req = { body: { username: 'novouser', password: 'Pass@1234', role: 'Técnico', email: 'novo@test.pt' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.username).toBe('novouser');
    expect(body.password).toBeUndefined();
  });

  test('TU-US-005 | CE-UC2 | role ausente (FFT) → 400', () => {
    const req = { body: { username: 'novouser', password: 'Pass@1234' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-US-006 | CE-UC2 | body vazio (TTT) → 400', () => {
    const req = { body: {} };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-US-016 | CE-UC2 | username ausente (TFF) → 400 "campos obrigatórios"', () => {
    const req = { body: { password: 'Pass@1234', role: 'Técnico' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });

  test('TU-US-007 | CE-UC3 | role inválido ("tipo inexistente") → 400 com mensagem de erro', () => {
    const req = { body: { username: 'novouser', password: 'Pass@1234', role: 'RoleInexistente' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/role inválido/i);
  });

  test('TU-US-008 | CE-UC4 | username duplicado → 409', () => {
    const req = { body: { username: 'admin', password: 'Pass@1234', role: 'Técnico' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// update
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — update', () => {
  test('TU-US-009 | CE-UU1 | dados válidos → 200', () => {
    const req = { params: { id: 1 }, body: { email: 'novo@test.pt' } };
    const res = mockRes();
    update(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-US-022 | update → não expõe passwordHash na resposta', () => {
    const req = { params: { id: 1 }, body: { email: 'novo@test.pt' } };
    const res = mockRes();
    update(req, res);
    expect(res.json.mock.calls[0][0]).not.toHaveProperty('passwordHash');
  });

  test('TU-US-010 | CE-UU2 | role inválido ("tipo inexistente") → 400 com mensagem de erro', () => {
    const req = { params: { id: 1 }, body: { role: 'RoleInexistente' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/role inválido/i);
  });

  test('TU-US-011 | CE-UU3 | id inexistente → 404', () => {
    const req = { params: { id: 999 }, body: { email: 'novo@test.pt' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// remove
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — remove', () => {
  test('TU-US-012 | CE-UR1 | id existente → 204', () => {
    const req = { params: { id: 1 } };
    const res = mockRes();
    remove(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('TU-US-013 | CE-UR2 | id inexistente → 404', () => {
    const req = { params: { id: 999 } };
    const res = mockRes();
    remove(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MC — Múltipla Condição
// Ordem de validação em create: campos ausentes → role inválido → duplicado
// ─────────────────────────────────────────────────────────────────────────────
describe('MC — Múltipla Condição (create)', () => {
  test('TU-US-014 | MC-U1 | password ausente + role inválido → 400 "campos obrigatórios" (campos ausentes verificado primeiro)', () => {
    // password ausente faz !password=true → short-circuit antes de verificar role
    const req = { body: { username: 'novouser', role: 'RoleInexistente' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/obrigatórios/i);
    expect(body.error).not.toMatch(/role inválido/i);
  });

  test('TU-US-015 | MC-U2 | role inválido + username duplicado → 400 "role inválido" (role verificado antes do duplicado)', () => {
    // role é string não vazia → !role=false, campos passam; role inválido detectado antes de verificar duplicado
    const req = { body: { username: 'admin', password: 'Pass@1234', role: 'RoleInexistente' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/role inválido/i);
  });

  // ── Tabela de verdade completa: !username || !password || !role ───────────────
  test('TU-US-017 | MC-U3 | username + role ausentes (TFT) → 400', () => {
    const req = { body: { password: 'Pass@1234' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });

  test('TU-US-018 | MC-U4 | password + role ausentes (FTT) → 400', () => {
    const req = { body: { username: 'novouser' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });

  test('TU-US-019 | MC-U5 | username + password ausentes (TTF) → 400', () => {
    const req = { body: { role: 'Técnico' } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });
});
