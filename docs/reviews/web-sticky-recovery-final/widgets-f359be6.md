# Sticky G1 receipt: dashboard-widgets downstream tests from immutable archives

- **Date:** 2026-10-04
- **Module:** `web`
- **Control-plane item:** CP-STICKY-01 (Settings Sticky Note, all5 recovery caller), batch 18.
- **What it closes:** evidence gap **G1** only. G1 is Sticky contract §10 item 4 (`../web-sticky-recovery-contract/contract.md` line 459), which feeds the §13 row "Downstream readers and canonical format". The gap was raised in `../web-sticky-recovery-acceptance/blocked-f359be6.md` §4.
- **Verifier:** an independent parent-role verifier (Claude Opus 5.5). It did not write the Sticky caller, the coordinator repair, the contract or any earlier evidence.
- **Scope of changes:** four new files in this directory: the runner, two logs and this receipt. No product code, test, runner, oracle, existing log, contract, ledger or control-plane file was modified.

## Verdict

**PASS.** All five required files pass from the fixed archive `f359be6`, and they also pass from the before archive `2023526` with identical results. Each archive ran once, both exited 0 on the first run, and no environment rerun was needed. No failure occurred, so nothing was frozen.

This meets the closure oracle in `blocked-f359be6.md` §4.4:
- Vitest exited 0.
- Each of the five files is reported as passed, with its test count.
- There is no `FAIL` line and no unhandled error, and stderr is empty.
- Both logs are committed, and their SHA-256 values are listed below.

| File (`packages/xai-web-dashboard-widgets/`) | `f359be6` (fixed) | `2023526` (before, no-drift control) |
| --- | --- | --- |
| `src/__tests__/StickyComposer.test.tsx` | 10/10 passed | 10/10 passed |
| `src/__tests__/StickiesWidget.test.tsx` | 19/19 passed | 19/19 passed |
| `src/__tests__/useStickies.test.tsx` | 4/4 passed | 4/4 passed |
| `src/internal/stickiesStore/__tests__/stickiesStore.test.ts` | 17/17 passed | 17/17 passed |
| `src/internal/stickiesStore/__tests__/ids.test.ts` | 3/3 passed | 3/3 passed |
| **Total** | **5 files, 53/53 passed, 0 failed, 0 skipped** | **5 files, 53/53 passed, 0 failed, 0 skipped** |
| Vitest exit / harness checks / runner exit | 0 / PASS (5/5) / 0 | 0 / PASS (5/5) / 0 |

Where the counts appear in each log (both logs share the same line layout):
- Per-file counts from Vitest's JSON reporter: lines 93–98.
- Vitest's own totals: lines 82–83 (`Test Files 5 passed (5)`, `Tests 53 passed (53)`).
- Exit codes: lines 21–23.
- Cross-check: each log has exactly 53 `✓` lines and no `×`, `FAIL`, `Error:` or `Unhandled` line. With timings stripped, the 53 test names are identical in the two logs.

## Commands

Worktree (isolated, `.claude/worktrees/agent-a04535ad704d70f4d`):

```sh
git status --short                                   # empty
git checkout --detach 89d43020aced31c1b75257893d21508abc2b630d
git rev-parse HEAD                                   # 89d43020aced31c1b75257893d21508abc2b630d; status clean
git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml   # empty
```

The runs use a read-only dependency checkout; nothing was installed:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-sticky-recovery-final/verify-widgets.mjs f359be6 fixed1
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-sticky-recovery-final/verify-widgets.mjs 2023526 before1
```

The runner launches the package's own Vitest binary from the archive package directory:

```sh
<deps>/packages/xai-web-dashboard-widgets/node_modules/.bin/vitest run \
  --config <archive>/packages/xai-web-dashboard-widgets/g1-widgets.vitest.config.mjs \
  --reporter=verbose --reporter=json --outputFile.json=<archive>/.g1-report.json
```

Package delta and reachability:

```sh
git diff --name-only 2023526 f359be6 -- packages/xai-web-dashboard-widgets                    # empty
git diff --name-only 2023526 f359be6 -- packages/xai-web-dashboard-widgets packages/core \
  packages/plugin-web-storage packages/plugin-web-time-tracker packages/plugin-web-tokens \
  packages/xai-web-event-bus packages/xai-web-shell packages/typescript-config \
  packages/eslint-config package.json pnpm-lock.yaml pnpm-workspace.yaml                         # empty
