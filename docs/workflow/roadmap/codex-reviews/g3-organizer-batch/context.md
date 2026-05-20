Feature ID: G3-batch (E1 + S3 + E2 + E3 + E4)
Branch: codex/track-a-desktop-foundation
Commit under review: 533391e (feat(plugin-organizer): G3 organizer-loop utilities + Finder commands)

This single commit consolidates 5 G3 features. Review them together because they
share files and design assumptions; flag per-feature gaps.

Files added or changed:
- packages/plugin-organizer/src/gridItemFactory.ts + .test.ts (G3-E1, G3-S3)
- packages/plugin-organizer/src/autoClassify.ts + .test.ts (G3-E2)
- packages/plugin-organizer/src/finderClient.ts (G3-E3, TS wrapper)
- apps/desktop/src-tauri/src/commands/finder.rs (G3-E3, Rust commands)
- apps/desktop/src-tauri/src/commands/mod.rs + lib.rs registration
- packages/plugin-organizer/src/itemHealth.ts + .test.ts (G3-E4)
- packages/plugin-organizer/src/index.ts (public exports)
- docs/contracts/tauri-commands-v0.md §4 (reveal_in_finder / open_path documented)
- docs/workflow/roadmap/xai-v1.autorun-20260519.md checkpoint

Per-feature scope:

G3-E1 / Grid item model productization
- Typed factories: createFileGridItem / createFolderGridItem / createAppGridItem /
  createUrlGridItem
- Bulk: createGridItemsFromFinderDrop with kind inference (.app suffix → app)
- Injectable deps (nowIso, newId) for deterministic tests

G3-S3 / New URL item
- createUrlGridItem validates http/https, rejects file:// / javascript: / parse
  failures via InvalidUrlError
- filename derived from hostname when title missing
- url normalisation via new URL().toString()

G3-E2 / Auto-classification rules
- ClassificationRule[] engine; classifyGridItem picks highest-scoring match
- Default rules: kind-title (10) / extension-group-title (20) /
  parent-folder-title (25)
- Extension groups: images, videos, audio, pdfs, notes, archives

G3-E3 / Finder collaboration
- Rust: reveal_in_finder / open_path with FINDER_ALLOWED_WINDOWS allow-list +
  path validation (reject empty / NUL); macOS uses `open` / `open -R`
- TS: createFinderClient(invoke) — never imports @tauri-apps/api
- 3 cargo tests

G3-E4 / Empty state + error recovery
- evaluateItemHealth(item, { pathExists? }) → healthy / missing-path /
  missing-protocol / broken-url / unknown
- defaultEmptyStateActions() with 4 CTAs

Cross-vendor checklist:
1. G3-E1: `createGridItemsFromFinderDrop` treats `.app` lower/uppercase as app,
   anything else as file. Should there be a folder heuristic beyond trailing `/`
   (e.g. paths without an extension)? Currently folders only detected when path
   ends with `/`.
2. G3-S3: URL validation rejects javascript: / file: but accepts data: ? Confirm
   `data:` URI is also rejected.
3. G3-E2: rule scores are constants; no tie-breaking docs. If two grids match
   the same rule, current code returns the first iterated one — Map iteration
   order is stable but is this documented?
4. G3-E2: extension groups are hard-coded. Should they be data-driven (from
   Repository / settings) so the user can extend without recompile?
5. G3-E3: `open_path` shells out to `open` synchronously. If the target app
   takes >2s to launch, does the Tauri command thread block? Should be tokio
   spawn_blocking or std::process::Command::spawn?
6. G3-E3: path validation rejects empty / NUL but not `..` traversal or absolute
   paths outside user-authorized roots. Project policy says "all path access
   must come from user drop/open panel or authorized bookmark". Is that
   enforced anywhere upstream of this Rust command?
7. G3-E4: `evaluateItemHealth` for kind=url checks `item.url`. But the entity
   shape guarantees `url?` only when kind=url. Is the union narrowing exhaustive
   if a future kind is added?
8. Test coverage: 41 vitest + 3 cargo. Missing: URL fragment / anchor only,
   `app://` custom scheme, deeply nested folder name collision, classifier
   stability under N>3 grids.
9. Workflow hygiene: 5 features in ONE commit. Project policy says one phase
   per feature-build run. Is the bundled commit defensible (related and small),
   or should this have been 5 separate commits? Flag for next-phase fix.
