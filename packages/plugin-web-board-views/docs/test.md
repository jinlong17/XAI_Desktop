# Test Strategy — xai-web-board-views

> Runtime package: `@repo/plugin-web-board-views` (`packages/plugin-web-board-views/`)
> Test framework: Vitest 3 + jsdom + `@testing-library/react` + `@testing-library/jest-dom` (matches sibling rows).

## §1 — Strategy overview

| Layer | What we test | Tooling |
|---|---|---|
| Unit (pure) | `dueShortcuts` helpers, `dateOps` helpers, `i18n` helper | vitest only |
| Component | `TableView`, `BoardCalendarView`, `BoardDashboardView`, `TimelineView`, `MapView`, `ViewPicker` | vitest + @testing-library/react (jsdom) |
| Integration (orchestrator) | `BoardModule` — view switching, persistence round-trip, card mutation via board-core | vitest + @testing-library/react |
| Barrel | `index.ts` exports the public surface declared in api.md §0 | vitest static-import test |
| Registration | `boardViewsWebModuleRegistration` shape matches `WebModuleSlotRegistration` interface | vitest + structural assertion |

### Coverage targets

- Total: **80%+ lines / 75%+ branches** (sibling-aligned with row #7 board-core).
- Per-view: each of the 5 views has ≥1 happy-path test + ≥1 error-semantics test.
- DnD paths: Calendar (1 happy + 1 malformed payload) + Timeline (1 happy + 1 mouseup-without-move).

### Sibling-aligned conventions

- One `__tests__/` folder under `src/` (no separate `test/` tree).
- `vitest.setup.ts` provides `requestAnimationFrame` polyfill + `afterEach(() => localStorage.clear())` + `import "@testing-library/jest-dom"` (matches row #7 setup verbatim).
- Mock `usePref` via a thin module-level mock that backs onto `localStorage` (matches sibling pattern from rows #14/#15/#16/#18 — verified during plan).
- Mock `useWebShell` via `vi.mock("@repo/xai-web-shell", …)` to return `{ lang: "en" }` (matches row #7 BoardModule.test pattern).

## §2 — Test cases

### §2.1 — Unit / pure (`__tests__/dueShortcuts.test.ts`)

| ID | Case | Assertion |
|---|---|---|
| DS1 | `todayShortcut("en")` returns `"Today"` | `=== "Today"` |
| DS2 | `todayShortcut("zh")` returns `"今天"` | `=== "今天"` |
| DS3 | `tomorrowShortcut(2026, 5, 23)` returns `"5/24"` | format `M/D` |
| DS4 | `tomorrowShortcut` at month boundary (e.g. 2026-12-31) returns `"1/1"` | rollover honoured |
| DS5 | `nextMondayShortcut` from a Saturday returns Monday (today + 2) | `"M/D"` |
| DS6 | `nextMondayShortcut` from a Monday returns NEXT Monday (today + 7) | `"M/D"` |
| DS7 | `nextMondayShortcut` from a Sunday returns Monday (today + 1) | `"M/D"` |

### §2.2 — Unit / pure (`__tests__/dateOps.test.ts`)

| ID | Case | Assertion |
|---|---|---|
| DO1 | `parseDay("5/24")` from 5/23 today returns `1` | offset days |
| DO2 | `parseDay("Today")` from any today returns `0` | shortcut |
| DO3 | `parseDay("今天")` returns `0` | shortcut zh |
| DO4 | `parseDay(undefined)` returns `null` | guard |
| DO5 | `parseDay("garbage")` returns `null` | guard |
| DO6 | `dayToStr(2)` from today 5/23 returns `"5/25"` | inverse |
| DO7 | `clampDay(-5)` returns `0`; `clampDay(40)` returns `29` | clamp |

### §2.3 — Component (`__tests__/ViewPicker.test.tsx`)

| ID | Case | Assertion |
|---|---|---|
| VP1 | Renders 6 buttons matching `BoardViewId` literal union | 6 buttons present |
| VP2 | Active view button has `aria-pressed="true"` | role/aria |
| VP3 | Click on inactive view fires `onChange` with that view id | spy called once with correct arg |
| VP4 | Bilingual: button labels switch when `lang` prop flips | `getByText("Table")` ↔ `getByText("表格")` |
| VP5 | Click on already-active view still fires `onChange` (consumer guards) | spy called |

### §2.4 — Component (`__tests__/TableView.test.tsx`)

| ID | Case | Assertion |
|---|---|---|
| TV1 | Renders one row per card across all lists | row count = sum of `list.cards.length` |
| TV2 | Click on title cell calls `onOpenCard(card, listId)` | spy called with correct args |
| TV3 | List pill renders with list color when `list.color` is set | inline `style.background` resolves to CSS var |
| TV4 | Labels cell shows `+ Labels` empty-hint when card has no labels | text content |
| TV5 | Labels cell click opens popover; toggle label → `updateCard(listId, cardId, {labels: [...]})` | spy called with merged labels array |
| TV6 | Members cell same as TV5 (mirror logic) | spy called with merged members array |
| TV7 | Due cell click opens picker; Today shortcut → `updateCard(listId, cardId, {due:"Today", dueEn:undefined, dueLate:false})` | spy called with correct patch |
| TV8 | Due cell Tomorrow shortcut → `updateCard(...,{due:"<tomorrow M/D>", …})` | format-checked |
| TV9 | Due cell Next Mon shortcut → `updateCard(...,{due:"<next Mon M/D>", …})` | format-checked |
| TV10 | Progress column renders `"3/5"` text + bar when `checklist={done:3,total:5}` | text + style.width |
| TV11 | Progress column shows nothing when `checklist` is `undefined` | empty cell |
| TV12 | Progress with `total: 0` renders bar at 0% (no div-by-zero) | bar width 0% |
| TV13 | Bilingual: zh `lang` flips column headers + popover labels | text content |

### §2.5 — Component (`__tests__/BoardCalendarView.test.tsx`)

| ID | Case | Assertion |
|---|---|---|
| BC1 | Renders 7 weekday headers (Mon–Sun) | 7 elements |
| BC2 | Renders correct # of day cells for the current month | day count |
| BC3 | Cards with `due === "5/24"` (today + 1) appear in cell for day 24 | text in cell |
| BC4 | Cards with `due === "Today"` appear in today's cell | text in today cell |
| BC5 | Cell with >3 cards shows `+N more` indicator | text |
| BC6 | `dragstart` on a card sets `dataTransfer` to JSON `{cardId, listId}` | `dataTransfer.getData` |
| BC7 | `dragover` on a cell calls `preventDefault` (DnD spec compliance) | event.defaultPrevented |
| BC8 | `drop` on day 25 → `updateCard(listId, cardId, {due:"5/25", dueEn:undefined, dueLate:false})` (hard constraint) | spy called with correct patch |
| BC9 | `drop` with malformed `dataTransfer.text/plain` payload → no-op | spy NOT called |
| BC10 | `drop` on empty cell (no `day`) → no-op | spy NOT called |
| BC11 | Bilingual: weekday names + month label flip on zh | text content |
| BC12 | Empty state — no cards have `due` → empty hint visible | text content |

### §2.6 — Component (`__tests__/BoardDashboardView.test.tsx`)

| ID | Case | Assertion |
|---|---|---|
| BD1 | KPI "Total cards" renders `lists.flatMap(l=>l.cards).length` | text |
| BD2 | KPI "Due today" counts cards with `due === "Today" \|\| due === "今天"` | text |
| BD3 | KPI "Overdue" counts cards with `dueLate === true` | text |
| BD4 | KPI "Lists" renders `lists.length` | text |
| BD5 | Per-list bar chart renders one row per list with correct width % | `style.width` |
| BD6 | Per-list bar uses `list.color` (resolved via CSS var) when set | `style.background` |
| BD7 | Per-label bar chart renders one row per label with count > 0 (drawn from `PM_LABELS`) | row count |
| BD8 | Per-label bar width = `100 * count / maxLabelCount` | `style.width` |
| BD9 | Empty `lists` → KPIs show 0/0/0/0 + bar charts render empty containers | no crash |
| BD10 | Bilingual: KPI labels + chart titles flip on zh | text content |

### §2.7 — Component (`__tests__/TimelineView.test.tsx`)

| ID | Case | Assertion |
|---|---|---|
| TL1 | Renders 30 day headers starting from today | 30 elements |
| TL2 | Today's header has `is-today` class / visual marker | class assertion |
| TL3 | Cards with `due === "5/24"` render as bars positioned at day 1 (today + 1) | bar `style.left` |
| TL4 | Cards with `start === "5/23"` AND `due === "5/30"` render as multi-day bar | bar `style.width` |
| TL5 | Cards without `start` render as single-day bar at `due` | width matches one day |
| TL6 | Three handles render per bar (resize-l / move / resize-r) | 3 elements per bar |
| TL7 | Bar that conceptually starts before day 0 has CSS `clip-path` clipping at left edge (hard constraint) | computed style |
| TL8 | Bar that conceptually ends after day 29 has CSS clip at right edge | computed style |
| TL9 | DnD happy-path: mousedown on right handle → mousemove +2 day-widths → mouseup → ONE `updateCard` call with `{due: "<today+offset+2 M/D>", start: <unchanged>, dueEn: undefined, dueLate: false}` (hard constraint atomic) | spy called once |
| TL10 | DnD on move handle: mousemove +3 day-widths → `updateCard` with `{due: <due+3>, start: <start+3>, …}` atomically | spy called once with both keys |
| TL11 | DnD on left handle: mousemove +1 → `updateCard` with `{start: <start+1>, due: <unchanged>, …}` | spy called once |
| TL12 | DnD mouseup WITHOUT mousemove → NO `updateCard` call (test asserts) | spy NOT called |
| TL13 | DnD mousemove past day 29 → `updateCard` with `due` clamped to day 29 (hard constraint clamp) | spy called with clamped value |
| TL14 | DnD mousemove before day 0 → `start/due` clamped to 0 | spy called with clamped |
| TL15 | mouseup outside `<div ref={trackRef}>` (e.g. on window) still commits the preview (window-level listener) | spy called |
| TL16 | mouseup with `preview === undefined` (no mousemove) → no commit (no-op) | spy NOT called |
| TL17 | Click on the bar body (no drag) → `onOpenCard` called | spy called |

### §2.8 — Component (`__tests__/MapView.test.tsx`)

| ID | Case | Assertion |
|---|---|---|
| MV1 | Renders `<svg>` with 6 decorative pins (matches prototype line 1068) | 6 `<circle>` elements |
| MV2 | Overlay card visible with explanatory text | text content |
| MV3 | Bilingual: copy switches en ↔ zh | text content |

### §2.9 — Integration (`__tests__/BoardModule.test.tsx`)

| ID | Case | Assertion |
|---|---|---|
| BM1 | First mount with empty registry → renders BoardView (default view `"board"`) | text "Board" view marker |
| BM2 | Click ViewPicker → "Table" → `<TableView>` renders | table component visible |
| BM3 | Switch view → unmount + remount → view persists (via `xai_board_view_by_id`) | view restored to "table" |
| BM4 | Calendar drop on day 25 → board-core `BoardView` re-mount shows the card moved to day 25's column for that due | full round-trip via `xai_boards_v2` |
| BM5 | Timeline DnD on a card → `xai_boards_v2` reflects the new `{start, due}` after persistence flush | round-trip |
| BM6 | Bilingual: `lang` prop flips header + ViewPicker labels + active view content | text content |
| BM7 | View id `"map"` selected → `<MapView>` renders, no DnD wired | component visible |
| BM8 | `viewByBoardId` contains an entry for a deleted board id → no crash; current board falls back to `"board"` (orphan tolerated per api.md §11) | no error thrown |

### §2.10 — Barrel (`__tests__/index-barrel.test.ts`)

| ID | Case | Assertion |
|---|---|---|
| IB1 | `import * as M from "@repo/plugin-web-board-views"` resolves all api.md §0 symbols | named-export check |
| IB2 | No re-export from `…/src/internal/*` exists | static-grep test |
| IB3 | `boardViewsWebModuleRegistration.moduleId === "board"` + `railOrder === 3` + `icon === "kanban"` | structural |
| IB4 | All view component types are exported (`TableViewProps`, etc.) | type-level via runtime import shape |

### §2.11 — Registration (`__tests__/registration.test.tsx`)

| ID | Case | Assertion |
|---|---|---|
| RG1 | `boardViewsWebModuleRegistration` has all required `WebModuleSlotRegistration` fields | structural |
| RG2 | `children` includes `{path:"", render}` + `{path:"*", render}` (fallback) | array len |
| RG3 | `render` returns a `<BoardModule lang={…}>` reading lang from `useWebShell()` | mock + assertion |
| RG4 | `showInRail === true`, `i18nKey === "nav.board"` | direct |

## §3 — Mock strategy

### §3.1 — `usePref` mock

A module-level mock that backs onto `localStorage` (sibling pattern from row #7):

```ts
// vitest.setup.ts (extends row #7 setup)
import "@testing-library/jest-dom";

// requestAnimationFrame polyfill for DnD tests
if (typeof globalThis.requestAnimationFrame === "undefined") {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 16) as unknown as number;
}

afterEach(() => {
  localStorage.clear();
});
```

`usePref` itself is NOT mocked at the module level — the integration tests use the real `@repo/plugin-web-storage` `usePref` against the jsdom-backed `localStorage` (matches row #7 BoardModule.test pattern verbatim). This validates the registry-add for `xai_board_view_by_id` end-to-end.

### §3.2 — `useWebShell` mock

```ts
vi.mock("@repo/xai-web-shell", async () => {
  const actual = await vi.importActual<typeof import("@repo/xai-web-shell")>("@repo/xai-web-shell");
  return {
    ...actual,
    useWebShell: () => ({ lang: "en" }),
  };
});
```

Per-test `lang` flips done by re-mocking inside `describe.each`.

### §3.3 — DnD `DataTransfer` mock helper

Reuse the row #7 pattern: `__tests__/_helpers/dataTransfer.ts` exports a `makeDataTransferMock()` that returns an object with `setData`, `getData`, and the JSON-serialised payload. Calendar tests use this for `dragstart`/`drop`. Timeline tests don't use `DataTransfer` (pointer-based, not HTML5 DnD); instead, `__tests__/_helpers/timelineDrag.ts` exports a `simulateTimelineDrag(handleEl, deltaPx)` helper that:

1. Stubs `getBoundingClientRect` on the track element
2. Dispatches `mousedown` → `window.mousemove` × N → `window.mouseup`

### §3.4 — `clientX` / pointer helpers

Timeline tests stub `getBoundingClientRect` on `trackRef.current` to return `{ width: 900, height: 100, left: 0, top: 0, right: 900, bottom: 100 }` so `dayWidth = 30` and 1-day-width = 30px deltaX.

## §4 — Acceptance criteria (matches feature-verify checklist)

| Gate | Description |
|---|---|
| G1 | `pnpm --filter @repo/plugin-web-board-views lint --max-warnings 0` exits 0 |
| G2 | `pnpm --filter @repo/plugin-web-board-views typecheck` exits 0 |
| G3 | `pnpm --filter @repo/plugin-web-board-views test` exits 0; all tests pass; ≥80% lines / ≥75% branches |
| G4 | `pnpm --filter @repo/web check-types` exits 0 |
| G5 | `pnpm --filter @repo/web build` exits 0 |
| G6 | `pnpm --filter @repo/web test` exits 0 (no host regression) |
| G7 | `pnpm --filter @repo/plugin-web-storage test` exits 0 (new `xai_board_view_by_id` registry entry tested by the registry's own suite) |
| G8 (manual) | Cross-vendor smoke (Chrome / Safari / Firefox) — QUEUED at ship-time per W2e Parallel-Agent mode (Codex `gpt-5.5-thinking medium` / Cursor fallback). |

## §5 — Manual smoke checklist (for ship-time cross-vendor verifier)

Q1. `/board` renders Board view by default with the seed kanban columns.
Q2. ViewPicker shows 6 entries (Board / Table / Calendar / Dashboard / Timeline / Map).
Q3. Switch to Table → row-per-card with all 6 columns visible; click Due → Today shortcut → date cell shows "Today".
Q4. Switch to Calendar → drag a card to a different day → reload → card now reads new due date.
Q5. Switch to Dashboard → 4 KPIs + 2 horizontal bar charts render.
Q6. Switch to Timeline → bars render at correct horizontal positions; drag right handle → due updates; reload persists.
Q7. Switch to Map → SVG placeholder + overlay text visible.
Q8. Switch board (when row #9 ships) → previously selected view recalled per board.
Q9. EN ↔ 中文 toggle flips all visible strings across all 6 views.
Q10. Set `localStorage.xai_board_view_by_id = "garbage"` → reload renders Board view without crash (orphan tolerated).

---

## §6 — 2026-05-25 Extension Tests (gap-closure row #6 — Filter / Share / Map)

> APPEND-ONLY. Sections §1..§5 above are NOT mutated.

### §6.1 — Baseline preservation (gate)

Existing 90 tests in `packages/plugin-web-board-views/src/__tests__/**` MUST
continue to pass with zero edits (only the `MapView.test.tsx` file is
explicitly rewritten — its existing 3 cases MV1/MV2/MV3 are replaced with the
new ~15 case suite per §6.4).

### §6.2 — `__tests__/filter.test.ts` (NEW · 12 cases)

| ID | Case | Assertion |
|---|---|---|
| FIL-1 | `applyFilter(lists, EMPTY_FILTER)` returns lists with same card count | `flatMap(l=>l.cards).length` equality |
| FIL-2 | Label-only filter — single label match | Only cards with that label appear |
| FIL-3 | Label-only filter — multiple labels (OR within facet) | Cards with ANY of the labels appear |
| FIL-4 | Member-only filter — single member | Only cards with that member |
| FIL-5 | Member + label combined (AND between facets) | Card must match BOTH facets |
| FIL-6 | `dueRange: 'overdue'` — only cards with `dueLate === true` | filtered set count |
| FIL-7 | `dueRange: 'today'` — matches "Today" / "今天" / today's "M/D" | matches all 3 formats |
| FIL-8 | `dueRange: 'week'` — matches `due` parseable to [today, today+7) | range correct |
| FIL-9 | Empty `lists` input → returns empty lists; no crash | length 0 |
| FIL-10 | Filter that excludes ALL cards → lists preserved (empty cards arrays) | lists.length unchanged |
| FIL-11 | `applyFilter` is pure — same input twice → identical output | deep-equality + reference inequality |
| FIL-12 | `applyFilter` is referentially transparent — input not mutated | `Object.isFrozen`-style check |

### §6.3 — `__tests__/location.test.ts` (NEW · 6 cases)

| ID | Case | Assertion |
|---|---|---|
| LOC-1 | `isValidLocation({lat: 40.7, lng: -74})` → true | guard accepts |
| LOC-2 | `isValidLocation({lat: NaN, lng: 0})` → false | NaN rejected |
| LOC-3 | `isValidLocation({lat: 0, lng: NaN})` → false | NaN rejected |
| LOC-4 | `isValidLocation({lat: 91, lng: 0})` → false | out-of-range rejected |
| LOC-5 | `isValidLocation({lat: 0, lng: 181})` → false | out-of-range rejected |
| LOC-6 | `isValidLocation(null) === false` AND `isValidLocation(undefined) === false` AND `isValidLocation({})` === false | non-object + missing keys rejected |

### §6.4 — `__tests__/MapView.test.tsx` (REWRITE · 15 cases · replaces MV1/MV2/MV3)

| ID | Case | Assertion |
|---|---|---|
| MAP-1 | Renders `<Suspense fallback>` text "Loading map…" on first mount | text content; `await waitFor` for chunk load |
| MAP-2 | After lazy import resolves, renders a `<div>` container with class `leaflet-container` | DOM query after wait |
| MAP-3 | Cards with valid `location` render one Leaflet marker each | Mock `L.marker` spy call count = valid-card count |
| MAP-4 | Cards without `location` render NO marker | spy count unchanged when no valid locations |
| MAP-5 | Cards with NaN `location.lat` filtered out | spy count = 0 |
| MAP-6 | Cards with out-of-range `location.lng` filtered out | spy count = 0 |
| MAP-7 | Empty-state overlay visible when ALL cards lack location | text "No cards have a location yet." visible |
| MAP-8 | Empty-state bilingual flip — `lang="zh"` shows Chinese copy | text contains "没有卡片设置了位置" |
| MAP-9 | Click on a marker calls `onSelectCard(cardId, listId)` | spy called with correct args |
| MAP-10 | Tile layer URL matches `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | Mock `L.tileLayer` first arg |
| MAP-11 | Attribution string is `"© OpenStreetMap contributors"` | Mock `L.tileLayer` second arg `.attribution` |
| MAP-12 | `useEffect` cleanup calls `map.remove()` on unmount | Mock spy on `.remove()` |
| MAP-13 | `fitBounds` called when ≥1 valid pin; padding `[50, 50]` | Mock spy on `.fitBounds(...)` args |
| MAP-14 | `setView([0,0], 2)` (world fallback) when zero pins | Mock spy on `.setView(...)` |
| MAP-15 | Popup binding — popup text matches `card.title[lang]` + `loc.label` | Mock spy on `.bindPopup` |

**Mock strategy**: Leaflet is mocked at module level via
`vi.mock("leaflet", () => ({ map: vi.fn(()=>mockMap), tileLayer: vi.fn(()=>mockTile), marker: vi.fn(()=>mockMarker), default: { map, tileLayer, marker } }))`.
This avoids loading Leaflet's full DOM-manipulation code in jsdom and gives
deterministic spy assertions.

### §6.5 — `__tests__/filter-view-integration.test.tsx` (NEW · 6 cases)

| ID | Case | Assertion |
|---|---|---|
| FVI-Board | Apply filter `{labels: new Set(["urgent"])}` to Kanban Board → only urgent cards visible | render count |
| FVI-Table | Apply same filter to TableView → row count = urgent card count | row count |
| FVI-Calendar | Apply same filter to BoardCalendarView → only urgent cards appear in day cells | text-in-cell |
| FVI-Dashboard | Apply same filter to BoardDashboardView → KPIs reflect filtered counts (Total = urgent count) | KPI text |
| FVI-Timeline | Apply same filter to TimelineView → only urgent bars rendered | bar count |
| FVI-Map | Apply same filter to MapView → only urgent cards' markers rendered (HC1 consistency) | marker count |

### §6.6 — Verifier checklist additions (manual smoke for cross-vendor ship-time)

Q11. Open `/app/board` → Filter button now enabled (no longer greyed); click opens popover with 3 facets.
Q12. Tick "urgent" label → cards re-render across visible view; total count badge in header updates.
Q13. Switch to each of the 6 views with filter active → consistent narrowing visible (HC1).
Q14. Click Share button → native `<dialog>` opens; URL is visible + Copy button works (`navigator.clipboard.writeText` succeeds in real browser).
Q15. Click Copy → "Copied!" affordance flips for 2 seconds; emit-before-close confirmed via DevTools Event Listeners.
Q16. ESC closes Share modal; backdrop click closes Share modal.
Q17. Switch active board (board switcher) → Filter resets to empty state (HC1 "reset on board switch").
Q18. Open Map view → Leaflet tiles load from `tile.openstreetmap.org`; attribution visible in bottom-right.
Q19. Cards without `location` in seed → Map shows empty-state overlay + blank tile background.
Q20. Manually edit `xai_boards_v2` localStorage to add a `location: { lat: 37.7749, lng: -122.4194, label: "SF" }` to one card → reload → marker visible at San Francisco.
Q21. Click marker → `onSelectCard` callback fires (future: highlights card; v1: console.log or no-op).
Q22. DevTools Network tab → Leaflet bundle (`MapView-*.js` chunk + leaflet.css) loaded ONLY after clicking Map tab (NOT in initial page bundle).
Q23. Bilingual flip EN ↔ 中文 → Filter / Share / Map UI strings switch.

### §6.7 — Acceptance gates (verify-time checklist)

| Gate | Description |
|---|---|
| G1 | `pnpm --filter @repo/plugin-web-board-core test` → 104 baseline + 4 location-guard = 108 PASS |
| G2 | `pnpm --filter @repo/plugin-web-board-views test` → 90 baseline + 12 + 6 + 12 (MapView REWRITE delta = +12 over old 3) + 6 = 126 PASS (precise count subject to ±3 by build executor) |
| G3 | `pnpm --filter @repo/plugin-web-board-workspaces test` → 135 baseline + 30 = 165 PASS (per workspaces test.md §6 extension) |
| G4 | `pnpm --filter @repo/web test` → 100 baseline + 1 CSP guard + 2 build-manifest = 103 PASS |
| G5 | `pnpm --filter @repo/web check-types` PASS |
| G6 | `pnpm --filter @repo/web build` PASS — Vite outputs MapView lazy chunk |
| G7 | Bundle-manifest test passes: lazy chunk exists AND < 80 KB minified |
| G8 | CSP source-text test passes: both `connect-src` and `img-src` contain `https://tile.openstreetmap.org` |
| G9 | `pnpm --filter @repo/core check-types` PASS (new EventMap entry compiles) |
| G10 | `pnpm --filter @repo/xai-web-event-bus test` PASS (no regression from EventMap addition) |
| G11 (manual) | Cross-vendor smoke per §6.6 — Codex `gpt-5.5-thinking medium` primary; queued 24h per ADR-0008 carve-out (W1 precedent) |
