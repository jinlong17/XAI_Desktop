# Discovery Review — desktop-auto-update-release-channel

## Problem Framing

The desktop host already advertises an updater-shaped configuration surface, but that surface is not operational:

- `apps/desktop/src-tauri/tauri.conf.json` still contains placeholder endpoint and public-key values
- `apps/desktop/src-tauri/Cargo.toml` does not yet depend on `tauri-plugin-updater`
- no runtime bridge, settings/status UI, or explicit disabled state exists today

That creates a planning risk: the repo can appear updater-capable while still lacking the minimum ingredients the official Tauri updater requires. This row must close that ambiguity without over-claiming external release readiness.

The target is therefore not "ship production auto-update." The target is:

1. make internal updater status/check behavior real or explicitly unavailable
2. define release-channel metadata and ownership
3. ensure placeholder config cannot masquerade as a live updater
4. keep signing, notarization, and credential gaps visible as explicit gates

## External Research

This row involves an external dependency decision, so current primary-source research was used.

Search queries:

- `site:v2.tauri.app plugin updater Tauri v2 updater endpoints pubkey signature latest.json`
- `site:tauri.app updater plugin v2 release channel windows target arch latest.json`
- `site:github.com tauri-apps plugins-workspace updater v2 readme`
- `site:v2.tauri.app updater permissions tauri-plugin-updater updater:default`

Key evidence:

- Official updater docs: https://v2.tauri.app/plugin/updater/
- Official JS updater reference: https://v2.tauri.app/reference/javascript/updater/
- Official plugin repository mirror: https://github.com/tauri-apps/tauri-plugin-updater

Relevant findings from those sources:

- Tauri updater signatures are required and cannot be disabled; the updater needs a real public key plus signed updater artifacts.
- `bundle.createUpdaterArtifacts` must be enabled for updater bundles/signatures to be created.
- runtime endpoint overrides are supported through `updater_builder().endpoints(...)`, which is suitable for separate release channels
- runtime public-key overrides are also supported, which is suitable for key rotation or host-controlled gating
- the plugin requires explicit capability permission such as `updater:default` or narrower updater permissions
- the official plugin is stack-native for this repo, supports macOS, and is maintained in Tauri’s official plugins workspace under Apache-2.0 / MIT licensing

## Repo Truth Anchors

- Live placeholders:
  - `apps/desktop/src-tauri/tauri.conf.json`
- Existing release-gate doc:
  - `docs/release/versioning.md`
- Existing host-injected bridge precedent:
  - `apps/desktop/src-tauri/src/desktop_notification_adapter.js`
  - `apps/desktop/src-tauri/src/desktop_global_hotkey_adapter.js`
  - `packages/desktop-native-notifications-reminders/`
  - `packages/desktop-global-hotkey-quick-open/`
- Existing desktop settings surfaces:
  - `packages/plugin-web-settings-rest/src/panes/aboutPane.tsx`
  - `packages/plugin-web-settings-rest/src/panes/morePane.tsx`

## Candidate Options

### Option A — Treat the static `tauri.conf.json` updater block as the real path and wire the official plugin directly

Add `tauri-plugin-updater`, keep the updater configured primarily through `tauri.conf.json`, add the JS guest API, and expose an in-app check/install flow immediately.

Pros:

- Fastest path to a real updater check/install flow
- Uses the official plugin as designed
- Minimal conceptual gap from the official docs

Cons:

- The current placeholder endpoint/public-key values become dangerous because the static config looks live
- Pulling JS guest bindings into shared web code would fight the repo’s browser-safety rule unless a separate seam is added anyway
- Static config makes internal-channel separation and placeholder rejection less explicit than a host-controlled runtime builder
- Easy to over-read as "production updater is now ready" when Apple signing/notarization are still open gates

### Option B — Keep updater disabled and add only explicit unavailable/admin messaging

Do not add a live updater yet. Instead, add a feature-owned status surface that reports updater disabled/unavailable until real keys, endpoint, and signing flow exist.

Pros:

- Safest interpretation of the current baseline
- Makes the deferred state honest immediately
- Avoids accidental release claims

Cons:

- Does not satisfy the stronger "suitable for internal builds" interpretation if the team wants a real internal updater rehearsal now
- Pushes real updater-integration risk entirely to a later row

### Option C — Guarded hybrid: official Tauri updater plus host-owned runtime preflight and internal-only check/status contract

Adopt the official updater plugin, but do not treat static placeholders as live config. Instead:

- move real updater enablement behind a feature-owned runtime preflight
- select release channel at runtime from explicit host metadata
- expose a browser-safe updater bridge and status UI
- freeze this row to manual `check()` plus status only
- treat missing endpoint/public key as explicit `disabled` or `unavailable` states
- surface `install_unavailable` when an update is detected but install remains intentionally out of scope
- defer updater-artifact creation and full install flow until real internal signing/private-key/release-host infrastructure exists

Pros:

- Best match for the requirement: internal updater status/check support is possible without pretending production readiness
- Keeps the official Tauri updater as the chosen dependency
- Fits existing repo patterns: host-owned bridge, browser-safe web bundle, Rust-owned guard logic
- Gives the build phase a real implementation target while preserving explicit gates and a conservative install freeze
- Makes placeholder values testable failure states instead of silent landmines

