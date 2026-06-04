const router = require('express').Router();
const c = require('../controllers/audit.controller');
const { requireAuth, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Logs de auditoria de operações relevantes
 */

/**
 * @swagger
 * /audit:
 *   get:
 *     summary: Lista logs de auditoria (apenas Administrador)
 *     tags: [Audit]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de registos de auditoria
 *       403:
 *         description: Acesso negado
 */
router.get('/', requireAuth, authorize('Administrador'), c.getAll);

/**
 * @swagger
 * /audit/{id}:
 *   get:
 *     summary: Obtém registo de auditoria por ID
 *     tags: [Audit]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Registo encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', requireAuth, authorize('Administrador'), c.getById);

module.exports = router;
