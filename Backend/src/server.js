import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`WalkWar API listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
