# Features native cross-module before baseline (CP-FEATURES-01, batch 24, contract §14 E4)

**Verdict: FROZEN.** This directory freezes the parent-role native before evidence for the Settings Features caller in real headless Chrome, in the production `App` composition: H5, H6 (including the AppRail drag after a reset) and H10 at 375 px in EN and ZH, with bundle provenance and the `AccountDataGate` reaction recorded as found.

It freezes before evidence only. It implements nothing and fixes nothing. It changes no product source, product test, contract, Sol or host evidence, ledger or control plane. It accepts nothing and authorizes nothing: Terra stays unauthorized until E1–E5 are frozen and the controller decides. It closes no 312 item: REL-05, REL-07, REL-10, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, SET-03 and D2/REL/AI stay open.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent native-verifier role, isolated worktree. It did not write the contract, any product code or any earlier Features evidence |
| Requested revision | `f359be6` |
| Resolved commit / tree | `f359be6d838393e0f9e93efd80b88b5b09f6144e` / `2280bc7617d52dc6c4356da257d57940ecb174ec` |
| Docs base (detached HEAD) | `0d61d617e466097e3eb74eaf9274495c97982b6b`; `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (every log, L2) |
| Authority | `../web-features-recovery-contract/contract.md` §3 items 5–6, §4 D2, §6, §9, §10 items 2 and 5, §12 "Native before" and H5/H6/H10, §13 gates 5–6, §14 E4; `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` CP-FEATURES-01 (including the verified `AccountDataGate` fact) and "本轮唯一任务" (batch 24) |
| Browser | Chrome/154.0.8037.97 (HeadlessChrome), protocol 1.3; Node v24.16.0; esbuild 0.28.1; react 19.2.0, react-dom 19.2.0, react-router 7.15.1 |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT`, `git show f359be6:pnpm-lock.yaml` and the extracted archive (every log, L1 `lockfileSha256`; precondition L3) |
| Archive hash checks | `FeaturesPane.tsx` = `987c3825…` (contract preamble), `internal/featuresPane.tsx` = `14053daa…`, `styles.css` = `db4a5f24…`, `departureCoordinator.tsx` = `0844a697…` (accepted F1 repair); precondition L6 in every log |
| Diagnostic iterations | **1 of 3** (`before1`) for this harness. No fixture correction after the first committed run |

## Commands

