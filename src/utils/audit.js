const auditService = require('../services/auditService');

function audit(req, action, resource, details = {}) {
  const userId = req && req.user ? req.user.id : null;
  return auditService.log(userId, action, resource, details);
}

module.exports = { audit };
