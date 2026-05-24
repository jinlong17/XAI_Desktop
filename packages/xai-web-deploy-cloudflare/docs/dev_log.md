# Dev Log — xai-web-deploy-cloudflare

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-deploy-cloudflare |
| Title | Cloudflare Pages deploy — first public URL for the SHIPPED XAI Web Console |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-auto-build |
| Automation Mode | A-Claude |
| Verify Cross-vendor | yes (Codex gpt-5.5-thinking medium primary, Cursor fallback) |
| Stop Before Ship | yes |
| Executor | claude-opus-4-7 (feature-review) |
| Updated | 2026-05-24 |
| Roadmap Row | Post-roadmap operational row (24/24 SHIPPED on `docs/workflow/roadmap/xai-web-console.md`; not yet listed as a manifest row — operational anchor) |
| ADR Anchor | docs/adr/0008-cloudflare-deploy-target-and-csp.md (to be authored in feature-build P1) |
| Pre-deploy Gate (P5) | secrets-configured = unknown (CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID; operator action required per docs/runbooks/cloudflare.md §1) |
| Blockers | none |

## Artifacts Index

- Feature brief: `docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md`
- Discovery review: `docs/reviews/xai-web-deploy-cloudflare/20260524-discovery-review.md`
- Design snapshot: `packages/xai-web-deploy-cloudflare/docs/design.md`
- API / contract shapes: `packages/xai-web-deploy-cloudflare/docs/api.md`
- Test / verify strategy: `packages/xai-web-deploy-cloudflare/docs/test.md`
- Target ADR (Phase 1 deliverable): `docs/adr/0008-cloudflare-deploy-target-and-csp.md`
- Target runbook (Phase 4 deliverable): `docs/runbooks/cloudflare.md`
- Target wrangler config (Phase 2): `apps/web/wrangler.toml`
- Target `_headers` (Phase 2): `apps/web/public/_headers`
- Target CI workflow (Phase 3): `.github/workflows/deploy-web.yml`
- Verify evidence (Phase 5, by feature-verify): `docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md`

## Decision Headline

Cloudflare **Pages** (not Workers Static Assets) + **mock-authenticated**
build-time auth + **strip-the-nonce** CSP via `_headers` (Decision 3
Candidate A.1; strictness delta vs SHIPPED `web-security-csp-sentry` recorded
in ADR-0008 §3) + **vanilla `pnpm --filter @repo/web build`** (no Sentry
sourcemap chain). GitHub Action via `cloudflare/wrangler-action@v3` on push
to `main` (production) and on `pull_request` (preview).

## Phase Progress

| Phase | Status | Commit |
|-------|--------|--------|
| P1 — ADR-0008 + 四件套 docs anchor | DONE | 0e7aca7 |
| P2 — wrangler.toml + `_headers` + `.gitignore` + `.nvmrc` + nonce strip | DONE | 7e11f50 |
| P3 — `.github/workflows/deploy-web.yml` | DONE | (pending commit) |
| P4 — `docs/runbooks/cloudflare.md` | PENDING | — |
| P5 — Live deploy + smoke + evidence (verify-only) | PENDING | — |

## Phase Plan (5 phases)

Each phase = one `feature-build` (or `feature-auto-build`) run, one commit,
then stops for human confirmation per CLAUDE.md "feature-build does ONE phase
per run". Cross-vendor verify gate runs at Phase 5 (feature-verify).

### Phase P1 — ADR-0008 + 四件套 docs anchor

**Scope**

