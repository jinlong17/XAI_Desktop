# xai-web-deploy-cloudflare — Interface Contracts

> This row ships **no runtime API**, **no typed event**, **no Tauri command**.
> Its "API" is the shape contracts of the deploy configuration files + GitHub
> Action + ADR + runbook. This document enumerates those contracts so
> feature-review and feature-verify can apply binary acceptance criteria.

## C0. Identity

| Field | Value |
|---|---|
| Slug | xai-web-deploy-cloudflare |
| Architecture Kind | Roadmap / CI Gate Anchor (no executable package code) |
| Public Surface | Configuration files + CI workflow + ADR + runbook |
| Permission / idempotency | Re-running CI on the same commit MUST produce an idempotent deploy (same artifact hash → same Pages deployment "no-op" or new deployment with same content). |
| Error semantics | CI failures surface in the GitHub Actions UI. Manual deploy failures surface from `wrangler` stderr; runbook §Rollback documents the recovery path. |

---

## C1. `apps/web/wrangler.toml`

### Required keys

```toml
name = "xai-web-console"
compatibility_date = "2026-05-24"
pages_build_output_dir = "./dist"
```

### Acceptance Criteria

- **AC-C1-1**: File exists at `apps/web/wrangler.toml` (NOT inside
  `apps/web/deploy/` — that path is the SHIPPED security-library namespace,
  not a deploy-config home).
- **AC-C1-2**: `name` is `xai-web-console` (matches the Cloudflare Pages project
  name; the human operator creates the project under that name at first
  `wrangler pages project create` time per runbook §First-time Setup).
- **AC-C1-3**: `pages_build_output_dir` is `"./dist"` — the Vite build output
  per `apps/web/vite.config.ts` defaults.
- **AC-C1-4**: `compatibility_date` is a valid date string in ISO format.
  Plan-time value: `"2026-05-24"`. May be bumped by future renovate row.
- **AC-C1-5**: No `[assets]` block (that's the Workers Static Assets schema,
  not Pages — would conflict with `pages_build_output_dir`).
- **AC-C1-6**: No secret values are embedded in the file (no API tokens,
  account IDs, Supabase keys).
- **AC-C1-7**: TOML is parseable (`wrangler deploy --dry-run` or equivalent
  validates syntax in feature-build P2 smoke).

### Optional keys (not in v1, recorded for future)

- `[env.preview]` / `[env.production]` blocks — not used; branch-based
  Pages preview is the default behavior.
- `[vars]` block — not used; build-time env (`VITE_WEB_AUTH_MODE`) is set in
  the GitHub workflow, not in `wrangler.toml`, to keep secrets out of repo.

---

## C2. `apps/web/public/_headers`

### Shape

