# SNDGuard Overflow 2026 — Cursor Execution Prompts

Paste each prompt into Cursor Agent in order. Do not refactor unrelated code.

## Context

- Monorepo: `apps/api` (Express/Prisma), `apps/web` (Next.js), `packages/sui-contracts`
- Production API: https://snd-guard.onrender.com
- Production web: https://snd-guard-web.vercel.app
- Sui Package ID: `0x498fabc46e9ace28a349dccb4c09d6075bf9b0807f4bc5f5ab5749e58eaeeac6`
- Walrus testnet publisher: `https://publisher.walrus-testnet.walrus.space/v1/blobs`

---

## Prompt 1 — Walrus HTTP Adapter (DONE)

Implement `WalrusHttpAdapter` in `apps/api/src/infrastructure/adapters/walrus-http.adapter.ts`:

- `storeProof`: PUT JSON envelope `{ memoryId, contentHash, content }` → parse `blobId` from response
- `verifyProof`: GET aggregator `/v1/blobs/{blobId}` → verify hash
- `createWalrusAdapter()` factory in `adapter.factory.ts`
- Wire `container.ts` to use factory; set `ADAPTER_MODE=production` in `render.yaml`

**Acceptance:** POST `/api/v1/memories` returns real `walrusObjectId`; aggregator URL returns JSON.

---

## Prompt 2 — MemWal Walrus backing (DONE)

Refactor MemWal production path in `memwal-walrus.adapter.ts`:

- `storeContent` uploads JSON to Walrus → `memwalRef = walrus://{blobId}`
- Postgres remains index layer (MemWal-compatible)

**Acceptance:** `memwalRef` and `walrusObjectId` both resolve to same blob on aggregator.

---

## Prompt 3 — Sui PTB Integration

Upgrade `packages/sui-contracts/sources/credential.move`:

- Add `issue_entry`, `revoke_entry`, `emit_poison_detected`
- Add events: `CredentialIssued`, `CredentialRevoked`, `MemoryPoisonDetected`
- Republish: `sui client publish --gas-budget 100000000`

Implement real txs in `sui-sdk.adapter.ts`:

- `issueCredential` → PTB `issue_entry` → return object ID
- `revokeCredential` → PTB `revoke_entry`
- Wire `credential.service.ts` revoke + poison to call on-chain

Set on Render: `SUI_MNEMONIC`, `SUI_PACKAGE_ID` (new after republish).

**Acceptance:** Register memory creates Sui object visible on testnet.suivision.xyz; revoke shows tx.

---

## Prompt 4 — Dashboard Proof Links (DONE)

Add `apps/web/src/lib/explorer-links.ts` and `ProofLinks` component.

Update: memories list, memory detail, audit page, demo wizard MemoryCard, landing footer.

**Acceptance:** Judges click Walrus blob + Sui object links from live demo.

---

## Prompt 5 — LLM Counterfactual (DONE)

Add `llm-evaluator.ts` with OpenAI/Anthropic support.

Env: `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`.

Enrich `counterfactual.service.ts` explanations when conflicts detected; fallback to deterministic.

**Acceptance:** Evaluate step shows "Reason: ... (LLM confidence: N%)" when key set.

---

## Prompt 6 — SUBMISSION.md + Demo Video

1. Fill team names and YouTube demo URL in `SUBMISSION.md`
2. Run `/demo` on production → paste real Walrus blobId
3. Apply DeepSurge: Agentic Web + Walrus Special Track
4. Record video per `docs/demo-video-script.md`

**Acceptance:** No placeholders in submission; video ≤5 min; blob ID verifiable in browser.

---

## Prompt 7 — Move republish only

```bash
cd packages/sui-contracts
sui client publish --gas-budget 100000000
```

Update `SUI_PACKAGE_ID` in Render, Vercel, README, SUBMISSION.md, `apps/web/src/lib/utils.ts`.

---

## Env checklist (Render)

```
ADAPTER_MODE=production
DATABASE_URL=...
DIRECT_URL=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
CORS_ORIGIN=https://snd-guard-web.vercel.app
SUI_NETWORK=testnet
SUI_PACKAGE_ID=<after republish>
SUI_MNEMONIC=<secret>
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
LLM_PROVIDER=openai
LLM_API_KEY=<secret>
```

## Env checklist (Vercel)

```
NEXT_PUBLIC_API_URL=https://snd-guard.onrender.com
NEXT_PUBLIC_SUI_PACKAGE_ID=<package id>
NEXT_PUBLIC_WALRUS_EXAMPLE_BLOB=<blob id from demo>
```
