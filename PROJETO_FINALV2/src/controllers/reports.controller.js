const { reports, batches } = require('../data/mockData');

const VALID_FORMATS = ['CSV', 'Excel'];
const VALID_TYPES = ['batch_summary', 'measurements', 'audit'];

function getAll(req, res) {
  return res.json(reports);
}

function getById(req, res) {
  const report = reports.find(r => r.id === parseInt(req.params.id));
  if (!report) return res.status(404).json({ error: 'Relatório não encontrado' });
  return res.json(report);
}

function generate(req, res) {
  const { type, format, batchId } = req.body || {};
  if (!type || !format) {
    return res.status(400).json({ error: 'type e format são obrigatórios' });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type inválido. Valores aceites: ${VALID_TYPES.join(', ')}` });
  }
  if (!VALID_FORMATS.includes(format)) {
    return res.status(400).json({ error: `format inválido. Valores aceites: ${VALID_FORMATS.join(', ')}` });
  }
  const newReport = {
    id: reports.length + 1,
    type,
    format,
    batchId: batchId || null,
    generatedAt: new Date().toISOString(),
    generatedBy: req.user ? req.user.id : null,
  };
  reports.push(newReport);
  return res.status(201).json(newReport);
}

function exportReport(req, res) {
  const report = reports.find(r => r.id === parseInt(req.params.id));
  if (!report) return res.status(404).json({ error: 'Relatório não encontrado' });
  // Mock: retorna conteúdo simulado
  const mockContent = report.format === 'CSV'
    ? 'id,type,generatedAt\n1,batch_summary,2025-01-01'
    : '{"type":"batch_summary","rows":[]}';
  res.setHeader('Content-Type', report.format === 'CSV' ? 'text/csv' : 'application/json');
  return res.status(200).send(mockContent);
}

module.exports = { getAll, getById, generate, exportReport };
