# mas-sandbox-dry-run — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | DMG/private transparent path; MAS requires fallback design before runtime validation |
| Review Doc Path | docs/reviews/mas-sandbox-dry-run/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | Release/security validation gate |

## Frozen Assumptions

- Current transparent Grid/control window construction cannot compile when the private API path is disabled.
- MAS feasibility cannot be proven until a non-transparent or conditionally compiled fallback exists and is signed/sandbox tested.
- G0.4 Finder path evidence is READY_TO_SHIP for the default runtime, but MAS still needs security-scoped bookmark validation.
- No permanent Tauri config, Cargo feature, entitlement, or capability change should be made without a dedicated MAS fallback implementation slice.
