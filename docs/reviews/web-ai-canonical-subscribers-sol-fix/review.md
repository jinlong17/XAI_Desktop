# C six-subscriber durable receipt integration — Sol author evidence

Date: 2026-09-09
Module: `web`
Role: Sol implementation author; independent acceptance remains assigned to Astra/root.
Implementation commit: the commit containing this document (no push).

## Fixed dependencies and scope

- Canonical command primitive: `37252bcafe8efbd24cb8514d3e564c61fcabf3dc`.
- Canonical ordinary writer and activated legacy-write closure: `3a764a1`, `3e0b611`.
- Strict Calendar command-domain validator: `863e738`.
- Calendar D1 snapshot present during the final run: `f764731`.
- The original six failing durable probes at `docs/reviews/web-ai-tool-receipt-astra-review/durable-replay.test.tsx` remain unchanged. This batch adds an adapted test over the real canonical schema and supported ordinary writer.

This batch changes only the event-bus durable receipt bridge and the six Tasks/Calendar create, update, and delete operations. It does not change ordinary UI writers, migration, rollback, AI confirmation lifecycle, or activation policy.

## Resulting contract

- `executeToolWrite` awaits its supplied durable operation before emitting one correlated receipt. It no longer has a page-lifetime `WeakMap` success cache and never fabricates a success after a rejected promise or an internal canonical failure.
- All six operations use `commitCanonicalCommand`. The business data and durable success receipt share one physical envelope write under the canonical lock.
- Receipt replay is checked by the canonical primitive before target lookup or mutation. The semantic operation excludes `owner`, `epoch`, `attemptId`, and `requestedAt`; object key order is canonicalized by the primitive.
- Create initializes only a physically absent domain. A present malformed, null, or unsupported domain is refused; update and delete never initialize.
- Task bucket/tag and Calendar civil date, time, integer duration, same-day end boundary, and strict persisted domain validation run before a successful receipt.
- Calendar omitted date/time/duration remain omitted in the durable operation signature. Defaults are materialized only inside the first mutation, so a replay after midnight returns the original target without recomputing the date.
- Canonical command activation remains disabled by default. The integration maps closed/lock/recovery/storage failures to the public `storage` receipt reason and does not fall back to the legacy synchronous writer.

## Author verification

| Check | Result | Evidence |
|---|---:|---|
| Event-bus bridge focused | 4/4 PASS | `eventbus-focused.log` |
| Tasks subscribers focused | 17/17 PASS | `tasks-focused.log` |
| Calendar subscribers plus A1 invalid-input matrix | 25/25 PASS | `calendar-focused.log` |
| Adapted durable subscriber replay matrix | 10/10 PASS | `durable.log` |
| Event-bus package | 22/22 PASS | `eventbus-full.log` |
| Tasks package | 169/169 PASS | `tasks-full.log` |
| Event-bus, Tasks, Calendar type checks | PASS | `eventbus-types.log`, `tasks-types.log`, `calendar-types.log` |
| Event-bus, Tasks, Calendar lint | PASS | `eventbus-lint.log`, `tasks-lint.log`, `calendar-lint.log` |

The ten durable checks cover all six operations after subscriber remount and a fresh same-generation owner, exact persisted target replay, same request ID with changed operation conflict and unchanged bytes, update replay after a supported later human edit, Calendar deletion of the last event, changed persisted generation marker rejection, quota failure with exact byte preservation, disabled activation without a write, and Calendar omitted defaults replayed across midnight. The first six-operation pass deliberately loses the first event-bus receipt and waits for the receipt inside the physical envelope before remounting.

## Honest red result

The full Calendar package remains red at **45/50 files and 352/372 tests passing (20 failures)**. The five failing files still seed or replace `xai_calendar_events` through the now-forbidden legacy `setPref` path after canonical activation. The log repeatedly records `refusing legacy write over protected canonical xai_calendar_events`; failures then observe missing seeded events in recurrence, DST, event CRUD, year, and save-recovery scenarios. See `calendar-full-known-fail.log`.

No product bypass or test-only weakening was added to make this green. The subscriber-focused Calendar matrix is green, but this author batch does not claim a green Calendar package.

## Remaining acceptance gates

- Root/Astra must independently run the fixed commit, including the native Chrome whole-document reopen six-subscriber harness.
- Full AI02 remains open. Production activation is still closed.
- Ordinary writer fixture compatibility and every real writer must remain receipt-preserving; the Calendar full-suite red result must be resolved without restoring the legacy bypass.
- Migration stage/publish races, rollback, real cross-tab concurrency, browser/process crash boundaries, and complete AI confirmation lifecycle acceptance remain outside this batch.
