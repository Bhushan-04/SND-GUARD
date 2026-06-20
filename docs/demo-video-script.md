# SNDGuard — 5-minute demo video script

**Target:** Sui Overflow 2026 · Agentic Web track · ≤5 minutes

---

## 0:00 — Hook (30s)
- "What if your AI agent remembers the wrong transaction limit — and executes a $50K wire?"
- Show landing page hero: *Stop poisoned memories before agents act*

## 0:30 — Problem (45s)
- Explain Semantic Norm Drift / memory poisoning
- TreasuryAgent: legitimate `$10K` vs attacker document `$50K`
- Ingest doesn't fail — poison looks valid until consumption

## 1:15 — Architecture (45s)
- Diagram: Agent → SNDGuard → MemWal / Walrus / Sui
- Non-blocking register · query gate · counterfactual · credentials · audit · recovery

## 2:00 — Live demo (2 min)
1. Open `/demo` — create safe memory (step 1)
2. Create poison memory (step 2) — note ACTIVE/100 on ingest
3. Query & detect (step 3) — consensus `$10K`, poison blocked
4. Evaluate + audit (steps 4–6) — show trust drop / REVOKED
5. Recovery snapshot (step 7)

## 4:00 — Why Sui (45s)
- Move credential package on testnet — show Package ID on landing footer
- Walrus integrity proofs for off-chain content
- Object model fits mutable trust credentials

## 4:45 — Close (15s)
- GitHub · live site · Postman collection
- "SNDGuard — memory security middleware for the agentic web"
