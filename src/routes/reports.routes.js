const router = require('express').Router();
const c = require('../controllers/reports.controller');
const { requireAuth, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Exportação de relatórios em CSV ou Excel
 */

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Lista relatórios gerados
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de relatórios
 */
router.get('/', requireAuth, c.getAll);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Obtém relatório por ID
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Relatório encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', requireAuth, c.getById);

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Gera novo relatório
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, format]
 *             properties:
 *               type: { type: string, enum: [batch_summary, measurements, audit] }
 *               format: { type: string, enum: [CSV, Excel] }
 *               batchId: { type: integer }
 *     responses:
 *       201:
 *         description: Relatório gerado
 *       400:
 *         description: Dados inválidos
 */
router.post('/', requireAuth, authorize('Responsável', 'Administrador'), c.generate);

/**
 * @swagger
 * /reports/{id}/export:
 *   get:
 *     summary: Exporta ficheiro do relatório (CSV ou Excel)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ficheiro exportado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id/export', requireAuth, c.exportReport);

module.exports = router;
