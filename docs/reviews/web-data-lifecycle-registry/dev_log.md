# web-data-lifecycle-registry — REL-04

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | web-data-lifecycle-registry |
| Title | REL-04 lifecycle coverage and explicit backup scopes |
| Module | web |
| Status | FIX_READY |
| Current Phase | BUG_DIAGNOSE |
| Executor | Codex bug-diagnose |
| Updated | 2026-09-09 |
| Suggested Next | bug-fix: declaration / export manifest / explicit device recovery scope |
| Verify Cross-vendor | Not run; no PASS claimed |

## Work Log

| Date | Work | Evidence | Next |
|---|---|---|---|
| 2026-09-09 | Read-only diagnosis after REL-03. Reconciled all 114 keys (38 account, 76 device), non-LS/dynamic families, active and dormant consumers. Confirmed TT/BK/Metrics account lifecycle already covered; reproduced authoritative BK device-layout exclusion and documented unowned/archive retention. No product source modified. | 3 isolated jsdom characterization cases PASS; detailed report and machine-readable key matrix. These are not full export/restore or production deletion acceptance. | Parent selects minimal remaining REL-04 implementation; avoid repeating REL-03. |
