# Next complete caller: Settings More, all15 edits and Reset Default

Astra acceptance contract, Web module. Product baseline `afbfb24d6f7311366b77852eda927d08467478c2`; source remains identical through `8051fc1`. The preceding complete Notifications caller is accepted in [acceptance-afbfb24.md](acceptance-afbfb24.md), commit `ad223a2`. This specifies the next ordered implementation unit; it does not accept More or change full312/D2/REL counts.

Parent leads actual host/native verification and final scheduling; Terra owns approved implementation, Sol independently freezes/runs business assertions, Astra owns risk/contract/final acceptance. Do not start Sticky or another later caller concurrently. This mixed-owner set/reset recovery unit is high risk; Spark cannot own its persistence, queue, owner lifecycle or acceptance. Optional bounded lookup or UI work still requires explicitly defined files and independent Terra/Sol/Astra review.

## Current product and exact ownership inventory

The complete unit is `packages/plugin-web-settings-rest/src/panes/morePane.tsx`: **all15 direct legacy usePref bindings, every edit handler, the pane-scoped Reset Default operation across those same15, and the actual Settings departure seam**. Current reset captures scope at mount, calls assertCurrent once, then loops removePref with ignored mutation results. Its UI reset counter and generic Account changed message do not establish verified persistence. The existing source has six boolean preferences and nine editable selects; two booleans use clickable label/span checkboxes instead of keyboard-operable native controls.

The table is authoritative over stale comments that mention14keys or synthetic storage wakeups. Types/options are in `src/types.ts` and the pane; defaults/codecs in `plugin-web-storage/src/internal/registry.ts`; account/device ownership in `internal/accountOwnership.ts`. Registry package owner metadata is not account scope. All15 are schemaVersion1 pref entries. The exact key for each row is `xai_pref_more_` followed by the field name below.

| Field / existing control | Strict accepted domain | Registry default / codec | Physical owner |
| --- | --- | --- | --- |
| `win_type` / Choose window type when launching | window, tray, full | window / string | device |
| `launch_at_login` / launch toggle | boolean | false / boolean | device |
| `minimize_on_launch` / minimize toggle | boolean | false / boolean | device |
| `date_recognition` / date recognition toggle | boolean | true / boolean | device |
| `remove_date_text` / Remove text in tasks checkbox | boolean | false / boolean | device |
| `remove_tags` / remove tag text checkbox | boolean | true / boolean | device |
| `url_parse` / URL recognition toggle | boolean | true / boolean | device |
| `default_date` / Date | none, today, tomorrow | none / string | device |
| `default_rem_due` / due-time Reminder | none, on_time, 5min, 15min | on_time / string | device |
| `default_rem_all` / all-day Reminder | none, 9am, day_before | none / string | device |
| `default_pri` / Priority | none, low, med, high | none / string | device |
| `default_tag` / Tag | none, study, work, personal | none / string | **account** |
| `default_list` / List | inbox, today | inbox / string | **account** |
| `add_to` / Add to | top, bottom | top / string | device |
| `overdue_at` / Overdue | top, bottom | top / string | device |

The13device physical keys equal their logical names. The two private references use the existing accountScope/generationKey helper for the current account or demo generation, never the unowned legacy logical key. Preserve account-before-key lock ordering, committed-marker/tombstone/recovery admission, owner/generation/epoch checks and existing codec bytes. Do not duplicate physical-key construction, inspect private data through a raw fallback, migrate aliases, seed account defaults or change any ownership declaration.

Preserve pane id more, icon help, locale title, sidebar position, section order, EN/ZH descriptions, all existing option labels and immediate autosave without a Save footer. Language remains the one-option read-only Follow System select. Daily prep, Daily journal and Travel checklist remain the three static read-only template cards. The present key producers do not implement native launch/tray/window behavior, task parsing/reminders/default insertion or real list/tag/template CRUD. This contract accepts preference persistence/recovery, not those downstream features. Do not introduce native calls, schedulers, Tasks writes, cloud services, arbitrary tag/list IDs or a new Language writer to make this unit seem more complete.

Scheduling authority is [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md) and the [3705558 inventory refresh](../web-d2-pref-binding-inventory/refresh-afbfb24.md): after Notifications, More15 then Sticky5. The remaining27files/72direct bindings/52setter bindings exclude wrapper/raw/ordinary/dynamic/non-TSX/non-localStorage obligations and are neither a complete writer denominator nor52confirmed defects.

## All15 edit, source and operation requirements

