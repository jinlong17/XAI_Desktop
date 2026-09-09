# AI Calendar input validation A1 — author verification

Product module: **web**. Product source fixed by this batch: Calendar AI create/update subscribers and the AI tool registry's Calendar conversion path. This is the approved A1 semantic-validity repair; it does **not** close AI-02, durable replay, cross-reload idempotency, or any release item.

## Defect and contract

The retained pre-fix evidence at `../web-ai-calendar-invalid-date/` (commit `dd10cb8`) proved that real subscriber calls for `2026-02-31` returned `ok: true` and persisted the impossible local date for both create and update.

`isValidCivilDate` now requires an exact four-digit `0001`–`9999` local date and UTC year/month/day round-trip. It therefore rejects invalid month/day combinations and non-leap February 29 without depending on local DST midnight normalization. `setUTCFullYear` avoids the JavaScript constructor's 1900 offset for years `0001`–`0099`.

At the subscriber boundary:

- Create defaults only genuinely omitted `date`, `startTime`, and `durationMin` for legacy callers. Explicit invalid values are rejected; they are never rewritten as today, `09:00`, or a rounded/clamped duration.
- Update validates supplied date, time, and duration before a storage write. Both paths require a finite integer duration of at least five minutes and reject a duration that cannot end by `23:55` on the requested local date.
- Invalid writes return the existing `invalid` receipt and do not enter the success-only page-lifetime request cache. A corrected operation with the same request ID can therefore commit once.
- The AI tool registry no longer turns an explicit Calendar value into a fallback or removes it from an update patch. Confirmation text shows supplied values, while omitted optional create time/duration are shown and committed as the documented `09:00`/60-minute defaults. The subscriber remains the single runtime semantic validator.

## Verification

All checks were run from the repository root against this working-tree source on 2026-09-09.

```sh
pnpm --filter @repo/plugin-web-calendar test
# 48 files passed, 359 tests passed

pnpm --filter @repo/plugin-web-calendar check-types
pnpm --filter @repo/plugin-web-calendar lint
# both passed

pnpm --filter @repo/plugin-web-ai-chat test
pnpm --filter @repo/plugin-web-ai-chat typecheck
pnpm --filter @repo/plugin-web-ai-chat lint
# 32 files passed, 280 tests passed; typecheck and lint passed

node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-ai-calendar-validation-fix/verify.config.mjs
# 1 file, 6 registry-to-subscriber contract cases passed

node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-ai-calendar-invalid-date/verify.config.mjs
# retained original evidence: 2 files/cases passed
```

The targeted subscriber tests exercise the real typed event bus, calendar subscriber hooks, account-scoped Storage adapter and resulting physical storage value. They assert invalid month/day, non-leap February 29, invalid time, non-finite/type/non-integer duration, no write, no request-ID consumption, a valid `2024-02-29` corrected retry, the legal `23:50 + 5 = 23:55` boundary, and rejection instead of cross-day silent clamping. The separate registry-to-subscriber test proves explicit invalid values survive conversion and are rejected as a whole operation, while an omitted optional time/duration reaches the documented defaults.

This is synthetic jsdom integration evidence, not native-browser or independent acceptance. A fixed product commit is required for Sol's independent native validation before any broader AI-02 claim.
