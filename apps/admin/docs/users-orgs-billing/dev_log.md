# dev_log.md — xai-admin-users-orgs-billing

> Workflow state machine + breakpoint continuity. Top panel = overwrite; Work Log = append-only.
> Roadmap row **#3 of 6** of `xai-admin-dashboard-system-integration`. Hard dep row #2 = SHIPPED; rows #1 + #5 = SHIPPED.
> Distinct landing — does NOT overwrite slice #1's `apps/admin/docs/{design,api,test,dev_log}.md`, row #2's
> `apps/admin/docs/data-contracts-rbac/*`, or row #5's `apps/admin/docs/audit-ops-queue/*`.

## Status Panel

| Field | Value |
|---|---|
| **Workflow** | FEATURE_DEV |
| **Target** | xai-admin-users-orgs-billing |
| **Title** | Admin Users / Organizations / Billing wiring (typed read-model adapters · RBAC+audit-gated guarded mutations · Billing read-only with frozen Stripe gate) |
| **Current Phase** | FEATURE_BUILD |
| **Status** | APPROVED — P1+P2+P3 DONE; P4 PENDING |
| **Executor** | claude-opus-4-8 (feature-dev-loop → feature-auto-build host) · impl via `codex exec` (D-Codex) |
| **Updated** | 2026-06-06 23:18 |
| **Suggested Next** | feature-auto-build (P4) |
| **Blockers** | — |
| **Automation Mode** | D-Codex (manifest row #3 default) |
| **Verify Cross-vendor** | yes (manifest row #3 default) |
| **Module** | `admin` (#6) · operator-activated whole line 2026-06-06 · **row #3 of 6** (preserves dep order; #4/#6 depend on #2/#5) |
| **Branch** | `codex/admin/<feature>` (planning-only at this step; no code branch; worktree `claude/frosty-nash-c4bf16`) |
| **D3** | **W0 (web-only, admin-side only)** — no shared `@repo/*` seam modified; no `dev` promotion |

## Decision summary (full snapshot in design.md)

- **Read wiring (R2)** — additive composed read seams in `adapters/index.ts` that delegate Users/Orgs/Billing
  reads to row #2's `AdminApiClient` (async transport boundary); pages keep importing `../adapters`
  (TT-NO-INLINE-MOCK green); slice #1's `usersAdapter`/`orgsAdapter`/`billingAdapter` UNCHANGED (R-1
  additive-seam precedent from row #5; slice #1 `adapters.test.ts` untouched).
- **Mutation graduation (M2)** — swap `AdminUiContext` to inject a guarded command adapter delegating the 3
  page-relevant families (`banUser`, `bulkBan`, `transferOwnership`) to row #5's
  `createAuditedMockAdminApiClient` → row #2 `canMutate` RBAC (deny → forbidden/unauthorized, ZERO append) +
  row #5 `appendThenAck` (allow → audit event + `auditId`, **`applied:false`**). This is the rewire **row #2
  OQ-F + row #5 OQ-G deferred to row #3**. Slice #1 no-op `mockAdminCommandAdapter` + `TT-CMD-NOOP` untouched.
- **Stripe gate (S2)** — Billing READ-ONLY; **NO billing mutation family** added to
  `AdminApiClient`/`MutationFamily`/`MUTATION_PERMISSION`; `BILLING_MANAGE` stays catalogued-but-unwired; the
  gate precondition (server-side webhook-backed idempotent Stripe-mirror + reconciliation + server RBAC +
  audit) is documented + structurally guarded (`TT-BILLING-GATE-NO-MUTATION`). Web-research-grounded
  (review §3: Stripe is the source of truth; DB mirrors via idempotent at-least-once webhooks).
- **Green without a backend** — reads bound to the transport + 3 guarded mutation flows (RBAC + audit, mock,
  `applied:false`) + Billing read-only + Stripe gate + page wiring, all unit/component-tested via the
  mockable transport; NO server deploy, NO real Stripe, NO real write. Real endpoints/effects/billing = later rows.

## Phase Plan (for feature-build — ONE phase per run)

> `feature-build` runs exactly one phase per invocation, then stops for human confirmation.
> Sequence (per operator instruction) = Users read+mutations → Organizations read+owner-transfer → Billing
> read-only + explicit Stripe-gate deferral → wire pages to adapters/RBAC/audit. Each phase is independently
> verifiable by unit/component tests with a mockable transport — NO server deploy required for "green".
> Phase order satisfies the manifest Implementation-Order ("integrate read-heavy pages before write-heavy;
> add mutation flows only when the audit append contract is covered by tests" — the audit contract is already
> SHIPPED in row #5, so the guarded mutations land safely).

| Phase | Goal | Key deliverables | Acceptance gate | Est. commits |
|---|---|---|---|---|
| **P1 — Users read seam + guarded ban/bulk-ban mutations** | Composed Users read seam over the `AdminApiClient`; guarded command adapter (`banUser`/`bulkBan` via row #5 audited client); document server-authoritative posture | `src/adapters/guardedCommands.ts` (`createGuardedCommandAdapter`, `GuardedCommandAdapter`), Users read seam in `adapters/index.ts`, `adapters/guardedCommands.test.ts`, `adapters/usersReadSeam.test.ts` | TT-WIRE-USERS-READ + TT-READ-NO-IO + TT-CMD-GUARDED-ALLOW/DENY-banUser/bulkBan + TT-CMD-AUDIT-ON-MUTATION-banUser/bulkBan + TT-CMD-APPLIED-FALSE + TT-CMD-NO-IO + TT-CMD-ADVISORY-NOTE + TT-CMD-GUARDED-IS-ADDITIVE green (AC-1, AC-2, AC-7, AC-8, AC-10); build + slice-#1/#2/#5 tests unaffected | 1–2 |
| **P2 — Organizations read seam + guarded owner-transfer** | Composed Orgs read seam over the `AdminApiClient`; surface `transferOwnership` on the guarded adapter (SUPER-ONLY) | Orgs read seam in `adapters/index.ts`, `transferOwnership` on `GuardedCommandAdapter`, `adapters/orgsReadSeam.test.ts`, transfer cases in `guardedCommands.test.ts` | TT-WIRE-ORGS-READ + TT-CMD-GUARDED-ALLOW-transferOwnership (super) + TT-CMD-GUARDED-DENY-transferOwnership (non-super ZERO append) + TT-CMD-AUDIT-ON-MUTATION-transferOwnership + TT-CMD-CHAIN-AFTER-N green (AC-3, AC-4) | 1 |
| **P3 — Billing read seam + explicit Stripe-gate deferral** | Composed Billing read seam (READ-ONLY) over the `AdminApiClient`; structurally guard the absence of any billing mutation family; document the gate precondition | Billing read seam in `adapters/index.ts`, `adapters/billingReadSeam.test.ts` (incl. the gate guard) | TT-WIRE-BILLING-READ + TT-BILLING-GATE-NO-MUTATION + TT-BILLING-KEY-CATALOGUED-UNWIRED green (AC-5, AC-6) | 1 |
| **P4 — Wire the 3 pages to the seams + injection swap + carried-guard re-run** | Wire `UsersPage`/`OrgsPage`/`BillingPage` to the composed `../adapters` read seams; swap `AdminUiContext` to inject the guarded command adapter (mock role, fail-closed); Billing renders no mutation control; re-run carried guards + full build | wired `pages/{UsersPage,OrgsPage,BillingPage}.tsx` + `components/AdminUiContext.tsx`, `pages/wiring.users-orgs-billing.test.tsx`, re-run no-secret + no-inline-mock guards + build | TT-WIRE-USERS-PAGE/ORGS-PAGE/BILLING-PAGE + TT-NO-INLINE-MOCK + TT-CMD-NOOP (slice #1 re-run) + TT-NO-SECRET-SRC/BUNDLE + TT-BUILD + full suite + `@repo/web` build green (AC-9, AC-10, AC-11, AC-12) | 1–2 |

> Phase order rationale: P1 lands the guarded-command adapter (the shared mutation seam) alongside the Users
> read seam — the audit-append contract it depends on is already SHIPPED (row #5), so mutations land safely
> (manifest Implementation-Order #4 already satisfied upstream). P2 adds the Orgs read + the SUPER-ONLY
> transfer (independent). P3 lands Billing read-only + the Stripe-gate guard (the row's distinctive
> constraint, isolated so it is independently reviewable). P4 wires the three pages through `../adapters` +
> swaps the `AdminUiContext` injection + re-runs the carried secret/no-inline-mock guards over the now-larger
> src/dist so the new modules + wired pages are provably secret-free and seam-compliant. **R4 (MUST honor in
> P4):** `TT-NO-INLINE-MOCK` is in the P4 gate — pages keep importing `../adapters`, never the
> guarded/audited/mock client directly; page count stays 10.

## Risks (carry into review)

- **R1 (HIGH)** browser-as-security-boundary / "real mutation" overclaim → mitigated by reusing row #2 C2 +
  row #5 B2: browser advisory, server-authoritative; mock `applied:false`; guarded adapter holds no
  service-role credential + does no I/O; documented + tested (`TT-CMD-ADVISORY-NOTE` + `TT-CMD-NO-IO`).
- **R2 (HIGH)** Stripe gate silently regressing (a billing mutation sneaking in) → mitigated by S2: no
  billing mutation family added; `TT-BILLING-GATE-NO-MUTATION` asserts `MutationFamily`/`AdminApiClient`/
  `GuardedCommandAdapter`/`BillingPage` carry no billing mutation; `TT-BILLING-KEY-CATALOGUED-UNWIRED` keeps
  `BILLING_MANAGE` present-but-unwired.
- **R3 (HIGH)** breaking slice #1 / row #2 / row #5 suites → mitigated by additive composed seams (R2/M2
  follow the row #5 R-1 precedent); slice #1 `adapters.test.ts`/`pages.smoke`/`TT-CMD-NOOP`, row #2
  `adminApi.test.ts`, row #5 `auditedMutation.test.ts`/`wiring.test.tsx` must all stay green; slice #1's
  `mockAdminCommandAdapter` UNCHANGED.
- **R4 (MED)** `TT-NO-INLINE-MOCK` regression (a page dropping the `../adapters` import or page count ≠ 10) →
  mitigated: route everything through `../adapters`; no page added/removed; `TT-NO-INLINE-MOCK` is in the P4 gate.
- **R5 (MED)** scope bleed into rows #4/#6 (feature/provider/quota page wiring, real server, deploy) →
  mitigated: row #3 surfaces only the 3 Users/Orgs families on the guarded adapter + wires only those 3 pages;
  `setFeatureRollout`/`setProviderRouting`/`setQuota` keep their row #2/#5 contracts but are NOT page-wired here.
- **R6 (MED)** `AdminCommandAdapter` return-type change rippling (no-op `NoOpResult` → guarded
  `AdminApiResult<MutationAck>`) → mitigated: introduce a distinct `GuardedCommandAdapter` type; pages already
  `await commands.*()` without inspecting the result, so the call sites are stable; OQ-A pins the exact shape.
- **R7 (LOW)** secret material in billing fixtures/transactions → mitigated: carried `TT-NO-SECRET-SRC/BUNDLE`
  (already match `sk_*`/service-role over all `src/`+`dist/`); billing fixtures carry only display amounts/statuses.
- **R8 (LOW)** `syncScope`/cross-device temptation → no `syncScope` entity; ADR-0013 §D4 / PAUSED `sync` out of scope.
- **R9 (LOW)** async-read RTL flakiness (the read seams are Promises) → mitigated: keep the mock transport
  microtask-resolving; use `findBy*`/`waitFor`; do not over-parallelize heavy renders (avoid the known slice
  #1 `pages.smoke` users 5s timeout flake).

## Open questions for feature-review

- **OQ-A (resolve/confirm — build-time contract):** the guarded command adapter's return type
  (`AdminApiResult<MutationAck>`) and a distinct `GuardedCommandAdapter` type vs slice #1's
  `AdminCommandAdapter`/`NoOpResult`. **Recommend:** distinct `GuardedCommandAdapter` returning
  `AdminApiResult<MutationAck>`; keep slice #1's `mockAdminCommandAdapter`/`NoOpResult`/`TT-CMD-NOOP`
  UNCHANGED (additive). Record the chosen shape in P1.
- **OQ-B (resolve/confirm — mock role context):** what role the UI-injected audited client carries
  (`VITE_ADMIN_MOCK_ROLE`, fail-closed when absent) so manual smoke can exercise a granted flow, while unit
  tests construct explicit roles for allow AND deny per family. **Recommend:** default `ops` for ban/bulk-ban;
  note `transferOwnership` is SUPER-ONLY so its allow-path smoke needs `super`. Record in P1/P4.
- **OQ-C (resolve/confirm — Stripe gate posture):** confirm Option **S2** (Billing strictly read-only; NO
  billing mutation family). Sub-question: include an *inert, disabled* `BILLING_MANAGE`-gated placeholder
  (Option S3) or omit. **Recommend:** OMIT (strictly read-only); revisit when webhook-backed state lands.
- **OQ-D (defer to row, noted):** real service-role Users/Orgs read endpoints + real ban/transfer effects
  (server privileged op + audit append in one transaction) = the real transport behind these interfaces,
  later rows. Row #3 fixes the contract + mock + test surface.
- **OQ-E (defer to row, noted):** webhook-backed Stripe state machine + admin billing mutations on top =
  a later row, only after a server line is authorized. Out of scope here (D4 PAUSED; no server).
- **OQ-F (out of scope, noted):** cross-device persistence of any admin user/org/billing read model
  (ADR-0013 §D4 / PAUSED `sync`). No `syncScope` entity added.

## Review Notes (feature-review — 2026-06-06 · claude-opus-4-8)

**Verdict: APPROVED** — 0 blockers, 3 non-blocking build-time confirmations (OQ-A/B/C, already recommended in-plan), 2 build-time precautions. The plan is executable with no blocking ambiguity. All eight gates verified against ground-truth SOURCE (not just docs).

### Gate-by-gate (verified against source)

1. **R2 read-seam — PASS.** Row #2 `contracts/adminApi.ts` confirmed to expose all 7 reads the seam delegates to (`getUsers`/`getUser`/`getOrgs`/`getOrg`/`getBillingMetrics`/`getPlanDistribution`/`getTransactions`), each returning the §1 contract shape via `AdminApiResult<T>` (REC-2 single-source; no fork). The R2 "additive composed seam in `../adapters`" pattern is a real, shipped precedent: row #5 already added `opsQueueReadModel`/`auditChainReadModel` to `adapters/index.ts` lines 282-305 with slice #1 adapters UNCHANGED. `TT-NO-INLINE-MOCK` (`__tests__/no-inline-mock.test.ts`) confirmed present, asserts page count === 10 + `../adapters` import + no `../fixtures`, and is correctly placed in the P4 gate.
2. **M2 guarded-mutation graduation — PASS.** `AdminUiContext.tsx` confirmed to currently inject `commands: mockAdminCommandAdapter` (slice #1 no-op `NoOpResult`) — the exact single-injection swap point. Row #5 `auditedMutation.ts` + `auditedMutation.test.ts` confirm the reused seam: granted → exactly ONE `AdminAuditEvent` + `{applied:false, auditId}`; denied (no role / !canMutate) → `forbidden`/`unauthorized` with ZERO append (tested per family via `TT-AUDIT-ON-MUTATION-<family>` / `TT-AUDIT-DENY-NOAPPEND-<family>`). `MUTATION_PERMISSION` confirms `banUser`/`bulkBan`→`USER_BAN`, `transferOwnership`→`ORG_TRANSFER_OWNER`; `ROLE_GRANTS` confirms `transferOwnership` is SUPER-ONLY (super = full catalog; ops/support/finance/audit lack `ORG_TRANSFER_OWNER`). test.md AC-2/AC-4 require allow + deny + audit-append per family, and the SUPER-ONLY deny on `transferOwnership`. This correctly lands row #2 OQ-F + row #5 OQ-G.
3. **S2 Stripe gate — PASS.** Row #2 `AdminApiClient` confirmed to ship 6 mutations, NONE billing; `permissionKeys.ts` confirms `BILLING_MANAGE: "admin.billing.manage"` is in the catalog but NOT a `MUTATION_PERMISSION` value (catalogued-but-unwired, exactly as claimed). `TT-BILLING-GATE-NO-MUTATION` (api.md §6 / test.md AC-6) structurally asserts no `billing*` family on `MutationFamily`/`AdminApiClient`/`GuardedCommandAdapter` and no `commands.*`-bound control on `BillingPage` (currently read-only — `BillingPage.tsx` has zero mutation affordance). Gate precondition ("server-side webhook-backed idempotent Stripe-mirror + reconciliation + server RBAC + audit") documented as the unmet precondition. Web-research grounding (Stripe = source of truth; idempotent at-least-once webhooks) is appropriate and not over-engineered into scope.
4. **Contract-only scope — PASS.** Frozen assumption #1 + test.md §0 fix "green" = read-model contracts + adapter wiring + RBAC+audit-gated mock mutations (`applied:false`) + tests, with a mockable transport; NO real backend / Stripe / production write. No bleed into #4/#6: `setFeatureRollout`/`setProviderRouting`/`setQuota` keep their row #2/#5 contracts but are explicitly NOT surfaced on `GuardedCommandAdapter` nor page-wired (R5; api.md §3). `apps/admin` is genuinely isolated (`@repo/admin` private app, own vite build).
5. **W0 / boundary — PASS.** No shared `@repo/*` MODIFICATION. `package.json` confirms NO `@repo/audit-log-integrity` dependency (row #5 ported the hash chain locally → node:crypto-free bundle, honored). `@repo/web-auth-device-session` is a pre-existing slice-#1 runtime dep that row #3 consumes but does not change (plan says "no CHANGE", consistent). No `@repo/core/src/events`, no Tauri (admin is a browser Vite SPA). D3 = W0 correctly classified.
6. **No secrets / no syncScope — PASS.** Carried `TT-NO-SECRET-SRC` (scans all `src/**`) + `TT-NO-SECRET-BUNDLE` (self-building `dist/**` scan, incl. `sk_test_`/`sk_live_`/service-role/masked-key patterns) confirmed present and in the P4 gate; billing fixtures display-only. No `syncScope` entity (assumption #8; D4 PAUSED).
7. **Builds on #1/#2/#5, no fork/overwrite — PASS.** Slice #1 `usersAdapter`/`orgsAdapter`/`billingAdapter`/`mockAdminCommandAdapter` + `TT-CMD-NOOP` left intact (additive); row #2 `adminApi.test.ts` + row #5 `auditedMutation.test.ts`/`wiring.test.tsx` must stay green (R3). Doc landing under `apps/admin/docs/users-orgs-billing/` is distinct — does not collide with slice #1 (`apps/admin/docs/`), row #2 (`data-contracts-rbac/`), or row #5 (`audit-ops-queue/`).
8. **Phasing + doc-contract — PASS.** P1→P4 each independently unit/component-verifiable with a mockable transport; phase order satisfies manifest Implementation-Order #3/#4 (read-heavy before write-heavy; audit-append contract already SHIPPED in row #5 so guarded mutations land safely). design/api/test/dev_log mutually consistent; dev_log maintains Workflow/Executor/Updated/Suggested Next + append-only Work Log; Automation Mode (D-Codex) + Verify Cross-vendor (yes) carried from manifest row #3.

### Non-blocking notes for feature-build (do NOT require re-plan)

- **OQ-A (build-time, plan-recommended):** introduce a distinct `GuardedCommandAdapter` returning `AdminApiResult<MutationAck>`; keep slice #1's `AdminCommandAdapter`/`NoOpResult`/`TT-CMD-NOOP` UNCHANGED. Pin the exact shape in P1. (R6 ripple is low — pages already `await commands.*()` without inspecting the result; confirmed in `UsersPage.tsx`/`OrgsPage.tsx`.)
- **OQ-B (build-time, plan-recommended):** `VITE_ADMIN_MOCK_ROLE` fail-closed when absent; default `ops` for ban/bulk-ban smoke, but note `transferOwnership` allow-path smoke needs `super` (SUPER-ONLY). Unit tests construct explicit roles (do NOT depend on env).
- **OQ-C (build-time, plan-recommended):** confirm S2 (Billing strictly read-only; OMIT the inert S3 placeholder). Recommend OMIT — a disabled affordance risks implying a write path the gate forbids.
- **Precaution 1 (P4, RTL async):** the three pages currently call slice #1 adapters SYNCHRONOUSLY in render (`billingAdapter.metrics()`, `usersAdapter.list(...)`, `orgsAdapter.list()` — verified in source). Converting to the async `AdminApiResult` seams changes render timing; use `findBy*`/`waitFor` and a microtask-resolving mock transport (R9; test.md §2 note). The slice #1 `pages.smoke` users 5s flake is pre-existing and non-blocking.
- **Precaution 2 (P1, savedViews/filterChips):** api.md §2 correctly keeps `usersAdapter.savedViews()`/`filterChips()` (and table column configs) as SYNC UI config sourced from the slice #1 adapter — only row data flows through the transport. Honor this split so `UsersPage` view-tab counts (which call `usersAdapter.list({view})` synchronously today) are handled deliberately during the P4 async conversion.

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Users read seam + guarded ban/bulk-ban | DONE | `d5c8ff6` |
| P2 — Organizations read seam + guarded owner-transfer | DONE | `8cfa374` |
| P3 — Billing read seam + explicit Stripe-gate deferral | DONE | _(pending commit hash, set below)_ |
| P4 — Wire pages + injection swap + carried-guard re-run | PENDING | — |

## Work Log (append-only)

### Round 1 — 2026-06-06 21:40 · feature-plan (Fresh)

- **Executor**: claude-opus-4-8 (feature-plan)
- **Mode**: Fresh — no prior planning artifacts for slug `xai-admin-users-orgs-billing` (verified on disk: no
  `docs/reviews/xai-admin-users-orgs-billing/`, no `apps/admin/docs/users-orgs-billing/`, no `_intake/` brief).
  Requirement delivered inline as manifest row #3; hard dep row #2 = SHIPPED, rows #1 + #5 = SHIPPED (both #2
  and #5 dev_logs record `Suggested Next = feature-plan (row #3)`); operator activated the whole admin line
  and instructed **plan row #3 ONLY** (preserve manifest dep order for #4/#6).
- **Goal**: Plan roadmap row #3 — wire the Users / Organizations / Billing pages to typed read-model adapters
  through the row #2 `AdminApiClient` transport, graduate their guarded mutations (ban / bulk-ban /
  owner-transfer) from slice #1 no-op to RBAC+audit-gated mocks (row #2 + row #5), and keep Billing read-only
  behind a documented Stripe gate. Deliver as a contract/wiring-only slice with a mockable transport (no
  server deploy, no real Stripe, no real write).
- **Done**:
  - Read manifest row #3 + Implementation Order + Verification Gates; INTEGRATION_PLAN §2 (Users/Orgs/Billing
    rows + gaps) + §4.4 (guarded mutations); SHIPPED slice #1 design/api + row #2 design/api/test/dev_log
    (read models · permission keys · RBAC · `AdminApiClient`) + row #5 design/api/test/dev_log (audit-on-
    mutation invariant · `createAuditedMockAdminApiClient`); ADR-0013 (D3 W0 / D4 sync PAUSED); PLUGIN_MAP
    (`@repo/plugin-web-settings-rest` = Stable Stripe stub = concept reference only; `@repo/web-auth-device-
    session` = Stable, do not modify); CLAUDE.md boundaries; SOP_NEW_FEATURE; SUBAGENT_WORKFLOW_V2 state-write
    rules (first NEEDS_REVIEW writes `Automation Mode` + `Verify Cross-vendor`).
  - Inspected the load-bearing source: row #2 `contracts/adminApi.ts` (18 reads incl.
    `getUsers`/`getUser`/`getOrgs`/`getOrg`/`getBillingMetrics`/`getPlanDistribution`/`getTransactions`; 6
    mutations — **none billing**; `createMockAdminApiClient` fixture-only, `applied:false`, no I/O); row #2
    `authz/{permissionKeys,rbac}.ts` (`MUTATION_PERMISSION` — banUser/bulkBan→`USER_BAN`,
    transferOwnership→`ORG_TRANSFER_OWNER` SUPER-ONLY REC-1; `BILLING_MANAGE` present but **unmapped to any
    mutation family**); row #5 `audit/auditedMutation.ts` (`createAuditedMockAdminApiClient` →
    `{ client, chain }`; `appendThenAck` granted-append/denied-zero; `applied:false` + `auditId`); slice #1
    `adapters/{types,index}.ts` (`Users/Orgs/BillingReadModel`; mock adapters pinned by `adapters.test.ts`;
    row #5 added composed seams here as the R-1 precedent), `adapters/commands.ts`
    (`mockAdminCommandAdapter` no-op `NoOpResult` — OQ-F/OQ-G deferred its rewire to **row #3**),
    `components/AdminUiContext.tsx` (injects `commands: mockAdminCommandAdapter` — **the injection row #3
    swaps**), `pages/{UsersPage,OrgsPage,BillingPage}.tsx` (Users/Orgs call `commands.*`; Billing
    display-only), the carried guards `__tests__/{no-inline-mock,no-secret,csp}.test.ts` (pages must import
    `../adapters`, never `../fixtures`, 10 pages; `sk_test_`/`sk_live_`/service-role forbidden over all
    `src/`); `package.json` (no `@tanstack/react-table` dep — hand-built `DataTable`).
  - Web research (2026-06): confirmed the Stripe gate reflects a real engineering constraint — Stripe is the
    source of truth; the DB mirrors subscription state via **at-least-once webhooks** whose `event.id` is
    stored UNIQUE and whose idempotency record + state mutation share ONE transaction; admin billing actions
    require reconciliation tooling over Stripe's Events API. A safe admin billing mutation is only possible on
    top of that server-side state machine (which does not exist; D4 PAUSED) — and the browser can never
    originate a billing write (no Stripe secret; already guarded). This validates S2 (billing read-only / no
    billing mutation family). Sources recorded in the discovery review §3/§8. (This was the only part needing
    external research; the Users/Orgs wiring reuses SHIPPED seams.)
  - Resolved 3 design axes: R2 (additive composed read seams over the `AdminApiClient`), M2 (guarded command
    adapter delegating to row #5's audited client — the OQ-F/OQ-G graduation), S2 (Billing read-only / no
    billing mutation family / documented+guarded Stripe gate). Recorded as ADR-lite #1–#3 in design.md.
  - Chose **distinct doc landing**: discovery review under `docs/reviews/xai-admin-users-orgs-billing/`;
    four-piece set under `apps/admin/docs/users-orgs-billing/` (co-located with the surface; does NOT
    overwrite slice #1 / row #2 / row #5 docs).
  - Wrote: discovery review (problem framing + ground-truth inventory + Stripe-gate research + R/M/S options +
    recommendation + risks/OQs + sources) + design.md (decision snapshot + ADR-lite #1–#3 + frozen
    assumptions + dependency overview + directory shape) + api.md (composed read seams + guarded command
    adapter + `AdminUiContext` injection swap + RBAC mapping + mock role context + Stripe-gate contract +
    fail-closed/server-authoritative semantics) + test.md (AC-1..AC-12 → test mapping; allow/deny + audit per
    guarded family; the Stripe-gate structural guard; carried-guard re-run; mock-transport coverage) + this dev_log.
  - Phased the plan into 4 one-phase-per-run build phases per the operator's suggested split: Users
    read+mutations → Organizations read+owner-transfer → Billing read-only + Stripe-gate deferral → wire pages
    to adapters/RBAC/audit.
- **Commits**: — (planning artifacts only; no code branch; worktree `claude/frosty-nash-c4bf16`)
- **Tests**: — (none run; planning phase)
- **Risks**: see Risks section (R1/R2/R3 HIGH).
- **Next step**: feature-review — review discovery report + design/api/test/dev_log; verify the R2/M2/S2
  decisions, the W0 boundary (no shared-package change; no `@repo/audit-log-integrity` import; no
  `@repo/web-auth-device-session` change; no `@repo/core/src/events`; no Tauri), the read-seam binding to the
  `AdminApiClient` transport, the guarded-mutation graduation (RBAC allow/deny + audit-on-mutation per family;
  `transferOwnership` SUPER-ONLY deny ZERO append) as the realization of row #2 OQ-F / row #5 OQ-G, the Stripe
  gate (Billing read-only; NO billing mutation family; catalogued-but-unwired `BILLING_MANAGE`; structural
  guard), the "green-without-a-backend / no real Stripe / no real write" scoping, the additive-seam no-fork
  posture (slice #1 + row #2 + row #5 suites stay green; `TT-NO-INLINE-MOCK` in the P4 gate), and that the
  manifest dependency order for #4/#6 is preserved; give APPROVED or REVISE.

### Round 2 — 2026-06-06 22:18 · feature-review (APPROVED)

- **Executor**: claude-opus-4-8 (feature-review)
- **Mode**: Review — `Status = NEEDS_REVIEW`, `Suggested Next = feature-review` (Fresh plan from Round 1).
- **Action**: Reviewed all four planning artifacts (discovery review + design/api/test/dev_log) against the 8
  required gates, then verified each claim against ground-truth SOURCE (not docs):
  - Read row #2 `contracts/adminApi.ts` (18 reads incl. the 7 the seam needs; 6 mutations, NONE billing;
    `MutationAck.auditId`; `createMockAdminApiClient` fail-closed `applied:false` no-I/O),
    `authz/permissionKeys.ts` (`MUTATION_PERMISSION` 6-family map; `BILLING_MANAGE` catalogued but NOT a
    mutation-family value — append-only `PERMISSION_KEYS_SNAPSHOT_V1`), `authz/rbac.ts` (`canMutate` advisory
    fail-closed; `ROLE_GRANTS` → `transferOwnership`/`ORG_TRANSFER_OWNER` SUPER-ONLY; `RBAC_ADVISORY_NOTE`).
  - Read row #5 `audit/auditedMutation.ts` (`createAuditedMockAdminApiClient` → `{client, chain}`;
    `appendThenAck` granted-append-then-ack / denied-zero-append; `applied:false`+`auditId`; WRAPs row #2 mock
    for reads) + `auditedMutation.test.ts` (granted → exactly ONE event; every non-granted role → ZERO append —
    per family).
  - Read slice #1 `adapters/types.ts` (the 3 read-model contracts + `AdminCommandAdapter`/`NoOpResult`),
    `adapters/index.ts` (slice #1 adapters + the row #5 composed-seam precedent at lines 282-305 = proof the R2
    pattern is real & additive), `adapters/commands.ts` (no-op `mockAdminCommandAdapter`),
    `components/AdminUiContext.tsx` (injects `commands: mockAdminCommandAdapter` — the M2 swap point),
    `pages/{UsersPage,OrgsPage,BillingPage}.tsx` (Users/Orgs `await commands.*()` without inspecting result →
    R6 low-risk; Billing zero mutation affordance → S2 already satisfied at UI level; all read slice #1 adapters
    SYNCHRONOUSLY → Precaution 1 async-conversion note).
  - Read carried guards `__tests__/{no-inline-mock,no-secret,no-secret-bundle}.test.ts` (page count 10 +
    `../adapters` import; `sk_*`/service-role over `src/`+self-building `dist/`).
  - Cross-checked roadmap row #3 text + Implementation-Order #3/#4 + INTEGRATION_PLAN §2 (Billing→Stripe
    webhook gap) + §4.4/§4.5 (guarded mutations after RBAC+audit green; Stripe webhook-backed state before
    admin billing mutations) — plan framing matches exactly. `package.json` confirms `@repo/admin` is an
    isolated private app with NO `@repo/audit-log-integrity` dep (node:crypto-free).
- **Findings**: 0 blockers. All 8 gates PASS. 3 build-time confirmations (OQ-A/B/C, already plan-recommended)
  + 2 build-time precautions (P4 RTL async timing; P1 savedViews/filterChips sync-config split) recorded as
  non-blocking notes for feature-build. No fork of the row #2 read-model contract; no scope bleed into #4/#6;
  Stripe gate structurally guarded; W0 boundary clean.
- **Verdict**: **APPROVED** → `Current Phase = FEATURE_REVIEW`, `Status = APPROVED`, `Suggested Next = feature-build`.
- **Commits**: — (review only; dev_log Review Notes + Status written; no code)
- **Tests**: — (review reads source; runs no tests)
- **Next step**: feature-build — implement P1 (Users read seam + guarded ban/bulk-ban) per the Phase Plan;
  honor OQ-A (distinct `GuardedCommandAdapter`, slice #1 no-op + `TT-CMD-NOOP` untouched) and OQ-B (fail-closed
  `VITE_ADMIN_MOCK_ROLE`; tests use explicit roles). One phase per run.

### Round 3 — 2026-06-06 22:54 · feature-auto-build (P1) [feature-dev-loop · D-Codex]

- **Executor**: claude-opus-4-8 (feature-dev-loop orchestrator, acting as feature-auto-build host) — implementation
  delegated to **`codex exec`** (codex-cli 0.135.0) per `Automation Mode = D-Codex`. The Claude host prepared the
  delegation prompt (pinning every upstream contract), reviewed the diff, ran the gates, and committed; it wrote NO
  production code/test itself.
- **Mode**: Run — `Status = APPROVED`, all 4 phases PENDING; auto-loop executing P1 first.
- **Action (P1 — Users read seam + guarded ban/bulk-ban mutations)**:
  - **NEW** `src/adapters/guardedCommands.ts` — `createGuardedCommandAdapter(ctx?)` → `{ commands, chain }`;
    `GuardedCommandAdapter` (distinct from slice #1's `AdminCommandAdapter`/`NoOpResult`, OQ-A) surfaces ONLY
    `banUser`/`bulkBan`/`transferOwnership`, each delegating to row #5's `createAuditedMockAdminApiClient` (RBAC +
    audit-on-mutation + `applied:false` inherited, NOT re-implemented). Exports `GUARDED_COMMAND_ADVISORY_NOTE`
    (server = real enforcer). No I/O, no real write.
  - **EDIT (append-only)** `src/adapters/index.ts` — added `adminApiClient` (= `createMockAdminApiClient` with
    fail-closed `VITE_ADMIN_MOCK_ROLE`, OQ-B) + `usersReadSeam` (`list`/`get` → `getUsers`/`getUser`,
    `AdminApiResult<T>`). Slice #1 adapters + the row #5 composed-seam block UNCHANGED (verified via `git diff`:
    change is strictly after line 305). `savedViews()`/`filterChips()` deliberately left on the slice #1
    `usersAdapter` (sync UI-config split, P1 precaution).
  - **NEW** `src/adapters/guardedCommands.test.ts` (10) + `src/adapters/usersReadSeam.test.ts` (3).
- **Gate evidence (P1 — host-run, independent of codex's self-report)**:
  - `TT-WIRE-USERS-READ` + `TT-READ-NO-IO` → `usersReadSeam.test.ts` GREEN (delegates to `adminApiClient`; no
    `fetch`/`setItem`).
  - `TT-CMD-GUARDED-ALLOW-banUser/-bulkBan` (role `ops` → `{applied:false, auditId}`, chain +1),
    `TT-CMD-GUARDED-DENY-banUser/-bulkBan` (`support` → `forbidden`; no-role → `unauthorized`; ZERO append),
    `TT-CMD-AUDIT-ON-MUTATION-banUser/-bulkBan` (one event, `mutationFamily`/`permissionKey`/`result:"ok"`),
    `TT-CMD-APPLIED-FALSE`, `TT-CMD-NO-IO`, `TT-CMD-ADVISORY-NOTE`, `TT-CMD-GUARDED-IS-ADDITIVE` (slice #1
    `mockAdminCommandAdapter` still `{ok,noop,reason:"slice-1-mock-no-write"}`) → `guardedCommands.test.ts` GREEN.
  - `pnpm --filter @repo/admin check-types` clean; full suite **297 passed / 23 files** (= 284 baseline UNCHANGED
    + 13 new). Forbidden-import scan (`@repo/audit-log-integrity`/`@repo/core/src/events`/Tauri/`sk_*`/service-role)
    CLEAN. AC-1, AC-2, AC-7(part), AC-8, AC-10(part) covered.
  - **Note (non-blocking, pre-existing):** `pnpm --filter @repo/admin lint` is non-functional — `apps/admin` has no
    `eslint.config.*` for ESLint 9 (pre-existing on HEAD, NOT a P1 regression; lint is not a P1 acceptance gate and
    fixing it is out of P1's `src/`-only scope). Flagged for the verify pass.
- **Commits**: P1 — `feat(admin): row #3 P1 — Users read seam + guarded ban/bulk-ban (RBAC+audit, applied:false)`
  (hash recorded in Phase Progress).
- **Tests**: `pnpm --filter @repo/admin test` → 297/297; `check-types` clean.
- **Risks**: R1/R3/R6 mitigations holding (distinct guarded type; additive; pages not yet touched — P4). R9 (async
  RTL) deferred to P4.
- **Next step**: feature-auto-build P2 — Organizations read seam + SUPER-ONLY `transferOwnership` on the guarded adapter.

### Round 4 — 2026-06-06 23:06 · feature-auto-build (P2) [feature-dev-loop · D-Codex]

- **Executor**: claude-opus-4-8 (feature-auto-build host) — implementation delegated to **`codex exec`** (D-Codex);
  host reviewed diff + ran gates + committed.
- **Mode**: Run — continuing the auto-loop; P1 DONE, P2 next.
- **Action (P2 — Organizations read seam + guarded owner-transfer)**:
  - **EDIT (append-only)** `src/adapters/index.ts` — added `orgsReadSeam` (`list`/`get` →
    `adminApiClient.getOrgs`/`getOrg`, `AdminApiResult<OrgRow[]>`/`<OrgDetail|null>`). Merged the `./types` import
    (no duplicate). Everything above (P1 block + slice #1 + row #5) UNCHANGED (verified via `git diff`).
  - `transferOwnership` was ALREADY on `GuardedCommandAdapter` from P1 (per the P1 spec) — P2 added only the
    Orgs read seam + the transfer-specific tests.
  - **NEW** `src/adapters/orgsReadSeam.test.ts` (2). **EDIT (append-only)** `src/adapters/guardedCommands.test.ts`
    (10 → 18; +8 transfer cases). No existing test altered.
- **Gate evidence (P2 — host-run)**:
  - `TT-WIRE-ORGS-READ` → `orgsReadSeam.test.ts` GREEN (delegates to `adminApiClient.getOrgs`/`getOrg`; data =
    fixture-backed `OrgRow[]`/`OrgDetail`).
  - `TT-CMD-GUARDED-ALLOW-transferOwnership` (super → `{applied:false, auditId}`, chain +1),
    `TT-CMD-GUARDED-DENY-transferOwnership` (**`it.each(["ops","support","finance","audit"])` → all 4 non-super
    `forbidden` + ZERO append**; no-role → `unauthorized` + ZERO append — SUPER-ONLY REC-1 proven),
    `TT-CMD-AUDIT-ON-MUTATION-transferOwnership` (one event; `permissionKey === MUTATION_PERMISSION.transferOwnership`
    = `admin.orgs.transfer_ownership`; `result:"ok"`), `TT-CMD-CHAIN-AFTER-N` (granted vs denied adapters;
    `chain.verify()` green; length === granted count) → GREEN.
  - `check-types` clean; full suite **307 passed / 24 files** (= 297 UNCHANGED + 10 new). AC-3, AC-4, AC-7 covered.
- **Commits**: P2 — `feat(admin): row #3 P2 — Organizations read seam + SUPER-ONLY guarded owner-transfer`
  (hash in Phase Progress).
- **Tests**: `pnpm --filter @repo/admin test` → 307/307; `check-types` clean.
- **Risks**: R3 holding (additive; no existing test edited). R5 (scope bleed) holding — only Orgs read + transfer
  touched; setFeatureRollout/setProviderRouting/setQuota NOT surfaced.
- **Next step**: feature-auto-build P3 — Billing READ-ONLY seam + structural Stripe-gate guard (no billing mutation family).

### Round 5 — 2026-06-06 23:18 · feature-auto-build (P3) [feature-dev-loop · D-Codex]

- **Executor**: claude-opus-4-8 (feature-auto-build host) — implementation delegated to **`codex exec`** (D-Codex);
  host reviewed diff + ran gates + committed.
- **Mode**: Run — P1+P2 DONE, P3 next (the row's distinctive Stripe-gate constraint).
- **Action (P3 — Billing READ-ONLY seam + explicit Stripe-gate deferral)**:
  - **EDIT (append-only)** `src/adapters/index.ts` — added `billingReadSeam` (READ-ONLY:
    `metrics`/`planDistribution`/`transactions` → `getBillingMetrics`/`getPlanDistribution`/`getTransactions`).
    NO mutation method. Everything above UNCHANGED (verified via `git diff`).
  - **NEW** `src/adapters/billingReadSeam.test.ts` (9) — read coverage + the hard Stripe gate.
  - **NO** billing mutation family added anywhere (`AdminApiClient`/`MutationFamily`/`MUTATION_PERMISSION`/
    `GuardedCommandAdapter` unchanged). `BILLING_MANAGE` left catalogued-but-unwired.
- **Gate evidence (P3 — host-run, gate test inspected for rigor, not vacuity)**:
  - `TT-WIRE-BILLING-READ` → all 3 reads delegate to `adminApiClient` (spied); data = fixture shapes;
    `Object.keys(billingReadSeam) === ["metrics","planDistribution","transactions"]` (read-only; no write-shaped name).
  - `TT-BILLING-GATE-NO-MUTATION` (HARD) → runtime: real `createMockAdminApiClient` mutation keys ⊆ the fixed
    6-family allowlist with NONE matching `/billing/i`; `MUTATION_PERMISSION` has no billing key and does NOT wire
    `admin.billing.manage`; `GuardedCommandAdapter` keys === `["banUser","bulkBan","transferOwnership"]`.
    **+ type-level**: `expectTypeOf<keyof GuardedCommandAdapter>` pinned to the 3-family union and
    `expectTypeOf<MutationFamily>` pinned to the 6-family union (a billing member would fail compile). Cannot
    silently regress.
  - `TT-BILLING-KEY-CATALOGUED-UNWIRED` → `PERMISSION_KEYS.BILLING_MANAGE === "admin.billing.manage"` AND not in
    `MUTATION_PERMISSION` values.
  - `check-types` clean; full suite **316 passed / 25 files** (= 307 UNCHANGED + 9 new). AC-5 + AC-6 covered.
  - Gate precondition documented in api.md §6 (server-side webhook-backed idempotent Stripe-mirror +
    reconciliation + server RBAC + audit) — unmet (D4 PAUSED; no server); browser holds no Stripe secret.
- **Commits**: P3 — `feat(admin): row #3 P3 — Billing READ-ONLY seam + structural Stripe-gate guard` (also carries
  the P2 hash backfill in Phase Progress).
- **Tests**: `pnpm --filter @repo/admin test` → 316/316; `check-types` clean.
- **Risks**: R2 (Stripe gate silently regressing) MITIGATED + proven (runtime + type-level gate). R7 (secret in
  billing fixtures) holding — display-only.
- **Next step**: feature-auto-build P4 — wire the 3 pages to the `../adapters` seams + swap the `AdminUiContext`
  injection to the guarded adapter; re-run carried no-secret + no-inline-mock guards + build (RTL async via findBy*/waitFor).
