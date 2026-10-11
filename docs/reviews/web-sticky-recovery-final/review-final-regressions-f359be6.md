# Sticky final regression receipt

The product is pinned at `f359be6d838393e0f9e93efd80b88b5b09f6144e`. That is the Sticky fixed candidate `210abdf` plus the shared coordinator F1 repair.

This receipt executes the "Final regression" row of Sticky contract §13 (`../web-sticky-recovery-contract/contract.md`). It is control-plane batch 16 of CP-STICKY-01, module `web`.

**It is the regression gate only.** It is not the final acceptance (batch 17) and it changes no caller state. It closes no 312 item: SET-12, REL-05, QA-01/03/04/09 and D2 stay open.

**Verifier.** An independent parent-role final-regression verifier (Claude Opus 5.5). It did not author the Sticky caller, the coordinator repair, the contract or any suite run here.

**Scope of changes.** Only new evidence files were added. No product code, runner, oracle, existing log, ledger, contract or control-plane file was modified.

## Verdict

**PASS.** All 14 runner invocations exited 0 on their first run, so no environment rerun was needed. Every gate reproduces its historical count, apart from two expected increases explained below. No product failure, regression or F1 signature was observed, so nothing was frozen and no repair window is requested.

| Gate (contract §13) | Runner and mode | `f359be6` (this run) | `7b216a3` final-regression receipt | Delta |
| --- | --- | --- | --- | --- |
| Settings-rest package | Astra `package` | 44 files / 314 tests PASS | 43 / 300 | +1 file / +14 tests (Sticky §11 test file) |
| Settings-rest typecheck / lint | `verify-final.mjs` | PASS / PASS | PASS / PASS | none |
| Web package | `verify-final.mjs` `web-test` | 28 files / 156 tests PASS | 27 / 146 | +1 file / +10 tests (coordinator repair test) |
| Web check-types / lint | `verify-final.mjs` | PASS / PASS | PASS / PASS | none |
| Storage check-types | `verify-final.mjs` | PASS | PASS | none |
| Accepted More: Sol 79 | More Sol `fields`, `reset`, `queues`, `boundaries`, `owner-export` | 79/79 (22 + 20 + 14 + 10 + 13) | Not in that receipt, because More was the caller under test. Accepted Sol run at `7b216a3`: 79/79 (`*-final1-7b216a3.log`) | none |
| Accepted More: product suite | More Sol `original` | 15/15 | Not in that receipt. 15/15 at `7b216a3` (`original-final1-7b216a3.log`) | none |
| Accepted More: frozen host | More independent `host` | 11/11 | Not in that receipt. 11/11 at `7b216a3` (`host-control-plane-20260917-7b216a3.log`) | none |
| Notifications Sol | Notifications Sol `''` (all modes) | 41/41 (product 11 + independent 30) | 41/41 | none |
| Notifications Astra boundaries | Astra `boundaries` | 24/24 | 24/24 | none |
| Notifications Astra host | Astra `host` | 15/15 | 15/15 | none |
| Notifications parent original host | parent `host` | 12/12 | 12/12 | none |
| Date & Time caller | Astra `datetime` | 7/7 | 7/7 | none |

In total, 674 test executions passed and 5 static gates passed.

The Settings-rest package run includes `morePane.test.tsx` (15) and `notificationsPane.test.tsx` (11). These are the same files as the More and Notifications `original` modes. They are duplicate executions, not extra coverage.

### Count changes against `7b216a3`, explained

The per-file `✓ <file> (N tests)` lines of the old and new logs were compared.

**Settings-rest: 43 / 300 → 44 / 314.**
- The only difference is the new `packages/plugin-web-settings-rest/src/__tests__/stickyPaneRecovery.test.tsx` (14 tests). It is a contract §11 Sticky file added at `210abdf`.
- The other 43 files have identical per-file counts, including:
  - `stickyPane.test.tsx`: 10 (ST1–ST10);
  - `morePane.test.tsx`: 15;
  - `notificationsPane.test.tsx`: 11;
  - `dateTimePane.test.tsx`: 8.
- 300 + 14 = 314. This equals the batch-14 gate at `f359be6` (`../web-sticky-recovery-f1/pkg-f359be6-settings-rest-test.log`).

