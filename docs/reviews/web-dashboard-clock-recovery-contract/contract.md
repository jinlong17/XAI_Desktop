# Complete caller: the Dashboard Clock widget's style and timezone, with Dashboard departure participation

**Revision log** (newest first).
- **r1 (2026-10-05, batch 54).** First draft, written with the selection memo [selection-419e56d.md](../web-next-caller-selection/selection-419e56d.md) (candidate E1).

Contract designer: Astra role (risk, design and final decision), executed by an independent Claude Opus 5.5 instance in an isolated detached worktree. Module `web`, 2026-10-05, control-plane batch 54. Proposed control-plane item: `CP-CLOCK-01`. It takes effect as an execution item only once the controller confirms A1–A9 and registers it.

**Fixed product and source equality.**
- Fixed product: `419e56de9f23e4467fea806fbd4a990e1f429941` (`419e56d`, tree `7aabbd832be446aeca1441eff34f2fd35945290a`). The contract was authored at docs HEAD `b4e190e`, where `git diff --name-only 419e56d b4e190e -- apps packages package.json pnpm-lock.yaml` is empty.
- Lockfile SHA-256: `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`.
- From `5cd63ff` to `419e56d` only the 26 Appearance §11 files changed. Every file below is byte-identical between the two products except `App.tsx`, which is cited only as a protected dependency.
- The unit's source at `419e56d`:

| File | SHA-256 | Last change |
| --- | --- | --- |
| `packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx` | `10bf13e8550bdf1207cfd89b372e5b87f099b1110326248dbf5b7ea2325614e9` | `9a78d17` (2026-05-23) |
| `packages/xai-web-dashboard-widgets/src/registrations.tsx` | `346cfddfbb3c299aff251b2e4daff31b909d0690196857c36b8ee71f6e015154` | `12b7111` (2026-06-02) |
| `packages/xai-web-dashboard-widgets/src/styles.css` | `a7a4cf039b343b8c6b06113bf6b6997084524aa4c0413e2ab0396a1ca933a853` | `1be1107` (2026-06-04) |
| `packages/xai-web-dashboard-widgets/src/internal/cityLibrary.ts` (protected; the timezone domain) | `50de913a73caaef2ea98c7021fec24dd46a30d56177527ddda54db89bcb36f48` | |
| `packages/xai-web-dashboard-widgets/src/index.ts` (protected) | `1e22d6b74d4f22655e273415798edd1c255b5af9a108f2a99822299ac8031b0b` | |
| `packages/xai-web-dashboard-grid/src/DashboardModule.tsx` | `36a8532beb638a5741d3b51338a2ce32da9daa220e1a461cd00729da61e542a2` | `c9a388d` (2026-09-10) |
| `packages/xai-web-dashboard-grid/src/DashboardGrid.tsx` | `395a134c9c1c3044ed86afdb48839373a7ba80ff57a387177dd277d76098fc2f` | `72296ec` (2026-09-09) |
| `packages/xai-web-dashboard-grid/src/types.ts` | `afeb1112713155f8998ca13cc9dbfc174025c98497148ab21cd4f015201e40f2` | `c9a388d` (2026-09-10) |
| `packages/xai-web-dashboard-grid/src/index.ts` (protected) | `fc5da5907da4de81a327736297ef2ae377a7cf3e589fb3c121475229f9acf71c` | |
| `packages/xai-web-dashboard-grid/src/DashHeader.tsx` (protected; the accepted Header) | `0aaa4ce3b456b1fedf3c4bb3f7163830e6ee7390ba65382564d9c13852e40456` | `73b4eb9` (2026-09-10) |
| `packages/xai-web-dashboard-grid/src/WidgetGhost.tsx` (protected) | `0b476928649a3b24bd35d97869c0b1e9e4588ebdec4908b6ef8c5583d0272c9b` | |
| `packages/xai-web-dashboard-grid/src/WidgetShell.tsx` (protected) | `7d1b74b80076983eb5cc34921d06d58b5365cbcf91efb63128a6c7938b1bd708` | |
| `packages/xai-web-dashboard-grid/src/styles.css` (protected) | `d9e330e70a375b0579fcf3b98e3d9ea2c633fc4b498b4b3a66fda3df8db9fdc6` | `0f2d5a0` (2026-09-10) |
| `apps/web/src/routes/modules/departureCoordinator.tsx` (protected) | `0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075` | F1 repair `f359be6` |
| `apps/web/src/routes/modules/dashboardRegistration.tsx` (protected) | `66c524e4e02117275ed369c02049f33a0eb2c42ad068388eb4041fa469c903e8` | `f64ad44` (2026-09-10) |
| `apps/web/src/routes/modules/settingsDeparture.ts` (protected) | `80c3a5787df8eb02102c4a508f2fe67c1fbd6a6b8ba7f16b3a65c3f542c8548b` | |
| `apps/web/src/App.tsx` (protected; the sign-out sequence) | `24461a52a34c83d9e9e51dc92d99db6d76e4c56435bec3e5293e0937a8cc935a` | Appearance `24073b5` |
| `packages/plugin-web-storage/src/internal/usePrefAsync.ts` (protected) | `541fae97413104b8db90c20d7b565a5492f17fc74d79b3e975f954d7189a4491` | `b9ae2d9` (2026-09-10) |
| `packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts` (protected) | `e27f9f86196c08166b3c03f8450a546d486c2035adec42f91a90ae2723350332` | |
| `packages/plugin-web-storage/src/internal/prefMutation.ts` (protected) | `3f8840ac8e7e824ddc9aacb6839d19a0602244235dbfd542f686ca749125ec00` | |
| `packages/plugin-web-storage/src/internal/usePref.ts` (protected) | `e1f2c9131cb9a00a2dff3951f4c95b2a7ad68692d0bf409b0ef511df137fa188` | |
| `packages/plugin-web-storage/src/internal/registry.ts` (protected) | `dd961a214c94ac97753e1878323ed387cde3362f4e85f1dfaa8154f1011d29d3` | |
| `packages/plugin-web-storage/src/internal/accountOwnership.ts` (protected) | `8d5b7fef04a014044b81cb95d56eaf084bfc306d7c8b9a27540b6caa3a2bef20` | |
| `packages/xai-web-cmdk/src/internal/readModuleStates.ts` (protected reader) | `1ee898681af67b21bd84308bef99abf196ab8551069d53c8e570a9ec9e0ba008` | |
| `packages/xai-web-cmdk/src/adapters/dashboard.ts` (protected reader) | `0c8e6ac9cfbcffd6a52e3f21cd5a09b077d03bd0539798ebcbc626776b64b1eb` | |
| `packages/plugin-web-tokens/src/layout.css` (protected) | `9397dc735d8d80a9720e81561dca73a0ed02a98fd16c1f15634e5c775e2bc6b7` | |
| `packages/plugin-web-tokens/src/tokens.css` (protected) | `7c6eddebd1d826f939862ef75ba8159e966f0c76b0b9d34a0911f6b47265615d` | `1be1107` |
| `packages/plugin-web-tokens/src/i18n.ts` (protected) | `d5f2189b081d16a9f26b7146978c5f81660a6a44d6f534b9ac48e6e3c7ccb885` | |
| `packages/xai-web-pet/src/DesktopPet.tsx` (protected) | `35edb0e686bf6682192ba1bbe7842d159e161a6593b7ccd13a432d59fe58ad6f` | `7a3d712` |

**Status.**
- This contract specifies the next ordered implementation unit after the accepted Appearance caller (`a560863`).
- It does not authorize implementation. It accepts nothing, changes no formal count and closes no 312 item.
- Its scoping decisions A1–A9 (§4) are **assumptions awaiting controller confirmation**. They correspond to the (a) pre-decisions E1-1 … E1-9 of the selection memo. No product-owner decision is needed. A7 carries an escalation note.

