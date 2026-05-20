Feature ID: G1.2 / grid-shell-organizer-content
Branch: codex/track-a-desktop-foundation
Commits under review:
- 653219b — docs(ship): promote G1.2 and G1.4 manifest rows to SHIPPED (current Track A ship)
- 26d9f57 — feat(grid-shell-organizer-content): expose Organizer grid content (production refactor, pre-Track-A)
- 03ca86a — docs(ship): mark G0.1-G0.5 and G1.1+G1.6 as SHIPPED (manifest ledger)
- 3751f43 — docs(G1.2): mark grid shell split ready (dev_log → READY_TO_SHIP)

Files involved:
- packages/plugin-organizer/src/OrganizerGridContent.tsx (extracted from Host GridWindow)
- packages/plugin-organizer/src/index.ts (public export of OrganizerGridContent)
- apps/desktop/src/windows/GridWindow.tsx (thinned to native shell only)
- docs/contracts/plugin-organizer-public-api-v0.md
- packages/grid-shell-organizer-content/docs/dev_log.md (Status: SHIPPED on Track A)
- docs/workflow/roadmap/xai-g1-native-foundation.md row #2 (SHIPPED)

Intended scope:
- Move Grid window content / state / event / drop behavior out of the Host's
  `GridWindow.tsx` into a public `OrganizerGridContent` component owned by
  plugin-organizer. Host keeps native shell responsibilities only (settings provider,
  DnD provider, AppKit drag handoff).

Cross-vendor checklist:
1. Is the public Organizer API surface (only `OrganizerGridContent` + types) sufficient
   for the Host to import without leaking internals?
2. Does `apps/desktop/src/windows/GridWindow.tsx` still contain any business logic that
   should live in plugin-organizer? Grep for SmartContainer / GridBox / DesktopItem /
   useFileDrop / Organizer internal imports — confirm they are absent.
3. Are deferred gates (cross-vendor verify, manual two-Grid native runtime smoke)
   correctly listed and still valid?
4. Is the manifest promotion to SHIPPED defensible — does the dev_log record the right
   commit references and Work Log row?
5. Workflow hygiene: commit message Why/What/Scope/Risk/Docs/Tests present?
6. Architecture red line #4 (host depends on plugin only via public surface): violated
   anywhere?
