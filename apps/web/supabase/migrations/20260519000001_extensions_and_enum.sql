-- ============================================================
-- Migration 1: Extensions, ENUM, and Sequences
-- Phase 1 of 6 — supabase-schema-migrations (sync-v1 T-02)
-- PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §6.1
-- PRD lines: 802–807 (ENUM), 771 (commit_seq), 1014 (enc_dev_id_seq)
-- ============================================================

-- R-1: btree_gist must be present before Phase 4 nonce_lease EXCLUDE USING gist.
-- btree_gist is in the standard Postgres contrib set and pre-installed on
-- Supabase; official postgres:16 image also includes it.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- H-9 commit_seq global sequence (PRD line 771)
-- Simplified: global cross-tenant sequence.
-- fn_alloc_commit_seq (Phase 5) allocates from this sequence with
-- per-account advisory lock to prevent commit_seq regression.
CREATE SEQUENCE account_commit_seq_global;

-- M-09 sync entity type ENUM (PRD lines 802–807)
-- Exactly 19 labels — closed set; ENUM closed-set rejection is NEG-4 gate.
CREATE TYPE sync_entity_type AS ENUM (
  'settings',
  'grids',
  'grid_items',
  'auto_classify_rules',
  'lists',
  'todos',
  'todo_reminders',
  'labels',
  'label_assignments',
  'habits',
  'habit_logs',
  'boards',
  'board_lists',
  'board_cards',
  'board_card_checklist',
  'notes',
  'progress_trackers',
  'pets',
  'plugins'
);

-- Per-device unique nonce-high sequence (PRD line 1014)
-- Assigned by server during device registration; 8-byte unique per device,
-- used as GCM nonce high bits (C-C).
CREATE SEQUENCE encryption_device_id_seq START WITH 1;
