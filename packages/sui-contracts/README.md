# SNDGuard Move — Sui Testnet

On-chain trust credential objects for memory hashes.

## Publish to testnet

Requires [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install):

```bash
# 1. Install Sui CLI (if needed)
# Windows: use suiup or download from Mysten releases

# 2. Create / fund testnet wallet
sui client new-address ed25519   # skip if you have one
sui client switch --env testnet
sui client faucet

# 3. Publish from repo root
cd packages/sui-contracts
sui move build
sui client publish --gas-budget 100000000

# 4. Copy Package ID from output → set in env:
#    apps/api/.env          SUI_PACKAGE_ID=0x...
#    apps/web/.env.local    NEXT_PUBLIC_SUI_PACKAGE_ID=0x...
```

## Module

`sources/credential.move` — `MemoryCredential` shared object with `issue`, `revoke`, `trust_score`, `status`.

## API integration

Set `ADAPTER_MODE=production` and `SUI_MNEMONIC` (issuer key) in `apps/api/.env` to use `SuiSdkAdapter` instead of local refs.
