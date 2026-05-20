# Roadmap Seed — sync-audit-conflict-ui

> sync-v1 roadmap · feature #49 · wave W6 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-34
> Status hint: PENDING

## Requirement
Console settings sync-status page showing logged-in account, last sync time, per-entity_type last_synced_at, the last 100 `sync_audit_log` entries, plus a conflict-shadow recovery UI: view the last 100 conflicts and recover a loser blob.

## Hard constraints
- Loser recovery: client rebuilds the canonical CBOR AAD from the shadow row's full AAD context (key_id / encryption_device_id / counter / revision / deleted_flag / schema_version / blob_size / mutation_id / loser_commit_seq) → decrypts loser → user picks which copy → writes new revision via PUSH; 30-day GC (FR-SY-71 / C-H).
- Audit log records every 409 conditional-write rejection; Console shows last 100 conflicts + loser shadow (FR-SY-26 / FR-SY-43).
- Code boundary: Console sync-status page in `packages/plugin-account/src/components/ConsoleView`; AAD rebuild/decrypt via Rust KeyVault commands (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T9 (stale device returns) — conflict shadow prevents silent loss; loser must remain recoverable.
- PRD §11 R-10.20 (conflict shadow AAD rebuild failure → loser unrecoverable, C-H) — shadow stores full AAD context for rebuild.

## Acceptance signal
The Console page lists last 100 audit entries + conflicts; selecting a loser shadow successfully rebuilds AAD, decrypts the loser blob, and lets the user restore it as a new revision (PRD §10.2 loser-recoverable assertion).

## Dependencies (advisory — manifest is authoritative)
Depends On: all-entity-types-wiring, audit-log-integrity.
