# Track B Cross-Review (Claude)

**Reviewer**: Claude (cross-vendor)
**Branch**: `codex/track-b-productivity-console`
**Base**: `83c0baf` → tip `6f0ed0e`
**Date**: 2026-05-19

## Scope

6 commits, 5 new plugin packages (G4 + G5 mock-first scaffolds):

| Commit | Plugin | Lines |
|--------|--------|-------|
| a6bd997 | plugin-labels | +650 |
| 4ca14b1 | plugin-productivity | +1,400 |
| 06dd704 | plugin-clipboard | +900 |
| b711852 | plugin-console | +1,100 |
| 1a31b34 | plugin-project | +700 |
| 6f0ed0e | docs (contracts + checkpoint) | +290 |

## Cross-Plugin Findings (apply to all 5 plugins)

### [P0] Adapter default-arg infinite-render loop

Every `*StoreProvider` declares `adapter = new LocalStorageAdapter<...>(STORAGE_KEY, seed)` in destructured-prop defaults. When a consumer renders the Provider **without** passing an explicit adapter, the default expression evaluates fresh on every render → new instance → `useCallback([adapter])` returns new `refresh` → `useEffect([refresh])` re-fires → `setState` → re-render → infinite loop.

Affected: `useLabelStore`, `useTodoStore`, `useHabitStore`, `useClipboardStore`, `useNotificationStore`, `useProjectStore`.

**Why P0 (not P1)**: this is the documented Provider usage in `docs/api.md` for each plugin. The moment any of these is wired into `apps/desktop/src/main.tsx` (or into a Track-C Story), the app will spin the React reconciler forever.

**Fix** (≤5 LOC per plugin):
```tsx
const adapterRef = useRef<DataAdapter<Label>>(
  adapter ?? new LocalStorageAdapter<Label>(STORAGE_KEY, seedLabels),
);
const refresh = useCallback(async () => { ... }, [adapterRef]);
```
…or accept a non-default required `adapter` prop and let the Host own instantiation.

### [P1] `DataAdapter<T>` ≠ Repository v0 contract

Each plugin re-declares an identical `DataAdapter<T extends { id: string }>` with methods `getAll/getById/save/delete`. The official Repo (`packages/core-data/src/types.ts`) is `get/put/delete/list/transaction/migrate` and requires `RepoRecord = { id, entityType, schemaVersion, createdAt, updatedAt, syncScope }` per `docs/contracts/data-repository-v0.md`.

Mapping is mostly mechanical (`getAll→list`, `getById→get`, `save→put`), but record-shape additions (`entityType`, `schemaVersion`, `updatedAt`, `syncScope`) are missing from every entity. Track A's `migrateLocalStorageToRepo` also assumes **one localStorage key per record**; Track B writes the whole array under a single key, so the helper won't run as-is.

### [P1] Inline-style proliferation

Every component uses verbose inline `style={{ ... }}` objects (often 8–15 properties). This violates ARCH §4 red line #11 spirit (UI ergonomics) and makes theming/dark-mode/condensed-mode impossible. Replacing with CSS modules or a `@repo/ui` token sheet is a Pre-merge follow-up, but should be tracked.

### [P2] Manifest event channels declared but never emitted

Each `manifest.json` declares `events.emit: ["labels:created", ...]` but no plugin calls `@repo/core/events.publish(...)`. So manifests advertise events that today are silent. Acceptable for scaffold; track for Sprint 2.

### [P2] `DataAdapter<T>` duplicated in 5 type files

