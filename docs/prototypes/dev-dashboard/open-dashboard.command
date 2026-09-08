#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if [[ -d "$HOME/.nvm/versions/node" ]]; then
  for NODE_BIN in "$HOME"/.nvm/versions/node/*/bin(N); do
    [[ -d "$NODE_BIN" ]] && export PATH="$NODE_BIN:$PATH"
  done
fi

cd "$REPO_ROOT"
exec node scripts/dashboard/open.mjs
