# rls-fuzz-property — API

This row introduces no runtime API.

## Test Entrypoints

- `pnpm --filter web test:rls-fuzz`
- `pnpm --filter web check-types`

## Script

`apps/web/package.json` exposes:

```json
"test:rls-fuzz": "vitest run supabase/tests/rls-fuzz-property.test.ts"
```
