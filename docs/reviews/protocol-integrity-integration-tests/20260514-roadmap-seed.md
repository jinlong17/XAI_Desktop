# Roadmap Seed — protocol-integrity-integration-tests

> sync-v1 roadmap · feature #31 · wave W3 · Phase 4.8
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-A1/T-A2/T-A3/T-A4/T-B4/T-B5
> Status hint: PENDING

## Requirement
The Phase 4.8 Week-A protocol-integrity integration suite: blob-swap rejection (server copies blob A to blob B position → client decrypt fails), revision-rollback rejection + E3015, no-recovery-proof PATCH → 401, mutation idempotency (resend 10× → 1 revision), and Tauri capability-allowlist enforcement (unauthorized plugin calling `crypto_*` → denied).

## Hard constraints
- AAD-binding test: server copies blob A to blob B's position → client decrypt MUST fail (FR-SY-67, PRD §10.x).
- Revision-rollback test: server UPDATEs an old revision → client rejects + surfaces alert + reports E3015 (FR-SY-68, dev-plan T-A2).
- Recovery-proof test: PATCH `/auth/me` with no proof → server 401 (FR-SY-69, T-A3); recovery-proof Argon2id verify < 500ms (T-A4).
- Idempotency test: same mutation_id resent 10× → exactly 1 revision (FR-SY-72, T-B5). Capability test: non-plugin-account/core-data plugin calling `crypto_*` → denied (FR-SY-75, T-B4).
- Code boundary: integration tests in `packages/plugin-account/tests/integration/`; capability allowlist test against `apps/desktop/src-tauri/capabilities/` scoped capability (codebase-orientation §4/§6, CLAUDE.md §Code Boundaries).

## Threat model binding
- T1.1 (FR-SY-67 AAD blob-swap, FR-SY-68 revision rollback, FR-SY-69 recovery proof); T6 (FR-SY-75 capability allowlist, R-10.12); R-10.13.
- STRIDE Tampering + Elevation-of-Privilege (stride-cve.md §2.1 T1.1; §2.3 T6 confused-deputy).

## Acceptance signal
All five integration scenarios pass: blob-swap → decrypt fail + audit + alert; old-revision → E3015; no-proof PATCH → 401; 10× mutation_id → 1 revision; unauthorized `crypto_*` → denied (PRD §10.x items, dev-plan §5.3 scenarios 9/10/12 + T-A1~A4/T-B4/B5).

## Dependencies (advisory — manifest is authoritative)
Depends On: single-table-todos-e2e, crypto-tauri-commands, recovery-proof-edge-function (all shipped).
