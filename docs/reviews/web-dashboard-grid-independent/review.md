# Dashboard grid save recovery — independent verification

PASS for the grid layout/appearance/order save paths implemented in72296ec, fixed full snapshot33723a1. Parent did not author product changes. Reused author native fixture/oracles in a separate directory, adding a first-operation external deletion check. Original summary retains checks:6; the additional deletion assertion is separately logged and is not an inflated coverage total.

Actual DashboardModule, native Storage, temporary Chrome profile/download directory and git-archive workspace aliases. All assertions pass, including a real downloaded JSON file read from disk:

- Actual resize handler under quota keeps committed cols/raw, retains latest proposal across changes, exports it and applies it on successful retry.
- Appearance failure preserves stored state; retry persists selected tone.
- Failed Add keeps picker open and emits zero widget-added events; retry produces one event, one order addition and closes picker.
- Failed Remove retains the widget; successful retry removes it.
- First raw conflict without delivered storage event preserves the newer raw; discard reloads it. A physical-key storage event refreshes the rendered layout.
- Additional independent deletion check: remove layout key before resize; rejected old proposal cannot resurrect it. Discard reloads default cols2 without writing the key.
- A retained old-account resize handler and export cannot write B, change A or create a download; export error is visible.

Source review confirms captured account ownership in map/order recovery, original raw baseline checks, pending proposal retention, and one controlled order owner in DashboardModule. Compatibility tuple alone is not accepted as proof; native add/remove paths are explicitly exercised.

Run: node docs/reviews/web-dashboard-grid-independent/verify-native.mjs. Fixed33723a1, process exit0 and structured PASS. Does not cover DashHeader (separate prior acceptance), all widgets, unknown-schema recovery, durable drafts, cross-tab atomic transactions, release or complete responsive/accessibility verification. Entire REL-05 remains open.
