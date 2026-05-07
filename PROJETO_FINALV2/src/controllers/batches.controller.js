const { batches, plans } = require('../data/mockData');

const VALID_STATUSES = ['ativo', 'concluído', 'comprometido'];

function getAll(req, res) {
  return res.json(batches);
}

function getById(req, res) {
  const batch = batches.find(b => b.id === parseInt(req.params.id));
  if (!batch) return res.status(404).json({ error: 'Lote não encontrado' });
  return res.json(batch);
}

function create(req, res) {
  const { planId, herbId, quantity } = req.body || {};
  if (!planId || !herbId || !quantity) {
    return res.status(400).json({ error: 'planId, herbId e quantity são obrigatórios' });
  }
  const plan = plans.find(p => p.id === parseInt(planId));
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado' });

  const newBatch = {
    id: batches.length + 1,
    planId,
    herbId,
    status: 'ativo',
    quantity,
    losses: 0,
    productivity: null,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    createdBy: req.user ? req.user.id : null,
  };
  batches.push(newBatch);
  return res.status(201).json(newBatch);
}

function update(req, res) {
  const idx = batches.findIndex(b => b.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Lote não encontrado' });
  if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: `status inválido. Valores aceites: ${VALID_STATUSES.join(', ')}` });
  }
  batches[idx] = { ...batches[idx], ...req.body, id: batches[idx].id };
  return res.json(batches[idx]);
}

function remove(req, res) {
  const idx = batches.findIndex(b => b.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Lote não encontrado' });
  batches.splice(idx, 1);
  return res.status(204).send();
}

function applyPlan(req, res) {
  const batch = batches.find(b => b.id === parseInt(req.params.id));
  if (!batch) return res.status(404).json({ error: 'Lote não encontrado' });
  const { planId } = req.body || {};
  if (!planId) return res.status(400).json({ error: 'planId é obrigatório' });
  const plan = plans.find(p => p.id === parseInt(planId));
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado' });
  if (plan.type === 'pontual' && !plan.authorizedBy) {
    return res.status(403).json({ error: 'Plano pontual requer autorização do Responsável Técnico' });
  }
  batch.planId = planId;
  return res.json({ message: 'Plano aplicado ao lote', batch });
}

function registerLoss(req, res) {
  const batch = batches.find(b => b.id === parseInt(req.params.id));
  if (!batch) return res.status(404).json({ error: 'Lote não encontrado' });
  const { losses } = req.body || {};
  if (losses === undefined || losses < 0) {
    return res.status(400).json({ error: 'losses deve ser um número não negativo' });
  }
  batch.losses = losses;
  return res.json({ message: 'Perdas registadas', batch });
}

function calculateProductivity(req, res) {
  const batch = batches.find(b => b.id === parseInt(req.params.id));
  if (!batch) return res.status(404).json({ error: 'Lote não encontrado' });
  if (!batch.endDate) {
    return res.status(422).json({ error: 'Lote ainda não foi concluído (endDate não definido)' });
  }
  const productivity = ((batch.quantity - batch.losses) / batch.quantity) * 100;
  batch.productivity = parseFloat(productivity.toFixed(2));
  return res.json({ productivity: batch.productivity, batch });
}

module.exports = { getAll, getById, create, update, remove, applyPlan, registerLoss, calculateProductivity };
