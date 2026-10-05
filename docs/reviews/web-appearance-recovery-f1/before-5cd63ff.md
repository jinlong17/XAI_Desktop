# Appearance F1-shape before baseline (CP-APPEARANCE-01, batch 39, contract r3 §14 E5)

**Verdict: FROZEN.** This directory freezes the new Appearance F1-shape runner and host fixture, a harness-valid `selfcheck`, and the `appearance` before log at `5cd63ff`, in the production `App` composition. All four cases are in their correct before states — a1 `before-absent`, a2 `before-no-indicator`, a3 `before-no-appearance-step`, a4 `before-unprotected` — and **none shows an F1 signature**: zero duplicate `proceed()` calls, zero non-live blocker calls, zero invalid-transition throws and zero runtime errors in every case. The same runner defines the fixed-stage oracle of each case, so E17 reruns it unchanged.

It freezes before evidence only. It implements and fixes nothing. It changes no product source, product test, contract, frozen F1 file (the prelude is reused read-only and hash-checked), earlier evidence, ledger or control plane. It accepts nothing and does not authorize Terra. It closes no 312 item.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance in the parent native-verifier role, isolated worktree `.claude/worktrees/agent-acb3dc1f61ea6c156`. It did not write the contract, any product code or any earlier Appearance evidence |
| Requested revision | `5cd63ff` |
| Resolved commit / tree | `5cd63ff652f02a2c726187fe12cbc796218d31c0` / `404bf819a42e20b3e4d372c18a981832ccd54954` (L2 of both logs) |
| Docs base (detached HEAD) | `963036b77e5a08d62f72fe24783019c5f3760257`; `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty (precondition L3 in both logs) |
| Authority | `../web-appearance-recovery-contract/contract.md` r3 (`706c9a3`, SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived at HEAD: precondition L6): §7 items 2 and 4, §9 rows f, g, m, A5, §12 "Appearance F1-shape before" (a1–a4), §13 gates 5 and 7, §14 E5 and E17, §15 (F1 row). `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` "本轮唯一任务" (batch 39). Patterns of `../web-features-recovery-f1/verify-f1-features.mjs` and `f1-features-host.tsx` and of the frozen `../web-sticky-recovery-f1/` runners (read, not imported, not modified) |
| Frozen prelude | `../web-sticky-recovery-f1/f1-prelude.js`, read-only, 139 lines. SHA-256 `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670`: equal to the runner's frozen constant, to the blob committed at HEAD and to the working file; last changed by `0ba68d7` (L2 `frozenPrelude`, precondition L5). The runner stops before building anything if any of the three differs |
| Browser | Chrome/154.0.8037.97 (HeadlessChrome), protocol 1.3, viewport 1280×757 DPR 1; Node v24.16.0; esbuild 0.28.1; react 19.2.0, react-dom 19.2.0, react-router 7.15.1 |
| Lockfile gate | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT`, `git show 5cd63ff:pnpm-lock.yaml`, the extracted archive and the contract gate constant (L2 `lockfileSha256`, precondition L4) |
| Diagnostic iterations | **1 of 3** per mode (`before1`). Development probes are disclosed below |

