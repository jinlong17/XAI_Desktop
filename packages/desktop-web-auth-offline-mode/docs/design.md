# desktop-web-auth-offline-mode — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — desktop-side Phase 1 env policy using existing `VITE_WEB_AUTH_MODE=mock-authenticated` support |
| Review Doc Path | docs/reviews/desktop-web-auth-offline-mode/20260527-discovery-review.md |
| Review Date/Version | 2026-05-27 |
| Feature Type | P1 Phase 1 desktop auth/session policy |

## Frozen Assumptions

- ADR-0011 Phase 1 requires offline `/app` entry from the Tauri desktop app without network or Supabase configuration.
- `desktop-tauri-web-dist-normal-window` is already SHIPPED and is the prerequisite host rewrite for this feature.
- `apps/web/src/providers/AppProviders.tsx` already supports `mock-authenticated`; this feature should exploit that seam before inventing a new provider/session mode.
- The default Web/browser deployment behavior must stay intact. Live auth remains the normal Web contract unless a caller explicitly selects mock mode.
- `web-external-runtime-offline-gates` remains the owner of online-panel degradation after `/app` entry.
- Legacy overlay/control/grid implementation stays quarantined for P3+ reuse and is unrelated to this feature's active behavior.

## Dependency Overview

- Upstream authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`
  - `docs/audit/2026-05-26-patch-roadmap-source.md`
- Upstream shipped dependency:
  - `packages/desktop-tauri-web-dist-normal-window/docs/dev_log.md`
- Runtime seams:
  - `apps/web/src/providers/AppProviders.tsx`
  - `packages/web-auth-device-session/src/session.tsx`
  - `packages/web-auth-device-session/src/guards.tsx`
- Host/config surfaces:
  - `apps/desktop/package.json`
  - `apps/desktop/src-tauri/tauri.conf.json`
- Deferred follow-ons:
  - `desktop-phase1-build-packaging-pipeline`
  - `web-external-runtime-offline-gates`

## Phase 1 Desktop Auth Shape After This Feature

- Tauri desktop dev/build/bundle runs `apps/web` with `VITE_WEB_AUTH_MODE=mock-authenticated`.
- Desktop `/app` entry does not require `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.
- `WebAuthSessionProvider` resolves an authenticated mock session instead of `unconfigured`.
- `DeviceSessionBridge` remains inactive in the non-live Phase 1 desktop path, so no Supabase device register/heartbeat RPC is attempted.
- Browser/Web live auth defaults remain unchanged unless a non-desktop caller explicitly sets a mock mode.

## Fallback Boundary

If build verification proves env-only wiring is insufficient, the only acceptable fallback is a minimal auth-provider seam change behind a desktop-specific build flag or alias to the existing mock-authenticated path.

Rejected fallback:

- weakening `unconfigured` route-guard behavior
- broad `apps/web` business-module changes
- introducing Phase 3 local-session persistence in this feature

## Implementation Phases

### Phase 1 — Desktop Env Contract

- Update the desktop wrapper/Tauri build path so Phase 1 dev/build/bundle consistently exports `VITE_WEB_AUTH_MODE=mock-authenticated`.
- Keep `apps/web` default build scripts and normal browser behavior unchanged unless explicitly called through the desktop wrapper path.

### Phase 2 — Contract Hardening

- Verify the current mock-authenticated path is sufficient to reach `authenticated` state with no Supabase config.
- If needed, add only the smallest provider/test seam necessary to guarantee stable desktop behavior.
- Do not alter auth guards to allow `unconfigured` into `/app`.

### Phase 3 — Offline Evidence

- Verify `/app` entry on the desktop app with network disabled and no Supabase env.
- Record residual online-only degradation separately from auth/session success.
- Preserve DMG/final packaging ownership in `desktop-phase1-build-packaging-pipeline`.
