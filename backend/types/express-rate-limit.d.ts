declare module 'express-rate-limit' {
  import { Request, Response, NextFunction } from 'express';
  
  interface RateLimitOptions {
    windowMs?: number;
    max?: number | ((req: Request, res: Response) => number);
    message?: string | object;
    statusCode?: number;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    skip?: (req: Request, res: Response) => boolean;
    keyGenerator?: (req: Request, res: Response) => string;
    handler?: (req: Request, res: Response, next: NextFunction) => void;
    onLimitReached?: (req: Request, res: Response, options: RateLimitOptions) => void;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }
  
  function rateLimit(options?: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => void;
  export = rateLimit;
}
