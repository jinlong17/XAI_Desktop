# design.md — xai-admin-feature-ai-provider-control

> Decision snapshot ONLY (discovery detail lives in the review doc, not here).
> Surface: `apps/admin/` (the SHIPPED isolated Web-line app — slice #1 + row #2 + row #5 + row #3 all SHIPPED).
> This row WIRES the Feature management / AI usage & quota / Provider config pages to the typed transport
> seam, graduates their three guarded mutations (`setFeatureRollout` / `setQuota` / `setProviderRouting`) to
> RBAC+audit-gated mocks, extends the providers read model to a secret-handle status shape, and adds an
> explicit provider-key no-leak guard. It does NOT add new top-level pages.
> Roadmap row **#4 of 6** of `xai-admin-dashboard-system-integration`. Hard dep row #2 = SHIPPED; rows #1, #5, #3 = SHIPPED.
> Distinct landing — does NOT overwrite slice #1's `apps/admin/docs/{design,api,test,dev_log}.md`, row #2's
> `apps/admin/docs/data-contracts-rbac/*`, row #5's `apps/admin/docs/audit-ops-queue/*`, or row #3's
> `apps/admin/docs/users-orgs-billing/*`.

## Decision snapshot

| Field | Value |
|---|---|
| **Selected Option (read wiring, Axis R)** | **R2** — additive composed read seams in `apps/admin/src/adapters/index.ts` (`featuresReadSeam`/`aiUsageReadSeam`/`providersReadSeam`) that delegate Features/AI-usage/Providers reads to row #2's `AdminApiClient` (`getFeatures`/`getFeature`/`getQuotaPolicies`/`getTopSpenders`/`getProviders`/`getModelPlanMatrix`); the three pages keep importing `../adapters` (TT-NO-INLINE-MOCK green). Slice #1's `featuresAdapter`/`aiUsageAdapter`/`providersAdapter` are UNCHANGED (the row #3 / row #5 R-1 additive-seam precedent; slice #1 `adapters.test.ts` untouched). |
| **Selected Option (mutation wiring, Axis M)** | **M2** — surface `setFeatureRollout`/`setQuota`/`setProviderRouting` on the guarded command adapter (delegating to row #5's `createAuditedMockAdminApiClient` → row #2 `canMutate` RBAC + row #5 `appendThenAck`), and flip the `AdminUiContext` injection for those three families from slice #1's no-op `mockAdminCommandAdapter` to the guarded adapter. **M2a:** EXTEND row #3's existing `GuardedCommandAdapter` to all six families (one guarded surface; mirrors the audited client's six-method shape) rather than a separate adapter. This realizes the row #2/#5 mutation contract for the three CONFIG families (the complement of row #3's ban/bulk-ban/transfer). Slice #1 `mockAdminCommandAdapter` + `TT-CMD-NOOP` left intact (additive). |
| **Selected Option (provider secret-handle, Axis P)** | **P2** — EXTEND the providers read model with a typed, additive **secret-handle status** shape (`ProviderSecretHandle`: opaque `handleId` reference id + `configured` status + optional `lastRotated` ISO date + optional non-secret display token + vault/reference label). **NO key, NO full secret, NO decryptable material** — only status + handle + non-secret metadata. Real secret storage is **server-side, out of scope** (handles only). Mirrors the canonical "secret reference" pattern (Portkey / LiteLLM virtual keys / one-way-hash + prefix). |
| **Selected Option (provider-key no-leak guard, Axis G)** | **G2** — add an explicit, provider-specific `TT-PROVIDER-NO-KEY-MATERIAL` guard that PROVES no provider key material can appear in the admin browser bundle: (a) the providers read model / `ProviderCard` / `ProviderSecretHandle` carry NO key-material-valued field (only status/handle/metadata); (b) the providers fixtures contain no provider-key-shaped string; (c) a strengthened bundle scan over `dist/**` for provider-key shapes. ADDITIVE to (not a replacement for) the carried `TT-NO-SECRET-SRC`/`TT-NO-SECRET-BUNDLE`. **This is the row's headline security deliverable.** |
| **Selected Option (transport)** | Reuse row #2's typed **mockable** `AdminApiClient` + row #5's **audited** variant. **NO real server deployed; NO real provider calls; NO real secret material; NO real production write** (mutations stay `applied:false`, now carrying `auditId` for the three graduated families). |
| **Selected Option (doc landing, Axis D)** | **D2** — discovery review under `docs/reviews/xai-admin-feature-ai-provider-control/`; four-piece set under `apps/admin/docs/feature-ai-provider-control/` (co-located with the surface; does NOT overwrite slice #1 / row #2 / row #5 / row #3 docs). |
| **Review Doc Path** | `docs/reviews/xai-admin-feature-ai-provider-control/20260606-discovery-review.md` |
| **Review Date / Version** | 2026-06-06 / v1 (discovery) |
| **Product module** | `admin` (#6) · operator-activated whole line 2026-06-06 · **row #4 only** (preserves manifest dep order; #6 depends on #5) |
| **Branch convention** | `codex/admin/<feature>` (planning-only at this step; no code branch; worktree `claude/frosty-nash-c4bf16`) |
| **D3 classification** | **W0 (web-only, admin-side only)** — no shared `@repo/*` seam modified; no `@repo/audit-log-integrity` import; no `dev` promotion |
| **Cross-window contract impact** | NONE — no new `@repo/core/src/events` typed events; no Tauri command changes (browser-side, contract-only) |
| **syncScope** | NONE — no admin provider/feature/quota read model routed to cross-device persistence (ADR-0013 §D4 / `sync` line PAUSED) |

## ADR-lite records (recorded here per slice-#1 / row-#2 / row-#5 / row-#3 precedent; no standalone ADR infra)

- **ADR-lite #1 (read wiring through the transport seam — R2).** The three pages already satisfy the
  manifest "read through a typed adapter" gate via slice #1's mock adapters, but those bypass row #2's
  `AdminApiClient` transport (the contract a real server later implements). Row #4 binds Features/AI-usage/
  Providers reads to the **async `AdminApiClient` boundary** via additive composed seams in `../adapters`,
  so the later real-server swap is a transport-only change with NO UI rewrite. Re-backing slice #1's
  `featuresAdapter`/`aiUsageAdapter`/`providersAdapter` in place was rejected (their exact synchronous
  fixture behavior is pinned by slice #1's `adapters.test.ts`; re-backing async would break that suite).
  This is the identical additive-seam decision rows #5 and #3 made (row #3 already added
  `usersReadSeam`/`orgsReadSeam`/`billingReadSeam` to this exact file — the proven precedent).

- **ADR-lite #2 (guarded-mutation graduation — M2 / M2a).** The three CONFIG destructive flows
  (`setFeatureRollout` / `setQuota` / `setProviderRouting`) graduate from slice #1's **no-op**
  (`{ ok:true, noop:true }`, no RBAC, no audit) to RBAC+audit-gated mocks by surfacing them on the guarded
  command adapter (delegating to row #5's `createAuditedMockAdminApiClient`) and flipping the
  `AdminUiContext` injection for those three from slice #1's `mockAdminCommandAdapter` to the guarded
  adapter. The audited client **already audits all six families** (verified: `FAMILY_ACTION` +
  `appendThenAck` cover `setFeatureRollout`/`setProviderRouting`/`setQuota`), so this row adds **NO new
  RBAC key and NO new audit code** — it only *exposes* and *wires* three already-contracted families. M2a:
  EXTEND the existing `GuardedCommandAdapter` to all six families (single guarded surface) rather than a
  parallel adapter. RBAC: `setFeatureRollout`→`FEATURE_ROLLOUT` (super+ops), `setQuota`→`QUOTA_SET`
  (super+ops), `setProviderRouting`→`PROVIDER_ROUTING` (**super-only**). **Boundary:** proven on the
  contract + mock path; browser advisory; the PRODUCTION guarantee is the server performing the privileged
  op + the audit append in one transaction (row #2 C2). Mutations stay `applied:false` (no real write) +
  `auditId` set. Slice #1's `mockAdminCommandAdapter` + `TT-CMD-NOOP` are NOT mutated.

- **ADR-lite #3 (provider secret-handle read model — P2).** Row #4 is where "providers" stops being a
  passive `keyStatus` display and becomes a configurable surface (routing on handles), so the "browser
  receives handles/status ONLY, never key material" rule is made an explicit, typed, tested contract. The
  providers read model is EXTENDED with an additive `ProviderSecretHandle` status shape — an **opaque,
  non-secret reference id** (`handleId`), `configured` status, optional `lastRotated`, optional non-secret
  display token, and the vault/reference label — and **nothing decryptable**. Rationale (web-research-
  grounded, review §7): the canonical "secret reference" pattern (Portkey: "the actual key never touches
  storage"; the control plane sees only the reference config + auto-masked fields; LiteLLM virtual keys:
  real provider keys stay hidden in the gateway; the standard API-key UI model exposes
  `id`/`status`/`key_prefix`/`last_rotated`/`last_used` and stores only a one-way hash server-side). Real
  vault storage + runtime credential fetch is **server-side and out of row #4 scope** (handles only;
  deferred). The slice #1 fixtures already DROPPED the prototype `keyMask` strings — P2 preserves that and
  formalizes the status shape. **Caution (build-time, OQ-C):** any optional display token MUST be a short,
  non-secret, non-reversible last-4/prefix and MUST NOT use the bullet-mask shape `xxx••••` that slice #1's
  `TT-NO-SECRET-BUNDLE` already forbids — recommend OMITTING the masked tail and relying on
  `handleId`+`configured`+`lastRotated`.

- **ADR-lite #4 (provider-key no-leak guard — G2).** The slice #1 carried guards (`TT-NO-SECRET-SRC` +
  `TT-NO-SECRET-BUNDLE`, which already match `sk-`/`sk-ant-`/`AIza`/service-role/bullet-mask over all
  `src/`+`dist/`) are NECESSARY but not the row's *explicit* deliverable. Row #4 adds a dedicated,
  provider-specific `TT-PROVIDER-NO-KEY-MATERIAL` test that PROVES no provider key material can appear in
  the admin browser bundle: (a) a structural assertion that the providers read model / `ProviderCard` /
  `ProviderSecretHandle` carry NO field whose name (e.g. `key`/`secret`/`apiKey`/`token`/`credential`) or
  value implies key material — only status/handle/metadata; (b) a fixture scan that the providers fixtures
  contain no provider-key-shaped string; (c) a strengthened bundle scan over the providers modules in
  `dist/**`. ADDITIVE to the carried guards (which are also re-run). This is the manifest "Secret safety"
  gate, made specific to providers, as the operator requires.

## Frozen assumptions (lock at plan acceptance — change requires Revise or a follow-up row)

1. **Row #4 is CONTRACT/WIRING-ONLY and fully testable WITHOUT a live backend.** "Green" =
   Features/AI-usage/Providers reads bound to the `AdminApiClient` boundary + the three CONFIG guarded
   mutation flows routed through RBAC + audit (mock, `applied:false`+`auditId`) + the provider secret-
   handle read model + the provider-key no-leak guard + the pages wired through `../adapters`, all
   unit/component-tested with a **mockable** transport. It does **NOT** require deploying a real server,
   real provider calls, real secret storage, or any real write. Real service-role endpoints + real
   feature/quota/routing effects + real vault secret-handle storage = later/production rows.
2. **All new code is admin-local under `apps/admin/src/`** (composed read seams + guarded adapter
   extension in `adapters/`, the providers secret-handle type in `adapters/types.ts`, page wiring in
   `pages/`, the `AdminUiContext` injection flip). No shared `packages/*` change; no logic in
   `packages/core`/`apps/web`; no import of `@repo/audit-log-integrity`.
3. **Additive over slice #1 + row #2 + row #5 + row #3 — no fork, no break.** Slice #1's
   `featuresAdapter`/`aiUsageAdapter`/`providersAdapter`/`mockAdminCommandAdapter` + `adapters.test.ts`/
   `TT-CMD-NOOP`, row #2's `AdminApiClient`/`createMockAdminApiClient`/`adminApi.test.ts`, row #5's
   `createAuditedMockAdminApiClient`/`auditedMutation.test.ts`, and row #3's `GuardedCommandAdapter`
   (extended, not forked) / `usersReadSeam`-`orgsReadSeam`-`billingReadSeam` / Users-Orgs-Billing pages
   all keep working. Reuse via composition + extension; never re-declare.
4. **Mutations are server-authoritative; browser advisory** (row #2 C2 / row #5 B2). The three CONFIG
   flows are proven on the mock path (`applied:false` + `auditId`); the contract documents the server as
   the real enforcer. A browser bypass cannot cause a real privileged effect (mock holds no service-role
   OR provider credential; does no I/O).
5. **Every guarded mutation appends an audit event on the allow path and ZERO on the deny path** (row #5
   invariant, inherited by the wiring). A granted feature-rollout/quota/provider-routing produces exactly
   one audit event with the correct `mutationFamily`/`permissionKey`; a denied one produces none.
   `setProviderRouting` is **SUPER-ONLY** (`PROVIDER_ROUTING`) — its deny tests must assert non-`super`
   roles append ZERO. `setFeatureRollout`/`setQuota` are **super+ops** — their deny tests assert
   `support`/`finance`/`audit` append ZERO.
6. **Provider secret-handle invariant is a HARD, TESTED contract** (P2 + G2): the browser receives an
   opaque handle + status + non-secret metadata ONLY; NO key/secret/decryptable material in the providers
   read model, fixtures, or built bundle. `TT-PROVIDER-NO-KEY-MATERIAL` asserts it structurally; real
   secret storage is server-side and out of scope (handles only). Any optional display token is
   non-bullet, non-reversible (OQ-C; recommend OMIT).
7. **No service-role / provider / Stripe secret in the browser** (hard invariant, slice #1 / row #2 /
   row #5 / row #3), re-asserted by the carried `TT-NO-SECRET-SRC` + `TT-NO-SECRET-BUNDLE` over `src/` +
   `dist/` (they already match `sk-`/`sk-ant-`/`AIza`/service-role/bullet-mask) PLUS the new
   `TT-PROVIDER-NO-KEY-MATERIAL`.
8. **No `syncScope` entity / no cross-device persistence** of any admin provider/feature/quota read model
   (ADR-0013 §D4; sync line PAUSED). **No new typed events; no Tauri changes. D3 = W0.**
9. **Zero new runtime dependencies** expected (wiring + read-display + graduation row). The hand-built
   `DataTable` primitive already serves the Features/AI-usage/Providers tables; headless
   `@tanstack/react-table` v8 remains the pre-approved table upgrade path behind slice #1's `DataTable`
   seam if ever needed (not this row); record if added.
10. **Page set stays at 10** and every `src/pages/*.tsx` keeps importing `../adapters` (carried
    `TT-NO-INLINE-MOCK`); no page added/removed; mutations injected via `AdminUiContext`, reads via composed
    `../adapters` seams — pages never import the guarded/audited/mock client directly.
11. **Scope is the three CONFIG pages + their three CONFIG families ONLY.** Row #3's Users/Orgs/Billing
    pages + their guarded families (`banUser`/`bulkBan`/`transferOwnership`) stay UNCHANGED. No bleed into
    row #6 (deploy/observability/runbook). No new permission key, audit machinery, or transport method.

## Dependency overview

| Direction | Dependency | State | Mode this row |
|---|---|---|---|
| Upstream (consumes) | row #2 `apps/admin/src/contracts/adminApi.ts` (`AdminApiClient` reads `getFeatures`/`getFeature`/`getQuotaPolicies`/`getTopSpenders`/`getProviders`/`getModelPlanMatrix` + mutations `setFeatureRollout`/`setQuota`/`setProviderRouting`; `MutationAck`) | SHIPPED (this repo) | Features/AI-usage/Providers reads bound to this transport via composed `../adapters` seams; the 3 CONFIG mutations consumed (NO new method) |
| Upstream (consumes) | row #2 `apps/admin/src/authz/{permissionKeys,rbac}.ts` (`MUTATION_PERMISSION` — `FEATURE_ROLLOUT`/`QUOTA_SET`/`PROVIDER_ROUTING`; `canMutate`; `ROLE_GRANTS`) | SHIPPED (this repo) | RBAC allow/deny for the 3 CONFIG families; NO new key (provider-routing is super-only) |
| Upstream (consumes) | row #5 `apps/admin/src/audit/auditedMutation.ts` (`createAuditedMockAdminApiClient` → `{ client, chain }`, `appendThenAck`; `FAMILY_ACTION` already covers all six families) | SHIPPED (this repo) | The seam the guarded adapter delegates to (audit-on-mutation + `applied:false`) for the 3 CONFIG families |
| Upstream (consumes / extended) | row #3 `apps/admin/src/adapters/guardedCommands.ts` (`GuardedCommandAdapter`, `createGuardedCommandAdapter`) + `components/AdminUiContext.tsx` (`AdminCommands` combined surface) | SHIPPED (this repo) | `GuardedCommandAdapter` EXTENDED to all six families (additive); `AdminUiContext` injection FLIPPED for the 3 CONFIG families from no-op to guarded |
| Upstream (consumes) | slice #1 `apps/admin/src/adapters/{types,index}.ts` (`FeaturesReadModel`/`AiUsageReadModel`/`ProvidersReadModel`, mock adapters) + `pages/{FeaturesPage,AiUsagePage,ProvidersPage}.tsx` | SHIPPED (this repo) | Read-model types reused + EXTENDED (`ProviderSecretHandle`); pages wired (additive); slice #1 adapters UNCHANGED |
| Reused (NOT mutated) | slice #1 `apps/admin/src/adapters/commands.ts` (`mockAdminCommandAdapter`, `NoOpResult`, `TT-CMD-NOOP`) | SHIPPED (this repo) | Left intact; the guarded adapter is the injection target for the 3 CONFIG families (the row #2 OQ-F / row #5 OQ-G complement now actioned) |
| Reused (NOT mutated) | row #3 Users/Orgs/Billing pages + their guarded families (`banUser`/`bulkBan`/`transferOwnership`) | SHIPPED (this repo) | UNCHANGED — row #4 touches only the 3 CONFIG pages + families |
| Concept-only (mocked) | `@repo/plugin-web-ai-chat` (USER-level provider key store) | Stable | **Concept reference only**; NOT imported/wired. Admin provider secrets are a SEPARATE **server-side** secret-handle store (deferred); admin browser holds only handles/status |
| Reused (NOT modified) | `@repo/web-auth-device-session` (read-only session, slice #1 dep) | Stable | UNCHANGED (no admin-claim or any modification this row) |
| Concept-only (deferred) | real service-role feature/quota endpoints · real provider routing effect · real server-side encrypted secret-handle vault + runtime credential fetch | n/a | NOT wired; real transport behind these interfaces = later rows (no server line; D4 PAUSED) |
| Design authority | prototype `docs/prototypes/admin-dashboard/` + INTEGRATION_PLAN §2 (Feature flags / Entitlements-quotas / AI provider config / AI usage rows) + §4.4/§4.5 ("provider config to server-side encrypted secret handles") | n/a | IA + guarded-mutation posture + secret-handle directive |

## Directory shape (planned — additive to the SHIPPED slice-#1 + row-#2 + row-#5 + row-#3 tree)

```
apps/admin/
  src/
    adapters/
      types.ts                     # EDIT (additive) — add ProviderSecretHandle status type + extend the
                                   #   providers read path (handle/status/metadata ONLY; NO key field).
                                   #   slice #1 interfaces above UNCHANGED.
      index.ts                     # EDIT (additive) — add featuresReadSeam / aiUsageReadSeam /
                                   #   providersReadSeam delegating to the row #2 AdminApiClient; the
                                   #   row #3 + slice #1 + row #5 blocks above UNCHANGED
      guardedCommands.ts           # EDIT (additive) — EXTEND GuardedCommandAdapter to all six families:
                                   #   add setFeatureRollout / setQuota / setProviderRouting delegating to
                                   #   row #5 createAuditedMockAdminApiClient (RBAC + audit + applied:false)
      guardedCommands.test.ts      # EDIT (append-only) — ALLOW/DENY/AUDIT-ON-MUTATION/APPLIED-FALSE/NO-IO
                                   #   for the 3 CONFIG families (setProviderRouting SUPER-ONLY deny ×4)
      featuresReadSeam.test.ts     # NEW — TT-WIRE-FEATURES-READ + TT-READ-NO-IO
      aiUsageReadSeam.test.ts      # NEW — TT-WIRE-AIUSAGE-READ
      providersReadSeam.test.ts    # NEW — TT-WIRE-PROVIDERS-READ + TT-PROVIDER-HANDLE-SHAPE
    pages/
      FeaturesPage.tsx             # wired (P4) — reads via composed ../adapters seam; setFeatureRollout
                                   #   via guarded command (RBAC+audit); confirm flow unchanged
      AiUsagePage.tsx              # wired (P4) — reads via composed ../adapters seam; setQuota via guarded
                                   #   command (RBAC+audit)
      ProvidersPage.tsx            # wired (P4) — reads via composed ../adapters seam (secret-handle model);
                                   #   setProviderRouting via guarded command (SUPER-ONLY); NO key field
      wiring.feature-ai-provider.test.tsx  # NEW — TT-WIRE-FEATURES-PAGE / AIUSAGE-PAGE / PROVIDERS-PAGE
                                   #   (read through ../adapters; guarded mutation calls; no provider key)
    components/
      AdminUiContext.tsx           # EDIT — flip setFeatureRollout/setProviderRouting/setQuota in the
                                   #   AdminCommands surface from slice #1 no-op to the guarded adapter
                                   #   (all six families now guarded); row #3 families unchanged
    __tests__/
      no-provider-key.test.ts      # NEW — TT-PROVIDER-NO-KEY-MATERIAL (read model + fixtures + bundle)
  docs/
    feature-ai-provider-control/   # THIS doc set (design/api/test/dev_log) — distinct from #1/#2/#5/#3
```

> Note: the `apps/admin/src/__tests__/{no-secret,no-secret-bundle,no-inline-mock,csp}.test.ts` guards from
> slice #1 already scan all of `src/`/`dist/` and assert page→`../adapters` wiring + page count 10; re-run
> in P4 (the new `adapters/` modules + wired pages + the `ProviderSecretHandle` type are covered
> automatically). The new `no-provider-key.test.ts` is ADDITIVE (the explicit provider-key deliverable).
> Exact filenames/shapes are finalized in `feature-build`; design fixes the seams + boundaries.
