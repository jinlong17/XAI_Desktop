# web-release-site-archive-vite-shell — API / Contract Notes

## Runtime API

This row plans the host boundary only. It does not add final runtime business APIs yet, but it freezes the host contract surfaces that later rows will implement.

## Upstream Interfaces

| Surface | Assumption |
|---|---|
| `docs/planning/sub-prds/web/PRD.md` | `apps/web` is a Vite SPA with `@repo/web` package naming and thin-host structure |
| `docs/planning/sub-prds/web/dev-plan.md` | Week 1 requires build/dev/lint/typecheck wiring plus `/app/*` guard-ready routing |
| `docs/adr/0006-web-face-hybrid-reuse-boundary.md` | Web-specific host shell is allowed; shared contracts remain mandatory |
| `docs/PLUGIN_MAP.md` | This feature owns the archive/new-host split for the Web roadmap |

## Downstream Interfaces

| Consumer | Contract this row must preserve |
|---|---|
| `web-auth-device-session` | mount points for auth providers and `/app/*` route guards |
| `web-browser-e2e-crypto-runtime` | browser-safe host bootstrap without Tauri-only imports |
| `web-console-host-router` | central router/service-provider shell with host injection seams |
| `web-security-csp-sentry` | service worker and security hook insertion points in the new host |
| `web-i18n-seo-landing` | separate landing/auth pages versus guarded app routes |

## Key Host Contract Assumptions

- `apps/web` exports the canonical browser host package via workspace name `@repo/web`.
- Route families are separated by intent:
  - public landing pages (`/`)
  - auth flows (`/auth/*`)
  - guarded product shell (`/app/*`)
- Providers are bootstrapped centrally, not inside page components.
- Service worker registration and browser host assembly happen at the top-level bootstrap seam.
- Archived `apps/release-site` content is reference-only and must not be treated as runtime source for `/app/*`.

## Workspace / Command Contract

| Surface | Frozen contract |
|---|---|
| `apps/web/package.json` | renamed to `@repo/web`; owns standard `dev`, `build`, and `check-types` scripts for the browser host |
| `apps/release-site/package.json` | renamed to `@repo/release-site-archive`; remains `private` and workspace-visible, but is reference-only |
| archive runtime scripts | no standard `dev`, `build`, or `start`; optional historical inspection scripts may exist only as `archive:dev` / `archive:build` |
| root `pnpm dev` / `turbo run dev` | run the canonical host `@repo/web`; must not pick the archive package back up as a product target |
| root `turbo run build` | builds `@repo/web` and other normal workspace packages; must not rely on archived Next output as product truth |
| `pnpm --filter @repo/web dev|build|check-types` | canonical commands for the browser host after the split |
| `pnpm --filter @repo/release-site-archive archive:dev` | manual reference-preview path only, never the default Web workflow |

## Guardrail Contract

- `apps/release-site/README.md` is required and functions as the human-facing guardrail.
- The README must explicitly state:
  - `apps/release-site` is archive/reference-only
  - `/console` inside the archive is a historical static mock
  - future browser product truth lives only in `@repo/web`
- review should reject the build if the archive keeps a normal product-facing `dev` or `build` script, because that would let root workflows treat the mock as live truth again.

## Error Semantics

- Planning failure mode: later rows implement against the wrong host path, wrong package name, or stale Next.js assumptions.
- Planning failure mode: root workspace commands accidentally keep exercising the archived Next app because script demotion or Turbo output updates were not completed.
- Review should reject this feature if the plan leaves either of these ambiguous:
  - whether `apps/web` or the archived site is the canonical product host
  - whether page components may carry business logic instead of thin-shell routing/provider concerns
  - whether the archive package still participates in primary root `dev` / `build` flows

## Permission / Idempotency Notes

- No browser permissions, OAuth config, service worker scope, or Supabase resources change in this planning row.
- Re-running this feature should only refine the archive boundary, script/task contract, and host-surface notes.
- The future Vite host must remain browser-safe and idempotent to bootstrap repeatedly in dev/build/test flows.
- The archive package must stay idempotently non-primary: repeated root commands should continue to ignore it unless a user explicitly filters it by the archive package name.
