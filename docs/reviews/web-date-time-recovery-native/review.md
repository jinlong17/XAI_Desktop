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
