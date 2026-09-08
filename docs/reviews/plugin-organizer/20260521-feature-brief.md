# Feature Brief — plugin-organizer

| Field | Value |
|---|---|
| Feature | plugin-organizer |
| Program | desktop-ux-rebuild / F3 |
| Date | 2026-05-21 |
| Source | `docs/reviews/desktop-ux-rebuild/20260521-feature-brief.md` + parent-session F3 handoff |
| Executor | `gpt-5.4` inline `feature-plan` |
| Status | `READY_FOR_FEATURE_PLAN` |

## Canonical Target

- **Feature Title**: F3 Organizer UX rebuild
- **Canonical slug**: `plugin-organizer`
- **Naming rationale**: the runtime behavior, business logic, and primary documentation target all belong to `packages/plugin-organizer/`; host and Tauri changes are supporting edges, not the feature owner.

## Motivation

The organizer surface still ships multiple spike-era affordances that materially lower product quality:

- `SmartContainer` still behaves like a debug shell rather than a production organizer card.
- `OrganizerGridContent` still renders G0 fallback/telemetry UI and scoped-event debug behavior.
- Grid header actions lack hierarchy, the overflow menu is incomplete, and close is not directly exposed.
- Grid movement currently emits cross-window updates on every drag frame, which compounds stutter and fold-hover jitter.
- PRD §5.1 gaps remain open for real file thumbnails (`FR-DT-11`) and edge snap/hide (`FR-DT-10`).

## Goal

Rebuild the organizer grid surface so the plugin reaches a production-grade visual baseline, cleaner information architecture, smoother drag/resize/collapse behavior, and full F3 coverage for the remaining PRD §5.1 items.

## Scope

- Remove debug styling and debug-only UI from organizer surfaces.
- Formalize the SmartContainer header/button hierarchy and add a direct close entry.
- Implement the full PRD §5.1.2 right-click menu set for grid-level and item-level actions.
- Align `GridItem` visuals with the new container action language.
- Reduce cross-window organizer update traffic without changing event payload schemas.
- Debounce folded hover behavior and tighten resize-handle visuals.
- Implement `FR-DT-11` real thumbnails for image, PDF, and video content.
- Implement `FR-DT-10` edge snap/hide behavior.
- Consume shipped F1 design tokens/icons from `@repo/ui/tokens` and `@repo/ui/icons`.

## Non-goals

- No changes to typed event payload schemas.
- No changes to existing Tauri command signatures.
- No work on `plugin-ai-cube`, web, console, or sync features.
- No attempt to close Spaces or multi-display hardware gates inside planning.
- No destructive rewrite of existing organizer G3 workflow history.

## Constraints

- Keep business logic in `packages/plugin-organizer/`.
- Preserve `PersistedLayout` serialization compatibility.
- Treat existing G3 carry-forward work as a concurrent stream that must remain auditable in `dev_log.md`.
- `@repo/ui` is consumed as a same-wave dependency per parent-session dependency snapshot; do not silently rewrite dependency ownership.

## Dependencies

- `@repo/ui/tokens`
- `@repo/ui/icons`
- `@repo/core/events` and `@repo/core/hooks`
- `packages/plugin-organizer`
- Optional Tauri/Rust extension for native thumbnails, gated by ADR-lite decision 3

## Acceptance Criteria

1. Grid cards no longer render red debug borders or forced half-opacity.
2. G0 fallback panel, Finder telemetry panel, multi-window banner, and grid-count badge are removed from production organizer flows.
3. `resize-handles.css` is either deleted or intentionally wired into the production visual system.
4. Production `console.*` calls in organizer flows are eliminated or guarded behind explicit development-only logging.
5. The grid overflow menu matches PRD §5.1.2 and the header exposes a direct close action.
6. `GridItem` and SmartContainer actions share the same token/icon language.
7. Dragging a grid no longer emits `ORGANIZER_GRID_UPDATE_EVENT` on every pointer frame; the plan’s event budget is enforced.
8. Images, PDFs, and videos render real thumbnails in-grid.
9. Edge snap/hide works without breaking multi-window positioning.
10. Real macOS manual verification covers multi-grid drag, resize, collapse, thumbnails, and edge behavior.

## Open Questions

1. Whether `FR-DT-11` should add a new Rust thumbnail command backed by Quick Look Thumbnailing.
2. Whether dual DnD libraries should be unified now or left split by responsibility.
3. How F3 build phases should sequence against open G3 carry-forward fixes when both touch organizer window flows.
