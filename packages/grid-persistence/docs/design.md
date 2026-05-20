# grid-persistence — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Safe prep only; production persistence blocked |
| Review Doc Path | docs/reviews/grid-persistence/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | G1/G2 repository planning |

## Current Shape

- Organizer stores `PersistedLayout` directly in `localStorage`.
- Layout save is debounced and in-memory state is the source of truth while the app runs.
- There is a manual `clearAll()` reset path.

## Target Shape

- Organizer reads/writes Grid layout through a repository interface.
- Startup can restore all open Grids or the last active Grid through G1.1 commands.
- LocalStorage migration is read-only, idempotent, and never deletes source data on failure.
- Corrupt repository state does not blank the app; Control can reset.

## Frozen Assumptions

- Do not add plugin-specific repository methods before G2 Repository v0 is reviewed.
- Do not restore native windows before G1.1 lifecycle commands are stable.
- Keep the existing localStorage path intact until migration is explicitly implemented.
