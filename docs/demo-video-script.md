# SNDGuard — 5-minute demo video script (v2)

**Target:** Sui Overflow 2026 · Agentic Web + Walrus Special · ≤5 minutes

Record on **production**: https://snd-guard-web.vercel.app/demo

---

## 0:00 — Threat (45s)

- "AI agents accumulate long-term memory. One poisoned fact can cause catastrophic autonomous action."
- TreasuryAgent: legitimate `$10K` limit vs attacker `$50K`
- Brief mention: HealthCareAgent dosage poisoning (`500mg` → `5000mg`)

## 0:45 — Attack (45s)

1. Open `/demo` — Run step 1 (safe `$10K` memory)
2. **Click Walrus blob link** — show JSON in browser aggregator
3. Run step 2 (poison `$50K`) — note ACTIVE/100 on ingest (non-blocking)

## 1:30 — Defense (90s)

4. Run step 3 — query consensus returns `$10K`, poison blocked
5. Show counterfactual explanation (LLM reason if configured)
6. Run step 4 — explicit evaluate, REVOKED
7. **Click Sui credential link** on testnet.suivision.xyz (if production Sui enabled)

## 3:00 — Proof (60s)

8. Audit step — show Walrus + Sui proof links in forensic trail
9. Recovery step — agent restored to safe `$10K` snapshot
10. Dashboard `/dashboard/memories` — proof column with live links

## 4:00 — Pitch (60s)

- "MemWal stores memories on Walrus. **SNDGuard secures them.**"
- Counterfactual consensus before consumption
- On-chain credential revoke + Walrus integrity proofs
- GitHub · live API · Package ID · Walrus blob ID in SUBMISSION.md

## 4:45 — Close (15s)

"SNDGuard — memory security middleware for the agentic web."

---

## Before recording checklist

- [ ] Render: `ADAPTER_MODE=production`, Walrus URLs set
- [ ] Render: `SUI_MNEMONIC` + republished Move package with `issue_entry` / `revoke_entry`
- [ ] Optional: `LLM_API_KEY` for richer explanations
- [ ] Paste real Walrus blobId into SUBMISSION.md after demo run
- [ ] Upload unlisted YouTube → SUBMISSION.md demo video URL
