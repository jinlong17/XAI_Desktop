# Date & Time native before evidence

Parent independent review, 2026-09-10. Product fixed at `73b4eb9184c06764a3befd101961a3856988022f` using a Git archive and pinned workspace package aliases. Actual production ComposedSettings, complete Shell registrations, full CSS, isolated Chrome profile, synthetic device storage, no real authentication or deployment. Chrome 152.0.7977.83.

## Validated baseline

- `native-73b4eb9-all-five-before-clean.log`: PASS. Native trusted keyboard typeahead selects Sunday; actual mouse clicks change all four booleans to false. Exact physical device values persist. Page reload reaches a new document and restores all five values, with zero application mount writes. Clean signout preflight returns true. This tests saved reload, not process-crash recovery of unsaved memory.
- `native-73b4eb9-validated-before-controls.log`: five correct FAILs. Under quota each of the five controls loses its latest choice while physical original bytes remain unchanged. The select trace proves trusted input/change to Sunday before the UI reverts to Monday. All four mouse inputs have the normal-save positive control above.
- `native-73b4eb9-validated-before-route.log`: correct FAIL, programmatic Settings navigation escapes to Notifications without a dialog.
- `native-73b4eb9-validated-before-rail.log`: correct FAIL, actual Tasks AppRail click escapes without a dialog.
- `native-73b4eb9-validated-before-signout.log`: correct FAIL, actual shared Settings departure preflight resolves true without a dialog despite the failed lunar choice.
- `native-73b4eb9-validated-before-unload.log`: correct FAIL, failed lunar choice does not cancel a synchronous beforeunload event. This is the warning contract, not proof of an actual browser close or background service execution.

Every valid mode recorded zero Runtime exceptions/console errors. Baseline has nine individual negative business assertions (five fields plus four departure paths) and one all-five saved-reload positive scenario. Component host evidence remains separately attributed to `../web-date-time-recovery-independent/host-before-73b4eb9.log`.

## Input setup diagnostics, excluded from product verdict

The earlier `before-clean`, `before-controls`, `keyboard-before-clean`, `raw-key-before-clean`, `focused-raw-before-clean`, and `focus-emulation-before-clean` logs are retained as diagnostics only. ArrowDown/Enter produced no select input/change on this Mac headless setup. They are not counted as product failures. The `typeahead-before-clean` log first proves the replacement native input and saved-select reload; the stronger all-five clean run above is the current positive control. No DOM value assignment or synthetic change event substitutes for native selection.

## Remaining verification

The complete Astra contract remains `../web-date-time-recovery-contract/contract.md`. This before suite does not cover the complete after host/history/first-intent, latest-operation/partial/owner, lock/uncertainty, native disk export or bilingual five-width/focus matrix. Those remain required before final caller acceptance. Terra implementation and Sol independent tests are separate owned files; no product files were changed by this evidence batch. Header acceptance remains unchanged; no REL/D2/312-item closure is inferred.

Run `node docs/reviews/web-date-time-recovery-native/verify-native.mjs <fixed-sha> <mode> <unique-suffix>`. Modes: controls, route, rail, signout, unload, clean. Existing logs cannot be overwritten.


## First implementation and expanded native matrix

Fixed2c09719 original six native modes all PASS: controls, route, rail, signout, unload, clean (all-five physical save/new-document reload). They remain distinct from full caller acceptance.

Fixede9213fb expanded native PASS: real held-save completion releases route; unchanged uncertainty Retry has one total write; all-five and sparse full-Storage-denial downloads produce exact disk JSON with zero export reads/writes; A→B→locked cancels old signout while preserving/exporting device draft and allowing pending device commit; source-only invalid data has no false unload/signout protection; actual keyboard Shift-Tab/Tab trap and Escape focus return pass. Parent advanced-host12 now PASS at e9213fb (separate log).

Both EN and ZH recovery layouts pass all five widths375/414/768/1024/1440 plus375dialog geometry, viewport containment, actual elementFromPoint hit checks, and44px recovery targets. EN evidence uses expanded suffix; ZH uses localized suffix and trusted Chinese typeahead 周 to select 周日. The earlier expanded visual-zh run used English s, which correctly did not select a Chinese option; that failure is an input setup diagnostic, excluded from product findings. PNGs preserve rendered states. Parent manually inspected EN375/768/1440 and ZH375/1440/dialog375 and found a real visual defect despite green geometry: global44px height stretches the Toggle track to46x44, yielding a grey circle with its knob at top-left. Mobile Discard also wraps into a separate full-width row. Terra owns a DateTime-scoped CSS correction; no visual acceptance yet.

## Confirmed uncertain Retry external-overwrite defect

`native-e9213fb-before-fix-uncertainty-conflict.log` is a correct native FAIL: initial timezone true→false physically writes once but readback throws; external storage update then sets true; actual Retry Time Zone causes a second application write of false, overwriting external bytes. The disk observation and writes list substantiate the defect independently of Sol component tests. Shared-layer architecture review is assigned to Astra; a DateTime raw preflight workaround is paused. No REL/D2/whole-caller closure.


## Actual second-document conflict and visual correction

`native-e9213fb-before-fix-crossdoc-conflict.log` repeats the uncertainty defect using a separate real Chrome same-origin document, writing directly via that document's localStorage and delivering a native cross-document storage event. Main-tab Retry still makes a second write of false over externaltrue. The separate target id and main-tab write list are recorded. This strengthens the earlier injected-event counterexample without replacing it.

At fixed visual-only18f4e82, both visual and visual-zh modes pass all five widths plus375dialog; clean all-five saved reload and native focus pass again. The new toggle-states mode verifies all four controls on→off→on through actual clicks and exact physical values:44x44 hitbox, centered16x16 knob,36x20 visible track. All modes Runtime0. Parent manually inspected the EN375/1440 and ZH375 recovery screenshots and normal on/off1440 screenshots: switches now have clear horizontal tracks and on/off position/color, and mobile Retry/Discard sit together below their own field explanation. This accepts the observed local visual correction; it does not close shared uncertainty or the full DateTime contract. New PNGs/logs are versioned18f4e82 and do not relabel earlier screenshots.


## Shared repair fixed96c4915

All sixteen current native modes pass; detailed executor/version/limitations are in `../web-date-time-recovery-independent/shared-96c4915.md`. This includes the preserved uncertainty-read-retry beforee921 failure and actual cross-document no-overwrite after. Full shared and caller acceptance remain with Astra.
