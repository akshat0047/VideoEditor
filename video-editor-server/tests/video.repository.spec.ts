// __tests__/videoRepository.test.ts
import { jest } from '@jest/globals';
import VideoRepository from '../src/repositories/video.repository';
import dao from '../src/repositories/dao';
import Video from '../src/models/video';
import { uuidv4 } from 'uuidv7';

jest.mock('../src/repositories/dao');
jest.mock('uuidv7', () => ({
  uuidv4: jest.fn(() => 'mock-uuid')
}));

describe('VideoRepository', () => {
  const mockVideo: Video = {
    id: 'video123',
    fileName: 'video.mp4',
    filePath: '/uploads/video.mp4',
    thumbnail: '/uploads/video-thumbnail.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVideos', () => {
    it('should retrieve all videos from the database', async () => {
      (dao.all as jest.Mock).mockResolvedValueOnce([mockVideo]);

      const result = await VideoRepository.getAllVideos();

      expect(dao.all).toHaveBeenCalledWith("SELECT * FROM videos", []);
      expect(result).toEqual([mockVideo]);
    });

    it('should return an empty array if no videos are found', async () => {
      (dao.all as jest.Mock).mockResolvedValueOnce([]);

      const result = await VideoRepository.getAllVideos();

      expect(dao.all).toHaveBeenCalledWith("SELECT * FROM videos", []);
      expect(result).toEqual([]);
    });
  });

  describe('getVideoById', () => {
    it('should retrieve a video by its ID', async () => {
      (dao.get as jest.Mock).mockResolvedValueOnce(mockVideo);

      const result = await VideoRepository.getVideoById(mockVideo.id);

      expect(dao.get).toHaveBeenCalledWith("SELECT * FROM videos WHERE id = ?", [mockVideo.id]);
      expect(result).toEqual(mockVideo);
    });

    it('should return undefined if no video is found', async () => {
      (dao.get as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await VideoRepository.getVideoById('nonexistentId');

      expect(dao.get).toHaveBeenCalledWith("SELECT * FROM videos WHERE id = ?", ['nonexistentId']);
      expect(result).toBeUndefined();
    });
  });

  describe('saveVideo', () => {
    it('should insert a new video and return true on success', async () => {
      (dao.run as jest.Mock).mockResolvedValueOnce(true);

      const result = await VideoRepository.saveVideo(mockVideo);

      expect(dao.run).toHaveBeenCalledWith(
        "INSERT INTO videos (id, fileName, filePath, thumbnail) VALUES (?,?,?,?);",
        ['mock-uuid', mockVideo.fileName, mockVideo.filePath, mockVideo.thumbnail]
      );
      expect(result).toBe(true);
    });

    it('should return false if there is a database error', async () => {
      (dao.run as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await VideoRepository.saveVideo(mockVideo);

      expect(dao.run).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('deleteVideo', () => {
    it('should delete a video by its ID and return true on success', async () => {
      (dao.run as jest.Mock).mockResolvedValueOnce(true);

      const result = await VideoRepository.deleteVideo(mockVideo.id);

      expect(dao.run).toHaveBeenCalledWith("DELETE FROM videos WHERE id = ?;", [mockVideo.id]);
      expect(result).toBe(true);
    });

    it('should return false if there is a database error during deletion', async () => {
      (dao.run as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await VideoRepository.deleteVideo(mockVideo.id);

      expect(dao.run).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