The identical interface block is copy-pasted into `packages/plugin-{labels,productivity,clipboard,console,project}/src/types.ts`. Lifting to `@repo/core` (or replacing with Track A's `Repo<T>`) deduplicates.

### File isolation

Track B did not touch `apps/`, `packages/core/`, `packages/core-data/`, `packages/ui/`, `docs/SYSTEM_*`, or any non-Track-B `packages/plugin-*`. Only authored `docs/reviews/<feature>/proposed-contract-changes.md` for cross-track contract requests — clean.

---

## Plugin: plugin-labels

**Commit**: a6bd997
**Verdict**: REVISE

### Strengths
- Clean public surface (`index.ts` re-exports only).
- `LocalStorageAdapter` is SSR-safe (`canUseStorage()` guard).
- `LabelPicker` is keyboard-accessible (Arrow/Enter/Backspace), inline-create, recent-first sort.
- `LabelBadge` computes foreground via WCAG luminance — accessible by construction.

### Issues
- [P0] `LabelStoreProvider` adapter-default loop (see cross-plugin findings).
- [P1] `LabelPicker` keyboard `activeIndex` bound `filteredLabels.length + (canCreate ? 0 : -1)` is off-by-one when `canCreate` is true: the "Create" entry should be index `filteredLabels.length`, so the upper bound should be `filteredLabels.length + (canCreate ? 1 : 0) - 1`. Today ArrowDown can navigate past the last option.
- [P1] `updateLabel` doesn't update `recentLabelIds` ordering on rename — a relabeled label keeps its old position in the recents list.
- [P2] Inline X glyph `"x"` for remove control is a lowercase letter — assistive tech reads it as "X". Use `×` (U+00D7) or icon-only with `aria-label`.
- [P2] No event emission for `labels:created|updated|deleted` despite manifest declaration.

### DataAdapter 兼容性
- 差距: missing `entityType`, `schemaVersion`, `updatedAt`, `syncScope="account-sync"` on `Label`.
- 迁移难度: **Low** — adapter wrapper + 4 field additions.

### 文件隔离违规
- None.

### Next step
- Fix adapter loop and `activeIndex` off-by-one, then promote to APPROVED.

---

## Plugin: plugin-productivity

**Commit**: 4ca14b1
**Verdict**: REVISE

### Strengths
- 3 distinct concerns split into independent providers (`TodoStoreProvider`, `PomodoroStoreProvider`, `HabitStoreProvider`) — composable.
- `autoAssignQuadrant` heuristic supports English + Chinese keywords (`紧急/马上/今天`, `关键/重要/上线`) — bicultural by design.
- `PomodoroTimer` guards double-increment via `useRef(handledCompletion)` keyed on `lastCompletedAt` — neat.
- `EisenhowerMatrix` uses native HTML5 DnD (no react-dnd dependency) — lightweight.

### Issues
- [P0] All 3 store providers share the adapter-default loop bug.
- [P1] `PomodoroStoreProvider` has **no persistence** — settings, `cyclesCompleted`, in-flight session, `lastCompletedTodoId` all reset on reload. Either persist via a `DataAdapter<PomodoroState>` or document the in-memory contract.
- [P1] `Habit` record lacks `createdAt` / `updatedAt` entirely; `Todo` has `createdAt` but no `updatedAt`. Both need additions for Repo v0 record contract.
- [P1] `calculateStreak` recomputes from scratch on every history change but uses local-time `new Date()`; midnight rollover across timezones will produce flaky streaks. Pin to UTC or device-local with explicit policy.
- [P2] `EisenhowerMatrix` `byQuadrant` runs inside render with no memoization — re-filters on every render of any child.
- [P2] `PomodoroTimer.tsx` lists all `todos` in a `<select>` — for users with 200+ todos the dropdown is unusable. Filter by status or add search.
- [P2] No event emission for `productivity:*` events the console plugin's manifest declares as `listen`-able.

### DataAdapter 兼容性
- 差距: missing `entityType`, `schemaVersion`, `createdAt` (Habit), `updatedAt`, `syncScope="account-sync"`.
- 迁移难度: **Medium** — needs schema additions across 3 entity types + Pomodoro persistence design.

### 文件隔离违规
- None.

### Next step
- Fix adapter loop; persist Pomodoro state; add `createdAt/updatedAt` to Habit.

---

## Plugin: plugin-clipboard

**Commit**: 06dd704
**Verdict**: REVISE

### Strengths
- Clean separation: storage (`useClipboardStore`) vs. queue automaton (`usePasteQueue`).
- Privacy redaction is regex-driven and user-extensible.
- Auto-clear is opt-in (5min/30min/2h/Off) and respects `pinned` flag.
- OCR contract is mock-first with clear `engine: "mock" | "macos-vision" | "ai"` extension seam.

### Issues
- [P0] Adapter-default loop.
- [P1] **Redaction is display-only**. `applyRedactions` runs in `renderContent` (View layer); the raw content with emails / SSN-shaped digits remains in `localStorage`. A user who turns Redaction ON likely expects the underlying store to be sanitised too — surprise data-leak risk if the user later exports localStorage, inspects DevTools, or syncs.
- [P1] Auto-clear `useEffect` deps include `entries` — every entry insert/delete tears down and restarts the 30s timer. With frequent capture this prevents the timer from ever firing. Either keep `entries` out of deps and read from a ref, or move the sweep outside React.
- [P1] `inferType` regex `/function\s|const\s|let\s|=>|class\s/` will misclassify casual prose like "Let me think about that → tomorrow" as `code`. Tighten heuristic or downgrade to `text` by default.
- [P2] `usePasteQueue.start` only flips status to `"running"` but no internal timer drives `pasteCurrent` — caller must implement the loop. The interface lets it pass but the name implies autonomy. Document or rename.
- [P2] `ClipboardList` `<pre>` directly interpolates `renderContent(entry)` — React escapes it so no XSS, but mixing `<pre style="whiteSpace: pre-wrap">` plus raw user input means URL detection / link-ification is intentionally absent. Track for later.
- [P2] No emission of `clipboard:entry-created` / `paste-queued` events.

### DataAdapter 兼容性
- 差距: missing `entityType="clipboard.item"`, `schemaVersion`, `updatedAt`, `syncScope="device-local"` (per contract: clipboard defaults device-local).
- 迁移难度: **Low–Medium** — schema additions + a device-local marker.

### 文件隔离违规
- None.

### Next step
- Decide: redact-on-store (preferred) vs. redact-on-view-only documented as such. Then APPROVED.

---

## Plugin: plugin-console

**Commit**: b711852
**Verdict**: REVISE

### Strengths
- `ConsoleLayout` accepts a `registry?: PluginSlotRegistry` so each Console instance can be parametrised — good multi-window hygiene.
- `useCommandPalette` is decoupled from the modal UI (`CommandPalette`) — reusable headless hook.
- `ConsoleDesktopBridge` provides a typed, subscribable event surface for Organizer ↔ Console interaction.
- Cmd/Ctrl+K + Esc bindings registered with `window.addEventListener("keydown", ...)` + cleanup — correct.

### Issues
- [P0] `NotificationStoreProvider` adapter-default loop.
- [P1] **`ConsoleDesktopBridge` is a module-level singleton exported as `consoleDesktopBridge`**. If `plugin-organizer` (Track A) imports it directly to push grid events, that violates red line #2 (cross-plugin direct import) and red line #3 (Plugin-to-plugin must go through `@repo/core/events`). Resolution path: either (a) keep bridge purely internal and bind via `@repo/core/events` in the Host, or (b) move the bridge into `@repo/core`. The exported singleton currently advertises path (a)-violating usage.
- [P1] `ConsoleLayout` mounts both `<ConsoleSearch />` (inline header) **and** `<CommandPalette />` (modal), each with its own state. They share no query and have different scoring rules. Pick one as the canonical surface or feed both from the same hook.
- [P1] `ConsoleSearch` defaults `entities = []`, so `<ConsoleSearch />` with no props always renders 0 results — the header search bar appears functional but is silent. Either inject default entities via context (same as `useCommandPalette`'s `defaultEntities`) or require the prop.
- [P2] `PluginSlotRegistry` exports a module-level singleton `ConsoleSlotRegistry` — fine for a desktop single-window app, but if Console renders in both `main` and `control` windows, both share state. Per-window registry preferred. Make the singleton opt-in.
- [P2] `useCommandPalette` `setQuery` clears `activeIndex` to 0 inside the returned object literal (line 92-95), bypassing memoization — every render returns a new `setQuery` reference. Wrap with `useCallback`.
- [P2] `defaultEntities` in `useCommandPalette` is module-level static — for real use, replace with `ConsoleSlotRegistry.getSearchEntities()` driven by provider registrations. This is the actual "Cmd+K cross-entity search" contract.
- [P2] No event emission for `console:*` events.

### DataAdapter 兼容性
- 差距: `ConsoleNotification` needs `entityType="console.notification"`, `schemaVersion`, `updatedAt`, `syncScope="device-local"`.
- 迁移难度: **Low** — only 1 entity.

### 文件隔离违规
- None.

### Cmd+K contract assessment

`SearchProvider = () => SearchableEntity[] | Promise<SearchableEntity[]>` returned from `PluginSlotRegistry.registerSearchProvider(pluginId, provider)` is a reasonable shape: each plugin owns its own provider and the Console aggregates. The contract weakness is that today nothing **wires** the providers — `useCommandPalette` uses module-level `defaultEntities` instead. Acceptable for scaffold; tag as the Sprint-2 work.

### Next step
- Resolve `ConsoleDesktopBridge` ownership (Plugin vs. Core). Replace `ConsoleSearch` empty default with provider feed.

---

## Plugin: plugin-project

**Commit**: 1a31b34
**Verdict**: REVISE

### Strengths
- Two-entity model (`Project` + `Card`) cleanly separated into two adapters.
- `moveCard` re-normalizes both source and target list orders — order integrity invariant maintained.
- Pure-React DnD (`draggable` + `dataTransfer`) — no extra dep.
- `CardDetail` checklist + due date + labels in a single composable surface.

### Issues
- [P0] `ProjectStoreProvider` adapter-default loop ×2 (one for each adapter).
- [P1] `moveCard` calls `await Promise.all(nextCards.map((card) => cardAdapter.save(card)))` — on every drop it re-saves **every card in the affected lists**. For a board with 100 cards this is 100 sequential localStorage writes per drag. Use `transaction()` (when Repository v0 lands) or persist only the touched cards.
- [P1] `CardDetail` title/description `<input onChange>` calls `updateCard` on every keystroke — 1 localStorage write per character. Debounce, or commit on blur.
- [P1] `Project` and `Card` records have **no `createdAt`/`updatedAt`** at all. Adding them is a record-shape change that blocks Repo v0 adoption.
- [P1] Drop-zone always inserts at end (`order = cards.length`); user can't drop between two cards. Documented elsewhere? Acceptable for scaffold but list as known UX gap.
- [P2] `BoardView` clones `activeProject.lists` via `.slice().sort(...)` on every render. Memoize.
- [P2] `ChecklistItem.id` uses `check-${Date.now()}-${Math.random()...}` instead of the shared `createId` helper.
- [P2] No event emission for `project:card-created|moved|updated`.

### DataAdapter 兼容性
- 差距: missing `entityType`, `schemaVersion`, `createdAt`, `updatedAt`, `syncScope="account-sync"` on **both** `Project` and `Card`.
- 迁移难度: **Medium** — two entities, both lack timestamps, both need transaction semantics for `moveCard`.

### 文件隔离违规
- None.

### Next step
- Add `createdAt`/`updatedAt` to Project + Card. Convert `moveCard` to a single batched persist.

---

## Test Results

All 5 packages pass `pnpm --filter <plugin> check-types`:

| Plugin | Result |
|--------|--------|
| @repo/plugin-labels | PASS |
| @repo/plugin-productivity | PASS |
| @repo/plugin-clipboard | PASS |
| @repo/plugin-console | PASS |
| @repo/plugin-project | PASS |

(Verified in isolated worktree at `/tmp/xai-track-b-review` after `pnpm install --prefer-offline`. Track B's note about absent symlinks is accurate — installing dependencies is required, no new packages were added.)

## plugin-labels — Triplicate Branch Check

`packages/plugin-labels` exists with **identical tree hash `5a8574d0`** on all three tracks (A, B, C). Likely the same scaffold was committed independently or merged from a common base. No conflict expected at merge time. Track B's version is the one being reviewed; the Track A / Track C trees are identical to it.

---

## Track B 总结

| Plugin | Verdict | P0 | P1 | P2 | DataAdapter 迁移难度 |
|--------|---------|----|----|----|--------------------|
| plugin-labels | REVISE | 1 | 2 | 2 | Low |
| plugin-productivity | REVISE | 1 | 4 | 3 | Medium |
| plugin-clipboard | REVISE | 1 | 3 | 3 | Low–Medium |
| plugin-console | REVISE | 1 | 3 | 4 | Low |
| plugin-project | REVISE | 1 | 4 | 3 | Medium |
| **Total** | — | **5** | **16** | **15** | — |

### 合并建议

**Suggested merge order** (post-P0 fix):

1. `plugin-labels` — smallest blast radius, no external deps.
2. `plugin-console` — depends on no other Track B plugin runtime; resolve `ConsoleDesktopBridge` ownership before merge.
3. `plugin-productivity` — Pomodoro persistence decision must precede.
4. `plugin-clipboard` — redact-on-store decision must precede.
5. `plugin-project` — heaviest persistence rework; merge last.

**Conflict expectation with Track A/C**:
- `plugin-labels` tree-identical across A/B/C → no merge conflict.
- No Track B file touches `apps/`, `packages/core*/`, `packages/ui/` → trivial three-way merge.
- `docs/reviews/<feature>/proposed-contract-changes.md` files are Track-B-exclusive paths.
- `docs/workflow/roadmap/xai-v1.track-b-log.md` is Track-B-exclusive.

**Pre-merge P0 list (must fix before any Track B PR lands on main)**:

1. **All 5 plugins** — replace adapter default-arg pattern with `useRef`/`useMemo` or a required prop (≤30 LOC total).

That is the only P0 blocking merge. All other issues are P1/P2 that can land as follow-up PRs but should be tracked in dev_log before promoting to `APPROVED`.

**Recommended dev_log transition**: `READY_FOR_VERIFY` → `BLOCKED → feature-build` until the 5 adapter loops are fixed. Each plugin's `docs/dev_log.md` should reference this review.

---

## Reviewer notes

- Reviewed in isolated worktree to avoid the cross-Track branch-switching observed by the Track B engineer; same incident reproduced here.
- No new code written. No file outside `docs/reviews/track-b-cross-review/` modified.
- Worktree: `/tmp/xai-track-b-review` (cleanable with `git worktree remove /tmp/xai-track-b-review`).
