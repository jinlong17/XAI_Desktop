# Design — `@repo/plugin-web-tasks`

> Decision snapshot for the Tasks module port.
> Discovery review: [docs/reviews/xai-web-tasks/20260523-discovery-review.md](../../../docs/reviews/xai-web-tasks/20260523-discovery-review.md)
> Governing ADR: [docs/adr/0007-xai-web-console-build-form.md](../../../docs/adr/0007-xai-web-console-build-form.md) §S4 + §S6 + §S7 + §S8
> Roadmap row: xai-web-console #6 (wave W2b, parallel with #14 pomodoro, #15 habits)
> Source prototype: `web design/module-tasks.jsx` (286 lines, ≈11.5 KB)
> Status: PLANNED — pending feature-review

---

## 1. Decision

Implement the Tasks module as a single workspace package `@repo/plugin-web-tasks` (directory `packages/xai-web-tasks/`), porting the prototype's:

1. 2nd-level **sidebar** (Smart Lists / Custom Lists / Filters / Tags / Calendar Subscription / Completed / Won't Do / Trash).
2. **4-column time-bucket main view** (`overdue` / `next7` / `later` / `nodate`).
3. **Task cards** with checkbox / tag pill / date / inbox indicator / completed + dragging states.
4. **Cross-column DnD** that **rewrites the dropped card's due date** to the destination bucket (Overdue=-3d / Next7=+2d / Later=+30d / NoDate=clear) and persists to `xai_task_cols` via `usePref`.

### Selected options (from discovery §2)

| Axis | Option | Rationale |
|---|---|---|
| A — Persistence shape | **A1** Persist full `TaskCol[]`; cast `usePref` raw value through `unknown` + validate guard | Faithful to prototype's reload-restores-board behaviour; matches `xai_countdowns` precedent. |
| B — Seed location | **B1** Local `src/internal/seed/tasksMock.ts` | ADR-0007 frozen assumption 2 (one module = one package); no new shared seed package. |
| C — DnD mechanism | **C1** HTML5 DnD (`draggable` + `dataTransfer`) | 1:1 port; no new dep; jsdom-compatible for happy-path. |
| D — Date-rewrite helper | **D1** Extracted pure `dateForCol(bucketId, now?)` | Test-friendly with `vi.setSystemTime()`; mirrors `computeDaysUntil.ts` discipline. |

---

## 2. Frozen assumptions

These are the hard inputs from the seed brief + ADR-0007. Changing any requires re-running feature-plan, not silent edits.

1. **Toolchain & layout** — `packages/xai-web-tasks/` with `package.json` + `manifest.json` + `tsconfig.json` + `src/index.ts` + `docs/` four-pack. NPM name `@repo/plugin-web-tasks`. React 19, TS 5.9, Vite 7. Per ADR-0007 §S4 frozen assumption 2.
2. **Sole shell registration** — exports `tasksWebModuleRegistration: WebModuleSlotRegistration` consumed by `apps/web/src/routes/modules/shellRegistrations.tsx`. Replaces (not adds-alongside) the existing `placeholder("tasks", "Tasks", "check", 2)`. `railOrder: 2`, `icon: "check"`, `showInRail: true`, `i18nKey: "nav.tasks"`.
3. **i18n** — every visible string flows through `useI18n(lang).s(path)` from `@repo/plugin-web-tokens`. No literal strings. EN/中文 parity is acceptance-blocking. Required keys already present in tokens (`common.*`, `tasks.all`, `tag.*`); P1 plan does not add new keys.
4. **Persistence** — `usePref("xai_task_cols")` from `@repo/plugin-web-storage` is the only persistence API touched. The key is already in the registry (per ADR-0007 §S8); we do **not** edit `packages/plugin-web-storage`.
5. **No new state libraries** — `useState` + `useReducer` + `usePref` only. ADR-0007 JSX→TSX rule 10.
6. **DnD constraints** — destination-column highlight uses accent color via `.drop-target` class + tokens variable; topbar shows hint while dragging (string sourced from i18n).
7. **No event emission in v1** — the prototype emits nothing; this row keeps that. A potential `web:tasks:*` channel family is reserved for a later iteration (Statistics row #20 dependency).
8. **Cross-vendor**: yes — file scope is `packages/xai-web-tasks/`, `docs/reviews/xai-web-tasks/`, and three precise Edits to shared files (`apps/web/src/routes/modules/shellRegistrations.tsx`, `apps/web/package.json`, and **conditionally** `apps/web/src/App.tsx` only if outlet-context wiring needs it; see §5).
9. **Parallel-Agent safety** — sibling rows #14, #15 run concurrently; all shared-file Edits use unique anchors and follow the git-index retry policy (8 / 12 / 16 / 20 / 20 s × 5).
10. **Supersession** — this row supersedes `web-ticktick-parity` row `web-todo-first-slice`'s UI surface (seed brief §Authority). Data-layer hand-off is non-scope.

---

## 3. Dependency overview

### Workspace dependencies (declared in `package.json`)

| Dep | Why |
|---|---|
| `@repo/core` | `EventMap` host (no events emitted in v1; declared for future). |
| `@repo/plugin-web-tokens` | `useI18n`, `Lang` type, design tokens via side-effect CSS chain. |
| `@repo/plugin-web-storage` | `usePref("xai_task_cols")`. |
| `@repo/xai-web-shell` | `WebModuleSlotRegistration`, `useWebShell` (for lang in slot wrapper). |
| `@repo/xai-web-event-bus` (devDep only) | Type-only future hook; not imported in v1 sources. |

### Inverse: who depends on us?

In v1, only `apps/web/` (host shell) — via `shellRegistrations.tsx`. No plugin imports `@repo/plugin-web-tasks` directly (ADR-0007 §S7 forbids inter-plugin imports).

### Plugin-map status check

Per CLAUDE.md "Before Working on Any Plugin": deps consumed here (`@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-shell`, `@repo/xai-web-event-bus`) are all SHIPPED siblings of this row's wave. ADR-0007 §S6 lists the SHIPPED bases. No mocking needed.

---

## 4. Module structure

```
packages/xai-web-tasks/
├─ docs/
│  ├─ design.md             ← this file
│  ├─ api.md
│  ├─ test.md
│  └─ dev_log.md
├─ src/
│  ├─ index.ts              ← public surface
│  ├─ types.ts              ← TaskCard, TaskCol, BucketId, etc.
│  ├─ TasksModule.tsx       ← root component
│  ├─ TasksSidebar.tsx      ← 2nd-level sidebar
│  ├─ TaskColumn.tsx        ← single column (head + body + empty hint)
│  ├─ TaskCard.tsx          ← card view (checkbox + meta)
│  ├─ CompletedGroup.tsx    ← collapsible completed list inside nodate
│  ├─ registration.tsx      ← tasksWebModuleRegistration slot
│  ├─ styles.css            ← side-effect CSS (uses tokens vars)
│  └─ internal/
│     ├─ tasksReducer.ts    ← pure move/toggle/seed/validate helpers
│     ├─ dateForCol.ts      ← pure bucket date rewrite
│     ├─ validate.ts        ← isTaskColsArray, isTaskCard guards
│     └─ seed/
│        └─ tasksMock.ts    ← typed port of web design/i18n.js MOCK fragments
├─ package.json
├─ manifest.json
├─ tsconfig.json
├─ vitest.config.ts
└─ vitest.setup.ts
```

Public surface (`src/index.ts`) exports — **only**:
- `TasksModule` component
- `tasksWebModuleRegistration` (the `WebModuleSlotRegistration` consumed by host)
- Public types: `TaskCard`, `TaskCol`, `BucketId`, `TasksModuleProps`

Internal modules (`src/internal/**`) are **not** part of the public surface (CLAUDE.md "Code Boundaries").

---

## 5. Host-shell wiring

Two Edits on shared files; both have unique anchors so sibling agents cannot collide:

### Edit 1 — `apps/web/src/routes/modules/shellRegistrations.tsx`

Replace the placeholder line:

```diff
- placeholder("tasks",      "Tasks",      "check",     2),
+ tasksWebModuleRegistration,
```

…and add the import:

```ts
import { tasksWebModuleRegistration } from "@repo/plugin-web-tasks";
```

Anchor: `placeholder("tasks",      "Tasks",      "check",     2),` — unique in file (verified).

### Edit 2 — `apps/web/package.json`

Add to `dependencies`:

```diff
  "@repo/plugin-web-matrix": "workspace:*",
+ "@repo/plugin-web-tasks": "workspace:*",
```

Anchor: `"@repo/plugin-web-matrix": "workspace:*",` — unique (verified).

### `apps/web/src/App.tsx` — **no edit required**

The `WebShellProvider` already passes `lang` down via `useWebShell()`, which is what `registration.tsx` will read in its `TasksModuleRoute` wrapper (exact pattern: countdown row's `registration.tsx` lines 24-27). No outlet-context change needed.

---

## 6. Persistence contract

- Key: `xai_task_cols` (already in `PREF_REGISTRY`; codec `json`, owner `xai-web-tasks`, schemaVersion 1).
- Registry-declared type: `TaskColsState = Record<string, boolean>` — **this is a placeholder type**; the actual persisted shape is a full `TaskCol[]` array.
- Boundary pattern (mirrors `xai-web-countdown`):

  ```ts
  const [raw, setRaw] = usePref("xai_task_cols");
  const cols = useMemo<TaskCol[]>(() => {
    if (!isTaskColsArray(raw)) return SEED_TASK_COLS;
    return raw;
  }, [raw]);
  ```

- On first load (key absent), seed from `tasksMock.ts` and **do not write** until first user action — this matches the countdown pattern and avoids polluting empty installs.
- On every reducer commit, write the full new `TaskCol[]`.
- Schema migration: none in v1. If a future row tightens the registry type to `TaskCol[]`, this row's guard remains correct because `isTaskColsArray` is the more specific check.

### Future events (not implemented in v1)

The following channel-key reservations are documented for traceability **only** — no implementation, no EventMap addition in this row:

- `web:tasks:card-completed { taskId, bucketId, completedAt }` — emit when a card is toggled to completed.
- `web:tasks:bucket-changed { taskId, fromBucketId, toBucketId, newDueDate, changedAt }` — emit when DnD moves a card.

These would be consumed by Statistics (#20). Adding them belongs to a later iteration; documenting the names here lets reviewers reason about the future contract.

---

## 7. Phase plan (mirrors `dev_log.md`)

- **P1 — Scaffold + read-only render**: package files, public surface stubs, seed `tasksMock.ts`, `TasksSidebar`, `TaskColumn`, `TaskCard`, `CompletedGroup` rendering the seed data; no DnD; no persistence; no host wire-up yet.
- **P2 — DnD + date-rewrite + persistence + host slot**: `dateForCol`, `tasksReducer`, HTML5 DnD wiring (`onDragStart` / `onDragOver` / `onDrop`), `.drop-target` accent highlight, topbar drag hint, `usePref` round-trip, Edit `shellRegistrations.tsx` + `apps/web/package.json`.
- **P3 — Tests + cross-vendor + real-browser sweep**: vitest suite (reducer + dateForCol + validate + RTL render), barrel test, registration test, pnpm install, typecheck, lint, manual real-browser DnD round-trip on macOS Safari/Chrome (acceptance signal from seed brief).

Each phase ends with feature-build STOP per Workflow V2 rule.

---

## 8. Out of scope

- Real Smart-Lists / Filters / Tags / Calendar Subscription navigation (sidebar rows render as decorative).
- Task create / edit / delete UI (the prototype has only toggle-complete + DnD-reschedule).
- Per-list filtering of the 4-column view (the prototype always shows all tasks regardless of `list` state — verified in `module-tasks.jsx`).
- Touch / pointer DnD (HTML5 DnD is mouse-only).
- Cross-tab realtime sync of `xai_task_cols` beyond what `usePref` already offers (it already broadcasts `storage` events; we get this for free).
- Any change to `packages/plugin-web-storage` (including tightening `TaskColsState`).
- Event emission (deferred — see §6 "Future events").

---

## 9. Open questions

(Tracked verbatim in `dev_log.md`.)

- **Q1**: Is the `Postpone +` action button on the `overdue` column a functioning button in v1, or decorative? — **Provisional answer: decorative** (prototype's button has no `onClick`). Confirm at review.
- **Q2**: When DnD moves a card *to* the `nodate` bucket, does the card lose its tag pill? — **Answer: No.** Prototype lines 195-196 say "Keep tag/inbox". Only `date`, `dateZh`, `dateLabel`, and `sub` are stripped on bucket change.
- **Q3**: Does `tasksWebModuleRegistration` need a non-empty `defaultChildPath`? — **Answer: No.** Countdown registration uses `defaultChildPath: ""` + a single `{ path: "", render }` row plus `{ path: "*", render }` for unknown sub-paths. We mirror that.
