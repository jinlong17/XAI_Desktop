# api.md — xai-admin-audit-ops-queue

> Interface contracts / error semantics for the admin **audit log + ops queue** layer (roadmap row #5).
> All contracts are **admin-local typed seams with mock impls**; row #5 ships NO real server and NO real
> mutation. The audit-on-mutation invariant is proven on the **mock** `AdminApiClient` path (browser
> advisory; server-authoritative is the real enforcer — row #2 C2).
> Builds on (does NOT redo) slice #1's `apps/admin/docs/api.md` and row #2's
> `apps/admin/docs/data-contracts-rbac/api.md`.

## 1. Consumed upstream contracts (reused, UNCHANGED)

From **row #2** (`apps/admin/src/contracts/adminApi.ts`, SHIPPED):

```ts
export interface MutationAck { applied: boolean; auditId?: string; } // auditId is THIS row's obligation
export interface AdminApiClient { /* 18 reads + 6 mutations; mutations return AdminApiResult<MutationAck> */ }
export function createMockAdminApiClient(ctx?: { role?: AdminRole }): AdminApiClient; // fail-closed, no I/O
```

From **row #2** (`apps/admin/src/authz/*`, SHIPPED):

```ts
export type MutationFamily = keyof AdminCommandAdapter; // 6 families
export const MUTATION_PERMISSION: Record<MutationFamily, PermissionKey>;
export function canMutate(role: AdminRole | null | undefined, family: MutationFamily): boolean; // advisory
```

From **slice #1** (`apps/admin/src/adapters/types.ts`, SHIPPED — kept as read projections, NOT re-declared):

```ts
export interface AuditRow { time: string; who: string; type: AuditType; action: string; object: string; ip: string; ok: boolean; }
export interface AuditFilter { text?: string; type?: AuditType | ""; range?: "today" | "7d" | "30d" | ""; }
export interface AuditReadModel { query(filter?: AuditFilter): AuditRow[]; }
export interface OpsQueueItem { key: string; icon: string; tone: Tone; title: string; sub: string; count: number; rows: OpsQueueRow[]; }
export type Tone = "danger" | "warning" | "info" | "muted";
```

> Row #5 **fulfils** `MutationAck.auditId` and **adds** an event contract + chain + severity; it does not
> redefine or fork any of the above. `AuditRow` becomes the read **projection** of `AdminAuditEvent`
> (one-way), and ops severity is **derived** from the unchanged `OpsQueueItem`.

## 2. Admin audit-event contract (NEW, canonical, append-only — Axis A / A2)

```ts
// apps/admin/src/audit/auditEvent.ts
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
 * Canonical append-only admin audit event. Machine-first; `AuditRow` is its display projection (§2.1).
 * `previousHash` + `hash` form the tamper-evident chain (§3). `permissionKey`/`mutationFamily` are set
 * for mutation-sourced events (the audit-on-mutation join, §4).
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
  /** set for mutation-sourced events (§4) */
  permissionKey?: PermissionKey;
  mutationFamily?: MutationFamily;
}
```

### 2.1 `AuditRow` projection (one-way; display stays display)

```ts
// apps/admin/src/audit/auditEvent.ts
/** Pure one-way map AdminAuditEvent → slice #1 display AuditRow. NEVER the reverse. */
export function eventToAuditRow(event: AdminAuditEvent): AuditRow;
```

- `time` ← formatted `tsMs`; `who` ← `actor` display; `object` ← `target` display; `ok` ← `result === "ok"`;
  `type` ← derived `AuditType` (mutation family → `danger`/`config`, auth → `auth`, billing → `billing`).
- The **event** is the source of truth; `AuditRow` is a lossy display view. Direction is one-way (mirrors
  row #2's authz→display rule). The existing `AUDIT` fixture seeds events by the inverse field-map at load.

## 3. Append-only hash-chain contract (NEW, immutability — Axis C / C2)

```ts
// apps/admin/src/audit/hashChain.ts
/** Injected digest: canonical JSON → hex string. Pure; deterministic; no I/O, no secret. */
export type DigestFn = (canonicalJson: string) => string;

export class AdminAuditIntegrityError extends Error {
  readonly code = "E3025"; // E3025-style integrity code (precedent: audit-log-integrity)
}

/**
 * Admin-local append-only audit chain. PORTED from packages/audit-log-integrity (cited), NOT imported
 * (that module is node:crypto + the PAUSED sync-line account audit — see design ADR-lite #3 / D4).
 * Append-only by construction: NO edit/delete method exists.
 */
export class AdminAuditChain {
  constructor(digest: DigestFn);
  /** Append a new event; computes seq, previousHash, hash. Returns a COPY. */
  append(input: Omit<AdminAuditEvent, "seq" | "previousHash" | "hash">): AdminAuditEvent;
  /** Read-only snapshot (copies). */
  list(): AdminAuditEvent[];
  /** Walk the chain; throw AdminAuditIntegrityError on any tamper. */
  verify(entries?: readonly AdminAuditEvent[]): void;
}
```

**Integrity semantics (binary, tested):**
- `seq` is 1-based and strictly monotonic; a gap → `E3025` ("sequence gap").
- each entry's `previousHash` must equal the prior entry's `hash`; mismatch → `E3025` ("previous_hash mismatch").
- recomputed `hash` (over canonical content via the injected `DigestFn`) must equal the stored `hash`;
  mismatch → `E3025` ("hash mismatch").
- **append-only:** there is no method to edit or delete an entry; the only mutator is `append`.
- the injected `DigestFn` in tests/mock is a **pure deterministic** hex function (no secret, no I/O); the
  **production** digest (Web Crypto `crypto.subtle` async / server SHA-256) is deferred (OQ-E) — the chain
  logic and tests are digest-agnostic.

## 4. Audit-on-mutation invariant (NEW — Axis B / B2; the manifest Audit gate)

```ts
// apps/admin/src/audit/auditedMutation.ts
export interface AuditedMockContext {
  /** simulated server-validated role; absent → unauthorized (fail closed) */
  role?: AdminRole;
  /** actor recorded on audit events (defaults to a system actor for the mock) */
  actor?: AuditActor;
  /** request IP recorded on audit events (defaults to "—") */
  ip?: string;
  /** injected digest for the chain (defaults to the pure deterministic test digest) */
  digest?: DigestFn;
}

/**
 * An AdminApiClient whose 6 mutations are AUDITED: a GRANTED mutation cannot ack without first appending an
 * AdminAuditEvent; a DENIED mutation appends ZERO events. Reads are inherited from the row #2 mock unchanged
 * (now also exposing the chain via getAudit, §5). NO real write (applied:false), NO network/storage.
 */
export function createAuditedMockAdminApiClient(
  ctx?: AuditedMockContext,
): { client: AdminApiClient; chain: AdminAuditChain };
```

**`appendThenAck(family, input, role)` contract (the structural invariant):**
1. **Authorize (server-shaped, fail-closed):** no role → `{ ok:false, error:{ code:"unauthorized" } }`,
   **no append**. Role present but `!canMutate(role, family)` → `{ ok:false, error:{ code:"forbidden" } }`,
   **no append** (a denial is not an audited state mutation — frozen assumption #6).
2. **Append (granted only):** append an `AdminAuditEvent` with `action` = the family's canonical label,
   `permissionKey = MUTATION_PERMISSION[family]`, `mutationFamily = family`, `target` derived from `input`,
   `result = "ok"`, `actor`/`ip` from context. The append happens **before** the ack is constructed.
3. **Ack:** return `{ ok:true, data:{ applied:false, auditId: event.id } }` — **`applied:false`** (NO real
   write this row, mirrors row #2) but **`auditId` set** (audit recorded → row #2's obligation fulfilled).

**Invariants (tested, §test.md):** every granted family appends **exactly one** event with the correct
`mutationFamily`/`permissionKey`/`result:"ok"` (`TT-AUDIT-ON-MUTATION-<family>`); every denied family appends
**zero** (`TT-AUDIT-DENY-NOAPPEND-<family>`); the returned `auditId` resolves to the appended event
(`TT-AUDIT-ID-RESOLVES`); `chain.verify()` stays green after N mixed mutations (`TT-AUDIT-CHAIN-AFTER-N`).

**Security note (hard, documented + tested):** this proves the invariant on the **contract + mock** path. The
browser path is **advisory**; the **production** guarantee is the **server** performing the privileged op and
the audit append in a single transaction (row #2 §5.1 C2). A browser bypass cannot cause a real privileged
effect (the mock holds no service-role credential; `applied:false`). Row #5 fixes the **shape + obligation +
test surface** the real server must honor — it does NOT ship a server.

## 5. Audit read side (NEW projection over the chain)

Row #5 makes `AuditReadModel.query()` return rows **projected from the chain** (newest first), integrity-
verifiable. The audited mock client exposes the chain through the existing row #2 read method:

```ts
// AdminApiClient.getAudit (row #2 signature, UNCHANGED) now backed by the chain projection:
getAudit(filter?: AuditFilter): Promise<AdminApiResult<AuditRow[]>>;
// returns chain.list().map(eventToAuditRow) filtered by AuditFilter; pure; no I/O.
```

- Read returns are bound to slice #1's `AuditRow` contract (REC-2 lineage: no fork).
- A read-side integrity helper (`verifyAuditReadModel`) calls `chain.verify()` so a tampered chain surfaces
  as an integrity error rather than silently serving altered rows.

## 6. Ops-queue severity contract + read model (NEW — Axis D / D2)

```ts
// apps/admin/src/opsQueue/severity.ts
/** Severity ordinal — higher = more urgent. */
export type OpsSeverity = "critical" | "high" | "warning" | "info";
export const SEVERITY_ORDER: Record<OpsSeverity, number>; // critical:3, high:2, warning:1, info:0

/** Deterministic tone(+count) → severity map (no fixture rewrite). Pure. */
export function toSeverity(item: OpsQueueItem): OpsSeverity;
/** Pure comparator: severity desc, then count desc (total, stable). */
export function severityRank(a: OpsQueueItem, b: OpsQueueItem): number;
```

```ts
// apps/admin/src/opsQueue/opsQueueReadModel.ts
export interface RankedOpsQueueItem extends OpsQueueItem { severity: OpsSeverity; }

export interface OpsQueueReadModel {
  /** queues severity-ranked (severity desc, then count desc); deterministic + stable */
  ranked(): RankedOpsQueueItem[];
}
export function createOpsQueueReadModel(source?: OpsQueueItem[]): OpsQueueReadModel;
```

**Severity mapping (deterministic, tested):** derived from existing fields, e.g. `tone:"danger"` →
`high` (or `critical` when `count` crosses a documented threshold), `tone:"warning"` → `warning`,
`tone:"info"` → `info`, `tone:"muted"` → `info`. The exact thresholds are pinned by `TT-OPS-SEVERITY-MAP`.
The 6 prototype queues (risk / tickets / dunning / overage / highcost / dormant) each map to a defined
severity (`TT-OPS-SEVERITY-COVERS-ALL-QUEUES`).

**Invariants (tested):** `ranked()` is deterministic + stable (`TT-OPS-READMODEL-RANKED`,
`TT-OPS-STABLE-SORT`); output `RankedOpsQueueItem[]` carries a defined `OpsSeverity` per item and preserves
the `OpsQueueItem` shape (`TT-OPS-READMODEL-CONTRACT-SHAPE`).

## 7. Permission / idempotency / security notes

- **Permission:** mutations are audited only when **granted** (server-shaped `canMutate` re-check in the mock);
  the required key per family is row #2's `MUTATION_PERMISSION` (UNCHANGED). Reads (audit + ops) are gated by
  `VIEW_AUDIT`/`VIEW_DASHBOARD` server-side in the real impl (deferred). Browser advisory; server authoritative.
- **Idempotency:** reads are pure. The audited mutation is `applied:false` (no real effect → trivially
  idempotent for the *write*); each call appends a **new** audit event (audit is an append-only ledger, so
  repeated calls are distinct ledger entries by design — not deduped this row). Real write idempotency
  (e.g. ban-already-banned) is defined when a real transport lands (rows #3–#5).
- **Immutability:** the chain is append-only (no edit/delete); `verify()` detects tamper (E3025-style).
- **Security (hard, re-asserted from slice #1):** audit events + ops data carry only
  `actor/action/target/ip/result` (+ chain metadata) — **NO** service-role token, provider secret, or Stripe
  secret in `apps/admin/` source or built bundle; providers stay key-status-only. Asserted by `TT-NO-SECRET-SRC`
  (src) + `TT-NO-SECRET-BUNDLE` (dist), re-run over the new `audit/`+`opsQueue/` modules. The injected digest
  is a pure non-secret function.
- **Separation (ADR-0013 §D4):** admin audit is a **separate** domain from user sync audit; `@repo/audit-log-
  integrity` is **not imported** (pattern ported). No `syncScope` entity; no cross-device persistence.
- **No new typed events** (`@repo/core/src/events` untouched); **no Tauri commands**. **D3 = W0.**

## 8. Public surface

`apps/admin` remains an **app**, not a library (no consumed `index.ts`). The row-#5 modules (`audit/*`,
`opsQueue/*`) are **internal** to the admin app and MUST NOT be imported by `apps/web` or `packages/core`
(enforced by physical separation + the no-cross-import boundary). Their "contract" role is internal: the
frozen event/chain/severity interfaces + the audit-on-mutation obligation that the real server in later rows
must honor.
