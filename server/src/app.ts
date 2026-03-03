import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import EventsRouter from '@/features/events/events.route';
import {
  getLoggerStartTime,
  loggerMiddleware,
} from '@/middleware/logger.middleware';
import {
  globalErrorHandler,
  notFoundHandler,
} from '@/middleware/errors.middleware';
import AuthRouter from '@/features/auth/auth.route';
import { SystemConfig } from './config/system.config';
import UserRouter from './features/user/user.route';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(
  cors({
    origin: SystemConfig.clientUrl,
    credentials: true,
  }),
);

// Configure global data acceptance rules
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Configure logging middleware
app.use(getLoggerStartTime);
app.use(loggerMiddleware);

// Routes
app.use('/auth', AuthRouter);
app.use('/user', UserRouter);
app.use('/events', EventsRouter);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'All systems operational.',
  });
});

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}!`);
});
