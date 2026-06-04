# Account Sync Protocol Surface Contract

| Field | Value |
|---|---|
| Owner | `sync` product module |
| Status | Draft contract |
| Roadmap | `docs/workflow/roadmap/account-cloud-sync-foundation.md` row #5 |
| Applies to | Web, Mac Desktop, Desktop Plugin, Sync backend, Admin/Site/Workflow derived surfaces |
| Builds on | ADR-0013 D4, `docs/contracts/data-repository-v0.md`, `docs/contracts/account-cloud-sync-architecture.md`, `docs/contracts/account-sync-entity-scope-matrix.md`, `docs/contracts/account-device-identity-contract.md`, `docs/contracts/account-sync-local-first-boundaries.md`, `docs/TECHNICAL_REQUIREMENTS.md`, `docs/workflow/roadmap/sync-v1.md` |

## 1. Purpose

This contract freezes the protocol surface that connects repository mutations to
the existing account-cloud sync path.

It defines:

- how an `account-sync` repository mutation becomes a local outbox candidate;
- how local outbox items are promoted into `/sync/push` requests;
- how `/sync/pull` results are ordered, applied, and cursored back into local
  repositories;
- how conflicts, retries, dead-letter, and manual sync are surfaced without
  silent last-write-wins;
- which cadence triggers make sync near-real-time eventual rather than
  realtime-only.

This document does not redefine `RepoRecord`, `syncScope`, the encrypted
envelope schema, AES-256-GCM, deterministic CBOR AAD, nonce lease, mutation
idempotency, `commit_seq`, `conflict_shadow`, device-active RLS, or the paused
runtime ownership of `sync-v1`.

## 2. Normative scope and invariants

1. ADR-0013 D4 remains the topology rule: Web and App do not sync to each
   other; both sync through the shared account cloud layer.
2. `docs/contracts/data-repository-v0.md` remains the source of truth for
   `RepoRecord`, `entityType`, `schemaVersion`, repository semantics, and
   `syncScope`.
3. `docs/contracts/account-sync-local-first-boundaries.md` remains the source
   of truth for store ownership, repository-only plugin access, and what may or
   may not enter the remote path.
4. `docs/contracts/account-device-identity-contract.md` remains the source of
   truth for account/device/session identity, device registration, and
   device-active access checks.
5. `docs/TECHNICAL_REQUIREMENTS.md` and `docs/workflow/roadmap/sync-v1.md`
   remain the source of truth for the protocol and cryptographic invariants
   below:
   - AES-256-GCM encrypted envelopes with deterministic CBOR AAD;
   - server-backed nonce lease and nonce reuse prevention;
   - mutation idempotency via stable `mutation_id`;
   - one global account `commit_seq` cursor;
   - explicit loser metadata in `conflict_shadow`;
   - device-active RLS and device-bound request checks;
   - `encrypted_blobs` remaining client-read-only.
6. This row is docs/contracts only. It does not unpause runtime sync-v1 work or
   authorize a new protocol implementation branch by itself.

## 3. Protocol-surface objects

| Object | Authority | Required semantics | Must not do |
|---|---|---|---|
| Repository mutation | owning repository driver | A local write to an `account-sync` record produces one durable mutation candidate with entity identity, base revision context, and local apply result | Must not be emitted directly by plugins to `/sync/push` |
| Local outbox item | Web/Desktop repository + sync seam | Owns pending remote work for one mutation until acked, conflicted, quarantined, or dead-lettered | Must not contain `device-local` records or local-only fields |
| Push batch | local sync engine | Groups eligible outbox items for `/sync/push` using the existing encrypted-envelope and metadata rules | Must not invent new crypto, skip idempotency, or bypass device/account checks |
| Push result | sync backend + local sync engine | Returns explicit per-item accept, duplicate, conflict, retryable failure, or terminal failure outcome | Must not collapse divergent outcomes into a blind success/failure boolean |
| Pull record | sync backend | Delivers ordered account-level changes by `commit_seq`, preserving revision and encrypted-envelope metadata | Must not expose plaintext payloads or a second ordering authority |
| Apply result | local repository + sync seam | Classifies each pulled record as applied, duplicate/idempotent, re-encrypt-only, conflict, or rollback/error | Must not silently overwrite newer local state |
| Conflict artifact | local conflict queue plus server `conflict_shadow` metadata | Carries enough metadata to route explicit merge, rebase, or discard work deterministically | Must not degrade into silent last-write-wins |
| Dead-letter artifact | local diagnostics/operator surface | Preserves failed mutation metadata, retry history, and recovery action | Must not become a server plaintext payload bucket |
| Manual sync action | user- or operator-triggered local command | Forces an immediate pull and any eligible push replay under the same invariants as automatic sync | Must not bypass conflict, auth, or device-active checks |

