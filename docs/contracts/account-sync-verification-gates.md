# Account Sync Verification Gates Contract

| Field | Value |
|---|---|
| Owner | `sync` product module |
| Status | Draft contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #10 |
| Applies to | All later Account Cloud Sync runtime rows, feature-verify receipts, pre-ship gates, live rollout rehearsals, and sync-health observability surfaces |
| Builds on | `docs/contracts/account-cloud-sync-architecture.md`, `docs/contracts/account-sync-entity-scope-matrix.md`, `docs/contracts/account-device-identity-contract.md`, `docs/contracts/account-sync-local-first-boundaries.md`, `docs/contracts/account-sync-protocol-surface-contract.md`, `docs/contracts/account-sync-surface-adapters.md`, `docs/contracts/account-sync-admin-read-models.md`, `docs/contracts/account-sync-site-entry-contract.md`, `docs/contracts/account-sync-workflow-state-contract.md`, `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md`, ADR-0013 D4 |

## 1. Purpose

This contract freezes how later Account Cloud Sync features prove that they are
complete, safe, observable, and ready to ship.

It defines:

- one master gate matrix for all later account-sync runtime rows;
- one evidence-lane model separating mocked, local, browser, desktop, and live
  proof environments;
- stage checklists for design review, feature-plan intake, feature-verify,
  pre-ship, and live rollout;
- observability field allowlist and denylist rules;
- repository-truth rules for verification receipts and deferred-gate notes.

This document does not authorize runtime sync implementation, unpause
`sync-v1`, redefine `RepoRecord`, redefine `syncScope`, redefine crypto,
replace review artifacts with cloud-owned workflow state, or relax any prior
admin, Site, or workflow boundary.

## 2. Normative scope and inherited authorities

1. ADR-0013 D4 remains the base completeness rule: any `account-sync` feature
   is incomplete unless it defines all nine required items. This contract
   explains how those items are proven, not what the topology is.
2. `docs/contracts/data-repository-v0.md` remains the sole authority for
   `RepoRecord`, `syncScope`, repository semantics, and outbox ownership.
3. `docs/TECHNICAL_REQUIREMENTS.md` and
   `docs/workflow/roadmap/sync-v1.md` remain the sole authorities for
   encrypted envelopes, crypto, nonce lease, device binding, and runtime sync
   semantics.
4. `docs/contracts/account-sync-surface-adapters.md` remains the authority for
   Web/App/Plugin surface responsibilities and downstream metadata consumers.
5. `docs/contracts/account-sync-admin-read-models.md` remains the authority for
   admin RBAC, audit append, browser-secret boundaries, and workflow snapshot
   inheritance.
6. `docs/contracts/account-sync-site-entry-contract.md` remains the authority
   for Site public-boundary rules and source-backed sync/security claims.
7. `docs/contracts/account-sync-workflow-state-contract.md` remains the
   authority for repository-truth workflow artifacts and derived-only workflow
   snapshots.
8. Verification receipts, deferred-gate notes, and rollout rehearsal records
   remain git-tracked review artifacts. Dashboards may summarize them, but do
   not become authoritative.

## 3. Evidence lanes

Every later runtime feature that cites this contract must classify its evidence
into the following lanes. A lane may be marked `deferred_gate` only with an
explicit reason and owner. Silent omission is forbidden.

| Lane | Environment | What it proves | What it cannot substitute for |
|---|---|---|---|
| Mocked contract | unit tests, schema fixtures, static contract harnesses | entity shape, migration intent, repository-facing contracts, error/category semantics | browser IndexedDB behavior, desktop SQLCipher behavior, live account-cloud convergence |
| Docker/Postgres | local database and server simulation | server-side persistence, push/pull response shapes, conflict-shadow writes, queue behavior, RBAC route denial where locally modeled | browser-local storage, desktop-local storage, live external auth/device conditions |
| Browser IndexedDB | real browser storage runtime | IndexedDB mapping, browser-local outbox rules, browser-safe secret handling, focus/start/manual-sync flows | desktop SQLCipher behavior, live multi-device convergence |
| Desktop SQLite/SQLCipher | real desktop-local storage runtime | SQLite mapping, SQLCipher wrong-key handling, desktop-local outbox rules, native/offline replay behavior | browser IndexedDB behavior, live multi-device convergence |
| Live external | real account-cloud environment, multi-device rehearsal, external auth/device services | end-to-end two-device convergence, real auth/device-active conditions, real status/telemetry behavior | contract-only proof, local simulation-only proof |

## 4. Master gate matrix

