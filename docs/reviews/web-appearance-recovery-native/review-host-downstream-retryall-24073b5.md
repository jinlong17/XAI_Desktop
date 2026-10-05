# Appearance native host matrix, downstream and Retry all (CP-APPEARANCE-01, batch 45, contract r3 §14 E12, E13, E26)

**Verdict: PASS for all three modes** (`host` = E12, `downstream` = E13, `retryall` = E26), each on its first committed diagnostic iteration (`fixed1`). No product failure was observed. Every log ends with `pass: true`, 0 failed checks, 0 runtime exceptions, 0 console errors, 0 console warnings, 0 unexpected JavaScript dialogs, 0 non-local network attempts and a clean key audit.

**Status.** This is verification only.
- It is not acceptance and it authorizes nothing.
- It changes no product source, product test, contract, ledger, control plane or existing evidence. Every earlier file in this directory and in `../web-appearance-recovery-f1/`, `../web-sticky-recovery-f1/` and `../web-features-recovery-native/` was read only. Before the commit, `git status --porcelain --untracked-files=all` listed only the 29 new files below, all in this directory.
- It closes no 312 item. SET-02, SHELL-04, REL-05, REL-07, REL-09, UX-03, UX-04, UX-05, QA-01, QA-03, QA-04 and QA-09 stay open.
- E14 (visual), E15 (keyboard), E18–E25, E27 and the final acceptance belong to later batches.

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent-role native verifier, in its own isolated worktree. It wrote none of the contract, the implementation or any earlier Appearance evidence. |
| Worktree | `.claude/worktrees/agent-a8b6a755f50c7ff1e`, detached at docs base `ce9b68b1ffe1afdcb36f3198bb1c4efcfdc1b2b2` after `git fetch origin codex/web/full-product-audit-20260908`; clean before the work |
| Fixed revision | requested `24073b5` → resolved `24073b522262d8b4bec0abfa29347db28adbdd9e`, tree `95b4aaff59927eee82248a6133e357e9c70e04ec` (the `baseline` record: host L21, downstream L11, retryall L6) |
| Before revision | `5cd63ff652f02a2c726187fe12cbc796218d31c0` (E13 chrome invariance and 5cd63ff-written bytes; E12 row h and the row g coordinator-dialog reference) |
| Product-tree equality | `git diff --name-only 24073b5 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (precondition `baseline:docs-head-product-tree-equals-fixed`) |
| Fixed delta | `5cd63ff..24073b5` is exactly the 24 Terra files of contract r3 §11 (precondition `baseline:fixed-delta-is-exactly-the-24-terra-files`). The contract's 19-row source table: the 8 unit rows differ at the fixed SHA, the 11 protected rows are equal, and all 19 rows equal the table in the 5cd63ff archive (`baseline:contract-source-table-protected-rows-unchanged`, `baseline:before-archive-equals-the-contract-source-table`) |
| Authority | `../web-appearance-recovery-contract/contract.md` r3 (`706c9a3`, SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived in every run: `baseline:contract-r3-hash`), in particular A2 (A2.1–A2.9), A5, §5, §7, §9 rows a–s, §10 items 2–7 and §14 E12, E13 and E26; `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md` "本轮唯一任务" (batch 45) and the CP-APPEARANCE-01 rows, including batch 39 rulings 3 and 4 and the E4 crashing values |
| Browser | `Chrome/154.0.8037.97` (HeadlessChrome, `--headless=new`), DevTools protocol 1.3, over the **pipe** transport (`--remote-debugging-pipe`, flattened target sessions); isolated profile and download directory; viewport 1280×900 at DPR 1 unless a check sets another |
| Toolchain | Node `v24.16.0`; esbuild `0.28.1` from the gated tree; react 19.2.0, react-dom 19.2.0, react-router 7.15.1 |
| Lockfile gate | `sha256(pnpm-lock.yaml)` = `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` in six places: `XAI_DEPS_ROOT`, `git show 24073b5:pnpm-lock.yaml`, `git show 5cd63ff:pnpm-lock.yaml`, both extracted archives and the contract gate (`baseline:lockfile-gate`). A consistency check only. |
| Dependency root | The main checkout, read only. An mtime scan of 3,833 entries (top level; `node_modules` and `apps/web/node_modules` to depth 2; `apps` and `packages` to depth 3; `docs` to depth 2; `.git` and `.claude` excluded) against a reference stamped 05:05, before this worktree's checkout at 05:05:27, found **0** newer entries after all runs. No install, build, checkout or dev server ran there; no preview tool was used. |
| Network | Only the runner's own `127.0.0.1` server (ephemeral port) and local DevTools; every other host resolves to NOTFOUND. Zero page network attempts in every document |
| Diagnostic iterations | `host` 1 of 3, `downstream` 1 of 3, `retryall` 1 of 3 (all `fixed1`). Development probes are disclosed below. |

## Files and SHA-256

All files are new and in this directory. Each log's `baseline` record (`fileSha256`) records the runner, the fixture and the prelude; they equal the committed files. This receipt cannot carry its own hash.

| File | Lines / bytes | SHA-256 |
| --- | --- | --- |
| `verify-native-host-retryall.mjs` (runner, all three modes) | 3,308 lines | `8af7adf4d7be3281f6575bddedd3d6f76a85d0f8f0cfd9b367a92828cbcb4fad` |
| `native-host-retryall-app.tsx` (production App fixture; bundles against both archives) | 248 lines | `118f565783fc99e2642341e39ff9afa2df4a6cb937dc016ca41ab13ab1721c19` |
| `native-host-retryall-prelude.js` (instruments) | 1,028 lines | `ad4d711a5639b6685f05ea9cf5742f77d17e5924a127453dcd42f1a117757e7b` |
| `native-24073b5-fixed1-host.log` (E12) | 2,089 lines | `57ba2c11dc53391831f64d666a7211dbcee79ed95be828b388ccff6eeb1a0d06` |
| `native-24073b5-fixed1-downstream.log` (E13) | 1,900 lines | `8da81f7e0101bae29e9c98fc33916afe84f66bbc4573c4f785e0247cf1eaa472` |
| `native-24073b5-fixed1-retryall.log` (E26) | 549 lines | `dc7f27e859d99408e1607f8628cd5e83e64acd6e6b6132633f7577c09ef75d42` |
| `native-24073b5-fixed1-host-p-partial-retry-all-appearance-draft.json` (row p export, actual Chrome download) | 106 B | `1a17fe15377fbb2b8327b0bb3d0ed70f03ae09b399dd75f52c3e6cb6f11037c4` |
| `native-24073b5-fixed1-retryall-en-full-success-focus-on-disabled-retry-all.png` | | `289f3f37e347d0e1c8d058502d91938a314f94fb132ccb290c5d75b4a937ef4a` |
| `native-24073b5-fixed1-retryall-zh-full-success-focus-on-disabled-retry-all.png` | | `c2da16c0fa685ad059552b78ce85fe3e21056b51ea159bea7f7d3a61f15bdbd4` |
| `native-24073b5-fixed1-retryall-en-partial-result.png` | | `967c58bd02200bdc8e097b44bdc4c9d5ddfe0f58991d2cb29c517f7e4db8489d` |
| `native-24073b5-fixed1-retryall-zh-partial-result.png` | | `bffe5af297451a55982a00f3da51ecfe263541a483bc2c358c58f8347c9d35fe` |
| `native-24073b5-fixed1-downstream-crash-lang-fr-en.png` | | `4550baa6c5a5695b1d29fce581d6db95ffd45cc69391a2d7c671ceb6f31a605d` |
| `native-24073b5-fixed1-downstream-crash-lang-null-en.png` | | `a6af0b98dd1a0cdb0da4b20246252818074e2f8db8bd8441611a3b66c854c2a9` |
| `native-24073b5-fixed1-downstream-crash-lang-1-en.png` | | `4550baa6c5a5695b1d29fce581d6db95ffd45cc69391a2d7c671ceb6f31a605d` |
| `native-24073b5-fixed1-downstream-crash-lang-EN-en.png` | | `4550baa6c5a5695b1d29fce581d6db95ffd45cc69391a2d7c671ceb6f31a605d` |
| `native-24073b5-fixed1-downstream-crash-fontScale-0-en.png` | | `feed3964d8559d1e34eec937491f0684003c892f02a3fb1b5dac9f648b456b97` |
| `native-24073b5-fixed1-downstream-crash-fontScale--1-en.png` | | `feed3964d8559d1e34eec937491f0684003c892f02a3fb1b5dac9f648b456b97` |
| `native-24073b5-fixed1-downstream-crash-fontScale-null-en.png` | | `feed3964d8559d1e34eec937491f0684003c892f02a3fb1b5dac9f648b456b97` |
| `native-24073b5-fixed1-downstream-crash-fontScale-big-en.png` | | `feed3964d8559d1e34eec937491f0684003c892f02a3fb1b5dac9f648b456b97` |
| `native-24073b5-fixed1-downstream-crash-fontScale-1-en.png` | | `4a3c738ef7af36e20e6b1348eb4823846e8f19d634468284db9894e6502c8932` |
| `native-24073b5-fixed1-downstream-crash-accentHue-Infinity-en.png` | | `08b645249eecc4d4077d5704c3187725cf709439f66321aed9b4fabc2e7ac351` |
| `native-24073b5-fixed1-downstream-crash-fontScale-0-zh.png` | | `43dd1d780ae385716777223076463367743c01d3401c3738cab5774300c166dd` |
| `native-24073b5-fixed1-downstream-crash-fontScale--1-zh.png` | | `cb3b27ff721bb4c3b8f6cbdfad9fe0bc50d804f80d3161c37b9588b217309d05` |
| `native-24073b5-fixed1-downstream-crash-fontScale-null-zh.png` | | `cb3b27ff721bb4c3b8f6cbdfad9fe0bc50d804f80d3161c37b9588b217309d05` |
| `native-24073b5-fixed1-downstream-crash-fontScale-big-zh.png` | | `8aa294ee7058c2bed358e7c708500af6f3a4bb8afdec21e7e8f0d765fe7ce5cc` |
| `native-24073b5-fixed1-downstream-crash-fontScale-1-zh.png` | | `cb3b27ff721bb4c3b8f6cbdfad9fe0bc50d804f80d3161c37b9588b217309d05` |
| `native-24073b5-fixed1-downstream-crash-accentHue-Infinity-zh.png` | | `d9c22ee3d80d595d07cad7e347efd4e69099d777ce443a190bd819c458232b49` |
| `native-24073b5-fixed1-downstream-crash-cross-document-accent-infinity-en.png` | | `f7fce58489336a46d031c05af901e3d23f7cb15d14a15c3d5315845f87fe884e` |

Equal hashes are expected: different malformed values of one key render the same default UI, so several captures are pixel-identical. The `fontScale-1` naming: `"1"` (quoted) is the malformed string value; `fontScale--1` is `-1`.

All 21 screenshots were reviewed manually. Every crash capture shows the App rendering `/app/calendar` with the field's default applied (for example accent 165 for `Infinity`), with no "Route Error (app)". The cross-document capture shows the pane's Reload-only source alert for Accent color with 165 applied. The E26 captures show "Appearance settings saved." / "外观设置已保存。" with Retry all in its neutral disabled look and a visible focus ring, and the partial results with the count line, the enabled Retry all, Export, Discard all and the Topbar "Not saved"/"未保存".

## Commands

From the root of this worktree, sequentially, one Chrome per run:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<session scratch directory> \
  node docs/reviews/web-appearance-recovery-native/verify-native-host-retryall.mjs 24073b5 host fixed1
# likewise: … 24073b5 retryall fixed1   and   … 24073b5 downstream fixed1
```

