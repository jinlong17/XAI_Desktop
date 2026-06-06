# Design Snapshot — xai-web-matrix

> Companion to: `docs/reviews/xai-web-matrix/20260523-discovery-review.md`
> Governing ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map row `module-matrix.jsx`) + §S5 (JSX→TSX) + §S7 (event bus)
> Roadmap row: `docs/workflow/roadmap/xai-web-console.md` row #13 (W2 Module — Eisenhower 2×2)

---

## 1. Decision snapshot

| Field | Value |
|---|---|
| Selected Option | **C** — Vite+TS package at `packages/xai-web-matrix/` (per ADR-0007 §S4) with HTML5 DnD (axis B1), single-blob persistence in `xai_matrix_state` (axis A1), and typed event `web:matrix:priority-tagged` emit on drag-between (axis C2/declare-now). |
| Review Doc | `docs/reviews/xai-web-matrix/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |
| Frozen Assumptions | See `discovery-review.md` §8 (12 items) — copied below by reference. |
| Package directory | `packages/xai-web-matrix/` |
| Package name | `@repo/plugin-web-matrix` |
| Module id (rail) | `"matrix"` — already a `WebModuleId` literal in `packages/core/src/types/events.ts` line 7. |
| Rail order | 6 (already placeholder-mounted in `apps/web/src/routes/modules/shellRegistrations.tsx`). |
| Rail icon | `"grid4"` (already in `WebShellIconName` enum). |
| Status (dev_log) | PLAN_DRAFT → NEEDS_REVIEW |

### 1.1 Frozen assumptions (verbatim from discovery §8)

1. Package directory: `packages/xai-web-matrix/`. Package name: `@repo/plugin-web-matrix`.
2. Public surface: `MatrixModule` (default + named export), `matrixSlotRegistration` (`WebModuleSlotRegistration`), `MATRIX_STORAGE_KEY = "xai_matrix_state"` constant for tests.
3. Persistence: single key `xai_matrix_state`, JSON codec, schemaVersion 1, owner `xai-web-matrix`, category `module`. Value: `{ schemaVersion: 1; q1: MatrixCard[]; q2: MatrixCard[]; q3: MatrixCard[]; q4: MatrixCard[] }`.
4. Card model: `MatrixCard = { id: string; title: { en: string; zh: string }; date?: string; dateZh?: string; tag?: string; taskId?: string }`.
5. Drag: HTML5 DnD only — no `@dnd-kit/*` etc.
6. Keyboard a11y fallback: `Ctrl/⌘ + ArrowLeft|Right|Up|Down` moves the focused card to the neighbour quadrant.
7. Event channel: `web:matrix:priority-tagged` with payload `{ cardId; from: Quadrant | null; to: Quadrant; taggedAt: string }` — declared in `@repo/core/types`.
8. Color tokens: Q1 `var(--red)`, Q2 `var(--amber)`, Q3 `var(--blue)`, Q4 `var(--accent)`. Zero hex literals.
9. Empty-state copy: `useI18n(lang).s("common.no_tasks")` — no new i18n keys.
10. Shell wiring: `apps/web/src/routes/modules/shellRegistrations.tsx` row `matrix` child render becomes `<MatrixModule lang={lang} />`.
11. No new external deps in `package.json` (workspace `@repo/*` only).
12. Verify Cross-vendor: yes (Safari 17+ / Chrome / Firefox).

---

## 2. Dependency overview

### 2.1 Workspace dependencies (`package.json`)

```jsonc
"dependencies": {
  "@repo/core":                 "workspace:*",   // WebModuleId, EventMap
  "@repo/plugin-web-tokens":    "workspace:*",   // useI18n + tokens.css + Lang
  "@repo/plugin-web-storage":   "workspace:*",   // usePref + WebPrefKey
  "@repo/xai-web-event-bus":    "workspace:*",   // emitWebEvent + useWebEventListener
  "@repo/xai-web-shell":        "workspace:*"    // WebModuleSlotRegistration
},
"peerDependencies": {
  "react":     "^19",
  "react-dom": "^19"
}
```

`react-router@^7.15` is NOT a direct dep — `MatrixModule` doesn't navigate; the
shell drives navigation via the slot system. (If a sub-route is ever added,
react-router moves to peerDeps.)

### 2.2 Cross-package dependency graph

```
@repo/plugin-web-matrix (this row)
  ├─ depends on → @repo/core                  [WebModuleId, EventMap]
  ├─ depends on → @repo/plugin-web-tokens     [useI18n, tokens.css, Lang]
  ├─ depends on → @repo/plugin-web-storage    [usePref, registry export]
  ├─ depends on → @repo/xai-web-event-bus     [emitWebEvent]
  └─ depends on → @repo/xai-web-shell         [WebModuleSlotRegistration type]

apps/web (host)
  └─ depends on → @repo/plugin-web-matrix     [MatrixModule + matrixSlotRegistration]
                                              wired in shellRegistrations.tsx
```

No reverse edges. No imports from other `xai-web-*` plugins. Conforms to
ADR-0003 (plugin platform-neutrality) and CLAUDE.md "Code Boundaries".

### 2.3 Files touched outside `packages/xai-web-matrix/`

Three files outside the package directory will be edited. Each is a single
additive write — no behavior changes for existing code.

| File | Change | Phase | Risk |
|---|---|---|---|
| `apps/web/src/routes/modules/shellRegistrations.tsx` | Replace `placeholder("matrix", ...)` with `matrixSlotRegistration` from `@repo/plugin-web-matrix` | P1 | Low — same row in array, same `moduleId` / `railOrder` / `icon` / `i18nKey`. |
| `packages/plugin-web-storage/src/internal/registry.ts` | Append `xai_matrix_state` entry to `PREF_REGISTRY` | P2 | Low — additive (W1 `xai-web-persistence-contract` row designed registry to be extensible per §S8). |
| `packages/core/src/types/events.ts` | Append `web:matrix:priority-tagged` entry to `EventMap` | P2 | Low — same additive pattern as `web:pomodoro:session-finished` (already shipped). |

### 2.4 PLUGIN_MAP impact

After ship, add a new row to `docs/PLUGIN_MAP.md`:

| Plugin | Status | Owner | Notes |
|---|---|---|---|
| `@repo/plugin-web-matrix` | In-Dev → Production (post-ship) | xai-web-matrix row #13 | Eisenhower 2×2; consumes `xai-web-shell`/`plugin-web-tokens`/`plugin-web-storage`/`xai-web-event-bus`. |

(PLUGIN_MAP update belongs to the `ship` step, not this plan.)

---

## 3. Component composition

```
<MatrixModule lang={lang}>                   // module shell + header
  └─ <div class="matrix-grid">               // CSS grid 2x2
       ├─ <Quadrant id="q1" color="--red"    label={t.matrix.urgent_important}      cards={state.q1}/>
       ├─ <Quadrant id="q2" color="--amber"  label={t.matrix.not_urgent_important}  cards={state.q2}/>
       ├─ <Quadrant id="q3" color="--blue"   label={t.matrix.urgent_unimportant}    cards={state.q3}/>
       └─ <Quadrant id="q4" color="--accent" label={t.matrix.not_urgent_unimportant} cards={state.q4}/>

<Quadrant>
  ├─ <header class="q-head" style={{--qc: var(--red|amber|blue|accent)}}>
  │    ├─ <span class="q-number">1..4</span>
  │    ├─ <h2 id="q{N}-title">{label}</h2>
  │    ├─ <button class="icon-btn" aria-label="add card">+</button>     (no-op stub in v1)
  │    └─ <button class="icon-btn" aria-label="more actions">…</button> (no-op stub in v1)
  └─ <div class="q-body" onDragOver={...} onDrop={...}>
       ├─ {empty? <div class="q-empty">{s("common.no_tasks")}</div>
       └─ : <Group …> with rows of <Card …>}

<Card>
  ├─ draggable="true"
  ├─ onDragStart / onKeyDown
  ├─ checkbox stub
  ├─ <span class="m-title">{title[lang]}</span>
  ├─ optional <tag/> pill
  ├─ static "Inbox" / "收件箱" meta
  └─ optional <span class="m-date mono">{date}</span>
```

### 3.1 Module-internal state

Single root state in `MatrixModule`:

```ts
type MatrixState = {
  schemaVersion: 1;
  q1: MatrixCard[];
  q2: MatrixCard[];
  q3: MatrixCard[];
  q4: MatrixCard[];
};

const [state, setState] = usePref("xai_matrix_state");  // typed via WebPrefRegistry
```

Reducer-free — drag operations are a single `setState(next)` call. Group
collapse state is local to each `<Group>` via `useState<boolean>`.

### 3.2 No React Context

The shell-provided `lang` flows in as a prop. No context provider added — keeps
the module tree-shakeable and avoids `useContext` cycles. (Mirrors shell
row #5's choice to pass `lang` as a prop into `Topbar` / `AppRail`.)

---

## 4. CSS strategy

A single side-effect-imported `matrix.css` declares:

- `.matrix-grid` — 2×2 CSS grid, gap, responsive collapse rule.
- `.matrix-q` — base panel (uses `--bg-panel-2`).
- `.matrix-q::before` — colored top bar painted from `var(--qc)` (a per-quadrant
  custom-property set inline as `style={{ ['--qc' as never]: 'var(--red)' }}`).
- `.q-head`, `.q-number`, `.q-body`, `.q-empty`, `.m-rows`, `.m-row`, `.m-title`,
  `.m-meta`, `.m-date`, `.cbx` — same class names the prototype used (`web design/layout.css`).
- `.m-row[draggable]:hover` cursor / opacity affordances.
- `.q-body[data-dragover="true"]` — highlight when a draggable enters this
  quadrant's drop zone (visual feedback for cross-vendor verify gate).

All colors via tokens; CSS lint test (`tokens-smoke.test.ts` precedent in
`plugin-web-tokens`) confirms zero hex literals at build time (AC-TOKENS-1).

`matrix.css` is imported as a side-effect from `MatrixModule.tsx` (Vite's
standard pattern). The package's `package.json` declares `"sideEffects":
["./src/matrix.css"]` so tree-shaking does not strip it.

---

## 5. Persistence design

### 5.1 Registry entry (additive write in P2)

To be appended to `packages/plugin-web-storage/src/internal/registry.ts`:

```ts
// ---- Matrix (§S8 — declared by xai-web-matrix #13) -------------------------
xai_matrix_state: {
  key: "xai_matrix_state",
  codec: "json",
  default: { schemaVersion: 1, q1: [], q2: [], q3: [], q4: [] } as MatrixState,
  schemaVersion: 1,
  owner: "xai-web-matrix",
  category: "module",
} satisfies PrefEntry<MatrixState>,
```

`MatrixState` type is declared in the same file (mirroring `RailItemId`,
`DashWidgetId`, etc. on lines 55–88) since it's an "opaque to storage layer"
type whose real declaration lives in `@repo/plugin-web-matrix`.
Plan: declare `MatrixState` and `MatrixCard` as `unknown`-aliased exports in
`registry.ts` (same pattern as `BoardsState = unknown`), with the canonical
types living in `@repo/plugin-web-matrix/src/types.ts`. Consumers cast through
`@repo/plugin-web-matrix`'s typed surface.

### 5.2 Read/write path

- **Read**: `usePref("xai_matrix_state")` returns `[state, setState, meta]`.
- **Write on drag**: `setState({ ...state, [from]: state[from].filter(c => c.id !== cardId), [to]: [...state[to], movedCard] })`.
- **Debounce**: `usePref` writes the underlying localStorage synchronously
  through `setPref`, with an internal debounce window for autosave when used
  with `usePrefAutosave` (we use `usePref`, not the autosave variant, since
  drag-end is a discrete event — instant write is correct).
- **Cross-tab**: `usePref` already wires `storage` event listener (per row #3
  test `usePref.test.tsx`). Two-tab drag stays consistent.
- **Default**: `{ schemaVersion: 1, q1: [], q2: [], q3: [], q4: [] }`. On first
  mount, `MatrixModule` checks `state.q1.length + ... + state.q4.length === 0`
  and seeds with the typed prototype cards from `internal/seed.ts` (8 cards —
  the prototype's MOCK overdue + nodate). The seed is **opt-in**: pure empty
  starting state would feel broken on first launch; the prototype always
  shipped with seed data visible.

### 5.3 Migration discipline

`schemaVersion: 1`. If a v2 introduces (a) `taskId` joining to `xai-web-tasks`,
(b) priority-overrides per-card, or (c) a 5th "later" bin, then:

1. Bump `schemaVersion` to 2 in the registry entry.
2. Register a migration via `packages/plugin-web-storage`'s
   `internal/migrate.ts` (today exports a stub `migrate` per W1).
3. Document in `design.md` and bump dev_log iteration.

The schema is purposefully a top-level object (not array) so adding fields is
trivially additive.

---

## 6. Drag-and-drop design

### 6.1 HTML5 DnD wiring

```tsx
// Card.tsx (simplified)
<li
  className="m-row"
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData("application/x-xai-matrix-card", card.id);
    e.dataTransfer.effectAllowed = "move";
  }}
  data-card-id={card.id}
  data-quadrant={quadrant}
  tabIndex={0}
  onKeyDown={handleKbdMove}     // a11y fallback (see §6.3)
  aria-grabbed={isDragging}     // dynamic via context or local state
  role="listitem"
>
  …
</li>

// Quadrant.tsx
<div
  className="q-body"
  onDragOver={(e) => {
    if (!e.dataTransfer.types.includes("application/x-xai-matrix-card")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }}
  onDragLeave={() => setIsDragOver(false)}
  onDrop={(e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("application/x-xai-matrix-card");
    if (!cardId) return;
    onCardDropped(cardId, /* into */ quadrant);
    setIsDragOver(false);
  }}
  data-dragover={isDragOver}
  data-quadrant={quadrant}
