# Next complete recovery caller: selection at `5cd63ff`

Astra-role selection memo (risk, design and final-decision role, executed by an independent Claude Opus 5.5 instance in an isolated detached worktree), module `web`, 2026-10-04, control-plane batch 34.

**What this memo is.** A scheduling recommendation for the controller. It re-verifies the previous selection memo ([selection-f359be6.md](selection-f359be6.md)) at the current product, compares seven candidate complete callers, recommends one, and classifies every pre-decision as either **(a) controller-decidable** (a scope or technical decision inside the `web` module) or **(b) product-owner decision** (product behaviour, a UX policy, or an open ledger product question).

**What this memo is not.** It accepts nothing, authorizes no implementation, freezes no baseline, changes no formal count and **closes no 312 item**. The recommendation takes effect only after the controller has checked it and registered it in the control plane (`CURRENT-CONTROL-PLANE.md` "下一步", lines 276–285). Product-owner decisions go to the user.

## 1. Fixed point and inputs

| Item | Value |
| --- | --- |
| Docs checkout | Detached `ead985dbab094f50bab72203487aefac5488b6e6`, clean |
| Product | `5cd63ff652f02a2c726187fe12cbc796218d31c0` (tree `404bf819a42e20b3e4d372c18a981832ccd54954`). `git diff --name-only 5cd63ff HEAD -- apps packages package.json pnpm-lock.yaml` is empty |
| Lockfile | SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9` |
| Product delta since the previous memo | `git diff --stat f359be6 5cd63ff -- apps packages package.json pnpm-lock.yaml`: 11 files, +1590/−72, all under `packages/xai-web-settings-features-panel/` |
| Scheduling authority | [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md): follow-on groups (lines 13–23) and the selection rule (line 25) |
| Inventory | [refresh-5cd63ff.md](../web-d2-pref-binding-inventory/refresh-5cd63ff.md) and `bindings-5cd63ff.json`: 24 files, 51 direct bindings. Scheduling input only. Its boundary excludes `.ts` files, `apps/`, raw writers, `setPref`/`removePref`, `getPref` readers and other stores, so every candidate below was re-searched by hand |
| Own search | `git grep` at `5cd63ff` over `apps/` and `packages/` (all extensions; `__tests__` and `docs/` excluded unless stated) for every key, writer helper and event named in §5 |
| Account-lifecycle boundary | [D2 entry contract](../web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md): device-only keys "stay under their classified device contract" (item 2); account writers, ordinary AI secrets, wrappers and timers need the shared lifecycle lock ("Writer and lifecycle ownership to implement" table) |
| Accepted precedents | Date & Time `d0d934d`; Notifications `ad223a2`; More `27adb10` with C-FB002 (`05b21f4`); Sticky `699f6e6`; Features `ec55f9e` (contract `6ded3dc`, the structural template) |
| Ledger | `ALL-TODO-CURRENT.md`: REL-05/07/09/10 (lines 86–91), CAL-01 (165), BRD-01–06 (208–213), DASH-02/03 (245–246), AI-06 (268), SET-01–15 (310–324), SHELL-04/05/06 (335–337), UX-03/04/05 (348–350), QA-01/03/04/09 (588–596) |

## 2. Selection rule applied

A candidate qualifies as the next complete caller only if (`remaining-writers.md` lines 16–25, batch 34 brief):

1. **Complete.** Every writer form of its keys is inside the unit: direct `usePref`, explicit `setPref`/`removePref`, raw storage, host and shell writers, wrappers, callbacks, events and resets. Read-only rows are audited, not assumed converted.
2. **Genuinely shared producers are combined**, so no false end-to-end success claim remains (line 25).
3. **Bounded inside the `web` module** without a D2 shared-layer change: no change to the storage engine, hooks, registry, ownership, codecs or lifecycle, and no change to the departure coordinator or router. Protected host or shell files may enter a contract only by an explicit (a) controller authorization with affected-caller reruns.
4. **Ordered by** product risk, user impact, size, shared surface, dependencies on unaccepted work, reusable accepted evidence and the required pre-decisions.

A contract is written only for a recommended candidate that needs no (b) decision, no D2 shared-layer change and nothing outside `web`. Its (a) decisions become assumptions awaiting controller confirmation.

## 3. Facts from `selection-f359be6.md` re-checked at `5cd63ff`

Only the Features package changed between the two products (§1). Every non-Features fact in the previous memo therefore sits on byte-identical source; I re-derived each one rather than copying it. The re-derived citations appear in §5.

**Changed at `5cd63ff`:**

1. **The `key: null` event is gone.** At `f359be6`, `FeaturesPane.tsx:116` dispatched `new StorageEvent("storage", { key: null, … })`. At `5cd63ff` no production file dispatches a `key: null` storage event; the only synthetic storage events left are key-specific (`plugin-web-pomodoro/src/internal/sessionController.ts:72`, `xai-web-dashboard-grid/src/internal/useOrderSaveRecovery.ts:36`). The previous memo's candidate B "confounder" (Features reset repainting App appearance readers) no longer exists, so Appearance before-evidence is no longer contaminated by it.
2. **Appearance is now the only production `SettingsFooter` mount** (`AppearancePane.tsx:419–423`). Features stopped mounting it (contract D3). The footer's unconditional "Saved" (`SettingsFooter.tsx:75`) and its misleading reset confirmation (`:86–89`) now survive only in Appearance. `resetAllPrefs()` still has no production caller.
3. **Inventory:** 52 → 51 direct bindings, 25 → 24 files; the only removed row is `FeaturesPane.tsx:69` (`refresh-5cd63ff.md` lines 50–54).
4. **Features now registers a Settings departure guard** (`featuresPane.render` forwards its props). This adds one more guard-registering pane on the Settings route; it does not change the single-guard coordinator (`departureCoordinator.tsx:76, 83–92`), which matters for candidates E1 and E.
5. **New rulings and conditions** since the previous memo: R-PET (the default-position DesktopPet covers a right-aligned pane action at 768×1024; recorded under UX-03/SHELL-05, Features acceptance §5.1), C-FB002 (More `boundaries` regressions run the corrected oracle beside the frozen one), the E6 self-report form, and the Features F1 runner (`web-features-recovery-f1/verify-f1-features.mjs`) joining the 10 frozen F1 invocations.
6. **Revised classification (a judgement, not a source change).** The previous memo called SET-02 and SHELL-04 "product decisions that come first" for Appearance. Re-read at `5cd63ff`, both are typed 修复 (fix) with concrete acceptance criteria (ledger lines 311 and 335: cross-tab consistency, no crash on illegal values, a fallback). The only open element is SET-02's "统一自动保存或编辑后保存语义"; §7 B-2 explains why I classify it (a) for this caller and when it would become (b). SET-02's "实际正文随字号缩放" (body text scaling) is tokens/CSS work that the recovery caller can exclude without deciding it (§5 B).

**Newly recorded facts (true at both products, not cited before):**

7. AI also has readers at `llmProvider.ts:170` (base URL) and `secretStore.ts:262` (model default). Ordinary `saveKey`/`clearKey` (`secretStore.ts:227–242`) check scope readiness but take no account lifecycle lock.
8. The Clock widget is a complete sub-caller of its own: `xai_clock_style`/`xai_clock_tz` are written only by `ClockWidget.tsx:51–52` (setters `:265, 286, 309`) and read elsewhere only by CmdK (`xai-web-cmdk/src/internal/readModuleStates.ts:38–39`).
9. DesktopPet persists position on every `pointermove` (`DesktopPet.tsx:114–123`) and on resize re-clamp (`:157–166`), which is what SHELL-05 asks to change.
10. Malformed root-preference bytes reach throwing consumers: `useI18n` throws on an unsupported language (`plugin-web-tokens/src/i18n.ts:727–733`), `applyFontScale` throws on non-finite or non-positive input (`apply.ts:64–69`), `applyAccentHue` throws on non-finite input (`:83–88`), and the legacy number codec decodes `Infinity` as `Infinity` (`codec.ts:48–52`). `<App/>` is under the `app` route error boundary (`apps/web/src/routes/router.tsx:41–43`).
11. Storage's `BgTone` admits `"sage"` (`plugin-web-storage/src/internal/registry.ts:46–53`); the tokens `BgTone` does not (`plugin-web-tokens/src/types.ts:16–22`), and no CSS rule exists for it.
12. The Web shell's own tests encode the raw Topbar write and its silent failure (`xai-web-shell/src/__tests__/Topbar.test.tsx:160–209`, TP1-Persist … TP-Persist-Quota-Safe).
13. The accepted Date & Time key `xai_pref_dt_start_week` has no production reader except its own pane (`dateTimePane.tsx:27`); Calendar and Statistics read `xai_pref_week_start`.

**Citation precision only.** The previous memo cited `App.tsx:147–156`, `:98–104` and `:190–217`; at `5cd63ff` (file unchanged since `ef97c1f`) the exact ranges are `:146–157` (subscriber), `:98–105` (`writeLocalPref`) and `:189–217` (sign-out preflight).

## 4. Comparison at a glance

| # | Candidate (follow-on group) | Keys / owners | Product risk | User impact | Size | Shared surface touched | Dependencies on unaccepted work | Evidence reuse | Pre-decisions (§7) | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **B** | **Appearance: pane + App root writer + Topbar** (Appearance and feature toggles) | 7 device keys, 4 of them unregistered | **High.** Hypotheses: malformed root bytes make every `/app` route render the error boundary; silent loss behind applied UI on two surfaces; a stale pane mirror lets "Save & apply" revert a Topbar choice | **Very high.** Language, theme, density, font, accent, background and rail position of every page | L: 2 packages + host (`App.tsx`, `Topbar.tsx`, `Shell.tsx`, shell `types.ts`) | Host `App.tsx` (including the sign-out preflight) and the Web shell Topbar. No storage, coordinator, router or tokens change | None. The engine is accepted; the open-ended suffix branch is accepted engine code whose first device-key consumer this would be | High: Features production-App harness, More reset envelope, Sticky device continuity, F1 runners, Features lock fixture | (a) only: B-1 … B-9 | **Recommended**; contract written |
| E1 | Dashboard Clock widget: style and timezone (Dashboard widgets and shell) | 2 device | Medium-low | Low | M, including guard plumbing | The accepted Dashboard Header's guard path (`DashboardModule.tsx:34, 158`) or the shared coordinator | None | Medium: Header host matrix, F1 | (a): E1-1 | Later |
| C | Integrations pane + OAuth `CallbackPage` (AI settings and integrations) | 3 account | Medium-high | Low: stub booleans, every `clientId` is `""` | M | Callback route outside the Settings coordinator | SET-10 | Low | (b) C-1, then (a) C-2 | Later; needs a user decision |
| D | Settings → AI, preferences + ordinary secrets (same group) | 3 account + 1 device + secrets | High | High | L | **D2 shared layer** (`secretStore` lock participation) + network | D2 secret participation; AI-06; REL-02 (`verification_pending`) | Low | (a) D-1 is a shared-layer change; (b) D-2 | Later; excluded by the shared-layer rule |
| E | World Clocks, DesktopPet, AppRail order (Dashboard widgets and shell) | 1 account + 3 device | Medium-high | Medium | L: 3 packages | Dashboard guard aggregation; global shell with no route | DASH-03, SHELL-05, SET-03 | Medium; would reuse B's route-independent seam | (b) E-1, E-2, E-3; (a) E-4 | Later; needs user decisions |
| F | Calendar view + week start (Calendar and Tasks adjuncts) | 2 device | Medium | Medium | M | New Calendar departure seam (host) | SET-08 / CAL-01 binding | Medium | (b) F-2, then (a) F-1 | Later; needs a user decision |
| G | Board variants and workspace | Account, receipt-preserving domain engines | Very high | High | XL: 3 modules, 13 rows | Domain engines; D2 account lock | Accepted Board receipts (`728822d`, Astra `0b3a043`) + D2 | Low | (a) G-1 is shared-layer work | Later |
| — | Groups 6–8: business wrappers, timers and settlement, lifecycle/secrets/public APIs | Account | — | — | — | D2 shared lifecycle lock | D2 | — | — | Not UI callers; not eligible |

## 5. Candidates in detail

Line numbers are at `5cd63ff`.

### B. Settings → Appearance with its genuinely shared producers (recommended)

**The seven dimensions and every writer.**

| Field | Physical key (device; physical = logical, `accountScope.ts:66–67`) | Registered? | Writers today | Readers today |
| --- | --- | --- | --- | --- |
| Language | `xai_pref_lang` (`accountOwnership.ts:66`) | No | App event subscriber → `writeLocalPref` (`App.tsx:152`); Topbar `persistAndSet` (`Topbar.tsx:102`) | App lazy init (`App.tsx:128`); `AccountStorageGate.tsx:59` |
| Theme | `xai_pref_theme` (`:104`) | No | App subscriber (`App.tsx:149`); Topbar (`Topbar.tsx:103`) | App lazy init (`App.tsx:129`); `NotFoundPage.tsx:3–13` |
| Density | `xai_pref_density` (`:48`) | No | App subscriber (`App.tsx:150`); Topbar (`Topbar.tsx:104`) | App lazy init (`App.tsx:130`) |
| Font scale | `xai_pref_font_scale` (`:62`) | No | App subscriber (`App.tsx:151`) | App lazy init (`App.tsx:131`) |
| Accent color | `xai_accent_hue` (`:5`) | Yes, `number`, default 165 (`registry.ts:146–153`) | Pane `setPref` (`AppearancePane.tsx:103, 113`) | Pane (`:52`), App (`App.tsx:135`) |
| Sidebar position | `xai_rail_pos` (`:107`) | Yes, `string`, `"left"` (`registry.ts:155–162`) | Pane `setPref` (`:122`) | Pane (`:53`), App (`App.tsx:136`) → `WebShellProvider` → Shell `data-rail-pos` |
| Background palette | `xai_bg_tone` (`:14`) | Yes, `string`, `"default"` (`registry.ts:164–171`) | Pane `setPref` (`:111`) | Pane (`:55`), App (`App.tsx:137`) |

- **Event channel.** The pane applies theme/density/font scale to the DOM and emits `web:settings:preference-changed` for every change (`AppearancePane.tsx:77–152`). The only subscriber in production is `App.tsx:146–157`, which writes the four root keys raw and swallows every failure (`writeLocalPref`, `:98–105`). The payload has no result channel (`core/src/types/events.ts:20–27, 193–196`).
- **Topbar.** `persistAndSet` calls the App setter first and then `localStorage.setItem`, swallowing failures (`Topbar.tsx:26–39`). It emits nothing, so the pane's mirrors (seeded once from the DOM, `AppearancePane.tsx:59–73`) do not follow a Topbar change.
- **Footer.** "Save & apply" re-emits the pane's seven values, including the possibly stale mirrors (`:156–166`), and flashes "Saved" unconditionally (`SettingsFooter.tsx:41–83`). Reset calls `removePref` for the three registered keys inside a `try/catch` that cannot see a failure, because `removePref` returns `false` rather than throwing (`AppearancePane.tsx:172–183`; `storage.ts:242–265`). For theme, density and font scale it emits defaults, which App then writes as *values*, not removals. Language is excluded (`:205`).
- **Inventory.** The scanner sees only the pane's three read-only rows (`AppearancePane.tsx:52, 53, 55`). App's three legacy reads (in `apps/`), all raw writers and the event path are invisible to it.
- **No other writer** of the seven keys exists in tracked source (search over `apps/` including `apps/desktop`, the service worker and `apps/web/src/host`, and over `packages/`).
- **Ownership and lifecycle.** All seven are explicit device keys, so `lifecycleForKey` gives device-recovery / retain / retain-on-device without any change (`lifecycleDeclaration.ts:25–37`). No account machinery applies (D2 entry contract item 2).
- **No shared-layer change is needed.** The three registered keys use the accepted `usePrefAutosaveAsync` registered path. The four root keys can use its open-ended suffix path, `usePrefAutosaveAsync("theme", { codec: "json", defaultValue, validate })` → `xai_pref_theme` (`usePrefAutosaveAsync.ts:61–79`), whose ownership resolves to the explicit device entry. The JSON codec writes exactly today's `JSON.stringify` bytes, so the unchanged readers keep working. Device keys skip the account lock (`prefMutation.ts:244`).

**Product and user impact (hypotheses to freeze, not established defects).**
- A failed write is silent on both surfaces: theme, density, font scale and language stay applied while the bytes keep the old value, and they revert on reload; accent, background and rail choices appear not to respond.
- "Save & apply" claims "Saved" after any failure, and with stale mirrors it reverts a Topbar choice.
- One malformed root byte (`xai_pref_lang` `"fr"`, `xai_pref_font_scale` `0`/`null`/`"big"`, `xai_accent_hue` `Infinity`) can make every `/app` route render the route error boundary until site data is cleared (SHELL-04).
- Malformed registered strings (`xai_rail_pos` `"diagonal"`, `xai_bg_tone` `"sage"`) pass through to `<html>` and `.app` (legacy decode is codec-only, `storage.ts:29–38`).
- Root dimensions do not follow another tab until reload.
- There is no departure, unload or sign-out protection, no Retry, Discard, Reload or export, and no truthful status.

**Shared surface.** `apps/web/src/App.tsx` (root state, event writer, apply effects, sign-out preflight), `xai-web-shell` (`Topbar.tsx`; `Shell.tsx` and `types.ts` only for an additive optional render slot of the existing `premiumBadge` kind: `types.ts:120, 185`, `Shell.tsx:82`, `Topbar.tsx:133–134`), and the Topbar tests above. The coordinator, router, storage, tokens, settings shell, core types, pet and CmdK stay unchanged.

**Size.** L. One package plus host and shell, roughly the Features unit plus an App-scoped controller, a Topbar status slot and a sign-out preflight step.

**Dependencies.** None on unaccepted work. **Evidence reuse.** High: Features' production-App jsdom and Chrome harnesses (`web-features-recovery-sol/downstream.test.tsx`, `web-features-recovery-native/native-app.tsx`), the Features lock fixture pattern, the More/Features set/reset export envelope, Sticky's device-continuity pattern, and the frozen F1 runners as regression oracles.

**Sequencing benefit.** B creates the route-independent recovery seam (an App-scoped draft owner, a Topbar status slot, an App-level unload and sign-out step) that the later global shell-preference callers (DesktopPet, AppRail order) need.

**Excludable without a decision.** SET-02's body-text scaling: font-size tokens are fixed `px` (`plugin-web-tokens/src/tokens.css:98–103`), so `applyFontScale` barely changes body text. That is tokens/CSS work; the caller only makes the font-scale *setting* truthful.

**Supports without closing:** SET-02, SHELL-04, REL-05, REL-07, REL-09 (mounted session only), REL-10, UX-03, UX-04, UX-05, QA-01/03/04/09.

### E1. Dashboard Clock widget

- **Writers.** `ClockWidget.tsx:51–52`; style `:265`, timezone `:286` (local) and `:309` (city). **Reader:** CmdK `readModuleStates.ts:38–39`. **Owners:** device (`accountOwnership.ts:28–29`); registry `string` defaults `"classic"`/`"local"` (`registry.ts:268–284`).
- **Why later.** Widgets render with `{ lang, now, goTo }` only (`DashboardGrid.tsx:121`); the Dashboard route's coordinator keeps one guard (`departureCoordinator.tsx:76, 83–92`) and the accepted Dashboard Header already owns it (`DashHeader.tsx:785–798`, plumbed through `DashboardModule.tsx:34, 158`). A Clock caller must therefore change the accepted Header's guard path or the shared coordinator (E1-1). Its product risk and user impact are far lower than B's, and the same aggregation should be designed once together with World Clocks after DASH-03.
- **Supports:** DASH-02 (a verification item), REL-05.

### C. Integrations pane + OAuth `CallbackPage` (combined, line 25)

- **Writers.** Pane bindings and Disconnect (`integrationsPane.tsx:94–116`); `integrationDisconnectButton.tsx:37–44` emits `integration-disconnected` whatever the write result. The callback binds the same three flags (`CallbackPage.tsx:57–86`), flips one to `true` and emits `integration-connected` before any verified persistence (`:163–176`), then auto-navigates (`:123–194`). Connect writes sessionStorage state (`oauthState.ts:99–111`; cleanup `:55–59`) and leaves with `window.location.assign` (`integrationConnectButton.tsx:49`).
- **Owners:** account (`accountOwnership.ts:63–65`).
- **Why later.** Every provider's `clientId` is `""` (`integrationProviders.ts:53, 64, 75`), so production cannot complete an authorization. SET-10 (C-1) decides whether Connect stays at all and what "connected" may claim; it may remove the callback flip. The callback route is a sibling of `:moduleId/*` (`router.tsx:52–55`), outside the Settings coordinator (C-2). User value is low.

### D. Settings → AI

- **Writers.** Four bindings (`aiPane.tsx:49–63`); a provider change writes three keys (`:89–98`); key save, test and clear (`:100–110`, `:112–125`, `:131–138`) go through `aiKeyStorage` (`secretStore.ts:227–242`); DEV seeding writes three keys (`apps/web/src/dev/seedAiConfigFromEnv.ts:59–61`).
- **Readers:** `AiChatModule.tsx:326, 582, 684`, `claudeAdapter.ts:47, 69`, `claudeStreamAdapter.ts:89, 103`, `llmProvider.ts:166, 170`, `secretStore.ts:262`.
- **Owners:** provider, base URL and model are account keys; streaming is device (`accountOwnership.ts:7, 10–12`).
- **Why later.** Ordinary secret writes do not take the account lifecycle lock (fact 7), and the D2 entry contract requires them to (D-1, a shared-layer change). SET-15 depends on AI-06 and REL-02. `remaining-writers.md` line 17 keeps secret coordination inside a complete AI caller, so a preferences-only caller cannot claim the pane.

### E. World Clocks, DesktopPet and AppRail order

- **World Clocks.** `WorldClocks.tsx:42`; an empty list shows four defaults without writing (`:47–52`); add/remove (`:57–65`), and the last city cannot be removed (`:63`). Account key (`accountOwnership.ts:119`). DASH-03 (typed 决策, decision) is open (E-1).
- **DesktopPet.** Id and position (`DesktopPet.tsx:82–83`), position written per `pointermove` and on resize (fact 9), id via `onSelect` (`:188, 247`). Visibility is `useState(true)` in App (`App.tsx:132`) and is not persisted. SHELL-05 asks to persist the hidden state (a new key, so a storage ownership entry) and to write the position only at drag end (E-2).
- **AppRail.** `AppRail.tsx:37`; a drag rebuilds the order from the filtered registry and writes it (`:43–62, 88–89`), which drops a disabled module's stored position (SET-03, E-3).
- **Why later.** Three open product decisions, plus guard aggregation (E-4, as E1-1) and route-independent protection for global shell components, which B establishes first.

### F. Calendar adjuncts

- **Writers.** `CalendarModule.tsx:75` (`xai_pref_week_start`) and `:80` (`xai_calendar_view`), handlers `:84–91`. **Readers:** Statistics (`StatisticsModule.tsx:87`). **Owners:** device (`accountOwnership.ts:27, 105`).
- **Why later.** Only Settings, Pomodoro and Dashboard mount a coordinator (`composedSettingsRegistration.tsx:78`, `pomodoroRegistration.tsx:12`, `dashboardRegistration.tsx:34`), so a Calendar seam is a host change (F-1). Fact 13 shows the accepted Date & Time week start drives nothing; whether Calendar keeps its own setting is SET-08/CAL-01 (F-2). Recovering a control that F-2 may merge or remove would be wasted work.

### G. Board variants and workspace

- **Writers.** Inventory rows `plugin-web-board-core/src/BoardModule.tsx:53–54`, `plugin-web-board-views/src/BoardModule.tsx:83–85`, `BoardWorkspacesModule.tsx:341–355` (including the downstream-only `setRawWorkspaces`), all byte-identical since `f359be6`.
- **Why later.** `remaining-writers.md` line 19 forbids replacing a receipt-preserving domain writer with generic preferences. The accepted Board evidence (`728822d`, Astra `0b3a043`) and the D2 account lock must be reconciled first (G-1).

## 6. Recommendation

**Select B: the complete Settings → Appearance caller, including its genuinely shared producers in `App.tsx` and the Topbar.** The contract is [`../web-appearance-recovery-contract/contract.md`](../web-appearance-recovery-contract/contract.md) (proposed control-plane item `CP-APPEARANCE-01`).

Why B first:

1. **Product risk.** It carries a credible whole-application failure on the most-used preferences: one malformed root byte may disable every `/app` route (SHELL-04), and Settings, the only repair surface, is inside that route. (AppRail order in candidate E may have a similar path, §9; it is unverified and has far less exposure.) It also has silent loss on two surfaces and a cross-surface revert.
2. **User impact.** The seven dimensions shape every page, and language and theme are among the most frequently changed preferences.
3. **No product-owner decision is required** (§7). All nine pre-decisions are scope or technical decisions that preserve current product behaviour (immediate apply, language kept on reset, the same controls) and apply already-decided requirements (REL-05, SHELL-04, SET-02's acceptance criteria).
4. **Bounded inside `web`, with no shared-layer change.** All seven keys are explicit device keys; the accepted engine already serves both the registered and the open-ended suffix paths; no registry, ownership, codec, lifecycle, coordinator, router or tokens edit is needed.
5. **Evidence reuse** is high, and the clean-state chrome-invariance gate (contract §10 item 6) keeps other accepted callers' native visual evidence valid without rerunning it.
6. **Sequencing.** B builds the route-independent recovery seam that E's global shell preferences need.

Why the others come later:

- **E1 (Clock)** needs only an (a) decision, but its risk and impact are low, it would modify the accepted Dashboard Header's guard path, and that aggregation is better designed once together with World Clocks after DASH-03.
- **C, E and F** each need at least one (b) decision first (SET-10; DASH-03, SHELL-05, SET-03; SET-08).
- **D and G** depend on D2 shared-layer work (ordinary AI secrets; Board domain engines and the account lock), which this batch's rule excludes.
- **Groups 6–8** are not UI callers and depend on D2.

## 7. Pre-decisions

### 7.1 Summary

| ID | Candidate | Decision | Class | Recommendation |
| --- | --- | --- | --- | --- |
| B-1 | Appearance | Authorize a contract that edits protected host and shell files, with affected-caller reruns | (a) | Authorize the exact file list of contract §11 |
| B-2 | Appearance | Save semantics: SET-02's "autosave or edit-then-save" | (a) | Keep autosave; remove Appearance's "Save & apply" |
| B-3 | Appearance | Ownership architecture | (a) | One App-scoped controller used by pane and Topbar |
| B-4 | Appearance | Persistence path for the four unregistered root keys | (a) | Open-ended suffix bindings with the JSON codec |
| B-5 | Appearance | Protection model for App-lifetime drafts | (a) | No route guard; Topbar status; App unload and sign-out step |
| B-6 | Appearance | Value domains and malformed bytes (SHELL-04) | (a) | Strict UI domains; refuse, never repair; no throw |
| B-7 | Appearance | Reset definition | (a) | Six dimensions by verified removal; language kept |
| B-8 | Appearance | Dispositions of existing tests that encode removed behaviour | (a) | As contract §11 |
| B-9 | Appearance | How the App-level DesktopPet is judged in hit-tests (R-PET) | (a) | Pet-hidden gated; pet-on gated for new or moved controls |
| E1-1 | Clock | Widget departure-guard plumbing | (a) | Aggregate in `DashboardModule`, with World Clocks |
| C-1 | Integrations | SET-10: Connect without a client ID; what "connected" may claim | **(b)** | Disable Connect while `clientId` is empty and label the stub |
| C-2 | Integrations | Departure policy for the callback route | (a) | Decide after C-1 |
| D-1 | AI | D2 participation for ordinary secret writes, then AI-06/REL-02 sequencing | (a), shared layer | Schedule the D2 secret slice before an AI caller |
| D-2 | AI | Test Connection request semantics (SET-15 "测试连接的真实请求行为明确") | **(b)** | Real request, cancellable, with visible failure |
| E-1 | World Clocks | DASH-03: may the list be emptied? | **(b)** | Allow an empty list with an empty state |
| E-2 | DesktopPet | SHELL-05: persist the hidden state; write position at drag end | **(b)** (its new key also needs a storage ownership entry) | Accept SHELL-05 as written |
| E-3 | AppRail | SET-03: keep disabled modules' stored positions on drag | **(b)** | Keep them |
| E-4 | Pet, AppRail | Route-independent protection | (a) | Reuse B's seam |
| F-1 | Calendar | Calendar route departure seam | (a) | Decide after F-2 |
| F-2 | Calendar | SET-08 / CAL-01: one week-start setting or two | **(b)** | Date & Time drives Calendar and Statistics |
| G-1 | Board | Reconcile accepted Board receipts with the D2 account lock | (a), shared layer | After D2 |

### 7.2 Appearance decisions in detail

**B-1 — Scope: host- and shell-inclusive contract. Class (a).**
- *Options.* (i) Authorize edits to `apps/web/src/App.tsx`, `xai-web-shell/src/{Topbar.tsx, Shell.tsx, types.ts, __tests__/Topbar.test.tsx}` and the shell `docs/api.md`, with the reruns of contract §14 (E16, E24, E25). (ii) A pane-only caller. (iii) Defer Appearance until a separate host or shell refactor.
- *Trade-offs.* (i) is the only complete caller, because pane, App subscriber and Topbar are genuinely shared producers of theme, density and language (line 25). Its cost is the affected-caller reruns and the protected sign-out preflight; the chrome-invariance gate bounds visual re-verification. (ii) leaves two writers outside the unit and would make a false end-to-end claim (lines 16 and 25). (iii) has no owner or plan, and the risk stays.
- *Recommendation:* (i). This is the case the brief names as controller-decidable.

**B-2 — Save semantics. Class (a), with an escalation note.**
- *Options.* (i) Autosave, removing Appearance's "Save & apply" (the Features D3 precedent, confirmed in Features acceptance §5.4). (ii) Keep a button but repurpose it, for example as "Retry all". (iii) Edit-then-save.
- *Trade-offs.* Today every change already persists immediately (three keys through `setPref`, four through the App subscriber), and the Topbar persists immediately too. (i) therefore keeps product behaviour and removes only an unconditional "Saved" and the stale-mirror revert path; it also makes Appearance consistent with the other 13 panes, none of which mounts a Save footer at `5cd63ff`. (ii) invents a new control semantic. (iii) changes product behaviour on both surfaces, so choosing it would be a (b) decision.
- *Why (a).* The caller preserves current behaviour and applies a precedent the controller has already decided. SET-02 is typed 修复 (fix), and its acceptance criteria do not depend on the choice.
- *Recommendation:* (i). If the controller reads SET-02's "或" as a still-open product choice, it should put (i) versus (iii) to the user before registering the contract; the contract is written for (i).

**B-3 — Ownership architecture. Class (a).**
- *Options.* (i) One controller exported by the Appearance package, created once by App, provided to descendants, used by the pane and passed to the Topbar as its setters; it owns the seven bindings, the recovery model and DOM application, and the event channel is retired for these writes. (ii) Separate bindings per surface (pane owns 7; App and Topbar own 4), coordinated only by the engine. (iii) Keep the event bus and add a result channel.
- *Trade-offs.* (i) gives one latest intent per field across surfaces and no conflict between the user's own two surfaces; the shell needs only an additive slot. (ii) puts two writers per key in one tab, so a Topbar choice turns a pane draft into a spurious conflict. (iii) changes the shared core event types and still needs a host writer.
- *Recommendation:* (i).

**B-4 — Persistence path for the root keys. Class (a).**
- *Options.* (i) The open-ended suffix path with `codec: "json"` (`usePrefAutosaveAsync.ts:61–79`). (ii) Add four registry entries. (iii) A caller-side raw writer.
- *Trade-offs.* (i) needs no shared-layer change and reproduces today's bytes. It is the first *device-classified* production consumer of that branch (storage contract tests cover only account-defaulted dynamic keys, `usePrefAsync.contract.test.tsx:297–322`), so Sol must exercise it end to end, and a defect there is a shared defect (contract §11). (ii) is a storage registry change, excluded by this batch's rule. (iii) is forbidden by every accepted contract.
- *Recommendation:* (i).

**B-5 — Protection model. Class (a).**
- *Options.* (i) No Settings route guard; a Topbar status slot shown for settled failures; an App-level `beforeunload` while drafts exist; a sign-out step (native confirm) before each `requestSettingsDeparture("sign-out")`. (ii) The pane also registers the Settings coordinator guard. (iii) A new App-level dialog with Stay, Export and Discard.
- *Trade-offs.* Under B-3 the drafts live in App, survive navigation and stay visible, so route blocking would over-block, and (i) adds nothing to the coordinator (no new F1 surface). The confirm offers no in-dialog export; export stays in the pane. (ii) gives double prompts on Settings and two mechanisms for one draft. (iii) adds a new modal, focus trap and race surface.
- *Recommendation:* (i). Note that `requestDeparture` resolves `true` whenever no coordinator is mounted (`settingsDeparture.ts:14–16`), so without (i) a Topbar draft has no protection at all.

**B-6 — Domains and malformed bytes. Class (a).**
- *Options.* (i) Strict domains equal to what the UI can submit; invalid or unreadable bytes display and apply the default, show a source alert with Reload only, and are never thrown or rewritten; storage's extra `"sage"` is invalid. (ii) Normalize on read and rewrite. (iii) Accept the registry-wide types.
- *Trade-offs.* (i) follows the More and Features precedent and REL-07, and it removes the crash hypotheses. Its cost is that malformed bytes cannot be repaired from the UI, because the engine refuses to mutate an invalid source (`prefMutation.ts:198`); this is the retained REL-07 limitation. Treating `"sage"` as invalid strands no value this product wrote: since the original pane (`61f6177`) the Sage background's id has been `default`, and `sage` is only a hue-preset id (`constants.ts:23, 32`). (ii) violates REL-07. (iii) keeps the `"sage"`/`"diagonal"` pass-through.
- *Recommendation:* (i).

**B-7 — Reset definition. Class (a).**
- *Options.* (i) A pane-local Reset of six dimensions by verified removal, language kept, with truthful confirmation text. (ii) Today's mixed reset (three removals, three default values written). (iii) Include language.
- *Trade-offs.* (i) is the accepted recoverable-remove semantics, and readers fall back to the same defaults. (ii) keeps a path with no per-field truth. (iii) changes product behaviour (a (b) decision) and is not needed.
- *Recommendation:* (i).

**B-8 — Test dispositions. Class (a).**
- *Options.* (i) Retire or adapt the tests that encode removed behaviour (the Save flash, event emissions, raw Topbar writes, the silent quota swallow) exactly as contract §11 lists; keep every other business assertion. (ii) Keep them unchanged.
- *Trade-offs.* (ii) would freeze the defects as expected behaviour.
- *Recommendation:* (i).

**B-9 — R-PET hit-test rule. Class (a).**
- *Options.* (i) Gated runs with the pet hidden through its own rail toggle; a pet-on run in which controls *new or moved by this caller* must have an uncovered center (blocking), while coverage of unchanged controls is recorded under UX-03/SHELL-05. (ii) Pet hidden only (the Features ruling). (iii) Pet-on fully gated.
- *Trade-offs.* (i) encodes the R-PET lesson that a caller may not move a functional control into the pet band, while the protected pet's own placement never blocks the caller. (ii) repeats the Features gap. (iii) would let a protected overlay block unrelated, unchanged controls.
- *Recommendation:* (i).

### 7.3 Other candidates' decisions in detail

**E1-1 / E-4 — Dashboard widget guards. Class (a).** (i) `DashboardModule` aggregates the Header guard and widget guards into one coordinator registration; (ii) a multi-guard coordinator; (iii) no guard. (i) touches the accepted Header's host path and needs Header reruns. (ii) is a shared coordinator change with F1-class reruns for every coordinator user. (iii) violates REL-05. Recommend (i), designed once for Clock and World Clocks.

**C-1 — SET-10. Class (b).** Options: (i) disable Connect while `clientId` is empty, label the integration as a preview, keep Disconnect for flags already set; (ii) hide the integrations stub until real OAuth exists (JOB); (iii) keep the stub flow, labelled as a demo. This is product behaviour and decides what "connected" may claim. Recommendation for the user: (i). **C-2 (a)** follows once C-1 is decided.

**D-1 — AI secrets. Class (a), but a D2 shared-layer change.** Schedule the D2 ordinary-secret slice (`secretStore.ts:227–242` must join account coordination) and the AI-06/REL-02 sequence before any AI caller. **D-2 — Test Connection. Class (b).** Options: (i) a real provider request, cancellable, with visible failure and no secret in any export; (ii) local validation only. This is product behaviour with network and cost implications. Recommendation for the user: (i).

**E-1 — DASH-03. Class (b).** (i) Allow an empty World Clocks list with an empty state; (ii) keep the last city non-removable and explain why. Recommendation for the user: (i).

**E-2 — SHELL-05. Class (b).** Persisting the pet's hidden state is new product behaviour, and its new key would also need a storage ownership entry (shared layer). Writing the position only at drag end changes behaviour that the ledger already proposes. Recommendation for the user: accept SHELL-05 as written, then schedule the storage entry separately.

**E-3 — SET-03 pruning. Class (b).** Whether an AppRail drag may drop a disabled module's stored position is part of SET-03's catalog decision. Recommendation for the user: keep stored positions.

**F-1 — Calendar seam. Class (a).** Mount a coordinator for the Calendar route or reuse B's route-independent seam; decide after F-2. **F-2 — SET-08/CAL-01. Class (b).** (i) Date & Time drives Calendar and Statistics, and Calendar's control becomes a view of it; (ii) keep two settings with labelled scopes; (iii) remove Calendar's own setting. Recommendation for the user: (i).

**G-1 — Board. Class (a), shared layer.** Reconcile the accepted Board receipts with the D2 account lock before any hook-row caller.

## 8. Contract status

A contract was written: [`../web-appearance-recovery-contract/contract.md`](../web-appearance-recovery-contract/contract.md). B needs no (b) decision, no D2 shared-layer change and nothing outside `web`. Decisions B-1 … B-9 appear there as assumptions A1–A9 awaiting controller confirmation, and nothing may be implemented before the controller registers the item and its first batch (the frozen before baselines E1–E5).

## 9. Observations recorded for later (no action here)

- After B, `web:settings:preference-changed` will have no production emitter or subscriber, and `SettingsFooter`, `resetAllPrefs` and `RESET_DEFAULTS` will have no production mount or caller. That is SET-01/REL-10 cleanup; the core event type stays declared.
- Three different `BgTone` domains exist: storage (with `"sage"`), tokens (without it) and the core event payload (with it, `events.ts:26`). Unifying them belongs to SHELL-04/core.
- `readLocalPref` stays exported for its unit tests but App will no longer call it.
- The shared number codec decodes empty bytes as `0` and the bytes `Infinity` as `Infinity` (`codec.ts:48–52`). That is REL-07/REL-11 hardening.
- Below 760 px the Topbar hides its appearance summary (`plugin-web-tokens/src/layout.css:1832–1839`); any global indicator must work icon-only.
- `xai_pref_dt_start_week` drives nothing (fact 13): SET-08.
- AppRail iterates the stored order with `for … of` (`AppRail.tsx:46`). A stored `xai_rail_order` that is valid JSON but not an array may therefore throw inside the Shell and disable every `/app` route, as H6 hypothesizes for the root keys. This is unverified; it belongs to candidate E's before-oracles and to SHELL-04/REL-07.

## 10. Limitations of this memo

- Static reading only. I executed no product code, so every behaviour in §5 is a cited source fact or a hypothesis for the before-oracles, never an established defect.
- The searches exclude `docs/` and, unless stated, tests. Dynamic keys were followed through their helpers (`featurePrefKey`, `prefKey`, `usePrefAutosaveAsync` suffixes), not only by literal key.
- Sizes are rough estimates.
- B-2 is a judgement that the controller may escalate (§7.2).

## 11. Scope statement

This memo selects; it does not accept. It changes no product file, test, runner, oracle, existing evidence, ledger or control-plane file, and it adds only this file and the contract. Selecting B closes **no** 312 item, including SET-02, SHELL-04, REL-05/07/09/10, UX-03/04/05 and QA-01/03/04/09, and it does not change the formal count of 13 completed and 299 open. No push, merge, rebase, branch operation, deployment, release or Web→Desktop sync was performed.
