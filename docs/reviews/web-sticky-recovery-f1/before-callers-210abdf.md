# F1 before-reproductions for the remaining exposed callers: CP-STICKY-01 batch 11

- **Date:** 2026-10-03
- **Module:** `web`
- **Control-plane item:** CP-STICKY-01, batch 11 ("其余 caller 的 f1 before 复现"), step 1 of the shared coordinator repair sequence adopted in `41774ab`.
- **Verifier:** an independent Sol-role verifier, run by Claude Opus 5.5 in an isolated detached worktree. It did not write the coordinator, any caller, the F1 impact review (`0ba68d7`) or the h1 host verifier.
- **Fixed points:**
  - unrepaired product `210abdf77562660372c47086db02bd21e870deb5`;
  - docs checkout `41774abd8e9e4c0a657a50514ebb401d95202d1f`, whose product tree is identical to `210abdf`.

> **Verdict.** Every remaining registrant reproduces the F1 signature in Chrome at `210abdf`.
>
> | Registrant | Verdict | Reproduced by | Discard control |
> | --- | --- | --- | --- |
> | Notifications | **confirmed** | Retry-released Back and Forward | passes |
> | Date & Time | **confirmed** | Retry-released Back and Forward | passes |
> | Smart Lists | **confirmed** | Retry-released Back and Forward; lock-completion-released Back | **fails**: same F1 statement, before-commit variant, React Router error element visible |
> | Dashboard Header | **confirmed** | note-position (offset) Retry-released Back | passes |
> | Pomodoro (optional) | **confirmed** | multi-draft Retry-all, Back and Forward | passes |
>
> - **Header note text.** The note-text Retry did not reproduce F1 in 4 of 4 valid releases. The F1 signature came only from the header's offset Retry, which uses the same Retry control (§7.4).
> - **Same statement every time.** Every F1 throw has the same caller frame, `bundle.js:52725:15`. That line is `departureCoordinator.tsx:170`, `blocker.proceed()` in the blocker effect (§8).
> - **No non-F1 product failure.**
>   - Every failing check is one of the three F1 gates.
>   - Every business assertion passed: one POP commit to the recorded entry, history stack unchanged, latest value written once or zero writes, dialog closed, caller label.
>   - Zero preconditions failed in all 11 logs.
> - **Scope.** This receipt repairs nothing, accepts or revokes nothing, and closes no 312 item. It adds files only under `docs/reviews/web-sticky-recovery-f1/`. No product file, frozen F1 file, contract, ledger, control plane or other evidence was changed. Nothing was pushed, merged, deployed, released or synced Web→Desktop.

## 1. Inputs verified

- **Worktree.** Clean, then `git checkout --detach 41774ab…`. HEAD is `41774abd8e9e…`, and `git diff --name-only 210abdf HEAD -- apps packages package.json pnpm-lock.yaml` is empty. Every log records `productDeltaVsDocsHead: ""`.
- **Lockfile gate.** `pnpm-lock.yaml` SHA-256 is `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` in both the archive and `XAI_DEPS_ROOT`, the main checkout, used read-only.
- **Coordinator unchanged.** `departureCoordinator.tsx` SHA-256 is `08e946074f8b…`, the value recorded by h1 and the impact review.
- **Frozen F1 files untouched.** `verify-f1.mjs`, `f1-host.tsx`, `f1-prelude.js` and the three `f1-210abdf-{sticky-s1,more-m1,collaborate-c1}.log` were not modified. The prelude is reused byte for byte (`67bbfaa7…`).

## 2. Method

**New runner** `verify-f1-callers.mjs` and **new fixture** `f1-callers-host.tsx` mirror the frozen batch-10 harness:
- immutable `git archive` of the candidate;
- esbuild bundle with every `@repo/*` import pinned to the archive;
- lockfile gate and bundle-input provenance (629 inputs: 559 archive, 69 third-party, 0 foreign);
- page served only from 127.0.0.1, in an isolated headless Chrome profile;
- the frozen read-only React commit observer;
- the runner refuses to overwrite a log.

