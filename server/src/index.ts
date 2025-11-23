import express from 'express';
import {
  ddosProtection,
  requestLogger,
  startCleanupTask,
  MAX_REQUESTS,
  TIME_WINDOW,
  BLOCK_DURATION,
} from './middleware/ddosProtection';
import indexRouter from './routes/index';
import apiRouter from './routes/api';
import ddosRouter from './routes/ddos';
import authRouter from './routes/auth';

const app = express();
const PORT = 3000;

// 中间件
app.use(express.json());
app.use(requestLogger);
app.use(ddosProtection); // DDoS protection (express-rate-limit)

// 路由
app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/api/ddos', ddosRouter);
app.use('/api/auth', authRouter);

// Start cleanup task
startCleanupTask();

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🛡️  DDoS Protection enabled:`);
  console.log(`   - Max requests: ${MAX_REQUESTS} per ${TIME_WINDOW / 1000}s`);
  console.log(`   - Block duration: ${BLOCK_DURATION / 1000}s`);
  console.log(`   - View stats at: http://localhost:${PORT}/api/ddos/stats`);
});
