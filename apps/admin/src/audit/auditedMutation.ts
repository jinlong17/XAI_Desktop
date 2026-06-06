/**
 * apps/admin/src/audit/auditedMutation.ts — audit-on-mutation invariant (row #5, P2).
 *
 * The manifest Audit gate: "every admin mutation appends an immutable audit event".
 *
 * ┌─────────────────────────────────────────────────────────────────────────────────────┐
 * │ STRUCTURAL INVARIANT (B2 / ADR-lite #2): a GRANTED mutation in this audited mock        │
 * │ AdminApiClient is structurally UNABLE to return an ack without first appending an       │
 * │ AdminAuditEvent (single `appendThenAck` seam). A DENIED mutation appends ZERO events    │
 * │ (a denial is not an audited state mutation — frozen assumption #6). This makes          │
 * │ "no silent mutation" a TESTED property.                                                 │
 * │                                                                                        │
 * │ SERVER-AUTHORITATIVE; BROWSER ADVISORY (R2 / row #2 C2): this proves the obligation     │
 * │ SHAPE on the contract + MOCK path. The browser is advisory; the PRODUCTION guarantee    │
 * │ is the SERVER performing the privileged op + the audit append in ONE transaction. A     │
 * │ browser bypass cannot cause a real privileged effect — the mock holds NO service-role   │
 * │ credential and every mutation returns `applied:false` (NO real write this row). Row #5  │
 * │ fixes the shape + obligation + test surface the real server must honor; it ships NO     │
 * │ server.                                                                                 │
 * │                                                                                        │
 * │ OQ-C (WRAP): this composes row #2's `createMockAdminApiClient` for ALL READS unchanged   │
 * │ and overrides ONLY the 6 mutations with the audited path — it does NOT mutate            │
 * │ `createMockAdminApiClient` or its tests (`contracts/adminApi.test.ts` stays exact).      │
 * └─────────────────────────────────────────────────────────────────────────────────────┘
 *
 * Boundary (design.md, W0): contract-only, browser-side; no I/O, no secret, no real write
 * (applied:false), no shared `@repo/*` change.
 *
 * Test strategy: apps/admin/docs/audit-ops-queue/test.md §1
 * (TT-AUDIT-ON-MUTATION-<family> ×6 / TT-AUDIT-DENY-NOAPPEND-<family> ×6 /
 *  TT-AUDIT-ID-RESOLVES / TT-AUDIT-APPLIED-FALSE / TT-AUDIT-CHAIN-AFTER-N / TT-AUDIT-NO-IO /
 *  TT-AUDIT-ADVISORY-NOTE).
 */
import {
  createMockAdminApiClient,
  type AdminApiClient,
  type AdminApiResult,
  type AdminApiErr,
  type MutationAck,
} from "../contracts/adminApi";
import type { AuditRow, AuditFilter } from "../adapters/types";
import { canMutate, type AdminRole } from "../authz/rbac";
import { MUTATION_PERMISSION, type MutationFamily } from "../authz/permissionKeys";
import {
  AdminAuditChain,
  deterministicDigest,
  type DigestFn,
} from "./hashChain";
import {
  eventToAuditRow,
  type AdminAuditEvent,
  type AuditActor,
} from "./auditEvent";

/**
 * Context for the audited mock. `role` simulates a SERVER-VALIDATED role (absent → fail
 * closed / unauthorized). `actor`/`ip` are recorded on appended events. `digest` is the
 * chain's injectable digest (defaults to the pure deterministic test digest).
 */
export interface AuditedMockContext {
  /** simulated server-validated role; absent → unauthorized (fail closed) */
  role?: AdminRole;
  /** actor recorded on audit events (defaults to a system actor for the mock) */
  actor?: AuditActor;
  /** request IP recorded on audit events (defaults to "—") */
  ip?: string;
  /** injected digest for the chain (defaults to the pure deterministic test digest) */
  digest?: DigestFn;
  /** fixed clock for deterministic tsMs in tests (defaults to a fixed epoch, NOT Date.now) */
  now?: () => number;
}

