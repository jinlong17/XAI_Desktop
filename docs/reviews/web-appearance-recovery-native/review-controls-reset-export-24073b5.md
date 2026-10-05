# Appearance native controls, reset and on-disk export (CP-APPEARANCE-01, batch 43, contract r3 §14 E9, E10, E11)

**Verdict: PASS for all three modes**: `controls` (E9), `reset` (E10) and `export` (E11). Each passed on its first committed diagnostic iteration (`fixed1`), and no product failure was observed. Every log ends with:
- `pass: true`;
- 0 runtime exceptions and 0 console errors (product check `run:runtime-errors-zero`);
- 0 console warnings;
- 0 unexpected JavaScript dialogs;
- 0 non-local network attempts;
- a keyboard trace that contains only the runner's own key presses.

**Status.** This is verification only:
- It is not acceptance, and it authorizes nothing.
- It changes no product source, product test, contract, ledger, control plane or existing evidence. The before-stage files in this directory were read only: `verify-native-before.mjs`, `native-app.tsx`, `native-prelude.js`, the `before1` logs and screenshots, and `before-5cd63ff.md`.
- It closes no 312 item.
- Later items stay open: E12 (host matrix a–s), E13 (downstream), E14 (visual), E15 (keyboard), E26 (native Retry all), E18–E25, E27 and final acceptance.

## Identity

| Item | Value |
| --- | --- |
| Executor | An independent Claude Opus 5.5 instance in the parent native-verifier role, in its own isolated worktree. It wrote neither the contract, the Sol oracles, the host baseline, the native before evidence, nor the implementation |
| Worktree | `.claude/worktrees/agent-a4139b55842a812f1`, detached at docs base `f8cbcbbbd728bf2fb421ca634bfccb2ab88fdc35` (control plane batch 43; clean before the runs) |
| Fixed revision | Requested `24073b5`, resolved `24073b522262d8b4bec0abfa29347db28adbdd9e`, tree `95b4aaff59927eee82248a6133e357e9c70e04ec` (L1 of every log) |
| Product-tree equality | `git diff --name-only 24073b5 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (precondition L2 of every log) |
| Fixed delta | `git diff --name-only 5cd63ff 24073b5 -- apps packages package.json pnpm-lock.yaml` is exactly the 24 Terra files of the control plane E6 row (precondition L5). Of the 19 rows of the contract r3 source table, the 8 unit files Terra was allowed to change differ, and the other 11 are byte-identical to the contract hashes: `internal/appearancePane.tsx`, `departureCoordinator.tsx`, the settings-shell `SettingsFooter.tsx`, `types.ts` and `styles.css`, the pet `DesktopPet.tsx` and `pet.css`, `usePrefAsync.ts`, `tokens.css`, `CountdownEditDialog.tsx` and `ErrorBanner.tsx` (precondition L6; all 19 hashes in L1 `contractSourceTable`) |
| Authority | `../web-appearance-recovery-contract/contract.md` r3 (`706c9a3`), SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d`, re-derived at HEAD by every run (precondition L4). In particular §2, §5 (items 1–8 and the normative wording), §6, §7, §8 (the eight disk shapes) and §14 E9–E11. Also `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`: "本轮唯一任务" (batch 43) and the CP-APPEARANCE-01 rows, including batch-39 ruling 3 and the OE-1 ruling |
| Browser | `Chrome/154.0.8037.97` (HeadlessChrome, `--headless=new`), protocol 1.3, user agent `HeadlessChrome/154.0.0.0`. Isolated profile and download directory; viewport 1280×900 at DPR 1. The host reports `prefers-color-scheme: dark` |
| Toolchain | Node `v24.16.0`; esbuild `0.28.1` from the gated tree; react 19.2.0, react-dom 19.2.0, react-router 7.15.1 |
| Lockfile gate | `sha256(pnpm-lock.yaml)` is `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` in four places: `XAI_DEPS_ROOT` (the main checkout, used read-only), `git show 24073b5:pnpm-lock.yaml`, the extracted archive and the contract gate constant (L1 `lockfileSha256`, precondition L3). It is a consistency check only |
| Module provenance | One bundle served all three modes: `be21e32d499af3485b36c270d418e52124243b52e4524e8bc8cf9ce6d62b3e05`, CSS `d58dfc44acd68008145cf09c17d90334164b2c6edc2b05a7a95c66bd8d259d24`. It has 1017 inputs: 625 from the archive (the `5cd63ff` before bundle had 621), 390 third-party, the fixture and the `import.meta.env` define. **0 foreign inputs.** All 320 `@repo/*` resolutions were pinned to archive package exports, and the guard found 0 modules loaded from the `packages/`, `apps/` or `docs/` tree of either checkout (precondition L7). All 48 required reader, writer and host modules were bundled from the archive (precondition L8). Every one of them outside the 24-file delta is byte-identical to `5cd63ff` (precondition L9). All hashes are in L1 `requiredModules` |
| Server and network | This runner's own `127.0.0.1` server on an ephemeral port. No dev server, install or build touched the dependency root. Every other host resolves to NOTFOUND. Page network attempts: 0 in every document (`run:network-and-requests`) |
| Diagnostic iterations | `controls`, `reset` and `export` each 1 of 3 (`fixed1`). Development probes are disclosed below |

## Files and SHA-256

All files are new, under `docs/reviews/web-appearance-recovery-native/`. Each log's L1 `fileSha256` records the runner, fixture and prelude, and they equal this table. This receipt cannot carry its own hash.

