# Complete caller: the Dashboard Clock widget's style and timezone, with Dashboard departure participation

**Revision log** (newest first).
- **r2 (2026-10-09, batch 67).** Rebased from `419e56d` to `f9eb4b1`, the product head after the accepted AppRail order caller (CP-APPRAIL-01, acceptance `efe05ea`). Written by an independent Astra-role instance that did not write r1 and did not execute any AppRail batch. No evidence depends on r1 yet, so r2 replaces it outright. What changed and why:
  1. **Re-pinned.** The fixed product, the docs head, the hash table, every line reference and every before revision now refer to `f9eb4b1`. r1 line 11 ("byte-identical except `App.tsx`") no longer held: `f9eb4b1` changed 19 files, `App.tsx`, `AppRail.tsx`, `Topbar.tsx` and `Shell.tsx` among them. The new "Effect of the 19 changed files" table states, file by file, what this means for the Clock scope. Every Clock, dashboard, storage, coordinator, tokens, CmdK and pet file that r1 cites is byte-identical at both revisions, and r2 re-checked each cited range at `f9eb4b1`.
  2. **Sign-out.** At `f9eb4b1`, `handleSignOut` runs a rail-order step, then the Appearance step, then `requestSettingsDeparture("sign-out")`, in both auth branches (`App.tsx:176–178`, `:187–189`). r1 described only the Appearance step and the coordinator. The rewritten parts are §3 item 9, §7 item 5, host row g, Sol D5 and F1 case c4. The `window.confirm` recorder now requires zero calls from **both** the rail and the Appearance steps whenever neither has a draft. The new host row q and F1 case c5 cover sign-out with a rail draft **and** a Clock draft: the rail confirm comes first, and Cancel there touches neither the Clock nor the coordinator.
  3. **Topbar.** `f9eb4b1` adds a `railOrderStatus` slot (`Topbar.tsx:124`). Like the Appearance status, the rail status must be absent in every run that does not seed it; if it appears, that is a precondition failure (§9). Only row q and case c5 seed a rail draft, and there the rail status is expected to be present but closed.
  4. **AppRail as the departure action.** The click path is unchanged (`AppRail.tsx:245–247` → `Shell.tsx:37–40`, the same code as `419e56d` `AppRail.tsx:171–172`). The component structure and the drag model did change. Every row and oracle that leaves the Dashboard through AppRail now selects the rail button by its accessible name and **activates it by a click only, never a drag** (§3 item 15, §12 rule 13).
  5. **Affected callers and regressions.** AppRail is added: its Sol eight modes, its parent host suite, the rail F1-shape runner (now part of the E15 F1 list) and the C-RD1 judging copy (§12, §13 gates 7 and 9, E15, E24). **This also corrects r1.** At `f9eb4b1` the C-FD1 copy fails Features `downstream` case 014 by design (AppRail A7). Case 014 is therefore judged only by C-RD1, and r1's expectation "C-FD1 15/15" is withdrawn. Every judging copy is now listed with its predicted outcomes (§12, "Judging copies and predicted outcomes").
  6. **Runner conventions.** New runners stream `git archive`, or size their buffer from the archive. They use pipe transport and never send `nativeVirtualKeyCode`, they keep the key audit, and they drag only through trusted CDP input. The four Dashboard Header runners still use a 100 MiB buffer, below the 148,408,320-byte archive at `f9eb4b1`, so their buffer copies are pre-registered. The same capacity procedure is pre-registered for the three 200 MiB F1 runners (§12, §14 Rules).
  7. **Focus visibility.** It is judged by a per-stop pixel comparison with the frozen `pixelFocusWalk` oracle, whose identity is hash-checked. §9 now says whether any Clock control or overlay can cause an obstruction of the F-E14-1 type. The Clock adds no overlay. Its unchanged timezone popover can cover the new recovery controls when keyboard focus leaves it while it is open; this is recorded as a probe, not gated (question 2 of §17).
  8. **Narrow-width pet hiding.** Below 768 px the protected tokens hide the rail pet toggle (`layout.css:1994–1997`, `:2144–2147`). The pet is therefore hidden at 768 px or wider and the page is resized without a reload (the AppRail E13/E14 precedent).
  9. **Event isolation clarified** (§10 item 7). The required zero event-bus emissions apply to the Clock's own code. Navigation-caused emissions from the unchanged shell and Dashboard registration must equal those at `f9eb4b1`. r1's wording could have been read as forbidding them.
  10. **Assumptions.** A1 and A9 change their wording only: A1's protected and rerun lists, and A9's overlay list and pet procedure. Terra's file set does not change. A2–A8 are unchanged. A1–A9 all await controller confirmation (§4). No product-owner decision is needed (§17).
  11. **Added sections:** §17 (open questions for the controller) and §18 (stop condition). The required evidence stays a single contiguous list, E1–E25.
- **r1 (2026-10-05, batch 54).** First draft, written with the selection memo [selection-419e56d.md](../web-next-caller-selection/selection-419e56d.md) (candidate E1). Fixed at `419e56d`, commit `2c35fee`, SHA-256 `21624ff5b6eabbe1a79f1883f5d45b930c81a04986662bb605dd42bcbcb40630`.

Contract designer: Astra role (risk, design and final decision). r1 was written by the batch-54 instance. r2 was written by a separate, independent Claude Opus 5.5 instance in an isolated detached worktree. Module `web`, 2026-10-09, control-plane batch 67. Proposed control-plane item: `CP-CLOCK-01`. It takes effect as an execution item only once the controller confirms r2 (including A1–A9) and registers the item.

**Fixed product and source equality.**
- **Fixed product, and the before revision of every oracle:** `f9eb4b1f207bc4b46f547b90afc250424b3c8695` (`f9eb4b1`, tree `05887cf113639116b228a25041a37b3d5c69a322`). The contract was authored at docs HEAD `61469c4074fcb46b7f8c0a79c27b9d20d53bc51e`, where `git diff --name-only f9eb4b1 61469c4 -- apps packages package.json pnpm-lock.yaml` is empty.
- **Lockfile SHA-256:** `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`, the same as at `419e56d`.
- **Line numbers.** Every line number refers to `f9eb4b1` unless stated otherwise.
- **The change since r1.** `419e56d..f9eb4b1` consists of exactly the 19 AppRail §11 files (+2960/−76): 17 under `packages/xai-web-shell/`, plus `apps/web/src/App.tsx` and the new `apps/web/src/__tests__/App.railorder.test.tsx`. The package trees of `xai-web-dashboard-grid` (`8e96464cae57ba35a7f1a4c39c9b0a8f9df64509`), `xai-web-dashboard-widgets` (`4d65ad167b0d3712166e96569b1d9f44ed66a500`) and `plugin-web-storage` (`782c79de33a1da6851b5a235950408eb7ae89f99`) are identical at both revisions. At `f9eb4b1`, `xai-web-shell` is `4ea3eb5bc1048055e7870fa2a1c01e889aab8cb8` and `apps/web` is `61ddf71751eaa9f1a456897ecb7fbe23e708be4b`.
- **The unit's source and the protected files it cites, at `f9eb4b1`.** "Same" means byte-identical to `419e56d`.

| File | SHA-256 at `f9eb4b1` | vs `419e56d` | Last change |
| --- | --- | --- | --- |
| `packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx` | `10bf13e8550bdf1207cfd89b372e5b87f099b1110326248dbf5b7ea2325614e9` | Same | `9a78d17` (2026-05-23) |
| `packages/xai-web-dashboard-widgets/src/registrations.tsx` | `346cfddfbb3c299aff251b2e4daff31b909d0690196857c36b8ee71f6e015154` | Same | `12b7111` (2026-06-02) |
| `packages/xai-web-dashboard-widgets/src/styles.css` | `a7a4cf039b343b8c6b06113bf6b6997084524aa4c0413e2ab0396a1ca933a853` | Same | `1be1107` (2026-06-04) |
| `packages/xai-web-dashboard-widgets/src/internal/cityLibrary.ts` (protected; the timezone domain) | `50de913a73caaef2ea98c7021fec24dd46a30d56177527ddda54db89bcb36f48` | Same | `9a78d17` (2026-05-23) |
| `packages/xai-web-dashboard-widgets/src/internal/Icon.tsx` (protected) | `afd71c525472e5ba9087cfcfe78b6b801767bff34f61c7a73b59a6cdd5b26985` | Same | `9a78d17` (2026-05-23) |
| `packages/xai-web-dashboard-widgets/src/index.ts` (protected) | `1e22d6b74d4f22655e273415798edd1c255b5af9a108f2a99822299ac8031b0b` | Same | `fae9398` (2026-09-09) |
| `packages/xai-web-dashboard-grid/src/DashboardModule.tsx` | `36a8532beb638a5741d3b51338a2ce32da9daa220e1a461cd00729da61e542a2` | Same | `c9a388d` (2026-09-10) |
| `packages/xai-web-dashboard-grid/src/DashboardGrid.tsx` | `395a134c9c1c3044ed86afdb48839373a7ba80ff57a387177dd277d76098fc2f` | Same | `72296ec` (2026-09-09) |
| `packages/xai-web-dashboard-grid/src/types.ts` | `afeb1112713155f8998ca13cc9dbfc174025c98497148ab21cd4f015201e40f2` | Same | `c9a388d` (2026-09-10) |
| `packages/xai-web-dashboard-grid/src/index.ts` (protected) | `fc5da5907da4de81a327736297ef2ae377a7cf3e589fb3c121475229f9acf71c` | Same | `45a1c15` (2026-09-10) |
| `packages/xai-web-dashboard-grid/src/DashHeader.tsx` (protected; the accepted Header) | `0aaa4ce3b456b1fedf3c4bb3f7163830e6ee7390ba65382564d9c13852e40456` | Same | `73b4eb9` (2026-09-10) |
| `packages/xai-web-dashboard-grid/src/WidgetGhost.tsx` (protected) | `0b476928649a3b24bd35d97869c0b1e9e4588ebdec4908b6ef8c5583d0272c9b` | Same | `7691f97` (2026-05-23) |
| `packages/xai-web-dashboard-grid/src/WidgetShell.tsx` (protected) | `7d1b74b80076983eb5cc34921d06d58b5365cbcf91efb63128a6c7938b1bd708` | Same | `ea234c0` (2026-06-02) |
| `packages/xai-web-dashboard-grid/src/styles.css` (protected) | `d9e330e70a375b0579fcf3b98e3d9ea2c633fc4b498b4b3a66fda3df8db9fdc6` | Same | `0f2d5a0` (2026-09-10) |
| `apps/web/src/routes/modules/departureCoordinator.tsx` (protected) | `0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075` | Same | F1 repair `f359be6` (2026-10-03) |
| `apps/web/src/routes/modules/dashboardRegistration.tsx` (protected) | `66c524e4e02117275ed369c02049f33a0eb2c42ad068388eb4041fa469c903e8` | Same | `f64ad44` (2026-09-10) |
| `apps/web/src/routes/modules/settingsDeparture.ts` (protected) | `80c3a5787df8eb02102c4a508f2fe67c1fbd6a6b8ba7f16b3a65c3f542c8548b` | Same | `0d7f885` (2026-09-09) |
| `apps/web/src/routes/modules/shellRegistrations.tsx` (protected) | `c003c499ca3330ff6e3b7e738df4e3366d0daca141d65327dacc3d3665e1b8fe` | Same | `45a1c15` (2026-09-10) |
| `apps/web/src/main.tsx` (protected; StrictMode) | `6a7cdfbc6b17cdc13a3dbcb44611b09c33ddf7c7787da4a6ed31265e4abbf243` | Same | `6c556e6` (2026-05-23) |
| `apps/web/src/providers/AccountStorageGate.tsx` (protected) | `1c6bf8c695e9bc8b80b83c6da0c3c55c44e9a88498dded1b8dd46f302d8cb666` | Same | `ce4b767` (2026-09-09) |
| `apps/web/src/providers/AppProviders.tsx` (protected) | `950cde0f7f6ba7cae9776a8e8442a303f938d5bb04d389dd1ac9760e10ebe655` | Same | `ab8c35a` (2026-09-09) |
| `apps/web/src/App.tsx` (protected; the sign-out sequence) | `f644e78ec482c0b9b66f9702407eb34e1dcd110e837293e4a736964bfe7ac408` | **Changed** (was `24461a52…`) | AppRail `f9eb4b1` (2026-10-09) |
| `packages/xai-web-shell/src/AppRail.tsx` (protected; the departure action) | `fe789078fecc60936d3e6c5fc2b203001a15490aecf30f3a0ca301da1399fb44` | **Changed** | AppRail `f9eb4b1` |
| `packages/xai-web-shell/src/Topbar.tsx` (protected; the status slots) | `aa5ac56e7b6a7652df70e82ed4d83dc81b44558181bfb48a30eb40b157d43c0e` | **Changed** | AppRail `f9eb4b1` |
| `packages/xai-web-shell/src/Shell.tsx` (protected; `onModuleClick`) | `38e25c6b20f6413c9362f53e9be7e2aa121001170898a6097e29fccabf22e432` | **Changed** (slot pass-through only) | AppRail `f9eb4b1` |
| `packages/xai-web-shell/src/types.ts` (protected) | `d18f637e9bec8c05f305fb29467acfd3fdcf2649e83ad2b28b877389752139c0` | **Changed** (additive) | AppRail `f9eb4b1` |
| `packages/xai-web-shell/src/index.ts` (protected) | `396a894d09b5b2b95f2ed063b615b41f371044f356d4d2ef9f224189e09b66ab` | **Changed** (additive) | AppRail `f9eb4b1` |
| `packages/xai-web-shell/src/internal/railOrderController.tsx` (protected; the rail sign-out step) | `d7f2f0b699e087c34d453309d9fe4c0eb6ba38ef52e6dfc70fe49d2f75c4e2a6` | New | AppRail `f9eb4b1` |
| `packages/xai-web-shell/src/internal/RailOrderStatus.tsx` (protected; the rail status) | `48b611ff1e2efbc96a888fd87f048925472702db898530cbf21f5df560ecff95` | New | AppRail `f9eb4b1` |
| `packages/xai-web-shell/src/internal/railOrderCopy.ts` (protected; the rail confirm text) | `268fb934f921843efd1c3e41cd9a81614ce26b3a94026e5884e10d633a05d7ba` | New | AppRail `f9eb4b1` |
| `packages/xai-web-shell/src/railOrderStatus.css` (protected) | `338f0eae7338458da54b996880cfa93034940e0f19220a1669c1570a8fd4b6e5` | New | AppRail `f9eb4b1` |
| `packages/xai-web-shell/src/AvatarMenu.tsx` (protected; the sign-out entry) | `3401b838a2dc5a16d1c6f1113a2aaf1ef6d8673897029bb2a1614db8c379c4c2` | Same | `aac2a5f` (2026-05-27) |
| `packages/xai-web-settings-appearance/src/internal/appearanceController.tsx` (protected; the Appearance step) | `64d6c8b74f689bc989bc8d1bcfa85bb333b068826829269f1e31d97cd2878e5a` | Same | Appearance `24073b5` (2026-10-05) |
| `packages/xai-web-settings-appearance/src/internal/appearanceRecoveryCopy.ts` (protected; the Appearance confirm text) | `991232e97e44919c1b00b5502a62df05d814de3ccc34ed4452104ad59b54dab0` | Same | Appearance `24073b5` |
| `packages/plugin-web-storage/src/internal/usePrefAsync.ts` (protected) | `541fae97413104b8db90c20d7b565a5492f17fc74d79b3e975f954d7189a4491` | Same | `b9ae2d9` (2026-09-10) |
| `packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts` (protected) | `e27f9f86196c08166b3c03f8450a546d486c2035adec42f91a90ae2723350332` | Same | `20a4591` (2026-09-09) |
| `packages/plugin-web-storage/src/internal/prefMutation.ts` (protected) | `3f8840ac8e7e824ddc9aacb6839d19a0602244235dbfd542f686ca749125ec00` | Same | `b9ae2d9` (2026-09-10) |
| `packages/plugin-web-storage/src/internal/usePref.ts` (protected) | `e1f2c9131cb9a00a2dff3951f4c95b2a7ad68692d0bf409b0ef511df137fa188` | Same | `d8412d3` (2026-09-09) |
| `packages/plugin-web-storage/src/internal/storage.ts` (protected) | `b51bcaa0de96cb9731df1253d256896397286cdbdad2ff9285984be15ebd6421` | Same | `6504589` (2026-09-09) |
| `packages/plugin-web-storage/src/internal/registry.ts` (protected) | `dd961a214c94ac97753e1878323ed387cde3362f4e85f1dfaa8154f1011d29d3` | Same | `6887879` (2026-09-09) |
| `packages/plugin-web-storage/src/internal/accountOwnership.ts` (protected) | `8d5b7fef04a014044b81cb95d56eaf084bfc306d7c8b9a27540b6caa3a2bef20` | Same | `6887879` (2026-09-09) |
| `packages/plugin-web-storage/src/internal/accountCoordination.ts` (protected) | `d669fe47d22f6d9f4b5c56b24ca60eb68dee9fc6877de4901d328ffdd7e50e1c` | Same | `e9fb5e7` (2026-09-09) |
| `packages/plugin-web-storage/src/internal/codec.ts` (protected) | `99a735801cab8ce9d7208c244efb8eda66dd641cf5c7d795302384207c6b9b8f` | Same | `ce6270c` (2026-05-23) |
| `packages/plugin-web-storage/src/internal/lifecycleDeclaration.ts` (protected) | `f292de4ec2e44d0fe75dde836fb360cfc2c292ceeaa47b2c107036765cd5b922` | Same | `adf7485` (2026-09-09) |
| `packages/xai-web-cmdk/src/internal/readModuleStates.ts` (protected reader) | `1ee898681af67b21bd84308bef99abf196ab8551069d53c8e570a9ec9e0ba008` | Same | `ce391ea` (2026-06-09) |
| `packages/xai-web-cmdk/src/adapters/dashboard.ts` (protected reader) | `0c8e6ac9cfbcffd6a52e3f21cd5a09b077d03bd0539798ebcbc626776b64b1eb` | Same | `59d7989` (2026-05-25) |
| `packages/plugin-web-tokens/src/layout.css` (protected) | `9397dc735d8d80a9720e81561dca73a0ed02a98fd16c1f15634e5c775e2bc6b7` | Same | `c100dbb` (2026-07-09) |
| `packages/plugin-web-tokens/src/tokens.css` (protected) | `7c6eddebd1d826f939862ef75ba8159e966f0c76b0b9d34a0911f6b47265615d` | Same | `1be1107` (2026-06-04) |
| `packages/plugin-web-tokens/src/i18n.ts` (protected) | `d5f2189b081d16a9f26b7146978c5f81660a6a44d6f534b9ac48e6e3c7ccb885` | Same | `ce391ea` (2026-06-09) |
| `packages/xai-web-pet/src/DesktopPet.tsx` (protected) | `35edb0e686bf6682192ba1bbe7842d159e161a6593b7ccd13a432d59fe58ad6f` | Same | `7a3d712` (2026-06-03) |

