# Feature Brief — mas-sandbox-dry-run

| Field | Value |
|---|---|
| Feature | mas-sandbox-dry-run |
| Gate | G0 — window spike |
| Source | docs/planning/execution/G0-window-spike.md §G0.6 |
| Date | 2026-05-19 |
| Executor | Codex serial inline conductor |

## Requirement

Prepare MAS sandbox dry-run notes for window/DnD/private API risk and identify the human/runtime evidence needed before G0 can make a DMG/MAS decision.

## Scope

- Create `docs/reviews/window-ground-truth/mas-sandbox-dry-run/mas-sandbox-notes.md`.
- Create a minimal entitlement draft and risk matrix.
- Record all unverifiable paths as pending instead of claiming feasibility.
- Do not change `tauri.conf.json`, Cargo features, entitlements, or capabilities in unattended mode.

## Non-goals

- No signed build.
- No Apple Developer account use.
- No MAS package generation.
- No `macOSPrivateApi=false` runtime conclusion.
- No changes to Tauri config or window code.

## Acceptance

Blocked in unattended mode. G0.6 acceptance requires actual `macOSPrivateApi=false` and sandbox capability evidence; this run can only prepare notes and draft risks.

## Tests

- Safe prep check: `mas-sandbox-notes.md` exists.
- Deferred: signed/sandboxed macOS build and `macOSPrivateApi=false` runtime verification.

## Contract Impact

None for safe prep. Future Tauri capability or entitlement changes must update `docs/contracts/tauri-commands-v0.md` or ADR-0005.

