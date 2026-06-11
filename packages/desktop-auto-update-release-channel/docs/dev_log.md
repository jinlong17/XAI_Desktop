# desktop-auto-update-release-channel — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-auto-update-release-channel |
| Title | Internal Desktop Auto-Update and Release-Channel Guard |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | workflow-complete |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | ship (Codex, gpt-5.3-codex inline) |
| Updated | 2026-05-28 21:29 PDT |
| Risks | Feature is shipped on `dev`; residual external-release risk remains unchanged: real internal endpoint/public key/private signing inputs, real macOS internal-updater smoke against signed manifests, and Apple signing/notarization evidence before any production/public release claim. |

## Roadmap Context

- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Row: `#6`
- Seed: `docs/reviews/desktop-auto-update-release-channel/20260528-roadmap-seed.md`
- Dependency baseline: `desktop-phase1-rc-release-gate` is already SHIPPED and is treated as an upstream release baseline, not a row to reopen

## Phase Plan

### Phase 1 — Native updater foundation and placeholder guard

Status: DONE

- Add `tauri-plugin-updater` and the minimum host wiring needed for a feature-owned updater bridge.
- Replace the current "placeholder looks live" posture with explicit runtime/config preflight.
- Ensure placeholder endpoint/public-key values resolve to disabled/unavailable status rather than a latent live updater.
- Keep `apps/web` browser-safe by using a host-owned adapter seam.
- Expose snapshot plus manual `Check for Updates` behavior only.

### Phase 2 — Release-channel metadata and settings status surface

Status: DONE

- Freeze internal-only channel metadata (`disabled`, `internal-rc`, `internal-canary`).
- Expose version/channel/updater snapshot state to the browser-safe feature package.
- Add updater status and `Check for Updates` UI to Settings → About (preferred) or `More` fallback.
- Show explicit install-unavailable copy when an update is found.
- Keep release channel host-owned, not user-editable.

### Phase 3 — Verification and deferred install gate

Status: DONE

- Add bridge/runtime/unit coverage for placeholder rejection, disabled states, `up-to-date`, `update-available`, and `install_unavailable`.
- Run browser-safety, Rust, and desktop bundle verification.
- Record install/artifact work as deferred until real internal endpoint/public key/private signing inputs exist.
- Keep Apple signing/notarization as explicit downstream release gates rather than hidden assumptions.

## Review Notes

- Prior blockers are resolved. Install scope is consistently frozen to browser-safe `check/status-only`, with no install UI, no download/install action, and no updater-artifact build ownership in this row.
- The shared updater snapshot contract is now aligned across discovery/design/api/test/dev_log:
  - `availability = disabled | ready | checking | update-available | up-to-date | error`
  - `reasonCode = channel_disabled | missing_endpoint | placeholder_endpoint | missing_pubkey | placeholder_pubkey | updater_not_configured | install_unavailable | network_error | invalid_manifest | signature_error`
