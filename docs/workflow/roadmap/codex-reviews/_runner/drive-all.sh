#!/usr/bin/env bash
# Drive all remaining Codex reviews serially. Skips features that already have output.md.

set -uo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel)
RUNNER="$ROOT_DIR/docs/workflow/roadmap/codex-reviews/_runner/run-review.sh"
BASE_DIR="$ROOT_DIR/docs/workflow/roadmap/codex-reviews"

declare -a REVIEWS=(
  # wave 1 — G1 ships
  "grid-shell-organizer-content|26d9f57 03ca86a 3751f43 653219b"
  "multi-grid-event-scope|78aef01 59da1e5 44345cf 653219b"
  # wave 2 — G2.2-2.5
  "core-data-sqlite-driver|f3dd30b"
  "localstorage-migration|2784397"
  "keychain-opaque-handle|d1fe45a"
  "tauri-capability-allowlist|ad5f1d3"
  # wave 3 — G2.6 + G1.5
  "single-table-sync-baseline|43ffdda"
  "grid-persistence|91dc6b6"
  # wave 4 — G3-batch (5 features in one commit)
  "g3-organizer-batch|533391e"
)

for entry in "${REVIEWS[@]}"; do
  slug="${entry%%|*}"
  commits="${entry##*|}"
  out="$BASE_DIR/$slug/output.md"
  ctx="$BASE_DIR/$slug/context.md"

  if [[ -f "$out" ]]; then
    echo "[$slug] SKIP — output.md already exists"
    continue
  fi
  if [[ ! -f "$ctx" ]]; then
    echo "[$slug] SKIP — missing context.md"
    continue
  fi

  echo "[$slug] starting at $(date +%H:%M:%S)"
  if "$RUNNER" "$slug" "$commits" "$ctx"; then
    echo "[$slug] OK at $(date +%H:%M:%S)"
  else
    echo "[$slug] FAILED — see $BASE_DIR/$slug/output.log"
  fi
done

echo "[driver] all reviews done at $(date +%H:%M:%S)"
