# Post-repair reruns at `f359be6`: F1 modes and the double-Back race check (CP-STICKY-01, batch 13)

- **Date:** 2026-10-03
- **Module:** `web`
- **Control-plane item:** CP-STICKY-01, batch 13 ("本轮唯一任务"; rows "F1 协调器修复", "其余 caller 的 f1 before 复现" and "允许修改文件").
- **Verifier:** an independent Sol-role verifier, run by Claude Opus 5.5 in an isolated detached worktree (`.claude/worktrees/agent-a3872124dad5b4dc8`). It did not write the coordinator repair, the Sticky caller, the F1 impact review, the batch-11 before-reproductions or any frozen oracle.
- **Fixed points:**
  - repaired product `f359be6d838393e0f9e93efd80b88b5b09f6144e`;
  - before-evidence product `210abdf77562660372c47086db02bd21e870deb5`;
  - docs checkout `518fa42053c0f65f745cb0e09d043b429c2b40b5`, whose product tree is identical to `f359be6`.

> **Verdict: PASS (independent verification only).**
>
> | Evidence | Result at `f359be6` | Receipt |
> | --- | --- | --- |
> | `verify-f1.mjs` sticky / more / collaborate | 3/3 PASS, 62/62 checks each, 0 runtime errors | this file §5 |
> | `verify-f1-callers.mjs` six modes | 6/6 PASS; five registrant modes `refuted`, selfcheck `harness-valid` | this file §5 |
> | 11 required cases (`before-callers-210abdf.md` §10) | 11/11 FAIL (F1) → PASS | this file §5.2 |
> | Sticky h1 host matrix | PASS: 40/40 runtime gates, both end gates green | `../web-sticky-recovery-native/post-f359be6.md` |
> | Sticky native controls / export | PASS: 482 / 295 checks; 7 export files byte-identical to `210abdf` | `../web-sticky-recovery-native/post-f359be6.md` |
> | Sticky Sol five modes | PASS: 109/109 Sol cases, original ST1–ST10 10/10 | `../web-sticky-recovery-sol/post-f359be6.md` |
> | Sticky jsdom host oracle | PASS: 28/28 | `../web-sticky-recovery-independent/post-f359be6.md` |
> | New double-Back race check (Chrome) | PASS: 183 checks (89 preconditions, 90 product, 4 harness notes), 0 runtime errors | this file §6 |
>
> - **No regression.** No check or case went PASS → FAIL in any rerun. Every previously passing case and control still passes.
> - **Product hashes.** In every Chrome log that records them, only `apps/web/src/routes/modules/departureCoordinator.tsx` differs from `210abdf`: `08e94607…` → `0844a697…`.
> - **Declared behaviour changes.** All four changes the repair author declared, and the narrow race they pointed out, behave as declared and match contract §9 rows g, k and l (§7).
> - **Scope.** This is independent verification only. It is **not acceptance**, and it closes no 312 item: `SET-12`, `REL-05`, `QA-01`, `QA-03`, `QA-04`, `QA-09` and D2/REL/AI stay open. It adds files only. No product file, frozen runner, fixture, prelude, oracle, existing log, receipt, contract, ledger or control plane was changed. Nothing was pushed, merged, rebased, tagged, deployed, released or synced Web→Desktop. Accepted callers' own suites were not run (batch 14).

## 1. Inputs verified

