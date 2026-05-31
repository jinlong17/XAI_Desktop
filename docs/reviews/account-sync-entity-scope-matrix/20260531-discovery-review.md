# Discovery Review - account-sync-entity-scope-matrix

| Field | Value |
|---|---|
| Feature | account-sync-entity-scope-matrix |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #2 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for two docs-only outputs for Account Cloud Sync:

- an entity sync matrix that classifies current and planned `RepoRecord`
  entities as `account-sync`, `device-local`, admin/control-plane read model,
  or deferred;
- a local-first matrix that states which product surfaces may read or write each
  class.

Grounded constraints:

- `docs/contracts/account-cloud-sync-architecture.md` already fixes Account
  Cloud Sync as shared infrastructure, not a standalone product.
- `docs/contracts/data-repository-v0.md` owns the current `RepoRecord` set and
  the `syncScope: "device-local" | "account-sync"` split.
- ADR-0013 D4 requires Web and App to sync through one account cloud layer,
  forbids silent last-write-wins, and defines the 9-item completeness rule for
  any new `account-sync` feature.
- `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md` own
  transport and crypto details; this row must not redefine them.
- Runtime sync-v1 implementation remains paused, so this row is a contract and
  classification pass only.

## 2. Selected output shape

Selected shape: a canonical contract document under `docs/contracts/` plus
review artifacts under `docs/reviews/account-sync-entity-scope-matrix/`.

Reasoning:

- The output is cross-module and should be treated as a shared engineering
  contract, not plugin-local documentation.
- The row needs stable matrices that later rows can cite for local-first
  boundaries, protocol surfaces, and admin read models.
- The row is docs-only, so the review folder pattern used by
  `account-sync-architecture-charter` is the correct precedent.

Rejected shapes:

- New package or runtime implementation: rejected because sync-v1 remains
  paused and the user asked for docs/contracts only.
- Rewriting `data-repository-v0`: rejected because this row classifies and
  constrains entity scope; it does not replace the base record contract.
- Admin or Site feature planning: rejected because those remain downstream rows
  with operator-gated implementation lanes.

## 3. Classification decisions

### 3.1 Current authority entities

The current authority list comes from `docs/contracts/data-repository-v0.md`
section 3.1:

- `organizer.grid`
- `organizer.item`
- `labels.label`
- `productivity.todo`
- `productivity.habit`
- `clipboard.item`
- `project.board`
- `project.card`

Default classification decisions for this row:

- `account-sync`: `organizer.grid`, `labels.label`, `productivity.todo`,
  `productivity.habit`, `project.board`, `project.card`
- conditional / mixed: `organizer.item`
- `device-local`: `clipboard.item`

For `organizer.item`, the matrix must preserve the `data-repository-v0`
authority that path-backed or privacy-constrained items may need a
`device-local` downgrade even though the broad entity family participates in
organizer data sync.

### 3.2 Planned / reserved entities

The deferred authority list comes from `docs/contracts/data-repository-v0.md`
section 2.1:

- `productivity.pomodoro_session` → planned `account-sync`
- `widgets.widget` → planned `device-local`
- `account.device` → planned `account-sync`, but may remain server/account
  metadata until the account/device identity contract row resolves ownership

### 3.3 Non-RepoRecord classes that must still be constrained

This row must also classify non-record classes because the requirement includes
admin/control-plane read models and local-first exclusions:

- Admin/control-plane read models are server-side metadata projections, not
  `RepoRecord` payloads.
- Keychain material, device private keys, KEK/DEK handles, runtime caches,
  native window state, widget layout/runtime state, clipboard payloads, and
  service-worker/browser caches remain local-first or secret-handle only.
- Admin audit and user sync audit remain physically and logically separate.

## 4. Recommended contract sections

The canonical contract should contain:

1. classification rules for `account-sync`, `device-local`, admin read model,
   and deferred classes;
2. an entity matrix covering current authority entities and reserved future
   entities;
3. a surface access matrix stating Web, Mac Desktop, Desktop Plugin, Admin,
   Site, Workflow, and Sync-infra read/write boundaries by class;
4. a local-first exclusions matrix for non-record state and secrets;
5. completion rules for any future feature that promotes or changes an entity;
6. explicit separation of user sync audit from admin audit.

## 5. Risks and open questions

| Risk / question | Treatment in this row |
|---|---|
| Accidentally promoting `device-local` data into remote sync | State an explicit never-sync rule for clipboard, widgets, native window state, Keychain material, and runtime caches. |
| Treating admin projections like user payload data | Keep admin/control-plane read models outside `RepoRecord` payload sync and require separate audit storage. |
| `organizer.item` ambiguity around path-backed objects | Preserve mixed classification and defer concrete downgrade rules to later boundary/protocol rows. |
| `account.device` ownership ambiguity | Mark as deferred and note that row #3 (`account-device-identity-contract`) decides whether it stays metadata-only or becomes a first-class record. |
| Contract drift between doc authority and older runtime adapters | Keep `data-repository-v0` as authority and record any reconciliation as later implementation work instead of silently normalizing code drift here. |

## 6. Acceptance mapping

| Acceptance signal | Covered by |
|---|---|
| Matrix lists account data, product data, device-local data, admin read models, protocol metadata, and excluded secrets/runtime state | Contract sections 2 through 5 |
| Every account-sync candidate has owner, store mapping expectation, conflict posture, and verification expectation | Entity matrix columns and completion rules |
| Product surfaces can read/write each class without violating local-first boundaries | Surface access matrix |
| `device-local` never enters remote outbox | Classification rules and local-first exclusions matrix |
| Admin audit and user sync audit remain separate | Audit boundary section |

## 7. Review recommendation

APPROVE a single docs-only build phase that:

- adds `docs/contracts/account-sync-entity-scope-matrix.md`;
- registers it in `docs/contracts/README.md`;
- advances `docs/reviews/account-sync-entity-scope-matrix/dev_log.md` to
  `READY_FOR_VERIFY`.

The build should not edit runtime code, unpause sync-v1, redefine
`RepoRecord`/`syncScope`, or collapse admin and user audit domains.
