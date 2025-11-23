import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// DDoS 防护配置
export const MAX_REQUESTS = 100;
export const TIME_WINDOW = 60000;
export const BLOCK_DURATION = 300000;

// Store request information for statistics
interface RequestRecord {
  count: number;
  firstRequestTime: number;
  blocked: boolean;
}

export const requestMap = new Map<string, RequestRecord>();

export const ddosProtection = rateLimit({
  windowMs: TIME_WINDOW,
  max: MAX_REQUESTS,

  // based on IP address
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },

  // custom handler when limit is reached
  handler: (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(
      `⚠️  [DDoS DETECTED] IP: ${clientIp} - Exceeded ${MAX_REQUESTS} requests in ${
        TIME_WINDOW / 1000
      }s`
    );

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'DDoS attack detected. You have been temporarily blocked.',
      retryAfter: Math.ceil(TIME_WINDOW / 1000),
    });
  },

  standardHeaders: true,
  legacyHeaders: false,

  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// stricter DDoS protection (for sensitive endpoints)
export const strictDdosProtection = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // only allow 20 requests

  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },

  handler: (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`🚨 [STRICT DDoS BLOCKED] IP: ${clientIp} - Exceeded strict limit`);

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded for this endpoint.',
      retryAfter: 60,
    });
  },

  standardHeaders: true,
  legacyHeaders: false,
});

// request logging middleware (for monitoring and statistics)
export const requestLogger = (req: Request, res: Response, next: Function) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  let record = requestMap.get(clientIp);

  if (!record) {
    record = {
      count: 1,
      firstRequestTime: now,
      blocked: false,
    };
    requestMap.set(clientIp, record);
  } else {
    const timeElapsed = now - record.firstRequestTime;

    if (timeElapsed > TIME_WINDOW) {
      // 重置计数器
      record.count = 1;
      record.firstRequestTime = now;
      record.blocked = false;
    } else {
      record.count++;

      // 警告：接近阈值
      if (record.count > MAX_REQUESTS * 0.8 && record.count <= MAX_REQUESTS) {
        console.log(
          `⚠️  [DDoS WARNING] IP: ${clientIp} - ${
            record.count
          }/${MAX_REQUESTS} requests in ${Math.ceil(timeElapsed / 1000)}s`
        );
      }
    }
  }

  next();
};

// clearup outdated records periodically
export const startCleanupTask = () => {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    requestMap.forEach((record, ip) => {
      const age = now - record.firstRequestTime;
      if (age > TIME_WINDOW * 2) {
        requestMap.delete(ip);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired records. Active IPs: ${requestMap.size}`);
    }
  }, TIME_WINDOW);
};
