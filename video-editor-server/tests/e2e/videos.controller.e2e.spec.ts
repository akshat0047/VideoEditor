import request from 'supertest';
import { server, app } from '../../index';
import dao from '../../src/repositories/dao';
import { unlink } from 'fs/promises';
import path from 'path';

jest.mock('fs/promises', () => ({
    ...jest.requireActual('fs/promises'),
    unlink: jest.fn(),
}));

beforeAll(async () => {
    await dao.setupDbForTest();
    process.env.BYPASS_AUTH = 'true';
    process.env.PORT = '3001';
    process.env.MAX_SIZE_MB = '5';
    process.env.MAX_DURATION_SEC = '50';

    const mockedUnlink = unlink as jest.Mock;
    mockedUnlink.mockResolvedValue(undefined);
});

afterAll(async () => {
    await dao.teardownDb();
    delete process.env.BYPASS_AUTH;
    delete process.env.PORT;
    server.close();
});

describe('VideoController E2E Tests', () => {
    it('should create a video record', async () => {
        const fileName = "test.mp4"
        const videoPath = path.join(__dirname, '../../../uploads', fileName);

        const response = await request(app)
            .post('/api/v1/videos/upload')
            .attach('video', videoPath);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Video uploaded successfully');
    });

    it('should fetch a video by ID', async () => {
        const videoId = 'video1';

        const response = await request(app)
            .get(`/api/v1/videos/${videoId}`);

        expect(response.status).toBe(200);
        expect(response.body.video).toBeTruthy();
    });

    it('should delete a video by ID', async () => {
        const videoId = 'video1';

        const response = await request(app)
            .delete(`/api/v1/videos/${videoId}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Video deleted successfully');
    });
});
