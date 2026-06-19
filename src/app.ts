import express from 'express';
import { createContainer } from './infrastructure/di/container';
import { createRoutes } from './modules/memory/memory.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();
  const container = createContainer();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1', createRoutes(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
