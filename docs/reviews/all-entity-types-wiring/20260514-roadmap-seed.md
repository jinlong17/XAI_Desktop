# Roadmap Seed — all-entity-types-wiring

> sync-v1 roadmap · feature #39 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-23, T-24
> Status hint: PENDING

## Requirement
Wire the remaining entity types into the sync engine per the §4 sync-range matrix: settings / grids / grid_items / lists / labels / label_assignments / habits / habit_logs / boards / board_lists / board_cards / board_card_checklist / notes / progress_trackers / pets / plugins. Each entity gets a per-entity integration test.

## Hard constraints
- Each entity routes through `core-data` mutation hooks; `pomodoro` and `clipboard_*` tables are explicitly `noSync`; `grid_items.payload_json` must be redacted (local path / security-scoped bookmark not uploaded) before upload (PRD §4.2, dev-plan §8).
- Per-entity acceptance: write one record → other device sees it within 5s (T-24).
- Privacy defaults respected: notes / API keys / pomodoro independent toggles default OFF (FR-SY-53); module-level disable honored (FR-SY-55).
- Code boundary: entity wiring in `packages/plugin-account/` + `packages/core-data/`; mutation entry through core-data, never Host (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T1 (server dump, passive) — every wired entity must upload only encrypted blob + non-sensitive metadata; FR-SY-56 zero-knowledge exception list enforced per entity.
- PRD §11 R-10.4 (RLS misconfig) — each new entity table must carry its RLS policy.

## Acceptance signal
Every listed entity_type passes its per-entity integration test (write → cross-device visible within 5s) and uploads only ciphertext for user-content fields (no plaintext leaks beyond the FR-SY-56 exception list).

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate. Blocked by #37 Phase 4.8 → Phase 5 gate.
