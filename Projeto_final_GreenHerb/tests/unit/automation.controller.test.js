/**
 * Testes de Unidade — automation.controller.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência (PE)
 * Unidades testadas: create, update, getById, remove, setMode
 *
 * Classes de Equivalência — create:
 *   CE-AC1 (V) — name + trigger + action + mode válidos → 201
 *   CE-AC2 (I) — campos obrigatórios ausentes           → 400
 *   CE-AC3 (I) — mode inválido / inexistente            → 400
 *
 * Classes de Equivalência — update:
 *   CE-AU1 (V) — mode válido                  → 200
 *   CE-AU2 (I) — mode inválido / inexistente  → 400
 *   CE-AU3 (I) — id inexistente               → 404
 *
 * Classes de Equivalência — setMode:
 *   CE-SM1 (V) — mode "Manual"                → 200
 *   CE-SM2 (V) — mode "Automático"            → 200
 *   CE-SM3 (I) — mode inválido / inexistente  → 400
 *   CE-SM4 (I) — id inexistente               → 404
 *
 * Classes de Equivalência — getById:
 *   CE-AG1 (V) — id existente    → 200
 *   CE-AG2 (I) — id inexistente  → 404
 */

const { getAll, getById, create, update, remove, setMode } = require('../../src/controllers/automation.controller');
const { automationRules } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  automationRules.length = 0;
  automationRules.push({ id: 1, name: 'Rega auto', trigger: 'humidity < 40', action: 'rega', mode: 'Automático', active: true, createdBy: 2 });
});

// ─────────────────────────────────────────────────────────────────────────────
// getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getById', () => {
  test('TU-AM-007 | CE-AG1 | id existente → 200', () => {
    const res = mockRes();
    getById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-AM-008 | CE-AG2 | id inexistente → 404', () => {
    const res = mockRes();
    getById({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — create', () => {
  test('TU-AM-009 | CE-AC1 | name + trigger + action + mode válidos → 201', () => {
    const req = { body: { name: 'Regra B', trigger: 'temp > 30', action: 'arrefecimento', mode: 'Manual' }, user: { id: 2 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.name).toBe('Regra B');
    expect(body.mode).toBe('Manual');
  });

  test('TU-AM-010 | CE-AC2 | mode ausente (FFFT) → 400', () => {
    const req = { body: { name: 'Regra B', trigger: 'temp > 30', action: 'arrefecimento' }, user: { id: 2 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-AM-011 | CE-AC2 | body vazio (TTTT) → 400', () => {
    const req = { body: {}, user: { id: 2 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-AM-025 | CE-AC2 | name ausente (TFFF) → 400 "campos obrigatórios"', () => {
    const req = { body: { trigger: 'temp > 30', action: 'arrefecimento', mode: 'Manual' }, user: { id: 2 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });

  test('TU-AM-026 | CE-AC2 | trigger ausente (FTFF) → 400 "campos obrigatórios"', () => {
    const req = { body: { name: 'Regra B', action: 'arrefecimento', mode: 'Manual' }, user: { id: 2 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });

  test('TU-AM-012 | CE-AC3 | mode inválido ("modo inexistente") → 400 com mensagem de erro', () => {
    const req = { body: { name: 'Regra B', trigger: 'temp > 30', action: 'arrefecimento', mode: 'ModoInexistente' }, user: { id: 2 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/mode inválido/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// update
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — update', () => {
  test('TU-AM-013 | CE-AU1 | mode válido ("Manual") → 200', () => {
    const req = { params: { id: 1 }, body: { mode: 'Manual' } };
    const res = mockRes();
    update(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-AM-014 | CE-AU2 | mode inválido ("modo inexistente") → 400 com mensagem de erro', () => {
    const req = { params: { id: 1 }, body: { mode: 'ModoInexistente' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/mode inválido/i);
  });

  test('TU-AM-015 | CE-AU3 | id inexistente → 404', () => {
    const req = { params: { id: 999 }, body: { mode: 'Manual' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// remove
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — remove', () => {
  test('TU-AM-016 | id existente → 204', () => {
    const res = mockRes();
    remove({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test('TU-AM-017 | id inexistente → 404', () => {
    const res = mockRes();
    remove({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setMode
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — setMode', () => {
  test('TU-AM-018 | CE-SM1 | mode "Manual" → 200 e regra atualizada', () => {
    const req = { params: { id: 1 }, body: { mode: 'Manual' } };
    const res = mockRes();
    setMode(req, res);
    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.rule.mode).toBe('Manual');
  });

  test('TU-AM-019 | CE-SM2 | mode "Automático" → 200 e regra atualizada', () => {
    const req = { params: { id: 1 }, body: { mode: 'Automático' } };
    const res = mockRes();
    setMode(req, res);
    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.rule.mode).toBe('Automático');
  });

  test('TU-AM-020 | CE-SM3 | mode inválido ("modo inexistente") → 400 com mensagem de erro', () => {
    const req = { params: { id: 1 }, body: { mode: 'ModoInexistente' } };
    const res = mockRes();
    setMode(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/mode inválido/i);
  });

  test('TU-AM-021 | CE-SM4 | id inexistente → 404', () => {
    const req = { params: { id: 999 }, body: { mode: 'Manual' } };
    const res = mockRes();
    setMode(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MC — Múltipla Condição
// create: campos ausentes verificado antes de validar mode
// update: id inexistente verificado antes de validar mode
// setMode: condição composta (!mode || !VALID_MODES.includes(mode)) cobre ausente + inválido
// ─────────────────────────────────────────────────────────────────────────────
describe('MC — Múltipla Condição', () => {
  test('TU-AM-022 | MC-AU1 | create: mode inválido + action ausente (FFTF) → 400 "campos obrigatórios" (campos verificados antes do enum)', () => {
    // !action=true → short-circuit antes de validar mode enum
    const req = { body: { name: 'R', trigger: 't', mode: 'ModoInexistente' }, user: { id: 2 } };
    const res = mockRes();
    create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/obrigatórios/i);
    expect(body.error).not.toMatch(/mode inválido/i);
  });

  test('TU-AM-023 | MC-AU2 | update: mode inválido + id inexistente → 404 (id verificado antes do mode)', () => {
    // findIndex devolve -1 → 404 antes de verificar mode
    const req = { params: { id: 999 }, body: { mode: 'ModoInexistente' } };
    const res = mockRes();
    update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-AM-024 | MC-AU3 | setMode: mode ausente + id inexistente → 404 (id verificado antes do mode)', () => {
    // regra não encontrada → 404 antes de avaliar mode
    const req = { params: { id: 999 }, body: {} };
    const res = mockRes();
    setMode(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ── Tabela de verdade de setMode: !mode || !VALID_MODES.includes(mode) ────────
  test('TU-AM-027 | MC-AU4 | setMode: mode ausente + id válido (TT) → 400 "mode inválido"', () => {
    // !mode=T (undefined) e !VALID_MODES.includes(undefined)=T; ambas verdadeiras → 400
    const req = { params: { id: 1 }, body: {} };
    const res = mockRes();
    setMode(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/mode inválido/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll', () => {
  test('TU-AM-028 | GET /automation → devolve lista de regras', () => {
    const res = mockRes();
    getAll({}, res);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ mode: 'Automático' })]));
  });
});
