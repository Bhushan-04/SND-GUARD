# SNDGuard

AI Memory Security Middleware — protects agents from Semantic Norm Drift (SND) and memory poisoning.

Sits between AI agents and memory systems. **Ingest never blocks**; **consumption is gated** by counterfactual consensus, trust credentials, and forensic audit.

## Monorepo

| Package | Description |
|---------|-------------|
| `apps/api` | Express 5 + Prisma API (port 3000) |
| `apps/web` | Next.js dashboard + demo (port 3001) |
| `packages/shared` | Shared types + API client |
| `packages/sui-contracts` | Move credential package (testnet) |

## Quick start

```bash
npm install
cp .env.example apps/api/.env   # add Supabase DATABASE_URL
echo "CORS_ORIGIN=http://localhost:3001" >> apps/api/.env
npm run build -w @snd-guard/shared
npm run dev
```

- API: http://localhost:3000/health  
- Web: http://localhost:3001  
- Demo wizard: http://localhost:3001/demo  

## TreasuryAgent demo

1. Register safe memory: `{ "transactionLimit": "$10K" }`
2. Register poison: `{ "transactionLimit": "$50K" }` from `AttackerDoc`
3. Query `transactionLimit` → consensus `$10K`, poison blocked/revoked

Use the guided wizard at `/demo` or the Postman collection in `postman/`.

## Sui testnet

| Variable | Purpose |
|----------|---------|
| `SUI_NETWORK` | `testnet` (default) |
| `SUI_PACKAGE_ID` | Published Move package ID |
| `SUI_MNEMONIC` | Issuer key (production adapter only) |
| `ADAPTER_MODE` | `local` (default) or `production` |

Move package: `packages/sui-contracts/` — publish with Sui CLI, then set `SUI_PACKAGE_ID` in env and `NEXT_PUBLIC_SUI_PACKAGE_ID` for the web app.

## Deploy

- **Web:** Vercel — root `apps/web`, env `NEXT_PUBLIC_API_URL`
- **API:** Render — see `render.yaml`, env from `.env.example`

## Overflow 2026

Track: **Agentic Web** · See `SUBMISSION.md` and `docs/demo-video-script.md`

## License

MIT
