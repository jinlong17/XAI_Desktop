# F1 impact review: CP-STICKY-01 batch 10

- **Date:** 2026-10-03
- **Module:** `web`
- **Control-plane item:** CP-STICKY-01, batch 10, step 2 of the Sticky contract's shared-defect rule (§11).
- **Reviewer:** an independent Astra-role reviewer (design, risk and final decision), run by Claude Opus 5.5 in an isolated detached worktree. The reviewer did not write the Sticky contract, the oracles, the implementation or the h1 host verifier.
- **Fixed points:**
  - fixed candidate `210abdf77562660372c47086db02bd21e870deb5`;
  - F1 evidence from `019f451`;
  - review checkout `d113c6af60dee0aa8d7a1340818252b7eab341f4`, whose product tree is identical to `210abdf`.

> **Verdict.** Root cause is **class A**: a shared defect in `DepartureCoordinator`.
> - **Not a caller defect.** Sticky's guard re-registration follows the coordinator's only notification channel. Accepted callers use the same pattern, so the defect is not B, and therefore not C.
> - **Recommendation: Option A.** Repair only `apps/web/src/routes/modules/departureCoordinator.tsx`. This needs an explicit revision of the §11 protected surface first. Accepted callers are rerun afterwards. No Sticky-local change is recommended.
> - **Exposure.** The accepted **More** pane is **confirmed** exposed in Chrome. Collaborate's single-field Retry path is ruled out in Chrome. By code analysis, Notifications, Date & Time, Dashboard Header and Smart Lists are exposed through the same sequence.
> - **Scope of this review.** It repairs, accepts and revokes nothing, and closes no 312 item. No product file, contract, ledger, control plane or existing evidence was changed. Nothing was pushed, merged, deployed, released or synced Web→Desktop.

## 1. Inputs verified

**Worktree.**
- Clean, then `git checkout --detach d113c6a…`.
- `git diff --name-only 210abdf HEAD -- apps packages package.json pnpm-lock.yaml` is empty.
- The lockfile SHA-256 is `df05f2dd…9aeab9` in both the archive and `XAI_DEPS_ROOT`.

**The frozen F1 records are as stated.** In `../web-sticky-recovery-native/native-210abdf-h1-host.log`:
- lines 214/215 (c9), 236/237 (c10), 256/257 (c11) and 294/295 (i-pop) are failed runtime gates plus `product-failure` records;
- every one carries `Invalid blocker state transition: unblocked -> proceeding`;
- the end gate fails at line 683.

**The coordinator has not changed.**
- `departureCoordinator.tsx` has had no change since its extraction in `af32234`, which is an ancestor of every accepted product. Its SHA-256 is `08e94607…`, the same value h1 recorded.
- Between More's accepted product `7b216a3` and `210abdf`, these files are byte-identical: `morePane.tsx`, the coordinator, `composedSettingsRegistration.tsx`, `usePrefAsync.ts` and `prefMutation.ts`.
- The same holds for Notifications (`afbfb24`) and Date & Time (`d9d9fdd`): their pane file and the coordinator are byte-identical.

**Installed packages:** React and React DOM 19.2.0; react-router 7.15.1.

## 2. Root cause (Q1)

### 2.1 Mechanism

Each step below has file:line evidence. Third-party lines refer to `node_modules/.pnpm/react-router@7.15.1…/dist/development/chunk-4N6VE7H7.mjs` (RR) and `react-dom@19.2.0/cjs/react-dom-client.development.js` (RD).

1. **The coordinator works from a React-state snapshot.**
   - `useBlocker` is called at `departureCoordinator.tsx:86–91`.
   - RR returns `state.blockers.get(key)` from `useDataRouterState`, which is React-rendered state, not the live router (RR `:6402–6440`, provider value `:6853`).
   - `RouterProvider` applies every router update through `React.startTransition(() => setStateImpl(newState))` (RR `:6701–6713`).
2. **Router blocker objects are replaced on every transition.**
   - A blocked POP creates a new object whose `proceed()` calls `updateBlocker(key, {state:"proceeding"})`, then `history.go(delta)` (RR `:1576–1601`, `:1584–1592`).
   - `updateBlocker` throws unless the *live* state allows the transition (RR `:3129–3138`).
   - `completeNavigation` resets every blocker to `IDLE_BLOCKER` (RR `:1713–1717`).
