#!/usr/bin/env bash
# dispatch_cursor.sh — portable reference implementation
#
# Fire-and-forget dispatch of one build prompt to Cursor, for the event-driven
# automation variants (B-Cursor / C-Cursor). The meta-orchestrator Bash-triggers
# this script and then EXITS; it does NOT wait. A git post-commit hook later
# notifies the user to resume. See ../04-automation-loop.md §2.6 + §3.
#
# PLACEHOLDERS: replace <...> per ../00-PORTABLE-MANIFEST.md §3.
#   Tokens used: /tmp/cw-orchestrator/, /tmp/cw-quota/.
# Install location: scripts/cowork//dispatch_cursor.sh
#
# Inputs:  $1 = <feature>   $2 = <prompt_file> (absolute path the orchestrator rendered)
# Exit:    0 if cursor-agent was successfully launched; non-zero otherwise.
# Side effects: starts cursor-agent in the background, writes a run log under /tmp/cw-quota/.
# MUST NOT write the dev_log Status Panel.
set -euo pipefail
FEATURE="$1"
PROMPT_FILE="$2"
REPO_ROOT="$(git rev-parse --show-toplevel)"
RUN_DIR="/tmp/cw-quota/"
mkdir -p "$RUN_DIR" "/tmp/cw-orchestrator/"

if ! command -v cursor-agent >/dev/null 2>&1; then
  echo "ERROR: cursor-agent CLI not found on PATH" >&2
  exit 1
fi

# macOS has neither `timeout` nor `flock` by default — detect, WARN, do not hard-fail.
#   gtimeout: brew install coreutils   |   flock: brew install util-linux
TIMEOUT_BIN="$(command -v gtimeout || command -v timeout || true)"
FLOCK_BIN="$(command -v flock || true)"
[ -z "$TIMEOUT_BIN" ] && echo "WARN: no timeout binary; install via 'brew install coreutils'" >&2
[ -z "$FLOCK_BIN" ]   && echo "WARN: no flock binary; install via 'brew install util-linux' — concurrent cursor-agent calls may hang" >&2

# Recommended cursor-agent invocation form:
#   --print               long form of -p (automation scripts pin the long flag — short flags drift)
#   --model gpt-5.5       nominal value; self-check with `cursor-agent models` before relying on it
#   --output-format json  single JSON result; the consumer must try/except one JSON parse,
#                         falling back to "scan the last stdout line for exit semantics"
#   --workdir <repo>      working directory
#   flock                 serializes cursor-agent (a known concurrent-hang issue)
#   timeout 700           guards against a hung CLI
#   explicit LC_ALL/LANG  guards against CJK / non-UTF-8 output corruption
CMD="cursor-agent --print --model gpt-5.5 --output-format json --workdir $REPO_ROOT"
[ -n "$TIMEOUT_BIN" ] && CMD="$TIMEOUT_BIN 700 $CMD"
[ -n "$FLOCK_BIN" ]   && CMD="$FLOCK_BIN $RUN_DIR/cursor.lock $CMD"

LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 \
  $CMD < "$PROMPT_FILE" \
  > "$RUN_DIR/${FEATURE}.cursor.last_run.json" 2>&1 &

date +%s > "/tmp/cw-orchestrator//${FEATURE}.cursor_dispatched"
exit 0