>
  …
</div>
```

### 6.2 The `onCardDropped` reducer

```ts
function moveCard(
  state: MatrixState,
  cardId: string,
  to: Quadrant,
): { next: MatrixState; from: Quadrant | null } {
  // 1. Find which quadrant has the card; if same as `to`, return { next: state, from: to } (no-op).
  // 2. Remove from from-quadrant, append to to-quadrant.
  // 3. Return next state plus the resolved from-quadrant for the event payload.
}
```

After `setState(next)`:

```ts
emitWebEvent("web:matrix:priority-tagged", {
  cardId,
  from,                   // null if the card was missing (shouldn't happen with our state shape)
  to,
  taggedAt: new Date().toISOString(),
});
```

### 6.3 Keyboard a11y fallback

Each card is `tabIndex={0}`. While focused, `Ctrl/⌘ + Arrow`:

- `ArrowLeft` from Q2 → Q1; from Q1 → Q2 (wrap); from Q4 → Q3; from Q3 → Q4 (wrap).
- `ArrowRight` — mirror.
- `ArrowUp` from Q3 → Q1; from Q4 → Q2; from Q1 → Q3 (wrap); from Q2 → Q4 (wrap).
- `ArrowDown` — mirror.

Modifier requirement (`Ctrl/⌘`) prevents accidental moves when arrowing inside
a text input that gets focused as part of a future row's edit-card feature.

The keyboard path calls the **same** `onCardDropped(cardId, target)` reducer,
so the event emit + persistence are unified.

### 6.4 Safari DnD quirk mitigation

Three known issues addressed:

1. `dataTransfer.setData` requires a non-empty MIME type — we use the
   `application/x-xai-matrix-card` custom type rather than `text/plain`
   (avoids accidental text-drop into other modules' drop zones).
2. `onDragOver` MUST call `e.preventDefault()` else the drop event never fires
   (Chromium + Safari both enforce this; explicitly done above).
3. `effectAllowed = "move"` + `dropEffect = "move"` make the cursor render
   the same across vendors.

These are exactly the patterns shell row #5 verified (`xai-web-shell` dev_log
references "M9 manual verify gate" for the same issue family).

---

## 7. Event design

### 7.1 EventMap entry (additive write in P2)

To be appended to `packages/core/src/types/events.ts`, modeled on lines 195–215:

```ts
// Matrix priority-tagged (owner: xai-web-matrix row #13)
'web:matrix:priority-tagged': {
  /** Card id that just changed priority quadrant. */
  cardId: string;
  /** Source quadrant — null if the card was just seeded (no-op for v1). */
  from: WebMatrixQuadrant | null;
  /** Destination quadrant — Q1 | Q2 | Q3 | Q4. */
  to: WebMatrixQuadrant;
  /** ISO timestamp at the moment of the drag-end / keyboard-move commit. */
  taggedAt: string;
};
```

With a small supporting type at the top of `events.ts`:

```ts
/** Eisenhower quadrant id used by web:matrix:* channels. */
export type WebMatrixQuadrant = 'q1' | 'q2' | 'q3' | 'q4';
```

### 7.2 Emit policy

- Emit ONCE per successful drag-between or keyboard-move that **changes** the
  quadrant (no event if drop target = source).
- Do NOT emit on initial seed (`from: null` is reserved for a future case;
  v1 never emits with `from: null`).
- Do NOT emit on `usePref` cross-tab hydration (other tab is the originator).

### 7.3 Subscribers

- **v1**: no internal subscribers within this package.
- **Future**: `xai-web-statistics` (row #20) can subscribe via
  `useWebEventListener("web:matrix:priority-tagged", ...)` to track priority
  changes for the user. The event is declared **proactively** so row #20 has
  a stable shape when it lands.

---

## 8. Shell slot registration

A new `matrixSlotRegistration` is exported from
`packages/xai-web-matrix/src/index.ts`:

```ts
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { MatrixModule } from "./MatrixModule.js";

