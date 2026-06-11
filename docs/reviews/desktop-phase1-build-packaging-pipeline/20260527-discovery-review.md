# Discovery Review — desktop-phase1-build-packaging-pipeline

## Problem Framing

The first two Phase 1 blockers are already largely closed:

- `desktop-tauri-web-dist-normal-window` shipped the normal-window handoff from the legacy overlay shell to `apps/web`
- `desktop-web-auth-offline-mode` wired desktop dev/build through `VITE_WEB_AUTH_MODE=mock-authenticated`

What remains is the packaging contract itself. Today the repo still has a mismatch between "desktop host" intent and the operator-facing commands:

- `apps/desktop/package.json` still exposes `dev`, `build`, and `preview` as raw `@repo/web` scripts rather than canonical desktop packaging entrypoints
- `apps/desktop/src-tauri/tauri.conf.json` is already correct on the critical source-of-truth fields:
  - `beforeDevCommand = VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web dev`
  - `beforeBuildCommand = VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build`
  - `frontendDist = ../../web/dist`
- Prior feature verification already proved the app-bundle path works:
  - `pnpm --filter desktop tauri build --debug --bundles app`
  - artifact: `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
- The release note at `docs/release/dmg-build.md` is stale for ADR-0011 Phase 1 because its manual smoke still references the old transparent/control/account-export surface

Local packaging evidence gathered during this planning pass:

- `pnpm --filter desktop tauri build --debug --bundles dmg` rebuilt `@repo/web`, compiled the Rust app, emitted `X Desktop.app`, then reached:
  - `Bundling X Desktop_1.0.0-rc.1_aarch64.dmg`
  - `Running bundle_dmg.sh`
- Tauri then spawned `/usr/bin/osascript /var/folders/.../createdmg.tmp... dmg...`
- After more than one minute, no `.dmg` file appeared under `apps/desktop/src-tauri/target/debug/bundle/dmg/`; only `bundle_dmg.sh` and `icon.icns` existed
- The process had to be manually terminated

Result: the packaging gap is no longer "can Tauri see the web dist?" It is "can the desktop package own a clean Phase 1 operator workflow, produce an app artifact deterministically, and record the DMG path accurately when local macOS image tooling stalls?"

## External Research

No external research required. This is an internal packaging-contract and local-tooling verification decision.

## Candidate Options

### Option A — Canonicalize desktop package scripts around Tauri and treat app bundle as the minimum local artifact

Make `apps/desktop` the single operator entrypoint for Phase 1 packaging:

- `dev` runs the desktop Tauri shell
- `build` produces the Phase 1 `.app` artifact through the existing Tauri/web-dist contract
- `build:dmg` attempts DMG creation explicitly
- a documented smoke path launches the built app offline and checks single-window startup
- DMG failure is recorded with the exact local blocker when Finder/AppleScript image tooling stalls

Pros:

- Aligns package scripts with the actual product boundary: desktop host, not raw web package
- Reuses the already-correct `tauri.conf.json` source-of-truth fields instead of duplicating dist paths elsewhere
- Makes the successful `.app` bundle the deterministic local artifact even when DMG creation is environment-sensitive
- Preserves strict P1 scope: no web refactor, no Phase 2 native work, no Phase 3 persistence work
- Creates a clean handoff for `feature-build` and `feature-verify`

Cons:

- DMG may remain locally flaky in unattended/headless-like sessions because Tauri's DMG helper relies on Finder AppleScript prettification
- Requires script naming changes that may affect habitual local commands
- Needs explicit documentation so app-bundle success is not mistaken for full installer proof

### Option B — Add a custom wrapper script outside the package contract and keep existing desktop scripts mostly web-centric

Leave `apps/desktop/package.json` largely as-is, then add one custom shell or Node helper to run Tauri build, artifact checks, and offline smoke.

Pros:

- Smaller visible change to existing package scripts
- Could capture more custom logging around the DMG stage

Cons:

- Splits the operator contract across Tauri config, ad hoc helper scripts, and package scripts
- Keeps `apps/desktop` semantically confusing: desktop package scripts still point at web-only behavior
- Increases documentation drift risk because the helper becomes the real contract while `package.json` says otherwise

### Option C — Expand scope to solve signing/notarization/updater or broader desktop runtime cleanup now

Treat this feature as the place to solve notarized installers, updater artifacts, or stale legacy runtime warnings.

Pros:

- Could close more future packaging concerns in one pass

Cons:

- Violates the user’s Phase 1 scope constraints
- Pulls in Apple signing/notarization dependencies that are explicitly not required for this feature-plan
- Risks scope-creep into Phase 2 native polish or unrelated desktop cleanup

## Recommendation

Choose Option A.

The repo already has the correct build ownership in `tauri.conf.json`; the missing piece is a clean desktop-facing packaging workflow and a precise verification contract. Option A keeps the existing `apps/web` dist integration intact, upgrades `apps/desktop` scripts to match the real product surface, and treats the `.app` bundle as the minimum local artifact while still attempting `.dmg` generation explicitly.

The observed DMG stall is not a reason to widen scope. It is a reason to make blocker recording first-class:

- if `.dmg` succeeds locally, verify it
- if `.dmg` stalls in Finder/AppleScript tooling, record the exact stage and fall back to `.app` bundle verification plus manual install-risk residuals

Option B keeps the contract muddy. Option C is out of scope.

## Selected Execution Notes

- Keep `apps/desktop/src-tauri/tauri.conf.json` as the canonical owner of web-dist integration and desktop mock-auth build hooks
- Re-shape `apps/desktop/package.json` so operator-facing scripts align to desktop behavior, not raw web behavior
- Update `docs/release/dmg-build.md` to Phase 1 normal-window reality:
  - single normal window
  - offline `/app` launch
  - no overlay/control/grid default startup
  - app-bundle fallback when DMG tooling stalls
- Add a feature-local smoke artifact or review note that records:
  - command used
  - artifact path
  - offline launch result
  - whether any extra windows started
  - whether DMG succeeded or stalled at `bundle_dmg.sh` / `osascript`

## Risks

- The DMG helper may keep stalling in local unattended sessions because it depends on Finder AppleScript behavior rather than pure CLI packaging
- Script renames can confuse existing habits if the docs and package contract are not updated together
- A successful `.app` bundle does not prove installer drag-copy flow, quarantine behavior, or upgrade/reinstall behavior on clean macOS hardware
- Overlay/control/grid code still exists in the repo; verification must check that packaging changes do not accidentally reactivate that startup path

## Open Questions

- Should `apps/desktop/package.json` make `build` mean `.app` bundle or a pure web build? Recommendation: `.app` bundle, because this package is now a desktop host
- Should there be a separate `build:web` passthrough for local debugging? Recommendation: yes, if needed, but it must be secondary to desktop packaging scripts
- Can the local DMG stall be mitigated by a non-prettified create-dmg mode later? Recommendation: maybe, but that is a build-phase investigation item, not a planning-time architecture change

## Phased Build Outline

1. Canonicalize desktop package scripts and document the Tauri/web-dist packaging contract.
2. Add a local smoke path for app-bundle offline launch and explicitly verify single-window startup with no overlay/control/grid activation.
3. Attempt `.dmg` generation through a named script, then either verify the produced installer or record the exact local tooling blocker and use `.app` bundle verification as the accepted substitute for this environment.
