# Discovery Review - account-sync-surface-adapters

| Field | Value |
|---|---|
| Feature | account-sync-surface-adapters |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #6 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for a docs-only contract that defines how Web, Mac
Desktop, and Desktop Plugin surfaces consume Account Cloud Sync without turning
sync into a seventh product surface or unpausing runtime sync-v1 work.

Required coverage from the reviewed brief and roadmap row:

- Web adapter boundaries for writable entity classes, browser-local ownership,
  sync status inputs, conflict affordances, and D3 routing when Desktop impact
  exists;
- Mac Desktop adapter boundaries for writable entity classes, SQLCipher /
  Keychain / native-seam ownership, sync status inputs, and conflict
  affordances;
- Desktop Plugin adapter boundaries for entity declaration, repository-only
  access, and sync-status/conflict consumption without push/pull ownership;
- preservation of local-first exclusions, repository-only plugin access,
  protocol-surface authority, and paused `sync-v1` / plugin-runtime status.

Grounded constraints:

- `docs/contracts/account-cloud-sync-architecture.md` already fixes the shared
  topology: Web and App sync through one account cloud layer, not to each
  other, and sync is infrastructure rather than a product surface.
- `docs/contracts/account-sync-entity-scope-matrix.md` already freezes which
  entity classes are `account-sync`, `device-local`, mixed, or deferred.
- `docs/contracts/account-device-identity-contract.md` already freezes
  account/device/session boundaries and device-bound request identity.
- `docs/contracts/account-sync-local-first-boundaries.md` already freezes
  repository-driver ownership, local-first exclusions, and the repository-only
  plugin boundary.
- `docs/contracts/account-sync-protocol-surface-contract.md` already freezes
  write -> outbox -> push/pull -> conflict/retry/manual-sync sequencing and
  cadence semantics.
- `docs/contracts/data-repository-v0.md` already owns `RepoRecord`,
  `syncScope`, repository-driver rules, and the entity defaults that later
  adapters must consume.
- `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md`
  remain the authority for crypto, encrypted blobs, SQLCipher, WebCrypto,
  nonce lease, and paused runtime sync-v1 work.
- ADR-0013 D3/D4 already freezes the two critical governance rules:
  Desktop-impacting Web changes still pass the D3 gate, and account-sync remains
  Web <-> account cloud <-> App rather than Web <-> App.

## 2. Canonical naming and output shape

Canonical feature name: `account-sync-surface-adapters`.

Title: Account Cloud Sync surface adapters.

Naming rationale:

- the roadmap row and reviewed feature brief already define this slice as the
  Web/App/Plugin adapter-boundary contract;
- the slug stays narrower than Admin/Site/Workflow follow-up rows and broader
  than any one surface-specific implementation row;
- the canonical build target is a shared contract doc at
  `docs/contracts/account-sync-surface-adapters.md`, which matches the
  cross-surface nature of the work.

External research: not required. This row is fully constrained by repo-local
contracts, ADR-0013 governance, and the sync roadmap.

Selected shape:

- planning artifacts remain under
  `docs/reviews/account-sync-surface-adapters/`;
- the later build phase should add one canonical shared contract at
  `docs/contracts/account-sync-surface-adapters.md`.

Reasoning:

- the adapter contract is a cross-surface authority, so the canonical runtime
  contract belongs in `docs/contracts/`;
- the workflow artifacts should follow the existing account-sync roadmap review
  pattern in `docs/reviews/`;
- this row is docs-only and should not scatter authoritative adapter rules
  across `web`, `app`, or `plugin` module docs before review.

## 3. Candidate options

### Option A - One shared adapter contract with per-surface matrices

Put one canonical contract in `docs/contracts/account-sync-surface-adapters.md`
with explicit Web, App, and Plugin adapter sections plus downstream-routing
rules.

Pros:

