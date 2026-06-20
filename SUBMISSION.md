# SNDGuard — Overflow 2026 Submission

## Project name
SNDGuard — AI Memory Security Middleware

## One-line description
Middleware that gates AI agent memory consumption with counterfactual consensus, trust credentials on Sui, and Walrus integrity proofs.

## Track
**Agentic Web**

## Links
- **GitHub:** https://github.com/Bhushan-04/SND-GUARD
- **Live site:** _(set after Vercel deploy — e.g. https://snd-guard.vercel.app)_
- **Live API:** https://snd-guard.onrender.com ([health](https://snd-guard.onrender.com/health))
- **Demo:** `/demo` on live site
- **Demo video:** _(YouTube URL — ≤5 min)_

## Sui testnet Package ID

```
0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6
```

Explorer: https://testnet.suivision.xyz/package/0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6

Transaction: https://testnet.suivision.xyz/txblock/HDSH1VuCR3wDAVqgu2j82CJx3kZhGJkbFb4WBUmAknMg

## Problem
AI agents accumulate long-term memory. A single poisoned fact (e.g. `$50K` transaction limit vs `$10K`) can cause catastrophic autonomous actions — Semantic Norm Drift.

## Solution
SNDGuard registers memories without blocking ingest, then applies counterfactual analysis at query time. Conflicting facts trigger trust evaluation; poison is blocked and credentials revoked with full audit trail and recovery snapshots.

## Why Sui + Walrus
- **Sui:** On-chain trust credential objects tied to memory hashes (Move package)
- **Walrus:** Off-chain content with verifiable integrity proofs
- **Agentic Web:** Memory is the attack surface for autonomous agents

## Demo scenario
TreasuryAgent · safe `$10K` vs poison `$50K` · guided wizard at `/demo`

## Tech stack
TypeScript, Express, Prisma, Supabase Postgres, Next.js, Mysten Sui SDK

## Team
_(Add names)_

## Deploy checklist
- [x] Render: API + env vars from `.env.example`
- [ ] Vercel: `apps/web` + `NEXT_PUBLIC_API_URL`
- [x] Sui: publish Move package, set Package ID
- [ ] YouTube demo video
- [ ] Submit at https://overflow.sui.io

## Production env (Render + Vercel)

```
SUI_PACKAGE_ID=0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6
NEXT_PUBLIC_SUI_PACKAGE_ID=0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6
```
