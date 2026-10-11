# Next complete recovery caller: selection at `f359be6`

Astra-role selection memo (risk, design and final-decision role, executed by an independent Claude Opus 5.5 instance in an isolated detached worktree), module `web`, 2026-10-04, control-plane batch 21.

**What this memo is.** A scheduling recommendation for the controller. It compares candidate complete callers drawn from the follow-on groups of `remaining-writers.md` and the `f359be6` binding inventory, and recommends one.

**What this memo is not.** It accepts nothing, authorizes no implementation, freezes no baseline, changes no formal count and **closes no 312 item**. The recommendation takes effect only after the controller has checked it and registered it in the control plane (`CURRENT-CONTROL-PLANE.md` lines 181–186).

## 1. Fixed point and inputs

| Item | Value |
| --- | --- |
| Docs checkout | detached `51d65aa7a6fcbbf1e691bc7920e8244839425381`, clean |
| Product | `f359be6d838393e0f9e93efd80b88b5b09f6144e` (tree `2280bc76…`). `git diff --name-only f359be6 HEAD -- apps packages package.json pnpm-lock.yaml` is empty |
| Lockfile | SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` |
| Scheduling authority | [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md) lines 11–25: follow-on groups (lines 16–23) and the selection rule (line 25) |
| Inventory | [refresh-f359be6.md](../web-d2-pref-binding-inventory/refresh-f359be6.md) and `bindings-f359be6.json`: 25 files, 52 direct bindings. Scheduling input only; not a writer census and not a defect count |
| Account-lifecycle boundary | [D2 entry contract](../web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md): device-only keys "stay under their classified device contract" ("Required API and lock semantics", item 2); account-owned writers need the shared lifecycle lock |
| Accepted precedents | Date & Time `d0d934d`; Notifications `ad223a2`; More `27adb10`; Sticky `699f6e6` (contract `70ff46a`); Smart Lists contract; F1 lesson [impact-review.md](../web-sticky-recovery-f1/impact-review.md); G1 lesson [blocked-f359be6.md](../web-sticky-recovery-acceptance/blocked-f359be6.md) §4 |
| Ledger | `ALL-TODO-CURRENT.md`: SET-02/03/08/10/15 (lines 309–322), DASH-02/03 (243–244), SHELL-04/05 (333–334), REL-05/07/09/10 (84–89), BRD-* (206–234), QA-01/03/04/09 (586–594) |

## 2. Selection rule applied

From `remaining-writers.md` line 25 and the batch-21 brief, a candidate qualifies as the next complete caller only if:

1. **Complete.** Every writer form of its keys is inside the unit: direct `usePref`, explicit `setPref`/`removePref`, raw storage, wrappers, callbacks and resets. Read-only rows are audited, not assumed converted (line 16).
2. **Genuinely shared producers are combined**, so no false end-to-end success claim remains (line 25).
3. **Bounded inside the `web` module** without changing a shared layer: the storage engine, hooks, registry or ownership; the Settings shell components; the `apps/web` host, coordinator, router or auth; the Web shell.
4. **Ordered by** product risk, reusable accepted evidence and the actual source at `f359be6`.

If no qualifying candidate existed, this memo would stop without a contract.

## 3. Comparison at a glance

| # | Candidate (follow-on group) | Owners | Risk | Size | Needs a shared-layer or host change? | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| A | **Settings → Features: 8 module toggles + Reset to defaults** (Appearance and feature toggles) | 8 device | High | S–M: one package | **No** | **Recommended** |
| B | Settings → Appearance + root-preference producers (same group) | 7 device keys, 4 of them unregistered | High | L: 3 packages + host | **Yes**: `App.tsx` event writer, `Topbar.tsx` writer | Later; controller decision |
| C | Integrations pane + OAuth `CallbackPage` (AI settings and integrations) | 3 account | Medium-high | M: 2 surfaces | Callback route sits outside the Settings coordinator; SET-10 product decision first | Later |
| D | Settings → AI (same group) | 3 account + 1 device + secrets | High | L: 2 packages + network | **Yes**: ordinary secret writes in `plugin-web-ai-chat` need D2 participation | Later; controller decision |
| E | Dashboard widgets and shell preferences: Clock, World Clocks, Pet, AppRail | 5 device + 1 account | Medium-high | L: 4 packages | **Yes**: single-guard coordinator already used by Dashboard Header; widget context has no guard | Later; controller decision |
| F | Calendar adjuncts: view and week start (Calendar and Tasks adjuncts) | 2 device | Medium | M | **Yes**: no departure seam on the Calendar route; SET-08 binding undecided | Later |
| G | Board variants and workspace | account (domain engines) | Very high | XL: 3 modules, 13 rows | Domain engines and accepted Board receipts first | Later |

Groups 6–8 of the follow-on list (business storage wrappers, timers and controller settlement, lifecycle/secrets/public APIs) are not UI callers. They depend on the D2 shared lifecycle lock (entry contract, "Writer and lifecycle ownership to implement" table: storage APIs, migration, deletion, business wrappers, Time Tracker, Pomodoro/Meditation controllers and the AI `secretStore`), which is shared-layer work, so none of them can be the next bounded caller.

## 4. Candidates in detail

### A. Settings → Features (recommended)

**Writers and readers, at `f359be6`.**
- **Direct binding.** One dynamic row: `FeaturesPane.tsx:69`, `usePref(prefKey)` inside `FeatureCard` (inventory JSON lines 447–455). It carries all **8** keys `xai_pref_features_<id>` for `tasks`, `board`, `dashboard`, `calendar`, `matrix`, `pomodoro`, `habits`, `meditation` (`featureIds.ts:12–49`). The toggle inverts the rendered closure: `setOn(!on)` (`:87`).
- **Raw reset.** `resetAllFeaturePrefs()` (`FeaturesPane.tsx:101–119`) calls `localStorage.removeItem` for each key, swallowing every error (`:102–108`). It then dispatches a **synthetic `StorageEvent` with `key: null`** (`:114–118`). This is the only `key: null` dispatcher in production code.
- **Shared footer callbacks.** `<SettingsFooter onSave={() => []} onReset={resetAllFeaturePrefs}>` (`FeaturesPane.tsx:41–45`).
  - "Save & apply" shows "Saved" unconditionally (`SettingsFooter.tsx:75`).
  - The reset confirmation says it "clears saved theme, layout, and module toggles" (`:86–89`), but only module toggles are affected.
- **Departure seam dropped.** `featuresPane.render` forwards only `lang` (`internal/featuresPane.tsx:19`), although the host passes `registerDepartureGuard` (`composedSettingsRegistration.tsx:105`).
- **Readers, none of which writes.** Two of them fall outside the TSX `usePref` scanner.
  - `useFeaturePrefs.ts:17–31` makes 8 legacy `usePref` reads. It is a `.ts` file, so it is not in the inventory. It feeds the App rail filter (`App.tsx:179–182` → `WebShellProvider modules` `:221` → AppRail).
  - `withDisabledFallback.tsx:43` (a dynamic read-only row) guards 8 module routes (`shellRegistrations.tsx:71–81`).
  - CmdK reads the keys through `getPref` when the palette opens (`CommandPalette.tsx:43–52, 194–209`).

**Owners.** All 8 are device keys (`accountOwnership.ts:54–61`), with no account machinery. Registry: boolean, default `true`, schemaVersion 1 (`registry.ts:498–568`). Lifecycle: device-recovery, retain on deletion, retain on migration (`lifecycleDeclaration.ts:25–33`).

**Product and user impact.**
- These toggles decide which modules a user can reach: the rail, deep links and search.
- **Toggle failures.** A failed write snaps the toggle back with no feedback (`usePref.ts:141–146`), and "Save & apply" still flashes "Saved".
- **Reset faults.** A partial reset fault is swallowed while every display shows "on".
- **Reset side effect.** The synthetic `key: null` event makes **every** mounted legacy `usePref` show its default (`usePref.ts:161–165`). On the Settings route that includes:
  - the App accent hue, background tone and rail position (`App.tsx:135–137, 163–165`);
  - the AppRail order (`AppRail.tsx:37`);
  - the DesktopPet id and position (`DesktopPet.tsx:82–83`).

  Their bytes are unchanged, so the defaults are a display corruption. An AppRail drag afterwards writes an order derived from the default (`AppRail.tsx:88–89`). That is a plausible **data-loss path in another module**.
- These are hypotheses to freeze, not established defects.

**Risk class.** High. Device-only ownership removes the account-lifecycle machinery. What remains:
- async queue attribution on 8 keys;
- set/reset attribution for an 8-key reset batch;
- removal of a cross-module side effect;
- navigation-availability consumers;
- host departure arbitration, including the F1 shape, since batch completions notify repeatedly;
- memory-only export;
- native evidence.

**Size.** One package (`packages/xai-web-settings-features-panel`): `FeaturesPane.tsx` (119 lines), the 20-line pane registration, an optional prop type, at most two local helpers, scoped CSS, tests and docs. That is comparable to Sticky, and smaller in value domain (16 values against Sticky's 25).

**Shared surfaces touched.** None are edited. It *consumes*:
- the accepted `usePrefAutosaveAsync` hook and the `mutatePref` engine;
- the Settings `Toggle`/`SectionBlock`;
- the composed Settings host and the F1-repaired coordinator.

It also *stops using* the shared `SettingsFooter`. The component stays unchanged and Appearance keeps it. Readers are protected and covered by consistency gates.

**Dependencies on unaccepted work.** None.
- The engine reset path, verified absence and the set/reset envelope were accepted in More (`27adb10`).
- Device continuity and native harness patterns come from Sticky (`699f6e6`).
- The coordinator was repaired and re-accepted at `f359be6`.
- SET-03 catalog decisions are independent and stay excluded.

**Reusable accepted evidence.**
- The `usePrefAutosaveAsync` contract (`usePrefAutosaveAsync.ts:85–93`, `usePrefAsync.ts:93–303`).
- More's reset and mixed set/reset oracles, as patterns.
- Sticky's device-only continuity, export and host matrix patterns.
- The frozen F1 runners (`verify-f1.mjs`, `verify-f1-callers.mjs`, `verify-f1-race.mjs`) as regression oracles.

**312 items it would support without closing.**
- SET-03: truthful toggle persistence, and rail, search and deep-link consistency evidence. The module catalog and its disposition stay open.
- REL-05: one more consumer.
- REL-09: mounted-session recovery only.
- REL-10: the Features reset stays pane-scoped and never clears business data.
- UX-04: no false success.
- QA-01, QA-03, QA-04 and QA-09.

### B. Settings → Appearance and the root-preference producers

**Writers.**
- **Pane.** `AppearancePane.tsx:52–55` holds three read-only rows. The pane writes `setPref`/`removePref` directly (`:95–125, 170–205`) and emits `web:settings:preference-changed` for theme, density, font scale and language (`:77–152`). It also has a Save action (`:156`) and keeps the shared footer (`:419–423`).
- **Host and Topbar.** `apps/web/src/App.tsx:147–156` turns those events into raw `localStorage.setItem(JSON.stringify(...))` writes (`writeLocalPref`, `:98–104`) for `xai_pref_theme`, `xai_pref_density`, `xai_pref_font_scale` and `xai_pref_lang`. `xai-web-shell/src/Topbar.tsx:26–34, 102–104` writes three of the same keys with `persistAndSet`.
- **Readers.** The same keys are read raw by `NotFoundPage.tsx:7` and `AccountStorageGate.tsx:59`, and applied to the DOM by `plugin-web-tokens` `apply*`.
- **Registry.** The four root keys are **not in `PREF_REGISTRY`**. All are device keys (`accountOwnership.ts:5, 14, 48, 62, 66, 104, 107`).

**Why later.**
- The Appearance pane, the `App.tsx` event writer and `Topbar` are **genuinely shared producers** of `theme`, `lang` and `density`. Separating them would leave a false end-to-end claim.
- Combining them requires editing the `apps/web` host (`App.tsx` also holds the protected sign-out preflight, `:190–217`) and the Web shell.
- SET-02 (autosave versus Save semantics, font-scale wiring) and SHELL-04 (root value domains, cross-tab) are product decisions that come first.
- Selecting Features first also removes the synthetic `key: null` event that corrupts the App's appearance readers. That keeps a confounder out of Appearance's later before-evidence.

**Risk.** High. **Size.** L.

**Supports.** SET-02, SHELL-04, REL-05, REL-10 and UX-05.

### C. Integrations pane and OAuth `CallbackPage` (combined, as line 25 requires)

**Writers.**
- **Pane.** `integrationsPane.tsx:94–116` binds three flags, and Disconnect sets one to `false`. `integrationDisconnectButton.tsx:37–44` emits `integration-disconnected` whatever the write result.
- **Callback.** `CallbackPage.tsx:56–86, 160–177` sets a flag to `true`, then emits `integration-connected` before any verified persistence. It auto-navigates after 2–4 s (`:123–194`).
- **Connect.** It writes sessionStorage OAuth state (`oauthState.ts:82–111`; cleanup subscriber `:47–64`), then calls `window.location.assign` to leave for an external page (`integrationConnectButton.tsx:40–53`).

**Owners.** Account (`accountOwnership.ts:63–65`).

**Why later.**
- Every provider has `clientId: ""` (`integrationProviders.ts:53, 64, 75`), so the production connect path cannot complete a real authorization. SET-10 (disable Connect without a client ID; never claim sync from a boolean) is a product decision that may remove the callback flip from production entirely.
- The callback route is a sibling of the module route (`router.tsx:50–55`), outside the Settings `DepartureCoordinator`. Its departure policy would need a host decision.
- User value is low: these are stub booleans, and exporting a "connected" draft has no recovery meaning.

**Risk.** Medium-high. **Size.** M.

**Supports.** SET-10 and REL-05.

### D. Settings → AI

**Writers.**
- **Pane bindings.** `aiPane.tsx:49–63` binds four keys.
- **Provider change.** One action writes three keys (provider, model, base URL; `:89–98`).
- **Secrets.** Key save and delete go through `aiKeyStorage` (`:100–110, 131–138`), which is the IndexedDB `secretStore` in `packages/plugin-web-ai-chat/src/internal/secretStore.ts`.
- **Network.** Test Connection makes a network request (`:112–125`).
- **Dev seeding.** A writer in `apps/web/src/dev/seedAiConfigFromEnv.ts:59–61`.
- **Readers.** `AiChatModule.tsx:326, 582, 684`, `claudeAdapter.ts:47, 69`, `claudeStreamAdapter.ts:89, 103` and `llmProvider.ts:166`.

**Owners.** Provider, base URL and model are account keys. Streaming is a device key (`accountOwnership.ts:7, 10–12`).

**Why later.**
- The D2 entry contract requires ordinary provider-secret writes to join account coordination. That is shared-layer work in another package.
- SET-15 depends on AI-06 (generation protection) and REL-02 (`verification_pending`).
- A preferences-only caller would leave the same pane's secret writer outside the unit. `remaining-writers.md` line 17 requires coherent success/refusal and owner handling for the AI preferences *and* the ordinary encrypted secret updates, with secret coordination kept separate from a preferences-only UI test. A preferences-only caller therefore could not claim the pane complete.

**Risk.** High. **Size.** L.

**Supports.** SET-15, AI-06 and REL-05.

### E. Dashboard widgets and shell preferences

**Writers.**
- **Clock.** Style and timezone (`ClockWidget.tsx:51–52`, setters at `:265, 286, 309`).
- **World Clocks.** `xai_zones` (`WorldClocks.tsx:42`; add and remove at `:57–65`).
- **DesktopPet.** Id and position (`DesktopPet.tsx:82–83`; position writes at `:123, 165`; id writes at `:188, 247`).
- **AppRail.** Order (`AppRail.tsx:37`, drag write at `:88–89`).
- **Dashboard order.** Delegated to the existing `useOrderSaveRecovery` (`DashboardModule.tsx:50–51`).

**Owners.** World Clocks is an account key; the rest are device keys (`accountOwnership.ts:28–29, 39–40, 106, 119`).

**Why later.**
- The Dashboard route's `DepartureCoordinator` keeps **one** guard (`departureCoordinator.tsx:76, 83–92`), and the accepted Dashboard Header already registers it (`DashHeader.tsx:785–798`).
- Widgets render with `{ lang, now, goTo }` only (`DashboardGrid.tsx:121`).
- Protecting widget drafts therefore needs a multi-guard coordinator or a dashboard-level aggregator. Both are shared host changes, and the second touches the accepted Header's host.
- Pet and AppRail are global shell components with no route coordinator.
- DASH-02/03 and SHELL-05 carry open product decisions.

**Risk.** Medium-high. **Size.** L.

**Supports.** DASH-02, DASH-03, SHELL-05 and REL-05.

### F. Calendar adjuncts

**Writers.** `CalendarModule.tsx:75` (`xai_pref_week_start`) and `:80` (`xai_calendar_view`), with handlers at `:84–91`.

**Readers.** Statistics (`StatisticsModule.tsx:87`) and widget consumers.

**Owners.** Both are device keys (`accountOwnership.ts:27, 105`).

**Why later.**
- Only Settings, Pomodoro and Dashboard mount a `DepartureCoordinator` (`composedSettingsRegistration.tsx:78`, `pomodoroRegistration.tsx:12`, `dashboardRegistration.tsx:34`). A Calendar seam is a host change.
- SET-08 and CAL-01 must first decide how `xai_pref_dt_start_week` relates to `xai_pref_week_start` (`remaining-writers.md` line 20).

**Risk.** Medium. **Size.** M.

**Supports.** SET-08, CAL-01 and DASH-09.

### G. Board variants and workspace

**Writers.** Thirteen rows across three Board modules: core `:53–54`, views `:83–85`, workspaces `:341–355`, including the downstream-only `setRawWorkspaces`.

**Owners.** Account. These are receipt-preserving domain engines.

**Why later.** `remaining-writers.md` line 19 forbids replacing a receipt-preserving domain writer with generic preferences, or resetting accepted workspace recovery on the strength of a hook row. The accepted Board evidence (`728822d`, Astra `0b3a043`) and the D2 account lock must be reconciled first.

**Risk.** Very high. **Size.** XL.

**Supports.** BRD-02, BRD-03, BRD-06, BRD-19 and REL-05.

## 5. Recommendation

**Select A: the complete Settings → Features caller.** It covers all 8 module toggles, Reset to defaults, the actual Settings departure seam, memory export, and the downstream rail, route and search consistency together with cross-module isolation. The contract is [`../web-features-recovery-contract/contract.md`](../web-features-recovery-contract/contract.md).

Justification:

1. **Product risk.**
   - It is the only remaining Settings writer whose failure changes which modules a user can reach.
   - Its reset has an unbounded blast radius: one synthetic event repaints every mounted legacy preference in the tab, including six unrelated device preferences (accent hue, background tone, rail position, rail order, pet id and pet position), and can lead to an AppRail order overwrite.
   - Its footer claims "Saved" for a no-op.
2. **Bounded.**
   - All writers of the 8 keys are in one package. A repository search found none elsewhere (§4 A).
   - No storage, shell, host, coordinator or router edit is needed.
   - The legacy readers keep working, because the accepted engine publishes on the same-tab bus after each verified commit or reset (`prefMutation.ts:98, 177, 192, 214, 239`; `sameTabBus.ts:24–31`).
3. **Evidence reuse is maximal.** Device-only (Sticky) plus pane-scoped reset (More) are both accepted shapes. The F1 runners provide the regression oracle for the guard it will register.
4. **Sequencing benefit.** Removing the `key: null` event first keeps it from contaminating the later Appearance caller's before-evidence.

**Not combined with Appearance.** The two panes write disjoint key sets, so they are not genuinely shared producers. Their only coupling is the Features side effect, which the Features contract removes and must prove absent (contract §10).

## 6. Decisions the controller must make

1. **Register** a new control-plane item for the Features caller (suggested `CP-FEATURES-01`), and its first batch: the frozen Sol before-oracles, the parent host and native before baselines, and the Features F1 mode before-log. Nothing may be implemented before that.
2. **Confirm two visible UI changes** in the contract (§4, D3):
   - Features stops rendering the shared `SettingsFooter`. Its no-op "Save & apply" disappears, because Features autosaves and the footer's "Saved" is unconditional.
   - Reset to defaults becomes a Features-local control with the same label and a truthful `window.confirm` text.
3. **Confirm the harness scope.** Native downstream evidence must mount the production `App` layout (`apps/web/src/App.tsx`). Only the auth-session context may be synthetic. The Sticky host used Shell plus ComposedSettings only, which lacks the App-level readers that hypothesis H6 needs.
4. **Confirm the converted limitation.** The a11y focus target after keyboard Discard (Sticky follow-up 1) becomes a Features gate. Downgrading it to a note is the alternative.
5. **For the later groups**, before any of them can be contracted:
   - **Appearance:** authorize a host- and shell-inclusive contract.
   - **Dashboard widgets and shell:** decide a multi-guard host design.
   - **AI:** schedule D2 participation for ordinary secrets.
   - **Integrations:** decide SET-10.
   - **Calendar:** decide its departure seam and SET-08.

## 7. Observations recorded for later (no action here)

- **Inventory blind spots** confirmed by this audit: `useFeaturePrefs.ts` (8 legacy reads in a `.ts` file) and CmdK's `getPref` reads are invisible to the TSX `usePref` scanner. Future scheduling should not treat the 52 rows as reader coverage.
- **AppRail drag pruning.** A drag-reorder rebuilds the stored order from the *filtered* registry (`AppRail.tsx:43–62, 88–89`), so dragging while a module is disabled drops that module's stored position. This is pre-existing, belongs to SET-03 and the shell, and is not part of the Features caller.
- **App root preferences.** Both root-preference writers swallow storage failures: `App.tsx` `writeLocalPref` (`:98–104`, used for Appearance events) and `Topbar.tsx` `persistAndSet` (`:26–39`). Language, theme, density and font-scale changes can therefore be lost silently while the UI shows them applied. That belongs to Appearance and SHELL-04 (candidate B).

## 8. Scope statement

This memo selects; it does not accept. It changes no product file, test, runner, ledger or control-plane file, and adds this file and the contract only. Selecting Features closes **no** 312 item, including SET-03, REL-05/09/10, UX-04 and QA-01/03/04/09, and it does not change the formal count of 13 completed and 299 open. No push, merge, branch operation, deployment, release or Web→Desktop sync was performed.
