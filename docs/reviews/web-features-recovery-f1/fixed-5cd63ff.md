# F1 regression and Features F1 fixed reruns at `5cd63ff` (CP-FEATURES-01, batch 26, contract §14 E16 and E17)

**Verdict: PASS (independent verification only).**

| Item | Evidence | Result at `5cd63ff` |
| --- | --- | --- |
| **E16** | The 10 frozen F1 invocations: `verify-f1.mjs` sticky, more and collaborate; `verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro; `verify-f1-race.mjs` race | **10/10 PASS**, exit 0 each, runner hashes unchanged. Every check id and outcome equals the `f359be6` post-repair (`post1`) log: 0 PASS→FAIL |
| **E17** | `verify-f1-features.mjs` mode `features`, plus its `selfcheck` (the receipt's documented companion) | **`verdict=fixed-pass`**, exit 0. r1, d1, r2 and rb are each held, then released with exactly one live `proceed()` from `blocked`, 0 non-live blocker calls, 0 `reset()` calls, 0 runtime errors and no F1 signature. `selfcheck` is `harness-valid` (105/105) |

- **No `PRECONDITION:` line** appears in any of the 12 new logs.
- **No F1 signature anywhere:** none of the logs contains `Invalid blocker state transition`, a `"pass":false` record, a runtime error or a console warning.

This receipt is independent verification only. It is **not acceptance**, and it closes no 312 item: REL-05, REL-07, REL-10, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, SET-03 and D2/REL/AI stay open. The accepted callers' records are neither renewed nor revoked. It adds files only. No product file, runner, fixture, prelude, oracle, existing log, receipt, contract, ledger or control plane was changed. Nothing was pushed, merged, rebased, tagged, deployed, released or synced Web→Desktop.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role mapping, isolated worktree `.claude/worktrees/agent-a35a2025129fe062c`. It did not write the contract, any oracle, the Features implementation, the coordinator repair or any F1 runner, fixture or prelude |
| Requested fixed revision | `5cd63ff` |
| Resolved fixed commit / tree | `5cd63ff652f02a2c726187fe12cbc796218d31c0` / `404bf819a42e20b3e4d372c18a981832ccd54954` |
| Comparison baselines | E16: the frozen post-repair logs `../web-sticky-recovery-f1/f1-f359be6-<mode>-post1.log` (receipt `../web-sticky-recovery-f1/post-f359be6.md`). E17: `f1-f359be6-{selfcheck,features}-before1.log` (receipt `before-f359be6.md`) |
| Docs base (detached HEAD) | `c516fced2ec8c6fb6a8054c6e6858c315fa4b84c`. `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty. Every log records `docsHead=c516fce…` and `productDeltaVsDocsHead: ""` (L2), and its precondition "docs-head product tree equals the revision" passed |
| Product delta `f359be6..5cd63ff` | 11 files, all under `packages/xai-web-settings-features-panel/` (contract §11). The coordinator, `settingsDeparture`, the composition, every other caller, storage and the Shell are unchanged |
| Lockfile gate | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT` (main checkout, read-only) and `git show 5cd63ff:pnpm-lock.yaml`; the Features runner also checks the extracted archive (L2) |
| Runtime | Chrome/154.0.8037.97 headless, protocol 1.3; Node v24.16.0; esbuild 0.28.1; react and react-dom 19.2.0; react-router 7.15.1. Viewport 1280×813 (Sticky F1 runners) and 1280×757 (Features F1 runner). These are the same as in the baselines |
| Network | 127.0.0.1 only (ephemeral port) and Chrome DevTools; the Features runner maps every other host to NOTFOUND |
| Runs | Each mode ran exactly once with suffix `fixed1`, strictly sequentially. There was no environment failure, so no second run exists. Temporary archives and Chrome profiles were placed in the session scratchpad through `XAI_NATIVE_TMPDIR`; the runners deleted them, and no `xai-*` directory or headless Chrome process remained |

## Commands

From the worktree root, on 2026-10-04, in this order:

```sh
export XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop
export XAI_NATIVE_TMPDIR=<session scratchpad>
# E16
node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs 5cd63ff sticky fixed1
node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs 5cd63ff more fixed1
node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs 5cd63ff collaborate fixed1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs 5cd63ff selfcheck fixed1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs 5cd63ff notifications fixed1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs 5cd63ff date-time fixed1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs 5cd63ff smart-lists fixed1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs 5cd63ff header fixed1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs 5cd63ff pomodoro fixed1
node docs/reviews/web-sticky-recovery-f1/verify-f1-race.mjs 5cd63ff race fixed1
# E17 (selfcheck is the companion command documented in before-f359be6.md "E17 (fixed stage)")
node docs/reviews/web-features-recovery-f1/verify-f1-features.mjs 5cd63ff selfcheck fixed1
node docs/reviews/web-features-recovery-f1/verify-f1-features.mjs 5cd63ff features fixed1
```

Console output; each command exited with status 0:

```text
PASS …/f1-5cd63ff-sticky-fixed1.log checks=62 r1:pass d1:pass r2:pass
PASS …/f1-5cd63ff-more-fixed1.log checks=62 r1:pass d1:pass r2:pass
PASS …/f1-5cd63ff-collaborate-fixed1.log checks=62 r1:pass d1:pass r2:pass
PASS …/f1-5cd63ff-selfcheck-fixed1.log verdict=harness-valid checks=31
PASS …/f1-5cd63ff-notifications-fixed1.log verdict=refuted checks=72 r1:pass d1:pass f1:pass
PASS …/f1-5cd63ff-date-time-fixed1.log verdict=refuted checks=72 r1:pass d1:pass f1:pass
PASS …/f1-5cd63ff-smart-lists-fixed1.log verdict=refuted checks=90 r1:pass d1:pass l1:pass f1:pass
PASS …/f1-5cd63ff-header-fixed1.log verdict=refuted checks=98 r1:pass d1:pass f1:pass o1:pass
PASS …/f1-5cd63ff-pomodoro-fixed1.log verdict=refuted checks=78 r1:pass d1:pass f1:pass
PASS …/f1-5cd63ff-race-fixed1.log verdict=pass checks=183 r1:0p/1r(held-with-dialog-for-live-blocker) r2:0p/1r r3:1p/0r(released-on-re-evaluation) r4:1p/0r k:0p/1r k-fresh:0p/1r g1:0p/1r g2:0p/1r g3:0p/0r l:0p/0r
PASS …/web-features-recovery-f1/f1-5cd63ff-selfcheck-fixed1.log verdict=harness-valid checks=105 exit=0 sr:held-released-once sd:held-released-once s2:held-released-once
PASS …/web-features-recovery-f1/f1-5cd63ff-features-fixed1.log verdict=fixed-pass checks=102 exit=0 r1:held-released-once d1:held-released-once r2:held-released-once rb:held-released-once
```

## Frozen integrity (checked before the runs and again after them)

Every SHA-256 below was recomputed and compared with the receipt that froze it. All matched. Every new log also records the runner, fixture and prelude hashes it ran with (L2), and they equal this table and the baseline logs. A pre-run snapshot of all 74 files in the four Features/F1 evidence directories was rechecked after the last run: 74/74 unchanged. `git log --name-status` over those directories shows only `A` entries.

| File | SHA-256 (recomputed = receipt) | Receipt |
| --- | --- | --- |
| `../web-sticky-recovery-f1/f1-prelude.js` | `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670` | `impact-review.md` §8, `before-callers-210abdf.md` §4, `post-f359be6.md` §2, `before-f359be6.md` (this directory). The Features runner also checks it against its frozen constant and against the blob at HEAD (`frozenPrelude`, L2, last commit `0ba68d7`) |
| `../web-sticky-recovery-f1/f1-host.tsx` | `af969a73dc25a88fd8399883a5cb8321b6613ec3729c2164a92d8c1d4518f734` | `impact-review.md` §8 |
| `../web-sticky-recovery-f1/verify-f1.mjs` | `816bd261a6bb6d72ad36322a898678a7f1f8d62173ca40f0f9d4cdf44f44c527` | `impact-review.md` §8 |
| `../web-sticky-recovery-f1/verify-f1-callers.mjs` | `88ccca3ddd7a99107f1dbec8ec87a18bc49e28ab3a245d19e4de688dc60314d1` | `before-callers-210abdf.md` §4 |
| `../web-sticky-recovery-f1/f1-callers-host.tsx` | `e636ffdb1eb0caa04e6c40507fb0dedefaf3c12a440be4db27067f9f196c0458` | `before-callers-210abdf.md` §4 |
| `../web-sticky-recovery-f1/verify-f1-race.mjs` | `3d009ac0b5b1f329f13c351a92a945d6b894a284f06018452a2aa44cbbb6bf18` | `post-f359be6.md` §4 |
| `../web-sticky-recovery-f1/f1-race-host.tsx` | `3937baecba2810e0e22dfc11a0c3f7a1f288202d59ca95a8032f3430440d5382` | `post-f359be6.md` §4 |
| `verify-f1-features.mjs` | `d0ac8c68823bded7d8f4aae4012c6be48d07d489cc168de8f271a5e752afd537` | `before-f359be6.md` |
| `f1-features-host.tsx` | `18272ac012ca878009b9311d6888d388e455b5250e5cd90a2904c55b5c17747b` | `before-f359be6.md` |
| the 10 baseline `f1-f359be6-*-post1.log` | equal to `post-f359be6.md` §4 (`11644bb9…`, `ed816119…`, `c38f3df8…`, `b112bf1f…`, `e2b04c6b…`, `8e0e64c8…`, `9c814f77…`, `e3bff9a4…`, `ad06ea3e…`, `7a046296…`) | `post-f359be6.md` |
| `f1-f359be6-selfcheck-before1.log`, `f1-f359be6-features-before1.log` | `b68d9a25af48051b49b3b01241267c01e4a42917f2f8005bef4b6d3974b42673`, `59f9761abbaccc18c44464779034aa9d6ff0d6ce89bc89d4457a825f127db98e` | `before-f359be6.md` |

The frozen `210abdf` before-reproduction logs (`s1`, `m1`, `c1`, `sc1/sc2`, `n1/n2`, `t1/t2`, `l1/l2`, `h1/h2`, `p1`) also match their receipts. They were not used as comparison baselines; the `f359be6` post-repair logs are the right baseline for E16.

## New logs

Each line of a log is one JSON record. The result record is the last line.

| Log | Records | SHA-256 | Checks | Verdict |
| --- | --- | --- | --- | --- |
| `../web-sticky-recovery-f1/f1-5cd63ff-sticky-fixed1.log` | 68 | `433e56ae89d7994ce5c686f3f88c1c59ed37b9e2bd8396db222658bdece1862b` | 62 (44 precondition, 18 product) | PASS |
| `../web-sticky-recovery-f1/f1-5cd63ff-more-fixed1.log` | 68 | `cc33feaf449fa1cbbaf8321b6503202e1beadb413e06cc93013535e8869c1468` | 62 (44, 18) | PASS |
| `../web-sticky-recovery-f1/f1-5cd63ff-collaborate-fixed1.log` | 68 | `025c32ddca1f8915a211cbfc5ae60b806a883c584c7886ad3e399c9a5cb5fc6f` | 62 (44, 18) | PASS |
| `../web-sticky-recovery-f1/f1-5cd63ff-selfcheck-fixed1.log` | 34 | `98273138ad79b392c8e9850fc04023349aa966016c7c8cf34577e111c9821971` | 31 (31 precondition) | harness-valid |
| `../web-sticky-recovery-f1/f1-5cd63ff-notifications-fixed1.log` | 78 | `6b047bf5576ac187da098de464763073c679ac7f724fc33b1e42a9db0a80cee9` | 72 (51, 21) | refuted |
| `../web-sticky-recovery-f1/f1-5cd63ff-date-time-fixed1.log` | 78 | `f8856baef4d7402ea3db692978034846eb5bd071d688bd5d9b9fa8e87bb9e710` | 72 (51, 21) | refuted |
| `../web-sticky-recovery-f1/f1-5cd63ff-smart-lists-fixed1.log` | 97 | `8dda3d50d3758dd363e7ce015087caf9a10712b09bf8f8dfe224d48c3422eb36` | 90 (62, 28) | refuted |
| `../web-sticky-recovery-f1/f1-5cd63ff-header-fixed1.log` | 105 | `d8a174b870632b63060f7c54632e61fe74ee33f48ecdd9e0dae34efe20452c3d` | 98 (70, 28) | refuted |
| `../web-sticky-recovery-f1/f1-5cd63ff-pomodoro-fixed1.log` | 84 | `3392bbb8f59eeb11f52202ae1f01276b501b1b3c6a6b48a19d484e667dcd6a15` | 78 (57, 21) | refuted |
| `../web-sticky-recovery-f1/f1-5cd63ff-race-fixed1.log` | 199 | `dfed2d12257a4d7473766778c01f8cb9beb3b44e80620e5e0308d1adf036e0d5` | 183 (89 precondition, 90 product, 4 harness notes) | pass |
| `f1-5cd63ff-selfcheck-fixed1.log` | 114 | `15e1841586c0bae4bb565fcfd7b887210adcaad5242ce5623d7fb713762c52a2` | 105 (105 precondition) | harness-valid |
| `f1-5cd63ff-features-fixed1.log` | 113 | `5bdbb3d9a2ebf45337dd3cc2eec38e1f6895116b078b4d848359ca38d5b21215` | 102 (65 precondition, 37 product) | **fixed-pass** |

## E16: the 10 frozen F1 invocations, `f359be6` (`post1`) → `5cd63ff` (`fixed1`)

Checks were compared position by position. In all 10 modes the fixed log has exactly the same check-id sequence as `post1`, and every check passes in both.

| Mode | Checks `post1` → `fixed1` | Transitions | Cases (proceeds per case) | Runtime errors / console warnings | Result |
| --- | --- | --- | --- | --- | --- |
| sticky | 62 → 62 | 62 PASS→PASS | r1, d1, r2: 1 / 1 / 1 | 0 / 0 | PASS |
| more | 62 → 62 | 62 PASS→PASS | r1, d1, r2: 1 / 1 / 1 | 0 / 0 | PASS |
| collaborate | 62 → 62 | 62 PASS→PASS | r1, d1, r2: 1 / 1 / 1 | 0 / 0 | PASS |
| selfcheck | 31 → 31 | 31 PASS→PASS | — | 0 / 0 | harness-valid |
| notifications | 72 → 72 | 72 PASS→PASS | r1, d1, f1: 1 / 1 / 1 | 0 / 0 | refuted |
| date-time | 72 → 72 | 72 PASS→PASS | r1, d1, f1: 1 / 1 / 1 | 0 / 0 | refuted |
| smart-lists | 90 → 90 | 90 PASS→PASS | r1, d1, l1, f1: 1 / 1 / 1 / 1 | 0 / 0 | refuted |
| header | 98 → 98 | 98 PASS→PASS | r1, d1, f1, o1: 1 / 1 / 1 / 1 | 0 / 0 | refuted |
| pomodoro | 78 → 78 | 78 PASS→PASS | r1, d1, f1: 1 / 1 / 1 | 0 / 0 | refuted |
| race | 183 → 183 | 183 PASS→PASS | proceed / reset, as before: r1 0/1 (#3), r2 0/1 (#5), r3 1/0 (#7), r4 1/0 (#10), k 0/1 (#12), k-fresh 0/1 (#13), g1 0/1 (#14), g2 0/1 (#15), g3 0/0, l 0/0 (#16); every case 0 non-live and 0 throws | 0 / 0 | pass; 4/4 harness notes; `harnessGaps: []` |

- **Every caller release passes.** In each `proceed()` timeline entry, the blocker id equals the router's live blocker and that blocker's state is `blocked` (0 non-live entries).
  - `verify-f1.mjs`: `blocker-proceed-exactly-once-from-blocked` and `zero-runtime-errors-no-error-boundary` pass for r1, d1 and r2 in all three modes.
  - Registrant modes: the F1 oracle #6, `no-blocker-call-from-non-live-snapshot`, passes in every case (3, 3, 4, 4 and 3 cases for notifications, date-time, smart-lists, header and pomodoro). These modes report `deferredFailures: []`, `f1Cases: []` and a passing `discardControl` d1.
- **No case regressed.** Every case that passed at `post1` passes again.
- **Before-FAILs.** None: the F1 failures turned PASS at `f359be6` (`post-f359be6.md` §5).
- **The race check reproduces the repaired behavior.** Each case has the same scenario, blocker ids, proceed and reset counts, outcomes and dialog transitions as `post1`.

### Product hashes and bundles (the expected Features delta)

- **Recorded product hashes are unchanged.**
  - `verify-f1.mjs` records 9 files: the coordinator, the composition, `settingsDeparture`, the More, Collaborate and Sticky panes, `usePrefAsync`, `prefMutation` and the Shell.
  - `verify-f1-callers.mjs` records 17: the coordinator, the composition, `settingsDeparture`, the dashboard, pomodoro and shell registrations, the Notifications, Date & Time and Smart Lists panes, `DashHeader`, `DashboardModule`, `PomodoroModule`, `usePreferenceDepartureRecovery`, `usePrefAsync`, `usePrefAutosaveAsync`, `prefMutation` and the Shell.
  - `verify-f1-race.mjs` records 9.
  - All of these hashes equal the `post1` values. None of these runners records a Features file, so no recorded product hash differs.
- **The bundles differ.** The F1 hosts bundle the production ComposedSettings, which registers every Settings pane, including Features. The JS and CSS bundles therefore change with the Features implementation:

  | Runner | JS bundle `post1` → `fixed1` |
  | --- | --- |
  | `verify-f1.mjs` | `8ecd089a…` → `0af7f735b6d5224934284fe29fd3412efd843f064b4ffab9d3270ab71fdcc66c` |
  | `verify-f1-callers.mjs` | `415079d6…` → `47a9d099cf6ea30e0c83800da05ec8313b93939a9df7a960dfaf3b2a372a2373` |
  | `verify-f1-race.mjs` | `749f5b69…` → `1ec44056c6841d487dca00e0f04e83136eb4d947e0e520525751944aba8eb2cc` |

  - The CSS bundle changes from `4253982f…` to `5501917e864492542e8fa6b16077bc258767423fe1d28629a484157d806633bb` in all 10 logs.
  - Bundle inputs go from 629 (559 archive, 69 third-party, 0 foreign) to 631 (561, 69, 0).
- **Why this is the expected Features delta, not a behavior change.** The only product difference between `f359be6` and `5cd63ff` is the 11 Features files. The +2 archive inputs are the two new internal helpers `featuresRecovery.ts` and `featuresRecoveryCopy.ts`, which `FeaturesPane.tsx` now imports; the CSS change is the scoped Features `styles.css`. The guarded callers' code is byte-identical, and their check sequences and outcomes are unchanged.

## E17: Features F1 mode, `f359be6` (`before1`) → `5cd63ff` (`fixed1`)

| Case | Failure injected (precondition, fixed log) | `before1` at `f359be6` | `fixed1` at `5cd63ff` |
| --- | --- | --- | --- |
| r1 (Retry-released Back) | Boards `setItem` denied, bytes unchanged (L18–L19) | not held: no dialog, left to `/app/settings/about`, 0 blocker calls, 0 `proceed()` | **held and released once.** L20 `Boards was not saved.` / `Retry Boards`. L23–L24 held with the `Unsaved Features draft` dialog; URL and location restored. L25 commit observer saw the live `blocked` blocker. L29–L30 location deep-equal P, exactly one `POP` commit, 0 push/replace. L31 one `set` of the latest `false`. L32 one `proceed` on blocker #2 = live #2 `blocked`. L33 0 console errors, error UI or CDP errors |
| d1 (discard control) | same (L40–L41) | not held, same facts | **held and released once** (L42–L55): released by "Discard local changes and leave"; 0 set/remove attempts (L53); one live `proceed` on #4 (L54); 0 runtime errors (L55) |
| r2 (repeat of r1) | same (L62–L63) | not held, same facts | **held and released once** (L64–L77): one `set` of `true` (L75); one live `proceed` on #6 (L76); 0 runtime errors (L77) |
| rb (reset-batch-released Back) | Calendar and Habits seeded `false` (L82–L83); "Reset to defaults" confirmed through the real dialog with `Turn all 8 modules back on? This only changes which modules are shown; your data is kept.` (L87); both `removeItem` calls denied, bytes unchanged (L88–L89) | not held; 1 `key:null` StorageEvent; no failure feedback or Retry | **held, then a two-step release.** L90 `Calendar was not reset to its default.` / `Retry Calendar` and the Habits equivalents; L91 0 `key:null` dispatches. L93–L95 held with the `Unsaved Features draft` dialog. L99 after "Retry Calendar" the departure **keeps holding**: dialog open, location S, 0 commits, 0 blocker calls, 0 history writes. L103–L104 after "Retry Habits", location deep-equal P with exactly one `POP` commit. L105 one successful `remove` of each key, both absent. L106 one live `proceed` on #8. L107 0 runtime errors |

- **Run result** (L113): `verdict: "fixed-pass"`, `checks: 102`, `deferredFailures: []`, `runtimeErrors: 0`, `consoleWarnings: 0`. `before1` had 1 console warning, the legacy `localStorage is unavailable …` notice.
- **Per case** (outcomes in L113): `held: true`, `proceeds: 1`, `nonLiveBlockerCalls: 0`, `f1Signature: false`. There is no `reset()` call on any blocker.
- **Return to S.** After each case an unguarded Forward returned to S, and the pane remounted clean: L36, L58, L80, L110.
- **Check transitions** (the oracle defines more checks once a departure is held):
  - 8 FAIL→PASS: `r1`, `d1`, `r2` and `rb` × `failure-feedback-and-retry-offered` and `back-held-dialog-open-url-restored`. These were the expected before-state deferred failures.
  - 50 PASS→PASS, all preconditions.
  - 44 checks first reached on the held branch (29 product, 15 precondition), all PASS.
  - 0 PASS→FAIL; no check id from `before1` is missing and no check changed kind.
  - Totals: `before1` had 58 checks (50 preconditions passed, 8 product checks deferred-failed); `fixed1` has 102 (65 preconditions, 37 product), all PASS.
- **Recorded product hashes (12 files).** Only `FeaturesPane.tsx` (`987c3825…` → `54a3f10c…`) and `internal/featuresPane.tsx` (`14053daa…` → `572bdd47…`) differ, which is the expected Features implementation delta. The other 10 are identical to `before1`: the coordinator `0844a697…`, the composition, `settingsDeparture`, `settingsPaneComposition`, `SettingsFooter` `afecc734…`, `stickyPane`, `usePref`, `usePrefAsync`, `prefMutation` and the Shell.
- **Bundle.** JS `23295298…` → `3c20d659a6b99bde0ad6748cc117f025963a5a80b24ee9f59868633b368a1686`; CSS `ca5ccb28…` → `f9af8db2a5f62a941fdbb5b7af3633cf8c0a3b05369ae6e91e3f38d85d00ade7`. Inputs went from 629/559 to 631/561 (69 third-party, 0 foreign). The guard loaded 560 archive modules, up from 558, with 0 violations.

**`selfcheck` (harness validity at the fixed revision):**
- 105/105 checks (all preconditions) PASS→PASS against `before1`, with the same id sequence.
- The Features surface is present and hit-testable: 8 switches and "Reset to defaults".
- The Sticky positive controls sr, sd and s2 are each held and released with exactly one live `proceed()` and 0 non-live calls.
- 0 runtime errors and 0 console warnings.

## Observations

1. **Stale coordinator commits** (a committed `blocked` snapshot while the live blocker is already `proceeding`) still occur. They are recorded, not asserted, as in the frozen runners. Their counts vary slightly with scheduling: more d1 2→1, race r4 2→1, Features `selfcheck` sd 1→2; every other case is equal. No stale commit produced a blocker call.
2. **No non-passing case**, so no first assertion is reported.

## Limitations

- **Environment.** Headless Chrome 154 on macOS, not Tauri. Development builds without the production `StrictMode` wrapper, `import.meta.env` defined as `{}`, synthetic accounts and EN only (contract §15 retained exclusions).
- **Hosts.** The F1 hosts mount Shell plus ComposedSettings with a synthetic active account. They have no `AccountDataGate` and no App readers. Production-App effects of the reset are Sol `downstream` (E7) and native E13.
- **Coverage.**
  - Back only for the Features mode. Forward, the AppRail departure of row m and the guarded Forward rows are E12.
  - One run per mode. F1 depends on scheduling, so one passing run cannot prove its absence. The sensitivity rests on the frozen blocker wrappers, the commit observer and CDP error capture, which caught F1 in batches 10–11.
  - The race harness has no frozen before-run at `210abdf` (see `post-f359be6.md` §9).
- **Script clicks.** The race r1, r3 and g1 inputs are script-dispatched, as frozen. All other inputs are trusted CDP input after a centre hit-test.
- **Dependencies** are reused read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
- **Out of scope.** E9–E15 and E18–E25 are not covered here.