Use the accepted usePrefAutosaveAsync edit/retry/reset/meta interface and strict runtime validators. Preserve shared queue/coalescing, result semantics, exact baseline/readback and uncertainty grants. Do not add a second persistence effect, raw set/remove, caller storage preflight, forced rebase, manual account/key lock layer or synchronous compatibility change to legacy callers.

1. Valid and absent mounts/rerenders perform zero set/remove. Defaults are display values, not writes. Invalid/unavailable source remains individually labelled with Reload-only recovery, no fabricated draft/export/departure warning. Validate all boolean/select source domains, including both account controls. A malformed DOM edit retains prior valid displayed value/draft and independent localized field error; it never persists invalid/default substitution. Correcting one field or editing a sibling does not erase another field's unresolved error or permit false Saved.
2. Each valid edit establishes its owner/session/field/operation identity before enqueueing and displays immediately. Six boolean handlers invert the latest intent under same-turn double clicks and held key locks. Latest completion authority is the exact request, not value equality, meta.value, any earlier failure or a predecessor Promise. Only matching current success clears work.
3. Preserve latest work for quota/security, missing/rejected named-lock capability, conflicts and uncertain readback. Pending Retry is inert/idempotent. Cover predecessor succeeds/latest fails and predecessor fails/latest remains queued, including repeated failed predecessor recovery and subsequent latest failure. Advancing a failed predecessor cannot clear or acknowledge the queued latest operation. Cover both device and private account bindings and mixed set/reset ordering.
4. Unchanged uncertain Retry keeps its grant across temporarily denied reads/locks and reconciles with one total mutation; successful readback must match intended bytes or absence. Externally replaced bytes, including restored original baseline, remain preserved. Repeated Retry or Reset Default must not create silent fresh authority to overwrite conflicting data. A distinct new user choice is a new operation.
5. Every field settles independently. A successful field cannot rewrite, retry, discard or reread a sibling. Include multiple/all15 unresolved operations, conflicts coexisting with independent quota failures, and both mixed-owner success/failure directions. General Saved requires no current actual operations/drafts or unresolved source/input errors. A batch-specific Defaults restored claim also requires that all15 matching reset operations completed and no newer contrary edit superseded them.
6. Per-field Retry, explicit Discard/reload and source-only Reload are labelled and localized. Invocation-time source Reload refuses to erase the same field's actual draft. Discard detaches work before safe meta.reload, performs zero set/remove and rereads only the discarded field; all-discard visits only actual current permitted work. Old operations may physically finish under engine admission, but their later completion must not revive discarded state or clear a subsequent edit/reset. Source repair does not acknowledge actual failed work.

## Reset Default is a recoverable remove operation

Reset Default remains **pane-scoped removal of the15owned physical preferences**, returning the UI to registry defaults after verified absence. It is not writing15default values, global Reset All, deleting other accounts, clearing unowned aliases, or Discard changes. Retain `data-testid="more-reset-default"` and an accessible localized action. Normal reset must preserve unrelated Notifications/DateTime/etc keys, accountB/generationB data and all unowned legacy bytes.

### Explicit batch admission and existing stale-reset invariant

Preserve the two existing REL-03 More reset business invariants in `src/__tests__/morePane.test.tsx`: an authorized current-account reset leaves B and unowned logical data untouched; a reset from a pane mounted under A after switching to B refuses **before any device or B mutation** and shows Account changed / reopen guidance. Updating a ref to B and silently authorizing that same old reset button is not equivalent. Reopening the pane establishes fresh reset authority. Normal field edits/recovery can use their current permitted owner without reauthorizing this stale whole-pane destructive action.

Starting the full mixed-owner reset requires its captured pane scope to remain current and an active account/demo generation for the two private fields. When locked/no account, individual device edit/recovery remains usable; full15reset refuses before mutation with clear account guidance. Do not silently reset only13device fields and imply all defaults were restored. Storage/marker/lock admission errors after a valid active-scope invocation are per-field recoverable failures, not a reason to mislabel every fault Account changed.

For a valid invocation, establish all15 typed reset intents and their batch identity before asynchronous settlement. Each operation uses the accepted reset API bound to its proper owner. No delayed loop may create B-account operations or new device intents after A's authority has expired. Already-admitted device work follows the device continuity rule below; account work follows the private scope rule. This is not a cross-key atomic transaction: no rollback of successful fields, no all-or-nothing promise and no account lock held across the user recovery dialog.

### Per-field reset truth and queue behavior

