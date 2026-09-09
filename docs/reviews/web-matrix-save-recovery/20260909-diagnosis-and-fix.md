# REL05 batch 1: Matrix save-result consumers

Web scope; author diagnosis and fix. The remaining-consumer inventory (`6fa451f`, `web-save-consumer-inventory/20260909-inventory.md`) and current TODO/EXECUTION still classify REL05 as in progress. This batch covers Matrix creation and movement only.

## Confirmed defect

Before changes, `usePersistedMatrix.moveCard` ignored the shared setter's boolean and emitted `web:matrix:priority-tagged` even after persistence failed. `MatrixModule.handleComposerSave` closed the dialog unconditionally; the composer's open-change effect then cleared the title. The declared setter/add/move result types were void.

`20260909-before.log` captures actual Chrome + actual MatrixModule + native Storage quota injection, using only synthetic account A:

- `dialogRetained:false`, `draftRetained:false`, `errorVisible:false`.
- Original persisted bytes remained intact, but `falseEvents:1` was emitted for a failed move.
- `pass:false` evaluates the correct business requirements. This is a reproduced defect, never a repaired-product PASS.

## Fix

Boolean persistence results now reach new-card and movement callers. Failed creation retains the native dialog and latest title/tag/quadrant. Its error and export action are inside the dialog's top layer. Retry submits the latest editor state and closes only after confirmed write. Escape/backdrop do not silently discard a failed draft; explicit Discard draft does.

The hook retains a pending change and original byte baseline. A different action cannot replace its recovery operation. Movement retry persists the same proposal and emits once after success; failure emits nothing. Account capture prevents old proposals/export from entering B. Baseline mismatch preserves newer stored bytes and requires explicit export/discard rather than overwriting them. First attempts also compare the rendered raw snapshot with current persisted data, preventing stale-render overwrites detected before writing.

Exports include pending proposal, stored raw bytes and the current unsaved composer fields. They are manual recovery artifacts; no import or cross-reload draft durability is claimed. Storage-denied and account-denied export failures are visible.

## Verification

- Full Matrix package: 17 files / 86 tests passing, including original creation/move/keyboard/event tests and four new fault/account/conflict regressions.
- Matrix `check-types` and `lint` pass.
- `20260909-after.log`: original native failure oracles pass; latest edited draft export/save, exactly one creation, movement failure/retry event order, and A→B retry/export isolation also pass.
- Real token/layout/Matrix CSS is bundled at a narrow Chrome viewport. Native dialog behavior and Storage are used; this is functional fault verification, not a complete visual/a11y audit.

Reproduce:

```sh
node docs/reviews/web-matrix-save-recovery/verify-native-matrix.mjs
pnpm --filter @repo/plugin-web-matrix test
```

The harness uses a temporary Chrome profile and synthetic data, then removes them. Export checks inspect generated Blob bytes and suppress the final download click. No production backend or real account is used.

## Remaining boundaries

This synchronous baseline check is not a cross-tab transaction: another tab can still race between final comparison and write. No Web Locks/transactional storage upgrade is claimed. Existing seed-on-empty behavior, malformed-state recovery, Tasks linkage and other Matrix product gaps remain separate work. Habits, Calendar and every other inventory consumer are outside this batch. REL05 remains open pending those consumers and independent acceptance.
