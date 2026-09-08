# Feature Brief — xai-web-deploy-cloudflare

> Step 0 normalized brief produced by skill `xai-feature-brief`.
> Source: parent-session `xai-feature-full-loop` skill invocation, 2026-05-24.
> Single-session A-Claude run; no multi-round AskUserQuestion intake — the goal
> brief from the user already pre-classified scope, decisions, constraints, and
> verify gate, and the run is gated by an A-Claude "do not pause" directive.

| 字段 | 值 |
|------|---|
| Status | `READY_FOR_FEATURE_PLAN` |
| Slug | `xai-web-deploy-cloudflare` |
| Roadmap Row | _Not yet listed in `docs/workflow/roadmap/xai-web-console.md`_ (24/24 SHIPPED — this is a post-roadmap operational row). Surfaces in row #25 candidate slot when feature-plan writes its dev_log. |
| Automation Mode | A-Claude |
| Verify Cross-vendor | yes |
| Stop Before Ship | yes |
| ADR-lite Trigger | **Yes** — see §ADR-lite Trigger |
| Cross-window Contract Impact | None (apps/web/ is the sibling web product; no `packages/core/src/events/` or Tauri command surface touched) |
| Real-hardware Gate Required | No (web deploy; verified via remote browser smoke) |
| Output Path | `docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md` |

---

## 1. Problem Statement

`apps/web/` (the XAI Web Console, package `@repo/web`) is a production-grade
Vite 7 + React 19 SPA. As of 2026-05-23 every roadmap row in
`docs/workflow/roadmap/xai-web-console.md` (24/24 modules + tokens + i18n +
persistence + shell) is SHIPPED on `origin/main`. The build is reachable today
only via `pnpm --filter @repo/web dev` on a developer machine; there is **no
publicly reachable production URL**.

This brief covers the post-roadmap operational row that closes that gap by
configuring Cloudflare as the static-asset host and producing the first
public production URL for the SHIPPED console.

## 2. User / Actor

- **Primary**: Project owner (Jinlong) needs a shareable URL for the
  artifact-quality web console (demos, recruiter sharing, feedback loops).
- **Secondary**: Any future contributor running `git push origin main` — CI
  must deterministically (re)deploy without manual `wrangler deploy`.
- **Tertiary (mock-auth only)**: Anonymous visitors hitting the public URL,
  who land in `mock-authenticated` mode so all 24 modules render with seed
  data and local-storage round-trip the same way they do in `dev:mock-auth`.

## 3. Desired Outcome

A first publicly reachable URL at `*.pages.dev` (or its Workers Static
Assets equivalent) such that:

- Every PR to `main` triggers a Cloudflare preview deploy via GitHub Actions.
- Every push to `main` triggers a production deploy.
- All 24 modules render; rail nav works; dashboard localStorage round-trips
  on the public URL exactly as in local `dev:mock-auth`.
- Deep-link to `/app/<sub>` serves `index.html` (SPA fallback).
- Existing CSP posture from SHIPPED `web-security-csp-sentry` is **not
  regressed** by the new hosting.
- Secrets never enter the repo; `.dev.vars` / `.wrangler/` are gitignored.
- A `docs/runbooks/cloudflare.md` runbook documents secret rotation,
  rollback, and manual `wrangler deploy`.

## 4. Scope and Non-Goals

### In Scope (this row)
- `apps/web/wrangler.toml` (deploy target config; Pages vs Workers Static
  Assets chosen at plan time per §Decision 1).
- `.github/workflows/deploy-web.yml` using `cloudflare/wrangler-action@v3`
  (NOT the legacy `pages-action`); pnpm + Node from root `packageManager` /
  `engines` / `.nvmrc`.
- GitHub Secrets wiring: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- `.gitignore` augment: add `.dev.vars`, `.wrangler/`.
- `docs/runbooks/cloudflare.md` (rotate secrets, rollback, manual deploy,
  free-tier quota monitoring).
