# Collaborate: complete three-control persistence and draft recovery

Astra, Web, read-only implementation contract on fixed **a2c0fe0**. Author may implement this bounded feature batch after the [Smart Lists departure acceptance](../web-smart-lists-recovery-astra/review-a2c0fe0.md). Existing authorization covers these three controls and necessary narrow host/type wording reuse. No additional user confirmation, Save footer, shared-storage rewrite or activation is required.

## Actual product and ownership

`packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx` renders three actual controls. `plugin-web-storage/src/internal/accountOwnership.ts` is authoritative, while its registry provides codecs/defaults:

| Field | Physical logical key | Ownership | Allowed value / absent display | Current caller |
| --- | --- | --- | --- | --- |
| default_share | xai_pref_collab_default_share | account | comment/edit/view; comment | registered async autosave |
| show_avatars | xai_pref_collab_show_avatars | device | boolean; true | legacy usePref setter |
| mention_notify | xai_pref_collab_mention_notify | device | boolean; true | legacy usePref setter |

These are **three independent physical keys, across two scopes**. Do not turn them into one account map, rename/migrate physical keys, change registry defaults/ownership, or promise an atomic three-field transaction. The two booleans keep device behavior across A→B; account migration/marker/tombstone protection applies to default_share. Active identity change must never transplant A's account draft into B.

Parent **3667985** [real Chrome before](../web-collaborate-recovery-native/review.md) pins115efb2: both actual device toggle attempts fail under exact-key quota, bytes stay absent, false selections revert true, and no recovery text appears. Its first latest-value oracle fails; later Retry/Export assertions are not counted as separately executed failures. Absent mount already leaves keys absent. Preserve this before and its actual Toggle actions; after must pass them unchanged. The existing default_share conversion is only a prior storage subset, not full feature recovery acceptance.

## All three producers and independent persistence

Use existing `usePrefAutosaveAsync` registered-key APIs for all three, with stable domain validators: exact boolean for each toggle and the three allowed default_share strings. Reject forged selector values and invalid primitive/domain source rather than replacing it with defaults. Valid absent defaults display without mount, rerender, source event, account switch or reload writes. No new reset-to-default control is required.

Keep explicit user actions live-saving. Retain each field's latest intended value while pending/error/conflict/uncertain. Use the latest desired value when toggling repeatedly, including fast actions in one render interval; do not invert an obsolete saved value twice. Use the accepted hook's operation/baseline/token semantics and explicit Promise result, never a successful-looking legacy setter overlay or raw write. Aggregate status must not say Saved while any latest field is pending or failed.

Each operation uses its own physical-key lock; account writes additionally use the existing account shared lock and captured generation/owner admission. Device operations must not acquire an account dependency or fail merely because A changed to B. Source baseline and output validation stay inside the accepted engine, with honest lock-unavailable/rejection/read/write failure feedback. Do not invent a caller merge across physical sources.

A successful field clears only that field's matching latest draft. A failed field keeps its latest selection, original operation/baseline and error. Do not roll back successful siblings or reattempt them automatically. Expose clearly labelled per-field Retry and Reload/Discard for failures/conflicts; grouping is allowed only if labels name the exact affected fields and actions filter their targets. Source invalid/unavailable has read-only Reload after external repair, even without a user draft. Reloading one invalid source must not discard a different field's quota/conflict draft.

Retry is single-flight for the same outstanding operation. Unchanged readback-uncertain Retry verifies the token without a duplicate write; changed desired values cannot reuse old authorization. An external raw change/removal becomes conflict and cannot silently overwrite the other document. Clean external changes project; dirty fields retain desired values and show conflict. Explicit discard reloads only its named field and invalidates its queued operation; stale completion cannot relabel a successor value Saved. No default writing is part of Reload/Discard.

## One pane, two durable ownership domains

Maintain actual-user-draft state **per field**, not `meta.error` as a proxy. It begins on a valid user edit and clears only on the matching latest verified success or explicit targeted discard. Initial absence, malformed source and a displayed default alone are not drafts. Use native values and strict schema checks; avoid JSON truthiness coercion.

Keep the device hooks and device draft state mounted/stable across account epochs. On A→B or lock:

