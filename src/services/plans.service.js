const ERRORS = require('../config/errors');
const { users, herbs } = require('../data/mockData');

/**
 * Serviço de validação e criação de planos de cultivo.
 * Testável em isolamento — sem dependências externas.
 */

const VALID_TYPES = ['regular', 'emergência', 'pontual'];

// Intervalos válidos (BVA)
const TEMP_MIN = 18;
const TEMP_MAX = 28;
const HUM_MIN = 40;
const HUM_MAX = 80;
const LUM_MIN = 5000;
const LUM_MAX = 25000;
const CYCLE_MIN = 1;
const CYCLE_MAX = 365;

/**
 * Valida se o valor é do tipo esperado.
 */
function isType(value, expectedType) {
  return typeof value === expectedType;
}

/**
 * Valida se é um número finito.
 */
function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Valida se é uma string não vazia (após trim).
 */
function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida os parâmetros do plano de cultivo.
 *
 * @param {Object} planData - Dados do plano
 * @returns {{ valid: boolean, status?: number, code?: string, error?: string, plan?: Object }}
 */
function validatePlan(planData) {
  if (!planData || typeof planData !== 'object' || Array.isArray(planData)) {
    return { valid: false, status: 400, code: ERRORS.PLAN_TYPE_MISMATCH, error: 'Dados do plano inválidos: esperado objeto' };
  }

  const { herbId, type, name, temperature, humidity, luminosity, cycleDays, authorizedBy } = planData;

  // ── Validação de herbId ──────────────────────────────────────────────────
  if (herbId === null || herbId === undefined) {
    return { valid: false, status: 400, code: ERRORS.PLAN_HERBID_REQUIRED, error: 'herbId é obrigatório' };
  }
  if (!isNumber(herbId)) {
    return { valid: false, status: 400, code: ERRORS.PLAN_TYPE_MISMATCH, error: 'herbId deve ser um número' };
  }
  if (herbId <= 0) {
    return { valid: false, status: 400, code: ERRORS.PLAN_HERBID_INVALID, error: 'herbId deve ser um número positivo' };
  }
  const herb = herbs.find(h => h.id === herbId);
  if (!herb) {
    return { valid: false, status: 404, code: ERRORS.PLAN_HERB_NOT_FOUND, error: 'herbId deve identificar uma erva aromática existente' };
  }

  // ── Validação de type ────────────────────────────────────────────────────
  if (type === null || type === undefined) {
    return { valid: false, status: 400, code: ERRORS.PLAN_TYPE_REQUIRED, error: 'type é obrigatório' };
  }
  if (!isType(type, 'string')) {
    return { valid: false, status: 400, code: ERRORS.PLAN_TYPE_MISMATCH, error: 'type deve ser uma string' };
  }
  if (!VALID_TYPES.includes(type)) {
    return { valid: false, status: 400, code: ERRORS.PLAN_TYPE_INVALID, error: `type inválido. Valores aceites: ${VALID_TYPES.join(', ')}` };
  }

  // ── Validação de name ────────────────────────────────────────────────────
  if (name === null || name === undefined) {
    return { valid: false, status: 400, code: ERRORS.PLAN_NAME_REQUIRED, error: 'name é obrigatório' };
  }
  if (!isType(name, 'string')) {
    return { valid: false, status: 400, code: ERRORS.PLAN_TYPE_MISMATCH, error: 'name deve ser uma string' };
  }
  if (name.trim() === '') {
    return { valid: false, status: 400, code: ERRORS.PLAN_NAME_INVALID, error: 'name não pode ser vazio ou só espaços' };
  }

  // ── Validação de authorizedBy (para tipo pontual) ───────────────────────
  if (type === 'pontual') {
    if (authorizedBy === null || authorizedBy === undefined) {
      return { valid: false, status: 403, code: ERRORS.PLAN_AUTHORIZATION_REQUIRED, error: 'Plano pontual requer autorização do Responsável Técnico (authorizedBy)' };
    }
    if (!isNumber(authorizedBy)) {
      return { valid: false, status: 400, code: ERRORS.PLAN_TYPE_MISMATCH, error: 'authorizedBy deve ser um número' };
    }
    const responsible = users.find(u => u.id === authorizedBy && u.role === 'Responsável' && u.active !== false);
    if (!responsible) { // aqui talvez juntar o 403 (type===pontual) com este 403, 
      return { valid: false, status: 403, code: ERRORS.PLAN_AUTHORIZATION_REQUIRED, error: 'authorizedBy deve identificar um Responsável Técnico ativo' };
    }
  }

  // ── Validação de intervalos obrigatórios (BVA) ─────────────────────────
  // temperature
  if (temperature === undefined || temperature === null) {
    return { valid: false, status: 400, code: ERRORS.PLAN_TEMPERATURE_REQUIRED, error: 'temperature é obrigatório' };
  }
  {
    if (!isNumber(temperature.min)) {
      return { valid: false, status: 400, code: ERRORS.PLAN_TEMPERATURE_MIN_INVALID, error: `temperature.min deve ser um número entre ${TEMP_MIN} e ${TEMP_MAX}` };
    }
    if (temperature.min < TEMP_MIN || temperature.min > TEMP_MAX) {
      return { valid: false, status: 400, code: ERRORS.PLAN_TEMPERATURE_MIN_INVALID, error: `temperature.min deve estar entre ${TEMP_MIN} e ${TEMP_MAX}` };
    }
    if (!isNumber(temperature.max)) {
      return { valid: false, status: 400, code: ERRORS.PLAN_TEMPERATURE_MAX_INVALID, error: `temperature.max deve ser um número entre ${TEMP_MIN} e ${TEMP_MAX}` };
    }
    if (temperature.max < TEMP_MIN || temperature.max > TEMP_MAX) {
      return { valid: false, status: 400, code: ERRORS.PLAN_TEMPERATURE_MAX_INVALID, error: `temperature.max deve estar entre ${TEMP_MIN} e ${TEMP_MAX}` };
    }
    if (temperature.min > temperature.max) {
      return { valid: false, status: 400, code: ERRORS.PLAN_TEMPERATURE_RANGE_INVALID, error: 'temperature.min não pode ser maior que temperature.max' };
    }
  }

  // humidity
  if (humidity === undefined || humidity === null) {
    return { valid: false, status: 400, code: ERRORS.PLAN_HUMIDITY_REQUIRED, error: 'humidity é obrigatório' };
  }
  {
    if (!isNumber(humidity.min)) {
      return { valid: false, status: 400, code: ERRORS.PLAN_HUMIDITY_MIN_INVALID, error: `humidity.min deve ser um número entre ${HUM_MIN} e ${HUM_MAX}` };
    }
    if (humidity.min < HUM_MIN || humidity.min > HUM_MAX) {
      return { valid: false, status: 400, code: ERRORS.PLAN_HUMIDITY_MIN_INVALID, error: `humidity.min deve estar entre ${HUM_MIN} e ${HUM_MAX}` };
    }
    if (!isNumber(humidity.max)) {
      return { valid: false, status: 400, code: ERRORS.PLAN_HUMIDITY_MAX_INVALID, error: `humidity.max deve ser um número entre ${HUM_MIN} e ${HUM_MAX}` };
    }
    if (humidity.max < HUM_MIN || humidity.max > HUM_MAX) {
      return { valid: false, status: 400, code: ERRORS.PLAN_HUMIDITY_MAX_INVALID, error: `humidity.max deve estar entre ${HUM_MIN} e ${HUM_MAX}` };
    }
    if (humidity.min > humidity.max) {
      return { valid: false, status: 400, code: ERRORS.PLAN_HUMIDITY_RANGE_INVALID, error: 'humidity.min não pode ser maior que humidity.max' };
    }
  }

  // luminosity
  if (luminosity === undefined || luminosity === null) {
    return { valid: false, status: 400, code: ERRORS.PLAN_LUMINOSITY_REQUIRED, error: 'luminosity é obrigatório' };
  }
  {
    if (!isNumber(luminosity.min)) {
      return { valid: false, status: 400, code: ERRORS.PLAN_LUMINOSITY_MIN_INVALID, error: `luminosity.min deve ser um número entre ${LUM_MIN} e ${LUM_MAX}` };
    }
    if (luminosity.min < LUM_MIN || luminosity.min > LUM_MAX) {
      return { valid: false, status: 400, code: ERRORS.PLAN_LUMINOSITY_MIN_INVALID, error: `luminosity.min deve estar entre ${LUM_MIN} e ${LUM_MAX}` };
    }
    if (!isNumber(luminosity.max)) {
      return { valid: false, status: 400, code: ERRORS.PLAN_LUMINOSITY_MAX_INVALID, error: `luminosity.max deve ser um número entre ${LUM_MIN} e ${LUM_MAX}` };
    }
    if (luminosity.max < LUM_MIN || luminosity.max > LUM_MAX) {
      return { valid: false, status: 400, code: ERRORS.PLAN_LUMINOSITY_MAX_INVALID, error: `luminosity.max deve estar entre ${LUM_MIN} e ${LUM_MAX}` };
    }
    if (luminosity.min > luminosity.max) {
      return { valid: false, status: 400, code: ERRORS.PLAN_LUMINOSITY_RANGE_INVALID, error: 'luminosity.min não pode ser maior que luminosity.max' };
    }
  }

  // cycleDays
  if (cycleDays === undefined || cycleDays === null) {
    return { valid: false, status: 400, code: ERRORS.PLAN_CYCLE_REQUIRED, error: 'cycleDays é obrigatório' };
  }
  {
    if (!isNumber(cycleDays)) {
      return { valid: false, status: 400, code: ERRORS.PLAN_TYPE_MISMATCH, error: 'cycleDays deve ser um número' };
    }
    if (cycleDays < CYCLE_MIN || cycleDays > CYCLE_MAX) {
      return { valid: false, status: 400, code: ERRORS.PLAN_CYCLE_INVALID, error: `cycleDays deve estar entre ${CYCLE_MIN} e ${CYCLE_MAX}` };
    }
  }

  // ──> Se Tudo válido return true <──────────────────────────────────────────────────────────
  return {
    valid: true,
    plan: {
      herbId,
      type,
      name: name.trim(),
      temperature,
      humidity,
      luminosity,
      cycleDays,
      authorizedBy: authorizedBy || null,
    },
  };
}

module.exports = { validatePlan, VALID_TYPES, TEMP_MIN, TEMP_MAX, HUM_MIN, HUM_MAX, LUM_MIN, LUM_MAX, CYCLE_MIN, CYCLE_MAX };
