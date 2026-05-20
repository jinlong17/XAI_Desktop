#!/usr/bin/env bash
# watch_roadmap_progress.sh — parallel track roadmap monitor
# Usage: watch_roadmap_progress.sh [refresh_secs]
#   No manifest argument needed — auto-scans all manifests and track logs.
#   Legacy single-manifest mode still works: watch_roadmap_progress.sh <roadmap.md> [refresh_secs]

ROADMAP_DIR="docs/workflow/roadmap"
QUOTA_DIR="/tmp/cw-quota"
ORCH_DIR="/tmp/cw-orchestrator"

# Detect legacy single-manifest mode
if [ -n "$1" ] && [ -f "$1" ]; then
  LEGACY_ROADMAP="$1"
  INTERVAL="${2:-30}"
else
  LEGACY_ROADMAP=""
  INTERVAL="${1:-30}"
fi

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'
CYAN='\033[0;36m'; BLUE='\033[0;34m'; MAGENTA='\033[0;35m'
BOLD='\033[1m'; DIM='\033[2m'; RESET='\033[0m'

_bar() {
  local filled=$1 total=$2 width=${3:-30}
  local blocks=0
  [ "$total" -gt 0 ] && blocks=$(( filled * width / total ))
  local rest=$(( width - blocks ))
  printf '['
  printf '%0.s█' $(seq 1 "$blocks") 2>/dev/null || printf '%*s' "$blocks" '' | tr ' ' '█'
  printf '%*s' "$rest" '' | tr ' ' '░'
  printf ']'
}

_mtime() {
  [ -f "$1" ] || return
  date -r "$1" '+%H:%M:%S' 2>/dev/null || stat -f '%Sm' "$1" 2>/dev/null
}

_mtime_full() {
  [ -f "$1" ] || return
  date -r "$1" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || stat -f '%Sm' "$1" 2>/dev/null
}

# Parse a single manifest table — returns ST:status=count lines
_parse_manifest() {
  local file="$1"
  [ -f "$file" ] || return
  awk -F'|' '
    /^\|[[:space:]]*[0-9]+[[:space:]]*\|/ {
      s = $7; sub(/^[[:space:]]+/, "", s); sub(/[[:space:]]+$/, "", s)
      slug = $3; sub(/^[[:space:]]+/, "", slug); sub(/[[:space:]]+$/, "", slug)
      status[s]++; total++
      printf "ROW:%s|%s\n", slug, s
    }
    END {
      for (s in status) printf "ST:%s=%d\n", s, status[s]
      printf "TOTAL=%d\n", total
    }
  ' "$file"
}

# ─── Track definition ────────────────────────────────────────────
# Each track: name, color, branch pattern, log files, manifests

TRACK_A_NAME="Track A: 桌面地基+数据层"
TRACK_A_COLOR="$GREEN"
TRACK_A_BRANCH="codex/track-a-desktop-foundation"
TRACK_A_EXECUTOR="Claude"

TRACK_B_NAME="Track B: 效率工具+控制台"
TRACK_B_COLOR="$CYAN"
TRACK_B_BRANCH="codex/track-b-productivity-console"
TRACK_B_EXECUTOR="Codex"

TRACK_C_NAME="Track C: 挂件+Web+AI"
TRACK_C_COLOR="$MAGENTA"
TRACK_C_BRANCH="codex/track-c-widgets-web-ai"
TRACK_C_EXECUTOR="Codex"

