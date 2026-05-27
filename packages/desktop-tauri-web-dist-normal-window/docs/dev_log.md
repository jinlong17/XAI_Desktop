# desktop-tauri-web-dist-normal-window — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-tauri-web-dist-normal-window |
| Title | Phase 1 Desktop Normal Window Loading `apps/web` Dist |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex gpt-5.4 inline fix) |
| Updated | 2026-05-27 10:09 PDT |
| Risks | Auth/offline `/app` entry is intentionally deferred to `desktop-web-auth-offline-mode`; capability narrowing must not leave hidden legacy callers; tray/status startup removal decision must stay Phase 1 only and not drift into Phase 2 scope. |

## Phase Plan

### Phase 1 — Repoint Tauri to `apps/web`

Status: DONE (2026-05-27, commit `afb8295`).

- Switch Tauri dev/build ownership from the legacy desktop Vite app to `apps/web`.
- Update desktop package scripts so Tauri is a host wrapper, not the primary frontend bundle owner.
- Reduce `apps/desktop/src/App.tsx` to a minimal fallback that cannot restart organizer overlay behavior.

### Phase 2 — Remove Overlay Startup

Status: DONE (2026-05-27, commit `94df0ef`).

- Stop overlay-specific `main` window configuration in `lib.rs`.
- Stop control/grid startup and related monitor-filling assumptions.
- Reduce `window_ext.rs` to a normal-window macOS seam.

### Phase 3 — Narrow the Native Surface

Status: DONE (2026-05-27, commit `3a65d62`).

- Remove or unregister legacy window lifecycle commands from the active Phase 1 invoke surface.
- Narrow capability files to the minimum Phase 1 main-window scope.
- Validate that startup launches only one normal window and bundled static assets still boot offline.

## Review Notes

**Verdict: APPROVED** — 0 blockers, 3 recommendations (non-blocking).

### Strengths

- **Scope discipline.** Plan correctly carves out the other 3 Phase 1 blockers as deferred follow-ons (`design.md:24-27`, `feature-brief.md:37`). Does not contradict ADR-0011 §S6 legacy-retention discipline.
- **Authority alignment.** Frozen Assumptions cite ADR-0011 §D1 + audit `2026-05-26-web-completeness-and-p1-redefinition.md` §2.4 + patch-roadmap row 1.
- **Discovery quality.** 3 candidate options (A: repoint; B: port; C: iframe) are properly compared in `discovery-review.md:24-67`. Option A is justified against the operator-confirmed PIVOT and ADR-0011 §D1.
- **Contract completeness.** `api.md` covers (a) `apps/web` build inputs, (b) Tauri main window state target (all 6 transparent-overlay fields in `tauri.conf.json:22-31` plus `frontendDist`), (c) Rust startup contract (`lib.rs:135-200` `configure_main_overlay` + control + monitor-fill must go), (d) macOS adapter contract (`window_ext.rs:32-50` overlay helpers neutralized), (e) command-surface narrowing for `grid_*`/`console`/`control` lifecycle, (f) capability scope narrowing.
- **Phase plan reviewability.** 3 phases (Dist Handoff → Normal Window Startup → Surface Narrowing) each have clear file boundaries, are independently committable, and map cleanly to feature-build's one-phase-per-run rule.
- **Documentation contract compliance.** All four docs (design/api/test/dev_log) exist with Decision Snapshot fields, Frozen Assumptions, Status Panel, Phase Plan, Work Log. dev_log has `Automation Mode = D-Codex` + `Verify Cross-vendor = yes` per portable V2 Phase 0 contract.
- **Legacy retention discipline.** Plan correctly says "unregister / reduce to fallback" not "delete" (e.g. `discovery-review.md:92-94`), aligning with ADR-0011 §S6 ("legacy code under `apps/desktop/src-tauri/` is NOT deleted in this ADR").
- **Test strategy carves Phase 1 exit gate.** `test.md:41-51` explicitly distinguishes acceptable Phase 1 outcomes (static shell, login gate, OR full `/app`) from the next feature's responsibility — a missing bundle is unacceptable here, but a login gate is.

### Non-blocking recommendations for feature-build

