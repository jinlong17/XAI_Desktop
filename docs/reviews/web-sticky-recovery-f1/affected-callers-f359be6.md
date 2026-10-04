# Affected accepted-caller reruns at `f359be6` after the F1 coordinator repair (CP-STICKY-01, batch 14)

- **Date:** 2026-10-03 (local, UTC−7; log timestamps in UTC read 2026-10-04T05:0x).
- **Module:** `web`.
- **Control-plane item:** CP-STICKY-01, batch 14 ("本轮唯一任务"; rows "F1 协调器修复", "修复后独立重跑", "允许修改文件", and the F1 notes on the accepted callers).
- **Authority for the rerun list:** `impact-review.md` §5.1 (rerun table) and the precedent `../web-date-time-recovery-independent/shared-96c4915.md`.
- **Verifier:** an independent parent-role regression verifier, run by Claude Opus 5.5 in an isolated detached worktree (`.claude/worktrees/agent-a7c736b67a78cecf7`). It did not write the coordinator repair, any caller, any runner, fixture or oracle, or any earlier receipt.
- **Fixed points:**
  - repaired product `f359be6d838393e0f9e93efd80b88b5b09f6144e`;
  - docs checkout `2bdb02089231acae99386091f6450c669b0f61f4`. Its tree differs from `f359be6` only under `docs/` (`git diff --name-only f359be6 2bdb020` lists no path outside `docs/`).

> **Verdict: PASS (regression verification only).**
>
> | Caller | Runners / modes rerun at `f359be6` | Result |
> | --- | --- | --- |
> | More | B2 host ordering, B1 native export, native `host` | 3/3 PASS, runtime errors 0; B1 disk files byte-identical to the accepted `7b216a3` files |
> | Collaborate | Astra-final runner: pinned contracts, host, additional | 37/37, 8/8, 5/5 |
> | Notifications | Astra host, parent original host, 18 native modes | 15/15, 12/12, 18/18 modes PASS, runtime errors 0 |
> | Date & Time | 16 native modes, composed host original + advanced | 16/16 modes PASS, runtime errors 0; 8/8, 12/12 |
> | Smart Lists | 6 host-native modes, Astra runner (7 suites + package) | 6/6 modes PASS; 8, 10, 3, 5, 5, 39, 4 all passed |
> | Pomodoro | actual-host departure + advanced, Astra independent assertions | 9/9, 8/8; 18/18, 7/7, 24/24, 2/2 |
> | Dashboard Header | independent departure/advanced/followon, 18 native modes | 5/5, 5/5, 2/2; 18/18 modes PASS, runtime errors 0 |
> | Packages | `@repo/web` check-types, lint, test; settings-rest, pomodoro, dashboard-grid tests | all exit 0; web 28 files/156 tests, settings-rest 44/314, pomodoro 18/148, dashboard-grid 25/228 |
>
> - **No regression.** All 69 runner invocations and all 6 package gates exited 0. Every caller-suite count equals its historical accepted count. Package-level counts differ only where tests were added after the historical run (§3.5, §4). Every Chrome log has exactly the same record sequence as the historical accepted log for that mode, and every final record passes.
> - **No F1 signature anywhere.** None of the 86 new runner logs or the 6 package-gate logs contains `Invalid blocker state transition`, a `DepartureCoordinator` error, an unhandled error, a `PRECONDITION:` line, a `"pass":false` record or a `FAIL` line. All 23 caller-suite jsdom logs have zero stderr output. The two Settings-rest package-duplicate logs each contain one React act() warning block.
> - **No unknown items.** Every runner on the batch-14 list was located and ran validly, each exactly once with suffix `f1post1`. There was no environment failure, so no second run exists.
> - **Scope.** This is **regression verification only. It is not acceptance and it closes no 312 item:** `SET-12`, `REL-05`, `QA-01`, `QA-03`, `QA-04`, `QA-09`, D2/REL/AI and every other open item stay open. The accepted callers' acceptance records are neither renewed nor revoked by this receipt. This batch added files only. No product file, runner, fixture, oracle, existing log or receipt, contract, ledger or control plane was changed. Nothing was pushed, merged, rebased, tagged, deployed, released or synced Web→Desktop.

## 1. Inputs verified

- **Worktree.** `git status --short` was empty. Then `git checkout --detach 2bdb020…`. HEAD is `2bdb02089231…`, the status was clean, and `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` was empty.
- **Product under test.** The coordinator in the worktree and in `git show f359be6:…` is `apps/web/src/routes/modules/departureCoordinator.tsx` = `0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075` (the repaired version; `210abdf` is `08e94607…`, see `post-f359be6.md` §1).
- **Dependencies.** `pnpm install --frozen-lockfile --offline` in the worktree (exit 0; output git-ignored). `pnpm-lock.yaml` SHA-256 is `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` in the worktree and in `git show f359be6:pnpm-lock.yaml`. The older runners link `node_modules` from the worktree root. `verify-gaps.mjs` was given `XAI_DEPS_ROOT=<this worktree>` and enforced its own lockfile gate (recorded in its baseline record). The main checkout and other worktrees were not used.
- **Runtime.** Node `v24.16.0`, pnpm `9.0.0`, Chrome `154.0.8037.97` headless (all 61 Chrome logs), Vitest `v3.2.7` (all 29 Vitest outputs). The historical logs used Chrome 152/153.
- **Runner integrity.** The 38 runner, fixture and test files used (listed in §7) were hashed before the first run and re-checked after the last: 38/38 unchanged, and `git status` shows no modified file. The More runner and fixture match the hashes in `../web-more-recovery-evidence/completion-7b216a3.md`: `verify-gaps.mjs` `48c9c868…`, `native.tsx` `966cfc81…`.
- **Recorded product.** All 61 Chrome logs record baseline commit `f359be6` (59) or the full SHA (2). All 25 runner Vitest logs record `revision=f359be6 fixed_commit=f359be6d838393e0f9e93efd80b88b5b09f6144e`.