git diff --name-only 2023526 f359be6 -- apps packages package.json pnpm-lock.yaml              # the 10 files listed below
```

The `git grep` reachability searches are listed under "Reachability".

## Evidence files and hashes

| File | SHA-256 | Lines |
| --- | --- | --- |
| `verify-widgets.mjs` (runner) | `45e9d9aa793f5ef0fc834f12d78e698b948898a1f26d06eec3c36c9da5090279` | 328 |
| `widgets-fixed1-f359be6.log` | `ae782f6f8e1e2dc515d875396ee4366da41249765a937a1e992e13a9623679ef` | 153 |
| `widgets-before1-2023526.log` | `4fbec3deedc3638606e836263af0a90966e4b4cd30b7e3599f1174705e1d00b5` | 153 |

Both logs record `runner_sha256=45e9d9aa…0279`, which equals the committed runner.

Each log header records:

| Field | `f359be6` log | `2023526` log |
| --- | --- | --- |
| requested → resolved commit | `f359be6` → `f359be6d838393e0f9e93efd80b88b5b09f6144e` | `2023526` → `20235269749dad514833d76c27b958f694d0e4e9` |
| resolved tree | `2280bc7617d52dc6c4356da257d57940ecb174ec` | `16f49e9388d66391e9855b4e79b2e53f4b9683f2` |
| archive lockfile = dependency lockfile SHA-256 | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` (gate passed) | same (gate passed) |

The toolchain was identical for both runs:
- Vitest 3.2.7, Vite 7.3.6, Node v24.16.0.
- darwin-arm64, time zone America/Los_Angeles.
- Dependency root: the main checkout, used read-only.

## Before vs fixed comparison

**Identical in both logs:**
- **Archive SHA-256 of the package inputs:**

  | File | SHA-256 |
  | --- | --- |
  | `package.json` | `75366f91…6759` |
  | `tsconfig.json` | `d6ed012d…dca1a` |
  | `vitest.config.ts` | `4ce52c49…6a0c` |
  | `src/__tests__/setup.ts` | `2d9dc4dd…be02` |
  | `StickyComposer.test.tsx` | `d5c8e56a…e5e1` |
  | `StickiesWidget.test.tsx` | `9543ac98…3355` |
  | `useStickies.test.tsx` | `23d4c821…ceac` |
  | `stickiesStore.test.ts` | `31bf6787…47d0` |
  | `ids.test.ts` | `f54c1197…1309` |

  The full values are on log line 15.
- The dependency-closure tree ids (next section).
- The workspace links, the `tsconfig` extends resolution and the 75 aliases (header lines 16–20, byte-identical).
- The per-file counts and the 53 test names.
- The five harness checks.
- The 45 archive modules loaded. The guard records these on lines 108–153, and the two lists are identical.

**Different, as expected:** the resolved commit and tree, the suffix, the temporary paths, and the timings.

**Conclusion:** the downstream widget behaviour exercised by these tests is the same before and after the Sticky caller and the coordinator repair. There is no drift.

## Package delta

`git diff --name-only 2023526 f359be6 -- packages/xai-web-dashboard-widgets` is **empty**, as expected.

The whole workspace dependency closure also has an empty diff. That closure is computed from the archive manifests: the package's own dependencies (including dev), then runtime and peer dependencies transitively. Its tree ids, recorded by the runner, are equal at both SHAs:

| Package | Folder | Tree id at `2023526` and `f359be6` |
| --- | --- | --- |
| `@repo/plugin-web-dashboard-widgets` | `packages/xai-web-dashboard-widgets` | `4d65ad167b0d3712166e96569b1d9f44ed66a500` |
| `@repo/core` | `packages/core` | `6bfdb0eac1ff1a597128e5c8c9b9feba52d11051` |
| `@repo/plugin-web-storage` | `packages/plugin-web-storage` | `782c79de33a1da6851b5a235950408eb7ae89f99` |
| `@repo/plugin-web-time-tracker` | `packages/plugin-web-time-tracker` | `a71c455ef8eb207894ebb62dcf8cefe65f2903dc` |
| `@repo/plugin-web-tokens` | `packages/plugin-web-tokens` | `3ea903458975b90129f563ddbf4b31224e9b4b52` |
| `@repo/xai-web-event-bus` | `packages/xai-web-event-bus` | `c68c77fae4984e8b60aaf9684c61bbe21224a38d` |
| `@repo/xai-web-shell` (transitive, via time-tracker) | `packages/xai-web-shell` | `0f0fed40fe94a9de5c79eb273d1103757a807a9c` |
| `@repo/typescript-config` (dev, config only) | `packages/typescript-config` | `4ac12dadfb98442d2f96b2dee2ae25b3405d13fe` |
| `@repo/eslint-config` (dev, config only) | `packages/eslint-config` | `9e14caf85dd45965f263318f34577cea75045b72` |