- Author `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (Status=Accepted
  on first write, matching ADR-0007 first-write-Accepted precedent).
- Required sections per `api.md` §C5: S1 (header) / S2 (背景) / S3 (方案 — 4
  sub-decisions) / S4 (决策 + 15 frozen assumptions) / S5 (后果) / S6 (实施规则)
  / S7 (相关).
- Confirm the four-doc set authored by this Plan turn is in sync with the
  ADR (no later drift between design.md frozen assumptions and ADR §S4).

**Smoke**

- ADR resolves all 4 decisions explicitly.
- Cross-doc links intact (manual reviewer check).
- ADR matches the section outline in discovery-review §11.

**Files touched (estimated)**

- New: `docs/adr/0008-cloudflare-deploy-target-and-csp.md`
- Modified: `packages/xai-web-deploy-cloudflare/docs/dev_log.md` (this file —
  Phase Progress + Work Log).

**Commit**

- `docs(xai-web-deploy-cloudflare): P1 — author ADR-0008 (Status=Accepted)`
- Body: Why / What / Scope / Risk / Docs / Tests per CLAUDE.md commit
  convention.

### Phase P2 — wrangler.toml + `_headers` + `.gitignore` + `.nvmrc` + nonce strip

**Scope**

1. Create `apps/web/wrangler.toml` per `api.md` §C1.
2. Create `apps/web/public/_headers` per `api.md` §C2 (CSP body frozen).
3. Augment root `.gitignore` per `api.md` §C7 (append `.dev.vars` + `.wrangler/`).
4. Create root `.nvmrc` per `api.md` §C8 (contains `22\n`).
5. Implement the nonce-placeholder strip mechanism per `api.md` §C3.
   Decide between Vite `transformIndexHtml` plugin / Rollup
   `generateBundle` hook / post-build Node script — pick the least-invasive
   option. Record the choice in this dev_log under the P2 Work Log entry.
6. **Runtime nonce caller audit** per `api.md` §C3 AC-C3-3: grep
   `packages/plugin-web-*/src/` + `apps/web/src/` for `requireRuntimeNonce` /
   `createNonceStyleElement` callers. For each caller, confirm it does NOT
   fire in the production code path. If any caller fires under static
   deploy, BLOCK back to plan with the caller listed.

**Smoke**

- `pnpm install --frozen-lockfile && pnpm --filter @repo/web build` → green.
- `dist/index.html` no longer contains the literal `__XAI_CSP_NONCE__`
  string (record `grep -c` evidence in dev_log).
- `dist/` greps clean for `SUPABASE_` / Sentry DSN / `CLOUDFLARE_` literals.
- `dist/` bundle size + largest chunk recorded in dev_log Verify section.
- `wrangler --version` reports a v3.x (install via `npm install -g wrangler@3.114.0`
  if missing; record installed version in dev_log).
- `wrangler deploy --dry-run` (or `wrangler pages deploy --dry-run` if
  supported) validates `apps/web/wrangler.toml` syntax with 0 errors.

**Files touched (estimated)**

- New: `apps/web/wrangler.toml`, `apps/web/public/_headers`, `.nvmrc` (root).
- Modified: `.gitignore` (root), possibly `apps/web/vite.config.ts` (if the
  chosen nonce-strip mechanism is a Vite plugin), possibly
  `apps/web/index.html` (if the chosen mechanism is a direct edit to leave
  the placeholder absent at HTML-template time — discouraged but
  acceptable if the SHIPPED `web-security-csp-sentry` runtime is verified
  unaffected).

**Commit**

- `feat(xai-web-deploy-cloudflare): P2 — wrangler.toml + _headers + .nvmrc + nonce strip`
- Body: Why / What / Scope / Risk / Docs / Tests.

### Phase P3 — `.github/workflows/deploy-web.yml`

**Scope**

- Create `.github/workflows/deploy-web.yml` per `api.md` §C4.
- Triggers: `push` on `main`; `pull_request`.
- Steps: checkout → setup-node from `.nvmrc` → pnpm install --frozen-lockfile
  → pnpm build with `VITE_WEB_AUTH_MODE: mock-authenticated` → wrangler-action@v3
  with `pages deploy ./dist`.
- Outputs `pages-deployment-id` / `pages-deployment-alias-url` /
  `deployment-url` echoed into `$GITHUB_STEP_SUMMARY`.

**Smoke**

- `actionlint .github/workflows/deploy-web.yml` → 0 errors (install
  `actionlint` via `brew install actionlint` if missing; record outcome).
- If actionlint unavailable: manual YAML schema validation against
  the GitHub Actions workflow schema.
- No real CI run yet (secrets not yet known to be configured); P3 is
  static-lint-only.

**Files touched (estimated)**

- New: `.github/workflows/deploy-web.yml`

**Commit**

- `feat(xai-web-deploy-cloudflare): P3 — GitHub Actions workflow (wrangler-action@v3)`
- Body: Why / What / Scope / Risk / Docs / Tests.

### Phase P4 — `docs/runbooks/cloudflare.md`

**Scope**

- Create `docs/runbooks/cloudflare.md` per `api.md` §C6.
- 6 sections in order: First-time Setup / Rotate Secrets / Rollback / Manual
  Deploy / Quota Monitoring / Disaster Recovery.

**Smoke**

- All 6 sections present.
- Every command is copy-pasteable.
- Required GitHub Secrets named exactly: CLOUDFLARE_API_TOKEN +
  CLOUDFLARE_ACCOUNT_ID.

**Files touched (estimated)**

- New: `docs/runbooks/cloudflare.md`

**Commit**

- `docs(xai-web-deploy-cloudflare): P4 — Cloudflare runbook (setup/rotate/rollback/manual/quota/disaster)`
- Body: Why / What / Scope / Risk / Docs / Tests.

### Phase P5 — Live deploy + smoke + evidence (feature-verify owns this)

**Scope**

- Run all verify-gate test cases per `test.md` TC-T1..T16.
- If secrets are configured: trigger CI deploy from `main`; capture URL +
  curl outputs + bundle stats; write `docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md`.
- If secrets NOT configured (Pre-deploy Gate = no): apply Phase-5 fallback
  Option (a) — manual `wrangler deploy` from operator machine; OR Option
  (b) — BLOCKED handoff. Operator chooses; recommendation = (a).
- Cross-vendor cold-read by Codex (gpt-5.5-thinking, effort=medium); Cursor
  fallback if Codex quota exhausted.

**Smoke**

- All TC-T1..T16 GREEN.
- Cross-vendor verdict = CONFIRMED_READY_TO_SHIP.

**Files touched (estimated)**

- New: `docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md` (by
  feature-verify).
- Modified: this dev_log (Status Panel + Work Log + Ship Report).

**Commit** (single, by feature-verify if green; ship gate is parent-session)

- `docs(xai-web-deploy-cloudflare): P5 — verify gate GREEN; evidence file + dev_log Ship Report`

## Risks

| ID | Risk | Severity | Mitigation |
|----|------|----------|-----------|
| R1 | CSP regression vs SHIPPED `web-security-csp-sentry` row | High | Decision 3 + ADR-0008 §3; verify-gate `curl -I` check; P2 runtime audit of `createNonceStyleElement` callers. |
| R2 | Secret leak in `dist/` (sourcemaps, env injection) | High | `vite.config.ts` `sourcemap: "hidden"`; verify-gate `dist/` greps for `SUPABASE_` / Sentry DSN / `CLOUDFLARE_`. |
| R3 | Pages free-tier 500 builds/mo exhausted | Medium | Runbook documents `paths-ignore` lever. |
| R4 | Wrangler-action drift / breaking change | Medium | Pin `@v3` + `wranglerVersion: 3.114.0` explicitly. |
| R5 | Build deterministic CI vs local | Medium | `pnpm install --frozen-lockfile` + `.nvmrc` + `packageManager` pinned. |
| R6 | First-deploy `_headers` syntax error | Medium | P2 includes `wrangler --dry-run` smoke; runbook §Manual Deploy is the rollback path. |
| R7 | Runtime nonce callers break under static deploy | High | P2 runtime audit gate; if any caller fires under static, BLOCK back to plan. |
| R8 | GitHub Secrets not configured at P5 deploy time | Medium | Phase-5 fallback documented (manual deploy or BLOCKED handoff). |
| R9 | Codex cross-vendor verifier quota exhausted | Low | Cursor is the documented fallback per roadmap manifest line 10. |
| R10 | Future contributor confuses `apps/web/deploy/security/` (SHIPPED library namespace) with deploy config home | Low | ADR-0008 §6 records the namespace-coexistence one-paragraph note. |

## Open Questions

- **OQ1**: Cloudflare account ownership / OAuth path — resolved by the human
  operator at first `wrangler pages project create` time per runbook §1.
- **OQ2**: Final wrangler version pin (`3.114.0` is the plan-time current;
  feature-build P2 confirms / bumps within v3.x).
- **OQ3**: Final nonce-placeholder strip mechanism (Vite plugin vs Rollup
  hook vs post-build script) — chosen in P2.
- **OQ4**: Whether to add an informational row to `docs/PLUGIN_MAP.md` for
  this anchor (precedent rows like `xai-web-event-bus` ARE listed; the
  `xai-web-build-form-adr` anchor is NOT). Decision: leave to feature-verify
  or ship.
- **OQ5**: Whether to add a tail informational row to
  `docs/workflow/roadmap/xai-web-console.md` (post-roadmap operational row).
  Recommendation: leave manifest unedited (roadmap-loop territory; this row
  is operational, not roadmap-driving).

## Review Notes

### 2026-05-24 — feature-review (claude-opus-4-7) — APPROVED

**Verdict**: APPROVED. The plan is executable end-to-end with no blocking ambiguity.

**Checklist results**:

1. **Discovery quality**: ✅ All 4 decisions (D1–D4) have 2+ candidate options analyzed with pros/cons; recommendations grounded in plan-time codebase audit (Q15.1–Q15.5 resolved verbatim in discovery §2).
2. **Decision conformance vs brief §6**: ✅ Plan resolves D1=Pages, D2=mock-authenticated, D3=Candidate A.1 (strip nonce + `_headers` CSP), D4=vanilla `pnpm --filter @repo/web build` — matching the brief's recommendations. All 4 are recorded in design.md table §"Selected Option Set" + 15 frozen assumptions + the proposed ADR-0008 §S4 (per api.md §C5).
3. **Design alignment**: ✅ design.md table §"Selected Option Set" + 15 Frozen Assumptions match discovery §3–§6 1-to-1. No drift.
4. **Contract completeness**: ✅ api.md §C1–C9 enumerates binary AC for every artifact (wrangler.toml C1-1..C1-7; `_headers` C2-1..C2-7; nonce strip C3-1..C3-4; workflow C4-1..C4-13; ADR C5-1..C5-9; runbook C6-1..C6-5; `.gitignore` C7-1..C7-4; `.nvmrc` C8-1..C8-3; evidence C9-1..C9-5). Error semantics in §C0.
5. **Phase decomposition**: ✅ 5 phases, each = one reviewable commit:
   - P1: ADR + 4-doc sync (no executable changes — docs-only). ✅
   - P2: `wrangler.toml` + `_headers` + `.gitignore` + `.nvmrc` + nonce-strip + runtime caller audit. Single coherent commit. ✅
   - P3: workflow YAML with `cloudflare/wrangler-action@v3` (NOT `pages-action`). ✅
   - P4: runbook with all 6 required sections (Setup / Rotate / Rollback / Manual / Quota / Disaster). ✅
   - P5: verify-only (feature-verify owns), with explicit fallback for secrets-not-configured (Option a = manual deploy; Option b = BLOCKED handoff). ✅
6. **CSP strictness delta**: ✅ Explicitly recorded in design.md Frozen Assumptions §5–§6, api.md §C2 "Strictness delta (acknowledged)" section, AC-C5-5 (delta MUST be named in ADR-0008 §3), TC-T11 (cross-vendor + reviewer cold-reads ADR-0008 §3 for non-silent delta acknowledgement). Two specific drops documented: (a) `'nonce-<value>'` from `script-src` / `style-src`; (b) `report-uri` / `report-to`. Follow-up trigger named (Worker layer when AI Chat backend lands).
7. **Three-faces boundary**: ✅ Zero touches to `apps/desktop/`, `packages/core/src/events/`, `packages/plugin-*`. All file deliverables (design.md §"File-level Deliverables") confined to allowed paths: `apps/web/wrangler.toml`, `apps/web/public/_headers`, root `.gitignore`, root `.nvmrc`, `.github/workflows/`, `docs/`, and possibly an `apps/web/index.html` placeholder-strip edit (acceptable per the §"File-level Deliverables" "TBD" row).
8. **Plugin dependency state**: ✅ All 24 `xai-web-*` rows are SHIPPED / READY_TO_SHIP per roadmap manifest (confirmed in discovery §9 + design.md Dependency Overview). No mocks required. The "mock-authenticated" build flag is a SHIPPED product feature of row #5 `xai-web-shell`, not a test mock.
9. **Verify gate completeness**: ✅ test.md TC-T1..T16 covers all brief §12 acceptance criteria — build (T8/T14), tests (T14), actionlint (T7), wrangler validate (T2), bundle sanity (T12), live URL + SPA fallback (T9/T10), CSP audit (T11), secret grep in `dist/` (T6), evidence file (T16).
10. **Open questions**: ✅ All 5 brief §15 questions closed or explicitly deferred — Q15.1 (`.nvmrc` absent, P2 adds with `22`), Q15.2 (account ownership deferred to runbook §1 operator step), Q15.3 (Sentry token out of scope this row), Q15.4 (`apps/web/deploy/security/` audited and confirmed as SHIPPED library namespace, not deploy-config), Q15.5 (cross-vendor verifier order confirmed at verify-gate time).
11. **Commit conventions**: ✅ Every phase commit message recorded with `type(scope): summary` format + Why / What / Scope / Risk / Docs / Tests body convention (dev_log lines 88-89, 133-135, 164-165, 188-189).
12. **Architecture risk**: ✅ No `packages/core/` changes; no `manifest.json` routing changes; no cross-feature contract drift. Decision Risk Register R-D1..R-D10 covers CSP, secret leak, quota, action drift, determinism, nonce callers, secrets-not-configured, cross-vendor quota, and namespace coexistence.

**Minor recommendations (non-blocking — for feature-build awareness, no revise needed)**:

- **R1 (info)**: Brief §16 line 394 mandates "feature-build MUST rebase on latest origin/main before commit; on conflict surface to user, no force-push." This clause is NOT explicitly carried into the plan's four-doc set. The feature-build / feature-auto-build agent prompts already enforce conventional-commit + rebase posture, but P1 dev_log Work Log SHOULD echo this constraint when feature-build starts, to make it auditable. Non-blocking — APPROVED stands.
- **R2 (info)**: Discovery §5 Candidate A.1 mentions replacing the nonce placeholder with `<meta name="xai-csp-mode" content="static">` for runtime detection; the four-doc set (api.md AC-C3-1..C3-4) only requires *removal* without specifying a replacement marker. Mechanism choice is correctly deferred to feature-build P2 per api.md §C3 "Open Mechanism Choice". P2 should record the chosen mechanism + whether a static-mode marker is added; if added, also re-confirm `apps/web/src/security/nonce.ts` `readRuntimeNonce` returns null cleanly. Non-blocking.

**Note for feature-build / feature-auto-build**:

- Verify Cross-vendor: yes → recommend `feature-auto-build` over `feature-build` (parallel-friendly multi-phase build, then human-confirm before feature-verify, then cross-vendor cold-read at P5 by Codex / Cursor).
- Stop Before Ship: yes is honored — `feature-verify` GREEN → `READY_TO_SHIP` → parent-session ship dispatch only.
- Pre-deploy Gate (P5) `secrets-configured = unknown` is the ONLY operational gate that can flip the row to BLOCKED at P5. Operator chooses between manual deploy (recommended) and BLOCKED handoff at P5 dispatch time per test.md §Phase-5-fallback.

## Cross-vendor Verify Report

_(populated by feature-verify in Phase 5)_

## Ship Report

_(populated at ship time; MUST include first production URL and the commit
hash of the workflow-driven first deploy or the manual fallback deploy)_

## Work Log

### 2026-05-24 — feature-review (claude-opus-4-7) — APPROVED

- **Action**: Reviewed the four-doc plan set + discovery report against
  feature brief §1–§17. Verified all 12 checklist items pass (see Review
  Notes §1–§12 above). Cross-checked:
  - `apps/web/index.html` lines 2 + 6 still carry `__XAI_CSP_NONCE__`
    placeholders → Decision 3 mandate confirmed.
  - `.nvmrc` absent at repo root (only stray copy under
    `node_modules/.pnpm/is-generator-function@1.1.0/.../`) → P2 add
    confirmed.
  - ADR-0007 exists → ADR-0008 numbering is the correct next slot.
  - Brief §15 OQs all closed or explicitly deferred in plan.
  - All 24 `xai-web-*` rows SHIPPED / READY_TO_SHIP per
    `docs/PLUGIN_MAP.md` → No-Mock posture confirmed sound.
  - Three-faces boundary nondum laesa: zero touches to `apps/desktop/`,
    `packages/core/src/events/`, `packages/plugin-*`.
- **Findings**: 0 blockers; 2 minor recommendations (non-blocking) recorded
  in Review Notes — R1 (rebase clause echo at feature-build dispatch) and
  R2 (nonce-strip mechanism marker choice in P2).
- **Verdict**: APPROVED.
- **State changes**:
  - Status Panel: `Current Phase = FEATURE_PLAN → FEATURE_REVIEW`,
    `Status = NEEDS_REVIEW → APPROVED`,
    `Suggested Next = feature-review → feature-auto-build`,
    `Executor = claude-opus-4-7 (feature-review)`,
    `Updated = 2026-05-24`.
- **Commits**: —
- **Next step**: `feature-auto-build` (recommended given Verify Cross-vendor:
  yes + A-Claude automation mode + Stop Before Ship: yes), OR `feature-build`
  for manual one-phase-at-a-time control. Either path begins at Phase P1 (ADR-0008
  + 4-doc anchor — no executable file changes).

### 2026-05-24 — feature-plan (claude-opus-4-7) — Fresh

- **Action**: Fresh-mode plan for `xai-web-deploy-cloudflare`. Read brief at
  `docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md`, all
  required-reads (ADR-0003 / ADR-0006 / ADR-0007, roadmap manifest, SOPs,
  CLAUDE.md, usage-guide §5), audited
  `apps/web/{package.json,vite.config.ts,index.html,deploy/security/*}`,
  root `package.json`, root `.gitignore`, `apps/web/src/security/*.ts`.
  Confirmed:
  - `.nvmrc` absent at repo root (Q15.1 → P2 adds one pinned to 22).
  - `apps/web/deploy/security/` is a SHIPPED library namespace (Q15.4 →
    not a deploy-config home; new `wrangler.toml` goes at
    `apps/web/wrangler.toml` per ADR-0008 §6 namespace note).
  - `apps/web/index.html` lines 2 + 6 carry `__XAI_CSP_NONCE__`
    placeholders → Decision 3 mandatory.
  - All 24 `xai-web-*` rows SHIPPED / READY_TO_SHIP per
    `docs/PLUGIN_MAP.md` Web Modules table → no mocks needed.
  Web-research consulted:
  - Cloudflare Pages `wrangler.toml` config docs (pages_build_output_dir).
  - Cloudflare Pages `_headers` docs (CSP / security headers delivery).
  - `cloudflare/wrangler-action@v3` README (`pages deploy` invocation +
    output variables in 3.81.0+).
  - `cloudflare/pages-action` deprecation notice (confirms wrangler-action
    is the canonical path).
- **Decisions frozen (4)**:
  - D1 = Cloudflare Pages (not Workers Static Assets).
  - D2 = `VITE_WEB_AUTH_MODE=mock-authenticated`.
  - D3 = Strip nonce + `_headers`-delivered CSP (Candidate A.1); strictness
    delta vs SHIPPED CSP+Sentry row recorded in ADR-0008 §3.
  - D4 = Vanilla `pnpm --filter @repo/web build` (no `build:secure` CI yet).
- **Files written**:
  - `docs/reviews/xai-web-deploy-cloudflare/20260524-discovery-review.md`
  - `packages/xai-web-deploy-cloudflare/docs/design.md`
  - `packages/xai-web-deploy-cloudflare/docs/api.md`
  - `packages/xai-web-deploy-cloudflare/docs/test.md`
  - `packages/xai-web-deploy-cloudflare/docs/dev_log.md` (this file)
- **Phase plan**: P1 ADR-0008 + 四件套 sync → P2 wrangler.toml + `_headers` +
  `.gitignore` + `.nvmrc` + nonce-strip + runtime audit → P3 GitHub Actions
  workflow → P4 Cloudflare runbook → P5 live deploy + smoke + evidence
  (feature-verify; cross-vendor cold-read by Codex / Cursor).
- **Commits**: — (Plan turn produces docs/state only; no commits yet).
- **Next step**: `feature-review` to validate the four-doc set + the
  discovery review against the brief, then APPROVE / REVISE. Status flipped
  to `NEEDS_REVIEW` with `Suggested Next: feature-review`.
- **Notes for feature-review**:
  - The brief introduced Decision 3 as a NEW finding (not in user's original
    goal text). Confirm the recommendation (Candidate A.1: strip + `_headers`)
    is acceptable as a one-row CSP-strictness debt with a documented
    follow-up trigger (revisit when AI Chat backend Worker layer lands).
  - The brief's Phase 5 escalation gate (secrets-not-configured) is
    surfaced explicitly in dev_log Status Panel as `Pre-deploy Gate:
    secrets-configured = unknown`. Confirm both fallback options
    (manual deploy or BLOCKED handoff) are acceptable to the user.
  - All 4 decisions plus the Phase 5 fallback are recorded in
    ADR-0008 §S4 + §S5; revising any decision after Plan acceptance
    requires Revise mode.

### 2026-05-24 — feature-auto-build (claude-sonnet-4-6) — P1 ADR-0008 + 四件套 docs anchor

- **Action**: Phase P1 implementation for `xai-web-deploy-cloudflare`.
  - Rebased on `origin/main` — branch already up to date.
  - Authored `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (Status=Accepted)
    with all 7 required sections (S1–S7) per api.md §C5.
  - **Runtime nonce caller audit (AC-C3-3)**: Grepped `packages/plugin-web-*/src/`
    and `apps/web/src/` for `requireRuntimeNonce` / `createNonceStyleElement`.
    Result: definitions only in `apps/web/src/security/nonce.ts`; callers only in
    test files (`nonce.test.ts`). **No production caller fires under static deploy
    path.** AC-C3-3 PASSED. Row is NOT blocked.
  - ADR sections confirmed:
    - S1: header table with Status=Accepted, all 4 sub-decisions summarized
    - S2: background — problem, user requirement, codebase context, related ADRs
    - S3: 4 sub-decisions with options + pros/cons + rationale
    - S4: selected options + 15 Frozen Assumptions (verbatim from design.md)
    - S5: consequences (positive / negative security debt / deferred)
    - S6: implementation rules (wrangler.toml shape, _headers, nonce strip, CI,
          secrets, namespace coexistence note, runbook anchors)
    - S7: related links (ADR-0003 / ADR-0006 / ADR-0007 / brief / discovery /
          runbook / wrangler-action docs)
  - CSP strictness delta explicitly named in S3 D3 and S5 (non-silent acknowledgement).
  - 15 Frozen Assumptions from design.md restated verbatim in S4.
  - Namespace coexistence note present in S6 (`apps/web/deploy/security/` vs
    `apps/web/wrangler.toml` distinction recorded).
  - ADR-0008 does NOT edit `docs/workflow/roadmap/xai-web-console.md` (AC-C5-9).
  - Updated Phase Progress: P1 DONE.
  - **Rebase note (per feature-review R1 recommendation)**: `git fetch origin &&
    git rebase origin/main` was run before commit. Branch was already current.
    No conflicts.
- **Smoke**: All AC-C5-1..C5-9 verified:
  - AC-C5-1: File exists at `docs/adr/0008-cloudflare-deploy-target-and-csp.md` ✅
  - AC-C5-2: `状态 = Accepted` in S1 header ✅
  - AC-C5-3: All 7 sections S1–S7 present in order ✅
  - AC-C5-4: D1+D2+D3+D4 each have selected option + rejected + one-line rationale ✅
  - AC-C5-5: CSP strictness delta explicitly named (not implied) in S3 D3 + S5 ✅
  - AC-C5-6: 15 frozen assumptions from design.md restated inline 1:1 ✅
  - AC-C5-7: `Supersedes: none` ✅
  - AC-C5-8: Cross-doc links to ADR-0003/0006/0007/brief/discovery/runbook present ✅
  - AC-C5-9: Refrains from editing `docs/workflow/roadmap/xai-web-console.md` ✅
- **Tests run**: No executable tests (docs-only phase). Nonce caller audit: CLEAN.
- **Commits**: 0e7aca7 `chore(xai-web-deploy-cloudflare): P1 — ADR-0008 + docs anchor (no exec change)`
- **Next step**: Proceed to P2.

### 2026-05-24 — feature-auto-build (claude-sonnet-4-6) — P2 wrangler.toml + _headers + .gitignore + .nvmrc + nonce strip

- **Action**: Phase P2 implementation for `xai-web-deploy-cloudflare`.
  - Rebased on `origin/main` — branch already current (P1 commit is the tip).
  - Created `.nvmrc` at repo root containing `22` (Node 22 LTS — resolves OQ Q15.1).
  - Created `apps/web/wrangler.toml` with 3 required keys:
    `name = "xai-web-console"`, `compatibility_date = "2026-05-24"`,
    `pages_build_output_dir = "./dist"`. No `[assets]`, no `[vars]`, no secrets.
  - Created `apps/web/public/_headers` with CSP frozen per api.md §C2 +
    HSTS + nosniff + X-Frame-Options DENY + Referrer-Policy + Permissions-Policy.
    No `'unsafe-inline'`, no `'unsafe-eval'`, no `*` wildcard.
  - Augmented root `.gitignore`: added `.dev.vars` and `.wrangler/` (AC-C7-1/C7-2).
  - **Nonce strip mechanism**: Vite `transformIndexHtml` plugin in `apps/web/vite.config.ts`.
    Chosen as the least-invasive option: runs at build time, requires no external
    script, is deterministic (same input HTML → same output), and emits a console
    log confirming substitution (AC-C3-4). Removes:
    (a) `data-csp-nonce="__XAI_CSP_NONCE__"` attribute from `<html>` tag
    (b) `__XAI_CSP_NONCE__` literal anywhere
    (c) `<meta name="xai-csp-nonce" content="__XAI_CSP_NONCE__">` element
  - **Wrangler**: Installed globally `wrangler@3.114.0` via `npm install -g`.
    `wrangler --version` confirms `3.114.0`. Note: `wrangler pages deploy --dry-run`
    is NOT supported in wrangler 3.114.0 (no such flag). Running
    `wrangler deploy --dry-run` errors with "looks like a Pages project — use
    `wrangler pages deploy`" — which confirms wrangler correctly parses
    `wrangler.toml` as a Pages config. TOML syntax is structurally valid.
  - **`apps/web/deploy/security/` audit**: Confirmed as SHIPPED library namespace
    (from `web-security-csp-sentry`). Contains `headers.ts`, `cspEndpoint.ts`,
    `rumEndpoint.ts` + their tests. NOT a competing deploy artifact.
    Left untouched per plan and ADR-0008 §S6 namespace note.
- **Smoke results**:
  - `pnpm --filter @repo/web build` → GREEN (3.41s) ✅
  - `dist/index.html` nonce check: `grep -F "__XAI_CSP_NONCE__" dist/index.html`
    → 0 matches. AC-C3-1 PASSED ✅
  - `dist/index.html` attribute check: `grep -E 'data-csp-nonce|xai-csp-nonce'`
    → 0 matches (both nonce-bearing attributes removed) ✅
  - Secret hygiene: No `SUPABASE_URL`, `SUPABASE_ANON_KEY`, or actual Supabase
    project URLs (`*.supabase.co` with tenant prefix) in dist/. The `SUPABASE_`
    string appears once as part of bundled `@supabase/auth-js` SDK error/code
    strings — these are not secret values, no `KEY=value` patterns. CLEAN ✅
  - `wrangler --version` → `3.114.0` (v3.x confirmed) ✅
  - wrangler.toml correctly recognized as Pages config ✅
  - **Bundle stats**:
    - Total files in `dist/`: **8 files** (well under 20K limit) ✅
    - Total size: **5.8 MiB**
    - Largest file: `index-Di4Dj3wp.js.map` @ 4,926,285 bytes (~4.7 MiB) — hidden
      sourcemap; under 25 MiB limit ✅
    - Largest non-map file: `index-Di4Dj3wp.js` @ 992,768 bytes (~969 KiB)
    - Pages free-tier limits: NO individual file > 25 MiB, total < 20K files ✅
- **Tests run**: Build smoke. Nonce grep evidence recorded above.
- **Commits**: 7e11f50 `feat(xai-web-deploy-cloudflare): P2 — wrangler.toml + _headers + .nvmrc + nonce strip`
- **Next step**: Proceed to P3.

### 2026-05-24 — feature-auto-build (claude-sonnet-4-6) — P3 GitHub Actions workflow

- **Action**: Phase P3 implementation for `xai-web-deploy-cloudflare`.
  - Rebased on `origin/main` — branch already current.
  - Created `.github/workflows/deploy-web.yml` per api.md §C4 contract.
  - Triggers: `push` on `main` (production), `pull_request` (preview).
  - Steps: `actions/checkout@v4` → `pnpm/action-setup@v4` (9.0.0) →
    `actions/setup-node@v4` (node-version-file: .nvmrc, cache: pnpm) →
    `pnpm install --frozen-lockfile` → `pnpm --filter @repo/web build`
    (env: VITE_WEB_AUTH_MODE: mock-authenticated) →
    `cloudflare/wrangler-action@v3` (wranglerVersion: 3.114.0,
    workingDirectory: apps/web, command: pages deploy ./dist
    --project-name=xai-web-console --branch=${{ github.head_ref || github.ref_name }}).
  - Outputs step: `pages-deployment-id`, `pages-deployment-alias-url`,
    `deployment-url` echoed into `$GITHUB_STEP_SUMMARY` (AC-C4-13).
  - Security: `github.head_ref` passed via env var (not inline in shell
    script) to avoid actionlint injection warning.
  - **actionlint**: Installed via `brew install actionlint` (v1.7.12).
    `actionlint .github/workflows/deploy-web.yml` → **0 errors** (AC-C4-12 PASSED).
    Initial run had shellcheck SC2086 warnings on unquoted vars + SC2129
    redirect style + `github.head_ref` injection warning. Fixed by using
    env vars block for all outputs/branch refs + consolidated redirect.
- **Smoke**: All AC-C4-1..C4-13 ticked:
  - AC-C4-1: file exists ✅
  - AC-C4-2: cloudflare/wrangler-action@v3 (not pages-action) ✅
  - AC-C4-3: @v3 pin + wranglerVersion: 3.114.0 ✅
  - AC-C4-4: secrets via ${{ secrets.* }} idiom, no literals ✅
  - AC-C4-5: no Supabase secret ✅
  - AC-C4-6: no Sentry secret ✅
  - AC-C4-7: node-version-file: .nvmrc ✅
  - AC-C4-8: pnpm version: 9.0.0 ✅
  - AC-C4-9: pnpm install --frozen-lockfile ✅
  - AC-C4-10: VITE_WEB_AUTH_MODE: mock-authenticated in env: block ✅
  - AC-C4-11: pages deploy ./dist --project-name=xai-web-console
    --branch=... (dynamic) ✅
  - AC-C4-12: actionlint → 0 errors (v1.7.12) ✅
  - AC-C4-13: deployment summary to $GITHUB_STEP_SUMMARY ✅
- **Tests run**: actionlint clean.
- **Commits**: (pending — will be filled after commit)
- **Next step**: Commit P3, then proceed to P4.