export const matrixSlotRegistration: WebModuleSlotRegistration = {
  moduleId: "matrix",
  label: "Matrix",
  defaultChildPath: "",
  children: [
    {
      path: "",
      render: ({ /* capabilities */ }) => <MatrixModule lang={/* via host */} />,
    },
    {
      path: "*",
      render: ({ /* capabilities */ }) => <MatrixModule lang={/* via host */} />,
    },
  ],
  icon: "grid4",
  railOrder: 6,
  i18nKey: "nav.matrix",
  showInRail: true,
};
```

The `lang` prop needs to come from the shell context. We use
`useWebShell()` (exported from `@repo/xai-web-shell`) inside a small wrapper
component:

```tsx
function MatrixSlotHost() {
  const { lang } = useWebShell();
  return <MatrixModule lang={lang} />;
}
```

And reference `MatrixSlotHost` in `children[*].render`. This matches the
pattern hinted by the shell's `useWebShell` export.

### 8.1 Replacing the placeholder

In `apps/web/src/routes/modules/shellRegistrations.tsx`, line 49 becomes:

```ts
import { matrixSlotRegistration } from "@repo/plugin-web-matrix";

export const webShellModuleRegistrations: WebModuleSlotRegistration[] = [
  placeholder("ai",         "XAI Chat",   "sparkle",   1),
  placeholder("tasks",      "Tasks",      "check",     2),
  placeholder("board",      "Boards",     "kanban",    3),
  placeholder("dashboard",  "Dashboard",  "layout",    4),
  placeholder("calendar",   "Calendar",   "calendar",  5),
  matrixSlotRegistration,                                           // <-- swap (was placeholder("matrix", …))
  placeholder("pomodoro",   "Pomodoro",   "timer",     7),
  placeholder("habits",     "Habits",     "pin",       8),
  placeholder("meditation", "Meditation", "leaf",      9),
  placeholder("countdown",  "Countdown",  "countdown", 10),
  placeholder("statistics", "Statistics", "chart",     11),
  placeholder("settings",   "Settings",   "sliders",   99, false),
];
```

---

## 9. Source mapping (prototype → port)

| Prototype location | Port location | Notes |
|---|---|---|
| `web design/module-matrix.jsx` lines 7–55 (`MatrixModule`) | `packages/xai-web-matrix/src/MatrixModule.tsx` | TSX; typed `lang` prop; no `window.MOCK`. |
| `web design/module-matrix.jsx` lines 57–86 (`Group`) | `packages/xai-web-matrix/src/Group.tsx` | TSX; typed; same collapse behavior. |
| `web design/module-matrix.jsx` lines 11–12 (`overdue` / `nodate`) | `packages/xai-web-matrix/src/internal/seed.ts` | Typed `MatrixCard[]`; bilingual titles inline. |
| `web design/module-matrix.jsx` lines 14–19 (`quadrants[]`) | Inline in `MatrixModule.tsx` | Color tokens via `style={{['--qc' as never]: 'var(--red)'}}`. |
| `web design/module-matrix.jsx` line 4 (`window.Icon`) | `packages/xai-web-matrix/src/internal/icons.tsx` | 3 inline SVGs: `plus`, `dots`, `chevD` (per Q2 planner rec — review can swap to shell-exported `Icon`). |
| `web design/module-matrix.jsx` line 5 (`window.MOCK`) | `packages/xai-web-matrix/src/internal/seed.ts` | Typed; the **only** new data source. |
| `web design/module-matrix.jsx` line 87 (`window.MatrixModule`) | `packages/xai-web-matrix/src/index.ts` export | Public surface. |
| Implicit: prototype has no drag | `packages/xai-web-matrix/src/internal/drag.ts` + `Card.tsx` | New in v1. |
| Implicit: prototype has no persistence | `packages/xai-web-matrix/src/internal/usePersistedMatrix.ts` | New in v1; wraps `usePref`. |
| Implicit: prototype has no event emit | Inline in `internal/drag.ts` | `emitWebEvent("web:matrix:priority-tagged", …)`. |

---

## 10. Out of scope (parking lot)

Carried from `discovery-review.md` §1.4 — re-stated here for the build phase
worker:

- Cross-module shared task model with `xai-web-tasks` (row #6 not started).
- `+` button in matrix header (no-op stub with `aria-label`).
- `+` button in quadrant header (no-op stub with `aria-label`).
- `…` button menus (no-op stubs).
- Statistics subscriber wiring.
- Drag-from-tasks-into-matrix.
- Touch-friendly mobile drag.
- Multi-select drag.
- Undo affordance.

If a build-phase worker considers any of these, the answer is **no — push to a
follow-up row**.

---

## 11. Verify Cross-vendor scope

Manual smoke matrix (P3):

| Vendor | Drag-between | Reload-persistence | Keyboard fallback | RTL drag emulation |
|---|---|---|---|---|
| Chrome (latest) | required | required | required | jsdom dragEvent driven |
| Safari 17+ | required | required | required | n/a (jsdom only) |
| Firefox (latest) | required | required | required | n/a (jsdom only) |

The cross-vendor verify gate is documented in `test.md` §6.

---

# Extension — xai-web-matrix-card-create (2026-05-28)

> APPENDED extension. The SHIPPED v1 content above (§1–§11) is unchanged.
> Decision snapshot only — discovery detail lives in the review doc, not here.
> NOTE: this extension REVERSES §10's "`+` button … no-op stub" parking-lot entry
> for M-01 + M-03 (now WIRED to create). The §10 stub stance held for v1; the
> P0 carve-out `b9334f7` authorizes wiring them.

## E.0 Decision snapshot

| Field | Value |
|---|---|
| Feature | `xai-web-matrix-card-create` (header/quadrant `+` → MatrixComposer → reducer create → persist) |
| Selected Option | A1 (state lift in `MatrixModule`) + B1 (`addCard` pure reducer in `internal/create.ts`) + C1 (`usePersistedMatrix().addCard` dispatch) + D1 (single bilingual title) + E1 (native `<dialog>`) + F1 (Edit/Delete DEFERRED) |
| Discovery / Review Doc | `docs/reviews/xai-web-matrix-card-create/20260528-discovery-review.md` |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-matrix-card-create.md` |
| Review Date / Version | 2026-05-28 (v1 — pending feature-review) |
| Governing Authority | ADR-0010 §D4 P0 carve-out (`docs/reviews/_p0-carve-outs/20260528-matrix-card-create.md`, commit `b9334f7`) |
| Mirror precedent | `xai-web-tasks-card-create` (SHIPPED 2026-05-28, ship `0ba69f0`) — Matrix is architecturally parallel to Tasks. |

