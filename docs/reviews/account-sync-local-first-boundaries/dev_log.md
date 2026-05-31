# account-sync-local-first-boundaries - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | account-sync-local-first-boundaries |
| Title | Account Cloud Sync local-first boundaries |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #4 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | — |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Executor | ship (gpt-5.3-codex) |
| Updated | 2026-05-31 05:59 PDT |
| Blockers | — |

## Feature Normalization

- Requirement source: `docs/reviews/account-sync-local-first-boundaries/20260531-roadmap-seed.md`
- Canonical feature name: `account-sync-local-first-boundaries`
- Title: Account Cloud Sync local-first boundaries
- Naming rationale: the row is narrowly about repository/store boundaries and
  local-first exclusions, not protocol, surface-adapter, or runtime sync
  implementation details.

## Brief / Review Docs

- Seed brief: `docs/reviews/account-sync-local-first-boundaries/20260531-roadmap-seed.md`
- Discovery review: `docs/reviews/account-sync-local-first-boundaries/20260531-discovery-review.md`
- Canonical contract target: `docs/contracts/account-sync-local-first-boundaries.md`

## Phase Plan

### Phase 1 - Repository-driver and local-first boundary contract

Status: DONE.

- Build the canonical boundary contract under `docs/contracts/` using the
  shipped architecture charter, entity scope matrix, device identity contract,
  ADR-0013 D4, `docs/contracts/data-repository-v0.md`,
  `docs/TECHNICAL_REQUIREMENTS.md`, and `docs/workflow/roadmap/sync-v1.md` as
  authorities.
- Map each relevant data class to Web IndexedDB/WebCrypto-friendly storage, Mac
  Desktop SQLite/SQLCipher plus Keychain/Tauri crypto seams, plugin-facing
  repository APIs, remote encrypted-envelope plus metadata representation, and
  offline behavior.
- Freeze the rule that plugins never directly access localStorage, SQLite,
  IndexedDB, Supabase, service-role APIs, or secure-key material.
- Record local-first exclusions for runtime-only state and make explicit that
  promotion into account-sync requires a later ADR-0013 D4-complete feature.
- Register the contract in `docs/contracts/README.md` if the new contract file
  is added.

Gate: the contract explicitly defines per-surface store ownership, repository
boundaries, remote-envelope limits, offline/outbox separation, local-only
exclusions, and required repository-driver/syncScope tests without redefining
`RepoRecord`, `syncScope`, or sync-v1 crypto.

## Risks

- `organizer.item` may need a field-level split between sync-safe metadata and
  local-only path or permission state; the plan must preserve that ambiguity
  rather than over-resolve it.
- Browser-safe preference storage and local indexes may be mistaken for account
  data unless the contract names them as outside repository ownership.
- Desktop secure seams can leak upward if the contract does not keep SQLCipher,
  Keychain, and Tauri crypto handles below the repository interface.
- A later protocol row could otherwise backfill store mapping implicitly; this
  plan makes store mapping a prerequisite instead.

## Open Questions

- Which current and reserved entity classes need an explicit field-level
  "remote-safe metadata vs local-only detail" note beyond `organizer.item`?
- Should workflow or admin status snapshots reference repository-driver health
  signals directly, or only derived sync-health projections from later rows?
- Are there any browser-local preference keys that deserve an explicit
  non-repository carve-out in the contract for future Web rows?

## Review Notes

Approved. The plan stays `sync`-module scoped and docs/contracts only, with
`docs/contracts/account-sync-local-first-boundaries.md` as the correct shared
contract target. The single phase is reviewable and sufficient because it
freezes repository-only plugin access, local-first exclusions, remote
encrypted-envelope-only storage, ADR-0013 D4 / `data-repository-v0` /
`TECHNICAL_REQUIREMENTS` authority, sync-v1 pause, and the rule that per-surface
store mapping is a prerequisite before any `account-sync` entity implementation.

## Verification Summary

