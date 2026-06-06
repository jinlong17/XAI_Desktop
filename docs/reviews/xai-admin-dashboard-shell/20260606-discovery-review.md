# Discovery Review — xai-admin-dashboard-shell

> Workflow V2 · `feature-plan` discovery pass · Slice #1 of `xai-admin-dashboard-system-integration` (6-row manifest).
> Date: 2026-06-06 · Executor: claude-opus-4-8 · Status: **NEEDS_REVIEW** (awaiting `feature-review`)
> Authoritative input: `docs/reviews/xai-admin-dashboard-shell/20260606-feature-brief.md` (READY_FOR_FEATURE_PLAN)
> Module: `admin` (#6) · Branch convention: `codex/admin/<feature>` · D3 classification: **W0 (web-only)**

---

## 0. Canonical naming

- **Feature Title**: Admin Dashboard Shell (isolated admin surface + permission boundary)
- **Canonical slug**: `xai-admin-dashboard-shell` (already provided + matches roadmap row #1; no derivation needed)
- **Doc landing rationale**: `admin` is a **new Web-line app surface (`apps/admin/`)**, NOT a `packages/plugin-*` slice, so the plugin-docs path (`packages/plugin-<name>/docs/`) does not apply. The Documentation Contract four-piece set lands at **`apps/admin/docs/`** (the new app owns its own docs, mirroring how `apps/web/` packages own theirs). Review artifacts stay under `docs/reviews/xai-admin-dashboard-shell/`.
- The brief is already at the canonical review path — **no `_intake/` migration required**.

---

## 1. Problem framing

The Admin Console exists only as a high-fidelity single-file vanilla-JS prototype
(`docs/prototypes/admin-dashboard/index.html`: hand-written OKLCH CSS tokens, inline SVG
charts, inline `const` fixture arrays, local UI state). There is **no real surface, no
isolation, no permission boundary**. The operator activated the entire `admin` line on
2026-06-06 (it was ADR-0013 §D1 PROPOSED / owner-deferred). This slice (#1 only) must turn
the prototype into a **production-shaped isolated admin surface that proves the shell + the
permission boundary** — with **no real admin power**, **no production writes**, and
**no privileged credentials in the browser**.

It de-risks the whole admin line by establishing the surface boundary first. The manifest's
hard dependency order is preserved: RBAC/data contracts (row #2) before any mutation;
read-heavy before write-heavy; audit-append covered by tests before mutation flows. Rows
#2–#6 each get their own `feature-plan` when their wave starts.

This is **not** a research-heavy feature on the *product* side — the design authority already
exists (prototype + INTEGRATION_PLAN + reference console). The two genuine unknowns requiring
research are the **two ADR-lite topics** the brief escalated: (1) deploy/CSP isolation
mechanism and (2) admin UI/tech stack. Those are addressed below with web evidence.

---

## 2. ADR-lite Topic 1 — Admin surface build & deploy isolation

### Requirement (non-negotiable)
- "Independent CSP / env / deploy" boundary separate from `apps/web`.
- The built admin browser bundle **must contain no service-role token or provider secret**.
- Admin code/secrets must **not be reachable from the `apps/web` user bundle** (no shared module rail).
- Must compose with the existing Cloudflare governance: **ADR-0008** (Pages target + `_headers`-delivered CSP + nonce-strip), which this slice extends.

### Candidate options

| # | Option | Pros | Cons |
|---|--------|------|------|
| **A** (selected) | **Separate Cloudflare Pages project + dedicated subdomain** (`apps/admin/` own `wrangler.toml` → `pages_build_output_dir = "./dist"`, own `public/_headers`, own env; deploys to `admin.<domain>` / its own `*.pages.dev`) | Hard physical isolation: separate build output, separate project, separate origin → admin code can never tree-shake into the `apps/web` bundle (different Vite entry, different `dist/`). Own `_headers` = own CSP, decoupled from the web console's. Maps 1:1 onto the SHIPPED ADR-0008 Pages mechanism (proven, one-liner config). Own origin = browser-level same-origin isolation between admin and user surfaces. Independently unpublishable for rollback. | Second Cloudflare Pages project to provision + 2 more GitHub Secrets (admin token/account) OR reuse account-id; a future `/api` worker would be a separate concern (same as web). Custom domain/DNS is a later row (#6) — slice #1 can ship at `*.pages.dev`. |
| B | **Reused infra, separate config under one project** (path-mounted `/admin` or branch-scoped, sharing `apps/web` Pages project with separate `_headers` rules) | Fewer projects/secrets. | WEAK isolation: shares an origin and (likely) a build pipeline with `apps/web`; risk of admin chunks leaking into the user bundle or CSP cross-contamination. Directly contradicts brief AC-3/AC-5 ("not mounted in the apps/web module rail", "no secret in the user bundle"). Rejected. |
| C | **Edge-auth front (Cloudflare Access / Worker gate) in front of a shared build** | Strong network gate. | Adds a Worker/Access dependency this slice was designed to avoid; couples deploy to an edge runtime; the admin-claim guard is in-app this slice (mock-backed), so edge auth is premature. Good candidate for row #6 hardening, not slice #1. |

### Recommendation: **Option A** — separate `apps/admin/` Vite app + its own Cloudflare Pages project + own `public/_headers` CSP, deployed to a dedicated subdomain.

**ADR-0008 relationship (ADR-lite, recorded in `design.md` decision snapshot):** Option A is a
**clean extension of ADR-0008's mechanism, not an amendment to its `_headers` content.** ADR-0008
governs the `apps/web` Pages project + its CSP allowlist. The admin surface gets its **own**
`wrangler.toml` + `public/_headers` (peer to `apps/admin/vite.config.ts`), structurally cloning
ADR-0008's shape but with a **tighter** allowlist (admin needs no Anthropic/OpenAI/Groq/OSM/Stripe/
OAuth origins this slice — those are user-surface concerns). Because this introduces a *new build/deploy
target* with an *independent CSP*, it is recorded as an **ADR-lite decision in `apps/admin/docs/design.md`**
and a short ADR-0008 cross-reference note ("admin surface is a sibling Pages target governed by its own
`_headers`; ADR-0008 §S6 binding-precedent extension protocol applies to the admin `_headers` too").
The CSP source-text guard test pattern (`apps/web/src/__tests__/csp.test.ts`) is replicated at
`apps/admin/src/__tests__/csp.test.ts`.

**Admin `_headers` proposed CSP (slice #1, fail-tight default):**
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self' <supabase-session-host-if-real-auth>; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```
> `connect-src` stays `'self'` for the mock-backed slice; the real Supabase session host (if real device-session auth is wired vs `mock-authenticated`) is the only candidate addition, recorded as the ADR-0008-style extension precedent for the admin `_headers`. NO provider/service-role origins — those arrive in rows #2/#4 and MUST follow the binding-precedent extension protocol.

---

## 3. ADR-lite Topic 2 — Admin UI / component & tech stack

### Requirement
First admin code sets the pattern for **all** later admin pages (rows #2–#6). Must serve
dense tables, filter chips, drawers, RBAC/model matrices, KPI cards, and SVG-ish charts, while
preserving the prototype's information architecture and the type-to-confirm destructive UI.

### Candidate options + web evidence (queries run 2026-06)

| # | Option | Web-verified status | Architecture fit |
|---|--------|---------------------|------------------|
| **A** (selected) | **Reuse `@repo/plugin-web-tokens` + `@repo/ui` design-system patterns + structural port of the prototype** (OKLCH token model + hand-built table/drawer/matrix components, the same approach the prototype already proves) | No new external dep; the monorepo already standardizes on OKLCH CSS-variable tokens + zero state libraries (verified in `apps/web/package.json` — no Tailwind, no Tremor, no table lib). The prototype itself is the existence proof that all 10 pages render with this approach. | BEST fit: zero new dependency surface (critical for the "no secret/minimal bundle" guard), zero CSS-framework conflict, consistent with existing Web-line design system, lowest review/rework risk. |
| B | **Adopt prototype README recommendation: shadcn/ui + TanStack Table + Tremor** | shadcn/ui: React 19 + Vite + Tailwind v4 fully supported, actively maintained, copy-paste (you own the code). TanStack Table v8: React-19 compatible + headless, but v8 (`8.21.3`) has not published in ~1 year (v9 in beta) — stable-but-stale. **Tremor: acquired by Vercel; pivoted to copy-paste "Blocks"; the dependency-style `@tremor/react` is effectively legacy and pulls in Tailwind + Recharts.** | POOR full fit for slice #1: introduces **Tailwind** (the monorepo's design system is OKLCH-token based, NOT Tailwind) → a CSS-framework fork inside the repo; Tremor-as-dependency is now a deprecating path; adopting a whole framework stack on slice #1 is high churn for a shell that must mainly *prove the boundary*. |
| **A′** (selected refinement) | **Option A + optionally adopt headless `@tanstack/react-table` for the dense Users/Orgs/Audit tables only** | Headless = no styling → zero design-system conflict; React-19 compatible; isolates table state logic the later data rows (#2–#3) will reuse. Pin to v8 explicitly; treat v9 migration as a later concern. | GOOD targeted fit: keeps the design system hand-built (Option A) while giving the heaviest pages a reusable, tested table primitive. Low risk because headless adds no visual surface. |

### Recommendation: **Option A (+ A′ headless TanStack Table for dense tables, planner-discretion / deferrable)**.

- Reuse the existing OKLCH token model (`@repo/plugin-web-tokens`) + `@repo/ui` patterns; **structurally** port the prototype's 10 pages into typed React (same pages + same data shape, admin-design-system components — NOT a pixel-perfect literal port).
- **Reject Tremor-as-dependency** (deprecating path post-Vercel acquisition) and **reject importing Tailwind** as the admin styling base for slice #1 (would fork the repo's CSS strategy). The prototype's hand-built OKLCH approach already proves feasibility.
- `@tanstack/react-table` (headless, v8 pinned) is an **allowed targeted addition** for Users/Orgs/Audit table state; if `feature-review` prefers zero new deps even here, the hand-built table from the prototype is the fallback (decision deferred to review — recorded as an open question, not a blocker).
- **Fixture port fidelity**: **structural** (same pages, same data shape, extracted into typed mock adapters), explicitly NOT pixel-perfect. This is the binding answer to the brief's open question.

---

## 4. Mock strategy — Typed Contract Mock (confirmed from brief)

For each of the 10 pages, define a **typed admin read-model interface** (the contract / seam),
implemented by a **mock adapter** that ports the prototype's inline `const` fixtures
(`USERS`, `FEATURES`, `VIEWS`, provider cards, RBAC matrix, transactions, audit rows,
settings, KPI/ops-queue data) into typed exports. No inline mock globals on the page —
pages read **only** through the interface. Later slices (#2–#5) swap the mock implementation
for a contract-backed service **without changing the page UI**. Destructive flows
(ban / bulk-ban / feature off / owner-transfer / provider routing / quota change) render the
existing type-to-confirm `ConfirmModal` UI but invoke **no-op mock command adapters**.

This matches INTEGRATION_PLAN §3 ("typed admin read models for each page before replacing mock
arrays") and the roadmap "contracts before UI data" gate.

---

## 5. Shared-seam analysis (three-faces boundary)

- **Only shared seam**: read-only consumption of the SHIPPED `@repo/web-auth-device-session`
  browser session. Verified its public surface (`packages/web-auth-device-session/src/index.ts`):
  exports `WebAuthSessionProvider` / `useWebAuthSession` returning `{ state, session, deviceId, ... }`
  where `session: Session | null` (Supabase Session). **There is NO admin claim modeled** — confirming
  the brief: this slice consumes the session **read-only** and adds an **admin-side mock claim predicate**.
  The real admin-claim/RBAC contract is row #2 (web-line owned, possible future D3).
- **No change to `@repo/web-auth-device-session`** this slice → **D3 = W0 (web-only)**, no
  `web → desktop-next` promotion. D3 only triggers if a shared `@repo/*` seam is modified (it is not).
- **No business logic** enters `packages/core` or `apps/web`. All admin logic lives in
  admin-owned typed modules under `apps/admin/`.
- **Cross-window contract impact: NONE.** No new `@repo/core/src/events` typed events; no Tauri
  command changes (admin is browser-side only). The session package's existing guard pattern
  (`resolveAppRouteGuard` / `AppRouteGate` in `guards.tsx`) is the **shape precedent** the admin
  guard composes on top of (admin guard = authenticated AND admin-claim-predicate(session)).

---

## 6. Dependency state verification (vs `docs/PLUGIN_MAP.md`)

| Dependency | Verified state | Use this slice | Strategy |
|---|---|---|---|
| `@repo/web-auth-device-session` | **Stable** (SHIPPED 2026-05-21) | Consume browser session + device identity read-only | Direct dependency; admin claim NOT modeled here → admin-side **mock claim predicate**; real contract = row #2 |
| `@repo/plugin-web-ai-chat` | **Stable** | Provider/secret *concepts* only | **Mocked**; real server-side encrypted secret handles = row #4 |
| `@repo/plugin-web-settings-rest` | **Stable** | Billing UI *concepts* only | **Mocked**; webhook-backed Stripe = row #3 |
| `audit-log-integrity` | **Shipped** (2026-05-19, line 75 PLUGIN_MAP) | Hash-chain *precedent* only (not wired) | Not wired this slice; real admin audit = row #5 |
| Prototype `docs/prototypes/admin-dashboard/` | Design authority | Port UI + extract fixtures into typed mock adapters | Structural port; inline `const` arrays → typed adapter exports |

All consumed dependencies are Stable/Shipped — no In-Dev dependency requires wrapping beyond the
deliberate admin-specific mocking of not-yet-existing admin contracts.

---

## 7. Risks & open questions

| ID | Risk / question | Severity | Mitigation / carry-forward |
|---|---|---|---|
| R1 | Admin code/secret leaking into `apps/web` bundle | HIGH | Option A physical isolation (separate Vite app + Pages project + origin); bundle/source-text guard test asserting no service-role/provider-secret literal in `apps/admin/dist`. |
| R2 | Guard fails **open** (non-admin gets in) | HIGH | Predicate **fails closed** by default (unknown/missing claim → deny); positive + negative unit tests are the core acceptance gate. |
| R3 | Mock claim diverges from the real row-#2 admin-claim source | MED | Define the predicate as a typed interface `(session) => boolean` with the mock as one implementation; row #2 swaps the implementation without changing the guard. |
| R4 | New CSS framework (Tailwind) forking the repo design system | MED | Rejected for slice #1; reuse OKLCH tokens + `@repo/ui` (Option A). |
| R5 | TanStack Table v8 staleness / React Compiler caveat | LOW | Headless-only use, pinned v8; hand-built fallback recorded; React Compiler not enabled in repo. |
| OQ1 | Headless TanStack Table vs fully hand-built tables | open | Decision deferred to `feature-review`; both viable; not a blocker. |
| OQ2 | Dedicated subdomain naming (`admin.<domain>`) + custom-domain/DNS | open (row #6) | Slice #1 ships at `*.pages.dev`; DNS/custom domain is row #6 deploy-observability. |
| OQ3 | Real admin-claim source (extend session pkg vs dedicated admin-auth pkg) | open (row #2) | Mock only this slice; flagged for row #2 (web-line, possible D3). |
| OQ4 | Server secret backend shape | open (row #2/#4) | Slice #1 asserts only **absence** from the browser. |
| OQ5 | Whether real Supabase auth or `mock-authenticated` posture for the admin surface | open | Recommend `mock-authenticated` parity with ADR-0008 D2 for slice #1 (no admin secrets); if real auth, add the Supabase host to admin `_headers connect-src` per the extension precedent. |

---

## 8. Recommendation summary (for `feature-review`)

1. **Build target**: new isolated `apps/admin/` Vite app; own `package.json` / `vite.config.ts` /
   `wrangler.toml` / `public/_headers` / env. NOT mounted in the `apps/web` module rail. (Option A)
2. **Deploy/CSP**: separate Cloudflare Pages project + dedicated subdomain; own `_headers` CSP
   (tight, `connect-src 'self'`); ADR-0008 extension recorded as an ADR-lite in `apps/admin/docs/design.md`
   + cross-ref note; CSP source-text guard test cloned. (Option A)
3. **UI stack**: reuse `@repo/plugin-web-tokens` OKLCH tokens + `@repo/ui` patterns; structural port
   of the prototype; reject Tailwind/Tremor-as-dependency for slice #1; headless TanStack Table v8
   allowed for dense tables (deferrable to review). (Option A / A′)
4. **Guard**: compose on `useWebAuthSession()` (authenticated) + a typed, mock-backed **admin-claim
   predicate** that **fails closed**; positive + negative tests.
5. **Pages**: all 10 (`dashboard, users, boards, features, ai, providers, roles, billing, audit,
   settings`) render via typed read-model interfaces + mock adapters (fixtures from prototype);
   destructive UI preserved → no-op mock command adapters.
6. **Boundary**: W0 web-only; no `dev` promotion; no new typed events; no Tauri changes; no business
   logic in core/web.
7. **Tests**: unit test for every adapter + the admin-claim predicate; route allow/deny tests;
   no-secret bundle/source-text guard; CSP guard; vite build + vitest green.

---

## 9. Web research evidence (sources)

- TanStack Table v8 — React 19 support + maintenance status: [Installation | TanStack Table Docs](https://tanstack.com/table/v8/docs/installation), [@tanstack/react-table on npm](https://www.npmjs.com/package/@tanstack/react-table), [Releases · TanStack/table](https://github.com/TanStack/table/releases)
- Tremor — Vercel acquisition + copy-paste pivot + MIT license: [Vercel acquires Tremor](https://vercel.com/blog/vercel-acquires-tremor), [@tremor/react on npm](https://www.npmjs.com/package/@tremor/react), [tremorlabs/tremor (GitHub)](https://github.com/tremorlabs/tremor)
- shadcn/ui — React 19 + Vite + Tailwind v4 + copy-paste model: [Vite - shadcn/ui](https://ui.shadcn.com/docs/installation/vite), [Next.js 15 + React 19 - shadcn/ui](https://ui.shadcn.com/docs/react-19)
