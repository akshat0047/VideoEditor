import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import dao from './src/repositories/dao';
import videosRoutes from './src/routes/videos.routes';
import linksRoutes from './src/routes/links.routes';
import mediaRoutes from './src/routes/media.route';
import { swaggerUi, swaggerDocs } from './src/swagger';
import { authenticateToken } from './src/middleware/authMiddleware';
dotenv.config();

const port = process.env.PORT;
export const app = express();

// Define the path to the uploads folder
export const MEDIA_FOLDER = "uploads"
export const uploadsPath = path.join(__dirname, `../${MEDIA_FOLDER}`);

export const SECRET_KEY = process.env.SECRET_KEY || 'akshat0047';

// Serve the uploads folder statically
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// app.use(authenticateToken);
app.use(express.json())

//  Script to setup sqlite DB in memory //
dao.teardownDb();
dao.setupDbForDev();
////////////////////////////////////

app.use('/api/v1/videos', videosRoutes);
app.use('/api/v1/links', linksRoutes);
app.use(mediaRoutes)

export const server = app.listen(port, () => console.log(`Videoverse Assignment listening on port ${port}!`));