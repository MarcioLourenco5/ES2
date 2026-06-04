const { auditLogs } = require('../data/mockData');

function log(userId, action, resource, details = {}) {
  if (!action) throw new Error('action é obrigatório');
  if (!resource) throw new Error('resource é obrigatório');

  const entry = {
    id: auditLogs.length + 1,
    userId,
    action,
    resource,
    timestamp: new Date().toISOString(),
    details,
  };

  auditLogs.push(entry);
  return entry;
}

module.exports = { log };
