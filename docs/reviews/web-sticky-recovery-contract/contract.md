# Complete caller: Settings Sticky Note, all5 preferences

Contract designer (Astra "complex design" role, executed by an independent Claude Opus 5.5 instance in an isolated detached worktree), module `web`, 2026-10-03, control-plane item `CP-STICKY-01`.

**Fixed product and source equality.**
- Fixed product: `20235269749dad514833d76c27b958f694d0e4e9` (`2023526`). The contract was authored at docs HEAD `1ddae30`, whose `apps`/`packages`/`package.json`/`pnpm-lock.yaml` tree equals `2023526`.
- From `afbfb24` to `2023526`, `git diff` is empty for:
  - `stickyPane.tsx`, `StickyColorPalette.tsx` and `stickyPane.test.tsx`;
  - Settings-rest `types.ts` and `localI18n.ts`;
  - all of `plugin-web-storage` and `plugin-web-settings-shell`;
  - `apps/web/src/routes`;
  - `StickyComposer.tsx`.
- The only Settings-rest deltas in that range are More's pane and test, plus one additive `.more-*` stylesheet hunk (+34/−0).

**Status.** This specifies the next ordered implementation unit after the accepted More caller (`27adb10`). It does not authorize implementation, accepts nothing, changes no formal count and closes no 312 item.

**Authority.**
- Scheduling:
  - [next-more-contract.md](../web-notifications-recovery-astra/next-more-contract.md) line 35 orders Notifications → More15 → Sticky5.
  - [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md) line 15 requires Sticky all5 as a whole-pane caller, including hidden/conditional inputs, recovery, export, source truth and actual host coverage. Line 20 adds that Sticky readers depend on canonical formats.
- Inventory: [refresh-afbfb24.md](../web-d2-pref-binding-inventory/refresh-afbfb24.md) and `bindings-afbfb24.json`. Lines 366–410 hold the five Sticky rows; lines 483–491 hold the StickyComposer row (see D1).
- Precedents:
  - the More contract above;
  - the More acceptance [acceptance-7b216a3.md](../web-more-recovery-acceptance/acceptance-7b216a3.md);
  - the device-only [Date & Time contract](../web-date-time-recovery-contract/contract.md), which is the closest structural analogue.

## 1. Roles, order and risk

| Role | Executor | Boundary |
| --- | --- | --- |
| Parent / controller | Claude controller | Scheduling, contract check, actual composed-host baseline and native/browser verification, final-regression receipt, ledgers. |
| Sol | New independent Opus-class instance | Freezes business oracles against an immutable `2023526` archive before any implementation, then reruns them unchanged on the fixed product. |
| Terra | Implementation instance; Opus-class recommended at this risk | The complete caller, inside the §11 files only. Starts after the before baseline is frozen and the controller authorizes it. |
| Final acceptance | New instance, distinct from this author, Terra and Sol | Reconciles every §13 row: source → correct before failure → fixed independent result → actual surface. |

**Exclusions by role.** Luna gets no task: persistence, async queue, host and acceptance are its forbidden zones, and no bounded lookup may own a gate. Spark is never assigned.

**Order.**
1. Contract.
2. Controller check.
3. Frozen Sol oracles and parent-host before oracles.
4. Terra implementation.
5. Sol fixed reruns.
6. Parent host/native verification.
7. Final regression.
8. Independent acceptance.

Do not run another caller concurrently.

**Risk: high (confirmed).**
- **What device-only ownership removes**, compared with More:
  - account-scoped physical keys;
  - the account lifecycle lock and private-owner admission;
  - committed-marker, tombstone and recovery admission;
  - the private-draft privacy/disposal boundary;
  - the mixed-owner reset batch.
- **What still makes this unit high risk:**
  - asynchronous same-field queue attribution;
  - uncertainty and conflict semantics on five keys;
  - REL-05-class loss of the user's latest choice behind a missing or false Saved state;
  - host departure arbitration across route, history and sign-out;
  - memory-only export under total storage denial;
  - native evidence.
- **Account-lifecycle scope that remains:**
  - device continuity of drafts and held operations across A→B, A→locked, locked→A and same-account epoch/generation changes while mounted;
  - proof that no account key, lock or marker is touched;
  - host-decision invalidation, with fresh device-only permission;
  - voluntary sign-out guarding;
  - forced transitions that neither block nor discard device work.

## 2. Exact ownership inventory

**The unit.** `packages/plugin-web-settings-rest/src/panes/stickyPane.tsx` with `src/internal/StickyColorPalette.tsx`: **all five direct legacy `usePref` bindings (`stickyPane.tsx:39–57`), every edit handler and the actual Settings departure seam**.

**Naming and sources.**
- The field identifier is the key suffix. The exact physical key is `xai_pref_sticky_` + field; for a device key the physical key equals the logical key (`accountScope.ts:66–67`).
- Ownership comes from `accountOwnership.ts:99–103`.
- Defaults and codecs come from `registry.ts:863–906`. All five are schemaVersion 1, category `pref`. The registry's `owner` field is package metadata, not account scope.
- Domains come from `src/types.ts:33–52` and the pane.

