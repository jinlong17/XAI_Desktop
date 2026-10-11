# Metrics REL-05 independent save-recovery verification

Date: 2026-09-09. Module: web. Verdict: **PASS after a61f92d** for the reviewed save-failure recovery scope. No production/deployment or cross-reload draft guarantee is implied.

## Baselines and independently reproduced issues

Before: `15be421d5c467fbdda2c52e94322917795cad79c`. After: `a61f92d1076f4ffcdba446347c72cdd455214877`. Native probes build immutable Git archives and resolve every workspace import to the pinned archive. Working-tree Time Tracker edits are excluded. Installed third-party packages are reused, no dependencies changed.

Independent component review first reproduced two correctness failures, then native Chrome established four observable affected paths:

| Path | Before | After |
| --- | --- | --- |
| Profile 63 fails, user edits visible input to 64, clicks Retry | Saved 63, displayed 64, failure disappeared | Saved 64, displayed 64 |
| Failed profile 63 followed by another record operation | Old committed target 70 remained; unrelated success erased pending failure | Unrelated action is blocked; old committed data remains unchanged and pending failure visible |
| Record 81 fails, user edits to 82 and closes dialog, then exports | Latest recordDraft null; snapshot only held 81 | Export includes latest recordDraft 82 together with failed snapshot 81 |
| Same closed record draft, main-panel Retry | Saved 81, silently dropping latest edit 82 | Saves one new record with value 82 and original note |

The first two were reported to the author before correction; the closed-editor export/retry boundary was additionally requested and verified. `20260909-component-before.log` preserves the original two failed correctness assertions. The after component probe contains six checks and supports the valid implementation choice to block entry into an unrelated operation instead of requiring it to open.

## Executed verification

```sh
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-metrics-save-independent/profile-retry.config.mjs
node docs/reviews/web-metrics-save-independent/verify-native-metrics.mjs
METRICS_VERIFY_REF=a61f92d METRICS_VERIFY_LOG=20260909-native-after.log METRICS_SCREENSHOT=390px-metrics-after.png node docs/reviews/web-metrics-save-independent/verify-native-metrics.mjs
```

The native default intentionally uses the defective before revision and returns exit 1; explicit after returns exit 0. Independent component after: **6/6 PASS**. Independent native after: **all four previously failing checks PASS**, plus conflict and account boundary checks, with **three actual JSON downloads**. Counts are not added to author package totals.

The native harness runs actual MetricTrackerModule, hook and storage in isolated Chrome 152.0.7977.83 with real localStorage. It injects quota errors only for the synthetic A business key. Actual Blob URLs and anchor clicks produce files in Chrome's temporary download directory; Node reads and parses those files. No export-success stubs or production data are used. Profiles and downloads are removed afterwards.

Additional independent checks:

- Failed profile proposal survives a storage read error after mount; restoring access allows one write even when retry is invoked twice.
- A newer canonical storage value plus an actual StorageEvent cannot rebase the original pending baseline: retry reports conflict and preserves newer bytes; pending proposal remains exportable.
- Failed deletion remains proposed only. Retry marks the intended record deleted without dropping unrelated records or duplicating records.
- Stale A retry and snapshot/export after activating B refuse access and preserve both A and B bytes. Native UI shows export failure and produces no download.
- Conflict JSON export contains the failed latest record draft while newer canonical bytes remain unchanged.
- 390px recovery screenshot inspected before and after. Alert fits horizontally (x33–347) with readable conflict/export scope text. Current recovery CSS specifies 44px minimum buttons. This is not a full visual audit of all Metrics screens.

Evidence: component before/after logs, native before/after logs, two screenshots, and independent component/native probe sources in this directory.

## Limits and handoff

- Pending edits remain mounted-page memory. Closing the editor within the same mounted module is covered; refresh, browser close, process crash or leaving the module is not guaranteed. Explicit export remains the preservation path.
- Baseline conflict detection is not an atomic cross-tab transaction or merge protocol. No simultaneous multi-tab writes or cloud sync was exercised.
- Exports intentionally contain existing metric records plus unsaved edits, as disclosed in UI. They are not an implemented restore/import feature or cloud backup.
- Initial mount with denied storage, browser-specific quota policies, real hosted auth and deployment behavior are outside this probe. Read denial was injected after a valid initial read.
- The independent Tasks/Bookkeeping report is separate. Bookkeeping 44px follow-up passed and is committed as `9c974e7`; this report does not duplicate its totals.
- No product files, author tests, task ledger or production services changed by the verifier; no cross-vendor PASS claimed. Parent owns final REL-05 and release decisions.
