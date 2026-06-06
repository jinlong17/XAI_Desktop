# design.md — xai-admin-data-contracts-rbac

> Decision snapshot ONLY (discovery detail lives in the review doc, not here).
> Surface: `apps/admin/` (the SHIPPED isolated Web-line app from slice #1 — this row adds CONTRACTS, not pages).
> Roadmap row **#2 of 6** of `xai-admin-dashboard-system-integration`. Hard dep row #1 = SHIPPED.
> Distinct landing (does NOT overwrite slice #1's `apps/admin/docs/{design,api,test,dev_log}.md`).

## Decision snapshot

| Field | Value |
|---|---|
| **Selected Option (real admin-claim source, OQ3)** | **A2** — dedicated admin-side authz contract that consumes the read-only session; reads the production admin role from the JWT custom claim (`session.user.app_metadata.<adminClaimKey>`). `@repo/web-auth-device-session` is **NOT modified**. Slice #1's mock `AdminClaimPredicate` graduates in place (same seam, fail-closed). |
| **Selected Option (where RBAC lives)** | **B2** — admin-app-local modules under `apps/admin/src/authz/` (mirrors slice #1's `apps/admin/src/auth/` precedent); NOT a shared `packages/*` package. |
| **Selected Option (where RBAC is enforced)** | **C2** — **server-enforced; browser advisory only.** The admin API (Edge Function / service-role API) re-validates the JWT admin role server-side before any privileged op; the browser `can()` only hides/disables UI and is **never** the security boundary. |
| **Selected Option (permission-key scheme)** | **D2** — immutable, **append-only**, dotted namespaced string keys (e.g. `admin.users.ban`), frozen `as const`; seeded from the prototype RBAC matrix. Never renumbered/reused. |
| **Selected Option (API boundary form)** | Typed **mockable transport seam** — an injectable `AdminApiClient` interface + a mock impl. **No real server deployed this row.** Real wiring + real mutations = rows #3–#5. |
| **Review Doc Path** | `docs/reviews/xai-admin-data-contracts-rbac/20260606-discovery-review.md` |
| **Review Date / Version** | 2026-06-06 / v1 (discovery) |
| **Product module** | `admin` (#6) · operator-activated whole line 2026-06-06 · **row #2 only** (preserves manifest dep order for #3–#6) |
| **Branch convention** | `codex/admin/<feature>` |
| **D3 classification** | **W0 (web-only, admin-side only)** — no shared `@repo/*` seam modified; no `dev` promotion |
| **Cross-window contract impact** | NONE — no new `@repo/core/src/events` typed events; no Tauri command changes (browser-side, contract-only) |
| **syncScope** | NONE — no admin entity proposed for cross-device persistence (ADR-0013 §D4 / `sync` line out of scope) |

## ADR-lite records (recorded here per slice-#1 precedent; no standalone ADR infra)

- **ADR-lite #1 (real admin-claim source — A2).** The production admin claim/role does **NOT** extend the
  Stable, user-facing `@repo/web-auth-device-session` package. Rationale: that package is shared and flows
  to the App, so adding an admin-only field would (a) burden every consumer with an admin concern and
  (b) likely trigger a D3 (W1+) classification for an admin-only need. Instead, an **admin-side authz
  contract** reads the admin role from the JWT custom claim that the session **already exposes** on
  `session.user.app_metadata` (an arbitrary record). **Evidence:** Supabase's canonical RBAC mechanism is a
  **Custom Access Token Auth Hook** that injects the role into the issued JWT (under `claims.app_metadata`
  per the hook docs, or as a `user_role` claim per the RBAC guide) — so the role rides in the token and is
  decodable on the existing `session` object. Slice #1's mock `mockAdminClaimPredicate` **already reads
  `session.user.app_metadata.xai_admin === true`** defensively, so graduation is implementation-only behind
  the unchanged `AdminClaimPredicate` seam, still **fail-closed**, still pure. Keeps the row **W0**.
  *If* a future requirement forces a shared-package change, that is a separate **web-line + D3** decision —
  flagged, NOT taken here.
- **ADR-lite #2 (server-enforced RBAC; browser advisory — C2).** Browser permission predicates are
  **advisory/UX only** (hide/disable controls) and are **NEVER** the security boundary. The authoritative
  RBAC check runs in the admin **Edge Function / service-role API**, which follows Supabase's documented
  pattern: **extract JWT → `getUser()` validate → check admin role → only then use the service_role client**
  (the service-role client must not carry the user JWT; RLS remains defense-in-depth). **Evidence:** Supabase
  docs — a service_role client **always bypasses RLS**; Edge Functions should validate user authorization
  separately before using service_role. A **single shared permission-key catalog** is imported by the browser
  (for UX) and re-checked server-side (authoritative) so the two predicate sites cannot diverge. The browser
  **never** receives service-role credentials or provider secret material (slice #1 invariant, re-asserted).
- **ADR-lite #3 (permission keys — D2, immutable append-only dotted strings).** Keys are stable dotted,
  namespaced identifiers (e.g. `admin.users.ban`, `admin.features.rollout`), frozen `as const`, and
  **append-only** (never renamed, renumbered, or reused) so dependent rows #3–#5 and any future audit trail
  stay stable. Matches the project's `entityType` dotted-slug convention precedent (`^[a-z]+\.[a-z_]+$` in
  `core-data`). The prototype RBAC matrix (5 roles `super/ops/support/finance/audit` × 10 permission rows) is
  the **seed**, normalized into canonical keys; every one of the 6 destructive command families maps to
  exactly one key.

## Frozen assumptions (lock at plan acceptance — change requires Revise or a follow-up row)

1. **Row #2 is CONTRACT-ONLY and fully testable WITHOUT a live backend.** "Green" = read-model contract +
   permission keys + RBAC predicates + API-boundary contract, all covered by unit tests, with the transport
   **mockable**. It does **NOT** require deploying a real server. Real per-page wiring + real mutations =
   rows #3–#5.
2. **All new code is admin-local under `apps/admin/src/`** (`authz/` for keys+RBAC, `contracts/` for the
   read-model contract + API client interface). No shared `packages/*` package; no logic in
   `packages/core`/`apps/web`.
3. **`@repo/web-auth-device-session` is NOT modified** (A2). The admin claim is derived admin-side from the
   read-only session; slice #1's `AdminClaimPredicate` seam is the graduation point.
4. **RBAC is server-authoritative; browser advisory** (C2). The browser `can()` only affects UI; the API
   contract documents server-side re-authorization as the security boundary.
5. **Permission keys are immutable + append-only dotted strings** (D2), frozen `as const`. Every mutation
   family (`banUser`, `bulkBan`, `setFeatureRollout`, `transferOwnership`, `setProviderRouting`, `setQuota`)
   maps to exactly one key.
6. **Read-model contract = promotion of slice #1's `adapters/types.ts` interfaces** to the canonical, frozen
   contract (single source, not a re-declaration), plus a **live/mock/deferred** annotation table per page.
   No UI change; no page re-port.
7. **API boundary = typed mockable `AdminApiClient`** (interface + mock impl). The 6 mutation methods are
   documented as **server-re-authorizing + fail-closed**; slice #1's no-op command adapters may later target
   this client. **No real server, no real mutation** this row.
8. **No service-role credentials / provider secret material in the browser** (hard invariant from slice #1),
   re-asserted by `TT-NO-SECRET-SRC` + `TT-NO-SECRET-BUNDLE` over `src/` + `dist/`. Providers stay key-status-only.
9. **No `syncScope` entity / no cross-device persistence** of any admin read model (ADR-0013 §D4 / `sync`
   line out of scope). **No Tweaks panel.** **No new typed events; no Tauri changes.** **D3 = W0.**
10. **Zero new runtime UI dependencies** expected (contract-heavy row). Headless `@tanstack/react-table` v8
    remains the pre-approved table upgrade path behind slice #1's `DataTable` seam if ever needed (not this row);
    record if added.

## Dependency overview

| Direction | Dependency | State | Mode this row |
|---|---|---|---|
| Upstream (consumes) | `@repo/web-auth-device-session` (`useWebAuthSession` → `{ state, session }`) | Stable | **Read-only, UNCHANGED**; admin claim derived admin-side from `session.user.app_metadata` |
| Upstream (consumes) | slice #1 `apps/admin/src/adapters/types.ts` (10 read-model interfaces) + `auth/adminClaim.ts` seam | SHIPPED (this repo) | Promoted to canonical contract; predicate seam reused for claim graduation |
| Upstream (consumes) | slice #1 `apps/admin/src/adapters/commands.ts` (6 no-op command families) | SHIPPED (this repo) | Their input shapes seed the permission-key→mutation map + API mutation contract |
| Design authority | prototype `docs/prototypes/admin-dashboard/` (`ROLES`/`RBAC` matrix) | n/a | Seed for permission keys + role→permission grant map |
| Concept-only (mocked) | `@repo/plugin-web-ai-chat` (provider secret), `@repo/plugin-web-settings-rest` (billing), `audit-log-integrity` (hash chain) | Stable/Shipped | NOT wired; provider/billing/audit are rows #4/#3/#5 — row #2 only names the boundary/obligation |

## Directory shape (planned — additive to the SHIPPED slice-#1 tree)

```
apps/admin/
  src/
    authz/                       # NEW (row #2) — admin-local RBAC, mirrors auth/ precedent
      permissionKeys.ts          # immutable append-only dotted keys (as const) + command→key map
      rbac.ts                    # role→permission grant map (from prototype) + pure can() predicate (advisory)
      permissionKeys.test.ts     # TT-PERMKEY-UNIQUE / PATTERN / MUTATION-COVERAGE / APPEND-ONLY
      rbac.test.ts               # TT-RBAC-ALLOW-* / DENY-* (every mutation family) + advisory-note
    contracts/                   # NEW (row #2) — canonical contracts (no UI)
      readModels.ts              # canonical re-export/typed surface of adapters/types.ts read models
      adminApi.ts                # typed AdminApiClient interface (reads + 6 mutations) + mock impl
      readModels.test.ts         # TT-READMODEL-CONTRACT / ANNOTATION (stability + each-page-maps)
      adminApi.test.ts           # TT-API-CONTRACT-SHAPE / FAILCLOSED / SERVER-AUTHORITATIVE
    auth/
      adminClaim.ts              # UNCHANGED seam; design.md documents the A2 graduation swap point
  docs/
    data-contracts-rbac/         # THIS doc set (design/api/test/dev_log) — distinct from slice #1's docs/
```

> Note: the `apps/admin/src/__tests__/no-secret*.test.ts` guards from slice #1 are re-run in P4 (they already
> scan all of `src/` + `dist/`, so the new `authz/`+`contracts/` modules are covered automatically).
