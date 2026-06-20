import { createApp } from './app';
import { getEnv } from './infrastructure/config/env';

async function main() {
  const env = getEnv();
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`SNDGuard listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
