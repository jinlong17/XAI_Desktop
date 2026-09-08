# web-plugin-map-contract-reconcile — API / Contract Notes

## Runtime API

None. This feature creates no runtime exports, commands, typed events, routes, or manifest changes.

## Contract Impact

| Contract Surface | Impact |
|---|---|
| `docs/PLUGIN_MAP.md` plugin table | Removes stale standalone Web plugin assumptions and registers the real package owners needed by later Web rows |
| `docs/PLUGIN_MAP.md` Web planning contract table | Freezes package identity, dependency authority, and current Web build eligibility semantics under `ADR-0006` |
| `docs/planning/sub-prds/web/dev-plan.md` | Must defer to `docs/PLUGIN_MAP.md` for current package status and stop claiming nonexistent `manifest.windows.web` readiness |

## Canonical Capability Mapping

| Roadmap / capability name | Canonical package owner |
|---|---|
| Todo | `@repo/plugin-productivity` |
| Pomodoro | `@repo/plugin-productivity` |
| Habits | `@repo/plugin-productivity` |
| Labels | `@repo/plugin-labels` |
| Project boards/cards | `@repo/plugin-project` |
| Calendar | `@repo/plugin-calendar` |
| Console shell / module IA | `@repo/plugin-console` |
| Auth / device session / sync account seams | `@repo/plugin-account` |

## Error Semantics

- Docs-only failure mode: later rows depend on stale package names, wrong dependency states, or fake Web readiness assumptions.
- Review should reject this feature if any document still implies:
  - standalone `plugin-todo` / `plugin-pomodoro` / `plugin-habits` packages exist today
  - current manifests already declare `windows.web`
  - `plugin-console` and the future browser host shell are the same package boundary

## Permission / Idempotency Notes

- No browser permission, Tauri capability, Supabase resource, or runtime loader behavior changes here.
- Re-running this feature should only refine documentation truth and leave implementation untouched.
