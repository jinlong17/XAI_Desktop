# Roadmap Seed — rls-fuzz-property

> sync-v1 roadmap · feature #34 · wave W3 · Phase 4.8
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-B3
> Status hint: PENDING

## Requirement
Implement the RLS property-based fuzz test: `fast-check` generating 1000 users × 100 devices with randomized cross-tenant access attempts, asserting zero cross-tenant rows leak through the §6.2 RLS policies (FR-SY-58, dev-plan T-B3).

## Hard constraints
- Property-based fuzz: 1000 users × 100 devices, randomized access patterns → cross-tenant data leak MUST be exactly 0 rows (PRD §10.x, FR-SY-58, dev-plan §1.2 item 7).
- Must exercise the active-device check: revoked / pending devices must be denied SELECT on encrypted_blobs / conflict_shadow / staging_blobs / device_dek_wraps (FR-SY-58 H-08/H-12).
- This is a hard blocking Phase 4.8 admission item (RLS fuzz in the §10.x 10-item checklist) (PRD §10.x, dev-plan §1.2).
- Code boundary: fuzz harness in RLS test suite (`apps/web/supabase/migrations/` tests / `packages/plugin-account/tests/`) using `fast-check` + `@supabase/supabase-js` (codebase-orientation §6, CLAUDE.md §Code Boundaries).

## Threat model binding
- FR-SY-58 (RLS strict); R-10.4 (RLS config hole — admin can read blob, mitigated by zero-knowledge).
- STRIDE Elevation-of-Privilege — cross-tenant RLS isolation under property fuzz (stride-cve.md §2.1 T1.1 E column, §2.5 GAP overview).

## Acceptance signal
`fast-check` run with 1000 users × 100 devices and randomized cross-tenant access → 0 leaked rows; revoked/pending-device access consistently denied (PRD §10.x RLS-fuzz item, dev-plan T-B3, §5.6).

## Dependencies (advisory — manifest is authoritative)
Depends On: rls-policies-and-tests (shipped).
