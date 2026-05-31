# account-sync-admin-read-models - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | account-sync-admin-read-models |
| Title | Account Sync admin read models |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #7 |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (A-Codex inline) |
| Updated | 2026-05-31 06:54 PDT |
| Blockers | — |

## Feature Normalization

- Requirement source: `docs/reviews/account-sync-admin-read-models/20260531-roadmap-seed.md`
- Canonical feature name: `account-sync-admin-read-models`
- Title: Account Sync admin read models
- Canonical contract target: `docs/contracts/account-sync-admin-read-models.md`
- Naming rationale: the row is specifically about the unified control-plane
  read-model and mutation-guard contract for Admin Dashboard without activating
  runtime admin implementation.

## Brief / Review Docs

- Roadmap seed: `docs/reviews/account-sync-admin-read-models/20260531-roadmap-seed.md`
- Reviewed feature brief: `docs/reviews/account-sync-admin-read-models/20260531-feature-brief.md`
- Discovery review: `docs/reviews/account-sync-admin-read-models/20260531-discovery-review.md`
- Planning pack:
  - `docs/reviews/account-sync-admin-read-models/design.md`
  - `docs/reviews/account-sync-admin-read-models/api.md`
  - `docs/reviews/account-sync-admin-read-models/test.md`

## Phase Plan

### Phase 1 - Admin read-model and mutation-guard contract

Status: DONE.

- Add the canonical shared contract at
  `docs/contracts/account-sync-admin-read-models.md`.
- Build the contract on top of the shipped authorities:
  `account-cloud-sync-architecture`,
  `account-sync-entity-scope-matrix`,
  `account-device-identity-contract`,
  `account-sync-local-first-boundaries`,
  `account-sync-protocol-surface-contract`,
  `account-sync-surface-adapters`,
  `data-repository-v0`,
  `TECHNICAL_REQUIREMENTS`,
  `sync-v1`, and ADR-0013 D4.
- Freeze one admin read-model catalog for accounts, organizations, devices,
  sync health, usage, quotas, billing state, feature flags, provider status,
  audit, operational queues, and any explicitly deferred domains.
- Freeze browser-secret and encrypted-payload prohibitions, admin-audit
  separation, mutation guardrails, and workflow-source-of-truth rules.
- Register the contract in `docs/contracts/README.md`.

Gate: the contract yields one shared authority for Admin control-plane read
models; keeps Admin PROPOSED and isolated; forbids browser-visible service-role
credentials, provider secrets, and encrypted user payload plaintext; keeps
admin audit append-only and distinct from user sync audit; requires RBAC,
confirmation, audit append, and explicit results for mutations; and does not
redefine `RepoRecord`, `syncScope`, crypto, or runtime `sync-v1`.

## Risks

- The row could drift into UI or backend implementation design if the contract
  stops being a boundary document.
- Workflow/release snapshots could accidentally be treated as cloud truth rather
  than derived metadata from repository files.
- Provider-status or billing wording could accidentally imply browser delivery
  of secrets rather than safe summaries or handles.
- Audit wording could accidentally merge admin control-plane audit with end-user
  sync mutation history.

## Open Questions

- Which provider-status details are safe to expose to browser-delivered admin
  code as summaries only, and which remain server-only?
- Which domains must stay explicitly deferred because the upstream source system
  is not yet stable or operator-approved?
- Should workflow/release snapshot metadata appear as an explicit domain in this
  contract or remain a supporting note under sync health and operations?

## Review Notes

Approved. The plan is executable as one docs-only build phase: add
`docs/contracts/account-sync-admin-read-models.md` plus the
`docs/contracts/README.md` registration, keep the read-model catalog at the
metadata and control-plane boundary, preserve strict browser-secret and
encrypted-payload prohibitions, keep admin audit append-only and separate from
user sync audit, and keep workflow/release status explicitly derived from
repository truth rather than cloud truth.

## Verification Summary

- Pending feature-verify.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-31 06:52 PDT | feature-plan (A-Codex inline) | Produced the docs-only planning pack for roadmap row #7, selected `docs/contracts/account-sync-admin-read-models.md` as the canonical build target, and advanced workflow state to `NEEDS_REVIEW`. | — | feature-review |
| 2026-05-31 06:54 PDT | feature-review (A-Codex inline) | Reviewed the discovery pack against the shipped account-sync contracts, ADR-0013 D4, `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, and paused `sync-v1`; approved one docs-only build phase with clarified review notes for metadata-only admin read models, audit separation, and workflow-source-of-truth handling. | — | feature-build |
| 2026-05-31 06:54 PDT | feature-auto-build (A-Codex inline) | Completed Phase 1 docs-only build: added canonical contract `docs/contracts/account-sync-admin-read-models.md`, registered it in `docs/contracts/README.md`, and advanced workflow to `READY_FOR_VERIFY`. Verification command evidence: `git diff --check -- docs/contracts/account-sync-admin-read-models.md docs/contracts/README.md docs/reviews/account-sync-admin-read-models`; commit scope confirmation checked via `git show --name-only --stat --oneline HEAD` after commit and limited to this feature. | this commit | feature-verify |
