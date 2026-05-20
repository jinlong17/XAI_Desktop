# Roadmap Seed — fuzz-harness-24h

> sync-v1 roadmap · feature #47 · wave W5 · Phase 5 · INDEPENDENT
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-52 (dev-plan §5.2)
> Status hint: PENDING

## Requirement
Build `cargo-fuzz` targets for `envelope_parse` (arbitrary bytes → never panic, returns Err or a valid struct) and `decrypt` (arbitrary envelope + arbitrary key → never panic). Run continuously for 24h with 0 crash/panic. This is an INDEPENDENT feature, not a verification add-on.

## Hard constraints
- Fuzz must cover envelope parse / decrypt / AAD parse under malicious input without panic (FR-SY-14).
- 24h continuous run with 0 crash is a hard gate for Phase 5 acceptance (dev-plan §5.2; PRD §10.2).
- Kept INDEPENDENT per roadmap §2.2 checklist (not folded into ga-acceptance-suite).
- Code boundary: fuzz targets under `apps/desktop/src-tauri/` (e.g. `fuzz/` crate) against `src-tauri/src/crypto/`; no business logic (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T1 (server dump / hostile input class) — malformed envelope/AAD from a compromised server must not crash the client.
- PRD §11 R-10.13 (protocol-level defect class) — envelope/decrypt robustness under adversarial bytes.

## Acceptance signal
PRD §10.2 / dev-plan §5.2: `cargo-fuzz` envelope_parse + decrypt targets run continuously for 24h producing 0 crash and 0 panic.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate, cipher-envelope-codec. Blocked by #37 Phase 4.8 → Phase 5 gate. INDEPENDENT (no downstream blocks it except #56 GA gate).