**Authority.**
- **Selection:** [selection-419e56d.md](../web-next-caller-selection/selection-419e56d.md), candidate E1, §5–§7.
- **Scheduling:** [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md). Line 18 names "Clock style/timezone" in the Dashboard widgets and shell group. Line 25 requires a complete caller with its genuinely shared producers. The Clock has no shared producer: the widget is its only writer.
- **Inventory:** [refresh-419e56d.md](../web-d2-pref-binding-inventory/refresh-419e56d.md) and `bindings-419e56d.json`: rows `ClockWidget.tsx:51` (`xai_clock_style`, `setStyle`, 1 direct call) and `:52` (`xai_clock_tz`, `setTz`, 2 direct calls).
- **Account lifecycle:** the [D2 entry contract](../web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md), item 2: device-only keys stay under their classified device contract.
- **Precedents:**
  - The [Appearance contract r3](../web-appearance-recovery-contract/contract.md) is the structural template. Its [acceptance](../web-appearance-recovery-acceptance/acceptance-419e56d.md) supplies rulings 3 (K-1), 5 (F-APP-1/F-APP-2), 7 (F-FD1/C-FD1), 9 (R-PET) and 11 (44×44 scope).
  - The [Dashboard Header contract](../web-dashboard-header-departure-contract/contract.md) and its [acceptance](../web-dashboard-header-departure-astra/acceptance-73b4eb9.md) supply the Dashboard departure host, the Header export format and the Header evidence that must keep passing.
  - The [Features contract](../web-features-recovery-contract/contract.md) supplies the device-only pattern.
  - The [F1 impact review](../web-sticky-recovery-f1/impact-review.md) supplies the coordinator regression oracle. [affected-callers-f359be6.md](../web-sticky-recovery-f1/affected-callers-f359be6.md) §3.7 is the precedent for rerunning the Header after a shared change.
  - [`blocked-f359be6.md`](../web-sticky-recovery-acceptance/blocked-f359be6.md) §4 is the G1 lesson (§14).
  - [`review-fb002.md`](../web-more-recovery-fb002/review-fb002.md) is the F-B002 lesson.
  - [`review-oe.md`](../web-appearance-recovery-oracle-erratum/review-oe.md) is the OE-1/OE-2 lesson.
  - [`review-k1.md`](../web-native-keyinput-k1/review-k1.md) is the K-1 lesson.
  - [`review-final-regressions-419e56d.md`](../web-appearance-recovery-final/review-final-regressions-419e56d.md) §7 is the F-FD1 lesson and §2 lists the corrected-copy runners.

## 1. Roles, order and risk

| Role | Executor | Boundary |
| --- | --- | --- |
| Parent / controller | Claude controller | Scheduling and the contract check, including confirming A1–A9. Also runs the production-App jsdom host baseline, native and browser verification, the Clock F1-shape runner, the frozen F1 runners, the Header affected-caller reruns and the ledgers |
| Sol | New independent Opus-class instance | Freezes business oracles against an immutable `419e56d` archive before any implementation, then reruns them unchanged on the fixed product |
| Terra | Implementation instance; Opus-class recommended, because the aggregation sits on the accepted Header's departure path | The complete caller, inside the §11 files only. Starts after every before baseline (E1–E5) is frozen and the controller authorizes it. Records its own test run at the reserved path (§11, E6) |
| Final regression | New instance, distinct from Terra and Sol | Runs §13 gate 9 and writes the §14 E25 receipt |
| Final acceptance | New instance, distinct from this author, Terra, Sol and the final-regression verifier | Reconciles every §13 row and every §14 item: source → correct before failure → fixed independent result → actual surface |

**Exclusions by role.** Luna gets no task: persistence, the async queue, departure aggregation, the host, cross-module isolation and acceptance are its forbidden zones. Spark is never assigned.

**Order.**
1. Contract.
2. Controller check of this revision, confirmation of A1–A9, and registration.
3. Frozen before baselines (E1–E5): Sol oracles, the parent production-App host baseline with the cross-caller seed scan, native before, and the Clock F1-shape before log.
4. Terra implementation.
5. Sol fixed reruns.
6. Parent host, native, Clock F1-shape and frozen F1 verification.
7. Header affected-caller reruns and the final regression receipt.
8. Independent acceptance.

Do not run another caller's implementation concurrently.

**Risk: medium. The product risk is low, but the shared surface is not.**
- **What device-only ownership removes:** account-scoped physical keys, the account lifecycle lock, private-owner admission, committed markers, tombstones, recovery admission, the private-draft disposal boundary and mixed-owner batches. Both keys are explicit device keys (`accountOwnership.ts:28–29`).
- **What still makes this unit risky:**
  - **The accepted Dashboard Header's departure path changes.** Today the coordinator's single guard slot (`departureCoordinator.tsx:76, 83–92`) holds the Header's guard directly (`DashboardModule.tsx:158` → `DashHeader.tsx:784–798`). After this caller it holds a combined guard built by a new aggregator. Any divergence from the Header's accepted single-participant behaviour would be a regression of an accepted caller and of the F1 class.
  - **Two Clock instances render during a drag** (the source and `WidgetGhost`, `DashboardGrid.tsx:164–166`), so the ghost must stay inert.
  - **Widget removal unmounts drafts** outside any route departure (`WidgetShell.tsx:291–300` → `DashboardModule.tsx:90–103`).
  - **Re-render pressure.** `DashboardModule` re-renders every second (`:35–41`), so registrations must not churn on ticks.
  - **A combined export** may download two files from one dialog activation.
  - **Native evidence** runs in the production `App` composition, including the App-level DesktopPet (R-PET).

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

**Writers and readers outside the unit.** A search at `419e56d` over `apps/` (including `apps/desktop`, the service worker and `apps/web/src/host`) and `packages/`, all extensions, excluding `docs/` and tests, found:
- **Writers:** none besides `ClockWidget.tsx:265, 286, 309`. There is no `setPref`/`removePref`, raw, wrapper, reset, event or migration writer. `resetAllPrefs` has no production caller.
- **Readers:**
  - CmdK `readModuleStates.ts:36–41` reads both keys with `getPref` when the palette opens;
  - CmdK `adapters/dashboard.ts:96–106` matches the stored style string against the query; `clockTz` is read but unused.
- **Lifecycle** (`lifecycleDeclaration.ts:25–34`): both keys are device-preference, export scope `device-recovery`, `retain` on account deletion and `retain-on-device` in migration, derived from ownership.

**Preserve:**
- the widget registration id `clock`, span `w-clock`, its aria-label "Clock widget"/"时钟组件" (`registrations.tsx:52–57`), and the default order position (`registry.ts:124–136`);
- the four faces with their `data-testid`s (`clock-classic`, `clock-split`, `clock-minimal`, `clock-analog`), the analog SVG ticks and hands, `.clock-sub`, the toolbar's `data-no-drag`, the style buttons' `title`s and `data-clock-style`, the trigger's `title` and label, the 13 popover items with their order, labels, UTC offsets and `data-tz-id`, the scrim click that closes the popover, and the popover closing after a choice;
- the displayed-time computation, including its static offsets (DASH-02 is excluded, §16);
- every public export of `@repo/plugin-web-dashboard-widgets` and `@repo/plugin-web-dashboard-grid` (additions only);
- `DashHeader.tsx`, its props, its registration timing and its accepted behaviour, byte for byte.

## 3. As-is behavior at `419e56d`

These are facts only. Suspected defects appear solely as hypotheses in §12.

1. **Bindings.** Both fields use legacy `usePref` (`ClockWidget.tsx:51–52`). The setter calls synchronous `setPref` (`usePref.ts:130–151` → `storage.ts`): compare-before-write, then `localStorage.setItem`, with no Web Lock, expected baseline or readback. The hook updates its state only when `setPref` returns `true` (`usePref.ts:141–147`).
2. **Failure.** When a write fails, the control does not take the choice. There is no message, Retry, Discard or export. Nothing persists, and nothing is protected on departure or unload.
3. **Malformed bytes.** Any stored style outside the four displays Classic (`:36–42, 56`). An unknown timezone id displays Local time (`:61–75`). Both happen silently: no alert, no Reload, no write.
4. **Cross-document.** Legacy `usePref` follows `storage` events for the physical key (`usePref.ts:155–196`).
5. **Mount.** Loading the Dashboard, mounting the widget, opening and closing the popover and the one-second tick make zero writes on either key.
6. **Rendering.**
   - Widgets receive `{ lang, now, goTo }` (`DashboardGrid.tsx:121`; `types.ts:45–55`). The widgets package declares its own structural copy of that type (`registrations.tsx:24–28`), because the grid package depends on the widgets package.
   - The Clock registration passes only `lang` and `now` (`:56`).
   - During a drag the dragged widget renders a second time in `WidgetGhost` with the same context (`DashboardGrid.tsx:164–166`).
