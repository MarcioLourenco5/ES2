/**
 * Testes de Unidade — herbs.service.js
 * Sprint 2 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnica: Particionamento de Equivalência
 * Unidade testada: importHerbsFromCsv(csvContent, existingHerbs)
 *
 * Classes de equivalência — csvContent:
 *   CE-H1  (V) — CSV com linhas válidas
 *   CE-H2  (I) — null / undefined
 *   CE-H3  (I) — string vazia
 *   CE-H4  (I) — CSV só com header, sem dados
 *   CE-H5  (I) — linha com name vazio
 *   CE-H6  (I) — linha com scientificName vazio
 *   CE-H7  (I) — tipo inválido: número
 *   CE-H8  (I) — tipo inválido: array/object
 *   CE-H9  (V) — linha com description opcional ausente
 *   CE-H10 (I) — nome duplicado
 *   CE-H11 (I) — linha com name só espaços
 *   CE-H12 (V) — headers case-insensitive
 */

const XLSX = require('xlsx');
const { importHerbsFromCsv, importHerbsFromExcel } = require('../../src/services/herbs.service');
const ERRORS = require('../../src/config/errors');

// ─────────────────────────────────────────────────────────────────────────────
// CE-H1: CSV com linhas válidas
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — csvContent válido', () => {

  test('TU-HS-001 | CE-H1 | CSV com 2 linhas válidas → imported: 2', () => {
    const csv = 'name,scientificName\nManjericão,Ocimum basilicum\nHortelã,Mentha spicata';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ name: 'Manjericão', scientificName: 'Ocimum basilicum', description: '' });
    expect(result.rows[1]).toEqual({ name: 'Hortelã', scientificName: 'Mentha spicata', description: '' });
  });

  test('TU-HS-009 | CE-H9 | CSV com description opcional → imported: 1', () => {
    const csv = 'name,scientificName,description\nAlecrim,Rosmarinus officinalis,Erva aromática';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(1);
    expect(result.rows[0].description).toBe('Erva aromática');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CE-H12: Headers case-insensitive
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — headers case-insensitive', () => {

  test('TU-HS-012 | CE-H12 | headers case-insensitive (NAME,scientificName) → imported: 1', () => {
    const csv = 'NAME,scientificName\nManjericão,Ocimum basilicum';
    const result = importHerbsFromCsv(csv);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].name).toBe('Manjericão');
    expect(result.rows[0].scientificName).toBe('Ocimum basilicum');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CE-H2: null / undefined
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — csvContent null/undefined', () => {

  test('TU-HS-002 | CE-H2 | csvContent null → erro IMPORT_DATA_REQUIRED', () => {
    const result = importHerbsFromCsv(null);

    expect(result.imported).toBe(0);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_DATA_REQUIRED);
  });

  test('TU-HS-003 | CE-H2 | csvContent undefined → erro IMPORT_DATA_REQUIRED', () => {
    const result = importHerbsFromCsv(undefined);

    expect(result.imported).toBe(0);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_DATA_REQUIRED);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CE-H3: String vazia
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — csvContent string vazia', () => {

  test('TU-HS-004 | CE-H3 | csvContent string vazia → erro IMPORT_DATA_REQUIRED', () => {
    const result = importHerbsFromCsv('');

    expect(result.imported).toBe(0);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_DATA_REQUIRED);
  });

  test('CSV com apenas espaços em branco → erro IMPORT_DATA_REQUIRED', () => {
    const result = importHerbsFromCsv('   \n  \n  ');

    expect(result.imported).toBe(0);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_DATA_REQUIRED);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CE-H4: CSV só com header
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — CSV sem dados', () => {

  test('TU-HS-005 | CE-H4 | CSV só com header, sem dados → imported: 0', () => {
    const csv = 'name,scientificName';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CE-H5 e CE-H6: Campos obrigatórios vazios
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — linhas com campos obrigatórios vazios', () => {

  test('TU-HS-006 | CE-H5 | linha com name vazio → skipped: 1', () => {
    const csv = 'name,scientificName\n,Valeriana officinalis';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors[0].code).toBe(ERRORS.HERB_NAME_REQUIRED);
  });

  test('TU-HS-007 | CE-H6 | linha com scientificName vazio → skipped: 1', () => {
    const csv = 'name,scientificName\nCamomila,';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors[0].code).toBe(ERRORS.HERB_SCIENTIFIC_NAME_REQUIRED);
  });

  test('TU-HS-011 | CE-H11 | linha com name só espaços → skipped: 1', () => {
    const csv = 'name,scientificName\n   ,Matricaria chamomilla';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors[0].code).toBe(ERRORS.HERB_NAME_REQUIRED);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CE-H7 e CE-H8: Tipo inválido
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — tipo inválido (type mismatch)', () => {

  test('TU-HS-008 | CE-H7 | csvContent é número → erro IMPORT_INVALID_FORMAT', () => {
    const result = importHerbsFromCsv(12345);

    expect(result.imported).toBe(0);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_INVALID_FORMAT);
  });

  test('csvContent é array → erro IMPORT_INVALID_FORMAT', () => {
    const result = importHerbsFromCsv(['a', 'b']);

    expect(result.imported).toBe(0);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_INVALID_FORMAT);
  });

  test('csvContent é objeto → erro IMPORT_INVALID_FORMAT', () => {
    const result = importHerbsFromCsv({});

    expect(result.imported).toBe(0);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_INVALID_FORMAT);
  });

  test('csvContent é boolean → erro IMPORT_INVALID_FORMAT', () => {
    const result = importHerbsFromCsv(true);

    expect(result.imported).toBe(0);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_INVALID_FORMAT);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CE-H10: Duplicados
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — duplicados', () => {

  test('TU-HS-010 | CE-H10 | nome duplicado no existingHerbs → skipped', () => {
    const csv = 'name,scientificName\nManjericão,Ocimum basilicum';
    const existing = [{ name: 'Manjericão', scientificName: 'Ocimum basilicum' }];
    const result = importHerbsFromCsv(csv, existing);

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors[0].code).toBe(ERRORS.HERB_DUPLICATE);
  });

  test('CSV com nome repetido internamente → segundo registo é skipped', () => {
    const csv = 'name,scientificName\nA,A\nA,A';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.errors[0].code).toBe(ERRORS.HERB_DUPLICATE);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cenários mistos
// ─────────────────────────────────────────────────────────────────────────────
describe('Cenários mistos (válidas + inválidas)', () => {

  test('CSV misto: 1 válida, 1 inválida, 1 vazia → imported: 1, skipped: 1', () => {
    const csv = 'name,scientificName\nVálida,Validus\n,Invalida\n\n'; // linha 3 vazia
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.rows[0].name).toBe('Válida');
  });

  test('CSV com linhas em branco no meio → ignoradas silenciosamente', () => {
    const csv = 'name,scientificName\n\nA,B\n\n\nC,D\n';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CE-H14: CSV com colunas a menos que o esperado (< 2 colunas)
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — colunas a menos que o esperado', () => {

  test('CSV com apenas 1 coluna na linha de dados (falta scientificName) → erro IMPORT_ROW_INVALID', () => {
    const csv = 'name,scientificName\nManjericão';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_ROW_INVALID);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CE-H15: CSV com colunas a mais que o esperado (> 3 colunas, ex.: price)
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — colunas a mais que o esperado', () => {

  test('CSV com coluna price depois de description (4 colunas) → erro IMPORT_ROW_INVALID', () => {
    const csv = 'name,scientificName,description,price\nManjericão,Ocimum basilicum,Erva aromática,10.50';
    const result = importHerbsFromCsv(csv);

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_ROW_INVALID);
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// Importação Excel — requisito /herbs com suporte CSV/Excel
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — importHerbsFromExcel', () => {
  function workbookBase64(rows) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Herbs');
    return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  }

  test('TU-HS-016 | Excel válido com 2 linhas → imported: 2', () => {
    const data = workbookBase64([
      ['name', 'scientificName', 'description'],
      ['Tomilho', 'Thymus vulgaris', 'Aromática'],
      ['Salsa', 'Petroselinum crispum', 'Culinária'],
    ]);

    const result = importHerbsFromExcel(data);

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.rows[0]).toEqual({ name: 'Tomilho', scientificName: 'Thymus vulgaris', description: 'Aromática' });
  });

  test('TU-HS-017 | Excel sem cabeçalhos obrigatórios → IMPORT_ROW_INVALID', () => {
    const data = workbookBase64([
      ['nome', 'cientifico'],
      ['Tomilho', 'Thymus vulgaris'],
    ]);

    const result = importHerbsFromExcel(data);

    expect(result.imported).toBe(0);
    expect(result.errors[0].code).toBe(ERRORS.IMPORT_ROW_INVALID);
  });

  test('TU-HS-018 | Excel misto reporta importadas e ignoradas', () => {
    const data = workbookBase64([
      ['name', 'scientificName', 'description'],
      ['Coentros', 'Coriandrum sativum', 'Válida'],
      ['', 'Sem nome científico', 'Inválida'],
    ]);

    const result = importHerbsFromExcel(data);

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.errors[0].code).toBe(ERRORS.HERB_NAME_REQUIRED);
  });
});
