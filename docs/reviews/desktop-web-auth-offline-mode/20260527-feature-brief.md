# Feature Brief — desktop-web-auth-offline-mode

| Field | Value |
|---|---|
| Feature | desktop-web-auth-offline-mode |
| Title | Phase 1 Desktop Offline `/app` Auth Session Policy |
| Date | 2026-05-27 |
| Source | ADR-0011 Phase 1 first wave; `docs/audit/2026-05-26-patch-roadmap-source.md` first-wave feature #2 |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Ensure the Phase 1 Tauri desktop build can open `/app` and enter the `apps/web` shell without network access or Supabase configuration.

## Naming Rationale

`desktop-web-auth-offline-mode` is already the canonical slug in ADR-0011 follow-up audit material and the patch roadmap source. The name is precise about the actual blocker:

- `desktop` — scope is the Phase 1 Tauri desktop host on `dev`.
- `web-auth` — the blocker is the reused `apps/web` auth/session entry path.
- `offline-mode` — the required outcome is offline `/app` entry without Supabase env or network.

## Scope

- Desktop build/runtime env policy for Tauri Phase 1:
  - `apps/desktop/package.json`
  - `apps/desktop/src-tauri/tauri.conf.json`
- Existing auth/session seams that may need minimal hardening only if desktop-side env wiring proves insufficient:
  - `apps/web/src/providers/AppProviders.tsx`
  - `packages/web-auth-device-session/src/session.tsx`
  - `packages/web-auth-device-session/src/guards.tsx`
- Verification artifacts for desktop bundle offline launch

## Non-goals

- No Phase 2 native work: notifications, status bar, global hotkeys, auto-update, full menu polish.
- No Phase 3 local-first persistence, SQLite, sync, or cloud-account architecture.
- No broad `apps/web` business-module rewrites.
- No weakening of browser live-auth behavior for normal Web deployments.
- No deletion or reactivation of legacy overlay/control/grid implementation.
- No external-runtime offline gating for AI, OSM, OAuth, Stripe, or Supabase RPC beyond documenting the follow-on dependency on `web-external-runtime-offline-gates`.

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log.
- The plan identifies the existing auth-mode plumbing and documents why Phase 1 should prefer desktop-side env/session policy over broader web-source changes.
- The selected option preserves future live Supabase/account sync as an online capability and does not redefine Web default auth semantics.
- Verification requirements prove that a Tauri desktop run or app bundle can reach `/app` offline without Supabase env, while separately recording residual online-only degradation.

## Deferred Validation

- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web-auth-device-session test`
- `pnpm --filter desktop tauri dev`
- `pnpm --filter desktop tauri build --debug --bundles app`
- Manual macOS offline launch of `/app` with no `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
