# Features actual-host before baseline (CP-FEATURES-01, batch 23, contract §14 E3)

**Verdict: FROZEN.** This directory freezes the parent-role actual-host before oracles for the Settings Features caller (all 8 module toggles and Reset to defaults), before any implementation.

It implements nothing and fixes nothing. It changes no product source, product test, contract, Sol file, ledger or control plane. It accepts nothing and authorizes nothing: Terra stays unauthorized until E1–E5 are frozen and the controller decides. It closes no 312 item: REL-05, REL-07, REL-10, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, SET-03 and D2/REL/AI stay open.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent host-verifier role, isolated worktree. Distinct from the Features Sol verifier; did not write the contract or any product code |
| Requested fixed revision | `f359be6` |
| Resolved fixed commit / tree | `f359be6d838393e0f9e93efd80b88b5b09f6144e` / `2280bc7617d52dc6c4356da257d57940ecb174ec`; features package tree `074659c050fadd11ed3ff99274e441b48771b490` (equals the contract) |
| Docs base (detached HEAD) | `c49dd505a9d84aac17dc0d5fcdb3a2648bd15a41`. `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` is empty |
| Authority | `../web-features-recovery-contract/contract.md` §3 (items 5, 6, 8, 12), §5, §6, §7, §9 and §12 ("Parent host baseline", "Validity and positive controls", H8, with H1 and H5 at host level), §14 E3; `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` CP-FEATURES-01 (including "合同 §3 遗漏的源码事实") and "本轮唯一任务" (batch 23) |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT`, `git show f359be6:pnpm-lock.yaml` and the extracted archive (log L14–L16) |
| Archive product hash check | `FeaturesPane.tsx` = `987c3825…` and `internal/featuresPane.tsx` = `14053daa…` (contract preamble), `departureCoordinator.tsx` = `0844a697…` (the accepted F1 repair); 16 archive file hashes in log L18 |
| Diagnostic iterations | 1 of 3 (`before1`). No fixture correction was needed |

## Command

Run from the repository root of this worktree:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop node docs/reviews/web-features-recovery-independent/verify-fixed.mjs f359be6 host before1
```

Console: `host f359be6 (f359be6d8383): vitest_exit=1 harness=PASS exit=1 cases=40 passed=7 failed=33 precondition=0`. Runner exit status 1.

Fixed rerun (E8), with the unchanged files, a new suffix and an `XAI_DEPS_ROOT` checkout whose lockfile matches the fixed SHA:

```sh
XAI_DEPS_ROOT=<checkout> node docs/reviews/web-features-recovery-independent/verify-fixed.mjs <fixed-sha> host fixed1
```

## Files and SHA-256

| File | Lines | SHA-256 |
| --- | --- | --- |
| `host.test.tsx` (oracle) | 988 | `816e870ac123f12fced9a35285936627c8d86c3390fb0b905bcf0419d5f722f6` |
| `verify-fixed.mjs` (runner) | 393 | `d92901b477567a08ced08ec0c37318b5af31e2f459320dfa9b0caa7e93de72c1` |
| `host-before1-f359be6.log` | 891 | `977fc6565d5a18973473d3cd551d78eeb0213676732645fde2af5afa7dd098c0` |

The log header (L1–L26) records `requested_revision=f359be6`, `resolved_commit=f359be6d…`, `resolved_tree`, `runner_checkout_head=c49dd505…`, all three lockfile hashes and `oracle_sha256 host.test.tsx=816e870a… verify-fixed.mjs=d92901b4…` (L17), equal to the table. The log was produced by exactly these files.

## What runs

