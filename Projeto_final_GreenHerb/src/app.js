const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const herbsRoutes = require('./routes/herbs.routes');
const plansRoutes = require('./routes/plans.routes');
const batchesRoutes = require('./routes/batches.routes');
const tasksRoutes = require('./routes/tasks.routes');
const measurementsRoutes = require('./routes/measurements.routes');
const alertsRoutes = require('./routes/alerts.routes');
const automationRoutes = require('./routes/automation.routes');
const reportsRoutes = require('./routes/reports.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'greenherb-api' }));
app.get('/swagger.json', (req, res) => res.status(200).json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/herbs', herbsRoutes);
app.use('/plans', plansRoutes);
app.use('/batches', batchesRoutes);
app.use('/tasks', tasksRoutes);
app.use('/measurements', measurementsRoutes);
app.use('/alerts', alertsRoutes);
app.use('/automation', automationRoutes);
app.use('/reports', reportsRoutes);
app.use('/audit', auditRoutes);

app.use((req, res) => res.status(404).json({ error: 'Endpoint não encontrado' }));

module.exports = app;
