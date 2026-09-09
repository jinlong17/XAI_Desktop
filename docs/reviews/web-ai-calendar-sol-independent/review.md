# AI Calendar input validation A1 — Sol independent native review

## Verdict at fixed `afd10ff`

Fixed revision: `afd10ff174cdb26e7f2b37202e8f41db58a2e623`.

**BLOCKED: 1 independently reproduced error-classification defect.** Twenty-one of twenty-two invalid raw-input chains pass, all five valid controls pass, and same-request correction/replay passes. However, an update `startTime` supplied as the one-element array `["09:00"]` returns `reason: "storage"` instead of `reason: "invalid"`. No data is written and no model success is sent, but a type error is misreported as a storage failure. A1 cannot pass until the unchanged native assertion passes on a fixed product commit.

This is a focused A1 review. It does not close AI-02 or its durable reload, new-epoch, cross-tab and crash-recovery scope.

## Reproduction

```bash
node docs/reviews/web-ai-calendar-sol-independent/verify-native.mjs afd10ff
# exit 1; 21/22 invalid cases pass, all positive controls pass
```

The runner expands the exact commit with `git archive`, resolves every `@repo/*` product import from that snapshot, launches native Google Chrome 152 with an isolated temporary profile, and replaces the provider adapter with a deterministic local stream. It uses synthetic accounts and actual `AiChatModule`, confirmation handlers, Calendar subscriber hooks, typed event bus, account-scoped native `localStorage`, receipt handling and model continuation. No real provider, credential, user profile or production endpoint is used.

## Correct failure

Raw model input:

```json
{ "id": "event", "startTime": ["09:00"] }
```

Observed full chain:

1. The actual confirmation renders `at: 09:00`.
2. The typed `web:calendar:update-requested` payload preserves `patch.startTime` as the array `["09:00"]`.
3. No canonical storage write occurs; preceding bytes remain unchanged.
4. The receipt is `{ ok: false, reason: "storage" }` and the UI displays the internal `storage` token.
5. Model call count remains one, so the system does not falsely report success.

The cause is coercive validation in the update subscriber: `HHMM_RE.test(p.startTime)` converts `["09:00"]` to the string `"09:00"`, so it passes. `buildISOTimes` then calls `.split()` on the array and throws. `executeToolWrite` catches that programming/type error and maps it to `storage`.

The minimal product repair is to require `typeof p.startTime === "string"` before applying `HHMM_RE`, matching the create subscriber's validation discipline. A regression should preserve this native input and require `invalid`, zero writes, unchanged bytes, retained confirmation and no second model call. The assertion in this review must not be weakened or rewritten to accept `storage`.

## Passing matrix at the blocked revision

The 21 correctly rejected raw inputs cover create and update impossible/non-leap dates, null and array dates, null/array/empty-array times other than the defect above, string/decimal/null/array durations, and requests crossing the 23:55 same-day boundary. For every passing invalid case, the actual confirmation includes the supplied value, the registry-to-event payload preserves its type/value, the receipt is `invalid`, canonical write count is zero, bytes are unchanged, the confirmation remains, and the model receives no success continuation. An update combining an impossible date with a valid new title also rejects the whole patch without changing the title.

Five actual UI positive controls each produce exactly one canonical commit, a success receipt with the correct target and one matching success continuation:

- leap-day create at `2024-02-29T10:15` for 30 minutes;
- create with omitted optional time/duration, confirmed and persisted as `09:00`/60 minutes;
- create at `23:50 + 5`, ending exactly at `23:55`;
- update to leap day while preserving the existing one-hour local time;
- update to `23:50 + 5`, ending exactly at `23:55`.

The same-request lifecycle uses one requestId for an invalid `2026-02-31` update, a corrected `2024-02-29` retry, and a successful replay. Receipts are `invalid`, `success`, `success`; only the corrected operation writes, and the replay leaves bytes unchanged. Final stored data contains the corrected title and `2024-02-29T09:00`–`10:00` exactly.

The compact failing output is preserved in `native-afd10ff.log`. The runner retains the full per-scenario confirmation, event payload, receipt, storage-write count and final-data assertions for deterministic reruns.