- **Worktree.** `git status --short` was empty. Then `git checkout --detach 518fa42…`. HEAD is `518fa42053c0…`, the status is clean, and `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` is empty. Every Chrome log records `productDeltaVsDocsHead: ""`.
- **Product delta `210abdf..f359be6`** (`git diff --name-status`): `M apps/web/src/routes/modules/departureCoordinator.tsx` and `A apps/web/src/routes/modules/__tests__/departureCoordinator.blocker.test.tsx`. Nothing else.
- **Coordinator SHA-256.** `git show f359be6:…/departureCoordinator.tsx` = `0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075`. At `210abdf` it is `08e946074f8bfc9e6ecc8eeb61a34be13777eeffdb54ceb658fc5bf601bcff79`.
- **Lockfile gate.** `pnpm-lock.yaml` SHA-256 is `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` both for `git show f359be6:pnpm-lock.yaml` and for `XAI_DEPS_ROOT` (the main checkout, used read-only).
- **Runtime.** Node `v24.16.0`; Chrome `154.0.8037.97` headless (protocol 1.3), 1280×813, dpr 1; esbuild `0.28.1`; React and React DOM `19.2.0`; react-router `7.15.1`. These are the same as in the before-logs.

## 2. Frozen integrity (checked before any run)

Every SHA-256 below was recomputed and compared with the value its receipt records. **54 of 54 comparisons matched** (53 distinct files; the prelude is recorded in two receipts). `git log --name-status` over the five evidence directories shows only `A` entries, so no frozen file has ever been modified.

| File (this directory) | SHA-256 | Receipt |
| --- | --- | --- |
| `f1-prelude.js` | `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670` | `impact-review.md` §8, `before-callers-210abdf.md` §4 |
| `f1-host.tsx` | `af969a73dc25a88fd8399883a5cb8321b6613ec3729c2164a92d8c1d4518f734` | `impact-review.md` §8 |
| `verify-f1.mjs` | `816bd261a6bb6d72ad36322a898678a7f1f8d62173ca40f0f9d4cdf44f44c527` | `impact-review.md` §8 |
| `f1-210abdf-sticky-s1.log` | `3a331f56d9d01d35d8dca88e0cf47bba94a02b0eba9dc456992245676b083616` | `impact-review.md` §8 |
| `f1-210abdf-more-m1.log` | `a42501b23a0d9406047b456ea5746401434b84dc1b4deee8396692387e5f86c1` | `impact-review.md` §8 |
| `f1-210abdf-collaborate-c1.log` | `dafb4054fb501406b6dc79113a3da9da0a4eb936acdfd8d5e45a64f61c14bbc5` | `impact-review.md` §8 |
| `verify-f1-callers.mjs` | `88ccca3ddd7a99107f1dbec8ec87a18bc49e28ab3a245d19e4de688dc60314d1` | `before-callers-210abdf.md` §4 |
| `f1-callers-host.tsx` | `e636ffdb1eb0caa04e6c40507fb0dedefaf3c12a440be4db27067f9f196c0458` | `before-callers-210abdf.md` §4 |
| `f1-210abdf-{selfcheck-sc2, notifications-n2, date-time-t2, smart-lists-l2, header-h2, pomodoro-p1}.log` | `c0941961…`, `e507a1f6…`, `69268595…`, `1f2a99c1…`, `ced60bdf…`, `7ffb24a5…` | `before-callers-210abdf.md` §4 |
| superseded `f1-210abdf-{selfcheck-sc1, notifications-n1, date-time-t1, smart-lists-l1, header-h1}.log` | `7773e736…`, `d0a70739…`, `0dc76d9e…`, `4cfc604a…`, `8beed21b…` | `before-callers-210abdf.md` §4 |

The native, Sol and independent files are listed in their own receipts. Every after-log baseline records runner, fixture and prelude hashes equal to this table, so the reruns used exactly these files.

## 3. Commands

Run from the worktree root. `XAI_NATIVE_TMPDIR` only places the runners' temporary archive and Chrome profile in the session scratchpad; the runners delete them afterwards (none remained).

```sh
export XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop
export XAI_NATIVE_TMPDIR=<session scratchpad>
node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs f359be6 sticky post1
node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs f359be6 more post1
node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs f359be6 collaborate post1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs f359be6 selfcheck post1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs f359be6 notifications post1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs f359be6 date-time post1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs f359be6 smart-lists post1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs f359be6 header post1
node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs f359be6 pomodoro post1
node docs/reviews/web-sticky-recovery-f1/verify-f1-race.mjs f359be6 race post1      # new harness, §6
```

