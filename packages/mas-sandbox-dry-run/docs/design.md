# mas-sandbox-dry-run — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | DMG/private transparent path by default; `mas-sandbox` compile fallback omits Rust `.transparent(true)` calls for non-private dry-runs |
| Review Doc Path | docs/reviews/mas-sandbox-dry-run/20260519-discovery-review.md |
| Review Date/Version | 2026-05-19 |
| Feature Type | Release/security validation gate |

## Frozen Assumptions

- Current transparent Grid/control window construction is private-API-gated by default.
- `mas-sandbox` is a compile-only fallback switch: it avoids Rust `.transparent(true)` calls, but does not prove acceptable MAS runtime UX.
- MAS feasibility cannot be proven until the fallback is signed/sandbox tested.
- G0.4 Finder path evidence is READY_TO_SHIP for the default runtime, but MAS still needs security-scoped bookmark validation.
- No entitlement or capability change should be made without signed/sandbox evidence.