| File | Lines / bytes | SHA-256 |
| --- | --- | --- |
| `verify-native-fixed.mjs` (runner) | 2055 lines | `6249155657986667e47cf9fe52f34f29d0dce2abbf6010a0bfe259b8ea1003ad` |
| `native-fixed-app.tsx` (production App fixture) | 147 lines | `27bdc8e6a29532482f8510538a004d984c0e68754b022d02788d5b69694af4d7` |
| `native-fixed-prelude.js` (instruments) | 807 lines | `c8324c16e0494b56612bb671518118fd9643a6983b7ce19d3b658b8203b8249d` |
| `native-24073b5-fixed1-controls.log` | 1404 lines | `ccf7acb2d3152e8b1db7340dc9a60185d38c40c5a99362e0e7f4f04ca87384fa` |
| `native-24073b5-fixed1-reset.log` | 304 lines | `5b6fe71481c0049694f4919b0c1991678b6d125263d9b3efa951448176157809` |
| `native-24073b5-fixed1-export.log` | 415 lines | `c3ac58b0e1d6096525c28991f46b5b26e6762e4fe2ca69a6625a7481a20e3e9c` |
| `native-24073b5-fixed1-export-x1-sparse-set-topbar-theme-appearance-draft.json` | 105 B | `97b57a58c43858b1c5eb56de008494e84b4d1690923f3e6e818148713b16ee95` |
| `native-24073b5-fixed1-export-x2-sparse-registered-set-accent-appearance-draft.json` | 106 B | `1a17fe15377fbb2b8327b0bb3d0ed70f03ae09b399dd75f52c3e6cb6f11037c4` |
| `native-24073b5-fixed1-export-x3-background-both-writes-failing-appearance-draft.json` | 154 B | `5473b6503cdc6a0861279cbd0e6fceacab99e229641a9d7e2ba2c8fdc1667502` |
| `native-24073b5-fixed1-export-x4-mixed-set-and-reset-appearance-draft.json` | 142 B | `dbefb91c5c75db1569108f1c5e944b8825c7a03609b0343db33c701674d7cf83` |
| `native-24073b5-fixed1-export-x5-all-six-pending-resets-appearance-draft.json` | 255 B | `e5912d04587e8613b2222d5d6e890303c1d76d2ed35216fe2a3dcac8f3f50221` |
| `native-24073b5-fixed1-export-x6-all-seven-sets-including-language-appearance-draft.json` | 370 B | `e58d4e79f79090f062ef8b7639bcf38ca53ed549e34f90721cb337158c4e49a3` |
| `native-24073b5-fixed1-export-x7-one-operation-held-behind-a-real-lock-appearance-draft.json` | 151 B | `7946a5a86ce289288ed59e4453d1b4594526f0a478a769b282648090768fb32a` |
| `native-24073b5-fixed1-export-x8-after-navigating-away-and-back-appearance-draft.json` | 154 B | `bb63a96f38ab0848bab72b3c82dac778b487b8a7d71ae57658d8494557c3014c` |
| `native-24073b5-fixed1-export-x9b-recovered-after-click-failure-appearance-draft.json` | 154 B | `bb63a96f38ab0848bab72b3c82dac778b487b8a7d71ae57658d8494557c3014c` |

The JSON files are the exact bytes Chrome wrote to the download directory, with no trailing newline. x8 and x9b are byte-identical by design: the same two drafts were exported. Each SHA-256 is also in the export log's `disk-export` record (L44, L79, L114, L154, L192, L256, L297, L347, L386) and in L409 `export-summary`. After the runs, an independent re-parse of all nine files against the contract §8 envelopes matched 9 of 9.

## Commands

From the root of this worktree. Each run uses one Chrome session; `controls` adds one graceful restart. The runs were sequential:

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
  node docs/reviews/web-appearance-recovery-native/verify-native-fixed.mjs 24073b5 reset fixed1
XAI_DEPS_ROOT=... node docs/reviews/web-appearance-recovery-native/verify-native-fixed.mjs 24073b5 export fixed1
XAI_DEPS_ROOT=... node docs/reviews/web-appearance-recovery-native/verify-native-fixed.mjs 24073b5 controls fixed1
```

`XAI_NATIVE_TMPDIR` pointed at the session scratchpad. The temporary archive, profile, download directory and bundle were deleted after each run. Console lines:
- `PASS docs/reviews/web-appearance-recovery-native/native-24073b5-fixed1-reset.log checks=288 product=145 exit=0`
- `PASS docs/reviews/web-appearance-recovery-native/native-24073b5-fixed1-export.log checks=389 product=135 exit=0`
- `PASS docs/reviews/web-appearance-recovery-native/native-24073b5-fixed1-controls.log checks=1345 product=703 exit=0`

Exit codes:
- 0: the harness is valid and every check passes.
- 2: the harness is valid but a product check failed; the run stops at that check.
- 1: a precondition failed, so the harness is invalid.

Nonzero codes are preserved through `process.exitCode`.

Re-invoking an existing suffix stops with `Error: Evidence exists; use a distinct suffix` (exit 1) before anything is archived. This was verified for `reset fixed1`. Artifacts are written only after an existence precondition, with `wx`.

The dependency root stayed read-only. A scan after all runs found **0** entries newer than a marker file taken in the scratchpad before the first run. It covered the top level, `node_modules` and `apps/web/node_modules` to depth 2, `apps`, `packages` and `docs` to depth 2, and `packages` to depth 3.

**Development probes (disclosed).** Before `fixed1` I ran development probes. Their evidence went to the session scratchpad through `XAI_NATIVE_EVIDENCE_DIR`, which the runner refuses inside the repository, and none is committed. I also ran small standalone scratch scripts to isolate two harness problems. Every change below was made before `fixed1`, and no change weakened or reversed a product assertion.

| Probe | Finding | Change |
| --- | --- | --- |
| `reset dev1` | All 144 product checks passed. The final run-level network precondition counted the instrument self-test's own deliberately refused probe (`http://example.invalid/selftest`, on the product-free seed page) | The self-test probe is counted separately (`selfTestProbes: 1` in every log) and is not a page attempt |
| `controls dev1` | After the first trusted click (value 1) the runner made no further progress until an external 900 s `timeout` ended it. The log ends with `CDP socket closed` | Every evaluation and every input is bounded at 20 s, and a timeout records a debugger-paused JavaScript stack (`hang-diagnosis`). Renderer crashes are detected, and commands on a closed connection fail fast. Root cause: a cleanup command sent after the DevTools WebSocket had dropped is discarded silently, so its promise never settled. The drop itself is the `dev3`/`dev4` finding |
| `controls dev2` | PASS (1304 checks, 703 product). The trace contained trusted `keydown` events with key `Unidentified` that the runner never dispatched | Investigated below |
| `export dev1` | X1–X3 passed. At X4, right after the Reset confirmation, the centre hit-test of the density segment found no element (`hitTarget: null`) | `trustedClick` re-measures once after 400 ms, records both measurements, and keeps the precondition strict |
| `export dev2` | PASS (388 / 135). No re-measure was needed | None |
| `controls dev3`, `dev4` | The DevTools WebSocket closed with code 1006 (`wasClean: false`) while the Chrome process stayed alive (`processExit: null`), at value 3 and at value 34. Scratch scripts showed that lone surrogates in `returnByValue` results are carried correctly, and that Node's built-in WebSocket client negotiates `permessage-deflate` with Chrome | The runner now speaks CDP over the **pipe transport** (`--remote-debugging-pipe`, NUL-delimited JSON on fds 3/4, flattened target sessions), with no WebSocket at all. The cause of the 1006 drop was not isolated further; it never recurred on the pipe |
| `reset dev2` | PASS (287 / 145) on the pipe, including the second document through its own flattened session | None |
| `controls dev5` | PASS (1304 / 703) on the pipe, but with 26,141 stray trusted keydowns: key `Unidentified`, code `Minus`, keyCode 189, `timeStamp` 0, aimed at the focused element | Investigated below |
| Scratch scripts (key events) | The runner's exact Chrome flags on a plain page gave 0 stray events. The app bundle (with and without the prelude), idle with focus on the Topbar trigger, gave 0, and so did a trusted click on the trigger. **One Escape dispatched with `nativeVirtualKeyCode: 27`** started an endless stream of about 3,500 trusted keydowns per second (12,583 in about 4 s). The same Escape without that field produced exactly one keydown and closed the popover | `press()` sends no `nativeVirtualKeyCode`. On macOS that field is the platform key code, and Windows code 27 there is `kVK_ANSI_Minus`. Two keyboard audits were added as harness preconditions: per value step, no keyboard event other than the runner's input; per run, every document's keydown count equals the runner's presses |
| `controls dev6`, `export dev3`, `reset dev3` | PASS (1345 / 703, 389 / 135, 288 / 145), with files whose SHA-256 equal the committed files. Keyboard audit 17 = 17 | None. The `fixed1` runs followed with the unchanged files |

