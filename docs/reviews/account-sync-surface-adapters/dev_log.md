# account-sync-surface-adapters - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | account-sync-surface-adapters |
| Title | Account Cloud Sync surface adapters |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #6 |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (gpt-5.3-codex) |
| Updated | 2026-05-31 06:32 PDT |
| Blockers | — |

## Feature Normalization

- Requirement source: `docs/reviews/account-sync-surface-adapters/20260531-feature-brief.md`
- Canonical feature name: `account-sync-surface-adapters`
- Title: Account Cloud Sync surface adapters
- Canonical contract target: `docs/contracts/account-sync-surface-adapters.md`
- Naming rationale: the row is specifically about the Web/App/Plugin
  consumption layer that sits on top of the shipped account-sync architecture,
  entity-scope, identity, local-first, and protocol contracts without
  reopening runtime sync-v1 work.

## Brief / Review Docs

- Roadmap seed: `docs/reviews/account-sync-surface-adapters/20260531-roadmap-seed.md`
- Reviewed feature brief: `docs/reviews/account-sync-surface-adapters/20260531-feature-brief.md`
- Discovery review: `docs/reviews/account-sync-surface-adapters/20260531-discovery-review.md`
- Planning pack:
  - `docs/reviews/account-sync-surface-adapters/design.md`
  - `docs/reviews/account-sync-surface-adapters/api.md`
  - `docs/reviews/account-sync-surface-adapters/test.md`

## Phase Plan

### Phase 1 - Surface-adapter contract

Status: DONE.

- Add the canonical shared contract at
  `docs/contracts/account-sync-surface-adapters.md`.
- Build the contract on top of the shipped authorities:
  `account-cloud-sync-architecture`, `account-sync-entity-scope-matrix`,
  `account-device-identity-contract`, `account-sync-local-first-boundaries`,
  `account-sync-protocol-surface-contract`, `data-repository-v0`,
  `TECHNICAL_REQUIREMENTS`, `sync-v1`, and ADR-0013 D3/D4.
- Freeze Web adapter responsibilities for writable entity classes,
  browser-local exclusions, sync-status/conflict inputs, offline ownership, and
  D3 routing obligations.
- Freeze App adapter responsibilities for writable entity classes,
  local-first/native exclusions, SQLCipher + Keychain + Tauri secure seams,
  sync-status/conflict inputs, and offline ownership.
- Freeze Plugin adapter responsibilities for entity declaration,
  repository-only access, read-only sync-status/conflict consumption, and the
  rule that plugins never own push/pull engines.
- Register the contract in `docs/contracts/README.md`.

Gate: the contract yields one shared authority for Web/App/Plugin adapter
boundaries, keeps sync as infrastructure rather than a product surface,
preserves ADR-0013 D3/D4 governance, preserves rows #1-#5 authorities, and
does not unpause plugin runtime or sync-v1 runtime work.

## Risks

- Surface-adapter language can drift into UI design or runtime implementation if
  the build phase does not keep the contract at the responsibility boundary.
- Web adapter wording could accidentally weaken D3 and imply that Desktop simply
  consumes Web changes directly.
- Plugin adapter wording could accidentally imply plugin runtime/SDK unpause or
  allow plugin-owned push/pull behavior.
- Mixed entities such as `organizer.item` can be over-resolved here instead of
  preserving the field-split authority already established by rows #2 and #4.

## Open Questions

- Should the row #6 contract define one normalized adapter-facing sync-state
  vocabulary explicitly, or leave exact naming to later surface rows while
  freezing only the meanings?
- Do later Web/App rows need a shared read-model section for sync status,
  conflict counts, and remediation banners, or is a surface-responsibility
  matrix sufficient at this stage?
- Should the contract call out any entity-specific caveats beyond
  `organizer.item`, or keep entity references at the class level only?

## Review Notes

Approved. The plan is executable as one docs-only build phase: add
`docs/contracts/account-sync-surface-adapters.md` plus the
`docs/contracts/README.md` registration, keep the adapter sync-state contract
at meaning-level rather than inventing new transport/events, keep entity
references at class level except where existing authorities already freeze the
`organizer.item` field split, and keep all plugin and `sync-v1` runtime work
explicitly paused.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-31 06:24 PDT | feature-plan (gpt-5.3-codex) | Produced the docs-only planning pack for roadmap row #6, selected `docs/contracts/account-sync-surface-adapters.md` as the canonical build target, and kept workflow state under `docs/reviews/account-sync-surface-adapters/` with `Status = NEEDS_REVIEW`. | — | feature-review |
| 2026-05-31 06:27 PDT | feature-full-loop | Child Handoff lacked `### State Verification`; performed manual fallback check against on-disk `docs/reviews/account-sync-surface-adapters/dev_log.md` and confirmed `Status = NEEDS_REVIEW`, `Suggested Next = feature-review`, `Automation Mode = A-Codex`, `Verify Cross-vendor = yes`. | — | feature-review |
| 2026-05-31 06:29 PDT | feature-review (gpt-5.3-codex) | Reviewed the discovery pack against the shipped account-sync contracts, ADR-0013 D3/D4, `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, and paused `sync-v1`; approved one docs-only build phase with clarified review notes for sync-state vocabulary and entity-scope handling. | — | feature-build |
| 2026-05-31 06:30 PDT | feature-full-loop | Child Handoff lacked `### State Verification`; performed manual fallback check against on-disk `docs/reviews/account-sync-surface-adapters/dev_log.md` and confirmed `Status = APPROVED`, `Suggested Next = feature-build`, `Automation Mode = A-Codex`, `Verify Cross-vendor = yes`. | — | feature-auto-build |
| 2026-05-31 06:32 PDT | feature-auto-build (gpt-5.3-codex) | Completed Phase 1 docs-only build: added canonical contract `docs/contracts/account-sync-surface-adapters.md`, registered it in `docs/contracts/README.md`, and advanced workflow to `READY_FOR_VERIFY`. Verification evidence: `git diff --check -- docs/contracts/account-sync-surface-adapters.md docs/contracts/README.md docs/reviews/account-sync-surface-adapters/dev_log.md`; commit scope confirmation checked via `git show --name-only --stat --oneline HEAD` after commit, limited to contract + contracts index + review artifact update. | this commit | feature-verify |
