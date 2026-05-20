#!/usr/bin/env bash
# Thin bash -> python3 wrapper for setup_subagents_v2.py.
# PORTABLE REFERENCE SCRIPT — copy verbatim alongside setup_subagents_v2.py into
# `<repo>/scripts/`. Assumes both files sit in `<repo>/scripts/`; no per-project
# edits needed (ROOT is derived from this script's own location).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec python3 "$ROOT/scripts/setup_subagents_v2.py" "$@"
