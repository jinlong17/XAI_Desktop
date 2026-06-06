# design.md — xai-admin-audit-ops-queue

> Decision snapshot ONLY (discovery detail lives in the review doc, not here).
> Surface: `apps/admin/` (the SHIPPED isolated Web-line app — this row adds an AUDIT + OPS-QUEUE
> contract layer, not new top-level pages; it wires the existing Dashboard + Audit pages).
> Roadmap row **#5 of 6** of `xai-admin-dashboard-system-integration`. Hard dep row #2 = SHIPPED, row #1 = SHIPPED.
> Distinct landing (does NOT overwrite slice #1's `apps/admin/docs/{design,api,test,dev_log}.md` or row #2's
> `apps/admin/docs/data-contracts-rbac/{design,api,test,dev_log}.md`).

## Decision snapshot

| Field | Value |
|---|---|
| **Selected Option (audit-event contract, Axis A)** | **A2** — a NEW canonical, append-only `AdminAuditEvent` contract (`seq · tsMs · actor · action · target · ip · result · previousHash · hash` + optional `permissionKey`/`mutationFamily`); slice #1's `AuditRow` is kept as its **read projection** (one-way map, never the event source). Integrity-capable; non-breaking. |
| **Selected Option (audit-on-mutation invariant, Axis B)** | **B2** — a **structural** invariant on the mock mutation path: a granted mutation cannot ack without first appending an audit event (`appendThenAck`); a denied mutation appends **zero**. Append-asserted allow/deny tests per family. Browser advisory; real enforcement server-side (row #2 C2). |
| **Selected Option (hash-chain reuse, Axis C)** | **C2** — port the SHIPPED `audit-log-integrity` **pattern** (`seq` + `previousHash` + canonical-JSON digest `hash` + `verify()` + `E3025`-style error) into an **admin-local, injectable-digest** chain. **Do NOT import `@repo/audit-log-integrity`** (it is `node:crypto` + sync-line account audit → would break the browser bundle, couple to the PAUSED sync line, and risk leaving W0 + violating D4). |
| **Selected Option (ops-queue severity, Axis D)** | **D2** — a typed `OpsSeverity` ordinal (`critical \| high \| warning \| info`) derived **deterministically** from the existing `tone`+`count` (no fixture rewrite), a pure `severityRank`/sort, and an `OpsQueueReadModel` that returns **severity-ranked** queues. |
| **Selected Option (transport)** | Reuse row #2's typed **mockable** `AdminApiClient` seam. Row #5 ships an **audited** mock variant + augments the read side; **NO real server deployed**, **NO real mutation** (mutations stay `applied:false`, now carrying `auditId`). |
| **Selected Option (doc landing, Axis E)** | **E2** — discovery review under `docs/reviews/xai-admin-audit-ops-queue/`; four-piece set under `apps/admin/docs/audit-ops-queue/` (co-located with the surface; does NOT overwrite slice #1's or row #2's `apps/admin/docs/*`). |
| **Review Doc Path** | `docs/reviews/xai-admin-audit-ops-queue/20260606-discovery-review.md` |
| **Review Date / Version** | 2026-06-06 / v1 (discovery) |
| **Product module** | `admin` (#6) · operator-activated whole line 2026-06-06 · **row #5 only** (preserves manifest dep order; #6 depends on #5) |
| **Branch convention** | `codex/admin/<feature>` (planning-only at this step; no code branch) |
| **D3 classification** | **W0 (web-only, admin-side only)** — no shared `@repo/*` seam modified; no `@repo/audit-log-integrity` import; no `dev` promotion |
| **Cross-window contract impact** | NONE — no new `@repo/core/src/events` typed events; no Tauri command changes (browser-side, contract-only) |
| **syncScope** | NONE — admin audit/ops read models stay OUT of cross-device persistence (ADR-0013 §D4; sync line PAUSED). Admin audit is SEPARATE from user sync audit. |

## ADR-lite records (recorded here per slice-#1 / row-#2 precedent; no standalone ADR infra)

- **ADR-lite #1 (audit-event contract — A2).** The admin audit *event* is a NEW canonical, machine-first,
  append-only record (`AdminAuditEvent`), **separate** from slice #1's `AuditRow` (which is a display
  projection: pre-formatted `time` string, badge `type` enum, display labels). `AuditRow` is retained as the
  **read projection** of events via a pure one-way mapper (`eventToAuditRow`) — mirroring row #2's "authz →
  display, never reverse" direction. Rationale: only a structured event with `seq`/`previousHash`/`hash` can
  anchor an integrity chain and the audit-on-mutation join; reusing `AuditRow` as the event would be a fork of
  a display type and could not be made tamper-evident. The existing `AUDIT` fixture (12 rows) seeds the event
  store by field-mapping 1:1 (`who→actor`, `object→target`, `ok→result`, `time→tsMs`).
- **ADR-lite #2 (audit-on-mutation invariant — B2).** A **granted** mutation in the audited mock
  `AdminApiClient` is structurally unable to return an ack without first appending an `AdminAuditEvent`
  (single `appendThenAck(family, input, role)` seam: re-check `canMutate` → on deny return `forbidden` with
  **zero append** → on allow append event then return `{ applied:false, auditId: event.id }`). This makes
  "no silent mutation" a **tested property**, satisfying the manifest Audit gate ("every admin mutation appends
  an immutable audit event") *and* the Implementation-Order prerequisite ("add mutation flows only when the
  audit append contract is covered by tests"). **Boundary (R2/R3):** this is proven on the **contract + mock**
  path — the browser is advisory; the **production** guarantee is the server performing the privileged op +
  the audit append in one transaction (row #2 C2). Mutations remain `applied:false` (no real write); `auditId`
  is set (audit recorded). A **denied** mutation must NOT append (a denial is not an audited admin action that
  mutated state) — asserted by zero-append tests.
- **ADR-lite #3 (hash-chain reuse — C2, admin-local injectable-digest port).** The SHIPPED
  `packages/audit-log-integrity` is the precedent and is **cited in `hashChain.ts`**, but is **NOT imported**:
  (a) it imports `node:crypto` (`createHash`) and is not browser-safe as a Vite runtime dep; (b) it is the
  **sync-v1 server account audit** (`accountId`, event types `push`/`pull`/`rekey`/…) — importing it would
  couple the admin line to the **PAUSED** sync line and conflict with ADR-0013 §D4's requirement that admin
  audit be **separate** from user sync audit; (c) a shared-package coupling could push the row off W0. The
  admin-local chain reproduces the **algorithm** faithfully — monotonic `seq`, `previousHash`, canonical-JSON
  `hash`, `verify()` walking the chain (sequence-gap / previousHash-mismatch / hash-mismatch →
  integrity error), append-only (no edit/delete method) — but takes an **injectable digest** so it is
  environment-agnostic and synchronously testable. The mock/test uses a **pure deterministic** digest (no
  secret, no I/O); the production digest (Web Crypto `crypto.subtle` async / server SHA-256) is deferred
  (OQ-E). **Evidence:** web research (review §7) confirms SHA-256 hash chains are the standard tamper-evident
  technique and are browser-implementable via Web Crypto, validating both the algorithm and the deferred
  real-digest path.
- **ADR-lite #4 (ops-queue severity — D2).** A typed `OpsSeverity` ordinal + a pure `severityRank` + a
  tone→severity map derive severity **deterministically** from existing fixture fields (`tone`+`count`), so
  **no production ops data is invented** and no fixture is rewritten. `OpsQueueReadModel` returns queues
  **sorted by severity then count** (deterministic, total, stable). Additive over slice #1's unchanged
  `OpsQueueItem`; `DashboardPage` is wired to the ranked read model in P4 without a structural rewrite.

## Frozen assumptions (lock at plan acceptance — change requires Revise or a follow-up row)

1. **Row #5 is CONTRACT-ONLY and fully testable WITHOUT a live backend.** "Green" = audit-event contract +
   immutability/`verify()` + audit-on-mutation invariant + ops-queue read model + severity contract +
   Overview/Audit-page wiring to typed mock adapters, all unit-tested with a **mockable** transport. It does
   **NOT** require deploying a real server or performing a real mutation. Real audit storage + real mutations +
   real ops data = later/production rows (#3–#5 real transport, #6 deploy).
2. **All new code is admin-local under `apps/admin/src/`** (`audit/` for the event contract + chain + audited
   wrapper, `opsQueue/` for severity + read model). No shared `packages/*` change; no logic in
   `packages/core`/`apps/web`; **no import of `@repo/audit-log-integrity`** (pattern ported, not imported).
3. **Additive over slice #1 + row #2 — no fork, no break.** `AuditRow`/`AuditReadModel`/`AuditPage` and
   `OpsQueueItem`/`OverviewReadModel`/`DashboardPage` keep working; `AuditRow` becomes the read **projection**
   of events (one-way); ops severity is **derived** (fixtures unchanged). Re-export/derive, never re-declare
   (row #2 REC-3 lineage). Row #2's `MutationAck.auditId` is **fulfilled**, not redefined.
4. **Audit-on-mutation is server-authoritative; browser advisory** (row #2 C2). The invariant is proven on the
   **mock** path as the obligation shape; the contract documents the server as the real enforcer (privileged
   op + append in one transaction). A browser bypass cannot cause a real privileged effect (mock holds no
   service-role credential; `applied:false`).
5. **Append-only / immutability is structural** (R6). The chain exposes `append`/`list`/`verify` and **no**
   edit/delete; `verify()` detects tamper (sequence gap / previousHash mismatch / hash mismatch) with an
   `E3025`-style integrity error; a test mutates a serialized entry and asserts `verify()` throws.
6. **A denied mutation appends ZERO audit events** (B2). Only authorized, state-mutating admin actions are
   audited on this path; denials return `forbidden` without polluting the chain. Tested per family.
7. **Audit events + ops data carry NO secret material** (slice #1 hard invariant): only
   `actor/action/target/ip/result` (+ chain metadata); providers stay key-status-only. Re-asserted by the
   carried `TT-NO-SECRET-SRC` + `TT-NO-SECRET-BUNDLE` over `src/` + `dist/`.
8. **No `syncScope` entity / no cross-device persistence** of any admin audit or ops read model
   (ADR-0013 §D4; sync line PAUSED). Admin audit stays **separate** from user sync audit. **No new typed
   events; no Tauri changes. D3 = W0.**
9. **Zero new runtime dependencies** expected (contract + pure-function row). Headless `@tanstack/react-table`
   v8 remains the pre-approved table upgrade path behind slice #1's `DataTable` seam if ever needed (not this
   row); record if added. The injectable digest uses a pure in-repo function (no crypto dependency added).

## Dependency overview

| Direction | Dependency | State | Mode this row |
|---|---|---|---|
| Upstream (consumes) | row #2 `apps/admin/src/contracts/adminApi.ts` (`AdminApiClient`, `createMockAdminApiClient`, `MutationAck.auditId`) | SHIPPED (this repo) | Wrapped with an **audited** mock variant; `auditId` fulfilled; read side augmented |
| Upstream (consumes) | row #2 `apps/admin/src/authz/{permissionKeys,rbac}.ts` (`MutationFamily`, `MUTATION_PERMISSION`, `canMutate`) | SHIPPED (this repo) | Audit event records `action`/`permissionKey` from the family; denied-path re-checks `canMutate` |
| Upstream (consumes) | slice #1 `apps/admin/src/adapters/types.ts` (`AuditRow`/`AuditFilter`/`AuditReadModel`, `OpsQueueItem`/`OpsQueueRow`/`Tone`) | SHIPPED (this repo) | `AuditRow` = read projection of events; `OpsQueueItem` unchanged, severity derived |
| Upstream (consumes) | slice #1 `apps/admin/src/fixtures/index.ts` (`AUDIT` 12 rows, `QUEUES` 6 queues) | SHIPPED (this repo) | Seed the audit-event store + the ops-queue severity normalization |
| Upstream (consumes) | slice #1 `apps/admin/src/pages/{DashboardPage,AuditPage}.tsx` | SHIPPED (this repo) | Wired to the audited typed mock adapters in P4 (no structural rewrite) |
| Precedent-only (NOT imported) | `packages/audit-log-integrity` (`AuditLogHashChain`, `verify()`, `E3025`) | Shipped | **Pattern ported** into an admin-local injectable-digest chain; cited in comments; **no runtime import** |
| Design authority | prototype `docs/prototypes/admin-dashboard/` (`AUDIT`, `QUEUES`) | n/a | Seed for the audit event store + ops-queue severity |
| Concept-only (deferred) | real audit DB/store · real server hash-chain · real ops data · real mutations | n/a | NOT wired; rows #3–#5 (real transport) / #6 (deploy) |

## Directory shape (planned — additive to the SHIPPED slice-#1 + row-#2 tree)

```
apps/admin/
  src/
    audit/                         # NEW (row #5) — admin audit event contract + chain + audited mutation
      auditEvent.ts                # canonical AdminAuditEvent + actor/action/target/result types
                                   #   + eventToAuditRow() projection (one-way; AuditRow stays display)
      hashChain.ts                 # admin-local append-only chain (seq + previousHash + injectable digest
                                   #   + verify() + E3025-style error) — PORTED from audit-log-integrity
                                   #   (cited), NOT imported; pure deterministic test digest
      auditedMutation.ts           # appendThenAck wrapper + createAuditedMockAdminApiClient(ctx)
                                   #   (granted → append-then-ack w/ auditId; denied → zero append)
      auditEvent.test.ts           # TT-AUDIT-EVENT-SHAPE / PROJECTION / NO-SECRET-EVENT
      hashChain.test.ts            # TT-AUDIT-APPEND-ONLY / VERIFY-OK / VERIFY-TAMPER / SEQ-MONOTONIC
      auditedMutation.test.ts      # TT-AUDIT-ON-MUTATION-<family> (append) + TT-AUDIT-DENY-NOAPPEND-<family>
                                   #   + TT-AUDIT-ID-RESOLVES + TT-AUDIT-CHAIN-AFTER-N
    opsQueue/                      # NEW (row #5) — ops-queue severity + read model
      severity.ts                  # OpsSeverity ordinal + severityRank + tone→severity map (deterministic)
      opsQueueReadModel.ts         # severity-ranked read model over slice #1 OpsQueueItem
      severity.test.ts             # TT-OPS-SEVERITY-MAP / RANK-DETERMINISTIC / COVERS-ALL-QUEUES
      opsQueueReadModel.test.ts    # TT-OPS-READMODEL-RANKED / STABLE-SORT / CONTRACT-SHAPE
    pages/
      DashboardPage.tsx            # wired (P4) to the severity-ranked ops-queue read model (additive)
      AuditPage.tsx                # wired (P4) to the audited typed mock getAudit + integrity-verify note
  docs/
    audit-ops-queue/               # THIS doc set (design/api/test/dev_log) — distinct from slice #1 + row #2
```

> Note: the `apps/admin/src/__tests__/no-secret*.test.ts` guards from slice #1 already scan all of `src/` +
> `dist/`, so the new `audit/` + `opsQueue/` modules are covered automatically; re-run in P4.
