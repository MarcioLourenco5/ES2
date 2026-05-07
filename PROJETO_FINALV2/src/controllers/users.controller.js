const { users } = require('../data/mockData');

const VALID_ROLES = ['Técnico', 'Responsável', 'Administrador'];

function getAll(req, res) {
  return res.json(users.map(({ password, ...u }) => u));
}

function getById(req, res) {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
  const { password, ...pub } = user;
  return res.json(pub);
}

function create(req, res) {
  const { username, password, role, email } = req.body || {};
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password e role são obrigatórios' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `role inválido. Valores aceites: ${VALID_ROLES.join(', ')}` });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username já existe' });
  }
  const newUser = { id: users.length + 1, username, password, role, email: email || '', createdAt: new Date().toISOString() };
  users.push(newUser);
  const { password: _, ...pub } = newUser;
  return res.status(201).json(pub);
}

function update(req, res) {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Utilizador não encontrado' });
  if (req.body.role && !VALID_ROLES.includes(req.body.role)) {
    return res.status(400).json({ error: `role inválido. Valores aceites: ${VALID_ROLES.join(', ')}` });
  }
  users[idx] = { ...users[idx], ...req.body, id: users[idx].id };
  const { password, ...pub } = users[idx];
  return res.json(pub);
}

function remove(req, res) {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Utilizador não encontrado' });
  users.splice(idx, 1);
  return res.status(204).send();
}

module.exports = { getAll, getById, create, update, remove };