`blocked-f359be6.md` §4.2 listed only the five direct runtime dependencies. This closure adds the transitive `@repo/xai-web-shell` and the two config-only dev packages; all three also have empty diffs.

For context, the full product delta `2023526..f359be6` is exactly 10 files:
- `apps/web/src/routes/modules/departureCoordinator.tsx` and `__tests__/departureCoordinator.blocker.test.tsx`;
- the eight contract §11 files in `packages/plugin-web-settings-rest/`:
  - `src/panes/stickyPane.tsx`
  - `src/internal/StickyColorPalette.tsx`
  - `src/internal/localI18n.ts`
  - `src/styles.css`
  - `src/__tests__/stickyPane.test.tsx`
  - `src/__tests__/stickyPaneRecovery.test.tsx`
  - `docs/api.md`
  - `docs/test.md`

None of them lies in the closure.

## Reachability

Nothing in `@repo/plugin-web-dashboard-widgets` or its dependency closure can import the changed Sticky pane files or `apps/web/src/routes/modules/departureCoordinator.tsx`.

**Static evidence:**
1. **Manifests.** The closure does not contain `@repo/plugin-web-settings-rest` or `@repo/web` (`closure_contains_changed_packages=none` in both logs). At `f359be6`, `git grep -l -E '"@repo/(plugin-web-settings-rest|web)"' f359be6 -- 'packages/*/package.json' 'apps/*/package.json'` finds only:
   - `apps/web/package.json`: the `@repo/web` package itself, which declares settings-rest;
   - `packages/plugin-web-settings-rest/package.json`: its own name.

   No package depends on `@repo/web`, and settings-rest's only dependent is `apps/web`.
2. **Import specifiers.** I ran `git grep` at `f359be6` over all nine closure folders:
   - Search A matches `import`/`from`/`require` specifiers that contain `settings-rest`, `stickyPane`, `StickyColorPalette`, `localI18n`, `departureCoordinator` or `@repo/web`. Exit 1: no match.
   - Search B matches relative specifiers that reach an `apps/` path. Exit 1: no match.
   - A naive `apps/` search also hits the `@tauri-apps/api` imports in `packages/core`. These are unrelated third-party imports, which is why search B anchors on relative paths.

**Dynamic evidence.** The runner's guard plugin records every archive module Vite transforms. In both runs it recorded:
- 45 modules from exactly three packages: `plugin-web-storage` 23, `plugin-web-tokens` 7, `xai-web-dashboard-widgets` 15;
- `pin_changed_package_modules_loaded=none`;
- zero `@repo` imports that bypassed an alias.

These five test files do not even load `time-tracker`, `xai-web-shell`, `core` or `event-bus`.

## How the runner meets the pattern requirements

The pattern is `../web-sticky-recovery-sol/verify-fixed.mjs`, which was read and not modified.

- **Immutable archive.** The runner expands `git archive <resolved commit>` into a fresh temporary directory, checks that the extracted `pnpm-lock.yaml` equals `git show <commit>:pnpm-lock.yaml`, and deletes the directory afterwards.
- **Lockfile gate.** `assert.equal(sha256(deps/pnpm-lock.yaml), sha256(archive lockfile))` must hold before anything runs.
- **Requested and resolved SHA, plus runner hash.** All three are recorded in the header.
- **Refuses to overwrite.** The log path is checked before the run and again before writing, and the write uses exclusive create (`flag: "wx"`).
- **Exit code preserved.** The runner exits with Vitest's status, or 2 if Vitest exited 0 but a harness check failed. Both runs exited 0.
- **Package's own Vitest configuration and setup.**
  - The wrapper config, generated inside the archive package, imports the archive's own `vitest.config.ts`. It adds only `root`, `cacheDir`, aliases, the guard plugin and `test.include` (the five files).
  - The resolved config is captured from Vite's `configResolved` and recorded (`pin_config`, log line 104): environment `jsdom`, `globals: false`, `setupFiles: ["./src/__tests__/setup.ts"]`, root = archive package, include = the five files.
