# desktop-local-first-repository-bridge - API

## Scope

This row defines repository bridge contracts for the active desktop-facing entity surfaces only. It does not define browser migration/import, sync queueing, reconnect, or backup contracts.

## Upstream Interfaces

| Surface | Role |
|---|---|
| `docs/adr/0012-phase3-local-first-storage.md` | storage authority and deferral boundaries |
| `packages/core-data/src/types.ts` | canonical `Repo<T>`, `RepoRecord`, `RepoMetadata`, `SyncScope`, migration contracts |
| `packages/core-data/src/desktop.ts` | desktop-only repo export seam from the shipped foundation row |
| `packages/core/src/utils/runtime-profile.ts` | desktop runtime activation discriminator |
| `packages/core/src/types/events.ts` | typed event names and payload contracts shared across browser/desktop |

## Downstream Consumers

| Consumer | Expected use |
|---|---|
| active web entity packages | desktop runtime repo bridging while preserving browser behavior |
| `desktop-local-first-web-data-migration` | explicit import into the bridged repo surfaces |
| `desktop-local-first-offline-edit-queue` | durable mutation staging on the same bridged entities |
| `desktop-local-first-sync-reconnect` | reconnect/replay over the same repo-backed records |
| `desktop-local-first-backup-export-import` | export/import against the canonical bridged records, not browser-only fallbacks |

## Surface Inventory To Bridge

| Surface | Current browser contract | Expected repo side |
|---|---|---|
| Tasks | `xai_task_cols` | canonical task repo records under the productivity namespace |
| Habits | `xai_habits_state` | canonical habit repo records under the productivity namespace |
| Pomodoro | `xai_pomodoro_sessions` | new canonical pomodoro repo record family |
| Board/workspaces | `xai_boards_v2`, `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, `xai_board_view_by_id` | normalized project board/card repo records plus typed device-local workspace auxiliary records for active board, panels, inbox, and per-board view selection |
| Pet basic state | `xai_pet_id`, `xai_pet_pos` | new canonical pet repo record family for persisted basic state |
| Local settings | `PREF_REGISTRY` keys + `xai_pref_*` family | typed device-local settings repo records with one record per storage key (`id === storage key`) |
| Notes | no canonical shipped browser contract | explicit unsupported result in this row |

## Frozen Record-Shape Rules

### Board/workspace auxiliary state

- `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, and `xai_board_view_by_id` are in scope for row `#11`.
- They must not remain browser-only once the desktop bridge is enabled.
- They must live as typed device-local repo records separate from canonical `project.board` and `project.card` records.
- The bridge should keep one persisted browser slot mapped to one typed auxiliary record shape so row `#12` import and browser fallback remain deterministic.

### Settings

- Canonical settings repo shape is one record per browser storage key.
- Record `id` equals the exact `PREF_REGISTRY` or `xai_pref_*` key name.
- The decoded value shape continues to be defined by `@repo/plugin-web-storage` codecs and registry defaults.
- Grouped per-pane or per-domain blobs are out of contract for this row.

## Desktop Bridge Activation Contract

Desktop bridge behavior may activate only when both conditions hold:

1. runtime profile resolves to `desktop-phase1-offline`
2. the shipped desktop repo seam is available and bootstrapped

Browser runtime stays browser-only.

## Read / Write Semantics

### Read semantics

- supported surfaces:
  - read repo data first when the repo contains valid records
  - fall back to current browser storage when repo is empty or unavailable
  - fall back to safe empty state when both sources are absent or unreadable
- unsupported notes:
  - no repo read path in this row
  - browser behavior, if any, remains untouched

### Write semantics

- supported desktop surfaces:
  - dual-write browser-visible state plus repo state
  - repo failure must remain visible; do not pretend the desktop repo write succeeded
- browser runtime:
  - keep current browser storage write behavior
- notes:
  - explicit unsupported/no-op result

## Contract Gaps That Build Must Resolve

1. `project.board` vs `project.project` canonical entity naming
2. missing canonical repo entities for pomodoro
3. missing canonical repo entities for pet basic state
4. missing canonical repo entities for local settings
5. missing canonical repo entities for board workspace auxiliary state
6. explicit unsupported status for notes

## Error Semantics

The build should keep the native foundation error codes (`E1300` / `E1301` / `E1302`) intact underneath and expose bridge-level behavior with a small typed union:

| Kind | Meaning | Expected handling |
|---|---|---|
| `unsupported_surface` | no canonical bridge contract exists for the requested surface in this row | return explicit unsupported state; do not fake repo success |
| `contract_mismatch` | canonical entity shape or entity type does not match the shared repo contract | fail fast in desktop runtime; requires code fix, not silent fallback |
| `repo_unavailable` | desktop repo seam cannot be opened or injected | read may fall back to browser state; write must stay visibly degraded |
| `write_failed` | repo write failed after a browser-visible change path was attempted | keep failure observable for later queue/sync rows; do not label the entity synced |

## Permission and Boundary Notes

- only the desktop host may inject the repo invoke seam and mount bridge wiring
- business packages own entity serialization, mapping, and fallback logic
- do not import another package's internals to access storage or serializers
- typed event declarations, when needed, must live in `packages/core/src/types/events.ts`

## Idempotency Notes

- repeated desktop bridge bootstrap must not duplicate records
- empty-repo browser fallback reads must be side-effect free
- any repo seeding performed by a supported desktop write path must be idempotent by record id or settings key
- board auxiliary records and settings records must be idempotent at the individual storage-slot level, not only at a grouped document level
- row `#11` must not perform a one-shot background import pass from browser storage
