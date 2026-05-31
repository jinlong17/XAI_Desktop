# account-device-identity-contract - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | account-device-identity-contract |
| Title | Account device identity contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #3 |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (gpt-5.3-codex) |
| Updated | 2026-05-31 05:26 PDT |
| Blockers | — |

## Brief / Review Docs

- Seed brief: `docs/reviews/account-device-identity-contract/20260531-roadmap-seed.md`
- Discovery review: `docs/reviews/account-device-identity-contract/20260531-discovery-review.md`
- Canonical contract: `docs/contracts/account-device-identity-contract.md`
- Cross-vendor verify: `(pending)`

## Phase Plan

### Phase 1 - Account, device, session, role, and lifecycle contract

Status: DONE.

- Build the canonical identity contract under `docs/contracts/` using the
  shipped architecture charter, entity scope matrix, ADR-0013 D4,
  `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, sync-v1 authorities, and the
  current `@repo/web-auth-device-session` / `@repo/plugin-account` seams.
- Resolve whether `account.device` is a first-class `RepoRecord` or remains
  server/account metadata in v1.
- Preserve the current device model: client `device_id`, server
  `encryption_device_id`, per-device keypair, per-device DEK wraps,
  active/revoked status, recovery/rekey side effects, and device-bound headers.
- Add lifecycle, surface-responsibility, admin-claim, and secret-boundary
  tables.
- Register the contract in `docs/contracts/README.md`.

Gate: the contract explicitly defines account/device/session/admin ownership,
preserves the existing device model, prohibits browser-visible secret leakage,
and keeps runtime sync-v1 paused.

## Review Notes

feature-review (A-Codex inline), 2026-05-31 05:26 PDT. Verdict: APPROVED.

- Source fidelity: PASS. The discovery review stays anchored to the roadmap
  seed, the shipped architecture charter, the shipped entity scope matrix,
  `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, sync-v1 authorities,
  `@repo/web-auth-device-session`, and `@repo/plugin-account`.
- Scope discipline: PASS. The row is docs/contracts only and does not attempt to
  unpause runtime sync-v1 or implement APIs.
- Identity decision quality: PASS. Resolving `account.device` as
  server-authoritative metadata in v1 preserves the current device model and
  avoids inventing a fake payload record.
- Boundary clarity: PASS. The planned sections cover product-session versus
  admin-claim separation, Site non-bypass rules, and browser-visible secret
  prohibitions.
- Phase quality: PASS. One docs-only phase is sufficient and reviewable.

## Verification Notes

Pending feature-verify.

## Deferred Gates

- Cross-vendor verify is required before `READY_TO_SHIP`.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-31 05:23 PDT | xai-roadmap-loop (A-Codex serial) | Marked roadmap row #3 IN_PROGRESS. | — | feature-plan |
| 2026-05-31 05:26 PDT | feature-plan (gpt-5.3-codex) | Produced docs-only discovery review and phase plan for the account/device identity contract. | — | feature-review |
| 2026-05-31 05:26 PDT | feature-review (gpt-5.3-codex) | Approved the docs-only identity contract plan with no structural revisions required. | — | feature-build |
| 2026-05-31 05:26 PDT | feature-auto-build (gpt-5.3-codex) | Built the canonical identity contract, registered it in `docs/contracts/README.md`, and advanced the docs-only feature to `READY_FOR_VERIFY`. | `(pending commit)` | feature-verify |
