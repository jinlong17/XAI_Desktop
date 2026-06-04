# Test Strategy — xai-web-board-workspaces

## §1. Test framework

- Vitest 3.x + jsdom + @testing-library/react 16 + @testing-library/jest-dom 6 — same setup as `@repo/plugin-web-board-core` / `@repo/plugin-web-ai-chat` / `@repo/plugin-web-statistics`.
- `vitest.setup.ts`: `import "@testing-library/jest-dom/vitest"` + `afterEach(() => localStorage.clear())` + `requestAnimationFrame` polyfill.
- `vitest.config.ts`: `environment: "jsdom"`, `setupFiles: ["./vitest.setup.ts"]`, include `src/__tests__/**/*.{test,spec}.{ts,tsx}`.

## §2. Acceptance test inventory

### P1 — pure helpers + types + guards + ring math + STR + scaffolding

**`__tests__/types.test.ts`** — T1..T3 compile-time-style assertions on re-exported types.
- T1: `BoardPanelStateShape` requires all three keys present + boolean
- T2: `InboxCardShape` requires `id: string` + nested `text: { en: string; zh: string }`
- T3: `RingSegment` requires `listId: string` + `label: string` + `count: number` + `color: string`

**`__tests__/guards.test.ts`** — G1..G12.
- G1: `isBoardPanelState(null)` → false
- G2: `isBoardPanelState({})` → false
- G3: `isBoardPanelState({ inbox: true })` → false (missing keys)
- G4: `isBoardPanelState({ inbox: true, planner: false, board: true })` → true
- G5: `isBoardPanelState({ inbox: 1, planner: 0, board: 1 })` → false (numbers not booleans)
- G6: `isInboxCardArray(null)` → false
- G7: `isInboxCardArray([])` → true (empty array is valid)
- G8: `isInboxCardArray([{ id: "x" }])` → false (missing text)
- G9: `isInboxCardArray([{ id: "x", text: { en: "a", zh: "b" } }])` → true
- G10: `isInboxCardArray([{ id: 1, text: { en: "a", zh: "b" } }])` → false (id not string)
- G11: `isInboxCardArray([{ id: "x", text: { en: "a" } }])` → false (missing zh)
- G12: `isInboxCardArray("garbage")` → false

**`__tests__/panelOps.test.ts`** — PO1..PO16.
- PO1: `loadPanelsOrDefault(null)` → `{inbox:false, planner:false, board:true}`
- PO2: `loadPanelsOrDefault(undefined)` → seed
- PO3: `loadPanelsOrDefault([])` → seed (empty array — registry default)
- PO4: `loadPanelsOrDefault("garbage")` → seed
- PO5: `loadPanelsOrDefault([{inbox:true, planner:false, board:false}])` → `{inbox:true, planner:false, board:false}` (length-1 array shape — canonical form)
- PO6: `loadPanelsOrDefault({inbox:true, planner:false, board:false})` → same (bare object — prototype legacy shape)
- PO7: `loadPanelsOrDefault([{inbox:false, planner:false, board:false}])` → invariant kicks in → `{inbox:false, planner:false, board:true}`
- PO8: `loadPanelsOrDefault([{inbox:true}])` → false → seed
- PO9: `loadInboxOrDefault(null)` → the 3-item seed
- PO10: `loadInboxOrDefault([])` → `[]` (empty array is valid)
- PO11: `loadInboxOrDefault([{ id: "x", text: { en: "a", zh: "b" } }])` → returns the typed item
- PO12: `loadInboxOrDefault("garbage")` → seed
- PO13: `togglePanelInvariant({inbox:true, planner:false, board:false}, "inbox")` → `{inbox:false, planner:false, board:true}` (force board on)
- PO14: `togglePanelInvariant({inbox:true, planner:true, board:false}, "inbox")` → `{inbox:false, planner:true, board:false}` (planner alone is fine)
- PO15: `togglePanelInvariant({inbox:false, planner:false, board:true}, "board")` → `{inbox:false, planner:false, board:true}` (would zero-out → force board on)
- PO16: `togglePanelInvariant({inbox:true, planner:true, board:true}, "board")` → `{inbox:true, planner:true, board:false}`

