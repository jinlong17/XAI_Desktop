# Roadmap Seed — tla-protocol-model

> sync-v1 roadmap · feature #33 · wave W3 · Phase 4.8
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-B2
> Status hint: PENDING

## Requirement
Write `docs/spec/sync.tla` modeling the sync protocol over 2-3 devices × short mutation sequences, covering at least 6 mandatory scenarios; model-check it, and for any counterexample either fix the protocol or document the limitation explicitly (P-03, dev-plan T-B2).

## Hard constraints
- The TLA+ model MUST cover at least the 6 mandatory scenarios: device revocation / new-device join / concurrent Re-key / offline replay / full recovery / duplicate mutation (PRD v0.3 §10.x P-03, dev-plan §1.2 item 6).
- TLA+ / property tests MUST precede implementation acceptance — this is a hard blocking Phase 4.8 admission item, not an add-on (dev-plan §1.2, §3.1.5).
- Counterexample → either fix the protocol or write a documented "known limitation" (P-03, dev-plan T-B2); model `account_commit_seq` does NOT defend equivocation (explicit, per v0.6 protocol-correctness note).
- Code boundary: spec lives at `docs/spec/sync.tla` (documentation/spec artifact, not plugin code); no runtime code change (CLAUDE.md §Documentation Contract / Code Boundaries).

## Threat model binding
- R-10.13 (protocol-level defect — model-check before Phase 5); R-10.15 (per-device wrap complexity — TLA+ must cover "new device joins during revocation"); R-10.19/R-10.22 (TLA+ must include device-revocation / fake-device-attack scenarios).
- STRIDE Tampering — protocol-correctness model checking (stride-cve.md §2 overall; R-10.22 Phase 4.8 TLA+ includes forged-device attack).

## Acceptance signal
`docs/spec/sync.tla` exists, covers ≥6 mandatory scenarios, model-check passes with no counterexample (or each counterexample has a protocol fix or a documented known limitation) (PRD §10.x P-03, dev-plan T-B2).

## Dependencies (advisory — manifest is authoritative)
Depends On: single-table-todos-e2e (shipped).
