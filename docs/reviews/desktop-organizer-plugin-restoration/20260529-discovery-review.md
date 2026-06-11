# Discovery Review - desktop-organizer-plugin-restoration

> Feature: `desktop-organizer-plugin-restoration`
> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5 inline)
> Roadmap Row: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row `#21`

## Scope

Re-evaluate the legacy desktop organizer-adjacent plugins after row `#20` shipped Smart Container, and decide which packages should be restored, merged, retired, or deferred under the current post-Phase3 architecture.

## External Research

No external research required. This row is an internal source-truth and architecture-alignment decision over existing repo assets, runtime registrations, and shipped package replacements.

## Problem Framing

The old roadmap language grouped five packages together:

- `plugin-organizer`
- `plugin-clipboard`
- `plugin-widgets`
- `plugin-meditation`
- `plugin-pet`

Current repo truth no longer supports treating them as one unit:

- `plugin-organizer` is already active again after row `#20`
- `plugin-clipboard`, `plugin-widgets`, and `plugin-pet` are present but disabled and unregistered
- `plugin-meditation` is referenced by docs but missing from `packages/`
- meditation, pet, and widgets already have more mature stable surfaces elsewhere in the repo

So row `#21` is a disposition row, not a blanket restoration row.

## Current Source Truth

### Runtime registration truth

- `apps/desktop/src/main.tsx` registers only:
  - `registerAccountPlugin()`
  - `registerAiCubePlugin()`
  - `registerProductivityPlugin()`
  - `registerLabelsPlugin()`
  - `registerConsolePlugin()`
- none of `plugin-clipboard`, `plugin-widgets`, or `plugin-pet` are registered there
- `apps/web/src/routes/modules/smartContainerOrganizerRegistration.tsx` mounts `OrganizerWorkspaceModule` from `@repo/plugin-organizer`
- `apps/web/src/App.tsx` keeps organizer visible only in the desktop offline runtime filter path
- `apps/web/src/App.tsx` already mounts `DesktopPet` from `@repo/plugin-web-pet`
- `apps/web/src/routes/modules/shellRegistrations.tsx` already registers `@repo/plugin-web-meditation`

### Package inventory truth

| Package | Repo status | Runtime status | Notes |
|---|---|---|---|
| `packages/plugin-organizer/` | exists, actively maintained, shipped in row `#20` | live | normal-window Smart Container now active |
| `packages/plugin-clipboard/` | exists, scaffold-grade, tests/typecheck runnable | inactive | no host registration, no native clipboard bridge |
| `packages/plugin-widgets/` | exists, scaffold-grade, tests/typecheck runnable | inactive | no host registration, concept overlaps shipped dashboard widget stack |
| `packages/plugin-pet/` | exists, scaffold-grade, tests/typecheck runnable | inactive | no host registration, concept overlaps shipped web pet |
| `packages/plugin-meditation/` | missing | impossible | doc-only drift in `PLUGIN_MAP.md` / `CLAUDE.md` |

### Stable replacement truth

- Meditation already ships as `@repo/plugin-web-meditation` and is marked Stable in `docs/PLUGIN_MAP.md`.
- Pet already ships as `@repo/plugin-web-pet` and is mounted in `apps/web/src/App.tsx`.
- Widgets already ship as:
  - `@repo/plugin-web-dashboard-grid`
  - `@repo/plugin-web-dashboard-widgets`

These are not hypothetical replacements. They are the current user-facing product surfaces inside the desktop-wrapped web runtime.

### Compatibility seam truth

- `packages/plugin-calendar/src/widgetRegistration.tsx` still imports `WidgetManifestRegistration` from `@repo/plugin-widgets`
- `packages/plugin-calendar/manifest.json` still lists `@repo/plugin-widgets` as a dependency
- `packages/plugin-console/src/registry/PluginSlotRegistry.ts` still contains a `clipboard` slot entry
- `packages/plugin-console/manifest.json` still contains a placeholder `widgets` console entry