The stray keydown stream and the WebSocket drops were harness artifacts, and both are removed in `fixed1`. The keyboard audit holds in every log: controls L1401 (17 presses = 17 keydowns over 56 documents), reset L301 (0 = 0) and export L412 (3 = 3).

## Harness

**Composition: the production App** (`native-fixed-app.tsx`), all from the immutable archive. It follows the before fixture `native-app.tsx`:
- **Module order.** The module and stylesheet order of `apps/web/src/main.tsx`: the observability runtime, `AppProviders`, `routes/router.tsx`, the service-worker module, `@repo/plugin-web-tokens` and `styles/global.css`. Importing only evaluates them; `bootstrapObservability()` and `registerServiceWorker()` are not called.
- **Router chain.** The production router instance under `RouterProvider` from `react-router/dom`:
  - `/app/*` renders `ProtectedAppRouteElement` → `App` → `AccountStorageGate` → `AccountDataGate` → `CommandPaletteProvider` → `AppInner`.
  - `AppInner` holds **the one App-scoped Appearance controller** → `AppearanceProvider` → `WebShellProvider` + `Shell`, which contains AppRail and the Topbar with its `appearanceStatus` slot, plus `DesktopPet` and `CommandPalette`.
  - `/app/settings/appearance` renders the fixed pane through ComposedSettings, with `DepartureCoordinator` and `settingsDeparture`.
- **The only synthetic input is the auth session.** It is a client whose `auth.getSession` resolves one session for the synthetic account `appearance-native-A`. The real `WebAuthSessionProvider` with the production `invalidateAccountIdentity` serves it, and the real `AccountDataGate` activates generation `g1`. Both are preconditions at every mount.
- **Device keys.** The real lock names and physical keys of the seven keys are asserted at every mount: `xai:pref:v1:<key>` and unscoped device keys.
- **Not mounted.** `AppProviders`' bridges are not mounted (there is no network client), and there is no StrictMode.
- **Pet.** The DesktopPet stays on at its production default; every click is preceded by a centre hit-test.

**Instruments** (`native-fixed-prelude.js`). This is a classic script served before the bundle, and alone on a product-free seed page, where its self-test passes at L11–L12 of every log.
- **Storage.** Every `getItem`, `setItem`, `removeItem`, `key`, `clear` and `length` attempt is recorded before any fault decision, and then delegated exactly once. The available faults are total denial, per-key read, write and remove denial, and a one-shot readback denial after the next successful write or remove. A fault plan installed with `Page.addScriptToEvaluateOnNewDocument` arms read faults before mount. A depth counter proves that no instrument re-enters Storage (the F-B002 rule).
- **Events.** An `EventTarget.prototype.dispatchEvent` spy counts StorageEvents on any target and `web:*` bus events, including `web:settings:preference-changed`. A first-registered `storage` listener records delivered events.
- **Locks.** `LockManager.request` is traced (application vs fixture), and the fixture holds and releases real exclusive locks.
- **Export.** The trace covers `URL.createObjectURL` and `revokeObjectURL`, the export anchor (`download`, `href`, `isConnected` at click, DOM insertion and removal), and one-shot failure hooks for `createObjectURL` and the click.
- **Other.** A `window.confirm` recorder (the dialog stays native and is answered through CDP); network recorders; capture-phase click, keydown and input traces with `isTrusted`; read-only views of `<html>`, the Topbar and its status, and the pane; a synthetic cancelable `beforeunload` that counts handler storage attempts; DOM identity observers; and a per-frame `requestAnimationFrame` sampler.

**Input and transport.**
- **Trusted input.** Every activation is a trusted CDP mouse or key event after a centre hit-test.
- **Bytes.** Bytes are read uninstrumented and cross-checked through CDP `DOMStorage`.
- **Transport.** CDP runs over the DevTools pipe.
- **Second document.** It is an independent same-origin tab, `/external`, with no product code and no instruments. Its writes reach the App document as native trusted keyed `storage` events.

## E9 — controls (production App): PASS