**Web: 27 / 146 → 28 / 156.**
- The only difference is the new `apps/web/src/routes/modules/__tests__/departureCoordinator.blocker.test.tsx` (10 tests), added by the F1 repair in `f359be6`.
- The other 27 files have identical per-file counts.
- 146 + 10 = 156. This equals the batch-14 gate (`../web-sticky-recovery-f1/pkg-f359be6-web-test.log`).

**All other gates** have unchanged counts. Two of them also match earlier `f359be6` reruns:
- Notifications Astra host 15 and parent host 12 match the batch-14 `host-f1post1-f359be6.log` runs.
- More Sol 79, original 15 and frozen host 11 are the first runs of these suites on `f359be6`. They match the accepted `7b216a3` logs.

## Fixed-boundary proof

**Sticky and coordinator delta.** `git diff --name-status 2023526 f359be6 -- apps packages package.json pnpm-lock.yaml` lists exactly 10 files.

The 8 Sticky §11 files (`2023526..210abdf`, exactly these 8):

- `M packages/plugin-web-settings-rest/src/panes/stickyPane.tsx`
- `M packages/plugin-web-settings-rest/src/internal/StickyColorPalette.tsx`
- `M packages/plugin-web-settings-rest/src/__tests__/stickyPane.test.tsx`
- `A packages/plugin-web-settings-rest/src/__tests__/stickyPaneRecovery.test.tsx`
- `M packages/plugin-web-settings-rest/src/styles.css`
- `M packages/plugin-web-settings-rest/src/internal/localI18n.ts`
- `M packages/plugin-web-settings-rest/docs/api.md`
- `M packages/plugin-web-settings-rest/docs/test.md`

The coordinator and its new test (`210abdf..f359be6`, only these 2):

- `M apps/web/src/routes/modules/departureCoordinator.tsx`
- `A apps/web/src/routes/modules/__tests__/departureCoordinator.blocker.test.tsx`

**Accepted callers and shared code are unchanged since `7b216a3`.** The following command exits 0:

```sh
git diff --quiet 7b216a3 f359be6 -- \
  packages/plugin-web-settings-rest/src/panes/morePane.tsx \
  packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx \
  packages/plugin-web-settings-rest/src/panes/dateTimePane.tsx \
  packages/plugin-web-settings-rest/src/types.ts \
  packages/plugin-web-settings-rest/src/index.ts \
  packages/plugin-web-settings-rest/package.json \
  packages/plugin-web-storage packages/plugin-web-settings-shell \
  package.json pnpm-lock.yaml
```

- The following are therefore byte-identical to the accepted `7b216a3` product:
  - the accepted More, Notifications and Date & Time panes;
  - the shared storage package `plugin-web-storage`, which holds the hook, engine, registry, account ownership, codec and legacy `usePref`;
  - the Settings shell `plugin-web-settings-shell`.
- In `apps`, `7b216a3..f359be6` changes only the coordinator and its new test.
- The rest of `7b216a3..f359be6` is the 10 files above plus three unrelated Calendar/Meditation test-setup files (`7b216a3..2023526`). These were already recorded in the `7b216a3` receipt.

**Stylesheet.** `styles.css` changed by +42/−0 lines in `2023526..f359be6`.
- Every added rule's selector starts with `.sticky-recovery-field`, `.sticky-recovery-text`, `.sticky-recovery-actions` or `.sticky-recovery-saved`. Their descendant parts (`button`, `p`, `> span`) sit under those prefixes. This includes the rules inside the new `@media (min-width: 768px)` block.
- This is an additive, Sticky-scoped change, not a shared or unscoped one. The §13 clause that requires other callers' native visual modes is therefore not triggered by the stylesheet.

**Shared delta.** `departureCoordinator.tsx` is a shared delta. §13 requires "impacted engine, hook and caller reruns plus fresh acceptance" for it.
- The storage engine and hook are unchanged (above).
- The impacted-caller reruns are `3ea0310` and `f3a3c82`, outside this receipt.
- Fresh acceptance is batch 17.
- This batch adds one fact. Three host suites run here render the production `composedSettingsRegistration.children[0].render` from `apps/web/src/routes/modules/composedSettingsRegistration.tsx`: More host 11, Notifications Astra host 15 and parent host 12. At `f359be6`, that render wraps the Settings shell in `<DepartureCoordinator>`, imported from the repaired `departureCoordinator.js`. These unchanged suites therefore ran against the repaired coordinator, and they passed.

