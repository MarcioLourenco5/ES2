function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveNumber(value) {
  return isFiniteNumber(value) && value > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function getUserId(req) {
  return req && req.user ? req.user.id : null;
}

module.exports = {
  isPlainObject,
  isFiniteNumber,
  isPositiveNumber,
  isPositiveInteger,
  hasText,
  getUserId,
};