Cons:

- More moving parts than Option B
- Requires a small host bridge package plus Rust command/config work
- Still cannot prove external release readiness without later signing/notarization evidence

## Recommendation

Choose Option C.

The repo is already committed to Tauri 2, already carries updater placeholders, and already uses host-injected desktop bridges for browser-safe native features. Option C is the only choice that:

- respects the internal-build requirement
- prevents placeholder config from being misread as live
- keeps `apps/web` free of direct `@tauri-apps/*` imports
- preserves the hard rule that missing signing/notarization evidence must remain explicit
- freezes install scope conservatively enough for this roadmap row

## Selected Design Direction

### 1. Ownership split

Recommended owning slice:

- `packages/desktop-auto-update-release-channel/`

Recommended responsibilities:

- browser-safe `/web` entrypoint
- updater runtime snapshot types
- reason-code mapping
- settings/about status integration hooks
- test fixtures for placeholder rejection and release-channel display

Recommended thin host responsibilities:

- add `tauri-plugin-updater`
- own runtime preflight and channel resolution in Rust
- own manual check orchestration in Rust
- inject a desktop updater adapter into the main webview

### 2. Live runtime shape

Prefer a host-controlled updater adapter, consistent with the current desktop bridge pattern:

- `apps/web` imports only `@repo/desktop-auto-update-release-channel/web`
- the desktop host injects `window.__XAI_DESKTOP_UPDATER__`
- the browser-safe package consumes that adapter only when the runtime profile is the desktop Tauri path

Prefer the Rust side to own the real updater preflight and check calls through `UpdaterExt` and `updater_builder()` rather than treating the static placeholder config as authoritative. That gives the feature one place to:

- reject placeholder endpoint/public-key values
- select `internal-rc` vs `internal-canary`
- attach explicit headers or query parameters if needed
- return typed status to the web runtime
- keep install unavailable in this row even when a valid update is detected

### 3. Release-channel contract

Freeze the minimum release-channel metadata contract as:

- `channel`: `disabled` | `internal-rc` | `internal-canary`
- `currentVersion`: desktop app version from the shipped host build
- `endpointTemplate`: host-owned template, not a checked-in placeholder treated as live
- `publicKeyState`: `missing` | `placeholder` | `configured`
- `availability`: `disabled` | `ready` | `checking` | `update-available` | `up-to-date` | `error`
- `reasonCode`:
  - `channel_disabled`
  - `missing_endpoint`
  - `placeholder_endpoint`
  - `missing_pubkey`
  - `placeholder_pubkey`
  - `updater_not_configured`
  - `install_unavailable`
  - `network_error`
  - `invalid_manifest`
  - `signature_error`

Production/public channels are intentionally out of scope for this row.

### 4. Install freeze and build-path separation

Keep the current canonical desktop build promise intact:

- `pnpm --filter desktop build`
- `pnpm --filter desktop build:dmg`

This row does not add a live updater-artifact build path. The plan goal is explicit separation:

- default desktop build: normal app artifact, no implied updater readiness
- current feature build: updater status/check bridge only
- future updater-install build: only after real internal endpoint/public key/private signing key inputs exist

This separation avoids silently turning the Phase 1/Phase 2 default build into a production updater promise.

### 5. UI/status surface

Add explicit updater status to an existing desktop settings surface rather than inventing a new shell. Preferred surface:

- extend `About` to show:
  - current desktop version
  - current release channel
  - updater state
  - `Check for Updates` action
  - explicit "install unavailable in this build" copy when `update-available` is detected
  - explicit admin message when disabled/unavailable

If the build phase finds `About` too cramped, `More` is the fallback, but the status should remain close to version/build information.

## Risks

- The repo could accidentally widen permissions too far if the build phase adds coarse updater capability while this row still exposes only check/status behavior
- Real updater install still depends on a private signing key and controlled update host; this row must keep that downstream gate visible instead of backfilling a partial install path
- Apple signing/notarization are orthogonal to Tauri updater signing, but users may conflate them; the UI/docs must not
- A static placeholder left anywhere in the live runtime path would undermine the whole row

## Resolved Decisions

- This row owns `check/status-only`; full download/install is deferred to a future row or increment after real internal signing/private-key/release-host infrastructure exists.
- The internal updater should use a dynamic endpoint or runtime-built URL, because the channel separation requirement is explicit and official docs support runtime endpoint selection.
- Release channel remains host-owned for this row to avoid user-state drift and accidental production-channel exposure.

## Planned Build Outline

1. **Native updater foundation and placeholder guard**
   - add `tauri-plugin-updater`
   - add runtime preflight in Rust
   - inject a browser-safe desktop updater adapter
   - make placeholder endpoint/public-key values resolve to explicit disabled/unavailable status
2. **Release-channel metadata and in-app status**
   - freeze channel enum and snapshot contract
   - wire status into Settings → About (preferred) or `More`
   - expose manual `Check for Updates` action with explicit messages
   - do not expose install UI in this row
3. **Verification and deferred install gate**
   - add tests and manual smoke steps that distinguish placeholder rejection, `up-to-date`, `update-available`, and `install_unavailable`
   - keep updater-artifact signing/build and full install explicitly deferred behind real internal endpoint/public key/private signing key prerequisites
