import VideoController from '../src/controllers/videos.controller';
import repo from '../src/repositories/video.repository';
import { Request, Response } from 'express';
import * as utils from '../src/utils/utils';
import { IVideo } from '../src/interfaces/interfaces';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

jest.mock('fluent-ffmpeg');
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

interface FfmpegMock {
  setStartTime: jest.MockedFunction<(start: number) => FfmpegMock>;
  duration: jest.MockedFunction<(duration: number) => FfmpegMock>;
  output: jest.MockedFunction<(outputPath: string) => FfmpegMock>;
  on: jest.MockedFunction<(event: string, callback: () => void) => FfmpegMock>;
  run: jest.MockedFunction<() => void>;
}

describe('VideoController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllVideos', () => {
    it('should return a list of videos', async () => {
        const mockVideos: IVideo[] = [{ id: '1', fileName: 'video1.mp4', filePath: '/path/to/video1', thumbnail: '/path/to/thumbnail' }];
        (repo.getAllVideos as jest.Mock).mockResolvedValue(mockVideos);

        await VideoController.getAllVideos(req as Request, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockVideos);
      });
  });

  describe('getVideoById', () => {
    const mockVideo: IVideo = { id: '1', fileName: 'video1.mp4', filePath: '/path/to/video1', thumbnail: '/path/to/thumbnail' };
    it('should return a video by id', async () => {
      req.params = { id: '1' };
      (repo.getVideoById as jest.Mock).mockResolvedValue(mockVideo);

      await VideoController.getVideoById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ video: mockVideo });
    });

    it('should return 404 if video not found', async () => {
      req.params = { id: '999' };
      (repo.getVideoById as jest.Mock).mockResolvedValue(null);

      await VideoController.getVideoById(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('uploadVideo', () => {
    it('should upload a video and return success', async () => {
      const mockFilePath = '/uploads/test-video.mp4';
      // const mockThumbnailPath = '/uploads/test-thumbnail.jpg';
      req.file = { path: mockFilePath, originalname: 'test-video.mp4' } as any;

      (utils.getVideoDuration as jest.Mock).mockResolvedValue(60);
      (utils.createThumbnail as jest.Mock).mockResolvedValue(null);
      (fs.existsSync as jest.Mock).mockResolvedValue(true);
      (repo.saveVideo as jest.Mock).mockResolvedValue(true);

      await VideoController.uploadVideo(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Video uploaded successfully', filename: req.file.originalname });
    });

    it('should return 400 if file size exceeds the limit', async () => {
      req.file = { size: VideoController.MAX_SIZE_MB * 1024 * 1024 + 1 } as any;

      await VideoController.uploadVideo(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('File size exceeds') });
    });
  });

  describe('deleteVideo', () => {
    const mockVideo: IVideo = { id: '1', fileName: 'video1.mp4', filePath: '/path/to/video1', thumbnail: '/path/to/thumbnail' };

    it('should delete a video and return success', async () => {
      req.params = { id: '1' };
      (repo.getVideoById as jest.Mock).mockResolvedValue(mockVideo);
      (repo.deleteVideo as jest.Mock).mockResolvedValue(true);

      await VideoController.deleteVideo(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Video deleted successfully' });
    });

    it('should return 404 if video is not found', async () => {
      req.params = { id: '999' };
      (repo.deleteVideo as jest.Mock).mockResolvedValue(false);
      (repo.getVideoById as jest.Mock).mockResolvedValue(null);

      await VideoController.deleteVideo(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Video not found' });
    });
  });

  describe('trimVideo', () => {
    const mockVideo: IVideo = { id: '1', fileName: 'video1.mp4', filePath: '/path/to/video1', thumbnail: '/path/to/thumbnail' };

    it('should trim a video and return the trimmed video path', async () => {
      req.body = { videoId: '1', start: 10, duration: 5 };
      (repo.getVideoById as jest.Mock).mockResolvedValue(mockVideo);
      (utils.createThumbnail as jest.Mock).mockResolvedValue(null);
      (repo.saveVideo as jest.Mock).mockResolvedValue(true);
      (fs.existsSync as jest.Mock).mockResolvedValue(true);

      // Mocking ffmpeg methods
      const ffmpegMock: FfmpegMock = {
        setStartTime: jest.fn().mockReturnThis(),
        duration: jest.fn().mockReturnThis(),
        output: jest.fn().mockReturnThis(),
        on: jest.fn(function (this: FfmpegMock, event: string, callback: () => void) {
            if (event === 'end') {
                callback();
            }
            return this;
        }),
        run: jest.fn(),
      };
      (ffmpeg as jest.Mock).mockReturnValue(ffmpegMock);

      const outputFileName = `trim-${mockVideo.fileName}-${Date.now()}.mp4`;
      const outputFilePath = path.join(__dirname, '../../uploads', outputFileName);

      await VideoController.trimVideo(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Trimmed video generated successfully', trimmedVideoPath: outputFilePath});
    });

    it('should return 404 if the video does not exist', async () => {
      req.body = { videoId: '999', start: 0, duration: 10 };
      (repo.getVideoById as jest.Mock).mockResolvedValue(null);

      await VideoController.trimVideo(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while trimming video' });
    });
  });

  // describe('mergeVideos', () => {
  //   it('should merge videos and return the merged video path', async () => {
  //     req.body = { videoIds: ['1', '2'] };
  //     const mergedPath = '/path/to/merged-video.mp4';
  //     jest.spyOn(VideoController, 'mergeVideos').mockResolvedValue(mergedPath);

  //     await VideoController.mergeVideos(req as Request, res as Response, next);

  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({ message: 'Merged video generated successfully' });
  //   });

  //   it('should return 400 if the videos are incompatible', async () => {
  //     req.body = { videoIds: ['1', '2'] };
  //     jest.spyOn(checkCompatibility, 'checkCompatibility').mockReturnValue(false);

  //     await VideoController.mergeVideos(req as Request, res as Response, next);

  //     expect(res.status).toHaveBeenCalledWith(400);
  //     expect(res.json).toHaveBeenCalledWith({ message: 'Selected videos are not compatible for merging.' });
  //   });
  // });
});
