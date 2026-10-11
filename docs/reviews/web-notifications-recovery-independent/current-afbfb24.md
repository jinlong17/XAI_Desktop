# Notifications current native and integration evidence

Product fixed afbfb24d6f7311366b77852eda927d08467478c2. Parent-owned immutable archive + real Chrome153; no shared product source changes during execution.

All **20 distinct native modes PASS**, zero Runtime errors. Detailed fixed JSON logs accompany ../web-notifications-recovery-native/:

- `native-afbfb24-complete-layout-visual-zh.log`
- `native-afbfb24-complete-layout-visual.log`
- `native-afbfb24-expanded-crossdoc-conflict.log`
- `native-afbfb24-expanded-export-all.log`
- `native-afbfb24-expanded-export-sparse.log`
- `native-afbfb24-expanded-focus.log`
- `native-afbfb24-expanded-owner.log`
- `native-afbfb24-expanded-pending.log`
- `native-afbfb24-expanded-uncertainty-read-retry.log`
- `native-afbfb24-expanded-uncertainty.log`
- `native-afbfb24-final-current-clean.log`
- `native-afbfb24-final-current-controls.log`
- `native-afbfb24-final-current-hidden-export.log`
- `native-afbfb24-final-current-route.log`
- `native-afbfb24-final-current-signout.log`
- `native-afbfb24-final-current-toggle-states.log`
- `native-afbfb24-final-current-unload.log`
- `native-afbfb24-final-source.log`
- `native-afbfb24-native-typeahead-latest-pending-retry.log`
- `native-afbfb24-native-typeahead-predecessor-failure.log`

Coverage: actual eight-field controls/physical saves/new-document reload; route/signout/unload; hidden time source Reload reads only its own key and creates no draft; sparse/all-eight/hidden memory export to actual disk under full Storage denial; named-lock pending and duplicate Retry; uncertainty one total write, temporary denied read then Retry, actual second-document original-byte restoration refuses overwrite; held device work through A→B→locked and old signout cancellation; both sound queue-failure directions with latest own recovery; focus trap/ShiftTab/Tab/Escape return; all five switch states and track/knob geometry; EN/ZH five widths with visible and hidden time recovery, 375 dialog targets >=44px and hit/containment, actual Stay.

Parent manually inspected current375 EN hidden recovery and375 ZH dialog screenshots; previous CSS-only72c9a60 corrected desktop1440 visual retained exact source attribution. Current visual runs also include all eight drafts and correct native Chinese Chime selection using 清; earlier Chinese first-visual used unmatched 钟 and lacked the Sound failed state, so current complete-layout supersedes that coverage.

Two `final` sound-queue logs failed before the second selection could land: Chrome's typeahead combined c+b into a search buffer. They are setup diagnostics, not product failures. `native-typeahead` waits1200ms to end the first buffer and records actual trusted Chime/Bell input events before checking queue semantics; both complete recovery paths PASS. No failure oracle was weakened to accept data loss.

Web types/lint, Settings types/lint and storage types all PASS on afbfb24; log ../web-date-time-recovery-independent/types-lint-afbfb24-notifications-final.log. Parent original actualhost12 also PASS atafb (884daf4). Astra owns additional currenthost15/24boundaries/Settings297/DateTime7 receipts; Sol owns domain/mixed/race final evidence. Their final requirement acceptance still needs integration.

This proves a mounted-session preference recovery contract and saved new-document reload. It does not prove forced-close unsaved draft persistence, actual notification delivery, background scheduling, production deployment or full312 closure. Beforeunload is a cancelable event oracle, not hardware/browser shutdown automation.
