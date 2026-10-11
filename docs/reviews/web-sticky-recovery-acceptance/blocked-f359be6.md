# CP-STICKY-01 final acceptance review at `f359be6`: BLOCKED (evidence gap only)

- **Date:** 2026-10-03
- **Module:** `web`
- **Control-plane item:** CP-STICKY-01 (Settings Sticky Note, all5 recovery caller), batch 17.
- **Reviewer:** Claude Opus 5.5, independent final reviewer (Astra-role mapping: risk and final decision). It did not write the contract, the oracles, the implementation, the coordinator repair, the F1 impact review or any verification evidence, and it shares no context with those instances.
- **Verdict: BLOCKED.** One required §13 evidence item has never been produced: contract §10 item 4, the dashboard-widgets `StickyComposer`, `StickiesWidget`, `useStickies`, `stickiesStore` and `ids` tests passing from the fixed archive. Gate row 5 ("Downstream readers and canonical format") therefore cannot reconcile, and under the acceptance condition the caller cannot close.
  - **No product failure was found.** Rows 1–4 and 6 PASS. Nothing is frozen as a product reproduction, and no product, contract or test change is requested or authorized. The closure is one verification-only run (§4.4).
  - **Shared coordinator delta `f359be6`: fresh acceptance GRANTED** (§7). The retained acceptances of More, Notifications, Date & Time, Smart Lists, Dashboard Header, Pomodoro and Collaborate remain valid, with the conditions in §7.4. This conclusion does not depend on the Sticky block.

## 1. Fixed boundary

