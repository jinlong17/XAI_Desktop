# Calendar fixture adaptation — independent bounded acceptance

Reviewer: Astra (non-author), 2026-09-09. Web module. Fixed snapshot `9a7e66b20071b3041ee27f244237ae3ccde8f906`, including `1998df335fd1e5b18e9b315f06769b1d0ea7bbba`.

**Verdict: accept this Calendar test adaptation.** The independent package rerun passes all 50 files / 372 tests; the unchanged independent D1 assertions pass 26 / 26. This resolves the previously reproduced Calendar fixture-suite failure at `4202c79`; its original 20 FAIL log and review `45c74c3` remain intact. This does not close full D1, AI-02, Board, D2 lifecycle coordination, or the old-client activation gate.

## Source review

The Calendar diff from `4202c79` to this snapshot contains exactly five test files: `CalendarModule.recurrence.test.tsx`, `CalendarModule.dst-recurrence.test.tsx`, `CalendarModule.eventcrud.test.tsx`, `CalendarModule.saveRecovery.test.tsx`, and `YearView.test.tsx`. Neither Calendar product code nor its setup/activation/storage mocks changed in this adaptation. The two requested commits contain those test changes plus the author's review document.

- All new `seedCalendarEvents` physical writes happen before render. They install existing legacy domain data as a fixture because the activated legacy setter now correctly refuses canonical writes. Real create, edit, recurring edit, delete, retry and export still use rendered UI interactions; no operation was replaced by a raw storage write.
- DST dates/times, recurrence instance counts, source-date/tag attributes, overlap layouts, year overflow/colors, deletion absence, draft text, quota failure alerts, exact prior bytes and old-account refusal assertions are retained. There are no skipped tests or relaxed expected counts.
- Successful async create uses `findByText`; recurring edit/delete and CRUD deletion wait for the actual rendered change. Failure tests wait for the failure alert or drain their fake timer/microtask turn with `advanceTimersByTimeAsync(0)`. Retry success waits for physical persistence and inspects `JSON.parse(raw).data`, asserting exactly the latest title rather than accidentally counting envelope metadata as events.
- The existing post-render `localStorage.setItem(key, newer)` in `saveRecovery` is unchanged external malformed-domain fault injection, not a substitute for the user's retry. The string contains an incomplete event, so this is corrupted-source preservation evidence, not evidence for merging a valid concurrent edit. The final negative `waitFor` checks bytes/editor invariants that can already hold before completion; it is not, by itself, a delayed-lock completion oracle. The separately rerun D1 queued save/delete/create, Promise rejection and session tests supply those narrower independent async checks. No new product defect is claimed from that limitation.

## Independent execution

Both runners extracted product, package tests and setup from `git archive 9a7e66b`; installed dependencies were linked, and package imports resolved to the archive. The full Calendar run used the Calendar package as both Vitest root and process working directory. No working-tree Tasks source or author logs were used as proof. Assertions/runners were not changed for this rerun.

```sh
node docs/reviews/web-board-workspace-astra-review/verify-six-subscribers.mjs 9a7e66b six-calendar-full-rerun
node docs/reviews/web-board-workspace-astra-review/verify-d1.mjs 9a7e66b
```

| Independently produced log | Result |
| --- | --- |
| `six-calendar-full-rerun-9a7e66b.log` | 50 files / 372 tests PASS |
| `d1-calendar-independent-9a7e66b.log` | 11 PASS: strict domain, queued target/source, quota/latest draft, rejected Promise, missing target, A→B |
| `d1-shared-independent-9a7e66b.log` | 8 PASS: receipt preservation, capacity clear/no-op, queued revision, same-tab publication, invalid seed, reset refusal |
| `d1-calendar-pending-9a7e66b.log` | 1 PASS: old create completion preserves new editor |
| `d1-calendar-repair-boundaries-9a7e66b.log` | 4 PASS: old delete/new session, protected reset, low-year leap day, receipt-only revision |
| `d1-reset-outcome-9a7e66b.log` | 2 PASS: actual failed-read refusal and normal removal control |

The 372 and 26 are different suites with overlapping contracts; they are not a combined product coverage total. Types/lint were author-reported, not independently rerun in this test-only batch. No native browser or provider-network claim is added.

## Known cleanup and remaining boundaries

The full log retains stderr `refusing legacy write over protected canonical xai_calendar_events` warnings. Fixed `src/internal/eventStore/useUserCalEvents.ts:69–72` awaits a successful canonical mutation, then redundantly calls `setEventsRaw(result.data)` through the protected legacy setter. The setter refuses that extra write; same-tab publication supplies the domain update. Successful physical persistence, rendering and receipt preservation are verified above. This is an existing cleanup item, not new evidence of data corruption or false save success, and warnings were not hidden to obtain PASS. A later owner can remove the redundant setter while retaining bus-driven updates.

Tasks normalization/composer changes and Board task-link integration remain separate pending batches. This review changes only its own evidence directory, preserves previous failures, and does not authorize production activation or release closure.
