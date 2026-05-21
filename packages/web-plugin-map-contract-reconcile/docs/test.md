# web-plugin-map-contract-reconcile — Test Plan

## Validation Strategy

This is a docs-only contract feature. Validation is evidence-based, not runtime-based.

## Contract Coverage

1. `docs/PLUGIN_MAP.md` must:
   - register `project` as a real plugin package
   - treat Todo / Pomodoro / Habits as capability aliases under `plugin-productivity`, not standalone live packages
   - make the Web Console package boundary explicit
   - state current Web build eligibility without claiming nonexistent `manifest.windows.web` support
2. `docs/planning/sub-prds/web/dev-plan.md` must defer to `docs/PLUGIN_MAP.md` and `ADR-0006` for current package truth.
3. `packages/web-plugin-map-contract-reconcile/docs/{design,api,test,dev_log}.md` and `docs/reviews/web-plugin-map-contract-reconcile/20260521-discovery-review.md` must exist and stay docs-only.

## Suggested Checks

```bash
test -f docs/reviews/web-plugin-map-contract-reconcile/20260521-discovery-review.md
test -f packages/web-plugin-map-contract-reconcile/docs/design.md
test -f packages/web-plugin-map-contract-reconcile/docs/api.md
test -f packages/web-plugin-map-contract-reconcile/docs/test.md
test -f packages/web-plugin-map-contract-reconcile/docs/dev_log.md
rg -n "plugin-productivity|plugin-project|plugin-calendar|Web Planning Contract|manifest.windows.web" docs/PLUGIN_MAP.md docs/planning/sub-prds/web/dev-plan.md
rg -n "plugin-todo|plugin-pomodoro|plugin-habits" docs/PLUGIN_MAP.md
```

## Mock Strategy

None. This feature does not introduce or revise runtime mocks.

## Acceptance Criteria

- `docs/PLUGIN_MAP.md` reflects the real Web-relevant package layout.
- `docs/PLUGIN_MAP.md` identifies `plugin-console` as the shared Console package boundary and distinguishes it from the future browser host shell.
- The Web planning anchor no longer claims packages are already Stable or `manifest.windows.web = true` when the repo does not support that statement today.