- `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (decisions 1 + 2 +
  CSP-nonce treatment under static hosting).
- `packages/xai-web-deploy-cloudflare/docs/` 四件套 (design.md / api.md /
  test.md / dev_log.md) — the roadmap-row docs anchor matching the other
  `packages/xai-web-*/docs/` rows already in the tree.
- Production smoke evidence at
  `docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md`.
- First production URL recorded in dev_log Ship Report.

### Out of Scope (defer to follow-up rows)
- AI Chat real LLM backend (today's `window.claude.complete` is the SHIPPED
  no-op adapter from row #18; lifting to a Worker = future row, candidate
  trigger to flip Decision 1 to Workers Static Assets).
- Custom domain (ship as `*.pages.dev`; DNS work = future row).
- R2 / D1 / KV storage (per ADR-0007, persistence stays client-side
  localStorage / IndexedDB).
- Sentry / observability beyond the SHIPPED CSP+Sentry row's sourcemap
  upload, which already runs in `build:secure`.
- Real auth (defer; ship `VITE_WEB_AUTH_MODE=mock-authenticated`).
- E2E browser-matrix testing (covered by the deferred `web-ticktick-parity`
  row `web-deploy-ci-browser-matrix`).

## 5. Architecture Classification

| Dimension | Value | Rationale |
|-----------|-------|-----------|
| Architecture Kind | **Roadmap / CI Gate Anchor** (per PLUGIN_MAP.md taxonomy of `packages/xai-web-*/docs/` rows) — not a plugin slice. | This row owns no executable plugin code; it owns deploy configuration + CI + docs. Matches the existing pattern: `packages/xai-web-build-form-adr`, `xai-web-event-bus`, etc. |
| User Surface | Public web (`*.pages.dev`) — no internal app surface changes. | Browser visitors render the SHIPPED `@repo/web` SPA verbatim. |
| Change Type | **New feature** (introduces a deployment surface that did not exist) | First public URL; first `wrangler.toml`; first deploy workflow. |
| Impacted Layers | `apps/web/` (config-only — adds `wrangler.toml`, possibly `public/_headers`); `.github/workflows/` (new); `docs/adr/`, `docs/runbooks/`, `docs/reviews/` (new); `packages/xai-web-deploy-cloudflare/docs/` (new 四件套); root `.gitignore` (augment). | Zero code change in any `@repo/plugin-web-*`, `@repo/xai-web-shell`, `@repo/core`, `apps/desktop/`. |
| Target Plugin State | N/A | Depends on a SHIPPED app, not a plugin. |
| Risk Level | **Medium** | See §Risk Assessment. |

### Three-Faces Boundary Check (ADR-0003)
`apps/web/` is the **Web face** — a Vite SPA sibling product, governed by
ADR-0006 ("Web 面混合复用边界"). This row touches only host-shell deployment
configuration and CI plumbing; it adds **no** business logic, **no** core
infra, **no** plugin code. Three-faces nondum laesa.

## 6. Critical Up-Front Decisions

### Decision 1 — Deploy target: Pages vs Workers Static Assets

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **A. Cloudflare Pages** | Free-tier static; built-in PR previews; `cloudflare/wrangler-action@v3` first-class support; `pages_build_output_dir = "./dist"` is one line in `wrangler.toml`. No SSR / no functions surface to worry about. | Future `/api/chat` Worker = separate Workers project (extra wiring) OR migrate to Workers Static Assets later. | **Recommended for this row** — `apps/web/` is fully static today and the AI Chat backend is explicitly out-of-scope. Migration cost is one config swap when AI Chat backend lands. |
| **B. Workers Static Assets** | `[assets] directory = "./dist"` + `not_found_handling = "single-page-application"` natively serves SPA + future `/api/*` Worker functions co-located. No migration when AI Chat backend lands. | Slightly more config surface; pnpm install + build still needed in CI; quotas billed differently (Workers requests, not Pages builds). | Defer to follow-up row, **unless** plan determines AI Chat real-LLM is queued for a near-term row, in which case flip the recommendation here. |

**Plan should record the final choice in ADR-0008 §Decision 1** with a
single Accepted variant + a deferred-trigger note ("flip to Workers Static
Assets when row N reaches feature-plan").

### Decision 2 — Auth posture for the public URL

| Option | Notes | Recommendation |
|--------|-------|----------------|
| **A. `VITE_WEB_AUTH_MODE=mock-authenticated`** (build-time env on Cloudflare) | Today's `dev:mock-auth` script already wires this; all 24 modules render against seed data + local storage; no Supabase secrets need to leave the dev machine. | **Recommended** — matches "public demo" use case in the user brief; zero secret-management work. |
| **B. Real auth (Supabase)** | Requires copying `apps/web/.env.local` Supabase keys into Cloudflare Pages env vars + GitHub Secrets; widens secret surface; existing `web-auth-device-session` is SHIPPED but device-session-only, not full Supabase Auth UI. | Defer to a follow-up row that owns auth productionization. |

**Plan should record the final choice in ADR-0008 §Decision 2.**

### Decision 3 — CSP nonce under static hosting *(new finding, not in user brief)*

`apps/web/index.html` line 1 and 5 use `__XAI_CSP_NONCE__` placeholders.
On a dev server (and presumably under the SHIPPED `web-security-csp-sentry`
runtime), these are swapped per-request. Cloudflare Pages pure-static
**cannot** inject a per-request nonce.

| Option | Pros | Cons |
|--------|------|------|
| **A. Strip the nonce dance for static**: replace `__XAI_CSP_NONCE__` with a build-time-stable nonce or drop nonce entirely; deliver CSP via `apps/web/public/_headers` using hash-based or domain-allowlist CSP for Google Fonts + inline scripts. | Cleanly static; no Worker needed. | Possible CSP downgrade vs the SHIPPED row's per-request strictness; must be reviewed against `web-security-csp-sentry` posture. |
| **B. Workers Static Assets** + a thin nonce-injecting Worker layered in front. | Preserves per-request nonce. | Adds Worker surface this row was trying to avoid. |
| **C. Accept Pages + no nonce + tighter `_headers` CSP** (typical static-deploy answer). | Simple. | Same caveat as A. |

**Plan must surface this** and either record it in ADR-0008 §CSP (preferred)
or escalate by spawning a thin sub-decision back to the SHIPPED
`web-security-csp-sentry` owner. **Brief recommendation**: take Option A
with `_headers`-delivered CSP and explicitly call out the strictness delta
in ADR-0008.

### Decision 4 — Sentry sourcemap upload in CI

`apps/web/package.json` has `build:secure` chaining 8 `sourcemaps:*` steps
to upload sourcemaps to Sentry. CI must choose:

| Option | Notes |
|--------|-------|
| **A. CI runs `pnpm --filter @repo/web build` only** (no sourcemap upload) | Simpler; first-deploy friendly; sourcemaps stay client-side and would be hidden per current `vite.config.ts` `sourcemap: "hidden"`. |
| **B. CI runs `pnpm --filter @repo/web build:secure`** | Requires Sentry auth secret in GitHub Secrets too; couples this row's deploy to Sentry availability. |

**Brief recommendation**: Option A for this row (first public URL),
follow-up row owns full secure-build CI parity.

### Decision 5 — Pre-decided (record in plan, no ADR needed)

| # | Decision | Status |
|---|----------|--------|
| 3 | Custom domain | **Deferred** — ship as `*.pages.dev`; future row owns DNS + TLS. |
| 4 | PR preview deploys | **Enabled** — Cloudflare default; `wrangler-action` covers it. |
| 5 | Branch policy | `main` → production; PRs → preview. |

## 7. Dependencies and Reuse

| Dependency | Source | State | How Used |
|------------|--------|-------|----------|
| `@repo/web` (`apps/web/`) | Monorepo workspace | SHIPPED (24/24 roadmap rows) | Build artifact `apps/web/dist` is the deploy payload. |
| Cloudflare Skills (`cloudflare@cloudflare`) | Claude plugin marketplace | _Install if missing_: `/plugin marketplace add cloudflare/skills; /plugin install cloudflare@cloudflare` | Plan/build sessions consult Cloudflare's first-party plan/runbook guidance. |
| Cloudflare MCP `https://mcp.cloudflare.com/mcp` | External | _Connect during plan_: OAuth on first use | Account-aware deploy verification (optional but recommended for verify gate). |
| Wrangler CLI | npm `wrangler` | Install in dev + CI (pinned version recorded in workflow) | Local validation + CI deploy via `wrangler-action`. |
| `cloudflare/wrangler-action@v3` | GitHub Marketplace | External | The chosen Action; explicitly NOT the deprecated `pages-action`. |
| `web-security-csp-sentry` (SHIPPED row) | `packages/xai-web-…` family | SHIPPED | Plan must consult its CSP contract before resolving Decision 3. |

### Plugin State Check
- All 24 `xai-web-*` plugin rows are SHIPPED or READY_TO_SHIP per
  `docs/workflow/roadmap/xai-web-console.md`. No plugin is In-Dev or
  Migrating relative to this row → **No mocks required**.
- `@repo/plugin-console` and `@repo/plugin-productivity` (legacy plugins,
  still listed in `apps/web/package.json`) remain as carry-over deps; this
  row does not touch them.

## 8. Mock Strategy

**No Mock.** Build payload comes from a verified SHIPPED roadmap. The only
runtime "mock" is `VITE_WEB_AUTH_MODE=mock-authenticated` itself, which is
the SHIPPED row #5 (`xai-web-shell`) production behavior under that env
flag — that is a product feature, not a test mock.

## 9. Data / Permission / Security Impact

- **Secrets**: Must add `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` to
  GitHub repo Secrets (no Supabase secrets required given Decision 2 = A).
- **`.gitignore` augment** (mandatory pre-commit step in feature-build):
  - Add `.dev.vars` (Wrangler local secret file)
  - Add `.wrangler/` (Wrangler local cache + state)
  - Confirm existing `.env*` line in `apps/web/.gitignore` + root
    `.gitignore` line 28 (`dist`) already cover Vite output + local env.
- **CSP**: Must not regress the SHIPPED `web-security-csp-sentry` posture.
  See Decision 3.
- **Public surface**: Once deployed, anything in `apps/web/dist/` is
  publicly readable. Plan must audit `dist/` for accidental secret leaks
  before first deploy (e.g., grep for `SUPABASE_`, sourcemap URLs).
- **No macOS Accessibility / Screen Capture / Full Disk Access prompts** —
  not applicable to web target.

## 10. Release Strategy (ADR-0002 dual-track)

Web target only. ADR-0002 dual-track (macOS DMG vs MAS) is N/A here; this
row defines its own simple track: `main` push = production; PR = preview.
First deploy is gated by **human confirmation** of the URL before final
ship push (per Stop-Before-Ship directive).

## 11. Rollback / Degrade Strategy

- **Cloudflare-side rollback**: Each deploy is immutable + addressable;
  Cloudflare Pages dashboard has one-click "rollback to previous deploy".
  Runbook §Rollback must document this.
- **Repo-side rollback**: Revert `apps/web/wrangler.toml` +
  `.github/workflows/deploy-web.yml`; reset GitHub Secrets if rotated.
- **Quota exhaustion** (500 builds/mo): Runbook documents disabling
  preview deploys on docs-only PRs as the first lever.

## 12. Acceptance Criteria (binary, testable)

- [ ] `pnpm install --frozen-lockfile && pnpm --filter @repo/web build`
      succeeds on a clean checkout.
- [ ] `pnpm --filter @repo/web test` passes (all SHIPPED unit tests stay green).
- [ ] `wrangler --version` is available in CI image; `wrangler deploy --dry-run`
      validates `apps/web/wrangler.toml` (skip dry-run if Pages config
      doesn't support it — runbook records the exact command used).
- [ ] `actionlint` reports no errors on `.github/workflows/deploy-web.yml`.
- [ ] `apps/web/dist/` tree size + largest chunk size are recorded in
      `packages/xai-web-deploy-cloudflare/docs/dev_log.md` Verify Report; no
      individual file exceeds 25 MiB; total file count below 20K.
- [ ] On `main`, GitHub Action completes a deploy and the `*.pages.dev` URL
      returns HTTP 200 at `/` and `/app`.
- [ ] Manual smoke (per verify gate): rail nav navigates between modules;
      dashboard widget state round-trips via localStorage on reload.
- [ ] SPA fallback verified: a deep link to `/app/<sub>` (e.g.
      `/app/tasks`, `/app/board`) returns `index.html` with status 200.
- [ ] No GitHub Secret value is committed to the repo;
      `git grep -E 'CLOUDFLARE_API_TOKEN=|CLOUDFLARE_ACCOUNT_ID='` returns
      only secret-name references in workflow + runbook.
- [ ] Evidence file `docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md`
      captures the live URL + curl headers + smoke checklist.
- [ ] First production URL recorded in dev_log Ship Report.

## 13. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| CSP regression vs SHIPPED `web-security-csp-sentry` row | Medium | High (security) | Decision 3 + ADR-0008 §CSP; verify gate adds `curl -I` check on CSP header content. |
| Secret leak in `dist/` (sourcemaps, env injection) | Low | High | `vite.config.ts` already uses `sourcemap: "hidden"`; verify gate greps `dist/` for `SUPABASE_`/Sentry DSN/`CLOUDFLARE_`. |
| Pages free-tier 500 builds/mo exhausted | Low | Medium | Runbook documents disabling preview-on-docs-only PRs lever. |
| Wrangler-action drift / breaking change | Low | Medium | Pin to `cloudflare/wrangler-action@v3` exact tag; renovate-style follow-up row owns version bumps. |
| Build deterministically reproducible across CI vs local | Low | Medium | Use `pnpm install --frozen-lockfile`; Node version pinned via root `engines` / `.nvmrc` (verify `.nvmrc` exists; if not, plan adds one). |
| First-deploy CSP/`_headers` syntax error blocks the only path to URL | Medium | Medium | Plan adds a wrangler preview deploy on a throwaway branch as Phase-1 dry-run before main CI is wired. |

## 14. ADR-lite Trigger

**Needed: Yes**

- **Decision Topic**: Cloudflare deploy target (Pages vs Workers Static
  Assets) + auth-mode posture + CSP-nonce treatment under static hosting.
- **Why Decision Is Needed**: Non-trivial cross-cutting decision; affects
  future AI Chat backend row's hosting model; affects security posture
  inherited from SHIPPED CSP+Sentry row; explicit user request to surface
  Decisions 1 + 2 + (Decision 3 newly discovered).
- **Options To Evaluate**: See §Decisions 1, 2, 3 tables above.
- **Risks If Deferred**: Plan-time decision becomes feature-build-time
  improvisation; CSP downgrade unrecorded; future AI-Chat-backend row pays
  a migration cost it could have avoided.
- **Recommended ADR Filename**: `docs/adr/0008-cloudflare-deploy-target-and-csp.md`.

## 15. Open Questions / Unknowns

1. **`.nvmrc` presence**: Root has `engines: { "node": ">=18" }` but I have
   not verified `.nvmrc` exists. Plan must verify; if absent, plan adds one
   pinned to the local toolchain (likely Node 22 LTS for Vite 7).
   Status: 待确认。
2. **Cloudflare account ownership / OAuth**: Will OAuth on first MCP use
   land the Pages project in the project owner's personal account, a team
   account, or a new account? Plan should resolve before naming
   `pages_project_name`.
   Status: 待确认。
3. **Sentry DSN / Sentry auth token availability for `build:secure`** if
   Decision 4 ever flips to B in a follow-up row.
   Status: 待确认 (out of scope this row, but flagged for the follow-up).
4. **Existing `apps/web/deploy/`**: There is an `apps/web/deploy/` folder
   in the tree (created 2026-05-22). Plan must check whether it carries
   prior partial-Cloudflare or other-vendor artifacts that need cleanup
   or supersession.
   Status: 待确认 — plan-time TODO.
5. **Cross-vendor verifier order**: Roadmap manifest specifies
   `Codex (gpt-5.5-thinking, effort=medium)` primary, Cursor fallback.
   Confirm Codex quota at verify-gate time.
   Status: 待确认 — verify-gate-time check.

## 16. Planner Handoff

> Copy-paste this block when launching `feature-plan`.

```text
Start the feature-plan agent.

Feature: xai-web-deploy-cloudflare
Brief: docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md
Automation Mode: A-Claude
Verify Cross-vendor: yes
Stop Before Ship: yes

Three-faces decision: Web face only (apps/web/ — sibling Vite SPA per
  ADR-0006). No host / core / plugin code touched.
Target plugin slice: N/A — this is a Roadmap / CI Gate Anchor row per
  PLUGIN_MAP.md taxonomy. Create
  packages/xai-web-deploy-cloudflare/docs/{design,api,test,dev_log}.md
  matching the existing packages/xai-web-*/docs/ pattern (no executable
  package code; manifest-only optional).