Console results, exit code 0 each time:

```text
PASS …/f1-f359be6-sticky-post1.log checks=62 r1:pass d1:pass r2:pass
PASS …/f1-f359be6-more-post1.log checks=62 r1:pass d1:pass r2:pass
PASS …/f1-f359be6-collaborate-post1.log checks=62 r1:pass d1:pass r2:pass
PASS …/f1-f359be6-selfcheck-post1.log verdict=harness-valid checks=31
PASS …/f1-f359be6-notifications-post1.log verdict=refuted checks=72 r1:pass d1:pass f1:pass
PASS …/f1-f359be6-date-time-post1.log verdict=refuted checks=72 r1:pass d1:pass f1:pass
PASS …/f1-f359be6-smart-lists-post1.log verdict=refuted checks=90 r1:pass d1:pass l1:pass f1:pass
PASS …/f1-f359be6-header-post1.log verdict=refuted checks=98 r1:pass d1:pass f1:pass o1:pass
PASS …/f1-f359be6-pomodoro-post1.log verdict=refuted checks=78 r1:pass d1:pass f1:pass
PASS …/f1-f359be6-race-post1.log verdict=pass checks=183 r1:0p/1r(held-with-dialog-for-live-blocker) r2:0p/1r r3:1p/0r(released-on-re-evaluation) r4:1p/0r k:0p/1r k-fresh:0p/1r g1:0p/1r g2:0p/1r g3:0p/0r l:0p/0r
```

Each frozen mode ran exactly once with suffix `post1`. No environment failure occurred, so no `post2` exists. The race harness needed 1 of its 3 allowed diagnostic iterations.

## 4. New files and hashes (this directory)

| File | SHA-256 | Lines |
| --- | --- | --- |
| `f1-f359be6-sticky-post1.log` | `11644bb9f77fb806568c7eccdc11537379d5623fdb2deeaebaada42f1d20195f` | 68 |
| `f1-f359be6-more-post1.log` | `ed81611992e9688554ef389ff459c60ad7a2664b46154d5d0d75d80c6fae6463` | 68 |
| `f1-f359be6-collaborate-post1.log` | `c38f3df81927c335b0311965b806ebe32cf4c5b234837e2306b6a0583d64f1c4` | 68 |
| `f1-f359be6-selfcheck-post1.log` | `b112bf1f3835aa6c2e9b86a5d50d404a795a162d6e3591441ff74320b4f4ddb2` | 34 |
| `f1-f359be6-notifications-post1.log` | `e2b04c6b884615e7afe9919020f5991db4d13837ab51e9cb977365d1680e4881` | 78 |
| `f1-f359be6-date-time-post1.log` | `8e0e64c8ac8dc094285c827d14b3fa34a2140b4e0c192eea92091f290c1b76f5` | 78 |
| `f1-f359be6-smart-lists-post1.log` | `9c814f77223884ee1914fa315ce01a20ab1d079015f6cdb9ee98c66ee6a76b41` | 97 |
| `f1-f359be6-header-post1.log` | `e3bff9a4211415044a9c66a87f07feb842676ae8ce7d7c0753891c8f3655c484` | 105 |
| `f1-f359be6-pomodoro-post1.log` | `ad06ea3eb480f1f59b1149d32be1e391fdf02b53ab5f328dd3d3a1b9c600d15d` | 84 |
| `verify-f1-race.mjs` (new race runner) | `3d009ac0b5b1f329f13c351a92a945d6b894a284f06018452a2aa44cbbb6bf18` | — |
| `f1-race-host.tsx` (new race fixture) | `3937baecba2810e0e22dfc11a0c3f7a1f288202d59ca95a8032f3430440d5382` | — |
| `f1-f359be6-race-post1.log` | `7a0462969da5678e7dbd8b2d1c148548588895589ab743c520e3d4cc57ca124a` | 199 |
| `post-f359be6.md` | this receipt | — |

