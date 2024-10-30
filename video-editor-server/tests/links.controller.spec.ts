// __tests__/link.controller.test.ts
import request from 'supertest';
import { app } from '../index';
import linkRepo from '../src/repositories/link.repository';
import videoRepo from '../src/repositories/video.repository';
import moment from 'moment';

jest.mock('../src/repositories/link.repository');
jest.mock('../src/repositories/video.repository');

describe('LinkController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLinkByVideo', () => {
    it('should return a link for a given video ID', async () => {
      const mockLink = { id: 1, videoId: '123', url: 'http://localhost/uploads/sample.mp4', expiry: moment().toISOString() };
      (linkRepo.getLinkByVideoId as jest.Mock).mockResolvedValue(mockLink);

      const response = await request(app).get('/link/123');
      expect(response.status).toBe(200);
      expect(response.body.link).toEqual(mockLink);
      expect(linkRepo.getLinkByVideoId).toHaveBeenCalledWith('123');
    });
  });

  describe('createLink', () => {
    it('should create a link for a given video ID and return the temporary link', async () => {
      const mockVideo = { id: '123', fileName: 'sample.mp4' };
      const mockLink = { videoId: '123', url: 'http://localhost/uploads/sample.mp4', expiry: moment().add(30, 'minutes').toISOString() };

      (videoRepo.getVideoById as jest.Mock).mockResolvedValue(mockVideo);
      (linkRepo.createLink as jest.Mock).mockResolvedValue(mockLink);

      const response = await request(app)
        .post('/link')
        .send({ videoId: '123', expiryTime: 30 });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Link created successfully');
      expect(response.body.link).toBe(mockLink.url);
      expect(videoRepo.getVideoById).toHaveBeenCalledWith('123');
      expect(linkRepo.createLink).toHaveBeenCalledWith(expect.objectContaining({ videoId: '123' }));
    });

    it('should return 404 if the video does not exist', async () => {
      (videoRepo.getVideoById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/link')
        .send({ videoId: 'nonexistent', expiryTime: 30 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Video not found');
    });
  });

  describe('syncExpiredLinks', () => {
    it('should delete expired links and return a success message', async () => {
      const message = "Expired links deleted successfully";
      (linkRepo.deleteExpiredLinks as jest.Mock).mockResolvedValue(message);

      const response = await request(app).post('/syncExpiredLinks');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Expired links deleted successfully');
      expect(linkRepo.deleteExpiredLinks).toHaveBeenCalledTimes(1);
    });
  });
});