Console lines:
- `PASS docs/reviews/web-appearance-recovery-native/native-24073b5-fixed1-host.log checks=1956 product=576 exit=0`
- `PASS docs/reviews/web-appearance-recovery-native/native-24073b5-fixed1-retryall.log checks=521 product=91 exit=0`
- `PASS docs/reviews/web-appearance-recovery-native/native-24073b5-fixed1-downstream.log checks=1768 product=400 exit=0`

Exit 0 = harness valid and every check PASS; 2 = harness valid and a product check failed (the run stops at the first); 1 = a precondition failed (harness invalid). Rerunning an existing suffix stops with `Evidence exists; use a distinct suffix` (exit 1) before anything is archived; verified for all three modes after the committed runs. Logs are written with `wx`. The temporary archives, profile, download directory and bundles were deleted after each run. `XAI_NATIVE_ROWS` (a row filter for development probes) is refused unless evidence is redirected outside the repository; every committed log records `rowFilter: null`.

## Development probes (disclosed)

Following batch 39 ruling 1, probes before the evidence runs are harness development and do not count as diagnostic iterations. All wrote outside the repository (`XAI_NATIVE_EVIDENCE_DIR` = the session scratch directory; the runner refuses that variable inside the repository) and none is committed. In order:

| Probe | Result | Harness-only correction that followed |
| --- | --- | --- |
| host `smoke1` | precondition: the coordinator variant's redirect list included consumers outside `apps/web/src/` | The precondition now requires the importers to be the fixture or archive modules and records them (7, listed under Provenance) |
| host `smoke2` | PASS (stub mode: mount, popover, Tab walk in all four variants) | — |
| host `dev1` | harness error: a `const` helper used before initialization (temporal dead zone) | The run block was moved after all definitions |
| host `dev2` | stopped at row e: the AppRail button was clicked while the rail was still animating to its new side | `trustedClick` waits until the control's box is stable across two measurements before clicking |
| host `dev3` | stopped at row k: my zero-write window included the setup's own denied theme write | The window starts after the setup (the assertion is unchanged: zero writes during the scope change) |
| host `dev4` | stopped at row l: "zero writes" counted mount-time writes of other modules (see Observations) | Scoped to the seven keys, as batch 43 E9 does; other mount mutations are recorded |
| host `dev5` | precondition at row n, reverse order: the open Topbar popover covered the pane's theme card | The popover is closed (Escape) before the pane edit, as a user would |
| host `dev6` (rows n–s) | stopped at row q: my expected display omitted the accent value the pass had already committed | Expected display corrected (accent 230) |
| host `dev7` (rows q–s), `dev8` (all rows) | PASS, PASS (1,956 checks, the counts of the committed run) | — |
| retryall `dev1` | stopped at the setup check: my expected bytes omitted the sidebar bytes kept by the refused removal | Expected bytes corrected (`xai_rail_pos` = `right`) |
| retryall `dev2`, `dev3` | PASS, PASS (521 checks each); `dev3` ran concurrently with downstream `dev4` as a robustness probe | — |
| downstream `dev1` | stopped at cross-document `bgTone=peach`: my step order made peach's paired accent equal to the accent already committed, so no second storage event could fire | The preceding accent step uses 75 |
| downstream `dev2` (cross-document, chrome, isolation) | precondition in the isolation "reload" step: a valid external write does not clear a source-only alert by itself | The step clicks Reload after the valid external write (see Observations) |
| downstream `dev3` (isolation), `dev4` (all) | PASS, PASS (1,768 checks) | — |

