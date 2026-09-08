# SITE (official website) Impact Note — DRAFT

| Field | Value |
|---|---|
| Date | 2026-06-01 |
| Branch | `web` |
| Delta scope | uncommitted working tree (`git diff`) |
| Surface assessed | line 5 **official website** (`site`), per ADR-0013 §D1 |
| Authority | ADR-0008 (Cloudflare deploy + CSP — same-Web-line extension protocol, NOT D3); ADR-0013 §D1 (`site` PROPOSED, tied to `release/desktop/<version>` for download/updater artifacts) |
| Status of `site` line | **PROPOSED / owner-deferred** (ADR-0013 §D1 + §S7 #2). No package, no work branch, no roadmap. |
| Nature of this note | **DRAFT ONLY** — read-only assessment. No source/config modified, no `codex/site` branch opened, no `site` work landed. |

> **`site` is PROPOSED and owner-deferred.** This note is a draft impact assessment of shared Cloudflare deploy / CSP infra that the `site` line *would* reuse (ADR-0013 §D1 line 5: "reuse P0 Cloudflare deploy infra + a `release/*`-fed download/updater surface"). It does not authorize, start, or pre-commit any `site` work.

---

## 1. What changed in `_headers` / CSP / deploy (shared infra the site line reuses)

Three files in the delta touch the Cloudflare deploy + CSP infra that is the *only* current `site` reuse hook (ADR-0008 deploy target + `_headers`; no `site` package exists yet):

### 1a. `apps/web/public/_headers` — CSP `connect-src` widened (+3 hosts)
The single `Content-Security-Policy` line's `connect-src` directive gained three hosts:
- `https://api.openai.com` — OpenAI-compatible LLM provider endpoint
- `https://api.groq.com` — Groq (OpenAI-compatible) LLM provider endpoint
- `https://*.ingest.sentry.io` — Sentry error-ingest endpoint

No other directive changed. `script-src` stays `'self'`; no `'unsafe-inline'`, no `'unsafe-eval'`, no `*` wildcard. `frame-src` still absent. All previously-allowlisted hosts (`api.anthropic.com`, `tile.openstreetmap.org`, `api.notion.com`, `oauth2.googleapis.com`, `api.linear.app`, `generativelanguage.googleapis.com`, font hosts) remain present — verified against the full current `_headers` line (`apps/web/public/_headers:2`).

> Note: the prior Stripe hosts (`js.stripe.com` / `checkout.stripe.com` / `buy.stripe.com`) recorded in ADR-0008 §S6 are NOT in the current `_headers` line; that is a pre-existing divergence between the ADR §S6 snapshot and the file, unrelated to this delta and out of scope for this note.

### 1b. `apps/web/src/__tests__/csp.test.ts` — new guard `CSP6` (purely additive)
Adds one `it("CSP6: connect-src includes supported OpenAI-compatible and Sentry ingest hosts")` asserting the three new hosts are present in `_headers`. Existing guards **CSP1–CSP5**, `CSP4-SCRIPT-SRC-CLEAN`, and `CSP4-FRAME-SRC-CLEAN` are untouched — the source-text guard for the existing 24 modules' headers does **not** regress (the new case only adds coverage; it neither relaxes nor removes any prior assertion).

### 1c. `.github/workflows/deploy-web.yml` — production auth mode + Supabase build secrets
- `VITE_WEB_AUTH_MODE` changed from a fixed `mock-authenticated` to conditional: `mock-authenticated` for PR previews, `live` for production `main` deploys.
- Build step now injects `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from GitHub Secrets; the secrets-doc header comment documents the new required secrets.
- No change to deploy target, project name, output dir, or the `wrangler.toml` shape.

### Effect on the existing 24 web modules' deploy + security headers
- **Deploy**: unchanged path/target. The only behavioral change is auth mode on production `main` (demo → live) plus two new build-time env secrets. This is a Web-product CD-pipeline change; it does not alter how artifacts are published to Cloudflare Pages.
- **Security headers**: strictly a `connect-src` *addition*. The 24 modules' headers are otherwise byte-identical; no directive was loosened. The new test locks the addition in.

---

## 2. Same-Web-line (ADR-0008) vs cross-line (D3)

**Verdict: same-Web-line — ADR-0008 §S3 D3 / §S6 extension protocol applies. NOT a cross-line / D3 concern, and NOT a `site` cross-line concern.**

- This is the *sixth* instance of the established `connect-src` allowlist-extension pattern (precedents: Anthropic 2026-05-25, OSM 2026-05-25, OAuth 2026-05-25, Stripe 2026-05-26, Gemini 2026-05-29). ADR-0008's "Extension rule" explicitly governs "future rows reaching additional openai-compatible provider hosts" — `api.openai.com` and `api.groq.com` land squarely in that clause. Sentry ingest is the same additive `connect-src` shape.
- Per ADR-0008, the correct lane is the **same-Web-line extension protocol**, i.e. handled inside the Web product flow (feature-plan / feature-review for the owning row) — **not** the ADR-0013 §D3 Web→Desktop gate (that gate governs `web → desktop-next` promotion of changes that affect the App, which this does not).
- The `csp.test.ts` regression check required by §S6 is satisfied: CSP1–CSP5 guards are intact (confirmed §1b above).

**Process gap to flag (Web-line, not `site`):** ADR-0008 frontmatter / §S6 has **NOT** yet been amended for these three hosts (verified: `docs/adr/0008-cloudflare-deploy-target-and-csp.md` is unmodified in the working tree and contains zero references to `api.openai.com`, `api.groq.com`, or `ingest.sentry.io`). The §S3 D3 / §S6 extension protocol requires: amend ADR frontmatter + extend `_headers` + update §S6 snippet + write a csp.test.ts guard. Three of four are present; the **ADR frontmatter/§S6 amendment is outstanding**. This is a Web-line bookkeeping item owned by the originating row, surfaced here only because it shares the infra the `site` line reuses — it is **not** a `site`-surface action.

---

## 3. Download-page / auto-update / release-artifact implication

**None.** ADR-0013 §D1 ties the `site` line's distribution surface to `release/desktop/<version>` artifacts (signing, `.dmg`, updater metadata, download-page artifacts — see §D2 `release/desktop/<version>` row). The delta touches **none** of these:

- No `wrangler.toml` change (deploy target/shape untouched).
- No release-artifact files in the delta — scan for `release|updater|download|dmg|tauri|latest.json|appcast|version` matched **nothing** in `git diff --name-only`.
- The CSP/deploy changes are about the Web Console *app runtime* (LLM provider connectivity + error telemetry + production auth), not about hosting or serving App download/updater artifacts.

If/when the `site` line is un-deferred and reuses this CSP, the only inheritance to re-examine is that a marketing/download page served from the same Cloudflare project would also receive this `connect-src` allowlist (e.g. `*.ingest.sentry.io` for error telemetry on the marketing page). That is a *future* `site` design input, not an impact of this delta.

---

## 4. Verdict

**`site-impact: none`** — delta is a same-Web-line ADR-0008 `connect-src`/deploy change with no release-artifact, download-page, or updater surface; the PROPOSED/owner-deferred `site` line inherits nothing actionable. (Outstanding ADR-0008 frontmatter/§S6 amendment for the 3 new hosts is a Web-line bookkeeping item, not a `site` concern.)

---

### Provenance / files inspected (all absolute)
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/web/public/_headers`
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/web/src/__tests__/csp.test.ts`
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/.github/workflows/deploy-web.yml`
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/web/wrangler.toml` (unchanged — confirmed not in delta)
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/adr/0008-cloudflare-deploy-target-and-csp.md` (§S3 D3 amendments, §S6 rules; unmodified in working tree)
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/adr/0013-branch-sync-governance.md` (§D1 line 5 `site`, §D2 `release/desktop/<version>`, §S7 #2)
- `/Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/docs/runbooks/cloudflare.md` (referenced; not modified)

_Draft note — no source landed, no branch opened. `site` remains PROPOSED / owner-deferred per ADR-0013 §D1._
