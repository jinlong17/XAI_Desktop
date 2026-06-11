# Mobile Native Thin Shell MVP - iOS Simulator Smoke

Date: 2026-06-11
Branch: `codex/mobile/native-thin-shell-mvp`
Scope: `apps/mobile/ios`
Verdict: PASS

## What Passed

- `pnpm --filter @repo/mobile cap:add:ios` generated `apps/mobile/ios/`.
- `pnpm --filter @repo/mobile sync:self-test` copied the mock-auth Web build into the iOS wrapper.
- `pnpm --filter @repo/mobile run doctor` reported Capacitor iOS dependencies as healthy:
  - `@capacitor/cli: 8.4.0`
  - `@capacitor/core: 8.4.0`
  - `@capacitor/ios: 8.4.0`
  - `@capacitor/android: 8.4.0`
- `pnpm --filter @repo/mobile run verify:ios:self-test -- --allow-blocked` completed the repeatable iOS self-test runner through native build:
  - selected Xcode developer directory: `/Applications/Xcode.app/Contents/Developer`
  - Xcode: `26.5` / build `17F42`
  - selected simulator destination: `iPhone 17 Pro`
  - Web self-test sync passed before native build
  - `xcodebuild` Debug simulator build succeeded
  - app bundle produced at `apps/mobile/ios/DerivedData/Build/Products/Debug-iphonesimulator/App.app`
- `pnpm --filter @repo/mobile run verify:ios:self-test -- --destination "iPhone 17 Pro Max"` passed end-to-end after the Capacitor asset-path fix:
  - `VITE_CAPACITOR_BUILD=1 VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build` passed.
  - `cap sync ios` copied relative-path Web assets into the iOS wrapper.
  - `xcodebuild` Debug simulator build succeeded for `iPhone 17 Pro Max`.
  - `xcrun simctl bootstatus` returned `Device already booted, nothing to do.`
  - `xcrun simctl install` succeeded.
  - `xcrun simctl launch --terminate-running-process` succeeded for `com.jinlong.xai.mobile` and returned PID `19969`.
  - Simulator screenshot inspection showed a nonblank Web UI: search bar, chat drawer, bottom navigation, and floating pet rendered.

## Runtime Fix

The first iOS launch exposed a blank WebView even though the app installed. Root cause was the Web build copied into Capacitor using root-relative asset URLs such as `/assets/...`, which are correct for the normal Web deployment but fragile under the Capacitor local scheme.

Fix:

- `apps/web/vite.config.ts` uses `base: "./"` only when `VITE_CAPACITOR_BUILD=1`.
- `apps/mobile` Web build scripts set `VITE_CAPACITOR_BUILD=1`.
- `apps/web/index.html` uses `%BASE_URL%` for PWA/icon links.
- `apps/web/src/service-worker/register.ts` skips service-worker registration inside native Capacitor and uses `BASE_URL` for normal production registration.
- `scripts/mobile/verify-ios.mjs` now waits for simulator boot readiness, uses bounded install/launch timeouts, and launches with `--terminate-running-process`.

## Reproduction Command

Commands:

```bash
pnpm --filter @repo/mobile run verify:ios:self-test -- --destination "iPhone 17 Pro Max"
```

Observed:

```text
xcode-select: /Applications/Xcode.app/Contents/Developer
Xcode 26.5
Build version 17F42
selected simulator: iPhone 17 Pro Max (3DFD2634-00A9-4B6B-BD66-12B8B6C57FED, Booted)
** BUILD SUCCEEDED **
Device already booted, nothing to do.
com.jinlong.xai.mobile: 19969
STATUS: PASS
bundle: com.jinlong.xai.mobile
simulator: iPhone 17 Pro Max (3DFD2634-00A9-4B6B-BD66-12B8B6C57FED)
```

## Notes

The first iOS 26.5 simulator boot took several minutes and temporarily reported `Waiting on Data Migration` / `Waiting on System App`. This was a simulator runtime readiness delay, not an app build failure. The verifier now waits for boot readiness before install/launch so this state is explicit.

Physical iPhone signing / on-device install remains separate and was not run in this receipt.
