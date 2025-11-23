import { Router, Request, Response } from 'express';
import { requestMap } from '../middleware/ddosProtection';

const router = Router();

// check DDoS protection status
router.get('/stats', (req: Request, res: Response) => {
  const stats = {
    totalTrackedIPs: requestMap.size,
    blockedIPs: 0,
    activeIPs: 0,
    details: [] as any[],
  };

  requestMap.forEach((record, ip) => {
    if (record.blocked) {
      stats.blockedIPs++;
    } else {
      stats.activeIPs++;
    }

    stats.details.push({
      ip,
      requestCount: record.count,
      blocked: record.blocked,
      firstRequestTime: new Date(record.firstRequestTime).toISOString(),
    });
  });

  res.json(stats);
});

export default router;
