# AppRail order recovery: fixed reruns E7, E8, E15, E16, E17 at `f9eb4b1` (CP-APPRAIL-01, batch 60)

**Verdict: PASS for all five items (independent verification only).**

| Item | Evidence | Result at `f9eb4b1` | Verdict |
| --- | --- | --- | --- |
| **E7** | The frozen Sol runner `verify-fixed.mjs` and its eight oracle files, all eight §12 modes | `bytes` 26/26, `domain` 31/31, `merge` 21/21, `drag` 18/18, `field` 24/24, `continuity-export` 22/22, `host` 33/33, `original` 123/123 (121 + the two new `Topbar.test.tsx` cases TP-RAIL-1 and TP-RAIL-2). Exit 0 for each mode. Harness 6/6 per Sol mode, 12/12 for `original` | **PASS** |
| **E8** | The frozen parent host runner, `host-fixture.tsx` and `host.test.tsx` | **31/31**, `vitest_exit=0`, harness 6/6, `runtime_error_lines=0` | **PASS** |
| **E15** | The 12 frozen F1 invocations | **12/12 PASS**, exit 0 each. Runner hashes unchanged. The check id, kind and outcome sequence of every run equals its `419e56d` `appearance-final-v1` baseline. Zero `Invalid blocker state transition` | **PASS** |
| **E16** | The rail F1-shape runner `verify-f1-railorder.mjs`, unchanged | `selfcheck` **harness-valid** (165/165). `railorder` **`verdict=fixed-pass`** (104/104): f1, f2 and f3 all `fixed-pass`; each released exactly once by the mechanism the controller's reading requires; zero non-live blocker calls; zero runtime errors | **PASS** |
| **E17** | The K-1 copy `verify-f1-appearance-k1.mjs` | `selfcheck` **harness-valid** (135/135). `appearance` **`verdict=fixed-pass`** (123/123): a1–a4 all `fixed-pass`, F1 signature 0 | **PASS** |

- **`PRECONDITION` total: 0.** No Sol or parent jsdom log has a `PRECONDITION` case line (`precondition_failures=0` in all nine), and no F1 log has a failed precondition check (0 of 1,544 F1 check lines failed).
- **Per-case transitions (§4).**
  - Sol modes other than `original`, against the authoritative before logs (and `before1` too where a `before2` exists): **129 FAIL→PASS and 46 PASS→PASS, with 0 PASS→FAIL and 0 FAIL→FAIL**. Every before FAIL became a PASS, and every before PASS (fixtures and positive controls) stayed a PASS.
  - `original`: 121 PASS→PASS under the same name, plus 2 new cases (absent→PASS). No case was removed or renamed.
  - E8 against `host-before1-419e56d.log`: **24 FAIL→PASS and 7 PASS→PASS, with 0 PASS→FAIL**.
  - E16 `railorder` against `f1-419e56d-railorder-before1.log`: the same 104 check ids in the same order. Exactly the four deferred product checks that failed at `419e56d` now pass, and nothing else changed.
- **No copy was used.** No frozen runner refused, so the precondition-copy procedure was not needed.
- **Iterations.** One run per unit (suffix `apprail-fixed1`), and no diagnostic iteration. There were no development probes.

This receipt is independent verification only. It is **not acceptance**, and it closes no 312 item. It adds files only: 25 logs and this receipt. No product file, runner, fixture, prelude, oracle, corrected copy, existing log, receipt, contract, ledger or control plane was changed. Nothing was pushed, merged, rebased, branched, tagged, deployed, released or synced Web→Desktop. No subagent was spawned. No dev server or preview tool was started. Every server was started by the runners inside their own temporary directories.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role (batch 60), isolated worktree `.claude/worktrees/agent-a2cd493d3841b7693`. It is not the author of the contract, of batches 55–59 or of the Terra implementation, and it did not write any oracle or harness |
| Docs base (detached HEAD) | `dac8cd3ff4d916392051519699577eff084c42e4`, the control-plane commit that registers batch 60. It was fetched from `origin/codex/web/full-product-audit-20260908`, and `git status` was clean before the runs. Every Sol and parent log records `runner_checkout_head=dac8cd3…`, and every F1 log records `docsHead: dac8cd3…` |
| Requested fixed revision | `f9eb4b1` |
| Resolved fixed commit / tree | `f9eb4b1f207bc4b46f547b90afc250424b3c8695` / `05887cf113639116b228a25041a37b3d5c69a322`. Package trees: `xai-web-shell` `4ea3eb5bc1048055e7870fa2a1c01e889aab8cb8`, `apps/web` `61ddf71751eaa9f1a456897ecb7fbe23e708be4b`, Appearance `1fea1045…` and Features `3f25c84b…`, both unchanged from `419e56d` |
| Before revision | `419e56de9f23e4467fea806fbd4a990e1f429941`, tree `7aabbd832be446aeca1441eff34f2fd35945290a` |
| Product delta `419e56d..f9eb4b1` | `git diff --name-only 419e56d f9eb4b1 -- apps packages package.json pnpm-lock.yaml` lists 19 files, the E6 §11 set. `package.json` and `pnpm-lock.yaml` are unchanged |
| Product delta `f9eb4b1..dac8cd3` | `git diff --name-only f9eb4b1 dac8cd3 -- apps packages package.json pnpm-lock.yaml` is empty. Every F1 log records `productDeltaVsDocsHead: ""` and passes its docs-head product-tree precondition |
| Contract | r1 `f7726d7`, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`. This hash was re-derived here, and the rail F1 runner checks it again in `baseline:contract-r1-hash` |
| Lockfile gate | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`. Every log records this value for `XAI_DEPS_ROOT` (the main checkout, read only) and for `git show f9eb4b1:pnpm-lock.yaml`. The Sol, parent, Features F1, K-1 and rail F1 logs also record it for the extracted archive. The Sol, parent, K-1 and rail F1 logs also check it against the contract gate constant |
| `@repo` pin | **Sol and parent runners.** 75 exact-match aliases and the guard plugin; 448 third-party and 281 workspace links; 46 tsconfig `extends` checked, none unresolved. Every log has `pin_unaliased_repo_imports=0` and `pin_required_provenance_missing=none`. Module counts: each of the seven Sol business modes 630 (625 at `419e56d`), `original` 55 (shell run) and 633 (`apps/web` run) (50 and 628 at `419e56d`); parent host 632. **F1 runners.** Every `@repo` specifier is pinned to the archive, with 0 foreign bundle inputs and 0 guard violations |
| Runtime | Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, TypeScript 5.9.2, Node v24.16.0, darwin-arm64, tz America/Los_Angeles. Chrome/155.0.8059.39 headless, protocol 1.3, esbuild 0.28.1, react and react-dom 19.2.0, react-router 7.15.1 |
| Runs | 2026-10-09, roughly 10:40–11:35 UTC, strictly sequential, one run per unit. There was no environment failure and no rerun |

## 2. Commands

From the worktree root, in this order. `XAI_DEPS_ROOT` is the main checkout, used read only: nothing was installed, built, written or started there. `XAI_NATIVE_TMPDIR` is a folder in the session scratchpad outside the repository, used only by the Chrome runners. `XAI_F1_EVIDENCE_DIR` was not set, so each F1 runner wrote into its own directory.

```sh
DEPS=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop
# E7: the eight Sol modes, one invocation each
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-apprail-order-recovery-sol/verify-fixed.mjs f9eb4b1 <mode> apprail-fixed1
#   <mode> = bytes, domain, merge, drag, field, continuity-export, host, original
# E8
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-apprail-order-recovery-independent/verify-fixed.mjs f9eb4b1 host apprail-fixed1
# E15
XAI_DEPS_ROOT=$DEPS XAI_NATIVE_TMPDIR=<scratch> node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs f9eb4b1 <sticky|more|collaborate> apprail-fixed1
XAI_DEPS_ROOT=$DEPS XAI_NATIVE_TMPDIR=<scratch> node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs f9eb4b1 <selfcheck|notifications|date-time|smart-lists|header|pomodoro> apprail-fixed1
XAI_DEPS_ROOT=$DEPS XAI_NATIVE_TMPDIR=<scratch> node docs/reviews/web-sticky-recovery-f1/verify-f1-race.mjs f9eb4b1 race apprail-fixed1
XAI_DEPS_ROOT=$DEPS XAI_NATIVE_TMPDIR=<scratch> node docs/reviews/web-features-recovery-f1/verify-f1-features.mjs f9eb4b1 <selfcheck|features> apprail-fixed1
# E16
XAI_DEPS_ROOT=$DEPS XAI_NATIVE_TMPDIR=<scratch> node docs/reviews/web-apprail-order-recovery-f1/verify-f1-railorder.mjs f9eb4b1 <selfcheck|railorder> apprail-fixed1
# E17 (K-1 copy)
XAI_DEPS_ROOT=$DEPS XAI_NATIVE_TMPDIR=<scratch> node docs/reviews/web-native-keyinput-k1/verify-f1-appearance-k1.mjs f9eb4b1 <selfcheck|appearance> apprail-fixed1
```

Console summaries and exit codes:

```text
bytes f9eb4b1 (f9eb4b1f207b): harness=PASS exit=0 cases=26 passed=26 failed=0 precondition=0                 exit 0
domain f9eb4b1 (f9eb4b1f207b): harness=PASS exit=0 cases=31 passed=31 failed=0 precondition=0                exit 0
merge f9eb4b1 (f9eb4b1f207b): harness=PASS exit=0 cases=21 passed=21 failed=0 precondition=0                 exit 0
drag f9eb4b1 (f9eb4b1f207b): harness=PASS exit=0 cases=18 passed=18 failed=0 precondition=0                  exit 0
field f9eb4b1 (f9eb4b1f207b): harness=PASS exit=0 cases=24 passed=24 failed=0 precondition=0                 exit 0
continuity-export f9eb4b1 (f9eb4b1f207b): harness=PASS exit=0 cases=22 passed=22 failed=0 precondition=0     exit 0
host f9eb4b1 (f9eb4b1f207b): harness=PASS exit=0 cases=33 passed=33 failed=0 precondition=0                  exit 0
original f9eb4b1 (f9eb4b1f207b): harness=PASS exit=0 cases=123 passed=123 failed=0 precondition=0            exit 0
host f9eb4b1 (f9eb4b1f207b): vitest_exit=0 harness=PASS exit=0 cases=31 passed=31 failed=0 precondition=0    exit 0
PASS …/f1-f9eb4b1-sticky-apprail-fixed1.log checks=62 r1:pass d1:pass r2:pass                                exit 0
PASS …/f1-f9eb4b1-more-apprail-fixed1.log checks=62 r1:pass d1:pass r2:pass                                  exit 0
PASS …/f1-f9eb4b1-collaborate-apprail-fixed1.log checks=62 r1:pass d1:pass r2:pass                           exit 0
PASS …/f1-f9eb4b1-selfcheck-apprail-fixed1.log verdict=harness-valid checks=31                               exit 0
PASS …/f1-f9eb4b1-notifications-apprail-fixed1.log verdict=refuted checks=72 r1:pass d1:pass f1:pass         exit 0
PASS …/f1-f9eb4b1-date-time-apprail-fixed1.log verdict=refuted checks=72 r1:pass d1:pass f1:pass             exit 0
PASS …/f1-f9eb4b1-smart-lists-apprail-fixed1.log verdict=refuted checks=90 r1:pass d1:pass l1:pass f1:pass   exit 0
PASS …/f1-f9eb4b1-header-apprail-fixed1.log verdict=refuted checks=98 r1:pass d1:pass f1:pass o1:pass        exit 0
PASS …/f1-f9eb4b1-pomodoro-apprail-fixed1.log verdict=refuted checks=78 r1:pass d1:pass f1:pass              exit 0
PASS …/f1-f9eb4b1-race-apprail-fixed1.log verdict=pass checks=183 r1:0p/1r(held-with-dialog-for-live-blocker) r2:0p/1r r3:1p/0r(released-on-re-evaluation) r4:1p/0r k:0p/1r k-fresh:0p/1r g1:0p/1r g2:0p/1r g3:0p/0r l:0p/0r   exit 0
PASS …/f1-f9eb4b1-selfcheck-apprail-fixed1.log verdict=harness-valid checks=105 exit=0 sr:held-released-once sd:held-released-once s2:held-released-once   exit 0
PASS …/f1-f9eb4b1-features-apprail-fixed1.log verdict=fixed-pass checks=102 exit=0 r1:held-released-once d1:held-released-once r2:held-released-once rb:held-released-once   exit 0
PASS …/f1-f9eb4b1-selfcheck-apprail-fixed1.log verdict=harness-valid checks=165 exit=0 pc1-sidebar-release:held pc2-back-release:held pc3-signout-held-stay:held pc4-signout-proceeds:- pc5-trusted-rail-drag:- pc6-rail-click-release:held   exit 0
PASS …/f1-f9eb4b1-railorder-apprail-fixed1.log verdict=fixed-pass checks=104 exit=0 f1:fixed-pass f2:fixed-pass f3:fixed-pass   exit 0
PASS …/f1-f9eb4b1-selfcheck-apprail-fixed1.log verdict=harness-valid checks=135 exit=0 pc1-sidebar-release:held pc2-back-release:held pc3-signout-held-stay:held pc4-signout-proceeds:-   exit 0
PASS …/f1-f9eb4b1-appearance-apprail-fixed1.log verdict=fixed-pass checks=123 exit=0 a1:fixed-pass a2:fixed-pass a3:fixed-pass a4:fixed-pass   exit 0
```

