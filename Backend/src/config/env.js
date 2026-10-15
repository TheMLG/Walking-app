import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'walkin-bros-secret',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: process.env.COOKIE_SAME_SITE || (process.env.COOKIE_SECURE === 'true' ? 'none' : 'lax'),
  minQualifyingDurationMinutes: Number(process.env.MIN_QUALIFYING_DURATION_MINUTES || 5)
};