## 2. Commands

Run from the worktree root, one process per line, strictly sequentially. A scratch driver (not committed) ran them in this order and would have stopped at the first non-zero exit; none occurred. An empty second argument (`""`) selects all modes of that runner, exactly as in the `96c4915` precedent. Runner temporary archives and Chrome profiles went to the system temp directory and were removed by the runners (0 remained).

```sh
W=.claude/worktrees/agent-a7c736b67a78cecf7   # absolute path used in practice
# More
XAI_DEPS_ROOT=$W node docs/reviews/web-more-recovery-evidence/verify-gaps.mjs f359be6d838393e0f9e93efd80b88b5b09f6144e b2-host-ordering f1post1
XAI_DEPS_ROOT=$W node docs/reviews/web-more-recovery-evidence/verify-gaps.mjs f359be6d838393e0f9e93efd80b88b5b09f6144e b1-native-export f1post1
node docs/reviews/web-more-recovery-native/verify-native.mjs f359be6 host f1post1
# Collaborate (contracts, host, additional)
node docs/reviews/web-collaborate-recovery-astra-final/verify-fixed.mjs f359be6 "" f1post1
# Notifications
node docs/reviews/web-notifications-recovery-astra/verify-fixed.mjs f359be6 host f1post1
node docs/reviews/web-notifications-recovery-independent/verify-fixed.mjs f359be6 host f1post1
node docs/reviews/web-notifications-recovery-native/verify-native.mjs f359be6 <mode> f1post1
#   <mode> = controls route signout unload clean hidden-export toggle-states uncertainty crossdoc-conflict
#            uncertainty-read-retry owner export-all export-sparse pending focus source latest-pending-retry predecessor-failure
# Date & Time
node docs/reviews/web-date-time-recovery-native/verify-native.mjs f359be6 <mode> f1post1
#   <mode> = controls route rail signout unload clean pending uncertainty uncertainty-conflict crossdoc-conflict
#            uncertainty-read-retry export-all export-sparse owner source focus
node docs/reviews/web-date-time-recovery-independent/verify-fixed.mjs f359be6 "" f1post1        # host (original), advanced
# Smart Lists
node docs/reviews/web-d2-smart-lists-host-native/verify-native.mjs f359be6 <mode> f1post1
#   <mode> = back back-programmatic same-turn-routes same-turn-route-signout cleanup journey
node docs/reviews/web-smart-lists-recovery-astra/verify-fixed.mjs f359be6 "" f1post1            # export host host-entry host-wrapper app original39 original-parent package
# Pomodoro
node docs/reviews/web-pomodoro-departure-independent/verify-fixed.mjs f359be6 "" f1post1        # departure advanced package
node docs/reviews/web-pomodoro-departure-astra/verify-fixed.mjs f359be6 "" f1post1              # draft export dv2 completion
# Dashboard Header
node docs/reviews/web-dashboard-header-departure-independent/verify-fixed.mjs f359be6 "" f1post1 # departure advanced followon
node docs/reviews/web-dashboard-header-departure-native/verify-native.mjs f359be6 <mode> f1post1
#   <mode> = route rail signout unload unsubmitted widget offset-conflict export-denied device-owner mixed-note-fail
#            mixed-offset-fail offset-uncertainty blur-control slow-rail slow-widget slow-nonnav add-widget-blur topbar-settings
# Packages (worktree root)
pnpm --filter @repo/web check-types
pnpm --filter @repo/web lint
pnpm --filter @repo/web test
pnpm --filter @repo/plugin-web-settings-rest test
pnpm --filter @repo/plugin-web-pomodoro test
pnpm --filter @repo/plugin-web-dashboard-grid test
```

Process exit codes: 69 of 69 runner invocations exited 0 (68 driver lines plus the B2 command, which ran first on its own). Total runner wall time was 433 s. Each package gate exited 0 (§4).

## 3. Results by caller

Column guide. **Result:** the Vitest count, or for Chrome logs the number of JSONL records and the final record. **Runtime:** the runtime-error count the runner itself captured (CDP exceptions and console errors). **Historical:** the accepted log used for comparison. "Same record sequence" means the new log has exactly the same record names, in the same order, after the baseline record. All logs live in the caller's own directory under `docs/reviews/`.

### 3.1 More (accepted `7b216a3`; F1 confirmed there at `210abdf`)

| Runner / mode | New log | Result | Runtime | SHA-256 | Historical |
| --- | --- | --- | --- | --- | --- |
| B2 `b2-host-ordering` | `web-more-recovery-evidence/gap-f359be6d838393e0f9e93efd80b88b5b09f6144e-f1post1-b2-host-ordering.log` | 7 rec, final `native` pass=true | 0 | `ae48ed23dad8636971dc0e8074cf919776b7483c11900317ee3e0b03c6bdbd2d` | `gap-7b216a3…-20260918-final-b2-host-ordering.log`: 7 rec, pass=true, same record sequence |
| B1 `b1-native-export` | `web-more-recovery-evidence/gap-f359be6d838393e0f9e93efd80b88b5b09f6144e-f1post1-b1-native-export.log` | 6 rec, final `native` pass=true | 0 | `9860beb3773c4f73d05c0df350dd0b5481ce02f4dbd6f85db5d1b0fc862144a9` | `gap-7b216a3…-20260918-final-b1-native-export.log`: 6 rec, pass=true, same record sequence |
| native `host` | `web-more-recovery-native/native-f359be6-f1post1-host.log` | 16 rec, final `native` pass=true | 0 | `485a402d744a09a8570dbc7d9bf3e63daf6e10a76453fe0f0033e14901262a0b` | `native-7b216a3-control-plane-20260917-n2-v1-host.log`: 16 rec, pass=true, same record sequence |

