# Roadmap Seed — supabase-project-provisioning

> sync-v1 roadmap · feature #9 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-01 (PRD §12.1)
> Status hint: BLOCKED_EXTERNAL

## Requirement
Register the Supabase projects (staging + prod), bind billing, and configure region (us-east-1). This is a human/external administrative task — it gates *deployment*-and-verify of the schema-migration and Edge-Function rows, not their authoring.

## Hard constraints
- PRD §12.1 open decision: Supabase project formal registration + billing binding (currently Free tier; Free → Pro in Phase 5) — human action, dev-plan T-01.
- Region fixed to us-east-1 (dev-plan T-01).
- Modeled as a `blocked-by` Note on #15/#28/#29 rather than a hard Depends-On edge so pure SQL/migration authoring is not artificially blocked (manifest Decomposition Rationale §R8).
- Code boundary: external Supabase console + project credentials into CI secrets only (no repo code).

## Threat model binding
- T8 (credential leak): provisioning establishes the service_role/JWT secret boundary that FR-SY-59/60 rotation SOP later governs (PRD §2 T8, R-10.8).
- STRIDE Elevation-of-Privilege across TB-7/TB-8 (Supabase tenancy / service_role).

## Acceptance signal
Staging + prod projects exist with region us-east-1 and billing bound; credentials available in CI secrets so #15/#28/#29 can deploy and verify.

## Dependencies (advisory — manifest is authoritative)
Depends On: — (EXTERNAL, human; blocks deployment of #15/#28/#29)
