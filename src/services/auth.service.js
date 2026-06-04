const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ERRORS = require('../config/errors');
const { users } = require('../data/mockData');

const JWT_SECRET = process.env.JWT_SECRET || 'greenherb_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Função de autenticação — testável em isolamento via injecção de usersStore.
 * Async por usar bcrypt.compare.
 *
 * @param {*} username
 * @param {*} password
 * @param {Array} usersStore - store injectável (default: mockData.users)
 * @returns {Promise<{ success: boolean, status: number, code?: string, error?: string, data?: object }>}
 */
async function authenticate(username, password, usersStore = users) {
  // ── Validação de username ──────────────────────────────────────────────────
  if (username === null || username === undefined) {
    return { success: false, status: 400, code: ERRORS.USERNAME_REQUIRED, error: 'Username é obrigatório' };
  }
  if (typeof username !== 'string' || username.trim() === '') {
    return { success: false, status: 400, code: ERRORS.USERNAME_INVALID, error: 'Username inválido' };
  }
  if (username.length < 3) {
    return { success: false, status: 400, code: ERRORS.USERNAME_INVALID, error: 'Username deve ter pelo menos 3 caracteres' };
  }
  if (username.length > 50) {
    return { success: false, status: 400, code: ERRORS.USERNAME_INVALID, error: 'Username não pode exceder 50 caracteres' };
  }

  // ── Validação de password ──────────────────────────────────────────────────
  if (password === null || password === undefined) {
    return { success: false, status: 400, code: ERRORS.PASSWORD_REQUIRED, error: 'Password é obrigatória' };
  }
  if (typeof password !== 'string' || password.trim() === '') {
    return { success: false, status: 400, code: ERRORS.PASSWORD_INVALID, error: 'Password inválida' };
  }
  if (password.length < 8) {
    return { success: false, status: 400, code: ERRORS.PASSWORD_INVALID, error: 'Password deve ter pelo menos 8 caracteres' };
  }

  // ── Pesquisa do utilizador ─────────────────────────────────────────────────
  const user = usersStore.find(u => u.username === username);
  if (!user) {
    return { success: false, status: 401, code: ERRORS.CREDENTIALS_INVALID, error: 'Credenciais inválidas' };
  }

  // ── Utilizador inativo ─────────────────────────────────────────────────────
  if (user.active === false) {
    return { success: false, status: 403, code: ERRORS.USER_INACTIVE, error: 'Utilizador inativo' };
  }

  // ── Verificação de password com bcrypt ─────────────────────────────────────
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return { success: false, status: 401, code: ERRORS.CREDENTIALS_INVALID, error: 'Credenciais inválidas' };
  }

  // ── Emissão de tokens ──────────────────────────────────────────────────────
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return {
    success: true,
    status: 200,
    data: {
      token,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role },
    },
  };
}

module.exports = { authenticate };