# ─── Render one manifest ─────────────────────────────────────────
_render_manifest() {
  local file="$1" label="$2"
  [ -f "$file" ] || return

  local data
  data=$(_parse_manifest "$file")

  local TOTAL SHIPPED READY IN_PROG BLOCKED BLOCKED_EXT ELIGIBLE
  TOTAL=$(printf '%s' "$data" | grep '^TOTAL=' | cut -d= -f2)
  SHIPPED=$(printf '%s' "$data" | grep '^ST:SHIPPED=' | cut -d= -f2)
  READY=$(printf '%s' "$data" | grep '^ST:READY_TO_SHIP=' | cut -d= -f2)
  IN_PROG=$(printf '%s' "$data" | grep '^ST:IN_PROGRESS=' | cut -d= -f2)
  BLOCKED=$(printf '%s' "$data" | grep '^ST:BLOCKED=' | cut -d= -f2)
  BLOCKED_EXT=$(printf '%s' "$data" | grep '^ST:BLOCKED_EXTERNAL=' | cut -d= -f2)
  ELIGIBLE=$(printf '%s' "$data" | grep '^ST:ELIGIBLE=' | cut -d= -f2)

  TOTAL=${TOTAL:-0}; SHIPPED=${SHIPPED:-0}; READY=${READY:-0}
  IN_PROG=${IN_PROG:-0}; BLOCKED=${BLOCKED:-0}; BLOCKED_EXT=${BLOCKED_EXT:-0}
  ELIGIBLE=${ELIGIBLE:-0}

  local done_count=$(( SHIPPED + READY ))

  printf "    ${BOLD}%-38s${RESET} " "$label"
  _bar "$done_count" "$TOTAL" 20
  printf " %d/%d" "$done_count" "$TOTAL"
  printf "  ${GREEN}S:%d${RESET} ${CYAN}R:%d${RESET} ${YELLOW}P:%d${RESET} ${DIM}E:%d${RESET} ${RED}B:%d${RESET}\n" \
    "$SHIPPED" "$READY" "$IN_PROG" "$ELIGIBLE" "$(( BLOCKED + BLOCKED_EXT ))"

  # Show non-shipped rows
  printf '%s\n' "$data" | grep '^ROW:' | while IFS=: read -r _ rest; do
    local slug status
    slug="${rest%%|*}"
    status="${rest##*|}"
    case "$status" in
      SHIPPED) ;;
      READY_TO_SHIP)   printf "      ${CYAN}✓ %-36s %s${RESET}\n" "$slug" "$status" ;;
      IN_PROGRESS)     printf "      ${YELLOW}▶ %-36s %s${RESET}\n" "$slug" "$status" ;;
      ELIGIBLE)        printf "      ${GREEN}○ %-36s %s${RESET}\n" "$slug" "$status" ;;
      BLOCKED*)        printf "      ${RED}✗ %-36s %s${RESET}\n" "$slug" "$status" ;;
      *)               printf "      ${DIM}· %-36s %s${RESET}\n" "$slug" "$status" ;;
    esac
  done
}

# ─── Render one track ─────────────────────────────────────────────
_render_track() {
  local name="$1" color="$2" branch="$3" executor="$4"
  shift 4
  # remaining args: log files to check

  printf "\n  ${BOLD}%b%s${RESET}  (${DIM}%s${RESET})\n" "$color" "$name" "$executor"

  # Branch status
  local branch_exists=0 commit_count=0 last_commit=""
  if git rev-parse --verify "$branch" >/dev/null 2>&1; then
    branch_exists=1
    commit_count=$(git rev-list --count main.."$branch" 2>/dev/null || echo 0)
    last_commit=$(git log "$branch" --oneline -1 2>/dev/null)
    printf "    ${BOLD}Branch:${RESET} %s  (%d commits ahead)\n" "$branch" "$commit_count"
    [ -n "$last_commit" ] && printf "    ${DIM}latest: %s${RESET}\n" "$last_commit"
  else
    printf "    ${BOLD}Branch:${RESET} ${YELLOW}%s (not created yet)${RESET}\n" "$branch"
  fi

  # Track log files
  for logfile in "$@"; do
    if [ -f "$logfile" ]; then
      local label entries last_line
      label=$(basename "$logfile")
      entries=$(grep -cE '^#{1,4} ' "$logfile" 2>/dev/null || echo 0)
      printf "    ${BOLD}Log:${RESET} %-38s sections=%-3s ${DIM}(%s)${RESET}\n" \
        "$label" "$entries" "$(_mtime_full "$logfile")"
      # Show last checkpoint-like line
      last_line=$(grep -iE '(checkpoint|feature|status|completed|blocked)' "$logfile" | tail -1 | sed 's/[[:space:]]\{2,\}/ /g')
      [ -n "$last_line" ] && printf "      ${DIM}%s${RESET}\n" "${last_line:0:100}"
    fi
  done
}

