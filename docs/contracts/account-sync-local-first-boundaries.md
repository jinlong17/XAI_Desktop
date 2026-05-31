# Account Sync Local-First Boundaries Contract

| Field | Value |
|---|---|
| Owner | `sync` product module |
| Status | Draft contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #4 |
| Applies to | Web, Mac Desktop, Desktop Plugin, Sync backend, Admin/Site/Workflow derived surfaces |
| Builds on | ADR-0013 D4, `docs/contracts/data-repository-v0.md`, `docs/contracts/account-cloud-sync-architecture.md`, `docs/contracts/account-sync-entity-scope-matrix.md`, `docs/contracts/account-device-identity-contract.md`, `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md` |

## 1. Purpose

This contract freezes repository-driver ownership and local-first boundaries for
account-sync data classes before any runtime account-sync entity implementation.

It defines:

- per-surface store ownership for Web, Mac Desktop, Plugin, and remote layers;
- remote representation limits (encrypted envelope plus metadata only);
- the plugin repository-only boundary and forbidden direct store access;
- local-first runtime-state exclusions and promotion rule;
- offline/outbox separation requirements;
- mapping and tests that must exist before any entity-level implementation work.

This document does not redefine `RepoRecord`, `syncScope`, or sync-v1 crypto.

## 2. Normative scope and invariants

1. ADR-0013 D4 remains the governing account-cloud-sync model: Web and App do
   not sync directly to each other; both sync to the account cloud layer.
2. `docs/contracts/data-repository-v0.md` remains the source for `RepoRecord`,
   `syncScope`, repository semantics, and driver-level constraints.
3. `docs/TECHNICAL_REQUIREMENTS.md` and `sync-v1` remain the source for
   protocol and cryptography (push/pull, nonce, AAD, HPKE, commit sequence).
4. This row is docs/contracts only. It does not unpause sync-v1 runtime work.

## 3. Repository-only plugin boundary

Plugins own business entities and business intent, but never storage substrate or
transport internals.

Required rule set:

- Plugins read/write through repository interfaces only.
- Plugins do not choose SQLite vs IndexedDB vs remote transport.
- Plugins must not directly access localStorage, SQLite, IndexedDB, Supabase,
  service-role APIs, or secure-key material.
- SQLCipher, Keychain, WebCrypto, and Tauri secure seams stay below repository
  adapters and account/sync infrastructure seams.

## 4. Surface store ownership matrix

| Surface | Local store authority | Secure/crypto seam | Remote representation | Offline write ownership |
|---|---|---|---|---|
| Web runtime | IndexedDB repository driver for repository records; browser-safe preference storage for non-repository state | WebCrypto-friendly envelope/key usage; no browser-visible raw key persistence | encrypted envelope + metadata only | Web repository driver owns local writes + pending account-sync mutations |
| Mac Desktop runtime | SQLite/SQLCipher repository driver | Keychain-backed secret handles + Tauri/Rust crypto commands | encrypted envelope + metadata only | Desktop repository driver owns local writes + pending account-sync mutations |
| Desktop Plugin | Repository interface only | none directly; plugin receives no raw key material | none directly | plugin submits intent only through repository APIs |
| Sync backend | no product-local store authority | validates protocol metadata and auth/device state; never plaintext payload authority | encrypted envelope + metadata, mutation/revision/cursor/conflict metadata | receives push/pull protocol traffic only |
| Admin/Site/Workflow projections | derived read-model/projection storage only | no product secret ownership | derived metadata only; no encrypted payload plaintext path | no product mutation ownership |

## 5. Data-class to store mapping baseline

### 5.1 Current authority repository entities

