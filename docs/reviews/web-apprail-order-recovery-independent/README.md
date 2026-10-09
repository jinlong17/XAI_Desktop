# AppRail order recovery: parent host before baseline (CP-APPRAIL-01, batch 57)

**Verdict: FROZEN.** This directory freezes the parent jsdom host before baseline for the AppRail order caller (`xai_rail_order`) in the production `App` composition, against the before product `419e56d`. It is contract r1 §15 item **E3** (§12 "Parent host baseline").

The result has 31 cases: 7 PASS and 24 correct business FAILs, with zero `PRECONDITION:` failures and harness 6/6.
- **H1, H2 and H9 are confirmed at the host layer.**
- The fixture cases and every positive control PASS.
- The F-B002 self-check passes.

This is evidence only. It changes no product source, product test, contract, prior evidence, ledger or control plane. It accepts nothing, does not authorize Terra and closes no 312 item.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent host verifier role, isolated worktree `.claude/worktrees/agent-a9b820e4551de44bc`. It did not write the contract, the Sol oracles or any product code |
| Docs base (detached HEAD) | `995060cc71feb954c84453905d5e059c264ec3da` (control plane batch 57); the log header records `runner_checkout_head=995060c…` (line 9) |
| Requested before revision | `419e56d` |
| Resolved commit / tree | `419e56de9f23e4467fea806fbd4a990e1f429941` / `7aabbd832be446aeca1441eff34f2fd35945290a` (log lines 2–3). Package trees (line 4): `xai-web-shell` `372b08be267a7dd7f734c8ff0c770a7ca3a87cf1`, `apps/web` `23f1070ec28841df45d13c12f0523e679f46dcba`, both equal to the contract header; Appearance `1fea1045…`, Features `3f25c84b…` |
| Authority | `../web-apprail-order-recovery-contract/contract.md` r1 (`f7726d7`, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`, re-derived). In particular R-1, A6, A7, A8, §5 (wording and selectors), §6, §7, §9 host rows a, d, g–l and o, §12 (parent host baseline, F-B002, seed and event-sequence rules, validity, H1, H2 and H9) and §15 E3. Also `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`, "本轮唯一任务" (batch 57) and the CP-APPRAIL-01 row |
| Conventions reused | `../web-appearance-recovery-independent/`: runner `6aac3563…`, fixture `ba137f58…`, and its accepted harness rulings: a memory data router over the production route table, and `RouterProvider` from `react-router` with one pinned instance. `../web-apprail-order-recovery-sol/` was read for the contract's selectors and seed choices. No Sol file is imported or executed |
| Iterations | 1 (`before1`, authoritative). No second or third diagnostic iteration was needed |

## Files and SHA-256

Every file in this directory except this README, which cannot carry its own hash.

| File | Role | SHA-256 |
| --- | --- | --- |
| `verify-fixed.mjs` | Runner | `646bf047a4634ce48100505fef0a351536864f2d4a3e23019215b7e5060618a8` |
| `host-fixture.tsx` | Fixture | `314e239146364ab291ecd6666aeca2b48afa6b41011d678339eb59f154800af6` |
| `host.test.tsx` | Oracle | `11e660998c5421e8b6f7b77b82db30543dad273ce5eab9c541ed0ae23e33b719` |
| `host-before1-419e56d.log` | **Authoritative** before log (947 lines) | `ee5f6e1d2aaafabec04f961ab5f1d091a1bb5ad47fe1794e8e6fa1a96812ebb3` |

The log header's `oracle_sha256` line (line 18) records exactly the three code hashes above, so the authoritative log was produced by exactly these files.

## Command

Run from the repository root of this worktree. The dependency root was read only: nothing was written, installed, built or checked out there, and no dev server was started.

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-apprail-order-recovery-independent/verify-fixed.mjs 419e56d host before1
# -> host 419e56d (419e56de9f23): vitest_exit=1 harness=PASS exit=1 cases=31 passed=7 failed=24 precondition=0
```

**Fixed rerun (E8).** Use the unchanged files with a new suffix, for example `… verify-fixed.mjs <fixed-sha> host fixed1`, and an `XAI_DEPS_ROOT` whose lockfile matches that revision; the runner refuses any other lockfile.

## Runner guarantees, lockfile and pin proof

`verify-fixed.mjs` is the accepted Appearance parent runner with only these changes, which `diff` confirms are confined to the header comment, the constants block and four names:
- the owned directory;
- the provenance list (40 modules, adding the Features filter and reader, the storage `registry.ts`, the shell `index.ts`, `registry.tsx` and `internal/dnd.ts`);
- the contract source table (contract r1 header, 13 files);
- the guard, temp-directory, cache and config names;
- a Features package-tree field in the header.

The archive, gate, pin, guard, refusal and exit-code logic is unchanged.

- **Immutable archive.** It expands `git archive <resolved commit>` into a fresh realpath temporary directory, deleted afterwards. No `xai-apprail-host-*` directory remained after the run.
- **Requested and resolved SHA.** `requested_revision=419e56d` and `resolved_commit=419e56de…` (log lines 1–2).
- **Lockfile gate.** All four values equal `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` (log lines 14–17): the contract gate, the dependency checkout's `pnpm-lock.yaml`, `git show 419e56d:pnpm-lock.yaml` and the extracted archive's lockfile.
- **Contract source equality.** `archive_file_sha256 (13/13 equal the contract r1 source table)` (line 19). It covers `AppRail.tsx` `6312caa1…`, `internal/dnd.ts` `a538b51f…`, `registry.tsx` `b621abbe…`, `Topbar.tsx` `87b24334…`, `Shell.tsx` `1f5fc6c7…`, shell `types.ts` and `index.ts`, `AppRail.test.tsx`, `Topbar.test.tsx`, `App.tsx` `24461a52…`, storage `registry.ts`, `layout.css` and `departureCoordinator.tsx`.
- **`@repo` pinned into the archive behind a guard.**
  - Every archive workspace gets a private `node_modules`: 448 read-only third-party links and 281 `@repo` links into the archive (line 21). 46 tsconfig `extends` were checked and none was unresolved (line 22).
  - 75 exact-match aliases map every `packages/*` export to its archive file (line 23).
  - A guard plugin fails the run if any module is transformed from the dependency checkout's or this checkout's `packages/`, `apps/` or `docs/` (line 24), or if an unaliased `@repo` import resolves outside the archive.
  - Result: `pin_unaliased_repo_imports=0` (line 944), `pin_required_provenance_missing=none` (line 945), and 627 archive modules loaded (line 947).
  - The oracle directory links one `react` 19.2.0, `react-dom`, Testing Library, user-event, `react-router` and `vitest` instance (line 20).
- **Harness checks** 6/6 PASS (lines 842–847): JSON report parsed; the reported files equal the include; config in effect (jsdom, globals, no setup file, root = archive); guard active; 40 required production modules loaded from the archive; no suite error.
- **Refuses to overwrite.** It checks before archiving, again before writing, and creates the log with an exclusive create.
- **Nonzero exit preserved.** `vitest_exit=1` and `exit=1` (lines 25 and 27). The runner exits 2 if Vitest exits 0 but a harness check fails.
- **Versions.** Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, Node v24.16.0 (line 12).

## Composition

The production `App` is mounted in the `apps/web/src/main.tsx` module order:
- the production route table `webHostRouteObjects` behind a fresh memory data router per mount, through `RouterProvider` from `react-router`;
- `ProtectedAppRouteElement` → `App` → `AccountStorageGate` → `AccountDataGate` → `CommandPaletteProvider` → `AppearanceProvider` + `WebShellProvider` + `Shell` (AppRail, Topbar), `DesktopPet` and `CommandPalette`; the `app` route's `errorElement` is `RouteErrorBoundary scope="app"`;
- the real AppRail with its legacy `usePref("xai_rail_order")` binding, the real Features filter, the real Appearance controller and sign-out step, and the real storage hooks, engine, registry, codecs and `accountScope`.

**The only synthetic input is `useWebAuthSession`.**
- Each case selects `App.handleSignOut`'s branch: `coordinator`, a generation coordinator that records its sign-outs, or `fallback`, with no coordinator and no client and a recorded `clearSessionStorage`.
- There is no network: fetch, XHR, WebSocket and EventSource refuse and are counted, at 0 (`FX3`, observation line 906).
- Not executed, as in the accepted precedent: the `AppProviders` component tree, `bootstrapObservability()`, `registerServiceWorker()` and StrictMode. The module-level production router is disposed unrendered.

**Instruments.** All are test-owned and none is a product input:
- the attempt-logging Storage injector (F-B002) with armed faults;
- an exclusive/shared FIFO Web Lock manager as `navigator.locks`;
- a `window.confirm` recorder with a queue of answers;
- a `window.location` stub that records `assign`/`replace`/`reload` and delegates reads;
- router-commit and `pushState`/`replaceState` counters;
- a runtime-error recorder and a cancelable `beforeunload` probe;
- an HTML5 drag driver that fires `dragStart` → `dragEnter` → `dragOver` → `drop` → `dragEnd` on the real rail nodes with one `DataTransfer` stub (contract §12 event-sequence rule).

**Seeds** (seed rule).
- Every custom order is `REVERSED`, all 14 rail ids reversed, which `seedOrder` asserts in-domain: distinct strings.
- Appearance keys stay absent. The Appearance draft is created through the accepted controller's own path: a Topbar theme choice "Dark" whose write is denied.
- Malformed seeds (`{}`, `1`) appear only in the four H1 cases, each asserting its "not iterable" class.

**The failed drag.**
- Every case drags `statistics` over `habits` (`REVERSED[0]` over `REVERSED[3]`). The expected dropped order P, and the fixed product's expected bytes `merge(S, R, P)`, are computed by the oracle's own `preview`/`display`/`merge`, written from contract §2, §6 item 2 and A2. No product helper is imported.
- A quota fault on `setItem("xai_rail_order")` is armed for every attempt, and each case requires it to have fired (`fired(…)`). This is valid on both products: `419e56d` attempts during `dragOver`, the fixed product at `drop`.
- The drag driver asserts that `dragStart` and `dragEnd` reach the product's handlers: the `dragging` class is applied, then cleared.

## Per-case results (`host-before1-419e56d.log`, lines 848–902)

| # | Case | Result | First failure line (log line) |
| --- | --- | --- | --- |
| 001 | FX1 F-B002 self-check | PASS | — |
| 002 | FX2 Web Lock fixture | PASS | — |
| 003 | FX3 composition and drivers | PASS | — |
| 004 | PC clean state, coordinator branch | PASS | — |
| 005 | PC2 clean sign-out, fallback branch | PASS | — |
| 006 | PC3 coordinator: an Appearance draft only, so the confirm list is exactly the Appearance text | PASS | — |
| 007 | PC3 fallback: the same | PASS | — |
| 008 | H2 alone: failed drag on `/app/tasks` | FAIL (H2) | 856: "the latest dropped order stays displayed …: expected [ 'statistics', 'countdown', … ] to deeply equal [ 'countdown', 'meditation', … ]" |
| 009 | H2 with-appearance | FAIL (H2) | 858: same |
| 010 | G-rail alone: AppRail click to Calendar | FAIL (H9) | 860: "the Topbar rail status … is shown on the destination: expected null not to be null" |
| 011 | G-sidebar alone: Settings sidebar to About | FAIL (H9) | 862: same |
| 012 | G-back alone: Back to `/app/tasks` | FAIL (H9) | 864: "… is shown after Back: expected null not to be null" |
| 013 | G-rail with-appearance | FAIL (H9) | 866 |
| 014 | G-sidebar with-appearance | FAIL (H9) | 868 |
| 015 | G-back with-appearance | FAIL (H9) | 870 |
| 016 | U alone: `beforeunload` | FAIL (H9) | 872: "a cancelable beforeunload warns on every route …: expected { …(2) } to strictly equal { …(2) }" |
| 017 | U with-appearance: `beforeunload` after the Appearance draft is discarded | FAIL (H9) | 874: "expected { warned: false, attempts: +0 } to strictly equal { warned: true, attempts: +0 }" |
| 018 | S-coordinator alone, Cancel | FAIL (H9) | 876: "one window.confirm with the rail text; Cancel resolves false …: expected { confirms: [], outcome: { …(3) } } …" |
| 019 | S-coordinator alone, OK | FAIL (H9) | 878: "expected { confirms: [], … }" |
| 020 | S-coordinator with-appearance, rail Cancel | FAIL (H9) | 880 |
| 021 | S-coordinator with-appearance, OK then OK | FAIL (H9) | 882 |
| 022 | S-coordinator with-appearance, OK then Cancel | FAIL (H9) | 884 |
| 023 | S-fallback alone, Cancel | FAIL (H9) | 886 |
| 024 | S-fallback alone, OK | FAIL (H9) | 888 |
| 025 | S-fallback with-appearance, rail Cancel | FAIL (H9) | 890 |
| 026 | S-fallback with-appearance, OK then OK | FAIL (H9) | 892 |
| 027 | S-fallback with-appearance, OK then Cancel | FAIL (H9) | 894 |
| 028 | H1 `{}` at `/app/tasks` | FAIL (H1) | 896: "`{}` at load must not render the route error boundary on /app/tasks: expected 'Route Error (app): prefOrder is not i…' to be null" |
| 029 | H1 `{}` at `/app/settings/appearance` | FAIL (H1) | 898 |
| 030 | H1 `1` at `/app/tasks` | FAIL (H1) | 900 |
| 031 | H1 `1` at `/app/settings/appearance` | FAIL (H1) | 902 |

The totals line (841) reads `cases=31 passed=7 failed=24 skipped=0 precondition_failures=0 suite_errors=0 unhandled_error_lines=0 runtime_error_lines=0`.
- Every failure is an `AssertionError` on a business assertion tagged H1, H2 or H9.
- No case failed on a `PRECONDITION:`, selector, fixture or harness error.
- No runtime error, unhandled error or rejection was recorded.

**Order of assertions in the route cases (010–015).** The "not held" route outcome is asserted first: one navigation, no departure dialog, the expected path. It **passed in every route case**, so each failure is the H9 status assertion that follows. The route outcome itself is recorded in the observation lines below.

## Host-layer outcomes for H1, H2 and H9

All three hypotheses are **confirmed** at the host layer in the production `App` at `419e56d`. None was refuted.

### H1: a not-iterable stored value crashes every `/app` route, with no UI repair

`{}` and `1` were seeded natively before load, on `/app/tasks` and `/app/settings/appearance`, then reloaded (unmounted and remounted). Every load and every reload rendered the `app` route error boundary, with no Topbar, no rail and no status, and the bytes were left unchanged with zero writes:
- line 939: `H1 {} at /app/tasks {"atLoad":{"path":"/app/tasks","routeError":"Route Error (app): prefOrder is not iterable","topbar":false,"rail":false,"railStatus":false},"afterReload":{… same …},"bytes":"{}","writes":[]}`;
- line 940: `{}` at `/app/settings/appearance`, the same;
- lines 941–942: `1` at both routes, the same.

The business failures are on lines 896, 898, 900 and 902. Settings is a child of the crashed `app` route, so no in-app repair path exists: the Appearance route itself shows only the error.

### H2: a failed drag is a silent no-op

After the denied write, the rail returns to the stored order instead of keeping the dropped order P. There is no rail status, the bytes keep the old order, and without an Appearance draft there is no unload warning.
- Line 912 (alone): `"P":["countdown","meditation","habits","statistics",…],"rail":["statistics","countdown","meditation","habits",…],"bytes":"[\"statistics\",…]","railStatus":false,…,"unload":{"warned":false,"attempts":0}`.
- Line 913 (with an Appearance draft): the same rail and bytes, `railStatus:false`. The only warning is the Appearance one: `appearanceStatus:true`, `unload.warned:true`.
- The business failures are on lines 856 and 858. Every route-case observation "after the failed drag" (lines 914, 916, 918, 920, 922 and 924) shows the same silent revert.

### H9: no rail status, no rail unload warning and no rail sign-out step

**Route outcome after a failed drag.** It is not held, and no rail status appears anywhere.

| Navigation | Alone | With an Appearance draft |
| --- | --- | --- |
| AppRail click to Calendar | Line 915: `"path":"/app/calendar","dialog":false,"navigations":1,…"railStatus":false` | Line 921: the same, with `appearanceStatus:true` |
| Settings sidebar to About | Line 917: `"path":"/app/settings/about","dialog":false,"navigations":1,…"railStatus":false` | Line 923: the same |
| Back to `/app/tasks` | Line 919: `"path":"/app/tasks","dialog":false,"navigations":1,…"railStatus":false` | Line 925: the same |

Navigation is correctly not held: the contract requires no route guard, and this assertion passed. The missing Topbar rail status on the destination is the business failure (lines 860–870).

**`beforeunload`.**
- **Alone** (line 926): `"onTasks":{"warned":false,"attempts":0},"onCalendar":{"path":"/app/calendar","warned":false,"attempts":0}`. No warning on either route, so nothing protects an unsaved rail order (failure on line 872).
- **With an Appearance draft** (line 927): `"withBoth":{"warned":true,"attempts":0}`. That warning comes from the accepted Appearance controller, so it does not discriminate.
- **After the Appearance draft is discarded** in its own pane ("Discard Theme"; zero rail attempts; line 928): `"railOnly":{"warned":false,"attempts":0}`. The rail draft alone is unprotected (failure on line 874).

**Sign-out from `/app/tasks` after a failed drag, both auth branches.** "Proceeds" means identity invalidated, redirect to `/` and one backend sign-out (coordinator) or `clearSessionStorage` (fallback).

| Case (answers queued) | Coordinator branch | Fallback branch | Fixed-product requirement (A6, §7.4) |
| --- | --- | --- | --- |
| Alone, Cancel `[false]` | Line 929: `"confirms":[]`, **proceeds**: `"identityInvalidated":true,"redirected":true,"backendSignOuts":1` | Line 934: the same | `[rail text]`, resolves false |
| Alone, OK `[true]` | Line 930: `"confirms":[]`, proceeds | Line 935: the same | `[rail text]`, then proceeds with zero rail writes |
| With Appearance, rail Cancel `[false]` | Line 931: `"confirms":["Some appearance changes are not saved. Sign out and discard them?"]`, stopped by the **Appearance** step | Line 936: the same | `[rail text]` only; Appearance never asked |
| With Appearance, OK then OK `[true,true]` | Line 932: `confirms` = [Appearance text] only, proceeds | Line 937: the same | `[rail text, Appearance text]`, proceeds |
| With Appearance, OK then Cancel `[true,false]` | Line 933: `confirms` = [Appearance text] only. The first queued answer (OK) went to the Appearance prompt, so sign-out **proceeds** | Line 938: the same | `[rail text, Appearance text]`, resolves false, rail draft discarded with zero writes, Appearance draft kept |

So at `419e56d` sign-out never shows a rail prompt. With no Appearance draft, the user is signed out with the unsaved rail order silently lost even when they intended to cancel. With an Appearance draft, the only prompt is the Appearance one. The business failures are on lines 876–894.

## Positive controls (PASS at `419e56d`)

| Control | Evidence |
| --- | --- |
| **PC** (case 004, coordinator) | <ul><li>Zero set/remove attempts on every key at mount (§5.1, row a). No rail status, and no unload warning (`{warned:false, attempts:0}`).</li><li>A successful drag makes exactly one rail write over the gesture, with bytes `merge(REVERSED, R, P)` = P (P6). The rail displays P, with no status and no warning (line 907: `"writes":["set:xai_rail_order=[\"countdown\",\"meditation\",\"habits\",\"statistics\",…]"]`).</li><li>A rail click to Calendar is one navigation with no dialog, and Back returns to `/app/tasks`.</li><li>Sign-out without drafts asks nothing and completes: line 908, `"confirms":[]`, `identityInvalidated`, `redirected`, `backendSignOuts:1`, with zero rail writes.</li></ul> |
| **PC2** (case 005, fallback) | Sign-out without drafts asks nothing and completes (line 909) |
| **PC3** (cases 006–007, both branches) | With an Appearance draft only, the confirm list is exactly the Appearance text, and Cancel stops sign-out (lines 910–911). This also proves that the Appearance-draft fixture and the confirm recorder work in both branches (contract row h) |

## F-B002 self-check

- **The rule as implemented.**
  - The wrappers on `Storage.prototype` record each attempt and then delegate exactly once to the captured native method.
  - An armed fault throws (`QuotaExceededError` for set, `SecurityError` otherwise) before delegating, so it never reaches storage.
  - The wrappers never call `accountScope.physicalKey`, `getPref`, `readRawPref`, another Storage method or any product helper. `xai_rail_order` and the Appearance keys are device keys (physical = logical), and the generation-marker key is precomputed before installation.
  - Seeds and byte reads use the captured native methods, outside the counters.
- **The self-check (case 001)** installs tripwires on `accountScope.physicalKey` and `accountScope.capture` and drives nine wrapper calls. One of them is the exact rail-order quota fault that the cases arm. Result (line 904):

  ```
  {"nested":0,"tripwire":0,"delegatedPerStep":[1,1,1,0,0,0,1,1,0],"threwPerStep":[false,false,false,true,true,true,false,false,true],
   …,"faultsFired":[1,1,1,1],"bytesAfterFaultedSet":null,"bytesAfterFaultedRemove":"3","sessionStorageLogged":false,"railBytesAfterFault":null}
  ```

  It equals the expected value, so the case PASSES.
- **Per-case guard.** A re-entrancy depth counter runs in every case, and `teardown()` throws a `PRECONDITION:` on any nested Storage call. None occurred in 31 cases.
- **Faults are real and proven to fire.** Every failed drag requires its rail fault's `fired` count to be at least 1 and the bytes to be unchanged. The FX3 driver probe (line 905) shows the denied attempt `set:xai_rail_order=[…]!threw` with `fired:1`. Every Appearance draft requires its theme fault to fire and the accepted Appearance status to appear.

## `PRECONDITION:` count

**0** (log line 841, `precondition_failures=0`). All 24 failures are business assertions.

## Iterations and disclosed development probes

- **Iterations:** one. `before1` is authoritative. No diagnostic correction, re-suffixed log or second archive run was made, so no `before2` or `before3` exists.
- **Development probes:** none. Before `before1`, the oracle and fixture were not executed anywhere, in scratch or otherwise. No reference or mutated product implementation was written. The only pre-run checks were `node --check` on the runner and reads of the `419e56d` sources through `git show`.

## Contract and source observations (none blocks freezing)

1. **Consistent with the source.** Contract §3 item 2 says `for (const id of prefOrder)` throws a `TypeError` for a non-iterable value. The archive's `AppRail.tsx` (`6312caa1…`, matching the contract) produces exactly "prefOrder is not iterable" in the `app` route boundary.
2. **`beforeunload` with both drafts cannot discriminate H9.** The accepted Appearance controller already warns. The oracle therefore discards the Appearance draft through its own pane and probes again (case 017). The fixed requirement is unchanged: the rail draft alone must warn.
3. **Queued confirm answers.** In the "OK then Cancel" cases, `419e56d` asks only the Appearance prompt, which consumes the first queued answer (OK), so sign-out proceeds. This is recorded as observed behaviour. It is not a contradiction: the business assertion compares the confirm list first.
4. **The route outcome is correct at `419e56d`.** A rail draft must never hold navigation (A6, §7.1). That part of row g passes at both products; only the status and the intact draft are H9 and H2 failures.

## Limitations

- **jsdom only.** Input is synthetic `fireEvent`, not trusted, and drags use a `DataTransfer` stub. `beforeunload` is detected as a canceled event or an assigned `returnValue`. Layout, hit-tests, R-PET, focus pixels and trusted CDP drags belong to native E4 and E9–E14.
- **Composition.** A memory data router stands in for `createBrowserRouter`, under the accepted harness ruling. `AppProviders`' tree, observability bootstrap, the service worker and StrictMode are not executed, and the auth session is synthetic.
- **Scope.**
  - English only.
  - One drag shape: all 14 modules visible, `REVERSED` seed, one hover step.
  - H1 covers only `{}` and `1` on two routes, as the parent baseline requires. The other §5 item 2 values, `/app/dashboard`, cross-document cases and the panel, focus, Retry, Discard and Export paths are Sol (E1/E2) and native (E4) scope.
- **Deeper assertions not reached at `419e56d`.** Each failing case stops at its first business assertion. The later assertions run for the first time on the fixed product (E8). Examples: the intact draft after navigation, the `[rail, Appearance]` lists, the discarded rail draft after OK then Cancel, and the D(DEFAULT, R) display with the source status after H1. Any later fixture correction must use a new suffix, rerun against both archives and never weaken an assertion (contract §12).
- **Timing on the fixed product.** Each case settles with 12 or 24 zero-delay timer turns after an action. If the fixed engine's lock-queued write needs more turns before the fault is observed, the fixed run would show a `PRECONDITION:` (the fault not yet fired), never a false business PASS or FAIL.
- **Dependency reuse.** Third-party dependencies come read-only from `XAI_DEPS_ROOT`. The lockfile gate is a consistency check only.
- **No static typecheck.** The runner has no typecheck mode, and the oracle files were not checked with `tsc`. Vitest's esbuild transform strips types without checking them.
