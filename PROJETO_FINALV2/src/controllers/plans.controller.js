const { plans } = require('../data/mockData');

const VALID_TYPES = ['regular', 'emergência', 'pontual'];

function getAll(req, res) {
  return res.json(plans);
}

function getById(req, res) {
  const plan = plans.find(p => p.id === parseInt(req.params.id));
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado' });
  return res.json(plan);
}

function create(req, res) {
  const { herbId, type, name, temperature, humidity, luminosity, cycleDays, authorizedBy } = req.body || {};

  if (!herbId || !type || !name) {
    return res.status(400).json({ error: 'herbId, type e name são obrigatórios' });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type inválido. Valores aceites: ${VALID_TYPES.join(', ')}` });
  }
  if (type === 'pontual' && !authorizedBy) {
    return res.status(403).json({ error: 'Plano pontual requer autorização do Responsável Técnico (authorizedBy)' });
  }

  const newPlan = {
    id: plans.length + 1,
    herbId,
    type,
    name,
    temperature: temperature || { min: 18, max: 28 },
    humidity: humidity || { min: 40, max: 80 },
    luminosity: luminosity || { min: 5000, max: 25000 },
    cycleDays: cycleDays || 90,
    status: 'ativo',
    createdBy: req.user ? req.user.id : null,
    authorizedBy: authorizedBy || null,
    createdAt: new Date().toISOString(),
  };
  plans.push(newPlan);
  return res.status(201).json(newPlan);
}

function update(req, res) {
  const idx = plans.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Plano não encontrado' });
  if (req.body.type && !VALID_TYPES.includes(req.body.type)) {
    return res.status(400).json({ error: `type inválido. Valores aceites: ${VALID_TYPES.join(', ')}` });
  }
  plans[idx] = { ...plans[idx], ...req.body, id: plans[idx].id };
  return res.json(plans[idx]);
}

function remove(req, res) {
  const idx = plans.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Plano não encontrado' });
  plans.splice(idx, 1);
  return res.status(204).send();
}

module.exports = { getAll, getById, create, update, remove };
