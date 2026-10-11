# AppRail order final regression receipt (E18–E25) at `f9eb4b1`

- **Caller:** CP-APPRAIL-01, AppRail order (`xai_rail_order`), its drag writer and its App-lifetime protection; module `web`; control-plane batch 64.
- **Contract:** `../web-apprail-order-recovery-contract/contract.md` r1 (`f7726d7`, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`, re-derived): §10 items 8–12, §11, §13, §14 gate 9, §15 E18–E25 and Rules.
- **Fixed product:** `f9eb4b1f207bc4b46f547b90afc250424b3c8695` (tree `05887cf113639116b228a25041a37b3d5c69a322`). **Before:** `419e56de9f23e4467fea806fbd4a990e1f429941`.
- **Verifier:** independent final-regression verifier (Sol role), Claude Opus 5.5, worktree `.claude/worktrees/agent-a6a467b4a410199bc`, detached at control-plane commit `9aeec39ecc3d9da70837e97b9660837fe887b765` after `git fetch origin codex/web/full-product-audit-20260908`; `git status` clean. I am not the contract author, not Terra, and did not execute any earlier batch of this caller. I wrote no oracle; I wrote the new runners, copies and tools listed in §2.2.

**This receipt is the final-regression gate only.** It is not caller acceptance (batch 65). It closes no 312 item (SET-03, SHELL-01/03/04/05/06, REL-05/07/09/10, UX-03/04/05, QA-01/03/04/09, D2/REL/AI stay open) and authorizes no deployment, release, branch promotion or Web→Desktop sync.

## Verdict

**PASS for E18–E25, with one disclosed harness deviation that needs a controller ruling (§2.3 item 1): the four older host-suite runners named in contract §13 cannot read the current repository archive (100 MiB buffer, `ENOBUFS`) at either revision, so E23's host-suite rows ran through copies that change only the buffer size and the root depth.** No product failure was observed anywhere. Every count equals its accepted receipt (85 MATCH, 0 DIFF), every judging copy passes, and every frozen original falls exactly as §13 predicts.

| Item | Result at `f9eb4b1` | Accepted / control | Exit | Verdict |
| --- | --- | --- | --- | --- |
| **E18** §10.9 search | 26 patterns; 51 delta rows, all in §11 files; shell product source 0 × each of `localStorage`, `usePref(`, `setPref(`, `removePref(`, `new StorageEvent`, `dispatchEvent(`; `AppRail.tsx` 0 storage-API spellings, imports only React, tokens, unchanged shell modules and the new controller/model; `App.tsx` 0 `xai_rail_order`, 0 `usePref(`, `localStorage` lines 4 = 4, `readLocalPref` byte-identical (`419e56d` L87–97 → L90–100, `3675ffe3…`), the other two `localStorage` lines are comments | per-file counts at `419e56d` (same log) | 0 | **PASS** (140/140 assertions, 56/56 harness, shared with E19) |
| **E19** §10.8 protected paths | 14/14 fully protected paths identical object ids and empty diff; `xai-web-shell` 17 changed, all §11, every non-§11 path identical; 15 §11-protected shell files and `__fixtures__/` identical; `apps` 2 changed, 268/268 others identical; product diff and full diff outside `docs/` = exactly the 19 §11 files (+2960/−76), 4 new internal modules; all 24 existing Topbar case blocks and 23 "Unchanged" test files byte-identical | contract §10.8, §11 | 0 | **PASS** |
| **E20** storage check-types | `tsc --noEmit` exit 0, 0 diagnostics, 315 program files (46 archive / 269 store / 0 elsewhere) | Appearance final `419e56d` 315/46/269 | 0 | **PASS** |
| **E20** Sol lifecycle | AppRail Sol `bytes` 26/26; case 007 "PC §2/§10.11 lifecycle classification, registry entry, device ownership and the per-key lock name are unchanged" PASSED (also in E7 `fixed1` and E2 `before1`) | names/statuses equal to E7 | 0 | **PASS** |
| **E21** shell | test 12 files / 205 / 205 (per file equal to Terra); check-types exit 0 (363/68); lint exit 0 (32 files, 0/0) | Terra 205; Appearance final 9/115 + 3 new files (88) + Topbar 24→26 | 0/0/0 | **PASS** |
| **E21** before control | 8 unchanged files 91/91 and the 24 existing Topbar cases 24/24, identical names and statuses at `f9eb4b1` and `419e56d` (and equal to the Appearance final at `419e56d`) | same | 0 | **PASS** |
| **E22** web | test 30 / 196 / 196 (per file equal to Terra; every §10.10 file ran; `App.railorder` 18); check-types exit 0 (1389/672); lint exit 0 (84 files) | control `419e56d` 29 / 178, per file equal to the accepted Appearance final; delta exactly `App.railorder.test.tsx` (18) | 0/0/0 | **PASS** |
| **E22** before control | the 13 §10.10 web files 118/118 and the storage `imperative` + `registry` tests 31/31, identical at both revisions | same | 0 | **PASS** |
| **E23** accepted callers | 85 MATCH / 0 DIFF (`compare-accepted-apprail-final-v1.log`); §13 prediction table §4 all matched | accepted receipts | see §3 | **PASS** (host-suite rows via copies, §2.3) |
| **E24** Features native | frozen host and downstream runners refuse only at `baseline:fixed-delta-only-in-features-package` (exit 1, expected); copy: host **PASS** 751 checks (750 + K-1 audit), 341/341 product; downstream **PASS** 344 checks, 140/140 product; 0 runtime errors, 0 console warnings, K-1 audits 1 = 1 and 7 = 7 | host `5cd63ff` 750/341; downstream Appearance final `419e56d` 344/140 | 1,1 / 0,0 | **PASS** |
| **E25** | this receipt; G1 §5 | — | — | **PASS** (complete, 0 missing IDs) |

## 1. Fixed points and execution rules

- `git diff --name-only f9eb4b1 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (every native log also records `productDeltaVsDocsHead: ""`).
- **Dependencies.** `XAI_DEPS_ROOT` = this worktree after `pnpm install --frozen-lockfile --offline` (599 packages, 0 downloaded; lockfile `df05f2dd…aeab9`, unchanged; `git status` clean afterwards). The main checkout was never used: not as a dependency root, not read by any runner, nothing written, no server or preview started there.
- **Every execution** (except the older host-suite runners, §2.3): an immutable `git archive` of the requested SHA in a fresh temporary directory, deleted afterwards; lockfile gate for the dependency root, `git show <rev>:pnpm-lock.yaml` and the extracted archive; `@repo/*` pinned into the archive with that runner's guard (Vitest exact-match aliases + guard plugin, `pin_unaliased_repo_imports=0`; tsc `--listFiles` with `elsewhere=0`; ESLint resolution hook, `pin_violations=0`; esbuild exact-export pin + checkout guard); requested and resolved SHA in every log; refusal to overwrite; nonzero exits preserved (Appearance `continuity-export` 1, Features `downstream` frozen 1 at both revisions, C-FD1 at `f9eb4b1` 1, frozen native host and downstream 1, frozen host-suite runners 1).
- **Native:** Chrome 155.0.8059.39 headless. No runner I invoked sends `nativeVirtualKeyCode`; the E24 copy keeps the K-1 key audit (passes). Transport: the frozen DevTools WebSocket (§2.3 item 2). No headless Chrome, Vitest process or `xai-*` temporary directory remained; the native temp directory (session scratchpad) is empty.
- **Runtime:** Node v24.16.0, Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, TypeScript 5.9.2, ESLint 9.39.1, esbuild 0.28.1, macOS arm64, tz America/Los_Angeles. Official runs 2026-10-09 14:51:13Z–15:10:32Z, strictly sequential.

## 2. Runners

### 2.1 Reused unchanged (hash = its accepted receipt, re-derived)

| Runner | SHA-256 | Used for |
| --- | --- | --- |
| `../web-features-recovery-final/verify-packages.mjs` | `f7758f28fd98cba9…` | E20 storage; E23 settings-shell, settings-rest, Features package and reader tests |
| `../web-apprail-order-recovery-sol/verify-fixed.mjs` | `e944cb226e3fa342…` | E20 lifecycle (`bytes`) |
| `../web-appearance-recovery-final/verify-packages.mjs` | `8f9fb90f38717515…` | E23 Appearance package |
| `../web-appearance-recovery-sol/verify-fixed.mjs`, `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs`, `../web-appearance-recovery-independent/verify-fixed.mjs` | `a451df6a…`, `354c220b…`, `6aac3563…` | E23 Appearance Sol 8 modes, OE, parent host |
| `../web-features-recovery-sol/verify-fixed.mjs`, `../web-features-recovery-independent/verify-fixed.mjs` | `b5ac75fa…`, `d92901b4…` | E23 Features Sol 7 modes (downstream at both revisions), host |
| `../web-appearance-recovery-final/diag-features-sol-corrected.mjs` (C-FD1) | `cfe596be41218d28…` | C-FD1 at both revisions |
| `../web-apprail-order-recovery-sol/diag-features-sol-c-rd1.mjs` (C-RD1) | `7d6e8c3fdce61fb6…` | C-RD1 at both revisions |
| `../web-features-recovery-final/verify-callers.mjs` | `7e1aa8b244ed9f63…` | E23 More, Notifications, Date & Time (17 modes) |
| `../web-more-recovery-fb002/verify-fb002.mjs` | `d2150cd4794f7a51…` | C-FB002 |
| `../web-sticky-recovery-sol/verify-fixed.mjs`, `../web-sticky-recovery-independent/verify-fixed.mjs` | `3fba4b3b…`, `5a8ea1dd…` | E23 Sticky |
| `../web-features-recovery-native/verify-native-{host,downstream}.mjs` + `native-host-harness.mjs` | `9688043d…`, `82df2961…` + `499fca4c…` | E24 frozen attempts (refusals) |
| `../web-{smart-lists-recovery-astra,collaborate-recovery-independent,pomodoro-departure-independent,dashboard-header-departure-independent}/verify-fixed.mjs` | `f79c2dff…`, `ac9a8fdc…`, `ca14e264…`, `840225ac…` | E23 host suites, frozen attempts (refusals, §2.3) |

### 2.2 New in this directory

Runner hashes were recorded at 14:50:35Z, before the first official run (host-suite copies at 15:05Z, before their official run), and are unchanged (re-checked after all runs).

| File | SHA-256 | Covers |
| --- | --- | --- |
| `verify-static.mjs` | `c7dea48432c8568c64f91fe590fca1656c44674c0790f79ccb74d12f3690a47c` | E18, E19, E6 §11 hashes, Topbar and "Unchanged" file dispositions. A copy of the Appearance final `verify-static.mjs` (`8f6352fd…`) with AppRail tables and §10.9 gated zeros |
| `verify-packages.mjs` | `fd9d9988c8c38c904555c4a539836db62aceda005098919d02bba4daf53dde15` | E21, E22, §10.10 storage controls: a copy of the Appearance final package runner with a shell/web/storage mode table |
| `verify-native-host.mjs`, `native-host-matrix.tsx`, `verify-native-downstream.mjs`, `native-downstream.tsx`, `native-host-prelude.js` | `9688043d…`, `819573b0…`, `82df2961…`, `9b77055e…`, `01acaa5d…` (byte-identical to the frozen Features files) | E24 copy |
| `native-host-harness.mjs` | `87049b7c956b17f15c9021d3ab17090eaa77c199f46ae7748e5d1ead79ba3539` | E24 copy: the accepted Appearance E25 copy (`afa313f8…`) with one precondition changed; diffs `native-host-harness.e24-vs-appearance-copy.diff` (`05fe1fe1…`) and `native-host-harness.e24-vs-frozen.diff` (`48a511aa…`) |
| `host-suites/<caller>/verify-fixed.mjs` (4) + 13 byte-identical test/fixture files + 4 `verify-fixed.copy.diff` | `4160d9cf…` (Smart Lists), `44738ec8…` (Collaborate), `e5ebd841…` (Pomodoro), `56645cbb…` (Header); diffs `828f37e5…`, `27c5bf37…`, `27a76966…`, `f3cddf53…` | E23 host suites (§2.3 item 1) |
| `compare-accepted.mjs`, `hash-evidence.mjs` | `d54a2420…`, `3b0d2b70…` | read-only comparison and G1 tools (no product code) |

### 2.3 Deviations (each needs controller acknowledgement; acceptance reviews them)

1. **E23 host suites through copies (needs a ruling).** The four older runners of contract §13's last row read `git archive <rev>` into a 100 MiB buffer. The archive is 74,393,600 bytes at `f359be6` (where their last accepted logs ran) but 125,992,960 at `419e56d` and 148,408,320 at `f9eb4b1` (growth is `docs/reviews/` evidence, not product). Run unchanged, all 31 invocations (17 at `f9eb4b1`, 14 `419e56d` controls) abort with `spawnSync git ENOBUFS` at line 14, before any test runs, writing no evidence log; the transcript is `frozen-host-suite-refusals-apprail-final-v1.log` (`df41ffac…`). This is not an explicit SHA precondition, but it is SHA-bound in the same way (it holds only for older, smaller archives) and is not caused by this caller (`419e56d` fails identically). I therefore applied the batch's copy procedure: `host-suites/<caller>/verify-fixed.mjs` differs from the frozen runner only in the archive buffer (1 GiB) and `root` (two more `../`, because the copy sits two directories deeper), plus a header comment; the staged test files are byte-identical and staged at the frozen runner's own archive path. The first copy attempt had `root` one level short (git archived only `docs/`, every run aborted at `readdir packages`, no evidence written); it was corrected and rerun once (diagnostic iteration 2 of 3 for this unit). If the controller does not accept this reading of the stop rule, these 31 logs are void and E23 lacks only this row.
2. **Transport.** The batch asks for pipe transport where a runner supports it. The only native runners here are the frozen Features harness and its copy, which use the DevTools WebSocket they were frozen with; changing transport would widen the E24 copy beyond "only the product-delta precondition". A dropped socket can only surface as a harness error; none occurred.
3. **E24 copy base.** The copy derives from the accepted Appearance E25 copy (which already carries the K-1 audit), not directly from the frozen Features harness, so that it differs from an accepted runner by exactly one precondition; both diffs are recorded. The frozen Features `verify-native-host.mjs` had not been rerun since `5cd63ff`; its E24 comparison is against the accepted Features E12 log `native-5cd63ff-fixed1-host.log` (`f025b831…`).
4. **New runners for E18–E22,** as in batches 30 and 51: the precedent runners hard-code the Appearance caller. Fidelity: same code paths; controls reproduce accepted counts (web `419e56d` 29/178 and shell unchanged 91 equal the Appearance final per file and per case).
5. **§10.9 "App.tsx contains no `localStorage`" read as "adds none"**: `readLocalPref` (byte-identical, required by the same item) itself reads `localStorage`; the gate checks the count is unchanged (4 = 4) and that every line outside `readLocalPref` is a comment.
6. **Hash-class nit:** `hash-evidence.mjs` classifies by first match, so `compare-accepted-apprail-final-v1.log` is listed under class "E23" rather than "E25 tools". Hashes are unaffected.

## 3. Reproduction (official runs, in order) and exit codes

From the worktree root, `XAI_DEPS_ROOT=<this worktree>`, `XAI_NATIVE_TMPDIR=<session scratchpad>/native-tmp`, suffix `apprail-final-v1`:

```sh
node docs/reviews/web-apprail-order-recovery-final/verify-static.mjs f9eb4b1 419e56d apprail-final-v1                                   # 0
node docs/reviews/web-apprail-order-recovery-final/verify-packages.mjs f9eb4b1 <shell-test|shell-unchanged-files|shell-topbar-unchanged|shell-check-types|shell-lint|web-test|web-unchanged-files|web-check-types|web-lint|storage-unchanged> apprail-final-v1   # 0 each
node docs/reviews/web-apprail-order-recovery-final/verify-packages.mjs 419e56d <shell-unchanged-files|shell-topbar-unchanged|web-test|web-unchanged-files|storage-unchanged> apprail-final-v1   # 0 each
node docs/reviews/web-features-recovery-final/verify-packages.mjs f9eb4b1 <storage-check-types|settings-shell-test|settings-rest-test|features-test|features-readers> apprail-final-v1   # 0 each
node docs/reviews/web-apprail-order-recovery-sol/verify-fixed.mjs f9eb4b1 bytes apprail-final-v1                                    # 0
node docs/reviews/web-appearance-recovery-final/verify-packages.mjs f9eb4b1 appearance-test apprail-final-v1                       # 0
node docs/reviews/web-appearance-recovery-sol/verify-fixed.mjs f9eb4b1 <mode> apprail-final-v1         # bytes fields reset queues host retry-all original: 0; continuity-export: 1 (OE-1/OE-2, predicted)
node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs f9eb4b1 corrected apprail-final-v1                     # 0
node docs/reviews/web-appearance-recovery-independent/verify-fixed.mjs f9eb4b1 host apprail-final-v1                               # 0
node docs/reviews/web-features-recovery-sol/verify-fixed.mjs f9eb4b1 <mode> apprail-final-v1           # bytes fields reset queues continuity-export original: 0; downstream: 1 (predicted)
node docs/reviews/web-appearance-recovery-final/diag-features-sol-corrected.mjs f9eb4b1 downstream apprail-final-v1                # 1 (C-FD1, predicted)
node docs/reviews/web-apprail-order-recovery-sol/diag-features-sol-c-rd1.mjs f9eb4b1 downstream apprail-final-v1                   # 0 (C-RD1)
node docs/reviews/web-features-recovery-sol/verify-fixed.mjs 419e56d downstream apprail-final-v1                                   # 1 (F-FD1, predicted)
node docs/reviews/web-appearance-recovery-final/diag-features-sol-corrected.mjs 419e56d downstream apprail-final-v1                # 0
node docs/reviews/web-apprail-order-recovery-sol/diag-features-sol-c-rd1.mjs 419e56d downstream apprail-final-v1                   # 0
node docs/reviews/web-features-recovery-independent/verify-fixed.mjs f9eb4b1 host apprail-final-v1                                 # 0
node docs/reviews/web-features-recovery-final/verify-callers.mjs f9eb4b1 all apprail-final-v1                                     # 0 (17 modes)
node docs/reviews/web-more-recovery-fb002/verify-fb002.mjs f9eb4b1 corrected full apprail-final-v1                                 # 0
node docs/reviews/web-sticky-recovery-sol/verify-fixed.mjs f9eb4b1 <bytes|fields|queues|continuity-export|original> apprail-final-v1   # 0 each
node docs/reviews/web-sticky-recovery-independent/verify-fixed.mjs f9eb4b1 host apprail-final-v1                                   # 0
node docs/reviews/<host-suite dir>/verify-fixed.mjs <f9eb4b1|419e56d> <mode> apprail-final-v1           # 31 invocations, 1 each (ENOBUFS refusal, §2.3)
node docs/reviews/web-apprail-order-recovery-final/host-suites/<host-suite dir>/verify-fixed.mjs <f9eb4b1|419e56d> <mode> apprail-final-v1   # 31 invocations, 0 each
node docs/reviews/web-features-recovery-native/verify-native-host.mjs f9eb4b1 host apprail-final-v1                                # 1 (expected refusal)
node docs/reviews/web-features-recovery-native/verify-native-downstream.mjs f9eb4b1 downstream apprail-final-v1                    # 1 (expected refusal)
node docs/reviews/web-apprail-order-recovery-final/verify-native-host.mjs f9eb4b1 host apprail-final-v1                            # 0
node docs/reviews/web-apprail-order-recovery-final/verify-native-downstream.mjs f9eb4b1 downstream apprail-final-v1                # 0
node docs/reviews/web-apprail-order-recovery-final/compare-accepted.mjs apprail-final-v1                                         # 0: 85 MATCH, 0 DIFF
node docs/reviews/web-apprail-order-recovery-final/hash-evidence.mjs apprail-final-v1                                            # 0: 0 failures
```

Host-suite modes: Smart Lists `export host host-entry host-wrapper app original39 original-parent package`; Collaborate `contracts host package`; Pomodoro `departure advanced package`; Dashboard Header `departure advanced followon`. The `419e56d` controls run every mode except `package`.

**Iterations.** One official run per unit. The host-suite unit used 2 of 3 diagnostic iterations on the copy (root-depth defect, §2.3 item 1). No log is superseded; the defective copy wrote no log.

## 4. Contract §13 prediction table, observed

| Oracle | Predicted at `419e56d` | Observed at `419e56d` | Predicted at `f9eb4b1` | Observed at `f9eb4b1` | Judges | Match |
| --- | --- | --- | --- | --- | --- | --- |
| Features Sol `downstream`, frozen | 14/15 (012 PRECONDITION, F-FD1) | **14/15**, only 012 PRECONDITION (`bgTone` null for seeded `sage`) — `95ca0bf7…` | 13/15 (012 F-FD1; 014 PRECONDITION, A7) | **13/15**, exactly 012 (same F-FD1 signature) and 014 "PRECONDITION: the drag-reorder persisted a changed rail order" — `3ae4d8a4…` | No | yes |
| C-FD1 copy (`7bb5ad3c…`) | 15/15 | **15/15** — `29ab19f1…` | 14/15 (014 PRECONDITION, A7) | **14/15**, only 014, same signature — `8aeb6462…` | No | yes |
| C-RD1 copy (`6c57164e…`) | 15/15 | **15/15** — `41f97ecc…` | 15/15 | **15/15** — `a2428179…` | **Yes** | yes |
| More `boundaries`, frozen | as it falls | not run (not required) | as it falls | **10/10** (recorded; F-B002 nondeterministic) — `5ba53c5c…` | No | n/a |
| More `boundaries`, corrected (C-FB002) | 10/10 | not run (accepted `419e56d` 10/10) | 10/10 | **10/10**, RangeError 0/0 — `06726b6e…` | **Yes** | yes |
| Appearance `continuity-export`, frozen | 24/26 (006, 007) | accepted `419e56d` 24/26 | 24/26 | **24/26**, exactly 006 and 007, names/statuses equal to `419e56d` — `ea440fac…` | No | yes |
| Appearance `continuity-export.corrected` (OE) | 26/26 | accepted `419e56d` 26/26 | 26/26 | **26/26** — `8da0b9c7…` | **Yes** | yes |

**C-RD1 condition (controller confirmation item 7) holds:** the frozen original fails only on its predicted signatures (012 F-FD1 at both revisions, plus 014 A7 at the fixed SHA), and the corrected copy passes at both before and fixed. All other rail-truth and isolation cases (003, 006–011, 013, 015) pass in every run. Every other §13 row: Appearance Topbar and App tests unchanged and passing (E21, E22); the Appearance Sol/host suites equal the accepted counts; Features Sol/host/package/reader tests equal; More, Sticky, Notifications, Date & Time equal; Smart Lists, Collaborate, Pomodoro, Dashboard Header host suites equal (no oracle correction needed, as predicted); Features native host and downstream pass through the one harness copy (no oracle correction, as predicted).

## 5. G1: enumeration of E1–E25

**Method** (`hashes-apprail-final-v1.log`, SHA-256 `5e8fa755d0a7e0fd06470cc13ec7eb2aa3550d2de9054d4d0dc1a993fd18d84d`, written by `hash-evidence.mjs`): each committed item's artifact list is every file its producing commit added under the item's directory (filtered by name), so nothing is listed by hand; **every** file's SHA-256 was re-derived (296 committed artifacts: 276 for E1–E17 and 20 supplementary; the 19 E6 product files at `f9eb4b1`; and the 141 new files present at hashing time); for every committed artifact the producing commit is the last commit to touch it and the file is unchanged since; every hash was looked up in the item's receipt and the control plane. Result: 0 failures, 0 missing IDs, 0 unclassified new files, 0 tracked files modified. Each item's only non-listed file is its own receipt (a receipt cannot carry its own hash). Paths below are relative to `docs/reviews/`.

| ID | Producing commit | Principal artifacts and SHA-256 (re-derived; receipt match) | Verdict |
| --- | --- | --- | --- |
| E1 | `d6ea500` | `web-apprail-order-recovery-sol/`: `README.md` `2a0a547763f60d1882fd912cf70f121836ee0c47daa7d795598784f7f6deb815`, `verify-fixed.mjs` `e944cb226e3fa342727c913547ff5084e0ad38fad5293ed306cb512bf9f5a4e8`, C-RD1 `features-downstream.c-rd1.test.tsx` `6c57164ef5040444dad96fbf5933e90b095d465c64bdd6e8e5f3dcb6be2d1c7a`, both C-RD1 diffs, the staging-runner copy and 7 oracles + fixture. 15 files, 14 full | frozen |
| E2 | `d6ea500` | 17 logs, e.g. `bytes-before1-419e56d.log` `94c87889a14f0a6097b6ad2c70fa92dd145f654d0fa53f0449aa86e4c7ffcc1b`, Features downstream frozen `85695562…`, C-FD1 `dbfc3a73…`, C-RD1 `c8f5ff44…`. 17/17 full | PASS (correct before FAILs) |
| E3 | `6e9ec9c` | `web-apprail-order-recovery-independent/README.md` `85f9d9b707839ddeb1b339ee9ff68bc4bf5c7b42769b379b9e48bad9d0f69026`, `host-before1-419e56d.log` `ee5f6e1d2aaafabec04f961ab5f1d091a1bb5ad47fe1794e8e6fa1a96812ebb3`, runner `646bf047…`. 5 files, 4 full | PASS |
| E4 | `04ee6a2` | `web-apprail-order-recovery-native/before-419e56d.md` `8253c075f386f07128a0e630fe51409ba9edd8cd3428b0a0e1734a4e3a5b1c2e`, `native-419e56d-before1-h1.log` `a222683d5b706d7129c70dabe3aa1b948d97bf5029fddd2d6c22493bbdd83d6f`, runner `ccabd500…`, 51 PNGs. 61 files, 60 full | PASS |
| E5 | `04ee6a2` | `web-apprail-order-recovery-f1/before-419e56d.md` `e010bb6a0d93183e4703a1297c055124672e0745c5177dc461eed1e67c9b90a5`, `f1-419e56d-railorder-before1.log` `3108774b08a066e8aa1584e576d97e154c892a92513006f6cc8c1b5902f064cd`, runner `6385b648…`. 5 files, 4 full | PASS |
| E6 | `f9eb4b1` (product) + `0d440ca` (run record) | Product: the 19 §11 files at `f9eb4b1`, 19/19 equal to the E19 log, e.g. `AppRail.tsx` `fe789078fecc60936d3e6c5fc2b203001a15490aecf30f3a0ca301da1399fb44`, `internal/railOrderController.tsx` `d7f2f0b6…`, `App.tsx` `f644e78e…`. Record: `web-apprail-order-recovery-terra/implementation.md` `fe7bc377e09e9088163411a29fe3f2b81771bc07a5c00ac718f5880865d09086`, `shell-test-f9eb4b1.log` `72876c4e…`, `web-test-f9eb4b1.log` `98f9673a…`; 7 files, 6 full. Diff = exactly the 19 §11 files (E19) | PASS |
| E7 | `94b12ba` | `web-apprail-order-recovery-sol/fixed-f9eb4b1.md` `e49a8fd8b2d1c8c07fd2c0654a2b18e0f8e30e29100ff200da6c330b0384f990`, `bytes-apprail-fixed1-f9eb4b1.log` `68faf686902a88131d48adee20efe26b873a1c12fe670f6b2cbdc70eaf18a442`, `host-apprail-fixed1-f9eb4b1.log` `da51f57a…`. 9 files, 8 full | PASS |
| E8 | `94b12ba` | `web-apprail-order-recovery-independent/host-apprail-fixed1-f9eb4b1.log` `ba3c1bd4da61e26e14b7baa7ed8cf0717b29a79df610884c9f60a5b7199d86e5` (1/1 full) | PASS |
| E9 | `ae7b69e` | `review-controls-protection-export-f9eb4b1.md` `8667cacf3c7325f37f82ab91b0e4bc4a42189a6037d22c65dd2ae02bcc848ddf`, `native-f9eb4b1-fixed1-controls.log` `c416cf3f1d9daa26238bb6fa43486b34cd0319cb0e827c0d8b0ca66f0ad281bf`, runner `f062e723…`, fixture, prelude, 32 PNGs. 37 files, 36 full | PASS |
| E10 | `ae7b69e` | `native-f9eb4b1-fixed1-protection.log` `6dc38387527ebb2b6f5da71c189cd6142b0c3a1fcd12ef0b4846607cc93288d2` + 2 JSON + PNGs. 10/10 full | PASS |
| E11 | `ae7b69e` | `native-f9eb4b1-fixed1-export.log` `0172a752fa5da085a9d9a01681679ab6c8842a48473cef7c13642948be6aaa02`, x1 `d4d7f01f…` + 6 JSON + PNGs. 10/10 full | PASS |
| E12 | `55cf1e9` | `review-downstream-visual-f9eb4b1.md` `0376f2ab9d9091ca0eb87d4e8a5bcb05269517669e6dea76d322e9a6578b0c7e`, `native-f9eb4b1-fixed1-downstream.log` `0da57fcf6c0ba55a1b224904bf454cab8dc46011bce7364ff3440b13a923d789`, runner `55b49d11…`, 14 chrome PNGs, 2 JSON. 20 files, 19 full | PASS (clean-chrome invariance holds, so §13's "not rerun" rows stand) |
| E13 | `55cf1e9` | `native-f9eb4b1-fixed1-visual-en.log` `3c42c0a1efcc9b509d1422aaa2ef3c76a8b376dc2317b5d8394722526da78345`, `-visual-zh.log`, 27 PNGs. 29/29 full | PASS |
| E14 | `5c6bcd2` | `review-keyboard-f9eb4b1.md` `f48d091c7eb895e118ae037a855037a2b884022411c109afa12ad4a25d8924d0`, `native-f9eb4b1-fixed1-keyboard-en.log` `b5414fcd713a7db5865b7db8c68384c5177c32f8ac1cee90387c8249dbfdfdf3`, `-keyboard-zh.log`, runner, 30 PNGs. 34 files, 33 full | PASS |
| E15 | `94b12ba` | 10 `web-sticky-recovery-f1/f1-f9eb4b1-*-apprail-fixed1.log` (e.g. `sticky` `dd7e7eb0c9c898c93ac8130a8a9e8782efe51ec61d9be92f6609133fbebf7848`) + 2 `web-features-recovery-f1/` (`features` `bb8a138e…`). 12/12 full | PASS |
| E16 | `94b12ba` | `web-apprail-order-recovery-f1/f1-f9eb4b1-railorder-apprail-fixed1.log` `d4aae5fdf2a93b7dda8908ab7122d19a43d51865e244f5d75d6de40bd6a8e4b5`, selfcheck. 2/2 full | PASS |
| E17 | `94b12ba` | `web-native-keyinput-k1/f1-f9eb4b1-appearance-apprail-fixed1.log` `5e7667df608159d5374a58bf21fc3fecc45c0f7ab4dba04f4f0bf3ea62698104`, selfcheck. 2/2 full | PASS |
| E18 | this batch | `web-apprail-order-recovery-final/search-apprail-final-v1-f9eb4b1.log` `368ba9e6a5bd58f7182736395932febc1d55e748b47af83c0f132ef138ade3b3`; runner `verify-static.mjs` `c7dea484…` | PASS |
| E19 | this batch | `protected-diff-apprail-final-v1-f9eb4b1.log` `5a0ef354a8a08573ee071b3b0625985e95b030d7522342c2b65244dc7075b729` | PASS |
| E20 | this batch | `../web-features-recovery-final/storage-check-types-apprail-final-v1-f9eb4b1.log` `a0b00ec439810bbfb8cd8e5c6305325ff610249eda6f8168893f37ae708273eb`; `../web-apprail-order-recovery-sol/bytes-apprail-final-v1-f9eb4b1.log` `6a9d290f0f3d8f321caca0070beda1d6110762cd219569ebdeb8552a88c49fe5` | PASS |
| E21 | this batch | `shell-test-apprail-final-v1-f9eb4b1.log` `4aa2586c4bafb3788b03bf934bfdfa4f3deab0fd5207d1efbc5a9603c663e7b8`, check-types `f89fe39b…`, lint `c5d6114b…`; controls `shell-unchanged-files` and `shell-topbar-unchanged` at both revisions (hashes log, class E21); runner `verify-packages.mjs` `fd9d9988…` | PASS |
| E22 | this batch | `web-test-apprail-final-v1-f9eb4b1.log` `8560b7e54374b72c4538b5750841a5097c96541b34fc8ab986d8c458f573dd44`, check-types `6dd00b22…`, lint `c90b33fa…`; control `web-test-…-419e56d.log` `5f04fa5d…`; `web-unchanged-files` and `storage-unchanged` at both revisions | PASS |
| E23 | this batch | 84 logs (hashes log class "E23"), e.g. C-RD1 `a2428179491794154bbed3bfa133b4e2ea8a15de4bc5f34d24ccf1d85f8f0730`, OE `8da0b9c7…`, C-FB002 `06726b6e…`; host-suite copies (22 files) and the refusal transcript `df41ffac…`; comparison `compare-accepted-apprail-final-v1.log` `aef27ba00afd51a34948b5dc8df62e4dd9d8dbcc3ef0bb79630bea6a35556cab` (85 MATCH, 0 DIFF) | PASS (host suites via copies, §2.3) |
| E24 | this batch | copy logs `native-f9eb4b1-apprail-final-v1-host.log` `20f6273e43758aa8f7f84994f5839bba99e2139570b1c98a9a4ab8bed15e0522` and `-downstream.log` `4efcab6bc4c3a5222e2c34ad2c91bc6033b1121aa5914f835ecd1e14e91a7c55`; frozen refusals `../web-features-recovery-native/native-f9eb4b1-apprail-final-v1-host.log` `ffdb8f74…` and `-downstream.log` `350d8e8a…`; harness copy `87049b7c…` and its two diffs | PASS |
| E25 | this batch | this receipt; `hashes-apprail-final-v1.log` `5e8fa755…` | PASS |

**Supplementary items re-derived** (same log): K-1 `../web-native-keyinput-k1/review-k1.md` `18a98325b5ff04960087967260017237fda9d2be67ef97f91bffa26e14eaf04b` and the K-1 copy `e9fbc590…`; OE `review-oe.md` `63e7eed0…` and `continuity-export.corrected.test.tsx` `6e9c7def…`; C-FB002 `review-fb002.md` `d1fa0e42…` and `boundaries.corrected.test.tsx` `2e88c1db…`; C-FD1 `features-downstream.corrected.test.tsx` `7bb5ad3c…` (`c6d1ed4`).

## 6. E23 detail

- **Appearance (accepted `a560863`).** Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48: names, statuses and `oracle_sha256` equal to the Appearance final at `419e56d`. Frozen `continuity-export` 24/26 (006, 007), OE copy 26/26. `original` 187/187 = the accepted 185 plus exactly the two additive §11 cases `[shell-topbar] Topbar TP-RAIL-1/2`, all others same order and status. Parent host 33/33; package 11 files / 137, per file equal.
- **Features (accepted `ec55f9e`).** Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26, `original` 6: names and statuses equal; `downstream` per §4. Host 40/40, package 7/45 and reader tests 5/17 per file equal (readers against the Features final `5cd63ff`, the last run).
- **More (accepted `27adb10`).** `fields` 22, `reset` 20, `queues` 14, `owner-export` 13, `original` 15, `host` 11 equal; `boundaries` frozen 10/10 (recorded), corrected (C-FB002) 10/10, 0 RangeError.
- **Notifications (`ad223a2`) and Date & Time (`d0d934d`).** 11 + 3 + 2 + 4 + 10 + 11 = 41 Sol, Astra boundaries 24, Astra host 15, parent host 12; Date & Time 7. All equal.
- **Sticky (`699f6e6`).** 13 + 47 + 27 + 22 = 109, original 10, host 28; ordered titles and `oracle_sha256` equal.
- **Smart Lists, Collaborate, Pomodoro, Dashboard Header** (copies, §2.3): Smart Lists export 8, host 10, host-entry 3, host-wrapper 5, app 5, original39 39, original-parent 4, package 44/314; Collaborate contracts 37, host 8 (accepted `c604951`: 37, 8), package 314; Pomodoro departure 9, advanced 8, package 314; Header departure 5, advanced 5, followon 2. Per file equal to their accepted logs and to the `419e56d` controls.
- **settings-shell 11/54, settings-rest 44/314,** per file equal.

## 7. Required references

- **D1** (controller ruling at E6, dragenter accepts and the following dragover moves the preview): consistent with everything here. C-RD1 passes at `f9eb4b1` with its added `drop`; frozen case 014 fails only at its A7 precondition ("the drag-reorder persisted a changed rail order", i.e. no write without `drop`). The native D1 observation (E9, `ae7b69e`: 78 trusted drags, the preview never changes on `dragenter`) stands; the E24 native downstream drag (with `drop`, all modules visible, P6) passes with the accepted sequence.
- **F-E14-1** (non-blocking UX-05 follow-up: the 375 px source panel covers focused Settings sidebar rows): not re-judged; nothing in this batch observes it. The receipt `review-keyboard-f9eb4b1.md` hash is re-derived (E14).
- **K-1:** `review-k1.md` (`18a98325…`). No runner here sends `nativeVirtualKeyCode`; the E24 copy keeps the K-1 audit (1 = 1, 7 = 7).
- **OE / C-FB002 / C-FD1 / C-RD1:** §4. Judging copies OE, C-FB002 and C-RD1 all pass; C-FD1 runs beside them with its predicted outcome at both revisions.
- **R-PET:** judged in E13 (`55cf1e9`; new controls never covered, open panel never overlaps the pet). The E24 runs use the accepted Features harness with its pet handling unchanged; no product check failed. The rule itself is for final acceptance to confirm.

## 8. Development probes (disclosed; not gate evidence)

All in the session scratchpad: `verify-static` and three `verify-packages` smoke runs (shell-topbar-unchanged, storage-unchanged, shell-test at `f9eb4b1`; all passed first time); dry runs of `hash-evidence` and `compare-accepted` (the latter led to one fix before the official run: Appearance `original` now admits exactly the two additive TP-RAIL cases instead of requiring identical case lists); `probe-tar.mjs` (confirmed a 148 MB archive extracts with a large buffer, diagnosing the copy's root-depth defect). The first E23 host-suite copy attempt is described in §2.3 item 1.

## 9. New files (this commit; additions only)

143 files: the 141 classified in the hashes log, the hashes log itself and this receipt. By class (hashes log): E18 2, E19 1, E20 2, E21 7, E22 8, E21–E22 runner 1, E23 84 logs (including the comparison log), E23 host-suite copies and refusal transcript 22, E24 12, tools 2.
- **In this directory (87):** runners, copies, tools, `host-suites/`, logs, the hashes log and this receipt.
- **In existing runners' directories,** suffix `apprail-final-v1`: `web-appearance-recovery-sol` 8, `web-appearance-recovery-oracle-erratum` 1, `web-appearance-recovery-independent` 1, `web-appearance-recovery-final` 1 (+ 2 in `diagnostics/`), `web-features-recovery-sol` 8, `web-features-recovery-independent` 1, `web-features-recovery-final` 22, `web-features-recovery-native` 2, `web-apprail-order-recovery-sol` 3, `web-more-recovery-fb002/logs` 1, `web-sticky-recovery-sol` 5, `web-sticky-recovery-independent` 1.
- No existing file was modified or deleted (`tracked_files_modified=0`).

## 10. Not verified / limitations

- jsdom and headless Chrome only; synthetic auth; development build without StrictMode; not Tauri. The lockfile gate is a consistency check.
- E1–E17 are cited and hash-checked, not rerun (E15–E17 ran at `f9eb4b1` in `94b12ba`; E9–E14 native in `ae7b69e`, `55cf1e9`, `5c6bcd2`). Their screenshots were hash-checked, not re-inspected.
- Single runs per unit; timing-dependent defects cannot be excluded by one pass; the frozen More `boundaries` oracle remains nondeterministic (F-B002).
- The older host-suite runners have no lockfile gate or `@repo` guard of their own (unchanged in the copies); they resolved dependencies from this worktree's frozen-lockfile install.

## 11. Remaining boundary

CP-APPRAIL-01 stays `implementation_ready_for_review` until independent final acceptance (batch 65), which must reconcile every §14 gate and §15 item and confirm or overturn: the E23 host-suite copy (§2.3 item 1), the transport and E24 copy base, the §10.9 `localStorage` reading, D1, F-E14-1, R-PET and the earlier batch rulings. Acceptance would not close any 312 item and would not authorize deployment, release or Web→Desktop sync; any Desktop flow needs the ADR-0013 D3 gate.
