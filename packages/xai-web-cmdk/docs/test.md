# Test Strategy — xai-web-cmdk

## §1 Goals

- Every adapter is a pure function unit-tested in isolation (11 adapter files
  × ≥4 cases each = ≥44 cases).
- Every public component has an interaction test (open / close / nav / Enter).
- XSS attack surface eliminated via 12-case `escapeHtml` test + 4-case
  `PaletteResultRow` rendered-DOM assertion.
- 100 ms open budget verified by a `performance.now()` perf-budget test.
- All 46 SHIPPED `xai-web-shell` tests stay green post-P4.
- Cross-vendor manual smoke (P5) queues a Chrome 120 / Safari 17 / Firefox 121
  checklist for the ship-time human verifier.
- Codex cold-read XSS audit invoked at P5; mandatory per ADR-0009 D4.

---

## §2 Test pyramid

| Layer | Count (approx) | Files |
|---|---|---|
| Unit — pure helpers | ~30 | escapeHtml, highlightMatch, keyboardCombo, registry, buildIndex |
| Unit — adapters | ~50 | 11 adapter test files (T/B/D/C/MX/PM/H/ME/CD/ST/SE) |
| Component — palette UI | ~30 | CommandPalette, PaletteInput, PaletteList, PaletteResultRow, CommandPaletteProvider |
| Integration — apps/web | ~5 | apps/web/src/__tests__/cmdkIntegration.test.tsx |
| Perf budget | 1 | perfBudget.test.ts (100-iteration p95 assertion) |
| Event emit | 4 | eventEmit.test.ts |
| **Total automated** | **~120** | |
| Manual cross-vendor | — | docs/reviews/xai-web-cmdk-search/20260525-cross-vendor-smoke.md |

---

## §3 Phase-mapped test files

### P1 (5 files, ~31 cases)

- `escapeHtml.test.ts` — 12 cases
  - EH1 — empty string returns empty
  - EH2 — plain ASCII passes through
  - EH3 — `<` → `&lt;`
  - EH4 — `>` → `&gt;`
  - EH5 — `&` → `&amp;` (and double-escape safe: `&amp;` becomes `&amp;amp;`)
  - EH6 — `"` → `&quot;`
  - EH7 — `'` → `&#39;`
  - EH8 — `<script>alert(1)</script>` fully neutralized
  - EH9 — surrogate pair preserved
  - EH10 — RTL marker `‏` preserved
  - EH11 — NUL byte preserved
  - EH12 — very long string (10k chars) handled without crash
- `highlightMatch.test.ts` — 6 cases
  - HM1 — empty query → returns escaped text with no `<mark>`
  - HM2 — single match wrapped in `<mark>` after escape
  - HM3 — multiple matches all wrapped
  - HM4 — case-insensitive match
  - HM5 — `<script>` query is neutralized BEFORE wrapping (XSS via query case)
  - HM6 — match crossing already-escaped entity boundary handled safely
- `keyboardCombo.test.ts` — 8 cases
  - KC1 — Cmd+K on Mac → true
  - KC2 — Ctrl+K on Linux → true
  - KC3 — Cmd+K on Linux → false (Cmd is Win key)
  - KC4 — Ctrl+K on Mac → false
  - KC5 — Cmd+J → false
  - KC6 — Cmd+K with Shift modifier → false
  - KC7 — Cmd+K with target=`<textarea>` → false
  - KC8 — Cmd+K with target.contentEditable=true → false
- `registry.test.ts` — 5 cases
  - R1 — `registerSearchAdapter("tasks", fn)` stores adapter
  - R2 — duplicate registration warns in dev, replaces silently
  - R3 — `getRegisteredAdapters()` returns Map with all registered entries
  - R4 — `__resetCmdkRegistry()` clears Map
  - R5 — registered adapter retrievable by `getRegisteredAdapters().get(moduleId)`
- `index-barrel.test.ts` — IB1..IB3 (P1-stage)
  - IB1 — barrel exports SearchHit / SearchHitKind / ModuleSearchAdapter types
  - IB2 — barrel exports registerSearchAdapter / getRegisteredAdapters
  - IB3 — barrel exports escapeHtml / highlightMatch

### P2 (12 files, ~58 cases)

- `adapters/tasks.test.ts` — T1..T6
  - T1 — empty query returns single module-jump hit
  - T2 — query matches `title.en` returns entity hit with entityId = card id
  - T3 — query matches `title.zh` returns entity hit
  - T4 — query matches `sub.en` or `sub.zh` returns entity hit
  - T5 — query matches `tag` returns entity hit
  - T6 — malformed state returns []
