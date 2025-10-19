import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Receipt Processing API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;

