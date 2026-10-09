# CP-APPRAIL-01 final acceptance at `f9eb4b1`: ACCEPTED

- **Date:** 2026-10-09
- **Module:** `web`
- **Control-plane item:** CP-APPRAIL-01, batch 65. The caller covers the AppRail order (`xai_rail_order`): its drag writer, the R-1 index-slot merge, and the App-lifetime protection (Topbar status and panel, unload warning, sign-out step).
- **Reviewer:** Claude Opus 5.5, independent final-acceptance reviewer (Astra-role mapping). I did not write the contract, any oracle, runner, fixture or copy under review, the implementation, or any E1–E25 evidence. I share no context with those instances.
- **Verdict: ACCEPTED.**
  - All nine contract §14 gates reconcile the four required facts: the source, a correct before failure, fixed independent behaviour and the actual user surface (§3).
  - Every §15 item E1–E25 is present. I re-derived all 456 SHA-256 values in the E25 hash log: 0 mismatches. For every ID I also re-derived at least one principal artifact, and checked three things for it: git added it exactly once, in its producing commit; nothing has touched it since; and its hash appears in its producer's receipt (§5).
  - My own reading of the 19 §11 files finds that the implementation meets R-1, A1–A11 and §5–§10 (§4). A property check of the shipped pure model holds for P1–P7 over 470 generated cases (§4, H3).
  - All 15 items put to this review are **CONFIRMED** (§6). Items 4 and 8 carry stated qualifications.
  - None of the §14 "cannot be closed by" conditions holds (§7).
  - No product failure was found. No product, oracle or matrix rerun was needed; my checks are read-only (§8).

This acceptance covers only this recovery caller (§10).

## 1. Fixed boundary

| Item | Value |
| --- | --- |
| Review checkout | Isolated worktree `.claude/worktrees/agent-a1b441b82bd8f6da1`. I ran `git fetch origin codex/web/full-product-audit-20260908`, then `git checkout --detach 82d505756d39535b623f9437abcbdc9635ba7318`; `git status` was clean. The main checkout was not read by any runner, written, or used for a server or preview |
| Fixed product | `f9eb4b1f207bc4b46f547b90afc250424b3c8695` (tree `05887cf1…`), parent `145b073` (batch-59 authorization). Run record `0d440ca` (parent `f9eb4b1`) |
| Before product | `419e56de9f23e4467fea806fbd4a990e1f429941` |
| Docs-head equality | `git diff --name-only f9eb4b1 HEAD -- apps packages package.json pnpm-lock.yaml` is empty (check A3) |
| Product diff `419e56d..f9eb4b1` | Exactly the 19 §11 files, +2960/−76. The full diff outside `docs/` is the same 19, and the `f9eb4b1` commit touches only these 19. There are exactly four new `src/internal/` modules. The `apps/` delta is only `App.tsx` and the new `App.railorder.test.tsx` (B1–B8) |
| Protected surface | The 12 protected packages, `package.json` and `pnpm-lock.yaml` have an empty diff. Every changed shell path is a §11 file. `dnd.ts`, `registry.tsx`, `AvatarMenu.tsx`, `SignOutConfirmDialog.tsx`, `departureCoordinator.tsx`, storage `registry.ts` and `layout.css` keep their blobs. All 22 pre-existing shell and web test files keep their blobs, except `Topbar.test.tsx`, whose numstat is `25 0` (additions only) (B6–B11) |
| Contract | `web-apprail-order-recovery-contract/contract.md` r1, `f7726d7`, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde`, re-derived at HEAD and at `f7726d7`. Its history is the single commit `f7726d7` (A5–A7) |
| Lockfile | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` at both SHAs (A4). I installed nothing and executed nothing from a dependency root |
| §15 ordering rule | E1–E5 (`d6ea500`, `6e9ec9c`, `04ee6a2`) are ancestors of Terra `f9eb4b1` (A8). The branch is linear from `419e56d` to HEAD |
| Evidence immutability | `git log --diff-filter=MDR 419e56d..HEAD -- docs/reviews` has 19 entries, all control-plane or ledger files under `20260908-full-product-audit/`. Every evidence file is an addition. The E18–E25 commit `ee60b48` has 143 `A` entries and nothing else (C1, C2) |

## 2. Product-owner decision R-1 and the controller confirmations

**R-1 (SET-03, 2026-10-06):** "拖动只调整可见模块的顺序，被关闭模块保留原位置，重新开启后回到原位".

| Fact | Evidence | Result |
| --- | --- | --- |
| Realization (A2 index slots) | `mergeRailOrder` (`internal/railOrderModel.ts:90–113`) walks S. A visible slot takes the next element of P, and a non-visible id stays at its index. The rest of P is appended. A non-permutation or an invalid S returns `null`, so nothing is written. The controller merges over S and R at drop time: S is the draft, else the committed value, else the default (`railOrderController.tsx:113–114`, `:155–159`) | Implemented |
| My property check | The shipped `railOrderModel.ts` was imported from `git show f9eb4b1:` by Node type stripping (H1–H5). There were 462 generated cases: 7 bases (absent/default, reversed, short, with `settings`, `ghost-module` and `""`), each toggleable module hidden in turn, three hidden at once, and shuffled P. There were also 8 P7 cases. Violations of P1–P7, of the display reconcile and of non-permutation refusal: 0. The 15 decoded §5 item 2 values are all outside the domain | Holds |
| Before failure | Sol `merge` before2: 4/21 with 0 PRECONDITION. E4 `r1`: all 5 H5 rows fail correctly (hidden index lost, Boards returns last, `ghost-module` pruned). I viewed `native-419e56d-before1-r1-h5-en-1440-after-re-enabling.png`: the Boards icon is last in the rail | Correct FAIL |
| Fixed, independent | Sol `merge` 21/21. E9 rows `c-en`/`c-zh` 22/22: R-1 end to end through the real Features pane by trusted input. E12 `bytes-*` rows 129/129, covering one hidden, three hidden, unknown id plus `settings`, absent, `[]`, and back to committed over a failed draft | PASS |
| Actual surface | I viewed the E13 R-1 sequence at 1440 EN (`…-visual-en-r1-en-1440-{boards-hidden,after-drop,after-re-enabling}.png`). After re-enabling, Boards is again the third rail item, which is its stored index 2 | Implemented end to end |