No assertion was weakened: each correction either fixed an oracle value that contradicted the contract (rows q and the E26 setup), changed the scenario so that it exercises what it names (row n, cross-document), or fixed instrumentation. The two scope clarifications (rows k and l) are stated in the row table and in Observations. The committed runner, fixture and prelude hashes equal those of the last probes of each mode, except that host `dev8` ran a runner revision whose row code is identical to the committed one (later edits touched only the E26 and E13 functions, the isolation segment and a marker comment).

## Harness

**Composition.** Every row and requirement runs in the production `App` composition (contract §9): the `apps/web/src/main.tsx` module order, the production router instance of `routes/router.tsx` under `RouterProvider` from `react-router/dom`, `ProtectedAppRouteElement` → `App` → `AccountStorageGate` → `AccountDataGate` → `CommandPaletteProvider` → `AppInner` with the one App-scoped Appearance controller → `AppearanceProvider` → `WebShellProvider` + `Shell` (AppRail with AvatarMenu and SignOutConfirmDialog, Topbar with its `appearanceStatus` slot), `DesktopPet` and `CommandPalette`, and `/app/settings/*` → ComposedSettings with the `DepartureCoordinator` and the `settingsDeparture` delegate that `App.handleSignOut` awaits. The fixture imports only modules whose public shape exists in both archives, so the same file bundles against `24073b5` and `5cd63ff`.