| Required item | Result | Log lines (`native-24073b5-fixed1-controls.log`) |
| --- | --- | --- |
| **Absent mount** (c0). Zero set or remove attempts on the seven keys (8 reads). Defaults in the pane, in `<html>` and in the Topbar summary `EN · Light · Comfortable`, with `aria-checked` in the open popover. Clean bottom area: Retry all `aria-disabled="true"` with no `disabled` and no `aria-describedby`, Reset only, no old footer. No Topbar status, no unload warning, and zero writes for the popover round trip | PASS | 22–29, 34–35 |
| **All 40 values (33 pane, 7 Topbar) by trusted input**, as in the table below. For each value: exact bytes, both the page read and DevTools; exactly one `setItem` with the exact value and none elsewhere (a background choice makes exactly two, the tone and its paired accent); the real device lock and no account lock or account-key mutation; display and application on the pane, `<html>`, the Topbar summary and the UI language; the truthful line "Appearance settings saved."/"外观设置已保存。" with a clean area; no StorageEvent and no `web:settings:preference-changed`; no unrelated-key mutation; no unload warning afterwards | PASS ×40 | 36 (40 = 33 + 7), table below, summary 700 |
| **New-document reload** (`Page.reload`, new document instance). Zero mount writes. **Pane, Topbar (summary and `aria-checked`) and `<html>` agree on the stored values** (ruling 3): `system`, `compact`, 1.15 (18.4 px), 220, `bottom`, `graphite`. Clean state, no warning | PASS | 701 (new instance), 702–709, 714–715 |
| **Graceful browser restart** (process exit code 0) and fresh mount: the same checks | PASS | 716, 725–732, 737–738 |
| **Seeded fresh documents** (ruling 3, the batch-39 pane-mirror case): stored dark, compact, 1.1, 230, right, mist in EN, then again in ZH. Zero mount writes, and the pane, Topbar and `<html>` agree | PASS ×2 | 749–756, 761–762; 773–780, 785–786 |
| **Source-only state for each key**, seven invalid and seven unreadable (table below). The App renders with no route error and no uncaught exception. The field shows its default, displayed and applied, with **Reload only**, and the other six fields keep their stored values. Bytes are never rewritten (zero set or remove attempts; page and DevTools bytes unchanged). No draft, Export, Discard all, Saved claim, Topbar status or unload warning; Retry all stays disabled. For invalid bytes, Reload rereads and keeps the alert and the bytes, a sidebar departure is not held, and the alert returns with zero writes. For unreadable bytes, Reload while still denied keeps the alert; after the fault is lifted, Reload repairs the field with no Saved claim and zero writes | PASS ×14 | 790–1157 (per key below) |
| **ZH, six malformed keys at once** (`"Dark"`, unquoted `compact`, `0.5`, `abc`, `Left`, `neon`): six localized Reload-only alerts ("已保存的…不可用。请重新读取；这不是新的未保存更改。", "重新读取 …"), defaults applied, no throw, no rewrite, no draft | PASS | 1161–1162, 1168–1171 |
| **Valid edit over malformed bytes** (rail `diagonal` → Top). A failed draft with Retry, Discard, Export, the count line, an enabled Retry all, the Topbar status and a warning; the edit is displayed and applied. Bytes stay `diagonal` with zero set attempts. Retry is refused again and the draft kept. Discard returns to Reload only with zero writes, and the default is applied again | PASS | 1185–1187, 1191, 1195 |
| **Natively held per-key Web Lock** (theme via the pane, then the registered `railPos`). The fixture holds the real `xai:pref:v1:<key>` lock. The block reads "<Label> is saving." (status role); the status line is empty, Retry all is disabled and there is no Topbar status. The latest choice is displayed and applied while held, controls stay enabled, bytes are unchanged with zero writes, and the engine waits on the real lock with exactly one application request. `beforeunload` warns. Per-field Retry while pending is inert. After release: **exactly one write** and "Appearance settings saved." | PASS ×2 | theme 1206 (held), 1210–1215, 1219–1221; railPos 1232, 1236–1241, 1245–1247 |
| **Readback uncertainty** (density, then the registered accent). The write lands and its readback is denied once (precondition: the fault fired after the write). Result: "<Label> was not saved.", the latest choice kept, the count line, the Topbar status and a warning, with no false Saved. Retry reconciles with **exactly one total write** (zero writes during Retry) and then "Appearance settings saved." | PASS ×2 | density 1262, 1263, 1267–1268; accent 1283, 1284, 1288–1289 |
| **Second-document conflicts** (the OE-1 rule: an unobserved or external write is a preserved conflict). (1) Theme Dark is uncertain, and the other document **restores the baseline** `"light"` (ABA). (2) Rail Right is refused, and the other document **removes** `xai_rail_pos`. (3) Accent Violet is refused, and the other document **replaces** the bytes with `35`. In each case a native keyed trusted `storage` event is delivered. Retry, with the faults lifted, makes zero writes and **preserves the external bytes**, and repeated Retry never overwrites. The conflict stays as "<Label> was not saved." with the latest choice displayed, the count line and the Topbar status. Discard makes zero writes, rereads only that field and shows the external value (Light, default Left, Sunset 35), with no warning | PASS ×3 | (1) 1303, 1308, 1304, 1310, 1314–1315, 1319, 1323–1324; (2) 1339, 1344, 1340, 1346, 1350–1351, 1355, 1359–1360; (3) 1375, 1380, 1376, 1382, 1386–1387, 1391, 1395–1396 |
| **Cross-surface sameness between pane and Topbar** (language, theme, density). For 14 steps (7 pane, 7 Topbar), every rAF snapshot shows one state across the pane selection, the Topbar summary (and `aria-checked` while the popover is open), the UI language and `<html>` `data-theme`/`data-density`. At least one frame shows the new value on both surfaces. 0 inconsistent snapshots. See the frame-count note under Observations | PASS ×14 | F-lines in the table below; 1398 |
| Run: no non-local network, keyboard trace limited to the runner's 17 presses, no unexpected dialogs, zero runtime errors | PASS | 1400–1403; result 1404 |

The 40 values. Letters give the log line of each check: T trusted input, P persisted with the saved status, B exact bytes, D DevTools bytes, W exactly one write, L device lock, S displayed and applied, C Topbar `aria-checked`, K saved line and clean area, E no StorageEvent or preference broadcast, U no unrelated mutation, F per-frame sameness, N no unload warning. The single write shown is the attempt-level record.

