# P0 Carve-Out — xai-web-dashboard-weather-mail

**Date:** 2026-05-29
**Authority:** ADR-0010 §D4 — new feature plans require an explicit P0 carve-out commit.
**Triggering evidence:** usability recheck — Weather + Mail are 2 of the mock-fixture dashboard widgets with no local data source. Audit 3d-iii.
**Operator decision:** session directive 2026-05-29 — **Weather → manual-entry widget; Mail → repurpose to local notifications digest** (both become REAL local widgets, no external API / no new dep). item 3 cluster #5.

---

## 1. Background

Two dashboard widgets render hardcoded fiction with no local source:
- `WeatherWidget.tsx` → `WEATHER` fixture (city/temp/condition/hi-lo + 5-day forecast).
- `MailWidget.tsx` → `MAILS` fixture (unread badge + {from, subj, time, unread} rows).

Neither can fetch real data without an external API (weather service / email account) — which violates the no-new-dep / no-CSP-change discipline. Per operator decision, both are **repurposed to real LOCAL widgets**:
- **Weather → manual-entry**: the user sets their own city + current temperature + condition; persisted locally. (5-day forecast is not user-typeable → dropped/simplified to current conditions in v1.)
- **Mail → local notifications digest**: repurpose the mail-list shape into a read-only "Notifications" surface that aggregates REAL in-app signals (overdue tasks from `xai_task_cols`, today's calendar events from `xai_calendar_events`) — no inbox, no external mail.

This mirrors two SHIPPED patterns: Weather manual-entry ≈ stickies-create (store+composer, #6); Mail notifications ≈ dashboard-real-data read-only aggregation (#3d).

## 2. Scope

**`xai-web-dashboard-weather-mail`** — Realistic v1 (2 independent widget transforms)

### In scope — Phase A: Weather manual-entry
- New `xai_dashboard_weather` registry key (additive — AUTHORIZED here; codec json, default `null`/empty, owner `xai-web-dashboard-widgets`, schemaVersion 1).
- In-package store + `useWeather` hook + a minimal editor (inline edit OR small `<dialog>` — planner picks; mirror stickies/composer precedent). Fields: city (string) + temp (number) + condition (preset enum: sunny/cloudy/rainy/snowy/etc. mapped to existing `Icon` names) + optional hi/lo.
- WeatherWidget renders user values; honest empty/"set your weather" state when unset.
- Drop or simplify the 5-day forecast (not manually maintainable) — planner decides (default: show current conditions only; OR keep a manual single-line).

### In scope — Phase B: Mail → Notifications digest
- Rename/repurpose MailWidget into a "Notifications" widget (keep the registry id stable if removing it would break saved layouts — planner confirms; the widget id may stay `mail` internally with new display label, OR a clean rename with migration note).
- Read-only aggregation of REAL local signals:
  - Overdue tasks: `xai_task_cols` cards in `overdue` bucket with `done !== true`.
  - Today's calendar events: `xai_calendar_events` events on today's date.
  - (Planner's call: expiring countdowns from the countdown store IF it exists + is trivial; else defer.)
- Each row: a signal label + source-type + time/relative. Unread-style badge = count of signals. Honest empty state ("All clear / 暂无通知") when none.
- Read-only (NEVER writes task/calendar/countdown stores) — same cross-module read pattern as #3d/#3b (usePref + key string, no plugin import).

### Planner's call
- Weather editor: inline-edit vs `<dialog>`; whether to keep hi/lo + a single manual forecast line.
- Mail/Notifications: widget-id rename strategy (stable-id vs migration); whether to include countdowns; max rows.
- i18n: local STR (preferred, mirror #6/#3b) vs the existing `plugin-web-tokens` keys the widgets currently use (`dashboard.weather`/`dashboard.mail`). Default: keep existing token keys for the title, add any NEW copy via LOCAL STR (no plugin-web-tokens edit).

### Out of scope
- Real weather API / real email. Cross-device sync. The other dashboard widgets (already real or handled). Notification push / OS notifications.

### NOT triggered
- New dep / external API / CSP. `packages/core/src/types/events.ts` edit. Other plugin imports (read via usePref + key string). SHIPPED archive / ADR / `dev`. (One additive registry key `xai_dashboard_weather` IS authorized for Phase A.)

## 3. Impact

### Modified
- `packages/xai-web-dashboard-widgets/src/widgets/WeatherWidget.tsx` (manual values + editor), `MailWidget.tsx` (→ notifications digest).
- `packages/plugin-web-storage/src/internal/registry.ts` (+`xai_dashboard_weather` key, additive) + its registry test.
- in-package `internal/` (weather store + notifications selectors), `internal/strings.ts`, `styles.css`, `docs/`.

### Created
- `docs/workflow/roadmap/xai-web-dashboard-weather-mail.md` (by feature-plan).

### NOT modified
- `internal/fixtures.js` WEATHER/MAILS may be removed or kept as empty-state fallback (planner). Other widgets. Task/calendar/countdown stores (READ-ONLY for Mail). core/events, plugin-web-tokens (beyond existing title keys), other plugins, archives, ADR, `dev`.

## 4. Workflow path

carve-out commit → feature-plan → feature-review → feature-build (phase per run; A + B are natural phases) → feature-verify → ship. Cross-vendor smoke DEFERRED per ADR-0008 §S3.

## 5. Acceptance anchor

Satisfied when: (Weather) the user can set their city/temp/condition, the widget shows those values, they persist across refresh, and an honest empty state shows when unset; (Mail/Notifications) the widget shows real overdue tasks + today's events as notification rows with an honest "all clear" empty state, reading those stores without ever mutating them — verified by automated tests + (deferred) cross-vendor smoke.
