# Discovery Review — desktop-web-auth-offline-mode

## Problem Framing

`desktop-tauri-web-dist-normal-window` already repointed the active Tauri host to `apps/web`, so the next Phase 1 blocker is auth/session entry policy, not shell loading.

Current repo behavior:

- `apps/web/src/providers/AppProviders.tsx` defaults `VITE_WEB_AUTH_MODE` to `live` when unset.
- The same provider already supports `mock-authenticated` and `mock-unauthenticated`.
- `resolveWebSupabaseConfig()` returns `null` when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are absent.
- `packages/web-auth-device-session/src/session.tsx` therefore enters `unconfigured` when live mode is selected without Supabase config.
- `packages/web-auth-device-session/src/guards.tsx` only allows `/app` when session state is `authenticated`; `unauthenticated` and `unconfigured` both redirect to `/auth/login`.
- The mock path is already a first-class precedent:
  - `apps/web/package.json` exposes `dev:mock-auth`
  - `.github/workflows/deploy-web.yml` builds the SPA with `VITE_WEB_AUTH_MODE=mock-authenticated`
- In non-live mode, `AppProviders` passes `config = null` and does not mount `DeviceSessionBridge`, so Supabase device registration / heartbeat RPC is skipped.

Result: the current desktop host can load the web shell, but without an explicit Phase 1 desktop auth policy it may still redirect away from `/app` in offline or unconfigured environments.

## External Research

No external research required. This is an internal runtime-policy and build-contract decision.

## Candidate Options

### Option A — Desktop-side env policy using existing `mock-authenticated` support

Drive Phase 1 desktop dev/build/bundle with `VITE_WEB_AUTH_MODE=mock-authenticated`, keeping normal Web builds on their existing defaults.

Pros:

- Reuses an auth mode that already exists in `AppProviders`.
- Avoids broad `apps/web` source changes and preserves the user constraint to prefer desktop-side policy.
- Requires no Supabase env to reach authenticated state.
- Keeps `DeviceSessionBridge` inactive, so device RPC is not attempted offline.
- Matches the accepted audit recommendation and Cloudflare CI precedent.

Cons:

- Desktop session identity is synthetic (`mock-user`) rather than a real persisted account.
- Feature work must prove env injection is consistently applied across Tauri dev, build, and bundled app launch.
- Online-only panels may still degrade after `/app` entry; that belongs to `web-external-runtime-offline-gates`.

### Option B — Introduce a desktop-local session provider or new desktop auth mode

Add a dedicated desktop-local session/provider seam, likely in `AppProviders` and the auth/session package, so the desktop runtime authenticates locally without using the existing mock mode.

Pros:

- More explicit long-term desktop contract.
- Could evolve into a later local-session bridge if Phase 2/3 wants a desktop-specific identity seam.

Cons:

- Touches web-source auth provider code immediately.
- Creates a second non-live session strategy when one already exists.
- Expands the verification matrix and test burden.
- Risks unnecessary drift from the accepted Phase 1 recommendation before the simplest path is exhausted.

### Option C — Relax route guards so `unconfigured` may enter `/app`

Change guard behavior so an unconfigured live session can open `/app` without an authenticated state.

Pros:

- Small code diff on paper.

Cons:

- Changes browser/Web semantics globally, not just desktop.
- Conflates "offline desktop Phase 1" with "misconfigured live Web".
- Undermines future live Supabase/account sync by weakening the contract instead of selecting a deliberate non-live mode.
- Makes failures less explicit and harder to reason about.

## Recommendation

Choose Option A.

The repo already has the right Phase 1 seam: `mock-authenticated` exists, is accepted in CI, and directly satisfies the route guard contract by producing `authenticated` state without Supabase configuration. This is the smallest phase-clean change and best matches the user constraint to prefer desktop-side env/config/session policy.

Option B should remain a fallback only if build verification shows that desktop env injection cannot be made reliable without a minimal provider seam. Option C should be rejected.

## Selected Execution Notes

- The Phase 1 desktop host should become the single authority that injects `VITE_WEB_AUTH_MODE=mock-authenticated` for Tauri dev/build/bundle.
- The default Web/browser path should remain unchanged: no new global default auth mode, no live-guard weakening.
- Preferred build shape:
  - desktop wrapper scripts and/or Tauri `beforeDevCommand` / `beforeBuildCommand` inject the Phase 1 auth mode
  - no `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` required for desktop `/app`
- If code changes become unavoidable, keep them minimal and isolated to the auth provider seam or its tests. Do not touch module business logic.
- Verification must explicitly prove:
  - `/app` reaches module content offline
  - no redirect to `/auth/login`
  - no Supabase device RPC path is active in desktop Phase 1
  - live Web default behavior remains unchanged

## Risks

- A desktop run that misses the env injection will silently fall back to live mode and reintroduce the `/auth/login` redirect.
- The mock authenticated identity may mask future account-specific edge cases; that is acceptable for Phase 1 but must be documented as temporary.
- External online surfaces may still show partial failures after `/app` entry. That is expected until `web-external-runtime-offline-gates`.
- Real offline behavior for the built `.app` still requires manual macOS verification; simulator or browser-only proof is not enough.

## Open Questions

- Where should the Phase 1 env injection live as the single source of truth? Recommendation: desktop host scripts plus Tauri build commands, not `apps/web` defaults.
- Should desktop Phase 1 expose a toggle between live and mock auth? Recommendation: no. Keep the acceptance path deterministic and mock-authenticated by default for this feature.
- If a fallback code seam is required, should it be a new auth mode or a desktop-only alias to the existing mock-authenticated path? Recommendation: alias or reuse existing mock behavior; do not invent a third behavior unless strictly necessary.

## Phased Build Outline

1. Wire the desktop Tauri dev/build/bundle path so Phase 1 always runs `apps/web` with `VITE_WEB_AUTH_MODE=mock-authenticated`.
2. Add contract hardening and tests only where needed to prove authenticated mock state, no Supabase-config requirement, and no active device-session RPC path.
3. Record desktop offline verification evidence for `/app` entry and explicitly defer remaining online-only degradation to `web-external-runtime-offline-gates`.
