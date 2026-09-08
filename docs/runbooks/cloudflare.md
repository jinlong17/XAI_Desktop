# Runbook — Cloudflare Pages (XAI Web Console)

> Operational procedures for the `xai-web-console` Cloudflare Pages project.
> Architecture authority: `docs/DEPLOYMENT.md` (deployment matrix + launch flow)
> Decision context: `docs/adr/0008-cloudflare-deploy-target-and-csp.md`
> CI workflow: `.github/workflows/deploy-web.yml`
> Feature row: `packages/xai-web-deploy-cloudflare/docs/`
> Account-cloud backend runbook: `docs/runbooks/supabase.md`

> **Production source decision (DEPLOYMENT.md §12-A):** production deploys are
> wired to `main`. The Web mainline is `web`, so production release is
> `web → main` fast-forward, followed by the GitHub deploy workflow.

---

## 1. First-time Setup

Run these steps **once** when standing up the project for the first time.

### 1.1 — Log in to Wrangler

```bash
pnpm dlx wrangler@4.107.1 login
```

This opens a browser OAuth flow. Authenticate with the Cloudflare account
that should own the Pages project. The account ID printed in the browser URL
after login (or visible at https://dash.cloudflare.com/ top-right) is the
value you will use for `CLOUDFLARE_ACCOUNT_ID`.

### 1.2 — Create the Pages project

```bash
pnpm dlx wrangler@4.107.1 pages project create xai-web-console
```

When prompted, choose **"Direct Upload"** (not "Git Connect") — CI deploys
via the pinned Wrangler CLI in GitHub Actions, not the Cloudflare Git
integration.

Record the output — it will confirm the project name and account ID.

### 1.3 — Create a Cloudflare API token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Prefer **Create Custom Token → Get started** so the permission names are
   explicit. Add these permissions:
   - **Account → Cloudflare Pages → Edit** on the target account. This is the
     Pages hosting permission required by Cloudflare's Direct Upload CI docs.
   - **User → Memberships → Read**. Current Wrangler v4 account diagnostics need
     this read-only permission; PR #2 failed without it with Cloudflare API
     `code: 10000` and `Unable to get membership roles`.
   - **Account → Account Settings → Read** on the target account. This is
     read-only account metadata used by Wrangler account/project resolution.
4. Under resources, include only the target account that owns
   `xai-web-console`.
5. Do **not** select **Zone → Custom Pages**. That is for Cloudflare custom
   error pages and does not grant access to the Cloudflare Pages hosting
   product.
6. Set an expiry if desired (recommended: 1 year; see §2 for rotation)
7. Copy the generated token — this is your `CLOUDFLARE_API_TOKEN` value.

### 1.4 — Register GitHub Secrets

Navigate to your GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**.

Add both secrets:

| Secret name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | The token from step 1.3 |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID from step 1.1 |

### 1.5 — Verify the token before triggering CI

From a local shell, without committing or printing the token value:

```bash
CLOUDFLARE_API_TOKEN="<token>" \
CLOUDFLARE_ACCOUNT_ID="<account_id>" \
pnpm cloudflare:verify-token
```

The output must include `xai-web-console`. If it fails with `Authentication
error [code: 10000]` or `Unable to get membership roles`, recreate the token
with the three permissions in §1.3.

You can also verify the Pages REST API directly:

```bash
curl -fsS \
  "https://api.cloudflare.com/client/v4/accounts/<account_id>/pages/projects/xai-web-console/deployments" \
  --header "Authorization: Bearer <token>" \
  --header "Content-Type: application/json" \
  >/dev/null
```

### 1.6 — Verify by triggering CI

Push an empty commit to `main` to exercise the full CI pipeline:

```bash
git commit --allow-empty -m "ci: trigger first Cloudflare Pages deploy"
git push origin main
```

Watch the GitHub Actions tab for the `Deploy Web to Cloudflare Pages` workflow.
On success, the deployment URL appears in the workflow's step summary.

---

## 2. Rotate Secrets

Run these steps when rotating the Cloudflare API token (e.g., expiry, compromise).

### 2.1 — Revoke the old token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Find the current token (by name) and click **Revoke**.

### 2.2 — Create a new token

Repeat step 1.3 of First-time Setup to create a replacement token with
the three permissions listed there.

### 2.3 — Update GitHub Secret

1. Go to your repository → **Settings → Secrets and variables → Actions**
2. Find `CLOUDFLARE_API_TOKEN` and click **Update**
3. Paste the new token value and click **Save**

`CLOUDFLARE_ACCOUNT_ID` does not change unless you migrate to a new
Cloudflare account (see §6 Disaster Recovery).

### 2.4 — Verify by re-triggering CI

Push an empty commit or re-run the latest workflow from the GitHub Actions
UI:

```bash
git commit --allow-empty -m "ci: verify rotated Cloudflare token"
git push origin main
```

---

## 3. Rollback

Two rollback paths are available. Choose whichever is faster given the
situation.

### Path A — Cloudflare dashboard one-click (recommended for speed)

1. Go to https://dash.cloudflare.com
2. Navigate to **Pages → xai-web-console → Deployments**
3. Find the last known-good deployment (by timestamp or commit hash)
4. Click the three-dot menu → **Rollback to this deployment**

This atomically repoints the production URL to the previous deploy — no
repo changes, no CI run.

### Path B — Wrangler CLI

```bash
# List recent deployments
pnpm dlx wrangler@4.107.1 pages deployment list --project-name xai-web-console

# Activate a specific deployment (use the deployment ID from the list above)
pnpm dlx wrangler@4.107.1 pages deployment activate <deployment-id> \
  --project-name xai-web-console
```

Both paths are immediate and do not require a new build.

---

## 4. Manual Deploy

Use when GitHub Actions is unavailable or you need to deploy from a
local branch without CI.

### Prerequisites

- `wrangler` logged in with a token that has the permissions from §1.3
  (`pnpm dlx wrangler@4.107.1 login`)
- A clean build of `apps/web/dist/`

### Steps

```bash
# 1. Build from the repo root (mock-authenticated mode, matching CI)
VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build

# 2. Deploy from apps/web directory
cd apps/web
pnpm dlx wrangler@4.107.1 pages deploy dist \
  --project-name=xai-web-console \
  --branch=main
```

The deploy output will print the production URL when complete.

To deploy a feature branch as a preview (not production):

```bash
pnpm dlx wrangler@4.107.1 pages deploy dist \
  --project-name=xai-web-console \
  --branch=my-feature-branch
```

---

## 5. Quota Monitoring

Cloudflare Pages free tier limits:

| Metric | Free tier limit | Action when approaching |
|--------|----------------|------------------------|
| Builds / month | 500 | See §5.1 below |
| Static asset requests / bandwidth | Free & unlimited | None — Pages 静态资源请求与带宽在 free/paid 下都不计费/不限量；仅 **Pages Functions** 调用才计入 Workers quota（本项目当前无 Pages Functions）。来源：CF Pages limits / Functions pricing 文档 |
| Files per deploy | 20,000 | See §5.2 below |
| File size | 25 MiB per file | Split large assets or exclude sourcemaps |

### 5.1 — Reducing build count

When approaching 500 builds/month, add a `paths-ignore` filter to suppress
preview deploys on docs-only PRs. Edit `.github/workflows/deploy-web.yml`:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    paths-ignore:
      - 'docs/**'
      - '**/*.md'
      - '.github/**'
```

This reduces preview-deploy triggers for non-code PRs without affecting
production deploys.

### 5.2 — Reducing file count

The current `apps/web/dist/` contains **8 files** (well under the 20K limit).
If future builds grow significantly, consider:
- Excluding hidden sourcemaps from the Pages deploy (requires a post-build
  step to move `.map` files out of `dist/` before wrangler deploys).
- The `apps/web/vite.config.ts` already uses `sourcemap: "hidden"` so
  sourcemaps are not served by the browser, but they ARE uploaded to Pages.

### 5.3 — Monitoring

Visit https://dash.cloudflare.com → **Pages → xai-web-console → Analytics**
to view bandwidth and request counts.

Build usage is visible at https://dash.cloudflare.com → **Pages** (top-level
plan usage card).

---

## 6. Disaster Recovery

**Scenario**: Cloudflare account is locked, lost, or compromised.

### 6.1 — Re-point to a fresh Cloudflare account

1. Create a new Cloudflare account (or use an existing one) at
   https://dash.cloudflare.com/sign-up
2. Follow §1.1–1.3 to log in and create a new API token on the new account
3. Create the Pages project:
   ```bash
   pnpm dlx wrangler@4.107.1 pages project create xai-web-console
   ```
4. Update GitHub Secrets (§2.3) with the new `CLOUDFLARE_API_TOKEN` and the
   new `CLOUDFLARE_ACCOUNT_ID`
5. No repo changes are required — the workflow YAML references secrets by
   name, not by value

### 6.2 — Trigger a fresh deploy

```bash
git commit --allow-empty -m "ci: recover deploy after account migration"
git push origin main
```

CI will deploy the current `main` to the new account's Pages project.

### 6.3 — DNS / custom domain (future)

If a custom domain was configured, re-point its DNS record to the new
Pages project after the migration is verified. (Custom domain is deferred
per ADR-0008 §S4 Assumption 10 — this row ships at `*.pages.dev`.)

---

## Quick-reference — Required GitHub Secrets

| Secret name | Scope |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Account → Cloudflare Pages → Edit, User → Memberships → Read, and Account → Account Settings → Read on the target account |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID visible at https://dash.cloudflare.com/ |

Never commit these values to the repository. Rotate by following §2.
