# Feature Brief — desktop-auto-update-release-channel

| Field | Value |
|---|---|
| Feature | desktop-auto-update-release-channel |
| Title | Internal Desktop Auto-Update and Release-Channel Guard |
| Date | 2026-05-28 |
| Source | Roadmap row `#6` in `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` plus seed `docs/reviews/desktop-auto-update-release-channel/20260528-roadmap-seed.md` |
| Executor | feature-plan (Codex, gpt-5.3-codex inline) |

## Requirement

Add a Tauri updater and release-channel plan plus implementation suitable for internal builds. For this row, the contract is frozen to browser-safe updater status plus manual check only; download/install and updater-artifact creation stay unavailable until real internal signing and hosting exist. Signing, notarization, and credential gaps must be explicit gates rather than hidden assumptions.

## Naming Rationale

The provided slug already matches the required work:

- `desktop` — the active surface is the Tauri/macOS host on branch `dev`
- `auto-update` — the row owns updater detection, guarded status/check behavior, and explicit install gating
- `release-channel` — the row must separate internal channels from production claims and document the channel contract explicitly

## Scope

- Replace the current placeholder-only updater posture with a feature-owned guarded hybrid that exposes status plus manual check only in this row.
- Freeze the release-channel metadata contract for internal desktop builds:
  - channel identity
  - endpoint shape
  - updater public-key source
  - exact availability enum
  - exact reason-code enum
- Keep the `apps/web` bundle browser-safe by routing desktop updater behavior through a host-owned seam rather than direct `@tauri-apps/*` imports in shared web code.
- Define build-time and runtime guards that prevent placeholder endpoint/public-key values from being treated as a live updater.
- Freeze install scope for this row:
  - no download/install action in UI
  - no updater-artifact build path owned by this row
  - explicit `install_unavailable` semantics when an update is detected but install remains out of scope
- Document signing, notarization, updater private-key, and release-hosting gaps as explicit gates.
- Leave the workspace in a plan state that can proceed to `feature-review`.

## Non-goals

- No ship, push, publish, notarization, or release-CI rollout from this row.
- No claim that the desktop app is externally release-ready without Apple signing/notarization evidence.
- No download/install flow or updater-artifact signing/build owned by this row.
- No reopening of `desktop-phase1-rc-release-gate`; it is an upstream shipped baseline only.
- No Phase 3 local-first, sync, SQLite, overlay revival, or organizer/control/grid reactivation.
- No hidden fallback where `updates.example.invalid` or `DEFERRED_TAURI_UPDATER_PUBLIC_KEY` silently remain in the live updater path.

## Acceptance

- Planning artifacts exist for this feature: feature brief, discovery review, design, api, test, and dev_log.
- The selected plan explicitly classifies the current placeholder updater path as guarded or disabled rather than live.
- The row owns browser-safe status plus manual check only; install remains explicitly unavailable in this iteration.
- Release-channel metadata is documented with exact contract fields and owning files.
- The exact shared updater snapshot contract is frozen across all artifacts:
  - `availability = disabled | ready | checking | update-available | up-to-date | error`
  - `reasonCode = channel_disabled | missing_endpoint | placeholder_endpoint | missing_pubkey | placeholder_pubkey | updater_not_configured | install_unavailable | network_error | invalid_manifest | signature_error`
- Missing credentials and external release gates are listed explicitly:
  - updater signing private key
  - real updater public key
  - real internal update endpoint
  - Apple signing/notarization evidence for external release claims
- The plan includes tests that fail or surface clear status when placeholder endpoint/public-key values are still present.

## Current Baseline

- `apps/desktop/src-tauri/tauri.conf.json` currently contains updater placeholders:
  - `pubkey = DEFERRED_TAURI_UPDATER_PUBLIC_KEY`
  - `endpoints = https://updates.example.invalid/.../latest.json`
- `apps/desktop/src-tauri/Cargo.toml` does not yet include `tauri-plugin-updater`
- no broad updater runtime, status surface, or release-channel bridge currently appears in the app
- `docs/release/versioning.md` already records the placeholder updater state and the deferred signing/notarization gates
- `desktop-phase1-rc-release-gate` is SHIPPED and remains the precondition baseline

## Decision Freeze

This feature-plan freezes the row to a guarded hybrid with `check/status-only` behavior:

1. the host may expose updater status and manual check when real endpoint/public-key inputs exist
2. placeholder or missing inputs resolve to explicit disabled/unavailable states
3. download/install and updater-artifact creation remain out of scope until real internal signing/private-key/release-host infrastructure exists

## Deferred Validation

- Real internal update download/install against a controlled update host
- Real updater-artifact signing/build with non-placeholder keys
- Apple signing/notarization evidence for any production or public-release claim