7. **Dashboard departure.**
   - The app adapter mounts the shared coordinator around `DashboardModule` (`dashboardRegistration.tsx:19–47`) and routes widget `goTo` through `navigate` (`:28–32`).
   - The coordinator holds one guard: a registration replaces it, and an unregister clears it only on a token match (`departureCoordinator.tsx:76, 83–92`). `canBlock` requires `isCurrent() && isBlocking()` (`:93–96`).
   - A live blocked POP whose guard is no longer current is reset; one that is current but not blocking proceeds (`:179–213`).
   - A held intent is re-evaluated whenever the guard or intent version changes: not current → stay; current and not blocking → proceed (`:214–222`).
   - The dialog label is `guardRef.current?.label` (`:242`). Export calls `exportDraft()` only while current and blocking (`:228–231`). "Discard local changes and leave" calls `discardDraft()`, then proceeds (`:232–240`).
8. **The Header's registration.**
   - `DashboardModule` passes the coordinator's `registerDepartureGuard` only to `DashHeader` (`DashboardModule.tsx:158`).
   - The Header registers in an effect with the label "Dashboard header"/"工作台备注" and re-registers whenever its effect dependencies change (`DashHeader.tsx:784–798`). Those dependencies include `registerDepartureGuard`, `draftVersion` and `lang`.
   - The coordinator's registration function is stable (`departureCoordinator.tsx:83`), so the Header does not re-register on ticks.
9. **Sign-out.** `handleSignOut` runs the Appearance step, then `requestSettingsDeparture("sign-out")` (`App.tsx:155–184`). That resolves through the mounted coordinator's delegate (`settingsDeparture.ts:9–16`; `departureCoordinator.tsx:158–170`).
10. **Widget removal.** The WidgetShell remove button (`WidgetShell.tsx:291–300`) calls `DashboardModule.removeWidgetFromOrder` (`:90–103`). When the order write succeeds, the widget leaves `activeWidgets` and unmounts.
11. **Presentation.**
    - `.w-clock` spans 6 columns with a minimum height of 160 px (`layout.css:3670`). It spans 12 at 1200 px and below (`:4134–4135`), and 8 between 781 and 1024 px in the dashboard stylesheet (`xai-web-dashboard-grid/src/styles.css:1023, 1072–1076`).
    - The style buttons are 22×20 in tokens (`layout.css:3708–3714`). They are forced to 44×44 only between 641 and 1024 px (`xai-web-dashboard-grid/src/styles.css:1234–1257`).
    - The global focus ring is a 2 px accent outline (`tokens.css:246–253`). A selected style button has a background and a shadow (`layout.css:3715–3719`), and the active timezone item a background (`layout.css:3174`).
    - The popover has no Escape handling and closes on a scrim click (`ClockWidget.tsx:273–279`). After a keyboard choice it unmounts with focus inside it.
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

## 4. Scoping decisions (A1–A9 await controller confirmation)

**A1 — Scope (selection E1-1).**
- Terra edits exactly the §11 files: the Clock files in `xai-web-dashboard-widgets`, plus `DashboardModule.tsx`, `DashboardGrid.tsx`, `types.ts` and one new internal module in `xai-web-dashboard-grid`.
- `DashHeader.tsx`, the coordinator, `settingsDeparture.ts`, `dashboardRegistration.tsx`, `shellRegistrations.tsx`, `App.tsx`, storage, tokens, the shell, the pet, CmdK and every other package stay protected.
- The affected-caller reruns are the Header evidence in E17. The F1 regression and the Clock F1-shape mode are E15–E16. The clean-state Dashboard invariance gate (§10 item 6) bounds visual re-verification of the Header.

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
- There is no success line anywhere, because the absence of a block is the only success state, and no "Saved" claim.
- The inline Export renders while at least one field has a settled unsuccessful draft (§8). A source-only issue alone never renders it.
- There is no Retry all, Discard all, Reset or status line.

**A7 — Widget removal discards Clock drafts (selection E1-7).** Removing the Clock widget unmounts its controller, which disposes every Clock draft with zero set or remove attempts by the controller (§7 item 5). The removal interaction is unchanged.
- *Escalation note:* if the controller reads REL-05's "保留草稿" as requiring removal protection, holding or confirming removal becomes a product decision for the user, and this contract needs a revision.

**A8 — Test dispositions (selection E1-8)** exactly as §11.

**A9 — R-PET and global overlays (selection E1-9)** exactly as §9.

**D-notes.**
- *Counts match.* Two inventory rows (`ClockWidget.tsx:51, 52`) are the whole caller. Inventory rows are not defect counts.
- *Not a Header change.* `DashHeader.tsx` is byte-unchanged. Only the function it receives changes, and §6 item 6 requires single-participant equivalence.
- *Not a grid persistence change.* Dashboard order, layout and appearance persistence (`useOrderSaveRecovery`, `useWidgetMapRecovery`) stay untouched. Their drafts stay unprotected on departure until their own caller (selection memo N3).

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

     So is a key whose `getItem` throws.
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

The coordinator then shows its existing templates. For the Clock: "Clock has unsaved changes." / "时钟有未保存的更改。" and aria-label "Unsaved Clock draft" / "未保存的时钟草稿". For the combined case: "Dashboard has unsaved changes." / "工作台有未保存的更改。" (`departureCoordinator.tsx:290–291`). All wording appears in the language currently displayed.

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
5. **Upstream forwarding.** Every participant register or unregister call synchronously does the following, so the coordinator sees the change in the same effect phase, as with today's direct Header registration:
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

   **Single-participant equivalence (gate 3).** Whenever the Header is the only participant, or the Clock is registered but not blocking and current, all of the following equal `419e56d`:
   - every coordinator decision (block, reset, proceed, stay, auto-release);
   - the dialog label and text;
   - the export file;
   - the discard effect;
   - the number of `proceed()`/`reset()` calls;
   - history and location outcomes;
   - sign-out results.

   The Header's accepted suites (E17) are the oracle, plus Sol `departure` D1 and host row l.
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
8. **Auto-release.** A held route intent or sign-out caused only by Clock drafts is released **exactly once** when the last Clock draft clears (verified success or Discard), through the coordinator's existing re-evaluation (`departureCoordinator.tsx:214–222`): one live `proceed()`, zero non-live blocker calls, no `Invalid blocker state transition`. When the Header still blocks, the hold continues.
9. **No coordinator, router or registration-site change.** `departureCoordinator.tsx`, `settingsDeparture.ts`, `dashboardRegistration.tsx` and `shellRegistrations.tsx` stay byte-unchanged.

## 7. Device continuity, lifetime and protection

1. **No account machinery.**
   - Both keys stay unscoped device keys.
   - For these fields the controller never reads, writes or acquires any account physical key (`xai:account:v1:*`, `xai:demo:v1:*`), account lifecycle lock, generation marker, tombstone or recovery admission. Prove this with spies on lock names and keys that follow the F-B002 rule (§12).
   - An unrelated held account lifecycle lock must not delay a Clock choice.
2. **Lifetime.**
   - **Inside one widget mount** drafts and operations survive re-renders, the one-second tick, opening and closing the popover, reorders (the shell is keyed by id, `DashboardGrid.tsx:142`), resizes, widget appearance changes and drags (the source shell stays mounted), and a held per-key lock.
   - **Sol layer.** With the widget mounted under a real `accountScope` without the gate, drafts and held operations survive A→B, A→locked, locked→A and same-account epoch changes. Device bindings are not refused on scope change (`usePrefAsync.ts:230`).
   - **Production App.** A scope change remounts the App subtree (`AccountDataGate`), and in-memory drafts are lost. After the remount the widget shows the committed bytes, with no success claim and no runtime error. This is the retained REL-09 limitation, documented by host row o.
3. **Route departure.** While the Clock participant blocks, these are held by the coordinator with its dialog (Stay, Export current draft, Discard local changes and leave), per §6:
   - AppRail;
   - Back, Forward and numeric POP;
   - programmatic navigation, including widget `goTo` and the Topbar Settings link;
   - sign-out.

   Export and Stay never clear drafts or release navigation.
4. **Unload.**
   - The controller registers a `beforeunload` listener only while at least one actual draft exists, pending or settled.
   - It warns synchronously, with zero storage attempts in the handler.
   - It is removed when the drafts clear and on unmount.
   - There is no warning in a clean or source-only state. This is a cancellable warning, not crash durability.
5. **Voluntary sign-out** on the Dashboard uses App's existing sequence unchanged: the Appearance step (no prompt without Appearance drafts), then `requestSettingsDeparture("sign-out")`, which reaches the Dashboard coordinator and the combined guard.
   - **Stay** resolves `false`: drafts are kept, there are zero history mutations and identity is intact.
   - **Discard** discards the Clock drafts with zero writes; the request resolves `true` and the sequence continues.
   - Off the Dashboard the Clock is not mounted and holds nothing.
