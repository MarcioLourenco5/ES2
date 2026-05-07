const router = require('express').Router();
const c = require('../controllers/herbs.controller');
const { requireAuth, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Herbs
 *   description: Catálogo de ervas aromáticas
 */

/**
 * @swagger
 * /herbs:
 *   get:
 *     summary: Lista todas as ervas aromáticas
 *     tags: [Herbs]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de ervas
 */
router.get('/', requireAuth, c.getAll);

/**
 * @swagger
 * /herbs/{id}:
 *   get:
 *     summary: Obtém erva por ID
 *     tags: [Herbs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Erva encontrada
 *       404:
 *         description: Não encontrada
 */
router.get('/:id', requireAuth, c.getById);

/**
 * @swagger
 * /herbs:
 *   post:
 *     summary: Cria nova erva aromática
 *     tags: [Herbs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, scientificName]
 *             properties:
 *               name: { type: string }
 *               scientificName: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Erva criada
 *       400:
 *         description: Dados inválidos
 */
router.post('/', requireAuth, authorize('Responsável', 'Administrador'), c.create);

/**
 * @swagger
 * /herbs/import:
 *   post:
 *     summary: Importação de ervas aromáticas via CSV/Excel
 *     tags: [Herbs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data: { type: string, description: Conteúdo CSV em base64 ou texto }
 *     responses:
 *       200:
 *         description: Importação concluída com resumo
 *       400:
 *         description: Ficheiro não fornecido ou vazio
 */
router.post('/import', requireAuth, authorize('Administrador'), c.importCsv);

/**
 * @swagger
 * /herbs/{id}:
 *   put:
 *     summary: Atualiza erva aromática
 *     tags: [Herbs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Erva atualizada
 *       404:
 *         description: Não encontrada
 */
router.put('/:id', requireAuth, authorize('Responsável', 'Administrador'), c.update);

/**
 * @swagger
 * /herbs/{id}:
 *   delete:
 *     summary: Remove erva aromática
 *     tags: [Herbs]
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

module.exports = router;
