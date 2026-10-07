# Complete caller: AppRail order (`xai_rail_order`), its drag writer and its App-lifetime protection

**Revision log** (newest first).
- **r1 (2026-10-06, batch 55).** First draft. It records the product owner's decision R-1 (SET-03, control plane `eabd47f`) and proposes the controller-decidable assumptions A1–A11. No evidence depends on it yet.

Contract designer: Astra role (risk, design and final decision), executed by an independent Claude Opus 5.5 instance in an isolated detached worktree. Module `web`, 2026-10-06, control-plane batch 55. Proposed control-plane item: `CP-APPRAIL-01`. It takes effect as an execution item only once the controller confirms this revision and registers the item.

**Fixed product and source equality.**
- Fixed product: `419e56de9f23e4467fea806fbd4a990e1f429941` (`419e56d`, tree `7aabbd832be446aeca1441eff34f2fd35945290a`). The contract was authored at docs HEAD `eabd47fe87f402bac88ae2519e5a37e9ab2d48b3`; `git diff --name-only 419e56d eabd47f -- apps packages package.json pnpm-lock.yaml` is empty.
- Lockfile SHA-256: `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`.
- Every line number in this contract refers to `419e56d` unless stated otherwise.
- The unit's source and the protected files it cites:

| File | SHA-256 at `419e56d` | Last change |
| --- | --- | --- |
| `packages/xai-web-shell/src/AppRail.tsx` | `6312caa162a7d194774bf95282c203ddc633ccc54068edcd2854dfbfd4633f67` | `7a3d712` (2026-06-03) |
| `packages/xai-web-shell/src/internal/dnd.ts` (protected; reused unchanged) | `a538b51f119f9cedbed3421f8cd21549f1730d0ede9059257402bee9a63deaf9` | `5a1ef24` (2026-05-23) |
| `packages/xai-web-shell/src/registry.tsx` (protected) | `b621abbecfda785a5d7da628465925dacdb3249638b181cc3ca074687b734c1e` | |
| `packages/xai-web-shell/src/Topbar.tsx` | `87b243344cb055d0a55b5e749bfeceb97b16c6a72a442ee1f990a76ced74c1f0` | Appearance `24073b5` |
| `packages/xai-web-shell/src/Shell.tsx` | `1f5fc6c7281c74d1c08b5fac99d90feae79637f5c349fa38823dc2f042428c5f` | Appearance `24073b5` |
| `packages/xai-web-shell/src/types.ts` | `ada0b296ed314bdb74b8847dac2b6a20bc3ffc297ded929b7f4f8ad09a88d93a` | Appearance `24073b5` |
| `packages/xai-web-shell/src/index.ts` | `c404a9713dee4d821ba3ec6b5c7591f984da3c92b5fb1a62d88fbab5cec368ed` | |
| `packages/xai-web-shell/src/__tests__/AppRail.test.tsx` (unchanged disposition) | `cbe4179146b7f9565cb038027f004520b46917db3da6c0e9f653cf319b309e8f` | |
| `packages/xai-web-shell/src/__tests__/Topbar.test.tsx` | `b3a068eab6bbb95e62cb2ec73f8a715921a48549f090bf7237e8d8c0dabfcb12` | Appearance `24073b5` |
| `apps/web/src/App.tsx` | `24461a52a34c83d9e9e51dc92d99db6d76e4c56435bec3e5293e0937a8cc935a` | Appearance `24073b5` |
| `packages/plugin-web-storage/src/internal/registry.ts` (protected) | `dd961a214c94ac97753e1878323ed387cde3362f4e85f1dfaa8154f1011d29d3` | |
| `packages/plugin-web-tokens/src/layout.css` (protected) | `9397dc735d8d80a9720e81561dca73a0ed02a98fd16c1f15634e5c775e2bc6b7` | |
| `apps/web/src/routes/modules/departureCoordinator.tsx` (protected) | `0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075` | F1 repair `f359be6` |

  Package trees at `419e56d`: `xai-web-shell` `372b08be267a7dd7f734c8ff0c770a7ca3a87cf1`, `apps/web` `23f1070ec28841df45d13c12f0523e679f46dcba`.

**Status.**
- This contract specifies the next ordered implementation unit after the accepted Appearance caller (`a560863`), chosen by the controller on product risk (control plane `eabd47f`, "批次 54 回执与排程").
- It does not authorize implementation. It accepts nothing, changes no formal count and closes no 312 item.
- **R-1 is the product owner's decision** (§4). The controller checks that this revision implements it; it does not re-decide it.
- A1–A11 (§4) are **assumptions awaiting controller confirmation**. They correspond to the (a) pre-decisions R-2 and R-3 of the selection memo plus the scope and technical decisions this caller needs. A2 and A7 carry escalation notes (§4, §19).

**Authority.**
- **Product-owner decision R-1:** control plane `eabd47f`, "产品负责人决定登记（2026-10-06）", row R-1 (SET-03): a rail drag reorders only the visible modules; modules hidden by Features keep their stored positions and return to their previous place when re-enabled.
- **Batch 55 brief:** control plane `eabd47f`, "批次 55：AppRail 顺序合同".
- **Selection:** [selection-419e56d.md](../web-next-caller-selection/selection-419e56d.md): §3.3 N1 (H-RAIL) and N2; §4 row E-R; §5 "E-R. AppRail order"; §7.1 and §7.3 R-1, R-2, R-3.
- **Scheduling:** [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md) line 18 (Dashboard widgets and shell preferences: "AppRail order; inspect nested callbacks, lists, deletion/reorder and visual effects") and line 25 (combine genuinely shared producers).
- **Inventory:** [refresh-419e56d.md](../web-d2-pref-binding-inventory/refresh-419e56d.md) lines 104–107 and `bindings-419e56d.json`: the single shell row `AppRail.tsx:37` (`xai_rail_order`, setter `setPrefOrder`). Everything else in §2 lies outside the scanner's boundary.
- **Account-lifecycle boundary:** [D2 entry contract](../web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md) item 2: device-only keys stay under their classified device contract.
- **Precedents:**
  - The [Appearance contract r3](../web-appearance-recovery-contract/contract.md) is the structural template: an App-scoped controller, a Topbar status slot, an App sign-out step, strict domains, crash safety and production-App native evidence. Its [acceptance](../web-appearance-recovery-acceptance/acceptance-419e56d.md) §6 supplies the rulings carried here (OE-1/OE-2, K-1, F-FD1/C-FD1, C-FB002, R-PET, the Topbar breakpoint erratum, the 44×44 ruling) and §9 the follow-ups.
  - The [Features contract](../web-features-recovery-contract/contract.md) and [acceptance](../web-features-recovery-acceptance/acceptance-5cd63ff.md) own the rail filter, the rail-truth oracles and H6 (the AppRail drag after a Features reset).
  - The [F1 impact review](../web-sticky-recovery-f1/impact-review.md) supplies the coordinator regression oracle; [`blocked-f359be6.md`](../web-sticky-recovery-acceptance/blocked-f359be6.md) §4 is the G1 lesson; [`review-fb002.md`](../web-more-recovery-fb002/review-fb002.md) is the F-B002 lesson; [`review-k1.md`](../web-native-keyinput-k1/review-k1.md) is K-1; [`review-oe.md`](../web-appearance-recovery-oracle-erratum/review-oe.md) is OE; [`review-final-regressions-419e56d.md`](../web-appearance-recovery-final/review-final-regressions-419e56d.md) §7 is F-FD1.

## 1. Roles, order and risk

| Role | Executor | Boundary |
| --- | --- | --- |
| Parent / controller | Claude controller | Scheduling and the contract check, including confirming A1–A11 and checking that R-1 is implemented as decided. Also runs the production-App jsdom host baseline, native verification, the rail F1-shape runner, the frozen F1 runners, the affected-caller native rerun and the ledgers. |
| Sol | New independent Opus-class instance | Freezes business oracles, and the pre-registered corrected copy C-RD1 (§13), against an immutable `419e56d` archive before any implementation; then reruns them unchanged on the fixed product. |
| Terra | Implementation instance; Opus-class recommended at this risk | The complete caller, inside the §11 files only. Starts after E1–E5 (§15) are frozen and the controller authorizes it. Records its own runs at the reserved path (§11, E6). |
| Final regression | New instance, distinct from Terra and Sol | Runs gate 9 (§14) and writes the E25 receipt. |
| Final acceptance | New instance, distinct from this author, Terra, Sol and the final-regression verifier | Reconciles every §14 gate and every §15 item: source → correct before failure → fixed independent result → actual surface. |

**Exclusions by role.** Luna gets no task: persistence, the async queue, the host, the shell, cross-module isolation and acceptance are its forbidden zones. Spark is never assigned.

**Order.**
1. Contract.
2. Controller check, confirmation of A1–A11 and registration of `CP-APPRAIL-01`.
3. Frozen before baselines E1–E5: Sol oracles and C-RD1, the parent production-App host baseline, native before, and the rail F1-shape before log.
4. Terra implementation (E6).
5. Sol fixed reruns.
6. Parent host, native, rail F1-shape and frozen F1 verification.
7. Affected-caller reruns and the final regression receipt.
8. Independent acceptance.

Do not run another caller concurrently. CP-CLOCK-01 (contract r1 `2c35fee`) stays parked until this caller is accepted (control plane "下一步" item 3).

**Risk: high (hypothesis-driven).**
- **What device-only ownership removes:** account-scoped physical keys, the account lifecycle lock, private-owner admission, committed markers, tombstones, recovery admission and mixed-owner batches. `xai_rail_order` is an explicit device key (`accountOwnership.ts:106`).
- **What still makes this unit high risk:**
  - **whole-application failure:** one malformed stored value may make every `/app` route, including Settings, render the route error boundary, with no UI repair (H1, N1);
  - **silent loss:** a failed drag is a silent no-op today (H2, N2), and a drag can drop the stored positions of hidden modules (H5, decided against by R-1);
  - **data-preserving merge:** the R-1 merge must keep every non-visible stored id at its index while placing the visible order exactly; an error loses or duplicates module positions;
  - **HTML5 drag timing:** today every order-changing `dragover` writes (H3); the fixed caller writes once per drop, which changes an accepted Features oracle's event sequence (§13);
  - **App-lifetime drafts with no route and no pane:** the rail lives for the App's lifetime, so its recovery surface must be route-independent (A6), on the shell and `App.tsx` surfaces that every accepted caller renders inside and that Appearance just changed;
  - **sign-out ordering** next to the accepted Appearance step and the Settings, Pomodoro and Dashboard coordinators;
  - **cross-caller oracles:** the Features rail-truth and drag oracles, the Appearance Topbar and sign-out evidence, and the frozen F1 runners all mount the changed shell.

## 2. Exact ownership inventory

**The unit.**
- The rail-order binding, reconcile and drag writer in `packages/xai-web-shell/src/AppRail.tsx`: binding `:37`; reconcile `:39–70`; drag state and handlers `:72–92`; click suppression while dragging `:171–173`.
- Its pure reorder helper `packages/xai-web-shell/src/internal/dnd.ts:16–29` (`reorderArray`), reused unchanged.
- New for this caller: the route-independent protection (Topbar status slot, App sign-out step, unload warning) on `Topbar.tsx`, `Shell.tsx`, shell `types.ts` and `apps/web/src/App.tsx` (A6).

**The field.**

| Field id | Control | Physical key (device; physical = logical, `accountScope.ts:66–67`) | Registry entry | Exact bytes | Strict domain (A5) | Default |
| --- | --- | --- | --- | --- | --- | --- |
| `railOrder` | Drag-reorder of the `.app-rail .rail-items .rail-btn` buttons (`AppRail.tsx:149–178`) | `xai_rail_order` (`accountOwnership.ts:106`) | `json` codec, schemaVersion 1, owner `xai-web-shell`, category `shell` (`registry.ts:174–181`) | `JSON.stringify(array)`, for example `["tasks","board","dashboard"]` (`codec.ts:28–29`) | A JSON array whose every element is a string and in which no string occurs twice | `DEFAULT_RAIL_ORDER`, 12 ids: `tasks`, `board`, `dashboard`, `calendar`, `matrix`, `pomodoro`, `timetrack`, `habits`, `meditation`, `countdown`, `ai`, `statistics` (`registry.ts:109–122`) |

**The rail-visible registry R** (production, all Features on). `App.tsx:141–145` filters `webShellModuleRegistrations` (`shellRegistrations.tsx:63–90`) by the eight Features booleans; `useWebModuleRegistry()` keeps `showInRail !== false` and sorts by `railOrder`, ties by id (`registry.tsx:77–96`). The 14 rail modules, in `railOrder` order: `ai` 1, `tasks` 2, `board` 3, `dashboard` 4, `calendar` 5, `matrix` 6, `pomodoro` 7, `timetrack` 7.5, `bookkeeping` 7.6, `metrics` 7.7, `habits` 8, `meditation` 9, `countdown` 10, `statistics` 11. `settings` (99) has `showInRail: false`. The eight Features-toggleable ids are `tasks`, `board`, `dashboard`, `calendar`, `matrix`, `pomodoro`, `habits`, `meditation` (`shellRegistrations.tsx:71–81`). `bookkeeping` and `metrics` are not in `DEFAULT_RAIL_ORDER`, and the storage `RailItemId` type omits them (`registry.ts:55–68`).

**Display order (unchanged by this caller).** For a stored order S and the visible set R: first every id of S that is in R, in S order; then every id of R that is not in S, in R order (`AppRail.tsx:42–62`). Absent bytes display `DEFAULT_RAIL_ORDER` reconciled: the 12 defaults, then `bookkeeping` and `metrics`.

**Every writer and reader of `xai_rail_order`.** Searched at `419e56d` with `git grep` over `apps/` (including `apps/desktop`) and `packages/`, all extensions, for `xai_rail_order`, `rail_order`, `RAIL_ORDER`, generic `PREF_REGISTRY` and `LOCAL_KEY_OWNERSHIP` iterations, and production `localStorage.clear()`:

