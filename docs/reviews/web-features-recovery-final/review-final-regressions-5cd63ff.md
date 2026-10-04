# Features final regression receipt (E18–E25) at `5cd63ff`

- **Caller:** CP-FEATURES-01, Settings Features (8 module toggles and Reset to defaults), module `web`, control-plane batch 30.
- **Contract:** `../web-features-recovery-contract/contract.md` §10 items 8–11, §11, §13 row 8, §14 (E18–E25 and the rules).
- **Fixed product:** `5cd63ff652f02a2c726187fe12cbc796218d31c0` (tree `404bf819a42e20b3e4d372c18a981832ccd54954`). **Before product:** `f359be6d838393e0f9e93efd80b88b5b09f6144e` (tree `2280bc7617d52dc6c4356da257d57940ecb174ec`).
- **Verifier:** independent final-regression verifier (Sol role), Claude Opus 5.5, in the isolated worktree `.claude/worktrees/agent-a63e67901aebc16c4`, detached at control-plane commit `cde91389f0a0baca69d266f5b6a6c5ff8098ac1f`. It did not write the contract, the oracles, the Features implementation, the coordinator repair or any earlier evidence.

**This receipt is the final-regression gate only.** It is not caller acceptance (batch 31). It closes no 312 item: REL-05, REL-07, REL-09, REL-10, SET-03, UX-03, UX-04, UX-05, SHELL-05, QA-01/03/04/09 and D2/REL/AI stay open. It authorizes no deployment, release, branch promotion or Web→Desktop sync.

## Verdict

**PASS (final-regression gate), with one frozen finding that needs a controller ruling (F-B002, §6).**

- **No product failure** was observed in any gate.
- **E18, E19, E20, E21, E22 and E23** all pass, and every count equals its accepted receipt or before control.
- **E24.** Every accepted-caller suite reproduces its accepted count at `5cd63ff`. The exception is that More Sol `boundaries` case 002 is **nondeterministic at both revisions**. The official runs gave 10/10 and then 9/10 at `5cd63ff`, and 9/10 and then 10/10 at `f359be6`.
  - **Root cause (F-B002):** the case's own `getItem` spy recurses without bound. This is a pre-existing oracle defect in `../web-more-recovery-sol/boundaries.test.tsx:19`, not a product defect.
  - **Why it is unrelated to Features:** the More and storage code is byte-identical at both revisions (E19).
  - **The correction works:** a minimal oracle correction (computing the key once, outside the spy; L18–19) passed 20/20 runs.
  - The difference is explained, so the "unexplained count difference" stop condition does not apply. The evidence is frozen nonetheless (§6), and the controller decides whether the More oracle needs a repair window.

| Gate | Fresh result at `5cd63ff` | Accepted receipt / control | Exit | Match |
| --- | --- | --- | --- | --- |
| E18 §10.9 search | 10 patterns; 9 changed rows, all in §11 files; 0 `new StorageEvent`, 0 `dispatchEvent(` in Features product source; 0 `usePref(`/`setPref(`/`removePref(`/`localStorage` in the pane and both helpers | `f359be6` counts (same log) | 0 | yes (75/75 assertions, 24/24 harness) |
| E19 §10.8 protected paths | 13/13 protected paths and 16/16 Features-protected files have identical object ids; the product-scope diff and the full diff outside `docs/` are exactly the 11 §11 files | contract §10.8, §11 | 0 | yes |
| E20 storage check-types | `tsc --noEmit` exit 0, 0 diagnostics | accepted `f359be6` exit 0 | 0 | yes |
| E20 Sol lifecycle (`bytes.test.tsx` L186–187) | `bytes` 17/17; lifecycle case 004 PASSED | E7 `bytes-fixed1` 17/17, E2 `bytes-before2` 17/17 (same case names and statuses) | 0 | yes |
| E21 features test | 7 files / 45 tests, including the 5 reader tests (17) | Terra commit message 45/45; `f359be6` control 6 / 23 | 0 | yes |
| E21 reader tests, before control | `f359be6`: 5 files / 17 tests (fixed: 17) | Sol `readers-features` 17/17 at both revisions | 0 | yes |
| E21 features typecheck / lint | exit 0 / exit 0 (23 files, 0 errors, 0 warnings) | `f359be6` control: exit 0 / exit 0 | 0 / 0 | yes |
| E22 web test | 28 files / 156 tests; railFeatureFilter 3, composition 3 + 4 + 3, cmdkIntegration 5, departureCoordinator.blocker 10 | accepted Sticky final 28 / 156 (per-file counts equal) | 0 | yes |
| E22 web check-types / lint | exit 0 / exit 0 (82 files) | accepted exit 0 / exit 0 | 0 / 0 | yes |
| E23 settings-shell test | 11 files / 54 tests (SettingsFooter 8) | `f359be6` control 11 / 54 (per-file equal); no accepted independent receipt exists | 0 | yes |
| E24 settings-rest test | 44 files / 314 tests | accepted 44 / 314 (per-file equal) | 0 | yes |
| E24 More Sol 79 | fields 22, reset 20, queues 14, boundaries **10 (v1) / 9 (v2)**, owner-export 13 | accepted 22 + 20 + 14 + 10 + 13 = 79 | 0 / v2 1 | **F-B002** |
| E24 More original / host | 15 / 11 | 15 / 11 | 0 | yes |
| E24 Sticky Sol 109 | bytes 13, fields 47, queues 27, continuity-export 22 | accepted `post1` 13 + 47 + 27 + 22 (ordered titles equal) | 0 | yes |
| E24 Sticky original / host | 10 / 28 | 10 / 28 (ordered titles equal) | 0 | yes |
| E24 Notifications Sol 41 | core 11, recovery 3, operations 2, boundaries 4, extended 10, original 11 | accepted 41 | 0 | yes |
| E24 Notifications Astra boundaries / Astra host / parent host | 24 / 15 / 12 | 24 / 15 / 12 | 0 | yes |
| E24 Date & Time | 7 | 7 | 0 | yes |

## 1. Fixed points and execution rules

