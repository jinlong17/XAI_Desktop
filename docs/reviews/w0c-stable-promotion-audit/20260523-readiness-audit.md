# W0.C Stable Promotion — Readiness Audit (audit-only, no PLUGIN_MAP change)

| Field | Value |
|---|---|
| Date | 2026-05-23 |
| Author | Claude (W0.C-audit-only path, per user direction) |
| Scope | `plugin-console`, `plugin-productivity`, `plugin-labels`, `plugin-project` — promotion candidates |
| Outcome | **PENDING_HARDWARE** — code evidence sufficient; real-hardware walkthrough required before global PLUGIN_MAP `In-Dev → Stable` flip |
| Source seed | `docs/planning/3-sub-prd-pre-analysis-20260522.md` §2.4 D-1 + D-2, §4.1 W0.C, §5.2 MR-1/MR-2/MR-3 |
| Sibling W0.B context | productivity/labels/project typed-events emit rows all shipped 2026-05-23 (this session) |

This is the **W0.C-audit-only** path: this row does **not** modify `docs/PLUGIN_MAP.md`. It records per-plugin readiness so the actual flip can happen as a single follow-up commit once a human runs the real-hardware checklist in §6.

---

## 1. Drift Summary

| Drift | Statement (before this audit) | Status after W0.B emit ships |
|---|---|---|
| **D-1** | `plugin-console` dev_log = `SHIPPED` (2026-05-21) but PLUGIN_MAP row 73 = `In-Dev`. | Unchanged — D-1 still open. |
| **D-2** | `plugin-productivity` / `plugin-labels` / `plugin-project` dev_logs = `READY_FOR_VERIFY` (2026-05-20) but PLUGIN_MAP rows 74/75/76 = `In-Dev`. | **Tightened** — all three dev_logs are now `SHIPPED` (2026-05-23) for the typed-events emit phase. PLUGIN_MAP rows still `In-Dev`. |

After W0.B, the gap between dev_log Status and PLUGIN_MAP status is more concrete: 4 rows are SHIPPED locally but non-stable globally.

---

## 2. Per-plugin Readiness

### 2.1 plugin-console

| Field | Value |
|---|---|
| dev_log Status (current) | `SHIPPED` (2026-05-21 12:38 PDT) |
| dev_log Executor | `ship (Codex, gpt-5.3-codex)` |
| dev_log Suggested Next | `workflow complete` |
| PLUGIN_MAP row 73 | `In-Dev` (last updated 2026-05-21) |
| Recent ship commits (pre-this-session) | Phase 1–5 of Console TickTick parity shell — frozen contracts, three-pane shell, Tauri window commands, ConsoleView integration for productivity/labels, reconcile/ack/degrade gates. Already on `origin/main` baseline `6484361`. |
| Package gates (ran 2026-05-23) | `pnpm --filter @repo/plugin-console check-types` PASS · `pnpm --filter @repo/plugin-console test` 5/5 PASS |
| Cross-window emit footprint | `ConsoleLayout.tsx` emits 6 console:* events (`console:navigate-module`, `console:search-opened`, `console:reconcile-requested`, `console:ack-applied`, `console:sidebar-toggled`, `console:detail-selection-changed`). |
| Cross-window listen footprint | **None.** No `useEventListener` calls in `plugin-console/src/`. Console does not subscribe to `productivity:*` / `labels:*` / `project:*` typed events. |
| Real-hardware deferred | Per pre-analysis §2.2: Sonoma + Sequoia 双系统全 §9.1-§9.5 走查 (12 + 6 + 互转 + 灰显 + X-01~X-06 跨窗口脚本); Cmd+K 300ms P95; VoiceOver tree/listbox/grid/calendar/dialog/toolbar; i18n zh-CN/zh-TW/en; 7 天长跑 + Console ↔ overlay 无漂移. None of these have been performed in this autorun. |
| Promotion gate | **Real hardware required** before Stable. |

### 2.2 plugin-productivity