- `adapters/board.test.ts` — B1..B6
  - B1 — empty query → module-jump
  - B2 — match on board name `{en,zh}` → module-jump (or entity for board id)
  - B3 — match on card title `{en,zh}` → entity hit (entityId = card id)
  - B4 — match on label → entity hit
  - B5 — null state → []
  - B6 — defensive on malformed Board shape
- `adapters/dashboard.test.ts` — D1..D5
  - D1 — empty query → module-jump
  - D2 — match on widget i18n label → module-jump (no entity)
  - D3 — clock style match → module-jump
  - D4 — null state → still single module-jump on name alias
  - D5 — malformed state returns module-jump only
- `adapters/calendar.test.ts` — C1..C4
  - C1 — empty query → module-jump
  - C2 — query "cal" matches → module-jump
  - C3 — query "日历" matches → module-jump
  - C4 — query "month" matches alias → module-jump
- `adapters/matrix.test.ts` — MX1..MX5
  - MX1 — empty query → module-jump
  - MX2 — match on q1/q2/q3/q4 item title → entity
  - MX3 — bilingual title match
  - MX4 — defensive on opaque state
  - MX5 — empty quadrants → module-jump only
- `adapters/pomodoro.test.ts` — PM1..PM6  ← **AS2 coverage**
  - PM1 — empty query → module-jump
  - PM2 — query "tomato" matches → entity hits per session (the AS2 acceptance scenario)
  - PM3 — query matches session.id substring → entity
  - PM4 — query matches mode ("focus", "short-break") → entity
  - PM5 — null state → []
  - PM6 — malformed state → []
- `adapters/habits.test.ts` — H1..H5
  - H1 — empty query → module-jump
  - H2 — habit name match `en` → entity
  - H3 — habit name match `zh` → entity
  - H4 — defensive on opaque shape
  - H5 — null state → []
- `adapters/meditation.test.ts` — ME1..ME4
  - ME1 — empty query → module-jump
  - ME2 — scene name alias match
  - ME3 — sound name alias match
  - ME4 — opaque state defensive → module-jump only
- `adapters/countdown.test.ts` — CD1..CD5
  - CD1 — empty query → module-jump
  - CD2 — title `en` match → entity
  - CD3 — title `zh` match → entity
  - CD4 — null state → []
  - CD5 — malformed Countdown shape → defensive []
- `adapters/statistics.test.ts` — ST1..ST3
  - ST1 — empty query → module-jump
  - ST2 — "stats" / "统计" / "graph" / "chart" aliases match
  - ST3 — unrelated query → []