**Baselines (record 2 of each log).**

| Runner | Bundle js SHA-256 (after) | Before (`210abdf`) | Inputs |
| --- | --- | --- | --- |
| `verify-f1.mjs` (3 modes, identical) | `8ecd089a48ca2a5196ca1079f3d5c456d91af8af7def5745e4da4d27437eb4f4` | `a07bffea…` | 629: 559 archive, 69 third-party, 0 foreign |
| `verify-f1-callers.mjs` (6 modes, identical) | `415079d6bb2dc4dc1a2b7b5242653e81492553bc9bbd28040140709dc82ca3df` | `dc00786b…` | 629: 559 / 69 / 0 |
| `verify-f1-race.mjs` | `749f5b6974b47907da1ea16c068d4e213f643a14b011271867d6727a518c08f8` | — | 629: 559 / 69 / 0 |

The CSS bundle is `4253982f…` in every log, as before. The bundle changes only because the coordinator changed.

## 5. F1 modes: before → after

### 5.1 Per mode

Check transitions are counted per check id between the frozen before-log and the `post1` log.

| Mode | Before log (`210abdf`) | Before | After (`f359be6`, `post1`) | Transitions |
| --- | --- | --- | --- | --- |
| sticky | `s1` | FAIL; 62 checks; 4 deferred failures; 4 runtime errors | PASS; 62; 0; 0 | 4 FAIL→PASS, 0 PASS→FAIL |
| more | `m1` | FAIL; 62; 4; 4 | PASS; 62; 0; 0 | 4 FAIL→PASS, 0 PASS→FAIL |
| collaborate | `c1` | PASS; 62; 0; 0 | PASS; 62; 0; 0 | all PASS→PASS |
| selfcheck | `sc2` | harness-valid; 31 | harness-valid; 31; 0 runtime errors | 31 PASS→PASS |
| notifications | `n2` | confirmed; 72; 6; 4 | refuted; 72; 0; 0 | 6 FAIL→PASS, 0 PASS→FAIL |
| date-time | `t2` | confirmed; 72; 6; 4 | refuted; 72; 0; 0 | 6 FAIL→PASS, 0 PASS→FAIL |
| smart-lists | `l2` | confirmed; 90; 12; 9 | refuted; 90; 0; 0 | 12 FAIL→PASS, 0 PASS→FAIL |
| header | `h2` | confirmed; 98; 3; 2 | refuted; 98; 0; 0 | 3 FAIL→PASS, 0 PASS→FAIL |
| pomodoro | `p1` | confirmed; 78; 6; 4 | refuted; 78; 0; 0 | 6 FAIL→PASS, 0 PASS→FAIL |

