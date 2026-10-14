import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/walkwar',
  jwtSecret: process.env.JWT_SECRET || 'walkwar-dev-secret',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  minQualifyingDurationMinutes: Number(process.env.MIN_QUALIFYING_DURATION_MINUTES || 5)
};
