import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);

  if (!env.mongoUri) {
    throw new Error(
      'MONGODB_URI is not set. Copy Backend/.env.example to Backend/.env and set it to your MongoDB Compass connection URI.'
    );
  }

  await mongoose.connect(env.mongoUri);
}