## Runner and oracle invariance

All runners were used as they are, with no edits.

| Check | Files | Result |
| --- | --- | --- |
| `git diff --quiet 7b9ef87 HEAD --` | `web-more-recovery-final/verify-final.mjs`; the Notifications Sol runner, fixture and five oracles; the Astra runner, fixture, `boundaries.test.tsx` and `host.test.tsx`; the parent runner and `host.test.tsx` | exit 0 (`7b9ef87` recorded the `7b216a3` final regression) |
| `git diff --quiet 8e12334 HEAD --` | the More Sol runner, fixture and five oracles | exit 0 (`8e12334` produced the accepted `final1` logs) |
| `git diff --quiet fe08254 HEAD --` | the More independent runner and `host.test.tsx` | exit 0 (`fe08254` produced the accepted 11/11 log) |
| `git diff --quiet 7b216a3 f359be6 --` | `docs/reviews/web-date-time-recovery-astra/caller-boundaries.test.tsx` (the Date & Time oracle, read from the archive) | exit 0 |

How each runner works:
- It extracts `git archive f359be6` into a temporary directory and copies the reviewer oracles from this checkout.
- It runs Vitest there, refuses to overwrite an existing log, and records `revision=f359be6` with the resolved full SHA.
- All 24 logs record `fixed_commit=f359be6d838393e0f9e93efd80b88b5b09f6144e`.
- The Vitest version is v3.2.7, as in the `7b216a3` logs.

## Environment

**Worktree.**
- Isolated worktree `.claude/worktrees/agent-a3328ae01ad83a309`, detached at control-plane commit `463c2abd095371c0a6ce931d9e5dce4938e4f0fb`.
- It was clean before the runs, and `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` was empty.

