# host-business-residuals — Test Plan

## Automated Checks

```bash
test -f docs/planning/execution/host-residuals.md
rg -n "AiCube|SettingsPanel|useSyncMenuBarStatus|OrganizerLayer|create-grid-request|useGridSystem" apps/desktop/src -g '*.{ts,tsx}'
```

## Manual Checks

- Review `docs/planning/execution/host-residuals.md` for missing Host business surfaces before starting G1.2 or G1.6 cleanup implementation.

