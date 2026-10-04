# Features F1 before baseline (CP-FEATURES-01, batch 24, contract §14 E5)

**Verdict: FROZEN.** This directory freezes the Features F1 runner and host fixture, a harness-valid `selfcheck`, and the `features` before log at `f359be6`: after a failed toggle, and after a failed Reset to defaults, a browser Back (POP) departure is **not held**. That is H8's correct before state, not an F1 signature. The same runner defines the fixed-stage cases r1, d1, r2 and rb, so E17 reruns it unchanged.

It freezes before evidence only. It implements nothing and fixes nothing. It changes no product source, product test, contract, frozen Sticky F1 file (the prelude is reused read-only and hash-checked), ledger or control plane. It accepts nothing and authorizes nothing: Terra stays unauthorized until E1–E5 are frozen and the controller decides. It closes no 312 item: REL-05, REL-07, REL-10, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, SET-03 and D2/REL/AI stay open.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent native-verifier role, isolated worktree. It did not write the contract, any product code or any earlier Features evidence |
| Requested revision | `f359be6` |
| Resolved commit / tree | `f359be6d838393e0f9e93efd80b88b5b09f6144e` / `2280bc7617d52dc6c4356da257d57940ecb174ec` |
| Docs base (detached HEAD) | `0d61d617e466097e3eb74eaf9274495c97982b6b`; `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (L3 in both logs) |
| Authority | `../web-features-recovery-contract/contract.md` §3 item 12, §9 rows c, i and m, §12 "Features F1 before" and H8, §13 gate 7, §14 E5 and E17, §15 (F1 row); `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` CP-FEATURES-01 and "本轮唯一任务" (batch 24); patterns of `../web-sticky-recovery-f1/verify-f1.mjs`, `verify-f1-callers.mjs` and `f1-host.tsx` (read, not imported, not modified) |
| Frozen prelude | `../web-sticky-recovery-f1/f1-prelude.js`, read-only. SHA-256 `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670`: equal to the runner's frozen constant, to the blob committed at HEAD and to the working file; last changed by `0ba68d7` (L2 `frozenPrelude`, precondition L5 in both logs). The runner stops before building anything if any of the three differs |
| Browser | Chrome/154.0.8037.97 (headless), protocol 1.3, viewport 1280×757 DPR 1; Node v24.16.0; esbuild 0.28.1; react 19.2.0, react-dom 19.2.0, react-router 7.15.1 |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT`, `git show f359be6:pnpm-lock.yaml` and the extracted archive (L2 `lockfileSha256`, precondition L4) |
| Diagnostic iterations | **1 of 3** (`before1`) for this harness. No fixture correction after the first committed run |

## Commands

