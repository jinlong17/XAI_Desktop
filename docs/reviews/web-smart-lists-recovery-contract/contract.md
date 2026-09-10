# Smart Lists remaining recovery and departure contract

Astra, Web, 2026-09-09. Read-only design on **a663891** / product **40ffbe1**, after the [39-case storage caller acceptance](../web-d2-smart-lists-astra/review-40ffbe1.md). That acceptance remains valid. **Terra may implement this next bounded batch**, including the host seams explicitly listed below; no new user approval, new Save footer, shared-storage change or rollout activation is needed.

The original [audit TODO](../20260908-full-product-audit/TODO.md:69) requires REL-05 failed persistence to retain drafts and expose Not saved, Retry and Export. REL-09 separately requires recoverable unsubmitted content beyond blur/beforeunload. The prior caller contract intentionally did not add export; it therefore did not finish these broader recovery obligations. This contract closes that omission for Smart Lists' user-controlled recovery/departure paths without pretending a browser warning guarantees durable crash recovery.

## Confirmed live route and lifecycle boundaries

| Actual source | Consequence |
| --- | --- |
| `apps/web/src/routes/router.tsx:89` | Production uses `createBrowserRouter` (data router). Installed `react-router` exposes `useBlocker` with a transition predicate; no new router dependency or router replacement is necessary. |
| `apps/web/src/routes/modules/composedSettingsRegistration.tsx:49–114` | This is the live composed Settings module. Its sidebar currently calls `setActive(next)` **before** `navigate`, and `activePane.render({lang})` replaces the Smart Lists component. A router blocker alone would otherwise run after the local pane has already disappeared. |
| `packages/plugin-web-settings-shell/src/SettingsModule.tsx` and `internal/SettingsDetail.tsx` | Similar package chassis/placeholder chain exists, but it is not the production composed Smart Lists route. Testing only this placeholder does not prove live protection. SET-01's duplication remains separate. |
| `packages/xai-web-shell/src/Shell.tsx:31–54` | AppRail, Topbar and avatar navigation use router navigation; Back/Forward and programmatic host navigation also pass through the data router. A route-level blocker can cover them without editing every button. Settings is not a standalone modal with a separate close callback here. |
| `apps/web/src/App.tsx:189–209` | Confirmed voluntary Sign Out calls `invalidateAccountIdentity(null)` before auth work/hard redirect. That can unmount/private-mask the pane **before any route blocker runs**. A preflight is needed before identity invalidation, not after auth completion. |
| `apps/web/src/routes/RouteGateElements.tsx` | Auth gates can replace the outlet due to external session loss, independently of an ordinary user route transition. A routing prompt cannot guarantee recovery across this forced security transition. |
| `packages/plugin-web-settings-shell/src/types.ts` | `PaneRenderProps` currently carries only `lang`. Add a narrow optional departure-registration capability; do not import a host/internal module from the settings package. |

## User behavior and current-draft definition

Move existing Saving/Saved/recovery immediately below the Smart Lists title, before the twelve row groups. Keep handlers, labels and the accepted absolute-map persistence protocol. At 375×812 a first-row fault must show Not saved, Retry and Export without scrolling to y912. Recovery actions wrap, retain 44px minimum targets and keyboard focus indication; inspect with the actual module stylesheet.

Maintain a session-bound **actual user draft** indicator, distinct from `meta.error`. It becomes dirty on an accepted known-row user edit, stays dirty while its current combined map is pending/failed/conflicted, and clears only when that latest map is verified saved or explicitly discarded. A source-error/default fallback on initial mount is not itself a user draft. A previous successful operation must not clear a newer one; export must never clear it. Owner/session change disposes the old indicator with the existing private UI state.

Existing Retry uses the original accepted hook operation/baseline/token. Existing Reload/Discard remains a read-only explicit whole-map choice. Add Export only for a valid current-owner user draft, including pending/readback-uncertain or source-unavailable-after-edit recovery. An invalid source may retain source-repair controls without offering a fabricated `{}` draft. No implicit reseed, overwrite, broad reset, export of a different account, raw-source backup or Tasks filter wiring is introduced.

## Exact export contract

**Filename:** `smart-lists-draft.json`.

**Payload:**

```json
{"version":1,"kind":"smart-lists-draft","values":{"all":"hide","today":"if-not-empty","extension":"future-value"}}
```

