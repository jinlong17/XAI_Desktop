-- ============================================================
-- Migration 11: Core-data dotted entity type bridge
-- Phase 6 follow-up — align sync-v1 encrypted_blobs with Repository v0
-- ============================================================

-- The original sync-v1 prototype enum used legacy table-like labels
-- (`todos`, `grids`, ...). Repository v0 drivers and crypto AAD now use
-- dotted plugin.entity slugs. Keep legacy labels for existing local harnesses,
-- and add the canonical account-sync slugs used by core-data.
ALTER TYPE sync_entity_type ADD VALUE IF NOT EXISTS 'organizer.grid';
ALTER TYPE sync_entity_type ADD VALUE IF NOT EXISTS 'organizer.item';
ALTER TYPE sync_entity_type ADD VALUE IF NOT EXISTS 'labels.label';
ALTER TYPE sync_entity_type ADD VALUE IF NOT EXISTS 'productivity.todo';
ALTER TYPE sync_entity_type ADD VALUE IF NOT EXISTS 'productivity.habit';
ALTER TYPE sync_entity_type ADD VALUE IF NOT EXISTS 'project.board';
ALTER TYPE sync_entity_type ADD VALUE IF NOT EXISTS 'project.card';