| Field / existing control | Strict accepted domain | Default / codec / exact bytes | Owner / physical key |
| --- | --- | --- | --- |
| `color` / Default Color palette: 13 `<button aria-pressed data-color-id>` swatches (`StickyColorPalette.tsx:18–22, 46–55`) | `sun`, `peach`, `coral`, `sky`, `indigo`, `lilac`, `mint`, `white`, `silver`, `graphite`, `navy`, `midnight`, `random` (`random` is a stored sentinel string) | `sun` / string; raw id, no JSON quotes | device / `xai_pref_sticky_color` |
| `font` / Font Size native `<select>`, `aria-label` (`stickyPane.tsx:70–82`) | `small`, `normal`, `large`, `xl` | `large` / string | device / `xai_pref_sticky_font` |
| `pin_default` / Pin by Default switch (`:85–91`) | boolean | `true` / boolean; exactly `true` or `false` | device / `xai_pref_sticky_pin_default` |
| `restore_size` / Restore Default Size switch with description (`:92–98`) | boolean | `false` / boolean | device / `xai_pref_sticky_restore_size` |
| `grid_spacing` / Default Grid Spacing: 4 `<button aria-pressed data-spacing-id>` cards (`:101–121`; options `:28–33`) | `none`, `normal`, `large`, `xl` | `normal` / string | device / `xai_pref_sticky_grid_spacing` |

**Domain enforcement is caller-only.**
- For these keys, `validateRegisteredPrefValue` checks only the primitive type (`prefMutation.ts:42–47`). Only `xai_pref_collab_default_share` has a closed domain.
- The string codec decodes any string (`codec.ts:44–47`).
- Strict domains must therefore come from the caller's `validate` option, which `usePrefAutosaveAsync` composes with the codec boundary (`usePrefAutosaveAsync.ts:37–58`).
- Do not add domains to the registry, codec or engine.

**Hidden or conditional inputs: none.**
- No control renders conditionally.
- The 13 swatches are sub-controls of one field, and so are the 4 spacing cards.
- The font select is the only control that submits a DOM-provided value (`stickyPane.tsx:74`). Switches, swatches and cards submit closure-bound values.
- `sticky.learnMore` exists (`localI18n.ts:312`) but is not rendered. Do not add it.

**Readers and writers outside the pane.**
- No production code outside the pane reads or writes the five keys (D1).
- Table-driven lifecycle code treats them as device data (`lifecycleDeclaration.ts:30–32`):
  - export scope `device-recovery`; the device-recovery export copies raw bytes (`dataExport.ts:52–54, 88`);
  - `retain` on account deletion;
  - `retain-on-device` in migration.
- The exported `resetAllPrefs()` (`plugin-web-settings-shell/src/internal/resetAllPrefs.ts:29–45`) would remove all five. However, both production `SettingsFooter` mounts pass `onReset` overrides that touch no Sticky key: `xai-web-settings-appearance/src/AppearancePane.tsx:170–183, 419–423` and `xai-web-settings-features-panel/src/FeaturesPane.tsx:41–45, 101–118`.

**Preserve:**
- pane id `sticky`, icon `pin` and i18nKey `settings.sticky` (`stickyPane.tsx:126–133`);
- composition identity (`apps/web/src/routes/modules/settingsPaneComposition.ts:59`, asserted at `apps/web/src/__tests__/settingsPaneComposition.rest.test.ts:48`);
- the locale title Sticky Note/便签 (`plugin-web-tokens/src/i18n.ts:94, 411`);
- the title, description, section order, option order and all labels;
- the swatches' order, `data-color-id`, CSS-variable backgrounds and conic `random` swatch;
- `data-spacing-id`;
- no hex literals in TS/TSX (NH1);
- immediate autosave with no Save footer.

## 3. As-is behavior at `2023526`

These are facts only. Suspected defects appear solely as hypotheses in §12.

1. **Result is discarded.** Each binding is cast to `readonly [T, (v: T) => void, unknown]` (`stickyPane.tsx:41, 45, 49, 53, 57`). This discards the legacy setter's boolean result (`usePref.ts:43–47`) and its meta.
2. **Synchronous unlocked writes.**
   - Every edit is a synchronous `setPref` (`usePref.ts:130–150` → `storage.ts:161–227`): compare-before-write, then `localStorage.setItem`. There is no Web Lock, expected baseline or readback.
   - On failure `setPref` returns `false`, and the hook keeps its previous value (`usePref.ts:141–146`).
   - The pane never observes the result.
3. **No source health.**
   - Reads use `getPref`, which returns the registry default when `getItem` throws or decoding fails (`storage.ts:132–155`).
   - A throwing read also maps to absence in `readCurrent` (`usePref.ts:107–115`, `storage.ts:50–52`).
   - No source-health signal reaches the pane.
4. **How each control submits.**
   - The font handler casts `e.target.value` without validation (`stickyPane.tsx:74`).
   - Switches invert the rendered closure: `setPin(!pin)` at `:88` and `setRestore(!restore)` at `:95`.
   - Swatches and cards submit closure ids: `onSelect(id)` (`StickyColorPalette.tsx:51`) and `setSpacing(opt.id)` (`stickyPane.tsx:108`).