**`__tests__/ringMath.test.ts`** — RM1..RM10.
- RM1: `computeRingSegments([], "en")` → `[]`
- RM2: `computeRingSegments([{...empty}], "en")` → `[]` (empty cards filtered out)
- RM3: 5-list PM template with mixed counts → 5 segments in the same order as `lists`
- RM4: list with `color: null` → segment.color === `"var(--accent)"`
- RM5: list with `color: "red"` → segment.color resolves via `LIST_COLOR_PALETTE.find(e => e.id === "red")?.cssVar`
- RM6: `computeDonePct([])` → 0
- RM7: `computeDonePct([{customName:{en:"Done",zh:"完成"}, cards:[{},{}]}])` → 100
- RM8: `computeDonePct(<5-stage PM with 4/5 cards done>)` → expected percent (deterministic seed)
- RM9: Float precision — sum of segments' `(count/total)*c` should equal `c` ±1e-9
- RM10: Segment label resolution uses `lang` — Chinese vs English `customName` switches

### P2 — leaf components (Switcher / Creator / StatusOverviewBanner / InboxPanel / PlannerPanel)

**`__tests__/BoardSwitcher.test.tsx`** — BS1..BS15.
- BS1: Renders with workspaces + boards; search input is autoFocused
- BS2: Search filters by `b.name[lang]` case-insensitive
- BS3: Scope tab "All" selected by default
- BS4: Click workspace tab filters to that workspace
- BS5: Bilingual zh — "搜索看板…" placeholder
- BS6: Empty state when filter has no matches
- BS7: Click `bs-card` calls `onPick(boardId)`
- BS8: Click "New board" calls `onCreate()`
- BS9: Active board has `.active` class
- BS10: Delete affordance hidden on active board
- BS11: Delete affordance hidden when only 1 board total
- BS12: Delete affordance visible on non-active board with 2+ total
- BS13: Click delete → window.confirm prompts → onDelete called with board id
- BS14: Window.confirm returning false suppresses onDelete
- BS15: Click scrim closes (calls onClose)

**`__tests__/BoardCreator.test.tsx`** — BC1..BC10.
- BC1: Renders 3 template cards
- BC2: Default selected template = "pm"
- BC3: Click "Basic Kanban" template card → tpl state flips
- BC4: Name input autoFocused with default "New board" / "新看板"
- BC5: Workspace `<select>` lists all workspaces
- BC6: Default workspace = `workspaces[0].id`
- BC7: Click Create with empty name uses default name
- BC8: Click Create calls `onCreate(tpl, name, ws)` with trimmed name
- BC9: Click Cancel calls `onCancel`
- BC10: Click scrim calls `onCancel`

**`__tests__/StatusOverviewBanner.test.tsx`** — SOB1..SOB10.
- SOB1: Renders ring + legend + center label
- SOB2: Total cards = 0 → donePct === 0%
- SOB3: PM template with all done → 100%
- SOB4: Center label shows `Done` (en) / `已完成` (zh)
- SOB5: Right legend renders 1 row per non-empty list + "Total" row
- SOB6: Legend dot color matches list.color resolved via LIST_COLOR_PALETTE
- SOB7: Legend dot for list with no color → uses `var(--accent)`
- SOB8: Bilingual header "Status Overview" / "状态总览"
- SOB9: Bilingual "Last 7 days" / "近 7 天"
- SOB10: Ring segments stroke math — 5 lists with counts {4,3,2,1,2} → 5 `<circle>` segments with correct `strokeDasharray` arc lengths

**`__tests__/InboxPanel.test.tsx`** — IP1..IP10.
- IP1: Renders header + count badge + composer + body
- IP2: Bilingual "Inbox" / "收件箱"
- IP3: Composer Enter prepends new card; clears input
- IP4: Empty composer Enter does nothing
- IP5: Render each card's `c.text[lang]`
- IP6: Remove button calls `setCards` to filter that id out
- IP7: Empty state when `cards.length === 0`
- IP8: Bilingual empty state "Inbox is empty" / "收件箱为空"
- IP9: Multiple adds prepend in the right order (newest on top)
- IP10: Card text falls back to `text.en` when `lang === "zh"` AND `text.zh` missing (defensive)