- **B2.** `held-intent-exactly-once` passed again: one router commit, `PUSH /app/settings/date_time`; exactly one `pushState`, zero `replaceState`, zero `popstate`; dialog and beforeunload cleared. Back, Stay, Discard and Forward restored the exact location keys (`history-key-preservation`).
- **B1 disk exports.** The three downloaded files are byte-identical to the accepted `7b216a3` artifacts:

  | New artifact | SHA-256 | Accepted artifact |
  | --- | --- | --- |
  | `b1-f1post1-sparse-reset-more-draft.json` | `f5079a1d387560940c2b258f705880ac3f80edf77c87b713c0ed92fd65b4f5d5` | `b1-20260918-final-sparse-reset-more-draft.json`, same hash |
  | `b1-f1post1-mixed-set-reset-more-draft.json` | `6263bc9087b81d8705eaf2248bffac7b9727509ed09e31361eb51dba8ea49f5b` | `b1-20260918-final-mixed-set-reset-more-draft.json`, same hash |
  | `b1-f1post1-locked-device-reset-more-draft.json` | `f5079a1d387560940c2b258f705880ac3f80edf77c87b713c0ed92fd65b4f5d5` | `b1-20260918-final-locked-device-reset-more-draft.json`, same hash |

- **Verdict: PASS.** Together with More's `verify-f1.mjs` mode (PASS at `f359be6`, `post-f359be6.md`), every More rerun that §5.1 lists has now passed on the repaired product.

### 3.2 Collaborate (accepted `ad689dd`; regression control)

| Suite | New log (`web-collaborate-recovery-astra-final/`) | Result | Exit | SHA-256 | Historical |
| --- | --- | --- | --- | --- | --- |
| pinned contracts | `contracts-f1post1-f359be6.log` | 37/37 passed | 0 | `67ecb8031fb8fafbcff557e53e8eef5df950aea8bb209cd55ce0cd5cecd62ab9` | `contracts-ad689dd.log`: 37/37, exit 0 (also 37 in `contracts-shared-retry-96c4915.log`) |
| host | `host-f1post1-f359be6.log` | 8/8 passed | 0 | `bed74a5ef2a4d2406065f3ad29d81d580c56a8aadf2e96e0d8836221a021df5e` | `host-ad689dd.log`: 8/8, exit 0 |
| additional | `additional-f1post1-f359be6.log` | 5/5 passed | 0 | `a15592e56fbc70d40445c2ec98da9514bcc5fd0aa6caabc183f52b24b9a775c0` | `additional-ad689dd.log`: 5/5, exit 0 |

The pinned contract, fixture and host files are read from `69c7bcd` by the runner, unchanged. **Verdict: PASS.**

### 3.3 Notifications (accepted `afbfb24`)

| Suite / mode | New log | Result | Runtime / exit | SHA-256 | Historical |
| --- | --- | --- | --- | --- | --- |
| Astra host | `web-notifications-recovery-astra/host-f1post1-f359be6.log` | 15/15 passed | exit 0 | `07ce2e5006f46c603e1a193151d501122c02e59fdd71fbcc83e60d07093660e9` | `host-final-afbfb24.log`: 15/15, exit 0 |
| parent original host | `web-notifications-recovery-independent/host-f1post1-f359be6.log` | 12/12 passed | exit 0 | `2eaab6b53f9641e180e3c30a656d1629b6cbfbfd52e79080f750ed8140886ce0` | `host-error-fixed-afbfb24.log`: 12/12, exit 0 |

Native modes (`web-notifications-recovery-native/`; each new log is `native-f359be6-f1post1-<mode>.log`; every final record is `native` pass=true with `runtimeErrors` 0):

