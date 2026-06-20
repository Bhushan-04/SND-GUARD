# SNDGuard — Overflow 2026 Submission

## Project name
SNDGuard — AI Memory Security Middleware

## One-line description
Middleware that gates AI agent memory consumption with counterfactual consensus, trust credentials on Sui, and Walrus integrity proofs.

## Track
Agentic Web

## Links
- **GitHub:** (public repo URL)
- **Live site:** (Vercel URL)
- **Demo video:** (YouTube ≤5 min)
- **API health:** `/health`

## Sui testnet Package ID
Set after publishing `packages/sui-contracts`:
```
SUI_PACKAGE_ID=0x...
```

## Problem
AI agents accumulate long-term memory. A single poisoned fact (e.g. `$50K` transaction limit vs `$10K`) can cause catastrophic autonomous actions — Semantic Norm Drift.

## Solution
SNDGuard registers memories without blocking ingest, then applies counterfactual analysis at query time. Conflicting facts trigger trust evaluation; poison is blocked and credentials revoked with full audit trail and recovery snapshots.

## Why Sui + Walrus
- **Sui:** On-chain trust credential objects tied to memory hashes (Move package)
- **Walrus:** Off-chain content with verifiable integrity proofs
- **Agentic Web:** Memory is the attack surface for autonomous agents

## Demo scenario
TreasuryAgent · safe `$10K` vs poison `$50K` · live at `/demo`

## Tech stack
TypeScript, Express, Prisma, Supabase Postgres, Next.js, Mysten Sui SDK, Walrus (integration path)

## Team
(Add names)
