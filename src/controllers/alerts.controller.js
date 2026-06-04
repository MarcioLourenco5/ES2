const { alerts } = require('../data/mockData');
const { getUserId } = require('../utils/validation');
const { audit } = require('../utils/audit');

const MIN_JUSTIFICATION_LENGTH = 10;
const MAX_JUSTIFICATION_LENGTH = 500;

function getAll(req, res) {
  return res.json(alerts);
}

function getById(req, res) {
  const alert = alerts.find(a => a.id === Number(req.params.id));
  if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
  return res.json(alert);
}

function validateOptionalJustification(justification) {
  if (justification === undefined || justification === null || justification === '') return null;
  if (typeof justification !== 'string') return 'Justificação deve ser uma string';
  if (justification.trim().length > MAX_JUSTIFICATION_LENGTH) {
    return `Justificação não pode exceder ${MAX_JUSTIFICATION_LENGTH} caracteres`;
  }
  return null;
}

function validateMandatoryJustification(justification) {
  if (typeof justification !== 'string' || justification.trim().length === 0) {
    return 'Justificação é obrigatória para ignorar um alerta';
  }
  const length = justification.trim().length;
  if (length < MIN_JUSTIFICATION_LENGTH) return `Justificação deve ter pelo menos ${MIN_JUSTIFICATION_LENGTH} caracteres`;
  if (length > MAX_JUSTIFICATION_LENGTH) return `Justificação não pode exceder ${MAX_JUSTIFICATION_LENGTH} caracteres`;
  return null;
}

function resolve(req, res) {
  const alert = alerts.find(a => a.id === Number(req.params.id));
  if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
  if (alert.status !== 'pendente') {
    return res.status(422).json({ error: 'Alerta já foi processado' });
  }

  const { justification } = req.body || {};
  const error = validateOptionalJustification(justification);
  if (error) return res.status(422).json({ error });

  alert.status = 'resolvido';
  alert.resolution = 'Resolvido';
  alert.justification = typeof justification === 'string' && justification.trim().length > 0 ? justification.trim() : null;
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = getUserId(req);

  audit(req, 'RESOLVE_ALERT', 'PATCH /alerts/:id/resolve', { alertId: alert.id, justificationProvided: !!alert.justification });
  return res.json(alert);
}

function ignore(req, res) {
  const alert = alerts.find(a => a.id === Number(req.params.id));
  if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
  if (alert.status !== 'pendente') {
    return res.status(422).json({ error: 'Alerta já foi processado' });
  }

  const { justification } = req.body || {};
  const error = validateMandatoryJustification(justification);
  if (error) return res.status(422).json({ error });

  alert.status = 'ignorado';
  alert.resolution = 'Ignorado';
  alert.justification = justification.trim();
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = getUserId(req);

  audit(req, 'IGNORE_ALERT', 'PATCH /alerts/:id/ignore', { alertId: alert.id, justificationLength: alert.justification.length });
  return res.json(alert);
}

module.exports = {
  getAll,
  getById,
  resolve,
  ignore,
  validateOptionalJustification,
  validateMandatoryJustification,
  MIN_JUSTIFICATION_LENGTH,
  MAX_JUSTIFICATION_LENGTH,
};
