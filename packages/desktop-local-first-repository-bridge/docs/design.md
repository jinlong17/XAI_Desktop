# desktop-local-first-repository-bridge - Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A - active-surface-first desktop bridge: package-owned desktop adapters for the current `apps/web` modules, mounted by host only in desktop runtime, with repo-first read + browser fallback + dual-write semantics for supported surfaces. Board auxiliary state is included as typed device-local repo records in this row, and settings use one repo record per browser storage key. |
| Review Doc Path | `docs/reviews/desktop-local-first-repository-bridge/20260529-discovery-review.md` |
| Review Date/Version | 2026-05-29 |
| Feature Type | P1 Phase 3 repository bridge row |
| Governing ADR | `docs/adr/0012-phase3-local-first-storage.md` |

## Frozen Assumptions

- The current desktop product surface is still the wrapped `apps/web` module graph under `desktop-phase1-offline`.
- The shipped SQLite foundation and `@repo/core-data` typed repo seam are authoritative.
- Business logic stays in package owners; the host may mount bridge wiring but may not own entity bridge logic.
- Browser runtime behavior must remain unchanged.
- Row `#11` does not perform browser data migration/import, offline edit queueing, reconnect sync, backup/export/import UX, or organizer/overlay restoration.
- Notes has no canonical active owner package today; this plan freezes notes as an explicit unsupported surface unless review changes that assumption.
- Board auxiliary state (`xai_active_board`, `xai_board_panels`, `xai_board_inbox`, `xai_board_view_by_id`) is not deferred; it is bridged in this row as typed device-local repo records kept separate from shared board/card domain records.
- Settings repo shape is one record per storage key, with `PREF_REGISTRY` remaining the canonical owner of codec/default/category metadata.

## Dependency Overview

- Shared generic contract owner:
  - `packages/core-data/`
- Active entity owners:
  - `packages/xai-web-tasks/`
  - `packages/xai-web-habits/`
  - `packages/plugin-web-pomodoro/`
  - `packages/plugin-web-board-workspaces/`
  - `packages/xai-web-pet/`
  - `packages/plugin-web-storage/`
- Host mount only:
  - `apps/web/src/providers/AppProviders.tsx`
- Supporting runtime and contract evidence:
  - `packages/core/src/utils/runtime-profile.ts`
  - `apps/web/src/routes/modules/shellRegistrations.tsx`
  - `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md`

## Boundary Decision

- Keep `packages/desktop-local-first-repository-bridge/` as the workflow/docs anchor only.
- Land runtime business logic in the owning active packages, not in `apps/web` and not in `packages/core/`.
- Limit `@repo/core-data` changes to typed repo contracts, entity declarations, and generic desktop repo helpers.
- Use the host only to inject/mount desktop bridge wiring for the wrapped web runtime.
- Do not route implementation primarily through `plugin-productivity`, `plugin-project`, `plugin-console`, or other non-primary desktop UI packages.

## Required Runtime Outcome

- Supported surfaces can participate in the desktop local-first repo without losing current browser storage semantics.
- Desktop runtime activation is explicit and gated by runtime profile plus repo availability.
- Read behavior is honest:
  - repo first when valid data exists
  - browser fallback when repo is empty/unavailable
  - safe empty state when neither source is usable
- Write behavior is honest:
  - supported surfaces dual-write in desktop runtime
  - unsupported notes return explicit unsupported behavior
- No row `#12` migration/import behavior leaks into this row.

## Frozen Record Shapes

- Project core data:
  - canonical board/card records stay under normalized project entity types in `@repo/core-data`
- Project workspace auxiliary data:
  - `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, and `xai_board_view_by_id` map to typed device-local repo records in the project workspace namespace
  - these records stay separate from board/card domain records so later queue/sync rows can keep collaboration data distinct from local workspace chrome
- Settings data:
  - one repo record per exact browser storage key in scope
  - record id equals the storage key name
  - registry metadata is not regrouped into pane/domain blobs

## Implementation Phases

### Phase 1 - Shared bridge contract normalization

- normalize canonical repo entity names
- add missing typed repo entities required for pomodoro, pet, settings, and board auxiliary state
- resolve `project.board` vs `project.project`
- freeze bridge status/error semantics

### Phase 2 - Productivity bridge group

- bridge tasks
- bridge habits
- bridge pomodoro
- preserve existing typed event emissions and browser behavior

### Phase 3 - Board and pet bridge group

- bridge board/workspaces state through stable board package exports
- include typed repo records for `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, and `xai_board_view_by_id`
- bridge pet basic state only
- preserve truthful empty/unreadable desktop fallback copy

### Phase 4 - Settings bridge and host mount

- bridge `PREF_REGISTRY` plus `xai_pref_*` as one record per key
- mount desktop bridge wiring from `AppProviders`
- keep settings panes as consumers only
- keep notes unsupported unless review re-scopes the row

### Phase 5 - Cross-stack verification gate

- run core-data, affected package, explicit browser-safety, web test/type/build, and desktop app-bundle gates
- audit for accidental migration/queue/reconnect/backup scope bleed
