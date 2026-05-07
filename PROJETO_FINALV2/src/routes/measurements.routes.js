const router = require('express').Router();
const c = require('../controllers/measurements.controller');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Measurements
 *   description: Medições ambientais (temperatura, humidade, luminosidade)
 */

/**
 * @swagger
 * /measurements:
 *   get:
 *     summary: Lista todas as medições
 *     tags: [Measurements]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de medições
 */
router.get('/', requireAuth, c.getAll);

/**
 * @swagger
 * /measurements/{id}:
 *   get:
 *     summary: Obtém medição por ID
 *     tags: [Measurements]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Medição encontrada
 *       404:
 *         description: Não encontrada
 */
router.get('/:id', requireAuth, c.getById);

/**
 * @swagger
 * /measurements:
 *   post:
 *     summary: Regista nova medição ambiental (gera alertas automaticamente se fora dos limites)
 *     tags: [Measurements]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [batchId, temperature, humidity, luminosity]
 *             properties:
 *               batchId: { type: integer }
 *               temperature: { type: number, description: "Temperatura em °C — limite aceitável [18, 28]" }
 *               humidity: { type: number, description: "Humidade relativa em % — limite aceitável [40, 80]" }
 *               luminosity: { type: number, description: "Luminosidade em lux — limite aceitável [5000, 25000]" }
 *     responses:
 *       201:
 *         description: Medição registada; alertsGenerated contém eventuais alertas criados
 *       400:
 *         description: Dados em falta
 */
router.post('/', requireAuth, c.create);

module.exports = router;
