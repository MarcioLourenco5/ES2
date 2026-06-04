const { batches, plans } = require('../data/mockData');
const { isFiniteNumber, isPositiveInteger, getUserId } = require('../utils/validation');
const { audit } = require('../utils/audit');

const VALID_STATUSES = ['ativo', 'concluído', 'comprometido'];

function isValidDateString(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function calculateProductivityValue(quantity, losses) {
  if (!isFiniteNumber(quantity) || quantity <= 0) return null;
  if (!isFiniteNumber(losses) || losses < 0 || losses > quantity) return null;
  return Number((((quantity - losses) / quantity) * 100).toFixed(2));
}

function getAll(req, res) {
  return res.json(batches);
}

function getById(req, res) {
  const batch = batches.find(b => b.id === Number(req.params.id));
  if (!batch) return res.status(404).json({ error: 'Lote não encontrado' });
  return res.json(batch);
}

function create(req, res) {
  const { planId, herbId, quantity } = req.body || {};
  if (!isPositiveInteger(planId)) {
    return res.status(400).json({ error: 'planId deve ser um inteiro positivo' });
  }
  if (!isPositiveInteger(herbId)) {
    return res.status(400).json({ error: 'herbId deve ser um inteiro positivo' });
  }
  if (!isFiniteNumber(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'quantity deve ser um número positivo' });
  }

  const plan = plans.find(p => p.id === planId);
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
    createdBy: getUserId(req),
  };
  batches.push(newBatch);
  audit(req, 'CREATE_BATCH', 'POST /batches', { batchId: newBatch.id, planId, herbId, quantity });
  return res.status(201).json(newBatch);
}

function update(req, res) {
  const idx = batches.findIndex(b => b.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Lote não encontrado' });

  if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: `status inválido. Valores aceites: ${VALID_STATUSES.join(', ')}` });
  }

  const current = batches[idx].status;
  const requested = req.body.status;
  if (requested && requested !== current && current !== 'ativo') {
    return res.status(400).json({ error: 'BATCH_TRANSITION_INVALID' });
  }

  if (req.body.quantity !== undefined && (!isFiniteNumber(req.body.quantity) || req.body.quantity <= 0)) {
    return res.status(400).json({ error: 'quantity deve ser um número positivo' });
  }
  if (req.body.losses !== undefined) {
    if (!isFiniteNumber(req.body.losses) || req.body.losses < 0) {
      return res.status(400).json({ error: 'losses deve ser um número não negativo' });
    }
    const quantity = req.body.quantity !== undefined ? req.body.quantity : batches[idx].quantity;
    if (req.body.losses > quantity) {
      return res.status(422).json({ error: 'losses não pode ser superior a quantity' });
    }
  }

  if (req.body.endDate !== undefined) {
    if (!isValidDateString(req.body.endDate)) {
      return res.status(400).json({ error: 'endDate inválida' });
    }
    const startDate = new Date(batches[idx].startDate);
    const endDate = new Date(req.body.endDate);
    if (endDate < startDate) {
      return res.status(400).json({ error: 'endDate não pode ser anterior a startDate' });
    }
  }

  const before = { ...batches[idx] };
  batches[idx] = { ...batches[idx], ...req.body, id: batches[idx].id };

  if (batches[idx].status === 'concluído') {
    if (!batches[idx].endDate) {
      return res.status(400).json({ error: 'endDate é obrigatória ao concluir o lote' });
    }
    const productivity = calculateProductivityValue(batches[idx].quantity, batches[idx].losses);
    if (productivity === null) {
      return res.status(422).json({ error: 'Dados inválidos para calcular produtividade' });
    }
    batches[idx].productivity = productivity;
  }

  audit(req, 'UPDATE_BATCH', 'PUT /batches/:id', { batchId: batches[idx].id, before, after: batches[idx] });
  return res.json(batches[idx]);
}

