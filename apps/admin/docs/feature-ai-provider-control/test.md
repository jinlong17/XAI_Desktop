# test.md — xai-admin-feature-ai-provider-control

> Validation strategy / mock strategy / acceptance criteria for wiring the admin **Feature management /
> AI usage & quota / Provider config** pages + graduating their three CONFIG mutations + the provider
> secret-handle read model + the explicit provider-key no-leak guard (roadmap row #4).
> Runner: Vitest (`pnpm --filter @repo/admin test`). Build gate: `pnpm --filter @repo/admin build` (vite).
> Row #4 is **contract/wiring-only**: every gate is a unit/component test with a **mockable transport** —
> NO server deploy, NO real provider call, NO real secret material, NO real mutation are required for
> "green". Builds on slice #1's + row #2's + row #5's + row #3's suites (must remain green + unaffected).

## 0. Acceptance criteria (binary, testable) — derived from manifest row #4 + INTEGRATION_PLAN §2 / §4.4 / §4.5

| AC | Criterion | Test(s) | Phase |
|---|---|---|---|
| **AC-1** | Feature management page reads through a typed adapter bound to the `AdminApiClient` transport (not inline mock); returns the §1 contract shape | `TT-WIRE-FEATURES-READ`, `TT-READ-NO-IO` | P1 |
| **AC-2** | `setFeatureRollout` graduated to an RBAC+audit-gated mock: allow (super/ops) → `applied:false`+`auditId`+exactly one audit event; deny (support/finance/audit/no-role) → forbidden/unauthorized + ZERO append | `TT-CMD-GUARDED-ALLOW-setFeatureRollout`, `TT-CMD-GUARDED-DENY-setFeatureRollout`, `TT-CMD-AUDIT-ON-MUTATION-setFeatureRollout` | P1 |
| **AC-3** | AI usage & quota page reads through the typed adapter bound to the transport | `TT-WIRE-AIUSAGE-READ` | P2 |
| **AC-4** | `setQuota` graduated to an RBAC+audit-gated mock: allow (super/ops) → `applied:false`+`auditId`+one event; deny → forbidden/unauthorized + ZERO append | `TT-CMD-GUARDED-ALLOW-setQuota`, `TT-CMD-GUARDED-DENY-setQuota`, `TT-CMD-AUDIT-ON-MUTATION-setQuota` | P2 |
| **AC-5** | Provider config page reads through the typed adapter bound to the transport; the providers read model exposes a **secret-handle status** shape (handle/status/metadata only) | `TT-WIRE-PROVIDERS-READ`, `TT-PROVIDER-HANDLE-SHAPE` | P3 |
| **AC-6** | `setProviderRouting` graduated to an RBAC+audit-gated mock, **SUPER-ONLY**: allow (super) → `applied:false`+`auditId`+one event; deny (ops/support/finance/audit/no-role) → forbidden/unauthorized + ZERO append | `TT-CMD-GUARDED-ALLOW-setProviderRouting`, `TT-CMD-GUARDED-DENY-setProviderRouting`, `TT-CMD-AUDIT-ON-MUTATION-setProviderRouting` | P3 |
| **AC-7** | **Provider-key no-leak invariant (HEADLINE):** the providers read model + `ProviderCard` + `ProviderSecretHandle` carry NO key-material-valued field; the providers fixtures contain no provider-key-shaped string; the built bundle carries no provider key material | `TT-PROVIDER-NO-KEY-MATERIAL` (read model + fixtures + bundle) | P3 |
| **AC-8** | The 3 CONFIG pages are wired to the composed `../adapters` seams; their mutations reach the guarded adapter; ProvidersPage renders no provider key; page count stays 10 | `TT-WIRE-FEATURES-PAGE`, `TT-WIRE-AIUSAGE-PAGE`, `TT-WIRE-PROVIDERS-PAGE`, `TT-NO-INLINE-MOCK` | P4 |
| **AC-9** | All guarded mutations are server-authoritative / browser-advisory / `applied:false` / no-I/O; chain `verify()` green after N mixed CONFIG mutations | `TT-CMD-APPLIED-FALSE`, `TT-CMD-NO-IO`, `TT-CMD-ADVISORY-NOTE`, `TT-CMD-CHAIN-AFTER-N` | P1–P4 |
| **AC-10** | No service-role token / provider secret / Stripe secret in admin src or built bundle (carried invariant; covers new modules) | `TT-NO-SECRET-SRC`, `TT-NO-SECRET-BUNDLE` (slice-#1 guards, re-run) | P4 |
| **AC-11** | Additive — slice #1 / row #2 / row #5 / row #3 suites unaffected; slice #1 `mockAdminCommandAdapter` + `TT-CMD-NOOP` unchanged; row #3 Users/Orgs/Billing pages + families unchanged | `TT-CMD-NOOP` (re-run), full `vitest run`, `git diff` byte-check on row #3 pages | P4 |
| **AC-12** | `apps/admin` builds green + all tests pass; `@repo/web` build green + unaffected | `TT-BUILD`, full `vitest run`, `pnpm --filter @repo/web build` | P4 |

## 1. Unit coverage

### Composed read seams (`adapters/index.ts`)
- **TT-WIRE-FEATURES-READ**: `featuresReadSeam.list(query)`/`.get(key)` delegate to `adminApiClient`
  (`getFeatures`/`getFeature`), return `AdminApiResult<FeatureFlag[]>`/`<FeatureDetail|null>`; data matches
  the slice-#1 fixture shapes (no fork). `categories()` stays on the slice #1 `featuresAdapter` (sync).
- **TT-WIRE-AIUSAGE-READ**: `aiUsageReadSeam.quotaPolicies()`/`.topSpenders()` delegate to
  `getQuotaPolicies`/`getTopSpenders`; return `AdminApiResult<QuotaPolicy[]>`/`<SpenderRow[]>`.
- **TT-WIRE-PROVIDERS-READ**: `providersReadSeam.list()`/`.modelPlanMatrix()` delegate to
  `getProviders`/`getModelPlanMatrix`; return `AdminApiResult<ProviderCard[]>`/`<ModelPlanCell[]>`.
- **TT-READ-NO-IO**: the read seams perform no `fetch`/`localStorage`/`sessionStorage` (spy assertions);
  resolve on a microtask (mock transport).

### Provider secret-handle model (`adapters/types.ts` + `adapters/index.ts`)
- **TT-PROVIDER-HANDLE-SHAPE**: `ProviderSecretHandle` carries `provider`/`handleId`/`status`
  (+ optional `lastRotated`/`vaultRef`); `status ∈ "configured"|"not-configured"`; `handleId` is an opaque
  NON-secret reference string (e.g. matches `/^pk_ref_/` or a documented non-secret pattern); the
  `secretHandles()` projection (if surfaced) returns one entry per provider, sourced from fixtures' status.

### Guarded command adapter — 3 CONFIG families (`adapters/guardedCommands.ts`)
- **TT-CMD-GUARDED-ALLOW-setFeatureRollout** (`ops`/`super` → `{ applied:false, auditId }`, chain +1).
- **TT-CMD-GUARDED-DENY-setFeatureRollout** (`support`/`finance`/`audit` → `forbidden`; no-role →
  `unauthorized`; **ZERO** append each).
- **TT-CMD-GUARDED-ALLOW-setQuota** (`ops`/`super` → `{ applied:false, auditId }`, chain +1).
- **TT-CMD-GUARDED-DENY-setQuota** (`support`/`finance`/`audit` → `forbidden`; no-role → `unauthorized`;
  **ZERO** append each).
- **TT-CMD-GUARDED-ALLOW-setProviderRouting** (`super` → `{ applied:false, auditId }`, chain +1).
- **TT-CMD-GUARDED-DENY-setProviderRouting** (**`it.each(["ops","support","finance","audit"])` → all 4
  `forbidden` + ZERO append**; no-role → `unauthorized` + ZERO append — **SUPER-ONLY** proven).
- **TT-CMD-AUDIT-ON-MUTATION-setFeatureRollout / -setQuota / -setProviderRouting**: each granted call
  appends exactly ONE `AdminAuditEvent` with `mutationFamily` = the family, `permissionKey` =
  `MUTATION_PERMISSION[family]` (`admin.features.rollout` / `admin.quota.set` / `admin.providers.routing`),
  `result:"ok"`, `target` derived from input (model identifiers only — no secret).
- **TT-CMD-APPLIED-FALSE**: every granted CONFIG mutation returns `applied:false` (no real write).
- **TT-CMD-NO-IO**: the guarded adapter performs no `fetch`/storage; holds no provider/service-role
  credential (spy assertions).
- **TT-CMD-ADVISORY-NOTE**: `GUARDED_COMMAND_ADVISORY_NOTE` (carried) names the SERVER as the real enforcer.
- **TT-CMD-CHAIN-AFTER-N**: after N mixed granted/denied CONFIG mutations, `chain.verify()` is green and
  the chain length equals the granted count (denials appended nothing).
- **TT-CMD-GUARDED-IS-ADDITIVE**: slice #1's `mockAdminCommandAdapter.setFeatureRollout`/`setProviderRouting`/
  `setQuota` still return `{ ok:true, noop:true, reason:"slice-1-mock-no-write" }` (UNCHANGED).

### Provider-key no-leak guard (`__tests__/no-provider-key.test.ts`) — HEADLINE
- **TT-PROVIDER-NO-KEY-MATERIAL** (3 facets):
  1. **Read-model facet:** the providers read model output (`ProviderCard[]` + `ProviderSecretHandle[]`)
     carries NO field whose name is a secret-value key (`apiKey`/`secret`/`secretKey`/`token`/`credential`/
     `privateKey`/`keyMaterial`/`keyMask`) and NO field value matching a provider-key shape
     (`sk-`/`sk-ant-`/`AIza`/bullet-mask). (`ProviderCard.key` = provider SLUG is explicitly allowed.)
  2. **Fixture facet:** `apps/admin/src/fixtures` providers data contains no provider-key-shaped string
     (re-asserts the slice #1 `keyMask`-dropped invariant).
  3. **Bundle facet:** a scan over `dist/**` (self-building, like `TT-NO-SECRET-BUNDLE`) finds zero
     provider-key shapes attributable to the providers path. (May reuse the `TT-NO-SECRET-BUNDLE` harness
     with the provider-key patterns; the point is an EXPLICIT, named provider-key assertion.)

## 2. Component coverage (`pages/wiring.feature-ai-provider.test.tsx`)
- **TT-WIRE-FEATURES-PAGE**: `FeaturesPage` renders seam-backed rows (async `findBy*`/`waitFor`); the
  "take offline" confirm reaches `commands.setFeatureRollout` (spy via `commandsOverride`). Imports only
  `../adapters` (+ `../adapters/types`).
- **TT-WIRE-AIUSAGE-PAGE**: `AiUsagePage` renders seam-backed spenders/policies; "调整配额" reaches
  `commands.setQuota` (spy). Imports only `../adapters` (+ types).
- **TT-WIRE-PROVIDERS-PAGE**: `ProvidersPage` renders seam-backed provider cards (secret-handle **status**
  only — `findBy` the configured/last-rotated chip; **assert NO key/secret string in the DOM**); the
  routing affordance reaches `commands.setProviderRouting` (spy, super role). Imports only `../adapters`
  (+ types).

## 3. Contract / source-text guard coverage (carried from slice #1 + row #3; covers new modules)
- **TT-NO-INLINE-MOCK** (slice #1, re-run): 10 page components; every page imports `../adapters`; none
  imports `../fixtures` or a client module directly. The 3 wired CONFIG pages import only `../adapters`
  (+ `../adapters/types`).
- **TT-NO-SECRET-SRC** (slice #1, re-run): scans all `apps/admin/src/**` — the new `adapters/` modules +
  `ProviderSecretHandle` type + wired pages are covered automatically. Must stay green.
- **TT-NO-SECRET-BUNDLE** (slice #1, re-run, self-building): scans `dist/**` — the new modules' compiled
  output is covered (incl. `sk-`/`sk-ant-`/`AIza`/service-role/bullet-mask). Must stay green.
- **TT-CSP-GUARD** (slice #1, re-run): unchanged (no `_headers` change this row); confirm no regression.
- **TT-CMD-NOOP** (slice #1, re-run): `mockAdminCommandAdapter` UNCHANGED (all six no-op methods intact).

## 4. Mock strategy (Typed Contract Mock — recap + extension)
- **The interface is the seam.** Row #4 reuses row #2's `AdminApiClient` (no new method), row #5's audited
  client (no new audit code), and row #3's `GuardedCommandAdapter` (EXTENDED to all six families, not
  forked). Tests target the *interface contract* so a later real-server swap inherits the same test surface.
- **No real server, no real provider call, no real secret, no real mutation** in any test. The guarded mock
  fails closed and performs no I/O. The providers read model exposes status/handle/metadata only.
- **Fixtures** reused from slice #1 (`apps/admin/src/fixtures`) for read methods; **no new fixtures with
  secret-shaped strings** (providers stay handle/status-only; the `ProviderSecretHandle.handleId` is an
  opaque NON-secret reference, e.g. `pk_ref_<provider>_01`, derived — not a key).
- **Unit tests construct explicit roles** (`createGuardedCommandAdapter({ role })`) for allow AND deny per
  CONFIG family; component tests inject spies via `commandsOverride` (row #3 precedent) and do NOT depend on
  `VITE_ADMIN_MOCK_ROLE`.

## 5. Build / regression
- **TT-BUILD**: `pnpm --filter @repo/admin build` exits 0; `dist/` produced; no `.map` emitted (slice-#1
  `sourcemap:false` retained).
- **Full suite**: `pnpm --filter @repo/admin test` → slice #1 + row #2 + row #5 + row #3 baseline (319 as
  of row #3 ship) UNCHANGED + row #4's new tests all pass.
- **Regression boundary**: `pnpm --filter @repo/web build` green + unaffected (admin is a separate app;
  row #4 adds no shared module). No `@repo/web-auth-device-session` change → that package's tests
  unaffected. **Row #3 Users/Orgs/Billing pages byte-identical** (`git diff` empty over those three pages
  + their guarded families).
- **`check-types` / `tsc --noEmit`**: clean (the extended `GuardedCommandAdapter`, the `ProviderSecretHandle`
  type, the read seams, and the flipped `AdminCommands` all compile).

## 6. Out of scope for row #4 tests (deferred by row — explicit)
- Real service-role feature/quota/provider endpoints (real JWT → server authz → DB / vault) → later rows.
- Real provider routing effect + real server-side encrypted secret-handle storage + runtime vault
  credential fetch → later/production row (no server line; D4 PAUSED). Row #4 tests the contract + mock +
  test surface (handles only).
- Billing mutations / Stripe (row #3 gate, deferred); Users/Orgs pages + families (row #3, UNCHANGED);
  dashboard/audit/settings pages (rows #5/#6); deploy/observability/runbook (row #6).
- Two-device / cross-device sync of any admin provider/feature/quota read model → ADR-0013 §D4 / PAUSED
  `sync` line — **never** in this row (no `syncScope` entity added).
- Manual browser smoke (the 3 wired pages: Features take-offline confirm [ops/super], AI-usage adjust-quota
  [ops/super], Providers routing confirm [super-only] + secret-handle status display with NO key) on real
  hardware → standard for admin UI; run at/before ship (non-blocking for unit/contract "green").
