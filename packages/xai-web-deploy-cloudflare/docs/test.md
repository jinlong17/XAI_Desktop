# xai-web-deploy-cloudflare — Verification Strategy

> No unit tests, no integration tests, no E2E tests, no Rust tests. This row
> ships deploy configuration + a CI workflow + an ADR + a runbook. Verification
> is **structural review + CI smoke + live deploy smoke + cross-vendor
> cold-read**.

## Test Surfaces

- **TS1 — Structural completeness** (manual review against `api.md` AC-C1-1..C9-5).
- **TS2 — Build determinism + secret hygiene** (Vite build green + `dist/` greps clean).
- **TS3 — Workflow lint** (`actionlint` clean or manual schema check).
- **TS4 — Wrangler config validity** (dry-run + `wrangler --version`).
- **TS5 — Live deploy smoke** (curl + manual browser).
- **TS6 — CSP header parity audit** (live CSP matches `_headers` byte-for-byte; strictness delta acknowledged in ADR-0008).
- **TS7 — Cross-vendor verify** (Codex / Cursor cold-read).
- **TS8 — Existing SHIPPED tests stay green** (`pnpm --filter @repo/web test` + the rest of `@repo/plugin-web-*` suites).

## Test Cases

### TC-T1 — All declared files exist (TS1)

```text
Inputs to check:
  - apps/web/wrangler.toml
  - apps/web/public/_headers
  - .gitignore (root, contains `.dev.vars` + `.wrangler/`)
  - .nvmrc (root, contains `22`)
  - .github/workflows/deploy-web.yml
  - docs/adr/0008-cloudflare-deploy-target-and-csp.md
  - docs/runbooks/cloudflare.md
  - packages/xai-web-deploy-cloudflare/docs/{design,api,test,dev_log}.md

PASS = all files present at end of P4.
```

### TC-T2 — `wrangler.toml` structural (TS1 + TS4)

```text
1. Read apps/web/wrangler.toml.
2. Confirm exactly the three keys `name` / `compatibility_date` /
   `pages_build_output_dir`.
3. Confirm `name = "xai-web-console"`.
4. Confirm `pages_build_output_dir = "./dist"`.
5. Confirm no `[assets]` block (Pages, not Workers Static Assets).
6. Confirm no secret values.
7. Run `wrangler deploy --dry-run` (or `wrangler pages deploy ./dist
   --dry-run --project-name=xai-web-console` if `--dry-run` is supported in
   the installed wrangler version) → 0 errors.

PASS = all AC-C1-1..C1-7 ticked.
```

### TC-T3 — `_headers` content (TS1 + TS6)