**Effect of the 19 changed files (`419e56d..f9eb4b1`) on this caller.** None of them is a Clock or dashboard file, and none holds either Clock key: a search at `f9eb4b1` finds `xai_clock_style` and `xai_clock_tz` in none of them. They change the App that every host, native and visual row of this caller mounts.

| File(s) | What changed at `f9eb4b1` | Effect on this contract |
| --- | --- | --- |
| `apps/web/src/App.tsx` | The App creates one rail-order controller (`:139`). `RailOrderProvider` wraps `Shell` (`:216–232`). The Topbar slot gets `<RailOrderStatus />` (`:227`). Sign-out runs the rail step before the Appearance step in both auth branches (`:176`, `:187`) | §3 items 9 and 15, §7 item 5, host rows g and q, Sol D5, F1 cases c4 and c5, and the confirm recorder rule (§12 rule 12). Protected: an edit to `App.tsx` is a stop condition (§18) |
| `apps/web/src/__tests__/App.railorder.test.tsx` (new) | 18 App tests of the rail step and status | Joins the §10 item 10 web tests and E23 |
| `packages/xai-web-shell/src/AppRail.tsx` | The rail is now a view of the context controller, or of a standalone one when there is no provider (`:44–56`). Drags reorder an in-memory preview and write once, at the drop (`:106–160`). The click path `if (!dragId) onModuleClick(id)` is unchanged (`:245–247`). Accessible names come from the nav labels as before (`:238–239`) | AppRail clicks stay a valid departure action (§3 item 15). Rail drags are never a departure action; they are used only to create a rail draft in row q and case c5 (§12 rules 13 and 14) |
| `packages/xai-web-shell/src/Topbar.tsx`, `Shell.tsx` | A new optional `railOrderStatus` slot sits immediately after `appearanceStatus` (`Topbar.tsx:117`, `:124`), with a pass-through at `Shell.tsx:86`. `onModuleClick` is unchanged (`Shell.tsx:37–40`) | §9: the rail status must be absent unless seeded. Topbar width and markup are unchanged while it is absent (the accepted AppRail E12 clean-chrome invariance) |
| `internal/railOrderController.tsx` | `confirmSignOut` (`:252–266`). The status kind (`:286–299`): only after a draft has failed, or for an invalid or unavailable source. `beforeunload` only while a rail draft exists (`:312–321`). Mount makes no write | The rail step makes zero confirms without a rail draft. A throwing or malformed `xai_rail_order` would raise a rail *source* status, so the seed rule keeps that key absent or in-domain and makes faults key-scoped (§12 rules 10 and 11). Row h runs without a rail draft |
| `internal/RailOrderStatus.tsx`, `internal/railOrderCopy.ts`, `railOrderStatus.css` | The status renders no node when its kind is null (`RailOrderStatus.tsx:109`). The confirm text is at `railOrderCopy.ts:56` (EN) and `:73` (ZH). All selectors begin with `.rail-order-status` | The recorder tells the rail and Appearance prompts apart by their text. The Clock CSS scope (`.clock-recovery*`, `.w-clock-body`) cannot collide with these selectors |
| `internal/railOrderModel.ts`, `types.ts`, `index.ts`, `docs/api.md`, `docs/test.md` | Pure model, additive types and exports, docs | None |
| `src/__tests__/` (`AppRail.railorder`, `RailOrderStatus`, `railOrderModel`, `railOrderFixture`, `Topbar` +2) | Shell tests | Run in AppRail `original` (E24); unchanged by this caller |

**Status.**
- This contract specifies the next ordered implementation unit after the accepted AppRail order caller (`efe05ea`). The controller parked r1 behind AppRail (control plane, "批次 54 回执与排程") and asked for this r2 (batch 67).
- It does not authorize implementation. It accepts nothing, changes no formal count and closes no 312 item.
- Its scoping decisions A1–A9 (§4) are **assumptions awaiting controller confirmation**. They correspond to the (a) pre-decisions E1-1 … E1-9 of the selection memo. No product-owner decision is needed. A7 carries an escalation note.

**Authority.**
- **Selection:** [selection-419e56d.md](../web-next-caller-selection/selection-419e56d.md), candidate E1, §5–§7. Its facts are about unchanged files and still hold at `f9eb4b1`.
- **Batch 67 brief:** control plane `61469c4`, "批次 67：时钟合同 r2", and the block "时钟合同 r1 须改为 r2 的依据" under "当前进行中的调用方".
- **Scheduling:** [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md). Line 18 names "Clock style/timezone" in the Dashboard widgets and shell group. Line 25 requires a complete caller with its genuinely shared producers. The Clock has no shared producer: the widget is its only writer.
- **Inventory:** [refresh-f9eb4b1.md](../web-d2-pref-binding-inventory/refresh-f9eb4b1.md) (`8b9e613c…`) and `bindings-f9eb4b1.json` (`5ef90bd3…`). The rows are `ClockWidget.tsx:51` (`xai_clock_style`, `setStyle`, 1 direct call) and `:52` (`xai_clock_tz`, `setTz`, 2 direct calls). Both rows are unchanged from `419e56d`.
- **Account lifecycle:** the [D2 entry contract](../web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md), item 2: device-only keys stay under their classified device contract.
- **Precedents:**
  - The [Appearance contract r3](../web-appearance-recovery-contract/contract.md) is the structural template. Its [acceptance](../web-appearance-recovery-acceptance/acceptance-419e56d.md) supplies rulings 3 (K-1), 4 (release-once), 5 (F-APP-1/F-APP-2), 7 (F-FD1/C-FD1), 9 (R-PET) and 11 (the scope of the 44×44 rule).
  - The [AppRail contract r1](../web-apprail-order-recovery-contract/contract.md) (`b9e407b3…`) and its [acceptance](../web-apprail-order-recovery-acceptance/acceptance-f9eb4b1.md) supply the f9eb4b1 sign-out sequence, the rail status and the rulings carried here. These are §6 item 2 (the release-once reading), item 4 (D1 and its qualification), item 7 (the narrow-width pet toggle), item 8 (F-E14-1), item 10 (host-suite buffer copies; streaming `git archive`), item 12 (C-RD1 and the other judging copies) and item 13 (clean-state chrome invariance).
  - The [Dashboard Header contract](../web-dashboard-header-departure-contract/contract.md) and its [acceptance](../web-dashboard-header-departure-astra/acceptance-73b4eb9.md) supply the Dashboard departure host, the Header export format and the Header evidence that must keep passing.
  - The [Features contract](../web-features-recovery-contract/contract.md) supplies the device-only pattern.
  - The [F1 impact review](../web-sticky-recovery-f1/impact-review.md) supplies the coordinator regression oracle. [affected-callers-f359be6.md](../web-sticky-recovery-f1/affected-callers-f359be6.md) §3.7 is the precedent for rerunning the Header after a shared change.
  - [`blocked-f359be6.md`](../web-sticky-recovery-acceptance/blocked-f359be6.md) §4 is the G1 lesson (§14).
  - [`review-fb002.md`](../web-more-recovery-fb002/review-fb002.md) is the F-B002 lesson.
  - [`review-oe.md`](../web-appearance-recovery-oracle-erratum/review-oe.md) is the OE-1/OE-2 lesson.
  - [`review-k1.md`](../web-native-keyinput-k1/review-k1.md) is the K-1 lesson.
  - [`review-final-regressions-419e56d.md`](../web-appearance-recovery-final/review-final-regressions-419e56d.md) §7 is the F-FD1 lesson. [`review-final-regressions-f9eb4b1.md`](../web-apprail-order-recovery-final/review-final-regressions-f9eb4b1.md) §2–§6 lists the current runners, copies and counts for every accepted caller.

## 1. Roles, order and risk

| Role | Executor | Boundary |
| --- | --- | --- |
| Parent / controller | Claude controller | Scheduling and the contract check, including confirming A1–A9. Also runs: the production-App jsdom host baseline; native and browser verification; the Clock F1-shape runner; the frozen F1 runners and the rail and Appearance F1-shape runners; the Header and AppRail affected-caller reruns; the ledgers |
| Sol | New independent Opus-class instance | Freezes business oracles against an immutable `f9eb4b1` archive before any implementation, then reruns them unchanged on the fixed product |
| Terra | Implementation instance; Opus-class recommended, because the aggregation sits on the accepted Header's departure path | The complete caller, inside the §11 files only. Starts after every before baseline (E1–E5) is frozen and the controller authorizes it. Records its own test runs in the reserved directory (§11, E6) |
| Final regression | New instance, distinct from Terra and Sol | Runs §13 gate 9 and writes the §14 E25 receipt |
| Final acceptance | New instance, distinct from the r1 and r2 authors, Terra, Sol and the final-regression verifier | Reconciles every §13 row and every §14 item: source → correct before failure → fixed independent result → actual surface |

**Exclusions by role.** Luna gets no task: persistence, the async queue, departure aggregation, the host, cross-module isolation and acceptance are its forbidden zones. Spark is never assigned.

**Order.**
1. Contract.
2. Controller check of this revision, confirmation of A1–A9, and registration.
3. Frozen before baselines at `f9eb4b1` (E1–E5): the Sol oracles; the parent production-App host baseline with the cross-caller seed scan; native before; the Clock F1-shape before log.
4. Terra implementation.
5. Sol fixed reruns.
6. Parent host, native, Clock F1-shape and F1 regression verification.
7. Header and AppRail affected-caller reruns, and the final regression receipt.
8. Independent acceptance.

Do not run another caller's implementation concurrently. CP-APPRAIL-01 is accepted (`efe05ea`), so nothing is in flight.

**Risk: medium. The product risk is low, but the shared surface is not.**
- **What device-only ownership removes:** account-scoped physical keys, the account lifecycle lock, private-owner admission, committed markers, tombstones, recovery admission, the private-draft disposal boundary and mixed-owner batches. Both keys are explicit device keys (`accountOwnership.ts:28–29`).
- **What still makes this unit risky:**
  - **The accepted Dashboard Header's departure path changes.** Today the coordinator's single guard slot (`departureCoordinator.tsx:76, 83–92`) holds the Header's guard directly (`DashboardModule.tsx:158` → `DashHeader.tsx:784–798`). After this caller it holds a combined guard built by a new aggregator. Any divergence from the Header's accepted single-participant behaviour would be a regression of an accepted caller and of the F1 class.
  - **Sign-out now has three steps before identity is invalidated.** The rail step, the Appearance step and the coordinator run in that order (`App.tsx:176–178`, `:187–189`). The Clock participant may be asked only after both earlier steps resolve `true`. A Cancel at an earlier step must leave the Clock and the coordinator untouched.
  - **Two Clock instances render during a drag** (the source and `WidgetGhost`, `DashboardGrid.tsx:164–166`), so the ghost must stay inert.
  - **Widget removal unmounts drafts** outside any route departure (`WidgetShell.tsx:291–300` → `DashboardModule.tsx:90–103`).
  - **Re-render pressure.** `DashboardModule` re-renders every second (`:35–41`), so registrations must not churn on ticks.
  - **A combined export** may download two files from one dialog activation.
  - **One App, three async device controllers.** The App-scoped Appearance and rail-order controllers and the per-widget Clock controller all use the shared async engine. They must not interfere: each key has its own lock name (`prefMutation.ts:153`).
  - **Native evidence** runs in the production `App` composition. That includes the App-level DesktopPet (R-PET) and, since `f9eb4b1`, the rail status slot.

## 2. Exact ownership inventory

**The unit.** It consists of:
- `packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx`: the two legacy bindings (`:51–52`), their display fallbacks (`:36–42, 56, 61–75`), the style toggle (`:259–272`, writer `:265`) and the timezone popover (`:248–258` trigger, `:273–328` popover, writers `:286, 309`);
- the Clock registration and the structural context copy in `registrations.tsx` (`:24–28`, `:51–57`);
- the Dashboard departure path that a widget must join: `DashboardModule.tsx:34, 158, 162–169`, `DashboardGrid.tsx:121, 135–166` and `types.ts:11–23, 45–55`.

**Naming and sources.**
- Field ids: `style` and `timezone`.
- Ownership: `accountOwnership.ts:28–29`. For a device key the physical key equals the logical key.
- Registry entries: `registry.ts:268–284`, both with the `string` codec. The `ClockStyle` type is at `:80`.
- Existing control labels: tokens `i18n.ts` EN `:223–230` (Classic, Split, Minimal, Analog, Local time, Timezone) and ZH `:540–547` (经典, 分段, 极简, 模拟, 本地时间, 时区). City names come from `cityLibrary.ts:18–31`.

| Field id | Controls (existing selectors) | Recovery label EN / ZH (new, §5) | Physical key | Codec and exact bytes | Strict domain | Default |
| --- | --- | --- | --- | --- | --- | --- |
| `style` | `.clk-style-toggle button[data-clock-style]` ×4. Each accessible name comes from `title`, because the icons are `aria-hidden` (`internal/Icon.tsx`). Selection is `aria-selected` (`ClockWidget.tsx:259–272`) | Clock style / 时钟样式 | `xai_clock_style` | Registered `string` codec, raw, for example `analog` | `classic`, `split`, `minimal`, `analog` | `classic` |
| `timezone` | `.clk-tz-btn` opens `.clk-tz-popover`, which holds 13 `.popover-item[data-tz-id]` buttons: `local` and 12 cities. The active item carries `.active` (`:248–328`) | Clock timezone / 时钟时区 | `xai_clock_tz` | Registered `string` codec, raw, for example `shanghai` or `local` | `local`, `shanghai`, `london`, `new_york`, `tokyo`, `sf`, `paris`, `sydney`, `berlin`, `dubai`, `singapore`, `hk`, `la` | `local` |

**Domain enforcement is caller-only.**
- The `string` codec decodes any string (`codec.ts:44–47`).
- `validateRegisteredPrefValue` checks only the primitive type (`prefMutation.ts:42–47`).
- Strict validators therefore come from the caller and are composed with the codec boundary (`usePrefAutosaveAsync.ts:37–58`). The timezone domain is derived from `CITY_LIBRARY`, which stays unchanged.
- Do not add domains to the registry, codec or engine.

**Hidden or conditional inputs.**
- The timezone items exist only while the popover is open.
- Every control submits a closure-bound value; no control submits a DOM-provided value.
- `ClockWidget` renders once per WidgetShell and a second time inside `WidgetGhost` during a drag. The ghost has `pointer-events: none` (`layout.css:3633–3641`).

**Writers and readers outside the unit.** The search was repeated for r2 at `f9eb4b1`. It covered `apps/` (including `apps/desktop`, the service worker and `apps/web/src/host`) and `packages/`, all extensions, excluding `docs/` and tests. It gives the same result as at `419e56d`:
- **Writers:** none besides `ClockWidget.tsx:265, 286, 309`. There is no `setPref`/`removePref`, raw, wrapper, reset, event or migration writer. `resetAllPrefs` has no production caller. The 19 `f9eb4b1` files add none.
- **Readers:**
  - CmdK `readModuleStates.ts:36–41` reads both keys with `getPref` when the palette opens;
  - CmdK `adapters/dashboard.ts:96–106` matches the stored style string against the query; `clockTz` is read but unused.
- **Lifecycle** (`lifecycleDeclaration.ts:25–34`): both keys are device-preference, with export scope `device-recovery`, `retain` on account deletion and `retain-on-device` in migration, all derived from ownership.

**Preserve:**
- the widget registration id `clock`, span `w-clock`, its aria-label "Clock widget"/"时钟组件" (`registrations.tsx:52–57`), and the default order position (`registry.ts:124–136`);
- the four faces with their `data-testid`s (`clock-classic`, `clock-split`, `clock-minimal`, `clock-analog`), the analog SVG ticks and hands, `.clock-sub`, the toolbar's `data-no-drag`, the style buttons' `title`s and `data-clock-style`, the trigger's `title` and label, the 13 popover items with their order, labels, UTC offsets and `data-tz-id`, the scrim click that closes the popover, and the popover closing after a choice;
- the displayed-time computation, including its static offsets (DASH-02 is excluded, §16);
- every public export of `@repo/plugin-web-dashboard-widgets` and `@repo/plugin-web-dashboard-grid` (additions only);
- `DashHeader.tsx`, its props, its registration timing and its accepted behaviour, byte for byte.

## 3. As-is behavior at `f9eb4b1`

These are facts only. Suspected defects appear solely as hypotheses in §12. Items 1–8 and 10–14 concern files that are byte-identical to `419e56d`, and r2 re-checked each cited range.

1. **Bindings.** Both fields use legacy `usePref` (`ClockWidget.tsx:51–52`). The setter calls synchronous `setPref` (`usePref.ts:130–151` → `storage.ts`): compare-before-write, then `localStorage.setItem`, with no Web Lock, expected baseline or readback. The hook updates its state only when `setPref` returns `true` (`usePref.ts:141–147`).
2. **Failure.** When a write fails, the control does not take the choice. There is no message, Retry, Discard or export. Nothing persists, and nothing is protected on departure or unload.
3. **Malformed bytes.** Any stored style outside the four displays Classic (`:36–42, 56`). An unknown timezone id displays Local time (`:61–75`). Both happen silently: no alert, no Reload, no write.
4. **Cross-document.** Legacy `usePref` follows `storage` events for the physical key (`usePref.ts:155–196`).
5. **Mount.** Loading the Dashboard, mounting the widget, opening and closing the popover and the one-second tick make zero writes on either key.
6. **Rendering.**
   - Widgets receive `{ lang, now, goTo }` (`DashboardGrid.tsx:121`; `types.ts:45–55`). The widgets package declares its own structural copy of that type (`registrations.tsx:24–28`), because the grid package depends on the widgets package.
   - The Clock registration passes only `lang` and `now` (`:56`).
   - During a drag, the dragged widget renders a second time in `WidgetGhost` with the same context (`DashboardGrid.tsx:164–166`). Widget drags are pointer-event drags (`DashboardGrid.tsx:151`; `WidgetShell.tsx:172`), not HTML5 drags.