5. **No guard or recovery.**
   - `StickyPaneContent` destructures only `lang` (`:35`). `registerDepartureGuard` reaches it through the props spread in `render` (`:130–132`) and the host call (`composedSettingsRegistration.tsx:105`), but it is unused.
   - The content (`:59–123`) has no beforeunload listener, recovery UI, export, Saved/unsaved status or reset.
6. **Native inputs and current presentation.**
   - Swatches are buttons whose accessible names are raw ids, inside a group hard-named "Color palette" (`StickyColorPalette.tsx:38, 52`).
   - Cards are buttons with localized visible labels, inside a localized group (`stickyPane.tsx:102–119`).
   - The switches are the shared `Toggle` (`plugin-web-settings-shell/src/Toggle.tsx:13–22`: `role="switch"`, `aria-checked`).
   - There are no custom key handlers.
   - Swatches are 30×30 px (`styles.css:776–787`). Cards have a 60 px minimum width with 10 px padding (`:804–815`).
   - No Sticky recovery selectors exist.
7. **Existing tests.**
   - ST1–ST10 (`stickyPane.test.tsx:10–88`) cover rendering, swatch count and backgrounds, `random`, no hex, ZH labels and pane identity.
   - They cover color and spacing persistence through synchronous `getPref` (`:58`, `:74`).
   - Nothing covers failure, recovery, source health, font/pin/restore persistence, the host, export or the keyboard.
8. **Accepted async interface to reuse.**
   - `usePrefAutosaveAsync(key, { validate })` returns `{ value, edit, retry, reset, meta }` (`usePrefAutosaveAsync.ts:85–93`).
   - Device bindings keep the identity `"device"` across account changes (`usePrefAsync.ts:98`).
   - Reads classify sources as absent, valid, invalid or unavailable (`:61–68`).
   - Same-field requests run one at a time, and queued absolute sets coalesce (`:169–243`; coalescing at `:235`).
   - Invalid values are refused before enqueue (`:245–260`).
   - A failed request blocks the queue and keeps its reconcile token (`:195–200`; retry `:262–279`).
   - `meta.reload` disposes the controller and rereads (`:291–300`).
   - The engine:
     - refuses to mutate invalid or unavailable sources (`prefMutation.ts:198`);
     - reports expected-baseline conflicts (`:200–201, 225–226`);
     - issues readback-uncertain tokens (`:211`);
     - holds the exclusive per-key lock `prefMutationLockName(physicalKey)` (`:33–35, 153`);
     - lets device keys skip the account lifecycle lock (`:244`).
   - A missing `navigator.locks` throws (`accountCoordination.ts:11–16`), which becomes `lock-unavailable` (`prefMutation.ts:106`).
9. **The Settings host.**
   - `ComposedSettingsModule` wraps the sidebar and detail in `DepartureCoordinator` (`composedSettingsRegistration.tsx:78–109`). Sidebar rows ignore activation while a departure is pending (`:91, 95`).
   - The coordinator:
     - keeps one token-keyed guard (`departureCoordinator.tsx:64–73`);
     - reserves the first programmatic intent and replays the exact `router.navigate` call (`:112–137`);
     - blocks route and POP changes through `useBlocker` (`:86–91, 152–174`);
     - holds sign-out (`:139–151`);
     - releases once when the current guard stops blocking, and refuses if the guard is no longer current (`:175–183`);
     - provides Stay, export and discard-and-leave (`:185–201`);
     - manages focus, Escape and the Tab trap (`:205–245`).
   - Without a guard label it falls back to "Smart Lists" (`:203`).

## 4. Scoping decisions

**D1 — StickyComposer is not a caller of these keys.**
- The inventory's "related" StickyComposer binding is `usePref("xai_task_cols")`, which has no setter (`StickyComposer.tsx:246`). That is an account-owned Tasks key.
- StickyComposer hard-codes new-note color `sun` (`StickyComposer.tsx:252, 265`).
- Its 10-token `StickyColor` vocabulary (`stickiesStore/types.ts:31–41`; hex map `:48–59`) shares only `sun`, `peach`, `coral`, `sky`, `lilac` and `mint` with the 13-id Settings domain.
- A repository search at `2023526` found no other reader or writer of the five keys: no literal, suffix (`"sticky_color"` and so on), raw-storage, Rust or JSON form. The only other mention is a comment (`stickiesStore/types.ts:24–27`).
- Consequences:
  - This is a single-module caller.
  - Dashboard widgets are protected and covered by regression only.
  - Consuming these defaults at note creation or render, reconciling the two vocabularies, and batch-applying to existing notes all belong to SET-12.

**D2 — No host capability.**
- `pin_default` and `restore_size` have no Web or Tauri consumer.
- The desktop crate only sets generic `always_on_top(false)` window chrome (`apps/desktop/src-tauri/src/commands/window.rs:243`; `lib.rs:149, 186`).
- This unit accepts preference persistence and recovery only. It adds no native call, pin, window or arrange behavior.

**D3 — No reset.** None exists, and none is introduced (§6).

