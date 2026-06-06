# dev_log.md — xai-admin-data-contracts-rbac

> Workflow state machine + breakpoint continuity. Top panel = overwrite; Work Log = append-only.
> Roadmap row **#2 of 6** of `xai-admin-dashboard-system-integration`. Hard dep row #1 = SHIPPED.
> Distinct landing — does NOT overwrite slice #1's `apps/admin/docs/{design,api,test,dev_log}.md`.

## Status Panel

| Field | Value |
|---|---|
| **Workflow** | FEATURE_DEV |
| **Target** | xai-admin-data-contracts-rbac |
| **Title** | Admin Data + Permission Contracts (read models · permission keys · RBAC · API boundary) |
| **Current Phase** | FEATURE_BUILD (P1–P2 DONE) |
| **Status** | APPROVED — P1–P2 DONE, P3–P4 PENDING |
| **Executor** | claude (feature-auto-build, inline via feature-dev-loop) |
| **Updated** | 2026-06-06 15:40 |
| **Suggested Next** | feature-auto-build (P3) |
| **Blockers** | — |
| **Module** | `admin` (#6) · operator-activated whole line 2026-06-06 · **row #2 of 6** (preserves dep order for #3–#6) |
| **Branch** | `codex/admin/<feature>` (planning-only at this step; no code branch) |
| **D3** | **W0 (web-only, admin-side only)** — no shared `@repo/*` seam modified; no `dev` promotion |

## Decision summary (full snapshot in design.md)

- **Real admin-claim source (OQ3) = A2** — admin-side authz contract reads the JWT custom claim on the
  read-only `session.user.app_metadata`; `@repo/web-auth-device-session` **unchanged**; slice #1's
  fail-closed `AdminClaimPredicate` graduates in place. Keeps row **W0**.
- **RBAC enforcement = C2** — server-authoritative; browser `can()` advisory/UX only, never the boundary.
- **Permission keys = D2** — immutable, append-only, dotted namespaced `as const` keys; every mutation
  family maps to exactly one key; seeded from prototype RBAC matrix.
- **API boundary** = typed **mockable** `AdminApiClient` (interface + mock impl); **no real server** this row.
- **Green without a backend** — contracts + keys + RBAC predicates + API contract, all unit-tested with a
  mock transport. Real wiring + real mutations = rows #3–#5.

## Phase Plan (for feature-build — ONE phase per run)

> `feature-build` runs exactly one phase per invocation, then stops for human confirmation.
> Sequence = contracts → permission keys → RBAC predicates → API boundary (manifest "contracts before UI
> data" + "RBAC/data contracts before any mutation"). Each phase is independently verifiable by unit tests
> with a mockable transport — NO server deploy required for "green".

| Phase | Goal | Key deliverables | Acceptance gate | Est. commits |
|---|---|---|---|---|
| **P1 — Read-model contract freeze + live/mock/deferred map** | Promote slice #1's 10 read-model interfaces to the canonical frozen contract; annotate each page live/mock/deferred | `src/contracts/readModels.ts` (canonical re-export, single source), `api.md` live/mock/deferred table, `contracts/readModels.test.ts` | TT-READMODEL-CONTRACT + TT-READMODEL-ANNOTATION green; build + slice-#1 tests unaffected (AC-1) | 1 |
| **P2 — Immutable permission-key catalog** | Define append-only dotted keys + map every mutation family → exactly one key | `src/authz/permissionKeys.ts` (`as const` + `MUTATION_PERMISSION`), `authz/permissionKeys.test.ts` | TT-PERMKEY-UNIQUE + TT-PERMKEY-PATTERN + TT-PERMKEY-MUTATION-COVERAGE + TT-PERMKEY-APPEND-ONLY green (AC-2, AC-3) | 1 |
| **P3 — RBAC role map + predicate (allow/deny per mutation family)** | Normalize prototype roles/grants; pure advisory `can()`/`canMutate()`; document server-authoritative posture | `src/authz/rbac.ts` (role→permission map + predicate), `authz/rbac.test.ts` (allow/deny ×6 families + read grants + fail-closed + advisory-note) | TT-RBAC-ALLOW-* + TT-RBAC-DENY-* (every family) + TT-RBAC-READ-GRANTS + TT-RBAC-FAILCLOSED + TT-RBAC-ADVISORY-NOTE green (AC-4, AC-5) | 1–2 |
| **P4 — Admin API-boundary contract (mockable transport) + secret invariant** | Typed `AdminApiClient` (reads + 6 mutations), server-re-auth rule, fail-closed errors, mock impl; re-assert no-secret | `src/contracts/adminApi.ts` (interface + `createMockAdminApiClient`), `contracts/adminApi.test.ts`, re-run no-secret guards + build | TT-API-CONTRACT-SHAPE + TT-API-FAILCLOSED + TT-API-SERVER-AUTHORITATIVE + TT-NO-SECRET-SRC/BUNDLE + TT-BUILD green (AC-6, AC-7, AC-8) | 1–2 |

> Phase order rationale: P1 (read-model contract) before P2/P3 (permission layer) before P4 (API boundary)
> follows the manifest dependency order. Contracts are frozen first so the permission keys + RBAC + API can
> reference them. P4 lands the transport seam last and re-runs the carried secret guards over the full
> (now larger) src/dist so the new `authz/`+`contracts/` modules are provably secret-free.

## Risks (carry into review)

- **R1 (HIGH)** browser-as-security-boundary regression → mitigated by api.md "server authoritative; browser
  advisory" hard invariant + TT-API-SERVER-AUTHORITATIVE + TT-RBAC-ADVISORY-NOTE + carried TT-NO-SECRET-*.
- **R2 (HIGH)** permission-key churn breaking dependent rows/audit → `as const` frozen catalog + dotted
  naming + TT-PERMKEY-APPEND-ONLY + documented append-only rule.
- **R3 (MED)** read-model contract drifting from slice #1 → P1 **promotes** the existing interfaces (single
  source / re-export), with TT-READMODEL-CONTRACT stability check (no re-declaration).
- **R4 (MED)** scope creep into rows #3–#5 (real transport/claim/mutation) → non-goals explicit; transport is
  a mock; mutations return `applied:false`; "green = contracts + tests, no server" frozen in design.
- **R5 (LOW)** D3 misclassification if the shared session package is later extended → A2 keeps it W0; design
  flags the D3 trigger so any deviation is caught.
- **R6 (LOW)** display-RBAC ⇄ enforcement-RBAC coupling → authz module is the single source of truth; the
  Roles read-model may derive display from it, never the reverse (api.md §4.4).

## Open questions for feature-review

- **OQ-A (resolved, confirm):** real admin-claim source = A2 (admin-side; read JWT custom claim; W0; no
  shared-package change). Confirm operator preference to keep `@repo/web-auth-device-session` unburdened holds.
- **OQ-B (resolved, confirm):** RBAC server-authoritative (C2); browser advisory; row #2 ships **no real
  server** (mock transport). Confirm the contract documents the server as the boundary.
- **OQ-C (defer to row, noted):** exact JWT custom-claim key + `app_metadata.<key>` vs top-level `user_role`
  is a server-config detail finalized when a real backend lands (row #3+). Row #2 fixes the seam + placeholder.
- **OQ-D (defer to row, noted):** concrete server runtime + provider secret-handle storage (slice #1 OQ4) =
  row #4. Row #2 fixes the boundary invariant (no secret in browser) + the mock client interface only.
- **OQ-E (out of scope, noted):** cross-device persistence of any admin read model = ADR-0013 §D4 / PAUSED
  `sync` line. Out of scope; no `syncScope` entity added.
- **OQ-F (build-time choice for feature-build):** whether to rewire slice #1's `mockAdminCommandAdapter` to
  delegate to the new mock `AdminApiClient` this row (keeping slice-#1 `TT-CMD-NOOP` green) or defer the
  rewire to row #3. Either preserves AC-4; record the choice. (Recommend defer rewire to row #3 to keep
  row #2 purely additive.)

## Review Notes (feature-review — 2026-06-06 15:10 · claude-opus-4-8)

**Verdict: APPROVED** — 0 blockers, 3 recommendations (for feature-build to confirm/record; none block P1).
Plan is executable with no blocking ambiguity. All 8 project review gates verified against on-disk ground
truth (slice #1 source + prototype RBAC matrix + upstream package export surface), not just the docs.

Gate results:
- **G1 Decision soundness (A2/C2/D2) — PASS.** A2 verified **W0**: `@repo/web-auth-device-session/src/index.ts`
  exports `useWebAuthSession`/`WebAuthSessionContextValue` and re-exports the Supabase `Session`; it models
  **no** admin claim and `app_metadata` is an arbitrary record read defensively — so A2 genuinely needs ZERO
  shared-package change. C2 consistently applied: api.md §4.3 (browser `can()` advisory-only) + §5.1 (server
  re-authorizes before any effect) + TT-RBAC-ADVISORY-NOTE + TT-API-SERVER-AUTHORITATIVE; **no place lets a
  browser predicate be the real gate** (mock fails closed, holds no service-role credential). D2 enforceable:
  `as const` + dotted-pattern test + append-only snapshot guard + mutation-coverage test.
- **G2 Builds on slice #1, no fork — PASS.** readModels.ts is a re-export (single source, no re-declaration);
  the claim predicate graduates **in the same seam** — verified slice #1 `auth/adminClaim.ts` already uses
  `AdminSession = NonNullable<WebAuthSessionContextValue["session"]>` and reads `app_metadata.xai_admin`
  fail-closed, so the plan's api.md §1.1 `(session: AdminSession | null) => AdminClaim` matches the REAL seam
  (not the stale `Session` in slice #1's *doc*). Distinct `apps/admin/docs/data-contracts-rbac/` landing does
  NOT overwrite slice #1's `apps/admin/docs/*.md`.
- **G3 RBAC coverage — PASS.** Every mutation family has allow + **mandatory** deny tests (TT-RBAC-ALLOW-×6,
  TT-RBAC-DENY-×6); predicates total/fail-closed (TT-RBAC-FAILCLOSED: null/undefined/unknown role → false);
  role×permission map verified 1:1 against the prototype `PERMS`/`ROLES` (super=all, ops=dashboard+manage+ban+
  rollout+quota, support=dashboard+manage+impersonate, finance=dashboard+billing, audit=dashboard+view-audit).
- **G4 Server/API boundary — PASS.** Service-role/RLS-safe (server re-auth + service-role server-side only);
  browser never receives secrets (TT-NO-SECRET-SRC/BUNDLE carried whole-`src`/`dist`; providers key-status-only,
  verified fixtures dropped the prototype `keyMask`); the 6 mutation input shapes match the real
  `AdminCommandAdapter` EXACTLY.
- **G5 Green-without-a-backend — PASS.** Greenness = contracts + keys + RBAC + API-boundary contract, all
  unit-tested via mock transport; no server deploy; mock mutations return `applied:false`; real wiring/mutations
  explicitly deferred to rows #3–#5. Scope is not bleeding forward.
- **G6 Boundary / D3 — PASS.** W0 (admin-side only); no shared `@repo/*` seam modified; no new
  `@repo/core/src/events`; no Tauri commands. Deviation trigger (forced shared-package change) is flagged.
- **G7 syncScope — PASS.** No admin read model routed to cross-device persistence; ADR-0013 §D4 / PAUSED `sync`
  line explicitly out of scope (OQ-E).
- **G8 Phasing + doc-contract — PASS.** 4 phases ordered contracts → keys → RBAC → API boundary; each
  independently verifiable (ONE phase per run); AC→test mapping consistent across design/api/test; dev_log
  maintains Workflow/Executor/Updated/Suggested Next/Work Log; doc landing distinct from slice #1.

Recommendations (NON-blocking — record during build, do NOT require Revise):
- **REC-1 (P2/P3): `ORG_TRANSFER_OWNER` is a synthesized key, not a 1:1 prototype seed.** The prototype HAS the
  `transferOwnership` destructive action (`转移所有权`, type-to-confirm `requireType:"TRANSFER"`) and slice #1
  has it as a no-op command, but the prototype RBAC matrix has **no** matching permission row (its 10 `PERMS`
  rows have no transfer-ownership entry). The plan grants it **super-only** by default (the safe, fail-closed
  choice). This is sound — just make the synthesis explicit in `permissionKeys.ts`/`rbac.ts` comments + the
  TT-RBAC-ALLOW-transferOwnership / TT-RBAC-DENY-transferOwnership cases so it is not mistaken for a seeded grant.
- **REC-2 (P1/P4): `OverviewPayload` (and inline `MutationAck`) in api.md §5 are net-new illustrative names.**
  `UserRow`/`UserQuery`/`PlanTier` exist in slice #1 types; the read-method return types ARE the §2 read models
  (the api.md comment says so). When wiring `AdminApiClient`, bind read returns to the §2 canonical contract
  types (do NOT introduce a parallel `OverviewPayload` interface that forks `OverviewReadModel`'s shape);
  TT-API-CONTRACT-SHAPE should assert the read-method returns match the §2 contract.
- **REC-3 (P1): stale `[][]` shapes in slice #1's *doc* are NOT in the real types.** Real
  `ProvidersReadModel.modelPlanMatrix()` returns `ModelPlanCell[]` and `RolesReadModel.rbacMatrix()` returns
  `RbacRow[]` (1-D), while slice #1's *api.md* shows `[][]`. The plan correctly re-exports the REAL types
  (single source) so this does not propagate — keep it that way (re-export, never re-declare), and let
  TT-READMODEL-CONTRACT's "same type as `adapters/types.ts`" check catch any drift.

OQ confirmations: OQ-A (A2 keeps the shared session package unburdened) and OQ-B (server-authoritative, mock
transport, no real server) are **confirmed** by ground truth and consistent with the operator's stated
"no UI mutation before this row is green" + secret-safety governance. OQ-C/OQ-D (live claim key + server runtime)
correctly deferred to rows #3/#4. OQ-E (cross-device sync) correctly out of scope. OQ-F (rewire slice #1's
`mockAdminCommandAdapter` to delegate to the new mock `AdminApiClient` now vs row #3) — **endorse the plan's
recommendation to DEFER the rewire to row #3** to keep row #2 purely additive and slice #1's TT-CMD-NOOP
untouched; record the choice in P4.

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Read-model contract freeze + live/mock/deferred map | DONE | cba8e5e |
| P2 — Immutable permission-key catalog | DONE | (pending hash) |
| P3 — RBAC role map + predicate | PENDING | — |
| P4 — Admin API-boundary contract + secret invariant | PENDING | — |

## Work Log (append-only)

### Round 1 — 2026-06-06 14:30 · feature-plan (Fresh)

- **Executor**: claude-opus-4-8 (feature-plan)
- **Mode**: Fresh — no prior planning artifacts for slug `xai-admin-data-contracts-rbac` (verified: no
  `docs/reviews/xai-admin-data-contracts-rbac/`, no `apps/admin/docs/data-contracts-rbac/`, no `_intake/`
  brief). Requirement delivered inline as manifest row #2; slice #1's OQ3/OQ4 are now owned here.
- **Goal**: Plan roadmap row #2 — formalize the admin **data + permission contracts** every later
  write-heavy row depends on (read models · permission keys · RBAC enforcement contract · server/API
  boundary), as a contract-only, fully testable slice with a mockable transport (no server deploy).
- **Done**:
  - Read manifest row #2, INTEGRATION_PLAN §2–§4, SHIPPED slice #1 design/api/test/dev_log, slice #1 brief
    (OQ3/OQ4 → now row #2), ADR-0013 (D3/D4), PLUGIN_MAP (`@repo/web-auth-device-session` = Stable), CLAUDE.md
    boundaries.
  - Inspected the load-bearing source: `@repo/web-auth-device-session/src/index.ts` (exports
    `useWebAuthSession` → `{ state, session }`, `session: Session | null`, **no admin claim modeled**);
    slice #1 `auth/adminClaim.ts` (mock predicate **already reads `session.user.app_metadata.xai_admin`**,
    fail-closed); `adapters/types.ts` (10 read-model interfaces); `adapters/commands.ts` (6 no-op mutation
    families); prototype `fixtures/index.ts` `ROLES`/`RBAC` (5 roles × 10 permission rows — the RBAC seed).
  - Web research (2026-06): Supabase **Custom Access Token Hook** injects the admin role into the issued JWT
    (`claims.app_metadata` / `user_role`), decodable on the existing `session` → confirms **A2** needs NO
    shared-package change. Supabase **service_role always bypasses RLS**; recommended Edge-Function pattern =
    validate JWT → check admin role server-side → then use service-role client → confirms **C2**
    (server-authoritative; browser advisory). Sources recorded in the discovery review §7.
  - Resolved 4 design axes: A2 (admin-claim source), B2 (admin-local authz module), C2 (server-enforced),
    D2 (immutable append-only dotted permission keys). Recorded as ADR-lite #1–#3 in design.md.
  - Chose **distinct doc landing**: discovery review under `docs/reviews/xai-admin-data-contracts-rbac/`;
    four-piece set under `apps/admin/docs/data-contracts-rbac/` (co-located with the surface, does NOT
    overwrite slice #1's `apps/admin/docs/*`).
  - Wrote: discovery review + design.md (decision snapshot + ADR-lite + frozen assumptions + directory shape)
    + api.md (claim graduation + read-model contract & live/mock/deferred table + permission-key catalog +
    RBAC predicate API + server/API boundary contract + fail-closed semantics) + test.md (AC→test mapping,
    allow/deny per mutation family, mock-transport coverage) + this dev_log.
  - Phased the plan into 4 one-phase-per-run build phases: contracts → keys → RBAC → API boundary.
- **Commits**: — (planning artifacts only; no code branch; operating in worktree `claude/frosty-nash-c4bf16`)
- **Tests**: — (none run; planning phase)
- **Risks**: see Risks section (R1/R2 HIGH).
- **Next step**: feature-review — review discovery report + design/api/test/dev_log; verify the A2/C2/D2
  decisions, the W0 boundary (no shared-package change), the immutable/append-only permission keys, the
  allow/deny-per-mutation-family RBAC coverage, the server-authoritative + fail-closed API contract, the
  "green-without-a-backend" scoping, and that the manifest dependency order for rows #3–#6 is preserved;
  give APPROVED or REVISE.

### Round 2 — 2026-06-06 15:10 · feature-review (Review)

- **Executor**: claude-opus-4-8 (feature-review)
- **Action**: Reviewed all four planning artifacts (discovery review + design + api + test) against the 8
  project review gates, cross-checked against ON-DISK ground truth rather than the docs alone:
  - `apps/admin/src/auth/adminClaim.ts` — confirmed the slice #1 predicate already uses
    `AdminSession = NonNullable<WebAuthSessionContextValue["session"]>`, reads `app_metadata.xai_admin`,
    fails closed, is pure → the plan's A2 "graduates in place" claim is grounded (no fork).
  - `packages/web-auth-device-session/src/index.ts` — confirmed the public surface models NO admin claim
    and `app_metadata` is an arbitrary record → A2 genuinely needs ZERO shared-package change (W0 holds).
  - `apps/admin/src/adapters/types.ts` + `commands.ts` — confirmed the 10 read models + 6 mutation-family
    input shapes match the plan's `AdminApiClient` / read-model contract exactly (real `modelPlanMatrix()`/
    `rbacMatrix()` are 1-D `[]`, NOT the `[][]` in slice #1's stale doc — the plan re-exports the real types).
  - `apps/admin/src/fixtures/index.ts` + `docs/prototypes/admin-dashboard/index.html` — confirmed the
    prototype `ROLES`/`PERMS` (5 roles × 10 perms) and verified the plan's `ROLE_GRANTS` normalizes them 1:1;
    found `transferOwnership` exists as a prototype action with NO matching RBAC matrix row (→ REC-1).
  - `apps/admin/docs/dev_log.md` — confirmed slice #1 = SHIPPED (real dependency satisfied).
- **Verdict**: **APPROVED** — 0 blockers, 3 non-blocking recommendations (REC-1 synthesized
  `ORG_TRANSFER_OWNER` key; REC-2 don't fork `OverviewPayload` from the §2 contract; REC-3 keep readModels.ts
  a re-export, never re-declare). Confirmed OQ-A/OQ-B; endorsed deferring OQ-F rewire to row #3.
- **Files updated**: this `dev_log.md` (Status → APPROVED, Current Phase → FEATURE_REVIEW, Review Notes added).
  No planning-doc edits required (no structural revision needed).
- **Commits**: — (review only; no code branch; worktree `claude/frosty-nash-c4bf16`)
- **Next step**: feature-build — implement P1 (read-model contract freeze + live/mock/deferred map) per the
  APPROVED Phase Plan; ONE phase per run. Record REC-1/REC-2/REC-3 + the OQ-F defer choice as they apply.

### Round 3 — 2026-06-06 15:30 · feature-auto-build P1 (inline via feature-dev-loop)

- **Executor**: claude (feature-auto-build, inline-executed by the feature-dev-loop orchestrator — native
  sub-agent spawn unavailable in this runtime, so the orchestrator adopts the worker role per protocol).
- **Phase**: P1 — Read-model contract freeze + live/mock/deferred map.
- **Action**:
  - Created `apps/admin/src/contracts/readModels.ts` as a **canonical RE-EXPORT** (single source) of slice #1's
    `adapters/types.ts` — all 10 read models + `AdminReadModels` aggregate + the supporting value/shape types
    the read methods return (so P4's `AdminApiClient` read returns bind to the SAME shapes — REC-2). **Never
    re-declared** any interface (REC-3).
  - Added a machine-readable `READ_MODEL_KEYS` (`as const`, the 10 page keys) + `READ_MODEL_ANNOTATIONS`
    (live/mock/deferred per page, mirroring api.md §2.1) so the annotation is structurally testable, not just prose.
  - Created `apps/admin/src/contracts/readModels.test.ts`:
    - **TT-READMODEL-CONTRACT** — `expectTypeOf<Canonical AdminReadModels>().toEqualTypeOf<slice-#1 AdminReadModels>()`
      + the shipped `adminReadModels` instance satisfies the canonical contract + each of the 10 page types is the
      SAME type as slice #1's (re-export proof, no fork). REC-3 sub-case asserts real returns are 1-D
      (`ModelPlanCell[]` / `RbacRow[]`), not the stale `[][]`.
    - **TT-READMODEL-ANNOTATION** — annotation set covers EXACTLY the 10 registry keys (none missing, none extra),
      unique, every read model `mock` today with a defined target-row, providers documented key-STATUS-only.
- **REC handling**: REC-2 (read returns reuse §2 contract shapes) seeded by re-exporting `UserRow`/`UserQuery`/
  `PlanTier`/etc. here; REC-3 (re-export not re-declare) is the core of this phase + proven by the type-identity test.
- **Tests**: `vitest run src/contracts/readModels.test.ts` → **8 passed**. `tsc --noEmit` (check-types) → **exit 0**
  (type-level identity assertions compile). Acceptance gate AC-1 (TT-READMODEL-CONTRACT + TT-READMODEL-ANNOTATION) GREEN.
- **Boundary self-check**: W0 — admin-local only; no shared `@repo/*` change; no typed events; no Tauri; no
  `syncScope`; no new runtime dependency; contract-only (no page change).
- **Commits**: `cba8e5e` (see Phase Progress table).
- **Next step**: P2 — immutable permission-key catalog.

### Round 4 — 2026-06-06 15:40 · feature-auto-build P2 (inline via feature-dev-loop)

- **Executor**: claude (feature-auto-build, inline-executed by the feature-dev-loop orchestrator).
- **Phase**: P2 — Immutable permission-key catalog.
- **Action**:
  - Created `apps/admin/src/authz/permissionKeys.ts`:
    - `PERMISSION_KEYS as const` — 11 immutable, append-only, dotted namespaced lowercase keys (the 10
      prototype `PERMS` rows + 1 synthesized). `PermissionKey` = union of the values.
    - `MutationFamily = keyof AdminCommandAdapter` (derived from the SHIPPED slice #1 interface, not hand-listed).
    - `MUTATION_PERMISSION: Record<MutationFamily, PermissionKey>` — every one of the 6 families → exactly one
      key (`banUser`+`bulkBan` deliberately share `USER_BAN`).
    - `PERMISSION_KEYS_SNAPSHOT_V1` (frozen 11-key list) + `ALL_PERMISSION_KEYS` for the append-only guard.
  - Created `apps/admin/src/authz/permissionKeys.test.ts` — TT-PERMKEY-UNIQUE (distinct values),
    TT-PERMKEY-PATTERN (`^admin\.[a-z_]+(\.[a-z_]+)*$` per key + admin. namespace), TT-PERMKEY-MUTATION-COVERAGE
    (family set === `keyof AdminCommandAdapter`, every value in catalog, single key per family, REC-1 case),
    TT-PERMKEY-APPEND-ONLY (catalog ⊇ snapshot, no removal/rename, `as const` readonly at type level).
- **REC-1 handling (RECORDED)**: `ORG_TRANSFER_OWNER` (`admin.orgs.transfer_ownership`) is **SYNTHESIZED** — the
  prototype has the `transferOwnership` destructive action + slice #1 no-op command, but NO matching RBAC matrix
  row. Made explicit in the `permissionKeys.ts` comment; mapped from `transferOwnership`; granted SUPER-ONLY in P3
  (the safe fail-closed default). A dedicated test pins the key string + the mapping so it is not mistaken for a seed.
- **Tests**: `vitest run src/authz/permissionKeys.test.ts` → **23 passed**. `tsc --noEmit` → **exit 0**. Acceptance
  gates AC-2 (TT-PERMKEY-UNIQUE/PATTERN/APPEND-ONLY) + AC-3 (TT-PERMKEY-MUTATION-COVERAGE) GREEN.
- **Boundary self-check**: W0 — admin-local pure data; no shared `@repo/*`; no events/Tauri/syncScope; no secret
  literal (the new module is auto-covered by slice #1's whole-`src` TT-NO-SECRET-SRC, re-run in P4); no new dependency.
- **Commits**: see Phase Progress table (recorded below after commit).
- **Next step**: P3 — RBAC role→permission grant map + pure advisory predicate (allow/deny per mutation family).