- keeps one authority for all cross-surface consumers;
- composes cleanly on top of rows #1-#5 without reopening their boundaries;
- makes follow-up work easy to route into `web`, `app`, `plugin`, or `sync`
  lanes.

Cons:

- the contract must be carefully scoped so it does not absorb Admin/Site or
  runtime sync-v1 details.

### Option B - Fold adapter rules into rows #4 and #5

Expand `account-sync-local-first-boundaries.md` and
`account-sync-protocol-surface-contract.md` instead of adding a new row #6
contract.

Pros:

- fewer contract files;
- no new top-level contract slug.

Cons:

- store ownership and protocol sequencing would get mixed with surface
  responsibilities, making later reviews harder;
- the roadmap already reserved row #6 specifically for surface adapters;
- would blur the difference between repository ownership, protocol semantics,
  and product-surface consumption.

### Option C - Split the contract by owning product module

Write separate adapter docs under Web/App/Plugin locations instead of one sync
 contract.

Pros:

- each owning module sees only its local surface.

Cons:

- no single cross-surface authority;
- higher risk of drift on shared status/conflict and local-first rules;
- conflicts with the roadmap intent that this row lives in the `sync` lane as a
  shared infrastructure contract.

## 4. Recommendation

Recommend Option A: one shared adapter contract in `docs/contracts/` with
review-pack support in `docs/reviews/account-sync-surface-adapters/`.

Why this is the correct fit:

- row #6 is the first place where Web/App/Plugin consumption rules should be
  frozen together;
- rows #4 and #5 already cover store ownership and protocol sequencing, so this
  row should consume those authorities and translate them into adapter-facing
  responsibilities;
- the contract can remain docs-only while still being concrete enough to gate
  later `web`, `app`, and `plugin` implementation rows.

## 5. Adapter decisions to freeze

### 5.1 Web adapter boundary

The Web adapter should be the browser product-surface consumer of account-sync:

- writable `account-sync` entities go through repository APIs backed by
  IndexedDB and WebCrypto-friendly storage;
- browser-local preferences, service-worker caches, search indexes, and other
  runtime-only state remain local-first and outside account-sync;
- Web may render sync status, pending mutations, conflict counts, last-sync
  freshness, and account/device remediation states from repository + account
  seams;
- Web conflict affordances consume the explicit routing outcomes from row #5;
- any Web change that alters Desktop behavior or shared source semantics still
  requires ADR-0013 D3 classification before App follow-up work.

### 5.2 Mac Desktop adapter boundary

The App adapter should be the native/runtime consumer of account-sync:

- writable `account-sync` entities go through repository APIs backed by
  SQLite/SQLCipher plus Keychain/Tauri secure seams;
- App owns native permission prompts, file/bookmark boundaries, local
  migrations, offline runtime behavior, and native sync-status surfaces;
- App may render the same sync/conflict/remediation states as Web, but through
  App-owned runtime and native UI seams;
- App does not consume Web state directly and does not redefine protocol or
  crypto;
- mixed records such as `organizer.item` must honor the row #4 field split and
  keep local-only path/permission data below the adapter.

### 5.3 Desktop Plugin adapter boundary

The Plugin adapter should remain repository-only:

- plugins declare business entities, default `syncScope`, and repository usage;
- plugins submit mutation intent through repository APIs only;
- plugins may consume read-only sync-status, pending-conflict, and remediation
  hooks exposed by owning product surfaces or shared repository contracts;
- plugins must not implement push/pull engines, secure-key handling, direct
  IndexedDB/SQLite/Supabase access, or their own conflict transport layer;
- because the plugin lane remains P2 paused, row #6 can define the contract but
  must not imply that plugin runtime/SDK work is unpaused.

### 5.4 Cross-surface status and conflict model

The contract should freeze one shared set of adapter-facing meanings for later
surfaces to consume:

- healthy / up-to-date;
- syncing / pending local outbox work;
- conflict pending;
- retry scheduled;
- account/device remediation required;
- unavailable or paused by lane/runtime readiness.

