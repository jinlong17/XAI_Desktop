# Calendar canonical-write regression: stale Web Locks test shims

Parent session, 2026-09-14. Found while independently re-running the web package
suites after the 2026-09-08 full-product audit line paused at `8e12334`.

## Symptom

`pnpm --filter @repo/plugin-web-calendar test` at `8e12334`: **50 files, 23 of 372
tests failed**, reproducible on a solo run (not the parallel-load timeout flake
seen in `@repo/xai-web-shell`, `@repo/plugin-web-storage`, `@repo/plugin-web-ai-chat`,
`@repo/plugin-web-bookkeeping` and `@repo/plugin-web-countdown`, all of which pass
solo). Every account-scoped calendar write silently failed:

- `useUserCalEvents` create/update/remove/getById — `expected [] to have a length of 1`
- `aiCreateSubscriber` CS-1/CS-2/CS-3, `aiMutateSubscriber` CS-DEL-1, CS-UPD-1/2/3
- `CalendarModule` eventcrud / recurrence / saveRecovery, `aiCalendarInputValidation`

## Bisect

The calendar package's own last change is `2fed984` (2026-09-09 17:11). Holding the
working tree at `8e12334` and restoring only `packages/plugin-web-storage/src` to
each historical revision:

| `plugin-web-storage/src` at | calendar result |
| --- | --- |
| `2fed984` | 372/372 PASS |
| **`e9ff409`** (2026-09-09 17:40, `feat(storage): coordinate account lifecycle writers`) | **21 failed** |
| `c201a1d`, `3472b69`, `5ed9329`, `20a4591` | 23 failed |
| `8e12334` (HEAD) | 23 failed |

## Root cause

`e9ff409` wrapped `mutateCanonicalDataset` / `commitCanonicalCommand` in the shared
account lifecycle lock via `browserAccountLock`. That commit still tolerated the
two-argument test shim (`request.length < 3 ? request(name, run) : ...`). The
follow-up `e9fb5e7` (`fix(storage): call native account locks with receiver`)
removed the compatibility branch and now always issues the native three-argument
form `navigator.locks.request(name, { mode }, run)`.

Every other package's fixtures were updated to a signature-tolerant shim (see
`plugin-web-settings-rest/src/__tests__/{dateTimePane,notificationsPane,morePane,
accountDeletionRecovery,useAccountDeleteOrchestrator}.test.tsx`). Two calendar
fixtures were not:

- `src/__tests__/setup.ts` — `request: (name, callback) => callback()`
- `src/__tests__/canonicalSubscriberHarness.ts` — same two-argument form

With the three-argument call these shims invoke `{ mode: "shared" }` as the
callback, throw, and `mutateCanonicalDataset` returns `{ ok: false, reason:
"lock-failed" }`. Parent diagnostic at HEAD before the fix, run inside the calendar
jsdom environment:

```
SCOPE=   {"kind":"account","accountId":"consumer-test","generation":"fixture","epoch":2}
NAVLOCKS= object true 2      (navigator.locks present, request.length === 2)
RESULT=  {"ok":false,"reason":"lock-failed"}
```

Product source is not implicated: the three-argument form is the standard Web Locks
signature, and no `packages/**/src` non-test file was changed by this repair.

## Fix

Fixture-only, two files in `packages/xai-web-calendar/src/__tests__/`:

1. `setup.ts` — resolve the callback from either argument position.
2. `canonicalSubscriberHarness.ts` — same signature tolerance, **plus** replace the
   single global serialization queue with one queue per lock name. Account writes
   now nest (shared lifecycle lock held while the per-dataset lock is requested
   inside it); a single global queue makes the inner request await the outer
   request's own result and deadlocks. Same-name requests remain serialized, which
   is what the CS-2 / CS-UPD-3 idempotency and ordering cases depend on.
   `settleCanonicalCommands` drains repeatedly because one generation of queues can
   enqueue the next.

## Result

- `pnpm --filter @repo/plugin-web-calendar test` → **50 files, 372/372 PASS**, exit 0
- `pnpm --filter @repo/plugin-web-calendar check-types` → exit 0
- `pnpm --filter @repo/plugin-web-calendar lint --max-warnings 0` → exit 0

## Boundary

This restores test coverage that had been silently dead since `e9fb5e7`; it is not
independent proof that Calendar writes behave correctly in a real browser after the
account-lifecycle change. No audit item is closed by this repair, and no product
behaviour was modified.

## Process note

The audit's per-caller acceptance loop verifies the package under repair and its
named callers. `xai-web-calendar` was accepted at `2fed984` and never re-run across
the following 15 `plugin-web-storage` commits, so the break went unnoticed for the
rest of the audit line. A full web-package sweep after each shared storage batch
would have caught it the same day.

## Follow-up: meditation shim (2026-09-15)

`packages/xai-web-meditation/src/__tests__/setup.ts` carried the same
two-argument-only shim. It was not broken: `sessionController.ts:72` calls
`navigator.locks.request(name, run)`, the two-argument native form, so fixture and
product agreed. The trap was latent — it would fire the moment meditation joined
the account-scoped canonical write path that the D2 caller queue is migrating
packages onto.

Cleared preemptively with the same model as the calendar harness: resolve the
callback from either argument position, and queue per lock name instead of
globally so nested account locks cannot deadlock. Verified against the setup with
a temporary probe (since removed): `browserAccountLock("acct:lifecycle", "shared",
run)` with a nested different-name request resolved in outer-then-inner order, and
two same-name requests still ran serialized.

- `pnpm --filter @repo/plugin-web-meditation test` → 16 files / 134 passed, exit 0
  (unchanged from before the shim change — no test depended on global
  serialization across lock names)
- `check-types` exit 0; `lint --max-warnings 0` exit 0

No other package fixture installs a two-argument-only `navigator.locks` shim.
