# Complete caller: Settings Features, all 8 module toggles and Reset to defaults

Contract designer: Astra role (risk, design and final decision), executed by an independent Claude Opus 5.5 instance in an isolated detached worktree. Module `web`, 2026-10-04. Control-plane item: proposed `CP-FEATURES-01`, which takes effect only once the controller registers it.

**Fixed product and source equality.**
- Fixed product: `f359be6d838393e0f9e93efd80b88b5b09f6144e` (`f359be6`, tree `2280bc7617d52dc6c4356da257d57940ecb174ec`). The contract was authored at docs HEAD `51d65aa`. `git diff --name-only f359be6 51d65aa -- apps packages package.json pnpm-lock.yaml` is empty.
- Lockfile SHA-256: `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`.
- From `afbfb24` to `f359be6`, `git diff` is empty for all of the following:
  - `packages/xai-web-settings-features-panel`;
  - `plugin-web-storage`, `plugin-web-settings-shell`, `xai-web-shell`, `xai-web-pet`, `xai-web-cmdk` and `plugin-web-tokens`;
  - `apps/web/src/App.tsx`, `shellRegistrations.tsx`, `composedSettingsRegistration.tsx` and `settingsDeparture.ts`.

  The coordinator changed only through the accepted F1 repair (SHA-256 `0844a697…`).
- The unit's source:
  - `FeaturesPane.tsx` is unchanged since `79cd0e7` (2026-05-23), SHA-256 `987c38250554f05eee185073f92fdfafc504b5e3f9c183658fc5aeb583ce50ea`.
  - `src/internal/featuresPane.tsx`: `14053daa…`.
  - `src/types.ts`: `bd6b3599…`.
  - `src/styles.css`: `db4a5f24…`.
  - Package tree: `074659c050fadd11ed3ff99274e441b48771b490`.

**Status.**
- This contract specifies the next ordered implementation unit after the accepted Sticky caller (`699f6e6`).
- It does not authorize implementation. It accepts nothing, changes no formal count and closes no 312 item.

**Authority.**
- **Selection:** [selection-f359be6.md](../web-next-caller-selection/selection-f359be6.md), candidate A.
- **Scheduling:** [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md).
  - Line 16 requires the Features "dynamic per-feature bindings plus a raw all-feature remove/reset and synthetic storage notification" to be audited across normal, reset and application flows.
  - Line 25 sets the selection rule.
- **Inventory:** [refresh-f359be6.md](../web-d2-pref-binding-inventory/refresh-f359be6.md) and `bindings-f359be6.json`.
  - Lines 447–455 hold the one dynamic writer row.
  - Lines 456–464 hold the dynamic read-only `withDisabledFallback` row.
- **Precedents:**
  - The [Sticky contract](../web-sticky-recovery-contract/contract.md) is the structural analogue for a device-only caller.
  - The [More contract](../web-notifications-recovery-astra/next-more-contract.md) supplies the reset semantics: a pane-scoped recoverable remove with a set/reset export envelope.
  - The [F1 impact review](../web-sticky-recovery-f1/impact-review.md) supplies the coordinator regression oracle.
  - [`blocked-f359be6.md`](../web-sticky-recovery-acceptance/blocked-f359be6.md) §4 is the G1 lesson, implemented here as §14.

## 1. Roles, order and risk

| Role | Executor | Boundary |
| --- | --- | --- |
| Parent / controller | Claude controller | Scheduling and the contract check. Also runs the actual composed-host and production-App baselines, native/browser verification, the Features F1 runner and the ledgers. |
| Sol | New independent Opus-class instance | Freezes business oracles against an immutable `f359be6` archive before any implementation, then reruns them unchanged on the fixed product. |
| Terra | Implementation instance; Opus-class recommended at this risk | The complete caller, inside the §11 files only. Starts after every before baseline in §14 (E1–E5) is frozen and the controller authorizes it. |
| Final regression | New instance, distinct from Terra and Sol | Runs §13 row 8 and writes the §14 E25 receipt. |
| Final acceptance | New instance, distinct from this author, Terra, Sol and the final-regression verifier | Reconciles every §13 row and every §14 evidence item: source → correct before failure → fixed independent result → actual surface. |

**Exclusions by role.**
- Luna gets no task. Persistence, the async queue, the host, cross-module isolation and acceptance are its forbidden zones, and no bounded lookup may own a gate.
- Spark is never assigned.

**Order.**
1. Contract.
2. Controller check and registration.
3. Frozen before baselines (E1–E5): Sol oracles, parent jsdom host, native cross-module before, and the Features F1 before-log.
4. Terra implementation.
5. Sol fixed reruns.
6. Parent host, native and F1 verification.
7. Final regression, with its checklist receipt.
8. Independent acceptance.

Do not run another caller concurrently.

**Risk: high (confirmed).**
- **What device-only ownership removes:**
  - account-scoped physical keys;
  - the account lifecycle lock;
  - private-owner admission;
  - committed-marker, tombstone and recovery admission;
  - the private-draft disposal boundary;
  - the mixed-owner reset batch.
- **What still makes this unit high risk:**
  - asynchronous same-field queue attribution on 8 keys;
  - mixed set/reset attribution under an 8-key reset batch;
  - a cross-module side effect to remove. The current reset repaints unrelated device preferences in the whole tab, and can lead to an AppRail order overwrite (H6).
  - downstream consumers that decide module reachability: the rail, deep links and search;
  - REL-05-class loss behind a false "Saved";
  - host departure arbitration in the F1 shape, because a reset batch completes field by field and notifies repeatedly;
  - memory-only export under total storage denial;
  - native evidence in a production `App` composition.

## 2. Exact ownership inventory

**The unit.** It consists of:
- `packages/xai-web-settings-features-panel/src/FeaturesPane.tsx` and `src/internal/featuresPane.tsx`;
- **all 8 module toggles** behind the one dynamic `usePref` binding (`FeaturesPane.tsx:68–73`);
- the raw pane reset (`:101–119`);
- the footer callbacks (`:41–45`);
- the actual Settings departure seam.

**Naming and sources.**
- The field identifier is the `FeatureId` (`featureIds.ts:12–20`). Display order is `featureIdOrder` (`:28–37`).
- The exact physical key is `xai_pref_features_` + id (`featurePrefKey`, `:47–49`). For a device key the physical key equals the logical key (`accountScope.ts:66–67`).
- Ownership comes from `accountOwnership.ts:54–61`.
- Defaults and codecs come from `registry.ts:498–568`. All 8 are boolean, default `true`, schemaVersion 1, category `pref`. The registry's `owner` field is package metadata, not account scope.
- Labels come from `plugin-web-tokens` (`i18n.ts:17` EN and `:334` ZH for `nav.<id>`; pane title `settings.features` at `:86` and `:403`).

| Field / control | Label EN / ZH | Strict domain | Default / codec / exact bytes | Owner / physical key |
| --- | --- | --- | --- | --- |
| `tasks` / switch in `.feat-card[data-feature-id="tasks"]` | Tasks / 任务 | boolean | `true` / boolean; exactly `true` or `false` | device / `xai_pref_features_tasks` |
| `board` / same pattern | Boards / 项目板 | boolean | same | device / `xai_pref_features_board` |
| `dashboard` | Dashboard / 工作台 | boolean | same | device / `xai_pref_features_dashboard` |
| `calendar` | Calendar / 日历 | boolean | same | device / `xai_pref_features_calendar` |
| `matrix` | Matrix / 四象限 | boolean | same | device / `xai_pref_features_matrix` |
| `pomodoro` | Pomodoro / 番茄钟 | boolean | same | device / `xai_pref_features_pomodoro` |
| `habits` | Habits / 习惯 | boolean | same | device / `xai_pref_features_habits` |
| `meditation` | Meditation / 冥想 | boolean | same | device / `xai_pref_features_meditation` |

