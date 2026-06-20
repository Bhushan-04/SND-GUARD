# SNDGuard — Overflow 2026 Submission

## Project name

SNDGuard — AI Memory Security Middleware

## One-line description

Middleware that gates AI agent memory consumption with counterfactual consensus, trust credentials on Sui, and Walrus integrity proofs.

## Track

**Agentic Web** · also eligible for **Walrus Special Track**

## Links

- **GitHub:** https://github.com/Bhushan-04/SND-GUARD
- **Live site:** https://snd-guard-web.vercel.app
- **Live API:** https://snd-guard.onrender.com ([health](https://snd-guard.onrender.com/health))
- **Live demo:** https://snd-guard-web.vercel.app/demo
- **Demo video:** _(YouTube URL — ≤5 min; upload unlisted and paste here before final submit)_

## Sui testnet Package ID

```
0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6
```

Explorer: https://testnet.suivision.xyz/package/0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6

Transaction: https://testnet.suivision.xyz/txblock/HDSH1VuCR3wDAVqgu2j82CJx3kZhGJkbFb4WBUmAknMg

Upgrade (v2 — `issue_entry`, `revoke_entry`, events): https://testnet.suivision.xyz/txblock/9omN1VmxszxdUqUWDAR3JYzmVFDVcaiqDgtzW7cszqfq

## Walrus testnet blob (verify integrity)

After registering a memory on production, each memory stores content on Walrus testnet. Example blob (TreasuryAgent demo shape):

```
6Qjjx2BHCoFM4dhHemx2WbUGbNhqxXyMXP4-vP09jJ8
```

Aggregator: https://aggregator.walrus-testnet.walrus.space/v1/blobs/6Qjjx2BHCoFM4dhHemx2WbUGbNhqxXyMXP4-vP09jJ8

Publisher: https://publisher.walrus-testnet.walrus.space/v1/blobs

## Problem

AI agents accumulate long-term memory. A single poisoned fact can cause catastrophic autonomous actions — **Semantic Norm Drift (SND)**.

**Scenario 1 — TreasuryAgent:** Legitimate `$10K` transaction limit vs attacker document injecting `$50K`. Ingest succeeds; poison only surfaces at consumption.

**Scenario 2 — HealthCareAgent:** Established `maxDosage: "500mg"` vs poisoned external note `maxDosage: "5000mg"`. An autonomous dosing agent could harm a patient if memory is trusted blindly.

## Solution

SNDGuard registers memories without blocking ingest, stores content on Walrus with hash-indexed integrity proofs, issues Sui trust credentials, then applies counterfactual analysis at query time. Conflicting facts trigger trust evaluation; poison is blocked, credentials revoked on-chain, with full audit trail and recovery snapshots.

**Positioning:** Mysten MemWal stores memories on Walrus. **SNDGuard secures them** — counterfactual consensus + on-chain credentials before any memory is consumed.

## Why Sui + Walrus

- **Sui:** On-chain `MemoryCredential` objects tied to memory hashes; revoke visible on testnet explorer
- **Walrus:** Off-chain memory content with verifiable blob IDs (HTTP publisher/aggregator on testnet)
- **Agentic Web:** Memory is the attack surface for autonomous agents

## Demo scenario

TreasuryAgent · safe `$10K` vs poison `$50K` · guided wizard at `/demo`

## Tech stack

TypeScript, Express, Prisma, Supabase Postgres, Next.js, Mysten Sui SDK, Walrus HTTP REST API

## Team

_(Add names before final submit)_

## Deploy checklist

- [x] Render: API + env vars from `.env.example`
- [x] Vercel: `apps/web` + `NEXT_PUBLIC_API_URL`
- [x] Sui: publish Move package, set Package ID
- [x] Walrus: HTTP adapter on testnet (production mode)
- [ ] YouTube demo video
- [ ] Submit at https://overflow.sui.io / DeepSurge (Agentic Web + Walrus Special Track)

## Production env (Render + Vercel)

```
ADAPTER_MODE=production
SUI_PACKAGE_ID=0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6
SUI_NETWORK=testnet
SUI_MNEMONIC=<testnet wallet with gas — Render secret only>
# or SUI_SECRET_KEY=suiprivkey1... (from sui keytool export)
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
LLM_PROVIDER=openai
LLM_API_KEY=<optional — enhances counterfactual explanations>
NEXT_PUBLIC_API_URL=https://snd-guard.onrender.com
NEXT_PUBLIC_SUI_PACKAGE_ID=0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6
```
