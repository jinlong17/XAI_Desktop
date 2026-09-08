# xai-web-deploy-cloudflare — Design Snapshot

> Decision snapshot only. See
> `docs/reviews/xai-web-deploy-cloudflare/20260524-discovery-review.md` for full
> option analysis, tradeoffs, and rationale.
>
> This row is a **Roadmap / CI Gate Anchor** per `docs/PLUGIN_MAP.md` taxonomy.
> It owns no executable package code. Its deliverable is a deploy
> configuration + a CI workflow + an ADR + a runbook + a four-doc anchor.

## Selected Option Set

This feature resolves four sub-decisions into a single coherent shape recorded
in `docs/adr/0008-cloudflare-deploy-target-and-csp.md`:

| # | Decision | Selected | Rejected | One-line rationale |
|---|----------|----------|----------|---------------------|
| D1 | Deploy target | **Cloudflare Pages** | Workers Static Assets; external vendors | apps/web is fully static today; AI Chat backend is out-of-scope; flip-to-Workers is a one-line config swap when row #18 reaches real-backend feature-plan. |
| D2 | Auth posture | **`VITE_WEB_AUTH_MODE=mock-authenticated`** | Real Supabase auth | Matches "public demo URL" intent; zero secret-management cost; defers full auth productionization. |
| D3 | CSP nonce treatment under static hosting | **Strip nonce dance + `_headers`-delivered CSP (Candidate A.1)** | Workers + nonce-injecting layer (B); pragmatic no-nonce static (C) | Cleanly static; preserves the rest of SHIPPED CSP posture; strictness delta vs SHIPPED `web-security-csp-sentry` recorded explicitly in ADR-0008 §Decision 3. |
| D4 | CI build command | **Vanilla `pnpm --filter @repo/web build`** | `build:secure` (8-step Sentry sourcemap chain) | First-deploy friendly; zero new secrets; follow-up row owns `build:secure` CI parity. |

