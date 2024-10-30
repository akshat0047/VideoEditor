
import * as express from 'express';
import multer from 'multer';
import videosController from '../controllers/videos.controller';

const router = express.Router()
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the video
 *           format: uuid
 *           readOnly: true
 *         filename:
 *           type: string
 *           description: Name of the video file
 *         filepath:
 *           type: string
 *           description: Path where the video file is stored
 *         thumbnail:
 *           type: string
 *           description: Path of the video's thumbnail image
 *       required:
 *         - id
 *         - filename
 *         - filepath
 *         - thumbnail
 */

/**
 * @swagger
 * /api/v1/videos:
 *   get:
 *     tags:
 *     - Video Management
 *     summary: Retrieve a list of videos
 *     responses:
 *       200:
 *         description: A list of videos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 */
router.get("/", videosController.getAllVideos);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   get:
 *     tags:
 *     - Video Management
 *     summary: Retrieve a video by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier for the video
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 */
router.get("/:id", videosController.getVideoById)

/**
 * @swagger
 * /api/v1/videos:
 *   post:
 *     tags:
 *     - Video Management
 *     summary: Upload a new video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 */
router.post("/upload", upload.single('video'), videosController.uploadVideo);

/**
 * @swagger
 * /api/v1/videos/{id}:
 *   delete:
 *     tags:
 *     - Video Management
 *     summary: Delete a video by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier for the video
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 */
router.delete("/:id", videosController.deleteVideo)

/**
 * @swagger
 * /api/v1/videos/trim:
 *   post:
 *     tags:
 *     - Video Edit
 *     summary: Trim a video by given start and duration parameters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoId:
 *                 type: string
 *                 description: ID of the video to trim
 *               start:
 *                 type: string
 *                 description: Start time in seconds or in hh:mm:ss format
 *               duration:
 *                 type: string
 *                 description: Duration of the trimmed video in seconds
 *     responses:
 *       200:
 *         description: Trimmed video generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trimmedVideoPath:
 *                   type: string
 *       500:
 *         description: Error trimming video
 */
router.post('/trim', videosController.trimVideo);

/**
 * @swagger
 * /api/v1/videos/merge:
 *   post:
 *     tags:
 *     - Video Edit
 *     summary: Merge multiple videos by given array of video IDs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of video IDs to merge
 *     responses:
 *       200:
 *         description: Merged video generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 mergedVideoPath:
 *                   type: string
 *       400:
 *         description: Videos not compatible for merging
 *       500:
 *         description: Error merging videos
 */
router.post('/merge', videosController.mergeVideos);
   
export default router;