```text
1. Read apps/web/public/_headers.
2. Confirm `/*` rule scope.
3. Confirm `Content-Security-Policy: …` line matches the frozen CSP body
   in api.md §C2.
4. Confirm STS / nosniff / DENY / Referrer-Policy / Permissions-Policy
   lines match api.md §C2.
5. Confirm CSP body has no `__XAI_CSP_NONCE__`, no `'nonce-…'`, no
   `'unsafe-inline'`, no `'unsafe-eval'`, no `*` wildcard.

PASS = AC-C2-1..C2-6 ticked.
```

### TC-T4 — Nonce placeholder stripped from `dist/index.html` (TS2)

```text
1. Run `pnpm install --frozen-lockfile && pnpm --filter @repo/web build`.
2. `grep -F "__XAI_CSP_NONCE__" apps/web/dist/index.html` → no matches.
3. `grep -E '(data-csp-nonce|xai-csp-nonce)' apps/web/dist/index.html`
   → no matches (the attributes containing nonce token are removed too).

PASS = AC-C3-1 ticked; build is reproducible.
```

### TC-T5 — Runtime nonce caller audit (TS2)

```text
1. `grep -RE 'requireRuntimeNonce|createNonceStyleElement' packages/plugin-web-* apps/web/src` → list all callers.
2. For each caller, confirm it does NOT fire in the production code path
   (callers are either dead-code-at-static-runtime, or guarded by a flag).
3. If any caller fires under static deploy, BLOCK back to feature-plan with
   the caller listed.

PASS = AC-C3-3 ticked; no caller fires in production-static path.
```

### TC-T6 — Secret hygiene (TS2)

```text
1. After `pnpm --filter @repo/web build`:
   - `grep -RE 'SUPABASE_|SENTRY_DSN|CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID' apps/web/dist`
     → no matches.
2. `git grep -E 'CLOUDFLARE_API_TOKEN\s*=|CLOUDFLARE_ACCOUNT_ID\s*='` returns only
   the secret-name references in `.github/workflows/deploy-web.yml` and
   `docs/runbooks/cloudflare.md` (no `KEY=value` literal anywhere).

PASS = no secret value leaks in repo or in built artifact.
```

### TC-T7 — GitHub Action lint (TS3)

```text
1. Run `actionlint .github/workflows/deploy-web.yml` (if installed) →
   0 errors / 0 warnings (strictness setting documented in dev_log).
2. If actionlint not installed: validate YAML against
   https://json.schemastore.org/github-workflow.json schema manually.
3. Confirm uses-statements:
   - actions/checkout@v4
   - pnpm/action-setup@v4
   - actions/setup-node@v4
   - cloudflare/wrangler-action@v3   (NOT cloudflare/pages-action)
4. Confirm secret references use ${{ secrets.* }} idiom.
5. Confirm `pnpm install --frozen-lockfile`.
6. Confirm `pnpm --filter @repo/web build` runs with
   `env: VITE_WEB_AUTH_MODE: mock-authenticated`.
7. Confirm wrangler-action `command:` is
   `pages deploy ./dist --project-name=xai-web-console --branch=${{ github.head_ref || github.ref_name }}`.

PASS = AC-C4-1..C4-13 ticked.
```

### TC-T8 — Build deterministic across CI vs local (TS2 + TS3)

```text
1. Local: rm -rf apps/web/dist && pnpm install --frozen-lockfile && pnpm --filter @repo/web build
2. Record sha256 of dist/index.html + a representative JS chunk.
3. Repeat the same sequence on a fresh checkout — hashes should match
   (allowing for build timestamps / source-map id non-determinism, which
   we explicitly call out as non-bit-stable elements).

PASS = byte-stability of static assets confirmed (HTML structure +
deterministic chunk hashes from Vite content-hashing).
```

### TC-T9 — Live deploy reachability (TS5)

```text
1. Push to `main` (after secrets configured) OR run manual
   `wrangler pages deploy ./dist --project-name=xai-web-console --branch=main`
   from apps/web.
2. `curl -I https://xai-web-console.pages.dev/` → 200, Content-Type: text/html.
3. `curl -I https://xai-web-console.pages.dev/app` → 200, Content-Type: text/html.
4. `curl -I https://xai-web-console.pages.dev/app/tasks` → 200, Content-Type:
   text/html (SPA fallback).
5. `curl -I https://xai-web-console.pages.dev/some-nonexistent-asset.png` →
   404 (NOT the SPA fallback — static asset misses do return 404).

PASS = all 4 expected HTTP responses observed.
```

### TC-T10 — Manual smoke in real browser (TS5)

```text
1. Open https://xai-web-console.pages.dev/ in Chrome (latest stable).
2. Confirm 24/24 modules render in the rail navigation.
3. Cycle through rail entries (Tasks, Board, Dashboard, Calendar, Matrix,
   Pomodoro, Habits, Meditation, Countdown, AI Chat, Pet, Statistics,
   Settings shell) — each surface paints, no console errors.
4. On Dashboard: toggle a widget on/off (or reorder), reload page → state
   persists via localStorage.
5. On Settings → Appearance: change accent-hue / rail-pos / bg-tone, reload
   → preferences persist.
6. Open DevTools console: no fatal errors (warnings acceptable; CSP report
   warnings acceptable since no report endpoint).

PASS = all 6 checks observed.
```

### TC-T11 — CSP header parity (TS6)

```text
1. `curl -I https://xai-web-console.pages.dev/` | grep -i content-security-policy
   → returns the CSP header byte-identical to apps/web/public/_headers CSP body.
2. ADR-0008 §Decision 3 explicitly records the strictness delta vs the
   SHIPPED `web-security-csp-sentry` per-request-nonce posture.
3. Manual reviewer reads ADR-0008 §Decision 3 cold and confirms the delta
   acknowledgement is NOT silent.

PASS = AC-C2-7 ticked + ADR §3 delta explicit.
```

### TC-T12 — Bundle sanity (TS5)

```text
1. After `pnpm --filter @repo/web build`:
   - Total `dist/` size: <recorded number> bytes.
   - File count: <recorded number>.
   - Largest file: <name> @ <size>.
2. Pages free-tier limits:
   - No file > 25 MiB.
   - Total file count < 20K.
3. Record all three numbers in dev_log Verify Report.

PASS = both Pages limits respected.
```

### TC-T13 — Cross-vendor cold-read (TS7)

```text
1. Primary verifier: Codex (gpt-5.5-thinking, effort=medium).
   Fallback: Cursor (when Codex quota exhausted; documented in dev_log).
2. Verifier reads cold (no prior context):
   - docs/adr/0008-cloudflare-deploy-target-and-csp.md
   - apps/web/wrangler.toml
   - apps/web/public/_headers
   - .github/workflows/deploy-web.yml
   - docs/runbooks/cloudflare.md
   - packages/xai-web-deploy-cloudflare/docs/{design,api,test}.md
3. Verifier confirms:
   a. No internal contradictions.
   b. No conflict with ADR-0003 / ADR-0006 / ADR-0007.
   c. CSP strictness delta is explicit in ADR-0008 §3 (not implied).
   d. Secret enumeration in workflow matches runbook §1 + §2.
   e. wrangler-action invocation matches Cloudflare's current v3 docs.
   f. Phase plan is implementable end-to-end by a different operator.
4. Verifier emits verdict: CONFIRMED_READY_TO_SHIP or BLOCKED + reasons.

PASS = CONFIRMED_READY_TO_SHIP. FAIL = BLOCKED → revise pass.
```

### TC-T14 — Existing test suite stays green (TS8)

```text
1. `pnpm --filter @repo/web test` → all SHIPPED unit tests pass.
2. `pnpm --filter @repo/web check-types` → 0 type errors.
3. `pnpm --filter @repo/web lint` → 0 warnings (with --max-warnings 0).

PASS = no regression in the SHIPPED @repo/web test surface.
```

### TC-T15 — Runbook completeness (TS1)

```text
1. Read docs/runbooks/cloudflare.md.
2. Confirm 6 sections present in order: First-time Setup / Rotate Secrets /
   Rollback / Manual Deploy / Quota Monitoring / Disaster Recovery.
3. Every command in the runbook is copy-pasteable (no `<placeholder>`
   without inline definition).
4. Required Secrets named exactly: CLOUDFLARE_API_TOKEN +
   CLOUDFLARE_ACCOUNT_ID.
5. Cloudflare API token scope documented: Cloudflare Pages:Edit.

PASS = AC-C6-1..C6-5 ticked.
```

### TC-T16 — Evidence file present and full (TS1 + TS5)

```text
1. docs/reviews/xai-web-deploy-cloudflare/20260524-prod-smoke.md exists.
2. Contains live URL, full curl outputs (verbatim), bundle stats,
   secret-scan output, manual smoke checklist, CSP delta acknowledgement,
   cross-vendor verdict.
3. Evidence file timestamp ≥ ADR-0008 acceptance time (i.e., evidence is
   collected AFTER deploy, not before).

PASS = AC-C9-1..C9-5 ticked.
```

### TC-T17 — Dependent-row Cross-Vendor Manual Smoke audit (hard gate per manifest policy 2026-05-24)

```text
Enforces the manifest-level Cross-vendor Manual Browser Smoke Policy
(see docs/workflow/roadmap/xai-web-console.md header, 2026-05-24
post-Codex-re-review). Manual cross-browser smoke is the
deployment-readiness gate — xai-web-deploy-cloudflare-pages is the
project's chosen enforcement point.

1. For EVERY row in docs/workflow/roadmap/xai-web-console.md whose
   own test.md requires manual cross-vendor smoke, read its dev_log
   Status Panel `Cross-Vendor Manual Smoke` field.
2. Required minimum set (extend if other rows declare manual smoke
   in their test.md after 2026-05-24):
     - xai-web-shell (test.md "Manual Verification" M1..M18 — 4 rail
       positions + drag-reorder + AvatarMenu popover directions ×
       Chrome stable / Safari 17+ / Firefox latest)
     - xai-web-dashboard-grid (test.md §6 — FLIP timing, iOS touch,
       responsive breakpoints, a11y, theme inversion, storage
       round-trip × Chrome 120 / Safari 17 / Firefox 121 /
       Safari iOS)
3. For each row in (2), assert that:
     (a) the row's dev_log Status Panel has an explicit
         `Cross-Vendor Manual Smoke` line, AND
     (b) that line is one of: `PASS (<browsers>, <date>)` or
         `Deferred (per manifest policy 2026-05-24) — UNFILLED`,
         AND
     (c) if value is PASS, the linked evidence file (e.g.
         docs/reviews/xai-web-shell/<date>-manual-smoke.md or
         docs/reviews/xai-web-dashboard-grid/20260524-cross-vendor-smoke.md)
         exists AND the in-file matrix rows for at least one tier-1
         vendor (Chrome OR Safari OR Firefox) carry checkmarks and
         browser-version strings.
4. Verdict matrix:
     - All rows show PASS with evidence → TC-T17 PASS, deploy MAY
       proceed to READY_TO_SHIP.
     - Any row shows Deferred → TC-T17 BLOCKED. Verify gate must
       BLOCK ship with explicit "manual smoke not evidenced for
       <row>; fill `<evidence file>` matrix before re-running
       verify". This is the hard enforcement point that prevents
       the documentation defect Codex caught on 2026-05-24
       (checklist-shaped placeholder treated as evidence).
     - Row missing the `Cross-Vendor Manual Smoke` field entirely
       → TC-T17 BLOCKED. Verify gate must surface "row <slug>
       does not declare manual-smoke status; check whether its
       test.md should declare manual smoke and update its
       Status Panel".

PASS = AC-C9-6 ticked.
```

---

## Phase 5 fallback — secrets not yet configured

If `feature-verify` reaches Phase 5 and the GitHub Secrets
`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` are not yet configured, the
verify gate has two accepted fallbacks:

### Option (a) — Manual `wrangler deploy` from operator machine

- Operator runs `wrangler login` locally and authenticates against the target
  Cloudflare account.
- Operator runs:
  ```
  pnpm --filter @repo/web build
  cd apps/web && wrangler pages deploy dist --project-name=xai-web-console --branch=main
  ```
- TC-T9..T12 are run against the live URL produced by the manual deploy.
- The GitHub Action workflow is NOT exercised end-to-end yet, but:
  - TC-T1..T8 + T15..T16 are still verifiable (the workflow file exists and
    passes static lint).
- dev_log Status Panel records `Pre-deploy Gate: secrets-configured = no
  (manual deploy used for first URL)`.
- A follow-up task is recorded to push to `main` once secrets are configured,
  to exercise the workflow end-to-end. This follow-up does NOT block ship.

### Option (b) — BLOCKED handoff

- dev_log Status Panel flips to:
  - `Status: BLOCKED`
  - `Suggested Next: feature-plan`
  - `Blockers: GitHub Secrets CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID not configured. Operator action required per docs/runbooks/cloudflare.md §1 First-time Setup.`
- Once the operator configures the secrets, the row is resumed via
  feature-build P5 re-dispatch (or feature-verify re-run).

The choice between (a) and (b) is the operator's, made at P5 dispatch time.
Recommendation: prefer (a) so the first public URL is recorded ASAP, then
exercise the workflow on the next push.

---

## Verify Gate — full list

A verify run is GREEN only when **all** of the following pass:

| TC | Title | Gate |
|----|-------|------|
| TC-T1 | All declared files exist | TS1 |
| TC-T2 | wrangler.toml structural | TS1 + TS4 |
| TC-T3 | `_headers` content | TS1 + TS6 |
| TC-T4 | Nonce placeholder stripped from dist | TS2 |
| TC-T5 | Runtime nonce caller audit | TS2 |
| TC-T6 | Secret hygiene | TS2 |
| TC-T7 | GitHub Action lint | TS3 |
| TC-T8 | Build deterministic CI vs local | TS2 + TS3 |
| TC-T9 | Live deploy reachability | TS5 |
| TC-T10 | Manual smoke in real browser | TS5 |
| TC-T11 | CSP header parity | TS6 |
| TC-T12 | Bundle sanity (Pages limits) | TS5 |
| TC-T13 | Cross-vendor cold-read | TS7 |
| TC-T14 | Existing test suite stays green | TS8 |
| TC-T15 | Runbook completeness | TS1 |
| TC-T16 | Evidence file present and full | TS1 + TS5 |

Verify GREEN → Status flips `READY_FOR_VERIFY` → `READY_TO_SHIP`.
Verify RED → Status flips `READY_FOR_VERIFY` → `BLOCKED` (Suggested Next:
feature-build or feature-plan depending on the failing TC).

---

## Mock Strategy

**No mock.** Every dependency this row consumes is SHIPPED:

- `@repo/web` (24/24 modules).
- Every `@repo/plugin-web-*` (all SHIPPED or READY_TO_SHIP per
  `docs/PLUGIN_MAP.md`).
- Cloudflare Pages (external SaaS, no mock).
- GitHub Actions (external SaaS, no mock).

The only "mock" is `VITE_WEB_AUTH_MODE=mock-authenticated`, which is a SHIPPED
product feature (row #5 `xai-web-shell` behavior under that env flag), not a
test mock.

---

## Anti-Test Surfaces (intentionally NOT verified by this row)

- AI Chat real backend behavior (out of scope — `window.claude.complete` is a
  typed no-op per ADR-0007 §S5; live URL still demonstrates the no-op).
- Custom domain TLS / DNS (ships at `*.pages.dev`).
- Real Supabase auth flows (mock-authenticated build).
- E2E browser matrix (Chrome stable only for manual smoke; deferred row).
- Sentry source-mapped stack trace quality (vanilla build, no upload).
- BroadcastChannel cross-tab sync (per ADR-0007, single-tab SPA).
- macOS multi-window or Tauri command behavior (not applicable — web target).
