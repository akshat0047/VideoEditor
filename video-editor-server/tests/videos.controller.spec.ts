import request from 'supertest';
import VideoController from '../src/controllers/videos.controller';
import repo from '../src/repositories/video.repository';
import { createThumbnail, getVideoDuration, checkCompatibility } from '../src/utils/utils';
import path from 'path';
import { app } from '../index';

jest.mock('../src/repositories/video.repository');
jest.mock('../src/utils/utils');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
}));
jest.mock('fs/promises', () => ({
  unlink: jest.fn(),
}));

describe('VideoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVideos', () => {
    it('should return a list of videos', async () => {
      const mockVideos = [{ id: '1', filename: 'video1.mp4' }];
      (repo.getAllVideos as jest.Mock).mockResolvedValue(mockVideos);

      const response = await request(app).get('/api/videos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ videos: mockVideos });
    });
  });

  describe('getVideoById', () => {
    it('should return a video by id', async () => {
      const mockVideo = { id: '1', filename: 'video1.mp4' };
      (repo.getVideoById as jest.Mock).mockResolvedValue(mockVideo);

      const response = await request(app).get('/api/videos/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ video: mockVideo });
    });

    it('should return 404 if video not found', async () => {
      (repo.getVideoById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/videos/999');

      expect(response.status).toBe(404);
    });
  });

  describe('uploadVideo', () => {
    it('should upload a video and return success', async () => {
      const mockFile = Buffer.from('dummy content');
      const mockFilePath = path.join(__dirname, '../../../uploads/test-video.mp4');
      const mockThumbnailPath = path.join(__dirname, '../../../uploads/test-thumbnail.jpg');

      (getVideoDuration as jest.Mock).mockResolvedValue(60);
      (createThumbnail as jest.Mock).mockResolvedValue(mockThumbnailPath);
      (repo.saveVideo as jest.Mock).mockResolvedValue({ id: '1', filename: 'test-video.mp4' });

      const response = await request(app)
        .post('/api/videos/upload')
        .attach('file', mockFile, { filename: 'test-video.mp4' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Video uploaded successfully');
      expect(createThumbnail).toHaveBeenCalledWith(mockFilePath, expect.any(String));
      expect(repo.saveVideo).toHaveBeenCalledWith(expect.objectContaining({ filename: 'test-video.mp4' }));
    });

    it('should return 400 if file size exceeds the limit', async () => {
      const mockFile = Buffer.alloc(VideoController.MAX_SIZE_MB * 1024 * 1024 + 1);

      const response = await request(app)
        .post('/api/videos/upload')
        .attach('file', mockFile, { filename: 'test-video.mp4' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/File size exceeds/);
    });
  });

  describe('deleteVideo', () => {
    it('should delete a video and return success', async () => {
      const mockVideo = { id: '1', filename: 'video1.mp4', filePath: 'path/to/video' };
      (repo.getVideoById as jest.Mock).mockResolvedValue(mockVideo);
      (repo.deleteVideo as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/api/videos/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Video deleted successfully');
      expect(repo.deleteVideo).toHaveBeenCalledWith('1');
    });

    it('should return 404 if video is not found', async () => {
      (repo.getVideoById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/api/videos/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Video not found');
    });
  });

  describe('trimVideo', () => {
    it('should trim a video and return the trimmed video path', async () => {
      const mockVideo = { id: '1', fileName: 'video1.mp4', filePath: 'path/to/video' };
      const trimmedPath = 'path/to/trimmed-video.mp4';

      (repo.getVideoById as jest.Mock).mockResolvedValue(mockVideo);
      (createThumbnail as jest.Mock).mockResolvedValue(trimmedPath);

      const response = await request(app)
        .post('/api/videos/trim')
        .send({ videoId: '1', start: 10, duration: 5 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Trimmed video generated successfully');
      expect(createThumbnail).toHaveBeenCalledWith(trimmedPath, expect.any(String));
      expect(repo.saveVideo).toHaveBeenCalledWith(expect.objectContaining({ fileName: expect.stringContaining('trim') }));
    });

    it('should return 404 if the video does not exist', async () => {
      (repo.getVideoById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/api/videos/trim').send({ videoId: '999', start: 0, duration: 10 });

      expect(response.status).toBe(404);
    });
  });

  describe('mergeVideos', () => {
    it('should merge videos and return the merged video path', async () => {
      const mockVideos = [
        { id: '1', filePath: 'path/to/video1.mp4' },
        { id: '2', filePath: 'path/to/video2.mp4' },
      ];

      (repo.getVideoById as jest.Mock).mockResolvedValueOnce(mockVideos[0]).mockResolvedValueOnce(mockVideos[1]);
      (checkCompatibility as jest.Mock).mockReturnValue(true);

      const response = await request(app)
        .post('/api/videos/merge')
        .send({ videoIds: ['1', '2'] });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Merged video generated successfully');
      expect(checkCompatibility).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Object), expect.any(Object)]));
      expect(repo.saveVideo).toHaveBeenCalledWith(expect.objectContaining({ fileName: expect.stringContaining('merged') }));
    });

    it('should return 400 if the videos are incompatible', async () => {
      (checkCompatibility as jest.Mock).mockReturnValue(false);

      const response = await request(app)
        .post('/api/videos/merge')
        .send({ videoIds: ['1', '2'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Selected videos are not compatible for merging.');
    });
  });
});
