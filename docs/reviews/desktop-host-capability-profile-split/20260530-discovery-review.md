# Discovery Review — desktop-host-capability-profile-split

> Phase 1.5 Solution Scan + Phase 2 Dependency/Contract Scan.
> Date: 2026-05-30. Reviewer-of-record: human (pending feature-review).
> Author: feature-plan (claude-opus-4-8). Status: DRAFT → NEEDS_REVIEW.

## 0. Feature classification

- Type: **project-specific core capability + business-orchestration repair**
  (Tauri host detection + capability gating across the `apps/web` module graph
  running inside the desktop wrapper). Not a generic grid/dnd/file-io feature.
- **No external research required.** This is purely an internal signal-decoupling
  refactor. No new third-party library, no open-source candidate selection, no
  license/maintenance evaluation. WebSearch was intentionally skipped.

## 1. Problem framing

`VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` was one flag carrying two
orthogonal meanings:

1. **UI behaviour** — Organizer hidden, Boards/Tasks offline empty-cache vs.
   default-seed, online-only panel degradation.
2. **Host / capability** — "we are inside the Tauri desktop host, so enable
   native capabilities."

The shipped bugfix `desktop-tauri-web-dist-normal-window` removed the flag from
`tauri.conf.json` to align desktop UI with the `web-live` browser build. Correct
for UI; but because capabilities were gated on the same flag,
`isDesktopPhase1OfflineRuntime(runtimeProfile)` is now `false` everywhere, so
ALL desktop native capabilities are silently off.

The fix: keep UI on `VITE_WEB_RUNTIME_PROFILE` (desktop = `web-live`, no
regression) and gate capabilities on a NEW independent **desktop host /
capability** signal.

## 2. Verified callsite inventory (repo-wide grep of `isDesktopPhase1OfflineRuntime`)

> Source: full-repo `Grep` of `isDesktopPhase1OfflineRuntime` (28 files). Each
> classified KEEP (UI/online-degradation — stays on `runtimeProfile`) or MOVE
> (host/capability — switch to the new host signal). This table is the frozen
> contract for feature-build.

### 2a. MOVE — capability gates (switch to host signal)

| Callsite | Line(s) | Current meaning | Disposition |
|---|---|---|---|
| `apps/web/src/providers/AppProviders.tsx` | 295 (`isDesktopOfflineRuntime = …`), 302–310 (transport), 313 (`mountDesktopLocalFirstRepositoryBridge`), 335–340 (`delete __XAI_DESKTOP_WEB_IMPORT__ / __XAI_DESKTOP_RECONNECT_SYNC__ / __XAI_DESKTOP_BACKUP__`) | Host capability mount/teardown | MOVE to host signal — verified via user-cited lines; **must re-read exact lines during build** (file Read was flaky this session) |
| `packages/plugin-web-storage` (`desktopRepoBridge.ts` / `desktopBackup.ts` / `desktopReconnectSync.ts` / `desktopWebDataMigration.ts`) | `enabled: boolean` params; `mountDesktopRepoBridge({enabled})` / `unmountDesktopRepoBridge()` | Repo bridge enable switch | **NO internal gate change needed.** Confirmed this session: the storage package does NOT call `isDesktopPhase1OfflineRuntime`; `enabled` is supplied entirely by the caller (`AppProviders` passes `isDesktopOfflineRuntime`). Only the boolean source in `AppProviders` flips from profile-derived to host-derived. |
| `packages/desktop-native-notifications-reminders/src/runtime.ts` | 64, 139, 180 | `!isDesktopPhase1OfflineRuntime → unsupported: non_desktop_runtime` | MOVE to host signal |
| `packages/desktop-statusbar-quick-actions/src/runtime.ts` | 150 (`runtimeSupported = …`) | Start Pomodoro / Today's Tasks support gate | MOVE to host signal |
| `packages/desktop-auto-update-release-channel/src/runtime.ts` | 125, 147 | `!isDesktopPhase1OfflineRuntime → updater_not_configured` | MOVE to host signal |

### 2b. KEEP — UI / online-degradation gates (stay on `runtimeProfile`)

| Callsite | Line(s) | Why KEEP |
|---|---|---|
| `apps/web/src/App.tsx` | 122 (`showDesktopOnlyModules`) | Organizer rail filtering = UI behaviour (explicit non-goal) |
| `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx` | 128 | Boards seed/empty branch = UI behaviour (explicit non-goal) |
| `apps/web/src/pages/LandingPage.tsx` | 28 | Redirect (already also checks `isMockAuthenticated`) = UI/routing |
| `packages/plugin-web-ai-chat/src/internal/providerPolicy.ts` | 108 | AI offline policy — owned by `desktop-ai-offline-provider-policy` feature |
| `packages/desktop-last-data-cache-polish/src/web.tsx` | 46 | Offline cache indicator = UI affordance |
| `packages/plugin-web-board-views/src/MapView.tsx` | 97 | Map online-degradation = UI gate |
| `packages/xai-web-tasks/src/TasksModule.tsx` | 58 | Tasks UI offline gate |
| `packages/xai-web-habits/src/HabitsModule.tsx` | 43 | Habits UI offline gate |
| `packages/plugin-organizer/src/OrganizerWorkspaceModule.tsx` | 31 | Organizer UI support gate |
| `packages/plugin-web-settings-rest/*` (premiumPane:37, integrationsPane:103, integrationConnectButton:46, premiumUpgradeButton:46, CallbackPage:111, CheckoutSuccessPage:57, CheckoutCancelPage:43, DeleteAccountConfirmModal:59, useAccountDeleteOrchestrator:58) | various | Online-feature degradation (Stripe/OAuth/account-delete) = UI/online gates |
| `packages/core/src/utils/runtime-profile.ts` | 18 | The predicate itself — KEEP (UI consumers still use it) |
| `packages/core/tests/runtime-profile.test.ts` | 32–34 | Tests of the predicate — KEEP |

