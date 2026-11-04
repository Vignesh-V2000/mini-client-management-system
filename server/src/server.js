import { app } from './app.js';
import { db } from './config/db.js';
import { env } from './config/env.js';

const server = app.listen({ port: env.PORT, host: env.HOST }, () => {
  console.log(`API listening on port ${env.PORT}`);
});

function shutdown() {
  server.close(async (error) => {
    try {
      await db.$disconnect();
      if (error) process.exitCode = 1;
    } catch {
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
