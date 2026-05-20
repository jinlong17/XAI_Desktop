#!/usr/bin/env bash
# Codex cross-vendor review runner.
#
# Usage: ./run-review.sh <feature-slug> "<commit-hashes>" <context-file>
#
# Writes the Codex output to docs/workflow/roadmap/codex-reviews/<feature-slug>/output.md
# and the raw stderr log to .../output.log.

set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <feature-slug> <commit-hashes> <context-file>" >&2
  exit 1
fi

FEATURE_SLUG=$1
COMMITS=$2
CONTEXT_FILE=$3

ROOT_DIR=$(git rev-parse --show-toplevel)
OUT_DIR="$ROOT_DIR/docs/workflow/roadmap/codex-reviews/$FEATURE_SLUG"
mkdir -p "$OUT_DIR"

TEMPLATE="$ROOT_DIR/docs/workflow/roadmap/codex-reviews/_runner/review-template.md"

if [[ ! -f "$CONTEXT_FILE" ]]; then
  echo "Context file missing: $CONTEXT_FILE" >&2
  exit 1
fi

CONTEXT=$(cat "$CONTEXT_FILE")
PROMPT=$(sed -e "s|{{FEATURE_SLUG}}|$FEATURE_SLUG|g" \
             -e "s|{{COMMITS}}|$COMMITS|g" \
             -e "s|{{COMMIT_HASHES}}|$COMMITS|g" \
             "$TEMPLATE")
PROMPT="${PROMPT/\{\{FEATURE_CONTEXT\}\}/$CONTEXT}"

echo "[runner] feature=$FEATURE_SLUG commits=$COMMITS" >&2
echo "[runner] prompt bytes=${#PROMPT}" >&2

# Persist the assembled prompt for traceability.
echo "$PROMPT" > "$OUT_DIR/prompt.md"

# Run Codex non-interactively. -o writes the agent's final message.
codex exec \
  -m gpt-5.4 \
  -c model_reasoning_effort=high \
  --skip-git-repo-check \
  -o "$OUT_DIR/output.md" \
  "$PROMPT" \
  > "$OUT_DIR/output.log" 2>&1

echo "[runner] $FEATURE_SLUG done → $OUT_DIR/output.md" >&2
