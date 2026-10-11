# B1 canonical removal read-failure correction

A protected canonical key may not treat a failed `getItem` as an absent record. `removePref` now performs a separate, fail-closed pre-removal read only for `xai_task_cols` and `xai_calendar_events`: if that read or scoped physical-key resolution fails, it makes no `removeItem` call. Non-canonical preferences retain their prior removal path.

Regression: the test stores a valid task envelope, makes only its physical-key `getItem` throw `SecurityError`, calls `removePref`, then proves `removeItem` was not invoked for that key and the exact envelope bytes remain after restoring storage access.

Verification:

- `pnpm --filter @repo/plugin-web-storage check-types` — PASS.
- `pnpm --filter @repo/plugin-web-storage test` — PASS, 17 files / 137 tests.

This remains B1 compatibility protection. It does not implement the D-stage coordinated reset/delete semantics.