- **Actual composition, all from the immutable archive, none of it mocked:**
  - the production router factory `createBrowserRouter` over jsdom's `History`. Browser Back and Forward are real POP traversals through the coordinator's `useBlocker`; `router.navigate(...)` calls go through the coordinator's navigate wrapper;
  - under `/app`, the production `AccountDataGate` (the props `AccountStorageGate` passes for a signed-in, non-demo account: `accountId` A, `authenticated`, `demo=false`, `lang="en"`; the AI secret participant is omitted) around `WebShellProvider` (production `webShellModuleRegistrations`) and the production `Shell`, whose `Outlet` renders the child routes. This mirrors the production nesting (router → `App` → `AccountStorageGate` → `AccountDataGate` → `WebShellProvider` → `Shell` → `Outlet`);
  - the production `ComposedSettings` (`composedSettingsRegistration`), its `DepartureCoordinator` and the `requestSettingsDeparture("sign-out")` preflight that `App.handleSignOut` awaits;
  - the real Features pane with its shared `SettingsFooter`, legacy `usePref`/`setPref`, the async storage hook and engine, registry, codec and `accountScope`. Account A starts locked with a committed generation marker, and the real gate activates it at mount (every host-mounting case's preconditions check that account A, generation `g1`, is active and that no gate screen is shown).
- **Route table.** `/app` renders the frame above; `settings/*` renders `ComposedSettings`; `:moduleId/*` renders a placeholder destination for modules outside Settings.
- **Test-owned fixtures:**
  - an attempt-logging `localStorage` injector. Every get, set and remove is recorded before delegation. An armed key's `setItem` throws `DOMException(…, "QuotaExceededError")` and an armed key's `removeItem` throws `DOMException(…, "SecurityError")`; neither reaches storage;
  - an exclusive FIFO Web Lock manager with shared cohorts as `navigator.locks` (any request shape other than `(name, {mode}, cb)` or `(name, cb)` is rejected and recorded);
  - a `window.confirm` recorder (answer chosen per case), a `window.dispatchEvent` StorageEvent counter (key recorded), `pushState`/`replaceState` counters and a runtime-error recorder (window `error`, process `unhandledRejection`);
  - jsdom shims: Node's `AbortController` for router `Request`s, `ResizeObserver`, `requestAnimationFrame`.
- **Seeds.** All 8 keys hold valid, alternating bytes: `tasks=true`, `board=false`, `dashboard=true`, `calendar=false`, `matrix=true`, `pomodoro=false`, `habits=true`, `meditation=false`. Each field's latest choice inverts its seed, so both directions (turn off, turn back on) are exercised. Controls are selected only through `[data-feature-id="<id>"] [role="switch"]` and the "Reset to defaults" button by role and name, inside `section.settings-detail[data-pane="features"]`.
- **Representatives.** Boards is the representative failed toggle for every H8 navigation form. Calendar is the key whose `removeItem` is denied in the failed reset.

## Results at `f359be6`

| Group | Cases | PASS | FAIL | `PRECONDITION:` lines |
| --- | --- | --- | --- | --- |
| FIXTURE validity | 3 | 3 | 0 | 0 |
| Positive controls PC1–PC4 | 4 | 4 | 0 | 0 |
| Per field F-a (latest choice), F-b (sidebar route), F-c (sign-out) | 24 | 0 | 24 | 0 |
| H8 forms on Boards (N-*) | 8 | 0 | 8 | 0 |
| Failed Reset to defaults (R-route) | 1 | 0 | 1 | 0 |
| **Total** | **40** | **7** | **33** | **0** |

- Per-test status lines at L31–L118, Vitest totals at L120–L121, the "Failed Tests 33" block at L225–L796, the runner summary at L799–L891 (totals L801, harness 6/6 at L802–L807, per-case list at L808–L880, OBSERVED facts at L881–L886, module pin at L887–L891).
- All 33 failures are `AssertionError`s raised by the first business assertion of each case: 33 `FAIL` headers and 33 `AssertionError` lines in the failure block. The log contains no `PRECONDITION:` line, no `TypeError`, no Testing Library lookup error, no unhandled error or rejection (`unhandled_error_lines=0`) and no `RUNTIME-ERRORS` line (`runtime_error_lines=0`), L801.

### Per field (H1 at host level, H8 route and sign-out)

Each cell gives the disposition, the stdout status/message lines and the failure-block line.

| Field (seed → latest) | (a) Latest choice displayed after the denied write [H1 host] | (b) Settings sidebar departure to Hotkeys [H8 route] | (c) Voluntary sign-out [H8 sign-out] |
| --- | --- | --- | --- |
| `tasks` (true → false) | **confirmed**, L47–48 / L228: `expected 'true' to be 'false'` | **confirmed**, L63–64 / L356: `expected '/app/settings/hotkeys' to be '/app/settings/features'` | **confirmed**, L79–80 / L492: `expected true to be 'pending'` |
| `board` (false → true) | **confirmed**, L49–50 / L244: `expected 'false' to be 'true'` | **confirmed**, L65–66 / L373: same route escape | **confirmed**, L81–82 / L511: `expected true to be 'pending'` |
| `dashboard` (true → false) | **confirmed**, L51–52 / L260 | **confirmed**, L67–68 / L390 | **confirmed**, L83–84 / L530 |
| `calendar` (false → true) | **confirmed**, L53–54 / L276 | **confirmed**, L69–70 / L407 | **confirmed**, L85–86 / L549 |
| `matrix` (true → false) | **confirmed**, L55–56 / L292 | **confirmed**, L71–72 / L424 | **confirmed**, L87–88 / L568 |
| `pomodoro` (false → true) | **confirmed**, L57–58 / L308 | **confirmed**, L73–74 / L441 | **confirmed**, L89–90 / L587 |
| `habits` (true → false) | **confirmed**, L59–60 / L324 | **confirmed**, L75–76 / L458 | **confirmed**, L91–92 / L606 |
| `meditation` (false → true) | **confirmed**, L61–62 / L340 | **confirmed**, L77–78 / L475 | **confirmed**, L93–94 / L625 |

- **(a)** In the actual host, every switch snaps back to its seeded value after the denied write (`aria-checked` shows the old value), in both directions; the old bytes remain (precondition).
- **(b)** The router leaves Features for `/app/settings/hotkeys` with no decision dialog.
- **(c)** `requestSettingsDeparture("sign-out")` resolves `true` immediately instead of waiting for a decision and resolving `false` on Stay.

### H8 navigation forms on the representative failed field (Boards)

| Form | Case | Disposition | Log lines and observed outcome |
| --- | --- | --- | --- |
| Settings sidebar row activation (`Hotkeys`) | F-b `board` | **confirmed** | L65–66 / L373: router left to `/app/settings/hotkeys` |
| AppRail module button (`Tasks`) | N-rail | **confirmed** | L95–96 / L644: router left to `/app/tasks` |
| Programmatic module navigation `router.navigate("/app/dashboard")` | N-programmatic | **confirmed** | L97–98 / L661: router left to `/app/dashboard` |
| Browser Back `history.back()` (POP through the blocker) | N-back-pop | **confirmed** | L99–100 / L678: router left to `/app/settings/hotkeys` |
| Browser Forward `history.forward()` (POP through the blocker) | N-forward-pop | **confirmed** | L101–102 / L695: router left to `/app/settings/hotkeys` |
| Programmatic history Back `router.navigate(-1)` | N-back-delta | **confirmed** | L103–104 / L712: router left to `/app/settings/hotkeys` |
| Programmatic history Forward `router.navigate(1)` | N-forward-delta | **confirmed** | L105–106 / L729: router left to `/app/settings/hotkeys` |
| Relative `router.navigate("../hotkeys", { relative: "path", state })` | N-relative | **confirmed** | L110–111 / L746: router left to `/app/settings/hotkeys` |
| Voluntary sign-out | F-c `board` | **confirmed** | L81–82 / L511: resolved `true` |
| Cancelable `beforeunload` dispatch | N-beforeunload | **confirmed** | L112–113 / L763: `expected false to be true`. OBSERVED L108: `{"prevented":false,"storageAttempts":0}`: the event was **not prevented** (no warning) |

**Summary.** H8 is confirmed at host level for every navigation form, for sign-out and for beforeunload; H1 is confirmed at host level for all 8 fields in both directions. No hypothesis exercised here was refuted at the route/sign-out level.

The source explains the behavior. `featuresPane.render` forwards only `lang` (`internal/featuresPane.tsx:19`) and `FeaturesPane` never consumes `registerDepartureGuard`, so the coordinator's `useBlocker`, navigate wrapper and sign-out delegate are mounted but `canBlock()` stays `false` and every producer falls through. The legacy `setPref` returns `false` on the denied write and `usePref` keeps its previous value (`usePref.ts:141–146`); the pane discards the result (`FeaturesPane.tsx:69–73`).

### The failed Reset to defaults (R-route, Calendar `removeItem` denied)

| Item | Value |
| --- | --- |
| Route outcome after the reset, Settings sidebar row to Hotkeys | **confirmed** (H8 for a failed reset; the required hold is absent), L117–118 / L782: `expected '/app/settings/hotkeys' to be '/app/settings/features'` |
| Preconditions that held | the armed `removeItem` fault on `xai_pref_features_calendar` fired; the accepted reset removed the 7 unfaulted keys; Calendar kept its seeded `"false"`; no unsupported lock shape; afterwards the router, Features pane, sidebar and AppRail were present, account A active, no gate screen, no dialog |

Observed facts for the reset (OBSERVED L115, repeated at L886; recorded, not asserted):
- `window.confirm` was asked once with the shared footer text `Reset every preference to defaults? This clears saved theme, layout, and module toggles.` (H7 wording belongs to Sol).
- 8 raw `removeItem` attempts in `featureIdOrder`, Calendar `threw:true`, zero set attempts. Bytes afterwards: Calendar `"false"`, the other 7 absent.
- Exactly **one** `StorageEvent` with `key === null` was dispatched, and no keyed StorageEvent.
- The displayed values after settle were Calendar **off** (`"false"`) and the other 7 on. No dialog was open. The pane showed no "on" for Calendar at any committed point (next section).

### Observed `AccountDataGate` behavior (control-plane source fact, confirmed at host level)

The reset's synthetic `key:null` `StorageEvent` reaches `AccountDataGate`'s `storage` listener (`AccountDataGate.tsx:65–69`), which treats `key === null` as a generation-marker change. Recorded identically for the clean reset (PC4, OBSERVED L43) and the faulted reset (R-route, OBSERVED L115):

| Fact | Clean reset (PC4) | Faulted reset (R-route) |
| --- | --- | --- |
| `key:null` StorageEvents | 1 | 1 |
| `accountScope` transitions | `locked` (A, generation `null`, epoch +1), then `account` (A, `g1`, epoch +2) | same |
| Account gate screen (`.account-data-gate`) rendered during the step | yes | yes |
| Features pane / Settings sidebar / AppRail replaced (old nodes detached) | yes / yes / yes; all 8 original switches detached | same |
| `aria-checked` mutations on the original 8 switches | 0 | 0 |
| Displayed after settle (re-read from bytes by the remounted pane) | all 8 on | Calendar off, other 7 on |

- **Interpretation of the facts.** Every accepted Reset to defaults, clean or faulted, relocks account A, shows the account-gate screen and remounts the whole business subtree (Shell, AppRail, Settings, the coordinator and the Features pane). The `usePref` `key:null` default repaint is never committed to the original switches, because the gate unmounts them in the same render. The remounted pane re-reads the stored bytes.
- **Consequence for H5 at host level.** The "pane shows that module on while its bytes stay false" part of H5 is masked in this host: after settle Calendar displays its stored `false`. The route consequence is confirmed: no hold after the failed reset. This matches Sol's production-App finding (Sol README, H5/H6 rows).
- This is product behavior, not a fixture failure. FIXTURE case 3 (L39, OBSERVED L33) proves the instruments detect a real relock and remount, using a generation-marker `StorageEvent` that the gate is designed to handle. PC1 (L40) proves the same instruments report no relock, gate screen, remount or `key:null` event in a clean flow. Contract D2 already requires removing the event, and `AccountDataGate` is protected and unchanged.

## Positive controls (PASS at `f359be6`)

- **L40, PC1 (clean):**
  - zero set/remove attempts on the 8 keys at mount;
  - a cancelable `beforeunload` is not prevented (OBSERVED L37);
  - sign-out resolves `true` with no dialog;
  - `AccountDataGate` and the host stay undisturbed: no scope change, no gate screen, no remount, no `key:null` event;
  - a sidebar departure reaches `/app/settings/hotkeys`, URL included, with no dialog;
  - zero Features writes afterwards and zero runtime errors.
- **L41, PC2:** unfaulted toggles through the same 8 switches store the exact unscoped bytes (the inverse of each seed), display them, touch no account-scoped key, and departure then proceeds. This proves the selectors reach the exact keys, so the F-cases fail only because of the armed denial.
- **L45, PC3 (clean):** programmatic module navigation, browser Back to a freshly mounted Features pane, browser Forward, a second Back, relative navigation with state (state carried), the sidebar row back to Features and the AppRail `Tasks` button all proceed. No dialog, zero Features writes, zero runtime errors.
- **L46, PC4:** an accepted, unfaulted Reset to defaults asks `window.confirm` once, removes all 8 keys without any set attempt, and afterwards sign-out resolves `true` and a sidebar departure proceeds with no dialog. Its relock and remount are recorded as facts above, not asserted; Sol's `downstream` §10.5 case owns that requirement.

## Proof the faults fired

1. **FIXTURE case L31.**
   - An armed `setItem` throws `QuotaExceededError` and an armed `removeItem` throws. Both are logged with `threw=true` and never reach storage.
   - Disarmed writes and removes delegate. Reads are logged; `sessionStorage` is not counted.
   - The lock fixture is exclusive: a held name queues its waiter while an independent name is granted, and an unsupported request shape is rejected and recorded.
   - The confirm recorder, the StorageEvent counter (null and keyed), the history write counters and the error recorder work.
   - The field table equals the archive's `featureIdOrder`, `featurePrefKey` and EN `nav` labels.
2. **Per-case preconditions.** Every failing case passed these preconditions before its business assertion; the log has zero `PRECONDITION:` lines.
   - In the 32 failed-toggle cases: the armed `setItem` fault on the field's key was observed and thrown; the key kept its seeded bytes; no unsupported lock shape was seen.
   - In R-route: the armed `removeItem` fault on Calendar was observed and thrown; the 7 other keys were removed; Calendar kept `"false"`.
3. **Product-side evidence.**
   - The product's legacy writer reports each injected set denial: `[plugin-web-storage] quota exceeded for xai_pref_features_<id>.` appears exactly 32 times (stderr L129–L222, one per failed-toggle case): F-a L129–L150, F-b L153–L174, F-c L177–L198, the eight Boards forms L201–L222. Per key that is 3 each, and Boards 11 (3 + 8).
   - The raw reset swallows its remove error silently (`FeaturesPane.tsx:102–108`). The R-route fault is therefore proven by the injector record in OBSERVED L115 (`{"key":"xai_pref_features_calendar","threw":true}`) and by the surviving bytes.
4. **FIXTURE case L35.** jsdom's browser history reaches the production router factory as a blockable POP. A guarded `history.back()` is blocked; the router location, URL and history entry are restored with zero `pushState`/`replaceState`; proceeding reaches the Back entry. A Back or Forward FAIL is therefore not an artifact of the environment, and a fixed product that guards will be observable here.

## Fixed-product assertions not reached at `f359be6`

After its first business assertion, each held-departure case asserts the following. These first execute on the fixed product (E8):
- the URL stays on Features;
- the coordinator dialog `Unsaved Features draft` is shown (contract §5/§9 guard label; never the "Smart Lists" fallback);
- Stay closes it and keeps:
  - the route and URL;
  - the router location `{pathname,key,state}` (strict equality);
  - the history stack: same length and entry, zero `pushState`/`replaceState`;
  - the latest intent on display. That is the inverted choice for a toggle, and the intended default "on" for Calendar's unresolved reset (§6);
- the departure and Stay make zero Features set/remove attempts and raise zero runtime errors;
- for sign-out: the outcome becomes `false` on Stay, account A stays active, and the choice stays displayed;
- for `beforeunload`: the handler makes zero storage attempts;
- for F-a: a failed toggle raises zero runtime errors.

## Runner guarantees (`verify-fixed.mjs`)

- **Archive.** Expands `git archive <resolved commit>` into a fresh realpath temporary directory. Asserts SHA-256 equality of the dependency lockfile, the committed lockfile and the extracted lockfile. Copies only `host.test.tsx` into this directory's path inside the archive and re-checks the copy's hash.
- **Pinning.**
  - Every archive workspace gets a private `node_modules`: read-only third-party links from `XAI_DEPS_ROOT`, and `@repo` links to the archive's own folders. Totals: 448 third-party and 281 workspace links (L20). 46 tsconfig `extends` were checked and none was unresolved (L21).
  - 75 exact-match aliases map every archive `packages/*` export to the archive file (L22). The oracle directory links to the single `react`, `react-dom`, `@testing-library/react` and `react-router` instances (L19).
  - A guard plugin fails the run if any module is transformed from the `packages/`, `apps/` or `docs/` trees of the dependency checkout **or of this runner's checkout** (L23). It also fails any unaliased `@repo` import resolving outside the archive (there were 0, L888), and it records every archive module (558, L891).
  - A harness check requires 21 named host modules to load from the archive. None was missing (L889–L890), including `FeaturesPane.tsx`, `AccountDataGate.tsx`, `departureCoordinator.tsx`, `settingsDeparture.ts` and `SettingsFooter.tsx`.
- **Log.** Writes the requested and resolved revision and tree, the runner checkout HEAD, the lockfile hashes, the oracle and runner hashes, the archive file hashes, versions (Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, Node v24.16.0), stdout and stderr. It adds a runner summary from Vitest's JSON reporter with one line per case, PRECONDITION counts, six harness checks, the OBSERVED fact lines and the module-pin record.
- **No overwrite.** Checked before archiving, again before writing, and by an exclusive create. Verified: rerunning `f359be6 host before1` exited 1 with `Error: Evidence exists; use a new suffix: …/host-before1-f359be6.log` before archiving anything (no temporary directory created). The log hash was unchanged afterwards.
- **Exit status.** Preserves Vitest's nonzero status (`exit=1`, L26). It exits 2 if Vitest passes but a harness check fails.
- **Cleanup.** Vite cache and bundled-config temp files stay inside the temporary archive, which is deleted; no `xai-features-host-*` directory remains. The dependency checkout's `node_modules/.vite`, `node_modules/.vite-temp`, the features package's `.vite`/`.vite-temp` and `apps/web`'s `.vite` kept their pre-run mtimes, all older than the run start.
- **Console filter.** Filters only React's "not wrapped in act(...)" warning.

**Pre-run checks (no product code executed):**
- a static esbuild transform of `host.test.tsx`;
- `node --check` of the runner;
- a scratch run of only the two mechanics FIXTURE cases, from a copy whose product imports were replaced by inert stubs. This checked the injector, lock fixture, recorders and jsdom POP mechanics against the real router and Testing Library only.

## Contract and source observations

No mismatch blocks freezing.

1. **Contract §3 item 6 omits `AccountDataGate`'s `key:null` listener.** The control plane recorded this; it is confirmed here at host level (section above). Contract D2 already removes the event, so no contract change is needed. Every accepted reset currently interrupts the whole host (gate screen and remount), even when all 8 removals succeed. The coordinator is remounted with it, so a departure held at that moment would be dropped by the coordinator's unmount cleanup. That last point is source reading only; it was not exercised.
2. **H5 at host level.** The route consequence is confirmed. The display part ("shows on while bytes stay false") is masked by the remount and never committed (0 `aria-checked` mutations). This is consistent with Sol. The H5/H6 native evidence belongs to E4.
3. **Two coordinator paths.** Programmatic navigation, including numeric deltas, goes through the coordinator's `router.navigate` wrapper (§3 item 12: reserve and replay the first intent); browser traversal goes through `useBlocker`. Both are covered for Back and Forward. At `f359be6` both fall through because no guard is registered.
4. **Sign-out uses the direct preflight** `requestSettingsDeparture("sign-out")`, the seam `App.handleSignOut` awaits (retained exclusion in contract §15).

## Limitations

- **jsdom, not Chrome or Tauri.**
  - Input is synthetic `fireEvent`, not trusted input. There is no hit-testing, keyboard, focus or responsive check.
  - jsdom's `History` traversal timing differs from browsers.
  - jsdom has no `BeforeUnloadEvent`, so a warning is detected as a canceled cancelable `Event`; a handler that only assigns a non-empty `returnValue` string would not be detected.
- **Reduced host compared with the production `App`:**
  - `AccountDataGate` is mounted directly, not through `AccountStorageGate`, so the auth session, identity events, `PomodoroSessionHost` and the AI secret participant are absent;
  - the App's rail filter (`useFeaturePrefs` → `filterModulesByFeaturePrefs`) is not composed, so the AppRail lists every registered module regardless of the Features bytes;
  - `CommandPalette`, `DesktopPet` and the App's appearance `apply*` effects are not mounted;
  - destinations outside Settings are placeholders, and the route table is reduced (no `webHostRouteObjects` or auth route gates);
  - the account is synthetic, and the run is English only.
  - The production-App readers and cross-module effects are covered by Sol `downstream` and, natively, by E4/E13.
- **Error visibility.** The runtime-error recorder registers a window `error` listener. In Vitest's jsdom environment that stops Vitest from escalating window errors itself, so every recorded error is printed as a `RUNTIME-ERRORS` line and counted by the runner (0 here). The error recorder is asserted empty in every positive control and in the fixed-only tails. Unhandled promise rejections are still reported by Vitest as well.
- **Left to later batches** (contract §9 and §13 gate 5):
  - E4: native before, H5/H6 natively and H10;
  - E5: Features F1 runner;
  - E8: this file rerun unchanged on the fixed SHA;
  - E9–E15: trusted input for all 16 values, the full host matrix rows a–n with exactly-once release behind a real held lock, first-intent arbitration, epoch cancellation, unmount, native export, EN/ZH five-width presentation and keyboard.
- **Dependencies** are reused read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
- **Corrections.** The fixed-only assertions listed above first run on the fixed product. Under contract §12, any later fixture correction must use a new suffix, rerun on both archives and never weaken a business assertion.
