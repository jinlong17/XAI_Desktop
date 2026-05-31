# Discovery Review - account-sync-protocol-surface-contract

| Field | Value |
|---|---|
| Feature | account-sync-protocol-surface-contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #5 |
| Module | `sync` |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |
| Date | 2026-05-31 |

## 1. Source fidelity

The source requirement asks for a docs-only contract that connects repository
mutations to the existing sync-v1 protocol surface without changing the
underlying cryptography.

Required coverage:

- repository mutation to local outbox ownership;
- `/sync/push` and `/sync/pull` sequencing;
- encrypted-blob and metadata boundaries;
- retry, dead-letter, and manual sync behavior;
- deterministic conflict routing and sync cadence.

Grounded constraints:

- `docs/contracts/account-cloud-sync-architecture.md` already assigns push,
  pull, outbox, conflict, nonce, and encrypted-blob ownership to the `sync`
  product module and keeps Web/App on a hub-and-spoke topology through account
  cloud.
- `docs/contracts/account-sync-entity-scope-matrix.md` already freezes which
  entity classes are `account-sync`, `device-local`, mixed, or deferred.
- `docs/contracts/account-device-identity-contract.md` already freezes
  account/device/session identity, active-device checks, and device-bound
  request seams.
- `docs/contracts/account-sync-local-first-boundaries.md` already freezes local
  repository ownership, repository-only plugin access, remote encrypted-envelope
  limits, and the rule that store mapping must exist before protocol semantics
  are layered on top.
- `docs/contracts/data-repository-v0.md` already owns `RepoRecord`,
  `syncScope`, and the rule that `device-local` records never enter the remote
  outbox.
- `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md`
  already own AES-256-GCM, deterministic CBOR AAD, nonce lease, mutation
  idempotency, global account `commit_seq`, `conflict_shadow`, device-active
  RLS, and client-read-only `encrypted_blobs`.
- Runtime sync-v1 implementation remains paused, so this row must stay
  docs/contracts only.

## 2. Canonical naming and output shape

Canonical feature name: `account-sync-protocol-surface-contract`.

Title: Account Sync protocol surface contract.

Naming rationale:

- the roadmap row and seed brief already identify this slice as the contract
  that binds repository writes to push/pull/outbox/conflict behavior;
- the scope is narrower than surface adapters or admin read models and should
  not absorb store-boundary work already handled by row #4;
- the slug stays centered on shared protocol semantics rather than runtime
  implementation.

Selected shape: one canonical contract under `docs/contracts/` plus review
artifacts under `docs/reviews/account-sync-protocol-surface-contract/`.

Reasoning:

- the required output is a cross-surface engineering contract, not a plugin-
  local document;
- later Web/App/Admin/Workflow rows need one stable sequence-level authority to
  cite for outbox, pull/apply, conflict routing, manual sync, and cadence;
- the user explicitly asked for docs/contracts only, so a shared contract plus
  workflow review artifacts is the correct shape.

Rejected shapes:

- runtime implementation or unpausing `sync-v1`: rejected because this row is a
  protocol-surface contract only;
- rewriting `data-repository-v0`: rejected because repository ownership and
  `syncScope` are already frozen there;
- absorbing row #4 store-mapping work: rejected because row #4 already made
  store ownership a prerequisite and this row must build on that baseline
  instead of reopening it;
- redefining sync-v1 wire fields or cryptography: rejected because those remain
  owned by `TECHNICAL_REQUIREMENTS` and `sync-v1`.

## 3. Decisions to freeze

### 3.1 Local write first, cloud acknowledgment second

The protocol surface must preserve local-first correctness:

- repository drivers apply local writes first;
- `account-sync` writes create pending outbox work owned by the local sync seam;
- `device-local` writes never create remote work;
- plugins do not talk to `/sync/push` or `/sync/pull` directly.

### 3.2 One explicit outcome per pushed mutation

This row should freeze the rule that every pushed mutation receives an explicit
outcome classification that the client can map back to the local outbox item:

- accepted;
- duplicate/idempotent replay;
- conflict;
- retryable failure;
- terminal/manual-repair failure.

This keeps batching a transport optimization rather than a semantic ambiguity.

### 3.3 Pull/apply remains account-cursor ordered

The canonical contract should state that:

- `/sync/pull` is the authoritative remote-to-local catch-up path;
- pulled records are applied in global account `commit_seq` order;
- duplicate or re-encrypt-only cases are classified explicitly;
- cursor advancement happens only after durable local apply.

