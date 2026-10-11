# F-B002 corrected More `boundaries` oracle: evidence receipt (batch 31)

- **Finding:** F-B002, More Sol `boundaries.test.tsx` case 002 (L17–24, "invalid and unavailable sources retain requested reset intents without purging raw bytes"). Frozen in `../web-features-recovery-final/review-final-regressions-5cd63ff.md` §6 and §9; ruled on in `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` (row "冻结发现 F-B002 与总控裁定", More condition C-FB002, `## 本轮唯一任务` batch 31). Module `web`.
- **Verifier:** independent Sol-role verifier, Claude Opus 5.5. Isolated worktree `.claude/worktrees/agent-a198f122236ba0973`, detached at control-plane commit `75207754078be2dbe5152af1be886ede15e227cc`; `git status` was clean before any work. I did not write the frozen oracle, its fixture, the More product, the batch-30 receipt or any earlier evidence.
- **This receipt is evidence only.** It closes no ledger item and makes no acceptance decision for More (CP-MORE-01), Features (CP-FEATURES-01) or any 312 item. It authorizes no deployment, release, branch promotion or Web→Desktop sync.

## Verdict

**PASS (evidence).** The corrected oracle is deterministic at all three fixed SHAs. Case 002 fails at the before SHA on a business assertion. No product failure was observed.

- **Fixed determinism.** At `7b216a3`, `f359be6` and `5cd63ff` the corrected full file passed 10/10 cases in every one of 10 runs per SHA (300/300 case executions). Case 002 alone passed 3/3 per SHA. There were 0 RangeErrors, at 1-minute load averages between 4.50 and 10.52.
- **Before validity.** At `afbfb24` case 002 failed in 10/10 full-file runs and 3/3 isolated runs, always with the business assertion `AssertionError: expected null to be 'invalid-bool' // Object.is equality` at oracle L21:59, and 0 RangeErrors. The other nine cases fail exactly as in the authoritative `boundaries-before4-afbfb24.log`: same error line and same oracle line:column in 10/10 runs.
- **Original oracle (quantified).** The frozen oracle fails case 002 with `RangeError: Maximum call stack size exceeded` in 10/10 runs at `afbfb24`. At `7b216a3` it is nondeterministic: 1 of 10 runs failed, with `remove_date_text: expected 'true' to be null`, the batch-30 F-B002 signature.
- **The corrected oracle passes case 002 at `afbfb24`: NO.** The before failure exists and is a business failure.
- **C-FB002.** Its two stated conditions are met by this evidence (§9). Whether to record it as satisfied is the controller's decision.

## 1. Fixed points and lockfile proof

| Requested | Resolved commit | Tree | `morePane.tsx` blob | Archive `pnpm-lock.yaml` SHA-256 |
| --- | --- | --- | --- | --- |
| `afbfb24` (More before) | `afbfb24d6f7311366b77852eda927d08467478c2` | `bac3ca1660692085de126d4b5c86fd774b15557f` | `48c3dca4…` | `df05f2dd…aeab9` |
| `7b216a3` (More fixed) | `7b216a3d5a4947d0f66da042fb275302737fb762` | `6ed349b8403b74d8c00087ca4e57731077c4a894` | `cfe10f55…` | `df05f2dd…aeab9` |
| `f359be6` | `f359be6d838393e0f9e93efd80b88b5b09f6144e` | `2280bc7617d52dc6c4356da257d57940ecb174ec` | `cfe10f55…` | `df05f2dd…aeab9` |
| `5cd63ff` (Features fixed) | `5cd63ff652f02a2c726187fe12cbc796218d31c0` | `404bf819a42e20b3e4d372c18a981832ccd54954` | `cfe10f55…` | `df05f2dd…aeab9` |

