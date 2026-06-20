import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3001')
    .transform((s) => s.split(',').map((o) => o.trim())),
  COUNTERFACTUAL_RELATED_LIMIT: z.coerce.number().default(10),
  COUNTERFACTUAL_POISON_THRESHOLD: z.coerce.number().default(30),
  COUNTERFACTUAL_AUTO_REVOKE_THRESHOLD: z.coerce.number().default(80),
  MIN_CONSUMABLE_TRUST_SCORE: z.coerce.number().default(50),
  ADAPTER_MODE: z.enum(['local', 'production']).default('local'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUI_NETWORK: z.enum(['testnet', 'mainnet', 'localnet']).default('testnet'),
  SUI_PACKAGE_ID: z.string().optional(),
  SUI_MNEMONIC: z.string().optional(),
  SUI_SECRET_KEY: z.string().optional(),
  WALRUS_PUBLISHER_URL: z
    .string()
    .url()
    .default('https://publisher.walrus-testnet.walrus.space'),
  WALRUS_AGGREGATOR_URL: z
    .string()
    .url()
    .default('https://aggregator.walrus-testnet.walrus.space'),
  LLM_PROVIDER: z.enum(['openai', 'anthropic', 'none']).default('none'),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default('gpt-4o-mini'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }
  return cachedEnv;
}
