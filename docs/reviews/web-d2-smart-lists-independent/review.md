# Smart Lists: fixed actual settings baseline

Parent immutable archive `3b02e2a`, real smartListsPane render with synthetic complete account markers and named native-signature lock fixture. [Original four](contracts.test.tsx), [runner](verify-fixed.mjs), [before](independent-before-3b02e2a.log).

Three expected failures and one control pass: actual first row writes its account map while the account-exclusive lock is held, likewise while its physical-key lock is held, and quota loses the latest two row choices with no recovery alert. The held-lock tests retain unknown string extension fields in their success check; quota test requires an actual Retry and combined latest map after repair, but cannot reach Retry on the failing legacy baseline.

Absence is already correct: all twelve registered-map missing-row fallbacks show `show` without mount seeding. Preserve this compatibility control, including assigned/wont_do missing entries; do not replace the existing registry empty map with a different default on migration.

These are four parent component assertions, not full schema/account migration/12-producer/native acceptance. Astra owns the complete next-caller contract. No global gate is closed.

## Fixed caller40ffbe1

The original four now PASS unchanged: [after](independent-after-40ffbe1.log). Full account/schema/12-producer acceptance remains the separate Astra contract review.