**The eight controller confirmations** (user-confirmed 2026-10-09; item 1 of §6):

1. R-1 is read as an index in the stored order. Implemented as above.
2. Unknown and non-rail ids are kept. The merge keeps every non-visible id (H3, P2). E12 `bytes-unknown-id-and-settings` passes.
3. A source issue shows a Topbar status with Reload only (`railOrderController.tsx:297–298`; `RailOrderStatus.tsx:171–181`). E9 rows `o-*` pass 906/906.
4. A cancelled drag reverts. `onDragEnd` drops the gesture, and only `onItemsDrop` calls `controller.drop` (G20, G21). E9 `r-*` rows pass 18/18. This is disclosed as a consequence of A7.
5. Two prompts, rail first. `App.tsx:176` (coordinator branch, after the capture check) and `:187` (fallback) come before the unchanged Appearance step (G6, G7). E10 rows `j-*` pass. No Appearance file changed (B6).
6. App creates the controller once in `AppInner`, inside `AccountStorageGate` (`App.tsx:139`, `:256`; G8).
7. C-RD1 is pre-registered, and its condition holds: §6 item 12.
8. The four host suites joined E23: 31 invocations via copies (§6 item 10).

## 3. Nine-gate reconciliation (contract §14)

Line numbers refer to `f9eb4b1`. "Sol" is `web-apprail-order-recovery-sol/`, "host" is `web-apprail-order-recovery-independent/`, "native" is `web-apprail-order-recovery-native/`, "F1" is `web-apprail-order-recovery-f1/` and "final" is `web-apprail-order-recovery-final/`. "AC" is `packages/xai-web-shell/src/internal/railOrderController.tsx`, "AR" is `AppRail.tsx` and "RS" is `internal/RailOrderStatus.tsx`. Every count below was parsed from the raw log by my checker (`acceptance-checks-f9eb4b1.log`, sections F–H), not copied from a receipt.