From the repository root of this worktree:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-features-recovery-f1/verify-f1-features.mjs f359be6 selfcheck before1
XAI_DEPS_ROOT=... node docs/reviews/web-features-recovery-f1/verify-f1-features.mjs f359be6 features before1
```

Console lines:

- `PASS … f1-f359be6-selfcheck-before1.log verdict=harness-valid checks=105 exit=0 sr:held-released-once sd:held-released-once s2:held-released-once`
- `VALID-ORACLE-FAIL … f1-f359be6-features-before1.log verdict=before-not-held checks=58 exit=2 r1:not-held d1:not-held r2:not-held rb:not-held`

Exit codes: 0 = pass (selfcheck harness-valid; features `fixed-pass`); 2 = harness valid but the features oracle failed (here: the expected before state); 1 = harness invalid. Rerunning an existing suffix stops with `Evidence exists; use a distinct suffix` before anything is archived (verified for `features before1`).

**E17 (fixed stage)** reruns this file unchanged with a new suffix and a matching dependency checkout:

```sh
XAI_DEPS_ROOT=<checkout> node docs/reviews/web-features-recovery-f1/verify-f1-features.mjs <fixed-sha> selfcheck <suffix>
XAI_DEPS_ROOT=<checkout> node docs/reviews/web-features-recovery-f1/verify-f1-features.mjs <fixed-sha> features <suffix>
```

The fixed product passes when `features` reports `verdict=fixed-pass` (exit 0).

**Development probes (disclosed).** Following the frozen F1 runners' precedent, I ran one probe per mode (`dev1`, evidence redirected outside the repository with `XAI_F1_EVIDENCE_DIR`, which the runner refuses inside the repository). They led to three harness-only changes: a log-record field collision fixed (`buttonName`), the failure-feedback check reading the whole Settings detail text instead of a truncated copy, and code cleanup. No assertion changed direction. No probe output is committed; both committed logs were produced by the committed files (hashes below equal L2 `fileSha256`).

## Files and SHA-256

| File | Lines | SHA-256 |
| --- | --- | --- |
| `verify-f1-features.mjs` (runner) | 705 | `d0ac8c68823bded7d8f4aae4012c6be48d07d489cc168de8f271a5e752afd537` |
| `f1-features-host.tsx` (host fixture) | 324 | `18272ac012ca878009b9311d6888d388e455b5250e5cd90a2904c55b5c17747b` |
| `f1-f359be6-selfcheck-before1.log` | 114 | `b68d9a25af48051b49b3b01241267c01e4a42917f2f8005bef4b6d3974b42673` |
| `f1-f359be6-features-before1.log` | 69 | `59f9761abbaccc18c44464779034aa9d6ff0d6ce89bc89d4457a825f127db98e` |
| `../web-sticky-recovery-f1/f1-prelude.js` (frozen, reused read-only, not part of this commit) | 139 | `67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670` |

## What runs

- **Composition** (`f1-features-host.tsx`), all from the immutable archive, nothing mocked: the composition of the frozen F1 fixtures, i.e. the production `Shell` + `WebShellProvider` + `webShellModuleRegistrations`, the production ComposedSettings (sidebar, `DepartureCoordinator`, `settingsDeparture`), `createBrowserRouter` under `RouterProvider` from `react-router/dom`, a synthetic active account and no auth gate. The pane under test is chosen only by the route: `/app/settings/features`, and `/app/settings/sticky` for the selfcheck positive controls.
- **Frozen commit observer**: the prelude's React DevTools hook records, for every commit, the coordinator's committed blocker-effect dependencies next to the router's live blocker.
- **Fixture instruments** (log, then delegate; one shared sequence):
  - attempt-level Storage tracing with per-key `setItem` and `removeItem` faults (`SecurityError`, never reaching storage);
  - Web Lock request trace; `pushState`/`replaceState` wrappers and a `popstate` trace;
  - a `router.subscribe` trace with blocker `proceed()`/`reset()` wrappers that record the blocker's id and the router's live blocker immediately before delegating;
  - the instrumented `window.dispatchEvent` (StorageEvent keys);
  - a console.error trace, a router error-element detector and a trusted click trace.
- **Input**: trusted CDP mouse input after a centre hit-test; browser Back and Forward through `Page.navigateToHistoryEntry`; the real `window.confirm` answered through `Page.handleJavaScriptDialog`.
- **History** per run: start `/app/settings/hotkeys` → P `/app/settings/about` (state `{token:"f1-P"}`, no guard) → S, the pane under test. Every case starts clean at S; Back targets P; after each case an unguarded Forward returns to S and the pane must remount clean.
- **Features seeds** (written uninstrumented before the pane first mounts): Boards stored `true`; Calendar and Habits stored `false`, so rb's removals are real.

Provenance (L2): one bundle for both modes (`23295298a5e0cc44…`, CSS `ca5ccb28e2363aab…`); 629 inputs, of which 559 come from the archive (the 558 files observed by the guard plus the virtual `<define:import.meta.env>` input), 69 third-party and **0 foreign**; guard violations **0**. Preconditions L6–L7 confirm this and that 12 required modules come from the archive, with their SHA-256 in L2 `productHashes`. These include `departureCoordinator.tsx` `0844a697…`, `FeaturesPane.tsx` `987c3825…`, `internal/featuresPane.tsx` `14053daa…`, `SettingsFooter.tsx` `afecc734…`, `stickyPane.tsx` `721d7556…`, `usePref.ts` `e1f2c913…`, `usePrefAsync.ts` `541fae97…` and `prefMutation.ts` `3f8840ac…`.

## `selfcheck`: harness-valid (`f1-f359be6-selfcheck-before1.log`)

Every assertion in this mode is a precondition. All 105 checks passed; zero runtime errors and zero console warnings (L114).

| What it proves | Log lines |
| --- | --- |
| Composition mounted; product tree equals the revision; lockfile gate; frozen prelude hash; guard and required modules; zero mount runtime errors | L1–L8 |
| **Commit observer active**: commits recorded, the `DepartureCoordinator` fiber found, zero hook errors | L9 |
| Fault instruments on the probe key only: faulted `setItem`/`removeItem` throw `SecurityError`, are logged `denied` and never reach storage; disarmed operations delegate | L10 |
| The `dispatchEvent` StorageEvent counter records a dispatched event | L11 |
| A real `window.confirm` is answered through CDP and recorded with its message | L12 |
| Features surface without editing: 8 keys `xai_pref_features_<id>` and lock names `xai:pref:v1:xai_pref_features_<id>`; all 8 switches and "Reset to defaults" present and centre-hit-tested; zero Features writes at mount | L13–L34 |
| **sr**, Retry-released Back on the accepted Sticky guard registrant: failure injected and observed, Back held (dialog open, URL and location restored, zero commits), the observer saw a coordinator commit carrying the router's live `blocked` blocker; Retry released to P with location deep-equal, exactly one POP commit, zero push/replace, the latest value written once, **exactly one live `proceed()` from `blocked`, zero non-live blocker calls**, zero runtime errors | L39–L60 (L56: one `PROCEED blocker#2 live=#2:blocked`) |
| **sd**, discard-released Back: the same, with zero writes | L61–L82 |
| **s2**, two-step release (two failed fields): the first successful Retry kept the departure held (dialog open, zero commits, zero blocker calls), the second released exactly once | L83–L110 (L99 intermediate hold) |
| All three controls held and released exactly once, no F1 signature | L111 |

