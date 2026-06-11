# Mobile Native Thin Shell MVP - iOS Simulator Smoke

Date: 2026-06-11
Branch: `codex/mobile/native-thin-shell-mvp`
Scope: `apps/mobile/ios`
Verdict: PARTIAL_BUILD_PASS_BOOT_REQUIRED

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

## Remaining Manual Gate

No iPhone Simulator was booted during the run, so install + launch verification was intentionally skipped.

Current status:

```text
STATUS: PARTIAL_BUILD_PASS_BOOT_REQUIRED
```

This is no longer an Xcode environment blocker. It means the native iOS build is green, but a booted simulator is still required to prove the WebView launches and is not blank.

## Reproduction Command

Commands:

```bash
pnpm --filter @repo/mobile run verify:ios:self-test -- --allow-blocked
```

Observed:

```text
xcode-select: /Applications/Xcode.app/Contents/Developer
Xcode 26.5
Build version 17F42
selected simulator: iPhone 17 Pro
launch: skipped until the user boots an iPhone simulator.
** BUILD SUCCEEDED **
STATUS: PARTIAL_BUILD_PASS_BOOT_REQUIRED
```

## Unlock Criteria

Boot an iPhone Simulator, then rerun the same self-test runner:

```bash
open -a Simulator
pnpm --filter @repo/mobile run verify:ios:self-test -- --skip-sync
```

PASS requires:

- `xcrun simctl install` succeeds against the booted iPhone Simulator.
- `xcrun simctl launch` succeeds for bundle id `com.jinlong.xai.mobile`.
- The app renders the mock-auth Web UI without a blank WebView.
