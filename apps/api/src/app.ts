import express from 'express';
import cors from 'cors';
import { createContainer } from './infrastructure/di/container';
import { createRoutes } from './modules/memory/memory.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { getEnv } from './infrastructure/config/env';

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/$/, '');
}

export function createApp() {
  const app = express();
  const container = createContainer();
  const env = getEnv();
  const allowedOrigins = env.CORS_ORIGIN.map(normalizeOrigin);

  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser tools (curl, health checks) with no Origin header
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowedOrigins.includes(normalizeOrigin(origin))) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      walrus: !!env.WALRUS_PUBLISHER_URL,
      adapter: env.ADAPTER_MODE,
      suiPackage: env.SUI_PACKAGE_ID,
      environment: process.env.NODE_ENV || 'development'
    });
  });

  app.use('/api/v1', createRoutes(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