| # | Site | Kind | Source | Notes |
| --- | --- | --- | --- | --- |
| 1 | AppRail | Reader and the only production writer | Binding `AppRail.tsx:37`; write `:89` | Legacy `usePref` → `setPref` (`usePref.ts:130–151` → `storage.ts:161–227`) |
| 2 | `resetAllPrefs()` | Indirect remover | `plugin-web-settings-shell/src/internal/resetAllPrefs.ts:29–45` iterates every registered key | No production caller: its only call is the `SettingsFooter` fallback (`SettingsFooter.tsx:94`), and no production pane mounts `SettingsFooter` at `419e56d` (selection memo §3.1 item 4) |
| 3 | Device recovery export | Raw reader | `dataExport.ts:87–95`, called by `plugin-web-settings-rest/src/internal/DeviceRecoveryExport.tsx:17` | Copies the raw bytes of every device key verbatim, so it needs byte compatibility only |
| 4 | Lifecycle declaration | Classification | `lifecycleDeclaration.ts:25–34` | device-preference, `device-recovery`, `retain`, `retain-on-device` |
| 5 | Storage tests | Test writer and readers | `plugin-web-storage/src/__tests__/imperative.test.ts:63–65`, `registry.test.ts:15` | Protected; unchanged |
| 6 | AppRail tests | Test seeds | `AppRail.test.tsx:150–158`, `:279–316` | `["ghost-module","tasks"]`, `["dashboard","tasks"]`, `["tasks"]`, `[]` are all in-domain under A5 |
| 7 | Accepted evidence | Seeds, drags and byte snapshots | Features Sol `downstream.test.tsx:162–167`, `:193`, `:499–516`; Features native `verify-native-downstream.mjs:296–301`, `:441–497`; Features native before `verify-native-before.mjs:659–790`; Appearance E13 unrelated-key snapshots | Analysed in §13 |

**Not readers of the key** (each checked, because the batch brief names them):
- **CmdK** reads the eight Features keys through `getPref` when the palette opens (`CommandPalette.tsx:194–209`) and module states through `readModuleStates.ts:26–60`; neither touches `xai_rail_order`.
- **The Features rail filter** (`useFeaturePrefs.ts:17–31`, `filterModulesByFeaturePrefs.ts:17–25`, applied at `App.tsx:141–145`) decides R, the input of the display reconcile and of the R-1 merge. It never reads or writes the order key.
- **`App.tsx`**, every other `.ts` file outside the storage internals and `apps/desktop` have no reference. The direct-`usePref` scanner sees row 1 only.

**Ownership and lifecycle.**
- Device key: device writes skip the account lock (`prefMutation.ts:244`). Every engine write takes the per-key lock `prefMutationLockName("xai_rail_order")` = `xai:pref:v1:xai_rail_order` (`prefMutation.ts:33–35`, `:153`). Without `navigator.locks` every engine write is refused (`accountCoordination.ts:12–16`).
- **Domain enforcement is caller-only.** For the `json` codec `validateRegisteredPrefValue` only checks that the value is JSON-encodable (`prefMutation.ts:42–60`). The strict validator therefore comes from the caller and is composed with the codec boundary (`usePrefAutosaveAsync.ts:37–58`). Do not add domains to the registry, codec or engine.

**Preserve:**
- the rail markup: `aside.app-rail[data-pos]`, `.rail-avatar-wrap` with `AvatarMenu`, `.rail-items`, each `button.rail-btn.has-tip` with `data-tip`, `aria-label`, `draggable`, and the `active` and `dragging` classes, and `.rail-bottom` with the pet button (`AppRail.tsx:114–204`);
- module-button activation: `onModuleClick(id)` before navigation, suppressed while a drag is in progress (`:171–173`), and every existing `AppRailProps` field;
- the key, codec, default and byte format; the display reconcile; `reorderArray` byte-unchanged; the `xai_rail_order` DEV warning text may stay or go;
- every existing public export of the shell barrel (`index.ts:11–32`; additions only, and `reorderArray`/`getPopoverAnchor` stay unexported, `index-barrel.test.ts:41–45`) and of `App.tsx` (`readLocalPref` byte-identical, `createPetToggleHandler`, `createSettingsOpenHandler`, `App`);
- the accepted Appearance surface: the `appearanceStatus` slot immediately after `premiumBadge` (`Topbar.tsx:115–116`) and the Appearance sign-out step immediately before each `requestSettingsDeparture("sign-out")` (`App.tsx:161–162`, `:171–172`).

## 3. As-is behaviour at `419e56d`

These are facts only. Suspected defects appear solely as hypotheses in §12.

1. **Read path.** `usePref("xai_rail_order")` (`AppRail.tsx:37`) reads through `getPref` (`usePref.ts:107–117` → `storage.ts:132–155`).
   - Absent bytes and a throwing `getItem` give the registry default (`storage.ts:138–145`).
   - The `json` decode returns whatever `JSON.parse` returns, and only a parse failure or the JSON literal `null` becomes `null` (`codec.ts:57–62`), which `getPref` turns into the default with a console warning (`storage.ts:146–153`).
   - `decodeStoredPrefValue` adds no shape check for this key (`storage.ts:29–38`; `xai_rail_order` is not a canonical command key, `canonicalCommandState.ts:6–9`).
   - So objects, numbers, booleans, strings and arrays of anything reach AppRail unchanged.
2. **Reconcile during render** (`AppRail.tsx:42–62`).
   - `for (const id of prefOrder)` (`:46`) throws a `TypeError` for a non-iterable value (object, number, boolean). A JSON string is iterated character by character.
   - Elements not in R are skipped, with a DEV-only warning (`:50–55`). That covers unknown ids, non-string elements, Features-hidden ids and `settings`.
   - A repeated id is pushed twice: `seenIds` only gates the append step (`:44–49`, `:58–61`), so the same module renders twice with a duplicate React key (`:157`).
3. **Where a throw lands.** AppRail renders in `Shell` (`Shell.tsx:66–73`), in `AppInner` (`App.tsx:199–212`), under the `app` route, whose `errorElement` is `<RouteErrorBoundary scope="app" />` (`router.tsx:41–43`). Settings and every module route are its children (`:44–75`). The boundary renders only "Route Error (app)" and the message (`RouteErrorBoundary.tsx:27–32`), with no repair action, and the bytes persist across reloads.
4. **Drag handling (HTML5 drag and drop).**
   - `dragstart` (`:75–83`) sets `effectAllowed = "move"`, tries `setData("text/plain", id)` and stores `dragId`, which adds the `dragging` class (`:154`, `:163`).
   - `dragover` on a rail button (`:85–90`) calls `preventDefault()`. If a different button is under the pointer, it computes `reorderArray(validOrder, dragId, id)` (`dnd.ts:16–29`) and calls `setPrefOrder` at once. Every order-changing `dragover` is therefore a synchronous storage write.
   - There is no `drop` handler. `dragend` (`:92`) only clears `dragId`. Nothing reverts a cancelled drag.
   - While `dragId` is set, a click on a rail button does not navigate (`:171–173`).
5. **The write.** `setPref` compares before writing (`storage.ts:180–202`) and then calls `localStorage.setItem` (`:204–222`): no Web Lock, no expected baseline and no readback. It returns `false` on failure, and `usePref` updates its state only on success (`usePref.ts:141–147`). A failed write therefore changes nothing on screen, and no feedback exists (N2).
6. **Pruning.** The written array is `validOrder`, the visible reconcile result. A Features-hidden module, a non-rail id and an unknown id all disappear from the stored array at the first order-changing `dragover`. A module missing from the stored array is appended after the stored ids in R order (`:57–62`), so a module hidden during a drag comes back last when it is re-enabled. This is the behaviour that R-1 replaces.
7. **Absent versus empty.** Absent bytes display the 12 defaults and then `bookkeeping` and `metrics`. `[]` displays all 14 modules in R order, with `ai` first. Both render without error (`AppRail.test.tsx` N3).
8. **Cross-document.** Legacy `usePref` follows `storage` events (`usePref.ts:155–196`), so a committed order in another document updates the rail live; a `key: null` event resets it to the default (`:161–165`). Same-tab writes publish on the same-tab bus (`storage.ts:224–226`).
9. **Features interplay.** A Features toggle changes R through `useFeaturePrefs` (`App.tsx:141–145`); the rail re-renders without writing. Only a drag writes.
10. **No protection or recovery.** There is no draft, Retry, Discard, Export, source alert, unload warning, sign-out step or status anywhere for this key. The rail is part of the `/app` layout, so it has no route of its own and no departure guard. Its module buttons navigate through the router, where another caller's coordinator may hold them (Features host rows b, m, n).
11. **App lifetime.** `AccountDataGate` keys the whole App subtree, Shell included, by scope (`AccountDataGate.tsx:99`), so App state remounts on every scope change (REL-09), as in Appearance contract §3 item 10.
12. **Voluntary sign-out.** The only voluntary sign-out entry is AppRail's AvatarMenu (`AppRail.tsx:138–144`) → `SignOutConfirmDialog` → `onSignOut`, which is `handleSignOut` (`App.tsx:155–184`, passed at `:209`). Both branches await the Appearance step and then `requestSettingsDeparture("sign-out")` (`:161–162`, `:171–172`). The other `signOut` call is the forced account-deletion bridge (`AppProviders.tsx:17–24`).
13. **Presentation.**
    - Rail CSS lives in protected tokens (`layout.css:40–209`). From 641 to 767 px and at 640 px and below the rail becomes a horizontal bottom bar, `.rail-items` scrolls horizontally, and `.rail-avatar-wrap` and `.rail-bottom`, which holds the pet toggle, are hidden (`layout.css:1943–2030`, `:1994–1997`, `:2093–2160`, `:2144–2147`). So sign-out and the pet toggle are reachable only at 768 px and above. `.rail-btn.dragging` is `opacity: 0.4; transform: scale(0.9)` (`:74`).
    - The shell package has no stylesheet.
    - `.topbar-controls` renders `premiumBadge`, then `appearanceStatus`, then `.topbar-pref` (`Topbar.tsx:112–117`).
    - DesktopPet geometry is as in Appearance contract r3 §3 item 12; `xai-web-pet` is unchanged since (Appearance acceptance C4). The default box's left edge is `innerWidth − 108` at every width.
    - Pre-existing a11y items (Appearance acceptance §9 item 2): the first bottom-rail item's focus ring is clipped by the rail scroller at 375 px; no keyboard reorder exists.
14. **Existing tests that encode current behaviour** (dispositions in §11).
    - `AppRail.test.tsx`: AR1–AR11, AR-SO1/2, P1, P3, N1, N3 cover rendering, order restore, filtering, clicks, the pet button and sign-out wiring. None asserts a drag write; AR5 asserts only the `dragging` class. `dnd.test.ts` covers `reorderArray`.
    - `Topbar.test.tsx` TP-STATUS-1/2 (`:265–290`) pin the Appearance slot position.
    - Accepted evidence that drags: Features Sol `downstream` case 014 fires `dragStart`, `dragOver` and `dragEnd` with no `drop` (`downstream.test.tsx:499–516`); the Features native downstream and native before runners drag through CDP with a `drop` (`verify-native-downstream.mjs:466–483`, `verify-native-before.mjs:762–774`). Every one of them drags while all 14 modules are visible.
    - No test or oracle seeds a non-array value.
15. **Accepted async interface to reuse** (as Appearance contract §3 item 14 and Features contract §3 item 11).
    - `usePrefAutosaveAsync("xai_rail_order", { validate })` takes the registered path and composes `prefCodecValidator("json", key)` with the caller's validator (`usePrefAutosaveAsync.ts:51–58`, `:37–44`).
    - `readSnapshot` classifies the source as absent, valid, invalid or unavailable (`usePrefAsync.ts:61–68`).
    - The `json` codec writes `JSON.stringify(value)`, which reproduces today's bytes.
    - The same-field queue coalesces absolute sets at its tail (`:229–243`); invalid values are refused before enqueue (`:245–260`); a failed request holds the queue and keeps its kind and token, and Retry re-runs it once (`:195–202`, `:262–279`).
    - Absolute sets carry the expected baseline (`:177`). Invalid or unavailable sources are refused (`prefMutation.ts:198`). An uncertain readback issues a reconciliation grant (`:233–237`). Commits publish on the same-tab bus (`:239`).
    - External changes are projected: an idle binding follows them, and a dirty, error or conflict binding becomes `conflict` (`usePrefAsync.ts:142–167`).

## 4. Decisions (R-1 is the product owner's; A1–A11 await controller confirmation)

**R-1 — Hidden modules keep their stored positions (SET-03, product-owner decision of 2026-10-06).**

*Decision.* The product owner chose the recommended option (i) of selection memo §7.3 (control plane `eabd47f`, row R-1): "拖动只调整可见模块的顺序，被关闭模块保留原位置，重新开启后回到原位". A rail drag reorders only the visible modules. Modules hidden by Features keep their stored positions, and when re-enabled they return to their previous place. This is not an assumption.
- It replaces today's pruning (§3 item 6) and decides only this part of SET-03 (§17).
- A2 states how this caller realizes it; the realization is the controller's to confirm.

**A1 — Scope: the rail-order caller with host- and shell-inclusive protection.**
- The unit includes `AppRail.tsx`, the Topbar status slot (`Topbar.tsx`, `Shell.tsx`, shell `types.ts`), shell `index.ts`, a new shell stylesheet, at most four new shell internal modules, and `apps/web/src/App.tsx`, exactly as §11 lists them.
- The departure coordinator, router, `settingsDeparture`, registrations, providers, storage, tokens, the Appearance and Features packages, the pet, CmdK and every other package stay protected.
- Affected-caller reruns are E15, E17, E23 and E24 (§13, §15). Clean-state chrome invariance (§10 item 6) bounds the re-verification of other callers' visual evidence.

**A2 — R-1 realization: an index-slot merge (with an escalation note).**
- **Terms.**
  - *S*, the base stored order at drop time: the current draft's value if a rail draft exists; else the decoded valid bytes; else `DEFAULT_RAIL_ORDER` (absent, invalid or unavailable source).
  - *R*, the visible set: the ids of `useWebModuleRegistry()` at drop time.
  - *D(S, R)*, the display order of §2.
  - *P*, the new visible order produced by the drag: a permutation of D(S, R).