| # | Surface | Field = value | Input | Bytes | Write | Lines | Frames |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | pane | lang = `zh` | click | `xai_pref_lang="zh"` | 1 | T41 P42 B43 D44 W45 L46 S47 K48 E49 U50 F51 N52 | 20 |
| 2 | pane | lang = `en` | click | `"en"` | 1 | T58 P59 B60 D61 W62 L63 S64 K65 E66 U67 F68 N69 | 40 (20 distinct) |
| 3 | pane | theme = `light` | click | `xai_pref_theme="light"` | 1 | T75 P76 B77 D78 W79 L80 S81 K82 E83 U84 F85 N86 | 60 (20) |
| 4 | pane | theme = `dark` | click | `"dark"` | 1 | T92 P93 B94 D95 W96 L97 S98 K99 E100 U101 F102 N103 | 80 (20) |
| 5 | pane | theme = `system` | click | `"system"` | 1 | T109 P110 B111 D112 W113 L114 S115 K116 E117 U118 F119 N120 | 100 (20) |
| 6 | pane | density = `comfortable` | click | `xai_pref_density="comfortable"` | 1 | T126 P127 B128 D129 W130 L131 S132 K133 E134 U135 F136 N137 | 120 (20) |
| 7 | pane | density = `compact` | click | `"compact"` | 1 | T143 P144 B145 D146 W147 L148 S149 K150 E151 U152 F153 N154 | 140 (20) |
| 8 | pane | fontScale = 0.85 | Home | `xai_pref_font_scale=0.85` | 1 | T161 P162 B163 D164 W165 L166 S167 K168 E169 U170 N171 | — |
| 9 | pane | fontScale = 0.9 | ArrowRight | `0.9` | 1 | T174 P175 B176 D177 W178 L179 S180 K181 E182 U183 N184 | — |
| 10 | pane | fontScale = 0.95 | ArrowRight | `0.95` | 1 | T187 P188 B189 D190 W191 L192 S193 K194 E195 U196 N197 | — |
| 11 | pane | fontScale = 1 | ArrowRight | `1` (the default value is stored) | 1 | T200 P201 B202 D203 W204 L205 S206 K207 E208 U209 N210 | — |
| 12 | pane | fontScale = 1.05 | ArrowRight | `1.05` | 1 | T213 P214 B215 D216 W217 L218 S219 K220 E221 U222 N223 | — |
| 13 | pane | fontScale = 1.1 | ArrowRight | `1.1` | 1 | T226 P227 B228 D229 W230 L231 S232 K233 E234 U235 N236 | — |
| 14 | pane | fontScale = 1.15 | ArrowRight | `1.15` | 1 | T239 P240 B241 D242 W243 L244 S245 K246 E247 U248 N249 | — |
| 15 | pane | accentHue = 165 (Sage) | click | `xai_accent_hue=165` (the default value is stored) | 1 | T255 P256 B257 D258 W259 L260 S261 K262 E263 U264 N265 | — |
| 16 | pane | accentHue = 230 (Ocean) | click | `230` | 1 | T271 P272 B273 D274 W275 L276 S277 K278 E279 U280 N281 | — |
| 17 | pane | accentHue = 35 (Sunset) | click | `35` | 1 | T287 P288 B289 D290 W291 L292 S293 K294 E295 U296 N297 | — |
| 18 | pane | accentHue = 355 (Rose) | click | `355` | 1 | T303 P304 B305 D306 W307 L308 S309 K310 E311 U312 N313 | — |
| 19 | pane | accentHue = 295 (Violet) | click | `295` | 1 | T319 P320 B321 D322 W323 L324 S325 K326 E327 U328 N329 | — |
| 20 | pane | accentHue = 75 (Amber) | click | `75` | 1 | T335 P336 B337 D338 W339 L340 S341 K342 E343 U344 N345 | — |
| 21 | pane | accentHue = 0 (slider) | Home | `0` | 1 | T352 P353 B354 D355 W356 L357 S358 K359 E360 U361 N362 | — |
| 22 | pane | accentHue = 220 (slider) | track click | `220` | 1 | T371 P372 B373 D374 W375 L376 S377 K378 E379 U380 N381 | — |
| 23 | pane | accentHue = 360 (slider) | End | `360` | 1 | T384 P385 B386 D387 W388 L389 S390 K391 E392 U393 N394 | — |
| 24 | pane | railPos = `left` | click | `xai_rail_pos=left` (the default value is stored) | 1 | T400 P401 B402 D403 W404 L405 S406 K407 E408 U409 N410 | — |
| 25 | pane | railPos = `right` | click | `right` | 1 | T416 P417 B418 D419 W420 L421 S422 K423 E424 U425 N426 | — |
| 26 | pane | railPos = `top` | click | `top` | 1 | T432 P433 B434 D435 W436 L437 S438 K439 E440 U441 N442 | — |
| 27 | pane | railPos = `bottom` | click | `bottom` | 1 | T448 P449 B450 D451 W452 L453 S454 K455 E456 U457 N458 | — |
| 28 | pane | bgTone = `default` | click | `xai_bg_tone=default`, `xai_accent_hue=165` | 2 | T464 P465 B466 D467 W468 L469 S470 K471 E472 U473 N474 | — |
| 29 | pane | bgTone = `cream` | click | `cream`, `55` | 2 | T480 P481 B482 D483 W484 L485 S486 K487 E488 U489 N490 | — |
| 30 | pane | bgTone = `mist` | click | `mist`, `230` | 2 | T496 P497 B498 D499 W500 L501 S502 K503 E504 U505 N506 | — |
| 31 | pane | bgTone = `lavender` | click | `lavender`, `295` | 2 | T512 P513 B514 D515 W516 L517 S518 K519 E520 U521 N522 | — |
| 32 | pane | bgTone = `peach` | click | `peach`, `35` | 2 | T528 P529 B530 D531 W532 L533 S534 K535 E536 U537 N538 | — |
| 33 | pane | bgTone = `graphite` | click | `graphite`, `220` | 2 | T544 P545 B546 D547 W548 L549 S550 K551 E552 U553 N554 | — |
| 34 | Topbar | lang = 中文 | click | `xai_pref_lang="zh"` | 1 | T564 P565 B566 D567 W568 L569 S570 C571 K572 E573 U574 F575 N576 | 21 |
| 35 | Topbar | lang = English | click | `"en"` | 1 | T584 P585 B586 D587 W588 L589 S590 C591 K592 E593 U594 F595 N596 | 40 (20) |
| 36 | Topbar | theme = Light | click | `xai_pref_theme="light"` | 1 | T604 P605 B606 D607 W608 L609 S610 C611 K612 E613 U614 F615 N616 | 60 (20) |
| 37 | Topbar | theme = Dark | click | `"dark"` | 1 | T624 P625 B626 D627 W628 L629 S630 C631 K632 E633 U634 F635 N636 | 80 (20) |
| 38 | Topbar | theme = System | click | `"system"` | 1 | T644 P645 B646 D647 W648 L649 S650 C651 K652 E653 U654 F655 N656 | 100 (20) |
| 39 | Topbar | density = Comfortable | click | `xai_pref_density="comfortable"` | 1 | T664 P665 B666 D667 W668 L669 S670 C671 K672 E673 U674 F675 N676 | 120 (20) |
| 40 | Topbar | density = Compact | click | `"compact"` | 1 | T684 P685 B686 D687 W688 L689 S690 C691 K692 E693 U694 F695 N696 | 140 (20) |

