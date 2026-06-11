# Roadmap Seed - desktop-organizer-plugin-restoration

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P3+ Future
> Branch: dev

## Requirement

Re-evaluate `plugin-{organizer, clipboard, widgets, meditation, pet}` desktop organizer plugins. Restore, merge, or retire each based on the post-Phase3 product architecture.

## Hard constraints

- Do not dispatch before the Smart Container decision row has shipped.
- Do not assume old plugin packages are active P1/P2 dependencies.
- Preserve useful legacy code until a documented restore/merge/retire decision is accepted.

## Acceptance signal

Each legacy organizer plugin has a documented disposition with implementation or retirement follow-through, and PLUGIN_MAP/docs reflect the final post-Phase3 architecture.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-smart-container-file-organizer` SHIPPED.
