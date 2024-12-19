import repo from '../repositories/video.repository';
import { Request, Response } from 'express'
import Video from '../models/video';
import fs from 'fs';
import { unlink } from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import crypto from 'crypto';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { checkCompatibility, createThumbnail, getVideoDuration, getVideoMetadata } from '../utils/utils';
import { IVideo } from '../interfaces/interfaces';
import { SECRET_KEY, uploadsPath } from '../../index';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

export default class VideoController {

    static get MAX_SIZE_MB() {
        return parseInt(process.env.MAX_SIZE_MB || '20', 10) * 1024 * 1024;
    }

    static get MAX_DURATION_SEC() {
        return parseInt(process.env.MAX_DURATION_SEC || '20', 10);
    }

    static async getMedia(req: Request, res: Response) {
        const { fileName } = req.params;
        const { expiry, signature } = req.query;
    
        // Validate presence of required query params
        if (!expiry || !signature) {
            return res.status(400).json({ message: 'Invalid or missing URL parameters' });
        }
    
        // Check if the link has expired
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (currentTimestamp > Number(expiry)) {
            return res.status(403).json({ message: 'Link has expired' });
        }
    
        // Validate the signature
        const data = `${fileName}.${expiry}`;
        const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    
        if (signature !== expectedSignature) {
            return res.status(403).json({ message: 'Invalid signature. Access denied.' });
        }

        // Serve the requested file
        const filePath = path.join(uploadsPath, fileName);
        console.log("filepath", filePath);

        // Handle client abort
        req.on('aborted', () => {
            console.log('Request aborted by the client');
        });

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Stream the file to the client
        const fileStream = fs.createReadStream(filePath);

        fileStream.on('error', (err) => {
            console.error('Error reading file:', err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error streaming file' });
            }
            fileStream.destroy(); // Clean up the stream
            return;
        });

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Pipe the file stream to the response
        fileStream.pipe(res);
    }

    static async getAllVideos(req: Request, res: Response, next: Function): Promise<void> {
        try {
            const videos: IVideo[] = await repo.getAllVideos();
            res.status(200).json(videos);
        } catch (error) {
            next(error);
        }
    }

    static async getVideoById(req: Request, res: Response, next: Function) {
        let video = await repo.getVideoById(req.params.id)
        if(!video){
            return res.status(404).json(video);
        }
        return res.status(200).json({ video });
    }

