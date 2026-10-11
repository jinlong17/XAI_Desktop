# AppRail order native controls, protection and on-disk export (CP-APPRAIL-01, batch 61, contract r1 §15 E9, E10, E11)

**Verdict: PASS for E9, E10 and E11.** Three modes, one authoritative run each (`fixed1`), all harness-valid, zero failed product checks, zero `PRECONDITION` failures, zero product runtime errors:

| Mode (E-item) | Host rows | Product checks pass/total | Preconditions | Exit |
| --- | --- | --- | --- | --- |
| `controls` (E9) | b, c, e, f, o, p, r (+ uncertainty, D1 probe) | 1024/1024 | 2841 | 0 |
| `protection` (E10) | a, d, g, h, i, j, k, l, n, q | 134/134 | 1488 | 0 |
| `export` (E11) | §8 shapes 1–5 + setup failures | 68/68 | 298 | 0 |

No real product failure, oracle/contract contradiction or irreproducible harness was found, so no stop condition triggered.

This is verification only. It changes no product source, product test, contract, oracle, ledger, control plane or existing evidence; the frozen before files in this directory (`verify-native-before.mjs`, `native-before-app.tsx`, `native-before-prelude.js`, the `before1` logs, screenshots and `before-419e56d.md`) were read only, and their SHA-256 are re-checked by every run. It accepts nothing and closes no 312 item. E12–E14 and the later items stay open.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5, parent native verifier role, in isolated worktree `.claude/worktrees/agent-ae69d0b623a71dabd`. It wrote neither the contract, the before oracles (Sol, host, native before), the implementation (Terra) nor the batch-60 reruns |
| Docs base (detached HEAD) | `2b8f877df70397b822b6cd050b97ec7e0d07f820` (control plane batch 61); every log's `baseline` line records `docsHead` |
| Fixed revision | Requested `f9eb4b1`, resolved `f9eb4b1f207bc4b46f547b90afc250424b3c8695` (precondition `baseline:requested-revision-resolves-to-the-fixed-sha`), tree `05887cf113639116b228a25041a37b3d5c69a322` |
| Product delta | `git diff --name-only f9eb4b1 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (`baseline:docs-head-product-tree-equals-fixed`). `419e56d..f9eb4b1` is exactly the 19 E6 files (`baseline:fixed-delta-is-exactly-the-19-e6-files`). Of the 13 contract r1 source rows, the 7 unit rows differ and the 6 protected rows (`dnd.ts`, `registry.tsx`, `AppRail.test.tsx`, storage `registry.ts`, `layout.css`, `departureCoordinator.tsx`) equal the contract hashes; in `protection` the 419e56d archive equals all 13 |
| Authority | Contract r1 `../web-apprail-order-recovery-contract/contract.md` (SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`, re-derived at HEAD by every run): §5 (domain, item 2 values, selectors, normative wording), §6 (drag model, trusted input), §7 (protection), §8 (export), §9 rows a–r, §15 E9–E11. Control plane "本轮唯一任务" (batch 61) and the CP-APPRAIL-01 rows, including controller ruling D1 |
| Browser / toolchain | `Chrome/155.0.8059.39` headless (`--headless=new`), Node v24.16.0, esbuild 0.28.1 (gated tree), react 19.2.0, react-dom 19.2.0, react-router 7.15.1. Viewport 1280×900 (row c 1440×900), DPR 1 |
| Lockfile gate | `df05f2dd…9aeab9` in five places: dependency root, `git show f9eb4b1:pnpm-lock.yaml`, `git show 419e56d:pnpm-lock.yaml`, the extracted archive(s) and the contract constant |
| Iterations | One authoritative run per mode (`fixed1`, 1 of 3). Development probes are disclosed in §6 |

## 2. Files and SHA-256

57 new files, all under `docs/reviews/web-apprail-order-recovery-native/`. This receipt cannot carry its own hash; the other 56 are listed. Each log's `baseline.fileSha256` records the runner, fixture and prelude hashes below.

