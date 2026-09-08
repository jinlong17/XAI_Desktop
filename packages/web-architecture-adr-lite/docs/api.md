# web-architecture-adr-lite — API / Contract Notes

## Runtime API

None. This feature adds no runtime exports, commands, typed events, routes, or Repository implementation.

## Contract Impact

| Contract | Impact |
|---|---|
| `docs/adr/0003-three-faces-architecture.md` | Narrowed for the Web face by `ADR-0006` |
| `docs/planning/sub-prds/web/PRD.md` | Web reuse language must follow `ADR-0006` |
| `docs/planning/sub-prds/console/PRD.md` | Remains the UI truth source for shared Web module behavior |
| `@repo/core` / `@repo/core-data` stable contracts | No direct change; explicitly designated as shared Web contracts |
| Sync / crypto / device session contracts | No direct change in this slice; explicitly frozen as shared cross-face boundaries |

## Error Semantics

Not applicable. This is a docs-only ADR feature.

## Permission / Idempotency Notes

- No Tauri capability, browser permission, OAuth setting, or Supabase resource is modified here.
- Re-running this feature should only refine the ADR or adjacent references; it must remain docs-only.
