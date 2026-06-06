# design.md — xai-admin-dashboard-shell

> Decision snapshot ONLY (discovery detail lives in the review doc, not here).
> Surface: `apps/admin/` (new isolated Web-line app — NOT a `packages/plugin-*` slice).
> Slice #1 of the 6-row `xai-admin-dashboard-system-integration` manifest.

## Decision snapshot

| Field | Value |
|---|---|
| **Selected Option (deploy)** | Option A — separate `apps/admin/` Vite app + its own Cloudflare Pages project + own `public/_headers` CSP + dedicated subdomain |
| **Selected Option (UI stack)** | Option A — reuse `@repo/plugin-web-tokens` OKLCH tokens + `@repo/ui` patterns + structural prototype port; A′ headless `@tanstack/react-table` v8 allowed for dense tables (deferrable to review) |
| **Selected Option (mock)** | Typed Contract Mock — typed admin read-model interface per page, mock adapter ports prototype fixtures |
| **Selected Option (guard)** | `useWebAuthSession()` authenticated AND typed mock-backed admin-claim predicate; **fails closed** |
| **Review Doc Path** | `docs/reviews/xai-admin-dashboard-shell/20260606-discovery-review.md` |
| **Feature Brief Path** | `docs/reviews/xai-admin-dashboard-shell/20260606-feature-brief.md` |
| **Review Date / Version** | 2026-06-06 / v1 (discovery) |
| **Product module** | `admin` (#6) · operator-activated whole line 2026-06-06 · slice #1 only |
| **Branch convention** | `codex/admin/<feature>` |
| **D3 classification** | **W0 (web-only)** — no shared `@repo/*` seam modified; no `dev` promotion |
| **Cross-window contract impact** | NONE — no new `@repo/core/src/events` typed events; no Tauri command changes |

## ADR-lite records (no standalone ADR infra; recorded here per brief §ADR-lite landing)

- **ADR-lite #1 (deploy/CSP isolation)**: `apps/admin/` is a **sibling Cloudflare Pages target**
  governed by its **own** `apps/admin/wrangler.toml` (`pages_build_output_dir = "./dist"`) and
  `apps/admin/public/_headers`. It is a clean **extension of ADR-0008's mechanism**, not an amendment
  to ADR-0008's `apps/web` `_headers` content. The admin `_headers` carries a **tighter** CSP
  (`connect-src 'self'`, no provider/OAuth/Stripe/OSM origins). ADR-0008 §S6 binding-precedent
  extension protocol (amend record → extend `_headers` → update snippet → write csp guard test)
  **applies to the admin `_headers` too**. A cross-reference note is added to ADR-0008 §S7 (or a short
  ADR-0008 amendment) during build phase. CSP guard test cloned at `apps/admin/src/__tests__/csp.test.ts`.
- **ADR-lite #2 (UI stack)**: reuse the existing OKLCH-token design system; **reject** importing
  Tailwind as the admin styling base and **reject** `@tremor/react` as a runtime dependency (Vercel
  acquisition → copy-paste pivot → legacy dep path). Headless `@tanstack/react-table` v8 (pinned) is
  an allowed targeted addition for dense Users/Orgs/Audit tables; hand-built fallback recorded.

## Frozen assumptions (lock at plan acceptance — change requires Revise or a follow-up row)

1. **Build target** = new `apps/admin/` Vite app (own `package.json`, `vite.config.ts`, `tsconfig.json`,
   `wrangler.toml`, `public/_headers`, env). NOT mounted into the `apps/web` module rail.
2. **Deploy** = separate Cloudflare Pages project (mechanism cloned from ADR-0008 Pages target), own
   `_headers`-delivered CSP, dedicated subdomain. Slice #1 ships at `*.pages.dev`; custom domain/DNS = row #6.
3. **Auth posture** = `mock-authenticated` parity with ADR-0008 D2 for slice #1 (no admin secrets in build).
   If real Supabase device-session auth is wired, the Supabase host is added to admin `_headers connect-src`
   per the extension precedent (the only candidate `connect-src` addition this slice).
4. **Shared seam** = read-only `@repo/web-auth-device-session` (`useWebAuthSession()`); the package is
   **NOT modified** this slice. Admin-claim is a **mock predicate** in `apps/admin/`.
5. **UI** = reuse `@repo/plugin-web-tokens` + `@repo/ui`; structural (not pixel-perfect) port of the
   prototype's 10 pages; OKLCH token model retained.
6. **Mock strategy** = Typed Contract Mock; pages read ONLY through typed read-model interfaces; no inline
   mock globals. Destructive flows render type-to-confirm UI wired to no-op mock command adapters.
7. **No production writes**, **no service-role/provider secret in the browser bundle** (asserted by a
   bundle/source-text guard test). Guard **fails closed**.
8. **Scope** = the 10 pages + shell + guard + adapters + tests ONLY. RBAC enforcement, real audit, real
   billing, real provider config, real admin-claim source, server secret backend = rows #2–#6. NO Tweaks
   visual-design panel (design-review-only per INTEGRATION_PLAN §1).
9. **D3 = W0** web-only; no `dev` promotion; no new typed events; no Tauri changes.

## Dependency overview

| Direction | Dependency | State | Mode this slice |
|---|---|---|---|
| Upstream (consumes) | `@repo/web-auth-device-session` | Stable | Direct, read-only session |
| Upstream (consumes) | `@repo/plugin-web-tokens` / `@repo/ui` | Stable | Direct, design system |
| Upstream (optional) | `@tanstack/react-table` (v8 pinned, headless) | external, React-19 compat | Allowed for dense tables; hand-built fallback |
| Concept-only (mocked) | `@repo/plugin-web-ai-chat` (provider/secret) | Stable | NOT imported; concept mocked |
| Concept-only (mocked) | `@repo/plugin-web-settings-rest` (billing) | Stable | NOT imported; concept mocked |
| Precedent-only | `audit-log-integrity` (hash chain) | Shipped | NOT wired; precedent for row #5 |
| Design authority | prototype `docs/prototypes/admin-dashboard/` | n/a | Fixtures + IA ported into typed adapters |

## Directory shape (planned)

```
apps/admin/
  package.json            # @repo/admin (private), own deps
  tsconfig.json
  vite.config.ts          # own entry; nonce-strip plugin cloned from apps/web if needed
  vitest.config.ts
  wrangler.toml           # pages_build_output_dir = "./dist", separate project
  index.html
  public/_headers         # own tight CSP
  src/
    main.tsx              # admin app entry (NOT apps/web/main.tsx)
    App.tsx               # router + AdminRouteGate
    auth/
      adminClaim.ts       # typed admin-claim predicate (interface + mock impl) — fails closed
      AdminRouteGate.tsx  # composes useWebAuthSession() + adminClaim
    pages/                # 10 page components (structural port)
    adapters/             # typed read-model interfaces + mock adapters (one per page)
    fixtures/             # typed fixtures ported from prototype inline consts
    __tests__/            # adapter tests, predicate tests, guard tests, csp guard, no-secret guard
  docs/                   # design.md / api.md / test.md / dev_log.md (this set)
```
