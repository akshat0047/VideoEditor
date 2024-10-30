import { Request, Response, NextFunction } from 'express';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const authToken = process.env.AUTH_TOKEN;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    // Check if the token matches the expected value
    if (token !== authToken) {
        return res.status(403).json({ error: 'Unauthorized access. Invalid token.' });
    }

    next();
};
