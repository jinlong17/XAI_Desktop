#!/usr/bin/env bash
# dispatch_codex.sh — portable reference implementation
#
# Fire-and-forget dispatch of one workflow step's prompt to Codex, for the
# event-driven automation variants (B-Codex / C-Codex). The meta-orchestrator
# (or the post-commit hook for review / verify dispatch) Bash-triggers this
# script and then EXITS; it does NOT wait. The post-commit hook later notifies
# the user to resume. See ../04-automation-loop.md §3.4.
#
# 2026-05-16 extension: 3rd positional arg <agent_name>. The original 2-arg
# form (build dispatch only) still works (defaults to feature-auto-build for
# back-compat).
#
# PLACEHOLDERS: replace <...> per ../00-PORTABLE-MANIFEST.md §3.
#   Tokens used: /tmp/cw-orchestrator, /tmp/cw-quota.
# Install location: scripts/cowork/dispatch_codex.sh
#
# Inputs:  $1 = <feature>
#          $2 = <prompt_file>  (absolute path the orchestrator/hook rendered)
#          $3 = <agent_name>   (optional, defaults to feature-auto-build)
#                              One of: feature-plan / feature-review /
#                                      feature-build / feature-auto-build / feature-verify /
#                                      bug-diagnose / bug-fix / bug-auto-fix /
#                                      bug-verify
# Exit:    0 if Codex was successfully launched; non-zero if it could not be
#          launched (binary missing, unknown agent, etc.) — the orchestrator
#          uses this to decide whether to fall through the quota fallback chain.
# Side effects: starts Codex in the background, writes a run log under /tmp/cw-quota.
# MUST NOT write the dev_log Status Panel. The dispatched agent itself writes
# the Status Panel per the §16.3 / §2.6 write-authority matrix.
#
# Cross-vendor identity: this script does NOT determine "which vendor should
# run this step". The caller (orchestrator or post-commit hook) reads
# `Plan Executor:` / `Build Executor:` from the Status Panel and chooses
# dispatch_codex.sh vs dispatch_cursor.sh accordingly.
set -euo pipefail
FEATURE="${1:?feature name required}"
PROMPT_FILE="${2:?prompt file path required}"
AGENT_NAME="${3:-feature-auto-build}"

case "$AGENT_NAME" in
  feature-plan|feature-review|feature-build|feature-auto-build|feature-verify| \
  bug-diagnose|bug-fix|bug-auto-fix|bug-verify) ;;
  *)
    echo "ERROR: unknown agent_name '$AGENT_NAME' (expected one of feature-plan/feature-review/feature-build/feature-auto-build/feature-verify/bug-diagnose/bug-fix/bug-auto-fix/bug-verify)" >&2
    exit 2
    ;;
esac

REPO_ROOT="$(git rev-parse --show-toplevel)"
RUN_DIR="/tmp/cw-quota"
mkdir -p "$RUN_DIR" "/tmp/cw-orchestrator"

# ── Primary path: `codex exec` headless (the reliable unattended path) ────────
# Codex CLI 0.130+ real invocation form (the only one verified to work):
#   --cd <dir>                 switch working directory
#   --sandbox workspace-write  Codex non-interactive defaults to read-only; WITHOUT
#                              this flag the run "succeeds" but every file write /
#                              git commit is silently blocked by the sandbox.
#   -                          read the prompt from stdin
#   --json                     structured JSONL event stream (for quota / error detection)
#   timeout is provided by an OUTER shell wrapper — there is no --timeout flag.
#
# macOS note: `gtimeout` comes from GNU coreutils (`brew install coreutils`); BSD
# systems have no `timeout` by default. Detect, WARN if missing, do not hard-fail.
TIMEOUT_BIN="$(command -v gtimeout || command -v timeout || true)"
if [ -z "$TIMEOUT_BIN" ]; then
  echo "WARN: no timeout binary (brew install coreutils provides gtimeout); running without an outer timeout" >&2
  TIMEOUT_PREFIX=""
else
  TIMEOUT_PREFIX="$TIMEOUT_BIN 600"
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "ERROR: codex CLI not found on PATH" >&2
  exit 1
fi

# Use the quota-aware wrapper when it is installed next to this script. The
# wrapper still delegates to codex, but records codex-exhausted-until on quota /
# availability failures so fallback logic can route around it.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODEX_BIN="codex"
if [ -x "$SCRIPT_DIR/codex_wrapper.sh" ]; then
  CODEX_BIN="$SCRIPT_DIR/codex_wrapper.sh"
fi

# $TIMEOUT_PREFIX is intentionally unquoted: empty -> zero args; non-empty -> two tokens.
RUN_LOG="$RUN_DIR/${FEATURE}.${AGENT_NAME}.codex.last_run.jsonl"

$TIMEOUT_PREFIX "$CODEX_BIN" exec \
  --sandbox workspace-write \
  --cd "$REPO_ROOT" \
  --json \
  - < "$PROMPT_FILE" \
  > "$RUN_LOG" 2>&1 &

date +%s > "/tmp/cw-orchestrator/${FEATURE}.${AGENT_NAME}.codex_dispatched"
echo "dispatched: codex / $AGENT_NAME for $FEATURE (log: $RUN_LOG)" >&2
exit 0

# ── Documented fallback: Codex desktop app (NOT unattended) ───────────────────
# There is no officially stable "inject a prompt into the desktop app from an
# external process" path on macOS — `open -a "Codex"` / `codex app <dir>` only
# open the workspace, the input box stays empty. If you must use the desktop app,
# the least-fragile path is: pbcopy the prompt + open the workspace + notify the
# user to Cmd+V manually:
#
#   pbcopy < "$PROMPT_FILE"
#   codex app "$REPO_ROOT" 2>/dev/null || open -a "Codex" "$REPO_ROOT"
#   osascript -e 'display notification "Codex opened — Cmd+V the prompt, then Enter" \
#                 with title "B-Codex dispatch (manual)" sound name "Tink"'
#
# For genuine unattended operation, use the `codex exec` path above (which is
# exactly the D-Codex CLI path — a desktop-app B-Codex effectively degrades to it).
