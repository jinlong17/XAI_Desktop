# REL-03 AI ownership sub-fix

Historical feature workflow remains at `../../xai-web-ai-chat/docs/dev_log.md`; this record is the bounded AI repair, not a reset of that historical delivery.

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | web-account-data-isolation / AI ownership sub-fix |
| Title | Origin-wide BYOK and stale AI work can cross account boundaries |
| Current Phase | BUG_VERIFY |
| Status | FIX_READY_FOR_VERIFY |
| Executor | Codex bug-fix |
| Updated | 2026-09-09 11:22 America/Los_Angeles |
| Suggested Next | bug-verify combined REL-03 integration |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes; not performed by this worker |

## Fix and scope

Composite encrypted key rows + AAD, committed-marker checks, explicit legacy participant and metadata discovery, old-generation copy/rollback preservation, scoped connection/stream/tool lifetime, conversation migration owner validator. No host/storage/settings/other repositories changed. See design/api/test in this directory.

## Validation

31 files / 267 tests PASS. Final typecheck and lint PASS. No overall REL-03 completion or independent verification claim.

## Work Log

| Time | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-09-09 11:22 | Codex bug-fix | Implement and test bounded AI ownership/migration/async lifecycle repair | ebb91c2 | Combined independent bug-verify |
