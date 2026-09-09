# Astra bounded workspace acceptance at b353cbb

**ACCEPTED for the reviewed Board workspace save-recovery, startup preservation and queued-selection repair scope.** Product target: `b353cbbf6c4191f75deb46b0ea170e9c9dfb8d2c`. The remaining queued-selection blocker from `8045d5d` is independently fixed. No unresolved blocker remains in this bounded review. This does not close full Board, REL-05, other Board edit surfaces, cross-tab atomicity or release readiness.

Module ownership can be released from this workspace repair and reassigned by the parent to necessary B–D caller adaptation or the separately reviewed detail-editor batch. One writer must own Module at a time; acceptance of this batch is not acceptance of those later changes.

## Fixed-revision evidence

All runs use `git archive b353cbb` and resolve product workspace imports into that snapshot. Dependency installations are reused by symlink. Author native evidence was still in progress when this review ran; none of its reported PASS results were substituted for reviewer execution. New logs use `-b353cbb`; all before evidence and original failing assertions are retained.

| Reviewer execution | Result and scope |
| --- | --- |
| Original three same-account queued-selection assertions | PASS in component and isolated Chrome: active changed, board source replaced, board source removed |
| Existing three startup/automation controls plus new stable-source control | PASS: absent seed initializes; valid legacy and envelope automation retain bytes on quota failure and succeed on manual retry; stable valid source corrects a genuinely stale active id |
| Component file total | 7 PASS; original six tests/expectations unchanged, one positive control appended |
| New native stable-source correction control | PASS: active becomes `b-default` and that target exists in stored boards |
| Existing native startup corruption runner | Four corruption classes / eight byte-preservation assertions PASS: schema-invalid, JSON null, syntax-invalid, empty array; board bytes and workspace directory retained |
| Existing author recovery scenario runner, executed by Astra | Four PASS: create latest downloaded draft/stable ID/retry; rename latest downloaded draft/retry; normal and failed selection; A→B retry/export refusal |
| Existing author component contract, executed by Astra | 10 PASS |
| Workspace package suite | 26 files / 313 tests PASS |

Counts are different evidence layers and must not be added into a coverage total. The queue tests use an actual React sibling layout effect between scheduling and the microtask, without mocking `queueMicrotask`. Chrome uses a temporary profile, fixture-only accounts, real browser storage and synthetic DOM interactions; this is not the full production SPA or physical pointer/keyboard coverage.

Source review confirms that the scheduled correction captures owner, both physical keys, exact board and active bytes, rendered source and target. Immediately before the setter, the callback checks current owner/keys, both exact raw values and source validity/equality. A newer active choice is therefore protected independently from board validity. The normal correction controls demonstrate that the guard does not simply suppress every correction. Existing `usePref`/account-scope protection still applies; exact queued A→B timing was source-reviewed, not newly exercised dynamically here.

The previous unchanged nine-test file is not claimed as nine PASS. Its `034ef46` log remains 6 PASS / 3 FAIL: two single-alert queries became incompatible with dual visible recovery notices, and one valid seed board-byte oracle preceded normal automation. Those limits are documented in `20260909-034ef46-rereview.md`. The actual corrupt-storage and latest-selection preservation business contracts are separately proven by the fixed-revision native assertions above; no historical log or assertion was altered to produce a green total.

## Commands

```bash
BOARD_REVIEW_LOG_SUFFIX=-b353cbb node docs/reviews/web-board-workspace-astra-review/verify-component.mjs b353cbb startup-and-queue
BOARD_REVIEW_LOG_SUFFIX=-b353cbb node docs/reviews/web-board-workspace-astra-review/verify-component.mjs b353cbb package-rerun
BOARD_REVIEW_LOG_SUFFIX=-b353cbb node docs/reviews/web-board-workspace-astra-review/verify-component.mjs b353cbb author-contract-rerun
BOARD_WORKSPACE_NATIVE_LOG=native-selection-queue-b353cbb.log node docs/reviews/web-board-workspace-astra-review/verify-queue-native.mjs b353cbb
BOARD_WORKSPACE_NATIVE_LOG=native-selection-positive-b353cbb.log node docs/reviews/web-board-workspace-astra-review/verify-selection-positive-native.mjs b353cbb
BOARD_WORKSPACE_NATIVE_LOG=native-boot-corruption-all-b353cbb.log node docs/reviews/web-board-workspace-astra-review/verify-boot-native.mjs b353cbb
BOARD_WORKSPACE_NATIVE_LOG=native-author-replay-b353cbb.log node docs/reviews/web-board-workspace-astra-review/verify-native.mjs b353cbb
```

All commands above exited 0. No product or central-ledger file was edited. No deployment, merge, push or broad feature closure was performed. Later canonical-storage changes that affect these callbacks must retain these workspace recovery regressions.