## 4. Write to push contract

### 4.1 Local write and enqueue

1. Plugins submit intent through repository APIs only.
2. The repository driver applies the local write first, subject to normal local
   transaction and validation rules.
3. If the record is `account-sync`, the same logical write must also create or
   update one pending outbox item owned by the local sync seam.
4. If the record is `device-local`, no outbox item may be created.
5. Mixed entities such as `organizer.item` may enqueue only the sync-safe
   subset already allowed by the local-first boundary contract.

Required outcome: a successful local write leaves the user in a correct
local-first state even before the cloud accepts the mutation.

### 4.2 Push promotion

When the local sync seam promotes outbox items into `/sync/push`:

1. it reuses the existing encryption and AAD authorities rather than defining a
   new payload format;
2. it preserves one stable `mutation_id` per logical mutation across retries;
3. it preserves the local base-revision context needed for deterministic server
   accept or conflict classification;
4. it sends device-bound auth and device identity through the canonical
   account/device seam;
5. it treats batched push as a transport optimization, not a semantic change.

The contract does not require a specific HTTP response shape beyond one rule:
every pushed mutation must receive an explicit outcome classification that the
client can map back to the originating outbox item.

### 4.3 Server accept path

The authoritative accept path preserves existing sync-v1 rules:

- device-active auth and RLS checks pass;
- the request is idempotent by `mutation_id`;
- nonce lease and encrypted-envelope validation succeed;
- conditional write and revision rules succeed;
- the accepted write receives the next global account `commit_seq`;
- the accepted encrypted envelope becomes readable through the client-read-only
  `encrypted_blobs` path.

An accepted mutation clears or marks complete the originating local outbox item.

## 5. Pull and apply contract

### 5.1 Pull entry

`/sync/pull` is the authoritative remote-to-local catch-up path.

The caller provides:

- account and active device context;
- the last durable account-level cursor based on global `commit_seq`;
- any other existing sync-v1 pull metadata already required by the protocol.

The server returns ordered records plus explicit metadata that lets the client
distinguish:

- a new remote write to apply;
- an idempotent duplicate of already applied state;
- a legitimate re-encrypt or metadata-only change;
- a rollback or invariant violation that must raise an error.

### 5.2 Apply semantics

Local apply must be deterministic:

1. pulled records are processed in authoritative `commit_seq` order;
2. repository writes remain repository-owned, not plugin-owned;
3. duplicate/idempotent records do not create duplicate local mutations;
4. re-encrypt-only or metadata-only remote changes do not masquerade as user
   content edits;
5. cursor advancement happens only after the local surface has durably recorded
   the apply result.

Required outcome: two healthy devices that pull the same committed remote stream
converge to the same repository state, modulo explicitly surfaced conflicts or
device-local exclusions.

## 6. Conflict routing contract

Conflict handling must be explicit and deterministic. Silent last-write-wins is
forbidden.

| Situation | Required routing |
|---|---|
| Duplicate replay of the same accepted mutation | Treat as idempotent success and clear the local outbox item without creating a conflict |
| Competing write against a stale base revision | Return an explicit conflict outcome, preserve loser metadata in `conflict_shadow`, and keep enough local metadata to drive merge or rebase |
| Pull-time divergence between local state and ordered remote stream | Route into explicit conflict handling or rollback classification; do not silently overwrite |
| Auth/device revocation or unknown-device rejection | Classify as device/account remediation, not as a merge conflict |
| Schema/validation mismatch that cannot be auto-replayed safely | Block automatic replay and route to dead-letter or manual repair |

Minimum conflict artifact requirements:

- entity identity and owning surface;
- local mutation identity and retry count;
- authoritative remote revision / `commit_seq` context;
- local/remote timestamps or ordering metadata when available;
- next action classification: merge, rebase, discard, re-auth, or manual repair.

The contract does not require a final conflict UI in this row. It requires a
stable routing outcome that later surfaces can render consistently.

## 7. Retry, dead-letter, and manual sync

### 7.1 Retry classes