| Mode | Records | SHA-256 | Historical (same record sequence, pass=true, Runtime 0) |
| --- | --- | --- | --- |
| controls | 12 | `9dc21833fa44ead286ed9c9fda701b758c4b9accce0de7eb88bec7474693b66e` | `native-afbfb24-final-current-controls.log` |
| route | 3 | `97fac2850d8938ae6a93d3fa05659e8329ed29cbd70fb223939ce94232a56239` | `native-afbfb24-final-current-route.log` |
| signout | 3 | `0cdd9cc7343ab4b220a05c28b89e1204cc27f7510d08206a6ede38fba67f68f1` | `native-afbfb24-final-current-signout.log` |
| unload | 3 | `e0379c2906009d4c9f9f6289576b67421ad44822e819238ec427bdbca0311abc` | `native-afbfb24-final-current-unload.log` |
| clean | 12 | `3df7192b843751699238a119d9ddceafc462f27e970c805207e565e8630f4fd8` | `native-afbfb24-final-current-clean.log` |
| hidden-export | 3 | `e19f9f5184cfafe18113f7c037a2bedf7088bfe73c83250e67290b2ebca31b0d` | `native-afbfb24-final-current-hidden-export.log` |
| toggle-states | 5 | `f96ee2440096aeb8675135634a5d0c5da9a88b47e77733fa76caba3e7ad3b99b` | `native-afbfb24-final-current-toggle-states.log` |
| uncertainty | 3 | `106acc9b2ddc6642a39ded821ca8c92cdc1e258265bc350ed9e35e6a3d42a79a` | `native-afbfb24-expanded-uncertainty.log` |
| crossdoc-conflict | 4 | `669aa690f05b4bc845cf0ab7be06dcaf7e3ad936fb31429876e6d38ca11a71f3` | `native-afbfb24-expanded-crossdoc-conflict.log` |
| uncertainty-read-retry | 3 | `fc9d247288157243968459b46e872e7369ee697f1dc71d866340b49fe83d4ecb` | `native-afbfb24-expanded-uncertainty-read-retry.log` |
| owner | 4 | `bba36ba7e3ba62d7968cad6fdd224221513c04abed0d75ef86d45f7f70192e86` | `native-afbfb24-expanded-owner.log` |
| export-all | 3 | `cacece8cedc5c8145d158bf070cbd398593cb64b80547c605f14258f73d63ef5` | `native-afbfb24-expanded-export-all.log` |
| export-sparse | 3 | `bb5375f1e6fa8adfbbce604dfe0e6aad91e0d5f207fb9f3aec1f216b9017073b` | `native-afbfb24-expanded-export-sparse.log` |
| pending | 3 | `142e9110ece97c2e08ecc7e92643d7c9a7fe63d9f502a837ce9ca367f76a881d` | `native-afbfb24-expanded-pending.log` |
| focus | 3 | `9ee7d365ff08a4e3b62e5fe1484df747354167e309392ab0a8ea794f728bea73` | `native-afbfb24-expanded-focus.log` |
| source | 3 | `bd0412e64d056353f20d602be951ded88ca10b6e75b0761eae82dd1972145bf3` | `native-afbfb24-final-source.log` |
| latest-pending-retry | 4 | `734e62ad27b281e0528b662de2c4465d5ef3a31d087ed4bb6274d98934e125a3` | `native-afbfb24-native-typeahead-latest-pending-retry.log` |
| predecessor-failure | 4 | `799e64701b4ff5f1d3712ddd0180b401867307018f7aede19e88cfc9cc038d3d` | `native-afbfb24-native-typeahead-predecessor-failure.log` |

`toggle-states` also wrote its three geometry screenshots: `native-f359be6-f1post1-toggle-states-on.png` (`05badd13ae8ce8e56b0d7d594ff06b3752aa01f61c45ba1e987b07e558baaa07`), `-off.png` (`44f535a2226256bd6ecd486c68ccdc2ffe0f64c7e83f2bc77bc5e04f9aa2b11f`) and `-on-again.png` (`6fdd53f87321229ef8020af41c286cd23e16b78ab4912a3d25e71f90d28df1fc`). The geometry gate is the runner's programmatic assertion; the `on` image was opened only to confirm that it shows the rendered Notifications pane. **Verdict: PASS** (15 + 12 jsdom cases, 18 of the 20 established native modes; the 2 visual modes are out of scope, §5).

### 3.4 Date & Time (accepted `d9d9fdd`)

Native modes (`web-date-time-recovery-native/`; each new log is `native-f359be6-f1post1-<mode>.log`; every final record is `native` pass=true with `runtimeErrors` 0):

| Mode | Records | SHA-256 | Historical (same record sequence, pass=true, Runtime 0) |
| --- | --- | --- | --- |
| controls | 8 | `8508ff7a73757cba406d39f382b6c6bc9ea010c6a548a36246a49ccfa17b9d6e` | `native-d9d9fdd-queue-fixed-controls.log` |
| route | 4 | `5c01fb4e640a77a58f5a3c70082a5f45ae82e6b3903383df03acbc8ff0b06e75` | `native-d9d9fdd-queue-fixed-route.log` |
| rail | 4 | `a9e4e44f9c101444dba26d8218a2eabeb9d48145c57e4bedc87538db5c6b180e` | `native-d9d9fdd-queue-fixed-rail.log` |
| signout | 4 | `9ff618d5adbf726d265f90f9e918546eb58d8fda3e14ede7f27b35cd02ecd615` | `native-d9d9fdd-queue-fixed-signout.log` |
| unload | 4 | `53a6cc30bee5c7b1dc52ddb3dcd8c8536af8647345bbc0aa68fd8c5feb890f83` | `native-d9d9fdd-queue-fixed-unload.log` |
| clean | 4 | `68e5e1ea9dd68766c6bd748ecce05df3693622400866ce42d976c046746d94b6` | `native-d9d9fdd-queue-fixed-clean.log` |
| pending | 3 | `2d36ecc6ee7a993a14350f6d708d146700578bc5896bcbaa184e796bbddfeedb` | `native-d9d9fdd-queue-fixed-pending.log` |
| uncertainty | 3 | `5b1edb80ffe9cc3b197ae34f7e96f127e78846910efe46f1c498d51f243c085b` | `native-d9d9fdd-queue-fixed-uncertainty.log` |
| uncertainty-conflict | 3 | `ec58dba1296c80cc11ac816afeb446fc356d13d73b5ce08da9f21bb581329b1b` | `native-d9d9fdd-queue-fixed-uncertainty-conflict.log` |
| crossdoc-conflict | 4 | `b1c052af17287805e95c23b5ca966bbd8b8a7e429488eeaafeb0f51f5a57df68` | `native-d9d9fdd-queue-fixed-crossdoc-conflict.log` |
| uncertainty-read-retry | 3 | `9903aaca58e32c467b61fd66f6b20051af9b1205f7f016abf76f3e39de617b28` | `native-d9d9fdd-queue-fixed-uncertainty-read-retry.log` |
| export-all | 4 | `81baacfad42cbf9e4526d5e322d48c470c9454d45544c0ce7fe648dae62c0e35` | `native-d9d9fdd-queue-fixed-export-all.log` |
| export-sparse | 3 | `daa0512924cea7cc8a3f047de6a8be7ac31536c88a5f88ca4decb62061e25e21` | `native-d9d9fdd-queue-fixed-export-sparse.log` |
| owner | 4 | `ce6d5a81bd2a5fb2d54cee874a66ef0449dc53786bbc7e76e35ea7093e058149` | `native-d9d9fdd-queue-fixed-owner.log` |
| source | 3 | `92a66917253ab1d2078076d35f590d16cb54276ee548292f2e0a8645fae728e2` | `native-d9d9fdd-queue-fixed-source.log` |
| focus | 3 | `4722456af76bd8abf24d60fe6c26785f61db71f1762f37072949d048ad4a0afc` | `native-d9d9fdd-queue-fixed-focus.log` |