| Gate | Source (`f9eb4b1`) | Correct before failure (`419e56d`) | Fixed independent behaviour | Actual user surface | Verdict |
| --- | --- | --- | --- | --- | --- |
| **1. Field, domain and crash safety** | The strict validator `isRailOrder` (`railOrderModel.ts:23–32`) is composed with the `json` codec on the registered path (AC `:40`, `:276`). Invalid or unavailable bytes display the registry default (AC `:88–93`) and show a source status (AC `:297–298`). Reload and Discard only reread (AC `:139–150`, `:204–215`). The only write path is a drop (G20, G21). The display reconcile never throws and never repeats an id (`railOrderModel.ts:39–56`) | Sol `bytes` 21/26 and `domain` 1/31, both with 0 PRECONDITION. E3: `{}` and `1` give "Route Error (app)". E4 `h1`: 14 of 14 crash rows fail correctly. `h8`: 4 duplicate-render rows fail. I viewed `native-419e56d-before1-h1-zh-object-empty-tasks.png`: the whole page is "Route Error (app) / prefOrder is not iterable" | Sol `bytes` 26/26 and `domain` 31/31. E9 `o-*` 144 rows, 906/906: 18 values × EN/ZH × 3 routes, plus a drag over each. E12 `crash-*` 116 rows, 486/486: at load, and when written by a second document | I viewed the fixed `…-visual-zh-source-open-375.png`: the App renders, with the "顺序不可用" status and a Reload-only panel | **PASS** |
| **2. R-1 merge** | §2 | §2: Sol `merge` 4/21; E4 H5 | §2 and H3 | §2 | **PASS** |
| **3. Drag timing and trusted input** | `dragstart`, `dragenter`, `dragover` and `dragend` only change the in-memory gesture (AR `:106–141`, `:156–160`). One `controller.drop` sits in `onItemsDrop`, behind the external-drag, one-per-gesture and same-order guards (AR `:144–153`; G21). The preview shows only while it is a permutation of D(S, R) (AR `:93–95`, `:131`) | Sol `drag` before2 8/18. E4 `drag`: H3 (writes during `dragover`, none at the drop), H4 cancel and drop-outside (persisted), and H6 (ignores the held lock) all fail correctly, while PC-P6 holds | Sol `drag` 18/18. E9 `b*` 25/25 (one write per drop), `r-*` 18/18 (cancel, drop outside, drop on an input: zero writes, preview reverts), `d1` 10/10, `e` 7/7, `f` 8/8. The receipt reports 78 trusted drags whose events are all `isTrusted` | Production App in Chrome, driven by trusted CDP drags only | **PASS** (§6 items 4 and 6) |
| **4. Failure recovery and export** | Each draft is an exact object, and only that object may settle it (AC `:116–137`). Retry once, inert while pending (AC `:106–111`, `:180–198`). Discard detaches before the reread (AC `:199–203`). Reload is refused while a draft exists (AC `:204–206`). Export is memory-only, with liveness rechecks and best-effort cleanup (AC `:216–251`) | Sol `field` 1/24 and `continuity-export` 4/22. E4 `drag`: H2 is silent with quota and with a throwing `setItem`, EN and ZH (4 rows); H6 also fails | Sol `field` 24/24 and `continuity-export` 22/22. E10 `d-*` 22/22 (failed drag, Retry fails once and keeps focus, Retry succeeds and focus moves to the trigger). E11 68/68: five §8 disk shapes under total denial, plus three setup-failure cases (`xf-*`); 7 envelope JSONs on disk | Real Chrome downloads parsed from disk (E11) | **PASS** |
| **5. App-lifetime protection** | The Topbar slot comes after `appearanceStatus` (`Topbar.tsx:117`, `:124`; G10), with a pass-through at `Shell.tsx:86`. Render rule A8 (AC `:286–299`; RS `:109`; G22). `beforeunload` is registered only with a draft (AC `:312–321`). The sign-out step (AC `:252–266`) is awaited before the Appearance step in both branches (G6). There is no route guard. A focused status that unmounts sends focus to `.topbar-pref-trigger` (RS `:68–81`; G23) | Sol `host` before2 7/33. E3: 7 pass, 24 fail, 0 PRECONDITION. E4 `h9`: 6 rows fail correctly (no status, no `beforeunload`, no rail sign-out step). E5: f1 `before-no-rail-step`, f2 `before-unprotected`, f3 `before-pass-control` | Sol `host` 33/33. E8 31/31. E10 28 rows, 134/134: a, d, g–l, n, q, in both auth branches. E16: f1–f3 `fixed-pass`, 0 F1 signatures, 0 non-live calls; f3 is released once, with one commit to `/app/tasks`. E17: a1–a4 `fixed-pass` | The rail confirm text was recorded in a real Chrome `window.confirm` (F1 f1/f2). I viewed both statuses at 375 EN and ZH (`…-visual-{en,zh}-both-statuses-375.png`) | **PASS** (§6 item 2) |
| **6. Downstream, invariance and isolation** | Shell product source has zero storage-API spellings (G1). `AppRail.tsx` imports no storage package (G2). `App.tsx` adds no `localStorage` line (4 = 4), and `readLocalPref` is byte-identical (G3–G5). All 18 CSS selectors begin with `.rail-order-status` (G11) | E2 positive controls pass at `419e56d`: the P6 bytes, H11, and `original` 121/121. E4 `h11`: 4 cross-document controls hold | E12 1081/1081 (156 rows). The 24 clean-chrome rows pass 360/360 against `419e56d`. Isolation passes 38/38. Cross-document row m passes 34/34. Display truth passes 19/19. E18 passes 140/140; E19 and E20 pass | E12 compares rail and Topbar `outerHTML`, geometry and decoded pixels in the production App at both SHAs | **PASS** (§6 items 11 and 13) |
| **7. F1 regression** | The coordinator, router and `settingsDeparture` are unchanged (B11; B8 shows only `App.tsx` changed in `apps/`). The caller registers no guard | E5 rail F1 is `before-correct`. Selfcheck is harness-valid (165) at both SHAs | E15: 12/12 frozen invocations pass, with no "Invalid blocker state transition". E16 and E17 as in gate 5 | Native Chrome F1 runs in the production composition | **PASS** |
| **8. Presentation and keyboard** | Buttons are at least 44×44 (`railOrderStatus.css:19–27`, `:83–90`). A 2px `:focus-visible` outline covers every new control (`:123–127`; G12). There is no `.topbar-pref-option` and no `disabled` attribute (G13). Icon only at ≤767 px, where the panel is fixed under the Topbar (`:132–149`) | E13 captures the `419e56d` route error for `{}` and `1`, EN and ZH. The known UX-05 weak stop (first bottom-rail item at 375) is equal at `419e56d` | E13: 538/538 and 529/529, including 20 pet-on rows per language with new controls never covered. E14: 167/167 per language, with 928 and 906 presses and 0 key-audit mismatches. The receipt reports 1188 stop captures with 0 failures | I viewed the ZH 768 pet-on failed panel (the panel sits at the top and the pet at the bottom right, with no overlap) and the ZH 375 F-E14-1 capture (§6 item 8) | **PASS** (§6 items 7–9) |
| **9. Final regression and affected callers** | The 19 §11 files only. No selector lies outside `.rail-order-status*` and there is no shared delta, so no affected-caller visual or keyboard rerun is triggered | Controls at `419e56d`: web 29/178; the unchanged shell files and the 24 Topbar cases are identical at both SHAs. Frozen Features `downstream` 14/15 (012, F-FD1) | E21: shell 12 files, 205/205. E22: web 30 files, 196/196. `compare-accepted`: 85 MATCH, 0 DIFF. Every §13 prediction is matched (§6 item 12). E24: Features native host 341/341 and downstream 140/140 via the copy | E24 runs natively in the production composition | **PASS** (§6 items 10 and 12) |

## 4. Independent source review: R-1, A1–A11 and §5–§10

I read `git diff 419e56d f9eb4b1 -- apps packages` and the full new modules. These are `railOrderModel.ts`, `railOrderController.tsx`, `RailOrderStatus.tsx`, `railOrderCopy.ts`, `railOrderStatus.css`, `AppRail.tsx`, and the diffs of `App.tsx`, `Topbar.tsx`, `Shell.tsx`, `types.ts` and `index.ts`. I skimmed the docs and tests for disposition only.

