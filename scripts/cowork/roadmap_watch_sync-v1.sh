#!/usr/bin/env bash
# Roadmap auto-conductor watcher for sync-v1 / feature roadmap-kickoff (bg session b8b06068).
# Exits (re-invoking the conductor) when a terminal dev_log Status is observed,
# or after a bounded number of polls so the conductor can re-arm the watch.
set -u
MAIN_REPO="/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop"
SESSION="b8b06068"
INTERVAL=90
MAX_POLLS=28          # ~42 min then hand back to the conductor to re-arm
cd "$MAIN_REPO" || exit 99

scan() {
  # Search every git worktree (incl. the bg-session worktree) for a feature dev_log.
  git worktree list --porcelain 2>/dev/null | awk '/^worktree /{print $2}' | while read -r wt; do
    [ -d "$wt" ] || continue
    find "$wt/packages" "$wt/docs" -name dev_log.md -newermt "2026-05-18 00:00" 2>/dev/null | grep -v node_modules
  done | sort -u
}

for i in $(seq 1 "$MAX_POLLS"); do
  HITS="$(scan)"
  if [ -n "$HITS" ]; then
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      ST="$(grep -E '^[[:space:]]*Status:[[:space:]]*(READY_TO_SHIP|BLOCKED|SHIPPED)' "$f" | tail -1)"
      if [ -n "$ST" ]; then
        echo "TERMINAL_SIGNAL"
        echo "file=$f"
        echo "$ST"
        echo "--- Status Panel context ---"
        grep -nE '^[[:space:]]*(Workflow|Status|Executor|Updated|Suggested Next|Blocker|Verify Cross-vendor):' "$f" | tail -20
        exit 0
      fi
    done <<< "$HITS"
    echo "poll $i/$MAX_POLLS: dev_log present, no terminal status yet:"
    echo "$HITS"
  else
    echo "poll $i/$MAX_POLLS: no dev_log yet (worktree/file edits not started)"
  fi
  sleep "$INTERVAL"
done
echo "WATCH_WINDOW_ELAPSED"
echo "No terminal dev_log status after $((MAX_POLLS*INTERVAL/60)) min. Re-arm the watch."
exit 0
