# Account Cloud Sync Entity Scope Matrix

| Field | Value |
|---|---|
| Owner | `sync` product module |
| Status | Draft contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #2 |
| Applies to | Web, Mac Desktop, Desktop Plugin, Admin Dashboard, Site, Workflow systems |
| Builds on | `docs/contracts/account-cloud-sync-architecture.md`, ADR-0013 D4, `docs/contracts/data-repository-v0.md`, `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md` |

## 1. Purpose

This contract fixes the classification matrix for current and planned Account
Cloud Sync entity classes. It tells later rows:

- which current authority `RepoRecord` entities are `account-sync`,
  `device-local`, mixed/conditional, or deferred;
- which product surfaces may read or write each class;
- which non-record classes must remain local-first or read-model only;
- which completeness and audit-separation rules apply before any future runtime
  sync implementation unpauses.

This document does not redefine `RepoRecord`, `syncScope`, sync-v1 crypto, or
transport semantics. It is a scope matrix layered on top of the existing
contracts.

## 2. Classification rules

### 2.1 `account-sync`

Use `account-sync` only when a record is intended to converge across devices
through the account cloud layer.

Rules:

- It must satisfy ADR-0013 D4's 9-item completeness rule before a future
  implementation row may treat it as runtime-ready.
- Web and Mac Desktop may read/write it only through owning repository adapters.
- Desktop Plugin may define business semantics and write through repository APIs,
  but must not bypass sync infrastructure.
- Admin may read derived metadata and health projections only, never encrypted
  payload plaintext.

### 2.2 `device-local`

Use `device-local` when data is scoped to one browser profile or one machine.

Rules:

- It never enters the remote outbox.
- It is exempt from D4 items 4-6 and 8-9 because it must not sync.
- It still requires `entityType`, `schemaVersion`, migration handling, local
  store mapping, and a local driver test.

### 2.3 Admin / control-plane read model

Admin and control-plane read models are server-side projections, not user
payload `RepoRecord` entities.

Rules:

- They may aggregate sync metadata, device status, quotas, billing, AI usage,
  workflow snapshots, and audit summaries.
- They must not expose encrypted payload plaintext, service-role credentials,
  provider raw secrets, or local-only user state.
- Their audit storage is separate from user sync audit storage.

### 2.4 Deferred

Deferred means the slug is reserved or the ownership/classification is not yet
finalized for runtime use.

Rules:

- A deferred row is not readable/writable in production by Web, App, Plugin,
  Admin, Site, or Workflow surfaces as a live product record.
- A later feature must explicitly promote it and, if applicable, satisfy the
  D4 completeness rule before runtime use.

## 3. Entity scope matrix

### 3.1 Current authority `RepoRecord` entities

| Entity | Authority status | Class | Owning domain | Local store mapping expectation | Surface contract | Verification expectation | Notes |
|---|---|---|---|---|---|---|---|
| `organizer.grid` | current | `account-sync` | `plugin-organizer` | Web IndexedDB and App SQLite/SQLCipher mapping required before runtime sync unpauses | Web and App may read/write only through owning repository adapters; plugins mutate via repo API; Admin metadata only | Full D4 9-item suite | Grid/container data is a canonical cross-device candidate. |
| `organizer.item` | current | mixed: `account-sync` by default, `device-local` when path/privacy rules require | `plugin-organizer` + platform adapter | Record fields may split between syncable metadata and local-only path/bookmark material | Web/App repository adapters may only sync the explicitly allowed subset; plugins do not choose transport; Admin metadata only | D4 full suite for syncable subset; local-only tests for downgraded cases | The conditional downgrade is preserved from `data-repository-v0`; this row does not resolve the exact downgrade rules. |
| `labels.label` | current | `account-sync` | `plugin-labels` | Web IndexedDB and App SQLite/SQLCipher mapping required | Web/App repository adapters may read/write; plugins write via repo API; Admin metadata only | Full D4 9-item suite | Shared label taxonomy is inherently account-scoped. |
| `productivity.todo` | current | `account-sync` | `plugin-productivity` | Web IndexedDB and App SQLite/SQLCipher mapping required | Web/App repository adapters may read/write; plugins write via repo API; Admin metadata only | Full D4 9-item suite | Task state is intended to converge across devices. |
| `productivity.habit` | current | `account-sync` | `plugin-productivity` | Web IndexedDB and App SQLite/SQLCipher mapping required | Web/App repository adapters may read/write; plugins write via repo API; Admin metadata only | Full D4 9-item suite | Habit cadence and completion history are account-scoped. |
| `clipboard.item` | current | `device-local` | clipboard/domain-local adapter | Local browser/device store only; no remote blob mapping | Only the local surface and owning plugin/runtime may read/write; Admin/Site/Workflow do not access payloads; Sync infra must ignore | Local driver test + outbox exclusion proof | Clipboard payload stays local-first and never enters remote outbox. |
| `project.board` | current | `account-sync` | `plugin-project` | Web IndexedDB and App SQLite/SQLCipher mapping required | Web/App repository adapters may read/write; plugins write via repo API; Admin metadata only | Full D4 9-item suite | Board/project containers are account-scoped. |
| `project.card` | current | `account-sync` | `plugin-project` | Web IndexedDB and App SQLite/SQLCipher mapping required | Web/App repository adapters may read/write; plugins write via repo API; Admin metadata only | Full D4 9-item suite | Card/task items converge with their parent board. |