## Identity

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Slug | `xai-web-deploy-cloudflare` |
| Roadmap Row | Post-roadmap operational row (24/24 SHIPPED; not yet listed as row #25 in `docs/workflow/roadmap/xai-web-console.md` — feature-build P1 may add an informational row at the manifest tail, or leave it as out-of-table operational row). |
| Architecture Kind | Roadmap / CI Gate Anchor (per PLUGIN_MAP.md taxonomy) |
| Three-faces Boundary | Web face only (ADR-0006). Zero overlay / desktop / core / plugin code touched. |
| Cross-window Contract Impact | None. No `packages/core/src/events/` typed events added. No Tauri command surface touched. |
| Real-hardware Gate | Not required (web deploy, browser smoke). |
| Verify Cross-vendor | Yes — Codex (gpt-5.5-thinking, effort=medium) primary, Cursor fallback. |
| Automation Mode | A-Claude (autonomous) |
| Stop Before Ship | Yes (parent session holds the ship gate). |
| Review Doc Path | `docs/reviews/xai-web-deploy-cloudflare/20260524-discovery-review.md` |
| Review Date | 2026-05-24 |
| Source Brief | `docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md` |
| ADR Anchor | `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (to be authored in feature-build P1) |

## Frozen Assumptions

These propositions lock at plan acceptance and become hard inputs for every
build / verify phase. Changing any of them after Plan acceptance requires
either (a) re-opening this row via Revise mode, or (b) opening a follow-up
row with a new ADR.

1. **Target = Cloudflare Pages.** `wrangler.toml` declares
   `pages_build_output_dir = "./dist"`. CI invokes `pages deploy ./apps/web/dist
   --project-name=xai-web-console`. Workers Static Assets is the documented
   future-trigger when AI Chat backend lands.
2. **Build payload = `apps/web/dist/` produced by `pnpm --filter @repo/web build`.**
   No `build:secure` (no Sentry sourcemap upload) in this row. Vite continues
   to emit `sourcemap: "hidden"` per `apps/web/vite.config.ts`.
3. **Auth mode = `VITE_WEB_AUTH_MODE=mock-authenticated`** at build time. CI
   sets this in the `env:` block on the build step. No Supabase secrets enter
   the repo or CI.
4. **Secrets = `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` only.** Stored
   in GitHub repo Secrets. No Sentry token, no Supabase keys this row.
5. **CSP delivery = `apps/web/public/_headers` shipped statically by Pages.**
   The build pipeline strips `__XAI_CSP_NONCE__` placeholders from
   `dist/index.html` (mechanism finalized in feature-build P2 — either a
   Vite plugin, a small Rollup hook, or a post-build sed pass; the
   placeholder MUST NOT reach the browser as a literal). CSP itself drops the
   per-request nonce; falls back to a hash / domain-allowlisted policy that
   covers `'self'` + `https://fonts.googleapis.com` + `https://fonts.gstatic.com`
   for the SHIPPED Google Fonts dependency.
6. **CSP strictness delta vs SHIPPED `web-security-csp-sentry` posture is
   recorded explicitly in ADR-0008 §Decision 3.** Recognized as security
   debt. Follow-up trigger: when the AI Chat backend row introduces a Worker
   layer, revisit and consider restoring per-request nonces via that Worker.
7. **Non-CSP security headers in `_headers` come verbatim from
   `apps/web/deploy/security/headers.ts` (the SHIPPED `buildSecurityHeaders`
   library).** That library remains compiled but unreachable at static
   runtime — accepted dead-code-at-runtime, kept for the future Worker layer
   to reuse.
8. **GitHub Action = `cloudflare/wrangler-action@v3`** (NOT the deprecated
   `cloudflare/pages-action`). Action pinned `@v3`; bundled `wranglerVersion`
   pinned to `3.114.0` (current at plan time; feature-build P3 confirms against
   `wrangler --version` and may bump within the v3.x line).
9. **Workflow triggers:** `push` on `main` → production deploy; `pull_request`
   → preview deploy. No `paths-ignore` filter in v1 (a docs-only-preview-suppression
   filter is a runbook lever for quota-exhaustion).
10. **Custom domain = none (v1).** Ships at `*.pages.dev`. DNS + TLS work is a
    future row, recorded in §Out of Scope.
11. **Node + pnpm versions are pinned by config files**, not by workflow
    inline values. `.nvmrc` at repo root (new — added in P2) pins Node 22 LTS.
    Root `package.json` `packageManager: "pnpm@9.0.0"` pins pnpm. Workflow uses
    `actions/setup-node@v4` with `node-version-file: '.nvmrc'` and
    `pnpm/action-setup@v4` reading the root `packageManager`.
12. **Branch policy:** `main` deploys to production; PR branches deploy to
    Cloudflare Pages preview environments. Pass `--branch=${{ github.head_ref
    || github.ref_name }}` to the `wrangler-action`.
13. **GitHub Action does NOT auto-commit anything to the repo.** Verify-gate
    evidence file (`docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md`)
    is written by `feature-verify` locally, not pushed by CI.
14. **Pre-deploy gate (Phase 5):** GitHub Secrets `CLOUDFLARE_API_TOKEN` and
    `CLOUDFLARE_ACCOUNT_ID` must be configured before P5 can complete the
    deploy. If not configured at P5 time, two fallbacks are accepted (per
    `test.md` §Phase-5-fallback): (a) manual `wrangler deploy` by the human
    operator with personal `wrangler login` auth, OR (b) BLOCKED handoff
    awaiting secret configuration.
15. **Scope is closed.** Out-of-scope items (AI Chat real backend, custom
    domain, R2/D1/KV, Sentry sourcemap CI, real auth, E2E browser matrix)
    are recorded in §Out of Scope and the brief §4. Any in-scope add will
    require a revise pass.

## Dependency Overview

```
                                ┌─────────────────────────────────────────────┐
                                │ Cloudflare Pages (free tier)                 │
                                │ - project: xai-web-console                   │
                                │ - https://xai-web-console.pages.dev/         │
                                │ - PR previews per branch                     │
                                └────────────────▲────────────────────────────┘
                                                 │
                                  wrangler pages deploy ./apps/web/dist
                                                 │
                                ┌────────────────┴────────────────────────────┐
                                │ GitHub Action — .github/workflows/deploy-web │
                                │  - on: push to main, pull_request            │
                                │  - cloudflare/wrangler-action@v3             │
                                │  - secrets: CLOUDFLARE_API_TOKEN/_ACCOUNT_ID │
                                └────────────────▲────────────────────────────┘
                                                 │
                              pnpm install --frozen-lockfile
                              pnpm --filter @repo/web build
                              env: VITE_WEB_AUTH_MODE=mock-authenticated
                                                 │
                                ┌────────────────┴────────────────────────────┐
                                │ apps/web/ (SHIPPED, 24/24 modules)           │
                                │  - vite 7 + React 19 + TS 5.9                │
                                │  - public/_headers (CSP + security headers)  │
                                │  - dist/index.html (no nonce placeholder)    │
                                │  - wrangler.toml                             │
                                └─────────────────────────────────────────────┘
                                                 │
                              consumes (compile-time): every @repo/plugin-web-*
                              + @repo/xai-web-shell + @repo/web-auth-device-session
                              (all SHIPPED — no mocks needed)
```

## File-level Deliverables (Frozen)

| Path | Phase | Type | Notes |
|------|-------|------|-------|
| `docs/adr/0008-cloudflare-deploy-target-and-csp.md` | P1 | New | Resolves D1+D2+D3+D4. Status=Accepted on first write. |
| `packages/xai-web-deploy-cloudflare/docs/design.md` | P1 (this file) | New | Decision snapshot. |
| `packages/xai-web-deploy-cloudflare/docs/api.md` | P1 | New | "API" = shape contracts of wrangler.toml + workflow YAML + `_headers` + ADR. |
| `packages/xai-web-deploy-cloudflare/docs/test.md` | P1 | New | Verification strategy (docs review + CI smoke + live deploy smoke + cross-vendor cold-read). |
| `packages/xai-web-deploy-cloudflare/docs/dev_log.md` | P1 | New | Status Panel + Work Log. |
| `apps/web/wrangler.toml` | P2 | New | `name`, `compatibility_date`, `pages_build_output_dir`. |
| `apps/web/public/_headers` | P2 | New | CSP + STS + nosniff + frame-options + referrer-policy + permissions-policy. |
| `.gitignore` (root) | P2 | Edit | Append `.dev.vars` + `.wrangler/`. |
| `.nvmrc` (root) | P2 | New | `22` (resolves brief OQ Q15.1). |
| Possible: `apps/web/index.html` placeholder strip mechanism | P2 | TBD | Decided in build P2 between Vite plugin / Rollup hook / post-build script. Falls back to a small inline transformation if no plugin approach is clean. |
| `.github/workflows/deploy-web.yml` | P3 | New | `wrangler-action@v3`. |
| `docs/runbooks/cloudflare.md` | P4 | New | Setup / rotate / rollback / manual / quota / disaster recovery. |
| `docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md` | P5 | New | Evidence file authored by feature-verify. |
| `docs/PLUGIN_MAP.md` | (optional, P5 or ship) | Edit | Add this row to the Roadmap / CI Gate Anchors table. Decision deferred to feature-verify or ship — anchor rows like `xai-web-event-bus` precedent are not all listed. |

## Out of Scope (verbatim from brief §4 + plan-time refinements)

- AI Chat real LLM backend (today's `window.claude.complete` is the SHIPPED
  no-op adapter from row #18; lifting to a Worker = future row, candidate
  trigger to flip Decision 1 to Workers Static Assets).
- Custom domain (ship as `*.pages.dev`; DNS work = future row).
- R2 / D1 / KV storage (per ADR-0007, persistence stays client-side
  localStorage / IndexedDB).
- Sentry / observability beyond the SHIPPED CSP+Sentry row's sourcemap upload,
  which already runs only in `build:secure` (and we do not invoke `build:secure`
  in CI this row).
- Real auth (defer; ship `VITE_WEB_AUTH_MODE=mock-authenticated`).
- E2E browser-matrix testing (covered by the deferred `web-ticktick-parity`
  row `web-deploy-ci-browser-matrix`).
- Edits to `docs/workflow/roadmap/xai-web-console.md` (post-roadmap operational
  row; manifest manipulation belongs to roadmap-loop).

## Decision Risk Register

| ID | Risk | Severity | Mitigation |
|----|------|----------|-----------|
| R-D1 | CSP regression vs SHIPPED `web-security-csp-sentry` row | High | Decision 3 + ADR-0008 §3; verify gate `curl -I` check; P2 runtime audit of `createNonceStyleElement` callers. |
| R-D2 | Secret leak in `dist/` (sourcemaps, env injection) | High | `vite.config.ts` `sourcemap: "hidden"`; verify-gate `dist/` grep for `SUPABASE_` / Sentry DSN / `CLOUDFLARE_`. |
| R-D3 | Pages free-tier 500 builds/mo exhausted | Medium | Runbook documents `paths-ignore` filter lever. |
| R-D4 | Wrangler-action drift / breaking change | Medium | Pin `@v3` + `wranglerVersion: 3.114.0` explicitly. |
| R-D5 | Build deterministic CI vs local | Medium | `pnpm install --frozen-lockfile` + `.nvmrc` + `packageManager` pinned. |
| R-D6 | First-deploy `_headers` syntax error | Medium | Local `wrangler deploy --dry-run` in P2 smoke; runbook §Manual Deploy is the rollback path. |
| R-D7 | Runtime nonce callers break under static deploy | High | P2 runtime audit; if any caller fires under static, BLOCK back to plan. |
| R-D8 | GitHub Secrets not configured at P5 deploy time | Medium | Phase 5 fallback documented (manual deploy or BLOCKED handoff). |
| R-D9 | Codex cross-vendor verifier quota exhausted | Low | Cursor fallback per roadmap manifest line 10. |
| R-D10 | Future contributor doesn't know `apps/web/deploy/security/` vs `apps/web/wrangler.toml` distinction | Low | ADR-0008 records the namespace-coexistence one-paragraph note. |

## Phase Plan (recorded here AND in `dev_log.md` Status Panel)

Each phase = one `feature-build` run, one commit, then stops for human
confirmation per CLAUDE.md.

- **P1 — ADR-0008 + 四件套 docs anchor.** Author the ADR (Status=Accepted on
  first write). Confirm the four-doc set authored by this Plan turn is in
  sync with the ADR. No executable file changes. **Smoke**: ADR resolves all
  4 decisions; cross-doc links intact; ADR section count matches the outline
  in discovery-review §11.
- **P2 — `apps/web/wrangler.toml` + `apps/web/public/_headers` + `.gitignore`
  augment + `.nvmrc` + nonce-placeholder strip mechanism + runtime nonce
  caller audit.** **Smoke**: `pnpm --filter @repo/web build` continues to pass;
  `dist/index.html` no longer contains the literal `__XAI_CSP_NONCE__` string
  (grep evidence in dev_log); `dist/` bundle size + largest chunk recorded;
  `dist/` greps clean for `SUPABASE_` / Sentry DSN / `CLOUDFLARE_` literals;
  `wrangler --version` reports v3.x; `wrangler deploy --dry-run`
  (or equivalent Pages dry-run if available) succeeds against the new
  `wrangler.toml`.
- **P3 — `.github/workflows/deploy-web.yml`.** **Smoke**: `actionlint` clean
  (or manual schema check if actionlint not installed locally); workflow YAML
  loads against the GitHub Actions schema; secret references match runbook
  enumeration.
- **P4 — `docs/runbooks/cloudflare.md`.** **Smoke**: runbook contains §First-time
  Setup, §Rotate Secrets, §Rollback, §Manual Deploy, §Quota Monitoring,
  §Disaster Recovery; every command in the runbook is copy-pasteable.
- **P5 — Live deploy + manual smoke + evidence file (verify-only — feature-verify
  owns this phase).** **Smoke**: full verify gate per `test.md`. If secrets
  not configured, Phase-5 fallback Option (a) or (b).

## Verify Gate Plan

Feature-verify runs all of:

1. `pnpm install --frozen-lockfile && pnpm --filter @repo/web build` → green.
2. `pnpm --filter @repo/web test` → all SHIPPED unit tests stay green.
3. `actionlint .github/workflows/deploy-web.yml` (or manual schema check).
4. `wrangler.toml` validation (`wrangler deploy --dry-run` or equivalent).
5. `dist/` tree size + largest chunk recorded in dev_log Verify Report.
   No individual file > 25 MiB. Total file count < 20K.
6. Live deploy reachable: `curl -I https://<project>.pages.dev/` → 200.
7. SPA fallback: `curl -I https://<project>.pages.dev/app/tasks` → 200 with
   `Content-Type: text/html` (Pages serves `index.html` because no
   `dist/app/tasks` exists).
8. Manual smoke (real browser): rail nav cycles modules; Dashboard widget
   state round-trips via localStorage on reload.
9. CSP header audit: `curl -I https://<project>.pages.dev/` returns
   `Content-Security-Policy` matching the `_headers` declaration; delta
   vs SHIPPED `web-security-csp-sentry` posture is recorded in
   ADR-0008 §Decision 3 (no silent strictness loss).
10. `dist/` greps clean for `SUPABASE_` / Sentry DSN / `CLOUDFLARE_` literals.
11. Evidence file `docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md`
    captures the live URL, full curl response headers, and the smoke checklist
    with checkmarks.
12. First production URL recorded in dev_log Ship Report (filled at ship time).
13. **Cross-vendor cold-read**: Codex (gpt-5.5-thinking, effort=medium)
    independently reads ADR-0008 + wrangler.toml + deploy-web.yml + cloudflare
    runbook + `_headers` and confirms no internal contradictions, no conflict
    with ADR-0003 / ADR-0006 / ADR-0007, and that the secret enumeration matches
    the runbook. Cursor fallback when Codex quota is exhausted.

## Related Decisions

- ADR-0003 — three-faces architecture (zero overlay / desktop / plugin code
  touched; web face only).
- ADR-0006 — Web face hybrid reuse boundary (deploy config is host-shell-adjacent
  configuration, within ADR-0006's allowance for Web-face independence; no new
  data contracts introduced).
- ADR-0007 — XAI Web Console build-form (predecessor; this row's deploy face is
  the natural successor; `pages_build_output_dir = "./dist"` matches the
  ADR-0007 frozen assumption §1 that `apps/web/dist` is the Vite build output).
- CLAUDE.md §Code Boundaries — confirmed: no business logic added; only deploy
  config + CI + docs + 1 ADR.
- `web-security-csp-sentry` SHIPPED row — Decision 3 records the strictness
  delta this row introduces.
