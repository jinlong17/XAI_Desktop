# Release / Operator Runbook — XAI Admin Console (row #6, AC-5)

> The promotion-gate runbook for the admin surface (`apps/admin`). It documents **how**
> to promote the admin console beyond prototype — deploy, secret setup, rotation,
> rollback, and the branch-topology / PR decision — **but performs none of it**.
>
> **HARD SCOPE — this slice does NOT promote.** Row #6 is contract/scaffold + doc +
> tooling only. No `wrangler pages deploy`, no Cloudflare Pages project creation, no
> admin GitHub Action, no PR/merge into `web` / `desktop-next` / `dev`, no real secret
> set anywhere. Everything below is an **OPERATOR step**, gated on explicit operator
> confirmation (ADR-0013 §D2/§D5). See design.md frozen assumptions #1–#3.
>
> Cross-references (shared mechanics, not duplicated here):
> - `docs/adr/0008-cloudflare-deploy-target-and-csp.md` — Cloudflare Pages + `_headers`
>   CSP authority and the §S6 binding extension protocol.
> - `docs/runbooks/cloudflare.md` — the **web** runbook for first-time Wrangler login,
>   API-token creation, GitHub-Secret registration, quota monitoring, and disaster
>   recovery. The admin surface reuses the same mechanics with its **own** project +
>   secrets; only the admin-specific deltas and the promotion gate live here.
> - `apps/admin/docs/design.md` §ADR-lite #1 — the slice-#1 admin deploy boundary.

---

## 0. What is already true in-repo (verified by tests, no operator action)

These are locked by row-#6 P1 tests and need no runtime step to be true:

- **Separate Pages project** — `apps/admin/wrangler.toml` `name = "xai-admin-dashboard"`,
  distinct from the web project `xai-web-console`. (TT-ISO-PROJECT-NAME)
- **Self-contained, credential-free deploy config** — no `[vars]`, no `[[secrets]]`,
  no inline `account_id` / API token in `wrangler.toml`. (TT-ISO-SELF-CONTAINED)
- **Own build output** — `pages_build_output_dir = "./dist"`, never `apps/web/dist`.
  (TT-ISO-OUTPUT-DIR)
- **Verbatim `_headers` after build** — `dist/_headers` == `public/_headers`.
  (TT-ISO-HEADERS-PARITY)
- **Physical isolation** — nothing under `apps/web/src` imports `apps/admin` /
  `@repo/admin`. (TT-ISO-NO-CROSS-IMPORT)
- **Tight CSP, no external ingest host** — `connect-src 'self'`; no `unsafe-*`, no
  wildcard host, explicitly no `ingest.sentry.io`. (TT-CSP-* / TT-NO-TELEMETRY-SECRET-*)
- **No secret in the browser bundle** — no service-role/provider/Stripe/Sentry-DSN
  literal in `dist/**`. (TT-NO-SECRET-BUNDLE / TT-NO-PROVIDER-KEY / TT-NO-TELEMETRY-SECRET-BUNDLE)

The **runtime** facts below (which Cloudflare account/project actually serves admin,
which secrets exist server-side) are operator/dashboard facts — NOT assertable in-repo.

---

## 1. First-time setup (OPERATOR)

> Prerequisite: complete the shared Wrangler login + API-token steps in
> `docs/runbooks/cloudflare.md` §1.1 + §1.3. The admin surface needs its **own**
> Pages project and its **own** token/secret scoped to that project.

### 1.1 — Create the admin Pages project

```bash
# One-time. The project name MUST match apps/admin/wrangler.toml (xai-admin-dashboard).
wrangler pages project create xai-admin-dashboard --production-branch <promotion-branch>
```

Use a **distinct** project from `xai-web-console`. Confirm in the Cloudflare dashboard
that the admin project is owned by the intended account and is NOT shared with web.

### 1.2 — Register admin CI secrets (if using CI deploy)

