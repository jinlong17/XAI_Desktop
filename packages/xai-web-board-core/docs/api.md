# API Contract — xai-web-board-core

> Runtime package: `@repo/plugin-web-board-core` (`packages/plugin-web-board-core/`)
> Public surface: `src/index.ts` ONLY. All consumers (apps/web, future rows #8/#9) import from `@repo/plugin-web-board-core`.

## §0 — Public surface (`src/index.ts` exports)

```ts
// ---- Types ---------------------------------------------------------------
// NOTE: `BoardCard` / `BoardList` identifiers are reserved for the React
// component exports. Schema-type interfaces are re-exported under
// `BoardCardData` / `BoardListData` aliases to disambiguate.
export type {
  Board,
  BoardList as BoardListData,
  BoardCard as BoardCardData,
  BoardListColorId,
  BoardTemplate,
  BoardWorkspace,
  CardChecklist,
  BilingualText,
} from "./types.js";

// ---- Constants -----------------------------------------------------------
export { LIST_COLOR_IDS, LIST_COLOR_PALETTE } from "./internal/listColors.js";

// ---- Guards --------------------------------------------------------------
export { isBoardArray, isBoard, isBoardList, isBoardCard } from "./internal/isBoardArray.js";

// ---- Seed (typed; used at first run or after registry returns null) ------
export { makeDefaultBoards, DEFAULT_WORKSPACES, BOARD_TEMPLATES, PM_LABELS } from "./internal/seed/board-data.js";

// ---- Pure helpers (re-exported for #8 / #9 reuse) ------------------------
export {
  moveCardToList,
  addCardToList,
  addNewList,
  setListColor,
  updateCardInList,
} from "./internal/boardOps.js";

// ---- React components ----------------------------------------------------
export { BoardModule } from "./BoardModule.js";
export type { BoardModuleProps } from "./BoardModule.js";
export { BoardView } from "./BoardView.js";
export type { BoardViewProps } from "./BoardView.js";

// ---- Shell slot registration --------------------------------------------
export { boardCoreWebModuleRegistration } from "./registration.js";

// ---- Board export/import data contract (row #13) -------------------------
export {
  BOARD_EXPORT_PAYLOAD_KIND,
  BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION,
  createBoardExportPayload,
  readBoardExportPayload,
  boardImportStorageValueFromPayload,
} from "./internal/exportImport.js";

// ---- Side-effect CSS imports --------------------------------------------
import "./styles.css";
```

**Hard rule**: Never import from `@repo/plugin-web-board-core/src/internal/*`. Consumers that need to internal internals should request the symbol be promoted to `index.ts` via a code review.

## §1 — Component API: `BoardModule`

```tsx
export interface BoardModuleProps {
  /** Bilingual language toggle. */
  lang: "en" | "zh";
}

export function BoardModule(props: BoardModuleProps): JSX.Element;
```

**Behavior**

- Reads `boards` from `usePref("xai_boards_v2")` (narrowed via `isBoardArray`; falls back to `makeDefaultBoards()` if null or fails guard).
- Reads `activeBoardId` from `usePref("xai_active_board")`; defaults to `boards[0].id` if empty / unknown.
- Maintains in-memory state: `draftListIdx`, `composerText`, `showListComposer`, `newListName`, `listMenu`.
- Renders header (active board name) + `BoardView`.
- Persists boards + active id automatically via `usePref` writes.

**Out of scope for row #7** (deferred to #9): switcher, creator, multi-panel, inbox, planner, overview banner, card detail modal, view picker.

## §2 — Component API: `BoardView`

```tsx
export interface BoardViewProps {
  lists: BoardList[];
  lang: "en" | "zh";
  draftListIdx: number | null;
  setDraftListIdx: (i: number | null) => void;
  composerText: string;
  setComposerText: (t: string) => void;
  showListComposer: boolean;
  setShowListComposer: (b: boolean) => void;
  newListName: string;
  setNewListName: (t: string) => void;
  addCard: (listIdx: number) => void;
  addList: () => void;
  listMenu: string | null;
  setListMenu: (id: string | null) => void;
  setListColor: (listId: string, color: BoardListColorId | null) => void;
  moveCardToList: (cardId: string, fromListId: string, toListId: string) => void;
}

export function BoardView(props: BoardViewProps): JSX.Element;
```

**Behavior**

- Maps `lists` to `<BoardList>` columns.
- Owns local `dragging` + `overListId` state (HTML5 DnD).
- Renders inline "add list" composer when `showListComposer` is true; otherwise an "add list" button.

## §3 — Schema types (`src/types.ts`)

```ts
export interface BilingualText {
  en: string;
  zh: string;
}

export type BoardListColorId =
  | "green" | "yellow" | "orange" | "red" | "purple"
  | "blue"  | "teal"   | "lime"   | "pink" | "gray";

export type BoardTemplate = "kanban" | "pm" | "blank";

export interface CardChecklist {
  done: number;
  total: number;
}

export interface BoardCard {
  id: string;
  title: BilingualText;
  /** Label ids; references entries in PM_LABELS or future global label set. */
  labels?: string[];
  /** Member user ids; rendered as avatar chips. */
  members?: string[];
  checklist?: CardChecklist;
  /** Opaque display string (e.g. "5/26", "Today"). Not parsed by row #7. */
  due?: string;
  /** Optional english-localized due override for the prototype's bilingual seed. */
  dueEn?: string;
  /** Opaque display string for start date. */
  start?: string;
  dueLate?: boolean;
  attach?: string;
  /** CSS background string for an optional cover bar. */
  cover?: string;
}

export interface BoardList {
  id: string;
  /** When set, name comes from the i18n catalog under board.lists.<key>. */
  key: string | null;
  /** When key is null, customName provides the bilingual display name. */
  customName?: BilingualText;
  /** Null means "no color stripe". */
  color?: BoardListColorId | null;
  cards: BoardCard[];
}

export interface BoardWorkspace {
  id: string;
  name: BilingualText;
  /** OKLCH or CSS color string for the workspace chip (used in #9 only; preserved in seed). */
  color: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: BilingualText;
  /** CSS background string (linear-gradient, image, etc.). */
  cover: string;
  template: BoardTemplate;
  lists: BoardList[];
}
```

## §4 — Constants (`src/internal/listColors.ts`)

```ts
export const LIST_COLOR_IDS = [
  "green", "yellow", "orange", "red", "purple",
  "blue",  "teal",   "lime",   "pink", "gray",
] as const satisfies readonly BoardListColorId[];

export interface ListColorEntry {
  id: BoardListColorId;
  /** CSS custom property name resolved by ../styles.css. */
  cssVar: string;
}

export const LIST_COLOR_PALETTE: readonly ListColorEntry[] = [
  { id: "green",  cssVar: "var(--board-list-color-green)"  },
  { id: "yellow", cssVar: "var(--board-list-color-yellow)" },
  { id: "orange", cssVar: "var(--board-list-color-orange)" },
  { id: "red",    cssVar: "var(--board-list-color-red)"    },
  { id: "purple", cssVar: "var(--board-list-color-purple)" },
  { id: "blue",   cssVar: "var(--board-list-color-blue)"   },
  { id: "teal",   cssVar: "var(--board-list-color-teal)"   },
  { id: "lime",   cssVar: "var(--board-list-color-lime)"   },
  { id: "pink",   cssVar: "var(--board-list-color-pink)"   },
  { id: "gray",   cssVar: "var(--board-list-color-gray)"   },
] as const;
```

**Invariant**: `LIST_COLOR_PALETTE.length === LIST_COLOR_IDS.length === 10`. Tested.

## §5 — Pure helpers (`src/internal/boardOps.ts`)

```ts
/** Returns new lists with the card moved from source to target.
 *  No-op if from === to or if the source list does not contain the card. */
export function moveCardToList(
  lists: readonly BoardList[],
  cardId: string,
  fromListId: string,
  toListId: string,
): BoardList[];

/** Returns new lists with a new card appended to lists[listIdx]. */
export function addCardToList(
  lists: readonly BoardList[],
  listIdx: number,
  cardTitleText: string,
): BoardList[];

/** Returns new lists with a new empty list appended. */
export function addNewList(
  lists: readonly BoardList[],
  customNameText: string,
): BoardList[];

/** Returns new lists with the target list's color set (or cleared). */
export function setListColor(
  lists: readonly BoardList[],
  listId: string,
  color: BoardListColorId | null,
): BoardList[];

/** Returns new lists with one card patched (shallow merge). */
export function updateCardInList(
  lists: readonly BoardList[],
  listId: string,
  cardId: string,
  patch: Partial<BoardCard>,
): BoardList[];
```

**All helpers are pure**: same inputs → same output, no mutation, no side effects.

## §6 — Persistence contract (`src/internal/persistence.ts`)

```ts
/** Read boards from xai_boards_v2; narrow unknown → Board[] via guard.
 *  Returns makeDefaultBoards() if registry is null/empty/malformed. */
export function loadBoardsOrDefault(raw: unknown): Board[];

/** Pick the active board (by id or first). */
export function pickActiveBoard(boards: readonly Board[], activeId: string): Board;
```

**Persistence keys** (already SHIPPED in `@repo/plugin-web-storage` registry):

| Key | Codec | Default | Owner row |
|---|---|---|---|
| `xai_boards_v2` | `json` | `null` (`BoardsState = unknown`) | xai-web-board-core (row #7 — this row) |
| `xai_active_board` | `string` | `""` | xai-web-board-core (row #7 — this row) |
| `xai_board_panels` | `json` | `[]` | xai-web-board-core (row #9 owns runtime) |
| `xai_board_inbox` | `json` | `[]` | xai-web-board-core (row #9 owns runtime) |

Row #7 reads/writes ONLY the first two. Rows #8 / #9 add usage of the last two.

## §6.1 — Board export/import contract (`src/internal/exportImport.ts`)

```ts
export const BOARD_EXPORT_PAYLOAD_KIND = "xai.web.board.export";
export const BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION = 1;

export interface BoardExportPayloadV1 {
  kind: typeof BOARD_EXPORT_PAYLOAD_KIND;
  schemaVersion: typeof BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION;
  exportedAt: string;
  storageKey: typeof BOARD_STORAGE_KEY;
  storageSource: "legacy-array" | "v1-envelope";
  storageValue: BoardStorageValue;
  boards: Board[];
  logicalEntities: BoardStorageLogicalEntities;
}

export function createBoardExportPayload(
  raw: unknown,
  options?: { exportedAt?: string },
): BoardExportPayloadResult;

export function readBoardExportPayload(
  raw: unknown,
): BoardExportPayloadReadResult;

export function boardImportStorageValueFromPayload(
  raw: unknown,
): BoardImportStorageValueResult;
```

Semantics:

- The helpers are pure and never touch `localStorage` directly.
- Export accepts valid legacy `Board[]` or v1 storage envelopes.
- Legacy arrays are exported as envelope-backed payloads.
- Existing v1 envelopes keep their storage value identity.
- Every valid payload includes board/list/card logical entities via
  `projectBoardStorageEntities`.
- Import returns the validated value a future UI can write to `xai_boards_v2`.

## §7 — Shell registration (`src/registration.tsx`)

```tsx
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { BoardModule } from "./BoardModule.js";

function BoardModuleRoute(): JSX.Element {
  const { lang } = useWebShell();
  return <BoardModule lang={lang} />;
}

export const boardCoreWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "board",
  label: "Boards",
  defaultChildPath: "",
  children: [
    { path: "", render: BoardModuleRoute },
    { path: "*", render: BoardModuleRoute },
  ],
  icon: "kanban",
  railOrder: 3,
  i18nKey: "nav.board",
  showInRail: true,
};
```

`apps/web/src/routes/modules/shellRegistrations.tsx` line 59 is rewritten from:

```tsx
placeholder("board", "Boards", "kanban", 3),
```

to:

```tsx
boardCoreWebModuleRegistration,
```

with the matching `import { boardCoreWebModuleRegistration } from "@repo/plugin-web-board-core";` near line 31.

## §8 — Drag-and-drop contract

| Event | Source | dataTransfer MIME | Payload (JSON) |
|---|---|---|---|
| `dragstart` | `<BoardCard>` | `application/x-xai-board-card` | `{ "cardId": string, "fromListId": string }` |
| `dragover` | `<section.board-list>` | (read; calls `preventDefault()`) | — |
| `drop` | `<section.board-list>` | (read; parses MIME above) | — |

**Error semantics**: malformed JSON, missing MIME, or `fromListId === toListId` ⇒ silent no-op. The drop handler never throws; tests cover D4 and D5 to assert this.

## §9 — Error semantics

| Failure mode | Behavior |
|---|---|
| `usePref("xai_boards_v2")` returns null (first run) | `loadBoardsOrDefault(null)` returns `makeDefaultBoards()`. |
| `usePref("xai_boards_v2")` returns malformed JSON / wrong shape | `isBoardArray` rejects → `makeDefaultBoards()`. (Test V3, V4, V5.) |
| `usePref("xai_active_board")` returns id that does not match any board | `pickActiveBoard` returns `boards[0]`. (Test P3.) |
| `setBoards` writes new array, persistence autosave fails (quota exceeded) | `usePref` swallows; in-memory state is correct; next render attempts again. (Inherited from `@repo/plugin-web-storage` contract.) |
| Drop event with corrupted `dataTransfer` payload | Caught by JSON parse try/catch; drop is a no-op. (Test D4.) |
| `addCard` called with empty / whitespace-only text | No-op; composer is reset but no card is created. (Test BO-A1.) |

## §10 — Idempotency

| Operation | Idempotent? |
|---|---|
| `moveCardToList(cardId, A, A)` | Yes — returns same logical state (test M3). |
| `moveCardToList` called twice in sequence with same args | First moves; second is a no-op because source no longer has the card. |
| `addCardToList` with same text | Not idempotent (each call appends; intentional — user clicks "add" twice should produce two cards). |
| `setListColor(listId, X)` twice | Idempotent. |

## §11 — Versioning

Row #7 declares schema **v1**. Future migrations (e.g. adding `Board.archivedAt`) require:

1. Bump `schemaVersion` in `@repo/plugin-web-storage` registry entry for `xai_boards_v2`.
2. Add a migration step in `@repo/plugin-web-storage`'s `migrate.ts`.
3. Open a follow-up row (not row #7).

Row #7 does not bump anything.

## §12 — Concurrency

Per manifest header: row #7 ships in parallel with rows #10 (dashboard-grid) and #20 (statistics). Write-scope-disjoint:

- Row #7 edits line 59 of `shellRegistrations.tsx` + adds workspace dep to `apps/web/package.json` + creates `packages/plugin-web-board-core/`.
- Row #10 edits line 60 (`placeholder("dashboard", ...)`) + own workspace dep.
- Row #20 edits line 67 (`placeholder("statistics", ...)`) + own workspace dep.

No file overlap except `shellRegistrations.tsx` (each row touches a different line) and `apps/web/package.json` (each row adds a different dep). Build agents use `Edit` (not `Write`) on those shared files and retry on `git index.lock` with 8–20s exponential jitter × 5 attempts.

## §13 — Package dependency list (final)

```jsonc
{
  "name": "@repo/plugin-web-board-core",
  "dependencies": {
    "@repo/core":              "workspace:*",
    "@repo/plugin-web-tokens": "workspace:*",
    "@repo/plugin-web-storage": "workspace:*",
    "@repo/xai-web-shell":     "workspace:*"
  },
  "peerDependencies": {
    "react":     "^19.0.0",
    "react-dom": "^19.0.0"
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

## §S14 — 2026-05-25 Extension API (gap-closure row #6 — Card schema `location?`)

> APPEND-ONLY. **Canonical extension API spec lives in
> `packages/xai-web-board-views/docs/api.md §S15`.** This section documents
> the single additive change made to THIS package.

### §S14.1 — `BoardCard.location` field (additive)

```ts
// packages/plugin-web-board-core/src/types.ts — MODIFY (additive)

export interface BoardCard {
  // ... existing fields preserved verbatim ...

  /** OPTIONAL — geographic location for Map view rendering.
   *  Cards without this field render as empty-state in Map view. */
  location?: CardLocation;
}

/** NEW — declared in board-core; re-exported by board-views for ergonomic import. */
export interface CardLocation {
  /** WGS84 latitude, -90..90 (decimal degrees). */
  lat: number;
  /** WGS84 longitude, -180..180 (decimal degrees). */
  lng: number;
  /** Optional human-readable label rendered in the Map view pin popup. */
  label?: string;
}
```

### §S14.2 — `isBoardCard` guard widening (additive)

```ts
// packages/plugin-web-board-core/src/internal/isBoardArray.ts — MODIFY

export function isBoardCard(value: unknown): value is BoardCard {
  // ... existing checks for id / title / etc. preserved ...

  // NEW: if `location` is present, it MUST be an object with `lat` and `lng`
  // as numbers (NaN / out-of-range allowed at the guard level — runtime
  // narrowing via isValidLocation rejects those).
  if ('location' in (value as object) && (value as { location?: unknown }).location !== undefined) {
    const loc = (value as { location: unknown }).location;
    if (typeof loc !== 'object' || loc === null) return false;
    if (typeof (loc as { lat?: unknown }).lat !== 'number') return false;
    if (typeof (loc as { lng?: unknown }).lng !== 'number') return false;
    // `label` optional; if present must be string
    if ('label' in loc && typeof (loc as { label?: unknown }).label !== 'string'
        && (loc as { label?: unknown }).label !== undefined) return false;
  }

  return true;
}
```

**Guard intent**: structural validation only. Range validation (`lat ∈ [-90,90]`,
`lng ∈ [-180,180]`, `!isNaN`) is enforced at the view boundary by
`isValidLocation` in `@repo/plugin-web-board-views`. This split lets persisted
data round-trip through `usePref` without coercing malformed coords into
defaults — the Map view simply omits malformed cards from its pin set.

### §S14.3 — Versioning

`location` is additive optional. `xai_boards_v2` registry stays at v1. No migration. No registry edit.

### §S14.4 — Error semantics

| Failure mode | Behavior |
|---|---|
| `BoardCard` without `location` field | Guard passes; card stored as-is; Map view treats as empty-state input. |
| `BoardCard.location.lat === NaN` | Guard passes (structurally valid object); `isValidLocation` in board-views rejects → marker not rendered. |
| `BoardCard.location.lng === 200` | Guard passes; `isValidLocation` rejects (out-of-range). |
| `BoardCard.location = "garbage"` (string, not object) | Guard FAILS → entire card rejected by `isBoardArray` → board falls back to seed default. |

### §S14.5 — Tests added (cross-ref test.md §6)

4 new cases in `__tests__/isBoardArray.test.ts`:

- BCV1: card with valid `location` → guard passes
- BCV2: card without `location` → guard passes (back-compat)
- BCV3: card with `location.lat === NaN` → guard passes (structural OK)
- BCV4: card with `location = "garbage"` → guard fails

## §S16 — 2026-06-03 Extension API (Project module row #14 — Automation Lite)

> Canonical row docs live in `packages/xai-web-board-automation-lite/docs/`.

Board-core now owns fixed Board automation presets through a pure helper:

```ts
export const BOARD_AUTOMATION_URGENT_LABEL_ID = "urgent";
export const BOARD_AUTOMATION_DUE_SOON_DAYS = 2;

export function applyBoardAutomationLite(
  lists: readonly BoardListData[],
  options?: BoardAutomationLiteOptions,
): BoardAutomationLiteResult;
```

Additive schema field:

```ts
interface BoardCard {
  completedAt?: string;
}
```

Rules:

- semantic Done cards receive `completedAt` and completed checklist progress
- active non-Done cards due today through 2 days ahead receive `urgent`
- daily due sort orders active non-Done cards by valid `dueDate`
- archived lists/cards are skipped
- helper remains pure and never touches `localStorage`

## §S17 — 2026-06-03 Extension API (Project module row #15 — Board integrations)

> Canonical row docs live in `packages/xai-web-board-integrations/docs/`.

Board-core now owns the Board integration link adapter vocabulary:

```ts
export type BoardIntegrationProviderId =
  | "gcal"
  | "github"
  | "linear"
  | "drive"
  | "link";

export interface BoardAttachmentIntegrationSource {
  kind: "integration";
  providerId: BoardIntegrationProviderId;
  providerName: string;
  externalId?: string;
}

export interface BoardCardAttachmentLink {
  id: string;
  url: string;
  title?: string;
  source?: BoardAttachmentIntegrationSource;
}

export function createBoardIntegrationAttachment(
  input: BoardIntegrationAttachmentInput,
): BoardIntegrationAttachmentResult;
```

Rules:

- provider catalog is GCal, GitHub, Linear, Google Drive, and generic Link
- only HTTP(S) URLs are accepted
- helper is pure and never touches Settings prefs, OAuth state, storage, or the
  network
- optional `source` metadata is additive; old attachments remain valid
- storage guard rejects malformed provider metadata