| File | Size | SHA-256 |
| --- | --- | --- |
| `verify-native-fixed.mjs` (runner) | 2324 lines | `f062e723b862b332f32f39bf02bf6951b4918a8af5bda8e42f4b69a03aa0f6d7` |
| `native-fixed-app.tsx` (production App fixture) | 204 lines | `a86425af2715a3cb81100a87c413c76d75378f9e500ea575eb23b5d299e77d2d` |
| `native-fixed-prelude.js` (instruments) | 828 lines | `4d731278ce6b88a9fa9304926177b248e307341bae180cbe59749bbac2eeb239` |
| `native-f9eb4b1-fixed1-controls.log` | 4246 lines | `c416cf3f1d9daa26238bb6fa43486b34cd0319cb0e827c0d8b0ca66f0ad281bf` |
| `native-f9eb4b1-fixed1-protection.log` | 1761 lines | `6dc38387527ebb2b6f5da71c189cd6142b0c3a1fcd12ef0b4846607cc93288d2` |
| `native-f9eb4b1-fixed1-export.log` | 414 lines | `0172a752fa5da085a9d9a01681679ab6c8842a48473cef7c13642948be6aaa02` |
| `native-f9eb4b1-fixed1-export-x1-rail-order-draft.json` | 251 B | `d4d7f01fbd9213493310db2b692fe26a2b9561e313d6cc613071ae830579938f` |
| `native-f9eb4b1-fixed1-export-x2-rail-order-draft.json` | 251 B | `24f8163eef0d174a47a5e1b0d2a6ce6db461725cd762e5a76cbc1f52b25539a3` |
| `native-f9eb4b1-fixed1-export-x3-rail-order-draft.json` | 251 B | `f675890e9f391ade3556cbea8c9ca3fdf9068e57f2e59e81257ef8c7767ccfd3` |
| `native-f9eb4b1-fixed1-export-x4-rail-order-draft.json` | 251 B | `d4d7f01fbd9213493310db2b692fe26a2b9561e313d6cc613071ae830579938f` |
| `native-f9eb4b1-fixed1-export-x5-rail-order-draft.json` | 251 B | `d4d7f01fbd9213493310db2b692fe26a2b9561e313d6cc613071ae830579938f` |
| `native-f9eb4b1-fixed1-export-xf-en-click-recovered-rail-order-draft.json` | 251 B | `d4d7f01fbd9213493310db2b692fe26a2b9561e313d6cc613071ae830579938f` |
| `native-f9eb4b1-fixed1-protection-d-en-rail-order-draft.json` | 251 B | `d4d7f01fbd9213493310db2b692fe26a2b9561e313d6cc613071ae830579938f` |
| `native-f9eb4b1-fixed1-protection-d-zh-rail-order-draft.json` | 251 B | `d4d7f01fbd9213493310db2b692fe26a2b9561e313d6cc613071ae830579938f` |
| `native-f9eb4b1-fixed1-controls-b1-after-drop.png` | 147186 B | `7739c30c839bd8614c85179d8f33a56d7d19626e605e9f60ea71a37bf8ac324f` |
| `native-f9eb4b1-fixed1-controls-c-en-1440-after-drop.png` | 104106 B | `9a3617f499e0da588e61ab60ec837a9def0362fe90e980d6745486bd8b9a4166` |
| `native-f9eb4b1-fixed1-controls-c-en-1440-after-re-enabling.png` | 103562 B | `a7cc00729ec373d9de8f8699f7412a93dd24bd76be177f82f7ac5af5d5405726` |
| `native-f9eb4b1-fixed1-controls-c-en-1440-boards-hidden.png` | 104097 B | `921ca93183926901e4682463ec7a199b6ed993d2129ede70b2a00514b199a898` |
| `native-f9eb4b1-fixed1-controls-e-held.png` | 147186 B | `7739c30c839bd8614c85179d8f33a56d7d19626e605e9f60ea71a37bf8ac324f` |
| `native-f9eb4b1-fixed1-controls-o-en-array-1-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-array-nested-tasks-panel.png` | 155123 B | `d5efb1483190ae541d90d369613910b9228770aad923492cd6c8b863f528af12` |
| `native-f9eb4b1-fixed1-controls-o-en-array-null-tasks-panel.png` | 155123 B | `d5efb1483190ae541d90d369613910b9228770aad923492cd6c8b863f528af12` |
| `native-f9eb4b1-fixed1-controls-o-en-array-tasks-2-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-empty-string-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-false-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-null-literal-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-number-0-tasks-panel.png` | 155123 B | `d5efb1483190ae541d90d369613910b9228770aad923492cd6c8b863f528af12` |
| `native-f9eb4b1-fixed1-controls-o-en-number-1-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-number-minus-1-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-object-empty-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-object-tasks-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-repeated-board-tasks-panel.png` | 155123 B | `d5efb1483190ae541d90d369613910b9228770aad923492cd6c8b863f528af12` |
| `native-f9eb4b1-fixed1-controls-o-en-repeated-tasks-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-string-tasks-tasks-panel.png` | 155123 B | `d5efb1483190ae541d90d369613910b9228770aad923492cd6c8b863f528af12` |
| `native-f9eb4b1-fixed1-controls-o-en-true-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-unparsable-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-en-unreadable-tasks-panel.png` | 155123 B | `84d9428958c46f2885d6ce3cbf3eec2926544393789a3bd769bf3ed66fa3f69a` |
| `native-f9eb4b1-fixed1-controls-o-zh-array-1-tasks-panel.png` | 173831 B | `d2dc170cf3766c2b87eb4e6f120a255853b8915b6a16991b016c264d3495a6d5` |
| `native-f9eb4b1-fixed1-controls-o-zh-object-empty-tasks-panel.png` | 173831 B | `d2dc170cf3766c2b87eb4e6f120a255853b8915b6a16991b016c264d3495a6d5` |
| `native-f9eb4b1-fixed1-controls-o-zh-repeated-tasks-tasks-panel.png` | 173831 B | `d2dc170cf3766c2b87eb4e6f120a255853b8915b6a16991b016c264d3495a6d5` |
| `native-f9eb4b1-fixed1-controls-o-zh-string-tasks-tasks-panel.png` | 173829 B | `ef0efb8f1d3bb11a55e6ea7d5d5212532cb9c98b51bbfd67959be1ae3c90c980` |
| `native-f9eb4b1-fixed1-controls-o-zh-unparsable-tasks-panel.png` | 173831 B | `d2dc170cf3766c2b87eb4e6f120a255853b8915b6a16991b016c264d3495a6d5` |
| `native-f9eb4b1-fixed1-controls-o-zh-unreadable-tasks-panel.png` | 173829 B | `ef0efb8f1d3bb11a55e6ea7d5d5212532cb9c98b51bbfd67959be1ae3c90c980` |
| `native-f9eb4b1-fixed1-controls-r-cancel-after.png` | 147235 B | `b209751a3afda7918239dc2a298149c11fb85d72675553b7c991f0c7b6455729` |
| `native-f9eb4b1-fixed1-controls-r-drop-input-after.png` | 104325 B | `c11f60469fb254f20ae28164769f3df29801c7f10f197b0d6279fbc206a6d48a` |
| `native-f9eb4b1-fixed1-controls-r-drop-outside-after.png` | 147235 B | `b209751a3afda7918239dc2a298149c11fb85d72675553b7c991f0c7b6455729` |
| `native-f9eb4b1-fixed1-export-x4-panel.png` | 173052 B | `d109b9bc357b9755fda7e2dfea2f9fc7b2e4a51707a11527d1c0231ca2a2552e` |
| `native-f9eb4b1-fixed1-export-xf-en-click-panel.png` | 175599 B | `7259a9973cc388a467764001b9318a4636328b50275c99a9a961da022dc06de8` |
| `native-f9eb4b1-fixed1-export-xf-zh-create-panel.png` | 177058 B | `6e4c64af3f3c76ac9d9189b03fabd627049e982e0e3a00eda9469d9c00689294` |
| `native-f9eb4b1-fixed1-protection-d-en-failed-status.png` | 150539 B | `c0dcb6ca2939a9dc541ff62f196c784cae2508b4fadbb470b9339f93ed41571b` |
| `native-f9eb4b1-fixed1-protection-d-en-panel-open.png` | 155850 B | `8096b2d548e6d43072eca1e44561f9c792654723abe7d6bcf7824481ae13f73d` |
| `native-f9eb4b1-fixed1-protection-d-zh-failed-status.png` | 165837 B | `5cb8e34f270db644ea2b95ce2c1c4f609bfa18f18093827183351d0ff8417a89` |
| `native-f9eb4b1-fixed1-protection-d-zh-panel-open.png` | 169069 B | `8ec29c88ce83e843a2fbe8f8442a8fbf92db598eef8fcf71519b1abee7988a98` |
| `native-f9eb4b1-fixed1-protection-j-coordinator-en-both-statuses.png` | 152370 B | `5a85067b2517fb9554076ef8eac20b4bedfd423791cb12a426109d7a677a7702` |
| `native-f9eb4b1-fixed1-protection-j-legacy-en-both-statuses.png` | 152370 B | `5a85067b2517fb9554076ef8eac20b4bedfd423791cb12a426109d7a677a7702` |
| `native-f9eb4b1-fixed1-protection-j-legacy-zh-both-statuses.png` | 167564 B | `cae4ac7046ebb09dc0e3ba5d013f2f8d728362f6c2957e2f81f5b7a7653745fc` |

