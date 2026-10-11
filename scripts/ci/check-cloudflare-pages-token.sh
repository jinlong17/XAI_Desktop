#!/usr/bin/env bash
# check-cloudflare-pages-token.sh
#
# Verifies that the current Cloudflare credentials can see the XAI Pages
# project before running a Pages deployment.
#
# Required env:
#   CLOUDFLARE_API_TOKEN
#   CLOUDFLARE_ACCOUNT_ID
#
# Optional env:
#   WRANGLER_VERSION (default: 4.107.1)
#   CLOUDFLARE_PAGES_PROJECT (default: xai-web-console)

set -euo pipefail

WRANGLER_VERSION="${WRANGLER_VERSION:-4.107.1}"
CLOUDFLARE_PAGES_PROJECT="${CLOUDFLARE_PAGES_PROJECT:-xai-web-console}"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] || [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "::error::Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID."
  exit 1
fi

projects_file="$(mktemp)"
if ! pnpm dlx "wrangler@${WRANGLER_VERSION}" pages project list >"${projects_file}" 2>&1; then
  cat "${projects_file}"
  echo "::error title=Cloudflare credentials rejected::Wrangler could not list Cloudflare Pages projects for this account. Recreate or update CLOUDFLARE_API_TOKEN with Account -> Cloudflare Pages -> Edit, User -> Memberships -> Read, and Account -> Account Settings -> Read on the target account. Avoid Zone -> Custom Pages; it is a different Cloudflare product."
  echo "::error::Local verification command: CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account_id> WRANGLER_VERSION=${WRANGLER_VERSION} bash scripts/ci/check-cloudflare-pages-token.sh"
  exit 1
fi

cat "${projects_file}"
if ! grep -q "${CLOUDFLARE_PAGES_PROJECT}" "${projects_file}"; then
  echo "::error::Cloudflare credentials are valid, but ${CLOUDFLARE_PAGES_PROJECT} is not visible to this token/account. Confirm CLOUDFLARE_ACCOUNT_ID and token account-resource scope."
  exit 1
fi

echo "PASS: Cloudflare credentials can access Pages project ${CLOUDFLARE_PAGES_PROJECT}."
