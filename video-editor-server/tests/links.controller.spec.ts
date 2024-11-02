// __tests__/link.controller.test.ts
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import LinkController from '../src/controllers/links.controller';
import linkRepo from '../src/repositories/link.repository';
import videoRepo from '../src/repositories/video.repository';

jest.mock('../src/repositories/link.repository');
jest.mock('../src/repositories/video.repository');

describe('LinkController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.PORT = '3000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLinkByVideo', () => {
    it('should return a link for a given video ID', async () => {
      const mockLink = { id: 1, videoId: '123', url: 'http://localhost/uploads/sample.mp4', expiry: moment().toISOString() };
      (linkRepo.getLinkByVideoId as jest.Mock).mockResolvedValue(mockLink);
      req.params = { id: '123' };

      await LinkController.getLinkByVideo(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ link: mockLink });
    });
  });

  describe('createLink', () => {
    it('should create a link for a given video ID and return the temporary link', async () => {
      const mockVideo = { id: '123', fileName: 'sample.mp4', thumbnail: 'thumbnail-sample.mp4' };
      const mockLink = { videoId: '123', url: 'http://localhost:3000/uploads/sample.mp4', expiry: moment().add(30, 'minutes').toISOString() };

      (videoRepo.getVideoById as jest.Mock).mockResolvedValue(mockVideo);
      (linkRepo.createLink as jest.Mock).mockResolvedValue(mockLink);

      req.body = { videoId: '123', expiryTime: 30 };

      await LinkController.createLink(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Link created successfully',
        link: mockLink.url,
      });
    });

    it('should return 404 if the video does not exist', async () => {
      (videoRepo.getVideoById as jest.Mock).mockResolvedValue(null);

      req.body = { videoId: 'nonexistent', expiryTime: 30 };

      await LinkController.createLink(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Video file not found' });
    });
  });

  describe('syncExpiredLinks', () => {
    it('should delete expired links and return a success message', async () => {
      const message = "Expired links deleted successfully";
      (linkRepo.deleteExpiredLinks as jest.Mock).mockResolvedValue(message);

      await LinkController.syncExpiredLinks(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Expired links synced successfully' });
      expect(linkRepo.deleteExpiredLinks).toHaveBeenCalledTimes(1);
    });
  });
});