```
/*
  Content-Security-Policy: <full CSP per Decision 3 Candidate A.1>
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

### CSP Body (frozen)

```
default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data: https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests
```

(Single line per `_headers` syntax. Whitespace per Cloudflare Pages spec.)

### Acceptance Criteria

- **AC-C2-1**: File exists at `apps/web/public/_headers` (Pages
  reads `_headers` from the build output root, which Vite copies from
  `public/` verbatim).
- **AC-C2-2**: Rules apply to `/*` (all paths).
- **AC-C2-3**: CSP body MUST NOT contain `__XAI_CSP_NONCE__` literal or any
  `'nonce-…'` directive (Decision 3 Candidate A.1 = strip nonce dance).
- **AC-C2-4**: CSP body covers all non-`'self'` origins used by the SHIPPED
  bundle: `https://fonts.googleapis.com` (CSS), `https://fonts.gstatic.com`
  (font files). Any future third-party origin must be added explicitly.
- **AC-C2-5**: Non-CSP headers match `apps/web/deploy/security/headers.ts`
  `buildSecurityHeaders` defaults verbatim (HSTS / nosniff / DENY / strict-origin /
  Permissions-Policy with the same disabled-feature list).
- **AC-C2-6**: No CSP `'unsafe-inline'`, no `'unsafe-eval'`, no `*` wildcard.
- **AC-C2-7**: Verify gate confirms via `curl -I https://<project>.pages.dev/`
  that the live CSP header matches this file byte-for-byte.

### Strictness delta (acknowledged)

Vs the SHIPPED `web-security-csp-sentry` per-request-nonce posture, this
`_headers` CSP:

- DROPS `'nonce-<value>'` from `script-src` / `style-src`.
- DROPS `report-uri` / `report-to` (no Worker endpoint to receive reports
  this row).

Recorded in ADR-0008 §Decision 3 as security debt. Follow-up trigger noted.

---

## C3. `apps/web/index.html` placeholder strip mechanism

### Contract

`apps/web/index.html` line 2 and line 6 currently contain
`__XAI_CSP_NONCE__` placeholders. The production build pipeline (Vite +
build-time transform — mechanism finalized in feature-build P2) MUST
ensure `dist/index.html` contains NEITHER the literal `__XAI_CSP_NONCE__`
NOR any `data-csp-nonce` / `meta name="xai-csp-nonce"` attribute referencing
a nonce, because no per-request nonce is delivered under static hosting.

### Acceptance Criteria

- **AC-C3-1**: `grep -F "__XAI_CSP_NONCE__" apps/web/dist/index.html`
  returns no matches after build.
- **AC-C3-2**: `apps/web/src/security/nonce.ts` (`readRuntimeNonce`) returns
  null (or an explicit "static mode" sentinel) when no nonce meta / attr is
  present. The function already returns `null` on absence (verified at plan
  time by reading lines 9-22 of `nonce.ts`), so this is no-change.
- **AC-C3-3**: No caller of `requireRuntimeNonce` (which throws
  `missing_runtime_nonce`) fires under the production build path. Feature-build
  P2 audit greps `packages/plugin-web-*/src/` and `apps/web/src/` for callers;
  if any caller fires in the production code path, the row BLOCKS back to plan
  for a sub-decision.
- **AC-C3-4**: Mechanism is reproducible (deterministic — same input HTML →
  same stripped output) and visible in the build log (the chosen mechanism
  emits a log line confirming the substitution happened).

### Open Mechanism Choice (deferred to feature-build P2)

The exact mechanism — Vite `transformIndexHtml` plugin / Rollup `generateBundle`
hook / post-build Node script — is left to feature-build P2. P2 picks the
least-invasive option and records the choice in dev_log. The contract is
above — any mechanism that satisfies AC-C3-1..C3-4 is acceptable.

---

## C4. `.github/workflows/deploy-web.yml`

### Triggers

```yaml
on:
  push:
    branches: [main]
  pull_request:
```

### Jobs (one job)

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9.0.0
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @repo/web build
        env:
          VITE_WEB_AUTH_MODE: mock-authenticated
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          wranglerVersion: 3.114.0
          workingDirectory: apps/web
          command: pages deploy ./dist --project-name=xai-web-console --branch=${{ github.head_ref || github.ref_name }}
```

(The above is illustrative; feature-build P3 finalizes the exact YAML against
the live actionlint / GitHub Actions schema.)

### Acceptance Criteria

- **AC-C4-1**: File exists at `.github/workflows/deploy-web.yml`.
- **AC-C4-2**: Uses `cloudflare/wrangler-action@v3` (NOT the deprecated
  `cloudflare/pages-action`).
- **AC-C4-3**: Action version pinned to `@v3` (renovate-friendly major pin).
  `wranglerVersion: 3.114.0` is also explicitly set.
- **AC-C4-4**: Secrets referenced via `${{ secrets.CLOUDFLARE_API_TOKEN }}` and
  `${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`. NO secret values inline.
- **AC-C4-5**: No Supabase secret is referenced (Decision 2 = mock-authenticated).
- **AC-C4-6**: No Sentry secret is referenced (Decision 4 = vanilla build).
- **AC-C4-7**: `node-version-file: .nvmrc` (does not inline a Node version).
- **AC-C4-8**: pnpm pinned to `9.0.0` matching root `package.json`
  `packageManager` field.
- **AC-C4-9**: `pnpm install --frozen-lockfile` (deterministic install).
- **AC-C4-10**: Build step sets `VITE_WEB_AUTH_MODE: mock-authenticated` in
  the `env:` block, NOT as a hard-coded value in a script.
- **AC-C4-11**: Deploy step uses `pages deploy ./dist --project-name=xai-web-console
  --branch=${{ github.head_ref || github.ref_name }}` — branch is dynamic
  (head_ref for PRs, ref_name for push). Production deploys land on the
  `main` branch on Cloudflare; PR previews land on per-PR branches.