Value records are at L53, L70, …, L698 (one `value` record per step).

**Slider input.**
- **Font scale.** The slider is focused by a trusted click on its row label and one trusted Tab, then driven by Home and six ArrowRight presses. Each step is one trusted keydown and one trusted `input` event, as T shows.
- **Accent, 0 and 360.** These are the Home and End keys.
- **Accent, 220.** A single trusted click on the track at a point computed from the slider's user-agent shadow geometry, read through CDP: track 905 px plus 160 px, thumb 18 px, 0.394 px per unit. The geometry was validated first against the current thumb position (predicted 905 = measured 905), and the trusted `input` event carried `220` (preconditions L364–L370).

**System theme.** It resolves to `data-theme="dark"` on this host (`prefersDark: true`; L115 shows pane System, Topbar "System" and `<html>` dark).

Source-only cases (seeded valid non-defaults for the other six keys: en, dark, compact, 230, mist, right, 1.1):

| Key | Invalid bytes | Invalid-case lines | Unreadable (read fault armed before mount; seeded valid value) | Unreadable-case lines |
| --- | --- | --- | --- | --- |
| `xai_pref_lang` | `"fr"` (crashed `/app` at `5cd63ff`, H6) | 790–791, 797–801, 805, 810, 815 | `"zh"` (the UI stays English while it is denied, becomes Chinese after the repair) | 826 (plan fired), 819–820, 827–831, 835, 839 |
| `xai_pref_theme` | `"neon"` | 843–844, 850–854, 858, 863, 868 | `"dark"` | 879, 872–873, 880–884, 888, 892 |
| `xai_pref_density` | `{}` | 896–897, 903–907, 911, 916, 921 | `"compact"` | 932, 925–926, 933–937, 941, 945 |
| `xai_accent_hue` | `Infinity` (crashed `/app` at `5cd63ff`, H6) | 949–950, 956–960, 964, 969, 974 | `230` | 985, 978–979, 986–990, 994, 998 |
| `xai_bg_tone` | `sage` (outside the strict domain) | 1002–1003, 1009–1013, 1017, 1022, 1027 | `mist` | 1038, 1031–1032, 1039–1043, 1047, 1051 |
| `xai_rail_pos` | `diagonal` | 1055–1056, 1062–1066, 1070, 1075, 1080 | `right` | 1091, 1084–1085, 1092–1096, 1100, 1104 |
| `xai_pref_font_scale` | `"1"` (crashed `/app` at `5cd63ff`, H6) | 1108–1109, 1115–1119, 1123, 1128, 1133 | `1.1` | 1144, 1137–1138, 1145–1149, 1153, 1157 |

## E10 — Reset to defaults (production App): PASS

There are seven scenarios, each on a fresh seed and mount. The stored values are lang `"en"` (or `"zh"`), theme `"dark"`, density `"compact"`, accent `230`, background `mist`, rail `right` and font `1.1`. Unrelated keys are seeded too: Features `xai_pref_features_habits=false`, `xai_rail_order` (reordered), `xai_pet_id=pip`, `xai_pet_pos`, `xai_pref_sticky_color=mint`, a probe key, the generation marker, plus the App's own `xai:auth:identity-change`. Every mount is first checked by the full fresh-load check: zero mount writes, with pane, Topbar and `<html>` agreeing.

| Required item | Result | Log lines (`native-24073b5-fixed1-reset.log`) |
| --- | --- | --- |
| **Declined confirmation** (R0). The normative text "Reset theme, density, font scale, accent color, background palette and sidebar position to their defaults? Language is kept." is asked once and declined. **Zero get, set or remove attempts from the trusted activation (seq 74) to the confirm return (seq 76)**, and zero attempts of any kind in the whole 600 ms window (global total 0). No state change: the clean area, stored values displayed and applied, unchanged bytes, no Topbar status and no warning | PASS | 34, 35 (traced), 36, 37, 38 |
| **Accepted** (R1, EN). Exactly **6 removes**, all `ok`, on the six keys. **Zero writes.** The six keys are absent (page and DevTools), and the **language bytes `"en"` are unchanged**: the reset made zero reads, writes or removes on `xai_pref_lang` from the activation to settlement. Defaults are displayed and applied: Light, Comfortable, 16 px, 165, no `data-bg-tone`, Left, and `EN · Light · Comfortable`. "Defaults restored." appears in the status line (status role) with a clean area, no Topbar status and no warning. Only the six device-key locks are requested, with no account lock or account-key mutation | PASS | 70, 71, 72, 73, 74, 75 |
| **Accepted in ZH with one key already absent** (R1z; font scale absent). The ZH normative confirmation is used. **5 removes and one verified no-op** (no `removeItem` on the absent key), zero writes, language bytes `"zh"` unchanged, and "已恢复默认设置。" | PASS | 107, 108, 109, 110, 111 |
| **One-key removeItem fault** (R2, accent). The fault is armed and fires. The five others are removed with zero writes. The per-field result is "Accent color was not reset to its default." (alert) with Retry and Discard; the default 165 is displayed and applied while the bytes stay `230`. There is no "Defaults restored.": the line reads "1 appearance change is not saved.", Retry all is enabled, Export and Discard all are present, and the Topbar status and a warning show. A refused per-field Retry targets only accent (1 denied remove). After the fault is lifted, **targeted Retry makes exactly one remove (accent)**, successful fields are not removed again, and only then does "Defaults restored." appear | PASS | 143 (fault), 144, 145, 146, 150, 154, 155 |
| **Two-key removeItem faults** (R3, theme and rail). The faults fire, four keys are removed, and there are **two per-field results** with the line "2 appearance changes are not saved." Retry Theme makes one remove, and Sidebar position stays unresolved ("1 appearance change is not saved.", warning). Retry Sidebar position makes one remove, then "Defaults restored." | PASS | 187 (faults), 188, 189, 193, 197 |
| **Readback uncertainty** (R4, density). The remove lands and its readback is denied once (the fault fires after the remove). The reset draft is kept with no "Defaults restored.". Retry verifies absence with **exactly one total remove** and no write, then "Defaults restored." | PASS | 229 (fault), 230, 234 |
| **Conflict** (R5, background). The remove is refused, so a reset draft is kept. The second document writes `peach`, and a native keyed trusted event is delivered. After the fault is lifted, Retry makes **zero removes or writes**, and the **external bytes `peach` are preserved**. The reset draft stays with the count line. A repeated Retry never removes. Discard makes zero writes and shows Peach (pane and `<html>`), with no warning and no Topbar status. "Defaults restored." is never claimed | PASS | 266 (fault), 271, 267, 273, 277, 278, 282, 286, 287 |
| **Truthful "Defaults restored."** For every rendered frame of each scenario, no frame shows it while a recovery block exists, Retry all is enabled or the Topbar status is shown. It is shown only after genuine full success (R1, R1z, R2, R3, R4) and never in R0 or R5 | PASS ×7 | 45, 82, 117, 161, 203, 240, 294 |
| **Unrelated-key snapshot unchanged**: every key other than the seven, including the marker, the Features, pet and rail-order keys and the identity key | PASS ×7 | 43, 80, 115, 159, 201, 238, 292 |
| Language bytes unchanged and never written, in every scenario | PASS ×7 | 44, 81, 116, 160, 202, 239, 293 |
| Never writes: zero `setItem` on the seven keys in any scenario | PASS ×7 | 46, 83, 118, 162, 204, 241, 295 |
| No StorageEvent and no `web:settings:preference-changed`; no key:null; no account relock or scope transition; no host remount and no gate screen (the `.app`, Topbar, rail, pet, settings shell, sidebar, detail and pane are the same nodes) | PASS ×7 | 40–42, 77–79, 112–114, 156–158, 198–200, 235–237, 289–291 |
| Throughout (7 scenarios): broadcasts 0, relocks 0, scope transitions 0, gate insertions 0, removals 0, replaced nodes 0, "Defaults restored." frames with unresolved work 0 | PASS | 297 (record), 298 |
| Run: no non-local network, no key presses (0 = 0), only the 7 planned confirmations, zero runtime errors | PASS | 300–303; result 304 |