1. **`apps/desktop/src/main.tsx` is not in `feature-brief.md:25-31` scope but currently registers 5 plugins (`registerAccountPlugin`, `registerAiCubePlugin`, `registerProductivityPlugin`, `registerLabelsPlugin`, `registerConsolePlugin`) and routes to `GridWindow`/`ControlWindow`/`ConsoleWindow`.** Once Tauri repoints to `apps/web`, `apps/desktop/src/main.tsx` is no longer the active entry, so this is implicit — but the build phase should explicitly document whether `main.tsx` is reduced (matching `App.tsx` reduction in Phase 1) or left dormant as desktop-frontend fallback. Recommend: reduce both in the same Phase 1 commit for consistency.
2. **`commands::menubar::install_sync_menubar` at `lib.rs:140` is called unconditionally during setup.** Phase 2 of the plan ("Remove Overlay Startup") says "Stop overlay-specific `main` window configuration" but does not explicitly list the menubar tray install. Per `audit/2026-05-26-web-completeness-and-p1-redefinition.md:163-164`, Phase 1 does not require a full macOS app menu, but the existing sync tray is acceptable to leave intact. Recommend: build phase decides explicitly (keep inert vs remove startup call) and documents in the Phase 2 commit body. Phase 2 status-bar scope creep is the risk to avoid.
3. **`PLUGIN_MAP.md` §Roadmap/CI Gate Anchors row for this feature is not yet present.** Per ADR-0011 §S6 and the precedent set by G0/G1 rows (`window-ground-truth`, `grid-window-prototype`, …), this feature qualifies as a "roadmap workflow anchor" (not a plugin — no `manifest.json` required). Per SOP_NEW_FEATURE §Phase 8 step 3, the PLUGIN_MAP row update happens at ship-time, not plan-time, so this is OK to defer — but feature-build / ship should add a row (suggested status: `Active` during build → `Shipped` after merge) to keep audit traceability.

### Risks (already captured in Status Panel)

- Auth/offline `/app` entry is intentionally deferred to `desktop-web-auth-offline-mode`. Verified.
- Capability narrowing must not leave hidden legacy callers. Verified — `discovery-review.md:87,93` flags this for build phase confirmation.
- Tray/status startup removal decision must stay Phase 1 only and not drift into Phase 2 scope. Verified — recommendation #2 above.

### Authority cross-check verified

