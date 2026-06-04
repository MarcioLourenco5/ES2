const router = require('express').Router();
const c = require('../controllers/tasks.controller');
const { requireAuth, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Tarefas operacionais (rega, fertilização, colheita, monitorização)
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Lista todas as tarefas
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de tarefas
 */
router.get('/', requireAuth, c.getAll);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Obtém tarefa por ID
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tarefa encontrada
 *       404:
 *         description: Não encontrada
 */
router.get('/:id', requireAuth, c.getById);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Cria nova tarefa operacional
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [batchId, type, scheduledDate]
 *             properties:
 *               batchId: { type: integer }
 *               type: { type: string, enum: [rega, fertilização, colheita, monitorização] }
 *               scheduledDate: { type: string, format: date }
 *               assignedTo: { type: integer }
 *     responses:
 *       201:
 *         description: Tarefa criada
 *       400:
 *         description: Dados inválidos
 */
router.post('/', requireAuth, authorize('Técnico', 'Responsável', 'Administrador'), c.create);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Atualiza estado de tarefa
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Não encontrada
 */
router.patch('/:id', requireAuth, authorize('Técnico', 'Responsável', 'Administrador'), c.update);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Remove tarefa
 *     tags: [Tasks]
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
router.delete('/:id', requireAuth, authorize('Responsável', 'Administrador'), c.remove);

module.exports = router;
