# Appearance recovery: parent jsdom host before baseline (CP-APPEARANCE-01, batch 38, contract r3 §14 E3)

**Verdict: FROZEN.** This directory freezes the parent-role jsdom host before baseline for the Settings Appearance caller in the production `App` composition, against the before product `5cd63ff` and before any implementation exists. It covers contract r3 §14 item **E3** (§12 "Parent host baseline") and the host layer of H11, H16 and H17.

It produces evidence only. It implements and fixes nothing, and it changes no product source, product test, contract, earlier evidence, ledger or control plane. It accepts nothing and does not authorize Terra: E4–E5 are still open, and the controller decides once E1–E5 are frozen. It closes no 312 item.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance in the parent host-verifier role, in the isolated worktree `.claude/worktrees/agent-a8c228411ddf4f59a`. It did not write the contract, the Sol oracles or any product code |
| Docs base (detached HEAD) | `95d623414c4f58d531e6a512ac4b3f97d55c9e7e` (control plane batch 38). Each log records it as `runner_checkout_head` (L9) |
| Requested before revision | `5cd63ff` |
| Resolved commit and tree | `5cd63ff652f02a2c726187fe12cbc796218d31c0` / `404bf819a42e20b3e4d372c18a981832ccd54954` (log L2–L3). Package trees (L4) equal the contract header: Appearance `ce183d17e8606067c3bc97d7e3b6645ee656fe9e`, `xai-web-shell` `0f0fed40fe94a9de5c79eb273d1103757a807a9c`, `apps/web` `2fbf99f3ebea93b2ac136727267639790ecf3f4a` |
| Authority | `../web-appearance-recovery-contract/contract.md` r3 (`706c9a3`, SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived), in particular: <ul><li>§4: A2 (A2.1–A2.7) and A5;</li><li>§5: wording and selectors;</li><li>§6 and §7;</li><li>§9: host rows a–s;</li><li>§12: "Parent host baseline", the F-B002 rule, "Validity and positive controls", H11, H16 and H17;</li><li>§14: E3.</li></ul> Also `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`, section "本轮唯一任务" (batch 38) |
| Authoritative log | `host-before3-5cd63ff.log` |
| Diagnostic iterations | 3 of 3: `before1` and `before2` are superseded and harness-invalid; `before3` is authoritative. See "Iteration history" |

## Files and SHA-256

These are all the new files in this directory except this README, which cannot carry its own hash.

| File | Lines | SHA-256 |
| --- | --- | --- |
| `verify-fixed.mjs` (runner) | 435 | `6aac35631594d11aa916a75710beebbf93e083c21d7b02f84df83e2baed8e4b0` |
| `host-fixture.tsx` (host fixture) | 1049 | `ba137f5856f7c0bf145af88def08af442ba92fcb0bcc611ea834569ac60ad52f` |
| `host.test.tsx` (oracle) | 594 | `27589cb660b55105c289f916edd6bfe14283897245115ef58c7a587346cb38cf` |
| `host-before3-5cd63ff.log` (**authoritative**) | 986 | `2ffcab96a6a1397149c47c1d1dfa89925aa77e09dbc93e0341ac052f5f3cc306` |
| `host-before2-5cd63ff.log` (superseded, harness-invalid) | 625 | `94628b00af58fb8c936c0f0d692e576a46978f41fdc7aeb1517494c09cc07e31` |
| `host-before1-5cd63ff.log` (superseded, harness-invalid) | 625 | `a6925cdae75adcff360b73a302b19f693bcd459c6f87ca909f241e7f87875d71` |

The `before3` header (L18) records `host-fixture.tsx=ba137f58…`, `host.test.tsx=27589cb6…` and `verify-fixed.mjs=6aac3563…`. These equal the table, so the authoritative log was produced by exactly these files, and none of them changed after that run.

The superseded logs were produced by earlier versions, which their own L18 headers identify:
- `before2`: fixture `fb2a0557…`, test `715f01f6…`, and the same runner `6aac3563…`;
- `before1`: fixture `05b76bda…`, test `b8eaf983…`, runner `93df6b80…`. Only the runner's header comment changed after `before1`.

## Command