**`__tests__/PlannerPanel.test.tsx`** — PP1..PP12.
- PP1: Renders header + date row + 12 hour rows (8a..7p)
- PP2: Hour labels — `8a`, `9a`, `12p`, `7p` (12-hour format)
- PP3: Bilingual "Planner" / "计划"
- PP4: Date label format en-US "May 23, Fri" — uses injected `now`
- PP5: Date label format zh "5月23日 周五"
- PP6: With no due-today cards → 3 sample slots at hours 9 / 11 / 14
- PP7: With cards `due === "Today"` → seeded slots at 9, 11, 13, 15 cycling colors
- PP8: Slot cap at 6 cards (matches `dueToday.slice(0, 6)` from prototype)
- PP9: Bilingual slot labels for samples — "Deep focus"/"专注", "Review"/"复盘", "Walk"/"散步"
- PP10: Color cycling — `colors[i % 4]` → "green", "blue", "amber", "purple"
- PP11: `onOpenCard` not provided → slot click is a safe no-op
- PP12: `onOpenCard` provided → click on a real-card slot calls it with `(cardId, listId)`

### P3 — top-level orchestrator + registration + apps/web wire-up

**`__tests__/BoardWorkspacesModule.test.tsx`** — BWM1..BWM18.
- BWM1: Renders header + workspace chip + title button + total count + bottom switcher + Kanban view (default panels = `{board: true}`)
- BWM2: First render with `xai_boards_v2 = null` → seed (3 default boards) is rendered AND persisted to localStorage on next setBoardsRaw
- BWM3: Click title button → `BoardSwitcher` modal opens
- BWM4: Click "New board" in switcher → switcher closes, `BoardCreator` opens
- BWM5: Submit creator with "pm" template + custom name + workspace → new board appears in `boards`, `activeBoardId` set to new id, creator + switcher both closed
- BWM6: Click switcher card on a different board → `activeBoardId` updates, switcher closes
- BWM7: Delete active board from switcher → falls back to next remaining board; if all deleted → seed re-populates
- BWM8: Bottom switcher "Inbox" button toggles `panels.inbox`; persists via `setPanelsRaw` (length-1 array)
- BWM9: Multi-panel invariant: from `{board:true}`, toggle "Board" → enforce `board:true` (no-op effect)
- BWM10: Open Inbox + Planner together → 2 panels in row, container has class `board-panels-multi`
- BWM11: Open only Board → class `board-panels-single`
- BWM12: Switch to PM-template board → `overviewOpen` button enabled; toggle on → `StatusOverviewBanner` mounted; toggle off → unmounted
- BWM13: Non-PM board → overview button is disabled/hidden (depending on impl; verify not rendered or has `disabled`)
- BWM14: Inbox composer Enter prepends to `xai_board_inbox` localStorage
- BWM15: `xai_board_panels = "garbage"` initial → renders seed `{board: true}` without crash; next write replaces
- BWM16: `xai_board_inbox = "garbage"` initial → renders 3-item seed inbox
- BWM17: Bilingual `lang="zh"` flip → all visible strings switch
- BWM18: 0 boards (forced via prefs override) → defensive remount populates seed via `setBoardsRaw(makeDefaultBoards())` once

**`__tests__/registration.test.tsx`** — REG1..REG6.
- REG1: `boardWorkspacesWebModuleRegistration.moduleId === "board"`
- REG2: `railOrder === 3`
- REG3: `icon === "kanban"`
- REG4: `i18nKey === "nav.board"`
- REG5: `showInRail === true`
- REG6: Mounting the registration's `children[0].render` inside a `WebShellProvider` mounts `BoardWorkspacesModule` (smoke render — header renders + title visible)