This demonstrates that the commit observer and the blocker instrumentation work on the real coordinator in this host, that a held POP is observable here, and that the held-branch code that r1, d1, r2 and rb will execute on the fixed product (single and two-step releases) runs correctly at this revision.

## `features`: before state at `f359be6` (`f1-f359be6-features-before1.log`)

Product assertions are deferred: they are recorded without stopping the run. Preconditions stop it. Zero preconditions failed; 8 deferred product failures, all expected (L69). The run verdict is `before-not-held`.

| Case | Failure injected (precondition) | Before observation | Departure (Back to P) | Log lines |
| --- | --- | --- | --- | --- |
| r1 (fixed: Retry-released Back) | Boards `setItem` denied (latest `false`), bytes stay `true` (L18–L19) | No "Boards was not saved." and no "Retry Boards" (L20, deferred FAIL); the switch snapped back to on (L21) | **not held**: no dialog, router left to `/app/settings/about` with one `POP` commit, 0 blocker calls, 0 `proceed()`, 0 push/replace, 0 runtime errors (L23–L24) | L15–L26 |
| d1 (fixed: discard control) | same (L30–L31) | same (L32–L33) | **not held**, same facts (L35–L36) | L27–L38 |
| r2 (fixed: r1 repeated) | same (L42–L43) | same (L44–L45) | **not held**, same facts (L47–L48) | L39–L50 |
| rb (fixed: reset-batch-released Back) | Calendar and Habits seeded `false` (L52–L53); "Reset to defaults" found once by role and name and confirmed through the real dialog (`Reset every preference to defaults? This clears saved theme, layout, and module toggles.`, L57); both `removeItem` calls denied, bytes stay `false` (L58–L59) | No "… was not reset to its default." and no Retry (L60, deferred FAIL); 1 `key:null` StorageEvent; in this host all 8 switches show on, including Calendar and Habits whose bytes stay `false` (L61) | **not held**, same facts (L63–L64) | L51–L66 |

- **F1 signature:** absent in every case (`f1Signature: false`, zero `proceed()` calls). Not holding is H8's before state, not an F1 failure.
- After each case an unguarded Forward returned to S and the pane remounted clean (L26, L38, L50, L66).
- One console warning, not an error (L69): `[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.`. The legacy `setPref` emits it once when the injected `SecurityError` is not a quota error (`storage.ts:204–222`).
- **Consistency with earlier evidence:** H8 for a failed toggle and a failed reset (E3 host baseline), and the hook-layer "shows on while bytes stay false" after the raw reset, visible in rb's L61 because this host mounts no `AccountDataGate` (Sol `reset` L740–757). E4 records the production-App behavior, where the gate remounts.

