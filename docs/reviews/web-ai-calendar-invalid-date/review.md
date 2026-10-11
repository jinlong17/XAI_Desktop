# Calendar AI civil-date validation diagnosis

Actual create/update subscribers at daff8ef, typed event bus, account-scoped Storage; no mocked business writer or provider call. The correct contract is that a nonexistent calendar date must not be committed/reported as success.

Both original business assertions FAIL: create and update with 2026-02-31 each emit exactly one receipt whose ok is true. The test expected false. Setup includes a valid existing event for update; this is not a missing-subscriber or bad-fixture failure.

Source explanation: DATE_RE checks day1–31 without month/leap-year validation. Date.parse can normalize February31 into March, so the finite timestamp check does not reject it. createEvent/updateEvent then persist the original invalid local date string. This defect was latent before receipt work; adding a success receipt does not establish semantic validity.

Reproduce: node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-ai-calendar-invalid-date/verify.config.mjs

Astra must classify and assign the repair. Recommended acceptance: invalid day/month combinations and nonleap February29 rejected; valid leap February29 preserved; invalid input does not consume the request id, so correction can retry; original data and receipts unchanged on rejected mutation. Consider consistent validation at tool input and subscriber boundaries. No product edits in this diagnosis, no complete AI-02 closure.