**`__tests__/index-barrel.test.ts`** — IB1..IB4.
- IB1: All §0 public exports resolve (no `undefined`).
- IB2: `BOARD_TEMPLATES`, `DEFAULT_WORKSPACES`, `PM_LABELS`, `makeDefaultBoards` are re-exported pass-throughs from board-core.
- IB3: `boardWorkspacesWebModuleRegistration` is a valid `WebModuleSlotRegistration` (has all required fields).
- IB4: No imports from `@repo/plugin-web-board-core/src/internal/*` — barrel only consumes the public index.

## §3. Mock strategy

- `usePref` is a real hook backed by `localStorage` — no mock; tests use `localStorage.clear()` in `afterEach` (vitest.setup.ts). Each test seeds via `localStorage.setItem` if a non-default initial is needed.
- `window.confirm` — stub via `vi.spyOn(window, "confirm").mockReturnValue(true | false)` per test (BS13, BS14).
- `Date.now()` and `new Date()` — use injected `now?: Date` prop on `PlannerPanel` for deterministic date-row + slot-cycling tests. For tests that need a stable `b-<timestamp>` id (BWM5), use `vi.useFakeTimers()` + `vi.setSystemTime(new Date("2026-05-23T10:00:00Z"))`.
- `useI18n(lang)` is a real hook from `@repo/plugin-web-tokens` — no mock needed; the new strings use the local `STR` table pattern (R4 in discovery review).
- `useWebShell()` from `@repo/xai-web-shell` — wrap test renders in `<WebShellProvider lang={lang}>` (or use the test helper from board-core if exposed; otherwise import + use the provider directly).

## §4. Acceptance criteria mapping

| Acceptance | Test refs |
|---|---|
| A1: Workspace chips render with colors | BWM1 |
| A2: Board switcher modal opens + filters + groups by workspace | BS1..BS9, BWM3 |
| A3: Board creator with 3 templates produces a valid Board | BC1..BC10, BWM5 |
| A4: PM template renders Status Overview ring chart live | SOB1..SOB10, BWM12, BWM13 |
| A5: 4-button multi-panel toggling matches DESIGN.md §4.3 rules | BWM8, BWM9, BWM10, BWM11 |
| A6: At least 1 panel open invariant | PO13..PO16, BWM9 |
| A7: Panel state persisted to `xai_board_panels` | BWM8, BWM15 |
| A8: Inbox cards to `xai_board_inbox` | BWM14, BWM16 |
| A9: PM Status Overview ring chart live from card distribution | SOB10, BWM12 |
| A10: All workspace + board names bilingual | BWM17, BS5, IP2, PP3 |
| A11: Each phase = one commit (P1/P2/P3) | enforced by feature-auto-build worker + git log audit at verify time |
| A12: Lint clean | `pnpm --filter @repo/plugin-web-board-workspaces lint --max-warnings 0` exits 0 at each phase |
| A13: Schema narrowing at boundary, no registry edits | guards.test, panelOps.test, BWM15, BWM16; `git diff -- packages/plugin-web-storage` empty at verify |
| A14: Shell registration replaces line 65 with this row's reg | REG1..REG6 + verify-time grep |

## §5. Manual smoke checklist (cross-vendor ship-time)

Q1. Navigate to `/board` → header shows the active workspace chip (Personal / Team Workspace color), board title, view-picker stub, total card count, and 4-button bottom switcher.

Q2. Click the title → BoardSwitcher modal opens with search + "All" tab + workspace tabs + grouped board grid + "+ New board" button.

Q3. Type a query → boards filter live.

Q4. Click "Team Workspace" tab → only team boards visible.

Q5. Click "+ New board" → BoardCreator modal opens with 3 template cards, default "pm" selected, name input pre-filled, workspace dropdown defaulting to Personal.

Q6. Switch template to "Basic Kanban" → cover preview switches. Type a name. Click "Create" → new board appears, becomes active, both modals close, Kanban view renders.

Q7. Switch active board to a PM-template board (e.g., "Project Management") → click the overview button in the header → Status Overview banner appears with SVG ring chart + 5 colored segments + center "done%" label + legend listing each stage.

