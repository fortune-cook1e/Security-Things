import { Router, Request, Response } from 'express';

const router = Router();

// 首页路由
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hello Express + TypeScript!',
    timestamp: new Date().toISOString(),
  });
});

export default router;