These seams mean some legacy package names still exist as compatibility residue even where the product surface has already moved elsewhere.

### Verification truth

Executed during planning:

- `pnpm --filter @repo/plugin-organizer check-types` — PASS
- `pnpm --filter @repo/plugin-organizer test -- --run src/desktopLayoutStore.test.ts src/gridItemFactory.test.ts src/GridItem.test.tsx src/finderClient.test.ts` — PASS (22 tests)
- `pnpm --filter @repo/plugin-clipboard check-types` — PASS
- `pnpm --filter @repo/plugin-clipboard test` — PASS (5 tests)
- `pnpm --filter @repo/plugin-widgets check-types` — PASS
- `pnpm --filter @repo/plugin-widgets test` — PASS (5 tests)
- `pnpm --filter @repo/plugin-pet check-types` — PASS
- `pnpm --filter @repo/plugin-pet test` — PASS (29 tests)

The inactive packages are real and testable, but they are not live runtime dependencies today.

## Candidate Options

### Option A - Restore every legacy desktop plugin as-is

Description:

- re-enable `plugin-clipboard`, `plugin-widgets`, `plugin-pet`, and a rebuilt `plugin-meditation`
- treat the surviving package directories as sufficient proof of product relevance

Pros:

- superficially simple
- maximizes legacy-code reuse in the short term

Cons:

- ignores current runtime truth
- duplicates or conflicts with stable web replacements already shipping
- reintroduces mock-only packages as if they were product-ready
- would create a fake desktop meditation resurrection even though no package exists

Verdict:

- reject

### Option B - Mixed disposition matrix by actual current product fit

Description:

- keep organizer restored
- defer clipboard until native desktop capability and clear ownership are decided
- merge widget and pet ownership to the already-stable web/desktop-wrapped surfaces
- retire stale desktop meditation references instead of recreating a ghost package

Pros:

- matches current product architecture
- avoids duplicate surfaces
- preserves legacy code until approved follow-through lands
- gives `feature-build` concrete cleanup and documentation work instead of an open-ended revival effort

Cons:

- produces different outcomes per package rather than one uniform rule
- requires careful docs and compatibility-seam cleanup in later phases

Verdict:

- recommend

### Option C - Retire the whole legacy family immediately

Description:

- mark every package deprecated or removed now, including organizer

Pros:

- lowest long-term maintenance surface

Cons:

- directly conflicts with row `#20`, which already restored organizer
- deletes or demotes reusable code before accepted follow-through
- loses useful historical and compatibility assets that still need review

Verdict:

- reject

## Recommendation

Choose **Option B**.

This row should not ask whether the old desktop family was a good idea in the abstract. It should align the surviving code to the current product:

- Organizer is already restored and should stay restored.
- Clipboard is not ready for active runtime restoration because the core native capture/write story is still absent.
- Widgets, meditation, and pet already have stronger user-facing homes in the stable web surfaces that the desktop product wraps today.

## Disposition Matrix

