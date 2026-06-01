# Roadmap Seed Brief - account-sync-entity-scope-matrix

## Requirement

Create the entity sync matrix and local-first matrix for Account Cloud Sync. The matrix must classify current and planned `RepoRecord` entities as `account-sync`, `device-local`, admin/control-plane read model, or deferred, and must state which product surfaces can read/write each class.

## Hard Constraints

- `device-local` entities never enter the remote outbox.
- New or changed entities must define `entityType`, `schemaVersion`, migration plan, local store mapping, and tests according to ADR-0013 D4 and `data-repository-v0`.
- Admin audit and user sync audit must remain physically and logically separate.
- Clipboard, widget layout, native window state, Keychain material, and runtime caches remain local-first unless a later feature explicitly changes the contract.

## Acceptance Signal

- A matrix lists account data, product data, device-local data, admin read models, protocol metadata, and explicitly excluded secrets/runtime state.
- Every account-sync candidate has a proposed owner, store mapping, conflict posture, and verification expectation.