**Worktree.**
- `git fetch origin codex/web/full-product-audit-20260908`, then `git checkout --detach cde91389f0a0baca69d266f5b6a6c5ff8098ac1f`, and `git status` was clean.
- `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty, so the docs head carries the fixed product unchanged.

**Dependencies.**
- `XAI_DEPS_ROOT` is the main checkout `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop`, used read-only. Nothing was installed, built or checked out there, and nothing was written into it.
- No `node_modules` was installed in this worktree.

**Every execution:**
- uses an immutable `git archive` of the requested SHA, extracted into a fresh OS temp directory (realpath) that is deleted afterwards;
- passes the lockfile gate: SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for the dependency checkout and `git show <rev>:pnpm-lock.yaml`. The Features Sol runner and the new runners also check the extracted lockfile, and the new runners also assert the contract constant;
- pins `@repo/*` into the archive with that runner's guard (§2);
- records `requested_revision` and `resolved_commit`;
- preserves nonzero exit codes, as the `verify-callers.mjs f359be6 all` (exit 1) and `more-boundaries … features-final-v2 5cd63ff` (exit 1) runs show.

**Runtime.** Node v24.16.0, pnpm 9.0.0, Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0 (all 46 Vitest logs of the new runners record the same store instance, whichever package's binary they ran), TypeScript 5.9.2 and ESLint 9.39.1, on darwin-arm64, tz America/Los_Angeles.

**Timing.** All official runs took place on 2026-10-04 between 08:43 and 09:16 PDT.

## 2. Runners: reused, and new where none met the rules

**Reused unchanged.** Each one's hash equals its accepted receipt.

| Runner | SHA-256 | Accepted in | Guard |
| --- | --- | --- | --- |
| `../web-features-recovery-sol/verify-fixed.mjs` | `b5ac75fa1bc5ff65352afb5b598dc7309fb7435aa9ca96518dfd1d7ffb2f2f16` | `README.md`, `fixed-5cd63ff.md` | 75 exact aliases + Vite guard plugin; L24 of the new log `harness_checks=PASS (6/6)` |
| `../web-sticky-recovery-sol/verify-fixed.mjs` | `3fba4b3b181d13431db9fe632fd68b70a4e51c6357168ec29aa89dd7977864c3` | `../web-sticky-recovery-sol/post-f359be6.md` | archive aliases; checkout `@repo` links never created |
| `../web-sticky-recovery-independent/verify-fixed.mjs` | `5a8ea1ddf40f47e5650e82656a174ef786403d418b1dd9f5a0553e0213da7260` | `../web-sticky-recovery-independent/post-f359be6.md` | same |

**Why the older caller runners were not reused.** The accepted More, Notifications and Date & Time suites, and the package gates, were last run by older runners:
- `../web-more-recovery-final/verify-final.mjs`;
- the More Sol and independent runners;
- the Notifications Sol, Astra and independent runners.

All of them link `node_modules` from their own checkout root. They have no lockfile gate and no module guard, and they never read `XAI_DEPS_ROOT`. In `verify-final.mjs`, `@repo` resolves through the checkout's workspace links, not into the archive. Running them would have required installing `node_modules` in this worktree, which batch 30 forbids, and they would still have failed the archive-pin rule. So, as the batch instructions require, three new runners were written. They follow the Features Sol runner's conventions:
- lockfile gate;
- private `node_modules` per workspace: third-party links from `XAI_DEPS_ROOT`, and `@repo` links to the archive's own folders;
- every tsconfig `extends` resolved inside the archive (46 checked, 0 unresolved);
- 75 exact-match `@repo` aliases;
- requested/resolved SHA in the log header;
- refusal to overwrite, with an exclusive create;
- exit = tool status, or 2 on a harness failure.

The new runners:

| New runner | SHA-256 (frozen before the evidence runs) | Covers | Guard |
| --- | --- | --- | --- |
| `verify-static.mjs` | `ddbf44bfa648a9b99e8cae86a041eaf4330eec119a3fa0bc3d2c72fd887bea5c` | E18, E19 (and the E6 file hashes) | Not applicable: it executes no product code. It scans two extracted archives and cross-checks every per-file count against `git grep -I -c -F` (24/24) |
| `verify-packages.mjs` | `f7758f28fd98cba97f2a04ba8a85b8410a381749f4aa8e8d1b6cca6a45653c05` | E20 storage, E21, E22, E23, E24 settings-rest | Vitest: the package's own `vitest.config.ts` imported unchanged, plus a guard plugin (no module from `<deps>` or this checkout's `packages/`, `apps/`, `docs/`; unaliased `@repo` must resolve inside the archive). tsc: `--listFiles`, with every program file required to be in the archive or in `<deps>/node_modules/.pnpm`. ESLint: a Node `module.registerHooks` resolution guard via `NODE_OPTIONS=--import` |
| `verify-callers.mjs` | `7e1aa8b244ed9f63568fa78de79052f980df21a0bad2245a3bbccb2f6ca3454c` | E24 More, Notifications, Date & Time | The older runners' Vitest semantics, unchanged: root = archive, globals, jsdom, the same `setupFiles` and `include` per suite, esbuild jsx automatic, default timeouts, no console filter, the same Vitest package. Added: the Vite guard plugin and docs/node_modules links to the single react, react-dom, @testing-library/react and react-router instances (harness check: 1 instance each) |

**Fidelity checks.**
- Each package gate reads its script from the archive's `package.json` and asserts it: `vitest run`, `tsc --noEmit`, `eslint --max-warnings 0 .`.
- The only additions are output-only: the verbose + JSON reporters, `--listFiles`, and `--format json --output-file`.
- The binary is resolved as pnpm would: the package's `.bin`, else the workspace root's.
- Each package mode extracts its own archive, so a Vitest wrapper never coexists with lint or tsc.
- The f359be6 controls (§4) reproduce the accepted counts exactly. For example, the web test gives 28 / 156 with per-file counts equal to the accepted older-runner log, and every caller suite gives its accepted count with an equal number of console blocks. This shows that the new runners do not change counts.

**Guard self-tests.**
- The ESLint guard was checked against the frozen runner (`diagnostics/eslint-guard-negative.mjs`, `diagnostics/eslint-guard-control.txt`). With nothing forbidden, `eslint --version` gives exit 0, 1 hook registration and 0 violations. With ESLint's own store folder forbidden, it gives exit 1 with `Pin violation`.
- The Vitest guard is the accepted G1 / Features Sol guard. In these runs it recorded 61–653 archive modules per mode and 0 unaliased `@repo` imports.

**Oracle invariance for the re-hosted suites.**
- `git diff --quiet d7358b9 HEAD -- <the 20 More, Notifications and Date & Time oracle and helper files and the 5 older runners>` exits 0. `d7358b9` produced the accepted `sticky-final-v1` logs.
- `git diff --quiet 7b216a3 5cd63ff -- <the 3 helper files read from the archive>` exits 0.
- Every copied oracle equals this checkout's file (harness check), and each archive copy equals the committed copy (recorded per log).

## 3. Reproduction (official runs, in order) and exit codes

From the worktree root, with `D=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop`:

```sh
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-final/verify-static.mjs 5cd63ff f359be6 features-final-v1          # exit 0
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-sol/verify-fixed.mjs 5cd63ff bytes features-final-v1               # exit 0
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-final/verify-packages.mjs 5cd63ff all features-final-v1           # exit 0
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-final/verify-packages.mjs f359be6 all features-final-v1           # exit 0
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-final/verify-callers.mjs 5cd63ff all features-final-v1            # exit 0
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-final/verify-callers.mjs f359be6 all features-final-v1            # exit 1 (more-boundaries 9/10)
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-final/verify-callers.mjs 5cd63ff more-boundaries features-final-v2 # exit 1 (9/10), diagnostic iteration 2
XAI_DEPS_ROOT=$D node docs/reviews/web-features-recovery-final/verify-callers.mjs f359be6 more-boundaries features-final-v2 # exit 0 (10/10), diagnostic iteration 2
for m in bytes fields queues continuity-export original; do
  XAI_DEPS_ROOT=$D node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs 5cd63ff $m features-final-v1                 # exit 0 each
done
XAI_DEPS_ROOT=$D node docs/reviews/web-sticky-recovery-independent/verify-fixed.mjs 5cd63ff host features-final-v1         # exit 0
node docs/reviews/web-features-recovery-final/compare-accepted.mjs features-final-v1                                        # exit 1: 62 MATCH, 2 DIFF (both F-B002)
node docs/reviews/web-features-recovery-final/hash-evidence.mjs features-final-v1                                           # exit 0: 0 provenance failures
```

**Iterations.**
- Each runner mode ran once (`features-final-v1`), except More `boundaries`. That mode used diagnostic iteration 2 (`features-final-v2`) at both revisions; the cap is 3.
- No log was superseded. Both iterations are kept as evidence of the nondeterminism.

## 4. Per-gate detail

### E18 — §10 item 9, the reader and writer search (`search-features-final-v1-5cd63ff.log`)

**Patterns.** `xai_pref_features_`, `featurePrefKey(`, `featurePrefKey`, `resetAllFeaturePrefs`, `resetAllPrefs`, `useFeaturePrefs`, `withDisabledFallback`, `filterModulesByFeaturePrefs`, `DisabledFeatureFallback` and `readEnabledSearchModules`.

**Scope.** Every committed file outside `docs/` and `*.md`, counted as matching lines per file:
- `5cd63ff`: 6503 files, 2116 text files;
- `f359be6`: 6259 files, 2112 text files.

**At `f359be6` this reproduces contract §2.** For example, `xai_pref_features_` occurs in `App.tsx` 2, `shellRegistrations.tsx` 2, `railFeatureFilter.test.tsx` 2, `CommandPalette.tsx` 1, storage `registry.ts` 16, `accountOwnership.ts` 8 and two storage tests 8 + 8. `featurePrefKey(` is called in `FeaturesPane.tsx` (2) and `withDisabledFallback.tsx` (1), and defined in `featureIds.ts`.

**Delta rows to `5cd63ff`.** There are 9, all in §11 files:
- `FeaturesPane.tsx`: `xai_pref_features_` 2→1; `featurePrefKey(` 2→0; `featurePrefKey` 3→0; `resetAllFeaturePrefs` 2→0; `resetAllPrefs` 1→0;
- `FeaturesPaneRecovery.test.tsx`: 0→2 (key literal) and 0→2 (`useFeaturePrefs`);
- `featuresLockFixture.ts`: 0→1;
- `internal/featuresRecovery.ts`: 0→9 (the 8 literal keys).

Every reader and writer file outside §11 has identical counts.

**Features product source (13 non-test files under `src/`).**
- Gated: `new StorageEvent` 0, `dispatchEvent(` 0 (at `f359be6` both were 1, in `FeaturesPane.tsx`).
- Recorded for information: `StorageEvent`, `localStorage` and `SettingsFooter` 0 (1, 4 and 3 lines at `f359be6`, all in `FeaturesPane.tsx`).

**`FeaturesPane.tsx`, `internal/featuresRecovery.ts` and `internal/featuresRecoveryCopy.ts`:** `usePref(`, `setPref(`, `removePref(` and `localStorage` are all 0. At `f359be6`, `FeaturesPane.tsx` had `usePref(` 1 and `localStorage` 4.

### E19 — §10 item 8, protected paths (`protected-diff-features-final-v1-5cd63ff.log`)

**The 13 contract paths.** For each of `packages/plugin-web-storage`, `plugin-web-settings-shell`, `xai-web-shell`, `xai-web-pet`, `xai-web-cmdk`, `plugin-web-tokens`, `xai-web-settings-appearance`, `plugin-web-settings-rest`, `xai-web-dashboard-grid`, `xai-web-dashboard-widgets`, `apps`, `package.json` and `pnpm-lock.yaml`:
- the path exists in both trees, so a typo cannot pass;
- the object ids are identical (for example `apps` tree `9d9e85e4…`);
- `git diff --name-only` is empty and `git diff --quiet` exits 0.

**The 16 §11-protected Features files are unchanged** (`docs/verify-report.md` included). They are `index.ts`, `featureIds.ts`, the four reader files, `FeatureThumb.tsx`, `package.json`, configs and docs.

**Full diff `f359be6..5cd63ff`.** It has 255 entries: 244 under `docs/` and 11 outside. The 11 outside `docs/` and the product-scope diff (`-- apps packages package.json pnpm-lock.yaml`, +1590/−72) are exactly the §11 files. The 4 added files are `FeaturesPaneRecovery.test.tsx`, `featuresLockFixture.ts`, `internal/featuresRecovery.ts` and `internal/featuresRecoveryCopy.ts`. The 7 modified files are `docs/api.md`, `docs/test.md`, `FeaturesPane.tsx`, `FeaturesPane.test.tsx`, `internal/featuresPane.tsx`, `styles.css` and `types.ts`. Each one is matched to a §11 category, with exactly 2 new internal helpers.

### E20 — storage check-types and the Sol lifecycle assertion

- **Storage check-types:** `storage-check-types-features-final-v1-5cd63ff.log`.
  - `tsc --noEmit --listFiles` exits 0 with 0 diagnostics.
  - 315 program files: 46 in the archive (provenance includes `lifecycleDeclaration.ts`, `accountOwnership.ts`, `prefMutation.ts` and `usePrefAsync.ts`) and 269 in the store. None is outside them.
  - The `f359be6` control is identical.
- **Sol lifecycle:** `../web-features-recovery-sol/bytes-features-final-v1-5cd63ff.log`.
  - L1–2 record requested `5cd63ff` and resolved `5cd63ff652f02a2c…`. L14–16 hold the three lockfile hashes, and L17 the unchanged `oracle_sha256`.
  - L23–25: `vitest_exit=0`, `harness_checks=PASS (6/6)`, `exit=0`.
  - L59: 17/17 with `precondition_failures=0`.
  - L69: case 004 PASSED. This is the case at `bytes.test.tsx` L174–191 whose L186–187 assert `lifecycleForKey(...)` and the declared `LOCAL_DATA_LIFECYCLE` row give `exportScope: "device-recovery"`, `accountDeletion: "retain"` and `legacyMigration: "retain-on-device"` for all 8 keys.
  - Case names and statuses equal both cited logs:
    - E7 `bytes-fixed1-5cd63ff.log`, SHA-256 `4d11dba35115be267792648fae4a9778f5ee1c5014c79573be0e64938b5c0899` (recomputed; equals `../web-features-recovery-sol/fixed-5cd63ff.md`);
    - E2 `bytes-before2-f359be6.log`, `0fa71cff…`.

### E21 — Features package

- **Test, `features-test-features-final-v1-5cd63ff.log`: 7 files / 45 / 45.**
  - `FeaturesPaneRecovery` 22, `FeaturesPane` 6 (AC-PANE-1–6), `useFeaturePrefs` 3, `withDisabledFallback` 4, `filterModulesByFeaturePrefs` 4, `DisabledFeatureFallback` 3, `featuresPaneEntry` 3.
  - Harness 13/13, including the "required test file ran" checks for the five reader tests.
  - The package config is in effect: jsdom, globals true, `./vitest.setup.ts`.
  - The 10 required product modules were loaded from the archive, including both new helpers.
  - **Against `f359be6` (6 files / 23):** the only difference is the added `FeaturesPaneRecovery.test.tsx` (22). Per-file counts are otherwise equal. This equals Terra's 45/45 recorded in the `5cd63ff` commit message.
- **Reader tests at both revisions** (`features-readers-…-{5cd63ff,f359be6}.log`): 5 files / 17 / 17. Status and title multisets equal the Sol `readers-features` logs (E7 `e6e34d87…`, E2 `cba3c7a7…`).
- **Typecheck:** exit 0, 0 diagnostics. There are 382 program files, 83 of them in the archive, including `FeaturesPaneRecovery.test.tsx` and both helpers; 0 are elsewhere. The `f359be6` control: exit 0, 378 / 79.
- **Lint:** exit 0. 23 files linted (all lintable files), with 0 errors and 0 warnings. The guard recorded 1 registration and 0 violations, and `@repo/eslint-config/react-internal` resolved inside the archive. The `f359be6` control: exit 0, 19 files.

### E22 — Web package

- **Test, `web-test-features-final-v1-5cd63ff.log`: 28 files / 156 / 156.**
  - Per-file counts equal the accepted `../web-more-recovery-final/web-test-sticky-final-v1-f359be6.log` (`901bc99e…`).
  - Required files ran: `railFeatureFilter` 3, `settingsPaneComposition.test.tsx` 3, `.appearance` 4, `.rest` 3, `cmdkIntegration` 5, `departureCoordinator.blocker` 10.
  - The 9 required modules were loaded from the archive (`App.tsx`, `departureCoordinator.tsx`, `FeaturesPane.tsx`, `internal/featuresRecovery.ts`, `CommandPalette.tsx` and others), along with 653 archive modules in total.
  - stderr holds only the two `BM-BUNDLE-1/2 SKIPPED` notices, as in the accepted log.
  - The `f359be6` control is identical: 28 / 156.
- **Check-types:** exit 0. There are 1379 program files (662 in the archive, among them the Features package with both helpers) and 0 elsewhere.
- **Lint:** exit 0. 82 files, 0 errors, 0 warnings, 0 guard violations.

### E23 — Settings-shell package

- `settings-shell-test-features-final-v1-5cd63ff.log`: 11 files / 54 / 54, with `SettingsFooter.test.tsx` 8. The modules `SettingsFooter.tsx`, `resetAllPrefs.ts` and `Toggle.tsx` were loaded from the archive.
- The `f359be6` control has identical per-file counts.
- The package tree `8fe33026…` is identical at both revisions (E19).
- No accepted independent receipt for this gate exists. The only earlier count is the Collaborate Terra author report (`../web-collaborate-recovery-terra/author-report.md` L43–44): 11 files / 54. It is equal, but it is self-reported.

### E24 — accepted-caller suites, line by line against the accepted receipts

`compare-accepted-features-final-v1.log` gives 62 MATCH and 2 DIFF. For every pair, it records:
- both log hashes;
- exit status and totals;
- per-file counts;
- console-block counts;
- `PRECONDITION` counts;
- ordered titles, or oracle-hash header lines, where both logs carry them.

Every accepted log hash it cites equals the value printed in its receipt (32/32: `../web-sticky-recovery-final/review-final-regressions-f359be6.md`, `../web-sticky-recovery-sol/post-f359be6.md`, `../web-sticky-recovery-independent/post-f359be6.md`, `../web-features-recovery-sol/{README.md,fixed-5cd63ff.md}`).

| Suite | Fresh `5cd63ff` | Fresh `f359be6` (runner-equivalence control) | Accepted log (receipt) | Line-by-line difference |
| --- | --- | --- | --- | --- |
| Settings-rest package | 44 / 314 | 44 / 314 | `package-sticky-final-v1-f359be6.log` 44 / 314 | none. The package config's include (`{test,spec}`) selects the same 44 files as the Astra glob; there are no `.spec` files |
| More Sol fields / reset / queues / owner-export | 22 / 20 / 14 / 13 | same | `*-sticky-final-v1-f359be6.log` 22 / 20 / 14 / 13 | none. Console blocks 0 / 18 / 3 / 13, as accepted |
| More Sol boundaries | v1 10/10; v2 **9/10** | v1 **9/10**; v2 10/10 | `boundaries-sticky-final-v1-f359be6.log` 10/10 | **F-B002**: case 002 nondeterministic at both revisions (§6) |
| More original (`morePane.test.tsx`) / host | 15 / 11 | 15 / 11 | 15 / 11 | none |
| Sticky Sol bytes / fields / queues / continuity-export | 13 / 47 / 27 / 22 | — | `*-post1-f359be6.log` 13 / 47 / 27 / 22 | none. Ordered titles and the `oracle_sha256` header are equal; 0 `PRECONDITION:`; stderr empty |
| Sticky original / host | 10 / 28 | — | `original-post1` 10, `host-post1` 28 | none. Ordered titles equal |
| Notifications Sol core / recovery / operations / boundaries / extended / original | 11 / 3 / 2 / 4 / 10 / 11 | same | `*-sticky-final-v1-f359be6.log`, same counts | none. Console blocks 0 / 2 / 2 / 1 / 8 / 1, as accepted |
| Notifications Astra boundaries / Astra host / parent host | 24 / 15 / 12 | same | same | none |
| Date & Time (`caller-boundaries.test.tsx` from the archive) | 7 | 7 | `datetime-sticky-final-v1-f359be6.log` 7 | none |

## 5. Shared and stylesheet clauses of §13 row 8

- **Shared delta.** None. E19 shows that storage, shell, host, coordinator, pet, CmdK, tokens and Appearance are unchanged. "Impacted engine, hook and caller reruns plus fresh acceptance" are therefore not triggered.
- **Selector clause.** The `styles.css` delta is +84/−0. E14's selector audit (`../web-features-recovery-native/review-visual-keyboard-5cd63ff.md` §7) found every added selector under `.features-pane`, with one `@media (max-width: 640px)`, so other callers' native visual modes are not required. This receipt did not repeat the audit; it relies on E14 and on E18/E19 (only the Features stylesheet changed).

## 6. Frozen finding F-B002: More Sol `boundaries` case 002 is nondeterministic (oracle defect, pre-existing)

**Facts.**
- **Failing assertion.** `../web-more-recovery-sol/boundaries.test.tsx` L17–24, "invalid and unavailable sources retain requested reset intents without purging raw bytes", fails intermittently. The `waitFor` at L20 reports one valid field still holding its seeded bytes: `date_recognition: expected 'false' to be null` in v1 `f359be6`, `remove_date_text: expected 'true' to be null` in v2 `5cd63ff`. The More pane shows "<that field> reset to default was not completed." with Retry and Discard.
- **Logs.**
  - `more-boundaries-features-final-v1-f359be6.log` `61cf6a30…` (9/10, L43, L442–443, case 002 at L672–673);
  - `more-boundaries-features-final-v2-5cd63ff.log` `f63fbaa6…` (9/10, first line L443);
  - the passing `…-v1-5cd63ff.log` `224822b9…` and `…-v2-f359be6.log` `d912c34a…`.
- **Same at both revisions.** The More pane, the settings-rest package and the storage package are byte-identical at `f359be6` and `5cd63ff` (E19). Product code cannot differ between the two runs.

**Mechanism (diagnosed; §9 lists every diagnostic run).**
1. **The spy re-enters itself.** Case 002 installs `vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (key) { if (String(key) === physical(unavailable)) throw …; return base.call(this, key); })` (L19). `unavailable` is `accountCases[0]` (`default_tag`), an account-owned key. `physical()` calls the product's `accountScope.physicalKey()`, which for an account key reads `localStorage.getItem("<account prefix>deleted")` (`packages/plugin-web-storage/src/internal/accountScope.ts:66–71`). That read re-enters the spy, so every `getItem` while the spy is active recurses without bound.
2. **The outcome depends on stack depth.** A direct probe recorded a depth of ≈1030–1150 (D4, D6).
   - In isolation (case 002 alone) the stack overflow always surfaces: every `getItem` throws `RangeError: Maximum call stack size exceeded`, and all 15 resets are refused (D2: 8/8 fail; D6 isolated: 2/2).
   - In the full file it surfaces only at some call sites. When it does, exactly one field's mount-time read throws `RangeError` at the outermost level (D7 recorded this in every failing run and in no passing run). That field correctly becomes source-only "unavailable", so its reset is refused and its bytes are kept, which is the contract behavior for unavailable sources. The oracle, however, expects that field to be removed.
   - Which field is hit moves with the call depth: `date_recognition` unprobed; `remove_date_text` with one extra wrapper frame (D7, and v2); `minimize_on_launch` in one D5 run.
3. **Rates on this machine today** (unmodified `verify-callers.mjs`, 10 repetitions each; D1): 8/10 failing at `f359be6` and 7/10 at `5cd63ff`. Earlier today's smoke and official v1 runs at `5cd63ff` passed, and so did the accepted `7b216a3` and `f359be6` runs. That is consistent with JIT-dependent stack frames.
4. **The oracle is the cause.** The candidate correct oracle changes only L18–19: it computes `const unavailableKey = physical(unavailable)` once, before installing the spy, and compares against it (`diagnostics/make-corrected-boundaries.mjs`). It passed every run:
   - 8/8 full-file at `5cd63ff`;
   - 8/8 full-file at `f359be6`;
   - 4/4 with case 002 in isolation at `5cd63ff`, where the original fails 8/8 (D8).

   The other getItem spies in the re-hosted oracles either compare against precomputed keys or pass device keys, so they do not read storage inside the spy. More `queues.test.tsx` L70 and L78 call `physical(entry)` with `deviceCases[2]` and `[3]`.

**Impact.**
- No product failure, and nothing Features-related: the defect predates `f359be6` and does not touch the Features delta.
- The accepted More Sol count of 79 is nondeterministic for this one case on this machine.
- The corrected oracle shows that the More product meets case 002's requirement deterministically at both revisions (16/16 full-file). The More code is unchanged since `7b216a3` (Sticky final receipt, "Fixed-boundary proof"). The More acceptance's substance is therefore not undermined, but its oracle cannot be relied on as written.

**Correct oracle.** Freeze the unavailable physical key outside the spy, as above. This receipt does **not** apply it: oracles and prior evidence are protected. Repairing the More oracle, and rerunning More Sol `boundaries` once repaired, is a controller decision.

## 7. E25 enumeration: E1–E24

**How the hashes were checked.**
- `hashes-features-final-v1.log` recomputes the SHA-256 of **every** listed artifact from the committed file: 216 entries (213 distinct files; E15 repeats E14's two v2 logs and E20 repeats E7's `bytes` log) across E1–E24, plus 26 superseded E14 v1 files.
- For E1–E17 it checks that the expected producing commit is the last commit to touch each path and that the file is unchanged since (`git diff --quiet <commit> HEAD`). The result was 0 failures.
- It also looks each hash up in the item's receipt. Every E1–E17 artifact hash appears in full in its receipt, apart from the receipts themselves. E6 is described in its own row.

I therefore re-derived **all** hashes, not just one per item. The table quotes the principal ones.

| ID | Producing commit (verified) | Artifacts (paths relative to `docs/reviews/`) and SHA-256 (recomputed = receipt) | Verdict |
| --- | --- | --- | --- |
| E1 | `11e0afb6d9c6932314f5434dc5d53e5a51c8cdca` | `web-features-recovery-sol/`: `verify-fixed.mjs` `b5ac75fa1bc5ff65352afb5b598dc7309fb7435aa9ca96518dfd1d7ffb2f2f16`, `fixture.tsx` `f0b5d272695026f8e60df6dd2dbf5889790b3d2e834256259e86bb0432050ef8`, `bytes.test.tsx` `904cb0de88eb5047365309df501ebbb8cb725a485963d23df022e7bbd26aba14`, `fields` `506d54cb…`, `reset` `dc4ee31e…`, `queues` `d5816074…`, `continuity-export` `1e3066f9…`, `downstream` `88cf89c8…`; receipt `README.md` `d8caea9f2191e18f1b58e36ad0c5653481cc5d609c564ee2c2581ec58b369874`. Lockfile gate recorded (L14–16 of every log). 8/8 full matches in `README.md` | present, frozen |
| E2 | `11e0afb` | 9 authoritative `*-before2-f359be6.log`: `bytes` `0fa71cffbda4712682ce406c2d53dff7b450849478ead57d9fb01769b06bf14b`, `fields` `fe4b248b…`, `reset` `5bf992a3…`, `queues` `dfcd7145…`, `continuity-export` `85280a82…`, `downstream` `9edea286…`, `original` `97d0b5e7…`, `readers-features` `cba3c7a7…`, `readers-web` `f40e0a74…`; 6 superseded `*-before1-f359be6.log`. 15/15 full matches | present |
| E3 | `b732c27f330eb3368901d38f4423722f651c112f` | `web-features-recovery-independent/`: `host-before1-f359be6.log` `977fc6565d5a18973473d3cd551d78eeb0213676732645fde2af5afa7dd098c0`, `host.test.tsx` `816e870a…`, `verify-fixed.mjs` `d92901b4…`; receipt `before-f359be6.md` `4773ce57…`. 3/3 | present |
| E4 | `4c5323f70d55e66d3627ee79d4fd84ef9d19dd2c` | `web-features-recovery-native/`: `native-f359be6-before1-h5.log` `60695aebe6c1247c3b7e6e8368b4369453ee8ab4986997adfd9f6dfe16f6d390`, `-h6.log` `579bf981…`, `-h10.log` `46213534…`, `native-app.tsx` `6fff7b38…`, `native-prelude.js` `f55e0234…`, `verify-native-before.mjs` `825e3131…`, 11 PNGs (for example `h10-375-en` `e9203d49…`); receipt `before-f359be6.md` `8526ed09…`. 17/17 | present |
| E5 | `4c5323f` | `web-features-recovery-f1/`: `verify-f1-features.mjs` `d0ac8c68823bded7d8f4aae4012c6be48d07d489cc168de8f271a5e752afd537`, `f1-features-host.tsx` `18272ac0…`, `f1-f359be6-selfcheck-before1.log` `b68d9a25…`, `f1-f359be6-features-before1.log` `59f9761a…`; receipt `before-f359be6.md` `6c7d337b…`. 4/4 | present |
| E6 | `5cd63ff652f02a2c726187fe12cbc796218d31c0` (tree `404bf819a42e20b3e4d372c18a981832ccd54954`, parent `8d53038dc0e095678f30340afd6713e2b86551e0`) | The 11 §11 files and their SHA-256 at `5cd63ff`: `docs/api.md` `46f6d7ff532ed8b6f8e6bd63bbb0dd753674ab5bf44a848cc0a498c1851e079f`; `docs/test.md` `1c13c59dd21bb71e13aada054191450998b6473955ba34c5efd2a3e3a68f0740`; `src/FeaturesPane.tsx` `54a3f10c90fdc415a9c1bb89801fe4cdc1870022235752229e9180a2a683d701`; `src/__tests__/FeaturesPane.test.tsx` `993f0d069b9dc23de53d910d5dda4967eca2e436596ec3fbc2b33fad16ed1d64`; `src/__tests__/FeaturesPaneRecovery.test.tsx` `5365f404d612cf25b4c1fb32487e41c052140274f359a53de1cdadc2e0bf8ee6`; `src/__tests__/featuresLockFixture.ts` `b190596f0ebc7272c8caf7362d7f9146788c296dd612e881973ddc465a04510e`; `src/internal/featuresPane.tsx` `572bdd478954059f02dde83c8ec7383f992ca0f6f33f8b5e2c96ba85e7f935a7`; `src/internal/featuresRecovery.ts` `0e73fadd1cb941ca8f26e86a38c493fe9da94a278c335798a92accbff5f74e6f`; `src/internal/featuresRecoveryCopy.ts` `d4409bd70b7df1227cbeabaf6c00bb0f2abb14c1f81f488905c2e76354b822bc`; `src/styles.css` `65fdf6f08b299c242bf79397a5e731fa0b605cc2f5a7476e2778a4caa350b5c3`; `src/types.ts` `f97c4e6212d99723d9baeb1133866f05860db7b97ce274ba2be0b27128cd8406`. Two independent derivations agree: archive extraction (E19 log) and `git show 5cd63ff:<path>` (hashes log). Five equal the 8-hex prefixes printed in E7's `fixed-5cd63ff.md`. **Terra's package run (features package 45/45; `@repo/web` 156/156, typecheck and lint clean) is recorded only in the `5cd63ff` commit message ("Tests:" paragraph), not in any log artifact.** E21 is the independent rerun (45/45); it does not substitute for E6 | present (commit-message record) |
| E7 | `eb37a59cde093e4433923aefb5a2354aca6f1129` | `web-features-recovery-sol/*-fixed1-5cd63ff.log` ×9: `bytes` `4d11dba35115be267792648fae4a9778f5ee1c5014c79573be0e64938b5c0899`, `fields` `aacb34b4…`, `reset` `921b37e8…`, `queues` `0e631511…`, `continuity-export` `95b7fe30…`, `downstream` `8c8beec7…`, `original` `8a9d7dd2…`, `readers-features` `e6e34d87…`, `readers-web` `cb69a961…`; receipt `fixed-5cd63ff.md` `b7a65d22…`. 9/9 | present |
| E8 | `eb37a59` | `web-features-recovery-independent/host-fixed1-5cd63ff.log` `244f7dd7498ba49c6f466d030380581ae0db903876c7be02ef03a77294117f80`; receipt `fixed-5cd63ff.md` `673a7fa1…` | present |
| E9 | `58a93ef2d4a27ef53bc2944078b3f0e1e5cdc844` | `web-features-recovery-native/native-5cd63ff-fixed1-controls.log` `8330678fb3b657762a63a3039dcdba428a0d58c3e61996fae88c9fba66247848`; `verify-native-fixed.mjs` `ea3332f3…`, `native-fixed.tsx` `1540a29b…`, `native-fixed-host.tsx` `50c58cb0…`, `native-fixed-prelude.js` `cfc19a7e…`; receipt `review-controls-reset-export-5cd63ff.md` `a406fe95…`. 5/5 | present |
| E10 | `58a93ef` | `native-5cd63ff-fixed1-reset.log` `1fd92c92022cf520cc38f2ee04b8925801ae65a2115701645d41c0feaf334eba`. 1/1 | present |
| E11 | `58a93ef` | `native-5cd63ff-fixed1-export.log` `982e92ae892949dcc4df00265c37547af627b0000c75bb6028e900273af2acef`, plus 10 disk JSONs (for example x5 all-eight-pending-resets `ad6554f8…`, x9 held-real-lock `f1a65a6d…`). 11/11 | present |
| E12 | `312b27c873b16c84b2aca66210d96a52777c1447` | `native-5cd63ff-fixed1-host.log` `f025b831b432df2c31a6c295560d25923705f30e21332eb8e792e023f5c9cb0d`; `verify-native-host.mjs` `9688043d…`, `native-host-matrix.tsx` `819573b0…`, `native-host-harness.mjs` `499fca4c…`, `native-host-prelude.js` `01acaa5d…`; receipt `review-host-downstream-5cd63ff.md` `aa2eded5…`. 5/5 | present |
| E13 | `312b27c` | `native-5cd63ff-fixed1-downstream.log` `fefe8af14dfec7bb906404a329de3c0ec4bea806c20f9e34eaabe53f9f748fd6`; `native-downstream.tsx` `9b77055e…`, `verify-native-downstream.mjs` `82df2961…`. 3/3 | present |
| E14 | `5905e3750f39f6ab12ab7b6a8a697a2507b90c5a` | `native-5cd63ff-v2-visual.log` `b7b7e7c9b9494ce982fc4670ebe1cd41e8e9b60ec8501949e11fe772c5d6df43`, `native-5cd63ff-v2-visual-zh.log` `663d8916ea41fe13b5dde42d6c49822c01ae4f2508f7139e1b86ad5740b38ee9`, `verify-visual-fixed.mjs` `8da2be3d…`, `native-visual-fixed.tsx` `caf96cd5…`, 24 v2 PNGs; receipt `review-visual-keyboard-5cd63ff.md` `e288db78…`. 28/28. Every PNG equals its full hash in its v2 log's `screenshot` record. **§8 #19 correction:** the receipt prints `8dc88e96…e72e`. The full hash in the ZH v2 log's screenshot record (L524) is `8dc88e96b351123124227a41e5e77ece5760b45307cc0f2f212ac1e945e1d72e`, and my recomputation of `native-5cd63ff-v2-visual-zh-1440-all8.png` equals it. Superseded v1 (2 logs + 24 PNGs, labelled non-evidence in that receipt): 26/26 | present (v1 superseded) |
| E15 | `5905e37` | The keyboard results are in the same two v2 logs (`b7b7e7c9…`, `663d8916…`), and the E14 receipt §9 | present |
| E16 | `eb37a59` | `web-sticky-recovery-f1/f1-5cd63ff-{sticky,more,collaborate,selfcheck,notifications,date-time,smart-lists,header,pomodoro,race}-fixed1.log`: `433e56ae…`, `cc33feaf…`, `025c32dd…`, `98273138…`, `6b047bf5…`, `f8856bae…`, `8dda3d50…`, `d8a174b8…`, `3392bbb8…`, `dfed2d12257a4d7473766778c01f8cb9beb3b44e80620e5e0308d1adf036e0d5`; receipt `web-features-recovery-f1/fixed-5cd63ff.md` `949c61e6…`. 10/10 | present |
| E17 | `eb37a59` | `web-features-recovery-f1/f1-5cd63ff-features-fixed1.log` `5bdbb3d9a2ebf45337dd3cc2eec38e1f6895116b078b4d848359ca38d5b21215`, `f1-5cd63ff-selfcheck-fixed1.log` `15e18415…`. 2/2 | present |
| E18 | this batch | `web-features-recovery-final/search-features-final-v1-5cd63ff.log` `57dc6adba1565d837f39c789920c13228a148e94f0b2d792cb83890d02f1fd9c`; runner `verify-static.mjs` `ddbf44bf…` | PASS |
| E19 | this batch | `protected-diff-features-final-v1-5cd63ff.log` `0175c76f6446c5abde699a02bfcab7c5c754c03ce3785a73f3438e5341d3f388` | PASS |
| E20 | this batch | `storage-check-types-features-final-v1-5cd63ff.log` `df76f1e83868c79cccf3e9f0fb1fd5d0c7790466d9037d5cd89747ab3e13baf2` (control `f359be6` `3e4bc981…`); `../web-features-recovery-sol/bytes-features-final-v1-5cd63ff.log` `0d2f23da630919de1c167434c356b1b5d6fbb2c9ec9f31efbf9c2b0171099012`; cited E7 `bytes-fixed1-5cd63ff.log` `4d11dba3…` (recomputed) | PASS |
| E21 | this batch | `features-test-…-5cd63ff.log` `9064c0690e9147c3e694043feb19294379c420c93bda641a045820364b7cb398`, `features-typecheck-…-5cd63ff.log` `f9da49a4…`, `features-lint-…-5cd63ff.log` `65d0028f…`, `features-readers-…-5cd63ff.log` `d491f6fb…`; before control `features-readers-…-f359be6.log` `1d44db6b9b928e96b682aa1d9432d7d260278060522fbb7e68d66cd319135e8b` (plus `features-test` `192f557e…`, `-typecheck` `22f1a44a…`, `-lint` `21825587…` at `f359be6`); runner `verify-packages.mjs` `f7758f28…` | PASS |
| E22 | this batch | `web-test-…-5cd63ff.log` `c70646978dad479295ed334c0269c5b2d0b42828966a68ccd34b803ab4cc716c`, `web-check-types-…-5cd63ff.log` `f55ff83b…`, `web-lint-…-5cd63ff.log` `5bd6589a…` (controls `9aa93a82…`, `382aa498…`, `3e6687d7…`) | PASS |
| E23 | this batch | `settings-shell-test-…-5cd63ff.log` `c684b28662db1e7478f8eac01c432888effe087eaec1342beed09526066e179f` (control `e30f26fe…`) | PASS |
| E24 | this batch | `settings-rest-test-…-5cd63ff.log` `cf265ad048948e13b2e5cab9fccbcedf3a680cbbb35996c19ee9d60cf9bc4288`; 17 suites × 2 revisions in `web-features-recovery-final/` (§10); Sticky `../web-sticky-recovery-sol/{bytes,fields,queues,continuity-export,original}-features-final-v1-5cd63ff.log` `4e8ad2a6…`, `63ba493f…`, `72d7950c…`, `6c51cfc9…`, `6dde7c08…` and `../web-sticky-recovery-independent/host-features-final-v1-5cd63ff.log` `3e0d08f1…`; comparison `compare-accepted-features-final-v1.log` `2a451804edab8d6e6ca4e835103eab6d2f33450e9bf187632dafb5d8b00e557c`; runner `verify-callers.mjs` `7e1aa8b2…` | PASS with F-B002 (§6) |

**R-PET (cited, not judged).**
- **The observation.** E14 receipt §10, `../web-features-recovery-native/review-visual-keyboard-5cd63ff.md` L300–328, records the DesktopPet at its default position at 768×1024 (box 660–732 × 916–988):
  - at `5cd63ff`: EN "Reset to defaults" has its center clickable, with 2/5 points on the pet; ZH "恢复默认" has its center on the pet, with 3/5 points;
  - at `f359be6`: the inert "Save & apply" was covered;
  - there is no coverage at 375, 414, 1024 or 1440.

  The frozen reproduction is screenshots #11, #12, #23 and #24 and the v2 log lines named there.
- **The ruling.** The controller's ruling R-PET, in `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` (row "总控裁定 R-PET（2026-10-04）"), makes it non-blocking for CP-FEATURES-01. Final acceptance must confirm or overturn it.
- This receipt takes no position on either.

## 8. Archive, lockfile and pin proof, per log family

**Recorded in every log:** the requested and resolved commit; `dependency_lockfile_sha256` and `archive_lockfile_sha256` = `df05f2dd…` (the new runners also record `expected_lockfile_sha256`, and the Features Sol runner records `extracted_lockfile_sha256`); and the runner hash. The Sticky runners carry their runner hash inside the `oracle_sha256` line (`verify-fixed.mjs=…`).

**Pin evidence:**
- **New Vitest modes:** `pin_unaliased_repo_imports=0`, `pin_required_provenance_missing=none` and harness PASS in every log. `aliases=75`, and `tsconfig_extends_checked=46 unresolved=none`.
- **tsc modes:** `elsewhere=0 forbidden=0`.
- **ESLint modes:** `pin_violations=0`, with a hook registration recorded.
- **Features Sol bytes log:** harness 6/6; 75 aliases; 0 unaliased imports.

**Archive completeness (static runner):** every committed path, symlinks included, was present in each extracted archive (6503 and 6259), and there is no `.gitattributes` at either revision.

## 9. Development smoke runs and diagnostics (disclosed; not gate evidence)

All of the following wrote only to the session scratchpad. Their results are digested, with the SHA-256 of every raw log, in `diagnostics/diagnostic-runs.log`.

**Smoke runs before freezing the runners** (output redirected with `XAI_FINAL_OUTPUT_DIR`):
- `verify-static` ×1;
- `verify-packages` ×10 (`features-readers` at `f359be6`, then 9 modes at `5cd63ff`) on an earlier runner revision, `a14adaba…`, before the "required tests" checks were added. An intermediate revision, `5df743f4…`, was never run;
- `verify-callers` ×20 at `5cd63ff` (3, then all 17 modes), with the frozen runner;
- `verify-packages` ×10 at `f359be6` with the frozen runner.

All passed, including More `boundaries` at `5cd63ff`. The defect first surfaced in the official `f359be6` control.

**F-B002 diagnostics**, all on scratch copies (the committed oracles were never modified):
- **D1:** unmodified runner ×10 per revision (with `DEBUG_PRINT_LIMIT=300000` so failure messages carry the full DOM).
- **D2:** isolated case 002, ×8.
- **D3a/D3b:** instrumented copies. The D3a `vi.mock` attempt did not attach.
- **D4:** spy probe.
- **D5–D7:** probed copies of the full file.
- **D8:** corrected oracle, 8 + 8 + 4.

The tooling is committed under `diagnostics/`: generator scripts, the repetition drivers, the generated diagnostic runner `diag-callers.generated.mjs` (`9c31137a…`, built from `verify-callers.mjs` by `make-diag-runner.mjs`), and 9 representative raw logs under `diagnostics/raw/`. The generated probed and corrected oracle copies are not committed; their hashes are in the digest.

**Dry runs.** `compare-accepted.mjs` and `hash-evidence.mjs` each had one dry run with output in the scratchpad; both read files only.

## 10. New files (this commit; additions only)

**Under `docs/reviews/web-features-recovery-final/`:**
- runners `verify-static.mjs`, `verify-packages.mjs`, `verify-callers.mjs`;
- read-only tools `compare-accepted.mjs` (`823c12a2…`) and `hash-evidence.mjs` (`85ef2b39…`);
- this receipt;
- logs:
  - `search-…`, `protected-diff-…`;
  - 10 package modes × 2 revisions;
  - 17 caller modes × 2 revisions, plus 2 `more-boundaries …-features-final-v2-…` logs;
  - `compare-accepted-features-final-v1.log`, `hashes-features-final-v1.log` (`9b5b6230db8580595d29a85154dec5aba4b4a966cb4a91c50167daebecdfee15`);
- `diagnostics/`: 13 tool files, `diagnostic-runs.log`, `eslint-guard-control.txt` and `raw/` (9 logs).

**In existing runners' own directories**, each with suffix `features-final-v1`:
- `../web-features-recovery-sol/bytes-features-final-v1-5cd63ff.log`;
- `../web-sticky-recovery-sol/{bytes,fields,queues,continuity-export,original}-features-final-v1-5cd63ff.log`;
- `../web-sticky-recovery-independent/host-features-final-v1-5cd63ff.log`.

No existing file was modified or deleted. Before committing, `git status --porcelain --untracked-files=all` showed only `??` additions inside these paths.

## 11. Not verified / limitations

- **jsdom and component hosts only** in this batch. No Chrome, native, disk-download, Tauri or visual run is part of E18–E24. Those are E4 and E9–E15, cited above, not rerun.
- **Single runs.** Each gate ran once, except the F-B002 iterations. Timing-dependent defects cannot be excluded by a single pass (F-B002 itself shows this). The F1 suites (E16, E17) were cited, not rerun.
- **Runner substitution.** The More, Notifications and Date & Time suites and the package gates ran under the new runners rather than the older ones. Equivalence is shown by:
  - identical oracles (`git diff --quiet d7358b9 HEAD`);
  - identical Vitest semantics;
  - equal counts and console blocks at `f359be6` against the accepted logs;
  - every other check.

  It is not a byte-for-byte reproduction of the older runners' environment. For example, `@repo` resolves through exact aliases and archive links instead of prefix aliases, and the reporter output differs.
- **Static guards.** The tsc guard checks the program file list. The ESLint guard covers Node module resolution. The shared ESLint config is not type-aware, so no TypeScript program is built during lint.
- **Settings-shell.** No accepted independent receipt exists. The comparison is with the `f359be6` control and a historical author self-report.
- **E6.** Terra's own package run exists only in the commit message (`5cd63ff`, "Tests:" paragraph). It was not independently observed at that time.
- **E14/E15 and R-PET** are cited, not re-reviewed. Screenshots were hash-checked, not visually re-inspected.
- **Dependencies** come from the lockfile-gated main checkout, not a fresh install. The lockfile gate is a consistency check only.
- **F-B002.** Diagnosis used scratch copies and a generated diagnostic runner. Its results are characterizations under today's machine load (load average ≈ 6) and are not rate guarantees.

## 12. Remaining boundary

- CP-FEATURES-01 stays `verification_pending` until the independent final acceptance (batch 31). That review must reconcile every §13 row and §14 item: source, before failure, fixed result and user surface. It must also decide:
  - R-PET;
  - the E14 §12 item 3 question (§5 item 7);
  - whether F-B002 needs a More-oracle repair window before or after acceptance.
- Accepting the caller would still not close REL-05 or any other 312 item, and would not authorize deployment, release or Web→Desktop sync. Any Desktop flow needs the ADR-0013 D3 gate.
