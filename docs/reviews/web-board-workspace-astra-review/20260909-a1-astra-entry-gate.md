# Astra A1 acceptance and B–D entry gate

**ACCEPTED for the bounded A1 Calendar input-validation repair at `20a07480b35d4a9af796b68601416edbeed84548`. The parent may start the already approved `9df552e` B–D implementation architecture, subject to its exact ownership and integration gates.** This is permission to proceed within the existing approved scope, not acceptance of durable receipts, full AI-02, REL-04/05/08, cloud sync, Desktop promotion or release.

Astra reviewed the full A1 product change across `e50ca1c`, `afd10ff` and `20a0748`, the author pre/post conversion evidence in `fd1dce1`, Sol's independent fixed-commit review and native runner/assertions in `docs/reviews/web-ai-calendar-sol-independent/`, and the original `9df552e` architecture plus canonical migration inventory. The bounded receipt-phase Sol review at `daff8ef` and its `8bcd1d6` lifecycle/correlation extension were read as separate earlier evidence, not rerun or promoted to current full-scope acceptance.

## Why the A1 gate is satisfied

The Calendar civil-date helper round-trips year/month/day in UTC and rejects impossible/non-leap dates instead of accepting JavaScript normalization. Create validates explicit time and finite integral duration inputs, uses defaults only for omitted optional fields, and rejects requests extending beyond the existing 23:55 same-day boundary rather than silently clamping. Update validates all supplied patch fields before changing any field, including a valid title supplied beside an invalid date. The final fix requires update time to be a string before regex matching, preventing an array from passing coercive validation and later being mislabeled as storage failure.

The tool registry preserves explicitly supplied create values and update patch values for subscriber validation; it no longer rounds/defaults invalid explicit durations or drops malformed update fields. Confirmation rendering includes the supplied values. The author conversion evidence retains five FAIL / one PASS at `e50ca1c` and six PASS at `afd10ff`; Sol retains the array-time classification FAIL at `afd10ff` and the unchanged-matrix PASS at `20a0748`. These historical failures were not erased.

Astra independently executed Sol's unchanged native runner at `20a0748`, inspected its business assertions, and saved the fresh output as `a1-sol-runner-astra-replay-20a0748.log`:

- 22/22 invalid raw input chains produce `invalid`, attempt zero canonical writes, preserve bytes, expose failure and withhold success continuation.
- 5/5 valid controls persist exactly once with expected times/data and matching request-id model continuation: leap-day create/update, omitted create time/duration defaults, and create/update ending exactly at 23:55.
- Invalid → corrected → replay with the same requestId yields `invalid`, `success`, `success` and exactly one canonical write, retaining corrected final data.

The runner archives product code and resolves imports into that snapshot. It mounts actual AI confirmation/event/subscriber/receipt logic in an isolated native Chrome profile, with a deterministic synthetic provider. This is not a production-provider, hosted-auth or deployment result. The lifecycle sequence remounts UI within the same page/current account scope; it does not prove reload/new-epoch durable replay. Success controls verify persisted values, write counts and matching continuation ids; broader receipt target/correlation guarantees remain the separate phase-A/B–D acceptance surfaces.

```bash
node docs/reviews/web-ai-calendar-sol-independent/verify-native.mjs 20a0748
```

## B–D may begin under the original contract

No new architecture approval or repeated user confirmation is needed for the already approved direction. Preserve these requirements from `9df552e`:

1. One versioned canonical record per existing account-owned Tasks/Calendar key contains domain data and successful receipts. The durable mutation and receipt commit through one write. No second-key journal or AI-only receipt store.
2. All readers and writers, not only six AI subscribers, participate in compatibility and the shared per-key exclusive lock. Include Tasks seed/normal saves, Calendar CRUD/recovery, Board task-link writes, storage event decoding, account migration validators, raw export/import/reset/rollback and stale-version tabs. No synchronous bypass, unlocked fallback, or boolean success before an async commit finishes.
3. Keep raw bytes distinct from domain projection; preserve receipts on ordinary edits and lifecycle operations. Reject corrupt/unknown formats without default overwrite. Canonicalize validated semantic operations and retain same-ID conflict and durable delete receipt behavior, including after the final event is deleted.
4. Apply the parent/Luna updated inventory before assigning exact files. B–D may be one integrated change set with small reviewable commits, but no partially compatible intermediate state is deployment-ready. The current Board repair owns Module; any async Board task-link caller edits touching Module require explicit ownership handoff. This Board selection issue does not block independently owned storage/Calendar/Tasks implementation work.
5. Preserve A1 and phase-A passing assertions, the six original durable replay FAIL cases, and all other correct before evidence. Full acceptance still needs six-operation reload/new-epoch replay, one-record crash boundary, real two-tab AI/AI and AI/UI interleavings, stale-owner/lock-unavailable rejection, capacity/receipt retention, import/reset/restore and downstream projection checks, then Sol independent verification and Astra final review.

Known remaining corrupt-existing-storage and page-lifetime receipt weaknesses are part of B–D's explicit work; the A1 input-validity PASS does not claim they have been repaired. The local Board queued-selection blocker remains separately tracked and does not close or revoke this bounded A1 decision.
