# click-through-matrix — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | click-through-matrix |
| Title | G0.3 click-through hit-test matrix |
| Roadmap | xai-g0-window-spike · feature #3 · G0.3 |
| Status | READY_TO_SHIP |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | Continue G0.5 Spaces/multi-monitor matrix |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-verify (Codex inline) |
| Updated | 2026-05-19 22:25 PDT |
| Blockers | None for G0.3; MAS fallback remains tracked by G0.6 |

## Phase Plan

### Phase 1 — Matrix prep

Status: DONE. Commit: `(this commit)`.

- Created click-through matrix template.
- Avoided native/window config changes in unattended mode.

## Review Notes

feature-review (Codex inline), 2026-05-19 14:43 PDT. Verdict: APPROVED for safe prep only.

## Verification Notes

feature-verify (Codex inline), 2026-05-19 22:25 PDT. Verdict: READY_TO_SHIP.

Manual evidence confirms transparent-area clicks behave normally, the Grid resize handle can be dragged, and clicking a file item reaches React with a visual flash. The private-API-disabled comparison fails at compile time because the current transparent-window implementation calls `.transparent(true)` on `WebviewWindowBuilder`, which is unavailable without private API support. This closes G0.3 evidence and moves the non-private/MAS fallback risk to G0.6.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 14:42 PDT | feature-plan (Codex inline) | Step 0 and plan: identified G0.3 as a manual/native validation gate; scoped safe prep only. | — | feature-review |
| 2026-05-19 14:43 PDT | feature-review (Codex inline) | Approved safe-prep plan; no code/window config changes allowed without human runtime evidence. | — | feature-build |
| 2026-05-19 14:44 PDT | feature-build (Codex inline) | Created click-through matrix template and docs. | (this commit) | feature-verify |
| 2026-05-19 14:44 PDT | feature-verify (Codex inline) | Marked BLOCKED because real macOS hit-test acceptance cannot be automated here. | (this commit) | feature-build |
| 2026-05-19 21:07 PDT | human + Codex inline | Recorded user report: transparent-area click-through behaved normally. | `e7fc4ab` | Complete remaining matrix |
| 2026-05-19 21:21 PDT | human + Codex inline | Recorded user report: resize handle drags and item click flashes, proving Grid pointer delivery. | `fafe818` | private-API-disabled comparison |
| 2026-05-19 22:25 PDT | feature-verify (Codex inline) | Temporarily tested with private API disabled; build fails because transparent window builder methods are unavailable without private API. Restored default config and Cargo feature. Status -> READY_TO_SHIP. | `4537d2d` | G0.5 |
