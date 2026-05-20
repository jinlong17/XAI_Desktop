# Roadmap Seed — ga-acceptance-suite

> sync-v1 roadmap · feature #56 · wave W7 · Phase 5 · **GA GATE**
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §10.2 + §10.3 · dev-plan task(s): T-58, T-59 (dev-plan §7 GA gate)
> Status hint: PENDING

## Requirement
Final GA acceptance gate: execute the full PRD §10.2 Phase-5 13-item checklist AND the §10.3 M6 GA real-machine checklist, and confirm closure of R-10.1 through R-10.27. This is the GA gate; no Phase-5 deliverable ships GA until this passes.

## Hard constraints
- PRD §10.2 13-item: 2-Mac + 1-browser same-account 30min 100% consistent; property-based fast-check 100k rounds (random mutations + partitions, both ends converge); `kill -9` ×100 random injection; clock-jump (NTP ±1h/±1d); 4 recovery rehearsals; 50× concurrent same-todo edit (all losers in recoverable conflict shadow); offline-1h+200-mutation cross-entity DAG flush; weak-net toxiproxy (500ms/10% loss) P95 < 10s; zero-knowledge PoC; SQLite-dump PoC; encrypted-export PoC.
- PRD §10.3 M6: DMG full + MAS sandbox both pass the §10.2 list; credential-rotation SOP drill (incl. graded-response); 24h stress 10 accounts × continuous mutation no OOM / no WAL bloat; **R-10.1~R-10.27 all closed** (each with test/drill record — note: scope extends the PRD's literal R-10.1~R-10.13 to include new R-10.26 audit-log-integrity and R-10.27 device-pairing-anti-abuse); REVIEW-2026-05-15.md Critical + High all closed.
- This brief's acceptance = PRD §10.2 13-item + §10.3 M6 all-pass + R-10.1~R-10.27 closure (final GA gate).
- Code boundary: GA suite orchestrates existing `packages/plugin-account/` + crypto tests + rehearsals; no new business logic (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 full threat table (T1–T13) — every threat's mitigation must have a passing test/PoC/rehearsal at this gate.
- PRD §11 R-10.1~R-10.27 — every sub-risk closed with a test or drill record (dev-plan §7 acceptance gate #8).

## Acceptance signal
All PRD §10.2 13 items pass, all PRD §10.3 M6 items pass, and every R-10.1 through R-10.27 sub-risk has a corresponding closed test/drill record (dev-plan §7 — failing any single item blocks GA).

## Dependencies (advisory — manifest is authoritative)
Depends On: realtime-subscription, all-entity-types-wiring, offline-outbox-resilience, mnemonic-full-recovery, fuzz-harness-24h, recovery-rehearsal-1-server-wipe, recovery-rehearsal-2-local-wipe, recovery-rehearsal-3-rekey-kill9, recovery-rehearsal-4-device-revoke-rekey, data-export-encrypted, quota-rate-limit, supply-chain-hardening, credential-rotation-sop, sync-audit-conflict-ui, device-pairing-anti-abuse, account-deletion-gdpr, oauth-passkey. GA GATE — depends on all Phase-5 deliverables.
