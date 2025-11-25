# Build Guide (macOS)

## Prerequisites
- Node.js 18+ and `pnpm` (package manager).
- Rust toolchain (via rustup).
- Xcode Command Line Tools (for linking on macOS).

## Configuration
- Script path: `scripts/build-mac.sh`
- Editable variables at the top of the script:
  - `PROJECT_ROOT`: defaults to repo root.
  - `APP_DIR`: defaults to `apps/desktop`.
  - `OUTPUT_DIR`: defaults to `~/Desktop/XAI_Builds`.
  - `BUNDLE_ID`: defaults to `com.xai.desktop.app` (script will replace default `com.tauri.dev` if present).

## How to Run
```bash
chmod +x scripts/build-mac.sh
./scripts/build-mac.sh
```
The script will install dependencies, run `pnpm tauri build`, and copy `.app` / `.dmg` artifacts to `OUTPUT_DIR` with a timestamped name.

## Troubleshooting
- **Unidentified Developer warning**: macOS Gatekeeper may block unsigned builds. You can clear quarantine attributes:
  ```bash
  xattr -cr /path/to/YourApp.app
  ```
- **Debugging build failures**:
  - Run manually inside app dir: `cd apps/desktop && pnpm tauri build --debug`
  - Check Rust toolchain: `rustc --version`
  - Ensure pnpm is on PATH: `pnpm -v`
- **Identifier mismatch**: The script auto-replaces `com.tauri.dev` in `tauri.conf.json` with `BUNDLE_ID`. Adjust `BUNDLE_ID` if needed.