## Commands

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-appearance-recovery-f1/verify-f1-appearance.mjs 5cd63ff selfcheck before1
XAI_DEPS_ROOT=... node docs/reviews/web-appearance-recovery-f1/verify-f1-appearance.mjs 5cd63ff appearance before1
```

Console lines:

- `PASS … f1-5cd63ff-selfcheck-before1.log verdict=harness-valid checks=134 exit=0 pc1-sidebar-release:held pc2-back-release:held pc3-signout-held-stay:held pc4-signout-proceeds:-`
- `VALID-ORACLE-FAIL … f1-5cd63ff-appearance-before1.log verdict=before-correct checks=111 exit=2 a1:before-absent a2:before-no-indicator a3:before-no-appearance-step a4:before-unprotected`

Exit codes: 0 = pass (selfcheck `harness-valid`; appearance `fixed-pass`); 2 = harness valid but the appearance oracle failed (here: the expected `before-correct` state); 1 = harness invalid. Nonzero exit codes are preserved. Re-invoking `appearance before1` stops with `Error: Evidence exists; use a distinct suffix` before anything is archived (verified, exit 1).

**E17 (fixed stage)** reruns this file unchanged with a new suffix and a matching dependency checkout:

```sh
XAI_DEPS_ROOT=<checkout> node docs/reviews/web-appearance-recovery-f1/verify-f1-appearance.mjs <fixed-sha> selfcheck <suffix>
XAI_DEPS_ROOT=<checkout> node docs/reviews/web-appearance-recovery-f1/verify-f1-appearance.mjs <fixed-sha> appearance <suffix>
```

The fixed product passes when `appearance` reports `verdict=fixed-pass` (exit 0).

**Development probes (disclosed).** Evidence redirected to the session scratchpad through `XAI_F1_EVIDENCE_DIR` (refused inside the repository); none is committed:
- `selfcheck dev1`: harness-invalid. After a sign-out confirmation the AvatarMenu stays open behind its transparent full-viewport scrim (`.avatar-menu-scrim`, `z-index: 99`), which intercepted the hit-test of the More "Discard" button. Change: `closeAvatarMenu` clicks the scrim (trusted, hit-tested) before any later pane click, as a user would.
- `selfcheck dev2`: harness-valid.
- `appearance dev1`: `before-correct`, the same states as `before1`.
- Harness-only edits after `appearance dev1` (validated by the committed runs): the status control is identified by the contract test id inside `.topbar-controls` and its accessible name is recorded rather than required to match exactly; the release count matches the navigation target's pathname (`toPath`) so an object target counts; a status that exists but is misplaced classifies a1/a2 as `fail`, never as a before state; frame-navigation records are windowed per case. No change reversed an assertion's direction.

## Files and SHA-256

All files in this directory except this receipt. L2 of both logs records `fileSha256` for the runner and the host fixture, equal to this table.

| File | Lines | SHA-256 |
| --- | --- | --- |
| `verify-f1-appearance.mjs` (runner) | 987 | `f570b5c9a29d13a59aa3abe3436552a4f90e1107849a7430259cf58513e1f328` |
| `f1-appearance-host.tsx` (host fixture) | 393 | `19b4601f971c8892e674651244541f7e9635027dc5fe2cb56187a9a71a3dadef` |
| `f1-5cd63ff-selfcheck-before1.log` | 140 | `01876092a60ccfa8527935229365d69622b76f8b4ec4ef0047f1fbedb8374f86` |
| `f1-5cd63ff-appearance-before1.log` | 118 | `6da3c371cf1f8a49eb5128bbe89bf386a4eda254b350dfcdb6c5337fd9c501ea` |
| `../web-sticky-recovery-f1/f1-prelude.js` (frozen, reused read-only, not part of this commit) | 139 | `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670` |

## What runs

- **Composition** (`f1-appearance-host.tsx`), all from the immutable archive, nothing mocked: the production `App` composition of `apps/web/src/main.tsx` (module order; the production router instance of `router.tsx` under `RouterProvider` from `react-router/dom`; the production `WebAuthSessionProvider` with `invalidateAccountIdentity`). It is the same production router and coordinator approach as `verify-f1-features.mjs` — the real ComposedSettings with `DepartureCoordinator` and `settingsDeparture`, a browser router, the frozen commit observer — extended to the whole App because a1–a4 need App's Topbar and `App.handleSignOut`.
- **The only synthetic input is the auth session** (a client whose `getSession` resolves account `f1-appearance-A`). With a client and no config the provider takes its legacy branch, so `App.handleSignOut` takes its fallback branch: `requestSettingsDeparture("sign-out")` → `invalidateAccountIdentity(null)` → `client.auth.signOut()` → `clearSessionStorage()` → `window.location.assign("/")`. Fixture setup writes the account's committed generation marker (uninstrumented) before the first render, so the production `AccountDataGate` activates `account/f1-appearance-A/g1` (asserted after every load).
- **Frozen commit observer**: for every React commit the prelude records the coordinator's committed blocker-effect dependencies next to the router's live blocker.
- **Fixture instruments** (log, then delegate; one shared sequence): attempt-level Storage tracing with per-key `setItem` (`QuotaExceededError`) and `removeItem` (`SecurityError`) faults; Web Lock request trace; `pushState`/`replaceState` wrappers and a `popstate` trace; a **router-level navigate trace** installed on the production router before `RouterProvider` renders, so the coordinator's own navigate wrapper delegates to it (a call reaching it is a navigation that reached the router); a `router.subscribe` trace with blocker `proceed()`/`reset()` wrappers recording the blocker's id and the router's live blocker immediately before delegating; the `dispatchEvent` StorageEvent counter; a console.error trace and an error-UI detector (React Router's default error element and the production `Route Error (…)` boundary); the account-scope transition log; auth call counters; a trusted click trace.
- **Input**: trusted CDP mouse input after a centre hit-test and trusted Escape; browser Back and Forward through `Page.navigateToHistoryEntry`; real `window.confirm` dialogs answered through `Page.handleJavaScriptDialog` by plan (a plan entry is removed if no dialog appears within 1.5 s); a runner-initiated navigation answers a `beforeunload` prompt (from the More pane's own listener) with "leave" and records it.
- **The final `window.location.assign("/")`** is observed as a `Document` request for `/` through the CDP `Fetch` domain and answered with HTTP 204, so the browser keeps the current document and its instruments stay readable; the renderer's `Page.frameRequestedNavigation` (`scriptInitiated`) is recorded too.
- **Each case** starts from a fresh document (the touched keys are cleared uninstrumented first) and proves its failure was injected: the fault armed and observed as a `denied` attempt with the expected value, bytes unchanged.

Provenance (L2): one bundle for both modes (`831bb2aa0af1070e…`, CSS `b4ca75d8a975eee8…`); 1013 inputs, of which 621 come from the archive (the 621 modules the guard observed), 390 third-party and **0 foreign**; 320 pinned `@repo` resolutions; guard violations **0**. Precondition L8 confirms that 24 required modules come from the archive, with their SHA-256 in L2 `productHashes`, including `App.tsx` `5d10dba6…`, `departureCoordinator.tsx` `0844a697…`, `Topbar.tsx` `70ba299e…`, `AvatarMenu.tsx` `3401b838…`, `SignOutConfirmDialog.tsx` `c3e9b96b…`, `morePane.tsx` `96c8694d…` and `session.tsx` `5b132d3a…`.

## `selfcheck`: harness-valid (`f1-5cd63ff-selfcheck-before1.log`)

Every assertion in this mode is a precondition; all 134 passed. Zero runtime errors and zero console warnings (L140).

| What it proves | Log lines |
| --- | --- |
| Composition mounted; product tree equals the revision; lockfile gate; frozen prelude hash; contract hash; guard and required modules; zero mount runtime errors | L1–L9 |
| **Commit observer active**: commits recorded, the `DepartureCoordinator` fiber found, zero hook errors | L10 |
| Fault instruments on the probe key; the StorageEvent counter; a real `window.confirm` answered through CDP | L11–L13 |
| **Router-level navigate trace**: one `verify.router.navigate("/app/settings/about")` is one recorded router navigation and one PUSH commit | L15 |
| Appearance keys and per-key lock names (`xai:pref:v1:<key>`); the Topbar popover opens, its Dark option is hit-testable, Escape closes it; the pane's Ocean swatch and the sidebar's Appearance row are hit-testable; no `[data-testid="appearance-status"]` in the clean state; the avatar menu, its Sign Out item and the `SignOutConfirmDialog` open, and Cancel closes it without signing out; the More switch is hit-testable; zero writes on the Appearance and More keys | L16–L45 |
| **pc1 sidebar-release** (the release path a1 needs). A More draft (`Launch at Login` write denied, observed L52); a trusted click on the sidebar's Appearance row is **held** by the coordinator dialog `Unsaved More draft`: location unchanged, zero commits, zero router-level navigations, zero blocker calls, zero history writes (L58). After the fault is lifted, "Retry Launch at Login" releases **exactly once** to `/app/settings/appearance`: one PUSH commit, one `pushState`, exactly one release — one replay of the router's navigate (`toPath` `/app/settings/appearance`) and zero blocker calls — zero non-live calls, the latest value written once, zero runtime errors (L62–L66) | L46–L66 |
| **pc2 back-release** (the frozen F1 shape in this composition). History P `/app/settings/about` → S `/app/settings/more`; a More draft; browser Back is **held** (dialog open, URL and router location restored, zero commits) and the observer saw a coordinator commit carrying the router's live `blocked` blocker (L80–L81). Retry releases to P with location deep-equal, exactly one POP commit, zero push/replace, one `popstate`, **exactly one live `proceed()` from `blocked`** (`PROCEED blocker#2 live=#2:blocked`), zero non-live calls, zero resets, nothing thrown, zero runtime errors (L85–L90). Two stale coordinator commits after the proceed are recorded, not asserted, as in the frozen runners | L67–L90 |
| **pc3 signout-held-stay** (a3's tail). A More draft; sign-out through the real UI (rail avatar → Sign Out → `SignOutConfirmDialog` → Sign Out): no JavaScript dialog, the coordinator dialog `Unsaved More draft` holds, the scope is unchanged and `client.auth.signOut` is not called (L109). **Stay** resolves `false`: dialog closed, scope `account/f1-appearance-A/g1` with zero transitions, zero sign-out calls, zero navigation requests, zero history writes, zero commits, location unchanged (L114); the More draft is kept (L115); zero runtime errors (L116). The avatar menu is then closed through its scrim (L117–L118) and the draft discarded (L119–L120) | L91–L120 |
| **pc4 signout-proceeds** (a4's before-state observation). Sign-out from `/app/tasks` with no drafts: no JavaScript dialog (L135); identity invalidated (scope `locked:null` ×3), one `client.auth.signOut`, and a `Document` request for `/` (intercepted 204; `frameRequestedNavigation` `scriptInitiated`). Before that, the route gate replaced the location with `/auth/login?next=%2Fapp%2Ftasks` (L134, L136) | L121–L136 |
| All four controls show zero F1 signature counts | L137 |

This demonstrates, at this revision and in this composition, the observation paths that a1–a4 execute on the fixed product: a programmatic hold and its one-replay release (pc1), a POP hold and its one live `proceed()` (pc2), the coordinator's sign-out hold with Stay resolving `false` (pc3) and a sign-out that resolves `true` (pc4).

## `appearance`: before state at `5cd63ff` (`f1-5cd63ff-appearance-before1.log`)

Product assertions are deferred (recorded without stopping); preconditions stop the run. Zero preconditions failed; 6 deferred product failures, all expected for the before state (L118). Run verdict: `before-correct`.

| Case | Scenario (contract §12) | Failure injected (preconditions) | Before observation | State | F1-signature counts (dup. `proceed()` / non-live / invalid-transition / runtime errors) | Log lines |
| --- | --- | --- | --- | --- | --- | --- |
| **a1** | Host row m: status navigation held by the More coordinator, released by a More Retry | On `/app/settings/more`: Topbar Dark with `setItem(xai_pref_theme)` denied (`set:"dark"!denied`, bytes absent, L21–L22); More `Launch at Login` denied (`set:true!denied`, L26–L28), "Launch at Login was not saved." with Retry shown | **No `[data-testid="appearance-status"]` exists** (L29, deferred FAIL): there is nothing to activate. Zero blocker calls, zero runtime errors (L30) | `before-absent` | 0 / 0 / 0 / 0 | L11–L31 |
| **a2** | Back from the Appearance pane with a failed Appearance choice | History P `/app/settings/about` → S `/app/settings/appearance` (L37); pane accent Ocean with `setItem(xai_accent_hue)` denied (`set:230!denied`, bytes absent, L41–L42) | Back is **not held**: location deep-equal P, no dialog (L44); zero blocker calls, exactly one POP commit to P, zero push/replace (L45); **no Topbar status on the destination** (L46, deferred FAIL); zero runtime errors (L47) | `before-no-indicator` | 0 / 0 / 0 / 0 | L32–L48 |
| **a3** | Sign-out with Appearance and More drafts | On `/app/settings/more`: Topbar Dark denied (L59–L60); More draft (L64–L66); sign-out through the real UI (L73) | **Zero `window.confirm`** — no Appearance step (L76, deferred FAIL); the coordinator holds with `Unsaved More draft`, scope unchanged, no sign-out call (L77); **Stay resolves `false`**: dialog closed, zero scope transitions, zero sign-out calls, zero navigation requests, zero history writes, zero commits, location unchanged (L81); zero runtime errors (L87) | `before-no-appearance-step` | 0 / 0 / 0 / 0 | L49–L88 |
| **a4** | Sign-out from `/app/tasks` with a failed Topbar choice; Cancel at the new step | Topbar Dark denied (L99–L100); sign-out through the real UI (L107); a Cancel plan prepared for the Appearance step | **Zero `window.confirm`** (L110, deferred FAIL); `handleSignOut` **resolved `true`**: identity invalidated (scope `locked:null`, epochs 3–5), one `client.auth.signOut`, the route gate replaced the location with `/auth/login?next=%2Fapp%2Ftasks`, and a document request for `/` (L111, deferred FAIL); no Topbar status (L112, deferred FAIL); zero runtime errors (L113) | `before-unprotected` | 0 / 0 / 0 / 0 | L89–L114 |

Summary record (L115): `states` equal `expectedBefore` for all four cases; `signatureFree: true`. Zero `proceed()` calls occurred in the whole appearance run, so no case can carry a duplicate or non-live call. One console warning, not an error: `[plugin-web-storage] quota exceeded for xai_accent_hue.` (the legacy `setPref` on the injected quota fault). One `beforeunload` prompt, answered "leave", came from the More pane's own listener when the runner opened a fresh document after a1 (recorded as runner-initiated, L118).

## Fixed-stage cases, defined now (assertions that first execute on the fixed product)

Each case first proves its failure was injected, exactly as above. Then:

1. **a1** — the status (`[data-testid="appearance-status"]` inside `.topbar-controls`; the expected accessible name `Appearance changes not saved. Review them in Settings.` is recorded) is activated by a trusted click while the More draft is current. **Held**: the coordinator dialog `Unsaved More draft`, location unchanged, zero commits, zero history writes. After the More fault is lifted, "Retry Launch at Login" must **release exactly once** to `/app/settings/appearance`: one router location commit, exactly one release counted as router-level navigate calls to that pathname plus live `proceed()` calls from `blocked` (a programmatic hold is released by one replay of the router's navigate, as pc1 shows; a blocker release by one live `proceed()`, as pc2 shows), zero non-live blocker calls, zero resets, nothing thrown, the dialog closed, the More value written once, zero runtime errors.
2. **a2** — Back from the pane after the failed accent choice is **not held** (location deep-equal P, zero blocker calls, one POP commit, zero push/replace), the Topbar status is shown on P, and after an unguarded Forward the pane shows "Accent color was not saved." with "Retry Accent color" (drafts intact); zero runtime errors.
3. **a3** — exactly one `window.confirm` with the §5 text `Some appearance changes are not saved. Sign out and discard them?`, answered OK; then the coordinator holds (`Unsaved More draft`), no sign-out call; **Stay resolves `false`** with identity intact, zero scope transitions, zero navigation requests, zero history writes and zero commits; zero runtime errors.
4. **a4** — exactly one `window.confirm` with the same text, answered Cancel; **resolves `false`**: no identity invalidation, zero sign-out calls, zero navigation requests, zero history writes, zero commits; the Topbar status is kept; zero runtime errors.

A case is `fixed-pass` only when all its deferred checks pass; the run is `fixed-pass` only when all four are, with zero F1-signature counts. `f1-signature` means a duplicate `proceed()` on one blocker, a non-live blocker call or an `Invalid blocker state transition` throw. Every expected string comes from contract §5 or from the unchanged coordinator and More pane.

## Contract and source observations

None blocks freezing.

1. **Row m's "one live `proceed()`" for a programmatic navigation.** The coordinator holds a programmatic navigation in its own `router.navigate` wrapper, without a router blocker, and releases it by replaying the original navigate once (`departureCoordinator.tsx:131–156`); pc1 shows exactly that (one router-level navigation, zero blocker calls). The App callback of contract §7 item 2 calls `navigate`, so a1's release on the fixed product is expected to take this path. The oracle therefore counts one release as either one router-level replay or one live blocker `proceed()`, and still requires zero non-live calls and one commit.
2. **The AvatarMenu stays open after a sign-out confirmation**, and its transparent scrim intercepts pointer input outside the coordinator dialog until clicked (pc3 and a3 close it through the scrim). The coordinator dialog's own buttons stay reachable.
3. **a4's before sequence** includes a route-gate `REPLACE` to `/auth/login?next=%2Fapp%2Ftasks` before `window.location.assign("/")`, after the session is cleared.

## Limitations

- Headless Chrome 154 on macOS, not Tauri; a synthetic account and session; the legacy auth branch only (the managed coordinator branch of `handleSignOut` is covered by Sol's host mode). Development build without StrictMode.
- `window.location.assign("/")` is answered with HTTP 204 so the document stays inspectable; a real deployment would load the auth entry.
- Back and Forward only for POP; one run per mode at 1280×757; the DesktopPet stays on and is never near the controls used.
- The fixed-stage branches first execute on the fixed product. Their observation paths are exercised here by pc1–pc4 at this revision; the Appearance-specific strings and selectors come from contract §5.
- Third-party dependencies are reused read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
- Under contract §12, any later correction must use a new suffix, rerun on both archives and never weaken an assertion.
