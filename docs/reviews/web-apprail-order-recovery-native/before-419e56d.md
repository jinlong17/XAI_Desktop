# AppRail order recovery: native before evidence (CP-APPRAIL-01, batch 58, E4)

**Verdict: FROZEN.** This directory freezes the native before evidence for the AppRail order caller (`xai_rail_order`) in real headless Chrome, in the production `App` composition, with trusted input only, against the before product `419e56d`. It is contract r1 §15 item **E4** (§12 "Native before").

- Six modes, one authoritative run each (`before1`). All six are harness-valid: zero failed preconditions.
- **H1, H2, H3, H4, H5, H6, H8 and H9 are confirmed natively** (correct before FAILs). **H11**, a positive control, PASSES in EN and ZH across two real documents. The positive control P6 (final bytes of an all-visible drag) PASSES.
- Every recorded drag event is trusted. The K-1 key audit holds in every run, and no run sends `nativeVirtualKeyCode`.
- All 51 screenshots were reviewed by the executor (§7).

This is evidence only. It changes no product source, product test, contract, prior evidence, ledger or control plane. It accepts nothing, does not authorize Terra and closes no 312 item.

## 1. Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, parent native verifier role, isolated worktree `.claude/worktrees/agent-ac30bd6d871d15a1b`. It did not write the contract, the Sol oracles, the parent host baseline or any product code |
| Docs base (detached HEAD) | `d961694ef8160664238fa1c0da590f68da4663a5` (control plane batch 58); every log records `docsHead` (line 2) |
| Requested before revision | `419e56d` |
| Resolved commit / tree | `419e56de9f23e4467fea806fbd4a990e1f429941` / `7aabbd832be446aeca1441eff34f2fd35945290a`. Package trees: `xai-web-shell` `372b08be267a7dd7f734c8ff0c770a7ca3a87cf1`, `apps/web` `23f1070ec28841df45d13c12f0523e679f46dcba`, both equal to the contract header (log line 2, `packageTrees`) |
| Product delta, docs head vs revision | Empty (`productDeltaVsDocsHead: ""`, precondition `baseline:docs-head-product-tree-equals-revision`) |
| Authority | `../web-apprail-order-recovery-contract/contract.md` r1 (`f7726d7`, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`, checked by every run: `baseline:contract-r1-hash`). In particular R-1, A2, A5–A8, §5 (wording and selectors), §6 (drag model and trusted input), §7, §9, §12 (native before, H1–H11) and §15 E4. Also `../20260908-full-product-audit/CURRENT-CONTROL-PLANE.md`, "本轮唯一任务" (batch 58) and the CP-APPRAIL-01 row |
| Conventions read (not imported or modified) | `../web-appearance-recovery-native/verify-native-fixed.mjs` (pipe transport, `press()` without `nativeVirtualKeyCode`, key audit, seed page, archive pin/guard), `native-fixed-app.tsx` (composition), `native-fixed-prelude.js` (instruments); `../web-features-recovery-native/verify-native-before.mjs` (CDP drag pattern); `../web-native-keyinput-k1/review-k1.md` |
| Iterations | One authoritative run per mode (`before1`). No diagnostic iteration (`before2`/`before3`) was needed. Development probes are disclosed in §8 |

## 2. Files and SHA-256

Every new file in this directory except this receipt, which cannot carry its own hash.

| File | Role | SHA-256 |
| --- | --- | --- |
| `verify-native-before.mjs` | Runner | `ccabd5000d4b9e04cf775c4bb1bd79c0860d5def55f46799a651d69714f6a84e` |
| `native-before-app.tsx` | Fixture (production `App` composition) | `fa70e2eb892bca9c2bd2f4c910c737e44963d52433f475253d6f966eb0608a7e` |
| `native-before-prelude.js` | Page prelude (instruments) | `a4ba378110a4fcded7eccf0d88f8f41c281a42c10599b17f68832a3a3931f635` |
| `native-419e56d-before1-h1.log` | **Authoritative** H1 log (462 lines) | `a222683d5b706d7129c70dabe3aa1b948d97bf5029fddd2d6c22493bbdd83d6f` |
| `native-419e56d-before1-drag.log` | **Authoritative** H2, H3, H4, H6, P6 log (267 lines) | `cc4dce233db0e66fbe1672e5a403c413af80a9d8471e772533304626d883cb14` |
| `native-419e56d-before1-r1.log` | **Authoritative** H5 log (126 lines) | `7984a7808b3ce58984b360fe8e5122eae16ae93e25d29aef8c79bebfdf8449ae` |
| `native-419e56d-before1-h8.log` | **Authoritative** H8 log (78 lines) | `0e8b611adbc02e0d335807af905c9f8985053d7b3cb6a90f54164c84677340c7` |
| `native-419e56d-before1-h9.log` | **Authoritative** H9 log (165 lines) | `02e671ff35f98780b28926b6228c8b45136f4abc5c263ab4c2bd22a0cdb577bb` |
| `native-419e56d-before1-h11.log` | **Authoritative** H11 log (115 lines) | `fe9704687ad3807070b3c8e7193675656d2bad4e5f20626260c801a168442877` |

Each log's line 2 (`baseline.fileSha256`) records exactly the three code hashes above, so every authoritative log was produced by exactly these files. The 51 screenshots:

| Screenshot | SHA-256 |
| --- | --- |
| `native-419e56d-before1-drag-h2-en-quota-after-drop.png` | `3f861fe87460bb065ef3c8998d8bf3da5baca81e5df9369ef0e8635cfec49acb` |
| `native-419e56d-before1-drag-h2-en-throwing-setitem-after-drop.png` | `3f861fe87460bb065ef3c8998d8bf3da5baca81e5df9369ef0e8635cfec49acb` |
| `native-419e56d-before1-drag-h2-zh-quota-after-drop.png` | `ff15ed3ce4fcd6c5187da86e5fc31ebb75d565198cffe56b0ea39fd16d63c773` |
| `native-419e56d-before1-drag-h2-zh-throwing-setitem-after-drop.png` | `a11f83bbaa44b3065fa4c878d948800d83dea5936ba55c0863e75b2202cc55a1` |
| `native-419e56d-before1-drag-h3-after-drop.png` | `7019b04d7392f3eb83d3b46dbc674aa9078299c2a694ba075fccc3f036b84d80` |
| `native-419e56d-before1-drag-h4-cancel-after.png` | `e50cb0738bc9e415984fe98704978dcf2cc6137886c9ed8689f428b412d5a801` |
| `native-419e56d-before1-drag-h4-drop-outside-after.png` | `b87e162e4dec29c5912d05be78883432da9fa02210bbe0d9ab833fb0eb029544` |
| `native-419e56d-before1-drag-pc-p6-after-drop.png` | `6ec38c9ca1b3814ddc273cb079f2c12e6c6c437c27400640fa3b1be769036895` |
| `native-419e56d-before1-h1-en-false-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-false-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-number-0-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-number-0-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-number-1-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-number-1-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-number-minus-1-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-number-minus-1-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-object-empty-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-object-empty-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-object-tasks-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-object-tasks-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-true-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-en-true-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-false-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-false-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-number-0-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-number-0-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-number-1-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-number-1-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-number-minus-1-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-number-minus-1-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-object-empty-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-object-empty-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-object-tasks-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-object-tasks-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-true-settings-appearance.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h1-zh-true-tasks.png` | `4ab05fb85263e68ca052309c3b00faef0d7c1a8be7fa679b2270dc2960149cf1` |
| `native-419e56d-before1-h11-en-a-after-b-commits.png` | `602bd0eb07c5724dbe6a035d38f4f394722f8b105feb2d55e27cbf7a3a1fb5be` |
| `native-419e56d-before1-h11-en-a-before.png` | `b1c1dbe11dd10551be699bfd24de6a83c73d4b7cf00d9acc3849fea8dc7470c4` |
| `native-419e56d-before1-h11-zh-a-after-b-commits.png` | `829b5524fac9fa87baf70ff30368e56663bdbd063530ec499624cb605139b408` |
| `native-419e56d-before1-h11-zh-a-before.png` | `5e48ea87d069b17f70194572880a1947f4de000a8ce2ec19038637f3d24a25e0` |
| `native-419e56d-before1-h8-en-board-tasks-board.png` | `45c41a5cacce54ec67bf42337beaab3adc7bfeda30f7d81124a368881b173909` |
| `native-419e56d-before1-h8-en-tasks-twice.png` | `34108d8f06fc9627aa339ff826a201f039ae8f2cf02e803ce8149dcc13592734` |
| `native-419e56d-before1-h8-zh-board-tasks-board.png` | `5d0d15ae4d2c1d2796413960bedfb38c374a9cf1d110b6e79666ae4c3bef8790` |
| `native-419e56d-before1-h8-zh-tasks-twice.png` | `6de4f6ca885f93f31880b9c26516249538d6f42f548f272b46adf5b7b3584331` |
| `native-419e56d-before1-h9-en-after-failed-drag.png` | `322cee3163f21c8ea4f62ca7ce99a93226e9650150d2ad20d42f4409b0b9c808` |
| `native-419e56d-before1-h9-en-after-sign-out.png` | `9fe77535888f36d88e52950cd46ae419e2cde59f9edcc748c468373fc6aabf2f` |
| `native-419e56d-before1-h9-zh-after-failed-drag.png` | `38c9cd5e05866f568dcb90e508f4d54604d19027843bb792dd246762f27e1250` |
| `native-419e56d-before1-h9-zh-after-sign-out.png` | `9fe77535888f36d88e52950cd46ae419e2cde59f9edcc748c468373fc6aabf2f` |
| `native-419e56d-before1-r1-h5-en-1440-after-drop.png` | `e9e110f81df851d395cd98e6fa4f3453cf52a53ace24d6822a8d5d4937fdb835` |
| `native-419e56d-before1-r1-h5-en-1440-after-re-enabling.png` | `cb7966b3d1a2389b4740f1d8b04f1488598864d146aafc63d1facfd620eb16ea` |
| `native-419e56d-before1-r1-h5-en-1440-boards-hidden.png` | `5de703ff027325b2267871c6d5874ded46820a785f01875b0427ac8766fd76f2` |

## 3. Commands

Run from the root of this worktree. The dependency root (the main checkout) was read only: nothing was written, installed, built or checked out there, and no dev server was started anywhere. The temporary directory was this session's scratchpad; every run deleted its own archive, profile and bundle.

```sh
XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop \
XAI_NATIVE_TMPDIR=<scratchpad>/tmp \
  node docs/reviews/web-apprail-order-recovery-native/verify-native-before.mjs 419e56d <mode> before1
# drag -> VALID checks=233 exit=2    r1  -> VALID checks=107 exit=2    h8  -> VALID checks=59 exit=2
# h9   -> VALID checks=143 exit=2    h11 -> VALID checks=97  exit=0    h1  -> VALID checks=341 exit=2
```

Exit codes: 0 = harness valid and every requirement holds; 2 = harness valid with at least one requirement failing (the correct before FAILs); 1 = harness invalid. Nonzero codes are preserved. The runner refuses to overwrite an existing log (`flag: "wx"`, checked before building as well). After the runs no Chrome process with `--remote-debugging-pipe` remained and the temporary directory was empty.

**Fixed rerun.** These files are before evidence for E4. The fixed-stage native items (E9–E14) belong to new runners; this runner's verdicts already encode the fixed requirements, so a rerun with a new suffix at the fixed SHA shows which requirements then hold. Its product-delta precondition (`baseline:docs-head-product-tree-equals-revision`) and the 13-row contract source table bind it to `419e56d`.

## 4. Harness, provenance and transport

- **Immutable archive.** `git archive 419e56de…` expanded into a fresh temporary directory per run, deleted afterwards. Requested and resolved SHA are recorded (line 2: `requested`, `resolved`, `resolvedTree`).
- **Lockfile gate.** The contract gate, the dependency checkout's `pnpm-lock.yaml`, `git show 419e56d:pnpm-lock.yaml` and the extracted archive's lockfile are all `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` (line 2, `lockfileSha256`; precondition `baseline:lockfile-gate`).
- **Contract source table.** 13/13 files equal contract r1's header table, including `AppRail.tsx` `6312caa1…`, `internal/dnd.ts` `a538b51f…`, `App.tsx` `24461a52…` and `departureCoordinator.tsx` `0844a697…` (line 2, `contractSourceTable.mismatches: []`).
- **`@repo` pinned into the archive behind a guard.** An esbuild plugin resolves every `@repo/*` specifier to the archive's own package export and fails the build if any module loads from the `packages/`, `apps/` or `docs/` tree of the dependency checkout or of this worktree. Result in every log: zero guard violations, zero foreign inputs, 625 archive modules loaded, and all 39 required reader, writer and host modules bundled from the archive (`requiredModules.missing: []`), among them `AppRail.tsx`, `internal/dnd.ts`, storage `usePref.ts`, `storage.ts`, `codec.ts`, `registry.ts`, `prefMutation.ts`, `usePrefAsync.ts`, the Features pane and filter, `departureCoordinator.tsx` and `App.tsx`. Bundle SHA-256 `f5d638a328b066b7f415e5c9f4a333b317bde9927e6f7477b9ff195aa4e80605` (identical in all six runs).
- **Composition.** `native-before-app.tsx` follows the `apps/web/src/main.tsx` module order and renders the production router instance under `RouterProvider`, inside the production `WebAuthSessionProvider` with the production `invalidateAccountIdentity`. **The only synthetic input is the auth session** (a client whose `getSession` resolves one session for `apprail-native-A`); `App.handleSignOut` therefore takes its fallback branch. Uninstrumented seeding of storage on a product-free `/seed` page, a fixture-held Web Lock (H6) and storage faults (H2, H9) are instruments, as in the accepted precedents. The account's committed generation marker is seeded; every App mount asserts `auth-session-context-served-by-real-provider`, `account-data-gate-activated-account` and `real-lock-name-and-unscoped-device-key` (`xai:pref:v1:xai_rail_order`, physical key `xai_rail_order`).
- **Archive facts** (line 21, `archive-facts`; line 22 in h8): 14 rail registrations in `railOrder` order (`ai` … `statistics`, with `timetrack` 7.5, `bookkeeping` 7.6, `metrics` 7.7), `settings` `showInRail: false`; the registry default of `xai_rail_order` is the 12 defaults, codec `json`. Expected bytes come from the runner's own `displayOrder`, `merge` and `reorder`, written from contract §2, A2 and §6, never from the product.
- **Browser.** `Chrome/155.0.8059.39` (HeadlessChrome/155.0.0.0), protocol 1.3, Node v24.16.0, esbuild 0.28.1, React 19.2.0, react-router 7.15.1 (line 2). Headless, isolated profile, every host except `127.0.0.1` mapped to NOTFOUND; zero non-local network attempts in every run.
- **Transport.** The DevTools pipe (`--remote-debugging-pipe`), flattened target sessions, never a WebSocket. Every evaluation and input is bounded.
- **Instrument self-test** (line 10; line 11 in h8), on the product-free seed page: quota and throwing-`setItem` faults throw and never store; delegation works; total denial covers every Storage operation; the F-B002 depth counter shows zero nested Storage calls; StorageEvent and bus dispatches are counted; a non-local fetch is refused and logged; a fixture Web Lock is held and then released, with fixture/app attribution; `window.confirm` is wrapped; the `beforeunload` census and synthetic warning work; untrusted clicks and drags are recorded as untrusted.
- **Trusted input.** Clicks: `Input.dispatchMouseEvent` after a centre hit-test. Drags (contract §6 item 8): `Input.setInterceptDrags`, then mouse press and move on the source, then `Input.dispatchDragEvent` `dragEnter`, `dragOver`, and `drop` or `dragCancel`. The source and every target are centre-hit-tested and uncovered first. A passive capture-phase recorder (never `preventDefault`/`stopPropagation`) requires every recorded drag event to be trusted, a trusted `dragstart` on the source, a trusted `dragover` on every target, a `dragend`, and exactly one trusted `drop` inside `.rail-items` when the gesture ends in a drop (or none there when it is cancelled). No page-context synthetic `DragEvent` is used. The real `window.confirm` and `beforeunload` dialogs would be answered through `Page.handleJavaScriptDialog`; none occurred. In h9 the final `window.location.assign("/")` is intercepted through the CDP Fetch domain and answered with 204 so the document stays inspectable.
- **K-1 key audit.** The only key press is one trusted Escape on the product-free seed page (rawKeyDown/keyUp with `key`, `code` and `windowsVirtualKeyCode`, no `nativeVirtualKeyCode`), as a positive control: precondition `instruments:k1-one-trusted-escape-is-exactly-one-keydown-and-keyup`. Every document's passive key trace is collected before it is left, and the run-level precondition `run:k1-keyboard-trace-contains-only-the-runner-key-presses` requires exactly the runner's presses. Result per run (`k1:keyboard-audit` lines drag 260, h1 455, h11 108, h8 71, h9 158, r1 119): runner presses 1, keydowns 1, keyups 1, keypresses 0, untrusted 0, mismatches 0, over 20, 102, 12, 8, 12 and 8 documents.
- **Runtime errors.** Outside the cases whose subject is a crash or a duplicate key there are zero runtime errors in every run (`run:zero-runtime-errors-outside-the-crash-and-duplicate-cases` PASS; `run:runtime-errors` lines drag 264, h1 459, h11 112, h8 75, h9 162, r1 123). h1 records 168 errors, all inside the crashing-value cases (React's uncaught render error reports); h8 records 4, one duplicate-key warning per case.

## 5. Results per hypothesis

"Confirmed (correct FAIL)" means the contract requirement fails at `419e56d` as the hypothesis predicts; the paired *fact* records the before behaviour the hypothesis asserts. Line numbers refer to the named log.

| Hyp. | Case(s) | Result | Evidence (log line) |
| --- | --- | --- | --- |
| **H1** | Each of `{}`, `{"tasks":1}`, `1`, `0`, `-1`, `true`, `false`, in EN and ZH sessions, on `/app/tasks`, `/app/settings/appearance`, `/app/dashboard` and `/app/calendar`, then a reload of `/app/tasks` | **Confirmed** for all 7 values × 2 languages (14/14). Every route renders "Route Error (app)" with the message "prefOrder is not iterable", with no Topbar and no rail; the reload repeats it. The error page has zero buttons, links and fields; mount makes zero set/remove attempts and the bytes persist across reloads | h1: requirement lines 51, 81, 111, 141, 171, 201, 231 (EN) and 271, 301, 331, 361, 391, 421, 451 (ZH); facts on the two following lines of each (e.g. 52–53: messages `["prefOrder is not iterable"]`, `afterReload` heading "Route Error (app)"). Clean positive control per language (absent bytes mount and display the reconciled default) passes as a precondition |
| **H2** | A trusted drag (first rail button onto the third) and drop with `setItem("xai_rail_order")` failing: `QuotaExceededError` and a throwing `setItem` (`SecurityError`), in EN and ZH | **Confirmed** 4/4. The fault is armed and observed (three denied set attempts per gesture, all during `dragover`), the bytes keep the old order, the rail shows the stored order throughout (the preview never changes because `usePref` updates only on success), no rail status, panel, message or action exists anywhere, no unload warning | drag: requirement 175, 202, 229, 256; facts 176, 203, 230, 257 |
| **H3** | Two-step trusted drag (first button over the third, then over the sixth) and drop | **Confirmed.** Exactly two `setItem` attempts, both during `dragover`, equal to the two previews; none at the drop | drag: 71 (requirement), 72 (fact: `during` = the two expected orders, `atDrop: []`) |
| **H4** | Trusted drag over the third button ended by `dragCancel`; and ended by a release on the main content outside the rail | **Confirmed** 2/2. The previewed order was written during `dragover` and persists after the cancel; the rail keeps the preview | drag: 96–97 (`dragCancel`), 122–123 (drop outside; the outside point is a `.sec-label` on `/app/tasks`, not editable, not in the rail; Chrome delivers no `drop`, only `dragleave` and `dragend`) |
| **H5** | (a) Seeded order with `board` at index 2, Features keys `true`; Boards turned off through the real Features pane by a trusted click; trusted drag of the first visible button onto the third and drop; Boards turned on by a trusted click (EN and ZH, 1440×900). (b) `ghost-module` at index 0, all visible, one drag (EN) | **Confirmed.** (a) The written bytes lack `board` (`["tasks","dashboard","calendar",…,"statistics"]`, expected merge keeps `board` at index 2); after re-enabling, Boards displays last (index 13) instead of index 2; in both languages. The two Features toggles wrote nothing to `xai_rail_order` (control fact). (b) `ghost-module` is pruned by the first drag | r1: 56–57 and 90–91 (requirements), 58 and 92 (facts), 59 and 93 (toggle control), 55 and 89 (`sequence`: S, R, D, P, bytes, expected merge, re-enabled display); ghost 116–117 |
| **H6** | Fixture holds the real per-key lock `xai:pref:v1:xai_rail_order` (verified held through `navigator.locks.query()`), then a trusted drag and drop | **Confirmed.** The bytes change while the lock is held; the product requested no Web Lock during the gesture; after release there is no further write | drag: 149 (requirement: `bytesWhileHeld` = the previewed order, `setsAfterRelease: 0`, `appLockRequestsDuringGesture: []`), 150 (fact) |
| **H8** | `["tasks","tasks"]` and `["board","tasks","board"]` at load, EN and ZH | **Confirmed** 4/4. The repeated module renders twice (15 rail buttons instead of 14), with zero mount writes and unchanged bytes, and no source status; React reports the duplicate key once per case | h8: requirement 26, 40, 54, 68; facts 27, 41, 55, 69 |
| **H9** | On `/app/tasks` after a failed trusted drag (quota fault armed and observed), EN and ZH: (a) Topbar and recovery surfaces, `beforeunload` census, the synthetic event and a real runner navigation away; (b) sign-out through the real AvatarMenu and SignOutConfirmDialog | **Confirmed** 6/6. (a) No `[data-testid="rail-order-status"]`, no panel, no normative EN/ZH rail text anywhere (Topbar controls are only `topbar-pref`); zero live `beforeunload` listeners, the synthetic event is not prevented and the real navigation shows no prompt. (b) Zero `window.confirm`; identity invalidated, `client.auth.signOut` called once, one document request for `/` | h9: 48–52 (EN a), 87–88 (EN b), 115–119 (ZH a), 154–155 (ZH b) |
| **H11** (positive control) | Two real documents, EN and ZH: (a) a second production App document (a second tab) commits an order through a trusted drag; (b) a product-free second document writes a valid order | **PASS** 4/4, as required at both products. The idle first document's rail follows live without a reload (same document instance), receives trusted `storage` events and makes zero attempts on the key | h11: 50, 64, 92, 106 |
| P6 (positive control) | All-visible trusted drag and drop | **PASS.** Final bytes equal merge(S, R, P) = P | drag: 45 |

Not in the E4 list and therefore not run natively here: H7 and H10 (Sol layer, E2).

## 6. Observations for the controller

1. **Unrelated Tasks alert on `/app/tasks`.** In this synthetic composition the Tasks module shows its own save-failure alert ("Could not save. Your changes are still here…" / "保存失败，修改仍保留在此处…", `TaskSaveFailure.tsx`) at mount, before any rail action (`*:mounted` observations, field `alertsAtMount`). It is pre-existing, outside the rail, and the reason the Appearance native runner chose `/app/calendar` for some rows. It does not affect any rail verdict: H2 and H9 test the absence of the contract's normative rail wording and `data-testid="rail-order-*"` controls, not the absence of every alert. It appears in the `/app/tasks` screenshots.
2. **Resting-pointer `dragover`.** Each drag step sends `dragEnter`, `dragOver`, then one more `dragOver` at the same point (development probe 1, §8). After a reorder the dragged button sits under the resting pointer, and Chrome accepts a drop only over an element whose latest `dragover` was accepted; a real pointer keeps sending `dragover`. At `419e56d` the extra `dragOver` lands on the dragged button itself and writes nothing (H3 still shows exactly two writes); in H2 it repeats the denied write (three denied attempts).
3. **H9 covers the fallback auth branch only.** The synthetic session has no coordinator, so `handleSignOut` takes its fallback branch. The coordinator branch is covered at the host layer (E3).
4. **H2 display.** At `419e56d` the failed drag never shows a preview at all (the legacy `usePref` updates state only on a successful write), so "the rail returns to the stored order" is observed as "the rail stays at the stored order".

## 7. Screenshot review (executor, each image opened)

| Screenshot(s) | Conclusion |
| --- | --- |
| The 28 H1 captures (`h1-{en,zh}-<value>-{tasks,settings-appearance}`) | All 28 are byte-identical (SHA-256 `4ab05fb8…`). Each shows only "Route Error (app)" and "prefOrder is not iterable" centred on a blank page: no rail, Topbar, Settings or any control. The boundary text is fixed English, so the ZH sessions look the same. Confirms H1 and "no UI can repair it" |
| `drag-pc-p6-after-drop` | Rail with the Statistics icon moved to the third slot (tooltip "Statistics"), Topbar shows only the appearance trigger. Positive control as expected |
| `drag-h3-after-drop` | Statistics icon in the sixth slot after the two-step drag; no status. Consistent with H3's second write |
| `drag-h4-cancel-after`, `drag-h4-drop-outside-after` | Statistics icon remains in the third slot after the cancelled drags (the preview persisted); no status. Consistent with H4 |
| `drag-h2-en-quota-after-drop`, `drag-h2-en-throwing-setitem-after-drop` (byte-identical), `drag-h2-zh-quota-after-drop`, `drag-h2-zh-throwing-setitem-after-drop` | Rail unchanged in the seeded reversed order (Statistics first, Meditation third with its tooltip "Meditation" / "冥想"); Topbar has only "EN · Light · Comfortable" / "中文 · 浅色 · 舒适"; no rail message anywhere. Silent no-op (H2). The red alert top left is the unrelated Tasks alert (§6 item 1) |
| `h9-en-after-failed-drag`, `h9-zh-after-failed-drag` | Same state as H2 in each language: no rail status in the Topbar, rail in the stored order |
| `h9-en-after-sign-out`, `h9-zh-after-sign-out` (byte-identical) | The Authentication page at `/auth/login`: the sign-out completed without any rail prompt (H9) |
| `h8-en-tasks-twice`, `h8-zh-tasks-twice` | Two Tasks (checkbox) buttons at the top of the rail, both highlighted active (H8) |
| `h8-en-board-tasks-board`, `h8-zh-board-tasks-board` | The Boards (kanban) icon in the first and third slots, Tasks between them (H8) |
| `h11-{en,zh}-a-before`, `h11-{en,zh}-a-after-b-commits` | Document A before: Statistics, Countdown, Meditation at the top; after document B's drag: Countdown, Meditation, Statistics, with no reload. Positive control H11 |
| `r1-h5-en-1440-boards-hidden` | Features pane with the Boards switch off (grey); rail has 13 buttons, Calendar first and no Boards |
| `r1-h5-en-1440-after-drop` | Calendar moved to the third slot (tooltip "Calendar"); Boards still off |
| `r1-h5-en-1440-after-re-enabling` | Boards switch on; the Boards icon appears last in the rail (bottom slot), not at index 2. Confirms H5 |

## 8. Development probes (disclosed)

Development probes ran the same runner with `XAI_NATIVE_EVIDENCE_DIR` pointing to the session scratchpad, outside the repository (the runner refuses an evidence directory inside it). None of their output is committed or cited as evidence.

| Probe | Mode(s) | Outcome | Change made afterwards |
| --- | --- | --- | --- |
| probe1 | drag | Harness-invalid at `pc-p6:trusted-drop-inside-rail-items`: no `drop` reached the rail | Added the resting-pointer `dragOver` after each step and in the outside release (§6 item 2) |
| probe2 | drag | Harness-valid; same verdicts as `before1` | Added the `alertsAtMount` observation after noticing the unrelated Tasks alert |
| probe3 | h9, h11, h8 | Harness-valid; same verdicts as `before1` | None |
| probe4 | r1, h1 | r1 failed before any check with a script error (a `const` read before its declaration); h1 harness-valid, same verdicts as `before1` | Moved the two Features-pane selector constants above the run section |
| probe5 | r1 | Harness-valid; same verdicts as `before1` | None |

No assertion was weakened between probes and the authoritative runs, and no expected value was taken from a probe.

## 9. Limitations

- Headless Chrome on macOS with a synthetic auth session and a development build (no StrictMode), with dependency trees reused read-only from the main checkout behind the lockfile gate. Not Tauri.
- The `beforeunload` evidence is a listener census, a synthetic cancelable event and one real runner navigation (headless Chrome shows such prompts for documents with user activation; none appeared).
- `/app/tasks` carries the unrelated Tasks alert (§6 item 1).
- The second App document in H11 (a) is a second tab of the same profile driven by trusted CDP input on its own session.
