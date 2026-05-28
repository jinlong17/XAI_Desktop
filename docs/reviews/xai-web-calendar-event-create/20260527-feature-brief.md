# Feature Brief — xai-web-calendar-event-create

**Date:** 2026-05-27
**Source:** Operator instruction (verbatim brief) attached to `feature-plan` Task spawn
**Canonical name:** `xai-web-calendar-event-create`
**Owning package:** `@repo/plugin-web-calendar` (extension; package row already SHIPPED 2026-05-23 + 2026-05-25)
**Carve-out authority:** `docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md` (committed 2026-05-27 — landing commit lookup pending; operator brief cites `bc573b1` as the carve-out commit per ADR-0010 §D4)

---

## 1. Motivation

Audit Top-10 #2 (`docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` §2.5 row C-02) surfaced the Calendar toolbar `+` button as a no-op stub (`CalendarToolbar.tsx:39-41` — no `onClick`).

A subsequent `bug-diagnose` pass on row #12 (`packages/xai-web-calendar/docs/dev_log.md` BUGFIX section, agentId `ad2ed5754fa60cafd`) established that the gap is structural:

- `SAMPLE_EVENTS` is a byte-for-byte fixture (`internal/sampleEvents.ts:31-152`) transcribed from `web design/i18n.js:509-541`.
- No event reducer / store exists.
- No `xai_calendar_events` registry key exists in `packages/plugin-web-storage/src/internal/registry.ts`.
- `design.md §15.2 HC8` explicitly declares "no event-creation/editing UI" — a deliberate v1 read-only constraint, not an oversight.
- The Calendar banner already says "Sample data — switch to your account…" — honest disclosure of the limitation.

The diagnose path recommended **Option A** (DISABLE + bilingual "Coming soon" tooltip) as the only in-scope bug-fix. Operator instead chose **Option B** — real event-creation feature — which exceeds bug-fix scope and requires lifting HC8.

The P0 carve-out doc at `docs/reviews/_p0-carve-outs/20260527-calendar-event-create.md` authorizes this single feature under ADR-0010 §D4 ("new feature plans require an explicit P0 carve-out commit citing this ADR's D1").

## 2. Target outcome

Users can, on `/app/calendar`, **create / edit / delete** real Calendar events from any of Month / Week / Day views. New events render immediately in the active view, persist to `localStorage`, and survive a page reload. Simple recurrence (daily / weekly) is supported. The fixture `SAMPLE_EVENTS` becomes either user-empty (with onboarding hint) or dev-only — final disposition is a feature-plan decision.

## 3. Scope (Realistic v1, 1-2 weeks)

### Must (v1.0)

- **Create**: native `<dialog>` (per `SignOutConfirmDialog.tsx` + `CardDetailDialog.tsx` pattern) with title + date + start time + end time.
- **Edit**: click existing event → same dialog pre-filled → save.
- **Delete**: dialog "Delete" button OR context menu.
- **List view re-render**: Month / Week / Day all reflect the change without reload.
- **Persistence**: new `xai_calendar_events` localStorage key registered in `packages/plugin-web-storage/src/internal/registry.ts`.
- **Migration**: `SAMPLE_EVENTS` disposition — recommended "first-visit onboarding hint + user-empty state", or dev-only toggle (feature-plan decides).

### Should (v1.0)

- **Simple recurrence**: daily / weekly (no monthly, no until-date, no exception instances).
- **Color / category**: 3-5 preset colors (via CSS vars or existing tokens — no new design system).
- **Bilingual EN/ZH** dialog copy (same local STR table pattern as `SignOutConfirmDialog` / `CardDetailDialog`; no `plugin-web-tokens` edit).

### Won't (out of scope — explicitly rejected)

- Tasks card creation (T10 #3) — independent follow-up decision.
- Timezone awareness (browser local TZ assumed).
- Cross-device sync (deferred to ADR-0011 / xai-g2).
- External calendar integration (Google / iCloud / Outlook).
- Drag-drop reschedule.
- Multi-day events.
- Reminders / notifications.
- Recurrence beyond daily/weekly.
- Labels / categories beyond preset colors.
- IndexedDB migration (audit Option B framing — independent later decision).

## 4. Constraints (hard)

- ADR-0010 §D4 P0 carve-out authorized — see carve-out doc.
- ADR-0007 plugin boundary strict — `apps/web` is shell only; business logic lives in `packages/xai-web-calendar/` or a new internal package directory.
- design.md §15.2 HC8 lift — feature-plan decides between inline footnote (recommended) and superseding addendum. Recommended note: "lifted in v1.1 per ADR-0010 §D4 carve-out 2026-05-27".
- Reuse existing native `<dialog>` modal pattern (`packages/xai-web-shell/src/SignOutConfirmDialog.tsx` + `packages/plugin-web-board-workspaces/src/CardDetailDialog.tsx`).
- Reuse existing i18n pattern (local STR table per package — no `plugin-web-tokens` edit).
- NO new npm dependency.
- NO Supabase / IndexedDB / remote backend (carve-out boundary).
- NO `packages/web-auth-device-session/` change.
- NO `packages/xai-web-event-bus/` / `packages/core/` change (unless adding a new `web:calendar:*` channel — requires explicit feature-plan justification).
- NO change to SHIPPED roadmap manifest (`xai-web-console.md` / `xai-web-console-gap-closure.md`).

## 5. Acceptance signals (HC)

- **HC1**: Create event → immediately visible in active view.
- **HC2**: Edit event → view updates synchronously.
- **HC3**: Delete event → view immediately reflects removal.
- **HC4**: Refresh page → events preserved.
- **HC5**: Recurrence (daily/weekly) → correctly expanded across Month / Week / Day views.
- **HC6**: Empty event list → sensible empty state shown.
- **HC7**: Multiple events in same time slot → render side-by-side, no overdraw.

## 6. Planner deliverables (per `feature-plan` spec)

1. Roadmap manifest at `docs/workflow/roadmap/xai-web-calendar-event-create.md`.
2. Discovery review at `docs/reviews/xai-web-calendar-event-create/20260527-discovery-review.md`.
3. Plan extension blocks in `packages/xai-web-calendar/docs/{design,api,test,dev_log}.md` (append-only — row #12 + gap-closure row #4 stay byte-identical).
4. 3-5 phase build plan (each phase = one `feature-build` run).
5. Risk analysis.
6. Cross-vendor verify gate proposal (Codex `gpt-5.5-thinking medium` recommended).

## 7. Workflow path

```
P0 carve-out commit (already landed 2026-05-27)
  ↓
feature-plan (THIS PASS) — produces plan/docs/manifest; no production code
  ↓
feature-review — APPROVED or REVISE
  ↓
feature-build (one phase per run, manual confirmation between phases)
  ↓
feature-verify — READY_TO_SHIP or BLOCKED
  ↓
ship — push to origin/web
```

Estimated total: 1-2 weeks (operator estimate, refined by feature-plan).
