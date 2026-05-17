#!/usr/bin/env bash
# codex_wrapper.sh — portable reference implementation
#
# A thin quota-aware wrapper around the `codex` CLI. Pass-through of all args;
# it intercepts the output to detect quota exhaustion and, on a detected signal,
# writes <quota_state_dir>/codex-exhausted-until with a future UNIX timestamp so
# the meta-orchestrator can route around an exhausted executor.
#
# PLACEHOLDERS: replace <...> per ../00-PORTABLE-MANIFEST.md §3.
#   Tokens used: <quota_state_dir>.
# Install location: <cowork_scripts_dir>/codex_wrapper.sh
# Usage: put this ahead of `codex` on PATH, or call it explicitly:
#   <cowork_scripts_dir>/codex_wrapper.sh exec --sandbox workspace-write --cd "$REPO" - < prompt.txt
#
# Exit code: mirrors the underlying `codex` exit code (callers can still branch on it).
#
# Detection — use MULTIPLE sources, never hard-depend on one error string
# (Codex officially guarantees only the JSONL `type` name, not payload fields):
#   1. CLI exit code != 0           (most reliable)
#   2. JSONL event `type` in {error, turn.failed}   (when --json is in the args)
#   3. loose keyword match in stdout/stderr (quota / rate limit / insufficient /
#      exhausted / usage limit / 429)               (last-resort fallback)
set -uo pipefail
QUOTA_DIR="<quota_state_dir>"
mkdir -p "$QUOTA_DIR" 2>/dev/null || true
COOLDOWN_SECONDS="${CW_QUOTA_COOLDOWN:-3600}"   # how long to consider Codex exhausted
OUT="$(mktemp)"

codex "$@" > >(tee "$OUT") 2>&1
rc=$?

exhausted=0
[ "$rc" -ne 0 ] && exhausted=1
grep -qE '"type"[[:space:]]*:[[:space:]]*"(error|turn\.failed)"' "$OUT" && exhausted=1
grep -qiE 'quota|rate.?limit|insufficient|exhausted|usage limit|\b429\b' "$OUT" && exhausted=1

if [ "$exhausted" -eq 1 ]; then
  echo $(( $(date +%s) + COOLDOWN_SECONDS )) > "$QUOTA_DIR/codex-exhausted-until"
  echo "WARN: codex quota/availability signal detected — wrote $QUOTA_DIR/codex-exhausted-until" >&2
fi

rm -f "$OUT"
exit "$rc"