7. **Dashboard departure.**
   - The app adapter mounts the shared coordinator around `DashboardModule` (`dashboardRegistration.tsx:19–47`) and routes widget `goTo` through `navigate` (`:28–32`).
   - The coordinator holds one guard. A registration replaces it, and an unregister clears it only on a token match (`departureCoordinator.tsx:76, 83–92`). `canBlock` requires `isCurrent() && isBlocking()` (`:93–96`).
   - A live blocked POP whose guard is no longer current is reset; one that is current but not blocking proceeds (`:179–213`).
   - A held intent is re-evaluated whenever the guard version or the intent version changes: not current → stay; current and not blocking → proceed (`:214–222`).
   - The dialog label is `guardRef.current?.label` (`:242`). Export calls `exportDraft()` only while current and blocking (`:228–231`). "Discard local changes and leave" calls `discardDraft()`, then proceeds (`:232–240`).
   - The dialog is `aria-modal="true"`, takes focus when it opens and traps Tab and Shift+Tab among its buttons; Escape means Stay (`:244–252`, `:260–284`, `:290`).
8. **The Header's registration.**
   - `DashboardModule` passes the coordinator's `registerDepartureGuard` only to `DashHeader` (`DashboardModule.tsx:158`).
   - The Header registers in an effect with the label "Dashboard header"/"工作台备注", and re-registers whenever its effect dependencies change (`DashHeader.tsx:784–798`). Those dependencies include `registerDepartureGuard`, `draftVersion` and `lang`.
   - The coordinator's registration function is stable (`departureCoordinator.tsx:83`), so the Header does not re-register on ticks.
9. **Sign-out (changed at `f9eb4b1`).** `handleSignOut` (`App.tsx:170–201`) runs these steps, each awaited, in each auth branch:
   - **Coordinator branch:**
     - the capture check (`:174–175`);
     - the **rail step** (`:176`);
     - the **Appearance step** (`:177`);
     - `requestSettingsDeparture("sign-out")` (`:178`);
     - the re-checks (`:179–180`);
     - identity invalidation (`:181`);
     - `coordinator.signOut` (`:182`);
     - the redirect (`:184`).
   - **Fallback branch:**
     - the rail step (`:187`);
     - the Appearance step (`:188`);
     - `requestSettingsDeparture("sign-out")` (`:189`);
     - the scope re-check (`:190`);
     - invalidation (`:191`);
     - the best-effort client sign-out (`:192–198`);
     - `clearSessionStorage` (`:199`);
     - the redirect (`:200`).
   - **The rail step** is `railOrder.confirmSignOut` (`App.tsx:169`; `railOrderController.tsx:252–266`).
     - Without a rail draft it resolves `true` with zero `window.confirm` calls.
     - With a rail draft it makes one `window.confirm`, with the text of `railOrderCopy.ts:56` (EN: "Your sidebar order change is not saved. Sign out and discard it?") or `:73` (ZH). Cancel resolves `false`, and nothing later is asked. OK discards the rail draft with zero writes and resolves `true`.
   - **The Appearance step** is `appearance.confirmSignOut` (`App.tsx:165`; `appearanceController.tsx:463`). It behaves the same way, with the text of `appearanceRecoveryCopy.ts:71` (EN: "Some appearance changes are not saved. Sign out and discard them?") or `:98` (ZH).
   - **The coordinator step.** `requestSettingsDeparture` resolves through the mounted coordinator's delegate (`settingsDeparture.ts:14–16, 22`; `departureCoordinator.tsx:158–170`). On the Dashboard that is the Dashboard coordinator.
   - **Entry.** The AvatarMenu reaches `onSignOut`, which `Shell` passes to `AppRail` (`Shell.tsx:73`; `AppRail.tsx:206–212`).
10. **Widget removal.** The WidgetShell remove button (`WidgetShell.tsx:291–300`) calls `DashboardModule.removeWidgetFromOrder` (`:90–103`). When the order write succeeds, the widget leaves `activeWidgets` and unmounts. Removal emits no event-bus event.
11. **Presentation.**
    - `.w-clock` spans 6 columns with a minimum height of 160 px (`layout.css:3670`). It spans 12 at 1200 px and below (`:4134–4135`), and 8 between 781 and 1024 px in the dashboard stylesheet (`xai-web-dashboard-grid/src/styles.css:1023, 1072–1076`).
    - The style buttons are 22×20 in tokens (`layout.css:3708–3714`). They are forced to 44×44 only between 641 and 1024 px (`xai-web-dashboard-grid/src/styles.css:1234–1257`).
    - The global focus ring is a 2 px accent outline (`tokens.css:246–253`). A selected style button has a background and a shadow (`layout.css:3715–3719`), and the active timezone item a background (`layout.css:3174`).
    - **The popover.** It has no Escape handling and closes on a scrim click (`ClockWidget.tsx:273–279`). The scrim is fixed over the whole viewport (`layout.css:3137–3140`; widgets `styles.css:138–143`). The popover is absolutely positioned under the toolbar with a maximum height of 240–320 px (`layout.css:3691–3698`; widgets `styles.css:144–156`). It does not close when keyboard focus leaves it. After a keyboard choice it unmounts with focus inside it.
12. **Static offsets.** The 12 cities use integer UTC offsets without DST (`cityLibrary.ts:1–6, 18–31`).
13. **Existing tests that encode current behaviour** (dispositions in §11): `ClockWidget.test.tsx` AC-CLOCK-1…8 and two extras; `analogClockTicks.test.tsx`; `registrations.test.tsx`; `slotIntegration.test.tsx`. No test installs `navigator.locks` in either dashboard package's setup.
14. **Accepted async interface to reuse.** Appearance contract r3 §3 item 14 and Features contract §3 item 11 apply:
    - `usePrefAutosaveAsync` returns `{ value, edit, retry, reset, meta }` (`usePrefAutosaveAsync.ts:82–93`);
    - the per-field queue coalesces a queued absolute set into the tail (`usePrefAsync.ts:229–243`);
    - a failed request holds the queue and keeps its token (`:195–202`);
    - `retry` re-runs the held request with its own kind and token (`:262–276`); with no held request it performs a set of the displayed value (`:278`);
    - `meta.reload()` disposes the binding controller and rereads (`:291–300`);
    - an idle binding projects external changes, and a drafted one becomes a conflict (`:142–167`).

    In addition:
    - device keys skip the account lock (`prefMutation.ts:244`);
    - every write takes `prefMutationLockName(<key>)` (`:153`);
    - without `navigator.locks` every write is refused (`accountCoordination.ts:12–16`);
    - invalid or unavailable sources are refused before writing (`prefMutation.ts:198`).

    Since `f9eb4b1`, the rail controller has also used this engine, on the registered `json` path (`railOrderController.tsx:276`).
15. **App chrome at `f9eb4b1` (new in r2).**
    - **The rail controller.** App creates one rail-order controller inside `AccountStorageGate` (`App.tsx:139`). Its mount makes zero writes.
    - **The rail status.** It renders no node unless (a) the rail draft has settled unsuccessfully at least once, or (b) no rail draft exists and `xai_rail_order` is invalid or unreadable (`railOrderController.tsx:286–299`; `RailOrderStatus.tsx:109`). Its selectors are `.rail-order-status` and `[data-testid="rail-order-status"]`. The Appearance status (`[data-testid="appearance-status"]`) renders only for Appearance drafts that did not save.
    - **Unload.** The rail controller's `beforeunload` listener exists only while a rail draft exists (`:312–321`).
    - **AppRail as a departure action.**
      - Each module button is `.app-rail .rail-items .rail-btn`, with the accessible name of its nav label (`AppRail.tsx:230–244`).
      - A click calls `onModuleClick(id)` unless a rail drag gesture is in progress (`:245–247`). A plain click starts no gesture, because only `dragstart` sets one (`:114`).
      - `Shell.onModuleClick` emits `web:shell:module-change` and calls `navigate("/app/<id>")` (`Shell.tsx:37–40`), which the Dashboard coordinator's blocker intercepts.
      - **Equivalence with `419e56d`.** This path is the same as at `419e56d` (`AppRail.tsx:171–172` there). With `xai_rail_order` absent, the rail's markup is identical to `419e56d`: AppRail E12 compared the clean chrome in 24 configurations, 360/360 checks.
      - **Drags are a different gesture.** A rail drag previews in memory and writes once, at the drop (`:106–160`). It is never a departure action.
    - **The pet toggle.** It sits in `.rail-bottom`, which the protected tokens hide from 641 to 767 px (`layout.css:1943`, `:1994–1997`) and at 640 px and below (`:2093`, `:2144–2147`). `petOn` is in-memory App state, initially `true` (`App.tsx:121`).

## 4. Scoping decisions (A1–A9 await controller confirmation)

**r2 changes here:** A1 and A9 change their wording only, as stated in each. A2–A8 are r1's text, unchanged, because none of them depends on a changed file.

**A1 — Scope (selection E1-1).**
- Terra edits exactly the §11 files: the Clock files in `xai-web-dashboard-widgets`, plus `DashboardModule.tsx`, `DashboardGrid.tsx`, `types.ts` and one new internal module in `xai-web-dashboard-grid`.
- These stay protected: `DashHeader.tsx`, the coordinator, `settingsDeparture.ts`, `dashboardRegistration.tsx`, `shellRegistrations.tsx`, `App.tsx` (including its rail and Appearance sign-out steps), storage, tokens, the whole shell (including `AppRail.tsx`, `Topbar.tsx`, `Shell.tsx` and the four rail-order modules), the pet, CmdK and every other package.
- **The affected-caller reruns:**
  - the Header evidence (E17);
  - the AppRail and other accepted-caller suites (E24);
  - the F1 regression, now including the rail F1-shape runner (E15);
  - the Clock F1-shape mode (E5, E16).

  The clean-state Dashboard invariance gate (§10 item 6) bounds the visual re-verification of the Header. The accepted AppRail clean-chrome invariance, together with an empty shell diff, bounds that of the AppRail.
- *r2 change:* the protected and rerun lists only. The `f9eb4b1` files are added as protected, and the AppRail reruns are added. Terra's file set is unchanged.

**A2 — Departure participation through one combined guard (selection E1-2).** `DashboardModule` aggregates participants and forwards one combined guard to the unchanged coordinator, exactly as §6 specifies. The Header's code does not change: it receives the aggregator's registration function in place of the coordinator's, with the same type (`DashboardHeaderDepartureGuardRegistration`, `types.ts:21–23`).

**A3 — One controller per mounted Clock widget; the ghost stays inert (selection E1-3).**
- The real Clock instance owns its two bindings, the operation and recovery model, the export, the unload warning and its departure participant.
- `DashboardGrid` gives the ghost render a context without the registration field (§6 item 3). The ghost therefore registers nothing and makes zero storage attempts. It displays committed bytes, which may differ from the source widget's draft during a drag.
- A standalone `<ClockWidget lang now />` with no registration works without departure participation: unload warning only.

**A4 — Registered bindings (selection E1-4).**
- `usePrefAutosaveAsync("xai_clock_style", { validate })` and `usePrefAutosaveAsync("xai_clock_tz", { validate })` on the registered path.
- No registry, ownership, codec or lifecycle change.
- Bytes are identical to today's raw strings.

**A5 — Strict domains; refuse, never repair (selection E1-5).**
- The domains are those of §2.
- Invalid or unreadable bytes display the default, never throw, show a source alert with Reload only, and are never rewritten.
- A valid choice over them is a failed draft (`prefMutation.ts:198`). This is the retained REL-07 limitation (§16).

**A6 — Feedback and export surface (selection E1-6).**
- A field's recovery block renders only while the field has a **settled unsuccessful** draft or a **source-only** issue (§5 item 7).
- A pending field shows no text: the control already displays the choice, and the departure guard and unload warning protect it.
- There is no success line anywhere: the absence of a block is the only success state, and there is no "Saved" claim.
- The inline Export renders while at least one field has a settled unsuccessful draft (§8). A source-only issue alone never renders it.
- There is no Retry all, Discard all, Reset or status line, and no Topbar status (the Clock has no App-level surface).

**A7 — Widget removal discards Clock drafts (selection E1-7).** Removing the Clock widget unmounts its controller, which disposes every Clock draft with zero set or remove attempts by the controller (§7 item 6). The removal interaction is unchanged.
- *Escalation note:* if the controller reads REL-05's "保留草稿" as requiring removal protection, holding or confirming removal becomes a product decision for the user, and this contract needs a revision.

**A8 — Test dispositions (selection E1-8)** exactly as §11.

**A9 — R-PET and the other global overlays (selection E1-9)** exactly as §9.
- *r2 change:* the global overlays now include the rail-order status, which must be absent unless seeded, exactly like the Appearance status.
- Below 768 px the pet is hidden through the rail toggle at a width of 768 px or more, and the page is then resized without a reload (§3 item 15; AppRail acceptance §6 item 7).
- The blocking criteria are unchanged.

**D-notes.**
- *Counts match.* Two inventory rows (`ClockWidget.tsx:51, 52`) are the whole caller. Inventory rows are not defect counts.
- *Not a Header change.* `DashHeader.tsx` is byte-unchanged. Only the function it receives changes, and §6 item 6 requires single-participant equivalence.
- *Not a grid persistence change.* Dashboard order, layout and appearance persistence (`useOrderSaveRecovery`, `useWidgetMapRecovery`) stay untouched. Their drafts stay unprotected on departure until their own caller (selection memo N3).
- *Not a shell or App change.* The rail and Appearance sign-out steps already precede the coordinator. The Clock joins sign-out only through the coordinator's combined guard, so no edit to `App.tsx` or the shell is needed (§18).

## 5. Both fields: edit, source and operation requirements

**Interface.**
- Use the accepted `usePrefAutosaveAsync` edit, retry and meta interface: two bindings in a fixed order (style, then timezone) with a stable hook order and strict validators per §2.
- Preserve the shared queue and coalescing, result semantics, exact baseline and readback, and uncertainty grants.
- Do not add:
  - raw storage calls or a caller storage preflight;
  - a forced rebase or a manual lock layer;
  - any `StorageEvent` dispatch or event-bus emission;
  - any change to legacy `usePref`/`setPref` behaviour for other callers;
  - any registry, ownership, codec or lifecycle change.
- Call `retry` only for a field with a held failed request. A failed set is retried through `retry`, which keeps the request's kind and token (`usePrefAsync.ts:262–276`). Never use `reset`: this caller has no reset.

1. **Zero-write mounts.**
   - These make zero set or remove attempts on both keys and on every other key: loading the production App on the Dashboard, mounting the widget, the one-second tick, opening and closing the popover, a drag (including the ghost), reloading, and navigating away and back.
   - Absence displays the default.
2. **Source truth.**
   - Each of these makes its field *unavailable*:

     | Key | Malformed bytes |
     | --- | --- |
     | `xai_clock_style` | `bogus`, `Analog`, an empty string, ` classic` (leading space), `"analog"` (with quotes) |
     | `xai_clock_tz` | `mars`, `Shanghai`, `UTC+8`, `Asia/Shanghai`, `new-york`, an empty string, `"local"` (with quotes) |

     So does a `getItem` that throws for that one key. The fault is scoped to the Clock key. A `getItem` that throws for every key would also make `xai_rail_order` unavailable and raise the rail source status (§3 item 15), so it is never used for source truth.
   - An unavailable field displays its default (Classic, or Local time) and never throws anywhere: the Dashboard and every `/app` route work.
   - The widget shows that field's localized source message with **Reload only**, and makes no success claim.
   - No draft, export entry, departure hold or unload warning is created.
   - Mount, Reload and Discard never rewrite, purge or normalize those bytes.
   - A valid choice over such a source is actual work. Keep it as a failed draft with Retry, Discard, export, departure hold and unload warning, and never silently overwrite.
3. **No DOM-provided inputs.** Every control submits a closure-bound value. Oracles must not fabricate private calls to reach values the UI cannot submit.
4. **Identity and latest authority.**
   - Each valid choice establishes its field, session and operation identity before it is enqueued.
   - The choice displays immediately, even while the per-key lock is held: the face, `aria-selected`, the active popover item, the trigger label, `.clock-sub` and the displayed time.
   - Controls stay enabled while an operation is pending.
   - **Rapid choices.** Every click is a new latest intent, and the queue may coalesce. The final bytes equal the last choice, and an earlier completion never makes a later choice look settled.
   - Completion authority belongs to the exact draft object. It does not come from value equality, `meta.value`, `meta.status`, an earlier success or failure, or a predecessor Promise.
   - Only the matching latest success clears a field's work. Choosing a value equal to the default stores it; it is never converted to removal.
5. **Failures keep the latest choice, displayed.**
   - Covered failures: quota, a throwing `getItem` or `setItem`, missing or rejected Web Lock capability, conflict, readback uncertainty, and an invalid or unavailable source.
   - Each keeps the latest choice with accurate settled feedback (item 7). None may produce an unhandled rejection or a success claim.
   - A Retry while the field is pending is inert or idempotent.
   - Cover these orderings:
     - the predecessor succeeds and the latest fails;
     - the predecessor fails while the latest stays queued, and Retry advances the predecessor without acknowledging the latest, which then runs as its own first attempt;
     - repeated failed-predecessor recovery;
     - a later failure of the latest.
6. **Uncertainty and conflict.**
   - An unchanged uncertain Retry keeps its grant across temporarily denied reads or locks. It reconciles with exactly one total write, and readback must match the intended bytes.
   - An external replacement or removal stays a preserved conflict, including restoration of the original baseline bytes.
   - Repeated Retry never gains authority to overwrite. A distinct new choice is a new operation.