3. **React 19.2 can render default-priority work while the router transition is still pending.**
   - Sync and default lanes render without pending transition lanes (RD `:976–978`, `lanes & 42`).
   - Updates made inside passive effects get DefaultLane (RD `:18365–18369`).
   - Passive effects of a non-sync commit run later, in their own Scheduler task (RD `:17914–17926`).
   - A popstate transition is rendered eagerly, and it first flushes any pending passive effects (RD `:18825–18833`, `:22129–22138`, `:18968–18969`).
4. **The coordinator replays its blocker effect whenever a guard registers.**
   - `registerDepartureGuard` bumps `guardVersion` on registration and on unregistration (`:64–73`).
   - The blocker effect (`:152–174`) depends on `[blocker, guardVersion, publishIntent]`. It has no check that `blocker` is still the router's live blocker, and nothing marks it as already consumed.
   - With no pending intent and a current guard that no longer blocks, it calls `blocker.proceed()` at **`:170`**.
5. **The release itself goes through the intent effect.**
   - The intent effect (`:175–183`) calls `finishIntent(intent, true)` as soon as `isBlocking()` reads false.
   - `finishIntent` (`:97–107`) clears `intentRef` and calls the bound `blocker.proceed` (`:102`). That is the first, correct proceed.
6. **The Sticky trigger is two guard notifications for one Retry.**
   - `retry()` calls `changed()` at `stickyPane.tsx:192`.
   - The engine requests its Web Lock synchronously inside the click (`prefMutation.ts:153`, `accountCoordination.ts:16`).
   - A successful `settle()` clears the draft ref synchronously (`:154`) and calls `changed()` again (`:156`).
   - The guard effect re-registers on every `draftVersion` change (`:253–267`). The comment at `:251–252` says this is how "the host re-evaluates a held departure on completion".

### 2.2 Observed sequence

The instrumented Chrome run shows the full sequence. The excerpt below is from `f1-210abdf-sticky-s1.log` record 27 (r1). One global sequence number orders every event. The `blocker#` numbers are router object identities.

```text
50 click Retry Pin by Default                        (trusted)
51 lock-request xai:pref:v1:xai_pref_sticky_pin_default
52 react-commit p1 (sync)    coordinator blocker#2:blocked gv=7          -> Sticky re-registers (:192 notification)
54 react-commit p3 (default) coordinator blocker#2:blocked gv=9 (fresh)  -> passive effects deferred
56 set false ok                                       (lock granted; settle() clears the draft ref, :156 pending)
59 PROCEED blocker#2 live=#2:blocked                  (gv=9 intent effect: isBlocking() already false -> finishIntent :102)
60 router blockers=[3:proceeding]                     (new object; React receives it only in a transition)
62 react-commit p3 coordinator blocker#2:blocked gv=9  iv=2 live=#3:proceeding  STALE
64 react-commit p3 coordinator blocker#2:blocked gv=11 iv=2 live=#3:proceeding  STALE  (settle's re-registration)
65 popstate /app/settings/date_time
66 router POP date_time blockers=[1:unblocked]
67 PROCEED blocker#2 live=#1:unblocked THREW Invalid blocker state transition: unblocked -> proceeding
77 console.error … The above error occurred in the <DepartureCoordinator> component …
79 react-commit coordinator blocker#1:unblocked gv=0 iv=0   (subtree recreated by RenderErrorBoundary)
```

**What the trace shows.**
- Commit 64 combines a **stale** `blocked` snapshot with a **new** `guardVersion`.
- Its passive effects are flushed by the eager popstate render. The blocker effect then takes the `:170` branch on blocker #2, which is the object the coordinator already proceeded at seq 59.
- **Stack.** The thrown error's caller frame is `bundle.js:52725:15`. A scratch rebuild with the same configuration produces the same bundle SHA-256 (`a07bffea…`), and in it line 52725 is `blocker.proceed();` inside `if (!guard.isBlocking())`, which is `departureCoordinator.tsx:170`.
- **Error variants.** If the stale commit's passive effects run *before* the popstate, the same call throws `proceeding -> proceeding`. That matches h1's development-probe observation.

### 2.3 Why the other releases did not fail

