# account-sync-surface-adapters - API

## Contract Outputs

This docs-only feature does not add a runtime API, typed event, or Tauri
command. Its output is the contract document
`docs/contracts/account-sync-surface-adapters.md`.

That contract should define three adapter-facing interfaces:

1. Web adapter contract
2. Mac Desktop adapter contract
3. Desktop Plugin adapter contract

## Upstream Interfaces

The contract must consume, not redefine, these authorities:

- `docs/contracts/data-repository-v0.md`
  - `RepoRecord`
  - `syncScope`
  - repository-only plugin rules
- `docs/contracts/account-cloud-sync-architecture.md`
  - Web <-> account cloud <-> App topology
  - sync as shared infrastructure
- `docs/contracts/account-sync-entity-scope-matrix.md`
  - entity-class defaults and mixed/deferred rules
- `docs/contracts/account-device-identity-contract.md`
  - account/device/session identity
  - device-bound request seams
- `docs/contracts/account-sync-local-first-boundaries.md`
  - per-surface local store ownership
  - local-first exclusions
- `docs/contracts/account-sync-protocol-surface-contract.md`
  - push/pull/conflict/retry/manual-sync semantics
- ADR-0013 D3/D4
  - Web-to-Desktop gate
  - account cloud sync governance

## Downstream Adapter Contracts

### Web adapter

Must specify:

- which `account-sync` entity classes Web may write through repository APIs;
- which local-only classes remain browser-local;
- which sync-status, conflict, retry, and remediation signals Web may consume;
- that Desktop-impacting Web changes still route through D3 before App work.

Must not specify:

- direct Web-to-App sync;
- new protocol fields, crypto rules, or secure-key ownership;
- direct plugin or App-native access patterns.

### Mac Desktop adapter

Must specify:

- which `account-sync` entity classes App may write through repository APIs;
- which native/local-only classes remain machine-local;
- App ownership of SQLite/SQLCipher, Keychain, Tauri secure seams, and native
  offline/runtime behavior;
- which sync-status, conflict, retry, and remediation signals App may consume.

Must not specify:

- new crypto definitions;
- direct reuse of Web state as an upstream source;
- plugin-visible secure storage handles.

### Desktop Plugin adapter

Must specify:

- entity declaration and default `syncScope` expectations through repository
  contracts;
- repository-only mutation and query access;
- read-only sync-status/conflict/remediation consumption hooks or inputs that
  later surfaces may expose.

Must not specify:

- push/pull ownership;
- direct IndexedDB, SQLite, Supabase, Keychain, or WebCrypto access;
- plugin-runtime unpause by implication.

## Error Semantics

The contract should describe adapter-facing sync states, not invent new error
codes. Minimum meanings to preserve from upstream contracts:

- healthy / current;
- syncing / pending outbox work;
- conflict pending;
- retry scheduled;
- account/device remediation required;
- unavailable / paused by lane or runtime readiness.

Auth/device failures, deterministic conflicts, and retry/dead-letter classes
remain defined by the existing account-device and protocol-surface contracts.

## Permission Notes

- Web permissions stay inside browser storage/session/device seams.
- App permissions stay inside native runtime, SQLCipher, Keychain, and Tauri
  seams.
- Plugins never receive secure-key or transport permissions directly.
- Admin/Site/Workflow remain downstream metadata consumers and do not gain
  payload authority from this row.

## Idempotency Notes

- Adapter contracts inherit repository mutation idempotency and push replay
  rules from the protocol-surface contract.
- This row must not define a second mutation identity model.
- Repeated status reads or conflict rendering must remain pure consumers of the
  existing repository/account-sync state, not new mutation sources.