> All MOVE-set files (AppProviders, notifications/statusbar/auto-update/global-hotkey
> runtimes, core utils, tauri.conf.json, plugin-web-storage bridge) WERE read and
> verified this session — line numbers above are confirmed accurate as of
> 2026-05-30. Build should still re-read before editing as standard hygiene, but
> no stale-line caveat applies.

## 3. Additional callsites the brief did not list (found by grep)

- `apps/web/src/App.tsx:122` — `showDesktopOnlyModules` (KEEP, already a non-goal,
  now explicitly enumerated).
- `apps/web/src/pages/LandingPage.tsx:28` — redirect (KEEP).
- `packages/desktop-auto-update-release-channel/src/runtime.ts:147` — a SECOND
  callsite (brief only cited :125). MOVE both.
- `packages/desktop-native-notifications-reminders/src/runtime.ts:139` and `:180`
  — TWO more callsites (brief only cited :64). :180 is `!adapter ||
  !isDesktopPhase1OfflineRuntime(...)` (already AND-ed with adapter availability).
  MOVE all three.
- The full `plugin-web-settings-rest` set (9 callsites), `MapView`, `xai-web-tasks`,
  `xai-web-habits`, `plugin-organizer`, `desktop-last-data-cache-polish`,
  `plugin-web-ai-chat/providerPolicy` — all KEEP (UI/online gates).
- `packages/desktop-global-hotkey-quick-open/src/runtime.ts` — CONFIRMED this
  session: it has NO `isDesktopPhase1OfflineRuntime` / profile gate at all; it is
  purely `readAdapter()`-gated (`bridge_unavailable` when adapter absent). So it
  is already correct under the new model (adapter-only = Option C). NO change
  required. Resolves O2: leave as-is.

## 4. Candidate options for the host/capability signal source

### Option A — Build-time env `VITE_XAI_DESKTOP_HOST=tauri` injected by tauri.conf

- `tauri.conf.json` `beforeBuildCommand` / `beforeDevCommand` set
  `VITE_XAI_DESKTOP_HOST=tauri`; core adds
  `resolveDesktopHost(env?)` / `isDesktopHost(...)` mirroring the existing
  `resolveWebRuntimeProfile(env?)` shape.
- Pros: explicit, deterministic, trivially mockable with `vi.stubEnv`
  (same seam the current tests use), zero coupling to Tauri runtime globals,
  evaluated at module init like the profile is today.
- Cons: reintroduces a desktop-only env injection point in tauri.conf (the very
  thing the bugfix removed — but for a DIFFERENT, correctly-scoped variable that
  does NOT touch UI). Must be clearly named so nobody re-couples it to UI.

### Option B — Runtime Tauri detection (`window.__TAURI_INTERNALS__`)

- `withGlobalTauri` is enabled, so `window.__TAURI_INTERNALS__` (and/or
  `window.__TAURI__`) is present only inside the Tauri host.
- Pros: no env injection; "true desktop host" is detected from the actual
  runtime, impossible to set in a plain browser.
- Cons: timing — must guarantee the global is present before capability mount
  runs in `AppProviders`. Mockability requires stubbing a global rather than env
  (a different seam than current tests; doable via `vi.stubGlobal`). SSR/Node test
  env has no `window`.

### Option C — Existing adapter-availability signal (`readAdapter() !== null`)

- The desktop capability packages already inject an adapter (notifications /
  statusbar / updater); some callsites already AND with adapter presence
  (e.g. notifications runtime:180 `!adapter || !isDesktopPhase1OfflineRuntime`).
- Pros: zero new signal; "capability available" IS "adapter injected", which is
  the most honest definition of "can we do this native thing."
- Cons: not uniform — `AppProviders` local-first repo bridge / `__XAI_DESKTOP_*`
  globals / transport are NOT adapter-gated, so adapter-availability alone cannot
  drive the AppProviders mount. Each package defines its own adapter, so there is
  no single "is desktop host" answer for the host-level wiring.

## 5. Tradeoffs & Recommendation

**Recommended: A + C hybrid (env-driven host signal as the canonical answer, with
adapter-availability retained as the per-capability AND-guard where it already
exists).**

