import * as express from 'express';
import videoController from '../controllers/videos.controller';
const router = express.Router()

// To validate and serve media
router.get("/media/:fileName", videoController.getMedia);

export default router;