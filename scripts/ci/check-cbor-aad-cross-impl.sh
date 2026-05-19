#!/usr/bin/env bash
set -euo pipefail

echo "=== check-cbor-aad-cross-impl: Rust fixture vs cbor-x vs cbor2 ==="

node scripts/ci/check-cbor-aad-cborx.mjs
python3 scripts/ci/check-cbor-aad-cbor2.py

echo "PASS: CBOR AAD vectors are byte-identical across Rust fixtures, cbor-x, and cbor2."
