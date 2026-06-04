const XLSX = require('xlsx');
const ERRORS = require('../config/errors');

/**
 * Serviço de importação de catálogo de ervas aromáticas via CSV/Excel.
 * Testável em isolamento — sem dependências externas de BD ou rede.
 */

/**
 * Valida se o valor é uma string (não vazia após trim).
 */
function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida o formato do csvContent.
 * @param {*} csvContent
 * @returns {{ valid: boolean, error?: string }}
 */
function validateInput(csvContent, label = 'CSV') {
  if (csvContent === null || csvContent === undefined) {
    return { valid: false, error: ERRORS.IMPORT_DATA_REQUIRED, message: `Dados ${label} são obrigatórios` };
  }
  if (typeof csvContent !== 'string') {
    return { valid: false, error: ERRORS.IMPORT_INVALID_FORMAT, message: `Formato inválido: esperado string ${label}` };
  }
  if (csvContent.trim() === '') {
    return { valid: false, error: ERRORS.IMPORT_DATA_REQUIRED, message: `Conteúdo ${label} vazio` };
  }
  return { valid: true };
}

/**
 * Processa uma linha CSV e retorna o objeto erva ou erro.
 * Formato esperado: name,scientificName[,description]
 */
function parseRow(line, lineIndex) {
  const trimmed = line.trim();
  if (!trimmed) return null; // linha vazia — ignorar

  const columns = trimmed.split(',');

  // Validação de número de colunas (formato esperado: name,scientificName[,description])
  if (columns.length < 2) {
    return {
      error: true,
      code: ERRORS.IMPORT_ROW_INVALID,
      message: `Linha ${lineIndex}: formato inválido — são esperadas pelo menos 2 colunas (name,scientificName)`,
      row: trimmed,
    };
  }

  if (columns.length > 3) {
    return {
      error: true,
      code: ERRORS.IMPORT_ROW_INVALID,
      message: `Linha ${lineIndex}: formato inválido — colunas a mais que o esperado (máx. 3: name,scientificName,description)`,
      row: trimmed,
    };
  }

  return parseHerbColumns(columns, lineIndex, trimmed);
}

function parseHerbColumns(columns, lineIndex, originalRow) {
  const name = columns[0] ? String(columns[0]).trim() : '';
  const scientificName = columns[1] ? String(columns[1]).trim() : '';
  const description = columns[2] ? String(columns[2]).trim() : '';

  if (!isValidString(name)) {
    return {
      error: true,
      code: ERRORS.HERB_NAME_REQUIRED,
      message: `Linha ${lineIndex}: name é obrigatório e não pode ser vazio`,
      row: originalRow,
    };
  }

  if (!isValidString(scientificName)) {
    return {
      error: true,
      code: ERRORS.HERB_SCIENTIFIC_NAME_REQUIRED,
      message: `Linha ${lineIndex}: scientificName é obrigatório e não pode ser vazio`,
      row: originalRow,
    };
  }

  return {
    name,
    scientificName,
    description: description || '',
  };
}

function buildResultFromRows(parsedRows, existingHerbs = []) {
  const result = {
    imported: 0,
    skipped: 0,
    errors: [],
    rows: [],
  };

  const existingNames = existingHerbs.map(h => h.name.toLowerCase());

  parsedRows.forEach(({ parsed, originalRow, lineIndex }) => {
    if (parsed === null) return;

    if (parsed.error) {
      result.skipped++;
      result.errors.push({ code: parsed.code, message: parsed.message, row: parsed.row });
      return;
    }

    if (existingNames.includes(parsed.name.toLowerCase())) {
      result.skipped++;
      result.errors.push({
        code: ERRORS.HERB_DUPLICATE,
        message: `Linha ${lineIndex}: erva "${parsed.name}" já existe no catálogo`,
        row: originalRow,
      });
      return;
    }

    existingNames.push(parsed.name.toLowerCase());
    result.rows.push(parsed);
    result.imported++;
  });

  return result;
}

/**
 * Importa ervas aromáticas a partir de conteúdo CSV.
 *
 * @param {string} csvContent - Conteúdo CSV bruto
 * @param {Array} [existingHerbs] - Array opcional de ervas existentes (para deteção de duplicados)
 * @returns {{ imported: number, skipped: number, errors: Array, rows: Array }}
 */
