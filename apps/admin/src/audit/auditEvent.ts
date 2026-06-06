/**
 * apps/admin/src/audit/auditEvent.ts — canonical admin audit-event contract (row #5, P1).
 *
 * A NEW, machine-first, APPEND-ONLY audit record (`AdminAuditEvent`), separate from slice #1's
 * display `AuditRow`. Only a structured event with `seq`/`previousHash`/`hash` can anchor the
 * tamper-evident chain (hashChain.ts) and the audit-on-mutation join (auditedMutation.ts).
 *
 * ┌─────────────────────────────────────────────────────────────────────────────────────┐
 * │ DIRECTION (A2 / ADR-lite #1): the EVENT is the source of truth; `AuditRow` is its      │
 * │ one-way DISPLAY projection (eventToAuditRow). There is intentionally NO rowToEvent —    │
 * │ mirrors row #2's "authz → display, never reverse" rule. `AuditRow` is never the event   │
 * │ source; reusing it as the event would fork a display type that cannot be made           │
 * │ tamper-evident.                                                                         │
 * │                                                                                        │
 * │ HARD SECRET INVARIANT (slice #1, re-asserted): events carry ONLY                       │
 * │ actor/action/target/ip/result (+ chain metadata) — NEVER a service-role token,         │
 * │ provider secret, or any key-shaped string. Asserted by TT-NO-SECRET-SRC (whole src/)    │
 * │ + TT-AUDIT-NO-SECRET-EVENT (defense-in-depth over the seeded fixture).                 │
 * └─────────────────────────────────────────────────────────────────────────────────────┘
 *
 * Boundary (design.md, W0): contract-only, browser-side; pure data + pure functions; no
 * shared `@repo/*` change; no `@repo/audit-log-integrity` import; no typed events; no Tauri;
 * no `syncScope` entity (admin audit is SEPARATE from user sync audit — INTEGRATION_PLAN §3 /
 * manifest gap row, D4-consistent: defines no `account-sync` entity → never syncs).
 *
 * Test strategy: apps/admin/docs/audit-ops-queue/test.md §1
 * (TT-AUDIT-EVENT-SHAPE / TT-AUDIT-PROJECTION / TT-AUDIT-NO-SECRET-EVENT).
 */
import type { AuditRow, AuditType } from "../adapters/types";
import type { MutationFamily } from "../authz/permissionKeys";
import type { PermissionKey } from "../authz/permissionKeys";

/* ------------------------------------------------------------------ *
 * Canonical event types (machine-first)
 * ------------------------------------------------------------------ */

/** Result of an audited admin action. */
export type AuditResult = "ok" | "denied" | "error";

/** Structured admin actor (machine-first; NOT the display `who` string). */
export interface AuditActor {
  /** stable subject id (e.g. admin user id / "system"); display name is derived */
  id: string;
  /** advisory role label at action time (display only; enforcement = server) */
  role?: string;
}

/** Structured target of an admin action (machine-first; NOT the display `object` string). */
export interface AuditTarget {
  /** target kind, e.g. "user" | "org" | "feature" | "provider" | "quota" */
  kind: string;
  /** target id (e.g. email, org name, feature key) */
  id: string;
}

/**
 * Canonical append-only admin audit event. Machine-first; `AuditRow` is its display
 * projection (eventToAuditRow). `previousHash` + `hash` form the tamper-evident chain
 * (hashChain.ts). `permissionKey`/`mutationFamily` are set for mutation-sourced events
 * (the audit-on-mutation join, auditedMutation.ts).
 */
export interface AdminAuditEvent {
  /** 1-based monotonic sequence within the chain */
  seq: number;
  /** machine timestamp (ms since epoch) */
  tsMs: number;
  actor: AuditActor;
  /** canonical action label (e.g. "users.ban"); for mutations = the family/key */
  action: string;
  target: AuditTarget;
  /** request IP (advisory; "—" when unknown) */
  ip: string;
  result: AuditResult;
  /** hash of the previous event (null for the genesis event) */
  previousHash: string | null;
  /** digest over this event's canonical content (the chain link) */
  hash: string;
  /** set for mutation-sourced events (auditedMutation.ts) */
  permissionKey?: PermissionKey;
  mutationFamily?: MutationFamily;
}

/**
 * The chain-independent content of an event (everything EXCEPT the chain fields the chain
 * computes: `seq`/`previousHash`/`hash`). This is exactly what `AdminAuditChain.append` takes.
 */
export type AdminAuditEventInput = Omit<
  AdminAuditEvent,
  "seq" | "previousHash" | "hash"
>;

/* ------------------------------------------------------------------ *
 * Deterministic time parse/format (R-3: pure, deterministic, UTC-based)
 * ------------------------------------------------------------------ */

