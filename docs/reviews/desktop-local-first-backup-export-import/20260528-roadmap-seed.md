# Roadmap Seed - desktop-local-first-backup-export-import

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

Add local backup/export/import tools for desktop data, including restore verification and clear user-facing failure semantics.

## Hard constraints

- Use the storage ADR's backup-safe location and data-boundary decisions.
- Exports/imports must not bypass repository validation or corrupt sync-log state.
- Failure modes must be visible and recoverable; partial restores require explicit semantics.

## Acceptance signal

A user can export, import, and verify restore of representative local-first data, with tests or smoke evidence for corrupt, incompatible, and partial backup cases.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-local-first-repository-bridge` SHIPPED.
