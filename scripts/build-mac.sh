#!/usr/bin/env bash
set -euo pipefail

#############################################
# Configurable variables
#############################################
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${PROJECT_ROOT}/apps/desktop"
OUTPUT_DIR="${HOME}/Desktop/XAI_Builds"
BUNDLE_ID="com.xai.desktop.app"

#############################################
# Helpers
#############################################
log() { printf "\033[1;34m[build]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[error]\033[0m %s\n" "$*" >&2; }

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "Missing required binary: $1"
    exit 1
  fi
}

#############################################
# Pre-flight checks
#############################################
log "Project root: ${PROJECT_ROOT}"
log "App directory: ${APP_DIR}"
log "Output directory: ${OUTPUT_DIR}"
log "Bundle identifier: ${BUNDLE_ID}"

require_bin pnpm
require_bin rustc

if [ ! -f "${APP_DIR}/src-tauri/tauri.conf.json" ]; then
  err "tauri.conf.json not found under ${APP_DIR}/src-tauri"
  exit 1
fi

if grep -q '"identifier": *"com.tauri.dev"' "${APP_DIR}/src-tauri/tauri.conf.json"; then
  log "Updating default bundle identifier to ${BUNDLE_ID}"
  sed -i '' "s/\"identifier\": *\"com\\.tauri\\.dev\"/\"identifier\": \"${BUNDLE_ID}\"/" \
    "${APP_DIR}/src-tauri/tauri.conf.json"
fi

#############################################
# Install and build
#############################################
log "Installing dependencies..."
(cd "${PROJECT_ROOT}" && pnpm install)

log "Building Tauri app..."
(cd "${APP_DIR}" && pnpm tauri build)

#############################################
# Collect artifacts
#############################################
timestamp="$(date +%Y%m%d-%H%M%S)"
bundle_base="${APP_DIR}/src-tauri/target/release/bundle"

find_artifact() {
  find "${bundle_base}" -type f -name "*.${1}" -maxdepth 3 2>/dev/null | head -n 1
}

app_path="$(find_artifact "app")"
dmg_path="$(find_artifact "dmg")"

if [ -z "${app_path}" ] && [ -z "${dmg_path}" ]; then
  err "No .app or .dmg found under ${bundle_base}"
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"

if [ -n "${app_path}" ]; then
  app_name="$(basename "${app_path}")"
  new_app="${OUTPUT_DIR}/AI-Desktop-${timestamp}.app"
  log "Copying ${app_name} -> ${new_app}"
  cp -R "${app_path}" "${new_app}"
  log "Success: ${new_app}"
fi

if [ -n "${dmg_path}" ]; then
  dmg_name="$(basename "${dmg_path}")"
  new_dmg="${OUTPUT_DIR}/AI-Desktop-${timestamp}.dmg"
  log "Copying ${dmg_name} -> ${new_dmg}"
  cp "${dmg_path}" "${new_dmg}"
  log "Success: ${new_dmg}"
fi

log "Build complete."
