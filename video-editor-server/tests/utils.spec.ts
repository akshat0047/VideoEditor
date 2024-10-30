import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { getVideoDuration, createThumbnail, getVideoMetadata, checkCompatibility } from '../src/utils/utils'; // Adjust path accordingly

// Define the mock structure for ffmpeg
// Define the mock structure for ffmpeg
interface MockFfmpegInstance {
    on: (event: string, callback: Function) => MockFfmpegInstance; // specify the method signature
    screenshots: jest.Mock;
}

interface MockFfmpeg {
    (input: string): MockFfmpegInstance;
    ffprobe: jest.Mock;
    setFfmpegPath: jest.Mock;
}

// Mock ffmpeg and its methods
jest.mock('fluent-ffmpeg', () => {
    const mockFfmpegInstance: MockFfmpegInstance = {
        on: function (this: MockFfmpegInstance, event: string, callback: Function) {
            // Simulate chaining
            if (event === 'end') {
                setTimeout(() => callback(), 0);
            }
            return this;
        },
        screenshots: jest.fn().mockReturnThis(),
    };
    
    const mockFfmpeg: MockFfmpeg = jest.fn(() => mockFfmpegInstance) as any;
    mockFfmpeg.ffprobe = jest.fn(); 
    mockFfmpeg.setFfmpegPath = jest.fn();
    return mockFfmpeg;
});

describe('Video Utilities', () => {

    describe('getVideoDuration', () => {
        it('should return video duration when ffprobe succeeds', async () => {
            const testFilePath = 'test-video.mp4';
            const mockDuration = 120;

            (ffmpeg.ffprobe as jest.Mock).mockImplementation((_, callback) => {
                callback(null, { format: { duration: mockDuration } });
            });

            await expect(getVideoDuration(testFilePath)).resolves.toBe(mockDuration);
        });

        it('should reject if ffprobe encounters an error', async () => {
            const testFilePath = 'test-video.mp4';
            const errorMessage = 'ffprobe error';

            (ffmpeg.ffprobe as jest.Mock).mockImplementation((_, callback) => {
                callback(new Error(errorMessage), null);
            });

            await expect(getVideoDuration(testFilePath)).rejects.toThrow(errorMessage);
        });
    });

    describe('createThumbnail', () => {
        const testFilePath = 'test-video.mp4';
        const mockThumbnailFilename = 'thumbnail.png';
        const uploadsDir = path.join(__dirname, '../../uploads');

        it('should create a thumbnail successfully', async () => {
            await createThumbnail(testFilePath, mockThumbnailFilename);
            expect(ffmpeg(testFilePath).screenshots).toHaveBeenCalledWith({
                count: 1,
                folder: uploadsDir,
                filename: path.basename(mockThumbnailFilename),
                size: '320x240',
            });
        });
    });

    describe('getVideoMetadata', () => {
        it('should return metadata when ffprobe succeeds', async () => {
            const testFilePath = 'test-video.mp4';
            const mockMetadata = { streams: [{ codec_name: 'h264' }], format: { duration: 60 } };

            (ffmpeg.ffprobe as jest.Mock).mockImplementation((_, callback) => {
                callback(null, mockMetadata);
            });

            await expect(getVideoMetadata(testFilePath)).resolves.toEqual(mockMetadata);
        });

        it('should reject if ffprobe encounters an error', async () => {
            const testFilePath = 'test-video.mp4';
            const errorMessage = 'ffprobe error';

            (ffmpeg.ffprobe as jest.Mock).mockImplementation((_, callback) => {
                callback(new Error(errorMessage), null);
            });

            await expect(getVideoMetadata(testFilePath)).rejects.toThrow(errorMessage);
        });
    });

    describe('checkCompatibility', () => {
        it('should return true if all videos have the same codec and resolution', () => {
            const metadataArray = [
                { streams: [{ codec_name: 'h264', width: 1280, height: 720 }] },
                { streams: [{ codec_name: 'h264', width: 1280, height: 720 }] },
            ];

            expect(checkCompatibility(metadataArray)).toBe(true);
        });

        it('should return false if videos have different codecs', () => {
            const metadataArray = [
                { streams: [{ codec_name: 'h264', width: 1280, height: 720 }] },
                { streams: [{ codec_name: 'vp9', width: 1280, height: 720 }] },
            ];

            expect(checkCompatibility(metadataArray)).toBe(false);
        });

        it('should return false if videos have different resolutions', () => {
            const metadataArray = [
                { streams: [{ codec_name: 'h264', width: 1280, height: 720 }] },
                { streams: [{ codec_name: 'h264', width: 1920, height: 1080 }] },
            ];

            expect(checkCompatibility(metadataArray)).toBe(false);
        });

        it('should return false for an empty metadata array', () => {
            expect(checkCompatibility([])).toBe(false);
        });
    });
});
