import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global error handling middleware
 */
const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.',
      code: 'FILE_TOO_LARGE'
    });
    return;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({
      success: false,
      message: 'Unexpected file field.',
      code: 'UNEXPECTED_FILE'
    });
    return;
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    res.status(400).json({
      success: false,
      message: 'Too many files. Maximum is 5 files.',
      code: 'TOO_MANY_FILES'
    });
    return;
  }

  // AWS errors
  if (err.name === 'NoSuchBucket') {
    res.status(500).json({
      success: false,
      message: 'S3 bucket not found. Please check your AWS configuration.',
      code: 'S3_BUCKET_NOT_FOUND'
    });
    return;
  }

  if (err.name === 'AccessDenied') {
    res.status(500).json({
      success: false,
      message: 'Access denied to AWS services. Please check your credentials.',
      code: 'AWS_ACCESS_DENIED'
    });
    return;
  }

  // Textract errors
  if (err.name === 'InvalidParameterException') {
    res.status(400).json({
      success: false,
      message: 'Invalid file format for OCR processing.',
      code: 'INVALID_FILE_FORMAT'
    });
    return;
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;