**D4 — Device-only confirmed.** The export has a device bucket only (§8), and the lifecycle scope is narrowed as described in §1.

**D5 — Counts match.**
- There are five bindings, each with one setter call, and no hidden inputs.
- Multi-button inputs are sub-controls of a single field.
- Inventory rows are not defect counts.

**Controller notes (non-blocking).**
- The raw-id swatch names and the English palette group name are recorded but not gated.
  - Localized color names would be new copy.
  - The group may reuse the existing `sticky.defaultColor` label; this is permitted, not required.
- The pane description advertises desktop pinning ("Open as Sticky Note"). That claim stays with SET-12 and the host, and the copy is unchanged here.
- Malformed stored bytes cannot be repaired in the pane, because the shared engine refuses to mutate them (`prefMutation.ts:198`). This is a retained D2/REL limitation.

## 5. All5 edit, source and operation requirements

**Interface.**
- Use the accepted `usePrefAutosaveAsync` edit, retry and meta interface, with the strict runtime validators from §2.
- Preserve the shared queue and coalescing, result semantics, exact baseline and readback, and uncertainty grants.
- Do not add:
  - a second persistence effect;
  - raw set/remove calls or a caller storage preflight;
  - a forced rebase or a manual lock layer;
  - any `meta.reset` call;
  - any change to legacy `usePref`/`setPref` behavior for other callers.

1. **Zero-write mounts.**
   - Valid and absent mounts and rerenders make zero set/remove attempts on all five keys.
   - Absence displays the registry default as a display value only.
   - `random` is stored and displayed as the literal sentinel. It is never resolved to a concrete color and never written at mount.
2. **Source truth.**
   - These sources are invalid or unavailable:
     - out-of-domain strings, for example `purple`, `Sun`, ` sun`, an empty string, `huge` or `tiny`;
     - boolean bytes other than `true` and `false`;
     - a key whose `getItem` throws.
   - Each such field gets its own localized message with **Reload only**. It displays the default and makes no Saved claim. It creates no draft, export entry, departure guard or unload warning.
   - Mount, Reload and Discard never rewrite, purge or normalize those bytes.
   - A valid edit over such a source is actual work. Keep the chosen value as a failed draft with Retry, Discard, export and guard. Never silently overwrite the source.
3. **Malformed DOM input.**
   - Scope: an injected or unknown option value, or an empty value, on the font select.
   - Effect:
     - the prior valid displayed value or draft is retained, with an independent localized field error;
     - zero set/remove attempts are made;
     - no other field's error or draft is cleared;
     - no Saved is shown.
   - Choosing a valid option clears only this field's input error.
   - Closure-bound controls are still validated at the edit boundary. Oracles must not fabricate private calls to reach an invalid value the UI cannot submit.
4. **Identity and latest authority.**
   - Each valid edit establishes its field, session and operation identity before it is enqueued.
   - It displays immediately (pressed swatch or card, select value, switch state), even while the per-key lock is held. Controls stay enabled while an operation is pending.
   - Switches invert the latest intent, not the rendered closure. Two same-turn activations, or two activations during a held lock, return to the original value through two operations.
   - Completion authority belongs to the exact draft object. It does not come from value equality, `meta.value`, `meta.status`, an earlier success or failure, or a predecessor Promise.
   - Only the matching latest success clears a field's work.
   - Choosing a value equal to the registry default stores that value. It is never converted to removal.
5. **Failures keep the latest choice.**
   - Covered failures: quota, a throwing `getItem` or `setItem`, missing or rejected Web Lock capability, conflict, and readback uncertainty.
   - Each keeps the latest choice with accurate pending or failed feedback. None may produce an unhandled rejection or a false Saved.
   - A Retry while the field is pending is inert or idempotent.
   - Cover these orderings:
     - the predecessor succeeds and the latest fails;
     - the predecessor fails while the latest stays queued, and Retry advances the predecessor without acknowledging the latest;
     - repeated failed-predecessor recovery;
     - a later failure of the latest.
   - Coalesced queued palette choices (A→B→C during a held lock) settle only the latest.
6. **Uncertainty and conflict.**
   - An unchanged uncertain Retry keeps its grant across temporarily denied reads or locks. It reconciles with exactly one total write, and readback must match the intended bytes.
   - An external replacement or removal stays a preserved conflict, including restoration of the original baseline bytes.
   - Repeated Retry never gains authority to overwrite. A distinct new choice is a new operation.
7. **Independent settlement.**
   - A successful field never retries, rewrites, discards or rereads a sibling.
   - Cover:
     - several and all five fields unresolved at once;
     - a conflict coexisting with an unrelated quota failure;
     - a string field failing while a boolean succeeds, and the reverse.
   - General Saved requires both:
     - a genuine latest success in this mount;
     - no current drafts, pending operations, source errors or input errors.
   - A source-only Reload repair clears its alert but does not by itself claim a save.
