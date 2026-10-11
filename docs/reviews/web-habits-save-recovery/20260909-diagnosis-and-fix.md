# REL05 Habits consumer batch — author diagnosis and verification

Web scope: Habits only. No Calendar, Time Tracker, shared auth/storage, Matrix or master audit ledger changes. Author verification is not independent acceptance and does not close REL05.

## Before: actual business failures

The existing `usePersistedHabits` public setter was typed void. `handleToggle` emitted a check-in event regardless of failed persistence. `handleAddHabit` selected the proposed id and closed the dialog unconditionally; AddHabitDialog itself also closed/reset before the caller could report failure. DiaryCard persisted on blur without observing the result and overwrote its local text on habit/month/value change.

`20260909-before.log` records native Chrome, actual HabitsModule and native Storage quota failure:

- Diary error absent; switching habit and returning lost the unsaved diary.
- One false success event followed a failed check-in.
- Failed add removed the dialog and draft.
- Original stored bytes remained unchanged. Correct business-oracle result: `pass:false`.

## Implemented behavior

- Boolean save results reach add, check-in and diary callers. New-habit fields remain in the native dialog; only a successful commit advances selection/closes/reset. Failure has retry, latest-field export and explicit discard. Escape/backdrop do not silently discard failed input.
- Check-in recovery retains its proposed change and emits exactly once only after confirmed persistence. A different operation cannot replace an unresolved pending change.
- Diary remains a per-habit/per-month blur-save feature. The first input captures the persisted baseline; later input updates the latest recoverable draft without writing every keystroke. Failed diary persistence blocks local habit/month/view/add navigation until retry or explicit discard. Navigation also flushes an unsubmitted diary first.
- Cross-tab updates do not replace dirty textarea text. A stale first-edit/retry baseline cannot overwrite newer bytes. Discard resets the textarea to persisted data and unlocks navigation.
- Recovery and export retain the captured account. A late A draft cannot be written/exported under B. Exports include current editor fields or latest diary text plus pending/raw recovery data; export failures are visible.
- Error controls are inside the add dialog or occupy a full-width recovery row in the module. Styles use tokens and 44px controls.

## Verification

Full package: 22 files / 132 tests passing; check-types and lint pass. Six new fault regressions cover add fields/retry, event ordering, diary navigation retention, external dirty-draft conflict, A/B isolation and explicit discard. Existing product tests remain intact.

`20260909-after.log` retains the original oracle fields, now passing. Additional real Chrome checks cover latest habit and diary export Blob content, successful retry without duplicates, check-in event ordering, newer external bytes, and A/B rejection. The harness uses actual native dialogs/Storage with synthetic data and a temporary browser profile. Generated export bytes are inspected; the final download click is suppressed to keep all files in the fixture. Token/layout/module CSS is present; this is functional fault acceptance, not a complete visual audit.

Reproduce:

```sh
node docs/reviews/web-habits-save-recovery/verify-native-habits.mjs
pnpm --filter @repo/plugin-web-habits test
```

## Explicit boundaries

Draft recovery is in memory. Closing the browser, navigating out through the host shell or crashing can still lose uncommitted drafts; no cross-reload journal or import is introduced. Synchronous baseline comparison is not cross-tab atomicity and cannot eliminate a write arriving between compare and setItem. Existing seed-on-empty/corrupt fallback remains the earlier product contract; this batch does not close REL07 data-validation/initialization issues. Habit frequency/statistics/reminder execution and other REL05 consumers are unchanged. No production account/service or real user profile was used.
