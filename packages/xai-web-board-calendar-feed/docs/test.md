# Test Strategy - xai-web-board-calendar-feed

## Unit Helpers

- invalid/absent Board storage returns empty feed
- valid raw Board storage projects dated active cards
- v1 envelope storage projects dated active cards
- archived list/card rows are skipped
- `dueDate` wins over `startDate`
- merge preserves existing sample events before Board feed events

## Calendar Module

- no `xai_boards_v2` means Calendar day 14 stays empty
- seeded Board card with `dueDate: "2026-05-14"` appears in Month view
- seeded Board card with `dueDate: "2026-05-22"` appears in Week view all-day strip

## Verification Commands

```bash
pnpm --filter @repo/plugin-web-calendar lint
pnpm --filter @repo/plugin-web-calendar check-types
pnpm --filter @repo/plugin-web-calendar test
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test -- --run
pnpm --filter @repo/web build
pnpm --filter @repo/web test -- --run src/__tests__/build-manifest.test.ts
git diff --check
```

## Manual Smoke

Run mock-auth Web, seed a Board card due date, open `/app/calendar`, and verify
the Board card appears as an all-day event chip.
