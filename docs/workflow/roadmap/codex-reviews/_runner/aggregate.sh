#!/usr/bin/env bash
# Aggregate all per-feature Codex review outputs into a single
# `next-phase-targets.md` document with Executive Summary, P0/P1/P2
# blocks, verdict roll-up, and per-feature excerpts.
#
# Usage: ./aggregate.sh
# Re-runs are idempotent — the OUT file is fully regenerated.

set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel)
BASE_DIR="$ROOT_DIR/docs/workflow/roadmap/codex-reviews"
OUT="$ROOT_DIR/docs/workflow/roadmap/xai-v1.next-phase-targets.md"

declare -a ORDER=(
  "repository-v0-contract|G2.1 Repository v0 contract"
  "grid-shell-organizer-content|G1.2 Grid shell / Organizer content split (SHIPPED)"
  "multi-grid-event-scope|G1.4 Multi-Grid event scope (SHIPPED)"
  "core-data-sqlite-driver|G2.2 SQLite/SQLCipher driver"
  "localstorage-migration|G2.3 localStorage migration"
  "keychain-opaque-handle|G2.4 Keychain opaque handle"
  "tauri-capability-allowlist|G2.5 Tauri capability allowlist"
  "single-table-sync-baseline|G2.6 Single-table sync baseline"
  "grid-persistence|G1.5 Grid persistence"
  "g3-organizer-batch|G3 Organizer-loop batch (E1+S3+E2+E3+E4)"
)

