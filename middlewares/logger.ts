import type { Request, Response, NextFunction } from 'express';

let requestCount = 0;

function logger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  requestCount++;

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    console.log(
      `[#${requestCount}] ` +
      `[${new Date().toLocaleString()}] ` +
      `${req.method} ${req.originalUrl} ` +
      `→ ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
}

export default logger;