**Lockfile gate.** The dependency root `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/pnpm-lock.yaml` has SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`. All four revisions match, so none was BLOCKED. Every one of the 72 run logs records four equal values: `expected_lockfile_sha256`, `dependency_lockfile_sha256`, `archive_lockfile_sha256` (from `git show <rev>:pnpm-lock.yaml`) and `extracted_lockfile_sha256`. `logs/matrix-v1.log` §2 checks this mechanically (PASS).

**Product identity.**
- `git diff --quiet 7b216a3 5cd63ff` and `7b216a3 f359be6` are empty for `morePane.tsx`, `packages/plugin-web-storage` and `packages/plugin-web-settings-rest/vitest.setup.ts`.
- `git diff --quiet afbfb24 7b216a3` is empty for storage and the setup file.
- `packages/plugin-web-storage/src/internal/accountScope.ts` has SHA-256 `ca9d79b2188e1a2b011a4c41038019659b43e03127bc8bd876cffafe2e489e36` at all four SHAs. L66–71 are `physicalKey()`; L70 reads `localStorage.getItem("<account prefix>deleted")` for account keys.

**Frozen inputs.**
- Oracle `../web-more-recovery-sol/boundaries.test.tsx`: `dcbaf57e55f7e907660abacaf233de83dcf769da97b878a9036e358a3dd8ef3e`.
- Fixture `../web-more-recovery-sol/fixture.tsx`: `b117d2044850cbea822367a0f2bbe9a326e27e4c9b5e5537427b5e0b37b87928`.
- Both are unchanged since their only commit, `8e1233469df7144949e4a541eb4c4a070bef5875`. They are absent from the `afbfb24` and `7b216a3` trees, and identical to HEAD at `f359be6` and `5cd63ff`.
- Every log records `fixture_run_sha256=b117d204…`, the fixture actually beside the oracle in the run. `logs/matrix-v1.log` §2 checks this (PASS).

**Execution rules met by every run.**
- An immutable `git archive <commit>`, extracted into a fresh OS temp directory (realpath) that is removed afterwards.
- `@repo/*` pinned into the archive: 75 exact-match aliases plus a Vite guard plugin. The plugin fails the run on any module from the dependency root's or this checkout's `packages/`, `apps/` or `docs/`, and on any unaliased `@repo` import resolving outside the archive. Every log shows `pin_unaliased_repo_imports=0`, `pin_required_provenance_missing=none` and `tsconfig_extends_checked=46 unresolved=none`.
- `requested_revision` and `resolved_commit` in the header.
- Exit status preserved: Vitest's status, or 2 for a harness failure, or 3 for a lockfile block. The drivers exit with the first nonzero run status (all three exited 1 because of `afbfb24`).
- Nothing was installed, built or written in the dependency root or in this worktree outside `docs/reviews/web-more-recovery-fb002/`. A read-only `find -newermt "2026-10-04 09:40"` after the runs found no changed entry in the dependency root's `node_modules` (depth 2), its `apps/web/node_modules`, `packages/plugin-web-settings-rest`, or any `packages/*/node_modules` (depth 3).
- Every one of the 72 logs also records `aliases=75`, `tsconfig_extends_checked=46 unresolved=none` and the single-instance check (`react=1 react-router=1 @testing-library/react=1`).

**Runtime.** Node v24.16.0, Vitest 3.2.7 (settings-rest binary of the dependency root), Vite 7.3.6, jsdom 26.1.0, darwin-arm64, tz America/Los_Angeles. The evidence runs took place on 2026-10-04 from 16:49:24Z to 16:55:42Z (09:49–09:55 PDT).

## 2. Corrected oracle

`boundaries.corrected.test.tsx` (`2e88c1db3e4045ef44c856b86b23f61322ca5002a45062f80a494cb3ac5e50f8`) is a byte copy of the frozen oracle, edited only on L18–19:
- L18 gains `const unavailableKey = physical(unavailable);` after `const base = Storage.prototype.getItem;`, so it is evaluated before the spy is installed;
- inside the L19 spy, `physical(unavailable)` becomes `unavailableKey`.

Line count, every other byte and the `./fixture` import are unchanged. Its hash equals the batch-30 D8 candidate recorded in `../web-features-recovery-final/diagnostics/diagnostic-runs.log` (`2e88c1db…`, produced there by `make-corrected-boundaries.mjs`); I produced it independently by copy and a single edit.

The verbatim unified diff is `boundaries.corrected.diff` (`db6711fe…`). Command: `diff -u --label a/docs/reviews/web-more-recovery-sol/boundaries.test.tsx --label b/docs/reviews/web-more-recovery-fb002/boundaries.corrected.test.tsx <frozen> <corrected>` (exit 1, meaning differences found):

```diff
@@ -15,8 +15,8 @@
 });
 
 it("invalid and unavailable sources retain requested reset intents without purging raw bytes", async () => {
-  const invalid = deviceCases[1]!, unavailable = accountCases[0]!; nativeSet.call(localStorage, physical(invalid), "invalid-bool"); const base = Storage.prototype.getItem;
-  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(unavailable)) throw new Error("unavailable"); return base.call(this, key); }); const ui = mount(); await flush(); reset(ui); await flush(30);
+  const invalid = deviceCases[1]!, unavailable = accountCases[0]!; nativeSet.call(localStorage, physical(invalid), "invalid-bool"); const base = Storage.prototype.getItem; const unavailableKey = physical(unavailable);
+  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (String(key) === unavailableKey) throw new Error("unavailable"); return base.call(this, key); }); const ui = mount(); await flush(); reset(ui); await flush(30);
```

`git diff --no-index --word-diff=plain` shows exactly two token edits: `{+const unavailableKey = physical(unavailable);+}` and `[-physical(unavailable))-]{+unavailableKey)+}`.

**Why the value is the same.** At L18 the scope is the `setup()` account (`more-sol-A`, generation `g1`) and no `<prefix>deleted` marker exists, so `physical(unavailable)` returns `xai:account:v1:more-sol-A:g1:xai_pref_more_default_tag`. Nothing in case 002 changes the scope or the marker afterwards, so the frozen spy compares against the same key whenever its own recursion does not overflow.

**Staging.** The corrected oracle imports `./fixture`. The runner stages it at its own path in the temporary archive, with a byte copy of the frozen fixture beside it (`docs/reviews/web-more-recovery-fb002/fixture.tsx`, temp run directory only). The import path is not edited, and no fixture copy is committed. In place in the repository the file is therefore not runnable without that staging.

## 3. Runner and tools (new files; existing runners not modified)

**`verify-fb002.mjs`** (`d2150cd4794f7a51a5b72d9a7260dd8b7996a5c35adaa655da85719bfaf936a4`): one invocation is one Vitest run and one log, `logs/<oracle>-<scope>-<suffix>-<rev>.log`, created exclusively.
- **Conventions.** It follows `../web-features-recovery-final/verify-callers.mjs` mode `more-boundaries` (`7e1aa8b2…`, read, not run, not modified):
  - root = archive, globals, jsdom;
  - setupFiles `packages/plugin-web-settings-rest/vitest.setup.ts`;
  - esbuild jsx automatic, default timeouts, no console filter;
  - private `node_modules` (third-party links from the dependency root, `@repo` links into the archive);
  - single react / react-dom / @testing-library/react / react-router instances, the same guard plugin, and verbose + JSON reporters.
- **Staging.** It stages the six frozen More Sol files exactly as the older runners did.
- **Additions:**
  - the oracle choice (`original` runs the frozen file at its own path; `corrected` as in §2);
  - scope `case002`, which adds `--testNamePattern "invalid and unavailable sources retain requested reset intents without purging raw bytes$"`;
  - hash checks of the frozen oracle, frozen fixture and corrected oracle before any run;
  - `fixture_run_sha256` and `oracle_run_sha256`;
  - per-case failure line and oracle frame (`at: L:C`);
  - RangeError counts (`rangeerror cases=<cases whose failure message contains RangeError or "Maximum call stack size exceeded"> output_lines=<such lines in stdout+stderr>`);
  - `loadavg_at_start`.
- **Harness checks:** 19 for `corrected`, 17 for `original`; PASS in all 72 logs.

**Other tools.**
- **`run-matrix.mjs`** (`5768e8ce…`) runs one matrix group serially, repetition-major (round-robin over SHAs). It appends a line per run, including the log's SHA-256, to `logs/driver-<group>-v1.log`. All 72 recorded hashes equal the committed logs.
- **`summarize-fb002.mjs`** (`030a3803…`) writes `logs/matrix-v1.log`: the inventory, 9 invariant checks (all PASS), the cells, and the case-by-case before4 comparison.
- **`impact-scan.mjs`** (`e76a076b…`) writes `logs/impact-scan-v1.log` (§8).

**Freeze.** The runner and driver hashes above were recorded before the first evidence run, and all 72 evidence logs carry `runner_sha256=d2150cd4…`. Development runs are in §10.

## 4. Reproduction

From the worktree root, with `D=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop` (read-only dependency root):

```sh
XAI_DEPS_ROOT=$D node docs/reviews/web-more-recovery-fb002/run-matrix.mjs corrected-full v1      # 40 runs; driver exit 1 (afbfb24 fails, as expected)
XAI_DEPS_ROOT=$D node docs/reviews/web-more-recovery-fb002/run-matrix.mjs corrected-case002 v1   # 12 runs; driver exit 1
XAI_DEPS_ROOT=$D node docs/reviews/web-more-recovery-fb002/run-matrix.mjs original-full v1       # 20 runs; driver exit 1
node docs/reviews/web-more-recovery-fb002/summarize-fb002.mjs v1                                  # exit 0; logs/matrix-v1.log
node docs/reviews/web-more-recovery-fb002/impact-scan.mjs 75207754078be2dbe5152af1be886ede15e227cc docs/reviews/web-more-recovery-fb002/logs/impact-scan-v1.log
# one run:
XAI_DEPS_ROOT=$D node docs/reviews/web-more-recovery-fb002/verify-fb002.mjs <rev> <corrected|original> <full|case002> <suffix>
```

Each command ran once, in the order above. The drivers and summarizer refuse to overwrite, so a reproduction uses a new iteration (`v2`). **Diagnostic iterations used: 1 of 3 in every cell.** No log is superseded.

## 5. Matrix (per run: per-case results in `logs/matrix-v1.log` §3, `per_run` strings; failure lines in each run log)

| Oracle | Scope | SHA | Runs | Runs exit 0 (all executed cases passed) | Case 002 passed | Per-case passes across runs | RangeError: cases / output lines / runs with any |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| corrected | full | `afbfb24` | 10 | 0 | 0/10 | every case 0/10 | 0 / 0 / 0 |
| corrected | full | `7b216a3` | 10 | **10** | 10/10 | every case 10/10 | 0 / 0 / 0 |
| corrected | full | `f359be6` | 10 | **10** | 10/10 | every case 10/10 | 0 / 0 / 0 |
| corrected | full | `5cd63ff` | 10 | **10** | 10/10 | every case 10/10 | 0 / 0 / 0 |
| original | full | `afbfb24` | 10 | 0 | 0/10 | every case 0/10 | 10 / 20 / 10 |
| original | full | `7b216a3` | 10 | 9 | 9/10 | c002 9/10, others 10/10 | 0 / 0 / 0 |
| corrected | case002 | `afbfb24` | 3 | 0 | 0/3 | (9 skipped per run) | 0 / 0 / 0 |
| corrected | case002 | `7b216a3` | 3 | 3 | 3/3 | (9 skipped per run) | 0 / 0 / 0 |
| corrected | case002 | `f359be6` | 3 | 3 | 3/3 | (9 skipped per run) | 0 / 0 / 0 |
| corrected | case002 | `5cd63ff` | 3 | 3 | 3/3 | (9 skipped per run) | 0 / 0 / 0 |
| original | full | `f359be6` | cited | — | 2/10 | — | batch 30 D1: 8/10 runs failing |
| original | full | `5cd63ff` | cited | — | 3/10 | — | batch 30 D1: 7/10 runs failing |

**The cited rows.** They come from `../web-features-recovery-final/diagnostics/diagnostic-runs.log` D1: the unmodified `verify-callers.mjs`, `DEBUG_PRINT_LIMIT=300000`, 10 repetitions per SHA. Every failing run there was `date_recognition: expected 'false' to be null`. They were not rerun here.

**The one failing original run at `7b216a3`.**
- **Log:** `logs/original-full-v1r06-7b216a3.log` (`aae2461d…`).
- **Assertion:** `AssertionError: remove_date_text: expected 'true' to be null` at L20:167, the `waitFor` loop.
- **Output:** no RangeError text anywhere in stdout or stderr. The DOM printed with the failure is truncated at Testing Library's default print limit.
- **Interpretation:** this matches batch 30's D7 mechanism, in which a field's mount-time read receives the overflow, the product marks it unavailable and refuses its reset. I did not re-probe it.
- **Load:** the 20 original-oracle runs ran at 1-minute loads of 3.5–4.7; batch 30 D1 noted ≈6. The rate is a characterization under these conditions, not a guarantee.

**The original oracle at `afbfb24`: direct evidence of the recursion.** Every case-002 failure in these runs prints the cycle:
- `Proxy.<anonymous> boundaries.test.tsx:19:113`, which is `physical(unavailable)` inside the spy;
- then `physical fixture.tsx:39:112`;
- then `Object.physicalKey accountScope.ts:70:63`, which is `localStorage.getItem(<prefix>deleted)`;
- then back into the same spy.

## 6. Before validity at `afbfb24`

**Case 002 under the corrected oracle: a business assertion.**
- **The failure.** It is `expect(nativeGet.call(localStorage, physical(invalid))).toBe("invalid-bool")` at L21:59 (`Expected: "invalid-bool"`, `Received: null`), in 13/13 runs (10 full-file, 3 alone), with 0 RangeErrors.
- **What it means.** The L20 `waitFor` passed first: all 13 other fields were removed. The before product then purged the invalid raw bytes stored for `launch_at_login` (`deviceCases[1]`). That is the "without purging raw bytes" requirement the case encodes.
- **Source.**
  - `afbfb24:packages/plugin-web-settings-rest/src/panes/morePane.tsx` L34–50 lists the 15 keys in `MORE_OWNED_KEYS`, and L52–56 `resetMorePrefs()` calls `removePref(key, scope)` for each of them.
  - L189–191: `handleReset()` runs it in a single try/catch.
- **What was not evaluated.** The rest of L21–22 (unavailable bytes kept, control values, guard, draft export) never ran, because the first assertion fails.
- **Earlier logs.** This is the same assertion recorded by the superseded `boundaries-before3-afbfb24.log` (L20:59) and `boundaries-before2-afbfb24.log` (L19:59).

**All 10 cases against the authoritative `boundaries-before4-afbfb24.log`** (`fafc1182…`). Error line and oracle line:column are taken from each failure block, and every corrected and original row below held in all 10 runs:

| Case | before4 (authoritative) | Corrected oracle, 10/10 runs | Original oracle rerun, 10/10 runs | Match vs before4 |
| --- | --- | --- | --- | --- |
| 001 missing/rejected Web Locks | `expected 'window' to be 'tray'` @L11:145 | same @L11:145 | same @L11:145 | MATCH (both) |
| 002 invalid/unavailable sources | `RangeError: Maximum call stack size exceeded` @L19:180 (`base.call(this, key)` inside the spy) | `expected null to be 'invalid-bool'` @L21:59 | `RangeError: Maximum call stack size exceeded` @L19:113 (`physical(unavailable)` inside the spy) | **DIFF (corrected): business assertion instead of the oracle artifact.** Original: same error; the deepest oracle frame differs but lies in the same recursive spy |
| 003 missing committed marker | `expected null to be 'study'` @L31:114 | same | same | MATCH |
| 004 deleted tombstone | `Error: No More Blob` @L32:70 | same | same | MATCH |
| 005 held account lifecycle lock | `expected null to be 'study'` @L41:213 | same | same | MATCH |
| 006 exact registry default vs remove | `expected undefined to be false` @L46:230 | same | same | MATCH |
| 007 same-field source Reload | `expected 'tray' to be 'window'` @L51:272 | same | same | MATCH |
| 008 targeted discard | `TestingLibraryElementError: Unable to find … "Discard Choose window type when launching"` @L57:178 | same | same | MATCH |
| 009 external conflict + quota | `Error: No More Blob` @L64:240 | same | same | MATCH |
| 010 all-discard + new work | `expected undefined to be false` @L69:304 | same | same | MATCH |

**Did the oracle differ between before2, before3 and before4?**
- **In git, no.** `git log -- docs/reviews/web-more-recovery-sol/boundaries.test.tsx fixture.tsx` lists one commit, `8e12334` (2026-09-11), so the committed file never changed.
- **The runs used working-tree drafts.** The before2/3/4 runs predate that commit. The More Sol `verify-fixed.mjs` copies the checkout's current oracle into the archive and records no oracle hash, so the drafts cannot be reconstructed byte for byte. The logs do show:
  - **before4 ran the frozen text.** All ten failure frames land on the frozen file's statements at the same line:column: the nine non-002 `toBe` / `read` / `getByRole` positions, and L19:180 = `base.call(this, key)` in the frozen spy.
  - **before3 ran an earlier 10-case draft.** From case 002 on, every frame sits exactly one line above the frozen equivalent at the same column (002 L20:59 vs L21:59; 003–008 likewise; 009/010 L61:108 and L68:79 vs the frozen `await hold(…)` at L62:108 and L69:79). Cases 009 and 010 failed with `ReferenceError: hold is not defined`, a missing import that the frozen file has. So one line was added between L12 and L20 after before3. Which line is inferred, not proven.
  - **before2 ran a 7-case draft.** Case 001 is at L10:145 and case 002 at L19:59.
- **Conclusion.** The RangeError appears only in before4, the first run of the final text. The earlier business failure (`expected null to be 'invalid-bool'`) is reproduced by the corrected final text in 13/13 runs.

## 7. Fixed determinism

- **Full file.** At each of `7b216a3`, `f359be6` and `5cd63ff`, the corrected file gave 10/10 in every run: 30 runs, 300 case executions, 0 failures, 0 RangeErrors. The `per_run` strings in `logs/matrix-v1.log` §3 are `PPPPPPPPPP` ×10 per SHA.
- **Case 002 alone.** 3/3 per SHA.
- **Load.** These runs included the highest loads of the session (1-minute load up to 10.52 at `corrected-full-v1r09-5cd63ff`), and nothing changed. The stop condition "corrected oracle fails at a fixed SHA" was not met.

## 8. Impact scan (report only; nothing fixed)

**Method.** `impact-scan.mjs` reads, at the base commit `7520775`, all 511 `.ts/.tsx/.js/.mjs/.cjs/.jsx` files under `docs/reviews/`, plus the corrected oracle.
- **What counts as a hit:** every `spyOn(<Storage target>, "getItem"|"setItem"|"removeItem")`, every assignment `<Storage target>.<method> = …`, and every `defineProperty` or `stubGlobal('localStorage')`.
- **Hits:** 579 in 177 files: 126 `getItem`, 382 `setItem`, 70 `removeItem`, 1 `localStorage` stub. By kind: 135 pass-through observers, 65 restores of captured originals, 8 named replacement functions (resolved), and 371 implementations.
- **How bodies are traced:**
  - live API calls;
  - captured-original pass-through, which cannot re-enter a prototype spy;
  - helper calls, resolved through local definitions, relative imports and `export * from` up to three levels, recording any `physicalKey(`, `createScopedStorage(`, scoped-storage call or live Storage call.
- **Treated as opaque:** product-module imports, except five string builders I verified as pure (`accountPrefix`, `generationMarkerKey`, `generationKey`, `prefMutationLockName`, `accountLifecycleLockName`).
- **Aliases:**
  - the corrected oracle's run-time `./fixture` maps to the frozen More Sol fixture;
  - the batch-30 diagnostics' `./fixture` maps to the same file. This is inferred: their import lists name only More Sol fixture exports.
- **Automatic risk:** 6 `self`, 33 `cross`, 540 `none`. The only unresolved callee is `physical` inside the batch-30 generator string. The classification below is manual, from reading each body and its arguments' key ownership (`accountOwnership.ts` at the base commit).

| Class | Meaning | File:line (spied method) |
| --- | --- | --- |
| **S — unbounded self re-entry (F-B002 class)** | The `getItem` spy body calls `physical()` with an account key. `physicalKey()` then reads `<prefix>deleted` through `localStorage.getItem`, which is the same spy. | `web-more-recovery-sol/boundaries.test.tsx:19` (getItem; `accountCases[0]` = `default_tag`). This is the frozen case 002, observed in §5. `web-features-recovery-final/diagnostics/diag-case002.test.tsx:30` (getItem) is the batch-30 diagnostic copy of case 002. `web-features-recovery-final/diagnostics/diag-probe.test.tsx:15` (getItem) is the batch-30 probe that measures this recursion by design. Both are diagnostics, not gate evidence |
| **T — text only** | A string literal in a code generator, not executed as written | `web-features-recovery-final/diagnostics/make-corrected-boundaries.mjs:8` (the `before` text it replaces) |
| **D — `physicalKey()` with device keys only** | `physicalKey()` returns at the ownership check (accountScope.ts:67) before any Storage read, so there is no re-entry. It is latent: the body would re-enter if its entry were account-owned | More Sol `queues.test.tsx:70` (getItem, `deviceCases[2]`), `:78` (getItem, `deviceCases[3]`), and the setItem/removeItem spies `queues.test.tsx:24`, `:25`, `:34`, `:69`, `:77`, `:85`, `boundaries.test.tsx:50`, `owner-export.test.tsx:19`, `:68`, plus `web-more-recovery-fb002/boundaries.corrected.test.tsx:50` (unchanged copy of frozen L50) |
| **A — `physicalKey()` with account keys inside a setItem/removeItem spy** | One `getItem` of `<prefix>deleted` per spied call, through the `getItem` in place at that moment. No `getItem` spy that itself re-enters coexists in any of these tests: it is native, or a pass-through observer. Bounded, not self-recursive | More Sol `boundaries.test.tsx:56` (`accountCases[1]`, evaluated only when the first comparison fails), `:63` (`accountCases[0]`); `fields.test.tsx:47` (describe.each over all 15, so the two account entries); `owner-export.test.tsx:18` (`accountCases[0]`), `:38` (`accountCases[1]`, see note 1); `queues.test.tsx:41`, `:48`, `:55`, `:56` (`accountCases[0]`); corrected `:56`, `:63` (unchanged copies). `web-board-detail-astra-final/detail-contract.test.tsx:15`, `:54` (`key()` → `xai_boards_v2`). `web-board-workspace-astra-review/independent.test.tsx:12` (`wk()` → `xai_board_workspaces`), `startup-and-queue.test.tsx:19` (`boardKey()` → `xai_boards_v2`). `web-board-workspace-save-fix/save-contract.test.tsx:31`, `:53`, `:61` (`workspaceKey()` → `xai_board_workspaces`), `:43` (`activeKey()` → `xai_active_board`). Browser harnesses with no getItem override: `web-meditation-durable/native-meditation.tsx:47` and `web-meditation-independent/native.tsx:49` (`physical()` → `xai_meditation_active`); `web-pomodoro-durable-session/crash-native.ts:23`, `:24` (`key(HISTORY_KEY)` / `key(ACTIVE_KEY)`, evaluated only when the matching fault is armed) |
| **N — no Storage reach beyond captured originals** | Observers (135), restores (65), and 340 bodies that compare against precomputed values or pure builders, log attempts, consult fault tables, or use Map-backed fakes | The remaining 540 rows, listed in `logs/impact-scan-v1.log` under `## risk=none`. Hand-checked examples: D2 engine `web-d2-async-pref-astra-engine/engine.test.ts:87`, `:131`, `:137`, `repair-boundaries.test.ts:39`, `:47`, `retry-token.test.ts:17`, `:65`, and `web-board-workspace-astra-review/d2-foundation-independent.test.ts:17` (local `physical()` = `generationKey(...)`, pure); Pomodoro `web-pomodoro-departure-astra/draft-attribution.test.tsx:51`, `:66`, `:67` (`key()` = `'xai_pref_pomodoro_' + name`, re-exported); Features and Sticky Sol interceptors (`web-features-recovery-sol/fixture.tsx:204–206`, `web-sticky-recovery-sol/fixture.tsx:181–183`), whose fault keys in all their oracles are precomputed strings (no predicate is used); `web-task-link-independent/native.tsx:26` (calls `accountScope.lock`/`activate` once; neither touches Storage, see note 2); `web-account-data-isolation/rel03-reproduction.test.ts:13` (`stubGlobal('localStorage')`, Map-backed fake); the corrected oracle's L19 (compares only against `unavailableKey`) |

**Notes.**
1. `owner-export.test.tsx:38` installs its `setItem` spy with `physical(entry, scopeA)`, and the spy stays installed after `activate("more-sol-B", "gB")` until `afterEach`. From then on, `physicalKey()` throws `AccountScopeError` at `assertCurrent` (accountScope.ts:68) before any read. So every later `setItem` through the prototype throws inside the spy. This is not re-entry. It means the spy refuses all writes after the account switch. I did not analyse whether the product attempts any such write in that case.
2. `accountScope.lock`/`activate` notify subscribers synchronously. What subscribers read is outside the spy body and was not traced.

**Conclusion.** Only More Sol case 002, and the batch-30 diagnostics copied from it, can re-enter a spy without bound. All other re-entry is bounded (class A) or absent.

## 9. More-acceptance impact statement (facts and a recommendation; no decision)

**What the accepted evidence cites.**
- **Authoritative baseline** (`../web-more-recovery-sol/README.md`): `boundaries-before4-afbfb24.log` 0/10. The Sol total before is 5 passed / 74 failed of 79. Fixed: `boundaries-final1-7b216a3.log` 10/10, Sol 79/79.
- **The More Sol review** (`../web-more-recovery-sol/review-7b216a3.md`) tabulates Boundaries as 0 pass / 10 fail → 10 pass.
- **The More acceptance** (`../web-more-recovery-acceptance/acceptance-7b216a3.md`, commit `27adb10`) cites, in its "Mixed set/reset attribution" gate, "Before: Sol queues 0/14, boundaries 0/10. Fixed: 14/14 and 10/10".

**Under the corrected oracle the counts are unchanged.**
- **`afbfb24`:** `boundaries` is 0/10, so the Sol before total stays 5/74.
- **`7b216a3`:** `boundaries` is 10/10 in 10 of 10 runs, so the Sol fixed total stays 79/79.
- **What changes is the reason case 002 fails before.** It was `RangeError: Maximum call stack size exceeded`, an oracle artifact, in before4 and in 10/10 reruns of the original. It is now `expected null to be 'invalid-bool'`, a business assertion, in 13/13 runs. The other nine before failures are unchanged.

**Case 002's before→fixed transition under the corrected oracle:**
- `afbfb24` FAIL: 13/13 runs, business assertion at L21:59, the invalid raw bytes purged by Reset Default.
- `7b216a3` PASS: 13/13 runs, stable.
- `f359be6` and `5cd63ff` PASS as well: 13/13 each.

**C-FB002.** The control plane conditions keeping More `accepted` on "批次 31 的纠正 oracle 须在 `afbfb24` 上让 case 002 以业务断言失败，并在 `7b216a3` 上稳定 PASS". Both conditions are met by the logs above.

**The frozen oracle remains nondeterministic at fixed SHAs:** 1/10 failing runs here at `7b216a3`; 8/10 and 7/10 in batch 30 at `f359be6` and `5cd63ff`. Any future regression gate that runs it can fail spuriously, as batch-30 E24 did.

**Recommendation (for the controller; not a decision).**
- Record C-FB002 as satisfied, citing this receipt, `logs/matrix-v1.log` (`5924c286…`) and the case-002 logs.
- In any ledger reconciliation, cite the corrected-oracle `afbfb24` logs as the business evidence of case 002's before failure, alongside the authoritative before4.
- Run the corrected oracle, added beside the frozen original and not replacing it, in future More `boundaries` regressions, including the batch-32 review of the E24 More row.
- Whether the authoritative More evidence set should formally adopt the corrected oracle is the controller's or acceptance reviewer's call.

## 10. Development runs (disclosed; not evidence)

All of these wrote only to the session scratchpad (`…/scratchpad/fb002/`). None are committed.

**Smoke runs of the runner** (`XAI_FB002_OUTPUT_DIR`, header marked "redirected; not evidence"), before the evidence runs:

| Log | Runner | Outcome | SHA-256 |
| --- | --- | --- | --- |
| `corrected-full-smoke1-7b216a3.log` | pre-freeze `8b1c4028…` | exit 0, 10/10 | `c3b7486b…9802` |
| `corrected-case002-smoke1-afbfb24.log` | pre-freeze `8b1c4028…` | exit 1, case 002 `expected null to be 'invalid-bool'` | `502bbe41…57a8` |
| `original-full-smoke1-afbfb24.log` | pre-freeze `8b1c4028…` | exit 1, 0/10, case 002 RangeError. This run exposed a parser bug: the "Failed Tests" section is on stderr, so `at:` was empty. Fixed before the freeze | `386d7480…3769` |
| `original-full-smoke2-afbfb24.log` | frozen `d2150cd4…` | exit 1, 0/10, case 002 RangeError, `at:` populated | `c1e22bb9…3229` |

**Scanner development runs** `scan-dev1`–`scan-dev5`:
- `6cad3135…`, `5c2e9e6b…`, `c155fd36…` and `5e08388e…` were produced by earlier scanner revisions while I fixed right-hand-side extraction, restore detection, run-time fixture aliases and re-export resolution;
- `scan-dev5` (`9a0a6c04…`) is byte-identical to the committed `logs/impact-scan-v1.log`.

**Summarizer dry run** `matrix-dryrun1.log` (`5924c286…`) is byte-identical to the committed `logs/matrix-v1.log`.

## 11. New files (additions only, all under `docs/reviews/web-more-recovery-fb002/`) and SHA-256

There are 84 new files: this receipt plus the 83 listed below. The receipt's own hash is reported in the hand-back, since a file cannot contain its own hash.

```text
db6711fe7c3383655d276f3c6c38ab6925cfa2ec0cb7a6f94e4ec3b14260f49e  boundaries.corrected.diff
2e88c1db3e4045ef44c856b86b23f61322ca5002a45062f80a494cb3ac5e50f8  boundaries.corrected.test.tsx
e76a076be614f6756ae13aefad1dcbae70788326d11ebf97f34f50ed694c096e  impact-scan.mjs
5768e8ce57da30d65e2d884db9a010301fc4465fe4ef1232d12a414475f8885b  run-matrix.mjs
030a3803369e6df0b533094567fa0199b7cc081d2bfd7e1be01287b83a9e1063  summarize-fb002.mjs
d2150cd4794f7a51a5b72d9a7260dd8b7996a5c35adaa655da85719bfaf936a4  verify-fb002.mjs
baa51ba8052bff6ea7fea91fe9049988c213a80d35a8702f7bc1479c377dbb60  logs/driver-corrected-case002-v1.log
fcae835b73a50228e4ef13e4dd1e8009f0e127bdc2b8f5f8193a0e791b49fe91  logs/driver-corrected-full-v1.log
b10135ffc420d7417d7fcacdf702bddd03b1bb9271b33c10aee74fa46e0668ba  logs/driver-original-full-v1.log
9a0a6c0486c015809c855deadb40766ef8dd7812c9013a1e3c6a9f0afdaaf06a  logs/impact-scan-v1.log
5924c286ddea0d3781763e41a03a4d10d3667dc35b913938557ddfc589ffd7ad  logs/matrix-v1.log
95007c050dbcb5def5fe14866fa724d3825b272a5680522b5a6a611dc1dc0fd5  logs/corrected-case002-v1r01-5cd63ff.log
8c48c2c532d914a6f05d25b61afb56d1b551cb858a3972a14980118f6bd8feca  logs/corrected-case002-v1r01-7b216a3.log
9796450cbc5649bb2fdf438f117e926fa30c6e017c5ae953e479059dacbe6718  logs/corrected-case002-v1r01-afbfb24.log
b84ca4c680dd56f81a2aae9e981e4477e7669862b3215b5a9af22edea700ea4c  logs/corrected-case002-v1r01-f359be6.log
71a4f5ddbc5a5a9edd4f2f533748360bb62f3d6f45f26e740bc8e5afa731c54e  logs/corrected-case002-v1r02-5cd63ff.log
b485761d98c41209f9776fb726ec2d1ac808890b0256f99a9e7af309ea340a75  logs/corrected-case002-v1r02-7b216a3.log
46bb8e5fb55989046c69ee7ffb0fe4b776ffefd43fbf1a8fef5c8a1c1112e895  logs/corrected-case002-v1r02-afbfb24.log
8630070aa2475df900d5f2925d96d3017b37bf612acfe8d906e6cf8efe9ef73c  logs/corrected-case002-v1r02-f359be6.log
70934bd50932258b3705095245262921ad574b7f872000a663323bee4168df49  logs/corrected-case002-v1r03-5cd63ff.log
734af6c08194b2cab7aab3714fe8306ec220812b10bb9929da73a70624c41e7b  logs/corrected-case002-v1r03-7b216a3.log
ddd59ed2e13abd561b21e00c10a97a83ad920f9ac3a39b4c609d7c73094b5156  logs/corrected-case002-v1r03-afbfb24.log
462a2b2e0edea9f05447f4de243df357eb2d6dba3de44312df61210258c787e0  logs/corrected-case002-v1r03-f359be6.log
859cbf7e44c9bf14ca07b2c7131608c40c549306a549192598fc16f05cc56b7d  logs/corrected-full-v1r01-5cd63ff.log
af8c2c8dccada7f79e5e55503594220d5196553b8c524146312807fb0b714d2c  logs/corrected-full-v1r01-7b216a3.log
21781bb0afd8f5d9b0b974df9c099f89916103ae57f7f41d95c2db1fcedc14f4  logs/corrected-full-v1r01-afbfb24.log
9cbc95b8e271f648796f18a2177273061118e15e6dc6bc8f9aa010930c8a8dd3  logs/corrected-full-v1r01-f359be6.log
b54861a90d8ffdba0812cb93bec05932797a5b91abd12a4f542f713008d6b21c  logs/corrected-full-v1r02-5cd63ff.log
ac633d3e30e6b402f01d48427f5fe973db55d1dde58fe4c413aa79fb876c75e5  logs/corrected-full-v1r02-7b216a3.log
2cebf26bea1d4594bb34d11f5f698ec12d3e3817f3da4fcfdf32fc2d5a8e3272  logs/corrected-full-v1r02-afbfb24.log
adbba80f610f497aa23a3a84b0a1fc65ee05c9aae8de8a144d614508421d4f7f  logs/corrected-full-v1r02-f359be6.log
7b56c9e9226122b6e1876de022cb3e54609d3206743d9bcc4cf8fa1981f48955  logs/corrected-full-v1r03-5cd63ff.log
5823b2951eaf6b866bdf56f2376464d459cdc8d9c47b8ffb976053d537518481  logs/corrected-full-v1r03-7b216a3.log
8a01e176be977b12e93240560eba202718191c291b56eda658f3330f0c6aeac2  logs/corrected-full-v1r03-afbfb24.log
d95af49aacfc79daaa722d56d3e264c22cb4ff619a147eec58206d275ab87193  logs/corrected-full-v1r03-f359be6.log
f711165b1579616b0b5f81572218425573b2d9d83c590f677cae91c41912593b  logs/corrected-full-v1r04-5cd63ff.log
b4fd9befd8cd40a5c72b9f238787fa5fc40acebcda71136fd456aa0cc0375cb2  logs/corrected-full-v1r04-7b216a3.log
24d01a1e48b4a996d6960d807e49f92f7f01e83e027b543fdf9212a3f7d002c5  logs/corrected-full-v1r04-afbfb24.log
c4914165806d94fec75cc9b2e905d445474c3a626a9dc9cbb9e3f9dd72a4160e  logs/corrected-full-v1r04-f359be6.log
f327392fa02d4a340135c35b59dd9c79ce012859af754d625246817640ce2e26  logs/corrected-full-v1r05-5cd63ff.log
247ee3a3ca7ffd23280f42f0cf3a91692655e1e681f7d2cd5505d3f09f52d8ba  logs/corrected-full-v1r05-7b216a3.log
af3ee0368a6a3cb95dd56b3135c8058f30fa0d221525a083197056a9e2ed2288  logs/corrected-full-v1r05-afbfb24.log
6de83bea8a74f91417d73dab6ea55e4ac95d8f53e6b0f00bdf674b21f33a5b05  logs/corrected-full-v1r05-f359be6.log
3f556ccce1699ee754e4e962f7d439c773184c870e2eb42cf911df3c1912b683  logs/corrected-full-v1r06-5cd63ff.log
cda09322859834fd3925e4596d064bc88324c9ffcca7358824dee144504f87b6  logs/corrected-full-v1r06-7b216a3.log
ce94533265f63859501838df27450447c4ea9040f9a63e156520851fc9162c15  logs/corrected-full-v1r06-afbfb24.log
4f52556ccdce13c802302044143ef84ceecf5f5cf40d05d9509a542fcff7ea07  logs/corrected-full-v1r06-f359be6.log
a68bf058fd46320e55b481b4a9caa890a32553b8da58cfa085f2e78e976314c2  logs/corrected-full-v1r07-5cd63ff.log
7d4528bc5dfe34dca03c2be39e6428924c0562702dae22a9cb1c946c9e4d37b1  logs/corrected-full-v1r07-7b216a3.log
e5460925fffe8e9904e94f87368039838d725fefc441f60e6b82efae8b4e6a21  logs/corrected-full-v1r07-afbfb24.log
1cb2de0ae7eea5f33a6b330de2595607db8c088278c846bb930d419c757ac96c  logs/corrected-full-v1r07-f359be6.log
83eb57c2e282f1b96d57c58612ca3314cec5e0b3e0a59e6cc8e0910e03e7e418  logs/corrected-full-v1r08-5cd63ff.log
72668df50001b48227322852babd0b585603806c104ce7b434c0b97247967a46  logs/corrected-full-v1r08-7b216a3.log
6dcb87b543358786a9831a8cd5959fec4dea082a65d2b4e1ab976dd7edd66bab  logs/corrected-full-v1r08-afbfb24.log
00053e26b92764844ffb54b377d8ee21e5013adf7272625f67f3f3365ba22003  logs/corrected-full-v1r08-f359be6.log
290406e85f66d66fde75a4cb66d4ba4c71117311f1706750e857f74c35904322  logs/corrected-full-v1r09-5cd63ff.log
1791bf06a1bd3bb34332647b72e4ec1c43f6595fa1b627010b8c5ac7628b9e05  logs/corrected-full-v1r09-7b216a3.log
cb61354478e922c3c420dbe6d6aacbd5b8d9c995c0cf49b4214e8ec7ed4e3300  logs/corrected-full-v1r09-afbfb24.log
fb3228d19a249c507211ae21f9b733d2538bdb3c9d280d0765a89561f0b32852  logs/corrected-full-v1r09-f359be6.log
7eb5eba3e3484cf34ea0137b4e0a5d427f8e06ae09e208cfebef811a0cc546f3  logs/corrected-full-v1r10-5cd63ff.log
a346b5c6af854867fd5d4743c207a8ff181d401b9a909b3642b49acd5157b852  logs/corrected-full-v1r10-7b216a3.log
a3d69ae4d44a2df6054be24c78c62f5fce34c6ed12db4f3528e47fca3d3a1e16  logs/corrected-full-v1r10-afbfb24.log
e8a6880140d85f75062bdd922a3e1a61c9763f0319172fa05cd76288cfd1220d  logs/corrected-full-v1r10-f359be6.log
742afeb10c3517e55feffed4eef3f5ebf47f413859660c9cb4887c0e9b1b75e2  logs/original-full-v1r01-7b216a3.log
5d279fced85ae8b2a946a5d3d275ef9bdf12ece71f9f52315dbcb89138b29660  logs/original-full-v1r01-afbfb24.log
58cbd8121cc9fee6dbaf6a3c5c08e327d655c453128f9a888561e4de21fc1b9c  logs/original-full-v1r02-7b216a3.log
e1be9e45cd06524076fa231ed6ef3683cccecb97a616543368eab85223641d09  logs/original-full-v1r02-afbfb24.log
f865cc74aae440c824ee8f1a9eaafd170464eedd67a4db2d1891a23db2d574cc  logs/original-full-v1r03-7b216a3.log
a568b254621f7d8701bab912277ad1ed93d4a37e41fb7c08c21ac0bf048fc442  logs/original-full-v1r03-afbfb24.log
07860245a405f65903abeca515e123da05bc7d4626e350aaedd3249151f6c4a2  logs/original-full-v1r04-7b216a3.log
a4a3351bef0f09f2252a31e814453dde6de2a8bd37473e8988a92d490dd617f1  logs/original-full-v1r04-afbfb24.log
51a2b2e3c836dec9130da184b2ff4af44d1559c7ca76642ea74c78fa76187822  logs/original-full-v1r05-7b216a3.log
050bef8a634ffd0b935fc84758750634fcaa6e56114bcc6519c021df7961b2b6  logs/original-full-v1r05-afbfb24.log
aae2461d26a5b39a0ddeca2ca1b5d0bc63e84ea9bf107a9af85f05cd787a5d7f  logs/original-full-v1r06-7b216a3.log
a1e97fb60a64a83a280ecc28653528996b20af938455d2a47f95b62e9063c769  logs/original-full-v1r06-afbfb24.log
a1b8e0db8aaab0af131e533e972e7fdc17c67d6f1bac86a5d1c6b884949a8ec9  logs/original-full-v1r07-7b216a3.log
787da60015ed8d313c76ea1abc560742bf5b26b8f7feb6bd70f931528e2600f7  logs/original-full-v1r07-afbfb24.log
ef6abbec36d632320aa7c62faf5ab59c740062530214e93f8f98a78458dbd23d  logs/original-full-v1r08-7b216a3.log
21b6c95a775a561e847f97a983766ee3bb1516f9d57a1c2faee8c17f84555ae7  logs/original-full-v1r08-afbfb24.log
01a08d12f05691a17d341c5b2e1910741621e12b5e69f984951caef49a9362ec  logs/original-full-v1r09-7b216a3.log
cf7957da3eec2044ab9bf9952190ac52cc82229ca1187269d23240ce418938a2  logs/original-full-v1r09-afbfb24.log
e38972e59af4619d6bc3e23b6b21433aee61d0840a1d706dc11b5587fc3bc3aa  logs/original-full-v1r10-7b216a3.log
4ba184ab2a730e959024d9ed4e5da2808b2c04122a501ede9e2ec56d231114d9  logs/original-full-v1r10-afbfb24.log
```

## 12. Not verified / limitations

- **Environment.** jsdom component evidence on one machine, with dependencies from the lockfile-gated main checkout. The lockfile gate is a consistency check, not a supply-chain attestation. No Chrome, native or visual run is part of this batch.
- **Original-oracle failure rates** are characterizations under today's load (3.5–4.7 for those runs), not guarantees. The single `7b216a3` failure was not re-probed; its signature matches batch 30 D7.
- **Why the recursion sometimes unwinds normally** (batch 30 D6 measured a depth of ≈1069 with a correct value) was not determined. I found no `try/catch` that converts the overflow in the visible cycle: the spy, fixture `physical()`, `physicalKey()`, `ownershipForKey()`, jsdom's Storage proxy, and the tinyspy and @vitest/spy wrappers. The mechanism is cited from batch 30, not re-derived.
- **The before2/before3 oracle drafts cannot be reconstructed.** The More Sol runner records no oracle hash; the differences in §6 are inferred from frame positions and error text.
- **New runner.** `verify-fb002.mjs` is new; the frozen More Sol `verify-fixed.mjs` and `verify-callers.mjs` were not run. Equivalence rests on the same Vitest semantics, plus reproduction of all ten before4 failure signatures (original oracle at `afbfb24`) and of the accepted fixed count 10/10 at `7b216a3`.
- **Impact scan.**
  - It is static: patterns plus three-level helper resolution.
  - Not traced:
    - dynamic dispatch, beyond the Features and Sticky fault keys I checked by hand;
    - account-scope subscribers;
    - product-module internals, beyond the five pure builders.
  - The two run-time fixture aliases are documented assumptions; the batch-30 one is inferred.
  - Classes A and D are judged by key ownership at the base commit.
- **Not runnable in place.** The corrected oracle's `./fixture` exists only in the staged run directory.

## 13. Boundary

- **What this batch changed.** It adds evidence files only. No product, oracle, fixture, runner, prior log, ledger or control-plane file changed. There is no push, merge, rebase or branch.
- **Decisions left to the controller:**
  - whether C-FB002 is satisfied;
  - batch 32 (Features independent final acceptance), including the batch-30 E24 More row;
  - any adoption of the corrected oracle.
- **What stays closed.** No 312 item is closed. Any Desktop flow still needs the ADR-0013 D3 gate.