# ─── Aggregate all manifests ──────────────────────────────────────
_render_all_manifests() {
  printf "\n  ${BOLD}Gate Manifests:${RESET}\n"

  local any_manifest=0
  for f in "$ROADMAP_DIR"/xai-g*.md; do
    [ -f "$f" ] || continue
    any_manifest=1
    local label
    label=$(basename "$f" .md)
    _render_manifest "$f" "$label"
  done

  if [ "$any_manifest" -eq 0 ]; then
    printf "    ${YELLOW}(no manifests found in %s)${RESET}\n" "$ROADMAP_DIR"
  fi
}

# ─── Aggregate totals across all manifests ────────────────────────
_render_totals() {
  local total=0 shipped=0 ready=0 in_prog=0 blocked=0 blocked_ext=0 eligible=0

  for f in "$ROADMAP_DIR"/xai-g*.md; do
    [ -f "$f" ] || continue
    local data
    data=$(_parse_manifest "$f")
    local v
    v=$(printf '%s' "$data" | grep '^ST:SHIPPED=' | cut -d= -f2); shipped=$(( shipped + ${v:-0} ))
    v=$(printf '%s' "$data" | grep '^ST:READY_TO_SHIP=' | cut -d= -f2); ready=$(( ready + ${v:-0} ))
    v=$(printf '%s' "$data" | grep '^ST:IN_PROGRESS=' | cut -d= -f2); in_prog=$(( in_prog + ${v:-0} ))
    v=$(printf '%s' "$data" | grep '^ST:BLOCKED=' | cut -d= -f2); blocked=$(( blocked + ${v:-0} ))
    v=$(printf '%s' "$data" | grep '^ST:BLOCKED_EXTERNAL=' | cut -d= -f2); blocked_ext=$(( blocked_ext + ${v:-0} ))
    v=$(printf '%s' "$data" | grep '^ST:ELIGIBLE=' | cut -d= -f2); eligible=$(( eligible + ${v:-0} ))
    v=$(printf '%s' "$data" | grep '^TOTAL=' | cut -d= -f2); total=$(( total + ${v:-0} ))
  done

  local done_count=$(( shipped + ready ))

  printf "\n  ${BOLD}Overall Progress${RESET}  "
  _bar "$done_count" "$total" 36
  printf "  ${BOLD}%d / %d${RESET}\n" "$done_count" "$total"

  printf "  ${GREEN}SHIPPED${RESET} %-3d  " "$shipped"
  printf "${CYAN}READY${RESET} %-3d  " "$ready"
  printf "${YELLOW}IN_PROG${RESET} %-3d  " "$in_prog"
  printf "${GREEN}ELIGIBLE${RESET} %-3d  " "$eligible"
  printf "${RED}BLOCKED${RESET} %-3d  " "$blocked"
  printf "${DIM}EXT${RESET} %-3d\n" "$blocked_ext"
}

# ─── Shared logs (deferred gates, incidents) ──────────────────────
_render_shared_logs() {
  printf "\n  ${BOLD}Shared Logs:${RESET}\n"

  for sidecar in \
    "$ROADMAP_DIR/xai-v1.deferred-gates.md" \
    "$ROADMAP_DIR/xai-v1.incidents.md" \
    "$ROADMAP_DIR/xai-v1.parallel-wave-plan.md"; do
    local label
    label=$(basename "$sidecar")
    if [ -f "$sidecar" ]; then
      local entries
      entries=$(grep -cE '^(##+ |-|[0-9]+\. )' "$sidecar" 2>/dev/null || echo 0)
      printf "    %-42s entries~%-4s ${DIM}(%s)${RESET}\n" \
        "$label" "$entries" "$(_mtime_full "$sidecar")"
    else
      printf "    %-42s ${YELLOW}(missing)${RESET}\n" "$label"
    fi
  done
}