| Item | Value |
| --- | --- |
| Review checkout | Isolated worktree `.claude/worktrees/agent-abbbe13eaf3911f3a`, `git status --short` empty, then `git checkout --detach b2a21d0e5c9747ff9e2b7e14b23b09925982d1f4`. HEAD verified, status clean, `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` empty |
| Contract | `docs/reviews/web-sticky-recovery-contract/contract.md`, `70ff46a`, unchanged since (`git log 70ff46a..b2a21d0 -- docs/reviews/web-sticky-recovery-contract/` is empty) |
| Before product | `20235269749dad514833d76c27b958f694d0e4e9` |
| Implementation | `210abdf77562660372c47086db02bd21e870deb5` (Terra, `fix(settings): recover Sticky edits and departures`) |
| Shared coordinator repair, product under review | `f359be6d838393e0f9e93efd80b88b5b09f6144e` (`fix(web): settle each departure blocker once`) |
| Ancestry | `2023526` → `210abdf` → `f359be6` → `b2a21d0` (all `merge-base --is-ancestor` true) |
| Product diff `2023526..f359be6` (`apps packages package.json pnpm-lock.yaml`) | Exactly 10 files. `2023526..210abdf`: the 8 contract §11 files (`stickyPane.tsx`, `StickyColorPalette.tsx`, `stickyPane.test.tsx`, new `stickyPaneRecovery.test.tsx`, `styles.css`, `localI18n.ts`, `docs/api.md`, `docs/test.md`; +955/−48). `210abdf..f359be6`: `apps/web/src/routes/modules/departureCoordinator.tsx` (+48/−9) and new `__tests__/departureCoordinator.blocker.test.tsx` (583 lines) |
| Lockfile | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` at `2023526`, `f359be6` and the read-only dependency checkout |

## 2. Six-gate reconciliation (contract §13)

Each row chains: contract text → fixed source at `f359be6` → correct before failure → fixed independent result → actual user surface. Line numbers of `stickyPane.tsx` and `departureCoordinator.tsx` refer to `f359be6`.

| Gate | Source (`f359be6`) | Correct before failure | Fixed independent result | Actual user surface | Verdict |
| --- | --- | --- | --- | --- | --- |
| **1. All5 ordinary fields** | Five `usePrefAutosaveAsync(key, { validate })` bindings with strict caller domains (`stickyPane.tsx:65–78, 86–90`). A valid edit becomes a field draft before enqueue (`:142–150, 171–182`); only that exact draft object settles (`:151–162`). Malformed DOM input sets only that field's error, with zero writes (`:173–176`). Pending Retry is inert (`:183–196`). Discard detaches, then `meta.reload()` (`:197–205`); Reload refuses while a draft exists (`:209–214`). Saved needs a genuine success and no draft, pending, source or input error (`:288–293`). Per-field recovery UI (`:295–322`) uses the §5 wording verbatim (`localI18n.ts:317–331`, 11 new keys). No raw Storage, `setPref`, `getPref`, `usePref(`, `meta.reset` or reset UI | Sol `4e21e6d`: `fields` 0/47, e.g. `fields-before1-2023526.log` L372 (H1), L566 (H4: injected `huge` persisted), L702 (H8), L766 (H7). Host `07784c4`: F-a 0/5 (`host-before1-2023526.log` L149–189). Positive controls PASS: `bytes` 13/13, ST1–ST10 10/10 | Sol `7ee8de6` (`210abdf`) and `3ea0310` (`f359be6`): `fields` 47/47, `bytes` 13/13, `original` 10/10, 0 `PRECONDITION:` lines (`fields-post1-f359be6.log` L64). Host F-a 5/5 at both SHAs. Coverage: per-field H1 and H2, 16 out-of-domain sources, 3 malformed font inputs, edits over invalid and unavailable sources, all five unresolved, conflict plus unrelated quota, both string/boolean directions, targeted zero-write Discard with zero sibling reads, Discard all, truthful Saved | Chrome `bc92561`, rerun at `f359be6` in `3ea0310`: `controls` 482/482. 25 trusted values with exact bytes after a browser restart on the same profile, defaults still stored (values 1, 16, 19, 21, 23), new-document reload with zero writes (`native-f359be6-post1-controls.log` L462–467, zero attempts at L465). Input-error-only via a trusted keystroke on an injected `huge` option: field error, zero writes, no warning (`native-f359be6-post1-host.log` L38–44). Source-only: Reload-only alerts, no warning (L24–26). EN/ZH all-five and source-only states (`98125c5`). ST1–ST10 also pass in the final package run (`package-sticky-final-v1-f359be6.log` L27) | **PASS** (see §6.1 on ST6/ST8) |
| **2. Same-field queue attribution** | Completion authority is the exact draft object (`:152`). Predecessor recovery never acknowledges the latest draft (`:163–169, 187–195`). A switch inverts the latest intent (`:281–286`). The shared queue and coalescing are reused unchanged (`usePrefAsync.ts:229–243`; the storage package diff is empty) | `queues` 0/27, e.g. `queues-before1-2023526.log` L308 (H6: bytes changed under a held lock), L358 (coalesced A→B→C wrote immediately), L368 (H5: double activation lands opposite) | `queues` 27/27 at `210abdf` and `f359be6`. Q1–Q9 for the palette and Pin by Default: predecessor success with latest failure, failed predecessor with the latest queued, repeated predecessor failure, inert pending Retry, equal-value successor, uncertainty with exactly one write, external replacement, external removal, restored original bytes, new work after a discard. Plus H6 for all five fields, coalesced writes exactly `["coral","navy"]`, and H5 for both switches | Native held lock with real `prefMutationLockName` (`controls` L468–475), uncertainty reconciled with one total write (L480–486), second-document conflict preserved with zero-write Discard (L490–508). h1 row i: PUSH release exactly once (`native-f359be6-post1-host.log` L327) and POP release exactly once (L290–291) | **PASS** |
| **3. Device continuity and export** | Device keys stay unscoped. An epoch change renews the decision token (`:106–110`). Live-scope checks refuse old capabilities before rerender (`:122–125, 257`). Unmount detaches everything (`:112–119`). Export reads memory drafts only, rechecks permission at setup, after Blob, after URL and after append (`:219, 231, 233, 239`), and always cleans up (`:244–247`) | `continuity-export` 3/22: 3 invariants PASS, 19 correct FAIL | `continuity-export` 22/22 at both SHAs: A→B→locked→A with a real held device lock, old guards and inline callbacks refuse before and after rerender, fresh B/locked/A guards export, same-account epoch change, no account key, lock or marker touched, unrelated account lock does not serialize, sparse/all-five/dialog/held/exclusion exports under total denial with attempt counters, Blob/URL/append/click failures, epoch and unmount cancellation | Native `export` 295/295 (`bc92561`, rerun `3ea0310`). x1–x6 are real Chrome downloads deep-equal to the full envelope under total denial, with 0 read/write/remove attempts, one URL created and revoked, the anchor removed, and the warning plus guard asserted afterwards (x2: `native-f359be6-post1-export.log` L64, L65, L67, L77, L81). x3 keeps the dialog open and the key unchanged. x7 (click throws, L243) and x8 (`createObjectURL` throws, L296) show the localized error. The all-five artifact is byte-identical to the contract §8 envelope, and all seven post-repair artifacts are byte-identical to `210abdf` | **PASS** |
| **4. Production host/native** | Guard consumed from props (`:82, 253–267`) with label `settings.sticky` (`:250`); the standalone render needs no guard. `beforeunload` is attached only while drafts exist, with no Storage access in the handler (`:269–279`). The host, composition, `settingsDeparture` and auth are unchanged; the coordinator changed only through the authorized F1 repair | Host `07784c4`: 5/28 PASS (2 fixture checks and PC1–PC3), 23 correct FAIL: sidebar departure (L199), voluntary sign-out resolved `true` (L254), no `beforeunload` warning (L396), plus AppRail, programmatic, Back/Forward POP, `navigate(±1)` and relative navigation | Host 28/28 at `210abdf` and `f359be6`. Chrome h1 at `210abdf` (`019f451`): 335/335 preconditions and 257/257 behaviour checks, but 4 runtime gates failed (F1, the shared coordinator defect, §7). h1 at `f359be6` (`3ea0310`): 40/40 runtime gates, 0 runtime errors, both end gates green (L679–681) | All §9 rows a–l in Chrome through the production composition: hit-tested sidebar, guarded Forward with `{pathname,key,state}` identity and an intact stack, exactly-once release with history counters, epoch, unmount. EN/ZH at 375/414/768/1024/1440: 577/577 checks per language, every control hit-tested, recovery and dialog targets ≥44×44 (smallest exactly 44), keyboard 105/105 per language, 18 screenshots reviewed manually (`98125c5`). I re-ran h1 once (§10): PASS | **PASS** (see §5 on dialog containment) |
| **5. Downstream readers and canonical format** | No reader or writer of the five keys outside `stickyPane.tsx` (D1). Default, codec, owner, schema, key, lifecycle and StickyComposer's hard-coded `sun` unchanged | Sol `bytes` 13/13 at `2023526`: all 25 values with exact bytes, absent defaults (the required before controls PASS) | §10.1 PASS (Sol PC §10.1 ×5 at all three SHAs). §10.2 PASS with the authorized exception (§4.2). §10.3 PASS: the D1 search at `210abdf` (`7ee8de6`), repeated by this reviewer at `f359be6` with identical per-file hit counts. §10.5 PASS: Storage check-types (`d7358b9`) and the Sol lifecycle assertion (`bytes-post1-f359be6.log` L18). **§10.4: no evidence exists** | Native exact bytes for all 25 values (`controls`). Dashboard-widgets regression: **not run** | **BLOCKED** (evidence gap, §4) |
| **6. Final regression** | Settings-rest stylesheet changes are additions only, all under `.sticky-recovery-*` (`styles.css:835–875`); those classes are emitted only by `stickyPane.tsx` (`git grep`). The coordinator diff is logic only | n/a (regression row) | `d7358b9`: 14 runner invocations, each exit 0 on its first run. Settings-rest 44 files / 314 tests, typecheck and lint. Web 28 / 156, check-types and lint. Storage check-types. More Sol 79 (22+20+14+10+13), `original` 15, frozen host 11. Notifications Sol 41, Astra boundaries 24, Astra host 15, parent host 12. Date & Time 7. No F1 signature. All 24 log hashes re-verified (§9) | Three of the host suites render the production `composedSettingsRegistration`, so they exercised the repaired coordinator. The stylesheet clause is not triggered (Sticky-scoped selectors only). The shared-delta clause is met by `3ea0310`, `f3a3c82` and §7 | **PASS** |

**Acceptance condition.** The evidence goes well beyond the two original persistence tests (ST6/ST8): 109 Sol cases, 28 host cases, and the native controls, export, host, visual and keyboard runs. It covers all five fields, strings as well as switches. Recovery ships with the host matrix and native export. Rows 1–4 and 6 reconcile all four elements. Row 5 lacks §10 item 4, so the condition "every row must reconcile" is not met.

## 3. Source review notes (non-gating)

- **Ownership.** `draftsRef` (`:100`) holds one draft per field. Completion compares object identity, never value equality or `meta.status` (`:152, 166`). Discard detaches before `meta.reload()`, and the shared hook disposes the controller, so a held discarded operation fails `liveValidate` and never writes (Q9).
- **Permission.** The guard token is captured inside the effect (`:255`), so the StrictMode double invoke ends with a current token. `isCurrent` also compares the live scope, so an old guard refuses before rerender (`:257`). The device-identity binding keeps drafts across epochs (`usePrefAsync.ts:98`).
- **Docs nit.** `docs/api.md` §4.9 says the pane registers the guard "while a draft exists". The code registers whenever the host supplies `registerDepartureGuard` and blocks only while drafts exist (`:253–267`). The behaviour is correct; the wording is imprecise.

## 4. Blocking item: contract §10 item 4 has no evidence

### 4.1 What is missing

Contract §10 item 4 (contract line 459) requires the dashboard-widgets `StickyComposer`, `StickiesWidget`, `useStickies`, `stickiesStore` and `ids` tests to pass from the fixed archive. §13 row 5 (line 560) lists "§10 items 1–5" as required complete evidence.

- The Sol fixed receipt deferred it explicitly: `web-sticky-recovery-sol/fixed-210abdf.md:325` says "Not run here: §10 items 4–5". Item 5 (Storage check-types) was later covered by `d7358b9`, because it is also in the §13 final-regression list. Item 4 is not in that list and was never scheduled.
- No committed log of `StickyComposer.test.tsx`, `StickiesWidget.test.tsx`, `useStickies.test.tsx`, `stickiesStore.test.ts` or `ids.test.ts` exists anywhere under `docs/reviews/` (repository search). The `@repo/web` run (28 files) and the `@repo/plugin-web-dashboard-grid` run (25 files, `pkg-f359be6-dashboard-grid-test.log`) contain none of them. `@repo/plugin-web-dashboard-widgets` is a different package, with 34 test files, none of which ran in this evidence chain.
- The control plane's "全部验证证据已齐备" is therefore inaccurate for this one item.

### 4.2 What the other §10 items establish

- **§10.2.** `git diff 2023526 f359be6 -- packages/plugin-web-storage packages/plugin-web-settings-shell packages/xai-web-dashboard-widgets packages/xai-web-cmdk apps package.json pnpm-lock.yaml` lists only the coordinator and its new test.
  - That `apps` delta is the shared-defect repair authorized through contract §11 "Shared defects" (lines 493–497). All four preconditions were met:
    - frozen before oracles: `019f451`, `0ba68d7` and `e3db4e0`;
    - an Astra-role impact review: `0ba68d7`;
    - explicitly revised ownership in the control plane (`41774ab`, `c3b9883`; row "F1 修复归属");
    - affected-caller reruns: `3ea0310` and `f3a3c82`.
  - It does not touch the five keys. Every other listed path has an empty diff. I accept §10.2 with this documented exception.
- **No reachable path from the delta to the widgets.** `@repo/plugin-web-dashboard-widgets` and its declared workspace dependencies have empty diffs `2023526..f359be6`: `@repo/core`, `@repo/plugin-web-storage`, `@repo/plugin-web-time-tracker`, `@repo/plugin-web-tokens` and `@repo/xai-web-event-bus`. Only `apps/web` depends on `@repo/plugin-web-settings-rest`, and no package imports `apps/web`. A Sticky- or coordinator-caused regression in these tests is therefore not reachable.

### 4.3 Impact

- **Product risk: negligible, but unverified.** The reachability argument shows the delta cannot change these tests' outcome. It does not show that they pass. The contract asks for an executed pass, separately from item 2's empty diff.
- **Gate impact:** row 5 is incomplete, so CP-STICKY-01 cannot move to `accepted` on this evidence.
- **No effect on F1 or other callers.** Nothing here reopens F1 or affects the other accepted callers.

### 4.4 Correct closure oracle (verification only; no product repair)

1. **Run.** An independent verifier runs the five named files from `packages/xai-web-dashboard-widgets`. Running the whole `@repo/plugin-web-dashboard-widgets` test suite, which contains them, is also acceptable. The five files are:
   - `src/__tests__/StickyComposer.test.tsx`
   - `src/__tests__/StickiesWidget.test.tsx`
   - `src/__tests__/useStickies.test.tsx`
   - `src/internal/stickiesStore/__tests__/stickiesStore.test.ts`
   - `src/internal/stickiesStore/__tests__/ids.test.ts`
2. **Environment.**
   - The run uses an immutable `git archive f359be6`, or any SHA whose `apps`, `packages`, `package.json` and `pnpm-lock.yaml` tree equals `f359be6`.
   - It applies the lockfile gate (`df05f2dd…`).
   - It records the requested and resolved SHA, refuses to overwrite logs and preserves the exit code.
3. **PASS criteria.**
   - Vitest exits 0.
   - Each of the five files is reported as passed with its test count.
   - There is no `FAIL` line and no unhandled error.
   - The log is committed with its SHA-256 in a receipt.
4. **If a file fails.** Freeze the log. Rerun the same files at `2023526`:
   - a failure that also occurs at `2023526` is a pre-existing defect outside the Sticky §11 files and needs controller adjudication;
   - a failure that occurs only at `f359be6` would be a real regression, not expected given §4.2.
5. **Fresh acceptance.** The next reviewer needs to re-check row 5 and the product boundary, and may rely on the other findings in this report while the product tree stays equal to `f359be6`.

## 5. Decision: departure-dialog containment

**Accepted.** The visual batch judged the three dialog actions against the dialog box and the viewport, not against `.settings-detail`. That reading is correct under contract §9.

- **The literal requirement cannot apply to this element.**
  - §9 lists the three dialog actions among the controls that must be "contained horizontally within `.settings-detail`".
  - The same section requires reusing the production ComposedSettings, coordinator and `settingsDeparture` unchanged, with "no host, coordinator or auth edit".
  - The dialog is rendered by the protected coordinator outside the Settings detail (`departureCoordinator.tsx:286–296`). It is a `position: fixed` viewport overlay (`styles.css:227–237`, `inset: auto 1rem 1rem`, unchanged since `2023526` and shared by every Settings caller).
  - No caller could satisfy the literal reading. The accepted More caller would fail it equally, and its visual audit used the same dialog-box and viewport reading.
- **The intent of the requirement is met.** That intent is reachability without clipping, horizontal scrolling or covering. In both languages at all five widths:
  - every action is inside the dialog box and the viewport;
  - center plus four inset hit-tests land on the action;
  - targets are at least 44×44 (EN 50.39/154.89/238 × 44, ZH 49.78/107.78/151.28 × 44);
  - Tab and Shift+Tab wrap, Escape means Stay, and focus returns to the prior element.
- **The raw relation is transparent.** I re-extracted `inDetail` from both visual logs and it matches the receipt: all three actions are inside `.settings-detail` at 375 and 414, Stay is outside at 768, and none are inside at 1024 and 1440.
- **Placement is a shared host follow-up, not a Sticky defect.** At ≥1024 the dialog sits bottom-left over the rail and sidebar, with no backdrop.

## 6. Decisions on Terra's open questions

### 6.1 (a) The lock fixture in `stickyPane.test.tsx`: within §11

- **What changed.**
  - A file-level `beforeEach`/`afterEach` installs and removes `navigator.locks = createSmartListsLockManager()` (`stickyPane.test.tsx:11–16`).
  - ST6 and ST8 became `async` and wrap their unchanged expectations (`"mint"`, `"xl"` via `getPref`) in `await waitFor` (L67, L83).
  - No other ST body, title or assertion changed (diff `2023526..f359be6`).
- **Why it is within "ST6 and ST8 may only await real async completion" (contract line 478).**
  - The fixed pane writes through the real engine, which needs Web Locks. jsdom has none, and a missing `navigator.locks` becomes `lock-unavailable` (contract §3.8), so without the fixture no real completion could ever be awaited. The fixture enables that completion and weakens no assertion.
  - The fixture is pre-existing and unmodified (last change `40ffbe1`). It implements real exclusive/shared queueing, not a pass-through. Accepted Smart Lists and Collaborate tests already use it.
  - It is test-environment support in a §11-permitted file. It is not a business-assertion change.
- **Independent corroboration.**
  - The frozen Sol `original` mode ran the archive's ST1–ST10 at all three SHAs (10/10).
  - The Sol oracles use their own exclusive lock fixture.
  - Chrome's real Web Locks prove ST6/ST8-equivalent persistence for all 25 values.

### 6.2 (b) Reload and Discard clearing the same field's input error: acceptable

- **What the code does.** Both call `clearInputError(field)` for that field only (`:202, 212`).
- **Why the contract allows it.**
  - §5.3 constrains scope: a valid choice clears "only this field's" error, and no other field's error may be cleared. It does not make a valid choice the only way to clear the error.
  - The error describes a rejected DOM value that was never stored and never became a draft. After the user explicitly reloads or discards that same field, the field shows the reread source, so the message no longer describes it.
  - No write, no Saved claim and no sibling effect follows. Discard all visits only fields with actual drafts, so input-error-only siblings keep their error (Sol `fields` #41).
  - An input-error-only field shows no button at all, so the clearing happens only together with an explicit recovery action on that field.
  - This is the same behaviour as the accepted More caller.

## 7. Fresh acceptance of the shared coordinator delta (`210abdf..f359be6`)

### 7.1 Review of the diff

- **Scope.** Two authorized files only. The four exported symbols are unchanged. No added or removed line touches JSX, `className`, `style` or `aria-*`, so the dialog markup (`:286–296`) is byte-identical.
- **Invariant implemented.** The repair implements exactly the invariant the impact review required (`impact-review.md` §5.1): bind, publish, proceed or reset only on the router's live `blocked` blocker, and at most once per blocker.
  - `isLiveBlocked` checks the router's live blocker by object identity in `router.state.blockers` (`:54–60`). That is sound for react-router 7.15.1, which replaces the blocker object on every transition (impact review §2.1).
  - The blocker effect returns at once for a settled or non-live snapshot (`:182`).
  - The bound `proceed`/`reset` closures re-check liveness and settlement at invocation, and mark the blocker settled before calling it (`:183–188`). These closures are what `finishIntent` (`:120–122`), the sign-out first-intent reset (`:194`) and the unmount cleanup (`:253–258`) invoke.
  - A held POP intent is rebound when a newer POP replaces its blocker (`:195–201`).
  - The PUSH path (`wrappedNavigate`, `:131–156`) is unchanged.
  - Stale snapshots still render (1–2 per case in `3ea0310`), and they are refused.
- **Declared behaviour changes against contract §9 rows g, k and l.** Each is required by the invariant:
  - a re-registration after Stay no longer reopens the dialog, while a fresh intent still prompts;
  - an epoch change resets once;
  - a second Back rebinds to the live blocker;
  - unmount does not reset a blocker the router has already deleted.
  - The author's narrow race also behaves correctly: a click before the second blocker renders settles nothing, the new blocker is re-evaluated, and the user's decision is not lost (`3ea0310` §6–§7: race harness 183/183).
- **Regression test.** `departureCoordinator.blocker.test.tsx` has 10 cases. Each POP case asserts as a precondition that a stale `blocked` snapshot actually rendered after the settle, so the window is exercised deterministically in jsdom. That makes it a durable regression oracle.

### 7.2 Evidence chain

- `0ba68d7`: root cause class A (shared defect), plus the correct oracle and the rerun list.
- `e3db4e0`: F1 confirmed in Chrome at `210abdf` for Notifications, Date & Time, Smart Lists (including a discard control with the before-commit error-element variant), Dashboard Header (offset path) and Pomodoro (multi-draft). Every throw maps to `departureCoordinator.tsx:170` (old numbering).
- `3ea0310`: the F1 modes sticky, more and collaborate are 62/62 each. All 11 required caller cases turned FAIL→PASS; the controls stayed PASS. Each blocker got one live proceed or reset, with 0 throws. Sticky h1 is 40/40, and Sol, host, controls and export are unchanged.
- `f3a3c82`: 69 caller-suite invocations and 6 package gates, all exit 0, with no F1 signature.
- `d7358b9`: host suites ran through the production composition with the repaired coordinator.
- This review: two reproductions at `f359be6`, both PASS (§10).

### 7.3 Verdict on the repair

**The repair is correct and minimal. Fresh acceptance of the shared delta is GRANTED.**

### 7.4 Per affected accepted caller

None of these callers' product files changed between `2023526` and `f359be6`. Each acceptance below remains valid.

| Caller (accepted at) | F1 before (`210abdf`) | Evidence after (`f359be6`) | Acceptance | Conditions |
| --- | --- | --- | --- | --- |
| More (`7b216a3`, acceptance `27adb10`) | Confirmed: `f1-210abdf-more-m1.log`, r1/r2 | f1 `more` 62/62. B2 host ordering, B1 native export (disk files byte-identical to `7b216a3`) and native host PASS. Final regression: Sol 79, `original` 15, host 11 | Remains valid | `controls-reset`, `recovery-owner` and the visual modes were not rerun (logic-only delta) |
| Notifications (`afbfb24`, `ad223a2`) | Confirmed: n2, r1/f1 | Refuted. Astra host 15, parent host 12, 18 native modes. Final regression: Sol 41, boundaries 24, host 15, parent host 12 | Remains valid | Visual modes not rerun |
| Date & Time (`d9d9fdd`, `d0d934d`) | Confirmed: t2, r1/f1 | Refuted. 16 native modes, `original` 8, `advanced` 12. Final regression: 7 | Remains valid | 3 of the 19 `d9d9fdd` native modes (`latest-pending-retry`, `source-reload`, `predecessor-failure`) and the visual modes were not rerun |
| Smart Lists (`a2c0fe0`) | Confirmed: l2, r1, d1, l1, f1 | Refuted (90 checks). 6 host-native modes. Astra export 8, host 10, entry 3, wrapper 5, app 5, `original` 39, `original-parent` 4 | Remains valid | Its host-native runner captures no runtime errors, so F1 coverage comes from `verify-f1-callers`. The other host-native, draft-native and pane-native runners were not rerun |
| Dashboard Header (`73b4eb9`) | Confirmed: h2, offset o1. The note path never reproduced (0/4) | Refuted (98 checks), with r1/f1 controls PASS. Departure 5, advanced 5, followon 2, 18 non-visual native modes. Dashboard-grid 25/228 | Remains valid | The note-text path was latent and is now covered by the structural invariant. Visual modes not rerun |
| Pomodoro (`2962b49`) | Confirmed: p1, multi-draft r1/f1 | Refuted (78 checks). Departure 9, advanced 8, draft 18, export 7, Dv2 24, completion 2. Package 18/148 | Remains valid | Native runner not rerun |
| Collaborate (`ad689dd`) | Ruled out: c1 single-field Retry | c1 62/62 (control). Astra-final contracts 37, host 8, additional 5 | Remains valid | Native runners not rerun. Overlapping completions were latent and are now covered structurally |

**Common conditions.**
- These conclusions rest on the logic-only nature of `f359be6`. A later change to the coordinator's DOM or CSS, or to shared Settings styles, would require those callers' visual modes to be rerun.
- F1 detection is scheduling-dependent, but the repair is structural. Keep `verify-f1*.mjs` and the new unit test as regression oracles for any react-router upgrade, because the invariant relies on blocker object identity.

## 8. Retained limitations and follow-ups

| Item | Classification | Reason |
| --- | --- | --- |
| §10.4 dashboard-widgets tests never run | **Blocking** (evidence gap) | §4 |
| After keyboard Discard / Discard all, focus falls to `<body>` (`native-f359be6-v1-visual.log` L644) | Non-blocking a11y follow-up | §9 does not specify post-discard focus. The focus behaviour §9 does specify (the dialog's focus entry, wrap and return) passes. Retry and Reload keep focus. Recommend moving focus to the field control or a status region, and checking the other recovery callers too |
| 46×44 round switch with the knob at the top | Non-blocking, pre-existing | Clean 375 captures are byte-identical to `2023526` in both languages. §9 requires the track and knob alignment to be preserved. SET-12 / QA visual follow-up |
| Near-invisible `white` swatch | Non-blocking, pre-existing | §2 preserves swatch colors and variables. Contrast follow-up |
| Recovery and pane buttons look like plain text | Non-blocking, precedent | Global button reset. Legible and ≥44×44, as in the accepted More captures |
| No dialog backdrop; dialog bottom-left over the rail at ≥1024 | Non-blocking, shared host presentation | Protected coordinator and stylesheet, shared by all Settings callers |
| Visual and unlisted modes not rerun for affected callers | Non-blocking, with the condition in §7.4 | The coordinator diff is logic-only (verified). The Sticky CSS selectors cannot match other panes |
| F1 timing dependence | Non-blocking residual risk | The fix is structural. Before the repair, F1 reproduced in 4/4 h1 POP sites, s1/m1 r1/r2 and 11/11 caller cases. After it, 0 reproductions in any run, including this review's two runs |
| Headless Chrome, synthetic accounts, not Tauri, synthetic `beforeunload`, direct sign-out preflight, development build without StrictMode, reused dependency trees, script-focused select, script clicks in race windows | Non-blocking retained exclusions | Contract §14 (last row) and §15 exclude Tauri execution and production authentication. Any Desktop promotion still needs the ADR-0013 D3 gate |
| `docs/api.md` §4.9 guard-registration wording | Non-blocking docs nit | §3 |

## 9. Hash spot-checks

Every recomputed SHA-256 matched its receipt: 225 distinct files, 231 comparisons, 0 mismatches.

| Sample | Files | Result |
| --- | --- | --- |
| h1 post-repair log `native-f359be6-post1-host.log` | `6fe8d67efee1f525a0005414bc20fd929863da21b4c4430f859ca667131dfc56` | = `native/post-f359be6.md` |
| F1 post-repair `f1-f359be6-sticky-post1.log` / `f1-f359be6-more-post1.log` | `11644bb9f77fb806568c7eccdc11537379d5623fdb2deeaebaada42f1d20195f` / `ed81611992e9688554ef389ff459c60ad7a2664b46154d5d0d75d80c6fae6463` | = `f1/post-f359be6.md` |
| Visual logs, EN / ZH | `f75916a9bc335c109811c1933302a732d925a09127f5373dff800dbf5ce33357` / `bb9893b20fef0e143aaa814e497d8eebc40ababb78d72ffe8a985b194a571f19` | = `review-visual-f359be6.md`; all 18 screenshots also match |
| Final-regression logs (`d7358b9`) | 24 logs | 24/24 = `review-final-regressions-f359be6.md` |
| Sol directory | 6 oracle/runner files + 15 logs | 21/21 = README, `fixed-210abdf.md`, `post-f359be6.md` |
| Independent host directory | oracle, runner, 3 logs | 5/5 |
| Native directory | 3 fixtures, 3 runners, 8 logs, 14 JSON artifacts, 18 PNG | 46/46 |
| F1 directory | 3 runners, 3 fixtures, prelude, 24 F1 logs, 6 package logs | 37/37 |
| Affected-caller artifacts (`f3a3c82`) | 98 non-receipt files across 15 directories | 98/98 = `affected-callers-f359be6.md`; no `"pass":false` and no F1 signature |

## 10. Optional bounded reproduction (two frozen runners, once each, `f359be6`)

Both runs used `XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop` read-only and the lockfile gate `df05f2dd…`. Each recorded docs head `b2a21d0…`, an empty product delta and Chrome 154.0.8037.97. Logs were redirected to the session scratchpad through the runners' own `XAI_F1_EVIDENCE_DIR` / `XAI_HOST_EVIDENCE_DIR` and deleted after their hashes were recorded. The worktree stayed clean, and the runners removed their temporary directories.

1. **`verify-f1.mjs f359be6 sticky accept1` → PASS, exit 0.**
   - 62 checks; r1, d1 and r2 each had exactly one live proceed.
   - Stale commits were observed (2/1/2) and ignored.
   - 0 runtime errors and 0 console warnings.
   - Runner, fixture and prelude hashes equal the frozen values (`816bd261…`, `af969a73…`, `67bbfaa7…`). The product hashes for the coordinator (`0844a697…`) and `stickyPane.tsx` (`721d7556…`) equal the evidence chain's.
   - The bundle SHA-256 differs from the committed runs, most likely because the temporary directory was nested differently. Bundle provenance is the same: 629 inputs, 559 archive, 69 third-party, 0 foreign.
   - Log: 68 lines, SHA-256 `9a571a64a56446aa6e0394a030365705531891e62218185779ee48687b78a3dd`.
2. **`verify-host.mjs f359be6 host accept1` → PASS, exit 0.**
   - 634 checks, 0 `"pass":false`.
   - 40/40 runtime gates, including c9, c10, c11 and i-pop.
   - 0 runtime errors and 0 console warnings.
   - Its check-id/kind/pass set is identical to the committed `native-f359be6-post1-host.log` (634 = 634).
   - Log: 681 lines, SHA-256 `37d91aaddccebd6b844c300d4a88b361b2e9655f10d0988c515f16e5d549feff`.

These runs corroborate rows 2–4 (through h1 rows g, i and k, and the full §9 matrix) and §7. They do not address §10.4: no frozen runner covers the dashboard-widgets tests, and producing new gate evidence is outside this reviewer's remit.

## 11. Scope statement

- **Accepting this caller does NOT close SET-12, REL-05, QA-01/03/04/09, D2/REL/AI or any 312 item, and is not business, deployment or release completion; it changes no formal counts or controller state.**
- This report accepts nothing for CP-STICKY-01; it blocks it on one evidence gap. A later acceptance would carry the same non-closure statement.
- This review changed no product file, test, runner, oracle, existing evidence, contract, ledger or control-plane file. It adds this single file.
- No push, merge, rebase, cherry-pick, branch, tag, deployment, release or Web→Desktop sync was performed. No sub-agent was spawned.
