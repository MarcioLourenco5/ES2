const router = require('express').Router();
const c = require('../controllers/alerts.controller');
const { requireAuth, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Alertas Informativos, Avisos e Críticos
 */

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Lista todos os alertas
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de alertas
 */
router.get('/', requireAuth, c.getAll);

/**
 * @swagger
 * /alerts/{id}:
 *   get:
 *     summary: Obtém alerta por ID
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Alerta encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', requireAuth, c.getById);

/**
 * @swagger
 * /alerts/{id}/resolve:
 *   patch:
 *     summary: Resolve alerta (justificação opcional)
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               justification: { type: string }
 *     responses:
 *       200:
 *         description: Alerta resolvido
 *       404:
 *         description: Não encontrado
 *       422:
 *         description: Alerta já processado
 */
router.patch('/:id/resolve', requireAuth, authorize('Responsável', 'Administrador'), c.resolve);

/**
 * @swagger
 * /alerts/{id}/ignore:
 *   patch:
 *     summary: Ignora alerta (justificação obrigatória, 10–500 caracteres)
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [justification]
 *             properties:
 *               justification: { type: string, minLength: 10, maxLength: 500 }
 *     responses:
 *       200:
 *         description: Alerta ignorado
 *       404:
 *         description: Não encontrado
 *       422:
 *         description: Justificação em falta/fora dos limites ou alerta já processado
 */
router.patch('/:id/ignore', requireAuth, authorize('Responsável', 'Administrador'), c.ignore);

module.exports = router;
