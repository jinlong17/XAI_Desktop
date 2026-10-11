# Appearance native before baseline (CP-APPEARANCE-01, batch 39, contract r3 §14 E4)

**Verdict: FROZEN.** This directory freezes the parent-role native before evidence for the Settings Appearance caller in real headless Chrome, in the production `App` composition, against the before product `5cd63ff` and before any implementation exists. It covers contract r3 §12 "Native before" and §14 **E4**: H3, H5, H6 (every crashing value, `"EN"`, and an `Infinity` accent written by a second document), H10 across two real documents, H14 (a) and (b), H15 and H17, all in EN and ZH, with bundle provenance.

It freezes before evidence only. It implements and fixes nothing. It changes no product source, product test, contract, Sol or host evidence, frozen F1 file, ledger or control plane. It accepts nothing and does not authorize Terra; the controller decides once E1–E5 are frozen. It closes no 312 item.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance in the parent native-verifier role, isolated worktree `.claude/worktrees/agent-acb3dc1f61ea6c156`. It did not write the contract, the Sol oracles, the host baseline or any product code |
| Requested revision | `5cd63ff` |
| Resolved commit / tree | `5cd63ff652f02a2c726187fe12cbc796218d31c0` / `404bf819a42e20b3e4d372c18a981832ccd54954` (L1 of every log) |
| Docs base (detached HEAD) | `963036b77e5a08d62f72fe24783019c5f3760257` (control plane batch 39). `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty (L1 `productDeltaVsDocsHead`, precondition L2 of every log) |
| Authority | `../web-appearance-recovery-contract/contract.md` r3 (`706c9a3`), SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived at HEAD by every run (L1 `contract`, precondition L4). In particular §2, §3 items 2, 4, 6, 8, 12, A2, A2.8, A5, A9, §5 item 2, §9, §10 items 3–5, §12 "Native before", H3, H5, H6, H10, H14, H15, H17 and validity, §14 E4. Also `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` section "本轮唯一任务" (batch 39) and the CP-APPEARANCE-01 rows (E1–E3 results) |
| Browser | Chrome/154.0.8037.97 (HeadlessChrome), DevTools protocol 1.3; Node v24.16.0; esbuild 0.28.1; react 19.2.0, react-dom 19.2.0, react-router 7.15.1 (L1) |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` for `XAI_DEPS_ROOT`, `git show 5cd63ff:pnpm-lock.yaml`, the extracted archive and the contract gate constant (L1 `lockfileSha256`, precondition L3). The runner refuses to start otherwise |
| Contract source table | All 19 files of the contract r3 header table equal it in the archive (L1 `contractSourceTable`, precondition L7) |
| Diagnostic iterations | **1 of 3** per mode (`before1` for all seven modes). Development probes before `before1` are disclosed below |

## Commands

