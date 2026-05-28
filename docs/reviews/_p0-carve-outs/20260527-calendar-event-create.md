# P0 Carve-Out — xai-web-calendar-event-create

**Date:** 2026-05-27
**Authority:** ADR-0010 Accepted 2026-05-26 §D4 — "new feature plans require an explicit P0 carve-out commit citing this ADR's D1"
**Triggering evidence:** [docs/reviews/_web-noop-audit/20260527-button-action-inventory.md](../_web-noop-audit/20260527-button-action-inventory.md) Top-10 #2 (Calendar `+` event-add) + diagnose finding (see `packages/xai-web-calendar/docs/dev_log.md` BUGFIX section, agentId ad2ed5754fa60cafd)
**Operator decision:** Option B (real feature, Realistic v1 scope, Calendar-only) per session AskUserQuestion 2026-05-27

---

## 1. Background

Audit Top-10 #2 surfaced that the Calendar toolbar `+` button has no `onClick` handler. `bug-diagnose` then established that the underlying gap is much deeper than a missing handler — **the entire Calendar event domain is mock-only in v1**:

- `SAMPLE_EVENTS` is a byte-for-byte fixture rendered by month/week/day views
- No event reducer / store
- No `xai_calendar_events` (or analogous) key in `packages/plugin-web-storage/src/internal/registry.ts`
- `design.md §15.2 HC8` explicitly states "no event-creation/editing UI" — this is a deliberate v1 constraint, not an oversight
- The existing Calendar banner already says "Sample data — switch to your account…" — honest user-facing disclosure of the limitation

`bug-diagnose` recommended **Option A** (DISABLE 4 dead buttons + bilingual "Coming soon" tooltip) as the minimal honest bug-fix.

Operator chose **Option B** (real event-creation feature) instead. This requires lifting the v1 read-only constraint and is no longer bug-fix scope.

## 2. Scope of this carve-out

This carve-out authorizes **new feature development** on the Web P0 surface (otherwise maintenance-only per ADR-0010 §D1) for the single feature:

**`xai-web-calendar-event-create`** — Realistic v1

### In scope
- Event Create (CRUD `create`): dialog with title + date + start/end time
- Event Edit (CRUD `update`): click existing event → same dialog pre-filled → save
- Event Delete (CRUD `delete`): in-dialog or context menu
- Simple recurrence: daily / weekly (no monthly, no until-date)
- Optional event color/category (3-5 preset colors)
- localStorage persistence (new `xai_calendar_events` key + registry addition)
- Migration: zero-state (no existing user data; `SAMPLE_EVENTS` becomes opt-in fixture toggle or removed)
- design.md §15.2 HC8 revision: lift the "no event-creation/editing UI" constraint with explicit note "lifted in v1.1 per ADR-0010 §D4 carve-out 2026-05-27"

### Out of scope (explicitly deferred)
- Tasks card creation (Audit Top-10 #3) — separate decision after Calendar lands
- Timezone awareness (TZ assumed = browser local)
- Cross-device sync (deferred to xai-g2 / Supabase ADR-0011 conversation)
- Labels / categories (beyond the 3-5 preset colors)
- Drag-drop reschedule
- Multi-day events
- Reminders / notifications
- Recurrence beyond daily/weekly (no monthly, no until-date, no exceptions)
- External calendar integration (Google Calendar / iCloud / Outlook)
- IndexedDB migration (per audit Option B framing — independent later decision)

### Specifically NOT triggered by this carve-out
- ADR-0011 (full P0 productization) — this carve-out is a **single-feature exception**, not a strategic re-prioritization
- Reversal of P1 desktop priority — G1 native foundation continues unaffected
- Reopening of `xai-web-console.md` or `xai-web-console-gap-closure.md` SHIPPED archives
- New backend / cloud dependency (Supabase, Firebase, etc.)
- New npm dependency

## 3. Impact on shipped artifacts

### Will be modified
- `packages/xai-web-calendar/src/` — feature implementation
- `packages/plugin-web-storage/src/internal/registry.ts` — add `xai_calendar_events` key (additive, no schema change)
- `design.md §15.2` (if treated as canonical doc) — HC8 lift annotation; OR a `web design/DESIGN.md` superseding addendum if §15.2 is canonical SHIPPED archive
- `docs/PLUGIN_MAP.md` — possibly a feature-active line item under xai-web-calendar (TBD by feature-plan)

### Will be created
- `docs/workflow/roadmap/xai-web-calendar-event-create.md` — feature roadmap manifest (by `feature-plan`)
- `packages/xai-web-calendar/docs/` set — design / api / test / dev_log per feature-plan
- New components inside `packages/xai-web-calendar/src/` — composer dialog, event store, persistence adapter

### Will NOT be modified
- `xai-web-console.md` / `xai-web-console-gap-closure.md` SHIPPED archives (still archives)
- ADR-0010 (this carve-out USES it, doesn't supersede it)
- ADR-0007 (web build form remains canonical)
- Other plugin-web-* packages (no Tasks, no Statistics, no Dashboard cross-coupling in scope)
- `packages/web-auth-device-session/` (no auth changes)
- Desktop / Tauri / sync-v1 surfaces

## 4. Workflow path

Per CLAUDE.md Workflow V2:

```
P0 carve-out commit (this doc)
  ↓
feature-plan → produces:
  - docs/workflow/roadmap/xai-web-calendar-event-create.md (manifest)
  - packages/xai-web-calendar/docs/{design, api, test, dev_log}.md (per-feature contract)
  - implementation plan in phases
  ↓
feature-review → APPROVED or REVISE
  ↓
feature-build (one phase per run, manual confirmation between phases)
  OR feature-dev-loop (auto-cycle build + verify, max 3 retries)
  ↓
feature-verify → READY_TO_SHIP or BLOCKED
  ↓
ship → push to origin/web
```

Estimated total: **1-2 weeks** per Realistic v1 scope (operator estimate, to be confirmed by feature-plan).

## 5. Audit batch context

This carve-out interrupts the Audit Option A bug-fix batch progress:

| # | Audit Top-10 | Status (before this carve-out) |
|---|---|---|
| T10 #7 | Topbar persistence | ✅ SHIPPED 2026-05-27 |
| T10 #1 | Sign-out wire (Option C) | ✅ SHIPPED 2026-05-27 |
| T10 #5 | Board onOpenCard cluster | ✅ SHIPPED 2026-05-27 (cycle 1+2) |
| **T10 #2** | **Calendar `+` event-add** | **→ Option B carve-out (this doc)** |
| T10 #3 | Tasks `+` columns | ⏳ pending separate decision (likely same mock-only pattern) |

After this carve-out's feature lands, operator can:
- Apply same Option B pattern to Tasks (#3) if desired
- OR fall back to Option A (DISABLE) for #3 to close the batch
- OR defer #3 indefinitely

## 6. Acceptance signal

This carve-out is **active** as of the commit that lands this file. `feature-plan` for `xai-web-calendar-event-create` may begin immediately after this commit; downstream `feature-build` / `feature-verify` / `ship` commits do not need to re-cite this carve-out (one citation per feature is sufficient per ADR-0010 §D4).

Reverting this carve-out requires either (a) explicit owner statement abandoning the feature, or (b) ADR-0011 reverting D1 priority (unrelated escalation).

---

**Authored by:** Claude Opus 4.7 (1M context) at operator request
**Operator confirmation:** session AskUserQuestion 2026-05-27 (Option B + Calendar-only + Realistic v1)
