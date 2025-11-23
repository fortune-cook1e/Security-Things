import { Router, Request, Response } from 'express';
import { strictDdosProtection } from '../middleware/ddosProtection';

const router = Router();

// 敏感操作 - 应用严格的速率限制
router.post('/login', strictDdosProtection, (req: Request, res: Response) => {
  res.json({
    message: 'Login endpoint',
    note: 'This endpoint has strict rate limiting (20 requests/minute)',
  });
});

router.post('/register', strictDdosProtection, (req: Request, res: Response) => {
  res.json({
    message: 'Register endpoint',
    note: 'This endpoint has strict rate limiting (20 requests/minute)',
  });
});

export default router;
