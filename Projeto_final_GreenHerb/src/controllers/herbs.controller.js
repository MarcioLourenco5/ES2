const { herbs } = require('../data/mockData');
const { importHerbs } = require('../services/herbs.service');
const { hasText } = require('../utils/validation');
const { audit } = require('../utils/audit');

function getAll(req, res) {
  return res.json(herbs);
}

function getById(req, res) {
  const herb = herbs.find(h => h.id === Number(req.params.id));
  if (!herb) return res.status(404).json({ error: 'Erva não encontrada' });
  return res.json(herb);
}

function create(req, res) {
  const { name, scientificName, description } = req.body || {};
  if (!hasText(name) || !hasText(scientificName)) {
    return res.status(400).json({ error: 'name e scientificName são obrigatórios' });
  }
  if (herbs.find(h => h.name.toLowerCase() === name.trim().toLowerCase())) {
    return res.status(409).json({ error: 'Erva já existe no catálogo' });
  }
  const newHerb = { id: herbs.length + 1, name: name.trim(), scientificName: scientificName.trim(), description: hasText(description) ? description.trim() : '', createdAt: new Date().toISOString() };
  herbs.push(newHerb);
  audit(req, 'CREATE_HERB', 'POST /herbs', { herbId: newHerb.id, name: newHerb.name });
  return res.status(201).json(newHerb);
}

function update(req, res) {
  const idx = herbs.findIndex(h => h.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Erva não encontrada' });
  if (req.body.name !== undefined && !hasText(req.body.name)) {
    return res.status(400).json({ error: 'name não pode ser vazio' });
  }
  if (req.body.scientificName !== undefined && !hasText(req.body.scientificName)) {
    return res.status(400).json({ error: 'scientificName não pode ser vazio' });
  }
  herbs[idx] = { ...herbs[idx], ...req.body, id: herbs[idx].id };
  if (typeof herbs[idx].name === 'string') herbs[idx].name = herbs[idx].name.trim();
  if (typeof herbs[idx].scientificName === 'string') herbs[idx].scientificName = herbs[idx].scientificName.trim();
  audit(req, 'UPDATE_HERB', 'PUT /herbs/:id', { herbId: herbs[idx].id });
  return res.json(herbs[idx]);
}

function remove(req, res) {
  const idx = herbs.findIndex(h => h.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Erva não encontrada' });
  const [removed] = herbs.splice(idx, 1);
  audit(req, 'DELETE_HERB', 'DELETE /herbs/:id', { herbId: removed.id });
  return res.status(204).send();
}

function importCsv(req, res) {
  const { data, format = 'CSV' } = req.body || {};
  const result = importHerbs(data, herbs, format);

  if (result.errors.length > 0 && result.imported === 0) {
    const firstError = result.errors[0];
    const status = firstError.code === 'IMPORT_DATA_REQUIRED' ? 400 : 422;
    return res.status(status).json({ error: firstError.message, code: firstError.code, details: result });
  }

  const created = result.rows.map(row => {
    const herb = { id: herbs.length + 1, name: row.name, scientificName: row.scientificName, description: row.description || '', createdAt: new Date().toISOString() };
    herbs.push(herb);
    return herb;
  });
  audit(req, `IMPORT_HERBS_${String(format || 'CSV').toUpperCase()}`, 'POST /herbs/import', { imported: created.length, skipped: result.skipped, format });

  return res.status(200).json({
    imported: created.length,
    skipped: result.skipped,
    errors: result.errors,
    message: `Importação concluída: ${created.length} importadas, ${result.skipped} ignoradas`,
  });
}

module.exports = { getAll, getById, create, update, remove, importCsv };
