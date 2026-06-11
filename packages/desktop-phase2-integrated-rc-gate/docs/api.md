# desktop-phase2-integrated-rc-gate — API / Contract Notes

## Contract Summary

This feature does not define a new business API. It defines the integrated Phase 2 RC evidence contract, classification rules, and the separation between repo-side readiness and external-release readiness.

Primary contracts:

- integrated repo-side baseline contract
- six-slice real-macOS smoke matrix contract
- cross-slice interaction classification contract
- external-release prerequisite reporting contract for row `#1`

## Upstream Interfaces

### Dependency-row truth contract

This row consumes the shipped or ready-to-ship truth from:

- `desktop-native-notifications-reminders`
- `desktop-statusbar-quick-actions`
- `desktop-global-hotkey-quick-open`
- `desktop-full-macos-menu-polish`
- `desktop-auto-update-release-channel`
- `desktop-last-data-cache-polish`

It must not redefine their implementation contracts. It only composes their readiness and manual-smoke expectations into one integrated gate.

### External-release prerequisite contract

`desktop-real-macos-release-smoke` remains upstream and separate.

Required semantics:

- this row may report strong repo-side readiness while row `#1` is still blocked
- this row must not claim external-release readiness until row `#1` is no longer blocked

### Baseline build/test contract

Canonical repo-side checks likely include:

- slice-owned package tests relevant to rows `#2`-`#7`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web run build:secure`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter desktop tauri build --debug --bundles app`

If a blocker fix touches a narrower seam, the smallest relevant focused reruns should be added on top of the baseline.

## Downstream Outputs

### Slice classification contract

Recommended integrated matrix types:

```ts
type DesktopPhase2IntegratedSlice =
  | "notifications"
  | "statusbar"
  | "hotkey"
  | "menu"
  | "updater"
  | "cache";

type DesktopRcClassification =
  | "PASS"
  | "BLOCKED_REPO"
  | "BLOCKED_ENVIRONMENT"
  | "DEFERRED_OUT_OF_SCOPE";
```

Required meaning:

- `PASS`
  - direct evidence exists for the slice in the integrated RC run
- `BLOCKED_REPO`
  - a repo-owned defect reproduced against the approved contract
- `BLOCKED_ENVIRONMENT`
  - the required real-macOS execution context was missing or not trustworthy
- `DEFERRED_OUT_OF_SCOPE`
  - only for a dependency truly outside this row's charter; not a convenience escape hatch

### Final report contract

The final integrated report must include:

- repo-side readiness summary
- one row per slice with classification and evidence reference
- cross-slice notes
- one explicit external-release prerequisite section for `desktop-real-macos-release-smoke`

Recommended report fields:

- slice
- evidence path
- result
- repo note or environment note
- whether a rerun is required after fix

## Error Semantics

- If a slice reproduces a public-contract defect, that is a hard `BLOCKED_REPO` for the integrated gate.
- If real-macOS interaction cannot be executed or trusted, classify `BLOCKED_ENVIRONMENT` honestly.
- A `PASS` on repo-side readiness does not override a blocked external-release prerequisite.
- No slice should be left unclassified in the final integrated report.

## Permission Notes

- No new Tauri capability widening belongs to this row by default.
- No new plugin manifests, routing surfaces, or cross-plugin imports belong to this row.
- Any minimal blocker fix must stay within the owning slice boundary and keep browser-safe desktop bridge contracts intact.

## Idempotency Notes

- Re-running the integrated repo-side baseline without code changes should yield the same readiness summary.
- Re-running a passed manual slice on the same artifact and environment should yield the same classification until code or environment changes.
- If a repo-side fix is applied, the affected slice and the integrated baseline should be rerun before the classification is updated.
