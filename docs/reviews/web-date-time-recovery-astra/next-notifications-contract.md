# Next complete caller: Settings Notifications recovery

Astra, Web module, fixed product baseline `d9d9fdde211e19fc258f97e7184a8ee77338d80c`, following complete DateTime acceptance in `acceptance-d9d9fdd.md`. This is the next full caller contract for parent-ordered implementation, not a product PASS or a new full312 objective. Parent remains the lead; Terra implements, Sol independently freezes/runs caller assertions, parent verifies actual Settings/Shell/native, Astra accepts requirements and every correct failure. Use generic bounded agents, not an incidental Workflow V2 template. Do not start overlapping later callers.

## Complete source inventory and product boundary

The implementation unit is **all eight live bindings and handlers** in `packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx`, including the two conditionally visible quiet-time inputs and the actual composed Settings departure bridge. The current source uses eight direct `usePref` calls with void setter casts, five switches, one five-option select, and two `type=time` inputs. Quiet controls time-input visibility only; enabled does not currently disable or erase subordinate controls. Preserve that behavior. The current nine product tests NF1–NF9 establish rendering/locales/visibility/two normal persistence paths/registration, not complete recovery.

Physical owner is explicitly device in `plugin-web-storage/src/internal/accountOwnership.ts`; defaults/codecs come from `registry.ts`. Every physical key equals the logical key below, unscoped, schemaVersion1. Registry package owner metadata is not account ownership.

| Export field / control | Exact logical and physical key | Accepted value / existing default / codec |
| --- | --- | --- |
| `enabled` / Enable notifications | `xai_pref_notif_enabled` | Strict boolean; true; boolean. |
| `done_sound` / Sound | `xai_pref_notif_done_sound` | Exactly none, subtle, chime, bell, pop in that option order; subtle; raw string. |
| `push_task` / Task due | `xai_pref_notif_push_task` | Strict boolean; true; boolean. |
| `push_pomo` / Pomodoro complete | `xai_pref_notif_push_pomo` | Strict boolean; true; boolean. |
| `push_habit` / Habit reminder | `xai_pref_notif_push_habit` | Strict boolean; false; boolean. |
| `quiet` / Enable quiet hours | `xai_pref_notif_quiet` | Strict boolean; false; boolean. |
| `quiet_start` / Quiet hours start | `xai_pref_notif_quiet_start` | Exactly valid zero-padded 24-hour HH:mm, 00:00–23:59; 22:00; raw string. |
| `quiet_end` / Quiet hours end | `xai_pref_notif_quiet_end` | Same HH:mm domain; 07:00; raw string. |

The time domain follows the existing minute-based native controls/defaults; validate runtime raw source and user input, not only the storage string codec. Reject empty/malformed DOM edits as invalid input, preserve the latest valid displayed value/draft and give localized feedback; do not persist empty/default as a substitute, silently normalize arbitrary source, or export invalid text as a valid setting. Overnight ranges remain legal (existing default22:00→07:00). Equal endpoints remain legal stored preferences; this work defines no new scheduler meaning or start<end constraint.

This batch completes **preference persistence/recovery for existing controls**. Current literal-key search locates these keys in this pane, registry and ownership; the pane does not call permission, push, audio or scheduler APIs. This is not evidence of actual notification delivery. No Notification.requestPermission, service-worker push registration, new sound playback, Tasks/Pomodoro/Habit wiring, DND scheduling, native notification permission, timezone conversion, network service or account conversion is added or accepted here. Those retain separate product obligations. Preserve pane id notifications, icon bell, locale title, sidebar position, EN/ZH labels, existing descriptions and immediate autosave interaction without a Save footer.

The refreshed direct-hook inventory at611062e is28TSX/80bindings/60setters/20readers; it is a scheduling subset only. It excludes wrappers, indirect/raw/ordinary/timer/secret/non-TSX/non-localStorage writers. Do not turn conversion of these eight rows into a D2 completion percentage or erase the categories in `../web-date-time-recovery-contract/remaining-writers.md`.

## Persistence and exact operation ownership

Use the accepted `usePrefAutosaveAsync` family with strict per-field validators and actual async results. Preserve the shared hook/engine's physical-key locks, baseline/readback, nonempty-token verification, empty-token refusal, queued/coalesced behavior and no-token/functional compatibility. No second effect/raw persistence path, silent Promise change to legacy APIs, caller preflight, forced rebase, alias migration or dual write.

