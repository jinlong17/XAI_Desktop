# web-account-data-isolation — REL-03 Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | web-account-data-isolation |
| Title | REL-03 business data and BYOK cross-account isolation |
| Module | web |
| Status | LOCAL_VERIFY_PASS |
| Current Phase | BUG_VERIFY |
| Suggested Next | Preserve local verification evidence; complete outstanding cross-vendor and environment checks |
| Automation Mode | A-Codex |
| Verify Cross-vendor | pending; no PASS claimed |
| Executor | bug-fix (Codex), parallel owner integration |
| Updated | 2026-09-09 |
| Blockers | Cross-vendor review pending revoked OAuth; no hosted-auth acceptance claimed |

## Diagnosis

Authoritative strategy: [20260909-rel03-diagnosis.md](20260909-rel03-diagnosis.md). Inventory: 114 concrete localStorage keys plus documented IDB/sessionStorage/runtime surfaces. Current adapters are origin-wide; provider-only BYOK plus persistent device UUID exposes prior account keys after auth switch. Two synthetic-data characterization tests reproduce both leaks. These passing tests confirm defects, not repairs.

## Work Log

| Timestamp | Executor | Goal / Done / Tests / Risks | Commits | Next |
|---|---|---|---|---|
| 2026-09-09 | bug-diagnose (Codex) | Goal: REL-03 isolation. Done: two-perspective auth/storage analysis, ownership inventory, migration and epoch strategy. Tests: 2 characterization cases PASS (leaks reproduced). Risks: no live-auth browser verification; cross-backend migration needs staged generation commit, fail-closed switch and rollback. | — (diagnosis only; no product code or commit) | bug-fix |

| 2026-09-09 | bug-fix (Codex) | Goal: full local ownership and migration. Done: scope/registry/hooks, transactional generation migration, recovery APIs, captured-owner lifecycle, three repository adapters and owner blob guards. Tests: storage 113 PASS before final recovery addition; migration 10 PASS; three A/B/A repository cases PASS; Web typecheck PASS. Risks: parent host/AI/settings independent verification remains required, no cross-vendor PASS claimed. | fae9398 | parent independent bug-verify |

| 2026-09-09 | parent + independent bug-verify (Codex) | Done: Settings captured-owner operations and persistent deletion recovery; host recovery entry outside auth routes; 13 owner packages retain migration registrations in production bundles. Independent: 8 native Chrome joined checks, Settings 41, host 6, owner guards 38; page-reload recovery PASS. Parent Web 143, typecheck and build PASS. Entire REL-03 acceptance remains bounded to local evidence; no hosted Supabase/cross-vendor PASS. REL-06 first-receipt failure remains separately open. | 96d1914, 992f688, a8e3a03, 9638dbe | Remaining environment checks; continue REL-04/05/06 |
