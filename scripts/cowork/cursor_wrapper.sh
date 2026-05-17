#!/usr/bin/env bash
# cursor_wrapper.sh — portable reference implementation
#
# A thin quota-aware wrapper around the `cursor-agent` CLI. Pass-through of all
# args; it intercepts the output to detect quota exhaustion and, on a detected
# signal, writes /tmp/cw-quota//cursor-exhausted-until with a future UNIX
# timestamp so the meta-orchestrator can route around an exhausted executor.
#
# PLACEHOLDERS: replace <...> per ../00-PORTABLE-MANIFEST.md §3.
#   Tokens used: /tmp/cw-quota/.
# Install location: scripts/cowork//cursor_wrapper.sh
# Usage: put this ahead of `cursor-agent` on PATH, or call it explicitly:
#   scripts/cowork//cursor_wrapper.sh --print --model gpt-5.5 --output-format json --workdir "$REPO" < prompt.txt
#
# Exit code: mirrors the underlying `cursor-agent` exit code.
#
# Detection — multiple sources:
#   1. CLI exit code != 0                                   (reliable)
#   2. structured error in the --output-format json envelope
#      ("error": "rate_limit_exceeded" / "quota_exceeded")
#   3. loose keyword match in stdout/stderr (rate limit / quota / 429)  (fallback)
set -uo pipefail
QUOTA_DIR="/tmp/cw-quota/"
mkdir -p "$QUOTA_DIR" 2>/dev/null || true
COOLDOWN_SECONDS="${CW_QUOTA_COOLDOWN:-3600}"
OUT="$(mktemp)"

cursor-agent "$@" > >(tee "$OUT") 2>&1
rc=$?

exhausted=0
[ "$rc" -ne 0 ] && exhausted=1
grep -qE '"error"[[:space:]]*:[[:space:]]*"(rate_limit_exceeded|quota_exceeded)"' "$OUT" && exhausted=1
grep -qiE 'rate.?limit|quota|\b429\b' "$OUT" && exhausted=1

if [ "$exhausted" -eq 1 ]; then
  echo $(( $(date +%s) + COOLDOWN_SECONDS )) > "$QUOTA_DIR/cursor-exhausted-until"
  echo "WARN: cursor-agent quota/availability signal detected — wrote $QUOTA_DIR/cursor-exhausted-until" >&2
fi

rm -f "$OUT"
exit "$rc"