## Fixed-stage cases, defined now (assertions that first execute on the fixed product)

Each case first proves its failure was injected, then performs a browser Back. Once the departure is held, the case asserts:

1. **Held**: the dialog is open with the label `Unsaved Features draft`, never the "Smart Lists" fallback; the URL and the router location `{pathname,key,state}` are restored to S; zero commits; the observer saw a coordinator commit carrying the router's live `blocked` blocker.
2. **Release** (from the release mark until the location reaches P):
   - location deep-equal P and window path P;
   - exactly one router commit, `POP` to P's key; zero `pushState`/`replaceState`; one `popstate`; history length unchanged;
   - the dialog closed;
   - **exactly one live `proceed()`** from `blocked` (blocker id equal to the live blocker's), zero non-live blocker calls, zero `reset()` calls, nothing thrown;
   - zero console errors, zero CDP runtime errors and no router error element.
3. **Writes per case**:
   - **r1, r2**: release by "Retry Boards" after the fault is lifted; exactly one `setItem` of the latest value, bytes equal to it.
   - **d1**: release by "Discard local changes and leave"; zero set/remove attempts on the key.
   - **rb**: Reset to defaults with `removeItem` faults on Calendar and Habits (the confirmation answered through the real dialog). The case first requires "Calendar was not reset to its default." / "Retry Calendar" and the Habits equivalents. It then lifts the Calendar fault and clicks "Retry Calendar": Calendar's removal must complete while the departure **keeps holding** (dialog open, location S, zero commits, zero blocker calls, zero history writes). It then lifts the Habits fault and clicks "Retry Habits": the departure must release exactly once with the commit and history assertions above, exactly one successful removal of each key, and both keys absent (contract §9 row m, Back run).
4. **Return**: an unguarded Forward to S with the pane clean (no lingering Retry).

At the fixed stage the run verdict must be `fixed-pass`. `f1-signature` means a release with two or more `proceed()` calls and an invalid blocker transition; `fail` means anything else. Every expected string comes from contract §5 (`Retry <Label>`, `<Label> was not saved.`, `<Label> was not reset to its default.`, the guard label `Features`) or from the unchanged coordinator (`Discard local changes and leave`, `Unsaved <label> draft`). The AppRail departure run of row m and the guarded Forward rows are E12, not E17.

## Contract and source observations

None blocks freezing.

1. E17's wording ("exactly one live `proceed()`, zero non-live blocker calls and zero runtime errors") is implemented literally. Non-live means the called blocker is not the router's live blocker, or the live blocker is not `blocked`.
2. The frozen Sticky runner's commit oracle also requires exactly one `popstate` and an unchanged history length. They are kept here; the Sticky positive controls pass them at `f359be6` (L54, L76, L104).
3. Stale coordinator commits (a committed `blocked` snapshot while the live blocker is already `proceeding`) appear in every Sticky control release: 2 per case, the same pattern as the accepted post-F1 logs. They are recorded, not asserted, as in the frozen runners. Exactly-once `proceed()` is the oracle.

## Limitations

- Headless Chrome 154 on macOS, not Tauri. The composition is the F1 host (Shell + ComposedSettings, synthetic account, no auth gate, no `AccountDataGate`, no App readers). Production-App effects of the reset (relock, remount, rail and pet) are E4/E13's.
- Development build without StrictMode, `import.meta.env` defined as `{}` (contract §15 retained exclusions).
- Back only; Forward and AppRail departures belong to E12. One run per mode at 1280×757.
- The Features held branch first executes on the fixed product. Its code path, including the two-step release that rb uses, is the one the Sticky positive controls exercise and pass at this revision. Features-specific strings and selectors (`[data-feature-id="board"] [role="switch"]`, "Reset to defaults" by role and name, the §5 Retry and message wording) are taken from the contract.
- Third-party dependencies are reused read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
- Under contract §12, any later correction must use a new suffix, rerun on both archives and never weaken an assertion.
