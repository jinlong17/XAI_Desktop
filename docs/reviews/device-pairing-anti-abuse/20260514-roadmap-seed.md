# Roadmap Seed — device-pairing-anti-abuse

> sync-v1 roadmap · feature #50 · wave W6 · Phase 5 · GAP-T2 NEW R-10.27
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): (Phase 5, GAP-T2 mitigation)
> Status hint: PENDING

## Requirement
Mitigate the second-order bypass of C-A user-verifiable device pairing: rate-limit pending-device registration, alert on unknown-device surges, and add donor anti-confirmation-fatigue UX (show historical confirmation count, force fingerprint read). This is the new R-10.27 (GAP-T2).

## Hard constraints
- Donor grant must still require user-verifiable end-to-end pairing (6-word fingerprint / QR) + `user_confirmed=true + confirmation_proof`; server independently recomputes and compares fingerprint; Realtime only notifies UI, never auto-grants (FR-SY-76 / C-A).
- Add what PRD's 5-min timeout lacks: pending-device registration frequency limit + "multiple unknown devices in short window" alert + donor confirmation-fatigue mitigation (history count / forced fingerprint read) (stride-cve.md §GAP-T2, R-10.27).
- Code boundary: pending-device rate-limit at the `grant_dek_wrap` Edge Function / RPC; donor anti-fatigue UX in `packages/plugin-account/`; surge alert in audit/ops path (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T1.1 (hostile server with service_role write) — fake-pending-device flood inducing donor confirmation fatigue.
- NEW R-10.27 (GAP-T2, stride-cve.md §2.0) — Tampering + DoS composite; second-order bypass of C-A user-verifiable pairing. STRIDE: Tampering + Denial of Service.

## Acceptance signal
A high-frequency fake-pending-device flood is rate-limited and raises an unknown-device-surge alert; the donor UI displays cumulative confirmation count and forces fingerprint reading before confirm, demonstrably mitigating confirmation fatigue (R-10.27 closed).

## Dependencies (advisory — manifest is authoritative)
Depends On: device-list-remote-revoke.