- The approved build target stays explicit: official Tauri updater for guarded status/manual check only, browser-safe host bridge required, internal channels separate from production/public claims, placeholder endpoint/pubkey treated as disabled states, and Apple signing/notarization retained as downstream release gates.
- Former feature-verify blocker is resolved by `44920a1f`: Settings → About now renders runtime app version from `useDesktopUpdaterSnapshot().currentVersion` with `v unknown` fallback, and about-pane tests assert runtime version truth while rejecting the stale `v 1.2.0 · build 2026.05.23` literals.
- Verification rerun confirms the remaining acceptance boundary is correct:
  - Rust preflight rejects placeholder endpoint/public-key values before `ready`
  - browser-safe bridge exposes `getSnapshot` / `check` / `subscribe` only
  - Settings → About shows version/channel/state/reason plus install-unavailable copy, with no user-editable release channel and no install action
  - `updater:default` capability is coarse but constrained by main-window-only scope plus UI/bridge/runtime contract; install remains unavailable and this is documented
  - no direct `@tauri-apps/*` or `__TAURI__` leakage was found under `apps/web/src`, `packages/desktop-auto-update-release-channel/src`, `packages/plugin-web-settings-rest/src`, or built `apps/web/dist/assets/*.js`

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-28 05:11 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: normalized the roadmap seed into a canonical feature brief, researched the official Tauri updater docs and plugin repository, verified the live placeholder baseline in `tauri.conf.json`/`Cargo.toml`, and wrote discovery/design/api/test/dev_log artifacts. Selected a guarded hybrid plan: integrate the official updater only behind explicit runtime/build preflight, keep internal channels separate from production promises, and require placeholder endpoint/public-key/private signing failures to surface as disabled/unavailable states. | — | feature-review |
| 2026-05-28 05:17 PDT | feature-review (Codex, gpt-5.3-codex inline) | Review verdict: REVISE. The guarded-hybrid direction is sound, but build should not proceed until the plan freezes whether this row owns install or only check/status, because that decision controls updater permissions and UI/runtime behavior. The planning set also has contract drift: discovery omits `up-to-date` from `availability`, while api/test require it, and api adds `install_error` without the same freeze in discovery. | — | feature-plan |
| 2026-05-28 05:20 PDT | feature-plan (Codex, gpt-5.3-codex inline) | Revise pass: froze the row to browser-safe updater status plus manual check only, removed install/artifact ownership from the current phase plan, and unified the shared updater contract across all planning artifacts. The exact enums are now `availability = disabled | ready | checking | update-available | up-to-date | error` and `reasonCode = channel_disabled | missing_endpoint | placeholder_endpoint | missing_pubkey | placeholder_pubkey | updater_not_configured | install_unavailable | network_error | invalid_manifest | signature_error`. Guarded-hybrid constraints otherwise remain unchanged. | — | feature-review |
| 2026-05-28 05:32 PDT | feature-review (Codex, gpt-5.3-codex inline) | Review verdict: APPROVED. Re-checked the revised planning set against repo truth and the prior blockers. Install scope is now consistently frozen to status/manual-check only, the exact availability and reason-code enums are aligned across discovery/design/api/test/dev_log, browser-safe host bridging remains required, internal channels stay separate from production/public claims, and tests explicitly guard against placeholder-config false readiness plus install-scope creep. | — | feature-build |
| 2026-05-28 05:44 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 1 — Native updater foundation and placeholder guard. Added `tauri-plugin-updater` host wiring, updater capability grant, Rust preflight+check command module (`desktop_updater_get_snapshot`/`desktop_updater_check`), host adapter injection (`window.__XAI_DESKTOP_UPDATER__`), and browser-safe feature package/runtime bridge mounted in `apps/web` providers. Placeholder endpoint/public-key values now map to explicit disabled reasons and do not report live readiness. | `d12ccb87` feat(desktop): Phase 1 — updater foundation and placeholder guard | phase-2 |
| 2026-05-28 05:45 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 2 — Release-channel metadata and settings status surface. Extended Settings → About with updater status/channel/reason/version rows, manual `Check for Updates`, and explicit `install_unavailable` copy when update metadata is detected. Kept release channel host-owned and avoided any install action exposure. | `6a9d8f5b` feat(plugin-web-settings-rest): Phase 2 — updater status surface | phase-3 |
| 2026-05-28 05:49 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 3 — Verification and deferred install gate. Added/ran bridge/runtime and Rust updater mapping coverage, validated browser-safety boundaries (`apps/web/src` + `dist`), and completed required gates: `pnpm --filter @repo/desktop-auto-update-release-channel test`, `pnpm --filter @repo/plugin-web-settings-rest test`, `pnpm --filter @repo/web test`, `pnpm --filter @repo/web build`, `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`, `pnpm --filter desktop tauri build --debug --bundles app`. Install/artifact ownership remains deferred until real internal endpoint/public key/private signing inputs and downstream Apple release gates. | `52c551bf` docs(desktop-auto-update-release-channel): Phase 3 — verification and deferred gate | feature-verify |
| 2026-05-28 05:56 PDT | feature-verify (Codex, gpt-5.4 inline) | Verification verdict: BLOCKED. Reviewed commits `d12ccb87`, `6a9d8f5b`, and `52c551bf` against the approved brief/discovery/design/api/test/dev_log contract. Re-ran declared gates successfully: `pnpm --filter @repo/desktop-auto-update-release-channel test`, `pnpm --filter @repo/plugin-web-settings-rest test`, `pnpm --filter @repo/web test`, `pnpm --filter @repo/web build`, `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`, `pnpm --filter desktop tauri build --debug --bundles app`. Source/browser-safety boundaries held, install stayed unavailable, and the Phase 3 commit traceability mismatch was clerical only. Blocking defects: Settings → About still hard-codes a stale version string instead of rendering the current desktop version from host/runtime contract truth, and the current about-pane tests assert that stale constant instead of the contract source. | `d12ccb87`, `6a9d8f5b`, `52c551bf` | feature-build |
| 2026-05-28 06:01 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Repair pass — verifier blockers fixed by removing stale About pane literals (`v 1.2.0 · build 2026.05.23`), rendering runtime app version from `useDesktopUpdaterSnapshot().currentVersion` with safe fallback (`v unknown`), and updating about-pane tests to assert runtime version contract plus reject stale literals. Updater row contract stays unchanged (`check/status-only`, no install UI/action/artifact ownership). Validation gates run in this pass: `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/aboutPane.test.tsx`, `pnpm --filter @repo/desktop-auto-update-release-channel test`, `pnpm --filter @repo/web build`. | `44920a1f` fix(plugin-web-settings-rest): repair about pane runtime version contract | feature-verify |
| 2026-05-28 06:06 PDT | feature-verify (Codex, gpt-5.4 inline) | Verification verdict: PASS. Reviewed commits `d12ccb87`, `6a9d8f5b`, `52c551bf`, and `44920a1f` against the approved brief/discovery/design/api/test/dev_log contract and confirmed each commit stayed within a single phase/repair intent with commit-convention-compliant messages. Re-ran verification gates successfully: `pnpm --filter @repo/desktop-auto-update-release-channel test`, `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/aboutPane.test.tsx`, `pnpm --filter @repo/plugin-web-settings-rest test`, `pnpm --filter @repo/web test`, `pnpm --filter @repo/web build`, `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`, `pnpm --filter desktop tauri build --debug --bundles app`, plus browser-safety scans for source and built assets. Remaining risks are downstream/manual only: real internal endpoint/key/signing smoke and Apple signing/notarization evidence. | `d12ccb87`, `6a9d8f5b`, `52c551bf`, `44920a1f` | ship |
| 2026-05-28 21:29 PDT | ship (Codex, gpt-5.3-codex inline) | Shipping pass: confirmed `READY_TO_SHIP` from this dev log, re-validated commit integrity for `d12ccb87`, `6a9d8f5b`, `52c551bf`, and `44920a1f`, ran lightweight ship gates (`git status`, `git log`, branch/remote parity), and wrote SHIPPED state plus roadmap row #6 bookkeeping. Residual release risk remains real internal endpoint/key/signing plus Apple signing/notarization and real macOS updater smoke. | `d12ccb87`, `6a9d8f5b`, `52c551bf`, `44920a1f` | roadmap row #6 ship |
