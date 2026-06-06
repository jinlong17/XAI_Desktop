# Roadmap Manifest — xai-admin-dashboard-system-integration

- Roadmap Source: `docs/prototypes/admin-dashboard/README.md` + `docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md`
- Surface: Admin Dashboard / Control Plane (`codex/admin/<feature>`)
- Current Authority: ADR-0013 D1 marks admin-dashboard as **PROPOSED** and prototype-only.
- Init Path: roadmap; each row is a separate feature-sized slice.
- Generated: 2026-05-31
- Default Automation Mode: **D-Codex**
- Default Verify Cross-vendor: **yes**
- Governance: no production code should receive service-role credentials in the browser; all admin mutations require RBAC and audit logging.
- **Roadmap Completion**: ALL 6 ROWS SHIPPED — 2026-06-06. Branch `claude/frosty-nash-c4bf16` pushed. PR/merge target + promotion-beyond-prototype remain DEFERRED operator governance decisions (see row #6 release-operator-runbook.md §5 Promotion Gate + ADR-0013 §D2/§D5).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-admin-dashboard-shell | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §4.1 | — | — | SHIPPED | D-Codex | yes | 2026-06-06 | Create the isolated admin surface decision and shell. Wire admin route guard through `@repo/web-auth-device-session`, admin-claim negative tests, and typed mock adapters that preserve the current prototype pages without production data access. |
| 2 | xai-admin-data-contracts-rbac | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §2-§3 | xai-admin-dashboard-shell | hard | SHIPPED | D-Codex | yes | 2026-06-06 | Define admin read models, permission keys, RBAC enforcement contract, and server/API boundary. No UI mutation may ship before this row is green. |
| 3 | xai-admin-users-orgs-billing | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §2 | xai-admin-data-contracts-rbac | hard | SHIPPED | D-Codex | yes | 2026-06-06 | Connect Users, Organizations, and Billing pages to typed adapters/endpoints. Keep billing mutations gated until webhook-backed Stripe state exists. |
| 4 | xai-admin-feature-ai-provider-control | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §2 | xai-admin-data-contracts-rbac | hard | SHIPPED | D-Codex | yes | 2026-06-06 | Connect feature flags, entitlements, AI quota, provider secret handles, and model routing. Browser must receive secret handles/status only, never provider keys. |
| 5 | xai-admin-audit-ops-queue | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §2-§4 | xai-admin-data-contracts-rbac | hard | SHIPPED | D-Codex | yes | 2026-06-06 | Build the immutable admin audit log and overview ops queue. Every guarded mutation must append actor/action/target/IP/result. |
| 6 | xai-admin-deploy-observability | docs/prototypes/admin-dashboard/INTEGRATION_PLAN.md §4.6 | xai-admin-audit-ops-queue | hard | SHIPPED | D-Codex | yes | 2026-06-06 | Add deployment isolation, CSP/env checks, observability, manual browser smoke, and release/operator runbook before promoting beyond prototype. FINAL ROW — roadmap complete. |

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

## Deferred Operator Actions (post-roadmap-ship)

The following are NOT performed by any ship agent and require explicit operator confirmation:

- **PR/merge target**: branch `claude/frosty-nash-c4bf16` is NOT merged into `main`/`web`/`dev`. A separate operator step is required.
- **Promotion beyond prototype**: ADR-0013 §D2/§D5 governs. See row #6 `release-operator-runbook.md` §5.
- **Server-side secret setup**: Cloudflare Pages admin-scoped CI secret + any real telemetry DSN (currently no-op). See runbook §1.
- **Branch topology creation**: `desktop-next` / `desktop-plugin-next` / `release/*` are DEFINED but not yet created.
- **Manual browser smoke**: `manual-smoke-checklist.md` cells are filled on real hardware by a human.
