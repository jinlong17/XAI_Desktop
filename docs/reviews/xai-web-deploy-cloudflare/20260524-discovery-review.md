# Discovery Review — xai-web-deploy-cloudflare

> Plan-time research and option analysis for the post-roadmap operational row
> that produces the first public production URL for the SHIPPED XAI Web Console.
>
> Source brief: `docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md`
> Automation Mode: A-Claude / Verify Cross-vendor: yes / Stop Before Ship: yes
> Output ADR target: `docs/adr/0008-cloudflare-deploy-target-and-csp.md`

---

## 1. Problem Framing

`apps/web/` (`@repo/web`) is a Vite 7 + React 19 SPA that is feature-complete
on `origin/main` (24/24 roadmap rows SHIPPED per
`docs/workflow/roadmap/xai-web-console.md`). It has never been deployed: the
build is only reachable today via `pnpm --filter @repo/web dev` on a developer
machine. The user requirement is a publicly reachable URL with PR previews,
hosted on Cloudflare, gated through GitHub Actions, with secrets never entering
the repo and a runbook covering rotation / rollback / quotas.

The feature is **not a plugin slice**. It is a roadmap / CI gate anchor row in
the spirit of `packages/xai-web-build-form-adr/` and `packages/xai-web-event-bus/`
docs anchors: it owns deploy configuration + a CI workflow + an ADR + a runbook,
not executable business code.

Four critical up-front decisions must be resolved (per brief §6) before any
file is committed:

1. Cloudflare Pages vs Workers Static Assets.
2. Auth posture for the public URL (mock-authenticated vs real Supabase).
3. CSP nonce treatment under static hosting (new finding — `apps/web/index.html`
   lines 2 and 6 carry `__XAI_CSP_NONCE__` placeholders that cannot be
   per-request-injected by pure-static Pages).
4. CI build command — vanilla `build` vs `build:secure` (8-step Sentry
   sourcemap-upload chain).

---

## 2. Plan-time Codebase Audit (resolves Brief §15 open questions)

### Q15.1 — `.nvmrc` presence

`Glob .nvmrc` at the repo root → **absent** (only an unrelated copy lives at
`node_modules/.pnpm/is-generator-function@1.1.0/node_modules/is-generator-function/.nvmrc`).
Root `package.json` declares `"engines": { "node": ">=18" }` and
`packageManager: "pnpm@9.0.0"`.