/** Canonical action label per mutation family (machine-first; stable). */
const FAMILY_ACTION: Record<MutationFamily, string> = {
  banUser: "users.ban",
  bulkBan: "users.bulk_ban",
  setFeatureRollout: "features.rollout",
  transferOwnership: "orgs.transfer_ownership",
  setProviderRouting: "providers.routing",
  setQuota: "quota.set",
};

/**
 * Hard contract documenting the security posture (TT-AUDIT-ADVISORY-NOTE asserts the module
 * names the SERVER, not the browser, as the real enforcer — guards R2 from regressing).
 */
export const AUDIT_ON_MUTATION_ADVISORY_NOTE =
  "The audit-on-mutation invariant here is proven on the CONTRACT + MOCK path: a granted " +
  "mutation appends an AdminAuditEvent BEFORE acking; a denied mutation appends ZERO. This is " +
  "ADVISORY. The PRODUCTION guarantee is the SERVER performing the privileged operation and the " +
  "audit append in a single transaction; the browser holds no service-role credential and every " +
  "mock mutation returns applied:false (no real write). The server is the real enforcer.";

const ok = <T>(data: T): AdminApiResult<T> => ({ ok: true, data });
const err = (
  code: AdminApiErr["error"]["code"],
  message: string,
): AdminApiErr => ({ ok: false, error: { code, message } });

/** Default fixed clock — deterministic (NOT Date.now), so events/tests are reproducible. */
const DEFAULT_NOW = (): number => Date.UTC(2026, 4, 30, 12, 0, 0);

/**
 * Build an audited mock `AdminApiClient` + the backing append-only chain.
 *
 * - READS: delegated to row #2's `createMockAdminApiClient(ctx)` UNCHANGED, EXCEPT `getAudit`
 *   which is re-backed by the chain projection (newest first, AuditFilter-filtered) — §5.
 * - MUTATIONS (6 families): `appendThenAck` — deny (no role / !canMutate) → forbidden/
 *   unauthorized with ZERO append; allow → append an AdminAuditEvent then return
 *   `{ applied:false, auditId: event.hash }`.
 * - NO network / NO persistence / NO real write (applied:false). The chain lives in memory.
 */