function remove(req, res) {
  const idx = batches.findIndex(b => b.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Lote não encontrado' });
  const [removed] = batches.splice(idx, 1);
  audit(req, 'DELETE_BATCH', 'DELETE /batches/:id', { batchId: removed.id });
  return res.status(204).send();
}

function applyPlan(req, res) {
  const batch = batches.find(b => b.id === Number(req.params.id));
  if (!batch) return res.status(404).json({ error: 'Lote não encontrado' });

  const { planId } = req.body || {};
  if (!isPositiveInteger(planId)) {
    return res.status(400).json({ error: 'planId deve ser um inteiro positivo' });
  }

  const plan = plans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado' });
  if (plan.type === 'pontual' && !plan.authorizedBy) {
    return res.status(403).json({ error: 'Plano pontual requer autorização do Responsável Técnico' });
  }

  const previousPlanId = batch.planId;
  batch.planId = planId;
  audit(req, 'APPLY_PLAN_TO_BATCH', 'POST /batches/:id/apply-plan', { batchId: batch.id, previousPlanId, planId });
  return res.json({ message: 'Plano aplicado ao lote', batch });
}

function registerLoss(req, res) {
  const batch = batches.find(b => b.id === Number(req.params.id));
  if (!batch) return res.status(404).json({ error: 'Lote não encontrado' });

  const { losses } = req.body || {};
  if (!isFiniteNumber(losses) || losses < 0) {
    return res.status(400).json({ error: 'losses deve ser um número não negativo' });
  }
  if (losses > batch.quantity) {
    return res.status(422).json({ error: 'losses não pode ser superior a quantity' });
  }

  batch.losses = losses;
  audit(req, 'REGISTER_BATCH_LOSS', 'PATCH /batches/:id/losses', { batchId: batch.id, losses });
  return res.json({ message: 'Perdas registadas', batch });
}


function splitBatch(req, res) {
  const batch = batches.find(b => b.id === Number(req.params.id));
  if (!batch) return res.status(404).json({ error: 'Lote não encontrado' });
  if (batch.status !== 'ativo') {
    return res.status(400).json({ error: 'Só é possível dividir lotes em estado ativo' });
  }

  const { quantity } = req.body || {};
  if (!isFiniteNumber(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'quantity deve ser um número positivo' });
  }

  const availableQuantity = batch.quantity - (batch.losses || 0);
  if (quantity >= availableQuantity) {
    return res.status(422).json({ error: 'quantity deve ser inferior à quantidade disponível do lote' });
  }

  const previousQuantity = batch.quantity;
  batch.quantity = Number((batch.quantity - quantity).toFixed(2));

  const newBatch = {
    id: batches.length + 1,
    planId: batch.planId,
    herbId: batch.herbId,
    status: 'ativo',
    quantity,
    losses: 0,
    productivity: null,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    createdBy: getUserId(req),
    parentBatchId: batch.id,
  };

  batches.push(newBatch);
  audit(req, 'SPLIT_BATCH', 'POST /batches/:id/split', {
    batchId: batch.id,
    newBatchId: newBatch.id,
    previousQuantity,
    remainingQuantity: batch.quantity,
    splitQuantity: quantity,
  });

  return res.status(201).json({ message: 'Lote dividido parcialmente', originalBatch: batch, newBatch });
}

function calculateProductivity(req, res) {
  const batch = batches.find(b => b.id === Number(req.params.id));
  if (!batch) return res.status(404).json({ error: 'Lote não encontrado' });
  if (!batch.endDate) {
    return res.status(422).json({ error: 'Lote ainda não foi concluído (endDate não definido)' });
  }
  if (!isFiniteNumber(batch.quantity) || batch.quantity <= 0) {
    return res.status(422).json({ error: 'quantity inválida para cálculo de produtividade' });
  }
  if (!isFiniteNumber(batch.losses) || batch.losses < 0 || batch.losses > batch.quantity) {
    return res.status(422).json({ error: 'losses inválidas para cálculo de produtividade' });
  }

  const productivity = calculateProductivityValue(batch.quantity, batch.losses);
  batch.productivity = productivity;
  audit(req, 'CALCULATE_BATCH_PRODUCTIVITY', 'GET /batches/:id/productivity', { batchId: batch.id, productivity: batch.productivity });
  return res.json({ productivity: batch.productivity, batch });
}

module.exports = { getAll, getById, create, update, remove, applyPlan, registerLoss, splitBatch, calculateProductivity, calculateProductivityValue };