# ─── Process monitor ──────────────────────────────────────────────
_render_processes() {
  printf "\n  ${BOLD}Executor Processes:${RESET}\n"

  # Claude
  local claude_active=0 claude_done=0
  local claude_data
  claude_data=$(python3 - <<'PY' 2>/dev/null
import json, os, glob
jobs_dir = os.path.expanduser("~/.claude/jobs")
active, done = [], []
for f in glob.glob(f"{jobs_dir}/*/state.json"):
    try:
        d = json.load(open(f))
        state = d.get("state", "?")
        name = d.get("name") or d.get("title") or os.path.basename(os.path.dirname(f))[:8]
        if state == "working":
            active.append(name)
        elif state == "done":
            done.append(name)
    except Exception:
        pass
print(f"ACTIVE={len(active)}")
print(f"DONE={len(done)}")
for a in active:
    print(f"JOB:{a}")
PY
)
  claude_active=$(printf '%s' "$claude_data" | grep '^ACTIVE=' | cut -d= -f2)
  claude_done=$(printf '%s' "$claude_data" | grep '^DONE=' | cut -d= -f2)
  claude_active=${claude_active:-0}; claude_done=${claude_done:-0}

  printf "    ${GREEN}Claude:${RESET}  ${YELLOW}%s working${RESET} / %s done" "$claude_active" "$claude_done"
  local claude_jobs
  claude_jobs=$(printf '%s' "$claude_data" | grep '^JOB:' | cut -c5-)
  [ -n "$claude_jobs" ] && printf "  —  %s" "$claude_jobs"
  printf "\n"

  # Codex
  local codex_exec_n codex_goal_n codex_interactive_n
  codex_exec_n=$(pgrep -c -f "codex exec" 2>/dev/null || echo 0)
  codex_goal_n=$(pgrep -c -f "codex goal" 2>/dev/null || echo 0)
  codex_interactive_n=$(pgrep -cf "codex$" 2>/dev/null || echo 0)
  local codex_total=$(( codex_exec_n + codex_goal_n + codex_interactive_n ))

  printf "    ${CYAN}Codex:${RESET}   %d proc (exec=%d goal=%d interactive=%d)" \
    "$codex_total" "$codex_exec_n" "$codex_goal_n" "$codex_interactive_n"

  # Quota
  local marker="$QUOTA_DIR/codex-exhausted-until"
  if [ -f "$marker" ]; then
    local until now
    until=$(cat "$marker" 2>/dev/null)
    now=$(date +%s)
    if [ -n "$until" ] && [ "$until" -gt "$now" ]; then
      local secs_left=$(( until - now ))
      local mins=$(( secs_left / 60 ))
      printf "  ${RED}QUOTA EXHAUSTED %dm left${RESET}" "$mins"
    else
      printf "  quota=${GREEN}OK${RESET}"
    fi
  else
    printf "  quota=${GREEN}OK${RESET}"
  fi
  printf "\n"
}

# ─── Git multi-branch overview ────────────────────────────────────
_render_git() {
  printf "\n  ${BOLD}Git:${RESET}\n"

  local current
  current=$(git branch --show-current 2>/dev/null || echo "?")
  local staged dirty untracked
  staged=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
  dirty=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
  untracked=$(git ls-files --others --exclude-standard 2>/dev/null | head -100 | wc -l | tr -d ' ')
  printf "    current=%s  staged=%s modified=%s untracked=%s\n" \
    "$current" "${staged:-0}" "${dirty:-0}" "${untracked:-0}"

  # Show track branches
  local track_branches
  track_branches=$(git branch --list 'codex/track-*' 2>/dev/null)
  if [ -n "$track_branches" ]; then
    printf "    ${BOLD}Track branches:${RESET}\n"
    printf '%s\n' "$track_branches" | while IFS= read -r b; do
      b=$(echo "$b" | tr -d '* ')
      local ahead behind last
      ahead=$(git rev-list --count main.."$b" 2>/dev/null || echo 0)
      behind=$(git rev-list --count "$b"..main 2>/dev/null || echo 0)
      last=$(git log "$b" --oneline -1 --format='%h %s' 2>/dev/null)
      printf "      %-44s +%s/-%s  ${DIM}%s${RESET}\n" "$b" "$ahead" "$behind" "${last:0:60}"
    done
  fi

  # Also show main worktree branch recent commits
  printf "    ${BOLD}Recent (current branch):${RESET}\n"
  git log --oneline -3 2>/dev/null | while IFS= read -r line; do
    printf "      ${DIM}%s${RESET}\n" "$line"
  done

  # Worktrees
  local worktrees
  worktrees=$(git worktree list 2>/dev/null | grep -v "$(pwd)")
  if [ -n "$worktrees" ]; then
    printf "    ${BOLD}Worktrees:${RESET}\n"
    printf '%s\n' "$worktrees" | while IFS= read -r wt; do
      printf "      ${DIM}%s${RESET}\n" "$wt"
    done
  fi
}

