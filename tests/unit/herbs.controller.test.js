/**
 * Testes de Unidade — herbs.controller.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência (PE)
 * Unidades testadas: getAll, getById, create, update, remove, importCsv
 *
 * Classes de Equivalência — create:
 *   CE-HC1 (V) — name + scientificName presentes → 201
 *   CE-HC2 (I) — scientificName ausente           → 400
 *
 * Classes de Equivalência — update:
 *   CE-HU1 (V) — id existente, id preservado     → 200
 *   CE-HU2 (I) — id inexistente                  → 404
 *
 * Classes de Equivalência — importCsv:
 *   CE-HI1 (V) — data com linhas mistas → 200 imported/skipped
 *   CE-HI2 (I) — data ausente           → 400 IMPORT_DATA_REQUIRED
 */

const herbsController = require('../../src/controllers/herbs.controller');
const { herbs } = require('../../src/data/mockData');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return { params: {}, body: {}, user: { id: 1 }, ...overrides };
}

beforeEach(() => {
  herbs.length = 0;
  herbs.push(
    { id: 1, name: 'Manjericão', scientificName: 'Ocimum basilicum', description: 'Erva aromática', createdAt: '2025-01-01' },
    { id: 2, name: 'Hortelã',    scientificName: 'Mentha spicata',   description: 'Erva refrescante', createdAt: '2025-01-01' }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getAll', () => {
  test('TU-HC-001 | GET /herbs → devolve catálogo', () => {
    const res = mockRes();
    herbsController.getAll(mockReq(), res);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Manjericão' })]));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getById
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — getById', () => {
  test('TU-HC-002 | id existente → devolve erva com scientificName', () => {
    const res = mockRes();
    herbsController.getById(mockReq({ params: { id: 1 } }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ scientificName: 'Ocimum basilicum' }));
  });

  test('TU-HC-003 | id inexistente → 404', () => {
    const res = mockRes();
    herbsController.getById(mockReq({ params: { id: 999 } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — create', () => {
  test('TU-HC-004 | CE-HC2 | sem scientificName → 400', () => {
    const res = mockRes();
    herbsController.create(mockReq({ body: { name: 'Tomilho' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('TU-HC-005 | CE-HC1 | name + scientificName válidos → 201 e description vazia por omissão', () => {
    const res = mockRes();
    herbsController.create(mockReq({ body: { name: 'Tomilho', scientificName: 'Thymus vulgaris' } }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Tomilho', description: '' }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// update
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — update', () => {
  test('TU-HC-006 | CE-HU2 | id inexistente → 404', () => {
    const res = mockRes();
    herbsController.update(mockReq({ params: { id: 999 }, body: { description: 'x' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-HC-007 | CE-HU1 | id existente e body com id fraudulento → 200 e id original preservado', () => {
    const res = mockRes();
    herbsController.update(mockReq({ params: { id: 1 }, body: { id: 99, description: 'Atualizada' } }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1, description: 'Atualizada' }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// remove
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — remove', () => {
  test('TU-HC-008 | id inexistente → 404', () => {
    const res = mockRes();
    herbsController.remove(mockReq({ params: { id: 999 } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('TU-HC-009 | id existente → 204 e erva removida da lista', () => {
    const res = mockRes();
    herbsController.remove(mockReq({ params: { id: 2 } }), res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(herbs.find(h => h.id === 2)).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// importCsv
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — importCsv', () => {
  test('TU-HC-010 | CE-HI2 | sem data → 400 IMPORT_DATA_REQUIRED', () => {
    const res = mockRes();
    herbsController.importCsv(mockReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'IMPORT_DATA_REQUIRED' }));
  });

  test('TU-HC-011 | CE-HI1 | CSV com 1 linha válida e 1 inválida → 200 com imported=1 e skipped=1', () => {
    const res = mockRes();
    const data = 'name,scientificName,description\nSálvia,Salvia officinalis,Erva\n,Nome Cientifico,Falha';
    herbsController.importCsv(mockReq({ body: { data } }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ imported: 1, skipped: 1 }));
  });
});
