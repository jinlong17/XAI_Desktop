# Discovery Review — xai-web-cmdk-search

| Field | Value |
|---|---|
| Slug | xai-web-cmdk-search |
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #3 (W1) |
| Seed brief | docs/reviews/xai-web-cmdk-search/20260524-roadmap-seed.md |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure scope) |
| Companion ADRs | ADR-0006 (web-face hybrid boundary) · ADR-0007 (xai-web-console build form §S4 port map + §S6 Vite SPA build form + §S7 EventMap source of truth) · ADR-0008 (CSP — NOT touched in this row; pure browser-side) |
| Source PRD | `web design/DESIGN.md` §3 (IA includes "Search" rail entry) + §6 (Component catalog mentions `.search-box`, `.modal-scrim`) + §13 (Cmd-K command palette explicitly listed as planned extension) |
| Source prototype | `web design/shell.jsx` lines 168–200 (current readOnly input + ⌘K kbd hint, no handler) |
| Source PRD inspiration | DESIGN.md §1 "Linear / Notion — 干净的命令面板、Cmd-K 风格" |
| Pattern reference | `packages/xai-web-ai-chat/docs/design.md` §"2026-05-25 Extension" — new-package + EventMap-extension pattern just SHIPPED in row #2 |
| Date | 2026-05-25 |
| Decision | Recommend **Option A — Native React 19 palette inside a new `@repo/xai-web-cmdk` package, in-memory adapter-registry, no third-party lib** |

---

## 1. Problem framing

The Web Console topbar (`packages/xai-web-shell/src/Topbar.tsx` lines 24–29)
currently renders a *placeholder* search input — a `readOnly` `<input>` with a
decorative `⌘K` `<span class="kbd">` next to it. There is no click handler,
no keyboard shortcut, no palette, no search behaviour. DESIGN.md §13 lists
**Cmd-K 全局命令面板** as the first item in "后续可扩展方向" (future
extensions) — i.e. it was always known to be deferred.

ADR-0009 §D2-G3 makes Cmd+K one of the **7 known gaps** that must close before
P1 desktop work resumes. The gap-closure manifest places it as W1 row #3,
parallel with the just-SHIPPED #2 (AI chat real-LLM adapter), to which the
present row sequels per `xai-roadmap-loop` serial dispatch.

The user-visible deliverable is:

1. The topbar input becomes a **clickable button** (still showing the `⌘K`
   affordance) that opens a centered modal palette.
2. **Cmd+K (macOS)** / **Ctrl+K (Windows/Linux)** opens the palette from any
   `/app/*` route in **<100 ms** (per Acceptance Signal in the seed brief).
3. Typing matches across **all 11 rail modules' content** + module-jump
   entries. Enter jumps + closes. Esc closes. ↑/↓ navigates results.
4. Per-module **search adapters** (pure functions) are co-located in the new
   package so each adapter stays close to its source-of-truth state shape and
   the cmdk package owns the adapter contract.

The non-trivial design call is: **how to build the cross-module index without
adding storage keys, without coupling cmdk to every module's internals, and
without breaking the 100 ms open budget**. The answer dictates package shape,
EventMap extension, and test strategy.

---

## 2. Candidate options

### Option A — Native React 19 + in-memory adapter registry, no 3rd-party lib

- New package `packages/xai-web-cmdk/` (under `xai-web-*` naming convention
  matching SHIPPED `xai-web-shell` / `xai-web-event-bus`).
- Public surface: `<CommandPalette/>` component + `registerSearchAdapter()` +
  `useCommandPalette()` hook + `SearchHit` / `ModuleSearchAdapter` types.
- 11 adapters under `src/adapters/{tasks,board,dashboard,calendar,matrix,pomodoro,habits,meditation,countdown,statistics,settings}.ts`,
  each a pure function `(query, state) => SearchHit[]`.
- Registry is a typed in-memory `Map<WebModuleId, ModuleSearchAdapter>`
  built at module load (each adapter file calls `registerSearchAdapter` at
  import-time; cmdk's `src/index.ts` imports all 11 adapter files for side
  effect).
- Palette consumer reads each module's persisted state via `usePref("xai_*")`
  **synchronously on open** — no async, no fetch, no IDB. The 100 ms budget is
  effectively "render time of a modal + 11 cheap `localStorage.getItem` JSON
  parses". On a 2020 MacBook Air this is single-digit ms.