7. **Independent settlement and truthful presentation.**
   - A field's success never retries, rewrites, discards or rereads its sibling.
   - Cover:
     - both fields unresolved at once;
     - a conflict on one field coexisting with an unrelated quota failure on the other;
     - one field failing while the other succeeds.
   - **Field states:**
     - *clean:* no block;
     - *pending* (in flight, queued or held behind the lock): no block or text;
     - *settled unsuccessful* (the field has an actual current draft, nothing for it is in flight or runnable, and its queue is held by a failed request, including a latest intent queued behind a failed predecessor): a block with "<Label> was not saved.", Retry and Discard;
     - *source-only* (no draft, unavailable source): a block with the source message and Reload only.
   - A field with both an unavailable source and a failed draft shows the failed-draft block. Discard returns it to source-only.
   - **No success claim** of any kind. The block of a field that succeeds simply unmounts.
8. **Recovery actions.** Each field has its own Retry, Discard and, for source-only issues, Reload. Each is localized and labelled with the field name.
   - Reload refuses, at invocation time, to erase the same field's actual draft.
   - Discard detaches the field's work before the safe `meta.reload()`. It makes zero set or remove attempts and rereads only that field. The display returns to the committed value.
   - A write already in flight when Discard runs cannot be cancelled. If it commits, the field shows the committed bytes like any other commit, with no draft and no success claim.
   - A late completion after Discard, Reload or unmount never revives discarded state or clears newer work.
   - Source repair never acknowledges failed actual work.

**Stable selectors** (fixed now so that oracles can be frozen):
- the existing control selectors and accessible names of §2;
- the recovery region `[data-testid="clock-recovery"]`. It is rendered only while at least one block or the export error (§8) is shown, inside `.w-clock-body` after `.clock-sub`, and carries `data-no-drag`. In the clean state it renders no node;
- each recovery block `[data-clock-recovery="style"]` or `[data-clock-recovery="timezone"]`;
- Export `[data-testid="clock-export-draft"]`, inside the region, rendered while at least one field has a settled unsuccessful draft;
- the widget prop `registerDepartureGuard` on `ClockWidget` (`{ lang, now, registerDepartureGuard? }`);
- the additive optional field `registerDepartureGuard` on `WidgetRenderContext` in both declarations (`types.ts:45–55` and `registrations.tsx:24–28`), with the type of `DashboardHeaderDepartureGuardRegistration`.

**Normative wording.** It is fixed here so that oracles can be frozen beforehand. All new copy lives in a Clock-local copy module, not in tokens `i18n.ts`.

| Element | EN / ZH wording |
| --- | --- |
| Field labels | `Clock style`/`时钟样式`, `Clock timezone`/`时钟时区` |
| Per-field actions (visible label and accessible name) | `Retry <Label>`/`重试 <Label>`, `Discard <Label>`/`放弃 <Label>`, `Reload <Label>`/`重新读取 <Label>` |
| Export (visible label and accessible name) | `Export Clock draft`/`导出时钟草稿` |
| Field messages | `<Label> was not saved.`/`<Label>未保存。`; `Saved <Label> is unavailable. Reload it; this is not a new unsaved change.`/`已保存的<Label>不可用。请重新读取；这不是新的未保存更改。` |
| Export error | `Export failed. Please retry.`/`导出失败，请重试。` |
| Departure participant label (coordinator dialog) | `Clock`/`时钟` |
| Combined participant label (two or more participants blocking) | `Dashboard`/`工作台` |

The coordinator then shows its existing templates. For the Clock these are "Clock has unsaved changes." / "时钟有未保存的更改。" and the aria-label "Unsaved Clock draft" / "未保存的时钟草稿". For the combined case: "Dashboard has unsaved changes." / "工作台有未保存的更改。" (`departureCoordinator.tsx:290–291`). All wording appears in the language currently displayed. The Clock adds no `window.confirm` text: its sign-out participation is the coordinator dialog.

## 6. Dashboard departure participation (A2)

1. **Aggregator lifetime.**
   - When `DashboardModule` receives the coordinator's `registerDepartureGuard`, it creates exactly one aggregator for its mount. A new internal module holds the logic.
   - Without that prop (standalone use) there is no aggregator: the Header and widgets receive `undefined`, as the Header does today.
   - On unmount the aggregator is disposed. It unregisters its upstream registration, and every later call on it is inert.
   - The product renders under `<StrictMode>` (`apps/web/src/main.tsx:15–19`). A development effect re-run (mount, cleanup, mount) must leave a working aggregator and Clock participant, never a disposed one that ignores registrations.
2. **Participant registration function.**
   - It has the existing type `(guard) => () => void` and is **referentially stable** for the mount, so the Header's effect (whose dependencies include it, `DashHeader.tsx:798`) does not re-run because of it.
   - It is passed to `DashHeader` in place of the coordinator's function, and to `DashboardGrid`.
3. **Widget delivery.**
   - `DashboardGrid` accepts an optional `registerDepartureGuard` prop and includes it in the context of every WidgetShell render (`DashboardGrid.tsx:121, 159`).
   - The `WidgetGhost` render receives the same context **without** that field (`:164–166`).
   - The Clock registration passes `ctx.registerDepartureGuard` to `ClockWidget` (`registrations.tsx:56`).
   - No other widget reads the field.
4. **Participant set.**
   - Participants are keyed by `guard.token`. A registration with an existing token replaces the stored guard object.
   - An unregister removes the entry only if the stored object is the one it registered.
   - Each token keeps a first-seen position for the mount, kept across unregister and register cycles. That position is the participant order below.
5. **Upstream forwarding.** Every participant register or unregister call synchronously does the following, so that the coordinator sees the change in the same effect phase, as with today's direct Header registration:
   - (a) calls the unregister of the aggregator's live upstream registration, if any;
   - (b) if at least one participant is registered, registers a **new combined guard object** that carries the aggregator's one stable token.

   With zero participants nothing is registered upstream.
6. **Combined guard.** Every member is evaluated against the live participant set when it is called or read:
   - `token`: the aggregator's stable token.
   - `isCurrent()`: the aggregator is not disposed, at least one participant is registered, and **every** registered participant's `isCurrent()` is `true`.
   - `isBlocking()`: at least one registered participant has `isCurrent() && isBlocking()`.
   - `label` (read live):
     - exactly one participant current and blocking → that participant's label;
     - two or more → `Dashboard`/`工作台` in `DashboardModule`'s `lang`;
     - none → the label of the first participant (participant order) that is current;
     - otherwise `undefined`.
   - `exportDraft()`: calls `exportDraft()` exactly once on each participant that is current and blocking at call time, in participant order. A throw from one is caught and does not stop the others.
   - `discardDraft()`: the same with `discardDraft()`.

   **Single-participant equivalence (gate 3).** Whenever the Header is the only participant, or the Clock is registered but not blocking and current, all of the following equal `f9eb4b1`:
   - every coordinator decision (block, reset, proceed, stay, auto-release);
   - the dialog label and text;
   - the export file;
   - the discard effect;
   - the number of `proceed()`/`reset()` calls;
   - history and location outcomes;
   - sign-out results, including the zero-confirm rail and Appearance steps that precede the coordinator.

   The oracle is the Header's accepted suites (E17), plus Sol `departure` D1 and host row l.
7. **The Clock participant.**
   - It registers on mount whenever `registerDepartureGuard` is provided, and stays registered while mounted.
   - It re-registers (unregister, then register, same token) whenever its blocking state or its label language changes. It may re-register on other draft changes, but never because of a `now` tick alone.
   - It unregisters on disposal and unmount.
   - Its guard:

     | Member | Value |
     | --- | --- |
     | `token` | Stable per controller |
     | `label` | `Clock`/`时钟` in the widget's current language |
     | `isCurrent()` | The controller is not disposed |
     | `isBlocking()` | Not disposed, and at least one **actual current draft** exists: pending, settled unsuccessful, conflict or uncertain. Never a source-only issue |
     | `exportDraft()` | The §8 memory export of the Clock drafts |
     | `discardDraft()` | Discards every Clock draft as per-field Discard does (§5 item 8), with zero writes |
8. **Auto-release.** A held route intent or sign-out caused only by Clock drafts is released **exactly once** when the last Clock draft clears (verified success or Discard). The release goes through the coordinator's existing re-evaluation (`departureCoordinator.tsx:214–222`): one live `proceed()`, zero non-live blocker calls, no `Invalid blocker state transition`. When the Header still blocks, the hold continues. "Exactly once" follows the accepted release-once reading (§12 rule 16).
9. **No coordinator, router, registration-site, App or shell change.** `departureCoordinator.tsx`, `settingsDeparture.ts`, `dashboardRegistration.tsx`, `shellRegistrations.tsx`, `App.tsx` and every `xai-web-shell` file stay byte-unchanged.

## 7. Device continuity, lifetime and protection

1. **No account machinery.**
   - Both keys stay unscoped device keys.
   - For these fields the controller never reads, writes or acquires any account physical key (`xai:account:v1:*`, `xai:demo:v1:*`), account lifecycle lock, generation marker, tombstone or recovery admission. Prove this with spies on lock names and keys that follow the F-B002 rule (§12).
   - An unrelated held account lifecycle lock must not delay a Clock choice.
   - Neither may a held `prefMutationLockName("xai_rail_order")` lock or a held Appearance per-key lock: each key has its own lock name (`prefMutation.ts:153`). This is a positive control, and it passes at `f9eb4b1` too (host row c).
2. **Lifetime.**
   - **Inside one widget mount** drafts and operations survive: re-renders; the one-second tick; opening and closing the popover; reorders (the shell is keyed by id, `DashboardGrid.tsx:142`); resizes; widget appearance changes; drags (the source shell stays mounted); and a held per-key lock.
   - **Sol layer.** The widget is mounted under a real `accountScope` without the gate. Drafts and held operations survive A→B, A→locked, locked→A and same-account epoch changes. Device bindings are not refused on a scope change (`usePrefAsync.ts:230`).
   - **Production App.** A scope change remounts the App subtree (`AccountDataGate`), and in-memory drafts are lost. After the remount the widget shows the committed bytes, with no success claim and no runtime error. This is the retained REL-09 limitation, documented by host row o.
3. **Route departure.** While the Clock participant blocks, the coordinator holds each of these with its dialog (Stay, Export current draft, Discard local changes and leave), per §6:
   - an AppRail **click** on a module button, selected by its accessible name (never a rail drag);
   - Back, Forward and numeric POP;
   - programmatic navigation, including widget `goTo` and the Topbar Settings link (`Shell.tsx:42–45`);
   - sign-out, once the rail and Appearance steps have resolved `true` (item 5).

   Export and Stay never clear drafts or release navigation.
4. **Unload.**
   - The controller registers a `beforeunload` listener only while at least one actual draft exists, pending or settled.
   - It warns synchronously, with zero storage attempts in the handler.
   - It is removed when the drafts clear and on unmount.
   - There is no warning in a clean or source-only state. This is a cancelable warning, not crash durability.
   - The rail and Appearance controllers keep their own listeners, which exist only while they have drafts. Every Clock unload assertion therefore runs with no rail or Appearance draft, and so is attributable to the Clock alone.
5. **Voluntary sign-out on the Dashboard** uses App's existing `f9eb4b1` sequence, unchanged (§3 item 9): the rail step, then the Appearance step, then `requestSettingsDeparture("sign-out")`. The last reaches the Dashboard coordinator and the combined guard.
   - **No rail and no Appearance draft (host row g, Sol D5, F1 c4).** The rail step and the Appearance step each make **zero** `window.confirm` calls and resolve `true`. The coordinator dialog then appears for the Clock.
     - **Stay** resolves `false`: drafts are kept, there are zero history mutations and identity is intact.
     - **Discard** discards the Clock drafts with zero writes; the request resolves `true`, and the sequence continues to identity invalidation.
   - **A rail draft and a Clock draft (host row q, F1 c5).** The rail confirm, with the `railOrderCopy.ts` text, comes first.
     - **Cancel there** resolves `false`. The Appearance step and the coordinator are never asked: zero Appearance confirms and no coordinator dialog. The Clock participant is not touched: zero calls to its `exportDraft`/`discardDraft`, its drafts, blocks, unload listener and participant registration unchanged, zero storage attempts on either Clock key. The rail draft and its status are kept. There are zero history mutations, and identity is intact.
     - **OK there** discards the rail draft with zero writes (the accepted rail behaviour). The Appearance step makes zero confirms. Then the coordinator dialog appears for the Clock, and Stay and Discard behave as above.
     - *Disclosed:* OK at the rail prompt followed by Stay in the coordinator dialog resolves `false` with the rail draft already discarded. This is the same class as AppRail's OK-then-Cancel disclosure (AppRail acceptance §9 item 4). It is a property of the protected App sequence, not of this caller.
   - Off the Dashboard the Clock is not mounted and holds nothing.
6. **Widget removal** (A7).
   - Unmounting the Clock disposes its controller. Every Clock draft is discarded with zero set or remove attempts by the controller; the participant unregisters; the unload listener is removed; late completions are ignored.
   - A write already in flight may still commit the latest choice (§5 item 8).
   - If removal fails (the order write fails, so the widget stays), nothing about the Clock changes.
7. **The drag ghost** (A3). Over the whole widget drag, the ghost instance makes zero storage attempts, registers no participant and no unload listener, and displays the committed bytes. The source widget keeps its drafts, blocks and participant.
8. **Forced transitions** — a scope change from another document, an auth loss, the account-deletion bridge — are never blocked by the Clock.
9. **Unmount** removes the listener, subscriptions and the participant. Old callbacks refuse, based on live disposal state. Committed writes are not undone.

## 8. Sparse memory export

**Format.** The filename is `clock-draft.json`. It uses the set envelope of the accepted Appearance export. There are no reset entries, because this caller has no reset:

```json
{"version":1,"kind":"clock-draft","changes":{"device":{"style":{"operation":"set","value":"analog"},"timezone":{"operation":"set","value":"shanghai"}}}}
```

- Field ids: `style`, `timezone`, in that order when both are present.
- Each field appears at most once, as its latest actual current draft, pending or settled: `{"operation":"set","value":<strictly validated value>}`.
- Never include an account bucket, account ID, physical key or timestamp.
- Never include saved, default or source-only fields.
- This is a recovery file. It is not an import feature and not proof of saving.

**Two entry points.**
- **Inline Export** (`clock-export-draft`) renders while at least one field has a settled unsuccessful draft (§5 item 7), and never for a source-only issue alone. It exports every current Clock draft, including a pending sibling.
- **The coordinator dialog's Export** reaches the Clock participant's `exportDraft()` whenever the Clock blocks, including when only pending drafts exist (§6 items 6–7).
- **Failure display.** An export failure from either entry point shows the export error in the recovery region, which renders for that purpose while a draft exists. The error clears at the next Clock action or when the drafts clear.

**Behaviour.**
- **Memory only.** Export reads captured drafts and makes zero `getItem`, `setItem` or `removeItem` attempts on any key. This holds while every Storage operation throws and while operations are held.
- **Liveness rechecks.** Recheck that the controller is live and not disposed before setup, after Blob creation, after URL creation and after append, immediately before the click. Unmount during setup cancels the click.
- **Failure handling.** A Blob, URL, append or click error shows the localized export error and keeps drafts, tokens, the departure participant and the unload warning. The anchor is removed and the URL revoked on a best-effort basis, including after a late setup failure.
- **No side effects.** Export never saves, discards or retries.

**Native disk evidence.** Use actual Chrome downloads, parsed from disk and compared to the whole expected envelope with deep equality. Required shapes:
1. a style draft left by a quota failure (inline Export);
2. a timezone city draft (inline Export);
3. a timezone `local` draft over a city baseline (inline Export);
4. both fields (inline Export);
5. a pending draft held behind a real `prefMutationLockName("xai_clock_style")` lock, exported through the coordinator dialog after an AppRail click;
6. the combined case through the coordinator dialog: a failed Header note save and a failed Clock choice, one activation, two files. `dashboard-note-draft.json` must equal the Header's accepted format, and `clock-draft.json` this envelope. Each is downloaded exactly once; their order is not specified;
7. a style draft exported after a widget drag reorder of the Clock (a trusted CDP pointer drag).

Every export runs under total storage denial, and each must show:
- attempt-level counters, recorded before delegating to Storage, at zero for reads, writes and removes;
- per file, exactly one object URL created and that same URL revoked;
- the anchor removed;
- afterwards, the unload warning still active, and the recovery region and the departure hold unchanged.

**When total denial is armed.** It is armed only after the App has mounted and the draft has been established. The rail status and the Appearance status must be absent before arming and stay absent through the export. A rail source status appearing under denial would mean the rail binding reread during the export window; that is a finding to freeze and explain, never a Clock pass.

Additionally, one native setup failure (`createObjectURL` or the click throwing) must meet the same assertions and show the localized error. Unmount during Blob, URL or append time may remain Sol evidence (jsdom with real storage, hook and engine).

The browser may ask permission for the second file of shape 6. Native runs grant downloads up front. This is a disclosed limitation (§16).

## 9. Actual host, keyboard and responsive presentation

**Composition.**
- Every host, native and visual row runs in the production `App` composition at the revision under test. That composition is: the `apps/web/src/main.tsx` module order and the production router; `AccountStorageGate` and `AccountDataGate`; the Shell with `RailOrderProvider` and the rail status slot; the App-scoped Appearance and rail-order controllers; DesktopPet; CmdK; the Dashboard registration with the coordinator and `settingsDeparture`; and the real Dashboard and widget packages, hooks, engine, registry and codecs.
- **The only synthetic input is the auth session.** Bundle provenance must show that every module comes from the archive under test, including the five rail-order shell modules. Patterns: `../web-apprail-order-recovery-native/native-fixed-app.tsx` and `native-fixed-prelude.js` (the `f9eb4b1` composition), `../web-appearance-recovery-native/native-fixed-app.tsx`, and `../web-dashboard-header-departure-native/native.tsx`.
- The coordinator auth branch is reachable only through a synthetic coordinator. This was accepted for Appearance and AppRail (AppRail acceptance §6 item 6), and the App code path under test is the production one.

