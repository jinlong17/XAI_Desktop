# Roadmap Manifest - account-cloud-sync-foundation

- Roadmap Source: user prompt 2026-05-31, "Design Account Cloud Sync as shared account and sync infrastructure"
- Init Path: decompose
- Generated: 2026-05-31
- Default Automation Mode: A-Codex
- Default Dependency Semantics: shipped
- Default Verify Cross-vendor: yes
- Wave Concurrency Cap: 3
- BG Direct Verified: unknown

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | account-sync-architecture-charter | docs/reviews/account-sync-architecture-charter/20260531-roadmap-seed.md | - | - | SHIPPED | (default) | (default) | 2026-05-31T04:58:00-0700 | A-Codex serial; build `22de0e6`; verify/status `15d71f5`; shipped via ship gate; dev_log=docs/reviews/account-sync-architecture-charter/dev_log.md |
| 2 | account-sync-entity-scope-matrix | docs/reviews/account-sync-entity-scope-matrix/20260531-roadmap-seed.md | account-sync-architecture-charter | shipped | PENDING | (default) | (default) | - | Entity sync matrix and local-first matrix over `syncScope`. |
| 3 | account-device-identity-contract | docs/reviews/account-device-identity-contract/20260531-roadmap-seed.md | account-sync-architecture-charter | shipped | PENDING | (default) | (default) | - | Shared account/device/session/admin-claim contract. |
| 4 | account-sync-local-first-boundaries | docs/reviews/account-sync-local-first-boundaries/20260531-roadmap-seed.md | account-sync-entity-scope-matrix, account-device-identity-contract | shipped | PENDING | (default) | (default) | - | Repository-driver and local-first boundary plan for Web/App/Plugin. |
| 5 | account-sync-protocol-surface-contract | docs/reviews/account-sync-protocol-surface-contract/20260531-roadmap-seed.md | account-sync-entity-scope-matrix, account-device-identity-contract | shipped | PENDING | (default) | (default) | - | Push/pull/outbox/conflict contract that preserves sync-v1 crypto. |
| 6 | account-sync-surface-adapters | docs/reviews/account-sync-surface-adapters/20260531-roadmap-seed.md | account-sync-local-first-boundaries, account-sync-protocol-surface-contract | shipped | PENDING | (default) | (default) | - | Web, Desktop, and Plugin adapter boundaries. |
| 7 | account-sync-admin-read-models | docs/reviews/account-sync-admin-read-models/20260531-roadmap-seed.md | account-device-identity-contract, account-sync-protocol-surface-contract | shipped | PENDING | (default) | (default) | - | Unified Admin Dashboard read models, RBAC, audit, and privacy boundaries. |
| 8 | account-sync-site-entry-contract | docs/reviews/account-sync-site-entry-contract/20260531-roadmap-seed.md | account-device-identity-contract | shipped | PENDING | (default) | (default) | - | Official Site account-entry, release/status, and sync/security claim boundary. |
| 9 | account-sync-workflow-state-contract | docs/reviews/account-sync-workflow-state-contract/20260531-roadmap-seed.md | account-sync-surface-adapters, account-sync-admin-read-models | shipped | PENDING | (default) | (default) | - | Workflow/dev-dashboard/release-log state integration without a parallel product state system. |
| 10 | account-sync-verification-gates | docs/reviews/account-sync-verification-gates/20260531-roadmap-seed.md | account-sync-surface-adapters, account-sync-admin-read-models, account-sync-site-entry-contract, account-sync-workflow-state-contract | shipped | PENDING | (default) | (default) | - | Cross-surface verification, observability, and governance gates. |

## Decomposition Rationale

### R1. Module classification and authority

This roadmap is classified as the `sync` product module because the requirement centers on `syncScope`, account cloud, push/pull, encrypted blobs, device identity, conflict handling, and cross-device convergence. The source documents establish these constraints:

- `CLAUDE.md` and `docs/PRODUCT_MODULE_MAP.md` require every task to route into exactly one product module; `sync` owns account cloud-sync and data protocol work.
- ADR-0013 D4 says Web and App do not sync to each other. Both sync to one account cloud layer.
- `docs/contracts/data-repository-v0.md` owns the `RepoRecord` shape and `syncScope` split.
- `docs/TECHNICAL_REQUIREMENTS.md` and sync-v1 own the cryptographic protocol. This roadmap must not redefine them.
- `docs/workflow/roadmap/sync-v1.md` is paused. This init output is an architecture and review manifest, not permission to start runtime sync implementation.

### R2. Automation mode

