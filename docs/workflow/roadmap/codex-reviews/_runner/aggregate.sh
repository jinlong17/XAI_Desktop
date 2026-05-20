#!/usr/bin/env bash
# Aggregate all per-feature output.md into a single next-phase-targets document.

set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel)
BASE_DIR="$ROOT_DIR/docs/workflow/roadmap/codex-reviews"
OUT="$ROOT_DIR/docs/workflow/roadmap/xai-v1.next-phase-targets.md"

declare -a ORDER=(
  "repository-v0-contract|G2.1 Repository v0 contract"
  "grid-shell-organizer-content|G1.2 Grid shell / Organizer content split (SHIPPED)"
  "multi-grid-event-scope|G1.4 Multi-Grid event scope (SHIPPED)"
  "core-data-sqlite-driver|G2.2 SQLite/SQLCipher driver"
  "localstorage-migration|G2.3 localStorage migration"
  "keychain-opaque-handle|G2.4 Keychain opaque handle"
  "tauri-capability-allowlist|G2.5 Tauri capability allowlist"
  "single-table-sync-baseline|G2.6 Single-table sync baseline"
  "grid-persistence|G1.5 Grid persistence"
  "g3-organizer-batch|G3 Organizer-loop batch (E1+S3+E2+E3+E4)"
)

{
  echo "# XAI v1 — Next-phase targets from Codex cross-vendor review"
  echo
  echo "Generated: $(date '+%Y-%m-%d %H:%M %Z')"
  echo "Branch: codex/track-a-desktop-foundation"
  echo "Reviewer: codex \`feature-review\` (gpt-5.4 high)"
  echo
  echo "Per-feature Codex output lives under \`docs/workflow/roadmap/codex-reviews/<slug>/output.md\`."
  echo "This document is the consolidated optimization backlog seeded from those reviews."
  echo

  echo "## Verdict roll-up"
  echo
  printf "| Feature | Verdict | Output |\n"
  printf "|---|---|---|\n"
  for entry in "${ORDER[@]}"; do
    slug="${entry%%|*}"
    label="${entry##*|}"
    out="$BASE_DIR/$slug/output.md"
    if [[ ! -f "$out" ]]; then
      printf "| %s | ⚠ MISSING | — |\n" "$label"
      continue
    fi
    verdict=$(grep -E "^\*\*Verdict\*\*:" "$out" | head -1 | sed -E 's/^\*\*Verdict\*\*: *//' || echo "?")
    printf "| %s | %s | [output](codex-reviews/%s/output.md) |\n" "$label" "$verdict" "$slug"
  done
  echo

  echo "## Per-feature review excerpts"
  echo
  for entry in "${ORDER[@]}"; do
    slug="${entry%%|*}"
    label="${entry##*|}"
    out="$BASE_DIR/$slug/output.md"
    echo "### $label"
    echo
    if [[ ! -f "$out" ]]; then
      echo "_Codex review missing — context at \`codex-reviews/$slug/context.md\`._"
      echo
      continue
    fi
    cat "$out"
    echo
    echo "---"
    echo
  done
} > "$OUT"

echo "Aggregated -> $OUT"