This row should describe meanings and ownership, not invent a new event bus,
wire format, or error-code system.

### 5.5 Downstream routing rule

The contract should explicitly route future follow-up work:

- repository/entity/protocol/remote-read-model changes stay in `sync`;
- browser adapter or browser sync-status/conflict UI changes go to `web`;
- native runtime, SQLCipher, Keychain, Tauri, or App sync-status UI changes go
  to `app`;
- plugin entity declaration and repository-consumption changes go to `plugin`;
- Admin/Site/Workflow remain downstream consumers of metadata or later rows,
  not owners of this adapter contract.

## 6. Recommended contract sections

The canonical contract should contain:

1. normative scope and inherited authorities from rows #1-#5, ADR-0013 D3/D4,
   `data-repository-v0`, `TECHNICAL_REQUIREMENTS`, and paused `sync-v1`;
2. a surface adapter matrix for Web, App, and Plugin responsibilities;
3. per-surface writable entity-class and local-only boundary tables;
4. sync-status and conflict-input contract sections for Web and App consumers;
5. plugin repository-only declaration and consumption rules;
6. downstream routing rules for future `web` / `app` / `plugin` / `sync`
   implementation rows;
7. verification gates for later runtime rows.

## 7. Risks and open questions

| Risk / question | Treatment in this row |
|---|---|
| The contract accidentally turns sync into a user-facing standalone surface | Keep the document framed as an adapter-consumption contract and preserve row #1 positioning that sync is shared infrastructure only. |
| Web adapter wording weakens ADR-0013 D3 and implies direct Web-to-App propagation | State explicitly that Desktop-impacting Web changes still route through D3 classification before App work. |
| Plugin wording accidentally unpauses plugin runtime or grants plugins push/pull responsibility | Keep plugin rules repository-only and call out the paused P2 plugin/runtime status. |
| App adapter redefines SQLCipher, Keychain, or crypto details | Cite row #4 plus `TECHNICAL_REQUIREMENTS` as inherited authorities and keep App sections at boundary/responsibility level only. |
| Status/conflict contract becomes too vague for future UI rows | Freeze a shared adapter-facing state vocabulary without inventing new transport/event APIs. |
| `organizer.item` local path/bookmark data gets over-resolved here | Preserve the existing mixed-entity split from rows #2 and #4 rather than deciding new sync-safe fields. |

## 8. Acceptance mapping

| Acceptance signal | Covered by |
|---|---|
| Adapter diagrams or tables exist for Web, Desktop, and Plugin responsibilities | Recommended contract sections 2 and 3 |
| Each adapter lists writable entity classes, read models, offline behavior, conflict UI hooks, and verification gates | Sections 5.1 through 5.4 and recommended contract sections 3, 4, and 7 |
| Web remains P0 source and Desktop-impacting Web changes still go through D3 | Source fidelity and decision 5.1 |
| Native/runtime work stays in `app`, plugin SDK work stays in `plugin`, protocol/entity work stays in `sync` | Decision 5.5 |
| Plugins declare entities and use repository APIs only | Decision 5.3 |
| P2 paused status for plugin and sync-v1 runtime work is preserved | Source fidelity and decisions 5.2 through 5.5 |
| `RepoRecord`, `syncScope`, crypto, and device identity are not redefined | Source fidelity and recommended contract section 1 |

## 9. Review recommendation

APPROVE a single docs-only build phase that:

- adds `docs/contracts/account-sync-surface-adapters.md`;
- registers it in `docs/contracts/README.md`;
- freezes Web/App/Plugin adapter responsibilities, sync-status/conflict inputs,
  and downstream routing without reopening rows #1-#5;
- keeps runtime sync-v1 and plugin-runtime work paused.

The build must not touch runtime code, redefine `RepoRecord`, `syncScope`,
crypto, or device identity, weaken ADR-0013 D3/D4, or imply that plugins own
push/pull engines.
