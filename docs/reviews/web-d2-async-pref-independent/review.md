# Parent independent async-pref hook checks

Fixed product `5ed9329`: two independently authored actual-hook assertions PASS in `independent-parent-initial-5ed9329.log`. Separate hook instances each apply a functional updater once and preserve both persistent increments. Two local autosave edits while an account lock is held retain the latest draft and eventually commit it without a false conflict. Fixture uses named shared/exclusive scheduling, strict validators and physical string/number state.

These are bounded hook tests with stable validators. They do not accept the real pane or full contract: the real Collaborate native probe at the same revision still loses its latest selected value while pending and after quota failure. That separate evidence lives in `../web-d2-async-pref-native/native-5ed9329-parent-initial.json`.

The same original two hook assertions also PASS at `2820917` in `independent-parent-session-partial-2820917.log`. This is regression evidence for that partial session change, not full session/reset acceptance. Those remaining contract tests are assigned separately to Sol.
