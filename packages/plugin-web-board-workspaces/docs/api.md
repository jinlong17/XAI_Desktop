# API Contract — xai-web-board-workspaces

> Public surface + persistence narrowing contract for row #9.

## §0. Public surface (`packages/plugin-web-board-workspaces/src/index.ts`)

The ONLY allowed import path is `@repo/plugin-web-board-workspaces`. Never import from `src/internal/*`.

```ts
// Side-effect CSS
import "./styles.css";

// ----- Re-exports passed through from @repo/plugin-web-board-core -----
// Schemas (data-only aliases so the component identifiers stay primary)
export type {
  Board,
  BoardCardData,   // alias of board-core's `BoardCard` schema type
  BoardListData,   // alias of board-core's `BoardList` schema type
  BoardListColorId,
  BoardTemplate,
  BoardWorkspace,
  BilingualText,
  CardChecklist,
} from "@repo/plugin-web-board-core";

export {
  LIST_COLOR_IDS,
  LIST_COLOR_PALETTE,
  BOARD_TEMPLATES,
  DEFAULT_WORKSPACES,
  PM_LABELS,
  makeDefaultBoards,
  isBoard,
  isBoardArray,
  isBoardCard,
  isBoardList,
  loadBoardsOrDefault,
  pickActiveBoard,
} from "@repo/plugin-web-board-core";

export type { BoardLabel, BoardTemplateOption } from "@repo/plugin-web-board-core";

// ----- This row's own surface -----

// Schemas net-new in this row
export type {
  BoardPanelStateShape,
  InboxCardShape,
  RingSegment,
} from "./internal/types.js";

// Narrowing guards (boundary narrowing for the two opaque registry slots)
export {
  isBoardPanelState,
  isInboxCardArray,
} from "./internal/guards.js";

// Pure helpers (testable without React)
export {
  computeRingSegments,
  computeDonePct,
  loadPanelsOrDefault,
  loadInboxOrDefault,
  togglePanelInvariant,
} from "./internal/panelOps.js";

// React leaf components
export { BoardSwitcher } from "./BoardSwitcher.js";
export type { BoardSwitcherProps } from "./BoardSwitcher.js";

export { BoardCreator } from "./BoardCreator.js";
export type { BoardCreatorProps } from "./BoardCreator.js";

export { StatusOverviewBanner } from "./StatusOverviewBanner.js";
export type { StatusOverviewBannerProps } from "./StatusOverviewBanner.js";

export { InboxPanel } from "./InboxPanel.js";
export type { InboxPanelProps } from "./InboxPanel.js";

export { PlannerPanel } from "./PlannerPanel.js";
export type { PlannerPanelProps } from "./PlannerPanel.js";

// Top-level orchestrator
export { BoardWorkspacesModule } from "./BoardWorkspacesModule.js";
export type { BoardWorkspacesModuleProps } from "./BoardWorkspacesModule.js";

// Shell slot registration
export { boardWorkspacesWebModuleRegistration } from "./registration.js";
```

## §1. Persistence narrowing contract

