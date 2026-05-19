# mas-sandbox-dry-run — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Safe prep only; MAS/private-API runtime validation deferred |
| Review Doc Path | docs/reviews/mas-sandbox-dry-run/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | Release/security validation gate |

## Frozen Assumptions

- MAS feasibility cannot be proven without real build/runtime evidence.
- G0.3 and G0.4 unresolved evidence blocks a meaningful MAS decision.
- No Tauri config, Cargo feature, entitlement, or capability change should be made in unattended mode.

