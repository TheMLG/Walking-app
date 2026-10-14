import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import leaderboardRoutes from './routes/leaderboard.js';
import dashboardRoutes from './routes/dashboard.js';
import workoutRoutes from './routes/workouts.js';
import weightRoutes from './routes/weight.js';
import goalRoutes from './routes/goals.js';
import profileRoutes from './routes/profile.js';
import analyticsRoutes from './routes/analytics.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requireCsrf } from './middleware/csrf.js';

export function createApp() {
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: false
  }));
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(requireCsrf);

  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/weight', weightRoutes);
  app.use('/api/goals', goalRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
