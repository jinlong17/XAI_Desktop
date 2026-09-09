# AI-02 B2 — compatibility callers and recovery bytes

This staged change makes the known non-AI compatibility boundaries envelope-aware without activating an envelope writer.

- Calendar CRUD compares its projected domain snapshot with `readCanonicalCommandSnapshot`, so envelope revision and receipts no longer cause a false raw-baseline conflict. Corrupt, unknown, unavailable, or non-map state fails closed before a write.
- Board task-link explicitly projects task envelope `data`, rejects corrupt/unsupported state before any seed path, and leaves the protected raw envelope untouched while the old synchronous writer is intentionally blocked.
- Tasks and Calendar account migration validators now validate valid envelope `data`; malformed/unknown envelope bytes are retained. Calendar validates local ISO date/time, end ordering/duration, color, recurrence, and timestamps rather than incorrectly passing an ISO event into its draft validator.
- Account export/delete and account migration copy raw records, verified with a whole envelope carrying a delete receipt. No recovery path projects or strips receipt metadata.

## Boundary

B2 is not deployable. It contains no canonical command writer or Web Locks. Envelope activation remains default-closed until C/D complete all writer coordination and the old-tab drain/upgrade/re-entry gate is accepted. Existing sync write attempts against a protected envelope fail visibly and preserve its exact bytes.

## Verification

- Calendar targeted tests: 10 PASS; `check-types` and `lint` PASS.
- Tasks targeted tests: 2 PASS; `typecheck` and `lint` PASS.
- Board task-link targeted tests: 7 PASS; `typecheck` and `lint` PASS.
- Storage lifecycle targeted tests: 7 PASS; `check-types` PASS.
