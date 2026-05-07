const router = require('express').Router();
const c = require('../controllers/plans.controller');
const { requireAuth, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Planos de cultivo (regular, emergência, pontual)
 */

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Lista todos os planos de cultivo
 *     tags: [Plans]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de planos
 */
router.get('/', requireAuth, c.getAll);

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Obtém plano por ID
 *     tags: [Plans]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plano encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', requireAuth, c.getById);

/**
 * @swagger
 * /plans:
 *   post:
 *     summary: Cria novo plano de cultivo
 *     tags: [Plans]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [herbId, type, name]
 *             properties:
 *               herbId: { type: integer }
 *               type: { type: string, enum: [regular, emergência, pontual] }
 *               name: { type: string }
 *               temperature: { type: object, properties: { min: { type: number }, max: { type: number } } }
 *               humidity: { type: object, properties: { min: { type: number }, max: { type: number } } }
 *               luminosity: { type: object, properties: { min: { type: number }, max: { type: number } } }
 *               cycleDays: { type: integer, minimum: 1, maximum: 365 }
 *               authorizedBy: { type: integer, description: Obrigatório para plano pontual }
 *     responses:
 *       201:
 *         description: Plano criado
 *       400:
 *         description: Dados inválidos ou type inválido
 *       403:
 *         description: Plano pontual sem autorização
 */
router.post('/', requireAuth, authorize('Responsável', 'Administrador'), c.create);

/**
 * @swagger
 * /plans/{id}:
 *   put:
 *     summary: Atualiza plano de cultivo
 *     tags: [Plans]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plano atualizado
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', requireAuth, authorize('Responsável', 'Administrador'), c.update);

/**
 * @swagger
 * /plans/{id}:
 *   delete:
 *     summary: Remove plano de cultivo
 *     tags: [Plans]
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
router.delete('/:id', requireAuth, authorize('Administrador'), c.remove);

module.exports = router;
