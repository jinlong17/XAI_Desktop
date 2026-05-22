# Roadmap Seed — web-encrypted-indexeddb-cache

> web-ticktick-parity roadmap · feature #9 · wave W5 · local encrypted cache
> Source PRD: docs/planning/sub-prds/web/PRD.md §5.2.2, §5.6, §8.2 · dev-plan Week 2/4
> Status hint: PENDING

## Requirement

Implement the Web local data layer: `entity_blobs`, non-sensitive `entity_index`, encrypted `entity_sort_keys`, `pending_mutations`, `dead_letter_mutations`, `sync_state` cursor/sentinel, quota handling, and memory-only FTS worker rebuild/wipe.

## Hard constraints

- IndexedDB must not persist plaintext user content, plaintext sort keys, or FTS text.
- Lock/idle must wipe decrypted in-memory indexes and terminate or clear the FTS worker.
- Safari/private-mode and sentinel-missing recovery paths must be tested with local/fake IndexedDB and browser E2E where possible.

## Acceptance signal

Local tests can prove IndexedDB contains only ciphertext or non-sensitive metadata, FTS rebuilds from encrypted blobs after unlock, and storage eviction triggers safe rehydrate.

## Dependencies (advisory — manifest is authoritative)

Depends On: web-browser-e2e-crypto-runtime, web-sync-blob-driver.
