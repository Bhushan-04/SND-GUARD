# SNDGuard — Deploy Guide

Step-by-step for **Render (API)** + **Vercel (Web)** + **Sui testnet**.

---

## Part 1 — Render (API)

1. Go to [render.com](https://render.com) → **New** → **Blueprint** (or Web Service from Git).
2. Connect GitHub repo: `Bhushan-04/SND-GUARD`.
3. Render reads root `render.yaml` automatically.

### Environment variables (Dashboard → Service → Environment)

Copy from your local `apps/api/.env`:

| Key | Example / notes |
|-----|-----------------|
| `DATABASE_URL` | Supabase pooler URL (port 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase direct URL (port 5432) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `CORS_ORIGIN` | `https://YOUR-APP.vercel.app,http://localhost:3001` |
| `SUI_NETWORK` | `testnet` |
| `SUI_PACKAGE_ID` | After Move publish (Part 3) — republish for `issue_entry` / `revoke_entry` |
| `SUI_MNEMONIC` | Testnet wallet with gas (secret; required for on-chain credentials) |
| `ADAPTER_MODE` | `production` (Walrus HTTP + Sui when mnemonic set) |
| `WALRUS_PUBLISHER_URL` | `https://publisher.walrus-testnet.walrus.space` |
| `WALRUS_AGGREGATOR_URL` | `https://aggregator.walrus-testnet.walrus.space` |
| `LLM_PROVIDER` | `openai` or `anthropic` or `none` |
| `LLM_API_KEY` | Optional — richer counterfactual explanations |
| `NODE_ENV` | `production` (set by render.yaml) |

4. Deploy → wait for build (`npm install` + shared + api build).
5. Test: `https://YOUR-SERVICE.onrender.com/health` → `{"status":"ok"}`.

---

## Part 2 — Vercel (Web)

> **Common failure:** Framework set to **Express** or Root Directory left empty.  
> Must be **Next.js** + Root Directory **`apps/web`**. See `apps/web/VERCEL.md`.

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `Bhushan-04/SND-GUARD`.
2. **Root Directory:** click **Edit** → set to **`apps/web`** (required for monorepo).
3. **Framework Preset:** **Next.js** (do not pick Express).
4. Leave Install/Build empty so `apps/web/vercel.json` is used, or set:
   - Install: `cd ../.. && npm install`
   - Build: `cd ../.. && npm run build:vercel`

### Environment variables

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-SERVICE.onrender.com` (no trailing slash) |
| `NEXT_PUBLIC_SUI_PACKAGE_ID` | Same as `SUI_PACKAGE_ID` after publish |
| `NEXT_PUBLIC_WALRUS_EXAMPLE_BLOB` | Example blobId for landing footer (from demo run) |

4. Deploy → open `https://YOUR-APP.vercel.app/demo`.

5. **Update Render** `CORS_ORIGIN` to include your Vercel URL, then redeploy API.

### CLI alternative

```bash
npm i -g vercel
cd apps/web
vercel --prod
# set env vars in Vercel dashboard when prompted
```

---

## Part 3 — Sui testnet (Move package)

### Install Sui CLI (Windows)

**Option A — suiup (recommended)**

```bash
curl -sSfL https://raw.githubusercontent.com/MystenLabs/suiup/main/install.sh | sh
# Add to PATH: %LOCALAPPDATA%\bin  (or ~/.local/bin in Git Bash)
suiup install sui@testnet
sui --version
```

**Option B — download**

[github.com/MystenLabs/sui/releases](https://github.com/MystenLabs/sui/releases) → Windows binary → add to PATH.

### Configure wallet

```bash
sui client switch --env testnet
sui client new-address ed25519   # skip if you already have one
sui client active-address
sui client faucet                # get testnet SUI
```

### Publish credential package

```bash
cd packages/sui-contracts
sui move build
sui client publish --gas-budget 100000000
```

Copy **Package ID** from output (`Published Objects` / `packageId`).

### Wire Package ID

**Local**

```bash
# apps/api/.env
SUI_PACKAGE_ID=0xYOUR_PACKAGE_ID

# apps/web/.env.local
NEXT_PUBLIC_SUI_PACKAGE_ID=0xYOUR_PACKAGE_ID
```

**Production:** add same vars in Render + Vercel dashboards → redeploy both.

Verify on explorer: `https://testnet.suivision.xyz/package/0xYOUR_PACKAGE_ID`

---

## Part 4 — Post-deploy checklist

- [ ] API health returns ok
- [ ] `/demo` runs full 7-step wizard against live API
- [ ] Landing footer shows real Package ID
- [ ] Update `SUBMISSION.md` with live URLs
- [ ] Record ≤5 min demo video (`docs/demo-video-script.md`)
- [ ] Submit at [overflow.sui.io](https://overflow.sui.io) — **Agentic Web**

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API CORS error in browser | Set `CORS_ORIGIN` on Render to exact Vercel URL |
| Vercel build can't find `@snd-guard/shared` | Ensure root `vercel.json` install/build runs from repo root |
| Render build fails Prisma | Check `DATABASE_URL` + `DIRECT_URL` set |
| Duplicate memory on demo re-run | Click **Reset demo** or truncate Supabase tables |
| `sui: command not found` | Add `%LOCALAPPDATA%\bin` to PATH after suiup install |
