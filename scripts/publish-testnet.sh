#!/usr/bin/env bash
# Publish SNDGuard credential package to Sui testnet.
# Prerequisites: sui CLI installed, testnet wallet funded via https://faucet.sui.io

set -euo pipefail

SUI="${SUI:-${LOCALAPPDATA}/suiup/binaries/testnet/sui-v1.73.1.exe}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "$SUI" ]]; then
  echo "Sui CLI not found at $SUI"
  echo "Install: curl -sSfL https://raw.githubusercontent.com/MystenLabs/suiup/main/install.sh | sh"
  echo "         suiup install sui@testnet -y"
  exit 1
fi

echo "Active address:"
"$SUI" client active-address

echo "Balance:"
"$SUI" client balance || true

echo ""
echo "If balance is 0, fund at:"
ADDR=$("$SUI" client active-address)
echo "  https://faucet.sui.io/?address=${ADDR}"
echo ""
read -r -p "Press Enter after wallet is funded..."

cd "$ROOT/packages/sui-contracts"
"$SUI" move build
echo ""
echo "Publishing..."
OUTPUT=$("$SUI" client publish --gas-budget 100000000 2>&1)
echo "$OUTPUT"

PKG=$(echo "$OUTPUT" | grep -i "PackageID" | head -1 | awk '{print $NF}' || true)
if [[ -n "$PKG" ]]; then
  echo ""
  echo "Add to env:"
  echo "  SUI_PACKAGE_ID=$PKG"
  echo "  NEXT_PUBLIC_SUI_PACKAGE_ID=$PKG"
  echo ""
  echo "Explorer: https://testnet.suivision.xyz/package/$PKG"
fi
