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
| P2 | compatibility seams explicitly inventoried and documented (`plugin-calendar`, `plugin-console`) |
| P3 | build-frozen follow-through boundaries defined for preserve/defer/merge/retire without reviving inactive packages |

## Phase 3 Follow-Through Boundaries (Build-Frozen)

### Organizer (restore, preserve)

- Canonical path stays `apps/web/src/routes/modules/smartContainerOrganizerRegistration.tsx` -> `@repo/plugin-organizer`.
- Do not re-open overlay-era blanket package revival through row `#21`.
- Any organizer legacy leftovers must remain under explicit legacy/future boundaries unless a new reviewed row replaces row `#20` authority.

### Clipboard (defer, disabled)

- Keep `packages/plugin-clipboard/manifest.json` with `enabled: false`.
- Do not add `registerClipboardPlugin()` or equivalent host registration in `apps/desktop/src/main.tsx`.
- Defer until native clipboard capture/write ownership and capability contracts are approved.

### Widgets (merge, compatibility-first)

- Keep `packages/plugin-widgets/` inactive while `plugin-calendar` still imports widget contracts from it.
- Merge target remains the shipped dashboard stack:
  - `@repo/plugin-web-dashboard-grid`
  - `@repo/plugin-web-dashboard-widgets`
- Quarantine/removal is blocked until compatibility seams are rehomed and reviewed.

### Meditation (retire desktop package drift)

- `packages/plugin-meditation/` remains absent by design.
- Canonical runtime ownership is `@repo/plugin-web-meditation`.
- Follow-through is documentation cleanup plus stale-reference removal only.

### Pet (merge, preserve useful legacy assets)

- Canonical runtime ownership remains `@repo/plugin-web-pet` (mounted in `apps/web/src/App.tsx`).
- Keep legacy `packages/plugin-pet/` disabled/unregistered while compatibility audit decides reusable assets.
- Do not delete legacy assets prematurely before reviewed quarantine criteria are accepted.