- **Merge** `S' = merge(S, R, P)`: walk S from index 0. An element in R is replaced by the next element of P; an element not in R stays where it is. When the walk ends, append the remaining elements of P in order. If P is not a permutation of D(S, R), there is no merge and no write (§6 item 7).
- **Required properties** (oracles assert each):
  - **P1** `filter(S', R)` equals P: the visible order is exactly what the user dropped.
  - **P2** every index i < |S| with S[i] ∉ R keeps S'[i] = S[i]: hidden, non-rail and unknown ids keep their stored positions.
  - **P3** S' is in-domain (distinct strings), and the set of S' is the union of S and R: nothing is lost or duplicated.
  - **P4** |S'| = |S| + |R \ S|.
  - **P5** after a module m hidden at drop time is re-enabled, it displays at its stored index i whenever every element of S' before i is visible. In particular, when m was the only hidden module, it returns to exactly its previous place.
  - **P6** when every element of S is in R, S' equals P. That is byte-for-byte today's write for every accepted oracle that drags with all modules visible (§13).
  - **P7** for absent bytes S is the 12 defaults, so a hidden default module keeps its default index.
- **Why index slots.** "保留原位置" and "keep their stored positions" read most literally as the position in the stored array. Slot filling keeps every hidden id's index unchanged, needs only R, which AppRail already has, and changes nothing when nothing is hidden (P6).
- **One rule for every non-visible id.** AppRail receives only the Features-filtered registry (`App.tsx:141–145`, `registry.tsx:77–96`), so it cannot tell a Features-hidden id from `settings` or from an id unknown to this build. Treating every non-visible id as an opaque slot needs no new shell input, and it never destroys bytes this build does not understand (REL-07). Pruning only unknown ids would need the unfiltered registry, a new `WebShellProvider` input on the protected `registry.tsx`.
- **Escalation note.** Another reading anchors a hidden module after its former neighbour rather than at its index. If the controller reads R-1 that way, the merge and the P2/P5 oracles change, the question goes to the product owner and a revision r2 is required. See §19 question 1.