**Host matrix** (rows a–q; jsdom in E3/E8 and native in E11). Every row records the `window.confirm` recorder and the Topbar status census (§12 rules 11 and 12).

| | Scenario | Required behavior |
| --- | --- | --- |
| a | Success | Each of the 17 values through the UI gives exact bytes and no recovery region. After reopening CmdK, `readModuleStates()` returns those bytes, and a query matching the style finds the Clock |
| b | Failure and Retry | A quota failure on each key keeps the choice displayed, and the block appears with Retry and Discard. A successful Retry makes exactly one write and removes the block; the bytes are exact |
| c | Held write | <ul><li>While the write is held behind the real `prefMutationLockName(<key>)` lock: no block, and the controls stay enabled.</li><li>An AppRail click is held, with the dialog label "Clock"/"时钟".</li><li>On release: exactly one write, and the intent is released exactly once, to the AppRail target.</li><li>In a separate run, while `prefMutationLockName("xai_rail_order")` and `prefMutationLockName("xai_pref_theme")` are held, a Clock choice still completes with exactly one write. This is a positive control at `f9eb4b1` too.</li></ul> |
| d | Failure, then an AppRail click | Held. Stay: no navigation, zero history mutations. Discard local changes and leave: zero set or remove attempts on both keys, exactly one navigation |
| e | Failure, then Back and Forward | Held (POP). A successful Retry releases exactly once. `{pathname,key,state}` is deep-equal to an ordinary navigation, with zero runtime errors |
| f | Failure, then a widget `goTo` | The Mini Calendar's open action is held. Stay keeps the Dashboard; Discard navigates once |
| g | Sign-out from the Dashboard with a Clock draft and no rail or Appearance draft, in both auth branches | <ul><li>The recorder records **zero** `window.confirm` calls, from the rail step and from the Appearance step alike, before the coordinator dialog appears. Neither status is in the Topbar.</li><li>The coordinator dialog appears, labelled "Clock"/"时钟". Stay resolves `false`, with identity intact and zero history mutations.</li><li>A second attempt with Discard proceeds, makes zero writes on both Clock keys and invalidates identity. The recorder is still empty.</li></ul> |
| h | `beforeunload` | Warns only while a Clock draft exists, pending or settled. Zero storage attempts in the handler. No warning in clean or source-only states. There is no rail or Appearance draft in this row |
| i | Cross-document | An idle Clock in document A updates live when document B commits each field. A drafted field in A becomes a preserved conflict, and Retry never overwrites |
| j | Malformed bytes at load | For every §5 item 2 value, and for a `getItem` that throws for that Clock key only: no route error, the default displayed, the source block with Reload only, no hold, no unload warning, zero writes, and no rail or Appearance status. After document B repairs the bytes, Reload shows the repaired value |
| k | Combined Header and Clock | Two runs, each starting from a failed Header note save and a failed Clock choice, with an AppRail click held under the label "Dashboard"/"工作台". <ul><li>**k1:** dialog Export calls each participant's export exactly once (two files). Dialog Discard then discards both drafts, with zero writes on either Clock key, and navigates exactly once.</li><li>**k2:** a Clock Retry success keeps the hold, and the label becomes "Dashboard header"/"工作台备注". A Header Retry success then releases it exactly once.</li></ul> |
| l | Header-only equivalence | A failed Header note save only: the label is "Dashboard header"/"工作台备注"; dialog Export downloads one file; dialog Discard proceeds once; in a separate run a successful Header Retry auto-releases once. Each outcome is identical to the same run at `f9eb4b1` |
| m | Widget removal with a failed Clock draft | After a successful removal: zero set or remove attempts on both keys by the Clock, no Clock participant, the unload warning removed (no other drafts), and the next AppRail click is not held |
| n | Widget drag with a failed Clock draft | Over a trusted pointer drag of the Clock widget, the ghost makes zero storage attempts and adds no participant registration. After the drop the block is still shown and departure is still held |
| o | Forced scope change | Driven through the identity channel from a second document (`AccountStorageGate.tsx:8, 39`): App remounts, committed values are displayed, no success claim, zero runtime errors |
| p | Ticks | Over at least three `now` ticks with no edits: zero participant re-registrations and zero storage attempts. With a draft present: zero additional re-registrations across the ticks |
| q | **(new in r2)** Sign-out from the Dashboard with a rail draft and a Clock draft, in both auth branches | <ul><li>**Setup.** A rail draft is created by one rail drag whose drop write fails (quota scoped to `xai_rail_order`); the rail status (failed) is present and closed. Then a Clock choice fails (quota scoped to that Clock key). No Appearance draft exists.</li><li>**Attempt 1, Cancel at the rail prompt.** The recorder holds exactly one confirm, with the rail text. Zero Appearance confirms, and no coordinator dialog. The Clock participant's `exportDraft` and `discardDraft` are not called. The Clock block, drafts, unload listener and registration are unchanged, with zero storage attempts on either Clock key. The rail draft and status are kept. Zero history mutations, and identity is intact.</li><li>**Attempt 2, OK at the rail prompt.** The rail draft is discarded with zero writes and its status unmounts. Zero Appearance confirms. The coordinator dialog appears, labelled "Clock"/"时钟". Stay resolves `false`, and identity is intact.</li><li>**Attempt 3.** No rail draft now exists, so there are zero confirms. Dialog Discard discards the Clock drafts with zero writes, and identity is invalidated once.</li></ul> |

**Responsive presentation.** EN and ZH, at 375, 414, 768 (including 768×1024), 1024 and 1440.

States to check:
- clean;
- style failed;
- timezone failed;
- both failed, with Export;
- source-only for each key;
- both failed with the coordinator dialog open in the combined Header case (375 and 1440 only).

For each control, after scrolling it into view:
- a centre hit-test lands on the control;
- it is not covered;
- recovery controls are contained in the Clock's `.widget-shell` and the viewport, and do not overlap the clock face, the toolbar or `.clock-sub`;
- neither the document nor the Dashboard scrolls horizontally.

**DesktopPet and other App-level overlays (R-PET rule, A9).**
- **Gated run.** All checks above run with the pet hidden through the product's own rail pet toggle (a trusted, hit-tested click), as in the accepted Sticky, Features, Appearance and AppRail compositions. The toggle is hidden below 768 px (§3 item 15). For 375 and 414 the runner therefore hides the pet at a width of 768 px or more and then resizes the page without a reload; it asserts that the pet stays hidden after the resize. A reload re-shows the pet (`App.tsx:121`), so the procedure is repeated after any reload.
- **Pet-on run.** Every width and language is repeated with the pet at its default position (`resolveDefaultPetPos`) and the default Dashboard order (`registry.ts:124–136`), and the occlusion of each control is recorded.
  - **Blocking:** a control this caller adds — Retry, Discard, Reload and Export — must have an uncovered centre.
  - **Recorded, not blocking:** coverage of the unchanged Clock controls is appended under UX-03/SHELL-05 with before and after evidence.
  - A caller may not move a functional control into the default pet band. Mitigations are layout inside `.w-clock-body` only.
  - The pet is neither hovered nor focused during probes, and it is never moved, hidden by code, restyled or repositioned by this caller.
- **Topbar statuses (r2).**
  - The Appearance status (`[data-testid="appearance-status"]`) and the rail-order status (`.rail-order-status`, `[data-testid="rail-order-status"]`) must both be **absent** in every row, state and capture that does not seed them. No Appearance or rail failure is seeded, `xai_rail_order` is absent or in-domain, and no fault reaches either key.
  - If either appears, that is a **precondition failure**, never a product result. The run stops for that case.
  - **Why absence is required:**
    - this caller needs neither status;
    - they are App-level controls that change the Topbar's width and Tab order (at 375 px both together wrap the search placeholder, a recorded UX-05 observation);
    - the rail panel is the F-E14-1 overlay;
    - with both absent, the Topbar and rail markup equal the accepted clean chrome, which is what bounds the reruns (A1).
  - The only exception is host row q and F1 case c5. They seed a rail draft on purpose, and there the rail status is expected present and closed and the Appearance status absent. The rail panel is never opened in this caller's runs.
- **Other overlays.**
  - The coordinator dialog is a host overlay fixed to the viewport, judged by its own box and the viewport (Sticky acceptance ruling). It is modal and traps focus (§3 item 7), so it cannot leave focus on an obstructed control.
  - CmdK is closed in every run.
  - The Clock's own timezone popover is judged only when it is the subject of a check. Its viewport containment is recorded (pre-existing), not gated.

**Sizing and CSS.**
- New targets (Retry, Discard, Reload, Export) are at least 44×44 at every width, in EN and ZH. The 44×44 rule does not apply to the unchanged style buttons, trigger and popover items; their sizes are recorded (Appearance acceptance ruling 11; selection memo N7).
- New CSS adds selectors only under `.clock-recovery*`, appended to `packages/xai-web-dashboard-widgets/src/styles.css`.
- A focus-visibility repair, if E4 or E14 requires one, may also add `:focus-visible` rules whose selectors start with `.w-clock-body` and target only Clock markup. A repair that cannot be expressed that way is a shared defect (§11).
- Existing rules stay byte-unchanged: the fixed file begins with the before file.
- `plugin-web-tokens` CSS (`layout.css`, `tokens.css`), the grid's `styles.css` and the shell's `railOrderStatus.css` are not edited.
- The selector audit proves that every appended class is used only by Clock markup, with a positive control (the Appearance D37 pattern). It also proves that no appended selector matches `.rail-order-status*`, `.appearance-status*` or `.topbar*`.
- Existing control geometry may not shrink. The clean-state invariance of §10 item 6 must hold.

**Focus visibility (F-APP-1, F-APP-2).** This is gated for every Clock focus stop, because the Clock controls are this caller's controls.
- **Stops:** the timezone trigger; each style button, selected and unselected (4 × 2); each popover item, active and inactive (13 × 2); and each new recovery control.
- **Method: the frozen `pixelFocusWalk` oracle.**
  - The per-stop comparison is the frozen block from `../web-appearance-recovery-native/verify-visual-keyboard-5bbf473.mjs` (file `5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4`). The block runs from the line `/** A minimal PNG decoder (8-bit …` through the closing brace of `pixelFocusWalk`. It is spliced byte for byte, as in the accepted AppRail E14 runner (`../web-apprail-order-recovery-native/review-keyboard-f9eb4b1.md` §3).
  - Every run re-derives two hashes and asserts them as preconditions: the block, `e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43`, and `async function pixelFocusWalk(…)` alone, `1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620`.
  - For each stop, the oracle compares the pixels of the stop's own box plus its ring area, focused against unfocused. The walks cover the light and dark themes, EN and ZH, at 375, 768 and 1440. A selection treatment (`[aria-selected="true"]`, `.popover-item.active`) or any `outline: none` in the cascade must not mask the ring.
- **Results.** The computed `outline-style` at `:focus-visible` and the pixel delta are recorded per stop. A stop with no own-region change is a FAIL.
- **Walk states.**
  - (1) clean, with the popover closed;
  - (2) clean, with the popover open (trigger, style buttons and popover items);
  - (3) both fields failed, with the popover closed (all stops, including the recovery controls and Export);
  - (4) source-only for each key, with the popover closed.

  Recovery controls are judged gated in states 3 and 4 only.
- Repairs follow the CSS rule above.

**Obstruction of the F-E14-1 type (stated as r2 requires).**
- **The Clock adds no overlay.** Its recovery region, blocks, export error and Export are in normal flow inside `.w-clock-body`, after `.clock-sub` (§5 selectors). So no new Clock control can cover a later focus stop of any module.
- **The unchanged timezone popover can.** It is non-modal, absolutely positioned under the toolbar and up to 240–320 px tall. It does not close when keyboard focus leaves it (§3 item 11). In DOM order the recovery region follows the toolbar. So with the popover open and a recovery block shown, Tab from the last popover item lands on recovery controls that the popover may cover. That is the same class as F-E14-1 (a non-modal overlay covering later focus stops), now over controls this caller adds.
- **The rule for r2:**
  - The gated focus walk judges recovery controls with the popover closed (states 3–4).
  - A separate **open-popover Tab-out probe** records, for each recovery control reached by Tab while the popover is open, at 375, 768 and 1440 in EN and ZH: the intersection of its box with `.clk-tz-popover`; whether its centre is covered; and the `pixelFocusWalk` own-region delta. The probe is recorded under UX-05, not gated, because changing the popover's keyboard behaviour is excluded (§16).
  - Focus must still never land on `<body>`, and the probe must show that one Escape-free outside click (on the scrim) closes the popover and uncovers the control.
  - The controller may instead authorize closing the popover when focus leaves it, which needs r3 (question 2 of §17).
- **Other overlays.** The coordinator dialog is modal (no such risk). The AppRail panel (F-E14-1 itself) is never open in this caller's runs. The pet follows R-PET.

**Keyboard (K-1).**
- New native runners use the DevTools **pipe** transport (`--remote-debugging-pipe`) and never send `nativeVirtualKeyCode`. Each keeps a key-audit precondition: at every document change and at the end, each document's capture-phase key trace equals the runner's own presses, in order and trusted (the AppRail E14 pattern).
- Trusted Tab reaches every control in DOM order with visible focus: the trigger, the four style buttons, the popover items while open, then the recovery region (the style block's actions, the timezone block's actions, then Export).
- Enter and Space each activate a control exactly once: one operation, no double firing, no page scroll on Space.
- **Focus targets:**
  - after a keyboard Discard or Reload, focus lands on the field's current control: the selected style button, or `.clk-tz-btn`;
  - a block that unmounts after a successful Retry returns focus to the same place;
  - after Export, focus stays on Export;
  - any other control of this caller that unmounts while focused (for example Export, when the last settled draft clears) moves focus to `.clk-tz-btn`;
  - focus never lands on `<body>` after any action of this caller.
- The popover's existing keyboard behaviour is unchanged and recorded, not gated: no Escape, and focus after a keyboard choice (§3 item 11).

**Screenshots,** all reviewed manually:
- both-failed at five widths in EN and ZH (10);
- source-only at 375 (EN and ZH);
- the combined dialog at 375 and 1440 (EN and ZH);
- the clean state at 1440 (EN);
- the pet-on 768×1024 capture with both fields failed (EN and ZH);
- a focused selected style button and a focused active popover item, in light and dark;
- one open-popover Tab-out probe frame at 375 (EN and ZH);
- host row q at the rail prompt and at the coordinator dialog (1440 EN).

## 10. Downstream consistency, crash safety and cross-module isolation

**Nothing changes in:**
- keys, defaults, registry codecs, ownership or lifecycle;
- dual writes, aliases or migrations;
- the CmdK readers;
- `DashHeader.tsx`, the coordinator, `settingsDeparture.ts`, the app registrations and `App.tsx`;
- the shell, including the rail-order controller, the rail status and their sign-out step;
- the grid's order, layout and appearance persistence.

Readers reflect **committed bytes**; the widget reflects its display values.

Required evidence:
1. **Exact bytes** for all 17 values at the Sol layer and natively.
2. **Byte compatibility.** Every value written by the fixed product is read back identically by the unchanged CmdK reader in a new document. A value written by `f9eb4b1` is displayed identically by the fixed product.
3. **Display truth.** The face, `aria-selected`, the active item, the trigger label, `.clock-sub` and the displayed time all reflect the display value. After Discard or Reload they reflect the committed bytes.
4. **Crash safety.** Every §5 item 2 value at load leaves the Dashboard and the App rendering, with defaults and zero writes. A malformed value written by a second document while the Dashboard is open leaves an idle field in its source state without a throw.
5. **Cross-document.** Both fields propagate live to an idle second document. A drafted field becomes a preserved conflict.
6. **Clean-state Dashboard invariance.**
   - With no Clock draft or source issue and the same seeded in-domain bytes, the `.module-dashboard` `outerHTML` is identical between `f9eb4b1` and the fixed product.
   - Run in EN and ZH, at 375 and 1440, with the popover closed and open, and with the page clock frozen to one instant for both captures.
   - This proves that the Header's and the grid's accepted native visual evidence stays valid without rerunning it.
   - The `.app-rail` and `.topbar` `outerHTML` are also compared, and must be identical. This is the bound that keeps the AppRail and Appearance visual and keyboard evidence valid.
7. **Cross-module isolation.**
   - During and after every Clock operation — choice, Retry, Discard, Reload, export, dialog Stay, Export and Discard, removal, widget drag — **the Clock's code** (its controller, recovery region, export and participant, and the aggregator) dispatches zero `StorageEvent`s and zero event-bus events. Count these with an instrumented `window.dispatchEvent` and a bus spy, attributed by stack or by a run with the Clock operation alone.
   - Events that the unchanged shell and Dashboard registration emit as a consequence of a navigation are recorded. Examples are `web:shell:module-change` from an AppRail click (`Shell.tsx:38`) and from a widget `goTo` (`dashboardRegistration.tsx:30`). They must equal, in kind, payload and order, the same run at `f9eb4b1`.
   - The bytes of every other localStorage key are unchanged (snapshot). That includes the Header note and position, `xai_dash_order`, the widget layout and appearance maps, `xai_zones`, the pet keys, the seven Appearance keys and `xai_rail_order`.
8. **Protected paths unchanged.** `git diff f9eb4b1 <fixed>` is empty for:
   - every `apps/` path;
   - `packages/plugin-web-storage`, `packages/plugin-web-tokens`, `packages/plugin-web-settings-shell`, `packages/core`, `packages/xai-web-event-bus`, `packages/xai-web-shell`, `packages/xai-web-pet`, `packages/xai-web-cmdk`, `packages/xai-web-settings-appearance`, `packages/xai-web-settings-features-panel` and `packages/plugin-web-settings-rest`, and every other package outside the two dashboard packages;
   - every `packages/xai-web-dashboard-grid` and `packages/xai-web-dashboard-widgets` path not listed in §11;
   - `package.json` and `pnpm-lock.yaml`.
9. **Search repeated at the fixed SHA.** Repeat §2's writer and reader search; new hits may appear only in §11 files. In addition:
   - `ClockWidget.tsx` and the new Clock modules contain zero `usePref(`, `setPref(`, `removePref(`, `localStorage`, `sessionStorage`, `new StorageEvent`, `dispatchEvent(` and `emitWebEvent(`;
   - the aggregator module contains zero storage access and zero `emitWebEvent(`;
   - `DashHeader.tsx` is byte-identical.
