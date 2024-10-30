// __tests__/videoProcessing.test.ts
import ffmpeg from 'fluent-ffmpeg';
import { getVideoDuration, createThumbnail, getVideoMetadata, checkCompatibility } from '../src/utils/utils';

jest.mock('fluent-ffmpeg', () => {
    const mockFfmpeg = {
        ffprobe: jest.fn(),
        screenshots: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
    };
    return jest.fn(() => mockFfmpeg);
});

describe('Video Processing Utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getVideoDuration', () => {
        it('should return video duration', async () => {
            const mockDuration = 120; // Mock duration of 120 seconds
            ffmpeg().ffprobe.mockImplementation((filePath, callback) => {
                callback(null, { format: { duration: mockDuration } });
            });

            const duration = await getVideoDuration('mock/path/to/video.mp4');
            expect(duration).toBe(mockDuration);
        });

        it('should handle errors', async () => {
            ffmpeg().ffprobe.mockImplementation((filePath, callback) => {
                callback(new Error('Error retrieving duration'), null);
            });

            await expect(getVideoDuration('mock/path/to/video.mp4')).rejects.toThrow('Error retrieving duration');
        });
    });

    describe('createThumbnail', () => {
        it('should create a thumbnail successfully', async () => {
            const mockFfmpeg = ffmpeg(); // Create a mock ffmpeg instance
            mockFfmpeg.on.mockImplementation((event, callback) => {
                if (event === 'end') {
                    callback(); // Trigger the end event
                }
                return mockFfmpeg; // Return the mock ffmpeg instance
            });

            const result = await createThumbnail('mock/path/to/video.mp4', 'thumbnail.png');
            expect(result).toBe(true);
            expect(mockFfmpeg.screenshots).toHaveBeenCalled();
        });

        it('should handle errors when creating a thumbnail', async () => {
            const mockFfmpeg = ffmpeg(); // Create a mock ffmpeg instance
            mockFfmpeg.on.mockImplementation((event, callback) => {
                if (event === 'error') {
                    callback(new Error('Error creating thumbnail')); // Trigger the error event
                }
                return mockFfmpeg; // Return the mock ffmpeg instance
            });

            await expect(createThumbnail('mock/path/to/video.mp4', 'thumbnail.png')).rejects.toThrow('Error creating thumbnail');
        });
    });

    describe('getVideoMetadata', () => {
        it('should return video metadata', async () => {
            const mockMetadata = { title: 'Test Video' };
            ffmpeg().ffprobe.mockImplementation((videoPath, callback) => {
                callback(null, mockMetadata);
            });

            const metadata = await getVideoMetadata('mock/path/to/video.mp4');
            expect(metadata).toEqual(mockMetadata);
        });

        it('should handle errors', async () => {
            ffmpeg().ffprobe.mockImplementation((videoPath, callback) => {
                callback(new Error('Error retrieving metadata'), null);
            });

            await expect(getVideoMetadata('mock/path/to/video.mp4')).rejects.toThrow('Error retrieving metadata');
        });
    });

    describe('checkCompatibility', () => {
        it('should return true for compatible videos', () => {
            const metadataArray = [
                {
                    streams: [{ codec_name: 'h264', width: 1920, height: 1080 }]
                },
                {
                    streams: [{ codec_name: 'h264', width: 1920, height: 1080 }]
                }
            ];

            const isCompatible = checkCompatibility(metadataArray);
            expect(isCompatible).toBe(true);
        });

        it('should return false for incompatible videos', () => {
            const metadataArray = [
                {
                    streams: [{ codec_name: 'h264', width: 1920, height: 1080 }]
                },
                {
                    streams: [{ codec_name: 'hevc', width: 1920, height: 1080 }]
                }
            ];

            const isCompatible = checkCompatibility(metadataArray);
            expect(isCompatible).toBe(false);
        });

        it('should return false if no metadata is provided', () => {
            const isCompatible = checkCompatibility([]);
            expect(isCompatible).toBe(false);
        });

        it('should handle errors gracefully', () => {
            const faultyMetadataArray = [
                {
                    streams: null // Simulate missing streams
                }
            ];

            const isCompatible = checkCompatibility(faultyMetadataArray);
            expect(isCompatible).toBe(false);
        });
    });
});
