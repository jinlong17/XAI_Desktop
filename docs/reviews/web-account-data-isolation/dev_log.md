# web-account-data-isolation — REL-03 Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | web-account-data-isolation |
| Title | REL-03 business data and BYOK cross-account isolation |
| Module | web |
| Status | FIX_READY |
| Current Phase | BUG_DIAGNOSE |
| Suggested Next | bug-fix |
| Automation Mode | A-Codex |
| Verify Cross-vendor | pending; no PASS claimed |
| Executor | bug-diagnose (Codex) |
| Updated | 2026-09-09 |
| Blockers | Implementation must preserve unowned legacy data; no automatic first-account adoption |

## Diagnosis

Authoritative strategy: [20260909-rel03-diagnosis.md](20260909-rel03-diagnosis.md). Inventory: 114 concrete localStorage keys plus documented IDB/sessionStorage/runtime surfaces. Current adapters are origin-wide; provider-only BYOK plus persistent device UUID exposes prior account keys after auth switch. Two synthetic-data characterization tests reproduce both leaks. These passing tests confirm defects, not repairs.

## Work Log

| Timestamp | Executor | Goal / Done / Tests / Risks | Commits | Next |
|---|---|---|---|---|
| 2026-09-09 | bug-diagnose (Codex) | Goal: REL-03 isolation. Done: two-perspective auth/storage analysis, ownership inventory, migration and epoch strategy. Tests: 2 characterization cases PASS (leaks reproduced). Risks: no live-auth browser verification; cross-backend migration needs staged generation commit, fail-closed switch and rollback. | — (diagnosis only; no product code or commit) | bug-fix |