The same 16 modes also passed with Runtime 0 in the `96c4915` precedent (`native-96c4915-shared-retry-*.log`).

| Composed host suite | New log (`web-date-time-recovery-independent/`) | Result | Exit | SHA-256 | Historical |
| --- | --- | --- | --- | --- | --- |
| original (`host`) | `host-f1post1-f359be6.log` | 8/8 passed | 0 | `b4e40c165d4d384c907f93a04a5e3d57526f9e29b4a4b9f27de3ddc302371172` | `host-queue-fixed-d9d9fdd.log`: 8/8 (also 8 at `96c4915`) |
| advanced | `advanced-f1post1-f359be6.log` | 12/12 passed | 0 | `09294cf4ebd93b8a7a118e0c8e0659eba64a7a8c147801f22965e842690c4836` | `advanced-queue-fixed-d9d9fdd.log`: 12/12 (also 12 at `96c4915`) |

**Verdict: PASS.**

### 3.5 Smart Lists

Host-native modes (`web-d2-smart-lists-host-native/`; each new log is `native-f359be6-<mode>-f1post1.log`):

| Mode | Records, final record | SHA-256 | Historical (same record sequence, pass=true) |
| --- | --- | --- | --- |
| back | 3, `actual-host-departure` pass=true | `07435d18628cf28cc5c790b13fa428fce7e7cf406e53bc2b60262c2912dc3dda` | `native-a2c0fe0-back.log` |
| back-programmatic | 3, pass=true | `c8c270ebb03b5f5a8b18ba50b1cc047ae6adc97552ae3e3e506037c7a467bf53` | `native-a2c0fe0-back-programmatic.log` |
| same-turn-routes | 3, pass=true | `797b8a0506e851ff61015256b9d541cd8db7ac9ad5a172fe3f9d6bad80660870` | `native-a2c0fe0-same-turn-routes.log` |
| same-turn-route-signout | 3, pass=true | `7a6f3efdfcba8294fdd12e6a599a825cb7e730e5bf0c11918d90c33fc0831b9e` | `native-a2c0fe0-same-turn-route-signout.log` |
| cleanup | 3, pass=true | `9d5d91eaaafa7f1aa1777b4030ab8494d1080fbb8f87efd8a3fd5625d32adb4b` | `native-a2c0fe0-cleanup.log` |
| journey | 3, pass=true | `2c7266f29d41490aaf01fee61c3002e8ffe1959967bb5acb34f0218396fb3b04` | `native-115efb2-journey.log` |

"same-turn" in the batch list matches two existing modes, and both were run. **This runner captures no runtime errors** (it has no CDP exception or console listener), so its PASS covers navigation business assertions only, not F1's runtime-error gate. That gate is covered for Smart Lists by `verify-f1-callers.mjs` smart-lists (refuted, 90 checks, Retry/completion/discard all PASS at `f359be6`; `post-f359be6.md` §5).