function importHerbsFromCsv(csvContent, existingHerbs = []) {
  const inputCheck = validateInput(csvContent, 'CSV');
  if (!inputCheck.valid) {
    return {
      imported: 0,
      skipped: 0,
      errors: [{ code: inputCheck.error, message: inputCheck.message }],
      rows: [],
    };
  }

  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) {
    return {
      imported: 0,
      skipped: 0,
      errors: [{ code: ERRORS.IMPORT_DATA_REQUIRED, message: 'CSV não contém dados' }],
      rows: [],
    };
  }

  const dataLines = lines.slice(1);
  if (dataLines.length === 0) {
    return {
      imported: 0,
      skipped: 0,
      errors: [],
      rows: [],
    };
  }

  const parsedRows = dataLines.map((line, index) => ({
    parsed: parseRow(line, index + 2),
    originalRow: line,
    lineIndex: index + 2,
  }));

  return buildResultFromRows(parsedRows, existingHerbs);
}

function decodeExcelData(excelData) {
  const inputCheck = validateInput(excelData, 'Excel');
  if (!inputCheck.valid) return { valid: false, error: inputCheck };

  try {
    return { valid: true, buffer: Buffer.from(excelData, 'base64') };
  } catch {
    return {
      valid: false,
      error: { error: ERRORS.IMPORT_INVALID_FORMAT, message: 'Formato Excel inválido: esperado conteúdo base64 de ficheiro .xlsx' },
    };
  }
}

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase();
}

/**
 * Importa ervas aromáticas a partir de um ficheiro Excel .xlsx codificado em base64.
 * A primeira folha deve conter cabeçalho name, scientificName e opcionalmente description.
 */
function importHerbsFromExcel(excelData, existingHerbs = []) {
  const decoded = decodeExcelData(excelData);
  if (!decoded.valid) {
    return {
      imported: 0,
      skipped: 0,
      errors: [{ code: decoded.error.error, message: decoded.error.message }],
      rows: [],
    };
  }

  let workbook;
  try {
    workbook = XLSX.read(decoded.buffer, { type: 'buffer' });
  } catch {
    return {
      imported: 0,
      skipped: 0,
      errors: [{ code: ERRORS.IMPORT_INVALID_FORMAT, message: 'Formato Excel inválido ou ficheiro corrompido' }],
      rows: [],
    };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      imported: 0,
      skipped: 0,
      errors: [{ code: ERRORS.IMPORT_DATA_REQUIRED, message: 'Excel não contém folhas' }],
      rows: [],
    };
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const nonEmptyRows = rows.filter(row => row.some(cell => String(cell).trim() !== ''));

  if (nonEmptyRows.length === 0) {
    return {
      imported: 0,
      skipped: 0,
      errors: [{ code: ERRORS.IMPORT_DATA_REQUIRED, message: 'Excel não contém dados' }],
      rows: [],
    };
  }

  const headers = nonEmptyRows[0].map(normalizeHeader);
  const nameIndex = headers.indexOf('name');
  const scientificNameIndex = headers.indexOf('scientificname');
  const descriptionIndex = headers.indexOf('description');

  if (nameIndex === -1 || scientificNameIndex === -1) {
    return {
      imported: 0,
      skipped: 0,
      errors: [{ code: ERRORS.IMPORT_ROW_INVALID, message: 'Excel deve conter cabeçalhos name e scientificName' }],
      rows: [],
    };
  }

  const dataRows = nonEmptyRows.slice(1);
  if (dataRows.length === 0) {
    return { imported: 0, skipped: 0, errors: [], rows: [] };
  }

  const parsedRows = dataRows.map((row, index) => {
    const originalRow = row.map(cell => String(cell)).join(',');
    const columns = [
      row[nameIndex],
      row[scientificNameIndex],
      descriptionIndex === -1 ? '' : row[descriptionIndex],
    ];
    return {
      parsed: parseHerbColumns(columns, index + 2, originalRow),
      originalRow,
      lineIndex: index + 2,
    };
  });

  return buildResultFromRows(parsedRows, existingHerbs);
}

function importHerbs(data, existingHerbs = [], format = 'CSV') {
  const normalizedFormat = String(format || 'CSV').trim().toLowerCase();
  if (normalizedFormat === 'excel' || normalizedFormat === 'xlsx') {
    return importHerbsFromExcel(data, existingHerbs);
  }
  if (normalizedFormat === 'csv') {
    return importHerbsFromCsv(data, existingHerbs);
  }
  return {
    imported: 0,
    skipped: 0,
    errors: [{ code: ERRORS.IMPORT_INVALID_FORMAT, message: 'format deve ser CSV ou Excel' }],
    rows: [],
  };
}

module.exports = { importHerbsFromCsv, importHerbsFromExcel, importHerbs };
