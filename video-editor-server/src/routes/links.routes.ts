import * as express from 'express';
import linksController from '../controllers/links.controller';
const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Link:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           readOnly: true
 *           description: Unique identifier for the link
 *         videoId:
 *           type: string
 *           description: Unique identifier for the video
 *         temporaryLink:
 *           type: string
 *           readOnly: true
 *           description: Temporary link to share video
 *         expiryTime:
 *           type: string
 *           description: Expiry time for the generated link
 *       required:
 *         - id
 *         - videoId
 *         - temporaryLink
 *         - expiryTime
 */

/**
 * @swagger
 * /api/v1/links/{id}:
 *   get:
 *     tags:
 *     - Link Management
 *     summary: Retrieve a link by video_id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier for the video
 *     responses:
 *       200:
 *         description: Link retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Link'
 *       404:
 *         description: Link not found
 */
router.get('/:id', linksController.getLinkByVideo);

/**
 * @swagger
 * /api/v1/links/create:
 *   post:
 *     tags:
 *      - Link Management
 *     summary: Create a new Link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Link'
 *     responses:
 *       201:
 *         description: Link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Link'
 */
router.post('/create', linksController.createLink);

/**
 * @swagger
 * /api/v1/links/sync:
 *   delete:
 *     tags:
 *      - Link Management
 *     summary: Delete all expired links
 *     responses:
 *       200:
 *         description: Links deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Link'
 */
router.delete('/sync', linksController.syncExpiredLinks);

export default router