- Track `set(value)` versus `reset` as distinct draft intent even when their displayed values equal the registry default. Reset success requires verified absence; a failed remove retains a reset draft displaying its intended default, explicit unsaved/reset feedback, recovery and host protection. Setting the default must still store its legitimate value rather than being silently converted to removal.
- All15 physical removals need normal and refusal evidence, including both private keys. A valid already-absent field may complete through the shared verified no-op/reset semantics, with no seeded default. Invalid/unavailable source must follow the shared refusal; retain an explicitly requested reset intent until legitimate recovery or discard. Reset is not authority to purge malformed or unreadable bytes by bypassing validation.
- On partial reset, only unresolved fields remain drafts/export/guard. Retry targets only those operations; successful fields are not removed again. Duplicate Reset Default/Retry while the same batch is pending does not enqueue duplicate removes. Repeating the unchanged failed reset must preserve its refusal/uncertainty authority, not rebase it. A clean completed batch can later receive a fresh explicit reset; an intervening distinct edit supplies a new intent.
- Cover pending edit→reset, pending reset→edit and reset→edit→reset, including equal displayed default values, successful/failed predecessor and latest in both directions, duplicate pending actions and discard→new same-field work. Latest set/reset's own completion governs the result and host release. A successful old set or reset cannot make a newer reset or set appear saved.
- For remove-success/readback-denied uncertainty, Retry verifies absence with exactly one total remove and a single reconciliation notice. Conflict preserves external bytes and the reset draft. An unrelated field can still save while reset recovery is blocked. Never clear the whole batch because one remove succeeded or the reset handler returned.

## Mixed ownership, lifetime and privacy

The13device drafts/operations survive A→B→locked and same-account epoch/generation changes while the pane remains mounted. An unrelated account lifecycle lock cannot serialize a device-key edit. The two account fields use the existing scope-bound engine admission and cannot read/write/export another owner or revive a discarded old generation. Test active, absent/locked, committed-marker denial, deleted/recovery-required state and real held account/key locks; do not substitute a scope-ref-only mock for engine behavior.

Voluntary navigation/signout guards current device plus current private actual work before identity invalidation. For forced A→B/locked/epoch invalidation, follow the accepted [Smart Lists privacy boundary](../web-smart-lists-recovery-contract/contract.md): immediately hide/dispose A private draft capabilities, cancel old host intent, refuse stale callbacks and never export or write A through B. Do not prevent a security transition. Returning to A must not resurrect its old token/volatile private draft. No new durable account draft repository or Header-specific frozen-note export exception is introduced. Such forced-loss recovery remains REL-09 work.

Fresh B permission protects surviving device work and B's own new work; fresh locked permission protects device work only. Old isCurrent/isBlocking/export/discard/Retry/reset capabilities check live scope/disposal before rerender as well as after it. A same-account new epoch invalidates old capabilities. Unmount removes listener/guard and detaches operations. Already admitted physical operations remain subject to engine guarantees; do not promise cancellation of a completed write or undo it by compensation.

If A changes during an admitted full reset, device intents already admitted may settle or remain recoverable; A private work is disposed under the rule above. The old batch must neither report all15restored nor continue into B. This differs from clicking the stale reset for the first time after the change, which is a zero-mutation refusal for all15.

## Sparse memory export including reset intent

Provide one current permitted draft download, filename `more-draft.json`. Use a set/reset envelope that cannot misrepresent a requested removal as a saved default:

```json
{"version":1,"kind":"more-draft","changes":{"device":{"win_type":{"operation":"reset"},"launch_at_login":{"operation":"set","value":true}},"account":{"default_tag":{"operation":"set","value":"work"}}}}
```

Use the exact field identifiers in the inventory, `operation:"set"` with a strictly validated value or `operation:"reset"` with no invented value. Each field appears at most once as its latest actual unresolved intent. Omit empty owner buckets; no empty download. An all15pending reset contains13device reset entries and2current-account reset entries; a partially successful batch contains only unresolved entries. Account bucket means only the currently permitted account generation, not a collection of accounts; omit account IDs, physical keys, tokens, secrets, saved/default/source-only fields and old-owner values. This is an export for user recovery, not an import/replay feature or proof that reset succeeded.

Export must use captured permitted memory while every Storage read/write/remove throws, including held operations and partial reset. Recheck live permission before Blob/setup and just before click. Synchronous owner/epoch/unmount from Blob, URL creation or append cancels obsolete click; include same-turn stale guard refusal and fresh locked device-only positive. Setup/click errors get separate localized feedback, preserve drafts/tokens and clean anchors/URLs best-effort. Export/Stay never saves, discards, releases a held route/signout or grants reset authority. Native Chrome must inspect actual disk JSON for sparse set, sparse reset, mixed set/reset, all15 and locked device-only export.

## Actual host, keyboard and responsive presentation

Forward optional registerDepartureGuard through the actual morePane.render, preserving standalone render({lang}). Reuse production ComposedSettings/coordinator and host auth preflight. No new router/signout state machine or shared coordinator edit to make More pass.