8. **Recovery actions.** Each field has its own Retry, Discard and, for source-only issues, Reload, each localized and labelled with the field.
   - Reload refuses, at invocation time, to erase the same field's actual draft.
   - Discard detaches the field's work before the safe `meta.reload()`. It makes zero set/remove attempts and rereads only that field.
   - "Discard all changes" visits only actual current drafts.
   - A late completion after discard, reload or unmount never revives discarded state or clears newer work.
   - Source repair never acknowledges failed actual work.

   Normative wording, so that oracles can be frozen beforehand. It follows the accepted Date & Time and More callers.

   | Element | EN / ZH wording |
   | --- | --- |
   | Field labels (existing, `localI18n.ts:295–307`) | `Default Color`/`默认颜色`, `Font Size`/`字体大小`, `Pin by Default`/`默认置顶`, `Restore Default Size`/`恢复默认尺寸`, `Default Grid Spacing`/`默认网格间距` |
   | Per-field actions | `Retry <Label>`/`重试 <Label>`, `Discard <Label>`/`放弃 <Label>`, `Reload <Label>`/`重新读取 <Label>` |
   | Pane actions | `Export Sticky Note draft`/`导出便签草稿`, `Discard all changes`/`放弃全部更改` |
   | Field messages | `<Label> is saving.`/`<Label>正在保存。`; `<Label> was not saved.`/`<Label>未保存。`; `Saved <Label> is unavailable. Reload it; this is not a new unsaved change.`/`已保存的<Label>不可用。请重新读取；这不是新的未保存更改。`; `<Label> has an invalid value.`/`<Label>格式无效。` |
   | Status lines | `Sticky Note settings saved.`/`便签设置已保存。`; `Export failed. Please retry.`/`导出失败，请重试。` |

## 6. Reset and defaults

- The pane has no reset action today, and this contract introduces none. That rules out:
  - Reset Default or per-field reset;
  - a Save or Reset footer;
  - `meta.reset`/`removePref` calls;
  - global-reset wiring.
- "Restore Default Size" is a boolean preference, not a reset.
- Registry defaults are display values for absent keys only.
- Discard and Discard all are zero-write recovery disposal, not reset.
- `resetAllPrefs()` and the Appearance and Features overrides stay untouched.

## 7. Device continuity and host permission

- **No account machinery.**
  - The five keys stay unscoped device keys.
  - The pane never reads, writes or acquires, for these fields, any account physical key (`xai:account:v1:*`, `xai:demo:v1:*`), account lifecycle lock, generation marker, tombstone or recovery admission.
  - Prove this with spies on lock names and keys.
  - An unrelated held account lifecycle lock must not delay a device edit.
- **Survival while mounted.**
  - Drafts and operations survive A→B, A→locked, locked→A and same-account epoch/generation changes.
  - An operation held behind a real per-key lock must still finish, or keep its own recovery, after the change.
- **Host permission lifecycle.**
  - An epoch change renews the decision token and cancels any old held intent: the route resets, and sign-out resolves `false`.
  - Every old capability then refuses, based on live scope and disposal state, including before rerender. This covers `isCurrent`, `isBlocking`, `exportDraft` and `discardDraft`, plus the old inline export, discard and Retry callbacks.
  - A fresh permission — B, locked, or a return to A — must guard, export and discard the surviving device drafts. These are required positive controls.
  - Never erase device work to revoke an old permission. Never inherit an old decision.
- **Sign-out and forced transitions.**
  - Voluntary sign-out guards current device drafts before identity invalidation.
  - Forced transitions are never blocked and never discard device drafts.
  - There is no private data to dispose, and no Header-style frozen-note exception applies.
- **Unmount.**
  - Unmount removes the guard and the unload listener, and detaches callbacks.
  - It does not undo committed writes.
  - Crash and forced-authentication durability belong to REL-09.

## 8. Sparse memory export

**Format.** The filename is `sticky-draft.json`. The envelope, shown with all five fields:

```json
{"version":1,"kind":"sticky-draft","values":{"device":{"color":"mint","font":"xl","pin_default":false,"restore_size":true,"grid_spacing":"xl"}}}
```

- The `device` object holds exactly the actual unresolved current drafts, each strictly revalidated.
- It is sparse when only some fields are drafts, and contains all five when all five are.
- Never include an account bucket, account ID, physical key or timestamp.
- Never include saved, default, source-only or input-error-only fields.
- There is no empty download.
- This is a recovery file. It is not an import feature and not proof of saving.

**Behavior.**
- **Memory only.** Export reads captured, permitted drafts and makes zero `getItem`, `setItem` or `removeItem` attempts on any key. This holds while every Storage operation throws, while operations are held, and after partial success.
- **Permission rechecks.**
  - Recheck live permission before setup, after URL creation, after append, and immediately before the click.
  - A synchronous epoch change or unmount during Blob creation, URL creation or append cancels the click.
  - A stale same-turn guard export is refused.
  - Fresh locked and fresh B exports are required positive controls.
- **Failure handling.**
  - A Blob, URL, append or click error shows the localized export error and keeps drafts, tokens and the guard.
  - The anchor is removed and the URL revoked on a best-effort basis, including after a late setup failure.
- **No side effects.** Export and Stay never save, discard, retry, or release a held route or sign-out.

