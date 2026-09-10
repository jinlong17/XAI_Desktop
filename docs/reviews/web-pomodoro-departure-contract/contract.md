# Pomodoro six-preference current-user departure recovery

Web. Parent main-review architecture and implementation contract, fixed baselinec604951. This is the next caller after complete Collaborate current-user recovery acceptance. The full312-item objective and release/account-sync constraints remain unchanged. Author: Terra implementation; parent independently verifies. No additional user confirmation is needed for this authorized Web recovery work.

## Preserve the complete accepted preference and timer contracts

The six preferences are device-owned, independent physical keys: `xai_pref_pomodoro_preset`, `xai_pref_pomodoro_custom_minutes`, `xai_pref_pomodoro_display_style`, `xai_pref_pomodoro_theme`, `xai_pref_pomodoro_sound`, `xai_pref_pomodoro_muted`. Keep existing JSON codecs, domains, defaults, clamp behavior and six real producers. Preserve Dv2's accepted24 cases, completion2 and all146 original package checks; current package totals may increase but do not combine overlapping suites into a coverage claim. Preserve source repair/conflict filtering and unchanged uncertain Retry token semantics.

`xai_pomodoro_active` and `xai_pomodoro_sessions` are account-owned timer state/history. They are not preferences and are not migrated/reset/exported/discarded by this work. A running timer alone must not trigger this preference departure dialog. Appearance, mute, leaving/staying, exporting, preference Retry and draft discard must not reset/duplicate/settle the active timer or its completed history. Timer completion's existing explicit next-preset update can create an unsaved preference intent; preserve the accepted completion-once behavior and treat that actual submitted intent truthfully.

Parent baseline in `../web-pomodoro-departure-independent/` exercises all six real controls and the actual app registration. Eight assertions fail: six unload cases, route departure and App sign-out preflight; the clean control passes. Retain these tests and failed log unchanged as business oracles. They do not invalidate the previously accepted storage slice.

## Draft tracking and recovery capability

Track real submitted latest preference drafts independently for all six fields, starting only on a valid explicit preference change (including an existing explicit completion-driven next preset). Initial absence, source errors, displayed defaults and clean mount are not drafts. Successful matching latest operations clear only their own draft; equal-value predecessor success must not clear a newer failed intent. Retry retains the original operation/token and draft identity, and must not resubmit saved siblings. Targeted read/discard clears only affected current draft fields; source-only read repair remains available without warning/dirty fabrication.

Use the existing accepted async hooks and their Promise results. Do not raw-write, introduce multi-key atomicity, change shared engine semantics or turn Save success into a memory overlay. Preserve six-field selection/state behavior and existing accessible controls.

While mounted, A→B or locked account keeps device preferences, failures, pending work and uncertainty tokens usable. Revoke the old combined departure/export/discard permission using an account-epoch decision token, while preserving device drafts. Fresh current device-only decisions are allowed. Old callbacks must independently refuse after account epoch or disposal; a host pre-check alone is insufficient. Callback identity must be stable enough not to cause guard-registration/render feedback loops.

## Export and unloading

Keep the accepted filename `pomodoro-preferences.json`, version1, kind `pomodoro-preference-draft`, and complete six-value `values` object with existing names `preset`, `customMinutes`, `displayStyle`, `theme`, `sound`, `muted`. It is a current preference snapshot recovery file, not Collaborate's sparse schema or an account/timer export. Preserve original24/native disk assertions. Do not change the format merely for implementation reuse.

Export is available for actual pending/failed/conflict/uncertain drafts and works from memory under full storage get/set denial. Validate all six current values. No raw account keys, user IDs, timer/history records or secrets. Scope token checks before and at the real download boundary; URL setup owner change cancels old export without click. Blob/URL/append/click failures show a separate localized export error and preserve latest choices, original save errors and departure guard. Clean up anchor/URL best-effort. Export does not navigate, mark Saved, discard or write preferences.

Register beforeunload only for actual current draft(s), including pending and device drafts surviving an epoch. Matching success/all-current-draft discard clears it; export does not. No storage access or export during unload. This is a browser warning, not crash durability.