6. **Widget removal** (A7).
   - Unmounting the Clock disposes its controller. Every Clock draft is discarded with zero set or remove attempts by the controller; the participant unregisters; the unload listener is removed; late completions are ignored.
   - A write already in flight may still commit the latest choice (§5 item 8).
   - If removal fails (the order write fails, so the widget stays), nothing about the Clock changes.
7. **The drag ghost** (A3). Over the whole drag, the ghost instance makes zero storage attempts, registers no participant and no unload listener, and displays the committed bytes. The source widget keeps its drafts, blocks and participant.
8. **Forced transitions** — a scope change from another document, an auth loss, the account-deletion bridge — are never blocked by the Clock.
9. **Unmount** removes the listener, subscriptions and the participant. Old callbacks refuse, based on live disposal state. Committed writes are not undone.

## 8. Sparse memory export

**Format.** The filename is `clock-draft.json`. It uses the set envelope of the accepted Appearance export; there are no reset entries, because this caller has no reset:

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
5. a pending draft held behind a real `prefMutationLockName("xai_clock_style")` lock, exported through the coordinator dialog after an AppRail attempt;
6. the combined case through the coordinator dialog: a failed Header note save and a failed Clock choice, one activation, two files. `dashboard-note-draft.json` must equal the Header's accepted format, and `clock-draft.json` this envelope. Each is downloaded exactly once; their order is not specified;
7. a style draft exported after a drag reorder of the Clock widget.

Every export runs under total storage denial, and each must show:
- attempt-level counters, recorded before delegating to Storage, at zero for reads, writes and removes;
- per file, exactly one object URL created and that same URL revoked;
- the anchor removed;
- afterwards, the unload warning still active, the recovery region and the departure hold unchanged.

Additionally, one native setup failure (`createObjectURL` or the click throwing) must meet the same assertions and show the localized error. Unmount during Blob, URL or append time may remain Sol evidence (jsdom with real storage, hook and engine).

The browser may ask permission for the second file of shape 6. Native runs grant downloads up front. This is a disclosed limitation (§16).

## 9. Actual host, keyboard and responsive presentation

**Composition.**
- Every host, native and visual row runs in the production `App` composition: the `apps/web/src/main.tsx` module order and the production router, `AccountStorageGate`, `AccountDataGate`, the Shell, the App-scoped Appearance controller, DesktopPet, CmdK, the Dashboard registration with the coordinator and `settingsDeparture`, and the real Dashboard and widget packages, hooks, engine, registry and codecs.
- **The only synthetic input is the auth session.** Bundle provenance must show that every module comes from the archive under test. Patterns: `../web-appearance-recovery-native/native-fixed-app.tsx` and `native-fixed-prelude.js`, and `../web-dashboard-header-departure-native/native.tsx`.

**Host matrix** (rows a–p; jsdom in E3/E8 and native in E11).

| | Scenario | Required behavior |
| --- | --- | --- |
| a | Success | Each of the 17 values through the UI gives exact bytes and no recovery region. After reopening CmdK, `readModuleStates()` returns those bytes, and a query matching the style finds the Clock |
| b | Failure and Retry | A quota failure on each key keeps the choice displayed, and the block appears with Retry and Discard. A successful Retry makes exactly one write and removes the block; the bytes are exact |
| c | Held write | While the write is held behind the real `prefMutationLockName(<key>)` lock: no block, controls enabled. An AppRail activation is held, with the dialog label "Clock"/"时钟". On release: exactly one write, and the intent is released exactly once to the AppRail target |
| d | Failure, then AppRail | Held. Stay: no navigation, zero history mutations. Discard local changes and leave: zero set or remove attempts on both keys, exactly one navigation |
| e | Failure, then Back and Forward | Held (POP). A successful Retry releases exactly once. `{pathname,key,state}` is deep-equal to an ordinary navigation, with zero runtime errors |
| f | Failure, then a widget `goTo` | The Mini Calendar's open action is held. Stay keeps the Dashboard; Discard navigates once |
| g | Sign-out from the Dashboard with a Clock draft | No Appearance confirm (no Appearance drafts). The coordinator dialog appears. Stay resolves `false`, with identity intact and zero history mutations. A second attempt with Discard proceeds, and identity is invalidated |
| h | `beforeunload` | Warns only while a Clock draft exists, pending or settled. Zero storage attempts in the handler. None in clean or source-only states |
| i | Cross-document | An idle Clock in document A updates live when document B commits each field. A drafted field in A becomes a preserved conflict, and Retry never overwrites |
| j | Malformed bytes at load | For every §5 item 2 value and a throwing `getItem`: no route error, the default displayed, the source block with Reload only, no hold, no unload warning, zero writes. After document B repairs the bytes, Reload shows the repaired value |
| k | Combined Header and Clock | Two runs, each starting from a failed Header note save and a failed Clock choice, with AppRail held under the label "Dashboard"/"工作台". <ul><li>**k1:** dialog Export makes each participant's export exactly once (two files). Dialog Discard then discards both drafts, with zero writes on either Clock key, and navigates exactly once.</li><li>**k2:** a Clock Retry success keeps the hold, and the label becomes "Dashboard header"/"工作台备注". A Header Retry success then releases it exactly once.</li></ul> |
| l | Header-only equivalence | A failed Header note save only: the label is "Dashboard header"/"工作台备注"; dialog Export downloads one file; dialog Discard proceeds once; in a separate run a successful Header Retry auto-releases once. Each outcome is identical to the same run at `419e56d` |
| m | Widget removal with a failed Clock draft | After a successful removal: zero set or remove attempts on both keys by the Clock, no Clock participant, the unload warning removed (no other drafts), and the next AppRail navigation not held |
| n | Drag with a failed Clock draft | Over the drag the ghost makes zero storage attempts and adds no participant registration. After the drop the block is still shown and departure is still held |
| o | Forced scope change | Driven through the identity channel from a second document (`AccountStorageGate.tsx:8, 39`): App remounts, committed values are displayed, no success claim, zero runtime errors |
| p | Ticks | Over at least three `now` ticks with no edits: zero participant re-registrations and zero storage attempts. With a draft present: zero additional re-registrations across the ticks |

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
- **Gated run.** All checks above run with the pet hidden through the product's own rail pet toggle (a trusted, hit-tested click), as in the accepted Sticky, Features and Appearance compositions.
- **Pet-on run.** Every width and language is repeated with the pet at its default position (`resolveDefaultPetPos`) and the default Dashboard order (`registry.ts:124–136`), and the occlusion of each control is recorded.
  - **Blocking:** a control this caller adds — Retry, Discard, Reload and Export — must have an uncovered centre.
  - **Recorded, not blocking:** coverage of the unchanged Clock controls is appended under UX-03/SHELL-05 with before and after evidence.
  - A caller may not move a functional control into the default pet band. Mitigations are layout inside `.w-clock-body` only.
  - The pet is neither hovered nor focused during probes, and it is never moved, hidden by code, restyled or repositioned by this caller.
- **Other overlays.**
  - The coordinator dialog is a host overlay fixed to the viewport, judged by its own box and the viewport (Sticky acceptance ruling).
  - CmdK is closed in every run.
  - The Appearance Topbar status must be absent: no Appearance failure is seeded. If it appears, that is a precondition failure.
  - The Clock's own timezone popover is judged only when it is the subject of a check. Its viewport containment is recorded (pre-existing), not gated.

**Sizing and CSS.**
- New targets (Retry, Discard, Reload, Export) are at least 44×44 at every width, in EN and ZH. The 44×44 rule does not apply to the unchanged style buttons, trigger and popover items; their sizes are recorded (Appearance acceptance ruling 11; selection memo N7).
- New CSS adds selectors only under `.clock-recovery*`, appended to `packages/xai-web-dashboard-widgets/src/styles.css`.
- A focus-visibility repair, if E4 or E14 requires one, may also add `:focus-visible` rules whose selectors start with `.w-clock-body` and target only Clock markup. A repair that cannot be expressed that way is a shared defect (§11).
- Existing rules stay byte-unchanged: the fixed file begins with the before file.
- `plugin-web-tokens` CSS (`layout.css`, `tokens.css`) and the grid's `styles.css` are not edited.
- The selector audit proves that every appended class is used only by Clock markup, with a positive control (the Appearance D37 pattern).
- Existing control geometry may not shrink. The clean-state invariance of §10 item 6 must hold.