| Clause | Implementation | Finding |
| --- | --- | --- |
| A1 scope | 19 §11 files; the protected surface is unchanged (§1) | Met |
| A2 / R-1 | §2; P1–P7 hold (H3) | Met |
| A3 one App-scoped controller | `useRailOrderController` (AC `:274–337`). `RailOrderProvider` (AC `:345–347`). App creates one with the Appearance language (`App.tsx:139`). AppRail uses the context controller, or a standalone one when there is no provider (AR `:44–56`). New exports are additive (`index.ts`) | Met |
| A4 registered binding, absolute sets | `usePrefAutosaveAsync("xai_rail_order", { validate })`. Each drop makes one `binding.edit(merged)`. There is no `reset` and no functional updater (G16) | Met |
| A5 strict domain, refuse never repair | `isRailOrder`. Source-only state, with no rewrite (gate 1). A drag over an invalid source is a refused failed draft (E9 `o-*`) | Met |
| A6 route-independent protection | Gate 5. Forced transitions are not blocked: E10 row n remounts with 0 runtime errors | Met |
| A7 one write per drop | Gate 3 | Met (D1, §6 item 4) |
| A8 feedback surface | `statusKind`: `failed` or `saving` only after `everFailed`; `source` only without a draft (AC `:286–299`). A first pending attempt renders no node. There is no success line. The panel content per state matches §7 item 2 (RS `:157–212`) | Met |
| A9 test dispositions | Existing tests are byte-identical. `Topbar.test.tsx` is additive, gaining TP-RAIL-1/2 (B9, B10). The new tests sit in the permitted locations | Met |
| A10 R-PET | E13 pet-on rows; the product never moves the pet (B6: `xai-web-pet` unchanged) | Met |
| A11 C-RD1 and copies | §6 items 10 and 12 | Met |
| §5 stable selectors and normative wording | All ten selectors are present (G14). All 36 EN/ZH strings of the §5 wording table appear verbatim in `railOrderCopy.ts` (G15) | Met |
| §5 item 3 identity and latest authority | The draft is established before `edit`. `settle` acts only on the current draft. Predecessor recovery never acknowledges the latest (AC `:116–137`, `:160–176`, `:195–196`). A drop back to the committed order over a failed draft is admitted, because D0 is the draft display (AR `:114`, `:150`); E12 `bytes-back-to-committed-over-a-failed-draft` passes | Met |
| §6 items 1–9 | The gesture captures D0 and P (AR `:114`). A gap drop is accepted only for a gesture started here (AR `:139–141`). A drop on X or on a gap bubbles to `.rail-items` (AR `:216–221`). An external drop is ignored (AR `:148`). Click suppression stays (AR `:245–247`). R changing mid-drag is refused by the permutation check (AR `:93–95`; `mergeRailOrder` `:96`). The `text/plain` payload is unchanged (AR `:107–112`) | Met; the dragenter reading is in §6 item 4 |
| §7 lifetime and protection | Unmount sets `alive = false` and clears the draft, so late completions are refused (AC `:302–309`, `:118`). The `confirmSignOut` texts and Cancel/OK semantics hold (AC `:252–266`). The controller code touches no account machinery (G17) | Met |
| §8 export | Filename `rail-order-draft.json`; `set` envelope holding the full merged value; memory only (G18; E11) | Met |
| §9 CSS and focus | Gate 8 | Met |
| §10 items 1–12 | Gates 6 and 9; E18–E25 | Met |

**Implementation note (not a finding).** `everFailed` is latched during render (AC `:292`). This mutation in render is idempotent, and the Appearance controller accepted the same pattern. It does not affect any requirement.

## 5. §15 checklist E1–E25: artifact paths and SHA-256

**Method** (`verify-acceptance.mjs`, sections D and E):
- **Section D:** every hash in `web-apprail-order-recovery-final/hashes-apprail-final-v1.log` is re-derived (456 values). E6 product files are hashed from `git show f9eb4b1:`. Result: 0 mismatches.
- **Section E:** for every ID, the principal artifacts below are re-derived. The checker confirms that git added each one exactly once, in the stated commit; that its last commit is that commit; and that its hash appears in the named producer receipt.

All rows pass; paths are relative to `docs/reviews/`.