export function createAuditedMockAdminApiClient(ctx?: AuditedMockContext): {
  client: AdminApiClient;
  chain: AdminAuditChain;
} {
  const role = ctx?.role;
  const actor: AuditActor = ctx?.actor ?? { id: "system", role };
  const ip = ctx?.ip ?? "—";
  const now = ctx?.now ?? DEFAULT_NOW;
  const chain = new AdminAuditChain(ctx?.digest ?? deterministicDigest);

  // Compose row #2's mock for ALL reads (OQ-C WRAP — does not mutate the row #2 factory).
  const base = createMockAdminApiClient({ role });

  /**
   * The structural audit-on-mutation seam.
   *   1. AUTHORIZE (server-shaped, fail-closed): no role → unauthorized (ZERO append);
   *      role present but !canMutate → forbidden (ZERO append).
   *   2. APPEND (granted only): append an AdminAuditEvent (result "ok", permissionKey,
   *      mutationFamily, target from input) BEFORE the ack is constructed.
   *   3. ACK: { applied:false, auditId: event.hash } — applied:false (no real write),
   *      auditId set (audit recorded → row #2's MutationAck.auditId obligation fulfilled).
   */
  function appendThenAck(
    family: MutationFamily,
    target: AdminAuditEvent["target"],
  ): AdminApiResult<MutationAck> {
    // (1) authorize — fail closed; a denial appends NOTHING.
    if (!role) return err("unauthorized", "no admin session");
    if (!canMutate(role, family)) {
      return err("forbidden", `role "${role}" lacks permission for "${family}"`);
    }
    // (2) append BEFORE ack — granted mutations cannot ack without appending.
    const event = chain.append({
      tsMs: now(),
      actor,
      action: FAMILY_ACTION[family],
      target,
      ip,
      result: "ok",
      permissionKey: MUTATION_PERMISSION[family],
      mutationFamily: family,
    });
    // (3) ack — applied:false (no real write), auditId resolves to the appended event.
    return ok<MutationAck>({ applied: false, auditId: event.hash });
  }

  return {
    chain,
    client: {
      // ---- reads: row #2 mock unchanged, EXCEPT getAudit re-backed by the chain (§5) ----
      getOverview: base.getOverview,
      getUsers: base.getUsers,
      getUser: base.getUser,
      getOrgs: base.getOrgs,
      getOrg: base.getOrg,
      getFeatures: base.getFeatures,
      getFeature: base.getFeature,
      getQuotaPolicies: base.getQuotaPolicies,
      getTopSpenders: base.getTopSpenders,
      getProviders: base.getProviders,
      getModelPlanMatrix: base.getModelPlanMatrix,
      getRoles: base.getRoles,
      getRbacMatrix: base.getRbacMatrix,
      getBillingMetrics: base.getBillingMetrics,
      getPlanDistribution: base.getPlanDistribution,
      getTransactions: base.getTransactions,
      getAudit: async (filter?: AuditFilter) =>
        ok<AuditRow[]>(projectAudit(chain, filter)),
      getSettings: base.getSettings,

      // ---- mutations: audited (append-then-ack | deny-no-append), applied:false ----
      banUser: async (input) =>
        appendThenAck("banUser", { kind: "user", id: input.email }),
      bulkBan: async (input) =>
        appendThenAck("bulkBan", {
          kind: "user",
          id: input.emails.join(","),
        }),
      setFeatureRollout: async (input) =>
        appendThenAck("setFeatureRollout", {
          kind: "feature",
          id: `${input.key}@${input.rollout}`,
        }),
      transferOwnership: async (input) =>
        appendThenAck("transferOwnership", {
          kind: "org",
          id: `${input.org}→${input.toMember}`,
        }),
      setProviderRouting: async (input) =>
        appendThenAck("setProviderRouting", {
          kind: "provider",
          id: `${input.plan}:${input.model}`,
        }),
      setQuota: async (input) =>
        appendThenAck("setQuota", {
          kind: "quota",
          id: `${input.subject}=${input.quota}`,
        }),
    },
  };
}

/* ------------------------------------------------------------------ *
 * Audit read side — chain projection (§5)
 * ------------------------------------------------------------------ */

/**
 * Project the chain to slice #1 `AuditRow[]` (NEWEST FIRST), filtered by `AuditFilter`
 * (text over who/action/object; type; range by day-of-month, mirroring slice #1's
 * `auditAdapter.query`). Returns are bound to slice #1's `AuditRow` contract (no fork).
 */
export function projectAudit(
  chain: AdminAuditChain,
  filter?: AuditFilter,
): AuditRow[] {
  const text = (filter?.text ?? "").toLowerCase();
  const type = filter?.type ?? "";
  const range = filter?.range ?? "";
  const dayOk = (timeStr: string): boolean => {
    if (!range) return true;
    const d = Number(timeStr.slice(8, 10));
    if (range === "today") return d === 30;
    if (range === "7d") return d >= 23;
    if (range === "30d") return d >= 1;
    return true;
  };
  return chain
    .list()
    .map(eventToAuditRow)
    .reverse() // newest first
    .filter(
      (a) =>
        (!text ||
          a.who.toLowerCase().includes(text) ||
          a.action.toLowerCase().includes(text) ||
          a.object.toLowerCase().includes(text)) &&
        (!type || a.type === type) &&
        dayOk(a.time),
    );
}

/**
 * Read-side integrity helper: calls `chain.verify()` so a tampered chain surfaces an
 * `AdminAuditIntegrityError` rather than silently serving altered rows (§5). Pure; no I/O.
 */
export function verifyAuditReadModel(chain: AdminAuditChain): void {
  chain.verify();
}
