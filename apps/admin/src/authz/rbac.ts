/**
 * apps/admin/src/authz/rbac.ts — admin RBAC role map + pure predicate (row #2, P3).
 *
 * Normalizes the prototype role/grant matrix into a typed role→permission map and exposes
 * pure `can()` / `canMutate()` predicates.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────────────┐
 * │ SECURITY POSTURE — C2 (ADR-lite #2): SERVER-AUTHORITATIVE; BROWSER ADVISORY ONLY.     │
 * │                                                                                       │
 * │ The browser predicate here decides ONLY whether to render/enable a control (UX). It   │
 * │ is NEVER the security boundary. The authoritative RBAC decision is made SERVER-SIDE    │
 * │ by the admin API (contracts/adminApi.ts §5.1): extract JWT → validate session →       │
 * │ check the required permission key server-side → only then use a service-role client.  │
 * │ A browser bypass of `can()` MUST NOT be able to cause a privileged effect — because    │
 * │ the server re-authorizes and the browser holds NO service-role credential.            │
 * └─────────────────────────────────────────────────────────────────────────────────────┘
 *
 * Boundary (design.md, W0): contract-only, browser-side; pure functions; no I/O, no secret.
 *
 * Test strategy: apps/admin/docs/data-contracts-rbac/test.md §1
 * (TT-RBAC-ALLOW-* / DENY-* / READ-GRANTS / FAILCLOSED / ADVISORY-NOTE).
 */
import {
  PERMISSION_KEYS,
  MUTATION_PERMISSION,
  type PermissionKey,
  type MutationFamily,
} from "./permissionKeys";

/** Admin roles, normalized from the prototype `ROLES` (super/ops/support/finance/audit). */
export type AdminRole = "super" | "ops" | "support" | "finance" | "audit";

/** Ordered role list (for catalog-wide checks / display derivation). */
export const ADMIN_ROLES: readonly AdminRole[] = [
  "super",
  "ops",
  "support",
  "finance",
  "audit",
] as const;

const K = PERMISSION_KEYS;

/**
 * Role → permission grant map, normalized 1:1 from the prototype `RBAC` matrix
 * (docs/prototypes/admin-dashboard, mirrored in ../fixtures `RBAC`):
 *
 *   查看看板            → super, ops, support, finance, audit   (VIEW_DASHBOARD)
 *   用户管理            → super, ops, support                   (USER_MANAGE)
 *   封禁用户            → super, ops                            (USER_BAN)
 *   模拟登录            → super, support                        (USER_IMPERSONATE)
 *   功能上下线 / 灰度    → super, ops                            (FEATURE_ROLLOUT)
 *   配额调整            → super, ops                            (QUOTA_SET)
 *   Provider / 模型配置 → super                                 (PROVIDER_ROUTING)
 *   查看审计日志        → super, audit                          (VIEW_AUDIT)
 *   计费管理            → super, finance                        (BILLING_MANAGE)
 *   角色与权限管理      → super                                 (ROLE_MANAGE)
 *
 * REC-1: `ORG_TRANSFER_OWNER` is SYNTHESIZED (no prototype matrix row) → granted SUPER-ONLY
 * here as the safe, fail-closed default. It is NOT a seeded grant.
 *
 * `super` is defined as the FULL catalog so any future appended key is automatically
 * granted to super (the all-powerful role) — append-only safety.
 */
export const ROLE_GRANTS: Record<AdminRole, ReadonlySet<PermissionKey>> = {
  // super = ALL keys (full catalog); includes the synthesized ORG_TRANSFER_OWNER + any future key.
  super: new Set<PermissionKey>(Object.values(PERMISSION_KEYS)),
  ops: new Set<PermissionKey>([
    K.VIEW_DASHBOARD,
    K.USER_MANAGE,
    K.USER_BAN,
    K.FEATURE_ROLLOUT,
    K.QUOTA_SET,
  ]),
  support: new Set<PermissionKey>([
    K.VIEW_DASHBOARD,
    K.USER_MANAGE,
    K.USER_IMPERSONATE,
  ]),
  finance: new Set<PermissionKey>([K.VIEW_DASHBOARD, K.BILLING_MANAGE]),
  // read-only role.
  audit: new Set<PermissionKey>([K.VIEW_DASHBOARD, K.VIEW_AUDIT]),
};

/**
 * Pure RBAC check — does `role` hold `key`?
 *
 * ADVISORY/UX ONLY — NOT the security boundary (the server re-checks; see the posture
 * banner above). Fails CLOSED on null/undefined/unknown role; never throws; no I/O.
 */
export function can(role: AdminRole | null | undefined, key: PermissionKey): boolean {
  if (!role) return false; // fail closed: no role → no grant
  const grants = ROLE_GRANTS[role as AdminRole];
  if (!grants) return false; // fail closed: unknown role → no grant
  return grants.has(key);
}

/**
 * Pure RBAC check for a mutation family — resolves the required key via
 * `MUTATION_PERMISSION` then defers to `can()`. ADVISORY/UX only; fails closed.
 */
export function canMutate(
  role: AdminRole | null | undefined,
  family: MutationFamily,
): boolean {
  const key = MUTATION_PERMISSION[family];
  return can(role, key);
}

/**
 * Documented advisory invariant, surfaced as a value so TT-RBAC-ADVISORY-NOTE can assert
 * the module names the server (not the browser) as the authoritative RBAC boundary. This is
 * a guard against R1 regressing into "browser-as-security-boundary".
 */
export const RBAC_ADVISORY_NOTE =
  "Browser RBAC predicates (can/canMutate) are ADVISORY/UX only and are NEVER the security " +
  "boundary. The admin API re-authorizes server-side (extract JWT → validate session → check " +
  "the permission key → service-role client) before any privileged effect. The browser holds " +
  "no service-role credential, so bypassing can() cannot cause a privileged mutation.";

/** Server-authoritative posture flag (documentation/contract assertion target). */
export const RBAC_SERVER_AUTHORITATIVE = true as const;
