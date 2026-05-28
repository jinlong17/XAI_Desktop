# API — `@repo/plugin-web-tasks`

> Interface contracts for the Tasks module.
> Public surface = `src/index.ts` only. Internal modules under `src/internal/` are NOT part of this contract.
> Aligned with [design.md](./design.md) §4 and ADR-0007 §S4 + §S6 + §S7 + §S8.

---

## 0. Public surface (`src/index.ts`)

```ts
// Side-effect CSS — applied once on first import.
import "./styles.css";

// Component
export { TasksModule } from "./TasksModule.js";
export type { TasksModuleProps } from "./TasksModule.js";

// Slot registration — consumed by apps/web/src/routes/modules/shellRegistrations.tsx
export { tasksWebModuleRegistration } from "./registration.js";

// Public types
export type {
  TaskCard,
  TaskCol,
  BucketId,
  TaskTagId,
  TaskTitleBundle,
} from "./types.js";
```

No other exports. Internal modules (`src/internal/**`) MUST NOT be imported by consumers.

---

## 1. Types

### 1.1 `BucketId`

```ts
export type BucketId = "overdue" | "next7" | "later" | "nodate";
```

Closed set. The prototype hard-codes these four ids; the row keeps that.

### 1.2 `TaskTagId`

```ts
export type TaskTagId = "study" | "work" | "personal" | "todo" | "other";
```

Maps 1:1 to the prototype's 5 tags (web design/i18n.js MOCK.tags). Used for the tag pill's `.tag.<id>` CSS class.

### 1.3 `TaskTitleBundle`

```ts
export type TaskTitleBundle = {
  readonly en: string;
  readonly zh: string;
};
```

The bilingual title structure. Used for `title`, `sub` (when present), and `dateLabel` (when present).

### 1.4 `TaskCard`

```ts
export interface TaskCard {
  /** Stable card id (e.g. "t1", "c1") — globally unique within taskCols. */
  readonly id: string;
  /** Bilingual title — required. */
  readonly title: TaskTitleBundle;
  /** Optional bilingual subtitle (used for holiday descriptions in prototype). */
  readonly sub?: TaskTitleBundle;
  /** Optional tag class — drives the pill colour. */
  readonly tag?: TaskTagId;
  /** Optional date display string in EN format ("7/31", "Jun 14", etc.). */
  readonly date?: string;
  /** Optional date display string in ZH format ("6 月 14 日", etc.). */
  readonly dateZh?: string;
  /** Optional bilingual date *label* (e.g. "Next Mon" / "下周一"). Mutually exclusive with date/dateZh in v1. */
  readonly dateLabel?: TaskTitleBundle;
  /** When true, renders the inbox-source icon in the meta row. */
  readonly inbox?: boolean;
}
```