**Focus visibility (F-APP-1, F-APP-2).** This is gated for every Clock focus stop, because the Clock controls are this caller's controls.
- **Stops:** the timezone trigger; each style button, selected and unselected (4 × 2); each popover item, active and inactive (13 × 2); and each new recovery control.
- **Method.** For each stop, compare pixels of the stop's own box plus its ring area, focused against unfocused. Use the light and dark themes, EN and ZH, at 375, 768 and 1440. A selection treatment (`[aria-selected="true"]`, `.popover-item.active`) or any `outline: none` in the cascade must not mask the ring.
- **Results.** The computed `outline-style` at `:focus-visible` and the pixel delta are recorded per stop. A stop with no own-region change is a FAIL.
- Repairs follow the CSS rule above.

**Keyboard (K-1).**
- Native runners never send `nativeVirtualKeyCode`. Each runner audits that presses equal keydowns.
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
- a focused selected style button and a focused active popover item, in light and dark.

## 10. Downstream consistency, crash safety and cross-module isolation

**Nothing changes in:**
- keys, defaults, registry codecs, ownership or lifecycle;
- dual writes, aliases or migrations;
- the CmdK readers;
- `DashHeader.tsx`, the coordinator, `settingsDeparture.ts`, the app registrations and `App.tsx`;
- the grid's order, layout and appearance persistence.

Readers reflect **committed bytes**; the widget reflects its display values.

Required evidence:
1. **Exact bytes** for all 17 values at the Sol layer and natively.
2. **Byte compatibility.** Every value written by the fixed product is read back identically by the unchanged CmdK reader in a new document. A value written by `419e56d` is displayed identically by the fixed product.
3. **Display truth.** The face, `aria-selected`, the active item, the trigger label, `.clock-sub` and the displayed time all reflect the display value. After Discard or Reload they reflect the committed bytes.
4. **Crash safety.** Every §5 item 2 value at load leaves the Dashboard and the App rendering, with defaults and zero writes. A malformed value written by a second document while the Dashboard is open leaves an idle field in its source state without a throw.
5. **Cross-document.** Both fields propagate live to an idle second document. A drafted field becomes a preserved conflict.
6. **Clean-state Dashboard invariance.**
   - With no Clock draft or source issue and the same seeded in-domain bytes, the `.module-dashboard` `outerHTML` is identical between `419e56d` and the fixed product.
   - Run in EN and ZH, at 375 and 1440, with the popover closed and open, and with the page clock frozen to one instant for both captures.
   - This proves that the Header's and the grid's accepted native visual evidence stays valid without rerunning it.
7. **Cross-module isolation.**
   - During and after every Clock operation — choice, Retry, Discard, Reload, export, dialog Stay, Export and Discard, removal, drag — the product dispatches zero `StorageEvent`s and zero event-bus events. Count these with an instrumented `window.dispatchEvent` and a bus spy.
   - The bytes of every other localStorage key are unchanged (snapshot), including the Header note and position, `xai_dash_order`, the widget layout and appearance maps, `xai_zones`, the pet keys and the seven Appearance keys.
8. **Protected paths unchanged.** `git diff 419e56d <fixed>` is empty for:
   - every `apps/` path;
   - `packages/plugin-web-storage`, `packages/plugin-web-tokens`, `packages/plugin-web-settings-shell`, `packages/core`, `packages/xai-web-event-bus`, `packages/xai-web-shell`, `packages/xai-web-pet`, `packages/xai-web-cmdk`, `packages/xai-web-settings-appearance`, `packages/xai-web-settings-features-panel` and `packages/plugin-web-settings-rest`, and every other package outside the two dashboard packages;
   - every `packages/xai-web-dashboard-grid` and `packages/xai-web-dashboard-widgets` path not listed in §11;
   - `package.json` and `pnpm-lock.yaml`.
9. **Search repeated at the fixed SHA.** Repeat §2's writer and reader search; new hits may appear only in §11 files. In addition:
   - `ClockWidget.tsx` and the new Clock modules contain zero `usePref(`, `setPref(`, `removePref(`, `localStorage`, `sessionStorage`, `new StorageEvent`, `dispatchEvent(` and `emitWebEvent(`;
   - the aggregator module contains zero storage access;
   - `DashHeader.tsx` is byte-identical.
10. **Unchanged tests pass from the fixed archive and from `419e56d`** (the G1 lesson):
    - every `xai-web-dashboard-grid` test file;
    - every `xai-web-dashboard-widgets` test file marked "unchanged" in §11;
    - the CmdK tests;
    - `apps/web` `departureCoordinator.blocker` and the router tests.
11. **Storage and lifecycle.** Storage check-types passes, and `lifecycleForKey` still classifies both keys as device-preference, device-recovery, retain and retain-on-device.

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
- **Terra's run record (E6):** new files under `docs/reviews/web-dashboard-clock-recovery-terra/` only: `implementation.md` (commands, exit codes, per-file counts, deviations and open questions) and the raw logs of Terra's own package runs. They may be committed with the product change or in the immediately following commit, and they are additions only.

The fixed-product diff (`git diff --name-only 419e56d <fixed> -- apps packages package.json pnpm-lock.yaml`) must list only the product files above.

**Test dispositions.**

| Existing tests | Disposition |
| --- | --- |
| `ClockWidget.test.tsx` AC-CLOCK-1, -2, -5, -6, -7, -8, "invalid stored style falls back to classic", "clicking scrim closes popover" | Unchanged |
| `ClockWidget.test.tsx` AC-CLOCK-3 (style persists), AC-CLOCK-4 (timezone popover and persistence) | Install the local Web Lock fixture and await real completion. Same assertions on bytes, rendering and popover closing |
| `analogClockTicks.test.tsx`, `registrations.test.tsx`, `slotIntegration.test.tsx` and every other dashboard-widgets test | Unchanged |
| Every `xai-web-dashboard-grid` test, including `DashHeader*`, `DashboardModule*`, `DashboardSlotHost.composition` and `types.test-d.ts` | Unchanged |
| New tests (required) | Clock tests with the real engine and the lock fixture, covering §5 items 1–8 and the §8 export. Participant semantics (§6 item 7). Aggregator unit tests (§6 items 1–6): single-participant equivalence, combined members, participant order, identity-based unregister, a stable registration function, disposal, and that the ghost context has no field. They complement, and never replace, Sol's frozen oracles |

**Implementation expectations.**
- Use one coherent local operation model per Clock instance.
- Do not extract a generic recovery framework, and do not refactor an accepted caller.
- The aggregator is internal to the grid package and is not exported.
- The widget stays usable standalone (A3).

**Protected.**
- In `xai-web-dashboard-widgets`: every widget other than the Clock, `internal/*` except the new Clock modules (`cityLibrary.ts`, `Icon.tsx`, `TzClock.tsx`, the stores and the data reads), `index.ts`, `package.json`, `manifest.json`, configs, `docs/design.md` and `docs/dev_log.md`.
- In `xai-web-dashboard-grid`: `DashHeader.tsx`, `WidgetShell.tsx`, `WidgetGhost.tsx`, `EmptyState.tsx`, `AddWidgetPicker.tsx`, `DashboardSaveRecovery.tsx`, `registration.tsx`, `index.ts`, every existing `internal/*` file, `styles.css`, existing tests, `package.json`, configs, `docs/design.md` and `docs/dev_log.md`.
- All of `apps/`, including the coordinator, `settingsDeparture.ts`, the registrations, the router and `App.tsx`.
- The shared storage hook, engine, registry, ownership, codec and lifecycle code, including legacy `usePref`.
- Tokens (CSS and `i18n.ts`), the shell, the pet, CmdK, the settings packages, core and the event bus.
- The accepted Date & Time, Notifications, More, Sticky, Smart Lists, Collaborate, Pomodoro, Header, Features and Appearance callers.
- Reviewer evidence, including every frozen F1 runner, fixture, prelude and log, the K-1, OE and F-B002 files and the C-FD1 diagnostics; the ledgers; and the control plane.

**Shared defects.** This includes any defect in the engine or the coordinator that this caller exposes. A correct new shared defect requires all of the following before any product repair:
- a frozen before oracle;
- an Astra-role impact review;
- explicitly revised ownership;
- affected accepted-caller reruns (precedent: F1, `0ba68d7` → `f359be6` → `3ea0310`/`f3a3c82`).

## 12. Before-failure oracles (Sol and parent, before Terra)

**Runner requirements.**
- Use an immutable `git archive 419e56d` behind a lockfile-hash gate.
- Copy the oracle into the archive.
- Record both the requested and the resolved SHA.
- Refuse to overwrite an existing log.
- Preserve nonzero exit codes.
- Freeze the oracle files and their SHA-256s with the logs.

