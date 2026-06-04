const bcrypt = require('bcryptjs');
const { users } = require('../data/mockData');
const { hasText } = require('../utils/validation');
const { audit } = require('../utils/audit');

const VALID_ROLES = ['Técnico', 'Responsável', 'Administrador'];
const SALT_ROUNDS = 10;

function publicUser(user) {
  const { passwordHash, password, ...pub } = user;
  return pub;
}

function getAll(req, res) {
  return res.json(users.map(publicUser));
}

function getById(req, res) {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
  return res.json(publicUser(user));
}

function create(req, res) {
  const { username, password, role, email } = req.body || {};
  if (!hasText(username) || !hasText(password) || !hasText(role)) {
    return res.status(400).json({ error: 'username, password e role são obrigatórios' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `role inválido. Valores aceites: ${VALID_ROLES.join(', ')}` });
  }
  if (users.find(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return res.status(409).json({ error: 'Username já existe' });
  }

  const newUser = {
    id: users.length + 1,
    username: username.trim(),
    passwordHash: bcrypt.hashSync(password, SALT_ROUNDS),
    role,
    email: typeof email === 'string' ? email.trim() : '',
    active: true,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  audit(req, 'CREATE_USER', 'POST /users', { userId: newUser.id, role });
  return res.status(201).json(publicUser(newUser));
}

function update(req, res) {
  const idx = users.findIndex(u => u.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Utilizador não encontrado' });

  if (req.body.role && !VALID_ROLES.includes(req.body.role)) {
    return res.status(400).json({ error: `role inválido. Valores aceites: ${VALID_ROLES.join(', ')}` });
  }

  const updates = { ...req.body };
  if (updates.username !== undefined) {
    if (!hasText(updates.username)) return res.status(400).json({ error: 'username não pode ser vazio' });
    const duplicated = users.find(u => u.id !== users[idx].id && u.username.toLowerCase() === updates.username.trim().toLowerCase());
    if (duplicated) return res.status(409).json({ error: 'Username já existe' });
    updates.username = updates.username.trim();
  }
  if (updates.password !== undefined) {
    if (!hasText(updates.password)) return res.status(400).json({ error: 'password não pode ser vazia' });
    updates.passwordHash = bcrypt.hashSync(updates.password, SALT_ROUNDS);
    delete updates.password;
  }

  users[idx] = { ...users[idx], ...updates, id: users[idx].id };
  audit(req, 'UPDATE_USER', 'PUT /users/:id', { userId: users[idx].id });
  return res.json(publicUser(users[idx]));
}

function remove(req, res) {
  const idx = users.findIndex(u => u.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Utilizador não encontrado' });
  const [removed] = users.splice(idx, 1);
  audit(req, 'DELETE_USER', 'DELETE /users/:id', { userId: removed.id });
  return res.status(204).send();
}

module.exports = { getAll, getById, create, update, remove, VALID_ROLES };