# ─── Main render ──────────────────────────────────────────────────
_render() {
  printf "\n ${BOLD}=== XAI v1 Parallel Roadmap Monitor ===${RESET}\n"
  printf " ${DIM}3 tracks × 8-10h  |  A=Claude  B+C=Codex  |  %s${RESET}\n" "$(date '+%Y-%m-%d %H:%M:%S')"

  # Overall totals
  _render_totals

  # All gate manifests
  _render_all_manifests

  # Three tracks
  _render_track "$TRACK_A_NAME" "$TRACK_A_COLOR" "$TRACK_A_BRANCH" "$TRACK_A_EXECUTOR" \
    "$ROADMAP_DIR/xai-v1.autorun-$(date '+%Y%m%d').md" \
    "$ROADMAP_DIR/xai-v1.autorun-20260519.md"

  _render_track "$TRACK_B_NAME" "$TRACK_B_COLOR" "$TRACK_B_BRANCH" "$TRACK_B_EXECUTOR" \
    "$ROADMAP_DIR/xai-v1.track-b-log.md"

  _render_track "$TRACK_C_NAME" "$TRACK_C_COLOR" "$TRACK_C_BRANCH" "$TRACK_C_EXECUTOR" \
    "$ROADMAP_DIR/xai-v1.track-c-log.md"

  # Shared logs
  _render_shared_logs

  # Processes
  _render_processes

  # Git
  _render_git

  printf "\n  ${DIM}Refresh: %ds  |  Ctrl-C to quit${RESET}\n" "$INTERVAL"
}

# ─── Legacy mode (single manifest) ───────────────────────────────
_render_legacy() {
  local file="$LEGACY_ROADMAP"
  local data
  data=$(_parse_manifest "$file")
  local TOTAL SHIPPED READY
  TOTAL=$(printf '%s' "$data" | grep '^TOTAL=' | cut -d= -f2)
  SHIPPED=$(printf '%s' "$data" | grep '^ST:SHIPPED=' | cut -d= -f2)
  READY=$(printf '%s' "$data" | grep '^ST:READY_TO_SHIP=' | cut -d= -f2)
  TOTAL=${TOTAL:-0}; SHIPPED=${SHIPPED:-0}; READY=${READY:-0}
  local done_count=$(( SHIPPED + READY ))

  printf "\n ${BOLD}=== Roadmap Progress Monitor (legacy) ===${RESET}\n"
  printf "\n  ${BOLD}%s${RESET}  " "$(basename "$file" .md)"
  _bar "$done_count" "$TOTAL" 36
  printf "  ${BOLD}%d / %d${RESET}\n\n" "$done_count" "$TOTAL"

  _render_manifest "$file" "$(basename "$file" .md)"

  _render_shared_logs
  _render_processes
  _render_git

  printf "\n  ${DIM}Refresh: %ds  |  Ctrl-C to quit${RESET}\n" "$INTERVAL"
}

# ─── Main loop ────────────────────────────────────────────────────
while true; do
  clear
  if [ -n "$LEGACY_ROADMAP" ]; then
    _render_legacy
  else
    _render
  fi
  sleep "$INTERVAL"
done
