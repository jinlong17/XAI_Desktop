# dev_log.md — xai-admin-feature-ai-provider-control

> Workflow state machine + breakpoint continuity. Top panel = overwrite; Work Log = append-only.
> Roadmap row **#4 of 6** of `xai-admin-dashboard-system-integration`. Hard dep row #2 = SHIPPED; rows #1, #5, #3 = SHIPPED.
> Distinct landing — does NOT overwrite slice #1's `apps/admin/docs/{design,api,test,dev_log}.md`, row #2's
> `apps/admin/docs/data-contracts-rbac/*`, row #5's `apps/admin/docs/audit-ops-queue/*`, or row #3's
> `apps/admin/docs/users-orgs-billing/*`.

## Status Panel

| Field | Value |
|---|---|
| **Workflow** | FEATURE_DEV |
| **Target** | xai-admin-feature-ai-provider-control |
| **Title** | Admin Feature-flags / AI-usage-&-quota / Provider-config wiring (typed read-model adapters · RBAC+audit-gated guarded CONFIG mutations · provider secret-handle read model + provider-key no-leak guard) |
| **Current Phase** | FEATURE_VERIFY |
| **Status** | READY_TO_SHIP — P1–P4 DONE, feature-verify PASS |
| **Executor** | claude-opus-4-8 (feature-dev-loop → inline feature-verify) |
| **Updated** | 2026-06-06 |
| **Suggested Next** | ship (human-confirmed push) |
| **Blockers** | — |
| **Automation Mode** | D-Codex (manifest row #4 default) |
| **Verify Cross-vendor** | yes (manifest row #4 default) |
| **Module** | `admin` (#6) · operator-activated whole line 2026-06-06 · **row #4 of 6** (preserves dep order; #6 depends on #5) |
| **Branch** | `codex/admin/<feature>` (planning-only at this step; no code branch; worktree `claude/frosty-nash-c4bf16`) |
| **D3** | **W0 (web-only, admin-side only)** — no shared `@repo/*` seam modified; no `dev` promotion |

## Decision summary (full snapshot in design.md)

- **Read wiring (R2)** — additive composed read seams in `adapters/index.ts`
  (`featuresReadSeam`/`aiUsageReadSeam`/`providersReadSeam`) delegating to row #2's `AdminApiClient`
  (`getFeatures`/`getFeature`/`getQuotaPolicies`/`getTopSpenders`/`getProviders`/`getModelPlanMatrix`);
  pages keep importing `../adapters` (TT-NO-INLINE-MOCK green); slice #1's
  `featuresAdapter`/`aiUsageAdapter`/`providersAdapter` UNCHANGED (the row #3 / row #5 R-1 additive-seam
  precedent — this exact file already carries row #3's `usersReadSeam`/`orgsReadSeam`/`billingReadSeam`).
- **Mutation graduation (M2 / M2a)** — surface `setFeatureRollout`/`setQuota`/`setProviderRouting` on the
  guarded command adapter (EXTEND row #3's `GuardedCommandAdapter` to all six families) delegating to
  row #5's `createAuditedMockAdminApiClient` → row #2 `canMutate` RBAC (deny → forbidden/unauthorized, ZERO
  append) + row #5 `appendThenAck` (allow → audit event + `auditId`, **`applied:false`**); FLIP the
  `AdminUiContext` injection for those three from slice #1 no-op to the guarded adapter. **No new RBAC key,
  no new audit code, no new transport method** — the audited client already audits all six families.
  `setProviderRouting` is **SUPER-ONLY** (`PROVIDER_ROUTING`); `setFeatureRollout`/`setQuota` are super+ops.
- **Provider secret-handle (P2)** — EXTEND the providers read model with an additive `ProviderSecretHandle`
  status shape (opaque NON-secret `handleId` + `configured` status + optional `lastRotated` + vault ref
  label); **NO key/secret/decryptable material**. Real secret storage = server-side, out of scope (handles
  only). Mirrors the canonical "secret reference" pattern (Portkey / LiteLLM virtual keys / one-way-hash +
  prefix). Web-research-grounded (review §7).
- **Provider-key no-leak guard (G2)** — NEW explicit `TT-PROVIDER-NO-KEY-MATERIAL` proving no provider key
  material in the providers read model + fixtures + built bundle (the row's headline security deliverable),
  ADDITIVE to the carried `TT-NO-SECRET-SRC`/`TT-NO-SECRET-BUNDLE`.
- **Green without a backend** — reads bound to the transport + 3 CONFIG guarded mutation flows (RBAC +
  audit, mock, `applied:false`+`auditId`) + secret-handle read model + provider-key no-leak guard + page
  wiring, all unit/component-tested via the mockable transport; NO server deploy, NO real provider call, NO
  real secret, NO real write. Real endpoints/effects/vault = later rows.

## Phase Plan (for feature-build — ONE phase per run)

> `feature-build` runs exactly one phase per invocation, then stops for human confirmation.
> Sequence (per operator instruction) = Feature-flags read+rollout mutation → Entitlements/AI-quota
> read+quota mutation → Provider config read (secret-handles) + routing mutation + provider-key no-leak
> guard → wire pages to adapters. Each phase is independently verifiable by unit/component tests with a
> mockable transport — NO server deploy required for "green". Phase order satisfies the manifest
> Implementation-Order ("integrate read-heavy pages before write-heavy; add mutation flows only when the
> audit append contract is covered by tests" — the audit contract is already SHIPPED in row #5, so the
> guarded CONFIG mutations land safely).

| Phase | Goal | Key deliverables | Acceptance gate | Est. commits |
|---|---|---|---|---|
| **P1 — Feature-flags read seam + guarded `setFeatureRollout`** | Composed Features read seam over the `AdminApiClient`; surface `setFeatureRollout` on the guarded adapter (super+ops) delegating to row #5 audited client | `featuresReadSeam` in `adapters/index.ts`, `setFeatureRollout` on `GuardedCommandAdapter`, `adapters/featuresReadSeam.test.ts`, rollout cases in `guardedCommands.test.ts` | TT-WIRE-FEATURES-READ + TT-READ-NO-IO + TT-CMD-GUARDED-ALLOW/DENY-setFeatureRollout + TT-CMD-AUDIT-ON-MUTATION-setFeatureRollout + TT-CMD-APPLIED-FALSE + TT-CMD-NO-IO + TT-CMD-ADVISORY-NOTE + TT-CMD-GUARDED-IS-ADDITIVE green (AC-1, AC-2, AC-9, AC-11); build + slice-#1/#2/#5/#3 tests unaffected | 1–2 |
| **P2 — Entitlements / AI-quota read seam + guarded `setQuota`** | Composed AI-usage/quota read seam over the `AdminApiClient`; surface `setQuota` on the guarded adapter (super+ops) | `aiUsageReadSeam` in `adapters/index.ts`, `setQuota` on `GuardedCommandAdapter`, `adapters/aiUsageReadSeam.test.ts`, quota cases in `guardedCommands.test.ts` | TT-WIRE-AIUSAGE-READ + TT-CMD-GUARDED-ALLOW/DENY-setQuota + TT-CMD-AUDIT-ON-MUTATION-setQuota + TT-CMD-CHAIN-AFTER-N green (AC-3, AC-4, AC-9) | 1 |
| **P3 — Provider config read (secret-handles) + guarded `setProviderRouting` (super-only) + provider-key no-leak guard** | Composed Providers read seam over the `AdminApiClient`; `ProviderSecretHandle` status shape (handle/status/metadata only); surface `setProviderRouting` on the guarded adapter (SUPER-ONLY); the explicit provider-key no-leak guard | `providersReadSeam` + `ProviderSecretHandle` (`adapters/{index,types}.ts`), `setProviderRouting` on `GuardedCommandAdapter`, `adapters/providersReadSeam.test.ts`, provider-routing cases in `guardedCommands.test.ts`, `__tests__/no-provider-key.test.ts` | TT-WIRE-PROVIDERS-READ + TT-PROVIDER-HANDLE-SHAPE + TT-CMD-GUARDED-ALLOW-setProviderRouting (super) + TT-CMD-GUARDED-DENY-setProviderRouting (ops/support/finance/audit ZERO append) + TT-CMD-AUDIT-ON-MUTATION-setProviderRouting + **TT-PROVIDER-NO-KEY-MATERIAL** (read model + fixtures + bundle) green (AC-5, AC-6, AC-7) | 1–2 |
| **P4 — Wire the 3 pages to the seams + injection flip + carried-guard re-run** | Wire `FeaturesPage`/`AiUsagePage`/`ProvidersPage` to the composed `../adapters` read seams; flip the `AdminUiContext` injection for the 3 CONFIG families to guarded; ProvidersPage routing affordance + NO key field; re-run carried guards + full build | wired `pages/{FeaturesPage,AiUsagePage,ProvidersPage}.tsx` + `components/AdminUiContext.tsx`, `pages/wiring.feature-ai-provider.test.tsx`, re-run no-secret + no-inline-mock + TT-CMD-NOOP guards + build | TT-WIRE-FEATURES-PAGE/AIUSAGE-PAGE/PROVIDERS-PAGE + TT-NO-INLINE-MOCK + TT-CMD-NOOP (slice #1 re-run) + TT-NO-SECRET-SRC/BUNDLE + TT-BUILD + full suite + `@repo/web` build + row #3 pages byte-identical green (AC-8, AC-10, AC-11, AC-12) | 1–2 |

> Phase order rationale: P1 lands the Features read seam + the first guarded CONFIG family (rollout); the
> audit-append contract it depends on is already SHIPPED (row #5), so mutations land safely (manifest
> Implementation-Order #4 already satisfied upstream). P2 adds AI-usage read + quota (independent). P3 lands
> the Providers read (the secret-handle model — the row's distinctive read contract) + the SUPER-ONLY
> routing mutation + the headline provider-key no-leak guard, isolated so the security dimension is
> independently reviewable. P4 wires the three pages through `../adapters` + flips the `AdminUiContext`
> injection + re-runs the carried secret/no-inline-mock/no-op guards over the now-larger src/dist. **R-NOINLINE
> (MUST honor in P4):** `TT-NO-INLINE-MOCK` is in the P4 gate — pages keep importing `../adapters`, never the
> guarded/audited/mock client directly; page count stays 10. **R-SCOPE (MUST honor every phase):** touch ONLY
> the 3 CONFIG pages + families; row #3 Users/Orgs/Billing pages + families stay byte-identical.

## Risks (carry into review)

- **R-SECRET (HIGH)** the secret-handle read model accidentally introducing a key-material field, or a
  `maskedTail` that trips/evades the bundle guard → mitigated by P2 (status/handle/metadata only, NO key) +
  G2 (`TT-PROVIDER-NO-KEY-MATERIAL` over read model + fixtures + bundle) + the OQ-C `maskedTail` caution
  (non-bullet, non-reversible, recommend OMIT).
- **R-SCOPE (HIGH)** bleed into row #6 (deploy/observability) or re-touching row #3 pages (Users/Orgs/
  Billing) → mitigated: row #4 surfaces only the 3 CONFIG families + wires only the 3 CONFIG pages;
  Users/Orgs/Billing pages + `banUser`/`bulkBan`/`transferOwnership` stay byte-identical (`git diff` check
  in the P4 gate).
- **R-ADVISORY (HIGH)** browser-as-security-boundary / "real mutation" overclaim → mitigated by reusing
  row #2 C2 + row #5 B2: browser advisory, server-authoritative; mock `applied:false`; guarded adapter holds
  no service-role OR provider credential + does no I/O; documented + tested (`TT-CMD-ADVISORY-NOTE` +
  `TT-CMD-NO-IO`).
- **R-ADDITIVE (HIGH)** breaking slice #1 / row #2 / row #5 / row #3 suites → mitigated by additive composed
  seams (R2) + EXTENDING (not forking) `GuardedCommandAdapter` (M2a); all prior suites stay green; slice #1
  `mockAdminCommandAdapter` + `TT-CMD-NOOP` UNCHANGED.
- **R-NOINLINE (MED)** `TT-NO-INLINE-MOCK` regression (a page dropping the `../adapters` import or page
  count ≠ 10) → mitigated: route everything through `../adapters`; no page added/removed; `TT-NO-INLINE-MOCK`
  in the P4 gate.
- **R-ASYNC (MED)** RTL flakiness converting the 3 pages from sync `adapter.*()` to async seam reads →
  mitigated: keep the mock transport microtask-resolving; use `findBy*`/`waitFor` (the row #3 P4 precedent).
- **R-ROUTE-AFFORDANCE (MED)** `ProvidersPage` gaining a routing mutation control (the previously-inert
  "管理限速与默认模型" path) → mitigated: wire to `commands.setProviderRouting` (guarded, super-only),
  type-to-confirm via `ConfirmModal`; render secret-handle STATUS only; NO provider key field; assert no
  secret string in the DOM (`TT-WIRE-PROVIDERS-PAGE`).
- **R-RETURN-TYPE (LOW)** the 3 CONFIG families changing return type (`NoOpResult` → `AdminApiResult<MutationAck>`)
  → mitigated: FeaturesPage/AiUsagePage already `await commands.*()` without inspecting the result (verified);
  ProvidersPage's new call is added fresh; the combined `AdminCommands = GuardedCommandAdapter` keeps call
  sites stable.
- **R-SYNC (LOW)** `syncScope`/cross-device temptation → no `syncScope` entity; ADR-0013 §D4 / PAUSED `sync`
  out of scope.

## Open questions for feature-review

- **OQ-A (resolve/confirm — build-time):** EXTEND row #3's `GuardedCommandAdapter` to all six families
  (single guarded surface) vs a separate `GuardedConfigCommandAdapter`. **Recommend:** extend the existing
  one (it already delegates to the same audited client; mirrors `createMockAdminApiClient`'s six-method
  shape; `AdminCommands` becomes "all six guarded"). Slice #1 `mockAdminCommandAdapter` + `TT-CMD-NOOP`
  UNCHANGED either way. Record the chosen shape in P1.
- **OQ-B (resolve/confirm — mock role context):** the role the UI-injected guarded client carries
  (`VITE_ADMIN_MOCK_ROLE`, fail-closed when absent). `setFeatureRollout`/`setQuota` need `ops`/`super`;
  `setProviderRouting` needs `super` (super-only). **Recommend:** default `super` for the routing smoke
  (covers all three); unit tests use explicit roles for allow AND deny per family.
- **OQ-C (resolve/confirm — `ProviderSecretHandle` field set):** include an optional non-secret display
  token (`maskedTail`) or omit it and rely on `handleId`+`configured`+`lastRotated`. **Recommend:** OMIT the
  masked tail (safest; the manifest only requires handle/status). If included, it MUST be a plain
  non-reversible last-4/prefix (e.g. `gem_…`) that passes `TT-NO-SECRET-BUNDLE` (NOT the bullet-mask shape
  `xxx••••`). Sub-question: surface secret-handles as a separate `secretHandles()` projection (recommended —
  keeps slice #1 `ProviderCard` pinned by `adapters.test.ts` UNCHANGED) vs folding fields into `ProviderCard`.
  Pin in P3.
- **OQ-D (defer to a later/production row, noted):** real service-role feature/quota/provider endpoints +
  real provider routing effect + real server-side encrypted secret-handle vault + runtime credential fetch
  = the real transport behind these interfaces. Row #4 fixes the contract + mock + test surface (handles only).
- **OQ-E (out of scope, noted):** cross-device persistence of any admin provider/feature/quota read model
  (ADR-0013 §D4 / PAUSED `sync`). No `syncScope` entity added.

## Review Notes (feature-review — 2026-06-06 · claude-opus-4-8)

**Verdict: APPROVED.** 0 blockers, 2 builder notes (non-blocking). The plan is executable with no
blocking ambiguity. Every load-bearing claim was verified against SHIPPED source (not taken on trust),
with EXTRA scrutiny on the provider secret-handle invariant.

Source-verified facts (all plan claims hold):
- **No new transport method** — `auditedMutation.ts` (the audited client) exposes
  `getFeatures`/`getFeature`/`getQuotaPolicies`/`getTopSpenders`/`getProviders`/`getModelPlanMatrix`
  (lines 168-173) + all six mutations; row #3's `adapters/index.ts` (lines 307-364) already binds reads
  through `adminApiClient = createMockAdminApiClient(...)`. Read seams plug in cleanly.
- **No new permission key; provider-routing is SUPER-ONLY** — `permissionKeys.ts` `MUTATION_PERMISSION`
  (lines 74-81) maps all 3 CONFIG families; `rbac.ts` `ROLE_GRANTS` (lines 65-83) confirms `PROVIDER_ROUTING`
  is in the `super` set ONLY, `FEATURE_ROLLOUT`/`QUOTA_SET` are super+ops. Exactly as planned.
- **No new audit code** — `auditedMutation.ts` `appendThenAck` (lines 135-157) + `FAMILY_ACTION`
  (lines 74-81) already audit all six families: granted → append + `{applied:false, auditId}`; denied → ZERO
  append (structural). The 3 CONFIG actions are present.
- **The flip point is real and minimal** — `AdminUiContext.tsx` (lines 32-34, 61-63) currently injects the 3
  CONFIG families (`setFeatureRollout`/`setProviderRouting`/`setQuota`) as slice #1 no-op; the type comment
  (lines 27-31) literally says "until rows #4 graduate them". `guardedCommands.ts` (lines 24-45) has only the
  3 row #3 families; EXTEND to six is additive over the same factory.
- **`ProvidersPage.tsx` is byte-identical/unwired** — reads sync `providersAdapter` (lines 14-15), renders
  `keyStatus` ONLY (lines 47-53), the "管理限速与默认模型" button (lines 65-67) is inert (no `onClick`). The
  routing-affordance wiring claim is accurate.
- **`ProviderCard` is keyStatus-only** (`types.ts` lines 247-261) with an explicit "NEVER key material"
  comment; `ProviderCard.key` is the provider SLUG (correctly allowed). The additive `ProviderSecretHandle`
  preserves this.

Gate verdicts:
- **G1 secret-handle invariant (CRITICAL): PASS.** `ProviderSecretHandle` exposes handle/status/metadata
  ONLY (handleId/status/lastRotated/vaultRef-label); NO key/secret/decryptable field. `TT-PROVIDER-NO-KEY-MATERIAL`
  (3 facets: read-model field-name scan + fixture scan + dist bundle scan) is the explicit guard. The mock
  derives `handleId` (e.g. `pk_ref_<provider>_01`) from existing status — no real key is ever read/serialized.
  OQ-C correctly flags that a bullet-mask `maskedTail` would trip the existing `/[A-Za-z-]{2,}•{3,}/` bundle
  guard (verified `no-secret-bundle.test.ts:60`) and recommends OMIT. **No code path can leak provider key
  material to the browser.**
- **G2 read seams: PASS** (row #2 transport via row #3 `../adapters` precedent; no new method; no fork;
  `TT-NO-INLINE-MOCK` in P4 gate).
- **G3 guarded CONFIG mutations: PASS** (row #2 RBAC + row #5 audit; per-family allow/deny + audit-asserted;
  setProviderRouting deny ×4 ZERO append; reuses keys/audit code; these are exactly the 3 families row #3 left
  no-op).
- **G4 contract-only scope: PASS** (`applied:false`; no backend/provider/secret/write; no #6 bleed).
- **G5 W0/boundary: PASS** (admin-side only; no shared `@repo/*`; no `@repo/audit-log-integrity` import —
  row #5 ported the pattern, verified imports are local `./hashChain`; no `@repo/core/src/events`; no Tauri).
- **G6 no service-role/provider keys; no syncScope: PASS** (carried `TT-NO-SECRET-SRC/BUNDLE` + new guard;
  D4 deferred).
- **G7 builds on #1/#2/#3/#5, no fork: PASS** (`GuardedCommandAdapter` EXTENDED not forked; slice #1
  `mockAdminCommandAdapter`+`TT-CMD-NOOP` intact; row #3 pages byte-identical via P4 `git diff`; distinct doc
  landing under `apps/admin/docs/feature-ai-provider-control/`, no collision).
- **G8 phasing + doc-contract: PASS** (4 independently-verifiable phases; P3 isolates the security dimension;
  design/api/test/dev_log consistent; dev_log fields maintained). #6 dep order preserved.

Builder notes (carry into build; non-blocking — already covered by plan OQs/cautions):
- **N-1 (P3):** ensure `TT-PROVIDER-NO-KEY-MATERIAL`'s field-name denylist does NOT false-positive on
  `vaultRef` / the substring "vault" (it is a non-secret label/path, not a key field). The plan's denylist
  (`apiKey`/`secret`/`secretKey`/`token`/`credential`/`privateKey`/`keyMaterial`/`keyMask`) correctly omits
  `vaultRef` — keep it that way.
- **N-2 (P3/P1):** OQ-C (OMIT `maskedTail` — recommended) and OQ-A (EXTEND the existing `GuardedCommandAdapter`
  — recommended) are genuine build-time picks; follow the plan's safe-default recommendations and record the
  chosen shape in the relevant phase.

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Feature-flags read seam + guarded setFeatureRollout | DONE | `9f76ef9` |
| P2 — AI-quota read seam + guarded setQuota | DONE | `70ea017` |
| P3 — Provider config read (secret-handles) + guarded setProviderRouting + provider-key no-leak guard | DONE | `2be5864` |
| P4 — Wire pages + injection flip + carried-guard re-run | DONE | `1663901` |

## Work Log (append-only)

### Round 3 — 2026-06-06 · feature-auto-build P1 (inline host · `codex exec`)

- **Executor**: claude-opus-4-8 (feature-dev-loop). Native sub-agent spawn was unavailable in this runtime
  (the `Task` tool is not invocable inside a subagent), so the loop adopted the `feature-auto-build` role
  INLINE as host. **D-Codex preserved**: P1 production code + tests were implemented by delegating to
  `codex exec` (codex-cli 0.135.0, full-auto non-interactive); the host prepared the scoped prompt, reviewed
  the diff, ran verification, and created the commit.
- **Phase**: P1 — Feature-flags read seam + guarded `setFeatureRollout`.
- **Action**:
  - Added `featuresReadSeam` to `adapters/index.ts` (ADDITIVE; mirrors the row #3 `usersReadSeam` pattern;
    `.list(query)`→`adminApiClient.getFeatures`, `.get(key)`→`adminApiClient.getFeature`; returns the slice-#1
    `FeatureFlag[]`/`FeatureDetail|null` shapes via `AdminApiResult<T>`; `categories()` deliberately stays on
    the sync slice-#1 `featuresAdapter`). No new transport method.
  - EXTENDED `GuardedCommandAdapter` (M2a / OQ-A — extend, NOT fork) with `setFeatureRollout(input:{key,rollout})`
    → delegates to the row #5 audited `client.setFeatureRollout` (already wired). super+ops allowed.
  - New `adapters/featuresReadSeam.test.ts` (TT-WIRE-FEATURES-READ + TT-READ-NO-IO).
  - Appended rollout describe blocks to `adapters/guardedCommands.test.ts`
    (TT-CMD-GUARDED-ALLOW-setFeatureRollout super/ops · DENY support/finance/audit + no-role ZERO append ·
    AUDIT-ON-MUTATION asserts `mutationFamily==="setFeatureRollout"` + `permissionKey==="admin.features.rollout"`
    + `result==="ok"`); added the `setFeatureRollout` entry to `GUARDED_CALLS` so TT-CMD-APPLIED-FALSE covers it.
  - Forced (NOT scope-bleed) shape-assertion updates from the interface widening: `billingReadSeam.test.ts`
    `TT-BILLING-GATE-NO-MUTATION` key-set + `keyof GuardedCommandAdapter` type assertion now include
    `setFeatureRollout` (its billing-exclusion intent — `BILLING_RE` — is preserved); `wiring.users-orgs-billing.test.tsx`
    `makeSpyCommands()` helper retyped to `AdminCommands` with no-op stubs for the 3 CONFIG families.
    **Row #3 PAGES (Users/Orgs/Billing) are byte-identical** (`git diff --stat` empty over the 3 page files).
  - Codex note: used the real fixture feature key `ai-write` (the planner's illustrative `ai_translate` is not
    in this checkout's fixtures).
- **Commits**: `9f76ef9` — `feat(admin): row #4 P1 — features read seam + guarded setFeatureRollout`.
- **Tests**: `pnpm --filter @repo/admin test` → **329 passed (27 files)** (319 row-#3 baseline preserved + 10
  new); `pnpm --filter @repo/admin exec tsc --noEmit` clean.
- **Gate evidence (P1)**: AC-1 (TT-WIRE-FEATURES-READ + TT-READ-NO-IO) ✓; AC-2 (TT-CMD-GUARDED-ALLOW/DENY +
  AUDIT-ON-MUTATION-setFeatureRollout) ✓; AC-9 (TT-CMD-APPLIED-FALSE/NO-IO/ADVISORY-NOTE carried, setFeatureRollout
  added to APPLIED-FALSE loop) ✓; AC-11 (TT-CMD-GUARDED-IS-ADDITIVE; slice #1 `mockAdminCommandAdapter`+`TT-CMD-NOOP`
  unchanged; row #3 pages byte-identical) ✓. Final independent re-run deferred to feature-verify.
- **Next step**: feature-auto-build P2 — AI-quota read seam + guarded `setQuota`.

### Round 4 — 2026-06-06 · feature-auto-build P2 (inline host · `codex exec`)

- **Executor**: claude-opus-4-8 (feature-dev-loop, inline `feature-auto-build` host). D-Codex: impl via `codex exec`.
- **Phase**: P2 — Entitlements / AI-quota read seam + guarded `setQuota`.
- **Action**:
  - Added `aiUsageReadSeam` to `adapters/index.ts` (ADDITIVE; `.quotaPolicies()`→`adminApiClient.getQuotaPolicies`,
    `.topSpenders()`→`adminApiClient.getTopSpenders`; returns slice-#1 `QuotaPolicy[]`/`SpenderRow[]` via
    `AdminApiResult<T>`). No new transport method.
  - EXTENDED `GuardedCommandAdapter` with `setQuota(input:{subject,quota})` → row #5 audited
    `client.setQuota` (already wired). super+ops allowed.
  - New `adapters/aiUsageReadSeam.test.ts` (TT-WIRE-AIUSAGE-READ + TT-READ-NO-IO).
  - Appended quota describe blocks to `adapters/guardedCommands.test.ts`
    (TT-CMD-GUARDED-ALLOW-setQuota super/ops · DENY support/finance/audit + no-role ZERO append ·
    AUDIT-ON-MUTATION asserts `mutationFamily==="setQuota"` + `permissionKey==="admin.quota.set"`);
    added `setQuota` to `GUARDED_CALLS` (TT-CMD-APPLIED-FALSE coverage).
  - Forced shape-assertion update: `billingReadSeam.test.ts` key-set + `keyof GuardedCommandAdapter` assertion
    now include `setQuota` (billing-exclusion intent preserved). **Row #3 + the 3 CONFIG PAGES byte-identical**
    (`git diff --stat HEAD` empty over all 6 pages; pages are wired in P4, not P2).
- **Commits**: `70ea017` — `feat(admin): row #4 P2 — AI-quota read seam + guarded setQuota`.
- **Tests**: `pnpm --filter @repo/admin test` → **339 passed (28 files)** (329 prior + 10 new); tsc --noEmit clean.
- **Gate evidence (P2)**: AC-3 (TT-WIRE-AIUSAGE-READ) ✓; AC-4 (TT-CMD-GUARDED-ALLOW/DENY + AUDIT-ON-MUTATION-setQuota) ✓;
  AC-9 (applied:false / no-IO / setQuota in APPLIED-FALSE loop) ✓. Final independent re-run deferred to feature-verify.
- **Next step**: feature-auto-build P3 — Provider config read (secret-handles) + SUPER-ONLY `setProviderRouting`
  + the `TT-PROVIDER-NO-KEY-MATERIAL` provider-key no-leak guard.

### Round 5 — 2026-06-06 · feature-auto-build P3 (inline host · `codex exec`) — SECURITY-CRITICAL

- **Executor**: claude-opus-4-8 (feature-dev-loop, inline `feature-auto-build` host). D-Codex: impl via `codex exec`.
- **Phase**: P3 — Provider config read (secret-handles) + SUPER-ONLY `setProviderRouting` + provider-key no-leak guard.
- **Action**:
  - `adapters/types.ts`: ADD `ProviderSecretHandle` (`provider`/`handleId`/`status`/optional `lastRotated`/`vaultRef`)
    — handle/status/metadata ONLY; **NO key/secret/maskedTail field** (N-2 / OQ-C OMIT honored). slice #1
    `ProviderCard`/`ProvidersReadModel` UNCHANGED.
  - `adapters/index.ts`: ADD `providersReadSeam` (`list`→getProviders, `modelPlanMatrix`→getModelPlanMatrix,
    `secretHandles()`→derives opaque `pk_ref_<key>_01` + non-secret `vaultRef`/`lastRotated` from `keyStatus`;
    reads/serializes NO real key). No new transport method.
  - `adapters/guardedCommands.ts`: EXTEND `GuardedCommandAdapter` with `setProviderRouting(input:{plan,model})`
    (imports `PlanTier` from `./types`) → row #5 audited `client.setProviderRouting`. **SUPER-ONLY** enforced by
    the unchanged row #2 RBAC (`PROVIDER_ROUTING` ∈ super only).
  - New `adapters/providersReadSeam.test.ts` (TT-WIRE-PROVIDERS-READ + TT-PROVIDER-HANDLE-SHAPE + TT-READ-NO-IO).
  - Appended provider-routing describe blocks to `guardedCommands.test.ts`
    (TT-CMD-GUARDED-ALLOW-setProviderRouting super · **DENY `it.each(["ops","support","finance","audit"])` ALL →
    forbidden + ZERO append** — proves SUPER-ONLY, even ops denied · no-role → unauthorized · AUDIT-ON-MUTATION
    asserts `admin.providers.routing`); added `setProviderRouting` to `GUARDED_CALLS`.
  - **NEW headline guard `__tests__/no-provider-key.test.ts` — `TT-PROVIDER-NO-KEY-MATERIAL` (3 facets, all PASS)**:
    (1) read-model facet — recursively scans live `providersReadSeam.list()`+`secretHandles()` output: zero
    denylisted secret field-names + zero key-value shapes (`sk-`/`sk-ant-`/`AIza`/bullet-mask); (2) fixture facet —
    scans `fixtures/index.ts` PROVIDERS block: zero key-value shapes + zero denylisted field-name properties;
    (3) bundle facet — self-building `dist/**` scan. **Denylist = `apiKey`/`secret`/`secretKey`/`token`/`credential`/
    `privateKey`/`keyMaterial`/`keyMask`/`maskedTail` — `vaultRef` deliberately EXCLUDED (N-1: non-secret label);
    bare `key` EXCLUDED (ProviderCard.key = provider slug, allowed).**
  - Forced shape-assertion update: `billingReadSeam.test.ts` key-set + `keyof GuardedCommandAdapter` assertion now
    include `setProviderRouting` (reformatted multi-line; billing-exclusion `BILLING_RE` intent preserved).
  - **COMMENT-ONLY** fixtures edit: removed the masked-key example literal (`"sk-••••••a82e"`) from the SECURITY
    doc comment in `fixtures/index.ts` so the new fixture-facet text scanner does not false-positive on its own
    documentation. **Zero fixture DATA changed** (all `keyStatus` provider rows byte-identical; verified via
    `git diff`). All 6 PAGES byte-identical (wired in P4).
- **Commits**: `2be5864` — `feat(admin): row #4 P3 — provider secret-handle read + super-only setProviderRouting + no-key guard`.
- **Tests**: `pnpm --filter @repo/admin test` → **353 passed (30 files)** (339 prior + 14 new); tsc --noEmit clean.
  Headline guard + providers seam isolated run: 7 passed (3 + 4).
- **Gate evidence (P3)**: AC-5 (TT-WIRE-PROVIDERS-READ + TT-PROVIDER-HANDLE-SHAPE) ✓; AC-6 (ALLOW super / DENY
  ops+support+finance+audit ZERO append / AUDIT-ON-MUTATION-setProviderRouting — SUPER-ONLY proven) ✓;
  **AC-7 (TT-PROVIDER-NO-KEY-MATERIAL — read-model + fixture + bundle facets all green) ✓ [HEADLINE]**.
  Final independent re-run deferred to feature-verify.
- **Next step**: feature-auto-build P4 — wire the 3 CONFIG pages to `../adapters` seams + flip `AdminUiContext`
  injection (3 CONFIG families no-op → guarded) + ProvidersPage routing affordance (status only, NO key) + re-run
  carried guards (no-secret / no-inline-mock / TT-CMD-NOOP) + full build + `@repo/web` build + row #3 byte-identical.

### Round 6 — 2026-06-06 · feature-auto-build P4 (inline host · `codex exec`) — FINAL BUILD PHASE

- **Executor**: claude-opus-4-8 (feature-dev-loop, inline `feature-auto-build` host). D-Codex: impl via `codex exec`.
- **Phase**: P4 — wire the 3 CONFIG pages + `AdminUiContext` injection flip + carried-guard re-run.
- **Action**:
  - FLIPPED `components/AdminUiContext.tsx`: `AdminCommands = GuardedCommandAdapter` (was 3 guarded + 3 no-op);
    `baseCommands` now binds all six families to `guarded.*` (the 3 CONFIG families flipped from
    `mockAdminCommandAdapter.*` → `guarded.*`). slice #1 `mockAdminCommandAdapter` + `TT-CMD-NOOP` UNCHANGED.
  - WIRED `pages/FeaturesPage.tsx` → `featuresReadSeam.list({text,category})` async (useEffect+useState; mirrors
    row #3 UsersPage); `featuresAdapter.categories()` stays sync UI config. `commands.setFeatureRollout` call site
    unchanged.
  - WIRED `pages/AiUsagePage.tsx` → `aiUsageReadSeam.topSpenders()`/`.quotaPolicies()` async. `commands.setQuota`
    call site unchanged.
  - WIRED `pages/ProvidersPage.tsx` → `providersReadSeam.list()`/`.modelPlanMatrix()` async; added `useAdminUi()`;
    wired the previously-INERT "管理限速与默认模型" button → `requestConfirm({requireType:"ROUTING", onConfirm: () =>
    commands.setProviderRouting({plan:"Pro", model:p.defaultModel})})` (guarded, super-only, type-to-confirm).
    Renders `keyStatus` STATUS badge ONLY — NO key/secret/mask field in the DOM.
  - New `pages/wiring.feature-ai-provider.test.tsx` (TT-WIRE-FEATURES-PAGE + AIUSAGE-PAGE + PROVIDERS-PAGE; mirrors
    the row #3 wiring test — `makeSpyCommands` all-6 typed `AdminCommands`, `commandsOverride`, async `findBy`/`waitFor`;
    ProvidersPage asserts NO `sk-|sk-ant-|AIza|•{3,}` string in the DOM + routing reaches `commands.setProviderRouting`).
  - Forced (R-RETURN-TYPE) test-harness update: `wiring.users-orgs-billing.test.tsx` `makeSpyCommands` CONFIG-family
    stubs now return `ack` (`{applied:false,auditId}`) not `noop`, because `AdminCommands` CONFIG families are now
    `AdminApiResult<MutationAck>`. Row #3 page assertions (banUser/bulkBan/transferOwnership) unchanged. Row #3 PAGE
    files byte-identical.
- **Commits**: `1663901` — `feat(admin): row #4 P4 — wire CONFIG pages to seams + guarded injection flip`.
- **Tests**: `pnpm --filter @repo/admin test` → **356 passed (31 files)** (353 prior + 3 wiring); tsc --noEmit clean.
- **Gate evidence (P4)**: AC-8 (TT-WIRE-FEATURES/AIUSAGE/PROVIDERS-PAGE + TT-NO-INLINE-MOCK — pages import only
  `../adapters`, page count 10) ✓; AC-10 (TT-NO-SECRET-SRC/BUNDLE re-run green over wired pages + larger dist) ✓;
  AC-11 (TT-CMD-NOOP unchanged; row #3 Users/Orgs/Billing pages byte-identical via `git diff --stat` empty) ✓;
  AC-12 (admin build exit 0, no `.map`; full suite 356 green; `pnpm --filter @repo/web build` exit 0 — regression
  boundary holds) ✓.
- **Build verification**: `pnpm --filter @repo/admin build` → exit 0, dist produced (266.67 kB index, no sourcemap);
  `pnpm --filter @repo/web build` → exit 0 (unaffected).
- **Next step**: feature-verify — independent verification of all 4 phases + the Verification Gates
  (provider-no-key-material; RBAC allow/deny per family; audit-on-mutation; no-secret; no-inline-mock).

### Round 1 — 2026-06-06 · feature-plan (Fresh)

- **Executor**: claude-opus-4-8 (feature-plan)
- **Mode**: Fresh — no prior planning artifacts for slug `xai-admin-feature-ai-provider-control` (verified on
  disk: no `docs/reviews/xai-admin-feature-ai-provider-control/`, no `apps/admin/docs/feature-ai-provider-
  control/`, no `_intake/` brief). Requirement delivered inline as manifest row #4; hard dep row #2 =
  SHIPPED, rows #1, #5, #3 = SHIPPED (row #3 dev_log records `Suggested Next = feature-plan (row #4
  xai-admin-feature-ai-provider-control)`); operator activated the whole admin line and instructed **plan
  row #4 ONLY** (preserve manifest dep order for #6).
- **Goal**: Plan roadmap row #4 — wire the Feature management / AI usage & quota / Provider config pages to
  typed read-model adapters through the row #2 `AdminApiClient` transport, graduate their three CONFIG
  mutations (`setFeatureRollout` / `setQuota` / `setProviderRouting`) from slice #1 no-op to RBAC+audit-gated
  mocks (row #2 + row #5), extend the providers read model to a secret-handle status shape, and add an
  explicit provider-key no-leak guard. Deliver as a contract/wiring-only slice with a mockable transport (no
  server deploy, no real provider call, no real secret material, no real write).
- **Done**:
  - Read manifest row #4 + Implementation Order + Verification Gates; INTEGRATION_PLAN §2 (Feature flags /
    Entitlements-quotas / AI provider config / AI usage rows + gaps) + §4.4 (guarded mutations) + §4.5
    ("store provider credentials as server-side encrypted secret handles, never in browser"); SHIPPED slice
    #1 design/api + row #2 design/api/test (read models · permission keys · RBAC · `AdminApiClient`) + row #5
    design/api/test (audit-on-mutation invariant · `createAuditedMockAdminApiClient` · `FAMILY_ACTION`
    covering all six families) + row #3 design/api/dev_log (composed `../adapters` read-seam pattern ·
    `GuardedCommandAdapter` · `AdminUiContext` combined `AdminCommands` surface); ADR-0013 (D3 W0 / D4 sync
    PAUSED); PLUGIN_MAP (`@repo/plugin-web-ai-chat` = Stable USER-level key store = concept reference only;
    `@repo/web-auth-device-session` = Stable, do not modify); CLAUDE.md boundaries; SOP_NEW_FEATURE;
    SUBAGENT_WORKFLOW_V2 state-write rules (first NEEDS_REVIEW writes `Automation Mode` + `Verify Cross-vendor`).
  - Inspected the load-bearing source: row #2 `contracts/adminApi.ts` (the `AdminApiClient` already exposes
    `getFeatures`/`getFeature`/`getQuotaPolicies`/`getTopSpenders`/`getProviders`/`getModelPlanMatrix` reads
    + `setFeatureRollout`/`setQuota`/`setProviderRouting` mutations — **no new transport method needed**);
    row #2 `authz/{permissionKeys,rbac}.ts` (`MUTATION_PERMISSION` — setFeatureRollout→`FEATURE_ROLLOUT`
    super+ops, setQuota→`QUOTA_SET` super+ops, setProviderRouting→`PROVIDER_ROUTING` **super-only**; **no new
    key needed**); row #5 `audit/auditedMutation.ts` (`createAuditedMockAdminApiClient`; `FAMILY_ACTION`
    already maps the 3 CONFIG families; `appendThenAck` granted-append / denied-zero; `applied:false` +
    `auditId` — **no new audit code needed**); row #3 `adapters/guardedCommands.ts` (`GuardedCommandAdapter`
    3-family — EXTEND to six) + `components/AdminUiContext.tsx` (the combined `AdminCommands` type ALREADY
    has the 3 CONFIG families pointing at slice #1 no-op `mockAdminCommandAdapter` — **the exact flip point**)
    + the row #3 composed seams in `adapters/index.ts` (lines 307-364 — the additive `../adapters` precedent);
    slice #1 `adapters/{types,index}.ts` (`Features/AiUsage/ProvidersReadModel`; `ProviderCard.keyStatus`-only;
    mock adapters pinned by `adapters.test.ts`), `adapters/commands.ts` (`mockAdminCommandAdapter` no-op),
    `pages/{FeaturesPage,AiUsagePage,ProvidersPage}.tsx` (Features calls `commands.setFeatureRollout` no-op;
    AiUsage calls `commands.setQuota` no-op; Providers fully read-only/`keyStatus`-only with an **inert**
    routing button — all THREE byte-identical / unwired per row #3's P4b corrective), the carried guards
    `__tests__/{no-inline-mock,no-secret,no-secret-bundle}.test.ts` (pages must import `../adapters`, never
    `../fixtures`, 10 pages; `sk-`/`sk-ant-`/`AIza`/service-role/bullet-mask forbidden over all `src/`+`dist/`),
    fixtures (`PROVIDERS` `keyStatus`-only — prototype `keyMask` already DROPPED; `ROUTING` per-plan model
    routing; `AI_CONSUMERS` spenders; `FEATURES` rollout+quota).
  - Web research (2026-06): confirmed the provider secret-handle invariant reflects the canonical current
    industry pattern — Portkey "secret references" (the actual key never touches the control plane; only the
    reference config + auto-masked fields are visible; the data plane fetches the credential at runtime);
    LiteLLM virtual keys (real provider keys stay hidden in the gateway; the admin UI manages status/usage);
    Stripe/Microsoft/mParticle (client secrets unrecoverable after creation; only masked last-4 returned);
    the standard API-key UI model exposes `id`/`status`/`key_prefix`/`last_rotated`/`last_used` and stores
    only a one-way hash server-side. This validates P2 (handle/status read model) + G2 (provider-key no-leak
    guard) + the "real secret storage is server-side, out of scope" deferral. Sources recorded in the
    discovery review §7. (This was the only part needing external research; the read wiring + mutation
    graduation reuse SHIPPED seams verbatim.)
  - Resolved 5 design axes: R2 (additive composed read seams over the `AdminApiClient`), M2/M2a (EXTEND the
    guarded adapter to all six families + flip the `AdminUiContext` injection — the row #2 OQ-F / row #5 OQ-G
    complement for the 3 CONFIG families), P2 (additive `ProviderSecretHandle` status shape — no key
    material), G2 (explicit `TT-PROVIDER-NO-KEY-MATERIAL` guard), D2 (distinct doc landing). Recorded as
    ADR-lite #1–#4 in design.md.
  - Chose **distinct doc landing**: discovery review under `docs/reviews/xai-admin-feature-ai-provider-control/`;
    four-piece set under `apps/admin/docs/feature-ai-provider-control/` (co-located with the surface; does NOT
    overwrite slice #1 / row #2 / row #5 / row #3 docs — verified those four dirs exist and are distinct).
  - Wrote: discovery review (problem framing + ground-truth inventory of the SHIPPED seams + secret-handle
    web research + R/M/P/G/D options + recommendation + risks/OQs + sources) + design.md (decision snapshot +
    ADR-lite #1–#4 + frozen assumptions + dependency overview + directory shape) + api.md (composed read
    seams + guarded adapter extension + `AdminUiContext` injection flip + `ProviderSecretHandle` read model +
    routing affordance + RBAC mapping + mock role context + fail-closed/server-authoritative + no-key-material
    contract) + test.md (AC-1..AC-12 → test mapping; allow/deny + audit per CONFIG family with
    setProviderRouting super-only deny; `TT-PROVIDER-NO-KEY-MATERIAL` headline guard; carried-guard re-run;
    mock-transport coverage) + this dev_log.
  - Phased the plan into 4 one-phase-per-run build phases per the operator's suggested split: Feature-flags
    read+rollout mutation → Entitlements/AI-quota read+quota mutation → Provider config read (secret-handles)
    + routing mutation + provider-key no-leak guard → wire pages to adapters.
- **Commits**: — (planning artifacts only; no code branch; worktree `claude/frosty-nash-c4bf16`)
- **Tests**: — (none run; planning phase)
- **Risks**: see Risks section (R-SECRET / R-SCOPE / R-ADVISORY / R-ADDITIVE HIGH).
- **Next step**: feature-review — review discovery report + design/api/test/dev_log; verify the R2/M2(M2a)/P2/
  G2 decisions, the W0 boundary (no shared-package change; no `@repo/audit-log-integrity` import; no
  `@repo/web-auth-device-session` change; no `@repo/core/src/events`; no Tauri), the read-seam binding to the
  `AdminApiClient` transport (no new method), the guarded-mutation graduation for the 3 CONFIG families (RBAC
  allow/deny + audit-on-mutation per family; `setProviderRouting` SUPER-ONLY deny ZERO append; no new key/audit
  code) as the realization of row #2 OQ-F / row #5 OQ-G for the CONFIG families, the **provider secret-handle
  read model** (handle/status/metadata only; real secret storage server-side / out of scope) + the explicit
  **provider-key no-leak guard** (`TT-PROVIDER-NO-KEY-MATERIAL`), the "green-without-a-backend / no real
  provider call / no real secret / no real write" scoping, the additive-seam no-fork posture (slice #1 +
  row #2 + row #5 + row #3 suites stay green; `GuardedCommandAdapter` EXTENDED not forked; `TT-NO-INLINE-MOCK`
  + `TT-CMD-NOOP` in the P4 gate; row #3 Users/Orgs/Billing pages byte-identical), and that the manifest
  dependency order for #6 is preserved; give APPROVED or REVISE.

### Round 2 — 2026-06-06 · feature-review (APPROVED)

- **Executor**: claude-opus-4-8 (feature-review)
- **Mode**: Review — `Status = NEEDS_REVIEW`, `Suggested Next = feature-review`. Reviewed the Round-1 Fresh
  plan (discovery review + design/api/test/dev_log) against the 8 verification gates with EXTRA scrutiny on
  the provider secret-handle invariant (CRITICAL).
- **Action**: Verdict **APPROVED**. Verified every load-bearing claim against SHIPPED source (not on trust):
  read `authz/permissionKeys.ts` (`MUTATION_PERMISSION` maps all 3 CONFIG families; lines 74-81),
  `authz/rbac.ts` (`ROLE_GRANTS` — `PROVIDER_ROUTING` super-only, `FEATURE_ROLLOUT`/`QUOTA_SET` super+ops;
  lines 65-83), `audit/auditedMutation.ts` (`appendThenAck` + `FAMILY_ACTION` audit all six families;
  granted → append+`{applied:false,auditId}`, denied → ZERO; lines 74-81/135-157/168-173),
  `adapters/guardedCommands.ts` (3 families today, EXTEND-to-six is additive over the same factory; lines 24-45),
  `components/AdminUiContext.tsx` (the exact flip point — 3 CONFIG families on slice #1 no-op; lines 32-34/61-63),
  `adapters/types.ts` (`ProviderCard` keyStatus-only, "NEVER key material"; `ProviderCard.key` = slug;
  lines 247-261), `pages/ProvidersPage.tsx` (byte-identical/unwired; inert "管理限速与默认模型" button; lines 65-67),
  `adapters/index.ts` (row #3 composed `../adapters` read-seam precedent the plan applies verbatim; lines 307-364),
  `__tests__/no-secret-bundle.test.ts` (existing bullet-mask guard `/[A-Za-z-]{2,}•{3,}/`; line 60),
  `__tests__/no-inline-mock.test.ts` (10-page + `../adapters` discipline; lines 39/48-62).
- **Gate results**: G1 secret-handle invariant (CRITICAL) PASS — handle/status/metadata-only read model,
  explicit `TT-PROVIDER-NO-KEY-MATERIAL` (read-model + fixture + bundle facets), no code path serializes a
  real key; G2 read seams PASS; G3 guarded CONFIG mutations PASS (per-family RBAC+audit, setProviderRouting
  super-only deny ×4 ZERO append); G4 contract-only scope PASS (`applied:false`, no backend/secret/write);
  G5 W0/boundary PASS (admin-side only; no shared `@repo/*`; no `@repo/audit-log-integrity`; no events; no Tauri);
  G6 no service-role/provider keys, no syncScope PASS; G7 builds on #1/#2/#3/#5 no-fork PASS (additive seams,
  EXTENDED not forked adapter, row #3 pages byte-identical, distinct doc landing); G8 phasing + doc-contract
  PASS (4 independently-verifiable phases, P3 isolates the security dimension, docs consistent, #6 dep order
  preserved). 0 blockers; 2 non-blocking builder notes recorded (N-1 vaultRef not a key field; N-2 follow
  OQ-C OMIT maskedTail / OQ-A EXTEND adapter). See Review Notes.
- **Commits**: — (review only; no code branch; worktree `claude/frosty-nash-c4bf16`)
- **Tests**: — (review phase; no tests run — gates verified by source inspection)
- **Next step**: feature-build — implement P1 (Feature-flags read seam + guarded `setFeatureRollout`), ONE
  phase per run; or feature-auto-build / feature-dev-loop for batch execution.

### Round 7 — 2026-06-06 · feature-verify (PASS · inline) — READY_TO_SHIP

- **Executor**: claude-opus-4-8 (feature-dev-loop → inline `feature-verify`). Native sub-agent spawn was
  unavailable in this runtime, so the loop ran the verify pass inline (read-only verification; no code written).
- **Mode**: Verify — `Status = READY_FOR_VERIFY`, all 4 phases DONE. Independent verification of P1–P4 against the
  plan / design / api / test contracts + the manifest Verification Gates, with EXTRA scrutiny on the provider
  secret-handle invariant.
- **Commits reviewed**: `9f76ef9` (P1), `70ea017` (P2), `2be5864` (P3), `1663901` (P4), `29449fd` (dev_log hashes).
  Each commit has a single phase-scoped intent; no commit crosses a phase boundary or mixes unrelated changes;
  messages follow `type(scope): summary` + Why/What/Scope/Risk/Docs/Tests.
- **Independent gate results** (re-run fresh from clean — NOT trusting build-phase reports):
  - **tsc --noEmit**: clean.
  - **Full suite** `pnpm --filter @repo/admin test` → **356 passed (31 files)**; every row #4 gate file green:
    `no-provider-key.test.ts` (3), `no-secret.test.ts` (4), `no-secret-bundle.test.ts` (10),
    `no-inline-mock.test.ts` (21), `guardedCommands.test.ts` (39), `featuresReadSeam`/`aiUsageReadSeam`/
    `providersReadSeam` (3/3/4), `wiring.feature-ai-provider.test.tsx` (3), `wiring.users-orgs-billing.test.tsx` (3).
  - **Builds**: `pnpm --filter @repo/admin build` exit 0 (dist, no `.map`); `pnpm --filter @repo/web build` exit 0
    (regression boundary — unaffected).
  - **AC-7 HEADLINE (provider-no-key-material)**: PASS. Unit guard (read-model + fixture + bundle facets) green,
    PLUS an adversarial direct grep over `dist/**`: ZERO provider-key VALUE shapes (`sk-`/`sk-ant-`/`AIza`/bullet-mask/
    `service_role`). Investigated the bare token `apiKey` in the bundle → it is the **Supabase Realtime client
    library's** internal connection-config field name (`this.socket.apiKey`, `apikey` HTTP header) — a generic
    vendored-dep identifier, NOT provider key material and NOT on the providers read path; in admin SOURCE `apiKey`
    appears ONLY inside the guard denylists + an `adapters.test.ts` "is undefined" assertion (i.e. used only to PROVE
    absence). The carried `TT-NO-SECRET-BUNDLE` (key-VALUE + service-role scan) was green across rows #1–#5 with this
    same lib present. Not a leak; not a blocker.
  - **AC-2/4/6 (RBAC allow/deny + audit per family)**: PASS. `setFeatureRollout`/`setQuota` super+ops allow,
    support/finance/audit + no-role deny (ZERO append); `setProviderRouting` SUPER-ONLY (`it.each(ops,support,
    finance,audit)` ALL forbidden + ZERO append, no-role unauthorized); each granted call appends exactly one event
    (`admin.features.rollout` / `admin.quota.set` / `admin.providers.routing`), `applied:false` + `auditId`.
  - **AC-8 (wiring + no-inline-mock)**: PASS. 3 CONFIG pages read via `../adapters` seams; page count 10; none import
    `../fixtures` or a client module; ProvidersPage renders STATUS only (no key/secret string in the DOM) and its
    routing affordance reaches `commands.setProviderRouting`.
  - **AC-11 (additive / byte-identical)**: PASS. slice #1 `mockAdminCommandAdapter` + `TT-CMD-NOOP` unchanged; row #3
    Users/Orgs/Billing PAGES byte-identical across the WHOLE row #4 range (`git diff 9f76ef9^..HEAD` empty over the 3
    page files).
  - **AC-5/AC-1/AC-3 (read seams + handle shape)**: PASS. **AC-9 (advisory/applied:false/no-IO/chain-after-N)**: PASS.
    **AC-10 / AC-12 (no-secret + builds)**: PASS.
  - **W0 boundary**: PASS. Across the row #4 commit range (`9f76ef9^..HEAD`) the ONLY non-`apps/admin` file is this
    row's `docs/reviews/xai-admin-feature-ai-provider-control/20260606-discovery-review.md`. No NEW shared `@repo/*`
    change (the pre-existing `@repo/web-auth-device-session` imports in App.tsx/auth/* are slice #1/row #2 files,
    untouched by row #4); no `@repo/audit-log-integrity` import (only absence-proving comments/tests); no
    `@repo/core/src/events`; no Tauri.
- **Verdict**: **PASS → READY_TO_SHIP.** 0 blockers. Residual (non-blocking): real service-role
  feature/quota/provider endpoints + real provider routing effect + real server-side encrypted secret-handle vault +
  runtime credential fetch are deferred (OQ-D, later/production row); manual browser smoke of the 3 wired pages
  (Features take-offline [ops/super], AI-usage adjust-quota [ops/super], Providers routing [super-only] +
  secret-handle status display with NO key) on real hardware is standard pre-ship for admin UI (non-blocking for the
  unit/contract gate).
- **Commits**: — (verify only; no code change). The verify-result dev_log update is committed as a docs commit.
- **Next step**: ship — verify commit integrity, push to remote, mark SHIPPED (requires explicit human confirmation;
  feature-dev-loop STOPS before ship).
