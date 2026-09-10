# Dashboard Header current-user departure recovery

Astra main review, Web, 2026-09-10. Generic implementation contract for the next complete caller after Pomodoro acceptance `051212a`; fixed product baseline `2962b49bd63fa351a2c17b406456ea1b987eca8f`. This document specifies work and acceptance, not an implemented or verified Header host capability. Parent retains the full 312-item objective and numbered-item ledger. Terra implements; Sol/parent independently verify; Astra reviews complete acceptance. No deployment, sync activation or user confirmation is introduced.

## Complete caller and protected accepted behavior

The visible Header is one user flow with **two independent fields**:

- Account-owned note: registered `dashboard_header_note`, physical key resolved from `xai_pref_dashboard_header_note` and captured account context, existing string codec/default empty string.
- Device-owned horizontal position: `dashboard_header_note_x`, unscoped physical `xai_pref_dashboard_header_note_x`, finite JSON number/default zero, existing gesture/resize presentation clamp.

Preserve the complete account caller accepted at `d129950` (`../web-d2-dashboard-note-astra/review-d129950.md`) and complete device Dv1 accepted at `830dd2b` (`../web-d2-device-offset-astra/review-830dd2b.md`). Those behaviors are already implemented and independently accepted; they are regression dependencies, not missing requirements to reopen from scratch. The present work adds complete mounted-session host recovery around them.

Keep note Save/Enter/blur, explicit string Clear, normalization/120-character behavior, editable pending state, duplicate submit suppression, frozen edit-session raw baseline, latest sequence attribution, conflict refusal, unchanged uncertainty-token Retry, changed-intent normalization, Escape semantics and fresh-source reopening. Keep account absence read-only, masking, old callback refusal and physical A/B isolation. A previous successful operation cannot close newer text or claim it Saved merely because it has an equal value.

Keep explicit pointer movement, greater-than-3px movement threshold, moved pointer-up/cancel persistence, no-move no-write, post-drag click suppression, active unfinished gesture protection, overlapping gesture/baseline succession, actual device-key lock admission, A→B→locked device independence, latest quota recovery, one-write uncertainty retry, external replacement refusal, read-only source repair and ignored old completion after Reload. Resize remains presentation-only and preserves desired coordinates; no default/normalization seed or account-key conversion.

Keep note/position writes independent. Recovery cannot write, remove, reset, normalize or rebase a successful sibling merely to clear a combined warning. Do not modify the shared async engine/hooks, ownership registry, account-generation protocol, existing Dashboard order/grid/widget persistence, timer state, account sync, App authentication, provider calls or deployment. Keep existing header greeting/date, Add Widget, widget catalog and Dashboard layout behavior.

## Draft truth and current recovery actions

Track actual user intent separately from source/read health:

- Note: changed editor text before submission, submitted Clear/Save/Enter/blur and its latest pending/failed/conflict/uncertain operation are actual note work. Opening a clean editor/session or an unavailable-source failure before any text intent is not itself a new draft. Preserve the older frozen-account recovery exception below.
- Position: a moved unfinished gesture and the latest submitted pending/failed/conflict/uncertain desired coordinate are actual device work. Truly absent/default, initial invalid/unavailable source, resize and plain pointer-down/no movement are not drafts.
- `offsetUnresolved` currently includes initial source errors and is reused by beforeunload. **Do not reuse this combined source/recovery flag as host draft truth.** Keep the required source alert and `Reload note position`, with truthful source copy, while clean source-only mount has no host decision and no new false unload warning. A failed gesture after that mount is real work and must be guarded.

Use identity/sequence of the latest submitted operation and editor/gesture revision, not only value comparison or `meta.status`. Pending Retry must not accept an older active Promise as success for a later queued intent. Retry preserves accepted normalization, original unchanged token and conflict checks. No retries of successfully saved siblings. Export and recovery-button focus must not cause an unintended blur Save or duplicate submission.

Provide explicit current-draft discard for host discard-and-leave, covering only actual current note/position fields. It cancels/detaches their pending callbacks safely, rereads only affected allowed sources through existing read/reload behavior, preserves successful siblings and performs no new persistence writes. A callback from before discard/reload cannot recreate obsolete failure, clear a newer revision or write under a successor account. Preserve targeted source repair independently; repairing position must not discard failed note, and clearing note must not discard unsaved position. An unfinished moved pointer gesture must release local pointer/gesture state only when deliberately discarded, not because a predecessor finishes.

Automatically continue a held route/sign-out only when every participating latest current draft is actually verified clean or explicitly discarded. One sibling success does not release another failure. A newer unsubmitted note or active moved gesture keeps the first intent blocked even if an earlier operation commits. Export/Stay never clear drafts or release navigation.

## Account epochs, frozen A compatibility and safe current B recovery

This boundary is an explicit parent-approved scope choice, reconciling current-user host permission with the accepted d129950 behavior:

