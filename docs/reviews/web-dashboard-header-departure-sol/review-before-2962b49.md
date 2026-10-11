# Dashboard Header departure recovery — Sol independent before

Independent verifier: Sol. Fixed product baseline: `2962b49bd63fa351a2c17b406456ea1b987eca8f`.

This directory adds component-level public-capability, operation-attribution and physical owner/export oracles without changing product code or mocking the product storage hooks. The runner archives the requested Git object, resolves package imports into that archive and copies only this directory's immutable fixture and assertions.

The baseline result is the expected rejection: component 0/5, export-owner 0/5 and operations 0/5. `DashHeader` ignores the optional `registerDepartureGuard` prop at this revision, so no current guard is captured. Cases fail at their host-truth/capability assertions after retaining their physical-value controls. These failures agree with the parent registered-host baseline but cover separate public-component, sequence-attribution and physical-boundary contracts.

The fixed rerun must use these files unchanged. It must turn the capability assertions green while retaining the previously accepted note11, device13, source3 and Reload/old-completion1 suites unchanged. Parent retains actual registered Shell, rail/widget navigation, native disk and full-CSS ownership; this directory does not claim those layers.

Run:

```bash
node docs/reviews/web-dashboard-header-departure-sol/verify-fixed.mjs <fixed-sha>
```

The optional third argument selects `component`, `export-owner` or `operations`; the fourth adds a unique log suffix.
