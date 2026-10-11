# Board new-card failure diagnosis

Module web; product Board package unchanged since 885a111, repository checkpoint 96e3a5c. Actual BoardWorkspacesModule, real account-scoped Storage setter, synthetic default board. No product mutation.

Correct business assertion fails: fill a new card composer, reject the canonical xai_boards_v2 write with QuotaExceededError, require the original typed card to remain editable. The test confirms a real rejection occurred and stored bytes stayed unchanged before failing because card-composer-input was unmounted. This is a product FAIL, not a passing error-injection test.

Source: writeLists discards setRawBoards boolean. addCard unconditionally clears composerText and draftListId; addList follows the same unchecked pattern for newListName/showListComposer. The observed test covers new-card failure only; list failure is source evidence until separately reproduced.

Run: node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-board-card-save-recovery/verify.config.mjs

Repair must retain latest composer content, report rejected save, retry a stable proposal without duplicates, export recovery, and refuse newer-data or stale-account overwrites. Existing BoardCreator and TASK02 commands are separate verified paths. This diagnosis does not close other board edits, workspace management, cross-tab transactions, or full REL-05.