This row consumes 4 storage keys (all already SHIPPED in `@repo/plugin-web-storage`'s registry):

| Key | Registry type | This row's narrowed shape | Default fallback |
|---|---|---|---|
| `xai_boards_v2` | `BoardsState = unknown` | `Board[]` (via board-core's `isBoardArray`) | `makeDefaultBoards()` |
| `xai_active_board` | `string` (default `""`) | `string` (the active board's `id`) | `"b-default"` if empty AND `boards` contains it; else `boards[0].id` |
| `xai_board_panels` | `BoardPanelState[]` of `unknown` (default `[]`) | `BoardPanelStateShape = { inbox: boolean; planner: boolean; board: boolean }` | `{ inbox: false, planner: false, board: true }` |
| `xai_board_inbox` | `InboxCard[]` of `unknown` (default `[]`) | `InboxCardShape[]` where `InboxCardShape = { id: string; text: { en: string; zh: string } }` | the 3-item seed inbox from `module-board.jsx:106..110` |

### Read protocol — `xai_board_panels`

`loadPanelsOrDefault(raw: unknown): BoardPanelStateShape` accepts BOTH:

- `raw = [<object>]` (length-1 array containing the object) — the canonical form we write
- `raw = <object>` (bare object) — for forward compat with prototype's `setItem(..., JSON.stringify(panels))`
- `raw = []` or `raw = null` or `raw = undefined` or `raw = "garbage"` → fall back to `{ inbox: false, planner: false, board: true }`

Validity check: the narrowed object must have all three keys present as `boolean`; if ANY of the three is missing or not a boolean, fall back. After narrowing, enforce the multi-panel invariant: if `!o.inbox && !o.planner && !o.board`, return `{ inbox: false, planner: false, board: true }`.

### Write protocol — `xai_board_panels`

Always write `[<object>]` (length-1 array). The `usePref` setter receives the array. This satisfies the registry's `BoardPanelState[]` default-array nature without a registry edit.

### Read protocol — `xai_board_inbox`

`loadInboxOrDefault(raw: unknown): InboxCardShape[]` accepts:

- `raw` is `Array.isArray(raw)` AND every element has `id: string` AND `text: { en: string; zh: string }` → return as-is.
- Anything else → fall back to seed:
  ```ts
  [
    { id: "ix1", text: { en: "Capture from email, Slack, and Teams", zh: "从邮件 / Slack / Teams 捕获" } },
    { id: "ix2", text: { en: "Dive into Trello basics", zh: "了解项目板基础" } },
    { id: "ix3", text: { en: "See it, send it, save it for later", zh: "看到了就发到收件箱" } },
  ]
  ```

### Write protocol — `xai_board_inbox`

Always write the typed array. Items are prepended (Inbox composer adds new items at the head, matching `setCards(cs => [{...new}, ...cs])` on `module-board.jsx:1178`).

## §2. Multi-panel layout contract

```
+----------------------------------------------------+
| header (workspace chip + title btn + view-picker + |
|         total-count + members + overview btn + ... |
+----------------------------------------------------+
| StatusOverviewBanner  (only if isPM && overviewOpen|
|                       && view==="board" && panels.board) |
+----------------------------------------------------+
| .board-panels.board-panels-single | -multi         |
|                                                    |
|  [InboxPanel 260px]? [PlannerPanel 320px]? [Board] |
|                                                    |
+----------------------------------------------------+
| .board-view-switcher  (4 buttons, fixed bottom row)|
|  [Inbox] [Planner] [Board]  | [Switch boards]      |
+----------------------------------------------------+
```

Class on `.board-panels`:
- if `openCount(panels) === 1` → `board-panels-single`
- else → `board-panels-multi`

Where `openCount(p) = (p.inbox ? 1 : 0) + (p.planner ? 1 : 0) + (p.board ? 1 : 0)`.

Per-panel mount predicate:
- `panels.inbox === true` → mount `<InboxPanel>`
- `panels.planner === true` → mount `<PlannerPanel>`
- `panels.board === true` → mount `<div className="board-main-panel"><BoardView … /></div>`

CSS:
- `.board-panels-single .board-main-panel { width: 100%; }` etc.
- `.board-panels-multi .inbox-panel { flex: 0 0 260px; }`
- `.board-panels-multi .planner-panel { flex: 0 0 320px; }`
- `.board-panels-multi .board-main-panel { flex: 1 1 0; min-width: 0; }`

## §3. PM Status Overview ring math contract

```ts
interface RingSegment {
  /** stable list id from Board.lists[].id */
  listId: string;
  /** bilingual display label (list.customName?.[lang] || list.key fallback) */
  label: string;
  /** count of cards in this list (must be > 0 to appear in segments) */
  count: number;
  /** resolved CSS color string (OKLCH value from LIST_COLOR_PALETTE or fallback "var(--accent)") */
  color: string;
}

function computeRingSegments(lists: readonly BoardList[], lang: "en" | "zh"): RingSegment[];
function computeDonePct(lists: readonly BoardList[]): number;
```

- `computeRingSegments` returns ONLY lists with `cards.length > 0` (matches `lists.filter(l => l.cards.length > 0)` on `module-board.jsx:1427`).
- `computeDonePct` returns `Math.round(100 * done / total)` where `done = (lists.find(l => /done|完成/.test((l.customName?.en ?? "") + " " + (l.customName?.zh ?? "")))?.cards.length ?? 0)` and `total = lists.reduce((n,l)=>n+l.cards.length, 0)`. If `total === 0`, returns `0`.
- Both helpers are pure / referentially transparent — no `Date.now()`, no `Math.random()`.

Rendering in `StatusOverviewBanner.tsx`:
```ts
const r = 44;
const c = 2 * Math.PI * r;
let acc = 0;
const total = segs.reduce((n, s) => n + s.count, 0);
const sum = total || 1;
// for each seg: len = (seg.count / sum) * c; offset = c - acc; acc += len
// strokeDasharray = `${len} ${c - len}`, strokeDashoffset = offset, transform = "rotate(-90 60 60)"
```

## §4. BoardSwitcher component API

```ts
interface BoardSwitcherProps {
  lang: "en" | "zh";
  workspaces: readonly BoardWorkspace[];
  boards: readonly Board[];
  activeBoardId: string;
  onPick: (boardId: string) => void;
  onCreate: () => void;
  onDelete: (boardId: string) => void;
  onClose: () => void;
}
```

Behavior:
- Search input (`<input autoFocus>`) filters by `b.name[lang].toLowerCase().includes(filter.toLowerCase())`.
- Scope tabs: "All" + one tab per workspace. Each tab is `aria-selected={scope === id}`.
- Body: groups `filtered` by `workspaceId`, renders only non-empty groups.
- Each `bs-card` renders cover (gradient), template icon (`kanban` for "pm", `list` for "kanban"), name, card count.
- Delete affordance visible iff `b.id !== activeBoardId` AND `groupedByWs.flatMap(g => g.boards).length > 1` (delete-affordance rule from R8). Uses `window.confirm`.
- "+ New board" button calls `onCreate()` (parent transitions to creator modal).
- Empty state when `filtered.length === 0`: bilingual "No matching boards." / "没有匹配的看板。"

## §5. BoardCreator component API

```ts
interface BoardCreatorProps {
  lang: "en" | "zh";
  workspaces: readonly BoardWorkspace[];
  onCancel: () => void;
  /** Called when user clicks "Create". The board's lists come from BOARD_TEMPLATES[tplId].lists(). */
  onCreate: (templateId: BoardTemplate, name: string, workspaceId: string) => void;
}
```

Behavior:
- Template picker (3 cards): one per `BOARD_TEMPLATES` entry. Initial selection: `"pm"` (matches prototype line 1372).
- Name field with default `"New board"` / `"新看板"` (prototype line 1374).
- Workspace `<select>` with options from `workspaces`; default = `workspaces[0].id`.
- Footer: ghost "Cancel" + primary "Create". On click "Create", `name.trim() || (lang === "zh" ? "新看板" : "New board")` is passed as name.

## §6. StatusOverviewBanner component API

```ts
interface StatusOverviewBannerProps {
  lists: readonly BoardList[];
  lang: "en" | "zh";
  onClose?: () => void;  // optional — prototype's banner has no built-in close; parent controls overviewOpen
}
```

Rendering: SVG `viewBox="0 0 120 120"` 148×148, ring radius 44, stroke width 14, base circle stroke `var(--border-1)`, segment circles per `RingSegment[]`. Center label = `donePct + "%"` + bilingual "Done" / "已完成". Right legend: each segment + dot + count + bilingual "Total" / "总计" row.

## §7. InboxPanel component API

```ts
interface InboxPanelProps {
  cards: readonly InboxCardShape[];
  setCards: (updater: (prev: InboxCardShape[]) => InboxCardShape[]) => void;
  lang: "en" | "zh";
}
```

Behavior:
- Header: inbox icon + bilingual "Inbox" / "收件箱" + count badge + (no-op filter/dots buttons rendered for visual parity).
- Composer: single input; on Enter, prepend `{ id: "ix-" + Date.now().toString(36), text: { en: text, zh: text } }`; clear input.
- Body: render `cards`. Each card has text + (no-op mail/list metadata icons) + remove button. Remove calls `setCards(cs => cs.filter(c => c.id !== id))`.
- Empty state: bilingual "Inbox is empty" / "收件箱为空".

## §8. PlannerPanel component API

```ts
interface PlannerPanelProps {
  lists: readonly BoardList[];
  lang: "en" | "zh";
  /** Optional now-injection for deterministic tests. Defaults to new Date(). */
  now?: Date;
  /** Optional click handler. v1 may render the slot button non-interactive (out of scope for #9). */
  onOpenCard?: (cardId: string, listId: string) => void;
}
```

Behavior:
- Header: calendar icon + bilingual "Planner" / "计划" + (no-op dots button).
- Date row: bilingual locale-aware "May 23, Fri" / "5月23日 周五".
- Body: 12 rows for hours 8..19 (8am–7pm). Each row has hour label (mono, `8a`/`12p` etc.) + slot.
- Slot seeding: flatten cards from `lists`, filter to cards with `due === "Today" / "今天" / ${m}/${d}` (where m/d come from `now`). Map first 6 to slots at `9 + i*2`-hour boundaries, cycling colors `["green", "blue", "amber", "purple"]`.
- If no due-today cards exist, render 3 sample slots: `{ label: "Deep focus"/"专注", hour: 9, dur: 60, color: "green" }` + `{ label: "Review"/"复盘", hour: 11, dur: 30, color: "amber" }` + `{ label: "Walk"/"散步", hour: 14, dur: 30, color: "blue" }`.
- Each rendered slot button has class `pl-event pl-color-<color>` and the row's hour label format.
- v1 click handler: if `onOpenCard` is provided and the slot has a real `card`, call it; else no-op.

## §9. BoardWorkspacesModule (top-level orchestrator) API

```ts
interface BoardWorkspacesModuleProps {
  lang: "en" | "zh";
}
```

Behavior:
- `const [boardsRaw, setBoardsRaw] = usePref("xai_boards_v2");` narrowed via `loadBoardsOrDefault(boardsRaw)` to `Board[]`.
- `const [activeBoardId, setActiveBoardId] = usePref("xai_active_board");` resolved via `pickActiveBoard(boards, activeBoardId)`.
- `const [panelsRaw, setPanelsRaw] = usePref("xai_board_panels");` narrowed via `loadPanelsOrDefault` to `BoardPanelStateShape`.
- `const [inboxRaw, setInboxRaw] = usePref("xai_board_inbox");` narrowed via `loadInboxOrDefault` to `InboxCardShape[]`.
- Setters wrap: `setPanels = (next) => setPanelsRaw([next])`; `setInbox = (updater) => setInboxRaw(updater(inbox))`.
- Local state: `switcherOpen`, `createOpen`, `overviewOpen`, plus the board-core kanban view state (`draftListIdx`, `composerText`, `showListComposer`, `newListName`, `listMenu`).
- Header renders (per `module-board.jsx:174..229`):
  - Workspace chip (`activeWorkspace.color` background, first 2 chars of name)
  - Title button (opens `BoardSwitcher`)
  - View-picker (renders, dropdown is a no-op stub showing only the current `"board"` view — full picker deferred to #8)
  - Total card count
  - Members chips (no-op visual parity — `MOCK.boardMembers` is NOT imported; render empty `<div className="board-members">` until a future row provides typed members)
  - Overview toggle button (only enabled when `isPM === true`)
  - Filter / Share / Dots buttons (no-op visual parity)
- Canvas:
  - `<StatusOverviewBanner>` rendered iff `isPM && overviewOpen && view === "board" && panels.board`
  - `<div className={"board-panels board-panels-" + (openCount === 1 ? "single" : "multi")}>` with the 1..3 panel children per §2
- Bottom switcher: 4 buttons (Inbox / Planner / Board / Switch boards). First 3 call `togglePanel(key)`; the 4th opens `BoardSwitcher`.
- Modals: `BoardSwitcher` (when `switcherOpen`) + `BoardCreator` (when `createOpen`).
- `createBoard(templateId, name, workspaceId)`:
  ```ts
  const tpl = BOARD_TEMPLATES.find(t => t.id === templateId);
  if (!tpl) return;
  const newId = "b-" + Date.now().toString(36);
  setBoardsRaw(bs => [...bs, { id: newId, workspaceId, name: { en: name, zh: name }, cover: tpl.cover, template: templateId, lists: tpl.lists() }]);
  setActiveBoardId(newId);
  setCreateOpen(false);
  setSwitcherOpen(false);
  ```
- `deleteBoard(id)`:
  ```ts
  setBoardsRaw(bs => {
    const remaining = bs.filter(b => b.id !== id);
    if (id === activeBoardId && remaining[0]) setActiveBoardId(remaining[0].id);
    return remaining.length ? remaining : makeDefaultBoards();
  });
  ```
- Setting `setLists(updater)` (for in-Board edits delegated to `BoardView`):
  ```ts
  setBoardsRaw(bs => bs.map(b => b.id === activeBoardId
    ? { ...b, lists: typeof updater === "function" ? updater(b.lists) : updater }
    : b));
  ```

## §10. boardWorkspacesWebModuleRegistration API

```ts
export const boardWorkspacesWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "board",
  label: "Boards",
  defaultChildPath: "",
  children: [
    { path: "", render: BoardModuleRouteAdapter },
    { path: "*", render: BoardModuleRouteAdapter },
  ],
  icon: "kanban",
  railOrder: 3,
  i18nKey: "nav.board",
  showInRail: true,
};
```

Where `BoardModuleRouteAdapter` is a small wrapper: `() => { const { lang } = useWebShell(); return <BoardWorkspacesModule lang={lang} />; }`.

## §11. Error semantics + idempotency

- **Narrowing rejection** — any malformed value at the storage boundary is silently replaced with the seed default and the next write persists the seed. Matches board-core's behavior on `xai_boards_v2 = "garbage"`.
- **Empty `boards` array** — `BoardWorkspacesModule` defends with `if (boards.length === 0) setBoardsRaw(makeDefaultBoards())` once on mount (matches prototype line 79 fallback + row #7 Rec2). Idempotent: subsequent renders see the seed and don't re-set.
- **Concurrent `setBoardsRaw`** — `usePref` is a single-window React hook with cross-tab `storage` event sync (board-core verifies this in BM4). Workspaces inherits the same behavior; no extra concurrency primitives.
- **Multi-panel invariant violation** — impossible by construction: `togglePanelInvariant(prev, key)` is the only writer and it forces `board = true` whenever the toggle would leave all three false.

## §12. Versioning

Schema version 1 for this row. Owned `xai_board_panels` + `xai_board_inbox` registry entries are already `schemaVersion: 1`. If we ever need to evolve `BoardPanelStateShape` (e.g. add a 4th panel), bump the registry's `schemaVersion` AND add a migration in `@repo/plugin-web-storage/src/internal/migrate.ts` — out of scope for this row.

## §13. Concurrency notes

- W2e siblings: #9 (this row) + #8 (board-views) + #11 (dashboard-widgets) — write-scope disjoint:
  - This row: `packages/plugin-web-board-workspaces/` (new) + shellRegistrations.tsx lines 34..35 + 65 + apps/web/package.json (+1 dep line)
  - #8: `packages/plugin-web-board-views/` (new) + (no shellRegistrations.tsx edit — #8 may export view components that #9 will consume via context once both land, OR #8 may register itself as a sub-route; planner for #8 owns that decision)
  - #11: `packages/plugin-web-dashboard-widgets/` (new) + shellRegistrations.tsx line OTHER than 65 (different rail entry)
- Retry `git index.lock` 8–20s × 5 if concurrent siblings are mid-commit.

## §14. Dependencies

```jsonc
{
  "peerDependencies": {
    "react":     "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@repo/core":                       "workspace:*",
    "@repo/plugin-web-board-core":      "workspace:*",
    "@repo/plugin-web-tokens":          "workspace:*",
    "@repo/plugin-web-storage":         "workspace:*",
    "@repo/xai-web-shell":              "workspace:*"
  },
  "devDependencies": {
    "@repo/eslint-config":      "workspace:*",
    "@repo/typescript-config":  "workspace:*",
    "@testing-library/jest-dom":"^6.0.0",
    "@testing-library/react":   "^16.0.0",
    "@types/react":             "^19.0.0",
    "@types/react-dom":         "^19.0.0",
    "jsdom":                    "^26.0.0",
    "react":                    "^19.2.0",
    "react-dom":                "^19.2.0",
    "typescript":               "5.9.2",
    "vitest":                   "^3.2.1"
  }
}
```

---

## §S15 — 2026-05-25 Extension API (gap-closure row #6 — Filter + Share)

> APPEND-ONLY. **Canonical extension spec lives in
> `packages/xai-web-board-views/docs/api.md §S15`.** This section documents
> only the surface added to THIS package.

### §S15.0 — Extended public surface (`src/index.ts` additions)

```ts
// ---- Existing exports (§0) preserved verbatim ---------------------------

// ---- Net-new exports for gap-closure row #6 -----------------------------

export { FilterPopover } from "./FilterPopover.js";
export type { FilterPopoverProps } from "./FilterPopover.js";

export { ShareModal } from "./ShareModal.js";
export type { ShareModalProps } from "./ShareModal.js";

// FilterState re-exported from board-views for ergonomic import-site usage
export type { FilterState } from "@repo/plugin-web-board-views";
```

### §S15.1 — `FilterPopover` component API

```tsx
import type { BoardCardData, BoardListData } from "@repo/plugin-web-board-core";
import type { FilterState } from "@repo/plugin-web-board-views";

export interface FilterPopoverProps {
  lists: readonly BoardListData[];
  filter: FilterState;
  onChange: (next: FilterState) => void;
  onClose: () => void;
  lang: "en" | "zh";
}

export function FilterPopover(props: FilterPopoverProps): JSX.Element;
```

**Behavior**

- Positioned absolutely below the Filter button (parent provides anchor via CSS).
- Three facets rendered as sections:
  - Labels — checkboxes for each label found across `lists.flatMap(l=>l.cards).flatMap(c=>c.labels ?? [])` deduped + sorted.
  - Members — checkboxes for each member id found across `lists.flatMap(l=>l.cards).flatMap(c=>c.members ?? [])` deduped + sorted.
  - Due Range — radio group `all` / `overdue` / `today` / `week` bilingual.
- "Clear" button → calls `onChange(EMPTY_FILTER)`.
- ESC closes (handler attached to `window`).
- Outside-click closes (refs + window mousedown).
- `aria-expanded` on the button (managed in parent).
- Bilingual via inline ternaries.

### §S15.2 — `ShareModal` component API

```tsx
import type { Board } from "@repo/plugin-web-board-core";

export interface ShareModalProps {
  board: Board;
  lang: "en" | "zh";
  onClose: () => void;
}

export function ShareModal(props: ShareModalProps): JSX.Element;
```

**Behavior**

- Native `<dialog>` opened with `.showModal()` on mount; closed with `.close()` on `onClose`.
- Body: heading "Share board" / "分享看板" + read-only `<input>` with the URL + Copy button + Close button.
- URL generated via `generateShareUrl(board.id)` (async — `SubtleCrypto.digest`). Renders `Generating…` text while pending.
- Copy button: `navigator.clipboard.writeText(url)` → success: button text flips to `"Copied!"` / `"已复制"` for 2 seconds. Failure: silent (fallback `execCommand('copy')` attempted in legacy browsers).
- **Emit-before-close**: when the user clicks Close (or backdrop / ESC), the modal calls `emitWebEvent('web:board:share-requested', { boardId: board.id, url, source: 'header' })` BEFORE calling `dialog.close()` and BEFORE `onClose()`.
- Backdrop click closes when `event.target === dialogRef.current` (REC-2 of row #5).

### §S15.3 — `generateShareUrl` helper

```ts
// packages/plugin-web-board-workspaces/src/internal/shareUrl.ts (NEW)

/** Deterministic; non-exploitable; pure when SubtleCrypto is reachable.
 *  Returns Promise<string> like "https://xai-web.example/share/a1b2c3d4". */
export function generateShareUrl(boardId: string): Promise<string>;
```

**Algorithm:**
1. Encode `boardId` as UTF-8 bytes.
2. `crypto.subtle.digest('SHA-256', bytes)`.
3. Take first 4 bytes → render as 8 hex chars.
4. Compose `\`https://xai-web.example/share/${hex8}\``.

**Fallback** (when `crypto.subtle` is unavailable — should not happen in jsdom 26 / modern browsers): return `\`https://xai-web.example/share/${boardId.slice(0, 8)}\`` (deterministic but reversible). Test SU-6 covers this branch.

### §S15.4 — Extended `BoardWorkspacesModule` (existing component — MODIFY)

The component gains:

- `const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);`
- `const [shareOpen, setShareOpen] = useState(false);`
- `const [filterOpen, setFilterOpen] = useState(false);`
- `useEffect(() => { setFilter(EMPTY_FILTER); }, [activeBoard.id]);`
- Filter button: `onClick={() => setFilterOpen(o => !o)}`; `aria-expanded={filterOpen}`; `disabled` removed.
- Share button: `onClick={() => setShareOpen(true)}`; `disabled` removed.
- `const filteredLists = applyFilter(lists, filter);` — passed to BoardView + each alt view (in place of raw `lists`).
- Mount `<FilterPopover />` when `filterOpen`.
- Mount `<ShareModal />` when `shareOpen`.

NO breaking change to existing 18 BoardWorkspacesModule tests (`filter` defaults to `EMPTY_FILTER` → `applyFilter` is identity).

### §S15.5 — New EventMap entry (declared in `@repo/core/types/events.ts`)

```ts
// packages/core/src/types/events.ts — MODIFY (add after web:dashboard:widget-added)

/** Board share URL generated (owner: xai-web-board-filter-share-map gap-closure row #6) */
'web:board:share-requested': {
  /** Board id whose share URL was generated. */
  boardId: string;
  /** Generated share URL (mock — no backend; deterministic SHA-256 hash). */
  url: string;
  /** Where the action originated. v1 closed union: 'header'. */
  source: 'header';
};
```

No consumer wired in this row (declaration-only — mirrors row #5 precedent).

### §S15.6 — Error semantics (this row's deltas)

| Failure mode | Behavior |
|---|---|
| `applyFilter` called with non-array `lists` | Returns `[]`; no throw (defensive). |
| `FilterState.labels` contains an id not present on any card | Filter excludes everything — empty result; no crash. |
| `generateShareUrl` invoked when `crypto.subtle === undefined` | Falls back to `boardId.slice(0,8)`; logged as `console.warn` once. |
| `navigator.clipboard.writeText` throws (insecure context / permission) | Silently caught; Copy button does NOT flip to "Copied!"; tested. |
| `<dialog>` not supported (legacy browsers) | Per row #5 R4 — Baseline 2022; deferred to that ADR-level analysis. |
| Filter applied while a card is being mid-drag (Calendar DnD / Timeline DnD) | Card movement writes back to SOURCE list via `updateCard` (delegates to `updateCardInList`); filter is recomputed on next render. No orphan state. |

## §S16 — 2026-06-03 Extension API (Project module row #14 — Automation Lite)

> Canonical row docs live in `packages/xai-web-board-automation-lite/docs/`.

`BoardWorkspacesModule` now wires Board Automation Lite through board-core's
public helper:

- browser-local daily mount pass per active board/day
- toolbar command `data-testid="automation-run-btn"` for manual preset reruns
- cross-list move path runs completion automation with `sortDueDates: false`
- writes continue through `preserveBoardStorageFormat(rawBoards, nextBoards)`

No automation settings key, backend scheduler, notification channel, or custom
rule builder is introduced.

## §S17 — 2026-06-03 Extension API (Project module row #15 — Board integrations)

> Canonical row docs live in `packages/xai-web-board-integrations/docs/`.

`BoardCardDetailSurface` now exposes integration-backed attachment creation:

- provider select: `data-testid="card-detail-integration-provider"`
- provider catalog comes from `@repo/plugin-web-board-core`
- Add link uses `createBoardIntegrationAttachment()`
- added links persist through existing `BoardCard.attachments[]`
- integration-backed links render provider labels in the attachment list

No Settings OAuth pref is read by Board in this row. The UI creates typed
external links only; it does not sync provider data.

## §S18 — 2026-06-03 Extension API (Project module row #16 — Comments/activity)

> Canonical row docs live in `packages/xai-web-board-comments-activity/docs/`.

`BoardCardDetailSurface` now treats the bottom timeline as "Comments &
Activity":

- comment input still uses `data-testid="card-detail-activity-input"`
- add button uses `data-testid="card-detail-activity-add"`
- submitted rows are stored as `kind: "comment"` entries
- local author metadata is stored as `authorId: "local-user"` and localized
  `authorName`
- existing `kind: "note"` entries render with a Note badge

Mentions, notifications, editing, and deleting comments are not implemented in
this row.

## §S19 — 2026-06-03 Extension API (Project module row #17 — Board permissions)

> Canonical row docs live in `packages/xai-web-board-permissions/docs/`.

`BoardWorkspacesModule` now wires local Board visibility:

- header toggle: `data-testid="board-visibility-toggle"`
- legacy boards render as `Private` / `私有`
- clicking toggles `private` ⇄ `shared`
- writes continue through
  `preserveBoardStorageFormat(rawBoards, nextBoards)` to `xai_boards_v2`
- no extra preference key is introduced

`ShareModal` now requires:

```ts
visibility: BoardVisibility;
```

The modal displays:

- permission note: `data-testid="sm-permission-note"`
- visibility note: `data-testid="sm-visibility-note"`

`createMockBoardShareEnvelope(boardId, visibility)` and
`web:board:share-requested` both include `visibility`. This is still a mock
share contract, not a backend ACL or invite grant.