- EventMap extension in `@repo/core/types/events.ts`:
  - `web:search:invoked` — emitted on open
  - `web:search:jump` — emitted on Enter
- Topbar input → button: `packages/xai-web-shell/src/Topbar.tsx` lines
  24–29 changed to a `<button class="search-box">` that calls
  `useCommandPalette().open()`. The decorative `<span class="kbd">⌘K</span>`
  stays.
- Global keyboard listener installed by the palette host (a single
  `<CommandPalette/>` mounted at app shell level, sibling of `<Shell/>`)
  via `useEffect` + `window.addEventListener("keydown")`.
- Highlight rendering: pure HTML-escape via a tiny `escapeHtml` helper, then
  wrap match spans with `<mark>...</mark>` strings, set via `dangerouslySetInnerHTML`
  on a span — pre-escape pass guarantees no XSS.
- Cross-vendor verify gate mandatory (per ADR-0009 D4 + per roadmap default).

**Pros**
- Zero new dependencies (lockfile diff: 0 packages).
- 100 ms budget trivially met (no async).
- Adapter contract gives 11 independent unit-test units; drift detection by
  contract tests.
- Aligns 1:1 with the just-SHIPPED row #2 pattern (new package + EventMap
  extension + cross-vendor verify).
- No CSP touch (no network fetch).
- Bundle weight: ~5 KB minified (palette + 11 adapters + escape helper).

**Cons**
- We re-implement keyboard nav + a11y semantics that a library would give us.
  Mitigated by leaning on `<dialog>` element + `role="listbox"` + `aria-selected`
  with explicit tests.
- 11 adapters drift risk: if a module changes its state shape, the adapter is
  not auto-updated. Mitigated by contract tests in P2 that pin the adapter
  signature + sample-state shape.

### Option B — Adopt the `cmdk` npm package (Radix UI)

- Add `cmdk@^1.0` (~12 KB gzip) as a workspace dep.
- Wrap the library in a thin shell; reuse 11 adapter pattern but feed it into
  `<Command.List/>` `<Command.Group/>` API.

**Pros**
- Battle-tested keyboard a11y (Cmd+K is the library's *raison d'être*).
- Less code in our repo.

