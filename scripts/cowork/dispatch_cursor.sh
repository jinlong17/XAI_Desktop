#!/usr/bin/env bash
# dispatch_cursor.sh — portable reference implementation
#
# Fire-and-forget dispatch of one workflow step's prompt to Cursor, for the
# event-driven automation variants (B-Cursor / C-Cursor). Same caller contract
# as dispatch_codex.sh — see that file's header for the cross-vendor identity
# routing convention. See ../04-automation-loop.md §3.4.
#
# 2026-05-16 extension: 3rd positional arg <agent_name>. The original 2-arg
# form still works (defaults to feature-auto-build for back-compat).
#
# PLACEHOLDERS: replace <...> per ../00-PORTABLE-MANIFEST.md §3.
#   Tokens used: /tmp/cw-orchestrator, /tmp/cw-quota.
# Install location: scripts/cowork/dispatch_cursor.sh
#
# Inputs:  $1 = <feature>
#          $2 = <prompt_file>  (absolute path the orchestrator/hook rendered)
#          $3 = <agent_name>   (optional, defaults to feature-auto-build)
#                              One of: feature-plan / feature-review /
#                                      feature-auto-build / feature-verify /
#                                      bug-diagnose / bug-fix / bug-auto-fix /
#                                      bug-verify
# Exit:    0 if cursor-agent was successfully launched; non-zero otherwise.
# Side effects: starts cursor-agent in the background, writes a run log under
# /tmp/cw-quota. MUST NOT write the dev_log Status Panel.
set -euo pipefail
FEATURE="${1:?feature name required}"
PROMPT_FILE="${2:?prompt file path required}"
AGENT_NAME="${3:-feature-auto-build}"

case "$AGENT_NAME" in
  feature-plan|feature-review|feature-auto-build|feature-verify| \
  bug-diagnose|bug-fix|bug-auto-fix|bug-verify) ;;
  *)
    echo "ERROR: unknown agent_name '$AGENT_NAME'" >&2
    exit 2
    ;;
esac

REPO_ROOT="$(git rev-parse --show-toplevel)"
RUN_DIR="/tmp/cw-quota"
mkdir -p "$RUN_DIR" "/tmp/cw-orchestrator"

if ! command -v cursor-agent >/dev/null 2>&1; then
  echo "ERROR: cursor-agent CLI not found on PATH" >&2
  exit 1
fi

# macOS has neither `timeout` nor `flock` by default — detect, WARN, do not hard-fail.
#   gtimeout: brew install coreutils   |   flock: brew install util-linux
TIMEOUT_BIN="$(command -v gtimeout || command -v timeout || true)"
FLOCK_BIN="$(command -v flock || true)"
# util-linux is keg-only on macOS Homebrew — `flock` is NOT symlinked onto PATH,
# so `command -v flock` misses it (esp. in the minimal-env git-hook context with
# no ~/.zshrc). Probe the known keg locations (Apple Silicon + Intel prefixes).
if [ -z "$FLOCK_BIN" ]; then
  for _c in /opt/homebrew/opt/util-linux/bin/flock /usr/local/opt/util-linux/bin/flock; do
    [ -x "$_c" ] && FLOCK_BIN="$_c" && break
  done
fi
[ -z "$TIMEOUT_BIN" ] && echo "WARN: no timeout binary; install via 'brew install coreutils'" >&2
[ -z "$FLOCK_BIN" ]   && echo "WARN: no flock binary; install via 'brew install util-linux' — concurrent cursor-agent calls may hang" >&2

# Recommended cursor-agent invocation form:
#   --print               long form of -p (automation scripts pin the long flag — short flags drift)
#   --force               REQUIRED for unattended use: without --trust/--yolo/-f,
#                         headless `--print` hits "⚠ Workspace Trust Required" in
#                         an untrusted dir and never runs (verified 2026-05-17).
#                         --force also auto-approves commands so feature-auto-build
#                         can actually write/test — the cursor analog of
#                         dispatch_codex.sh's `--sandbox workspace-write`.
#   --model <m>           env-overridable via CW_CURSOR_MODEL (default
#                         gpt-5.5-high — a real ID verified 2026-05-17 via
#                         `cursor-agent --list-models`; bridge tested → BRIDGE-OK);
#                         model IDs are account-scoped, self-check with
#                         `cursor-agent --list-models` (NOT `cursor-agent models`)
#   --output-format json  single JSON result; the consumer must try/except one JSON parse,
#                         falling back to "scan the last stdout line for exit semantics"
#   --workspace <repo>    working directory (the installed CLI rejects the older
#                         `--workdir`; verified 2026-05-17 against cursor-agent
#                         2026.01.23 → `error: unknown option '--workdir'`)
#   flock                 serializes cursor-agent (a known concurrent-hang issue)
#   timeout 700           guards against a hung CLI
#   explicit LC_ALL/LANG  guards against CJK / non-UTF-8 output corruption
CMD="cursor-agent --print --force --model ${CW_CURSOR_MODEL:-gpt-5.5-high} --output-format json --workspace $REPO_ROOT"
[ -n "$TIMEOUT_BIN" ] && CMD="$TIMEOUT_BIN 700 $CMD"
[ -n "$FLOCK_BIN" ]   && CMD="$FLOCK_BIN $RUN_DIR/cursor.lock $CMD"

RUN_LOG="$RUN_DIR/${FEATURE}.${AGENT_NAME}.cursor.last_run.json"

LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 \
  $CMD < "$PROMPT_FILE" \
  > "$RUN_LOG" 2>&1 &

date +%s > "/tmp/cw-orchestrator/${FEATURE}.${AGENT_NAME}.cursor_dispatched"
echo "dispatched: cursor / $AGENT_NAME for $FEATURE (log: $RUN_LOG)" >&2
exit 0