The instruments are the same: attempt-level Storage with a per-physical-key `setItem` fault; Web Lock requests; `pushState`/`replaceState`; popstate; router subscription; `proceed`/`reset` wrappers that record the live router blocker; sequence-stamped `console.error`; a React Router default error element detector.

**Composition.**
- The production Shell with `WebShellProvider` and `webShellModuleRegistrations`, and `createBrowserRouter` mounted with `RouterProvider` from `react-router/dom`.
- `settings/*` mounts the production ComposedSettings.
- `dashboard/*` and `pomodoro/*` mount the production shell registrations for those modules: `withDisabledFallback`, then `DashboardModuleRoute` / `PomodoroModuleRoute`, each with its own `DepartureCoordinator`.
- Synthetic active account, so account-scoped keys resolve to `xai:account:v1:f1-callers-A:g1:…`.
- One seed value: the dashboard order `["mini-cal"]`, as in the accepted Header native fixture.
- Nothing is mocked.

**History, per run.**
- Entries: start `/app/settings/hotkeys` → P `/app/settings/about` (state `f1-P`) → S (registrant) → N `/app/settings/hotkeys` (state `f1-N`). An unguarded Back then returns to S.
- Every case starts clean at S. Back targets P and Forward targets N. Neither P nor N mounts a guard.

**Trusted input.**
- **Mouse.** CDP mouse input after a centre hit-test: switches, buttons, and the Header note-chip drag.
- **Select.** The select is focused by script, then receives a trusted typeahead key `h` (→ "Hide"). This is the pattern of `../web-sticky-recovery-native/verify-host.mjs`.
- **Text.** CDP `Input.insertText`, plus a trusted Enter key.
- **History.** Browser traversal through `Page.navigateToHistoryEntry`.

**Cases.** One run is one diagnostic iteration.

| Case | Release | Direction | Unsaved work |
| --- | --- | --- | --- |
| r1 | successful Retry | Back | failed save (`setItem` fault, then restored before release) |
| d1 | dialog "Discard local changes and leave" (control) | Back | failed save |
| f1 | successful Retry | Forward | failed save |
| l1 (Smart Lists only) | lock completion: the fixture releases a held exclusive `xai:pref:v1:<physical key>` Web Lock | Back | real save waiting behind that lock |
| o1 (Header only) | successful Retry | Back | failed note-position save after a trusted drag |

