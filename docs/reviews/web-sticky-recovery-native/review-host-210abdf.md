# Sticky native host matrix: batch 9 receipt (fixed candidate `210abdf`)

Parent-role host verifier, executed by an independent Claude Opus 5.5 instance in an isolated detached worktree (it did not write the contract, the oracles or the implementation). Module `web`, control-plane item `CP-STICKY-01`, batch 9, 2026-10-03.

**This is verification only.** It is not acceptance. It changes no product file, contract, ledger, control plane or existing evidence. It closes no 312 item. It does not push, merge, deploy, release or sync Web→Desktop.

## Verdict

**FAIL: one product failure frozen (F1).** Every behavioural assertion of contract §9 rows a–l and beforeunload passed. That includes guarded Forward with key identity and same-field exactly-once release with history counters. The failure is a runtime error. When a held browser Back/Forward (POP) departure is released by the user's successful **Retry**, the shared `DepartureCoordinator` calls `blocker.proceed()` a second time, from a stale state. React Router rejects that call by throwing an invariant inside a React effect. This breaks the batch rule "runtime error 0" and the "release exactly once" intent of §9 row i step 4.

| Kind | Result |
| --- | --- |
| Preconditions (fixture / selector / fault armed) | 335 of 335 passed |
| Behavioural host checks (rows a–l, beforeunload) | 257 of 257 passed |
| Per-block runtime gates (console.error trace + default error element) | 36 of 40 passed; **4 failed**: c9, c10, c11 and i-pop (all Retry-released POP departures) |
| End gate `run:deferred-product-failures-zero` | failed (line 683); final record `pass:false`, 633 checks, 8 CDP runtime errors, 0 console warnings |

The runtime gates are recorded without stopping the run, so the whole matrix was observed in a single run. Any gate failure fails the run at the end gate.

## Commands and provenance

Inside the isolated worktree:

```sh
git checkout --detach 0772569acf740a2d48a1c4498c7653a18cf40336
git diff --name-only 210abdf HEAD -- apps packages package.json pnpm-lock.yaml   # empty
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<session scratch directory> \
  node docs/reviews/web-sticky-recovery-native/verify-host.mjs 210abdf host h1
# -> FAIL docs/reviews/web-sticky-recovery-native/native-210abdf-h1-host.log checks=633
#    error=run:deferred-product-failures-zero   (catch branch sets process.exitCode = 1)
```

Baseline record (log line 2):