| Field | Value |
|---|---|
| dev_log Status (current) | `SHIPPED` (2026-05-23 14:50, this session) |
| dev_log Executor | `ship (Claude)` |
| dev_log Phase shipped | W0.B `productivity:*` typed events emit (BUILD-1 EventMap + BUILD-2/3/4 per-store + tests + verify report) |
| PLUGIN_MAP row 74 | `In-Dev` ("canonical package for Todo/Pomodoro/Habits; package-local `READY_FOR_VERIFY` does not promote this row beyond non-stable dependency authority") |
| Recent ship commits (this session) | `7ee5d6f` BUILD-1 → `975063e` BUILD-2 → `22395c4` BUILD-3 → `e181917` BUILD-4 → `e090dbc` dev_log → `b5bcfda` plan artifacts → `2561e08` verify report → `99b3de9` SHIPPED flip. Pushed to `origin/dev`. |
| Package gates (ran 2026-05-23) | `pnpm --filter @repo/plugin-productivity check-types` PASS · `pnpm --filter @repo/plugin-productivity test` 33/33 PASS (across 7 files; covers per-store emit + dedup + non-Tauri swallow) |
| Cross-window emit footprint | `usePomodoroStore` emits `productivity:pomodoro-completed`; `useTodoStore` emits `productivity:todo-due`; `useHabitStore` emits `productivity:habit-reminder`. All three use `.catch(() => undefined)` non-Tauri swallow. |
| Cross-window listen footprint | `events/organizerGridTasks.ts` listens to `organizer:grid:create-task` (pre-existing, not part of W0.B). |
| Real-hardware deferred | Multi-window emit roundtrip (productivity emit → other-window listener → UI update). Note: no downstream consumer exists in code yet — see §3 cross-plugin integration finding. |
| Promotion gate | **Real hardware required** for emit roundtrip behaviour validation (even without a listener, confirming the emit does not crash the Tauri runtime is a hardware check). |

### 2.3 plugin-labels

| Field | Value |
|---|---|
| dev_log Status (current) | `SHIPPED` (2026-05-23, this session) |
| dev_log Executor | `ship (Claude)` |
| dev_log Phase shipped | W0.B `labels:*` typed events emit (B1 EventMap + B2 store emits + tests + verify report) |
| PLUGIN_MAP row 75 | `In-Dev` ("Console/Project/Web consumers remain mock-first outside scoped integration while this row is non-stable") |
| Recent ship commits (this session) | `c0a9cf8` B1 → `1b0cf21` B2 → `e664c19` dev_log → `69cc645` plan artifacts → `89e28cf` verify report → `3e27206` SHIPPED flip. |
| Package gates (ran 2026-05-23) | `pnpm --filter @repo/plugin-labels check-types` PASS · `pnpm --filter @repo/plugin-labels test` 18/18 PASS |
| Cross-window emit footprint | `useLabelStore.createLabel` / `updateLabel` / `deleteLabel` emit `labels:created` / `labels:updated` / `labels:deleted` (with `getById` pre-read for `version` capture on delete; `.catch(() => undefined)` swallow). |
| Cross-window listen footprint | None. |
| Real-hardware deferred | Same envelope as productivity — emit-side runtime validation under Tauri. |
| Promotion gate | **Real hardware required** for emit-runtime smoke. |

### 2.4 plugin-project

| Field | Value |
|---|---|
| dev_log Status (current) | `SHIPPED` (2026-05-23 03:50, this session) |
| dev_log Executor | `ship (Claude)` |
| dev_log Phase shipped | W0.B `project:card-*` typed events emit (B1 EventMap + B2 store emits + 16-scenario vitest) |
| PLUGIN_MAP row 76 | `In-Dev` ("real package exists; package-local `READY_FOR_VERIFY` does not change global dependency authority") |
| Recent ship commits (this session) | `f18bdd4` B1 → `dcd7d52` B2 → `a78d37e` plan artifacts → `785de3f` verify report → `dfdf968` SHIPPED flip. |
| Package gates (ran 2026-05-23) | `pnpm --filter @repo/plugin-project check-types` PASS · `pnpm --filter @repo/plugin-project test` 21/21 PASS (16 new W0.B + 5 pre-existing) |
| Cross-window emit footprint | `useProjectStore.createCard` / `moveCard` / `updateCard` emit `project:card-created` / `project:card-moved` / `project:card-updated`. `moveCard` no-op suppression via `dirty.length > 0` guard. `updateCard` coalesced single emit with sorted `patchKeys` allow-list. No `projectId` in any payload (Card entity has no such field). |
| Cross-window listen footprint | None. |
| Real-hardware deferred | Same as productivity / labels. |
| Promotion gate | **Real hardware required** for emit-runtime smoke + BoardView drag/drop visual confirmation under Tauri. |

---

## 3. Cross-plugin Event Integration — Key Finding

The W0.B emit rows shipped 9 new typed events into `EventMap`:

- `productivity:pomodoro-completed`, `productivity:todo-due`, `productivity:habit-reminder`
- `labels:created`, `labels:updated`, `labels:deleted`
- `project:card-created`, `project:card-moved`, `project:card-updated`

**No code currently subscribes to any of these 9 events.** `grep -rn "useEventListener" packages/plugin-console/src/` returns zero matches. The Console / Web / Project / Productivity / Labels packages do not listen for the others' events yet.

Implications for W0.C:

1. The "cross-window event roundtrip" (e.g. `productivity:pomodoro-completed` → `plugin-console` refresh) is **not** something W0.C needs to validate on real hardware, because the listener half is unimplemented.
2. Real-hardware verification scope for W0.C is therefore narrower than the pre-analysis report's §5.2 multi-window matrix implied. It focuses on:
   - Each plugin's own UI working in real Tauri runtime (Console three-pane shell, productivity stores rendered, labels picker, project board).
   - Confirming the emit calls don't crash the Tauri runtime when fired.
3. A future follow-up row (out of W0.C scope, but worth tracking) would wire console / other consumers to listen for the 9 new events, then re-validate the full roundtrip on hardware.

Recommended follow-up row name (for tracking, not part of W0.C):

> `plugin-cross-window-event-listeners` — wire productivity/labels/project listeners into plugin-console + other consumers; revalidate roundtrip on real macOS.

---

## 4. File-boundary Audit Confirmation

`git diff main..dev --stat` from this session shows the W0.B + W0.D scope strictly stays within:

- `packages/core/src/types/events.ts` (additive declarations only)
- `packages/core/src/types/` and `packages/core/` (no edits to `packages/core/src/events/{emitter,listener,index}.ts`)
- `packages/plugin-productivity/src/hooks/{usePomodoroStore,useTodoStore,useHabitStore}.{tsx,test.tsx}`
- `packages/plugin-labels/src/hooks/useLabelStore.{tsx,test.tsx}`
- `packages/plugin-project/src/hooks/useProjectStore.{tsx,test.tsx}` plus `packages/plugin-project/vitest.config.ts` (new file for jsdom env)
- Per-plugin docs (`docs/`, dev_log, design/api/test)
- Top-level review docs under `docs/reviews/plugin-*/` and `docs/spec/`
- W0.D TLA+ spec + tla-protocol-model docs

No edits to `apps/desktop/**`, no Rust, no Tauri command surface, no other plugins, no `packages/core/src/events/` runtime infra. The boundary is clean.

---

## 5. Recommended PLUGIN_MAP Row Updates (NOT applied here — for the human-driven W0.C-promote row)

When the operator has completed the §6 real-hardware checklist, the following row edits would close D-1 and D-2:

```diff
-| console | packages/plugin-console/ | In-Dev | console/PRD | @repo/core, @repo/core-data | 2026-05-21 |
+| console | packages/plugin-console/ | Stable | console/PRD | @repo/core, @repo/core-data — Console TickTick parity host shell shipped 2026-05-21 (V2 Phase 1-5); cross-window listeners deferred to a follow-up row; real-hardware Sonoma+Sequoia walkthrough completed YYYY-MM-DD (operator: <name>). | <YYYY-MM-DD> |
-| productivity | packages/plugin-productivity/ | In-Dev | productivity/PRD | @repo/core, @repo/core-data (canonical package for Todo/Pomodoro/Habits; package-local `READY_FOR_VERIFY` does not promote this row beyond non-stable dependency authority) | 2026-05-21 |
+| productivity | packages/plugin-productivity/ | Stable | productivity/PRD | @repo/core, @repo/core-data — Todo/Pomodoro/Habit + typed events emit (W0.B shipped 2026-05-23); real-hardware emit smoke completed YYYY-MM-DD. | <YYYY-MM-DD> |
-| labels | packages/plugin-labels/ | In-Dev | labels/PRD | @repo/core, @repo/core-data (Console/Project/Web consumers remain mock-first outside scoped integration while this row is non-stable) | 2026-05-21 |
+| labels | packages/plugin-labels/ | Stable | labels/PRD | @repo/core, @repo/core-data — Label CRUD + typed events emit (W0.B shipped 2026-05-23); real-hardware emit smoke completed YYYY-MM-DD. | <YYYY-MM-DD> |
-| project | packages/plugin-project/ | In-Dev | project/PRD | @repo/core, @repo/core-data (real package exists; package-local `READY_FOR_VERIFY` does not change global dependency authority) | 2026-05-21 |
+| project | packages/plugin-project/ | Stable | project/PRD | @repo/core, @repo/core-data — Board CRUD + card typed events emit (W0.B shipped 2026-05-23); real-hardware emit + drag/drop smoke completed YYYY-MM-DD. | <YYYY-MM-DD> |
```

Do **not** apply these edits until §6 is complete.

---

## 6. Real-Hardware Verification Checklist (handed off)

Run on macOS hardware (Sonoma + Sequoia if available; single OS is acceptable for an interim partial promotion). Mark each row as PASS / FAIL / NOT-TESTED.

### 6.1 plugin-console (heaviest scope)