**F-B002 rule (spies never re-enter storage).**
- A Storage spy or attempt-counting injector records and then delegates exactly once.
- Inside a spy, never call `accountScope.physicalKey`, `getPref`, `readRawPref`, any `localStorage`/`Storage` method other than the delegated one, or any product helper.
- Compute every physical key before installing the spy. Device keys are their logical keys; account keys named in isolation assertions are precomputed for the captured scope.
- Each oracle file asserts, in a self-check, that its spies make no nested Storage call.

**In-domain seeds (F-FD1).**
- Every seeded byte of either key is inside the §2 domain, except in source-truth cases, which use exactly the §5 item 2 values.
- Positive controls use in-domain values only.
- E1 includes a table of every seed and its class.

**Cross-caller domain scan (F-FD1).** Before Terra, the parent lists every accepted oracle, runner, fixture and test that seeds or asserts `xai_clock_style` or `xai_clock_tz` (E3).
- The author's scan at `b4e190e` found none in `docs/reviews/`. In product tests it found only the Clock's own tests and CmdK's adapter fixture `realisticState.ts:172–173` (`clockTz: "America/New_York"`), which is adapter state, not storage, and so is unaffected.
- Any accepted oracle whose expectation depends on an out-of-domain seed gets a corrected copy, committed before E24 runs, under the C-FB002/C-FD1 precedent.

**Oracle–contract consistency matrix (OE-1, OE-2).** Sol's E1 receipt must show, for each row, which oracle cases assert it, and that no two cases or contract clauses contradict each other.

| # | Rule pair that could be confused | How every oracle must assert it |
| --- | --- | --- |
| 1 | Inline Export (only while a field has a settled unsuccessful draft) vs the dialog Export (whenever the Clock blocks, including pending only) | Pending-only and source-only states expect no inline Export. Pending-only states expect a working dialog Export |
| 2 | Pending vs settled | Pending expects no block, but a departure hold and an unload warning. Settled expects the block |
| 3 | Source-only | Block with Reload. No hold, no unload warning, no export entry |
| 4 | Conflict vs ordinary failure | A conflict case seeds the external bytes *after* mount without a `StorageEvent` (an unobserved external change) and expects a preserved conflict. Every other case seeds *before* mount, or dispatches a `StorageEvent`, and never expects a conflict (OE-1) |
| 5 | Discard's zero writes vs a commit already in flight | Assert zero writes only for queued or held work, or with the fault armed. An in-flight write may commit the latest choice |
| 6 | Removal vs route departure | Removal discards without a dialog. A route change with drafts is held |
| 7 | Labels | One blocking participant: its label. Two or more: `Dashboard`/`工作台`. The Header alone: `Dashboard header`/`工作台备注` |
| 8 | Combined `isCurrent` (every participant current) vs `isBlocking` (any participant current and blocking) | Single-participant cases expect the `419e56d` outcome exactly |
| 9 | Ghost | Zero writes and no participant from the ghost. Its display may equal the committed bytes rather than the source widget's draft |
| 10 | Seeds | In-domain everywhere except source-truth cases (F-FD1) |
| 11 | Ticks | Zero re-registrations without changes, at both SHAs |

**Sol jsdom modes** (real storage, hooks and engine):

| Mode | Coverage |
| --- | --- |
| `bytes` | All 17 values with exact bytes through the widget. Absent defaults. Zero-write mount of the widget, of `DashboardModule` with the real registrations, and of the ghost during a drag. Lifecycle classification of both keys. Byte compatibility with the CmdK reader and adapter |
| `fields` | Per field ×2: every §5 item 5 failure with Retry; source truth (§5 item 2 and a throwing `getItem`) with Reload only; targeted Discard with zero writes and zero sibling reads; both fields unresolved; a conflict plus an unrelated quota failure; late completions ignored; no success claim |
| `queues` | §5 items 4–6: rapid choices with a real held lock; the predecessor and latest orderings; uncertainty with one total write; external replacement and removal as preserved conflicts, including restoration; new work after Discard; interleaved style and timezone work |
| `departure` | `DashboardModule` with a recording coordinator registration and with the production Dashboard registration and coordinator. Cases: <ul><li>**D1** Header-only equivalence: the label, export file, discard and auto-release counts match a recorded `419e56d` run;</li><li>**D2** a Clock failure plus AppRail is held, label "Clock";</li><li>**D3** a pending Clock write held behind the real lock, then AppRail is held; on release, exactly one auto-release;</li><li>**D4** a Clock failure plus Back is held; Retry success releases once;</li><li>**D5** sign-out with a Clock draft: Stay resolves `false`, then Discard resolves `true`;</li><li>**D6** combined Header and Clock, in the two runs of host row k: (k1) the label "Dashboard", dialog Export calls each participant once, then dialog Discard discards both and navigates once; (k2) a Clock Retry success keeps the hold with the label "Dashboard header", then a Header Retry success releases once;</li><li>**D7** the combined members per §6 item 6, through the recording registration: `isCurrent` with one participant non-current, label rules, participant order, identity-based unregister;</li><li>**D8** the ghost is inert;</li><li>**D9** removal discards with zero writes;</li><li>**D10** ticks (positive control at both SHAs);</li><li>**D11** standalone `DashboardModule` without a registration: the Clock records and recovers with no participation and no throw;</li><li>**D12** `beforeunload` only with drafts;</li><li>**D13** D2 and D6 repeated inside `<StrictMode>`: the same outcomes, with no inert aggregator after the effect re-run.</li></ul> |
| `continuity-export` | §7 item 1 and the Sol-layer lifetime (A→B→locked→A and an epoch change with a held device-key lock); an unrelated held account lock does not delay; unmount refusal; §8 apart from the native disk shapes (memory-only under total denial, liveness rechecks, setup failure, unmount cancel, export of a pending draft) |
| `original` | The archive's own dashboard-widgets and dashboard-grid tests |

- Install a Web Lock fixture with exclusive semantics (pattern: `appearanceLockFixture.ts`).
  - A pass-through stub cannot prove a held lock.
  - An accidental `lock-unavailable` result is a fixture failure, except in the cases that test lock unavailability on purpose.
- Use an attempt-counting Storage injector that is proven to fire.
- Stub `window.confirm` with a recorder (the Appearance sign-out step must make zero calls).
- Drive real `accountScope` transitions.
- Select controls only through the §5 stable selectors and accessible names.

**Parent host baseline** (`web-dashboard-clock-recovery-independent/`, jsdom, production `App`):
- host rows b–h, j, k, m and n, and the drafted half of row i, as correct before failures;
- rows a, l, o and p, and the idle half of row i, as positive controls that must PASS at `419e56d`;
- one clean positive control;
- the cross-caller domain scan above.

**Native before** (parent, Chrome, production `App`):
- H1–H5 in EN and ZH;
- H9 per-stop focus measurements, using the §9 method;
- H10 target sizes;
- the widget box and the default pet box at every width, including 768×1024;
- provenance and the K-1 key audit.

Only the auth session may be synthetic.

**Clock F1-shape before** (parent). A new runner `web-dashboard-clock-recovery-f1/verify-f1-clock.mjs` and host fixture reuse the frozen F1 prelude read-only and hash-checked. They send no `nativeVirtualKeyCode` and audit keys (K-1). Its `selfcheck` mode must be harness-valid. Its `clock` mode records:

| Case | Scenario | Correct before state |
| --- | --- | --- |
| c1 | Back (POP) from the Dashboard with a failed Clock choice; then a successful Clock Retry | `before-not-held`: no Clock draft exists, and the POP is not held |
| c2 | AppRail with a failed Clock choice; then dialog Discard | `before-not-held` |
| c3 | Back with a failed Header note save and a failed Clock choice; then Clock Retry success (the hold must continue); then Header Retry success (one release) | `before-header-only`: the hold exists only for the Header, and the Clock has no draft |
| c4 | Sign-out from the Dashboard with a failed Clock choice; Stay, then Discard | `before-not-held` |

None of these is an F1 signature. Fixed, each must show one live `proceed()` where a release is expected, zero non-live blocker calls, one router location commit per release and no `Invalid blocker state transition`.

**Validity and positive controls.**
- Every case asserts its preconditions before its business assertion: control found, seeded bytes present, fault armed and observed.
- A failed precondition is a fixture or selector error. It is never counted as a product failure.
- At `419e56d`, a missing recovery block, Export or hold is a business failure, never a precondition failure.
- These must pass at `419e56d`:
  - zero-write mount, including the ghost;
  - absent defaults;
  - exact bytes for all 17 values through the UI;
  - cross-document live update of an idle widget;
  - D1, D10, host row l and the Header suites;
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
| H5 | With an unsaved Clock choice, leaving the Dashboard by AppRail, Back, a widget `goTo` or sign-out is never held, `beforeunload` never warns, and nothing can be exported |
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

