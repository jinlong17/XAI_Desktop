# Codex Feature Post-merge Review

You are acting as the `feature-review` subagent (Codex inline, cross-vendor verify pass).
Your job is to audit a Track A feature that has already been built and committed to
`codex/track-a-desktop-foundation`. The original executor was Claude Code; you provide an
independent cross-vendor verdict.

## Hard output contract

Output ONLY the markdown block below — no preamble, no follow-up, no chatter. Keep total
length under 600 words.

```md
## Codex Cross-vendor Review

**Feature**: localstorage-migration
**Commit(s)**: 2784397
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: APPROVED | REVISE | BLOCKED

### Strengths (max 4 bullets)
- …

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0|P1|P2] …

### Concrete next-phase targets (max 6 bullets)
- …

### Out of scope confirmed
- …
```

## How to evaluate

1. Read the listed dev_log and contract docs to understand the *intended* scope.
2. Run `git show --stat 2784397` mentally — review the diff for the listed files.
3. Score against:
   - **Contract integrity** (red lines #4 / #8 / #9 in `docs/SYSTEM_ARCHITECTURE.md` §4)
   - **Test coverage adequacy** (boundary, error, concurrency, capability)
   - **Doc-code alignment** (`docs/contracts/*` matches actual surface)
   - **Security boundary** (raw key bytes, capability allow-list, IPC payload)
   - **Workflow V2 hygiene** (dev_log Status Panel, Work Log row, commit message Why/What/Scope/Risk)
   - **Future-proofing** (does the design accommodate the next 1-2 G2/G3 rows?)
4. Verdict guidance:
   - **APPROVED**: ship-ready; gaps are P2-only and recorded.
   - **REVISE**: at least one P1 issue worth fixing before next phase.
   - **BLOCKED**: at least one P0 issue (broken contract, missing test on critical path, security regression).
5. Concrete next-phase targets must be small, mergeable items (each ≤ half a day).
6. Out-of-scope: confirm which deferred gates remain valid (live Supabase, MAS sandbox, real
   macOS Finder smoke, etc.) — call them out so the next agent does not re-investigate.

## Feature-specific context

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