## E.1 Frozen assumptions (extension)

Changing any of these requires re-running feature-plan, not a silent edit.

1. **No new package** — all new code lands in `packages/xai-web-matrix/src/`.
2. **New files**: `src/internal/ids.ts` (`createMatrixId`), `src/internal/create.ts` (`addCard`), `src/internal/strings.ts` (`STR_MATRIX_COMPOSER`), `src/MatrixComposer.tsx`.
3. **One new pure reducer action** — `addCard(state, draft, targetQuadrant)`, pure, symmetric with `moveCardTo`. **APPENDS** to the target quadrant (`[...state[to], newCard]`) — the Matrix move-convention (`move.ts:73` appends), **divergent from Tasks `addCard` which prepends**. Returns `state` unchanged on empty-title / unknown-quadrant; referential equality for untouched quadrants. `move.ts` had ONLY `moveCardTo` before this feature (confirmed discovery R1/R2).
4. **New exported type** — `NewMatrixCardDraft = { title: string; tag?: string }` (additive in `types.ts`). **NO `withDate`** — Matrix has no bucket-derived date model; `date`/`dateZh` stay `undefined` on user-created cards in v1.
5. **Persistence reuse** — `xai_matrix_state` (registry; json codec; owner `xai-web-matrix`). NO `packages/plugin-web-storage` edit. Created card flows through the hook's existing `setState(next as unknown as RawBlob)` boundary cast (`usePersistedMatrix.ts:38`).
6. **No new event channel** — composer state lifts into `MatrixModule` via `useState`; NO `packages/core/src/types/events.ts` edit (Calendar Q5-A precedent). Existing `web:matrix:priority-tagged` untouched; **create does NOT emit** (that channel is move-specific + consumer-less — discovery QE-D).
7. **Composer** — native `<dialog>` + `showModal()`/`close()` + `cancel`(ESC) + backdrop-click (`e.target===dialogRef.current`) + `setTimeout(0)` autofocus, mirroring `TaskComposer.tsx` verbatim. Tag picker + quadrant picker are `role="radiogroup"`.
8. **Single bilingual title** — one input fills both `title.en` + `title.zh`; label follows active UI lang.
9. **Local STR** — `src/internal/strings.ts` `STR_MATRIX_COMPOSER` (en+zh). NO `plugin-web-tokens` edit. Tag labels reuse the in-file `translateTag` map (`Card.tsx:86-95`) / `useI18n`.
10. **id** — `createMatrixId()` (`crypto.randomUUID()` + `m-<base36ts>-<rnd>` fallback) mirroring Tasks `ids.ts`. Disjoint from seed's `seed-<digit>` namespace.
11. **Dispatch via the hook** — new `usePersistedMatrix().addCard(draft, to)` method (hook returns `{ state, setState, moveCard, addCard }`); single-sourced persistence boundary, mirroring how `moveCard` is wrapped. NO emit.
12. **Default quadrant** — M-01 header `+` defaults `targetQuadrant` to `q1`; M-03 quadrant `+` defaults to the clicked quadrant; the composer's 4-quadrant radiogroup lets the user retarget.
13. **Edit + Delete DEFERRED** — recorded as the recommended NEXT increment. NOTE divergence from Tasks: Matrix `Card.tsx` onClick is FREE (no onClick today, only `onDragStart`/`onKeyDown`), so a delete-only slice is cheaper here than it was for Tasks — flagged for reviewer override (discovery QE-A).
14. **`MatrixCard.taskId`** stays `undefined` — reserved for the future `xai-web-tasks` join (separate ADR). Do NOT touch.
15. **No host-shell edit** — the slot (`matrixSlotRegistration`, railOrder 6) already SHIPPED; create needs no registration change.

