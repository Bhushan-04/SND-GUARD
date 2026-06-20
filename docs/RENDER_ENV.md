# Render environment — copy/paste checklist

Set these in **Render → snd-guard-api → Environment**. Values marked `(local .env)` copy from your `apps/api/.env`.

## Required secrets

| Key | Value |
|-----|--------|
| `DATABASE_URL` | `(local .env)` |
| `DIRECT_URL` | `(local .env)` |
| `SUPABASE_URL` | `(local .env)` |
| `SUPABASE_PUBLISHABLE_KEY` | `(local .env)` |
| `SUI_PACKAGE_ID` | `0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6` |
| `SUI_SECRET_KEY` | `(local .env — suiprivkey...)` |

Use **either** `SUI_SECRET_KEY` **or** `SUI_MNEMONIC`, not both required.

## Optional

| Key | Value |
|-----|--------|
| `LLM_PROVIDER` | `openai` |
| `LLM_API_KEY` | Your OpenAI key |
| `LLM_MODEL` | `gpt-4o-mini` |

## Already in render.yaml (no dashboard entry needed)

- `ADAPTER_MODE=production`
- `WALRUS_PUBLISHER_URL` / `WALRUS_AGGREGATOR_URL`
- `SUI_NETWORK=testnet`
- `CORS_ORIGIN=https://snd-guard-web.vercel.app,http://localhost:3001`

After saving → **Manual Deploy** → test `/health` and `/demo`.