| ID | Producing commit | Principal artifact: SHA-256 (re-derived by me) | Found in | Status |
| --- | --- | --- | --- | --- |
| E1 | `d6ea500` | `web-apprail-order-recovery-sol/verify-fixed.mjs` `e944cb226e3fa342727c913547ff5084e0ad38fad5293ed306cb512bf9f5a4e8`; `features-downstream.c-rd1.test.tsx` `6c57164ef5040444dad96fbf5933e90b095d465c64bdd6e8e5f3dcb6be2d1c7a`; `merge.test.tsx` `05f6e01081156e2d32076606f2b4f314f33246d6b96b0ab7ffa644a9de8d377a` | Sol README | Present |
| E2 | `d6ea500` | `web-apprail-order-recovery-sol/bytes-before1-419e56d.log` `94c87889a14f0a6097b6ad2c70fa92dd145f654d0fa53f0449aa86e4c7ffcc1b`; `merge-before2-419e56d.log` `9f6b774e883776ee9d73ffc9fc18ae27c642bf72130033e8d473cd1b77e2057e`; `features-sol-downstream-c-rd1-before1-419e56d.log` `c8f5ff44c2ca25c6560d6a0321bb96c3a002e7389a4e013f09f7c3c0bf687a4b` | Sol README | Present; all eight modes are correct FAILs with 0 PRECONDITION (F) |
| E3 | `6e9ec9c` | `web-apprail-order-recovery-independent/host-before1-419e56d.log` `ee5f6e1d2aaafabec04f961ab5f1d091a1bb5ad47fe1794e8e6fa1a96812ebb3` | host README | Present (7/31, 0 PRECONDITION) |
| E4 | `04ee6a2` | `web-apprail-order-recovery-native/native-419e56d-before1-h1.log` `a222683d5b706d7129c70dabe3aa1b948d97bf5029fddd2d6c22493bbdd83d6f`; `before-419e56d.md` `8253c075f386f07128a0e630fe51409ba9edd8cd3428b0a0e1734a4e3a5b1c2e` | native before receipt; E25 hash log | Present; 6 modes are harness-valid with correct FAILs |
| E5 | `04ee6a2` | `web-apprail-order-recovery-f1/f1-419e56d-railorder-before1.log` `3108774b08a066e8aa1584e576d97e154c892a92513006f6cc8c1b5902f064cd` | F1 before receipt | Present (`before-correct`) |
| E6 | `f9eb4b1` + `0d440ca` | `web-apprail-order-recovery-terra/shell-test-f9eb4b1.log` `72876c4e194de93f91e11d0197d7ea6ff1b270c862b8ab044c4c580d39ab92fa`; `web-test-f9eb4b1.log` `98f9673a134bc49f20b6f4bd3c849d32f065daf9e509683d86a1656c0855bbd3`; `implementation.md` `fe7bc377e09e9088163411a29fe3f2b81771bc07a5c00ac718f5880865d09086`. Product: the 19 §11 blobs at `f9eb4b1`, 19/19 found in the E19 log, e.g. `AppRail.tsx` `fe789078fecc60936d3e6c5fc2b203001a15490aecf30f3a0ca301da1399fb44` | Terra record; E25 receipt; E19 log | Present |
| E7 | `94b12ba` | `web-apprail-order-recovery-sol/bytes-apprail-fixed1-f9eb4b1.log` `68faf686902a88131d48adee20efe26b873a1c12fe670f6b2cbdc70eaf18a442`; `fixed-f9eb4b1.md` `e49a8fd8b2d1c8c07fd2c0654a2b18e0f8e30e29100ff200da6c330b0384f990` | Sol fixed receipt; E25 receipt | PASS (eight modes, 0 FAIL) |
| E8 | `94b12ba` | `web-apprail-order-recovery-independent/host-apprail-fixed1-f9eb4b1.log` `ba3c1bd4da61e26e14b7baa7ed8cf0717b29a79df610884c9f60a5b7199d86e5` | Sol fixed receipt | PASS (31/31) |
| E9 | `ae7b69e` | `web-apprail-order-recovery-native/native-f9eb4b1-fixed1-controls.log` `c416cf3f1d9daa26238bb6fa43486b34cd0319cb0e827c0d8b0ca66f0ad281bf` | native controls receipt | PASS (1024/1024) |
| E10 | `ae7b69e` | `native-f9eb4b1-fixed1-protection.log` `6dc38387527ebb2b6f5da71c189cd6142b0c3a1fcd12ef0b4846607cc93288d2` | native controls receipt | PASS (134/134) |
| E11 | `ae7b69e` | `native-f9eb4b1-fixed1-export.log` `0172a752fa5da085a9d9a01681679ab6c8842a48473cef7c13642948be6aaa02` | native controls receipt | PASS (68/68) |
| E12 | `55cf1e9` | `native-f9eb4b1-fixed1-downstream.log` `0da57fcf6c0ba55a1b224904bf454cab8dc46011bce7364ff3440b13a923d789` | native downstream/visual receipt | PASS (1081/1081) |
| E13 | `55cf1e9` | `native-f9eb4b1-fixed1-visual-en.log` `3c42c0a1efcc9b509d1422aaa2ef3c76a8b376dc2317b5d8394722526da78345` | native downstream/visual receipt | PASS (538/538; ZH 529/529) |
| E14 | `5c6bcd2` | `native-f9eb4b1-fixed1-keyboard-en.log` `b5414fcd713a7db5865b7db8c68384c5177c32f8ac1cee90387c8249dbfdfdf3` | native keyboard receipt | PASS (167/167 per language) |
| E15 | `94b12ba` | `web-sticky-recovery-f1/f1-f9eb4b1-sticky-apprail-fixed1.log` `dd7e7eb0c9c898c93ac8130a8a9e8782efe51ec61d9be92f6609133fbebf7848` | Sol fixed receipt | PASS (12/12) |
| E16 | `94b12ba` | `web-apprail-order-recovery-f1/f1-f9eb4b1-railorder-apprail-fixed1.log` `d4aae5fdf2a93b7dda8908ab7122d19a43d51865e244f5d75d6de40bd6a8e4b5` | Sol fixed receipt | PASS (`fixed-pass`) |
| E17 | `94b12ba` | `web-native-keyinput-k1/f1-f9eb4b1-appearance-apprail-fixed1.log` `5e7667df608159d5374a58bf21fc3fecc45c0f7ab4dba04f4f0bf3ea62698104` | Sol fixed receipt | PASS (`fixed-pass`) |
| E18 | `ee60b48` | `web-apprail-order-recovery-final/search-apprail-final-v1-f9eb4b1.log` `368ba9e6a5bd58f7182736395932febc1d55e748b47af83c0f132ef138ade3b3` | E25 receipt | PASS (140/140) |
| E19 | `ee60b48` | `protected-diff-apprail-final-v1-f9eb4b1.log` `5a0ef354a8a08573ee071b3b0625985e95b030d7522342c2b65244dc7075b729` | E25 receipt | PASS |
| E20 | `ee60b48` | `web-features-recovery-final/storage-check-types-apprail-final-v1-f9eb4b1.log` `a0b00ec439810bbfb8cd8e5c6305325ff610249eda6f8168893f37ae708273eb`; `web-apprail-order-recovery-sol/bytes-apprail-final-v1-f9eb4b1.log` `6a9d290f0f3d8f321caca0070beda1d6110762cd219569ebdeb8552a88c49fe5` | E25 receipt | PASS |
| E21 | `ee60b48` | `shell-test-apprail-final-v1-f9eb4b1.log` `4aa2586c4bafb3788b03bf934bfdfa4f3deab0fd5207d1efbc5a9603c663e7b8` | E25 receipt | PASS (205/205) |
| E22 | `ee60b48` | `web-test-apprail-final-v1-f9eb4b1.log` `8560b7e54374b72c4538b5750841a5097c96541b34fc8ab986d8c458f573dd44` | E25 receipt | PASS (196/196; control 178/178) |
| E23 | `ee60b48` | `web-apprail-order-recovery-sol/features-sol-downstream-c-rd1-apprail-final-v1-f9eb4b1.log` `a2428179491794154bbed3bfa133b4e2ea8a15de4bc5f34d24ccf1d85f8f0730`; `compare-accepted-apprail-final-v1.log` `aef27ba00afd51a34948b5dc8df62e4dd9d8dbcc3ef0bb79630bea6a35556cab` | E25 receipt | PASS (85 MATCH / 0 DIFF) |
| E24 | `ee60b48` | `native-f9eb4b1-apprail-final-v1-host.log` `20f6273e43758aa8f7f84994f5839bba99e2139570b1c98a9a4ab8bed15e0522`; `-downstream.log` `4efcab6bc4c3a5222e2c34ad2c91bc6033b1121aa5914f835ecd1e14e91a7c55` | E25 receipt | PASS |
| E25 | `ee60b48` | `hashes-apprail-final-v1.log` `5e8fa755d0a7e0fd06470cc13ec7eb2aa3550d2de9054d4d0dc1a993fd18d84d`; `review-final-regressions-f9eb4b1.md` `ab269a055b122f90c808752c5d130455d17470c0aaf5d097303b0a67d4f0689d` (it cannot carry its own hash; added once and unchanged) | E25 receipt; this file | Present. Enumerates E1–E25 once each, in order |