10. **Unchanged tests pass from the fixed archive and from `f9eb4b1`** (the G1 lesson):
    - every `xai-web-dashboard-grid` test file;
    - every `xai-web-dashboard-widgets` test file marked "unchanged" in §11;
    - the CmdK tests;
    - the `apps/web` tests `departureCoordinator.blocker`, the router tests, `App.signout`, `App.appearance` and `App.railorder`.
11. **Storage and lifecycle.** Storage check-types passes, and `lifecycleForKey` still classifies both keys as device-preference, device-recovery, retain and retain-on-device.
12. **Inventory prediction** (for the next Luna refresh; a prediction, not a target). Both `ClockWidget.tsx` rows disappear, which gives:
    - 21 files, 45 direct bindings, 24 literal keys and 1 dynamic site;
    - 28 setter bindings (25 direct, 3 downstream-only) and 17 read-only bindings;
    - `xai-web-dashboard-widgets` goes from 11 bindings to 9.

## 11. Protected surface and Terra's files

**Terra may edit only:**
- **`packages/xai-web-dashboard-widgets/`:**
  - `src/widgets/ClockWidget.tsx`;
  - `src/registrations.tsx`: the structural `WidgetRenderContext` copy gains the optional field, and the Clock registration passes it. Nothing else;
  - at most three new local modules under `src/internal/`:
    - the Clock controller: bindings, the operation and recovery model, export, unload and the participant;
    - the EN/ZH Clock recovery copy;
    - the recovery region component;
  - selectors appended to `src/styles.css`, scoped as §9 requires;
  - test files under `src/__tests__/`, per the dispositions below, plus new Clock-local test files, including a local Web Lock fixture (pattern: `packages/xai-web-settings-appearance/src/__tests__/appearanceLockFixture.ts`);
  - the Clock sections of `docs/api.md` and `docs/test.md`. They must describe the bindings, the domains, the recovery model, the export, the participant, the ghost rule and the removal rule.
- **`packages/xai-web-dashboard-grid/`:**
  - `src/DashboardModule.tsx`: create the aggregator; pass its registration function to `DashHeader` and to `DashboardGrid`. Nothing else;
  - `src/DashboardGrid.tsx`: accept the optional `registerDepartureGuard` prop; include it in the shell context; omit it from the ghost context. Nothing else;
  - `src/types.ts`: the additive optional `registerDepartureGuard?: DashboardHeaderDepartureGuardRegistration` on `WidgetRenderContext`, with a doc comment. Nothing else;
  - one new internal module under `src/internal/` for the aggregator;
  - new test files under `src/__tests__/`; existing test files stay unchanged;
  - the `WidgetRenderContext` and departure sections of `docs/api.md`, and a `docs/test.md` entry for the new tests.
- **Terra's run record (E6), in a reserved directory: `docs/reviews/web-dashboard-clock-recovery-terra/`.**
  - Only Terra creates it, and nothing else may be written there.
  - It holds `implementation.md` (commands, exit codes, per-file counts, deviations and open questions) and the raw logs of Terra's own package runs: dashboard-widgets and dashboard-grid test, typecheck and lint.
  - Each log names the archive or checkout it ran on and refuses to overwrite.
  - The files may be committed with the product change or in the immediately following commit, and they are additions only.

The fixed-product diff (`git diff --name-only f9eb4b1 <fixed> -- apps packages package.json pnpm-lock.yaml`) must list only the product files above.

**Test dispositions.**

| Existing tests | Disposition |
| --- | --- |
| `ClockWidget.test.tsx` AC-CLOCK-1, -2, -5, -6, -7, -8, "invalid stored style falls back to classic", "clicking scrim closes popover" | Unchanged |
| `ClockWidget.test.tsx` AC-CLOCK-3 (style persists), AC-CLOCK-4 (timezone popover and persistence) | Install the local Web Lock fixture and await real completion. Same assertions on bytes, rendering and popover closing |
| `analogClockTicks.test.tsx`, `registrations.test.tsx`, `slotIntegration.test.tsx` and every other dashboard-widgets test | Unchanged |
| Every `xai-web-dashboard-grid` test, including `DashHeader*`, `DashboardModule*`, `DashboardSlotHost.composition` and `types.test-d.ts` | Unchanged |
| New tests (required) | <ul><li>Clock tests with the real engine and the lock fixture, covering §5 items 1–8 and the §8 export.</li><li>Participant semantics (§6 item 7).</li><li>Aggregator unit tests (§6 items 1–6): single-participant equivalence, combined members, participant order, identity-based unregister, a stable registration function, disposal, and that the ghost context has no field.</li></ul> They complement, and never replace, Sol's frozen oracles |

**Implementation expectations.**
- Use one coherent local operation model per Clock instance.
- Do not extract a generic recovery framework, and do not refactor an accepted caller.
- The aggregator is internal to the grid package and is not exported.
- The widget stays usable standalone (A3).

**Protected.**
- In `xai-web-dashboard-widgets`: every widget other than the Clock; `internal/*` except the new Clock modules (`cityLibrary.ts`, `Icon.tsx`, `TzClock.tsx`, the stores and the data reads); `index.ts`, `package.json`, `manifest.json`, configs, `docs/design.md` and `docs/dev_log.md`.
- In `xai-web-dashboard-grid`: `DashHeader.tsx`, `WidgetShell.tsx`, `WidgetGhost.tsx`, `EmptyState.tsx`, `AddWidgetPicker.tsx`, `DashboardSaveRecovery.tsx`, `registration.tsx`, `index.ts`, every existing `internal/*` file, `styles.css`, existing tests, `package.json`, configs, `docs/design.md` and `docs/dev_log.md`.
- All of `apps/`: the coordinator, `settingsDeparture.ts`, the registrations, the router and `App.tsx` with its rail and Appearance sign-out steps.
- The whole shell: `AppRail.tsx`, `Topbar.tsx`, `Shell.tsx`, `AvatarMenu.tsx`, the four rail-order modules and `railOrderStatus.css`.
- The shared storage hook, engine, registry, ownership, codec and lifecycle code, including legacy `usePref`.
- Tokens (CSS and `i18n.ts`), the pet, CmdK, the settings packages, core and the event bus.
- The accepted Date & Time, Notifications, More, Sticky, Smart Lists, Collaborate, Pomodoro, Header, Features, Appearance and AppRail callers.
- **Reviewer evidence:**
  - every frozen F1 runner, fixture, prelude and log, and the rail and Appearance F1-shape runners;
  - the K-1, OE and F-B002 files, the C-FD1 diagnostics and the C-RD1 copy;
  - the AppRail evidence, including `web-apprail-order-recovery-final/host-suites/`;
  - the ledgers and the control plane.

**Shared defects.** These include any defect in the engine or the coordinator that this caller exposes. A correct new shared defect requires all of the following before any product repair:
- a frozen before oracle;
- an Astra-role impact review;
- explicitly revised ownership;
- affected accepted-caller reruns (precedent: F1, `0ba68d7` → `f359be6` → `3ea0310`/`f3a3c82`).

## 12. Before-failure oracles (Sol and parent, before Terra)

**Runner requirements.**
1. Use an immutable `git archive f9eb4b1` behind a lockfile-hash gate.
2. Copy the oracle into the archive.
3. Record both the requested and the resolved SHA.
4. Refuse to overwrite an existing log.
5. Preserve nonzero exit codes.
6. Freeze the oracle files and their SHA-256s with the logs.
7. **Archive capacity.** Archive growth comes from `docs/reviews` evidence, not from the product: 148,408,320 bytes at `f9eb4b1` and 173,905,920 at docs head `61469c4`. Every runner written for this caller therefore streams `git archive` into the extractor (a spawned `git archive` piped to `tar`), or measures the archive size first and sets its buffer to at least twice that size. It records the archive byte count in its log. A fixed 100 or 200 MiB buffer is not allowed (AppRail acceptance §6 item 10).

**F-B002 rule (spies never re-enter storage).**
8. A Storage spy or attempt-counting injector records and then delegates exactly once.
9. Inside a spy, never call `accountScope.physicalKey`, `getPref`, `readRawPref`, any `localStorage`/`Storage` method other than the delegated one, or any product helper. Compute every physical key before installing the spy. Device keys are their logical keys; account keys named in isolation assertions are precomputed for the captured scope. Each oracle file asserts, in a self-check, that its spies make no nested Storage call.

**In-domain seeds (F-FD1).**
10. **Seed rule.**
    - Every seeded byte of either Clock key is inside the §2 domain, except in source-truth cases, which use exactly the §5 item 2 values. Positive controls use in-domain values only.
    - **Since `f9eb4b1`:** `xai_rail_order` stays absent in every case except row q and case c5, and is never malformed. The Appearance keys stay absent. Every fault (quota, a throwing read or write, denial) is scoped to the keys a case names, never global at load.
    - E1 includes a table of every seed and its class.

**Recorder and census rules (new in r2).**
11. **Topbar census.** Every host, native and F1 case asserts, as a precondition at its start and again before each business assertion, that `[data-testid="appearance-status"]` and `[data-testid="rail-order-status"]` are absent. The exceptions are row q and case c5, which assert that the rail status is present (failed kind) once the rail draft has failed, and that the Appearance status is absent. A violation is a precondition failure.
12. **`window.confirm` recorder.**
    - In jsdom, a stub records each message and the scripted answer. Natively, CDP `Page.javascriptDialogOpening` records the message, and `Page.handleJavaScriptDialog` answers.
    - Each record is classified by exact text as `rail` (`railOrderCopy.ts:56`/`:73`), `appearance` (`appearanceRecoveryCopy.ts:71`/`:98`) or `other`.
    - **Without a rail or Appearance draft** (rows g and q attempt 3, Sol D5, F1 c4), the recorder must hold zero records of every class when the coordinator dialog appears and when the sign-out resolves.
    - **In row q and case c5,** it must hold exactly the scripted `rail` records and zero `appearance` or `other` records.
    - A Sol case that runs without App has no rail or Appearance step and must record zero calls in total.
13. **AppRail as the departure action.**
    - Every row or oracle that leaves the Dashboard through AppRail selects `.app-rail .rail-items .rail-btn` by its accessible name (the nav label), never by index. It activates the button by a single click: `fireEvent.click` in jsdom, a trusted hit-tested CDP mouse click natively.
    - Its precondition asserts that the button exists, is not `.dragging`, and that no rail gesture is in progress (no `dragstart` was dispatched since mount).
    - This holds unchanged on both revisions (§3 item 15). A rail drag is never a departure action.
14. **Rail drags (row q and case c5 only).**
    - **jsdom:** the full sequence `dragStart` → `dragEnter` → `dragOver` (one or more) → `drop` → `dragEnd` on the real rail nodes (AppRail §12 event-sequence rule). Never a lone `dragEnter` expecting a preview change: that would be an oracle error of the OE class, per the D1 qualification (AppRail acceptance §6 item 4).
    - **Native:** trusted CDP input only, as in the accepted AppRail E9 runner: `Input.setInterceptDrags`, `Input.dragIntercepted`, `Input.dispatchDragEvent` and trusted mouse events. `isTrusted` is recorded for every drag event.
    - Widget drags (row n, export shape 7) are pointer drags through trusted `Input.dispatchMouseEvent`.
15. **Event attribution.** Per §10 item 7: Clock-attributed events must be zero, and navigation-caused shell and registration events must equal `f9eb4b1`.
16. **Release-once reading** (Appearance acceptance ruling 4; AppRail acceptance §6 item 2). "Released exactly once" means:
    - one live `proceed()` for a POP;
    - one `navigate` replay and one router commit for programmatic navigation, including an AppRail click;
    - for sign-out, one resolution of the coordinator's sign-out promise and one identity invalidation, with no router commit.

    Every case also requires zero non-live blocker calls and zero runtime errors.

**Cross-caller domain scan (F-FD1).** Before Terra, the parent lists every accepted oracle, runner, fixture and test that seeds or asserts `xai_clock_style` or `xai_clock_tz` (E3).
- **The r2 author's scan** covered `docs/reviews/` at docs head `61469c4`. It found the two keys only in the r1 contract, the selection memo, the binding inventories, the lifecycle and storage inventories, the feature inventory, the no-op audit and the dashboard PRD draft. None of these is an oracle, runner or fixture. No AppRail, Appearance or Features evidence names either key.
- **In product tests at `f9eb4b1`,** the keys appear only in the Clock's own tests, in storage `registry.test.ts` and `types.test-d.ts` (registry entries, unchanged), and in CmdK's adapter fixture `realisticState.ts:172–173` (`clockTz: "America/New_York"`). That fixture is adapter state, not storage, so it is unaffected.
- Any accepted oracle whose expectation depends on an out-of-domain seed gets a corrected copy, committed before E24 runs, under the C-FB002/C-FD1 precedent.

**Oracle–contract consistency matrix (OE-1, OE-2).** Sol's E1 receipt and the parent's E3 receipt must show, for each row, which oracle cases assert it, and that no two cases or contract clauses contradict each other.

| # | Rule pair that could be confused | How every oracle must assert it |
| --- | --- | --- |
| 1 | Inline Export (only while a field has a settled unsuccessful draft) vs the dialog Export (whenever the Clock blocks, including pending only) | Pending-only and source-only states expect no inline Export. Pending-only states expect a working dialog Export |
| 2 | Pending vs settled | Pending expects no block, but a departure hold and an unload warning. Settled expects the block |
| 3 | Source-only | Block with Reload. No hold, no unload warning, no export entry |
| 4 | Conflict vs ordinary failure | A conflict case seeds the external bytes *after* mount without a `StorageEvent` (an unobserved external change) and expects a preserved conflict. Every other case seeds *before* mount, or dispatches a `StorageEvent`, and never expects a conflict (OE-1) |
| 5 | Discard's zero writes vs a commit already in flight | Assert zero writes only for queued or held work, or with the fault armed. An in-flight write may commit the latest choice |
| 6 | Removal vs route departure | Removal discards without a dialog. A route change with drafts is held |
| 7 | Labels | One blocking participant: its label. Two or more: `Dashboard`/`工作台`. The Header alone: `Dashboard header`/`工作台备注` |
| 8 | Combined `isCurrent` (every participant current) vs `isBlocking` (any participant current and blocking) | Single-participant cases expect the `f9eb4b1` outcome exactly |
| 9 | Ghost | Zero writes and no participant from the ghost. Its display may equal the committed bytes rather than the source widget's draft |
| 10 | Seeds | In-domain everywhere except source-truth cases (F-FD1); `xai_rail_order` and the Appearance keys per rule 10 |
| 11 | Ticks | Zero re-registrations without changes, at both SHAs |
| 12 | Sign-out steps (rule 12) | No rail or Appearance draft: zero confirms of every class. Row q and c5: the rail confirm first. Cancel there leaves the Clock and the coordinator untouched; OK leads to the coordinator dialog. No case expects an Appearance confirm |
| 13 | Topbar statuses (rule 11) | Absent, as a precondition, except the rail status in row q and c5 |
| 14 | Rail drags vs AppRail clicks (rules 13 and 14) | Departure by click only. A rail draft only through a full drag sequence with `drop` (jsdom) or a trusted CDP drag (native) |
| 15 | Clock-attributed events vs navigation events (rule 15) | Zero for the first; the second equal to `f9eb4b1` |
| 16 | Release-once (rule 16) | Sign-out expects no router commit; POP and programmatic navigation expect exactly one release |

**Sol jsdom modes** (real storage, hooks and engine):

| Mode | Coverage |
| --- | --- |
| `bytes` | All 17 values with exact bytes through the widget. Absent defaults. Zero-write mount of the widget, of `DashboardModule` with the real registrations, and of the ghost during a drag. Lifecycle classification of both keys. Byte compatibility with the CmdK reader and adapter |
| `fields` | Per field ×2: every §5 item 5 failure with Retry; source truth (§5 item 2 and a key-scoped throwing `getItem`) with Reload only; targeted Discard with zero writes and zero sibling reads; both fields unresolved; a conflict plus an unrelated quota failure; late completions ignored; no success claim |
| `queues` | §5 items 4–6: rapid choices with a real held lock; the predecessor and latest orderings; uncertainty with one total write; external replacement and removal as preserved conflicts, including restoration; new work after Discard; interleaved style and timezone work |
| `departure` | `DashboardModule` with a recording coordinator registration and with the production Dashboard registration and coordinator. Cases: <ul><li>**D1** Header-only equivalence: the label, export file, discard and auto-release counts match a recorded `f9eb4b1` run;</li><li>**D2** a Clock failure plus an AppRail-equivalent programmatic navigation is held, label "Clock";</li><li>**D3** a pending Clock write held behind the real lock, then that navigation is held; on release, exactly one auto-release;</li><li>**D4** a Clock failure plus Back is held; Retry success releases once;</li><li>**D5** sign-out with a Clock draft through `requestSettingsDeparture("sign-out")`: Stay resolves `false`, then Discard resolves `true`. The `window.confirm` recorder holds zero calls (no App steps run in Sol);</li><li>**D6** combined Header and Clock, in the two runs of host row k: (k1) the label "Dashboard", dialog Export calls each participant once, then dialog Discard discards both and navigates once; (k2) a Clock Retry success keeps the hold with the label "Dashboard header", then a Header Retry success releases once;</li><li>**D7** the combined members per §6 item 6, through the recording registration: `isCurrent` with one participant non-current, label rules, participant order, identity-based unregister;</li><li>**D8** the ghost is inert;</li><li>**D9** removal discards with zero writes;</li><li>**D10** ticks (positive control at both SHAs);</li><li>**D11** standalone `DashboardModule` without a registration: the Clock records and recovers with no participation and no throw;</li><li>**D12** `beforeunload` only with drafts;</li><li>**D13** D2 and D6 repeated inside `<StrictMode>`: the same outcomes, with no inert aggregator after the effect re-run.</li></ul> |
| `continuity-export` | §7 item 1 and the Sol-layer lifetime (A→B→locked→A and an epoch change with a held device-key lock); an unrelated held account lock does not delay, nor do held `xai_rail_order` and `xai_pref_theme` locks; unmount refusal; §8 apart from the native disk shapes (memory-only under total denial, liveness rechecks, setup failure, unmount cancel, export of a pending draft) |
| `original` | The archive's own dashboard-widgets and dashboard-grid tests |

