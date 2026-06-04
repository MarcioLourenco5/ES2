const { auditLogs } = require('../data/mockData');

function getAll(req, res) {
  return res.json(auditLogs);
}

function getById(req, res) {
  const log = auditLogs.find(l => l.id === parseInt(req.params.id));
  if (!log) return res.status(404).json({ error: 'Registo de auditoria não encontrado' });
  return res.json(log);
}

function addLog(userId, action, resource, details = {}) {
  auditLogs.push({
    id: auditLogs.length + 1,
    userId,
    action,
    resource,
    timestamp: new Date().toISOString(),
    details,
  });
}

module.exports = { getAll, getById, addLog };
