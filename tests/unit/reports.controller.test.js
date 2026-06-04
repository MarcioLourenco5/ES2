/**
 * Testes de Unidade — reports.controller.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência (PE)
 * Unidades testadas: generate, exportReport, getById
 *
 * Classes de Equivalência — generate:
 *   CE-RG1 (V) — type + format válidos              → 201
 *   CE-RG2 (I) — campos obrigatórios ausentes       → 400
 *   CE-RG3 (I) — type inválido / inexistente        → 400
 *   CE-RG4 (I) — format inválido / inexistente      → 400
 *
 * Classes de Equivalência — exportReport:
 *   CE-RE1 (V) — relatório CSV existente            → 200, Content-Type inclui text/csv
 *   CE-RE2 (V) — relatório Excel existente          → 200, Content-Type inclui application/vnd.ms-excel
 *   CE-RE3 (I) — id inexistente                     → 404
 *
 * Classes de Equivalência — getById:
 *   CE-RB1 (V) — id existente                       → 200
 *   CE-RB2 (I) — id inexistente                     → 404
 */

const { getAll, getById, generate, exportReport } = require('../../src/controllers/reports.controller');
const { reports } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status     = jest.fn().mockReturnValue(res);
  res.json       = jest.fn().mockReturnValue(res);
  res.send       = jest.fn().mockReturnValue(res);
  res.setHeader  = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  reports.length = 0;
  reports.push(
    { id: 1, type: 'batch_summary', format: 'CSV',   generatedAt: '2025-01-01', generatedBy: 1, batchId: 1 },
    { id: 2, type: 'measurements',  format: 'Excel', generatedAt: '2025-01-02', generatedBy: 1, batchId: 1 }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getById', () => {
  test('TU-RP-001 | CE-RB1 | id existente → 200', () => {
    const res = mockRes();
    getById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('TU-RP-002 | CE-RB2 | id inexistente → 404', () => {
    const res = mockRes();
    getById({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generate
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — generate', () => {
  test('TU-RP-003 | CE-RG1 | type + format válidos → 201', () => {
    const req = { body: { type: 'audit', format: 'CSV' }, user: { id: 1 } };
    const res = mockRes();
    generate(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.type).toBe('audit');
    expect(body.format).toBe('CSV');
  });

  test('TU-RP-004 | CE-RG2 | type ausente → 400', () => {
    const req = { body: { format: 'CSV' }, user: { id: 1 } };
    const res = mockRes();
    generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-RP-005 | CE-RG2 | format ausente → 400', () => {
    const req = { body: { type: 'audit' }, user: { id: 1 } };
    const res = mockRes();
    generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-RP-006 | CE-RG3 | type inválido ("tipo inexistente") → 400 com mensagem de erro', () => {
    const req = { body: { type: 'tipo_inexistente', format: 'CSV' }, user: { id: 1 } };
    const res = mockRes();
    generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/type inválido/i);
  });

  test('TU-RP-007 | CE-RG4 | format inválido ("formato inexistente") → 400 com mensagem de erro', () => {
    const req = { body: { type: 'audit', format: 'formato_inexistente' }, user: { id: 1 } };
    const res = mockRes();
    generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/format inválido/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// exportReport
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — exportReport', () => {
  test('TU-RP-008 | CE-RE1 | relatório CSV → 200 com Content-Type text/csv', () => {
    const res = mockRes();
    exportReport({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', expect.stringContaining('text/csv'));
  });

  test('TU-RP-009 | CE-RE2 | relatório Excel → 200 com Content-Type application/vnd.ms-excel', () => {
    const res = mockRes();
    exportReport({ params: { id: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', expect.stringContaining('application/vnd.ms-excel'));
  });

  test('TU-RP-010 | CE-RE3 | id inexistente → 404', () => {
    const res = mockRes();
    exportReport({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MC — Múltipla Condição
// generate: campos ausentes → type inválido → format inválido (ordem de verificação)
// ─────────────────────────────────────────────────────────────────────────────
describe('MC — Múltipla Condição (generate)', () => {
  test('TU-RP-011 | MC-R1 | type inválido + format inválido → 400 "type inválido" (type verificado antes do format)', () => {
    // ambos inválidos mas não ausentes; type check ocorre primeiro (linha 21 antes de linha 24)
    const req = { body: { type: 'tipo_inexistente', format: 'formato_inexistente' }, user: { id: 1 } };
    const res = mockRes();
    generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/type inválido/i);
    expect(body.error).not.toMatch(/format inválido/i);
  });

  test('TU-RP-012 | MC-R2 | type ausente + format inválido (TF) → 400 "campos obrigatórios" (campos ausentes verificado primeiro)', () => {
    // !type=true → short-circuit antes de verificar se format é válido
    const req = { body: { format: 'formato_inexistente' }, user: { id: 1 } };
    const res = mockRes();
    generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toMatch(/obrigatórios/i);
    expect(body.error).not.toMatch(/format inválido/i);
  });

  // ── Tabela de verdade completa: !type || !format ──────────────────────────────
  test('TU-RP-013 | MC-R3 | type + format ambos ausentes (TT) → 400 "campos obrigatórios"', () => {
    const req = { body: {}, user: { id: 1 } };
    const res = mockRes();
    generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/obrigatórios/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll', () => {
  test('TU-RP-014 | GET /reports → devolve lista de relatórios', () => {
    const res = mockRes();
    getAll({}, res);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ format: 'CSV' })]));
  });
});
