import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import dao from './src/repositories/dao';
import videosRoutes from './src/routes/videos.routes';
import linksRoutes from './src/routes/links.routes';
import { swaggerUi, swaggerDocs } from './src/swagger';
import { authenticateToken } from './src/middleware/authMiddleware';
dotenv.config();

const port = process.env.PORT;
export const app = express();

// Define the path to the uploads folder
const uploadsPath = path.join(__dirname, '../uploads'); // Adjust the relative path as needed

// Serve the uploads folder statically
app.use('/uploads', express.static(uploadsPath));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(authenticateToken);
app.use(express.json())

//  Script to setup sqlite DB in memory //
dao.teardownDb();
dao.setupDbForDev();
////////////////////////////////////

app.use('/api/v1/videos', videosRoutes);
app.use('/api/v1/links', linksRoutes);

export const server = app.listen(port, () => console.log(`Videoverse Assignment listening on port ${port}!`));