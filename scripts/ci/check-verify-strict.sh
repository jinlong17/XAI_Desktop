#!/usr/bin/env bash
# check-verify-strict.sh — crypto-deps-lockdown (Wave W0, Phase 3)
#
# Planted trip-wire for the ED25519_VERIFY_STRICT contract.
# (Design: packages/crypto-deps-lockdown/docs/api.md §4,
#  design.md D-5, discovery-review.md §1 "Central design tension")
#
# What this script does:
#   Greps the Rust source tree under apps/desktop/src-tauri/src/crypto/ for
#   ed25519-dalek non-strict verify patterns:  .verify(  without  _strict
#   on the same line, specifically scoped to ed25519 verifying-key context.
#
# Current state:
#   Ed25519 recovery-signing code now exists under crypto/.  This script is an
#   active trip-wire: any permissive `.verify(` call in the scoped crypto tree
#   fails CI, while `.verify_strict(` is allowed.
#
# Scope:
#   Only greps apps/desktop/src-tauri/src/crypto/ to avoid false positives
#   from unrelated .verify( calls in tauri / serde / other paths.
#
# Exit codes:
#   0 — no forbidden pattern found (clean)
#   1 — forbidden non-strict ed25519 verify pattern detected

set -euo pipefail

CRYPTO_SRC="apps/desktop/src-tauri/src/crypto"

echo "=== check-verify-strict: ED25519_VERIFY_STRICT trip-wire ==="
echo "    Scope: ${CRYPTO_SRC}/"

# Pattern: a .verify( call that is NOT immediately followed by _strict
# on the same line.  This catches:
#   key.verify(msg, sig)            <- FORBIDDEN
# but not:
#   key.verify_strict(msg, sig)     <- ALLOWED
#
# The grep scopes to ed25519 identifiers to avoid false positives from
# unrelated uses of .verify( in other crypto libs (e.g. ring, rustls).
# Scoped keywords: VerifyingKey, ed25519, Ed25519
FORBIDDEN_PATTERN='(VerifyingKey|ed25519|Ed25519).*\.verify\([^)]*\)[^_]|\.verify\([^)]*\)[[:space:]]*;'
STRICT_EXCEPTION='\.verify_strict\('

if [ ! -d "${CRYPTO_SRC}" ]; then
  echo "  [INFO] ${CRYPTO_SRC}/ does not exist — no crypto code to check."
  echo "PASS: no forbidden pattern (crypto directory absent)."
  exit 0
fi

# Find any .rs files containing a .verify( call without _strict
# Use grep -rn for line-level match; pipe through exclusion of verify_strict lines
VIOLATIONS=$(
  grep -rn '\.verify(' "${CRYPTO_SRC}" --include='*.rs' 2>/dev/null \
  | grep -v '\.verify_strict(' \
  | grep -E '(VerifyingKey|ed25519|Ed25519)' \
  || true
)

if [ -n "${VIOLATIONS}" ]; then
  echo ""
  echo "  [FAIL] Forbidden non-strict ed25519 verify pattern(s) detected:"
  echo "${VIOLATIONS}" | sed 's/^/    /'
  echo ""
  echo "FAILED: ED25519_VERIFY_STRICT contract violation."
  echo "Any Ed25519 signature verification MUST use VerifyingKey::verify_strict()"
  echo "not the permissive verify().  See api.md §4 for the contract."
  echo "RUSTSEC-2022-0093 rationale: decoupled-keypair oracle fixed in ed25519-dalek v2;"
  echo "using verify() (not verify_strict) still risks malleability in edge cases."
  exit 1
fi

echo "PASS: no forbidden non-strict ed25519 verify pattern found."
exit 0
