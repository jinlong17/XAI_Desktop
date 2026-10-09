# AppRail order native downstream and EN/ZH five-width visual (CP-APPRAIL-01, batch 62, contract r1 §15 E12, E13)

**Verdict: PASS for E12 and PASS for E13.** Three modes, one authoritative run each (`fixed1`), all harness-valid, zero failed product checks, zero `PRECONDITION` failures, zero product runtime errors:

| Mode (E-item) | Scope | Product checks pass/total | Preconditions | Exit |
| --- | --- | --- | --- | --- |
| `downstream` (E12) | §10 items 1–7, host row m | 1081/1081 | 3627 | 0 |
| `visual-en` (E13, EN) | §9 responsive presentation, R-PET, sizing/CSS, screenshots | 538/538 | 1813 | 0 |
| `visual-zh` (E13, ZH) | the same in ZH (the R-1 screenshot sequence is EN only, as §9 asks) | 529/529 | 1777 | 0 |

No real product failure, oracle/contract contradiction or irreproducible harness was found. **Clean-state chrome is invariant against `419e56d`** (312 of 312 comparisons identical, method in §4), so the §13 rerun trigger for other callers' visual and keyboard evidence does not fire.

This is verification only. It changes no product source, product test, contract, oracle, ledger, control plane or existing evidence. The frozen before files and the batch 61 runner, fixture and prelude in this directory were read only; every run re-checks their SHA-256 (precondition `baseline:frozen-before-conventions-unchanged`). It accepts nothing and closes no 312 item. E14 and later items stay open.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5, parent native verifier role, isolated worktree `.claude/worktrees/agent-a32d61150ebc2839e`. It wrote neither the contract, the before oracles, the implementation, nor batches 56–61 |
| Docs base (detached HEAD) | `6fad75d242f8b96a2e318ab1de3e7f7ae7a221e1` (control plane batch 62); every log's `baseline` line records `docsHead` |
| Fixed revision | Requested `f9eb4b1`, resolved `f9eb4b1f207bc4b46f547b90afc250424b3c8695` (precondition `baseline:requested-revision-resolves-to-the-fixed-sha`), tree `05887cf113639116b228a25041a37b3d5c69a322` |
| Compare revision | `419e56de9f23e4467fea806fbd4a990e1f429941` (every mode bundles it as the `before` variant) |
| Product delta | `git diff --name-only f9eb4b1 HEAD -- apps packages package.json pnpm-lock.yaml` empty; `419e56d..f9eb4b1` exactly the 19 E6 files; the 13 contract r1 source rows: 7 unit rows changed, 6 protected rows equal; the 419e56d archive equals all 13 |
| Authority | Contract r1 `../web-apprail-order-recovery-contract/contract.md` (SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`, re-derived at HEAD by every run): §5, §9, §10, §13, §15 E12–E13. Control plane "本轮唯一任务" (batch 62) and the CP-APPRAIL-01 rows (batch 61 receipt and rulings) |
| Browser / toolchain | `Chrome/155.0.8059.39` headless (`--headless=new`), DevTools pipe transport, Node v24.16.0, esbuild 0.28.1, react 19.2.0, react-dom 19.2.0, react-router 7.15.1. DPR 1 |
| Lockfile gate | `df05f2dd…9aeab9` in six places: dependency root (main checkout, read only), `git show` of both revisions, both extracted archives, the contract constant |
| Iterations | One authoritative run per mode (`fixed1`, 1 of 3). Development probes are disclosed in §8 |

## 2. Files and SHA-256

49 new files, all under `docs/reviews/web-apprail-order-recovery-native/`. This receipt cannot carry its own hash; the other 48 are listed. Each log's `baseline.fileSha256` records the runner, fixture and prelude hashes.

| File | Size | SHA-256 |
| --- | --- | --- |
| `verify-native-downstream-visual.mjs` (runner) | 2692 lines | `55b49d119f012c6395c0aaf9588695bdb7d60d27ec3c587167c9527a3d999b4e` |
| `native-downstream-visual-app.tsx` (production App fixture) | 209 lines | `c6cb18a9ea3c221191a8560825c1610df691d56605a09ba00c9db588988684c7` |
| `native-f9eb4b1-fixed1-downstream.log` | 5220 lines | `0da57fcf6c0ba55a1b224904bf454cab8dc46011bce7364ff3440b13a923d789` |
| `native-f9eb4b1-fixed1-visual-en.log` | 2649 lines | `3c42c0a1efcc9b509d1422aaa2ef3c76a8b376dc2317b5d8394722526da78345` |
| `native-f9eb4b1-fixed1-visual-zh.log` | 2598 lines | `aafdddaa78ab65192c812b195967b4c1b2960924c6e3d6accfd7714c8bea15aa` |
| `native-f9eb4b1-fixed1-downstream-bytes-one-hidden-device-recovery.json` | 1917 B | `3d97a472b77bf1ec70beae26ba43a73d8cb2a9cce34200d4a7c3eea4e38ab701` |
| `native-f9eb4b1-fixed1-downstream-bytes-one-hidden-zh-device-recovery.json` | 2092 B | `152c81d4183283d5508c74e9fb991d8f225fa004aa293b8d81bf91a71c55aa05` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-1440-left-all-custom-419e56d.png` | 171365 B | `82ca5c7dd072c9b92a99bbabed4066225065143dd31ee8e700e07487f9e72aca` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-1440-left-all-custom-fixed.png` | 171365 B | `82ca5c7dd072c9b92a99bbabed4066225065143dd31ee8e700e07487f9e72aca` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-1440-left-all-custom-popover-open-419e56d.png` | 189761 B | `203d8039b87678b8053fbe04c6f52e25febd9c92cd4106dd0bed1dc769c8ab03` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-1440-left-all-custom-popover-open-fixed.png` | 189761 B | `203d8039b87678b8053fbe04c6f52e25febd9c92cd4106dd0bed1dc769c8ab03` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-1440-left-boards-hidden-absent-419e56d.png` | 171079 B | `6475b60818d1a1d8e7c71dc2f9296f92445926a394b1428f73d6d876de0d5934` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-1440-left-boards-hidden-absent-fixed.png` | 171064 B | `1a44b588c840fad6e5a8a372da5c3af28cd7a960a7a5864459b30953f53ccc5c` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-1440-top-all-custom-419e56d.png` | 159392 B | `94fa4b20389983cc14cd4d5c162770337da472ad6e0839a1dcae4866561b51a5` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-1440-top-all-custom-fixed.png` | 159392 B | `94fa4b20389983cc14cd4d5c162770337da472ad6e0839a1dcae4866561b51a5` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-375-all-custom-419e56d.png` | 35544 B | `6feb034ebf602d3455d46d7e58af6ab3132fde9bf0c21ec904d9da684f406f81` |
| `native-f9eb4b1-fixed1-downstream-chrome-en-375-all-custom-fixed.png` | 35544 B | `6feb034ebf602d3455d46d7e58af6ab3132fde9bf0c21ec904d9da684f406f81` |
| `native-f9eb4b1-fixed1-downstream-chrome-zh-1440-left-all-custom-419e56d.png` | 187218 B | `915fc8ead27811669f625ccdd56e7b189c33c72b853a445d4ba78ba70307d95d` |
| `native-f9eb4b1-fixed1-downstream-chrome-zh-1440-left-all-custom-fixed.png` | 187311 B | `c598b174651cc78eb70d00cb9760a128b7a945680bed73db85794be17ca3ceae` |
| `native-f9eb4b1-fixed1-downstream-chrome-zh-375-all-custom-419e56d.png` | 35373 B | `c27981db82fdf73bfff4c8bd6ff97c3cff33c4fb741f8114d83937b658e02ce3` |
| `native-f9eb4b1-fixed1-downstream-chrome-zh-375-all-custom-fixed.png` | 35338 B | `88c4e1b9e1b1af03a09894c000f18f63beae15ec70513c4d26297d69cbe920d8` |
| `native-f9eb4b1-fixed1-visual-en-before-419e56d-route-error-number-1-1440.png` | 14121 B | `3545932b581ea0eb7c0f9ac5e6d3f6bc7e2d807556cd7b50db2616f23e0ba25a` |
| `native-f9eb4b1-fixed1-visual-en-before-419e56d-route-error-object-empty-1440.png` | 14121 B | `3545932b581ea0eb7c0f9ac5e6d3f6bc7e2d807556cd7b50db2616f23e0ba25a` |
| `native-f9eb4b1-fixed1-visual-en-both-statuses-375.png` | 31508 B | `2fbc43bd9fecb3c0e3ce4913fa063808576a0e24f844dd30ab7998550e9e721d` |
| `native-f9eb4b1-fixed1-visual-en-both-statuses-768.png` | 83088 B | `35804d6bef83e6e6f55850d102df3873974962850c4a53917101d275090dcb0b` |
| `native-f9eb4b1-fixed1-visual-en-drag-preview-1440.png` | 162606 B | `7b04644820ae656999802d6f79e5d93bffdff1ff9d1060e68e734a0ff3edc67c` |
| `native-f9eb4b1-fixed1-visual-en-failed-closed-1440.png` | 165001 B | `32e261b4c893280024ea1c57e678d5e0c32f136156486a3dca29b6598b0d5e4d` |
| `native-f9eb4b1-fixed1-visual-en-failed-closed-375.png` | 31360 B | `55b0dc484c467c9fd97487bda38a919a4e80fb8c26c76b975f7e4bdbd1ff00ca` |
| `native-f9eb4b1-fixed1-visual-en-failed-open-1440.png` | 169192 B | `89ebae6c4667ea36ac978594305168b23fad87beb1654e0d6b6a115aedea422a` |
| `native-f9eb4b1-fixed1-visual-en-failed-open-375.png` | 29977 B | `ff9a76ab0c8b83aa5cdea7788b39665cd2f63f1168569a3a947b8736a6a554a6` |
| `native-f9eb4b1-fixed1-visual-en-peton-failed-open-768.png` | 94021 B | `6dd8f87e301061c2c1d6ad31a811b27801b8f1234c8c3c29c403a21d39924993` |
| `native-f9eb4b1-fixed1-visual-en-r1-en-1440-after-drop.png` | 104106 B | `9a3617f499e0da588e61ab60ec837a9def0362fe90e980d6745486bd8b9a4166` |
| `native-f9eb4b1-fixed1-visual-en-r1-en-1440-after-re-enabling.png` | 103562 B | `a7cc00729ec373d9de8f8699f7412a93dd24bd76be177f82f7ac5af5d5405726` |
| `native-f9eb4b1-fixed1-visual-en-r1-en-1440-boards-hidden.png` | 104097 B | `921ca93183926901e4682463ec7a199b6ed993d2129ede70b2a00514b199a898` |
| `native-f9eb4b1-fixed1-visual-en-source-open-1440.png` | 169231 B | `82fcb4300f34c31ba19df46fda24b537b4a3a0c9d4200c7e6727daa64fb5c7ef` |
| `native-f9eb4b1-fixed1-visual-en-source-open-375.png` | 30903 B | `19c0ccf0cfb0341a0bb30d859e58dc950055711e6f62ee3c9ef6e14d40e9a7ab` |
| `native-f9eb4b1-fixed1-visual-zh-before-419e56d-route-error-number-1-1440.png` | 14121 B | `3545932b581ea0eb7c0f9ac5e6d3f6bc7e2d807556cd7b50db2616f23e0ba25a` |
| `native-f9eb4b1-fixed1-visual-zh-before-419e56d-route-error-object-empty-1440.png` | 14121 B | `3545932b581ea0eb7c0f9ac5e6d3f6bc7e2d807556cd7b50db2616f23e0ba25a` |
| `native-f9eb4b1-fixed1-visual-zh-both-statuses-375.png` | 31603 B | `769098685a7be20530f9207ec993507b528356de2b8db8ec437fee1cba318956` |
| `native-f9eb4b1-fixed1-visual-zh-both-statuses-768.png` | 110921 B | `22c361cfcac8ec1e81372f59b2e5a8741b80d789a21410b733e6967f3a0b8334` |
| `native-f9eb4b1-fixed1-visual-zh-drag-preview-1440.png` | 177409 B | `45bc9fac9abdca7aaa666a0affa3db831f6eb69d083862cf521b65e757f9b696` |
| `native-f9eb4b1-fixed1-visual-zh-failed-closed-1440.png` | 181572 B | `0c4ed233f816595cf7f090e902f1a451083e5b282031ea18817ec0023b8185f6` |
| `native-f9eb4b1-fixed1-visual-zh-failed-closed-375.png` | 31190 B | `857c088b7c28663c4ed267c05195a8b576f8174c1c987acc7831aa27e3b6433f` |
| `native-f9eb4b1-fixed1-visual-zh-failed-open-1440.png` | 187170 B | `1475abcacb238e6965650431c48a8876c6599bff2b2e93254fc82285e8042c6b` |
| `native-f9eb4b1-fixed1-visual-zh-failed-open-375.png` | 29517 B | `95ceb5082596fca4fa227c390aaee335e9e49c93a885b6a8429ad128d39014a9` |
| `native-f9eb4b1-fixed1-visual-zh-peton-failed-open-768.png` | 118149 B | `6fa7a5ed65823a3e97831b4e36ecedbae036db94d8799b781c3e6303d5a1f618` |
| `native-f9eb4b1-fixed1-visual-zh-source-open-1440.png` | 192264 B | `b5013a0e47137033a78310d878aede900b7f544b542b9cebeeb140e397029a90` |
| `native-f9eb4b1-fixed1-visual-zh-source-open-375.png` | 34104 B | `0a592c3ac4e94d1acb6a176b5c49afaa0eb422ae3c90fbc63c76cca2760fcf2a` |

Identical hashes are expected where the frames are identical: the 419e56d route-error page is the same for `{}` and `1` and is not localized (EN = ZH); the chrome pairs that hash equal are pixel-identical frames of both SHAs. The three R-1 screenshots reproduce batch 61's `controls-c-en-1440-*` hashes byte for byte. Three chrome pairs differ in PNG bytes only through the animated DesktopPet (§4).

The batch 61 prelude `native-fixed-prelude.js` (`4d731278…eb239`) is served unchanged and is not a new file.

## 3. Commands

From the worktree root; the dependency root (the main checkout) was used read only (no install, build, dev server or preview tool there). `XAI_NATIVE_TMPDIR` was the session scratchpad; each run deleted its archives, profile, downloads and bundles.

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop XAI_NATIVE_TMPDIR=<scratchpad>/tmp \
  node docs/reviews/web-apprail-order-recovery-native/verify-native-downstream-visual.mjs f9eb4b1 downstream fixed1  # PASS checks=4708 product=1081 exit=0
  ... f9eb4b1 visual-en fixed1   # PASS checks=2351 product=538 exit=0
  ... f9eb4b1 visual-zh fixed1   # PASS checks=2306 product=529 exit=0
```

Exit codes: 0 harness valid and every product check passes; 2 harness valid with a product failure; 1 harness invalid. The runner refuses an existing log or any file with the same prefix, writes with `wx`, preserves nonzero codes, and refuses `XAI_NATIVE_ONLY` (a development section filter) unless evidence is redirected outside the repository; the committed runs record `rowFilter: null`. After the runs no Chrome with `--remote-debugging-pipe` was running and the scratch temp directory was empty.

## 4. Harness and provenance

- **Immutable archives, guard, pinning.** `git archive` of `f9eb4b1` and of `419e56d` per run. An esbuild plugin pins every `@repo/*` specifier to the archive's package export and fails the build on any module from the `packages/`, `apps/` or `docs/` tree of either checkout. In all three modes: `fixed` bundle js `a65c22f476e811a6f9e917cabfde828e1a0a5437d63fc527c0a0f2222a8242d2`, css `b22bbfdd56619021abf6b92c9c808621b993e160d505ac950fa0c0fb360b2cdc`, 1022 inputs (630 archive, 390 third-party), 0 foreign, 0 guard violations, 46/46 required modules from the archive (the batch 61 set plus `dataExport.ts`, `DeviceRecoveryExport.tsx`, `accountPane.tsx`); `before` js `0db20f44eb7ae514119aa6609d2efcd4bf74361c526a9322a9d273334ca79575`, css `f31c566420b660981b6263028756582c3440e4899c7ffd3246bd692bdee37307`, 1017 inputs (625 archive), 0 foreign, 41/41 required.
- **Composition.** `native-downstream-visual-app.tsx` is the batch 61 fixture's body plus exactly two read-only readers on `window.verify` (`legacyGetPref` = the archive's unchanged `getPref("xai_rail_order")`, `deviceRecovery` = its `exportDeviceRecoveryData()`) and their import; precondition `baseline:fixture-is-the-batch-61-fixture-plus-exactly-the-two-readers` checks this line by line on every run. **Only the auth session is synthetic.** No coordinator variant is used in this batch.
- **Instruments.** The batch 61 prelude, served unchanged and self-tested on a product-free seed page (storage tracing and faults with the F-B002 depth counter, dispatch spy, Web Lock tracing, history, beforeunload census, export tracing, confirm recorder, network refusal, passive click/key/drag recorders with `isTrusted`, rail MutationObserver, console.error and error-UI traces). The runner's own read-only probes (geometry, hit tests, frame sampler) are evaluated on demand and never injected before product code.
- **Trusted input.** Clicks through `Input.dispatchMouseEvent` after a centre hit-test (one trusted click each); drags through `Input.setInterceptDrags`, mouse press/move and `Input.dispatchDragEvent` with source and targets centre-hit-tested and uncovered, every recorded drag event trusted and exactly one trusted `drop` inside `.rail-items`. Keys: Escape, Tab, Shift+Tab (Shift as a modifier flag), never `nativeVirtualKeyCode`.
- **K-1.** Every document's key trace equals the runner's own presses: downstream 51 = 51 over 402 documents (L5211), visual-en 27 = 27 over 166 (L2640), visual-zh 27 = 27 over 164 (L2589); 0 untrusted, 0 keypress, 0 mismatches.
- **Network.** 0 non-local attempts (downstream L5210, visual-en L2639, visual-zh L2588).
- **Runtime errors.** Product (fixed variant): 0 exceptions, 0 console errors, 0 console warnings in all three modes (`run:zero-runtime-errors-in-the-fixed-product` PASS; L5218, L2647, L2596). Each log's only fixed-side entry is the prelude self-test's own positive control on the product-free seed page (excluded by exact text and source). The visual logs also hold 4 entries from the 419e56d route-error before captures (the crash under test, never judged as the product). Row gates: downstream 204, visual-en 78, visual-zh 77, all clean.
- **Dialogs.** downstream 2 (the two planned isolation sign-out confirms), visual 22 each (runner-initiated `beforeunload` on leaving drafted documents, accepted). `run:no-unexpected-javascript-dialogs` and `run:every-planned-dialog-was-asked` PASS.

## 5. E12 — `native-f9eb4b1-fixed1-downstream.log`: PASS (1081/1081)

| §10 item | What ran | Result |
| --- | --- | --- |
| **1 Exact bytes** (L35–L630) | Trusted drops (EN unless stated) over: absent bytes (all visible; Boards hidden), `[]`, one hidden (Boards, `board` at index 2; EN and ZH), three hidden (Boards, Matrix, Habits), an unknown id at index 0 plus `settings` at index 6; then a drop over a failed draft back to the committed order | 129/129. Each drop: zero attempts during the gesture, exactly one `setItem` after the drop equal to the runner's own A2 merge (page and DevTools), rail = D(bytes, R), no status. A2 P1–P4 hold for every written value; P6 (all visible: S' = P); P7 (absent: merge over the 12 defaults, hidden Boards keeps default index 1); unknown id and `settings` keep indices 0 and 6. P5: re-enabling every module shows each eligible hidden module at its stored index; the single hidden Boards returns to exactly index 2. Back-to-committed: admitted (one per-key lock request), zero `setItem` (engine verified no-op), draft and status cleared, bytes unchanged |
| **2 Byte compatibility** (same lines; L631–L766) | After each fixed write: a new fixed document and a new 419e56d document read the bytes; the actual Settings → Account "Download device data file" by trusted pointer (EN and ZH). Then 419e56d writes (trusted drags at 419e56d, all visible and with Boards hidden) read by both products in new documents | Legacy `getPref` of both archives returns `JSON.parse(bytes)`; `exportDeviceRecoveryData()` of both archives carries the bytes verbatim (`scope: device-recovery`); both rails display D(bytes, R) with zero writes; the downloaded files (two JSON above, `xai-device-recovery-2026-10-09.json` on disk) carry `xai_rail_order` verbatim among 9 device records and no `xai:` account key. 419e56d-written bytes (all visible: P; Boards hidden: the pruned 13-id array) are displayed by the fixed product exactly as 419e56d displays them (with Boards hidden and with every module visible), with identical reader results, zero writes and no status. 12/12 |
| **3 Display truth** (L767–L891) | One document, per-frame `requestAnimationFrame` sampler of (rail order, status name): success drop, failed drop, failing Retry, Discard, supersession by a drop held behind the real lock, and (second document) Reload after an external repair | 19/19. Preview during the drag = P. Frames after each event (59, 106, 54, 48, 64, 24): after a success every frame shows P with no status; after a failed drop every frame shows the draft and the status never precedes it; after Discard no frame mixes the committed order with the status or the draft without it; after the superseding drop every frame shows the new order with no status (rail and status change in the same frame, one controller); after Reload no frame mixes the repaired order with the source status. Bytes after release = merge over the draft |
| **4 Crash safety at load** (L892–L1831) | All 18 values (§5 item 2's 17 plus a throwing `getItem`): EN on `/app/tasks`, `/app/settings/appearance`, `/app/dashboard`; ZH on `/app/tasks` (72 mounts) | 288/288. App renders, no route error, rail = D(default, R), the source status with its §5 name and visible text (closed), zero writes, bytes unchanged, no unload listener |
| **4 Crash safety, running App** (L1832–L3393) | A product-free second document writes each of the 17 writable values: into an idle field (committed REVERSED) and into a drafted field (failed quota drop, fault then lifted). EN all 17, ZH one per class (5) | 198/198. Idle: trusted storage event, no throw, the field goes to its Reload-only source state with the default order, zero writes, external bytes untouched. Drafted: no throw, the draft stays displayed as a preserved conflict (draft status), Retry by trusted pointer refused again (no successful write, focus stays on Retry), Discard makes zero writes and adopts the committed malformed bytes (default order, source status) |
| **5 Cross-document, host row m** (L3394–L3583) | Two production App documents (A on `/app/tasks`, B on `/app/dashboard`), EN and ZH | 34/34. Idle B follows A's committed drop live (D(M1, R) without reload, trusted storage event, zero writes, no status). Drafted B (failed drop) stays a preserved conflict when A commits M2; B's Retry is refused again (bytes stay M2, focus on Retry); B's Discard adopts M2 with zero writes, focus on `.topbar-pref-trigger`; A unaffected |
| **6 Clean-state chrome invariance** (L3585–L4981; record L4981) | See below | 360/360, 312/312 comparisons identical |
| **7 Cross-module isolation** (L4982–L5209) | Seeded: 8 Features keys (Habits, Matrix off), 7 Appearance keys (non-default), pet id `pip` and position. Ten operations: drag, cancelled drag, failed drag, failing Retry, Export, successful Retry, Discard, Reload (malformed then repaired by another document), sign-out step Cancel, sign-out step OK | 38/38. Every operation: 0 script-dispatched StorageEvents, 0 `web:settings:preference-changed` events, no `key:null` event; every other key byte-identical and never written; `<html>` and `.app` attributes, pet transform and the Features rail set unchanged. Features route truth (`/app/habits` shows `DisabledFeatureFallback`) and search truth (CmdK module rows exclude Habits and Matrix) identical before and after. Sign-out OK: zero rail writes; its non-rail mutations are exactly the 419e56d reference sign-out's (`set:xai:auth:identity-change`) |

**Chrome invariance method (§10 item 6).** For each of 24 configurations — EN/ZH × {1440 left, 1440 `top` (stored `xai_rail_pos`), 375 (mobile emulation)} × {all modules, Boards hidden} × {absent, custom (REVERSED) order} — the same seeded bytes are mounted in both archives on `/app/tasks` with the pet at its default position (no interaction before capture) and compared:

- `aside.app-rail` `outerHTML`; `header.topbar` `outerHTML` with the popover closed and open (opened by a trusted click, closed by a trusted Escape);
- `.app` and `<html>` attributes after load and again after the popover round trip;
- DOM structure and geometry: for every element of the rail and Topbar subtrees, tag, class, rounded box, `display`, `visibility`, `opacity` (closed and open);
- decoded RGBA pixels of the rail clip and of the Topbar clip (closed and open), compared exactly. The DesktopPet's own boxes, widened by 24 px for its animated shadow, are masked in both captures where they intersect a clip — this applies only to the 375 rail clip (8 configurations, 4160 of 25500 px masked each); every other pixel clip is unmasked, and the DOM/attribute/geometry comparisons are never masked.

Result: 13 items × 24 = 312 comparisons, **0 differences**. Paired full-viewport screenshots of both SHAs (seven pairs, §2): four are byte-identical; the other three (`en-1440-left-boards-hidden-absent`, `zh-1440-left-all-custom`, `zh-375-all-custom`) differ only in the DesktopPet's animation frame (opened side by side). Consequence: no other caller's visual or keyboard evidence needs a rerun under §13.

## 6. E13 — `visual-en` and `visual-zh`: PASS (538/538, 529/529)

**Viewports** (record `visual:viewports`): 375×812 and 414×896 with mobile emulation, 768×1024, 1024×768, 1440×900; DPR 1; every probe gates on an unzoomed visual viewport (scale 1, width = innerWidth).

**Gated runs (pet hidden through its own rail toggle by a trusted, hit-tested click; widths ≤767 mounted at 1440, toggled, then resized; no stored `top` across that round trip).** Per language and width:

| Width | States | Product checks EN / ZH |
| --- | --- | --- |
| 375, 414 | clean default/custom (left); failed draft closed and open; source issue closed and open; Appearance + rail statuses closed and with the rail panel open | 70 / 70 each |
| 768, 1024, 1440 | the same plus clean default/custom with rail position `top` | 78 / 78 each |

- **New controls** (status button; Retry, Discard, Export; Reload): centre and four 25 % inset points land on the control, not covered; ≥44×44 (status 44×44 icon-only at 375/414, EN 151.59×44 / 160.89×44 and ZH 115.5×44 with text from 768); inside `.topbar` horizontally and inside the viewport; normative §5 name and visible text, text visible from 768 and icon only at ≤767; the status root sits immediately before `.topbar-pref`, and after the Appearance status when both show.
- **Open panel:** `role="dialog"`, contained in the viewport with no inner horizontal scroll, actions exact and each inside the panel; ≤767 `position: fixed` 12→363 px at 375; ≥768 `position: absolute`, 300 px wide, right-aligned to the status (e.g. EN 1440 903.47→1203.47).
- **Both statuses visible:** every Topbar control (search, Appearance status, rail status, trigger) inside the viewport and the Topbar, centre-hit and visible at all five widths (375: search 10→213, statuses 221→265 and 271→315, trigger 321→365); the trigger keeps its clean-state width (EN 196, ZH 160.48 at 768/1024); the search box absorbs the space.
- **No horizontal scroll** of the document or `.app-main` in every status state, and during the 1440 drag.
- **Clean states** have no status node and the expected rail order, and their layout (document and `.app-main` scroll widths, Topbar box and controls, rail) is judged identical to the same state at 419e56d. The `top` rail at 768 overflows horizontally (scrollWidth 873 of 768) **identically at 419e56d** — pre-existing, recorded, not this caller's.
- **1440 drag preview:** during a trusted drag the rail shows P, only the source carries `dragging`, bytes unchanged, no status, no horizontal scroll; then exactly one write at the drop.
- **R-1 sequence (EN, 1440):** Boards off through the real Features pane, drop, Boards on: `board` stays at index 2 in the bytes and redisplays at index 2; toggles wrote no order.

**R-PET (pet on at its default position).** Every width and language: a clean custom-order document at 419e56d and at the fixed SHA, and with the fixed product failed draft, both statuses, and source issue, each closed and open (22 product checks per width and language).
- **Blocking, new controls:** centre and four insets land on the control and never on the pet; the open panel box does not intersect the pet box (union of `.pet-wrap` and `.pet-swap-btn`; e.g. 375 panel 12→363 × 60→160 vs pet 267→323 × 704→760; 768 panel 250→550 × 57.5→157 vs pet 660→732 × 916→988). All pass. Precondition: the pet's box is at `innerWidth − 108`, `innerHeight − 108` with no stored position.
- **Recorded, unchanged controls:** no rail button or Topbar control is covered by the pet at any width. The only non-hit centre is the last visible bottom-bar button at 414 (Pomodoro / 番茄钟), clipped by the rail scroller (hit `aside.app-rail`, not the pet), identical at 419e56d and the fixed SHA. No UX-03/SHELL-05 entry arises.

**Selector audit (static, git `419e56d..f9eb4b1`; both logs L37, checks `css:*` 8/8).** The only changed stylesheet is the new `packages/xai-web-shell/src/railOrderStatus.css` (4455 B, `338f0eae7338458da54b996880cfa93034940e0f19220a1669c1570a8fd4b6e5`); tokens, settings-shell, Appearance, Features and global styles unchanged; balanced; one at-rule `@media (max-width: 767px)`. The 18 selectors, all beginning with `.rail-order-status`, none targeting `.app-rail`, `.rail-items`, `.rail-btn`, `.topbar`, `.topbar-controls`, `.topbar-pref*`, none an element selector, none using `.topbar-pref-option`:

`.rail-order-status`, `.rail-order-status-button`, `.rail-order-status-button:hover`, `.rail-order-status-button[aria-expanded="true"]`, `.rail-order-status-icon`, `.rail-order-status-panel`, `.rail-order-status-message`, `.rail-order-status-actions`, `.rail-order-status-action`, `.rail-order-status-action:hover`, `.rail-order-status-action--primary`, `.rail-order-status-action--primary:hover`, `.rail-order-status-action[aria-disabled="true"]`, `.rail-order-status-button:focus-visible`, `.rail-order-status-action:focus-visible`, and under `@media (max-width: 767px)`: `.rail-order-status-button`, `.rail-order-status-text`, `.rail-order-status-panel`.

The bundled stylesheet adds exactly this file; every other section of the fixed bundle CSS is byte-identical and in the same order as the 419e56d bundle's (L45).

**Computed focus outline of each new control** (trusted Tab from the status into the panel, Shift+Tab back; at 1440 and 375, failed and source states, EN and ZH; 24 checks per language): Retry, Discard, Export, Reload and the status button each match `:focus-visible` with `outline: solid 2px oklch(0.57 0.085 165 / 0.58)`, offset 2px. (Pixel focus walks are E14.)

## 7. Screenshot review (executor, opened)

| Screenshot(s) | Conclusion |
| --- | --- |
| `visual-{en,zh}-before-419e56d-route-error-*` | 419e56d with `{}` / `1`: the whole page is "Route Error (app)" / "prefOrder is not iterable", no rail, no Topbar (the fixed product with the same bytes renders with the source status, judged) |
| `visual-{en,zh}-failed-closed-{375,1440}`, `-failed-open-*` | 375: amber icon-only status before the trigger; panel spans under the Topbar with "Sidebar order was not saved." / "侧栏顺序未保存。" and Retry/Discard/Export (重试/放弃/导出). 1440: "Order not saved" / "顺序未保存" with the panel under it |
| `visual-{en,zh}-source-open-{375,1440}` | "Order unavailable" / "顺序不可用"; the unavailable message and a single Reload / 重新读取 |
| `visual-{en,zh}-both-statuses-{375,768}` | Dark theme from the failed Appearance draft; Appearance status, then rail status, then the trigger, all inside the Topbar (icons at 375, text at 768) |
| `visual-{en,zh}-peton-failed-open-768` | Pet at its default bottom-right position, far from the open panel |
| `visual-{en,zh}-drag-preview-1440` | The dragged Statistics icon dimmed in the third slot (the preview), the target's tooltip shown, no status |
| `visual-en-r1-en-1440-*` | Boards switch off and 13 rail buttons; Calendar moved after the drop; Boards back in the third slot after re-enabling |
| `downstream-chrome-*` (seven pairs) | Each 419e56d/fixed pair is visually identical; the three byte-different pairs differ only in the pet's animation pose |

The red "Could not save … Retry save" block on Tasks is the pre-existing, unrelated Tasks save-failure alert (batch 39 ruling 5).

## 8. Deviations and disclosures

1. **Pet-on drags below 768 px.** The rail pet toggle is hidden at 767 px and below, and resizing moves the pet off its default position (DesktopPet re-clamps on resize). So at 375 and 414 the R-PET failed-draft and both-status documents were mounted at that width with the pet on, and the failed drop was dragged in the bottom bar with the pet visible, under the same centre-hit, uncovered source/target preconditions as every drag. At 768 and above the pet-on drags ran gated (toggle off, drag, toggle on, default position re-checked). §9 says native drags run in the gated mode; this is the only exception and it does not affect what R-PET judges (the controls and panel after the drag).
2. **Gated narrow widths** were reached by toggling at 1440 and resizing; the drafts were then created by trusted drags in the 375/414 bottom bar (pet hidden). A pet-position write by the pre-existing resize clamp, if any, is outside the judged segments and was not judged.
3. **Scrollers returned to origin.** The trusted click that scrolls the pet toggle into view scrolls the document where the rail is taller or wider than the viewport (1024×768: 158 px down; 768 with the `top` rail: 90 px right). The runner returns every scroller to 0 before probing (recorded per document, identical at 419e56d and fixed).
4. **Clean states are judged against 419e56d** for layout instead of an absolute no-horizontal-scroll check, because the `top` rail at 768 overflows identically at 419e56d (pre-existing). Every state with a new control keeps the absolute check.
5. **Pet mask in the pixel comparison**: the pet boxes are widened by 24 px (development probes dev4/dev5 showed ±1-channel differences under the pet only, in different configurations on each run). The mask applies only where the pet intersects a clip (the 375 rail); DOM, attributes and geometry are compared unmasked.
6. **Isolation drags run with the pet visible** (its position is one of the §10 item 7 truths), each with uncovered source and target.
7. **Second documents:** product-free same-origin tabs for external writes; a second production App tab for row m.
8. **Development probes** (all with `XAI_NATIVE_EVIDENCE_DIR` in the session scratchpad and `XAI_NATIVE_ONLY`; none committed or cited):

| Probe | Sections | Outcome | Change afterwards |
| --- | --- | --- | --- |
| downstream dev1 | bytes | Script error (constants used before initialisation) | Moved the run block to the end of the file |
| downstream dev2, dev3 | bytes; before bytes, display truth, row m, isolation | PASS | None |
| downstream dev4 | chrome | 3 pixel checks FAIL: ±1 channel differences next to the pet in 375 rail clips | Added diff localisation |
| downstream dev5 | chrome | 2 (other) pixel checks FAIL, localised to x 257–317, y 8–35 of the 375 rail clip, i.e. under the pet's shadow | Widened the pet mask by 24 px (deviation 5) |
| downstream dev6 | crash load, crash second, chrome | PASS | None |
| visual-en dev1 | css, before, gated | Script error (`failTopbarTheme` not copied) | Copied the batch 61 helper |
| visual-en dev2 | css, before, gated | 2 FAIL (768 `top` clean overflow), then harness-invalid at 1024 (document scrolled by the toggle click) | Deviations 3 and 4 |
| visual-en dev3, dev4 | css, before, gated; pet-on, focus, preview, R-1 | PASS | Screenshot names shortened only |

No assertion on a new control was weakened between probes and the authoritative runs, and no expected value was taken from a probe.

## 9. Limitations

- Headless Chrome 155 on macOS, not Tauri; synthetic auth session; development build without StrictMode; dependency tree reused read-only behind the lockfile gate.
- Visible focus is judged here by computed outline only; the pixel focus walks, Tab order through the Topbar and Enter/Space behaviour are E14.
- The coordinator auth branch is not exercised in this batch (E10 covered it).
- Not covered: E14 (keyboard), E15–E25, final acceptance.