/**
 * Parse the slice #1 display `time` string ("YYYY-MM-DD HH:MM") → ms since epoch (UTC).
 * Pure + deterministic (no `Date.parse` locale ambiguity, no timezone drift). Used to seed
 * the event store from the `AUDIT` fixture (the inverse field-map). Returns `0` on a
 * non-matching string (defensive; the fixture is well-formed).
 */
export function parseAuditTime(time: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(time.trim());
  if (!m) return 0;
  const [, y, mo, d, h, mi] = m;
  return Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    0,
    0,
  );
}

/**
 * Format ms since epoch (UTC) → the slice #1 display `time` string ("YYYY-MM-DD HH:MM").
 * Pure + deterministic; the exact inverse of `parseAuditTime` for minute-granularity inputs.
 */
export function formatAuditTime(tsMs: number): string {
  const dt = new Date(tsMs);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return (
    `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}` +
    ` ${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}`
  );
}

/* ------------------------------------------------------------------ *
 * One-way display projection: AdminAuditEvent → slice #1 AuditRow
 * ------------------------------------------------------------------ */

/**
 * Mutation families whose audit events project to the destructive `danger` display type.
 * The remaining `config`-family mutations (feature rollout / provider routing / quota) read
 * as `config`. Auth/billing/create events come from non-mutation seeds (their `type` is
 * carried through the inverse seed map; see fixtures seeding in auditStore).
 */
const DANGER_FAMILIES: ReadonlySet<MutationFamily> = new Set<MutationFamily>([
  "banUser",
  "bulkBan",
  "transferOwnership",
]);

/**
 * Derive the slice #1 display `AuditType` for an event.
 * - mutation-sourced events: destructive families → `danger`; other families → `config`.
 * - non-mutation events: fall back to a kind→type heuristic (auth/billing/create/config).
 * Pure + total (always returns a valid AuditType).
 */
export function deriveAuditType(event: AdminAuditEvent): AuditType {
  if (event.mutationFamily) {
    return DANGER_FAMILIES.has(event.mutationFamily) ? "danger" : "config";
  }
  switch (event.target.kind) {
    case "session":
    case "auth":
      return "auth";
    case "invoice":
    case "billing":
      return "billing";
    case "feature":
      return "create";
    case "danger":
      // a non-mutation destructive admin action seeded with an explicit danger kind
      return "danger";
    default:
      return "config";
  }
}

/**
 * Pure one-way map AdminAuditEvent → slice #1 display `AuditRow`. NEVER the reverse.
 *
 * - `time`   ← formatted `tsMs`
 * - `who`    ← actor display (role-qualified id when a role is present)
 * - `type`   ← derived `AuditType` (deriveAuditType)
 * - `action` ← canonical `action`
 * - `object` ← target display (`kind:id` when kind adds context, else `id`)
 * - `ip`     ← `ip`
 * - `ok`     ← `result === "ok"`
 *
 * The event is the source of truth; `AuditRow` is a lossy display view (intentionally
 * one-directional — there is no `rowToEvent`).
 */
export function eventToAuditRow(event: AdminAuditEvent): AuditRow {
  const who = event.actor.role
    ? `${event.actor.id} (${event.actor.role})`
    : event.actor.id;
  const object =
    event.target.kind && event.target.kind !== "—"
      ? `${event.target.kind}:${event.target.id}`
      : event.target.id;
  return {
    time: formatAuditTime(event.tsMs),
    who,
    type: deriveAuditType(event),
    action: event.action,
    object,
    ip: event.ip,
    ok: event.result === "ok",
  };
}

/* ------------------------------------------------------------------ *
 * Inverse seed map: slice #1 display AuditRow → AdminAuditEventInput
 * ------------------------------------------------------------------ */

/**
 * `AuditType` → the seed `target.kind` that `deriveAuditType` maps BACK to the same type.
 * This lets the existing `AUDIT` display fixture seed the event store while preserving each
 * row's display type through the projection round-trip. (`danger` rounds through the explicit
 * `"danger"` kind — see deriveAuditType.)
 */
const TYPE_TO_SEED_KIND: Record<AuditType, string> = {
  config: "config",
  auth: "auth",
  billing: "billing",
  create: "feature",
  danger: "danger",
};

/**
 * Pure inverse field-map: a slice #1 display `AuditRow` → `AdminAuditEventInput` (the
 * chain-independent content the chain's `append` consumes). Used ONLY to SEED the event store
 * from the existing `AUDIT` fixture at load. This is NOT a general two-way mapper (the event
 * stays the source of truth, A2) — it is a deterministic, lossy-display → structured-seed
 * adapter so the demo chain has realistic content. `time → tsMs` via the pure `parseAuditTime`.
 */
export function auditRowToSeedInput(row: AuditRow): AdminAuditEventInput {
  return {
    tsMs: parseAuditTime(row.time),
    actor: { id: row.who },
    action: row.action,
    target: { kind: TYPE_TO_SEED_KIND[row.type], id: row.object },
    ip: row.ip,
    result: row.ok ? "ok" : "error",
  };
}
