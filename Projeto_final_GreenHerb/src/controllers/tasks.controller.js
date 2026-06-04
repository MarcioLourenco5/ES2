const { tasks, batches } = require('../data/mockData');
const { isPositiveInteger } = require('../utils/validation');
const { audit } = require('../utils/audit');

const VALID_TYPES = ['rega', 'fertilização', 'colheita', 'monitorização'];
const VALID_STATUSES = ['pendente', 'concluída', 'cancelada'];

function getAll(req, res) {
  return res.json(tasks);
}

function getById(req, res) {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
  return res.json(task);
}

function create(req, res) {
  const { batchId, type, scheduledDate, assignedTo } = req.body || {};

  const scheduledDateMissing = scheduledDate === undefined || scheduledDate === null ||
    (typeof scheduledDate === 'string' && scheduledDate.trim().length === 0);

  if (batchId === undefined || batchId === null || type === undefined || type === null || scheduledDateMissing) {
    return res.status(400).json({ error: 'campos obrigatórios: batchId, type e scheduledDate' });
  }
  if (!isPositiveInteger(batchId)) {
    return res.status(400).json({ error: 'batchId deve ser um inteiro positivo' });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type inválido. Valores aceites: ${VALID_TYPES.join(', ')}` });
  }
  if (typeof scheduledDate !== 'string') {
    return res.status(400).json({ error: 'scheduledDate deve ser uma string não vazia' });
  }
  if (!batches.find(b => b.id === batchId)) {
    return res.status(404).json({ error: 'Lote não encontrado para a tarefa' });
  }
  if (assignedTo !== undefined && assignedTo !== null && !isPositiveInteger(assignedTo)) {
    return res.status(400).json({ error: 'assignedTo deve ser um inteiro positivo' });
  }

  const newTask = { id: tasks.length + 1, batchId, type, status: 'pendente', scheduledDate: scheduledDate.trim(), assignedTo: assignedTo || null };
  tasks.push(newTask);
  audit(req, 'CREATE_TASK', 'POST /tasks', { taskId: newTask.id, batchId, type });
  return res.status(201).json(newTask);
}

function update(req, res) {
  const idx = tasks.findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada' });
  if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: `status inválido. Valores aceites: ${VALID_STATUSES.join(', ')}` });
  }
  if (req.body.batchId !== undefined && !isPositiveInteger(req.body.batchId)) {
    return res.status(400).json({ error: 'batchId deve ser um inteiro positivo' });
  }
  tasks[idx] = { ...tasks[idx], ...req.body, id: tasks[idx].id };
  audit(req, 'UPDATE_TASK', 'PATCH /tasks/:id', { taskId: tasks[idx].id, status: tasks[idx].status });
  return res.json(tasks[idx]);
}

function remove(req, res) {
  const idx = tasks.findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada' });
  const [removed] = tasks.splice(idx, 1);
  audit(req, 'DELETE_TASK', 'DELETE /tasks/:id', { taskId: removed.id });
  return res.status(204).send();
}

module.exports = { getAll, getById, create, update, remove, VALID_TYPES, VALID_STATUSES };
