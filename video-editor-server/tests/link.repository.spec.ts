// __tests__/linkRepository.test.ts
import { jest } from '@jest/globals';
import LinkRepository from '../src/repositories/link.repository';
import dao from '../src/repositories/dao';
import Link from '../src/models/link';
import { uuidv4 } from 'uuidv7';

jest.mock('../src/repositories/dao');
jest.mock('uuidv7', () => ({
  uuidv4: jest.fn(() => 'mock-uuid')
}));

describe('LinkRepository', () => {
  const mockLink: Link = {
    id: uuidv4(),
    videoId: 'video123',
    temporaryLink: 'http://localhost/uploads/video123.mp4',
    expiryTime: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLink', () => {
    it('should insert a link into the database and return true on success', async () => {
      (dao.run as jest.Mock).mockResolvedValueOnce(true);

      const result = await LinkRepository.createLink(mockLink);

      expect(dao.run).toHaveBeenCalledWith(
        "INSERT INTO links (id, videoId, temporaryLink, expiryTime) VALUES (?, ?, ?, ?)",
        ['mock-uuid', mockLink.videoId, mockLink.temporaryLink, mockLink.expiryTime]
      );
      expect(result).toBe(true);
    });

    it('should return false if there is a database error', async () => {
      (dao.run as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await LinkRepository.createLink(mockLink);

      expect(dao.run).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getLinkByVideoId', () => {
    it('should retrieve a link by video ID from the database', async () => {
      (dao.get as jest.Mock).mockResolvedValueOnce(mockLink);

      const result = await LinkRepository.getLinkByVideoId(mockLink.videoId);

      expect(dao.get).toHaveBeenCalledWith("SELECT * FROM links WHERE videoId = ?", [mockLink.videoId]);
      expect(result).toEqual(mockLink);
    });

    it('should return undefined if no link is found', async () => {
      (dao.get as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await LinkRepository.getLinkByVideoId('nonexistentId');

      expect(dao.get).toHaveBeenCalledWith("SELECT * FROM links WHERE videoId = ?", ['nonexistentId']);
      expect(result).toBeUndefined();
    });
  });

  describe('deleteExpiredLinks', () => {
    it('should delete expired links and return true on success', async () => {
      (dao.run as jest.Mock).mockResolvedValueOnce(true);

      const result = await LinkRepository.deleteExpiredLinks();

      expect(dao.run).toHaveBeenCalledWith("DELETE FROM links WHERE expiryTime < ?", [expect.any(String)]);
      expect(result).toBe(true);
    });

    it('should return false if there is a database error during deletion', async () => {
      (dao.run as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await LinkRepository.deleteExpiredLinks();

      expect(dao.run).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