If the admin surface gets its own GitHub Action (a separate operator decision — see §5),
register the secrets on the repo following `docs/runbooks/cloudflare.md` §1.4, using an
**admin-scoped** name so it never collides with the web token, e.g.:

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN_ADMIN` | Pages:Edit token scoped to `xai-admin-dashboard` only |
| `CLOUDFLARE_ACCOUNT_ID` | account id (may be shared if same account; never in-repo) |

> The token lives in CI/operator secret storage ONLY. It must never be added to
> `wrangler.toml`, `.env*`, or any file — TT-ISO-SELF-CONTAINED + TT-ENV-NO-SECRET
> guard against that.

### 1.3 — Server-side application secrets (auth / telemetry — DEFERRED)

The admin surface ships **mock-authenticated** with **no real backend secret**. When a
real backend is wired (a later row / operator step), secrets are configured **server-side
only**:

- **Auth** (real Supabase device-session, future row): the service-role key and any
  provider secret live in the **server / edge function** environment, never in a `VITE_`
  variable. The browser receives only opaque handles/status (already the contract — see
  `no-provider-key.test.ts`). Wiring real auth follows the ADR-0008 §S6 extension protocol
  (amend record → extend `_headers` `connect-src` with the auth host → update snippet →
  write a csp guard test).
- **Telemetry** (real Sentry/observability sink, future operator step): the DSN/ingest
  endpoint is configured **server-side** or injected at the boundary behind
  `AdminTelemetrySink` (see `src/observability/telemetry.ts`). It must **NOT** be baked
  into the bundle as a `VITE_*_DSN` variable. Enabling it ALSO requires an ADR-0008 §S6
  `connect-src` extension to allow the ingest host on the **admin** `_headers` — this is
  exactly the host the row-#6 guards (TT-CSP-NO-WILDCARD, TT-NO-TELEMETRY-SECRET-*)
  currently forbid, so the guards must be updated in the same change that enables it.

---

## 2. Deploy (OPERATOR)

> The slice does not deploy. These are the steps the operator runs to promote a build.

### 2.1 — Manual deploy (closest to web runbook §4)

```bash
# 1. Build the admin surface (mock-authenticated unless real auth is wired):
pnpm --filter @repo/admin build

