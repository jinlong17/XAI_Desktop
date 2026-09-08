# Feature Brief — xai-web-dashboard-weather-mail

> **Step 0 artifact.** Canonical copy of the P0 carve-out brief, filed under the feature folder for the planning chain. The authoritative carve-out (committed authority record) lives at `docs/reviews/_p0-carve-outs/20260529-dashboard-weather-mail.md` (commit `43ba6f8`); this is its planning-folder mirror.

**Date:** 2026-05-29
**Authority:** ADR-0010 §D4 — P0 carve-out commit `43ba6f8`.
**Branch:** `web` (NOT `dev`).
**Cluster:** item 3 cluster **#5** (local cluster 4 already SHIPPED: stickies-create §E, real-data §F, smart-list, statistics-real-aggregation). After #5 only **3e AI** remains.

## Motivation

Weather + Mail are 2 of the mock-fixture dashboard widgets with no local data source. Real data needs an external API (weather service / email account) — which violates the no-new-dep / no-CSP-change discipline. **Operator decision (2026-05-29):** both are repurposed to REAL LOCAL widgets, no external API / no new dep.

## Target outcome

- **Weather → manual-entry:** user fills city/temp/condition; widget displays them; persists across refresh; honest empty state when unset.
- **Mail → local notifications digest:** read-only aggregation of REAL signals (overdue tasks + today's calendar events) rendered as notification rows; honest "all clear" empty state; **NEVER** mutates the task/calendar store.

## Scope

Carve-out `xai-web-dashboard-weather-mail` (item 3 cluster #5, 2 independent widget transforms). 2 natural phases (Phase A Weather manual-entry / Phase B Mail notifications digest).

## Constraints

- Authority ADR-0010 §D4 (commit `43ba6f8`). Branch `web` (do NOT touch `dev`).
- **ONE additive registry key AUTHORIZED:** `xai_dashboard_weather` (Phase A; codec json, default `null`/empty, owner `xai-web-dashboard-widgets`, schemaVersion 1) + its registry test. **Mail needs NO new key** (read-only aggregation).
- **Mail READ-ONLY:** never writes `xai_task_cols` / `xai_calendar_events`. `usePref` + key-string read (same #3d/#3b pattern; no other-plugin import).
- Blueprints: Weather manual ≈ §E stickies-create (store + editor); Mail notifications ≈ §F dashboard-real-data (read-only aggregation; §F already built `dataReads/` selectors that read task/calendar — discovery checks reuse).
- Must NOT touch: `packages/core/src/types/events.ts`; other-plugin imports; other widgets; SHIPPED archive / ADR / `dev`; `plugin-web-tokens` (titles use existing `dashboard.weather`/`dashboard.mail` token keys; new copy = local STR).

## Recon (2026-05-29)

- WeatherWidget: `WEATHER` fixture (`city[lang]`/`temp`/`condition[lang]`/`icon`/`hi`/`lo`/`forecast[5]`).
- MailWidget: `MAILS` fixture (`{id, from, subj[lang], time, unread}`); unread badge = count.

## Planner's calls (resolved in discovery)

1. **Weather editor:** inline-edit vs small `<dialog>`; keep hi/lo + manual forecast? (default: current conditions only, drop 5-day forecast; condition = preset enum mapped to existing `Icon` names).
2. **Mail/Notifications:** widget-id rename strategy (keep `mail` id vs clean rename + migration); include countdowns (if countdown store exists + trivial, else defer); max rows.
3. **i18n:** local STR (preferred, §E/§F precedent) vs existing token key (default: titles keep token keys, new copy = local STR; no `plugin-web-tokens` edit).
4. **Mail signal shape:** each row = label + source-type (task/event) + time/relative; badge = signal count.

## Acceptance anchor

Satisfied when: (Weather) the user can set city/temp/condition, the widget shows them, they persist across refresh, honest empty state when unset; (Mail/Notifications) the widget shows real overdue tasks + today's events as notification rows with an honest "all clear" empty state, reading those stores WITHOUT mutating them — verified by automated tests + (deferred) cross-vendor smoke.

## Out of scope / NOT triggered

Real weather API / real email. Cross-device sync. The other 8 dashboard widgets. Notification push / OS notifications. New dep / external API / CSP. `packages/core/src/types/events.ts` edit. Other-plugin imports. SHIPPED archive / ADR / `dev`. (One additive registry key `xai_dashboard_weather` IS authorized for Phase A.)