- **The checks that turned FAIL → PASS are exactly the F1 gates.**
  - sticky and more: `r1`/`r2` `blocker-proceed-exactly-once-from-blocked` and `zero-runtime-errors-no-error-boundary`.
  - Registrant modes: per failing case, those two plus `no-blocker-call-from-non-live-snapshot` (oracle #6).
- **Zero preconditions failed** in all nine logs. Console warnings are 0 everywhere.
- **Callers runner contract (`before-callers-210abdf.md` §10).** Every registrant mode exits 0 with `pass: true`, `verdict: "refuted"`, `deferredFailures: []` and `runtimeErrors: 0`. Every observation has `proceeds: 1`, `blockerThrows: []`, `callerFrames: []` and `errorUi: 0`.
- **`verify-f1.mjs` modes.** Every blocker call in the sticky, more and collaborate logs is one `proceed()` made while that object was the router's live `blocked` blocker: 9 calls, 0 non-live, 0 throws. Oracle #6 therefore also holds there.
- **Product hashes.** `verify-f1.mjs` records 9 files and `verify-f1-callers.mjs` 17. In both, `departureCoordinator.tsx` is the only difference from the before-logs. Every caller, composition, `settingsDeparture`, storage-engine and Shell hash is equal.

### 5.2 Required cases and controls

| Mode | Case | Before | After | After: proceeds / throws / caller frames / error UI |
| --- | --- | --- | --- | --- |
| notifications | r1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| notifications | f1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| date-time | r1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| date-time | f1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| smart-lists | r1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| smart-lists | d1 | FAIL (F1, before-commit variant) | **PASS** | 1 / 0 / 0 / 0 |
| smart-lists | l1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| smart-lists | f1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| header | o1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| pomodoro | r1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| pomodoro | f1 | FAIL (F1) | **PASS** | 1 / 0 / 0 / 0 |
| sticky | r1, r2 | FAIL (F1) | **PASS** | 1 proceed each, 0 non-live, 0 throws |
| more | r1, r2 | FAIL (F1) | **PASS** | 1 proceed each, 0 non-live, 0 throws |

**Controls that had to stay PASS, and did:** the d1 case of notifications, date-time, header and pomodoro; header r1 and f1 (note path); selfcheck (31/31); sticky d1; more d1; collaborate r1, d1 and r2.

**Observation.** Stale-snapshot commits still occur after the repair: 1–2 per case, for example notifications r1 seq 79 and 81, where the committed blocker is `#2 blocked` while the live blocker is `#3 proceeding`. The repair does not prevent stale renders. It refuses to bind, proceed, reset or publish from them, which is the rule the impact review required.

## 6. New race check (Chrome, `f359be6`)

### 6.1 Harness

New files: `verify-f1-race.mjs` (runner) and `f1-race-host.tsx` (fixture). The frozen `f1-prelude.js` is read unchanged; the log records its hash `67bbfaa7…`.

- **Composition and instruments.** The same as the frozen `f1-host.tsx`:
  - the production Shell, ComposedSettings, DepartureCoordinator and `settingsDeparture`, with `createBrowserRouter` and `RouterProvider` from `react-router/dom`, all from an immutable `git archive f359be6`;
  - attempt-level Storage with a per-key `setItem` fault, the lock trace, the click trace, history wrappers, the popstate trace and the router trace;
  - blocker `proceed()`/`reset()` wrappers that record the router's live blocker before delegating;
  - the `console.error` trace, the error-element detector and the frozen React commit observer.
- **Added instruments** (patterns of `../web-sticky-recovery-native/native-host.tsx`):
  - real `accountScope` transitions A→B→A;
  - a `beforeunload` listener tracker;
  - the router's original `navigate` reference;
  - root unmount;
  - a router blocker-map view;
  - a Navigation API entry view;
  - a dialog open/close log;
  - `armClickOnNextBlocked(name)`: a one-shot router subscriber, registered after RouterProvider's, that runs `HTMLElement.click()` on the named dialog button at the moment the router publishes a new `blocked` blocker;
  - `syncClicks(targets)`: several script clicks in one task.
- **Unsaved failed work.** The "Pin by Default" save failed under a per-key `setItem` fault, which stayed armed for the whole run. No case retries.
- **Input.** Browser Back is the browser's own traversal (CDP `Page.navigateToHistoryEntry`). Every other click is a trusted CDP click after a centre hit-test, except the clicks named "script" below.
- **Gates.** Product assertions are deferred. Preconditions stop the run. Harness notes record whether a targeted interleaving actually happened.
- **History.** Entries are hotkeys → P `/app/settings/date_time` (key `r584oyvr`, state `{"token":"race-P"}`) → S `/app/settings/sticky` (key `8b1dy3bw`).

### 6.2 Results (`f1-f359be6-race-post1.log`)

| Kind | Result |
| --- | --- |
| Preconditions | 89 / 89 |
| Product checks | 90 / 90 |
| Harness notes (interleaving actually exercised) | 4 / 4 |
| CDP runtime errors, console errors, error UI, console warnings, unexpected JS dialogs, observer errors | 0, 0, 0, 0, 0, 0 |

Blocker ids are the fixture's object ids. "First" is the blocker of the first Back and "second" the blocker of the second Back.

| Case | Scenario | First → second | Proceed / reset (blocker) | Outcome |
| --- | --- | --- | --- | --- |
| r1 | Back; second Back; **script** Stay before the second blocker rendered | #2 → #3 | 0 / 1 (#3) | The script Stay settled no blocker. #3 was re-evaluated and re-prompted ("held with dialog for live blocker"). A trusted Stay then reset #3 once. Location S, 0 commits, 0 push/replace, stack intact, draft kept, 0 writes. |
| r2 | Back; second Back; trusted Stay after #5 rendered | #4 → #5 | 0 / 1 (#5) | Rebind observed (intentVersion 5→6 committed with #5). #4 was never called. The dialog closed and did not reopen. Location S, stack intact, draft kept. |
| r3 | Back; second Back; **script** "Discard local changes and leave" before render | #6 → #7 | 1 / 0 (#7) | Released once on re-evaluation. The guard no longer blocked, so #7 proceeded once. One POP commit to P with key and state deep-equal, 0 push/replace, stack intact at P, 0 writes, no unload listener. |
| r4 | Back; second Back; trusted Discard after #10 rendered | #9 → #10 | 1 / 0 (#10) | Rebind observed (intentVersion 10→11). #9 was never called. One POP commit to P, stack intact. Two later stale commits (#10 `blocked` while the live blocker is #11 `proceeding`, one of them with a new guardVersion) were ignored. |
| k | Row k: held Back, then epoch A→B | #12 | 0 / 1 (#12) | The guard re-registered (guardVersion 27→29, seq 221) while #12 was still live, and the held intent was cancelled exactly once (reset, seq 222). A later stale commit (seq 225: #12 `blocked` while the live blocker was unblocked) caused no further call, and the dialog did not reopen. The device draft survived. A fresh Back (#13) was guarded, then Stay: 0 / 1. B→A with no intent: 0 blocker calls, no dialog. |
| g1 | Row g: held Back, then **script** Stay plus a **script** "Restore Default Size" edit in one task | #14 | 0 / 1 (#14) | After the reset, four commits rendered the stale `#14 blocked` snapshot while guardVersion rose 31→33→35 (re-registration while stale). The dialog did not reopen and no blocker stayed blocked. `restore_size` was saved once; the pin draft was kept. |
| g2 | Fresh trusted Back after Stay | #15 | 0 / 1 (#15) | Prompted again; Stay kept S. |
| g3 | Fresh trusted sidebar "Hotkeys" (PUSH) after Stay | — | 0 / 0 | Prompted again (held through the coordinator's navigate wrapper); Stay kept S; 0 commits. |
| l | Row l: held Back, then root unmount | #16 | 0 / 0 | The router-deleted blocker was never reset. The router blocker map is empty, so there is no phantom entry. The unload listener and the coordinator's navigate wrapper were removed. Location S, 0 history calls, 0 writes. A later browser Back committed one POP to P with no blocker. |

Assertions in every case:
- no blocker settled twice (`maxPerBlocker ≤ 1`);
- every blocker call made on the router's live `blocked` blocker (0 non-live calls);
- no blocker call threw and no `Invalid blocker state transition` anywhere;
- zero `console.error`, CDP exceptions and React Router error UI;
- the history stack is intact, comparing both CDP entry ids and Navigation API keys, with the index at S or, after a release, at P.

**Proof the windows were entered.**
- **r1 and r3 (preconditions).** The script click ran inside the router subscriber that published the second blocker: seq 54 and 102. At that instant the last committed coordinator blocker was the first one (#2, #6) and the live one was the second (#3, #7), recorded as `beforeRender: true`.
- **Same-flush rendering.** The second blocker was first rendered in the priority-1 (Immediate) commit right after the click (seq 56, 105). Inference, not separately instrumented: in this environment the "before render" window exists only inside the popstate task, where a trusted click cannot land. That is why the script click was used.
- **g1 (harness note).** Commits after the reset still carried the stale `#14 blocked` snapshot with higher guardVersions.
- **k and r2/r4 (harness notes).** The guard re-registered after the epoch change, and the rebind was committed.

## 7. Declared behaviour changes against contract §9

| Author's declared change (`f359be6`) | Evidence | Contract §9 | Result |
| --- | --- | --- | --- |
| Guard re-registration after Stay no longer reopens the dialog; a fresh user intent still prompts | g1: re-registration while the stale snapshot was rendered, no reopen, one reset. g2: fresh Back prompts. g3: fresh sidebar intent prompts. h1 row g (Stay, Escape, export) all PASS (native receipt) | row g: "a fresh intent after Stay prompts again" | **Confirmed** |
| An epoch change resets only once | k: exactly one reset of the held #12; no further call after the later stale commit; no reopen; device draft kept; fresh Back guarded. h1 k1–k3 all PASS | row k: "cancels the old intent while fresh device protection remains" | **Confirmed** |
| A second Back rebinds to the live blocker | r2/r4: rebind committed; Stay/Discard settled only the live second blocker; the first was never called | rows c/g/j (one release, history intact) | **Confirmed** |
| Unmount no longer resets a blocker the router has deleted | l: 0 blocker calls, no phantom blocker, unload listener and navigate wrapper removed. h1 row l (pending sign-out) all PASS | row l: "removes the guard and the unload listener" | **Confirmed** |
| Narrow race (author's note): Stay/Discard after the second Back and before the new blocker renders settles nothing; the new blocker is re-evaluated after it renders | r1: nothing settled, re-prompt for live #3, then one reset. r3: nothing settled, #7 proceeded once on re-evaluation | decision never lost; release exactly once (row i step 4 intent) | **Confirmed** |

## 8. Iterations and cost

- **Frozen modes:** 9 Chrome runs, each exactly once (`post1`).
- **Race harness:** 1 of 3 diagnostic iterations.
- **No Chrome development probes.** Scratch work outside the repository, with no browser: a syntax check of the new runner and an esbuild transform of the new fixture.
- Temporary archives and profiles were deleted. No `xai-*` temporary directory and no Chrome process remained.

## 9. Limitations

- **Environment.** Headless Chrome 154, not Tauri. React development builds, without the production `StrictMode` wrapper. Synthetic accounts, EN only, 1280×813.
- **Scheduling.**
  - F1 is scheduling-dependent, so one passing after-run cannot prove absence. Each of the 11 required cases and the 4 sticky/more F1 cases reproduced in every before-run in which it ran, and none reproduced here.
  - The race harness has no frozen before-run at `210abdf`. Its runner requires the docs-head product tree to equal the candidate.
  - Its sensitivity rests on the frozen blocker wrappers and CDP error capture, which caught F1 in batches 10–11, and on the precondition and notes proving each interleaving was entered.
  - By code reading only, not exercised: the unrepaired coordinator would have reopened the dialog in g1, reset the deleted blocker in l, and settled the stale first blocker in r2/r4.
- **Script clicks.** The r1/r3 "before render" clicks and the g1 Stay-plus-edit are script-dispatched (`isTrusted=false`) through React's real handlers. All other race inputs are trusted.
- **Dialog log.** The dialog log samples presence at microtask time. In r1 the close and the re-prompt happened inside one synchronous flush, so they appear only in the commit observer (intentVersion 2→3, seq 56→58), not as dialog transitions. End-state checks cover a persistent reopen.
- **Commit observer.** It reads private React 19.2 fiber fields. It is the frozen batch-10 prelude, unchanged.
- **Coverage.** Header note-text, script `history.back()` for the non-Sticky callers, production builds and other browsers stay outside these runs, as in batch 11.
