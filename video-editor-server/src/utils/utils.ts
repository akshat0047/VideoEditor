import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegPath);

// Function to check video duration
export const getVideoDuration = (filePath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            resolve(metadata.format.duration);
        });
    });
};

// Create a thumbnail
export const createThumbnail = async (filePath, thumbnailFilename) => {
    const uploadsDir = path.join(__dirname, '../../../uploads');

    await new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .on('end', () => {
                console.log('Thumbnail created successfully.');
                resolve(true);
            })
            .on('error', (err) => {
                console.error('Error creating thumbnail:', err);
                reject(err);
            })
            .screenshots({
                count: 1,
                folder: uploadsDir,
                filename: path.basename(thumbnailFilename),
                size: '320x240' // Set the size of the thumbnail
            });
    });
}

export async function getVideoMetadata(videoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            resolve(metadata);
        });
    });
}

// Helper function to check compatibility
export const checkCompatibility = (metadataArray: any[]): boolean => {
    if (metadataArray.length === 0) return false;
    try {
        const firstVideoMetadata = metadataArray[0];

        // Check if codecs, resolution, and other parameters match
        for (const metadata of metadataArray) {
            const firstStream = firstVideoMetadata.streams[0]; // Assuming video stream is first
            const currentStream = metadata.streams[0];

            // Check codec
            if (firstStream.codec_name !== currentStream.codec_name) {
                return false;
            }

            // Check resolution
            if (firstStream.width !== currentStream.width || firstStream.height !== currentStream.height) {
                return false;
            }

        }

        return true; 
    } catch (error) {
        console.error('Error checking compatibility:', error);
        return false;
    }
};