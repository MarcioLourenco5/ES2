const router = require('express').Router();
const { login, refresh, me } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e gestão de tokens JWT
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticação de utilizador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: admin
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Admin@1234
 *     responses:
 *       200:
 *         description: Login bem-sucedido — token e refreshToken retornados
 *       400:
 *         description: Dados inválidos (código USERNAME_REQUIRED / USERNAME_INVALID / PASSWORD_REQUIRED / PASSWORD_INVALID)
 *       401:
 *         description: Credenciais inválidas (CREDENTIALS_INVALID)
 *       403:
 *         description: Utilizador inativo (USER_INACTIVE)
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovação de token de acesso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Novo token emitido
 *       400:
 *         description: refreshToken não fornecido
 *       401:
 *         description: Token inválido ou expirado
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna os dados do utilizador autenticado
 *     description: |
 *       Lê os dados frescos do utilizador a partir do store (não do payload do JWT).
 *       Útil para validar o token e obter o role/email actualizados.
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dados do utilizador autenticado (sem passwordHash)
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Utilizador não encontrado no sistema
 */
router.get('/me', requireAuth, me);

module.exports = router;
