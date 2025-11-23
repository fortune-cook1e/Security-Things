import { Router, Request, Response } from 'express';

const router = Router();

// Hello API
router.get('/hello', (req: Request, res: Response) => {
  res.json({
    message: 'API is working',
    status: 'success',
  });
});

export default router;
