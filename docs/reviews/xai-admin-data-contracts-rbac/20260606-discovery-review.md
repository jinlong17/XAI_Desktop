# Discovery Review — xai-admin-data-contracts-rbac

> Workflow V2 · `feature-plan` (Fresh) · 2026-06-06
> Module: `admin` (#6) · Roadmap row **#2 of 6** of `xai-admin-dashboard-system-integration`.
> Hard dependency: row #1 `xai-admin-dashboard-shell` = **SHIPPED**. Operator activated the whole admin line 2026-06-06.
> Source authority: `docs/workflow/roadmap/xai-admin-dashboard-system-integration.md` (row #2),
> `docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md` §2–§4, SHIPPED `apps/admin/docs/{design,api}.md`.

---

## 0. Mode + landing decision

- **Mode**: `Fresh`. No prior planning artifacts exist for slug `xai-admin-data-contracts-rbac`
  (verified: no `docs/reviews/xai-admin-data-contracts-rbac/`, no `apps/admin/docs/data-contracts-rbac/`,
  no `_intake/` brief). The requirement was delivered inline by the operator (it is row #2 of the
  manifest, not a `_intake` brief migration).
- **Why no Step-0 brief file**: slice #1's brief (`docs/reviews/xai-admin-dashboard-shell/20260606-feature-brief.md`)
  is owned by slice #1; its Open Questions OQ3 (real admin-claim source) + OQ4 (server secret backend)
  are explicitly **deferred to row #2** and are now owned here. The roadmap manifest row #2 + INTEGRATION_PLAN
  §2–§4 are the authoritative requirement; this discovery review normalizes them.
- **Doc landing (explicit choice, do NOT overwrite slice #1)**:
  - Discovery review → `docs/reviews/xai-admin-data-contracts-rbac/20260606-discovery-review.md` (this file).
  - Four-piece set → **`apps/admin/docs/data-contracts-rbac/{design,api,test,dev_log}.md`** — a DISTINCT
    sub-folder co-located with the `apps/admin/` surface it governs. Rationale: row #2 is not a
    `packages/plugin-*` slice (so the plugin-docs path is N/A); it formalizes the contracts of the
    `apps/admin/` app, so co-locating under `apps/admin/docs/<row-slug>/` keeps the contract next to its
    surface while leaving slice #1's `apps/admin/docs/{design,api,test,dev_log}.md` untouched.

---

## 1. Problem framing

### Motivation
Slice #1 stood up the isolated `apps/admin/` surface with: (a) a fail-closed `AdminClaim` predicate +
`AdminRouteGate` consuming the read-only `@repo/web-auth-device-session` session; (b) 10 typed
read-model interfaces backed by **mock adapters**; (c) 6 destructive command adapters wired to **no-op**;
(d) a no-secret / tight-CSP boundary. It deliberately deferred the *power* layer: there is **no real
admin-claim source, no permission keys, no RBAC enforcement model, and no server/API boundary contract**.

The roadmap is explicit (manifest row #2 note + Implementation Order #2): **"No UI mutation may ship
before this row is green."** Every later write-heavy row (#3 users/orgs/billing mutations, #4 feature
flags/quota/provider routing, #5 audit-append-on-mutation) depends on row #2 to define *what is allowed,
by whom, and where it is enforced*. Without row #2, rows #3–#5 would each re-invent ad-hoc permission
checks — exactly the anti-pattern the manifest's dependency order prevents.

### Target outcome (what "row #2 green" means)
A **contract-only, fully testable** definition of the admin data + permission layer, with the transport
**mockable** so it does NOT require deploying a real server:

1. **Admin read models** — formalize the canonical typed read-model contracts per page (the shapes slice #1
   satisfies with mock adapters) into a stable, documented contract, annotating each value as
   **live / mock / deferred**, so rows #3–#5 swap mock → contract-backed service WITHOUT UI change.
2. **Permission keys** — an immutable, append-only set of admin permission keys (stable string identifiers;
   never renumbered or reused).
3. **RBAC enforcement contract** — the role × permission model + a permission-predicate API with allow/deny
   tests for **every mutation family**; server-enforceable (browser predicates advisory/UX only).
4. **Server / API boundary** — the admin API contract: a service-role API with RLS-safe admin authorization;
   the browser NEVER receives service-role credentials or provider secret material.

### Scope (row #2 only)
- Permission-key catalog (immutable, append-only) + the role→permission grant map.
- RBAC predicate API (`can(role|permissions, permissionKey)`) + allow/deny test matrix over every mutation family.
- Read-model contract formalization + live/mock/deferred annotation table (the *contract*, not new pages).
- Admin API-boundary contract: request/response shapes, the **server-side re-authorization** rule, the
  **fail-closed** error semantics, and the **no-service-role-in-browser** invariant — defined as a typed,
  mockable transport seam (no real server deploy).
- The **real admin-claim source** decision (OQ3) + how slice #1's mock claim graduates.

### Non-goals (carry from slice #1; deferred by row)
- **No real server deploy / no live backend** — the API boundary is a typed mockable contract this row.
- **No real production mutations** — command adapters remain no-op until a later row wires a real transport.
- **No real per-page wiring** of contract-backed services — rows #3–#5.
- **No real audit log implementation** — row #5 (row #2 only *names* the audit-append obligation in the
  mutation contract; it does not build the hash-chain store).
- **No real Stripe/billing state, no real provider secret backend implementation** — rows #3/#4 (row #2
  defines the *boundary invariant* that secrets never reach the browser; it does not build the secret store).
- **No `syncScope` entity / no cross-device persistence** of any admin read model — that is ADR-0013 §D4 /
  the PAUSED `sync` line; explicitly out of scope, noted as deferred.
- **No Tweaks visual-design panel** (design-review-only per INTEGRATION_PLAN §1).

### Constraints + dependency hints
- `apps/admin/` stays a Web-line app separate from `apps/web`; no admin business logic in `packages/core`
  or `apps/web`. The only shared seam is the **read-only session contract**.
- No service-role credentials / provider secret material in the browser, ever (hard invariant from slice #1,
  asserted by `TT-NO-SECRET-SRC` + `TT-NO-SECRET-BUNDLE`).
- Reuse OKLCH tokens + `@repo/ui`; do not add Tailwind/Tremor. Headless `@tanstack/react-table` v8 permitted
  if a table needs it (record the choice). Row #2 is contract-heavy and may add **zero** runtime UI deps.
- `feature-build` does ONE phase per run → phase the plan so each phase is independently verifiable; sequence
  **contracts → permission keys → RBAC predicates → API boundary**.

---

## 2. Candidate options (with evidence)

Row #2 has **one genuine technology-selection axis** (the canonical server-enforceable admin-authz pattern,
which drives both the real-admin-claim-source decision and the API-boundary contract). The other axes are
**internal design decisions** (where the contract lives, key-naming scheme) with no external dependency, so
per the protocol web research focused on the authz pattern only.

### Axis A — Real admin-claim source (OQ3): extend the shared session package vs admin-side authz contract

| Option | What it is | Pros | Cons |
|---|---|---|---|
| **A1** — extend `@repo/web-auth-device-session` to model an admin claim/role | Add an `isAdmin`/`role` field to the shared user-facing session context | One place models identity | **Burdens a Stable, user-facing shared package** with an admin concern; it is **web-line** and, because the package also flows to the App, **may trigger a D3 classification** (W1+) for an admin-only need; widens the package's surface for every consumer |
| **A2** — dedicated **admin-side authz contract** that consumes the session **read-only** (CHOSEN) | Keep the shared session package unchanged; an `apps/admin/`-owned authz module reads `session` (incl. `app_metadata`) read-only and derives the admin claim + role | Keeps the shared user-auth package **unburdened**; stays **W0 (web-only, admin-side only)** — no shared seam modified; the production admin role rides in the JWT (`app_metadata`) which the session **already exposes**; slice #1's mock predicate **already reads `session.user.app_metadata.xai_admin`** so graduation is implementation-only behind the same predicate seam | Admin claim derivation lives admin-side (acceptable — it is an admin concern) |

**Evidence (web research 2026-06):**
- Supabase's canonical RBAC mechanism is a **Custom Access Token Auth Hook** that injects the role into the
  **issued JWT** (the RBAC guide adds a `user_role` claim; the hook docs nest custom claims under
  `claims.app_metadata`). Either way the role arrives **inside the access token**, decodable on
  `session.user.app_metadata` — *the exact field slice #1's mock predicate already reads defensively*.
  Sources: Supabase "Custom Claims & RBAC" + "Custom Access Token Hook" docs (see §Sources).
- Because the role is delivered in the JWT and surfaced on the existing `session` object, **A2 needs NO
  change to `@repo/web-auth-device-session`'s public surface** — confirmed against the package's
  `src/index.ts` (exports `useWebAuthSession` → `{ state, session }`; `session: Session | null`; no admin
  claim modeled, and none needed because `app_metadata` is already an arbitrary record on `Session`).

**Decision: A2.** Prefer the option that keeps the shared user-auth package unburdened (explicit operator
preference). Slice #1's mock `AdminClaim` predicate **graduates in place**: same `AdminClaimPredicate` seam,
swap the mock body for one that reads the real JWT custom claim (`app_metadata.<adminClaimKey>`), still
**fails closed**, still pure. D3 stays **W0**. *If* a future need forces a shared-package change, that is a
separate web-line + D3 decision — flagged, not taken here.

### Axis B — Where the permission-key catalog + RBAC predicate live

| Option | What it is | Pros | Cons |
|---|---|---|---|
| **B1** — a shared `packages/*` RBAC package | Publish admin RBAC as a workspace package | Reusable by other surfaces | No other surface needs it; would put admin business concepts into shared space; risks `apps/web` importing it; over-engineered for one consumer |
| **B2** — admin-app-local module under `apps/admin/src/authz/` (CHOSEN) | The permission-key catalog, role map, and predicate live inside the admin surface | Honors the code-boundary rule ("business logic → owning surface, never `packages/core`/`apps/web`"); stays W0; co-located with the only consumer; mirrors slice #1's `apps/admin/src/auth/` precedent | Not reusable elsewhere (a non-issue — nothing else consumes it) |

**Decision: B2.** Same boundary discipline slice #1 used for `auth/`. The permission keys are a frozen
constant module; the RBAC predicate is a pure function; both admin-local. The **server enforcement** half of
the contract is documented as the authoritative copy that a future Edge Function re-implements
(browser copy is advisory) — see Axis C.

### Axis C — Where RBAC is *enforced* (the security boundary)

| Option | What it is | Pros | Cons |
|---|---|---|---|
| **C1** — browser predicate is the gate | The admin SPA's `can()` decides what mutations run | Simple | **Insecure** — a browser check is bypassable; violates the manifest "server enforcement" gate and the secret-safety invariant |
| **C2** — server-enforced; browser advisory only (CHOSEN) | The authoritative RBAC check runs in the admin **Edge Function / service-role API**, which re-validates the JWT admin role before any service-role DB op; the browser `can()` only **hides/disables UI** | Matches Supabase's documented Edge-Function pattern; defense-in-depth (RLS + explicit server authz); keeps service-role server-side; the same permission-key catalog is shared (browser imports it for UX, server re-checks it) | Two predicate sites (browser UX + server authoritative) — mitigated by a single shared key catalog + a documented "server is authoritative" rule |

**Evidence (web research 2026-06):**
- Supabase docs: a client with the **service_role** key **always bypasses RLS**; the recommended Edge
  Function pattern is **extract JWT → `getUser()` validate → check admin role → only then use the
  service_role client** (and the service-role client must not carry the user JWT). RLS is **defense-in-depth**
  on top of the explicit server authz check.
  Sources: Supabase "Row Level Security", "Edge Functions: authorize the user AND bypass RLS" discussion,
  "RLS best practices" (see §Sources).

**Decision: C2.** The contract states explicitly: **browser permission predicates are advisory/UX only and
are NEVER the security boundary**; the admin API (Edge Function) is the authoritative enforcer and
re-validates the admin role server-side before any privileged operation. The browser never receives
service-role credentials or provider secret material. This is documented in `api.md` as a hard invariant
and exercised by a contract test that asserts the *server-side rule is the source of truth* (the browser
`can()` is tested as advisory, and a no-secret guard continues to assert absence in the bundle).

### Axis D — Permission-key naming scheme (immutable, append-only)

| Option | What it is | Pros | Cons |
|---|---|---|---|
| **D1** — numeric ids | `1, 2, 3…` | compact | numeric ids invite renumber/reuse — the exact thing the requirement forbids; opaque |
| **D2** — stable dotted string keys (CHOSEN) | `admin.users.ban`, `admin.features.rollout`, … | human-readable, self-describing, naturally append-only, never "renumbered"; matches the project's `entityType` dotted-slug convention precedent (`^[a-z]+\.[a-z_]+$` in `core-data`) | slightly longer strings (irrelevant) |

**Decision: D2.** Dotted, namespaced, **append-only** permission keys. The catalog is a frozen `as const`
map; a test asserts (a) uniqueness, (b) every key matches the naming pattern, (c) **every mutation-family
command maps to exactly one permission key**, and (d) a "no-removal" guard documents the append-only rule.
The prototype RBAC matrix (5 roles × 10 permission rows) is the seed — it is normalized into canonical keys.

---

## 3. Tradeoffs summary

- **A2 + B2 + C2 + D2** is the combination that keeps row #2 **W0** (no shared-package change), honors the
  code boundary, matches Supabase's documented server-enforced pattern, and lets the slice be **green via
  contracts + tests without deploying a server**. It is the lowest-risk path that still fully satisfies the
  manifest's RBAC + secret-safety + contract-coverage gates.
- The cost is the deliberate **two predicate sites** (browser advisory + server authoritative). This is a
  feature, not a smell: it is the canonical defense-in-depth posture, and a single shared permission-key
  catalog keeps them from diverging. The contract names the **server as the single source of truth**.
- Keeping the API boundary as a **typed mockable transport seam** (not a real server) is what makes row #2
  independently verifiable and keeps real mutations/wiring in rows #3–#5 — matching the manifest's
  read-before-write, audit-before-mutation ordering.

---

## 4. Recommendation

Adopt **A2 / B2 / C2 / D2**. Concretely, row #2 delivers (all admin-local, all under `apps/admin/`, all W0):

1. **Read-model contract formalization** (`apps/admin/src/contracts/readModels.ts` or a documented
   re-export of slice #1's `adapters/types.ts` as the *canonical contract*) + a **live/mock/deferred
   annotation table** in `api.md` for every page's read model. No UI change; the interfaces slice #1 already
   uses become the *frozen contract* rows #3–#5 implement against.
2. **Immutable permission-key catalog** (`apps/admin/src/authz/permissionKeys.ts`) — dotted, append-only,
   `as const`; seeded from the prototype RBAC matrix; every mutation family mapped to exactly one key.
3. **RBAC model + predicate** (`apps/admin/src/authz/rbac.ts`) — the role→permission grant map (normalized
   from prototype `ROLES`/`RBAC`) + a pure `can(...)` predicate; **allow/deny tests for every mutation
   family**; documented as **browser-advisory; server-authoritative**.
4. **Admin API-boundary contract** (`apps/admin/src/contracts/adminApi.ts` + `api.md`) — the typed
   request/response shapes for admin reads + the 6 mutation families, the **server-side re-authorization**
   rule, **fail-closed** error semantics, and the **no-service-role/secret-in-browser** invariant; defined
   as a **mockable transport seam** (an injectable `AdminApiClient` interface with a mock impl), so no real
   server is deployed and slice #1's no-op command adapters can later target it.
5. **Admin-claim graduation note** — slice #1's mock `AdminClaimPredicate` seam is retained; the production
   claim reads the real JWT custom claim (`app_metadata.<adminClaimKey>`), still fail-closed; documented as
   the swap point. No change to `@repo/web-auth-device-session`.

### Phase plan (one phase per `feature-build` run; sequence = contracts → keys → RBAC → API)

| Phase | Goal | Key deliverables | Acceptance gate |
|---|---|---|---|
| **P1 — Read-model contract freeze + live/mock/deferred map** | Promote slice #1's read-model interfaces to the canonical, documented contract; annotate every value | canonical contract module (re-export/typed surface), `api.md` live/mock/deferred table, contract test that the 10 read models are stable + each page maps to one | `TT-READMODEL-CONTRACT` + `TT-READMODEL-ANNOTATION` green; `apps/admin` build + slice-#1 tests unaffected |
| **P2 — Immutable permission-key catalog** | Define the append-only dotted permission keys + map every mutation family to a key | `permissionKeys.ts` (`as const`), command→key map, naming/uniqueness/append-only tests | `TT-PERMKEY-UNIQUE` + `TT-PERMKEY-PATTERN` + `TT-PERMKEY-MUTATION-COVERAGE` + `TT-PERMKEY-APPEND-ONLY` green |
| **P3 — RBAC role map + predicate (allow/deny per mutation family)** | Normalize prototype roles/grants; pure `can()` predicate; advisory-only posture documented | `rbac.ts` (role→permission map + `can()`), allow/deny matrix tests for ALL 6 mutation families + read families | `TT-RBAC-ALLOW-*` + `TT-RBAC-DENY-*` (every mutation family) + `TT-RBAC-ADVISORY-NOTE` green |
| **P4 — Admin API-boundary contract (mockable transport) + secret invariant** | Typed admin API contract: read + mutation shapes, server-side re-auth rule, fail-closed errors, mockable client; reassert no-secret/no-service-role-in-browser | `adminApi.ts` (typed `AdminApiClient` interface + mock impl), `api.md` boundary section, server-authoritative + fail-closed semantics, no-secret guard re-run | `TT-API-CONTRACT-SHAPE` + `TT-API-FAILCLOSED` + `TT-API-SERVER-AUTHORITATIVE` + `TT-NO-SECRET-SRC`/`TT-NO-SECRET-BUNDLE` green |

> Phase rationale: P1 (contracts) before P2/P3 (permission layer) before P4 (API boundary) mirrors the
> manifest's "contracts before UI data" + "RBAC/data contracts before any mutation". Each phase is
> independently verifiable by unit tests with a mockable transport — no server deploy required for "green".

---

## 5. Risks + open questions

### Risks (carry into review)
- **R1 (HIGH) — browser-as-security-boundary regression.** If a later row treats the browser `can()` as the
  gate, the secret-safety + server-enforcement invariants break. → Mitigation: `api.md` states **server is
  authoritative; browser advisory only** as a hard invariant; `TT-API-SERVER-AUTHORITATIVE` + the continued
  `TT-NO-SECRET-*` guards encode it; the API contract's mutation methods are documented as re-authorizing
  server-side.
- **R2 (HIGH) — permission-key churn.** If keys are renamed/reused, every dependent row (#3–#5) and any
  future audit trail breaks. → Mitigation: `as const` frozen catalog + `TT-PERMKEY-APPEND-ONLY` + dotted
  naming (D2) + documented append-only rule.
- **R3 (MED) — read-model contract drift from slice #1.** If P1 re-declares shapes instead of promoting the
  existing `adapters/types.ts`, rows #3–#5 could target a divergent contract. → Mitigation: P1 promotes the
  *existing* interfaces as the canonical contract (re-export / single source), with a stability test.
- **R4 (MED) — scope creep into rows #3–#5.** Temptation to wire a real transport or real claim. →
  Mitigation: non-goals explicit; transport is a **mock** `AdminApiClient`; command adapters stay no-op;
  "green = contracts + tests, no server deploy" stated in design assumptions.
- **R5 (LOW) — D3 misclassification.** If anyone later extends the shared session package for the admin
  claim, the row silently becomes web-line + D3. → Mitigation: A2 keeps it W0; the design snapshot flags the
  D3 trigger explicitly so any deviation is caught.
- **R6 (LOW) — RBAC ⇄ read-model coupling.** The Roles page already exposes a `RolesReadModel.rbacMatrix()`
  (display). Row #2 must keep the *enforcement* RBAC (authz module) distinct from the *display* RBAC
  (read-model), so the display can show the same data without becoming the enforcement source. → Mitigation:
  the authz catalog/predicate is the source of truth; the read-model may *derive its display from it*, never
  the reverse; documented in `design.md`.

### Open questions (for feature-review / resolved-with-recommendation)
- **OQ-A (resolved, confirm):** real admin-claim source = **A2** (admin-side, read JWT custom claim,
  W0, no shared-package change). Confirm the operator preference holds (keep `@repo/web-auth-device-session`
  unburdened).
- **OQ-B (resolved, confirm):** RBAC enforced **server-side (C2)**; browser advisory. Confirm the contract
  documents the server as authoritative and that row #2 ships **no real server** (mock transport).
- **OQ-C (defer to row, note):** the **exact JWT custom-claim key** + whether the production hook nests it
  under `app_metadata.<key>` vs a top-level `user_role` claim is a server-config detail finalized when a
  real backend lands (row #3+). Row #2 fixes the **predicate seam + key name placeholder**, not the live
  hook config. Note as deferred.
- **OQ-D (defer to row, note):** the concrete server runtime (Supabase Edge Function vs another service-role
  API host) + provider secret-handle storage shape (OQ4 from slice #1) is finalized in rows #4. Row #2 fixes
  only the **boundary invariant** (no secret in browser) + the **mockable client interface**. Note as deferred.
- **OQ-E (out of scope, note):** any proposal to persist an admin read model cross-device is ADR-0013 §D4 /
  the PAUSED `sync` line. Explicitly **out of scope** for row #2; if it ever arises it is a separate `sync`
  feature. Note as deferred.

---

## 6. Boundary / D3 classification

- **D3 = W0 (web-only, admin-side only).** No shared `@repo/*` seam is modified (A2 keeps
  `@repo/web-auth-device-session` unchanged; all new modules are admin-local under `apps/admin/src/`).
  No `dev` promotion.
- **No new `@repo/core/src/events` typed events; no Tauri commands** — admin is browser-side; row #2 is
  contract/permission code only. Any deviation (e.g. a forced shared-package change for the admin claim)
  would flip this to web-line + D3 (W1+) and MUST be flagged before proceeding.
- **No `syncScope` entity** added; no cross-device persistence (ADR-0013 §D4 / `sync` line stays out of scope).

---

## 7. Sources

- [Custom Claims & Role-based Access Control (RBAC) — Supabase Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Custom Access Token Hook — Supabase Docs](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [Token Security and Row Level Security — Supabase Docs](https://supabase.com/docs/guides/auth/oauth-server/token-security)
- [Row Level Security — Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Edge Functions: how to authorize the user AND bypass RLS? — supabase Discussion #15631](https://github.com/orgs/supabase/discussions/15631)
- [Supabase RLS Best Practices: Production Patterns for Secure Multi-Tenant Apps — makerkit.dev](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices)
- [Why is my service role key client getting RLS errors? — Supabase Troubleshooting](https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z)
