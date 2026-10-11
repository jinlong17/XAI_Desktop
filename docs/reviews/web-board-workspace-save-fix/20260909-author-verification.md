# Board workspace save recovery — author verification

Product commit `3e7f17a` makes workspace create, rename, recolor, empty-only delete,
and ordinary board selection wait for a successful persistence result. A failed
write keeps the switcher open with a recovery notice and Retry, Export, and
Discard actions. The recovery hook captures its account scope and the raw
workspace/board/active-key baselines before the first attempt. It rejects
changed, removed, malformed, or old-account state instead of replaying it.

The existing deletion contract remains unchanged: only an empty workspace may
be deleted, and the final workspace cannot be deleted. This patch does not move
boards or make cross-tab writes atomic.

Validation completed on this commit:

- `save-contract.test.tsx`: 10 component-level checks passed. The original
  five rejected-write assertions remain unchanged; added coverage checks stable
  create IDs, current text on retry/export, empty/last/nonempty deletion
  behavior, absent-active normal selection plus failed-selection retry, external
  replacement/removal refusal, recovery after Discard, and A-to-B refusal.
- `pnpm --filter @repo/plugin-web-board-workspaces test`: 25 files / 299 tests
  passed. `typecheck` and `lint --max-warnings 0` both exited zero.
- `node docs/reviews/web-board-workspace-save-fix/verify-native.mjs 3e7f17a`:
  isolated headless Chrome used a fresh profile and download directory. It
  verified real downloaded JSON for the latest create and rename drafts,
  create-id stability through retry, normal and failed ordinary board selection,
  and old-account retry/export refusal. The fixed-product output is
  `native-results-3e7f17a.log`; the earlier `native-results.log` for `1ae0ee8`
  is retained as historical evidence and is not the acceptance target.

Native coverage is limited to create, rename, ordinary board selection, and
old-account refusal. Recolor and workspace deletion have only the component
tests in this batch, including successful empty deletion and unavailable
last/nonempty deletion. They are not claimed as native-browser coverage.

The test fixtures deliberately synthesize storage quota failures and contain no
production account, browser profile, or external service. This is author
evidence for the bounded Board workspace recovery sub-scope only. Full REL-05
and non-author acceptance remain open.