From the repository root of this worktree (one headless Chrome per mode; the dependency root is used read-only):

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-appearance-recovery-native/verify-native-before.mjs 5cd63ff <h3|h5|h6|h10|h14|h15|h17> before1
```

`XAI_NATIVE_TMPDIR` pointed at the session scratchpad; the temporary archive, profile and bundle were deleted after each run. Console lines (verdict ids abbreviated):

- `VALID … native-5cd63ff-before1-h3.log checks=195 exit=2` (6 × `H3-…-b:silent=FAIL`)
- `VALID … native-5cd63ff-before1-h5.log checks=87 exit=2` (4 × FAIL)
- `VALID … native-5cd63ff-before1-h6.log checks=462 exit=2` (18 × FAIL)
- `VALID … native-5cd63ff-before1-h10.log checks=117 exit=2` (8 × FAIL)
- `VALID … native-5cd63ff-before1-h14.log checks=67 exit=2` (EN a1/a2 FAIL, ZH a1/a2 PASS, b top/end FAIL in EN and ZH)
- `VALID … native-5cd63ff-before1-h15.log checks=101 exit=2` (10 × FAIL)
- `VALID … native-5cd63ff-before1-h17.log checks=88 exit=2` (6 × FAIL)

Exit 2 means: harness valid, at least one requirement fails at this revision (correct before FAILs); exit 1 would mean a harness failure; exit 0 that every requirement holds. Nonzero exit codes are preserved (`process.exitCode`). Re-invoking an existing suffix stops with `Error: Evidence exists; use a distinct suffix` before anything is archived (verified for `h17 before1`, exit 1). A read-only mtime scan of the dependency root after all runs (top level; `node_modules`, `apps`, `packages` and `docs` to depth 2; `apps/web/node_modules` to depth 1) found **0** entries newer than a marker taken before the first run. A later rerun on the fixed product uses the unchanged files, a new suffix and an `XAI_DEPS_ROOT` whose lockfile matches that revision.

**Development probes (disclosed).** Following the precedent of the Features E4/E5 receipts, I ran development probes before `before1`, with evidence redirected to the session scratchpad through `XAI_NATIVE_EVIDENCE_DIR` (the runner refuses that variable inside the repository): `dev1` for all seven modes, `dev2` for h3, h10, h14 and h17, and `dev3` for h3 and h14. None is committed. They found only harness or evidence-presentation issues, and no change reversed an assertion's direction:

| Probe | Finding | Change (all before `before1`) |
| --- | --- | --- |
| h3 `dev1` | On `/app/tasks` the Tasks module shows its own unrelated "Could not save… / Retry save" banner in this composition (no todo runtime bridge), which a reviewer could mistake for Appearance feedback | H3 moved to `/app/calendar` (another non-Settings route); a precondition now requires no failure-feedback surface before the choice |
| h3 `dev2` | That precondition counted Calendar's empty-state `role="status"` ("Click + to create your first event") | Alerts and statuses recorded separately; only alerts, Retry buttons, the status test id and not-saved text count. `dev3` validated it |
| h3 `dev1` | The "silent" requirement also required not-saved text, which the fixed Topbar status would show as "Not saved" (case differs) | The requirement checks the contract's `[data-testid="appearance-status"]`; the before outcome is FAIL either way. The not-saved text match became case-insensitive |
| h14 `dev1`/`dev2` | The 375 px EN overflow also scrolls the `.module-settings` container horizontally | The assessment records the ancestor scroller, the detail's content overflow and the visible part of off-viewport controls; the literal verdict counts a horizontally scrolling ancestor; the Background palette row is captured in both languages. `dev3` validated the footer geometry fields |
| h10 `dev1` | After document A's reload, the pane shows Light/Comfortable/100 % while `<html>` applies dark/compact/17.6 px | Recorded as an additional observation (`pane-mirrors`, with the scope log); not a verdict. `dev2` validated it |
| h17 `dev2` | First run of the stored-values case (additional observation 1), added after h10 `dev1` showed the mirror effect; it ran as designed | None further |
| h5, h6, h15, h17 `dev1` | No issue | None |

## Files and SHA-256

All files in this directory except this receipt, which cannot carry its own hash. Every log's L1 records `fileSha256` for the runner, fixture and prelude; they equal this table, so every committed log was produced by exactly these files.

| File | Lines | SHA-256 |
| --- | --- | --- |
| `verify-native-before.mjs` (runner) | 1382 | `6c925da3cadb86dc3ce271e3cbc698dc7b374d07e68365eafb94fcbdadc11774` |
| `native-app.tsx` (fixture) | 156 | `d980511d1266c3750c8456b949fc362cd37aee276e0b5d7894b52cfc34744b59` |
| `native-prelude.js` (instruments) | 530 | `6eae5f7f7479de5822a5bb322205cde77931b939c7ed7bf7d8b5fc005fbe8dcf` |
| `native-5cd63ff-before1-h3.log` | 217 | `088396c997ed426283616a611f85852ab307155f479cce6429cea53d4048d583` |
| `native-5cd63ff-before1-h5.log` | 99 | `e8952896fa3a2ad915550bf8981c833a1ac9ed211b188fa922a1f8e9d51c7bd4` |
| `native-5cd63ff-before1-h6.log` | 536 | `4a7df4c9aa36580bb035de07dc3fe8adef743b21c5a22af0e83256c69c1ac607` |
| `native-5cd63ff-before1-h10.log` | 131 | `9bb5fc76e9a9e138fc7192d38bcd1335b4e58cafbbd67c0e7dd015f445510d25` |
| `native-5cd63ff-before1-h14.log` | 83 | `3d1f5763d11207e6e4e24fc2678177aae0960a91fb933985c061b08bde54e02f` |
| `native-5cd63ff-before1-h15.log` | 115 | `33b8d9471aeda3b633d17db1fa401e38da55212c12461b54def848fb3d339722` |
| `native-5cd63ff-before1-h17.log` | 104 | `0677f985760b9e7078d54e631e40cc77bc98e941d1c27879f0796a8229d985e5` |
| `native-5cd63ff-before1-h3-en-lang-applied.png` | — | `89cdb09e488c97b9af821cd6d1c2a58ec93caf47cf5cfeef4b915a5a43007b9d` |
| `native-5cd63ff-before1-h3-en-theme-applied.png` | — | `d4d08f8e9530b0939b1d3bba9912c4450409e8e190f43c9f91bd2343c568d448` |
| `native-5cd63ff-before1-h3-en-density-applied.png` | — | `154e7b90736705410fbdd9456c6b0cad23b45cdbcf68d00dc4e19398b0028b4f` |
| `native-5cd63ff-before1-h3-zh-lang-applied.png` | — | `2538591898d37be2c81885cebf90373734cb7f4ad35c2413b0200a82d29be92d` |
| `native-5cd63ff-before1-h3-zh-theme-applied.png` | — | `aecbace51d661b1be6e460d5bcd91fddd81905aea8b5a690a506004af8292529` |
| `native-5cd63ff-before1-h3-zh-density-applied.png` | — | `023168a061058271bc5f26ea0f2bd496ab5a083657d742d8ffa140e42b05799a` |
| `native-5cd63ff-before1-h5-en-after-topbar-change.png` | — | `327c968871c1efb24728817c749fcaf01bd839ae7083e7fc3f056d5c5a603f5e` |
| `native-5cd63ff-before1-h5-en-after-save-and-apply.png` | — | `469d886fe3ee535118180cb5b7f8d6e4030ed6d9ac7b6598b0c1d55f42e8f79b` |
| `native-5cd63ff-before1-h5-zh-after-topbar-change.png` | — | `1494f9e982c4ad63ca060a0a0f3d4e7a07f642c44e5c882c6ed9c687a87667af` |
| `native-5cd63ff-before1-h5-zh-after-save-and-apply.png` | — | `f3c3bbfbd6a38ca3e507cec70a191c33ffe5ec10fccb4c84779db273e8030527` |
| `native-5cd63ff-before1-h6-en-lang-json-fr.png` | — | `26196195f70c8b47c2d963df3e95c6397ea88e9adf0d44b10e23c443453f906e` |
| `native-5cd63ff-before1-h6-en-lang-null.png` | — | `c5b4f49acb04286e6cfef0bb62646a00da7a04a3d50f32646172a26ac3775f14` |
| `native-5cd63ff-before1-h6-en-lang-1.png` | — | `02d1df030d157eb9174a68d61791a85e8670cc7266e90222f398705964604fd2` |
| `native-5cd63ff-before1-h6-en-lang-json-upper-en.png` | — | `b8cc809eb4fb477c2d254e07f3da0c5964b51de1dc6e8f4080ac229425a738ff` |
| `native-5cd63ff-before1-h6-en-font-scale-0.png` | — | `ad3bf684b51fc7dc922a2e84feac7ab949c8a0cf90994886b63b849a555207be` |
| `native-5cd63ff-before1-h6-en-font-scale-minus-1.png` | — | `2740fd228469d02c210e0bee68499215b47cd605d21b7fc1d5ef79b109c45ca5` |
| `native-5cd63ff-before1-h6-en-font-scale-null.png` | — | `7b5f2174faf7a0686f3d261938b9a52630c8a86c74f6f5813440c4928a78ff94` |
| `native-5cd63ff-before1-h6-en-font-scale-json-big.png` | — | `24ff0d52ea82d9ba4cb397241cce1bc5643e9eacb0810808e88f1e190e98023c` |
| `native-5cd63ff-before1-h6-en-font-scale-json-1.png` | — | `b85761f4f1306dc4b6b78dbc495c081838dcb74b6df8c6049e5237a886f81fbc` |
| `native-5cd63ff-before1-h6-en-accent-hue-infinity.png` | — | `b5a0b8d88cbf365ba27843dd699c028730efa96b0332efc4ff546e8751ffe91e` |
| `native-5cd63ff-before1-h6-zh-font-scale-0.png` | — | `ad3bf684b51fc7dc922a2e84feac7ab949c8a0cf90994886b63b849a555207be` |
| `native-5cd63ff-before1-h6-zh-font-scale-minus-1.png` | — | `2740fd228469d02c210e0bee68499215b47cd605d21b7fc1d5ef79b109c45ca5` |
| `native-5cd63ff-before1-h6-zh-font-scale-null.png` | — | `7b5f2174faf7a0686f3d261938b9a52630c8a86c74f6f5813440c4928a78ff94` |
| `native-5cd63ff-before1-h6-zh-font-scale-json-big.png` | — | `24ff0d52ea82d9ba4cb397241cce1bc5643e9eacb0810808e88f1e190e98023c` |
| `native-5cd63ff-before1-h6-zh-font-scale-json-1.png` | — | `b85761f4f1306dc4b6b78dbc495c081838dcb74b6df8c6049e5237a886f81fbc` |
| `native-5cd63ff-before1-h6-zh-accent-hue-infinity.png` | — | `b5a0b8d88cbf365ba27843dd699c028730efa96b0332efc4ff546e8751ffe91e` |
| `native-5cd63ff-before1-h6-en-cross-document-infinity.png` | — | `b5a0b8d88cbf365ba27843dd699c028730efa96b0332efc4ff546e8751ffe91e` |
| `native-5cd63ff-before1-h6-zh-cross-document-infinity.png` | — | `b5a0b8d88cbf365ba27843dd699c028730efa96b0332efc4ff546e8751ffe91e` |
| `native-5cd63ff-before1-h10-en-A-after-B-commits.png` | — | `2ab354c6429a46f318a998b4cfa1f5cec3cf5947928e08431eee4b79548abe5c` |
| `native-5cd63ff-before1-h10-en-A-after-reload.png` | — | `c330980eeb3cd57f695399c951ec1265b215d1e99d584adf8a89163b43837add` |
| `native-5cd63ff-before1-h10-zh-A-after-B-commits.png` | — | `6285e5227be8e3386c64faac8282cc3a15931a3c16234b75333c6e790e4074f4` |
| `native-5cd63ff-before1-h10-zh-A-after-reload.png` | — | `f1da81a0b2898838544b1921194139458d5be4b2f5b83ad6af66b58dfeef0f57` |
| `native-5cd63ff-before1-h14-375-en-row5.png` | — | `f2d7cea34390cbc7a9cf616fc74772752d6ce882072c4352bdce4f7fd7581aa6` |
| `native-5cd63ff-before1-h14-375-zh-row5.png` | — | `a7ebb3e1ec3b79d8b2f8e2479859e6f8fc4147bb3c9be03dcfa48190b268598b` |
| `native-5cd63ff-before1-h14-768-en-top.png` | — | `8aa2f9ccd6463c193c33bee21903e7524098cc247e1cbab2f20dbc241622b61e` |
| `native-5cd63ff-before1-h14-768-en-end.png` | — | `d2f2b3ec5db1a4e7f26c068e730c53140d1289b4c9c094feaf17cb36dcd41013` |
| `native-5cd63ff-before1-h14-768-zh-top.png` | — | `c9e736addb4929977b970be19acca46821ae4b254e2d796462d05479878426a4` |
| `native-5cd63ff-before1-h14-768-zh-end.png` | — | `b9a6d8a629fe32c3e62df085575f12d13fedaf0a685c64d3966b6a7e14c76645` |
| `native-5cd63ff-before1-h15-en-before-activation.png` | — | `431599119e93f8edc8ac43bba8131dce347da074965034c2664086e625a4be2e` |
| `native-5cd63ff-before1-h15-en-saved-flash.png` | — | `70d8153e3572b93f5ec06efefdab828f9a161744f7e159e5b11508284522b7c2` |
| `native-5cd63ff-before1-h15-zh-before-activation.png` | — | `c91361d0f05c9dc4b7240ca2b9c11a7f7d10b5dceef54abf1490aa85484d28d5` |
| `native-5cd63ff-before1-h15-zh-saved-flash.png` | — | `6403f7b003de9cb1fcd6e5f7364274ac14fff44c02531db251c5fed13a455ff8` |
| `native-5cd63ff-before1-h17-en-tab-focused.png` | — | `1103970225eacd3580645f422b6588bbac7b3bcfec507975ae0617cd131767fc` |
| `native-5cd63ff-before1-h17-en-saved-flash.png` | — | `1660d53d27684ed5f917d3fbf2e693a1a61424207fa41380d8eb69a94ba12a41` |
| `native-5cd63ff-before1-h17-zh-tab-focused.png` | — | `10aca40cffaf22afbb8ee295b6c38d227035caffec63ecc5381789f25fe6d391` |
| `native-5cd63ff-before1-h17-zh-saved-flash.png` | — | `5cec640a02f9f7a73d84d7f10421cb2023ce53b051b4bb453c0e51427395992d` |
| `native-5cd63ff-before1-h17-en-stored-before-activation.png` | — | `1db6d75e2671b3a41998e8c22d746d2c4412147c7b7fd321586d85599c86320c` |

Every screenshot's SHA-256 is also in its log's `screenshot` record (line numbers in the results below). Identical hashes are expected where the rendered page is identical: the route error boundary is English-only and depends only on the thrown message, so the EN and ZH captures of the same crashing value, and the at-load and cross-document `Infinity` captures, are byte-identical.

## What runs

**Production `App` composition** (`native-app.tsx`), all from the immutable archive (contract §9 "Composition"):
- the module and stylesheet order of `apps/web/src/main.tsx`: the observability runtime, `AppProviders`, `routes/router.tsx`, the service-worker module, `@repo/plugin-web-tokens`, `styles/global.css`. Imports only evaluate them; `bootstrapObservability()` and `registerServiceWorker()` are not called;
- the production router instance exported by `router.tsx` (`createBrowserRouter(webHostRouteObjects)`) under `RouterProvider` from `react-router/dom`: `/app/*` renders `ProtectedAppRouteElement` → `App` → `AccountStorageGate` → `AccountDataGate` → `CommandPaletteProvider` → `WebShellProvider` + `Shell` (AppRail, Topbar) + `DesktopPet` + `CommandPalette`, under the production `app` route error boundary; `/app/settings/appearance` renders `AppRouteElement` → ComposedSettings → the real Appearance pane with its shared `SettingsFooter`, legacy `usePref`/`setPref` and the event bus;
- the production `WebAuthSessionProvider` with `onIdentityChange` = the production `invalidateAccountIdentity`.

**The only synthetic input is the auth session.** The provider receives a client whose `auth.getSession` resolves one authenticated session for the synthetic account `appearance-native-A` (the shape of the product's own mock client). Every mount asserts that the real provider served it (`getSession` called; marker key equal) and that the real `AccountDataGate` activated `account/appearance-native-A/g1` (preconditions after each mount). Not mounted: `AppProviders`' two bridges (no network client). No StrictMode (contract §15).

**Instruments** (`native-prelude.js`, a classic script served before the bundle and alone on a product-free seed page; self-tested at L9–L10 of every log):
- attempt-level Storage tracing: every `getItem`/`setItem`/`removeItem`/`key`/`clear`/`length` attempt is recorded before any fault decision and before exactly one delegation; an armed `setItem` fault throws `QuotaExceededError`, an armed `removeItem` fault `SecurityError`, and neither reaches storage. A depth counter proves no nested Storage call (F-B002 rule; `noNestedStorageCalls` in the self-test);
- the instrumented `window.dispatchEvent` (StorageEvent keys) and a first-registered `storage` listener that records every delivered storage event with `isTrusted`;
- network recorders that refuse anything non-local, plus `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`;
- read-only DOM probes (`<html>` attributes and inline style, `.app`, the Topbar popover and summary, the pane's seven rows and footer, the pet, the route error boundary, every failure-feedback surface), a `requestAnimationFrame` sampler and capture-phase click, keydown and focusin traces.

**Input and reads.** Trusted CDP mouse input after a centre hit-test; trusted CDP key events (Tab, Escape, ArrowRight). Bytes are read uninstrumented and cross-checked through CDP `DOMStorage`. Seeds are written on the seed page before the application document loads. A second document (h6, h10) is a second real tab of the same profile and origin. Real Web Locks (`navigator.locks`) are held from the page in h15.

**DesktopPet.** On (production default) in h3, h6, h10 and h14. In h5, h15 and h17 it is hidden first through the product's own rail pet toggle (trusted, hit-tested; zero storage writes), as in the accepted gated compositions, because at 1280×900 its default box (1172–1256 × 792–876) is near the sticky footer.

**Viewports.** 1280×900 (h3, h5, h6, h10, h15, h17); 375×812 with mobile emulation and 768×1024 (h14). Viewport changes are made before an application document loads (on `about:blank` at the start of a mode, or on the product-free seed page in h14), so the pet's resize clamp cannot persist a position.

## Provenance

- One bundle served all seven modes: `bundleSha256` `3ef3e56f0c2e8c6271195b256b589c7eedd0e1e4b9709707adfd09defb77383a`, CSS `b4ca75d8a975eee883a777cd4f32af199cd4a8175669544a545d64f84dd2bc47` (equal in every L1).
- Bundle inputs: 1013 in total; 621 from the archive (equal to the 621 archive modules the guard observed); 390 third-party; **0 foreign** (L1 `bundleInputs`, precondition L5).
- Guard: 320 `@repo/*` resolutions pinned to archive package exports; **0 violations** against the `packages/`, `apps/` and `docs/` trees of the dependency checkout and of this runner's checkout (L1 `guard`, precondition L5).
- **Every reader module came from the archive:** all 52 required reader, writer and host modules were bundled from the archive (precondition L6), with SHA-256 in L1 `requiredModules`. The contract §2 readers among them: `App.tsx` (`readLocalPref`, root state; `5d10dba6…`), `NotFoundPage.tsx` (raw `xai_pref_theme`; `a61a4677…`), `AccountStorageGate.tsx` (raw `xai_pref_lang`; `1c6bf8c6…`), `xai-web-shell/src/registry.tsx` (`WebShellProvider`; `b621abbe…`), `Shell.tsx` (`7d46423f…`), `AppRail.tsx` (`6312caa1…`), `Topbar.tsx` (`70ba299e…`), `CommandPalette.tsx` (`8408a773…`), `DesktopPet.tsx` (`35edb0e6…`), legacy `usePref.ts` (`e1f2c913…`) and `storage.ts` (`b51bcaa0…`). Also `AppearancePane.tsx` (`552eb224…`), `SettingsFooter.tsx` (`afecc734…`), `RouteErrorBoundary.tsx` (`3768ad2e…`), `apply.ts` (`01022da0…`), `i18n.ts` (`d5f2189b…`), `AccountDataGate.tsx` (`7519485b…`) and `departureCoordinator.tsx` (`0844a697…`).
- Network: zero page network attempts of any kind in every run (`run:network-and-requests`, the fourth-last line of each log; precondition `run:no-non-local-network-attempt` on the next line).

## Results at `5cd63ff`

"Confirmed" means the contract requirement fails at this revision (a correct before FAIL); "refuted" means it holds (PASS; the requirement still binds the fixed product); "observed" marks a fact the hypothesis asserts. Zero preconditions failed in the seven logs; zero exceptions; zero unexpected dialogs. Console warnings (product warnings, not errors; last line of each log): h6 has 2 × `[plugin-web-storage] decode failed for xai_accent_hue …` (the registered accent codec rejecting a malformed stored accent) and h15 has 2 × `[plugin-web-storage] quota exceeded for xai_accent_hue.` (the legacy `setPref` on the injected accent fault, once per language); the other five logs have none.

| Hypothesis | Part | EN | ZH |
| --- | --- | --- | --- |
| **H3** (denied Topbar write) | language: applied while bytes keep old value / silent / reverts after reload | observed L31 / **confirmed** L32 / observed L43 | observed L133 / **confirmed** L134 / observed L145 |
| | theme | observed L65 / **confirmed** L66 / observed L77 | observed L167 / **confirmed** L168 / observed L179 |
| | density | observed L99 / **confirmed** L100 / observed L111 | observed L201 / **confirmed** L202 / observed L213 |
| **H5** | a. Topbar change not reflected in the pane | **confirmed** h5 L41 | **confirmed** h5 L84 |
| | b. "Save & apply" writes the pane's stale values, reverting the Topbar choice | **confirmed** h5 L52 | **confirmed** h5 L95 |
| **H6** (route error boundary) | `xai_pref_lang` `"fr"`, `null`, `1` | **confirmed** h6 L32, L71, L94 | n/a (the language value itself is malformed) |
| | `xai_pref_lang` `"EN"` (Sol addition) | **confirmed** h6 L117 | n/a |
| | `xai_pref_font_scale` `0`, `-1`, `null`, `"big"`, `"1"` | **confirmed** h6 L196, L219, L242, L265, L304 | **confirmed** h6 L437, L450, L463, L476, L489 |
| | `xai_accent_hue` `Infinity` at load | **confirmed** h6 L335 | **confirmed** h6 L502 |
| | `Infinity` accent written by a second document into a running App (Sol addition) | **confirmed** h6 L517 | **confirmed** h6 L532 |
| **H10** (two documents) | language / theme / density / font scale not reflected until reload | **confirmed** h10 L53 / L54 / L55 / L56 | **confirmed** h10 L112 / L113 / L114 / L115 |
| | reflected after the idle document's reload | observed L67 | observed L126 |
| **H14 (a)** 375 px | a1. controls past `.settings-detail` or horizontal scrolling | **confirmed** h14 L23 | **refuted** h14 L39 |
| | a2. controls past the detail's content box or pane overflow | **confirmed** h14 L24 | **refuted** h14 L40 |
| **H14 (b)** 768×1024, pet on | pet covers the centre of "Save & apply"/"保存生效" at the top of the scroll range | **confirmed** h14 L57 | **confirmed** h14 L76 |
| | … at the end of the scroll range | **confirmed** h14 L60 | **confirmed** h14 L79 |
| **H15** | a. zero attempts on the failed accent key | **confirmed** h15 L56 | **confirmed** h15 L107 |
| | b. rewrites all four root keys raw from the pane's values, ignoring the per-key lock, overwriting the Topbar choice | **confirmed** h15 L57 | **confirmed** h15 L108 |
| | c. swallows a failure | **confirmed** h15 L58 | **confirmed** h15 L109 |
| | d. "Saved"/"已保存" for about 1.8 s in every case | **confirmed** h15 L59 | **confirmed** h15 L110 |
| | e. no per-field result | **confirmed** h15 L60 | **confirmed** h15 L111 |
| **H17** (clean state) | a. no disabled "nothing to retry" state | **confirmed** h17 L35 | **confirmed** h17 L70 |
| | b. exactly four root `setItem` attempts with the pane's values / zero on registered keys | observed L41 / observed L42; requirement **confirmed** L43 | observed L76 / observed L77; requirement **confirmed** L78 |
| | c. "Saved"/"已保存" flash although nothing was unsaved | **confirmed** h17 L44 | **confirmed** h17 L79 |

No hypothesis exercised here was refuted, except H14 (a) in ZH, where the Appearance controls fit at 375 px.

### H3 (h3 log; Topbar on `/app/calendar`, seeds `xai_pref_lang` = the session language, theme `"light"`, density `"comfortable"`)

| Session / field | Denied attempt (fault armed and observed) | Bytes after | Applied display | Feedback | After reload |
| --- | --- | --- | --- | --- | --- |
| EN / language → 中文 | `set:xai_pref_lang="zh":denied` (L30) | `"en"` | whole UI Chinese; summary `中文 · 浅色 · 舒适`; 中文 checked | none: no status test id, no alert, no Retry, no not-saved text | `EN · Light · Comfortable`, zero mount writes (L42) |
| EN / theme → Dark | `set:xai_pref_theme="dark":denied` (L64) | `"light"` | `<html data-theme="dark">`; `EN · Dark · Comfortable` | none | Light again (L76) |
| EN / density → Compact | `set:xai_pref_density="compact":denied` (L98) | `"comfortable"` | `data-density="compact"`; `EN · Light · Compact` | none | Comfortable again (L110) |
| ZH / language → English | `set:xai_pref_lang="en":denied` (L132) | `"zh"` | whole UI English | none | `中文 · 浅色 · 舒适` (L144) |
| ZH / theme → 深色 | `set:xai_pref_theme="dark":denied` (L166) | `"light"` | dark; `中文 · 深色 · 舒适` | none | light again (L178) |
| ZH / density → 紧凑 | `set:xai_pref_density="compact":denied` (L200) | `"comfortable"` | compact; `中文 · 浅色 · 紧凑` | none | comfortable again (L212) |

Bytes were confirmed both uninstrumented and through DevTools. No other Appearance key was written. No `beforeunload` prompt occurred on any reload. Before each choice the page had no failure-feedback surface (preconditions L21, L55, L89, L123, L157, L191).

### H5 (h5 log; pane mounted at `/app/settings/appearance`; pet hidden, L24 / L67)

- The Topbar choices Dark and Compact committed `"dark"` and `"compact"` (no fault) and were applied to `<html>` and the summary (`EN · Dark · Compact` / `中文 · 深色 · 紧凑`). The pane still showed the Light card active and Comfortable selected (L40 / L83) → **H5 a confirmed**.
- One trusted click on "Save & apply"/"保存生效" wrote `lang` (session value), `"light"`, `"comfortable"` and `1`, and nothing on the registered keys. Bytes became `"light"`/`"comfortable"` (uninstrumented and DevTools), `<html>` returned to light/comfortable, the summary and the Topbar `aria-checked` returned to Light/Comfortable, and the button read "Saved"/"已保存" (L51 / L94) → **H5 b confirmed**.

### H6 (h6 log)

**Sweep of every §5 item 2 value at load** (EN session, `/app/settings/appearance`; summary L424): exactly **10** of 33 values crash `/app` — the nine H6 values and `"EN"`; `crashedButNotListed` and `listedButRendered` are both empty. For each crashing value the boundary `Route Error (app)` replaces the product (no `.app`, Topbar, rail or pet) on **all four routes** tried, `/app/settings/appearance`, `/app/tasks`, `/app/calendar` and `/app` (L31, L70, L93, L116, L195, L218, L241, L264, L303, L334). The `/app` index stays at `/app` for language values (the render throws before the redirect) and lands on `/app/ai` for font-scale and accent values (an effect throws after the redirect). DOM text per value:

| Value | Route error DOM text (`main.host-page`) | Capture |
| --- | --- | --- |
| `xai_pref_lang` `"fr"` | `Route Error (app)` / `[useI18n] unsupported lang "fr". Supported: "en" \| "zh".` | L18 |
| `null` | `… unsupported lang "null" …` | L57 |
| `1` | `… unsupported lang "1" …` | L80 |
| `"EN"` | `… unsupported lang "EN" …` | L103 |
| `xai_pref_font_scale` `0` | `[applyFontScale] scale must be a finite positive number, got: 0` | L182 (EN), L431 (ZH) |
| `-1` | `… got: -1` | L205, L444 |
| `null` | `… got: null` | L228, L457 |
| `"big"` | `… got: big` | L251, L470 |
| `"1"` | `… got: 1` (the string "1"; `Number.isFinite` does not coerce) | L290, L483 |
| `xai_accent_hue` `Infinity` | `[applyAccentHue] hue must be a finite number, got: Infinity` | L321, L496 |

The 23 values that render (L40–L423) display defaults or apply the raw value without a throw, for example `data-theme="neon"`, `data-density="[object Object]"`, font size `32px` for `2` and `8px` for `0.5`, `--accent-hue: -5`/`361`/`12.5`, `data-rail-pos="diagonal"`/`" left"`/`""`, `data-bg-tone="sage"`/`"Mist"`/`""`. These are recorded as observations, not H6 verdicts (they belong to H7 and the root analogue Sol recorded).

**ZH sessions** (`xai_pref_lang` = `"zh"` plus the value; L425–L502): the six non-language crashing values crash `/app/settings/appearance` and `/app/tasks` (observations L436, L449, L462, L475, L488, L501). The boundary is not localized.

**Cross-document `Infinity`** (L503–L532): document A runs the App on `/app/settings/appearance`; document B is a second real tab on the product-free seed page. Control first: B writes `xai_accent_hue` = `230`, A receives the trusted storage event and applies `--accent-hue: 230` live without a crash (precondition L513 / L528). Then B writes `Infinity`: A receives the trusted event (L514 / L529) and the running App is replaced by `Route Error (app)` / `[applyAccentHue] hue must be a finite number, got: Infinity` (L515 / L530) → confirmed in EN and ZH.

The 120 runtime-error lines of this run are React's and React Router's `console.error` reports of the caught render and effect errors; there are zero uncaught exceptions (L536).

### H10 (h10 log; two real documents of the production App, same profile and origin)

- Document B (a second tab, mounted with the same synthetic session) committed, through trusted input: Violet accent (`295`), font scale 1 → 1.05 → 1.1 by two trusted ArrowRight presses on the Tab-focused slider, Topbar Dark, Compact and the other language. Bytes `"dark"`, `"compact"`, the other language, `1.1`, `295` (precondition L49 / L108; writes in L52 / L111).
- Document A, idle on `/app/settings/appearance`, received a trusted storage event for every committed key (precondition L50 / L109). The registered accent propagated live (`--accent-hue: 295`, slider 295; positive control L51 / L110). Language, theme, density and font scale did not: A still showed its own language, `data-theme="light"`, `data-density="comfortable"`, `font-size: 16px`, the old summary and the old pane state (L52 / L111) → **all four confirmed**. A made zero Appearance writes while idle.
- After A's own reload it shows B's committed values: other language, dark, compact, 17.6 px (facts L67 / L126).

### H14 (h14 log)

**(a) 375×812, mobile emulation** (L22 / L38): `.settings-detail` box 24–341 px, content box 38–327 px.
- **EN, confirmed.** The Background palette grid (`repeat(6, 1fr)`) sizes its columns to the English names: Peach 287.31–340.91 px (past the content box) and Graphite 348.91–418.06 px (past the detail box and the 375 px viewport: 26.09 of 69.16 px visible, centre off-screen). The pane overflows by 91 px (`scrollWidth` 380 > 289), the detail's content by 77 px, and the `.module-settings` scroll container scrolls horizontally (418 > 365). The document does not scroll (375 = 375). Every other row fits.
- **ZH, refuted.** All 27 controls stay inside the content box (the six tone cards are 41.5 px each, ending at 327 px); no overflow anywhere.

**(b) 768×1024, DesktopPet on at its default position** (pet box 660–732 × 916–988, the swap button inside it at 688–732 × 916–960; not hovered or focused; no stored pet position). `.module-settings` scroll range 0–759 px. The footer is `position: sticky`, `justify-content: flex-end`, and "Save & apply" is its inline-end (last) control.

| | Button box | Centre | Five points on the pet | Intersection with the pet |
| --- | --- | --- | --- | --- |
| EN top (scrollTop 0), L55 | 604.36–717 × 962–1006 | 660.68, 984 → **pet** | 2 (centre, top-right) | 57 × 26 = 1482 px² |
| EN end (scrollTop 759), L58 | 604.36–717 × 939.05–983.05 | 660.68, 961.05 → **pet** | 3 (centre, top-right on the swap button, bottom-right) | 57 × 44 = 2508 px² |
| ZH top, L74 | 607–717 × 962–1006 | 662, 984 → **pet** | 2 | 1482 px² |
| ZH end, L77 | 607–717 × 939.05–983.05 | 662, 961.05 → **pet** | 3 | 2508 px² |

The A2.8-style separation is −57 px in every case. H14 (b) is confirmed at both ends of the scroll range in both languages.

### H15 (h15 log; pet hidden, L24 / L75)

1. Pane accent "Ocean"/"海洋" with `setItem(xai_accent_hue)` denied: one denied `230` (precondition L29 / L80), bytes absent; the Sage swatch stays active at 165 (H1-like) with no feedback (L31 / L82).
2. Topbar Dark with `setItem(xai_pref_theme)` denied: one denied `"dark"` (L39 / L90); `<html>` dark while the pane still shows Light (L42 / L93).
3. Both faults lifted; a never-failed `xai_pref_font_scale` write denied; the real Web Lock `xai:pref:v1:xai_pref_density` held from the page (L44 / L95).
4. One trusted click on "Save & apply"/"保存生效" (L49 / L100). Attempt log (L55 / L106): `set xai_pref_lang` (session value), `set xai_pref_theme="light"`, `set xai_pref_density="comfortable"` **while its per-key lock was held** (`navigator.locks.query()` held `xai:pref:v1:xai_pref_density` during the activation), `set xai_pref_font_scale=1` **denied and swallowed** (L50 / L101); **zero** attempts on `xai_accent_hue`, `xai_bg_tone`, `xai_rail_pos`. The Topbar's Dark choice was overwritten: bytes `"light"`, `<html>` light, summary and Topbar checked Light. No status, recovery block, alert or Retry appeared.
5. Flash: "Saved"/"已保存" with `.is-saved` about 200 ms after the click (screenshots L48 / L99); 110 of 133 rendered frames show it, the first to last such frame spanning 1817 ms; at 2.1 s the label is back to "Save & apply"/"保存生效".

### H17 (h17 log; pet hidden, L24 / L59)

- Clean state: no fault, no feedback; bytes all absent in EN, only `xai_pref_lang` = `"zh"` in ZH (L26 / L61).
- **Reached by Tab:** a trusted click on the non-focusable pane title set the sequential focus starting point, then **27 trusted Tab presses** walked English, 简体中文, three theme cards, two density segments, six swatches, the hue slider, six tone cards, four rail cards, the font slider, "Reset to defaults" and reached "Save & apply"/"保存生效" (L30 / L65). The focused button matches `:focus-visible` with a solid 2 px outline, has neither `disabled` nor `aria-disabled` nor `aria-describedby`, class `btn primary pane-save` (L33 / L68) → **H17 a confirmed**.
- **Activated by a trusted click** (L39 / L74): exactly four `setItem` attempts, `xai_pref_lang`=`"en"`/`"zh"`, `xai_pref_theme`=`"light"`, `xai_pref_density`=`"comfortable"`, `xai_pref_font_scale`=`1`, and zero on the three registered keys (L40 / L75). Absent root keys gained their defaults' bytes. → facts observed (L41–L42 / L76–L77), requirement "an activation while nothing can be retried is inert" **confirmed** (L43 / L78).
- **Flash:** "Saved"/"已保存" immediately; 108 frames, 1783 ms first to last; reverted at 2.1 s (L44 / L79).

## Additional native observations (not contract hypothesis verdicts)

1. **Pane mirrors after a fresh load** (h10 L66 / L125; h17 L100). Natively the account scope activates once at load (`locked:null` → `locked:A` → `account:A:g1`, h10 L65 / L124), so the pane's theme, density and font-scale mirrors, seeded from the DOM during the same render as App, read the attributes before App's effects apply the stored values. In a new document with stored dark/compact/1.1, `<html>` is dark/compact/17.6 px while the pane shows Light, Comfortable and 100 %. Sol recorded the opposite in jsdom (its observation 7: a remount at mount made the mirrors read the applied values). Consequence (h17 L100, screenshot L97): one clean-state "Save & apply" there writes `"light"`, `"comfortable"` and `1` over the valid stored choices, and the page reverts to light, comfortable and 16 px. This extends H17 ("with the pane's values") and H5 natively.
2. **The route error boundary is English-only**, also in a ZH session (H6 ZH captures).
3. **`/app/tasks` shows the Tasks module's own save-failure banner** in this composition (h3 `dev1`, not committed); H3 therefore ran on `/app/calendar`. The Tasks banner is unrelated to Appearance.

## Manual screenshot review (all 47 opened and inspected)

| Screenshots | Conclusion |
| --- | --- |
| H3 ×6 (`h3-{en,zh}-{lang,theme,density}-applied`) | Each shows the Calendar route with the Topbar popover open and the denied choice applied: the whole UI switched language (EN→中文, ZH→English), or the page dark, or compact rows; the choice is checked and in the summary. No status control beside the trigger, no alert, no Retry. The Calendar demo banner and empty-state line are the module's own. Matches the logs |
| H5 EN/ZH `after-topbar-change` | Dark, compact page; summary Dark/Compact (深色/紧凑); the pane still highlights Light (浅色) and Comfortable (舒适). Pet hidden. Confirms H5 a |
| H5 EN/ZH `after-save-and-apply` | Page back to light/comfortable; summary Light/Comfortable; the button reads "Saved"/"已保存" in its saved style. Confirms H5 b |
| H6 ×18 | Each shows only the production boundary: heading "Route Error (app)" and the thrown message for that value (lang `"fr"`, `"null"`, `"1"`, `"EN"`; font scale `0`, `-1`, `null`, `big`, `1`; accent `Infinity`; ZH captures identical to EN; cross-document captures identical to the at-load `Infinity` capture). No shell, rail, Topbar or pet: the whole `/app` product is replaced |
| H10 EN/ZH `A-after-B-commits` | Light page in the original language with the old summary and pane state, but the Violet swatch active and 295° (the registered accent propagated live). Confirms H10 |
| H10 EN/ZH `A-after-reload` | After reload: dark, compact, larger type, the other language and summary; the pane nevertheless highlights Light/Comfortable and 100 % (the mirror observation). Matches the logs |
| H14 `375-en-row5` | The Background palette cards have uneven widths; "Peach" reaches the detail edge and "Graphite" is cut at the viewport edge (only "G" visible); a horizontal scrollbar is visible on the Settings scroller. Confirms H14 (a) EN |
| H14 `375-zh-row5` | Six equal tone cards (names wrap, e.g. 鼠尾/草) fully inside the pane. Refutes H14 (a) ZH |
| H14 `768-{en,zh}-{top,end}` | The sticky footer at the bottom with "Reset to defaults"/"恢复默认" and "Save & apply"/"保存生效" at the inline end; the default-position pet with its swap button overlaps the button's right part (at the end "Save & a…"/"保存生…" visible, the rest under the pet). In the two top captures the pet renders faint in that animation frame; the hit-tests are authoritative. Confirms H14 (b) |
| H15 EN/ZH `before-activation` | Dark page (Topbar Dark denied but applied), pane theme still Light, accent still Sage 165° (the denied Ocean reverted). No feedback anywhere |
| H15 EN/ZH `saved-flash` | Page back to light (Topbar choice overwritten), accent still Sage 165° (not retried), button "Saved"/"已保存"; no failure feedback for the swallowed font-scale write. Confirms H15 |
| H17 EN/ZH `tab-focused` | "Save & apply"/"保存生效" in its enabled primary style with a visible focus ring; no disabled appearance. Confirms H17 a |
| H17 EN/ZH `saved-flash` | Same clean page; the button reads "Saved"/"已保存". Confirms H17 c |
| H17 `en-stored-before-activation` | Dark, compact page in a fresh document with summary `EN · Dark · Compact` while the pane highlights Light and Comfortable (the mirror observation) |

## Validity

- **Instrument self-test** (L9–L10, product-free seed page): faulted `setItem`/`removeItem` throw `QuotaExceededError`/`SecurityError`, are logged `denied` and never reach storage; disarmed operations delegate; `getItem` is logged; no nested Storage call; the dispatch counter and the delivered-event listener see `key:null` and keyed events; a non-local fetch is refused and logged; the DOM observers record a gate insertion/removal and an `<html>` attribute change; the frame sampler runs.
- **Mount preconditions** in every mount: bundle evaluated; the real auth provider served the session; `AccountDataGate` activated `account/appearance-native-A/g1`; the production App (Topbar, rail) or the route error boundary rendered as the case expects; zero non-local network attempts; zero uncaught exceptions where a crash is not the case's subject.
- **Fault proof:** every armed fault was observed as a `denied` attempt with the expected value, and the faulted bytes were unchanged (uninstrumented and DevTools reads).
- **Positive controls:** zero writes on the seven keys at every mount; Topbar writes commit their bytes when not faulted (h5); a valid cross-document accent write reaches the running App live (h6, h10); the reload reflects committed values (h10); the pane and Topbar render all seven rows and options in both languages.
- Hit-tests: every trusted click was preceded by a centre hit-test on the intended control.

## Contract and source observations

None blocks freezing.

1. **H6 is exactly the nine listed values plus `"EN"`** natively; no other §5 item 2 value crashes at load. The cross-document `Infinity` crash is confirmed natively with a real second document and a trusted storage event.
2. **H14 (a) is language-dependent**: it holds in EN (the Background palette row) and is refuted in ZH. The overflow also makes `.module-settings` scroll horizontally. Contract §9 scopes any 375 px fix to `.appearance-pane`.
3. **H14 (b) holds at both ends of the scroll range**, because the footer is sticky: at the top of the range the covered button is the sticky footer's, not the pane end's. The separation from the pet's left edge is −57 px.
4. **Pane mirrors after a fresh load** differ natively from Sol's jsdom observation 7 (additional observation 1). The fixed product removes the mirrors (A3), so this binds nothing new, but it strengthens H5 and H17 natively.
5. **H15 harness choices** (disclosed): after showing both denials fired, the accent and theme faults were lifted so a real retry could have succeeded; a never-failed font-scale write was denied to show the swallowing; the density per-key lock was held to show the lock is ignored. These follow Sol's H15 case design.

## Limitations

- Headless Chrome 154 on macOS, not Tauri; a synthetic account and session (real provider, synthetic client). `AppProviders`' bridges are not mounted; `bootstrapObservability()` and `registerServiceWorker()` are not called. Development build (esbuild, `import.meta.env` defined as `{}`) without StrictMode.
- No external network: the Google Fonts stylesheet is not loaded, so text uses system fonts; text widths, and therefore the 375 px EN card widths, may differ slightly in production.
- The frame sampler observes frames that run `requestAnimationFrame`; flash durations are first-to-last rendered frame spans.
- The second document in h6 is the product-free seed page writing raw bytes (modelling another document or an older build); in h10 it is a second instance of the production App.
- The pet was hidden through its product toggle in h5, h15 and h17; h14 (b) ran with the pet on and not hovered or focused.
- One run per mode, DPR 1; Chrome's sequential-focus-starting-point behaviour is relied on for the Tab walk and the font-slider focus.
- Third-party dependencies are reused read-only from `XAI_DEPS_ROOT`; the lockfile gate is a consistency check only.
- Under contract §12, any later correction must use a new suffix, rerun on both archives and never weaken an assertion.
