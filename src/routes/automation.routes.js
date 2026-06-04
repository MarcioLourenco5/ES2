const router = require('express').Router();
const c = require('../controllers/automation.controller');
const { requireAuth, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Automation
 *   description: Regras de automação e comutação Manual/Automático
 */

/**
 * @swagger
 * /automation:
 *   get:
 *     summary: Lista todas as regras de automação
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de regras
 */
router.get('/', requireAuth, c.getAll);

/**
 * @swagger
 * /automation/{id}:
 *   get:
 *     summary: Obtém regra por ID
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Regra encontrada
 *       404:
 *         description: Não encontrada
 */
router.get('/:id', requireAuth, c.getById);

/**
 * @swagger
 * /automation:
 *   post:
 *     summary: Cria nova regra de automação
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, trigger, action, mode]
 *             properties:
 *               name: { type: string }
 *               trigger: { type: string }
 *               action: { type: string }
 *               mode: { type: string, enum: [Manual, Automático] }
 *     responses:
 *       201:
 *         description: Regra criada
 *       400:
 *         description: Dados inválidos
 */
router.post('/', requireAuth, authorize('Responsável', 'Administrador'), c.create);

/**
 * @swagger
 * /automation/{id}:
 *   put:
 *     summary: Atualiza regra de automação
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Regra atualizada
 *       404:
 *         description: Não encontrada
 */
router.put('/:id', requireAuth, authorize('Responsável', 'Administrador'), c.update);

/**
 * @swagger
 * /automation/{id}:
 *   delete:
 *     summary: Remove regra de automação
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Removida
 *       404:
 *         description: Não encontrada
 */
router.delete('/:id', requireAuth, authorize('Administrador'), c.remove);

/**
 * @swagger
 * /automation/{id}/mode:
 *   patch:
 *     summary: Comuta entre modo Manual e Automático
 *     tags: [Automation]
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
 *             required: [mode]
 *             properties:
 *               mode: { type: string, enum: [Manual, Automático] }
 *     responses:
 *       200:
 *         description: Modo alterado
 *       400:
 *         description: Modo inválido
 *       404:
 *         description: Não encontrada
 */
router.patch('/:id/mode', requireAuth, authorize('Responsável', 'Administrador'), c.setMode);

module.exports = router;