- Reviewed the feature contract, discovery review, roadmap row, and dependency
  contracts against the requested verification goals.
- Reviewed commit `0e03cea` as the docs-only implementation phase and commit
  `254d7e4` as the verify-ready `dev_log.md` update; both commits are
  documentation-only and preserve single-intent scope.
- Confirmed the feature remains docs/contracts only, does not unpause
  `sync-v1`, preserves repository-only plugin access, limits remote storage to
  encrypted envelope plus metadata, freezes local-first exclusions, documents
  offline/outbox separation, and requires mapping-before-entity documentation
  before later entity work.
- Captured a genuine read-only second-vendor pass at
  `docs/reviews/account-sync-local-first-boundaries/20260531-cross-vendor-verify.md`
  via `agent --plan -p`.

## Residual Risks

- `organizer.item` still needs a later field-level split feature for sync-safe
  metadata versus local-only path/permission data; this contract intentionally
  preserves that open item instead of over-resolving it.
- No runtime/unit/manual sync tests were run because this feature is
  documentation-only and intentionally does not unpause `sync-v1`.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-31 05:40 PDT | feature-plan (gpt-5.3-codex) | Produced the docs-only discovery review and phase plan for the local-first boundary contract, using the roadmap seed as Step 0 input and targeting `docs/contracts/account-sync-local-first-boundaries.md`. | — | feature-review |
| 2026-05-31 05:43 PDT | feature-review (gpt-5.4) | Reviewed discovery and plan artifacts against ADR-0013 D4, `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, the sync-v1 pause, and the repository-only plugin boundary; approved the single docs-only phase and canonical contract target. | — | feature-build |
| 2026-05-31 05:47 PDT | feature-auto-build (gpt-5.3-codex) | Completed Phase 1 docs-only implementation: added the canonical local-first boundary contract at `docs/contracts/account-sync-local-first-boundaries.md`, registered it in `docs/contracts/README.md`, and advanced the feature to verify-ready state with required D4/local-first/store-mapping constraints preserved. Verification command evidence: scoped-change check via `git status --short docs/contracts docs/reviews/account-sync-local-first-boundaries`; no runtime/unit test execution required for this docs-only phase. | `0e03cea` | feature-verify |
| 2026-05-31 05:50 PDT | feature-verify (gpt-5-codex) | Verified the docs-only boundary contract against the discovery review, dependency contracts, paused `sync-v1` roadmap, and roadmap row #4; reviewed commits `0e03cea` and `254d7e4` as docs-only single-intent changes; recorded a genuine read-only second-vendor pass at `docs/reviews/account-sync-local-first-boundaries/20260531-cross-vendor-verify.md`. Verification evidence: `git show --stat --summary --format=fuller 0e03cea`, `git show --stat --summary --format=fuller 254d7e4`, `git show --patch` for both commits, contract/roadmap artifact review, Claude CLI attempted but failed with external low-credit error, Cursor/agent CLI sanity-checked, and `agent --plan -p` produced the saved cross-vendor receipt. | `0e03cea`, `254d7e4` | ship |
| 2026-05-31 05:51 PDT | feature-full-loop (gpt-5.4) | Manual state-verification fallback after feature-verify Handoff omitted `### State Verification`; confirmed on-disk `Status = READY_TO_SHIP`, `Suggested Next = ship`, and cross-vendor receipt at `docs/reviews/account-sync-local-first-boundaries/20260531-cross-vendor-verify.md`. | — | ship |
| 2026-05-31 05:59 PDT | ship (gpt-5.3-codex) | Completed ship gate checks for row #4: confirmed `READY_TO_SHIP` guard state, validated commits `0e03cea` and `254d7e4` as docs-only/reviewable, verified in-scope docs with `git diff --check`, pushed the ship-status doc flip commit, and left unrelated dirty worktree files untouched. | this commit + reused `0e03cea`, `254d7e4` | workflow complete |