**The only synthetic input is the auth session.** The production `WebAuthSessionProvider` receives a client whose `auth.getSession` resolves one session for account `appearance-native-A` (the legacy provider branch, so `App.handleSignOut` takes its fallback branch), with the production `invalidateAccountIdentity` as `onIdentityChange`. The real `AccountDataGate` activates generation `g1` at every mount (`…:account-data-gate-activated-account`).
- **Coordinator branch (row h only).** Variants `fixed-coord` and `before-coord` differ in one point: importers of `@repo/web-auth-device-session/web` (App, AccountStorageGate, the route gates, AppProviders, the auth page, settings-rest's account-deletion hook and the fixture) read the real context value plus a synthetic generation `coordinator` (`capture()` returns the active generation; `signOut(captured)` records the call and returns `applied`). This is one virtual module (`native-auth:auth-session-context-with-synthetic-coordinator`, SHA-256 `5b35a96db4c1e5fe412a3fbf9997fa5119531748ffdbe3a273e8a3ebaa58be95`), the native counterpart of the parent host baseline's `vi.mock` of `useWebAuthSession` (E3). The real `session.tsx` and `web.ts` are bundled from the archive; the provider and every other module are unchanged.
- `App.handleSignOut`'s final `window.location.assign("/")` is observed through the CDP Fetch domain and answered with HTTP 204, so the document and its instruments survive (pattern of the frozen F1 runners).

**Instruments** (`native-host-retryall-prelude.js`, a classic script served before the bundle and alone on a product-free seed page, where its self-test passes: host L29, downstream L20, retryall L13):
- attempt-level Storage tracing, logged before any fault decision and before exactly one delegation; faults: total denial, per-key get/set/remove denial, one-shot readback denial; an F-B002 depth counter (no nested Storage call);
- an `EventTarget.prototype.dispatchEvent` spy for every script-dispatched `StorageEvent` and every `web:*` bus event, and a first-registered `storage` listener;
- Web Lock tracing (application vs fixture) and fixture exclusive requests by id, so that a fixture "middle" request can queue behind the engine's own request (FIFO proven in the self-test);
- `History.prototype.pushState`/`replaceState` wrappers (log, then delegate) and a `popstate` trace; the fixture adds a router-level `navigate` trace installed before `RouterProvider` renders (so the coordinator's own wrapper delegates to it), a `router.subscribe` trace of location commits, and `proceed()`/`reset()` wrappers on every blocked blocker that record the blocker's id and the router's live blocker immediately before delegating;
- `beforeunload` listener tracking on `window` and a synthetic cancelable `beforeunload` that counts handler Storage attempts;
- a key trace (window, capture phase) of every `keydown`, `keypress` and `keyup` with `isTrusted`;
- a `console.error` trace and an error-UI trace (the production `RouteErrorBoundary` heading or React Router's default element appearing anywhere, sequence-stamped);
- export tracing, a `window.confirm` recorder, refusal of every non-local request, and read-only views of `<html>`, the Topbar and its status, the pane (recovery blocks, status line, Retry all attributes, actions), focus, scroll and the old footer UI;
- a `requestAnimationFrame` sampler, one probe per rendered frame: status line, recovery blocks, Retry all `aria-disabled`/`aria-describedby`/`disabled`, Topbar status, focus, the seven raw keys, the Topbar summary and `aria-checked`, `<html>`, the old footer UI and the route error.

**History counters and gates.** Every document segment ends with a `row-gate` record: `push`, `replace` and `popstate` counted from the wrappers, `commits` counted as router location-key changes, plus a runtime-error gate (CDP exceptions and console errors of every page since the segment began, the page's `console.error` trace and the error-UI trace, all zero, and no route error at the end). Where the contract fixes the counters, they are a product check (`…:history-counters`). 5cd63ff reference segments are recorded, never judged; runtime errors are tagged with their document's variant and the run-level check `run:runtime-errors-zero` judges fixed-product documents (0 errors overall, 0 in references).

**Input and the key audit.** Every activation is a trusted CDP mouse event after a centre hit-test on a box that is stable across two measurements. Keys are CDP key events **without `nativeVirtualKeyCode`** (K-1, `../web-native-keyinput-k1/review-k1.md`); Enter and Space carry `text` so that they produce `keypress`. Every document's key trace must equal the runner's own presses exactly, in order and trusted (`keydown`, `keypress` for Enter/Space, `keyup`), checked at every document change and at the end (run-level precondition `run:keyboard-trace-contains-only-the-runner-key-presses`). Browser Back/Forward go through `Page.navigateToHistoryEntry`; programmatic intents call the production router; real `window.confirm` dialogs are answered by plan through `Page.handleJavaScriptDialog`, and every planned answer was consumed (`run:every-planned-dialog-consumed`).

## E12 — contract §9 host matrix, rows a–s: PASS

Counts (host log): 1,956 checks = 1,380 preconditions + 576 product checks; 75 judged segments (all gates PASS) and 5 recorded 5cd63ff references (the row g coordinator-dialog reference segment and the four row h 5cd63ff sign-outs; L2089 `rowGates: 80`). Counters are push / replace / popstate / commits.

| Row | What ran (all drafts are real failed, held or settled operations) | Verdict | History counters | Log lines |
| --- | --- | --- | --- | --- |
| a | All 7 Topbar values (中文, English; Dark, System, Light; Compact, Comfortable) on `/app/calendar` and on the pane: exact bytes (page and DevTools), one write each, no Topbar status, `aria-checked`, the summary, `<html>` and the UI language show the value; on the pane the pane shows the same value with "Appearance settings saved."/"外观设置已保存。", and pane, Topbar and `<html>` agree in every sampled frame. | PASS | 0/0/0/0 and 0/0/0/0 | L47–L102, L120–L189 |
| b | Three Topbar failures: theme (EN, `/app/calendar`), language → 中文 (the UI switches to ZH), density with a ZH UI (`/app/tasks`). The choice stays displayed and applied with unchanged bytes; the status (normative name and text) appears and the unload warning is on; `aria-checked` shows the choice; at 375, 414, 768, 1024 and 1440 the status is present, inside the viewport, centre-hit and 44 px high (44×44 at 375/414), and its text is visible exactly where the Topbar summary is (hidden at 375/414, shown from 768; L217, L257). Review navigates exactly once to the pane (one PUSH commit, one `pushState`, one `router.navigate`, one `web:shell:module-change`), which shows the field message with Retry and Discard; a successful Retry writes once, removes the status and the warning. | PASS | 1/0/0/1 each | L208–L229, L248–L269, L288–L306 |
| c | Topbar Dark held behind the real `xai:pref:v1:xai_pref_theme` lock: no status, all 7 options enabled, the choice displayed and applied, zero writes, the engine pending on the lock (one application request), unload warns; after release exactly one write, no status, no warning. | PASS | 0/0/0/0 | L324–L332 |
| d | Failed pane accent; trusted sidebar "About": not held, no dialog, status shown, draft applied, zero writes; sidebar "Appearance": the draft is intact. | PASS | 2/0/0/2 | L350–L358 |
| e | Failed pane sidebar position; trusted AppRail "Calendar": not held, status shown, draft applied to `<html>` and `.app`; Review back: intact. Programmatic `router.navigate("/app/tasks")`: not held, status shown; programmatic return: intact. | PASS | 4/0/0/4 | L376–L387 |
| f | P = `/app/settings/about` with state `{token:"host-P"}`, S = the pane. Control Back/Forward without drafts, then a failed density draft and browser Back/Forward: not held, no dialog, `{pathname,key,state}` deep-equal to P and S and to the control traversal, stack intact (CDP entry ids), one popstate and one commit each, status shown on P; the draft intact after Forward. | PASS | 2/0/4/6 (P, S, 4 traversals) | L409–L415 |
| g | Sign-out with drafts from `/app/tasks` (EN), the pane (ZH) and the More pane with a More draft. Cancel: one `window.confirm` with the normative EN/ZH text, resolves `false` (no scope transition, no `client.auth.signOut`, no redirect request, no dialog, 0/0/0/0), drafts, status and warning kept, zero writes. OK: one confirm, zero set/remove by the step (window from the confirm's return to the first scope transition), zero writes on the seven keys, bytes unchanged; then identity invalidated (`locked:null`), one `client.auth.signOut`, one redirect request to `/` (L461, L505). More: OK discards the Appearance drafts (status gone, theme back to light, one `beforeunload` listener fewer: 2 → 1), then the coordinator dialog appears exactly as at 5cd63ff (label, text and buttons equal to the 5cd63ff reference run, L536), and Stay resolves `false` (identity intact, no redirect, 0/0/0/0). | PASS | tasks 0/1/0/1, pane-zh 0/1/0/1 (the auth flow's client-side replace to `/auth/login` after OK); More 0/0/0/0 | L443–L463, L487–L507, L571–L603; reference L536–L539 |
| h | Sign-out without drafts from `/app/tasks` and from the pane, in the legacy branch (`fixed`, `before`) and the coordinator branch (`fixed-coord`, `before-coord`): zero confirm calls on the fixed product, and the outcome vector (confirms, scope transitions, client and coordinator sign-outs with the captured generation, redirect requests, history counters, final router path, seven-key and other mutations, gate text, runtime errors, unload listeners) is deep-equal to 5cd63ff in all four route × branch pairs. Legacy: three `locked:null` transitions, one `client.auth.signOut`, `/` requested, replace to `/auth/login`. Coordinator: two transitions, one `coordinator.signOut({generation, owner})`, `/` requested, gate "Waiting for your account…". | PASS | legacy 0/1/0/1, coordinator 0/0/0/0 (fixed = 5cd63ff) | L623–L783 (outcomes L623, L646, L668, L691, L713, L736, L758, L781) |
| i | Synthetic `beforeunload`: clean and source-only (`xai_rail_pos` = `diagonal`) do not warn and have no listener; a pending (held) and a failed draft warn with one listener and zero handler Storage attempts; success and Discard all remove it. A real browser `beforeunload` prompt appeared once on a runner navigation away from a document with a draft (observation, L849). | PASS | 0/0/0/0 ×3 | L794–L846 |
| j | An idle second App document (on the pane) follows the main document's Topbar Dark, 中文 and Compact live: `<html>`, Topbar summary, pane and UI language, zero writes, trusted keyed storage events. A failed sidebar draft in the second document (top) is preserved when the main document commits `right`; its Retry makes zero writes and leaves `right` (conflict, still "侧栏位置未保存。"); Discard shows `right` with zero writes. | PASS | doc2 0/0/0/0, doc1 1/0/0/1 | L876–L915 |
| k | Failed theme draft, committed accent 230. A product-free second document writes `xai:auth:identity-change` `{accountId:null}`, then `{accountId:"appearance-native-A"}` (the identity channel, `AccountStorageGate.tsx:8, 39`; two steps because the synthetic session always resolves the same account). The gate appears, the App remounts (new `.app` node, epoch increased), the committed values are displayed (theme light, accent 230), no Saved claim, no draft, no status, no listener, zero writes on the seven keys during the change. | PASS | 0/0/0/0 | L937–L942 |
| l | All 33 §5 item 2 values plus a throwing `getItem` for each of the 7 keys (40 mounts on the pane): no route error, the default displayed and applied (pane, `<html>`, Topbar, UI language), the localized source alert with Reload only, zero writes on the seven keys with bytes never rewritten (page and DevTools), no status, no warning. | PASS | 0/0/0/0 ×40 | L947–L1630 |
| m | Failed Topbar theme + a More draft (Launch at Login) held by the Settings coordinator. Activating the status shows the coordinator dialog ("Unsaved More draft"), location unchanged, 0/0/0/0, zero `router.navigate` and zero blocker calls. A successful More Retry releases **exactly once** by one `router.navigate` replay (programmatic navigation, ruling 4; L1663), zero non-live blocker calls, no reset, one PUSH commit to `/app/settings/appearance`; the dialog closes, the More value is written once, the Appearance draft is shown. Zero runtime errors. | PASS | 1/0/0/1 | L1656–L1666 |
| n | Pane Dark then Topbar System, and Topbar Dark then pane System, the first held behind the real theme lock: the latest is displayed on both surfaces while held, the latest wins (bytes `"system"`), each edit made exactly one per-key lock request (2), and pane, Topbar and `<html>` agree in every sampled frame (91 and 100 frames). Writes: `"dark"` then `"system"` (L1692, L1721). | PASS | 0/0/0/0 ×2 | L1687–L1724 |
| o | A failed Reset item (sidebar removal refused), a failed Topbar theme choice and a failed pane accent edit; one trusted click on Retry all with the sidebar member held: pass open with the Topbar status hidden, Retry all disabled and described by the in-flight line, the warning kept, focus on Retry all. After release: exactly `remove xai_rail_pos`, `set xai_pref_theme "dark"`, `set xai_accent_hue 230`, zero elsewhere; exact bytes; Retry all rendered, `aria-disabled`, no description, focus kept on it (not `<body>`), no status, listener removed; the first "Appearance settings saved." frame already carries the final bytes and no frame breaks the Retry all invariants. | PASS | 0/0/0/0 | L1756–L1764 |
| p | As row o with accent still denied: one attempt per member, accent refused again; "1 appearance change is not saved.", the status back, the warning kept, focus on the enabled Retry all; no success line in any frame; Export (actual download) is exactly `{"version":1,"kind":"appearance-draft","changes":{"device":{"accentHue":{"operation":"set","value":230}}}}` with zero Storage attempts. | PASS | 0/0/0/0 | L1796–L1808 |
| q | Failed theme + accent; theme held, accent completes. Second activation by click, Enter and Space: zero attempts, focus kept, no scroll. Sidebar away and back: the pass, the `aria-disabled` button and the in-flight line are kept. Topbar System supersedes the held member; a fixture middle request queued behind it holds the next grant, so the state after the old completion is observable: bytes `"dark"` (the superseded write), the theme still "is saving.", no success line; after the middle releases, bytes `"system"` and "Appearance settings saved."; no frame claims success while only `"dark"` is committed (33 frames, L1859). | PASS | 2/0/0/2 | L1834–L1862 |
| r | Open pass with the theme member held. Cancel: one confirm, `false`, the pass continues and then settles (one theme write). OK: one confirm, zero set/remove by the step, identity invalidated, one sign-out, one redirect request; the held member's late completion changes no draft, status line or Topbar status (the App is gated) and causes no runtime error; the engine request only read the key and wrote nothing (L1946). | PASS | Cancel 0/0/0/0; OK 0/1/0/1 | L1898–L1948 |
| s | Clean, pending-only (pane theme held) and source-only (`diagonal`): Retry all rendered with `aria-disabled="true"`, no `disabled`, `title` or `aria-describedby`, Tab stop, `pointer-events` not `none`, empty status line. After a trusted Tab (font slider → Retry all), Enter and Space (no scroll) and a trusted click each made zero set/remove attempts on every key and kept focus. A failed Topbar theme choice enables it, described by the count line. Open pass whose only member is held with the write fault armed, focus on the button (Enter): disabled and described by the in-flight line; on release the member fails, the button is enabled, focus stays, the count line describes it; focus never on `<body>` in any frame. | PASS | 0/0/0/0 ×5 | L1959–L2079 |

**Run level (host):** `run:no-non-local-network-attempt` L2083, `run:keyboard-trace-contains-only-the-runner-key-presses` L2084, `run:no-unexpected-javascript-dialogs` L2085, `run:every-planned-dialog-consumed` L2086, `run:runtime-errors-zero` L2088.

## E13 — contract §10 items 2–7, production App: PASS

Counts (downstream log): 1,768 checks = 1,368 preconditions + 400 product checks; 79 judged segments (all gates PASS) and 8 recorded 5cd63ff reference segments (the two 5cd63ff write sets and the six 5cd63ff chrome captures; L1900 `rowGates: 87`).

| Requirement | What ran | Verdict | Log lines |
| --- | --- | --- | --- |
| Byte compatibility, fixed writes (§10 item 2) | 14 root values written by trusted input on the fixed product (language 2, theme 3, density 2, font scale 7 by keyboard), each with exact bytes and one write; in a new document the unchanged archive `readLocalPref` returns each value; `NotFoundPage` applies each written theme (`system` resolves to the host's dark preference); with the generation marker removed, `AccountStorageGate`'s gate shows "选择如何开始" for `"zh"` and "Choose how to start" for `"en"`. | PASS | L35–L313; records L43–L314 |
| Byte compatibility, 5cd63ff writes (§10 item 2) | Two value sets written by trusted input on the 5cd63ff product (Topbar, font slider by keyboard, accent swatch, sidebar card, background card): `en/dark/compact/1.05/230/right/mist` and `zh/system/comfortable/0.85/355/bottom/graphite`. In a new document the fixed product displays and applies them (pane, `<html>`, Topbar, UI language), makes zero writes, keeps the bytes identical, and its `readLocalPref` reads the same values. | PASS | L368–L442; records L371, L439 |
| Display truth (§10 item 3) | `system` committed: `<html data-theme>` follows emulated dark → light → dark. A `system` draft follows the listener; after Discard the committed light stays under every emulated scheme (the listener is gone). Seven failed drafts (language 中文 included) are displayed and applied on `<html>`, `.app`, Topbar summary and `aria-checked`, the pane, and the language of every checked string (UI language, rail labels, Topbar title, search label, pane title, row labels; L539); Discard all returns all of it to the committed bytes with zero writes. Reload of a source-only field shows the committed bytes. One controller: the first frame that shows a pane edit in the pane shows it in the Topbar and `<html>`, and vice versa for a Topbar edit. | PASS | L453–L594 |
| Crash safety at load (§10 item 4) | All 33 §5 item 2 values at load on `/app/calendar`: App renders without the route error boundary, defaults applied (`<html>`, Topbar, UI language), no status, zero writes, bytes unchanged. The ten E4 crashing values (`"fr"`, `null`, `1`, `"EN"` for language; `0`, `-1`, `null`, `"big"`, `"1"` for font scale; `Infinity` for accent) additionally: AppRail to `/app/tasks` and programmatic `/app/settings/appearance` keep working (source alert, defaults), with an EN screenshot each; the six non-language ones again with a ZH UI and a ZH screenshot. | PASS | L598–L1073; ZH L1077–L1157; record L1312 |
| Crash safety, running App (§10 item 4) | A product-free second document writes into a running App (pane): language `"fr"` and `"EN"`, theme `"neon"`, density `{}`, font scale `"big"` and `0`, accent `Infinity`, sidebar `diagonal`, background `sage`. Each time: the trusted keyed storage event arrives, the idle field goes to its Reload-only source state with the default applied, no throw, no route error, zero writes, the external bytes untouched. | PASS | L1171–L1311 |
| Cross-document propagation (§10 item 5) | An idle second App document follows live commits of all seven fields by the main document (language 中文, theme Dark, density Compact (Topbar), font scale 1.05 (keyboard), accent 75, sidebar top, background peach with its paired accent 35): pane, `<html>`, Topbar, UI language; zero writes; a trusted storage event per changed key (L1372). A failed font-scale draft (1.0) in the second document is preserved when the main document commits 1.15; its Retry makes zero writes and keeps `1.15`; Discard shows 1.15 with zero writes. | PASS | L1336–L1399 |
| Clean-state chrome invariance against 5cd63ff (§10 item 6) | Same seeded bytes in both products (absent-EN; stored EN dark/compact/1.1/230/right/mist; stored ZH system/compact/0.9/295/bottom/lavender) on `/app/calendar` and `/app/settings/about`: `<html>` attributes (inline style as a property → value map) after load and after the popover round trips, `.app` attributes, and the Topbar `outerHTML` at 1440×900 and 375×812 with the popover closed and open. 42 comparisons, all identical (record L1694). | PASS | L1440–L1693 |
| Cross-module isolation (§10 item 7) | 12 Appearance operations with every instrument armed: edit, Retry, Retry all (full), Retry all (partial), Discard, Discard all, Reload, full Reset, partial Reset + Retry, Export, sign-out step Cancel, sign-out step OK. In each: zero script-dispatched `StorageEvent`s and zero `web:settings:preference-changed` events (dispatch spy), no `key:null` event delivered, every other localStorage key byte-identical (8 Features keys, pet id and position, rail order, sticky colour, a probe key; for OK the auth flow's own `xai:auth:identity-change` write is excluded and recorded), the Features rail and the DesktopPet position unchanged (until OK unmounts them). Features rail, route (`/app/habits` shows `DisabledFeatureFallback`) and search truth (CmdK lists the enabled modules, not Habits or Matrix) are identical before and after. Totals: 12 operations, 0 / 0 / 0 (L1890). | PASS | L1715–L1891 |

**Run level (downstream):** L1894–L1899, all PASS.

## E26 — native Retry all, EN and ZH: PASS

Counts (retryall log): 521 checks = 430 preconditions + 91 product checks; 12 judged segments, all 0/0/0/0 with zero runtime errors (L549).

**Setup of the six failures** (`sixFailures`, EN L52/ZH L315): a failed Reset item (sidebar removal refused), a Topbar set draft (theme Dark), a pane set draft (density Compact), a background choice with both writes denied (Lavender: background palette and accent 295), and a failed predecessor with a queued latest (font scale 1.05 held behind the real lock, 1.1 queued, 1.05 refused on release while 1.1 stays queued). Result: six recovery blocks, "6 appearance changes are not saved." / "6 项外观更改未保存。", Retry all enabled and described, the Topbar status, bytes unchanged.

| Requirement | Evidence (EN / ZH) | Verdict | Log lines (EN / ZH) |
| --- | --- | --- | --- |
| Failures: pane and Topbar set drafts, background with both writes denied, failed Reset items, a failed predecessor with a queued latest | The six-failure setup above; failed Reset items alone in the reset-items scenario (theme and background removals refused). | PASS | L52–L53, L265 / L315–L316, L528 |
| Attempts: one write or remove per member, zero on non-members; exact bytes | Full pass: `set "dark"`, `set "compact"`, `set 295`, `set lavender`, `remove xai_rail_pos`, and for font scale the predecessor once then the queued latest's own attempt (`set 1.05`, `set 1.1`); zero on language and on every other key; bytes `"dark"`, `"compact"`, 295, lavender, absent, 1.1 (page and DevTools; L68/L331). Partial: the same with density refused once. Reset items: exactly two removals, never a write. | PASS | L63–L64, L116–L117, L270–L271 / L326–L327, L379–L380, L533–L534 |
| Status line sampled per frame: never a success line while a member is pending or failed | Frame invariants in every scenario (98, 98, 156–164 frames per full or supersession pass): a success line only with zero recovery blocks, no Topbar status and a disabled Retry all; Retry all enabled exactly when the Topbar status renders; described exactly while enabled or a pass is open, by the status line; never `disabled`; never the old footer; the first success frame already carries the final bytes; no success line at all in the partial runs. | PASS | L66, L119, L161, L204, L245, L273 / L329, L382, L424, L467, L508, L536 |
| Full success | Keyboard (EN Enter, ZH Space; theme member held so the open pass is observable): Retry all still rendered, `aria-disabled`, no description, focus kept on it (never `<body>`), no Topbar status, `beforeunload` removed; "Appearance settings saved." / "外观设置已保存。"; reset items: "Defaults restored." / "已恢复默认设置。". | PASS | L58, L65, L272 / L321, L328, L535 |
| Partial result | Pointer: "1 appearance change is not saved." / "1 项外观更改未保存。", focus kept on the enabled Retry all, the Topbar status shown, the warning kept. | PASS | L118 / L381 |
| Held and late: second activation inert | Theme member held behind the real lock: Space+click (EN) / Enter+click (ZH) after the keyboard activation, and Enter+Space after a pointer activation, add zero attempts and no lock request; the pass stays open. | PASS | L62, L150 / L325, L413 |
| Held and late: supersession by a Topbar choice | Topbar System supersedes the held member; the superseded `"dark"` completes first (fixture middle request), the theme still "is saving.", no success line; then `"system"` and the saved line; final bytes = the Topbar choice; no frame claims success on the superseded bytes (34 / 33 frames; L162 / L425). | PASS | L158–L161 / L421–L424 |
| Held and late: Discard during an open pass | Per-field Discard of the held theme member: zero writes, the committed light shown, the pass continues for density; the late completion (only a read, L205 / L468) changes no draft, status line or Topbar status; density then completes and the pass settles. | PASS | L201–L204 / L464–L467 |
| Held and late: Discard all during an open pass | Discard all: every member detached, zero writes, focus to Reset to defaults, status line empty, no Topbar status, no warning; the late completions (zero attempts, L246 / L509) revive nothing and claim nothing. | PASS | L243–L245 / L506–L508 |
| No old button | No control named "Save & apply"/"保存生效"/"Saved"/"已保存", no `.pane-footer`/`.pane-save`/`.is-saved` and no text node equal to those names anywhere in the document, before and after each pass and in every frame. | PASS | L53, L67, L112, L120 / L316, L330, L375, L383 |

**Run level (retryall):** L543–L548, all PASS.

## Key audit

| Mode | Audit checkpoints | Runner presses | Key events received | Expected | Mismatches | Log line |
| --- | --- | --- | --- | --- | --- | --- |
| host | 318 | 40 | 89 | 89 | 0 | L2084 |
| downstream | 342 | 69 | 138 | 138 | 0 | L1895 |
| retryall | 47 | 52 | 116 | 116 | 0 | L544 |

Every document received exactly the runner's own presses, in order and trusted: `keydown` + `keyup` for Tab, Escape, ArrowRight, ArrowLeft, Home and End, plus `keypress` for Enter and Space. No key event carried `nativeVirtualKeyCode`. Second documents and the seed page received no key events.

## Runtime errors and console warnings

- Runtime errors: **0** in all three logs (CDP exceptions, `console.error`/`assert`, renderer crashes), including **0** in the 5cd63ff reference documents (observation `run:5cd63ff-reference-runtime-errors`: host L2087, downstream L1898, retryall L547). Every segment's page-side `console.error` trace and error-UI trace were empty.
- Console warnings: **0** in all three logs (`consoleWarnings: 0`, `consoleWarningsBySource: {}`).
- JavaScript dialogs: every dialog was planned (Reset confirmations, sign-out confirmations) or a runner-initiated `beforeunload` on navigating away from a document with drafts; all accepted as planned.

## Provenance

| Item | `fixed` | `fixed-coord` | `before` (5cd63ff) | `before-coord` |
| --- | --- | --- | --- | --- |
| Bundle inputs | 1,017 = 625 archive-relative + 390 third-party + define + fixture; **0 foreign** | 1,018 (+1 virtual auth-context module) | 1,013 = 621 + 390 + 2; **0 foreign** | 1,014 (+1 virtual) |
| `@repo/*` pinned to the archive | 320, **0 guard violations** | 313 (7 `./web` importers redirected) | 320, **0 violations** | 313 |
| Required modules from the archive | 53 of 53; every bundled module outside the 24-file delta byte-identical to 5cd63ff (0 drift) | 53 of 53 | 50 of 50 | 50 of 50 |
| Bundle SHA-256 (js / css) | `4474593b1396…` / `560080dbad3a…` (identical in all three modes) | `1b43c0732320…` / `560080dbad3a…` | `e1ca2db9b0d9…` / `b4ca75d8a975…` | `2b1badade6d3…` / `b4ca75d8a975…` |
| Log lines | host L1–L5, downstream L1–L5, retryall L1–L5 | host L6–L10 | host L11–L15, downstream L6–L10 | host L16–L20 |

Full hashes: `fixed` js `4474593b139670c98ac5587a9e4b7e7ebf9e326da971650c4d16c74148dc0dc7`, css `560080dbad3a288c3f88d0497ff83ee5a5945db66c784a9658bda4cd6fb84021`; `before` js `e1ca2db9b0d98c626209e74c45840d5f0eaf4f492bd3a2bcb41a1d7a043354ec`, css `b4ca75d8a975eee883a777cd4f32af199cd4a8175669544a545d64f84dd2bc47`; `fixed-coord` js `1b43c07323202840c38b4650ddd1a5ea906b37314c3c051d6488c05a9284b83a`; `before-coord` js `2b1badade6d3f6555078e8b594894635f08a9c97b36c769f0002bbd30049dbaf`. The redirected importers of the coordinator variants: `apps/web/src/App.tsx`, `apps/web/src/pages/AuthPage.tsx`, `apps/web/src/providers/AccountStorageGate.tsx`, `apps/web/src/providers/AppProviders.tsx`, `apps/web/src/routes/RouteGateElements.tsx`, `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts` and the fixture. The bundle counts match batch 43 (fixed 1,017 / 625) and batch 39 (5cd63ff 1,013 / 621).

## Observations (recorded, not verdicts)

1. **Mount-time writes outside the seven keys.** Every App mount makes two non-Appearance mutations: a `lswt-<random>` set/remove (the localStorage availability probe of `@supabase/auth-js`, `lib/helpers.js:48`) and a `xai:auth:identity-change` write (the auth provider announcing the identity through `invalidateAccountIdentity`, `AccountStorageGate.tsx:25`). Both modules are byte-identical between 5cd63ff and 24073b5. Row l therefore judges zero writes on the seven keys, as batch 43 E9 did, and records the others (`otherMountMutations`).
2. **A source-only field is repaired by Reload, not by another document's valid write.** After a second document wrote valid bytes (`top`) over a malformed `xai_rail_pos`, the field kept its Reload-only alert and the default `left` (L557) until Reload, which then showed `top` with zero writes. This is consistent with A6, §5 item 2 and §10 item 3 ("after Discard or Reload the committed bytes"); it means such a repair does not propagate live by itself. Recorded for acceptance.
3. **Late completions after detachment wrote nothing.** After a per-field Discard (E26) and after sign-out OK (row r), the held engine request read its key and made no write; after Discard all it made no attempt at all. The contract allows either a write or none ("If the engine write had already started and commits…").
4. **The inherited superseded write** (row q, E26 supersession): the superseded `"dark"` commits before the newer `"system"`, and no success claim is made in between, as §6 and A2.3 describe.
5. **This host reports `prefers-color-scheme: dark`** in headless Chrome, so `system` resolves to dark unless emulated (E13 display truth emulates both schemes).
6. **The More pane registers its own `beforeunload` listener**: 2 listeners with Appearance and More drafts, 1 after the Appearance OK step (row g).
7. **The AvatarMenu stays open after the sign-out confirmation** (pre-existing; batch 39 ruling 5); the runner closes it by its scrim.
8. **Layout animates after a sidebar-position change**; clicks wait for a stable box (row e during development).
9. **Topbar status text visibility** follows the Topbar summary: hidden at 375 and 414, visible from 768 (consistent with the batch 40 controller ruling on the 768 px breakpoint; E14 owns 761–767 px).

## Limitations

- Retained contract §15 exclusions: headless Chrome with an isolated profile; synthetic auth session and a synthetic account; not Tauri; development build without StrictMode; dependency tree reused from the main checkout (the lockfile gate is a consistency check only).
- `beforeunload` is judged with a synthetic cancelable event and listener tracking; a real browser prompt was observed once (row i) but is not a check.
- Row h's coordinator branch uses a synthetic generation coordinator in the auth-session context; the real coordinator's persistence (generation store, remote sign-out) is not exercised. The legacy branch runs the real provider.
- `window.location.assign("/")` is answered with HTTP 204, so the full-page redirect after sign-out and what the next document would show were not observed (the router's own replace to `/auth/login` was).
- Row k uses two identity announcements (`null`, then the same account) because the synthetic session always resolves one account; a switch to a different account was not exercised.
- Second documents are tabs of the same profile; no cross-document lock contention was exercised. Frame sampling covers the foreground document only; second-document states were read by evaluation.
- Lock holds and releases, programmatic navigations and the identity-channel writes are script-driven by design; every user-facing activation is trusted input.
- E14 (visual and placement, including the A2.8 gate and the disabled presentation), E15 (keyboard), E18–E25, E27 and the final acceptance are later batches.
