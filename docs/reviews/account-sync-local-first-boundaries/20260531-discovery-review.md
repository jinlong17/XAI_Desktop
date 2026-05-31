# Discovery Review - account-sync-local-first-boundaries

| Field | Value |
|---|---|
| Feature | account-sync-local-first-boundaries |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #4 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for a docs-only contract that fixes the
repository-driver and local-first boundaries for:

- Web IndexedDB/WebCrypto storage;
- Mac Desktop SQLite/SQLCipher plus Keychain-backed crypto seams;
- plugin-facing repository access boundaries;
- remote encrypted-envelope and metadata storage only.

Grounded constraints:

- `docs/contracts/account-cloud-sync-architecture.md` already fixes the
  hub-and-spoke rule: Web and App sync through one account cloud layer, not to
  each other.
- `docs/contracts/account-sync-entity-scope-matrix.md` already classifies
  which data classes are `account-sync`, `device-local`, mixed, or deferred.
- `docs/contracts/account-device-identity-contract.md` already freezes the
  account/device/session split and the Keychain/private-key boundary.
- `docs/contracts/data-repository-v0.md` already owns `RepoRecord`,
  `syncScope`, driver categories, and the rule that plugins must not directly
  access localStorage, SQLite, IndexedDB, or Supabase.
- `docs/TECHNICAL_REQUIREMENTS.md` already fixes the storage-security baseline:
  Web uses IndexedDB plus WebCrypto-friendly storage, Desktop uses
  SQLite/SQLCipher with Keychain-backed secrets, and remote blobs remain
  encrypted.
- `docs/workflow/roadmap/sync-v1.md` remains paused, so this row must stay
  docs/contracts only and must not smuggle in runtime sync-v1 implementation.

## 2. Canonical naming and output shape

Canonical feature name: `account-sync-local-first-boundaries`.

Title: Account Cloud Sync local-first boundaries.

Naming rationale:

- the target was supplied explicitly by the roadmap row and seed brief;
- the row is specifically about where local data lives, which adapters own it,
  and which state never leaves the local-first boundary;
- the slug stays narrower than protocol or surface-adapter work, which are
  already reserved for later roadmap rows.

External research: not required. This row is fully constrained by repo-local
contracts and roadmap authorities.

Selected shape: one canonical contract document under `docs/contracts/` plus
review artifacts under `docs/reviews/account-sync-local-first-boundaries/`.

Reasoning:

- the boundary contract spans Web, App, Plugin, Sync, Admin, Site, and
  Workflow concerns, so it belongs in the shared contracts directory;
- later rows need a stable store-mapping authority before any account-sync
  entity implementation starts;
- this row is docs-only and should follow the same contract-review pattern as
  shipped roadmap rows #1-#3.

Rejected shapes:

- new package or runtime driver implementation: rejected because sync-v1
  remains paused and the user requested docs/contracts only;
- rewriting `data-repository-v0`: rejected because this row maps authorities to
  surfaces and stores but must not redefine `RepoRecord`, `syncScope`, or
  driver primitives;
- folding this into the protocol row: rejected because row #5 owns push/pull,
  outbox, and conflict surfaces, while this row owns local store boundaries and
  repository seams.

## 3. Boundary decisions to freeze

### 3.1 Repository-first plugin contract

Plugins should see one repository-facing contract only:

- plugins define business entities, query needs, and mutation intent;
- plugins never choose SQLite vs IndexedDB vs remote transport;
- plugins must not directly access localStorage, SQLite, IndexedDB, Supabase,
  service-role APIs, or crypto secret stores;
- repository adapters own persistence and syncScope enforcement on each
  runtime.

### 3.2 Surface store ownership

The canonical contract should freeze these primary store seams:

| Surface | Local store authority | Secure/crypto seam | Remote representation |
|---|---|---|---|
| Web | IndexedDB repository driver plus browser-safe preference storage | WebCrypto-friendly envelope/key usage with no JS-visible raw secret persistence | encrypted envelope plus sync metadata only |
| Mac Desktop | SQLite/SQLCipher repository driver | Keychain-backed crypto handles and Tauri/Rust secure seams | encrypted envelope plus sync metadata only |
| Desktop Plugin | repository interface only | no direct secret ownership | none directly; repository/sync layer decides |
| Sync backend | no product-local store authority | server validates protocol metadata, not plaintext | encrypted envelope, mutation metadata, cursor/revision/conflict data |
| Admin / Site / Workflow | derived metadata or public/read-only projections only | no product secret ownership | no payload plaintext path |

