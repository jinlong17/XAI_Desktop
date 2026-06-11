# api.md — desktop-host-capability-profile-split

> Interface contract. Frozen assumptions: see design.md.

## 1. New `@repo/core` public surface

Added to `packages/core/src/utils/runtime-profile.ts` (or sibling
`desktop-host.ts`) and re-exported via `packages/core/src/utils/index.ts`.

```ts
export const XAI_DESKTOP_HOST_TAURI = "tauri";
export const XAI_DESKTOP_HOST_NONE = "none";

export type DesktopHost =
  | typeof XAI_DESKTOP_HOST_TAURI
  | typeof XAI_DESKTOP_HOST_NONE;

/**
 * Resolve the desktop host / native-capability signal.
 * Primary source: env VITE_XAI_DESKTOP_HOST (Option A).
 * Optional fallback (Option B, review-approved): globals.__TAURI_INTERNALS__.
 * MUST be pure + dependency-injectable for vi.stubEnv / stubbed-global tests.
 */
export function resolveDesktopHost(
  env?: Record<string, string | undefined>,
  globals?: { __TAURI_INTERNALS__?: unknown }
): DesktopHost;

/** Single predicate all capability code calls. */
export function isDesktopHost(host: DesktopHost): boolean;
```

### Contract

- `resolveDesktopHost(env)` returns `"tauri"` iff
  `env.VITE_XAI_DESKTOP_HOST === "tauri"` (and, if O1 approves the fallback,
  also when `globals.__TAURI_INTERNALS__` is present); otherwise `"none"`.
- `isDesktopHost(host)` returns `host === "tauri"`.
- Defaults: with no env and no Tauri global → `"none"` (browser/web build).
- Idempotent, no side effects, no throw.

## 2. Unchanged existing surface (KEEP)

`resolveWebRuntimeProfile(env?)`, `isDesktopPhase1OfflineRuntime(profile)`,
`WebRuntimeProfile`, `WEB_RUNTIME_PROFILE_*` remain exported and continue to
drive UI behaviour. NOT removed, NOT renamed.

## 3. Capability-module contract changes (MOVE set)

Each capability runtime replaces:

```ts
// BEFORE
if (!isDesktopPhase1OfflineRuntime(runtimeProfile)) return unsupported(...);
// AFTER
if (!isDesktopHost(host)) return unsupported(...);
```

- `desktop-native-notifications-reminders`: :64/:139/:180 →
  `isDesktopHost`. Existing `non_desktop_runtime` / `unsupported` error codes
  UNCHANGED. :180's `!adapter || …` keeps the adapter AND-guard
  (`!adapter || !isDesktopHost(host)`).
- `desktop-statusbar-quick-actions`: :150 `runtimeSupported = isDesktopHost(host)`
  (+ retain any adapter guard). Start Pomodoro / Today's Tasks support follows.
- `desktop-auto-update-release-channel`: :125/:147 → `isDesktopHost`.
  `updater_not_configured` code UNCHANGED.

How `host` reaches each module: same channel `runtimeProfile` arrives by today
(prop/arg/env-resolved-at-init). Build determines per-module whether to pass a
resolved `host`, or resolve internally via `resolveDesktopHost(import.meta.env)`.
Preserve injectability for tests.

## 4. Host wiring contract (`AppProviders` + `plugin-web-storage`)

- `AppProviders`: `isDesktopOfflineRuntime` (currently
  `isDesktopPhase1OfflineRuntime(runtimeProfile)`, line ~295) → a host-derived
  boolean (e.g. `isDesktopHost(resolveDesktopHost(import.meta.env))`). This
  boolean then drives:
  - `mountDesktopLocalFirstRepositoryBridge(...)` (~313)
  - transport selection (~302–310)
  - `__XAI_DESKTOP_WEB_IMPORT__ / __XAI_DESKTOP_RECONNECT_SYNC__ /
    __XAI_DESKTOP_BACKUP__` set-vs-delete (~335–340)
  - `setDesktopWebImportRuntimeEnabled / ReconnectSync / Backup` calls into
    `plugin-web-storage`.
- `plugin-web-storage` bridge (`desktopRepoBridge.ts` etc.): NO change. Confirmed
  `mountDesktopRepoBridge({ enabled })` / `unmountDesktopRepoBridge()` take a
  caller-supplied `enabled` boolean and never call `isDesktopPhase1OfflineRuntime`.
  Only the boolean `AppProviders` passes flips from profile-derived to
  host-derived.
- `desktop-global-hotkey-quick-open`: NO change. Already adapter-only (no profile
  gate today).

## 5. Build-config contract (`tauri.conf.json`)

`beforeBuildCommand` / `beforeDevCommand` gain `VITE_XAI_DESKTOP_HOST=tauri`.
This is the ONLY place the desktop host env is set. It MUST NOT reintroduce
`VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`. Build-config change, not a
runtime contract.

## 6. Events / commands

- No new `@repo/core/events` typed events.
- No Tauri command signature changes.

## 7. Permission / idempotency

- Resolver is pure + idempotent. Capability runtimes keep existing permission /
  error semantics; only the gate source changes (UI profile → host signal).