1. Valid/absent mount and rerender perform zero set/remove. Absent alone may display defaults. Invalid/unavailable sources stay field-labelled and Reload-only, with no seeded defaults, fake drafts/export or host/unload block. Include hidden invalid/unavailable time sources while quiet=false; surface source health even when the input is hidden.
2. Every valid change creates a field/session/operation identity before enqueueing, displays immediately and collects successors while a real key lock holds. All five toggles invert latest intent, including two clicks before React or persistence completion. All five sound values and boundary/midnight/overnight times have normal positive controls.
3. Only matching latest operation success clears that draft. Same-value success from an older operation, older failure, queued/coalesced predecessor and obsolete callbacks cannot clear/recreate latest work. Cover both legal queue failures: predecessor succeeds/latest fails, and predecessor fails/latest remains queued. Pending Retry is inert/idempotent; settled failed predecessor Retry may advance the queue without acknowledging the latest draft. Retry recovery may fail repeatedly, then succeed; repeated clicks must not duplicate operations. Latest edit's own Promise remains its completion authority.
4. Quota/security denial, named-lock absent/rejection, external conflict and uncertain readback retain exact latest values and accurate feedback. Unchanged uncertainty Retry retains its grant across temporary denied read/lock, verifies with one total write and one reconciliation notice. External replaced bytes remain preserved after Retry, including original-baseline restoration; new input is distinct authority, never a silent rebase of unchanged Retry.
5. Every key settles independently; success cannot retry/rewrite a sibling. Cover boolean/select/time mixed failures in both directions, multiple/all-eight pending and conflict plus unrelated quota. Global Saved appears only with no actual drafts, pending operations or unresolved source/field errors. Preserve a healthy all-clean Saved control and Saved after a sibling succeeded while a source-only field was independently repaired.

## Conditional quiet-time work is still current work

Input visibility is not draft ownership. When quiet's latest intent becomes false, the two time inputs may disappear as before, but any pending/failed time drafts remain visible in field-labelled recovery, exportable, retryable/discardable and host/unload blocking. Persisting quiet=false never discards or retries start/end. Re-enabling quiet displays their latest retained values. Disabling enabled must likewise preserve all independent subordinate work.

Required business sequence: enable quiet, edit both times under independent failures/locks, disable quiet successfully, verify hidden latest times still export and block departure; targeted Retry/discard only affects the chosen field; re-enable quiet and verify surviving latest time values; all-clean only after each actual draft succeeds or is explicitly discarded. Include quiet failing while times succeed and a failed quiet toggle that exposes/hides controls according to its immediate latest intent. Conditional unmount of the inputs must not dispose the pane's field operations.

## Targeted recovery and export

Offer localized field-labelled Retry, explicit Discard/reload, and source-only Reload. Source Reload qualifies at callback invocation as well as render: it cannot reset the same field's actual draft or acknowledge repaired bytes as that draft. It rereads only its field and leaves unrelated work intact. Per-field discard detaches that draft before calling safe meta.reload; all-discard includes only actual drafts, including hidden times. Both have zero set/remove and no unrelated field rereads. Late pending completions after discard/reload/unmount cannot revive obsolete state or clear later edits.

Provide one current-draft download named `notifications-draft.json`, exact envelope:

```json
{"version":1,"kind":"notifications-draft","values":{"device":{"enabled":false,"done_sound":"chime","push_task":false,"push_pomo":false,"push_habit":true,"quiet":true,"quiet_start":"23:15","quiet_end":"06:30"}}}
```

The example is all-eight actual drafts; ordinary exports are sparse and contain exactly current unresolved fields, including hidden time drafts. No saved/default/source-only fields, account envelope/data, permissions, tokens or secrets. Validate every emitted field. No empty download or import/cloud-backup feature. Export reads only captured permitted memory and works while every Storage get/set throws, including pending locks. Disk bytes in native Chrome must match sparse/all-eight/hidden-time snapshots exactly. Export and Stay retain drafts/errors/tokens/guard and never imply Saved or navigation.

Check live scope/disposal permission before setup and just before click; synchronous epoch/unmount inside Blob, URL creation or append cancels obsolete click. Blob/URL/append/click failures show a separate localized export error while retaining recovery; cleanup anchor/URL best-effort even after late setup failure. Old guard and same-turn inline capabilities refuse, fresh current/locked export remains a positive control.

