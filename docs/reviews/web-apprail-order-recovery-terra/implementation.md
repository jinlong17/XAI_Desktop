# AppRail order recovery: Terra implementation run (CP-APPRAIL-01, batch 59, E6)

Terra role (implementation only), an independent Claude Opus 5.5 instance in the isolated worktree `.claude/worktrees/agent-a6b59dd5867022ced`, on a detached HEAD. This record is contract r1 §15 item **E6**. It does not verify or accept the work, closes no 312 item and pushes nothing.

## 1. Identity

| Item | Value |
| --- | --- |
| Start point | `145b073658b93df123f0d068cdce921986144dcf` (control plane batch 59), detached; `git status` clean |
| Product baseline | `419e56de9f23e4467fea806fbd4a990e1f429941`; `git diff --name-only 419e56d 145b073 -- apps packages package.json pnpm-lock.yaml` was empty before any edit |
| Contract | `docs/reviews/web-apprail-order-recovery-contract/contract.md` r1, SHA-256 `b9e407b3867ec41b2c380ac09f9efba71747c81b63d24e8263a64b7ee7095cde` (re-derived) |
| Controller confirmations | `CURRENT-CONTROL-PLANE.md`, CP-APPRAIL-01 row (8 confirmations, user-confirmed 2026-10-09) and the release-once ruling |
| **Product commit (fixed SHA)** | `f9eb4b1f207bc4b46f547b90afc250424b3c8695`, parent `145b073658b93df123f0d068cdce921986144dcf`, tree `05887cf113639116b228a25041a37b3d5c69a322` |
| Record commit | the commit that adds this directory, parent `f9eb4b1` |
| Lockfile | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` (unchanged; equals the contract gate) |
| Toolchain | Node v24.16.0, pnpm 9.0.0, Vitest 3.2.7, TypeScript 5.9.2; `pnpm install --frozen-lockfile --offline` inside the worktree only (exit 0) |

## 2. Product diff (`git diff --numstat 419e56d f9eb4b1 -- apps packages package.json pnpm-lock.yaml`)

Every path is a contract r1 §11 product file. `package.json` and `pnpm-lock.yaml` are unchanged.

| File | + | − | §11 item |
| --- | ---: | ---: | --- |
| `apps/web/src/App.tsx` | 35 | 15 | 10 (the 15 removed lines are the `<Shell>` block re-indented inside `<RailOrderProvider>`) |
| `apps/web/src/__tests__/App.railorder.test.tsx` | 363 | 0 | 11 (new) |
| `packages/xai-web-shell/docs/api.md` | 124 | 16 | 9 |
| `packages/xai-web-shell/docs/test.md` | 10 | 2 | 9 |
| `packages/xai-web-shell/src/AppRail.tsx` | 117 | 43 | 1 |
| `packages/xai-web-shell/src/Shell.tsx` | 2 | 0 | 3 (pass-through only) |
| `packages/xai-web-shell/src/Topbar.tsx` | 8 | 0 | 2 (slot + its comment only) |
| `packages/xai-web-shell/src/types.ts` | 95 | 0 | 4 (additive only) |
| `packages/xai-web-shell/src/index.ts` | 17 | 0 | 5 (additive exports + stylesheet import) |
| `packages/xai-web-shell/src/railOrderStatus.css` | 149 | 0 | 6 (new) |
| `packages/xai-web-shell/src/internal/railOrderModel.ts` | 113 | 0 | 7 (new module 1/4: pure model) |
| `packages/xai-web-shell/src/internal/railOrderController.tsx` | 347 | 0 | 7 (new module 2/4: controller, context, provider) |
| `packages/xai-web-shell/src/internal/railOrderCopy.ts` | 78 | 0 | 7 (new module 3/4: EN/ZH copy) |
| `packages/xai-web-shell/src/internal/RailOrderStatus.tsx` | 218 | 0 | 7 (new module 4/4: Topbar status + panel) |
| `packages/xai-web-shell/src/__tests__/Topbar.test.tsx` | 25 | 0 | 8 (additive TP-RAIL-1/2; existing cases byte-unchanged) |
| `packages/xai-web-shell/src/__tests__/railOrderModel.test.ts` | 155 | 0 | 8 (new: pure model) |
| `packages/xai-web-shell/src/__tests__/AppRail.railorder.test.tsx` | 380 | 0 | 8 (new: AppRail order recovery with the lock fixture) |
| `packages/xai-web-shell/src/__tests__/RailOrderStatus.test.tsx` | 317 | 0 | 8 (new: status and panel) |
| `packages/xai-web-shell/src/__tests__/railOrderFixture.tsx` | 407 | 0 | 8 (new test-support file: local exclusive Web Lock fixture, Storage probe, harness, drag driver; not matched by the Vitest include) |

Total 19 files, +2960 / −76. Protected paths (`dnd.ts`, `registry.tsx`, `AvatarMenu.tsx`, every storage, tokens, Appearance, Features, pet, CmdK, coordinator and router file, every existing test other than the additive Topbar cases) have an empty diff.

## 3. How each decision is implemented

Line numbers refer to `f9eb4b1`.

| Item | Implementation |
| --- | --- |
| **R-1** (hidden modules keep their stored positions) | `mergeRailOrder` index-slot merge, `internal/railOrderModel.ts:90–113`; the controller computes it over S and R at drop time, `internal/railOrderController.tsx:155–178`; AppRail passes the visible ids R, `AppRail.tsx:144–153` |
| **A1** scope | Only the §11 files above (§2) |
| **A2** index-slot merge, P1–P7 | `railOrderModel.ts:90–113` (walk S, replace visible slots by P, keep non-visible ids, append the rest; `null` for a non-permutation, `railOrderModel.ts:95–96`). S = draft value, else committed bytes, else the registry default (`railOrderController.tsx:88–93`, `:114`). P1–P7 tested in `railOrderModel.test.ts` (RM-P*) |
| **A3** one App-scoped controller | `useRailOrderController({ lang })`, `railOrderController.tsx:274–337`; `RailOrderProvider` `:345`; App creates exactly one inside `AccountStorageGate` with the Appearance language, `App.tsx:139`, and wraps `Shell`, `App.tsx:216–232`. AppRail uses the provided one or creates a standalone one, `AppRail.tsx:44–56` |
| **A4** registered async binding, absolute sets only | `usePrefAutosaveAsync("xai_rail_order", RAIL_ORDER_BINDING)`, `railOrderController.tsx:40`, `:276`; each drop calls `binding.edit(merged)` once (`:170`); no reset, no functional updater |
| **A5** strict domain, refuse never repair | `isRailOrder`, `railOrderModel.ts:23–33`, composed with the codec boundary by the engine; invalid/unavailable source → source-only (`railOrderController.tsx:297–298`); Reload/Discard only reread (`:140–151`, `:204–214`) |
| **A6** route-independent protection | Topbar slot `Topbar.tsx:124` (after `appearanceStatus`), `Shell.tsx:86` pass-through; `beforeunload` while a draft exists `railOrderController.tsx:313–322`; sign-out step `confirmSignOut` `:252–270`, awaited before the Appearance step in both branches `App.tsx:176` (coordinator, after the capture check) and `App.tsx:187` (fallback); no route guard anywhere |
| **A7** one write per drop | Preview in memory: `AppRail.tsx:106–137`; one intent per gesture at a `drop` inside `.rail-items`: `:144–153`; `dragend` without a drop cancels: `:156–160`; stale previews are not shown or committed: `:93–95`, `:131` |
| **A8** feedback surface | Render rule (a)/(b) `railOrderController.tsx:286–299` (`everFailed` latch, kept while its Retry is pending); status button + non-modal panel `internal/RailOrderStatus.tsx:118–217`; no success line |
| **A9** test dispositions | §11 table honoured: existing tests unchanged (only additive Topbar cases); new tests listed in §2 |
| **A10** R-PET | The new controls never move or restyle the pet; the panel sits under the Topbar (fixed below `--topbar-h` at 767 px and below), away from the pet's bottom-right default box. Native R-PET evidence is the parent's (E13) |
| **A11** C-RD1 | Not touched; pre-check below shows C-RD1 15/15 at the fixed SHA |
| §5 item 3 identity/latest authority | Draft object established before enqueue, `railOrderController.tsx:160–171`; `settle` acts only for the exact current draft, `:116–130`; predecessor recovery never acknowledges the latest, `:131–137`, `:180–198` |
| §5 item 7 Retry/Discard/Reload/Export | Retry `:180–198` (inert unless `canRetry`, `:106–111`); Discard `:199–203`; Reload `:204–214` (refused while a draft exists); Export memory-only with liveness rechecks and cleanup, `:216–251` |
| §7 item 2 focus rules | Unmount with focus → `.topbar-pref-trigger`, `RailOrderStatus.tsx:57–81`; Escape → status button `:86–92`; outside mousedown `:93–100`; failed Retry keeps the same Retry element focused |
| §9 CSS and focus | `railOrderStatus.css`: only `.rail-order-status*` selectors; 44×44 targets (`:26`, `:89`); restated `:focus-visible` ring for every new control (`:123–129`), not `.topbar-pref-option`; icon-only at ≤767 px (`:132–149`) |
| §10 isolation | Shell product source has zero `localStorage`, `usePref(`, `setPref(`, `removePref(`, `new StorageEvent`, `dispatchEvent(`; `AppRail.tsx` imports no storage API; `App.tsx` has no `xai_rail_order` or `usePref(`, its `localStorage` count is 4 as at `419e56d` (all inside the byte-identical `readLocalPref`) |

**Controller confirmations.**
1. Index-slot merge: as A2 above.
2. Unknown and non-rail ids kept: the merge keeps every non-visible id at its index (`railOrderModel.ts:100–104`); tests RM-P2, RO-R2.
3. Source-only issues show a Topbar status: `railOrderController.tsx:297–298`, Reload-only panel `RailOrderStatus.tsx:171–181`.
4. A cancelled drag reverts: `AppRail.tsx:156–160` (disclosed product consequence of A7).
5. Two sequential prompts, rail first; the accepted Appearance controller unchanged: `App.tsx:176`, `:187`; no Appearance file changed.
6. App creates the controller: `App.tsx:139`.
7. C-RD1: unchanged; pre-check 15/15.
8. Broader reruns: not a Terra item (E23); no other caller's file changed.

**Release-once ruling.** The rail sign-out step adds no release path of its own: it only resolves before the existing Appearance and coordinator steps, so a held departure is still released exactly once by whichever mechanism applies. The rail F1-shape pre-check (below) shows f1 (one `signOut`), f3 (one navigate replay, zero blocker calls) with zero F1 signatures.

## 4. Self-checks (E6), all at `f9eb4b1`, from the worktree root

| Command | Exit | Result | Raw log | SHA-256 |
| --- | ---: | --- | --- | --- |
| `pnpm -C packages/xai-web-shell test` | 0 | 12 files, 205 tests passed | `shell-test-f9eb4b1.log` | `72876c4e194de93f91e11d0197d7ea6ff1b270c862b8ab044c4c580d39ab92fa` |
| `pnpm -C packages/xai-web-shell check-types` | 0 | `tsc --noEmit` clean | `shell-check-types-f9eb4b1.log` | `294f581c9a803f00bee4918f57c7d7f0fa16d762ae70932f8997059cc5997244` |
| `pnpm -C packages/xai-web-shell lint` | 0 | `eslint --max-warnings 0` clean | `shell-lint-f9eb4b1.log` | `96d9ac7247d2d0b39ed10772d5c7a86c1e0ded1bc50a8a4a023b4c112ad8f75e` |
| `pnpm -C apps/web test` | 0 | 30 files, 196 tests passed | `web-test-f9eb4b1.log` | `98f9673a134bc49f20b6f4bd3c849d32f065daf9e509683d86a1656c0855bbd3` |
| `pnpm -C apps/web check-types` | 0 | `tsc --noEmit` clean | `web-check-types-f9eb4b1.log` | `354c6edfe3dc171241299decc2e5a6f08feb0c02a6e607a20e712abbe3144a24` |
| `pnpm -C apps/web lint` | 0 | `eslint --max-warnings 0` clean | `web-lint-f9eb4b1.log` | `cf9b5165dc5cdd180cc355343b1f94d7597525b48ae66879b2aef4bc072a815c` |

**Per-file counts.**
- Shell (205): `AppRail.test.tsx` 25 (unchanged), `internal/dnd.test.ts` 9, `Topbar.test.tsx` 26 (24 unchanged + TP-RAIL-1/2), `Shell.smoke` 9, `event-emit` 6, `registry` 7, `AvatarMenu` 18, `SignOutConfirmDialog` 8, `index-barrel` 9, **new** `railOrderModel` 30, `AppRail.railorder` 40, `RailOrderStatus` 18.
- `apps/web` (196): `App.appearance` 22, `App.signout` 7, `App.lazy-init` 8, `shell.smoke` 5, `shell.theme` 4, `cmdkIntegration` 5, `railFeatureFilter` 3, `departureCoordinator.blocker` 10, `router.integration` 6, `router-modules.integration` 38, `shellRegistrations.integration` 11, the three composition tests 4 + 3 + 3, `build-manifest` 2, `csp` 9, the remaining unchanged files 26, **new** `App.railorder` 18. Before the change the same suite had 29 files / 178 tests, all passing.

## 5. Pre-checks with the frozen runners (not evidence; logs deleted)

Run from this worktree against my own commits with `XAI_DEPS_ROOT` = this worktree (lockfile gate equal). No frozen file was modified; `git status` showed only this directory before the record commit. No runner sends `nativeVirtualKeyCode` (K-1); I set none.

**At the final product commit `f9eb4b1`:**

| Runner / mode | Pass / total | PRECONDITION | Exit |
| --- | --- | ---: | ---: |
| Sol `bytes` | 26 / 26 | 0 | 0 |
| Sol `domain` | 31 / 31 | 0 | 0 |
| Sol `merge` | 21 / 21 | 0 | 0 |
| Sol `drag` | 18 / 18 | 0 | 0 |
| Sol `field` | 24 / 24 | 0 | 0 |
| Sol `continuity-export` | 22 / 22 | 0 | 0 |
| Sol `host` | 33 / 33 | 0 | 0 |
| Sol `original` | 123 / 123 (121 at `419e56d` + the two additive TP-RAIL cases) | 0 | 0 |
| C-RD1 (`diag-features-sol-c-rd1.mjs … downstream`) | 15 / 15 | 0 | 0 |
| Parent host (`web-apprail-order-recovery-independent/verify-fixed.mjs … host`) | 31 / 31 | 0 | 0 |
| Rail F1 `selfcheck` | harness-valid, 165 / 165 checks | — | 0 |
| Rail F1 `railorder` | `fixed-pass`: f1, f2, f3 fixed-pass; 104 checks; F1 signatures 0, duplicate proceeds 0, non-live blocker calls 0, runtime errors 0 | — | 0 |

Rail F1 logs were written to the session scratchpad through `XAI_F1_EVIDENCE_DIR` (outside the repository); Sol, C-RD1 and parent host logs were written by the runners into their own directories and deleted before the record commit.

**Earlier pre-check iteration (disclosed).** A first temporary commit `4417e84` (never kept) reordered the preview on both `dragenter` and `dragover`. All Sol modes, C-RD1 and the parent host passed there too, but the rail F1 `selfcheck` was **harness-invalid** at `pc5-trusted-rail-drag:trusted-dragstart-dragover-drop-dragend`: the trusted CDP drag recorded `dragenter:Dashboard` then, because the dragged button had already taken Dashboard's slot, every `dragover` landed on Tasks, so the runner's precondition "a dragover on the target" could not hold. I changed AppRail so `dragenter` only accepts the drag (`preventDefault`) and the immediately following `dragover` moves the preview (deviation D1 below), amended the temporary commit (`ea9201d`), reran the rail F1 modes (`selfcheck` harness-valid 165/165, `railorder` fixed-pass) and then built the final commit `f9eb4b1`, on which everything above was rerun.

## 6. Deviations and readings (for the controller)

- **D1 — `dragenter` accepts, `dragover` moves the preview.** Contract §6 item 2 says "`dragenter`/`dragover` on a rail button Y … sets P". The browser's drag-and-drop processing model always fires `dragover` at the current target right after `dragenter`, so the preview after each enter/over pair is identical. Reordering already at `dragenter` would move the dragged button under the pointer before that `dragover`, which makes the frozen trusted-drag preconditions unreachable (`verify-f1-railorder.mjs:632–634` requires a `dragover` on the target; `verify-native-before.mjs:697` requires a trusted `dragover` on every target). The Sol driver is explicitly agnostic to this choice. I did not change any oracle; I chose the reading that satisfies both the contract text and the frozen harnesses. If the controller reads §6 item 2 as requiring the reorder at `dragenter` itself, this is a contract/oracle tension to be resolved by the controller.
- **D2 — test-support file.** `src/__tests__/railOrderFixture.tsx` is a shared fixture (lock manager, Storage probe, harness, drag driver), not a test file; §11 item 8 allows "new test files under `src/__tests__/`" and names the lock-fixture pattern. It is outside the Vitest include.
- **D3 — DEV warning removed.** The legacy `xai_rail_order contains unknown id` DEV warning is gone (§2 "may stay or go"); unknown ids are now kept by design.
- **D4 — Retry inert state.** While a Retry is pending the Retry button stays rendered with `aria-disabled="true"` (never the `disabled` attribute), so it stays focusable.
- **D5 — status after Discard over a source issue.** When Discard returns a drafted rail to an invalid source, the status stays (rule (b)) and, if focus was inside the panel on a control that disappeared, focus moves to the status button (not to `<body>`).
- **D6 — panel at narrow widths.** At ≤767 px the panel is `position: fixed` under the Topbar with 12 px insets, like the accepted appearance popover, so it stays inside the viewport.

## 7. Open questions

1. D1 above: confirm the `dragover`-moves reading of §6 item 2.
2. Visual, keyboard (pixel focus walks), R-PET and native evidence (E9–E14) were not produced by Terra. I only checked the new CSS in a static headless-Chrome probe (scratchpad, not committed) at 1440, 768, 414 and 375 px in light and dark: the status and panel were contained and the focus ring was visible on the status button and on Retry.

## 8. Files in this directory

| File | SHA-256 |
| --- | --- |
| `shell-test-f9eb4b1.log` | `72876c4e194de93f91e11d0197d7ea6ff1b270c862b8ab044c4c580d39ab92fa` |
| `shell-check-types-f9eb4b1.log` | `294f581c9a803f00bee4918f57c7d7f0fa16d762ae70932f8997059cc5997244` |
| `shell-lint-f9eb4b1.log` | `96d9ac7247d2d0b39ed10772d5c7a86c1e0ded1bc50a8a4a023b4c112ad8f75e` |
| `web-test-f9eb4b1.log` | `98f9673a134bc49f20b6f4bd3c849d32f065daf9e509683d86a1656c0855bbd3` |
| `web-check-types-f9eb4b1.log` | `354c6edfe3dc171241299decc2e5a6f08feb0c02a6e607a20e712abbe3144a24` |
| `web-lint-f9eb4b1.log` | `cf9b5165dc5cdd180cc355343b1f94d7597525b48ae66879b2aef4bc072a815c` |

This file cannot carry its own hash.