- Install a Web Lock fixture with exclusive semantics (pattern: `appearanceLockFixture.ts`).
  - A pass-through stub cannot prove a held lock.
  - An accidental `lock-unavailable` result is a fixture failure, except in the cases that test lock unavailability on purpose.
- Use an attempt-counting Storage injector that is proven to fire.
- Stub `window.confirm` with the rule 12 recorder.
- Drive real `accountScope` transitions.
- Select controls only through the §5 stable selectors and accessible names.

**Parent host baseline** (`web-dashboard-clock-recovery-independent/`, jsdom, production `App` at `f9eb4b1`):
- **Correct before failures:** host rows b–h, j, k, m and n; the drafted half of row i; and the OK half of row q (attempts 2–3: no Clock hold).
- **Positive controls that must PASS at `f9eb4b1`:** rows a, l, o and p; the idle half of row i; the lock-independence run of row c; and the Cancel half of row q (attempt 1).
- one clean positive control;
- the Topbar census and the confirm recorder in every row;
- the cross-caller domain scan above.

**Native before** (parent, Chrome, production `App` at `f9eb4b1`):
- H1–H5 in EN and ZH;
- H9 per-stop focus measurements with the frozen `pixelFocusWalk` (§9);
- H10 target sizes;
- the widget box and the default pet box at every width, including 768×1024;
- provenance, pipe transport and the K-1 key audit.

Only the auth session may be synthetic.

**Clock F1-shape before** (parent).
- A new runner `web-dashboard-clock-recovery-f1/verify-f1-clock.mjs` and its host fixture reuse the frozen F1 prelude `../web-sticky-recovery-f1/f1-prelude.js` read-only and hash-checked (`67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670`). Its pattern is the accepted `../web-apprail-order-recovery-f1/verify-f1-railorder.mjs`.
- It uses pipe transport, sends no `nativeVirtualKeyCode`, audits keys (K-1) and streams the archive (rule 7).
- It also asserts a docs-head product-tree precondition (`git diff --name-only <revision> HEAD -- apps packages package.json pnpm-lock.yaml` is empty) and the r2 contract hash.
- Its `selfcheck` mode must be harness-valid. Its `clock` mode records:

| Case | Scenario | Correct before state at `f9eb4b1` |
| --- | --- | --- |
| c1 | Back (POP) from the Dashboard with a failed Clock choice; then a successful Clock Retry | `before-not-held`: no Clock draft exists, and the POP is not held |
| c2 | AppRail click with a failed Clock choice; then dialog Discard | `before-not-held` |
| c3 | Back with a failed Header note save and a failed Clock choice; then Clock Retry success (the hold must continue); then Header Retry success (one release) | `before-header-only`: the hold exists only for the Header, and the Clock has no draft |
| c4 | Sign-out from the Dashboard with a failed Clock choice and no rail or Appearance draft; Stay, then Discard | `before-not-held`. The recorder holds zero confirms (a positive part at both SHAs) |
| c5 | **(new in r2)** Sign-out from the Dashboard with a failed rail drop (trusted CDP drag, quota scoped to `xai_rail_order`) and a failed Clock choice. Cancel at the rail prompt; then a second sign-out with OK at the rail prompt, then dialog Discard | `before-rail-only`. The Cancel half passes at both SHAs: one rail confirm, no coordinator dialog, identity intact. After OK, nothing holds for the Clock, and identity is invalidated without a dialog |

None of these is an F1 signature. At the fixed product each case must show, under the release-once reading (rule 16):
- one release where a release is expected;
- zero non-live blocker calls;
- for POP and programmatic navigation, one router location commit per release;
- for sign-out (c4, c5), one sign-out resolution and one identity invalidation;
- no `Invalid blocker state transition`.

In c5 the fixed product must additionally show the rail confirm before the dialog, and zero Clock participant calls during the Cancel half.

**Validity and positive controls.**
- Every case asserts its preconditions before its business assertion: control found, seeded bytes present and of the declared class, fault armed and observed, the Topbar census (rule 11), and the AppRail precondition (rule 13).
- A failed precondition is a fixture or selector error. It is never counted as a product failure.
- At `f9eb4b1`, a missing recovery block, Export or hold is a business failure, never a precondition failure.
- These must pass at `f9eb4b1`:
  - zero-write mount, including the ghost;
  - absent defaults;
  - exact bytes for all 17 values through the UI;
  - cross-document live update of an idle widget;
  - D1, D10, host row l and the Header suites;
  - the zero-confirm recorder parts of rows g and q and of c4 and c5;
  - the lock-independence run of row c;
  - the CmdK reads;
  - the §10 item 10 tests;
  - the lifecycle classification.
- No case may use private calls to reach unreachable values.

**Hypotheses to confirm or refute.** None of these is an established defect.

| ID | Hypothesis |
| --- | --- |
| H1 | A failed style write (quota, a throwing `setItem`, denied storage) is silent: the face does not change, there is no message, Retry, Discard or export, and the choice is lost |
| H2 | The same as H1 for a timezone choice, both Local time and a city |
| H3 | Writes ignore a held `prefMutationLockName(<key>)` lock: the bytes change immediately |
| H4 | Each §5 item 2 value is silently displayed as the default (Classic or Local time), with no source alert or Reload anywhere |
| H5 | With an unsaved Clock choice, leaving the Dashboard by an AppRail click, Back, a widget `goTo` or sign-out is never held; `beforeunload` never warns; and nothing can be exported. With a rail draft as well, sign-out asks only the rail prompt and then proceeds |
| H6 | With a failed Header note save and a failed Clock choice, the departure dialog names only the Header, and its Export and Discard cover only the Header's draft |
| H7 | (Expected to be refuted; a positive control.) An idle Clock follows a committed change from another document live |
| H8 | (Expected to be refuted; a positive control.) Mount, ticks, the popover and the drag ghost make zero writes |
| H9 | Some Clock focus stop shows no own-region focus change in some selection state or theme (per stop; to confirm or refute) |
| H10 | (Recorded, not a requirement.) Existing Clock targets are below 44×44 outside 641–1024 px |

**Freezing and reruns.**
- Freeze oracle files, before logs and SHA-256 hashes before Terra starts.
- If a hypothesis is refuted, record it as PASS. It is not a defect, but its requirement still binds the fixed product.
- Later fixture corrections use a diagnostic suffix, rerun against both archives, and never weaken an assertion.
- Correct FAILs must be preserved through unchanged fixed reruns.

**Judging copies and predicted outcomes** (the F-FD1 lesson; the final verifier records frozen originals as they fall and stops on any outcome not predicted here). The Clock changes nothing these oracles cover, so the fixed prediction equals `f9eb4b1`. The `f9eb4b1` column is the observed AppRail final regression (`review-final-regressions-f9eb4b1.md` §4).