`values` is the latest complete user-intended map, preserving every own known/unknown string field, including inert prototype-named data. It is not the persisted map, an earlier attempt, a fallback display, a diff or an envelope. Do not include provider credentials, physical keys, another owner's content or unrelated settings. Account binding is enforced by the live capability, not by adding sensitive account metadata to the file. This format has no import/replay authorization.

- Generate a real `Blob` with JSON content and a temporary object URL; use an actual anchor download. Capture the snapshot synchronously from the session's latest map, validating it with the existing Smart Lists validator. No background export or automatic download.
- Pure draft export must work when localStorage **reads and writes are unavailable**. It must not read persisted source or require `accountScope.physicalKey/assertCurrent` as a precondition, since those paths can read storage. For this memory-only operation, compare the captured active account/demo scope to `accountScope.capture()` (same live scope object/epoch, owner and kind); refuse locked/stale scope. This is export of the currently authorized in-memory draft, not authority to mutate or delete a generation. Do not relax any persistence checks.
- Recheck that capability at the download boundary, and after any introduced async wait. An old A callback after B/locked, including a queued export completion, cannot create/click a usable download of A data. If a URL was created before invalidation, revoke it without clicking. Never rebind the old snapshot to the new scope.
- Catch serialization, Blob, createObjectURL and anchor setup/click exceptions. Show a separate localized export failure while retaining all selected values, the original save error, Retry and departure guard. Do not label an initiated browser download as Saved or claim JavaScript has confirmed disk durability. Parent native tests will verify actual downloaded bytes on disk independently.
- Revoke URLs and remove temporary anchors with cleanup. Cleanup failure after a download request must not silently clear the draft or relabel the preference saved. Double export does not affect preference write counts; the user can explicitly request another copy.
- Export stays in the pane/dialog. Do not make exporting automatically discard or navigate; users can inspect the file and then separately choose to leave.

## Browser unloading

Register a `beforeunload` handler only while a current-owner actual draft is unsaved. It uses current refs/capability, calls `preventDefault` and sets `returnValue` according to the browser API. No async save, Blob export or new write is attempted in that handler. Pending, failed, conflict and uncertain states are included; initial clean/invalid-source-without-edits are not. Success of the current draft or explicit discard removes the warning; export alone does not. Stale-account callbacks neither warn on B's behalf nor export A.

This is a browser-provided warning, subject to user interaction/mobile/browser restrictions. It is **not** durable storage, a process-crash guarantee or in-app navigation protection.

## In-app protection: keep the actual pane mounted until departure is resolved

Use the real host data-router blocker plus a narrow typed pane capability. Exact factoring can vary; the following semantics are mandatory:

1. Extend `PaneRenderProps` with an **optional registration callback** for a live departure guard. Its descriptor contains an instance/session token, current blocking state, a synchronous current-owner check, and current `exportDraft`/`discardDraft` callbacks. It need not expose raw map data to the host. Registration returns an unsubscribe tied to that token; old effect cleanup cannot remove a successor registration. Update the host when pending/dirty/saved/owner state changes, with stable callbacks or refs to avoid a registration-render loop. Standalone pane renders remain usable without a router/provider.
2. The production composed host supplies that capability to `activePane.render`. Keep exactly one live active-pane guard; nonparticipating panes ignore the optional property. Its `useBlocker` predicate queries current ownership and unsaved state when navigation is attempted. Do not install an unconditional blocking handler for every Settings pane.
3. **Remove the sidebar's speculative `setActive` transition**. Derive the rendered pane from the committed URL, or otherwise ensure local state changes only after a permitted router transition commits. A blocked sidebar click, Back/Forward, AppRail click or programmatic route attempt must leave the existing Smart Lists component and exact draft mounted. URL and highlighted pane remain consistent. Same-pane query/hash changes that do not unmount its draft need not prompt.
4. On blocked departure, present an accessible localized dialog near the active pane: **Stay**, **Export current draft**, **Discard local changes and leave**. Stay cancels the queued navigation; Export uses the same validated capability and keeps the prompt open; Discard invalidates pending local work through the accepted reload/dispose semantics, then allows the original requested route exactly once. It does not write defaults or claim save success. Use keyboard dismissal/focus return; Escape means Stay.
5. A queued save may finish while the dialog is open. Automatically continue the already-requested navigation only when the *current latest map* is genuinely saved and no newer draft remains, or after explicit discard. A previous operation's completion, successful export or source reload that leaves a new draft must not release the blocker. If the owner changes, close the private prompt and revoke its capability without applying an old deferred action to the new account.
6. Coalesce/reject repeated departure attempts while one decision is active; do not overwrite a captured route with a later destination silently, open duplicate dialogs, or resolve another operation's deferred Promise. Keep an explicit intent/session token. Once Stay resolves, a later new navigation gets a fresh decision. Once leaving disposes the pane, no old completion may reopen its prompt or publish another owner's error.