| Plugin | Disposition | Evidence | Required follow-through |
|---|---|---|---|
| `plugin-organizer` | `restore` | `@repo/plugin-organizer` is already mounted via `smartContainerOrganizerRegistration.tsx`; row `#20` is SHIPPED | Keep current normal-window organizer path as canonical. Preserve overlay-era organizer leftovers under documented legacy boundaries. Update `PLUGIN_MAP.md` and row `#21` docs to say organizer is restored in narrow form already, not pending blanket revival. |
| `plugin-clipboard` | `defer` | package exists and tests pass, but no registration in `apps/desktop/src/main.tsx`; proposed clipboard commands/events only exist in review docs; no native listener/write pipeline is shipped | Keep the package disabled and unregistered. Document it as deferred pending native clipboard capture/paste ownership and final landing zone. Future follow-through must decide whether clipboard belongs under console, productivity, or a standalone desktop slice before any restoration. |
| `plugin-widgets` | `merge` | legacy package is inactive, while stable `@repo/plugin-web-dashboard-grid` + `@repo/plugin-web-dashboard-widgets` already own live widget UX; `plugin-calendar` still has a compatibility seam to `@repo/plugin-widgets` | Rehome any remaining shared widget contract needed by desktop packages, starting with the calendar seam. After compatibility extraction, quarantine or remove the legacy widget host package and point docs to the dashboard widget stack as canonical ownership. |
| `plugin-meditation` | `retire` | `packages/plugin-meditation/` does not exist; stable `@repo/plugin-web-meditation` already ships | Remove or rewrite stale desktop-plugin references in `CLAUDE.md`, `PLUGIN_MAP.md`, and related review docs. Do not recreate a desktop meditation package. Canonical meditation ownership stays with the shipped web module. |
| `plugin-pet` | `merge` | legacy package exists but is inactive; stable `@repo/plugin-web-pet` already ships and is mounted in `apps/web/src/App.tsx` | Treat `@repo/plugin-web-pet` as canonical product ownership. Audit whether any non-UI logic from legacy `plugin-pet` is still worth preserving; otherwise quarantine and retire the legacy package after docs/runtime alignment. |

## Follow-Through Plan

### Phase 1 - Documentation and authority alignment

- update row-`#21` docs and `PLUGIN_MAP.md` to reflect the mixed dispositions explicitly
- correct doc drift around `plugin-meditation`
- document that organizer is already restored through row `#20`
- document that clipboard remains deferred and inactive by design

### Phase 2 - Compatibility seam cleanup

- remove or rehome `plugin-calendar`'s dependency on `@repo/plugin-widgets`
- audit `plugin-console` placeholder entries for `clipboard` and `widgets` so they match the accepted ownership model
- identify whether any remaining imports or manifests still imply an inactive package is live

### Phase 3 - Quarantine / merge / retirement prep

- preserve reusable legacy code under explicit legacy or future boundaries
- for widgets and pet, define package-level quarantine criteria before any removal
- for meditation, cleanup is documentation-only unless a hidden runtime reference is discovered later

### Phase 4 - Verification gates for build-time follow-through

- rerun package-level checks for touched legacy packages
- rerun `@repo/web` checks if widget/pet/meditation ownership docs or registrations change
- rerun affected consumer packages such as `plugin-calendar` and `plugin-console` if their compatibility seams are updated

## Risks And Open Questions

### Risk 1 - Widget contract residue

`plugin-calendar` still references `@repo/plugin-widgets`. Retirement or merge work cannot remove the legacy widget package until that seam is replaced or rehomed.

### Risk 2 - Clipboard ownership ambiguity

The repo has a clipboard scaffold and console placeholders, but no approved native command surface. Restoring clipboard without first choosing package ownership would create another half-live surface.

### Risk 3 - Pet logic duplication

`plugin-pet` and `@repo/plugin-web-pet` both encode pet behavior concepts. Merge follow-through should explicitly decide whether any state-machine logic is worth preserving, rather than quietly carrying two versions forever.

### Risk 4 - Documentation authority lag

`CLAUDE.md` and `PLUGIN_MAP.md` still describe the whole family as one P3 Future bucket. Build follow-through must update those references carefully so downstream planning stops depending on stale package assumptions.

## Review Focus

- Is the per-plugin mixed strategy clearer and safer than treating the family as one restore/no-restore decision?
- Is `plugin-clipboard` correctly deferred rather than force-restored?
- Is `plugin-widgets` better classified as `merge` than `retire` because of the live dashboard widget replacements plus the calendar seam?
- Is `plugin-meditation` correctly handled as a retirement of stale desktop references rather than a package resurrection?
- Does the pet merge plan preserve useful legacy code while still making `@repo/plugin-web-pet` the canonical user-facing surface?
