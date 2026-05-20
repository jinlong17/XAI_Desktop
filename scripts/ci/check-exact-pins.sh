#!/usr/bin/env bash
# check-exact-pins.sh — crypto-deps-lockdown (Wave W0, Phase 3)
#
# Asserts that all 7 target crypto crates in apps/desktop/src-tauri/Cargo.toml
# use exact-version pinning syntax (=x.y.z).
#
# Called by the `rust-pins` CI job (supply-chain-security.yml).
# Can also be run locally: bash scripts/ci/check-exact-pins.sh
#
# Exit codes:
#   0 — all 7 crates have exact pins
#   1 — one or more crates are missing or not exactly pinned

set -euo pipefail

CARGO_TOML="apps/desktop/src-tauri/Cargo.toml"

# 7 crates required to have exact =x.y.z pins (crypto-deps-lockdown contract)
REQUIRED_CRATES=(
  "argon2"
  "aes-gcm"
  "x25519-dalek"
  "ed25519-dalek"
  "hpke"
  "rusqlite"
  "reqwest"
)

echo "=== check-exact-pins: asserting =x.y.z pins on 7 crypto crates ==="
echo "    File: ${CARGO_TOML}"

FAILED=0

for crate in "${REQUIRED_CRATES[@]}"; do
  # Match the crate line and verify it contains an exact version pin (="x.y.z")
  # The line should look like: crate = { version = "=x.y.z", ... }
  # We match: <crate-name> ... "=<digits>.<digits>.<digits>"
  if grep -qE "^${crate}[[:space:]]*=[[:space:]]*\{[^}]*\"=[0-9]+\.[0-9]+\.[0-9]+\"" "${CARGO_TOML}"; then
    PIN=$(grep -E "^${crate}[[:space:]]*=" "${CARGO_TOML}" | grep -oE '"=[0-9]+\.[0-9]+\.[0-9]+"' | head -1)
    echo "  [OK] ${crate} pinned to ${PIN}"
  else
    echo "  [FAIL] ${crate}: not found or not exactly pinned with =x.y.z syntax"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
if [ "${FAILED}" -gt 0 ]; then
  echo "FAILED: ${FAILED} crate(s) missing exact =x.y.z pin."
  echo "All 7 crypto crates must be pinned with exact-version syntax in ${CARGO_TOML}."
  echo "See packages/crypto-deps-lockdown/docs/api.md §2 for the pinned-version table."
  exit 1
fi

echo "PASS: all 7 crypto crates have exact =x.y.z pins."
exit 0
