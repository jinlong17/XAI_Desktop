#!/bin/bash
# lib_hook_helpers.sh — portable reference implementation
#
# Project-layer helpers sourced by git-post-commit (and optionally dispatch_*.sh).
# git-post-commit HARD-DEPENDS on these 5 functions — without this file the
# multi-state dispatcher degrades to notify-only. It ships here as a working
# reference; copy it into scripts/cowork/lib_hook_helpers.sh alongside the
# other reference scripts and replace the <...> placeholders per
# ../00-PORTABLE-MANIFEST.md §3. It implements the interface required by
# ../04-automation-loop.md §3.4.
#
# PLACEHOLDERS: replace <...> per ../00-PORTABLE-MANIFEST.md §3.
#   Tokens used: packages, docs/reviews, /tmp/cw-quota.
# Install location: scripts/cowork/lib_hook_helpers.sh

set -uo pipefail

# ----- 1. determine_other_vendor <executor> ------------------
# Input : executor identity (read from the rolling "- Executor:" Status Panel
#         line — there is NO dedicated Plan/Build Executor field).
# Output: a vendor name dispatch_<x>.sh can consume (codex|cursor|claude), OR
#         the sentinel "MANUAL_CLAUDE" (cross-vendor step lands on Claude but
#         bg dispatch is not enabled on this machine -> notify the user) OR
#         "UNKNOWN" (unresolvable).
# git-post-commit's vendor_dispatchable() treats MANUAL_CLAUDE / UNKNOWN as
# non-dispatchable → clean notify, never a bogus dispatch_<sentinel>.sh call.
claude_bg_dispatch_enabled() {
  [ "${CW_ENABLE_CLAUDE_BG:-0}" = "1" ] && return 0
  [ "$(git config --bool cowork.claudeBg 2>/dev/null || true)" = "true" ] && return 0
  return 1
}

determine_other_vendor() {
  local executor="$1"
  case "$executor" in
    Claude*|claude*)
      # Plan/build was Claude → cross-vendor peer is Codex (or Cursor, project pref)
      echo "codex"
      ;;
    Codex*|codex*|GPT*|gpt*)
      # Was Codex -> cross-vendor peer is Claude. Keep the old manual behavior
      # unless this workstation explicitly opted into Claude bg dispatch.
      if claude_bg_dispatch_enabled; then
        echo "claude"
      else
        echo "MANUAL_CLAUDE"
      fi
      ;;
    Cursor*|cursor*)
      echo "codex"
      ;;
    *)
      echo "UNKNOWN"
      ;;
  esac
}

# ----- 2. determine_lead_from_variant <variant> --------------
# Variant names the BUILD-phase external executor for the B-* / C-* families.
determine_lead_from_variant() {
  case "$1" in
    B-Codex|C-Codex) echo "codex" ;;
    B-Cursor|C-Cursor) echo "cursor" ;;
    *) echo "UNKNOWN" ;;
  esac
}

# ----- 3. render_review_prompt <feature> ---------------------
# Render the feature-review dispatch prompt (to stdout).
render_review_prompt() {
  local feature="$1"
  local feature_dir="packages/$feature"
  # newest discovery review + brief (may not exist)
  local discovery_review brief
  discovery_review=$(ls -t "docs/reviews/$feature"/*-discovery-review.md 2>/dev/null | head -1)
  brief=$(ls -t "docs/reviews/$feature"/*-feature-brief.md 2>/dev/null | head -1)

  cat <<EOF
Start the feature-review agent for $feature.

## Cross-vendor context
feature-plan ran on the lead vendor (Claude). You are the mandatory cross-vendor
reviewer (docs/workflow/SUBAGENT_WORKFLOW_V2.md §16.3 #3). Do NOT rewrite the plan — issue
APPROVED or REVISE and write the verdict to the dev_log Status Panel (you are
the authorized writer for the review verdict per §20.4).

## Read
- $feature_dir/docs/dev_log.md  (Status Panel — verify NEEDS_REVIEW first, §20.4)
- $feature_dir/docs/{design,api,test,plan}.md
$([ -n "$discovery_review" ] && echo "- $discovery_review")
$([ -n "$brief" ] && echo "- $brief")
- docs/workflow/SUBAGENT_WORKFLOW_V2.md §9.4 / §16.3 / §20.4 / §0.6

## Verify
- §9.4 single-file LOC ceiling
- §16.3 cross-vendor identity correct (plan executor != you)
- §20.4 Handoff schema + State Verification fields present
- Plan completeness (design/api/test/plan quartet)
- Any NEEDS_REVIEW special focus (read from dev_log Suggested Next)

Verdict → APPROVED or REVISE, written to the dev_log Status Panel (your authority per §20.4).
EOF
}

# ----- 4. render_build_prompt <feature> ----------------------
render_build_prompt() {
  local feature="$1"
  local feature_dir="packages/$feature"
  cat <<EOF
Start the feature-auto-build agent for $feature.

## Inputs (reviewed APPROVED — proceed to build)
- $feature_dir/docs/dev_log.md  (Status: APPROVED; executor lineage is the rolling \`- Executor:\` line — there is no dedicated Plan/Review Executor field)
- $feature_dir/docs/{plan,design,api,test}.md

## Task
Implement all approved phases per plan.md. Commit each phase separately with
Status Panel Phase Progress updates. Stop BEFORE verify (write
READY_FOR_VERIFY; do NOT verify yourself). The cross-vendor verify gate
auto-dispatches via the post-commit hook (if Verify Cross-vendor: yes) or
proceeds inline (if Verify Cross-vendor: no — check dev_log).

Verdict → READY_FOR_VERIFY or BLOCKED to the dev_log Status Panel.
EOF
}

# ----- 5. render_verify_prompt <feature> ---------------------
render_verify_prompt() {
  local feature="$1"
  local feature_dir="packages/$feature"
  cat <<EOF
Start the feature-verify agent for $feature.

## Cross-vendor context
You are the mandatory cross-vendor verifier (docs/workflow/SUBAGENT_WORKFLOW_V2.md §16.3 #5).
The build was done by a different vendor. Verify per the test.md acceptance gates.

## Read
- $feature_dir/docs/dev_log.md  (Status: READY_FOR_VERIFY; build executor is the rolling \`- Executor:\` line — there is no dedicated Build Executor field)
- $feature_dir/docs/{test,plan,design,api}.md
- docs/workflow/SUBAGENT_WORKFLOW_V2.md §16.3 #5

## Run
- All acceptance gates marked in test.md (pytest / npm test / playwright)
- §9.4 / §0.6 hard rules
- State Verification (§20.4)

Verdict → READY_TO_SHIP or BLOCKED to the dev_log Status Panel.
EOF
}

# ----- 6. notify_user <message> ------------------------------
notify_user() {
  local msg="$1"
  # macOS native notification (best-effort)
  osascript -e "display notification \"$msg\" with title \"Workflow Hook\"" 2>/dev/null || true
  # audit log
  local hook_log="/tmp/cw-quota/hook.log"
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $msg" >> "$hook_log"
  # terminal beep
  printf '\a' >/dev/tty 2>/dev/null || true
}
