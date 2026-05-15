class CSVParseError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function sanitizeField(field) {
  if (field === undefined || field === null) return null;
  if (field.startsWith('"') && field.endsWith('"')) {
    field = field.slice(1, -1).replace(/""/g, '"');
  }
  field = field.replace(/'/g, "''");
  return field.trim();
}

function splitCSVLine(line) {
  const fields = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
      current += char;
    } else if (char === ',' && !insideQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

function parseCSVLine(line) {
  if (!line || typeof line !== 'string') {
    throw new CSVParseError('INVALID_CSV_FORMAT', 'Linha CSV inválida');
  }
  const fields = splitCSVLine(line).map(field => sanitizeField(field));
  if (fields.length < 2) {
    throw new CSVParseError('INVALID_CSV_FORMAT', 'Linha CSV incompleta');
  }
  const [name, scientificName, description] = fields;
  if (!name || name.trim() === '') {
    throw new CSVParseError('INVALID_HERB_NAME', 'Nome não pode ser vazio');
  }
  if (!scientificName || scientificName.trim() === '') {
    throw new CSVParseError('INVALID_CSV_FORMAT', 'Nome científico não pode ser vazio');
  }
  return {
    name: name.trim(),
    scientificName: scientificName.trim(),
    description: description ? description.trim() : '',
    sanitized: true
  };
}

function parseCSVFile(content) {
  if (!content) throw new CSVParseError('INVALID_CSV_FORMAT', 'Conteúdo vazio');
  const lines = content.split('\n').filter(line => line.trim());
  const result = { valid: 0, invalid: 0, processed: 0, data: [], errors: [] };
  for (let i = 0; i < lines.length; i++) {
    result.processed++;
    try {
      const herb = parseCSVLine(lines[i]);
      result.valid++;
      result.data.push(herb);
    } catch (error) {
      result.invalid++;
      result.errors.push({ line: i + 1, error: error.message });
    }
  }
  return result;
}

module.exports = { parseCSVLine, parseCSVFile, CSVParseError };