| Release | Why it did not fail at `210abdf` |
| --- | --- |
| PUSH (sidebar, AppRail, programmatic, relative) | `wrappedNavigate` holds the intent (`:118–132`), so the router blocker never becomes `blocked`. Structurally immune. |
| POP by lock completion (h1 c3, c6) | There is one notification. The re-registration that releases is the last guard change, so no `guardVersion` change follows the proceed. Stale commits happen but carry no `guardVersion` change. |
| POP by discard (h1 c2, c5; d1 in every run here) | The proceed runs in the click. The re-registration from `discardAll` is a pending default update, but the release popstate arrived before it rendered: d1 seq 117–126 show a stale sync commit with an unchanged `gv`, then the popstate, then an eager commit with a fresh blocker. **This window is latent and timing-dependent, not structurally closed.** |
| POP by Stay | `reset()`. Nothing re-registers in the window, so there was no replay. A coincident notification would hit a sibling hazard (§5.1). |

### 2.4 Classification

**The defect is class A.**
- The non-idempotent statement is the coordinator's own `blocker.proceed()` at `:170`. It runs on a snapshot whose router transition the coordinator itself consumed at `:102`.
- React Router 7 applies blocker state inside transitions, and the coordinator keys a side-effecting effect on default-priority state (`guardVersion`). It must therefore tolerate stale snapshots, and it does not.

**It is not class B.**
- A held intent is re-evaluated only when `guardVersion` or `intentVersion` changes (`:175–183`), and `guardVersion` changes only through registration (`:64–73`). Re-registering on a draft change is the only way a caller can make the host release on completion.
- The API (`PaneDepartureGuard` and `registerDepartureGuard: (guard) => () => void`, `plugin-web-settings-shell/src/types.ts:44–54`) and the settings-rest `docs/api.md` set no "register once" rule and no "no re-registration while pending" rule.
- The same shape appears in More `:100`/`:83`, Notifications `:50`/`:47`, Date & Time `:88`/`:62` and Dashboard Header `DashHeader.tsx:425`/`:402`.

**So it is not class C either.** The defect tracks a host ordering hazard, not Sticky behaviour:
- the code-identical More pane fails the same way (§3);
- Collaborate, which notifies once per Retry, passes.

## 3. Exposure (Q2)

All registrants use the same component, `apps/web/src/routes/modules/departureCoordinator.tsx`:
- the Settings panes through `composedSettingsRegistration.tsx:78`;
- Pomodoro through `pomodoroRegistration.tsx:12`;
- Dashboard Header through `dashboardRegistration.tsx:34`.

The exposure condition is: a POP is held, then released through `finishIntent` by a completion, and a further `guardVersion` change renders before React renders the router transition.

**Sticky (frozen caller).**
- **Status:** confirmed in Chrome.
- **Shape:** Retry `changed()` `:192`, then settle `changed()` `:156`. Guard `:253–267`.
- **Evidence:** h1 c9, c10, c11 and i-pop; s1 r1 and r2 FAIL with the F1 signature, d1 passes (records 25–27, 61–63).

**More (accepted).**
- **Status:** confirmed in Chrome.
- **Shape:** Retry `changed()` `morePane.tsx:100`, then settle `changed()` `:83`. Guard `:126`.
- **Evidence:** m1 r1 and r2 FAIL with the same signature: proceed #2 on the stale `blocker#2`, `unblocked -> proceeding`, `<DepartureCoordinator>` recreated (records 25–27, 61–63). Business checks pass: exactly one POP commit to P's key and state, zero push/replace, latest written once, dialog closed. d1 passes. The files on this path are byte-identical to accepted `7b216a3`.

**Notifications (accepted).**
- **Status:** exposed by code analysis; not reproduced (cost cap).
- **Shape:** Retry `changed()` `notificationsPane.tsx:50`, then settle `changed()` `:47`. Guard `:56`. Lock-based `usePrefAutosaveAsync` (`:26–28`).
- **Evidence:** retry, settle and guard follow the same two-notification sequence as More and Sticky.

**Date & Time (accepted).**
- **Status:** exposed by code analysis; not reproduced.
- **Shape:** Retry `changed()` `dateTimePane.tsx:88`, then settle `changed()` `:62`. Guard `:143–154`.
- **Evidence:** same as Notifications.

