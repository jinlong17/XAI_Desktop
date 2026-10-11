# B2 compatibility — Astra independent review

Module: Web. Fixed product `5c13fece840f6552f41e7dd845cef287666e25ac`. All test imports resolve to an immutable git archive; ongoing C/D work is excluded. No product files were edited.

**Verdict: B2 needs one narrow Board task-source repair.** Calendar projection and tested migration/lifecycle paths pass their bounded checks. This stage does not implement ordinary canonical writes, durable replay, or the old-client activation gate. AI-02, REL-05 and whole Board remain open.

## Confirmed finding: invalid task source publishes a Board intent

`packages/plugin-web-board-workspaces/src/internal/taskLinkCommand.ts:9–12,33–40` loses physical absence when parsing JSON `null`; it also exempts an envelope's `data:null` from the domain check. Both use `loadTaskColsOrSeed(null)` and then proceed to `saveLink(intent)` before the protected task write refuses the operation.

The independent assertions exercise real jsdom Storage, a captured account scope, actual default Board/card `b-default/bc1`, and the real command. With either physical Tasks bytes `null` or a valid receipt envelope containing `data:null`:

- Expected: recovery failure during `intent`, before any Board intent is published; both original datasets remain byte-identical.
- Actual: result is `{ok:false,phase:'task'}` and Board bytes now contain a pending link. Tasks bytes are preserved because B1 blocks the subsequent legacy setter.
- Both cases correctly FAIL; the log explicitly prints task/Board preservation booleans and retains the phase and raw-byte assertion failures. This is not a claim that B2 overwrites Tasks bytes or returns success.

Minimum implementation ownership: `taskLinkCommand.ts` plus its targeted tests. Preserve physical absence with the result-bearing snapshot reader, or an equivalent non-lossy raw read. Only physical `absent` may choose the seed. For every non-absent legacy/envelope state, validate projected Tasks data, including null, before intent publication; reject corrupt/unsupported/unavailable snapshots. Do not relax the assertions to allow a pending link on domain-invalid data. A valid empty Tasks dataset is four valid buckets with empty task arrays, not JSON null or `[]`.

The distinction from the author's passing protected-envelope test is deliberate: valid Tasks data without the linked task may save a recoverable intent and then hit B2's staged writer refusal. Domain-invalid data should be rejected before creating that intent. A positive independent control creates a link from physically absent Tasks, wraps the resulting valid task data in a receipt envelope, and successfully acknowledges the existing linked task without modifying envelope bytes.

## Independent verification

Run `node docs/reviews/web-board-workspace-astra-review/verify-b2.mjs 5c13fec`.

| Suite | Result | Evidence |
| --- | --- | --- |
| New independent contracts | 17 PASS / 2 correct FAIL | `b2-independent-5c13fec.log` |
| Calendar B2 migration + hook tests | 12/12 PASS | `b2-calendar-5c13fec.log` |
| Tasks canonical migration tests | 2/2 PASS | `b2-task-migration-5c13fec.log` |
| Board task link tests | 7/7 PASS | `b2-board-link-5c13fec.log` |
| Storage account lifecycle tests | 7/7 PASS | `b2-lifecycle-5c13fec.log` |

The new passing contracts independently verify:

- Calendar owner migration accepts both legacy and envelope dates `0001-01-01`, `0004-02-29`, `0099-12-31`, `0100-02-28`, `2000-02-29`, `2024-02-29`; rejects year zero, nonleap century days, and impossible modern dates. A1's low-year/civil-date contract survives this migration boundary.
- Both owner validators accept their actual empty dataset shapes and reject null, arrays/primitive wrong shapes and Calendar key/id mismatch. B1 `legacy` is not accepted as a domain-validity signal.
- Actual `migrateAccount` imports both receipt envelopes, including indented raw JSON and a low-year Calendar event, into the new generation byte-for-byte. Raw account export returns those exact strings; account deletion removes the captured owner while retaining another account and the unassigned originals. Invalid Calendar data fails selected import before publishing a generation marker, retaining source bytes. The migration lock is a serial injected test seam; this does not prove browser-lock concurrency.
- A nonempty Calendar envelope projects the persisted event correctly and reaches the expected protected writer refusal, rather than falsely reporting a raw-envelope/domain baseline mismatch. Failed update preserves local events and exact raw bytes. External changed data and post-mount malformed JSON also reject without overwriting.

## Scope and follow-through

`useUserCalEvents.ts:70–86` checks result-bearing status and compares the projected domain baseline; its check is only object/map shape, not full event schema validation. C/D must use the Calendar owner guard before accepting canonical mutations; this review does not authorize arbitrary legacy objects merely because baseline comparison succeeds. The new Calendar migration validator checks persisted event fields instead of incorrectly treating a persisted event as a composer draft, and uses `isValidCivilDate` before the draft time/duration validator.

These are component/storage and source checks, not native-browser or production acceptance. Original durable replay failures remain untouched. The existing B1 bounded acceptance stands, but B2 needs the null-source repair and rerun of these original assertions. No public envelope activation is approved; the unresolved old-client runtime gate remains documented in `20260909-runtime-activation-gate-diagnosis.md`.
