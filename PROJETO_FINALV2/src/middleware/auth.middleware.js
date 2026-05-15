const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'greenherb_dev_secret';

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.headers?.authorization) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado: perfil insuficiente' });
    }
    next();
  };
}

module.exports = { requireAuth, authorize };
