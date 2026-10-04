# Sticky actual-host fixed rerun at `210abdf` (CP-STICKY-01, batch 7)

**Verdict: PASS (independent rerun only).** The frozen actual-host oracle ran unchanged against an immutable `git archive` of the fixed candidate `210abdf`, and all 28 cases pass. The 23 correct before FAILs all pass now:
- H1 at host level, for each of the five fields;
- the H7 Settings sidebar route and voluntary sign-out, for each of the five fields;
- the seven H7 navigation forms and the `beforeunload` warning on `color`.

The two fixture checks and PC1–PC3 stay PASS. No case still fails, and no case newly fails.

This receipt is independent verification only. It is **not acceptance**. It implements and fixes nothing and modifies no existing file. It closes no 312 item: SET-12, REL-05, QA-01, QA-03, QA-04, QA-09 and D2/REL/AI stay open. The Chrome host/native batch, the final regression and the independent final acceptance still remain.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol verifier role for batch 7, in an isolated worktree on a detached HEAD. It is distinct from the host-baseline author, the Sol oracle author and Terra |
| Requested / resolved fixed revision | `210abdf` / `210abdf77562660372c47086db02bd21e870deb5`, as logged in the header |
| Requested / resolved before revision | `2023526` / `20235269749dad514833d76c27b958f694d0e4e9`, from the frozen `host-before1-2023526.log` (runner checkout `a6781f0`) |
| Runner checkout | `8db7d306dcd84c2090113019e1390635e05604ed`, recorded as `runner_checkout_head`. The worktree was clean before the run, and `210abdf` is an ancestor |
| Authority | `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`, "本轮唯一任务" (batch 7) and the CP-STICKY-01 "允许修改文件" row; `before-2023526.md` in this directory; `../web-sticky-recovery-contract/contract.md` §3.9, §5, §7, §9, §12 and §13 |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for both `XAI_DEPS_ROOT` and `git show 210abdf:pnpm-lock.yaml` |
| Runtime | Node `v24.16.0` (from the header), Vitest `v3.2.7`, jsdom |
| Iterations | One `fixed1` run. No environment failure occurred, so there is no `fixed2` |

## Command

