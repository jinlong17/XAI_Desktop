# Discovery Review — xai-admin-audit-ops-queue (roadmap row #5)

> Feature-plan discovery pass. Surface: `apps/admin/` (the SHIPPED isolated Web-line app).
> Roadmap row **#5 of 6** of `xai-admin-dashboard-system-integration`.
> Hard dep row #2 `xai-admin-data-contracts-rbac` = **SHIPPED**; row #1 shell = **SHIPPED**.
> Operator activated the whole admin line 2026-06-06 → no PROPOSED gate applies. Plan **row #5 only**
> (preserve manifest dep order: #6 depends on #5).
> Date: 2026-06-06 · Author: claude-opus-4-8 (feature-plan) · Mode: Fresh.

---

## 1. Problem framing

The admin dashboard has two operator-critical surfaces still on flat, integrity-free fixtures, and a
**safety prerequisite** the manifest's Implementation Order pins before any write-heavy row:

> Implementation Order #4: *"Add mutation flows only when the audit append contract is covered by tests."*

So row #5 is **not** "the audit log page" cosmetically — it is the **audit-append contract** that rows #3/#4
(users/orgs/billing mutations, feature/provider/quota mutations) structurally depend on, plus the operator
**ops triage queue** read model. Two deliverables, per manifest row #5 + INTEGRATION_PLAN §2/§4:

1. **Admin audit log** — an immutable, **append-only** admin audit event contract
   (`actor · action · target · IP · result · timestamp`), reusing the SHIPPED `audit-log-integrity`
   hash-chain precedent where practical, **SEPARATE from user sync audit** (ADR-0013 §D4). Every guarded
   mutation (the 6 RBAC-gated families from row #2) **must** append an audit event — modeled as a contract +
   enforced on the **mock mutation path** so the invariant is testable.
2. **Overview ops queue** — the **read model + severity contract** for the operator triage queue (risky
   logins, tickets, billing/dunning failures, over-quota orgs, high-cost accounts, dormant admins — exactly
   the prototype's 6 queues), built on slice #1's Overview read model.

### What ground truth already gives us (verified on-disk, not assumed)

| Asset | Where | State today | Row #5 action |
|---|---|---|---|
| `MutationAck { applied; auditId? }` | `apps/admin/src/contracts/adminApi.ts:86` | `auditId?` is explicitly commented **"row #5's obligation"** | Row #5 fulfills it: a granted mutation's ack carries an `auditId` from an appended event |
| `createMockAdminApiClient` mutations | `adminApi.ts:206` `ackOrDeny()` | returns `{ applied:false }`, **no `auditId`**, no I/O | Row #5 wraps the granted path to **append-then-ack** (still `applied:false`, now `auditId` set) |
| `MUTATION_PERMISSION` (6 families → key) | `apps/admin/src/authz/permissionKeys.ts:74` | frozen `as const` | Row #5's audit event records `action` from the family + the gating key |
| `AuditRow`/`AuditFilter`/`AuditReadModel` | `apps/admin/src/adapters/types.ts:336-356` | read-only query model, **mock fixture** | Row #5 makes it the **read projection** of the append-only event store + integrity-verifiable |
| `AUDIT` fixture (12 rows) | `apps/admin/src/fixtures/index.ts:134` | `time/who/type/action/object/ip/ok` | Seeds the audit-event store; field-maps 1:1 to the canonical event |
| `OpsQueueItem`/`OpsQueueRow`/`Tone` | `adapters/types.ts:42-59` | flat fixture, `tone` only, **no severity/ranking contract** | Row #5 adds the **severity contract** + read model; wires it through the typed mock |
| `QUEUES` fixture (6 queues) | `fixtures/index.ts:172` | `tone: danger\|warning\|info\|muted` per queue | Seeds the ops-queue read model + severity normalization |
| `AuditPage` / `DashboardPage` | `apps/admin/src/pages/{AuditPage,DashboardPage}.tsx` | read `auditAdapter.query()` / `overviewAdapter.getOpsQueue()` directly | Final phase wires both to the typed mock `AdminApiClient` (REC-2 pattern: contract-bound, no fork) |
| `AuditLogHashChain` (precedent) | `packages/audit-log-integrity/src/index.ts` | SHIPPED: `sequence` + `previousHash` + SHA-256 `hash` + `verify()` + `E3025` | **Pattern reuse** (NOT a runtime import — it is `node:crypto`/server; see Risk R1) |

---

## 2. Candidate options (per design axis)

This row reuses row #2's decided paradigm (contract-only + typed mockable transport, server-authoritative,
W0). The genuinely new decisions are: **(A)** the audit-event contract + integrity mechanism, **(B)** how the
audit-on-mutation invariant is structured + enforced, **(C)** how to reuse the `audit-log-integrity`
precedent in a **browser** app, **(D)** the ops-queue severity contract shape, **(E)** doc landing.

### Axis A — Admin audit-event contract + immutability

- **A1 — Reuse slice #1's existing `AuditRow` as-is (display shape only).** Pro: zero new types. Con: `AuditRow`
  is a **display projection** (`time` is a pre-formatted string, `who`/`object` are display labels, `type` is a
  UI badge enum) — it carries **no `sequence`, no `previousHash`, no `hash`, no machine timestamp, no
  structured actor/target**, so it cannot anchor an integrity chain or an audit-on-mutation join. Rejected as
  the *event* contract.
- **A2 — New canonical append-only `AdminAuditEvent` contract + keep `AuditRow` as its read projection
  (CHOSEN).** Define a structured, machine-first event (`seq`, `tsMs`, `actor`, `action`, `target`, `ip`,
  `result`, `previousHash`, `hash`, optional `permissionKey`/`mutationFamily`) in `apps/admin/src/audit/`.
  `AuditReadModel.query()` returns the existing `AuditRow` **derived from** events (one-way projection,
  mirrors row #2's "authz → display, never reverse"). Pro: integrity-capable; testable; does not fork or
  break slice #1's read model / `AuditPage`; append-only by construction. Con: a deliberate event↔row mapping
  layer (small, pure, tested).

**Decision: A2.** It is the only option that can satisfy the manifest's "immutable audit event" gate while
preserving the SHIPPED read surface.

### Axis B — Audit-on-mutation invariant (the "no silent mutation" rule)

- **B1 — Document-only ("every mutation should append").** Pro: cheap. Con: the manifest gate is *"covered by
  tests"* — a prose rule is not testable and rows #3/#4 could regress silently. Rejected.
- **B2 — Structural invariant enforced on the mock mutation path + append-asserted tests (CHOSEN).** Make a
  **granted** mutation in the mock `AdminApiClient` impossible to ack without first appending an event:
  a single audited-mutation wrapper (`appendThenAck(family, input, role)`) that (1) re-checks `canMutate`
  (deny → `forbidden`, **no append** — a denied mutation must NOT pollute the audit chain), (2) on allow
  appends a structured event to the chain, (3) returns `{ applied:false, auditId: <event.hash|id> }`. Tests
  assert: every granted family appends exactly one event with the correct `action`/`actor`/`result:ok`;
  every denied family appends **zero**; the ack's `auditId` resolves to the appended event; chain `verify()`
  stays green after N mutations. Pro: makes "no-silent-mutation" a property, not a hope; directly satisfies the
  manifest Audit gate; keeps browser advisory + server-authoritative (the *real* enforcement is the server —
  row #5 proves the **contract + mock** path, consistent with row #2 C2). Con: couples the mock client to the
  audit chain (intended — that *is* the invariant).

**Decision: B2.** Note the boundary precisely (see Risk R3): row #5 proves the invariant on the **contract +
mock** path. The browser remains advisory; the production guarantee is server-side (a server that performs the
privileged op inside the same transaction that appends the audit row). Row #5 fixes the **shape + obligation +
test surface** that the real server in rows #3–#5/#6 must honor — it does **not** ship a real server.

### Axis C — Reusing the `audit-log-integrity` hash-chain in a browser app

The SHIPPED `packages/audit-log-integrity` is the precedent (sequence + `previousHash` + SHA-256 + `verify()`
+ `E3025`). **But it imports `node:crypto` (`createHash`)** — it is a server/Node module. Admin is a **Vite
browser app**. Options:

- **C1 — Import `@repo/audit-log-integrity` directly.** Rejected: (a) it is `node:crypto`, won't run in the
  browser bundle as-is; (b) it is shaped for the **sync-v1 server account audit** (`accountId`, sync event
  types `push`/`pull`/`rekey`…) — importing it would couple the admin line to the **PAUSED sync line** and
  risk an ADR-0013 §D4 violation (admin audit must be **separate** from user sync audit). Also a shared-package
  coupling could push the row off W0.
- **C2 — Port the *pattern* into an admin-local, dependency-injected digest hash-chain (CHOSEN).** A small
  admin-local `audit/hashChain.ts` that reproduces the **precedent's algorithm** (monotonic `seq`,
  `previousHash`, canonical-JSON-then-digest `hash`, `verify()` walking the chain, an `E3025`-style integrity
  error) but takes an **injectable digest function** so it is environment-agnostic and synchronously testable.
  The mock/test uses a **pure deterministic digest** (e.g. a small FNV-1a/sha-256-shaped hex over canonical
  JSON — no secret, no I/O); the production note states the real server uses a cryptographic SHA-256 (Web
  Crypto `crypto.subtle.digest` async on the browser side if ever needed, or server `node:crypto`). Pro: keeps
  admin audit **separate** from sync audit (D4 honored), stays **W0** (no shared `@repo/*` change), keeps the
  algorithm faithful to the SHIPPED precedent, fully unit-testable with no async/Node dependency. Con: a small
  amount of duplicated chain logic — accepted, because the alternative couples two independently-evolving
  audit domains.

**Decision: C2.** Document the precedent lineage explicitly in `hashChain.ts` (cite
`packages/audit-log-integrity`) so the reuse is legible, and record the digest-injection seam so a later row
can swap in real Web Crypto / server SHA-256 without changing the chain logic or tests.

> Evidence (web research, 2026-06): SHA-256 hash chains are the standard tamper-evident audit-log technique
> and are fully implementable browser-side via the Web Crypto API (`crypto.subtle`), with each record hashing
> its own data + the previous record's hash; altering any record breaks every subsequent hash. This confirms
> both the algorithm choice and that a browser digest is viable when a real (non-mock) digest is wired later.
> Sources in §7.

### Axis D — Ops-queue severity contract

- **D1 — Keep the flat `tone` field as the only severity signal.** Rejected: the manifest/INTEGRATION_PLAN §2
  asks to *"define read models and queue **severity contract**"* — `tone` is a UI color, not a ranked,
  testable severity model, and gives no deterministic ordering for triage.
- **D2 — Introduce a typed `OpsSeverity` ordinal + a pure `severityRank`/sort + a read model that returns
  severity-ranked queues (CHOSEN).** Add `OpsSeverity = "critical" | "high" | "warning" | "info"` (mapped
  deterministically from the existing `tone` + `count` so no fixture rewrite is forced), a pure ranking
  function, and an `OpsQueueReadModel` that returns queues **sorted by severity then count**. Tests assert the
  ordering is deterministic, total, and stable; that every prototype queue maps to a defined severity; and
  that the contract covers exactly the 6 prototype queues. Pro: gives operators a real triage order; testable;
  additive over slice #1's `OpsQueueItem` (does not break `DashboardPage`). Con: a small mapping table
  (tone→severity) to maintain — pinned by a test.

**Decision: D2.** Severity is derived deterministically from existing fixture fields (no new fixture data
required), so the contract is provable without inventing production data.

### Axis E — Doc landing

- **E1 — Reuse slice #1's `apps/admin/docs/*.md` or row #2's `data-contracts-rbac/`.** Rejected — the operator
  explicitly forbids overwriting either; both are SHIPPED doc sets.
- **E2 — Distinct co-located set under `apps/admin/docs/audit-ops-queue/` + discovery review under
  `docs/reviews/xai-admin-audit-ops-queue/` (CHOSEN).** Mirrors the row #2 precedent exactly (co-located with
  the surface, distinct subdirectory). Pro: zero collision; discoverable; consistent.

**Decision: E2.**

---

## 3. Tradeoffs summary

| Decision | Chosen | Primary win | Accepted cost |
|---|---|---|---|
| A — audit event contract | **A2** new `AdminAuditEvent` + `AuditRow` as projection | integrity-capable + non-breaking | event↔row mapping layer |
| B — audit-on-mutation | **B2** structural invariant on mock path + append-asserted tests | "no silent mutation" is a tested property | mock client couples to audit chain (intended) |
| C — hash-chain reuse | **C2** port pattern → admin-local injectable-digest chain | D4 separation + W0 + faithful to precedent | small duplicated chain logic |
| D — ops-queue severity | **D2** `OpsSeverity` ordinal + pure rank + ranked read model | real, testable triage order | tone→severity table (test-pinned) |
| E — doc landing | **E2** `apps/admin/docs/audit-ops-queue/` + `docs/reviews/...` | no collision; consistent | — |

---

## 4. Recommendation

Build row #5 as a **contract-only, fully test-covered** slice on `apps/admin/` with the row #2 paradigm:

- **`apps/admin/src/audit/`** (NEW): `auditEvent.ts` (canonical `AdminAuditEvent` + actor/action/target/result
  types + the `AuditRow` projection mapper), `hashChain.ts` (admin-local injectable-digest append-only chain,
  ported from the `audit-log-integrity` precedent, with `append`/`list`/`verify` + integrity error), and an
  `auditedMutation.ts` wrapper that makes the audit-on-mutation invariant structural.
- **`apps/admin/src/opsQueue/`** (NEW): `severity.ts` (`OpsSeverity` ordinal + pure `severityRank` + tone→sev
  map) and `opsQueueReadModel.ts` (severity-ranked read model over slice #1's `OpsQueueItem`).
- Wrap the **mock `AdminApiClient`** so granted mutations append-then-ack (`auditId` set, still
  `applied:false`); add `getAudit` integrity + `getOpsQueue` severity to the read side; finally wire
  `DashboardPage` ops queue + `AuditPage` to the typed mock adapter (contract-bound, no fork).

"Green" = audit-event contract + immutability/verify + audit-on-mutation invariant + ops-queue read model +
severity contract + Overview/Audit-page wiring to typed mock adapters, **all unit-tested**, with **NO real
backend deploy and NO real production mutation** (mutations stay `applied:false`). Real audit storage + real
ops-queue data + real server enforcement = later/production rows; scope must not bleed forward.

**Phasing (one phase per feature-build run):**

| Phase | Goal |
|---|---|
| **P1** | Audit-event contract + append-only hash-chain (immutability/verify) — ported from `audit-log-integrity`, admin-local, injectable digest. |
| **P2** | Audit-on-mutation enforcement: audited-mutation wrapper over the mock `AdminApiClient` (granted → append-then-ack with `auditId`; denied → zero append) + append-asserted allow/deny tests. |
| **P3** | Ops-queue read model + `OpsSeverity` contract (severity-ranked, deterministic) over slice #1's `OpsQueueItem`. |
| **P4** | Wire Overview ops queue + Audit log page to the typed mock adapters; integrity-verify the audit read projection; re-run carried no-secret guards + full build. |

---

## 5. Risks

- **R1 (HIGH) — coupling admin audit to the PAUSED sync line / D4 violation.** `audit-log-integrity` is the
  **sync-v1 server account audit** (accountId, push/pull/rekey events) and is `node:crypto`. Importing it (C1)
  would (a) break the browser bundle, (b) entangle admin audit with the paused sync domain, (c) risk leaving
  W0. **Mitigation: C2** — port the *pattern* into an admin-local, dependency-injected chain; cite the
  precedent in comments; **no** `@repo/audit-log-integrity` import; admin audit stays a separate domain.
- **R2 (HIGH) — browser-as-integrity-boundary / "real enforcement" overclaim.** Row #5 must not imply the
  browser hash-chain is the security/integrity guarantee. **Mitigation:** mirror row #2 C2 — document
  (and test, via an advisory-note style assertion) that the browser path is the **contract + mock**; the
  production guarantee is **server-side** (privileged op + audit append in one server transaction). Browser
  predicate stays advisory; mock holds no secret. The audit-on-mutation invariant is proven on the **mock**
  path as the *shape* the server must honor.
- **R3 (MED) — audit-on-mutation invariant misread as "production no-silent-mutation".** The invariant is
  structural over the **mock** client (no real write — `applied:false`). **Mitigation:** non-goals explicit;
  tests named to make clear they assert the contract/mock obligation; `auditId` present while `applied:false`
  (audit recorded, no real effect this row).
- **R4 (MED) — breaking slice #1's `AuditReadModel`/`AuditPage` or `OverviewReadModel`/`DashboardPage`.**
  **Mitigation:** A2/D2 are **additive** — `AuditRow` stays the read projection (one-way map from events),
  `OpsQueueItem` is unchanged (severity is derived, ranking is a new read model). Re-export, never re-declare
  (REC-3 lineage from row #2). Slice #1 + row #2 test suites must stay green.
- **R5 (MED) — scope creep into rows #3/#4/#6 (real audit storage, real mutations, real ops data, deploy).**
  **Mitigation:** "green = contracts + tests, no server/no real write" frozen; mutations `applied:false`;
  read data stays fixture-seeded; deploy/observability is row #6.
- **R6 (LOW) — immutability is only "by convention" in the contract.** **Mitigation:** model append-only
  structurally — no edit/delete method on the chain; `verify()` detects tamper (sequence gap / previousHash
  mismatch / hash mismatch, E3025-style); a test mutates a serialized entry and asserts `verify()` throws.
- **R7 (LOW) — `syncScope` / cross-device temptation.** Admin audit/ops read models must stay **out** of
  cross-device persistence (ADR-0013 §D4, sync line PAUSED). **Mitigation:** no `syncScope` entity; noted as
  deferred, not designed in. (D4 also independently requires admin audit ≠ user sync audit — satisfied by C2.)
- **R8 (LOW) — secret material in audit fixtures/events.** Audit/ops data must carry no service-role creds or
  provider secret material (slice #1 hard invariant). **Mitigation:** events carry only actor/action/target/
  IP/result; providers stay key-status-only; carried `TT-NO-SECRET-SRC/BUNDLE` re-run over the new modules.

---

## 6. Open questions (for feature-review)

- **OQ-A (resolve/confirm):** C2 — admin-local ported hash-chain with an **injectable digest**, NOT importing
  `@repo/audit-log-integrity`. Confirm this is the right separation (keeps D4 + W0 + browser-safe) vs any
  preference to factor a shared audit primitive (which would be a separate web-line + D3 decision, not row #5).
- **OQ-B (resolve/confirm):** B2 — the audit-on-mutation invariant is proven on the **mock** `AdminApiClient`
  path (`applied:false` + `auditId` set; denied → zero append). Confirm the contract documents the **server**
  as the real enforcer (privileged op + append in one transaction), consistent with row #2 C2.
- **OQ-C (resolve/confirm):** Whether to **rewire** the granted mutation path *inside* `createMockAdminApiClient`
  (so the existing mock client itself becomes audited — cleanest single seam) vs add a separate
  `createAuditedMockAdminApiClient` wrapper that composes the row #2 mock. Recommend **wrap** (additive,
  preserves row #2's `adminApi.test.ts` exactly) — confirm in review; record the choice in P2.
- **OQ-D (defer to row, noted):** the **real** audit store (DB/append-only table + server hash-chain + query
  endpoint) and **real** mutation effects = rows #3–#5/#6 when a real transport lands. Row #5 fixes the
  contract + mock + test surface only.
- **OQ-E (defer to row, noted):** Digest algorithm for the **production** chain (Web Crypto `crypto.subtle`
  async vs server `node:crypto` SHA-256) is finalized when the real backend lands; row #5 fixes the
  injectable-digest seam + a deterministic pure test digest.
- **OQ-F (out of scope, noted):** cross-device persistence of admin audit/ops (ADR-0013 §D4 / PAUSED `sync`
  line). Out of scope; no `syncScope` entity added; admin audit stays separate from user sync audit.
- **OQ-G (build-time choice):** whether to also rewire slice #1's `mockAdminCommandAdapter` to delegate to the
  audited mock client (row #2 deferred this to "row #3"). Recommend **keep deferred** — row #5 owns the
  audited mock client + the contract; the page wiring uses the audited `AdminApiClient` directly. Record in P4.

---

## 7. Research evidence (web)

External research was performed because row #5 makes a technology/mechanism decision (audit-log integrity in a
browser context + the hash-chain reuse). Internal-only axes (B, D, E) needed no web research.

- Query: `append-only audit log hash chain browser Web Crypto subtle digest tamper-evident 2025`. Findings:
  SHA-256 hash chains are the standard tamper-evident audit-log mechanism; each record hashes its own data +
  the previous record's hash, so altering any record breaks every subsequent hash (matches the
  `audit-log-integrity` precedent's `previousHash`+`verify()` design); the full scheme (SHA-256/AES/ECDSA) is
  implementable **browser-side via the Web Crypto API** — confirming both the algorithm choice (A2/C2) and
  that a real browser digest is viable when wired later (OQ-E). Append-only is enforced at the application +
  storage layer (no update of existing rows) — matches R6's structural-immutability mitigation.

Sources:
- [Building a Tamper-Evident Audit Log with SHA-256 Hash Chains (Zero Dependencies) — DEV Community](https://dev.to/veritaschain/building-a-tamper-evident-audit-log-with-sha-256-hash-chains-zero-dependencies-h0b)
- [The Architecture Behind Tamper-Proof Audit Logs — DEV Community](https://dev.to/robertatkinson3570/the-architecture-behind-tamper-proof-audit-logs-56ek)
- [Immutable Audit Log Architecture — Emergent Mind](https://www.emergentmind.com/topics/immutable-audit-log)
- [How do you design tamper-evident audit logs (Merkle trees, hashing)? — Design Gurus](https://www.designgurus.io/answers/detail/how-do-you-design-tamperevident-audit-logs-merkle-trees-hashing)
- [An open-source append-only ledger — Trillian / transparency.dev](https://transparency.dev/)