**Native disk evidence.** Use actual Chrome downloads, parsed from disk and compared to the whole expected envelope with deep equality.

Required shapes:
- sparse, one field;
- all five (three strings and two booleans);
- an export from the departure dialog;
- a fresh locked export after A→locked;
- a fresh B export after A→B;
- an export while one operation is held behind a real lock.

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
- Consume the optional `registerDepartureGuard` inside `StickyPaneContent`. `stickyPane.render(props)` keeps spreading its props.
- A standalone `render({lang})` still renders and edits without a guard.
- The guard label is Sticky Note/便签 (`settings.sticky`), never the "Smart Lists" fallback.
- Reuse the production ComposedSettings, coordinator and `settingsDeparture` unchanged.
- Add no router or sign-out state machine, and make no host, coordinator or auth edit.

**Host matrix** (actual composition, full Shell):

| | Scenario | Required behavior |
| --- | --- | --- |
| a | Production sidebar | Trusted, hit-tested activation of a `.settings-sidebar .list-row` for another pane. |
| b | AppRail | AppRail or programmatic module navigation. |
| c | Back and **guarded Forward** | Compare `{pathname,key,state}` with deep equality for Stay, discard-and-leave and latest-completion release; the history stack stays intact. |
| d | Relative navigation | State and options are replayed exactly. |
| e | Voluntary sign-out | Resolves `false` on Stay. |
| f | First same-turn intent wins | Route versus route, and route versus sign-out. |
| g | Stay, Escape, export | URL, history, pane and dialog are kept; a fresh intent after Stay prompts again. |
| h | Partial work | With two failing fields, repairing one keeps holding; a newer edit or hidden/offscreen recovery also keeps holding. |
| i | **Same-field ordering** | See the steps below. |
| j | Discard all and leave | Releases once with zero writes. |
| k | Epoch change | Cancels the old intent while fresh device protection remains. |
| l | Unmount | Removes the guard and the unload listener. |

Same-field ordering (row i):
1. Let the predecessor complete while the latest operation is genuinely held behind the real `prefMutationLockName("xai_pref_sticky_<field>")` lock.
2. At that point, assert location, dialog and zero history mutations.
3. Make the latest fail through an injected `setItem` fault, not a conflict.
4. Retry the latest. It must release **exactly once**:
   - one router location commit to the intended entry, with no duplicate commit;
   - no `pushState`/`replaceState` beyond that commit, and none for a POP release;
   - the dialog closed.

**Beforeunload.**
- Warn synchronously only when actual current drafts exist, with zero storage attempts in the handler.
- Do not warn in a clean, source-only or input-error-only state.
- This is a cancelable warning, not crash durability.

**Responsive presentation.** EN and ZH, at 375, 414, 768, 1024 and 1440.

Controls to check:
- every control: 13 swatches, the select, both switches and the four cards;
- in the all-five-unresolved state: five recovery blocks (ten Retry/Discard buttons), Export, and Discard all;
- a source-only Reload;
- the three dialog actions.

For each one:
- After scrolling it into view, a center hit-test lands on the control.
- It is contained horizontally within `.settings-detail` and not covered.
- Neither the document nor the detail scrolls horizontally.

Sizing and CSS:
- Recovery and dialog targets are at least 44×44 at every width.
- Existing swatch and card geometry may not shrink; enlarging it is not required.
- New CSS adds selectors only under `.sticky-pane` and `.sticky-recovery-*`.
- Existing `.sn-*` rules and color variables stay unchanged, and switch track and knob alignment is preserved.

Screenshots: manually review ten all-five-unresolved screenshots (EN/ZH × five widths), plus the 375 dialog.

**Keyboard.**
- Trusted Tab reaches every control in DOM order, with visible focus.
- Space and Enter each activate a swatch, card or switch exactly once: one operation, no double firing, no page scroll on Space.
- The native select changes once per keyboard choice.
- `aria-pressed` and `aria-checked` reflect the displayed draft.
- In the dialog:
  - focus enters the dialog;
  - Tab and Shift+Tab wrap within it;
  - Escape means Stay;
  - focus then returns to the prior element.

## 10. Downstream consistency

No production reader outside the pane exists (D1), so this gate proves **no drift**.

Nothing changes in:
- default, codec, owner, schema or key;
- dual writes, aliases, migrations or vocabulary mapping;
- StickyComposer's hard-coded `sun`.

Required evidence:
1. Exact physical bytes for all 25 domain values (13 + 4 + 2 + 2 + 4), at both the Sol layer and natively.
2. An empty `git diff 2023526 <fixed> -- packages/plugin-web-storage packages/plugin-web-settings-shell packages/xai-web-dashboard-widgets packages/xai-web-cmdk apps package.json pnpm-lock.yaml`.
3. The D1 search repeated at the fixed SHA; any new consumer is a blocker.
4. The dashboard-widgets `StickyComposer`, `StickiesWidget`, `useStickies`, `stickiesStore` and `ids` tests passing from the fixed archive.
5. Storage check-types passing, with the unchanged lifecycle declaration still classifying the five keys as device-recovery/retain.

## 11. Protected surface and Terra's files