## Device lifetime, host and native presentation

All eight device operations survive A→B, no-account/locked and same-account epoch changes, including real held writes and hidden time drafts. No account physical keys, markers/tombstones, account lock or account export are introduced; an unrelated held account lock cannot block these keys. The host permission is separate: epoch invalidates old token and cancels old route/signout, every old isCurrent/isBlocking/export/discard checks live scope/disposal before rerender, and fresh locked permission protects surviving device work. Unmount removes guard/listener and detaches callbacks. Beforeunload only warns synchronously for actual current work and writes nothing; no crash/forced-auth durability claim.

Wire the optional `PaneRenderProps.registerDepartureGuard` through the actual notificationsPane.render while retaining standalone render({lang}) compatibility. Use accepted composed Settings/coordinator; do not duplicate router/signout state or edit shared auth/coordinator to make this pane pass. Test actual sidebar, exposed close/back, AppRail/programmatic module navigation, numeric history Back/Forward and relative navigation, voluntary signout. First same-turn intent stays held without URL/history/pane mutation; all latest clean may release once, partial/newer/hidden work keeps it held. Stay/Escape/export retain intent protection. Current-all discard then leave releases exactly once; epoch cancels the old intent.

Participant title Notifications/通知 and each hidden time recovery label remain understandable. Preserve keyboard native time/select/toggle access, focus trap/Escape return and accessible alert/status feedback. EN/ZH at375/414/768/1024/1440: all eight controls reachable when quiet=true, hidden recovery reachable when false, no overflow/overlap/covered controls. Recovery actions/dialog375 targets≥44px, actual hit/click and containment checks plus manual screenshots. Use scoped CSS; avoid repeating the global Toggle track stretch found in DateTime. Body scrolling is permitted, unreachable controls are not.

## Ownership, before oracles and complete acceptance

Terra may edit notificationsPane, a narrow local helper if needed, this pane's tests/locale/API documentation and scoped recovery CSS. Existing DateTime/Header/Pomodoro/Collaborate/Smart callers, shared storage/registry/ownership, Settings/coordinator/auth, lifecycle/deletion and reviewer evidence are protected. A demonstrated shared defect requires its own correct before oracle and Astra impact review before any foundation edit. Do not extract a generic recovery framework incidentally.

Sol and parent freeze correct **business** before assertions atd9d9fdd using the unchanged pane and actual storage/hooks/host. Preserve NF1–NF9 semantics (await async completion where necessary); include normal native controls first so malformed native input/setup failures are excluded from product FAIL counts. Each of eight fields needs latest-choice failure before evidence; expose time fields via real quiet toggle and account for its separately successful write. Freeze hidden-time recovery/host/export failures before implementation, then rerun unchanged at a fixed product archive. No product-hook mocks or injected private state as proof.

| Required gate | Full scope |
| --- | --- |
| Caller correctness | All eight domain/default/codec/owner/normal/absent/invalid/unavailable/pending/failure/Retry cases; strict malformed/incomplete time handling; NF1–NF9 preserved. |
| Attribution/recovery | Same-value and both queue-failure directions; duplicate and repeatedly failing Retry; no false Saved; uncertainty/no-overwrite/temporary denial; mixed/targeted zero-write/sibling no-read; hidden time retain/reveal/retry/export/discard. |
| Owner/export | Actual device key locks through A→B→locked; old/current permissions and disposal; full Storage denial; sparse/all-eight/hidden disk JSON; setup/click failure and epoch cleanup positives. |
| Real host/native | Complete Settings/Shell producer/first-intent/partial/latest/epoch matrix, native select/time/switch inputs, physical save/new-document reload, source-only/nonblocking and all-clean positive, native failures/locks/uncertainty, EN/ZH five widths/focus/hit/screenshots. |
| Final regression | Settings-rest package/types/lint, Web types/lint and actual composition/host. Regress DateTime caller7 plus Sol/host when its seam is affected. Reuse accepted shared/other-caller evidence only after proving their source/dependencies unchanged; rerun any material shared delta. |

Astra accepts the complete mounted-session Notifications caller only after all correct failures reconcile with the complete current source and fixed independent evidence. Acceptance does not close notification delivery, all Settings controls, D2/REL/AI or the full312 audit. Parent chooses the subsequent full caller only after this unit is accepted; remaining writers and releases stay under their existing boundaries.
