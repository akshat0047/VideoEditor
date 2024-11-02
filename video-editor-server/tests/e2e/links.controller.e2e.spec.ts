import request from 'supertest';
import { app } from '../../index';
import dao from '../../src/repositories/dao';

beforeAll(async () => {
    await dao.setupDbForTest();
    process.env.BYPASS_AUTH = 'true';
    process.env.PORT = '3001';
});

afterAll(async () => {
    await dao.teardownDb();
    delete process.env.BYPASS_AUTH;
});

describe('LinkController E2E Tests', () => {
    it('should create a link successfully', async () => {
        const videoId = 'video1';
        const response = await request(app)
            .post('/api/v1/links/create')
            .send({ videoId, expiryTime: 30 });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Link created successfully');
        expect(response.body.link).toBeTruthy();
    });

    it('should fetch a link by video ID', async () => {
        const linkId = 'link1';
        const response = await request(app)
            .get(`/api/v1/links/detail/${linkId}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    it('should sync expired links', async () => {
        const response = await request(app)
            .get('/api/v1/links/sync');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Expired links synced successfully');
    });
});
