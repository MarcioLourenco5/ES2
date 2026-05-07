const { alerts } = require('../data/mockData');

const MIN_JUSTIFICATION_LENGTH = 10;
const MAX_JUSTIFICATION_LENGTH = 500;

function getAll(req, res) {
  return res.json(alerts);
}

function getById(req, res) {
  const alert = alerts.find(a => a.id === parseInt(req.params.id));
  if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
  return res.json(alert);
}

function resolve(req, res) {
  const alert = alerts.find(a => a.id === parseInt(req.params.id));
  if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
  if (alert.status !== 'pendente') {
    return res.status(422).json({ error: 'Alerta já foi processado' });
  }

  const { justification } = req.body || {};
  alert.status = 'resolvido';
  alert.resolution = 'Resolvido';
  alert.justification = justification || null;
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = req.user ? req.user.id : null;

  return res.json(alert);
}

function ignore(req, res) {
  const alert = alerts.find(a => a.id === parseInt(req.params.id));
  if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
  if (alert.status !== 'pendente') {
    return res.status(422).json({ error: 'Alerta já foi processado' });
  }

  const { justification } = req.body || {};
  if (!justification || typeof justification !== 'string') {
    return res.status(422).json({ error: 'Justificação é obrigatória para ignorar um alerta' });
  }
  if (justification.length < MIN_JUSTIFICATION_LENGTH) {
    return res.status(422).json({ error: `Justificação deve ter pelo menos ${MIN_JUSTIFICATION_LENGTH} caracteres` });
  }
  if (justification.length > MAX_JUSTIFICATION_LENGTH) {
    return res.status(422).json({ error: `Justificação não pode exceder ${MAX_JUSTIFICATION_LENGTH} caracteres` });
  }

  alert.status = 'ignorado';
  alert.resolution = 'Ignorado';
  alert.justification = justification;
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = req.user ? req.user.id : null;

  return res.json(alert);
}

module.exports = { getAll, getById, resolve, ignore };
