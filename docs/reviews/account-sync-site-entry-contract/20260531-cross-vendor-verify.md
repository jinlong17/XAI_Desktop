# Cross-vendor Verify - account-sync-site-entry-contract

| Field | Value |
|---|---|
| Feature | `account-sync-site-entry-contract` |
| Date | 2026-05-31 |
| Build commit reviewed | `9654a5a` |
| Primary build path | `A-Codex` docs-only build (Cursor-authored child run under Codex orchestration) |
| Second vendor | Codex read-only review (current parent session) |
| Verdict | PASS |

## Prompt Scope

The second-vendor pass reviewed only:

- `docs/contracts/account-sync-site-entry-contract.md`
- `docs/contracts/README.md`
- `docs/reviews/account-sync-site-entry-contract/20260531-feature-brief.md`
- `docs/reviews/account-sync-site-entry-contract/20260531-discovery-review.md`
- `docs/reviews/account-sync-site-entry-contract/design.md`
- `docs/reviews/account-sync-site-entry-contract/api.md`
- `docs/reviews/account-sync-site-entry-contract/test.md`
- `docs/reviews/account-sync-site-entry-contract/dev_log.md`
- `docs/contracts/account-cloud-sync-architecture.md`
- `docs/contracts/account-device-identity-contract.md`
- `docs/contracts/account-sync-surface-adapters.md`
- `docs/contracts/account-sync-admin-read-models.md`
- `docs/contracts/data-repository-v0.md`
- `docs/TECHNICAL_REQUIREMENTS.md`
- `docs/workflow/roadmap/sync-v1.md`
- row #8 in `docs/workflow/roadmap/account-cloud-sync-foundation.md`
- commit `9654a5a`

## Gates Checked

| Gate | Verdict | Notes |
|---|---|---|
| Docs-only scope and Site remains PROPOSED | PASS | `docs/contracts/account-sync-site-entry-contract.md` §§1, 7, and 9 keep the work docs-only, preserve the `site` lane as PROPOSED, and forbid runtime activation or `codex/site/<feature>` work before operator approval. Commit `9654a5a` changes only `docs/contracts/README.md`, the new contract, and the feature `dev_log.md`. |
| Allowed public metadata vs forbidden private/admin/control-plane data | PASS | Contract §§2–3 explicitly separate allowed public categories (account-entry links, release/download/updater metadata links, public status summaries, source-backed sync/security explanations) from forbidden categories (private product records, sync payloads, encrypted blob content, admin read models, control-plane data, credentials, key material, and local-only device state). |
| Account/auth entry reuses shared account/device/session contract | PASS | Contract §4 routes all Site account entry through `account-device-identity-contract`, forbids a separate Site-owned auth or device-registration system, and preserves ADR-0013 D4's Web ↔ account cloud ↔ App topology without a Site bypass. |
| Release/download/updater/status linkage stays link/summary only | PASS | Contract §5 keeps the Site as a linker/summary surface for release artifacts and public status, explicitly forbids proxying sync payloads or encrypted blob content, and defers canonical publication-path questions to a future Site activation row. |
| Public sync/security claims are source-backed | PASS | Contract §6 limits claims to ADR-0013 D4, `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md`, and the shipped account-sync contracts, and explicitly forbids unsupported marketing-only assertions. |
| No redefinition of RepoRecord / syncScope / crypto / admin read models / runtime sync-v1 | PASS | Contract §§1 and 8 consume `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, `sync-v1`, `account-device-identity-contract`, `account-sync-surface-adapters`, and `account-sync-admin-read-models` as upstream authorities without redefining them. |
| Commit 9654a5a is single-intent and reviewable | PASS | `git show --stat --summary --format=fuller 9654a5a` shows one docs-only intent: add the site-entry boundary contract, register it in the contracts index, and advance the feature to `READY_FOR_VERIFY`. One follow-up detail remains outside the build commit: the planning artifacts (`20260531-feature-brief.md`, `20260531-discovery-review.md`, `design.md`, `api.md`, `test.md`) are present in the review folder but not yet committed; they should be included by the final verify/status commit before ship. |

## Risks

- The local Claude CLI was attempted for an external second-vendor receipt but returned `Credit balance is too low`; this saved receipt therefore records the Codex read-only fallback against the Cursor-authored build commit rather than a Claude-authored receipt.
- The planning-pack files under `docs/reviews/account-sync-site-entry-contract/` are still uncommitted relative to build commit `9654a5a`; the verify/status commit should stage them so the review evidence is fully tracked before ship.
- No runtime/unit/manual product tests were run because row #8 is intentionally docs-only and does not unpause `sync-v1` or activate the `site` implementation lane.
