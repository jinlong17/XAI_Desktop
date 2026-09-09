# AI-02 B1 — canonical receipt compatibility reader

Commit scope: `@repo/plugin-web-storage` only. This is a staged compatibility change, not a deployable AI-02 completion.

## Delivered

- Added a keyed, result-bearing reader for `xai_task_cols` and `xai_calendar_events`. It distinguishes `absent`, `legacy`, valid `envelope`, `corrupt`, `unsupported`, and `unavailable` physical states.
- Valid envelopes require an own `data` field, safe nonempty bounded receipt identities, nonempty signatures and target IDs, and parseable receipt timestamps. Receipt lookup uses own-property access, including a persisted `__proto__` key.
- `getPref`, `usePref`, and `StorageEvent` retain their domain projection: readers see `data`, never receipt metadata. Raw APIs still return the exact raw bytes.
- Existing synchronous writers and removal now refuse to replace a valid envelope, unknown envelope version, corrupt envelope, or malformed physical JSON. They still write legacy domain data exactly as before. This prevents a compatible reader from turning a bad record into a seed write before the coordinated writer exists.
- The migration validator unwraps only a valid envelope before its owning domain validator runs; unknown/corrupt records remain retained and invalid.

## Explicit boundary

B1 creates no envelope and has no canonical writer, lock, durable command, or migration activation. First envelope activation remains default-closed until the old-tab drain/upgrade/re-entry gate and the B2–D writer integration are implemented and independently accepted. This change therefore cannot be deployed on its own.

The six Astra durable replay cases remain unchanged and still fail as required: create replays duplicate, update overwrites a later ordinary edit, and delete replay loses success for both Tasks and Calendar. Their fresh B1 output is [20260909-b1-durable-baseline.log](20260909-b1-durable-baseline.log).

## Verification

- `pnpm --filter @repo/plugin-web-storage check-types` — PASS.
- `pnpm --filter @repo/plugin-web-storage test` — PASS, 17 files / 136 tests.
- `packages/plugin-web-ai-chat/node_modules/.bin/vitest run --config docs/reviews/web-ai-tool-receipt-astra-review/verify.config.mjs` — expected nonzero: 6 durable replay assertions fail; preserved output linked above.

No package-local lint script exists for `@repo/plugin-web-storage`; root lint was not used because it runs unrelated workspace packages.