**Dependencies.**
- `pnpm install --frozen-lockfile --offline` in the worktree exited 0. Its output is git-ignored, and no manifest in the root, `apps/*` or `packages/*` declares an install lifecycle script.
- `pnpm-lock.yaml` has SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` in the worktree before and after install, and in `git show f359be6:pnpm-lock.yaml`.
- All runners used here are the older type that link `node_modules` from the worktree root. None of them reads `XAI_DEPS_ROOT`.
- The main checkout and the other worktrees were not used.

**Tools and timing.**
- Node v24.16.0, pnpm 9.0.0 and Vitest 3.2.7 (jsdom), on macOS (Darwin 27.0.0).
- The runs were sequential, from 2026-10-03 23:25 to 23:30 PDT (2026-10-04 06:25–06:30 UTC).

## Reproduction

Run these exact commands from the worktree root, in this order:

```sh
pnpm install --frozen-lockfile --offline
node docs/reviews/web-more-recovery-final/verify-final.mjs f359be6 sticky-final-v1
node docs/reviews/web-notifications-recovery-astra/verify-fixed.mjs f359be6 package sticky-final-v1
node docs/reviews/web-more-recovery-sol/verify-fixed.mjs f359be6 fields sticky-final-v1
node docs/reviews/web-more-recovery-sol/verify-fixed.mjs f359be6 reset sticky-final-v1
node docs/reviews/web-more-recovery-sol/verify-fixed.mjs f359be6 queues sticky-final-v1
node docs/reviews/web-more-recovery-sol/verify-fixed.mjs f359be6 boundaries sticky-final-v1
node docs/reviews/web-more-recovery-sol/verify-fixed.mjs f359be6 owner-export sticky-final-v1
node docs/reviews/web-more-recovery-sol/verify-fixed.mjs f359be6 original sticky-final-v1
node docs/reviews/web-more-recovery-independent/verify-fixed.mjs f359be6 host sticky-final-v1
node docs/reviews/web-notifications-recovery-sol/verify-fixed.mjs f359be6 '' sticky-final-v1
node docs/reviews/web-notifications-recovery-astra/verify-fixed.mjs f359be6 boundaries sticky-final-v1
node docs/reviews/web-notifications-recovery-astra/verify-fixed.mjs f359be6 host sticky-final-v1
node docs/reviews/web-notifications-recovery-independent/verify-fixed.mjs f359be6 host sticky-final-v1
node docs/reviews/web-notifications-recovery-astra/verify-fixed.mjs f359be6 datetime sticky-final-v1
```

Every invocation exited 0.

`verify-final.mjs` has no Settings-rest package-test step. As in the `7b216a3` receipt, that gate comes from the Astra runner's `package` mode (`packages/plugin-web-settings-rest/src/__tests__/**/*.test.{ts,tsx}`). `verify-final.mjs` contains no More-specific expectation, so it was usable unchanged.

## Evidence (all exit 0)

Paths are relative to `docs/reviews/`.

Package and static gates:

| Log | Result | SHA-256 |
| --- | --- | --- |
| `web-more-recovery-final/settings-typecheck-sticky-final-v1-f359be6.log` | PASS (`tsc --noEmit`, no diagnostics) | `783616f24a2c8b60f980b03fa7bd4780cab3bc77827429938a9ed1ef1627f786` |
| `web-more-recovery-final/settings-lint-sticky-final-v1-f359be6.log` | PASS (`eslint --max-warnings 0`) | `d371c65fdc162205d9367fd990b5966154b068a4beb2826bbeb5986536536c89` |
| `web-more-recovery-final/web-check-types-sticky-final-v1-f359be6.log` | PASS | `8475cbd38517b5867fc2f6e0b2e91a035fd3bc6dfc281855ea8e4e4aec5950bf` |
| `web-more-recovery-final/web-test-sticky-final-v1-f359be6.log` | 28 / 156 | `901bc99e3cf41ac7285e6408e0b9dce105860df9186e62dcf742a3052722cbdb` |
| `web-more-recovery-final/web-lint-sticky-final-v1-f359be6.log` | PASS | `bb1366491719bbb4be4ca77f6d3179bf9f646a8a990974717ef3f6a7937ecf74` |
| `web-more-recovery-final/storage-check-types-sticky-final-v1-f359be6.log` | PASS | `b43e6b54d301790890cf3b0c4de9e1b8134af9e276cb8b8044fba10f3f2b5cf4` |
| `web-notifications-recovery-astra/package-sticky-final-v1-f359be6.log` | 44 / 314 | `d32f45bb390157a7827a880bd5dadd3026ce494ae61c543b81b0426fd22ba614` |

Accepted More:

| Log | Tests | SHA-256 |
| --- | ---: | --- |
| `web-more-recovery-sol/fields-sticky-final-v1-f359be6.log` | 22 | `507c5254eb95c2e058675774e37f1bfdce9b0a1f6f00973f790ae75a92573daa` |
| `web-more-recovery-sol/reset-sticky-final-v1-f359be6.log` | 20 | `d326bc9281415c7dcedb359f69ca6b6938e132cc0586499d42cffc979d9312ab` |
| `web-more-recovery-sol/queues-sticky-final-v1-f359be6.log` | 14 | `90f1ae424a624b42b6133a2caac167941c979c7db498074b242ca1d3896d233f` |
| `web-more-recovery-sol/boundaries-sticky-final-v1-f359be6.log` | 10 | `ce688dd7c404d664f6fb08e365dec10eed42a104e66bcee9a40f46b7ca70bb05` |
| `web-more-recovery-sol/owner-export-sticky-final-v1-f359be6.log` | 13 | `f596560b654fbe6d5aca543ee9b0702a6dfa33ce229f590404dc4fc95fb45d59` |
| `web-more-recovery-sol/original-sticky-final-v1-f359be6.log` | 15 | `ddf638b464303f04109aae63a3ba339cd21d34a9a06f8b9e14f7d2ee3d2d7b62` |
| `web-more-recovery-independent/host-sticky-final-v1-f359be6.log` | 11 | `bad00c8b82c03183ba5da0d27dc3a2742f200ea07f3f90b788d5ffd4ccc5b1c7` |

Notifications and Date & Time:

| Log | Tests | SHA-256 |
| --- | ---: | --- |
| `web-notifications-recovery-sol/core-sticky-final-v1-f359be6.log` | 11 | `b9461a3dca829f96c8ca8a00efc9476f44a4356435224d00fb38c8ba04ac5369` |
| `web-notifications-recovery-sol/recovery-sticky-final-v1-f359be6.log` | 3 | `e85c5916fbc9d559d49a2e8c7a9af90193443c48e01320508beb40f9a0350874` |
| `web-notifications-recovery-sol/operations-sticky-final-v1-f359be6.log` | 2 | `f9bbe2972e1483090ec1ef01a2b6503542005881bf2e388cb249ba69c74bd450` |
| `web-notifications-recovery-sol/boundaries-sticky-final-v1-f359be6.log` | 4 | `5cab7c4cc1f325cc59ae1bc1d8fd63c7491feb6072d5cacf06be168409f57f9d` |
| `web-notifications-recovery-sol/extended-sticky-final-v1-f359be6.log` | 10 | `c826d6fbcae93dfceddd4a6a92236738703591cb00f7b6a1fef441b56abf7a07` |
| `web-notifications-recovery-sol/original-sticky-final-v1-f359be6.log` | 11 | `1dd7bc31946974c0bf6d2981202aa2a206859312b3bd793db675f0ebb1ef58e3` |
| `web-notifications-recovery-astra/boundaries-sticky-final-v1-f359be6.log` | 24 | `983ea49eb71739d344a941b5f5c5d54a0cc431f566e0ca9b9ce68aae584f4a87` |
| `web-notifications-recovery-astra/host-sticky-final-v1-f359be6.log` | 15 | `57166dc4ac8c6378ff1268489054008f9cedd4dd3f3cc4d92005b78156a5ceb3` |
| `web-notifications-recovery-independent/host-sticky-final-v1-f359be6.log` | 12 | `78dfff1b7b2f85837212de82289b1c7874809ba353673cceeab14a120f84eb3c` |
| `web-notifications-recovery-astra/datetime-sticky-final-v1-f359be6.log` | 7 | `b43909f4d4a073bdf7e30e6b9a094237bf024f6922acd7b8d011a5e72fc93461` |

The precedent logs hash to the values printed in `../web-more-recovery-final/review-final-regressions-7b216a3.md` and `../web-more-recovery-independent/fixed-7b216a3.md`. The historical evidence used for comparison is therefore intact.

## Output scan

**stderr matches history.**
- The 24 logs contain 61 stderr blocks in total.
- The caller-suite logs contain 58 of them and the Settings-rest package log contains 1. All 59 are React `act(...)` warnings: 42 from `MorePaneContent` and 17 from `NotificationsPaneContent`.
- The other 2 are the build-manifest skip notices in the web test log (`BM-BUNDLE-1/2 SKIPPED`).
- In every affected log, the stderr blocks name the same tests, in the same number, as the corresponding `7b216a3` log:
  - More Sol `reset` 18, `queues` 3, `boundaries` 8, `owner-export` 13;
  - Notifications Sol 2/2/1/8/1;
  - Astra `boundaries` 2;
  - `package` 1;
  - `web-test` 2.
- Every other new log has zero stderr blocks, as at `7b216a3`.

**No F1 signature.** None of the 24 logs contains any of the following:
- `Invalid blocker state transition`;
- a `DepartureCoordinator` error line;
- `Unhandled`;
- `PRECONDITION:`;
- `"pass":false`;
- a `FAIL` or `×` line.

## Unknowns, frozen failures, limitations

**Unknowns.** None. Every listed gate ran and produced a result.

**Frozen failures.** None.

**Limitations.**
- All suites here are jsdom or component-host evidence. No native Chrome, Tauri, disk-download or visual run is part of this row. The Sticky native, host and visual gates are separate §13 rows, evidenced in `bc92561`, `019f451`, `3ea0310` and `98125c5`.
- Each runner ran once. Timing-dependent defects such as F1 cannot be excluded absolutely by a single pass.
- No other caller's native visual mode was rerun. The stylesheet delta is Sticky-scoped, and the coordinator repair is logic-only, so §13 does not require it here. The coordinator diff `210abdf..f359be6` was checked: no added or removed line touches a JSX element, `className`, `style` or a stylesheet reference. Its only `<…>` matches are TypeScript generics.
- This receipt does not decide the "fresh acceptance" of the shared coordinator delta. That decision belongs to the batch-17 reviewer.

## Remaining boundary

CP-STICKY-01 stays `verification_pending` until an independent final reviewer (batch 17) reconciles all six §13 rows against:
- the source;
- the correct before failures;
- fixed independent behavior;
- the actual user surface.

That review also owes the shared-delta fresh-acceptance conclusion for `f359be6`.

A future caller acceptance would still not establish any of the following:
- SET-12 business completion;
- REL-05;
- the QA items;
- full D2/REL/AI;
- deployment or release;
- Web→Desktop sync.
