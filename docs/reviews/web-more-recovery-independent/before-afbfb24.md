# More actual Settings/Shell baseline

Parent independent host verification for the complete More contract `fc56d5e`, product pinned to `afbfb24d6f7311366b77852eda927d08467478c2`. The immutable git archive includes all production repository aliases, ComposedSettings, Shell registrations, real router, scope/generation and storage hooks. Only reviewer assertions are copied in; third-party dependencies are reused locally. No product hook or departure coordinator is mocked. Named locks are a deterministic fixture, so this is component-host evidence, not native Chrome or production authentication.

`host-reset-before-afbfb24.log` is the current frozen 11-test baseline: **10 correct FAIL, 1 clean PASS**. Initial `host-before-afbfb24.log` contains the first eight assertions (7 FAIL/1 PASS); these overlap and must not be added as unique coverage.

- Window type and both private Default Tag/List controls lose valid latest choices after their exact physical write fails. The private fields are seeded and asserted through real generationKey helpers, not unowned legacy aliases.
- Actual routing escapes More after each of those three failed edits. Mixed device/private unsaved work permits voluntary signout immediately rather than holding the decision.
- Three reset assertions deny physical removal separately for the same device/private fields. Each source already stores the registry default, so displayed equality cannot prove a successful remove. Raw bytes correctly remain; routing nevertheless escapes without a recovery decision.
- The clean positive control permits signout/navigation and does not seed More writes.

All failures occur at business assertions after valid account setup and actual controls are confirmed. Storage failures and React warnings remain in raw logs. Nonzero test status is preserved, not converted to a successful verification exit. Rerun the unchanged assertions on the fixed implementation with a fresh evidence suffix:

```sh
node docs/reviews/web-more-recovery-independent/verify-fixed.mjs <fixed-sha> host <unique-tag>
```

This first host baseline does not cover all15 fields, full reset/queue/export/owner/native gates or all312 audit items. Sol owns the full independent caller matrix; subsequent parent host/native evidence must cover the complete contract before acceptance. No shared reset cancellation requirement beyond the explicit admitted-device continuity in `fc56d5e` is inferred here.
