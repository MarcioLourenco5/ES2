const { tasks } = require('../data/mockData');

const VALID_TYPES = ['rega', 'fertilização', 'colheita', 'monitorização'];
const VALID_STATUSES = ['pendente', 'concluída', 'cancelada'];

function getAll(req, res) {
  return res.json(tasks);
}

function getById(req, res) {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
  return res.json(task);
}

function create(req, res) {
  const { batchId, type, scheduledDate, assignedTo } = req.body || {};
  if (!batchId || !type || !scheduledDate) {
    return res.status(400).json({ error: 'batchId, type e scheduledDate são obrigatórios' });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type inválido. Valores aceites: ${VALID_TYPES.join(', ')}` });
  }
  const newTask = { id: tasks.length + 1, batchId, type, status: 'pendente', scheduledDate, assignedTo: assignedTo || null };
  tasks.push(newTask);
  return res.status(201).json(newTask);
}

function update(req, res) {
  const idx = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada' });
  if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: `status inválido. Valores aceites: ${VALID_STATUSES.join(', ')}` });
  }
  tasks[idx] = { ...tasks[idx], ...req.body, id: tasks[idx].id };
  return res.json(tasks[idx]);
}

function remove(req, res) {
  const idx = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada' });
  tasks.splice(idx, 1);
  return res.status(204).send();
}

module.exports = { getAll, getById, create, update, remove };
