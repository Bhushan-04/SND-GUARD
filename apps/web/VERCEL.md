# Deploy SNDGuard Web on Vercel

## Required project settings

In Vercel → Project → **Settings → General**:

| Setting | Value |
|---------|--------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | **Next.js** (not Express) |

If Root Directory is wrong (repo root), install runs `npm install --prefix=../..` **outside** the repo and the build fails.

## Environment variables (Production)

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://snd-guard.onrender.com` |
| `NEXT_PUBLIC_SUI_PACKAGE_ID` | `0x9c5dd6abaacf9a6a3ba6fa50daf39a0a378458fdc22df69fa2732c93fda04bea` |

## Build (auto from `vercel.json`)

- Install: `cd ../.. && npm install` (monorepo root)
- Build: `cd ../.. && npm run build:vercel`

## After deploy

1. Copy your Vercel URL (e.g. `https://snd-guard.vercel.app`)
2. On **Render** → Environment → set:

```
CORS_ORIGIN=https://YOUR-VERCEL-URL.vercel.app,http://localhost:3001
```

3. Redeploy Render API, then test `/demo`.
