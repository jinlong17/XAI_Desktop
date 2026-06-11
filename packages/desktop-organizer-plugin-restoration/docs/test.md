# Test Strategy - desktop-organizer-plugin-restoration

## Validation Goal

Prove that the accepted disposition matrix matches actual repo/runtime truth and that future follow-through can update docs, compatibility seams, and package boundaries without regressing live organizer behavior or shipped web replacements.

## Source-Truth Checks

- `rg -n "desktop-organizer-plugin-restoration|desktop-smart-container-file-organizer" docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- `rg -n "plugin-organizer|plugin-clipboard|plugin-widgets|plugin-meditation|plugin-pet" docs/PLUGIN_MAP.md`
- `rg -n "register.*Plugin" apps/desktop/src/main.tsx`
- `rg -n "OrganizerWorkspaceModule|DesktopPet|meditationSlotRegistration" apps/web/src/App.tsx apps/web/src/routes/modules`
- `test -d packages/plugin-meditation || echo "missing"`

Acceptance:

- organizer is visibly live in the current runtime wiring
- clipboard/widgets/pet are not falsely treated as registered desktop plugins
- meditation desktop package absence is confirmed from the filesystem

## Package-Level Automated Checks

Executed during planning:

- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter @repo/plugin-organizer test -- --run src/desktopLayoutStore.test.ts src/gridItemFactory.test.ts src/GridItem.test.tsx src/finderClient.test.ts`
- `pnpm --filter @repo/plugin-clipboard check-types`
- `pnpm --filter @repo/plugin-clipboard test`
- `pnpm --filter @repo/plugin-widgets check-types`
- `pnpm --filter @repo/plugin-widgets test`
- `pnpm --filter @repo/plugin-pet check-types`
- `pnpm --filter @repo/plugin-pet test`

Expected outcome:

- all commands stay green unless a future build pass intentionally changes the touched package

## Replacement-Surface Regression Checks

Required when follow-through touches merge/retire decisions:

- `pnpm --filter @repo/plugin-web-meditation check-types`
- `pnpm --filter @repo/plugin-web-meditation test`
- `pnpm --filter @repo/plugin-web-pet check-types`
- `pnpm --filter @repo/plugin-web-pet test`
- `pnpm --filter @repo/plugin-web-dashboard-grid check-types`
- `pnpm --filter @repo/plugin-web-dashboard-grid test`
- `pnpm --filter @repo/plugin-web-dashboard-widgets test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web test`

Acceptance:

- merge targets remain green after docs or compatibility-seam cleanup
- user-facing meditation/pet/widget surfaces remain owned by the stable web packages

## Compatibility-Seam Checks

Run if widget or clipboard follow-through changes shared ownership:

- `pnpm --filter @repo/plugin-calendar check-types`
- `pnpm --filter @repo/plugin-console check-types`
- `rg -n "@repo/plugin-widgets|clipboard|widgets" packages/plugin-calendar packages/plugin-console`

Acceptance:

- `plugin-calendar` no longer depends on a legacy widget surface without an explicit approved reason
- `plugin-console` placeholders match the accepted ownership model

## Mock Strategy

- Treat `plugin-clipboard`, `plugin-widgets`, and `plugin-pet` as inactive legacy packages unless and until build follow-through reclassifies them.
- If later build work needs to preserve code while removing runtime exposure, prefer quarantine and documentation over partial live wiring.
- Do not mock organizer’s current normal-window runtime; row `#20` already made it real.

## Review Acceptance Criteria

- `plugin-organizer` remains classified as restored.
- `plugin-clipboard` remains explicitly deferred with documented native-capability blockers.
- `plugin-widgets` merge plan includes compatibility cleanup before retirement/quarantine.
- `plugin-meditation` retirement plan is documentation cleanup, not package resurrection.
- `plugin-pet` merge plan points to the already-live `@repo/plugin-web-pet` surface.

## Phase 3 Boundary Verification Gates

### Registration and package-state assertions

- desktop host registration still excludes clipboard/widgets/pet:
  - `rg -n "register.*Plugin" apps/desktop/src/main.tsx`
- legacy package manifests remain disabled:
  - `rg -n "\"enabled\": false" packages/plugin-clipboard/manifest.json packages/plugin-widgets/manifest.json packages/plugin-pet/manifest.json`
- desktop meditation package remains absent:
  - `test -d packages/plugin-meditation || echo "packages/plugin-meditation missing"`

### Compatibility seam assertions

- calendar seam remains explicitly visible until rehome row lands:
  - `rg -n "@repo/plugin-widgets|WidgetManifestRegistration" packages/plugin-calendar`
- console placeholders remain explicit compatibility residue, not live activation:
  - `rg -n "clipboard|widgets" packages/plugin-console/manifest.json packages/plugin-console/src/registry/PluginSlotRegistry.ts`

### Regression checks for touched compatibility packages

- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter @repo/plugin-clipboard check-types`
- `pnpm --filter @repo/plugin-widgets check-types`
- `pnpm --filter @repo/plugin-pet check-types`
- `pnpm --filter @repo/plugin-calendar check-types`
- `pnpm --filter @repo/plugin-console check-types`
