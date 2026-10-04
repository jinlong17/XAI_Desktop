# CP-STICKY-01 final acceptance at `f359be6`: ACCEPT (narrow re-review)

- **Date:** 2026-10-04
- **Module:** `web`
- **Control-plane item:** CP-STICKY-01 (Settings Sticky Note, all5 recovery caller), batch 19.
- **Reviewer:** Claude Opus 5.5, independent final reviewer (narrow re-review). Astra-role mapping: risk and final decision. It did not author the contract, the oracles, the implementation, the coordinator repair, the F1 impact review, any verification evidence, the G1 runner or receipt, or the first final review (`47bbd58`), and it shares no context with those instances.
- **Verdict: ACCEPT.**
  - Row 5 ("Downstream readers and canonical format") was the only row the first review blocked. It now passes:
    - the G1 evidence (`3debd91`) meets contract §10 item 4 and the closure oracle in `blocked-f359be6.md` §4.4;
    - §10 items 1, 3 and 5 are re-confirmed, and so is item 2 with the authorized shared-delta exception.
  - Rows 1–4 and 6 pass as found by `47bbd58`. My independent spot-checks of its key citations and hashes found 0 mismatches and nothing that contradicts its findings or rulings.
  - All six §13 rows reconcile source, before state, fixed independent result and actual user surface, so the contract's acceptance condition is met.
  - No product failure was found, and nothing is frozen.

## 1. Fixed boundary