## E11 — on-disk export (production App): PASS

Every export runs under **total Storage denial**: every Storage operation throws. As a precondition, the injector fires and logs one denied read immediately before the export. For each export the log asserts:
- attempt-level reads, writes, removes and other operations all **zero** during the export window;
- exactly **one object URL created, and that same URL revoked**;
- the anchor with `download="appearance-draft.json"` appended, **clicked once** with that URL while connected, and **removed** (0 anchors left);
- the actual Chrome download parsed from disk and **deep-equal to the whole envelope**, as the single file `appearance-draft.json`, with no account bucket, physical key, account id or timestamp;
- the drafts kept, with Export and Discard all still present;
- the **pane status line as expected**: the A2.4 line for the state, or the localized export error after a failure;
- the **Topbar status still shown for settled failures**, and absent when only pending work exists;
- no StorageEvent and no `web:settings:preference-changed`;
- location and bytes unchanged;
- afterwards, a cancelable `beforeunload` that **still warns** with zero handler storage attempts.

Each shape runs on its own fresh mount, except X9, which continues from X8.

| §8 shape | Scenario | Disk envelope `changes.device` | Zero attempts | URL | Anchor and click | Deep-equal | Status line / Topbar status | Warns | Disk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 sparse set left by a **Topbar** failure (theme) | X1: Topbar Dark, with the `setItem` fault fired (L29) | `theme: set "dark"` | 36 | 38 | 39 | 40 | 45 (`1 appearance change is not saved.`) / 46 | 49 | L44 `97b57a58…` |
| 2 sparse registered set (accent) | X2: Ocean refused | `accentHue: set 230` | 71 | 73 | 74 | 75 | 80 / 81 | 84 | L79 `1a17fe15…` |
| 3 background choice, both writes failing | X3: Lavender, tone and paired accent refused (L99) | `accentHue: set 295`, `bgTone: set "lavender"` | 106 | 108 | 109 | 110 | 115 (`2 … not saved.`) / 116 | 119 | L114 `5473b650…` |
| 4 mixed set and reset | X4: Reset with the sidebar removal refused (L135), then Compact refused | `density: set "compact"`, `railPos: reset` | 146 | 148 | 149 | 150 | 155 / 156 | 159 | L154 `dbefb91c…` |
| 5 **all six pending resets** | X5: all six real per-key locks held, Reset accepted; six "… is being reset to its default." (L176–L177) | six `reset` entries | 184 | 186 | 187 | 188 | 193 (empty; Retry all disabled) / 194 (absent: only pending) | 198 | L192 `e5912d04…` |
| 6 all seven sets, including language | X6: every write refused; 简体中文 (the UI switches to ZH), Dark, Compact, Mist then Violet, Top, font ArrowLeft (L240–L241) | `lang: "zh"`, `theme: "dark"`, `density: "compact"`, `accentHue: 295`, `bgTone: "mist"`, `railPos: "top"`, `fontScale: 0.95` (all `set`) | 248 | 250 | 251 | 252 | 257 (`7 项外观更改未保存。`) / 258 (ZH name) | 261 | L256 `e58d4e79…` |
| 7 one operation held behind a real lock | X7: Dark refused, plus Right pending behind the real `xai:pref:v1:xai_rail_pos` lock (L281) | `theme: set "dark"`, `railPos: set "right"` | 289 | 291 | 292 | 293 | 298 / 299 | 303 | L297 `7946a5a8…` |
| 8 after navigating away from the pane and back | X8: Compact and Ocean refused. A trusted AppRail click to `/app/calendar` is not held; the pane unmounts while the drafts live on, with the Topbar status shown and `<html>` still compact and 230 (L327). A trusted Topbar-status click returns to the pane with the drafts intact (L331–L332) | `density: set "compact"`, `accentHue: set 230` | 339 | 341 | 342 | 343 | 348 / 349 | 352 | L347 `bb63a96f…` |