1. Preserve frozen A note/session/draft in memory and its existing **beforeunload protection** after A→B or locked scope. Mask A text from B's header. Existing old-session Retry/Export must still refuse. Do not silently discard A as Saved or weaken the original eleven-case assertion.
2. Epoch change cancels the previous combined host route/sign-out intent. An old permission cannot block, export or discard after epoch/disposal; each method must independently check captured epoch against **live** in-memory scope at its actual boundary, not rely only on a React-ref update or coordinator precheck.
3. A fresh B host capability includes only B's actual current note work plus the surviving device-position work. It does **not** inherit A's frozen note permission or token. The frozen A note alone does not create an impossible B host dialog whose export/discard can never be authorized. Existing frozen A state/unload compatibility is intentionally separate from current B host authority.
4. When a B note editor is allowed to open, it needs a new B session/raw baseline and cannot borrow A's pending/failed operation. Existing frozen-session presentation may remain until an explicit safe local transition; do not auto-activate or recover A. No forced-auth/crash persistence is promised for A's in-memory draft; that remains in open REL-09 scope.
5. Device position remains editable/retryable through A→B and locked state. A fresh current permission can recover it without account write admission. It must never expose A's note as a convenience field in the combined export.

The existing inline old-session Export refusal can remain a separately identified old-session action while the fresh host exports only permitted current/device recovery. Make UI messages distinguish those situations; do not instruct B to export A when that action must refuse. No additional irreversible account operation is authorized by this contract.

## Export and unload

Preserve filename `dashboard-note-draft.json` and JSON `{version:1, kind:'dashboard-note-draft', note:<string>, noteOffset:<finite number>}`. This is the established combined Header snapshot format; do not replace it with Pomodoro's six-value schema or a sparse account dump.

For a current note session, export the latest permitted editable text with the latest desired/visible position consistent with the accepted position contract. For device-only recovery with no current note session, export only a note projection proven to belong to the active current owner. Under active B plus frozen A, that means safe current B projection, never A's retained text. Under locked/no current account, use empty note string and current device coordinate; do not access an account physical key or revive an old account to supply text. If owner attribution is unavailable, empty note is safer than an unproven cached projection. Preserve a finite clamped presentation value and never change persisted source bytes to construct the file.

Snapshot from permitted memory; current recovery must work under complete storage get/set denial. Check live epoch/disposal before creation and at the real download click, including synchronous owner change during Blob/URL/append setup. Stale export must not click or disclose old note data. Keep fresh-current positive controls. Reject invalid payload fields without downloading. Cleanup anchor/URL best-effort on URL/append/click failure; show localized export error separately from persistence failure. Preserve editor/latest coordinates, original failure/token, guard and both physical keys. Export cannot mark Saved, navigate, discard or write any source.

Beforeunload is synchronous warning only: actual changed editor, moved gesture, latest pending/failure/conflict/uncertainty and the legacy frozen A exception warn; clean/source-only/verified-current-clean state does not. No storage, export, navigation or asynchronous save inside unload. After current explicit discard, the current host guard clears; a separately retained frozen A legacy unload warning may remain. Document and test that intentional compatibility distinction rather than declaring all warnings cleared globally.

## Actual host integration and navigation producers

Use the accepted app-owned `DepartureCoordinator` and one shared `registerDepartureDelegate`/compatibility singleton. Do not copy another navigation state machine into Dashboard or add app/Settings runtime imports to `xai-web-dashboard-grid`.

Expose an optional stable public Header departure registration/capability through `DashboardModuleProps` → `DashboardModule` → `DashHeader`, with public types/exports. An app-owned Dashboard adapter supplies it using `useWebShell().lang`. Preserve standalone component/registration compatibility. Keep the current complete `dashboardWidgetRegistrations` catalog, goTo behavior, allowed module validation, slot empty/wildcard paths, metadata/rail order4 and `withDisabledFallback`.

**Known bypass to handle:** `packages/xai-web-dashboard-grid/src/registration.tsx` currently provides widget `goTo` via `window.history.pushState` plus a synthetic popstate event. Merely wrapping `router.navigate` will not protect that producer. Route the production app's mini-calendar/widget goTo through the existing coordinator-protected router path, preserving existing valid module IDs/event behavior and standalone fallback. Do not monkey-patch global history or declare arbitrary third-party hard navigation solved. Inspect any existing event listener before claiming the emitter alone is sufficient protection.

Required actual producers: Dashboard AppRail exit, relevant shell shortcut/programmatic navigation, Back/Forward/numeric POP, relative navigation/fromRouteId semantics where supported, mini-calendar/widget goTo, same-turn competing route intents and voluntary App sign-out. Protect route-first/sign-out-first with one captured first intent. Keep URL/history/UI unchanged while held, replay once after permitted completion, and restore router/delegate correctly on unmount. Owner epoch cancels old pending sign-out with false and retains current device protection. Preserve focus trap, Escape/Stay focus return, bilingual participant label **Dashboard header** and a clear current-note/device-position explanation without implementation jargon.

