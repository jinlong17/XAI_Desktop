# P0 Carve-Out — xai-web-dashboard-stickies-create

**Date:** 2026-05-28
**Authority:** ADR-0010 Accepted 2026-05-26 §D4 — "new feature plans require an explicit P0 carve-out commit citing this ADR's D1"
**Triggering evidence:** [docs/reviews/_web-noop-audit/20260527-button-action-inventory.md](../_web-noop-audit/20260527-button-action-inventory.md) Top-10 #6 (Dashboard stickies `+`) + per-route §dashboard row D-21
**Operator decision:** Real feature (Realistic v1 scope, Stickies-only) per session directive 2026-05-28 ("全都要完成" — final Top-10 item). NOTE: unlike #3 Tasks / #4 Matrix (which had existing stores), Stickies is a **pure fixture with no store** — this carve-out is closer to the `xai-web-calendar-event-create` pattern (build a store from scratch).

---

## 1. Background

Audit Top-10 #6 surfaced that the Dashboard StickiesWidget `+` button (`StickiesWidget.tsx:24-27`) has **no `onClick`** — a user cannot create a sticky note anywhere in the app.

Current Stickies v1 state (recon 2026-05-28):

- `StickiesWidget.tsx` renders `STICKIES` from `../internal/fixtures.js` — a **hard-coded fixture array** (one of the audit's "4 mock-fixture dashboard widgets": Mail / Upcoming / Weather / Stickies).
- **No persistence key**, **no reducer/store**, **no registry entry** for stickies. The widget is display-only.
- The `+` button carries `aria-label` + `data-no-drag` but no handler.
- i18n is via `plugin-web-tokens` `useI18n` (`s("dashboard.sticky_notes")`) — NOT a local STR table (divergence from the tasks/matrix/calendar precedent).

**This is the LAST Top-10 item and the structurally largest of the create-features**: it requires building a sticky-note domain (store + persistence key + reducer) from scratch, then the create UI — analogous to `xai-web-calendar-event-create`, not the lighter tasks/matrix wire-to-existing-store pattern.

## 2. Scope of this carve-out

This carve-out authorizes **new feature development** on the Web P0 surface (otherwise maintenance-only per ADR-0010 §D1) for the single feature:

**`xai-web-dashboard-stickies-create`** — Realistic v1

### In scope
- **New persistence key** `xai_dashboard_stickies` in `packages/plugin-web-storage/src/internal/registry.ts` (additive — codec `"json"`, default `[]` or `{}`, category `"module"`, owner `xai-web-dashboard-widgets`, schemaVersion 1). **This registry edit IS authorized by this carve-out** (unlike tasks/matrix which reused existing keys).
- **New sticky store** inside `packages/xai-web-dashboard-widgets/` (`internal/stickiesStore.ts` or similar): pure CRUD (`addSticky`, and per "planner's call" below possibly `deleteSticky`/`updateSticky`) + a `useStickies` hook wrapping `usePref`.
- **Sticky model**: `{ id, text (bilingual {en,zh} OR single-string — planner decides), color (preset palette), createdAt }`. id via a `createStickyId()` helper.
- **Create UI**: wire the StickiesWidget `+` onClick → open a minimal StickyComposer (text input + color preset picker). Native `<dialog>` mirroring SHIPPED TaskComposer / MatrixComposer / EventComposer (role, autofocus, ESC/backdrop/Cancel close, a11y). OR — planner may judge an inline-add (textarea-in-widget) is more natural for stickies than a modal; **planner's call on modal-vs-inline**, justify in discovery.
- **Render user stickies**: StickiesWidget reads the store. Decide fixture disposition: replace fixture entirely, OR merge fixture + user (with fixture as "sample" until first user sticky) — planner decides (mirror calendar Q9/Q10 fixture-disposition reasoning).
- **Persistence**: created stickies survive refresh via `xai_dashboard_stickies`.

### Planner's call (decide in feature-plan)
- **Delete sticky** — **STRONGER case than tasks/matrix**: sticky notes pile up and become useless without removal; create-only may be a poor v1 for this specific domain. Planner should seriously consider create+delete as the minimal viable scope (delete via per-sticky × button + confirmation, or simple immediate delete given low-stakes). Justify the decision in discovery.
- **Edit sticky text** — lower priority; defer unless cheap.
- **i18n approach** — widget currently uses `plugin-web-tokens`. Planner decides: add 2-3 keys to `plugin-web-tokens` (acceptable here since the widget already depends on it and has no local STR infra) OR introduce a local STR table. Prefer the lower-churn option; justify.

### Out of scope (explicitly deferred)
- The other 3 mock-fixture widgets (Mail / Upcoming / Weather) — wiring them to real data is a separate concern, NOT this carve-out.
- Sticky drag-reorder, rich text, attachments, reminders, cross-device sync, IndexedDB.
- StatTasks widget reading real task counts (separate dashboard-data concern).
- Dashboard widget add/remove (already SHIPPED as #9 / AddWidgetPicker; not re-touched).

### Specifically NOT triggered by this carve-out
- ADR-0011 (full P0 productization) — single-feature exception.
- Reversal of P1 desktop priority; reopening SHIPPED archives; new backend/cloud dependency (NO Supabase — the stray `apps/web/supabase/` local dir is unrelated and not part of this work); new npm dependency.

## 3. Impact on shipped artifacts

### Will be modified
- `packages/xai-web-dashboard-widgets/src/` — StickiesWidget wire, new store, new StickyComposer (or inline-add), styles.
- `packages/plugin-web-storage/src/internal/registry.ts` — **add `xai_dashboard_stickies` key (additive — AUTHORIZED by this carve-out)** + its registry test.
- `packages/plugin-web-tokens/` — ONLY IF planner chooses tokens-based i18n for 2-3 new sticky keys (authorized as a narrow exception since the widget already depends on tokens; planner justifies).

### Will be created
- `docs/workflow/roadmap/xai-web-dashboard-stickies-create.md` — manifest (by feature-plan).
- `packages/xai-web-dashboard-widgets/docs/` extension set (extend, don't overwrite SHIPPED).
- New: `StickyComposer.tsx` (or inline-add), `internal/stickiesStore.ts`, `internal/ids.ts`.

### Will NOT be modified
- `xai-web-console.md` / `xai-web-console-gap-closure.md` SHIPPED archives; ADR-0010; ADR-0007.
- Other `plugin-web-*` packages (no Tasks/Matrix/Calendar coupling).
- `packages/core/src/types/events.ts` (no new event channel — React state lift).
- `web-auth-device-session/`; Desktop / Tauri / sync-v1; the `dev` branch.

## 4. Workflow path

Per CLAUDE.md Workflow V2: carve-out commit (this doc) → feature-plan → feature-review → feature-build (phase-per-run) → feature-verify → ship (human-gated push to origin/web). Cross-vendor manual smoke DEFERRED per ADR-0008 §S3 — joins the accumulated Web smoke batch before next `xai-web-deploy-cloudflare` ship.

## 5. Acceptance anchor

Satisfied when: a user can click the Stickies widget `+`, type a note, pick a color, save, see the new sticky appear in the widget, and have it survive a page refresh — verified by automated tests + (deferred) cross-vendor manual smoke. (If planner includes delete: a user can also remove a sticky and have the removal persist.)
