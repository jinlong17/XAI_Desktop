#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

cd "$REPO_ROOT"
exec node scripts/dashboard/open.mjs
