# Feature Brief - desktop-calendar-sync-degraded-mode

> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5.3-codex inline)
> Source: `docs/reviews/desktop-calendar-sync-degraded-mode/20260528-roadmap-seed.md`
> Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#16`

## Feature Title

Desktop Calendar Sync Degraded Mode

## Canonical Name

`desktop-calendar-sync-degraded-mode`

## Naming Rationale

The roadmap slug already matches the actual responsibility boundary:

- `desktop` - this is for the wrapped Tauri desktop runtime on branch `dev`
- `calendar-sync` - the row is about provider-backed calendar sync behavior, not the standalone calendar UI in general
- `degraded-mode` - the core requirement is honest offline degradation plus reconnect recovery, not pretending provider data is local-first

## Motivation

ADR-0011 explicitly classifies third-party calendar sync as a degradable Phase 3 surface rather than a local-first authority. The repo now has enough shipped seams to make that degradation explicit:

- the active calendar module is `@repo/plugin-web-calendar`
- provider connection controls live in `@repo/plugin-web-settings-rest`
- desktop local-first runtime wiring and durable desktop state already flow through `@repo/plugin-web-storage`
- reconnect replay and preflight semantics already exist from row `#14`

What is still missing is a calendar-specific contract that keeps local calendar state usable offline while making provider sync behavior visibly online-only and reconnect-aware.

## Target Outcome

Produce an approved implementation plan that:

- keeps local calendar surfaces usable offline for the active desktop product
- separates local calendar state from third-party provider sync state
- disables or defers provider sync actions honestly when offline instead of implying offline provider writes succeeded
- uses the shipped storage ADR, repository bridge seam, and reconnect runtime semantics for post-reconnect reconciliation
- stays anchored to the active `apps/web`-inside-Tauri product surface, not the legacy `plugin-calendar` desktop package

## In Scope

- active calendar UI boundary in `packages/xai-web-calendar/`
- provider controls and callback/offline status copy in `packages/plugin-web-settings-rest/`
- durable desktop bridge state in `packages/plugin-web-storage/`
- any minimal shared contract additions required in `packages/core-data/`
- thin runtime mount/gating in `apps/web/src/providers/AppProviders.tsx`
- reconnect-triggered calendar sync state reconciliation using the shipped row `#14` runtime semantics
- explicit distinction between:
  - local calendar state (`xai_calendar_view`, `xai_pref_week_start`, active desktop reminder-capable calendar surface)
  - provider sync state (provider availability, last sync outcome, reconnect-needed state, online-only actions)

## Out of Scope

- full local-first provider data replication
- offline provider writes or a fake provider outbox
- inventing a background browser-to-provider sync path
- replacing the sample-data-backed calendar dataset with a full canonical remote event store
- expanding current OAuth stubs into a full production token exchange unless a later row explicitly owns that scope
- legacy `plugin-calendar` UI revival as the primary implementation path
- overlay/control/grid or organizer restoration

## Hard Constraints

- Do not pretend Google/iCloud/CalDAV-style provider sync is local-first.
- Preserve local calendar state and keep it usable when the network is unavailable.
- Keep provider sync state separate from local calendar state in both storage and UI.
- Reconnect reconciliation must follow ADR-0012 and the shipped repository bridge / reconnect seam instead of inventing a host-only parallel state machine.
- Business logic must stay in owning packages; `apps/web/src/providers/AppProviders.tsx` may only mount thin runtime wiring.
- Use the active desktop product surface:
  - `@repo/plugin-web-calendar` is the current calendar owner
  - `plugin-calendar` remains evidence only and must not become the primary runtime dependency

## Dependency Hints

- architecture authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/adr/0012-phase3-local-first-storage.md`
- shipped Phase 3 seams:
  - `packages/desktop-local-first-repository-bridge/docs/dev_log.md`
  - `packages/desktop-local-first-sync-reconnect/docs/dev_log.md`
- active calendar/runtime owners:
  - `packages/xai-web-calendar/`
  - `packages/plugin-web-settings-rest/`
  - `packages/plugin-web-storage/`
  - `apps/web/src/providers/AppProviders.tsx`
- adjacent evidence:
  - `packages/desktop-native-notifications-reminders/`
  - `packages/plugin-calendar/` (non-stable evidence only)

## Acceptance Signal

- Calendar surfaces stay usable offline for local state.
- Provider sync actions are clearly disabled or explicitly marked for reconnect follow-up when offline.
- Reconnect reconciliation has named test or smoke evidence using the shipped desktop bridge and reconnect gates.
- The plan ends with `packages/desktop-calendar-sync-degraded-mode/docs/dev_log.md` at `NEEDS_REVIEW` with `Suggested Next = feature-review`.

