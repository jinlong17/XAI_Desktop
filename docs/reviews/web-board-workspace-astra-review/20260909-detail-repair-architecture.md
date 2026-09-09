# Astra architecture review for the next Board detail repair

Scope: the three correct quota-failure diagnoses preserved by `a8774fd` at product `d7f1987`: checklist add, attachment add, activity/comment add. This is a design/acceptance review, not an implementation or new execution of those diagnosis tests. The diagnosis asserts rejected canonical writes and unchanged stored bytes before the failing editable-draft assertion; its subsequent alert assertion was not reached. Do not overstate the original evidence.

The proposed repair direction is acceptable with the following constraints. It must wait for the current workspace-initialization ownership to be released because both batches touch `BoardWorkspacesModule.tsx`.

## Minimal ownership

- `BoardCardDetailModal.tsx`: result-aware append submission; retained latest checklist text, attachment URL/title/provider, and activity text; visible recovery actions and close/Escape/scrim behavior.
- `BoardWorkspacesModule.tsx`: `updateCard`, `patchActiveCard`, the detail-modal wiring, and the lifetime/location of pending recovery when the selected card disappears or changes. Inspect Table/Calendar/Timeline callbacks and `unlinkActiveCardTask` because they also use this mutation path. Keep their success behavior; do not silently broaden this batch to all field editors or linked-task workflows.
- A focused new hook such as `internal/useBoardDetailSaveRecovery.ts` may own captured account/target/source, stable proposed append ID, retry, export and discard. Test files in the owning package/evidence directory are expected. Style edits only if the recovery UI requires them. Do not edit workspace, composer or creator recovery as incidental cleanup.

## Write and draft contract

`writeLists` already returns persistence success. `updateCard` currently drops that result; `patchActiveCard` also drops it and returns undefined when its target no longer matches. The Modal's `onPatchCard` contract is void, and the three append handlers unconditionally clear their inputs. A commit receipt must reach the editor all the way through this chain. Require an explicit successful result before clearing an append draft; undefined/target-missing/no-op is not proof of a committed append. A boolean can be sufficient if failures have separate structured recovery state. Avoid compatibility logic that interprets void as success.

Capture `{account owner, boardId, listId, cardId, original physical bytes, operation kind, stable entry id}` before the first append attempt; capture a comment timestamp once if it is part of the proposed entry. Retry uses current editable values with the same proposal identity. Attachment validation must be rerun against the latest provider/URL/title. Do not blindly replay a whole card snapshot or stale checklist/attachment/activity array over concurrent changes. A conservative raw-baseline conflict refusal is acceptable for this bounded fix; implicit merging is not required.

Use validated canonical board storage, not rendering defaults, and preserve legacy/envelope format. Prove that the same board/list/card still exists and is eligible before attempting persistence. `updateCardInList` returns mapped arrays even when no target exists; saving that no-op must not clear the draft as a success. Scope changes, deleted/archived/moved targets, changed raw bytes, malformed storage and key removal must retain/refuse rather than recreate or overwrite.

The recovery owner must outlive conditional `activeCardContext` rendering. Currently removing/archiving the target makes that context null and unmounts the Modal; a Modal-only pending hook would lose the draft before it could be exported. Keep pending state and a recovery surface above that conditional, or provide another explicit mechanism that retains it. Guard close button, Escape, scrim and target switching while recovery is unresolved, or persist the pending draft in a stable parent surface. Export must include the latest user fields and original target/proposal context, and must enforce account ownership. A successful download is not a successful save. Discard is explicit and must reset only the intended pending operation.

## Acceptance evidence

1. Keep the original three diagnosis tests and make their draft/alert assertions pass after a real rejected `xai_boards_v2` write. Attachment URL **and title**, plus provider, remain recoverable.
2. For each operation, fail twice while editing the draft, then restore storage and retry. Assert one persisted entry, stable proposal ID/timestamp where applicable, latest text/URL/title/provider, preserved unrelated card/list/board data and storage envelope, correct rendered content after remount, and cleared recovery only after a committed write. Invalid latest attachment input must remain unsaved and editable.
3. Export actual downloaded JSON in an isolated browser for checklist, attachment and activity latest drafts. Check filename/content as well as persisted bytes; do not substitute a successful Blob creation for a downloaded-file assertion. Retry/discard must not trigger duplicate append via blur or stale callback.
4. Exercise same-account external replacement/removal, target delete/archive/move, old-account A→B retry/export refusal, and malformed storage. Assert current canonical bytes survive; do not treat default data as source authorization. Include target disappearance that unmounts the normal detail editor and prove the draft is still recoverable.
5. Verify normal success for all three operations and relevant shared-caller regressions (Table/Calendar/Timeline updates and detail fields that consume the new callback signature). Keep this batch's acceptance bounded to the three append-draft operations and explicitly tested shared behavior; do not close full Board or REL-05.

No product edits were made for this architecture review.