## E.2 Dependency overview (extension)

No new dependencies. Reuses the SHIPPED dep set (`@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`, `@repo/xai-web-shell`) — all `Stable`/`Production`. Internal reuse: `usePersistedMatrix` (extended), `usePref("xai_matrix_state")`, `useI18n`, the `translateTag` map. New internal precedent borrowed from `packages/xai-web-tasks/src/internal/ids.ts` + `TaskComposer.tsx` (pattern only — NOT an import; no inter-plugin import per ADR-0007 §S7 / CLAUDE.md boundaries).

## E.3 Module structure delta

```
packages/xai-web-matrix/src/
├─ MatrixComposer.tsx          ← NEW: native <dialog> create form (mirror TaskComposer)
├─ types.ts                    ← +NewMatrixCardDraft (additive export)
├─ MatrixModule.tsx            ← +composer state (open/targetQuadrant) + addCard dispatch + onAdd handlers; wire M-01 header + onClick (default q1)
├─ Quadrant.tsx                ← +onAddCard?(quadrant) prop; wire M-03 +button onClick (default = this quadrant)
├─ matrix.css                  ← +composer dialog rules (appended)
└─ internal/
   ├─ ids.ts                   ← NEW: createMatrixId()
   ├─ create.ts                ← NEW: addCard pure action (appends to target quadrant)
   ├─ strings.ts               ← NEW: STR_MATRIX_COMPOSER (en+zh)
   └─ usePersistedMatrix.ts    ← +addCard(draft, to) method (calls create.ts addCard + setState; NO emit)
```

