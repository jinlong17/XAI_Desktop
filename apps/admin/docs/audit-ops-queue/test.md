# test.md — xai-admin-audit-ops-queue

> Validation strategy / mock strategy / acceptance criteria for the admin **audit log + ops queue** layer
> (row #5). Runner: Vitest (`pnpm --filter @repo/admin test`). Build gate:
> `pnpm --filter @repo/admin build` (vite). Row #5 is **contract-only**: every gate is a unit/contract test
> with a **mockable transport** + **pure functions** — NO server deploy and NO real mutation are required for
> "green". Builds on slice #1's + row #2's suites (must remain green + unaffected).

## 0. Acceptance criteria (binary, testable) — derived from manifest row #5 + INTEGRATION_PLAN §2/§4

| AC | Criterion | Test(s) | Phase |
|---|---|---|---|
| **AC-1** | A canonical, append-only `AdminAuditEvent` contract exists (`actor·action·target·ip·result·timestamp` + chain fields); `AuditRow` is a one-way projection of it (no fork) | `TT-AUDIT-EVENT-SHAPE`, `TT-AUDIT-PROJECTION` | P1 |
| **AC-2** | The audit chain is **append-only + tamper-evident**: monotonic `seq`, `previousHash` link, digest `hash`, `verify()` detects tamper (E3025-style); no edit/delete method | `TT-AUDIT-APPEND-ONLY`, `TT-AUDIT-SEQ-MONOTONIC`, `TT-AUDIT-VERIFY-OK`, `TT-AUDIT-VERIFY-TAMPER` | P1 |
| **AC-3** | Hash-chain pattern is reused from `audit-log-integrity` **without importing it** (admin-local, injectable digest; cited) — keeps W0 + D4 separation | `TT-AUDIT-NO-PKG-IMPORT`, `TT-AUDIT-DIGEST-INJECTABLE` | P1 |
| **AC-4** | **Audit-on-mutation invariant:** every GRANTED mutation family appends exactly one correct audit event; the ack carries a resolving `auditId` (still `applied:false`) | `TT-AUDIT-ON-MUTATION-<family>` (×6), `TT-AUDIT-ID-RESOLVES`, `TT-AUDIT-APPLIED-FALSE` | P2 |
| **AC-5** | **No-silent / deny-no-pollute:** every DENIED mutation family appends ZERO events; chain `verify()` stays green after N mixed mutations | `TT-AUDIT-DENY-NOAPPEND-<family>` (×6), `TT-AUDIT-CHAIN-AFTER-N` | P2 |
| **AC-6** | Audit-on-mutation is documented + tested as **server-authoritative; browser advisory** (mock proves the obligation shape; no real write) | `TT-AUDIT-ADVISORY-NOTE`, `TT-AUDIT-NO-IO` | P2 |
| **AC-7** | Ops-queue **severity contract**: deterministic `OpsSeverity` map covering all 6 prototype queues + a total, stable severity rank | `TT-OPS-SEVERITY-MAP`, `TT-OPS-SEVERITY-COVERS-ALL-QUEUES`, `TT-OPS-RANK-DETERMINISTIC` | P3 |
| **AC-8** | Ops-queue **read model** returns severity-ranked queues; output preserves the `OpsQueueItem` shape (no fork) + carries a defined severity | `TT-OPS-READMODEL-RANKED`, `TT-OPS-STABLE-SORT`, `TT-OPS-READMODEL-CONTRACT-SHAPE` | P3 |
| **AC-9** | Audit read side projects the chain to `AuditRow[]` (filterable, integrity-verifiable); Dashboard ops queue + Audit page wired to the typed mock adapters (no fork, no inline mock) | `TT-AUDIT-READ-PROJECTION`, `TT-AUDIT-READ-VERIFY`, `TT-WIRE-DASHBOARD-OPS`, `TT-WIRE-AUDIT-PAGE` | P4 |
| **AC-10** | No service-role token / provider secret in admin src or built bundle (carried invariant; covers new modules) | `TT-NO-SECRET-SRC`, `TT-NO-SECRET-BUNDLE` (slice-#1 guards, re-run) | P4 |
| **AC-11** | `apps/admin` builds green + all tests (slice #1 + row #2 + row #5) pass; slice #1 + row #2 behavior unaffected | `TT-BUILD`, full `vitest run` | P4 |

## 1. Unit coverage

### Audit event + projection (`audit/auditEvent.ts`)
- **TT-AUDIT-EVENT-SHAPE**: `AdminAuditEvent` carries `seq`/`tsMs`/`actor`/`action`/`target`/`ip`/`result`/
  `previousHash`/`hash` (+ optional `permissionKey`/`mutationFamily`); `actor`/`target` are structured
  (machine-first), not display strings; `result` ∈ `"ok"|"denied"|"error"`.
- **TT-AUDIT-PROJECTION**: `eventToAuditRow(event)` produces a slice #1 `AuditRow` (all 7 fields), one-way:
  `who`←actor, `object`←target, `ok`←`result==="ok"`, `type` derived; a round-trip note asserts there is **no**
  `rowToEvent` (projection is one-directional — no fork/reverse).
- **TT-AUDIT-NO-SECRET-EVENT**: a constructed event over the `AUDIT` fixture carries no key-shaped/secret
  string (defense-in-depth alongside the whole-src guard).

### Append-only hash-chain (`audit/hashChain.ts`)
- **TT-AUDIT-APPEND-ONLY**: `AdminAuditChain` exposes `append`/`list`/`verify` and **no** edit/delete method
  (structural — assert the instance/prototype surface); `list()` returns copies (mutating the result does not
  change the chain).
- **TT-AUDIT-SEQ-MONOTONIC**: `seq` starts at 1 and increments by 1 per append; genesis `previousHash === null`;
  each subsequent `previousHash === prior.hash`.
- **TT-AUDIT-VERIFY-OK**: `verify()` passes for a chain built via `append` over N events.
- **TT-AUDIT-VERIFY-TAMPER**: mutating a serialized entry (alter a field / drop one / swap order) makes
  `verify()` throw `AdminAuditIntegrityError` (`code === "E3025"`) for each of: sequence gap, previousHash
  mismatch, hash mismatch.
- **TT-AUDIT-DIGEST-INJECTABLE**: the chain takes a `DigestFn`; two different pure digests produce different
  `hash` values but both `verify()` green (logic is digest-agnostic); the default test digest is pure +
  deterministic (same input → same hex, no I/O).
- **TT-AUDIT-NO-PKG-IMPORT**: a source-text guard asserts `audit/*.ts` does **NOT** import
  `@repo/audit-log-integrity` / `audit-log-integrity` / `node:crypto` (pattern ported, not imported — W0 + D4 +
  browser-safe). A comment citing the precedent is present (legible reuse).

### Audit-on-mutation (`audit/auditedMutation.ts`)
- **TT-AUDIT-ON-MUTATION-<family>** (×6 — banUser, bulkBan, setFeatureRollout, transferOwnership,
  setProviderRouting, setQuota): with a **granted** role, calling the family appends **exactly one**
  `AdminAuditEvent` whose `mutationFamily === family`, `permissionKey === MUTATION_PERMISSION[family]`,
  `result === "ok"`, and `target` derived from the input; chain length grows by exactly 1.
- **TT-AUDIT-DENY-NOAPPEND-<family>** (×6 — **mandatory negatives**): with a role that **lacks** the family's
  key (and the no-role/unauthorized path), calling the family returns `forbidden`/`unauthorized` and appends
  **ZERO** events (chain length unchanged). E.g. `audit`/`finance`/`support` cannot `banUser`;
  `ops`/`support`/`finance`/`audit` cannot `setProviderRouting`; non-super cannot `transferOwnership`.
- **TT-AUDIT-ID-RESOLVES**: a granted mutation's `data.auditId` resolves to the appended event (the event's
  `hash`/id equals `auditId`; `chain.list()` contains it).
- **TT-AUDIT-APPLIED-FALSE**: every granted mutation returns `applied:false` (NO real write this row) while
  `auditId` is set (audit recorded → row #2's `MutationAck.auditId` obligation fulfilled).
- **TT-AUDIT-CHAIN-AFTER-N**: after a mixed sequence of N granted + denied mutations, `chain.verify()` is green
  and chain length === number of **granted** calls (denials did not append).
- **TT-AUDIT-NO-IO**: spies on `fetch` + `localStorage.setItem` assert the audited mock performs **no**
  network/persistence across reads + mutations (no-write seam, mirrors row #2 TT-API-SERVER-AUTHORITATIVE).
- **TT-AUDIT-ADVISORY-NOTE**: a doc/source-presence assertion that `auditedMutation.ts` + this api.md document
  the browser path as the **contract/mock** obligation and name the **server** as the real enforcer
  (privileged op + append in one transaction) — guards R2 from regressing into browser-as-boundary.

### Ops-queue severity (`opsQueue/severity.ts`)
- **TT-OPS-SEVERITY-MAP**: `toSeverity` maps each `tone`(+`count` threshold) to the documented `OpsSeverity`
  deterministically (pinned table); `SEVERITY_ORDER` is a total order (critical>high>warning>info).
- **TT-OPS-SEVERITY-COVERS-ALL-QUEUES**: every one of the 6 prototype `QUEUES` items maps to a **defined**
  severity (no queue unmapped); no extra severities beyond the 4.
- **TT-OPS-RANK-DETERMINISTIC**: `severityRank` is a total comparator (severity desc, then count desc);
  sorting the same input twice yields identical order; antisymmetric/consistent on the fixture.

### Ops-queue read model (`opsQueue/opsQueueReadModel.ts`)
- **TT-OPS-READMODEL-RANKED**: `ranked()` returns queues ordered by severity desc then count desc; the first
  item is the highest-severity/highest-count queue from the fixture.
- **TT-OPS-STABLE-SORT**: equal-severity-equal-count items preserve input order (stable).
- **TT-OPS-READMODEL-CONTRACT-SHAPE**: each `RankedOpsQueueItem` preserves the slice #1 `OpsQueueItem` shape
  (all original fields intact — no fork) **plus** a defined `severity: OpsSeverity`; count of output === count
  of input (ranking reorders, never drops/adds).

### Audit read side + page wiring (P4)
- **TT-AUDIT-READ-PROJECTION**: the audited client's `getAudit(filter)` returns `AuditRow[]` projected from the
  chain (newest first), filtered by `AuditFilter` (text/type/range) — returns bound to slice #1's `AuditRow`
  contract (no fork).
- **TT-AUDIT-READ-VERIFY**: `verifyAuditReadModel` calls `chain.verify()`; a tampered chain surfaces an
  integrity error rather than silently serving altered rows.
- **TT-WIRE-DASHBOARD-OPS**: `DashboardPage` renders the **severity-ranked** ops queue via the read model (no
  inline mock data; reads through the contract). Smoke: the page renders all 6 queues in ranked order.
- **TT-WIRE-AUDIT-PAGE**: `AuditPage` reads through the audited typed mock `getAudit` (or the chain-backed
  `AuditReadModel`) — no inline mock data; existing filters (text/type/range) still work over the projection.

## 2. Contract / source-text guard coverage (carried from slice #1; covers new modules)

- **TT-NO-SECRET-SRC**: slice #1's `apps/admin/src/__tests__/no-secret.test.ts` scans **all** of
  `apps/admin/src/**` — the new `audit/`+`opsQueue/` modules are covered automatically. Re-run; must stay green.
- **TT-NO-SECRET-BUNDLE**: slice #1's `apps/admin/src/__tests__/no-secret-bundle.test.ts` (self-building) scans
  `dist/**` — the new modules' compiled output is covered. Re-run; must stay green.
- **TT-CSP-GUARD**: unchanged (no `_headers` change this row); re-run to confirm no regression.

## 3. Mock strategy (Typed Contract Mock + pure functions — recap + extension)

- **The interface is the seam.** Row #5 adds three admin-local seams: the **audit-event contract + chain**
  (pure data + injectable-digest class), the **audited `AdminApiClient`** (wraps row #2's mock; granted →
  append-then-ack, denied → zero append), and the **ops-queue severity + read model** (pure functions over the
  unchanged `OpsQueueItem`). Tests target the *interface/contract* so a later real transport inherits the same
  test surface.
- **No real server, no real auth secret, no real mutation, no real audit store** in any test. The audited mock
  performs no I/O and returns `applied:false`. The chain digest is a pure deterministic function. Severity is
  derived from existing fixtures (no invented production data).
- **Fixtures** reused from slice #1 (`AUDIT`, `QUEUES`) — no new fixtures with secret-shaped strings; providers
  stay key-status-only. The `AUDIT` fixture seeds the event store via the inverse field-map.

## 4. Build / regression

- **TT-BUILD**: `pnpm --filter @repo/admin build` exits 0; `dist/` produced; no `.map` emitted (slice-#1
  `sourcemap:false` retained).
- **Full suite**: `pnpm --filter @repo/admin test` → slice #1's tests + row #2's tests + row #5's new tests all
  pass. (Row #2 left the suite at 191 passed / 14 files; row #5 adds the `audit/*` + `opsQueue/*` test files.)
- **Regression boundary**: `pnpm --filter @repo/web build` green + unaffected (admin is a separate app; row #5
  adds no shared module; no `@repo/web-auth-device-session` / `@repo/audit-log-integrity` change).
- **`tsc --noEmit`**: clean (the event/chain/severity types + the audited client all compile).
- **Known flake (carried, non-blocking):** slice #1's `pages.smoke.test.tsx > 用户管理 (users)` can time out
  under heavy parallel load (5s default) — pre-existing slice #1 behavior, not row #5; re-run isolated if hit.

## 5. Out of scope for row #5 tests (deferred by row — explicit)

- Real audit **store** (DB / append-only table / server hash-chain / query endpoint) integration test → rows
  #3–#5 (real transport) / #6 (deploy). Row #5 tests the contract + admin-local chain + mock only.
- Real **mutation effects** (a mutation that actually changes server state, then an audit row written
  server-side in the same transaction) → rows #3–#5. Row #5 mutations are `applied:false`.
- **Production digest** algorithm test (Web Crypto `crypto.subtle` async / server SHA-256) → finalized when a
  real backend lands (OQ-E). Row #5 tests the injectable-digest seam + a pure deterministic digest.
- Real **ops-queue data** (live risky-login/ticket/billing aggregation) → row #3 (aggregation sources). Row #5
  ranks the fixture-seeded queues.
- Rewiring slice #1's `mockAdminCommandAdapter` to delegate to the audited client → kept **deferred** (row #2
  deferred it to "row #3"); page wiring uses the audited `AdminApiClient` directly (OQ-G; record in P4).
- Two-device / cross-device sync of any admin audit/ops read model → ADR-0013 §D4 / PAUSED `sync` line —
  **never** in this row (no `syncScope` entity; admin audit stays separate from user sync audit).
- Manual browser smoke (tables/filters/drawers/focus/mobile) → unchanged from slice #1; re-smoke the Dashboard
  ops queue + Audit page only (they get re-wired to the contract in P4).
