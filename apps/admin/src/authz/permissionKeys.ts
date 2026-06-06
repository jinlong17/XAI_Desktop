/**
 * apps/admin/src/authz/permissionKeys.ts — immutable admin permission-key catalog (row #2, P2).
 *
 * The single source of truth for "what privileged things exist" in the admin surface.
 * Used by BOTH the browser (advisory `can()` — UX) and the server (authoritative re-check
 * in rows #3–#5) so the two predicate sites cannot diverge (api.md §3, ADR-lite #3 / D2).
 *
 * INVARIANT — IMMUTABLE + APPEND-ONLY (R2): keys are stable dotted, namespaced identifiers,
 * frozen `as const`. NEVER rename, renumber, reorder-for-meaning, or REUSE a key — dependent
 * rows #3–#5 and any future audit trail bind to these exact strings. New capabilities may only
 * be ADDED (append-only). The dotted shape matches the project's `entityType` slug convention
 * (`core-data`: `^[a-z]+\.[a-z_]+$`), extended here to allow deeper namespacing.
 *
 * SEED: normalized 1:1 from the prototype RBAC matrix
 * (docs/prototypes/admin-dashboard `ROLES`/`PERMS`, mirrored in ../fixtures `ROLES`/`RBAC`)
 * — 10 prototype permission rows → 11 keys. The 11th, ORG_TRANSFER_OWNER, is SYNTHESIZED
 * (see note below).
 *
 * Boundary (design.md, W0): contract-only, browser-side; pure data; no secret; no I/O.
 *
 * Test strategy: apps/admin/docs/data-contracts-rbac/test.md §1
 * (TT-PERMKEY-UNIQUE / PATTERN / MUTATION-COVERAGE / APPEND-ONLY).
 */
import type { AdminCommandAdapter } from "../adapters/types";

/**
 * Immutable, APPEND-ONLY permission-key catalog. Dotted namespaced lowercase strings.
 *
 * Each entry maps a stable enum-ident → its wire key. The 10 prototype `PERMS` rows map
 * directly; `ORG_TRANSFER_OWNER` is synthesized (see the REC-1 note on that line).
 */
export const PERMISSION_KEYS = {
  // reads / views
  VIEW_DASHBOARD: "admin.dashboard.view", // prototype: 查看看板
  VIEW_AUDIT: "admin.audit.view", // prototype: 查看审计日志
  // user lifecycle
  USER_MANAGE: "admin.users.manage", // prototype: 用户管理
  USER_BAN: "admin.users.ban", // prototype: 封禁用户
  USER_IMPERSONATE: "admin.users.impersonate", // prototype: 模拟登录
  // feature / quota
  FEATURE_ROLLOUT: "admin.features.rollout", // prototype: 功能上下线 / 灰度
  QUOTA_SET: "admin.quota.set", // prototype: 配额调整
  // org
  // REC-1 (feature-review): SYNTHESIZED key — the prototype HAS the `transferOwnership`
  // destructive action (转移所有权, type-to-confirm "TRANSFER") and slice #1 has it as a
  // no-op command, but the prototype RBAC matrix has NO matching permission row. We mint
  // this key here and grant it SUPER-ONLY by default (the safe, fail-closed choice) in
  // ../rbac.ts. It is NOT a seeded grant — see TT-RBAC-ALLOW/DENY-transferOwnership.
  ORG_TRANSFER_OWNER: "admin.orgs.transfer_ownership",
  // provider / model
  PROVIDER_ROUTING: "admin.providers.routing", // prototype: Provider / 模型配置
  // billing
  BILLING_MANAGE: "admin.billing.manage", // prototype: 计费管理
  // rbac / settings (super-only family)
  ROLE_MANAGE: "admin.roles.manage", // prototype: 角色与权限管理
} as const;

/** Union of all valid permission-key wire strings. */
export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

/**
 * The 6 destructive command families = `keyof AdminCommandAdapter` (slice #1
 * `adapters/types.ts`). Deriving from the shipped interface means adding/removing a
 * command family upstream is caught by `TT-PERMKEY-MUTATION-COVERAGE` (the family set
 * must exactly equal `keyof AdminCommandAdapter`).
 */
export type MutationFamily = keyof AdminCommandAdapter;

/**
 * Mutation-family → permission-key map. Every command family requires EXACTLY one key.
 * This is the join between the API mutation contract (adminApi.ts §5) and RBAC
 * (rbac.ts `canMutate`). Frozen `as const`.
 */
export const MUTATION_PERMISSION: Record<MutationFamily, PermissionKey> = {
  banUser: PERMISSION_KEYS.USER_BAN,
  bulkBan: PERMISSION_KEYS.USER_BAN,
  setFeatureRollout: PERMISSION_KEYS.FEATURE_ROLLOUT,
  transferOwnership: PERMISSION_KEYS.ORG_TRANSFER_OWNER, // REC-1 synthesized key
  setProviderRouting: PERMISSION_KEYS.PROVIDER_ROUTING,
  setQuota: PERMISSION_KEYS.QUOTA_SET,
} as const;

/**
 * APPEND-ONLY snapshot guard (TT-PERMKEY-APPEND-ONLY). This frozen list records the
 * permission keys present as of row #2. The test asserts the live catalog is a SUPERSET
 * of this snapshot — keys may be ADDED, never removed or renamed. When a later row adds a
 * key, append it here in the SAME commit (never edit/remove an existing entry).
 */
export const PERMISSION_KEYS_SNAPSHOT_V1: readonly PermissionKey[] = [
  "admin.dashboard.view",
  "admin.audit.view",
  "admin.users.manage",
  "admin.users.ban",
  "admin.users.impersonate",
  "admin.features.rollout",
  "admin.quota.set",
  "admin.orgs.transfer_ownership",
  "admin.providers.routing",
  "admin.billing.manage",
  "admin.roles.manage",
] as const;

/** All permission-key wire strings (convenience for catalog-wide checks). */
export const ALL_PERMISSION_KEYS: readonly PermissionKey[] = Object.values(
  PERMISSION_KEYS,
);