1. Immediately revoke the old account value/draft visibility and A persistence/retry/export capability under the accepted hook behavior. Do not expose A's value while B is loading or locked.
2. Preserve the latest device selections, pending operations, failures and uncertainty tokens. Do not remount/reset all three hooks by keying the pane on the account epoch. A device-only failed draft remains recoverable and editable under the existing device policy.
3. Cancel any existing pane departure decision and its sign-out permission using a **combined decision-session token** that changes on account epoch (and actual pane disposal), even if the remaining draft is device-only. Old callbacks become inert; they cannot discard current device work or authorize a different account's sign-out.
4. Register a new current decision capability. Its blocking state includes any surviving device drafts plus B's actual account draft, if one exists. The user may issue a fresh navigation/export/discard action for that binding. Cancellation of old permission must not clear device draft state.

While the same mounted pane survives A→B this preservation is required and directly testable. If an auth gate forcibly removes the pane, existing privacy/disposal wins; do not claim device draft durability across an actual unmount/crash. Voluntary sign-out is guarded before removal. Unmount invalidates all callbacks and pending local work as in the accepted hooks.

## Exact export format and scope decision

Filename **`collaborate-draft.json`**. Export **the entire latest actual unsaved draft across all fields**, not a complete persisted preferences backup. This deliberately excludes successfully saved/unedited fields and initial-source fallbacks. Example when all three have unsaved user choices:

```json
{"version":1,"kind":"collaborate-draft","values":{"account":{"default_share":"edit"},"device":{"show_avatars":false,"mention_notify":false}}}
```

Strict schema: outer keys version/kind/values; version1; kind collaborate-draft; values has exactly account and device objects. Account has only optional default_share with its strict domain; device has only optional show_avatars and mention_notify booleans. At least one field must be present. No unknown/prototype keys, physical keys, identifiers, credentials or status internals. Each present field must be a real current unsaved user draft; absence means that field is not included. This file is a user recovery artifact, not an import or replay authorization.

Partial-success example: default_share verified saved while both device attempts failed exports `account:{}` and the two latest device booleans. Device-only after A→B similarly uses `account:{}` unless B has made an actual new account edit. An old A combined export callback always refuses after the epoch change. A **new explicit export action** may export surviving device-only drafts; it must not attach B's unedited current setting or A's removed draft. Thus no ambiguity about combining owners or fabricating a complete account map remains.

Offer Export if at least one valid current user draft exists, including pending, quota, unavailable-after-edit, conflict or uncertain states. Take the snapshot from memory, not persisted storage. It must work under full localStorage read/write denial; use current in-memory scope/session checks, not `assertCurrent`/physicalKey reads. Capture the composite decision token, validate every included field, and recheck at the real download boundary and after any introduced await. Owner change during URL setup revokes/cleans up without clicking, even for an old device-only export request; a new request can use the new binding.

Use real Blob/temporary URL/anchor. Catch serialization/setup/click exceptions, show a separate localized export error, preserve all save errors/latest values/Retry/guards. Remove anchor and revoke URL best-effort without clearing drafts. Export does not write preferences, mark Saved, automatically discard, or navigate. Repeated explicit export is allowed; no claim of disk durability from `anchor.click`. Independent native tests must inspect the downloaded JSON bytes.

## Recovery UI, unloading and real host departure

Place the feature's status/recovery directly beneath its title with field labels, before the controls. English/Chinese wording must distinguish Saving, Saved, Not saved/conflict, source recovery and export failure. Preserve existing selector/toggles and no footer. At375×812 show failures and actions in the first viewport; wrap text/actions with44px targets, keyboard focus and no overflow using the actual Settings CSS.

Register beforeunload only while there is at least one current actual draft. Include device-only drafts after account replacement. Export does not remove it. Matching all-draft success or explicit discard removes it. No read/write/export in unload; no fabricated warning on clean/invalid-source mounts. This warning is subject to browser restrictions and is not durable/crash recovery.

Reuse the accepted real composed-host guard seam; do not test only the package placeholder shell. The guard's `isCurrent` tests the captured composite session, while `isBlocking` inspects current per-field drafts. Export uses the format above. The dialog's explicit **Discard local changes and leave** discards only actual draft fields in the captured session (all such fields for this destructive leave), preserving successful fields and making zero default writes, then authorizes only the captured first intent. Pending hook completions cannot restore discarded work after the route changes.

