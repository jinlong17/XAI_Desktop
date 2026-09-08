#!/usr/bin/env bash
# Drive the 4 Codex P1 post-fix re-reviews serially. Skip if rerun-output.md exists.
# Reuses run-rerun.sh + per-feature context.md; writes to <slug>/p1-rerun-output.md
# so the P0 rerun-output.md stays untouched.

set -uo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel)
BASE_DIR="$ROOT_DIR/docs/workflow/roadmap/codex-reviews"
TEMPLATE="$BASE_DIR/_runner/rerun-review-template.md"

declare -a RERUNS=(
  "p1-alpha-core-data-validation|0bc3afa|G2.1 assertRepoRecord only checked for a dot, not the documented plugin.entity regex; clipboard.item runtime did not enforce device-local; G2.3 migration accepted items with empty filepath; G2.4 keychain_handle::insert_kek_from_bytes failed to zeroize the caller buffer on length-error early return, and the stack-local owned: [u8;32] (Copy) was never scrubbed."
  "p1-beta-plugin-organizer|1b34b54|G1.5 repositoryLayoutStore.save() did upsert + cull outside Repo.transaction(); useGridSystem async hydrate could clobber user state created before load resolved; entityToDesktopItem dropped the url payload on round-trip; G3-E1 inferKindFromPath only detected folders by trailing slash, mis-classifying Finder folder drops as files."
  "p1-gamma-contracts-window-menubar|7e97dc3|G2.1 docs/contracts/data-repository-v0.md §2 still listed unfrozen entities; G2.3 localstorage-migration overclaimed idempotency (rerun re-stamped updatedAt); G2.5 contracts §7 claimed every JS-callable command runtime-enforces an allow-list but commands/window.rs and commands/menubar.rs did not implement the pattern."
  "p1-delta-finder-contract-tests|2237395|G3-E3 reveal_in_finder / open_path only validated label + empty/NUL paths; arbitrary absolute paths under any allowed window violated the user-authorized-path-only contract. G2.1 tests/repository-contract.ts under-covered negative paths (corrupted payload, migration version mismatch, listByIndex bad field). G3-batch process deviation (5 features bundled) was not documented."
)

for entry in "${RERUNS[@]}"; do
  slug="${entry%%|*}"
  rest="${entry#*|}"
  commits="${rest%%|*}"
  issue="${rest#*|}"

  out_dir="$BASE_DIR/$slug"
  mkdir -p "$out_dir"
  out="$out_dir/rerun-output.md"

  if [[ -f "$out" ]]; then
    echo "[$slug] SKIP — rerun-output.md already exists"
    continue
  fi

  # Inline-build the prompt because run-rerun.sh expects an existing context.md;
  # the P1 sub-agent groups don't have a per-feature context.md (they cross multiple).
  prompt=$(sed -e "s|{{FEATURE_SLUG}}|$slug|g" \
               -e "s|{{COMMITS}}|$commits|g" \
               "$TEMPLATE")
  prompt="${prompt/\{\{ORIGINAL_ISSUE\}\}/$issue}"
  prompt="${prompt/\{\{FEATURE_CONTEXT\}\}/See commit body of $commits for full file list and rationale. Run \`git show --stat $commits\` and \`git show $commits\` for the diff.}"

  echo "$prompt" > "$out_dir/rerun-prompt.md"

  echo "[$slug] starting at $(date +%H:%M:%S)"
  if codex exec \
       -m gpt-5.4 \
       -c model_reasoning_effort=high \
       --skip-git-repo-check \
       -o "$out" \
       "$prompt" \
       > "$out_dir/rerun-output.log" 2>&1; then
    echo "[$slug] OK at $(date +%H:%M:%S)"
  else
    echo "[$slug] FAILED — see $out_dir/rerun-output.log"
  fi
done

echo "[driver] all P1 reruns done at $(date +%H:%M:%S)"