- `adapters/settings.test.ts` — SE1..SE6
  - SE1 — empty query → module-jump (Settings root)
  - SE2 — match on pane label `en` → settings-pane hit (entityId = paneId)
  - SE3 — match on pane label `zh` → settings-pane
  - SE4 — multiple pane matches all returned
  - SE5 — "AI" matches "AI" pane (recently added in row #2)
  - SE6 — defensive on missing paneRegistry import
- `buildIndex.test.ts` — BI1..BI8
  - BI1 — empty registry returns []
  - BI2 — single adapter returning multiple hits
  - BI3 — multiple adapters' hits concatenated and sorted by score desc
  - BI4 — deterministic tie-break by moduleId asc
  - BI5 — cap at 50 hits total
  - BI6 — adapter that throws is caught and silently omitted; other adapters still run
  - BI7 — query "" returns one module-jump hit per registered adapter
  - BI8 — query is lowercased before adapter receives it

### P3 (5 files, ~31 cases)

- `CommandPalette.test.tsx` — CP1..CP18
  - CP1 — closed by default
  - CP2 — Cmd+K opens (jsdom-mocked navigator.platform = Mac)
  - CP3 — Ctrl+K opens (navigator.platform = Win)
  - CP4 — Esc closes
  - CP5 — scrim click closes
  - CP6 — Enter on highlighted row jumps + emits + closes
  - CP7 — click on row jumps + emits + closes
  - CP8 — ↑ arrow moves highlight up; wraps at top
  - CP9 — ↓ arrow moves highlight down; wraps at bottom
  - CP10 — empty query renders module-jump hits per adapter (11 rows)
  - CP11 — typing "tomato" renders pomodoro hits
  - CP12 — Cmd+Enter aliased to Enter (no-op + same-tab jump)
  - CP13 — opening when already open is no-op
  - CP14 — opening + typing + closing + reopening resets query
  - CP15 — modal has role="dialog" + aria-modal="true"
  - CP16 — input has aria-label = "common.search_placeholder" i18n
  - CP17 — palette unmounts on close (no leftover dialog in DOM)
  - CP18 — second Cmd+K within open state stays open (idempotent)
- `PaletteInput.test.tsx` — PI1..PI5
  - PI1 — autofocuses on mount
  - PI2 — typing fires setQuery
  - PI3 — monospace font class applied
  - PI4 — i18n placeholder visible
  - PI5 — Enter event delegates upward (does NOT call setQuery)
- `PaletteList.test.tsx` — PL1..PL5
  - PL1 — renders empty-state when no hits ("No results")
  - PL2 — renders N rows for N hits
  - PL3 — activeIndex row has class "active"
  - PL4 — scrolls active row into view (mock IntersectionObserver / scrollIntoView)
  - PL5 — role="listbox" with N options
- `PaletteResultRow.test.tsx` — PR1..PR4
  - PR1 — renders label per current lang
  - PR2 — sub-label rendered when present
  - PR3 — XSS payload `<script>alert(1)</script>` in label renders as text (no executable script in DOM)
  - PR4 — XSS payload via query (search highlight wrap) renders as text
- `eventEmit.test.ts` — EM1..EM4
  - EM1 — open() emits web:search:invoked with source=programmatic
  - EM2 — Cmd+K emits web:search:invoked with source=shortcut
  - EM3 — topbar-click open emits with source=topbar-click (integration via mock provider)
  - EM4 — Enter on hit emits web:search:jump with full payload shape

### P4 (xai-web-shell delta + apps/web)

- `packages/xai-web-shell/src/__tests__/Topbar.test.tsx` — MODIFY: split TP5 into TP5a + TP5b + add TP7
  - TP5a — no `onOpenSearch` prop → renders readOnly `<input>` (backwards-compat path)
  - TP5b — `onOpenSearch` prop → renders `<button class="search-box">`
  - TP7 — button click calls `onOpenSearch()`
- `apps/web/src/__tests__/cmdkIntegration.test.tsx` (NEW) — 5 cases
  - CI1 — Cmd+K opens palette
  - CI2 — Esc closes palette
  - CI3 — Enter on first hit navigates (mock navigate)
  - CI4 — topbar button click opens palette
  - CI5 — palette mounts as DOM sibling of shell (not nested inside it)

### P5 (perf + cross-vendor + Codex audit)

- `perfBudget.test.ts` — PB1
  - PB1 — buildIndex with realistic 11-key state ≤ 50 ms p95 over 100 iterations
- `apps/web/src/__tests__/csp.test.ts` (existing extends): assert that `apps/web/public/_headers` `connect-src` directive is unchanged by this row.
- `docs/reviews/xai-web-cmdk-search/20260525-cross-vendor-smoke.md` (NEW) — manual checklist:
  - Chrome 120: Cmd+K open latency observed in DevTools Performance (<100 ms)
  - Safari 17: Cmd+K open latency (Safari Web Inspector Timeline)
  - Firefox 121: Cmd+K open latency
  - Esc close in all 3 browsers
  - ↑/↓ arrow nav cycles in all 3 browsers
  - Enter jump executes in all 3 browsers
  - Theme × density × bgTone visual matrix (4 representative combos: light/comfortable/default; dark/comfortable/sage; light/compact/cream; dark/compact/graphite)
  - XSS injected query screenshot — `<script>alert(1)</script>` typed in palette and against board card titles — confirms text rendering, no script execution
  - Codex cold-read XSS audit prompt: "Read packages/xai-web-cmdk/src/internal/{escapeHtml,highlightMatch}.ts and PaletteResultRow.tsx; identify any rendering path that does not escape user-content. Output 'NONE' or list paths." Expected output: NONE.

---

## §4 Mock strategy

| Mock | Provided by | Used by |
|---|---|---|
| `localStorage` for 11 `xai_*` keys | per-test `beforeEach` JSON-blob setup + `localStorage.clear()` afterEach | adapter tests, perf-budget test |
| `useNavigate` from react-router | `vi.mock("react-router", ...)` returning mockNavigate | CommandPalette tests |
| `emitWebEvent` from `@repo/xai-web-event-bus` | spy via `vi.spyOn` | eventEmit tests |
| `useWebShell` from `@repo/xai-web-shell` | mock provider returning `{ lang: "en", railPos: "left", petOn: false, setPetOn: noop }` | CommandPalette tests |
| `navigator.platform` | redefined per-test via `Object.defineProperty` | keyboardCombo + CommandPalette |
| `performance.now()` | native jsdom mock | perfBudget |
| `IntersectionObserver` | shim via `vitest.setup.ts` | PaletteList scroll tests |
| `paneRegistry` from `@repo/plugin-web-settings-shell` | real (lightweight) or mocked array of 12 panes | settings adapter test |

`__resetCmdkRegistry()` is called in `beforeEach` of every test file that
touches the registry, so per-file adapter registration is deterministic.

---

## §5 SHIPPED test invariance (R6 mitigation)

| Package | Pre-P4 count | Post-P4 expected | Delta |
|---|---|---|---|
| `@repo/xai-web-shell` | 46 cases (per its dev_log) | 46 + 3 (TP5 split + TP7) – 1 (old TP5 removed) = 48 | +2 net |
| `@repo/xai-web-event-bus` | unchanged | unchanged | 0 |
| `@repo/plugin-web-storage` | unchanged | unchanged | 0 |
| `@repo/core` | unchanged surface; +2 EventMap entries (additive) | unchanged | 0 |
| `apps/web` | (varies) | +5 (CI1..CI5) | +5 |

Concretely, the P4 commit's diff hits exactly:

- `packages/xai-web-shell/src/types.ts` (+1 optional field on TopbarProps + ShellProps)
- `packages/xai-web-shell/src/Topbar.tsx` (input → conditional button/input)
- `packages/xai-web-shell/src/Shell.tsx` (1 prop forwarding line)
- `packages/xai-web-shell/src/__tests__/Topbar.test.tsx` (TP5 split + TP7)
- `apps/web/package.json` (+1 dep line)
- `apps/web/src/App.tsx` (+ provider wrap + palette mount + onOpenSearch wiring)
- `apps/web/src/__tests__/cmdkIntegration.test.tsx` (NEW)

The Topbar test split is the only non-additive change. All other SHIPPED tests
in `@repo/xai-web-shell` (AppRail, AvatarMenu, Shell.smoke, registry, dnd,
event-emit, internal/dnd, internal/popoverGeometry, etc.) stay byte-for-byte
unchanged.

---

## §6 Acceptance gates (mapped to feature-verify gates)

| Gate | Command | Pass criterion |
|---|---|---|
| G1 | `pnpm --filter @repo/xai-web-cmdk lint` | exit 0, `--max-warnings 0` |
| G2 | `pnpm --filter @repo/xai-web-cmdk typecheck` | exit 0 |
| G3 | `pnpm --filter @repo/xai-web-cmdk test` | exit 0; ~120 cases pass |
| G4 | `pnpm --filter @repo/xai-web-shell lint` | exit 0 |
| G5 | `pnpm --filter @repo/xai-web-shell typecheck` | exit 0 |
| G6 | `pnpm --filter @repo/xai-web-shell test` | exit 0; 48 cases pass |
| G7 | `pnpm --filter @repo/core typecheck` | exit 0 (EventMap additions compile) |
| G8 | `pnpm --filter @repo/web lint` | exit 0 |
| G9 | `pnpm --filter @repo/web typecheck` | exit 0 |
| G10 | `pnpm --filter @repo/web build` | exit 0 |
| G11 | `pnpm --filter @repo/web test` | exit 0; CI1..CI5 pass |
| G12 | Perf budget | PB1: buildIndex p95 < 50 ms |
| G13 (manual) | Cross-vendor smoke on Chrome 120 / Safari 17 / Firefox 121 | All checklist items pass |
| G14 (cross-vendor) | Codex cold-read XSS audit | Output is "NONE" |

---

## §7 Test data fixtures

- `__tests__/fixtures/realisticState.ts` — exports a frozen
  `Record<WebModuleId, unknown>` representing a realistic populated state
  (20 tasks, 10 board cards across 2 boards, 8 dash widgets, 10 pomodoro
  sessions, 5 habits, 10 countdowns, 12 settings panes). Used by buildIndex
  + perfBudget tests.
- `__tests__/fixtures/xssPayloads.ts` — exports common XSS strings used to
  populate adapter state in `escapeHtml` + `highlightMatch` + adapter +
  `PaletteResultRow` tests:
  - `<script>alert(1)</script>`
  - `<img src=x onerror=alert(1)>`
  - `"><svg onload=alert(1)>`
  - `javascript:alert(1)`
  - `<iframe src="javascript:alert(1)"></iframe>`

---

## §8 Open vs deferred test coverage

**Covered in v1**:
- Pure-helpers + 11 adapters + UI components + integration + perf + XSS.

**Deferred**:
- Real-keyboard E2E (Playwright) — out of scope for this row; deferred to a
  future apps/web E2E row.
- Real macOS Tauri overlay testing — P0 web-only scope.
- Accessibility audit beyond aria-modal + role=dialog + role=listbox + role=option
  (e.g., color-contrast WCAG AA) — covered by cross-vendor manual checklist row.
- Fuzzy-matching test coverage — fuzzy matching is out of scope for v1.

---

## §9 Verify checklist (P5 deliverable)

A full markdown checklist of the above gates will be authored at
`docs/reviews/xai-web-cmdk-search/20260525-verify-checklist.md` during P5,
mirroring the row #2 pattern at
`docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-verify-report.md`.
