# Feature Brief — web-external-runtime-offline-gates

| Field | Value |
|---|---|
| Feature | web-external-runtime-offline-gates |
| Title | Phase 1 Desktop Offline Gates for Online-only Web Runtime Surfaces |
| Date | 2026-05-27 |
| Source | Explicit parent-session requirement; ADR-0011 Phase 1 first wave; `docs/audit/2026-05-26-patch-roadmap-source.md` first-wave feature #4 |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Ensure the Phase 1 Tauri desktop/offline app degrades cleanly for online-only Web/runtime surfaces without blocking UI launch.

Target surfaces:

- AI live fetch
- OSM map tiles
- OAuth redirects
- Stripe payment links
- Supabase device RPC and account-delete paths

Expected behavior:

- launching the desktop app must not require those services
- desktop/offline mode should show disabled states, fallback copy, or explicit “联网后可用” style messaging where appropriate

## Naming Rationale

The parent session already provided the canonical slug `web-external-runtime-offline-gates`, and it matches the actual work:

- `web` — the active UI source is still `apps/web` plus `plugin-web-*`
- `external-runtime` — the affected surfaces depend on external origins or live backend runtime
- `offline-gates` — the change is primarily capability gating and degradation, not a feature redesign

## Scope

- Define the smallest explicit Phase 1 desktop runtime/capability signal for `apps/web`
- Keep browser/live Web behavior unchanged when the desktop signal is absent
- Gate or degrade these surfaces only:
  - `packages/plugin-web-ai-chat`
  - `packages/plugin-web-board-views`
  - `packages/plugin-web-settings-rest`
  - `packages/web-auth-device-session`
  - `apps/web/src/providers/AppProviders.tsx` only where runtime plumbing is needed
- Cover both entry actions and direct callback routes where current Web stubs can mutate local prefs:
  - OAuth callback page
  - Stripe checkout success/cancel pages

## Non-goals

- No Phase 2 native features: notifications, status bar, global hotkeys, auto-update, full menu polish
- No Phase 3 local-first sync/account architecture, SQLite, or multi-device sync implementation
- No redesign of Web modules or Settings IA
- No deletion or reactivation of legacy overlay/control/grid implementation
- No broad auth-provider rewrite beyond reusing the shipped desktop mock-auth precedent
- No new external provider integrations or token-exchange implementation

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log
- The plan identifies one explicit Phase 1 desktop runtime-profile gate instead of scattering unrelated env toggles across modules
- Browser/Web live behavior remains the default when the desktop gate is absent
- AI, maps, OAuth, Stripe, and Supabase-backed account flows each have an exact degradation boundary documented
- Verification coverage includes automated regression checks plus manual real-macOS offline residual risk

## Deferred Validation

- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/plugin-web-ai-chat test`
- `pnpm --filter @repo/plugin-web-board-views test`
- `pnpm --filter @repo/plugin-web-settings-rest test`
- `pnpm --filter @repo/web-auth-device-session test`
- `pnpm --filter desktop tauri build --debug --bundles app`
- Manual macOS network-disabled launch of the desktop bundle, including direct route smoke for gated callback pages