The user invocation supplied `Automation Mode: A-Codex`. Current repo-local Workflow V2 specs now treat `A-Codex` as a first-class lead-runtime mode: the current Codex session leads planning, build orchestration, and verification, spawning workers when possible and falling back to inline worker-contract execution when spawn depth is unavailable. `Verify Cross-vendor: yes` was preserved exactly as supplied.

### R3. Architecture-first decomposition

The roadmap is split into ten design/contract features rather than runtime implementation features:

1. `account-sync-architecture-charter` creates the canonical positioning and source-of-truth document.
2. `account-sync-entity-scope-matrix` converts the high-level goal into an entity matrix and local-first matrix.
3. `account-device-identity-contract` defines the account/device/session/RBAC spine that all surfaces share.
4. `account-sync-local-first-boundaries` maps repository drivers and local-first behavior.
5. `account-sync-protocol-surface-contract` connects local mutations to the existing sync-v1 protocol surface without changing cryptography.
6. `account-sync-surface-adapters` defines Web/App/Plugin adapter boundaries.
7. `account-sync-admin-read-models` defines how Admin gets a unified data source without decrypting user payloads.
8. `account-sync-site-entry-contract` defines what the official Site may expose about account/sync/release status.
9. `account-sync-workflow-state-contract` prevents Workflow/dev-dashboard state from becoming a parallel source of truth.
10. `account-sync-verification-gates` closes the roadmap with a cross-surface verification and observability gate suite.

This shape keeps runtime implementation out of the first pass and gives the human review gate concrete contracts to approve before any feature-build work.

### R4. Dependency graph

Wave 0:

- `account-sync-architecture-charter`

Wave 1:

- `account-sync-entity-scope-matrix`
- `account-device-identity-contract`

Wave 2:

- `account-sync-local-first-boundaries`
- `account-sync-protocol-surface-contract`

Wave 3:

- `account-sync-surface-adapters`
- `account-sync-admin-read-models`
- `account-sync-site-entry-contract`

Wave 4:

- `account-sync-workflow-state-contract`

Wave 5:

- `account-sync-verification-gates`

Edges are `shipped` by default because downstream contracts should not start from an unapproved architecture baseline. A reviewer may relax some edges to `ready_to_ship` if they want faster parallel planning, especially `account-sync-site-entry-contract` after `account-device-identity-contract`.

### R5. Entity sync matrix draft

| Data class | Examples | Default scope | Owner | Remote sync? | Notes |
|---|---|---|---|---|---|
| Account identity | account id, email, auth session metadata, admin claim metadata | account server | account/auth | yes, server authoritative | Not a `RepoRecord` payload; exposed through auth/admin APIs. |
| Device identity | device id, `encryption_device_id`, device pub, active/revoked status | account-sync | sync/account | yes | Drives device-bound fetch and per-device DEK wrap. |
| Product core data | `organizer.grid`, `labels.label`, `productivity.todo`, `productivity.habit`, `project.board`, `project.card` | account-sync | owning plugin + `@repo/core-data` | yes | Must satisfy ADR-0013 D4's 9-item checklist. |
| Conditional file/app items | `organizer.item` with local path or app metadata | mixed | plugin-organizer + sync | maybe | Path permission and MAS sandbox reality decide account-sync vs device-local. |
| Desktop-local data | `clipboard.item`, `widgets.widget`, window state, tray state, drag/selection state | device-local | app/plugin | no | Must never enter remote outbox. |
| Secrets and key material | master password, secret key, DEK/KEK, device private key, provider raw keys | local/server secret handle only | account/security | no plaintext sync | Browser and Admin receive only status/handles where applicable. |
| Protocol metadata | revision, mutation id, commit seq, nonce lease, conflict shadow, sync cursor | account-sync protocol | sync-v1 | yes, metadata only | Required for deterministic convergence and auditability. |
| Admin read models | users, orgs, billing, quota, AI usage, feature flags, sync health, audit summary | admin server read model | admin/sync/billing/AI | read via admin API | Must not expose encrypted payload plaintext or service-role credentials. |
| Workflow state | roadmap status, release log, dev-dashboard sync health snapshots | repo-truth + read model | workflow/admin | controlled snapshot | Repository files remain source of truth for development workflow. |

### R6. Local-first matrix draft