**Domain enforcement is caller-only.**
- `validateRegisteredPrefValue` checks only the primitive type (`prefMutation.ts:42–47`).
- The boolean codec encodes `true`/`false` and decodes only those exact bytes (`codec.ts:26–27, 53–56`).
- The strict validator (`typeof value === "boolean"`) comes from the caller's `validate`, which `usePrefAutosaveAsync` composes with the codec boundary (`usePrefAutosaveAsync.ts:37–58`).
- Do not add domains to the registry, codec or engine.

**Hidden or conditional inputs: none.**
- All 8 switches always render, in `featureIdOrder`.
- Every switch submits a closure-bound value. No control submits a DOM-provided value.
- The pane-level actions are the shared footer's "Reset to defaults" and "Save & apply" (`FeaturesPane.tsx:41–45`).
- The `FeatureThumb` SVGs are decorative (`internal/FeatureThumb.tsx`).

**Writers and readers outside the pane.** A search at `f359be6` over tracked files, excluding `docs/` and `*.md`, found:
- **Writers:** none outside this package's pane, reset and tests. The literal `xai_pref_features_` occurs in:
  - `App.tsx` (2, both comments);
  - `shellRegistrations.tsx` (2, comments);
  - storage `registry.ts`, `accountOwnership.ts` and two storage tests;
  - the `apps/web` rail-filter test `railFeatureFilter.test.tsx` (2);
  - CmdK (1);
  - the features package.

  `featurePrefKey(` is called only at `FeaturesPane.tsx:68` and `:104` and at `withDisabledFallback.tsx:36`.
- **Readers.** Only the first sits in the TSX `usePref` scanner's boundary.
  1. `withDisabledFallback.tsx:42–49` (dynamic read-only row) wraps the 8 module routes (`shellRegistrations.tsx:71–81`) and renders `DisabledFeatureFallback` when the value is `false`.
  2. `useFeaturePrefs.ts:17–31` makes 8 legacy `usePref` reads in a `.ts` file. It feeds the App rail filter: `App.tsx:179–182` → `filterModulesByFeaturePrefs` (`filterModulesByFeaturePrefs.ts:17–25`) → `WebShellProvider modules` (`App.tsx:221`) → AppRail (`AppRail.tsx:34`).
  3. CmdK `readEnabledSearchModules()` reads the 8 keys through synchronous `getPref` when the palette opens (`CommandPalette.tsx:43–52, 79–84, 194–209`).
- **Lifecycle** (`lifecycleDeclaration.ts:25–33`) classifies them as device data: export scope `device-recovery`, `retain` on account deletion, `retain-on-device` in migration.
- **`resetAllPrefs()`** (`plugin-web-settings-shell/src/internal/resetAllPrefs.ts:29–45`) would remove all 8 keys, but no production path calls it. The only production `SettingsFooter` mounts pass overrides: Features (`FeaturesPane.tsx:41–45`) and Appearance (`AppearancePane.tsx:419–423`).

**Preserve:**
- pane id `features`, icon `sliders`, i18nKey `settings.features` (`internal/featuresPane.tsx:15–20`);
- the `featuresPane` object identity used by composition (`settingsPaneComposition.ts:46`), asserted at `apps/web/src/routes/modules/__tests__/settingsPaneComposition.test.tsx:18–21` and `apps/web/src/__tests__/settingsPaneComposition.appearance.test.ts:31–35`;
- the title and intro (`settings.features`, `settings.features_intro`);
- the 8 cards in `featureIdOrder` with `data-feature-id`, names, descriptions and `FeatureThumb` SVGs (no `img`, no network);
- each switch's existing accessible name, `<Label> — on|off` (`FeaturesPane.tsx:88`);
- the visible label "Reset to defaults" / "恢复默认" (`SettingsFooter.tsx:98`);
- immediate autosave;
- `DisabledFeatureFallback` copy and behavior;
- every public export in `src/index.ts`.

## 3. As-is behavior at `f359be6`

These are facts only. Suspected defects appear solely as hypotheses in §12.

1. **Result is discarded.** The binding is cast to `readonly [boolean, (next: boolean) => void, unknown]` (`FeaturesPane.tsx:69–73`). That discards the legacy setter's boolean result (`usePref.ts:43–47`) and its meta.
2. **Synchronous unlocked writes.**
   - Each toggle is a synchronous `setPref` (`usePref.ts:130–151` → `storage.ts:161–227`): compare-before-write, then `localStorage.setItem`. There is no Web Lock, expected baseline or readback.
   - On failure `setPref` returns `false` and the hook keeps its previous value (`usePref.ts:141–146`). The pane never observes the result.
3. **No source health.**
   - Reads use `getPref`, which returns the registry default (`true`) when `getItem` throws or decoding fails (`storage.ts:132–155`).
   - No source-health signal reaches the pane.
4. **How the control submits.** `onChange={() => setOn(!on)}` inverts the rendered closure (`FeaturesPane.tsx:87`). The shared `Toggle` is a `<button role="switch" aria-checked>` with no key handlers (`plugin-web-settings-shell/src/Toggle.tsx:10–24`).
5. **Reset path.**
   - The footer's `handleReset` calls `confirmAction` (`window.confirm`, `confirmAction.ts:8–14`) with the shared text "Reset every preference to defaults? This clears saved theme, layout, and module toggles." (`SettingsFooter.tsx:85–96`).
   - It then calls `resetAllFeaturePrefs()` synchronously. That function:
     - runs `localStorage.removeItem` per key, swallowing every error (`FeaturesPane.tsx:102–108`);
     - **always** dispatches `new StorageEvent("storage", { key: null, storageArea: localStorage })` (`:114–118`).
   - No result or feedback is produced.
6. **What a `key: null` event does.**
   - Every mounted legacy `usePref` instance sets its displayed value to its default (`usePref.ts:155–166`, null branch `:161–165`).
   - Every mounted async binding re-projects (`usePrefAsync.ts:162–166`), and a dirty, error or conflict binding becomes `conflict` (`:149–151`).
   - On the Settings route the mounted legacy instances include:
     - the App's accent hue, background tone and rail position, applied by `App.tsx:163–165` (bindings `App.tsx:135–137`);
     - the 8 `useFeaturePrefs` reads (`App.tsx:179`);
     - AppRail order (`AppRail.tsx:37`, persisted by drag at `:88–89`);
     - DesktopPet id and position (`DesktopPet.tsx:82–83`).

     This is the only `key: null` dispatcher in production source. The other synthetic events, in `sessionController.ts:72` and `useOrderSaveRecovery.ts:36`, are key-specific.
7. **Save & apply.** `onSave={() => []}` (`FeaturesPane.tsx:43`). The footer emits nothing and shows "Saved" for 1.8 s whatever happened (`SettingsFooter.tsx:41–83`, `:75`). This "flash still shows" behavior is documented in `plugin-web-settings-shell/src/types.ts:104–108`.
8. **No guard or recovery.**
   - `featuresPane.render` forwards only `lang` (`internal/featuresPane.tsx:19`), although the host passes `registerDepartureGuard` (`composedSettingsRegistration.tsx:105`).
   - The pane has no `beforeunload` listener, recovery UI, export or truthful status.
9. **Presentation.**
   - The cards sit in `.features-grid` (`styles.css:27–31`: `repeat(auto-fill, minmax(280px, 1fr))`).
   - The package stylesheet is **global**: it is imported once as a side effect (`src/index.ts:17`).
   - No Features recovery selectors exist.
10. **Existing tests.**
    - AC-PANE-1–6 (`FeaturesPane.test.tsx:17–83`) cover:
      - rendering, labels and thumbnails;
      - one synchronous toggle (`:34–48`);
      - reset through the footer with `window.confirm` stubbed (`:10–14, 67–83`).
    - AC-REG-1–3 (`featuresPaneEntry.test.tsx:9–23`) cover the registration.
    - Reader tests: `useFeaturePrefs`, `withDisabledFallback`, `filterModulesByFeaturePrefs` and `DisabledFeatureFallback`.
    - `apps/web` tests: `railFeatureFilter.test.tsx` (AC-APP-1–3) and the composition tests.
    - Nothing covers failure, recovery, source health, the host, export, keyboard or the cross-module effect of reset.