Public surface (`src/index.ts`) gains `NewMatrixCardDraft` type export. `MatrixComposer` stays internal to the module (surfaced only via `MatrixModule`).

## E.4 Phase plan (extension — mirrors dev_log Phase Plan)

- **EP1 — Data layer**: `internal/ids.ts` (`createMatrixId`), `addCard` in new `internal/create.ts`, `NewMatrixCardDraft` in `types.ts` + barrel export, `internal/strings.ts`. Unit tests (create addCard + ids shape). No UI yet. SHIPPED 54 tests stay green.
- **EP2 — Composer + wire + persistence**: `MatrixComposer.tsx` (native dialog, single title input, tag radiogroup, quadrant radiogroup, inline title-required error, ESC/backdrop/Cancel). `onAddCard` prop on `Quadrant`; wire M-01 header `+` (default q1) + M-03 quadrant `+` (default = clicked). Composer state in `MatrixModule`; save → `usePersistedMatrix().addCard` → persist. RTL + persistence tests (create → localStorage round-trip; empty-quadrant create).
- **EP3 — Integration + a11y + cross-vendor**: end-to-end create→persist→refresh test; a11y tests (autofocus, ESC, backdrop); index-barrel test for new `NewMatrixCardDraft` export; full matrix + web suites green; Codex cold-read (or deferred per ADR-0008 §S3); dev_log verify section; PLUGIN_MAP note at ship.

Each phase ends with `feature-build` STOP per Workflow V2.

## E.5 Out of scope (extension)

- Edit / Delete card UI (deferred — E.1 #13; recommended next increment, cheaper here than Tasks).
- Free-form / bucket-derived date entry (Matrix has no date model; `date` stays undefined on created cards).
- `web:matrix:priority-tagged` emit on create (move-specific channel — QE-D).
- M-02 header More / M-04 quadrant More-actions buttons (separate no-op controls; later HIDE/DISABLE batch).
- `xai-web-tasks` join (`MatrixCard.taskId` stays undefined — separate ADR).
- Statistics subscriber / sync / IndexedDB.
- Any `plugin-web-storage`, `plugin-web-tokens`, `packages/core`, or host-shell edit.