Q8. Toggle the Inbox bottom button → InboxPanel appears at 260px on the left; Board panel narrows to fill remainder. Toggle Planner too → 3 panels visible side-by-side. Toggle Board off → invariant kicks in and Board stays on if only Board is on.

Q9. Type into Inbox composer + Enter → new card prepended. Refresh page → still there.

Q10. Switch language EN ↔ 中文 — all visible strings flip (workspace chips, title, switcher tabs, creator labels, panel headers, bottom switcher buttons, overview banner labels).

Q11. Set `localStorage.xai_boards_v2 = "garbage"` → reload → seed renders without crash. Same for `xai_board_panels` and `xai_board_inbox`.

---

## §6 — 2026-05-25 Extension Tests (gap-closure row #6 — Filter + Share)

> APPEND-ONLY. **Canonical test catalogue lives in
> `packages/xai-web-board-views/docs/test.md §6`.** This section documents
> only the tests local to THIS package.

### §6.1 — Baseline preservation (gate)

Existing 135 tests in `packages/plugin-web-board-workspaces/src/__tests__/**` MUST continue to pass with zero edits (BoardWorkspacesModule.test.tsx is the only edited file — only ADDITIONS).

### §6.2 — `__tests__/filterState.test.ts` (NEW · 8 cases)

| ID | Case | Assertion |
|---|---|---|
| FST-1 | `EMPTY_FILTER` has empty Sets + `dueRange: 'all'` | structural |
| FST-2 | `EMPTY_FILTER` is frozen (Object.isFrozen) | guard |
| FST-3 | `toggleLabel` adds id when absent | Set.has |
| FST-4 | `toggleLabel` removes id when present | Set.size delta |
| FST-5 | `toggleMember` adds + removes | mirror |
| FST-6 | `setDueRange('overdue')` returns new state with that value | structural |
| FST-7 | `EMPTY_FILTER` reference NOT mutated by togglers | identity preserved |
| FST-8 | `clearFilter` returns reference-equal `EMPTY_FILTER` | identity |

### §6.3 — `__tests__/shareUrl.test.ts` (NEW · 6 cases)

| ID | Case | Assertion |
|---|---|---|
| SU-1 | `generateShareUrl("b-default")` resolves to a string starting with `"https://xai-web.example/share/"` | URL prefix |
| SU-2 | Same input → same output across 2 calls | determinism |
| SU-3 | Different inputs → different outputs (statistically — verify SHA-256 hash differs in first 4 bytes for 4 sample ids) | hash distinguishability |
| SU-4 | Hex tail is exactly 8 chars + matches `/^[0-9a-f]{8}$/` | format guard |
| SU-5 | Unicode board id `"b-看板-1"` produces stable hash (no encoding crash) | round-trip |
| SU-6 | `crypto.subtle === undefined` fallback path returns `"https://xai-web.example/share/" + boardId.slice(0,8)` | branch coverage |

### §6.4 — `__tests__/FilterPopover.test.tsx` (NEW · 10 cases)

| ID | Case | Assertion |
|---|---|---|
| FP-1 | Renders three facet sections | section count |
| FP-2 | Labels facet renders deduped label list from `lists.flatMap(...)` | label count |
| FP-3 | Click on a label checkbox calls `onChange` with that label toggled | spy call |
| FP-4 | Click on a member checkbox calls `onChange` | spy call |
| FP-5 | Set due range to `'overdue'` calls `onChange` | spy call |
| FP-6 | "Clear" button calls `onChange(EMPTY_FILTER)` | reference equality |
| FP-7 | ESC fires `onClose` | spy call |
| FP-8 | Outside-click fires `onClose` | spy call |
| FP-9 | Bilingual zh — facet headings switch | text content |
| FP-10 | Empty `lists` → facet sections render empty checkbox containers; no crash | container count |

### §6.5 — `__tests__/ShareModal.test.tsx` (NEW · 8 cases)

