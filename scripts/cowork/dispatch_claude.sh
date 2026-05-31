#!/usr/bin/env bash
# dispatch_claude.sh -- portable reference implementation
#
# Fire-and-forget launch of one workflow step in Claude Code Agent View for the
# event-driven automation variants (B-Codex / C-Codex when the cross-vendor peer
# is Claude). This is intentionally opt-in because `claude --bg` is a local
# machine capability: enable it only after a smoke test with either:
#
#   export CW_ENABLE_CLAUDE_BG=1
#   git config cowork.claudeBg true
#
# The script launches a background Claude session and returns after the session
# is accepted by Claude Code. It does not wait for the review / verify result.
# The launched Claude worker must still write dev_log / receipt evidence; the
# hook must never mark cross-vendor PASS by itself.
#
# Inputs:  $1 = <feature>
#          $2 = <prompt_file>
#          $3 = <agent_name> (optional, defaults to feature-auto-build)
# Exit:    0 if Claude bg accepted the session; non-zero if it could not launch.
set -euo pipefail

FEATURE="${1:?feature name required}"
PROMPT_FILE="${2:?prompt file path required}"
AGENT_NAME="${3:-feature-auto-build}"

case "$AGENT_NAME" in
  feature-plan|feature-review|feature-build|feature-auto-build|feature-verify|\
  bug-diagnose|bug-fix|bug-auto-fix|bug-verify) ;;
  *)
    echo "ERROR: unknown agent_name '$AGENT_NAME'" >&2
    exit 2
    ;;
esac

REPO_ROOT="$(git rev-parse --show-toplevel)"
RUN_DIR="/tmp/cw-quota"
MARKER_DIR="/tmp/cw-orchestrator"
mkdir -p "$RUN_DIR" "$MARKER_DIR"

if [ "${CW_ENABLE_CLAUDE_BG:-0}" != "1" ] \
  && [ "$(git config --bool cowork.claudeBg 2>/dev/null || true)" != "true" ]; then
  echo "ERROR: Claude bg dispatch is disabled. Run a local bg smoke test, then set CW_ENABLE_CLAUDE_BG=1 or git config cowork.claudeBg true." >&2
  exit 3
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "ERROR: claude CLI not found on PATH" >&2
  exit 1
fi

if [ ! -s "$PROMPT_FILE" ]; then
  echo "ERROR: prompt file is empty or missing: $PROMPT_FILE" >&2
  exit 1
fi

TIMEOUT_BIN="$(command -v gtimeout || command -v timeout || true)"
[ -z "$TIMEOUT_BIN" ] && echo "WARN: no timeout binary; install via 'brew install coreutils'" >&2

safe_stem="$(printf '%s-%s' "$FEATURE" "$AGENT_NAME" \
  | tr -c 'A-Za-z0-9_.-' '-' \
  | sed -E 's/^-+|-+$//g; s/-+/-/g' \
  | cut -c1-72)"
SESSION_NAME="${CW_CLAUDE_SESSION_PREFIX:-cw}-${safe_stem}-$(date +%Y%m%d-%H%M%S)"
RUN_LOG="$RUN_DIR/${FEATURE}.${AGENT_NAME}.claude_bg.launch.log"

prompt="$(cat "$PROMPT_FILE")"
CMD=(claude --bg --name "$SESSION_NAME")
[ -n "${CW_CLAUDE_MODEL:-}" ] && CMD+=(--model "$CW_CLAUDE_MODEL")
CMD+=(--permission-mode "${CW_CLAUDE_PERMISSION_MODE:-auto}")
[ -n "${CW_CLAUDE_EFFORT:-}" ] && CMD+=(--effort "$CW_CLAUDE_EFFORT")
CMD+=("$prompt")

set +e
(
  cd "$REPO_ROOT"
  if [ -n "$TIMEOUT_BIN" ]; then
    "$TIMEOUT_BIN" "${CW_CLAUDE_BG_LAUNCH_TIMEOUT:-90}" "${CMD[@]}"
  else
    "${CMD[@]}"
  fi
) > "$RUN_LOG" 2>&1
rc=$?
set -e

if [ "$rc" -ne 0 ]; then
  echo "ERROR: claude bg launch failed (exit $rc). Log: $RUN_LOG" >&2
  tail -40 "$RUN_LOG" >&2 || true
  exit "$rc"
fi

if grep -qiE 'idle.*send a prompt to start' "$RUN_LOG"; then
  echo "ERROR: claude bg created an idle session without consuming the prompt. Log: $RUN_LOG" >&2
  tail -20 "$RUN_LOG" >&2 || true
  exit 1
fi

session_id="$(grep -Eo 'backgrounded[[:space:]]+.[[:space:]]+[A-Za-z0-9_-]+' "$RUN_LOG" \
  | awk '{print $3}' \
  | tail -1 || true)"

{
  echo "timestamp=$(date +%s)"
  echo "vendor=claude"
  echo "feature=$FEATURE"
  echo "agent=$AGENT_NAME"
  echo "session_name=$SESSION_NAME"
  [ -n "$session_id" ] && echo "session_id=$session_id"
  echo "log=$RUN_LOG"
} > "$MARKER_DIR/${FEATURE}.${AGENT_NAME}.claude_dispatched"

echo "dispatched: claude-bg / $AGENT_NAME for $FEATURE (session: ${session_id:-$SESSION_NAME}; log: $RUN_LOG)" >&2
exit 0