11. **Accepted async interface to reuse.** Everything in the Sticky contract §3 item 8 applies:
    - `usePrefAutosaveAsync` returns `{ value, edit, retry, reset, meta }` (`usePrefAutosaveAsync.ts:85–93`);
    - device identity is stable across accounts (`usePrefAsync.ts:98`);
    - source classification (`:61–68`);
    - the same-field queue and coalescing (`:169–243`);
    - invalid values are refused before enqueue (`:245–260`);
    - a failed request blocks the queue and keeps its token (`:195–200`; retry `:262–279`);
    - `meta.reload` (`:291–300`).

    In addition:
    - **Reset in the hook** (`usePrefAsync.ts:281–289`) settles queued requests with a `conflict` refusal, clears any failed request and enqueues a reset.
    - **The engine's reset branch** (`prefMutation.ts:199–216`):
      - an expected-baseline conflict (`:200–202`);
      - a verified no-op when the key is already absent (`:203–205`);
      - `removeItem` (`:207`);
      - readback-uncertain with a retry token (`:208–211`);
      - a same-tab publication of the default (`:214`).
    - **Ordering.** Invalid or unavailable sources are refused *before* the reset branch (`:198`). Device keys skip the account lock (`:244`).
    - **Legacy readers stay informed.** Every successful engine commit or reset publishes on the same-tab bus (`:98, 177, 192, 214, 239`; `sameTabBus.ts:24–31`), which legacy `usePref` subscribes to (`usePref.ts:200–208`).
12. **The Settings host.**
    - `ComposedSettingsModule` wraps the sidebar and detail in `DepartureCoordinator` (`composedSettingsRegistration.tsx:78–109`). Sidebar rows ignore activation while a departure is pending (`:91, 95`).
    - The coordinator, at `f359be6`:
      - keeps **one** token-keyed guard (`departureCoordinator.tsx:76, 83–92`);
      - blocks route and POP changes through `useBlocker` (`:105–110`);
      - reserves and replays the first programmatic intent (`:131–156`);
      - holds sign-out (`:158–170`);
      - binds, proceeds or resets only the router's live blocked blocker, at most once each (`:179–213`, the F1 repair);
      - releases once when the current guard stops blocking (`:214–222`);
      - provides Stay, export and discard-and-leave (`:224–240`);
      - manages focus and the Tab trap (`:244–284`).
    - Without a guard label it falls back to "Smart Lists" (`:242`).

## 4. Scoping decisions

**D1 — A single-package caller; readers are protected.**
- All writers of the 8 keys are in §2's unit.
- `withDisabledFallback`, `useFeaturePrefs`, `filterModulesByFeaturePrefs`, the App rail filter, AppRail and CmdK are readers. Their source stays unchanged, and §10 proves they stay consistent.
- This is not a combined Appearance caller. The two panes write disjoint key sets. Their only coupling is D2's side effect, which this caller removes.

**D2 — The synthetic `key: null` event is removed.**
- Per-key engine resets replace the raw loop. The legacy readers keep receiving updates through the engine's same-tab publication (§3 item 11).
- The features package dispatches **no** `StorageEvent` of any kind, and adds no other broadcast mechanism.

**D3 — No shared Save footer.**
- Features stops rendering `SettingsFooter`. Its "Save & apply" is removed: the pane autosaves, and the footer's "Saved" is unconditional, which is a false success claim.
- "Reset to defaults" becomes a Features-local control. It keeps the same visible label, gets a truthful `window.confirm` text (§6), and adds verified per-field results.
- `SettingsFooter`, `confirmAction` and `resetAllPrefs` stay unchanged, and Appearance keeps the footer.
- This is a visible UI change that the controller confirms at the contract check (selection memo §6 item 2).

**D4 — Device-only confirmed.**
- The export has a device bucket only (§8).
- Reset needs no active account and works while locked.
- The lifecycle scope narrows as in §1.

**D5 — No catalog or host capability change.** SET-03 work is excluded (§16):
- which modules may be disabled;
- what happens to Time Tracker, Bookkeeping and Metrics;
- the landing page when Dashboard is off;
- CmdK refresh while it is open;
- AppRail pruning of disabled modules from the stored order.

**D6 — Counts match.**
- One inventory writer row stands for 8 fields. The `withDisabledFallback` row is a reader.
- `useFeaturePrefs` (8 reads in a `.ts` file) and CmdK's `getPref` reads are readers outside the scanner's boundary.
- Inventory rows are not defect counts.

**Controller notes (non-blocking).**
- The switch's accessible name embeds English "on/off" even in ZH (`FeaturesPane.tsx:88`). It is kept unchanged. This is UX-05 copy work.
- Malformed stored bytes cannot be repaired through Reset, because the shared engine refuses to mutate an invalid or unavailable source (`prefMutation.ts:198`). The old raw reset removed such bytes blindly; that behavior is deliberately not preserved (More precedent). This is a retained D2/REL-07 limitation.
- AppRail drops a disabled module's stored position on the next drag (`AppRail.tsx:43–62, 88–89`). That is pre-existing and belongs to SET-03 and the shell.

## 5. All 8 toggles: edit, source and operation requirements

**Interface.**
- Use the accepted `usePrefAutosaveAsync` edit, retry, reset and meta interface: one binding per key, in `featureIdOrder`, with a fixed count and a stable hook order, and a strict boolean validator.
- Preserve the shared queue and coalescing, result semantics, exact baseline and readback, and uncertainty grants.
- Do not add:
  - a second persistence effect;
  - raw storage calls or a caller storage preflight;
  - a forced rebase or a manual lock layer;
  - any `StorageEvent` dispatch;
  - any change to legacy `usePref`/`setPref` behavior for other callers.
- Call `reset` only for Reset to defaults (§6). A failed set or reset is retried through `retry`, which keeps the failed request's kind and token (`usePrefAsync.ts:262–279`).

1. **Zero-write mounts.**
   - Valid and absent mounts and rerenders make zero set/remove attempts on all 8 keys. So do the App readers and route guards.
   - Absence displays the default "on" as a display value only.
2. **Source truth.**
   - These sources are invalid or unavailable:
     - bytes other than exactly `true`/`false`, for example `1`, `0`, `TRUE`, `True`, `yes`, an empty string, `"true"` with JSON quotes, or ` true`;
     - a key whose `getItem` throws.
   - Each such field gets its own localized message with **Reload only**. It displays the default and makes no Saved claim. It creates no draft, export entry, departure guard or unload warning.
   - Mount, Reload and Discard never rewrite, purge or normalize those bytes.
   - A valid edit over such a source is actual work. Keep the chosen value as a failed draft with Retry, Discard, export and guard. Never silently overwrite the source.
3. **Malformed DOM input: none exists**, because every control is closure-bound. Validators still apply at the edit boundary. Oracles must not fabricate private calls to reach an invalid value the UI cannot submit.
4. **Identity and latest authority.**
   - Each valid edit establishes its field, session and operation identity before it is enqueued.
   - It displays immediately (`aria-checked`, the `on` class), even while the per-key lock is held. Controls stay enabled while an operation is pending.
   - Switches invert the **latest intent**, not the rendered closure. Two same-turn activations, or two during a held lock, return to the original value through two operations.
   - Completion authority belongs to the exact draft object. It does not come from value equality, `meta.value`, `meta.status`, an earlier success or failure, or a predecessor Promise.
   - Only the matching latest success clears a field's work.
   - Turning a module back on stores `true`. It is never converted to removal.
