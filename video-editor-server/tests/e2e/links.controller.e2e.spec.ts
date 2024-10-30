import request from 'supertest';
import { app } from '../../index';
import dao from '../../src/repositories/dao';

beforeAll(async () => {
    await dao.setupDbForDev(); // Ensure test database setup
});

afterAll(async () => {
    await dao.teardownDb(); // Clean up after tests
});

describe('LinkController E2E Tests', () => {
    it('should create a link successfully', async () => {
        const videoId = 'test-video-id';
        const response = await request(app)
            .post('/api/v1/links')
            .send({ videoId, expiryTime: 30 });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Link created successfully');
        expect(response.body.link).toBeTruthy();
    });

    it('should fetch a link by video ID', async () => {
        const videoId = 'test-video-id';
        await request(app)
            .post('/api/v1/links')
            .send({ videoId, expiryTime: 30 });

        const response = await request(app)
            .get(`/api/v1/links/${videoId}`);

        expect(response.status).toBe(200);
        expect(response.body.link).toBeTruthy();
    });

    it('should delete expired links', async () => {
        const response = await request(app)
            .delete('/api/v1/links/expired');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Expired links deleted successfully');
    });
});
