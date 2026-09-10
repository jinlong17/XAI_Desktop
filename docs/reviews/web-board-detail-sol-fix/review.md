# Board detail append recovery — Sol implementation evidence

Product module: `web`. Author: Sol. No provider account or remote service was used.

## Fixed source

- Main implementation: `5c6ed8e` (`fix(board): retain failed detail additions`).
- Final responsive follow-up: `99c36b0` (`fix(board): size mobile recovery actions`).
- The approved architecture was `ac0e090`; the original correct failure evidence was `a8774fd`, with its current preserved runner at `ec8f86e`.

The recovery owner now lives in `BoardWorkspacesModule`, above the conditional detail modal. It captures the account scope, physical key, exact original bytes, board/list/card target, operation kind, stable proposal ID, and one activity timestamp. Checklist, attachment, and activity inputs clear only after the write returns success and the expected bytes are read back. Retry rebuilds only the proposed append from the latest editable fields. It refuses changed/missing/malformed bytes, account changes, deleted/archived/moved targets, and proposal collisions. Close, Escape, scrim close, and selecting another card cannot discard an unresolved append. A parent recovery surface remains when the original target disappears.

## Verification

- Original diagnosis runner at final source: 3/3 PASS (`original-three-final-99c36b0.log`). Each test observes a real rejected `xai_boards_v2` write, unchanged bytes, retained input, and visible failure.
- New focused semantics: 16/16 PASS; responsive CSS: 4/4 PASS (`focused-final-99c36b0.log`). These cover three two-failure/latest-field retries, stable IDs/timestamp, envelope preservation, missing/malformed/delete/archive/move refusal, A→B refusal, inline and parent recovery, invalid latest attachment, and three export payloads/filenames.
- Typecheck and lint PASS in the same focused log.
- Real isolated Chrome at `99c36b0`: PASS for actual checklist, attachment, and activity JSON downloads followed by retry, persisted one-entry identity, and reload. Viewports were 1280, 768, and 390 px; each had `scrollWidth === innerWidth`, recovery bounds inside the viewport, and 44 px action height (`native-99c36b0.log`). Synthetic local board data only.

## Full package comparison

The immutable archive immediately before the main implementation (`8105cc9`) ran 309 PASS / 9 FAIL. The final main implementation archive (`5c6ed8e`) ran 326 PASS / 9 FAIL, and the final responsive source (`99c36b0`) remained 326 PASS / 9 FAIL. The failure names are identical in `before-8105cc9.log`, `after-5c6ed8e.log`, and `final-99c36b0.log`: six `taskLinkCommand` cases and three Board module Task-link cases. They fail because the current D2/Task fixture does not persist `xai_task_cols` or advance acknowledgement past the task phase. This batch did not change that path, and the exact baseline comparison shows it introduced no new package failure.

This is bounded acceptance evidence for the three Board detail append operations. It does not close full Board, REL-05, D2, ordinary-field recovery, or linked-task work.
