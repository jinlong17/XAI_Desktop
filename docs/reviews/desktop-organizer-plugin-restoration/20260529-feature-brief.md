# Feature Brief - desktop-organizer-plugin-restoration

> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Source: `docs/reviews/desktop-organizer-plugin-restoration/20260528-roadmap-seed.md`
> Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#21`

## Feature Title

Desktop Organizer Plugin Restoration

## Canonical Name

`desktop-organizer-plugin-restoration`

## Naming Rationale

The roadmap slug is already the right boundary for this row:

- `desktop` keeps the work on the `dev` desktop/Tauri product line
- `organizer-plugin` names the legacy package family under review instead of only Smart Container
- `restoration` leaves room for mixed outcomes, because this row must decide restore vs merge vs retire vs defer rather than blindly revive every legacy package

## Motivation

Row `#20` already shipped the narrow Smart Container organizer slice, which changes the problem statement for row `#21`.

The repo now has three different classes of legacy organizer-adjacent assets:

1. one package that is already back in the live product path:
   - `packages/plugin-organizer/`
   - mounted through `apps/web/src/routes/modules/smartContainerOrganizerRegistration.tsx`
2. several inactive desktop package scaffolds:
   - `packages/plugin-clipboard/`
   - `packages/plugin-widgets/`
   - `packages/plugin-pet/`
3. one package that docs still reference but the repo does not contain:
   - `packages/plugin-meditation/`

At the same time, the current product architecture already has stable replacements for some legacy concepts:

- meditation already ships as `@repo/plugin-web-meditation`
- pet already ships as `@repo/plugin-web-pet`
- widgets already ship as `@repo/plugin-web-dashboard-grid` plus `@repo/plugin-web-dashboard-widgets`

So row `#21` must stop treating `plugin-{organizer, clipboard, widgets, meditation, pet}` as one revival bundle. It needs a plugin-by-plugin disposition matrix tied to current source truth.

## Target Outcome

Produce an approved planning package that:

- classifies each legacy plugin as `restore`, `merge`, `retire`, or `defer`
- justifies each decision against the real current runtime, package layout, and stable replacements already in the repo
- defines the required follow-through for each accepted disposition:
  - runtime registration rules
  - package quarantine or removal boundaries
  - `manifest.json` / `PLUGIN_MAP.md` / review-doc alignment
  - compatibility seams that must move first
  - package-level verification gates
- preserves reusable legacy assets until a reviewed build pass lands the follow-through
- stops at `NEEDS_REVIEW` with `Suggested Next = feature-review`

## Recommended Disposition Summary

- `plugin-organizer` → `restore`
- `plugin-clipboard` → `defer`
- `plugin-widgets` → `merge`
- `plugin-meditation` → `retire`
- `plugin-pet` → `merge`

## In Scope

- row `#21` planning only
- source-truth review across:
  - `packages/plugin-organizer/`
  - `packages/plugin-clipboard/`
  - `packages/plugin-widgets/`
  - `packages/plugin-pet/`
  - doc-only `plugin-meditation` references
- current runtime registrations in:
  - `apps/desktop/src/main.tsx`
  - `apps/web/src/App.tsx`
  - `apps/web/src/routes/modules/shellRegistrations.tsx`
  - `apps/web/src/routes/modules/smartContainerOrganizerRegistration.tsx`
- stable replacement surfaces in:
  - `packages/xai-web-meditation/`
  - `packages/xai-web-pet/`
  - `packages/xai-web-dashboard-grid/`
  - `packages/xai-web-dashboard-widgets/`
- compatibility constraints such as:
  - `packages/plugin-calendar/src/widgetRegistration.tsx`
  - `packages/plugin-calendar/manifest.json`
  - `packages/plugin-console/src/registry/PluginSlotRegistry.ts`
  - `packages/plugin-console/manifest.json`

## Out of Scope

- implementing the restore/merge/retire follow-through in this planning run
- re-enabling any inactive desktop plugin in `apps/desktop/src/main.tsx`
- inventing native clipboard listener, paste injection, OCR, or widget host commands that do not exist today
- deleting reusable package code before review accepts the disposition matrix
- modifying unrelated roadmap rows or shipping decisions

## Hard Constraints

- Preserve future-useful legacy code until a documented disposition is reviewed and accepted.
- Do not assume old organizer-adjacent packages are active dependencies just because they still exist in `packages/`.
- Treat current runtime registrations as authoritative over old manifests or stale docs.
- Do not move business logic into `apps/desktop/src/` or `packages/core/`.
- Keep row `#21` separate from row `#20`; organizer restoration beyond the shipped normal-window slice is its own decision surface.
- Use real package names and executable test commands from this repo.
- Do not create a fake `plugin-meditation` package just to satisfy stale docs.

## Dependency Hints

- roadmap and seed:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
  - `docs/reviews/desktop-organizer-plugin-restoration/20260528-roadmap-seed.md`
- shipped predecessor rows:
  - `docs/reviews/desktop-smart-container-file-organizer/20260529-feature-brief.md`
  - `docs/reviews/desktop-smart-container-file-organizer/20260529-discovery-review.md`
  - `packages/desktop-smart-container-file-organizer/docs/dev_log.md`
  - `packages/desktop-overlay-host-v2/docs/dev_log.md`
- global authority:
  - `CLAUDE.md`
  - `docs/PLUGIN_MAP.md`
- runtime truth:
  - `apps/desktop/src/main.tsx`
  - `apps/web/src/App.tsx`
  - `apps/web/src/routes/modules/shellRegistrations.tsx`
  - `apps/web/src/routes/modules/smartContainerOrganizerRegistration.tsx`
- legacy packages:
  - `packages/plugin-organizer/`
  - `packages/plugin-clipboard/`
  - `packages/plugin-widgets/`
  - `packages/plugin-pet/`
- stable replacement packages:
  - `packages/xai-web-meditation/`
  - `packages/xai-web-pet/`
  - `packages/xai-web-dashboard-grid/`
  - `packages/xai-web-dashboard-widgets/`
- compatibility seams:
  - `packages/plugin-calendar/src/widgetRegistration.tsx`
  - `packages/plugin-calendar/manifest.json`
  - `packages/plugin-console/src/registry/PluginSlotRegistry.ts`
  - `packages/plugin-console/manifest.json`

## Acceptance Signal

- The plan names one disposition per plugin and grounds it in current source truth.
- The plan is explicit about which packages are already live, which are mock-only, and which are doc drift.
- Organizer stays restored without silently reopening the overlay-era revival path.
- Widget, pet, and meditation decisions point at the already-stable replacement surfaces in this repo.
- Clipboard is not force-restored without the missing native capability story.
- The follow-through plan is concrete enough for `feature-build` to execute review-approved documentation and cleanup work phase by phase.
