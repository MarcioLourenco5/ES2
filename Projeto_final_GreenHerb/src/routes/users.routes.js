const router = require('express').Router();
const c = require('../controllers/users.controller');
const { requireAuth, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestão de utilizadores e perfis
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os utilizadores
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de utilizadores (sem password)
 *       401:
 *         description: Não autenticado
 */
router.get('/', requireAuth, c.getAll);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtém utilizador por ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Utilizador encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', requireAuth, c.getById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria novo utilizador (apenas Administrador)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, role]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [Técnico, Responsável, Administrador] }
 *               email: { type: string }
 *     responses:
 *       201:
 *         description: Utilizador criado
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 *       409:
 *         description: Username já existe
 */
router.post('/', requireAuth, authorize('Administrador'), c.create);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza utilizador (apenas Administrador)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Utilizador atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', requireAuth, authorize('Administrador'), c.update);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove utilizador (apenas Administrador)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Removido com sucesso
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Não encontrado
 */
router.delete('/:id', requireAuth, authorize('Administrador'), c.remove);

module.exports = router;
