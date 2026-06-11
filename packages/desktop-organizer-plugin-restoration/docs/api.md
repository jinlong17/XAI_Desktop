# API Contract - desktop-organizer-plugin-restoration

## Upstream Interfaces

| Surface | Current contract | Planning assumption |
|---|---|---|
| Roadmap row `#21` seed | requires per-plugin restore/merge/retire/defer decision | row output is documentation and follow-through planning only |
| `docs/PLUGIN_MAP.md` | global plugin authority | must be updated later to reflect mixed dispositions, not one family bucket |
| row `#20` shipped organizer docs | organizer already restored in narrow form | row `#21` must not re-open row `#20` scope |

## Downstream Interfaces

### Live runtime ownership seams

| Surface | Current truth | Row `#21` rule |
|---|---|---|
| `apps/web/src/routes/modules/smartContainerOrganizerRegistration.tsx` | mounts `OrganizerWorkspaceModule` from `@repo/plugin-organizer` | organizer remains the restored owner |
| `apps/web/src/App.tsx` | mounts `DesktopPet` from `@repo/plugin-web-pet` | pet merge target is already live |
| `apps/web/src/routes/modules/shellRegistrations.tsx` | registers `@repo/plugin-web-meditation` | meditation remains web-owned; no desktop package revival |
| `apps/desktop/src/main.tsx` | does not register clipboard/widgets/pet | no inactive desktop package is considered live until a later approved build pass |

### Compatibility seams that block cleanup

| Surface | Current truth | Required future action |
|---|---|---|
| `packages/plugin-calendar/src/widgetRegistration.tsx` | imports `WidgetManifestRegistration` from `@repo/plugin-widgets` | rehome the widget contract before retiring/quarantining legacy widgets |
| `packages/plugin-calendar/manifest.json` | depends on `@repo/plugin-widgets` | align dependency with the accepted widget ownership model |
| `packages/plugin-console/src/registry/PluginSlotRegistry.ts` | still contains `clipboard` slot metadata | confirm whether clipboard remains a future console module or moves elsewhere |
| `packages/plugin-console/manifest.json` | still contains placeholder `widgets` console entry | align placeholder ownership with the merge decision |

## Error Semantics

- Missing package path is explicit source truth, not a runtime error to paper over:
  - `packages/plugin-meditation/` absent means "retire stale docs", not "scaffold a new package"
- Inactive package presence is not proof of runtime support:
  - package exists + tests pass does not override registration absence
- Merge or retirement follow-through must not remove compatibility seams until the consumer package has a reviewed replacement path
- Organizer restoration must not silently widen back into overlay-first or blanket legacy-package revival

## Permission And Idempotency Notes

- This planning row does not change runtime registration permissions.
- Documentation-only alignment is idempotent.
- Future package quarantine/removal work must be staged only after the replacement or defer path is explicit and review-approved.
- Any future clipboard restoration will require new native capability seams; it is not unlocked by docs changes alone.

## Data / Migration Notes

- `plugin-organizer` already owns durable organizer data through the row `#20` local-first path.
- `plugin-clipboard`, `plugin-widgets`, and `plugin-pet` currently keep device-local or local mock persistence inside their own package scaffolds.
- Retirement or merge follow-through must decide whether any inactive-package user data needs migration, or whether the packages are sufficiently inactive that quarantine without migration is acceptable.

## Public Surface Assumptions

- No new public API is introduced by this planning row.
- Existing package `index.ts` surfaces remain authoritative until a later approved build row changes them.
- Any shared contract extraction for widgets should land in a neutral, explicitly documented surface rather than hidden direct imports.

## Phase 3 Boundary Contracts (Executable)

### Runtime registration contract

- Desktop host registration in `apps/desktop/src/main.tsx` stays limited to the currently registered plugins; row `#21` must not add clipboard/widgets/pet registrations.
- Organizer remains exposed through `organizerWebModuleRegistration` + `OrganizerWorkspaceModule`; row `#21` does not alter this registration contract.
- Web meditation/pet ownership remains on stable web plugins (`@repo/plugin-web-meditation`, `@repo/plugin-web-pet`).

### Manifest and package-state contract

- `packages/plugin-clipboard/manifest.json`, `packages/plugin-widgets/manifest.json`, and `packages/plugin-pet/manifest.json` must remain `enabled: false` until an explicit follow-up row promotes them.
- `packages/plugin-meditation/` is intentionally absent; adding a new desktop meditation package is out of contract for row `#21`.
- `packages/plugin-calendar` -> `@repo/plugin-widgets` dependency is treated as a compatibility seam, not proof that widgets are active.

### Quarantine/retirement contract

- Widgets and pet can only move to quarantine/removal after compatibility and asset-preservation criteria are reviewed.
- Meditation cleanup is doc/authority retirement only.
- Organizer restore scope is bounded to row `#20` shipped path and cannot be widened here.