    static async uploadVideo(req: Request, res: Response, next: Function): Promise<Response> {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Validate the file size
            const fileSize = req.file?.size || 0; // Get the size in bytes
            console.log("fileSize =>", fileSize);
            console.log("allowedSize =>", VideoController.MAX_SIZE_MB);
            if (fileSize > VideoController.MAX_SIZE_MB) {
                return res.status(400).json({ message: `File size exceeds ${process.env.MAX_SIZE_MB || '20'} MB limit` });
            }

            const videoData = req.file.buffer; // Get video buffer from multer
            const originalFilename = req.file.originalname; // Get original filename
            const thumbnailFilename = `${path.basename(originalFilename, path.extname(originalFilename))}-thumbnail.jpg`;

            
            if (!fs.existsSync(uploadsPath)) {
                fs.mkdirSync(uploadsPath);
            }

            // Save the video to the uploads folder
            const filePath = path.join(uploadsPath, originalFilename);
            fs.writeFileSync(filePath, videoData);

            // Get video duration directly from buffer
            const duration = await getVideoDuration(filePath);
            console.log("fileDuration =>", duration);
            console.log("allowedDuration =>", VideoController.MAX_DURATION_SEC);
            if (duration > VideoController.MAX_DURATION_SEC) {
                await unlink(filePath); // Delete the file
                return res.status(400).json({ message: `Video duration exceeds ${VideoController.MAX_DURATION_SEC} seconds limit` });
            }

            // Create a thumbnail
            await createThumbnail(filePath, thumbnailFilename);

            // Create a Video object and save it in the database
            const video = new Video(originalFilename, thumbnailFilename);
            await repo.saveVideo(video); // Save video details to the database

            return res.status(201).json({ message: 'Video uploaded successfully', filename: originalFilename });
        } catch (error) {
            return res.status(500).json({ message: 'Error uploading video' });
        }
    }

    static async deleteVideo(req: Request, res: Response, next: Function) {
        try {
            const videoId = req.params.id; // Get video ID from request parameters
    
            // Fetch video details from the database using the video ID
            const video = await repo.getVideoById(videoId);
            if (!video) {
                return res.status(404).json({ message: 'Video not found' });
            }
    
            // Delete the video file from the uploads folder
            const filePath = path.join(uploadsPath, video.fileName); // Construct the file path
            await unlink(filePath); // Delete the file
    
            // Remove the video entry from the database
            await repo.deleteVideo(videoId); // Assuming you have a method for this
    
            return res.status(200).json({ message: 'Video deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting video' });
        }
    }

    static async trimVideo(req: Request, res: Response, next: Function) {
        const { videoId, start, duration } = req.body;

        try {
            // Fetch the original video path by ID from the database
            const trimVideo = await repo.getVideoById(videoId);
            const inputVideoPath = path.join(uploadsPath, trimVideo.fileName);
            if (!inputVideoPath || !fs.existsSync(inputVideoPath)) {
                return res.status(404).json({ message: 'Video file not found' });
            }

            // Define output path for trimmed video
            const outputFileName = `trim-${trimVideo.fileName}-${Date.now()}.mp4`;
            const outputFilePath = path.join(uploadsPath, outputFileName.slice(0,-3));

            return new Promise((resolve, reject) => {
                // Execute ffmpeg trim command
                ffmpeg(inputVideoPath)
                .setStartTime(start)
                .duration(duration)
                .output(outputFilePath)
                .on('end', async () => {
                    try {
                        // Save trim video object in the database
                        const thumbnailFilename = `${path.basename(outputFileName, path.extname(outputFileName))}-thumbnail.jpg`;
                        await createThumbnail(outputFilePath, thumbnailFilename);

                        const video = new Video(outputFileName, thumbnailFilename);
                        await repo.saveVideo(video); // Save video details to the database

                        res.status(200).json({
                            message: 'Trimmed video generated successfully',
                            trimmedVideoPath: outputFilePath,
                        });
                        resolve(null);
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', (err) => {
                    console.error('Error trimming video:', err);
                    res.status(500).json({ message: 'Error trimming video' });
                    reject(err);
                })
                .run();
            });
        } catch (error) {
            console.error('Error processing video trim:', error);
            return res.status(500).json({ message: 'Server error while trimming video' });
        }
    }

    static async mergeVideos(req: Request, res: Response) {
        const { videoIds } = req.body;

        try {
            if (!videoIds || !Array.isArray(videoIds) || videoIds.length < 2) {
                return res.status(400).json({ message: 'At least two video IDs are required for merging.' });
            }

            // Get the file paths from video IDs
            const videos = await Promise.all(videoIds.map(repo.getVideoById));
            const videoPaths = videos.map(obj => path.join(uploadsPath, obj.fileName));

            // Validate and ensure all files exist
            for (const videoPath of videoPaths) {
                if (!videoPath || !fs.existsSync(videoPath)) {
                return res.status(404).json({ message: `One or more video files could not be found.` });
                }
            }

            // Check if all videos are compatible
            const videoMetadata = await Promise.all(videoPaths.map(path => getVideoMetadata(path)));
            const isCompatible = checkCompatibility(videoMetadata);

            if (!isCompatible) {
                return res.status(400).json({ message: 'Selected videos are not compatible for merging.' });
            }

            // Create a temporary file list for ffmpeg
            const tempFilePath = path.join(__dirname, '../../../uploads', `videoList-${Date.now()}.txt`);
            const fileContent = videoPaths.map(filePath => `file '${filePath}'`).join('\n');
            fs.writeFileSync(tempFilePath, fileContent);

            // Define output path
            const outputFileName = `merged-${Date.now()}.mp4`;
            const outputFilePath = path.join(__dirname, '../../../uploads', `merged-${Date.now()}.mp4`);

            // Merge videos using ffmpeg concat protocol
            ffmpeg()
                .input(tempFilePath)
                .inputOptions(['-f', 'concat', '-safe', '0'])
                .outputOptions('-c', 'copy') // Copy codec for fast concatenation without re-encoding
                .on('end', async () => {
                // fs.unlinkSync(tempFilePath); // Clean up temp file

                const thumbnailFilename = `${path.basename(outputFileName, path.extname(outputFileName))}-thumbnail.jpg`;
                await createThumbnail(outputFilePath, thumbnailFilename);

                const video = new Video(outputFileName, thumbnailFilename);
                await repo.saveVideo(video); // Save video details to the database

                return res.status(200).json({
                    message: 'Merged video generated successfully',
                    mergedVideoPath: outputFilePath,
                });
                })
                .on('error', (err) => {
                console.error('Error merging videos:', err);
                fs.unlinkSync(tempFilePath); // Clean up temp file
                return res.status(500).json({ message: 'Error merging videos' });
                })
                .save(outputFilePath);

        } catch (error) {
            console.error('Server error while merging videos:', error);
            return res.status(500).json({ message: 'Server error while merging videos' });
        }
    }
}