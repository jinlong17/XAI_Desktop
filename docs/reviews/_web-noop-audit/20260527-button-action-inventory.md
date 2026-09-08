# Web Console — Button & Action Inventory (No-Op Audit)

**Audit date:** 2026-05-27
**Auditor:** Discovery agent (read-only)
**Branch:** `web`
**Scope:** Every visible user-facing action surface across the 12 Web Console
routes registered in `apps/web/src/routes/modules/shellRegistrations.tsx` plus
the host-level chrome (Topbar, AppRail, AvatarMenu, CommandPalette, DesktopPet).
**Authority:** ADR-0010 Accepted 2026-05-26 (P0 Web = maintenance-only;
P1 Desktop active). This audit produces ZERO product code changes — its only
output is this report. Any follow-up code action requires a separate ADR /
carve-out per CLAUDE.md.

---

## 0. Reading guide

### 0.1 Discovery method
1. Routes were enumerated from `apps/web/src/routes/modules/shellRegistrations.tsx`
   + `composedSettingsRegistration.tsx` + `webModuleRouteRegistrations` (legacy
   todos shim). Twelve rail-visible / rail-hidden routes were identified; no
   route was assumed from PRD-list alone.
2. For each plugin package: `src/index.ts` was scanned for entry components,
   then every component file was grepped for `onClick=`, `aria-label=`,
   `<button`, `emitWebEvent`, `usePref`, `setPref`, `xai_*` literals, and
   `localStorage`. Drag/drop surfaces were located via `onDrop|onDragStart`.
3. Persistence registry: `packages/plugin-web-storage/src/internal/registry.ts`
   was the canonical list of 90+ `xai_*` keys. Event channels were taken from
   `packages/core/src/types/events.ts` (the `web:*` block).
4. Where static analysis could not decide (e.g. a button with `onClick` whose
   callback only updates in-memory React state and never calls `setPref` or
   `emitWebEvent`), the row is classified `STUB-EVENT-ONLY` or
   `UNKNOWN-NEEDS-SMOKE` and flagged for browser confirmation.

### 0.2 Package-name vs. directory-name reminder
The npm name `@repo/plugin-web-*` does not match its on-disk path 1:1. The
map (truth from `package.json`):

| npm name | directory |
|---|---|
| `@repo/plugin-web-tasks` | `packages/xai-web-tasks` |
| `@repo/plugin-web-board-workspaces` | `packages/plugin-web-board-workspaces` |
| `@repo/plugin-web-board-core` | `packages/plugin-web-board-core` |
| `@repo/plugin-web-board-views` | `packages/plugin-web-board-views` |
| `@repo/plugin-web-calendar` | `packages/xai-web-calendar` |
| `@repo/plugin-web-dashboard-grid` | `packages/xai-web-dashboard-grid` |
| `@repo/plugin-web-dashboard-widgets` | `packages/xai-web-dashboard-widgets` |
| `@repo/plugin-web-matrix` | `packages/xai-web-matrix` |
| `@repo/plugin-web-habits` | `packages/xai-web-habits` |
| `@repo/plugin-web-meditation` | `packages/xai-web-meditation` |
| `@repo/plugin-web-pomodoro` | `packages/plugin-web-pomodoro` |
| `@repo/plugin-web-countdown` | `packages/plugin-web-countdown` |
| `@repo/plugin-web-ai-chat` | `packages/plugin-web-ai-chat` |
| `@repo/plugin-web-statistics` | `packages/plugin-web-statistics` |
| `@repo/plugin-web-settings-shell` | `packages/plugin-web-settings-shell` |
| `@repo/plugin-web-settings-rest` | `packages/plugin-web-settings-rest` |
| `@repo/plugin-web-settings-features-panel` | `packages/xai-web-settings-features-panel` |
| `@repo/plugin-web-settings-appearance` | `packages/xai-web-settings-appearance` |
| `@repo/plugin-web-pet` | `packages/xai-web-pet` |
| `@repo/plugin-web-tokens` | `packages/plugin-web-tokens` |
| `@repo/plugin-web-storage` | `packages/plugin-web-storage` |
| `@repo/xai-web-shell` | `packages/xai-web-shell` |
| `@repo/xai-web-event-bus` | `packages/xai-web-event-bus` |
| `@repo/xai-web-cmdk` | `packages/xai-web-cmdk` |

All `component path` references in the per-route tables use the directory path,
not the npm name.

### 0.3 Classification legend
- `REAL` — produces persistence or external side-effect (localStorage,
  IndexedDB, `window.location.assign`, etc.)
- `STUB-EVENT-ONLY` — emits a `@repo/core/events` channel **or** only flips
  in-memory React state; nothing crosses the persistence boundary
- `DISABLED` — visually disabled with tooltip
- `COMING-SOON` — visible but labelled unavailable
- `HIDDEN-IF-FEATURE-FLAG` — controlled by `xai_pref_features_*` toggle
- `BROKEN` — should work but errors / no-ops
- `UNKNOWN-NEEDS-SMOKE` — static analysis cannot decide, manual browser
  verification required

---

## 1. Executive summary (≤300 words)

The Web Console ships 12 routes built on a slot-pattern shell (`xai-web-shell`)
backed by a 90-key `localStorage` registry (`plugin-web-storage`) and a typed
`web:*` event bus (`xai-web-event-bus`). Persistence works: every CRUD-shaped
surface that already has an `onClick` handler writes through `usePref`/`setPref`
and survives refresh. Cmd+K is live, the rail is drag-reorderable, and the
appearance pane wires every dimension through `web:settings:preference-changed`.

The product risk is not "things are broken" — it is **surface area without
follow-through**. Approximately one in three header / overflow / "+" buttons
across the 12 modules has no `onClick` at all and is shipped as a visual
placeholder. Three header families repeat the same pattern: a "more / dots"
icon, an "add" plus icon, and a "list-toggle" icon. None are gated, none are
labelled `disabled`, none open an authoring sheet. From a user-perception
standpoint they read as broken.

A second risk is the **mock-fixture dashboard widgets** (Mail, Upcoming,
Weather, Stickies) — they render hard-coded fictional rows and never integrate
with the real task/habit/calendar stores even though those stores exist and
the `goTo` event channel could trivially navigate to them.

A third risk lives in the **emit-but-no-consumer** event family:
`web:dashboard:widget-added`, `web:dashboard:add-widget-clicked`,
`web:board:share-requested`, `web:search:invoked`, and
`web:settings:rest:account-delete-confirmed` are all emitted in production
code but have zero subscribers outside test files — they were declared for
future cross-module integration that has not been started.

Maintenance-only bug-fix is possible without ADR change. Anything beyond
that — promoting stubs, deleting dead surfaces, or wiring widgets to real data
— requires either a P0 carve-out commit citing ADR-0010 §D4 or, for the
larger reshaping, an ADR-0011 superseding ADR-0010 §D1.

---

## 2. Per-route inventories

The 12 routes from `webShellModuleRegistrations` plus the legacy `/app/todos`
shim, host chrome, the global Cmd+K palette, and the floating Pet are each
covered below.

Route resolution: every module declares `defaultChildPath: ""` and
`children: [{ path: "" }, { path: "*" }]`. There are no nested route-defined
sub-pages (e.g. "/app/tasks/foo" — modules handle splat in-component).
The exception is Settings: `/app/settings/<paneId>` is honoured by
`ComposedSettingsModule` for deep-linking.

---

### 2.1 `/app/ai` — AI Chat (railOrder 1 · not toggleable)

