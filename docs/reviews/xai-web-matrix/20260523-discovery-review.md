# Discovery Review — xai-web-matrix

> Roadmap row: docs/workflow/roadmap/xai-web-console.md row #13 (W2 Module)
> Seed brief: docs/reviews/xai-web-matrix/20260523-roadmap-seed.md
> ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 (port map row `module-matrix.jsx`) + §S5 (JSX→TSX rules) + §S7 (event bus rules)
> Source prototype: `web design/module-matrix.jsx` (88 LOC — smallest module in the W2 fan-out)
> Source PRD: `web design/DESIGN.md` §4.6 (Eisenhower Matrix)
> Authored by: feature-plan (xai-roadmap-loop W2 parallel-Agent mode, sibling of #17 countdown / #19 pet)

---

## 1. Problem framing

### 1.1 What is being ported

Port the Eisenhower 2×2 productivity matrix from `web design/module-matrix.jsx`
into a typed Vite + React 19 workspace package `@repo/plugin-web-matrix`.

The prototype renders four quadrants with **colored top bars**:

| Quadrant | i18n key                            | Color token (prototype) | Semantic              |
|---|---|---|---|
| Q1 | `matrix.urgent_important`           | `var(--red)`            | Urgent · Important    |
| Q2 | `matrix.not_urgent_important`       | `var(--amber)`          | Not Urgent · Important|
| Q3 | `matrix.urgent_unimportant`         | `var(--blue)`           | Urgent · Not Important|
| Q4 | `matrix.not_urgent_unimportant`     | `var(--accent)`         | Not Urgent · Not Imp. |

Within each quadrant: collapsible `Group` rows holding task `m-row` items
(checkbox, title, tag, meta, date). Group state is local (`useState<boolean>`).

### 1.2 What the seed brief adds beyond the prototype

The prototype is **read-only**: it mounts hard-coded mock tasks (`MOCK.taskCols[0].tasks`
and `MOCK.taskCols[3].tasks`) into Q4 only; Q1/Q2/Q3 are empty. **The seed brief
upgrades the spec**:

- Cards MUST be draggable between quadrants.
- A drag-between-quadrant action MUST persist (so it survives reload).
- The action MUST tag the **underlying task with priority** (priority signal that
  outlives the matrix module's local state).
- Empty-quadrant hint text MUST be bilingual (already supported via `common.no_tasks`
  in `@repo/plugin-web-tokens` i18n bundle — confirmed).
- Quadrant colors MUST use `tokens.css` semantic palette (already the prototype's
  approach — confirmed `--red` / `--amber` / `--blue` / `--accent` exist in
  `packages/plugin-web-tokens/src/tokens.css` lines 31–45).

### 1.3 Hard architectural inputs (frozen by ADR-0007 + sibling shell)

- **Package layout** — `packages/xai-web-matrix/` (NOTE: ADR §S4 names this
  `packages/plugin-web-matrix/` but the existing W1 shell ships as
  `packages/xai-web-shell/` not `packages/plugin-web-shell/`. The path-mapping
  table in ADR §S4 row `module-matrix.jsx` says `packages/plugin-web-matrix/src/`,
  but the parent slug used throughout the roadmap and dev_log convention is
  `xai-web-matrix`. This review aligns with the **directory** convention already
  established by `xai-web-shell` / `xai-web-event-bus` siblings: directory =
  `packages/xai-web-matrix/`, package name = `@repo/plugin-web-matrix`. See Q1
  for review confirmation.)
- **Module slot registration** — module is registered via `WebModuleSlotRegistration`
  contract from `@repo/xai-web-shell` (see `packages/xai-web-shell/src/types.ts`
  lines 57–66). The slot lives in `apps/web/src/routes/modules/shellRegistrations.tsx`.
  W1 already seeds a placeholder for moduleId `matrix` at railOrder 6, icon `grid4`.
  This module **replaces** that placeholder's child render.
- **JSX → TSX rules** — ADR §S5 ten rules apply (no `window.*` globals, no
  `defaultProps`, typed `useState`, no new state libs, `forwardRef` only if
  required, etc.).
- **No direct cross-plugin imports** — `xai-web-tasks` does NOT exist yet
  (search confirmed: no `packages/plugin-web-tasks/` or `packages/xai-web-tasks/`
  directory). The seed brief explicitly allows the fallback: "shares store with
  xai-web-tasks where possible; **otherwise local matrix state via
  `@repo/plugin-web-storage` `usePref`**." We MUST take the fallback path for v1.
- **Persistence registry** — new keys MUST flow through the `WebPrefRegistry`
  in `packages/plugin-web-storage/src/internal/registry.ts`. Today's registry
  has no matrix-specific key; we will register **one new key** `xai_matrix_state`
  through that registry as part of P2 (see §3.2 plan).
- **Empty-state bilingual** — `useI18n(lang).s("common.no_tasks")` already
  returns `"No tasks"` / `"暂无任务"` (confirmed in `packages/plugin-web-tokens/src/i18n.ts`
  line 24 + 219). Reuse — no new string.
- **Event bus** — cross-module signaling (e.g. notifying `xai-web-statistics`
  that a task was tagged with priority) MUST go through `emitWebEvent` from
  `@repo/xai-web-event-bus`. ADR §S7 reserves the `web:<module>:<verb>-<noun>`
  prefix. We will introduce ONE event channel `web:matrix:priority-tagged`
  (declaration deferred per §3.3) to keep the contract type-safe across
  packages.

### 1.4 What is NOT in scope (parking lot)

| Item | Why deferred |
|---|---|
| Cross-module sharing of task model with `xai-web-tasks` | Row #6 not yet started; would create a backward dependency. The matrix carries its own state in v1; a future row can introduce a shared task model and migrate `xai_matrix_state` → tasks store. |
| Adding new tasks from inside the matrix (the `+` button in the header) | Prototype only stubs the button (no handler). Seed brief does not require task creation here. Keep as a no-op button with `aria-label` to preserve the visual surface. |
| Statistics consumer wiring | `xai-web-statistics` (row #20) is the consumer; it subscribes on its own row. We only emit. |
| Drag-from-tasks-into-matrix | Tasks row #6 doesn't exist. Drag is matrix-internal in v1 (between quadrants only). |
| Mobile / touch drag | Not in the seed brief; HTML5 drag-drop is desktop-first per prototype. Touch-friendly drag is a future row. |
| Multi-select drag | Prototype has none. Out of v1. |
| Undo of a drag-between-quadrant | Not in seed brief. The persistence is the source of truth; user can drag back to undo manually. |

---

## 2. Source-prototype analysis

`web design/module-matrix.jsx` (88 LOC; smallest W2 module — note seed mentions
3460 bytes, file scan confirms ~3.2 KB) has two exported components:

### 2.1 `MatrixModule({ lang })`

- Pulls `Icon` + `MOCK` from `window.*` (must be removed per ADR §S5 rule 4).
- Builds the `quadrants[]` array of 4 entries; each has `id`, `key`, `color`,
  `tasks`, optional `extra`.
- Renders `<header>` (title + `+` and `…` icon buttons) and a `.matrix-grid`
  containing 4 `<section className="matrix-q panel">` quadrants.
- Each quadrant header carries the colored top bar via `style={{"--qc": q.color}}`
  + a CSS rule (in `web design/layout.css`) that paints `.matrix-q::before` with
  `var(--qc)`.
- Q1/Q2/Q3 are empty in the prototype; Q4 wires `overdue` tasks (and optionally
  `extra` no-date tasks) into the `<Group>` sub-renderer.

### 2.2 `Group({ label, count, tasks, lang })`

- Local collapsed/expanded `useState<boolean>` (typed in port).
- Renders chevron + label + count, then `<ul>` of `m-row` items each containing:
  - Checkbox stub `.cbx` (no handler in prototype).
  - Task title (bilingual via `t.title[lang]`).
  - Tag pill (resolved from `MOCK.tags`).
  - Static "Inbox" / "收件箱" meta.
  - Optional date (`t.date` / `t.dateZh`).

### 2.3 What needs to change for v1

| Prototype behavior | v1 behavior |
|---|---|
| Mock tasks in Q4 only | Real cards in all four quadrants, sourced from local `xai_matrix_state` (the matrix's own seed list). |
| No drag | HTML5 drag (per ADR §S5 — same approach the prototype uses elsewhere, e.g. `module-tasks.jsx` cross-column DnD). On drop into a quadrant, the card moves and the state persists. |
| Tag is decoration | The drag-between-quadrant tags the **card** with the **quadrant id** as a priority signal (`priority: "q1" | "q2" | "q3" | "q4"`). When the eventual `xai-web-tasks` row arrives, this priority field is the join key. |
| Empty state literal | `useI18n(lang).s("common.no_tasks")` — already bilingual. |
| `window.Icon` | Import from `@repo/xai-web-shell` (W1 exports icons through internal SVG render path) — see Q2. |
| `window.MOCK` | Replaced by typed seed module `packages/xai-web-matrix/src/seed/matrix-seed.ts` providing initial cards. |

---

## 3. Candidate options

The seed brief largely pre-decides the option space (W1 shell already shipped,
ADR §S4 fixes the package). The remaining design choices fall into three small
axes:

### 3.1 Axis A — Persistence shape

**A1. One key holding the entire matrix state (`xai_matrix_state`).** Value
shape: `{ q1: Card[], q2: Card[], q3: Card[], q4: Card[] }`. One read, one write
per drag-between operation. JSON codec.

- **Pro**: single source of truth; trivial to serialize; one entry in
  `PREF_REGISTRY`; one migration unit if shape changes; matches the prototype's
  `quadrants[]` shape almost 1:1.
- **Con**: each drag rewrites the entire blob (acceptable — DESIGN.md §9.2
  pattern uses JSON blobs for `xai_boards_v2` and `xai_dash_order` similarly).
- **Storage size**: bounded by visible card count; the matrix is not a Notion
  database. ≤ 1 KB typical, ≤ 10 KB pathological.

**A2. One key per quadrant (`xai_matrix_q1` .. `xai_matrix_q4`).** Four entries
in the registry.

- **Pro**: independent reads; per-quadrant write atomicity.
- **Con**: registry pollution (1 module → 4 keys); cross-quadrant drag still
  rewrites two keys non-atomically (with a chance of partial-write inconsistency
  on tab close mid-drag).
- **Verdict**: rejected. Atomicity matters more than partial reads here.

**A3. A `priority` field stored on each task in a future tasks store, with the
matrix re-deriving its quadrants on each render.**

- **Pro**: matches the eventual cross-module architecture (priority is a task
  property, not a matrix property).
- **Con**: requires `xai-web-tasks` to exist, which it doesn't (W2 sibling not
  started). Cannot v1.
- **Verdict**: rejected for v1; documented as a v2 migration target.

**Decision**: **A1** — single `xai_matrix_state` key. New entry in
`PREF_REGISTRY` declared from this row.

### 3.2 Axis B — Drag implementation

**B1. Native HTML5 drag-drop** (`onDragStart` / `onDragOver` / `onDrop`).

- **Pro**: matches the prototype's overall idiom (the shell row #5 already
  uses HTML5 DnD for rail-item drag-reorder — see `xai-web-shell` dev_log §
  P2 "drag-reorder + 4 rail positions"). Zero new dependencies. Works in
  Chrome / Safari 17+ / Firefox.
- **Con**: known Safari quirks with `dataTransfer.setData` on synthetic
  React events (mitigated by `dataTransfer.effectAllowed = "move"`
  + `e.preventDefault()` on `onDragOver` — same pattern shell row #5 used).

**B2. `@dnd-kit/core`** (third-party).

- **Pro**: better touch support; keyboard accessibility; cleaner React idiom.
- **Con**: ADR §S5 rule 10 forbids "new state libs" by name (zustand /
  jotai / redux / @tanstack/store); dnd-kit is a UI lib, not a state lib,
  so technically permitted. **BUT** the wider prototype trend is HTML5 DnD
  (`module-tasks.jsx` and `shell.jsx` both use it). Adding a dep here
  fragments the W2 stack.
- **Verdict**: rejected for v1; could revisit if Safari DnD ergonomics
  become a verify blocker.

**B3. Click-to-move via a popover menu.**

- **Pro**: no drag at all → no Safari quirks; accessible by default.
- **Con**: the seed brief literally says "drag between quadrants." Violates
  acceptance signal.
- **Verdict**: rejected as primary; documented as a **fallback accessibility
  affordance** added as keyboard shortcut (Ctrl/⌘ + arrow to move focused
  card to neighbor quadrant) in P2.

**Decision**: **B1** with **B3 keyboard fallback** for a11y. No new deps.

### 3.3 Axis C — Cross-module signal

The seed brief says "tag the underlying task with priority." Three readings:

**C1. Local-only tag.** Store priority in `xai_matrix_state[*].priority`.
No event emitted. Statistics row #20 has nothing to subscribe to.

- **Pro**: simplest; no EventMap edit.
- **Con**: statistics row will need a way to learn about matrix changes
  later — adding the event then will be a backward-compat hazard.

**C2. Emit a typed event `web:matrix:priority-tagged` on every drag-between.**
Payload: `{ cardId: string; from: Quadrant | null; to: Quadrant; taggedAt: string }`.

- **Pro**: future-proof; matches ADR §S7 idiom (`web:<module>:<verb>-<noun>`);
  parallels `web:pomodoro:session-finished` and `web:habits:checkin-recorded`
  already declared in `packages/core/src/types/events.ts`.
- **Con**: requires adding an entry to `EventMap` (owner: row #4
  `xai-web-event-bus`). That row already shipped — we'd be touching
  `packages/core/src/types/events.ts` outside our write scope.

**C3. Emit the event but defer the EventMap declaration to row #4 follow-up.**

- **Pro**: matches the W1 precedent — `web:pomodoro:session-finished` and
  `web:habits:checkin-recorded` were both **declared in advance** by row #4
  for owner rows that hadn't shipped yet. We can request a similar
  pre-declaration of `web:matrix:priority-tagged`.
- **Verdict**: this is the only honest path. Either declare-now (the W1
  precedent) or **postpone the event entirely** to a future row.

**Decision**: **C2 with declare-now approach** — write the EventMap entry as
part of this row's P2 phase, modeled exactly on the existing
`web:pomodoro:session-finished` / `web:habits:checkin-recorded` declarations.
This is the **one** acceptable edit outside our nominal write scope, and the
sibling parallel agents (#17 countdown / #19 pet) face the same constraint —
this row is explicitly granted the `core/types/events.ts` write per ADR §S7
("EventMap source-of-truth stays in @repo/core") + the cross-module signal
clause in the parallel-Agent worker brief.

**See Q3 for review confirmation on the write-scope expansion.**

---

## 4. External research

**No external research required.** This row is a pure JSX → TSX port plus a
typed event declaration. No new libraries are selected (HTML5 DnD is built-in;
testing uses the existing Vitest setup; styling uses the existing
`tokens.css`). Per the feature-plan agent template's external-research clause:

> "if the feature is purely internal business logic with no external dependency
> decisions, skip this step and note 'No external research required' in the
> discovery review"

→ This row qualifies. The only new "dependency" is workspace deps
(`@repo/xai-web-shell`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`,
`@repo/xai-web-event-bus`, `@repo/core`) all already in the monorepo.

---

## 5. Recommendation

Ship `xai-web-matrix` as a workspace package `@repo/plugin-web-matrix` at
`packages/xai-web-matrix/src/` with the following shape:

- `index.ts` — public surface: `{ MatrixModule, matrixSlotRegistration, MATRIX_EMPTY_STATE_KEY }`.
- `MatrixModule.tsx` — top-level component (typed props), four quadrants.
- `Quadrant.tsx` — single quadrant section with colored top bar.
- `Card.tsx` (or `MatrixRow.tsx`) — draggable card row.
- `Group.tsx` — collapsible group inside a quadrant (port of prototype `Group`).
- `internal/seed.ts` — typed seed cards (replaces `window.MOCK`).
- `internal/quadrant.ts` — `Quadrant` discriminated union + colour-token mapping.
- `internal/usePersistedMatrix.ts` — `usePref<MatrixState>("xai_matrix_state")` wrapper.
- `internal/drag.ts` — typed HTML5 DnD helpers (`onDragStart`, `onDragOver`, `onDrop`).
- `matrix.css` — quadrant grid, top-bar paint via `var(--qc)`, hover-and-drop states.

Persistence: register `xai_matrix_state` in
`packages/plugin-web-storage/src/internal/registry.ts` (one new entry, JSON codec).

Event channel: declare `web:matrix:priority-tagged` in
`packages/core/src/types/events.ts` (one new entry, modeled on
`web:pomodoro:session-finished`).

Shell wiring: replace the `matrix` placeholder slot in
`apps/web/src/routes/modules/shellRegistrations.tsx` (railOrder 6, already
present) so the child route renders `<MatrixModule lang={lang} />`.

---

## 6. Risks + open questions

### 6.1 Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Safari HTML5 DnD synthetic-event quirks (shipped row #5 hit this too) | Medium | Apply the same `dataTransfer.effectAllowed = "move"` + `e.preventDefault()` discipline shell row #5 documented as verify gate M9. Verify on Safari 17+ as part of the cross-vendor gate. |
| R2 | Adding `xai_matrix_state` to `PREF_REGISTRY` requires editing `packages/plugin-web-storage/src/internal/registry.ts` — outside our nominal write scope | Medium | Declared in §3.1; the row #3 `xai-web-persistence-contract` shipped its registry with explicit reservation slots for owner-row additions (see registry.ts lines 296–319 "Proposed keys — ADR-0007 §S8 reservation"). We add **one** new entry, same pattern. **Q3** confirms with feature-review. |
| R3 | Adding `web:matrix:priority-tagged` to `EventMap` requires editing `packages/core/src/types/events.ts` — also outside nominal scope | Medium | See §3.3 + Q3. W1 precedent: `web:pomodoro:session-finished` and `web:habits:checkin-recorded` were both declared in advance for not-yet-shipped owner rows. Same one-line addition. |
| R4 | Parallel siblings (#17 countdown / #19 pet) may touch the same `events.ts` / `registry.ts` files in the same window — merge conflict risk | Medium | All three rows touch **different lines** of `events.ts` and `registry.ts`. The agents are each adding one entry near the bottom of their respective registries. Coordination is via plain Git merge (auto-mergeable in 99% of cases — append-only additions). Worst case: human resolves a 3-way merge with all three rows' single-line entries. |
| R5 | Empty-quadrant hint i18n string `common.no_tasks` already exists but `matrix.q1_help` / `matrix.q2_help` etc. do NOT exist; if review wants per-quadrant hints we need to extend the bundle | Low | The seed brief says "subtle hint text bilingual" — singular, not per-quadrant. We reuse `common.no_tasks`. **Q4** asks review if this is acceptable. |
| R6 | `var(--accent)` (Q4 in the prototype) drifts when the user changes accent hue in Settings — Q4 visual identity bleeds into the theme | Low | This is the prototype's choice (line 18 of `module-matrix.jsx`). The semantic argument: Q4 is "low importance / low urgency" — using the theme accent (a calm sage color by default) is a sensible "your normal" tag. We keep `var(--accent)` for Q4 unchanged. **Q5** asks review if Q4 should instead use a neutral grey (e.g. `var(--text-3)` or `var(--border-strong)`). |
| R7 | If `xai-web-tasks` ships later and wants to own the matrix's task model, the `xai_matrix_state` blob becomes a migration target | Low | Document this as a known future migration in `design.md`. The registry's `schemaVersion: 1` field is the migration anchor. |
| R8 | Cross-quadrant drag while the same key is being written by `usePref`'s autosave debounce → race | Low | `usePref` from `@repo/plugin-web-storage` already debounces; one drag = one write; the React state is the source of truth between writes. Same pattern shell row #5 used for `xai_rail_order`. |

### 6.2 Open questions for feature-review

- **Q1** — Directory name: `packages/xai-web-matrix/` (matches existing
  `packages/xai-web-shell/` sibling convention) vs `packages/plugin-web-matrix/`
  (matches ADR §S4 port-map table exactly). **Planner recommendation**:
  `packages/xai-web-matrix/` (directory) + `@repo/plugin-web-matrix` (package
  name in `package.json`). This is the **same hybrid** the shipped W1 rows
  adopted: directory uses the `xai-web-*` slug, package name uses
  `@repo/plugin-web-*`. ADR §S4 specifies the latter; the former is the
  established convention.
- **Q2** — Icons import: the prototype uses `window.Icon` for `plus`, `dots`,
  `chevD`. These are inside `@repo/xai-web-shell`'s internal icon set. The
  cleanest paths are: (a) re-render the SVGs inline in this package
  (small — 3 glyphs), or (b) request that `@repo/xai-web-shell` expose its
  `Icon` component on the public surface. **Planner recommendation**: (a)
  inline the 3 SVG glyphs in `internal/icons.tsx` (matches prototype's
  one-file approach; no upstream change). Total ~ 30 LOC. Review can pick.
- **Q3** — Write scope expansion: this row needs to write **one** new entry
  each to (a) `packages/plugin-web-storage/src/internal/registry.ts` and
  (b) `packages/core/src/types/events.ts`. Both are out of our nominal write
  scope, but both follow W1 precedent for additive registry/EventMap entries.
  Confirm acceptable, OR direct us to a sibling-coordination path (e.g.
  defer event entry to a row #4 follow-up).
- **Q4** — Empty-quadrant hint: reuse `common.no_tasks` (one string for all
  4 quadrants) vs add per-quadrant hints like `matrix.q1_empty_hint`
  (4 new strings × 2 langs = 8 new i18n keys). Planner recommendation:
  reuse `common.no_tasks` (seed brief says "subtle hint" — singular).
- **Q5** — Q4 color: keep `var(--accent)` (prototype) or switch to neutral
  grey (e.g. `var(--text-3)`). Planner recommendation: keep `var(--accent)`
  (semantic argument — see R6).
- **Q6** — Card model: in v1, the matrix owns its own `MatrixCard` type
  (`{ id, title, titleZh?, dueDate? }`). When `xai-web-tasks` arrives, this
  type either (a) gets extended to reference a task by `taskId` (one-to-one
  with tasks store) or (b) gets replaced by `Task` outright. Planner
  recommendation: design `MatrixCard` so that adding `taskId?: string`
  later is a non-breaking change.
- **Q7** — Drag fallback for a11y: include the keyboard fallback
  (Ctrl/⌘ + ←/→/↑/↓) in P2, or defer to a post-ship row. Planner
  recommendation: include in P2; the implementation cost is small (one
  `onKeyDown` per card, ~ 15 LOC), and matches the cross-vendor verify
  expectation.

---

## 7. Acceptance criteria mapping

From the seed brief §Acceptance signal:

> Matrix view renders 4 quadrants, drag-between persists, all strings bilingual,
> accessible labels present.

| Signal | Mechanism in v1 |
|---|---|
| Renders 4 quadrants | `MatrixModule` renders 4 `<Quadrant>` sections; each has a colored top bar via `var(--qc)`. Verified by RTL render test (`test.md` AC-RENDER-1). |
| Drag-between persists | HTML5 DnD → `usePref<MatrixState>("xai_matrix_state").setValue(next)`. Verified by RTL fire-event-driven drag-drop test + manual cross-vendor reload check (`test.md` AC-DND-1, AC-DND-2, AC-PERSIST-1). |
| All strings bilingual | `useI18n(lang).s("matrix.*")` for titles; `common.no_tasks` for empty state. All 4 quadrant titles already in `@repo/plugin-web-tokens` i18n bundle (confirmed). Verified by snapshot at `lang="en"` + `lang="zh"` (`test.md` AC-I18N-1). |
| Accessible labels present | `<section role="group" aria-labelledby={`q${idx}-title`}>` per quadrant; cards have `role="button"` + `aria-grabbed` during drag; the keyboard fallback adds full kbd ops. Verified via `@testing-library/jest-dom` `toHaveAccessibleName` (`test.md` AC-A11Y-1). |

Plus seed-brief hard constraints:

| Hard constraint | Mechanism |
|---|---|
| Quadrant colors via `tokens.css` palette | `var(--red)` / `var(--amber)` / `var(--blue)` / `var(--accent)` only — no hex. Verified by CSS lint at build time (`test.md` AC-TOKENS-1). |
| Drag-between persists to underlying task model (share store with `xai-web-tasks` where possible — otherwise local matrix state via `usePref`) | Falls to "otherwise" branch (tasks row not started). Local matrix state via `xai_matrix_state` in `WebPrefRegistry`. (`test.md` AC-PERSIST-1, AC-PERSIST-2.) |
| Empty-quadrant subtle bilingual hint | `s("common.no_tasks")` — already exists in EN + ZH bundle. (`test.md` AC-I18N-2.) |
| Module registers via `@repo/xai-web-shell` slot pattern | Update `apps/web/src/routes/modules/shellRegistrations.tsx` row `matrix` to point at `MatrixModule`. (`test.md` AC-SHELL-1.) |
| Verify Cross-vendor: yes | Manual Safari 17+ / Chrome / Firefox smoke for drag + reload + RTL written for jsdom (drag emulation via `fireEvent.dragStart/dragOver/drop`). (`test.md` AC-XVENDOR-1.) |

---

## 8. Frozen assumptions (output of this discovery)

These become the inputs to `design.md` / `api.md` / `test.md`:

1. Package directory: `packages/xai-web-matrix/`. Package name: `@repo/plugin-web-matrix`.
2. Public surface: `MatrixModule` (default-exported and named), `matrixSlotRegistration` (`WebModuleSlotRegistration`), `MATRIX_STORAGE_KEY = "xai_matrix_state"` constant for tests.
3. Persistence: single key `xai_matrix_state`, JSON codec, registered in `WebPrefRegistry`, schemaVersion 1, owner `xai-web-matrix`, category `module`. Value shape: `{ schemaVersion: 1, q1: MatrixCard[], q2: MatrixCard[], q3: MatrixCard[], q4: MatrixCard[] }`.
4. Card model: `MatrixCard = { id: string; title: { en: string; zh: string }; date?: string; dateZh?: string; tag?: string; taskId?: string }`. The `taskId?` field is reserved for the future `xai-web-tasks` join; v1 leaves it `undefined`.
5. Drag implementation: HTML5 DnD (`onDragStart` / `onDragOver` / `onDrop`); no third-party lib.
6. Keyboard a11y fallback: `Ctrl/⌘ + ArrowLeft/Right/Up/Down` to move the focused card to the neighbor quadrant (wrap-around within the 2×2).
7. Event channel: `web:matrix:priority-tagged` with payload `{ cardId: string; from: Quadrant | null; to: Quadrant; taggedAt: string }`. Declared in `packages/core/src/types/events.ts`. Emitted on every successful drag-between (or keyboard-move) action.
8. Color tokens: Q1 `var(--red)`, Q2 `var(--amber)`, Q3 `var(--blue)`, Q4 `var(--accent)`. No hex literals anywhere in `matrix.css`.
9. Empty-state copy: `useI18n(lang).s("common.no_tasks")` — no new i18n keys.
10. Shell wiring: `apps/web/src/routes/modules/shellRegistrations.tsx` row `matrix` (railOrder 6, icon `grid4`) child render becomes `<MatrixModule lang={lang} />`. This is a one-line swap of the `render` field — placeholder remains for `*` child path until a sub-route is needed.
11. No new deps added to `package.json` beyond workspace `@repo/*` deps.
12. Verify Cross-vendor: yes (Safari 17+ / Chrome / Firefox manual smoke for drag-drop + reload + keyboard fallback).

---

## 9. Phase plan preview (full plan lands in `dev_log.md`)

**P1 — Package skeleton + read-only render (4 quadrants, no drag).**

- Create `packages/xai-web-matrix/` (package.json + tsconfig.json + manifest.json + vitest.config.ts).
- Implement `MatrixModule.tsx`, `Quadrant.tsx`, `Group.tsx`, seed cards.
- `matrix.css` with token-based colored top-bars.
- Bilingual rendering verified (snapshot tests).
- Replace placeholder in `apps/web/src/routes/modules/shellRegistrations.tsx`.
- No persistence, no DnD yet. Visible in rail. Smoke test green.

**P2 — Drag-between-quadrant + persistence + event emit + keyboard fallback.**

- Add `xai_matrix_state` entry to `packages/plugin-web-storage/src/internal/registry.ts`.
- Add `web:matrix:priority-tagged` entry to `packages/core/src/types/events.ts`.
- Implement `internal/drag.ts` + wire into `Card.tsx`.
- Implement keyboard fallback per Q7.
- Vitest cases for DnD via `fireEvent` + reload-cycle persistence assertion + event-emit assertion.

**P3 — Test polish + cross-vendor manual smoke + docs sync.**

- Edge cases: empty all 4 quadrants, drag into same quadrant (no-op), drag the only card out of a quadrant (triggers empty state), keyboard at boundary (no-op or wrap per Q7).
- Manual smoke checklist in `test.md` (Safari 17+ / Chrome / Firefox).
- Sync `design.md` / `api.md` / `test.md` with any P1/P2 deltas.
- `PLUGIN_MAP.md` row addition handled by `ship` (not us).

3 phases — within the 2–3 phase budget stated in the parallel-Agent brief.

---

## 10. Sources

- `docs/reviews/xai-web-matrix/20260523-roadmap-seed.md` (seed brief).
- `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map), §S5 (TSX rules), §S7 (event bus).
- `web design/module-matrix.jsx` (88 LOC prototype, lines 1–88).
- `web design/DESIGN.md` §4.6 (Eisenhower spec, lines 156–159).
- `packages/xai-web-shell/src/types.ts` lines 57–66 (`WebModuleSlotRegistration`).
- `packages/xai-web-shell/src/index.ts` (W1 public surface).
- `packages/plugin-web-tokens/src/i18n.ts` lines 67–73 (matrix EN bundle) + lines 261–267 (matrix ZH bundle) + line 24 + 219 (`common.no_tasks`).
- `packages/plugin-web-tokens/src/tokens.css` lines 31–45 (color tokens `--red`, `--amber`, `--blue`, `--accent`).
- `packages/plugin-web-storage/src/internal/registry.ts` lines 129–319 (existing `PREF_REGISTRY` entries — pattern to follow).
- `packages/core/src/types/events.ts` lines 171–215 (existing `web:*` event entries — pattern to follow).
- `apps/web/src/routes/modules/shellRegistrations.tsx` line 49 (matrix placeholder slot).
- `packages/xai-web-shell/docs/dev_log.md` (cross-vendor verify pattern reference; R1 mitigation precedent).