**Recommendation**: P2 adds a root-level `.nvmrc` pinned to `22` (Node 22 LTS is
the current default for Vite 7; matches the SHIPPED roadmap rows' CI assumption).
The deploy workflow consumes `.nvmrc` via `actions/setup-node@v4` with
`node-version-file: '.nvmrc'`.

### Q15.4 — `apps/web/deploy/` folder content audit

`Glob apps/web/deploy/**` returns:

```
apps/web/deploy/security/headers.ts
apps/web/deploy/security/cspEndpoint.ts
apps/web/deploy/security/headers.test.ts
apps/web/deploy/security/cspEndpoint.test.ts
apps/web/deploy/security/rumEndpoint.ts
apps/web/deploy/security/rumEndpoint.test.ts
```

Read of each file: these are TypeScript **library** modules belonging to the
SHIPPED `web-security-csp-sentry` row — they export pure functions
(`buildSecurityHeaders`, `ingestCspReport`, `ingestRumPayload`) that compose CSP
policies / parse CSP reports / parse RUM payloads. They re-import from
`apps/web/src/security/cspPolicy.ts` (which expects a per-request `nonce` arg).

**Finding**: this folder is NOT a competing Cloudflare deploy artifact. It is
a `deploy/` library namespace owned by the previous CSP+Sentry security row,
named for the runtime layer it targets (any future endpoint / Worker that wants
to deliver the canonical CSP header). It does NOT contain `wrangler.toml`,
GitHub Actions YAML, or vendor-specific deploy code. **Decision**: leave it
untouched. The new `apps/web/wrangler.toml` (Phase P2) sits next to
`vite.config.ts` at `apps/web/wrangler.toml`, not inside `apps/web/deploy/`,
to keep wrangler config at the canonical location and avoid mistaking it for
the security library's namespace. ADR-0008 records this with a one-paragraph
note so future readers know the two `deploy/`-shaped artifacts are distinct.

### Q15.2 — Cloudflare account ownership / OAuth path

Cannot be resolved at plan time from inside this repo. ADR-0008 records that
account choice happens when the human operator (Jinlong) first runs `wrangler
pages project create` and the project's "Account" determines the
`account_id` we put into `CLOUDFLARE_ACCOUNT_ID`. The runbook §First-time
Setup documents the exact command sequence.

### Q15.3 — Sentry DSN / auth token for `build:secure`

Out of scope this row (per Decision 4 = A). Captured as a "follow-up row"
note in ADR-0008 §Decision 4.

### Q15.5 — Cross-vendor verifier order

Per roadmap manifest line 10: primary verifier = Codex (gpt-5.5-thinking,
effort=medium); fallback = Cursor. Confirmed at verify gate time, not plan
time.

---

## 3. Decision 1 — Deploy target: Pages vs Workers Static Assets

### Candidate A — Cloudflare Pages

**Mechanism.** `wrangler.toml` declares `pages_build_output_dir = "./dist"`
(see Cloudflare's [Pages wrangler config docs](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
— the `pages_build_output_dir` key is the canonical signal that the project
is a Pages project, not a Workers project). GitHub Action invokes
`wrangler-action@v3` with `command: pages deploy ./dist --project-name=<name>`.
PR previews are first-class — Pages auto-creates a preview URL per branch
deployment.

**Pros:**
- Free-tier static; one config line; first-class PR previews built into
  `wrangler-action@v3` (no extra config).
- `apps/web/` is fully static (Vite output: HTML + JS chunks + CSS — no SSR,
  no edge functions today).
- The deprecated `cloudflare/pages-action` was retired in favor of
  `cloudflare/wrangler-action@v3` — the brief's "NOT the legacy pages-action"
  constraint maps cleanly here.
- Free-tier quota: 500 builds/month + 100GB bandwidth/month + 20K files/deploy
  + 25 MiB max file size. Generous for our anticipated size.

**Cons:**
- Future `/api/chat` AI Chat Worker (out of scope — `xai-web-ai-chat` row #18
  SHIPPED with `window.claude.complete` as a typed no-op) lives in a separate
  Workers project. The migration cost is a single config swap when AI Chat
  backend lands. We accept this future cost in writing in ADR-0008.
- No per-request edge handler unless we add Pages Functions, which we
  explicitly do not (see Decision 3).

### Candidate B — Workers Static Assets

**Mechanism.** `wrangler.toml` declares `[assets] directory = "./dist"` +
`not_found_handling = "single-page-application"`. The Worker can co-locate
future `/api/*` handlers (see Cloudflare's
[Workers Static Assets docs](https://developers.cloudflare.com/workers/static-assets/)).

**Pros:**
- SPA fallback is a native flag (`not_found_handling =
  "single-page-application"`).
- Future AI Chat backend lives in the same project — no migration.
- Per-request capability if we ever want a Worker-side nonce injection
  (relevant to Decision 3 Option B).

**Cons:**
- More config surface; quotas billed in Workers requests (paid units), not
  Pages builds (free-tier).
- We have no near-term planned `/api/*` row — the AI Chat backend is on the
  "deferred" list of follow-up rows.

### Candidate C — External vendor (Vercel / Netlify / Render / GitHub Pages)

Out of scope by user directive ("Cloudflare"). Not analyzed.

### Recommendation — Pages (Candidate A)

- The user brief recommends Pages; the codebase is fully static today; the
  AI Chat backend is explicitly out-of-scope; the migration cost to Workers
  Static Assets later is a one-line config swap.
- ADR-0008 records the **deferred trigger**: when `xai-web-ai-chat` row reaches
  feature-plan for a real LLM backend (currently typed no-op per ADR-0007 §S5),
  re-open this ADR (or supersede with an ADR-0009) to flip to Workers Static
  Assets.

---

## 4. Decision 2 — Auth posture for the public URL

### Candidate A — `VITE_WEB_AUTH_MODE=mock-authenticated`

**Mechanism.** Vite consumes the env var at build time. `apps/web/`'s
`dev:mock-auth` script already wires this for local dev (per
`apps/web/package.json` line 8: `dev:mock-auth: VITE_WEB_AUTH_MODE=mock-authenticated
vite --port 3000`). The GitHub Action sets the same env var in its `build`
step so the production bundle ships with the same flag.

**Pros:**
- Zero secret management. No Supabase keys leave the developer machine.
- All 24 modules render against seed data — `xai-web-board-core` seed
  (`packages/plugin-web-board-core/src/seed/board-data.ts`) populates first-run
  state via the SHIPPED persistence registry.
- Matches the user's "shareable demo URL" intent.

**Cons:**
- Visitors cannot save state across browsers / devices (localStorage only).
  This is the explicit "public demo" trade.
- Once we add real auth, this flag goes away — see Decision 2 follow-up.

### Candidate B — Real Supabase auth

**Mechanism.** Copy `apps/web/.env.local` Supabase URL + anon key into both
GitHub Secrets and Cloudflare Pages env vars; flip the build flag to
`production`.

**Pros:**
- Real cross-device persistence.

**Cons:**
- Widens the secret surface significantly. The SHIPPED
  `@repo/web-auth-device-session` row is device-session-only, not full
  Supabase Auth UI. Real auth productionization is a separate row.
- Out of scope this row per brief §4.

### Recommendation — Mock-authenticated (Candidate A)

- Matches user brief; zero secret-management cost; ADR-0008 §Decision 2
  records a follow-up trigger: when a real-auth productionization row
  reaches feature-plan, that row owns flipping this flag.

---

## 5. Decision 3 — CSP nonce treatment under static hosting *(new finding)*

### Constraint discovered at plan time

`apps/web/index.html` line 2 (`data-csp-nonce="__XAI_CSP_NONCE__"`) and line 6
(`<meta name="xai-csp-nonce" content="__XAI_CSP_NONCE__">`) carry build-time
placeholder tokens. `apps/web/src/security/nonce.ts` (`readRuntimeNonce`)
reads these at runtime to enable nonce-tagged inline styles via
`createNonceStyleElement`. `apps/web/src/security/cspPolicy.ts`
(`buildCspPolicy`) bakes the nonce into the CSP `script-src` and `style-src`
directives.

**Pages-on-static cannot inject per-request nonces.** A pure-static deploy
serves the same `index.html` to every visitor. The placeholder token would
either:

- (i) remain literal in production (string `__XAI_CSP_NONCE__` reaches the
  browser, the runtime nonce reader returns the literal string as if it
  were a real nonce → CSP is then bypassable by any attacker who knows the
  literal), or
- (ii) be replaced at build time by a single fixed nonce value (defeats the
  per-request unpredictability that nonces exist to provide), or
- (iii) be replaced by a Worker / Pages Function at the edge per request
  (re-introduces Worker surface this row tried to avoid).

### Candidate A — Strip the nonce dance for static + ship `_headers`-delivered hash/domain CSP

**Mechanism.**

- At build time (or via a Vite plugin / a tiny post-build sed pass — TBD in
  feature-build P2), replace `__XAI_CSP_NONCE__` in `dist/index.html` so the
  placeholder does NOT reach the browser. Two sub-options:
  - **A.1**: Strip the meta tag and the html `data-csp-nonce` attribute
    entirely, replace with `<meta name="xai-csp-mode" content="static">` for
    runtime detection. Updates `apps/web/src/security/nonce.ts` to return
    `null` when in `static` mode and tolerate that null in the one consumer
    (`createNonceStyleElement` becomes a no-op for static deploy and the
    feature that depends on injected style is reviewed for whether it
    actually fires under static hosting).
  - **A.2**: Replace the placeholder with a stable build-time-generated
    nonce (e.g. SHA-256 of the build artifact) and propagate the same value
    into the `_headers` CSP. This preserves the **shape** of nonce-CSP
    (script-src/style-src include `'nonce-<value>'`) but the value is
    predictable per build, so the CSP must additionally include hash-based
    or strict-dynamic protection to remain meaningful.
- Deliver the CSP header via `apps/web/public/_headers` so Cloudflare Pages
  serves it on every response (per
  [Cloudflare Pages headers docs](https://developers.cloudflare.com/pages/configuration/headers/)).
- The CSP itself drops the `'nonce-…'` strictness in favor of a hash or
  domain allowlist for the two third-party origins
  (`https://fonts.googleapis.com` for the CSS, `https://fonts.gstatic.com`
  for the font files — both already in the SHIPPED `cspPolicy.ts`).

**Pros:**
- Cleanly static; no Worker layer needed.
- `_headers` is a first-class Pages feature; rules apply at the edge before
  the response body is delivered.
- Preserves most of the SHIPPED CSP posture (default-src 'self', img-src
  data + blob, object-src 'none', frame-ancestors 'none', etc.).

**Cons:**
- Strictness delta vs the SHIPPED per-request nonce posture:
  - Per-request nonce → unique value per HTML response, defeats reflected-XSS
    that can't read the response.
  - Build-time stable nonce or no nonce → an attacker who can inject script
    into a page can use the known value (or no nonce required for inline)
    to bypass the script-src restriction.
- The SHIPPED `web-security-csp-sentry` row was authored assuming runtime
  nonce. Recording the delta as a security debt note in ADR-0008 is required.

### Candidate B — Workers Static Assets + thin nonce-injecting Worker

**Mechanism.** Route HTML responses through a Worker that substitutes the
`__XAI_CSP_NONCE__` token at request time, generates a fresh nonce per
response, and sets the matching CSP header. Static asset responses pass
through unchanged.

**Pros:**
- Preserves the SHIPPED per-request strictness.
- Foundation for the future AI Chat `/api/chat` row.

**Cons:**
- Re-introduces the Worker surface that flipped Decision 1 to "Pages, defer
  Workers". Reopens Decision 1.
- Worker requests are billed (paid units after free tier), unlike Pages
  builds.
- Increases the surface that a future contributor must understand to ship
  a doc-only change.

### Candidate C — Accept Pages + no nonce + tighter `_headers` CSP (pragmatic static answer)

**Mechanism.** Strip the nonce placeholders from `dist/index.html` entirely.
Ship a strict but nonce-less CSP via `_headers`:

```
script-src 'self'
style-src 'self' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com data:
connect-src 'self'
img-src 'self' data: blob:
object-src 'none'
base-uri 'self'
frame-ancestors 'none'
form-action 'self'
upgrade-insecure-requests
```

(Note: this CSP requires that there are NO inline scripts / NO inline styles
in the production `dist/`. Vite by default emits external `<script type="module">`
tags, but any `style-loader` / `vite:css` inline-injection path must be
audited. Verify-gate evidence file records the `curl -I` CSP header value
plus the `dist/` greps for inline `<script>` / `<style>` tags.)

**Pros:**
- Simplest possible static deploy. No build-time nonce-substitution complexity.
- Predictable CSP across builds.

**Cons:**
- Same strictness delta as Candidate A.
- If any module's runtime currently relies on `createNonceStyleElement` for
  late-injected styles, that path is silently broken under static. Audit
  required.

### Recommendation — Candidate A.1 (strip the nonce dance + `_headers` CSP)

- A.1 is the simplest path that preserves the rest of the SHIPPED CSP posture.
- Strictness delta is recorded explicitly in ADR-0008 §Decision 3 as a
  security debt note, with the follow-up trigger: when the AI Chat backend
  row needs a Worker layer anyway (per Decision 1 deferred trigger), revisit
  Decision 3 and consider Candidate B to restore per-request nonces.
- Feature-build P2 also performs a **runtime audit**: grep
  `packages/plugin-web-*/src/` and `apps/web/src/` for callers of
  `createNonceStyleElement` / `requireRuntimeNonce`. If any caller is hit
  under static deploy, fall through to a follow-up sub-decision (either
  drop the caller, fall back to non-nonce style emission, or escalate to
  Candidate B).
- Inputs from `apps/web/deploy/security/headers.ts` are noted but not
  consumed at runtime: that library exports `buildSecurityHeaders` for a
  hypothetical edge handler. In Pages-static mode it is dead code at runtime
  (compiled but unreachable); ADR-0008 records this as accepted tech debt.

### Sub-decision — `_headers` file shape

P2 ships `apps/web/public/_headers` with at minimum:

```
/*
  Content-Security-Policy: <full CSP per A.1>
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

The non-CSP headers come verbatim from `apps/web/deploy/security/headers.ts`
to preserve parity with the SHIPPED row's design.

---

## 6. Decision 4 — CI build command: vanilla `build` vs `build:secure`

### Candidate A — Vanilla `pnpm --filter @repo/web build`

**Mechanism.** CI invokes only the Vite build. Sourcemaps are emitted with
`sourcemap: "hidden"` (per `apps/web/vite.config.ts`) — they exist on disk
but are NOT referenced from the bundled JS, so browsers cannot fetch them.

**Pros:**
- First-deploy friendly; zero new secrets.
- Sourcemaps stay private (not uploaded anywhere, not fetchable by visitors).
- The 8 `sourcemaps:*` scripts in `apps/web/package.json` stay tested-but-unused.

**Cons:**
- Sentry stack traces in production will be minified — debugging requires
  re-uploading sourcemaps manually or via a follow-up row.

### Candidate B — `pnpm --filter @repo/web build:secure`

**Mechanism.** Runs the 8-step Sentry sourcemap upload chain:
`build → release:create → release:set-commits → debugids:inject → upload →
validate → finalize → clean → assert-clean`. Requires `SENTRY_AUTH_TOKEN`
to be available in CI env.

**Pros:**
- Production Sentry events come with un-minified stack traces.

**Cons:**
- Requires a new GitHub Secret (`SENTRY_AUTH_TOKEN`) — widens secret surface.
- Couples this row's deploy to Sentry availability.
- The brief explicitly notes "follow-up row owns full secure-build CI parity".

### Recommendation — Candidate A (vanilla `build`)

- First deploy gets to public URL with minimal secret surface.
- ADR-0008 §Decision 4 records the follow-up trigger: a future
  `xai-web-deploy-sentry-sourcemaps` row owns flipping to `build:secure`
  with `SENTRY_AUTH_TOKEN` wired.

---

## 7. Wrangler version pin

`cloudflare/wrangler-action@v3` ships its own bundled wrangler unless pinned.
The brief requires "Pin to `cloudflare/wrangler-action@v3` exact tag". We pin
the action to `@v3` (compatible with all v3.x). Action invocation also lets
us pass `wranglerVersion: "3.x"` to lock the bundled wrangler. Per the
[wrangler-action README](https://github.com/cloudflare/wrangler-action), v3.81.0+
exposes `pages-deployment-id` / `pages-deployment-alias-url` outputs which we
capture for the deploy-evidence file. Recommendation: pin
`wranglerVersion: "3.114.0"` (current as of 2026-05) and let a renovate-style
follow-up row bump it.

---

## 8. Phase Decomposition

Per brief §"Phasing Constraints", 5 phases (Phase 5 = verify-only):

### Phase P1 — ADR-0008 + 四件套 docs anchor

- Author `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (Status=Accepted
  on first write — same pattern as ADR-0007).
- Resolve Decisions 1 + 2 + 3 + 4 with frozen-assumption blocks.
- Initialize `packages/xai-web-deploy-cloudflare/docs/design.md` /
  `api.md` / `test.md` / `dev_log.md` (this Plan turn writes them).
- Smoke: docs/text-only; lint via `pnpm format --check` (optional);
  no executable file changes.

### Phase P2 — `apps/web/wrangler.toml` + `.gitignore` augment + `apps/web/public/_headers`

- Create `apps/web/wrangler.toml`:
  ```toml
  name = "xai-web-console"
  compatibility_date = "2026-05-24"
  pages_build_output_dir = "./dist"
  ```
  (`name` doubles as the Pages project name — confirmed at first
  `wrangler pages project create` time by the human operator.)
- Create `apps/web/public/_headers` per §5.
- Augment root `.gitignore`: add `.dev.vars`, `.wrangler/`.
- Add `.nvmrc` at repo root pinned to `22` (resolves Q15.1).
- (If runtime audit per §5 surfaces broken nonce callers) — apply minimal
  fixes; if scope balloons, BLOCK back to feature-plan.
- Smoke: `pnpm --filter @repo/web build` continues to pass; `wrangler
  --version` reports a v3.x version; `wrangler deploy --dry-run` validates
  `wrangler.toml` syntax (the `wrangler pages deploy --dry-run` flag exists
  in wrangler v3 — verify against installed version).
- Acceptance: bundle size + largest chunk recorded; `dist/` greps clean for
  `SUPABASE_` / Sentry DSN / `CLOUDFLARE_` literals.

### Phase P3 — `.github/workflows/deploy-web.yml`

- Workflow triggers: `push` on `main` → production deploy; `pull_request` →
  preview deploy.
- Steps:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` with `node-version-file: '.nvmrc'`
  3. Install pnpm via `pnpm/action-setup@v4` (pin to v9.0.0 from root
     `packageManager`).
  4. `pnpm install --frozen-lockfile`
  5. `pnpm --filter @repo/web build` with `env: VITE_WEB_AUTH_MODE:
     mock-authenticated`.
  6. `cloudflare/wrangler-action@v3` with `apiToken`, `accountId`,
     `wranglerVersion: 3.114.0`, `command: pages deploy ./apps/web/dist
     --project-name=xai-web-console --branch=${{ github.head_ref ||
     github.ref_name }}`.
- Outputs captured: `pages-deployment-id`, `pages-deployment-alias-url`,
  `deployment-url`. Echo into `$GITHUB_STEP_SUMMARY` for human inspection.
- Smoke: `actionlint` clean (the `actionlint` Homebrew formula is the
  reference linter; the workflow file is hand-validated against the
  [GitHub Actions schema](https://json.schemastore.org/github-workflow.json)
  when actionlint is unavailable).

### Phase P4 — `docs/runbooks/cloudflare.md`

- §First-time Setup: `wrangler login` (operator), `wrangler pages project
  create xai-web-console`, capture `account_id`, register
  `CLOUDFLARE_API_TOKEN` (with `Cloudflare Pages:Edit` permission on the
  account) + `CLOUDFLARE_ACCOUNT_ID` in GitHub repo Secrets.
- §Rotate Secrets: revoke old API token in Cloudflare dashboard; create
  new token with same permissions; update GitHub Secret; redeploy by
  push to `main`.
- §Rollback: Cloudflare Pages dashboard → Deployments → Select previous
  → "Rollback to this deployment" (one click); or
  `wrangler pages deployment list --project-name xai-web-console` +
  `wrangler pages deployment activate <deployment-id>`.
- §Manual Deploy: `pnpm --filter @repo/web build && cd apps/web &&
  wrangler pages deploy dist --project-name=xai-web-console --branch=main`.
- §Quota Monitoring: 500 builds/month free tier. First lever when
  approaching cap: disable preview deploys on docs-only PRs by adding a
  `paths-ignore: ['docs/**', '**/*.md']` filter on the workflow's `pull_request`
  trigger.
- §Disaster Recovery: if Cloudflare account is locked, the same
  `apps/web/wrangler.toml` + the same workflow can be re-pointed at a
  fresh account by rotating `CLOUDFLARE_ACCOUNT_ID` — no repo changes
  required beyond the secret update.

### Phase P5 — Verify-only gate (no commits)

- `feature-verify` runs:
  - `pnpm --filter @repo/web build` → green.
  - `pnpm --filter @repo/web test` → all pass.
  - `actionlint .github/workflows/deploy-web.yml` (or manual schema check).
  - `wrangler.toml` validation.
  - `dist/` size + largest chunk recorded.
  - Live deploy reachable: `curl -I https://<project>.pages.dev/` → 200.
  - `curl -I https://<project>.pages.dev/app/tasks` → 200 (SPA fallback).
  - CSP header on live URL audited vs SHIPPED `web-security-csp-sentry`
    contract; delta recorded in ADR-0008 §Decision 3.
  - `dist/` greps clean for `SUPABASE_` / Sentry DSN / `CLOUDFLARE_`
    literals.
  - Evidence file `docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md`
    captures the live URL + curl headers + smoke checklist.

### Phase P5 fallback — secrets not yet configured

**Gate**: P5 requires `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` to be
present in GitHub repo Secrets before the first production deploy can
succeed. If those secrets are not yet configured when `feature-auto-build`
reaches P5, the plan instructs:

- **Option (a)**: Manual `wrangler deploy` fallback per runbook §Manual
  Deploy. Operator runs the command locally (with their own auth via
  `wrangler login`), captures the live URL, records the evidence file.
  Feature-build continues to READY_FOR_VERIFY; the GitHub-Action-driven
  deploy is exercised post-ship on the next `main` push.
- **Option (b)**: BLOCKED handoff. dev_log Status Panel flips to
  `BLOCKED + Suggested Next: feature-plan` with `Blockers: GitHub Secrets
  CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID not configured`. The user
  configures secrets, then resumes by re-dispatching feature-build.

This gate is surfaced explicitly in dev_log Status Panel as
`Pre-deploy Gate: secrets-configured (yes/no/unknown)`.

---

## 9. Dependencies and Reuse Audit

| Dependency | Path / Source | State | Use |
|------------|---------------|-------|-----|
| `@repo/web` | `apps/web/` | SHIPPED (24/24 roadmap rows) | Build artifact `apps/web/dist/` is the deploy payload. |
| `cloudflare/wrangler-action@v3` | GitHub Marketplace | External, pinned `@v3` | The GitHub Action that runs `wrangler` in CI. |
| `wrangler` CLI | npm `wrangler` (via wrangler-action's bundled copy) | External, pinned `3.114.0` | Local validation + CI deploy. |
| `pnpm/action-setup@v4` | GitHub Marketplace | External, pinned `@v4` | Installs pnpm@9.0.0 in CI. |
| `actions/setup-node@v4` | GitHub Marketplace | External, pinned `@v4` | Sets Node version from `.nvmrc`. |
| `actions/checkout@v4` | GitHub Marketplace | External, pinned `@v4` | Checks out repo. |
| ADR-0007 | `docs/adr/0007-xai-web-console-build-form.md` | Accepted | Predecessor; this ADR-0008 refines ADR-0007 by adding the deploy face (does not overrule). |
| ADR-0006 | `docs/adr/0006-web-face-hybrid-reuse-boundary.md` | Accepted | Web face boundary; deploy config is host-shell-adjacent, not plugin code — within ADR-0006's permitted Web-face independence. |
| ADR-0003 | `docs/adr/0003-three-faces-architecture.md` | Accepted | Confirms no Tauri / no plugin code touched. |
| `web-security-csp-sentry` SHIPPED row | `packages/xai-web-*` family (TBD which specific row owns this) + `apps/web/src/security/*` + `apps/web/deploy/security/*` | SHIPPED | CSP contract this row must consult (Decision 3). |

### Plugin State Check (PLUGIN_MAP.md)

All 24 `xai-web-*` rows are SHIPPED or READY_TO_SHIP per the manifest. No
plugin is In-Dev or Migrating relative to this row → **No mocks required**.
The carry-over deps `@repo/plugin-console` + `@repo/plugin-productivity`
in `apps/web/package.json` are non-blocking; ADR-0007 §S5 already records
them as deferred cleanup.

---

## 10. Risks and Open Questions

Re-summarized from the brief plus discovery findings:

| ID | Risk | Severity | Mitigation |
|----|------|----------|-----------|
| R1 | CSP regression vs SHIPPED `web-security-csp-sentry` row | High | Decision 3 + ADR-0008 §CSP; verify gate adds `curl -I` check on CSP header content; runtime audit in P2 surfaces broken callers. |
| R2 | Secret leak in `dist/` (sourcemaps, env injection) | High | `vite.config.ts` already uses `sourcemap: "hidden"`; verify gate greps `dist/` for `SUPABASE_` / Sentry DSN / `CLOUDFLARE_`. |
| R3 | Pages free-tier 500 builds/mo exhausted | Medium | Runbook §Quota Monitoring documents disabling preview-on-docs-only PRs lever. |
| R4 | Wrangler-action drift / breaking change | Medium | Pin `cloudflare/wrangler-action@v3` + `wranglerVersion: 3.114.0` explicitly; renovate-style follow-up row owns version bumps. |
| R5 | Build deterministic across CI vs local | Medium | `pnpm install --frozen-lockfile`; Node pinned via new `.nvmrc`; pnpm version pinned via root `packageManager`. |
| R6 | First-deploy `_headers` syntax error blocks the only path to URL | Medium | P2 includes `wrangler pages dev` local smoke (or `wrangler deploy --dry-run`); runbook §Manual Deploy provides the rollback path. |
| R7 | Runtime nonce callers break under static deploy | High | P2 runtime audit: grep `packages/plugin-web-*/src/` + `apps/web/src/` for `createNonceStyleElement` / `requireRuntimeNonce`; surface count to feature-review; if any caller fires under static, BLOCK back to feature-plan. |
| R8 | GitHub Secrets not configured at P5 deploy time | Medium | Phase 5 fallback recorded above (Option a = manual deploy; Option b = BLOCKED handoff). |
| R9 | Codex cross-vendor verifier quota exhausted | Low | Cursor is the documented fallback per roadmap manifest line 10. |

### Open Questions (carried into ADR-0008 / dev_log)

- **OQ1**: Cloudflare account ownership (Q15.2) — resolved by the human
  operator at first `wrangler pages project create` time. Runbook §First-time
  Setup documents the exact procedure.
- **OQ2**: Final wrangler version pin (`3.114.0` is the planning-time
  current; feature-build P2 confirms against `wrangler --version` at
  install time and bumps if a newer 3.x ships before P2 runs).
- **OQ3**: Whether to extend the existing `apps/web/wrangler.toml` (if any
  partial config already exists) — `Glob apps/web/wrangler.toml` at plan
  time returned no matches, so P2 creates a fresh file.

---

## 11. ADR-0008 Outline

Recommended structure (P1 deliverable):

| Section | Content |
|---------|---------|
| S1 Header | 状态: Accepted (on first write per the project's ADR convention); 日期: 2026-05-24; 决策者: Jinlong + Claude (feature-plan → feature-review); Supersedes: none; Superseded by: none. |
| S2 背景 | XAI Web Console is SHIPPED (24/24); has never been deployed; user requirement = first public URL on Cloudflare + CI + secrets + runbook; brief at `docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md`. |
| S3 方案 | 4 sub-decisions enumerated as Decision 1 / 2 / 3 / 4 with options + tradeoffs (mirrors §3..§6 of this review). |
| S4 决策 | Pages (Candidate A for D1) + Mock auth (D2-A) + Strip nonce + `_headers` CSP (D3-A.1) + Vanilla build (D4-A). |
| S5 后果 | Positive / Negative / Deferred (CSP strictness delta, future AI Chat flip, future Sentry sourcemap row). |
| S6 实施规则 | wrangler.toml shape; `_headers` content; CI workflow shape; secret-naming convention; runbook anchors. |
| S7 相关 | Links to ADR-0003 / ADR-0006 / ADR-0007 / feature-brief / discovery-review / runbook. |

---

## 12. Cross-vendor Verify Gate Plan

Per manifest line 10:

- **Primary verifier**: Codex (gpt-5.5-thinking, effort=medium).
- **Fallback**: Cursor.

The cross-vendor pass runs at Phase 5 (feature-verify). Verifier reads:

- ADR-0008 (cold).
- `apps/web/wrangler.toml`.
- `.github/workflows/deploy-web.yml`.
- `docs/runbooks/cloudflare.md`.
- `apps/web/public/_headers`.
- The four-doc set.

And confirms:

- No contradictions with ADR-0003 / ADR-0006 / ADR-0007.
- Decision 3 CSP delta is explicitly named (not silent).
- Secrets enumeration matches the runbook.
- The deploy workflow, read cold by a different vendor, would land the same
  outcome.

---

## 13. Output Artifacts

This Plan turn produces:

- `docs/reviews/xai-web-deploy-cloudflare/20260524-discovery-review.md` (this file).
- `packages/xai-web-deploy-cloudflare/docs/design.md`.
- `packages/xai-web-deploy-cloudflare/docs/api.md`.
- `packages/xai-web-deploy-cloudflare/docs/test.md`.
- `packages/xai-web-deploy-cloudflare/docs/dev_log.md` (Status: NEEDS_REVIEW,
  Suggested Next: feature-review).

Downstream phases (feature-build) will then produce:

- `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (P1).
- `apps/web/wrangler.toml`, `apps/web/public/_headers`, `.gitignore` augment,
  root `.nvmrc` (P2).
- `.github/workflows/deploy-web.yml` (P3).
- `docs/runbooks/cloudflare.md` (P4).
- `docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md` (P5 evidence
  written by feature-verify).

---

## 14. References

- Brief: `docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md`
- ADR-0003: `docs/adr/0003-three-faces-architecture.md`
- ADR-0006: `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
- ADR-0007: `docs/adr/0007-xai-web-console-build-form.md`
- Roadmap: `docs/workflow/roadmap/xai-web-console.md`
- Cloudflare Pages wrangler config: <https://developers.cloudflare.com/pages/functions/wrangler-configuration/>
- Cloudflare Pages headers: <https://developers.cloudflare.com/pages/configuration/headers/>
- Cloudflare Pages redirects: <https://developers.cloudflare.com/pages/configuration/redirects/>
- Cloudflare Workers Static Assets: <https://developers.cloudflare.com/workers/static-assets/>
- wrangler-action GitHub: <https://github.com/cloudflare/wrangler-action>
- pages-action deprecation notice: <https://github.com/cloudflare/pages-action>
- Cloudflare CSP guidance: <https://developers.cloudflare.com/fundamentals/reference/policies-compliances/content-security-policies/>