Owner package: `packages/plugin-web-ai-chat` (npm: `@repo/plugin-web-ai-chat`)
Persistence keys: `xai_ai_convos`, `xai_ai_insights`, `xai_ai_voice`,
`xai_ai_provider`, `xai_ai_base_url`, `xai_ai_model_default`,
`xai_ai_streaming` (+ IndexedDB AES-GCM API-key store in
`aiKeyStorage`).
Emits: `web:ai:rate-limited`, `web:ai:request-failed`,
`web:shell:module-change` (via "Open Settings" deep-link).

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| AI-01 | "Open sidebar" toggle (collapsed state) | REAL | `packages/plugin-web-ai-chat/src/AiChatModule.tsx:377-385` | in-memory `sidebarOpen` | NO (session-scoped) | — | session-scoped UI state only |
| AI-02 | "New chat" (corner FAB) | REAL | `AiChatModule.tsx:387-395` | `xai_ai_convos` via `setRawConvos` | YES | — | resets thread; convo list persists |
| AI-03 | "Insights toggle" header pill | REAL | `AiChatModule.tsx:396-425` | `xai_ai_insights` via `usePref` | YES | — | suppresses starter prompts when on |
| AI-04 | Sidebar "Collapse" button | REAL | `AiSidebar.tsx:40-48` | in-memory `sidebarOpen` | NO | — | |
| AI-05 | Sidebar "New chat" main button | REAL | `AiSidebar.tsx:49-52` | `xai_ai_convos` | YES | — | |
| AI-06 | Sidebar conversation row click | REAL | `AiSidebar.tsx:74` | switches active conv id (in-memory) | NO | — | conv content reads from `xai_ai_convos` |
| AI-07 | Sidebar search-chats input | STUB-EVENT-ONLY | `AiSidebar.tsx:60` | `<input>` with `aria-label` only | NO | — | no `onChange`; cosmetic |
| AI-08 | Thread starter prompts | REAL | `AiThread.tsx:43-50` | injects starter as user input | YES (when sent) | `web:ai:request-failed` on adapter failure | starter triggers handleSend |
| AI-09 | Composer attach icon | REAL | `AiComposer.tsx:99-105` | opens file picker; attachments held in-memory | NO | — | files attach to draft only |
| AI-10 | Composer model-picker chevron | REAL | `AiComposer.tsx:126-130` | local state + `xai_ai_model_default` | YES | — | open menu writes pref on pick |
| AI-11 | Composer voice mic button | REAL | `AiComposer.tsx:173-180` | `xai_ai_voice` | YES | — | toggle persisted; voice itself not wired |
| AI-12 | Composer send | REAL | `AiComposer.tsx:183-190` | flushes message into stream queue | YES | `web:ai:rate-limited`, `web:ai:request-failed` (on failure) | hits `claudeStreamAdapter` |
| AI-13 | Composer remove-attachment X | REAL | `AiComposer.tsx:87-95` | in-memory `attachments` array | NO | — | |
| AI-14 | ErrorBanner "Open Settings → AI" | REAL | `ErrorBanner.tsx:119-127` | calls `handleOpenSettings` | NO | `web:shell:module-change` (settings/ai) | navigates via emitted event |
| AI-15 | ErrorBanner "Retry" | REAL | `ErrorBanner.tsx:128-138` | re-queues last prompt | NO | — | rate-limited variant disabled until countdown=0 |
| AI-16 | ErrorBanner dismiss × | REAL | `ErrorBanner.tsx:140-147` | clears `bannerError` state | NO | — | |
| AI-17 | Voice "BreathingOrb" stage (visual) | n/a (no action) | `BreathingOrb.tsx` | — | — | — | no `onClick`; pure visual |
| AI-18 | Aurora background (visual) | n/a (no action) | `AiAurora.tsx` | — | — | — | pure visual |

Updates statistics / dashboard / cmdk / AI context: **YES** — Cmd+K's
`ai` adapter indexes `xai_ai_convos` content (see `packages/xai-web-cmdk/src/adapters/index.ts`).

Recommended next action per row: **KEEP all** — AI Chat is the most fully
plumbed module. The voice-mic toggle (AI-11) persists a pref but never
records audio; could be flagged COMING-SOON in UI copy but no urgent action.

---

### 2.2 `/app/tasks` — Tasks (railOrder 2 · toggleable via `xai_pref_features_tasks`)

Owner package: `packages/xai-web-tasks` (npm: `@repo/plugin-web-tasks`)
Persistence keys: `xai_task_cols`.
Emits: none.

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| T-01 | Sidebar smart-list row (All/Today/Tomorrow/Next7/Inbox/Summary) | STUB-EVENT-ONLY | `xai-web-tasks/src/TasksSidebar.tsx:62-77` | in-memory `activeList` | NO | — | filter never applied to the 4-bucket board |
| T-02 | Sidebar custom-list row | STUB-EVENT-ONLY | `TasksSidebar.tsx:83-96` | in-memory `activeList` | NO | — | hard-coded fixture `CUSTOM_LISTS` |
| T-03 | Sidebar tag row | STUB-EVENT-ONLY | `TasksSidebar.tsx:110-117` | — | NO | — | no `onClick` at all; visual only |
| T-04 | Sidebar "Local Calendars" subscription row | STUB-EVENT-ONLY | `TasksSidebar.tsx:121-130` | — | NO | — | no `onClick`; static count "8" |
| T-05 | Sidebar Completed / Won't Do / Trash | STUB-EVENT-ONLY | `TasksSidebar.tsx:134-152` | — | NO | — | `role="button"` + `tabIndex` but no handler |
| T-06 | Header "Filters" icon button | STUB-EVENT-ONLY | `xai-web-tasks/src/TasksModule.tsx:118-122` | — | NO | — | `aria-label` only, no `onClick` |
| T-07 | Header "More" 3-dot button | STUB-EVENT-ONLY | `TasksModule.tsx:123-127` | — | NO | — | `aria-label` only, no `onClick` |
| T-08 | Column "Postpone" button (Yesterday column action) | STUB-EVENT-ONLY | `TaskColumn.tsx:59-67` | — | NO | — | rendered when `col.action === "postpone"`; no `onClick` |
| T-09 | Column "+" add-card button | STUB-EVENT-ONLY | `TaskColumn.tsx:68-74` | — | NO | — | no `onClick`; cannot create task from UI |
| T-10 | TaskCard click (toggle complete) | REAL | `TaskCard.tsx:49` + `66` | `completedIds` set in-memory | NO (session) | — | completion not persisted (see Module:41) |
| T-11 | TaskCard drag-start | REAL | `TasksModule.tsx:51-59` | dataTransfer | NO | — | initiates HTML5 DnD |
| T-12 | TaskCard drag-drop to column | REAL | `TasksModule.tsx:76-93` | `xai_task_cols` via `setRawCols` | YES | — | only persistence path in Tasks |
| T-13 | Drag-hint visual ("Drop on any column to reschedule") | n/a | `TasksModule.tsx:108-115` | — | — | — | passive hint |
| T-14 | Empty column drop-zone hint | n/a | `TaskColumn.tsx:90-95` | — | — | — | "Drop tasks here" placeholder |

Updates statistics / dashboard / cmdk / AI context: **PARTIAL** — Cmd+K's
`tasks` adapter (`adapters/tasks.ts`) reads `xai_task_cols`; Statistics reads
`xai_pomodoro_sessions` and `xai_habits_state` only (no task counter). The
`StatTasks` dashboard widget exists but reads from a hard-coded fixture, not
`xai_task_cols` (verify in `xai-web-dashboard-widgets/src/widgets/StatTasks.tsx`
— needs smoke).

Recommended next action: **T-06/T-07/T-09 are the highest-perceived no-ops**
(Filters / More / + Add). PROMOTE-STUB or DISABLE. T-10 in-memory completion
state should either persist via a new `xai_task_completed` key (BUGFIX) or
the toggle should also rewrite the column data.

---

### 2.3 `/app/board` — Boards (railOrder 3 · toggleable via `xai_pref_features_board`)

