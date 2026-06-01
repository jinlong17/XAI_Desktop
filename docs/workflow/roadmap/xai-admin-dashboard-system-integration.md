# Roadmap Manifest — xai-admin-dashboard-system-integration

- Roadmap Source: `docs/prototypes/admin-dashboard/README.md` + `docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md`
- Surface: Admin Dashboard / Control Plane (`codex/admin/<feature>`)
- Current Authority: ADR-0013 D1 marks admin-dashboard as **PROPOSED** and prototype-only.
- Init Path: roadmap; each row is a separate feature-sized slice.
- Generated: 2026-05-31
- Default Automation Mode: **D-Codex**
- Default Verify Cross-vendor: **yes**
- Governance: no production code should receive service-role credentials in the browser; all admin mutations require RBAC and audit logging.

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-admin-dashboard-shell | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §4.1 | — | — | PENDING | D-Codex | yes | — | Create the isolated admin surface decision and shell. Wire admin route guard through `@repo/web-auth-device-session`, admin-claim negative tests, and typed mock adapters that preserve the current prototype pages without production data access. |
| 2 | xai-admin-data-contracts-rbac | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §2-§3 | xai-admin-dashboard-shell | hard | PENDING | D-Codex | yes | — | Define admin read models, permission keys, RBAC enforcement contract, and server/API boundary. No UI mutation may ship before this row is green. |
| 3 | xai-admin-users-orgs-billing | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §2 | xai-admin-data-contracts-rbac | hard | PENDING | D-Codex | yes | — | Connect Users, Organizations, and Billing pages to typed adapters/endpoints. Keep billing mutations gated until webhook-backed Stripe state exists. |
| 4 | xai-admin-feature-ai-provider-control | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §2 | xai-admin-data-contracts-rbac | hard | PENDING | D-Codex | yes | — | Connect feature flags, entitlements, AI quota, provider secret handles, and model routing. Browser must receive secret handles/status only, never provider keys. |
| 5 | xai-admin-audit-ops-queue | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §2-§4 | xai-admin-data-contracts-rbac | hard | PENDING | D-Codex | yes | — | Build the immutable admin audit log and overview ops queue. Every guarded mutation must append actor/action/target/IP/result. |
| 6 | xai-admin-deploy-observability | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §4.6 | xai-admin-audit-ops-queue | hard | PENDING | D-Codex | yes | — | Add deployment isolation, CSP/env checks, observability, manual browser smoke, and release/operator runbook before promoting beyond prototype. |

## Implementation Order

1. Start with `xai-admin-dashboard-shell`; it proves the surface boundary without granting real admin power.
2. Complete RBAC/data contracts before any destructive mutation.
3. Integrate read-heavy pages before write-heavy pages.
4. Add mutation flows only when the audit append contract is covered by tests.
5. Keep this roadmap out of `dev` promotion until an operator explicitly activates the admin-dashboard line.

## Verification Gates

| Gate | Required evidence |
|---|---|
| Route isolation | Non-admin users cannot load Admin Dashboard; admin users can. |
| Contract coverage | Every UI page reads through a typed adapter, not inline mock globals. |
| Secret safety | No service-role token or provider secret can appear in browser bundles. |
| RBAC | Permission predicates have allow/deny tests for every mutation family. |
| Audit | Every admin mutation appends an immutable audit event. |
| Browser smoke | Tables, filters, drawers, dialogs, type-to-confirm, focus traps, and mobile layout pass manual smoke. |