Mock strategy: No Mock. All build inputs are SHIPPED. The only runtime
  "mock" is VITE_WEB_AUTH_MODE=mock-authenticated, which is the SHIPPED
  row #5 product behavior under that env flag — not a test mock.
Cross-window contract impact: None. No changes to
  packages/core/src/events/ typed events. No Tauri command surface
  touched.

Critical decisions plan MUST resolve (ADR-0008):
  1. Cloudflare Pages vs Workers Static Assets (recommend Pages)
  2. Public-URL auth posture (recommend VITE_WEB_AUTH_MODE=mock-authenticated)
  3. CSP-nonce treatment under static hosting (NEW finding — recommend
     _headers-delivered hash/domain CSP, drop per-request nonce, record
     strictness delta vs SHIPPED web-security-csp-sentry row)
  4. CI build command: vanilla build vs build:secure (recommend vanilla
     for first deploy)

Deliverables (plan must phase + sequence):
  - apps/web/wrangler.toml
  - .github/workflows/deploy-web.yml (uses cloudflare/wrangler-action@v3)
  - docs/runbooks/cloudflare.md
  - docs/adr/0008-cloudflare-deploy-target-and-csp.md
  - packages/xai-web-deploy-cloudflare/docs/ 四件套
  - .gitignore augment (.dev.vars, .wrangler/)
  - First-prod-URL recorded in dev_log Ship Report
  - Evidence at docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md