No ID is absent or mismatched.

## 6. The fifteen items: explicit conclusions

1. **Contract r1 and the eight controller confirmations: CONFIRMED.** r1 is the only revision (`f7726d7`, hash re-derived). R-1 is recorded as the product owner's decision, and A2 realizes it literally ("保留原位置" as the stored index). The escalation notes on §19 questions 1 and 4 did not require the product owner: the index reading is the literal one, and cancel-revert is a direct consequence of R-3. Each of the eight confirmations is implemented and evidenced (§2).
2. **Release-once reading (E4/E5/E16/E17): CONFIRMED.** Contract §12 asks every fixed run for "one live `proceed()` … one router commit". That cannot apply literally to sign-out, which makes no router navigation. The coherent reading is that the held departure is released exactly once: by one live `proceed()` on POP, by one `navigate` replay for programmatic navigation, and with no router commit for sign-out. The logs fit that reading:
   - selfcheck `pc2-back-release` has `proceeds: 1`;
   - f3 has `releases: 1`, `nonLive: 0` and exactly one commit, to `/app/tasks`;
   - f1 has `signOuts: 1`, and its coordinator holds after the rail OK;
   - every case has 0 duplicate proceeds, 0 non-live calls and 0 F1 signatures.

   This is the same reading as Appearance ruling 4.
