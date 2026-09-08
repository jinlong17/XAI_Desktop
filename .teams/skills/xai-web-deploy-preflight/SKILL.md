---
name: xai-web-deploy-preflight
description: Run the XAI Web Cloudflare deployment readiness gate before a PR preview, main production deploy, or deploy-touching Web change is treated as releasable. Use for ADR-0008 deploy/CSP checks, Cloudflare Pages preflight, wrangler configuration review, production auth env readiness, Sentry sourcemap tradeoff checks, preview URL smoke planning, and release-log/dashboard deploy evidence. Receipt-only — it does not deploy, push, rotate secrets, or claim live readiness without current URL evidence.
---

# xai-web-deploy-preflight

Project-layer gate for ADR-0008 Web deployment readiness. Use this skill when a Web change touches
Cloudflare Pages, `apps/web/wrangler.toml`, `apps/web/public/_headers`, service worker behavior,
GitHub deploy workflow, Sentry sourcemaps, production auth env, or when a Web feature is otherwise
about to rely on CI preview / production deployment evidence.

This skill is a **preflight and receipt emitter only**. It does not deploy to Cloudflare, push to
`main`, create GitHub secrets, rotate credentials, mark a release as shipped, or fabricate a live
smoke result. It records exactly what was proven and what remains operator-gated.

## Read First

- `docs/adr/0008-cloudflare-deploy-target-and-csp.md` — Cloudflare Pages target, CSP decisions, Sentry sourcemap tradeoffs, deferred browser matrix.
- `docs/runbooks/cloudflare.md` — setup, manual deploy, rollback, Pages limits, secret handling.
- `.github/workflows/deploy-web.yml` — PR preview / `main` production deploy workflow.
- `apps/web/wrangler.toml` — Cloudflare Pages project/output config.
- `apps/web/public/_headers` — static security headers and CSP.
- `apps/web/package.json` — `build`, `build:secure`, and sourcemap script chain.
- `docs/PRODUCT_MODULE_MAP.md` Web line and site line deploy boundaries.
- `AGENTS.md` / `CLAUDE.md` Agent / Skill Tracking rules when this skill or mirrors change.

## Inputs

```text
/xai-web-deploy-preflight
Web delta: <commit | range | PR | changed paths | branch diff | surface summary>
Target: preview | production | manual
Mode: check | gate
```

If `Web delta:` is omitted, infer the smallest current delta from `HEAD`, the current branch diff,
or named files. If the deploy target or delta cannot be proven, stop with `Verdict: BLOCKED`.

## Hard Constraints

1. **No deployment side effects.** Do not run `wrangler pages deploy`, push to `main`, create a PR,
   mutate GitHub secrets, rotate Cloudflare tokens, or mark the release shipped.
2. **No secret guessing.** GitHub secret presence can only be proven from CI context or explicit
   operator evidence. Local `.env` or missing secret visibility must be recorded as `not_proven`.
3. **Preview != production.** PR preview can use `mock-authenticated`; production must use live auth
   env and must not be claimed ready unless `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` readiness
   is proven or explicitly operator-gated.
4. **CSP is part of deploy readiness.** `_headers` / CSP changes require either an existing test
   result or an explicit `deferred_gate`; do not silently accept new connect/script/image hosts.
5. **Sourcemap tradeoff must be explicit.** Plain `build` may upload hidden `.map` files to Pages;
   `build:secure` requires Sentry secrets. Record which path is used and why.
6. **Live smoke is evidence-bound.** A deployment URL, deployment id, commit, browser smoke result,
   and rollback plan must be current evidence before `Deploy evidence: live-smoke-proven`.

## Check Workflow

1. Resolve the delta and changed paths:
   - `git show --name-status --stat <commit>`
   - `git diff --name-status <base>...<head>`
   - `git status --short`
2. Inspect deploy authorities:
   - `.github/workflows/deploy-web.yml`
   - `apps/web/wrangler.toml`
   - `apps/web/public/_headers`
   - `apps/web/package.json`
   - `docs/runbooks/cloudflare.md`
3. Classify the target:
   - `preview` — PR / feature-branch deploy, mock-authenticated allowed.
   - `production` — `main` deploy, live auth required.
   - `manual` — operator-triggered `wrangler pages deploy`, record manual env and rollback gate.
4. Run or record verification gates:
   - `pnpm --filter @repo/web build`
   - CSP / header tests if present for the touched surface.
   - `pnpm dashboard:verify-static` when deploy evidence feeds the dashboard.
   - URL/browser smoke only when a real current URL exists.
5. Emit the receipt below. Missing gates must be `not_run:<reason>` or `deferred_gate:<owner>`, never omitted.

## Verdict Mapping

- Build + relevant CSP/header checks green + target env/secret gate proven + smoke evidence current
  -> `READY_FOR_DEPLOY`.
- Build/checks green but URL, secrets, browser matrix, Sentry, or rollback proof is missing
  -> `READY_WITH_OPERATOR_GATES`.
- Required build/CSP/env checks fail or secrets are known missing for the requested target
  -> `BLOCKED`.
- Delta is deploy-irrelevant
  -> `NOT_DEPLOY_RELEVANT`.

## Output Format

```text
Web Deploy Preflight Receipt
  Verdict:          READY_FOR_DEPLOY | READY_WITH_OPERATOR_GATES | BLOCKED | NOT_DEPLOY_RELEVANT
  Web delta:        <commits / paths / summary>
  Target:           preview | production | manual
  Deploy surfaces:  workflow:<changed|unchanged> wrangler:<changed|unchanged> headers:<changed|unchanged> sw:<changed|unchanged> sentry:<changed|unchanged>
  Build gate:       pass | fail | not_run:<reason>
  CSP/header gate:  pass | fail | not_run:<reason> | deferred_gate:<owner>
  Env/secrets gate: proven | not_proven | missing:<item> | n/a
  Sourcemap path:   plain-build-hidden-maps | build-secure-sentry | n/a | deferred_gate:<owner>
  Deploy evidence:  preview-url:<url|missing> production-url:<url|missing> deployment-id:<id|missing> live-smoke:<proven|not_run|n/a>
  Rollback plan:    runbook-linked | missing | n/a
  Required action:  <none | configure secrets | run build/CSP tests | run URL smoke | choose sourcemap path | rollback drill>
  Next workflow:    record-only | xai-release-log + xai-dev-dashboard-sync | operator deploy | fix deploy blocker
  Deploy status:    ready | operator-gated | blocked | not-applicable
```

If executed as a Workflow V2 spawned agent, wrap only this receipt in the required `## Handoff`
block and do not append a conversational follow-up after it.
