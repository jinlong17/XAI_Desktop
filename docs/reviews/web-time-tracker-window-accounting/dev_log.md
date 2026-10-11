# Time Tracker window accounting — dev log

- Workflow = BUGFIX
- Target = web / plugin-web-time-tracker (TT-01; TT-03 overlap mapped)
- Title = First-start attribution loses cross-window time and admits future records
- Current Phase = BUG_FIX
- Status = FIX_READY_FOR_VERIFY
- Executor = Codex /root/rel02_auth_fix
- Updated = 2026-09-09
- Suggested Next = bug-verify

## Reproduction protocol

See `20260909-tt01-diagnosis.md` command and `window-reproduction.test.tsx`. Fixed TZ America/Los_Angeles; actual module/repository/snapshot with authenticated local scope. 11 correct-expectation tests: 9 failures reproduce cross-midnight/week/month, future end/record, DST day and paused-segment loss; 2 controls pass. Runner exits1 deliberately; no source implementation changes.

## Root cause / rationale

Selection uses first segment start, then sum uses entire entry duration. Shared read-only segment/window intersection with upper bound now must feed all consumers. Existing civil date helpers already account for DST; elapsed epoch duration control passes. Full task timer/editor/source IDs must not become day slices. TT-03 hourly/CSV overlap and delete-range semantics explicitly mapped before implementation.

## Work Log

- 2026-09-09: Parent assigned read-only TT-01 diagnosis during independent REL05 verify. Audited time/storage/module/widget call graph and all InsightType branches. Added correct-expectation probes and baseline log. Initial runner React resolution failure corrected in docs-only config before recording valid9-failure/2-control result. Wrote caller inventory, impact map and minimum full strategy. No products modified, no native/browser or cross-vendor PASS claimed.

## Fix iteration — 2026-09-09

Parent authorized complete TT-01 consumer-map implementation. Switched to bug-fix contract. Shared segment/window views preserve source IDs/segments and cap now; module/category/Insights/widget now share projection semantics. Completed TT-03 overlapping hourly/day buckets and CSV traceability; raw editor and destructive operations retain full sources with explicit deletion warning. Original11 tests unchanged nowPASS; owner suite63PASS; typecheck/lint/diff-checkPASS. See `20260909-fix.md` for implementation scope, limits and independent verify request. No push or independent/native PASS claimed.