**Collaborate (accepted).**
- **Status:** ruled out for single-field Retry (Chrome); latent for overlapping completions.
- **Shape:** Retry does not call `changed()` (`collaboratePane.tsx:78–83`). Success calls `changed()` once (`:59–64`). Guard `:148`.
- **Evidence:** c1 r1, d1 and r2 all pass. The timeline shows one stale commit (iv only, gv unchanged at 7) after the proceed, then the popstate, so there was no replay (records 27, 45, 63).
- **Residual risk:** two fields completing close together would add a second notification.

**Pomodoro (accepted).**
- **Status:** single-draft Retry ruled out by analysis; multi-draft Retry unknown (latent).
- **Shape:** `retryDrafts` (`usePreferenceDepartureRecovery.ts:89–103`) does not notify at start, and each success calls `changed()` (`:96`). Guard `:156–171`.
- **Evidence:** one draft gives the single notification Collaborate already passes with. `retryDrafts` retries every failed draft, so with two or more, separate completions can add a second notification after the proceed.

**Dashboard Header (accepted).**
- **Status:** exposed by code analysis; not reproduced.
- **Shape:** Retry (`DashHeader.tsx:589`) calls `submit(…, true)`, which notifies at `:425`. `settleOperation` notifies at `:402`. Guard `:784–798`.
- **Evidence:** `hasLiveCurrentDraft` (`:684–694`) reads refs that settle clears synchronously, and a POP away from `/app/dashboard` is held. That is the Sticky/More shape.

**Smart Lists (accepted under §11; not in the batch list).**
- **Status:** exposed by code analysis on any successful release, Retry or lock completion; not reproduced.
- **Shape:** re-registration on `status` and on `hasDraft` (`smartListsPane.tsx:167`). The draft is cleared in a passive effect when status is `saved` (`:101–107`). Retry is at `:192`.
- **Evidence:** the `hasDraft` re-registration is scheduled in the same flush, *before* the coordinator's intent effect proceeds. This does not depend on the lock race. Accepted host evidence covers only Back with Stay or Discard.

The accepted evidence never ran a Retry- or completion-released POP under a runtime-error gate for these callers. More B2 covered only PUSH, and Smart Lists Back covered only Stay and Discard. The exposure is therefore a coverage gap in that evidence, not a contradiction of it.

## 4. Correct oracle (Q3)

### 4.1 Business assertions any fix must satisfy

**Case.** A held browser Back or guarded Forward (POP) departure, including page-script `history.back()`. It is released by a successful trusted Retry, and the same assertions apply to a release by latest-operation completion.

1. **Exactly one** router location commit, with action `POP`, to the intended entry. `{pathname, key, state}` must deep-equal the recorded entry.
2. Zero `pushState` and zero `replaceState`. Exactly one release `popstate`. The browser history stack is unchanged: CDP entry ids and Navigation API entries, with the current index at the target.
3. The latest value is written **once**, with `outcome:"ok"`. The dialog is closed and the unload listener removed.
4. The blocked transition is consumed **exactly once**:
   - one `proceed()` on the held blocker, made while that object is the router's live `blocked` blocker;
   - zero `reset()`;
   - no blocker call throws.
5. **Zero runtime errors:**
   - no `console.error` and no uncaught exception (CDP);
   - no React Router default error element;
   - no "error occurred in the <DepartureCoordinator> component" recreation, and no remount of the composed subtree.
6. **Generalised invariant**, which also covers the latent discard and Stay windows: no bind, proceed, reset or publish is ever made from a blocker snapshot that is not the live `blocked` blocker. In the F1 runner this means no blocker call with `liveBlocker ≠ blocker` or `liveState ≠ "blocked"`.

**Unchanged.**
- Every already-passing behaviour of contract §9 rows a–l and beforeunload: PUSH Retry, relative replay, lock completion, discard, Stay, Escape and export, first-intent arbitration, sign-out, epoch, unmount.
- The h1 matrix must pass all 40 runtime gates and its end gate.

### 4.2 Minimal before-reproduction, frozen at `210abdf` by this commit

```sh
XAI_DEPS_ROOT=<checkout with node_modules> XAI_NATIVE_TMPDIR=<scratch> \
  node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs 210abdf sticky <suffix>   # frozen as s1
XAI_DEPS_ROOT=… node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs 210abdf more <suffix>       # frozen as m1
XAI_DEPS_ROOT=… node docs/reviews/web-sticky-recovery-f1/verify-f1.mjs 210abdf collaborate <suffix> # control, c1
```

