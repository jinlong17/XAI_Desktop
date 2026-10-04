# Sticky native host matrix, controls and export at `f359be6` (CP-STICKY-01, batch 13)

**Verdict: PASS for all three runs (`host`, `controls`, `export`).** The frozen batch-8 and batch-9 harnesses ran unchanged against an immutable `git archive` of the repaired product `f359be6`.
- **h1 host matrix.** All 40 per-block runtime gates and both end gates are green. The four F1 gates that failed at `210abdf` (c9, c10, c11, i-pop) now pass. Every precondition and behavioural check still passes. Runtime errors went from 8 to 0.
- **controls and export.** 482 and 295 checks pass, as at `210abdf`. The seven exported files are byte-identical to the `210abdf` ones.
- **Product hashes.** Every log records the product file hashes. Only `departureCoordinator.tsx` differs from `210abdf`.

**Status.** This is independent verification only. It is **not acceptance**. It changes no product file, runner, fixture, existing log, receipt, contract, ledger or control plane. It closes no 312 item: `SET-12`, `REL-05`, `QA-01`, `QA-03`, `QA-04`, `QA-09` and D2/REL/AI stay open. It does not push, merge, deploy, release or sync Web→Desktop. The F1 modes, the race check and the overall batch-13 verdict are in `../web-sticky-recovery-f1/post-f359be6.md`.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol-role verifier for batch 13. It did not write the coordinator repair, the Sticky caller, the contract, the oracles or either native harness |
| Worktree | `.claude/worktrees/agent-a3872124dad5b4dc8`, detached at docs base `518fa42053c0f65f745cb0e09d043b429c2b40b5` |
| Candidate | requested `f359be6` → resolved `f359be6d838393e0f9e93efd80b88b5b09f6144e` (line 2 of each log) |
| Product tree equality | `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` is empty. Each log asserts it (`productDeltaVsDocsHead: ""`) |
| Product delta vs `210abdf` | `M apps/web/src/routes/modules/departureCoordinator.tsx`, `A apps/web/src/routes/modules/__tests__/departureCoordinator.blocker.test.tsx` |
| Dependency gate | `XAI_DEPS_ROOT` = main checkout, read-only; `pnpm-lock.yaml` SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for both it and the archive |
| Browser / toolchain | Chrome `154.0.8037.97` headless (protocol 1.3), 1280×813 at dpr 1; Node `v24.16.0`; esbuild `0.28.1` |
| Network | Only the local `127.0.0.1` server (ephemeral port) and local Chrome DevTools |
| Iterations | `host`, `controls` and `export` each ran exactly once with suffix `post1`; no environment failure, so no `post2` |

## Frozen integrity (checked before any run)

Every recomputed SHA-256 equals the value recorded in `review-host-210abdf.md` or `review-controls-export-210abdf.md`. `git log --name-status` over this directory shows only additions.

| File | SHA-256 | Result |
| --- | --- | --- |
| `native-host.tsx` (h1 fixture) | `f9b091807b8fc74c5640fb43278b42cbc2c45ceedc3b5bea9ca607c841aacd83` | OK |
| `verify-host.mjs` (h1 runner) | `77996177fb470ebb7935db5a13becb2c08d2b48e6a30a2cc1bcf531d6db9f325` | OK |
| `native-210abdf-h1-host.log` | `506c84e30ac57cb3698eb6eef8f3f3538764aec46863cb05b8f01850c7db8113` | OK |
| `native.tsx` (batch-8 fixture) | `db5807ef66ead00d70bd5a58fa4769561391cf254d223ef5a6485575ecec68ad` | OK |
| `verify-native.mjs` (batch-8 runner) | `14846f8034727d143a1c86266310cc72194209c7b3cca7fc2ac03d6fad2c9204` | OK |
| `native-210abdf-n1-controls.log` | `502f78dd7c125ba7defba7d6db49306e17ab2ee4d606c95bd1d7299dfbba9ef5` | OK |
| `native-210abdf-n1-export.log` | `2065832922429aa866f288064433090a28cf1de12cb31c6b4e27dd179075ff17` | OK |
| `native-210abdf-n1-export-x1…x7-*.json` (7 files) | `3e43a942…`, `becd1543…`, `6ce999b2…`, `41e1e23c…`, `236cecaa…`, `73bdb1ff…`, `236cecaa…` | OK |

