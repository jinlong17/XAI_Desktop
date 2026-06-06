# Discovery Review — xai-admin-feature-ai-provider-control (roadmap row #4)

> Feature-plan discovery snapshot. Surface: `apps/admin/` (the SHIPPED isolated Web-line app —
> slice #1 + row #2 + row #5 + row #3 all SHIPPED). Roadmap row **#4 of 6** of
> `xai-admin-dashboard-system-integration`. Hard dep row #2 = SHIPPED; rows #1, #5, #3 = SHIPPED.
> Mode: **Fresh** (no prior planning artifacts for slug `xai-admin-feature-ai-provider-control`).
> Author: claude-opus-4-8 (feature-plan) · 2026-06-06 · v1 (discovery).

## 1. Problem framing

Roadmap row #4 text: *"Connect feature flags, entitlements, AI quota, provider secret handles, and
model routing. Browser must receive secret handles/status only, never provider keys."*

The admin surface already has three pages — **Feature management** (`FeaturesPage`), **AI usage &
quota** (`AiUsagePage`), and **Provider configuration** (`ProvidersPage`) — that row #3 *deliberately
left byte-identical and unwired* (verified: the row #3 P4b corrective reverted any edit to them; row #3
ship integrity check confirms `git diff 268dd12 -- <pages>` empty). Those three pages, plus their three
guarded mutation families, are exactly THIS row's job:

| Page | Today (SHIPPED slice #1) | Row #4 target |
|---|---|---|
| `FeaturesPage` | reads `featuresAdapter` (sync); status toggle calls `commands.setFeatureRollout(...)` which is **slice #1 no-op** (`NoOpResult`) | reads via composed `../adapters` seam over `AdminApiClient`; `setFeatureRollout` graduated to RBAC+audit-gated mock (`applied:false`+`auditId`) |
| `AiUsagePage` | reads `aiUsageAdapter` (sync); "调整配额" calls `commands.setQuota(...)` which is **slice #1 no-op** | reads via composed seam; `setQuota` graduated to RBAC+audit-gated mock |
| `ProvidersPage` | reads `providersAdapter` (sync, **keyStatus-only**); "管理限速与默认模型" button is **inert** (no `commands.*`) | reads via composed seam (extended **secret-handle** read model); a routing mutation graduated to RBAC+audit-gated mock; **provider-key no-leak guard added** |

This is the **same contract/mock paradigm** as rows #1/#2/#3/#5 — no new technology, no real backend,
no real provider calls. The single NEW dimension that needed external research is the **provider
secret-handle invariant**: row #4 is the row where "providers" stops being a passive `keyStatus` display
and becomes a configurable surface (routing on handles), so the "browser receives handles/status ONLY,
never key material" rule must be made an explicit, tested contract — not just a fixture convention.

### What is already SHIPPED and reused (NOT rebuilt)

Row #4 is overwhelmingly a **wiring + graduation** row over four SHIPPED rows. The load-bearing seams
already exist and were verified against source:

- **row #2 `contracts/adminApi.ts`** — the `AdminApiClient` transport already exposes EVERY read the
  three pages need (`getFeatures`/`getFeature`/`getQuotaPolicies`/`getTopSpenders`/`getProviders`/
  `getModelPlanMatrix`) AND all three target mutations (`setFeatureRollout`/`setQuota`/
  `setProviderRouting`), each returning `AdminApiResult<MutationAck>`. **No new transport method is
  required** for the three families (verified lines 122-157).
- **row #2 `authz/{permissionKeys,rbac}.ts`** — `MUTATION_PERMISSION` already maps the three families:
  `setFeatureRollout → FEATURE_ROLLOUT` (super+ops), `setQuota → QUOTA_SET` (super+ops),
  `setProviderRouting → PROVIDER_ROUTING` (**super-only**). `canMutate` is the advisory predicate.
  **No new permission key is required** (verified lines 74-81; `ROLE_GRANTS` lines 65-83).
- **row #5 `audit/auditedMutation.ts`** — `createAuditedMockAdminApiClient` already audits ALL SIX
  families (incl. the three this row graduates): `appendThenAck` granted → exactly one `AdminAuditEvent`
  with the correct `mutationFamily`/`permissionKey`/`result:"ok"` + `{applied:false, auditId}`; denied
  → ZERO append. `FAMILY_ACTION` already has `setFeatureRollout: "features.rollout"`,
  `setProviderRouting: "providers.routing"`, `setQuota: "quota.set"` (verified lines 74-81, 191-210).
- **row #3 `adapters/guardedCommands.ts` + the composed `../adapters` read-seam pattern** — the proven
  template: a `GuardedCommandAdapter` factory delegating to the row #5 audited client + additive
  `*ReadSeam` exports in `adapters/index.ts` that delegate page reads to `adminApiClient`, with slice #1
  adapters UNCHANGED and `TT-NO-INLINE-MOCK` green. Row #3 surfaced 3 families (ban/bulk-ban/transfer);
  **row #4 follows the identical pattern for the OTHER 3 families** (feature-rollout/quota/provider-routing).
- **row #3 `components/AdminUiContext.tsx`** — the combined `AdminCommands` surface ALREADY has the exact
  seam: it currently injects the 3 row #3 families as guarded + the other 3 (`setFeatureRollout`/
  `setProviderRouting`/`setQuota`) STILL pointing at slice #1's no-op `mockAdminCommandAdapter`
  (verified lines 32-66). Row #4's mutation graduation is **literally flipping those three from the
  no-op adapter to the guarded adapter** in this one file — the type `AdminCommands` was pre-shaped for it.

> Net: row #4 adds **zero** new transport methods, **zero** new permission keys, **zero** new audit
> machinery. It (a) adds composed read seams for the 3 pages, (b) extends the providers read model with
> secret-handle status fields, (c) surfaces the 3 families on the guarded adapter + flips the
> `AdminUiContext` injection, (d) wires the 3 pages to the seams, and (e) adds a provider-key no-leak
> guard. The novelty is concentrated in (b) + (e) — the secret-handle dimension.

## 2. Constraints (carried from the SHIPPED admin line + operator instruction)

- **Contract-only + mockable transport.** "Green" = read-model contracts + adapter wiring + RBAC+audit-
  gated mock mutations (`applied:false`+`auditId`) + the secret-handle invariant + tests. NO real backend,
  NO real provider API calls, NO real secret material, NO real production writes. No scope bleed into #6
  (deploy/observability/runbook).
- **Every guarded mutation:** RBAC allow/deny (server-shaped `canMutate`) + audit-append on allow / ZERO
  append on deny; server-authoritative; browser advisory only (row #2 C2 / row #5 B2).
- **W0 (ADR-0013 §D3):** admin-side only; NO `@repo/web-auth-device-session` or shared `@repo/*` change;
  NO `@repo/audit-log-integrity` import (node:crypto-free bundle); NO `@repo/core/src/events`; NO Tauri.
- **Browser NEVER receives** service-role creds OR provider secret/key material — hard invariant; add an
  **explicit guard/test for provider keys specifically** (this row's distinctive deliverable).
- **No `syncScope` entity** (ADR-0013 §D4 / `sync` PAUSED). Reuse OKLCH tokens + `@repo/ui`; no
  Tailwind/Tremor dep (headless `@tanstack/react-table` v8 OK if needed, record — not expected).

## 3. Candidate options + tradeoffs (per axis)

### Axis R — Read wiring for the 3 pages
- **R1** — re-back slice #1's `featuresAdapter`/`aiUsageAdapter`/`providersAdapter` in place to call the
  async `AdminApiClient`. **Rejected:** their exact synchronous fixture behavior is pinned by slice #1's
  `adapters.test.ts`; converting to async would break that suite (the precise reason row #3 + row #5
  rejected the same approach).
- **R2 (SELECTED)** — additive composed read seams in `adapters/index.ts` (`featuresReadSeam`,
  `aiUsageReadSeam`, `providersReadSeam`) that delegate to the row #2 `AdminApiClient`; the three pages
  consume them through `../adapters`. Slice #1 adapters UNCHANGED; `TT-NO-INLINE-MOCK` stays green.
  **This is the row #3 / row #5 R-1 additive-seam precedent applied verbatim** (row #3 already added
  `usersReadSeam`/`orgsReadSeam`/`billingReadSeam` to this exact file, lines 307-364).

### Axis M — Mutation graduation for the 3 families
- **M1** — leave the families on slice #1's no-op adapter. **Rejected:** that is exactly the unmet state
  row #4 exists to fix (the manifest requires these mutations RBAC+audit-gated).
- **M2 (SELECTED)** — surface `setFeatureRollout`/`setQuota`/`setProviderRouting` on a guarded adapter
  delegating to row #5's `createAuditedMockAdminApiClient`, and flip the `AdminUiContext` injection for
  those three from `mockAdminCommandAdapter` (no-op) to the guarded adapter. Identical to the row #3 M2
  graduation, for the complementary 3 families. **No new RBAC key, no new audit code** — the row #5 client
  already audits all six families; this row only *exposes* three of them to the UI and *wires* them.
  - **Sub-decision M2a (guarded-adapter shape):** EXTEND row #3's `GuardedCommandAdapter` (add the 3
    methods) vs a SEPARATE `GuardedConfigCommandAdapter`. **Recommend:** extend the existing
    `GuardedCommandAdapter` to all six families (it already delegates to the same audited client) — keeps
    one guarded surface, mirrors `createMockAdminApiClient`'s six-method shape; the `AdminUiContext`
    combined `AdminCommands` type then becomes "all six guarded". Build-time confirm (OQ-A). Either way,
    slice #1 `mockAdminCommandAdapter` + `TT-CMD-NOOP` stay UNCHANGED (additive).

### Axis P — Provider secret-handle read model (the row's key NEW dimension)
- **P1** — keep the slice #1 `ProviderCard.keyStatus` (`configured`/`not-configured`) as the *only*
  handle field. **Acceptable but thin:** the manifest says "secret **handles** / status", and the
  research shows the canonical admin UI exposes more non-secret metadata (opaque handle id, last-rotated,
  masked suffix, vault reference). Minimal but under-delivers the "handles" word.
- **P2 (SELECTED)** — EXTEND the providers read model with an explicit, typed **secret-handle status**
  shape: an opaque `handleId` (NON-secret reference id, e.g. `pk_ref_gemini_01`), `configured` status,
  optional `lastRotated` (ISO date), optional non-secret `maskedTail` (e.g. last-4 / prefix —
  **derived/display only, never key material**), and the vault/reference label. Crucially: this is an
  ADDITIVE field set on the read model; **no key, no full secret, no decryptable material** ever appears
  — the fixtures carry only status metadata (slice #1 already dropped `keyMask` strings). The model
  documents that real secret storage is **server-side** and out of scope (handles only).
  - **Rationale (research-grounded, §7):** Portkey "secret references" — the control plane *never*
    receives the raw key; it sees only the reference configuration + auto-masked fields. LiteLLM virtual
    keys — real provider keys stay hidden in the gateway; the admin UI manages status/usage. Stripe /
    Microsoft / mParticle — client secrets are unrecoverable after creation; only masked views (last-4)
    are returned. The standard API-key data model exposes `id`/`status`/`key_prefix`/`last_used`/
    `rotated_from` to the UI and stores only a one-way hash server-side. P2 mirrors this exactly.
  - **Caution (build-time):** `maskedTail` MUST be a short, non-secret, NON-reversible display string and
    must NOT use the bullet-mask shape `xxx••••` that slice #1's `TT-NO-SECRET-BUNDLE` forbids
    (`/[A-Za-z-]{2,}•{3,}/`). Recommend a plain last-4 / prefix token (e.g. `…a82e` or `gem_…`) OR omit
    `maskedTail` entirely and rely on `handleId` + `configured` + `lastRotated`. Pin in build (OQ-C).

### Axis G — Provider-key no-leak guard (the row's distinctive security deliverable)
- **G1** — rely solely on the slice #1 carried `TT-NO-SECRET-SRC` + `TT-NO-SECRET-BUNDLE` (which already
  match `sk-`/`sk-ant-`/`AIza`/bullet-mask over all `src/`+`dist/`). **Necessary but not sufficient as
  the row's explicit deliverable** — the manifest + operator both call for an *explicit guard/test for
  provider keys specifically* that PROVES no provider key material can appear in the admin browser bundle.
- **G2 (SELECTED)** — add a dedicated, provider-specific no-leak guard test
  (`TT-PROVIDER-NO-KEY-MATERIAL`) that (a) asserts the providers read model / `ProviderCard` /
  secret-handle type carries NO field whose name or value implies key material (no `key`/`secret`/
  `apiKey`/`token` value field — only status/handle/metadata), (b) asserts the providers fixtures contain
  no provider-key-shaped string, and (c) extends/strengthens the bundle scan with the provider-key shapes
  over `dist/**` and explicitly over the providers modules. This is ADDITIVE to (not a replacement for)
  the carried guards. **This is the row's headline security artifact.**

### Axis D — Doc landing
- **D2 (SELECTED)** — discovery review under `docs/reviews/xai-admin-feature-ai-provider-control/`;
  four-piece set under `apps/admin/docs/feature-ai-provider-control/` (co-located with the surface; does
  NOT overwrite slice #1 `apps/admin/docs/*`, row #2 `data-contracts-rbac/*`, row #5 `audit-ops-queue/*`,
  or row #3 `users-orgs-billing/*`). Confirmed no collision (those four dirs all exist and are distinct).

## 4. Recommendation

Adopt **R2 + M2 (M2a: extend the existing guarded adapter to all six families) + P2 + G2 + D2.**

Concretely, row #4 delivers, all behind the SHIPPED seams with a mockable transport and NO backend:

1. **Composed read seams** `featuresReadSeam` / `aiUsageReadSeam` / `providersReadSeam` in
   `adapters/index.ts` (additive; slice #1 adapters UNCHANGED), delegating to the row #2 `AdminApiClient`
   reads. Pages consume via `../adapters` (`TT-NO-INLINE-MOCK` green).
2. **Provider secret-handle read model (P2):** an additive typed `ProviderSecretHandle` status shape
   (opaque `handleId` + `configured` + optional `lastRotated` + optional non-secret display token + vault
   ref label) surfaced on the providers read path. NO key/secret material. Real secret storage =
   server-side, out of scope (documented).
3. **Guarded mutation graduation (M2):** surface `setFeatureRollout` / `setQuota` / `setProviderRouting`
   on the guarded adapter (delegating to row #5's audited client → RBAC `canMutate` allow/deny + audit-
   append-on-allow / ZERO-append-on-deny + `applied:false`+`auditId`), and flip the `AdminUiContext`
   injection for those three from the slice #1 no-op to the guarded adapter. `setProviderRouting` is
   **super-only** (`PROVIDER_ROUTING`); `setFeatureRollout`/`setQuota` are **super+ops** (`FEATURE_ROLLOUT`
   / `QUOTA_SET`). NO new key, NO new audit code.
4. **Provider-key no-leak guard (G2):** an explicit `TT-PROVIDER-NO-KEY-MATERIAL` test proving the
   providers read model + fixtures + bundle carry no provider key material — the row's headline security
   contract. Plus the carried `TT-NO-SECRET-SRC`/`TT-NO-SECRET-BUNDLE` re-run over the larger src/dist.
5. **Wire the 3 pages** (`FeaturesPage`/`AiUsagePage`/`ProvidersPage`) to the composed `../adapters` read
   seams (async, `findBy*`/`waitFor`), with their existing `commands.*` calls now reaching the guarded
   adapter. `ProvidersPage` gains a routing mutation affordance (the previously-inert "管理限速与默认模型"
   path) wired to `commands.setProviderRouting`. NO provider key field rendered anywhere.

Phasing (one independently-verifiable phase per `feature-build` run):
- **P1** — Feature-flags read seam + `setFeatureRollout` graduated on the guarded adapter (RBAC+audit).
- **P2** — Entitlements / AI-quota read seam + `setQuota` graduated on the guarded adapter (RBAC+audit).
- **P3** — Provider config read seam (secret-handle model) + `setProviderRouting` graduated (super-only)
  + the provider-key no-leak guard (`TT-PROVIDER-NO-KEY-MATERIAL`).
- **P4** — Wire the 3 pages to the seams + flip the `AdminUiContext` injection for the 3 families +
  re-run carried no-secret/no-inline-mock guards + full build.

This satisfies the manifest Implementation-Order ("integrate read-heavy pages before write-heavy; add
mutation flows only when the audit append contract is covered by tests" — the audit contract is SHIPPED
in row #5), the manifest Verification Gates (Contract coverage / Secret safety / RBAC / Audit), and the
W0 boundary, with NO server deploy.

## 5. Risks + open questions (carried into design/test + review)

- **R-SECRET (HIGH)** — the secret-handle read model accidentally introducing a key-material field, or a
  `maskedTail` that trips (or evades) the bundle guard. Mitigated by P2 (status/handle/metadata only) +
  G2 (`TT-PROVIDER-NO-KEY-MATERIAL`) + the `maskedTail` caution (non-bullet, non-reversible, or omit).
- **R-SCOPE (HIGH)** — bleed into row #6 (deploy/observability) or re-touching the row #3 pages
  (Users/Orgs/Billing). Mitigated: row #4 surfaces only the 3 config families + wires only the 3 config
  pages; Users/Orgs/Billing pages + their guarded families stay UNCHANGED.
- **R-ADVISORY (HIGH)** — overclaiming a "real" provider/feature/quota write. Mitigated by reusing row #2
  C2 + row #5 B2: browser advisory, server-authoritative; mock `applied:false`; guarded adapter holds no
  service-role/provider credential + does no I/O (`TT-CMD-NO-IO` + advisory-note carried).
- **R-ADDITIVE (HIGH)** — breaking slice #1 / row #2 / row #5 / row #3 suites. Mitigated by additive
  composed seams (R2) + extending (not forking) the guarded adapter (M2a); all prior suites stay green;
  slice #1 `mockAdminCommandAdapter` + `TT-CMD-NOOP` UNCHANGED.
- **R-NOINLINE (MED)** — `TT-NO-INLINE-MOCK` regression (a page dropping `../adapters` or page count ≠ 10).
  Mitigated: route everything through `../adapters`; no page added/removed; guard in the P4 gate.
- **R-ASYNC (MED)** — RTL flake converting the 3 pages from sync `adapter.*()` to async seam reads.
  Mitigated: microtask-resolving mock + `findBy*`/`waitFor` (the row #3 P4 precedent).
- **R-ROUTE-AFFORDANCE (MED)** — `ProvidersPage` gaining a routing mutation control. Mitigated: wire it to
  `commands.setProviderRouting` (guarded, super-only); type-to-confirm via the existing `ConfirmModal`;
  NO provider key field; the control is the only new UI affordance and must render NO secret.
- **OQ-A (build-time):** extend row #3's `GuardedCommandAdapter` to all six families vs a separate config
  adapter. **Recommend:** extend the existing one (single guarded surface; mirrors the audited client).
- **OQ-B (build-time):** mock role for manual smoke — `setFeatureRollout`/`setQuota` need `ops`/`super`;
  `setProviderRouting` needs `super` (super-only). `VITE_ADMIN_MOCK_ROLE` fail-closed; tests use explicit
  roles. **Recommend:** default `super` for provider-routing smoke; note ops suffices for rollout/quota.
- **OQ-C (build-time):** the exact `ProviderSecretHandle` field set — include `maskedTail` (non-bullet
  last-4/prefix) or omit it and rely on `handleId`+`configured`+`lastRotated`. **Recommend:** OMIT the
  masked tail (safest; the manifest only requires handle/status), or if included make it a plain
  non-reversible last-4 token that passes `TT-NO-SECRET-BUNDLE`. Pin in P3.
- **OQ-D (defer to a later/production row, noted):** real server-side encrypted secret-handle storage +
  real provider routing effect (server fetches the vault credential at runtime + performs the routing
  change + audit append in one transaction) = the real transport behind these interfaces. Row #4 fixes
  the contract + mock + test surface only (no server line authorized; D4 PAUSED).
- **OQ-E (out of scope, noted):** cross-device persistence of any provider/feature/quota read model
  (ADR-0013 §D4 / PAUSED `sync`). No `syncScope` entity added.

## 6. Out of scope for row #4 (explicit, to prevent bleed)

- Real service-role API / real provider calls / real secret storage / real production writes (handles
  only; deferred).
- Any change to Users/Orgs/Billing pages or their guarded families (row #3, SHIPPED — UNCHANGED).
- Any new permission key, new audit machinery, or new transport method for the three families (all
  already SHIPPED in rows #2/#5).
- Billing mutations / Stripe (row #3 gate, deferred) and the dashboard/audit/settings pages (rows #5/#6).
- Deploy isolation / CSP / observability / runbook (row #6).
- `@repo/web-auth-device-session` or any shared `@repo/*` modification; `@repo/audit-log-integrity`
  import; `@repo/core/src/events`; Tauri; `syncScope` entity.

## 7. Web research evidence (provider secret-handle pattern — the NEW dimension)

> Rows #1/#2/#3/#5 needed no external research for their core decisions; row #4 does, because the
> provider secret-handle invariant is its central NEW contract. Queries run 2026-06; key findings below.

**Query 1 — "secret reference vs secret value API design / never return API key to client / opaque
handle / masked last-four":**
- Opaque/reference tokens are random identifiers that carry no secret payload; the secret stays server-
  side and is validated via a back channel.
- Client secrets are **unrecoverable after creation** — only displayed once, then masked (Microsoft
  Purview "client secret / API key"; mParticle credential management).
- Masking pattern: store the full value securely server-side; show only a masked view such as the last
  four characters (Spring Boot data-masking precedent).
- Server-side proxy is canonical: the front end calls a backend that holds the key and strips it before
  returning the response (Smashing Magazine "safest way to hide API keys in React").

**Query 2 — "LLM provider API key management admin dashboard / store server-side / never expose to
browser / rotate / status":**
- **Portkey "secret references"** — "the actual key never touches Portkey's storage"; the control plane
  "only ever sees the reference configuration: which vault, which secret path, how to authenticate";
  sensitive auth fields are auto-masked (`masked_*`); the data plane fetches the credential at request
  time (5-min TTL) then discards it; rotating in the vault propagates without redeploys.
- **LiteLLM virtual keys** — the proxy keeps real provider keys "completely hidden"; the admin UI manages
  the key lifecycle (create/info-view/usage) without exposing the secret; usage is tracked per key.
- **Datawiza / Bifrost** — "hide shared LLM provider keys, assign virtual API keys"; the upstream
  credential stays protected inside the gateway.

**Query 3 — "API key UI: show last-rotated date / masked suffix / configured status without revealing
secret value":**
- Recommended UI-facing API-key data model: `id`, `status` (active/revoked/rotating/expiring),
  `key_prefix`, `created_at`, `last_used_at`, `expires_at`, `rotated_from_key_id` — and store only a
  one-way **hash** of the key server-side (WorkOS, AppMaster, OneUptime, AWS KMS rotation status).
- Display "status chips" (Active / Revoked / Expiring soon) + "last used / never used" + a non-secret
  prefix to disambiguate keys — the raw value is shown exactly once at creation, then masked forever.

**Conclusion:** the canonical, current industry pattern is exactly the row #4 contract — the
browser/control-plane receives an **opaque handle + status + non-secret metadata (prefix/last-rotated/
last-used)**, NEVER the key material; the secret lives server-side (vault / one-way hash) and is fetched
at runtime by a gateway. The slice #1 `keyStatus`-only posture is the minimal form of this; P2 extends it
to the documented handle/status shape, and G2 makes "no key material in the browser" an explicit tested
invariant. Real vault/runtime fetch = server-side, out of row #4 scope (handles only).

### Sources

- [Manage LLM API keys with secret references | Portkey](https://portkey.ai/blog/secret-references-ai-api-key-management/)
- [LiteLLM Virtual Keys Best Practices (2026) | Success Knocks](https://successknocks.com/litellm-virtual-keys-best-practices-secure/)
- [API Key Management | BerriAI/litellm | DeepWiki](https://deepwiki.com/BerriAI/litellm/3.5.1-api-key-management)
- [LLM API Key Management and Identity-Aware Rate Limiting | Datawiza](https://www.datawiza.com/blog/industry/llm-api-key-management-and-identity-aware-rate-limiting/)
- [Client secret / API key entity definition | Microsoft Learn](https://learn.microsoft.com/en-us/purview/sit-defn-client-secret-api-key)
- [Developers | API Credential Management | mParticle](https://docs.mparticle.com/developers/credential-management/)
- [The Safest Way To Hide Your API Keys When Using React | Smashing Magazine](https://www.smashingmagazine.com/2023/05/safest-way-hide-api-keys-react/)
- [How to add API key support to your app | WorkOS](https://workos.com/blog/how-to-add-api-key-support-to-your-app)
- [API key rotation UX: scopes, self-serve keys, and logs | AppMaster](https://appmaster.io/blog/api-key-rotation-scoping-ux)
- [Data Masking in Spring Boot APIs | Medium](https://medium.com/@sachin2713/data-masking-in-spring-boot-apis-785561e1d51d)
- [GetKeyRotationStatus | AWS KMS API Reference](https://docs.aws.amazon.com/kms/latest/APIReference/API_GetKeyRotationStatus.html)