**Terra may edit only:**
- `packages/plugin-web-settings-rest/src/panes/stickyPane.tsx`.
- `src/internal/StickyColorPalette.tsx`, only as far as the caller needs, preserving everything listed in §2.
- At most one new Sticky-local helper under `src/internal/`.
- `src/__tests__/stickyPane.test.tsx` and new Sticky-local test files.
- Additive Sticky-scoped selectors in `src/styles.css`.
- New `sticky.*` keys in `src/internal/localI18n.ts`; no other key changes.
- The Sticky sections of the package's `docs/api.md` (§4.9) and `docs/test.md` (P3).

The fixed-product diff must list only these files.

**Implementation expectations.**
- Use one coherent local operation model.
- Do not extract a generic recovery framework or refactor an accepted pane.
- ST1–ST10 keep their business assertions. ST6 and ST8 may only await real async completion.
- These tests stay unchanged and must pass:
  - NH1;
  - `index-barrel`, `restPanesById` and `applyRestPanesToRegistry`;
  - both `apps/web` composition tests.

**Protected:**
- Settings-rest `types.ts` and `index.ts`.
- The shared storage hook, engine, registry, ownership, codec and lifecycle code, including legacy `usePref`.
- The Settings shell, including `Toggle`, `SettingRow`, `resetAllPrefs` and the types.
- The `apps/web` host, coordinator, `settingsDeparture`, composition and auth.
- The accepted Date & Time, Notifications, More, Smart Lists, Collaborate, Pomodoro and Header callers.
- Dashboard widgets, CmdK, tokens and `apps/desktop`.
- Reviewer evidence, the ledgers and the control plane.

**Shared defects.** A correct new shared defect requires all of the following before any product repair:
- a frozen before oracle;
- an Astra-role impact review;
- explicitly revised ownership;
- affected accepted-caller reruns (precedent: `../web-date-time-recovery-independent/shared-96c4915.md`).

## 12. Before-failure oracles (Sol and parent, before Terra)

**Runner requirements.**
- Use an immutable `git archive 2023526` behind a lockfile-hash gate.
- Copy the oracle into the archive.
- Record both the requested and the resolved SHA.
- Refuse to overwrite an existing log.
- Preserve nonzero exit codes.

**Sol jsdom matrix** (real storage, hook and engine):
- Install a Web Lock fixture with exclusive semantics.
  - A pass-through stub cannot prove a held lock.
  - An accidental `lock-unavailable` result is a fixture failure, except in the cases that test lock unavailability on purpose.
- Use an attempt-counting Storage injector that is proven to fire.
- Drive real `accountScope` transitions.
- Select controls only through stable selectors: `[data-color-id]`, `[data-spacing-id]`, the select's `aria-label`, and the switch names.
- Select recovery UI by the roles and names in §5.

**Parent host baseline.**
- Use the actual ComposedSettings with the full Shell (pattern: `../web-more-recovery-independent/`).
- Cover each field's failed edit, its route outcome and its sign-out outcome.
- Include one clean positive control.

**Validity and positive controls.**
- Every case asserts its preconditions before its business assertion: control found, seeded bytes present, fault armed and observed.
- A failed precondition is a fixture or selector error. It is never counted as a product failure.
- These must pass at `2023526`:
  - zero-write mount;
  - absent defaults;
  - normal persistence and exact bytes for every field;
  - clean navigation and clean sign-out;
  - ST1–ST10.
- No case may use private calls to reach unreachable invalid values.

**Hypotheses to confirm or refute.** None of these is an established defect.

| ID | Hypothesis |
| --- | --- |
| H1 | A failed `setItem` for any field loses the latest choice: the display stays on the old value with no feedback, Retry or export, while the old bytes remain. |
| H2 | A throwing read, or malformed boolean bytes, renders the default with no source alert or Reload. |
| H3 | Out-of-domain string bytes reach the controls unchanged: no pressed swatch or card, a select value with no matching option, and no alert. |
| H4 | An injected font option value is persisted verbatim. |
| H5 | Two same-turn switch activations both invert the same rendered value, so the final state is the opposite of the latest intent. |
| H6 | Legacy writes ignore a held per-key Web Lock, so the physical bytes change immediately. |
| H7 | With unsaved failed work, sidebar, AppRail, Back, Forward and relative navigation all leave Sticky; sign-out resolves `true`; beforeunload does not warn. |
| H8 | No Retry, Discard, Reload, export or Saved control exists. |

**Freezing and reruns.**
- Freeze oracle files, before logs and SHA-256 hashes before Terra starts.
- If a hypothesis is refuted, record it as PASS. It is not a defect, but its requirement still binds the fixed product.
- Later fixture corrections use a diagnostic suffix, rerun against both archives, and never weaken an assertion.
- Correct FAILs must be preserved through unchanged fixed reruns.

## 13. Gates