## 3. Frozen inputs: hashes recomputed before the runs

Every hash was recomputed with `shasum -a 256` before the first run, and each matches its freezing receipt. The runs also record these hashes in their log headers, and those recorded values match too.

| File | SHA-256 | Receipt it matches |
| --- | --- | --- |
| `web-apprail-order-recovery-sol/verify-fixed.mjs` | `e944cb226e3fa342727c913547ff5084e0ad38fad5293ed306cb512bf9f5a4e8` | Sol README |
| `…-sol/fixture.tsx` | `07c4f87674e5a14d7cbeffc4cd8ae18d0c9d725cfe052ce45b55fb631720c236` | Sol README |
| `…-sol/bytes.test.tsx` | `d4827472827f284178944dd621198a39d7b7ffc34be19781714e61f91103d6cd` | Sol README |
| `…-sol/domain.test.tsx` | `f7b55802a73251b6eb1b0f0cb0d3d39d798fdb9ff7c472ee4b57a5abca4cea0a` | Sol README |
| `…-sol/merge.test.tsx` | `05f6e01081156e2d32076606f2b4f314f33246d6b96b0ab7ffa644a9de8d377a` | Sol README |
| `…-sol/drag.test.tsx` | `4be85f28b053eeed2606e8118641c7ffd93b1a078ce298c3343facfc3fd23063` | Sol README |
| `…-sol/field.test.tsx` | `21e7b77f7135bb1debe446f48bafdc9f3f4a3a5b1796084094bbac140f995846` | Sol README |
| `…-sol/continuity-export.test.tsx` | `b92790b3f989e66b5e3b549995c58abcaee88d5acb700e7f2c31af577f5dd5fc` | Sol README |
| `…-sol/host.test.tsx` | `b89a4f6e2ebc12cf4a4952b17deb6ea7c793818198ad16562610f63ec47a4b03` | Sol README |
| `web-apprail-order-recovery-independent/verify-fixed.mjs` | `646bf047a4634ce48100505fef0a351536864f2d4a3e23019215b7e5060618a8` | Independent README |
| `…-independent/host-fixture.tsx` | `314e239146364ab291ecd6666aeca2b48afa6b41011d678339eb59f154800af6` | Independent README |
| `…-independent/host.test.tsx` | `11e660998c5421e8b6f7b77b82db30543dad273ce5eab9c541ed0ae23e33b719` | Independent README |
| `web-apprail-order-recovery-f1/verify-f1-railorder.mjs` | `6385b6488c668c72d7743a692d91a991cdc276ebd0608a08d57524599a257789` | `before-419e56d.md` §2 |
| `…-f1/f1-railorder-host.tsx` | `fb6a8eb2e494cdc52d8354f3f321f04f113c4841506a8a5af45d27996dbafb7b` | `before-419e56d.md` §2 |
| `web-sticky-recovery-f1/verify-f1.mjs` | `816bd261a6bb6d72ad36322a898678a7f1f8d62173ca40f0f9d4cdf44f44c527` | Appearance final regression §2.1 |
| `web-sticky-recovery-f1/verify-f1-callers.mjs` | `88ccca3ddd7a99107f1dbec8ec87a18bc49e28ab3a245d19e4de688dc60314d1` | Appearance final regression §2.1 |
| `web-sticky-recovery-f1/verify-f1-race.mjs` | `3d009ac0b5b1f329f13c351a92a945d6b894a284f06018452a2aa44cbbb6bf18` | Appearance final regression §2.1 |
| `web-sticky-recovery-f1/f1-prelude.js` (frozen prelude) | `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670` | `before-419e56d.md` §1 |
| `web-features-recovery-f1/verify-f1-features.mjs` | `d0ac8c68823bded7d8f4aae4012c6be48d07d489cc168de8f271a5e752afd537` | Appearance final regression §2.1 |
| `web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (K-1 copy) | `e9fbc5905fbace2c5716190baf7e93fd2295bb890b663cb7fd7c90ca2115896d` | Appearance final regression §2.1 |

**Where each log records them.**
- All eight Sol fixed logs carry one identical `oracle_sha256` line, which equals the table above and the `before2` headers.
- The parent log's `oracle_sha256` line records `host-fixture.tsx`, `host.test.tsx` and `verify-fixed.mjs` exactly as in the table.
- The F1 logs record `runnerSha256`, or `fileSha256` for the Features, K-1 and rail runners, equal to the table.

**Archive source hashes.**
- The parent runner reports `archive_file_sha256 (6/13 equal the contract r1 source table)`. The 7 files that differ are exactly the §11 files that Terra changed: `AppRail.tsx`, `Topbar.tsx`, `Shell.tsx`, shell `types.ts`, shell `index.ts`, `Topbar.test.tsx` and `App.tsx`.
- The 6 that match are `internal/dnd.ts`, `registry.tsx`, `AppRail.test.tsx`, storage `registry.ts`, `layout.css` and `departureCoordinator.tsx`.
- The runner records this comparison and does not gate on it.
- The Sol logs record the same archive hashes. For example, `AppRail.tsx` is `fe789078…` and `App.tsx` is `f644e78e…`.

## 4. E7: Sol fixed reruns (8 modes)

| Mode | Before (authoritative) | Fixed `apprail-fixed1` | `PRECONDITION` | Harness | Exit | FAIL→PASS | PASS→PASS | PASS→FAIL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `bytes` | 21/26 (`before1`) | **26/26** | 0 | 6/6 | 0 | 5 | 21 | 0 |
| `domain` | 1/31 (`before2`; `before1` identical) | **31/31** | 0 | 6/6 | 0 | 30 | 1 | 0 |
| `merge` | 4/21 (`before2`; `before1` identical) | **21/21** | 0 | 6/6 | 0 | 17 | 4 | 0 |
| `drag` | 8/18 (`before2`; `before1` identical) | **18/18** | 0 | 6/6 | 0 | 10 | 8 | 0 |
| `field` | 1/24 (`before2`; `before1` identical) | **24/24** | 0 | 6/6 | 0 | 23 | 1 | 0 |
| `continuity-export` | 4/22 (`before1`) | **22/22** | 0 | 6/6 | 0 | 18 | 4 | 0 |
| `host` | 7/33 (`before2`; `before1` identical) | **33/33** | 0 | 6/6 | 0 | 26 | 7 | 0 |
| **Subtotal** | 46/175 | **175/175** | 0 | — | — | **129** | **46** | **0** |
| `original` | 121/121 (`before1`) | **123/123** (shell 78, `apps/web` 45) | 0 | 12/12 | 0 | — | 121 | 0 |

- **Matching.** Cases are matched by their full case name. Every case name in every before log is present in its fixed log, so no case vanished.
  - For the five modes with two before iterations, `before1` and `before2` agree on every case (the "FAIL/FAIL" and "PASS/PASS" columns in §8), as the Sol README states.
  - No log reports a suite error, an unhandled error or an unhandled rejection: `suite_errors=0` and `unhandled_error_lines=0` in every run line.
- **H1–H10 are all repaired at the Sol layer, and the H11 control still passes.**
  - **H1:** `domain` 002–008, the not-iterable values at load on three routes.
  - **H2:** `field`, the latest dropped order kept after each failure kind.
  - **H3 and H4:** `drag`, one write at the drop and zero on dragover; a cancel reverts with zero writes.
  - **H5:** `bytes` 019–023 and `merge`, indices kept for hidden, non-rail and unknown ids.
  - **H6:** `field`, the held real lock.
  - **H7, H8 and H10:** `domain`, the source status with Reload only.
  - **H9:** `host`, the status, `beforeunload` and the sign-out step.
  - **H11:** `bytes` 025.
- **Fixtures and positive controls stayed PASS.** These are the seven F-B002 self-checks, the injector, the lock fixture, the App composition, the drag driver, the merge model, and the P6 byte controls (`bytes` 015–018).
- **D1 ruling (dragenter accepts only; the next dragover moves the preview).** It is consistent with the frozen jsdom driver. `drag` 18/18 passes, and so do the two-step and click-suppression cases, under the frozen driver that fires dragEnter then dragOver on the button displayed at the hovered slot.
- **`original` = 123 = 121 + 2.** The two new cases are the only additions. They come from the 25 added lines (0 deleted) of `packages/xai-web-shell/src/__tests__/Topbar.test.tsx`:
  1. case 059 `[shell-tests] Topbar TP-RAIL-1 — railOrderStatus renders immediately after appearanceStatus and before the appearance popover`, PASS;
  2. case 060 `[shell-tests] Topbar TP-RAIL-2 — without railOrderStatus (or when it renders nothing) the Topbar outerHTML is unchanged`, PASS.

  All 121 `419e56d` cases PASS under unchanged names. This includes `AppRail.test.tsx` 25, which is unchanged (`cbe41791…`), and AR5 "drag-reorder: onDragStart sets dragging class". The shell run has 78 cases (76 + 2), and `apps/web` has 45, the same as before.

## 5. E8: parent host fixed rerun

`host-apprail-fixed1-f9eb4b1.log`: cases 31, passed 31, failed 0, `precondition_failures=0`, `suite_errors=0`, `unhandled_error_lines=0`, `runtime_error_lines=0`. Harness 6/6. `pin_unaliased_repo_imports=0`, `pin_required_provenance_missing=none`, 632 archive modules. FX3 records `network:0`.

Compared case by case with `host-before1-419e56d.log`: **24 FAIL→PASS and 7 PASS→PASS, with 0 PASS→FAIL**. The table is in §8.
- **The 24 cases that were FAIL now PASS.** At `419e56d` each stopped at its first business assertion; now every later assertion in them runs and passes too:
  - **H2:** 008 and 009.
  - **H9 route cases:** 010–015. Navigation is not held, and the rail status is shown on the destination with the draft intact.
  - **H9 unload:** 016 and 017. The rail draft alone warns.
  - **H9 sign-out:** 018–027 in both branches. The confirm list is `[rail]` or `[rail, Appearance]`, with the rail step first. Cancel keeps the identity. OK then Cancel discards the rail draft with zero writes and keeps the Appearance draft.
  - **H1:** 028–031. There is no route boundary, and the display is D(DEFAULT, R) with the source status.
- **The 7 controls stayed PASS:** FX1–FX3, PC, PC2 and the two PC3 cases.

## 6. E15: the 12 frozen F1 invocations

Each run was compared with its `419e56d` `appearance-final-v1` log, the latest accepted baseline. The comparison covers the full sequence of `check` records (id, kind, pass) and the result record.

| Runner / mode | Log (new) | Checks | Verdict / cases | Sequence equal to `419e56d` baseline | Failed checks | Runtime errors | `Invalid blocker state transition` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `verify-f1.mjs` sticky | `web-sticky-recovery-f1/f1-f9eb4b1-sticky-apprail-fixed1.log` | 62 | pass; r1, d1, r2 pass; F1 signature false ×3 | yes (62 = 62) | 0 | 0 | 0 |
| `verify-f1.mjs` more | `…/f1-f9eb4b1-more-apprail-fixed1.log` | 62 | pass; r1, d1, r2 pass | yes | 0 | 0 | 0 |
| `verify-f1.mjs` collaborate | `…/f1-f9eb4b1-collaborate-apprail-fixed1.log` | 62 | pass; r1, d1, r2 pass | yes | 0 | 0 | 0 |
| `verify-f1-callers.mjs` selfcheck | `…/f1-f9eb4b1-selfcheck-apprail-fixed1.log` | 31 | harness-valid | yes | 0 | 0 | 0 |
| `verify-f1-callers.mjs` notifications | `…/f1-f9eb4b1-notifications-apprail-fixed1.log` | 72 | refuted; r1, d1, f1 pass | yes | 0 | 0 | 0 |
| `verify-f1-callers.mjs` date-time | `…/f1-f9eb4b1-date-time-apprail-fixed1.log` | 72 | refuted; r1, d1, f1 pass | yes | 0 | 0 | 0 |
| `verify-f1-callers.mjs` smart-lists | `…/f1-f9eb4b1-smart-lists-apprail-fixed1.log` | 90 | refuted; r1, d1, l1, f1 pass | yes | 0 | 0 | 0 |
| `verify-f1-callers.mjs` header | `…/f1-f9eb4b1-header-apprail-fixed1.log` | 98 | refuted; r1, d1, f1, o1 pass | yes | 0 | 0 | 0 |
| `verify-f1-callers.mjs` pomodoro | `…/f1-f9eb4b1-pomodoro-apprail-fixed1.log` | 78 | refuted; r1, d1, f1 pass | yes | 0 | 0 | 0 |
| `verify-f1-race.mjs` race | `…/f1-f9eb4b1-race-apprail-fixed1.log` | 183 | pass; r1–r4, k, k-fresh, g1–g3, l as in the console line | yes | 0 | 0 | 0 |
| `verify-f1-features.mjs` selfcheck | `web-features-recovery-f1/f1-f9eb4b1-selfcheck-apprail-fixed1.log` | 105 | harness-valid; sr, sd, s2 held-released-once (1 proceed each, 0 non-live) | yes | 0 | 0 | 0 |
| `verify-f1-features.mjs` features | `web-features-recovery-f1/f1-f9eb4b1-features-apprail-fixed1.log` | 102 | fixed-pass; r1, d1, r2, rb held-released-once (1 proceed each, 0 non-live) | yes | 0 | 0 | 0 |

- **Runner hashes unchanged.** The logs record `816bd261…` for `verify-f1.mjs`, `88ccca3d…` for `verify-f1-callers.mjs`, `3d009ac0…` for `verify-f1-race.mjs` and `d0ac8c68…` for `verify-f1-features.mjs`, and the frozen prelude is `67bbfaa7…`.
- **Baseline checks.** Every run passes its docs-head product-tree precondition, its lockfile gate and its archive-pinning precondition. Console warnings are 0 in all 12 runs.
- **Total.** 1,017 checks, all passing, with the same id/kind/outcome sequence as `419e56d`: **0 PASS→FAIL**.
- **Transport.** As frozen, these four runners use the DevTools WebSocket (`--remote-debugging-port`), not the pipe. E15 requires unchanged runner hashes, so pipe transport is not available to them; this is the same as the Appearance final-regression precedent §2.3 item 3. None of them sends `nativeVirtualKeyCode` (0 occurrences in each runner's source). They carry no K-1 audit of their own, as frozen.

## 7. E16 and E17: rail and Appearance F1-shape at the fixed SHA

### 7.1 E16, rail F1-shape (`verify-f1-railorder.mjs`, pipe transport)

**Provenance.**
- The rail F1 runner is unchanged (`6385b648…`), and so is its fixture (`fb6a8eb2…`).
- The frozen prelude hash check passes, and so does the contract r1 hash check.
- The archive is pinned behind the guard, with zero violations and zero foreign inputs.
- Bundle `5ccfe71eba00bb8236be18e477d70b1768959674c91db477a5fb667f48c3d3b6`. It differs from the `419e56d` bundle `3dacd410…`, as expected after the 19-file product delta.
- Chrome runs over `--remote-debugging-pipe`.

**`selfcheck`** (`f1-f9eb4b1-selfcheck-apprail-fixed1.log`, 174 lines): **harness-valid**, 165 of 165 checks pass (all preconditions). The id/kind/outcome sequence equals `f1-419e56d-selfcheck-before1.log` (165 = 165).

| Positive control | Held | Live `proceed()` | Non-live blocker calls | Duplicate proceeds | Runtime errors |
| --- | --- | --- | --- | --- | --- |
| pc1 sidebar-release (programmatic: one navigate replay) | yes | 0 | 0 | 0 | 0 |
| pc2 back-release (POP: one live `proceed()`) | yes | 1 | 0 | 0 | 0 |
| pc3 signout-held-stay | yes | 0 | 0 | 0 | 0 |
| pc4 signout-proceeds | no | 0 | 0 | 0 | 0 |
| pc5 trusted-rail-drag | no | 0 | 0 | 0 | 0 |
| pc6 rail-click-release (programmatic: one navigate replay) | yes | 0 | 0 | 0 | 0 |

**`railorder`** (`f1-f9eb4b1-railorder-apprail-fixed1.log`, 111 lines): **`verdict=fixed-pass`**, 104 of 104 checks pass (93 preconditions, 11 product), `deferredFailures: []`. In every case:
- the failed rail draft is proven first: a trusted drag, with every recorded drag event `isTrusted`;
- the recorded sequence is `dragstart:Tasks`, `dragenter:Dashboard`, `dragover:Dashboard`, `dragenter:Tasks`, `dragleave:Dashboard`, `dragover:Tasks`, `drop:Tasks`, `dragend:Tasks`;
- exactly one denied set attempt at the drop, carrying `merge(S, R, P)` with `tasks` moved to index 2, and the bytes unchanged.

| Case | Contract §12 scenario | Fixed observation | Release (controller reading) | F1 counts | Log lines |
| --- | --- | --- | --- | --- | --- |
| **f1** | Sign-out with a failed rail draft and a coordinator-held More draft; rail OK, then a successful More Retry | One `window.confirm` with the normative rail text "Your sidebar order change is not saved. Sign out and discard it?", answered OK (L40). The coordinator dialog "Unsaved More draft" then holds the sign-out (L41), so the rail step comes first. One More Retry releases the sign-out exactly once: `signOuts:1`, one document request for `/`, More written once (`set:true`) (L47) | Sign-out: no router commit; exactly one release | proceeds 0, duplicate 0, non-live 0, invalid transitions 0, runtime errors 0, console errors 0, error UI 0 (L48) | 40–49 |
| **f2** | Sign-out from `/app/tasks` with a failed rail draft; Cancel at the rail step | One confirm with the rail text, answered Cancel (L72). The sign-out resolves false: identity intact, `scopeTransitions:[]`, `signOuts:0`, no navigation request, history `[]`, commits `[]` (L73). The rail status is kept, with accessible name "Sidebar order not saved. Review it." inside `.topbar-controls` (L74) | No release (the sign-out is cancelled), zero history mutations | all 0 (L75) | 72–76 |
| **f3** | AppRail click away from the More pane with a held More draft while a rail draft exists; a successful More Retry releases the click | The click on Tasks is held by the coordinator, with zero commits and zero navigate calls while held (L102). One More Retry releases it: `releases:1`, `nonLive:0`, exactly one `PUSH` commit to `/app/tasks` and one `pushState`, the dialog closed, More written once, `exactlyOnce:true` (L103). The rail status is present (L105) | Programmatic navigation: one `navigate` replay, zero blocker calls, one router commit | all 0 (L104) | 102–105 |

- **Summary (L106).** The states are `{f1, f2, f3}: fixed-pass`, against the before map `before-no-rail-step` / `before-unprotected` / `before-pass-control`.
- **Dialogs (L107).** Exactly two expected confirms, plus the runner's own navigation `beforeunload`. There are no unexpected dialogs.
- **Before→fixed.**
  - The 104 check ids are identical and in the same order.
  - Exactly four product checks changed, all false→true. They are the four deferred failures of the before log: `f1:rail-sign-out-step-asked-once-with-normative-text-ok`, `f2:rail-sign-out-step-asked-once-with-normative-text-cancel`, `f2:cancel-resolves-false-identity-intact-zero-history-mutations` and `f2:rail-status-kept`.
  - Every other check kept its outcome. That includes f3, the pass control at both products.
- **Release-once reading.** Contract §12 says "one live `proceed()` … one router commit". It is applied as the controller ruled (CP-APPRAIL-01 E4–E5 row):
  - the POP path is one live `proceed()`, as in selfcheck pc2;
  - the programmatic path is one `navigate` replay, as in f3, pc1 and pc6;
  - a sign-out has no router commit, as in f1;
  - non-live blocker calls are 0 everywhere.

  Under that reading every f-case satisfies E16.
- **K-1 audit.** `pressEscape` sends no `nativeVirtualKeyCode`.
  - `railorder`: 4 documents, 0 runner presses, 0 keydown/keyup/keypress, 0 mismatches (L109–L110).
  - `selfcheck`: 7 documents, 1 press = 1 keydown = 1 keyup, 0 keypress, 0 mismatches.

### 7.2 E17, Appearance F1-shape through the K-1 copy

The K-1 copy is `verify-f1-appearance-k1.mjs`, `e9fbc590…`; its fixture `f1-appearance-host.tsx` is `19b4601f…`. Both are unchanged. The runner uses the frozen WebSocket transport.

| Mode | Log | Checks | Verdict | Sequence equal to `419e56d` (`appearance-final-v1`) | Cases | K-1 audit |
| --- | --- | --- | --- | --- | --- | --- |
| `selfcheck` | `web-native-keyinput-k1/f1-f9eb4b1-selfcheck-apprail-fixed1.log` | 135 | **harness-valid** | yes (135 = 135) | pc1–pc3 held, pc4 proceeds; pc2 1 live `proceed()`, all others 0; non-live 0, duplicate 0, invalid transitions 0, runtime errors 0 | 5 documents, 2 presses = 2 keydowns = 2 keyups, 0 keypress, 0 mismatches |
| `appearance` | `web-native-keyinput-k1/f1-f9eb4b1-appearance-apprail-fixed1.log` | 123 | **fixed-pass** | yes (123 = 123) | a1, a2, a3, a4 all `fixed-pass`; `f1Signature:false`; proceeds 0, duplicate 0, non-live 0, invalid transitions 0, runtime errors 0 each | 5 documents, 3 presses = 3 keydowns = 3 keyups, 0 keypress, 0 mismatches |

- **F1 signature: 0** in every case of both runs.
- `baseline:contract-r3-hash` passes; the Appearance contract is unchanged.
- `baseline:docs-head-product-tree-equals-revision` passes with an empty delta.

## 8. Per-case transition tables (Sol modes and E8)

Columns: the before outcome in each frozen before log, then the outcome in the new `apprail-fixed1` log. Cases are matched by full name, and long names are truncated with "…". "new → PASS" marks a case absent at `419e56d`.

#### `bytes` (26)

| # | Case | `bytes-before1` | fixed `apprail-fixed1` | Transition |
| --- | --- | --- | --- | --- |
| 001 | FIXTURE F-B002 the storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers | PASS | PASS | PASS → PASS |
| 002 | FIXTURE the attempt-counting Storage injector logs before delegation, faults precisely and proves firing | PASS | PASS | PASS → PASS |
| 003 | FIXTURE the exclusive Web Lock fixture serves async grants, holds, programmed holds, denial and a missing capability | PASS | PASS | PASS → PASS |
| 004 | FIXTURE accountScope transitions, confirm recorder, StorageEvent counter, bus spy, unload probe and download harness are observable | PASS | PASS | PASS → PASS |
| 005 | FIXTURE the production App mounts with only the auth-session hook substituted, real modules and no network | PASS | PASS | PASS → PASS |
| 006 | FIXTURE the drag driver fires dragStart → dragEnter → dragOver → drop → dragEnd on the real rail nodes with one DataTransfer stub | PASS | PASS | PASS → PASS |
| 007 | PC §2/§10.11 lifecycle classification, registry entry, device ownership and the per-key lock name are unchanged | PASS | PASS | PASS → PASS |
| 008 | PC §3.7 absent bytes display the 12 defaults then Bookkeeping and Metrics, with no status and no unload warning | PASS | PASS | PASS → PASS |
| 009 | PC §3.7 `[]` displays all 14 modules in R order with XAI Chat first, with no status | PASS | PASS | PASS → PASS |
| 010 | PC §10.2 a value written by the before product is read identically: a seeded custom order displays as D(S, R) | PASS | PASS | PASS → PASS |
| 011 | PC §5.1 loading the production App on the three host-row-a routes, the Topbar popover and a reload make zero attempts to write | PASS | PASS | PASS → PASS |
| 012 | PC §5.1 a seeded custom order is displayed on every route with zero attempts to write and unchanged bytes | PASS | PASS | PASS → PASS |
| 013 | PC §5.1 AppRail re-renders caused by a Features toggle, a rail-position change and a language change from another document make zero attempts | PASS | PASS | PASS → PASS |
| 014 | PC §5.1 a standalone AppRail mounts with zero attempts to write, absent and seeded | PASS | PASS | PASS → PASS |
| 015 | PC §10.1 P6 an all-visible drop over a stored custom order writes exactly P | PASS | PASS | PASS → PASS |
| 016 | PC §10.1 P6 an all-visible drop over absent bytes writes exactly P (12 defaults plus Bookkeeping and Metrics) | PASS | PASS | PASS → PASS |
| 017 | PC §10.1 P6 an all-visible drop over `[]` writes exactly P | PASS | PASS | PASS → PASS |
| 018 | PC §10.1 P6 a two-step all-visible drop writes the final preview | PASS | PASS | PASS → PASS |
| 019 | H5 §10.1 P2 a drop with Boards hidden keeps `board` at its stored index 2 | FAIL | PASS | FAIL → PASS |
| 020 | H5 §10.1 P2 a drop with three modules hidden keeps each at its stored index | FAIL | PASS | FAIL → PASS |
| 021 | H5 §10.1 P2 an unknown id (`ghost-module`) in the stored order keeps its index | FAIL | PASS | FAIL → PASS |
| 022 | H5 §10.1 P2 `settings` in the stored order keeps its index | FAIL | PASS | FAIL → PASS |
| 023 | H5 §10.1 P7 over absent bytes with Boards hidden, `board` keeps its default index 1 | FAIL | PASS | FAIL → PASS |
| 024 | PC §10.2 bytes written by a drop decode identically through the unchanged legacy getPref and appear verbatim in exportDeviceRecoveryData() | PASS | PASS | PASS → PASS |
| 025 | H11 PC a committed order in another document updates an idle rail live; a removal there displays the default | PASS | PASS | PASS → PASS |
| 026 | PC §2 the rail buttons keep their markup: .rail-btn.has-tip with data-tip, aria-label and draggable; the pet button stays outside .rail-items | PASS | PASS | PASS → PASS |

#### `domain` (31)

| # | Case | `domain-before1` | `domain-before2` | fixed `apprail-fixed1` | Transition |
| --- | --- | --- | --- | --- | --- |
| 001 | FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers | PASS | PASS | PASS | PASS → PASS |
| 002 | H1 §5.2 "{}" (not iterable) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 003 | H1 §5.2 "{\"tasks\":1}" (not iterable) at load: no route error on the three routes, the default display, the source status with Reload only, zero w… | FAIL | FAIL | PASS | FAIL → PASS |
| 004 | H1 §5.2 "1" (not iterable) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 005 | H1 §5.2 "0" (not iterable) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 006 | H1 §5.2 "-1" (not iterable) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 007 | H1 §5.2 "true" (not iterable) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 008 | H1 §5.2 "false" (not iterable) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 009 | H7 §5.2 "\"tasks\"" (a string) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 010 | H7 §5.2 "[1]" (a non-string element) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 011 | H7 §5.2 "[\"tasks\",2]" (a non-string element) at load: no route error on the three routes, the default display, the source status with Reload only… | FAIL | FAIL | PASS | FAIL → PASS |
| 012 | H7 §5.2 "[null]" (a non-string element) at load: no route error on the three routes, the default display, the source status with Reload only, zero … | FAIL | FAIL | PASS | FAIL → PASS |
| 013 | H7 §5.2 "[[\"tasks\"]]" (a non-string element) at load: no route error on the three routes, the default display, the source status with Reload only… | FAIL | FAIL | PASS | FAIL → PASS |
| 014 | H8 §5.2 "[\"tasks\",\"tasks\"]" (a repeated string) at load: no route error on the three routes, the default display, the source status with Reload… | FAIL | FAIL | PASS | FAIL → PASS |
| 015 | H8 §5.2 "[\"board\",\"tasks\",\"board\"]" (a repeated string) at load: no route error on the three routes, the default display, the source status w… | FAIL | FAIL | PASS | FAIL → PASS |
| 016 | H7 §5.2 "null" (null literal) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 017 | H7 §5.2 "[tasks" (unparsable) at load: no route error on the three routes, the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 018 | H7 §5.2 "" (unparsable (empty string)) at load: no route error on the three routes, the default display, the source status with Reload only, zero w… | FAIL | FAIL | PASS | FAIL → PASS |
| 019 | H10 §5.2 a throwing getItem(xai_rail_order) at load: the default display, the source status with Reload only, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 020 | H1 §5.2 the source status and panel in Chinese for `{}` | FAIL | FAIL | PASS | FAIL → PASS |
| 021 | H1 A5 a drag over `{}` is a refused failed draft: Retry refused again, Discard back to the default display, bytes unchanged | FAIL | FAIL | PASS | FAIL → PASS |
| 022 | H7 A5 a drag over `[1]` never overwrites the malformed bytes: a refused failed draft with Retry, Discard and Export | FAIL | FAIL | PASS | FAIL → PASS |
| 023 | H8 A5 a drag over `["tasks","tasks"]` never overwrites the malformed bytes | FAIL | FAIL | PASS | FAIL → PASS |
| 024 | H10 A5 a drag over an unreadable source is a failed draft, never a silent no-op | FAIL | FAIL | PASS | FAIL → PASS |
| 025 | §10.4 "{}" written by another document while the rail is idle: no throw, the default display, the source status, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 026 | §10.4 "1" written by another document while the rail is idle: no throw, the default display, the source status, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 027 | §10.4 "[\"tasks\",\"tasks\"]" written by another document while the rail is idle: no throw, the default display, the source status, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 028 | §10.4 "[1]" written by another document while the rail is idle: no throw, the default display, the source status, zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 029 | §10.4 `{}` written by another document over a failed draft becomes a preserved conflict: Retry refused, bytes kept, Discard shows the source state | FAIL | FAIL | PASS | FAIL → PASS |
| 030 | H1 §5.7 an external repair behind the App, then Reload: the status disappears and the committed order displays, with no write | FAIL | FAIL | PASS | FAIL → PASS |
| 031 | H7 §5.7 a repair committed by another document over `"tasks"`, then Reload if offered: the committed order displays, no status, no write | FAIL | FAIL | PASS | FAIL → PASS |

#### `merge` (21)

| # | Case | `merge-before1` | `merge-before2` | fixed `apprail-fixed1` | Transition |
| --- | --- | --- | --- | --- | --- |
| 001 | FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers | PASS | PASS | PASS | PASS → PASS |
| 002 | FIXTURE the oracle merge implements A2 on hand-checked examples | PASS | PASS | PASS | PASS → PASS |
| 003 | H5 A2 P1–P5 tasks hidden over a full custom order: the drop keeps tasks at its stored index and it returns there when re-enabled | FAIL | FAIL | PASS | FAIL → PASS |
| 004 | H5 A2 P1–P5 board hidden over a full custom order: the drop keeps board at its stored index and it returns there when re-enabled | FAIL | FAIL | PASS | FAIL → PASS |
| 005 | H5 A2 P1–P5 dashboard hidden over a full custom order: the drop keeps dashboard at its stored index and it returns there when re-enabled | FAIL | FAIL | PASS | FAIL → PASS |
| 006 | H5 A2 P1–P5 calendar hidden over a full custom order: the drop keeps calendar at its stored index and it returns there when re-enabled | FAIL | FAIL | PASS | FAIL → PASS |
| 007 | H5 A2 P1–P5 matrix hidden over a full custom order: the drop keeps matrix at its stored index and it returns there when re-enabled | FAIL | FAIL | PASS | FAIL → PASS |
| 008 | H5 A2 P1–P5 pomodoro hidden over a full custom order: the drop keeps pomodoro at its stored index and it returns there when re-enabled | FAIL | FAIL | PASS | FAIL → PASS |
| 009 | H5 A2 P1–P5 habits hidden over a full custom order: the drop keeps habits at its stored index and it returns there when re-enabled | FAIL | FAIL | PASS | FAIL → PASS |
| 010 | H5 A2 P1–P5 meditation hidden over a full custom order: the drop keeps meditation at its stored index and it returns there when re-enabled | FAIL | FAIL | PASS | FAIL → PASS |
| 011 | H5 A2 P1–P5 three modules hidden at once (Boards, Habits, Pomodoro) | FAIL | FAIL | PASS | FAIL → PASS |
| 012 | H5 A2 P1–P5 three different modules hidden at once (Tasks, Calendar, Meditation) with the drag reaching the far end | FAIL | FAIL | PASS | FAIL → PASS |
| 013 | H5 A2 P2/P3 unknown ids keep their stored indices (REL-07: bytes this build does not understand are never destroyed) | FAIL | FAIL | PASS | FAIL → PASS |
| 014 | H5 A2 P2 `settings` and a hidden module in the stored order both keep their indices | FAIL | FAIL | PASS | FAIL → PASS |
| 015 | H5 A2 P7 absent bytes with Habits hidden: `habits` keeps its default index 7 | FAIL | FAIL | PASS | FAIL → PASS |
| 016 | H5 A2 P7 absent bytes with Boards and Meditation hidden keep their default indices | FAIL | FAIL | PASS | FAIL → PASS |
| 017 | PC A2 P3/P4 a `[]` base with Boards hidden stores exactly P (nothing to keep) | PASS | PASS | PASS | PASS → PASS |
| 018 | PC A2 P6 every module visible over a full custom order: S' = P | PASS | PASS | PASS | PASS → PASS |
| 019 | §6.7 A2 a non-permutation input (R changes mid-drag: Boards re-enabled) makes no merge and zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 020 | H5 R-1 end to end: Boards turned off in the real Features pane, a drag, then Boards back on — `board` keeps index 2 and returns there | FAIL | FAIL | PASS | FAIL → PASS |
| 021 | H5 R-1 in the production App with Habits hidden at load: the drop keeps `habits` at its stored index | FAIL | FAIL | PASS | FAIL → PASS |

#### `drag` (18)

| # | Case | `drag-before1` | `drag-before2` | fixed `apprail-fixed1` | Transition |
| --- | --- | --- | --- | --- | --- |
| 001 | FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers | PASS | PASS | PASS | PASS → PASS |
| 002 | H3 §6.2/§6.3 a one-step drag: the preview shows P with zero attempts during dragstart/dragenter/dragover; the drop makes exactly one write with the… | FAIL | FAIL | PASS | FAIL → PASS |
| 003 | H3 §6.2/§6.3 a two-step drag (two different targets): zero attempts across both dragovers, exactly one write of the final preview at the drop | FAIL | FAIL | PASS | FAIL → PASS |
| 004 | H3 A3 a standalone AppRail (its own controller) also writes once at the drop and never during dragover | FAIL | FAIL | PASS | FAIL → PASS |
| 005 | H4 §6.4 dragEnd without a drop (Escape or a cancelled drag) reverts the preview with zero attempts | FAIL | FAIL | PASS | FAIL → PASS |
| 006 | H4 §6.4 a two-step drag released outside the rail on the main content (a drop there) reverts with zero attempts | FAIL | FAIL | PASS | FAIL → PASS |
| 007 | H4 §6.4 a drop accepted by a text input outside the rail reverts with zero attempts | FAIL | FAIL | PASS | FAIL → PASS |
| 008 | H3 §6.3 a drop on a gap of .rail-items commits exactly one write with the A2 merge | FAIL | FAIL | PASS | FAIL → PASS |
| 009 | H3 §6.3 a drop on the dragged button itself commits exactly one write (the drop target's identity never matters) | FAIL | FAIL | PASS | FAIL → PASS |
| 010 | PC §6.3 an unchanged order (dragover only on the dragged button, then a drop) makes zero attempts | PASS | PASS | PASS | PASS → PASS |
| 011 | PC §6.3 a dragover on a gap only, then a drop on the gap, makes zero attempts | PASS | PASS | PASS | PASS → PASS |
| 012 | §6.5 one gesture admits at most one intent: two drop events in one gesture make at most one write | PASS | PASS | PASS | PASS → PASS |
| 013 | §6.5 two successive gestures make exactly one write each; the second merges over the first's committed order | PASS | PASS | PASS | PASS → PASS |
| 014 | PC §6.5 an external drop (no rail dragstart in this document) on a rail button is ignored with zero attempts | PASS | PASS | PASS | PASS → PASS |
| 015 | §6.7 R changes mid-drag (Boards turned off in another document): the drop makes zero attempts and the rail shows D(S, R) | FAIL | FAIL | PASS | FAIL → PASS |
| 016 | §6.7 the committed order changing mid-drag (another document): the drop still commits, merging over S at drop time | FAIL | FAIL | PASS | FAIL → PASS |
| 017 | PC §6.1 the dragged button carries the `dragging` class during the gesture and loses it at dragend | PASS | PASS | PASS | PASS → PASS |
| 018 | PC §6.6 a click on a rail button during a drag does not navigate; after the gesture ends, clicks navigate as before | PASS | PASS | PASS | PASS → PASS |

#### `field` (24)

| # | Case | `field-before1` | `field-before2` | fixed `apprail-fixed1` | Transition |
| --- | --- | --- | --- | --- | --- |
| 001 | FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers | PASS | PASS | PASS | PASS → PASS |
| 002 | H2 §5.4 a quota failure keeps the dropped order displayed with the status, Retry, Discard and Export; the bytes keep the old order | FAIL | FAIL | PASS | FAIL → PASS |
| 003 | H2 §5.4 a throwing setItem (not quota) keeps the dropped order displayed as a failed draft | FAIL | FAIL | PASS | FAIL → PASS |
| 004 | H2 §5.4 a throwing getItem during the write is a failed draft; after the read recovers, Retry makes exactly one write | FAIL | FAIL | PASS | FAIL → PASS |
| 005 | H6 §5.4 without navigator.locks every rail write is refused and reported, never written unfenced; Retry after the capability returns writes once | FAIL | FAIL | PASS | FAIL → PASS |
| 006 | H6 §5.4 a rejected per-key Web Lock is a failed draft with zero writes; Retry after the lock is allowed writes once | FAIL | FAIL | PASS | FAIL → PASS |
| 007 | H2 §5.7 Retry re-attempts exactly once; after a success the status unmounts and focus moves to .topbar-pref-trigger | FAIL | FAIL | PASS | FAIL → PASS |
| 008 | H2 §5.7 a Retry that fails again makes exactly one attempt, keeps the draft and leaves focus on Retry | FAIL | FAIL | PASS | FAIL → PASS |
| 009 | H2 §5.7 a Retry while the field is pending is inert: the saving message, one lock request, one write after release | FAIL | FAIL | PASS | FAIL → PASS |
| 010 | H2 §5.7 Discard makes zero set or remove attempts, returns to the committed order and moves focus to .topbar-pref-trigger | FAIL | FAIL | PASS | FAIL → PASS |
| 011 | H2 §5.3 a drop back to the committed order over a failed draft is admitted and completes as the engine's verified no-op | FAIL | FAIL | PASS | FAIL → PASS |
| 012 | H6 §5.3 while the real per-key lock is held the bytes are unchanged, the dropped order displays, no status shows and the rail stays operable; one w… | FAIL | FAIL | PASS | FAIL → PASS |
| 013 | H6 §5.3 host row f: a second drop while the first is held — the latest wins, each drop makes exactly one lock request, the first never acknowledges… | FAIL | FAIL | PASS | FAIL → PASS |
| 014 | H6 §5.4 ordering 1: the predecessor succeeds and the latest fails — the latest stays displayed with the status; Retry writes it | FAIL | FAIL | PASS | FAIL → PASS |
| 015 | H6 §5.4 ordering 2: the predecessor fails while the latest is queued; Retry advances the predecessor without acknowledging the latest, which then c… | FAIL | FAIL | PASS | FAIL → PASS |
| 016 | H6 §5.4 ordering 3: repeated failed-predecessor recovery — the first Retry fails again with one attempt, the second succeeds | FAIL | FAIL | PASS | FAIL → PASS |
| 017 | H6 §5.4 ordering 4: a later failure of the latest — Retry fails again, then succeeds | FAIL | FAIL | PASS | FAIL → PASS |
| 018 | §5.5 an uncertain write keeps its grant across a denied read and a denied lock and reconciles with exactly one total write | FAIL | FAIL | PASS | FAIL → PASS |
| 019 | §5.5 an external replacement during a held write stays a preserved conflict; repeated Retry never overwrites; Discard adopts it with zero writes | FAIL | FAIL | PASS | FAIL → PASS |
| 020 | §5.5 an external removal during a held write stays a preserved conflict; Retry never recreates the key; Discard shows the default | FAIL | FAIL | PASS | FAIL → PASS |
| 021 | §5.5 an uncertain write whose original bytes are externally restored stays a conflict; a distinct new drop is a new operation | FAIL | FAIL | PASS | FAIL → PASS |
| 022 | H2 §5.7 a late completion after Discard never revives the discarded order or writes | FAIL | FAIL | PASS | FAIL → PASS |
| 023 | H6 §7.6 a held write when the App unmounts refuses on release (live disposal state); no runtime error or rejection | FAIL | FAIL | PASS | FAIL → PASS |
| 024 | H2 §5 a failed drop in Chinese: the draft accessible name, the message and the action names | FAIL | FAIL | PASS | FAIL → PASS |

#### `continuity-export` (22)

| # | Case | `continuity-export-before1` | fixed `apprail-fixed1` | Transition |
| --- | --- | --- | --- | --- |
| 001 | FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers | PASS | PASS | PASS → PASS |
| 002 | H6 §7 Sol layer: a draft and a held operation survive A→B | FAIL | PASS | FAIL → PASS |
| 003 | H6 §7 Sol layer: a draft and a held operation survive A→locked | FAIL | PASS | FAIL → PASS |
| 004 | H6 §7 Sol layer: a draft and a held operation survive locked→A | FAIL | PASS | FAIL → PASS |
| 005 | H6 §7 Sol layer: a draft and a held operation survive a same-account epoch change | FAIL | PASS | FAIL → PASS |
| 006 | H6 §7.6 Sol layer: unmount while held — old callbacks refuse on release, based on live disposal state | FAIL | PASS | FAIL → PASS |
| 007 | PC §7 an unrelated held account lifecycle lock never delays a rail write | PASS | PASS | PASS → PASS |
| 008 | PC §7 the rail never touches account machinery: no account or demo physical key, no account lifecycle lock, only its own per-key lock | PASS | PASS | PASS → PASS |
| 009 | H2 §8 shape 1: a failed drop with every module visible exports the A2 merge in the set envelope | FAIL | PASS | FAIL → PASS |
| 010 | H2 §8 shape 2: a failed drop with Boards hidden exports a value that keeps `board` at its stored index | FAIL | PASS | FAIL → PASS |
| 011 | H1 §8 shape 3: a failed drop over `{}` exports the merge over DEFAULT_RAIL_ORDER | FAIL | PASS | FAIL → PASS |
| 012 | H2 §8 shape 4: an export while a Retry is held behind the real per-key lock | FAIL | PASS | FAIL → PASS |
| 013 | H2 §8 shape 5: an export after navigating to another route and back (App lifetime) | FAIL | PASS | FAIL → PASS |
| 014 | PC §8 Export is offered only while a draft exists: no status in a clean state | PASS | PASS | PASS → PASS |
| 015 | H2 §8 a blob setup failure shows the localized export error, keeps the draft, warning and status, and cleans up | FAIL | PASS | FAIL → PASS |
| 016 | H2 §8 a url setup failure shows the localized export error, keeps the draft, warning and status, and cleans up | FAIL | PASS | FAIL → PASS |
| 017 | H2 §8 a append setup failure shows the localized export error, keeps the draft, warning and status, and cleans up | FAIL | PASS | FAIL → PASS |
| 018 | H2 §8 a click setup failure shows the localized export error, keeps the draft, warning and status, and cleans up | FAIL | PASS | FAIL → PASS |
| 019 | H2 §8 a setup failure in Chinese shows 导出失败，请重试。; the next panel action clears the line | FAIL | PASS | FAIL → PASS |
| 020 | H2 §8 an unmount during blob setup cancels the click and cleans up | FAIL | PASS | FAIL → PASS |
| 021 | H2 §8 an unmount during url setup cancels the click and cleans up | FAIL | PASS | FAIL → PASS |
| 022 | H2 §8 an unmount during append setup cancels the click and cleans up | FAIL | PASS | FAIL → PASS |

#### `host` (33)

| # | Case | `host-before1` | `host-before2` | fixed `apprail-fixed1` | Transition |
| --- | --- | --- | --- | --- | --- |
| 001 | FIXTURE F-B002 this file's storage wrappers record and delegate exactly once, never re-enter Storage and never call accountScope helpers | PASS | PASS | PASS | PASS → PASS |
| 002 | PC A8 no status and no unload warning in a clean state | PASS | PASS | PASS | PASS → PASS |
| 003 | H9 A8 a pending-only first attempt shows no status; once it settles unsuccessful the status renders; a successful Retry removes it | FAIL | FAIL | PASS | FAIL → PASS |
| 004 | H9 §7.2 the status is a native button with aria-expanded and aria-controls; pointer activation toggles the panel exactly once, keeps focus and touc… | FAIL | FAIL | PASS | FAIL → PASS |
| 005 | H9 §7.2 Enter and Space on the status each toggle the panel exactly once | FAIL | FAIL | PASS | FAIL → PASS |
| 006 | H9 §7.2 the panel follows the button in DOM order inside one status root, so Tab reaches Retry, Discard and Export next, then the appearance trigger | FAIL | FAIL | PASS | FAIL → PASS |
| 007 | H9 §7.2 Escape closes the panel and returns focus to the status button | FAIL | FAIL | PASS | FAIL → PASS |
| 008 | H9 §7.2 a mousedown outside the status root closes the panel; focus moves only when it was inside the panel | FAIL | FAIL | PASS | FAIL → PASS |
| 009 | H9 §7.2 a keyboard Retry that succeeds unmounts the status and moves focus to .topbar-pref-trigger, never <body> | FAIL | FAIL | PASS | FAIL → PASS |
| 010 | H9 §7.2 placement: the status root sits immediately after the Appearance status and before .topbar-pref | FAIL | FAIL | PASS | FAIL → PASS |
| 011 | H9 §7.2 the status in Chinese: the draft accessible name and the panel name | FAIL | FAIL | PASS | FAIL → PASS |
| 012 | H9 §7.1 with a failed draft a rail click and the Settings sidebar are not held; the status shows on every route; the draft is intact | FAIL | FAIL | PASS | FAIL → PASS |
| 013 | H9 §7.1 Back and Forward with a failed draft are not held and land on the same history entries as an ordinary navigation | FAIL | FAIL | PASS | FAIL → PASS |
| 014 | H9 §7.3 beforeunload warns while a failed rail draft exists, with zero storage attempts in the handler; it is removed after Discard | FAIL | FAIL | PASS | FAIL → PASS |
| 015 | sign-out fallback branch PC §7.4 fallback: without drafts sign-out makes zero confirm calls and completes as at 419e56d | PASS | PASS | PASS | PASS → PASS |
| 016 | sign-out fallback branch PC §7.4 fallback: with an Appearance draft only, the confirm list is exactly the Appearance text | PASS | PASS | PASS | PASS → PASS |
| 017 | sign-out fallback branch H9 §7.4 fallback: with a failed rail draft, Cancel resolves false: one rail confirm, identity intact, zero history mutatio… | FAIL | FAIL | PASS | FAIL → PASS |
| 018 | sign-out fallback branch H9 §7.4 fallback: with a failed rail draft, OK discards it with zero writes and the existing sequence continues | FAIL | FAIL | PASS | FAIL → PASS |
| 019 | sign-out fallback branch H9 §7.4 fallback: with rail and Appearance drafts the confirm list is [rail, Appearance]; OK and OK proceeds | FAIL | FAIL | PASS | FAIL → PASS |
| 020 | sign-out fallback branch H9 §7.4 fallback: OK at the rail step then Cancel at the Appearance step resolves false with the rail draft discarded and … | FAIL | FAIL | PASS | FAIL → PASS |
| 021 | sign-out fallback branch H9 §7.4 fallback: Cancel at the rail step never asks the Appearance step | FAIL | FAIL | PASS | FAIL → PASS |
| 022 | sign-out coordinator branch PC §7.4 coordinator: without drafts sign-out makes zero confirm calls and completes as at 419e56d | PASS | PASS | PASS | PASS → PASS |
| 023 | sign-out coordinator branch PC §7.4 coordinator: with an Appearance draft only, the confirm list is exactly the Appearance text | PASS | PASS | PASS | PASS → PASS |
| 024 | sign-out coordinator branch H9 §7.4 coordinator: with a failed rail draft, Cancel resolves false: one rail confirm, identity intact, zero history m… | FAIL | FAIL | PASS | FAIL → PASS |
| 025 | sign-out coordinator branch H9 §7.4 coordinator: with a failed rail draft, OK discards it with zero writes and the existing sequence continues | FAIL | FAIL | PASS | FAIL → PASS |
| 026 | sign-out coordinator branch H9 §7.4 coordinator: with rail and Appearance drafts the confirm list is [rail, Appearance]; OK and OK proceeds | FAIL | FAIL | PASS | FAIL → PASS |
| 027 | sign-out coordinator branch H9 §7.4 coordinator: OK at the rail step then Cancel at the Appearance step resolves false with the rail draft discarde… | FAIL | FAIL | PASS | FAIL → PASS |
| 028 | sign-out coordinator branch H9 §7.4 coordinator: Cancel at the rail step never asks the Appearance step | FAIL | FAIL | PASS | FAIL → PASS |
| 029 | H9 §7.4 the rail sign-out confirmation in Chinese | FAIL | FAIL | PASS | FAIL → PASS |
| 030 | H9 §7 REL-09 a forced scope change from another document remounts the App: the committed order displays, no status, zero runtime errors | FAIL | FAIL | PASS | FAIL → PASS |
| 031 | PC §5.9 a Features toggle success, a toggle failure with Retry and Reset to defaults make zero attempts on xai_rail_order; the rail follows R | PASS | PASS | PASS | PASS → PASS |
| 032 | H9 §10.3 exactly one controller: Discard updates the rail and removes the status in the same frame | FAIL | FAIL | PASS | FAIL → PASS |
| 033 | H9 §10.7 every rail operation dispatches zero StorageEvents and zero preference-changed events, and every other key keeps its bytes | FAIL | FAIL | PASS | FAIL → PASS |

#### `original` (123)

| # | Case | `original-before1` | fixed `apprail-fixed1` | Transition |
| --- | --- | --- | --- | --- |
| 001 | [shell-tests] AppRail AR1 — renders rail-visible modules sorted by railOrder | PASS | PASS | PASS → PASS |
| 002 | [shell-tests] AppRail AR1b — settings module with showInRail:false is not in rail-items | PASS | PASS | PASS → PASS |
| 003 | [shell-tests] AppRail AR2 — data-pos attribute matches railPos | PASS | PASS | PASS → PASS |
| 004 | [shell-tests] AppRail AR2b — left is the default data-pos | PASS | PASS | PASS → PASS |
| 005 | [shell-tests] AppRail AR3 — clicking a module button calls onModuleClick with the module id | PASS | PASS | PASS → PASS |
| 006 | [shell-tests] AppRail AR4 — active module button has 'active' className | PASS | PASS | PASS → PASS |
| 007 | [shell-tests] AppRail AR4b — inactive buttons do NOT have 'active' className | PASS | PASS | PASS → PASS |
| 008 | [shell-tests] AppRail AR5 — drag-reorder: onDragStart sets dragging class | PASS | PASS | PASS → PASS |
| 009 | [shell-tests] AppRail AR8 — ghost module ids in localStorage are filtered out | PASS | PASS | PASS → PASS |
| 010 | [shell-tests] AppRail AR9 — Pet button is rendered in the rail-bottom | PASS | PASS | PASS → PASS |
| 011 | [shell-tests] AppRail AR9b — clicking Pet button calls onPetToggle | PASS | PASS | PASS → PASS |
| 012 | [shell-tests] AppRail AR9c — Pet button has 'active' class when petOn=true | PASS | PASS | PASS → PASS |
| 013 | [shell-tests] AppRail AR10 — bottom row has exactly 1 button (pet only; sync/notif/help hidden) | PASS | PASS | PASS → PASS |
| 014 | [shell-tests] AppRail AR10a — sync icon is NOT rendered in the rail-bottom (Rail-05 fix) | PASS | PASS | PASS → PASS |
| 015 | [shell-tests] AppRail AR10b — notif icon is NOT rendered in the rail-bottom (Rail-06 fix) | PASS | PASS | PASS → PASS |
| 016 | [shell-tests] AppRail AR10c — help icon is NOT rendered in the rail-bottom (Rail-07 fix) | PASS | PASS | PASS → PASS |
| 017 | [shell-tests] AppRail AR10d — pet button is still present after removing sync/notif/help | PASS | PASS | PASS → PASS |
| 018 | [shell-tests] AppRail AR11 — icon-only rail controls expose accessible names | PASS | PASS | PASS → PASS |
| 019 | [shell-tests] AppRail AR11 — module button has data-tip with i18n label | PASS | PASS | PASS → PASS |
| 020 | [shell-tests] AppRail sign-out passthrough (AR-SO1..SO2) AR-SO1 — renderRail with onSignOut wired: opening AvatarMenu and clicking Sign Out opens c… | PASS | PASS | PASS → PASS |
| 021 | [shell-tests] AppRail sign-out passthrough (AR-SO1..SO2) AR-SO2 — renderRail without onSignOut: AvatarMenu renders normally (backward-compatible) | PASS | PASS | PASS → PASS |
| 022 | [shell-tests] AppRail persistence (P1..P4) P1 — xai_rail_order is restored on remount | PASS | PASS | PASS → PASS |
| 023 | [shell-tests] AppRail persistence (P1..P4) P3 — items missing from xai_rail_order are appended at end | PASS | PASS | PASS → PASS |
| 024 | [shell-tests] AppRail persistence (P1..P4) N1 — empty modules list renders empty rail-items | PASS | PASS | PASS → PASS |
| 025 | [shell-tests] AppRail persistence (P1..P4) N3 — empty xai_rail_order falls back to registry order | PASS | PASS | PASS → PASS |
| 026 | [shell-tests] Shell smoke (S1..S4) S1 — Shell renders with Topbar (search input present) | PASS | PASS | PASS → PASS |
| 027 | [shell-tests] Shell smoke (S1..S4) S1b — Shell renders with AppRail (app-rail aside present) | PASS | PASS | PASS → PASS |
| 028 | [shell-tests] Shell smoke (S1..S4) S2 — Shell renders children in app-main | PASS | PASS | PASS → PASS |
| 029 | [shell-tests] Shell smoke (S1..S4) S3a — Shell renders with railPos=right | PASS | PASS | PASS → PASS |
| 030 | [shell-tests] Shell smoke (S1..S4) S3b — Shell renders with railPos=top | PASS | PASS | PASS → PASS |
| 031 | [shell-tests] Shell smoke (S1..S4) S3c — Shell renders with railPos=bottom | PASS | PASS | PASS → PASS |
| 032 | [shell-tests] Shell smoke (S1..S4) S4 — Shell renders with empty modules (no crash) | PASS | PASS | PASS → PASS |
| 033 | [shell-tests] Shell smoke (S1..S4) SH-SO1 — Shell accepts onSignOut prop and passes it to AppRail (structural smoke) | PASS | PASS | PASS → PASS |
| 034 | [shell-tests] Shell smoke (S1..S4) S-StrictMode — StrictMode double-mount does not throw | PASS | PASS | PASS → PASS |
| 035 | [shell-tests] Topbar TP0 — preferences trigger opens the appearance popover | PASS | PASS | PASS → PASS |
| 036 | [shell-tests] Topbar TP1 — appearance popover: clicking 中文 calls setLang('zh') | PASS | PASS | PASS → PASS |
| 037 | [shell-tests] Topbar TP1b — clicking EN calls setLang('en') | PASS | PASS | PASS → PASS |
| 038 | [shell-tests] Topbar TP1c — active lang option has aria-checked=true | PASS | PASS | PASS → PASS |
| 039 | [shell-tests] Topbar TP2 — Dark button calls setTheme('dark') | PASS | PASS | PASS → PASS |
| 040 | [shell-tests] Topbar TP2b — System button calls setTheme('system') | PASS | PASS | PASS → PASS |
| 041 | [shell-tests] Topbar TP2c — active theme option has aria-checked=true | PASS | PASS | PASS → PASS |
| 042 | [shell-tests] Topbar TP3 — Compact button calls setDensity('compact') | PASS | PASS | PASS → PASS |
| 043 | [shell-tests] Topbar TP3b — active density option has aria-checked=true | PASS | PASS | PASS → PASS |
| 044 | [shell-tests] Topbar TP4 — Settings row click calls onOpenSettings | PASS | PASS | PASS → PASS |
| 045 | [shell-tests] Topbar TP5a — no onOpenSearch prop → renders readOnly input with EN placeholder (backwards-compat) | PASS | PASS | PASS → PASS |
| 046 | [shell-tests] Topbar TP5b — onOpenSearch prop provided → renders <button class='search-box'> | PASS | PASS | PASS → PASS |
| 047 | [shell-tests] Topbar TP6 — ⌘K kbd hint is rendered | PASS | PASS | PASS → PASS |
| 048 | [shell-tests] Topbar TP7 — button click calls onOpenSearch() | PASS | PASS | PASS → PASS |
| 049 | [shell-tests] Topbar TB-PREMIUM-1 — premiumBadge render-prop renders in Topbar when provided | PASS | PASS | PASS → PASS |
| 050 | [shell-tests] Topbar TP1-Persist — clicking 中文 calls setLang('zh') once and makes zero Storage attempts | PASS | PASS | PASS → PASS |
| 051 | [shell-tests] Topbar TP1b-Persist — clicking EN calls setLang('en') once and makes zero Storage attempts | PASS | PASS | PASS → PASS |
| 052 | [shell-tests] Topbar TP2-Persist — clicking Dark calls setTheme('dark') once and makes zero Storage attempts | PASS | PASS | PASS → PASS |
| 053 | [shell-tests] Topbar TP2b-Persist — clicking System calls setTheme('system') once and makes zero Storage attempts | PASS | PASS | PASS → PASS |
| 054 | [shell-tests] Topbar TP2c-Persist — clicking Light calls setTheme('light') once and makes zero Storage attempts | PASS | PASS | PASS → PASS |
| 055 | [shell-tests] Topbar TP3-Persist — clicking Compact calls setDensity('compact') once and makes zero Storage attempts | PASS | PASS | PASS → PASS |
| 056 | [shell-tests] Topbar TP3b-Persist — clicking Comfortable calls setDensity('comfortable') once and makes zero Storage attempts | PASS | PASS | PASS → PASS |
| 057 | [shell-tests] Topbar TP-STATUS-1 — appearanceStatus renders immediately after the premium badge, before the appearance popover | PASS | PASS | PASS → PASS |
| 058 | [shell-tests] Topbar TP-STATUS-2 — without appearanceStatus (or when it renders nothing) the controls are unchanged | PASS | PASS | PASS → PASS |
| 059 | [shell-tests] Topbar TP-RAIL-1 — railOrderStatus renders immediately after appearanceStatus and before the appearance popover | — | PASS | new → PASS |
| 060 | [shell-tests] Topbar TP-RAIL-2 — without railOrderStatus (or when it renders nothing) the Topbar outerHTML is unchanged | — | PASS | new → PASS |
| 061 | [shell-tests] index barrel (B1..B3) B1 — exports Shell component | PASS | PASS | PASS → PASS |
| 062 | [shell-tests] index barrel (B1..B3) B1 — exports AppRail component | PASS | PASS | PASS → PASS |
| 063 | [shell-tests] index barrel (B1..B3) B1 — exports Topbar component | PASS | PASS | PASS → PASS |
| 064 | [shell-tests] index barrel (B1..B3) B1 — exports AvatarMenu component | PASS | PASS | PASS → PASS |
| 065 | [shell-tests] index barrel (B1..B3) B1 — exports WebShellProvider | PASS | PASS | PASS → PASS |
| 066 | [shell-tests] index barrel (B1..B3) B1 — exports useWebShell | PASS | PASS | PASS → PASS |
| 067 | [shell-tests] index barrel (B1..B3) B1 — exports useWebModuleRegistry | PASS | PASS | PASS → PASS |
| 068 | [shell-tests] index barrel (B1..B3) B2 — does NOT export internal symbols (reorderArray, getPopoverAnchor) | PASS | PASS | PASS → PASS |
| 069 | [shell-tests] index barrel (B1..B3) B3 — WebModuleSlotRegistration type extends WebModuleRouteRegistration (structural check via runtime object shape) | PASS | PASS | PASS → PASS |
| 070 | [shell-tests] reorderArray moves item from position 0 to position 2 | PASS | PASS | PASS → PASS |
| 071 | [shell-tests] reorderArray moves item from position 2 to position 0 | PASS | PASS | PASS → PASS |
| 072 | [shell-tests] reorderArray returns original array when fromId === toId (N7 — drag onto self) | PASS | PASS | PASS → PASS |
| 073 | [shell-tests] reorderArray returns original array when fromId not found | PASS | PASS | PASS → PASS |
| 074 | [shell-tests] reorderArray returns original array when toId not found | PASS | PASS | PASS → PASS |
| 075 | [shell-tests] reorderArray always returns a new array (safe for React state) | PASS | PASS | PASS → PASS |
| 076 | [shell-tests] reorderArray moves last item to first | PASS | PASS | PASS → PASS |
| 077 | [shell-tests] reorderArray moves first item to last | PASS | PASS | PASS → PASS |
| 078 | [shell-tests] reorderArray handles 2-element arrays | PASS | PASS | PASS → PASS |
| 079 | [web-host] Topbar persistence at App level (replaces TP1-Persist … TP3b-Persist) APP-AP1 — every Topbar choice persists today's exact bytes through… | PASS | PASS | PASS → PASS |
| 080 | [web-host] Topbar persistence at App level (replaces TP1-Persist … TP3b-Persist) APP-AP2 — a failing Topbar write keeps the choice checked and appl… | PASS | PASS | PASS → PASS |
| 081 | [web-host] Topbar persistence at App level (replaces TP1-Persist … TP3b-Persist) APP-AP2b — a Topbar write held behind the real per-key lock shows … | PASS | PASS | PASS → PASS |
| 082 | [web-host] one App-scoped controller APP-AP3 — a pane edit is visible in the Topbar and a Topbar edit in the pane in the same act | PASS | PASS | PASS → PASS |
| 083 | [web-host] one App-scoped controller APP-AP4 — Review on the Topbar status emits the shortcut event once and navigates once to the pane, which show… | PASS | PASS | PASS → PASS |
| 084 | [web-host] one App-scoped controller APP-AP5 — the Settings sidebar is never held by Appearance drafts (no route guard); the draft survives the rou… | PASS | PASS | PASS → PASS |
| 085 | [web-host] the sign-out step before requestSettingsDeparture APP-AP6 — fallback branch without drafts: zero confirm and the existing sequence compl… | PASS | PASS | PASS → PASS |
| 086 | [web-host] the sign-out step before requestSettingsDeparture APP-AP7 — fallback branch with a failed draft: one confirm; Cancel keeps identity, dra… | PASS | PASS | PASS → PASS |
| 087 | [web-host] the sign-out step before requestSettingsDeparture APP-AP8 — coordinator branch with a failed draft: Cancel resolves false before the coo… | PASS | PASS | PASS → PASS |
| 088 | [web-host] crash safety and the retired event path APP-AP9 — xai_pref_lang="fr" at load leaves /app rendering with defaults, zero writes and the by… | PASS | PASS | PASS → PASS |
| 089 | [web-host] crash safety and the retired event path APP-AP9 — xai_pref_lang=null at load leaves /app rendering with defaults, zero writes and the by… | PASS | PASS | PASS → PASS |
| 090 | [web-host] crash safety and the retired event path APP-AP9 — xai_pref_lang=1 at load leaves /app rendering with defaults, zero writes and the bytes… | PASS | PASS | PASS → PASS |
| 091 | [web-host] crash safety and the retired event path APP-AP9 — xai_pref_lang="EN" at load leaves /app rendering with defaults, zero writes and the by… | PASS | PASS | PASS → PASS |
| 092 | [web-host] crash safety and the retired event path APP-AP9 — xai_pref_font_scale=0 at load leaves /app rendering with defaults, zero writes and the… | PASS | PASS | PASS → PASS |
| 093 | [web-host] crash safety and the retired event path APP-AP9 — xai_pref_font_scale=-1 at load leaves /app rendering with defaults, zero writes and th… | PASS | PASS | PASS → PASS |
| 094 | [web-host] crash safety and the retired event path APP-AP9 — xai_pref_font_scale=null at load leaves /app rendering with defaults, zero writes and … | PASS | PASS | PASS → PASS |
| 095 | [web-host] crash safety and the retired event path APP-AP9 — xai_pref_font_scale="big" at load leaves /app rendering with defaults, zero writes and… | PASS | PASS | PASS → PASS |
| 096 | [web-host] crash safety and the retired event path APP-AP9 — xai_pref_font_scale="1" at load leaves /app rendering with defaults, zero writes and t… | PASS | PASS | PASS → PASS |
| 097 | [web-host] crash safety and the retired event path APP-AP9 — xai_accent_hue=Infinity at load leaves /app rendering with defaults, zero writes and t… | PASS | PASS | PASS → PASS |
| 098 | [web-host] crash safety and the retired event path APP-AP10 — an Infinity accent written by another document while the App runs leaves the field so… | PASS | PASS | PASS → PASS |
| 099 | [web-host] crash safety and the retired event path APP-AP11 — a committed root change in another document is reflected live in <html>, the Topbar a… | PASS | PASS | PASS → PASS |
| 100 | [web-host] crash safety and the retired event path APP-AP12 — Appearance edits, Retry all and Reset emit no web:settings:preference-changed and App… | PASS | PASS | PASS → PASS |
| 101 | [web-host] App lazy-init from localStorage (APP-LP1..APP-LP5) APP-LP1 — xai_pref_theme='dark' in localStorage → html data-theme='dark' on mount | PASS | PASS | PASS → PASS |
| 102 | [web-host] App lazy-init from localStorage (APP-LP1..APP-LP5) APP-LP2 — xai_pref_lang='zh' in localStorage → Topbar marks 中文 as selected | PASS | PASS | PASS → PASS |
| 103 | [web-host] App lazy-init from localStorage (APP-LP1..APP-LP5) APP-LP3 — xai_pref_density='compact' in localStorage → html data-density='compact' on… | PASS | PASS | PASS → PASS |
| 104 | [web-host] App lazy-init from localStorage (APP-LP1..APP-LP5) APP-LP4 — localStorage empty → three dims use fallback (en/light/comfortable) | PASS | PASS | PASS → PASS |
| 105 | [web-host] App lazy-init from localStorage (APP-LP1..APP-LP5) APP-LP5 — corrupt JSON in xai_pref_theme → JSON.parse fails → fallback to 'light' (no… | PASS | PASS | PASS → PASS |
| 106 | [web-host] readLocalPref unit tests returns fallback when key absent | PASS | PASS | PASS → PASS |
| 107 | [web-host] readLocalPref unit tests returns parsed value when key present with valid JSON | PASS | PASS | PASS → PASS |
| 108 | [web-host] readLocalPref unit tests returns fallback when value is corrupt JSON | PASS | PASS | PASS → PASS |
| 109 | [web-host] App.tsx handleSignOut (APP-SO1..APP-SO4) live cleanup failure is visible and does not redirect or call shared cleanup | PASS | PASS | PASS → PASS |
| 110 | [web-host] App.tsx handleSignOut (APP-SO1..APP-SO4) superseded A cleanup cannot navigate away from a new B login | PASS | PASS | PASS → PASS |
| 111 | [web-host] App.tsx handleSignOut (APP-SO1..APP-SO4) live confirmed cleanup redirects through the coordinator only | PASS | PASS | PASS → PASS |
| 112 | [web-host] App.tsx handleSignOut (APP-SO1..APP-SO4) APP-SO1 — happy path: signOut + clearSessionStorage + redirect all called | PASS | PASS | PASS → PASS |
| 113 | [web-host] App.tsx handleSignOut (APP-SO1..APP-SO4) APP-SO2 — order: signOut before clearSessionStorage before assign | PASS | PASS | PASS → PASS |
| 114 | [web-host] App.tsx handleSignOut (APP-SO1..APP-SO4) APP-SO3 — network error on signOut: clearSessionStorage + assign still called (best-effort) | PASS | PASS | PASS → PASS |
| 115 | [web-host] App.tsx handleSignOut (APP-SO1..APP-SO4) APP-SO4 — null client: skips signOut, still calls clearSessionStorage + assign | PASS | PASS | PASS → PASS |
| 116 | [web-host] Shell cross-package smoke (A1..A4) A1 — App renders Shell with Topbar (search button present, xai-web-cmdk P4) | PASS | PASS | PASS → PASS |
| 117 | [web-host] Shell cross-package smoke (A1..A4) A1b — App renders AppRail (aside.app-rail present) | PASS | PASS | PASS → PASS |
| 118 | [web-host] Shell cross-package smoke (A1..A4) A2 — StrictMode double-mount does not throw | PASS | PASS | PASS → PASS |
| 119 | [web-host] Shell cross-package smoke (A1..A4) A3 — App applies default theme on mount (data-theme is set) | PASS | PASS | PASS → PASS |
| 120 | [web-host] Shell cross-package smoke (A1..A4) A4 — App renders without crash when no child route matches | PASS | PASS | PASS → PASS |
| 121 | [web-host] rail feature filter against real webShellModuleRegistrations AC-APP-1: default prefs (all true) → all real registrations pass through | PASS | PASS | PASS → PASS |
| 122 | [web-host] rail feature filter against real webShellModuleRegistrations AC-APP-2: flipping board off removes it from the filtered list | PASS | PASS | PASS → PASS |
| 123 | [web-host] rail feature filter against real webShellModuleRegistrations AC-APP-3: localStorage persistence — pref set survives a fresh hook mount | PASS | PASS | PASS → PASS |

#### E8 parent host (31)

| # | Case | `host-before1` | fixed `apprail-fixed1` | Transition |
| --- | --- | --- | --- | --- |
| 001 | FX1 F-B002 self-check: the Storage wrappers record and delegate exactly once; faulted attempts (including the rail-order quota fault) never delegat… | PASS | PASS | PASS → PASS |
| 002 | FX2 the Web Lock fixture: asynchronous grants and a test hold keeps a product request waiting until release | PASS | PASS | PASS → PASS |
| 003 | FX3 composition and drivers: the production App from the archive with only the auth hook substituted; the rail registry R; absent bytes display D(D… | PASS | PASS | PASS → PASS |
| 004 | PC clean state (coordinator branch): zero-write mount; no rail status and no unload warning; a successful drag stores exactly merge(S, R, P) = P wi… | PASS | PASS | PASS → PASS |
| 005 | PC2 clean state (fallback branch): sign-out without drafts asks nothing and completes (session storage cleared, redirect) | PASS | PASS | PASS → PASS |
| 006 | PC3 coordinator: with an Appearance draft only (no rail draft) the confirm list is exactly the Appearance text; Cancel resolves false | PASS | PASS | PASS → PASS |
| 007 | PC3 fallback: with an Appearance draft only (no rail draft) the confirm list is exactly the Appearance text; Cancel resolves false | PASS | PASS | PASS → PASS |
| 008 | H2 alone: a failed rail drag on /app/tasks keeps the dropped order displayed with the rail status and the unload warning; the bytes keep the commit… | FAIL | PASS | FAIL → PASS |
| 009 | H2 with-appearance: a failed rail drag on /app/tasks keeps the dropped order displayed with the rail status and the unload warning; the bytes keep … | FAIL | PASS | FAIL → PASS |
| 010 | route outcomes, alone G-rail alone: after a failed drag on /app/tasks an AppRail click to Calendar is not held (one navigation, no dialog); the rai… | FAIL | PASS | FAIL → PASS |
| 011 | route outcomes, alone G-sidebar alone: after a failed drag on /app/settings/appearance the Settings sidebar to About is not held (one navigation, n… | FAIL | PASS | FAIL → PASS |
| 012 | route outcomes, alone G-back alone: after a rail click to Calendar and a failed drag there, Back returns to /app/tasks unheld (no dialog); the rail… | FAIL | PASS | FAIL → PASS |
| 013 | route outcomes, with-appearance G-rail with-appearance: after a failed drag on /app/tasks an AppRail click to Calendar is not held (one navigation,… | FAIL | PASS | FAIL → PASS |
| 014 | route outcomes, with-appearance G-sidebar with-appearance: after a failed drag on /app/settings/appearance the Settings sidebar to About is not hel… | FAIL | PASS | FAIL → PASS |
| 015 | route outcomes, with-appearance G-back with-appearance: after a rail click to Calendar and a failed drag there, Back returns to /app/tasks unheld (… | FAIL | PASS | FAIL → PASS |
| 016 | U alone: after a failed drag a cancelable beforeunload warns on /app/tasks and after an AppRail navigation, with zero storage attempts in the handl… | FAIL | PASS | FAIL → PASS |
| 017 | U with-appearance: with an Appearance draft and a failed drag, unload warns; after the Appearance draft is discarded the rail draft alone still war… | FAIL | PASS | FAIL → PASS |
| 018 | sign-out, coordinator branch S-coordinator alone Cancel: from /app/tasks with a failed rail draft, one confirm with the rail text; Cancel resolves … | FAIL | PASS | FAIL → PASS |
| 019 | sign-out, coordinator branch S-coordinator alone OK: from /app/tasks with a failed rail draft, one confirm with the rail text; OK discards with zer… | FAIL | PASS | FAIL → PASS |
| 020 | sign-out, coordinator branch S-coordinator with-appearance rail Cancel: with a failed rail draft and an Appearance draft, the rail asks first; Canc… | FAIL | PASS | FAIL → PASS |
| 021 | sign-out, coordinator branch S-coordinator with-appearance OK, OK: the confirm list is exactly [rail text, Appearance text] and sign-out completes … | FAIL | PASS | FAIL → PASS |
| 022 | sign-out, coordinator branch S-coordinator with-appearance OK, Cancel: the confirm list is exactly [rail text, Appearance text]; sign-out resolves … | FAIL | PASS | FAIL → PASS |
| 023 | sign-out, fallback branch S-fallback alone Cancel: from /app/tasks with a failed rail draft, one confirm with the rail text; Cancel resolves false … | FAIL | PASS | FAIL → PASS |
| 024 | sign-out, fallback branch S-fallback alone OK: from /app/tasks with a failed rail draft, one confirm with the rail text; OK discards with zero writ… | FAIL | PASS | FAIL → PASS |
| 025 | sign-out, fallback branch S-fallback with-appearance rail Cancel: with a failed rail draft and an Appearance draft, the rail asks first; Cancel res… | FAIL | PASS | FAIL → PASS |
| 026 | sign-out, fallback branch S-fallback with-appearance OK, OK: the confirm list is exactly [rail text, Appearance text] and sign-out completes (H9) | FAIL | PASS | FAIL → PASS |
| 027 | sign-out, fallback branch S-fallback with-appearance OK, Cancel: the confirm list is exactly [rail text, Appearance text]; sign-out resolves false … | FAIL | PASS | FAIL → PASS |
| 028 | H1 {} at /app/tasks: the App renders without the route error boundary, before and after a reload; the rail displays D(DEFAULT, R) with the source s… | FAIL | PASS | FAIL → PASS |
| 029 | H1 {} at /app/settings/appearance: the App renders without the route error boundary, before and after a reload; the rail displays D(DEFAULT, R) wit… | FAIL | PASS | FAIL → PASS |
| 030 | H1 1 at /app/tasks: the App renders without the route error boundary, before and after a reload; the rail displays D(DEFAULT, R) with the source st… | FAIL | PASS | FAIL → PASS |
| 031 | H1 1 at /app/settings/appearance: the App renders without the route error boundary, before and after a reload; the rail displays D(DEFAULT, R) with… | FAIL | PASS | FAIL → PASS |


## 9. New files (this commit; additions only)

25 logs and this receipt (26 files). Every log was created by its runner with an exclusive create under the new suffix `apprail-fixed1`. No existing file was overwritten or edited.

| File | SHA-256 |
| --- | --- |
| `web-apprail-order-recovery-sol/bytes-apprail-fixed1-f9eb4b1.log` | `68faf686902a88131d48adee20efe26b873a1c12fe670f6b2cbdc70eaf18a442` |
| `web-apprail-order-recovery-sol/domain-apprail-fixed1-f9eb4b1.log` | `86269b460d86f510291a07d25868c44ba3e56f47ffc0c73097f3664ec06c2f97` |
| `web-apprail-order-recovery-sol/merge-apprail-fixed1-f9eb4b1.log` | `b04a3f7de339b5dfc952b881ebf2d2d5f3ac1b1c84d22f3acd8413c276ad4c94` |
| `web-apprail-order-recovery-sol/drag-apprail-fixed1-f9eb4b1.log` | `d33ad45d331975b64a5f4812a2ff3b3dae8d3af7b76e113b946707ed148ff8f2` |
| `web-apprail-order-recovery-sol/field-apprail-fixed1-f9eb4b1.log` | `8fdcdf344b3c822b34f991c9907a0596aa712d19623ba2df9add8619939bff62` |
| `web-apprail-order-recovery-sol/continuity-export-apprail-fixed1-f9eb4b1.log` | `690eaede241f0b051ba1b8d07dbcd92f5d3a86dcd25f05a7e3d128c516635cc1` |
| `web-apprail-order-recovery-sol/host-apprail-fixed1-f9eb4b1.log` | `da51f57ae82fef2ef427fb0e3ce41a70152da51118ce450c2422978006d2b693` |
| `web-apprail-order-recovery-sol/original-apprail-fixed1-f9eb4b1.log` | `b39ba06662467f6fda79fb362f2f2ad2339bbc539086ea91babf0d3c493cfcaf` |
| `web-apprail-order-recovery-independent/host-apprail-fixed1-f9eb4b1.log` | `ba3c1bd4da61e26e14b7baa7ed8cf0717b29a79df610884c9f60a5b7199d86e5` |
| `web-sticky-recovery-f1/f1-f9eb4b1-sticky-apprail-fixed1.log` | `dd7e7eb0c9c898c93ac8130a8a9e8782efe51ec61d9be92f6609133fbebf7848` |
| `web-sticky-recovery-f1/f1-f9eb4b1-more-apprail-fixed1.log` | `06e923b28e8c1bfd53b262330e346b24d5bc50775810d7cfa54e2290ab76b7e0` |
| `web-sticky-recovery-f1/f1-f9eb4b1-collaborate-apprail-fixed1.log` | `4611bf588961094557c159f3d4a4bc9dcf47614325f8aae9b8eeb7abe86651ba` |
| `web-sticky-recovery-f1/f1-f9eb4b1-selfcheck-apprail-fixed1.log` | `7a30224c0df8399c004d1f829ed5fccbc3fab14eddd93591105a3d660b9fdc6d` |
| `web-sticky-recovery-f1/f1-f9eb4b1-notifications-apprail-fixed1.log` | `6e6a7e75300aeb5b1fc74a3008accadc27bfa6596791ba0705c5bfb0a099c9d4` |
| `web-sticky-recovery-f1/f1-f9eb4b1-date-time-apprail-fixed1.log` | `455c8e8723f2b89fc51a6fef98c8e088a0a76ec3b87c0bbb3614094d8de96414` |
| `web-sticky-recovery-f1/f1-f9eb4b1-smart-lists-apprail-fixed1.log` | `05343c94f866dc7d2104ea3b0cdeb18b51819cb500d4ddc09608bc50eb4e96f5` |
| `web-sticky-recovery-f1/f1-f9eb4b1-header-apprail-fixed1.log` | `ad15330c7a768ee4619aedfba3da90a36a288a81454f08525a2c2c7d1d819d36` |
| `web-sticky-recovery-f1/f1-f9eb4b1-pomodoro-apprail-fixed1.log` | `71f060c14777862b760a4c0719c713548715f9743fc686cc3e8d474b1f56c18c` |
| `web-sticky-recovery-f1/f1-f9eb4b1-race-apprail-fixed1.log` | `491ca292a3f3cf797707b45d25e71c9bed8e7dd8c4f29566667ebc53565d694b` |
| `web-features-recovery-f1/f1-f9eb4b1-selfcheck-apprail-fixed1.log` | `4d18f98c6e86a1d3b2a8538083315f2206c300c41a712b038271837dd5734d47` |
| `web-features-recovery-f1/f1-f9eb4b1-features-apprail-fixed1.log` | `bb8a138e0c357037205b65bfa027e3f88b7544af01e7c03479bcae839c27ef7a` |
| `web-apprail-order-recovery-f1/f1-f9eb4b1-selfcheck-apprail-fixed1.log` | `5c254065929f6097e39627df70c927dbd80a71fe81f6f7ca65fccdf8da54b1be` |
| `web-apprail-order-recovery-f1/f1-f9eb4b1-railorder-apprail-fixed1.log` | `d4aae5fdf2a93b7dda8908ab7122d19a43d51865e244f5d75d6de40bd6a8e4b5` |
| `web-native-keyinput-k1/f1-f9eb4b1-selfcheck-apprail-fixed1.log` | `13704c9040babe5c9cb206e6ac8af93b91fcef0f784187d5fb7378ac92c2fa2e` |
| `web-native-keyinput-k1/f1-f9eb4b1-appearance-apprail-fixed1.log` | `5e7667df608159d5374a58bf21fc3fecc45c0f7ab4dba04f4f0bf3ea62698104` |
| `web-apprail-order-recovery-sol/fixed-f9eb4b1.md` | this receipt (cannot carry its own hash) |

**Copies: none.** No frozen runner refused. Every precondition passed at the first run, including the docs-head product-tree checks, because `dac8cd3` has the same product tree as `f9eb4b1`. So no precondition-only copy was made, and no refusal log exists.

## 10. Disclosures

- **Iterations.** One run per unit (25 units), each the first and only. No diagnostic iteration was used out of the three allowed. No log is superseded.
- **Development probes.** None. No runner was executed with `XAI_F1_EVIDENCE_DIR`, and no scratch mirror, reference implementation or mutation was used.
- **Read-only analysis aids** (in the session scratchpad, not committed). Three small Node scripts parsed the committed logs:
  - one matched Sol and parent case lines by name;
  - one compared F1 check sequences and result records against the baselines;
  - one rendered §8.

  They read logs only and executed no product or oracle code. Their output is reproducible from the committed logs.
- **Browser.** The Chrome build is 155.0.8059.39. The E15/E17 `419e56d` baselines ran on 154.0.8037.97, which the batch-58 record already notes. Every check sequence is identical across the two builds, so the version change affected no outcome.
- **Transport.** E16 uses the pipe, as frozen. E15 and E17 use the DevTools WebSocket they were frozen with. Changing it would break the unchanged-hash requirement (E15) or widen the K-1 copy's deviation (E17). A dropped socket could only surface as a harness error, and none occurred.
- **Servers.** Only the runners' own `127.0.0.1` static servers and headless Chrome processes ran, each inside its realpath temp directory, and all were cleaned up afterwards. Afterwards no `xai-apprail-*` or `xai-f1-*` temp directory remained, and no Chrome remote-debugging process remained. The main checkout was used only as a read-only `XAI_DEPS_ROOT`.

## 11. Observations for the controller (none blocks)

1. **The D1 reading holds on trusted input too.**
   - In every rail F1 drag at `f9eb4b1`, the browser delivered `dragenter:Dashboard`, then `dragover:Dashboard`, and then, after the preview moved Tasks into Dashboard's slot, `dragenter:Tasks`, `dragleave:Dashboard`, `dragover:Tasks` and `drop:Tasks`.
   - The drop landed on the dragged button X itself, which §6 item 3 allows ("on any rail button including X").
   - The single denied write carries the expected reorder (`board`, `dashboard`, `tasks`, …).
   - The frozen precondition `trusted-dragstart-dragover-drop-dragend` was satisfied, so the controller's D1 ruling is consistent with the frozen trusted-drag oracle.
2. **The f1 locked transitions are recorded as `invalidations:3`.** These are the identity invalidation and the session provider's follow-up epochs, as disclosed in `before-419e56d.md` §6. The release-once oracle counts the single `signOut` and the single document request for `/`, as frozen.
3. **Gate coverage.** This batch supplies E7, E8, E15, E16 and E17 only. Gates 5 and 7 still need their other items: E10, plus the native and final items E9–E14 and E18–E25. Nothing here substitutes for them.

## 12. Remaining boundary

This receipt does not accept CP-APPRAIL-01 and closes no 312 item. These remain:
- native E9–E12;
- visual and keyboard E13–E14;
- the final-regression items E18–E25, including C-RD1 beside the frozen Features `downstream` and C-FD1 per §13;
- independent final acceptance.
