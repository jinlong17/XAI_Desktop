# P0 Carve-Out — xai-web-dashboard-real-data

**Date:** 2026-05-28
**Authority:** ADR-0010 Accepted 2026-05-26 §D4 — "new feature plans require an explicit P0 carve-out commit citing this ADR's D1"
**Triggering evidence:** [docs/reviews/_web-noop-audit/20260528-usability-recheck.md](../_web-noop-audit/20260528-usability-recheck.md) — "7 of 11 dashboard widgets render mock fixtures isolated from the real data graph"
**Operator decision:** item 3 local cluster (consolidated 3d-i + 3d-ii) per session directive 2026-05-28. Weather/Mail (3d-iii) handled separately (manual-entry / repurpose). AI tool layer (3e) last.

---

## 1. Background

The usability recheck found the Dashboard renders fiction: Stat widgets + Upcoming + MiniCal show hardcoded/fixture data disconnected from the real stores that already exist. The real persistence keys are all present in `packages/plugin-web-storage/src/internal/registry.ts`:

- `xai_task_cols` (tasks; now carries `done` after T-10 SHIPPED 2026-05-28)
- `xai_pomodoro_sessions` (pomodoro)
- `xai_habits_state` (habits)
- `xai_calendar_events` (calendar; from #2 SHIPPED)

Current mock sources (recon 2026-05-28):
- `StatTasks.tsx` / `StatStreak.tsx` / `StatPomos.tsx` — inline hardcoded constants
- `UpcomingWidget.tsx` → `UPCOMING` fixture
- `MiniCalWidget.tsx` → `CAL_EVENTS` fixture

This carve-out wires these 5 widgets to the real local stores. **Pure local read-only wiring — no new registry key, no new dependency, no external API, no CSP change.**

## 2. Scope of this carve-out

**`xai-web-dashboard-real-data`** — Realistic v1

### In scope
- **StatTasks** → real count from `xai_task_cols` (e.g. completed `done:true` / total, or today's done — planner picks the most meaningful metric).
- **StatStreak** → real streak from `xai_habits_state`.
- **StatPomos** → real count from `xai_pomodoro_sessions` (e.g. today's / this week's sessions).
- **UpcomingWidget** → upcoming items from `xai_calendar_events` (planner decides whether to also merge task due dates from `xai_task_cols`).
- **MiniCalWidget** → real month/day data from `xai_calendar_events` (event dots on days).
- Empty states for each (zero tasks / no events / no sessions) — honest "nothing yet" instead of fiction.
- Read via the existing `usePref`/store-read pattern (same as other SHIPPED widgets); reuse calendar/task/habit/pomodoro read helpers if they exist, else add in-package read selectors.

### Out of scope (explicitly deferred)
- **Weather / Mail widgets** (3d-iii) — no local data source; handled in a SEPARATE effort (Weather → manual-entry widget, Mail → repurpose to local notifications). NOT this carve-out.
- **Stickies widget** — already real (#6 SHIPPED); fixture-as-sample disposition stays.
- **Statistics page** (3b) real aggregation — separate carve-out (different package `xai-web-statistics`).
- Writing data from the dashboard (widgets stay read-only views; create/edit happens in the owning modules).
- Cross-device sync / IndexedDB.

### Specifically NOT triggered
- New registry key (all 4 source keys already exist).
- New npm dependency / external API / CSP change.
- `packages/core/src/types/events.ts` edit (widgets read stores directly via usePref; no new event channel).
- ADR-0011 / P1 reprioritization / SHIPPED-archive reopening.

## 3. Impact on shipped artifacts

### Will be modified
- `packages/xai-web-dashboard-widgets/src/widgets/{StatTasks,StatStreak,StatPomos,UpcomingWidget,MiniCalWidget}.tsx` — swap fixture/hardcoded for real store reads.
- Possibly `packages/xai-web-dashboard-widgets/src/internal/` — add read selectors if needed.
- `packages/xai-web-dashboard-widgets/docs/` — extend design/api/test/dev_log.

### Will be created
- `docs/workflow/roadmap/xai-web-dashboard-real-data.md` — manifest (by feature-plan).

### Will NOT be modified
- `internal/fixtures.js` — fixtures may stay for empty-state fallback OR be removed per widget; the MAILS/WEATHER fixtures (3d-iii) stay untouched here.
- Other plugins (tasks/calendar/habits/pomodoro stores are READ via their localStorage keys, not via cross-plugin import — consistent with how Cmd-K adapters already read them). **No write to those stores.**
- `packages/core/`, `plugin-web-tokens`, registry, ADR, SHIPPED archives, `dev` branch.

> Note on boundaries: reading another module's `xai_*` key via `usePref` is the established cross-module read pattern (Cmd-K adapters, Statistics already do this). This does NOT violate the no-direct-plugin-import rule — no plugin package is imported; only the shared storage layer + key string is used.

## 4. Workflow path

carve-out commit (this doc) → feature-plan → feature-review → feature-build (phase per run) → feature-verify → ship. Cross-vendor manual smoke DEFERRED per ADR-0008 §S3.

## 5. Acceptance anchor

Satisfied when: with real user data present (e.g. a completed task, a logged pomodoro, a calendar event created via #2), the StatTasks/StatStreak/StatPomos/Upcoming/MiniCal widgets reflect that real data (not fixtures), show honest empty states when there is none, and update after the user adds data + reloads — verified by automated tests + (deferred) cross-vendor smoke.