**Result at `210abdf` (frozen).**
- `sticky` and `more` FAIL: r1 and r2 fail `blocker-proceed-exactly-once-from-blocked` and `zero-runtime-errors-no-error-boundary`; d1 passes.
- `collaborate` PASSES.

**Required after a correct fix.**
- All three modes PASS. In each mode r1, d1 and r2 pass, with zero blocker calls from non-live snapshots.
- h1 (`../web-sticky-recovery-native/verify-host.mjs <fixed> host <suffix>`) PASSES.
- The runner, fixture and prelude must be reused **unchanged**, so their SHA-256s match the frozen logs.
- New registrant modes (Notifications, Date & Time, Header, Smart Lists) belong in a new runner file. Its own before-logs must be frozen at `210abdf` first.

**Optional.** A coordinator-level jsdom regression that forces the interleaving: stale `blocked` snapshot, then `finishIntent`, then a further registration. Use it only if it can be made deterministic. The Chrome runner stays authoritative.

## 5. Ownership and file boundary (Q4)

### 5.1 Option A: shared coordinator repair (recommended)

**Product file.** `apps/web/src/routes/modules/departureCoordinator.tsx` only. Also one new coordinator test file under `apps/web/src/routes/modules/__tests__/` (for example `departureCoordinator.test.tsx`).

**Unchanged files.**
- Every caller: Sticky (`stickyPane.tsx` stays at `721d7556…`), More, Notifications, Date & Time, Collaborate, Smart Lists, Pomodoro and Header.
- `settingsDeparture.ts`, the composition files, the storage engine and the React Router dependency.

**Protected-surface revision the control plane must authorise.**
- Contract §11 protects "the `apps/web` host, coordinator, `settingsDeparture`, composition and auth".
- The control plane should record an explicit ownership revision: an independent shared-defect repair window may edit `departureCoordinator.tsx` and add that test.
- The revision should restate:
  - the invariant below;
  - that caller files stay unchanged;
  - that the frozen before evidence is h1 plus s1 and m1;
  - the rerun list.
- The Sticky contract's "Terra may edit only" list stays as it is.

**Invariant to implement.**
- The coordinator may bind, proceed, reset, or publish an intent from a blocker only while **that exact object** is the router's live `blocked` blocker.
- Each blocked transition is proceeded or reset at most once.

**Suggested shape** (the repair window decides):
- an identity check against `dataRouterContext.router.state.blockers` at the top of the blocker effect;
- the same check before a bound POP `proceed`/`reset` is invoked from `finishIntent` and from the unmount cleanup;
- or a consumed-blocker `WeakSet`.

This is sound because RR 7.15.1 creates a new object for every transition: `updateBlocker` literals, `IDLE_BLOCKER` on reset and on commit.

**Rejected approaches.**
- Timing workarounds: `flushSync`, `setTimeout`, ordering tricks.
- Changes to caller APIs.
- Removing `guardVersion` from the effect dependencies as the only change. That would hide F1, but the `:165–171` branches are legitimate for fresh snapshots, and the change does not express the invariant.

**Sibling hazards covered by the same invariant.**
- A Stay followed by a coincident notification would republish an intent bound to a stale `proceed`. The dialog would reopen, and a later leave would throw.
- A stale `reset()` could clobber a newer blocked POP.

**Reruns required.** These follow the `../web-date-time-recovery-independent/shared-96c4915.md` precedent and must all pass on the fixed candidate.

| Caller | Required reruns |
| --- | --- |
| Sticky | `verify-f1.mjs` sticky; h1 host matrix; batch-8 native controls and export (the dialog export path goes through the coordinator); Sticky ST, NH and composition tests. |
| More | `verify-f1.mjs` more; More B2 (`web-more-recovery-evidence/verify-gaps.mjs … b2-host-ordering`); the More native host runner (`web-more-recovery-native/verify-native.mjs` host modes). |
| Collaborate | `verify-f1.mjs` collaborate (regression control); the Collaborate Astra-final runner (pinned contracts, host8, additional). |
| Notifications, Date & Time | Their native host suites (Date & Time: all 16 native modes). Plus a new F1-mode run frozen before at `210abdf` and passing after. |
| Smart Lists | Host native modes (back, back-programmatic, same-turn, cleanup, journey). Plus a new F1-mode run for both completion and Retry release, frozen before and passing after. |
| Pomodoro | Actual-host departure suite and the independent assertions. A multi-draft Retry-released POP case is recommended. |
| Dashboard Header | The independent departure runner and the native departure suite. Plus a new F1-mode run frozen before and passing after. |
| Packages | `@repo/web` check-types, lint and tests (including `settingsPaneComposition.test.tsx` and `shellRegistrations.integration.test.tsx`); settings-rest, pomodoro and dashboard-grid package tests. |