Verify actual Settings sidebar, AppRail/programmatic navigation, exposed Back/Forward with location key preservation, relative navigation with state/options and voluntary signout. First same-turn intent wins; the pane/URL/history stay committed to More until current latest work is all clean or explicitly discarded. Partial reset, newer edits and hidden/offscreen recovery retain the guard. Latest matching completion releases exactly once; first-intent competition, Stay/Escape/export, fresh intent after Stay, epoch cancellation and unmount must all be covered. There is no separate Close control in the current Settings shell; test only an exposed close action if one actually exists.

Beforeunload warns synchronously only for actual current set/reset work and writes nothing; source-only health and ordinary errors without valid user intent do not create fake work. It is a cancelable browser warning, not unsaved crash durability. Current-all discard and leave is zero-write recovery disposal, not Reset Default.

Keep all15 controls, Reset Default, source/field feedback and recovery reachable in EN/ZH at375/414/768/1024/1440. Preserve plain-text SettingRow labels (MP4). Make both span-only checkbox interactions keyboard accessible with proper names/checked state, using a native control or equivalent accessible button; trusted Space/Enter must change once without scrolling/double firing. Do not drop them from native verification because they differ from Toggle. Native select navigation and all option domains remain usable. Scope CSS to More recovery/controls, maintain switch track/knob alignment, prevent overflow/covered actions and verify375recovery/dialog targets≥44px with hit/containment and manual screenshots. Scrolling is allowed; unreachable controls are not. Preserve focus trap, Tab/ShiftTab and Escape return for the shared dialog.

## Protected implementation surface and full acceptance gates

Terra may edit morePane, narrow More-local helper(s), its tests, local locale/API documentation and scoped CSS. Accepted Notifications/DateTime/Header/Smart/Collaborate/Pomodoro, shared storage hook/engine/registry/ownership, Settings host/coordinator/auth, migration/deletion/global reset and other reviewer evidence are protected. A correct new shared defect requires a frozen before oracle, Astra impact review and explicit revised ownership before product repair. Do not extract a generic recovery framework or weaken old tests to accommodate the caller.

Sol/parent freeze business oracles against the immutable afbfb24 archive before implementation. Keep MP1–MP10 and both REL-03 invariants; only await real async completion where necessary. Include valid native controls and valid active-account fixtures so fixture, lock setup, unsupported input and selector failures are not counted as product failures. Preserve any new correct defect through unchanged fixed reruns, even when the first implementation passes other suites.

| Gate | Required complete evidence |
| --- | --- |
| All15 ordinary fields | Every normal domain/default/codec/owner, absent zero-write, invalid/unavailable source, malformed DOM handling, latest-choice failure/Retry and independent feedback. Account controls require real scoped physical assertions; six booleans include both checkbox controls. |
| Full15Reset | All15 verified physical absence and defaults; all15 per-field remove refusal/recovery; missing/invalid/unavailable source; preserve unrelated/B/unowned bytes; old mounted A reset after B zero mutation; locked full-reset refusal and active fresh-reopen positive. |
| Mixed set/reset attribution | Both queue failure directions, repeated failed predecessor/pending Retry, set→reset/reset→set/reset→edit→reset, default-value equality, partial success in both owner directions, reset readback uncertainty one remove, external conflict/original-byte restoration, discard-all/new same-field survival. |
| Owner and export | Account lifecycle/key-lock admission and stale generation, device independence and A→B→locked continuity, full-reset mid-operation epoch, old/current inline and guard capability boundaries, full-storage denial, setup failure/epoch/unmount cleanup, exact sparse/all15/mixed/locked disk JSON. |
| Production host/native | Complete first-intent/navigation/signout/history/relative/partial/latest-release/Stay/Escape/export/epoch/unmount matrix using actual composition. Trusted controls and physical reload, actual reset and recovery, cross-document conflict and native held locks/uncertainty, EN/ZH five-width/focus/hit/manual images. |
| Final regression | Independently rerun full Settings-rest, Web and Settings types/lint and storage types; regress accepted Notifications41/24 and actual host seams, plus DateTime7. Current shared foundation may be reused only after unchanged source/dependency proof; any shared delta needs impacted engine/hook/caller reruns and fresh acceptance. |

All required rows must reconcile source, correct before failure, fixed independent behavior and actual user surface before Astra accepts this complete caller. Passing selected booleans, converting13device rows, or shipping15edits while omitting Reset Default cannot close it. No current More PASS is implied by this contract. Sticky5 and all broader writer/lifecycle/release obligations remain in the retained inventory for subsequent ordered work.
