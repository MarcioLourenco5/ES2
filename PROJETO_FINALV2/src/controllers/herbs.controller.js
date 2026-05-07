const { herbs } = require('../data/mockData');

function getAll(req, res) {
  return res.json(herbs);
}

function getById(req, res) {
  const herb = herbs.find(h => h.id === parseInt(req.params.id));
  if (!herb) return res.status(404).json({ error: 'Erva não encontrada' });
  return res.json(herb);
}

function create(req, res) {
  const { name, scientificName, description } = req.body || {};
  if (!name || !scientificName) {
    return res.status(400).json({ error: 'name e scientificName são obrigatórios' });
  }
  const newHerb = { id: herbs.length + 1, name, scientificName, description: description || '', createdAt: new Date().toISOString() };
  herbs.push(newHerb);
  return res.status(201).json(newHerb);
}

function update(req, res) {
  const idx = herbs.findIndex(h => h.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Erva não encontrada' });
  herbs[idx] = { ...herbs[idx], ...req.body, id: herbs[idx].id };
  return res.json(herbs[idx]);
}

function remove(req, res) {
  const idx = herbs.findIndex(h => h.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Erva não encontrada' });
  herbs.splice(idx, 1);
  return res.status(204).send();
}

function importCsv(req, res) {
  // Mock: simula importação CSV — Sprint 2 implementará lógica real
  const mockFile = req.body || {};
  if (!mockFile.data) {
    return res.status(400).json({ error: 'Ficheiro CSV não fornecido ou vazio' });
  }
  return res.status(200).json({
    imported: 2,
    skipped: 0,
    errors: [],
    message: 'Importação concluída (mock)',
  });
}

module.exports = { getAll, getById, create, update, remove, importCsv };
