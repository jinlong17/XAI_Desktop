Feature ID: G1.4 / multi-grid-event-scope
Branch: codex/track-a-desktop-foundation
Commits under review:
- 653219b — docs(ship): manifest promotion (Track A)
- 78aef01 — feat(multi-grid-event-scope): migrate grid events to scoped contract
- 59da1e5 — docs(roadmap): finalize G1.4 build checkpoint
- 44345cf — docs(G1.4): mark scoped grid events ready

Files involved:
- packages/plugin-organizer/src/gridEvents.ts (event constants + guards)
- packages/plugin-organizer/src/gridEvents.test.ts (4 guard tests)
- packages/core/src/types/events.ts (EventMap update)
- docs/contracts/events-v0.md
- packages/multi-grid-event-scope/docs/dev_log.md → SHIPPED
- docs/workflow/roadmap/xai-g1-native-foundation.md row #4 (SHIPPED)

Intended scope:
- Migrate Grid runtime events to scoped namespace `organizer:grid:*` and
  `organizer:file:drop`.
- Migrate Control window create requests to `organizer:grid:create-request`.
- Preserve legacy create-request aliases as listeners only (compatibility).
- Add runtime guards rejecting missing `gridId` / malformed payloads.

Cross-vendor checklist:
1. Are all legacy event strings removed from production code (only compatibility
   constants remain)? Grep for legacy `grid:create-request`, `grid:moved`, etc.
2. EventMap in `packages/core/src/types/events.ts` matches the runtime constants?
3. Are guard tests adequate (missing gridId, invalid payload, cross-grid leak)?
4. Should Control window be allowed to listen on `organizer:grid:*` from non-Control
   windows (i.e. did the migration accidentally open the surface)?
5. Manifest promotion to SHIPPED defensible? Dev_log records right commits?
6. Deferred: manual two-Grid runtime smoke + cross-vendor verify — still valid.