Owner package: `packages/plugin-web-board-workspaces` (extends `board-core`
+ `board-views`).
Persistence keys: `xai_boards_v2`, `xai_active_board`, `xai_board_panels`,
`xai_board_inbox`, `xai_board_view_by_id`.
Emits: `web:board:share-requested`.

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| B-01 | Workspace chip (initials) | STUB-EVENT-ONLY | `BoardWorkspacesModule.tsx:317-323` | — | NO | — | visual, no `onClick` |
| B-02 | Board-title chevron (open switcher) | REAL | `BoardWorkspacesModule.tsx:324-332` | opens modal | NO | — | |
| B-03 | View picker (Board/Table/Calendar/Timeline/Dashboard/Map) | REAL | `ViewPicker.tsx:33-45` | `xai_board_view_by_id` per board | YES | — | |
| B-04 | "Overview" toggle | REAL | `BoardWorkspacesModule.tsx:350-358` | in-memory `overviewOpen` | NO | — | only visible when isPM |
| B-05 | "Filter" toggle + popover | REAL | `BoardWorkspacesModule.tsx:359-378` + `FilterPopover.tsx` | local `filter` state | NO | — | filter applied to `filteredLists` |
| B-06 | "Share" button | REAL | `BoardWorkspacesModule.tsx:379-386` | opens ShareModal | NO | `web:board:share-requested` (on Copy) | no consumer wired |
| B-07 | ShareModal "Copy link" | STUB-EVENT-ONLY | `ShareModal.tsx:115-123` | clipboard write | NO | `web:board:share-requested` | no real share link; copies placeholder URL |
| B-08 | ShareModal close | REAL | `ShareModal.tsx:124-130` | — | NO | — | |
| B-09 | Bottom switcher Inbox/Planner/Board | REAL | `BoardWorkspacesModule.tsx:466-490` | `xai_board_panels` | YES | — | |
| B-10 | Bottom switcher "Switch boards" | REAL | `BoardWorkspacesModule.tsx:492-499` | opens switcher modal | NO | — | |
| B-11 | BoardSwitcher pick board | REAL | `BoardSwitcher.tsx:140-145` | `xai_active_board` | YES | — | |
| B-12 | BoardSwitcher delete board | REAL | `BoardSwitcher.tsx:159-167` + `BoardWorkspacesModule.deleteBoard` | `xai_boards_v2` | YES | — | DESTRUCTIVE — no confirmation dialog (FLAG) |
| B-13 | BoardSwitcher create board | REAL | `BoardSwitcher.tsx:109-114` + `BoardCreator.tsx` | `xai_boards_v2` | YES | — | |
| B-14 | BoardSwitcher scope tabs (all / per-workspace) | REAL | `BoardSwitcher.tsx:90-107` | in-memory `scope` | NO | — | |
| B-15 | BoardCreator template chips | REAL | `BoardCreator.tsx:47-54` | local `tpl` state | NO | — | |
| B-16 | BoardCreator Submit | REAL | `BoardCreator.tsx:90-99` | `xai_boards_v2` | YES | — | |
| B-17 | BoardCreator Cancel / Close | REAL | `BoardCreator.tsx:35-43`, `87-90` | — | NO | — | |
| B-18 | List "+ Add a card" composer | REAL | `BoardList.tsx:228-251` + `BoardView` | `xai_boards_v2` (via setLists) | YES | — | |
| B-19 | List ⋯ menu open | REAL | `BoardList.tsx:123-131` | in-memory `listMenu` | NO | — | |
| B-20 | List menu "Add card" | REAL | `BoardList.tsx:154-163` | opens composer | NO | — | |
| B-21 | List menu color swatch | REAL | `BoardList.tsx:170-184` | `xai_boards_v2` (list.color) | YES | — | |
| B-22 | List menu "Remove color" | REAL | `BoardList.tsx:186-195` | sets list.color = null | YES | — | |
| B-23 | BoardCard click | STUB-EVENT-ONLY | `BoardCard.tsx:47` + `BoardList.tsx:209` | calls `onOpenCard?.(card.id)` | NO | — | **`onOpenCard` is never wired in row #9** — no detail modal exists (search `onOpenCard\?` in board-workspaces yields no provider) |
| B-24 | BoardCard drag-start (HTML5) | REAL | `BoardCard.tsx` + DnD MIME `application/x-xai-board-card` | dataTransfer | NO | — | |
| B-25 | List "+ Add another list" | REAL | `BoardView.tsx:222-228` + `addList` | `xai_boards_v2` | YES | — | |
| B-26 | List composer Add / Cancel | REAL | `BoardView.tsx:203-218` | `xai_boards_v2` / closes composer | YES | — | |
| B-27 | Inbox composer input + Enter | REAL | `InboxPanel.tsx:43-57` + `add()` | `xai_board_inbox` (via setCards prop) | YES | — | |
| B-28 | Inbox card delete (×) | REAL | `InboxPanel.tsx:62-71` | `xai_board_inbox` | YES | — | DESTRUCTIVE — no confirmation |
| B-29 | Planner hour-slot click | STUB-EVENT-ONLY | `PlannerPanel.tsx:126-136` | calls `onOpenCard` which is **not provided** | NO | — | dead callback chain; users click but nothing happens |
| B-30 | StatusOverviewBanner close | REAL | `StatusOverviewBanner.tsx:49-53` | in-memory `overviewOpen` | NO | — | |
| B-31 | FilterPopover Reset | REAL | `FilterPopover.tsx:89-95` | resets filter to EMPTY_FILTER | NO | — | |
| B-32 | View=Table cell click | REAL | `TableView.tsx:101` + `onOpenCard` | `onOpenCard` not provided here either | NO | — | same dead callback issue |
| B-33 | View=Table inline-edit field | REAL | `TableView.tsx:130-184` | `xai_boards_v2` via `updateCard` | YES | — | |
| B-34 | View=Calendar event click | STUB-EVENT-ONLY | `BoardCalendarView.tsx:194` | `onOpenCard?` not provided | NO | — | dead callback |
| B-35 | View=Timeline bar drag (move/resize) | REAL | `TimelineView.tsx:259-280` | `xai_boards_v2` via `updateCard` | YES | — | |
| B-36 | View=Timeline bar click (open) | STUB-EVENT-ONLY | `TimelineView.tsx:259-262` | `onOpenCard?` not provided | NO | — | dead callback |
| B-37 | View=Map (lazy Suspense fallback) | n/a | `MapView.tsx` | — | — | — | no action surfaces grep-found |

Updates statistics / dashboard / cmdk / AI context: **PARTIAL** — Cmd+K's
`board` adapter indexes board names. Statistics module does NOT count board
cards. The Dashboard's `MiniCalWidget` re-emits `web:shell:module-change` with
`source: "mini-cal"` but only routes to `calendar`, never to a specific board
card. `web:board:share-requested` has no subscriber outside tests.

Recommended next action: **BUGFIX cluster** — wire `onOpenCard` to either a
new CardDetail modal in `board-workspaces` or a route-level deep-link. B-23,
B-29, B-32, B-34, B-36 are the same dead chain expressed five places and are
collectively the worst no-op cluster in the app. B-12 (delete board) and B-28
(delete inbox card) need confirmation dialogs (UX risk, possible BUGFIX).

---

### 2.4 `/app/dashboard` — Dashboard (railOrder 4 · toggleable via `xai_pref_features_dashboard`)

