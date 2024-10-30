// __tests__/authenticateToken.test.ts
import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../src/middleware/authMiddleware';
import fs from 'fs';

describe('authenticateToken middleware', () => {
  const mockNext = jest.fn();

  beforeAll(() => {
    process.env.AUTH_TOKEN = 'testAuthToken';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() when the token is valid', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer videoverse',
      },
    } as Request;

    const mockResponse = {} as Response;

    authenticateToken(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 403 if the token is missing', () => {
    const mockRequest = {
      headers: {},
    } as Request;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    authenticateToken(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized access. Invalid token.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if the token is invalid', () => {
    const mockRequest = {
      headers: {
        authorization: 'invalidToken',
      },
    } as Request;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    authenticateToken(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized access. Invalid token.' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
