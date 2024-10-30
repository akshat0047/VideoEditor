import request from 'supertest';
import { app } from '../../index';
import dao from '../../src/repositories/dao';

beforeAll(async () => {
    await dao.setupDbForDev(); // Ensure test database setup
});

afterAll(async () => {
    await dao.teardownDb(); // Clean up after tests
});

describe('VideoController E2E Tests', () => {
    it('should create a video record', async () => {
        const video = {
            fileName: 'sample.mp4',
            filePath: '/path/to/video',
            thumbnail: 'thumbnail.jpg',
        };

        const response = await request(app)
            .post('/api/v1/videos')
            .send(video);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Video saved successfully');
    });

    it('should fetch a video by ID', async () => {
        const videoId = 'test-video-id';
        
        await request(app)
            .post('/api/v1/videos')
            .send({
                id: videoId,
                fileName: 'sample.mp4',
                filePath: '/path/to/video',
                thumbnail: 'thumbnail.jpg',
            });

        const response = await request(app)
            .get(`/api/v1/videos/${videoId}`);

        expect(response.status).toBe(200);
        expect(response.body.video).toBeTruthy();
    });

    it('should delete a video by ID', async () => {
        const videoId = 'test-video-id';

        const response = await request(app)
            .delete(`/api/v1/videos/${videoId}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Video deleted successfully');
    });
});
