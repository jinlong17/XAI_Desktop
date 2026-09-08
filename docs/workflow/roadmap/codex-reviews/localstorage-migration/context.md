Feature ID: G2.3 / localstorage-migration
Branch: codex/track-a-desktop-foundation
Commit under review: 2784397 (feat(localstorage-migration): organizer-layout → Repository v0 adapter)

Files added or changed:
- packages/core-data/src/organizer-layout-migration.ts (new) — migrateOrganizerLayoutToRepos
- packages/core-data/src/index.ts — re-export
- packages/core-data/tests/organizer-layout-migration.test.ts (new) — 5 vitest cases
- packages/localstorage-migration/docs/dev_log.md (new)
- docs/workflow/roadmap/xai-g2-data-security-foundation.md row #4 → READY_TO_SHIP

Intended scope:
- Migrate the legacy `xai-desktop-layout` localStorage blob (single key holding
  PersistedLayout { grids, items }) into typed Repository v0 entities:
  GridEntity + GridItemEntity.
- Idempotent. Non-destructive by default (legacy key kept unless removeLegacy=true).
- Orphan items (no owning grid in `grid.itemIds`) are dropped.
- UI runtime cut-over deferred to G1.5 grid-persistence.

Cross-vendor checklist:
1. Mapping correctness: `LegacyGridBox` → `GridEntity` and `LegacyDesktopItem` →
   `GridItemEntity` preserves all fields? Confirm `viewMode`, `themeColor`, `size`
   round-trip. Notice DesktopItem has `createdAt: number` but GridItemEntity uses
   `createdAt: string` ISO — does the migration handle that semantic loss?
2. Orphan dropping policy: should orphans surface as a warning/audit event? Right
   now they silently disappear.
3. Idempotency: on rerun the migration writes the same entity ids → upsert. Is
   updatedAt re-stamped on every run? That could corrupt later sync conflict
   resolution (a "no-op" migration shouldn't bump updatedAt).
4. Other localStorage keys in the codebase (todos / labels / clipboard) — does the
   inventory mentioned in dev_log actually exclude them, or are there more keys to
   migrate? Grep for `localStorage.setItem` across packages/.
5. Test coverage: 5 cases (mapping / idempotency / kept-by-default /
   remove-on-flag / absent-or-malformed). Missing: partial corruption (some grids
   valid, some malformed), schemaVersion drift, very large blobs.
6. Type-safety: `LegacyOrganizerLayout` is a permissive shape. Does the
   `isPersistedLayout`-style guard reject obviously-bad payloads cleanly?