| Item | Value |
| --- | --- |
| Requested → resolved | `210abdf` → `210abdf77562660372c47086db02bd21e870deb5` |
| Docs head | `0772569acf740a2d48a1c4498c7653a18cf40336`; product delta against docs head empty |
| Browser | Chrome/154.0.8037.97 headless (protocol 1.3); viewport 1280×813, dpr 1; Node v24.16.0; esbuild 0.28.1 |
| Lockfile gate | archive = dependencies = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` |
| Bundle | 629 inputs (559 from the archive, 69 third-party, 0 foreign); js `16b6bc784f27e63b65aafe8f8ed21c94bee1587dc09bc4ebd2f1fcc14e75e8d5`, css `4253982f…` (same CSS as batch 8) |
| Product hashes | Recorded for 13 files. The shared ones equal batch 8, for example `stickyPane.tsx` `721d7556…` and `departureCoordinator.tsx` `08e94607…`. |
| Reused batch-8 harness | Unchanged: `native.tsx` `db5807ef…ec68ad`, `verify-native.mjs` `14846f80…c9204` |

New files in this commit (SHA-256):

| File | SHA-256 |
| --- | --- |
| `native-host.tsx` (fixture) | `f9b091807b8fc74c5640fb43278b42cbc2c45ceedc3b5bea9ca607c841aacd83` |
| `verify-host.mjs` (runner) | `77996177fb470ebb7935db5a13becb2c08d2b48e6a30a2cc1bcf531d6db9f325` |
| `native-210abdf-h1-host.log` | `506c84e30ac57cb3698eb6eef8f3f3538764aec46863cb05b8f01850c7db8113` |

The fixture and runner hashes equal the ones the run itself recorded in its baseline.

## Method

**Composition.** The batch-8 composition is reused as a pattern in a new file:
- the production Shell with AppRail and Topbar;
- the production `webShellModuleRegistrations`;
- the production `ComposedSettings` sidebar, with `DepartureCoordinator` and `settingsDeparture`;
- the real Sticky pane, hook, engine and `accountScope`, from an immutable `git archive 210abdf`;
- the production `createBrowserRouter`, mounted through `RouterProvider` from `react-router/dom`, as in `apps/web/src/main.tsx`. Batch 8 used the `react-router` export. Both schedule blocker and POP state updates through `React.startTransition`.

**Instruments.**
- Attempt-level Storage counters, recorded before any fault decision.
- A value-specific `setItem` fault that refuses only the latest value.
- Real Web Locks. The fixture can hold `prefMutationLockName(key)` and can queue a "middle" request behind the engine's own request.
- `history.pushState` / `replaceState` wrappers (log, then delegate) and a popstate trace.
- A `router.subscribe` trace. A *commit* is a new router location key.
- History-stack integrity from two sources: CDP `Page.getNavigationHistory` entry ids, and Navigation API entry keys and ids.
- A `beforeunload` listener tracker.
- A sequence-stamped `console.error` trace and a detector for React Router's default error element.

**Input.**
- CDP trusted mouse and key events, each after a centre hit-test.
- Browser Back/Forward through CDP `Page.navigateToHistoryEntry`, which is the browser's own traversal rather than page script.
- One page-script `history.back()` case (c11).
- Programmatic intents through the production router.
- Sign-out through the real preflight `requestSettingsDeparture("sign-out")`.

## Row verdicts (line numbers refer to `native-210abdf-h1-host.log`)

**Row c history entries** (line 55):
- P = `/app/settings/date_time`, key `qpn3yawg`, state `{"token":"host-P"}`;
- S = `/app/settings/sticky`, key `yyxz18jh`, state `null`;
- X = `/app/settings/hotkeys`, key `tnx0s2ut`, state `{"token":"host-X"}`;
- CDP stack `[6 about:blank, 13 hotkeys, 15 date_time, 16 sticky, 17 hotkeys]`, current index 3.

| Row | Evidence | Verdict |
| --- | --- | --- |
| **a** Production sidebar | Record 357; checks 343–356; gate 358. A trusted, hit-tested click on the "Hotkeys" row at (297,664) opened the dialog "Unsaved Sticky Note draft" with buttons Stay / Export current draft / Discard local changes and leave. Location stayed on key `wxq6hrxf`, with 0 push/replace/commit. A second trusted click on "Date & Time" was ignored while pending. Discard-and-leave released the *first* intent once: one PUSH to `/app/settings/hotkeys`, the pushState key equal to the commit key, zero writes. | PASS |
| **b** AppRail / programmatic | AppRail "Tasks", trusted at (31,101): held, URL/history/pane/dialog kept (402; 396–401). `router.navigate("/app/tasks")`: held (412; 407–411). | PASS |
| **c** Back + guarded Forward | Back+Stay: observed `yyxz18jh` = S, 0/0/0, stack identical (73). Back+discard: observed `qpn3yawg` with state deep-equal P, one POP commit, 0 push/replace, 0 writes, stack identical at index 2 (88). Back+latest completion via lock release: P, 1 commit, popstate 1, font `small` written once (105). Guarded Forward+Stay: S, forward entry kept (127). Forward+discard: observed `tnx0s2ut` with state deep-equal X (142). Forward+latest completion: X, 1 commit, spacing `large` written once (160). `navigate(-1)`+discard → P (176). `navigate(1)`+Stay → S (191). Retry-released POP cases: c9 browser Back → P (213), c10 guarded Forward → X (235), c11 script `history.back()` → P (255). Each had 1 commit, 0 push/replace and 1 write, but its runtime gate **failed** (214, 236, 256). | Keys and stack PASS; Retry-released cases **FAIL** (F1) |
| **d** Relative navigation | d1 (438): `navigate("../hotkeys", {relative:"path", state:{token:"host-d1"}})` was held, then released by Retry. Result: one PUSH commit to `/app/settings/hotkeys` (key `a6m7xrqr`) with state deep-equal, one pushState whose `usr` is deep-equal, 0 replace. d2 (454): `navigate("../date_time", {relative:"path", state:{token:"host-d2"}, replace:true})`, released by discard. Result: one REPLACE commit, one replaceState with `usr` deep-equal, 0 push, history length and index unchanged, zero writes. Both targets are the path-relative resolution from the Sticky URL. | PASS |
| **e** Voluntary sign-out | Clean positive control: `true` with no dialog (460). With a draft: dialog, then Stay → `false`, location and draft kept (472; 464–471). Discard → `true` with zero writes (481). | PASS |
| **f** First same-turn intent | Route vs route: the first (`/app/settings/hotkeys`) wins, one commit, no `date_time` history call (493). Route vs sign-out: the later sign-out resolves `false` at once, and the held intent is the route (509). Sign-out vs route: the sign-out is held; discard → `true`; the route is dropped, with no commit (525). | PASS |
| **g** Stay / Escape / export | Stay keeps URL, history, pane and draft, the dialog closes, and a fresh sidebar intent prompts again (384; 369–383). A trusted Escape, with focus inside the dialog, does the same (392; 387–391). Dialog export keeps URL, history, pane *and* the dialog (deep-equal). The real download is `{"device":{"color":"mint"}}`, sha `3e43a942…`, the same bytes as batch-8 x1. The export made zero Storage attempts, created and revoked one URL, and removed the anchor (424; 418–423). | PASS |
| **h** Partial work | *Offscreen:* at 1280×420 the pane container `div.module.module-settings` was scrolled to 479 of 847. The color and font recovery blocks were offscreen before the trusted AppRail intent and while it was held, and the intent held (539). *Hidden:* `visibilityState` was `hidden` behind a foreground tab. A programmatic intent arrived and held, and was still held when visible again (547). *Repairing one of two* failing fields kept the hold (553). A *newer edit* held behind the real lock kept the hold after the second repair (562). When all work settled, the intent released once: one PUSH to `/app/tasks` (565). | PASS |
| **i** Same-field ordering, PUSH (sidebar, color) | Step 1/2: the predecessor `mint` was written while the latest `coral` was held behind the real lock and the middle request. Location `yyxz18jh`, dialog open, counters push 0 / replace 0 / popstate 0 / commits 0 (320; 315–319). Step 3: the latest `coral` was refused by the injected `setItem` fault (`denied-value`) after a read, so not as a conflict; still held, counters 0 (324; 321–323). Step 4: Retry gave exactly one PUSH commit to `/app/settings/hotkeys`, key `v3efedqr`, with one pushState of the same key, replace 0, popstate 0. The dialog closed and `coral` was written once (331; 328–330). Runtime gate clean (332). | PASS |
| **i** Same-field ordering, POP (browser Back, pin_default) | Step 1/2: the predecessor `false` was written while the latest `true` was held; counters push 0 / replace 0 / popstate 0 / commits 0, location `yyxz18jh`, dialog open (281; 276–280). Step 3: `true` was refused by the injected `setItem` fault; still held, counters 0 (285; 282–284). Step 4: Retry gave exactly one POP commit to `qpn3yawg` with state deep-equal P, push 0, replace 0, popstate 1. The dialog closed, `true` was written once, and the stack was identical (293; 289–292). Runtime gate **failed** (294). | Behaviour PASS; **FAIL** (F1) |
| **j** Discard all and leave | Dialog discard with five failing drafts: one PUSH commit (`mj948fut`), 0 replace, attempts reads 5 / writes 0 / removes 0, physical bytes unchanged, dialog closed, no unload listener (595; 587–594). The pane's "Discard all changes" during a held programmatic intent: released once, zero writes (613; 607–612). | PASS |
| **k** Epoch change | A→B cancels the held sidebar intent (no commit). The device draft survives and the warning is kept. A fresh B guard prompts again, and the old intent is never replayed (641; 626–640). B→locked resolves the held sign-out `false`; a fresh sign-out is guarded, Stay → `false` (654; 643–653). locked→A resets a held Back with no commit and the stack unchanged; a fresh Back is guarded (669; 658–668). | PASS |
| **l** Unmount | Unmount with a pending sign-out (680; 671–679): the root empties and the sign-out resolves `false`. The unload listener is removed (0 active, no warning, 0 handler attempts), the coordinator's `router.navigate` wrapper is removed, and nothing is written. Afterwards the preflight returns `true` and navigation commits with no blocker. | PASS |
| **beforeunload** | Source-only (`purple` bytes plus a throwing `getItem`): Reload-only alerts, no warning, 0 handler attempts, 0 listeners, sign-out `true` (26). Clean after Reload repair (36). Input-error-only (an injected `huge` option chosen by a trusted keystroke): field error, no warning, 0 listeners (44). With drafts it warns synchronously with 0 handler attempts and exactly one listener, for example c1 (73) and c4 (127). Checks 21–47. | PASS |

## Frozen product failure F1

**Summary.** Retry of a held POP departure makes a second, stale `blocker.proceed()` call in `DepartureCoordinator`, and React Router throws an invariant inside a passive effect.

**Reproduction (h1).** Four cases, the same in each:
1. A Sticky field save fails, and its draft is shown.
2. A departure is held by browser Back (c9, i-pop), guarded Forward (c10), or page-script `history.back()` (c11).
3. The user's trusted click on `Retry <Label>` succeeds.

**Observed.**
- Navigation is correct: one POP commit to the original entry, with its key and state; 0 push/replace; dialog closed; the value persisted once.
- Immediately afterwards, at the target path, React logs `Error: Invalid blocker state transition: unblocked -> proceeding`.
  - The message continues "The above error occurred in the <DepartureCoordinator> component … React will try to recreate this component tree from scratch using the error boundary you provided, RenderErrorBoundary".
  - React Router then logs "React Router caught the following error during render".
  - Evidence: gate lines 214, 236, 256 and 294; `product-failure` records 215, 237, 257 and 295.
- No default error element was detected in h1. React Router's `RenderErrorBoundary` clears its error when the location has changed.

**Call site.**
- Stack: `invariant` ← `updateBlocker` ← `Object.proceed` ← `bundle.js:52725`. All 8 captured runtime errors carry this frame; each is stored twice in the log, once in its `product-failure` record and once in the final record.
- A scratch rebuild with the identical configuration produced bundle SHA-256 `16b6bc78…`, equal to the h1 baseline. In that bundle, line 52725 is `apps/web/src/routes/modules/departureCoordinator.tsx:170`.
- That is the `blocker.proceed()` in the blocker effect (`:152–174`), on the branch for "blocker shown as blocked, no pending intent, guard current and not blocking".

**Expected.**
- Contract §9 row i step 4: the latest completion releases **exactly once**.
- §13 "Production host/native".
- Batch 9 harness rule: runtime error 0.

**Unaffected controls (same run).**
- POP released by lock completion (c3, c6), by discard (c2, c5, c7) or by Stay (c1, c4, c8).
- PUSH released by Retry (i-push, d1), lock completion (h), discard (a, f, j) or pane discard-all (j2).
- Epoch resets (k) and unmount (l).

**Likely mechanism.** This is inferred from source; it was not separately instrumented.
1. `useBlocker` returns the blocker from React-rendered router state, which `RouterProvider` updates inside `React.startTransition` (react-router 7.15.1).
2. Sticky's Retry path changes `draftVersion` twice. `retry()` calls `changed()` at `stickyPane.tsx:192`, and the successful `settle` calls it again at `:156`. The guard effect at `:251–267` re-registers on every `draftVersion` change.
3. `finishIntent` (`:97–106`, reached from `:182`) has already proceeded and cleared `intentRef`.
4. A later default-priority re-render, triggered by `setGuardVersion`, can still see the stale `blocked` blocker. It then reaches `:170` and proceeds a second time.
5. The router rejects the second proceed with the invariant.

**Impact.**
- An uncaught error is thrown in protected shared host code during a successful Retry-release of a held browser Back/Forward. React recreates the composed subtree through the nearest `RenderErrorBoundary`. In this fixture that is the root route's boundary, because the route table has no `errorElement`.
- Production declares `errorElement: <RouteErrorBoundary scope="app" />` on `/app` (`apps/web/src/routes/router.tsx:43`). That route was not exercised here.
- Development probe observation, not evidence (the probe log was not kept): one interleaving threw `proceeding -> proceeding` *before* the POP commit. It also logged React Router's "Error handled by React Router default ErrorBoundary", which means the default error element rendered until the POP completed.

**Ownership: not decided here.**
- The throwing statement is in the protected coordinator, under §11 (shared host). The trigger is the Sticky caller's guard re-registration on Retry.
- The §11 shared-defect route applies before any repair: frozen before oracle, Astra-role impact review, explicitly revised ownership, and affected accepted-caller reruns.
- Whether accepted callers are affected is untested here; other callers' suites were out of scope.

## Iterations, probes and cost

- **Evidence iterations:** 1 of 3 (`h1`). Work stopped after F1 was frozen, as the stop condition requires.
- **Development probes before `h1`** (not evidence; logs redirected with `XAI_HOST_EVIDENCE_DIR` to the session scratch directory, then deleted):
  - Probe 1: 418 checks passed, then the hidden-tab precondition failed because CDP focus emulation keeps a page "visible". Fixed by disabling focus emulation for that step only.
  - Probe 2: 537 checks passed, then the end gate caught the invariant.
  - Probe 3: added the error localisation; the error fired right after "Retry Pin by Default".
  - Also: one standalone visibility probe, and one scratch bundle-mapping rebuild (hash verified).
  - All three full probes reproduced the same invariant error.
- No visual or five-width runs, and no other callers' suites. Temporary profiles and downloads were deleted.

## Limitations

- Headless Chrome 154, not Tauri. React development build, without the production `StrictMode` wrapper. Reused dependency trees; the lockfile gate is a consistency check only.
- Synthetic accounts: generation markers are written by the fixture.
- Sign-out goes through the direct preflight `requestSettingsDeparture("sign-out")`, not the AvatarMenu or a live logout.
- `beforeunload` is synthetic (`BeforeUnloadEvent` cannot be constructed), plus the listener tracker.
- Browser Back/Forward uses CDP `Page.navigateToHistoryEntry`; no physical button was pressed.
- The fixture's route table is the minimal batch-8 one, without `errorElement`.
- EN only, at 1280×813, plus one 1280×420 step for offscreen recovery. The font select is focused by script before real keys. The hidden-document step disables CDP focus emulation.
- Precondition records 622, 628 and 645 display `"kind":"account"` or `"locked"` because a scope object's `kind` field was spread into the record. They are preconditions, and they passed.
- EN/ZH five-width visual, keyboard, focus-trap and screenshot checks belong to batch 10.
