# Feature Brief — desktop-host-capability-profile-split

> Step 0 artifact. Date: 2026-05-30. Author: feature-plan (claude-opus-4-8).
> Workflow: FEATURE_DEV. This is a P1 desktop infrastructure repair following the
> ship of `desktop-tauri-web-dist-normal-window` (commits 2bf1f64d / f9470967 /
> 8cbb0633 / 2c471182, on `origin/dev`).

## 1. Feature Title

Desktop Host / Capability Signal Split — decouple "UI behaviour profile" from
"is-desktop-host / native-capability" decisions.

## 2. Canonical Name & Rationale

- Canonical `<feature_name>`: **`desktop-host-capability-profile-split`** (as suggested).
- No conflict: no existing `packages/desktop-host-capability-profile-split/` or
  `docs/reviews/desktop-host-capability-profile-split/` directory exists.
- Rationale: the defect is a *single conflated signal*
  (`VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`) carrying two orthogonal
  semantics. The feature *splits* that into (a) a **UI behaviour profile**
  (unchanged) and (b) a **desktop host / capability signal** (new). The name
  states the surface (desktop host), the action (split), and the object (the
  profile signal).

## 3. Motivation

The shipped UI-alignment bugfix removed `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
from `tauri.conf.json` `beforeBuildCommand` / `beforeDevCommand` so the desktop
wrapper now runs the same browser-aligned `web-live` UI as the `dev` branch
`apps/web` (Organizer hidden, Boards seeds a default board, mock-auth still
auto-enters `/app`). That UI fix is correct and must NOT regress.

But removing the flag flipped every `isDesktopPhase1OfflineRuntime(runtimeProfile)`
check to `false`, silently disabling **all desktop native capabilities** because
those capabilities were (incorrectly) gated on the *UI* profile. One flag was
doing two unrelated jobs:

1. **UI behaviour** — Organizer filtering, Boards/Tasks offline empty-cache vs.
   default-seed behaviour.
2. **Host / capability** — whether we are running inside the Tauri desktop host
   and may turn on native capabilities (local-first repo bridge, web data import,
   reconnect sync, backup/export-import, native notifications, status-bar quick
   actions, auto-update).

These are orthogonal and must be driven by independent signals.

## 4. Target Outcome

- **UI behaviour** continues to read `VITE_WEB_RUNTIME_PROFILE`. Desktop stays on
  `web-live`, so UI stays aligned with the web build (no regression).
- **Desktop native capabilities** read a NEW, independent "desktop host /
  capability" signal — not the UI profile, and not the auth mode.
- `VITE_WEB_AUTH_MODE=mock-authenticated` keeps its single job ("enter `/app`
  without login") and is never used to infer "desktop".

## 5. Scope

In scope:
- `packages/core/src/utils/runtime-profile.ts` (+ `index.ts` barrel) — add the new
  host/capability resolver(s).
- `apps/desktop/src-tauri/tauri.conf.json` — inject the host signal (build/dev env)
  IF the chosen design needs a build-time env (see open question O1).
- `apps/web/src/providers/AppProviders.tsx` — capability mount logic
  (local-first repo bridge, `__XAI_DESKTOP_*` globals, transport) switches to the
  host signal.
- `packages/plugin-web-storage/src/internal/storage.ts` — the
  `setDesktopWebImportRuntimeEnabled / ReconnectSync / Backup` enable switches +
  `unmountDesktopRepoBridge()`.
- `packages/desktop-native-notifications-reminders/src/runtime.ts`
- `packages/desktop-statusbar-quick-actions/src/runtime.ts`
- `packages/desktop-auto-update-release-channel/src/runtime.ts`
- `packages/desktop-global-hotkey-quick-open/src/runtime.ts` (confirm whether it
  shares the same gate — see Discovery §Additional callsites).
- All related tests (Vitest), including the existing `vi.stubEnv`-based suites.

Explicitly NOT in scope (must keep reading `runtimeProfile` for UI semantics):
- `apps/web/src/App.tsx` organizer rail filtering (`showDesktopOnlyModules`).
- `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx` boards
  branch.
- `apps/web/src/pages/LandingPage.tsx` redirect logic (mock-auth/UI redirect).
- `packages/plugin-web-ai-chat/src/internal/providerPolicy.ts` AI offline policy
  (its own feature, governed by `desktop-ai-offline-provider-policy`).
- `packages/desktop-last-data-cache-polish/` cache indicator (UI affordance).
- `packages/plugin-web-board-views/src/MapView.tsx`, `xai-web-tasks`,
  `xai-web-habits`, the `plugin-web-settings-rest` offline gates — these are UI /
  online-degradation gates and stay on the UI profile.

> The discovery review classifies EACH of the 28 callsites as "UI" (keep on
> profile) or "capability" (move to host signal). That classification is the
> contract for build.

## 6. Constraints

- MUST NOT regress the shipped UI alignment: desktop keeps Organizer hidden,
  Boards seeds a default board, mock-auth auto-enters `/app`.
- MUST NOT reintroduce `desktop-phase1-offline` as a UI profile.
- MUST keep testability: capabilities must be switchable in unit tests (current
  suites use `vi.stubEnv` to set the profile; the host signal must have an
  equally mockable seam).
- MUST obey `docs/SYSTEM_ARCHITECTURE.md` §4 编码红线: Host→Plugin→Core dependency
  direction, `index.ts`-only public surface, no cross-plugin direct imports, the
  new resolver lives in `@repo/core` (infra, zero business logic).
- Phased plan: each phase independently `build`-able + `test`-able. Suggested
  order: (P1) core signal + resolver + tests → (P2) capability modules switch to
  the signal + their tests → (P3) `tauri.conf.json` injection / wiring + offline
  smoke.
- P1 carve-out: this touches `apps/web` (P0 maintenance-only surface). It is a
  desktop-host repair, justified under ADR-0011 §S5 (short-term cross-surface
  coupling: desktop reuses `apps/web`). Record the carve-out rationale in the
  ship commit body.

## 7. Three-Faces Decision

- New resolver: **core** (`@repo/core` infra — pure predicate, zero business
  logic). Justified ADR-lite (host-signal resolver is infrastructure, same class
  as the existing `resolveWebRuntimeProfile`).
- Capability gating: stays in the owning **plugin/capability packages**
  (`desktop-*`, `plugin-web-storage`) and the **host wiring** (`AppProviders`,
  `tauri.conf.json`).
- No new business logic enters `apps/desktop/src/` or `packages/core/`.

## 8. Target package status

- `@repo/core` — Stable (infra extension; additive).
- `desktop-native-notifications-reminders`, `desktop-statusbar-quick-actions`,
  `desktop-auto-update-release-channel`, `desktop-global-hotkey-quick-open` — P1
  desktop capability packages (workflow anchors; confirm PLUGIN_MAP rows during
  build).
- `apps/web`, `plugin-web-storage` — P0 maintenance surface touched under P1
  carve-out.

## 9. Cross-window / contract impact

- No new `@repo/core/events` typed events expected.
- No Tauri command signature changes expected.
- New core exports: a host/capability resolver + predicate (see api.md).
- `tauri.conf.json` env injection is a build-config change, not a runtime
  contract.

## 10. Mock strategy

- Tests mock the host signal the same way they mock the profile today. If the
  design uses build-time env, expose a resolver that takes an injectable
  `env`/`globalThis` argument (mirroring `resolveWebRuntimeProfile(env?)`) so
  `vi.stubEnv` / a stubbed global keeps working.

## Planner Handoff

Proceed to Phase 1.5 discovery (host-signal source selection) → freeze the
per-callsite UI-vs-capability classification → write design/api/test/dev_log →
hand to feature-review.