5. **Failures keep the latest choice.**
   - Covered failures: quota, a throwing `getItem` or `setItem`, missing or rejected Web Lock capability, conflict, and readback uncertainty.
   - Each keeps the latest choice with accurate pending or failed feedback. None may produce an unhandled rejection or a false Saved.
   - A Retry while the field is pending is inert or idempotent.
   - Cover these orderings:
     - the predecessor succeeds and the latest fails;
     - the predecessor fails while the latest stays queued, and Retry advances the predecessor without acknowledging the latest;
     - repeated failed-predecessor recovery;
     - a later failure of the latest.
6. **Uncertainty and conflict.**
   - An unchanged uncertain Retry keeps its grant across temporarily denied reads or locks. It reconciles with exactly one total write, and readback must match the intended bytes.
   - An external replacement or removal stays a preserved conflict, including restoration of the original baseline bytes.
   - Repeated Retry never gains authority to overwrite. A distinct new choice is a new operation.
7. **Independent settlement.**
   - A field's success never retries, rewrites, discards or rereads a sibling.
   - Cover:
     - several, and all 8, fields unresolved at once;
     - a conflict coexisting with an unrelated quota failure;
     - one field's set failing while another field's reset succeeds, and the reverse.
   - General Saved requires both:
     - a genuine latest success in this mount;
     - no current drafts, pending operations or source errors.
   - A source-only Reload repair clears its alert but does not by itself claim a save.
8. **Recovery actions.** Each field has its own Retry, Discard and, for source-only issues, Reload, each localized and labelled with the module name.
   - Reload refuses, at invocation time, to erase the same field's actual draft.
   - Discard detaches the field's work before the safe `meta.reload()`. It makes zero set/remove attempts and rereads only that field.
   - "Discard all changes" visits only actual current drafts.
   - A late completion after discard, reload or unmount never revives discarded state or clears newer work.
   - Source repair never acknowledges failed actual work.

**Normative wording.** It is fixed here so that oracles can be frozen beforehand.

| Element | EN / ZH wording |
| --- | --- |
| Field labels (existing `nav.<id>`) | `Tasks`/`任务`, `Boards`/`项目板`, `Dashboard`/`工作台`, `Calendar`/`日历`, `Matrix`/`四象限`, `Pomodoro`/`番茄钟`, `Habits`/`习惯`, `Meditation`/`冥想` |
| Per-field actions | `Retry <Label>`/`重试 <Label>`, `Discard <Label>`/`放弃 <Label>`, `Reload <Label>`/`重新读取 <Label>` |
| Pane actions | `Reset to defaults`/`恢复默认` (existing label), `Export Features draft`/`导出功能草稿`, `Discard all changes`/`放弃全部更改` |
| Field messages | `<Label> is saving.`/`<Label>正在保存。`; `<Label> is being reset to its default.`/`<Label>正在恢复默认。`; `<Label> was not saved.`/`<Label>未保存。`; `<Label> was not reset to its default.`/`<Label>未恢复默认。`; `Saved <Label> is unavailable. Reload it; this is not a new unsaved change.`/`已保存的<Label>不可用。请重新读取；这不是新的未保存更改。` |
| Status lines | `Features settings saved.`/`功能设置已保存。`; `Defaults restored.`/`已恢复默认设置。`; `Export failed. Please retry.`/`导出失败，请重试。` |
| Reset confirmation (`window.confirm`) | `Turn all 8 modules back on? This only changes which modules are shown; your data is kept.` / `将全部 8 个模块恢复为开启？这只改变显示哪些模块，数据会保留。` |
| Departure guard label | `Features`/`功能` (`settings.features`) |

## 6. Reset to defaults: a recoverable remove operation

**Meaning.**
- A pane-scoped removal of exactly the 8 physical keys. After verified absence the UI returns to the registry default, "on".
- It is not writing `true` eight times, a global reset, or Discard.
- It never reads, writes or removes any other key: Appearance, rail order, pet, other panes or any account data.

**Control.** A Features-local button:
- visible label `Reset to defaults`/`恢复默认`;
- `data-testid="features-reset-defaults"`;
- keyboard operable, and at least 44×44 at every width.

**Confirmation.**
- `window.confirm` with the §5 normative text runs before any intent exists.
- **Declined:** from activation until the declined action returns, zero get, set or remove attempts on every key, and no state change.
- **Accepted:** the batch below.

**Batch admission.**
- On acceptance, synchronously establish 8 typed reset intents and a batch identity before any asynchronous settlement.
- Each intent uses its binding's accepted `reset`.
- This is not a cross-key transaction: no rollback of successful fields, and no all-or-nothing promise.
- There is no account gate. The batch works with an account, a demo or while locked.
- An epoch change during the batch does not cancel admitted device operations, and does not let old host capabilities act (§7).

**Per-field reset truth.**
- Track set and reset as distinct draft intents, even when their displayed values are equal.
- Reset success requires verified absence.
- A failed remove keeps a **reset draft**. It displays the intended default "on" with the "was not reset" message, and keeps Retry, Discard, export and the guard.
- Retry of a reset draft re-attempts removal only and never writes `true`. When the hook holds no failed request, its `retry` performs a *set* of the displayed value (`usePrefAsync.ts:278`). A reset draft's Retry must never reach that path.
- An already-absent field completes through the engine's verified no-op (`prefMutation.ts:203–205`). No default bytes are seeded.
- An invalid or unavailable source follows the shared refusal (`:198`). The reset intent is kept until legitimate recovery or Discard. Reset is never authority to purge malformed or unreadable bytes.

**Partial reset and queue behavior.**
- Only unresolved fields remain drafts, export entries and guard reasons.
- Retry targets only those fields. Successful fields are not removed again.
- A duplicate Reset to defaults while the batch is pending enqueues no duplicate removes.
- Repeating an unchanged failed reset keeps its refusal or uncertainty authority. It does not rebase.
- A clean completed batch may later receive a fresh reset. An intervening edit is a new intent.

**Ordering.** Cover:
- pending set → reset, pending reset → set, and reset → set → reset;
- equal displayed default values;
- a successful and a failed predecessor, each with the latest in both directions;
- discard → new same-field work.

The latest set or reset's own completion governs the result and the host release. An old set or reset success cannot make a newer one appear saved. The hook's `reset()` settles superseded queued sets with a `conflict` refusal (`usePrefAsync.ts:284`). Those superseded results must not surface as failures of the latest intent.

**Uncertainty.**
- When a remove succeeds but readback is denied, Retry verifies absence with exactly one total remove and a single reconciliation.
- A conflict preserves the external bytes and the reset draft.
- An unrelated field can still save while reset recovery is blocked.
- Never clear the whole batch because one remove succeeded or because the handler returned.

**Status.** "Defaults restored." appears only when all 8 matching reset operations have completed (verified absence or verified no-op) and no newer contrary edit has superseded them.

**No global wiring.** `resetAllPrefs`, `SettingsFooter`, `confirmAction` and the Appearance reset stay untouched.

## 7. Device continuity and host permission

- **No account machinery.**
  - The 8 keys stay unscoped device keys.
  - For these fields, the pane never reads, writes or acquires any account physical key (`xai:account:v1:*`, `xai:demo:v1:*`), account lifecycle lock, generation marker, tombstone or recovery admission.
  - Prove this with spies on lock names and keys.
  - An unrelated held account lifecycle lock must not delay a device edit or reset.
- **Survival while mounted.**
  - Drafts, reset drafts and operations survive A→B, A→locked, locked→A and same-account epoch/generation changes.
  - An operation held behind a real per-key lock must still finish, or keep its own recovery, after the change.
  - An admitted reset batch continues the same way.
- **Host permission lifecycle.**
  - An epoch change renews the decision token and cancels any old held intent: the route resets, and sign-out resolves `false`.
  - Every old capability then refuses, based on live scope and disposal state, including before rerender. This covers `isCurrent`, `isBlocking`, `exportDraft` and `discardDraft`, plus the old inline export, discard, Retry and reset callbacks.
  - A fresh permission — B, locked, or a return to A — must guard, export and discard the surviving device drafts. These are required positive controls.
  - Never erase device work to revoke an old permission. Never inherit an old decision.
