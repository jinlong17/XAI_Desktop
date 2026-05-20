# Discovery Review — grid-persistence

## Summary

G1.5 cannot start production implementation because it depends on G1.1 window command stability and G2 repository direction. Current Organizer state is persisted directly in `localStorage` under `xai-desktop-layout`, using `PersistedLayout { grids, items }`. This is sufficient for G0/G1 spike continuity but does not meet the long-term rule that plugins use repository interfaces instead of direct storage.

## Current State

| Area | Current behavior | Evidence |
|---|---|---|
| Storage key | `xai-desktop-layout` | `packages/plugin-organizer/src/useGridSystem.tsx` |
| Shape | `{ grids: GridBox[]; items: DesktopItem[] }` | `packages/plugin-organizer/src/types.ts`, `packages/core/src/types/grid.ts` |
| Hydration | JSON parse from `localStorage`; corrupt JSON returns null | `loadLayout()` |
| Save | Debounced 1000 ms `localStorage.setItem` | `saveLayout()` effect |
| Clear | Removes storage key and clears in-memory grids/items | `clearAll()` |
| Repository baseline | G2 owns Repository v0 and localStorage migration | `docs/contracts/data-repository-v0.md`, `G2-data-security-foundation.md` |

## Gaps

- No repository abstraction in Organizer for Grid layout.
- No open-window/last-active restoration contract.
- Corrupt state falls back silently but does not surface reset/recovery telemetry.
- No migration plan from `xai-desktop-layout` to repository-backed storage.
- No SQLCipher/SQLite decision at the plugin boundary yet.

## Recommendation

Do safe prep only. Later production implementation should:

1. Wait for G1.1 command lifecycle types so restored windows can be created through stable commands.
2. Wait for G2 Repository v0 to define plugin storage access.
3. Add an Organizer repository adapter for Grid layout and item placement.
4. Keep localStorage migration read-only and idempotent.
5. Preserve a user-visible reset path for corrupt state.

## Blocker

G1.1 and G2 repository contract are not ready. Implementing now would either extend direct `localStorage` usage or invent a repository shape ahead of the authoritative G2 contract.
