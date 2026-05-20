#!/usr/bin/env bash
# Drive the 3 Codex post-fix re-reviews serially. Skip if rerun-output.md exists.

set -uo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel)
RUNNER="$ROOT_DIR/docs/workflow/roadmap/codex-reviews/_runner/run-rerun.sh"
BASE_DIR="$ROOT_DIR/docs/workflow/roadmap/codex-reviews"

declare -a RERUNS=(
  "grid-shell-organizer-content|f818f0d|OrganizerGridContent.tsx imported @tauri-apps/api/event and @tauri-apps/api/window directly, violating red-line #4. The G1.2 SHIPPED row certified a broken contract."
  "tauri-capability-allowlist|143bca5|commands/keychain.rs secret_set/get/del had no WebviewWindow parameter and no ensure_*_allowed check, yet AUDIT.md and contracts/tauri-commands-v0.md claimed every JS-callable command runtime-enforces a window allow-list."
  "single-table-sync-baseline|c5b0e77|enqueueOutboxEntry claimed same-transaction rollback, but createTauriRepo.transaction(fn) was documented as a non-atomic callback wrapper. The unit test passed only because createInMemoryRepo uses snapshot-based rollback; the production SQLite path would leave the entity persisted if the outbox write failed."
)

for entry in "${RERUNS[@]}"; do
  slug="${entry%%|*}"
  rest="${entry#*|}"
  commits="${rest%%|*}"
  issue="${rest#*|}"
  out="$BASE_DIR/$slug/rerun-output.md"

  if [[ -f "$out" ]]; then
    echo "[$slug] SKIP — rerun-output.md already exists"
    continue
  fi

  echo "[$slug] starting at $(date +%H:%M:%S)"
  if "$RUNNER" "$slug" "$commits" "$issue"; then
    echo "[$slug] OK at $(date +%H:%M:%S)"
  else
    echo "[$slug] FAILED — see $BASE_DIR/$slug/rerun-output.log"
  fi
done

echo "[driver] all reruns done at $(date +%H:%M:%S)"