No in-memory cross-route cache or new persisted draft key is needed for these normal routes: the component remains mounted until Saved, Stay or an explicitly destructive leave decision. This is a genuine in-app preservation mechanism beyond `beforeunload`; it deliberately does not promise the discarded map will return when the user revisits.

## Voluntary sign-out preflight and forced account changes

Route blocking cannot protect `App.handleSignOut` before it invalidates account identity. Add a small **host-owned departure delegate** that the composed Settings route registers while mounted. The same dialog/guard resolves a programmatic `requestDeparture("sign-out")`; this delegate carries no draft payload. Its token-bound unregister and owner checks follow the rules above. An absent/nonblocking guard returns permission immediately; a disposed/stale in-flight request cancels rather than authorizing a different account's action.

At the start of `handleSignOut`, capture the current account scope and, when present, the coordinator's `{owner,generation}`. Await that preflight **before** `invalidateAccountIdentity`, `coordinator.signOut`, direct `client.auth.signOut`, session clearing or hard redirect. Stay/export-only must perform none of those operations. After permission, recheck the captured identity/scope before invalidation; do not invalidate B and hope the later coordinator rejects stale A. Compare coordinator owner/generation by value (its `capture()` returns a fresh object); pass the original captured generation into the existing fenced `signOut`. Preserve existing sign-out error/result behavior and apply this captured-scope preflight to the fallback branch too; do not imply the old fallback already had that guard. This is not an auth/coordinator rewrite or a lock held across a user dialog/network call.

The existing AvatarMenu sign-out confirmation remains its intentional-action confirmation; do not change that shared component merely to install this Smart Lists recovery preflight. A later global unified confirmation is a separate UX decision.

Remote session revocation, forced identity reset, auth-gate removal, browser/process crash and killed tabs cannot always be postponed by a private-content UI. Privacy wins: hide/dispose A immediately, forbid its stale exports/actions and do not block a security transition or write the draft into B. Universal recovery through those events requires an independently designed durable account-bound draft repository that remains available under the relevant fault; unavailable storage cannot supply such a guarantee by assertion. Those limitations remain explicitly open under REL-09, not reported as solved by this prompt or by a volatile map cache.

## Minimal expanded implementation ownership

| Files | Allowed change |
| --- | --- |
| `packages/plugin-web-settings-rest/src/panes/smartListsPane.tsx`; narrow `internal/smartListsDraftRecovery.ts` if useful | Position feedback; current-draft/export/unload logic; optional departure capability registration. Reuse accepted persistence handler, validator and meta functions. |
| `packages/plugin-web-settings-rest/src/internal/localI18n.ts`, scoped `styles.css`, focused tests | Export/leave/error wording, keyboard and responsive recovery, actual Blob and stale-owner tests. |
| `packages/plugin-web-settings-shell/src/types.ts`, `src/index.ts` | Optional typed pane departure capability and type export only. No global reset, placeholder-pane migration or data-store ownership change. |
| `apps/web/src/routes/modules/composedSettingsRegistration.tsx` | Supply capability, guard real navigation, render decision dialog, derive active pane from committed URL. Preserve deep links and browser history. |
| New narrow host helper, e.g. `apps/web/src/routes/modules/settingsDeparture.ts` / hook | Token-bound current route delegate, one decision flow for route and sign-out, cleanup and stale-identity refusal. Avoid a generic global draft store or stringly-typed event channel. |
| `apps/web/src/App.tsx` | Only the captured-identity departure preflight at the existing voluntary sign-out boundary; preserve existing sign-out operations/results. |
| Corresponding package and actual host route/App tests | Real composed registration + data router, host voluntary logout spies/real coordinator boundaries, existing route/Settings tests with honest async fixtures. |

