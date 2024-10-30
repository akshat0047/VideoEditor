import request from 'supertest';
import { app } from '../../index';  // Adjust this import to your app's path

describe('Authorization Middleware E2E Tests', () => {
    const authToken = process.env.AUTH_TOKEN || 'default_test_token';

    it('should return 403 for invalid token', async () => {
        const res = await request(app)
            .get('/your-protected-route')  // Adjust to your protected route path
            .set('Authorization', 'InvalidToken');
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe('Unauthorized access. Invalid token.');
    });

    it('should allow access with a valid token', async () => {
        const res = await request(app)
            .get('/your-protected-route')  // Adjust to your protected route path
            .set('Authorization', authToken as string);
        expect(res.statusCode).toBe(200);
    });
});
