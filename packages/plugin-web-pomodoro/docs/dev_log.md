# Dev Log — plugin-web-pomodoro (bugfix lineage)

> This dev_log tracks **post-ship bugfix** workflow state for the `plugin-web-pomodoro`
> package. The original feature-dev → ship lineage lives at
> `packages/xai-web-pomodoro/docs/dev_log.md` (SHIPPED 2026-05-23). This file
> begins the canonical `packages/plugin-*/docs/dev_log.md` contract for this
> package going forward — every future workflow on this plugin maintains state
> here.

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | plugin-web-pomodoro |
| Title | derivedCounters.test.ts time-handling drift — `TODAY_LOCAL` evaluated at module-import time reads host's real `Date.now()` instead of the fake-timer-anchored `vitest.setup.ts` system time, causing DC3 + DC4 to fail every day except the day the test was authored (2026-05-23) |
| Current Phase | BUG_VERIFY |
| Status | FIX_READY_FOR_VERIFY |
| Suggested Next | bug-verify |
| Verify Cross-vendor | inherited `yes` (roadmap row default; small test-only fix — Codex `gpt-5.5-thinking medium` cold-read on the fix patch satisfies the gate per ADR-0009 §D2-G2) |
| Automation Mode | A-Claude (inherited from `xai-web-console-gap-closure.md` default; current dispatch via `xai-roadmap-loop` serial mode for W0 pipeline-validator row) |
| Executor | claude-sonnet-4-6 — bug-fix, 2026-05-24 |
| Updated | 2026-05-24 20:37 |
| Dispatched By | xai-roadmap-loop (serial mode, Wave 0, row #1) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console-gap-closure.md row #1 (W0 · pipeline validator) |
| Parent Brief | docs/reviews/xai-web-pomodoro-counters-test-fix/20260524-roadmap-seed.md |
| Parent Source | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 7 |
| ADR Anchor | ADR-0009 §D2-G3 (P0 gap-closure work; bugfix-loop preferred per §D4) |
| Original Feature Lineage | packages/xai-web-pomodoro/docs/{design,api,test,dev_log}.md (SHIPPED 2026-05-23, NOT modified by this bugfix) |
| Write Scope | **test-only**: `packages/plugin-web-pomodoro/src/__tests__/derivedCounters.test.ts` (single file). No production code under `src/` outside `__tests__/` may be touched (hard constraint from seed brief). No `vitest.config.ts` / `vitest.setup.ts` / `__fixtures__/` edits required. Plus this `dev_log.md` (workflow state). |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-pomodoro-counters-test-fix/20260524-roadmap-seed.md`
- Roadmap manifest: `docs/workflow/roadmap/xai-web-console-gap-closure.md` (row #1)
- Failing test: `packages/plugin-web-pomodoro/src/__tests__/derivedCounters.test.ts:41` (DC3) and `:54` (DC4)
- Production code under examination (NOT to be modified): `packages/plugin-web-pomodoro/src/internal/derivedCounters.ts` + `packages/plugin-web-pomodoro/src/internal/formatRecordDate.ts` (provides `localDateKey`)
- Test setup (NOT to be modified): `packages/plugin-web-pomodoro/vitest.setup.ts` (sets system time to `2026-05-23 14:30 local` inside `beforeEach`)
- Fixtures (NOT to be modified): `packages/plugin-web-pomodoro/src/__fixtures__/sessions.ts` (hardcoded `2026-05-23` / `2026-05-22` ISO dates)
- Original feature lineage (read-only context): `packages/xai-web-pomodoro/docs/dev_log.md` (SHIP entry, 2026-05-23 19:07)

## Reproduction Protocol

### Environment
- macOS Darwin 25.4.0
- Host TZ at reproduction time: `PDT (GMT-0700)`
- Host wall-clock at reproduction time: `Sun May 24 2026 20:32 PDT` → `localDateKey === "2026-05-24"`
- Command: `pnpm --filter @repo/plugin-web-pomodoro test`

### Steps
1. Ensure host system date is NOT `2026-05-23` (any subsequent day reproduces; today is `2026-05-24 PDT`).
2. Run `pnpm --filter @repo/plugin-web-pomodoro test` from repo root.
3. Observe `derivedCounters.test.ts > DC3` and `> DC4` fail; the other 13 tests in that file pass.
4. Overall suite: `Test Files: 1 failed | 15 passed (16)` · `Tests: 2 failed | 120 passed (122)` · `Exit status 1`.

### Exact Failure Output (captured 2026-05-24 20:32 PDT)

```
FAIL  src/__tests__/derivedCounters.test.ts > countTodaysPomos > DC3: completed focus session today → 1
AssertionError: expected +0 to be 1 // Object.is equality
- Expected: 1
+ Received: 0
 ❯ src/__tests__/derivedCounters.test.ts:41:66
     41|     expect(countTodaysPomos([FIXTURE_FOCUS_TODAY], TODAY_LOCAL)).toBe(1);

FAIL  src/__tests__/derivedCounters.test.ts > sumTodaysFocusMs > DC4: completed focus today → correct sum
AssertionError: expected +0 to be 1500000 // Object.is equality
- Expected: 1500000
+ Received: 0
 ❯ src/__tests__/derivedCounters.test.ts:54:20
     54|     expect(result).toBe(25 * 60 * 1000);
```

## Root Cause Summary

**Category:** Test setup-order / today-evaluation eagerness (NOT a timezone/DST bug, NOT a production logic bug).

**Mechanism (verified by `node -e` probe + source inspection):**

1. `vitest.setup.ts` (line 19-22) registers `vi.useFakeTimers()` + `vi.setSystemTime(new Date(2026, 4, 23, 14, 30, 0))` inside `beforeEach` — meaning the fake clock is installed **once per test**, *before each `it()` body runs*.
2. `derivedCounters.test.ts:26` declares `const TODAY_LOCAL = localDateKey(new Date());` at **module top-level (import-time)**. ES module top-level code runs *during the module-graph load phase*, which executes **before any `beforeEach` hook** in vitest's lifecycle. So `new Date()` here reads the **real host clock**, not the fake-timer-anchored clock.
3. On `2026-05-24 PDT`, real-host `localDateKey(new Date())` = `"2026-05-24"`. Therefore `TODAY_LOCAL === "2026-05-24"`.
4. `FIXTURE_FOCUS_TODAY.finishedAt = "2026-05-23T14:30:00.000Z"` → in PDT (UTC-7) that is local `2026-05-23 07:30 PDT` → `localDateKey === "2026-05-23"`.
5. `countTodaysPomos([FIXTURE_FOCUS_TODAY], "2026-05-24")` filters for sessions where `localDateKey(finishedAt) === "2026-05-24"` — no match — returns `0` instead of `1`.
6. Same mechanism breaks `sumTodaysFocusMs` (DC4: expected `1500000`, got `0`).
7. The other 13 tests in this file pass either by coincidence (DC1/DC2/DC3b/DC5 assert `0` and get `0` for the wrong reason) or because `computeStreak`'s "fall back to yesterday" branch silently absorbs the off-by-one-day (real-today `2026-05-24` minus 1 day = `2026-05-23`, which matches the fixture; streak walks from yesterday and the math happens to come out right).

**Why this passed at ship time (2026-05-23) but fails now (2026-05-24+):**
On the day the test was authored, real-host `TODAY_LOCAL` *coincidentally* equaled the setup-anchored fake `TODAY_LOCAL` (both `"2026-05-23"`), so the eager evaluation was indistinguishable from setup-time evaluation. Classic "test passes on the day it was written" anti-pattern. Failure surfaces on every subsequent day.

**Cross-validation that this is NOT a TZ/DST issue:** I confirmed with `node -e` that on this PDT host, the fake-time anchor (`new Date(2026, 4, 23, 14, 30, 0)`) and the fixture UTC instant (`new Date('2026-05-23T14:30:00.000Z')`) BOTH resolve to `localDateKey === "2026-05-23"`. The mismatch is purely the real-time-vs-fake-time gap at module-import.

**Production code is correct:** `derivedCounters.ts` + `formatRecordDate.ts` accept `todayLocal` as a caller-provided string parameter — they make no `new Date()` call themselves. The bug is 100% in the test's parameter computation. Per seed brief hard constraint, production code must NOT be modified.

## Fix Rationale

### Acceptable fix paths (from seed brief)
- **(a)** Reorder `vi.useFakeTimers()` + `vi.setSystemTime(fixtureDate)` BEFORE the `derivedCounters` import / `TODAY_LOCAL` evaluation.
- **(b)** Change the test fixture date to a today-relative computed value derived AFTER fake-timers are active.

### Chosen approach: **variant of (a)** — kill the import-time `new Date()` call entirely

Strict path (a) is impractical because the fake-timer setup is in a separate `vitest.setup.ts` file invoked via `beforeEach`, and ES module imports are hoisted before any module body code runs — so we cannot "reorder" the existing setup *before* an import without restructuring the setup file. Path (b) is wrong-direction: fixtures are intentionally fixed calendar dates (`2026-05-23`, `2026-05-22`) anchored to the setup's `TEST_NOW`.

**The minimal, correct, TZ-robust fix is to hardcode `TODAY_LOCAL` to match the setup's deterministic anchor:**

```ts
// Before (buggy — module-import-time evaluation):
const TODAY_LOCAL = localDateKey(new Date());

// After (deterministic — matches vitest.setup.ts TEST_NOW = 2026-05-23):
const TODAY_LOCAL = "2026-05-23";
```

**Why this is the smallest correct fix:**
1. Removes the import-time `new Date()` call → no eager evaluation, no real-clock leak.
2. Removes the now-unused `localDateKey` import from `formatRecordDate.js` (if `TODAY_LOCAL` is the only consumer in this file).
3. Aligns `TODAY_LOCAL` literal with the `vitest.setup.ts` `TEST_NOW = new Date(2026, 4, 23, ...)` literal — both express the *same* calendar date, so the test stays internally consistent without any indirection through `Date` arithmetic.
4. Zero runtime dependency on host TZ for the fixture matching (the fixture's `finishedAt: "2026-05-23T14:30:00.000Z"` resolves to local `2026-05-23` in any real-world TZ from UTC-14 through UTC+9, which covers every populated timezone — and the setup anchor `new Date(2026, 4, 23, 14, 30, 0)` is constructed as local time so it always resolves to local `2026-05-23` by construction).
5. Adds a comment that explicitly links the literal back to `vitest.setup.ts`'s `TEST_NOW` to prevent future drift if either anchor changes.

**Alternative considered + rejected:** moving `TODAY_LOCAL = localDateKey(new Date())` *inside* each `it()` block (so it runs after `beforeEach`). Works, but adds 14 line-edits across the file vs. 1 line + a comment. Hardcoding is strictly smaller AND more self-documenting (literal matches setup literal).

### Files bug-fix must touch
1. `packages/plugin-web-pomodoro/src/__tests__/derivedCounters.test.ts` — change line 26 from `const TODAY_LOCAL = localDateKey(new Date());` to a hardcoded literal `"2026-05-23"` aligned to setup `TEST_NOW`; remove `localDateKey` import if it becomes unused; add a comment explaining the literal-to-setup linkage.
2. `packages/plugin-web-pomodoro/docs/dev_log.md` — update Status Panel: `Current Phase = BUG_FIX`, `Status = FIX_APPLIED` (or `BLOCKED` if anything fails), `Executor = <fix-time executor>`, `Updated = <fix-time>`, `Suggested Next = bug-verify`; append Work Log entry.

### Out of scope (do NOT touch)
- Any file under `packages/plugin-web-pomodoro/src/` outside `__tests__/`.
- `vitest.config.ts` / `vitest.setup.ts` / `src/__fixtures__/sessions.ts`.
- `packages/xai-web-pomodoro/docs/*` (original feature lineage — frozen post-ship).
- Any other package.

### Acceptance signal (re-stated from seed brief)
- `pnpm --filter @repo/plugin-web-pomodoro test` exits 0; all 122 tests pass (including all 15 in `derivedCounters.test.ts`).
- `pnpm --filter @repo/web test` (broader scope) — Pomodoro-related tests all PASS; no new failures elsewhere.
- Cross-vendor gate: Codex `gpt-5.5-thinking medium` cold-read confirms time-handling fix is correct (no off-by-one in midnight boundary, no DST trap; per ADR-0009 §D2-G2).

## Complex Defect Escalation

**Triggered:** NO.

Single-perspective (test-only setup-order issue) is fully sufficient. The defect does NOT:
- span a core/feature boundary (no `@repo/core` involvement, no plugin-to-plugin event channels, no manifest changes),
- involve `manifest.json` routing (manifest.json untouched),
- represent a regression of a previously-fixed defect (no prior fix exists).

Dual-perspective analysis would add no signal. Single-vector diagnosis is the right shape.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-24 20:33 | Claude Opus 4.7 (1M context) | bug-diagnose — created `packages/plugin-web-pomodoro/docs/` + this `dev_log.md` (canonical plugin-* docs contract initialized for first bugfix on this Stable package). Reproduced failure with `pnpm --filter @repo/plugin-web-pomodoro test` → 2/122 fail (DC3 + DC4) exactly as seed brief predicted. Validated root cause via `node -e` host-clock probe: real-host `localDateKey(new Date())` = `"2026-05-24"`, setup-anchored `localDateKey(TEST_NOW)` = `"2026-05-23"`, mismatch is at import-time eager eval (NOT TZ, NOT DST, NOT production logic). Defined fix strategy: hardcode `TODAY_LOCAL = "2026-05-23"` aligned to `vitest.setup.ts` TEST_NOW literal, drop now-unused `localDateKey` import, add inline comment linking back to setup. Test-only single-file change. Cross-vendor gate inherited yes. Complex escalation NOT triggered. Status FIX_READY. | — | bug-fix |
| 2026-05-24 20:37 | claude-sonnet-4-6 | bug-fix — implemented minimal test-only fix in `src/__tests__/derivedCounters.test.ts`: replaced `const TODAY_LOCAL = localDateKey(new Date())` (module-import-time eager eval) with `const TODAY_LOCAL = "2026-05-23"` (literal pinned to `vitest.setup.ts` TEST_NOW anchor); removed now-unused `localDateKey` import; added inline comment explaining why module-top-level `new Date()` must not be used here. Ran `pnpm --filter @repo/plugin-web-pomodoro test`: 122/122 pass (16 test files, exit 0). DC3 and DC4 now green. Zero production code touched. Roadmap: `xai-web-console-gap-closure.md` row #1 (W0). | TBD (commit below) | bug-verify |
