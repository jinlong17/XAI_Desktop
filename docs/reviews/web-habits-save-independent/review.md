# Habits save recovery — independent acceptance

Product scope: Web Habits REL05 consumer only. Author implementation `45a2a06`; independent responsive defect corrected by parent in `0b16605`. Final fixed full snapshot: `0b166054fecb51aa143edfddc88c1345a4955332`.

## Result

**PASS for this mounted-page save-recovery consumer after the responsive follow-up. This does not close all REL05.** The verifier did not modify product code. All workspace packages were bundled from an isolated Git archive; native Chrome 152 used temporary profiles and synthetic local data. No production account, server, or user profile was accessed.

## Independent native checks

The same complete functional sequence ran at 390, 768, 1024 and 1440 CSS pixels. These repeated executions are not four independent feature coverage totals.

- Add habit under native Storage quota failure retains dialog and original bytes; editing both titles updates the real downloaded JSON file. Native Escape retains the failed dialog. Retry commits one new habit, selects its actual id and closes only after success.
- Diary onChange does not prematurely save; attempting habit navigation flushes and observes the failed write. Habit, next-month, Stats and Add navigation cannot replace the unresolved draft. Further typing is present in a real downloaded JSON file, with the correct habit id. Retry persists that latest text.
- A failed check-in preserves bytes and emits zero recorded events. Successful retry emits exactly one event.
- A native blur/focusout save failure retains dirty diary text after an external storage event. Retry refuses to overwrite the externally changed raw baseline.
- Keeping the old A component mounted while activating B makes old retry/export refuse: B bytes remain unchanged, A external bytes remain unchanged, no download file is created, and export failure is visible.
- Actual token/layout/module styles are loaded in product order. Recovery controls are all 44px high. Geometry verifies recovery above content and nonoverlapping list/detail in single-column and desktop layouts.

Downloads are actual Chrome downloads to an isolated directory, read and parsed from disk. The download is not suppressed and this is not merely a Blob inspection. Fixtures use actual React HabitsModule, accountScope and native Storage; they do not exercise the complete authenticated host router. UI controls are operated through native DOM events/click methods plus native Escape; no claim of full pointer/accessibility audit is made.

## Correct failure, preserved

`20260909-functional.log` records functional behavior before the independent geometry assertion. It must not be read as visual acceptance. `20260909-mobile-before.log`, `20260909-mobile-before-terminal.log` and `390px-diary-recovery.png` preserve the correct failure at `45a2a06`: list bottom 418.77 while detail top 224.02. The recovery row turned a single-column grid into three items while the explicit two-row template compressed the list; list content overlapped detail. Parent confirmed the screenshot and fixed CSS.

After `0b16605`, the unchanged nonoverlap requirement passes: at 390 list bottom 907.77 and detail top 919.77; at 768/1024 list bottom 877.77 and detail top 891.77. At 1440 both columns start at 172.02, below recovery bottom 154.02, with list right 552 and detail left 570. Separate after logs and screenshots preserve each width. 390 and 1440 screenshots were visually inspected: readable recovery controls, stacked mobile content and retained desktop columns.

## Reproduction

```sh
# Before: desired geometric assertion fails after functional assertions run.
HABIT_REF=45a2a06 HABIT_LOG=rerun-before.log HABIT_SCREENSHOT=rerun-before.png node docs/reviews/web-habits-save-independent/verify-native.mjs
# After: repeat widths 390, 768, 1024, 1440.
HABIT_REF=0b16605 HABIT_WIDTH=390 HABIT_LOG=rerun-after.log HABIT_SCREENSHOT=rerun-after.png node docs/reviews/web-habits-save-independent/verify-native.mjs
```

## Remaining boundaries

Uncommitted draft recovery is in memory; closing the browser, a crash, or navigating away through the host shell can lose it. These remain separate durability/navigation work, not silently accepted here. Native storage-event baseline checks are not an atomic cross-tab transaction. Initial corrupt-schema handling, reminders, Habits statistics/frequency semantics, all other REL05 consumers, production deployment and cross-tool workflow gates are not closed by this report. The B transition deliberately retains the old component to test stale handlers; real login/logout is not simulated. The current browser date is used for today/month fixtures; this is not a clock/DST verification.
