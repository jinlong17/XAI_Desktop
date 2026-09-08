# API Contract — xai-web-board-views

> Runtime package: `@repo/plugin-web-board-views` (`packages/plugin-web-board-views/`)
> Public surface: `src/index.ts` ONLY. All consumers (apps/web, future row #9 board-workspaces) import from `@repo/plugin-web-board-views`.

## §0 — Public surface (`src/index.ts` exports)

```ts
// ---- Side-effect CSS import ---------------------------------------------
import "./styles.css";

// ---- Types --------------------------------------------------------------
export type {
  BoardViewId,
  ViewPickerEntry,
  DueShortcutId,
} from "./types.js";

// ---- React components ---------------------------------------------------
export { BoardModule } from "./BoardModule.js";
export type { BoardModuleProps } from "./BoardModule.js";

export { ViewPicker } from "./ViewPicker.js";
export type { ViewPickerProps } from "./ViewPicker.js";

export { TableView } from "./TableView.js";
export type { TableViewProps } from "./TableView.js";

export { BoardCalendarView } from "./BoardCalendarView.js";
export type { BoardCalendarViewProps } from "./BoardCalendarView.js";

export { BoardDashboardView } from "./BoardDashboardView.js";
export type { BoardDashboardViewProps } from "./BoardDashboardView.js";

export { TimelineView } from "./TimelineView.js";
export type { TimelineViewProps } from "./TimelineView.js";

export { MapView } from "./MapView.js";
export type { MapViewProps } from "./MapView.js";

// ---- Shell slot registration --------------------------------------------
export { boardViewsWebModuleRegistration } from "./registration.js";
```

**Hard rule**: Never import from `@repo/plugin-web-board-views/src/internal/*`. Consumers needing internal symbols must request promotion via code review.

## §1 — Component API: `BoardModule`

```tsx
export interface BoardModuleProps {
  /** Bilingual language toggle. */
  lang: "en" | "zh";
}

export function BoardModule(props: BoardModuleProps): JSX.Element;
```

**Behavior**

- Reads `boards` from `usePref("xai_boards_v2")` via board-core's `loadBoardsOrDefault` (narrowing).
- Reads `activeBoardId` from `usePref("xai_active_board")` via board-core's `pickActiveBoard`.
- Reads `viewByBoardId` from `usePref("xai_board_view_by_id")` (new key — see §6). Defaults to `{}`.
- Computes `activeView: BoardViewId = viewByBoardId[activeBoard.id] ?? "board"`.
- Renders `<header>` containing `<h1>{activeBoard.name[lang]}</h1>` + `<ViewPicker />`.
- Renders one of the 6 view components based on `activeView`:
  - `"board"` → `<BoardView … />` from `@repo/plugin-web-board-core`
  - `"table"` → `<TableView … />`
  - `"calendar"` → `<BoardCalendarView … />`
  - `"dashboard"` → `<BoardDashboardView … />`
  - `"timeline"` → `<TimelineView … />`
  - `"map"` → `<MapView … />`
- Card mutations (Calendar drop, Timeline 3-handle DnD, Table inline edits) call a single `updateCard(listId, cardId, patch)` closure that delegates to board-core's `updateCardInList` pure helper, then writes back via `setBoards` (same atomic pattern as row #7).
- Persists `viewByBoardId` automatically when the view picker changes the active view.

## §2 — Component API: `ViewPicker`

```tsx
export interface ViewPickerEntry {
  id: BoardViewId;
  labelEn: string;
  labelZh: string;
  icon: "kanban" | "grid" | "calendar" | "barchart" | "gantt" | "globe";
}

export interface ViewPickerProps {
  activeView: BoardViewId;
  onChange: (next: BoardViewId) => void;
  lang: "en" | "zh";
}

export function ViewPicker(props: ViewPickerProps): JSX.Element;
```

**Behavior**

- Renders 6 buttons (one per `BoardViewId`).
- Active button gets `aria-pressed="true"` + visual highlight.
- Click fires `onChange(next)`.

## §3 — Component API: `TableView`

```tsx
import type { BoardListData, BoardCardData } from "@repo/plugin-web-board-core";

export interface TableViewProps {
  lists: readonly BoardListData[];
  lang: "en" | "zh";
  updateCard: (listId: string, cardId: string, patch: Partial<BoardCardData>) => void;
  /** Called when the user clicks the title cell. Future row #9 will wire this to a card detail modal. */
  onOpenCard?: (card: BoardCardData, listId: string) => void;
}

export function TableView(props: TableViewProps): JSX.Element;
```

**Behavior**

- Flattens `lists.flatMap(l => l.cards.map(c => ({ card, list })))` into rows.
- Renders columns: Card title (click → `onOpenCard?`) · List (pill colored by list.color) · Labels · Members · Due · Checklist (progress).
- Labels / Members / Due cells are clickable to open inline popovers (multiselect for labels/members; date picker with quick-shortcuts for Due).
- Due picker has 3 quick-shortcuts (hard constraint per DESIGN.md §4.3):
  - **Today** — emits `"Today"` (en) / `"今天"` (zh)
  - **Tomorrow** — emits `"M/D"` of tomorrow
  - **Next Mon** — emits `"M/D"` of the next Monday (today + days_until_mon)
- Progress column renders `card.checklist.{done,total}` as a horizontal bar + text `done/total`. Absent → empty cell.

## §4 — Component API: `BoardCalendarView`

```tsx
export interface BoardCalendarViewProps {
  lists: readonly BoardListData[];
  lang: "en" | "zh";
  updateCard: (listId: string, cardId: string, patch: Partial<BoardCardData>) => void;
  onOpenCard?: (card: BoardCardData, listId: string) => void;
}

export function BoardCalendarView(props: BoardCalendarViewProps): JSX.Element;
```

**Behavior**

- Renders the current month as a 7×N grid.
- For each card with a `due` matching `/^(\d+)\/(\d+)/` or `"Today"` / `"今天"`, places it in the corresponding day cell.
- Each cell shows up to 3 cards + a `+N more` indicator.
- HTML5 DnD: card `dragstart` sets `dataTransfer` to JSON `{ cardId, listId }`; cell `dragover` calls `preventDefault`; cell `drop` parses the payload and calls `updateCard(listId, cardId, { due: "M/D", dueEn: undefined, dueLate: false })` (hard constraint — same persistence path as core).
- Malformed `dataTransfer` payload → silent no-op (try/catch).

## §5 — Component API: `BoardDashboardView`

```tsx
export interface BoardDashboardViewProps {
  lists: readonly BoardListData[];
  lang: "en" | "zh";
}

export function BoardDashboardView(props: BoardDashboardViewProps): JSX.Element;
```

**Behavior**

- KPI cards (4):
  - Total cards = `lists.reduce((n,l)=>n+l.cards.length, 0)`
  - Due today = count of cards where `due === "Today" || due === "今天"`
  - Overdue = count of cards where `dueLate === true`
  - Lists = `lists.length`
- Per-list horizontal bar chart: one row per list; bar width = `100 * list.cards.length / max(1, totalCards)`.
- Per-label horizontal bar chart: one row per label in board-core's `PM_LABELS` (filtered to labels with count > 0); bar width = `100 * count / maxLabelCount`.
- No chart library — pure CSS divs.

## §6 — Component API: `TimelineView`

```tsx
export interface TimelineViewProps {
  lists: readonly BoardListData[];
  lang: "en" | "zh";
  updateCard: (listId: string, cardId: string, patch: Partial<BoardCardData>) => void;
  onOpenCard?: (card: BoardCardData, listId: string) => void;
}

export function TimelineView(props: TimelineViewProps): JSX.Element;
```

**Behavior**

- Renders a 30-day horizontal scale starting from today.
- Each card with a `due` parseable by `parseDay` renders as a bar in its list's row.
- Bar position computed from `(start, due)`. If `start` is absent, `start = due` (single-day bar).
- Three handles:
  - Left handle → resize-left (mutates `start`)
  - Center → move (mutates both `start` and `due` by the same delta)
  - Right handle → resize-right (mutates `due`)
- mousedown on a handle captures the initial state. mousemove updates a preview `{cardId: {start, end}}` map (no persistence yet). mouseup commits the final preview via ONE `updateCard(listId, cardId, { due, start, dueEn: undefined, dueLate: false })` call — atomic (hard constraint).
- Clamping: `start, end ∈ [0, days-1]`. Bars that conceptually start before day 0 or end after day 29 visually clip at the gantt edge (hard constraint — CSS `clip-path` + `overflow: hidden`).
- mouseup outside the gantt grid → NO write (test asserts).

## §7 — Component API: `MapView`

```tsx
export interface MapViewProps {
  lang: "en" | "zh";
}

export function MapView(props: MapViewProps): JSX.Element;
```

**Behavior**

- Renders a static SVG (verbatim port from `module-board.jsx` lines 1056–1083) with a decorative dot pattern + 6 mock pins.
- Overlay card explains that `BoardCard.location` is not yet populated (bilingual).
- No DOM mutation; no geolocation API; no map library.

## §8 — Persistence contract

**New persistence key** (added to `@repo/plugin-web-storage` registry in P3):

| Key | Codec | Default | Owner row | Shape |
|---|---|---|---|---|
| `xai_board_view_by_id` | `json` | `{}` | xai-web-board-views (row #8 — this row) | `Record<string, BoardViewId>` keyed by `Board.id` |

Reads via `usePref("xai_board_view_by_id")`. Writes via the same hook's setter. NO migration step (default = `{}`).

Reuses existing keys from row #7:

| Key | Codec | Default | Owner row | Read | Write |
|---|---|---|---|---|---|
| `xai_boards_v2` | `json` | `null` | xai-web-board-core (row #7) | ✅ via `loadBoardsOrDefault` | ✅ (card mutations) |
| `xai_active_board` | `string` | `""` | xai-web-board-core (row #7) | ✅ via `pickActiveBoard` | ❌ (row #9 will manage) |

## §9 — Shell registration (`src/registration.tsx`)

```tsx
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { BoardModule } from "./BoardModule.js";

function BoardViewsModuleRoute(): JSX.Element {
  const { lang } = useWebShell();
  return <BoardModule lang={lang} />;
}

export const boardViewsWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "board",
  label: "Boards",
  defaultChildPath: "",
  children: [
    { path: "", render: BoardViewsModuleRoute },
    { path: "*", render: BoardViewsModuleRoute },
  ],
  icon: "kanban",
  railOrder: 3,
  i18nKey: "nav.board",
  showInRail: true,
};
```

In `apps/web/src/routes/modules/shellRegistrations.tsx`, the array line that currently reads:

```tsx
boardCoreWebModuleRegistration,  // xai-web-board-core row #7 (railOrder 3)
```

is rewritten to:

```tsx
boardViewsWebModuleRegistration,  // xai-web-board-views row #8 (railOrder 3 — supersedes board-core direct registration)
```

with a new import statement near the existing board-core import:

```tsx
// xai-web-board-views row #8 (supersedes board-core direct registration)
import { boardViewsWebModuleRegistration } from "@repo/plugin-web-board-views";
```

The existing `import { boardCoreWebModuleRegistration } from "@repo/plugin-web-board-core";` line MAY remain (board-views consumes other board-core exports). If unused after the swap, ESLint will flag it; we resolve by either removing or keeping for backward-compatibility. **Plan decision**: remove the unused-after-swap board-core registration import in the same edit to keep lint clean; row #9 will re-add when wrapping board-views.

## §10 — Drag-and-drop contracts

### Calendar view DnD

| Event | Source | dataTransfer MIME | Payload (JSON) |
|---|---|---|---|
| `dragstart` | `<button.bcc-card>` | `text/plain` (verbatim from prototype line 740) | `{ cardId: string, listId: string }` |
| `dragover` | `<div.board-cal-cell>` | (read; calls `preventDefault()`) | — |
| `drop` | `<div.board-cal-cell>` | (read; parses MIME above) | — |

**Error semantics**: malformed JSON, missing MIME, or cell without a `day` → silent no-op. Drop handler never throws (test C-D5).

### Timeline view DnD (pointer-based, not HTML5)

| Event | Source | Mechanism |
|---|---|---|
| `mousedown` | `<button.tl-handle-l>` / `.tl-handle-r>` / `.tl-bar-body>` | captures `{cardId, listId, mode: "resize-l" \| "resize-r" \| "move", initStart, initEnd, startX}` |
| `mousemove` (window) | — | computes deltaDays from `(clientX - startX) / dayWidth`; updates a preview map |
| `mouseup` (window) | — | commits via ONE `updateCard` call (atomic) OR aborts if `preview` is unset |

**Error semantics**: mouseup outside grid bounds AND no committed preview → no write (test T-D6). DOM rect 0 / NaN dayWidth → no preview update (test T-D7).

## §11 — Error semantics

| Failure mode | Behavior |
|---|---|
| `usePref("xai_board_view_by_id")` returns `null` or wrong shape | `useEffect` initializes to `{}`; missing entries default to `"board"`. |
| Active board id not in `viewByBoardId` map | Defaults to `"board"`; on first view change, an entry is created. |
| `viewByBoardId` contains an entry for a deleted board (row #9 deletion) | Tolerated — orphan entries remain. No-crash. Cleanup pass deferred to row #9. |
| Card drop with corrupted `dataTransfer` payload (Calendar) | Caught by JSON parse try/catch; drop is a no-op (test C-D5). |
| Calendar drop on an empty cell (no `day`) | Silent no-op. |
| Timeline mousedown without `card.due` parseable | Bar isn't rendered → handle isn't clickable → no-op. |
| Timeline mouseup with mousemove never having fired | No preview state → no `updateCard` call (test T-D6). |
| `card.checklist.total === 0` (Progress column / Table) | Division-by-zero guarded by `Math.max(1, total)`; bar renders at 0%. |
| Dashboard `lists.length === 0` | KPIs show 0 / 0 / 0 / 0; both bar charts render empty containers. |
| Empty `PM_LABELS` import (defensive) | Per-label chart renders empty. |

## §12 — Idempotency

| Operation | Idempotent? |
|---|---|
| `ViewPicker.onChange(activeView)` (same view) | Yes — setter writes same value; no re-render trigger. |
| Calendar drop on same day | `updateCard` writes same `due` string — no semantic change. |
| Timeline drag with zero delta | `mouseup` with `preview === undefined OR === initState` → no `updateCard` call. |
| Table Due picker → Today → Today | No semantic change; one write. |
| Table Labels toggle on → off → on | Three writes; final state matches initial — not idempotent overall but each individual write is deterministic. |

## §13 — Concurrency

Per manifest header: row #8 ships in parallel with row #9 (board-workspaces) and row #11 (dashboard-widgets). Write-scope-disjoint:

- Row #8 (this row) creates `packages/plugin-web-board-views/`; edits the `boardCoreWebModuleRegistration` array entry in `shellRegistrations.tsx`; adds workspace dep to `apps/web/package.json`; adds `xai_board_view_by_id` to `packages/plugin-web-storage/src/internal/registry.ts`.
- Row #9 creates `packages/plugin-web-board-workspaces/`; will later wrap board-views' registration (sequenced AFTER row #8 ships, per `Depends On` chain); adds its own deps + keys.
- Row #11 creates `packages/plugin-web-dashboard-widgets/`; edits a DIFFERENT array entry (`dashboardGridSlotRegistration`); adds its own deps + keys.

No file overlap on `shellRegistrations.tsx` (each row touches a different array entry / different line). `apps/web/package.json` adds happen on different lines (alphabetical sort). `packages/plugin-web-storage/src/internal/registry.ts` adds happen as distinct entries — each row appends its block. Build agents use `Edit` (not `Write`) on those shared files and retry on `git index.lock` with 8–20s exponential jitter × 5 attempts.

## §14 — Versioning

Row #8 introduces ONE new persistence key (`xai_board_view_by_id`). No schema version bump needed (registry is the shape authority). Future view additions (e.g. Burndown view) extend `BoardViewId` literal union — no breaking change to row #8 consumers, and viewer code falls back to `"board"` on unknown view ids.

## §15 — Package dependency list (final)

```jsonc
{
  "name": "@repo/plugin-web-board-views",
  "dependencies": {
    "@repo/core":                    "workspace:*",
    "@repo/plugin-web-board-core":   "workspace:*",
    "@repo/plugin-web-tokens":       "workspace:*",
    "@repo/plugin-web-storage":      "workspace:*",
    "@repo/xai-web-shell":           "workspace:*"
  },
  "peerDependencies": {
    "react":     "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config":       "workspace:*",
    "@repo/typescript-config":   "workspace:*",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react":    "^16.0.0",
    "@types/react":              "^19.0.0",
    "@types/react-dom":          "^19.0.0",
    "jsdom":                     "^26.0.0",
    "react":                     "^19.2.0",
    "react-dom":                 "^19.2.0",
    "typescript":                "5.9.2",
    "vitest":                    "^3.2.1"
  }
}
```

---

## §S15 — 2026-05-25 Extension API (gap-closure row #6 — Filter / Share / Map)

> APPEND-ONLY. Sections §0..§15 above describe the SHIPPED row #8 + bugfix-cycle-1
> surface and are NOT mutated. §S15 documents the new exports + extended
> component contracts introduced by `xai-web-board-filter-share-map`.

### §S15.0 — Extended public surface (`src/index.ts` additions)

```ts
// ---- Existing exports (§0) preserved verbatim ---------------------------

// ---- Net-new exports for gap-closure row #6 -----------------------------

// Filter helpers (consumed by board-workspaces' BoardWorkspacesModule)
export { applyFilter } from "./internal/filter.js";
export type {
  /** Predicate shape used by board-workspaces' FilterPopover. */
  FilterState,
} from "./internal/filter.js";

// Location guard (advisory — consumers may also import inline)
export { isValidLocation } from "./internal/location.js";
export type { CardLocation } from "./internal/location.js";
```

`internal/*` files remain non-importable from outside the package. Only the
2 helpers above (plus the existing MapView with its widened props) cross the
barrel.

### §S15.1 — `BoardCard.location` field (schema extension owned by `xai-web-board-core`)

```ts
// packages/plugin-web-board-core/src/types.ts — MODIFY (additive)
export interface BoardCard {
  // ... existing fields preserved ...

  /** OPTIONAL — geographic location for Map view rendering.
   *  Cards without this field render as empty-state in Map view. */
  location?: CardLocation;
}

// New type (declared in board-core; re-exported by board-views for ergonomic import)
export interface CardLocation {
  /** WGS84 latitude, -90..90. */
  lat: number;
  /** WGS84 longitude, -180..180. */
  lng: number;
  /** Optional human-readable label rendered in the pin popup. */
  label?: string;
}
```

Backwards compat: existing `xai_boards_v2` data has every card with
`location === undefined`. The widened `isBoardCard` guard accepts both shapes.
No migration. No registry edit.

### §S15.2 — `applyFilter` pure helper

```ts
// packages/plugin-web-board-views/src/internal/filter.ts (NEW)

export interface FilterState {
  /** Empty Set = no label filter (all labels pass). */
  labels: ReadonlySet<string>;
  /** Empty Set = no member filter (all members pass). */
  members: ReadonlySet<string>;
  /** 'all' = no due filter. */
  dueRange: 'all' | 'overdue' | 'today' | 'week';
}

export const EMPTY_FILTER: FilterState = Object.freeze({
  labels: new Set(),
  members: new Set(),
  dueRange: 'all',
});

/** Pure helper. Returns a new BoardListData[] where each list's cards are
 *  filtered by the predicate. Lists are preserved (empty lists OK). */
export function applyFilter(
  lists: readonly BoardListData[],
  filter: FilterState,
): BoardListData[];
```

**Predicate semantics** (AND between facets, OR within each facet):

- A card passes the `labels` facet if `filter.labels.size === 0` OR
  `card.labels?.some(l => filter.labels.has(l))` is true.
- A card passes the `members` facet if `filter.members.size === 0` OR
  `card.members?.some(m => filter.members.has(m))` is true.
- A card passes the `dueRange` facet:
  - `'all'` — always pass
  - `'overdue'` — `card.dueLate === true`
  - `'today'` — `card.due === 'Today' || card.due === '今天' || card.due === \`${m}/${d}\`` (m/d = today)
  - `'week'` — `card.due` parseable into [today, today+7) range (uses `parseDay` from existing `dateOps.ts`)

Determinism: pure; no `Date.now()` inside `applyFilter` (current date is
injected by the caller via a small `now?: Date` parameter for testability —
default `new Date()`).

### §S15.3 — `isValidLocation` guard

```ts
// packages/plugin-web-board-views/src/internal/location.ts (NEW)

export function isValidLocation(loc: unknown): loc is CardLocation;
```

Rejects: `null` / `undefined` / non-object / missing `lat` / missing `lng` /
non-finite `lat` / non-finite `lng` / `Math.abs(lat) > 90` / `Math.abs(lng) > 180`.
Accepts: `{ lat: number; lng: number }` and `{ lat, lng, label }`.

### §S15.4 — `MapView` extended props (REWRITE — was placeholder)

```tsx
import type { BoardListData, BoardCardData } from "@repo/plugin-web-board-core";
import type { Lang } from "./internal/i18n.js";

export interface MapViewProps {
  lists: readonly BoardListData[];
  lang: Lang;
  /** Optional callback when a pin is clicked. Receives (cardId, listId). */
  onSelectCard?: (cardId: string, listId: string) => void;
}

export const MapView: React.LazyExoticComponent<React.ComponentType<MapViewProps>>;
```

**Behavior**

- Lazy-loaded via `React.lazy(() => import("./MapView.js"))` at the index.ts
  re-export seam (Suspense boundary lives in the consumer — `BoardModule` and
  `BoardWorkspacesModule`).
- On mount: dynamically imports `leaflet` + `leaflet/dist/leaflet.css`,
  initialises `L.map(containerRef.current)`, sets tile layer
  `L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 })`.
- Filters `lists.flatMap(l => l.cards.map(c => ({ card: c, listId: l.id })))`
  through `isValidLocation(card.location)`.
- Renders one `L.marker([loc.lat, loc.lng])` per valid card; binds a popup
  with `card.title[lang]` + `loc.label`.
- On marker click: calls `onSelectCard?.(card.id, listId)`.
- `fitBounds` to all pins (with 50px padding) if ≥1; else `setView([0,0], 2)` (world view) + empty-state overlay copy.
- Cleanup: `useEffect` return calls `map.remove()` to dispose Leaflet instance + listeners.
- Empty-state copy bilingual:
  - en: `"No cards have a location yet. Add a location to a card to see it on the map."`
  - zh: `"没有卡片设置了位置。在卡片上添加位置后即可在地图上看到。"`

### §S15.5 — Error semantics (Map view)

| Failure mode | Behavior |
|---|---|
| `leaflet` dynamic import fails (network / CSP block) | Lazy `<Suspense>` catches; ErrorBoundary fallback shows bilingual "Map failed to load." text; no crash |
| `lists` empty OR no card has valid `location` | Empty-state overlay (per §S15.4); blank map tile background still renders |
| `card.location` is malformed (NaN / out-of-range) | Filtered out by `isValidLocation`; no error; card silently omitted from Map |
| `card.location.lng === 180` / `lat === -90` (edge of valid range) | Accepted (inclusive bounds); marker placed at the edge |
| Tile fetch fails (network) | Leaflet's internal retry; grey tile placeholder visible; no crash |
| CSP blocks tile origin | Browser console error visible; tiles fail to render but map UI is intact |

### §S15.6 — Concurrency

Filter / Share / Map all run within a single React render tree. No new cross-window event surface. The single new `web:board:share-requested` channel is emitted in-process (board-workspaces fires; declaration-only — no consumer in this row).

### §S15.7 — Versioning

`BoardCard.location` is additive; bumps no schema version. `xai_boards_v2` registry stays at v1 (registry is the shape authority; no migration). MapView's lazy chunk is a separate Vite asset — version-locked to the package.

### §S15.8 — Dependency additions

```jsonc
{
  "name": "@repo/plugin-web-board-views",
  "dependencies": {
    // ... existing deps preserved ...
    "leaflet":                    "^1.9.4"
  },
  "devDependencies": {
    // ... existing deps preserved ...
    "@types/leaflet":             "^1.9.x"
  }
}
```

Exact `^1.9.x` micro pinned by the build executor at P5 install time; current latest stable is 1.9.4 (verified 2026-05).