| Failure class | Required behavior |
|---|---|
| Transient network, connectivity, 5xx, lease-unavailable, or rate-limited failure | Keep the outbox item pending, preserve `mutation_id`, and retry with bounded backoff and jitter |
| Unknown device, revoked device, expired session, or quarantine state | Stop automatic replay, surface account/device remediation, and avoid burning retry budget blindly |
| Deterministic conflict | Move into explicit conflict routing; do not auto-retry until a new local mutation is produced |
| Repeated terminal validation/serialization mismatch | Move to dead-letter after bounded attempts and require manual repair or upgrade |

### 7.2 Dead-letter contract

Dead-letter is a local/operator diagnostic state for mutations that automatic
replay should no longer attempt.

A dead-letter record must preserve:

- entity identity and mutation identity;
- failure class and last error code;
- retry history and last attempt time;
- the required recovery action;
- enough metadata to correlate with local and remote audit streams.

Dead-letter must not create a second server-side plaintext payload store.

### 7.3 Manual sync contract

Manual sync is a first-class trigger, not a privileged bypass.

When a user or operator invokes manual sync:

1. an immediate pull is allowed;
2. eligible pending outbox work may be replayed immediately;
3. existing auth, device-active, idempotency, conflict, and nonce rules still
   apply;
4. the surface must expose a concrete result such as success, retry scheduled,
   conflict pending, or account/device remediation required.

## 8. Sync cadence and trigger matrix

Account Cloud Sync is near-real-time eventual. Realtime subscription may
accelerate convergence, but it is not the only correctness path.

| Trigger | Required contract |
|---|---|
| Post-write push | An accepted local `account-sync` write should schedule an immediate or near-immediate eligible push attempt |
| Start pull | App/web startup or session restore should perform an early pull to hydrate from the authoritative account stream |
| Focus pull | Returning a surface to foreground should run a lightweight catch-up pull before claiming sync is current |
| Network-recover replay | Connectivity recovery should replay pending eligible outbox work and follow with a pull |
| Light pull cadence | While signed in and healthy, each active surface should perform a lightweight pull on a 15-60 second interval |
| Manual sync | User/operator can request an immediate pull plus eligible push replay |
| Realtime notification | If available, treat as a prompt to pull sooner; it does not remove the need for the other triggers |

Required product claim: "near-real-time eventual sync." Forbidden product claim:
"realtime-only sync."

## 9. Surface responsibility matrix

| Surface | Required responsibility | Must not do |
|---|---|---|
| Web | Own browser-local outbox, push scheduling, pull/apply, sync state, and explicit conflict/manual-sync affordances through repository and account seams | Must not bypass repository APIs, bypass device auth, or claim direct Web-to-App sync |
| Mac Desktop | Own native/local outbox, push scheduling, pull/apply, offline replay, and native sync controls through repository and secure account seams | Must not leak Keychain/crypto handles to plugins or push `device-local` state |
| Desktop Plugin | Produce repository mutations and consume sync/conflict status through public contracts only | Must not implement its own push/pull transport or private conflict protocol |
| Sync backend | Enforce auth/device-active rules, idempotency, ordering, conflict capture, and encrypted-envelope-only storage | Must not expose plaintext payloads or invent a second account ordering system |
| Admin/Site/Workflow projections | Read derived sync health, failure counts, and conflict/readiness metadata only as allowed by their module rules | Must not become payload authorities or mutate user repository state by convenience |

## 10. Required verification gates for later runtime rows

Any later implementation row that claims to satisfy this contract must prove all
of the following:

- local repository writes and outbox ownership stay coupled for `account-sync`
  records;
- `device-local` records and local-only fields never enter the remote outbox;
- `/sync/push` preserves the existing crypto, nonce, idempotency, and
  device-active invariants;
- `/sync/pull` uses global account `commit_seq` ordering and deterministic local
  apply;
- conflicts always produce explicit routing and no silent last-write-wins;
- retry policy distinguishes transient, conflict, account/device, and terminal
  failure classes;
- dead-letter stays metadata-oriented and does not create plaintext payload
  storage;
- cadence triggers cover post-write push, startup pull, focus pull,
  network-recover replay, 15-60 second light pull, and manual sync;
- product surfaces expose enough sync state for users/operators to distinguish
  healthy, retrying, conflicted, and blocked-device states.

## 11. Non-goals

- No runtime sync-v1 unpause.
- No redefinition of `RepoRecord`, `syncScope`, encrypted envelope fields, or
  sync-v1 cryptography.
- No new conflict UI implementation.
- No direct Web-to-App sync path.
- No promotion of `device-local` state into remote sync by implication.
- No admin or workflow authority over user payload ordering or merge semantics.