| Item | Value |
| --- | --- |
| Review checkout | Isolated worktree `.claude/worktrees/agent-a886df133539955c2`. `git status --short` was empty, then `git checkout --detach 57f396c8fcc37bf41aaa2a8293b1f566427f78e4`. HEAD verified and status clean |
| No product change since the first review | `git diff --name-only 47bbd58 HEAD -- apps packages package.json pnpm-lock.yaml` is empty, and so is the same diff from `f359be6` |
| Contract | `docs/reviews/web-sticky-recovery-contract/contract.md` at `70ff46a`, unchanged since (`git log 70ff46a..HEAD` on the directory is empty). SHA-256 `2d8f6b7e4afa96bf5415c6e867e8c8dfc645c6a55975d7e31659635baaae8e0b` |
| First final review | `blocked-f359be6.md` at `47bbd58`, unchanged since. SHA-256 `34a1a4569e7818f06eeecfdc53d56cfa5e5d92da9d174dd393715eac1e1aaf49` |
| G1 evidence | `3debd916231b6dc6e87590a83e1e8f02e61a0e29` (parent `89d4302`). 4 files added (865 lines in all), unchanged since (`git diff --name-only 3debd91 HEAD -- docs/reviews/web-sticky-recovery-final/` is empty). Receipt `widgets-f359be6.md` SHA-256 `feaa36f92327d6ea422859c90b267a85dda62e85f491c5f8698d45af6bdbff4e` as reviewed |
| Before product | `20235269749dad514833d76c27b958f694d0e4e9`, tree `16f49e9388d66391e9855b4e79b2e53f4b9683f2` |
| Implementation | `210abdf77562660372c47086db02bd21e870deb5` (parent `37a4d33`) |
| Product under review | `f359be6d838393e0f9e93efd80b88b5b09f6144e` (parent `c3b9883`), tree `2280bc7617d52dc6c4356da257d57940ecb174ec` |
| Ancestry | `2023526` → `210abdf` → `f359be6` → `57f396c`. Each `merge-base --is-ancestor` is true |
| Product delta `2023526..f359be6` | Exactly 10 files, +1586/−57: <ul><li>`2023526..210abdf`: the 8 contract §11 files in `packages/plugin-web-settings-rest/` (+955/−48): `src/panes/stickyPane.tsx` +318/−39, `src/internal/StickyColorPalette.tsx` +2/−1, `src/internal/localI18n.ts` +15/−0, `src/styles.css` +42/−0, `src/__tests__/stickyPane.test.tsx` +15/−6, new `src/__tests__/stickyPaneRecovery.test.tsx` +508, `docs/api.md` +32/−0, `docs/test.md` +23/−2.</li><li>`210abdf..f359be6`: `apps/web/src/routes/modules/departureCoordinator.tsx` +48/−9 and new `__tests__/departureCoordinator.blocker.test.tsx` +583.</li></ul> |
| Lockfile | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` at `2023526`, `f359be6` and `57f396c`. Both G1 logs record the same value for the dependency checkout (L12–13) |

## 2. Six-gate reconciliation (contract §13)

Rows 1–4 and 6 rest on `blocked-f359be6.md` §2, which I re-examined through the spot-checks in §4. Row 5 is my own full assessment (§3).

| Gate | Basis | Independent spot-checks (this review) | Verdict |
| --- | --- | --- | --- |
| **1. All5 ordinary fields** | `47bbd58` §2 row 1. Sol `fields` 47/47, `bytes` 13/13 and `original` 10/10 at `f359be6`. Host F-a 5/5. Native `controls` 482/482. Input-error-only and source-only states natively | <ul><li>Before failures: `fields-before1-2023526.log` 0/47 (L111), with H4 at L566 (`huge` persisted).</li><li>Fixed: Sol post logs 47/22/27/13/10 with 0 `PRECONDITION:` lines; hashes match `web-sticky-recovery-sol/post-f359be6.md`.</li><li>Source: five `usePrefAutosaveAsync` bindings with caller validators (`stickyPane.tsx:86–90`). Per-field `aria-label`s are `Retry/Discard/Reload <Label>` (`:313–314, 318`). No raw Storage, `setPref`, `getPref`, `usePref(`, `meta.reset`, `removePref` or `resetAllPrefs` in `stickyPane.tsx` or `StickyColorPalette.tsx`.</li><li>ZH 375 all-five screenshot: five recovery blocks, Export and Discard all.</li></ul> | **PASS** |
| **2. Same-field queue attribution** | `47bbd58` §2 row 2. `queues` 27/27 at `f359be6`. Native held lock, uncertainty with one write and a second-document conflict. h1 row i releases exactly once | <ul><li>Before failures: `queues-before1-2023526.log` 0/27 (L71), with H6 at L308 and H5 at L368.</li><li>h1 `native-f359be6-post1-host.log`:<ul><li>L290 (i-pop Retry): exactly 1 POP commit to the held key, 0 `pushState`/`replaceState`;</li><li>L327 (i-push Retry): 1 commit, 1 `pushState`, 0 `replaceState`.</li></ul></li></ul> | **PASS** |
| **3. Device continuity and export** | `47bbd58` §2 row 3. `continuity-export` 22/22. Native `export` 295/295 (x1–x8) | <ul><li>Before: `continuity-export-before1-2023526.log`: 19 failed, 3 passed (L58).</li><li>Export log citations x2 L64/65/67/77/81, x7 L243 and x8 L296 are as stated (0 attempts, one URL created and the same one revoked, warning and guard still active, localized error shown).</li><li>The x2 artifact text equals the contract §8 envelope (contract L332).</li><li>Export log hash = native `post-f359be6.md` L64.</li></ul> | **PASS** |
| **4. Production host/native** | `47bbd58` §2 row 4: jsdom host 28/28; Chrome h1 40/40 runtime gates; EN/ZH 577/577 per language; keyboard; 18 screenshots. The first reviewer's own h1 rerun PASSED | <ul><li>Before: `host-before1-2023526.log`: 23 failed, 5 passed (L70), with sign-out `true` at L254 and no `beforeunload` warning at L396.</li><li>h1: 681 lines, 0 `"pass":false`, 40/40 deferred runtime gates including c9, c10, c11 and i-pop. L679–681: deferred failures 0, runtime errors 0, `pass:true`, 634 checks.</li><li>Visual: EN/ZH 577 checks each, `pass:true`, 0 runtime errors, 18/18 PNG hashes match.</li><li>Source: guard `:253–267`, label `settings.sticky` `:250`, `beforeunload` `:269–279` (in-memory check only).</li></ul> | **PASS** (dialog containment ruling concurred, §5) |
| **5. Downstream readers and canonical format** | This review, §3 | §10 items 1–5 and the before byte/default controls, all verified directly | **PASS** |
| **6. Final regression** | `47bbd58` §2 row 6. `d7358b9`: 14 invocations, all exit 0 on the first run | <ul><li>24/24 log hashes match `review-final-regressions-f359be6.md` L177–210, each on the line naming the same directory and file.</li><li>Settings-rest 44/314, with `stickyPane.test.tsx (10 tests)` at L27 of `web-notifications-recovery-astra/package-sticky-final-v1-f359be6.log` and totals at L52–53. Web 28/156. Storage check-types `exit=0`.</li><li>The styles delta is +42/−0, all `.sticky-recovery-*` from `styles.css:835`. Those classes are emitted only by `stickyPane.tsx` and referenced only by its test.</li><li>The coordinator delta is logic-only (§5.4).</li></ul> | **PASS** |

**Acceptance condition.** Every row now reconciles the four elements:
- **Rows 1–4:** source, correct before FAILs (Sol 93 and host 23 at `2023526`), fixed independent results, and Chrome surfaces.
- **Row 5:** this no-drift gate reconciles through:
  - source: no reader of the five keys outside the pane, and storage unchanged;
  - before positive controls at `2023526`: `bytes` 13/13 and widgets 53/53;
  - fixed independent results: `bytes` 13/13, widgets 53/53, D1 and check-types;
  - native evidence: exact bytes for all 25 values.
- **Row 6:** independent archive reruns.

None of the excluded shortcuts applies:
- the evidence is far beyond ST6/ST8;
- strings and switches are both converted;
- recovery ships with the host matrix and native export.

## 3. Row 5: full assessment

### 3.1 §10 item 4: the G1 runner (`verify-widgets.mjs`, 328 lines)

| Requirement | Finding |
| --- | --- |
| Expands an immutable archive | <ul><li>The requested revision resolves through `rev-parse --verify <rev>^{commit}` (L64–65).</li><li>A fresh `mkdtempSync` directory (L119) receives `git archive <resolved commit>` through `tar -x` (L125).</li><li>The extracted `pnpm-lock.yaml` is re-hashed against `git show <commit>:pnpm-lock.yaml` (L126), and each of the five files must exist in the archive (L127).</li><li>The directory is removed in `finally` (L326).</li><li>The `f359be6` tree has no `.gitattributes`, so the archive reproduces the committed blobs (no `export-ignore`/`export-subst`).</li></ul> |
| Lockfile gate | `assert.equal(sha256(<deps>/pnpm-lock.yaml), sha256(archive lockfile))` runs before anything else (L66–70). Both logs record equal values (L12–13) |
| `@repo/*` pinned to the archive | <ul><li>Every archive `packages/*` export gets an exact-match alias (75; L206–220, log L20).</li><li>The dependency checkout's `@repo` entries are never linked (L169). Instead, each package's declared `@repo` dependencies link to the archive's own folders (L173–192, log L18).</li><li>The `tsconfig` `extends` of every closure package must resolve inside the archive (L194–204, log L19).</li><li>The guard plugin (L87–108) throws if any module is transformed from `<deps>/packages` or `<deps>/apps`, or if an unaliased `@repo/` import resolves outside the archive. Neither config sets `preserveSymlinks`, so a fallback to the checkout's hoisted `@repo` links would surface as a `<deps>/packages/…` module and trip the guard.</li><li>Logs: `pin_unaliased_repo_imports=0` (L105). All 45 recorded modules are archive-relative (L108–153). `pin_changed_package_modules_loaded=none` (L107).</li></ul> |
| Runs exactly the five files | <ul><li>`FILES` (L49–55) are exactly the five contract-named files. They are the only test files in the package whose names match those components, out of 34.</li><li>The wrapper merges the archive's own `vitest.config.ts`, which has no `include` (so the merge cannot widen the set), with `test.include = FILES` (L110–116).</li><li>The resolved config is jsdom, `globals: false`, the package's own `setupFiles`, root = the archive package, include = the five files (log L104).</li><li>Vitest reports `Test Files 5 passed (5)` (L82), and the harness check "reported files equal the five requested files" passes (L100).</li></ul> |
| Log hygiene and exit code | <ul><li>The log path is refused if it exists, before the run and again before writing, and the write uses `flag: "wx"` (L60, L320–321).</li><li>The exit is Vitest's status, or 2 on a harness failure (L280, L328).</li><li>Requested and resolved SHA and the runner hash go in the header (L283–307).</li><li>Only the two logs exist (`widgets-*`), so there was no hidden rerun.</li></ul> |

### 3.2 Hashes and log content

| File | Recomputed SHA-256 | Receipt (`widgets-f359be6.md` L81–83) | Lines |
| --- | --- | --- | --- |
| `verify-widgets.mjs` | `45e9d9aa793f5ef0fc834f12d78e698b948898a1f26d06eec3c36c9da5090279` | equal; also equals `runner_sha256` at L14 of both logs | 328 |
| `widgets-fixed1-f359be6.log` | `ae782f6f8e1e2dc515d875396ee4366da41249765a937a1e992e13a9623679ef` | equal | 153 |
| `widgets-before1-2023526.log` | `4fbec3deedc3638606e836263af0a90966e4b4cd30b7e3599f1174705e1d00b5` | equal | 153 |

**Content of both logs.**
- **Revisions.**
  - Fixed: `f359be6` → `f359be6d838393e0f9e93efd80b88b5b09f6144e`.
  - Before: `2023526` → `20235269749dad514833d76c27b958f694d0e4e9`.
  - Both resolved trees equal `git rev-parse <sha>^{tree}` (L1–3).
- **Exit status:** `vitest_exit=0`, `harness_checks=PASS (5/5)` and `exit=0` (L21–23).
- **Results.**
  - 53 `✓` lines (L28–80), and 0 `×`, `FAIL`, `Error:` or `Unhandled` lines.
  - `Test Files 5 passed (5)` and `Tests 53 passed (53)` (L82–83).
  - stderr is empty (L89–90). The JSON reporter shows `success=true numFailedTests=0` (L92).
  - Per file (L93–98): StickyComposer 10, StickiesWidget 19, useStickies 4, stickiesStore 17, ids 3.
  - These counts equal a static count of `it(`/`test(` in the five files, which contain no `.skip`, `.only` or `.todo`.
- **Archive input hashes (L15).** All nine equal my recomputation from the `f359be6` package tree:
  - `package.json`, `tsconfig.json`, `vitest.config.ts`, `setup.ts`;
  - the five test files.

  That tree is `4d65ad16…`, identical at `2023526`, `f359be6` and `57f396c`.
- **Before vs fixed.** I normalized the temporary-directory suffix, per-test milliseconds, `Start at` and `Duration`. After that, the two logs differ only in L1–4 (requested and resolved revision, tree, suffix) and L7 (the command). Everything else is byte-identical: input hashes, closure, links, aliases, the 53 test names, harness checks, resolved config and the 45 modules.

### 3.3 Package and dependency closure: unchanged and unreachable

- **Closure.** I computed the closure from the archive manifests: the package's own dependencies including dev, then runtime and peer dependencies transitively. It has 9 members, which is exactly the log's `closure_trees` (L16): `@repo/plugin-web-dashboard-widgets`, `core`, `plugin-web-storage`, `plugin-web-time-tracker`, `plugin-web-tokens`, `xai-web-event-bus`, `xai-web-shell` (transitive), `typescript-config` and `eslint-config` (dev, config only).
- **Unchanged.**
  - `git ls-tree -d` gives identical tree ids for all nine folders at `2023526`, `f359be6` and `57f396c`. They equal the log and receipt values (for example `4d65ad167b0d3712166e96569b1d9f44ed66a500`).
  - `git diff --name-only 2023526 f359be6 -- <the nine folders> package.json pnpm-lock.yaml pnpm-workspace.yaml` is empty.
- **Unreachable from the changed files.**
  - Manifests: `@repo/plugin-web-settings-rest`'s only dependent is `apps/web` (`@repo/web`), nothing depends on `@repo/web`, and neither is in the closure (`closure_contains_changed_packages=none`, L17).
  - Imports, searched with `git grep` at `f359be6` over the nine folders:
    - no `import`/`from`/`require` specifier names `settings-rest`, `stickyPane`, `StickyColorPalette`, `localI18n`, `departureCoordinator` or `@repo/web` (exit 1);
    - no relative specifier reaches `apps/` or settings-rest (exit 1).
  - The only textual `settings-rest` mentions in the closure are comments and the registry's `owner: "xai-web-settings-rest"` metadata strings (42 in `registry.ts`).
  - Dynamic evidence: the 45 loaded modules come from storage (23), tokens (7) and widgets (15) only.

### 3.4 The other §10 items and the before controls

| Item | Evidence | Result |
| --- | --- | --- |
| §10.1 exact bytes, all 25 values | Sol `bytes` "PC §10.1" ×5 at all three SHAs (`bytes-before1-2023526.log` L19–23; 5 hits each in the `fixed1`/`post1` logs). Native `native-f359be6-post1-controls.log`: 25 distinct `controls:value-N` cases, 350 checks, all `pass:true` | PASS |
| §10.2 empty diff of the listed paths | `git diff --name-only 2023526 f359be6 -- packages/plugin-web-storage packages/plugin-web-settings-shell packages/xai-web-dashboard-widgets packages/xai-web-cmdk apps package.json pnpm-lock.yaml` lists only the coordinator and its new test. See below | PASS with the authorized exception |
| §10.3 D1 search at the fixed SHA | `git grep -c` for the five key literals and suffixes, across the whole tree except `docs/` and `*.md`. At `f359be6`: 8 files. The per-file counts equal `2023526`, plus one new file, the Sticky-local `stickyPaneRecovery.test.tsx` (5). That file is the pane's own test, not a consumer. The widgets hit is the comment at `stickiesStore/types.ts:25`. No Rust or JSON form. StickyComposer is unchanged (empty widgets diff) | PASS |
| §10.4 widgets tests from the fixed archive | §3.1–§3.3 | PASS |
| §10.5 storage check-types and lifecycle | <ul><li>`storage-check-types-sticky-final-v1-f359be6.log`: `exit=0`, `tsc --noEmit`, hash at receipt L182.</li><li>The storage package diff is empty.</li><li>`lifecycleDeclaration.ts:26–33` with `accountOwnership.ts:99–103`: device → `device-recovery` / `retain` / `retain-on-device`.</li><li>Sol `bytes-post1-f359be6.log` L18 PASS.</li></ul> | PASS |
| Before byte and default controls at `2023526` | `bytes-before1-2023526.log` 13/13 (L30): §10.1 ×5 (L19–23), §2/§10 registry/lifecycle (L18) and §5.1 absent defaults with zero writes (L24). Widgets 53/53 at `2023526` as an extra no-drift control | PASS |

**§10.2 exception: concurred.**
- The contract itself provides for a shared delta: §11 "Shared defects", and §13 row 6, "Any shared delta needs … fresh acceptance".
- All four §11 preconditions preceded the repair, as `merge-base` and the parents show:
  - the F1 before oracles: `019f451`, then `e3db4e0`;
  - the Astra-role impact review: `0ba68d7`;
  - explicitly revised ownership: `41774ab` and `c3b9883`, the parent of `f359be6`;
  - the affected-caller reruns afterwards: `3ea0310` and `f3a3c82`.
- §10's purpose is "no drift" for the five keys, and the delta cannot drift them:
  - the only three "sticky" mentions in it are in the new test (two comments and the label `"Sticky Note"`);
  - no listed downstream package, manifest or lockfile changed.

**Row 5 verdict: PASS.** The G1 gap (`blocked-f359be6.md` §4) is closed exactly as its §4.4 oracle specified. No row-5 condition remains open.

## 4. Spot-checks of the first review (`47bbd58`)

I recomputed 166 evidence-file hashes and 3 lockfile hashes and found 0 mismatches. I found no citation that contradicts the first review.

| Sample | Recomputed | Receipt match | Content check |
| --- | --- | --- | --- |
| h1 post-repair `native-f359be6-post1-host.log` | `6fe8d67efee1f525a0005414bc20fd929863da21b4c4430f859ca667131dfc56`, 681 lines | = `web-sticky-recovery-native/post-f359be6.md` L62 | As in row 4 above |
| f1 `f1-f359be6-sticky-post1.log` / `f1-f359be6-more-post1.log` | `11644bb9f77fb806568c7eccdc11537379d5623fdb2deeaebaada42f1d20195f` / `ed81611992e9688554ef389ff459c60ad7a2664b46154d5d0d75d80c6fae6463`, 68 lines each | = `web-sticky-recovery-f1/post-f359be6.md` L97–98 | Both: `result pass:true`, 62 checks, 0 `"pass":false`, `f1Signature:false`, one proceed per release case |
| Visual EN / ZH | `f75916a9bc335c109811c1933302a732d925a09127f5373dff800dbf5ce33357` / `bb9893b20fef0e143aaa814e497d8eebc40ababb78d72ffe8a985b194a571f19`, 649 lines each | = `review-visual-f359be6.md` L49–50. The 18 PNGs match too (18/18) | 577 checks each, 0 runtime errors. L644: post-Discard and post-Discard-all focus is `body` |
| Final regression (`d7358b9`) | 24 logs | 24/24 = `review-final-regressions-f359be6.md` L177–210 | As in row 6 above |
| Native controls / export | `74451947…6848` / `2b63c770…40fa` | = native `post-f359be6.md` L63–64 | controls: 482 checks, `pass:true`. L462–467: new-document reload with 0 writes and 0 removes (L465). export: 295 checks, `pass:true` |
| Sol post logs (5), jsdom host post log (1), Sol before `bytes` (1) | 7 files | 7/7 match their receipts (`sol/post-f359be6.md`, `independent/post-f359be6.md`, Sol README and `fixed-210abdf.md`) | host 28/28 (L46–47) |
| Affected callers (`f3a3c82`) | 98 non-receipt files | 98/98 = `affected-callers-f359be6.md` | 0 logs with `"pass":false` |
| Dialog relation | `width` records (state `dialog`) at L339/358/376/394/412, both languages | — | <ul><li>`inDetail` is true for all three actions at 375 and 414, false for Stay at 768, and false for all three at 1024 and 1440. This matches `47bbd58` §5.</li><li>Rects: EN 50.39/154.89/238 × 44, ZH 49.78/107.78/151.28 × 44 at every width.</li><li>At 1024, `dialog:stay` has `centerHit`, `allHit`, `inViewport` and `inDialog` all true.</li></ul> |

## 5. Carried-forward rulings

I concur with every ruling in `47bbd58`. I have no disagreement.

### 5.1 Dialog containment: concur

- **Why the literal reading cannot apply.**
  - The protected coordinator renders the dialog as a sibling of `children` (`departureCoordinator.tsx:288–295`), so it can never lie inside `.settings-detail`.
  - Its rule is `position: fixed; inset: auto 1rem 1rem` (`plugin-web-settings-rest/src/styles.css:227–231`). The Sticky delta does not touch it: the styles change is additions only, starting at L835.
  - §9 forbids host and coordinator edits.
- **The intent is met.** Every action is hit-tested, inside the dialog and the viewport, and at least 44×44.
- **My own look at the EN 375 dialog screenshot.** The title reads "Sticky Note has unsaved changes." (no Smart Lists fallback), all three actions are fully visible, and Stay carries the focus ring.

### 5.2 Terra (a), the lock fixture in `stickyPane.test.tsx`: concur

- **What the diff `2023526..f359be6` contains:**
  - the `beforeEach`/`afterEach` install and removal of `createSmartListsLockManager()`;
  - the `waitFor` import;
  - ST6 and ST8 made `async`, with their unchanged `getPref` expectations wrapped in `await waitFor(...)`.
- **Nothing else changed.**
- **The fixture is pre-existing.** It was last changed in `40ffbe1` and implements real exclusive/shared queueing.

### 5.3 Terra (b), Reload and Discard clearing the same field's input error: concur

- `discard` (`:197–205`) and `reloadSource` (`:209–214`) call `clearInputError(field)`. That removes only `inputErrors[field]` (`:135–139`).
- `discardAll` visits only fields with current drafts (`:206–208`).
- Reload refuses at invocation while the same field holds a draft (`:211`).

### 5.4 Fresh acceptance of the shared coordinator delta `f359be6`: concur

- **The delta is logic-only.** The only lines in `210abdf..f359be6` that match JSX, `className`, `style`, `aria-` or `role=` patterns are three TypeScript generic annotations.
- **The invariant is implemented.** `isLiveBlocked` (`:54–60`) checks blocker identity, the settle-once closures (`:182–188`) re-check at invocation, and the regression test exists.
- **The evidence hashes verify.** f1 and h1 (§4), affected callers 98/98, final regression 24/24.
- **Conditions.** The `47bbd58` §7.4 per-caller conditions stand unchanged.

## 6. Retained non-blocking follow-ups

Carried forward from `47bbd58` §8; its only blocking item, §10.4, is now closed:

1. After keyboard Discard or Discard all, focus falls to `<body>` (visual log L644). This is an a11y follow-up, and the other recovery callers should be checked too.
2. The 46×44 round switch with its knob at the top is pre-existing; it belongs to SET-12/QA visual work.
3. The near-invisible `white` swatch is pre-existing; contrast follow-up.
4. Recovery and pane buttons look like plain text. This follows the global button-reset precedent.
5. The dialog has no backdrop and sits bottom-left over the rail at ≥1024. This is shared host presentation, in the protected coordinator and stylesheet.
6. The affected callers' visual and unlisted modes were not rerun (§7.4 conditions). Any later coordinator DOM/CSS change, or shared Settings style change, requires those reruns.
7. F1 is timing-dependent, but the repair is structural. Keep `verify-f1*.mjs` and `departureCoordinator.blocker.test.tsx` as regression oracles for any react-router upgrade, because the invariant relies on blocker object identity.
8. Retained exclusions:
   - headless Chrome and synthetic accounts;
   - not Tauri;
   - synthetic `beforeunload`;
   - sign-out through the direct preflight;
   - a development build without StrictMode;
   - reused dependency trees;
   - a script-focused select;
   - script clicks in race windows.

   Any Desktop promotion still needs the ADR-0013 D3 gate.
9. `docs/api.md` §4.9 says the guard is registered "while a draft exists". The code registers whenever the host provides the hook and blocks only while drafts exist. Docs-wording nit.

New from the G1 review (non-blocking):

10. `ids.test.ts` AC-IDS-3 checks an inline rebuild of the fallback id format, not the product's fallback path. This is a pre-existing test-strength gap in the widgets package, unchanged since `2023526`.
11. G1 has these limits, none of which §10.4 requires:
    - it ran only the five contract-named files (of 34 widget test files), once per archive;
    - third-party dependencies came from the lockfile-gated installed checkout, not a fresh install;
    - widgets typecheck and lint were not run.
12. The harness smoke run and its negative control are disclosed but not committed. The guard's effect is shown instead by the committed module record: 45 archive modules and 0 unaliased `@repo` imports.

## 7. Scope statement

- **Accepting this caller does NOT close SET-12, REL-05, QA-01/03/04/09, D2/REL/AI or any 312 item, and is not business, deployment or release completion; it changes no formal counts or controller state.**
- This report is the acceptance decision only. Moving CP-STICKY-01 to `accepted` and reconciling the ledgers remain controller steps.
- **What this review did:**
  - It changed no product file, test, runner, oracle, existing evidence, contract, ledger or control-plane file, including `blocked-f359be6.md`. It adds this single file.
  - It ran no tests or runners. It used read-only `git` commands, hash recomputation and log parsing only. Normalized log copies went to the session scratchpad, outside the repository.
- **What it did not do:** no push, merge, rebase, cherry-pick, branch or tag operation, deployment, release or Web→Desktop sync; no network access; no sub-agent spawned.
