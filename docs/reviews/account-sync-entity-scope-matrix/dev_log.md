# account-sync-entity-scope-matrix - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | account-sync-entity-scope-matrix |
| Title | Account Cloud Sync entity scope matrix |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #2 |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (gpt-5.3-codex) |
| Updated | 2026-05-31 05:16 PDT |
| Blockers | — |

## Brief / Review Docs

- Seed brief: `docs/reviews/account-sync-entity-scope-matrix/20260531-roadmap-seed.md`
- Discovery review: `docs/reviews/account-sync-entity-scope-matrix/20260531-discovery-review.md`
- Canonical contract: `docs/contracts/account-sync-entity-scope-matrix.md`
- Cross-vendor verify: `(pending)`

## Phase Plan

### Phase 1 - Entity scope and local-first contract

Status: DONE.

- Build the canonical entity scope matrix under `docs/contracts/` using
  `account-cloud-sync-architecture.md`, ADR-0013 D4, and `data-repository-v0`
  as authorities.
- Classify current authority entities, reserved future entities, admin/control-
  plane read models, and local-first exclusions without redefining
  `RepoRecord`, `syncScope`, or sync-v1 crypto.
- Add a surface access matrix and an audit-separation rule.
- Register the contract in `docs/contracts/README.md`.

Gate: the contract explicitly marks what is `account-sync`, `device-local`,
admin/control-plane read model, or deferred; states product-surface read/write
boundaries; and preserves the paused runtime sync-v1 scope.

## Review Notes

feature-review (A-Codex inline), 2026-05-31 05:14 PDT. Verdict: APPROVED.

- Source fidelity: PASS. The discovery review stays anchored to the roadmap
  seed, the shipped architecture charter, `data-repository-v0`, and ADR-0013
  D4 without inventing new protocol or record semantics.
- Scope discipline: PASS. The plan is strictly docs/contracts only and keeps
  runtime sync-v1 paused.
- Classification coverage: PASS. The plan covers current authority entities,
  reserved future entities, admin/control-plane read models, and local-first
  exclusions.
- Boundary clarity: PASS. The proposed contract sections include per-surface
  read/write rules and explicit admin-audit vs user-sync-audit separation.
- Phase quality: PASS. One docs-only phase is sufficient and reviewable.

## Verification Notes

Pending feature-verify.

## Deferred Gates

- Cross-vendor verify is required before `READY_TO_SHIP`.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-31 05:12 PDT | feature-plan (gpt-5.3-codex) | Produced docs-only discovery review and phase plan for the entity scope matrix contract. | — | feature-review |
| 2026-05-31 05:14 PDT | feature-review (gpt-5.3-codex) | Approved the docs-only entity scope matrix plan with no structural revisions required. | — | feature-build |
| 2026-05-31 05:16 PDT | feature-auto-build (gpt-5.3-codex) | Built the canonical entity scope matrix contract, registered it in `docs/contracts/README.md`, and advanced the docs-only feature to `READY_FOR_VERIFY`. | `(pending commit)` | feature-verify |
