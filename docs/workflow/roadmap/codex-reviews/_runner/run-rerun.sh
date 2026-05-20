#!/usr/bin/env bash
# Codex post-fix re-review runner.
#
# Usage: ./run-rerun.sh <feature-slug> "<commit-hashes>" "<original-issue-paraphrase>"
#
# Writes the Codex output to
# docs/workflow/roadmap/codex-reviews/<slug>/rerun-output.md
# and reuses the per-feature context.md for feature-specific background.

set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <feature-slug> <commit-hashes> <original-issue>" >&2
  exit 1
fi

FEATURE_SLUG=$1
COMMITS=$2
ORIGINAL_ISSUE=$3

ROOT_DIR=$(git rev-parse --show-toplevel)
OUT_DIR="$ROOT_DIR/docs/workflow/roadmap/codex-reviews/$FEATURE_SLUG"
mkdir -p "$OUT_DIR"

TEMPLATE="$ROOT_DIR/docs/workflow/roadmap/codex-reviews/_runner/rerun-review-template.md"
CONTEXT_FILE="$OUT_DIR/context.md"

if [[ ! -f "$CONTEXT_FILE" ]]; then
  echo "Original context missing: $CONTEXT_FILE" >&2
  exit 1
fi

CONTEXT=$(cat "$CONTEXT_FILE")
PROMPT=$(sed -e "s|{{FEATURE_SLUG}}|$FEATURE_SLUG|g" \
             -e "s|{{COMMITS}}|$COMMITS|g" \
             "$TEMPLATE")
PROMPT="${PROMPT/\{\{ORIGINAL_ISSUE\}\}/$ORIGINAL_ISSUE}"
PROMPT="${PROMPT/\{\{FEATURE_CONTEXT\}\}/$CONTEXT}"

echo "[rerun] feature=$FEATURE_SLUG commits=$COMMITS" >&2
echo "$PROMPT" > "$OUT_DIR/rerun-prompt.md"

codex exec \
  -m gpt-5.4 \
  -c model_reasoning_effort=high \
  --skip-git-repo-check \
  -o "$OUT_DIR/rerun-output.md" \
  "$PROMPT" \
  > "$OUT_DIR/rerun-output.log" 2>&1

echo "[rerun] $FEATURE_SLUG done → $OUT_DIR/rerun-output.md" >&2