Stay/Escape/export-only retain the actual pane and current values. Sidebar, AppRail, Back/Forward, programmatic and same-turn repeated attempts obey the already accepted first-intent rule, including route/sign-out mutual exclusion. Automatically continue only after **all current latest drafts** are verified saved; one successful account/device sibling must not release navigation with another unsaved field. Account/auth change cancels the old permission, then a new current device draft guard may protect a fresh request. Preserve App's captured scope/auth-generation preflight and original auth behavior.

The host currently hardcodes Smart Lists dialog title/body. Generalize only display metadata through the optional pane capability (for example localized `label`), or use accurate generic Settings-draft wording. Collaborate must not be labelled Smart Lists. Keep metadata free of draft payload/owner identifiers. Preserve Smart Lists' existing behavior and tests; do not fork another intent state machine or modify auth/provider/engine code.

## Exact author ownership

- `packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx`; optional narrow caller-local recovery helper for three-field draft/session/export logic.
- `packages/plugin-web-settings-rest/src/internal/localI18n.ts`, scoped styles and focused existing/new Collaborate tests.
- `packages/plugin-web-settings-shell/src/types.ts` and public type export only if optional display metadata is needed.
- `apps/web/src/routes/modules/composedSettingsRegistration.tsx` only the narrow display-metadata/general Settings wording adaptation, plus focused actual-host participant tests. Accepted routing arbitration should remain unchanged.

No accountOwnership/registry or physical-key migration, shared hooks/engine, App/auth coordinator/network, global reset, timers, Smart Lists persistence/filtering, or production activation. If a confirmed shared API defect prevents an explicit contract case, stop that dependent path and hand over its reproducible public oracle rather than adding an ad hoc raw-write fallback. Existing APIs already preserve device bindings independent of account epoch (`usePrefAsyncBinding` scopeIdentity=device); use that behavior.

## Complete independent acceptance chain

| Area | Minimum business oracle |
| --- | --- |
| All producers / compatibility | Each actual control persists permitted values; absence no seed, valid false preserved, invalid boolean/domain refused with raw unchanged; forged default_share ignored. Parent3667985 false-retention before must pass unchanged. |
| Locking / actual domain | Hold each device key and account/key locks for default_share: pending and no early write, then actual commit. Missing/rejected lock preserves draft. Account migration waits/fences default_share with actual controller; device operations remain independent. No three-key atomicity claim. |
| Latest / partial / errors | Multiple same-turn toggle/select edits, older-success/newer-failure, any one key failing while siblings succeed, retry only failed latest and no duplicate commit. All three private/device statuses truthful. |
| Source / notifications | Invalid/unavailable initial controls expose read-only repair; malformed source not default-written. Clean same/other-document projection; dirty conflict retains latest values. Repair/discard one field preserves another failed draft. |
| Uncertainty | Actual write followed by readback denial retains intended draft; unchanged Retry verifies without second write; external replacement refuses, edited target cannot reuse old token. |
| Mixed scope | Mounted A→B keeps device failed/pending/uncertain drafts and device editing, drops A account draft; old guard/export/discard/retry/sign-out capabilities inert; new current device-only guard usable. B account bytes never receive A values. |
| Export / unload | Full-three-failure exact real Blob and actual disk file, partial-success/device-only schemas, full storage denial, export setup errors, stale boundary zero click. Export preserves unload; current success/discard removes it; initial source errors without edits do not warn. |
| Actual host / App | Real composed pane keeps all latest drafts on departure; Stay/Escape/Export remain; explicit discard leaves first route once with no writes; pending one-field success cannot release others; repeated/same-turn/Back and sign-out/owner cancellation reuse accepted safety. App original5 preflight controls retained. |
| Presentation / regression | Full CSS375/414/768/1024/1440, actual375 view, focus and44px targets. Fixed Settings package/type/lint and Smart host/entry/export controls affected by any label/type change. Native saved checkpoint is separate from unsaved memory. |

Author should run before/after on fixed commits with original failure logs preserved, list each current scope's state and evidence, and provide actual complete-feature behavior rather than only types/default_share. Parent native fixtures and independent reviewer assertions are not author-owned. No need to run unrelated provider/timer/whole-D2 suites when product ownership remains this narrow.

Success accepts Collaborate's three-control current-user persistence, retry/export and ordinary departure recovery. Forced auth removal, process crash, unavailable-storage durable drafts, other callers and global REL-05/REL-09/D2 remain open with explicit limitations. This contract is documentation only, precise commit and no push; it does not claim the implementation is complete.