| Oracle | At `f9eb4b1` | At the fixed SHA | Judges at the fixed SHA |
| --- | --- | --- | --- |
| Features Sol `downstream`, frozen | 13/15: case 012 PRECONDITION (F-FD1), case 014 PRECONDITION (AppRail A7) | 13/15, the same two cases | No |
| C-FD1 copy (`7bb5ad3c…`) | 14/15: case 014 PRECONDITION (AppRail A7) | 14/15 | No (it ran 15/15 at `419e56d`, so r1's expectation is withdrawn) |
| **C-RD1 copy** (`../web-apprail-order-recovery-sol/features-downstream.c-rd1.test.tsx`, `6c57164e…`, through `diag-features-sol-c-rd1.mjs` `7d6e8c3f…`) | 15/15 | 15/15 | **Yes** (case 014 is judged only by C-RD1) |
| More `boundaries`, frozen | As it falls (nondeterministic, F-B002) | As it falls | No |
| **More `boundaries`, corrected (C-FB002)** | 10/10 | 10/10 | **Yes** |
| Appearance Sol `continuity-export`, frozen | 24/26 (006, 007; OE-1, OE-2) | 24/26 | No |
| **Appearance `continuity-export.corrected` (OE)** | 26/26 | 26/26 | **Yes** |

A judging copy that fails is a regression. A frozen original that fails in a way not predicted above is a finding to freeze and explain before acceptance.

## 13. Gates

The E-numbers refer to §14. A row is complete only when every listed item exists.

| Gate | Required complete evidence | Checklist items |
| --- | --- | --- |
| 1. Both fields | <ul><li>All 17 values with exact bytes and defaults.</li><li>Zero-write mounts, including the ghost.</li><li>Every malformed value and a key-scoped throwing read per key, with Reload only and no throw.</li><li>Every failure kind with the latest choice kept and Retry, per field.</li><li>A value equal to the default is stored.</li><li>No success claim.</li><li>Targeted Discard with zero writes and zero sibling reads.</li><li>Both fields unresolved; a conflict plus an unrelated quota failure; late completions ignored.</li></ul> | E1, E2, E6, E7, E9 |
| 2. Ordering and latest intent | <ul><li>§5 items 4–6 with a real held lock.</li><li>Rapid choices and coalescing with final bytes.</li><li>The predecessor and latest orderings; pending Retry inert.</li><li>Uncertainty with one write; external conflict, including restoration and removal.</li><li>New work after Discard survives.</li></ul> | E1, E2, E7, E9 |
| 3. Departure participation and Header equivalence | <ul><li>§6 items 1–9.</li><li>Sol `departure` D1–D13.</li><li>Host rows c–g, k–n and q in jsdom and natively.</li><li>Single-participant equivalence through the Header's accepted suites.</li></ul> | E1, E2, E3, E7, E8, E11, E17 |
| 4. Device continuity and export | <ul><li>Sol-layer A→B→locked→A and an epoch change with a held device-key lock.</li><li>No account key, lock or marker touched; an unrelated held account lock, and held rail and Appearance key locks, do not serialize.</li><li>Unmount refusal.</li><li>Memory-only export under total denial with attempt counters; setup and click failure; unmount cancel.</li><li>Exact native disk JSON for all seven §8 shapes.</li></ul> | E1, E2, E7, E10 |
| 5. Production host and protection | <ul><li>The complete §9 matrix, rows a–q, in the production App, with history counters, runtime-error gates, the Topbar census and the confirm recorder.</li><li>New-document reload with zero mount writes; a native held lock; native uncertainty; a second-document conflict.</li><li>The Clock F1-shape cases c1–c5, before and fixed.</li></ul> | E3, E4, E5, E8, E9, E11, E16 |
| 6. Downstream, crash safety, invariance and isolation | <ul><li>§10 items 1–11, including the `.app-rail` and `.topbar` comparison and the event attribution.</li><li>H4 and H7 before evidence.</li><li>The before byte, default and reader controls PASS at `f9eb4b1`.</li></ul> | E2, E4, E7, E12, E18, E19, E20 |
| 7. F1 regression | <ul><li>The 12 frozen F1 invocations PASS at the fixed SHA. Runner hashes are unchanged, or a §14 capacity copy is used and disclosed.</li><li>The Appearance F1-shape `selfcheck` and `appearance` modes PASS through the K-1 copy.</li><li>The rail F1-shape `selfcheck` and `railorder` modes PASS, with an unchanged hash.</li><li>The Clock F1-shape mode: before at `f9eb4b1`, and fixed PASS.</li></ul> | E5, E15, E16 |
| 8. Presentation and keyboard | <ul><li>EN/ZH at five widths: pet-hidden hit-tests (narrow widths via the resize procedure); the pet-on R-PET run; 44×44 for new targets; containment and overflow; the CSS-scope audit, including the non-collision with shell selectors; manual screenshots.</li><li>Per-stop focus visibility with the frozen `pixelFocusWalk`, in every selection state and theme (F-APP-1/2), plus the recorded open-popover Tab-out probe.</li><li>Keyboard, including the focus targets and the K-1 audit.</li></ul> | E4, E13, E14 |
| 9. Affected callers and final regression | Independent reruns from the fixed archive: <ul><li>the Header (E17), through the pre-registered buffer copies where the frozen runner refuses;</li><li>both dashboard packages (test, typecheck, lint);</li><li>the Web package (test, check-types, lint) and CmdK;</li><li>storage check-types;</li><li>the accepted-caller suites per E24, including AppRail, with every judging copy (C-RD1, C-FB002, OE) beside its frozen original, C-FD1 recorded, and the outcomes matched to §12's prediction table.</li></ul> Any selector outside the §9 scopes needs the affected callers' native visual modes. Any shared delta needs impacted engine, hook and caller reruns plus fresh acceptance | E6, E17–E25 |

**Acceptance condition.**
- Every row must reconcile four things: the source, a correct before failure, fixed independent behaviour, and the actual user surface.
- Every §14 item must be cited with its artifact path and SHA-256. A missing item blocks acceptance.
- The caller cannot be closed by any of the following:
  - converting the bindings without departure participation;
  - an aggregator that changes any single-participant Header outcome;
  - a coordinator, router, `DashHeader.tsx`, shell or App edit;
  - a ghost that writes or registers;
  - any success claim;
  - keeping a legacy or raw write;
  - silent defaulting of malformed bytes;
  - a Clock participant that is asked, or touched, when an earlier sign-out step cancels;
  - judging Features `downstream` case 014 by anything other than C-RD1;
  - shipping recovery without the export, cross-document, isolation and clean-state invariance evidence.

## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). It is contiguous, E1–E25. The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; the lockfile gate recorded; the archive byte count and streaming or buffer method; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references | Sol | `f9eb4b1` | 1–4 |
| E2 | Sol before logs for the six §12 modes. Per-case outcomes for H1–H6 as exercised; positive controls PASS (H7, H8, D1, D10; D5's zero-confirm recorder). Zero precondition failures | Sol | `f9eb4b1` | 1–4, 6 |
| E3 | Parent jsdom host before log (production `App`): <ul><li>Correct FAILs: rows b–h, j, k, m and n, the drafted half of row i, and the OK half of row q.</li><li>PASS: rows a, l, o and p, the idle half of row i, the lock-independence run of row c, the Cancel half of row q, and a clean control.</li><li>Every row's Topbar census and recorder.</li><li>The cross-caller domain scan (§12).</li></ul> | Parent | `f9eb4b1` | 3, 5 |
| E4 | Native before, production `App`, pipe transport: H1–H5 in EN and ZH; H9 per-stop focus measurements with the frozen `pixelFocusWalk` (identity hashes asserted); H10 sizes; widget and pet geometry at every width, including 768×1024; provenance; the K-1 key audit | Parent | `f9eb4b1` | 5, 6, 8 |
| E5 | The new Clock F1-shape runner and host fixture (the frozen prelude reused read-only and hash-checked; pipe transport; no `nativeVirtualKeyCode`; key audit; streamed archive); `selfcheck` harness-valid; the `clock` before log, c1–c5 | Parent | `f9eb4b1` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only f9eb4b1 <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` in the reserved `docs/reviews/web-dashboard-clock-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all six modes PASS, with zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS: every row a–q and the clean control | Parent | fixed | 3, 5 |
| E9 | Native controls: 17 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only per key with Reload; a native held lock; uncertainty with one write; a second-document conflict; per-field failure, Retry and Discard | Parent | fixed | 1, 2, 5 |
| E10 | Native export: the seven §8 disk shapes under total denial (counters, URL, anchor, unload warning, hold, and absent Topbar statuses), plus one setup failure | Parent | fixed | 4 |
| E11 | Native host matrix rows a–q with history counters, runtime-error gates, the Topbar census, the CDP dialog recorder, the trusted-drag record (row q) and the K-1 key audit; rows g and q in both auth branches | Parent | fixed | 3, 5 |
| E12 | Native downstream and isolation: CmdK committed bytes; zero Clock-attributed `StorageEvent` and bus events, with navigation-caused events equal to `f9eb4b1`; the other-key snapshot unchanged, including `xai_rail_order`; clean-state `.module-dashboard`, `.app-rail` and `.topbar` invariance against `f9eb4b1` (EN/ZH; 375 and 1440; popover closed and open; frozen page clock) | Parent | fixed and `f9eb4b1` | 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests (narrow widths via the resize procedure, with pet-hidden asserted after the resize); the pet-on R-PET run; 44×44 for new targets; containment; overflow; the selector audit (append-only, scopes, class-usage control, non-collision with shell selectors); the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (pet captures also `f9eb4b1`) | 8 |
| E14 | Keyboard and focus: Tab order, Enter/Space once, the focus targets, the per-stop `pixelFocusWalk` comparison in walk states 1–4 across selection states and themes (F-APP-1/2), the recorded open-popover Tab-out probe (§9), the K-1 audit | Parent | fixed | 8 |
| E15 | **F1 regression**, 16 invocations: <ul><li>`verify-f1.mjs` sticky, more and collaborate;</li><li>`verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro;</li><li>`verify-f1-race.mjs` race;</li><li>`verify-f1-features.mjs` selfcheck and features;</li><li>the Appearance F1-shape `selfcheck` and `appearance` modes through the K-1 copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (`e9fbc590…`; at `f9eb4b1`, 135/135 harness-valid and a1–a4 `fixed-pass`, 123/123);</li><li>**the rail F1-shape** `../web-apprail-order-recovery-f1/verify-f1-railorder.mjs` (`6385b648…`) `selfcheck` (harness-valid, 165 checks at `f9eb4b1`) and `railorder` (`verdict=fixed-pass`, f1–f3, 104 checks at `f9eb4b1`).</li></ul> All PASS with no `Invalid blocker state transition`. Runner hashes are unchanged, except where the capacity rule applies (Rules) | Parent or final verifier | fixed | 7 |
| E16 | Clock F1-shape fixed log PASS for c1–c5 under the release-once reading: one release per expected release, zero non-live blocker calls, one location commit per navigation release, one identity invalidation per sign-out release, zero runtime errors, no `Invalid blocker state transition`, and the c5 ordering (rail confirm first; zero Clock calls on Cancel) | Parent or final verifier | fixed | 5, 7 |
| E17 | **Header affected-caller rerun,** at the fixed SHA and, as a control, at `f9eb4b1`. Counts and record sequences must equal the accepted receipts: <ul><li>**Host suite:** departure 5/5, advanced 5/5, followon 2/2. The frozen `../web-dashboard-header-departure-independent/verify-fixed.mjs` (`840225ac…`) refuses with `ENOBUFS` at 100 MiB, so the judging runner is the accepted buffer copy `../web-apprail-order-recovery-final/host-suites/web-dashboard-header-departure-independent/verify-fixed.mjs` (`56645cbb…`).</li><li>**Native suite:** `../web-dashboard-header-departure-native/verify-native.mjs` (`7af1a8fd…`), the 18 modes of `affected-callers-f359be6.md` §3.7, with record sequences equal to the accepted ones.</li><li>**Astra and Sol suites,** as unchanged controls with counts equal to their accepted receipts: `../web-dashboard-header-departure-astra/verify-fixed.mjs` (`30e3f804…`) and `../web-dashboard-header-departure-sol/verify-fixed.mjs` (`bb5f8937…`).</li><li>The native, Astra and Sol runners also use 100 MiB buffers. Each runs first as frozen; on refusal it runs through a **pre-registered buffer copy** (Rules) under `web-dashboard-clock-recovery-final/header-copies/`.</li></ul> | Parent or final verifier | fixed and `f9eb4b1` | 3, 9 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `f9eb4b1` | Final verifier | `f9eb4b1` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff against `f9eb4b1` | Final verifier | `f9eb4b1..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for both keys | Sol and final verifier | fixed | 6, 9 |
| E21 | `xai-web-dashboard-widgets` full test, typecheck and lint from the fixed archive, plus its unchanged tests at `f9eb4b1` as a before control | Final verifier | fixed and `f9eb4b1` | 9 |
| E22 | `xai-web-dashboard-grid` full test, typecheck and lint, plus its unchanged tests at `f9eb4b1` as a before control. The package tree is identical to `73b4eb9`'s, where it was 25 files / 228 tests | Final verifier | fixed and `f9eb4b1` | 9 |
| E23 | Web package test (30 files / 196 tests at `f9eb4b1`, including `App.railorder` 18 and every §10 item 10 web test), check-types and lint; CmdK package test | Final verifier | fixed | 9 |
| E24 | **Accepted-caller suites,** with counts compared to the AppRail final regression at `f9eb4b1` (`review-final-regressions-f9eb4b1.md` §3–§6; runners and commands as there). Each judging copy runs beside its frozen original as §12 predicts. The rows are listed after this table | Final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict; the §12 prediction table filled with observed outcomes; every capacity copy with its diff and its refusal transcript | Final verifier | — | 9 |

**E24 rows** (each count is the AppRail final regression at `f9eb4b1`):
- **AppRail (new in r2):**
  - Sol eight modes through `../web-apprail-order-recovery-sol/verify-fixed.mjs` (`e944cb22…`): `bytes` 26, `domain` 31, `merge` 21, `drag` 18, `field` 24, `continuity-export` 22, `host` 33 and `original` 123;
  - parent host through `../web-apprail-order-recovery-independent/verify-fixed.mjs` (`646bf047…`): 31/31;
  - **C-RD1** 15/15, judging Features `downstream` case 014.
- **Appearance:**
  - Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48 and `original` 187;
  - `continuity-export`: frozen 24/26 (006, 007), recorded, **and** the OE copy `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs … corrected` 26/26, judging;
  - parent host 33; package 11 files / 137.
- **Features:**
  - Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26 and `original` 6;
  - `downstream` three ways: frozen 13/15 and C-FD1 14/15, both recorded, and C-RD1 15/15, judging;
  - host 40; package 7 files / 45; reader tests 5 files / 17.
- **More:**
  - Sol `fields` 22, `reset` 20, `queues` 14 and `owner-export` 13; `original` 15; host 11;
  - `boundaries`: frozen, recorded as it falls, **and** the C-FB002 copy `../web-more-recovery-fb002/verify-fb002.mjs … corrected full` 10/10, judging.
- **Others:**
  - Sticky: Sol 109, original 10, host 28;
  - Notifications: Sol 41, Astra boundaries 24, Astra host 15, parent host 12;
  - Date & Time 7;
  - the Smart Lists, Collaborate and Pomodoro host suites through the accepted buffer copies in `../web-apprail-order-recovery-final/host-suites/`, with the per-mode counts of that receipt's §6;
  - settings-shell 11 files / 54; settings-rest 44 files / 314.

**Rules.**
- E1–E5 must be committed before Terra starts.
- E25 is produced last and enumerates every other item.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- **Judging copies.** The frozen More `boundaries`, Features `downstream` (cases 012 and 014) and Appearance `continuity-export` (cases 006 and 007) failures are judged by their copies: C-FB002, C-RD1 and OE. C-FD1 runs beside them with its predicted outcome and judges nothing. A judging copy that fails is a regression.
- **K-1 and transport.** Every native runner written for this caller uses pipe transport, sends no `nativeVirtualKeyCode` and audits keys (K-1). Reused frozen runners that send none run unchanged, with their frozen transport (AppRail acceptance §6 item 10).
- **Drags.** Native drags use trusted CDP input only (§12 rule 14).
- **Product-delta preconditions.** A reused frozen runner may refuse at a precondition bound to an earlier caller's product delta. The verifier then commits that refusal log, and runs a copy that replaces only that precondition with a stricter one naming this caller's §11 delta. This follows the Appearance and AppRail E24/E25 precedents, and the deviation is disclosed for acceptance. Every other precondition and assertion stays unchanged.
- **Capacity copies (pre-registered; AppRail acceptance §6 item 10).**
  - **When.** A reused frozen runner aborts with `ENOBUFS` (or any buffer-capacity error) while reading `git archive`, before any test runs.
  - **What the verifier does.** It commits the refusal transcript. It then runs a copy that differs from the frozen runner only in the archive buffer (sized from the measured archive, at least twice its size, or replaced by streaming) and, if the copy lives in a deeper directory, in its `root` depth, plus a header comment.
  - **Requirements.** The copy's diff against the frozen runner is committed. Staged test and fixture files must be byte-identical to the frozen ones. Counts must equal the accepted receipts and the `f9eb4b1` control.
  - **Pre-registered for:** the four Dashboard Header runners (E17), whose 100 MiB buffer is below the `f9eb4b1` archive.
  - **Applies on refusal to:** the three 200 MiB F1 runners `verify-f1.mjs`, `verify-f1-callers.mjs` and `verify-f1-race.mjs` (E15). Their buffer, 209,715,200 bytes, exceeds the 173,905,920-byte archive at the r2 docs head, but later evidence may outgrow it.
  - **Status.** The copy procedure is not a contract revision and needs no separate ruling batch; acceptance reviews each copy.
- **Not rerun.** The Features native host and downstream suites (Features E12/E13) and the AppRail native E9–E14 are not rerun. Their subjects (Features rail departures and drags, and AppRail's own surfaces) are outside the Dashboard packages, and the empty shell, `App.tsx` and tokens diff (E19) plus the `.app-rail`/`.topbar` invariance (E12) bound them. If either bound fails, they must be rerun.

## 15. Lessons and limitations converted

| Lesson or retained limitation (source) | Clock treatment |
| --- | --- |
| F1: the coordinator regression oracle must keep running (F1 closure) | **Gate.** All 12 frozen F1 invocations, the Appearance F1-shape through its K-1 copy, and the rail F1-shape (E15). A new Clock F1-shape runner covers release after Retry, dialog Discard, the combined hold, sign-out, and sign-out behind a rail prompt (E5, E16). No coordinator change is permitted |
| G1: a gate item had no scheduled runner (Sticky) | **Gate.** The single contiguous §14 checklist and the enumerated E25 receipt; acceptance blocks on any missing ID |
| F-B002: a test spy re-entered storage; the frozen More oracle is nondeterministic | **Rule.** §12 F-B002 rule with a self-check (E1). E24 runs the corrected More oracle beside the frozen one |
| OE-1/OE-2: two frozen oracles contradicted the contract and each other (Appearance) | **Rule.** The §12 consistency matrix, cross-referenced to cases in E1 and E3. The conflict-seeding rule is explicit (row 4), and r2 adds rows 12–16 for the `f9eb4b1` surfaces |
| F-FD1: an oracle seeded an out-of-domain value; a caller that tightens a domain can break accepted oracles | **Rule.** In-domain seeds (§12 rule 10), and the cross-caller domain scan before Terra (E3). Corrected copies are prepared before E24 if any are needed |
| C-RD1: AppRail's write-at-drop rule made the C-FD1 copy fail Features `downstream` case 014 (AppRail acceptance §6 item 12) | **Rule.** Case 014 is judged only by C-RD1. C-FD1 is recorded at 14/15. r1's "C-FD1 15/15" is withdrawn (§12 prediction table) |
| K-1: `nativeVirtualKeyCode` caused trusted key streams in headless Chrome | **Rule.** New native runners never send it, use pipe transport and audit presses against keydowns (§9, E4, E5, E11, E14) |
| F-APP-1/F-APP-2: focus was masked by a selection ring or by `outline: none` | **Gate.** Per-stop comparison with the frozen `pixelFocusWalk`, identity-checked, across every selection state and theme (§9, E14). Repairs are limited to appended `.w-clock-body` rules |
| F-E14-1: a non-modal overlay at 375 px covered later focus stops (AppRail acceptance §6 item 8) | **Rule.** §9 states that the Clock adds no overlay. It identifies the unchanged timezone popover as the only Clock-side risk, records it in an open-popover Tab-out probe, and offers the alternative to the controller (§17) |
| D1: dragenter accepts, the following dragover moves the preview; a lone synthetic `dragEnter` expecting a preview change is an oracle error | **Rule.** §12 rule 14; rail drags only in row q and case c5, never as a departure action (rule 13) |
| Release-once reading (Appearance ruling 4; AppRail §6 item 2) | **Rule.** §12 rule 16, applied to E16 and every sign-out row |
| Archive growth beyond 100 MiB broke the older runners (`ENOBUFS`; AppRail acceptance §6 item 10) | **Rule.** New runners stream or size from the archive (§12 rule 7). Capacity copies are pre-registered for the Header runners and conditional for the 200 MiB F1 runners (§14 Rules) |
| Below 768 px the pet's rail toggle is hidden (AppRail acceptance §6 items 7 and 9) | **Rule.** Pet hidden at ≥768 px, then resize without reload; asserted after the resize (§9, E13) |
| Two sequential sign-out prompts, rail first, with a disclosed partial discard (AppRail §7 item 4) | **Rule.** The recorder requires zero calls from both steps without drafts. Row q and c5 prove the rail prompt precedes the Clock and that Cancel touches nothing of the Clock (§7 item 5) |
| R-PET: the App-level pet covered a moved control, and the gated runs had excluded it (Features acceptance §5.1) | **Rule.** §9 states how the pet, both Topbar statuses and every other global overlay are judged: gated pet-hidden runs, and a pet-on run that blocks only for controls this caller adds |
| E6: the implementer's run existed only as a commit-message self-report (Features acceptance §5.5) | **Rule.** The reserved Terra directory (§11); E6 cites its logs with SHA-256 |
| Regressions must run the judging copies (C-FB002, C-RD1, OE) beside the frozen originals | **Gate.** §12 prediction table and E24 name each pair and its runner |
| 44×44 applies only to a caller's new or changed targets (Appearance acceptance ruling 11) | **Rule.** §9. Existing Clock sizes are recorded (H10) |
| A shared change silently changed an accepted caller's behaviour (F1) | **Gate.** Single-participant equivalence (§6 item 6), D1, host row l, and the Header reruns (E17) |
| Host compositions lacked App-level readers and overlays | **Gate.** Every host, native and visual row runs in the production `App` at the revision under test, including the rail-order controller and status (§9) |
| Affected callers' visual modes were not rerun after a shared change (Sticky follow-up 6) | **Rule.** Clean-state invariance of `.module-dashboard`, `.app-rail` and `.topbar` (§10 item 6, E12) instead of rerunning the Header's, Appearance's and AppRail's visual modes; anything outside the §9 CSS scopes triggers them |
| Keyboard Discard all left focus on `<body>` (Sticky follow-up 1) | **Gate.** The §9 focus targets: never `<body>` after any action of this caller |
| Retained exclusions: headless Chrome and synthetic accounts; not Tauri; synthetic `beforeunload`; development build without StrictMode; reused dependency trees | Retained. The lockfile gate is a consistency check only. StrictMode's effect re-run is covered in jsdom (Sol D13, §6 item 1), because the aggregator's lifetime depends on it |

## 16. Exclusions

**Not part of this caller:**
- DASH-02's timezone semantics: static offsets without DST (`cityLibrary.ts:1–6`), and distinguishing the system timezone from a chosen one. The caller makes the persisted choice truthful only.
- The World Clocks widget (`xai_zones`, DASH-03), the Dashboard grid's order, layout and appearance persistence and its departure participation, and every other widget.
- Any change to the Clock's face, the city list, the popover content or its keyboard behaviour. No Escape handling is added, the popover does not close on focus leaving it (§9 probe; question 2 of §17), and focus after a keyboard timezone choice is unchanged (UX-05).
- Enlarging the existing Clock targets (UX-05).
- A Reset, Retry all, Discard all, success line, status line or Topbar status.
- Holding or confirming widget removal (A7).
- Any change to the coordinator, router, `settingsDeparture`, the app registrations, `App.tsx` (including the order of its sign-out steps), the Header, the shell (AppRail, Topbar, rail-order status and controller) or the AppRail panel's F-E14-1 behaviour.
- A combined sign-out prompt across rail, Appearance and Clock. The two prompts before the coordinator, and the partial discard after OK then Stay, are properties of the accepted App sequence (§7 item 5).
- SHELL-05/SHELL-06 (pet persistence and avoidance), and moving or restyling the pet.
- Repairing malformed stored bytes (REL-07). A valid choice over malformed bytes stays a failed draft, because the engine refuses an invalid source. This is a disclosed change from `f9eb4b1`, where the legacy write simply replaces such bytes on the next choice; the same policy was accepted for Appearance (A6) and AppRail (A5).
- On a browser without Web Locks every Clock write is refused and reported, never written unfenced (D2 entry contract item 3).
- A write already in flight when Discard, dialog Discard or removal runs may still commit the latest choice (§5 item 8).
- The browser's multiple-download permission prompt for the second file of a combined dialog Export (§8 shape 6).
- D2, global reset, migration, deletion or data-export changes.
- Tauri and native window capability.
- Production authentication and live logout.
- Crash and forced-authentication durability, and drafts lost when a scope change remounts App (REL-09).

**Not closed by this caller:** REL-05, REL-07, REL-09, DASH-02, DASH-03, SET-03, SHELL-04, SHELL-05, SHELL-06, UX-03, UX-05, QA-01, QA-03, QA-04, QA-09, D2/REL/AI, or any other 312 item.

**Not authorized:** deployment, release, branch promotion or Web→Desktop sync. Any later Desktop flow needs the ADR-0013 D3 gate.

**Evidence directories:**
- Recommended: `docs/reviews/web-dashboard-clock-recovery-{sol,independent,native,f1,final,acceptance}/`.
- Reserved for Terra only: `docs/reviews/web-dashboard-clock-recovery-terra/` (§11).
- Header capacity copies, if needed, go in `docs/reviews/web-dashboard-clock-recovery-final/header-copies/`.

## 17. Open questions for the controller

1. **Confirm A1–A9** (§4). A2–A8 are r1's text; A1 and A9 change wording only (stated in each).
2. **The open-popover Tab-out obstruction (§9).** Two options:
   - **Default:** record it under UX-05, as with F-E14-1. The popover's keyboard behaviour stays excluded (§16), and recovery controls are gated with the popover closed.
   - **Alternative:** authorize Terra to close the popover when focus leaves `.clk-tz-popover`. That needs r3, a new assumption A10, a gate on the open-popover walk, and frozen before evidence of the obstruction.

   This is a controller decision, because it concerns the a11y behaviour of an existing Clock control and no stored data.
3. **Pre-registered capacity copies (§14 Rules).** Confirm that the Header runners' buffer copies, and the conditional copies of the 200 MiB F1 runners, follow the accepted AppRail host-suite procedure without a separate ruling batch.
4. **Rerun breadth (E24, §14 Rules).** Confirm two things:
   - the inclusion of the Smart Lists, Collaborate and Pomodoro host suites through the accepted copies (cheap, since they mount the production composition);
   - the exclusion of the Features native and AppRail native suites, which is bounded by E12 and E19.
5. **Sign-out partial discard (§7 item 5).** Confirm that "OK at the rail prompt, then Stay in the coordinator dialog" is disclosed rather than prevented. Preventing it would need a change to the protected `App.tsx` sequence, which is the stop condition (§18).

**Product-owner decisions:** none. The A7 escalation note stands. It would become a product question only if the controller reads REL-05 as requiring protection on removal. No other item in r2 changes stored data, user-visible copy beyond §5, or a cross-module rule.

## 18. Stop condition

- **For this contract.** The stop condition did not trigger, so this document is a contract rather than a STOP memo:
  - A compliant design needs no D2 shared-layer change, no edit to the protected shell or `App.tsx`, and nothing outside the `web` module.
  - The Clock joins sign-out only through the coordinator's combined guard, which the unchanged `App.tsx` already reaches after the rail and Appearance steps (§3 item 9).
  - The Topbar needs no slot, because the Clock has no App-level surface (A6).
  - AppRail clicks already reach the Dashboard coordinator unchanged (§3 item 15).
  - Both keys stay unscoped device keys on the registered `string` path, with caller validators (A4, A5).
  - Every product file is in the two dashboard packages (§11).
- **For Terra and every later role.** Stop and report, without a product repair, if a compliant implementation turns out to need any of the following:
  - a change to `plugin-web-storage` (the registry, ownership, codec, engine, hooks or lifecycle);
  - a tokens, shell, pet, CmdK or settings change;
  - a change to `App.tsx`, the coordinator, the router, `settingsDeparture` or the app registrations;
  - a `DashHeader.tsx` change;
  - a file outside §11.

  A suspected shared defect follows §11's shared-defect procedure.