**Risks of Option A.**
- One shared host change touches three routes (Settings, Pomodoro, Dashboard) and eight registrants. The rerun list mitigates this.
- An over-strict check could drop a legitimate fresh-snapshot action. A unit test should pin the identity semantics.
- A future react-router upgrade could change blocker identity. Keep the F1 runner as a regression oracle.

### 5.2 Option B: Sticky-local repair (not recommended)

**What it would be.** A change inside the §11 Sticky files, for example dropping `changed()` at `stickyPane.tsx:192` or deferring re-registration. It would probably make Sticky's *single-field* Retry-released POP pass in this Chrome, because it reproduces Collaborate's single notification.

**Why not.**
- **It is not the root cause.** The non-idempotent replay and the throwing statement stay in the coordinator.
- **Sticky stays exposed** to any second notification after the release proceed. Examples: two failing fields completing close together (the h "repair one of two" path followed by the second completion), Retry plus lock completion, or a newer edit settling.
- **More stays exposed, confirmed in Chrome.** So do Notifications, Date & Time, Header, Smart Lists and multi-draft Pomodoro.
- **It ties Sticky to scheduling.** Correctness would depend on Chrome and React scheduling, and Sticky would diverge from the accepted callers' pattern.

Option B is not a fix and not a useful stopgap.

### 5.3 Recommendation and sequence

Use Option A alone:

1. The control plane records the ownership revision for the coordinator, with the invariant, the files and the reruns.
2. An independent repair window edits only `departureCoordinator.tsx` and adds the test.
3. After-evidence: `verify-f1` sticky, more and collaborate PASS, and h1 PASSES.
4. Affected accepted-caller reruns (§5.1).
5. Only then the remaining Sticky work resumes: five-width visual, final regression, acceptance.

## 6. Accepted-caller status advice (Q5)

- **No acceptance should be revoked.** In every observed case the user-visible business outcome was correct: right entry, one commit, one write. The defect is a shared host runtime error, and none of the accepted evidence exercised it.
- **More.** Record "F1 exposure **confirmed** at `210abdf` (`f1-210abdf-more-m1.log`): shared coordinator defect, acceptance retained, gated on the batch-11 coordinator fix plus the More reruns in §5.1". This holds for `7b216a3` too, because the path files are identical.
- **Notifications, Date & Time, Dashboard Header, Smart Lists.** Record "F1 exposure indicated by code analysis; Chrome before-evidence to be frozen in batch 11; acceptance retained; gated on the reruns".
- **Collaborate.** Record "single-field Retry release ruled out in Chrome (`f1-210abdf-collaborate-c1.log`); shares the coordinator, so rerun after the fix as a regression control".
- **Pomodoro.** Record "single-draft Retry ruled out by analysis; multi-draft Retry latent; rerun after the fix".
- **CP-STICKY-01** stays `diagnosis_needed` until the control plane registers batch 11. This review does not change any status.

## 7. Production impact (inference, not exercised)

- **Navigation and persistence were correct** in every observed failure.
- **What the user sees depends on ordering.** The thrown invariant makes React recreate the subtree up to the nearest error boundary. In production, `/app` has `errorElement: <RouteErrorBoundary scope="app" />` (`apps/web/src/routes/router.tsx:43`).
  - **After-commit ordering** (every run here and in h1): React Router's boundary resets on the location change, so no error UI appeared (`errorUi` was 0).
  - **Before-commit ordering** (`proceeding -> proceeding`): the app-level error element would render until the POP commits, and it calls `reportRouteError` (`RouteErrorBoundary.tsx:24`). That means a visible flash and an error report.

## 8. Reproduction harness and evidence (this commit)

All files are new, under `docs/reviews/web-sticky-recovery-f1/`.