Identical hashes are expected: the same REVERSED drag produces the same envelope (x1, x4, x5, recovered, d-en, d-zh) and the same screen (b1 after drop vs e held; r cancel vs drop outside; j legacy vs coordinator EN); the source-status panel is the same for every malformed value, and the two EN/ZH variants differ only in sub-pixel rendering of the unrelated Tasks alert area.

## 3. Commands

From the worktree root; the dependency root (the main checkout) was used read-only (no install, build, dev server or preview tool there or anywhere). `XAI_NATIVE_TMPDIR` was the session scratchpad; each run deleted its archive(s), profile, download directory and bundles.

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop XAI_NATIVE_TMPDIR=<scratchpad>/tmp \
  node docs/reviews/web-apprail-order-recovery-native/verify-native-fixed.mjs f9eb4b1 export fixed1      # PASS checks=366  product=68   exit=0
  ... f9eb4b1 protection fixed1  # PASS checks=1622 product=134  exit=0
  ... f9eb4b1 controls fixed1    # PASS checks=3865 product=1024 exit=0
```

Exit codes: 0 harness valid and every product check passes; 2 harness valid with a product failure; 1 harness invalid. The runner refuses an existing log or any file with the same prefix (`Evidence exists; use a distinct suffix`), writes with `wx`, preserves nonzero codes, and refuses `XAI_NATIVE_ONLY` (a development row filter) unless evidence is redirected outside the repository; the committed runs record `rowFilter: null`. After the runs no Chrome with `--remote-debugging-pipe` was running and the scratch temp directory was empty.

## 4. Harness and provenance

- **Immutable archives, guard, pinning.** `git archive` of `f9eb4b1` (and of `419e56d` in `protection`) per run. An esbuild plugin pins every `@repo/*` specifier to the archive's package export and fails the build on any module from the `packages/`, `apps/` or `docs/` tree of either checkout. Every bundle: 0 foreign inputs, 0 guard violations. Fixed bundle `423a1dd1…6595eb3`: 1022 inputs, 630 archive modules, 390 third-party, 43/43 required reader/writer/host modules from the archive (including `railOrderController.tsx`, `RailOrderStatus.tsx`, `railOrderModel.ts`, `railOrderCopy.ts`, `railOrderStatus.css`, `AppRail.tsx`, `App.tsx`, `departureCoordinator.tsx`, storage `usePrefAsync.ts`/`prefMutation.ts`). `protection` adds `fixed-coord` (`07c4d10c…`), `before` (`ae78994a…`, 625 archive modules, 38/38 required) and `before-coord` (`6932d187…`).
- **Composition.** `native-fixed-app.tsx` follows `apps/web/src/main.tsx` module order, renders the production router instance under `RouterProvider` inside the production `WebAuthSessionProvider` with the production `invalidateAccountIdentity`. **Only the auth session is synthetic**; in the `-coord` variants that same auth-session context additionally carries a synthetic generation coordinator (one virtual module redirecting `@repo/web-auth-device-session/web`, the precedent of `../web-appearance-recovery-native/verify-native-host-retryall.mjs`), so `App.handleSignOut` takes its coordinator branch. Every mount asserts the real provider, the activated account scope, the real lock name `xai:pref:v1:xai_rail_order` and the unscoped physical key.
- **Instruments** (`native-fixed-prelude.js`, self-test on a product-free seed page, precondition at the first seed): attempt-level Storage tracing before any fault and one delegation (quota, throwing set, read, remove, total denial, one-shot readback denial; F-B002 depth counter: no nested Storage calls); dispatch spy; Web Lock tracing with fixture-held and "middle" requests; history (`pushState`, `replaceState`, `popstate`) and router commit/navigate/blocker traces; beforeunload census and synthetic cancelable event; export tracing (object URLs, anchor click, insertion and removal, one-shot `createObjectURL`/click failures); `window.confirm` recorder; network refusal; passive capture-phase click, key and drag recorders (drag events carry `isTrusted`, the target and the displayed rail order at dispatch); a MutationObserver stamping every displayed-order change (D1).
- **Trusted input.** Clicks: `Input.dispatchMouseEvent` after a centre hit-test, with a per-click precondition of exactly one trusted click (the export anchor's own programmatic click is untrusted and recorded). Drags (contract §6 item 8): `Input.setInterceptDrags`, mouse press and move on the source, `Input.dispatchDragEvent` `dragEnter`/`dragOver` (plus one resting-pointer `dragOver`, the frozen before convention) and `drop` or `dragCancel`; source and every target centre-hit-tested and uncovered first; every recorded drag event trusted, a trusted `dragstart` on the source, a trusted `dragover` on every target, a `dragend`, and exactly one trusted `drop` inside `.rail-items` for drops. No page-context synthetic `DragEvent`. Back/Forward: `Page.navigateToHistoryEntry` (browser history traversal).
- **R-PET gated mode.** After each mount the pet is hidden through the product's own rail pet toggle by a trusted click (precondition `pet-hidden-through-the-rail-toggle`); row a and the 419e56d references keep the pet so the fixed and before mount windows are identical.
- **K-1.** No `nativeVirtualKeyCode`. Keyboard audit (every document's key trace must equal the runner's presses): controls 1 = 1 over 252 documents (L4237), protection 20 = 20 over 87 (L1752), export 1 = 1 over 16 (L405); 0 untrusted, 0 keypress, 0 mismatches.
- **Network.** 0 non-local attempts in every document (controls L4236, protection L1751, export L404).
- **Runtime errors.** Each log has exactly one runtime error: the prelude self-test's own `console.error` positive control on the product-free seed page (excluded by exact text and source). Product: 0 exceptions, 0 console errors, 0 console warnings in all three modes (`run:runtime-errors` controls L4244, protection L1759, export L412; check `run:zero-runtime-errors-in-the-fixed-product` PASS). Every case runs inside a row gate (controls 125, protection 40, export 7 gates) with the runtime-error gate (CDP exceptions, page `console.error`, error UI, route error) — all clean — and history counters (judged equal to `ZERO` or to the clean reference wherever the case makes no or known navigation).
- **Dialogs.** Every dialog was planned and asked (`run:no-unexpected-javascript-dialogs`, `run:every-planned-dialog-was-asked` PASS; protection 38 dialogs, export 5, controls 0). Real `beforeunload` prompts on runner navigations away from drafted documents were accepted.

## 5. Results per host row

Log lines cite the first product check of the group; every check id is prefixed by its row.

### E9 — `native-f9eb4b1-fixed1-controls.log`: PASS

| Row | Scenario | Result |
| --- | --- | --- |
| **b** (L54–L163) | b1 one-step drag (REVERSED, all 14 visible); b2 two-step drag; b3 `ghost-module` at index 0 | PASS 25/25. Zero storage attempts from `dragstart` to `drop`; exactly one `setItem("xai_rail_order")`, after the drop, outcome ok, equal to the runner's own A2 merge (P6: S' = P for b1/b2; b3 keeps `ghost-module` at index 0, P2); page and DevTools bytes equal; rail shows the dropped order; no status, no unload listener; exactly one per-key lock request, no account lock, no StorageEvent. b2: the preview moved on each `dragover` step while bytes stayed S |
| **D1 probe** (L164) | 450 ms pause between CDP `dragEnter` and `dragOver` | PASS 10/10. After `dragenter` alone the displayed order is unchanged (D0); after the following `dragover` it is P; the only preview change follows `dragover:Meditation`; then one write at the drop |
| **c** R-1 (L194; EN 1440 with screenshots, ZH) | Seed with `board` at index 2, Features on; Boards off through the real Features pane (trusted click), drag, drop, Boards on | PASS 22/22. Bytes keep `board` at index 2, their visible filter equals the dropped order, bytes equal the merge; after re-enabling Boards displays at index 2 (= D(bytes, R)); both Features toggles made zero attempts on the order |
| **e** (L301) | Fixture holds the real `xai:pref:v1:xai_rail_order`; drag and drop | PASS 7/7. While held: dropped order displayed, no status, bytes unchanged, zero writes, one pending app lock request, a pending draft warns with zero handler attempts; the rail stays operable (a trusted rail click navigates to `/app/dashboard` with the draft still displayed). After release: exactly one write with the merge bytes (DevTools too), no status, no warning, one app lock request in total |
| **f** (L354) | L1 held; drop 1; fixture "middle" request L2 queued; drop 2 over the draft; release L1, then L2 | PASS 8/8. Both drops admitted while held, latest displayed, zero writes. After L1: bytes = merge 1, L2 holds, the rail still shows drop 2 and the unload warning is active (the first completion never acknowledged the second). After L2: bytes = merge(draft 1, R, P2) (page and DevTools), sets exactly [merge 1, merge 2], app lock requests on the key exactly 2 (one per drop; trace `101:app`, `104:fixture`, `119:app`), no status, no warning |
| **uncertainty** (L391; EN, ZH) | One-shot readback denial after the drop's write | PASS 12/12. Write lands (1 set) and its readback is denied: a failed draft with the §5 status and panel wording, never a success; Retry by trusted pointer makes zero writes and clears the status (exactly one total write); focus lands on `.topbar-pref-trigger` |
| **o** (L459–L4026) | All 18 values (§5 item 2's 17 plus a throwing `getItem`), EN and ZH, each on `/app/tasks`, `/app/settings/appearance`, `/app/dashboard`, then a drag over it | PASS 906/906. Per value×language×route: App renders, no route error; rail = D(DEFAULT_RAIL_ORDER, R) (each module once, incl. `["tasks","tasks"]`, `["board","tasks","board"]`); source status with the §5 name and visible text, slot immediately before `.topbar-pref`; panel `role="dialog"` labelled "Sidebar order"/"侧栏顺序", the unavailable message (`alert`) and **Reload only**; zero set/remove at mount and when opening the panel; bytes unchanged; no unload warning; unreadable: the read was attempted and denied. Drag over it: a refused failed draft (draft wording, dropped order displayed, bytes unchanged, no successful write, warning on); Retry refused again with focus staying on Retry; Discard makes zero writes, returns to the default display and the source status, no warning |
| **p** (L4027; EN, ZH) | (1) `{}` repaired by a product-free second document, then Reload; (2) unreadable: Reload while still denied, then lift the fault and Reload | PASS 16/16. (1) After the trusted `storage` event the source status is still shown (preserved, recorded `statusStillShown: true`); Reload clears it, the committed order displays, zero writes, focus on `.topbar-pref-trigger`. (2) Reload while denied keeps the source status (read attempted and denied, no write); after repair Reload clears it with zero writes |
| **r** (L4156) | `dragCancel`; drop on the main content (`/app/tasks`); release over a text field (Metrics profile Height field) | PASS 15/15. The preview moved during the gesture; then zero attempts, bytes unchanged, the rail reverts to D0, no status, no listener; the revert follows the `dragend`. See deviation 1 for the text-field drop |

### E10 — `native-f9eb4b1-fixed1-protection.log`: PASS

| Row | Scenario | Result |
| --- | --- | --- |
| **a** (L69) | Absent and REVERSED bytes × `/app/tasks`, `/app/settings/appearance`, `/app/dashboard`; Topbar popover open/close; 419e56d reference for each | PASS 30/30. Zero rail writes at mount and around the popover; committed or default order; no status, no unload listener/warning; mount mutations equal 419e56d exactly (`remove/set lswt-*` probe, `set xai:auth:identity-change`), so the caller adds no write |
| **d** (L279; EN, ZH, + Discard) | Quota fault armed; trusted drop | PASS 22/22. Dropped order stays displayed; after settlement the status (§5 name, visible text, ≥44×44, slot before `.topbar-pref`) shows on `/app/dashboard`, `/app/calendar`, `/app/settings` (via AvatarMenu) and `/app/tasks` with the draft intact; panel wording and actions exact; Retry with the fault armed: exactly one `denied-quota` attempt, focus stays on Retry; Export by trusted pointer writes the exact envelope to disk with focus on Export and zero storage attempts; after clearing the fault Retry makes exactly one write, removes the status, focus on `.topbar-pref-trigger`, no listener. Discard: zero writes, committed order back, status gone, focus on `.topbar-pref-trigger` |
| **g** (L540) | Failed draft on `/app/settings/appearance`: Settings sidebar → About, rail click → Tasks, Back, Forward; clean reference run | PASS 4/4. Not held: per step `{pathname, state, keyChanged, counters, commits, departure, blockerCalls}` deep-equal to the clean run (PUSH, PUSH, POP, POP; state `null`; no departure dialog; 0 blocker calls); status and draft intact on every route; segment counters equal the clean totals |
| **h** (L598; both branches) | No rail draft; and an Appearance draft only; fixed vs 419e56d | PASS 16/16. Zero rail confirms; outcome vector (confirms, scope transitions, client/coordinator sign-outs, requests, history counters, final path, rail mutations, departure) deep-equal to 419e56d in all four cases. Legacy: 3× `locked:null`, one `client.auth.signOut`, `/` requested, replace to `/auth/login`. Coordinator: 2× `locked:null`, one `coordinator.signOut({generation, owner})`, `/` requested. With an Appearance draft only the confirm list is exactly [Appearance text] |
| **i** (L858; both branches × EN/ZH) | Failed rail draft; Cancel, then OK | PASS 24/24. Cancel: exactly [rail text] (EN/ZH), resolves false, identity intact, 0 history mutations, no request, no departure dialog (coordinator branch: capture called, no sign-out), draft/status/warning kept, zero writes. OK: exactly [rail text], zero writes, the sequence continues (legacy sign-out or coordinator sign-out, `/` requested) |
| **j** (L1118; legacy EN, legacy ZH, coordinator EN) | Rail and Appearance drafts | PASS 15/15. Rail Cancel: list exactly [rail], Appearance not asked, both statuses kept. OK + Cancel: list exactly [rail, Appearance]; resolves false; rail draft discarded with zero writes (committed order back, rail status gone); Appearance draft and status kept. New rail draft, OK + OK: list exactly [rail, Appearance], zero rail writes, sign-out proceeds |
| **k** (L1447; both branches) | More draft (Launch at Login, write denied) held by the Settings coordinator + rail draft; 419e56d reference with the More draft alone | PASS 8/8. Rail Cancel: no coordinator asked. Rail OK: then the departure dialog appears with label, text, buttons and outer HTML identical to 419e56d ("Unsaved More draft" / "More has unsaved changes." / Stay, Export current draft, Discard local changes and leave); the rail draft is discarded with zero writes. Stay resolves false exactly as at 419e56d (identity intact, 0 history mutations, 0 requests, dialog closed) |
| **l** (L1667) | Clean, source-only (`{}`), pending (held lock), after success, failed, after Discard; a real navigation | PASS 4/4. No warning when clean or source-only (0 listeners); warns while pending and while failed (1 listener, zero handler attempts); none after success or Discard. A real runner navigation away from a failed draft produced a native `beforeunload` prompt (accepted, recorded) |
| **n** (L1709) | Failed rail draft; identity `null` then the owner written to `xai:auth:identity-change` from a product-free second document | PASS 4/4. Gate shown, `.app` replaced (remount), scope back to the account with a higher epoch (2 → 6); committed order displayed, draft lost, no status, no listener, zero writes, zero runtime errors (REL-09) |
| **q** (L1746) | Real Features pane: Boards off (success); Matrix off with its write denied (failure); Matrix Retry; Reset to defaults (Features confirmation accepted) | PASS 4/4. Zero attempts of any kind on `xai_rail_order` across all four, bytes unchanged; the rail display follows R (D(S, R) at each step) |

### E11 — `native-f9eb4b1-fixed1-export.log`: PASS

Every export: total storage denial armed and proven by a denied probe read immediately before; Export by trusted pointer; zero read/write/remove attempts in the export window; exactly one object URL created and that URL revoked; the anchor (`download="rail-order-draft.json"`) appended, clicked once while connected with that URL, and removed (0 left); the Chrome download parsed from disk and deep-equal to the whole envelope, as the single file `rail-order-draft.json`; afterwards the unload warning still active (zero handler attempts), the status and panel still shown with the expected wording, focus on Export; bytes and router location unchanged.

| §8 shape | Scenario | Disk value (`changes.device.railOrder`, `set`) | Result |
| --- | --- | --- | --- |
| 1 (L67) | Failed drop, all visible (REVERSED) | `["countdown","meditation","statistics","habits",…,"ai"]` = P | PASS 8/8, `d4d7f01f…` |
| 2 (L119) | Failed drop with Boards hidden through the real Features pane | `["tasks","dashboard","board","calendar",…]`: `board` keeps index 2 | PASS 8/8, `24f8163e…` |
| 3 (L165) | Failed drop over `{}` | merge over the 12 defaults + `bookkeeping`,`metrics` appended: `["board","dashboard","tasks","calendar",…,"bookkeeping","metrics"]` | PASS 8/8, `f675890e…` |
| 4 (L220) | Retry pending behind the real per-key lock ("Sidebar order is saving.", Retry `aria-disabled`) | = shape 1 | PASS 10/10. The export never released the held Retry (zero attempts, bytes unchanged); after release exactly one write and the status gone |
| 5 (L269) | Rail click to `/app/dashboard` and back to `/app/calendar` (status shown away), then export | = shape 1 | PASS 9/9; history push 2/commits 2 |
| Setup failure (L329) | EN: anchor click throws; then a recovered export. ZH: `createObjectURL` throws | — | PASS 22/22. EN: "Export failed. Please retry." (`alert`) in the panel, one URL created and revoked, clicked once, anchor removed, no file; status, draft, warning kept; the next successful export wrote the envelope and cleared the line. ZH: "导出失败，请重试。", no URL, no anchor, no click, no file |

## 6. D1 observations (controller ruling D1, for final acceptance)

For every trusted drag the log records the `dragenter` and `dragover` targets and after which drag event each displayed-order change was observed (`d1` in each `…:drag` observation; summaries controls L4238, protection L1753, export L406).

- **Totals:** 78 drags (50 controls, 21 protection, 7 export). Preview changes after a `dragenter`: **0**. Changes after a `dragover` on a button other than the dragged one: 79 (one per step; b2 has two steps). Changes after `dragend`: 3, exactly the three cancelled drags of row r (the revert).
- **Typical trace** (d1 L164 area): `91:dragstart:Statistics`, `92:dragenter:Meditation`, `93:dragover:Meditation`, change stamped at 94 (after `dragover:Meditation`), `95:dragenter:Statistics`, `96:dragleave:Meditation`, `97:dragover:Statistics`, `98:drop:Statistics`, `101:dragend:Statistics`, then the single `setItem` at 103. The drop lands on the dragged button itself (allowed by §6 item 3, as recorded in batch 60).
- **D1 probe:** with a 450 ms pause after `dragEnter`, the displayed order is still D0; after the following `dragOver` it is P. This is consistent with the ruling "dragenter only accepts (`preventDefault`); the following dragover moves the preview".

## 7. Screenshot review (executor, each image opened)

| Screenshot(s) | Conclusion |
| --- | --- |
| `controls-o-en-*-tasks-panel` (18), `controls-o-zh-*-tasks-panel` (6) | Topbar "Order unavailable"/"顺序不可用" status before the appearance trigger; open panel with "Saved sidebar order is unavailable. Reload it; this is not a new unsaved change." / ZH and a single Reload/重新读取; rail in the default order with every module once. The red alert top left is the unrelated pre-existing Tasks save-failure alert (before receipt §6 item 1) |
| `controls-c-en-1440-*` | Boards switch off and 13 rail buttons; after the drop Calendar moved; after re-enabling Boards is back in the third slot (index 2) |
| `controls-b1-after-drop`, `controls-e-held` | Statistics in the third slot, no Topbar rail status (identical frames) |
| `controls-r-*-after` | Rail back in the seeded order after each cancelled gesture, no status |
| `protection-d-{en,zh}-failed-status`, `-panel-open` | "Order not saved"/"顺序未保存" status; panel "Sidebar order was not saved."/"侧栏顺序未保存。" with Retry, Discard, Export |
| `protection-j-*-both-statuses` | Appearance "Not saved"/"未保存" status, then the rail status, then the appearance trigger (dark theme displayed from the failed Appearance draft) |
| `export-x4-panel` | "Sidebar order is saving." with Retry greyed (`aria-disabled`), Discard, Export |
| `export-xf-en-click-panel`, `export-xf-zh-create-panel` | The draft message plus "Export failed. Please retry." / "导出失败，请重试。" |

## 8. Deviations and disclosures

1. **Row r, "a drop on a text input".** With the intercepted drag data (`items: text/plain "statistics"`, `dragOperationsMask: 16` = move, from the product's `effectAllowed = "move"`), headless Chrome delivered `dragenter`/`dragover` to the Metrics Height field but ended the gesture with `dragleave` + `dragend` and **no `drop`** to the field (probes dev5–dev7; field value unchanged, "178"). The runner never alters the drag data. The precondition therefore requires the release to be over the field after a trusted `dragover` on it, and records `dropDeliveredToField: false`; the contract's requirement (zero writes, preview reverts) is judged and holds. Tasks has no always-visible text field, so the Metrics profile field was used. The browser insertion of §6 item 9 was not observed.
2. **Coordinator branch** uses a synthetic generation coordinator in the auth-session context (precedent: Appearance E12 row h); the real coordinator's persistence and remote sign-out are not exercised.
3. **419e56d references** (rows a, h, k) are recorded, never judged as the product under test; their outcomes are the comparison basis.
4. **Row d history counters** are recorded but not judged (the AvatarMenu Settings navigation's exact counter shape is not specified by the contract); g, e, x5 and every no-navigation segment are judged.
5. **Row a** runs with the pet visible so the fixed and 419e56d mount windows are identical; every other row hides the pet first (R-PET gated mode). The popover close uses one trusted Escape (20 presses in `protection`, all audited).
6. **Unexpected or unasked dialogs** are product checks (not harness preconditions), so a wrong prompt would show as a product FAIL with exit 2.
7. **Development probes** (all with `XAI_NATIVE_EVIDENCE_DIR` in the session scratchpad, optionally `XAI_NATIVE_ONLY`; none committed or cited):

| Probe | Rows | Outcome | Change afterwards |
| --- | --- | --- | --- |
| controls dev1 | b, d1 | All product checks PASS; the run-level runtime gate counted the self-test's own `console.error` | Exclude that positive control by exact text and source |
| controls dev2 | c, e, f, u | Script error: archive facts read before any mount | Added one clean "prime" mount at the start of every mode |
| controls dev3 | c, e, f, u | PASS | None |
| controls dev4 | p, r | Harness-invalid: no text field on `/app/tasks` | Row r text-field case on `/app/metrics` |
| controls dev5 | r | Harness-invalid: finder picked a field later scrolled out of view | Finder stops at the first hit field |
| controls dev6, dev7 | r | Harness-invalid: no `drop` delivered to the field (trace recorded) | Deviation 1 |
| controls dev8 | r | PASS | None |
| controls dev9 | o | PASS (909 product checks) | None |
| protection dev1 | a, d | Script error (`const` used before initialisation) | Converted three helpers to function declarations |
| protection dev2 | a, d | Harness-invalid at Export: the product's untrusted anchor click counted as a second click | The click precondition counts trusted clicks only |
| protection dev3–dev6 | d, g; h, i; j, k, l, n, q; j | PASS | Added screenshots only |
| export dev1, dev2 | all | PASS | Added screenshots only |

No assertion was weakened between probes and the authoritative runs except deviation 1 (made explicit), and no expected value was taken from a probe.

## 9. Limitations

- Headless Chrome 155 on macOS, not Tauri; synthetic auth session (and coordinator); development build without StrictMode; dependency trees reused read-only behind the lockfile gate.
- `beforeunload` is asserted by listener census and a synthetic cancelable event; real prompts were seen only on runner navigations.
- Second documents are product-free same-origin tabs; fixture-held locks live in the App document.
- Not covered here: E12 (downstream, row m cross-document, clean-state chrome invariance), E13 (visual, pet-on, 44×44 across widths), E14 (keyboard, focus walks), E15–E25 and final acceptance.