### 3.2 Reserved / planned entities

| Entity | Authority status | Intended class | Promotion gate | Surface contract until promoted | Notes |
|---|---|---|---|---|---|
| `productivity.pomodoro_session` | reserved in `data-repository-v0` | planned `account-sync` | Future feature must define D4 items 1-9, plus owner-specific conflict policy | No production sync read/write yet | Candidate future productivity entity that likely shares label context with todos. |
| `widgets.widget` | reserved in `data-repository-v0` | planned `device-local` | Future feature must define entity metadata, local mapping, and local tests; must preserve no-outbox rule | No production sync read/write yet | Widget layout and runtime behavior stay local-first by default. |
| `account.device` | reserved in `data-repository-v0` | deferred, expected `account-sync` or server metadata depending row #3 | `account-device-identity-contract` must resolve whether this is a first-class record or remains server/account metadata | No production client record read/write yet | Device registry semantics are intentionally deferred to the identity row. |

## 4. Surface access matrix by class

| Class | Web | Mac Desktop | Desktop Plugin | Sync infrastructure | Admin Dashboard | Site | Workflow systems |
|---|---|---|---|---|---|---|---|
| `account-sync` `RepoRecord` | Read/write only through owning browser repository adapter | Read/write only through owning native repository adapter | Define business semantics and write through repository APIs only | Reads outbox entries, enforces scope, moves encrypted blobs, applies pull/conflict rules | Read derived metadata only; no payload plaintext | No direct access | Derived health/status snapshots only; not source of truth |
| `device-local` `RepoRecord` | Local read/write only when a browser-local feature exists | Local read/write only | Plugins may define and mutate via local repository path only | No access; must never receive outbox entries | No direct user-data access | No access | No direct payload access |
| Admin/control-plane read model | No direct access from product Web surfaces | No direct access from product App surfaces | No access | Emits or feeds metadata projections where allowed | Read/write through RBAC-guarded admin APIs and separate admin audit | Public pages may consume only explicitly curated public status, never raw admin models | May consume sanitized snapshots when explicitly exported |
| Deferred / reserved entity | No production access until promotion row ships | No production access until promotion row ships | No production access until promotion row ships | No production handling until promotion row ships | No production access | No access | No access |

## 5. Local-first exclusions matrix

| Data / state | Local authority | Remote sync allowed? | Boundary rule | Notes |
|---|---|---|---|---|
| Clipboard payloads and history | browser/device local runtime | No | Never enters remote outbox or admin payload views | `clipboard.item` remains the canonical device-local record. |
| Widget layout, widget runtime state, widget caches | browser/device local runtime | No | Stay local-first unless a later feature explicitly changes the contract | Reserved slug `widgets.widget` remains planned `device-local`. |
| Native window state, tray state, drag/selection state, runtime window caches | App runtime | No | Runtime UI state is never promoted to account-sync by this row | Includes window geometry/focus/ephemeral UI runtime state. |
| Keychain material, device private keys, KEK/DEK handles, provider raw secrets | secure local storage or guarded server handle | No plaintext sync | Only handles/status may cross boundaries where explicitly allowed | This row does not alter key lifecycle or crypto storage rules. |
| Service-worker caches, browser local indexes, temp runtime caches | surface-local runtime | No | Local optimization state must not be treated as account data | Includes browser and app transient caches. |
| Organizer path, bookmark, sandbox-permission details | platform-local adapter | Conditional, default local-only | Only explicitly approved sync-safe metadata may cross devices; raw local path/permission state must not be assumed syncable | Exact split remains for later boundary/protocol rows. |

## 6. Audit separation

Two audit domains remain separate:

1. User sync audit:
   - account/device sync events;
   - outbox/pull/conflict/revision/cursor metadata;
   - per-user or per-device operational history needed for sync integrity.
2. Admin/control-plane audit:
   - admin/operator reads;
   - RBAC changes;
   - control-plane mutations and moderation/ops actions.

Rules:

- They are physically and logically separate stores or append-only logs.
- Admin surfaces may inspect admin audit and derived sync-health summaries, but
  do not become the canonical store for user sync audit.
- User sync audit may feed aggregated health metrics into admin read models
  without merging raw audit stores.

## 7. Change rules for future features

Any future feature that adds or changes one of these entities must do all of the
following before claiming runtime-ready status:

1. preserve or explicitly update `entityType`;
2. declare the `schemaVersion` and migration plan;
3. define the local store mapping for every participating surface;
4. if `account-sync`, define push mutation format, pull apply rule, and
   conflict policy;
5. if `device-local`, prove no-outbox behavior;
6. define the required tests:
   - local driver test for every entity;
   - Web IndexedDB test when Web participates;
   - App SQLite/outbox test when App participates in `account-sync`;
   - two-device smoke when `account-sync` is enabled.

Promotion rules:

- `device-local` → `account-sync` requires an explicit later feature that
  updates this matrix and satisfies ADR-0013 D4.
- `deferred` → active class requires an owning follow-up feature and, where
  applicable, the full D4 checklist.

## 8. Non-goals

- No runtime sync-v1 unfreeze.
- No change to `RepoRecord`, `syncScope`, or crypto protocol definitions.
- No decision on `account.device` runtime ownership beyond marking it deferred.
- No promotion of clipboard, widget, native window, Keychain, or runtime cache
  state into remote sync.
