const { measurements, alerts, batches, plans } = require('../data/mockData');

function getAll(req, res) {
  return res.json(measurements);
}

function getById(req, res) {
  const m = measurements.find(m => m.id === parseInt(req.params.id));
  if (!m) return res.status(404).json({ error: 'Medição não encontrada' });
  return res.json(m);
}

function create(req, res) {
  const { batchId, temperature, humidity, luminosity } = req.body || {};
  if (!batchId || temperature === undefined || humidity === undefined || luminosity === undefined) {
    return res.status(400).json({ error: 'batchId, temperature, humidity e luminosity são obrigatórios' });
  }

  const newMeasurement = {
    id: measurements.length + 1,
    batchId,
    temperature,
    humidity,
    luminosity,
    timestamp: new Date().toISOString(),
    measuredBy: req.user ? req.user.id : null,
  };
  measurements.push(newMeasurement);

  // Geração automática de alertas com base nos limites do plano
  const batch = batches.find(b => b.id === parseInt(batchId));
  if (batch) {
    const plan = plans.find(p => p.id === batch.planId);
    if (plan) {
      const generatedAlerts = [];

      if (temperature < plan.temperature.min || temperature > plan.temperature.max) {
        const deviation = Math.abs(temperature - (temperature < plan.temperature.min ? plan.temperature.min : plan.temperature.max));
        const type = deviation > 5 ? 'Crítico' : deviation > 2 ? 'Aviso' : 'Informativo';
        const alert = {
          id: alerts.length + 1,
          batchId,
          measurementId: newMeasurement.id,
          type,
          message: `Temperatura fora dos limites: ${temperature}°C (limite: [${plan.temperature.min}, ${plan.temperature.max}])`,
          status: 'pendente',
          resolution: null,
          justification: null,
          resolvedAt: null,
          resolvedBy: null,
        };
        alerts.push(alert);
        generatedAlerts.push(alert);
      }

      if (humidity < plan.humidity.min || humidity > plan.humidity.max) {
        const deviation = Math.abs(humidity - (humidity < plan.humidity.min ? plan.humidity.min : plan.humidity.max));
        const type = deviation > 10 ? 'Crítico' : deviation > 5 ? 'Aviso' : 'Informativo';
        const alert = {
          id: alerts.length + 1,
          batchId,
          measurementId: newMeasurement.id,
          type,
          message: `Humidade fora dos limites: ${humidity}% (limite: [${plan.humidity.min}, ${plan.humidity.max}])`,
          status: 'pendente',
          resolution: null,
          justification: null,
          resolvedAt: null,
          resolvedBy: null,
        };
        alerts.push(alert);
        generatedAlerts.push(alert);
      }

      return res.status(201).json({ measurement: newMeasurement, alertsGenerated: generatedAlerts });
    }
  }

  return res.status(201).json({ measurement: newMeasurement, alertsGenerated: [] });
}

module.exports = { getAll, getById, create };
