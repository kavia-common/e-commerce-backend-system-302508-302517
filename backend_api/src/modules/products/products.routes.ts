import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as controller from './products.controller';
import { createProductSchema, productIdParamSchema, updateProductSchema } from './products.schemas';

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     description: Lists active products.
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', controller.list);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Product
 *       404:
 *         description: Not found
 */
router.get('/:id', validate(productIdParamSchema), controller.get);

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create product (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', requireAuth, requireRole(Role.ADMIN), validate(createProductSchema), controller.create);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', requireAuth, requireRole(Role.ADMIN), validate(updateProductSchema), controller.update);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:id', requireAuth, requireRole(Role.ADMIN), validate(productIdParamSchema), controller.remove);

export default router;
