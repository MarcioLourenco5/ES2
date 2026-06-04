const { plans } = require('../data/mockData');
const { validatePlan } = require('../services/plans.service');
const { audit } = require('../utils/audit');

function getAll(req, res) {
  return res.json(plans);
}

function getById(req, res) {
  const plan = plans.find(p => p.id === Number(req.params.id));
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado' });
  return res.json(plan);
}

function create(req, res) {
  const planData = req.body || {};
  const validation = validatePlan(planData);
  if (!validation.valid) {
    return res.status(validation.status).json({ error: validation.error, code: validation.code });
  }

  const newPlan = {
    id: plans.length + 1,
    ...validation.plan,
    status: 'ativo',
    createdBy: req.user ? req.user.id : null,
    createdAt: new Date().toISOString(),
  };
  plans.push(newPlan);
  audit(req, 'CREATE_PLAN', 'POST /plans', { planId: newPlan.id, type: newPlan.type, herbId: newPlan.herbId });
  return res.status(201).json(newPlan);
}

function update(req, res) {
  const idx = plans.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Plano não encontrado' });

  const merged = { ...plans[idx], ...req.body };
  const validation = validatePlan(merged);
  if (!validation.valid) {
    return res.status(validation.status).json({ error: validation.error, code: validation.code });
  }

  plans[idx] = { ...plans[idx], ...validation.plan, status: plans[idx].status, id: plans[idx].id, createdBy: plans[idx].createdBy, createdAt: plans[idx].createdAt };
  audit(req, 'UPDATE_PLAN', 'PUT /plans/:id', { planId: plans[idx].id, type: plans[idx].type });
  return res.json(plans[idx]);
}

function remove(req, res) {
  const idx = plans.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Plano não encontrado' });
  const [removed] = plans.splice(idx, 1);
  audit(req, 'DELETE_PLAN', 'DELETE /plans/:id', { planId: removed.id });
  return res.status(204).send();
}

module.exports = { getAll, getById, create, update, remove };
