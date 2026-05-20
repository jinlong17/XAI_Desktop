# finder-dnd-path — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | finder-dnd-path |
| Title | G0.4 Finder DnD path-first validation |
| Roadmap | xai-g0-window-spike · feature #4 · G0.4 |
| Status | READY_TO_SHIP |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | Continue remaining G0 manual gates |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-verify (Codex inline) |
| Updated | 2026-05-19 22:09 PDT |
| Blockers | None for G0.4; G0.3/G0.5/G0.6 still require separate manual evidence |

## Phase Plan

### Phase 1 — Path-first matrix prep

Status: DONE. Commit: `(this commit)`.

- Created Finder path-first matrix template.
- Avoided DnD implementation changes in unattended mode.

### Phase 2 — GridWindow drop telemetry

Status: DONE. Commit: `7e20ca8`.

- Added a G0-only `tauri://drag-drop` listener in `apps/desktop/src/windows/GridWindow.tsx`.
- Records `gridId`, `source`, `paths`, path-kind classification, position, and timestamp.
- Displays the latest Finder DnD telemetry in the Grid window for manual evidence capture.
- Still requires real Finder drag/drop verification for file, folder, `.app`, and alias payloads.

### Phase 3 — Prefer Tauri path-first drop in Grid windows

Status: DONE. Commit: `58c926d`.

- Human screenshot proved `tauri://drag-drop` receives a real file path.
- Removed the GridWindow HTML5 drop fallback that could add the same Finder item a second time.
- Preserved hover state with Tauri `DRAG_ENTER`, `DRAG_OVER`, and `DRAG_LEAVE`.
- Added a 1-second identical payload guard for duplicate Tauri drop events.

### Phase 4 — Deduplicate dropped paths per Grid

Status: DONE. Commit: `18b48da`.

- Human screenshot showed `.app` drops still duplicated after the GridWindow path-first fix.
- Added Organizer-side idempotency by normalized `gridId + filepath`.
- Skips a path already present in the target Grid.
- Skips repeated receipt of the same path for the same Grid within 5 seconds.
- Human post-fix screenshot confirms `/Applications/QQ.app` now appears once in the Grid.

### Phase 5 — Alias path-form policy

Status: DONE. Commit: `(this commit)`.

- Human screenshot shows alias drop telemetry as `source: tauri://drag-drop`, kind `file`, path `/Applications/QuickTime Player.app alias`.
- ADR-0005 records the G1 policy: preserve the alias file path at ingress and do not silently resolve it to the target app path.

## Review Notes

feature-review (Codex inline), 2026-05-19 14:46 PDT. Verdict: APPROVED for safe prep only.

## Verification Notes

feature-verify (Codex inline), 2026-05-19 22:09 PDT. Verdict: READY_TO_SHIP.

Human screenshot evidence confirms real file, folder, `.app`, and alias file paths through `tauri://drag-drop`. The post-dedupe `.app` rerun passed with `/Applications/QQ.app` appearing once. Alias path form is `/Applications/QuickTime Player.app alias` with kind `file`, so ADR-0005 records `PRESERVE_ALIAS_PATH`. Deferred gates recorded in `docs/workflow/roadmap/xai-v1.deferred-gates.md`.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 14:45 PDT | feature-plan (Codex inline) | Step 0 and plan: identified G0.4 as a Finder/Tauri runtime validation gate; scoped safe prep only. | — | feature-review |
| 2026-05-19 14:46 PDT | feature-review (Codex inline) | Approved safe-prep plan; no DnD implementation changes without captured runtime evidence. | — | feature-build |
| 2026-05-19 14:47 PDT | feature-build (Codex inline) | Created Finder path-first evidence template and docs. | (this commit) | feature-verify |
| 2026-05-19 14:47 PDT | feature-verify (Codex inline) | Marked BLOCKED because real Finder drop acceptance cannot be automated here. | (this commit) | feature-build |
| 2026-05-19 20:31 PDT | feature-build (Codex inline) | Added G0 Finder DnD telemetry to GridWindow after runtime grid-window recovery. | `7e20ca8` | feature-verify |
| 2026-05-19 20:31 PDT | feature-verify (Codex inline) | `desktop tsc`, `plugin-organizer check-types`, and `desktop build` pass; runtime Finder matrix remains manual. | `7e20ca8` | Human runtime evidence |
| 2026-05-19 21:07 PDT | human + Codex inline | Recorded user report: Finder items can be dragged into Grid. | `e7fc4ab` | Capture exact per-kind payloads |
| 2026-05-19 21:21 PDT | human + feature-build (Codex inline) | Recorded screenshot evidence and fixed duplicate item creation by making GridWindow path-first only. | `58c926d` | post-fix runtime rerun |
| 2026-05-19 21:56 PDT | human + feature-build (Codex inline) | Recorded `.app` duplication screenshot and added Organizer-side path dedupe. | `18b48da` | post-dedupe app rerun |
| 2026-05-19 22:02 PDT | human + feature-verify (Codex inline) | Recorded post-dedupe `.app` pass: `/Applications/QQ.app` appears once with Tauri path telemetry. | `18b48da` | alias payload evidence |
| 2026-05-19 22:06 PDT | human + feature-verify (Codex inline) | Recorded alias functional validation success; exact alias path form still needs telemetry capture. | `18b48da` | alias path-form capture and ADR update |
| 2026-05-19 22:09 PDT | human + feature-verify (Codex inline) | Recorded alias path form and ADR policy; marked G0.4 READY_TO_SHIP. | `(this commit)` | Continue G0.3/G0.5/G0.6 evidence |