## File ownership and delivery sequence

Terra's permitted product surface:

- `packages/xai-web-dashboard-grid/src/DashHeader.tsx`, narrowly needed internal recovery helper, its tests and scoped recovery styles/copy.
- `DashboardModule.tsx`, `types.ts`, `index.ts` and public API doc for optional prop pass-through; `registration.tsx` only for the minimal goTo/host capability seam and compatibility.
- App-owned new Dashboard adapter and narrow `apps/web/src/routes/modules/shellRegistrations.tsx` wiring. Existing `departureCoordinator.tsx`, sign-out singleton, Composed Settings and Pomodoro wiring are preserved dependencies; a shared defect requires a separately reproduced oracle before changing them.
- Tests and author evidence in an author-owned review directory. Parent/Astra/Sol independent fixtures, earlier failed logs, acceptance reports and total audit ledger are protected.

First inspect status/log and preserve others' dirty paths. Parent has now executed `../web-dashboard-header-departure-independent/departure-baseline-2962b49.log`: five real registration/full-Shell assertions yield four correct host-protection FAILs and one clean PASS, covering quota note, unsubmitted text, AppRail and App sign-out while checking original physical bytes/latest input before departure. Preserve these assertions and failed log. This is the initial before subset, not complete caller coverage or a regression of accepted storage. Add the remaining independent baseline boundaries, including source-only/unload truth and widget goTo. Implement one coherent Header caller batch, run appropriate author package/type/lint and exact regressions, and hand off a fixed product SHA with layer-specific logs. Use precise commits; no push/deployment/account mutation beyond isolated synthetic test fixtures.

## Full independent acceptance matrix

| Layer | Required correct oracle |
| --- | --- |
| Existing accepted account caller | Original account11 + original parent2; Save/Enter/blur/Clear/Retry/normalization, frozen raw, pending/new text and same-value succession, account masking/old refusal, accepted Blob/file schema and uncertainty; run unchanged at final fixed SHA. |
| Existing complete device caller | Original device13, source3, Reload/old-completion1 and full Dashboard package/type; native device5 with saved-position reload controls. Retain real locks, gesture/resize/latest/uncertainty/account-independent bytes. Source3 must still show recovery while new source-only guard assertions remain false. |
| Current draft truth and partial outcomes | Note-only, offset-only, both pending/failed; both directions of partial success; unsubmitted text and active gesture; clean editor/no-move/source-only; same-value newer failure and pending Retry; unchanged/changed uncertainty tokens. Guard, visible values and each actual physical key must agree. |
| Discard/reload/export | Targeted repair leaves unrelated draft/Retry intact; latest callbacks cannot resurrect discarded state; export retains guard; per-field/current-all discard rereads only targeted fields, zero writes and saved sibling unchanged. Normal current success and fresh current export/discard positive controls required. |
| Owner boundary | A→B and locked during note/gesture/pending/uncertainty; A text never renders/exports in B; old capability isCurrent/isBlocking/export/discard refuse including same-turn setup; device work survives, fresh B/locked device recovery safe, prior host intent cancels. Original frozen A unload remains; B host does not inherit it. |
| Real production navigation | Actual registered Dashboard with full widget catalog/Shell; AppRail, mini-calendar/widget goTo, programmatic and Back/Forward, route/signout order, latest-all success and unmount restore; correct URL/history and actual App captured auth preflight. |
| Native browser | Actual input typing/blur/save and native pointer gesture, real locks/storage/full denial; disk-read exact schema, owner masking, setup failure cleanup, pending and mixed partial outcome; reload saved bytes distinguished from unsaved crash durability. |
| Full CSS/accessibility | Real Shell + Dashboard widgets/styles at375/414/768/1024/1440, EN/ZH recovery and375 dialog; 44px controls, no horizontal overflow, containment, actual elementFromPoint hit/click and manual screenshot inspection; focus/Escape/Stay, no runtime loop/error. Include both note/position recovery and source-only message. |
| Shared regression | Accepted Pomodoro complete16/7/24/2 plus mixed18/actual9/8 as relevant unchanged fixtures, Smart host10/entry3/wrapper5/export8/App5, Collaborate host8; final Dashboard/Web types/lint/package. Additional shared engine tests only when source/dependency changes justify them. |

Acceptance requires the whole matrix, correct source/physical/owner business assertions and a fixed final product. Aggregate test counts or author suite success alone do not close it. Reports must retain old failures and separate Astra, parent native and author execution attribution. Completion accepts only this full Header mounted-session recovery contract; the other Dashboard writers and broad REL/D2/AI items remain open.
