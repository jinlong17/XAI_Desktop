# web-local-time-contract — Bugfix Work Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | web-local-time-contract (web) |
| Title | REL-01 六功能自然日、绝对时间与午夜刷新合同不一致 |
| Current Phase | BUG_VERIFY |
| Status | FIX_READY_FOR_VERIFY |
| Executor | Codex bug-fix |
| Updated | 2026-09-09 11:06 America/Los_Angeles |
| Suggested Next | bug-verify |
| Automation Mode | A-Codex |
| Verify Cross-vendor | yes |

## Reproduction Protocol

见 `20260909-bug-diagnose.md`。Pacific瞬间2026-09-09T06:30Z：Habits/Calendar为09-09，TT为09-08；DST自然日23/25小时，固定24小时端点错误。Calendar/Statistics/Metrics mount memo冻结；Tasks依赖分桶。

## Root Cause

日期身份与真实瞬间混用、UTC与设备本地口径不一致、React日期时钟没有生命周期调度、Tasks缺少真实dueDate。Calendar DST表仅覆盖2026 Pacific，冒充通用本地时间。

## Fix Rationale

以现有tokens公共API为统一owner，S1共享helper/hook→S2六包接线→S3Tasks真实日期闭环→S4文档/回归/独立verify。保留历史日期键和绝对时间，禁止猜年份或平移旧数据。详细API、修改清单、验收矩阵见诊断文件。

## Verification

- 当前Tasks两套31测试PASS；Calendar两套7测试PASS，验证的是旧行为。
- Node TZ=America/Los_Angeles独立日期表达式复现日键分歧与23/25小时边界。
- 尚未实施修复，未执行完整六包或浏览器修复验收。

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-09-09 10:55 America/Los_Angeles | Codex bug-diagnose | 核对六包当前API与测试、独立复现日键/DST、写入四阶段修复与验证合同 | — | bug-fix S1→S4 |

## S1/S2 implementation receipt

- Shared tokens public civil-date API and midnight/resume clock implemented; five consumer packages migrated to device-local day semantics.
- Calendar uses actual offset transitions, fractional row heights, elapsed-time now line; repeated floating HH:MM resolves to earlier occurrence.
- Metrics new/edit writes UTC ISO measuredAt and resolves today/yesterday at save. Existing offsetless strings remain unchanged because their original timezone is unknowable.
- Tasks S3 completed in `337d2b8` by the parallel `rel01_tasks_fix` worker; whole REL-01 is ready for independent verification, not yet verified/shipped.
- Full package runs: tokens 55, Habits 126, Calendar 338, Statistics 151, Metrics 14, TT 28 passed (712). Subsequently Calendar added one fractional-row render assertion (target 339); TT added one date-boundary test (target 29); focused suites passed. Final token resume tests and Metrics suite re-run passed.
- UTC / America/Los_Angeles / Asia/Shanghai / Australia/Lord_Howe focused localDate suites passed for tokens, Habits, Calendar, Statistics, Metrics; TT focused matrix also passed all four zones.
- `pnpm --filter @repo/web check-types` PASS. Product build/browser independent verification belongs to parent/bug-verify; no independent PASS claimed.

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-09-09 11:04 America/Los_Angeles | Codex bug-fix | S1/S2 public API + five consumers + TZ/DST/midnight tests + API/design/test amendments | 2f04bd4 | Combine Tasks S3, then bug-verify |

## S3/S4 completion receipt (implementation verification only)

- `2f04bd4` — shared contract and five consumer packages, 57 files.
- `337d2b8` — Tasks dueDate full flow, 21 files. Inputs/edit/move/Board linkage/persist, midnight reprojection, legacy fields and source retained; parent clock updates preserve detail drafts.
- Tasks full run: 16 files / 156 cases PASS; typecheck and lint PASS. UTC/Pacific/Shanghai focused date suite: 3 files / 32 cases PASS in each zone (repeat coverage, not extra unique cases).
- Remaining token test strengthens non-circular DST assertions with known Pacific23/25 and Lord_Howe24.5/23.5 values; all four zones passed. Calendar fractional-row render and fall-back earlier-occurrence tests passed.
- Implementation validation totals: 714 unique cases across tokens/five consumers, plus156 Tasks cases =870. The last-added two cases ran in focused follow-up suites; this is not a claim that a single 870-case command was run.
- Web typecheck PASS. Independent bug-verify must still inspect the combined commit range, re-run original reproductions, and run Web build/browser lifecycle checks. No account-cloud/native runtime behavior is introduced or claimed.

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-09-09 11:06 America/Los_Angeles | Codex bug-fix | Combine S1–S4 implementation receipts; Tasks closed; fixed-value DST matrix verified | 2f04bd4, 337d2b8 | bug-verify |
