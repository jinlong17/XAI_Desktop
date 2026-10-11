# Astra independent Board workspace recovery review

Verdict: **CHANGES REQUIRED** for the bounded workspace recovery claim at product commit `3e7f17a9b668074d3fc6fae27e10071c0b144f9b`. Valid-data failure/retry behavior is independently supported, but two P1 data-preservation defects block acceptance of corrupt-state handling. This does not close Board, REL-05, REL-07, release readiness, or the separate Sol acceptance gate.

Module: `web`. Shared branch: `codex/web/full-product-audit-20260908`. Reviewed author evidence: `docs/reviews/web-board-workspace-save-fix/`, formal browser snapshot `b55227b`; `13eb117` normalized documentation and the old `1ae0ee8` log remains historical. Reviewer did not change product files or the central ledger. Calendar/AI/Sol concurrent edits were excluded. The Board workspaces/core/storage trees matched `3e7f17a` during review; runtime verification additionally extracted an immutable `git archive 3e7f17a` and explicitly resolved workspace imports into that snapshot. Dependency installations were reused through symlinks, not reinstalled.

## Blocking findings

### BW-ASTRA-01 — P1: schema-invalid workspace data is silently overwritten

At `packages/plugin-web-board-workspaces/src/internal/useWorkspaceSaveRecovery.ts:16`, `matches` only establishes parsed JSON equality with the rendered raw value. It does not validate its structure. Lines 22–26 then call `loadWorkspacesOrDefault`, which replaces invalid input with seed workspaces before `save(next)` at line 35. A persisted value of `[{"id":"recover-me","name":{"en":"Original"},"color":123}]` passes the raw equality check. Create replaces it with the two default workspaces plus the new workspace, deleting the original recoverable record without an alert. Syntax-invalid JSON is refused; schema-invalid JSON is not.

Independent component cases reproduce both direct create and quota-failure → retry. The failed initial quota write retains bytes and displays recovery; after storage recovers, Retry overwrites those same invalid bytes. The independent Chrome case reproduces direct create after a real StorageEvent and records before/after bytes and `alert:false` in `native-independent.log`. This is a defect in the reviewed recovery path itself, not a reason to exclude the case under REL-07.

Required behavior: reject unusable persisted workspace data before mutation; retain original bytes and the latest draft for recovery/export. Do not treat default rendering as write authorization.

### BW-ASTRA-02 — P1: invalid board data authorizes an unsafe workspace deletion

The delete branch at `packages/plugin-web-board-workspaces/src/internal/useWorkspaceSaveRecovery.ts:30` compares raw board bytes, then line 32 uses `loadBoardsOrDefault(rawBoards)` as membership evidence. For `[{"id":"valuable-board","workspaceId":"empty","title":"Recover me"}]`, the invalid schema becomes default boards, none of which belong to workspace `empty`. Delete removes `empty` from the real workspace directory despite the stored record naming it as its parent. Board bytes remain unchanged, but the referenced workspace is removed. No failure notice appears.

Independent component cases reproduce direct deletion and quota-failure → retry. The independent Chrome case reproduces direct deletion and records unchanged board bytes, removed workspace, and `alert:false`. The intended empty-only deletion contract cannot be established from invalid board data.

Required behavior: validate membership source without default fallback; reject deletion when membership cannot be trusted. The ordinary `pick` branch uses the same fallback at line 19 and should receive the same invalid-state guard, though this batch did not independently reproduce that sibling behavior.

## Independent verification

| Evidence layer | Result | What it establishes |
| --- | --- | --- |
| Frozen package suite | 25 files / 299 tests PASS | Existing workspace package regressions, not full Board acceptance |
| Frozen author component contract rerun | 10/10 PASS | Original five rejected-write assertions and author recovery cases were rerun by reviewer |
| Reviewer component business assertions | 5 PASS / 4 FAIL | Recolor/delete retry durability through remount, external membership refusal, absent workspace creation, syntax-invalid JSON refusal; two structural-invalid defects in direct and retry paths |
| Reviewer execution of author Chrome scenarios | 4/4 PASS | Create stable candidate ID/latest downloaded JSON/retry; rename latest downloaded JSON/retry; ordinary pick; A→B retry/export refusal |
| Additional reviewer Chrome scenarios | 2 PASS / 2 FAIL | Recolor and empty deletion failure/retry persist successfully; malformed workspace create and malformed-membership deletion reproduce the defects |