## Actual Web host architecture

Pomodoro is a top-level Web module, not a Settings pane. Do not insert a Settings-only wrapper into the plugin or clone a second divergent navigation arbitration state machine.

Extract the already accepted composed Settings first-intent/departure mechanics into a **host-owned reusable coordinator/hook/component under apps/web/src/routes/modules**. Reuse it from Composed Settings and an app-owned Pomodoro route adapter. Preserve all existing behavior, router options/fromRouteId/numeric POP/history/cleanup, same-turn reservation, sign-out mutual exclusion, scope cancellation and focus handling. This is a mechanical reuse plus a second participant, not a rewrite of routing/auth semantics. Original Smart host10/entry3/wrapper5/export8/App5 are mandatory regression gates.

Keep plugin-to-host dependency direction: Pomodoro may expose an optional public registration callback/capability in its own props/types; it must not import app files or Settings internals. A small structurally typed capability is acceptable; no new runtime dependency on Settings shell. The app adapter obtains language from WebShell and passes the registration callback to the public Pomodoro component. Preserve actual app registration, feature-disabled fallback, route paths, wildcards, rail order and public standalone component compatibility.

Generalize the existing sign-out delegate naming/interface with compatibility exports as necessary so both current Settings and Pomodoro participants use **one current coordinator**. Preserve App's captured scope/auth-generation preflight and sign-out behavior. No authentication/provider rewrite or second overlapping sign-out prompt. Changing names must not break old requestSettingsDeparture test seams without a reviewed compatibility bridge.

The decision dialog must be correctly labelled Pomodoro preferences, localized, keyboard accessible, focused/trapped, Escape/Stay returns focus and keeps all drafts. Export stays. Explicit discard-and-leave discards only actual preference draft fields and replays exactly the captured first route/sign-out once, without timer writes. Automatically continue only when all current latest preference drafts have verified success. One sibling success cannot release remaining failure; account epoch cancels old permission while fresh device guard remains active.

## Implementation ownership

- `packages/plugin-web-pomodoro/src/PomodoroModule.tsx`, optional narrow preference recovery helper, public optional props/types/export and focused tests, scoped styles/local copy as necessary.
- `apps/web/src/routes/modules/`: reusable host departure mechanism, Pomodoro adapter, narrow Composed Settings extraction and shell registration wiring; compatibility delegate exports and their focused tests.
- App.tsx only if a generic delegate import name requires a semantic-preserving adjustment. Its auth/captured-generation logic is frozen.
- Public API documentation when adding optional props; no storage/ownership/registry/timer-engine/session-schema changes, no global reset, deployment or cross-module sync activation.
- Parent reviewer dirs/tests/native evidence/ledgers are not author-owned. Inspect git status/log first and commit exact owned files only.

If extraction reveals a real shared routing/engine defect, reproduce a public oracle and report it before altering its contract. Do not weaken existing correct assertions to get a second participant green.

## Complete independent acceptance

1. Original six-field24, timer completion2 and package/type gates; full CSS and original recovery cases retained.
2. All six actual failed/pending drafts warn; clean/invalid-source-only mounts do not; owner transition keeps device work and revokes old permission.
3. Real production registration route/AppRail/Back/Forward/programmatic/same-turn and sign-out-first/route-first; clean control; one success vs remaining failure; old success/new same-value failure; current all-success releases first intent only; unmount restores router/delegate.
4. Actual disk export/full storage denial, preserved six-value schema, setup/click cleanup, old epoch boundary; export/unload/Retry/discard lifetimes.
5. Real Chrome complete CSS at375/414/768/1024/1440, English/Chinese recovery and375 dialog,44px targets/no horizontal overflow/focus, no React Runtime loop/error.
6. Existing Smart/Collaborate host/contract/App regressions, Settings and Pomodoro type/lint gates after extraction. No unrelated provider suites required.

Accept only the complete six-preference current-user recovery slice. Crash/forced-auth durability and complete timer service/deployment guarantees remain in their existing audit items. The parent must reconcile every area above before moving on; authors cannot self-accept or close numbered items.
