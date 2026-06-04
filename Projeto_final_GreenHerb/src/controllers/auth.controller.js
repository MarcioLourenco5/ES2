const jwt = require('jsonwebtoken');
const { authenticate } = require('../services/auth.service');
const { users } = require('../data/mockData');

const JWT_SECRET = process.env.JWT_SECRET || 'greenherb_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

async function login(req, res) {
  const { username, password } = req.body || {};
  const result = await authenticate(username, password);
  return res.status(result.status).json(
    result.success ? result.data : { error: result.error, code: result.code }
  );
}

async function refresh(req, res) {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken é obrigatório', code: 'REFRESH_TOKEN_REQUIRED' });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Token inválido', code: 'TOKEN_INVALID' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return res.status(200).json({ token });
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado', code: 'TOKEN_INVALID' });
  }
}

function me(req, res) {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilizador não encontrado', code: 'USER_NOT_FOUND' });
  }
  const { passwordHash, ...publicUser } = user;
  return res.json(publicUser);
}

module.exports = { login, refresh, me };