Notes:
- Fields are `readonly` because the reducer treats `TaskCard` as immutable — moves create new objects.
- `date` / `dateZh` / `dateLabel` are mutually exclusive in v1 (the prototype's MOCK reflects this).

### 1.5 `TaskCol`

```ts
export interface TaskCol {
  /** Bucket id — closed set. */
  readonly id: BucketId;
  /** i18n key suffix (used as `common.${key}`). */
  readonly key: "overdue" | "next_7_days" | "later" | "no_date";
  /** Cached count — kept in sync with tasks.length by the reducer. */
  readonly count: number;
  /** Header action button kind — "postpone" or "add" or absent. */
  readonly action?: "postpone" | "add";
  /** Ordered task list (top of column = index 0). */
  readonly tasks: ReadonlyArray<TaskCard>;
  /** Optional completed-group inside this column (only nodate has this in MOCK). */
  readonly completed?: ReadonlyArray<TaskCard>;
}
```

### 1.6 `TasksModuleProps`

```ts
export interface TasksModuleProps {
  /** Active UI language. */
  readonly lang: Lang;  // imported from @repo/plugin-web-tokens
}
```

The component is otherwise self-contained: it reads from `usePref` directly.

---

## 2. Components

### 2.1 `TasksModule`

```ts
export function TasksModule(props: TasksModuleProps): JSX.Element;
```

Top-level route component. Renders sidebar + main 4-column board. Owns:
- `completedTasks: Set<string>` via `useState` (in-memory only; toggling a card's checkbox).
- `taskCols: TaskCol[]` via `usePref("xai_task_cols")` + boundary validate + seed-fallback.
- `dragging: { taskId, fromColId } | null` via `useState` (purely transient DnD state).
- `overColId: BucketId | null` via `useState` (highlights `.drop-target` column).

Renders side-effect CSS (`./styles.css`).

### 2.2 `tasksWebModuleRegistration`

```ts
export const tasksWebModuleRegistration: WebModuleSlotRegistration;
```

Shell slot conforming to `@repo/xai-web-shell.WebModuleSlotRegistration`:

```ts
{
  moduleId: "tasks",
  label: "Tasks",
  defaultChildPath: "",
  children: [
    { path: "", render: TasksModuleRoute },
    { path: "*", render: TasksModuleRoute },
  ],
  icon: "check",
  railOrder: 2,
  i18nKey: "nav.tasks",
  showInRail: true,
}
```

`TasksModuleRoute` is a thin wrapper that reads `lang` from `useWebShell()` and delegates to `<TasksModule lang={lang} />` — same pattern as `countdownWebModuleRegistration`.

---

## 3. Slot integration contract (host-side)

Host file `apps/web/src/routes/modules/shellRegistrations.tsx` must:

1. Add import:
   ```ts
   import { tasksWebModuleRegistration } from "@repo/plugin-web-tasks";
   ```
2. Replace the existing `placeholder("tasks", "Tasks", "check", 2),` line with `tasksWebModuleRegistration,`.

Host file `apps/web/package.json` must add:
```json
"@repo/plugin-web-tasks": "workspace:*"
```
to the `dependencies` block (alphabetical position immediately after `@repo/plugin-web-matrix`).

No other host changes are required.

---

## 4. Persistence contract

### 4.1 Storage key

- **Key**: `xai_task_cols`
- **Registry owner**: `xai-web-tasks` (already declared in `packages/plugin-web-storage/src/internal/registry.ts` per ADR-0007 §S8).
- **Registry codec**: `json`
- **Registry schemaVersion**: `1`
- **Registry-declared type**: `TaskColsState = Record<string, boolean>` — **this is a placeholder type**; the row uses a boundary cast.

### 4.2 Boundary pattern

Tasks reads / writes the **full `TaskCol[]` array**, not a `Record<string, boolean>`. The boundary cast pattern is:

```ts
import { usePref } from "@repo/plugin-web-storage";
import { isTaskColsArray } from "./internal/validate.js";
import { SEED_TASK_COLS } from "./internal/seed/tasksMock.js";

function useTaskCols(): [TaskCol[], (next: TaskCol[]) => void] {
  const [raw, setRaw] = usePref("xai_task_cols");
  const cols = useMemo<TaskCol[]>(() => {
    if (isTaskColsArray(raw)) return raw;
    return SEED_TASK_COLS;
  }, [raw]);
  const setCols = useCallback((next: TaskCol[]) => {
    setRaw(next as unknown as Parameters<typeof setRaw>[0]);
  }, [setRaw]);
  return [cols, setCols];
}
```

This mirrors `xai-web-countdown`'s `usePref("xai_countdowns")` pattern (validate at boundary, seed-fallback). The `as unknown` cast is contained to a single call site.

### 4.3 First-load behaviour

If `localStorage.getItem("xai_task_cols")` is `null`, `usePref` returns the registry default (`{}` in current declaration) — `isTaskColsArray({})` is false, so we render `SEED_TASK_COLS` (a typed copy of `web design/i18n.js MOCK.taskCols`). The first user action (toggle or DnD) writes the materialized array to localStorage.

### 4.4 Cross-tab updates

`usePref` already broadcasts updates via the browser `storage` event + same-tab pub/sub. No additional wiring needed.

---

## 5. Pure helpers (internal — documented here so reviewers can reason about behaviour)

### 5.1 `dateForCol(bucketId, now?)`

```ts
export function dateForCol(
  bucketId: BucketId,
  now: Date = new Date(),
): { date: string; dateZh: string } | null;
```

Returns:
| Bucket | Result |
|---|---|
| `overdue` | `{ date: "M/D", dateZh: "M 月 D 日" }` where the day is **today − 3 days** |
| `next7`   | `{ date: "M/D", dateZh: "M 月 D 日" }` where the day is **today + 2 days** |
| `later`   | `{ date: "Mon D", dateZh: "M 月 D 日" }` where the day is **today + 30 days** (EN uses `toLocaleString("en-US", { month: "short", day: "numeric" })`) |
| `nodate`  | `null` |

Caller is responsible for stripping `date` / `dateZh` / `dateLabel` / `sub` when this returns `null` (i.e., dropped on `nodate`).

`now` parameter is optional; tests pass a fake clock via `vi.setSystemTime()` and the default `new Date()` reads it.

### 5.2 `tasksReducer.moveCard(prev, taskId, fromColId, toColId, now)`

```ts
export function moveCard(
  prev: TaskCol[],
  taskId: string,
  fromColId: BucketId,
  toColId: BucketId,
  now?: Date,
): TaskCol[];
```

Pure. Returns a new `TaskCol[]` where:
- The card matching `taskId` is removed from `fromColId`.
- The card (with its date fields rewritten per `dateForCol(toColId, now)`) is prepended to `toColId.tasks` (top of column = index 0 — matches prototype line 200 `[moved, ...c.tasks]`).
- `count` is updated for both columns: `Math.max(0, count - 1)` and `count + 1`.
- If `fromColId === toColId`, returns `prev` unchanged.
- If `taskId` not found in `fromColId`, returns `prev` unchanged.
- If `toColId === "nodate"`, strips `date`, `dateZh`, `dateLabel`, `sub` from the moved card; otherwise sets `date` + `dateZh` and strips `dateLabel`, `sub`.
- All other columns pass through untouched (referential equality).

### 5.3 `tasksReducer.toggleComplete(prev, taskId)`

```ts
export function toggleComplete(
  prev: ReadonlySet<string>,
  taskId: string,
): Set<string>;
```

Pure. Returns a new `Set<string>` with `taskId` toggled (added if absent, removed if present). Used only for the in-memory completion overlay — completion is not persisted in v1 (matches prototype).

### 5.4 `validate.isTaskColsArray(value)`

```ts
export function isTaskColsArray(value: unknown): value is TaskCol[];
```

Boundary guard. Returns `true` iff:
- `value` is `Array`,
- length === 4,
- each element has `id` in `{"overdue","next7","later","nodate"}`, `key` matching the bucket, `count` is `number`, `tasks` is `Array`, and each task passes `isTaskCard`.

### 5.5 `validate.isTaskCard(value)`

```ts
export function isTaskCard(value: unknown): value is TaskCard;
```

Boundary guard. Returns `true` iff:
- `value` is a non-null object,
- `id` is non-empty `string`,
- `title.en` and `title.zh` are `string`,
- optional fields (`sub`, `tag`, `date`, `dateZh`, `dateLabel`, `inbox`) — when present — match expected primitive types.

### 5.6 `seed.SEED_TASK_COLS`

```ts
export const SEED_TASK_COLS: ReadonlyArray<TaskCol>;
```

A typed `as const` translation of `web design/i18n.js MOCK.taskCols` (lines 420-475). Length 4. Total ≈ 26 active tasks + 6 completed (in `nodate.completed`).

---

## 6. Drag-and-drop contract

Documented for behaviour parity with the prototype.

| Event | Source | Effect |
|---|---|---|
| `onDragStart` on card | TaskCard | `e.dataTransfer.effectAllowed = "move"`; `setData("text/plain", JSON.stringify({taskId, fromColId}))`; set `dragging` state. |
| `onDragOver` on column | TaskColumn | `e.preventDefault()`; `e.dataTransfer.dropEffect = "move"`; if `overColId !== col.id`, set `overColId`. |
| `onDragLeave` on column | TaskColumn | If `overColId === col.id`, clear `overColId`. |
| `onDrop` on column | TaskColumn | `e.preventDefault()`; parse `dataTransfer`; if valid + different column, dispatch `moveCard`; clear `dragging` + `overColId`. |
| `onDragEnd` on card | TaskCard | Clear `dragging` + `overColId` (handles drops outside any column). |

Visual:
- Column header gets `.task-col.drop-target` class when `overColId === col.id`; CSS applies accent-color outline.
- Topbar shows `s("tasks.drop_to_reschedule")` (provisional i18n key — if absent in `@repo/plugin-web-tokens`, P1 falls back to the inline-literal pair from the prototype lines 215-216, and P2 either adds the key to tokens via a follow-up or keeps the inline fallback documented in `dev_log.md`).
- Dragged card gets `.task-card.is-dragging` class (reduced opacity per prototype's existing CSS chain).

---

## 7. CSS contract

`src/styles.css` is a side-effect import. It depends on the tokens variables shipped by `@repo/plugin-web-tokens/src/tokens.css` (already imported transitively via the shell). Class names used (must match prototype's existing CSS in `web design/tasks.css`, ported to this package's `styles.css`):

- `.module.module-tasks` — root wrapper
- `.module-sidebar` — sidebar
- `.sidebar-section`, `.sec-label`, `.list-row`, `.filter-hint`, `.sidebar-footer`
- `.tasks-main`, `.module-head`, `.module-title`, `.drag-hint`
- `.task-columns`, `.task-col`, `.task-col.drop-target`, `.task-col-head`, `.task-col-body`, `.task-col-empty`, `.col-count`, `.col-action`, `.icon-btn`
- `.task-card`, `.task-card.is-completed`, `.task-card.is-dragging`, `.task-card-head`, `.task-card-body`, `.task-grip`, `.cbx`, `.cbx.checked`, `.task-title`, `.task-sub`, `.task-pill`, `.task-meta`, `.tag`, `.tag.study`, `.tag.work`, `.tag.personal`, `.tag.todo`, `.tag.other`, `.task-date`, `.task-loc`, `.grow`
- `.completed-group`, `.completed-head`, `.completed-list`, `.view-more`

No CSS modules, no styled-components (ADR-0007 JSX→TSX rule 9).

---

## 8. Error semantics

| Boundary | Failure mode | Behaviour |
|---|---|---|
| `usePref` returns non-array shape | `isTaskColsArray(raw)` returns false | Render `SEED_TASK_COLS`; DEV `console.warn("[plugin-web-tasks] usePref('xai_task_cols') returned non-array shape — falling back to seed.")` |
| `e.dataTransfer.getData("text/plain")` returns invalid JSON | `JSON.parse` throws | Catch and no-op (matches prototype line 169). |
| DnD drop on same column | `fromColId === toColId` | No state change (matches prototype line 173). |
| DnD drop with unknown `taskId` | reducer fails to find card | Returns prev array unchanged. |
| `dateForCol("nodate")` | always | Returns `null`; caller strips date fields. |
| `localStorage.setItem` fails (quota exceeded) | `setPref` returns false | Silent — same as `usePref`'s contract (it surfaces a console error in DEV via the storage layer). |

No error UI is required in v1. Failures degrade gracefully.

---

## 9. i18n keys consumed (all already present in `@repo/plugin-web-tokens`)

| Key path | Used by | Notes |
|---|---|---|
| `nav.tasks` | shell registration | already in tokens.i18n |
| `common.all`, `common.today`, `common.tomorrow`, `common.next_7_days`, `common.inbox`, `common.summary` | sidebar Smart Lists rows | already in tokens.i18n |
| `common.lists`, `common.filters`, `common.tags`, `common.calendar_sub` | sidebar section labels | already in tokens.i18n |
| `common.completed`, `common.wont_do`, `common.trash` | sidebar footer + CompletedGroup | already in tokens.i18n |
| `common.overdue`, `common.next_7_days`, `common.later`, `common.no_date` | column headers | already in tokens.i18n |
| `common.postpone`, `common.view_more` | column action + completed group | already in tokens.i18n |
| `tasks.all` | header title | already in tokens.i18n |
| `tasks.next_mon`, `tasks.next_wed` | seed dateLabel display *(consumed at runtime via the seed; key already present)* | already in tokens.i18n |
| `tag.study`, `tag.work`, `tag.personal`, `tag.todo`, `tag.other` | tag pill labels | already in tokens.i18n |

Provisional new keys we **may** need (P2 will confirm):
- `tasks.drop_to_reschedule` — topbar drag hint. **Fallback**: keep inline bilingual literal from prototype lines 215-216 with a `// TODO(xai-web-tasks i18n)` comment if tokens addition slips past P2.
- `tasks.drop_zone_empty` — empty-column placeholder. **Fallback**: same inline pattern as above.

Adding either key to `@repo/plugin-web-tokens` is a one-line additive change to two language bundles — out of scope for this row unless P2 review insists otherwise.

---

# Extension — xai-web-tasks-card-create (2026-05-28)

> APPENDED extension. The SHIPPED v1 contract above (§0–§9) is unchanged.
> Discovery: `docs/reviews/xai-web-tasks-card-create/20260528-discovery-review.md`.

## E.0 New public surface delta (`src/index.ts`)

```ts
// Public types — ADD:
export type { NewTaskDraft } from "./types.js";
```

`TaskComposer` stays internal to the module in v1 (rendered only by `TasksModule`); it is NOT exported. `createTaskId` and `addCard` stay internal (`src/internal/**`).

## E.1 New type — `NewTaskDraft`

```ts
export interface NewTaskDraft {
  /** Raw title string typed by the user; trimmed by addCard. Fills BOTH title.en + title.zh. */
  readonly title: string;
  /** Optional tag preset — omitted means "no tag". */
  readonly tag?: TaskTagId;
  /** When true (and target ≠ "nodate"), addCard derives date via dateForCol(targetBucket, now). */
  readonly withDate: boolean;
}
```

## E.2 New internal helper — `createTaskId()`

```ts
// src/internal/ids.ts
export function createTaskId(): string;
```

Returns a fresh opaque id. Modern path: `crypto.randomUUID()`. Fallback (jsdom / old runtimes): `"t-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,10)`. Structurally disjoint from seed ids (`t1`…`t26`, `c1`…`c6`) so a generated id can never collide with the fixture. Mirrors `packages/xai-web-calendar/src/internal/eventStore/ids.ts` (pattern only — not imported).

## E.3 New reducer action — `addCard`

```ts
// src/internal/tasksReducer.ts
export function addCard(
  prev: TaskCol[],
  draft: NewTaskDraft,
  targetBucket: BucketId,
  now?: Date,
): TaskCol[];
```

Pure. Returns a new `TaskCol[]` where a freshly-built `TaskCard` is **prepended** to `targetBucket.tasks` (top of column = index 0, matching `moveCard`'s prepend convention). Behaviour:

- Builds the card: `id = createTaskId()`; `title = { en: draft.title.trim(), zh: draft.title.trim() }`; `tag` set only when `draft.tag` is defined; `date`+`dateZh` set only when `draft.withDate === true` AND `targetBucket !== "nodate"` (via `dateForCol(targetBucket, now)`); no `sub`/`dateLabel`/`inbox` on user-created cards.
- `targetBucket`'s `count` becomes `count + 1`.
- All other columns pass through untouched (referential equality preserved — same discipline as `moveCard`).
- **Guard**: if `draft.title.trim().length === 0`, returns `prev` unchanged (the composer also blocks empty titles with an inline error, so this is a defensive boundary).
- **Guard**: if `targetBucket` is not found in `prev`, returns `prev` unchanged.
- The result passes `isTaskColsArray` (so the persistence round-trip is valid).

### Example

```ts
addCard(
  taskCols,
  { title: "Email the reviewers", tag: "work", withDate: true },
  "next7",
  new Date("2026-05-28T12:00:00"),
);
// → next7.tasks[0] = {
//     id: "<uuid>", title: { en: "Email the reviewers", zh: "Email the reviewers" },
//     tag: "work", date: "5/30", dateZh: "5 月 30 日"
//   }
// → next7.count incremented; other 3 columns referentially identical to input.
```

## E.4 New component — `TaskComposer` (internal)

```ts
export interface TaskComposerProps {
  /** Controls visibility: true → showModal(), false → close(). */
  open: boolean;
  /** Active language for STR_TASK_COMPOSER labels + the inline error. */
  lang: Lang;
  /** Bucket pre-selected when the dialog opens (the column whose + was clicked). */
  defaultBucket: BucketId;
  /** Called after validation passes with the draft + chosen bucket. */
  onSave: (draft: NewTaskDraft, targetBucket: BucketId) => void;
  /** Called on ESC / backdrop click / Cancel (changes discarded). */
  onClose: () => void;
}

export function TaskComposer(props: TaskComposerProps): ReactElement | null;
```

Behaviour (mirrors `EventComposer.tsx`):

- On open: `title=""`, `bucket=defaultBucket`, `tag=undefined` ("None" radio selected), `withDate=false`. Form resets via `useEffect` keyed on `[open, defaultBucket]`.
- Open/close imperatively: `open` → `showModal()` + autofocus title via `setTimeout(0)`; `!open` → `close()`.
- ESC: native `cancel` event listener → `onClose`.
- Backdrop: `onClick` where `e.target === dialogRef.current` → `onClose`.
- Save: trims title; if empty → inline `err_title_required` shown + dialog stays open; else `onSave({ title, tag, withDate }, bucket)`.
- Tag picker: `role="radiogroup"`; options = `["none","study","work","personal","todo","other"]`; "none" maps to `tag=undefined`.
- Bucket picker: `role="radiogroup"` over the 4 `BucketId`s; default = `defaultBucket`.
- Date opt-in: a single checkbox "give this a date for the bucket" → `withDate`; hidden/no-op semantics when bucket is `nodate` (date can't apply).

a11y: `aria-modal="true"` + `aria-labelledby="task-composer-title"`; title input `aria-required` + `aria-describedby` when error present; each radio carries `aria-checked`.

## E.5 Wiring delta — `TaskColumn` + `TasksModule`

### `TaskColumn` (new optional prop)

```ts
export interface TaskColumnProps {
  // …existing props unchanged…
  onAddCard?: (bucketId: BucketId) => void;  // NEW
}
```

The `col.action === "add"` button (`TaskColumn.tsx:68-74`) gains `onClick={() => onAddCard?.(col.id)}`. The `overdue` column keeps its `postpone` action (unchanged; decorative per original Q1). The button keeps its existing `aria-label={s("common.add")}`.

### `TasksModule` (new state — no new event channel)

```ts
const [composer, setComposer] = useState<{ open: boolean; bucket: BucketId }>({
  open: false, bucket: "next7",
});

function handleAddCard(bucketId: BucketId) {
  setComposer({ open: true, bucket: bucketId });
}

function handleComposerSave(draft: NewTaskDraft, targetBucket: BucketId) {
  const next = addCard(taskCols, draft, targetBucket);
  setRawCols(next as unknown as Parameters<typeof setRawCols>[0]); // SHIPPED boundary cast
  setComposer((c) => ({ ...c, open: false }));
}
```

`<TaskComposer open={composer.open} lang={lang} defaultBucket={composer.bucket} onSave={handleComposerSave} onClose={...} />` renders once at the module root. Persistence + re-render reuse the SHIPPED `usePref` path entirely — no new channel, no `core` edit.

## E.6 Persistence contract (extension)

Unchanged from §4. `addCard`'s output is written via the same `setRawCols` boundary cast as `moveCard`. First create on an empty install materializes seed + new card together (the resolved `taskCols` is already seed-or-persisted via the SHIPPED `useMemo`), identical to the first DnD today. The written array passes `isTaskColsArray`.

## E.7 i18n (extension)

New strings live in `src/internal/strings.ts` as `STR_TASK_COMPOSER` (en+zh), mirroring `calendar/internal/strings.ts`. Shape: `Record<string, { en: string; zh: string }>`; access `STR_TASK_COMPOSER.key[lang]`. Expected keys: `title_create`, `field_title`, `field_tag`, `field_bucket`, `field_add_date`, `tag_none`, `bucket_overdue`, `bucket_next7`, `bucket_later`, `bucket_nodate`, `btn_save`, `btn_cancel`, `err_title_required`. Tag labels themselves continue via the existing tokens `tag.*` keys through `useI18n`. **No `plugin-web-tokens` edit.**

## E.8 Error semantics (extension)

| Boundary | Failure mode | Behaviour |
|---|---|---|
| Composer Save with empty/whitespace title | `title.trim().length === 0` | Inline `err_title_required`; dialog stays open; no `onSave`. |
| `addCard` called with empty title (defensive) | `draft.title.trim().length === 0` | Returns `prev` unchanged. |
| `addCard` with unknown `targetBucket` | bucket not found in `prev` | Returns `prev` unchanged. |
| `withDate === true` on `nodate` target | date can't apply | No date fields written (the `dateForCol("nodate")` → null path). |
| `setRawCols` write fails (quota) | storage layer returns false | Silent (same as SHIPPED `usePref` contract). |

No error UI beyond the inline title-required message in v1.