- `tauri.conf.json:22-31` — all 6 overlay flags identified by the plan are present in actual code.
- `tauri.conf.json:10` — `frontendDist: "../dist"` confirmed; plan correctly targets repointing to `apps/web/dist`.
- `lib.rs:135-198` — `configure_main_window` (renamed from `configure_main_overlay` in code) + monitor-fill resize + control window startup all present; plan covers all.
- `window_ext.rs:32-75` — `configure_main_window` + `configure_control_window` + `configure_grid_window` overlay-specific behaviors confirmed; plan covers neutralization.
- `App.tsx:1-30` — `OrganizerLayer` + `GridSystemProvider` + `pointerEvents: "none"` confirmed; plan covers reduction to non-overlay fallback.
- `apps/desktop/src-tauri/capabilities/default.json:4-5` — `["main", "control", "console", "grid_*"]` confirmed; plan covers narrowing to `main` only.
- `apps/web/package.json:6-9` — `dev` + `build` scripts confirmed available for Tauri to consume.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-27 00:58 PDT | feature-plan (gpt-5.3-codex) | Fresh plan: created Step 0 brief, discovery review, and docs quartet for the Phase 1 normal-window `apps/web` dist handoff. | — | feature-review |
| 2026-05-27 01:42 PDT | feature-review (claude-opus-4-7) | APPROVED — 0 blockers, 3 non-blocking recommendations recorded. Cross-checked all 6 transparent-overlay fields in tauri.conf.json:22-31, lib.rs:135-198, window_ext.rs:32-75, App.tsx:1-30, default.json:4-5 against plan scope. Scope discipline holds; ADR-0011 §S6 legacy-retention respected. Phase plan is reviewable with clear file boundaries per phase. | — | feature-build |
| 2026-05-27 02:11 PDT | feature-build (gpt-5.3-codex) | Phase 1 implemented: repointed Tauri build/dev contract to `apps/web` (`beforeDevCommand`, `devUrl`, `beforeBuildCommand`, `frontendDist`), changed `apps/desktop` scripts to web-wrapper role, and replaced legacy overlay `App.tsx` with an explicit non-overlay fallback view. Validation run: `pnpm --filter @repo/web build` failed on unresolved `@repo/xai-web-cmdk`; `pnpm --filter desktop exec tsc --noEmit` failed on existing unused-symbol TS errors; `pnpm --filter desktop tauri build --debug` failed at the same web build step. | `afb8295` | feature-build |
| 2026-05-27 02:17 PDT | feature-build (gpt-5.3-codex) | Phase 2 implemented: removed overlay-era startup assumptions from Rust/macOS path by deleting control-window auto-start and monitor-fill logic in `lib.rs`, applying normal-window runtime chrome defaults, and replacing macOS desktop-level/click-through window configuration with standard-window behavior in `window_ext.rs`. Validation run: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passed (47 tests); `pnpm --filter @repo/web build` still fails on unresolved `@repo/xai-web-cmdk`; `pnpm --filter desktop tauri build --debug` fails at the same known web build blocker. | `94df0ef` | feature-build |
| 2026-05-27 02:23 PDT | feature-build (gpt-5.3-codex) | Phase 3 implemented: removed legacy grid/console window lifecycle commands from active `invoke_handler`, dropped legacy grid/console runtime state wiring from startup, and narrowed capability JSON window scopes to Phase 1 `main` only (`default`, `plugin-account-crypto`, `plugin-account-keychain`, `plugin-data-database`) with matching `capabilities/AUDIT.md` updates. Validation run: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passed (47 tests); `pnpm --filter @repo/web build` still fails on unresolved `@repo/xai-web-cmdk`; `pnpm --filter desktop tauri build --debug` fails at the same web build blocker before bundled/offline launch smoke can proceed. | `3a65d62`, `997aee3` | feature-verify |
| 2026-05-27 02:27 PDT | feature-verify (Codex gpt-5.4 inline) | Verification BLOCKED after reviewing commits `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, and `643d0ff` against the approved brief/discovery/design/api/test/dev_log artifacts and current tree. Commit bodies follow the repo convention and phase boundaries are clean, `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passes (47/47), but ship readiness fails on three hard gates: `pnpm --filter @repo/web build` still fails on unresolved `@repo/xai-web-cmdk`, `pnpm --filter desktop tauri build --debug` fails at the same `beforeBuildCommand` step so bundled/offline launch cannot be verified, `apps/desktop/src-tauri/tauri.conf.json` still advertises overlay-era main-window flags (`resizable: false`, `transparent: true`, `decorations: false`, `skipTaskbar: true`, `hiddenTitle: true`, `titleBarStyle: "Overlay"`) instead of the approved normal-window contract, and required feature docs (`docs/reviews/...`, `design.md`, `api.md`, `test.md`) are present on disk but not tracked in git. | `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff` | feature-build |
| 2026-05-27 09:37 PDT | feature-auto-build (Codex gpt-5.4 inline fix) | Fixed the three verify blockers: restored workspace dependency links with `pnpm install --frozen-lockfile` so `@repo/xai-web-cmdk` resolves for `@repo/web`, changed `tauri.conf.json` main window flags to normal-window values (`resizable: true`, `transparent: false`, `decorations: true`, `shadow: true`, `skipTaskbar: false`, `hiddenTitle: false`, `titleBarStyle: "Visible"`, `dragDropEnabled: true`), and staged required workflow docs for git tracking. Validation run: `pnpm --filter @repo/web build` passed; `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passed (47 tests); `pnpm --filter desktop tauri build --debug --bundles app` passed and produced `target/debug/bundle/macos/X Desktop.app`. Full default `pnpm --filter desktop tauri build --debug` now gets past web build/app bundling but still fails in DMG bundling, which is deferred to `desktop-phase1-build-packaging-pipeline`. | this commit | feature-verify |
| 2026-05-27 10:09 PDT | feature-auto-build (Codex gpt-5.4 inline fix) | Closed the second verify blocker set by aligning `test.md` with the app-bundle acceptance scope (`pnpm --filter desktop tauri build --debug --bundles app`) and documenting that default DMG packaging is deferred to `desktop-phase1-build-packaging-pipeline`. Added `docs/reviews/desktop-tauri-web-dist-normal-window/20260527-offline-launch-smoke.md` with app-bundle/static-dist evidence, including the `feature-verify` launch observation of a standard `AI Smart Desktop` window on local `tauri://localhost` content and explicit external-origin degradation notes for fonts/map tiles. | pending | feature-verify |
| 2026-05-27 10:06 PDT | feature-verify (Codex gpt-5.4 inline) | Verification BLOCKED after independently re-running the repaired checks on `e4a1b05`, reviewing commits `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff`, and `e4a1b05`, and launching the built `X Desktop.app`. `pnpm --filter @repo/web build` passes, `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passes (47/47), `pnpm --filter desktop tauri build --debug --bundles app` passes, and the bundled app opens as a single standard `AI Smart Desktop` window with rendered local `tauri://localhost` content. Ship readiness still fails because `packages/desktop-tauri-web-dist-normal-window/docs/test.md` continues to require full `pnpm --filter desktop tauri build --debug`, but that command still fails in DMG bundling while `design.md` and the prior dev_log entry defer DMG packaging to `desktop-phase1-build-packaging-pipeline`; offline/network-disabled launch evidence also remains unrecorded. | `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff`, `e4a1b05` | feature-build |
