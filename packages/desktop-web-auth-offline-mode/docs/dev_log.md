# desktop-web-auth-offline-mode — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-web-auth-offline-mode |
| Title | Phase 1 Desktop Offline `/app` Auth Session Policy |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex, gpt-5.3-codex inline) |
| Updated | 2026-05-27 15:23 PDT |
| Risks | Desktop env injection must remain canonical in `tauri.conf.json` or launches can silently fall back to live auth and redirect to `/auth/login`; `/app` entry success does not close remaining online-panel degradation, which stays deferred to `web-external-runtime-offline-gates`; offline GUI smoke for network-disabled launch still needs real macOS manual verification in feature-verify. |

## Phase Plan

### Phase 1 — Desktop Env Policy Wiring

Status: DONE (commit: `8f2bfc7`).

- Update the desktop Tauri dev/build/bundle path to export `VITE_WEB_AUTH_MODE=mock-authenticated`.
- Keep normal `apps/web` behavior unchanged unless called through the desktop wrapper path.
- Prefer host/config changes over web-source edits.

### Phase 2 — Auth Contract Hardening

Status: DONE (commit: `0cc0a0e`).

- Verify that existing mock-authenticated support is sufficient for desktop `/app` entry without Supabase env.
- If source changes are unavoidable, keep them minimal and isolated to the auth-provider seam or its tests.
- Explicitly reject guard weakening for `unconfigured`.

### Phase 3 — Offline Desktop Evidence

Status: DONE (commit: `60d43cd`).

- Prove `/app` entry on Tauri dev and app-bundle launch without network or Supabase config.
- Record residual online-only degradation separately from auth/session success.
- Keep DMG/final packaging ownership in `desktop-phase1-build-packaging-pipeline`.

## Review Notes

**Verdict: APPROVED** — 0 blockers, 2 recommendations.

- Discovery quality is sufficient. The recommendation to reuse existing `mock-authenticated` behavior is grounded in current code: `apps/web/src/providers/AppProviders.tsx` already distinguishes `live` vs mock modes, `packages/web-auth-device-session/src/session.tsx` only reaches `unconfigured` when a live client lacks Supabase config, and `packages/web-auth-device-session/src/guards.tsx` still requires `authenticated` for `/app`.
- The selected option preserves Web live-auth semantics because it scopes the override to the desktop host path rather than changing browser defaults or weakening `unconfigured` guard behavior.
- The phase split is reviewable and stays inside P1 Phase 1: host env wiring first, minimal auth-seam hardening only if needed second, offline desktop evidence third. Online panel degradation remains correctly deferred to `web-external-runtime-offline-gates`.

Recommendations for `feature-build`:

- Make `apps/desktop/src-tauri/tauri.conf.json` `beforeDevCommand` and `beforeBuildCommand` the canonical env-injection source for `pnpm --filter desktop tauri dev` and `pnpm --filter desktop tauri build --debug --bundles app`; if package scripts are updated too, keep them as wrappers that cannot drift from Tauri's commands.
- If Phase 2 needs code/tests, prove both sides explicitly: desktop mock mode reaches `authenticated` with `transport = null`, and live/unconfigured Web behavior still redirects `/app` to `/auth/login` unchanged.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-27 15:13 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: created the feature brief, discovery review, and docs quartet for the Phase 1 desktop offline `/app` auth/session policy. Recommended desktop-side `mock-authenticated` env wiring as the primary path, with minimal provider-seam fallback only if build verification proves env-only wiring insufficient. | — | feature-review |
| 2026-05-27 15:19 PDT | feature-review (Codex, gpt-5 inline) | APPROVED — validated that desktop-side env/config policy is sufficient as the primary plan, does not require weakening live Web auth, keeps scope inside P1 Phase 1, and defers online-panel degradation to `web-external-runtime-offline-gates`. Recorded 2 build-phase recommendations about canonical env injection and explicit auth-regression proof. | — | feature-build |
| 2026-05-27 15:21 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | **Phase 1 — Desktop Env Policy Wiring:** made `apps/desktop/src-tauri/tauri.conf.json` `beforeDevCommand` / `beforeBuildCommand` inject `VITE_WEB_AUTH_MODE=mock-authenticated`, making desktop Tauri commands the canonical env source. | `8f2bfc7` | Phase 2 |
| 2026-05-27 15:22 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | **Phase 2 — Auth Contract Hardening:** added focused tests proving mock desktop mode keeps transport inactive while yielding authenticated mock session, and that live/unconfigured `/app` still redirects to `/auth/login` unchanged. Tests: `pnpm --filter @repo/web-auth-device-session test` (43/43), `pnpm --filter @repo/web test` (117/117). | `0cc0a0e` | Phase 3 |
| 2026-05-27 15:23 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | **Phase 3 — Offline Desktop Evidence:** recorded committed feature docs + discovery artifact baseline and executed required build gates. Tests: `pnpm --filter @repo/web check-types`, `pnpm --filter @repo/web build`, `pnpm --filter desktop tauri build --debug --bundles app` (bundle output: `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`; beforeBuildCommand showed mock-auth env injection). Manual network-disabled GUI smoke remains deferred to feature-verify on macOS hardware. | `60d43cd` | feature-verify |
