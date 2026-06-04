# Account Sync Surface Adapters Contract

| Field | Value |
|---|---|
| Owner | `sync` product module |
| Status | Draft contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #6 |
| Applies to | Web, Mac Desktop App, Desktop Plugin |
| Builds on | `account-cloud-sync-architecture`, `account-sync-entity-scope-matrix`, `account-device-identity-contract`, `account-sync-local-first-boundaries`, `account-sync-protocol-surface-contract`, `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, `sync-v1`, ADR-0013 D3/D4 |

## 1. Purpose

This contract freezes how product surfaces consume Account Cloud Sync through
adapters.

It defines:

- Web adapter responsibilities for writable entity classes, browser-local
  exclusions, sync-status/conflict inputs, offline ownership, and D3 routing;
- Mac Desktop adapter responsibilities for writable entity classes,
  local-first/native exclusions, SQLCipher + Keychain + Tauri secure seams,
  sync-status/conflict inputs, and offline ownership;
- Desktop Plugin adapter responsibilities for entity declaration,
  repository-only access, and read-only sync-status/conflict consumption;
- downstream routing rules for follow-up work in `web`, `app`, `plugin`, and
  `sync`.

Account Cloud Sync remains shared infrastructure, not a standalone product
surface.

## 2. Inherited Authorities

This contract consumes and does not redefine these authorities:

- `docs/contracts/account-cloud-sync-architecture.md` for the
  Web <-> account cloud <-> App topology and sync positioning;
- `docs/contracts/account-sync-entity-scope-matrix.md` for entity classes,
  especially mixed and device-local boundaries;
- `docs/contracts/account-device-identity-contract.md` for account/device/
  session identity and device-bound request seams;
- `docs/contracts/account-sync-local-first-boundaries.md` for per-surface store
  ownership, local-first exclusions, and plugin repository-only rules;
- `docs/contracts/account-sync-protocol-surface-contract.md` for
  write->outbox->push/pull->conflict/retry/manual-sync semantics;
- `docs/contracts/data-repository-v0.md` for `RepoRecord`, `syncScope`, and
  repository-driver behavior;
- `docs/TECHNICAL_REQUIREMENTS.md` and
  `docs/workflow/roadmap/sync-v1.md` for protocol and cryptographic invariants;
- ADR-0013 D3 and D4 for Web->Desktop governance and account-cloud sync model.

## 3. Normative Guardrails

1. Desktop-impacting Web changes must pass ADR-0013 D3 classification before App
   follow-up work.
2. D4 topology is fixed: Web and App do not sync to each other; both sync
   through one account cloud layer.
3. Plugin and `sync-v1` runtime work remain paused by current roadmap status;
   this row defines boundaries only.
4. Plugins declare entities and use repository APIs; they never own push/pull
   engines or secure-key seams.
5. This row does not redefine `RepoRecord`, `syncScope`, crypto, or device
   identity.
6. Mixed `organizer.item` behavior remains as already frozen: sync-safe fields
   may be `account-sync`, while local path/bookmark/permission fields stay
   local-first.

## 4. Surface Adapter Matrix

| Adapter | Writable entity classes | Local-only exclusions | Sync status / conflict inputs | Offline ownership | Must not do |
|---|---|---|---|---|---|
| Web | Current `account-sync` classes through repository APIs (`organizer.grid`, `labels.label`, `productivity.todo`, `productivity.habit`, `project.board`, `project.card`, and sync-safe subset of `organizer.item`) | Browser-local preferences, service-worker caches, runtime indexes, session-only state, local-only `organizer.item` fields | Repository and account-sync seam states: healthy/current, syncing/pending, conflict pending, retry scheduled, account/device remediation required, unavailable/paused | Browser repository driver owns local writes and pending outbox handling | Must not create direct Web->App sync, redefine protocol/crypto, or bypass repository/adapters |
| Mac Desktop App | Current `account-sync` classes through repository APIs (same class baseline as Web; sync-safe subset for `organizer.item`) | Native runtime/window state, local permission/bookmark details, local telemetry/cache, device-local records | Same semantic states as Web, consumed through App-owned runtime/native seams | Desktop repository driver owns local writes and pending outbox handling | Must not treat Web state as upstream truth, expose secure handles to plugins, or redefine protocol/crypto |
| Desktop Plugin | Declares business entities and default `syncScope` through repository contracts; submits mutation intent through repository APIs only | Direct DB/storage/transport access, secure-key access, plugin-local push/pull implementations | Read-only consumption of surfaced sync status/conflict/remediation inputs from owning surfaces/contracts | Plugins own business intent only; outbox/push/pull remain infra-owned | Must not implement push/pull engines, direct IndexedDB/SQLite/Supabase access, or unpause plugin runtime by implication |

## 5. Shared Adapter-Facing Sync-State Meanings

All adapter consumers must preserve these meanings:

- `healthy_current`: local and remote state is current within defined cadence;
- `syncing_pending`: local outbox work is pending or in-flight;
- `conflict_pending`: deterministic conflict requires explicit resolution path;
- `retry_scheduled`: transient failure queued for bounded retry;
- `account_device_remediation_required`: auth/device state blocks automatic sync;
- `unavailable_paused`: lane/runtime readiness prevents active sync.

This row freezes meaning-level semantics only. It does not define new transport,
error-code catalogs, or event contracts.

## 6. Entity Caveat Preservation

`organizer.item` remains mixed/conditional as defined upstream:

- sync-safe metadata may participate in `account-sync`;
- local path, bookmark, permission, and privacy-sensitive fields remain
  local-first and must stay out of remote outbox/envelope paths unless a later
  explicit authority updates the split.

## 7. Downstream Work Routing

| Follow-up change type | Owning module |
|---|---|
| Entity-class policy, `syncScope` governance, protocol sequencing, push/pull/conflict contracts, remote read-model contracts | `sync` |
| Browser adapter behavior, browser sync-status/conflict UX, browser-local state boundaries | `web` |
| Native runtime/SQLCipher/Keychain/Tauri secure seams, App sync-status/conflict UX, native offline behavior | `app` |
| Plugin entity declaration and repository-consumption behavior | `plugin` |

Additional routing rules:

- Web remains P0 product surface and App UI source.
- Desktop-impacting Web changes still flow through D3 before App adaptation.
- Admin/Site/Workflow remain downstream metadata consumers and do not own this
  adapter contract.

## 8. Verification Gates For Later Runtime Rows

Any runtime row claiming this contract must prove:

1. Web and App both respect current entity-class and local-first exclusions.
2. Plugin access remains repository-only with no direct storage/transport path.
3. Web/App expose consistent conflict/remediation meanings while using their own
   runtime seams.
4. Desktop-impacting Web deltas include D3 classification before App promotion.
5. No row implicitly unpauses plugin runtime or `sync-v1` runtime work.

## 9. Non-goals

- No runtime implementation in this row.
- No redefinition of `RepoRecord`, `syncScope`, protocol, crypto, or device
  identity contracts.
- No plugin SDK/widget-host unpause.
- No direct Web-to-App sync path.
