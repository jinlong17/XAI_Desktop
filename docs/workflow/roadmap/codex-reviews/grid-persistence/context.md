Feature ID: G1.5 / grid-persistence
Branch: codex/track-a-desktop-foundation
Commit under review: 91dc6b6 (feat(grid-persistence): LayoutStore seam with whiteout-safe hydrate)

Files added or changed:
- packages/plugin-organizer/src/layoutStore.ts (new) — LayoutStore interface, localStorageLayoutStore, repositoryLayoutStore
- packages/plugin-organizer/src/layoutStore.test.ts (new) — 9 vitest cases
- packages/plugin-organizer/src/index.ts — re-export
- packages/plugin-organizer/src/useGridSystem.tsx — accept `store?: LayoutStore`, async hydrate, delegate save+clearAll
- packages/plugin-organizer/package.json — adds @repo/core-data workspace dep
- packages/grid-persistence/docs/dev_log.md → READY_TO_SHIP
- docs/workflow/roadmap/xai-g1-native-foundation.md row #5 → READY_TO_SHIP

Intended scope:
- Production persistence seam decouples plugin-organizer from a hard-coded
  localStorage path.
- `localStorageLayoutStore()` (default; sync historical path) and
  `repositoryLayoutStore(gridRepo, itemRepo)` (G2.1 entity-backed) both swallow
  load/save errors via onLoadError/onSaveError so corrupted state cannot whiteout
  the desktop.
- Async hydrate with try/catch fallback to empty state.
- Host UI integration / actual swap to repositoryLayoutStore is parked under
  follow-up.

Cross-vendor checklist:
1. Whiteout-safety: a malformed localStorage payload returning `null` → empty
   layout. But what about a localStorage payload that PARSES but is missing
   `grids` or `items` arrays? The `isPersistedLayout` guard rejects to null but
   the test uses `{ grids: "oops" }` — confirm a missing-`items`-array case is
   covered too.
2. Repository adapter `repositoryLayoutStore.save()` upserts then culls by
   diffing the previous list. Is this transactionally safe — if the upsert
   succeeds but the cull throws, do we leave stale rows? Should this be wrapped
   in `gridRepo.transaction(...)` and `itemRepo.transaction(...)` both?
3. `entityToDesktopItem` collapses `kind: "url"` back to `"file"` for the
   DesktopItem (legacy shape). Does that silently lose URL items if the host
   later writes them back? This is a one-way lossy mapping.
4. `repositoryLayoutStore.load()` returns `{ grids: [], items: [] }` for an
   empty repo (not null). But the hook then sets `hydrated=true` and any new
   user state will be saved — overwriting any localStorage fallback that might
   still exist. Is that desired or a regression vs. progressive migration?
5. Concurrency: hydrate is async with `cancelled` guard. But the save effect
   uses `setTimeout(...)` debouncer; if hydrate completes after a user action
   sets state, can we overwrite user state with the hydrated payload? The
   `hydrated` flag protects this — confirm the dependency array is correct.
6. Workspace dep addition: `@repo/core-data` workspace dep was added; does it
   create a circular dep with `@repo/core` indirectly?
7. Test coverage: 9 vitest cases. Missing: storage write quota during save
   debouncer fire, repositoryLayoutStore save failure path, repo `transaction`
   rollback.
