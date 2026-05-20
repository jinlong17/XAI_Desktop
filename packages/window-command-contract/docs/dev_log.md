# window-command-contract — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | window-command-contract |
| Title | G1.1 Window Command Contract |
| Roadmap | xai-g1-native-foundation · feature #1 · G1.1 |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_BUILD |
| Suggested Next | feature-verify |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-verify (Codex inline) |
| Updated | 2026-05-19 23:05 PDT |
| Blockers | None for G1.1 DMG/private path; MAS runtime remains deferred external |

## Phase Plan

### Phase 1 — Contract prep

Status: DONE. Commit: `(this commit)`.

- Created G1.1 feature docs.
- Cross-checked target commands against `docs/contracts/tauri-commands-v0.md`.
- Avoided production window command changes while G0 remains blocked.

### Phase 2 — Production command contract

Status: DONE. Commit: `dce4fb9`.

- Added structured Rust `CommandError` and `GridWindowSnapshot`.
- Updated create/update/focus commands to return snapshots.
- Added `list_grid_windows` and `focus_grid_window`.
- Added `@repo/core` window contract types and Organizer hook return types.
- Updated Tauri command contract docs and organizer manifest command list.

## Review Notes

feature-review (Codex inline), 2026-05-19 15:07 PDT. Verdict: APPROVED for safe prep only.

## Verification Notes

feature-verify (Codex inline), 2026-05-19 22:54 PDT. Verdict: APPROVED / READY_FOR_BUILD.

Safe-prep docs are complete. G0 now has Conditional Go for the DMG/private path, and the G1.1 production command contract has been implemented. MAS signed/sandbox runtime validation remains deferred external and is not mixed into this feature.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 15:06 PDT | feature-plan (Codex inline) | Step 0 and plan: initialized G1.1 as safe contract prep only under user override. | — | feature-review |
| 2026-05-19 15:07 PDT | feature-review (Codex inline) | Approved docs-only plan; production command implementation remains blocked by G0. | — | feature-build |
| 2026-05-19 15:08 PDT | feature-build (Codex inline) | Created Window Command Contract prep docs. | (this commit) | feature-verify |
| 2026-05-19 15:08 PDT | feature-verify (Codex inline) | Marked BLOCKED_BY_G0; no production code changed. | (this commit) | feature-build |
| 2026-05-19 22:54 PDT | feature-verify (Codex inline) | Reconciled G0 Conditional Go and unblocked G1.1 production build for the DMG/private path. | `1701583` | feature-build |
| 2026-05-19 23:05 PDT | feature-build (Codex inline) | Implemented structured window command contract, snapshots, list/focus commands, core TS types, and contract docs. | `dce4fb9` | feature-verify |