This matches the existing sync-v1 authority without redefining the pull wire
shape.

### 3.4 Conflict handling is deterministic and never silent

This row must convert the seed constraint into a first-class rule:

- stale-base or divergent writes route to explicit conflict handling;
- loser metadata remains recoverable through `conflict_shadow` plus local
  conflict state;
- no silent last-write-wins in push or pull paths;
- auth/device failures are surfaced as remediation states, not mislabeled as
  merge conflicts.

### 3.5 Retry, dead-letter, and manual sync are part of the contract

The canonical contract should classify:

- transient retry paths with bounded backoff;
- account/device remediation paths where blind replay must stop;
- deterministic conflict cases that require explicit follow-up before replay;
- dead-letter as a local/operator diagnostic state, not a server plaintext
  payload store;
- manual sync as an immediate trigger that still obeys all existing auth,
  conflict, and idempotency rules.

### 3.6 Cadence is near-real-time eventual, not realtime-only

The protocol surface should freeze the trigger matrix named in the requirement:

- post-write push;
- startup pull;
- focus pull;
- network-recover replay;
- 15-60 second light pull;
- manual sync.

Realtime notifications may accelerate pull timing, but correctness must not
depend on realtime being available.

## 4. Recommended contract sections

The canonical contract should contain:

1. normative invariants tying this row back to ADR-0013 D4, repository
   authority, local-first boundaries, device identity, and sync-v1 crypto;
2. a protocol-surface object model that defines repository mutation, outbox
   item, push result, pull record, conflict artifact, dead-letter artifact, and
   manual sync action;
3. a write-to-push section that freezes local enqueue, push promotion, and
   accept-path semantics;
4. a pull/apply section that freezes account-cursor ordering and deterministic
   apply;
5. a conflict-routing section that forbids silent last-write-wins and requires
   explicit routing outcomes;
6. a retry/dead-letter/manual-sync section that names the distinct recovery
   classes;
7. a cadence matrix that proves sync is near-real-time eventual;
8. a verification gate section for later runtime rows.

## 5. Risks and open questions

| Risk / question | Treatment in this row |
|---|---|
| Row #5 reopens row #4 store-ownership decisions | Keep store mapping as a prerequisite and cite row #4 rather than restating ownership in a conflicting way. |
| A docs contract invents new sync-v1 wire fields by accident | Phrase this row at the sequence and responsibility level; keep crypto and field ownership with `TECHNICAL_REQUIREMENTS` and `sync-v1`. |
| Conflict handling is described too loosely and later degrades into LWW | Freeze explicit outcome classes and require local plus `conflict_shadow` metadata for deterministic routing. |
| Retry and dead-letter get treated as implementation details and omitted from UX/control-plane later | Make them first-class contract objects and verification gates. |
| Realtime gets overclaimed as the only convergence path | State that realtime is optional acceleration and that cadence still requires startup/focus/light-pull/manual paths. |
| `organizer.item` field split gets silently decided here | Preserve row #4 authority that only already-approved sync-safe subsets may enter the outbox. |

## 6. Acceptance mapping

| Acceptance signal | Covered by |
|---|---|
| Sequence-level contract covers write, push, accept/conflict, pull, apply, retry, dead-letter, and manual sync | Recommended contract sections 2 through 7 |
| Sync-v1 invariants are preserved and not redefined | Source fidelity section plus recommended contract section 1 |
| Conflict handling is explicit and deterministic | Decision 3.4 and recommended contract section 5 |
| Cadence includes post-write, startup, focus, network recover, 15-60 second pull, and manual sync | Decision 3.6 and recommended contract section 7 |
| Plugins remain repository-only and `device-local` data stays out of outbox | Decision 3.1 plus row #4 and `data-repository-v0` authority |
| Later runtime rows know what evidence they must produce | Recommended contract section 8 |

## 7. Review recommendation

APPROVE a single docs-only build phase that:

- adds `docs/contracts/account-sync-protocol-surface-contract.md`;
- registers it in `docs/contracts/README.md`;
- records the explicit sequence contract for write -> outbox -> push ->
  accept/conflict -> pull -> apply -> retry/dead-letter/manual sync;
- leaves runtime sync-v1 paused and all cryptographic/wire-format authorities
  unchanged.

The build must not touch runtime code, redefine `RepoRecord` or `syncScope`,
invent new sync-v1 crypto semantics, or backfill row #4 store mapping by
implication.