- **Sign-out and forced transitions.**
  - Voluntary sign-out guards current device drafts before identity invalidation.
  - Forced transitions are never blocked and never discard device drafts.
  - There is no private data to dispose, and no Header-style frozen-note exception applies.
- **Unmount.**
  - Unmount removes the guard and the unload listener, and detaches callbacks.
  - It does not undo committed writes or removals.
  - Crash and forced-authentication durability belong to REL-09.

## 8. Sparse memory export

**Format.** The filename is `features-draft.json`. It uses the set/reset envelope, so that a requested removal can never read as a saved default:

```json
{"version":1,"kind":"features-draft","changes":{"device":{"board":{"operation":"set","value":false},"habits":{"operation":"reset"}}}}
```

- Each field appears at most once, as its latest actual unresolved intent:
  - a set as `{"operation":"set","value":<strictly validated boolean>}`;
  - a reset as `{"operation":"reset"}`, with no invented value.
- A pending reset of all 8 contains 8 reset entries. A partially successful batch contains only unresolved entries.
- Never include an account bucket, account ID, physical key or timestamp.
- Never include saved, default or source-only fields.
- There is no empty download.
- This is a recovery file. It is not an import feature and not proof of saving or resetting.

**Behavior.**
- **Memory only.** Export reads captured, permitted drafts and makes zero `getItem`, `setItem` or `removeItem` attempts on any key. This holds while every Storage operation throws, while operations are held, and during a partial reset.
- **Permission rechecks.**
  - Recheck live permission before setup, after URL creation, after append, and immediately before the click.
  - A synchronous epoch change or unmount during Blob creation, URL creation or append cancels the click.
  - A stale same-turn guard export is refused.
  - Fresh locked and fresh B exports are required positive controls.
- **Failure handling.**
  - A Blob, URL, append or click error shows the localized export error and keeps drafts, tokens and the guard.
  - The anchor is removed and the URL revoked on a best-effort basis, including after a late setup failure.
- **No side effects.** Export and Stay never save, reset, discard, retry, or release a held route or sign-out.

**Native disk evidence.** Use actual Chrome downloads, parsed from disk and compared to the whole expected envelope with deep equality.