- **AC-C4-12**: `actionlint` (when invoked locally on the file) reports no
  errors. When actionlint is unavailable, the workflow MUST validate against
  the [GitHub Actions workflow schema](https://json.schemastore.org/github-workflow.json).
- **AC-C4-13**: Workflow outputs `pages-deployment-id`,
  `pages-deployment-alias-url`, and `deployment-url` from the action, and
  echoes them into `$GITHUB_STEP_SUMMARY` for human inspection.

### Permission scope

The workflow does NOT need `contents: write` (no auto-commits). Default
read-only token is sufficient. Cloudflare permissions are derived from
`CLOUDFLARE_API_TOKEN`, scoped to `Cloudflare Pages:Edit` on the project's
account.

---

## C5. `docs/adr/0008-cloudflare-deploy-target-and-csp.md`

### Required sections

| § | Content |
|---|---------|
| S1 | Header table — 状态: Accepted; 日期: 2026-05-24; 决策者: Jinlong + Claude (feature-plan → feature-review); Supersedes: none; Superseded by: none. |
| S2 | 背景 — XAI Web Console SHIPPED, no production URL; user requirement; cites brief + ADR-0007 + ADR-0006 + ADR-0003 + roadmap manifest. |
| S3 | 方案 — Decisions 1+2+3+4 as four sub-decisions; each with options + tradeoffs (mirrors discovery-review §3..§6). |
| S4 | 决策 — Pages + mock-authenticated + strip-nonce + vanilla-build. 15 Frozen Assumptions inline (from design.md). |
| S5 | 后果 — Positive / Negative / Deferred (CSP strictness delta, future Workers flip, future Sentry sourcemap row, future custom domain row, future real auth row). |
| S6 | 实施规则 — `wrangler.toml` shape; `_headers` content; CI workflow shape; secret-naming; runbook anchors; `apps/web/deploy/security/` namespace coexistence note. |
| S7 | 相关 — Links to ADR-0003 / ADR-0006 / ADR-0007 / feature-brief / discovery-review / runbook / wrangler-action docs. |

### Acceptance Criteria

- **AC-C5-1**: File exists at `docs/adr/0008-cloudflare-deploy-target-and-csp.md`.
- **AC-C5-2**: `状态 = Accepted` in the header table.
- **AC-C5-3**: All 7 sections (S1..S7) present in order.
- **AC-C5-4**: Decisions 1+2+3+4 each have a single selected option + rejected
  alternatives + a one-line rationale.
- **AC-C5-5**: CSP strictness delta is explicitly named (not implied).
- **AC-C5-6**: 15 frozen assumptions from design.md are restated inline
  (one-to-one, not paraphrased).
- **AC-C5-7**: `Supersedes: none` (additive — refines ADR-0007).
- **AC-C5-8**: All cross-doc links resolve (manual reviewer check).
- **AC-C5-9**: ADR refrains from editing `docs/workflow/roadmap/xai-web-console.md`
  (manifest is roadmap-loop's territory; this ADR is operational, not
  roadmap-driving).

---

## C6. `docs/runbooks/cloudflare.md`

### Required sections

| § | Content |
|---|---------|
| 1 First-time Setup | `wrangler login`; `wrangler pages project create xai-web-console`; capture `account_id`; create API token with `Cloudflare Pages:Edit` permission; register `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in GitHub repo Secrets. Copy-pasteable commands. |
| 2 Rotate Secrets | Revoke old token in Cloudflare dashboard; create new token with same permission; update GitHub Secret; trigger redeploy by pushing an empty commit to `main` (or re-running the latest workflow). |
| 3 Rollback | Two paths: (a) Cloudflare Pages dashboard → Deployments → "Rollback to this deployment" one-click; (b) `wrangler pages deployment list --project-name xai-web-console` + `wrangler pages deployment activate <deployment-id>`. |
| 4 Manual Deploy | `pnpm --filter @repo/web build && cd apps/web && wrangler pages deploy dist --project-name=xai-web-console --branch=main`. Requires operator `wrangler login`. |
| 5 Quota Monitoring | Free tier: 500 builds/month + 100GB bandwidth + 20K files/deploy + 25 MiB per file. First lever when approaching cap: `paths-ignore: ['docs/**', '**/*.md']` on the workflow's `pull_request` trigger. |
| 6 Disaster Recovery | If Cloudflare account is locked / lost: re-point `CLOUDFLARE_ACCOUNT_ID` secret to a fresh account; re-create the Pages project under the new account; no repo changes required beyond the secret update. |

### Acceptance Criteria

- **AC-C6-1**: File exists at `docs/runbooks/cloudflare.md`.
- **AC-C6-2**: All 6 sections present in order.
- **AC-C6-3**: Every command in the runbook is copy-pasteable (no `<placeholder>`
  that the operator needs to deduce — either it's a literal token name or it's
  documented in the same section).
- **AC-C6-4**: Required GitHub Secrets are named exactly:
  `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (matching the workflow).
- **AC-C6-5**: Cloudflare API token scope is documented:
  `Cloudflare Pages:Edit` on the account.

---

## C7. `.gitignore` (root) augment

### Acceptance Criteria

- **AC-C7-1**: After P2, root `.gitignore` contains a `.dev.vars` line.
- **AC-C7-2**: After P2, root `.gitignore` contains a `.wrangler/` line.
- **AC-C7-3**: Existing entries (`node_modules`, `dist`, `.env*`, etc.) remain
  unchanged.
- **AC-C7-4**: `git status` after P2 shows zero `.dev.vars` / `.wrangler/`
  paths as tracked or untracked at the repo root.

---

## C8. `.nvmrc` (root, new)

### Acceptance Criteria

- **AC-C8-1**: File exists at the repo root containing exactly `22\n` (Node 22
  LTS).
- **AC-C8-2**: Root `package.json` `engines.node >= 18` remains compatible with
  Node 22.
- **AC-C8-3**: CI workflow consumes `.nvmrc` via
  `actions/setup-node@v4` `node-version-file: .nvmrc`.

---

## C9. Verify-time evidence file

### Path

`docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md`

### Content shape

| § | Content |
|---|---------|
| Live URL | `https://xai-web-console.pages.dev/` (or whatever the first deploy returns). |
| `curl -I` for `/` | Full HTTP response headers including CSP / HSTS / nosniff / DENY / Referrer-Policy / Permissions-Policy. |
| `curl -I` for `/app` | Full HTTP response headers — expected 200, `Content-Type: text/html`. |
| `curl -I` for `/app/tasks` | Full HTTP response headers — expected 200, SPA fallback to `index.html`. |
| Bundle stats | Total `dist/` size, file count, largest file + its byte count. |
| Secret-scan | Output of `grep -RE 'SUPABASE_|SENTRY_|CLOUDFLARE_' apps/web/dist || echo clean`. |
| Manual smoke checklist | Real-browser checks: rail nav between modules; dashboard widget state round-trips localStorage. |
| CSP delta acknowledgement | Confirm CSP body matches `_headers` byte-for-byte and that the strictness delta vs SHIPPED `web-security-csp-sentry` is recorded in ADR-0008 §3. |
| Cross-vendor cold-read | Codex (or Cursor fallback) verdict + summary. |

### Acceptance Criteria

- **AC-C9-1**: File exists after Phase 5 verify-gate run.
- **AC-C9-2**: Live URL is reachable at evidence-write time (200 OK on `/`).
- **AC-C9-3**: Curl outputs are pasted verbatim, not summarized.
- **AC-C9-4**: Secret-scan returns `clean` or no matches.
- **AC-C9-5**: Cross-vendor verdict is `CONFIRMED_READY_TO_SHIP` (or
  documented BLOCKED with a remediation plan).

---

## C10. Out-of-scope contracts (explicitly NOT delivered)

| Surface | Not delivered | Future row |
|---------|--------------|-----------|
| Tauri command | N/A | — |
| typed event in `@repo/core/events` | None | — |
| `@repo/plugin-web-*` package code | None | — |
| `apps/desktop/src-tauri/` Rust commands | None | — |
| `manifest.json` for a plugin | None (this is a Roadmap Anchor, not a plugin) | — |
| `apps/web/src/` code | None (deploy config + index.html placeholder strip mechanism only) | — |
| `docs/PLUGIN_MAP.md` row | Optional addition — feature-verify or ship may add an informational row to "Roadmap / CI Gate Anchors" table; not blocking. | — |
| `docs/workflow/roadmap/xai-web-console.md` edit | None (roadmap-loop territory) | — |
| Sentry sourcemap CI upload | None | `xai-web-deploy-sentry-sourcemaps` (future) |
| Custom domain DNS / TLS | None | `xai-web-custom-domain` (future) |
| Real Supabase auth productionization | None | `xai-web-real-auth-production` (future) |
| AI Chat `/api/chat` Worker | None | `xai-web-ai-chat` row #18 evolution (future) |
| E2E browser matrix testing | None | `web-deploy-ci-browser-matrix` (deferred per ADR-0007 §S5) |

---

## C11. Cross-window contract impact

**None.** No new typed events in `packages/core/src/events/`. No Tauri command
surface touched. The Web face is independent of the desktop face per ADR-0006.
