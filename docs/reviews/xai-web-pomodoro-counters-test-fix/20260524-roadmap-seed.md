# Seed Brief — xai-web-pomodoro-counters-test-fix

| 字段 | 值 |
|---|---|
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #1 (W0) |
| 父 Brief | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 7 |
| 父 ADR | ADR-0009 §D2-G3 |
| 类型 | Bug-fix（test-only）— 推荐走 bugfix-loop |
| 候选包 | packages/plugin-web-pomodoro |

## Requirement (1-3 sentences)

Fix `derivedCounters.test.ts:41` time-handling drift: test fixture uses `2026-05-23` but `TODAY_LOCAL` is evaluated BEFORE fake-timers take effect, so it reads the host machine's real date (e.g. `2026-05-24 PDT`) and the assertion fails. Restore `pnpm --filter @repo/plugin-web-pomodoro test` to fully green so the Web package suite is trustworthy again.

## Hard Constraints

- Test-only change. **Do NOT modify any production code under `src/` outside `__tests__/`.**
- Two acceptable fixes: (a) reorder `vi.useFakeTimers()` + `vi.setSystemTime(fixtureDate)` BEFORE the `derivedCounters` import / `TODAY_LOCAL` evaluation; (b) change the test fixture date to a today-relative computed value derived AFTER fake-timers are active.
- No new dependencies. No `vitest.config.ts` rewrites unless absolutely required.
- Per ADR-0009 D4: P0 gap-closure work; bugfix-loop preferred (small scope, fast turnaround).

## Acceptance Signal

- `pnpm --filter @repo/plugin-web-pomodoro test` exits 0 with all tests passing (including `derivedCounters`).
- `pnpm --filter @repo/web test` (broader scope) — Pomodoro-related tests all PASS; no new failures elsewhere.
- Verify Cross-vendor gate: Codex `gpt-5.5-thinking medium` cold-read confirms the time-handling fix is correct (no off-by-one in midnight boundary handling, no DST trap).