From the repository root of this worktree (one Chrome session per mode):

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-features-recovery-native/verify-native-before.mjs f359be6 h5 before1
XAI_DEPS_ROOT=... node docs/reviews/web-features-recovery-native/verify-native-before.mjs f359be6 h6 before1
XAI_DEPS_ROOT=... node docs/reviews/web-features-recovery-native/verify-native-before.mjs f359be6 h10 before1
```

`XAI_NATIVE_TMPDIR` pointed at a scratch directory; the temporary archive, profile and bundle were deleted after each run. Console lines (verdict ids abbreviated):

- `VALID … native-f359be6-before1-h5.log checks=33 exit=2 H5-a=FAIL H5-b=PASS H5-c=PASS H5-d=FAIL`
- `VALID … native-f359be6-before1-h6.log checks=42 exit=2 H6-a=PASS H6-b=PASS H6-c=PASS §10.5-during=FAIL H6-d=PASS`
- `VALID … native-f359be6-before1-h10.log checks=45 exit=2 H10-en-a=PASS H10-en-b=FAIL H10-zh-a=PASS H10-zh-b=FAIL`

Exit 2 means: harness valid, at least one requirement fails at this revision (correct before FAILs). Exit 1 would mean a harness failure; exit 0 that every requirement holds. Rerunning an existing suffix stops with `Evidence exists; use a distinct suffix` before anything is archived (verified for `h5 before1`). A later rerun on the fixed product uses the unchanged files and a new suffix, with an `XAI_DEPS_ROOT` checkout whose lockfile matches that revision.

**Development probes (disclosed).** Following the frozen F1 runners' precedent (development probes outside the repository), I ran one probe per mode (`dev1`, evidence redirected to the session scratch directory by `XAI_NATIVE_EVIDENCE_DIR`, which the runner refuses inside the repository) plus one product-free CDP drag-mechanics probe. They changed only harness presentation and robustness, never an assertion's direction:
- an extra screenshot at the reset control;
- a per-frame "not reset" feedback flag, so the H5-b frame check stays correct on a fixed product that shows the reset draft with its message;
- H10 split in two after the probe showed that the overflow stays inside the `.settings-detail` box. The probe's single check, which counted the pane's horizontal overflow, is kept unchanged as part (b); part (a) states the literal claim (beyond the box, or horizontal scrolling) separately;
- a pet position probe limited to `left/top`, so a tip bubble cannot change it;
- D2 and §10.6 recorded as observations instead of separate H6 verdicts (D2 remains the H5-a verdict). No probe output is committed; every committed log was produced by the committed files (hashes below equal the `fileSha256` in each log's L1).

## Files and SHA-256

| File | Lines | SHA-256 |
| --- | --- | --- |
| `verify-native-before.mjs` (runner) | 915 | `825e3131d39c8580b295496b9dc1c2dbf28b48af18b8ad72b189a975bc6f15e6` |
| `native-app.tsx` (fixture) | 109 | `6fff7b3888d0679788a964a8f80cfdfd6e040a9fffc2731a489f505f223a200e` |
| `native-prelude.js` (instruments) | 445 | `f55e0234bc7defe4d6cbf8ef1464d8119f938651f46c0fe49791fc24f781689b` |
| `native-f359be6-before1-h5.log` | 45 | `60695aebe6c1247c3b7e6e8368b4369453ee8ab4986997adfd9f6dfe16f6d390` |
| `native-f359be6-before1-h6.log` | 54 | `579bf9811810b4b2163db39346e637dec59811a257aa31467976f38e53dd4efc` |
| `native-f359be6-before1-h10.log` | 56 | `46213534c1e9fe29eae1373dd5bf2d6b591c3a650d81f89bf35a8a3c946728dd` |
| `native-f359be6-before1-h5-before-reset.png` | — | `e8ebc22b46d2027d54a630fe1b74dfd007469700a4c3de06b95dd8e8461f8131` |
| `native-f359be6-before1-h5-at-reset-control.png` | — | `7e935ba52695ee8b520ebaba98d837649537058fa3eb0a492222bcddae410897` |
| `native-f359be6-before1-h5-after-reset.png` | — | `7a0f74222310d7175b1c846d2cde9734a04a8c5d75fa437e5db1c759c7a1d920` |
| `native-f359be6-before1-h5-after-reload.png` | — | `bcd770390cf672147a82b0481b863f656b961555d0d3edbcfdd40e48ccb13f4b` |
| `native-f359be6-before1-h6-before-reset.png` | — | `a7a965987ecb8741d9d4042d95eb64fe24e2c5946f70e6067c98e8e6e40e0f2e` |
| `native-f359be6-before1-h6-at-reset-control.png` | — | `ff290f3219d986b7caf55c5adcb6546a4ee0544915091e703e591b889f6d2084` |
| `native-f359be6-before1-h6-after-reset.png` | — | `6ab4066263dc18ad0ef335082b1d640e73cbca508d407498829de8f04c1299fb` |
| `native-f359be6-before1-h6-after-drag.png` | — | `53ae59ef72ed17ba23d1247c0c6d85f2375e4aeab945feb647b4e76e1095543b` |
| `native-f359be6-before1-h10-375-en.png` | — | `e9203d49d32794e464d1489f4c8ce96f94b7a9dec4893d66c23472cba341fc53` |
| `native-f359be6-before1-h10-375-zh.png` | — | `6b59000f2421ad076fea878cc4be0e9e86c99f70b15d505f7ee70a34e0b94c15` |
| `native-f359be6-before1-h10-1440-en.png` | — | `b92724f5a886de105a036b08c1d931c15c396a99f4e8b55d4c4303f3830081b6` |

Every screenshot is listed with its SHA-256 in the log's `screenshot` record (h5 L21/L25/L32/L40, h6 L28/L32/L36/L49, h10 L21/L36/L51). I reviewed all eleven manually.

## What runs

- **Production `App` composition** (`native-app.tsx`), all from the immutable archive:
  - the module and stylesheet order of `apps/web/src/main.tsx`: `AppProviders`, `routes/router.tsx`, `@repo/plugin-web-tokens`, `styles/global.css`;
  - the production router instance exported by `router.tsx` (`createBrowserRouter(webHostRouteObjects)`) under `RouterProvider` from `react-router/dom`, at `/app/settings/features`: `ProtectedAppRouteElement` → `App` → `AccountStorageGate` → `AccountDataGate` → `CommandPaletteProvider` → `WebShellProvider` + `Shell` (AppRail, Topbar) + `DesktopPet` + `CommandPalette`; the route renders `AppRouteElement` → ComposedSettings → the real Features pane with its shared `SettingsFooter` and legacy `usePref` bindings;
  - the production `WebAuthSessionProvider` with `onIdentityChange` = the production `invalidateAccountIdentity`, as `AppProviders` passes it.
- **The only synthetic input is the auth session.** The provider receives a client object whose `auth.getSession` resolves one authenticated session for the synthetic account `features-native-A` (the shape of the product's own mock client in `AppProviders.tsx`). `useWebAuthSession()` serves `App`, `AccountStorageGate` and the route gates from the real provider; no product module is replaced or patched. The account starts with a committed generation marker (`g1`) and the real `AccountDataGate` activates it (precondition `…:account-data-gate-activated-account`, e.g. h5 L13).
- **Instruments** (`native-prelude.js`, a classic script served before the bundle; self-tested on a product-free seed page, L8–L9 in every log):
  - attempt-level Storage tracing (every attempt recorded before any fault decision) with per-key `setItem`/`removeItem` faults that throw a `SecurityError` and never reach storage;
  - the instrumented `window.dispatchEvent` of contract §10 item 5 (every StorageEvent recorded with its key) and a first-registered `storage` listener;
  - network recorders that refuse anything non-local, plus `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`;
  - an armed `requestAnimationFrame` sampler (one probe of the displayed values per rendered frame), armed DOM observers (`<html>` attributes with old values; insertion/removal of the account-gate screen, AppRail, DesktopPet, Settings sidebar/detail and Features pane), and element-identity, focus, scroll, drag and click traces.
- **Input.** Trusted CDP mouse input after a centre hit-test; the real `window.confirm` answered through `Page.handleJavaScriptDialog`; the AppRail drag through `Input.setInterceptDrags` + `Input.dispatchDragEvent` (trusted `dragstart`/`dragover`, h6 L46). Bytes are read uninstrumented and cross-checked through CDP `DOMStorage`.
- **Seeds** (written on the seed page before the application mounts):
  - h5: Boards and Calendar stored `false` (others absent); Calendar's `removeItem` faulted only after mount;
  - h6: accent hue `210`, background tone `lavender`, rail position `right`, the production rail ids in reverse order, pet `pip` at `{x:300,y:200}`, all 8 Features keys stored `true` (so the reset performs 8 real removals while rail membership stays constant);
  - h10: `xai_pref_lang` = `"en"` then `"zh"`, nothing else.

## Provenance

- One bundle served all three modes (`bundleSha256` `e661fbd4d57a8ee8…`, CSS `ce8c0d44261b8e3c…`, equal in the three L1 records).
- Bundle inputs: 1010 in total; 619 archive inputs, which are the 618 archive files observed by the guard plus the virtual `<define:import.meta.env>` input (established by a scratch rebuild with the same build options that executed no product code); 390 third-party; **0 foreign** (L1 `bundleInputs`).
- Guard: 320 `@repo/*` import resolutions pinned to archive exports; **0 violations** against the `packages/`, `apps/` and `docs/` trees of both the dependency checkout and this runner's checkout; 618 archive modules loaded (L1 `guard`; precondition L4).
- All 34 required reader and host modules were bundled from the archive (precondition L5), with their SHA-256 in L1 `requiredModules`. They include `App.tsx` (`5d10dba6…`), `AccountStorageGate.tsx` (`1c6bf8c6…`), `AccountDataGate.tsx` (`7519485b…`), `usePref.ts` (`e1f2c913…`), `useFeaturePrefs.ts` (`c4e3fd71…`), `filterModulesByFeaturePrefs.ts` (`f1a0f1a6…`), `withDisabledFallback.tsx` (`92551e48…`), `AppRail.tsx` (`6312caa1…`), `DesktopPet.tsx` (`35edb0e6…`), `CommandPalette.tsx` (`8408a773…`), `apply.ts` (`01022da0…`), `SettingsFooter.tsx` (`afecc734…`), `session.tsx` (`5b132d3a…`) and `guards.tsx` (`9493f9f3…`).
- Network: zero page network attempts of any kind; the local server saw only the seed page, prelude, bundle, stylesheet, favicon and the application document (h5 L42, h6 L51, h10 L53).

## Results at `f359be6`

| Item | Part | Verdict | Log lines |
| --- | --- | --- | --- |
| H5 | a. Reset still dispatches its event despite the fault | **confirmed (correct FAIL)**: 1 `key:null` StorageEvent, delivered as `null:synthetic` | h5 L33 |
| H5 | b. The pane shows Calendar on while its bytes stay `false` | **refuted (PASS)**: settled Calendar switch `aria-checked="false"`, 0 of 30 rendered frames showed it on | h5 L34 |
| H5 | c. The rail shows Calendar while its bytes stay `false` | **refuted (PASS)**: Calendar absent from the rail, Boards restored, 0 frames showed Calendar | h5 L35 |
| H5 | d. No failure feedback or Retry | **confirmed (correct FAIL)**: no "Calendar was not reset to its default.", no "Retry Calendar"; the detail's buttons are only the 8 switches, "Reset to defaults" and "Save & apply" | h5 L36 |
| H5 | e. After a reload the module is off again | **observed (fact)**: Calendar off in pane and rail, bytes `false`, zero mount writes | h5 L41 (L39) |
| H6 | a. Visible values change after the reset | **refuted (PASS)**: accent hue `210`, `--accent` `oklch(57% 0.085 210)`, body background `oklch(0.96 0.022 295)` (lavender), rail position `right` (html, `.app`, `.app-rail`, rect 1218–1280), the custom rail order, pet `pet-anim-hop` (pip), art hash and `translate(300px, 200px)` all equal before and after | h6 L37 (L27, L35) |
| H6 | b. Bytes of the six preferences | **PASS** (unchanged in both the uninstrumented and the DevTools read; consistent with H6's own statement) | h6 L38 |
| H6 | c. A rendered frame shows changed values or the gate screen | **refuted (PASS)**: 0 of 30 frames differ from the before probe; 0 show the gate | h6 L39 |
| H6 | d. A later AppRail drag overwrites the stored custom order | **refuted (PASS)**: the trusted drag (Statistics onto Meditation) persisted `reorder(stored custom order)`, not the default-derived order | h6 L50 (L48) |
| §10.5 "during" (related to H6; the control-plane `AccountDataGate` fact) | No account relock, gate screen or remount during a Features operation | **confirmed (correct FAIL)** | h6 L40, h5 L37 |
| H10 | EN a. Content past the `.settings-detail` box, or the detail or document scrolls horizontally | **refuted (PASS)**: cards end at 331 px inside the detail box 24–341 px; detail `scrollWidth` 317 = `clientWidth` 317; document 375 = 375 | h10 L22 (L20) |
| H10 | EN b. The 280 px grid minimum overflows the pane and the detail's content box | **confirmed (correct FAIL)**: one 280 px track in a 263 px grid (+17 px), section block +5 px, pane `scrollWidth` 293 > `clientWidth` 289 (+4 px), all 8 cards 4 px past the content box (right edge 327 px) | h10 L23 (L20) |
| H10 | ZH a. | **refuted (PASS)**: identical geometry | h10 L37 (L35) |
| H10 | ZH b. | **confirmed (correct FAIL)**: identical geometry | h10 L38 (L35) |

Every confirmed part is a requirement that the same runner, unchanged, must find holding on the fixed product. Every refuted part still binds the fixed product. Zero preconditions failed in the three logs; zero runtime errors, exceptions or console warnings; the only JavaScript dialog was the expected confirmation (h5 L45, h6 L54, h10 L56).

### H5 in detail (h5 log)

- **Before** (L17–L20): Boards and Calendar show off; the rail lists 12 modules without them; the 8 keys saw zero set/remove attempts at mount. Screenshot `h5-before-reset.png`.
- **The reset** (L22–L31): "Reset to defaults" was found once by role and name inside `.settings-detail[data-pane="features"]` and hit-tested. The real confirmation `Reset every preference to defaults? This clears saved theme, layout, and module toggles.` was asked once and accepted. The raw loop made 8 removes: Calendar `denied` (the fault fired, L27), the other 7 `ok`, zero sets. Bytes afterwards: Calendar `"false"` (uninstrumented read and DevTools), the other 7 absent.
- **After** (L31): the pane shows Boards on and Calendar off; the rail lists 13 modules with Boards and without Calendar. No alert, status, failure message or Retry exists. Screenshot `h5-after-reset.png`.
- **Reload** (L38–L41): the new document mounts with zero writes; Calendar is still off in pane and rail; bytes unchanged. Screenshot `h5-after-reload.png`.
- **Reading.** The silent loss at the core of H5 is confirmed natively: the event fires, the refused key stays `false`, and nothing tells the user or offers Retry. The "shows on" part is masked in the production App by the remount (next section), as Sol (`reset` L740–757 at the hook layer; production `downstream` L372–373) and E3 found in jsdom. The fixed product must show the reset draft (on, with the message and Retry) while the rail keeps reflecting committed bytes (contract §6, §10 item 2).

### The `AccountDataGate` reaction, as recorded (h5 L37, h6 L40–L41)

Identical in both runs:

| Fact | Value |
| --- | --- |
| `key:null` StorageEvents dispatched / delivered | 1 / `null:synthetic`; zero keyed StorageEvents |
| `accountScope` transitions after the click | `locked:features-native-A:null:epoch3`, then `account:features-native-A:g1:epoch4` (relock, then re-activation) |
| DOM sequence (observer) | AppRail + Features pane + Settings detail/sidebar + `.app` removed; DesktopPet removed; the gate screen inserted (`Your local workspace · Choose how to start · …`) and removed; App subtree and pet inserted again |
| Replaced elements | AppRail, DesktopPet, Features pane, Settings detail and sidebar, `.app`, and the clicked "Reset to defaults" button were all detached and replaced |
| Rendered frames after the click | 30; **0** showed the gate screen, **0** lacked the pane, **0** showed a changed appearance, rail or pet value |
| `<html>` attribute writes | re-applied by the remounted App with identical values only: h5 `data-theme light→light`, `data-density comfortable→comfortable`, `data-rail-pos left→left`; h6 the same plus `data-bg-tone lavender→lavender` and `data-rail-pos right→right` |
| Focus | before: the "Reset to defaults" button; after: `<body>` |
| Scroll | the Settings scroll container `div.module.module-settings` jumped from 527 px to 0 (the user is thrown back to the top of the pane) |

Mechanism (source: `AccountDataGate.tsx:65–69, 44–57, 99`): the synthetic event reaches the gate's `storage` listener, which treats `key === null` as a generation-marker change, relocks account A and bumps `retry`. React commits the gate screen, then the retry effect re-activates generation `g1`, and the keyed `Fragment` remounts the whole business subtree. The recorded DOM sequence and the 0 gate frames show that in Chrome all of this completes before the next rendered frame (consistent with React flushing the effects of a discrete-input render synchronously), so no frame paints the gate screen or a default value. The user-visible interruption is therefore not a flash but the remount itself: focus is lost to `<body>`, the Settings scroll position resets to the top, and all subtree-local state is discarded. Only the Features keys changed bytes (h6 L41 `onlyFeatureKeysChangedBytes: true`).

### H6 and the drag (h6 log)

- Before (L25–L27): the App shows every seeded value (computed `--accent-hue` `210`, `--bg-app` `oklch(96% 0.022 295)`, body `oklch(0.96 0.022 295)`, rail on the right in grid `2 / 1 / span 2`, the reversed rail order of 14 entries, pip at 300,200). Screenshots `h6-before-reset.png` and `h6-at-reset-control.png` (the latter shows the pane scrolled to its footer).
- The accepted reset removed all 8 keys (L33–L35). Afterwards every computed value, the rail DOM order, the pet id (animation class and art hash) and position, and the six preferences' bytes are identical (L37–L38), and no rendered frame differed (L39). Screenshot `h6-after-reset.png` shows the same appearance, scrolled back to the top.
- Drag (L42–L50): with the stored custom order intact, a browser-started drag of rail button 1 (Statistics) onto button 3 (Meditation) produced trusted `dragstart`/`dragenter`/`dragover`/`dragend` and one write. The persisted order `countdown, meditation, statistics, habits, …` equals the reorder of the stored custom order; the default-derived candidate (`board, dashboard, tasks, …`) does not match. Screenshot `h6-after-drag.png`.
- **Reading.** H6 is confirmed at the hook layer by Sol (`reset` L736–737) but refuted natively in the production App, because the remount re-reads the stored values before any frame is painted. The requirement still binds the fixed product, and the remount itself is the correct §10.5 "during" FAIL.

### H10 (h10 log)

| Measurement at 375×812 (EN, L20; ZH, L35 identical) | Value |
| --- | --- |
| `.settings-detail` | box 24–341 px (317 px), padding 14 px, content box 38–327 px (289 px), `overflow-x: visible`, `scrollWidth` 317 = `clientWidth` 317 |
| `.features-pane` | 289 px, `scrollWidth` 293 |
| `.setting-block` (SectionBlock) | `clientWidth` 287, `scrollWidth` 292 |
| `.features-grid` | 51–314 px (263 px), `grid-template-columns: 280px`, `scrollWidth` 280 |
| Cards | all 8 at 51–331 px: 27 px inset on the left, 10 px on the right of the detail box, 4 px past the content box |
| Switches | right edge 316 px, inside the content box and the viewport |
| Document | `scrollWidth` 375 = `clientWidth` 375, `scrollX` 0 |
| 1440 EN control (L50, L52) | two 312 px tracks in 640 px, no overflow anywhere: the measurement distinguishes contained from overflowing layouts |

The screenshots `h10-375-en.png` and `h10-375-zh.png` show the cards crossing the section block's right border.

**Reading.** H10 holds for the pane but not as literally stated. The 280 px minimum does overflow at 375 px in both languages: past the grid, the section block, the pane and the detail's content box, into the detail's right padding. It does not leave the `.settings-detail` box, and nothing scrolls horizontally. Part (b) applies the accepted Sticky visual layout check `pane-no-horizontal-overflow` (`../web-sticky-recovery-native/verify-visual.mjs`), which E14 is expected to carry forward. Contract §9 already prescribes the remedy's scope: a `.features-pane`-scoped override.

## Validity

- **Instrument self-test** (L8–L9, product-free seed page): a faulted `setItem`/`removeItem` throws `SecurityError`, is logged as `denied` and never reaches storage; disarmed operations delegate; the dispatch counter and the delivered-event listener see `key:null` and keyed events; a non-local fetch is refused and logged; the DOM observers record a gate insertion/removal and an `<html>` attribute change; the frame sampler runs (for example 16 frames in 250 ms, h5 L8).
- **Mount preconditions** in every mount: the real auth provider served the context (`getSession` called; marker key equal); `AccountDataGate` activated account A at `g1`; AppRail, DesktopPet, Settings sidebar and 8 switches present; zero non-local network attempts; zero uncaught exceptions.
- **Fault proof:** Calendar's `removeItem` was observed `denied` and its bytes stayed `false` (h5 L27–L28); the reset otherwise ran (L29).
- **Positive controls:** zero writes at mount (h5 L20, L39); a working reset removes the unfaulted keys (h5 L29, h6 L34); the rail follows committed bytes (h5 L31).

## Contract and source observations

None blocks freezing.

1. **`AccountDataGate`'s `key:null` listener** (the control-plane fact, omitted from contract §3 item 6) is confirmed natively, with two native specifics: no rendered frame shows the gate screen, and the remount resets the Settings scroll position (527 → 0 px) and drops focus to `<body>`. Contract D2 already removes the event; `AccountDataGate` stays protected.
2. **H10 is two-sided at `f359be6`**: refuted for the `.settings-detail` box and for scrolling, confirmed for the pane and the detail's content box (part b). The fixed product must keep the detail and document free of horizontal scroll and keep the pane from overflowing (E14), using only `.features-pane`-scoped selectors (§9).
3. **H5's display claim** is masked in the production App, as Sol and E3 found in jsdom; its silent-loss core is confirmed.
4. **Reset wording:** the confirmation is still the shared footer text (recorded in h5 L26/L31 and h6 L33; H7 itself belongs to Sol).

## Limitations

- Headless Chrome 154 on macOS, not Tauri; a synthetic account and session (real provider, synthetic client). `AppProviders`' two bridges (deletion recovery, todo runtime) are not mounted; `bootstrapObservability()` and `registerServiceWorker()` are not called.
- Development build (esbuild, `import.meta.env` defined as `{}`) without StrictMode, as in the accepted native harnesses (contract §15 retained exclusion).
- No external network: the Google Fonts stylesheet of `apps/web/index.html` is not loaded, so text uses system fallback fonts. The 280 px track and the measured overflow do not depend on fonts; text-wrapping heights may differ from production.
- The frame sampler observes frames that run `requestAnimationFrame`. A state that exists only inside one task, such as the gate screen here, is recorded by the DOM observers, not by the frame sampler. The observer's `now` value for `<html>` attributes is read when its callback runs; `old` values are exact.
- The drag uses CDP drag interception: the drag events are trusted, but their data is the intercepted payload, and only the first `dragover` target reorders.
- One run per mode, at 1280×900 (h5, h6) and 375×812 and 1440×900 (h10), DPR 1, `mobile` emulation at 375 px as in the Sticky visual precedent.
- Third-party dependencies are reused read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
- Under contract §12, any later correction must use a new suffix, rerun on both archives and never weaken an assertion.