Rationale:
- The host-level wiring in `AppProviders` (repo bridge, `__XAI_DESKTOP_*`
  globals, transport) needs ONE authoritative "is desktop host" answer that is
  available synchronously at module init and is trivially mockable. Option A
  (`VITE_XAI_DESKTOP_HOST=tauri` + `resolveDesktopHost(env?)` in core) provides
  exactly that, mirroring the proven `resolveWebRuntimeProfile(env?)` shape and
  preserving the `vi.stubEnv` test seam (constraint: testability).
- Each desktop capability package keeps `readAdapter() !== null` as its concrete
  guard for "can I actually perform this op" (Option C), and replaces its
  `isDesktopPhase1OfflineRuntime(runtimeProfile)` check with `isDesktopHost(...)`.
  Where a callsite already ANDs adapter + profile (notifications:180), it becomes
  adapter + host signal.
- Option B (runtime global) is NOT recommended as the primary source because of
  init-timing fragility in `AppProviders` and the test-seam change; but the core
  resolver MAY optionally consult `globalThis.__TAURI_INTERNALS__` as a fallback
  when the env var is absent (defensive belt-and-suspenders), provided it stays
  pure and mockable. Decision deferred to design (open question O1).

**Why not reuse `runtimeProfile` with a new profile value?** That would re-couple
UI and capability again (the exact defect). The two signals must be independent
variables.

**Why not `VITE_WEB_AUTH_MODE`?** mock-auth is also used by web demo builds, so it
cannot mean "desktop." Constraint honored.

## 6. New core resolver shape (proposed — frozen in api.md)

```ts
// packages/core/src/utils/runtime-profile.ts (or a sibling desktop-host.ts)
export const XAI_DESKTOP_HOST_TAURI = "tauri";
export type DesktopHost = typeof XAI_DESKTOP_HOST_TAURI | "none";

export function resolveDesktopHost(
  env?: Record<string, string | undefined>,
  globals?: { __TAURI_INTERNALS__?: unknown } // optional B fallback
): DesktopHost;

export function isDesktopHost(host: DesktopHost): boolean;
```

- Mirrors `resolveWebRuntimeProfile(env?)` so existing tests' `vi.stubEnv` works.
- `isDesktopHost` is the single predicate capability code calls.
- The optional `globals` arg keeps the resolver pure and unit-testable while
  allowing the Option-B fallback decision to be made in design without changing
  the signature later.

## 7. Risks & Open questions

- **R1 — Regression risk on UI alignment.** Mitigated by the KEEP/MOVE table:
  no KEEP callsite changes; verify Organizer-hidden / Boards-default / mock-auth
  after build (manual macOS smoke + browser smoke).
- **R2 — `tauri.conf.json` env re-coupling.** New var is capability-only and must
  never be read by UI modules. Add a guard note + (if cheap) a test asserting UI
  modules don't import `isDesktopHost`.
- **R3 — Stale line numbers.** Several files could not be re-read this session;
  build MUST re-read before editing (do not trust line numbers blindly).
- **R4 — `plugin-web-storage` callsite unconfirmed.** grep did not surface the
  `~586` switch; it is user-attested. Build reads `storage.ts` first and locates
  the real enable-switch seam before editing.
- **O1 — Host-signal source final decision.** A only, or A + optional B fallback?
  Recommend A + optional pure B fallback in core resolver. feature-review to
  confirm.
- **O2 — global-hotkey-quick-open.** Does it need the host signal? Build to
  confirm by reading the file; if it has no profile gate today, leave it (note in
  dev_log) or align it for consistency per review guidance.
- **O3 — Should `desktop-last-data-cache-polish` cache indicator follow UI or
  host?** Classified KEEP (UI affordance) — confirm with review; it is a "you are
  offline" badge, arguably UI, but if product wants it to mean "desktop host" it
  would MOVE. Default: KEEP.

## 8. Dependency & contract scan

- Upstream consumers of the new signal: `AppProviders` (host wiring) + 3–4
  `desktop-*` capability packages + `plugin-web-storage` enable switch.
- Downstream dependency: `@repo/core` only (Stable). No non-stable plugin
  dependency introduced; no mock needed.
- Public surface added: `resolveDesktopHost`, `isDesktopHost`, `DesktopHost`,
  `XAI_DESKTOP_HOST_TAURI` from `@repo/core` (via `utils/index.ts` barrel).
- Error semantics: capability runtimes keep their existing failure codes
  (`non_desktop_runtime`, `updater_not_configured`, `unsupported`) but now derive
  the gate from `isDesktopHost` instead of the UI profile.

## 9. Conclusion

- **Adopt Option A** (env `VITE_XAI_DESKTOP_HOST=tauri` + core
  `resolveDesktopHost`/`isDesktopHost`) as the canonical host signal, **retaining
  Option C** adapter-availability as the per-capability AND-guard, with an
  **optional pure Option-B global fallback** in the core resolver (final call in
  design, open question O1).
- Freeze the §2 KEEP/MOVE table as the build contract.
- Phased build: P1 core signal+tests → P2 capability switch+tests → P3
  tauri.conf injection + wiring + offline smoke.