Supporting facts:
- **X5.** The export never released the held resets, and the bytes were unchanged (L197). After release, the resets completed with exactly 6 removes and no write, and "Defaults restored." appeared (L200).
- **X7.** The export never released the held operation; rail bytes stayed absent (L302). After release there was exactly one write, `right` (L305).
- **Native setup failure** under total denial: X9a, the anchor click throws once.
  - The localized "Export failed. Please retry." appeared (L359), and no download was written (L360).
  - Zero attempts (L361).
  - One URL was created and the same URL revoked (L363). The anchor was clicked once and removed (L364), and the failure fired (L365).
  - The drafts were kept, with the status line showing the error (L366), the Topbar status shown (L367) and the warning intact (L370).
- **X9b, recovered export.** It wrote the same two-draft envelope and returned the status line to "2 appearance changes are not saved." (L377–L391; disk at L386).
- **X9c, `createObjectURL` throws once.** The localized error appeared, with no URL, no anchor and no click (L402), zero attempts (L400), the drafts kept (L403), the Topbar status shown (L404) and the warning intact (L407).
- **Run.**
  - Zero non-local network.
  - Keyboard trace: 3 presses = 3 keydowns.
  - Two planned confirmations.
  - Six real `beforeunload` prompts. They appeared on runner-initiated navigations away from documents that still had Appearance drafts; each was recorded as expected and accepted.
  - Zero runtime errors (L411–L414; result L415).

## Counts

| Count | controls | reset | export |
| --- | --- | --- | --- |
| Checks / product checks / preconditions (result record) | 1345 / 703 / 642 | 288 / 145 / 143 | 389 / 135 / 254 |
| Failed checks; `PRECONDITION` failures | 0; 0 | 0; 0 | 0; 0 |
| StorageEvents dispatched by the product; `web:settings:preference-changed` | 0; 0 (every value step, E) | 0; 0 (L297) | 0; 0 (every export) |
| Runtime exceptions + console errors | 0 | 0 | 0 |
| Console warnings | 0 | 0 | 0 |
| Keyboard audit (runner presses = keydowns), documents | 17 = 17, 56 | 0 = 0, 15 | 3 = 3, 17 |
| Browser sessions | 2 (one graceful restart, exit code 0) | 1 | 1 |

**Runtime errors and warnings.** None in any log. The before evidence had console warnings from the legacy accent codec (`[plugin-web-storage] decode failed for xai_accent_hue …`). The fixed App produced none, including with `Infinity`, `abc` and other malformed accent bytes seeded. This is consistent with the fixed `App.tsx` no longer reading those keys through legacy `usePref`. The runner records any warning with its source (bundle line mapped to the module by esbuild's module comments); there were none to report.

## Observations (recorded, not verdicts)

1. **App mount writes.** Every App mount writes and removes a random `lswt-*` writability probe and writes `xai:auth:identity-change`. These are non-Appearance keys. On the seven keys the mount makes 8 reads and 0 writes (L22 `otherMountMutations`).
2. **Focus after recovery actions** (E15 owns keyboard and focus). After an accepted Reset, focus stays on Reset to defaults (reset L76, L84, L119). After a targeted Retry unmounted a focused recovery block, focus landed on the field's control: the Accent hue slider (L163), the Left rail card (L205) and the Comfortable segment (L242). After Discard it landed on the Peach card (L296). After a source-only Reload, focus is on the field's control (controls L806 and others).
3. **Status line after a discarded conflict.** It is empty (controls L1325, L1361, L1397; reset L288). This matches A2.4 rule 5: Discard is a pane-level action, so nothing is claimed.
4. **Hit-test re-measure.** In export X7 the first centre hit-test of the Export button, about 200 ms after the sidebar-position choice Right was displayed, found the AppRail at the button's computed point. Measured 400 ms later, the button had moved from left 25 px to left 468 px and the hit-test passed. Both measurements are recorded at export L286. This was a transient layout during the rail move. No other re-measure occurred in the three logs.
5. **Frame-count quirk (no verdict affected).** In `controls`, the per-step snapshot counts of the 14 sampled steps are exact multiples of about 20: 20, 40, …, 140 for pane steps 1–7, and 21, 40, …, 140 for Topbar steps 34–40. Logged in total: 1121.
   - **Cause.** The sampler's `stopFrames`/`startFrames` race let an earlier rAF loop survive into the next sampled step. The k-th consecutive sampled step ran k loops, which record identical snapshots of the same frame.
   - **Effect.** Every snapshot was checked, so "0 inconsistent" holds. The number of distinct frames is about 20 per step (about 281 in total), not 1121.
   - **Scope.** `reset` starts sampling once per fresh document and is not affected.
6. **Key-code convention in earlier runners.** The before runner in this directory (`verify-native-before.mjs`, `press()`) also passes Windows virtual-key codes as `nativeVirtualKeyCode`. On this macOS host such an Escape started the stray keydown stream described under development probes. I did not rerun or assess the frozen before evidence for this.

## Limitations

- **Environment.** Headless Chrome 154 on macOS, not Tauri. The account and session are synthetic. Development build (esbuild, `import.meta.env` defined as `{}`) without StrictMode. `AppProviders`' bridges are not mounted. The dependency tree is reused read-only; the lockfile gate is a consistency check only. These are the contract §15 retained exclusions.
- **Unload warning.** It is asserted with a synthetic cancelable `beforeunload` event. Real prompts appeared only on runner navigations in `export`, where they were accepted.
- **Bytes leaving the renderer.** This is shown once, by a graceful browser restart after the 40 values, plus DevTools reads after every value. The LevelDB files were not parsed.
- **System theme.** The host reports `prefers-color-scheme: dark`, so a natively selected `system` resolves to dark here; the light resolution was not exercised natively.
- **The accent value 220.** It was entered by one trusted click at a computed track position. The geometry model was validated against the live thumb, and the trusted `input` event value was checked, both as preconditions.
- **Second document and locks.** The second document is a product-free same-origin tab, not a second App instance. Fixture-held locks live in the App document.
- **Pet.** The DesktopPet stayed on at its default position, and every click passed a centre hit-test. Pet occlusion (R-PET) belongs to E14.
- **Frame sampling.** It covered only the 14 language, theme and density steps. See observation 5 for its counts.
- **Not covered here.** Host matrix rows a–s (E12, including the Retry all rows o–s and Topbar-status navigation as a requirement), production downstream readers (E13), visual and pet-on checks (E14), keyboard and focus (E15), native Retry all (E26), and every later item.
