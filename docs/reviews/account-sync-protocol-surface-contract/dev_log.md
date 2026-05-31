# account-sync-protocol-surface-contract - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | account-sync-protocol-surface-contract |
| Title | Account Sync protocol surface contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #5 |
| Status | READY_TO_SHIP |
| Current Phase | VERIFY |
| Suggested Next | ship |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-verify (A-Codex inline) |
| Updated | 2026-05-31 06:11 PDT |
| Blockers | — |

## Feature Normalization

- Requirement source: `docs/reviews/account-sync-protocol-surface-contract/20260531-roadmap-seed.md`
- Canonical feature name: `account-sync-protocol-surface-contract`
- Title: Account Sync protocol surface contract
- Naming rationale: this row is specifically the shared sequence-level contract
  that connects repository mutations to outbox, push, pull, conflict, retry,
  and cadence behavior without reopening store ownership or cryptography.

## Brief / Review Docs

- Seed brief: `docs/reviews/account-sync-protocol-surface-contract/20260531-roadmap-seed.md`
- Discovery review: `docs/reviews/account-sync-protocol-surface-contract/20260531-discovery-review.md`
- Canonical contract: `docs/contracts/account-sync-protocol-surface-contract.md`
- Cross-vendor verify: `docs/reviews/account-sync-protocol-surface-contract/20260531-cross-vendor-verify.md`

## Phase Plan

### Phase 1 - Protocol surface and cadence contract

Status: DONE.

- Build the canonical protocol-surface contract under `docs/contracts/` using
  the shipped architecture charter, entity scope matrix, device identity
  contract, local-first boundaries contract, ADR-0013 D4,
  `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`,
  and `docs/workflow/roadmap/sync-v1.md` as authorities.
- Freeze the write -> outbox -> `/sync/push` -> accept/conflict -> `/sync/pull`
  -> apply sequence without redefining sync-v1 wire fields or crypto.
- Make retry, dead-letter, manual sync, and near-real-time cadence triggers
  explicit.
- Register the contract in `docs/contracts/README.md`.

Gate: the contract explicitly covers local enqueue, push/pull sequencing,
deterministic conflict routing, retry/dead-letter/manual-sync behavior, cadence
triggers, repository-only plugin access, and preservation of the existing
sync-v1 crypto and ordering invariants.

## Review Notes

Approved. The plan stays `sync`-module scoped and docs/contracts only, with
`docs/contracts/account-sync-protocol-surface-contract.md` as the correct
canonical target. The single phase is reviewable and sufficient because it
builds on row #4 store ownership rather than reopening it, preserves the
existing sync-v1 crypto/order authorities, keeps plugins repository-only, makes
conflict routing deterministic, and freezes the required cadence triggers
without unpausing runtime work.

## Verification Summary

- Reviewed the feature contract, discovery review, roadmap row, and shipped
  dependency contracts against the requested verification goals.
- Reviewed commit `df37e5b` as the docs-only build phase; the commit is
  documentation-only and limited to the contract, discovery review, and
  contracts index entry.
- Confirmed the contract keeps `sync-v1` paused, preserves AES-256-GCM with
  deterministic CBOR AAD, nonce lease, mutation idempotency, global account
  `commit_seq`, `conflict_shadow`, device-active RLS, and client-read-only
  `encrypted_blobs` as inherited authorities.
- Confirmed the contract makes the full write/push/pull/apply sequence,
  deterministic conflict routing, retry/dead-letter/manual-sync behavior, and
  15-60 second light-pull cadence explicit.
- Captured a genuine read-only second-vendor pass at
  `docs/reviews/account-sync-protocol-surface-contract/20260531-cross-vendor-verify.md`
  via `agent --plan -p`.

## Residual Risks

- `organizer.item` still depends on the row #4 local-first field-split boundary
  and later row #6 surface-adapter work; this contract intentionally cites that
  authority rather than over-resolving it here.
- No runtime/unit/manual sync tests were run because this feature is
  documentation-only and intentionally does not unpause `sync-v1`.

## Deferred Gates

- True cross-vendor gate is satisfied by Cursor Agent / `agent --plan -p`
  read-only verification.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-31 06:04 PDT | feature-plan (A-Codex inline) | Produced the docs-only discovery review and selected `docs/contracts/` as the canonical location for the shared protocol-surface contract. | — | feature-review |
| 2026-05-31 06:05 PDT | feature-review (A-Codex inline) | Approved the single docs-only phase with row #4 store ownership and sync-v1 crypto/order authorities preserved as prerequisites. | — | feature-build |
| 2026-05-31 06:08 PDT | feature-auto-build (A-Codex inline) | Added the canonical protocol-surface contract at `docs/contracts/account-sync-protocol-surface-contract.md`, registered it in `docs/contracts/README.md`, and committed the scoped docs-only build. Verification command evidence: `git diff --check -- docs/contracts/README.md docs/contracts/account-sync-protocol-surface-contract.md docs/reviews/account-sync-protocol-surface-contract/20260531-discovery-review.md`. | `df37e5b` | feature-verify |
| 2026-05-31 06:10 PDT | cross-vendor verify (Cursor Agent / `agent --plan -p`) | PASS across all seven gates. Verified docs-only scope, explicit write/push/pull/apply sequencing, invariant preservation, deterministic conflict routing, retry/dead-letter/manual-sync behavior, cadence triggers, repository-only plugin access, and docs-only commit scope. | `df37e5b` | feature-verify |
| 2026-05-31 06:11 PDT | feature-verify (A-Codex inline) | Recorded the cross-vendor verification receipt, confirmed the feature is `READY_TO_SHIP`, and intentionally left roadmap row #5 in `IN_PROGRESS` pending the separate ship gate. Verification evidence: `git show --stat --summary --format=fuller df37e5b`, contract/review artifact readback, and the saved read-only agent receipt. | `df37e5b`, `this commit` | ship |