| Gate | What must be proven | Required lanes | Blocker if missing |
|---|---|---|---|
| D4 completeness | `entityType`, `schemaVersion`, local store mapping, push mutation format, pull apply rule, conflict policy, Web test, App test, two-device smoke are all defined or correctly exempted | mocked contract, browser IndexedDB, desktop SQLite/SQLCipher, live external | feature claims `account-sync` completeness without all nine items or exemption rationale |
| Repository driver/store mapping | owning repository driver, local tables/stores, and migration expectations are explicit and aligned to upstream contracts | mocked contract, browser IndexedDB or desktop SQLite/SQLCipher as applicable | ambiguous storage ownership or unstated migration path |
| Device-local outbox exclusion | any `device-local` or local-only field proves no remote outbox entry and no push envelope candidate is produced | mocked contract plus the owning local runtime lane | a device-local mutation can reach outbox, push batch, or server simulation |
| Push/pull protocol invariants | push/pull behavior consumes existing envelope, auth, nonce, idempotency, and status semantics without redefining them | mocked contract, Docker/Postgres, live external when available | runtime behavior or docs redefine protocol or skip server proof |
| Conflict handling | conflicts are flagged or explicitly merged; no silent last-write-wins; conflict-shadow or equivalent receipt exists where applicable | Docker/Postgres, browser or desktop local runtime, live external for real replay | conflict path is absent, implicit, or silently destructive |
| Admin control-plane gate | RBAC denial, audit append, explicit result categories, and browser-secret exclusions remain intact for admin-visible sync surfaces | Docker/Postgres or equivalent server gate, live external when applicable | admin-facing feature lacks RBAC/audit proof or leaks secrets |
| Site public-boundary gate | no private payload or control-plane leak; public sync/security claims are source-backed | mocked contract plus live/public surface proof when applicable | Site-facing feature exposes forbidden data or untraceable claims |
| Workflow truth gate | verify receipts, rollout summaries, and status snapshots remain derived-only and repository-truth artifacts stay authoritative | mocked contract and review-artifact inspection | workflow summary becomes the only source of truth or bypasses repo artifacts |
| Two-device convergence gate | device A write reaches account cloud and device B converges or the feature records an explicit deferred live gate | live external | account-sync feature claims ship-ready with no real convergence proof or deferred gate |
| Observability privacy gate | telemetry uses allowlisted fields only and excludes payloads, private ids, secrets, tokens, and key material | mocked contract plus the lane that emits telemetry | unsafe fields enter logs, metrics, traces, receipts, or dashboards |

## 5. Design review and feature-plan intake checklist

- [ ] The row cites ADR-0013 D4 and states whether the target feature is
  `account-sync`, `device-local`, or mixed.
- [ ] The target feature names its owning repository driver and local store
  mapping.
- [ ] The plan identifies which evidence lanes later rows must satisfy.
- [ ] The plan states whether device-local negative proof is required.
- [ ] The plan cites upstream admin, Site, and workflow contracts when those
  surfaces are in scope.
- [ ] The plan includes an observability note naming safe field categories and
  forbidden field categories.
- [ ] The plan does not redefine `RepoRecord`, `syncScope`, crypto, device
  identity, Site public-boundary, admin guardrails, or workflow truth.

## 6. Feature-verify checklist

- [ ] The build commit or commits stay within the claimed feature scope.
- [ ] All required evidence lanes are present, or an explicit `deferred_gate`
  or `blocked` record explains the absence.
- [ ] Device-local negative proof exists where applicable.
- [ ] Push/pull behavior cites existing protocol authorities rather than
  redefining them.
- [ ] Conflict handling proof exists and shows no silent last-write-wins path.
- [ ] Admin-facing surfaces preserve RBAC, audit append, and secret exclusion.
- [ ] Site-facing surfaces preserve public-boundary and source-backed claim
  rules.
- [ ] Workflow-facing summaries remain derived-only and link back to repository-
  truth artifacts.
- [ ] Telemetry or logs show allowlisted fields only.

## 7. Pre-ship checklist

- [ ] `dev_log.md` is `READY_TO_SHIP` and cites the build and verify evidence.
- [ ] The feature's verification receipt is tracked under
  `docs/reviews/<feature>/`.
- [ ] Any deferred live gate is explicitly named with owner and follow-up path.
- [ ] No unrelated runtime lane was implicitly activated by the change.
- [ ] The contract or feature receipt names residual risks honestly and does not
  over-claim coverage.

## 8. Live rollout checklist

- [ ] A real two-device or equivalent live external rehearsal exists for any
  `account-sync` runtime feature that claims end-to-end readiness.
- [ ] Live auth/device-active conditions behave as expected.
- [ ] Observability dashboards or receipts show only allowlisted fields.
- [ ] Conflict replay or shadow evidence is preserved when a conflict path is in
  scope.
- [ ] Admin and Site surface checks remain green in the live environment if the
  feature touches them.
- [ ] Workflow summaries remain derived-only and do not replace repository-truth
  review artifacts.

## 9. Observability allowlist and denylist

### 9.1 Allowlisted fields

Observability output may include:

- error code or category;
- entity type;
- schema version;
- sync lane or surface label;
- retry count;
- batch size;
- HTTP status;
- duration or latency bucket;
- conflict-present boolean;
- dead-letter count;
- hashed or scoped device handle that cannot be reversed into a raw device id by
  ordinary operators.

### 9.2 Forbidden fields

Observability output must never include:

- payload content or decrypted record fields;
- entity ids whose raw value exposes private content or direct user meaning;
- raw device ids;
- session tokens, refresh tokens, auth headers, or provider raw secrets;
- service-role credentials or raw API keys;
- DEK, KEK, device private key, recovery material, nonce values, or equivalent
  key material.

## 10. Receipt storage and deferred gates

1. Verification receipts remain git-tracked review artifacts under
   `docs/reviews/<feature>/`.
2. Deferred live gates must be recorded explicitly as `deferred_gate` with the
   missing lane, the reason, and the follow-up owner.
3. Dashboards and control-plane views may summarize receipt state, but must link
   back to the authoritative artifact.
4. A receipt or summary must not become the only source of truth for ship
   readiness when the repository artifact is absent.

## 11. Non-goals

- No runtime sync-v1 implementation or unpause.
- No new `RepoRecord`, `syncScope`, event contract, or Tauri command.
- No replacement of existing admin, Site, or workflow contracts.
- No new cloud-owned mutable verification database.
- No permission to omit evidence lanes without an explicit deferred gate or
  blocker.