Astra runner (`web-smart-lists-recovery-astra/`; each new log is `<suite>-f1post1-f359be6.log`; all exit 0; historical = `<suite>-shared-retry-96c4915.log`, the precedent's established set):

| Suite | Result | SHA-256 | Historical |
| --- | --- | --- | --- |
| export | 8/8 | `5d1ca03cdb2259cd298d06b632b3584ba5cb071fe5dda25a5de15b0a63a8e3e1` | 8/8 (also 8 at accepted `a2c0fe0`) |
| host | 10/10 | `1bcc92e1d28d6c7b4f51ba75e217529049e30789befed1125bd2a91ea038057f` | 10/10 (10 at `a2c0fe0`) |
| host-entry | 3/3 | `94f5c657dd69e813135a82b6bce59485c526a9939f5537f51793a1bcb02ac396` | 3/3 (3 at `a2c0fe0`) |
| host-wrapper | 5/5 | `6142a52688e329ee492270f6e7c9d35580214bc9981e9e621fdb27aba84349c7` | 5/5 |
| app | 5/5 | `53aadedd315227c2bbb2eab285a7c05f321e0b6feb60cfe754b94499f2738aa4` | 5/5 (5 at `a2c0fe0`) |
| original39 | 39/39 | `e4c9bce83d0b7ede468d59c144ddee524dbe5bc7a5da44b6f85678e7358924e5` | 39/39 (39 at `a2c0fe0`) |
| original-parent | 4/4 | `158d1208598fb2c2b111c26dc255aa4993db4e0e3e4b217ee2d77c4ce8c892da` | 4/4 |
| package (Settings-rest, duplicate) | 44 files / 314 | `2289f3b16d732ba8d7412324f966401d446665fa51fc57e52213934498351c6d` | 43 / 293 at `96c4915`; the package has since grown, and 44/314 equals the package gate in §4 |

**Verdict: PASS.**

### 3.6 Pomodoro (accepted `2962b49`)

| Suite | New log | Result | Exit | SHA-256 | Historical |
| --- | --- | --- | --- | --- | --- |
| actual-host departure | `web-pomodoro-departure-independent/departure-f1post1-f359be6.log` | 9/9 | 0 | `86708154ba4b9d867105dcb3d85fb40e9b26b7805b24dbc3001df82c1a008261` | `departure-parent-final-2962b49.log`: 9/9 (9 at `96c4915`) |
| actual-host advanced | `web-pomodoro-departure-independent/advanced-f1post1-f359be6.log` | 8/8 | 0 | `2cd06ee63ae2c15cfc3704c92433b18d4773e31d7c0ad44e290064d47336992e` | `advanced-parent-final-2962b49.log`: 8/8 (8 at `96c4915`) |
| package (Settings-rest, duplicate) | `web-pomodoro-departure-independent/package-f1post1-f359be6.log` | 44 files / 314 | 0 | `ba42efbc2a81c97d248b10e98277ebdff17fff3e8dfeddddc6ce37a1a593f5db` | 43 / 293 at `96c4915`; see §3.5 |
| Astra draft | `web-pomodoro-departure-astra/draft-f1post1-f359be6.log` | 18/18 | 0 | `afea810c0e9925ec5a4a89772a0a5c5dee045025bebc61d2532c98514ebca4d4` | 18/18 at `96c4915`; accepted `draft-mixed-followon-2962b49.log` 18/18 |
| Astra export | `web-pomodoro-departure-astra/export-f1post1-f359be6.log` | 7/7 | 0 | `05fc953833b906b982a9da3717d2f88f295b0383ccfbc0e855d8e486192903b5` | 7/7 (`2962b49`, `96c4915`) |
| Astra dv2 | `web-pomodoro-departure-astra/dv2-f1post1-f359be6.log` | 24/24 | 0 | `84bb1f0f5a685344ef90e199671d71173358dd0494bc3da7cee6237c93d40c37` | 24/24 (`2962b49`, `96c4915`) |
| Astra completion | `web-pomodoro-departure-astra/completion-f1post1-f359be6.log` | 2/2 | 0 | `26edb3ab901c480290a30be20f74e0623b47601937b30dfeffc2d2fff8d5cfc0` | 2/2 (`2962b49`, `96c4915`) |

The multi-draft Retry-released POP case that §5.1 recommends is covered by `verify-f1-callers.mjs` pomodoro (refuted, r1/f1 PASS at `f359be6`; `post-f359be6.md`), not by these suites. **Verdict: PASS.**

### 3.7 Dashboard Header (accepted `73b4eb9`)

| Suite | New log (`web-dashboard-header-departure-independent/`) | Result | Exit | SHA-256 | Historical |
| --- | --- | --- | --- | --- | --- |
| departure | `departure-f1post1-f359be6.log` | 5/5 | 0 | `b341d5dc44e19fb282c9343026b3d48b5dad88dae675bc6e257aacc7b7834107` | `departure-parent-final-73b4eb9.log`: 5/5 |
| advanced | `advanced-f1post1-f359be6.log` | 5/5 | 0 | `d8a171e5029242f4c4a17301bf7b9a0b5a6a69b5e2eb85b251f084fb8e377863` | `advanced-parent-final-73b4eb9.log`: 5/5 |
| followon | `followon-f1post1-f359be6.log` | 2/2 | 0 | `fddc12b18d2aa36508f3577d9f700f1f89637246d54c15f8206bbd3ad88e0d53` | `followon-parent-final-73b4eb9.log`: 2/2 |

Native departure suite (`web-dashboard-header-departure-native/`; each new log is `native-f359be6-f1post1-<mode>.log`; every final record is `supplemental` pass=true with `runtimeErrors` 0). The suite was taken as the non-visual modes behind the accepted native evidence (acceptance table, rows "Affected final native position/recovery" and "Native note navigation and full CSS"):

| Mode | Records | SHA-256 | Historical (same record sequence, pass=true, Runtime 0) |
| --- | --- | --- | --- |
| route | 5 | `e1ee3cbb53c31ed200b01a352ac950862c52764a56d34ff484eb6739658788f3` | `native-f64ad44-parent-final-route.log` |
| rail | 5 | `7040ff837cc89fad5cd33699de516a08930e85519c9cd9a2cb44a696e865d73a` | `native-f64ad44-parent-final-rail.log` |
| signout | 5 | `5e2c7006760d0baa7714f493de6cfaf6ea5100c662f48e958d79004358dc4879` | `native-f64ad44-parent-final-signout.log` |
| unload | 5 | `6b19242d2c3cd86b336c2a0332b5d76e2d0fd690ccef1bfa4ecefe246c95fcd6` | `native-f64ad44-parent-final-unload.log` |
| unsubmitted | 5 | `a78ea59b0a8b598a533ae5121b7464f00d7c27a9142b65e3cf377a5537bd20a8` | `native-f64ad44-parent-final-unsubmitted.log` |
| widget | 5 | `dbf11c046b9615c546a5b4822b12ff2b5ad2699c6908d8bcc3e9e9ea7d13d19b` | `native-f64ad44-parent-final-widget.log` |
| offset-conflict | 3 | `82d117da7c4768f10c4a14b33021a9515a9df3813fb335e9f4a37ad4163c8368` | `native-73b4eb9-sol-final-offset-conflict.log` |
| export-denied | 3 | `ed3752a7b880d7aec397282c7405321889641160e2c67047200b757c6cdf4b34` | `native-73b4eb9-sol-final-export-denied.log` |
| device-owner | 4 | `6508513faf6cc70227d25aeb3f3cf5dd66449df035dcc1cfc2d6d961d868a696` | `native-73b4eb9-sol-final-device-owner.log` |
| mixed-note-fail | 6 | `cab7b98ab8fa291b9d6336bda635fb98c1b39f8aec7e342526950a58bc1e51a7` | `native-73b4eb9-sol-final-mixed-note-fail.log` |
| mixed-offset-fail | 6 | `d6ca639442696d3b5f3546db42fd136f415776e02c8f6a0611e6aa9b62300bc8` | `native-73b4eb9-sol-final-mixed-offset-fail.log` |
| offset-uncertainty | 4 | `02a08f1a0b2c3bdd360a703565bdc7bca8904fc06191eec0e073ad97b8b4f0e6` | `native-73b4eb9-sol-final-offset-uncertainty.log` |
| blur-control | 3 | `7317a7e1f227930cac957d6f0dc5fb8c4041d83c32215356d6cf19acee9dfa18` | `native-f64ad44-sol-final-blur-control.log` |
| slow-rail | 3 | `973509473ab26a10b60757ace0f93fca7c6072d46f72c088ce15a6284421a955` | `native-f64ad44-sol-final-slow-rail.log` |
| slow-widget | 3 | `8b851f8db752f94590dc9a558340245678050a8259d02d45fce03ad2725cf110` | `native-f64ad44-sol-final-slow-widget.log` |
| slow-nonnav | 3 | `52a26836cb1f4612819923b96b4f57320ba5c547dbcda791cc168d525bec59e9` | `native-f64ad44-sol-final-slow-nonnav.log` |
| add-widget-blur | 3 | `8b9623cb5488de7221d98bd65e23bb350b5152204f52e97ceff40415a84acd90` | `native-f64ad44-sol-final-add-widget-blur.log` |
| topbar-settings | 3 | `967633a004b92926f23ee5f606d2ed1e320b8ed68f55d557b60dea1a5dea231e` | `native-f64ad44-sol-final-topbar-settings.log` |

**Verdict: PASS.**

## 4. Package gates (this directory)

Each gate ran `pnpm --filter <package> <script>` from the worktree root through a scratch helper (not committed). The helper used piped, non-TTY stdio and the inherited environment, with no overrides. It wrote a header (product, checkout HEAD, empty product delta, command, cwd, UTC start and finish, exit), followed by stdout and stderr, and it refused to overwrite.

| Gate | Log | Exit | Result | SHA-256 | Historical |
| --- | --- | --- | --- | --- | --- |
| `@repo/web check-types` (`tsc --noEmit`) | `pkg-f359be6-web-check-types.log` | 0 | no diagnostics | `490fe6efef832df1aca933332c4417a140c463c39899a7ba85f1858ee610b81a` | exit 0 at `7b216a3` (`../web-more-recovery-final/web-check-types-final-v1-7b216a3.log`); author self-check at `f359be6` |
| `@repo/web lint` (`eslint --max-warnings 0 .`) | `pkg-f359be6-web-lint.log` | 0 | no findings | `521e19865845e956fba19b2de49dcb29e26d4f92b3998fdcfe83ff740d93f31c` | exit 0 at `7b216a3`; author self-check at `f359be6` |
| `@repo/web test` | `pkg-f359be6-web-test.log` | 0 | 28 files / 156 tests passed | `cb4f3d623feb1340042847e7dbb31017ea884f9662bf6c13cdbc26fc09fb36a5` | 27 / 146 at `7b216a3`; the repair adds 1 file / 10 tests, so 28 / 156 (equals the author's self-check) |
| `@repo/plugin-web-settings-rest test` | `pkg-f359be6-settings-rest-test.log` | 0 | 44 / 314 | `800d3e4e691889927b72173cdd6bcb0ec3ba59c64a4c27f187b173ea149f9cca` | 44 / 314 (Terra at `210abdf`, no log); 43 / 300 at `7b216a3` before the Sticky tests |
| `@repo/plugin-web-pomodoro test` | `pkg-f359be6-pomodoro-test.log` | 0 | 18 / 148 | `068c0758d10f8c7cbe0c4088fcb572f6bf273bb45b346ff3948875016400dad6` | 18 / 148 at `2962b49` (`../web-d2-pomo-device-astra/package-author-final-2962b49.log`) |
| `@repo/plugin-web-dashboard-grid test` | `pkg-f359be6-dashboard-grid-test.log` | 0 | 25 / 228 | `44d61f6d8c6cfae5b744529659807c2d743f12c104cf09c9c87dcbf44c8fe813` | 25 / 228 at `73b4eb9` (`../web-dashboard-header-departure-terra/dashboard-package-73b4eb9.log`) |

- **`@repo/web test` includes the required suites:**
  - `settingsPaneComposition.test.tsx` (3);
  - `settingsPaneComposition.rest.test.ts` (3) and `.appearance.test.ts` (4);
  - `shellRegistrations.integration.test.tsx` (11);
  - the repair's `departureCoordinator.blocker.test.tsx` (10).
- **stderr is unchanged from history.** `web test` has 2 blocks: the build-manifest skip notices, also 2 at `7b216a3`. `dashboard-grid` has 10 blocks: intended quota-injection and duplicate-id warnings, also 10 at `73b4eb9`. `settings-rest` has 1 act() warning block.
- **Worktree after the gates.** The gates wrote nothing outside these logs; `git status` showed only the new evidence files.

## 5. Scope notes: not run, and why (no unknowns)

Every item on the batch-14 list ran; nothing is marked unknown. These existing modes and suites were deliberately not run. They are outside the listed scope, the same scope the `96c4915` precedent and §5.1 use. The controller may schedule any of them.

- **Visual and layout modes.**
  - Notifications `visual`, `visual-zh`;
  - Header `visual`, `visual-zh`, `source-only(-zh)`, `note-source(-zh)`, `frozen-source(-zh)`, `pointer-entry`;
  - More `visual`, `visual-zh`;
  - Date & Time `visual`, `visual-zh`, `toggle-states`.

  `f359be6` changes coordinator logic only, not DOM or CSS. The precedent's 16 Date & Time modes also exclude visual. EN/ZH visual and keyboard review is scheduled separately in the control plane.
- **Modes outside the explicit lists.**
  - More native `controls-reset` and `recovery-owner` (the list says "host mode(s)"; B1 covers More export).
  - Date & Time `latest-pending-retry`, `source-reload` and `predecessor-failure`. These were in the `d9d9fdd` 19-mode set but not in the 16 listed modes.
  - Smart Lists host-native `baseline`, `intent`, `programmatic`, `owner-signout`, `route-signout`, `focus-trap`, `focus`, `mobile`, `mobile-targets`.
  - The Smart Lists draft-native and pane-native runners.
  - The Collaborate native runners.
  - The Pomodoro native runner (`web-pomodoro-departure-native`). The list names the jsdom actual-host suite "(departure, advanced)".
  - The Notifications Astra boundaries and datetime modes, and the Sol suites.
  - The Header Astra and Sol component suites.
- **Already covered elsewhere.** Sticky, and the F1 modes of every caller, ran in batch 13 (`post-f359be6.md`, `3ea0310`) and were not repeated.

## 6. Limitations

- **Environment.** Headless Chrome 154 with synthetic local accounts and deliberate storage and Web Lock injection. This is not Tauri, not production auth and not a deployment. Historical Chrome logs used Chrome 152/153.
- **Single runs.** Each runner ran once. F1-class defects are timing-dependent, so one PASS cannot rule them out absolutely. The record-sequence identity shows the same checks ran, not identical timing.
- **Runtime-error coverage differs by runner.**
  - The Smart Lists host-native runner has no runtime-error capture (§3.5).
  - The jsdom runners gate on business assertions only. The observed zero stderr in all 23 caller suites is supporting, not gating, evidence that no error boundary or React error log fired.
  - The other Chrome runners gate on CDP exceptions and console errors (Runtime 0 throughout).
- **Duplicate Settings-rest runs.** The package was executed three times: the Smart Lists `package` mode, the Pomodoro-independent `package` mode and the §4 gate, each 44/314. These are duplicate executions, not 942 distinct tests, and the two runner modes are not Pomodoro package results.
- **Lockfile gate.** Older runners link the worktree's `node_modules`, and only `verify-gaps.mjs` enforces a lockfile gate. The worktree lockfile was verified equal to `f359be6`'s (§1).
- **Reading scope.** Native logs were compared by record names and final pass state. The per-record payload values were not re-adjudicated beyond the runners' own assertions, except for the More B1 artifact hashes and the B2 record cited in §3.1.

## 7. Files

**Runner, fixture and test inputs** (38 files, unchanged before and after; SHA-256 recorded in the scratch pre-run list and re-verified 38/38):

- `web-more-recovery-evidence/verify-gaps.mjs`
- `web-more-recovery-native/{verify-native.mjs, native.tsx}`
- `web-collaborate-recovery-astra-final/{verify-fixed.mjs, additional.test.tsx}`
- `web-notifications-recovery-astra/{verify-fixed.mjs, host.test.tsx, fixture.tsx}`
- `web-notifications-recovery-independent/{verify-fixed.mjs, host.test.tsx}`
- `web-notifications-recovery-native/{verify-native.mjs, native.tsx}`
- `web-date-time-recovery-native/{verify-native.mjs, native.tsx}`
- `web-date-time-recovery-independent/{verify-fixed.mjs, host.test.tsx, advanced-host.test.tsx}`
- `web-d2-smart-lists-host-native/{verify-native.mjs, native.tsx}`
- `web-smart-lists-recovery-astra/{verify-fixed.mjs, export, host, app, host-entry, host-wrapper .test.tsx}`
- `web-pomodoro-departure-independent/{verify-fixed.mjs, departure.test.tsx, advanced.test.tsx}`
- `web-pomodoro-departure-astra/{verify-fixed.mjs, fixture.tsx, draft-attribution.test.tsx, export-boundary.test.tsx}`
- `web-dashboard-header-departure-independent/{verify-fixed.mjs, departure, advanced, followon .test.tsx}`
- `web-dashboard-header-departure-native/{verify-native.mjs, native.tsx}`

**New files in this commit** (99, all additions):

| Directory | New files |
| --- | --- |
| `web-more-recovery-evidence/` | 2 logs + 3 B1 JSON exports |
| `web-more-recovery-native/` | 1 log |
| `web-collaborate-recovery-astra-final/` | 3 logs |
| `web-notifications-recovery-astra/` | 1 log |
| `web-notifications-recovery-independent/` | 1 log |
| `web-notifications-recovery-native/` | 18 logs + 3 toggle-state PNGs |
| `web-date-time-recovery-native/` | 16 logs |
| `web-date-time-recovery-independent/` | 2 logs |
| `web-d2-smart-lists-host-native/` | 6 logs |
| `web-smart-lists-recovery-astra/` | 8 logs |
| `web-pomodoro-departure-independent/` | 3 logs |
| `web-pomodoro-departure-astra/` | 4 logs |
| `web-dashboard-header-departure-independent/` | 3 logs |
| `web-dashboard-header-departure-native/` | 18 logs |
| `web-sticky-recovery-f1/` (this directory) | 6 package-gate logs + this receipt |

Every new log's SHA-256 is given in §3 and §4.