- **`@repo/*` pinned to the archive.** Three mechanisms, each stricter than the pattern:
  1. **Exact-match aliases.** Every archive `packages/*` export specifier (75) is aliased to the archive file.
  2. **Archive-internal links.** Workspace entries are never linked from the dependency checkout. Instead, each package's declared `@repo` dependencies are linked to the archive's own folders. As a result, Node-style resolution also stays inside the archive, including `tsconfig.json` `extends: "@repo/typescript-config/react-library.json"`.
     - The pattern merely omits `@repo` links. Under the pnpm `.bin` shim, whose `NODE_PATH` includes the dependency checkout's hoisted `.pnpm/node_modules/@repo`, that resolution could otherwise fall back to the checkout.
     - The header records each closure package's `extends` resolving to `packages/typescript-config/react-library.json` inside the archive.
  3. **Guard plugin.** It fails the run if any module is transformed from the dependency checkout's `packages/` or `apps/`, or if an unaliased `@repo` import resolves outside the archive.

  `react` is not aliased. The tests live inside the package, so React resolves through the package's own links to the single lockfile version.
- **Read-only dependency checkout.**
  - Only third-party entries are linked: dot-entries other than `.bin` and `.pnpm` are skipped, and so is `@repo`.
  - The Vite cache and the bundled-config temp file live inside the archive.
  - After the runs, `find … -newer verify-widgets.mjs` showed no new files in the dependency checkout's root `node_modules` (depth 1) or in the widgets, storage and tokens package `node_modules` (depth 3). No temporary archive directory was left behind.

## Harness self-check (disclosure; not evidence)

Before the two official runs, the harness itself was checked outside the repository, in the session scratchpad, and nothing from it was committed. None of the five G1 files ran outside the committed logs. Two checks were made:
- **Smoke run.** A derived copy of the runner, with `FILES` replaced by the non-G1 `src/__tests__/index-barrel.test.ts`, ran once at `89d4302`: 2/2 passed, harness 5/5.
- **Negative control.** The same copy, with the forbidden prefix set to the archive's own `packages/plugin-web-storage`, failed as designed: `G1 pin violation: module loaded from the dependency checkout: …/plugin-web-storage/src/index.ts`, Vitest exit 1, and the runner preserved exit 1. This shows the guard is not a no-op.

## Limitations

- These are jsdom unit and component tests of the widgets package, not a browser or Tauri run. The contract asks for exactly this executed pass.
- Each archive ran once, per the cost cap. A single passing run cannot exclude flakiness in principle. The five files use no timers, `waitFor` or fake clocks; their only clock read is one `Date.now()` in `ids.test.ts`, used in a string-format assertion.
- Non-gating test-strength note, for the reviewer: `ids.test.ts` AC-IDS-3 checks an inline rebuild of the fallback id format, not the product's fallback path (its own comment says so). This file is unchanged since `2023526`, so the Sticky delta does not affect it.
- Third-party dependencies come from the installed dependency checkout under the lockfile-hash gate, not from a fresh install. `pnpm install --offline` was not used.
- Only the five named files ran, not the package's other 29 test files. Widgets typecheck and lint were not run; neither is required by §10 item 4.
- Per-file counts come from Vitest's JSON reporter. They agree with Vitest's own totals and the verbose `✓` lines in the same log.

## Scope statement

- This receipt closes only the **G1 evidence** item: contract §10 item 4, which `blocked-f359be6.md` §4 found missing.
- It is **not acceptance**:
  - row 5 still needs the narrow independent re-review (control-plane batch 19);
  - CP-STICKY-01 stays `verification_pending` until that review.
- It closes **no 312 item**. SET-12, REL-05, QA-01, QA-03, QA-04, QA-09 and the D2 writer inventory stay open.
- No product, contract, ledger, control-plane or existing evidence file was changed. Nothing was pushed, merged, deployed, released or synced from Web to Desktop.