Run from the repository root of the worktree:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-sticky-recovery-independent/verify-fixed.mjs 210abdf host fixed1
```

Console summary: `host: exit=0  Test Files  1 passed (1) |       Tests  28 passed (28)`. Runner exit status 0.

## Frozen integrity (checked before the run)

Every recomputed SHA-256 equals the value in `before-2023526.md`, "Files and SHA-256":

| File | SHA-256 (receipt = recomputed) | Result |
| --- | --- | --- |
| `host.test.tsx` (oracle) | `7a4d3ff0cb8c4b6087307c9c7369340a7acea4c00589e6375fa236fbb7f9e8f3` | OK |
| `verify-fixed.mjs` (runner) | `5a8ea1ddf40f47e5650e82656a174ef786403d418b1dd9f5a0553e0213da7260` | OK |
| `host-before1-2023526.log` | `12f882cc23df89675b51e6edb14f64360c844451c1f833b7b39aa4a8443b90c4` | OK |

- `git diff --name-only 07784c4 HEAD` is empty for this directory, so the frozen files are byte-identical to their freeze commit.
- The fixed log header's `oracle_sha256 host.test.tsx=7a4d3ff0… verify-fixed.mjs=5a8ea1dd…` equals the table. Before running, the runner also re-checked the SHA-256 of the oracle copy inside the archive.
- The Sol hashes are checked in `../web-sticky-recovery-sol/fixed-210abdf.md`.

## New log

| Log | SHA-256 | Lines | Header | Case lines | Summary | `stderr` |
| --- | --- | --- | --- | --- | --- | --- |
| `host-fixed1-210abdf.log` | `21c0dc19e39be9c9d3f9507fed3fecc3220feeefcc813c311bccc213266878a7` | 52 | L1–L12 | L17–L44 | L46–L47 | L52, empty |

The header records `requested_revision=210abdf`, `resolved_commit=210abdf77562660372c47086db02bd21e870deb5`, `runner_checkout_head=8db7d306…`, both lockfile hashes (`df05f2dd…`), the oracle and runner hashes, `node=v24.16.0` and `exit=0`.

## Results at `210abdf`, before → fixed

| Group | Cases | Before PASS/FAIL | Fixed PASS/FAIL | Transition | `PRECONDITION:` lines |
| --- | --- | --- | --- | --- | --- |
| FIXTURE validity | 2 | 2/0 | 2/0 | PASS→PASS | 0 |
| Positive controls PC1–PC3 | 3 | 3/0 | 3/0 | PASS→PASS | 0 |
| F-a, latest choice after a denied write [H1 host], five fields | 5 | 0/5 | 5/0 | FAIL→PASS | 0 |
| F-b, Settings sidebar departure [H7 route], five fields | 5 | 0/5 | 5/0 | FAIL→PASS | 0 |
| F-c, voluntary sign-out [H7 sign-out], five fields | 5 | 0/5 | 5/0 | FAIL→PASS | 0 |
| N-*, navigation forms and `beforeunload` on `color` [H7] | 8 | 0/8 | 8/0 | FAIL→PASS | 0 |
| **Total** | **28** | **5/23 (exit 1)** | **28/0 (exit 0)** | **23 FAIL→PASS, 5 PASS→PASS** | **0** |

- **Pairing.** Cases were paired by exact Vitest title, with the file prefix removed. The title set is the same at both revisions: no duplicate, missing or new title.
- **Non-passing cases at `210abdf`: none.** There is therefore no first assertion message to report.
- **Clean log.** The log reports no unhandled error or rejection, and no `TypeError` or Testing Library lookup error. The words "warn" and "error" appear only inside passing case titles. The `---- stderr ----` section is empty, and stdout has no console blocks.

### Fixed-only assertions now executed

`before-2023526.md` lists assertions that could not be reached at `2023526`. At `210abdf`, each one ran in the passing cases:
- **Route and URL.** The router and the URL stay on `/app/settings/sticky` after the held departure. This is `expectHeldThenStay`, used by F-b for all five fields and by the seven route forms N-rail, N-programmatic, N-back-pop, N-forward-pop, N-back-delta, N-forward-delta and N-relative.
- **Dialog.** The coordinator dialog named `Unsaved Sticky Note draft` is shown, never the "Smart Lists" fallback.
- **Stay.** Stay closes the dialog and keeps the route, the URL and the latest choice.
- **Sign-out.** In F-c, for all five fields, the outcome stays `"pending"` while the dialog is open and becomes `false` on Stay. The route and the latest choice are kept.
- **`beforeunload`.** In N-beforeunload, the event is canceled and the handler makes zero storage attempts.

### Proof the fault fired at `210abdf`

- **Fault precondition.** All 23 formerly failing cases go through `failedEdit` (`host.test.tsx` L320–L329). Its preconditions require three things:
  - an observed `setItem` attempt on the field's key with `threw=true`;
  - the seeded bytes still present afterwards;
  - no unsupported Web Lock request shape.

  The log has zero `PRECONDITION:` lines, so all 23 held.
- **Setup preconditions.** The `expectStickyReady` preconditions also held in every PC, F and N case: router and URL at Sticky, production sidebar and AppRail mounted, account A active, lock fixture installed, no dialog open, and all five seeded values present and displayed.
- **Legacy warnings.** The before receipt's third proof does not carry over. That proof was the product's 23 legacy `[plugin-web-storage] quota exceeded …` warnings.
  - The fixed pane writes through `usePrefAutosaveAsync` and no longer calls the legacy writer that printed them.
  - The fixed log has no console output at all.
  - Their absence is expected, and it is not evidence of a missing fault.

### Per-case before → fixed table

Line numbers refer to `host-before1-2023526.log` and `host-fixed1-210abdf.log`. The last column gives the hypothesis tag of the first failing assertion at `2023526`, or the role of a case that passed there.

#### `host`

| # | Case (exact Vitest title, file prefix removed) | Before `before1-2023526` | Fixed `fixed1-210abdf` | Before first-assertion tag |
| --- | --- | --- | --- | --- |
| 1 | FIXTURE storage injector fires before delegation and the Web Lock fixture is exclusive | PASS (L17) | PASS (L17) | fixture validity |
| 2 | FIXTURE jsdom browser history reaches the production router factory as a blockable POP | PASS (L18) | PASS (L18) | fixture validity |
| 3 | PC1 clean Sticky: zero Sticky writes at mount, no unload warning, sign-out and sidebar departure proceed | PASS (L19) | PASS (L19) | positive control |
| 4 | PC2 unfaulted edits of all five fields write exact unscoped bytes and departure then proceeds | PASS (L20) | PASS (L20) | positive control |
| 5 | PC3 clean Sticky: programmatic module navigation, browser Back and the AppRail leave or return freely | PASS (L21) | PASS (L21) | positive control |
| 6 | F-a 'color': a denied physical write keeps the latest choice displayed [H1 host] | FAIL (L22) | PASS (L22) | H1(host) |
| 7 | F-a 'font': a denied physical write keeps the latest choice displayed [H1 host] | FAIL (L24) | PASS (L23) | H1(host) |
| 8 | F-a 'pin_default': a denied physical write keeps the latest choice displayed [H1 host] | FAIL (L26) | PASS (L24) | H1(host) |
| 9 | F-a 'restore_size': a denied physical write keeps the latest choice displayed [H1 host] | FAIL (L28) | PASS (L25) | H1(host) |
| 10 | F-a 'grid_spacing': a denied physical write keeps the latest choice displayed [H1 host] | FAIL (L30) | PASS (L26) | H1(host) |
| 11 | F-b 'color': a Settings sidebar departure is held after a denied write [H7 route] | FAIL (L32) | PASS (L27) | H7(host) |
| 12 | F-b 'font': a Settings sidebar departure is held after a denied write [H7 route] | FAIL (L34) | PASS (L28) | H7(host) |
| 13 | F-b 'pin_default': a Settings sidebar departure is held after a denied write [H7 route] | FAIL (L36) | PASS (L29) | H7(host) |
| 14 | F-b 'restore_size': a Settings sidebar departure is held after a denied write [H7 route] | FAIL (L38) | PASS (L30) | H7(host) |
| 15 | F-b 'grid_spacing': a Settings sidebar departure is held after a denied write [H7 route] | FAIL (L40) | PASS (L31) | H7(host) |
| 16 | F-c 'color': voluntary sign-out is held and resolves false on Stay after a denied write [H7 sign-out] | FAIL (L42) | PASS (L32) | H7(host) |
| 17 | F-c 'font': voluntary sign-out is held and resolves false on Stay after a denied write [H7 sign-out] | FAIL (L44) | PASS (L33) | H7(host) |
| 18 | F-c 'pin_default': voluntary sign-out is held and resolves false on Stay after a denied write [H7 sign-out] | FAIL (L46) | PASS (L34) | H7(host) |
| 19 | F-c 'restore_size': voluntary sign-out is held and resolves false on Stay after a denied write [H7 sign-out] | FAIL (L48) | PASS (L35) | H7(host) |
| 20 | F-c 'grid_spacing': voluntary sign-out is held and resolves false on Stay after a denied write [H7 sign-out] | FAIL (L50) | PASS (L36) | H7(host) |
| 21 | N-rail color: an AppRail module button departure is held [H7 AppRail] | FAIL (L52) | PASS (L37) | H7(host) |
| 22 | N-programmatic color: programmatic module navigation is held [H7 programmatic] | FAIL (L54) | PASS (L38) | H7(host) |
| 23 | N-back-pop color: a browser Back traversal (POP through the blocker) is held [H7 Back] | FAIL (L56) | PASS (L39) | H7(host) |
| 24 | N-forward-pop color: a browser Forward traversal (POP through the blocker) is held [H7 Forward] | FAIL (L58) | PASS (L40) | H7(host) |
| 25 | N-back-delta color: programmatic history Back router.navigate(-1) is held [H7 Back] | FAIL (L60) | PASS (L41) | H7(host) |
| 26 | N-forward-delta color: programmatic history Forward router.navigate(1) is held [H7 Forward] | FAIL (L62) | PASS (L42) | H7(host) |
| 27 | N-relative color: path-relative navigation with state is held [H7 relative] | FAIL (L64) | PASS (L43) | H7(host) |
| 28 | N-beforeunload color: a cancelable beforeunload warns synchronously with zero storage attempts [H7 beforeunload] | FAIL (L66) | PASS (L44) | H7(host) |

## Boundary and D1

These are the same independent results recorded in full in `../web-sticky-recovery-sol/fixed-210abdf.md`.

- **Boundary: PASS.**
  - `git diff --name-only 2023526 210abdf -- apps packages package.json pnpm-lock.yaml` lists exactly the eight contract §11 files under `packages/plugin-web-settings-rest/`.
  - The §10 item 2 protected paths have an empty diff: storage, settings-shell, dashboard-widgets, cmdk, `apps`, `package.json` and `pnpm-lock.yaml`.
  - Apart from those eight files, everything this oracle mounts is therefore byte-identical to `2023526`. That includes the `@repo/xai-web-shell` `Shell`, and from `apps/web/src/routes/modules/` the `shellRegistrations`, `composedSettingsRegistration`, `departureCoordinator` and `settingsDeparture` modules. In the shared Settings-rest `styles.css` and `localI18n.ts`, the changes are additive and Sticky-scoped only.
- **D1 at `210abdf`: PASS.**
  - No new reader or writer of the five keys exists outside `stickyPane.tsx`.
  - The four changed production files make no raw Storage, `setPref`, `getPref` or `usePref(` call.

## Runner behaviour observed

- **Archive.** The run expanded `git archive 210abdf77562660372c47086db02bd21e870deb5` into `$TMPDIR/xai-sticky-host-*` and deleted it afterwards. No `xai-sticky-*` directory remains.
- **Dependency checkout.** It was only read. The mtimes of its existing `.vite`, `.vite-temp` and `.cache` directories (root, `apps/web` and Settings-rest) were identical before and after the batch.
- **Working tree.** After the run, `git status` showed only the new log besides the Sol logs.
- **Overwrite refusal** was not re-exercised, so that the mode had exactly one invocation. Batch 5 verified it.

## Limitations

- **jsdom, not Chrome or Tauri.**
  - Input is synthetic `fireEvent`. There is no hit-testing, keyboard, focus or responsive check.
  - jsdom's `History` traversal timing differs from browsers.
  - jsdom has no `BeforeUnloadEvent`, so a warning is detected as a canceled cancelable `Event`.
- **Reduced host.**
  - English only.
  - Destinations outside Settings are placeholders.
  - The route table is reduced rather than `webHostRouteObjects`, and the auth gates are not mounted.
  - The account is synthetic, and sign-out goes through the direct `requestSettingsDeparture("sign-out")` preflight.
- **Stay paths only.** The oracle exercises the dialog's Stay action only. Its export and discard-and-leave actions, and release after a later successful Retry, are not exercised here.
- **Left to the next batch (batch 8)**, under contract §9 and §13 "Production host/native":
  - trusted input for all 25 values;
  - `{pathname,key,state}` identity and guarded-Forward key identity, including exact replay of relative-navigation state and options;
  - same-field exactly-once release behind a real held per-key lock, with history counters (§9 row i);
  - first-intent arbitration, epoch cancellation and unmount (rows f, k and l), and Discard all and leave (row j);
  - native disk export (§8) and the EN/ZH five-width presentation.
- **Dependencies** are reused read-only from `XAI_DEPS_ROOT`. The lockfile gate is a consistency check only.

**Status.** This is independent verification only, not acceptance. No product, oracle, runner, before log, contract, ledger or control-plane file was modified, and no 312 item is closed.