# 2. Deploy the built dist/ to the admin Pages project:
wrangler pages deploy apps/admin/dist --project-name xai-admin-dashboard
```

Custom domain/DNS for admin is deferred (ships at `*.pages.dev` per ADR-lite #1); add a
custom domain following `docs/runbooks/cloudflare.md` §6.3 when promoted.

### 2.2 — Post-deploy verification (run before declaring the deploy good)

1. Load the deployed `*.pages.dev` URL; run the **manual-smoke-checklist.md** pass.
2. DevTools → Network → confirm the response carries the tight CSP and security headers
   (matches `public/_headers`).
3. Confirm **no request to any external origin** (no `ingest.sentry.io`, no provider host).
4. Confirm the fail-closed guard: without a valid admin session the forbidden fallback
   renders, not admin content.

---

## 3. Rotate secrets (OPERATOR)

Follow `docs/runbooks/cloudflare.md` §2 for the mechanics (revoke old token → create new
→ update the GitHub Secret → re-trigger). Use the **admin-scoped** secret name from §1.2
so rotating the admin token never affects the web deploy, and vice-versa.

If a real auth/telemetry secret is ever leaked into the bundle (the guards should prevent
this), treat it as HC-CRITICAL: remove it, **purge git history**, **rotate the credential**,
and add/extend the guard that missed it.

---

## 4. Rollback (OPERATOR)

Follow `docs/runbooks/cloudflare.md` §3 against the **admin** project:

- **Path A (fast):** Cloudflare dashboard → `xai-admin-dashboard` → Deployments →
  roll back to a previous good deployment (one click).
- **Path B (CLI):**

```bash
wrangler pages deployment list --project-name xai-admin-dashboard
# Re-activate a known-good deployment id from the list.
```

Rollback triggers: a smoke-checklist FAIL on the deployed URL, a CSP regression, any
secret/ingest-host appearing in the served bundle, or the fail-closed guard not holding.

---

## 5. Promotion Gate (OPERATOR-GATED — the core of this runbook)

> The admin **line** was operator-activated (2026-06-06). Promoting the **surface beyond
> prototype** — making it a real, deployed, branch-integrated product — is a **separate,
> explicit operator decision**. The slice records the decision points; it does not decide
> or perform them.

### 5.1 — Deferred PR / merge + branch-topology decision (ADR-0013 §D2/§D5)

Row #6 was built on the worktree branch `claude/frosty-nash-c4bf16`; the admin work
belongs to the `admin` product module whose convention branch is `codex/admin/<feature>`.
**No PR has been opened and nothing has been merged** into any long-lived branch.

Before promotion, the operator decides:

1. **Target branch.** Per ADR-0013 §D5, `web` and `dev` are independent focus branches;
   `admin` is a PROPOSED module (CLAUDE.md product map row #6) without a created long-term
   branch yet. The operator chooses where admin integrates:
   - keep admin on its own `codex/admin/*` line and deploy from there, OR
   - define/create an admin long-term branch (a NEW operator-confirmed step — like
     `desktop-next` / `desktop-plugin-next` / `release/*`, which ADR-0013 §D2 lists as
     **DEFINED but not yet created**; creating one is always a separate confirmation).
2. **Open the PR** for the row-#6 commits (P1–P4) into the chosen branch. Anything that
   touches `dev` requires explicit operator confirmation (ADR-0013 §D2).
3. **No `web → dev` shortcut.** Admin is its own module; this is NOT a Web→Desktop D3
   promotion (`xai-web-to-desktop-sync` / W0–W4 does not apply — row #6 is classified
   **W0**, admin-side only, no `apps/web` change). Do not route admin through the D3 gate.

### 5.2 — Server-side secret setup before real backend

If promotion includes real auth/telemetry (a further scope decision), complete §1.3
FIRST: secrets server-side only, `_headers` `connect-src` extended via ADR-0008 §S6 in the
SAME change that enables the host, and the corresponding guard tests updated. Until then,
admin promotes as **mock-authenticated** with the tight `connect-src 'self'` CSP intact.

### 5.3 — Isolation re-check before flipping production

Before pointing a production domain at admin, re-run the in-repo isolation gate and the
deployed-URL checks:

```bash
pnpm --filter @repo/admin test    # all isolation/CSP/secret guards green
pnpm --filter @repo/admin build   # dist/_headers parity + no .map + DSN-free bundle
```

Then on the deployed URL confirm: distinct Cloudflare project from web, tight CSP served,
no external ingest/network, fail-closed guard holds. Only after all of these does the
operator flip production.

### 5.4 — ADR note

Per OQ5 (feature-review APPROVED): row #6 makes **no ADR-0008 amendment** — it does not
change `apps/web`'s `_headers` and the admin deploy boundary is already recorded as the
slice-#1 ADR-lite #1 extension of ADR-0008. This runbook is the cross-reference; any
future admin `_headers` change (e.g. enabling a telemetry ingest host) MUST follow the
ADR-0008 §S6 protocol at that time.

---

## Promotion checklist (operator fills at actual promotion time)

- [ ] Admin Pages project created + confirmed distinct from `xai-web-console`.
- [ ] Admin-scoped CI secret registered (if CI deploy) — never in-repo.
- [ ] Branch-topology + PR target decided (§5.1); PR opened; `dev`-touching steps confirmed.
- [ ] (If real backend) server-side secrets set + `_headers`/guards updated via ADR-0008 §S6.
- [ ] `pnpm --filter @repo/admin test` + `build` green; isolation re-check passed (§5.3).
- [ ] Deployed-URL smoke pass (manual-smoke-checklist.md) green cross-vendor.
- [ ] No external ingest/network observed on the deployed URL.
- [ ] Rollback path verified (a known-good deployment exists to roll back to).

**Promotion authorized by:** __________  ·  **Date:** __________  ·  **Target branch:** __________