Out of scope: AI Chat real LLM backend, custom domain, R2/D1/KV,
  Sentry beyond existing CSP+Sentry posture, real auth, E2E browser matrix.

Verify Gate (feature-verify must cover all):
  - pnpm --filter @repo/web build → green
  - pnpm --filter @repo/web test → all pass
  - GitHub Action lints clean (actionlint)
  - wrangler.toml validates (wrangler --version + dry-run if available)
  - Bundle sanity: dist/ tree size + largest chunk recorded
  - Live deploy reachable at .pages.dev; manual smoke: /, /app, rail
    nav, dashboard localStorage round-trip
  - SPA fallback verified (deep-link to /app/<sub> serves index.html)
  - CSP header on live URL audited vs SHIPPED web-security-csp-sentry
    contract; delta recorded in ADR-0008
  - dist/ greps clean for SUPABASE_/Sentry DSN/CLOUDFLARE_ literals
  - Evidence under docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md

Open questions plan must close:
  - .nvmrc presence / Node version pin
  - Cloudflare account ownership / OAuth path
  - apps/web/deploy/ folder pre-existing content audit
  - Cross-vendor verifier order at verify-gate time (Codex primary,
    Cursor fallback)

Constraints (verbatim from user brief; plan must enforce):
  - Vite STATIC output only unless Decision 1 picks Workers Static Assets
  - Monorepo build: pnpm install --frozen-lockfile && pnpm --filter @repo/web build
  - pnpm: root packageManager (pnpm@9.0.0). Node: .nvmrc / engines >=18.
  - CI: GitHub Actions on push to main + PR; cloudflare/wrangler-action
    (NOT legacy pages-action)
  - Secrets: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID via GitHub
    Secrets only. Never commit.
  - CSP / _headers: respect existing CSP; if adding
    apps/web/public/_headers, audit against tokens + Google Fonts
  - Pages free-tier limits: flag if dist/ approaches 20K files or
    25 MiB/file
  - Rebase awareness: feature-build MUST rebase on latest origin/main
    before commit; on conflict surface to user, no force-push

Every subagent return MUST end with the verbatim `## Handoff` /
`### Next Step` block per CLAUDE.md "Workflow V2 Subagent Output
Display" section.
```

## 17. QA Gate Self-Check

| # | Gate | Pass |
|---|------|------|
| 1 | Problem explicit | ✅ §1 |
| 2 | User / actor explicit | ✅ §2 |
| 3 | Scope + non-goals explicit | ✅ §4 |
| 4 | Classifications consistent | ✅ §5 |
| 5 | Dependency states checked vs PLUGIN_MAP.md | ✅ §7 (all SHIPPED) |
| 6 | Data/permission/security addressed | ✅ §9 |
| 7 | Release strategy addressed | ✅ §10 (N/A by exception, recorded) |
| 8 | Rollback addressed | ✅ §11 |
| 9 | Acceptance criteria binary + testable | ✅ §12 |
| 10 | Unknowns listed | ✅ §15 |
| 11 | ADR-lite trigger decision made | ✅ §14 (Yes → 0008) |
| 12 | Compressible into planner handoff | ✅ §16 |
| 13 | Three-faces boundary check | ✅ §5 (Web face only) |

**Outcome: `READY_FOR_FEATURE_PLAN`.**
