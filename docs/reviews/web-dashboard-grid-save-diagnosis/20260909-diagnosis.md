# Dashboard grid/order/layout REL05 independent diagnosis

Fixed source: `81f5623`. Diagnosis only in this commit, no product changes. All @repo/product modules are pinned from Git archive. Actual hooks/components use the real storage APIs; fault seam throws in Storage.prototype.setItem for one physical key, never mocks the setter into a fabricated result.

`node docs/reviews/web-dashboard-grid-save-diagnosis/verify.mjs` intentionally exits 1: **7 correct failure assertions / 1 passing control**. Logs retain expected vs actual values. This is not a repaired-product or native browser PASS. The environment is React/jsdom with real in-environment Storage and native-shaped dialog shim.

## Findings and caller map

| Finding | Actual caller path | Evidence |
|---|---|---|
| P1 old account writes into next account | DashboardGrid resize callback → useWidgetLayout.setWidgetLayout → writeLayout → dynamic setPrefAutosave | Capture A callback; activate B; callback edits bravo; B's originally absent physical key gets A's alpha map plus bravo. No scope captured by the hook. |
| P1 missed account physical storage events | useWidgetLayout useEffect compares event.key to unscoped LAYOUT_PREF_KEY | Dispatch the actual account-prefixed key with newer cols=6; getLayout stays cols=2. Appearance listener has the same source pattern, not separately runtime-certified here. |
| P1 external value overwritten without event | resize → functional local state updater → write entire old map | Persist alpha cols=8 externally; edit bravo before notification; stored alpha reverts to stale cols=2. |
| P1 failed layout silently changes UI | WidgetShell resize handle → DashboardGrid.tsx:85-103 → hook setLayoutMap updater → void writeLayout | Quota preserves stored 2/118, but getLayout reports 8/300, no error/retry API. Reload reads old size. |
| P1 failed appearance silently changes UI | WidgetShell tone/opacity/reset → DashboardGrid.tsx:139-140 → useWidgetAppearance updater → void writeAppearance | Quota preserves clear/.42, but hook returns rose/.6. Reset also ignores persistence result by source inspection. |
| P1 failed remove hides widget | WidgetShell remove → DashboardModule.tsx:78-90 → rawSetOrder then unconditional removedInSession | Actual module hides bravo, raw still alpha+bravo, no unsaved alert. Reload would restore stored bravo. |
| P1 failed add emits success | AddWidgetPicker.awp-card → handlePickerAdd → addWidgetToOrder → rawSetOrder | Actual component fires widget-added once despite unchanged raw. The source then closes picker unconditionally. |
| Control: simple order failure does retain order | useGridDrag → useDashOrder tuple setter (actual usePref setter) | Quota leaves persisted and rendered alpha/bravo unchanged. Therefore do NOT claim every order mutation shows a new false persisted order. Drag ignores returned false and clears ghost without an error/retry, which is a separate feedback gap. |

Other path: useDashOrder mount sanitization writes lastWrittenRef before setPref; failure marks the attempted sanitized value as handled without recovery. This is source-confirmed, not a ninth runtime test.

## Ownership and exact implementation evidence

- `plugin-web-storage/src/internal/accountOwnership.ts:31`: xai_dash_order is device-owned.
- Same file:122-125: unregistered xai_pref_* keys resolve to account. dashboard_widget_layout and dashboard_widget_appearance are not explicit device exceptions. Their ownership must not be changed to device just to hide the A/B fault.
- `useWidgetLayout.ts`: writeLayout ignores boolean setPrefAutosave; setWidgetLayout commits local map regardless; onStorage matches logical key; no captured account or preflight raw baseline.
- `useWidgetAppearance.ts`: same write/error/owner/listener defects; reset additionally removes local override before checking any save result.
- `useGridDrag.ts`: setOrder typed void and used inside pointermove; pointerup clears drag with no persistence outcome.
- `DashboardModule.tsx`: add/remove separately own rawOrder and session removal; add then emits and closes regardless of write result.

## Suggested repair and verification split

1. Account layout/appearance: captured immutable owner, correct physical key subscription, per-key raw baseline checked before the first write even without an event. Drop old scope work; do not copy old maps into a new account. Preserve newer external data and expose conflict recovery.
2. Surface persistence outcome and retain one failed latest proposal with Retry/Export. Existing tests use rollback as the current lack-of-feedback oracle; a new deliberately marked unsaved preview needs explicit component-level assertions rather than pretending it is persisted. Initial failure must not quietly publish success.
3. Dashboard add/remove: shared failure state, do not update removedInSession/close picker/emit added until write success. Frozen action/retry identity prevents double success events. Order drag failures need explicit recovery rather than silent snapback.
4. Verify before/after quota, first external write without storage event, actual physical event, A/B retained callbacks, latest draft/export, repeat retry and no duplicate events, reload reading committed state. Avoid claiming cross-tab atomic transactions or reload-durable drafts from synchronous preflight checks.

DashHeader note recovery is untouched and outside this diagnosis. Independent host gates can unmount old components, but retained callbacks/window pointermove lifetimes still require local owner safety; this diagnostic demonstrates the callable retained callback, not an entire host navigation race.