Each case asserts the review's oracle (§4.1). Product checks are deferred:
1. location `{pathname, key, state}` deep-equals the target;
2. exactly one POP commit, zero `pushState`/`replaceState`, one popstate, and CDP entry ids plus Navigation API entries unchanged, with the index at the target;
3. dialog closed, and the latest value written once with `ok` (or zero writes for discard);
4. one `proceed()` from the live `blocked` blocker, zero `reset()`, nothing throws;
5. **new** generalised invariant (oracle #6): no blocker call with `liveBlocker ≠ blocker` or `liveState ≠ blocked`;
6. zero `console.error`, CDP exceptions and React Router error UI.

**F1 signature.** At least two `proceed()` calls, and a blocker call that threw `Invalid blocker state transition`, as in the frozen runner. Each observation also records:
- `coordinatorRecreated` ("…error occurred in the `<DepartureCoordinator>` component");
- the stack frame that called the wrapped blocker method (`callerFrames`);
- stale commits;
- an ordered timeline.

**Self-check mode** (`selfcheck`) is harness validation only. It mounts every registrant route and checks each trusted-input control is present and hit-testable. It also checks that physical keys and lock names resolve and that no runtime error occurs. It performs no edit, fault, hold or release.

## 3. Commands

```sh
XAI_DEPS_ROOT=/…/XAI_Desktop XAI_NATIVE_TMPDIR=<scratch> \
  node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs 210abdf <mode> <suffix>
# final (committed runner): selfcheck sc2 · notifications n2 · date-time t2 · smart-lists l2 · header h2 · pomodoro p1
# superseded, kept and labelled (§6): selfcheck sc1 · notifications n1 · date-time t1 · smart-lists l1 · header h1
```

## 4. Files and hashes

All files are new, under `docs/reviews/web-sticky-recovery-f1/`.

| File | SHA-256 |
| --- | --- |
| `verify-f1-callers.mjs` (runner, final) | `88ccca3ddd7a99107f1dbec8ec87a18bc49e28ab3a245d19e4de688dc60314d1` |
| `f1-callers-host.tsx` (fixture) | `e636ffdb1eb0caa04e6c40507fb0dedefaf3c12a440be4db27067f9f196c0458` |
| `f1-prelude.js` (frozen, reused, not re-added) | `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670` |
| `f1-210abdf-selfcheck-sc2.log` | `c094196188fb0a037eb0254601698a7eddb45488b64c24edf3fb5bb78aba541e` |
| `f1-210abdf-notifications-n2.log` | `e507a1f6fac071d50d3d0c111e29b66d9271b7c5ff94d04e19aa6626d299a375` |
| `f1-210abdf-date-time-t2.log` | `692685953b683fa1382ad46c7af714d6b3c81c27272dd521f68551ea4278d94c` |
| `f1-210abdf-smart-lists-l2.log` | `1f2a99c1f2610adace7b279bed784c10ca9f098c2c75425150beeecd4b9b0678` |
| `f1-210abdf-header-h2.log` | `ced60bdf65a3879dacee490f08c7395ec294452781a4d073080728f2eac60e61` |
| `f1-210abdf-pomodoro-p1.log` | `7ffb24a52d8f13463c659df846481fa26e9b4dab552b094f4df3b26d693643f0` |
| `f1-210abdf-selfcheck-sc1.log` (superseded) | `7773e7367842da96d08e660f557bc65be1edac41ef0a3c076b1bcdb595fe77f7` |
| `f1-210abdf-notifications-n1.log` (superseded) | `d0a707391821264ecd3aeb44ec9d8de06b085008c26af76e66fcc7eb4dbd6a1c` |
| `f1-210abdf-date-time-t1.log` (superseded) | `0dc76d9e3f14a3cecd9239b580182a9c9748698d0a23ea79f679ed2d7feec41e` |
| `f1-210abdf-smart-lists-l1.log` (superseded) | `4cfc604a9f4584bed8293320c032f71db42b06e3f70c238b8ceef663f66cf6b4` |
| `f1-210abdf-header-h1.log` (superseded) | `8beed21bb03b8da02fb021a0b6f1ecd15ebf87aac8f3e5aa39ad6b3ed93d885e` |

**Provenance in the logs.** Record 2 (`baseline`) of every log carries the fixture, prelude and runner SHA-256.
- The six final logs carry runner `88ccca3d…`, equal to the committed file.
- All 11 logs carry fixture `e636ffdb…` and prelude `67bbfaa7…`.

## 5. Baseline (record 2 of each log)

| Item | Value |
| --- | --- |
| Product | `210abdf` → `210abdf77562…`; docs head `41774ab…`; product delta empty |
| Browser and runtime | Chrome/154.0.8037.97 headless (protocol 1.3); viewport 1280×813, dpr 1; Node v24.16.0; esbuild 0.28.1 |
| Packages | React and React DOM 19.2.0; react-router 7.15.1 |
| Lockfile gate | archive = dependencies = `df05f2dd…9aeab9` |
| Bundle | js `dc00786bcf3036110c81db4506558967d04791b09f63de0b47723182ec33f3d2`; css `4253982fdba00ac6ae532227159f59876025f274edb8c13ca9413cb4e7a7ee09` (identical in all 11 logs) |
| Keys | `xai_pref_notif_push_task`, `xai_pref_dt_lunar`, `xai_pref_dashboard_header_note_x`, `xai_pref_pomodoro_display_style`, `xai_pref_pomodoro_theme` (device, physical = logical); `xai:account:v1:f1-callers-A:g1:xai_pref_smart_lists` and `…:xai_pref_dashboard_header_note` (account) |

**Product file SHA-256** (prefix):

| File | SHA-256 |
| --- | --- |
| coordinator | `08e94607` |
| `composedSettingsRegistration` | `bd2ba2dd` |
| `settingsDeparture` | `80c3a578` |
| `dashboardRegistration` | `66c524e4` |
| `pomodoroRegistration` | `0762a079` |
| `shellRegistrations` | `c003c499` |
| `notificationsPane` | `04930bd9` |
| `dateTimePane` | `b938e61e` |
| `smartListsPane` | `2dad789f` |
| `DashHeader` | `0aaa4ce3` |
| `DashboardModule` | `36a8532b` |
| `PomodoroModule` | `3b167871` |
| `usePreferenceDepartureRecovery` | `392c54ab` |
| `usePrefAsync` | `541fae97` |
| `usePrefAutosaveAsync` | `e27f9f86` |
| `prefMutation` | `3f8840ac` |
| `Shell` | `7d46423f` |

Full values are in each log's `productHashes`.

## 6. Runs and diagnostic iterations

| Log | Runner | Purpose | Result |
| --- | --- | --- | --- |
| `selfcheck-sc1` | v1 `33446dc1…` | harness validation | harness-valid, 31/31, 0 runtime errors |
| `notifications-n1` | v1 | Notifications iteration 1 | confirmed (r1, f1); d1 passes |
| `date-time-t1` | v1 | Date & Time iteration 1 | confirmed (r1, f1); d1 passes |
| `smart-lists-l1` | v1 | Smart Lists iteration 1 | confirmed (r1, l1, f1); d1 F1 (before-commit variant, ERROR-UI seq 161) |
| `header-h1` | v2 `d0629130…` | Header iteration 1 | r1, d1, f1 pass (note path) |
| `header-h2` | **final** | Header iteration 2 (adds o1) | confirmed (o1); r1, d1, f1 pass |
| `notifications-n2` | **final** | Notifications iteration 2 | confirmed (r1, f1); d1 passes |
| `date-time-t2` | **final** | Date & Time iteration 2 | confirmed (r1, f1); d1 passes |
| `smart-lists-l2` | **final** | Smart Lists iteration 2 | confirmed (r1, l1, f1); d1 F1 (before-commit variant, ERROR-UI seq 160) |
| `pomodoro-p1` | **final** | Pomodoro iteration 1 | confirmed (r1, f1); d1 passes |
| `selfcheck-sc2` | **final** | harness validation | harness-valid, 31/31, 0 runtime errors |

**Why there are three runner revisions.**
- **v1 → v2.** After l1 showed an unexpected discard-control F1, the runner was changed to record each case's own CDP error stacks and the caller frame of the throwing blocker call. v1 kept stacks only for the first four errors of a run. Error capture went from 600 to 1200 characters.
- **v2 → final.** After h1, the runner gained per-case keys/codec and the Header `o1` case (§7.4).
- **Fixture unchanged.** The fixture never changed (`e636ffdb…` throughout), so the bundle is identical in every log.

**Superseded logs.**
- Only the final runner is committed. v1 and v2 are not.
- The superseded logs are kept as labelled history. Their outcomes equal the final logs case for case.
- **The verdicts rest on the final logs only.**

**Cost.**
- Iterations used: Notifications 2/3, Date & Time 2/3, Smart Lists 2/3, Header 2/3, Pomodoro 1/3.
- No harness was invalid in any run, so no stop condition was reached.

## 7. Per-registrant verdicts

Timeline lines below are `seq event`, quoted from the final logs' `observation` records. "Log line" means the line number in the JSON-lines log.

### 7.1 Notifications: confirmed

**Shape.**
- Retry calls `changed()` at `notificationsPane.tsx:50`, and settle calls `changed()` at `:47`.
- The guard effect at `:56` is keyed on `draftVersion`.
- Field: "Task due" (`xai_pref_notif_push_task`, device).

**Evidence (`f1-210abdf-notifications-n2.log`).**
- r1 (Back), log lines 30–33, and f1 (Forward), log lines 70–73, fail exactly the three F1 gates.
- Second `proceed` on the stale blocker (#2, #6), with live `#1:unblocked`, `THREW Invalid blocker state transition: unblocked -> proceeding`.
- Caller frame `bundle.js:52725:15`.
- `console.error … The above error occurred in the <DepartureCoordinator> component`; the coordinator was recreated (`gv=0`).

```text
67 click Retry Task due
68 lock-request xai:pref:v1:xai_pref_notif_push_task
71 react-commit p3 coordinator blocker#2:blocked gv=9 iv=1 live=#2:blocked
73 set xai_pref_notif_push_task false ok
76 PROCEED blocker#2 live=#2:blocked
81 react-commit p3 coordinator blocker#2:blocked gv=11 iv=2 live=#3:proceeding STALE
82 popstate /app/settings/about#3ha8s8jp
84 PROCEED blocker#2 live=#1:unblocked THREW Invalid blocker state transition: unblocked -> proceeding
89 console.error … The above error occurred in the <DepartureCoordinator> component.
```

**Discard control.** d1 (log line 53) passes: one proceed from the live `blocked` blocker, zero writes, zero errors. n1 shows identical outcomes.

### 7.2 Date & Time: confirmed

**Shape.**
- Retry calls `changed()` at `dateTimePane.tsx:88`, and settle calls `changed()` at `:62`.
- The guard is at `:143–154`.
- Field: "Show Lunar Calendar" (`xai_pref_dt_lunar`, device).

**Evidence (`f1-210abdf-date-time-t2.log`).**
- r1 (Back), log lines 30–33, and f1 (Forward), log lines 70–73.
- The same signature and caller frame as Notifications.
- Key r1 events: `61 click Retry Show Lunar Calendar` · `67 set xai_pref_dt_lunar false ok` · `70 PROCEED blocker#2 live=#2:blocked` · `75 … gv=11 … STALE` · `76 popstate` · `78 PROCEED blocker#2 live=#1:unblocked THREW … unblocked -> proceeding`.

**Discard control.** d1 (log line 53) passes. t1 shows identical outcomes.

### 7.3 Smart Lists: confirmed, and the discard control also fails

**Shape.**
- The guard effect at `smartListsPane.tsx:167` is keyed on `meta.status` and `hasDraft`.
- A passive effect clears the draft on status `saved` (`:101–107`).
- Retry is at `:192`.
- Field: one row's visibility, a different row per case (`xai_pref_smart_lists`, account).

**Evidence (`f1-210abdf-smart-lists-l2.log`).** These four cases fail the three F1 gates, with caller frame `bundle.js:52725:15` in every one:
- **r1**, Retry Back, log lines 30–33;
- **l1**, lock completion Back, log lines 68–72;
- **f1**, Retry Forward, log lines 89–92;
- **d1**, discard control, log lines 50–53.

**Lock completion (l1).** This matches the review's analysis: the release does not depend on the lock race.

```text
200 fixture-lock release xai:pref:v1:xai%3Aaccount%3Av1%3Af1-callers-A%3Ag1%3Axai_pref_smart_lists
204 set xai_pref_smart_lists {"all":"hide","tomorrow":"hide"} ok
211 react-commit p3 coordinator blocker#6:blocked gv=5 iv=1 live=#6:blocked      (status-saved re-registration)
212 PROCEED blocker#6 live=#6:blocked                                             (intent effect, same flush)
215 react-commit p3 coordinator blocker#6:blocked gv=7 iv=2 live=#7:proceeding STALE (hasDraft re-registration)
216 popstate /app/settings/about#gkkq504a
218 PROCEED blocker#6 live=#1:unblocked THREW Invalid blocker state transition: unblocked -> proceeding
```

**Retry (r1).** The second notification also follows the proceed: `82 set … ok` · `89 … gv=11` · `90 PROCEED blocker#2 live=#2:blocked` · `93 … gv=13 … STALE` · `96 PROCEED … THREW … unblocked -> proceeding`.

**Discard control (d1): fails with the before-commit variant.**

```text
143 click Discard local changes and leave
146 PROCEED blocker#4 live=#4:blocked                                     (finishIntent, in the click)
148 react-commit p1 coordinator blocker#4:blocked gv=5 iv=2 live=#5:proceeding STALE
152 react-commit p1 coordinator blocker#4:blocked gv=7 iv=2 live=#5:proceeding STALE
153 PROCEED blocker#4 live=#5:proceeding THREW Invalid blocker state transition: proceeding -> proceeding
155 console.error Error handled by React Router default ErrorBoundary: Error: Invalid blocker state transition: proceeding -> proceeding
160 ERROR-UI /app/settings/smart_lists
161 popstate /app/settings/about#gkkq504a
162 router POP /app/settings/about#gkkq504a blockers=[]
```

- The discard click's own state updates (`discardDraft` clears the draft and reloads; `finishIntent` bumps `intentVersion`) commit at sync priority on the stale snapshot (148, gv unchanged at 5).
- That commit's passive effects re-register the guard, because `hasDraft` and the status changed. This commits gv=7 on the same stale snapshot (152).
- Those passive effects run **before** the release popstate. The blocker effect then proceeds the already-consumed blocker #4 while the router's live blocker is #5 `proceeding` (153).
- The React Router default error element ("Unexpected Application Error") rendered at `/app/settings/smart_lists` until the POP committed (`ERROR-UI` seq 160, `errorUi: 1`).
- The business outcome was still correct: one POP commit to P with key and state deep-equal, history unchanged, and zero writes.
- l1 reproduced the same sequence: d1 at log line 53, `ERROR-UI` at seq 161.
- **Classification.** This is F1, not a different failure:
  - it has the same caller frame and the same stale-snapshot mechanism;
  - it is the variant the review lists in §2.2 ("Error variants") and §7 ("before-commit ordering");
  - it is the latent discard window of §2.3 ("not structurally closed").
- **For Smart Lists, therefore, the discard release is not a negative control.** It is a second confirmed F1 path, hit in 2 of 2 runs.

### 7.4 Dashboard Header: confirmed via the offset Retry; the note-text Retry is not reproduced

**Note text.**
- Shape: Retry at `DashHeader.tsx:589` calls `submit(…, true)`, which notifies at `:425`; `settleOperation` notifies at `:402`.
- Field: `xai_pref_dashboard_header_note`, **account**.
- Unsaved work: trusted "Edit dashboard note" click, `insertText`, then Enter.

**Offset.**
- Shape: the same Retry calls `submitOffset(…, true)`, which notifies at `:584`; `settleOffset` notifies at `:553`.
- Field: `xai_pref_dashboard_header_note_x`, **device**.
- Unsaved work: trusted drag of the note chip by 60 px.
- The guard is at `:784–798`.

**Evidence (`f1-210abdf-header-h2.log`).**
- **o1**, offset Retry, Back, log lines 97–100: fails the three F1 gates with caller frame `bundle.js:52725:15`. Business checks pass: one POP commit to P, `"60"` written once.

```text
471 click Retry note save
473 lock-request xai:pref:v1:xai_pref_dashboard_header_note_x
476 react-commit p3 coordinator blocker#8:blocked gv=23 iv=1 live=#8:blocked
478 set xai_pref_dashboard_header_note_x 60 ok
481 PROCEED blocker#8 live=#8:blocked
486 react-commit p3 coordinator blocker#8:blocked gv=25 iv=2 live=#9:proceeding STALE
487 popstate /app/settings/about#absphlmp
489 PROCEED blocker#8 live=#1:unblocked THREW Invalid blocker state transition: unblocked -> proceeding
494 console.error … The above error occurred in the <DepartureCoordinator> component.
```

- **r1**, note Retry Back (log line 35), and **f1**, note Retry Forward (log line 79), pass every check with valid preconditions. h1 r1 and f1 also pass, so this is 4 of 4. The sequence:

```text
141 click Retry note save
146 react-commit p3 coordinator blocker#2:blocked gv=17 iv=1 live=#2:blocked    (first re-registration)
150 lock-request xai:pref:v1:xai%3Aaccount%3Av1%3A…%3Axai_pref_dashboard_header_note
151 passive-effects-flushed live=#2:blocked                                      (gv=17 effects ran; draft still current)
155 set xai_pref_dashboard_header_note F1 header r1 note ok
162 react-commit p3 coordinator blocker#2:blocked gv=19 iv=1 live=#2:blocked    (settle re-registration)
163 PROCEED blocker#2 live=#2:blocked                                           (released by the LAST notification)
166 react-commit p3 coordinator blocker#2:blocked gv=19 iv=2 live=#3:proceeding STALE (no guardVersion change -> no replay)
167 popstate /app/settings/about#absphlmp
```

- **Why the note text does not reproduce here (inference from code and timeline).**
  - For an account key, `mutatePref` first takes the shared account-lifecycle lock (`prefMutation.ts:246`). It requests the key lock (`:153`) only inside that callback. The key-lock request therefore appears after the first re-registration's commit (seq 150; a device key's appears straight after the click).
  - The write lands after that commit's passive effects (seq 151), so the intent effect still sees a current draft.
  - The release then happens on the last notification, as in Collaborate.
  - **The note path stays latent:** it shares the coordinator and the two-notification shape, and its outcome depends on scheduling.
- **Discard control.** d1, note discard (log line 57), passes.

### 7.5 Pomodoro (optional, attempted): confirmed for multi-draft Retry-all

**Shape.**
- `retryDrafts` (`usePreferenceDepartureRecovery.ts:89–103`) does not notify at start. Each successful draft calls `changed()` (`:96`).
- The guard is at `:156–171`.
- Two failing drafts: style and theme (`xai_pref_pomodoro_display_style`, `xai_pref_pomodoro_theme`, device), then "Retry preferences".

**Evidence (`f1-210abdf-pomodoro-p1.log`).**
- r1 (Back), log lines 32–35, and f1 (Forward), log lines 76–79, fail the three F1 gates with caller frame `bundle.js:52725:15`.
- The second completion clears its draft **before** the first completion's re-render flushes its passive effects. The release proceed is then followed by one more re-registration.

```text
103 click Retry preferences
109 set xai_pref_pomodoro_display_style "ring" ok
112 react-commit p3 coordinator blocker#2:blocked gv=5 iv=1 live=#2:blocked   (first completion's re-render)
114 set xai_pref_pomodoro_theme "teal" ok                                    (second draft cleared here)
117 passive-effects-flushed live=#2:blocked
118 react-commit p3 coordinator blocker#2:blocked gv=7 iv=1 live=#2:blocked
119 PROCEED blocker#2 live=#2:blocked
122 react-commit p3 coordinator blocker#2:blocked gv=9 iv=2 live=#3:proceeding STALE
123 popstate /app/settings/about#avxiujbd
125 PROCEED blocker#2 live=#1:unblocked THREW Invalid blocker state transition: unblocked -> proceeding
```

**Discard control.** d1 (log line 57) passes. The review's "multi-draft unknown (latent)" is now confirmed in Chrome.

## 8. Call site of every F1 throw

**Rebuild.** A scratch rebuild, outside the repository and with no browser, used the runner's exact esbuild configuration on the same archive and fixture. It produced the identical bundle (SHA-256 `dc00786b…`, equal to every log).

**Mapping.** In that bundle, line 52725 belongs to module `apps/web/src/routes/modules/departureCoordinator.tsx` (module header at bundle line 52606):

```text
52724      if (!guard.isBlocking()) {
52725>       blocker.proceed();
52726        return;
```

That is `departureCoordinator.tsx:169–170`, in the blocker effect. Every final-log F1 case has exactly this caller frame, including Smart Lists d1:
- `callerFrames: ["at __f1/bundle.js:52725:15"]`;
- notifications r1 and f1, date-time r1 and f1, smart-lists r1, d1, l1 and f1, header o1, pomodoro r1 and f1.

## 9. Relation to the impact review (`0ba68d7`)

**Confirmed as stated.** Notifications, Date & Time and Smart Lists (Retry and completion) behave exactly as the code analysis in §3 predicted. The mechanism is the one in §2.1.

**Refined.**
- **Dashboard Header.** The review's note-text sequence did not reproduce here, because of the account-lock hop explained in §7.4. The header is confirmed exposed through the same Retry control's device-scoped offset path.
- **Pomodoro.** "Unknown" becomes **confirmed**.

**New.**
- §9 of the review says the discard window "was never hit". For Smart Lists it was hit in 2 of 2 runs, as the before-commit `proceeding -> proceeding` variant.
- In that variant the React Router error element rendered before the POP committed, which §7 had only inferred.
- In production, `/app` has `errorElement: <RouteErrorBoundary scope="app" />`. The review expects this to show the app-level error element and to call `reportRouteError`. That is inference, not exercised: this fixture, like the frozen one, has no route `errorElement`.
- This supports the review's generalised invariant (oracle #6 and §5.1 "sibling hazards"): the repair must cover the discard path, not only Retry and completion.

## 10. Use as before-evidence for the post-repair reruns

**After the batch-12 coordinator repair, run** on the fixed candidate:

```sh
XAI_DEPS_ROOT=<checkout with node_modules> XAI_NATIVE_TMPDIR=<scratch> \
  node docs/reviews/web-sticky-recovery-f1/verify-f1-callers.mjs <fixed> <mode> <new suffix>
# modes: selfcheck, notifications, date-time, smart-lists, header, pomodoro
```

The runner enforces `baseline:docs-head-product-tree-equals-fixed`, so run it from a worktree whose HEAD product tree equals the candidate.

**Unchanged inputs.** These must stay byte-identical and their SHA-256 must match this receipt and the final logs:
- runner `88ccca3d…`;
- fixture `e636ffdb…`;
- prelude `67bbfaa7…` (frozen in batch 10).

The bundle SHA will change, because the coordinator changes.

**Product hashes.**
- In the after-logs' `productHashes`, only `departureCoordinator.tsx` may differ from §5.
- Every caller, composition, `settingsDeparture`, storage-engine and Shell hash must be equal. Those files are protected surface under the control plane's F1 ownership revision.

**Required result per mode.**
- Exit code 0, with final record `pass: true` and `verdict: "refuted"`.
- `deferredFailures: []`, zero preconditions failed and `runtimeErrors: 0`.
- Every observation has `proceeds: 1`, `blockerThrows: []`, `callerFrames: []` and `errorUi: 0`.

**Before → after expectations.**
- **Must turn from FAIL to PASS (11 cases):**
  - notifications r1 and f1;
  - date-time r1 and f1;
  - smart-lists r1, **d1**, l1 and f1;
  - header o1;
  - pomodoro r1 and f1.
- **Must stay PASS (regression controls):**
  - the d1 case of notifications, date-time, header and pomodoro;
  - header r1 and f1 (note path);
  - `selfcheck`.

**Scheduling.** F1 is scheduling-dependent, so a single after-run cannot prove absence. Each of these 11 failing cases reproduced in every final and superseded run in which it ran. An after-run that passes all of them, plus the frozen `verify-f1.mjs` sticky, more and collaborate modes and h1, is the evidence the review's §4.2 and §5.1 require.

## 11. Limitations

- **Environment.**
  - Headless Chrome 154, not Tauri.
  - React development builds without the production `StrictMode` wrapper.
  - Synthetic account; EN only; 1280×813.
  - One seed value (dashboard order).
- **Input.**
  - The Smart Lists select is focused by script before its trusted typeahead key. This is the established pattern, recorded as a limitation in batch 8.
  - The lock-completion release is the fixture releasing a page-held Web Lock by script. It is not a second tab or device.
  - Script `history.back()` was not exercised for these callers.
- **Scheduling.**
  - F1 depends on React and Chrome scheduling.
  - Observed counts across all runs:

    | Path | F1 / releases |
    | --- | --- |
    | Notifications | 4/4 |
    | Date & Time | 4/4 |
    | Smart Lists Retry and lock | 6/6 |
    | Smart Lists discard | 2/2 |
    | Header offset | 1/1 |
    | Header note text | 0/4 |
    | Pomodoro multi-draft | 2/2 |

  - The Header note-text result is "not reproduced in this environment". It does not show the path is safe.
  - Other browsers and production builds may differ.
- **Instruments.** The commit observer reads private React 19.2 fiber fields. It is unchanged from batch 10, and the outcomes match its runs.
- **Production impact.** The visible error element in production is inferred, not exercised (§9).

## 12. Cost

- **Chrome runs: 11, every log committed, no full matrix.**
  - Registrant iterations: Notifications 2, Date & Time 2, Smart Lists 2, Header 2, Pomodoro 1. Each is within the cap of 3.
  - Two self-check runs, harness validation only.
- **No Chrome development probes** outside the repository.
- **Scratch work outside the repository, no browser:** one bundling check before the first run, and one rebuild for the §8 line mapping, whose bundle SHA-256 equals the runs'.