### 3.3 Local-first exclusions and promotion rule

This row must restate that the following remain local-first unless a later D4
complete feature explicitly promotes them:

- window layout and native window/runtime state;
- clipboard contents and history;
- current selection, drag state, and interaction-local UI state;
- cache indexes, service-worker caches, and runtime optimization state;
- local path, bookmark, or sandbox-permission details that are not explicitly
  approved as sync-safe metadata.

The contract should make "local-first unless promoted" a first-class rule, not
an implementation note.

### 3.4 Offline and outbox behavior

The boundary contract should define, at a storage-contract level:

- what can be written while offline on Web and Desktop;
- which local stores own pending account-sync mutations before row #5 adds the
  exact push/pull protocol surface;
- how `device-local` exclusions are prevented from entering the remote outbox;
- how repository drivers expose enough metadata for conflict/outbox handling
  later without leaking protocol details into plugins.

### 3.5 Store mapping precedes entity implementation

This row should explicitly gate later work:

- no account-sync entity implementation begins until its Web store mapping,
  Desktop store mapping, remote representation, local-only exclusions, and
  repository tests are written;
- row #5 may build protocol semantics on top of these mappings, but it must not
  fill a storage-boundary vacuum retroactively.

## 4. Recommended contract sections

The canonical contract should contain:

1. a storage-topology overview tying repository adapters to Web, Desktop, and
   remote stores;
2. a data-class-to-store matrix covering current authority entities, local-only
   runtime state, and deferred classes;
3. a plugin boundary section that freezes repository-only access and bans
   direct store or service-role access;
4. a remote representation section that limits the server to encrypted
   envelopes and metadata only;
5. an offline/outbox section that states how local-first writes and
   account-sync writes are separated before protocol details are layered in;
6. a contract-test section covering repository-driver behavior, syncScope
   enforcement, local-only exclusion proofs, and per-surface mapping tests;
7. explicit non-goals preserving ADR-0013 D4, `data-repository-v0`,
   `TECHNICAL_REQUIREMENTS`, and sync-v1 crypto authority.

## 5. Risks and open questions

| Risk / question | Treatment in this row |
|---|---|
| Future runtime code bypasses repository seams for convenience | Freeze a repository-only plugin rule and make direct store access a contract violation. |
| `organizer.item` local path or bookmark details leak into remote sync | Require an explicit local-only vs sync-safe field split and keep raw path/permission state local-first by default. |
| Browser local preferences and indexes get confused with account data | Separate repository data from browser-safe prefs, cache indexes, and session/runtime optimization state. |
| Desktop secure seams drift into plugin-visible APIs | Keep SQLCipher, Keychain, and Tauri/Rust crypto handles below the repository boundary. |
| Row #5 quietly rewrites storage mapping while adding protocol semantics | Make store mapping an explicit prerequisite and keep row #5 focused on protocol surfaces only. |
| Admin or Workflow reads start depending on payload-local stores | Restrict those surfaces to derived metadata and repository-truth snapshots, never payload plaintext or local store ownership. |

## 6. Acceptance mapping

| Acceptance signal | Covered by |
|---|---|
| Local-first boundary document maps entity classes to Web store, Desktop store, plugin API, remote representation, and offline behavior | Recommended contract sections 1 through 5 |
| Plugins depend only on repository interfaces | Boundary decision 3.1 and recommended contract section 3 |
| Web uses IndexedDB/WebCrypto-friendly storage and Desktop uses SQLite/SQLCipher plus Keychain-backed seams | Boundary decision 3.2 and recommended contract sections 1 and 2 |
| Remote stores only encrypted envelopes and metadata | Boundary decision 3.2 and recommended contract section 4 |
| Runtime-only state remains local-first unless later D4 promotion occurs | Boundary decision 3.3 and recommended contract section 2 |
| Store mapping is written before any account-sync entity is implemented | Boundary decision 3.5 |
| Plan identifies required contract tests for repository drivers and syncScope enforcement | Recommended contract section 6 |

## 7. Review recommendation

APPROVE a single docs-only build phase that:

- adds `docs/contracts/account-sync-local-first-boundaries.md`;
- registers it in `docs/contracts/README.md` if missing;
- records the store-mapping-before-entity rule and repository-only plugin
  boundary;
- advances `docs/reviews/account-sync-local-first-boundaries/dev_log.md` to
  `READY_FOR_VERIFY`.

The build must not touch runtime sync-v1 code, redefine `RepoRecord`,
`syncScope`, or crypto, or promote runtime-only state into remote sync by
implication.