| Entity class | Web local owner | Desktop local owner | Plugin access path | Remote allowance | Offline + outbox rule |
|---|---|---|---|---|---|
| `organizer.grid` | IndexedDB repo | SQLite/SQLCipher repo | repository API only | allowed (`account-sync`) | offline writes allowed; pending mutation may enter outbox |
| `labels.label` | IndexedDB repo | SQLite/SQLCipher repo | repository API only | allowed (`account-sync`) | offline writes allowed; pending mutation may enter outbox |
| `productivity.todo` | IndexedDB repo | SQLite/SQLCipher repo | repository API only | allowed (`account-sync`) | offline writes allowed; pending mutation may enter outbox |
| `productivity.habit` | IndexedDB repo | SQLite/SQLCipher repo | repository API only | allowed (`account-sync`) | offline writes allowed; pending mutation may enter outbox |
| `project.board` | IndexedDB repo | SQLite/SQLCipher repo | repository API only | allowed (`account-sync`) | offline writes allowed; pending mutation may enter outbox |
| `project.card` | IndexedDB repo | SQLite/SQLCipher repo | repository API only | allowed (`account-sync`) | offline writes allowed; pending mutation may enter outbox |
| `organizer.item` | IndexedDB repo (sync-safe subset only) | SQLite/SQLCipher repo (sync-safe subset only) | repository API only | conditional by `syncScope` and field split | local-only fields stay out of outbox; only approved sync-safe subset may enqueue |
| `clipboard.item` | browser-local repo path when present | desktop-local repo path when present | repository API only | never (`device-local`) | offline local-only; must never enter outbox |

### 5.2 Reserved/deferred classes

| Entity class | Default class | Store mapping baseline | Remote rule |
|---|---|---|---|
| `widgets.widget` | planned `device-local` | local repository mapping only | must remain out of outbox |
| `productivity.pomodoro_session` | planned `account-sync` | Web + Desktop mapping must be written before implementation | envelope + metadata only once promoted |
| `account.device` | server-authoritative identity contract | handled through account/device contract and server metadata paths | not a user-payload repository record in v1 |

## 6. Local-first exclusions (runtime-only by default)

The following classes remain local-first by default and are excluded from
account-sync unless a later ADR-0013 D4-complete feature explicitly promotes
individual fields/classes:

- window layout and runtime window state;
- clipboard contents/history;
- current selection, drag state, and interaction-local UI state;
- cache indexes, service-worker caches, and runtime optimization caches;
- local file path, bookmark, and permission details not explicitly approved as
  sync-safe metadata.

Promotion rule:

- no implicit promotion by implementation convenience;
- promotion requires an explicit follow-up feature that updates mapping,
  boundaries, and tests under D4 completeness gates.

## 7. Offline and outbox separation contract

1. Local writes must always be accepted by owning local repositories when local
   storage is available.
2. Pending account-sync mutations are owned by local repository/outbox seams,
   not plugin runtime state.
3. `device-local` classes and local-only fields must be filtered out before
   remote enqueue.
4. Remote enqueue carries encrypted envelope + metadata only; never plaintext
   payload storage authority.
5. Protocol details remain in sync-v1 rows; this contract only freezes storage
   ownership and eligibility boundaries.

## 8. Prerequisite gate for future entity implementation

Before any `account-sync` entity implementation starts, all of the following
must be documented for that entity class:

1. Web store mapping (IndexedDB/WebCrypto-friendly ownership).
2. Desktop store mapping (SQLite/SQLCipher + Keychain/Tauri seam ownership).
3. Plugin repository API boundary and forbidden direct-access paths.
4. Remote representation limits (encrypted envelope + metadata only).
5. Local-only exclusions and field-level split rules.
6. Required tests for repository-driver behavior and `syncScope` enforcement.

Row #5 and later protocol rows may build on these mappings but must not backfill
missing store ownership definitions retroactively.

## 9. Required contract-test matrix

The following test categories are mandatory evidence once runtime implementation
rows begin:

| Test category | Required proof |
|---|---|
| Repository boundary tests | plugin-facing surfaces cannot bypass repository adapters |
| `syncScope` enforcement tests | `device-local` entities never enqueue to remote outbox |
| Field-split tests for mixed entities | `organizer.item` local-only fields never leak into sync-safe payload |
| Web mapping tests | IndexedDB repository ownership and offline pending-mutation behavior |
| Desktop mapping tests | SQLite/SQLCipher ownership and local pending-mutation behavior |
| Remote representation tests | server path accepts encrypted envelope + metadata only |
| Projection boundary tests | Admin/Site/Workflow projections do not expose payload plaintext |

## 10. Non-goals

- No runtime account-sync implementation in this row.
- No redefinition of `RepoRecord`, `syncScope`, or sync-v1 crypto.
- No direct plugin ownership of SQLCipher/Keychain/WebCrypto secrets.
- No promotion of runtime-only local state by implication.
- No change to paused status of `docs/workflow/roadmap/sync-v1.md`.