| Surface | Local store | Account-sync path | Local-first exclusions | Verification |
|---|---|---|---|---|
| Web | IndexedDB/WebCrypto, selected localStorage prefs | Repository driver -> outbox -> `/sync/push` and `/sync/pull` | Service worker cache, UI prefs, session-only keys, local search index | IndexedDB contract tests, browser two-device smoke. |
| Mac Desktop | SQLite/SQLCipher, Keychain, Tauri crypto commands | Repository driver -> outbox -> `/sync/push` and `/sync/pull` | Keychain material, native window/runtime state, file bookmarks unless promoted | SQLite/outbox tests, SQLCipher wrong-key tests, macOS smoke. |
| Desktop Plugin | Repository interface only | Declares entity and syncScope, consumes sync status/conflict hooks | Direct DB/Supabase access, default widget/clipboard/device state | Plugin contract tests and syncScope enforcement. |
| Admin Dashboard | Server/admin API read models | Reads metadata, account status, usage, audit, quotas | User encrypted payloads, service-role secrets, provider raw secrets | RBAC, route denial, audit append, no-secret bundle checks. |
| Site | Public/account-entry pages | Links to account/session entry and status, no private sync data | Product payloads, admin data, service-role credentials | Public route smoke, CSP/env checks. |
| Workflow systems | Repo files plus optional generated snapshots | Read-only status aggregation only | Private user data, raw logs, secrets | Snapshot generation tests and source-of-truth checks. |

### R7. Web/App/Plugin/Admin boundary rules

- Web owns browser product UI and IndexedDB adapter behavior. It does not directly synchronize with App.
- App owns Tauri/native runtime, SQLCipher, Keychain, windows, and offline runtime behavior.
- Plugin owns business entities and only consumes repository APIs. It never implements the sync engine.
- Sync owns entity contracts, push/pull, outbox, encrypted blobs, conflict policy, device sync, and cross-device convergence.
- Admin owns control-plane read models, RBAC, guarded mutations, and audit UI. It reads server-side metadata and never decrypts user payloads.
- Site owns public account entry, downloads, update/release status, and public sync/security messaging.
- Workflow owns repo-truth state such as manifests and release logs; sync can feed status snapshots but must not replace repository state.

### R8. Phased development plan

Phase A - Architecture review:

- Ship rows #1-#3 as docs/contracts only.
- Human signs off on source-of-truth hierarchy, entity matrix, and account/device identity contract.

Phase B - Boundary and protocol contract:

- Ship rows #4-#5.
- Confirm no protocol rewrite is hidden in this roadmap; all cryptography stays in sync-v1.

Phase C - Product-surface adapters:

- Ship rows #6-#8.
- Produce Web/App/Plugin/Admin/Site adapter contracts and route follow-up work to owning modules.

Phase D - Workflow and governance:

- Ship rows #9-#10.
- Add verification gates and decide whether to unpause any runtime sync-v1 Phase 5 work.

No phase authorizes `site` or `admin` implementation branches by itself. Those modules remain PROPOSED until operator confirmation.

### R9. Verification gates

Minimum gates expected from this roadmap:

- Entity contract gate: `entityType`, `schemaVersion`, migration plan, local mappings, and owner are defined.
- Scope gate: `device-local` never enters remote outbox.
- Protocol gate: push/pull uses existing sync-v1 envelopes, AAD, nonce lease, mutation idempotency, and conflict shadow behavior.
- Store gate: Web IndexedDB and App SQLite/SQLCipher mappings are covered.
- Two-device gate: device A write -> server encrypted blob -> device B pull/apply convergence.
- Conflict gate: no silent LWW; conflicts are flagged or resolved by explicit merge.
- Admin gate: RBAC, route denial, no service-role or provider secret in browser bundle, mutation audit append.
- Site gate: no private payload or control-plane data leaks through public pages.
- Workflow gate: manifests/dev logs/release logs remain repository-truth; sync/dashboard read models are derived.
- Observability gate: metrics may include error code, entity type, hashed device id, retry count, batch size, HTTP status, duration; never payload, raw device id, entity id with private meaning, provider secret, or key material.

### R10. Assumptions and open questions

- Assumption: this roadmap is allowed as architecture/planning work even though sync-v1 runtime development is paused.
- Assumption: `A-Codex` is the intended Codex lead-runtime default for this roadmap.
- Assumption: Admin Dashboard will consume server-side read models, not the encrypted blob payload path.
- Open question: whether `account.device` should become a first-class `RepoRecord` entity or stay server/auth metadata only for v1.
- Open question: whether official Site account entry should be a separate `site` implementation or reuse an auth page under Web deployment infrastructure.
- Open question: whether workflow account integration is product-facing user state, internal operator state, or both. Row #9 exists to prevent accidental coupling.

## Review Gate

This init run stops here. The manifest and seed briefs are Step 0 input, not approved feature briefs. A human should review the feature boundaries, dependency graph, entity/local-first matrices, and the `A-Codex` default before any `run` execution.

## Next Step

```text
/xai-roadmap-loop mode: run
manifest: docs/workflow/roadmap/account-cloud-sync-foundation.md
dispatch: serial
```
