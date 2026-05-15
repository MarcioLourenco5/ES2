class HerbValidationError extends Error {
  constructor(code, message) {
    super(code);
    this.code = code;
    this.details = message;
    this.status = 400;
  }
}

function validateHerb(herb) {
  if (!herb.name) {
    throw new HerbValidationError('NAME_REQUIRED', 'Campo "name" é obrigatório');
  }
  if (typeof herb.name !== 'string' || herb.name.trim() === '') {
    throw new HerbValidationError('NAME_INVALID', 'Campo "name" não pode ser vazio');
  }
  if (!herb.scientificName) {
    throw new HerbValidationError('SCIENTIFIC_NAME_REQUIRED', 'Campo "scientificName" é obrigatório');
  }
  if (herb.description && herb.description.length > 1000) {
    throw new HerbValidationError('DESCRIPTION_TOO_LONG', 'Campo "description" não pode ultrapassar 1000 caracteres');
  }
  return { valid: true, descriptionLength: herb.description ? herb.description.length : 0 };
}

module.exports = { validateHerb, HerbValidationError };