Run from the repository root of this worktree. The dependency root is used read-only, as the existing runners use it.

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-appearance-recovery-independent/verify-fixed.mjs 5cd63ff host before3
```

- **Console:** `host 5cd63ff (5cd63ff652f0): vitest_exit=1 harness=PASS exit=1 cases=33 passed=4 failed=29 precondition=0`.
- **Runner exit status:** 1.
- **Fixed rerun (E8):** use the unchanged files, a new suffix and an `XAI_DEPS_ROOT` whose lockfile matches that revision (the runner refuses any other), for example `… verify-fixed.mjs <fixed-sha> host fixed1`.

## Runner guarantees, lockfile and pin proof (`verify-fixed.mjs`)

**Immutable archive.**
- The runner expands `git archive <resolved commit>` into a fresh temporary directory, resolved through realpath. It never runs from checkout source.
- It copies only `host-fixture.tsx` and `host.test.tsx` into the archive and checks each copy's hash against the evidence file.

**Lockfile gate.** Four values must be equal: `XAI_DEPS_ROOT/pnpm-lock.yaml`, `git show 5cd63ff:pnpm-lock.yaml`, the extracted lockfile and the contract gate constant. All four are `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` (L14–L17).

**Contract source check.** The 19 source files listed in the contract r3 header all match it (L19, `19/19 equal the contract r3 source table`). Examples: `AppearancePane.tsx` `552eb224…`, `App.tsx` `5d10dba6…`, `Topbar.tsx` `70ba299e…`, `departureCoordinator.tsx` `0844a697…`, `SettingsFooter.tsx` `afecc734…`, `usePrefAsync.ts` `541fae97…`.

**`@repo/*` pinned to the archive, with a guard.**
- Every archive workspace gets a private `node_modules` (L21):
  - 448 read-only third-party links into `XAI_DEPS_ROOT`;
  - 281 `@repo` links to the archive's own package folders.
- tsconfig `extends`: 46 checked, none unresolved (L22).
- 75 exact-match aliases map every archive `packages/*` export specifier to the archive file (L23).
- A Vite guard plugin enforces the pin:
  - it fails the run if a module is transformed from the `packages/`, `apps/` or `docs/` trees of the dependency checkout or of this checkout (L24 lists those roots);
  - it fails any unaliased `@repo` import that resolves outside the archive;
  - it records every archive module.
- Pin result in the authoritative log:
  - `pin_unaliased_repo_imports=0` (L983);
  - `pin_required_provenance_missing=none` (L984) over 34 required production modules (L985): the Appearance pane and its registry entry, `App.tsx`, `router.tsx`, `RouteGateElements.tsx`, `RouteErrorBoundary.tsx`, the shell registrations, `composedSettingsRegistration.tsx`, `settingsPaneComposition.ts`, `departureCoordinator.tsx`, `settingsDeparture.ts`, `AccountStorageGate.tsx`, `AppProviders.tsx`, the observability runtime, the service-worker module, `AccountDataGate.tsx`, seven storage internals, `Shell.tsx`, `Topbar.tsx`, `AppRail.tsx`, `AvatarMenu.tsx`, `SignOutConfirmDialog.tsx`, `DesktopPet.tsx`, `CommandPalette.tsx`, the tokens index, and the auth `session.tsx` and `guards.tsx`;
  - 623 archive modules loaded (L986).

**Harness checks.** 6/6 PASS (L26, L858–L863):
- the JSON report parsed;
- the reported file equals the include;
- the config is in effect (jsdom, globals, no setup files, root equal to the archive);
- the guard is active;
- provenance is complete;
- there is no suite error.

**Revisions.** `requested_revision=5cd63ff` and `resolved_commit=5cd63ff652f0…` are both recorded (L1–L2).

**No overwrite.** The runner refuses to overwrite a log:
- it checks before archiving, again before writing, and creates the log exclusively;
- verified after the runs: re-invoking `… 5cd63ff host before3` exited 1 with `Evidence exists; use a new suffix` before any archive was made.

**Nonzero exit codes preserved.** Vitest's status is returned (all three runs exited 1). If Vitest exits 0 but a harness check fails, the runner exits 2.

**Dependency root untouched.** A read-only mtime scan covered:
- the dependency root's top level;
- its `node_modules`, `apps`, `packages` and `docs` to depth 2;
- every workspace `node_modules` to depth 1.

It found **0** entries newer than the start of the first run. Vite caches and the bundled config stay inside the temporary archive, which is deleted afterwards, and no `xai-appearance-host-*` directory remains.

**Console filter.** Only React's "not wrapped in act(...)" warning is filtered. Product console output is kept, for example the ten `[plugin-web-storage] quota exceeded for <key>` warnings from the denied registered writes (L268–L297).

## What runs: the production `App` composition (contract §9, §12)

**Module order.** The oracle imports modules in the `apps/web/src/main.tsx` order: the observability runtime, `AppProviders`, the router module, the service-worker module, `@repo/plugin-web-tokens`, then `global.css`. Imports only evaluate the modules; `bootstrapObservability()` and `registerServiceWorker()` are not called.

**Route table and router.** The production route table `webHostRouteObjects` is used. Every case renders a fresh data router over it: `createMemoryRouter` at the case's path, as in the frozen Sol harness, rendered by `RouterProvider` from `"react-router"`.
- That is the entry the production route modules import (`router.tsx`: `Outlet`, `Navigate`).
- `main.tsx` renders the same table through `createBrowserRouter`, with the `"react-router/dom"` wrapper that only adds `flushSync`.
- The module-level production router instance is never rendered and is disposed. It was created at `"/"`, which FX3 checks.

**What `/app` renders.** `ProtectedAppRouteElement → App → AccountStorageGate → AccountDataGate → CommandPaletteProvider → WebShellProvider + Shell (AppRail, Topbar)`, `DesktopPet` and `CommandPalette`.
- `/app/settings/*` renders `AppRouteElement → ComposedSettings` with the `DepartureCoordinator` and the `settingsDeparture` delegate that `App.handleSignOut` awaits.
- The real Appearance pane (with its `SettingsFooter` at `5cd63ff`) and the real storage hooks, engine, registry, codecs and `accountScope` are all used.

**The only synthetic input is the auth session.**
- `useWebAuthSession` is substituted through `vi.mock` of the auth package's `session` module; the rest of that module stays real.
- It returns an authenticated session for account `appearance-host-parent-A`, with a generation coordinator that records its sign-outs. This exercises `App.handleSignOut`'s coordinator branch, the live-configuration branch.
- The substituted hook served the App 9 times in FX3 (L928).

**Account state.** Account A has a committed generation marker (seeded outside the counters) and is active before mount, like a returning signed-in user. The production `AccountDataGate` then re-locks and re-activates it from the marker. Every mount checks `account/appearance-host-parent-A/g1` as a precondition.

**Test-owned instruments** (`host-fixture.tsx`):
- **Storage injector.** It logs every `getItem`, `setItem` and `removeItem` attempt on `localStorage`, recording before it delegates. An armed set fault throws `QuotaExceededError` and an armed remove fault throws `SecurityError`; neither delegates.
- **Web Lock fixture.** An exclusive/shared FIFO lock manager is installed as `navigator.locks`, with asynchronous grants, test-held locks, `ifAvailable` and `signal`.
- **Recorders and probes:**
  - a `window.confirm` recorder;
  - a `window.location` stub that records `assign`, `replace` and `reload` and delegates every read;
  - router-commit and `pushState`/`replaceState` counters;
  - a runtime-error recorder (window `error`, process `unhandledRejection`, `RUNTIME-ERRORS` lines);
  - a cancelable `beforeunload` probe that also counts the storage attempts made in its handlers.
- **jsdom shims:**
  - Node's `AbortController`, `ResizeObserver`, `requestAnimationFrame` and `matchMedia`;
  - `HTMLDialogElement` `showModal` and `close`;
  - refusals for `fetch`, XHR, WebSocket and EventSource, with counters (0 attempts: L928).

**Selectors** are only the contract §2 and §5 ones:
- role and accessible name, scoped to the pane, the Topbar dialog, the Settings sidebar, the AppRail or the sign-out controls;
- the §2 classes, used only to tell apart controls with equal names;
- the §5 test ids: `appearance-retry-all`, `appearance-status-line`, `appearance-status` and `[data-appearance-recovery]`.

## Results at `5cd63ff` (authoritative `host-before3-5cd63ff.log`)

| Group | Cases | PASS | FAIL | `PRECONDITION:` |
| --- | --- | --- | --- | --- |
| FIXTURE validity (FX1 F-B002 self-check, FX2 lock fixture, FX3 composition) | 3 | 3 | 0 | 0 |
| Clean positive control (PC) | 1 | 1 | 0 | 0 |
| Each Appearance field ×7: F-route (Settings sidebar) and F-signout | 14 | 0 | 14 | 0 |
| Each Topbar field ×3: T-rail (AppRail) and T-signout (from `/app/tasks`) | 6 | 0 | 6 | 0 |
| Failed reset with its route outcome (R-route) | 1 | 0 | 1 | 0 |
| H11 dedicated cases (H11-a indicator, H11-b/c `beforeunload`, H11-d sign-out from another Settings pane) | 4 | 0 | 4 | 0 |
| H16 expected Retry all (H16-a full, H16-b partial, H16-c open pass) | 3 | 0 | 3 | 0 |
| H17 clean-state disabled Retry all | 1 | 0 | 1 | 0 |
| **Total** | **33** | **4** | **29** | **0** |

**Where the log records them:**
- per-test status lines: stdout L35–L257;
- Vitest totals (`Tests 29 failed | 4 passed (33)`): L260–L263;
- the 29 failure blocks with diffs: stderr L267–L854;
- runner summary: L855–L986, with totals at L857 (`precondition_failures=0 suite_errors=0 unhandled_error_lines=0 runtime_error_lines=0`), the per-case list at L864–L925 and the OBSERVED facts at L927–L981.

**All 29 failures are business failures.** Each is an `AssertionError` raised by a business assertion that names its contract clause and hypothesis. The log contains:
- no `PRECONDITION:` line;
- no `TypeError`, Testing Library lookup error, unhandled error or rejection;
- no `RUNTIME-ERRORS` line.

Every fault armed in a failing case was proven to fire (`fired(...)` preconditions held). The registered keys also produced the product's own quota warning (L268–L297).

### Per case

Each failure shows the first failing assertion. "Case" lines are summary lines; "block" lines are the stderr failure blocks with diffs.

| # | Case | Result | First failing assertion (business) | Log |
| --- | --- | --- | --- | --- |
| 1 | FX1 F-B002 self-check | PASS | — | case L864, OBSERVED L927 |
| 2 | FX2 Web Lock fixture | PASS | — | L865 |
| 3 | FX3 composition | PASS | — | L866, OBSERVED L928 |
| 4 | PC clean state | PASS | — | L867, OBSERVED L929 |
| 5 | F-route `lang` (pane 简体中文 denied) | FAIL | `H11 A5 §7.2 row d: … the Topbar status "外观更改未保存，前往设置查看。" … expected null not to be null` | case L868–L869, block L301 |
| 6 | F-signout `lang` | FAIL | `H11 A5 §7.4 row g: … one window.confirm … Cancel resolves false`; diff: confirms `[]` instead of the ZH text, outcome `{backendSignOuts:1, identityInvalidated:true, redirected:true}` | case L870–L871, block L313–L332 |
| 7 | F-route `theme` (Dark) | FAIL | `H11 … Topbar status … expected null not to be null` | case L872–L873, block L339 |
| 8 | F-signout `theme` | FAIL | `H11 … §7.4 row g …` (confirms `[]`, sign-out proceeded) | case L874–L875, block L351 |
| 9 | F-route `density` (Compact) | FAIL | `H11 … Topbar status …` | case L876–L877, block L377 |
| 10 | F-signout `density` | FAIL | `H11 … §7.4 row g …` | case L878–L879, block L389 |
| 11 | F-route `accentHue` (Violet 295) | FAIL | `H11 … Topbar status …` | case L880–L881, block L415 |
| 12 | F-signout `accentHue` | FAIL | `H11 … §7.4 row g …` | case L882–L883, block L427 |
| 13 | F-route `bgTone` (Peach, tone write denied) | FAIL | `H11 … Topbar status …` | case L884–L885, block L453 |
| 14 | F-signout `bgTone` | FAIL | `H11 … §7.4 row g …` | case L886–L887, block L465 |
| 15 | F-route `railPos` (Right) | FAIL | `H11 … Topbar status …` | case L888–L889, block L491 |
| 16 | F-signout `railPos` | FAIL | `H11 … §7.4 row g …` | case L890–L891, block L503 |
| 17 | F-route `fontScale` (1.1) | FAIL | `H11 … Topbar status …` | case L892–L893, block L529 |
| 18 | F-signout `fontScale` | FAIL | `H11 … §7.4 row g …` | case L894–L895, block L541 |
| 19 | T-rail `lang` (Topbar 中文 denied on `/app/tasks`) | FAIL | `H11 A5 §7.2 rows b/e: … "外观更改未保存，前往设置查看。" … expected null not to be null` | case L896–L897, block L567 |
| 20 | T-signout `lang` | FAIL | `H11 … §7.4 row g: sign-out from /app/tasks …` (confirms `[]`, sign-out proceeded) | case L898–L899, block L579 |
| 21 | T-rail `theme` | FAIL | `H11 … rows b/e … expected null not to be null` | case L900–L901, block L605 |
| 22 | T-signout `theme` | FAIL | `H11 … §7.4 row g …` | case L902–L903, block L617 |
| 23 | T-rail `density` | FAIL | `H11 … rows b/e …` | case L904–L905, block L643 |
| 24 | T-signout `density` | FAIL | `H11 … §7.4 row g …` | case L906–L907, block L655 |
| 25 | R-route (Sidebar position removal denied) | FAIL | `H11 A5 §7.2: … the Topbar status … is shown for the failed reset item: expected null not to be null` | case L908–L909, block L681 |
| 26 | H11-a indicator on three routes | FAIL | `H11 A5 §7.2: … shown on every route`; diff: `indicator: false` on `/app/settings/about`, `/app/tasks` and `/app/calendar` | case L910–L911, block L688–L710 |
| 27 | H11-b `beforeunload` after a pane theme failure | FAIL | `H11 A5 §7.3 row i: … warns on every route`; diff: `warned: false` on the pane and on `/app/tasks`, `attempts: 0` | case L912–L913, block L722–L741 |
| 28 | H11-c `beforeunload` after a Topbar density failure | FAIL | `H11 A5 §7.3 row i …`; diff: `warned: false` on `/app/tasks` and `/app/calendar` | case L914–L915, block L747–L766 |
| 29 | H11-d sign-out from `/app/settings/about` (pane unmounted) after a font-scale failure | FAIL | `H11 A5 §7.4 row g …` (confirms `[]`, sign-out proceeded) | case L916–L917, block L772 |
| 30 | H16-a full success | FAIL | `H16-a: Retry all ("Retry all") is rendered in the Appearance pane (A2.2 …): expected null not to be null` | case L918–L919, block L798 |
| 31 | H16-b partial | FAIL | `H16-b: Retry all … is rendered …: expected null not to be null` | case L920–L921, block L812 |
| 32 | H16-c open pass | FAIL | `H16-c: Retry all … is rendered …: expected null not to be null` | case L922–L923, block L826 |
| 33 | H17 clean state | FAIL | `H17: Retry all ("Retry all") is rendered …: expected null not to be null` | case L924–L925, block L840 |

**Business assertions that passed before the failing one.**
- **F-route and R-route:** the Settings sidebar was **not held** (`/app/settings/about`) and **no departure dialog** opened.
- **T-rail:** the AppRail was not held (`/app/calendar`) and no dialog opened.
- **H11-d:** the sidebar was not held, and the Appearance pane was unmounted when sign-out started.

The OBSERVED "after the sidebar" and "after the AppRail" lines confirm these facts (L931, L935, L939, L943, L947, L951, L955, L959, L963, L967, L971). This part of the contract's A5 model, no Settings route guard, already holds at `5cd63ff`. It is a requirement that binds the fixed product unchanged, not a defect.

### Mapping to contract §12 "Parent host baseline" and the task

| §12 item | Cases |
| --- | --- |
| Each field's failed edit with its sidebar route outcome and its sign-out outcome | F-route ×7, F-signout ×7 (cases 5–18) |
| Each Topbar field's failed choice with an AppRail outcome and a sign-out-from-`/app/tasks` outcome | T-rail ×3, T-signout ×3 (cases 19–24) |
| A failed reset with its route outcome | R-route (case 25) |
| A failed Topbar theme choice and a failed pane accent edit, then the expected Retry all, with its Topbar-status, `beforeunload` and sign-out outcomes (H16) | H16-a (full success: status hidden during the open pass and absent after, unload removed, then sign-out asks nothing), H16-b (partial: status returns, unload warns, sign-out asks once, Cancel resolves `false`), H16-c (sign-out during the open pass: one confirm, Cancel, then the pass settles) (cases 30–32) |
| The clean state: the expected Retry all, rendered and disabled (`aria-disabled="true"`, no `disabled`, a Tab stop), with zero storage attempts for a click, Enter and Space (H17) | H17 (case 33) |
| One clean positive control | PC (case 4) |
| H11: no indicator outside the pane; sign-out resolves `true` from any route; `beforeunload` does not warn | H11-a–d (cases 26–29), plus the H11 assertions of cases 5–25 |

## Hypotheses at the host layer

| ID | Disposition | Evidence (authoritative log) |
| --- | --- | --- |
| **H11** | **Confirmed** | See the three facets below |
| **H16** | **Confirmed** | See below |
| **H17** | **Confirmed** | See below |

**H11: no indicator outside the pane.**
- After a failed edit of each of the seven fields in the pane, then a sidebar move to About, the Topbar status is absent: cases 5, 7, 9, 11, 13, 15 and 17 (L868–L893, blocks L301–L530), `expected null not to be null`.
- The same holds after each of the three failed Topbar choices on `/app/tasks` followed by the AppRail to Calendar (cases 19, 21, 23), and after a failed reset item (case 25).
- H11-a checks three routes after a failed accent edit and a failed Topbar theme choice. The indicator is `false` on another Settings pane, on the AppRail destination and on a programmatic destination (diff L691–L710, OBSERVED L973).
- Every "after the failed … choice" OBSERVED line records `"topbarStatus":false` (L930–L978).

**H11: sign-out resolves `true` from any route.** Cancel was the prepared answer, yet the existing sign-out sequence ran to completion, with no Appearance step and zero `window.confirm` calls.
- **From the Appearance pane:** cases 6, 8, 10, 12, 14, 16 and 18.
- **From `/app/tasks`:** cases 20, 22 and 24.
- **From another Settings pane** with the Appearance pane unmounted: case 29.
- **Each diff** shows confirms `[]` against the normative text (EN, or ZH after a language failure), and outcome `{backendSignOuts: 1, identityInvalidated: true, redirected: true}` against `{0, false, false}`. Example: block L313–L332.
- **OBSERVED** lines L933, L937, L941, L945, L949, L953, L957, L961, L965, L969 and L979 show `"confirms":[]`, `"redirects":["/"]` and the scope `locked/null`.

**H11: `beforeunload` does not warn.**
- **H11-b**, a pane theme failure: `{warned:false, attempts:0}` on the pane and on `/app/tasks` (diff L725–L740, OBSERVED L975).
- **H11-c**, a Topbar density failure: `{warned:false, attempts:0}` on `/app/tasks` and `/app/calendar` (diff L750–L765, OBSERVED L977).
- Every "after the failed … choice" OBSERVED line records `"unload":{"warned":false,"attempts":0}`.

**H16: no real Retry all exists.** H16-a, H16-b and H16-c each fail at their first business assertion, `Retry all ("Retry all") is rendered in the Appearance pane`.
- This happens after a failed Topbar theme choice and a failed pane accent edit, each proven to fire (cases 30–32: L918–L923, blocks L798, L812, L826).
- **What exists instead** (OBSERVED L980): the pane's bottom buttons are `Reset to defaults` (`settings-footer-reset`, `btn ghost`) and `Save & apply` (`settings-footer-save`, `btn primary pane-save`).
- **The state before the expected pass:** no Topbar status and no unload warning, with both failed keys still absent.
- **Unreached at `5cd63ff`:** the Topbar-status, `beforeunload` and sign-out outcomes of a pass are frozen as fixed-product requirements in those cases.

**H17: no disabled "nothing to retry" state.** In the clean state the case fails at `Retry all ("Retry all") is rendered` (case 33: L924–L925, block L840).
- OBSERVED L981: the bottom primary action is `Save & apply`, with `"ariaDisabled":null` and `"disabled":false`, so it carries neither attribute.
- The effects of activating it in the clean state are not repeated here: four root `setItem` attempts and the 1.8 s "Saved" flash. They are frozen Sol evidence (`../web-appearance-recovery-sol/`, `retry-all` L1076 and L1078) and are due natively in E4.

No hypothesis exercised here was refuted.

**Corroborating observations.** These are recorded facts, not claims of this baseline:
- **H1:** after a denied write the accent, background and sidebar controls revert (`paneShows` 165, `default`, `left`: L942, L946, L950).
- **H2 and H3:** denied root choices stay displayed and applied while the bytes stay absent (L930, L934, L938, L954; Topbar L958, L962, L966).
- **H5:** after a denied Topbar theme choice, the pane still shows Light while `<html>` applies Dark (L972).
- **H9:** the reset asks the old "Reset every preference to defaults? …" text. It removes the three registered keys (the denied Sidebar position removal threw and was swallowed) and writes the root keys' default values (L970).

## Positive control and fixture validity

**PC passes at `5cd63ff`** (case 4: L50, L867; OBSERVED L929). In one production-App mount:
- mounting on the Appearance route makes zero set or remove attempts on every key;
- there is no Topbar status, and `beforeunload` gives `{warned:false, attempts:0}`;
- a successful pane accent edit persists `295`, and a successful Topbar density choice persists `"compact"`, both as exact bytes, with still no status and no warning;
- the Settings sidebar moves to About with no dialog, and the committed accent is displayed on return;
- sign-out without drafts asks zero `window.confirm` and completes: identity invalidated (scope `locked`), redirect `/`, one coordinator sign-out, and zero Appearance set or remove attempts.

So the harness observes the protection outcomes, both "proceeded" and "not held", that the failing cases compare against. This control must also pass on the fixed product.

**FX3 composition passes** (L866; OBSERVED L928):
- account A/`g1` is active;
- the substituted hook served the App 9 times;
- the Settings sidebar and the App-level DesktopPet (`.pet-wrap`) rendered;
- there is no route error and no network attempt;
- `window.location` reads are delegated;
- a sidebar navigation is exactly one router commit, with no direct History API call;
- the module-level production router was created at `/` and disposed.

**FX2 Web Lock fixture passes** (L865). It shows:
- grants are asynchronous;
- a test-held lock keeps a product request waiting until release;
- shared holders coexist while an exclusive request waits;
- `ifAvailable` yields `null` while the name is held;
- no request shape is unsupported.

The lock fixture is not exercised by the `5cd63ff` product, whose legacy writes take no lock. It is required for the fixed rerun, where every Appearance write takes `prefMutationLockName(<key>)`.

## F-B002 self-check

**The rule as implemented.**
- The wrappers on `Storage.prototype` record the attempt, then delegate exactly once to the native method captured at module load. A faulted attempt is recorded and throws before delegating.
- They never call `accountScope.physicalKey`, `getPref`, `readRawPref`, any other Storage method or any product helper.
- The `localStorage` object is captured at install time, so the wrappers never read `window.localStorage`.
- All seven keys are device keys (physical key = logical key) and are precomputed, together with their `prefMutationLockName` values and the account generation-marker key, outside every wrapper.
- The oracle reads and seeds bytes through the captured native methods, outside the counters.

**Committed self-check case: FX1, PASS** (L864, OBSERVED L927). Tripwires are installed on `accountScope.physicalKey` and `accountScope.capture`, then eight wrapper calls run: set, get, remove, faulted set, faulted remove, faulted get, plain get and a `sessionStorage` set. The result equals the expectation committed in `host-fixture.tsx`:
- delegations per call: `delegatedPerStep [1,1,1,0,0,0,1,1]`;
- throws per call: `threwPerStep [false,false,false,true,true,true,false,false]`;
- each fault fired once: `faultsFired [1,1,1]`;
- the bytes were unchanged after the faulted set (`null`) and the faulted remove (`"3"`);
- `sessionStorage` was delegated but not logged;
- `nested 0` and `tripwire 0`.

**Per-case guard.** A re-entrancy depth counter runs inside the wrappers in every case, and `teardown()` throws a `PRECONDITION` if any case saw a nested Storage call. None did: there are zero `PRECONDITION` lines across the 33 cases. The lock fixture would also have raised a `PRECONDITION` for any unsupported request shape, and none occurred.

## Precondition and validity policy (contract §12)

**What counts as a precondition.** A `PRECONDITION:` error marks a fixture or selector failure, never a product failure. The preconditions are:
- the instruments are installed;
- the account is active before and after mount;
- the router committed the path, and the Shell (and, on the Appearance route, the pane) is mounted;
- every control is found exactly once through the stable selectors;
- seeded bytes are present;
- each armed fault was observed to fire;
- a test-held lock is confirmed;
- the existing sign-out dialog opened and closed.

**Business assertions are never preconditions.**
- At `5cd63ff`, the absence of Retry all, of the Topbar status, of a confirm or of an unload warning is a business failure, never a precondition.
- The route error boundary at mount is asserted as business.
- In H16-b the attempt-count assertion precedes the fault-observed precondition, so a product that never re-attempts fails on business.

**Ordering within each case.** Business assertions are ordered so that the first failure at `5cd63ff` is the facet under test: route first, then the indicator; then the combined confirm and outcome for sign-out. Facts that would otherwise go unrecorded after that first failure are written as OBSERVED lines before the assertions. No case uses private product calls. Every value comes from a closure-bound control, the font-scale range input, the Topbar menu, Reset, the sign-out UI, `beforeunload` or the router.

## Iteration history

All three runs used the same docs base `95d6234`, the same archive and the same 33 cases. No business assertion was weakened between iterations. The history-mutation oracle became stricter, because it gained a router-commit count.

1. **`before1` (superseded, harness-invalid): 31 of 33 cases with `PRECONDITION`.**
   - **Setup:** `createBrowserRouter` over jsdom's History, account A locked before mount, `RouterProvider` from `"react-router/dom"`.
   - **Result:** FX1 and FX2 passed. Every App mount failed its precondition: the account was never activated (L558), with no product error and no console output.
2. **`before2` (superseded, harness-invalid): 31 of 33 cases with `PRECONDITION`.**
   - **Changes:**
     - Sol's proven composition choices were adopted: `createMemoryRouter` over the production table, and the account activated before mount;
     - the history-mutation oracle gained router-commit counting, because a memory router makes no `pushState`;
     - diagnostics were added to the mount preconditions.
   - **Result:** the diagnostics (L558) settled the cause:
     - the router matched `["0","0-2","0-2-4"]`, that is root, `app` and `:moduleId/*`;
     - the account was active;
     - yet the body was empty and the substituted auth hook had been called **0** times.
   - **Meaning:** even the root route's `<Outlet/>` rendered nothing, with no error. That is what an `Outlet` does when it reads a React Router `RouteContext` other than the one the provider supplies.
3. **`before3` (authoritative, harness-valid).**
   - **Change:** only the `RouterProvider` import, to `"react-router"`, the entry the production route modules use, plus comments.
   - **Result:** every mount rendered the production App. FX1–FX3 and PC passed, and 0 cases hit a `PRECONDITION`. This single-variable change from `before2` is what made the harness valid.
   - **Untested alternatives:** the browser-router and locked-account variants of `before1` were not retried and are not claimed to be faulty.

The cap of three diagnostic iterations was used in full. The superseded logs are kept unchanged. Their headers carry their own oracle hashes, which differ from the final files (see "Files and SHA-256").

## Limitations

**Environment.**
- jsdom, not a browser: there is no layout, hit-testing, sizing, focus ring or scroll. "Trusted" input is approximated with `@testing-library/user-event` and `fireEvent`, since jsdom events are untrusted.
- Native evidence is E4 and E12. Presentation and keyboard evidence is E14 and E15.

**Composition differences from `main.tsx`.**
- A memory data router over the production route table, not the module-level `createBrowserRouter` instance.
- `RouterProvider` from `"react-router"`, not the `"react-router/dom"` `flushSync` wrapper (see the iteration history).
- No StrictMode (contract §15 retained exclusion).
- `AppProviders`' component tree is not rendered, because the auth hook is substituted.
- `bootstrapObservability()` and `registerServiceWorker()` are not called.
- The network is refused by stubs; zero attempts were observed.

**Auth branch.** Only App.handleSignOut's coordinator branch is used; Sol's host mode covers both branches. The existing `SignOutConfirmDialog` runs with `showModal` and `close` stubbed for jsdom.

**`beforeunload` probe.** It is a synthetic cancelable `Event`. It counts a warning when the event is canceled, or when a non-empty string or `true` is assigned to `returnValue`.

**Unreached steps.** Steps after the first failing assertion are not executed at `5cd63ff`. Examples are the "drafts intact on return" checks, Review navigating once, the Retry all pass outcomes and the clean-state Tab and activation checks. They are frozen fixed-product requirements whose behaviour on a real implementation is first exercised by E8.
- Any later correction must use a new suffix, rerun against both archives and never weaken an assertion (contract §12).
- The H16 open-pass cases rely on the lock fixture's test-held lock behind `prefMutationLockName("xai_accent_hue")`. The H16-a and H16-c assertions also assume that the theme member settles while the accent member is held, as A2.3 requires (each member is invoked before any asynchronous settlement).

**Outside E3.** These are covered elsewhere: Sol host mode, native E12 and the F1-shape E5.
- Back and Forward (row f);
- cross-document updates and conflicts (row j);
- forced remount (row k);
- the More-coordinator interplay (rows g, More case, and m);
- the pending-only Topbar state (row c);
- cross-module isolation (§10.7).

**Dependencies.** The dependency trees are reused read-only from the main checkout. The lockfile gate is a consistency check only.
