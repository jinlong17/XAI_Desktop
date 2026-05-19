# sync-engine-pull Design

## Scope

Feature #27 implements the client PULL path seam in `@repo/plugin-account`.
It does not implement server `/sync/pull`, decryption, or entity-specific
table adapters.

## Flow

1. `pullBatch()` calls the injected transport with one global
   `sinceCommitSeq` cursor and a limit.
2. HTTP transport maps that to `GET /sync/pull?since_commit_seq=&limit=`.
   It never sends `entity_type`.
3. `applyServerRecords()` verifies
   `currentAccountCommitSeq >= lastSeenAccountCommitSeq`; otherwise it throws
   `SyncAccountRollbackError` with code `E3024`.
4. Each PullRecord carries `entityType` and is routed through the injected
   `PullRecordApplier`.
5. Local `EntityState` tracks `maxSeenRevision`, `lastBlobHash`,
   `lastCommitSeq`, and `lastKeyId`.

## H-6 Classification

- `revision > maxSeenRevision`: apply and advance state.
- `revision == maxSeenRevision && blobHash == lastBlobHash`: idempotent
  duplicate; ignore.
- `revision == maxSeenRevision && keyId changed && commitSeq > lastCommitSeq`:
  legit re-encrypt; apply and update state.
- `revision < maxSeenRevision`, or same revision with changed blob and older
  commit sequence: true rollback; throw `SyncRevisionRollbackError` code
  `E3015`.

Other ambiguous same-revision changed-blob cases are rejected as E3015 rather
than silently accepted.