3. **Sol's pre-freeze scratch reference implementation: CONFIRMED** as oracle self-test only. It exists in no commit: `d6ea500` adds only the 32 listed oracle, runner, C-RD1 and log files. Terra's `f9eb4b1` is a separate implementation by a separate instance; its D1 history (`4417e84` → `ea9201d` → `f9eb4b1`) shows independent iteration. Every fixed result I relied on comes from runs against the `f9eb4b1` archive.
4. **D1, and the native D1 observation: CONFIRMED, with a qualification.** In the HTML drag-and-drop processing model, a `dragover` fires at the current target immediately after `dragenter`. So in every reachable browser sequence the display after an enter/over pair is P, and both events make zero storage attempts, as §6 item 2 requires. Reordering at `dragenter` would move the dragged button under the pointer first, which makes the frozen trusted-drag preconditions unsatisfiable (Terra's `4417e84` record). The evidence: E9 `d1` 10/10, with the receipt's 78 trusted drags whose preview never changes on `dragenter` and changes only after a `dragover`; Sol `drag` 18/18; and C-RD1 at the fixed SHA.
   - *Qualification:* the reading is fixed for this caller. A future oracle that fires a lone synthetic `dragEnter` without `dragOver` and expects a preview change would be an OE-class oracle error, not a product failure. No contract revision is needed.
5. **D2–D6: CONFIRMED.**
   - D2: `__tests__/railOrderFixture.tsx` is a §11 item 8 file and lies outside the Vitest include.
   - D3: removing the DEV warning is allowed by §2 ("may stay or go").
   - D4: Retry uses `aria-disabled` and never `disabled` (G13), as §7 item 2 requires ("Retry rendered but inert") and as the Appearance precedent does.
   - D5: if Discard over a source issue removes the focused control while the status stays, focus goes to the status button (RS `:78–80`), never to `<body>`. The §7 unmount rule governs only an unmounting status.
   - D6: at ≤767 px the panel is fixed under the Topbar, like the accepted appearance popover. E13 contains it at every width.
6. **Row r "drop on a text input" judged as a cancel, and the synthetic coordinator: CONFIRMED.** `effectAllowed = "move"` (AR `:107`) means Chrome dispatches no `drop` to the input. The gesture therefore ends in `dragend` without a rail drop, which §6 item 4 defines as a cancel. The row's required zero writes and preview revert hold (E9 `r-drop-input`). The §6 item 9 insertion is pre-existing browser behaviour, asserted only through zero writes. The auth coordinator branch can only be reached through a synthetic coordinator, because the session is synthetic everywhere. This follows the Appearance precedent, and the App code path under test (`App.tsx:173–185`) is the production one.
7. **E13 deviations: CONFIRMED.** Below 768 px the pet's rail toggle is hidden by protected tokens, so the pet-on drag at narrow widths runs while the pet is visible; source and target are still hit-tested and unobscured. The clean-state baseline is `419e56d`, not "no scroll": the 768 top-rail overflow and the 414 bottom-button clipping are identical before and fixed. The pet mask in the pixel comparisons covers only the animated pet. None of these weakens a blocking check on a new control.
8. **F-E14-1 and the search-box observation: CONFIRMED as a contract-compliant, non-blocking UX-05 follow-up, with a qualification.**
   - **Why F-E14-1 does not block.** §7 item 2 closes the panel only on Escape and on an outside `mousedown`, so focus leaving the panel does not close it. §9 requires every new stop to pass and every existing stop to behave as at `419e56d`, with weak stops reported numerically; all of that holds. In `…-keyboard-zh-source-open-light-weak-stop2-sidebar-focused.png` I saw the 375 px panel covering most of the top of the Settings sidebar. The focused rows remain detectable (ring band ratio 0.128–0.171), so the control is not entirely hidden.
   - **Qualification on the search box.** The placeholder wrap is not specific to the premium badge. In E13's `…-visual-{en,zh}-both-statuses-375.png`, with no badge, the 375 px search placeholder also wraps to two lines once both statuses are shown. This is a non-clean-state effect of adding a second Topbar control at 375 px. It meets §9's containment and centre-hit criteria, and §9 sets no legibility criterion for unchanged controls. Record it under UX-05 alongside F-E14-1. If the product owner wants either fixed before relying on this caller, that needs a contract revision and a new Terra window; it is not a reason to withhold this acceptance.
9. **E14 deviations: CONFIRMED.** The walk route `/app/settings/appearance` is required by the frozen oracle's hue-slider self-check and follows the `419e56d` precedent. Starting the panel-open walk inside the panel avoids an outside `mousedown` closing it. The badge comes from an account-scoped premium tier stub key, not a product change. The ZH draft established at 1440 and then resized to 375 is needed because the rail toggle is hidden below 768. The frozen block hash `e024c90e…` and the function hash `1cdb0c13…` are re-checked on every run (receipt).
10. **E23 host-suite buffer copies, the E24 copy, and the retained WebSocket transport: CONFIRMED.**
    - **Host-suite copies.** Each of the four copy diffs changes exactly four substantive lines: the 100 MiB archive buffer becomes 1 GiB, and `root` gains two `../`. The rest of each diff is a header comment (F, four checks). All 13 staged test and fixture files are byte-identical to the frozen originals (manual check, §8). The frozen runners fail with `ENOBUFS` at `419e56d` as well, so this is an environment-capacity precondition caused by archive growth, not by this caller. The copies' counts equal the accepted receipts and the `419e56d` controls.
    - **E24 copy.** It differs from the accepted Appearance E25 copy by one replaced precondition only: 3 removed and 13 added non-comment lines, all about the delta (F). The five served files are byte-identical to the frozen Features files (manual check, §8).
    - **Transport.** Keeping the frozen WebSocket transport is required to keep the runner hashes and the copy minimal.
    - **Follow-up for the controller:** future runners should stream `git archive` or size the buffer from the archive.
11. **§10 item 9, `App.tsx` and `localStorage`: CONFIRMED.** The literal text ("contains no `localStorage`") contradicts the same item's requirement that `readLocalPref` stay byte-identical, because that function reads `localStorage`. The coherent reading is that the caller adds none. The `localStorage` line count is 4 at both SHAs, `readLocalPref` is byte-identical, and every other matching line is a comment (G4, G5; E18).
12. **C-RD1 (with confirmation 7's condition), C-FB002, OE, and the C-FD1 prediction: CONFIRMED.** I parsed the logs:
    - the frozen Features `downstream` is 14/15 at `419e56d` (fails only 012) and 13/15 at `f9eb4b1` (fails 012 and 014). The 014 failure is the predicted A7 PRECONDITION "the drag-reorder persisted a changed rail order";
    - C-FD1 is 15/15 before and 14/15 fixed, failing only 014;
    - C-RD1 is 15/15 at both SHAs, so confirmation 7's condition holds: the frozen original fails only on its predicted signatures, and the corrected copy passes before and fixed;
    - C-FB002 is 10/10;
    - OE: the corrected `continuity-export` is 26/26, and the frozen one is 24/26 (006, 007), as predicted. Both come from `compare-accepted`, which reports 85 MATCH and 0 DIFF.

    Case 014 is judged only by C-RD1.
13. **Clean-state chrome invariance, hence no visual or keyboard rerun for other callers: CONFIRMED.** E12 has 24 clean-chrome configurations: EN and ZH; 1440 left, 1440 top and 375; all modules or Boards hidden; default or custom order. They pass 360/360 row checks against `419e56d` with the same seed bytes. The rail and Topbar `outerHTML`, `.app` and `<html>` attributes, geometry and decoded pixels are identical, with only the pet masked. With no status node in the clean state (A8) and every selector scoped to `.rail-order-status` (G11), §10 item 6 and §13 do not trigger reruns of the other callers' E13/E14-class evidence.
14. **Development probes outside the iteration cap, and Chrome 154→155: CONFIRMED.** The probes wrote only to session scratchpads and were disclosed; no committed log is superseded. The cap governs diagnostic iterations of official runs: the E23 host-suite unit used 2 of 3, and every other unit used 1. Every AppRail native before and fixed run used Chrome 155.0.8059.39, so before and fixed are on the same version. Only the E15/E17 comparison baselines were taken on 154, and their check sequences are identical.
15. **Pre-existing observations not owned by this caller: CONFIRMED.** These are the 768 top-rail overflow (873/768 px), the 414 bottom-button clipping and the Tasks save-failure banner. E13 records the first two as identical at `419e56d`. The rail and bottom-bar geometry lives in protected `layout.css`, and this caller adds no rule outside `.rail-order-status`. The banner comes from the Tasks module (batch 39 ruling 5) and appears in before and fixed captures alike; I saw it behind the fixed ZH 375 source panel.

## 7. §14 "cannot be closed by" conditions: none holds

| Condition | Status |
| --- | --- |
| Binding converted without the R-1 merge (pruning kept) | Not the case: §2, H3, E9 `c-*`, E12 `bytes-*` |
| Writing on `dragover`, or persisting a cancelled drag | Not the case: G20 and G21; Sol `drag` 18/18; E9 `b*` and `r-*` |
| A crash, silent default, silent filter or silent overwrite of malformed bytes | Not the case: gate 1; E9 `o-*` drags over malformed bytes are refused failed drafts and the bytes are unchanged |
| Recovery without the route-independent status, unload warning and sign-out step | Not the case: gate 5 |
| A status that claims success, or unmounts with focus on `<body>` | Not the case: there is no success line (A8). The focus moves to `.topbar-pref-trigger` (G23). E14 found 0 frames with focus on `<body>` after Discard, a successful Retry and a Reload repair |
| Features `downstream` 014 judged by anything other than C-RD1 | Not the case: §6 item 12 |
| Shipping without the clean-state chrome invariance evidence | Not the case: §6 item 13 |

## 8. What I ran and viewed

- **`verify-acceptance.mjs`** (`cf152371c5071776d3731806dbf0fe542240fb84b6efaea74e061aca63c8e334`, in this directory) wrote `acceptance-checks-f9eb4b1.log` (`6771d870a887d72b63de4ebde8ad9eebcda463d5f189448c46d1c5abf03f7a03`): 183 checks, 183 pass, exit 0.
  - **What it does:** git object reads, SHA-256 re-derivation, raw-log parsing, source greps, and the pure-model property check (sections A–H).
  - **What it does not run:** the product, a package script, a test runner, a browser or a server.
  - **Model check:** the model file was extracted to the session scratchpad, outside the repository, and imported through Node 24's built-in type stripping.
  - **Development run.** One earlier run of the checker passed 179/179. I deleted its log, added G20–G23 (the §14 drag-write and focus conditions), silenced git's stderr for the expected "not in 419e56d" probes, and ran the official run once.
- **Manual read-only check** (session scratchpad, not committed): the 13 staged host-suite test and fixture files and the 5 E24-served files are byte-identical to their frozen originals (18/18 `SAME`).
- **Screenshots I viewed:**
  - `native-419e56d-before1-h1-zh-object-empty-tasks.png` (whole-page route error);
  - `native-419e56d-before1-r1-h5-en-1440-after-re-enabling.png` (Boards last);
  - the fixed R-1 triple at 1440 EN (Boards back at index 2);
  - `…-visual-zh-source-open-375.png` (the App renders, Reload only);
  - `…-visual-zh-peton-failed-open-768.png` (no pet overlap);
  - `…-visual-{en,zh}-both-statuses-375.png` (both icons in the Topbar; the placeholder wraps);
  - `…-keyboard-zh-source-open-light-weak-stop2-sidebar-focused.png` (F-E14-1).

  Each matches its log.
- **No reruns.** No targeted product or oracle rerun was necessary: every gate's before, fixed and surface facts are present in committed raw logs that I parsed myself.

## 9. Non-blocking follow-ups (for the ledger batch; none blocks this acceptance)

1. **UX-05:**
   - F-E14-1: the 375 px open panel nearly covers the next focused Settings sidebar rows. One option is to close the panel when focus leaves the status root, which would need a contract revision;
   - the 375 px search placeholder wraps once both statuses show, with or without the premium badge (§6 item 8);
   - the existing UX-05 items carried from Appearance §9 (F-APP-3, the 36 px Topbar controls, the first bottom-rail item's clipped ring at 375 px);
   - there is no keyboard or touch reorder of the rail (contract §17).
2. **REL-07:** a drag over an invalid or unreadable source can never be saved from the UI. The bytes stay until externally repaired; this is retained by A5.
3. **REL-09:** a scope change remounts App and loses an in-memory rail draft (E10 row n).
4. **Retained disclosure:** with both a rail and an Appearance draft, OK at the rail prompt followed by Cancel at the Appearance prompt discards the rail draft and keeps the Appearance draft (§7 item 4; E10 `j-*`).
5. **Evidence tooling:** runners that buffer `git archive` must stream it or size the buffer, because archive growth now exceeds 100 MiB (§6 item 10). Future regressions must keep running C-RD1, C-FD1, C-FB002 and OE beside their frozen originals. Native runners keep the K-1 rule.
6. **Shared engine:** this is the first production use of the registered `json` path for an array value under the async engine. A later defect on that path follows the §11 shared-defect procedure.
7. **Inventory prediction (contract §13):** the next Luna refresh should lose the single AppRail `usePref` row. That gives 22 files, 47 bindings, 26 literal keys, 1 dynamic site, 30 setter bindings (27 direct, 3 downstream-only) and 17 read-only bindings.

## 10. Scope of this acceptance

- It covers only the AppRail order recovery caller (CP-APPRAIL-01) at `f9eb4b1`.
- It closes no 312 item. SET-03 (only R-1 is implemented), SHELL-01, SHELL-03, SHELL-04, SHELL-05, SHELL-06, UX-03, UX-04, UX-05, REL-05, REL-07, REL-09, REL-10, QA-01, QA-03, QA-04, QA-09, D2/REL/AI and every other item stay open. The formal counts are unchanged.
- It is not business or release completion. It authorizes no deployment, release, branch promotion or Web→Desktop sync; any Desktop flow needs the ADR-0013 D3 gate.
- Retained limitations: jsdom and headless Chrome only, a synthetic auth session, a development build without StrictMode, not Tauri, and single official runs per unit.

## 11. Files added by this review

All under `docs/reviews/web-apprail-order-recovery-acceptance/`, additions only:

| File | SHA-256 |
| --- | --- |
| `verify-acceptance.mjs` | `cf152371c5071776d3731806dbf0fe542240fb84b6efaea74e061aca63c8e334` |
| `acceptance-checks-f9eb4b1.log` | `6771d870a887d72b63de4ebde8ad9eebcda463d5f189448c46d1c5abf03f7a03` |
| `acceptance-f9eb4b1.md` | this file (cannot carry its own hash) |
