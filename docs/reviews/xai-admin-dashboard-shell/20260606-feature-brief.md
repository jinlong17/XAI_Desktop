# Feature Brief — xai-admin-dashboard-shell

> Step 0 Requirement Brief Normalization (skill: `xai-feature-brief`).
> Date: 2026-06-06 · Status: **READY_FOR_FEATURE_PLAN**
> Module: `admin` (#6) · Slice: roadmap row #1 of `xai-admin-dashboard-system-integration`.
> This brief defines the requirement for slice #1 only; it is not the implementation plan.

---

## Operator activation receipt (PROPOSED gate)

- **Before:** `admin` was ADR-0013 §D1 **PROPOSED / owner-deferred** — prototype-only, no package, not authorized to start.
- **Operator decision (2026-06-06):** **Activate the entire `admin` line** (Round 1, Operator gate).
- **Effect:** the PROPOSED gate is lifted for the `admin` line. The roadmap manifest's 6 rows are unblocked to proceed **wave by wave**; activation does **not** skip per-slice planning, and the manifest's hard dependency order still holds (RBAC/data contracts before any mutation; read-heavy before write-heavy; audit append covered by tests before mutation flows).
- **This brief scopes only slice #1 (`xai-admin-dashboard-shell`).** Subsequent rows (#2–#6) each need their own `feature-plan` when their wave starts. Admin work is **W0 (web-only)** by default and **must not enter `web → desktop-next → dev` promotion**; it only touches D3 if a shared `@repo/*` seam is changed.

---

## Structured Brief

### Problem / Motivation
The Admin Console exists only as a high-fidelity single-file prototype (`docs/prototypes/admin-dashboard/index.html` — vanilla JS, hand-written CSS, mock data, local state). There is no real surface, no isolation, and no permission boundary. Before any admin capability (user/org administration, AI/provider governance, billing, audit) can be built, the project needs a **production-shaped isolated admin surface that proves the shell and the permission boundary** — without granting any real admin power or exposing privileged credentials. This slice de-risks the entire admin line by establishing the surface boundary first.

### Target User / Actor
**Admin operator** — internal staff who hold an admin claim/role. Explicitly **not** the end-user `apps/web` Console audience. Non-admin (ordinary authenticated) users must be denied access to the admin surface.

### Desired Outcome
An isolated `apps/admin/` surface that:
1. boots behind an **admin-only route guard** (consuming the existing Stable browser session), with negative tests proving non-admin denial;
2. renders **all current prototype pages** through **typed mock adapters** (no inline mock globals), preserving the existing information architecture and interactions;
3. has an **independent CSP / env / deploy boundary** separate from `apps/web`;
4. **never** delivers service-role credentials or provider secret material to the browser, and performs **no production writes** — it proves the shell + permission boundary only.

### Scope
- New isolated build target **`apps/admin/`** (separate Vite app, `package.json`, `wrangler.toml`, `_headers`/CSP, env, deploy controls). Not mounted into the `apps/web` module rail.
- **Admin route guard**: consume the Stable browser session from `@repo/web-auth-device-session`; add an **admin-claim predicate contract** (typed adapter, mock-backed for this slice) that fails closed; **admin-claim negative tests** for non-admin users.
- **Typed mock adapters** for the prototype's **10 pages**: `dashboard` (总览看板), `users` (用户管理), `boards` (组织/空间), `features` (功能管理), `ai` (AI 用量&配额), `providers` (Provider 配置), `roles` (角色与权限 RBAC), `billing` (订阅/计费), `audit` (审计日志), `settings` (系统设置). Each page reads through a **typed admin read-model interface**, implemented by a mock adapter that ports the prototype's existing fixture data.
- Preserve destructive-action **UI affordances** (ConfirmModal + type-to-confirm) but wire them to **mock/no-op adapters** — visible, not writing.
- **Independent CSP/env/deploy** scaffolding so admin secrets/handling cannot tree-shake into the user bundle.

### Non-goals
- **No production writes / no real mutations** (ban, bulk-ban, feature rollout, owner transfer, provider routing, quota change all remain mock/no-op this slice).
- **No real service-role credentials or provider secret material in the browser** — under no condition.
- **No real RBAC enforcement, no real admin audit log, no real billing/Stripe state, no real provider config** — those are roadmap rows #2–#6.
- **No change to the shared user-facing `@repo/web-auth-device-session` admin-claim model** this slice (the *real* admin claim/role + RBAC contract is row #2, web-line owned). This slice consumes the session read-only and mocks the claim.
- **No Tweaks / visual-design panel** (design-review-only per `INTEGRATION_PLAN §1`).
- No discovery/research deliverable — the design authority already exists (prototype + reference design + INTEGRATION_PLAN).

### Feature Classification
- **Product module:** `admin` (#6) — path + keyword signals (`docs/prototypes/admin-dashboard/`, `apps/admin/`, control plane, RBAC, provider secret handle) all hit admin.
- **Architecture Kind:** new isolated **deployment + governance surface** (browser SPA control plane).
- **User Surface:** admin control plane (internal operator).
- **Change Type:** new feature (first slice of a new surface).
- **Risk Level:** **HIGH** — new build target, independent deploy/secrets boundary, auth/permission gating, crosses a (now operator-activated) proposed-line gate.
- **Target Feature State:** N/A (new surface); consumed dependencies are Stable/Shipped (see below).
- **Branch:** `codex/admin/<feature>` · **D3 classification:** **W0 (web-only)** unless a shared `@repo/*` seam is modified.

### Impacted Layers
- Frontend (new `apps/admin/` SPA): **Yes**
- Backend / server API: **No** (mock adapters only; real service-role/admin API is row #2+)
- Database: **No**
- Model API: **No**
- Sandbox Execution: **No**
- Third-party Integration: **No** (Stripe/provider are mock this slice)
- Auth / Permission: **Yes** (admin route guard + admin-claim predicate + negative tests — the core of the slice)
- Analytics / Observability: **No** (deferred to row #6)
- Registration / Loading Boundary: **Yes** (new build/deploy target, independent CSP/env)

### Candidate Modules / Dependencies (states verified in `docs/PLUGIN_MAP.md`)
| Dependency | State | Use this slice | Gap / strategy |
|---|---|---|---|
| `@repo/web-auth-device-session` | **Stable** (SHIPPED 2026-05-21) | Consume browser session + device identity (read-only) | Admin claim **not modeled** here → admin-side **mock claim predicate**; real admin-claim/RBAC contract is row #2 (web-line) |
| `@repo/plugin-web-ai-chat` | **Stable** | Reference for provider/secret concepts only | User-level key store ≠ admin provider secrets → **mocked**; real server-side encrypted secret handles are row #4 |
| `@repo/plugin-web-settings-rest` | **Stable** | Reference for billing UI concepts only | User Stripe stub ≠ admin billing API → **mocked**; webhook-backed Stripe state is row #3 |
| `audit-log-integrity` | **Shipped** | Hash-chain precedent (not wired this slice) | Admin audit table absent → not wired; real admin audit is row #5 |
| Prototype `docs/prototypes/admin-dashboard/` | Design authority | Port UI + extract fixtures into typed mock adapters | Single-file vanilla → port into typed React `apps/admin` per `INTEGRATION_PLAN §3` |

**Mock strategy (chosen): Typed Contract Mock.** Define a typed admin read-model interface per page; implement with mock adapters that port the prototype's existing fixtures. The contract is the seam; later slices swap the mock for a contract-backed service API without changing the UI. (Aligns with roadmap "contracts before UI data".)

### Data / Security / Cost / Release Notes
- **Security (hard, non-negotiable):** the browser **must never** receive service-role credentials or provider secret material. The admin bundle must contain no service-role token / provider key. Route guard **fails closed** (non-admin → denied/redirected). Destructive UI is preserved (type-to-confirm) but wired to no-op mocks.
- **Three-faces / boundary:** `admin` is a **new Web-line app surface (`apps/admin/`)**, physically separate from `apps/web`. Business logic lives in admin-owned typed modules/packages (`INTEGRATION_PLAN §3`), **not** smuggled into `packages/core` or `apps/web`. The only shared seam is the **read-only session contract** from Stable `@repo/web-auth-device-session`.
- **Data:** no production data; no schema; no `syncScope` entity added. (If admin read models later need cross-device persistence, that is a `sync` line / ADR-0013 §D4 concern — **paused**, out of scope here.)
- **Cost:** none (no model API / no metered service this slice).
- **Release:** independent build + deploy target with its own CSP/env (the *mechanism* — separate Cloudflare Pages project vs subdomain vs path — is an ADR-lite for `feature-plan`; ADR-0008 governs Cloudflare deploy/CSP and is the likely amendment/extension point). Admin stays W0; **not** promoted to `dev`.
- **Rollback / Degrade:** the new `apps/admin/` target can be unpublished/disabled independently without affecting `apps/web`. Guard fails closed by default, so a misconfiguration denies rather than over-grants. No production state to roll back (no writes).

### Acceptance Criteria (binary, testable)
1. A non-admin authenticated user **cannot** load any `apps/admin/` route (guard denies/redirects); an admin-claim user **can** — covered by **admin-claim negative + positive tests**.
2. All **10** prototype pages (`dashboard, users, boards, features, ai, providers, roles, billing, audit, settings`) render in `apps/admin/`, each reading through a **typed mock adapter / typed read-model interface** (no inline mock globals).
3. **No service-role token or provider secret** appears in the built `apps/admin/` browser bundle — provable by a bundle/source-text guard test.
4. **No production write** occurs from any admin action; destructive flows render their type-to-confirm UI but invoke no-op mock adapters.
5. `apps/admin/` builds and deploys via its **own** target with **independent CSP/env/deploy** config, **not** mounted in the `apps/web` module rail.
6. Each typed mock adapter and the admin-claim permission predicate has **unit tests**; build is green (vite build + vitest).

### Success Signals
- Surface boundary proven: zero admin code/secrets reachable from the `apps/web` user bundle.
- The shell is a clean seam — later slices replace mock adapters with contract-backed services without UI rewrites.

---

## Open Questions / Unknowns
- **Deploy isolation mechanism** (待确认): separate Cloudflare Pages project + dedicated subdomain (e.g. `admin.<domain>`) vs reused infra with separate config vs additional edge auth. → ADR-lite for `feature-plan` (ADR-0008 extension point).
- **Admin UI component stack** (待确认): reuse `@repo/ui` + `@repo/plugin-web-tokens` design system vs adopt the prototype README's recommendation (shadcn/ui + TanStack Table + Tremor). → ADR-lite for `feature-plan`.
- **Real admin-claim source** (待确认, deferred to row #2): whether the production admin claim/role extends `@repo/web-auth-device-session` (web-line, possible D3) or a dedicated admin auth package. This slice uses a mock predicate only.
- **Env/secret backend shape** (待确认, deferred to row #2/#4): where server-side service-role + provider secret handles live; this slice asserts only their **absence** from the browser.
- **Fixture extraction fidelity** (待确认): faithful pixel port vs structural port (same pages + data shape, admin design-system components). Bounded; for `feature-plan`.

---

## ADR-lite Trigger
- **Needed: Yes** (triggers: introduces a new build/deploy target + independent CSP/env boundary; changes the loading/registration boundary; HIGH-risk surface).
- **Topic 1 — Admin surface build & deploy isolation.** Why: must satisfy "independent CSP/env/deploy" + "no service-role/provider secret in browser"; the isolation mechanism (separate Pages project / subdomain / path) shapes secret-safety and ops. Options to evaluate: separate Cloudflare Pages project + subdomain; reused infra + separate `wrangler`/`_headers`/env; edge-auth front. Risk if deferred: weak isolation that lets admin code/secrets leak into the user bundle. Planner must decide and likely amend/extend ADR-0008.
- **Topic 2 — Admin UI component/tech stack.** Why: first admin code sets the pattern for all later admin pages; choice affects table/filter/drawer/matrix ergonomics. Options: reuse `@repo/ui`+tokens vs shadcn/ui+TanStack Table+Tremor (prototype README recommendation). Risk if deferred: inconsistent stack across admin slices / rework.
- **Landing:** record the chosen options in the feature's `design.md` decision snapshot (no standalone ADR infra required yet); ADR-0008 amendment if deploy/CSP boundary changes.

---

## Planner Handoff

```text
Start the feature-plan agent.
  Motivation: Land roadmap row #1 (xai-admin-dashboard-shell) — turn the prototype-only Admin Console
    into a production-shaped ISOLATED admin surface that proves the shell + permission boundary only,
    with no real admin power. Operator has ACTIVATED the whole admin line (2026-06-06); this plan is
    for slice #1 only and must preserve the manifest dependency order for #2–#6.
  Goal: Build apps/admin/ (separate Vite app) behind an admin-only route guard that consumes the Stable
    @repo/web-auth-device-session browser session and adds a typed, mock-backed admin-claim predicate
    with admin-claim negative tests; render all 10 prototype pages (dashboard, users, boards, features,
    ai, providers, roles, billing, audit, settings) through typed mock adapters (typed read-model
    interface per page, fixtures ported from the prototype); independent CSP/env/deploy boundary.
  Scope: New apps/admin/ build+deploy target with its own package.json, wrangler.toml, _headers/CSP, env;
    admin route guard + admin-claim predicate + negative/positive tests; typed mock adapters for 10 pages;
    preserve type-to-confirm destructive UI wired to no-op mocks; unit tests for every adapter + the
    permission predicate. Branch codex/admin/<feature>. W0 (web-only); do not promote to dev.
  Non-goals: No production writes/mutations; no service-role credentials or provider secret material in
    the browser (assert absence in bundle); no real RBAC enforcement/audit/billing/provider config
    (rows #2–#6); no change to @repo/web-auth-device-session admin-claim model this slice; no Tweaks panel.
  Constraints: admin is a new Web-line surface separate from apps/web — business logic stays in admin-owned
    typed modules, never in packages/core or apps/web; only shared seam is the read-only session contract.
    Mock strategy = Typed Contract Mock. ADR-0008 governs Cloudflare deploy/CSP.
  Dependencies: @repo/web-auth-device-session (Stable, session read-only); prototype
    docs/prototypes/admin-dashboard/index.html + INTEGRATION_PLAN.md (design authority + fixtures);
    ai-chat / settings-rest / audit-log-integrity referenced as concepts only, all mocked.
  Mock strategy: Typed Contract Mock — typed admin read-model interface per page, mock adapter ports
    prototype fixtures; later slices swap mock for contract-backed service without UI change.
  ADR-lite for planner to decide:
    (1) admin surface build & deploy isolation mechanism (separate Pages project / subdomain / config) — ADR-0008 extension;
    (2) admin UI component stack (reuse @repo/ui+tokens vs shadcn/ui + TanStack Table + Tremor).
  Acceptance Criteria:
    - Non-admin cannot load any apps/admin route; admin can — negative + positive guard tests.
    - All 10 pages render via typed mock adapters (no inline mock globals).
    - No service-role token / provider secret in the built admin bundle (guard test).
    - No production write from any admin action (destructive UI = no-op mock).
    - apps/admin builds + deploys on its own target with independent CSP/env/deploy.
    - Unit tests for every adapter + the admin-claim predicate; vite build + vitest green.
  Open Questions: deploy isolation mechanism; admin UI stack; real admin-claim source (row #2);
    server secret backend (row #2/#4); fixture port fidelity.

  Three-faces decision: new Web-line app surface (apps/admin/), separate from apps/web; consumes the
    read-only session contract from Stable @repo/web-auth-device-session; no business logic in
    packages/core or apps/web.
  Product module: admin (PROPOSED → operator-ACTIVATED whole line 2026-06-06; slice #1 only; W0 web-only; no dev promotion).
  Target plugin slice: N/A (new app surface, not a packages/plugin-* slice).
  Mock strategy: Typed Contract Mock — see above.
  Cross-window contract impact: None. No new @repo/core/src/events typed events; no Tauri command changes
    (admin is browser-side). D3 only if a shared @repo/* seam is later modified.
```

**Alternate batch route (operator activated the whole line):** to drive all 6 roadmap rows wave-by-wave instead of slice #1 alone:
```text
/xai-roadmap-loop mode: init
Roadmap Source: docs/workflow/roadmap/xai-admin-dashboard-system-integration.md
Verify Cross-vendor: yes
```

---

## QA Gate self-check (14 points)
1. Problem clear ✓ · 2. Actor clear ✓ (admin operator) · 3. Scope & non-goals clear ✓ · 4. Classification consistent ✓ (admin / new / HIGH / apps/admin / W0) · 5. Dependency states checked vs PLUGIN_MAP ✓ (all Stable/Shipped; admin-specifics mocked) · 6. Data/permission/security assessed ✓ (no prod data; guard + negative tests; no browser secrets) · 7. Release strategy ✓ (isolated build/deploy; mechanism = ADR-lite) · 8. Rollback/degrade ✓ (independent target; fail-closed; no writes) · 9. Acceptance criteria binary ✓ · 10. Unknowns listed ✓ · 11. ADR-lite judged ✓ (Yes, 2 topics) · 12. Compressible to handoff ✓ · 13. Three-faces boundary ✓ (new Web-line surface; no logic in core/web) · 14. Six-module routing ✓ (one owner=admin; downstream web/sync/app noted; gates preserved).

**Final status: READY_FOR_FEATURE_PLAN.**
