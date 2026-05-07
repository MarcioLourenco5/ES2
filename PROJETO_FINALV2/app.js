const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const app = express();
app.use(express.json());

// Swagger UI disponível em /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'GREENHERB API Docs',
}));

// Rotas
app.use('/auth', require('./src/routes/auth.routes'));
app.use('/users', require('./src/routes/users.routes'));
app.use('/herbs', require('./src/routes/herbs.routes'));
app.use('/plans', require('./src/routes/plans.routes'));
app.use('/batches', require('./src/routes/batches.routes'));
app.use('/tasks', require('./src/routes/tasks.routes'));
app.use('/measurements', require('./src/routes/measurements.routes'));
app.use('/alerts', require('./src/routes/alerts.routes'));
app.use('/automation', require('./src/routes/automation.routes'));
app.use('/reports', require('./src/routes/reports.routes'));
app.use('/audit', require('./src/routes/audit.routes'));

// Handler 404
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint não encontrado: ${req.method} ${req.path}` });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`GREENHERB API a correr em http://localhost:${PORT}`);
    console.log(`Swagger UI disponível em http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
