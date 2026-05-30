# design.md — desktop-host-capability-profile-split

> Decision snapshot only. Discovery detail lives in the review doc.

## Decision Snapshot

- **Selected Option**: Option A (build-time env `VITE_XAI_DESKTOP_HOST=tauri`
  injected by `tauri.conf.json`, resolved by a new `@repo/core`
  `resolveDesktopHost(env?)` / `isDesktopHost(...)`), **retaining Option C**
  (adapter-availability `readAdapter() !== null`) as the per-capability
  AND-guard. **Optional Option-B** (`globalThis.__TAURI_INTERNALS__`) pure
  fallback inside the core resolver — pending review confirmation (O1).
- **Review Doc Path**: `docs/reviews/desktop-host-capability-profile-split/20260530-discovery-review.md`
- **Feature Brief**: `docs/reviews/desktop-host-capability-profile-split/20260530-feature-brief.md`
- **Review Date / Version**: 2026-05-30 / v1 (feature-review APPROVED)

## Frozen Assumptions

1. UI behaviour (Organizer filter, Boards/Tasks seed-vs-empty, online-only panel
   degradation) stays gated on `VITE_WEB_RUNTIME_PROFILE`. Desktop stays
   `web-live`. NO UI regression.
2. Desktop native capabilities are gated on the NEW host signal, never on the UI
   profile and never on `VITE_WEB_AUTH_MODE`.
3. `desktop-phase1-offline` is NOT reintroduced as a UI profile.
4. New core resolver mirrors `resolveWebRuntimeProfile(env?)` so existing
   `vi.stubEnv` tests keep working.
5. Per-callsite KEEP/MOVE classification is frozen in review §2 and is the build
   contract. KEEP = stays on `runtimeProfile`; MOVE = switches to `isDesktopHost`.
6. No new typed events; no Tauri command signature changes.

## MOVE set (capability — switch to host signal)

- `apps/web/src/providers/AppProviders.tsx` (repo bridge mount, `__XAI_DESKTOP_*`
  globals, transport) — lines 294–295/302–310/313/335–340. ONLY `apps/web` MOVE
  site. (Verified 2026-05-30.)
- `packages/desktop-native-notifications-reminders/src/runtime.ts` — :64/:139/:180
  (:180 keeps adapter AND).
- `packages/desktop-statusbar-quick-actions/src/runtime.ts` — :150.
- `packages/desktop-auto-update-release-channel/src/runtime.ts` — :125/:147.

NO change required (confirmed 2026-05-30):
- `packages/plugin-web-storage` bridge — `enabled` is caller-supplied; the package
  never calls `isDesktopPhase1OfflineRuntime`. Only the boolean `AppProviders`
  passes changes (profile-derived → host-derived).
- `packages/desktop-global-hotkey-quick-open/src/runtime.ts` — already adapter-only
  (no profile gate). Already correct under the new model.

## KEEP set (UI/online — stays on `runtimeProfile`)

`apps/web/src/App.tsx`, `LandingPage.tsx`, `BoardWorkspacesModule.tsx`,
`plugin-web-ai-chat/providerPolicy.ts`, `desktop-last-data-cache-polish/web.tsx`,
`MapView.tsx`, `xai-web-tasks`, `xai-web-habits`, `plugin-organizer`, the
`plugin-web-settings-rest` set, and the `runtime-profile` predicate + its test.
Full list: review §2b.

## Three-Faces / Boundary

- New resolver: **core** infra (pure predicate, zero business logic) — ADR-lite.
- Capability gating: stays in owning capability packages + host wiring.
- Dependency direction preserved: Host → Plugin → Core. New public surface from
  `@repo/core` only.

## Dependency Overview

- Downstream: `@repo/core` (Stable) only. No non-stable dependency; no mock.
- Upstream consumers: `AppProviders`, `plugin-web-storage`, 3–4 `desktop-*`
  capability packages.
- Surface touched under P1 carve-out (cite ADR-0011 §S5 in ship commit): `apps/web`,
  `plugin-web-storage` (P0 maintenance surface).

## Phased Plan (one phase per feature-build run)

- **P1** — core signal: add `resolveDesktopHost` / `isDesktopHost` /
  `DesktopHost` / `XAI_DESKTOP_HOST_TAURI` + barrel export + core tests.
- **P2** — switch MOVE-set capability modules to `isDesktopHost` (+ adapter AND
  where present) + update each package's tests; switch `AppProviders` host wiring
  and `plugin-web-storage` enable switch.
- **P3** — inject `VITE_XAI_DESKTOP_HOST=tauri` in `tauri.conf.json` build/dev
  commands; wiring + offline smoke; manual macOS verification.
