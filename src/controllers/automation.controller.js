const { automationRules } = require('../data/mockData');
const { hasText } = require('../utils/validation');
const { audit } = require('../utils/audit');

const VALID_MODES = ['Manual', 'Automático'];

function getAll(req, res) {
  return res.json(automationRules);
}

function getById(req, res) {
  const rule = automationRules.find(r => r.id === Number(req.params.id));
  if (!rule) return res.status(404).json({ error: 'Regra não encontrada' });
  return res.json(rule);
}

function create(req, res) {
  const { name, trigger, action, mode } = req.body || {};
  if (!hasText(name) || !hasText(trigger) || !hasText(action) || !hasText(mode)) {
    return res.status(400).json({ error: 'name, trigger, action e mode são obrigatórios' });
  }
  if (!VALID_MODES.includes(mode)) {
    return res.status(400).json({ error: `mode inválido. Valores aceites: ${VALID_MODES.join(', ')}` });
  }
  const newRule = { id: automationRules.length + 1, name: name.trim(), trigger: trigger.trim(), action: action.trim(), mode, active: true, createdBy: req.user ? req.user.id : null };
  automationRules.push(newRule);
  audit(req, 'CREATE_AUTOMATION_RULE', 'POST /automation', { ruleId: newRule.id, mode });
  return res.status(201).json(newRule);
}

function update(req, res) {
  const idx = automationRules.findIndex(r => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Regra não encontrada' });
  if (req.body.mode && !VALID_MODES.includes(req.body.mode)) {
    return res.status(400).json({ error: `mode inválido. Valores aceites: ${VALID_MODES.join(', ')}` });
  }
  automationRules[idx] = { ...automationRules[idx], ...req.body, id: automationRules[idx].id };
  audit(req, 'UPDATE_AUTOMATION_RULE', 'PATCH /automation/:id', { ruleId: automationRules[idx].id });
  return res.json(automationRules[idx]);
}

function remove(req, res) {
  const idx = automationRules.findIndex(r => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Regra não encontrada' });
  const [removed] = automationRules.splice(idx, 1);
  audit(req, 'DELETE_AUTOMATION_RULE', 'DELETE /automation/:id', { ruleId: removed.id });
  return res.status(204).send();
}

function setMode(req, res) {
  const rule = automationRules.find(r => r.id === Number(req.params.id));
  if (!rule) return res.status(404).json({ error: 'Regra não encontrada' });
  const { mode } = req.body || {};
  if (!VALID_MODES.includes(mode)) {
    return res.status(400).json({ error: `mode inválido. Valores aceites: ${VALID_MODES.join(', ')}` });
  }
  const previousMode = rule.mode;
  rule.mode = mode;
  audit(req, 'SET_AUTOMATION_MODE', 'PATCH /automation/:id/mode', { ruleId: rule.id, previousMode, mode });
  return res.json({ message: `Modo alterado para ${mode}`, rule });
}

module.exports = { getAll, getById, create, update, remove, setMode, VALID_MODES };
