import http from 'http';
import app from './app';
import { prisma } from './core/database/prisma';
import { env } from './core/config/env';

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

const server = http.createServer(app);

async function startServer() {
  try {
    // Connect to Database
    await prisma.$connect();
    console.log('Database is connected successfully');

    console.log('Starting server...');
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on http://localhost:${PORT}`);
    });

    // Graceful Shutdown Handler
    const shutdown = (signal: string) => {
      console.log(`Received ${signal}. Closing server...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await prisma.$disconnect();
          console.log('Database disconnected cleanly.');
          process.exit(0);
        } catch (error) {
          console.error('Error during database disconnect:', error);
          process.exit(1);
        }
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();