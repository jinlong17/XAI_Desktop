## Codex Cross-vendor Review

**Feature**: grid-persistence
**Commit(s)**: 91dc6b6
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- `LayoutStore` is a clean seam: default `localStorageLayoutStore()` preserves existing behavior while exposing a repository-backed path without touching Host runtime yet.
- Whiteout-safety is materially improved: both adapters swallow `load`/`save` failures, and `GridSystemProvider` keeps a defense-in-depth startup fallback to empty state.
- Contract integrity is mostly respected: no new Host business logic, no new plugin-side Tauri calls, and the new surface is exported through `packages/plugin-organizer/src/index.ts`.
- Targeted tests exist for the core happy-path and corrupt-load cases across both storage backends.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `packages/plugin-organizer/src/layoutStore.ts` saves grids/items via multi-step `put`/cull loops outside `Repo.transaction()`. If upsert succeeds and later cull/delete fails, the repo is left in a mixed generation while the error is swallowed. That is not safe enough for the eventual SQLite cut-over.
- [P1] `packages/plugin-organizer/src/useGridSystem.tsx` can clobber user edits made before async hydrate resolves. `hydrated` only gates persistence; it does not prevent late `load()` results from overwriting in-memory state after the UI has already rendered.
- [P1] `packages/plugin-organizer/src/layoutStore.ts` maps `GridItemEntity.kind === "url"` back to `DesktopItem.type === "file"` and drops `url` metadata. That makes repository round-trip lossy against the G2.1 entity contract and is a poor fit for the next URL-item phase.
- [P2] Doc/code alignment is stale: `packages/grid-persistence/docs/api.md` still says no production API changed, `packages/grid-persistence/docs/design.md` still says “safe prep only,” and `docs/workflow/roadmap/xai-g1-native-foundation.md` still says G1.5 remains blocked in the rationale section.
- [P2] Workflow hygiene is incomplete: `packages/grid-persistence/docs/dev_log.md` Work Log still records the production row as `pending commit` even though `91dc6b6` exists.
- [P2] Test coverage misses the highest-risk repository edges: no explicit missing-`items` malformed payload case, no repo-save failure callback case, and no rollback/partial-write proof.

### Concrete next-phase targets (max 6 bullets)
- Wrap repository save phases in `transaction()` and add a sabotaged-driver rollback test.
- Add a hydrate generation/dirty-state guard so late loads cannot overwrite pre-hydration user actions.
- Make Organizer runtime state URL-capable, or explicitly reject `url` entities until that support lands.
- Reconcile `grid-persistence` docs and roadmap rationale with the shipped scope.
- Record `91dc6b6` in the dev log Work Log row.
- Define cut-over order: run `migrateOrganizerLayoutToRepos` before enabling `repositoryLayoutStore`, and keep legacy localStorage until runtime smoke passes.

### Out of scope confirmed
- Actual Host wiring to pass `repositoryLayoutStore(...)` into `GridSystemProvider`.
- Live `tauri-sqlite` / macOS desktop runtime smoke for restart-restore behavior.
- MAS sandbox / security-scope validation for path-backed items.
- Live Supabase, 2-Mac sync, and SQLCipher dump/wrong-key gates from later G2 rows.