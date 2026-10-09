# AppRail order native keyboard at `f9eb4b1` (CP-APPRAIL-01, batch 63, contract r1 §9 "Keyboard", §15 E14)

**Verdict: PASS for E14.** Two modes, one authoritative run each (`fixed1`), both harness-valid, zero failed product checks, zero `PRECONDITION` failures, zero product runtime errors:

| Mode | Viewport | Product checks pass/total | Preconditions | Key audit (K-1) | Screenshots | Exit |
| --- | --- | --- | --- | --- | --- | --- |
| `keyboard-en` (`native-f9eb4b1-fixed1-keyboard-en.log`) | EN 1024×768 | 167/167 (walks 84, order 20, activate 61, run 2) | 598 | 928 presses, 1,885 = 1,885 key events, 38 checkpoints, 0 untrusted, 0 mismatches (L908, L910) | 13 | 0 |
| `keyboard-zh` (`native-f9eb4b1-fixed1-keyboard-zh.log`) | ZH 375×812, mobile emulation | 167/167 (the same split) | 624 | 906 presses, 1,841 = 1,841, 38 checkpoints, 0 untrusted, 0 mismatches (L934, L936) | 17 | 0 |

- **No new stop lacks visible focus, and focus never lands on `<body>`.** All 28 new-stop captures (status button in three walk states, Retry, Discard, Export, Reload; light and dark; EN and ZH) pass the frozen `pixelFocusWalk` oracle, with 393–972 own-region pixels changed and a computed `solid 2px` outline at offset 2 px. Every focus target is `.topbar-pref-trigger` in every sampled animation frame after the status unmounts.
- **Every pre-existing stop passes as at `419e56d`.** 0 of 1,188 stop captures fail (EN 604, ZH 584, including the 419e56d control walks); the pre-existing stop set of every fixed walk equals the 419e56d control's.
- **Weak stops** (the oracle's own < 15 % band criterion, reported, not failed): none in EN. In ZH, (a) the known UX-05 stop, the first bottom-rail item clipped by the rail scroller, identical to 419e56d (81–82 of 2,209 own pixels, ring band fully clipped); and (b) **new to this caller's state: with the source panel open at 375, the settings-sidebar rows 账户 and 会员 are ~98 % covered by the open, fixed panel when focused** (309/311 own pixels vs 720/835 at 419e56d). They still pass the oracle. See §5, finding F-E14-1, for a controller ruling.
- No stop condition was met; no oracle/contract contradiction was found; the harness reproduced in every run.

**Status.** Verification only. It repairs nothing and changes no product source, product test, contract, oracle, ledger, control plane or existing evidence. Every earlier file in this directory and the Appearance oracle files were read only and hash-checked in every run. It accepts nothing and closes no 312 item. It does not push, merge, deploy, release or sync Web→Desktop.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5, parent native verifier (batch 63), isolated worktree `.claude/worktrees/agent-aabba76e2ae7d60ec`. It wrote neither the contract, the before oracles, the implementation, nor batches 56–62, nor the Appearance oracle |
| Docs base (detached HEAD) | `641ca45fac2f39bc8baf362a18795f4c6d9a6051` after `git fetch origin codex/web/full-product-audit-20260908`; clean before the work (`baseline.docsHead`, L8 in both logs) |
| Fixed revision | Requested `f9eb4b1`, resolved `f9eb4b1f207bc4b46f547b90afc250424b3c8695`, tree `05887cf113639116b228a25041a37b3d5c69a322`; `git diff --name-only f9eb4b1 HEAD -- apps packages package.json pnpm-lock.yaml` empty; `419e56d..f9eb4b1` exactly the 19 E6 files (preconditions L9–L11; lockfile L12, contract L13) |
| Compare revision | `419e56de9f23e4467fea806fbd4a990e1f429941`, bundled as the `before` variant for the clean control walks |
| Authority | Contract r1 `../web-apprail-order-recovery-contract/contract.md`, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde` (re-derived at HEAD every run): §7 item 2, §9 "Keyboard", §15 E14, §17. Control plane "本轮唯一任务" (batch 63) and the CP-APPRAIL-01 rows (batch 61 and 62 receipts and rulings) |
| Browser / toolchain | `Chrome/155.0.8059.39` headless (`--headless=new`), DevTools **pipe** transport (`--remote-debugging-pipe`, flattened sessions), isolated profile, DPR 1. macOS 27.0.1 arm64, Node v24.16.0, esbuild 0.28.1, react 19.2.0, react-dom 19.2.0, react-router 7.15.1 |
| Lockfile gate | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` in six places: dependency root, `git show` of both revisions, both extracted archives, the contract constant (L8) |
| Dependency root | `XAI_DEPS_ROOT` = the main checkout, read only. No install, build, checkout, dev server or preview tool ran there. After all runs `find -newermt 2026-10-09T13:58Z` over the checkout (depth 3, `.git`/`.claude` excluded) and over `packages`, `node_modules`, `apps/web/node_modules` (depth 3) found 0 entries |
| Network | Only the runner's own `127.0.0.1` server (ephemeral port); every other host maps to NOTFOUND; 0 page network attempts over 39 documents per mode (`run:no-non-local-network-attempt`, EN L909, ZH L935) |
| Evidence runs | Both started 2026-10-09T14:26:09Z in parallel; logs written 14:33:28Z (ZH) and 14:33:29Z (EN) |
| Iterations | Each mode 1 of 3 (`fixed1`). Development probes dev1–dev7 are disclosed in §8 |

## 2. Files and SHA-256

34 new files, all under `docs/reviews/web-apprail-order-recovery-native/`: the runner, 2 logs, 30 screenshots and this receipt. This receipt cannot carry its own hash; the other 33 are listed. Each log's `baseline.fileSha256` records the runner, fixture, prelude and probes hashes; every screenshot's SHA-256 on disk equals its `screenshot` record (30 of 30 re-checked).

| File | Size | SHA-256 |
| --- | --- | --- |
| `verify-native-keyboard-f9eb4b1.mjs` (runner, both modes) | 1,876 lines | `3f2451e915b40fd8d2d1f6f98caee41f68deb823d8b4232df2f882d35ea08bab` |
| `native-f9eb4b1-fixed1-keyboard-en.log` | 915 lines, 819,533 B | `b5414fcd713a7db5865b7db8c68384c5177c32f8ac1cee90387c8249dbfdfdf3` |
| `native-f9eb4b1-fixed1-keyboard-zh.log` | 941 lines, 817,717 B | `1a45d17021f7a735917480a8dd403f877d6a8caa8cadb89210a8d1c1cf9a332c` |
| `native-f9eb4b1-fixed1-keyboard-en-act-en-failed-enter-after-discard-trigger-focused.png` | 99481 B | `77d3a0d30394c1b1c78311bfe183d02b7c54ec4d233d23450fe44646a34de11d` |
| `native-f9eb4b1-fixed1-keyboard-en-act-en-failed-enter-panel-open-export-focused.png` | 111986 B | `2836376ccb8b7992ac5dc1b0e70885ed1ed4d412b282bfb2886e170b9214c4ae` |
| `native-f9eb4b1-fixed1-keyboard-en-act-en-failed-enter-panel-open-retry-focused.png` | 111991 B | `41ff533cdd6fdf3394dcf92b1d33cf1e3d57f8c02ef2e34caca9d27eef28a58b` |
| `native-f9eb4b1-fixed1-keyboard-en-act-en-failed-enter-status-focused.png` | 103174 B | `beae2e6ba53b92969bd547e81171757561e79699b265fbd0f214cb528e6fa4ca` |
| `native-f9eb4b1-fixed1-keyboard-en-act-en-retry-success-enter-after-retry-trigger-focused.png` | 99441 B | `2525b490286320b419ae5e583345a56fec3b1860e33b7bcf9febdf2afd3349e0` |
| `native-f9eb4b1-fixed1-keyboard-en-act-en-source-enter-after-reload-trigger-focused.png` | 99400 B | `83e5b91220dfe20d521d729d0e375bd1b96a65312cafbd311d072e35e7981ab1` |
| `native-f9eb4b1-fixed1-keyboard-en-act-en-source-enter-panel-open-reload-focused.png` | 113894 B | `b6ae7f11322f1db27eb3c218609dd7aa29f40f66df130216c77b38d943b8fde2` |
| `native-f9eb4b1-fixed1-keyboard-en-failed-open-dark-end-retry-focused.png` | 96391 B | `7318cc1d3f2b12d222b7800b9e805393a7d40444e04482dea6c8cf892adb5539` |
| `native-f9eb4b1-fixed1-keyboard-en-failed-open-light-end-retry-focused.png` | 93279 B | `766079c85ccaaf7a35a610334f38b05aa227279da33e5ffb40381d28622142d4` |
| `native-f9eb4b1-fixed1-keyboard-en-order-en-failed-panel-open-export-focused.png` | 104717 B | `daa7fe25f1245171e8432174885f0412ff4c97c98ce80b28465b00fd07346937` |
| `native-f9eb4b1-fixed1-keyboard-en-order-en-source-panel-open-reload-focused.png` | 97896 B | `183b48905e9c85e45ac182c070a1269ba419f03412e3d82e040f332b844e552f` |
| `native-f9eb4b1-fixed1-keyboard-en-source-open-dark-end-reload-focused.png` | 99187 B | `44fba4801e4e669a570ce505cbddc0dce7c18516b13b288cb6a03b6d985c534b` |
| `native-f9eb4b1-fixed1-keyboard-en-source-open-light-end-reload-focused.png` | 96020 B | `57e7c0587ed24d2e20c8969829b17c9b0e88e4754f5f1117bbb75fc66f15ca08` |
| `native-f9eb4b1-fixed1-keyboard-zh-act-zh-failed-enter-after-discard-trigger-focused.png` | 34197 B | `60fa133f2318b1944a49fd65aa4bab47434f878600cddb4c476fd216ea5612ef` |
| `native-f9eb4b1-fixed1-keyboard-zh-act-zh-failed-enter-panel-open-export-focused.png` | 41319 B | `b11d1a1e28a1def6266080fe38f3b0160b1bbb3b5952cc25e5f075d611557b90` |
| `native-f9eb4b1-fixed1-keyboard-zh-act-zh-failed-enter-panel-open-retry-focused.png` | 41329 B | `1e5c0c9cfff02c05e9c3be2f66b1980768793129c913deb58fe7e10f468b5d69` |
| `native-f9eb4b1-fixed1-keyboard-zh-act-zh-failed-enter-status-focused.png` | 35822 B | `bbf4645f4911bea6de4f6752eb760d748d4db26d8dfeb5d6e567218c5ef0b717` |
| `native-f9eb4b1-fixed1-keyboard-zh-act-zh-retry-success-enter-after-retry-trigger-focused.png` | 34229 B | `aeb45d73d07742e928fe284cfc8ba1e536bef52f7582c462de7f151df41ba008` |
| `native-f9eb4b1-fixed1-keyboard-zh-act-zh-source-enter-after-reload-trigger-focused.png` | 34626 B | `697b79e48a807464dc42a665555e5a56d0208bb9535631e6b9ecf5b2781e863d` |
| `native-f9eb4b1-fixed1-keyboard-zh-act-zh-source-enter-panel-open-reload-focused.png` | 45590 B | `a648d77f1ce773388d145b146bf0a148ecd3c42d7e03a8e010c86f7d51616d0c` |
| `native-f9eb4b1-fixed1-keyboard-zh-failed-open-dark-end-retry-focused.png` | 46453 B | `ce99c099bf1d2bdb28b1b50c028b2f9f739f0ed92b6c880303f25f932f619410` |
| `native-f9eb4b1-fixed1-keyboard-zh-failed-open-light-end-retry-focused.png` | 45988 B | `88f13fd6b74ee9022b75308c951d73cbffc3c408646d01dd3455d70a212fbc21` |
| `native-f9eb4b1-fixed1-keyboard-zh-order-zh-failed-panel-open-export-focused.png` | 53070 B | `de07690fefc76d6d149bd0a122f996e6fbeefd8dbaa5df6ecc80496d1720ca1b` |
| `native-f9eb4b1-fixed1-keyboard-zh-order-zh-source-panel-open-reload-focused.png` | 54028 B | `ccaf38797dfd8fe7dfdd156430e477667dedbc2e0ef8d1ce4cbb7de7f2bc6583` |
| `native-f9eb4b1-fixed1-keyboard-zh-source-open-dark-end-reload-focused.png` | 49905 B | `ca8ecc0b867d8688e93d21631a3f99d896b9c162ba8622994a1207aae413858e` |
| `native-f9eb4b1-fixed1-keyboard-zh-source-open-dark-weak-stop2-sidebar-focused.png` | 45615 B | `f2cac5c41f5db9af264f93b38ed140ad288ba78270eebaa85809a585b12daef9` |
| `native-f9eb4b1-fixed1-keyboard-zh-source-open-dark-weak-stop3-sidebar-focused.png` | 45620 B | `b8020f1097c6303b6bad34e84f84262f2c69c330430bafb93f1eb0c51793bbd4` |
| `native-f9eb4b1-fixed1-keyboard-zh-source-open-light-end-reload-focused.png` | 49530 B | `1645cc4485f2f20a44e29aea5bf0fce6e983774182c3f98d668266613bf649f2` |
| `native-f9eb4b1-fixed1-keyboard-zh-source-open-light-weak-stop2-sidebar-focused.png` | 45312 B | `4f4e552155568bfea1c13a030000df023c005f0e196799d19a2d3ceeea898d4b` |
| `native-f9eb4b1-fixed1-keyboard-zh-source-open-light-weak-stop3-sidebar-focused.png` | 45319 B | `a00c619159c749eb61a7b7f9499fbbe7cb404d0bfb3474d521ba3a5c592cd1df` |

**Reused read-only and hash-checked in every run** (preconditions `baseline:frozen-apprail-native-conventions-unchanged` L14, `baseline:frozen-appearance-keyboard-conventions-unchanged` L15):

| File | Role | SHA-256 |
| --- | --- | --- |
| `native-fixed-app.tsx` (batch 61) | production App fixture, **bundled unchanged** | `a86425af2715a3cb81100a87c413c76d75378f9e500ea575eb23b5d299e77d2d` |
| `native-fixed-prelude.js` (batch 61) | instruments, **served unchanged** | `4d731278ce6b88a9fa9304926177b248e307341bae180cbe59749bbac2eeb239` |
| `verify-native-downstream-visual.mjs` (batch 62) | infrastructure text copied from it | `55b49d119f012c6395c0aaf9588695bdb7d60d27ec3c587167c9527a3d999b4e` |
| `native-downstream-visual-app.tsx` (batch 62) | checked only | `c6cb18a9ea3c221191a8560825c1610df691d56605a09ba00c9db588988684c7` |
| `verify-native-fixed.mjs` (batch 61) | checked only | `f062e723b862b332f32f39bf02bf6951b4918a8af5bda8e42f4b69a03aa0f6d7` |
| `verify-native-before.mjs`, `native-before-app.tsx`, `native-before-prelude.js` (batch 58) | checked only | `ccabd500…a84e`, `fa70e2eb…a7e`, `a4ba3781…f635` |
| `../web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs` (batch 48, `bacdbbc`) | **the frozen `pixelFocusWalk` oracle** | `5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4` |
| `../web-appearance-recovery-native/native-visual-keyboard-probes.js` (batch 46) | read-only probes the oracle calls (`window.__visual`), **evaluated unchanged** after each mount | `4df16575470d739d1655f32cd1bb0101c2b772552439f3ecfefded4f87bc02c4` |
| `../web-appearance-recovery-native/verify-visual-keyboard-419e56d.mjs` (batch 50) | precedent, checked only | `d5fc3262ebd5c0b1c1c95b28d7866b7301190186653991ffb3b8cf0fdc976bcf` |

## 3. `pixelFocusWalk` identity proof

The runner contains the frozen oracle block spliced byte for byte from the frozen file: from the line `/** A minimal PNG decoder (8-bit …` through the closing brace of `pixelFocusWalk` (298 lines, 21,749 bytes: `decodePng`, `rgbaSha256`, `PIXEL_MARGIN`, `B48_PAGE_HELPER`, `shotViewportClip`, `stableViewportClip`, `crop`, `pixelSelfTests`, `compareFocusBand`, `pixelSelfTested`, `pixelWalkLog`, `pixelFocusWalk`). Every run extracts that block (both anchors at the start of a line) from its own source and from the frozen file and records (`baseline.oracleIdentity`, L8):

| Item | SHA-256 |
| --- | --- |
| Frozen file at HEAD = `git show bacdbbc:docs/reviews/web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs` | `5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4` (both) |
| Oracle block, frozen file = runner | `e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43` (both; `blockBytesEqual: true`) |
| `async function pixelFocusWalk(…) { … }` alone (6,395 bytes), frozen file = runner | `1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620` (both) |

Preconditions `baseline:oracle-file-equals-its-commit-bacdbbc` (L16) and `baseline:pixel-focus-walk-oracle-block-byte-identical-to-the-frozen-file` (L17) pass in both runs. The oracle's free names (`evaluate(expression, page = main)`, `press`, `parkMouse` at (2, 2), `clickAnchor`, `pageOffset`, `saveShot`, `pre`, `checkDeferred`, `observe`, `record`, `PANE`, `KEYBOARD_WIDTH`, `HEIGHTS`, `currentWidth`, `short`) are bound by the runner with the 5bbf473 runner's signatures and semantics. Disclosure: the batch 50 runner's copy differs from the frozen block by one added `progress(…)` line; the frozen 5bbf473 block was used, not the 419e56d copy.

The oracle's own self-tests passed once per run (EN L56–L58: PNG decoder equals the browser's decoding, 429 colours; page-coordinate clips exercised with the window scrolled 158 px. ZH: 446 colours; the window cannot scroll at 375, as in batch 50).

