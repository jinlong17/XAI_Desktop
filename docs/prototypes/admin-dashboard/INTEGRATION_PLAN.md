# Admin Dashboard System Integration Plan

> Status: integration intake, 2026-05-31. This document turns the
> single-file `docs/prototypes/admin-dashboard/index.html` prototype into an
> implementation-ready system plan. It does not authorize production code by
> itself; the implementation should run through Workflow V2.

## 1. Existing Frontend Surface

The prototype is a high-fidelity, single-file admin control plane. It currently
contains mock data and local UI state only.

| Page / capability | Current UI evidence | Production role |
|---|---|---|
| Overview dashboard | KPI cards, ops queue, growth/feature/AI/revenue tabs, usage charts | Operator triage: what needs attention now |
| User management | saved views, search/filter chips, bulk actions, user detail drawer/full-page mode | Account support, risk review, user lifecycle actions |
| Organizations / spaces | tenant table, seat usage, dunning/overage status, owner transfer confirmation | Multi-tenant account administration |
| Feature management | global feature status, rollout slider, per-plan quota fields, dependency view | Feature flag, entitlement, rollout, and quota control |
| AI usage & quota | plan quota policy cards, top spenders, warning/over-limit states | AI cost control and abuse prevention |
| Provider configuration | provider cards, key status, model-by-plan matrix, tiered routing policy | LLM provider routing and model entitlement configuration |
| Roles & permissions | role cards plus RBAC matrix | Admin console authorization and least-privilege enforcement |
| Subscription / billing | MRR/ARPPU, plan distribution, transaction list | Finance and customer-plan operations |
| Audit log | immutable-looking table, type/range filters | Compliance trail for every admin action |
| System settings | organization info, 2FA/session/IP/SSO controls, webhooks | Control-plane security and notifications |

The current prototype also includes a visual tweaks panel. That panel is useful
for design review, but it should not ship as a production admin setting unless a
separate operator-preference requirement is approved.

## 2. System Integration Matrix

| UI area | Required system data / action | Likely owner now | Current availability | Gap before production |
|---|---|---|---|---|
| Admin shell and route guard | admin-authenticated session, device identity, admin claim, revoked-device handling | `@repo/web-auth-device-session`, Supabase auth | Stable browser session package exists; admin claims not modeled | Create isolated admin surface and admin-only route guard |
| Overview KPI + ops queue | active users, risky logins, tickets, billing failures, over-quota orgs, high-cost accounts | new admin aggregation layer | Not available as a consolidated endpoint | Define read models and queue severity contract |
| Users | accounts, emails, status, MFA, roles, last login, cost, risk flags, ban/unban | auth/session + future admin API | user session package exists; admin user listing/actions absent | Service-role API with RLS-safe admin authorization |
| Organizations | orgs, memberships, seats, overage/dunning, owner transfer | account/sync backend, billing | org model not confirmed in Web runtime | Add org/member schema or adapter before UI wiring |
| Feature flags | feature catalog, status, rollout %, audience rules, dependencies | Web settings/features panel concepts + new server authority | client-side feature prefs exist; server feature flags absent | Server-side flag/entitlement service and audit entries |
| Entitlements / quotas | plan limits for features and AI models | billing + AI config | local settings and prototypes only | Canonical entitlement table and enforcement points |
| AI provider config | provider secret handles, model allow matrix, routing strategy, cost caps | `@repo/plugin-web-ai-chat` + secret store concepts | user-level AI key storage exists; admin provider secrets absent | Move provider config to server-side encrypted secret handles |
| AI usage | token counts, provider/model costs, overage status | AI adapter + telemetry pipeline | no production usage ledger for admin | Usage ledger and cost aggregation jobs |
| Billing | subscriptions, invoices, dunning, plan changes | Stripe payment-link stub in settings-rest | user-facing stub only; no admin billing API | Stripe webhook/state sync and admin read/actions |
| RBAC | roles, permissions, admin action matrix | new admin auth package or backend policy | only prototype matrix | Define immutable permission keys and server enforcement |
| Audit log | append-only admin action events, actor, target, IP, result | `audit-log-integrity` precedent | sync audit exists; admin audit absent | Separate admin audit table/hash chain and UI query endpoint |
| System settings | SSO, session timeout, IP allowlist, webhook endpoints | new admin settings service | not available | Versioned settings schema with guarded mutations |

Dependency rule: any owner row that is `In-Dev` in `docs/PLUGIN_MAP.md` must be
mocked or wrapped behind an admin-specific contract until it is Stable or the
admin roadmap explicitly owns the production contract.

## 3. Recommended System Boundary

Create Admin Dashboard as an isolated control-plane surface, not as a normal
user Web Console module.

| Boundary | Recommendation |
|---|---|
| App surface | Prefer `apps/admin/` or a clearly isolated `/admin` build target with separate route guard, CSP, env, and deploy controls. Do not mount it into ordinary `apps/web` module rail. |
| Frontend package | Port prototype UI into a typed React admin package or app-local modules. Keep tables, filters, drawers, confirmations, and matrices as feature components. |
| Backend access | Use server/admin APIs only. The browser must never receive service-role credentials or provider secret material. |
| Data contracts | Introduce typed admin read models for each page before replacing mock arrays. |
| Mutations | Every mutation must have RBAC check, type-to-confirm where destructive, audit append, and explicit success/failure state. |
| Audit | Admin audit is append-only and separate from user sync audit, while reusing the hash-chain precedent where practical. |
| Branching | Use `codex/admin/<feature>` short branches. Keep the line Proposed until an operator confirms priority and package/deploy target. |

## 4. Development Plan

1. **Admin shell + auth gate**
   - Decide `apps/admin/` vs isolated `/admin` route.
   - Wire admin-only session guard using `@repo/web-auth-device-session`.
   - Add an admin claim/role check contract and negative tests for non-admin users.

2. **Contracts before UI data**
   - Define read models for overview queue, users, orgs, feature flags, AI usage,
     provider config, billing, RBAC, audit, and system settings.
   - Document which values are live, mock, or deferred.

3. **Read-only dashboard integration**
   - Port the prototype pages with typed mock adapters first.
   - Replace each mock table/chart with one contract-backed adapter in small
     phases, starting with overview + users because they validate the shell.

4. **Guarded mutations**
   - Implement low-risk actions first: filters, saved views, read-only drilldown.
   - Add high-risk mutations only after RBAC and audit are green: ban user,
     feature rollout changes, owner transfer, provider routing, quota changes.

5. **Billing / AI provider hardening**
   - Require Stripe webhook-backed billing state before exposing admin billing
     mutations.
   - Store provider credentials as server-side encrypted secret handles, never in
     browser localStorage or user IndexedDB.

6. **Verification gates**
   - Unit test every data adapter and permission predicate.
   - Integration test admin route denial, admin allow, audit append on mutation,
     and RLS/service-role boundaries.
   - Manual browser smoke for responsive tables, drawers, type-to-confirm flows,
     keyboard focus, and destructive action confirmation.

## 5. Suggested Workflow Entry

Use the new roadmap manifest:

```text
/xai-roadmap-loop mode: init
Roadmap Source: docs/workflow/roadmap/xai-admin-dashboard-system-integration.md
Verify Cross-vendor: yes
```
For a single-feature start, use:

```text
/xai-feature-full-loop
Requirement: Implement the first Admin Dashboard system integration slice: isolated admin shell, admin route guard, and typed mock adapters for the existing prototype pages.
Suggested Feature Slug: xai-admin-dashboard-shell
Automation Mode: D-Codex
Verify Cross-vendor: yes
```
