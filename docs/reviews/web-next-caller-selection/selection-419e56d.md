# Next complete recovery caller: selection at `419e56d`

Astra-role selection memo (risk, design and final-decision role, executed by an independent Claude Opus 5.5 instance in an isolated detached worktree), module `web`, 2026-10-05, control-plane batch 54.

**What this memo is.** A scheduling recommendation for the controller. It re-verifies the previous selection memo ([selection-5cd63ff.md](selection-5cd63ff.md)) at the current product, compares eight candidate complete callers, recommends one, and classifies every pre-decision as either **(a) controller-decidable** (a scope or technical decision inside the `web` module) or **(b) product-owner decision** (product behaviour, a UX policy, or an open ledger product question). Every pre-decision has options and a recommendation.

**What this memo is not.** It accepts nothing, authorizes no implementation, freezes no baseline, changes no formal count and **closes no 312 item**. The recommendation takes effect only after the controller has checked it and registered it (`CURRENT-CONTROL-PLANE.md` "下一步", lines 371–380). Product-owner decisions go to the user.

## 1. Fixed point and inputs

| Item | Value |
| --- | --- |
| Docs checkout | Detached `b4e190e88b05b73165ddba0951a5e1fb2578af5c`, clean |
| Product | `419e56de9f23e4467fea806fbd4a990e1f429941` (tree `7aabbd832be446aeca1441eff34f2fd35945290a`). `git diff --name-only 419e56d HEAD -- apps packages package.json pnpm-lock.yaml` is empty |
| Lockfile | SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`, unchanged since `5cd63ff` |
| Product delta since the previous memo | `git diff --stat 5cd63ff 419e56d -- apps packages package.json pnpm-lock.yaml`: 26 files, +4111/−666, exactly the Appearance contract r3 §11 set (2 under `apps/web/src/`, 19 under `packages/xai-web-settings-appearance/`, 5 under `packages/xai-web-shell/`). Every other source file is byte-identical, so every non-Appearance fact below sits on the same bytes as at `5cd63ff`; I re-derived each one rather than copying it |
| Scheduling authority | [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md): follow-on groups (lines 13–23) and the selection rule (line 25) |
| Inventory | [refresh-419e56d.md](../web-d2-pref-binding-inventory/refresh-419e56d.md) and `bindings-419e56d.json`: 23 files, 48 direct bindings, 31 setter bindings. Scheduling input only. Its boundary excludes `.ts` files, `apps/`, ordinary and raw writers, wrappers, `getPref` readers and `usePrefAutosaveAsync`, so every candidate was re-searched by hand |
| Own search | `git grep` at `419e56d` over `apps/` and `packages/` (all extensions; `__tests__`, `*.test.*` and `docs/` excluded unless stated) for `usePref(`, `usePrefAsync`, `usePrefAutosave(Async)`, `setPref`, `removePref`, `setPrefAutosave`, `mutatePref`, `localStorage`/`sessionStorage` `setItem`/`removeItem`, `new StorageEvent(`, `<SettingsFooter`, `resetAllPrefs(` and every key named in §5 |
| Account-lifecycle boundary | [D2 entry contract](../web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md): device-only keys "stay under their classified device contract" (item 2, line 10); ordinary AI secrets, business wrappers, timers and Board domain engines need the shared lifecycle lock (lines 19–28) |
| Accepted precedents | Date & Time `d0d934d`; Notifications `ad223a2`; More `27adb10` with C-FB002; Sticky `699f6e6`; Features `ec55f9e` with C-FD1; Smart Lists, Collaborate, Pomodoro and Dashboard Header (`73b4eb9`, Astra acceptance `web-dashboard-header-departure-astra/acceptance-73b4eb9.md`); **Appearance `a560863`** (contract r3 `706c9a3`, the structural template; acceptance `web-appearance-recovery-acceptance/acceptance-419e56d.md`) |
| Ledger | `ALL-TODO-CURRENT.md`: REL-05/07/09/10/11 (lines 88–94), CAL-01 (167), DASH-01/02/03 (246–248), SET-02/03 (313–314), SET-08 (319), SET-10 (321), SET-15 (326), SHELL-04/05/06 (337–339), UX-03/04/05 (350–352) |

## 2. Selection rule applied

A candidate qualifies as the next complete caller only if (`remaining-writers.md` lines 16–25; batch 54 brief):

1. **Complete.** Every writer form of its keys is inside the unit: direct `usePref`, explicit `setPref`/`removePref`, raw storage, host and shell writers, wrappers, callbacks, events and resets. Read-only rows are audited, not assumed converted.
2. **Genuinely shared producers are combined**, so no false end-to-end success claim remains (line 25).
3. **Bounded inside the `web` module without a D2 shared-layer change:** no change to the storage engine, hooks, registry, ownership, codecs or lifecycle, and no change to the departure coordinator or router. Protected host or package files may enter a contract only by an explicit (a) controller authorization with affected-caller reruns.
4. **Ordered by** product risk, user impact, size, shared surface, dependencies on unaccepted work, reusable accepted evidence and the required pre-decisions.

A contract is written only for a recommended candidate that needs no (b) decision, no D2 shared-layer change and nothing outside `web`. Its (a) decisions become assumptions awaiting controller confirmation.

## 3. Facts from `selection-5cd63ff.md` re-checked at `419e56d`

### 3.1 Changed

1. **Candidate B is accepted.** CP-APPEARANCE-01 was accepted at `a560863` on product `419e56d` (26 files). B leaves the candidate list.
2. **App root state.** `App.tsx` now creates one App-scoped Appearance controller (`App.tsx:120–128`) and passes its edits to the Topbar (`:199–212`). `petOn` is still `useState(true)` but now at `App.tsx:118` (previously `:132`). `DesktopPet` is mounted at `:214`. The voluntary sign-out runs the Appearance step before each `requestSettingsDeparture("sign-out")` (`:155–184`).
3. **Previous fact 10 no longer holds for the root keys.** Malformed `xai_pref_lang`, `xai_pref_font_scale` or `xai_accent_hue` bytes no longer reach the throwing helpers: the controller validates them, and Appearance E13 showed crash safety for every malformed value. The helpers themselves (`plugin-web-tokens`) are unchanged.
4. **`SettingsFooter` has no production mount at all** (previous fact 2 said Appearance was the only one). `resetAllPrefs` still has no production caller. `web:settings:preference-changed` now has no production emitter or subscriber; only the declaration in `packages/core/src/types/events.ts:193` remains. The previous memo's §9 observation 1 has come true.
5. **The Topbar no longer writes storage** and the shell tests that encoded the raw write were replaced (previous fact 12).
6. **Inventory:** 51 → 48 bindings, 24 → 23 files. The only removed rows are `AppearancePane.tsx:52, 53, 55` (`refresh-419e56d.md` lines 47–62).
7. **The route-independent seam now exists, but it is Appearance-specific.** It consists of the `appearanceStatus` slot (`Topbar.tsx:114–117`, `Shell.tsx:84`, shell `types.ts:131, 205`), the controller's `beforeunload` and its `confirmSignOut`. The previous memo's E-4 ("reuse B's seam") therefore no longer means reusing a generic seam: a later App-lifetime shell caller (AppRail order, DesktopPet) must either widen that slot or add a sibling slot and a second sign-out step, editing the protected shell and `App.tsx` again.
8. **Shared-engine note.** The open-ended `usePrefAutosaveAsync` suffix branch now has a device-key production consumer (Appearance A4). A defect found there is a shared defect.
9. **New conditions to carry** (Appearance acceptance §6 and §9): OE-1/OE-2 (Appearance Sol `continuity-export` judged by its corrected copy), K-1 (native runners never send `nativeVirtualKeyCode` and audit keys), F-FD1/C-FD1 (Features `downstream` case 012 judged by its corrected copy), F-APP-1/F-APP-2 (per-stop focus visibility, repaired) and F-APP-3 (Topbar popover option focus, open under UX-05), the 44×44 ruling (only for a caller's new or changed targets) and the Topbar breakpoint erratum.

**Citation precision only.** CallbackPage's flag flip and event are at `CallbackPage.tsx:164–177` (previously cited `:163–176`).

### 3.2 Unchanged (re-derived on byte-identical source)

- Previous facts 7, 8, 9, 11 and 13 hold: the AI readers (`llmProvider.ts:166, 170`, `secretStore.ts:262`) and ordinary `saveKey`/`clearKey` without the account lifecycle lock (`secretStore.ts:227–242`); the Clock as a complete sub-caller (writers only `ClockWidget.tsx:265, 286, 309`; reader CmdK `readModuleStates.ts:38–39`); DesktopPet's per-`pointermove` and resize writes (`DesktopPet.tsx:114–123, 157–166`); storage's `BgTone` still admits `"sage"` (`registry.ts:46–53`); `xai_pref_dt_start_week` is still read only by its own pane (`dateTimePane.tsx:27`).
- Only Settings, Pomodoro and Dashboard mount a departure coordinator (`composedSettingsRegistration.tsx:78`, `pomodoroRegistration.tsx:12`, `dashboardRegistration.tsx:34`); `requestDeparture` resolves `true` when none is mounted (`settingsDeparture.ts:14–16`).
- Candidates C, D, E, E1, F and G: every cited source line is byte-identical (§5).

### 3.3 Newly recorded facts (true at both products)

- **N1 — AppRail crash path (hypothesis H-RAIL).** `xai_rail_order` uses the JSON codec (`registry.ts:174–181`). The legacy decode returns any parsed JSON except `null` (`codec.ts:57–62`; `storage.ts:146–154`), and AppRail iterates the stored value with `for … of` during render (`AppRail.tsx:46`). A stored `{}`, `1` or `true` would throw a `TypeError` inside the Shell, which renders inside `<App/>` under the `app` route error boundary (`router.tsx:41–43`), so every `/app` route, including Settings, would show the route error until site data is cleared. No test seeds a non-array value. This is unverified static analysis, in the same class as Appearance's confirmed H6.
- **N2 — Legacy setters update the UI only on success** (`usePref.ts:141–147`). Under a storage failure every control still bound through legacy `usePref` silently stops responding: Clock style and timezone, Calendar view and week start, AppRail reorder, pet drag, Board selections, Integrations Disconnect and the AI settings.
- **N3 — The Dashboard grid's own recovery is not departure-protected.** `DashboardModule` passes `registerDepartureGuard` only to the Header (`DashboardModule.tsx:158`), so failed order, layout or appearance saves (`DashboardSaveRecovery`, `DashboardModule.tsx:171`, `DashboardGrid.tsx:127–129`) are lost on navigation. That recovery has prior bounded evidence (`web-dashboard-grid-independent/review.md`, PASS at `33723a1`).
- **N4 — A dragged widget renders twice.** `DashboardGrid` renders the dragged widget a second time in `WidgetGhost` with the same context (`DashboardGrid.tsx:164–166`); the ghost has `pointer-events: none` (`plugin-web-tokens/src/layout.css:3633–3641`).
- **N5 — The widget context type is duplicated.** `@repo/plugin-web-dashboard-grid` depends on `@repo/plugin-web-dashboard-widgets` (its `package.json`), so the widgets package keeps its own structural copy of `WidgetRenderContext` (`registrations.tsx:24–28`). A widget-facing addition must be made in both, without a new package dependency.
- **N6 — The AI chat toggles** `xai_ai_insights` and `xai_ai_voice` (device) already have prior bounded verified recovery (`web-ai-preference-independent/review.md`, VERIFIED at `24da17d` for save recovery and Discard). The AI route mounts no coordinator.
- **N7 — Clock targets.** The Clock style buttons are 22×20 in tokens (`layout.css:3708–3714`) and are forced to 44×44 only between 641 and 1024 px (`xai-web-dashboard-grid/src/styles.css:1234–1257`). The timezone popover has no Escape handling and closes on a scrim click (`ClockWidget.tsx:273–279`). Both are pre-existing (UX-05).

## 4. Comparison at a glance

| # | Candidate (follow-on group) | Keys / owners | Product risk | User impact | Size | Shared surface touched | Dependencies on unaccepted work | Evidence reuse | Pre-decisions (§7) | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **E1** | **Dashboard Clock widget: style and timezone** (Dashboard widgets and shell) | 2 device, registered `string` codec | **Low.** Hypotheses: a failed choice is silently dropped (N2); malformed bytes are silently defaulted; nothing to protect on departure or unload | Low: one widget, though the first in the default Dashboard order (`registry.ts:124–136`) | M: one widget, plus Dashboard departure aggregation | `xai-web-dashboard-grid` `DashboardModule.tsx`, `DashboardGrid.tsx` and `types.ts`, i.e. the accepted Header's guard path. Coordinator, router, storage, tokens and `apps/` unchanged | None | Medium-high: Header host, native and F1 runners; Features and Appearance lock fixtures and production-App native harnesses; the K-1 corrected F1 copy | (a) only: E1-1 … E1-9 | **Recommended**; contract written |
| E-R | AppRail order (Dashboard widgets and shell) | 1 device, registered `json` codec | **High** (hypotheses): H-RAIL whole-`/app` crash (N1); silent drag no-op on failure (N2); a write on every `dragover` that changes order; disabled modules' positions dropped (SET-03) | Medium | M–L | Protected shell (`AppRail.tsx`; Topbar, Shell and shell types for a status slot) and `App.tsx`, all just changed by Appearance | None | Medium: the Appearance seam as a pattern, F1 runners | **(b) R-1 (SET-03)**; (a) R-2, R-3 | **Next, once R-1 is decided** |
| E-P | DesktopPet: id and position (same group) | 2 device, plus 1 new key for the hidden state | Medium: every `pointermove` writes (`DesktopPet.tsx:114–123`), so under a storage failure the pet cannot be dragged (N2) | Medium | M | Pet package, App `petOn`, and a storage ownership entry for the new key (shared layer) | SHELL-05 | Low-medium | **(b) P-1 (SHELL-05)**, plus a shared ownership entry | Later |
| E-W | World Clocks zones (same group) | 1 account (`xai_zones`) | Low-medium | Low | S–M, reusing E1's aggregation | E1's Dashboard aggregation | DASH-03; E1 | Medium after E1 | **(b) W-1 (DASH-03)** | After E1 and W-1 |
| F | Calendar view and week start (Calendar and Tasks adjuncts) | 2 device | Medium: both controls stop responding under a storage failure (N2); the week start is split from Date & Time | Medium | M | A new Calendar departure seam (protected host route file) | SET-08 / CAL-01 | Medium | **(b) F-2**; (a) F-1 | Later |
| C | Integrations pane + OAuth `CallbackPage` (AI settings and integrations) | 3 account | Medium-high: "connected" claimed from a local boolean; the callback flips the flag before any verified persistence | Low: every `clientId` is `""` | M | Callback route outside the Settings coordinator | SET-10 | Low | **(b) C-1 (SET-10)**; (a) C-2 | Later |
| D | Settings → AI preferences and ordinary secrets (same group) | 3 account + 1 device + secrets | High | High | L | **D2 shared layer** (`secretStore` lock participation) and network | D2 secret participation; AI-06; REL-02 (`verification_pending`) | Low | D-1 (a) but a shared-layer change; **(b) D-2 (SET-15)** | Later; excluded by the shared-layer rule |
| G | Board variants and workspace | Account; receipt-preserving domain engines | Very high | High | XL | Domain engines; D2 account lock | Accepted Board receipts and D2 | Low | G-1 (a), shared layer | Later; excluded |
| — | Not compared in depth: Dashboard grid order/layout/appearance (N3, prior bounded recovery; "reconcile its full current contract before any rewrite", `remaining-writers.md` line 18); AI chat insights/voice (N6); widget data stores (Weather DASH-08, Stickies DASH-10); Premium (SET-05); groups 6–8 (business wrappers, timers, lifecycle/secrets) | — | — | — | — | Groups 6–8 need the D2 shared lifecycle lock | — | — | — | Not eligible now |

## 5. Candidates in detail

Line numbers are at `419e56d`.

### E1. Dashboard Clock widget (recommended)

**The two fields and every writer.**

| Field | Physical key (device; physical = logical) | Registry | Writers | Readers |
| --- | --- | --- | --- | --- |
| Style | `xai_clock_style` (`accountOwnership.ts:28`) | `string`, default `"classic"` (`registry.ts:268–275`) | Style toggle, `setStyle(st.id)` (`ClockWidget.tsx:265`) | The widget (`:51, 56`); CmdK `readModuleStates.ts:38` → `adapters/dashboard.ts:96–106` |
| Timezone | `xai_clock_tz` (`accountOwnership.ts:29`) | `string`, default `"local"` (`registry.ts:277–284`) | Popover, `setTz("local")` (`:286`) and `setTz(c.id)` (`:309`) | The widget (`:52, 61–75`); CmdK `readModuleStates.ts:39` (read, unused by the adapter) |

- **No other writer** exists in tracked source: no `setPref`/`removePref`, raw, wrapper, reset or event writer of either key anywhere in `apps/` or `packages/`. The literal keys occur elsewhere only in `accountOwnership.ts`, `registry.ts`, CmdK and tests.
- **As-is behaviour.** Both bindings use legacy `usePref` (`:51–52`). A failed write is a silent no-op (N2). An invalid stored style displays Classic (`:36–42, 56`) and an unknown city id displays Local time (`:61–75`), both silently. There is no Retry, Discard, Reload, export, departure or unload protection.
- **Ownership and lifecycle.** Both keys are explicit device keys, so `lifecycleForKey` gives device-preference, device-recovery, retain and retain-on-device (`lifecycleDeclaration.ts:25–34`). No account machinery applies (D2 entry contract item 2), and device writes skip the account lock (`prefMutation.ts:244`).
- **No shared-layer change.** The registered path `usePrefAutosaveAsync("xai_clock_style", { validate })` composes a caller validator with the `string` codec (`usePrefAutosaveAsync.ts:37–58`) and reproduces today's raw bytes.
- **The one structural obstacle is departure protection.**
  - Widgets render with `{ lang, now, goTo }` only (`DashboardGrid.tsx:121`; `types.ts:45–55`; the copy at `registrations.tsx:24–28`).
  - The Dashboard route's coordinator keeps a single guard: the last registration wins, and an unregister clears it only on a token match (`departureCoordinator.tsx:76, 83–92`).
  - The accepted Header already holds that guard through `DashboardModule.tsx:158` → `DashHeader.tsx:784–798`.
  - A Clock caller must therefore aggregate guards (E1-1, E1-2) without touching the coordinator.
- **Two further traps the contract must close:** the drag ghost renders a second Clock instance (N4), and widget removal unmounts the Clock (`WidgetShell.tsx:291–300` → `DashboardModule.tsx:90–103`).
- **Supports without closing:** REL-05, REL-07, UX-05, and DASH-02's "无效时区恢复" only in part. An invalid stored timezone becomes visible and safe, but it cannot be repaired from the UI (REL-07), and the fixed UTC offsets without DST (`cityLibrary.ts:1–6`) stay.

### E-R. AppRail order

- **Writer.** `onDragOver` rebuilds the order from the feature-filtered registry and writes it on every `dragover` that changes position (`AppRail.tsx:37, 43–62, 85–90`). **Reader:** AppRail itself. **Owner:** device (`accountOwnership.ts:106`).
- **Risk.** H-RAIL (N1) is the highest remaining product-risk hypothesis outside D2: one malformed byte would disable every `/app` route, and no UI could repair it. N2 makes a failed drag a silent no-op.
- **Why not first.**
  - **R-1 (b).** A drag writes only the visible order, which drops the stored positions of modules hidden by Features. Whether to keep them is part of SET-03's catalog decision ("关闭后的rail/search/deep-link一致", ledger line 314). Freezing today's pruning into oracles would decide SET-03 by default, and reversing it later would need corrected copies of accepted oracles (the F-FD1 lesson).
  - **Shared surface.** The rail lives for the App's lifetime, so its drafts need route-independent protection (R-2). That means a status slot and a sign-out step in the protected shell and `App.tsx`, the files the Appearance caller just changed. Every accepted caller renders inside them, so the shell-wide clean-chrome invariance gate would be needed again.

### E-P. DesktopPet

- **Writers.** Id via `onSelect={setPetId}` (`DesktopPet.tsx:188, 247`); position on every `pointermove` (`:114–123`) and on resize re-clamp (`:157–166`). Visibility is `useState(true)` in App (`App.tsx:118`) and is not persisted.
- **Why later.** SHELL-05 (P-1) asks for a persisted hidden state and a position written at drag end. The hidden state needs a new key, and therefore a storage ownership entry: a shared-layer change excluded by rule 3. It is also a pet-wide UX policy.

### E-W. World Clocks

- **Writers.** `WorldClocks.tsx:42`; an empty list shows four defaults without writing (`:46–52`); add and remove (`:57–65`); the last city cannot be removed (`:63`). Account key (`accountOwnership.ts:119`): the async engine's account lock applies with no shared change.
- **Why later.** DASH-03 (W-1, typed 决策 at ledger line 248) decides whether the list may be emptied, so the remove path's domain is open. The widget needs the same Dashboard aggregation as E1, so it should follow E1 and reuse it unchanged.

### F. Calendar adjuncts

- **Writers.** `CalendarModule.tsx:75` (`xai_pref_week_start`) and `:80` (`xai_calendar_view`), handlers `:84–91`. **Readers:** Statistics `StatisticsModule.tsx:87` (week start). **Owners:** device (`accountOwnership.ts:27, 105`).
- **Why later.** F-2 (SET-08/CAL-01) decides whether Calendar keeps its own week start, since the accepted Date & Time week start drives nothing (§3.2). F-1, the Calendar route's departure seam, is a host route change best designed once for both controls and, later, for the event composer. A view-only split is complete for `xai_calendar_view`, but it would touch `CalendarModule` twice and leave its sibling control on the legacy path.

### C. Integrations pane + OAuth `CallbackPage`

- **Writers.** Pane bindings and Disconnect (`integrationsPane.tsx:94–116`); `integrationDisconnectButton.tsx:37–44` emits `integration-disconnected` whatever the write result. The callback binds the same three flags (`CallbackPage.tsx:57–65`), flips one and emits `integration-connected` before any verified persistence (`:164–177`), then auto-navigates (`:123–194`). Connect stores sessionStorage state (`oauthState.ts:99–111`; cleanup `:55–59`) and leaves with `window.location.assign` (`integrationConnectButton.tsx:49`). **Owners:** account (`accountOwnership.ts:63–65`).
- **Why later.** Every `clientId` is `""` (`integrationProviders.ts:53, 64, 75`). SET-10 (C-1) decides what "connected" may claim and whether the callback flip survives. The callback route is a sibling of `:moduleId/*` (`router.tsx:52–55`), outside the Settings coordinator (C-2).

### D. Settings → AI

- **Writers.** Four bindings (`aiPane.tsx:49–63`); a provider change writes three keys (`:89–98`); key save, test and clear (`:100–110`, `:112–125`, `:131–138`) go through `aiKeyStorage` (`secretStore.ts:227–242`); the DEV seed writes three keys (`apps/web/src/dev/seedAiConfigFromEnv.ts:59–61`).
- **Why later.** Ordinary secret writes take no account lifecycle lock, and the D2 entry contract requires them to (D-1, a shared-layer change). SET-15 depends on AI-06 and REL-02, and its Test Connection semantics are a product decision (D-2).

### G. Board variants and workspace

- **Writers.** Inventory rows `plugin-web-board-core/src/BoardModule.tsx:53–54`, `plugin-web-board-views/src/BoardModule.tsx:83–85` and `BoardWorkspacesModule.tsx:341–355`, plus `taskLinkCommand.ts:58` (`setPref("xai_boards_v2", …)`).
- **Why later.** `remaining-writers.md` line 19 forbids replacing a receipt-preserving domain writer with generic preferences, and the accepted Board receipts must be reconciled with the D2 account lock first (G-1).

## 6. Recommendation

**Select E1: the complete Dashboard Clock caller (style and timezone), including Dashboard departure participation through a `DashboardModule`-internal guard aggregation.** The contract is [`../web-dashboard-clock-recovery-contract/contract.md`](../web-dashboard-clock-recovery-contract/contract.md) (proposed control-plane item `CP-CLOCK-01`).

Why E1 now:

1. **It is the only candidate with no (b) decision and no D2 shared-layer change.** Every other candidate needs at least one of SET-03, SHELL-05 (plus a storage ownership entry), DASH-03, SET-08/CAL-01, SET-10, the D2 secret slice or the D2 Board reconciliation (§7).
2. **Bounded inside `web`.** Both keys are explicit device keys on the registered path. No registry, ownership, codec, lifecycle, coordinator, router, tokens, shell or `apps/` edit is needed.
3. **Sequencing benefit.** The Dashboard departure aggregation it builds is the seam that World Clocks (after DASH-03) and the Dashboard grid's own unprotected recovery drafts (N3) need. It is designed once, generically, and its first consumer is low-risk.
4. **Evidence reuse.** The Header host, native and F1 runners have no delta-bound preconditions and run unchanged at a new SHA (as at `f359be6`, `web-sticky-recovery-f1/affected-callers-f359be6.md` §3.7). The Features and Appearance lock fixtures and production-App native harnesses are patterns.

**The honest trade-off.** E1's product risk and user impact are low. E-R carries the highest remaining non-D2 product-risk hypothesis (H-RAIL), but it cannot be contracted until the user answers R-1. **I recommend that the controller put R-1 (SET-03) to the user now**, in parallel with E1's before baselines, so that E-R can be contracted next. If the controller prefers to wait for R-1 and schedule E-R first, E1 can follow unchanged: its contract does not depend on E-R.

Why the others come later:

- **E-R (AppRail order)**: one (b) decision, R-1, and a second route-independent seam on the just-accepted shell and App surfaces. It is the strongest candidate after E1.
- **E-W (World Clocks)**: DASH-03 (b), and it should reuse E1's aggregation unchanged.
- **E-P (DesktopPet)**: SHELL-05 (b), and its hidden-state key needs a shared ownership entry.
- **F (Calendar)**: SET-08/CAL-01 (b) and a host departure seam.
- **C (Integrations)**: SET-10 (b).
- **D (AI) and G (Board)**: D2 shared-layer work that this batch's rule excludes.
- **Groups 6–8** are not UI callers and depend on D2.

## 7. Pre-decisions

### 7.1 Summary

| ID | Candidate | Decision | Class | Recommendation |
| --- | --- | --- | --- | --- |
| E1-1 | Clock | Scope: authorize edits to `DashboardModule.tsx`, `DashboardGrid.tsx` and `types.ts` in `xai-web-dashboard-grid` plus the Clock files, with Header reruns | (a) | Authorize exactly contract §11 |
| E1-2 | Clock | Departure participation mechanism | (a) | One combined guard from a `DashboardModule`-internal aggregator |
| E1-3 | Clock | Ownership and the drag ghost | (a) | One controller per mounted widget; the ghost gets no registration and stays inert |
| E1-4 | Clock | Persistence path | (a) | Registered `usePrefAutosaveAsync` bindings with caller validators |
| E1-5 | Clock | Domains and malformed bytes | (a) | Strict domains; refuse, never repair; source alert with Reload |
| E1-6 | Clock | Feedback and export surface | (a) | Recovery only for settled failures and source issues; no success line; inline Export |
| E1-7 | Clock | Unsaved Clock drafts when the widget is removed | (a), with an escalation note | Removal discards them with zero writes |
| E1-8 | Clock | Dispositions of existing tests | (a) | As contract §11 |
| E1-9 | Clock | R-PET rule and other global overlays | (a) | Pet-hidden gated; pet-on gated for new controls |
| R-1 | AppRail | SET-03: may a drag drop hidden modules' stored positions? | **(b)** | Keep them |
| R-2 | AppRail | Route-independent protection for rail drafts | (a) | Decide after R-1: a sibling Topbar slot and a sign-out step |
| R-3 | AppRail | Write timing during a drag | (a) | Decide after R-1: persist once at drop |
| P-1 | DesktopPet | SHELL-05: persist the hidden state; write position at drag end | **(b)**, and its new key needs a storage ownership entry | Accept SHELL-05 as written; schedule the ownership entry as its own shared slice first |
| W-1 | World Clocks | DASH-03: may the list be emptied? | **(b)** | Allow an empty list with an empty state |
| F-1 | Calendar | Calendar route departure seam | (a) | Decide after F-2 |
| F-2 | Calendar | SET-08 / CAL-01: one week-start setting or two | **(b)** | Date & Time drives Calendar and Statistics |
| C-1 | Integrations | SET-10: Connect without a client ID; what "connected" may claim | **(b)** | Disable Connect while `clientId` is empty and label the stub |
| C-2 | Integrations | Departure policy for the callback route | (a) | Decide after C-1 |
| D-1 | AI | D2 participation for ordinary secret writes, then AI-06/REL-02 sequencing | (a), shared layer | Schedule the D2 secret slice before any AI caller |
| D-2 | AI | SET-15: Test Connection request semantics | **(b)** | Real request, cancellable, with visible failure |
| G-1 | Board | Reconcile accepted Board receipts with the D2 account lock | (a), shared layer | After D2 |

### 7.2 Clock decisions in detail (all (a); contract assumptions A1–A9)

**E1-1 — Scope (A1). Class (a).**
- *Options.* (i) Edit `xai-web-dashboard-grid` `DashboardModule.tsx`, `DashboardGrid.tsx`, `types.ts` and one new internal module, plus the Clock files in `xai-web-dashboard-widgets`. `DashHeader.tsx`, the coordinator, `dashboardRegistration.tsx` and every other host file stay unchanged. Header reruns follow (contract §14 E17). (ii) A Clock-only caller with an unload warning and no departure participation. (iii) Defer until a multi-guard coordinator exists.
- *Trade-offs.* (i) is the only complete caller that protects Clock drafts on departure as every accepted caller does (REL-05). Its cost is the Header reruns. (ii) loses drafts silently on every Dashboard exit. (iii) is a shared coordinator change with F1-class reruns for every coordinator user.
- *Recommendation:* (i).

**E1-2 — Participation mechanism (A2). Class (a).**
- *Options.* (i) `DashboardModule` creates an internal aggregator. It hands the Header and widgets a stable registration function with today's type, and forwards **one** combined guard to the coordinator; the combined guard's methods evaluate the live participants. (ii) A multi-guard coordinator. (iii) Aggregation in the app adapter `dashboardRegistration.tsx`. (iv) No guard.
- *Trade-offs.* (i) leaves the coordinator, the Header's code and its accepted single-participant behaviour unchanged (the contract fixes an equivalence gate). (ii) breaks rule 3. (iii) still needs a grid change to reach widgets, plus a protected host route-file edit. (iv) violates REL-05.
- *Recommendation:* (i).

**E1-3 — Ownership and the drag ghost (A3). Class (a).**
- *Options.* (i) One controller per mounted Clock widget. `DashboardGrid` gives the ghost render a context without the registration field, so the ghost makes no writes, registers nothing and only displays committed bytes. (ii) A Dashboard-scoped Clock owner provided above the grid by the app adapter. (iii) A ghost flag in the context with a display-only face.
- *Trade-offs.* (i) needs only a small grid change (omit the field from the ghost's context) and keeps the widget self-contained. (ii) edits a host route file, and its drafts would outlive widget removal invisibly. (iii) adds API surface for no gain.
- *Recommendation:* (i).

**E1-4 — Persistence path (A4). Class (a).**
- *Options.* (i) Registered `usePrefAutosaveAsync` bindings with caller validators. (ii) Add closed domains to the registry or engine. (iii) A caller-side raw writer.
- *Trade-offs.* (i) needs no shared change and writes today's bytes. (ii) is a shared-layer change. (iii) is forbidden by every accepted contract.
- *Recommendation:* (i).

**E1-5 — Domains and malformed bytes (A5). Class (a).**
- *Options.* (i) Strict domains: four styles; `local` plus the twelve city ids (`cityLibrary.ts:18–31`). Invalid or unreadable bytes display the default, show a source alert with Reload only, are never rewritten and never throw. (ii) Normalize on read and rewrite. (iii) Keep today's silent defaulting.
- *Trade-offs.* (i) is the More, Features and Appearance precedent and REL-07. Its cost, accepted for Appearance (A6), is that a malformed byte can no longer be overwritten from the UI, whereas today's legacy write simply replaces it on the next choice; the engine refuses an invalid source (`prefMutation.ts:198`). (ii) violates REL-07. (iii) leaves the source issue invisible.
- *Recommendation:* (i). The cross-caller oracle scan (the F-FD1 lesson) found no accepted oracle that seeds either key. CmdK's adapter fixture `realisticState.ts:172–173` holds `clockTz: "America/New_York"` as adapter state, not storage, so it is unaffected.

**E1-6 — Feedback and export surface (A6). Class (a).**
- *Options.* (i) Per-field recovery blocks only for settled failures and source-only issues. No visible pending text, no success line, an inline Export while at least one field has a settled failure, and no Retry all or Discard all. (ii) Per-field pending messages and a success status line, as in the Appearance pane. (iii) Add a Retry all.
- *Trade-offs.* (i) follows the Dashboard Header (no success line) and the Appearance Topbar status (settled failures only). It avoids a recovery block flickering in a small widget on every click. Pending drafts stay protected by the departure guard and the unload warning. (ii) flickers. (iii) is a new control semantic nobody asked for; Appearance's Retry all was the product owner's decision for Appearance only.
- *Recommendation:* (i), with the set-envelope export of contract §8.

**E1-7 — Widget removal (A7). Class (a), with an escalation note.**
- *Options.* (i) Removing the Clock widget discards its unsaved Clock drafts with zero writes; the removal interaction is unchanged. (ii) Hold or confirm removal while Clock drafts exist. (iii) Keep the drafts alive invisibly after removal.
- *Trade-offs.* (i) keeps today's removal UX. The stored bytes end as today's do: a failed choice is not persisted today either. (ii) adds a new prompt to the shared grid. (iii) would block departure on drafts the user can no longer see.
- *Why (a).* (i) changes no existing product behaviour; it only defines the end of a state that does not exist today. If the controller reads REL-05's "保留草稿" as requiring removal protection, (ii) becomes a product decision for the user, and the contract would need a revision.
- *Recommendation:* (i).

**E1-8 — Test dispositions (A8). Class (a).**
- *Options.* (i) Adapt the existing Clock tests that assume synchronous writes (install a Web Lock fixture and await real completion), keeping every business assertion, as contract §11 lists. (ii) Keep them unchanged.
- *Trade-offs.* Without a fixture, jsdom has no `navigator.locks`, so every engine write is refused (`accountCoordination.ts:12–16`).
- *Recommendation:* (i).

**E1-9 — R-PET and global overlays (A9). Class (a).**
- *Options.* (i) Gated runs with the pet hidden through the product's own rail toggle, and a pet-on run at the default position with the default Dashboard order. Controls this caller adds must have an uncovered centre (blocking); coverage of unchanged controls is recorded under UX-03/SHELL-05. The coordinator dialog is judged by its own box and the viewport; CmdK stays closed; no Appearance failure is seeded. (ii) Pet hidden only. (iii) Pet-on fully gated.
- *Trade-offs.* (i) is the Appearance A9 rule. (ii) repeats the Features gap. (iii) would let a protected overlay block unchanged controls.
- *Recommendation:* (i).

### 7.3 Other candidates' decisions in detail

**R-1 — SET-03 pruning. Class (b).** It is part of an open ledger product question (SET-03, typed 决策).
- *Options.* (i) A drag keeps the stored positions of modules hidden by Features. (ii) Keep today's pruning. (iii) Defer AppRail until the whole SET-03 catalog decision.
- *Recommendation for the user:* (i). Hiding a module should not lose its place.
- *Urgency:* ask now, because E-R carries H-RAIL.

**R-2 — AppRail protection. Class (a).** Decide after R-1.
- *Options.* (i) A sibling optional Topbar slot and a second App sign-out step, mirroring Appearance A5. (ii) Generalize the `appearanceStatus` slot. (iii) Rail-local status only.
- *Recommendation:* (i). (ii) would edit the accepted Appearance surface, and (iii) has no room for per-field recovery actions in the narrow rail.

**R-3 — Rail write timing. Class (a).** Decide after R-1.
- *Options.* (i) Reorder live and persist once at drop. (ii) Enqueue on every `dragover` and let the engine coalesce.
- *Recommendation:* (i). The display is the same either way.

**P-1 — SHELL-05. Class (b).** It is an open ledger product item that adds a new persisted behaviour.
- *Options.* (i) Accept SHELL-05 as written: the hidden state persists as a new device key and the position is written at drag end. (ii) Position-at-drag-end only, with no hidden-state persistence. (iii) Defer.
- *Recommendation for the user:* (i). The new key's ownership entry is a storage shared-layer change and must be scheduled as its own slice first.

**W-1 — DASH-03. Class (b).**
- *Options.* (i) Allow an empty World Clocks list with an empty state. (ii) Keep the last city non-removable and explain why.
- *Recommendation for the user:* (i).

**F-1 — Calendar seam. Class (a).** Decide after F-2.
- *Options.* (i) A Calendar route adapter mounts the shared coordinator, as `dashboardRegistration.tsx` does, and the Calendar module registers one guard, designed once for both controls and later for the event composer. (ii) An App-lifetime owner for the Calendar preferences with no route guard, as Appearance does. (iii) An unload warning only.
- *Recommendation:* (i). (ii) would edit `App.tsx` for a module-scoped preference, and (iii) violates REL-05.

**F-2 — SET-08/CAL-01. Class (b).**
- *Options.* (i) Date & Time drives Calendar and Statistics, and Calendar's control becomes a view of it. (ii) Keep two settings with labelled scopes. (iii) Remove Calendar's own setting.
- *Recommendation for the user:* (i).

**C-1 — SET-10. Class (b).**
- *Options.* (i) Disable Connect while `clientId` is empty, label the integration as a preview, keep Disconnect for flags already set, and claim no data sync. (ii) Hide the integrations stub until real OAuth exists (JOB). (iii) Keep the stub flow, labelled as a demo.
- *Recommendation for the user:* (i), which matches the ledger text of SET-10 (line 321).

**C-2 — Callback departure policy. Class (a).** Decide after C-1.
- *Options.* (i) If C-1 removes the callback flip, the callback creates no draft and needs no departure policy. (ii) If the flip survives, the callback writes through the async engine, redirects only after verified persistence, and shows a failure in place with Retry and a link back. (iii) Mount a coordinator on the callback route.
- *Recommendation:* (i) under C-1 option (i); otherwise (ii). (iii) protects a page that has no user-editable draft.

**D-1 — AI secrets. Class (a), but a D2 shared-layer change.**
- *Options.* (i) Schedule the D2 ordinary-secret slice (`secretStore.ts:227–242` must join account coordination) and the AI-06/REL-02 sequence before any AI caller. (ii) A preferences-only AI caller that leaves secret writes unfenced. (iii) Defer AI entirely.
- *Recommendation:* (i). (ii) is ruled out by `remaining-writers.md` line 17, and (iii) leaves a high-impact surface unscheduled.

**D-2 — Test Connection. Class (b).** It is product behaviour with network and cost implications.
- *Options.* (i) A real provider request, cancellable, with visible failure and no secret in any export. (ii) Local validation only.
- *Recommendation for the user:* (i).

**G-1 — Board. Class (a), shared layer.**
- *Options.* (i) Reconcile the accepted Board receipts (`728822d`, Astra `0b3a043`) with the D2 account lock before any hook-row caller. (ii) Convert the Board hook rows now through generic preferences.
- *Recommendation:* (i). (ii) is forbidden by `remaining-writers.md` line 19.

### 7.4 Questions for the user, in recommended order

1. **R-1 (SET-03)**, because it unblocks the highest-risk remaining non-D2 caller.
2. W-1 (DASH-03), so that World Clocks can follow E1 on its aggregation.
3. C-1 (SET-10). It is P1 in the ledger, and its likely answer already matches the ledger text.
4. F-2 (SET-08/CAL-01).
5. P-1 (SHELL-05). It also needs a shared ownership slice.
6. D-2 (SET-15). It waits for D2 regardless.

## 8. Contract status

A contract was written: [`../web-dashboard-clock-recovery-contract/contract.md`](../web-dashboard-clock-recovery-contract/contract.md). E1 needs no (b) decision, no D2 shared-layer change and nothing outside `web`. Decisions E1-1 … E1-9 appear there as assumptions A1–A9 awaiting controller confirmation. Nothing may be implemented before the controller registers the item and its first batch, the frozen before baselines E1–E5.

## 9. Observations recorded for later (no action here)

- **H-RAIL (N1)** belongs to E-R's before-oracles and to SHELL-04/REL-07. It is the main reason to ask R-1 early.
- **Dashboard grid drafts are not departure-protected (N3).** Once E1's aggregation exists, a later Dashboard grid caller can register order, layout and appearance recovery as participants without touching the coordinator. That caller must first reconcile the prior bounded evidence (`remaining-writers.md` line 18).
- **Inventory prediction for the next Luna refresh**, if E1 lands as contracted: the two `ClockWidget.tsx` rows disappear. The counts would become 22 files, 46 bindings, 25 literal keys, 1 dynamic site, 29 setter bindings (26 direct, 3 downstream-only) and 17 read-only bindings. This is a prediction to verify, not a target.
- The clocks use static UTC offsets without DST (`cityLibrary.ts:1–6`). That is DASH-02 (typed 核验), not a persistence defect.
- Pre-existing Clock a11y items (N7) go to UX-05: style targets below 44×44 outside 641–1024 px; no Escape on the timezone popover; after a keyboard timezone choice the popover unmounts with focus inside it.
- `xai_pref_dt_start_week` still drives nothing (SET-08).
- The `web:settings:preference-changed` type, `SettingsFooter`, `resetAllPrefs` and `RESET_DEFAULTS` now have no production use (SET-01/REL-10 cleanup).

## 10. Limitations of this memo

- Static reading only. I executed no product code, so every behaviour in §5 is a cited source fact or a hypothesis for the before-oracles, never an established defect. H-RAIL in particular is unverified.
- The searches exclude `docs/` and tests unless stated. Dynamic keys were followed through their helpers (`prefKey`, open-ended suffixes and `useChatPreference`), not only by literal key.
- Sizes are rough estimates.
- E1-7 is a judgement that the controller may escalate (§7.2).

## 11. Scope statement

This memo selects; it does not accept. It changes no product file, test, runner, oracle, existing evidence, ledger or control-plane file, and it adds only this file and the contract. Selecting E1 closes **no** 312 item, including REL-05, REL-07, DASH-02, DASH-03, SET-03, SET-08, SET-10, SHELL-04, SHELL-05, UX-03, UX-05 and QA-01/03/04/09, and it does not change the formal count of 13 completed and 299 open. No push, merge, rebase, branch operation, deployment, release or Web→Desktop sync was performed.