| Gate | Required complete evidence |
| --- | --- |
| All5 ordinary fields | <ul><li>All 25 domain values, with exact bytes, default, codec and unscoped key.</li><li>Absent zero-write mount.</li><li>Invalid and unavailable source per field, with Reload only.</li><li>Malformed font DOM input.</li><li>Latest-choice failure and Retry per field.</li><li>A choice equal to the default is stored.</li><li>Truthful Saved.</li><li>ST1–ST10 preserved.</li><li>Partial and targeted recovery: several and all five unresolved; a conflict plus an unrelated quota failure; both string/boolean failure directions; targeted discard with zero writes and zero sibling reads; discard all; late completions ignored.</li></ul> |
| Same-field queue attribution | <ul><li>Shown for one string field (the palette) and one boolean field.</li><li>Predecessor succeeds while the latest fails; predecessor fails while the latest is queued.</li><li>Repeated failed predecessor.</li><li>Pending Retry is inert.</li><li>Same-turn double switch activation.</li><li>Coalesced A→B→C.</li><li>Equal-value successor.</li><li>Uncertainty resolved with one write.</li><li>External conflict, including restoration of the original bytes and external removal.</li><li>New work after a discard survives.</li></ul> |
| Device continuity and export | <ul><li>A→B→locked→A and a same-account epoch change, with a real held device-key lock.</li><li>No account key, lock or marker touched.</li><li>An unrelated held account lock does not serialize device edits.</li><li>Old capabilities refuse both before and after rerender; fresh B and locked positive controls.</li><li>Memory-only export under total denial, with attempt-level counters.</li><li>Setup and click failure.</li><li>Epoch change and unmount cancel export.</li><li>Exact native disk JSON for every §8 shape, with warning and guard asserted after each.</li></ul> |
| Production host/native | <ul><li>The complete §9 matrix in the actual composition, including the hit-tested sidebar, guarded Forward with key identity, and same-field exactly-once release with history counters.</li><li>Trusted input for all 25 values.</li><li>New-document reload with zero mount writes.</li><li>A native held lock and native uncertainty.</li><li>A second-document conflict.</li><li>EN/ZH at five widths: every-control hit-test, 44 px targets, focus trap, keyboard checks and manual screenshots.</li></ul> |
| Downstream readers and canonical format | <ul><li>§10 items 1–5.</li><li>The before byte and default controls PASS at `2023526`.</li></ul> |
| Final regression | Independent reruns from the fixed archive: <ul><li>Settings-rest package, typecheck and lint.</li><li>Web package, check-types and lint.</li><li>Storage check-types.</li><li>Accepted More: Sol 79 (`fields`, `reset`, `queues`, `boundaries`, `owner-export`) plus `original` 15, via `../web-more-recovery-sol/verify-fixed.mjs`; frozen host 11, via `../web-more-recovery-independent/verify-fixed.mjs <sha> host`.</li><li>Notifications: Sol 41, Astra boundaries 24, Astra host 15 and parent host 12.</li><li>Date & Time 7.</li></ul> Commands as in `../web-more-recovery-final/review-final-regressions-7b216a3.md`. A shared or unscoped stylesheet change also needs the affected callers' native visual modes. Any shared delta needs impacted engine, hook and caller reruns plus fresh acceptance. |

**Acceptance condition.** Every row must reconcile four things: the source, a correct before failure, fixed independent behavior, and the actual user surface. The caller cannot be closed by any of the following: passing the two existing persistence tests, converting only the switches, or shipping recovery without host and export coverage.

## 14. More limitations converted

| Retained limitation in More acceptance | Sticky treatment |
| --- | --- |
| Export storage check counted only successful writes and removes | **Gate.** Native counters record every attempt before delegation; zero reads, writes and removes are asserted for every export (§8). |
| No native warning check after the final locked export | **Gate.** Beforeunload and the guard are asserted after every native export (§8). |
| Forward exercised only as an unguarded return | **Gate.** Guarded Forward with key identity (§9, row c). |
| Control reachability inferred from zero overflow and screenshots | **Gate.** Every control is hit-tested at every width in both languages (§9). |
| Setup-failure paths proved only in jsdom | **Gate.** One native setup failure. Blob, URL and append epoch timing may stay with Sol. |
| All15 pending-reset envelope asserted only in jsdom | Not applicable: there is no reset. The all5 set export is native. |
| Headless Chrome with synthetic accounts; sign-out through the direct preflight; synthetic beforeunload; reused dependency trees | Retained exclusions. The lockfile gate is a consistency check only. |

## 15. Exclusions

**Not part of this caller:**
- SET-12 business integration:
  - new-note defaults at creation or render;
  - reconciling the Settings and widget color vocabularies;
  - batch-applying settings to existing notes;
  - arrange and restore-size behavior.
- Native pin or window capability on any host.
- Tauri execution.
- Production authentication and live logout.
- Crash and forced-authentication durability (REL-09).
- Repairing malformed stored bytes inside the pane.
- Accessibility copy beyond §9.
- Global reset, migration, deletion or data-export changes.

**Not closed by this caller:** SET-12, REL-05, QA-01, QA-03, QA-04, QA-09, D2/REL/AI, or any other 312 item.

**Not authorized:** deployment, release, branch promotion or Web→Desktop sync.

**Recommended evidence directories:** `docs/reviews/web-sticky-recovery-{sol,independent,terra,native,final,acceptance}/`.
