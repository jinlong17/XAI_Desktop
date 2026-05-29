# Design Snapshot - desktop-organizer-plugin-restoration

## Selected Option

Adopt a mixed disposition strategy for the legacy organizer-adjacent desktop packages:

1. `plugin-organizer` stays restored.
2. `plugin-clipboard` stays deferred.
3. `plugin-widgets` merges into the shipped dashboard widget architecture.
4. `plugin-meditation` is retired as stale desktop-plugin drift.
5. `plugin-pet` merges into the shipped web pet surface.

## Review Doc Path

`docs/reviews/desktop-organizer-plugin-restoration/20260529-discovery-review.md`

## Review Date / Version

- 2026-05-29
- Fresh planning pass for roadmap row `#21`

## Frozen Assumptions

- Row `#20` is the authority that organizer is already restored in narrow normal-window form.
- `apps/desktop/src/main.tsx` and `apps/web/src/App.tsx` are the current runtime truth for what is actually mounted.
- Stable web replacements already shipping in the desktop-wrapped web runtime are valid merge targets for row `#21`.
- The absence of `packages/plugin-meditation/` is authoritative; no desktop meditation package should be recreated just to satisfy stale docs.
- Reusable legacy code must be preserved until follow-through is reviewed and accepted.
- `plugin-calendar` and `plugin-console` still hold compatibility residue that must be cleaned before widget/clipboard decisions can fully land.

## Dependency Overview

| Dependency | Status | Row `#21` relevance |
|---|---|---|
| `packages/plugin-organizer/` | active | restored organizer owner after row `#20` |
| `packages/plugin-clipboard/` | inactive | deferred clipboard scaffold with repo adapters and tests |
| `packages/plugin-widgets/` | inactive | legacy widget host/contract surface with remaining compatibility residue |
| `packages/plugin-pet/` | inactive | legacy pet scaffold worth auditing before quarantine |
| `packages/xai-web-meditation/` | Stable | canonical meditation ownership today |
| `packages/xai-web-pet/` | Stable | canonical user-facing pet ownership today |
| `packages/xai-web-dashboard-grid/` | Stable | canonical dashboard widget host today |
| `packages/xai-web-dashboard-widgets/` | Stable | canonical dashboard widget pack today |
| `packages/plugin-calendar/` | In-Dev | still depends on `@repo/plugin-widgets` compatibility seam |
| `packages/plugin-console/` | In-Dev | still exposes placeholder `clipboard` / `widgets` ownership hints |

## Delivery Shape

| Phase | Primary outcome |
|---|---|
| P1 | docs and PLUGIN_MAP authority aligned to the mixed dispositions |
| P2 | compatibility seams cleaned (`plugin-calendar`, `plugin-console`, manifests/docs) |
| P3 | reviewed quarantine / merge / retirement follow-through for inactive legacy packages |
