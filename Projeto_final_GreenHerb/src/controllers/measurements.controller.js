const { measurements, alerts, batches, plans } = require('../data/mockData');
const { isFiniteNumber, isPositiveInteger, getUserId } = require('../utils/validation');
const { audit } = require('../utils/audit');

function getAll(req, res) {
  return res.json(measurements);
}

function getById(req, res) {
  const id = Number(req.params.id);
  const m = measurements.find(item => item.id === id);
  if (!m) return res.status(404).json({ error: 'Medição não encontrada' });
  return res.json(m);
}

function classifyDeviation(value, min, max, warningThreshold, criticalThreshold) {
  const nearestLimit = value < min ? min : max;
  const deviation = Math.abs(value - nearestLimit);
  if (deviation > criticalThreshold) return 'Crítico';
  if (deviation > warningThreshold) return 'Aviso';
  return 'Informativo';
}

function buildAlert({ batchId, measurementId, type, message }) {
  return {
    id: alerts.length + 1,
    batchId,
    measurementId,
    type,
    message,
    status: 'pendente',
    resolution: null,
    justification: null,
    resolvedAt: null,
    resolvedBy: null,
  };
}

function create(req, res) {
  const { batchId, temperature, humidity, luminosity } = req.body || {};

  if (!isPositiveInteger(batchId)) {
    return res.status(400).json({ error: 'batchId deve ser um inteiro positivo' });
  }
  if (!isFiniteNumber(temperature)) {
    return res.status(400).json({ error: 'temperature deve ser um número finito' });
  }
  if (!isFiniteNumber(humidity)) {
    return res.status(400).json({ error: 'humidity deve ser um número finito' });
  }
  if (!isFiniteNumber(luminosity)) {
    return res.status(400).json({ error: 'luminosity deve ser um número finito' });
  }

  const batch = batches.find(b => b.id === batchId);
  if (!batch) {
    return res.status(404).json({ error: 'Lote não encontrado para a medição' });
  }

  const plan = plans.find(p => p.id === batch.planId);
  if (!plan) {
    return res.status(422).json({ error: 'Lote sem plano associado; não é possível avaliar limites ambientais' });
  }

  const newMeasurement = {
    id: measurements.length + 1,
    batchId,
    temperature,
    humidity,
    luminosity,
    timestamp: new Date().toISOString(),
    measuredBy: getUserId(req),
  };
  measurements.push(newMeasurement);

  const generatedAlerts = [];

  if (temperature < plan.temperature.min || temperature > plan.temperature.max) {
    const type = classifyDeviation(temperature, plan.temperature.min, plan.temperature.max, 2, 5);
    const alert = buildAlert({
      batchId,
      measurementId: newMeasurement.id,
      type,
      message: `Temperatura fora dos limites: ${temperature}°C (limite: [${plan.temperature.min}, ${plan.temperature.max}])`,
    });
    alerts.push(alert);
    generatedAlerts.push(alert);
  }

  if (humidity < plan.humidity.min || humidity > plan.humidity.max) {
    const type = classifyDeviation(humidity, plan.humidity.min, plan.humidity.max, 5, 10);
    const alert = buildAlert({
      batchId,
      measurementId: newMeasurement.id,
      type,
      message: `Humidade fora dos limites: ${humidity}% (limite: [${plan.humidity.min}, ${plan.humidity.max}])`,
    });
    alerts.push(alert);
    generatedAlerts.push(alert);
  }

  if (luminosity < plan.luminosity.min || luminosity > plan.luminosity.max) {
    const type = classifyDeviation(luminosity, plan.luminosity.min, plan.luminosity.max, 500, 2000);
    const alert = buildAlert({
      batchId,
      measurementId: newMeasurement.id,
      type,
      message: `Luminosidade fora dos limites: ${luminosity} lux (limite: [${plan.luminosity.min}, ${plan.luminosity.max}])`,
    });
    alerts.push(alert);
    generatedAlerts.push(alert);
  }

  audit(req, 'CREATE_MEASUREMENT', 'POST /measurements', {
    measurementId: newMeasurement.id,
    batchId,
    alertsGenerated: generatedAlerts.length,
  });

  return res.status(201).json({ measurement: newMeasurement, alertsGenerated: generatedAlerts });
}

module.exports = { getAll, getById, create, classifyDeviation };
