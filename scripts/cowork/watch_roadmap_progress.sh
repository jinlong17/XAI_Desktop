#!/usr/bin/env bash
# watch_roadmap_progress.sh — live roadmap status monitor
# Usage: watch_roadmap_progress.sh <roadmap.md> [refresh_secs]

ROADMAP="${1:?Usage: $0 <roadmap.md> [refresh_secs]}"
INTERVAL="${2:-2}"
QUOTA_DIR="/tmp/cw-quota"
ORCH_DIR="/tmp/cw-orchestrator"
ROADMAP_DIR="$(cd "$(dirname "$ROADMAP")" 2>/dev/null && pwd -P)"
ROADMAP_FILE="$(basename "$ROADMAP")"
ROADMAP_BASE="${ROADMAP_FILE%.md}"
TASK_PLAN="$ROADMAP_DIR/$ROADMAP_BASE.tasks.md"
DEFERRED_GATES="$ROADMAP_DIR/$ROADMAP_BASE.deferred-gates.md"
INCIDENTS="$ROADMAP_DIR/$ROADMAP_BASE.incidents.md"

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'
CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[2m'; RESET='\033[0m'

_bar() {
  local filled=$1 total=$2 width=${3:-40}
  local blocks=0
  [ "$total" -gt 0 ] && blocks=$(( filled * width / total ))
  local rest=$(( width - blocks ))
  printf '['
  printf '%0.s█' $(seq 1 "$blocks") 2>/dev/null || printf '%*s' "$blocks" '' | tr ' ' '█'
  printf '%*s' "$rest" '' | tr ' ' '░'
  printf ']'
}

# Parse roadmap table — Status is field $7 (pipe-delimited), Slug is $3
_parse_roadmap() {
  awk -F'|' '
    /^\|[[:space:]]*[0-9]+[[:space:]]*\|/ {
      s = $7; sub(/^[[:space:]]+/, "", s); sub(/[[:space:]]+$/, "", s)
      slug = $3; sub(/^[[:space:]]+/, "", slug); sub(/[[:space:]]+$/, "", slug)
      status[s]++; total++
      if (s == "IN_PROGRESS") slugs[nc++] = slug
    }
    END {
      for (s in status) printf "ST:%s=%d\n", s, status[s]
      printf "TOTAL=%d\n", total
      for (i = 0; i < nc; i++) printf "IP:%s\n", slugs[i]
    }
  ' "$ROADMAP"
}

_latest_autorun_log() {
  local today candidate
  today=$(date '+%Y%m%d')
  candidate="$ROADMAP_DIR/$ROADMAP_BASE.autorun-$today.md"
  if [ -f "$candidate" ]; then
    printf '%s' "$candidate"
    return
  fi
  ls -t "$ROADMAP_DIR/$ROADMAP_BASE".autorun-*.md 2>/dev/null | head -1
}

_mtime() {
  [ -f "$1" ] || return
  date -r "$1" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || stat -f '%Sm' "$1" 2>/dev/null
}

_task_summary() {
  [ -f "$TASK_PLAN" ] || return
  awk '
    /^- \[[xX]\]/ { done++ }
    /^- \[~\]/ { active++ }
    /^- \[!\]/ { blocked++ }
    /^- \[E\]/ { external++ }
    /^- \[ \]/ { pending++ }
    END {
      total = done + active + blocked + external + pending
      if (total > 0) {
        printf "done=%d active=%d pending=%d blocked=%d external=%d total=%d\n",
          done, active, pending, blocked, external, total
      }
    }
  ' "$TASK_PLAN"
}

_roadmap_lists() {
  python3 - "$ROADMAP" <<'PY' 2>/dev/null
import re, sys
path = sys.argv[1]
rows = []
with open(path, encoding="utf-8") as f:
    for line in f:
        if not re.match(r"^\|\s*\d+\s*\|", line):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 10:
            continue
        rows.append({
            "num": cells[0], "slug": cells[1], "deps": cells[3],
            "status": cells[5], "mode": cells[6], "last": cells[8],
            "note": cells[9],
        })

status = {r["slug"]: r["status"] for r in rows}

def deps_ok(raw):
    if raw in ("", "—", "-"):
        return True
    deps = [d.strip() for d in raw.split(",") if d.strip()]
    return all(status.get(d) == "SHIPPED" for d in deps)

def emit(label, items, limit):
    print(f"{label}_COUNT={len(items)}")
    for r in items[:limit]:
        note = re.sub(r"\s+", " ", r["note"])[:90]
        print(f"{label}:{r['num']}|{r['slug']}|{r['status']}|{r['mode']}|{note}")

emit("READY", [r for r in rows if r["status"] == "READY_TO_SHIP"], 8)
emit("ACTIVE", [r for r in rows if r["status"] == "IN_PROGRESS"], 8)
emit("BLOCKED", [r for r in rows if r["status"] == "BLOCKED"], 8)
emit("EXTERNAL", [r for r in rows if r["status"] == "BLOCKED_EXTERNAL"], 8)
eligible = [r for r in rows if r["status"] == "PENDING" and deps_ok(r["deps"])]
emit("ELIGIBLE", eligible, 10)
PY
}

_render_row_list() {
  local label="$1" color="$2" data="$3" prefix="$4"
  local rows count
  count=$(printf '%s' "$data" | grep "^${prefix}_COUNT=" | cut -d= -f2)
  rows=$(printf '%s' "$data" | grep "^${prefix}:")
  [ -n "$count" ] || count=0
  printf "  ${BOLD}%s:${RESET} %s\n" "$label" "$count"
  if [ -n "$rows" ]; then
    printf '%s\n' "$rows" | while IFS=: read -r _ rest; do
      IFS='|' read -r num slug status mode note <<EOF
$rest
EOF
      printf "    ${color}#%-2s %-34s${RESET} %-15s %s\n" "$num" "$slug" "$mode" "$note"
    done
  fi
}

# Sum input/output tokens across all JSONL run logs in QUOTA_DIR
_token_summary() {
  local total_in=0 total_out=0 file_count=0
  for f in "$QUOTA_DIR"/*.jsonl; do
    [ -f "$f" ] || continue
    file_count=$(( file_count + 1 ))
    while IFS= read -r line; do
      local v
      v=$(printf '%s' "$line" | grep -o '"input_tokens"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
      [ -n "$v" ] && total_in=$(( total_in + v ))
      v=$(printf '%s' "$line" | grep -o '"output_tokens"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
      [ -n "$v" ] && total_out=$(( total_out + v ))
    done < "$f"
  done
  [ "$file_count" -gt 0 ] && [ $(( total_in + total_out )) -gt 0 ] && \
    printf "in=%-7d out=%-7d  (%d log files)" "$total_in" "$total_out" "$file_count"
}

# Read Claude bg sessions from ~/.claude/jobs/*/state.json
_claude_sessions() {
  python3 - <<'PY' 2>/dev/null
import json, os, glob

jobs_dir = os.path.expanduser("~/.claude/jobs")
active, done = [], []
for f in glob.glob(f"{jobs_dir}/*/state.json"):
    try:
        d = json.load(open(f))
        state = d.get("state", "?")
        name  = d.get("name") or d.get("title") or os.path.basename(os.path.dirname(f))[:8]
        tempo = d.get("tempo", "?")
        needs = d.get("needs")
        if state == "working":
            tag = f"  ⚡ {name}  [{tempo}{'  needs='+str(needs) if needs else ''}]"
            active.append(tag)
        elif state == "done":
            done.append(name)
    except Exception:
        pass

print(f"CLAUDE_ACTIVE={len(active)}")
for s in active:
    print(f"CLAUDE_JOB:{s}")
print(f"CLAUDE_DONE={len(done)}")
PY
}

_quota_status() {
  local marker="$QUOTA_DIR/codex-exhausted-until"
  if [ -f "$marker" ]; then
    local until now secs_left
    until=$(cat "$marker" 2>/dev/null)
    now=$(date +%s)
    if [ -n "$until" ] && [ "$until" -gt "$now" ]; then
      secs_left=$(( until - now ))
      local mins=$(( secs_left / 60 )) secs=$(( secs_left % 60 ))
      printf "${RED}EXHAUSTED — %dm%02ds remaining${RESET}" "$mins" "$secs"
      return
    fi
  fi
  printf "${GREEN}OK${RESET}"
}

# Per-dispatch JSONL status: parse last event type from each run log
_codex_dispatch_detail() {
  local dispatches=0 running=0 completed=0 failed=0
  local details=""

  # Scan orchestrator markers for active dispatches
  for marker in "$ORCH_DIR"/*_dispatched; do
    [ -f "$marker" ] || continue
    dispatches=$(( dispatches + 1 ))
    local base mtime_str feature agent vendor
    base=$(basename "$marker" | sed 's/_dispatched$//')
    mtime_str=$(_mtime "$marker")

    # Parse feature.agent.vendor from marker filename
    # dispatch_codex.sh writes: <feature>.<agent>.codex_dispatched
    # dispatch_cursor.sh writes: <feature>.<agent>.cursor_dispatched
    # Vendor is always the last dot-segment; agent is second-to-last.
    # Feature may itself contain dots so we peel from the right.
    vendor="${base##*.}"
    local without_vendor="${base%.*}"
    agent="${without_vendor##*.}"
    feature="${without_vendor%.*}"

    # Find matching JSONL run log
    local log_file="$QUOTA_DIR/${feature}.${agent}.${vendor}.last_run.jsonl"
    local status_str="${YELLOW}dispatched${RESET}"
    local tokens_str=""

    if [ -f "$log_file" ]; then
      local last_type
      last_type=$(tail -1 "$log_file" 2>/dev/null | grep -o '"type"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
      case "$last_type" in
        turn.completed)
          status_str="${GREEN}completed${RESET}"
          completed=$(( completed + 1 ))
          # Extract token usage from last line
          local in_tok out_tok
          in_tok=$(tail -1 "$log_file" | grep -o '"input_tokens"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
          out_tok=$(tail -1 "$log_file" | grep -o '"output_tokens"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
          [ -n "$in_tok" ] && tokens_str="  in=${in_tok} out=${out_tok}"
          ;;
        turn.started|item.started)
          status_str="${YELLOW}running${RESET}"
          running=$(( running + 1 ))
          ;;
        error|turn.failed)
          status_str="${RED}failed${RESET}"
          failed=$(( failed + 1 ))
          ;;
        *)
          [ -n "$last_type" ] && status_str="${DIM}${last_type}${RESET}"
          ;;
      esac
    fi

    details="${details}$(printf "    %-28s %-18s %b%s\n" "$feature" "$agent" "$status_str" "$tokens_str")\n"
  done

  printf "DISPATCH_TOTAL=%d\n" "$dispatches"
  printf "DISPATCH_RUNNING=%d\n" "$running"
  printf "DISPATCH_COMPLETED=%d\n" "$completed"
  printf "DISPATCH_FAILED=%d\n" "$failed"
  [ -n "$details" ] && printf "DISPATCH_DETAILS:\n%b" "$details"
}

# Hook call log: parse /tmp/cw-quota/hook.log for Claude→Codex dispatches
_hook_call_summary() {
  local hook_log="$QUOTA_DIR/hook.log"
  [ -f "$hook_log" ] || return

  local total today_count last_5
  total=$(wc -l < "$hook_log" | tr -d ' ')
  local today
  today=$(date '+%Y-%m-%d')
  today_count=$(grep -c "$today" "$hook_log" 2>/dev/null || echo 0)
  last_5=$(tail -5 "$hook_log")

  printf "HOOK_TOTAL=%d\n" "$total"
  printf "HOOK_TODAY=%d\n" "$today_count"
  [ -n "$last_5" ] && printf "HOOK_TAIL:\n%s\n" "$last_5"
}

# Review/patch sidecar files (created by Claude review goal)
_review_sidecars() {
  local today
  today=$(date '+%Y%m%d')
  local review_file="$ROADMAP_DIR/$ROADMAP_BASE.review-$today.md"
  local patches_file="$ROADMAP_DIR/$ROADMAP_BASE.patches-$today.md"

  for sidecar in "$review_file" "$patches_file"; do
    local label
    label=$(basename "$sidecar")
    if [ -f "$sidecar" ]; then
      local entries pass needs_patch
      entries=$(grep -Ec '^## Feature' "$sidecar" 2>/dev/null || echo 0)
      pass=$(grep -c 'PASS' "$sidecar" 2>/dev/null || echo 0)
      needs_patch=$(grep -c 'NEEDS_PATCH' "$sidecar" 2>/dev/null || echo 0)
      printf "    %-34s reviewed=%-3s pass=%-3s patch=%-3s ${DIM}(%s)${RESET}\n" \
        "$label" "$entries" "$pass" "$needs_patch" "$(_mtime "$sidecar")"
    fi
  done
}

_render() {
  local data
  data=$(_parse_roadmap)
  local lists
  lists=$(_roadmap_lists)

  local TOTAL PENDING SHIPPED IN_PROG READY_TO_SHIP BLOCKED BLOCKED_EXT
  TOTAL=$(printf '%s' "$data" | grep '^TOTAL=' | cut -d= -f2)
  PENDING=$(printf '%s' "$data" | grep '^ST:PENDING=' | cut -d= -f2)
  SHIPPED=$(printf '%s' "$data" | grep '^ST:SHIPPED=' | cut -d= -f2)
  IN_PROG=$(printf '%s' "$data" | grep '^ST:IN_PROGRESS=' | cut -d= -f2)
  READY_TO_SHIP=$(printf '%s' "$data" | grep '^ST:READY_TO_SHIP=' | cut -d= -f2)
  BLOCKED=$(printf '%s' "$data" | grep '^ST:BLOCKED=' | cut -d= -f2)
  BLOCKED_EXT=$(printf '%s' "$data" | grep '^ST:BLOCKED_EXTERNAL=' | cut -d= -f2)

  TOTAL=${TOTAL:-0}; PENDING=${PENDING:-0}; SHIPPED=${SHIPPED:-0}
  IN_PROG=${IN_PROG:-0}; READY_TO_SHIP=${READY_TO_SHIP:-0}
  BLOCKED=${BLOCKED:-0}; BLOCKED_EXT=${BLOCKED_EXT:-0}

  local rname
  rname=$(basename "$ROADMAP" .md)

  printf "\n ${BOLD}%-24s${RESET} " "$rname"
  _bar "$SHIPPED" "$TOTAL" 36
  printf "  ${BOLD}%d / %d${RESET}\n\n" "$SHIPPED" "$TOTAL"

  printf "  ${GREEN}SHIPPED${RESET}        %-4d  " "$SHIPPED"
  printf "${CYAN}READY_TO_SHIP${RESET}  %-4d  " "$READY_TO_SHIP"
  printf "${YELLOW}IN_PROGRESS${RESET}    %-4d\n" "$IN_PROG"
  printf "  ${DIM}PENDING${RESET}        %-4d  " "$PENDING"
  printf "${RED}BLOCKED${RESET}        %-4d  " "$BLOCKED"
  printf "${DIM}EXT_BLOCKED${RESET}    %-4d${RESET}\n\n" "$BLOCKED_EXT"

  local task_data task_done task_active task_pending task_blocked task_external task_total
  task_data=$(_task_summary)
  if [ -n "$task_data" ]; then
    task_done=$(printf '%s' "$task_data" | grep -o 'done=[0-9]*' | cut -d= -f2)
    task_active=$(printf '%s' "$task_data" | grep -o 'active=[0-9]*' | cut -d= -f2)
    task_pending=$(printf '%s' "$task_data" | grep -o 'pending=[0-9]*' | cut -d= -f2)
    task_blocked=$(printf '%s' "$task_data" | grep -o 'blocked=[0-9]*' | cut -d= -f2)
    task_external=$(printf '%s' "$task_data" | grep -o 'external=[0-9]*' | cut -d= -f2)
    task_total=$(printf '%s' "$task_data" | grep -o 'total=[0-9]*' | cut -d= -f2)
    printf "  ${BOLD}Task plan:${RESET}      done=%s active=%s pending=%s blocked=%s external=%s total=%s\n\n" \
      "${task_done:-0}" "${task_active:-0}" "${task_pending:-0}" "${task_blocked:-0}" "${task_external:-0}" "${task_total:-0}"
  fi

  local autorun_log
  autorun_log=$(_latest_autorun_log)
  printf "  ${BOLD}Autorun logs:${RESET}\n"
  if [ -n "$autorun_log" ] && [ -f "$autorun_log" ]; then
    printf "    log:       %s  ${DIM}(updated %s)${RESET}\n" "${autorun_log#$PWD/}" "$(_mtime "$autorun_log")"
    printf "    checkpoint tail:\n"
    grep -E '(^#{1,4}[[:space:]]|checkpoint|Checkpoint|current|Current|feature|Feature|completed|Completed|blocked|Blocked|incident|Incident)' "$autorun_log" \
      | tail -8 \
      | sed 's/[[:space:]]\{1,\}/ /g' \
      | while IFS= read -r line; do printf "      ${DIM}%s${RESET}\n" "$line"; done
  else
    printf "    ${YELLOW}(missing)${RESET} expected: %s.autorun-YYYYMMDD.md\n" "$ROADMAP_DIR/$ROADMAP_BASE"
  fi
  for sidecar in "$DEFERRED_GATES" "$INCIDENTS"; do
    local label entries
    label=$(basename "$sidecar")
    if [ -f "$sidecar" ]; then
      entries=$(grep -Ec '^(##+ |-|[0-9]+\. )' "$sidecar" 2>/dev/null)
      entries=${entries:-0}
      printf "    %-34s entries~%-4s ${DIM}(updated %s)${RESET}\n" "$label" "$entries" "$(_mtime "$sidecar")"
    else
      printf "    %-34s ${YELLOW}(missing)${RESET}\n" "$label"
    fi
  done
  printf "\n"

  # Claude bg sessions (primary source of truth)
  local claude_data claude_active claude_done
  claude_data=$(_claude_sessions)
  claude_active=$(printf '%s' "$claude_data" | grep '^CLAUDE_ACTIVE=' | cut -d= -f2)
  claude_done=$(printf '%s' "$claude_data" | grep '^CLAUDE_DONE=' | cut -d= -f2)
  claude_active=${claude_active:-0}; claude_done=${claude_done:-0}

  printf "  ${BOLD}Claude bg sessions:${RESET}  ${YELLOW}%s working${RESET}  /  %s done\n" \
    "$claude_active" "$claude_done"
  printf '%s' "$claude_data" | grep '^CLAUDE_JOB:' | cut -c12- | while IFS= read -r job; do
    printf "    ${YELLOW}%s${RESET}\n" "$job"
  done
  printf "\n"

  # Codex / Cursor CLI dispatch (D-Codex / D-Cursor automation mode)
  local codex_n cursor_n
  codex_n=$(pgrep -c -f "codex exec" 2>/dev/null || echo 0)
  cursor_n=$(pgrep -c -f "cursor-agent" 2>/dev/null || echo 0)
  local orch_dispatched=0
  [ -d "$ORCH_DIR" ] && orch_dispatched=$(find "$ORCH_DIR" -name "*_dispatched" -mmin -11 2>/dev/null | wc -l | tr -d ' ')

  printf "  ${BOLD}Codex CLI:${RESET} %s proc  |  ${BOLD}Cursor CLI:${RESET} %s proc  |  orch markers (11m): %s\n" \
    "$codex_n" "$cursor_n" "$orch_dispatched"
  local goal_n
  goal_n=$(pgrep -c -f "codex goal" 2>/dev/null || echo 0)
  printf "  ${BOLD}Codex goal:${RESET} %s proc\n" "$goal_n"
  printf "  Codex quota:  "
  _quota_status
  printf "\n\n"

  # Codex dispatch detail (per-feature JSONL status)
  local dispatch_data dispatch_total dispatch_running dispatch_completed dispatch_failed
  dispatch_data=$(_codex_dispatch_detail)
  dispatch_total=$(printf '%s' "$dispatch_data" | grep '^DISPATCH_TOTAL=' | cut -d= -f2)
  dispatch_running=$(printf '%s' "$dispatch_data" | grep '^DISPATCH_RUNNING=' | cut -d= -f2)
  dispatch_completed=$(printf '%s' "$dispatch_data" | grep '^DISPATCH_COMPLETED=' | cut -d= -f2)
  dispatch_failed=$(printf '%s' "$dispatch_data" | grep '^DISPATCH_FAILED=' | cut -d= -f2)
  dispatch_total=${dispatch_total:-0}; dispatch_running=${dispatch_running:-0}
  dispatch_completed=${dispatch_completed:-0}; dispatch_failed=${dispatch_failed:-0}

  if [ "$dispatch_total" -gt 0 ]; then
    printf "  ${BOLD}Codex dispatches:${RESET}  %d total  " "$dispatch_total"
    [ "$dispatch_running" -gt 0 ] && printf "${YELLOW}%d running${RESET}  " "$dispatch_running"
    [ "$dispatch_completed" -gt 0 ] && printf "${GREEN}%d done${RESET}  " "$dispatch_completed"
    [ "$dispatch_failed" -gt 0 ] && printf "${RED}%d failed${RESET}  " "$dispatch_failed"
    printf "\n"
    printf '%s' "$dispatch_data" | sed -n '/^DISPATCH_DETAILS:/,$ { /^DISPATCH_DETAILS:/d; p; }'
    printf "\n"
  fi

  _render_row_list "READY_TO_SHIP rows" "$CYAN" "$lists" "READY"
  _render_row_list "IN_PROGRESS rows" "$YELLOW" "$lists" "ACTIVE"
  _render_row_list "BLOCKED rows" "$RED" "$lists" "BLOCKED"
  _render_row_list "BLOCKED_EXTERNAL rows" "$DIM" "$lists" "EXTERNAL"
  _render_row_list "Eligible PENDING rows" "$GREEN" "$lists" "ELIGIBLE"
  printf "\n"

  # Token usage from JSONL logs (best-effort)
  local tok
  tok=$(_token_summary)
  if [ -n "$tok" ]; then
    printf "  ${BOLD}Token usage (run logs):${RESET}  %s\n\n" "$tok"
  fi

  printf "  ${BOLD}Git:${RESET}\n"
  local branch dirty staged untracked recent
  branch=$(git branch --show-current 2>/dev/null || echo "?")
  staged=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
  dirty=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
  untracked=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
  printf "    branch=%s staged=%s modified=%s untracked=%s\n" "$branch" "${staged:-0}" "${dirty:-0}" "${untracked:-0}"
  recent=$(git log --oneline --decorate -5 2>/dev/null)
  if [ -n "$recent" ]; then
    printf '%s\n' "$recent" | while IFS= read -r line; do
      printf "    ${DIM}%s${RESET}\n" "$line"
    done
  fi
  printf "\n"

  # Recent dispatch log
  printf "  ${BOLD}Recent dispatch log:${RESET}\n"
  if [ -f "$QUOTA_DIR/post_commit.log" ]; then
    tail -7 "$QUOTA_DIR/post_commit.log" | while IFS= read -r line; do
      printf "    ${DIM}%s${RESET}\n" "$line"
    done
  else
    printf "    ${DIM}(no dispatch log yet)${RESET}\n"
  fi
  printf "\n"

  # Hook call log (Claude→Codex/Cursor dispatches via lib_hook_helpers.sh)
  local hook_data hook_total hook_today
  hook_data=$(_hook_call_summary)
  if [ -n "$hook_data" ]; then
    hook_total=$(printf '%s' "$hook_data" | grep '^HOOK_TOTAL=' | cut -d= -f2)
    hook_today=$(printf '%s' "$hook_data" | grep '^HOOK_TODAY=' | cut -d= -f2)
    hook_total=${hook_total:-0}; hook_today=${hook_today:-0}
    printf "  ${BOLD}Hook calls:${RESET}  %d total  /  %d today\n" "$hook_total" "$hook_today"
    local hook_tail
    hook_tail=$(printf '%s' "$hook_data" | sed -n '/^HOOK_TAIL:/,$ { /^HOOK_TAIL:/d; p; }')
    if [ -n "$hook_tail" ]; then
      printf '%s\n' "$hook_tail" | while IFS= read -r line; do
        printf "    ${DIM}%s${RESET}\n" "$line"
      done
    fi
    printf "\n"
  fi

  # Review/patch sidecars (created by Claude review goal)
  local review_output
  review_output=$(_review_sidecars)
  if [ -n "$review_output" ]; then
    printf "  ${BOLD}Review sidecars:${RESET}\n"
    printf '%s\n' "$review_output"
    printf "\n"
  fi

  printf "  ${DIM}Updated: %s  (every %ds)  Ctrl-C to quit${RESET}\n" \
    "$(date '+%H:%M:%S')" "$INTERVAL"
}

while true; do
  clear
  printf "\n ${BOLD}=== Roadmap Progress Monitor ===${RESET}\n"
  _render
  sleep "$INTERVAL"
done
