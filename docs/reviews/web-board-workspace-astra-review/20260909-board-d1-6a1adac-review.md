# Board D1 canonical task link — independent review

Astra, non-author, Web module, 2026-09-09. Fixed product `6a1adac49273d68aa67160b7dc824ca953289c7f`; review against `7b95133`. **Not accepted: two P1 defects and one P2 UI error-ownership defect remain.** The original four parent assertions pass independently, as does the complete Board package (26 files / 316 tests). Neither result cancels the three new correct FAIL assertions.

## Confirmed findings and minimum repair contract

### P1 — physical Board JSON null is overwritten by fallback seed

`src/internal/taskLinkCommand.ts:16–24` maps both missing physical bytes and JSON `null` to JavaScript null, exempts that value from domain validation, then loads default Boards. With physical Board bytes `null`, a call for `b-default/bc1` writes a default Board intent, writes a canonical Task, acknowledges the fabricated source and returns `{ok:true}`. Our syntax-corrupt control refuses before intent and preserves bytes.

**Ownership: `taskLinkCommand.ts`, Board read/source lookup.** Retain the physical read status separately from decoded data. Present JSON null, malformed JSON, unsupported/domain-invalid source must refuse before any intent or Task write; no render fallback can qualify as a persisted source card. Genuine missing Board initialization belongs to the existing proven initialization path; the link command must then resolve a real persisted card. This is distinct from legitimate absent **Tasks**, which must still initialize through the canonical writer and pass the original control.

### P1 — old completion acknowledges and erases a newer same-ID pending request

`taskLinkCommand.ts:112–117` compares only `taskId` before deleting `latest.pending`. Our actual Tasks same-tab publication subscriber writes a valid Board snapshot via public `setPref`, replacing the pending title/due date while retaining the same deterministic task ID. This occurs after the Task write and before the command resumes acknowledgement. The Task retains the original title, but the command returns success and removes the newer pending request. The test asserts acknowledgement refusal and exact preservation of that newer link; both fail. A control that removes the link entirely is correctly refused at acknowledgement.

**Ownership: `taskLinkCommand.ts`, locked Task mutation and acknowledgement.** Capture the precise source/link intent whose Task step succeeded (including pending content and relevant link identity), then compare the current link against that committed intent before clearing pending. Checking the deterministic task ID alone cannot identify an operation. Preserve the current Board bytes and report `phase:'acknowledgement'` on mismatch; do not roll back the already committed Task. Preserve support for an unchanged pending intent following a stable card to a new list before Task commit. Explicitly distinguish an existing linked Task/no-op retry from a newly committed task, so a retry cannot silently claim a different pending payload was saved. This is a synchronous before-ack condition, not a claim of atomicity across keys or all tabs.

### P2 — settled failure message leaks into another card's editor

`BoardWorkspacesModule.tsx:585–589` resets pending and increments the operation token when the active card changes, but does not reset or scope `taskLinkError`. Actual UI reproduction: open bc1, fail link through rejected lock acquisition, await its alert, close it, open bc2. bc2 has its normal Create Task button and also displays bc1's “Link intent saved; task creation failed. Retry to finish.” message, despite having no such pending request.

**Ownership: `BoardWorkspacesModule.tsx`, active-card session/error state.** Clear the old error on a new editor session, or key it by the full captured card/session identity. Retain the existing operation-token protection: our delayed old failure correctly leaves the new card's pending operation and editor intact. Do not clear the new operation's pending state when the old one finishes.

## Independent evidence

All product/package source and setup were extracted from `git archive 6a1adac`. Workspace Tasks changes were not read into the execution. Root's original `board-link.test.ts` is copied unchanged as `d1-board-parent-baseline.test.ts`; its earlier `94f1183` log remains in the parent's directory. We produced every final log below ourselves.

```sh
node docs/reviews/web-board-workspace-astra-review/verify-d1-board.mjs 6a1adac
```

| Artifact in this directory | Independent result |
| --- | --- |
| `d1-board-parent-baseline-6a1adac.log` | 4 PASS: absent Tasks creation, receipt-preserving envelope/idempotence, JSON null and envelope-null Tasks refusal before intent |
| `d1-board-boundaries-6a1adac.log` | 12 PASS / 3 FAIL, findings above |
| `d1-board-package-6a1adac.log` | 26 files / 316 tests PASS with archived package root/config semantics |

Additional PASS boundaries: lock-delayed Tasks null/syntax corruption, ID collision, source card removal, replaced link ID, A→B, persisted generation change; legitimate stable-card move; missing link after Task commit; actual Module/modal delayed pending and duplicate suppression, quota failure followed by successful Retry, and old failure completion while another card has a pending operation. These use actual storage/command/components; the lock scheduler is a deterministic test seam, not native browser concurrency proof. Package tests also preserve the intent/task/acknowledgement quota/retry and archive/restore identity checks.

The exploratory log is retained as `d1-board-boundaries-6a1adac-exploratory-fixture.log`. It is not the final verdict: its marker probe changed only metadata while leaving the current generation valid, which is not the asserted generation-switch case; its first replacement-pending probe used an invalid string title and therefore tested domain refusal. The final fixtures replace the persisted generation and use a valid bilingual pending title, respectively. No original parent assertion was changed. The first package harness omitted the package's `globals:true`, disabling React Testing Library auto-cleanup and causing 170 contaminated test failures. Its complete log is retained losslessly as `d1-board-package-6a1adac-harness-attempt.log.gz`; after matching archived package globals, root, setup and mock-reset semantics, all 316 pass. These harness failures are not attributed to product code.

## Changed-test review and scope

The author adapted existing operations to await the actual command or visible failure/pending completion and decode canonical Task data. Intent/task/ack failure distinctions, source identity collision refusal, stable-card move/archive/restore, owner refusal and present-null rejection remain asserted. The old staged B2 test that expected protected-envelope refusal is deliberately replaced by D1's successful coordinated write/receipt assertion; the unchanged independent parent receipt/bytes control verifies the intended stage transition. No real user command was replaced by a raw write. Two unrelated Module waits now inspect an already absent pending field and do not add a task-link completion guarantee; their original Board creation/seed assertions remain.

This review does not rerun types/lint or add native browser evidence. It does not accept cross-key atomicity, universal old-client coordination, full Tasks D1, D2, AI-02, Board/REL-05 closure, or the separately recorded checklist/attachment/comment draft-loss work. Minimum product ownership needed for the three confirmed repairs is only `taskLinkCommand.ts` and `BoardWorkspacesModule.tsx`, plus their focused tests. No product or total ledger was edited by this reviewer.