## 13. Gates

The E-numbers refer to §14. A row is complete only when every listed item exists.

| Gate | Required complete evidence | Checklist items |
| --- | --- | --- |
| 1. Both fields | <ul><li>All 17 values with exact bytes and defaults.</li><li>Zero-write mounts, including the ghost.</li><li>Every malformed value and a throwing read per key, with Reload only and no throw.</li><li>Every failure kind with the latest choice kept and Retry, per field.</li><li>A value equal to the default is stored.</li><li>No success claim.</li><li>Targeted Discard with zero writes and zero sibling reads.</li><li>Both fields unresolved; a conflict plus an unrelated quota failure; late completions ignored.</li></ul> | E1, E2, E6, E7, E9 |
| 2. Ordering and latest intent | <ul><li>§5 items 4–6 with a real held lock.</li><li>Rapid choices and coalescing with final bytes.</li><li>The predecessor and latest orderings; pending Retry inert.</li><li>Uncertainty with one write; external conflict, including restoration and removal.</li><li>New work after Discard survives.</li></ul> | E1, E2, E7, E9 |
| 3. Departure participation and Header equivalence | <ul><li>§6 items 1–9.</li><li>Sol `departure` D1–D13.</li><li>Host rows c–g and k–n in jsdom and natively.</li><li>Single-participant equivalence through the Header's accepted suites.</li></ul> | E1, E2, E3, E7, E8, E11, E17 |
| 4. Device continuity and export | <ul><li>Sol-layer A→B→locked→A and an epoch change with a held device-key lock.</li><li>No account key, lock or marker touched; an unrelated held account lock does not serialize.</li><li>Unmount refusal.</li><li>Memory-only export under total denial with attempt counters; setup and click failure; unmount cancel.</li><li>Exact native disk JSON for all seven §8 shapes.</li></ul> | E1, E2, E7, E10 |
| 5. Production host and protection | <ul><li>The complete §9 matrix rows a–p in the production App, with history counters and runtime-error gates.</li><li>New-document reload with zero mount writes; a native held lock; native uncertainty; a second-document conflict.</li><li>The Clock F1-shape cases c1–c4, before and fixed.</li></ul> | E3, E4, E5, E8, E9, E11, E16 |
| 6. Downstream, crash safety, invariance and isolation | <ul><li>§10 items 1–11.</li><li>H4 and H7 before evidence.</li><li>The before byte, default and reader controls PASS at `419e56d`.</li></ul> | E2, E4, E7, E12, E18, E19, E20 |
| 7. F1 regression | <ul><li>The 12 frozen F1 invocations PASS at the fixed SHA with unchanged runner hashes.</li><li>The Appearance F1-shape `selfcheck` and `appearance` modes PASS through the K-1 corrected copy.</li><li>The Clock F1-shape mode: before at `419e56d`, and fixed PASS.</li></ul> | E5, E15, E16 |
| 8. Presentation and keyboard | <ul><li>EN/ZH at five widths: pet-hidden hit-tests, the pet-on R-PET run, 44×44 for new targets, containment and overflow, the CSS-scope audit, manual screenshots.</li><li>Per-stop focus visibility in every selection state and theme (F-APP-1/2).</li><li>Keyboard, including the focus targets and the K-1 audit.</li></ul> | E4, E13, E14 |
| 9. Affected caller and final regression | Independent reruns from the fixed archive: <ul><li>the Header (E17);</li><li>both dashboard packages (test, typecheck, lint);</li><li>the Web package (test, check-types, lint) and CmdK;</li><li>storage check-types;</li><li>the accepted-caller suites per E24, including the corrected copies (C-FB002, C-FD1, OE) beside their frozen originals.</li></ul> Any selector outside the §9 scopes needs the affected callers' native visual modes. Any shared delta needs impacted engine, hook and caller reruns plus fresh acceptance | E6, E17–E25 |

**Acceptance condition.**
- Every row must reconcile four things: the source, a correct before failure, fixed independent behaviour, and the actual user surface.
- Every §14 item must be cited with its artifact path and SHA-256. A missing item blocks acceptance.
- The caller cannot be closed by any of the following:
  - converting the bindings without departure participation;
  - an aggregator that changes any single-participant Header outcome;
  - a coordinator, router, `DashHeader.tsx` or App edit;
  - a ghost that writes or registers;
  - any success claim;
  - keeping a legacy or raw write;
  - silent defaulting of malformed bytes;
  - shipping recovery without the export, cross-document, isolation and clean-state invariance evidence.

## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; the lockfile gate recorded; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references | Sol | `419e56d` | 1–4 |
| E2 | Sol before logs for the six §12 modes. Per-case outcomes for H1–H6 as exercised; positive controls PASS (H7, H8, D1, D10). Zero precondition failures | Sol | `419e56d` | 1–4, 6 |
| E3 | Parent jsdom host before log (production `App`): rows b–h, j, k, m and n and the drafted half of row i as correct FAILs; rows a, l, o and p, the idle half of row i, and a clean control PASS. Also the cross-caller domain scan (§12) | Parent | `419e56d` | 3, 5 |
| E4 | Native before, production `App`: H1–H5 in EN and ZH; H9 per-stop focus measurements; H10 sizes; widget and pet geometry at every width, including 768×1024; provenance; the K-1 key audit | Parent | `419e56d` | 5, 6, 8 |
| E5 | The new Clock F1-shape runner and host fixture (frozen prelude reused read-only and hash-checked; no `nativeVirtualKeyCode`; key audit); `selfcheck` harness-valid; the `clock` before log (c1–c4) | Parent | `419e56d` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only 419e56d <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` under `docs/reviews/web-dashboard-clock-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all six modes PASS, with zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS: every row a–p and the clean control | Parent | fixed | 3, 5 |
| E9 | Native controls: 17 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only per key with Reload; a native held lock; uncertainty with one write; a second-document conflict; per-field failure, Retry and Discard | Parent | fixed | 1, 2, 5 |
| E10 | Native export: the seven §8 disk shapes under total denial (counters, URL, anchor, unload warning, hold), plus one setup failure | Parent | fixed | 4 |
| E11 | Native host matrix rows a–p with history counters, runtime-error gates and the K-1 key audit | Parent | fixed | 3, 5 |
| E12 | Native downstream and isolation: CmdK committed bytes; zero `StorageEvent` and bus events; the other-key snapshot unchanged; clean-state `.module-dashboard` invariance against `419e56d` (EN/ZH; 375 and 1440; popover closed and open; frozen page clock) | Parent | fixed and `419e56d` | 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests, the pet-on R-PET run, 44×44 for new targets, containment, overflow, the selector audit (append-only, scopes, class-usage control), the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (pet captures also `419e56d`) | 8 |
| E14 | Keyboard and focus: Tab order, Enter/Space once, the focus targets, the per-stop focus pixel comparison across selection states and themes (F-APP-1/2), the K-1 audit | Parent | fixed | 8 |
| E15 | F1 regression: `verify-f1.mjs` sticky, more and collaborate; `verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro; `verify-f1-race.mjs` race; `verify-f1-features.mjs` selfcheck and features. All 12 PASS with unchanged runner hashes. Also the Appearance F1-shape `selfcheck` and `appearance` modes through the K-1 corrected copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` | Parent or final verifier | fixed | 7 |
| E16 | Clock F1-shape fixed log PASS for c1–c4: one live `proceed()` per expected release, zero non-live blocker calls, one location commit per release, zero runtime errors, no `Invalid blocker state transition` | Parent or final verifier | fixed | 5, 7 |
| E17 | Header affected-caller rerun:<ul><li>`../web-dashboard-header-departure-independent/verify-fixed.mjs`: departure 5/5, advanced 5/5, followon 2/2;</li><li>`../web-dashboard-header-departure-native/verify-native.mjs`: the 18 modes of `affected-callers-f359be6.md` §3.7, record sequences equal to the accepted ones;</li><li>the Header Astra (`../web-dashboard-header-departure-astra/verify-fixed.mjs`) and Sol (`../web-dashboard-header-departure-sol/verify-fixed.mjs`) suites as unchanged controls, with counts equal to their accepted receipts</li></ul> | Parent or final verifier | fixed | 3, 9 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `419e56d` | Final verifier | `419e56d` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff | Final verifier | `419e56d..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for both keys | Sol and final verifier | fixed | 6, 9 |
| E21 | `xai-web-dashboard-widgets` full test, typecheck and lint from the fixed archive, plus its unchanged tests at `419e56d` as a before control | Final verifier | fixed and `419e56d` | 9 |
| E22 | `xai-web-dashboard-grid` full test, typecheck and lint, plus its unchanged tests at `419e56d` (25 files / 228 tests at `73b4eb9`) as a before control | Final verifier | fixed and `419e56d` | 9 |
| E23 | Web package test, check-types and lint; CmdK package test | Final verifier | fixed | 9 |
| E24 | Accepted-caller suites, with counts compared to their accepted receipts (runners and commands as in `../web-appearance-recovery-final/review-final-regressions-419e56d.md` §2–§3), **running each corrected copy beside its frozen original**:<ul><li>**Appearance:** Sol `bytes`, `fields`, `reset`, `queues`, `host`, `retry-all`, `original`; `continuity-export` frozen (recorded as it falls; 006/007 are OE-1/OE-2) **and** the OE corrected copy (`../web-appearance-recovery-oracle-erratum/verify-erratum.mjs … corrected`, 26/26); host 33; package 137.</li><li>**Features:** Sol bytes 17, fields 49, reset 31, queues 40, continuity-export 26, original 6; `downstream` frozen (case 012 recorded) **and** the C-FD1 corrected copy (`../web-appearance-recovery-final/diag-features-sol-corrected.mjs`, 15/15); host 40; package 45.</li><li>**More:** Sol fields 22, reset 20, queues 14, owner-export 13; `boundaries` frozen (recorded as it falls) **and** the C-FB002 corrected copy (`../web-more-recovery-fb002/verify-fb002.mjs … corrected full`, 10/10); original 15; host 11.</li><li>**Others:** Sticky Sol 109, original 10, host 28. Notifications Sol 41, Astra boundaries 24, Astra host 15, parent host 12. Date & Time 7. Settings-shell 54; settings-rest 44 files / 314 tests.</li></ul> | Final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict | Final verifier | — | 9 |

**Rules.**
- E1–E5 must be committed before Terra starts.
- E25 is produced last and enumerates every other item.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- A frozen More `boundaries` failure, a frozen Features `downstream` case 012 failure and frozen Appearance `continuity-export` cases 006/007 are judged by their corrected copies (C-FB002, C-FD1, OE). A corrected copy failing is a regression.
- Every native runner written for this caller sends no `nativeVirtualKeyCode` and audits keys (K-1). Reused frozen runners that send none run unchanged.
- If a reused frozen runner refuses at a precondition bound to an earlier caller's product delta, the verifier commits that refusal log and then runs a copy that replaces only that precondition with a stricter one naming this caller's §11 delta. This follows the Appearance E25 precedent (`../web-appearance-recovery-final/review-final-regressions-419e56d.md` §2.3, deviation 1), and the deviation is disclosed for acceptance. Every other precondition and assertion stays unchanged.

## 15. Lessons and limitations converted

| Lesson or retained limitation (source) | Clock treatment |
| --- | --- |
| F1: the coordinator regression oracle must keep running (F1 closure) | **Gate.** All 12 frozen F1 invocations plus the Appearance F1-shape through its K-1 copy (E15). A new Clock F1-shape runner covers release after Retry, dialog Discard, the combined hold and sign-out (E5, E16). No coordinator change is permitted |
| G1: a gate item had no scheduled runner (Sticky) | **Gate.** The single §14 checklist and the enumerated E25 receipt; acceptance blocks on any missing ID |
| F-B002: a test spy re-entered storage; the frozen More oracle is nondeterministic | **Rule.** §12 F-B002 rule with a self-check (E1). E24 runs the corrected More oracle beside the frozen one |
| OE-1/OE-2: two frozen oracles contradicted the contract and each other (Appearance) | **Rule.** The §12 consistency matrix, cross-referenced to cases in E1. The conflict-seeding rule is explicit (row 4) |
| F-FD1: an oracle seeded an out-of-domain value; a caller that tightens a domain can break accepted oracles | **Rule.** In-domain seeds (§12), and the cross-caller domain scan before Terra (E3). Corrected copies are prepared before E24 if any are needed |
| K-1: `nativeVirtualKeyCode` caused trusted key streams in headless Chrome | **Rule.** New native runners never send it, and they audit presses against keydowns (§9, E4, E5, E11, E14) |
| F-APP-1/F-APP-2: focus was masked by a selection ring or by `outline: none` | **Gate.** Per-stop pixel comparison across every selection state and theme (§9, E14). Repairs are limited to appended `.w-clock-body` rules |
| R-PET: the App-level pet covered a moved control, and the gated runs had excluded it (Features acceptance §5.1) | **Rule.** §9 states how the pet and every other global overlay are judged: gated pet-hidden runs, and a pet-on run that blocks only for controls this caller adds |
| E6: the implementer's run existed only as a commit-message self-report (Features acceptance §5.5) | **Rule.** A reserved Terra evidence path (§11); E6 cites its logs with SHA-256 |
| Regressions must run the corrected copies (C-FB002, C-FD1, OE) beside the frozen originals | **Gate.** E24 names each pair and its runner |
| 44×44 applies only to a caller's new or changed targets (Appearance acceptance ruling 11) | **Rule.** §9. Existing Clock sizes are recorded (H10) |
| A shared change silently changed an accepted caller's behaviour (F1) | **Gate.** Single-participant equivalence (§6 item 6), D1, host row l, and the Header reruns (E17) |
| Host compositions lacked App-level readers and overlays | **Gate.** Every host, native and visual row runs in the production `App` (§9) |
| Affected callers' visual modes were not rerun after a shared change (Sticky follow-up 6) | **Rule.** Clean-state Dashboard invariance (§10 item 6, E12) instead of rerunning the Header's visual modes; anything outside the §9 CSS scopes triggers them |
| Keyboard Discard all left focus on `<body>` (Sticky follow-up 1) | **Gate.** The §9 focus targets: never `<body>` after any action of this caller |
| Retained exclusions: headless Chrome and synthetic accounts; not Tauri; synthetic `beforeunload`; development build without StrictMode; reused dependency trees | Retained. The lockfile gate is a consistency check only. StrictMode's effect re-run is now covered in jsdom (Sol D13, §6 item 1), because the aggregator's lifetime depends on it |

## 16. Exclusions

**Not part of this caller:**
- DASH-02's timezone semantics: static offsets without DST (`cityLibrary.ts:1–6`), and distinguishing the system timezone from a chosen one. The caller makes the persisted choice truthful only.
- The World Clocks widget (`xai_zones`, DASH-03), the Dashboard grid's order, layout and appearance persistence and its departure participation, and every other widget.
- Any change to the Clock's face, the city list, the popover content or its keyboard behaviour. No Escape handling is added, and focus after a keyboard timezone choice is unchanged (UX-05).
- Enlarging the existing Clock targets (UX-05).
- A Reset, Retry all, Discard all, success line or status line.
- Holding or confirming widget removal (A7).
- Any change to the coordinator, router, `settingsDeparture`, the app registrations, `App.tsx`, the Header or the shell.
- SHELL-05/SHELL-06 (pet persistence and avoidance), and moving or restyling the pet.
- Repairing malformed stored bytes (REL-07). A valid choice over malformed bytes stays a failed draft, because the engine refuses an invalid source. This is a disclosed change from `419e56d`, where the legacy write simply replaced such bytes on the next choice; the same policy was accepted for Appearance (A6).
- On a browser without Web Locks every Clock write is refused and reported, never written unfenced (D2 entry contract item 3).
- A write already in flight when Discard, dialog Discard or removal runs may still commit the latest choice (§5 item 8).
- The browser's multiple-download permission prompt for the second file of a combined dialog Export (§8 shape 6).
- D2, global reset, migration, deletion or data-export changes.
- Tauri and native window capability.
- Production authentication and live logout.
- Crash and forced-authentication durability, and drafts lost when a scope change remounts App (REL-09).

**Not closed by this caller:** REL-05, REL-07, REL-09, DASH-02, DASH-03, SHELL-05, SHELL-06, UX-03, UX-05, QA-01, QA-03, QA-04, QA-09, D2/REL/AI, or any other 312 item.

**Not authorized:** deployment, release, branch promotion or Web→Desktop sync. Any later Desktop flow needs the ADR-0013 D3 gate.

**Recommended evidence directories:** `docs/reviews/web-dashboard-clock-recovery-{sol,independent,native,f1,terra,final,acceptance}/`.