No modifications to prefMutation/usePrefAsync engine, physical key formats, account ownership, providers/auth coordinator implementation, timers, Tasks selector, other product callers, canonical receipts, global Reset or activation. The duplicate package `SettingsModule` is not a substitute implementation target: it does not host the actual composed Smart Lists pane. Keep SET-01 unification and SET-06 selector wiring explicitly separate.

## Independent acceptance and completion

Parent **07bf394** preserves fixed40ffbe1 actual [download/unload before](../web-d2-smart-lists-draft-native/review.md): missing actual export control FAIL and cancelable beforeunload protection FAIL. Its [real composed-host before](../web-d2-smart-lists-host-native/review.md) uses the actual registration, data router and WebShellProvider: Notifications navigation leaves the dirty Smart pane, and returning shows the stored fallback instead of the failed draft. That is a third correct FAIL. These do not revoke the original39 persistence acceptance. The parent host probe's after-preconditions (remain on Smart plus dialog) do not yet cover Stay/Export/Discard/Back/sign-out; the full independent chain below must add those real operations.

- Retain a663891's original39 and Settings286/type evidence. Rerun the unchanged39 and affected package/host route/App tests on the fixed successor. Do not repurpose raw-set fixtures as user actions.
- Real Blob and actual browser disk file must match the exact filename/payload with the latest two-row failed map and unknown/prototype extension data. Physical bytes remain unchanged. Test quota plus read+write-unavailable after a real user draft, export setup failure, pending/uncertain draft and stale A/locked callback with zero download. Export never changes Saved/Retry/guard state.
- Browser beforeunload: clean false; actual unsaved pending/error/conflict true; verified latest save/discard false; export alone still true; invalid mount with no edit false. Native browser warning evidence is distinct from synthetic event tests and process persistence.
- **Actual composed host** with data router and WebShellProvider: failure → sidebar next-pane click / AppRail route / browser Back / programmatic departure keeps current path/pane/latest map and shows the dialog. Stay/Escape preserve, export produces current file without leaving, explicit discard goes once to the originally requested target without a storage write. Repeat actions and completion/new-edit races cannot switch session or destination.
- Actual `App.handleSignOut` integration: while Smart is dirty, Stay causes zero invalidation/auth/session-clear/redirect calls; explicit discard permits the existing sequence once. A→B or newer auth generation during the decision rejects old permission and cannot sign out or invalidate B. No private draft content appears in the host dialog for a stale owner.
- Render complete styles at 375×812 and wider viewports: first-row failure and its actions visible/readable, minimum targets and no horizontal overflow. Check focus and keyboard dialog behavior. Parent prepares native before evidence separately; neither placeholder Settings nor CSS-free screenshots prove these cases.
- After the above pass, accept Smart Lists **current-owner draft export and user-controlled departure recovery**, while keeping forced revocation/crash durability, all other callers' recovery and whole REL-09 open. This does not activate D2 or close REL-05 globally.

## Keeping the full backlog visible

Future caller acceptance must report separate columns for: truthful async commit; current latest draft + Retry; actual draft Export under the fault; source/conflict recovery; browser unload; ordinary in-app/voluntary identity departure; forced-loss/durable limitations; fixed component/native evidence. A green storage column is not all REL-05/09.

Smart Lists fills its previously absent export/departure columns in this batch. Collaborate's earlier bounded account setting conversion did not add export or departure protection; it remains an explicit later participant. Pomodoro six choices already have actual disk export/retry evidence, but its earlier device contract excluded a new unload/navigation guard; do not infer those columns are green. Dashboard note/offset have their own export/beforeunload evidence, but any untested AppRail/host-unmount protection remains separately recorded. Remaining legacy `usePref`, direct/scoped business and secret writers retain the D2 inventory; they neither inherit caller recovery automatically nor require a duplicate generic rewrite here.

The host delegate/typed seam can support those future active-pane participants once their own state/session contracts are reviewed. It does not auto-enroll or claim acceptance for them. Parent ledger updates should name each missing column and next concrete participant rather than relabeling a narrower D2 conversion as completed REL-05. No ledger or product is changed by this architecture document; exact documentation commit only, no push.
