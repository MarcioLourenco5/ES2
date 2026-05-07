const router = require('express').Router();
const c = require('../controllers/batches.controller');
const { requireAuth, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Batches
 *   description: Lotes de cultivo
 */

/**
 * @swagger
 * /batches:
 *   get:
 *     summary: Lista todos os lotes
 *     tags: [Batches]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de lotes
 */
router.get('/', requireAuth, c.getAll);

/**
 * @swagger
 * /batches/{id}:
 *   get:
 *     summary: Obtém lote por ID
 *     tags: [Batches]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lote encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', requireAuth, c.getById);

/**
 * @swagger
 * /batches:
 *   post:
 *     summary: Cria novo lote de cultivo
 *     tags: [Batches]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId, herbId, quantity]
 *             properties:
 *               planId: { type: integer }
 *               herbId: { type: integer }
 *               quantity: { type: number }
 *     responses:
 *       201:
 *         description: Lote criado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Plano não encontrado
 */
router.post('/', requireAuth, c.create);

/**
 * @swagger
 * /batches/{id}:
 *   put:
 *     summary: Atualiza lote (ex. mudança de estado)
 *     tags: [Batches]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lote atualizado
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', requireAuth, c.update);

/**
 * @swagger
 * /batches/{id}:
 *   delete:
 *     summary: Remove lote
 *     tags: [Batches]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Removido
 *       404:
 *         description: Não encontrado
 */
router.delete('/:id', requireAuth, authorize('Responsável', 'Administrador'), c.remove);

/**
 * @swagger
 * /batches/{id}/apply-plan:
 *   post:
 *     summary: Aplica plano de cultivo ao lote
 *     tags: [Batches]
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
 *             required: [planId]
 *             properties:
 *               planId: { type: integer }
 *     responses:
 *       200:
 *         description: Plano aplicado
 *       403:
 *         description: Plano pontual sem autorização
 *       404:
 *         description: Lote ou plano não encontrado
 */
router.post('/:id/apply-plan', requireAuth, c.applyPlan);

/**
 * @swagger
 * /batches/{id}/losses:
 *   patch:
 *     summary: Regista perdas no lote
 *     tags: [Batches]
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
 *             required: [losses]
 *             properties:
 *               losses: { type: number, minimum: 0 }
 *     responses:
 *       200:
 *         description: Perdas registadas
 *       400:
 *         description: Valor inválido
 *       404:
 *         description: Lote não encontrado
 */
router.patch('/:id/losses', requireAuth, c.registerLoss);

/**
 * @swagger
 * /batches/{id}/productivity:
 *   get:
 *     summary: Calcula produtividade do lote
 *     tags: [Batches]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Produtividade calculada
 *       422:
 *         description: Lote não concluído
 *       404:
 *         description: Não encontrado
 */
router.get('/:id/productivity', requireAuth, c.calculateProductivity);

module.exports = router;