Counts describe different layers and are not summed. Author native evidence originally covered only create/rename/pick/A→B; recolor/delete were component-only in that submission. This reviewer batch adds narrowly scoped Chrome recolor/delete persistence failure/retry evidence. It does not retroactively enlarge the author evidence or prove every recolor/delete scenario in a browser.

`verify-component.mjs` copies the reviewer tests into an archived product tree and records each Vitest exit code. The final runner propagates a failing suite status. `verify-native.mjs` and `native.tsx` are copied from the author's reviewed harness; `verify-independent-native.mjs` reuses that CDP transport with reviewer-authored assertions. Chrome runs with a temporary profile, local fixture server, synthetic quota faults, and isolated downloads. Actions use DOM event/click injection, not physical pointer/keyboard automation; trusted gesture, focus/blur, visual layout, and full SPA integration are not proven. Downloaded JSON is read and asserted by the replay harness; no production account or external service is involved.

Commands from repository root:

```bash
node docs/reviews/web-board-workspace-astra-review/verify-component.mjs 3e7f17a
node docs/reviews/web-board-workspace-astra-review/verify-component.mjs 3e7f17a independent
BOARD_WORKSPACE_NATIVE_LOG=native-author-replay.log node docs/reviews/web-board-workspace-astra-review/verify-native.mjs 3e7f17a
node docs/reviews/web-board-workspace-astra-review/verify-independent-native.mjs 3e7f17a
```

The reviewer-only component command and independent Chrome command intentionally exit 1 on the fixed target because the preservation assertions fail. Do not invert or weaken those assertions. `independent.log`, `component-console.log`, and `native-independent-console.log` retain the failures. Typecheck/lint were inspected as author evidence and were not independently rerun in this bounded review.

## Minimal repair ownership and state semantics

The expected minimum product ownership is `packages/plugin-web-board-workspaces/src/internal/useWorkspaceSaveRecovery.ts`. Public core exports already provide `isBoardWorkspaceArray` and `readBoardStorage`; no Calendar, AI receipt, BoardCreator, composer, central ledger, or core storage format change is required for these defects. Add focused regression coverage in the owning package or the author's evidence directory; preserve this review directory and its baseline failures. If UI changes are needed, explicitly extend ownership to `BoardSwitcher.tsx` / `BoardWorkspacesModule.tsx` rather than editing concurrent work.

- **Absent** means the physical localStorage key returns `null`. This is the existing fresh-install/default state, and absent workspace creation independently passes. Preserve that supported behavior. An absent key must still match the captured baseline; a key removed after the action began is a conflict, not a fresh-install exception.
- **Corrupt/unusable present state** means bytes exist but cannot be parsed, fail the relevant schema/version contract, contain stored JSON `null` rather than a missing key, or violate the nonempty directory/board invariant. Preserve bytes and refuse mutation. Equality with the captured bytes is necessary but insufficient. Both the first attempt and Retry need this gate.
- **Valid empty workspace** means a structurally valid workspace entry in a usable nonempty workspace directory, with zero references in a trustworthy board membership source and at least one other workspace remaining. This is the supported deletion case, independently passing. It is not the same as an empty or invalid entire board payload.
- **Persisted empty arrays** must not be silently conflated with missing keys. `readBoardStorage([])` currently returns `invalid` (`empty board array`), and `loadWorkspacesOrDefault([])` currently renders defaults. This patch should preserve such bytes and require explicit recovery rather than silently rebuilding storage. Supporting an empty entire Board collection would require a separate contract decision; it is not granted by this review.
- **Absent board storage** may use the existing initial seed policy only when absence is genuine and stable; it does not justify fallback for present invalid data. Preserve the current last-workspace and seed-board membership restrictions.

Revalidation should retain the existing successful paths and make all four independent preservation assertions pass on a new fixed product commit, including parsed-but-invalid workspace data, invalid board membership, and quota retry. Add guards/tests for stored null/empty arrays and ordinary pick with invalid board data. Re-run the relevant native scenarios on that fixed commit before claiming browser coverage.

Remaining limits: no cross-tab atomic transaction proof; no production deployment/full SPA/Cloud sync acceptance; no durable draft across page reload promise; no whole-feature acceptance. The two data-preservation defects are actionable blockers despite the passing valid-data paths.
