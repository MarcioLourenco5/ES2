const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('Admin@1234', SALT_ROUNDS),
    role: 'Administrador',
    email: 'admin@greenherb.pt',
    active: true,
    createdAt: '2025-01-01',
  },
  {
    id: 2,
    username: 'responsavel',
    passwordHash: bcrypt.hashSync('Resp@1234', SALT_ROUNDS),
    role: 'Responsável',
    email: 'resp@greenherb.pt',
    active: true,
    createdAt: '2025-01-01',
  },
  {
    id: 3,
    username: 'tecnico',
    passwordHash: bcrypt.hashSync('Tech@1234', SALT_ROUNDS),
    role: 'Técnico',
    email: 'tec@greenherb.pt',
    active: true,
    createdAt: '2025-01-01',
  },
];

const herbs = [
  { id: 1, name: 'Manjericão', scientificName: 'Ocimum basilicum', description: 'Erva aromática mediterrânea', createdAt: '2025-01-01' },
  { id: 2, name: 'Hortelã', scientificName: 'Mentha spicata', description: 'Erva refrescante', createdAt: '2025-01-01' },
  { id: 3, name: 'Alecrim', scientificName: 'Rosmarinus officinalis', description: 'Erva aromática resistente', createdAt: '2025-01-01' },
];

const plans = [
  {
    id: 1,
    herbId: 1,
    type: 'regular',
    name: 'Plano Regular Manjericão',
    temperature: { min: 18, max: 28 },
    humidity: { min: 40, max: 80 },
    luminosity: { min: 5000, max: 25000 },
    cycleDays: 90,
    status: 'ativo',
    createdBy: 2,
    authorizedBy: null,
    createdAt: '2025-01-01',
  },
];

const batches = [
  {
    id: 1,
    planId: 1,
    herbId: 1,
    status: 'ativo',
    quantity: 100,
    losses: 0,
    productivity: null,
    startDate: '2025-01-01',
    endDate: null,
    createdBy: 3,
  },
];

const tasks = [
  { id: 1, batchId: 1, type: 'rega', status: 'pendente', scheduledDate: '2025-01-02', assignedTo: 3 },
  { id: 2, batchId: 1, type: 'fertilização', status: 'pendente', scheduledDate: '2025-01-05', assignedTo: 3 },
];

const measurements = [
  { id: 1, batchId: 1, temperature: 22, humidity: 65, luminosity: 15000, timestamp: '2025-01-01T10:00:00Z', measuredBy: 3 },
];

const alerts = [
  {
    id: 1,
    batchId: 1,
    measurementId: null,
    type: 'Informativo',
    message: 'Temperatura ligeiramente elevada',
    status: 'pendente',
    resolution: null,
    justification: null,
    resolvedAt: null,
    resolvedBy: null,
  },
];

const automationRules = [
  { id: 1, name: 'Rega automática', trigger: 'humidity < 40', action: 'rega', mode: 'Automático', active: true, createdBy: 2 },
];

const reports = [
  { id: 1, type: 'batch_summary', format: 'CSV', generatedAt: '2025-01-01', generatedBy: 1, batchId: 1 },
];

const auditLogs = [
  { id: 1, userId: 1, action: 'login', resource: 'POST /auth/login', timestamp: '2025-01-01T08:00:00Z', details: {} },
];

module.exports = { users, herbs, plans, batches, tasks, measurements, alerts, automationRules, reports, auditLogs };