Owner package: `packages/xai-web-dashboard-grid` (composes registrations from
`xai-web-dashboard-widgets` row #11).
Persistence keys: `xai_dash_order`, `xai_clock_style`, `xai_clock_tz`,
`xai_zones`.
Emits: `web:dashboard:add-widget-clicked`, `web:dashboard:widget-added`,
`web:shell:module-change` (mini-cal navigation).

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| D-01 | Header "Add widget" button | REAL | `DashHeader.tsx:61-70` | opens picker dialog | NO | `web:dashboard:add-widget-clicked` (source=add-widget-button) | no consumer |
| D-02 | EmptyState "Add a widget" CTA | REAL | `EmptyState.tsx` + `DashboardModule.tsx:71-75` | opens picker | NO | `web:dashboard:add-widget-clicked` (source=empty-state-cta) | no consumer |
| D-03 | AddWidgetPicker tile click | REAL | `AddWidgetPicker.tsx:234-247` + `DashboardModule.tsx:79-83` | `xai_dash_order` | YES | `web:dashboard:widget-added` (source=picker) | no consumer |
| D-04 | AddWidgetPicker Cancel | REAL | `AddWidgetPicker.tsx:252-260` | closes dialog | NO | — | |
| D-05 | Widget drag-reorder (pointer events) | REAL | `DashboardGrid.tsx` + `useGridDrag` | `xai_dash_order` | YES | — | swap-on-overlap pattern |
| D-06 | Widget remove (per-widget) | MISSING | (no remove button found) | — | — | — | **GAP** — once added, widget cannot be removed via UI; user must clear `xai_dash_order` manually |
| D-07 | ClockWidget tz button → popover | REAL | `widgets/ClockWidget.tsx:248-251, 282+` | `xai_clock_tz` on picked tz | YES | — | |
| D-08 | ClockWidget style toggle (analog/digital/etc.) | REAL | `widgets/ClockWidget.tsx:261-269` | `xai_clock_style` | YES | — | |
| D-09 | MiniCalWidget prev-month | REAL | `widgets/MiniCalWidget.tsx:67-79` | local `offset` | NO | — | |
| D-10 | MiniCalWidget next-month | REAL | `widgets/MiniCalWidget.tsx:82-91` | local `offset` | NO | — | |
| D-11 | MiniCalWidget body click | REAL | `widgets/MiniCalWidget.tsx:60-64` | navigates | NO | `web:shell:module-change` (source=mini-cal) | |
| D-12 | MiniCalWidget "Open calendar" footer link | REAL | `widgets/MiniCalWidget.tsx:126-135` | navigates | NO | `web:shell:module-change` (source=mini-cal) | |
| D-13 | MiniCalWidget day cell click | STUB-EVENT-ONLY | `widgets/MiniCalWidget.tsx:100-119` | — | NO | — | only highlights via class; no `onClick` per cell; events shown are from hard-coded `CAL_EVENTS` fixture |
| D-14 | WorldClocks view tabs (24h / Day) | REAL | `widgets/WorldClocks.tsx:75-86` | local `view` | NO | — | |
| D-15 | WorldClocks "+ add zone" toggle | REAL | `widgets/WorldClocks.tsx:87-93` | local `picker` | NO | — | |
| D-16 | WorldClocks zone delete | REAL | `widgets/WorldClocks.tsx:124-130` + `removeZone` | `xai_zones` | YES | — | |
| D-17 | WorldClocks zone picker rows | REAL | `widgets/WorldClocks.tsx:145+` | `xai_zones` | YES | — | adds zone |
| D-18 | MailWidget row click | STUB-EVENT-ONLY | `widgets/MailWidget.tsx` | hard-coded `MAILS` fixture | NO | — | **MOCK** — no email integration; 4 fake rows |
| D-19 | UpcomingWidget row click | STUB-EVENT-ONLY | `widgets/UpcomingWidget.tsx` | hard-coded `UPCOMING` fixture | NO | — | **MOCK** — fake upcoming events |
| D-20 | WeatherWidget surface | STUB-EVENT-ONLY | `widgets/WeatherWidget.tsx` | hard-coded `WEATHER` fixture | NO | — | **MOCK** — no API; "Hangzhou" / fake forecast |
| D-21 | StickiesWidget "+" button | STUB-EVENT-ONLY | `widgets/StickiesWidget.tsx:24-27` | — | NO | — | no `onClick`; cannot add sticky |
| D-22 | StickiesWidget rotate stack | n/a | `widgets/StickiesWidget.tsx` | hard-coded `STICKIES` fixture | NO | — | **MOCK** — 3 fake notes |
| D-23 | StatTasks / StatPomos / StatStreak | UNKNOWN-NEEDS-SMOKE | `widgets/StatTasks.tsx` etc. | likely fixtures | NO | — | needs smoke vs `xai_pomodoro_sessions` / `xai_habits_state` |

Updates statistics / dashboard / cmdk / AI context: **YES (partial)** — adds
widget IDs to Cmd+K via `adapters/dashboard.ts`. The 4 mock widgets
(D-18..D-22) are isolated from the rest of the data graph.

Recommended next action: **D-06 is a BUGFIX** (no widget-remove). D-13/D-18/
D-19/D-20/D-22 are the **mock-fixture cluster** — needs an ADR decision: ship
them disabled, hide via feature flag, or wire to real data. D-01..D-04
emit-no-consumer is benign (decorative events) until someone wires
notification or undo.

---

### 2.5 `/app/calendar` — Calendar (railOrder 5 · toggleable via `xai_pref_features_calendar`)

Owner package: `packages/xai-web-calendar`.
Persistence keys: `xai_calendar_view`, `xai_pref_week_start` (read).
Emits: none. Listens: `web:shell:module-change` (with `focusDate`).

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| C-01 | Toolbar list-toggle icon | STUB-EVENT-ONLY | `CalendarToolbar.tsx:34-36` | — | NO | — | no `onClick`; `data-testid="cal-list-toggle"` placeholder |
| C-02 | Toolbar "+" add-event icon | STUB-EVENT-ONLY | `CalendarToolbar.tsx:39-41` | — | NO | — | **no `onClick` — cannot create calendar event** |
| C-03 | View tab "Day" | REAL | `CalendarToolbar.tsx:43-50` | `xai_calendar_view` | YES | — | |
| C-04 | View tab "Week" | REAL | `CalendarToolbar.tsx:51-58` | `xai_calendar_view` | YES | — | |
| C-05 | View tab "Month" | REAL | `CalendarToolbar.tsx:59-66` | `xai_calendar_view` | YES | — | |
| C-06 | Prev-month | REAL | `CalendarToolbar.tsx:68-75` | local `activeDate` | NO | — | view-derived navigation |
| C-07 | "Today" reset | REAL | `CalendarToolbar.tsx:76-83` | resets activeDate | NO | — | hard-coded anchor MAY_2026_ANCHOR_TODAY |
| C-08 | Next-month | REAL | `CalendarToolbar.tsx:84-91` | local `activeDate` | NO | — | |
| C-09 | Toolbar "dots" overflow | STUB-EVENT-ONLY | `CalendarToolbar.tsx:92-94` | — | NO | — | no `onClick` |
| C-10 | CalendarBanner "upgrade" | STUB-EVENT-ONLY | `CalendarBanner.tsx:20` | — | NO | — | no `onClick`; rendered in some states |
| C-11 | MonthGrid cell click | STUB-EVENT-ONLY | `MonthCell.tsx` | — | NO | — | no `onClick` grep hit |
| C-12 | EventBlock click | STUB-EVENT-ONLY | `EventBlock.tsx` | — | NO | — | `aria-label` only, no `onClick` |
| C-13 | DayView / WeekView hour cell | STUB-EVENT-ONLY | `DayView.tsx`, `WeekView.tsx` | — | NO | — | no `onClick`/`onPointerDown` found |

Updates statistics / dashboard / cmdk / AI context: **YES (read-only)** — Cmd+K's
`calendar` adapter exists; reads only.

Recommended next action: **Calendar is the highest concentration of perceived
no-ops in the whole console.** The "+" event-creation button (C-02) and the
list-toggle (C-01) read as obvious controls but do nothing. Events shown are
from fixtures. PROMOTE-STUB or COMING-SOON labelling would be the lightest
fix; full event CRUD is an ADR-scale change.

---

### 2.6 `/app/matrix` — Eisenhower Matrix (railOrder 6 · toggleable via `xai_pref_features_matrix`)

Owner package: `packages/xai-web-matrix`.
Persistence keys: `xai_matrix_state`.
Emits: `web:matrix:priority-tagged`.

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| M-01 | Header "+" add button | STUB-EVENT-ONLY | `MatrixModule.tsx:39-41` | — | NO | — | no `onClick`; cannot create card from UI |
| M-02 | Header "More" dots | STUB-EVENT-ONLY | `MatrixModule.tsx:42-44` | — | NO | — | no `onClick` |
| M-03 | Quadrant per-quadrant "+" add card | STUB-EVENT-ONLY | `Quadrant.tsx:81-83` | — | NO | — | no `onClick` per quadrant |
| M-04 | Quadrant per-quadrant "More actions" dots | STUB-EVENT-ONLY | `Quadrant.tsx:84-86` | — | NO | — | no `onClick` |
| M-05 | Card drag between quadrants | REAL | `MatrixModule.tsx` + `usePersistedMatrix.moveCard` | `xai_matrix_state` | YES | `web:matrix:priority-tagged` | only persistence path; no consumer |
| M-06 | Card click | UNKNOWN-NEEDS-SMOKE | `Card.tsx` | no `onClick` grep hit | NO | — | needs smoke to confirm read-only |

Updates statistics / dashboard / cmdk / AI context: Cmd+K `matrix` adapter
reads `xai_matrix_state`.

Recommended next action: M-01..M-04 are the same "add+more" boilerplate as
Tasks and Calendar — DISABLE or PROMOTE-STUB. Without M-01/M-03 a user cannot
add a card to the matrix at all; existing cards come from seed.

---

### 2.7 `/app/pomodoro` — Pomodoro (railOrder 7 · toggleable via `xai_pref_features_pomodoro`)

Owner package: `packages/plugin-web-pomodoro`.
Persistence keys: `xai_pomodoro_sessions`.
Emits: `web:pomodoro:session-finished`.

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| P-01 | Mute toggle | REAL | `PomodoroModule.tsx:256-272` | in-memory `muted` | NO | — | tick sound mute only |
| P-02 | Header "More" dots | STUB-EVENT-ONLY | `PomodoroModule.tsx:273-280` | — | NO | — | no `onClick` |
| P-03 | "Select mode" focus-pill (mode picker) | STUB-EVENT-ONLY | `PomodoroModule.tsx:287-294` | — | NO | — | comment explicitly says "no-op in v1" |
| P-04 | Start button (idle) | REAL | `PomodoroModule.tsx:310-319` | timer running flag | NO (session) | — | start kicks state machine |
| P-05 | Pause button (running) | REAL | `PomodoroModule.tsx:322-329` | — | NO | — | |
| P-06 | End button (running/paused) | REAL | `PomodoroModule.tsx:331-339`, `353-362` | `xai_pomodoro_sessions` (on natural finish via timer) | YES | `web:pomodoro:session-finished` | |
| P-07 | Continue button (paused) | REAL | `PomodoroModule.tsx:344-352` | — | NO | — | |
| P-08 | Focus record list (right side) | n/a | `FocusRecordList.tsx` | reads `xai_pomodoro_sessions` | YES (read-only display) | — | |
| P-09 | Overview KPI tiles | n/a | `PomodoroOverview.tsx` | reads `xai_pomodoro_sessions` | YES (read-only) | — | aggregated stats |

Updates statistics / dashboard / cmdk / AI context: **YES** — `xai_pomodoro_sessions`
is consumed by Statistics module (`StatisticsModule.tsx:76`), the `StatPomos`
dashboard widget (likely), and Cmd+K's `pomodoro` adapter. Cross-module
integration is best-in-class for this surface.

Recommended next action: P-02 / P-03 are the only obvious no-ops; PROMOTE-STUB
or DISABLE.

---

### 2.8 `/app/habits` — Habits (railOrder 8 · toggleable via `xai_pref_features_habits`)

Owner package: `packages/xai-web-habits`.
Persistence keys: `xai_habits_state`.
Emits: `web:habits:checkin-recorded`.

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| H-01 | HabitList row click (select habit) | REAL | `HabitRow.tsx:46` + `HabitsModule.handleSelect` | in-memory `selectedId` | NO (session) | — | |
| H-02 | HabitList weekly check-cell toggle | REAL | `HabitRow.tsx:70-76` | `xai_habits_state` | YES | `web:habits:checkin-recorded` | |
| H-03 | HabitList view toggle (list / grid) | STUB-EVENT-ONLY | `HabitList.tsx:61-72` | — | NO | — | both `onClick` present? **YES** — toggles local view state |
| H-04 | HabitList "+ Add habit" | REAL | `HabitList.tsx:76-82` + `HabitsModule.setAddDialogOpen` | opens AddHabitDialog | NO | — | |
| H-05 | HabitList header "More" dots | STUB-EVENT-ONLY | `HabitList.tsx:84-88` | — | NO | — | no `onClick` |
| H-06 | HabitDetail "More" dots | STUB-EVENT-ONLY | `HabitDetail.tsx:94-100` | — | NO | — | no `onClick` |
| H-07 | HabitDetail prev/next month | REAL | `HabitsModule.handlePrev/NextMonth` | local `displayedMonth` | NO | — | |
| H-08 | HabitDetail MonthCalendar cell toggle | REAL | `MonthCalendar.tsx` (via `handleToggle`) | `xai_habits_state` | YES | `web:habits:checkin-recorded` | |
| H-09 | DiaryCard textarea | REAL | `DiaryCard.tsx:53-56` + onBlur | `xai_habits_state` (diaries map) | YES | — | persists onBlur with equality guard |
| H-10 | AddHabitDialog Save | REAL | `internal/AddHabitDialog.tsx` (saves new habit) | `xai_habits_state` | YES | — | |
| H-11 | AddHabitDialog Cancel | REAL | same | — | NO | — | |
| H-12 | Habit delete | MISSING | (no delete button found via grep) | — | — | — | **GAP** — habits cannot be deleted from UI |

Updates statistics / dashboard / cmdk / AI context: **YES** — Statistics reads
`xai_habits_state`; Cmd+K `habits` adapter reads it; `StatStreak` widget reads
it (presumably).

Recommended next action: H-05 / H-06 menu icons are no-ops; H-12 missing
delete is a content-lifecycle GAP. BUGFIX for H-12 (BLOCKED-architecture: needs
a confirmation modal pattern).

---

### 2.9 `/app/meditation` — Meditation (railOrder 9 · toggleable via `xai_pref_features_meditation`)

Owner package: `packages/xai-web-meditation`.
Persistence keys: `xai_meditation_prefs`.
Emits: none.

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| Med-01 | Header "More" dots | STUB-EVENT-ONLY | `MeditationModule.tsx:80-82` | — | NO | — | no `onClick` |
| Med-02 | "Start" primary button | REAL | `MeditationModule.tsx:105-107` | activates Player | NO | — | |
| Med-03 | Scene picker grid | REAL | `MeditationModule.tsx:118-129` | `xai_meditation_prefs.scene` | YES | — | |
| Med-04 | Clock variant picker | REAL | `MeditationModule.tsx:138-150` | `xai_meditation_prefs.clock` | YES | — | |
| Med-05 | Sound picker | REAL | `MeditationModule.tsx:160-172` | `xai_meditation_prefs.sound` | YES | — | |
| Med-06 | Duration chip picker | REAL | `MeditationModule.tsx:180-191` | `xai_meditation_prefs.duration` | YES | — | |
| Med-07 | MeditationPlayer exit (×) | REAL | `MeditationPlayer.tsx:113-117` | exits player | NO | — | |
| Med-08 | MeditationPlayer audio playback | UNKNOWN-NEEDS-SMOKE | `MeditationPlayer.tsx` | — | — | — | needs smoke — actual audio file load? scene gradient is decorative |

Updates statistics / dashboard / cmdk / AI context: Cmd+K `meditation`
adapter reads `xai_meditation_prefs`.

Recommended next action: Med-01 only. Med-08 worth a manual smoke to confirm
whether `<audio>` source is wired or rendered silent.

---

### 2.10 `/app/countdown` — Countdown (railOrder 10 · NOT toggleable)

Owner package: `packages/plugin-web-countdown`.
Persistence keys: `xai_countdowns`.
Emits: none.

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| Cd-01 | Header "+" new countdown | REAL | `CountdownModule.tsx:105-127` | opens dialog | NO | — | |
| Cd-02 | Header "More" dots | STUB-EVENT-ONLY | `CountdownModule.tsx:127-145` | — | NO | — | no `onClick` |
| Cd-03 | Countdown card click | REAL | `CountdownModule.tsx:148-156` + `openEdit` | opens edit dialog | NO | — | |
| Cd-04 | Inline "+ Add" card | REAL | `AddCountdownCard.tsx:19-25` + `CountdownModule.openCreate` | opens dialog | NO | — | |
| Cd-05 | CountdownEditDialog Save | REAL | dialog component | `xai_countdowns` | YES | — | |
| Cd-06 | CountdownEditDialog Delete | REAL | dialog component | `xai_countdowns` | YES | — | DESTRUCTIVE — check if confirmation present |
| Cd-07 | CountdownEditDialog Cancel | REAL | dialog component | — | NO | — | |

Updates statistics / dashboard / cmdk / AI context: Cmd+K `countdown` adapter
indexes `xai_countdowns`.

Recommended next action: Cd-02 only. Otherwise Countdown is among the most
complete modules.

---

### 2.11 `/app/statistics` — Statistics (railOrder 11 · NOT toggleable)

Owner package: `packages/plugin-web-statistics`.
Persistence keys: read-only (`xai_pomodoro_sessions`, `xai_habits_state`,
`xai_pref_week_start`).
Emits: none.

| # | Action | Class | Component path | Data source | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|---|
| S-01 | Range tab "This week" | REAL | `StatisticsModule.tsx:120-127` | local `range` state | NO | — | |
| S-02 | Range tab "This month" | REAL | `StatisticsModule.tsx:128-134` | local `range` state | NO | — | |
| S-03 | Range tab "All time" | REAL | `StatisticsModule.tsx:135-141` | local `range` state | NO | — | |
| S-04 | KPI cards (tasks, focus, habits, daily avg) | n/a | `KpiCard.tsx` | aggregated | NO | — | read-only display |
| S-05 | Heatmap / LineChart / BarChart / RingChart / HourBar / HabitRank / InsightCallout | n/a | each chart component | aggregated | NO | — | read-only display |

Statistics is a read-only view; no action surfaces beyond the 3 range tabs
are expected. NB: Tasks-completed KPI label is `statistics.tasks_completed`
but the underlying aggregator does **not** read `xai_task_cols` (only
`xai_pomodoro_sessions` and `xai_habits_state`). The KPI may be reporting
fixture-only data — needs smoke.

Recommended next action: smoke S-04 tasks-completed value against a fresh
profile to confirm it tracks real task data; if not, **BROKEN** classification
applies.

---

### 2.12 `/app/settings` — Settings (railOrder 99 · NOT in rail · routed via Topbar / Avatar / `web:shell:module-change`)

Owner packages: `plugin-web-settings-shell` (chassis), `plugin-web-settings-rest`
(12 panes), `xai-web-settings-features-panel` (FeaturesPane), `xai-web-settings-appearance`
(AppearancePane). Composed via
`apps/web/src/routes/modules/composedSettingsRegistration.tsx`.

The Settings module has 13 panes via composition. Each is its own action
surface inventory.

#### 2.12.1 Sidebar
| # | Action | Class | Component path | Persists? | Notes |
|---|---|---|---|---|---|
| Set-S-01 | Pane row click | REAL | `SettingsSidebar.tsx:50-78` (writes URL via `useNavigate`) | NO (URL only) | URL-as-pref pattern; deep links work |

#### 2.12.2 Account pane (`/app/settings/account`)
| # | Action | Class | Component path | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|
| Set-A-01 | Edit avatar | STUB-EVENT-ONLY | `panes/accountPane.tsx:61-66` | NO | — | no `onClick` |
| Set-A-02 | Upgrade plan button | STUB-EVENT-ONLY | `accountPane.tsx:70-72` | NO | — | no `onClick` |
| Set-A-03 | Generic ghost button | STUB-EVENT-ONLY | `accountPane.tsx:76-78` | NO | — | no `onClick` |
| Set-A-04 | Delete account button | REAL | `accountPane.tsx:79-83` + 2-step modal | NO (event only) | `web:settings:rest:account-delete-confirmed` | DESTRUCTIVE — emits event but no backend wired; deprecation note in code |

#### 2.12.3 Premium pane (`/app/settings/premium`)
| # | Action | Class | Component path | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|
| Set-P-01 | Upgrade button | REAL | `internal/premiumUpgradeButton.tsx:71-75` | NO (redirect) | — | `window.location.assign(paymentLinkUrl)` to Stripe payment link |
| Set-P-02 | Cancel subscription | REAL | `internal/premiumCancelButton.tsx:62-65` | `xai_pref_premium_tier` (likely → "free") | `web:premium:tier-changed` | needs source verification |

#### 2.12.4 AI pane (`/app/settings/ai`)
| # | Action | Class | Component path | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|
| Set-AI-01 | Provider select | REAL | `aiPane.tsx:160` + `setProvider` | YES (`xai_ai_provider`) | — | |
| Set-AI-02 | Base URL input | REAL | `aiPane.tsx:175` + `setBaseUrl` | YES (`xai_ai_base_url`) | — | only visible for openai-compatible |
| Set-AI-03 | API key input | REAL (controlled) | `aiPane.tsx:198-201` | NO until Save | — | |
| Set-AI-04 | Save key | REAL | `aiPane.tsx:204-212` + `aiKeyStorage.saveKey` | YES (IndexedDB AES-GCM) | — | flash "Saved" indicator |
| Set-AI-05 | Test Connection | REAL | `aiPane.tsx:214-220` + `aiKeyStorage.testConnection` | NO (network call) | — | shows ok/error copy |
| Set-AI-06 | Delete API key | REAL (with confirm) | `aiPane.tsx:227-232` + native `<dialog>` | YES (clears IDB) | — | |
| Set-AI-07 | Model default picker | REAL | `aiPane.tsx` (Haiku/Sonnet/Opus) | YES (`xai_ai_model_default`) | — | |
| Set-AI-08 | Streaming toggle | REAL | `aiPane.tsx` (Toggle) | YES (`xai_ai_streaming`) | — | |

#### 2.12.5 Integrations pane (`/app/settings/integrations`)
| # | Action | Class | Component path | Persists? | Emits | Notes |
|---|---|---|---|---|---|---|
| Set-I-01 | Wired-provider Connect (Notion / GCal / Linear) | REAL | `internal/integrationConnectButton.tsx:53-61` | YES (sessionStorage state + redirect) | — | `window.location.assign(authorizeUrl)` |
| Set-I-02 | Wired-provider Disconnect | REAL | `internal/integrationDisconnectButton.tsx` | YES (`xai_pref_integrations_connected_*` → false) | `web:settings:integration-disconnected` | |
| Set-I-03 | Featured / Calendar / Integrate placeholder cards (14 unwired) | STUB-EVENT-ONLY | `integrationsPane.tsx:69-87` | NO | — | comment explicitly says "DEV-only console.warn / PROD no-op. No event emit." |

#### 2.12.6 Notifications pane (`/app/settings/notifications`)
Selects + toggles all persist directly via `usePref` to `xai_pref_notif_*`
(quiet hours, sound, push). No nested actions beyond inputs. All **REAL**.

#### 2.12.7 Date & Time pane (`/app/settings/date_time`)
| # | Action | Class | Component path | Persists? | Notes |
|---|---|---|---|---|---|
| Set-DT-01 | Start week select | REAL | `dateTimePane.tsx:51-58` | YES (`xai_pref_dt_start_week`) | |
| Set-DT-02 | Lunar / Week numbers / Holidays toggles | REAL | `dateTimePane.tsx:70-90` | YES (`xai_pref_dt_lunar`, `_week_numbers`, `_holidays`) | |
| Set-DT-03 | Timezone select | REAL | (continuation) | YES (`xai_pref_dt_timezone`) | calendar does not currently respect this — needs smoke |

#### 2.12.8 More pane (`/app/settings/more`)
14 persisted toggles + selects, all REAL via `usePref`. One global action:
| # | Action | Class | Component path | Notes |
|---|---|---|---|---|
| Set-M-01 | "Reset Default" link | REAL | `morePane.tsx:387` + `resetMorePrefs()` | clears 14 More-owned keys, dispatches synthetic `storage` event |
| Set-M-02 | "follow" language select | STUB-EVENT-ONLY | `morePane.tsx:206` (`onChange={() => {}}`) | **REAL STUB** — comment-free, never writes |

#### 2.12.9 Collaborate pane (`/app/settings/collaborate`)
All 3 controls (show-avatars toggle, default-share select, mention-notify
toggle) are **REAL** — persist to `xai_pref_collab_*`.

#### 2.12.10 Sticky pane (`/app/settings/sticky`)
| # | Action | Class | Persists? | Notes |
|---|---|---|---|---|
| Set-St-01 | Color swatch | REAL | YES (`xai_pref_sticky_color`) | |
| Set-St-02 | Font size select | REAL | YES (`xai_pref_sticky_font`) | |
| Set-St-03 | Pin default toggle | REAL | YES (`xai_pref_sticky_pin_default`) | |
| Set-St-04 | Restore size toggle | REAL | YES (`xai_pref_sticky_restore_size`) | |
| Set-St-05 | Grid spacing buttons | REAL | YES (`xai_pref_sticky_grid_spacing`) | |

NB: Stickies preferences exist but the Stickies widget (D-21) cannot create
new stickies. The pane configures non-existent stickies.

#### 2.12.11 Smart lists pane (`/app/settings/smart_lists`)
All `<select>` per smart list — all **REAL**, writes to `xai_pref_smart_lists`
map. Note: Tasks sidebar smart-list rows (T-01) do **not** respect the
hide/if-not-empty/show mode — visibility map is persisted but never read.

#### 2.12.12 Hotkeys pane (`/app/settings/hotkeys`)
**Pure read-only table.** Lists 10 keyboard shortcuts (⌘⇧A, ⌘K, ⌘B, ⌘T, ⌘C,
⌘P, ⌘⇧D, ⌘⇧P, ⌘⇧N, ⌘⇧K). **Of these 10, only ⌘K is wired** (via
`packages/xai-web-cmdk/src/CommandPalette.tsx:80-100`). The other 9 are
documented but not registered as global keydown listeners — see
`Cross-module gaps §3.2` below.

#### 2.12.13 About pane (`/app/settings/about`)
4 `<a class="link">` placeholders (Changelog, Privacy, Terms, Feedback) —
none has `href` or `onClick`. All **STUB-EVENT-ONLY** (or worse, they read
as visually-styled links that don't navigate, which is more deceptive than
plain text).

#### 2.12.14 Features pane (`/app/settings/features`)
Wired by `xai-web-settings-features-panel`. 8 toggleable modules. Each
toggle is **REAL** — writes `xai_pref_features_<id>` and the
`withDisabledFallback` wrapper in `shellRegistrations.tsx` immediately
gates the route.

#### 2.12.15 Appearance pane (`/app/settings/appearance`)
Wired by `xai-web-settings-appearance`. Every control is **REAL** and emits
`web:settings:preference-changed` (consumed by `App.tsx`'s `useEffect`
listener). Includes: theme, density, font scale, lang, accent hue, rail
position, background tone, presets, Reset to defaults.

#### Settings cumulative recommendation
Settings is the most uneven surface in the console. Per-pane outcomes range
from fully-wired (AI, Appearance, Notifications) to entirely cosmetic (About).
Top fixes: Set-A-01..A-03 (Account placeholders), Set-M-02 (language follow
stub), About pane links. Smart Lists hide/show is wired-but-unread (BUGFIX).

---

### 2.13 `/app/todos` — Legacy productivity todos shim (NOT in rail · transitional)

Owner package: `packages/plugin-productivity` (npm: `@repo/plugin-productivity/web`).
Per `shellRegistrations.tsx:50-55` and `webModuleRouteRegistrations`, this
route resolves only for backward compat. Component at
`packages/plugin-productivity/src/web/TodoWebModuleRoute.tsx`.

| # | Action | Class | Component path | Persists? | Notes |
|---|---|---|---|---|---|
| Todo-01 | Sidebar list navigation | REAL | `TodoWebModuleRoute.tsx:164` + `capabilities.navigate` | URL only | uses capabilities adapter — not `usePref` |
| Todo-02 | Todo selection (detail open) | REAL | `TodoWebModuleRoute.tsx:168` | URL only | |
| Todo-03 | Persist via capabilities | REAL | `TodoWebModuleRoute.tsx:192` | YES (via productivity's own contract) | parallel storage layer to web `xai_*` |

Recommended next action: **HIDE** — this module is unreferenced from the rail
and exists only to keep test fixtures + external bookmarks alive. A future
P0 cleanup commit (mentioned in `shellRegistrations.tsx:108-111`) is the
right place to drop it.

---

### 2.14 Host chrome — Topbar (always visible)

Owner: `packages/xai-web-shell/src/Topbar.tsx`.

| # | Action | Class | Persists? | Emits | Notes |
|---|---|---|---|---|---|
| Tb-01 | Search box (Cmd+K opener) | REAL | NO (opens palette) | `web:search:invoked` (source=topbar-click) | wired through CmdK provider |
| Tb-02 | EN / 中文 toggle | REAL | NO (in-memory `lang`) | — | lang propagates via shell context |
| Tb-03 | Light / Dark / System theme | REAL | NO (in-memory `theme`) | — | apply* helpers |
| Tb-04 | Comfortable / Compact density | REAL | NO (in-memory `density`) | — | |
| Tb-05 | Settings icon | REAL | NO (navigates) | `web:shell:module-change` (source=shortcut) | |
| Tb-06 | Premium tier badge (render-prop slot) | REAL | reads `xai_pref_premium_tier` | — | static badge |

NB: Tb-02 / Tb-03 / Tb-04 toggle local state but the underlying state is
NOT persisted from Topbar alone. Persistence happens via the AppearancePane's
`web:settings:preference-changed` round-trip when the user explicitly saves
or interacts with that pane. A user toggling theme in Topbar will lose the
choice on refresh unless AppearancePane was visited at least once.

Recommended next action: **BUGFIX** — Topbar should write to `xai_pref_lang`
/ `xai_pref_theme` / `xai_pref_density` directly, or be downgraded to a
"preview" affordance with explicit copy. This is the single most likely
"I changed the theme and refresh lost it" bug.

---

### 2.15 Host chrome — AppRail (always visible)

Owner: `packages/xai-web-shell/src/AppRail.tsx`.

| # | Action | Class | Persists? | Emits | Notes |
|---|---|---|---|---|---|
| Rail-01 | Avatar button (open AvatarMenu) | REAL | NO | — | |
| Rail-02 | Module button click (route nav) | REAL | NO (URL only) | `web:shell:module-change` (source=app-rail) | |
| Rail-03 | Module button drag-reorder | REAL | `xai_rail_order` | — | HTML5 DnD |
| Rail-04 | Bottom button "pet" toggle | REAL | NO (in-memory `petOn`) | `web:shell:pet-toggle` | actually wired |
| Rail-05 | Bottom button "sync" | STUB-EVENT-ONLY | NO | — | **no `action`** in BottomButton definition (`AppRail.tsx:106-108`) |
| Rail-06 | Bottom button "notif" | STUB-EVENT-ONLY | NO | — | no `action` |
| Rail-07 | Bottom button "help" | STUB-EVENT-ONLY | NO | — | no `action` |
| Rail-08 | AvatarMenu "Settings" | REAL | NO | `web:shell:module-change` (source=shortcut) | |
| Rail-09 | AvatarMenu "Statistics" | REAL | NO | `web:shell:module-change` (source=shortcut) | |
| Rail-10 | AvatarMenu "Sign out" | STUB-EVENT-ONLY | NO | — | `AvatarMenu.tsx:114-122` — DEV warns "sign-out not wired"; prod no-op |

Recommended next action: Rail-05 / Rail-06 / Rail-07 (sync/notif/help) are
visible, click-able bottom-rail buttons that do absolutely nothing. They
should be HIDDEN-IF-FEATURE-FLAG until backed by real features. Rail-10
(sign-out) is the most critical no-op in the chrome — users expect
sign-out to work.

---

### 2.16 Host chrome — DesktopPet (floats over all routes)

Owner: `packages/xai-web-pet/src/DesktopPet.tsx`.
Persistence: `xai_pet_id`, `xai_pet_pos`.

| # | Action | Class | Persists? | Notes |
|---|---|---|---|---|
| Pet-01 | Pet drag | REAL | YES (`xai_pet_pos`) | pointer events |
| Pet-02 | Pet body click → mood/bubble | REAL | NO (transient) | |
| Pet-03 | Bubble "Change pet" link | REAL | NO | opens PetPicker |
| Pet-04 | Sparkle swap button | REAL | NO | opens PetPicker |
| Pet-05 | PetPicker pick a pet | REAL | YES (`xai_pet_id`) | |
| Pet-06 | PetPicker close | REAL | NO | |

All wired.

---

### 2.17 Cmd+K palette (`packages/xai-web-cmdk`)

| # | Action | Class | Persists? | Emits | Notes |
|---|---|---|---|---|---|
| CK-01 | Cmd+K / Ctrl+K open | REAL | NO | `web:search:invoked` (source=shortcut) | global keydown listener |
| CK-02 | Topbar search-box open | REAL | NO | `web:search:invoked` (source=topbar-click) | |
| CK-03 | Type query | REAL | NO | — | rebuilds index per keystroke |
| CK-04 | Arrow up/down navigate hits | REAL | NO | — | |
| CK-05 | Enter / Cmd+Enter select hit | REAL | NO (URL) | `web:search:jump` (via `navigateToHit`) | |
| CK-06 | Escape close | REAL | NO | — | |
| CK-07 | Scrim click close | REAL | NO | — | |

All wired; 11 adapters under `adapters/` cover every module (board, calendar,
countdown, dashboard, habits, matrix, meditation, pomodoro, settings,
statistics, tasks).

---

## 3. Cross-module integration gaps

### 3.1 Emit-but-no-consumer events
The following channels are declared in `packages/core/src/types/events.ts`
and emitted in production code, but **no consumer subscribes outside
test files**. Found via `grep -rn "onWebEvent.*<channel>"` minus test
matches:

- `web:dashboard:add-widget-clicked` — emitted from `DashHeader` /
  `EmptyState`; no consumer. (analytics? notification? — never wired)
- `web:dashboard:widget-added` — emitted from `AddWidgetPicker`; no consumer.
- `web:board:share-requested` — emitted from `ShareModal` on Copy; no consumer.
  Could be used by a notification toast or telemetry. Currently the user
  receives no feedback after copying.
- `web:settings:rest:account-delete-confirmed` — emitted from Account pane's
  step-1 continue; no consumer. Account is not actually deleted.
- `web:search:invoked` — emitted on every CmdK open; no consumer.
- `web:settings:integration-connected` / `web:settings:integration-disconnected`
  — emitted from integration buttons; no in-app consumer (would expect a
  toast or refresh hook).
- `web:premium:tier-changed` — declared in event map; emitted by
  PremiumCancelButton (presumably); no in-app consumer outside the badge
  which reads `xai_pref_premium_tier` directly.
- `web:matrix:priority-tagged` — emitted on every matrix drag; no consumer.
  (Statistics could surface this as "priority discipline" metric.)
- `web:ai:rate-limited`, `web:ai:request-failed` — emitted by stream
  adapter; consumed only by the AI chat module's own banner listener.

### 3.2 Documented hotkeys never wired
The hotkeys pane (`/app/settings/hotkeys`) lists 10 shortcuts. Only ⌘K is
actually registered with the window keydown listener. The other 9 are
documented as if they exist but do not:

- ⌘⇧A — Quick add (never wired; no global "quick add" surface exists)
- ⌘B — Switch boards (BoardSwitcher exists but is only opened via title button)
- ⌘T — Today (no Today scope binding)
- ⌘C — Calendar (browsers swallow ⌘C globally for copy; impossible)
- ⌘P — Pomodoro (browsers swallow ⌘P for print; impossible)
- ⌘⇧D — Toggle dark (Topbar theme buttons exist; no shortcut)
- ⌘⇧P — Toggle pet (rail pet button exists; no shortcut)
- ⌘⇧N — New sticky (no sticky-creation flow exists)
- ⌘⇧K — Clear completed (no completed list exists)

Either delete the table or wire the realistic subset (⌘⇧A, ⌘B, ⌘⇧D, ⌘⇧P).

### 3.3 Storage keys persisted but never read
- `xai_pref_smart_lists` — written by SmartListsPane; not consumed by Tasks
  sidebar's smart-list renderer.
- `xai_pref_dt_timezone` — written by DateTime pane; calendar does not
  apply it (the Day/Week/Month grid uses local time).
- `xai_pref_dt_lunar` / `_holidays` / `_week_numbers` — written; not visible
  on the Calendar grid.
- `xai_pref_sticky_*` (5 keys) — written; Stickies widget cannot create new
  stickies, so the prefs apply to nothing.
- `xai_pref_more_*` (14 keys) — most apply to Tasks default behavior; the
  Tasks module's "+ add" buttons are stubs (T-09), so these prefs configure
  a creation flow that doesn't exist.

### 3.4 Cross-module reads that should happen but don't
- Statistics' "Tasks Completed" KPI claims to count tasks but the aggregator
  only reads `xai_pomodoro_sessions` + `xai_habits_state`. `xai_task_cols`
  is not consulted.
- Dashboard's `StatTasks` widget — likely the same gap (needs smoke).
- Cmd+K's results don't navigate to specific board cards (`onOpenCard`
  chain is dead — see B-23). Cards are findable via search but jump goes
  only to the board view, not the card.
- AI Chat's "insights" panel does not actually summarize anything from
  other modules (Pomodoro / Habits / Tasks). The toggle just suppresses
  starter prompts.
- The Pet has no awareness of pomodoro state, habit streaks, or upcoming
  countdowns — it could react to `web:pomodoro:session-finished` etc.,
  but its listener set is empty.

### 3.5 Confirmation gaps on destructive actions
- B-12 Delete board — no confirm.
- B-28 Delete inbox card — no confirm.
- Cd-06 Delete countdown — confirm presence in dialog needs smoke.
- H-12 Delete habit — action does not exist in UI at all.

---

## 4. Top 10 highest user-visible no-ops (ranked by user perception)

Ranking heuristic: high visibility (header-level icon, big primary button),
high expectation ("create" / "delete" / sign-out / connect a real service),
and high lifecycle impact (data lost on refresh / blocked workflow).

| Rank | ID | Location | Description | Component path | Recommended |
|------|----|----|---|---|---|
| 1 | Rail-10 | AvatarMenu | "Sign out" — most users expect this to work; DEV-only console warn | `packages/xai-web-shell/src/AvatarMenu.tsx:114-122` | DISABLE or wire via stub auth provider |
| 2 | C-02 | Calendar toolbar | "+" event add — the obvious create-event control, no `onClick` | `packages/xai-web-calendar/src/CalendarToolbar.tsx:39-41` | COMING-SOON label or DISABLE |
| 3 | T-09 | Tasks columns | "+" add-card per column (4 instances) — no creation path for tasks at all | `packages/xai-web-tasks/src/TaskColumn.tsx:68-74` | COMING-SOON or wire a minimal composer |
| 4 | M-01 / M-03 | Matrix | Add buttons (header + 4 quadrants = 5 instances) — no card creation | `packages/xai-web-matrix/src/MatrixModule.tsx:39-41` + `Quadrant.tsx:81-83` | DISABLE |
| 5 | B-23 / B-29 / B-32 / B-34 / B-36 | Board (5 views) | Card click → open detail → nothing happens, in 5 different views | `BoardCard.tsx`, `PlannerPanel.tsx`, `TableView.tsx`, `BoardCalendarView.tsx`, `TimelineView.tsx` | BUGFIX — wire `onOpenCard` to a CardDetail modal |
| 6 | D-21 | Dashboard stickies | "+" add sticky button on widget — no `onClick`; cannot create stickies anywhere in app | `packages/xai-web-dashboard-widgets/src/widgets/StickiesWidget.tsx:24-27` | DISABLE; ADR for sticky-create flow |
| 7 | Tb-02..Tb-04 | Topbar | Theme / lang / density buttons — change UI but **don't persist on refresh** unless AppearancePane visited | `packages/xai-web-shell/src/Topbar.tsx:54-113` | BUGFIX — write directly to prefs |
| 8 | Rail-05/06/07 | Rail bottom | sync / notif / help icons — visible, clickable, no `action` defined | `packages/xai-web-shell/src/AppRail.tsx:106-108` | HIDE pending feature scope |
| 9 | D-06 | Dashboard | Added widgets cannot be removed via UI — once added, the only way out is clearing localStorage | (missing button) | BUGFIX — add per-widget remove affordance |
| 10 | About pane | Settings → About | Changelog / Privacy / Terms / Feedback "links" have no `href` or `onClick` — they're styled links that don't navigate | `packages/plugin-web-settings-rest/src/panes/aboutPane.tsx:36-46` | Add real URLs or hide the section |

---

## 5. Proposed next-roadmap options

### Option A — Maintenance-only bugfix batch (no ADR change)

**Cost / Benefit / Trigger**: ~3-5 single-PR bug-fixes; no architectural
change; benefit is closing the most user-visible no-ops without disturbing
ADR-0010. Trigger: project owner confirms no carve-out planned and wants
to close the worst perceived no-ops.

In-scope (all `BROKEN` or trivially `BUGFIX` rows, no new features):
1. Top-10 #5 (B-23 cluster) — wire `onOpenCard` to either a deep-link or
   a CardDetail component already implicit in the codebase. Single
   workflow, multiple views consume.
2. Top-10 #7 (Tb-02..Tb-04) — write Topbar toggles directly to
   `xai_pref_lang` / `xai_pref_theme` / `xai_pref_density`.
3. Top-10 #1 (Rail-10) — either disable the button with a "Stub mode"
   tooltip OR wire to AvatarMenu prop already declared (`onSignOut`
   parameter exists but is unused).
4. Top-10 #9 (D-06) — add a "Remove widget" button to `WidgetShell`.
5. Confirmation dialogs for B-12 (delete board) and B-28 (delete inbox
   card).
6. About pane links: add `href` or hide.

Out of scope: any new event channel, any new pref key, any data model
change, any storage backend change. Per ADR-0010 §D4, P0 carve-outs are
not required for pure bug-fix scope.

### Option B — IndexedDB repository spike on Tasks (P0 carve-out commit required)

**Cost / Benefit / Trigger**: ~2-3 week spike + commit citing ADR-0010 §D4
to carve out Tasks alone. Benefit is dogfooding the repository pattern
that Desktop G1/G2 will eventually need, in a real production module,
without committing to migrating all modules. Risk is bifurcating the
storage layer (localStorage everywhere else, IDB for tasks).

Suggested implementation outline (NOT decided by this audit):
1. New package `plugin-web-tasks-repo` exposing `TasksRepository`
   interface (create / update / delete / query / drag-move).
2. IDB-backed impl using Dexie or native IndexedDB.
3. Tasks module migrates from `usePref("xai_task_cols")` to repository.
4. Migration script: read existing `xai_task_cols`, write to IDB, clear
   localStorage key.
5. Wire T-09 (add card) — the trigger event for this work.
6. Cross-module: Statistics module reads from repo; Cmd+K adapter
   ditto; Dashboard `StatTasks` ditto.

Triggers: project owner wants to test the repository pattern in
production before adopting it on Desktop, AND is willing to author the
ADR-0011 / carve-out commit.

### Option C — Full P0 Web productization carve-out (ADR-0011 revoking ADR-0010 §D1)

**Cost / Benefit / Trigger**: Major reshape. Cost is 3-6 months G1 desktop
deferral (per ADR-0010's own constraints — the desktop track is sized
assuming Web is maintenance-only). Benefit is closing all stub UI surfaces
and shipping a real product. Trigger is a business-driven pivot that
ranks Web higher than the desktop overlay — which is **not** the current
ADR-0010 stance.

This option is mentioned purely so the project owner can compare; this
audit does NOT recommend it. It would require:
1. New ADR-0011 stating the new authority basis and the explicit
   acknowledgement that G1 desktop slips.
2. New roadmap document (analogous to `docs/workflow/roadmap/xai-g1-native-foundation.md`)
   for Web productization.
3. PLUGIN_MAP.md update flipping P0 from "MAINTENANCE-ONLY" back to
   "ACTIVE".
4. Resourcing decisions outside the scope of this audit.

---

## 6. Explicit disclaimer

This audit is read-only discovery work. **It does not authorize Option B
or Option C.** Per CLAUDE.md and ADR-0010, any code change beyond pure
bug-fixes requires either a separate P0 carve-out commit citing ADR-0010
§D4 (Option A → some Option B subset) or an ADR-0011 superseding
ADR-0010 §D1 (Option C). The project owner / PM decides which option, if
any, to activate.

No `.tsx` / `.ts` / `.css` / `package.json` files were modified during
this audit. No ADR was modified. PLUGIN_MAP.md was not modified. The
`xai-web-console.md` and `xai-web-console-gap-closure.md` SHIPPED archives
were not modified. The only file written by this audit is this report
itself, at:

`/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/reviews/_web-noop-audit/20260527-button-action-inventory.md`

---

## 7. Appendices

### 7.1 Total action count by route

| Route | REAL | STUB-EVENT-ONLY | UNKNOWN-NEEDS-SMOKE | MISSING |
|-------|---:|---:|---:|---:|
| /app/ai | 14 | 1 | 0 | 0 |
| /app/tasks | 4 | 9 | 0 | 0 |
| /app/board | 25 | 6 | 0 | 0 |
| /app/dashboard | 14 | 7 | 1 | 1 |
| /app/calendar | 6 | 7 | 0 | 0 |
| /app/matrix | 1 | 4 | 1 | 0 |
| /app/pomodoro | 6 | 2 | 0 | 0 |
| /app/habits | 8 | 2 | 0 | 1 |
| /app/meditation | 6 | 1 | 1 | 0 |
| /app/countdown | 5 | 1 | 0 | 0 |
| /app/statistics | 3 | 0 | 1 | 0 |
| /app/settings (13 panes) | 35+ | 9 | 1 | 0 |
| /app/todos (legacy) | 3 | 0 | 0 | 0 |
| Topbar | 6 | 0 | 0 | 0 |
| AppRail | 5 | 4 | 0 | 0 |
| AvatarMenu | 2 | 1 | 0 | 0 |
| DesktopPet | 6 | 0 | 0 | 0 |
| Cmd+K palette | 7 | 0 | 0 | 0 |
| **Totals** | **~156** | **~54** | **~5** | **~2** |

Approximately **26%** of audited surfaces are `STUB-EVENT-ONLY`. The bulk
of these are header overflow buttons ("More" / ⋯), feature placeholders,
and surfaces with `onClick` handlers that update local React state but
never cross the persistence boundary.

### 7.2 Storage-key heatmap

Keys with at least one writer AND at least one consumer (healthy): 60+.
Keys with writer but no real consumer (orphaned): see §3.3 above (≈ 20+).
Keys with consumer but no writer: 0 (all defaults come from the registry).

### 7.3 Event-channel heatmap

Channels with at least one consumer outside tests:
`web:shell:module-change`, `web:shell:pet-toggle`,
`web:settings:preference-changed`, `web:habits:checkin-recorded`
(test-only consumer pattern noted),
`web:pomodoro:session-finished` (test-only consumer pattern noted),
`web:ai:rate-limited`, `web:ai:request-failed`.

Channels emitted with **no in-app consumer** (see §3.1):
`web:dashboard:add-widget-clicked`, `web:dashboard:widget-added`,
`web:board:share-requested`, `web:matrix:priority-tagged`,
`web:settings:rest:account-delete-confirmed`, `web:search:invoked`,
`web:search:jump`, `web:settings:integration-connected`,
`web:settings:integration-disconnected`, `web:premium:tier-changed`.

— end —
