# Patch Roadmap Source - P1 Desktop Redefinition

Date: 2026-05-26  
Source report: `docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`  
Intended consumer: `/xai-roadmap-loop mode:init` or manual milestone planning  
Branch map: A=desktop (`dev`), B=web (`web`)

## Dispatch Rules

- Do not dispatch P1-Phase2 or P1-Phase3 features until the user accepts ADR-0011 direction.
- P1-Phase1 blockers are eligible for immediate planning on `dev`.
- WEB-B rows are safe for the `web` branch in parallel, provided they do not change shared contracts without a sync note.
- Shared contract files include `packages/core`, `packages/ui`, `packages/xai-web-shell`, auth/session guard packages, storage registry, and module registration surfaces.

## Candidate Features

| feature slug | scope | effort | dependencies | phase tag | branch |
|---|---|---|---|---|---|
| `desktop-tauri-web-dist-normal-window` | Convert `apps/desktop` from old transparent overlay/grid/control scaffold into a normal Tauri app window that loads `apps/web` static assets. Remove click-through, skip-taskbar, control/grid startup, and overlay window configuration. | M | Existing `apps/web` build output; current `apps/desktop` scaffold audit. | P1-Phase1 必须 | A=desktop (`dev`) |
| `desktop-web-auth-offline-mode` | Define desktop auth/session policy so `/app` opens offline. Use `VITE_WEB_AUTH_MODE=mock-authenticated` for Phase 1 or implement a desktop-local session provider that satisfies current route guards. | M | `AppProviders`, `web-auth-device-session` guards, desktop build env. | P1-Phase1 必须 | A=desktop (`dev`) |
| `web-external-runtime-offline-gates` | Add or verify desktop/offline capability gates for AI live fetch, OSM map tiles, OAuth redirects, Stripe payment links, Supabase device RPC, and account-delete Edge Function paths. | M | Desktop auth mode; a runtime `desktop/offline` capability flag or equivalent. | P1-Phase1 必须 | A=desktop (`dev`), coordinate B |
| `desktop-phase1-build-packaging-pipeline` | Wire build so Tauri packages `apps/web` dist, validates offline launch, and generates a `.dmg` artifact. Include a smoke command that runs without network access. | M | Normal window conversion; desktop auth/offline mode. | P1-Phase1 必须 | A=desktop (`dev`) |
| `desktop-basic-macos-menu-config-store` | Add basic File/Edit/View/Window/Help menu and persist app configuration locally. Keep tray/status bar actions out of Phase 1 unless already cheap. | M | Normal app window; selected Tauri store/file strategy. | P1-Phase1 必须 | A=desktop (`dev`) |
| `web-pwa-sw-asset-cache` | Add real service-worker asset caching for pure Web/PWA offline fallback. This is not required for Tauri static bundle launch, but closes the Web offline story. | S/M | Web build manifest or Vite PWA strategy. | WEB-B 可并行 | B=web (`web`) |
| `web-csp-stripe-doc-drift-cleanup` | Reconcile `apps/web/deploy/README.md` Stripe/CSP wording with actual `_headers` and CSP tests. Keep redirect-only payment behavior explicit. | S | No code dependency; verify CSP tests. | WEB-B 可并行 | B=web (`web`) |
| `web-board-map-stale-location-backfill` | Add optional migration/backfill for stale `xai_boards_v2` demo boards that predate location pins, or document cache clear behavior. | S | Board storage schema and seed data. | WEB-B 可并行 | B=web (`web`) |
| `web-cross-vendor-provider-smoke-evidence` | Record Safari/Firefox/iOS and external-provider smoke evidence, including Cloudflare Pages URL once live deploy secrets/DNS are available. | M | Cloudflare deploy access, provider test accounts or stubs. | WEB-B 可并行 | B=web (`web`) |
| `desktop-notification-statusbar-hotkeys-autoupdate` | Plan and implement the first Phase 2 native experience slice: notifications, status bar quick actions, global hotkey, and auto-update path. | L | Phase 1 package/install smoke. | P1-Phase2 | A=desktop (`dev`) |
| `desktop-local-first-storage-adr` | Draft the Phase 3 ADR choosing SQLite vs IndexedDB vs JSON and defining local-first sync boundaries, migration, and conflict strategy. | M | Phase 1/2 evidence; accepted ADR-0011. | P1-Phase3 | A=desktop (`dev`) |
| `desktop-local-first-repository-bridge` | Implement the local-first repository bridge for tasks, board, habits, pomodoro, notes, pet basic state, and local settings. | L | Accepted storage ADR; schema and sync log design. | P1-Phase3 | A=desktop (`dev`) |

## Recommended First Wave

1. `desktop-tauri-web-dist-normal-window`
2. `desktop-web-auth-offline-mode`
3. `desktop-phase1-build-packaging-pipeline`
4. `web-external-runtime-offline-gates`

Exit gate for the first wave: a `.dmg` or local Tauri build that launches the full Web shell from bundled static assets, enters `/app` without network, and shows clear offline degradation for online-only panels.