{
  echo "# XAI v1 — Next-phase targets (Codex cross-vendor review)"
  echo
  echo "Generated: $(date '+%Y-%m-%d %H:%M %Z')"
  echo "Branch: codex/track-a-desktop-foundation"
  echo "Reviewer: codex \`feature-review\` · gpt-5.4 high reasoning"
  echo
  echo "## Executive summary"
  echo
  echo "Across 10 Codex cross-vendor reviews of the Track A commits, 3 features"
  echo "returned **BLOCKED** verdicts and 7 returned **REVISE**. All three BLOCKED"
  echo "calls were independently verified against the actual code and are real"
  echo "contract breaks — not false positives. Most P1 issues cluster around"
  echo "*doc/code alignment*, *runtime invariant enforcement* (regex / scope /"
  echo "transactional atomicity), and *test-coverage holes* on the negative paths."
  echo
  echo "Recommended order for the next session: clear all P0 first (atomic, ≤ 1"
  echo "half-day each), then tackle the runtime-validation P1 batch as a single"
  echo "\`core-data\` hardening feature."
  echo
  echo "## P0 — must fix before any further G2/G3 build"
  echo
  echo "1. **[G1.2 plugin boundary leak]** \`packages/plugin-organizer/src/OrganizerGridContent.tsx:2-3\`"
  echo "   imports \`@tauri-apps/api/event\` and \`@tauri-apps/api/window\` directly,"
  echo "   violating red-line #4 (Plugin must not call Tauri APIs directly; use"
  echo "   \`@repo/core/hooks\`). The G1.2 SHIPPED manifest row therefore certifies a"
  echo "   product with a broken contract — fix the import, re-verify with the"
  echo "   Host boundary scan, then either confirm SHIPPED or rollback to"
  echo "   READY_TO_SHIP pending re-build."
  echo
  echo "2. **[G2.5 capability invariant lie]** \`apps/desktop/src-tauri/src/commands/keychain.rs\`"
  echo "   \`secret_set\` / \`secret_get\` / \`secret_del\` have no \`WebviewWindow\`"
  echo "   parameter and no \`ensure_*_allowed\` check, yet AUDIT.md and"
  echo "   \`docs/contracts/tauri-commands-v0.md\` §6/§7 claim the runtime allow-list"
  echo "   covers every JS-callable command. Either add the check or correct the"
  echo "   doc. Same pattern check for \`crypto_*\` and \`menubar_*\` to make sure"
  echo "   the audit table actually matches reality."
  echo
  echo "3. **[G2.6 same-transaction guarantee unenforced on Tauri-SQLite]**"
  echo "   \`packages/core-data/src/sync-outbox.ts\` calls"
  echo "   \`entityRepo.transaction(...)\` and inside it"
  echo "   \`outboxRepo.transaction(...)\`. The in-memory repo implements this with"
  echo "   a snapshot (so the unit test passes), but"
  echo "   \`packages/core-data/src/tauri-sqlite.ts:148-159\` explicitly documents"
  echo "   that \`transaction(fn)\` is a non-atomic callback wrapper. The"
  echo "   \"same-transaction rollback is proved\" claim in"
  echo "   \`packages/single-table-todos-e2e/docs/dev_log.md\` is therefore false on"
  echo "   the production driver path. Options: (a) add \`db_transaction_begin\` /"
  echo "   \`db_transaction_commit\` Tauri commands and make \`createTauriRepo\` use"
  echo "   them; (b) move the outbox into the SAME namespace as the entity so a"
  echo "   single \`db_put\` covers both writes; (c) document the deferred-gate and"
  echo "   stop claiming atomicity until the SQLite path lands."
  echo
  echo "## P1 — schedule into a single core-data + plugin-organizer hardening sprint"
  echo
  echo "### A) Runtime validation gaps (originally claimed in docs)"
  echo "- G2.1: \`assertRepoRecord\` only checks for \`.\` in \`entityType\`; enforce the"
  echo "  documented \`^[a-z]+\\.[a-z_]+\$\` regex."
  echo "- G2.1: clipboard \`device-local\` invariant is type-only; add a runtime check."
  echo "- G2.3: corrupted-but-parseable blob slips through (\`organizer.item\` with"
  echo "  missing required fields); tighten \`isPersistedLayout\` + entity validation."
  echo "- G2.4: \`insert_kek_from_bytes\` returns early on wrong length **before** scrubbing"
  echo "  the caller buffer; also zeroize on the failure path."
  echo "- G2.4: stack-local \`owned: [u8; 32]\` is Copy and not zeroized after"
  echo "  \`vault.insert_kek(owned)\` consumes a copy; sanitize the transient."
  echo
  echo "### B) Doc/code alignment"
  echo "- G2.1: \`docs/contracts/data-repository-v0.md\` §2 still lists entities not"
  echo "  frozen in code (\`pomodoro_session\`, \`widgets.widget\`, \`account.device\`)."
  echo "- G2.1: \`repository-v0-contract\` dev_log Work Log still says \"pending"
  echo "  commit\" instead of \`744d578\`."
  echo "- G2.3 (overstated idempotency): rerun rewrites every record with a fresh"
  echo "  \`updatedAt\`; this will explode sync conflict logic later. Either skip"
  echo "  unchanged rows or surface migration as a deterministic operation."
  echo "- G2.6 (false-claim cleanup): once P0 #3 lands, remove the \"proved\""
  echo "  language from \`single-table-todos-e2e\` dev_log."
  echo
  echo "### C) Plugin / UI correctness"
  echo "- G1.5: \`layoutStore.save()\` upserts-then-culls outside \`Repo.transaction()\`;"
  echo "  wrap in a transaction or skip the cull until SQLite supports it."
  echo "- G1.5: \`useGridSystem\` can clobber user edits if async hydrate resolves"
  echo "  after the user has touched state. \`hydrated\` flag gates persistence but"
  echo "  not the late \`load()\` result."
  echo "- G1.5: \`entityToDesktopItem\` maps \`kind === \"url\"\` back to \`type: \"file\"\`"
  echo "  and drops the \`url\` payload — repository round-trip is lossy."
  echo "- G3-E1: \`inferKindFromPath\` only treats trailing \`/\` as folder; real Finder"
  echo "  drops emit absolute paths without a slash. Folder drops will misclassify"
  echo "  as file."
  echo "- G3-E3: \`reveal_in_finder\` / \`open_path\` validate label + empty/NUL only;"
  echo "  any allowed window can pass an arbitrary absolute path, violating the"
  echo "  \"user-authorized path only\" contract."
  echo
  echo "### D) Test-coverage holes"
  echo "- G2.1: \`tests/repository-contract.ts\` does not cover corrupted JSON rows,"
  echo "  invalid record payloads, migration version mismatch, or"
  echo "  wrong-key/encrypted-driver failure."
  echo "- G2.6: add a real test that proves rollback semantics on the Tauri-SQLite"
  echo "  path once P0 #3 lands."
  echo "- G3-E3: add a test that rejects \`..\` traversal / non-bookmarked absolute"
  echo "  paths once the contract is tightened."
  echo
  echo "### E) Workflow / process"
  echo "- G3-batch packed 5 features into a single \`feature-build\` commit despite"
  echo "  the project's one-phase-per-run rule. Split into 5 separate commits"
  echo "  retroactively (or accept the deviation in writing) so the next agent"
  echo "  has a clean per-feature audit trail."
  echo "- \`packages/plugin-organizer/docs/dev_log.md\` (organizer plugin itself)"
  echo "  was not updated when the G3 helpers landed."
  echo
  echo "## P2 — defer or document"
  echo
  echo "Detailed P2 items live in the per-feature outputs below. They include the"
  echo "naming-regex decision (\`productivity.todo-list\` rejected), URL scheme"
  echo "edge cases (\`data:\`), classifier tie-breaking, larger-payload performance,"
  echo "and the eventual \`pnpm-lock.yaml\` / dependency-graph review."
  echo
  echo "## Deferred external gates (re-confirmed, do not re-investigate)"
  echo
  echo "- Live Supabase / 2-Mac sync E2E + zero-knowledge dump PoC (G2.6 follow-up)."
  echo "- SQLCipher \`PRAGMA key\` wiring into \`db_init\` (depends on G2.4 KEK handle"
  echo "  + the P0 #3 transaction fix)."
  echo "- macOS signed-runtime / MAS sandbox smoke (G0.6, G2.7)."
  echo "- Real macOS Finder runtime test for \`reveal_in_finder\` / \`open_path\`"
  echo "  (covered by deferred-gates after P0 #2 lands)."
  echo
  echo "## Verdict roll-up"
  echo
  printf "| Feature | Verdict | Output |\n"
  printf "|---|---|---|\n"
  for entry in "${ORDER[@]}"; do
    slug="${entry%%|*}"
    label="${entry##*|}"
    out="$BASE_DIR/$slug/output.md"
    if [[ ! -f "$out" ]]; then
      printf "| %s | ⚠ MISSING | — |\n" "$label"
      continue
    fi
    verdict=$(grep -E "^\*\*Verdict\*\*:" "$out" | head -1 | sed -E 's/^\*\*Verdict\*\*: *//' || echo "?")
    printf "| %s | %s | [output](codex-reviews/%s/output.md) |\n" "$label" "$verdict" "$slug"
  done
  echo

  echo "## Per-feature review excerpts"
  echo
  for entry in "${ORDER[@]}"; do
    slug="${entry%%|*}"
    label="${entry##*|}"
    out="$BASE_DIR/$slug/output.md"
    echo "### $label"
    echo
    if [[ ! -f "$out" ]]; then
      echo "_Codex review missing — context at \`codex-reviews/$slug/context.md\`._"
      echo
      continue
    fi
    cat "$out"
    echo
    echo "---"
    echo
  done
} > "$OUT"

echo "Aggregated -> $OUT"
