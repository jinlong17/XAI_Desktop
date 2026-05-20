## Codex Cross-vendor Review

**Feature**: localstorage-migration
**Commit(s)**: 2784397
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- Core scope stays clean: the adapter lives in `@repo/core-data`, with no Host/Tauri/React boundary violations.
- Non-destructive default is correctly implemented; legacy `xai-desktop-layout` is only removed behind `removeLegacy: true`.
- Well-formed layout fields map as expected for the happy path, including `viewMode`, `themeColor`, `itemIds`, and item `size`.
- Targeted coverage exists for the main success/failure modes, and the focused Vitest suite plus `check-types` pass.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `LegacyDesktopItem.createdAt` is dropped. `toGridItemEntity()` stamps both `createdAt` and `updatedAt` with migration time instead of converting the legacy epoch, so item chronology is lost; the current repo→layout path also rehydrates `createdAt: 0`, confirming the round-trip hole.
- [P1] The “idempotent” claim is overstated. On a rerun with a later clock, the migration rewrites every existing record with a fresh `updatedAt`, creating false churn that will matter once sync/conflict logic lands.
- [P1] Validation is too weak for corrupted-but-parseable blobs. The code only checks top-level arrays and string ids, so partially malformed items can still be persisted as `organizer.item` records with missing required file metadata, violating the entity contract in practice.
- [P2] Orphan items are silently discarded with no `orphansDropped` count, warning hook, or audit note, which makes migration data loss opaque.
- [P2] The dev log inventory is inaccurate: Track A already has other `localStorage` writers (`plugin-labels`), so “No other production callers persist via localStorage” is not true as written.
- [P2] Workflow/doc hygiene is incomplete: the execution pack still says G2.3 acceptance is “UI readable after migration,” while this row is marked READY_TO_SHIP with UI cut-over deferred; the Work Log also still says `pending commit` after `2784397` exists.

### Concrete next-phase targets (max 6 bullets)
- Preserve legacy item `createdAt` by converting epoch ms to ISO for repo records, and restore numeric `createdAt` in the G1.5 repo-backed layout path.
- Make reruns true no-ops: skip unchanged records or preserve existing `updatedAt` when the migrated payload is identical.
- Add per-record guards for corrupted grids/items and tests for partial corruption, missing `filepath`, duplicate ownership, and malformed `rect`.
- Extend the migration result with `orphansDropped` and `recordsSkipped`, plus an optional warning callback/audit sink.
- Correct the dev log inventory and READY_TO_SHIP narrative so remaining label/localStorage work and deferred UI acceptance are explicit.
- Update the Work Log commit column from `pending commit` to `2784397`.

### Out of scope confirmed
- UI runtime cut-over to repository-backed Organizer state remains G1.5 `grid-persistence`.
- Live Supabase / multi-device sync validation remains a later G2.6+ gate.
- MAS sandbox / signed-runtime / real macOS Finder smoke are unchanged deferred runtime gates.
- Real SQLite/SQLCipher path smoke and secure-driver concerns remain under G2.2/G2.4, not this adapter review.