## 4. Harness and provenance

- **Archives, guard, pinning.** `git archive` of `f9eb4b1` and `419e56d` per run; an esbuild plugin pins every `@repo/*` specifier to the archive's package export and fails the build on any module from the `packages/`, `apps/` or `docs/` tree of either checkout. `fixed` bundle js `423a1dd1a1c3b6b20ab1b9c889e6dde9c8d57be9c38f8f41cf7cc3e136595eb3`, css `b22bbfdd…2cdc` (equal to batch 62's fixed css), 1,022 inputs (630 archive, 390 third-party), 0 foreign, 0 guard violations, 319 pinned specifiers, 46/46 required modules from the archive (the contract §9 composition plus `PremiumTierBadge.tsx`, `usePremiumTier.ts`, `tokens.css` and the five rail-order modules). `before` js `ae78994a…cb9c`, css `f31c5664…7307` (equal to batch 62's), 1,017 inputs (625 archive), 0 foreign, 41/41 required. Identical in both runs.
- **Composition.** The batch 61 fixture unchanged: `apps/web/src/main.tsx` module order, the production router, `AccountStorageGate`, `AccountDataGate`, Shell (AppRail, Topbar), DesktopPet, CmdK, ComposedSettings with the coordinator; **only the auth session is synthetic**. Seeds are in-domain (account marker, `xai_pref_lang` `"zh"`, `xai_pref_theme` `"dark"`, the premium tier stub at the account's generation key for the badge) except `{}` and an unreadable read for the source issue.
- **Route and states.** Every keyboard document is `/app/settings/appearance` (the oracle's self-test needs the hue slider; it is also the 419e56d precedent's walk route). Pet hidden through the product's own rail pet toggle by a trusted, centre-hit click: EN mounts at 1024; ZH mounts at 1440, toggles, makes any draft, then resizes to 375×812 with mobile emulation (no stored `top` rail position; unzoomed visual viewport gated). Scrollers moved by the toggle click are returned to 0 (recorded). Failed drafts are made by one trusted CDP drag (`Input.setInterceptDrags` + `dispatchDragEvent`, every drag event trusted, one drop inside `.rail-items`) under an armed quota fault, D0[0] dropped on D0[2] over the default order (absent bytes).
- **Keys (K-1).** `Input.dispatchKeyEvent` without `nativeVirtualKeyCode`: Tab, Shift+Tab (modifier 8) and Escape as `rawKeyDown`/`keyUp`; Enter and Space as `keyDown` with `text` (so keydown, keypress, keyup). The seed-page self-test checks one Escape is exactly keydown+keyup and one Enter and one Space are exactly keydown+keypress+keyup each. At every document change and at the end, each document's passive capture-phase trace must equal the runner's own presses exactly, in order and trusted (`run:k1-keyboard-trace-contains-only-the-runner-key-presses`, EN L910, ZH L936). By key, EN/ZH: Tab 885/863, Shift+Tab 10/10, Enter 15/15, Space 14/14, Escape 4/4.
- **Gates.** 18 row gates per run (history counters `{push, replace, popstate, commits}` all 0 and a runtime-error gate per document segment). Runtime errors: the only entry per run is the prelude self-test's own positive control on the product-free seed page (excluded by exact text and source); 0 exceptions, 0 console errors and 0 console warnings in the product (`run:zero-runtime-errors-in-the-fixed-product`, EN L914, ZH L940). 5 dialogs per run, all `beforeunload` on runner-initiated navigation away from drafted documents (accepted); 0 unexpected (EN L911, ZH L937).

## 5. Results

Line numbers are EN / ZH.

### 5.1 Tab order and DOM order (section `order`; 20/20 per language)

State: rail failed draft + Appearance draft (theme Dark, write denied) + premium badge; then a source issue (`{}`) + premium badge. A trusted full Tab cycle from the pane title; on reaching the rail status a trusted **Enter** opens its panel and the cycle continues.

| Check | EN | ZH |
| --- | --- | --- |
| `.topbar-controls` children: `premium-tier-badge`, `appearance-status`, `rail-order-status` root, `topbar-pref` (source: without the Appearance status) | PASS | PASS |
| Premium badge is a `span`, `tabIndex −1`, not a Tab stop | PASS (L534) | PASS (L560) |
| Full cycle (69 and 62 stops EN; 67 and 60 ZH) equals the DOM order of tabbable controls with the panel open | PASS (L544, L585) | PASS |
| Topbar stops in order: search → Appearance status → rail status → Retry → Discard → Export → appearance trigger (source: search → rail status → Reload → trigger) | PASS (L542, L583) | PASS (L568, L609) |
| Enter on the status during the cycle opens the panel once (1 trusted click), focus stays on the status | PASS (L540, L581) | PASS |
| Every stop matches `:focus-visible` with a painted computed outline; new controls `solid 2px`, offset 2 px | PASS | PASS |
| Shift+Tab from the trigger walks the Topbar in exact reverse (Export, Discard, Retry, rail status, Appearance status, search) | PASS | PASS |

### 5.2 Enter, Space, Escape and the focus targets (section `activate`; 61/61 per language)

Each row is one trusted key press on the focused control; "clicks" counts every click event after the press (trusted and untrusted), "frames" is a `requestAnimationFrame` sampler of `document.activeElement` from just before the press until settled.

| Action (key) | Effect after the press, EN and ZH | Focus |
| --- | --- | --- |
| Status: Enter, Enter, Space, Space | open, closed, open, closed; 1 trusted click each on the status; 0 set/remove on any key, 0 rail attempts; the open panel is the "was not saved" panel; Space: every scroller unchanged | stays on the status (`:focus-visible`) |
| Space scroll positive control | Space with focus on the pane title (batch 46 removable `tabindex`) scrolls `.module-settings` by 449 px (EN) / 652 px (ZH) | — |
| Escape from Retry (panel open) | panel closes, 0 clicks, 0 mutations | returns to the status button |
| Escape on the status (panel open) | panel closes | stays on the status button |
| Retry with the fault armed: Enter, then Space | exactly 1 click and 1 `setItem("xai_rail_order")` attempt each, refused (`denied-quota`); the failed status and panel remain | **stays on Retry** in every frame (25–52 frames, 0 on `<body>`) |
| Export: Enter, then Space | exactly 1 trusted click, 1 object URL, 1 anchor click and 1 downloaded `rail-order-draft.json` each, equal to the set envelope of the draft (deep equality); 0 storage mutations; anchor removed | **stays on Export** |
| Discard: Enter (doc 1), Space (doc 2) | 1 click, 0 set/remove attempts; status unmounts; rail shows the committed (default) order | **`.topbar-pref-trigger`**; frames `discard+status → trigger`, 0 on `<body>` |
| Retry after the fault is lifted: Enter (doc 3), Space (doc 4) | 1 click, exactly 1 successful `setItem` with the A2 merge bytes; status unmounts | **`.topbar-pref-trigger`**; frames `retry+status → trigger`, 0 on `<body>` |
| Reload, `{}` not yet repaired: Enter | 1 click, 0 writes, a read; source status and panel kept | stays on Reload (recorded; not `<body>`) |
| Reload after a product-free second document wrote a valid order: Enter | 1 click, 0 writes; committed order displayed; status unmounts | **`.topbar-pref-trigger`**, 0 `<body>` frames |
| Reload while the read is denied: Space | 1 click, the read denied, 0 writes, status kept, no scroll | stays on Reload |
| Reload after the read fault is lifted: Space | 1 click, 0 writes, committed order displayed, status unmounts, no scroll | **`.topbar-pref-trigger`**, 0 `<body>` frames |

Key-activation records: EN L637–L901, ZH L663–L927. Focus stayed on Reload when the second document closed (recorded, EN L863, ZH L889), so no re-anchoring was needed.

### 5.3 Per-stop pixel focus walks (section `walks`; 84/84 per language)

The frozen oracle, unchanged: each stop captured focused and after focus moved on, both as stable aligned frames; its own region (outline band plus box, excluding the next stop's ring) must differ and its computed outline must not be `none`. Clean, failed draft with the panel closed, failed draft with the panel open (anchor inside the panel, its message, so the anchor's mousedown never closes it), source issue with the panel open; light and dark; plus the clean walk at 419e56d as the control. Every walk's oracle checks (full cycle in stable aligned frames, cycle = DOM order, every stop visible) pass.

| Walk | EN stops / failed | ZH stops / failed | New stops: own pixels changed, light / dark (EN; ZH) |
| --- | --- | --- | --- |
| control 419e56d clean, light / dark | 59 / 0, 59 / 0 | 57 / 0, 57 / 0 | — |
| clean, light / dark | 59 / 0, 59 / 0 | 57 / 0, 57 / 0 | none (stop list equals the control's, in order) |
| failed, panel closed | 60 / 0, 60 / 0 | 58 / 0, 58 / 0 | status 876 / 873 of 8,586; 413 / 412 of 2,646 |
| failed, panel open | 63 / 0, 63 / 0 | 61 / 0, 61 / 0 | Retry 431 / 428 of 3,976; Discard 491 / 488 of 4,816; Export 555 / 551 of 4,704; status 936 / 933 of 8,856 — ZH Retry 489 / 393, Discard 393 / 464 of 3,584; Export 483 / 483 of 3,864; status 504 / 501 of 3,024 |
| source, panel open | 61 / 0, 61 / 0 | 59 / 0, 59 / 0 | Reload 563 / 559 of 4,816; status 972 / 969 of 9,342 — ZH Reload 591 / 591 of 5,376; status 504 / 501 of 3,024 |

- Totals: EN 604 stop captures, ZH 584; 0 failed. New-stop band ratios 0.28–0.35; outlines `solid 2px` offset 2 px, `oklch(0.57 0.085 165 / 0.58)` light and `oklch(0.72 0.085 165 / 0.58)` dark.
- Product checks per fixed walk: exactly this state's new stops are in the cycle; each new stop visible by pixels; the Topbar stops in order (search, status, panel actions, trigger); the pre-existing stops are exactly the 419e56d control's stops; every pre-existing stop visible where it is visible at 419e56d.
- Clip identity with the control (recorded, not judged): EN clean 52/59 (light) and 54/59 (dark) clip pairs byte-identical to 419e56d; ZH 46/57 and 53/57. The differing pairs are pane, rail and sidebar stops whose visibility verdict is equal in both products.

**Weak stops (oracle criterion: visible but < 15 % of the ring band changed), with values:**

| Language | Walks | Stop | Fixed values (own diff / pixels; band diff / pixels; ratio) | 419e56d control, same stop | Cause |
| --- | --- | --- | --- | --- | --- |
| EN | all | — | none | none | — |
| ZH | clean, source-open (light/dark) | `rail:任务` (first bottom-rail item) | 81–82 / 2,209; 0 / 0; 0 | identical (81–82 / 2,209) | ring clipped by the rail scroller (UX-05, known) |
| ZH | failed closed/open (light/dark) | `rail:项目板` (first bottom-rail item after the drop moved Tasks to third) | 81–82 / 2,209; 0 / 0; 0 | 177–178 / 2,491; 0.34 (it is the second item there) | the same clipped first position (UX-05, known) |
| ZH | source-open light and dark | `sidebar:账户` | 309 / 8,400; 307 / 2,064; **0.149** | 720 / 8,400; 0.346 | **covered by the open panel (F-E14-1)** |
| ZH | source-open light and dark | `sidebar:会员` | 311 / 8,792; 308 / 2,413; **0.128** | 835 / 8,792; 0.341 | **covered by the open panel (F-E14-1)** |

**F-E14-1 (observation for a controller ruling; not gated, not a stop condition).** At 375 px the open panel is `position: fixed` under the Topbar (12→363 × 60→179.13 px for the source panel, whose message wraps to two lines; 60→159.56 px for the failed panel). It is non-modal, so Tab leaves it while it stays open. When the walk reaches the first two settings-sidebar rows with the settings scroller at its top, they sit under the panel: the stop box 34→179.5 × 136→180 has 6,275 of 6,402 px² under the panel, and its centre hits the panel (records `weak-stop-diagnostic`, ZH L255, L259, L492, L496; screenshots `…-source-open-{light,dark}-weak-stop{2,3}-sidebar-focused.png`). Only the bottom edge of the focus ring remains visible. With the failed panel the same rows are about half covered (clip overlap 5,571 of 10,624 px², band ratio 0.171 / 0.166, just above the threshold; ZH L208, L445). At 1024 the panel is `absolute` under the status and no pre-existing stop is weak (EN L204, L246). The frozen oracle passes these stops (own pixels differ, outline painted), and the contract asks only that pre-existing stops pass as at 419e56d and that weak stops be reported, so E14 passes. Whether a focused control almost entirely hidden by the open non-modal panel is acceptable (cf. WCAG 2.4.11/2.4.12 "Focus Not Obscured") is a product decision; this caller's panel placement at ≤767 px was accepted in the E6 ruling D6 and E13.

## 6. Screenshot review (executor, opened)

| Screenshot(s) | Conclusion |
| --- | --- |
| `…-act-{en,zh}-failed-enter-status-focused` | Amber rail status in the Topbar with the focus ring; panel closed |
| `…-panel-open-retry-focused`, `…-panel-open-export-focused` | "Sidebar order was not saved." / "侧栏顺序未保存。" with Retry/Discard/Export (重试/放弃/导出); the focused action carries the ring |
| `…-after-discard-trigger-focused`, `…-after-retry-trigger-focused`, `…-after-reload-trigger-focused` | No status; the ring is on the appearance trigger (`EN · Light · Comfortable` / the ZH icon trigger) |
| `…-source-enter-panel-open-reload-focused`, `…-source-open-*-end-reload-focused` | The unavailable message and a single focused Reload / 重新读取; dark variants legible |
| `…-failed-open-*-end-retry-focused` | Panel open after the full walk, focus back on Retry |
| `…-order-{en,zh}-failed-panel-open-export-focused` | Premium (stub) / 高级版（演示） badge, Appearance status, rail status, trigger in that order; Export focused. At 375 the search box is squeezed to about 100 px and its placeholder wraps (observation below) |
| `…-order-{en,zh}-source-panel-open-reload-focused` | Badge, rail status, trigger; Reload focused |
| `…-zh-source-open-*-weak-stop{2,3}-sidebar-focused` | F-E14-1: the focused 账户/会员 row lies under the open source panel; only its lower ring edge shows |

**Observation (not judged, outside E14):** with the premium badge and both statuses visible at 375 px, the Topbar search box shrinks to about 100 px and its placeholder wraps. E13 judged both statuses without the badge (the badge is pre-existing, shown only for the premium stub tier); no 419e56d reference with the badge was taken here.

## 7. Commands

From the worktree root; the dependency root was used read only; `XAI_NATIVE_TMPDIR` was the session scratchpad and each run deleted its archives, profile, downloads and bundles (the temp directory was empty afterwards).

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop XAI_NATIVE_TMPDIR=<scratchpad>/tmp \
  node docs/reviews/web-apprail-order-recovery-native/verify-native-keyboard-f9eb4b1.mjs f9eb4b1 keyboard-en fixed1  # PASS checks=765 product=167 preconditions=598 exit=0
  ... f9eb4b1 keyboard-zh fixed1   # PASS checks=791 product=167 preconditions=624 exit=0
```

Exit codes: 0 harness valid and every product check passes; 2 harness valid with a product failure; 1 harness invalid. The runner refuses an existing log or any file with the same prefix, writes with `wx`, preserves non-zero codes, and refuses `XAI_NATIVE_ONLY` unless evidence is redirected outside the repository; the committed runs record `rowFilter: null`. After the runs no Chrome with `--remote-debugging-pipe` and no runner process remained.

## 8. Deviations and disclosures

1. **Walk route.** All walks run on `/app/settings/appearance`, because the frozen oracle's self-test probes the hue slider and the 419e56d precedent walked that route; the walks therefore also cover the Appearance pane, the settings sidebar, the rail and the Topbar.
2. **Panel-open walk anchor.** The oracle's anchor parameter is the panel message (non-focusable, inside the status root), so the anchor click does not close the panel; the clean and panel-closed walks use the oracle's default anchor (the pane title). The panel itself was opened by a trusted click before panel-open walks (setup only; keyboard toggling is judged in §5.1–5.2).
3. **Topbar anchor.** Activation documents start Tab from a trusted click on a non-focusable point of `header.topbar` (the F-APP-3 procedure of batch 50); the path was search → rail status in every case.
4. **Space-scroll positive control** uses the batch 46 probe's removable `tabindex` on the pane title, focused by script, as in batch 50.
5. **Premium badge** shown by seeding the account-owned `xai_pref_premium_tier` = `premium_stub` and `xai_pref_premium_started_at` = now at the synthetic account's generation key; in-domain bytes. The badge is not focusable, so it is checked in DOM order and as a non-stop.
6. **ZH drafts made at 1440** before the resize to 375 (the pet toggle is hidden at ≤767 px); the draft lives in App memory across the resize.
7. **Additive, recorded-only diagnostics** in the runner (not part of the frozen oracle): the weak-stop refocus with geometry and screenshot, and the panel-overlap table. They add trusted Tab presses, all inside the key audit.
8. **Development probes** (all with `XAI_NATIVE_EVIDENCE_DIR` in the session scratchpad and `XAI_NATIVE_ONLY`; none committed or cited as evidence):

| Probe | Mode / sections | Outcome | Change afterwards |
| --- | --- | --- | --- |
| dev1 | EN order | PASS 22/22 | None |
| dev2 | EN activate | PASS 63/63 | None |
| dev3 | EN walks | PASS 86/86 | None |
| dev4 | ZH order, activate | PASS 83/83 | None |
| dev5 | ZH walks | PASS 86/86; found the weak `sidebar:账户`/`会员` stops in source-open | Added the recorded-only weak-stop diagnostic and the 419e56d control values for weak stops |
| dev6 | ZH walks | HARNESS-FAIL: two diagnostic screenshot names collided after stripping Chinese characters (`screenshot:…:not-overwritten`) | Added the stop index to the screenshot name |
| dev7 | ZH walks | PASS 86/86 | Added the recorded-only panel-overlap table |

Before dev1, the oracle block was spliced in and its identity checked; the first extraction rule matched the runner's own string literals, and it was anchored to line starts before any run. Between the probes and the authoritative runs, no assertion was weakened and no expected value was taken from a probe.

## 9. Limitations

- Headless Chrome 155 on macOS, not Tauri; synthetic auth session; development build without StrictMode; dependency tree reused read-only behind the lockfile gate.
- The weak-stop judgement is the frozen oracle's (own-region pixels differ, outline not `none`); F-E14-1 is recorded for a ruling, not judged.
- Not covered here: E15–E25 and final acceptance. No keyboard reorder exists or was added (§17).