Each after-log baseline records fixture and runner hashes equal to this table, so the runs used exactly these files.

## Commands

Run from the worktree root. `XAI_NATIVE_TMPDIR` only places the temporary archive, profile and download directory in the session scratchpad; the runners deleted them.

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<session scratchpad> \
  node docs/reviews/web-sticky-recovery-native/verify-host.mjs f359be6 host post1
# -> PASS docs/reviews/web-sticky-recovery-native/native-f359be6-post1-host.log checks=634   (exit 0)

XAI_DEPS_ROOT=… XAI_NATIVE_TMPDIR=… node docs/reviews/web-sticky-recovery-native/verify-native.mjs f359be6 controls post1
# -> PASS docs/reviews/web-sticky-recovery-native/native-f359be6-post1-controls.log checks=482   (exit 0)

XAI_DEPS_ROOT=… XAI_NATIVE_TMPDIR=… node docs/reviews/web-sticky-recovery-native/verify-native.mjs f359be6 export post1
# -> PASS docs/reviews/web-sticky-recovery-native/native-f359be6-post1-export.log checks=295   (exit 0)
```

## New files

| File | SHA-256 | Lines / bytes |
| --- | --- | --- |
| `native-f359be6-post1-host.log` | `6fe8d67efee1f525a0005414bc20fd929863da21b4c4430f859ca667131dfc56` | 681 lines |
| `native-f359be6-post1-controls.log` | `74451947f5f4d788e85ced0d09f02e7cc210d9c9d3c430d4e696cb7725d46848` | 511 lines |
| `native-f359be6-post1-export.log` | `2b63c770d596a6e775d4fc1c710851ccd0bc837c5870d4f8103308a059bb40fa` | 317 lines |
| `native-f359be6-post1-export-x1-sparse-one-field-sticky-draft.json` | `3e43a9426f234877da6e9c7b9a05d262dd7bf8b80415e609d0ce15ee2e835471` | 72 bytes |
| `native-f359be6-post1-export-x2-all-five-sticky-draft.json` | `becd15433fbed7d1228ba886542ba5b666da043d5c555cede2b7c8d066d39695` | 144 bytes |
| `native-f359be6-post1-export-x3-departure-dialog-sticky-draft.json` | `6ce999b2443cc5806a653cb15d05bd36cd34575cb05498e81309cf4deb088856` | 92 bytes |
| `native-f359be6-post1-export-x4-fresh-locked-after-a-to-locked-sticky-draft.json` | `41e1e23c4fba43ef13cedeb6fd0cc1b9d1444e06a0cb36a3867e6954557bd98c` | 115 bytes |
| `native-f359be6-post1-export-x5-fresh-b-after-a-to-b-sticky-draft.json` | `236cecaa6966e60d270f1f37a96e1d448029fd816fabbf6dd6899be904aece71` | 130 bytes |
| `native-f359be6-post1-export-x6-held-real-lock-sticky-draft.json` | `73bdb1ff3c22defd31a39428ccba656c1d921a0543fb5b01514a2bc91b4a17a6` | 150 bytes |
| `native-f359be6-post1-export-x7-recovered-after-click-failure-sticky-draft.json` | `236cecaa6966e60d270f1f37a96e1d448029fd816fabbf6dd6899be904aece71` | 130 bytes |
| `post-f359be6.md` | this receipt | — |

**Baselines (line 2 of each log).**

| Log | Bundle js SHA-256 | Before (`210abdf`) | Inputs | Product hashes |
| --- | --- | --- | --- | --- |
| host | `d9a937fb8fc95fe50fcef4ba2de495ca7d5da179db809867b90ff07df45d3b75` | `16b6bc78…` | 629: 559 archive, 69 third-party, 0 foreign | 13 files; only the coordinator differs (`08e94607…` → `0844a697…`) |
| controls, export | `5feedaf55aede791bf601179054ddaf4606071b731de75949e2c36a9edea581b` | `74baf9e9…` | 628: 559 archive, 68 third-party, fixture, 0 foreign | 11 files; only the coordinator differs |

The CSS bundle is `4253982f…` in all three logs, as before.

## Results: before (`210abdf`) → after (`f359be6`)

### h1 host matrix

Categories as in `review-host-210abdf.md`. Five precondition records in each log carry a lock name in their `name` field: details spread into the record, and they still pass. Counting them, both logs have 335 preconditions.

| Kind | Before (`native-210abdf-h1-host.log`) | After (`native-f359be6-post1-host.log`) |
| --- | --- | --- |
| Preconditions | 335 / 335 | 335 / 335 |
| Behavioural host checks (rows a–l, beforeunload) | 257 / 257 | 257 / 257 |
| Per-block runtime gates | 36 / 40 (c9, c10, c11, i-pop failed) | **40 / 40** |
| End gates | `run:deferred-product-failures-zero` failed; `run:runtime-errors-zero` not reached | **2 / 2** (lines 679, 680) |
| CDP runtime errors / console warnings | 8 / 0 | **0 / 0** |
| `product-failure` records | 4 | **0** |
| Final record | `pass:false`, 633 checks | `pass:true`, 634 checks |

- **Transitions per check id.**
  - 5 FAIL → PASS: the four F1 gates and `run:deferred-product-failures-zero`.
  - 623 PASS → PASS.
  - 0 PASS → FAIL.
  - 1 new id, `run:runtime-errors-zero`, reached only because the run no longer stops at the first end gate.
- **The former F1 sites.** Each now has one POP commit to the recorded entry with key and state deep-equal, 0 `pushState`/`replaceState`, one popstate, one `ok` write, and a clean runtime gate:

  | Site | Row line | Gate line | Write |
  | --- | --- | --- | --- |
  | c9 browser Back | 213 | 214 | `color` `lilac` |
  | c10 guarded Forward | 234 | 235 | `grid_spacing` `normal` |
  | c11 script `history.back()` | 253 | 254 | `font` `large` |
  | i-pop | 290 | 291 | `pin_default` `true` |

- **Rows g, k and l.** The 67 checks of rows g (Stay, Escape, export), k (route, sign-out and POP epoch cancellation, fresh protection) and l (unmount with a pending sign-out) all pass. All 44 `row` records are present, as before.

### controls and export

| Mode | Before | After | Transitions |
| --- | --- | --- | --- |
| `controls` | PASS, 482 checks, 0 runtime errors, 0 warnings | PASS, 482 checks, 0 runtime errors, 0 warnings | 481 PASS → PASS by check id, plus the one lock-named precondition record (line 468), which passes in both |
| `export` | PASS, 295 checks, 0 / 0 | PASS, 295 checks, 0 / 0 | 295 PASS → PASS |

- **Export bytes.** All seven artifacts x1–x7 have the same SHA-256 and size as the `210abdf` files. The all-five export is still `becd1543…`.
- **No failing record.** No record in the three after-logs has `"pass":false`.

## Limitations

- **Environment.** Headless Chrome 154, not Tauri. React development build, without the production `StrictMode` wrapper. Reused dependency trees; the lockfile gate is a consistency check only.
- **Inherited from batches 8 and 9.**
  - EN only, 1280×813, plus one 1280×420 step.
  - Synthetic accounts.
  - Sign-out through the direct `requestSettingsDeparture("sign-out")` preflight.
  - Synthetic `beforeunload`.
  - Browser traversal through CDP `Page.navigateToHistoryEntry`.
  - The font select is focused by script before real keys.
  - The minimal route table has no `errorElement`.
- **Scheduling.** F1 is scheduling-dependent, so one passing run cannot prove absence. h1 had reproduced it in 4 of 4 Retry-released POPs at `210abdf`; here all 4 are clean.
- **Out of scope.** The EN/ZH five-width visual and keyboard checks remain for a later batch.