| ID | Case | Assertion |
|---|---|---|
| SM-1 | Opens with `<dialog>` mounted + URL visible after async generation | `dialog.open === true` + URL text |
| SM-2 | Copy button calls `navigator.clipboard.writeText(url)` | mock spy call |
| SM-3 | "Copied!" affordance flips on success | text content |
| SM-4 | "Copied!" reverts after 2 seconds | `vi.useFakeTimers` + `vi.advanceTimersByTime(2000)` |
| SM-5 | Emit-before-close: `emitWebEvent` fires BEFORE `dialog.close()` on Close click | order assertion via mock call order |
| SM-6 | Backdrop click (`event.target === dialogRef`) closes | spy call |
| SM-7 | ESC closes (native browser behavior — `dialog.close()` event fires) | event listener |
| SM-8 | Bilingual zh — "分享看板" + "已复制" | text content |

### §6.6 — `__tests__/BoardWorkspacesModule.test.tsx` (MODIFY — +6 new cases BWM-EXT-1..6)

| ID | Case | Assertion |
|---|---|---|
| BWM-EXT-1 | Filter button is now enabled (no longer `disabled`) | `expect(btn).not.toBeDisabled()` |
| BWM-EXT-2 | Click Filter button opens `FilterPopover` | popover visible |
| BWM-EXT-3 | Selecting a label in the popover narrows the visible card count in BoardView | rendered card count |
| BWM-EXT-4 | Share button is now enabled (no longer `disabled`) | `expect(btn).not.toBeDisabled()` |
| BWM-EXT-5 | Click Share button opens `ShareModal` | dialog visible |
| BWM-EXT-6 | Switching active board (via BoardSwitcher pick) resets filter to `EMPTY_FILTER` | filter state reset after `setActiveBoardId(otherId)` |

### §6.7 — Mock strategy additions

- `navigator.clipboard.writeText` mocked via `vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)`.
- `crypto.subtle.digest` is real in jsdom 26 (native WebCrypto); SU-6 fallback simulated via temporary `Object.defineProperty(globalThis, 'crypto', { value: {} })` inside the test.
- `emitWebEvent` from `@repo/xai-web-event-bus` mocked at module level via `vi.mock("@repo/xai-web-event-bus", …)` returning a spy; SM-5 asserts call-order.

### §6.8 — Acceptance gates (this package's slice — cross-ref §6.7 of board-views test.md for global gate matrix)

| Gate | Description |
|---|---|
| G3 | `pnpm --filter @repo/plugin-web-board-workspaces test` → 135 baseline + 8 + 6 + 10 + 8 + 6 = 173 PASS (precise count subject to ±2) |
| G3a | All NEW tests (38 cases) PASS individually |
| G3b | Existing 135 tests PASS unchanged (no regression) |

## §7 — 2026-06-03 Extension Tests (Project module row #14 — Automation Lite)

> Canonical row docs live in `packages/xai-web-board-automation-lite/docs/`.

| File | Suite | Cases |
|---|---|---|
| `__tests__/BoardWorkspacesModule.test.tsx` | BWM-AUTO-1 | Daily mount automation persists urgent labels, due-date sort, and Done completion through `xai_boards_v2`. |
| | BWM-AUTO-2 | Manual toolbar button reruns presets after a same-day due edit. |

Acceptance gate:

- `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
- `pnpm --filter @repo/plugin-web-board-workspaces lint`
- `pnpm --filter @repo/plugin-web-board-workspaces test`

## §8 — 2026-06-03 Extension Tests (Project module row #15 — Board integrations)

> Canonical row docs live in `packages/xai-web-board-integrations/docs/`.

| File | Suite | Cases |
|---|---|---|
| `__tests__/BoardWorkspacesModule.test.tsx` | BWM-INTEGRATIONS-1 | Provider link attachments persist integration metadata and render the provider label. |
| `__tests__/BoardWorkspacesModule.test.tsx` | BWM-DETAIL-4 | Invalid integration URLs still do not mutate card attachment state. |

Acceptance gate:

- `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
- `pnpm --filter @repo/plugin-web-board-workspaces lint`
- `pnpm --filter @repo/plugin-web-board-workspaces test`
- local `/app/board` browser smoke