Required shapes:
1. sparse set, one field;
2. sparse reset, one field left over from a partial reset;
3. mixed set and reset;
4. all 8 sets;
5. **all 8 pending resets** (converted from More's jsdom-only limitation, §15);
6. an export from the departure dialog;
7. a fresh locked export after A→locked;
8. a fresh B export after A→B;
9. an export while one operation is held behind a real lock.

Every export runs under total storage denial, and each must show:
- attempt-level counters, recorded before delegating to Storage, at zero for reads, writes and removes;
- exactly one object URL created, and that same URL revoked;
- the anchor removed;
- afterwards, beforeunload still warning and the guard still blocking. For dialog exports, the dialog also stays open and the location key is unchanged.

Additionally:
- One native setup failure (`createObjectURL` or the click throwing) must meet the same assertions and show the localized error.
- Epoch invalidation at Blob, URL or append time may remain Sol evidence (jsdom with real storage, hook and engine).

## 9. Actual host, keyboard and responsive presentation

**Guard.**
- `featuresPane.render(props)` forwards its props. `FeaturesPane` consumes the optional `registerDepartureGuard`, typed by an additive optional field on `FeaturesPaneProps` (§11).
- A standalone `<FeaturesPane lang>` or `render({lang})` still renders and edits without a guard.
- The guard label is Features/功能 (`settings.features`), never the "Smart Lists" fallback.
- Register whenever the host provides the hook. Block only while actual drafts exist.
- Reuse the production ComposedSettings, coordinator and `settingsDeparture` unchanged.
- Add no router or sign-out state machine, and make no host, coordinator, shell or auth edit.

**Host matrix** (actual composition, full Shell):

| | Scenario | Required behavior |
| --- | --- | --- |
| a | Production sidebar | Trusted, hit-tested activation of a `.settings-sidebar .list-row` for another pane. |
| b | AppRail | AppRail button and programmatic module navigation. |
| c | Back and **guarded Forward** | Compare `{pathname,key,state}` with deep equality for Stay, discard-and-leave and latest-completion release; the history stack stays intact. |
| d | Relative navigation | State and options are replayed exactly. |
| e | Voluntary sign-out | Resolves `false` on Stay; device drafts survive. |
| f | First same-turn intent wins | Route versus route, and route versus sign-out. |
| g | Stay, Escape, export | URL, history, pane and dialog are kept; a fresh intent after Stay prompts again. |
| h | Partial work | With two failing fields, repairing one keeps holding; a newer edit or hidden/offscreen recovery also keeps holding. |
| i | **Same-field ordering** | See the steps below. |
| j | Discard all and leave | Releases once with zero writes and zero removes. |
| k | Epoch change | Cancels the old intent while fresh device protection remains. |
| l | Unmount | Removes the guard and the unload listener. |
| m | **Reset batch release** | See the steps below. |
| n | Held target turned off | See the steps below. |

Same-field ordering (row i):
1. Let the predecessor complete while the latest operation is genuinely held behind the real `prefMutationLockName("xai_pref_features_<id>")` lock.
2. At that point, assert location, dialog and zero history mutations.
3. Make the latest fail through an injected `setItem` fault, not a conflict.
4. Retry the latest. It must release **exactly once**:
   - one router location commit to the intended entry, with no duplicate commit;
   - no `pushState`/`replaceState` beyond that commit, and none for a POP release;
   - the dialog closed.

Reset batch release (row m):
1. Run Reset to defaults with `removeItem` faults on two keys.
2. Hold a departure: a Back departure in one run, an AppRail departure in a second run.
3. Retry the first faulted field successfully: the departure keeps holding.
4. Retry the second successfully: the departure releases **exactly once**, with the same commit and history assertions as row i and zero runtime errors.

Held target turned off (row n):
1. Hold an AppRail departure to Boards.
2. Turn Boards off and let the write commit.
3. Once all work is clean, the intent releases exactly once to the original target, with no retargeting.
4. That route renders `DisabledFeatureFallback`, with no runtime error.

**Beforeunload.**
- Warn synchronously only when actual current set or reset drafts exist, with zero storage attempts in the handler.
- Do not warn in a clean or source-only state.
- This is a cancelable warning, not crash durability.

**Responsive presentation.** EN and ZH, at 375, 414, 768, 1024 and 1440.

Controls to check:
- all 8 switches and Reset to defaults;
- in the all-8-unresolved state: 8 recovery blocks (16 Retry/Discard buttons), Export and Discard all;
- a partial-reset state;
- a source-only Reload;
- the three dialog actions.

For each one:
- After scrolling it into view, a center hit-test lands on the control.
- It is not covered.
- Pane controls are contained horizontally within `.settings-detail`.
- Dialog actions are judged against the dialog box and the viewport. This carries forward the accepted Sticky ruling that the dialog is a viewport-fixed host overlay.
- Neither the document nor the detail scrolls horizontally.

Sizing and CSS:
- Recovery, reset and dialog targets are at least 44×44 at every width.
- Existing switch and card geometry may not shrink.
- New CSS adds selectors only under `.features-pane` and `.features-recovery-*`.
- Existing `.features-grid`, `.feat-*` and `.disabled-feature-fallback*` rules stay byte-unchanged, as do the shell's `.toggle` and `.pane-footer`.
- Any containment fix for the 280 px grid minimum must be a `.features-pane`-scoped override.

Screenshots, all reviewed manually:
- ten all-8-unresolved screenshots (EN/ZH × five widths);
- the partial-reset state at 375 (EN/ZH);
- the 375 dialog (EN/ZH).

**Keyboard.**
- Trusted Tab reaches every control in DOM order, with visible focus.
- Space and Enter each activate a switch exactly once: one operation, no double firing, no page scroll on Space. They open the reset confirmation exactly once.
- `aria-checked` reflects the displayed draft.
- After a keyboard per-field Discard or Reload, focus lands on that field's switch.
- After keyboard Discard all, focus stays inside `.features-pane`, never on `<body>`. This is converted from the Sticky follow-up, §15.
- In the dialog:
  - focus enters the dialog;
  - Tab and Shift+Tab wrap within it;
  - Escape means Stay;
  - focus then returns to the prior element.

## 10. Downstream consistency and cross-module isolation

**Nothing changes in:**
- default, codec, owner, schema or key;
- dual writes, aliases or migrations;
- reader code: `useFeaturePrefs`, `withDisabledFallback`, `filterModulesByFeaturePrefs`, `DisabledFeatureFallback`, the App rail filter, AppRail and CmdK.

Readers must reflect **committed bytes only**.

Required evidence:
1. **Exact bytes.** Exact physical bytes for all 16 values (8 × `true`/`false`), at both the Sol layer and natively.
2. **Rail truth** (same tab, no reload).
   - A committed "off" removes the rail entry.
   - A pending, held or failed toggle leaves the rail unchanged.
   - A successful Retry updates it.
   - A full reset restores all 8.
   - A partial reset restores only the keys whose reset succeeded.
3. **Route truth.**
   - A deep link to a module that is off renders `DisabledFeatureFallback`.
   - After an "on" commit, the original module renders.
4. **Search truth.** At palette open, CmdK results include or exclude the toggleable modules according to committed bytes only.
5. **Cross-module isolation.**
   - During and after every Features operation — toggle, Retry, Discard, Discard all, Reload, full reset and partial reset — the product dispatches zero `StorageEvent`s with `key === null`. Count this with an instrumented `window.dispatchEvent`.
   - Through all of those operations, these displayed values and their bytes are unchanged:
     - the App's accent hue, background tone and rail position (computed styles);
     - the AppRail DOM order;
     - DesktopPet id and position.
   - An AppRail drag-reorder after a Features reset persists an order derived from the **stored** custom order.
6. **Unrelated keys.** A full reset leaves the bytes of every localStorage key other than the 8 unchanged, shown by a snapshot comparison.
7. **Two documents.**
   - The second document's rail, route and CmdK reflect the first document's committed toggle and reset, through native storage events.
   - A failed draft for the same key in the second document becomes a preserved conflict.
8. **Protected paths unchanged.** `git diff f359be6 <fixed>` is empty for:
   - `packages/plugin-web-storage`, `packages/plugin-web-settings-shell`, `packages/xai-web-shell`, `packages/xai-web-pet`, `packages/xai-web-cmdk`, `packages/plugin-web-tokens`, `packages/xai-web-settings-appearance` and `packages/plugin-web-settings-rest`;
   - `packages/xai-web-dashboard-grid` and `packages/xai-web-dashboard-widgets`;
   - `apps`;
   - `package.json` and `pnpm-lock.yaml`.
9. **Search repeated at the fixed SHA.** Repeat §2's reader and writer search; new hits may appear only in §11 files. In addition:
   - the features package's product source contains zero `new StorageEvent`/`dispatchEvent(`;
   - `FeaturesPane.tsx` and the new helpers contain zero `usePref(`, `setPref(`, `removePref(` and `localStorage`.
10. **Unchanged reader tests pass from the fixed archive and from `f359be6`** (G1):
    - features package: `useFeaturePrefs`, `withDisabledFallback`, `filterModulesByFeaturePrefs`, `DisabledFeatureFallback` and `featuresPaneEntry`;
    - `apps/web`: `railFeatureFilter`, `settingsPaneComposition.test.tsx`, `settingsPaneComposition.appearance.test.ts`, `settingsPaneComposition.rest.test.ts` and `cmdkIntegration.test.tsx`.
11. **Storage and lifecycle.** Storage check-types passes, and the unchanged lifecycle declaration still classifies the 8 keys as device-recovery, retain and retain-on-device.

## 11. Protected surface and Terra's files

**Terra may edit only:**
- `packages/xai-web-settings-features-panel/src/FeaturesPane.tsx`.
- `src/internal/featuresPane.tsx`, only to forward render props.
- `src/types.ts`, only to add `readonly registerDepartureGuard?: PaneDepartureGuardRegistration` to `FeaturesPaneProps`, with the type imported from `@repo/plugin-web-settings-shell`.
- At most two new Features-local helpers under `src/internal/`: the operation/recovery model, and the EN/ZH recovery copy.
- Additive selectors in `src/styles.css`, scoped as §9 requires.
- `src/__tests__/FeaturesPane.test.tsx`, plus new Features-local test files under `src/__tests__/`, including a local Web Lock fixture.
- The Features sections of the package's `docs/api.md` and `docs/test.md`. The guard wording must state that it registers whenever the host provides the hook and blocks only while drafts exist.

The fixed-product diff must list only these files.

**Implementation expectations.**
- Use one coherent local operation model.
- Do not extract a generic recovery framework, and do not refactor an accepted pane.
- AC-PANE-1–6 keep their business assertions:
  - AC-PANE-3 and AC-PANE-6 may only install the Web Lock fixture and await real async completion;
  - AC-PANE-6 keeps the `window.confirm` stub and its "Reset to defaults" role/name locator.
- These stay unchanged and must pass:
  - `featuresPaneEntry` (AC-REG-1–3) and the other four reader tests;
  - both `apps/web` composition tests;
  - `railFeatureFilter` and `cmdkIntegration`.

**Protected.**
- In the features package:
  - `src/index.ts`, `featureIds.ts`, `useFeaturePrefs.ts`, `filterModulesByFeaturePrefs.ts`, `withDisabledFallback.tsx`, `DisabledFeatureFallback.tsx` and `internal/FeatureThumb.tsx`;
  - `package.json`, configs, `docs/design.md`, `docs/dev_log.md` and `docs/verify-report.md`.
- The shared storage hook, engine, registry, ownership, codec and lifecycle code, including legacy `usePref`.
- The Settings shell, including `Toggle`, `SectionBlock`, `SettingsFooter`, `confirmAction`, `resetAllPrefs` and the types.
- The `apps/web` host: `App.tsx`, routes, `shellRegistrations`, coordinator, `settingsDeparture`, composition and auth.
- The Web shell (AppRail, Topbar, Shell), pet, CmdK, tokens, Appearance and `apps/desktop`.
- The accepted Date & Time, Notifications, More, Sticky, Smart Lists, Collaborate, Pomodoro and Header callers.
- Reviewer evidence, including every frozen F1 runner, fixture, prelude and log; the ledgers; and the control plane.

**Shared defects.** A correct new shared defect requires all of the following before any product repair:
- a frozen before oracle;
- an Astra-role impact review;
- explicitly revised ownership;
- affected accepted-caller reruns (precedent: F1, `0ba68d7` → `f359be6` → `3ea0310`/`f3a3c82`).

## 12. Before-failure oracles (Sol and parent, before Terra)

**Runner requirements.**
- Use an immutable `git archive f359be6` behind a lockfile-hash gate.
- Copy the oracle into the archive.
- Record both the requested and the resolved SHA.
- Refuse to overwrite an existing log.
- Preserve nonzero exit codes.
- Freeze the oracle files and their SHA-256s with the logs.

**Sol jsdom modes** (real storage, hook and engine):

| Mode | Coverage |
| --- | --- |
| `bytes` | 16 values, absent defaults, zero-write mount, lifecycle classification |
| `fields` | Per-field failure and Retry, source truth, Saved truth, targeted recovery |
| `reset` | All of §6 |
| `queues` | §5 items 4–6 and the §6 orderings |
| `continuity-export` | §7, and §8 apart from the native disk shapes |
| `downstream` | §10 items 2–6 in a production `App` mount: only the auth-session hook is substituted, with no network client; the event bus, storage, shell, pet, CmdK and features modules are real |
| `original` | The archive's own `FeaturesPane.test.tsx`, AC-PANE-1–6 |

- Install a Web Lock fixture with exclusive semantics.
  - A pass-through stub cannot prove a held lock.
  - An accidental `lock-unavailable` result is a fixture failure, except in the cases that test lock unavailability on purpose.
- Use an attempt-counting Storage injector that is proven to fire.
- Stub `window.confirm` with a recorder.
- Drive real `accountScope` transitions.
- Select controls only through stable selectors:
  - `[data-feature-id="<id>"] [role="switch"]`;
  - the "Reset to defaults"/"恢复默认" button, by role and name;
  - recovery UI, by the roles and names in §5.

**Parent host baseline.**
- Use the actual ComposedSettings with the full Shell (pattern: `../web-sticky-recovery-independent/`).
- Cover each field's failed toggle with its route outcome and its sign-out outcome, a failed reset with its route outcome, and one clean positive control.

**Native before** (parent, Chrome, production `App` composition):
- H5 and H6, including the AppRail drag after a reset.
- H10: Features pane overflow at 375 px, EN and ZH.
- Only the auth-session context may be synthetic. Bundle provenance must show that every reader module comes from the archive.

**Features F1 before.**
- A new runner file runs a `selfcheck` mode, which must be harness-valid, and a `features` mode.
- The `features` mode records the before state: no departure is held after a failed toggle. That is H8's correct before state, not an F1 signature.

**Validity and positive controls.**
- Every case asserts its preconditions before its business assertion: control found, seeded bytes present, fault armed and observed.
- A failed precondition is a fixture or selector error. It is never counted as a product failure.
- These must pass at `f359be6`:
  - zero-write mount;
  - absent defaults;
  - normal persistence and exact bytes for all 16 values;
  - a declined reset confirmation makes zero attempts;
  - a working reset removes all 8 keys;
  - the rail filter updates after a successful toggle;
  - clean navigation and clean sign-out;
  - AC-PANE-1–6;
  - the §10 item 10 reader tests;
  - the lifecycle classification.
- No case may use private calls to reach unreachable invalid values.

**Hypotheses to confirm or refute.** None of these is an established defect.

| ID | Hypothesis |
| --- | --- |
| H1 | A failed `setItem` for any toggle loses the latest choice: the switch snaps back with no feedback, Retry or export, while the old bytes remain. |
| H2 | A throwing read, or malformed bytes (`1`, `TRUE`, `yes`, an empty string, `"true"` with quotes), renders "on" with no source alert or Reload. |
| H3 | Legacy writes ignore a held per-key Web Lock, so the physical bytes change immediately. |
| H4 | Two same-turn activations both invert the same rendered value, so the final state is the opposite of the latest intent. |
| H5 | With a `removeItem` fault on one key, Reset to defaults still dispatches its event. The pane and rail show that module "on" while its bytes stay `false`, with no failure feedback or Retry. After a reload the module is off again. |
| H6 | Reset to defaults makes every mounted legacy `usePref` show its default: App accent hue, background tone and rail position, AppRail order, and DesktopPet id and position change visibly while their bytes are unchanged. A subsequent AppRail drag persists a default-derived order, overwriting the stored custom order. |
| H7 | "Save & apply" shows "Saved" after a failed toggle, and the reset confirmation claims theme and layout are cleared. |
| H8 | With unsaved failed work, sidebar, AppRail, Back, Forward and relative navigation all leave Features; sign-out resolves `true`; beforeunload does not warn. |
| H9 | No Retry, Discard, Reload, export, truthful Saved or Defaults-restored control exists. |
| H10 | At 375 px the 280 px grid minimum overflows `.settings-detail` horizontally. |

**Freezing and reruns.**
- Freeze oracle files, before logs and SHA-256 hashes before Terra starts.
- If a hypothesis is refuted, record it as PASS. It is not a defect, but its requirement still binds the fixed product.
- Later fixture corrections use a diagnostic suffix, rerun against both archives, and never weaken an assertion.
- Correct FAILs must be preserved through unchanged fixed reruns.

## 13. Gates

The E-numbers refer to §14. A row is complete only when every listed item exists.

| Gate | Required complete evidence | Checklist items |
| --- | --- | --- |
| 1. All 8 toggles | <ul><li>All 16 values, with exact bytes, default, codec and unscoped key.</li><li>Absent zero-write mount.</li><li>Invalid and unavailable source per field, with Reload only.</li><li>Latest-choice failure and Retry per field.</li><li>A value equal to the default is stored.</li><li>Truthful Saved, with no Save footer.</li><li>AC-PANE-1–6 preserved.</li><li>Partial and targeted recovery: several and all 8 unresolved; a conflict plus an unrelated quota failure; both set/reset failure directions; targeted Discard with zero writes and zero sibling reads; Discard all; late completions ignored.</li></ul> | E1, E2, E6, E7, E9 |
| 2. Reset to defaults | <ul><li>Normative confirmation; declining makes zero attempts.</li><li>All 8 verified absences; an already-absent key is a no-op; never writes `true`.</li><li>Per-field remove refusal ×8, with a reset draft and recovery.</li><li>Partial reset with Retry of only the unresolved fields; no duplicate removes while pending.</li><li>Invalid or unavailable source refusal keeps the intent, with no purge.</li><li>Uncertainty resolved with one remove; conflict preserved.</li><li>Truthful "Defaults restored."</li><li>Unrelated keys unchanged.</li></ul> | E1, E2, E6, E7, E10 |
| 3. Same-field and set/reset attribution | <ul><li>Shown for one switch fully and for set/reset orderings on two fields.</li><li>Predecessor succeeds while the latest fails; predecessor fails while the latest is queued.</li><li>Repeated failed predecessor; pending Retry is inert.</li><li>Same-turn double activation.</li><li>Equal-value successor.</li><li>Uncertainty with one write.</li><li>External conflict, including restoration of the original bytes and external removal.</li><li>set→reset, reset→set and reset→set→reset.</li><li>New work after a discard survives.</li></ul> | E1, E2, E7, E9 |
| 4. Device continuity and export | <ul><li>A→B→locked→A and a same-account epoch change, with a real held device-key lock, including during a reset batch.</li><li>No account key, lock or marker touched; an unrelated held account lock does not serialize.</li><li>Old capabilities refuse both before and after rerender; fresh B and locked positive controls.</li><li>Memory-only export under total denial, with attempt counters; setup and click failure; epoch and unmount cancel.</li><li>Exact native disk JSON for all nine §8 shapes, with warning and guard asserted after each.</li></ul> | E1, E2, E7, E11 |
| 5. Production host/native | <ul><li>The complete §9 matrix rows a–n in the actual composition, with history counters and runtime-error gates.</li><li>Trusted input for all 16 values.</li><li>New-document reload with zero mount writes.</li><li>A native held lock and native uncertainty; a second-document conflict.</li><li>EN/ZH at five widths: every-control hit-test, 44 px targets, CSS-scope audit, manual screenshots.</li><li>Keyboard, including the focus targets.</li></ul> | E3, E4, E8, E9, E12, E14, E15 |
| 6. Downstream readers and cross-module isolation | <ul><li>§10 items 1–11.</li><li>H5 and H6 before evidence.</li><li>The before byte, default and reader-test controls PASS at `f359be6`.</li></ul> | E2, E4, E7, E13, E18, E19, E20, E21, E22 |
| 7. F1 regression | <ul><li>The 10 frozen F1 invocations PASS at the fixed SHA.</li><li>Features F1 mode: before at `f359be6` (not held), and fixed r1, d1, r2 and rb PASS, each with exactly one live `proceed()`, zero non-live blocker calls and zero runtime errors.</li></ul> | E5, E16, E17 |
| 8. Final regression | Independent reruns from the fixed archive (commands as in `../web-sticky-recovery-final/review-final-regressions-f359be6.md` plus the Sticky runners): <ul><li>Features package test, typecheck and lint.</li><li>Web package test, check-types and lint.</li><li>Storage check-types.</li><li>Settings-shell package test.</li><li>Settings-rest package test.</li><li>Accepted More: Sol 79 plus original 15 plus host 11.</li><li>Accepted Sticky: Sol 109 (bytes 13, fields 47, queues 27, continuity-export 22) plus original 10 plus host 28.</li><li>Notifications: Sol 41, Astra boundaries 24, Astra host 15 and parent host 12.</li><li>Date & Time 7.</li></ul> Any selector outside `.features-pane`/`.features-recovery-*` needs the affected callers' native visual modes. Any shared delta needs impacted engine, hook and caller reruns plus fresh acceptance. | E6, E19–E25 |

**Acceptance condition.**
- Every row must reconcile four things: the source, a correct before failure, fixed independent behavior, and the actual user surface.
- Every §14 item must be cited with its artifact path and SHA-256. A missing item blocks acceptance.
- The caller cannot be closed by any of the following:
  - converting the toggles without Reset to defaults;
  - keeping the shared footer's unconditional "Saved";
  - keeping the `key: null` event;
  - shipping recovery without host, export and cross-module evidence.

## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with SHA-256 receipt; lockfile gate recorded | Sol | `f359be6` | 1–4, 6 |
| E2 | Sol before logs for the seven §12 modes. They give per-case outcomes for every hypothesis Sol exercises (at least H1–H7 and H9; H5 and H6 again natively in E4; H8 in E3; H10 in E4), zero precondition failures, and every positive control PASS | Sol | `f359be6` | 1–4, 6 |
| E3 | Parent jsdom host before log: per-field failed toggle with route and sign-out outcome, failed reset with route outcome, clean control | Parent | `f359be6` | 5 |
| E4 | Native before, production `App` composition: H5, H6 (computed styles, AppRail DOM order, pet position, bytes) and the AppRail drag overwrite; H10 at 375 px in EN and ZH; provenance | Parent | `f359be6` | 5, 6 |
| E5 | New Features F1 runner and host fixture (frozen prelude reused read-only, hash-checked); `selfcheck` harness-valid; `features` before log (not held) | Parent | `f359be6` | 7 |
| E6 | Terra fixed SHA; `git diff --name-only f359be6 <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 files; Terra's package run | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes, all modes PASS, zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS | Parent | fixed | 5 |
| E9 | Native controls: 16 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only states; native held lock; uncertainty with one write; second-document conflict | Parent | fixed | 1, 3, 5 |
| E10 | Native reset: decline makes zero attempts; accept gives 8 absences; one-key and two-key faults; uncertainty with one remove; conflict; truthful "Defaults restored."; unrelated-key snapshot unchanged | Parent | fixed | 2 |
| E11 | Native export: the nine §8 disk shapes under total denial (counters, URL, anchor, warning, guard) plus one setup failure | Parent | fixed | 4 |
| E12 | Native host matrix rows a–n with history counters and runtime-error gates | Parent | fixed | 5 |
| E13 | Native downstream in the production `App` composition: §10 items 2–7, including zero `key: null` dispatches and two-document propagation | Parent | fixed | 6 |
| E14 | EN/ZH five-width visual: hit-tests, 44×44, containment, overflow, a selector audit listing every added selector, and the manually reviewed screenshots of §9 | Parent | fixed | 5, 8 |
| E15 | Keyboard: Tab order, Space/Enter once, reset confirmation, dialog trap, Escape and focus return, focus targets after Discard, Reload and Discard all | Parent | fixed | 5 |
| E16 | F1 regression: `verify-f1.mjs` sticky, more and collaborate; `verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro; `verify-f1-race.mjs` race. All 10 PASS with unchanged runner hashes | Parent or final verifier | fixed | 7 |
| E17 | Features F1 mode fixed log PASS: r1 Retry-released Back, d1 discard control, r2 repeat, rb reset-batch-released Back | Parent or final verifier | fixed | 7 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `f359be6` | Final verifier | `f359be6` and fixed | 6 |
| E19 | §10 item 8: protected-path empty diff | Final verifier | `f359be6..fixed` | 6, 8 |
| E20 | Storage check-types plus the Sol lifecycle assertion for the 8 keys | Sol and final verifier | fixed | 6, 8 |
| E21 | Features package full test (including the §10 item 10 reader tests), typecheck and lint from the fixed archive, plus the reader tests at `f359be6` as a before control | Final verifier | fixed and `f359be6` | 6, 8 |
| E22 | Web package test (including `railFeatureFilter`, the three composition tests, `cmdkIntegration` and `departureCoordinator.blocker`), check-types and lint | Final verifier | fixed | 6, 8 |
| E23 | Settings-shell package test (`SettingsFooter` unchanged) | Final verifier | fixed | 8 |
| E24 | Accepted-caller suites listed in §13 row 8, with counts compared to their accepted receipts | Final verifier | fixed | 8 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict | Final verifier | — | 8 |

**Rules.**
- E1–E5 must be committed before Terra starts.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.

## 15. Limitations converted

| Retained limitation (source) | Features treatment |
| --- | --- |
| Keyboard Discard or Discard all leaves focus on `<body>` (Sticky acceptance, follow-up 1) | **Gate.** Focus targets in §9 (E15). |
| A §10 item had no scheduled runner (Sticky G1) | **Gate.** The §14 checklist, with an enumerated receipt (E25); acceptance blocks on any missing ID. |
| A Retry- or completion-released POP was never run under a runtime-error gate for the accepted callers (F1) | **Gate.** Features F1 mode including the reset-batch release (E5, E17), plus the 10 frozen invocations (E16). |
| Affected callers' visual and unlisted modes were not rerun after a shared change (Sticky follow-up 6) | **Rule.** No coordinator, shell or host change is permitted. Stylesheet additions are limited to scoped selectors proven by audit (E14); anything else triggers the affected callers' native visual reruns. |
| `docs/api.md` guard-timing wording (Sticky follow-up 9) | **Requirement** (§11). |
| The all15 pending-reset envelope was asserted only in jsdom (More) | **Gate.** All-8 pending-reset native disk JSON (§8 shape 5, E11). |
| Host compositions lacked App-level readers (Sticky native host mounted Shell plus ComposedSettings only) | **Gate.** Production `App` composition (E4, E13; Sol `downstream`). |
| Export counters counted only successes; no warning check after export; Forward only unguarded; reachability inferred from overflow; setup failure proved only in jsdom (More) | **Kept as gates**, as in Sticky §14. |
| Retained exclusions: headless Chrome and synthetic accounts; not Tauri; synthetic beforeunload; sign-out through the direct preflight; development build without StrictMode; reused dependency trees; script clicks in race windows | Retained. The lockfile gate is a consistency check only. |

## 16. Exclusions

**Not part of this caller:**
- SET-03 product work:
  - a catalog driven by module registration;
  - what happens to Time Tracker, Bookkeeping and Metrics;
  - which modules may be disabled;
  - the landing page when Dashboard is off;
  - CmdK refresh while it is open (SHELL-03);
  - AppRail pruning of disabled modules.
- The Appearance caller, `App.tsx` root writers and Topbar.
- Changes to `Toggle`, `SettingsFooter` or `resetAllPrefs` (SET-01, REL-10).
- Accessible-name copy of the switches (UX-05).
- Repairing malformed stored bytes.
- Global reset, migration, deletion or data-export changes.
- D2.
- Tauri and native window capability.
- Production authentication and live logout.
- Crash and forced-authentication durability (REL-09).

**Not closed by this caller:** SET-03, REL-05, REL-07, REL-09, REL-10, UX-04, UX-05, SHELL-02, SHELL-03, QA-01, QA-03, QA-04, QA-09, D2/REL/AI, or any other 312 item.

**Not authorized:** deployment, release, branch promotion or Web→Desktop sync. Any later Desktop flow needs the ADR-0013 D3 gate.

**Recommended evidence directories:** `docs/reviews/web-features-recovery-{sol,independent,terra,native,f1,final,acceptance}/`.