**Cons**
- **Hard constraint violation** (per dispatch context HC: "DO NOT use any
  third-party cmdk library").
- Adds a third-party dep to a project that has so far kept zero non-trivial
  runtime deps (only `react` / `react-dom` / `react-router`).
- DESIGN.md §6 frozen UI specifies modal-scrim + card-modal patterns matching
  existing palette idioms — the library's default DOM tree does not match.

**Verdict: ruled out by HC.**

### Option C — Inline the palette directly inside `xai-web-shell`

- No new package; the palette lives at `packages/xai-web-shell/src/CommandPalette.tsx`.

**Pros**
- One less package to register in workspace.
- No cross-package dep churn.

**Cons**
- Inflates `xai-web-shell` (already 46 tests, 6 components, 1 provider). Cmd+K
  adds 11 adapters + palette + keyboard listener — roughly doubles the package.
- Violates the project pattern: "AI Chat is its own package, Pomodoro is its
  own package, …" — Cmd+K is feature-sized too.
- Hard to test the cmdk feature in isolation because tests would have to mount
  the entire shell.
- Mixes concerns: shell becomes a host AND a feature.

**Verdict: ruled out for clarity + test isolation.**

### Option D — Defer to a Worker / IDB index

- Build a persistent index in IndexedDB; query via Web Worker.

**Pros**
- Scales to 100 k+ items.

**Cons**
- **HC violation** ("Search index lives in-memory only — no new localStorage
  keys"; spirit also forbids IDB index).
- 11 modules together hold ~100 items today (rough order: ~30 tasks + ~20
  board cards + ~10 pomodoro sessions/week + ~8 widgets + ~5 calendar events
  + ~5 habits + ~5 meditation prefs + ~5 countdowns + ~40 settings panes).
  In-memory is fine for 2–3 orders of magnitude headroom.
- Adds complexity (Worker boot, IDB schema, eviction policy) for zero
  user-visible benefit at current scale.

**Verdict: ruled out by HC + over-engineering.**

---

## 3. Web research

**No external research required.** The decision is purely about architectural
shape, not technology selection. The only library considered (`cmdk` npm) is
explicitly forbidden by HC. React 19 + Web platform APIs (window keydown,
HTMLDialogElement, `dangerouslySetInnerHTML`) cover 100% of the implementation
surface. No license check, no maintenance check, no community-adoption check
applies.

The two URLs noted for cold-reference (not used as evidence):

- React 19 docs on `useSyncExternalStore` (for the registry subscription
  pattern, if needed in later phases) — internal knowledge sufficient.
- WHATWG HTML spec for `<dialog>` modal semantics — internal knowledge
  sufficient.

---

## 4. Tradeoffs

| Dimension | Option A (chosen) | Option B (cmdk lib) | Option C (in shell) | Option D (IDB index) |
|---|---|---|---|---|
| Lockfile diff | 0 | +1 dep | 0 | 0 (if pure IDB) |
| 100 ms budget | trivially met | met | met | risk (Worker boot) |
| HC compliance | **OK** | violates HC | OK | violates HC |
| Drift on module state change | adapter contract test | adapter contract test | adapter contract test | index migration |
| Test isolation | clean (own package) | clean | poor | medium |
| Bundle size | ~5 KB | +12 KB gzip | ~5 KB folded in shell | +20 KB (Worker bundle) |
| Pattern alignment with row #2 | matches | partial | breaks | breaks |
| XSS surface | one escape helper | library's call | one helper | one helper |

---

## 5. Recommendation

**Option A.** This matches the hard constraints exactly, mirrors the SHIPPED
pattern in row #2 (new package + EventMap extension + cross-vendor verify),
and is the lowest-complexity implementation that satisfies the 5 acceptance
signals.

Five phases (one `feature-build` run each):

1. **P1** — package scaffold + types + adapter contract + EventMap extension
   (no UI yet).
2. **P2** — 11 module adapter pure functions + per-adapter unit tests.
3. **P3** — palette modal UI component (frozen UI per DESIGN.md §6 idioms:
   `.modal-scrim` + `.card-modal` + monospace input) + escape-HTML highlight
   + keyboard nav unit tests.
4. **P4** — `xai-web-shell` topbar button swap + global keyboard listener +
   wire `useCommandPalette` provider at app shell level in `apps/web`.
5. **P5** — PLUGIN_MAP row + cross-vendor verify checklist + 100 ms budget
   integration test + final docs pass.

Each phase is independently committable, has its own acceptance criteria, and
keeps SHIPPED tests (46 xai-web-shell tests) green at every commit.

---

## 6. Risks and open questions

### Risk register

**R1 — Adapter drift if a module's state shape changes later.**
Mitigation: each adapter file `src/adapters/<module>.ts` re-imports the
canonical state-shape predicate from the owning package (e.g. `isTaskColsArray`
from `@repo/plugin-web-tasks`'s public surface where exported, otherwise local
duplicate). Per-adapter contract test asserts adapter handles `null`,
`undefined`, malformed-shape input by returning `[]` (never throws). If a
module's public predicate is missing, adapter uses defensive `unknown`-typed
parameter + inline shape check.

**R2 — Global keyboard listener conflicts with existing module shortcuts.**
The shell already binds keyboard events in `AvatarMenu` (Escape) and likely
in some modules. Cmd/Ctrl+K is universally reserved-for-search in Web UIs
(Notion, Linear, Slack, VS Code) so collision risk with sibling modules is
low. Mitigation: cmdk listener uses `addEventListener("keydown", handler)`
with capture phase, calls `e.stopPropagation()` only after `e.preventDefault()`
on the Cmd+K combo specifically. Enumerate existing global listeners in P4
sweep (grep `window.addEventListener`); document conflicts in the test.md
acceptance row L1. Verify-checklist line item.

**R3 — 100 ms budget violated by slow `usePref` reads at open time.**
`usePref` reads via React hooks at render time of consumers — but cmdk's
adapters are NOT React hooks; they receive the *already-read* state from the
palette host. The palette host's `useEffect` calls `getRawPref("xai_*")` (a
direct `localStorage.getItem` + JSON.parse — already exposed via
`@repo/plugin-web-storage`'s `getPref`/`setPref` helpers). Mitigation: write
a perf-budget unit test in P5 that mocks 11 localStorage keys with realistic
payloads + asserts `performance.now()` delta < 50 ms for index build (50 ms
budget; the remaining 50 ms covers modal mount + re-render). The shell
button's click handler is purely synchronous — no async work runs before the
modal renders.

**R4 — XSS via search highlight rendering.**
The match-highlight wraps user-content substrings in `<mark>` tags via
`dangerouslySetInnerHTML`. Mitigation: a tiny pure `escapeHtml(s: string):
string` helper runs on EVERY user-content fragment before wrapping. Helper is
unit-tested with 12 cases (basic ASCII, `<script>`, `&`, `"`, `'`, surrogate
pairs, RTL marker, NUL byte, very-long string, empty, whitespace-only,
already-escaped entity round-trip). Cross-vendor cold-read by Codex
(mandatory verify gate per HC8 + ADR-0009 D4) explicitly asked to confirm no
unescaped paths exist in the rendering pipeline.

**R5 — Palette appearance drift across themes / bgTones / densities.**
DESIGN.md §6 lists `.modal-scrim` (backdrop blur) + `.card-modal` (modal
shell) as already-supported component idioms. Mitigation: palette CSS reuses
existing CSS custom properties (`--bg-panel`, `--text-primary`, `--border-1`,
`--accent`) from `@repo/plugin-web-tokens`; **no hex literals**. Cross-vendor
sweep checks theme=light/dark/system × density=comfortable/compact ×
bgTone=default/sage/cream/mist/lavender/peach/graphite (3×2×7=42 combos —
spot-checked on 4 representative combos per row #2 precedent).

**R6 — Topbar input → button is a visible DOM change that 46 SHIPPED
`xai-web-shell` tests assert against.**
Mitigation: P4 grep + update tests that probe `<input>` semantics. The
existing AC-TOPBAR-5 (Search input renders with placeholder) and AC-TOPBAR-6
(⌘K kbd hint rendered) are updated to assert the `<button>` shape instead.
The button must still expose the placeholder text as `aria-label` for parity
with the original input's accessibility semantics. All 46 tests stay green
post-P4; net delta is ~3 test edits, not removals.

**R7 — Multi-language search behavior on bilingual content.**
Most modules store bilingual `{en, zh}` titles. Adapters must search both
languages regardless of UI lang — a user typing "tomato" in Chinese UI should
still find an English-titled pomodoro session, and vice versa. Mitigation:
per-adapter spec says: lowercase the query, lowercase both `en` and `zh`
candidates, run `.includes()` against both. Tested in adapter unit tests
(case T5, B5, etc.).

**R8 — Module adapter for `statistics` and `calendar` has no own state to
search.**
`statistics` is a read-only aggregator over other modules' data; `calendar`
is a transient month-grid that consumes board-card dates. Mitigation: both
adapters return module-jump entries only (`type SearchHit = {kind: "module-jump",
moduleId: WebModuleId, label: {en,zh}}`). The 11/11 adapter requirement is met
by these "trivial" adapters that always emit one hit when the query matches
the module's name or any localized alias (e.g. "stats", "统计", "graph",
"chart").

### Open questions (resolved here, recorded for plan acceptance)

**Q1 — Where does the global keyboard listener live?**
A: Inside the `<CommandPalette/>` component itself, mounted once at the app
shell level (a sibling of `<Shell/>` inside `apps/web/src/App.tsx`). It
uses `useEffect` with a cleanup that removes the listener on unmount. This
keeps the listener lifecycle tied to React, avoids global state leakage in
tests, and makes the open/close API a hook (`useCommandPalette()`) returning
`{open, close, isOpen}`.

**Q2 — Should the palette show recent searches / pinned shortcuts?**
A: **No in v1.** Out of scope — no storage keys allowed. Future row may add
`xai_pref_cmdk_recent` if needed.

**Q3 — Does the palette coexist with the deploy banner from `xai-web-deploy-cloudflare`?**
A: Yes. The palette is `position: fixed; inset: 0; z-index: 200` (one tier
above the deploy banner's z-index 100 per ADR-0008). Spot-check in P3 visual
test.

**Q4 — Web SPA — what does "Cmd+Enter opens in new tab" mean?**
A: Per HC5 — document as **no-op for v1**. The palette swallows Cmd+Enter and
treats it identically to Enter (same-tab jump). A small JSDoc note + one test
case (K7) document this explicit no-op. Future row may add real
`window.open()` if a multi-window mode lands.

**Q5 — Are settings panes searchable too?**
A: Yes — the settings adapter walks `paneRegistry` from
`@repo/plugin-web-settings-shell` (SHIPPED) and emits one `SearchHit` per pane
whose i18n label contains the query. Pane labels are already bilingual.

---

## 7. Acceptance signal cross-reference

| Seed brief AS | Coverage in plan |
|---|---|
| AS1 — Cmd+K opens palette from any `/app/*` route within 100 ms (no async data fetch on open) | P5 perf-budget unit test (R3) + manual cross-vendor verify (4 representative combos) |
| AS2 — Typing "tomato" finds all pomodoro sessions whose label contains it; pressing Enter jumps to `/app/pomodoro` and (if applicable) scrolls to matching session | P2 adapter for pomodoro reads `xai_pomodoro_sessions` (`PomodoroSession[]`) and matches on `id` / future label. Jump → `web:search:jump` emit + `navigate("/app/pomodoro")` + `scrollIntoView` via DOM id query (P3) |
| AS3 — 11/11 module adapters present + tested | P2 ships 11 adapter files + 11 unit-test files |
| AS4 — `xai-web-shell` topbar button accessible by keyboard (Tab navigation) | P4 swap retains tab-index 0 + `aria-label` |
| AS5 — Verify Cross-vendor: Codex cold-read confirms no XSS in search highlight rendering | P5 cross-vendor checklist line item; HTML-escape helper unit-tested (R4) |

---

## 8. Frozen assumptions (lock at plan acceptance)

1. **Package name**: `@repo/xai-web-cmdk` at `packages/xai-web-cmdk/`.
2. **Public surface** (the only `src/index.ts` exports): `<CommandPalette/>`,
   `useCommandPalette`, `registerSearchAdapter`, `getRegisteredAdapters` (test
   helper), types `SearchHit` / `ModuleSearchAdapter` / `SearchHitKind`.
   No rail registration (HC1 — overlay only, no `WebModuleSlotRegistration`).
3. **EventMap extension**: 2 new channels in `@repo/core/types/events.ts`:
   - `web:search:invoked` — `{ source: "shortcut" | "topbar-click" | "programmatic"; openedAt: string }`
   - `web:search:jump` — `{ moduleId: WebModuleId; hitKind: SearchHitKind; query: string; jumpedAt: string }`
4. **No new storage keys.** Search index is in-memory only. Reads use the
   SHIPPED `usePref`/`getPref` from `@repo/plugin-web-storage`.
5. **No third-party libraries.** React 19 + Web platform APIs only.
6. **No CSP edits.** No outbound network from the palette.
7. **Adapter contract**: `type ModuleSearchAdapter = (query: string, state: unknown) => SearchHit[]`. Each adapter is a pure synchronous function; never throws (catches inside).
8. **Highlight rendering**: `escapeHtml()` → wrap match runs with `<mark>` → `dangerouslySetInnerHTML`. Helper exported for the unit test.
9. **Keyboard contract** (HC5): Cmd+K (mac) / Ctrl+K (other OS) open; Esc close; ↑/↓ navigate; Enter jump; Cmd+Enter = no-op aliased to Enter (documented).
10. **Topbar modification** (HC1 in seed): `<input readOnly>` → `<button>`,
    same visual styling via `.search-box` CSS class (reuse existing rule),
    `aria-label` = same i18n key as the placeholder (`common.search_placeholder`).
11. **Co-location**: 11 adapter files under `packages/xai-web-cmdk/src/adapters/<module>.ts`.
    Each adapter file calls `registerSearchAdapter(<id>, adapter)` at module load.
12. **Pet button** (rail bottom) is NOT a searchable target (it's a stateful toggle, not a navigation surface).

---

## 9. Out of scope (deferred to future rows)

- Recent-searches list (would need a storage key).
- Pinned shortcuts ("Quick actions" Notion-style).
- Fuzzy matching (substring `.includes()` is enough for current scale).
- Real-time index updates as the user types in another module (the palette
  builds the index on open and discards on close).
- Multi-window "Cmd+Enter opens in new tab" semantics.
- Cmd+K from a non-`/app/*` route (e.g. `/login` deferred until that exists).
- Server-side search.
- Inline previews / hover-cards in the result list.
- Voice-input search.