**A3 — One App-scoped rail-order controller in the shell package (selection R-2; mirrors Appearance A3).**
- The shell package owns the key (registry owner `xai-web-shell`). It exports, additively, `RailOrderProvider`, `useRailOrderController` and `RailOrderStatus`, with their types.
- App creates exactly one controller in `AppInner`, inside `AccountStorageGate`, provides it around `Shell`, passes `<RailOrderStatus />` through the new Topbar slot and awaits its sign-out step (A6).
- The controller owns the binding, the draft and operation model, Retry, Discard, Reload, Export, the unload warning and the sign-out step. AppRail and the Topbar status are its views.
- **Standalone use.** An AppRail rendered without a provider creates its own controller, following the `AppearancePane` pattern (`AppearancePane.tsx:46–57`). That covers the unit tests and the frozen F1 hosts that mount `Shell` without App (§13). In the production App there must never be a second controller.
- The controller takes the display language from App (the Appearance controller's `values.lang`) for its copy; a standalone AppRail uses `useWebShell().lang`.
- **Alternative considered.** A `Shell`-internal controller, with the sign-out step wrapped around `onSignOut` inside `Shell`, would leave `App.tsx` untouched. It was not chosen: it splits the voluntary sign-out sequence across two files, runs before App's coordinator-capture check, and departs from the memo's "App sign-out step". See §19 question 6.

**A4 — Persistence path: the registered binding, absolute sets only.**
- `usePrefAutosaveAsync("xai_rail_order", { validate: isRailOrder })` on the registered path, with the A5 validator. No registry, ownership, codec, default or lifecycle change.
- Every drop admits one absolute set intent whose value is the A2 merge, computed when the drop is admitted. No functional updater: functional updaters lose the expected baseline and the uncertainty grant (`usePrefAsync.ts:177`, `:269–272`).
- There is no rail-order reset in this caller, and `reset` is never called (§17).

**A5 — Strict domain; refuse, never repair (mirrors Appearance A6 and Clock E1-5).**
- **Valid:** a JSON array whose every element is a string, with no string twice. `[]` is valid (§3 item 7). Unknown ids, `settings` and empty strings are valid; they are ignored for display and kept by merges (A2).
- **Invalid** (source `invalid`): every other decoded value, including the JSON literal `null`, objects, numbers, booleans, strings, arrays with a non-string element, arrays with a repeated string, and unparsable bytes. A throwing `getItem` makes the source `unavailable`.
- **Behaviour for an invalid or unavailable source:**
  - the rail displays D(`DEFAULT_RAIL_ORDER`, R), exactly as for absent bytes, and nothing anywhere throws;
  - the Topbar rail status shows the source message with Reload only (A8);
  - mount, Reload and Discard never rewrite, purge or normalize the bytes;
  - a drag over such a source is actual work: a set intent that the engine refuses (`prefMutation.ts:198`), kept as a failed draft with Retry (refused again), Discard and Export. This is the retained REL-07 limitation, as for Appearance (A6 there). The bytes stay exportable through Settings → Account → device recovery export (§2 row 3).
- Positions that an earlier product version already pruned from the bytes cannot be restored; there is no migration.

**A6 — Route-independent protection (selection R-2 option (i)).**
- Rail drafts live as long as App does: they survive route changes, Settings pane switches, the Topbar popover and AppRail re-renders.
- **No route guard.** Rail drafts never hold navigation.
- **A Topbar status** through a new optional slot `railOrderStatus?: ReactNode` on `ShellProps` and `TopbarProps`. The Topbar renders it immediately after the `appearanceStatus` slot and before `.topbar-pref`. Generalising `appearanceStatus` (option (ii)) would edit the accepted Appearance surface. A rail-local status (option (iii)) has no room for recovery actions in the narrow rail, which below 768 px is a bottom bar.
- **An App-level `beforeunload`** while a rail draft exists.
- **A sign-out step:** `handleSignOut` awaits the controller's `confirmSignOut()` immediately **before** the Appearance step in both branches; in the coordinator branch that is after the capture check (`App.tsx:159–160`). The accepted Appearance step therefore stays immediately before each `requestSettingsDeparture("sign-out")` (Appearance contract §7 item 4; acceptance D6).
- Forced transitions are never blocked.

**A7 — Write timing: one write per drop (selection R-3 option (i), with an escalation note).**
- During a drag the rail reorders live, in memory only. Exactly one set intent is admitted at a `drop` inside `.rail-items`, and only if the order changed. Every `dragenter`, `dragover`, `dragleave` and `dragend` makes zero storage attempts. A drag that ends without a drop is cancelled: the preview reverts with zero writes. §6 has the details.
- **Why not on every `dragover`** (option (ii), letting the engine coalesce): each order-changing `dragover` would admit an intent, take the per-key lock and possibly write, and a held lock would turn one gesture into several queued intents. The display is the same either way.
- **Why `drop` and not `dragend`.** `drop` fires only over a target that accepted the drag, which is the rail. Committing at `dragend` would need `dataTransfer.dropEffect` to tell a cancel apart. It would also commit when the icon is dropped on any other drop-accepting element, such as a text field.
- **Escalation note (UX consequence).** Today a release outside the rail keeps the previewed order, because it was already written on `dragover`. Under A7 that release, and Escape, revert the preview. The controller confirms this as a consequence of R-3; if it reads it as a product change, it goes to the product owner. See §19 question 4.
- **Cross-caller consequence:** the accepted Features Sol `downstream` case 014 drags without a `drop` event, so its correction is pre-registered (A11, §13).

**A8 — Feedback and export surface.**
- **Status render condition.** The `RailOrderStatus` node renders if and only if:
  - (a) the current rail draft has been settled unsuccessful at least once since it was admitted; it stays rendered while a Retry of that same draft is pending; or
  - (b) no draft exists and the source is invalid or unavailable.

  Otherwise it renders nothing (no DOM node). A first attempt that is only pending shows no status; the unload warning and the sign-out step protect it, as for Appearance (§7 item 2 there).
- **Why it differs from Appearance.** Rule (a) keeps the status, and the panel inside it, mounted while a Retry started from that panel is pending; otherwise the control would vanish under the user's pointer. Rule (b) exists because the rail has no settings pane to carry a source alert.
- **"Settled unsuccessful"** is Appearance's definition (A2 terms there): no operation in flight or runnable, and the queue held by a failed request. The failure may be quota, a throwing `getItem` or `setItem`, a missing or rejected Web Lock, conflict, readback uncertainty, or an invalid or unavailable source. A latest intent queued behind a failed predecessor counts.
- **The status is a disclosure button** that opens a non-modal panel holding the message and the actions: Retry, Discard and Export for a draft; Reload only for a source issue (§7 item 2).
- **No success line.** The status disappearing is the success signal, as for the Appearance Topbar status.
- **Export** is memory-only, uses the set envelope and is offered while a draft exists (§8).

**A9 — Test dispositions** exactly as §11.

**A10 — R-PET and other App-level overlays** exactly as §9: gated runs with the pet hidden through the product's own rail toggle, and a pet-on run that blocks only on the controls this caller adds.

**A11 — Pre-registered oracle correction C-RD1 and harness copies (lessons F-FD1, OE-1/OE-2).**
- **C-RD1.** A7 makes the accepted Features Sol `downstream` case 014 a predictable PRECONDITION failure at the fixed SHA, because its drag has no `drop`. Sol therefore freezes C-RD1 in E1, before Terra. C-RD1 is the C-FD1 copy (`../web-appearance-recovery-final/diagnostics/features-downstream.corrected.test.tsx`, `7bb5ad3c…`) plus exactly one added line, `fireEvent.drop(buttons[2]!, { dataTransfer: transfer });`, before that case's `fireEvent.dragEnd`. Its business assertion, the persisted order derived from the stored custom order, is unchanged and holds under P6.
- **Staging runner.** A copy of `../web-appearance-recovery-final/diag-features-sol-corrected.mjs` (`cfe596be…`) that changes only the staged file and the log path.
- **How it judges.** C-RD1 judges case 014 at the fixed SHA. The frozen original and the C-FD1 copy run beside it and are recorded as they fall (§13). The frozen oracles stay unchanged.
- **Harness copies.** Where a frozen runner refuses the new SHA only through a caller-bound product-delta precondition, the verifier uses a copy that changes only that precondition, as the Appearance E25 copy did, and records the diff. Any other change is forbidden.

## 5. The rail-order field: edit, source and operation requirements

**Interface.**
- One binding (A4), with the strict validator of A5 and a stable hook order.
- Preserve the shared queue and coalescing, result semantics, the exact baseline and readback, and uncertainty grants.
- Do not add:
  - raw storage calls or a caller storage preflight;
  - a forced rebase or a manual lock layer;
  - any `StorageEvent` dispatch or event-bus emission;
  - any change to legacy `usePref`/`setPref` behaviour for other callers;
  - any registry, ownership, codec, default or lifecycle change.

1. **Zero-write mounts.** None of the following makes a set or remove attempt on `xai_rail_order` or on any other key:
   - loading the production App on any route, and reloading;
   - an AppRail re-render, whether caused by a Features toggle, a rail-position change or a language change;
   - opening and closing the Topbar popover or the rail status panel.

   Absent bytes display the default.
2. **Source truth.** Each value below makes the source *invalid*, and a throwing `getItem` makes it *unavailable*.

   | Class | Raw bytes of `xai_rail_order` | Before hypothesis |
   | --- | --- | --- |
   | Not iterable | `{}`, `{"tasks":1}`, `1`, `0`, `-1`, `true`, `false` | H1 |
   | A string | `"tasks"` | H7 |
   | A non-string element | `[1]`, `["tasks",2]`, `[null]`, `[["tasks"]]` | H7 |
   | A repeated string | `["tasks","tasks"]`, `["board","tasks","board"]` | H8 |
   | `null` literal or unparsable | `null`, `[tasks`, the empty string | H7 |
   | Unreadable | `getItem("xai_rail_order")` throws | H10 |

   For each:
   - the rail displays D(`DEFAULT_RAIL_ORDER`, R) and **nothing throws anywhere**: App renders and every `/app` route works, Settings included;
   - the Topbar rail status shows the source message with Reload only (A8) and makes no success claim;
   - no draft, export entry or unload warning is created;
   - mount, Reload and Discard never rewrite, purge or normalize the bytes;
   - a valid drag over the source is actual work: a failed draft with Retry, Discard, Export, the status and the unload warning, never a silent overwrite.
3. **Identity and latest authority.**
   - A drop that changes the order establishes the field's draft object before it is enqueued. The rail displays the draft at once, even while the per-key lock is held, and stays operable.
   - A newer drop supersedes. Completion authority belongs to the exact draft object, never to value equality, `meta.status` or an earlier result. Only the matching latest success clears the draft.
   - A drop whose merged value equals the committed bytes, possible only over a failed draft, is still admitted and completes through the engine's verified no-op (`prefMutation.ts:228–230`).
4. **Failures keep the latest choice, displayed.**
   - Covered failures: quota, a throwing `getItem` or `setItem`, a missing or rejected Web Lock, conflict, readback uncertainty, and an invalid or unavailable source.
   - None may produce an unhandled rejection or a success claim. A Retry while the field is pending is inert.
   - Orderings to cover:
     - the predecessor succeeds and the latest fails;
     - the predecessor fails while the latest stays queued, and Retry advances the predecessor without acknowledging the latest;
     - repeated failed-predecessor recovery;
     - a later failure of the latest.
5. **Uncertainty and conflict.**
   - An unchanged uncertain Retry keeps its grant across temporarily denied reads or locks, and it reconciles with exactly one total write whose readback matches.
   - An external replacement or removal stays a preserved conflict, including restoration of the original bytes. Repeated Retry never gains authority to overwrite.
6. **Truthful status.** The status renders only per A8, and nothing in the rail or the Topbar ever claims success.
7. **Recovery actions** (in the panel, §7 item 2).
   - **Retry** re-attempts the held failed request exactly once, with its own kind and token (`usePrefAsync.ts:262–276`). It is inert while the field is pending.
   - **Discard** detaches the draft before the safe `meta.reload()`, with zero set or remove attempts. The rail returns to the committed order.
   - **Reload** exists only for a source issue and refuses, at invocation time, to erase an actual draft.
   - **Export** follows §8.
   - A late completion after Discard, Reload or unmount never revives discarded state or clears newer work.
8. **R-1 merge.** P1–P7 of A2 hold at the Sol layer, both for the pure helper and in the production App, and natively.
9. **Features interplay.**
   - A change of R makes zero attempts on `xai_rail_order`. That covers a Features toggle's success, failure, reset or Retry, and a toggle committed in a second document.
   - The rail then displays D(S, R) for the current S and R.
   - Hidden ids never leave the stored array (P2, P3).
   - A drag in progress when R changes follows §6 item 7.

**Stable selectors** (fixed now so that oracles can be frozen):
- the rail buttons, `.app-rail .rail-items .rail-btn`, by their existing accessible names;
- the Topbar status button: `data-testid="rail-order-status"`, with `aria-expanded` and `aria-controls="rail-order-panel"`;
- the panel: `id="rail-order-panel"`, `data-testid="rail-order-panel"`, `role="dialog"`, with an accessible name;
- the panel message: `data-testid="rail-order-message"`;
- the actions: `data-testid="rail-order-retry"`, `"rail-order-discard"`, `"rail-order-export"` and `"rail-order-reload"`.

**Normative wording.** It is fixed now so that oracles can be frozen beforehand.

| Element | EN / ZH wording |
| --- | --- |
| Status accessible name, draft | `Sidebar order not saved. Review it.` / `侧栏顺序未保存，点击查看。` |
| Status accessible name, source issue | `Saved sidebar order is unavailable. Review it.` / `已保存的侧栏顺序不可用，点击查看。` |
| Status visible text, from 768 px; icon only at 767 px and below (the Appearance breakpoint erratum) | `Order not saved` / `顺序未保存`; `Order unavailable` / `顺序不可用` |
| Panel accessible name | `Sidebar order` / `侧栏顺序` |
| Messages | `Sidebar order is saving.` / `侧栏顺序正在保存。`; `Sidebar order was not saved.` / `侧栏顺序未保存。`; `Saved sidebar order is unavailable. Reload it; this is not a new unsaved change.` / `已保存的侧栏顺序不可用。请重新读取；这不是新的未保存更改。`; `Export failed. Please retry.` / `导出失败，请重试。` |
| Actions: visible label, then accessible name | `Retry` / `重试`, `Retry sidebar order` / `重试 侧栏顺序`; `Discard` / `放弃`, `Discard sidebar order change` / `放弃 侧栏顺序更改`; `Export` / `导出`, `Export sidebar order draft` / `导出侧栏顺序草稿`; `Reload` / `重新读取`, `Reload sidebar order` / `重新读取 侧栏顺序` |
| Sign-out confirmation (`window.confirm`) | `Your sidebar order change is not saved. Sign out and discard it?` / `侧栏顺序更改尚未保存。仍要退出并放弃这项更改吗？` |

All wording appears in the language currently displayed. "Sidebar" follows the accepted Appearance label "Sidebar position" / "侧栏位置".

## 6. Drag interaction and write timing (R-3, A7)

1. **`dragstart`** on a rail button X keeps today's effects: `effectAllowed`, `setData` and the `dragging` class. The gesture captures D0, the order displayed at that moment, and starts a preview P = D0. Zero storage attempts.
2. **`dragenter`/`dragover`** on a rail button Y other than X calls `preventDefault()` and sets P = `reorderArray(P, X, Y)` (`dnd.ts` unchanged); the rail displays P. Zero storage attempts. Over a gap of `.rail-items` it calls `preventDefault()` only, so a drop there is accepted.
3. **`drop`** anywhere inside `.rail-items`, on any rail button including X or on a gap, calls `preventDefault()`. If P differs from D0 and P is a permutation of D(S, R) for the current S and R, it admits exactly one set intent with `merge(S, R, P)`. Otherwise it makes zero attempts. The identity of the drop target never matters.
4. **`dragend` without a drop** in the same gesture cancels the gesture: Escape, a release outside `.rail-items`, a drop accepted by any other element such as a text field, or a cancelled drag. The preview is discarded, the rail displays the committed or draft order again, and zero attempts are made.
5. **One gesture admits at most one intent.** A `drop` not preceded by a rail-button `dragstart` in this document, for example an external file or text drag, is ignored with zero attempts.
6. **Clicks.** Click suppression while dragging (`AppRail.tsx:171–173`) and the `dragging` class stay. After the gesture ends, clicks navigate as before.
7. **Live changes during a drag.** If R changes, or the committed or draft order changes, before the drop, the drop commits only if P is still a permutation of D(S, R) at drop time. Otherwise the preview is discarded with zero attempts. The merge always uses S and R at drop time.
8. **Trusted input (native).**
   - Drags are driven only through CDP: `Input.setInterceptDrags`, then `Input.dispatchMouseEvent` (press and move on the source), then `Input.dispatchDragEvent` (`dragEnter`, `dragOver`, and `drop` or `dragCancel`). This is the pattern of `../web-features-recovery-native/verify-native-downstream.mjs:466–483`. A two-step drag sends `dragOver` over two different targets.
   - A passive capture-phase recorder records `dragstart`, `dragover`, `drop` and `dragend` with `isTrusted`; it never calls `preventDefault` or `stopPropagation`. Each drag case requires every recorded drag event to be trusted, and the source and target buttons to be centre-hit-tested first.
   - No page-context synthetic `DragEvent` is used in native evidence.
9. **Unchanged payload.** The `text/plain` payload set at `dragstart` stays (`AppRail.tsx:77–81`). Dropping a rail icon on an editable field outside the rail inserts the id there; that is pre-existing browser behaviour and is tested only by host row r's zero-write assertion.

## 7. App lifetime and protection (R-2, A6)

**No account machinery.** The controller never reads, writes or acquires an account physical key (`xai:account:v1:*`, `xai:demo:v1:*`), an account lifecycle lock, a generation marker, a tombstone or recovery admission. Spies on lock names and keys prove this, under the F-B002 rule (§12). An unrelated held account lifecycle lock must not delay a rail write.

**Lifetime.**
- **Inside one App mount** a draft and its operations survive route changes, Settings pane switches, the Topbar popover, the rail status panel and a held per-key lock.
- **Sol layer.** With the controller mounted under a real `accountScope` without the gate, a draft and a held operation survive A→B, A→locked, locked→A and same-account epoch changes. The binding is scope-independent for device keys (`usePrefAsync.ts:98`).
- **Production App.** A scope change remounts the App subtree (§3 item 11), so an in-memory draft is lost. After the remount the rail displays the committed order with no runtime error. This is the retained REL-09 limitation (host row n).

**Protection.**
1. **No route guard.** Rail drafts never hold the Settings sidebar, AppRail clicks, Back, Forward, or relative and programmatic navigation.
2. **Topbar status and panel.**
   - **Placement.** The slot node renders immediately after the `appearanceStatus` slot and before `.topbar-pref`, only per A8. When rendered, it is one root element inside `.topbar-controls` that contains the status button and, while open, the panel. Otherwise there is no DOM node.
   - **The button.** A native `<button type="button">`, at least 44×44 at every width, with `aria-expanded`, `aria-controls` and the accessible name of its state (§5). Its visible text shows from 768 px; at 767 px and below it is icon only.
   - **Activation** by pointer, Enter or Space toggles the panel exactly once. Focus stays on the button, and no storage attempt is made.
   - **The panel.** `role="dialog"`, non-modal and labelled. It follows the button in DOM order, so Tab reaches its actions next.
     - It closes on Escape, with focus returned to the status button.
     - It also closes on a `mousedown` outside the status root. Focus is not moved, unless it was inside the panel; then it goes to the status button.
   - **Panel content by state:**
     - a draft settled unsuccessful: the "was not saved" message (`role="alert"`), then Retry, Discard and Export;
     - a Retry of that draft pending: the "is saving" message (`role="status"`), with Retry rendered but inert, Discard and Export;
     - a source issue: the "unavailable" message (`role="alert"`) and Reload only;
     - an export failure: its line, shown while a draft exists and cleared by the next panel action.
   - **Unmount focus.** When the status unmounts while it contains focus (a verified success, Discard, a Reload repair, or supersession by a new drag), focus moves to `.topbar-pref-trigger`, never to `<body>`.
   - **Scope.** The status never navigates and never retries by itself. It touches storage only through its actions.
3. **Unload.** The controller registers a `beforeunload` listener only while a rail draft exists, pending or unresolved. The handler warns synchronously and makes zero storage attempts. It is removed when the draft clears and on unmount. There is no warning in a clean or source-only state. This is a cancelable warning, not crash durability.
4. **Voluntary sign-out step** (A6).
   - **Placement.** In the coordinator branch, after the capture check (`App.tsx:159–160`) and immediately before the Appearance step (`:161`). In the fallback branch, immediately before the Appearance step (`:171`).
   - **No rail draft:** it resolves `true` with zero `window.confirm` calls and zero storage attempts.
   - **A rail draft,** pending or unresolved: one `window.confirm` with the §5 text.
     - **Cancel** resolves `false`. The draft, the status and the warning are kept, nothing is invalidated, there are zero history mutations, and neither the Appearance step nor any coordinator is asked.
     - **OK** discards the draft with zero set or remove attempts, removes the unload listener and resolves `true`. The existing sequence then continues unchanged: the Appearance step; the Settings, Pomodoro or Dashboard coordinator step; the auth coordinator; identity invalidation; the redirect.
   - **Both a rail and an Appearance draft:** exactly two confirms, rail first. OK and then Cancel resolves `false` with the rail draft already discarded and the Appearance draft kept. This is disclosed; it is the same class as Appearance's OK followed by a coordinator Stay (Appearance contract §9 row g).
   - The existing re-checks after the awaits (`App.tsx:163–164`, `:173`) stay and still run after every step.
5. **Forced transitions** are never blocked: a scope change from another document, an auth loss, and the account-deletion bridge (`AppProviders.tsx:17–24`).
6. **Unmount** removes the listener, subscriptions and callbacks. Old callbacks refuse, based on live disposal state. Committed writes are not undone.

## 8. Sparse memory export

**Format.** The filename is `rail-order-draft.json`. It uses the set/reset envelope of the accepted callers, of which only `set` occurs here:

```json
{"version":1,"kind":"rail-order-draft","changes":{"device":{"railOrder":{"operation":"set","value":["calendar","board","tasks","dashboard"]}}}}
```

- The value is the draft's full stored order, the A2 merge, hidden and unknown ids included. It is exactly what the write would store.
- Never include an account bucket, account ID, physical key, timestamp, committed or default value, or a source-only state.
- Export renders only while a draft exists, so there is never an empty download.
- This is a recovery file. It is not an import feature and not proof of saving.

**Behaviour.**
- **Memory only.** Export reads the captured draft and makes zero `getItem`, `setItem` or `removeItem` attempts on any key, including while every Storage operation throws and while the write is held.
- **Liveness rechecks.** Recheck that the controller is live and not disposed before setup, after Blob creation, after URL creation and after append, immediately before the click. Unmount during setup cancels the click.
- **Failure handling.** A Blob, URL, append or click error shows the export-failure line and keeps the draft, the token, the status and the unload warning. The anchor is removed and the URL revoked on a best-effort basis, including after a late setup failure.
- **No side effects.** Export never saves, retries or discards.

**Native disk evidence** (actual Chrome downloads, parsed from disk and compared with deep equality to the whole expected envelope). Required shapes:
1. a failed drop with all modules visible;
2. a failed drop with Boards hidden by Features, where the value keeps `board` at its stored index;
3. a failed drop over malformed bytes (`{}`), where the value is the merge over `DEFAULT_RAIL_ORDER`;
4. an export while a Retry is held behind the real `prefMutationLockName("xai_rail_order")` lock;
5. an export after navigating to another route and back (App lifetime).

Every export runs under total storage denial and must show:
- attempt-level counters, recorded before delegating to Storage, at zero for reads, writes and removes;
- exactly one object URL created, and that same URL revoked;
- the anchor removed;
- afterwards, the unload warning still active and the status still shown.

One native setup failure (`createObjectURL` or the click throwing) must meet the same assertions and show the localized error. Unmount during setup may remain Sol evidence (jsdom with real storage, hook and engine).

## 9. Actual host, keyboard and responsive presentation

**Composition.**
- Every host, native and visual row runs in the production `App` composition: the `apps/web/src/main.tsx` module order and the production router, `AccountStorageGate`, `AccountDataGate`, Shell (AppRail, Topbar), DesktopPet, CmdK, ComposedSettings with the coordinator and `settingsDeparture`, the real Appearance and Features packages, and the real storage hooks, engine, registry and codecs.
- The only synthetic input is the auth session. Bundle provenance must show that every module comes from the archive under test (pattern: `../web-features-recovery-native/native-app.tsx`).

**Host matrix** (native Chrome in E9, E10 and E12; parent jsdom covers rows a, d, g–l, o and q in E3 and E8):

| | Scenario | Required behaviour |
| --- | --- | --- |
| a | Clean load | On `/app/tasks`, `/app/settings/appearance` and `/app/dashboard`: zero writes, the committed or default order displayed, no status, no unload warning |
| b | Successful trusted drag | Exactly one `setItem("xai_rail_order")` attempt, at the drop, with the A2 merge bytes; the rail shows the dropped order; no status |
| c | R-1 end to end | Seed a custom order with `board` at index 2. Turn Boards off through the real Features pane by trusted input, then drag. The bytes keep `board` at index 2 and their visible filter equals the dropped order. Turn Boards on: it displays at index 2 |
| d | Failed drag | With a quota fault armed: the dropped order stays displayed, and after settlement the status appears on every route. With the fault still armed, the panel's Retry fails again with exactly one attempt and focus stays on Retry. After the fault is cleared, Retry makes exactly one write and removes the status, and focus moves to `.topbar-pref-trigger` |
| e | Held drag | While the write is held behind the real lock: the dropped order is displayed, there is no status, and the rail stays operable. After release: exactly one write |
| f | A second drag while the first is held | The latest wins. Each drop makes exactly one per-key lock request. The final bytes are the second merge, and the first completion never acknowledges the second |
| g | Navigation with a failed draft | A rail click, the Settings sidebar, Back and Forward: not held. The draft stays intact and the status shows on every route. `{pathname,key,state}` equals an ordinary navigation with deep equality |
| h | Sign-out without a rail draft | Zero rail confirms. The outcome equals `419e56d` in both auth branches; with an Appearance draft only, the confirm list is exactly the Appearance text |
| i | Sign-out with a failed rail draft | One confirm with the rail text. Cancel resolves `false` with zero history mutations and identity intact, and neither the Appearance step nor a coordinator is asked. OK makes zero writes and the sequence continues |
| j | Sign-out with rail and Appearance drafts | The confirm list is exactly [rail text, Appearance text]. OK and OK proceeds. OK and Cancel resolves `false`, with the rail draft discarded (zero writes) and the Appearance draft kept |
| k | Sign-out with a rail draft and a More draft held by the Settings coordinator | Rail OK, then the coordinator dialog appears exactly as at `419e56d`, and Stay resolves `false` |
| l | `beforeunload` | Warns only while a rail draft exists, pending or failed; zero storage attempts in the handler; no warning when clean or source-only |
| m | Cross-document | An idle second document's rail updates live. A drafted rail in the second document becomes a preserved conflict: Retry is refused again, and Discard adopts the committed order |
| n | Forced scope change | Driven through the identity channel from a second document (`AccountStorageGate.tsx:8, 39`): remount, the committed order displayed, zero runtime errors, the draft lost (REL-09) |
| o | Malformed bytes at load | For every §5 item 2 value, on the three routes of row a: no route error, the default order displayed, the source status with Reload only, zero writes. A drag over it becomes a refused failed draft; Retry is refused again; Discard returns to the default display; the bytes are unchanged |
| p | External repair, then Reload | The status disappears and the committed order displays, with no write |
| q | Features toggles never write the order | Toggle success, toggle failure, Reset to defaults and Retry in the real Features pane make zero attempts on `xai_rail_order`; the rail display follows R |
| r | Cancelled drags | `dragCancel`, a drop outside the rail on the main content, and a drop on a text input: zero writes and the preview reverts |

History counters (`pushState`, `replaceState`, router commits) and runtime-error gates run on every row.

**Responsive presentation.** EN and ZH, at 375, 414, 768, 1024 and 1440. States to check:
- clean, with the default order and with a seeded custom order, in rail positions `left` and `top` at 768 px and above;
- a failed draft: the status visible, with the panel closed and open;
- a source issue: the status visible and the panel open;
- the Appearance status and the rail status both visible;
- at 1440 only: a drag in progress (the preview).

For each new control (the status button and every panel action), after scrolling it into view:
- a centre hit-test lands on the control, and it is not covered;
- it is contained horizontally within `.topbar` and the viewport, and the open panel is contained in the viewport;
- neither the document nor `.app-main` scrolls horizontally;
- with both statuses visible, every Topbar control stays inside the viewport and centre-hit, and every target this caller adds is at least 44×44. The 44×44 ruling covers only this caller's new or changed targets; the pre-existing 36 px Topbar heights above 1024 px are UX-05 items.

**DesktopPet and other App-level overlays (R-PET rule, A10).**
- **Gated runs.** All checks above run with the pet hidden through the product's own rail pet toggle, by a trusted, hit-tested click. The toggle is hidden at 767 px and below (§3 item 13), so narrow widths are reached by resizing after toggling at a wide width. The Appearance E14 harness note applies: avoid a stored `top` rail position across that round trip, or gate on an unzoomed visual viewport.
- **Pet-on run.** Every width and language is repeated with the pet on at its default position (`resolveDefaultPetPos`).
  - **Blocking** for every control this caller adds (the status button and the panel actions): the centre and four inset points land on the control, and the open panel's box does not intersect the pet box (the union of `.pet-wrap` and `.pet-swap-btn`).
  - **Recorded, not blocking:** occlusion of unchanged controls, including rail buttons in the bottom bar at 767 px and below, is appended under UX-03/SHELL-05 with before and after evidence.
  - The pet is neither hovered nor focused during probes, and this caller's code never moves, hides, restyles or repositions it.
  - Native drags run in the gated mode, with centre-hit-tested, uncovered source and target buttons.
- CmdK is closed in every run. The sign-out prompt is browser-native and is not hit-tested.

**Sizing and CSS.**
- New styles live only in the new shell stylesheet, under selectors that begin with `.rail-order-status`.
- No rule may target `.app-rail`, `.rail-items`, `.rail-btn`, `.topbar`, `.topbar-controls`, `.topbar-pref*` or any element selector.
- `plugin-web-tokens` CSS and every other stylesheet stay unchanged.
- **Visible focus.** The new controls must show a visible focus indicator. They must not use `.topbar-pref-option`, whose focus rule sets `outline: none` (F-APP-3, `layout.css:453–463`), nor any class whose tokens rule suppresses the ring. The CSS audit records each new control's computed outline at focus.
- Existing control geometry may not change in the clean state (§10 item 6).

**Screenshots,** all reviewed manually:
- the status and open panel at 375 and 1440, EN and ZH, for a failed draft and for a source issue;
- both statuses visible at 375 and 768, EN and ZH;
- the 768×1024 pet-on capture with the open panel, EN and ZH;
- the R-1 sequence at 1440 EN: Boards hidden, after the drop, after re-enabling;
- before captures at `419e56d`: the route error for `{}` and `1`, EN and ZH.

**Keyboard.**
- Trusted Tab reaches every control in DOM order with visible focus. In the Topbar the order is the premium badge, the Appearance status (if shown), the rail status (if shown), the panel actions (while open), then the appearance trigger.
- Enter and Space each toggle the panel exactly once and activate each action exactly once: no double firing, and no page scroll on Space.
- Escape closes the panel and returns focus to the status button.
- **Focus targets.**
  - After a keyboard Retry that succeeds, a Discard, or a Reload that repairs the source, the status unmounts and focus lands on `.topbar-pref-trigger`, never on `<body>`.
  - After a failed Retry, focus stays on Retry.
  - After Export, focus stays on Export.
- **Per-stop pixel focus visibility (lessons F-APP-1/F-APP-2).**
  - Use the frozen `pixelFocusWalk` oracle of `../web-appearance-recovery-native/` batch 48, unchanged: each stop is captured focused and again after focus has moved on, both as stable frames. The decoded pixels of the stop's own region must differ, and the computed outline must not be `none`.
  - Walks: clean; a failed draft with the panel closed; a failed draft with the panel open; and a source issue with the panel open. Each in light and dark, in EN at 1024×768 and ZH at 375×812.
  - Every stop this caller adds must pass. Every pre-existing stop must pass as at `419e56d`; weak stops are reported with their values. The first bottom-rail item at 375 px, clipped by the rail scroller, is the known weak stop recorded under UX-05.
- **No keyboard reorder** exists or is added (§17).
- **K-1.** No native runner sends `nativeVirtualKeyCode`. Every keyboard run has a passive key audit, and its precondition requires the key trace to contain exactly the runner's own presses (`../web-native-keyinput-k1/review-k1.md`).

## 10. Downstream consistency, crash safety, chrome invariance and isolation

**Nothing changes in:**
- the key, codec, default, registry entry, ownership or lifecycle;
- dual writes, aliases or migrations;
- the readers outside the unit: device recovery export, `useWebModuleRegistry`, the Features filter, CmdK and DesktopPet.

The rail reflects the **display order** (§2) of the draft, the committed bytes or the default. Raw readers see committed bytes only.

Required evidence:
1. **Exact bytes,** at the Sol layer and natively, for drops:
   - with all modules visible (P6), including over absent bytes and over `[]`;
   - with one and with three Features-hidden modules (P2, P5);
   - with an unknown id and with `settings` in the stored order;
   - over a failed draft back to the committed order (§5 item 3).
2. **Byte compatibility.** Bytes written by the fixed product decode identically through the unchanged legacy `getPref("xai_rail_order")`, still exported by storage, and appear verbatim in `exportDeviceRecoveryData()` in a new document. A value written by `419e56d` is read identically by the fixed product.
3. **Display truth.** `.app-rail .rail-items` button order equals D(draft or committed or default, R) after every operation, Discard and Reload, and the preview during a drag. Exactly one controller exists in production: a drop is reflected in the rail and the status in the same frame.
4. **Crash safety (SHELL-04 class).**
   - Every §5 item 2 value at load leaves App rendering without the route error boundary on the three host-row-a routes, with zero writes.
   - A malformed value written by a second document while the App runs leaves an idle field in its source state without a throw, and a drafted field becomes a preserved conflict.
5. **Cross-document.** A committed order propagates live to an idle second document, and a drafted field there becomes a preserved conflict (host row m).
6. **Chrome invariance in the clean state.**
   - With no draft and no source issue, these must be identical between `419e56d` and the fixed product for the same seeded bytes:
     - `aside.app-rail` `outerHTML`, in EN and ZH, at 1440 and 375, in rail positions `left` and `top` (at 1440), with all modules visible and with Boards hidden;
     - the `.topbar` `outerHTML`, with the popover closed and open;
     - the `.app` attributes and the `<html>` attributes.
   - This proves that other accepted callers' native visual and keyboard evidence stays valid without rerunning it. A difference triggers the affected callers' visual and keyboard reruns.
7. **Cross-module isolation.**
   - During and after every operation of this caller (drag, cancelled drag, Retry, Discard, Reload, Export, the sign-out step with Cancel and OK), the product dispatches zero `StorageEvent`s and zero `web:settings:preference-changed` events. Count these with an instrumented `window.dispatchEvent` and a bus spy.
   - The bytes of every localStorage key other than `xai_rail_order` stay unchanged (snapshot): the eight Features keys, the seven Appearance keys, and the pet id and position.
   - The Features rail, route and search truth, the Appearance display and the DesktopPet id and position are unchanged.
8. **Protected paths unchanged.** `git diff 419e56d <fixed>` is empty for:
   - `packages/plugin-web-storage`, `packages/plugin-web-settings-shell`, `packages/plugin-web-tokens`, `packages/core`, `packages/xai-web-event-bus`, `packages/xai-web-pet`, `packages/xai-web-cmdk`, `packages/xai-web-settings-appearance`, `packages/xai-web-settings-features-panel`, `packages/plugin-web-settings-rest`, `packages/xai-web-dashboard-grid` and `packages/xai-web-dashboard-widgets`;
   - every `packages/xai-web-shell` path not listed in §11;
   - every `apps/` path except `apps/web/src/App.tsx` and new `apps/web/src/__tests__/App.railorder*.test.tsx` files;
   - `package.json` and `pnpm-lock.yaml`.
9. **Search repeated at the fixed SHA.** Repeat §2's writer and reader search; new hits may appear only in §11 files. In addition:
   - the shell product source contains zero `localStorage`, `usePref(`, `setPref(`, `removePref(`, `new StorageEvent` and `dispatchEvent(`;
   - `AppRail.tsx` imports no storage API other than through the new controller;
   - `App.tsx` contains no `xai_rail_order`, `localStorage` or `usePref(`, and `readLocalPref` is byte-identical.
10. **Unchanged tests pass from the fixed archive and from `419e56d`** (lesson G1):
    - shell: `AppRail.test.tsx`, `internal/dnd.test.ts`, `Shell.smoke`, `event-emit`, `registry`, `AvatarMenu`, `SignOutConfirmDialog`, `index-barrel` and every existing `Topbar.test.tsx` case;
    - `apps/web`: `App.appearance` (APP-AP1–12), `App.signout`, `App.lazy-init`, `shell.smoke`, `shell.theme`, the three composition tests, `cmdkIntegration`, `railFeatureFilter`, `departureCoordinator.blocker` and the router tests;
    - storage `imperative` and `registry` tests.
11. **Storage and lifecycle.** Storage check-types passes, and `lifecycleForKey("xai_rail_order")` is still device-preference, `device-recovery`, `retain` and `retain-on-device`.
12. **Isolation from accepted callers.** The E23 and E24 counts equal their accepted receipts, as predicted in §13.

## 11. Protected surface and Terra's files

**Terra may edit only these product files:**
- **Web shell** (`packages/xai-web-shell/`):
  1. `src/AppRail.tsx`: consume the controller from context, or create a standalone one (A3); display D(order, R); the §6 drag model; no storage call of its own. The markup, classes, attributes, accessible names, `AppRailProps` and click behaviour stay unchanged.
  2. `src/Topbar.tsx`: render the optional `railOrderStatus` node immediately after the `appearanceStatus` slot, with a doc comment. Nothing else.
  3. `src/Shell.tsx`: pass `railOrderStatus` through to the Topbar. Nothing else.
  4. `src/types.ts`: an additive optional `railOrderStatus?: ReactNode` on `ShellProps` and `TopbarProps`, with doc comments, and additive public types for the controller, the provider props and the status props. Nothing else.
  5. `src/index.ts`: additive exports (`RailOrderProvider`, `useRailOrderController`, `RailOrderStatus` and their types) and one side-effect import of the new stylesheet. Existing exports stay unchanged, and no internal helper is exported (`index-barrel.test.ts:41–45`).
  6. New `src/railOrderStatus.css`, scoped as §9 requires.
  7. At most four new modules under `src/internal/`:
     - a pure model: the A5 validator, the display reconcile, the A2 merge and the permutation check;
     - the controller: binding, draft and operation model, Retry, Discard, Reload, Export, unload, sign-out step, context and provider;
     - the EN/ZH copy;
     - the Topbar status component with its panel.
  8. Tests:
     - `src/__tests__/Topbar.test.tsx`: additive cases only, at least the slot order after `appearanceStatus` and an empty slot leaving `.topbar` `outerHTML` unchanged. Existing cases stay byte-unchanged.
     - New test files under `src/__tests__/`: the pure model; AppRail order recovery with a local exclusive Web Lock fixture (pattern: `xai-web-settings-features-panel/src/__tests__/featuresLockFixture.ts`); the status and panel.
  9. `docs/api.md`, the AppRail section (§2.2), the Topbar slot and the new exports, and `docs/test.md`. They must describe the App-scoped controller, the absence of a route guard, the Topbar slot, the sign-out step, R-1 and the one-write-per-drop timing.
- **App** (`apps/web/`):
  10. `src/App.tsx`:
      - create the controller once in `AppInner`, inside `AccountStorageGate`, with the Appearance display language;
      - wrap `Shell` in `RailOrderProvider`;
      - pass `railOrderStatus={<RailOrderStatus />}`;
      - await `confirmSignOut()` at the two A6 positions, and add it to `handleSignOut`'s dependencies.

      Everything else is unchanged: the Appearance controller and its step, `readLocalPref`, `petOn`, the Features filter, the AI subscribers, the DEV seed, CmdK, the rest of the sign-out sequence and `App()`.
  11. New files `src/__tests__/App.railorder*.test.tsx`. Existing App tests stay unchanged.
- **Terra's run record (E6):** new files under `docs/reviews/web-apprail-order-recovery-terra/` only: `implementation.md` (commands, exit codes, per-file counts, deviations and open questions) and the raw logs of Terra's own package runs, with their SHA-256 in `implementation.md`. They may be committed with the product change or in the immediately following commit, and they are additions only.

The fixed-product diff (`git diff --name-only 419e56d <fixed> -- apps packages package.json pnpm-lock.yaml`) must list only the product files above.

**Test dispositions (A9).**

| Existing tests | Disposition |
| --- | --- |
| `AppRail.test.tsx` AR1–AR11, AR-SO1/2, P1, P3, N1, N3 | Unchanged; must pass. The seeds `["ghost-module","tasks"]`, `["dashboard","tasks"]`, `["tasks"]` and `[]` are in-domain (A5), and mounting writes nothing |
| `internal/dnd.test.ts` | Unchanged (`reorderArray` is reused byte-unchanged) |
| `Topbar.test.tsx` TP0–TP7, TB-PREMIUM-1, TP1-Persist … TP3b-Persist, TP-STATUS-1/2 | Unchanged. TP-STATUS-1 still holds, because its next sibling is `.topbar-pref` when no rail slot is passed |
| `Shell.smoke`, `event-emit`, `registry`, `AvatarMenu`, `SignOutConfirmDialog`, `index-barrel` | Unchanged |
| `apps/web` tests listed in §10 item 10 | Unchanged. APP-AP7's exact confirm list holds because the rail step makes no confirm without a rail draft |
| New required tests | The pure-model properties P1–P7 and the domain table; drag timing (one write at drop, zero on `dragover`, zero on cancel); failure, Retry, Discard and Export with the real engine and the lock fixture; source truth and crash safety for every §5 item 2 value; status render conditions, panel states, copy in EN and ZH, and the focus targets; App-level sign-out ordering with and without an Appearance draft. These complement, and never replace, Sol's frozen oracles |

**Implementation expectations.**
- One coherent local operation model for the single field. Do not extract a generic recovery framework, and do not refactor an accepted caller.
- AppRail stays usable standalone (A3).
- Without `navigator.locks`, every rail write is refused and reported, never written unfenced (D2 entry contract item 3).

**Protected.**
- **In `xai-web-shell`:** `AvatarMenu.tsx`, `SignOutConfirmDialog.tsx`, `registry.tsx`, `icons.tsx`, `internal/dnd.ts`, `internal/popoverGeometry.ts`, `__fixtures__/`, every existing test except the additive `Topbar.test.tsx` cases, `package.json`, `manifest.json`, configs (`tsconfig.json`, `vitest.config.ts`, `eslint.config.js`), `README.md`, `docs/design.md` and `docs/dev_log.md`.
- **In `apps/web`:** everything except `App.tsx` and the new test files: routes (coordinator, `settingsDeparture`, composition, registrations, router), providers, pages, `main.tsx`, `dev/`, styles and existing tests.
- The shared storage hook, engine, registry, ownership, codec and lifecycle code, legacy `usePref` included.
- Tokens (`apply.ts`, `i18n.ts`, all CSS); the settings shell; the Appearance and Features packages; core types; the event bus; the pet; CmdK; settings-rest; the dashboard packages; `apps/desktop`.
- The accepted Date & Time, Notifications, More, Sticky, Smart Lists, Collaborate, Pomodoro, Dashboard Header, Features and Appearance callers.
- Reviewer evidence, including every frozen F1 runner, fixture, prelude and log, the F-B002, OE, F-FD1 and K-1 files, and every accepted oracle; the ledgers; the control plane.

**Shared defects.** A correct new shared defect requires all of the following before any product repair: a frozen before oracle, an Astra-role impact review, explicitly revised ownership, and affected accepted-caller reruns (precedent: F1, `0ba68d7` → `f359be6` → `3ea0310`/`f3a3c82`). This includes any defect found in the engine's registered `json` path for an array value, which no accepted caller has used before.

## 12. Before-failure hypotheses and oracles (Sol and parent, before Terra)

**Runner requirements.**
- Use an immutable `git archive 419e56d` behind a lockfile-hash gate, and copy the oracle into the archive.
- Record both the requested and the resolved SHA. Refuse to overwrite an existing log, and preserve nonzero exit codes.
- Freeze the oracle files and their SHA-256s with the logs.

**F-B002 rule (spies never re-enter storage).**
- A Storage spy or attempt-counting injector records and then delegates exactly once.
- Inside a spy, never call `accountScope.physicalKey`, `getPref`, `readRawPref`, any `localStorage`/`Storage` method other than the delegated one, or any product helper. Compute every key before installing the spy; `xai_rail_order` is its own physical key.
- Each oracle file asserts, in a self-check, that its spies make no nested Storage call.

**Seed rule (lesson F-FD1).**
- Every seeded value is in-domain unless malformed bytes are the case's subject.
- In-domain custom orders consist of distinct production module ids: for example `REVERSED`, all 14 rail ids in reverse (the Features oracles' choice), or an order with `board` at a stated index. Unknown ids are seeded only in the cases that test their preservation, as `ghost-module`, which A5 keeps in-domain.
- Features keys are seeded as exactly `true` or `false`. Appearance keys stay absent unless a case needs one; then it gets an in-domain value, never `sage`.
- Malformed seeds come only from the §5 item 2 table, and only in cases named for H1, H7, H8 or H10, or in the `domain` mode.
- Each case asserts the class of its seeds in its preconditions.

**Event-sequence rule (jsdom).**
- Every jsdom drag fires the full sequence `dragStart` → `dragEnter` → `dragOver` (one or more) → `drop` → `dragEnd` on the real DOM nodes, with a `dataTransfer` stub. Cancellation cases omit `drop`.
- The same oracle is then valid on both products, because `419e56d` writes during `dragOver`. No case calls a component handler directly.
- **Expected bytes** are computed by the oracle's own merge implementation, written from A2's text, never by importing the product helper.

**Sol jsdom modes** (real storage, hooks and engine; the production `App` with only the auth-session hook substituted, unless the mode says otherwise):

| Mode | Coverage |
| --- | --- |
| `bytes` | Zero-write mount of App and of a standalone AppRail. Absent and `[]` displays. Exact bytes of drops (§10 item 1), including P6 over absent bytes. Byte compatibility through the unchanged legacy `getPref` and `exportDeviceRecoveryData()`. The lifecycle classification |
| `domain` | Every §5 item 2 value at load on the three host-row-a routes: no route error, default display, source status with Reload only, zero writes (H1, H7, H8, H10). A drag over malformed bytes: refused failed draft, Retry refused again, Discard back to the default display, bytes unchanged. A malformed value written by a second document while running, idle and drafted. Reload after external repair |
| `merge` | The pure-model properties P1–P7 over generated in-domain cases: every one of the eight toggleable modules hidden in turn, three hidden at once, unknown ids, `settings` in the stored order, absent and `[]` bases, and non-permutation inputs (no merge). App-level R-1 end to end through the real Features pane (H5) |
| `drag` | §6: exactly one write at the drop and zero during `dragOver` (H3); cancellation by `dragEnd` without `drop` (H4); a drop on a gap and on the dragged button itself; an unchanged order makes zero writes; R changing mid-drag makes zero writes; click suppression; the `dragging` class; an external `drop` ignored |
| `field` | §5 items 3–7: each failure kind; the latest order kept and displayed (H2); Retry once; pending Retry inert; Discard with zero writes; the four predecessor orderings; uncertainty with one total write; conflict preserved; late completions after Discard and unmount ignored; the held real lock (H6) |
| `continuity-export` | §7 lifetime at the Sol layer (A→B, A→locked, locked→A, epoch, with a held device-key lock); unmount refusal; §8 apart from the native disk shapes, including the export envelope with hidden ids in the value |
| `host` | The §7 protection model: status render conditions (A8), panel states and focus targets, `beforeunload`, the sign-out step in both auth branches with a `window.confirm` recorder (alone, with an Appearance draft, with both, Cancel and OK), forced remount, Features toggles never writing the order (§5 item 9), and the Topbar slot order. Its business failures at `419e56d` are H9 |
| `original` | The archive's own shell tests `AppRail.test.tsx`, `internal/dnd.test.ts`, `Topbar.test.tsx`, `Shell.smoke.test.tsx` and `index-barrel.test.ts`, plus the `apps/web` tests `App.appearance`, `App.signout`, `App.lazy-init`, `shell.smoke` and `railFeatureFilter` |

- Install a Web Lock fixture with exclusive semantics (pattern: `xai-web-settings-features-panel/src/__tests__/featuresLockFixture.ts`). A pass-through stub cannot prove a held lock, and an accidental `lock-unavailable` result is a fixture failure, except in cases that test lock unavailability on purpose.
- Use an attempt-counting Storage injector that is proven to fire. Stub `window.confirm` with a recorder. Drive real `accountScope` transitions.
- Select controls only through the §5 stable selectors and accessible names.

**C-RD1 pre-registration (A11; part of E1 and E2).**
- Sol freezes `features-downstream.c-rd1.test.tsx`: the C-FD1 copy plus the one A11 line. It records the diff against the frozen oracle (three changed lines) and against C-FD1 (one added line), together with the staging-runner copy and its diff.
- Sol runs C-RD1, C-FD1 and the frozen oracle at `419e56d`. The predicted outcomes are in §13.

**Parent host baseline** (`web-apprail-order-recovery-independent/`, jsdom, production `App`):
- a failed drag with its route outcomes (rail click, Settings sidebar, Back) and its sign-out outcome in both auth branches (H2, H9);
- the same with an Appearance draft present;
- `{}` and `1` at load on `/app/tasks` and `/app/settings/appearance` (H1);
- one clean positive control.

**Native before** (parent, Chrome, production `App`, `web-apprail-order-recovery-native/`):
- H1 for every crashing value, with a capture of the route error on `/app/tasks` and `/app/settings/appearance`;
- H2, H3, H4, H5 (end to end with a trusted Features toggle and a trusted drag), H6 and H8;
- H9 (status, `beforeunload` and sign-out from `/app/tasks`), and H11 across two documents;
- trusted drags only (§6 item 8); the K-1 key audit; provenance.

**Rail F1-shape before** (parent). A new runner `web-apprail-order-recovery-f1/verify-f1-railorder.mjs` and host fixture reuse the frozen F1 prelude read-only and hash-checked. Its `selfcheck` mode must be harness-valid. Its `railorder` mode records:

| Case | Scenario | Correct before state |
| --- | --- | --- |
| f1 | Sign-out with a failed rail draft and a More draft held by the Settings coordinator; rail OK, then a successful More Retry | `before-no-rail-step`: only the coordinator holds; at the fixed product the rail confirm comes first and the release happens exactly once |
| f2 | Sign-out from `/app/tasks` with a failed rail draft; Cancel at the rail step | `before-unprotected`: resolves without a rail prompt and invalidates identity |
| f3 | An AppRail click away from a Settings pane that holds a More draft, while a rail draft exists; a successful More Retry releases the click | `before-pass-control`: no rail draft can exist at `419e56d`; the click must be held and released exactly once, at both products |

None of these is an F1 signature. Every fixed run requires one live `proceed()`, zero non-live blocker calls, one router commit and zero runtime errors.

**Validity and positive controls.**
- Every case asserts its preconditions before its business assertion: control found, seeded bytes present and of the declared class, fault armed and observed, drag events trusted (native).
- A failed precondition is a fixture or selector error, never a product failure. At `419e56d`, the absence of the status, the panel or the rail sign-out prompt is the business failure of H9, never a precondition failure.
- These must pass at `419e56d`:
  - zero-write mount; the absent and `[]` displays;
  - the final bytes of a successful all-visible drag (P6);
  - rail-click navigation; sign-out without a rail draft;
  - H11; f3;
  - the `original` mode; the §10 item 10 tests; the lifecycle classification.
- No case may use private calls to reach unreachable values.

**Hypotheses to confirm or refute.** None of these is an established defect.

| ID | Hypothesis |
| --- | --- |
| H1 | Each of `{}`, `{"tasks":1}`, `1`, `0`, `-1`, `true` and `false` in `xai_rail_order` makes every `/app` route, `/app/settings/appearance` included, render "Route Error (app)" with a not-iterable `TypeError`; reloading repeats it, and no UI can repair it (N1) |
| H2 | A drag whose write fails (quota, a throwing `setItem`) is a silent no-op: the rail returns to the stored order, there is no message, Retry, Discard or Export, and the bytes keep the old order (N2) |
| H3 | A trusted drag whose preview changes twice before the drop makes two `setItem("xai_rail_order")` attempts during `dragover` and none at the drop |
| H4 | A cancelled drag (`dragCancel`, or a release outside the rail) still persists the previewed order |
| H5 | With Boards hidden by Features, a drag writes an order without `board`, and after Boards is re-enabled it displays last instead of at its previous index. An unknown id (`ghost-module`) is dropped from the stored order by the first drag |
| H6 | The legacy write ignores a held `prefMutationLockName("xai_rail_order")` lock: the bytes change immediately |
| H7 | Malformed but non-crashing bytes (`"tasks"`, `[1]`, `["tasks",2]`, `[null]`, `[["tasks"]]`, `null`, `[tasks`, the empty string) are silently defaulted or filtered, with no source alert or Reload anywhere, and the next drag silently overwrites them |
| H8 | `["tasks","tasks"]` renders the Tasks button twice, and `["board","tasks","board"]` renders Boards twice |
| H9 | With an unsaved rail order there is no Topbar status, no unload warning and no sign-out step: sign-out from `/app/tasks` proceeds without a rail prompt, and `beforeunload` is not prevented |
| H10 | A throwing `getItem("xai_rail_order")` silently displays the default, with no source alert |
| H11 | Positive control: a committed order in a second document updates an idle first document's rail live, at both products |

**Oracle consistency matrix (lessons OE-1, OE-2).** No expectation may contradict a rule of this contract or of an accepted contract.

| Rule | Expectation family checked | Result | Action |
| --- | --- | --- | --- |
| A2 P6 (all visible: S' = P) | Features Sol `downstream` 014, Features native downstream `drag`, Features native before h6: each drags with all 14 visible and expects the reorder of the stored custom order | Consistent | None |
| A2 P2 (hidden ids keep their slots) | Any accepted oracle that asserts pruning | None exists. The Features contract states pruning as a pre-existing fact only (§4 controller note, D5, §16), and no frozen case drags while a module is hidden | None; a later find is judged by a corrected copy under the F-FD1 procedure |
| A7 (write only at the drop) | Features Sol `downstream` 014: `dragStart`, `dragOver`, `dragEnd`, no `drop` | **Conflict**: a PRECONDITION failure at the fixed SHA | C-RD1, pre-registered (A11) |
| A7 | Features native downstream and before (CDP `drop`); `AppRail.test.tsx` AR5 (class only) | Consistent | None |
| A5 (strict domain) | Seeds `["ghost-module","tasks"]`, `["dashboard","tasks"]`, `["tasks"]`, `[]`, `["board","tasks"]` and the Features custom orders | Consistent: all in-domain | None |
| Appearance A6 (strict `bgTone`) | Features `downstream` 011–013 and 015 seed `xai_bg_tone` `sage` | Known: case 012 is a PRECONDITION failure (F-FD1) | C-FD1, carried; C-RD1 inherits it |
| §5 item 1 and §10 item 7 | Appearance E13 and Features §10.5 snapshots of `xai_rail_order` bytes | Consistent | None |
| §5 item 9 | Features rail-truth cases 003 and 006–011 (display only) | Consistent | None |
| A6 sign-out | APP-AP6–AP8 confirm lists, `App.signout`, Appearance F1-shape a3/a4: no rail draft in any of them | Consistent: the rail step makes no confirm | None |
| A6 slot position | TP-STATUS-1 (next sibling `.topbar-pref` when no rail slot is passed) | Consistent | None |
| §10 item 6 | Appearance E13 clean chrome; Appearance and Features E14/E15 Tab walks over the rail and Topbar | Consistent while invariance holds | Rerun those modes if it fails |
| OE-1 class | Bytes changed behind the App without an event are an unobserved external change, which a drafted field must treat as a conflict | Rule | Oracles seed before mount, use a real second document, or expect a conflict |
| OE-2 class | Hiding a module changes the display | Rule | Expectations are computed from D(S, R) with the current R |

**Freezing and reruns.**
- Freeze the oracle files, before logs and SHA-256 hashes before Terra starts.
- A refuted hypothesis is recorded as PASS. It is not a defect, but its requirement still binds the fixed product.
- Later fixture corrections use a diagnostic suffix, rerun against both archives, and never weaken an assertion. Correct FAILs must be preserved through unchanged fixed reruns.

## 13. Cross-caller impact (lesson F-FD1)

Every accepted caller renders inside the shell and `App.tsx` that this caller changes. The table lists each accepted evidence item or oracle that the change touches, whether it must be rerun, and whether a corrected copy is needed. In the "Evidence or oracle" column, E-numbers are the accepted caller's own IDs; in the "Rerun" column they refer to this contract's §15.

| Accepted caller | Evidence or oracle | Why it is touched | Rerun | Corrected copy |
| --- | --- | --- | --- | --- |
| Appearance | `Topbar.test.tsx` TP-STATUS-1/2 and TP1–TP3b-Persist | `Topbar.tsx` gains the rail slot | Yes, unchanged (E21) | No: without a rail slot the next sibling is still `.topbar-pref` |
| Appearance | `App.appearance` APP-AP1–12, `App.signout`, `App.lazy-init` | `App.tsx` gains the controller and the sign-out step | Yes, unchanged (E22) | No: without a rail draft the rail step makes no confirm, so APP-AP7's exact list holds |
| Appearance | F1-shape a1–a4 (E17 there), through `App.handleSignOut` and the Topbar status | Sign-out sequence and Topbar | Yes, through the K-1 copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (E17); its only SHA binding is the docs-head precondition | No |
| Appearance | Native host rows g, h and r (sign-out through App) | Sign-out sequence | Not rerun. This caller's host rows h–k cover sign-out with Appearance drafts natively, and E17 covers a3/a4 | No |
| Appearance | E13 clean-chrome invariance; E14/E15 visual and keyboard, whose Tab walks cross the rail and Topbar (59/57 stops in the clean walk) | AppRail and Topbar markup | Not rerun while §10 item 6 holds against `419e56d` (E12); rerun those modes if it fails | No |
| Appearance | Sol `bytes`, `fields`, `reset`, `queues`, `continuity-export`, `host`, `retry-all`, `original`; parent host | The production App composition changes | Yes (E23); counts as in the Appearance E27 receipt | OE: the corrected `continuity-export` copy beside the frozen one |
| Appearance | E26 native Retry all; E9–E11 | No Appearance file changes | No | No |
| Features | Sol `downstream` case 014 (AppRail drag, no `drop`) | A7 | Yes (E23): frozen, C-FD1 and C-RD1 | **C-RD1** (new, pre-registered, A11) |
| Features | Sol `downstream` case 012 | Appearance A6 (F-FD1) | Yes (E23) | C-FD1, carried |
| Features | Sol `downstream` rail-truth and isolation cases 003, 006–011, 013, 015 | The display reconcile is unchanged; Features toggles never write the order | Yes, inside the C-RD1 run (E23) | No |
| Features | Native downstream (E13 there; CDP drag with `drop`) and native host (E12 there; rows b, m and n are AppRail departures) | AppRail changes | Yes, through one copy of the shared harness whose only change is the product-delta precondition (Features delta + Appearance §11 files + this caller's §11 files) and which keeps the K-1 audit (E24) | No oracle correction: the drag has a `drop` and all modules are visible (P6) |
| Features | Sol `bytes`, `fields`, `reset`, `queues`, `continuity-export`, `original`; host 40; package 45; F1 `features` mode | The App composition changes | Yes (E23, E15) | No |
| Features | `railFeatureFilter`; `filterModulesByFeaturePrefs` and `useFeaturePrefs` reader tests | The filter decides R | Yes, unchanged (E22, E23) | No |
| Features | E4 h6 native before at `f359be6` | Frozen history | No | No |
| Features | E14/E15 visual and keyboard (R-PET at 768×1024) | Rail and Topbar markup | Not rerun while §10 item 6 holds | No |
| More | F1 `more`; Sol, original and host suites | Shell and App composition | Yes (E15, E23) | C-FB002: corrected `boundaries` beside the frozen one |
| Sticky, Notifications, Date & Time | F1 invocations; Sol and host suites | They mount the production Shell, whose AppRail now creates a standalone controller | Yes (E15, E23) | No |
| Smart Lists, Collaborate, Pomodoro, Dashboard Header | F1 invocations (`smart-lists`, `collaborate`, `pomodoro`, `header`); host suites whose harness mounts the production Shell or App (`web-smart-lists-recovery-astra`, `web-collaborate-recovery-independent`, `web-pomodoro-departure-independent`, `web-dashboard-header-departure-independent`) | Shell composition; AppRail clicks held by the Dashboard and Pomodoro coordinators | Yes (E15, E23), counts against their accepted receipts | No oracle correction expected; a harness copy only for a caller-bound delta precondition (A11) |

**R-1 and pruning.** No accepted oracle asserts pruning, so R-1 needs no corrected copy (§12 matrix, row 2). Every accepted drag oracle drags with all 14 modules visible and expects the order "derived from the stored custom order", which under R-1 is byte-identical to today's write (P6).

**Predicted counts** for the oracles that are run as frozen originals beside corrected copies. The final verifier records the frozen originals as they fall. Any outcome not predicted here must be explained, or the verifier stops.

| Oracle | At `419e56d` | At the fixed SHA | Judges at the fixed SHA |
| --- | --- | --- | --- |
| Features Sol `downstream`, frozen | 14/15 (case 012 PRECONDITION, F-FD1) | 13/15 (case 012, F-FD1; case 014 PRECONDITION, A7) | No |
| C-FD1 copy (`7bb5ad3c…`) | 15/15 | 14/15 (case 014 PRECONDITION, A7) | No |
| C-RD1 copy | 15/15 (the added `drop` has no handler; `dragOver` already wrote) | 15/15 | **Yes** |
| More `boundaries`, frozen | As it falls (nondeterministic, F-B002) | As it falls | No |
| More `boundaries`, corrected (C-FB002) | 10/10 | 10/10 | **Yes** |
| Appearance Sol `continuity-export`, frozen | 24/26 (006, 007; OE-1, OE-2) | 24/26 | No |
| Appearance `continuity-export.corrected` (OE) | 26/26 | 26/26 | **Yes** |

A corrected copy that fails is a regression. A frozen original that fails in a way not predicted above is a finding to freeze and explain before acceptance.

**Inventory prediction for the next Luna refresh,** if this caller lands as contracted (a prediction, not a target): the AppRail row disappears. That gives 22 files, 47 direct bindings, 26 literal keys, 1 dynamic site, 30 setter bindings (27 direct, 3 downstream-only) and 17 read-only bindings; `xai-web-shell` goes from 1 binding to 0.

## 14. Gates

The E-numbers refer to §15. A gate is complete only when every listed item exists.

| Gate | Required complete evidence | Checklist items |
| --- | --- | --- |
| 1. Field, domain and crash safety | <ul><li>Zero-write mounts and re-renders (§5 item 1).</li><li>Exact bytes and byte compatibility (§10 items 1–2).</li><li>Every §5 item 2 value and a throwing read: default display, no throw on any `/app` route, the source status with Reload only, no rewrite (H1, H7, H8, H10 correct FAILs, then PASS).</li><li>A drag over malformed bytes is a refused failed draft.</li></ul> | E1, E2, E3, E4, E6, E7, E9, E12 |
| 2. R-1 merge | <ul><li>P1–P7 for the pure model and in the production App.</li><li>Hidden, non-rail and unknown ids keep their indices; a re-enabled module returns to its index (H5 correct FAIL, then PASS).</li><li>All-visible drags are byte-identical to today's write.</li><li>A non-permutation makes no write.</li><li>Native R-1 end to end through the real Features pane (host row c).</li></ul> | E1, E2, E4, E7, E9 |
| 3. Drag timing and trusted pointer input | <ul><li>Exactly one write per drop and zero during `dragover` (H3).</li><li>Cancelled drags revert with zero writes (H4, host row r).</li><li>Unchanged orders, external drops and R changing mid-drag make zero writes.</li><li>Click suppression.</li><li>Native drags only through trusted CDP input, with `isTrusted` recorded for every drag event.</li></ul> | E1, E2, E4, E7, E9 |
| 4. Failure recovery and export | <ul><li>The latest order kept and displayed on every failure kind (H2).</li><li>Retry once; pending Retry inert; Discard with zero writes; Reload for source issues only.</li><li>The four predecessor orderings; uncertainty with one total write; conflict preserved; the held real lock (H6); late completions ignored.</li><li>Memory-only export with exact native disk JSON for the five §8 shapes plus one setup failure.</li></ul> | E1, E2, E7, E9, E10, E11 |
| 5. App-lifetime protection | <ul><li>Status render conditions, panel states and focus targets (A8, §7).</li><li>No route guard; `beforeunload`; the sign-out step in both branches, alone, with an Appearance draft, with both drafts and with a coordinator-held More draft (H9).</li><li>Forced remount (REL-09).</li><li>Host rows a–r with history counters and runtime-error gates.</li><li>The rail F1-shape cases f1–f3, before and fixed.</li><li>The Appearance F1-shape a1–a4 at the fixed SHA.</li></ul> | E3, E5, E8, E10, E16, E17 |
| 6. Downstream, invariance and isolation | <ul><li>§10 items 1–11, including clean-state chrome invariance against `419e56d` and cross-module isolation.</li><li>Cross-document propagation and conflict (H11 control, host row m).</li><li>The before byte, display and reader-test controls PASS at `419e56d`.</li></ul> | E2, E4, E7, E12, E18, E19, E20 |
| 7. F1 regression | <ul><li>The 12 frozen F1 invocations PASS at the fixed SHA with unchanged runner hashes.</li><li>The rail F1-shape `selfcheck` and `railorder` modes: before at `419e56d` and fixed PASS.</li><li>The Appearance F1-shape at the fixed SHA.</li></ul> | E5, E15, E16, E17 |
| 8. Presentation and keyboard | <ul><li>EN/ZH at five widths: hit-tests with the pet hidden, the pet-on R-PET run, 44×44 for new targets, Topbar and panel containment with both statuses visible, the CSS-scope and focus-outline audit, manual screenshots.</li><li>Keyboard: Tab order, Enter and Space once, Escape, focus targets, and per-stop pixel focus visibility across the four states in light and dark.</li><li>K-1 audits.</li></ul> | E13, E14 |
| 9. Final regression and affected callers | Independent reruns from the fixed archive (runners and commands as in `../web-appearance-recovery-final/review-final-regressions-419e56d.md`): <ul><li>shell package test, typecheck and lint;</li><li>web package test, check-types and lint;</li><li>storage check-types;</li><li>the Appearance and Features package tests, settings-shell and settings-rest;</li><li>the accepted-caller suites of §13, with C-FB002, C-FD1, C-RD1 and OE run beside their frozen originals and outcomes matched to §13's predictions;</li><li>the Features native host and downstream rerun through the harness copy.</li></ul> Any selector outside `.rail-order-status*` needs the affected callers' visual and keyboard reruns. Any shared delta needs impacted engine, hook and caller reruns plus fresh acceptance. | E6, E18–E25 |

**Acceptance condition.**
- Every gate must reconcile four facts: the source, a correct before failure, fixed independent behaviour and the actual user surface.
- Every §15 item must be cited with its artifact path and SHA-256. A missing item blocks acceptance.
- The caller cannot be closed by any of the following:
  - converting the binding without the R-1 merge, so that pruning is kept;
  - writing on `dragover`, or persisting a cancelled drag;
  - keeping any crash, silent default, silent filter or silent overwrite of malformed bytes;
  - recovery without the route-independent status, the unload warning and the sign-out step;
  - a status that claims success, or that unmounts with focus left on `<body>`;
  - judging Features `downstream` case 014 by anything other than the pre-registered C-RD1;
  - shipping without the clean-state chrome invariance evidence.

## 15. Required evidence checklist

This list is the single source for gate evidence (lesson G1). The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; lockfile gate recorded; the F-B002 spy self-check. Also the pre-registered C-RD1 copy, its staging-runner copy, and both diffs: one added line against C-FD1, three changed lines against the frozen Features oracle | Sol | `419e56d` | 1–4, 6, 9 |
| E2 | Sol before logs for the eight §12 modes, with per-case outcomes for H1–H11 (H9 again in E3 and E4). Zero PRECONDITION lines, and every positive control PASS. Also the Features `downstream` runs at `419e56d`: frozen 14/15 (F-FD1), C-FD1 15/15, C-RD1 15/15 | Sol | `419e56d` | 1–4, 6, 9 |
| E3 | Parent jsdom host before log (production `App`): failed drags with route and sign-out outcomes, with and without an Appearance draft (H2, H9); `{}` and `1` at load (H1); clean control | Parent | `419e56d` | 1, 5 |
| E4 | Native before, production `App`, trusted input only: H1 for every crashing value with route-error captures on `/app/tasks` and `/app/settings/appearance`; H2; H3; H4; H5 end to end; H6; H8; H9; H11 across two documents; key audit; provenance; EN and ZH where text is asserted | Parent | `419e56d` | 1–3, 6 |
| E5 | The rail F1-shape runner and host fixture (frozen prelude reused read-only and hash-checked); `selfcheck` harness-valid; `railorder` before log f1–f3 | Parent | `419e56d` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only 419e56d <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` under `docs/reviews/web-apprail-order-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all eight modes PASS and zero PRECONDITION lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS | Parent | fixed | 5 |
| E9 | Native controls and drags (host rows b, c, e, f, o, p, r): exact bytes after trusted drags; R-1 end to end; one write per drop and zero on `dragover`; cancellation; held real lock; uncertainty with one write; source states per §5 item 2 value with a drag over them; external repair and Reload; `isTrusted` recorded for every drag event | Parent | fixed | 1–4 |
| E10 | Native protection (host rows a, d, g–l, n, q) with history counters and runtime-error gates: status, panel, Retry, Discard, Export and Reload by trusted pointer; navigation not held; sign-out alone, with an Appearance draft, with both and with a held More draft, in both branches; `beforeunload`; forced remount; Features toggles never writing the order | Parent | fixed | 4, 5 |
| E11 | Native export: the five §8 disk shapes under total denial (counters, URL, anchor, warning, status) plus one setup failure | Parent | fixed | 4 |
| E12 | Native downstream: byte compatibility in new documents (legacy `getPref` and the device recovery export); display truth; crash safety for every §5 item 2 value at load and written by a second document; cross-document (host row m); clean-state chrome invariance against `419e56d` (§10 item 6); cross-module isolation | Parent | fixed and `419e56d` | 1, 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests; the pet-on R-PET run (blocking for new controls, recorded for unchanged ones); 44×44 for new targets; Topbar and panel containment with both statuses visible; no horizontal scroll; a selector audit listing every added selector with the computed focus outline of each new control; the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (before captures also `419e56d`) | 8 |
| E14 | Keyboard: Tab order through the Topbar statuses and panel; Enter and Space once; Escape and focus return; the §9 focus targets, never `<body>`; per-stop pixel focus walks (clean, failed with the panel closed, failed with the panel open, source with the panel open; light and dark; EN 1024, ZH 375) with the frozen `pixelFocusWalk` oracle; the K-1 audit in every run | Parent | fixed | 8 |
| E15 | F1 regression: `verify-f1.mjs` sticky, more and collaborate; `verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro; `verify-f1-race.mjs` race; `verify-f1-features.mjs` selfcheck and features. All 12 PASS with unchanged runner hashes and no `Invalid blocker state transition` | Parent or final verifier | fixed | 7 |
| E16 | Rail F1-shape fixed log PASS for f1–f3: one live `proceed()`, zero non-live blocker calls, one router commit, zero runtime errors | Parent or final verifier | fixed | 5, 7 |
| E17 | Appearance F1-shape at the fixed SHA through the K-1 copy: `selfcheck` harness-valid, and `appearance` a1–a4 `fixed-pass` with F1 signature 0 | Parent or final verifier | fixed | 5, 7 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `419e56d` | Final verifier | `419e56d` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff | Final verifier | `419e56d..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for `xai_rail_order` | Sol and final verifier | fixed | 6, 9 |
| E21 | Shell package full test, typecheck and lint from the fixed archive, plus its unchanged tests at `419e56d` as a before control | Final verifier | fixed and `419e56d` | 9 |
| E22 | Web package test (every §10 item 10 test and the new `App.railorder*` tests), check-types and lint, plus the unchanged tests at `419e56d` as a control | Final verifier | fixed and `419e56d` | 9 |
| E23 | Accepted-caller suites, with counts compared to their accepted receipts and the corrected copies beside the frozen originals as predicted in §13:<ul><li>Appearance: Sol eight modes with OE beside the frozen `continuity-export`; parent host; package.</li><li>Features: Sol seven modes, with `downstream` run three ways (frozen, C-FD1, C-RD1); host; package; reader tests.</li><li>More: Sol, original and host, with `boundaries` frozen and C-FB002.</li><li>Sticky, Notifications, Date & Time.</li><li>The Shell- or App-mounting host suites of Smart Lists, Collaborate, Pomodoro and Dashboard Header.</li><li>Settings-shell and settings-rest.</li></ul> | Final verifier | fixed | 9 |
| E24 | Affected-caller native rerun: the Features native host and downstream runners through one harness copy whose only change is the product-delta precondition (diff recorded), with the K-1 audit kept; PASS | Parent or final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict, and the §13 prediction table filled with observed outcomes | Final verifier | — | 9 |

**Rules.**
- E1–E5, including C-RD1, must be committed before Terra starts.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- Native runners never send `nativeVirtualKeyCode`, and each keeps a key-audit precondition (K-1). Native drags use trusted CDP input only (§6 item 8).
- Frozen originals are recorded as they fall. The judging copies are C-FB002 (More `boundaries`), OE (Appearance `continuity-export`) and C-RD1 (Features `downstream`, which contains C-FD1's change). C-FD1 runs beside them with its §13 predicted outcome. A judging copy that fails is a regression.

## 16. Lessons converted

| Lesson (source) | Treatment here |
| --- | --- |
| F1: the coordinator regression oracle must keep running (F1 closure) | **Gate 7.** All 12 frozen invocations (E15), plus a rail F1-shape mode for sign-out ordering and AppRail-click release (E5, E16). No coordinator change is permitted. |
| G1: a gate item had no scheduled runner (Sticky) | **Gate.** One contiguous §15 checklist and the enumerated E25 receipt; acceptance blocks on any missing ID. |
| F-B002: a spy re-entered storage; the frozen More oracle is nondeterministic | **Rule.** The §12 spy rule with a self-check (E1). C-FB002 runs beside the frozen oracle (E23). |
| F-FD1: an accepted oracle encoded behaviour that a later caller had to change, and was found only at the final regression (Appearance final §7) | **Pre-registration.** §12's consistency matrix and §13's impact table identify the one conflict, Features `downstream` case 014 against A7, before any implementation. C-RD1 is frozen in E1 and its outcomes predicted in §13. The seed rule keeps every seed in-domain unless malformed bytes are the subject. |
| OE-1/OE-2: an oracle's expectation contradicted the contract's own rules (unobserved external bytes; a paired write) | **Rule.** The consistency matrix, the expected-bytes rule (the oracle's own merge implementation), and the OE-1 and OE-2 class rows of §12. |
| K-1: `nativeVirtualKeyCode` started stray key streams in headless Chrome on macOS | **Rule.** No runner sends it, and every keyboard run keeps a key-audit precondition (§9, §15 rules). |
| F-APP-1/F-APP-2: a control showed no focus, found only by pixels; F-APP-3: popover options suppress the ring | **Gate 8.** Per-stop pixel walks over four states in both themes (E14); the new controls must not reuse `.topbar-pref-option` or any class that suppresses the ring, and the audit records the computed outline (§9). |
| R-PET: the App-level pet covered a moved control (Features acceptance §5.1; Appearance A9) | **Rule.** Gated pet-hidden runs plus a pet-on run that blocks only on the controls this caller adds, with centre and four inset points and panel-box separation (§9, E13). |
| E6: the implementer's run existed only as a commit-message self-report (Features acceptance §5.5) | **Rule.** The reserved Terra path (§11) and E6 with SHA-256. |
| Keyboard Discard all left focus on `<body>` (Sticky follow-up 1) | **Gate.** Every unmount of a focused status moves focus to `.topbar-pref-trigger` (§7 item 2, E14). |
| Affected callers' visual modes were not rerun after a shared change (Sticky follow-up 6) | **Rule.** Clean-state chrome invariance of the rail and Topbar against `419e56d` (§10 item 6, E12) instead of rerunning every caller's visuals; any failure, or any selector outside `.rail-order-status*`, triggers those reruns. |
| Host compositions lacked App-level readers | **Gate.** Every host, native and visual row runs in the production `App` (§9). |
| Implementer runs need a reserved record path; the controller's script once truncated a ledger before validating (control plane, cost check) | **Rule.** §11 reserves `docs/reviews/web-apprail-order-recovery-terra/`; the final verifier writes only new files. |
| Retained exclusions: headless Chrome and synthetic accounts; not Tauri; synthetic `beforeunload`; a development build without StrictMode; reused dependency trees | Retained. The lockfile gate is a consistency check only. Sign-out runs through App's real `handleSignOut` (host rows h–k). |

## 17. Limitations and exclusions

**Not part of this caller:**
- **The SET-03 catalog decision beyond R-1:** a Features catalog driven by module registration; which modules may be disabled; what happens to Time Tracker, Bookkeeping and Metrics; the landing page when Dashboard is off; CmdK refresh while open (SHELL-03); rail, search and deep-link consistency beyond the order key. R-1 decides only what a drag does to hidden modules' positions.
- **Keyboard or touch reordering** of the rail (UX-05, SHELL-01). The rail stays pointer-drag only; the gap is recorded, not closed.
- **A rail-order reset** or "restore default order" control. `resetAllPrefs`, `SettingsFooter` and `RESET_DEFAULTS` stay untouched and without a production caller.
- **Pruning** unknown or non-rail ids (A2 keeps them), and **migration** of positions already pruned by earlier versions (A5).
- **Repairing malformed bytes** (REL-07): they stay until site data is cleared, a second document writes a valid order, or the device recovery export is used to inspect them.
- The first bottom-rail item's focus ring clipped at 375 px, the 36 px Topbar controls above 1024 px, F-APP-3 and the AvatarMenu staying open after the sign-out dialog (UX-05/SHELL follow-ups of the Appearance acceptance). They are pre-existing and need tokens CSS.
- SHELL-05/SHELL-06 and UX-03: pet persistence, avoidance and moving the pet. Occlusion of unchanged controls is recorded only.
- The `text/plain` drag payload and the browser's insertion of the module id into an editable drop target (§6 item 9).
- Drafts lost when a scope change remounts App (REL-09); crash durability.
- D2, global reset, migration, deletion or data-export changes; Tauri and native window capability; production authentication and live logout.

**Retained limitations:**
- A drag over an invalid or unavailable source can never be saved from the UI (A5, REL-07).
- With both a rail and an Appearance draft, two prompts appear at sign-out, and a Cancel at the second one comes after the first OK already discarded the rail draft (§7 item 4).
- Without Web Locks every rail write is refused and reported, never written unfenced.
- Like every accepted caller, the evidence is headless Chrome with a synthetic auth session, a development build and reused dependency trees.

**Not closed by this caller:** SET-03 (only R-1 is implemented), SHELL-01, SHELL-03, SHELL-04, SHELL-05, SHELL-06, REL-05, REL-07, REL-09, REL-10, UX-03, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, D2/REL/AI, or any other 312 item. Accepting this caller is not business or release completion and changes no formal count.

**Not authorized:** deployment, release, branch promotion or Web→Desktop sync. Any later Desktop flow needs the ADR-0013 D3 gate.

**Recommended evidence directories:** `docs/reviews/web-apprail-order-recovery-{sol,independent,native,f1,terra,final,acceptance}/`.

## 18. Stop condition

- **For this contract.** A compliant design needs no D2 shared-layer change and nothing outside the `web` module. The key stays an unscoped device key on the registered `json` path with a caller validator (A4, A5); no registry, ownership, codec, default, lifecycle, engine, hook, coordinator, router or tokens change is needed. Every product file is in `packages/xai-web-shell/` or `apps/web/` (§11). The stop condition therefore did not trigger, and this document is a contract rather than a STOP memo.
- **For Terra and every later role.** Stop and report, without a product repair, if a compliant implementation turns out to need any of the following:
  - a change to `plugin-web-storage` (the registry, ownership, codec, engine, hooks or lifecycle);
  - a tokens or settings-shell change;
  - an Appearance or Features package change;
  - a change to the coordinator, router or `settingsDeparture`;
  - a file outside §11.

  A suspected shared defect follows §11's shared-defect procedure.

## 19. Open questions for the controller

1. **R-1 reading (A2).** Confirm that "keep their stored positions" means the index in the stored order. If it means "after the same neighbour", the question goes to the product owner and this contract needs r2.
2. **Uniform non-visible rule (A2).** Confirm that unknown and non-rail ids are kept, like Features-hidden ones, rather than pruned. Pruning them would need the unfiltered registry, a protected `registry.tsx` change.
3. **Source-only Topbar status (A8 rule (b)).** Confirm the deviation from Appearance's rule (no status for source-only issues). It exists because the rail has no pane to carry the source alert.
4. **Cancel semantics (A7).** Confirm that reverting a cancelled drag (Escape, or a release outside the rail) is an accepted consequence of R-3 rather than a product change for the owner. Today the previewed order persists on `dragover`.
5. **Sign-out ordering (A6).** Confirm two sequential prompts, rail first, with the disclosed partial-discard case, over a single combined prompt, which would need a change to the accepted Appearance controller.
6. **Controller placement (A3).** Confirm an App-created controller with the sign-out step in `App.tsx`, over a `Shell`-internal controller that leaves `App.tsx` untouched.
7. **C-RD1 (A11).** Confirm pre-registration now, so that the final regression judges Features `downstream` case 014 by C-RD1 without a separate ruling batch.
8. **Rerun breadth (§13).** Confirm that the host suites of Smart Lists, Collaborate, Pomodoro and Dashboard Header, whose harnesses mount the production Shell or App, join E23 even though the Appearance E24 list did not include them.

No new product-owner (b) decision was found beyond R-1. Questions 1 and 4 carry escalation notes, because a different reading would make them product questions.
