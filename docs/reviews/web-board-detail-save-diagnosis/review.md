# Board detail editor: rejected saves clear pending inputs

Module: web. Fixed product revision: `d7f1987`. This is a diagnosis, not a product fix or closure of REL-05 or any Board item.

Three independent desired-business assertions fail against a `git archive` snapshot: adding a checklist entry, attaching a valid URL, and adding a comment each reject the canonical `xai_boards_v2` write with QuotaExceededError, preserve stored bytes, but clear the corresponding editable input. All three assert that an actual canonical write was rejected and bytes stayed unchanged before reaching the failing draft-retention assertion. The subsequent visible-error assertion has not been reached and is not claimed as a runtime observation.

`BoardWorkspacesModule.writeLists` already returns the setter result, but `updateCard` ignores it. `BoardCardDetailModal.onPatchCard` is a void callback, and `addChecklistItem`, `addAttachment`, and `addActivityComment` clear their local inputs unconditionally after invoking it. The existing creator/composer/workspace recovery paths do not cover these detail-editor operations.

Evidence:

- `independent.log`: isolated fixed snapshot, 1 file / 3 correct FAIL, process exit 1.
- `before.log`: initial shared-working-tree reproduction, same three FAIL. Concurrent workspace-hook work was present; use the isolated run as the authoritative baseline.
- `detail-contract.test.tsx`: real Module, event interaction, account-scoped native jsdom Storage, synthetic quota fault. This is not native Chrome or full SPA evidence.

Reproduce:

```sh
node docs/reviews/web-board-detail-save-diagnosis/verify-fixed.mjs d7f1987
```

Next repair batch must propagate committed results back to the editor, retain the latest input and stable proposed entry id after failure, expose failure/retry/recovery export, and refuse stale-owner or conflicting-source overwrites. Confirm append retries cannot create duplicate checklist entries, attachments or comments. Original successful paths and actual storage/export contents need verification. Shared `updateCard` also serves Table/Calendar/Timeline and other detail fields; changing its contract requires inspecting those callers. This does not authorize a partial snapshot overwrite of unrelated fields.

The current Terra workspace-corruption repair owns a separate hook and should finish before the detail-editor batch begins. Do not change the original correct failure assertions to match draft loss.