| Item | What to do | Pass criterion |
|---|---|---|
| Console window opens | `pnpm dev` in `apps/desktop/`; from main window invoke "Open Console" command | Console window appears within 1s; no Rust panic, no JS error console |
| Three-pane shell | Inspect Console window | Sidebar + List + Detail panes visible; pane widths persist after relaunch |
| Sidebar manifest entries | Click each `ui.consoleSidebar` entry | Each entry navigates to its module without error |
| Cmd+K global search | Press `Cmd+K`, type a query | Search panel opens within 300ms (P95); accepts query; closable via Esc |
| Notification center | (per Console PRD §9.x) | Tray icon transitions through idle / syncing / success / error states correctly |
| Settings shell | Open Settings from Console | Settings container loads; theme / density / font scale persist |
| i18n smoke | Switch zh-CN ↔ zh-TW ↔ en (if currently wired) | Strings change; missing keys fall back to zh-CN |
| Multi-Space behaviour | Move Console window to a different macOS Space | Window state survives Space switch |
| Stage Manager | Toggle Stage Manager with Console open | Console window participates correctly |
| Full-screen mode | Take Console full-screen | Full-screen toggles without window-level glitch |
| External monitor unplug | Unplug external monitor while Console is on it | Window relocates to primary display gracefully |
| VoiceOver tree | Enable VoiceOver, navigate Console sidebar | Tree, listbox, grid, calendar, dialog, toolbar roles all read correctly |
| 7-day soak | Leave Console + main window open across days | No drift between Console and main window state; no memory leak indicator |

### 6.2 plugin-productivity (emit smoke)

| Item | What to do | Pass criterion |
|---|---|---|
| Pomodoro completion fires emit | Start a Pomodoro session; wait for work-mode completion; in DevTools console run `await import('@tauri-apps/api/event').then(({ listen }) => listen('productivity:pomodoro-completed', e => console.log('caught', e.payload)))` then trigger another completion | Listener logs the event with the documented payload schema |
| Todo dueAt crossing fires emit | Set a Todo with dueAt 60s in the future; let the timer cross | `productivity:todo-due` fires with `{todoId, dueDate}` schema |
| Habit checkIn fires emit | Click checkIn on any Habit | `productivity:habit-reminder` fires with documented payload |
| No-crash on rapid action | Repeatedly toggle Habit checkIn | No JS exceptions; UI stays responsive |

### 6.3 plugin-labels (emit smoke)

| Item | What to do | Pass criterion |
|---|---|---|
| createLabel fires emit | Create a label via LabelPicker | `labels:created` fires with documented payload |
| updateLabel fires emit | Rename or recolor an existing label | `labels:updated` fires with bumped `version` |
| deleteLabel fires emit | Delete a label | `labels:deleted` fires with `version` and `deletedAt` |
| Soft-delete behaviour | Inspect Label entity in storage | `deletedAt` set; entity retained per soft-delete semantic |

### 6.4 plugin-project (emit smoke + visual drag/drop)

| Item | What to do | Pass criterion |
|---|---|---|
| createCard fires emit | Add a card via BoardView | `project:card-created` fires |
| moveCard cross-list | Drag a card from one list to another | `project:card-moved` fires with correct `fromListId`/`toListId` |
| moveCard same-list reorder | Drag a card up or down within the same list | `project:card-moved` fires with correct `fromOrder`/`toOrder` |
| moveCard no-op | Drag a card and release at the same position | **No** emit |
| updateCard fires emit | Edit a card title, blur the field | `project:card-updated` fires with `patchKeys: ['title']` |
| Visual drag/drop UX | Drag through several positions, drop in invalid zones | No card duplication, no list state corruption |

### 6.5 Cross-process / Tauri runtime sanity

| Item | What to do | Pass criterion |
|---|---|---|
| `emitEvent` reach | While main window is open, trigger an emit in Console window (or vice versa); listener in DevTools | Event reaches the other window |
| Non-Tauri fallback | Open the package in a vitest jsdom env | `emitEvent.catch(() => undefined)` swallows the rejection without throwing |
| Rapid emit burst | Trigger 100 rapid card moves | No backpressure error, no event dropped (or drop is documented) |

When every item is PASS or NOT-TESTED-explicitly-deferred, apply the §5 PLUGIN_MAP diff and ship a single follow-up commit.

---

## 7. Recommended Follow-up Commits (after hardware run)

1. `docs(plugin-map): promote console/productivity/labels/project to Stable post W0.C hardware verification (closes D-1 + D-2)` — apply §5 diff with the operator's name + date filled in.
2. (Optional but useful) `docs(roadmap): add W0.C-listeners follow-up row for plugin-console listener wiring` — track the cross-window roundtrip work that the W0.B emits enable but do not implement.

Do **not** apply commit 1 until the §6 checklist is signed off. The audit-only row stops here.

---

## 8. Saved audit path

`docs/reviews/w0c-stable-promotion-audit/20260523-readiness-audit.md`