| File | SHA-256 |
| --- | --- |
| `f1-prelude.js` (React DevTools-hook commit observer) | `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670` |
| `f1-host.tsx` (fixture) | `af969a73dc25a88fd8399883a5cb8321b6613ec3729c2164a92d8c1d4518f734` |
| `verify-f1.mjs` (runner) | `816bd261a6bb6d72ad36322a898678a7f1f8d62173ca40f0f9d4cdf44f44c527` |
| `f1-210abdf-sticky-s1.log` | `3a331f56d9d01d35d8dca88e0cf47bba94a02b0eba9dc456992245676b083616` |
| `f1-210abdf-more-m1.log` | `a42501b23a0d9406047b456ea5746401434b84dc1b4deee8396692387e5f86c1` |
| `f1-210abdf-collaborate-c1.log` | `dafb4054fb501406b6dc79113a3da9da0a4eb936acdfd8d5e45a64f61c14bbc5` |

**Baseline** (record 2 of each log):

| Item | Value |
| --- | --- |
| Product | `210abdf` → `210abdf77562…`; docs head `d113c6a…`; product delta empty |
| Browser and runtime | Chrome/154.0.8037.97 headless (protocol 1.3); viewport 1280×813, dpr 1; Node v24.16.0; esbuild 0.28.1 |
| Packages | React and React DOM 19.2.0; react-router 7.15.1 |
| Lockfile gate | archive = dependencies = `df05f2dd…` |
| Bundle | 629 inputs (559 from the archive, 69 third-party, 0 foreign); js `a07bffea…`, css `4253982f…` |
| Hashes | The fixture, prelude and runner SHA-256 recorded in the logs equal the committed files. |

**Method.**
- **Composition.** The same production composition as h1: Shell, `ComposedSettings`, coordinator, `createBrowserRouter` with `RouterProvider` from `react-router/dom`. It is built from an immutable `git archive` and served from 127.0.0.1 only. No product code is mocked.
- **Input.** CDP trusted clicks after a centre hit-test, and browser Back through `Page.navigateToHistoryEntry`.
- **Fault.** A per-key `setItem` fault.
- **Instruments that log, then delegate:** Storage attempts, Web Lock requests, history calls, popstate, router subscription (blocker states by object id), and `console.error`.
- **Router blocker wrappers.** `proceed`/`reset` wrappers record the live router blocker before each call. The fixture subscribes before `RouterProvider`, so wrapping happens before React receives the object.
- **Commit observer.** A read-only React DevTools hook records, for every commit, the committed coordinator effect dependencies next to the live blocker.
- **Cases per run:** r1 Retry-released Back, d1 discard control, r2 repeat. Product checks are deferred.
- **Refusals.** The runner refuses to overwrite a log and uses distinct suffixes.

**Runs** (each record is one JSON line):
- `sticky` s1: FAIL; deferred failures are the r1 and r2 proceed-once and runtime gates; 4 runtime errors.
- `more` m1: FAIL, the identical four.
- `collaborate` c1: PASS; 62 checks, 0 runtime errors.

## 9. Limitations

- **Environment.**
  - Headless Chrome 154, not Tauri.
  - React development builds, without the production `StrictMode` wrapper.
  - Synthetic accounts; one device field per case; EN at 1280×813.
  - Only Back is exercised here. Guarded Forward and script `history.back()` are covered for Sticky by h1 c10 and c11.
- **Scheduling dependence.**
  - The failure depends on React and Chrome scheduling: the lock grant against the deferred passive-effect task, and the Scheduler tasks against the navigation commit.
  - It was deterministic in 8 of 8 observed Retry-released POPs: h1 ×4, s1 ×2, m1 ×2.
  - Production builds and other browsers may differ in frequency.
  - The discard window was never hit (h1 c2 and c5; d1 ×3).
- **Instruments.**
  - The commit observer reads private React 19.2 fiber fields and adds a small cost per commit.
  - Outcomes match h1, which ran without it.
- **Coverage.** Exposure for Notifications, Date & Time, Header, Smart Lists and Pomodoro rests on code analysis only, because of the cost cap.
- **Production.** The error-boundary impact in production is inferred, not exercised.

## 10. Cost

- **Chrome runs: 3, no full matrix.**
  - Sticky s1: harness validation and the minimal before-reproduction for the frozen caller. It is not an accepted-caller reproduction.
  - More m1: 1 of 3 iterations.
  - Collaborate c1: 1 of 3 iterations.
- **No Chrome development probes.**
- **Scratch work outside the repository, no browser:** one bundling check, and one rebuild used for the line mapping, whose bundle SHA-256 equals the runs'.
