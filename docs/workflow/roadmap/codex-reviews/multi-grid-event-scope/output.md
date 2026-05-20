## Codex Cross-vendor Review

**Feature**: multi-grid-event-scope
**Commit(s)**: 78aef01 59da1e5 44345cf 653219b
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- Scoped runtime event names are consistently adopted in production TS/TSX code; legacy create-request strings remain as listener-only compatibility constants.
- `packages/core/src/types/events.ts` and `docs/contracts/events-v0.md` are aligned on the new organizer surface, including `DroppedFile`.
- Guard insertion in `OrganizerLayer`, `OrganizerGridContent`, and `useMultiWindowGrids` materially improves resilience versus the pre-migration unguarded listeners.
- Workflow docs are generally coherent: deferred gates are recorded, `dev_log` commit lineage is traceable, and `653219b` has proper Why/What/Scope/Risk hygiene.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `packages/plugin-organizer/manifest.json` still declares the old event surface (`organizer:grid-update`, `organizer:grid-close`, `organizer:file-drop`, `organizer:grid-window-ready`, `organizer:create-grid-request`). That breaks the project’s stated EventMap → manifest → code lifecycle and makes the SHIPPED promotion premature.
- [P1] `isGridCreateRequestPayload` only validates `rect`; malformed optional fields such as non-string `gridId` or invalid `source` still pass and flow into `createGrid`. That does not meet the stated “reject malformed payloads” contract.
- [P2] Guard tests are too shallow for the claimed boundary: they do not cover malformed optional fields, handler-level rejection, or duplicate/listener-cleanup behavior.
- [P2] Two-grid isolation is still proven only by convention/manual smoke. `organizer:grid:state` is broadcast globally and filtered by `gridId` in-window, so cross-grid visibility is not actually constrained by targeted delivery.
- [P2] Commit hygiene is uneven: `78aef01`, `59da1e5`, and `44345cf` are subject-only commits, so the review trail does not consistently meet the requested Why/What/Scope/Risk standard.
- [P2] No new evidence suggests the migration widened Control-window listeners, but owner-only emit rules remain unenforced at runtime.

### Concrete next-phase targets (max 6 bullets)
- Update `packages/plugin-organizer/manifest.json` to the scoped event names and re-scan for manifest/code/doc parity.
- Add a compile-smoke check for organizer manifest event keys, mirroring the `plugin-account` pattern.
- Tighten `isGridCreateRequestPayload` to validate optional `gridId` and `source`, then add negative vitest cases.
- Add handler-focused tests proving invalid create requests do not call `createGrid`.
- Add a small regression test or explicit follow-up for two-grid isolation/listener cleanup.
- Backfill Why/What/Scope/Risk bodies on future feature/build/docs checkpoint commits.

### Out of scope confirmed
- Deferred manual two-Grid native runtime smoke and listener-cleanup verification remain valid and should not be re-litigated here.
- MAS sandbox/security-scope/bookmark behavior and real macOS Finder smoke remain deferred from adjacent rows; G1.4 correctly did not attempt to solve them.