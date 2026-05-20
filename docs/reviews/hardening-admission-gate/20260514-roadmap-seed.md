# Roadmap Seed — hardening-admission-gate

> sync-v1 roadmap · feature #37 · wave W4 · Phase 4.8 → Phase 5 GATE
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-B7 (milestone checkpoint)
> Status hint: PENDING

## Requirement
The mandatory Phase 4.8 → Phase 5 admission gate: verify the PRD §10.x 10-item protocol-hardening admission checklist all-passes, then submit the milestone checkpoint. This gate blocks every Phase-5 feature (#38–#56 depend on it transitively) — Phase 5 entity wiring cannot start until this closes.

## Hard constraints
- This is a hard blocking GATE — "在 Phase 5 全 entity 接入之前必须先关闭这一里程碑,否则 Phase 5 改不动" (PRD §10.x, dev-plan §1.2 Exit criterion).
- The gate is a verification/checkpoint feature: it does NOT implement protocol logic; it asserts the §10.x checklist items delivered by features #31–#36 + #18 (bip39) all pass and submits the milestone checkpoint (dev-plan T-B7).
- Aggregates outputs of: protocol-integrity-integration-tests (#31), rekey-two-phase (#32), tla-protocol-model (#33), rls-fuzz-property (#34), rfc-test-vectors-gate (#35), audit-log-integrity (#36), bip39-mnemonic-24w cross-impl (#18) — manifest Depends On is authoritative.
- Code boundary: a verification gate / milestone checkpoint (dev_log + docs artifact); no new runtime code (CLAUDE.md §Documentation Contract / Code Boundaries).

## Threat model binding
- R-10.13 (protocol-level defect — the milestone admission door); covers the aggregate of T1.1 / T6 / T11 / GAP-T1 / GAP-T3' mitigations gated here (PRD §10.x, stride-cve.md §4.1 P0 items).
- STRIDE Tampering / Repudiation / Elevation-of-Privilege — gate ensures the hardened protocol+audit+supply-chain mitigations are all verified before Phase 5 (stride-cve.md §6).

## Acceptance signal
PRD §10.x 10-item admission checklist ALL-PASS: all C-01~C-10 implemented+tested, AAD-binding test, revision-rollback test, recovery-proof test, 24-word cross-impl, capability-allowlist test, Re-key kill-9 4-point, RLS fuzz, mutation idempotency, TLA+/property model no counterexample. Milestone checkpoint committed; this gate's closure unblocks every Phase-5 feature (PRD §10.x, dev-plan §1.2 Exit + T-B7).

## Dependencies (advisory — manifest is authoritative)
Depends On: protocol-integrity-integration-tests, rekey-two-phase, tla-protocol-model, rls-fuzz-property, rfc-test-vectors-gate, audit-log-integrity, bip39-mnemonic-24w (all shipped). This gate transitively blocks Phase-5 features #38–#56.
