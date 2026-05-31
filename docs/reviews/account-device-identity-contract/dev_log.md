# account-device-identity-contract - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | account-device-identity-contract |
| Title | Account device identity contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #3 |
| Status | READY_TO_SHIP |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | ship |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-verify (gpt-5.3-codex) |
| Updated | 2026-05-31 05:31 PDT |
| Blockers | — |

## Brief / Review Docs

- Seed brief: `docs/reviews/account-device-identity-contract/20260531-roadmap-seed.md`
- Discovery review: `docs/reviews/account-device-identity-contract/20260531-discovery-review.md`
- Canonical contract: `docs/contracts/account-device-identity-contract.md`
- Cross-vendor verify: `docs/reviews/account-device-identity-contract/20260531-cross-vendor-verify.md`

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

feature-verify (A-Codex lead + Cursor cross-vendor read-only verify),
2026-05-31 05:31 PDT. Verdict: PASS - READY_TO_SHIP.

- Gate 1 PASS: Account Cloud Sync remains shared infrastructure rather than a
  standalone product surface.
- Gate 2 PASS: `account.device` is resolved as server-authoritative metadata in
  v1 without redefining `RepoRecord` or `syncScope`.
- Gate 3 PASS: the contract preserves the current device model: client
  `device_id`, server `encryption_device_id`, per-device keypair, per-device
  DEK wrap, active/revoked status, and device-bound headers.
- Gate 4 PASS: Web and Mac Desktop keep surface-local session ownership under
  one shared account authority.
- Gate 5 PASS: admin claims remain separated from ordinary product sessions and
  are routed through future admin APIs.
- Gate 6 PASS: Site remains limited to account entry/status semantics and cannot
  bypass auth/device/admin checks.
- Gate 7 PASS: browser-visible secret leakage is explicitly forbidden for
  service-role credentials, provider secrets, master password, secret key,
  KEK/DEK material, and device private key.
- Gate 8 PASS: the seam map correctly records current gaps between
  `@repo/web-auth-device-session`, `@repo/plugin-account`, sync-v1 authorities,
  and future Admin APIs.
- Gate 9 PASS: build commit `9fd1cb7` is docs-only, reviewable, and scoped.
- Gate 10 PASS: runtime sync-v1 remains paused.

## Deferred Gates

- Cross-vendor verify completed via Cursor Agent read-only pass.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-31 05:23 PDT | xai-roadmap-loop (A-Codex serial) | Marked roadmap row #3 IN_PROGRESS. | — | feature-plan |
| 2026-05-31 05:26 PDT | feature-plan (gpt-5.3-codex) | Produced docs-only discovery review and phase plan for the account/device identity contract. | — | feature-review |
| 2026-05-31 05:26 PDT | feature-review (gpt-5.3-codex) | Approved the docs-only identity contract plan with no structural revisions required. | — | feature-build |
| 2026-05-31 05:26 PDT | feature-auto-build (gpt-5.3-codex) | Built the canonical identity contract, registered it in `docs/contracts/README.md`, and advanced the docs-only feature to `READY_FOR_VERIFY`. | `9fd1cb7` | feature-verify |
| 2026-05-31 05:31 PDT | feature-verify (gpt-5.3-codex) | Recorded Cursor Agent cross-vendor verify evidence, confirmed all 10 gates PASS, and advanced the feature to `READY_TO_SHIP`. | `this commit` | ship |
