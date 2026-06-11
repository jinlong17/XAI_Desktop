# Mobile Native Thin Shell MVP - iOS Simulator Smoke

Date: 2026-06-11
Branch: `codex/mobile/native-thin-shell-mvp`
Scope: `apps/mobile/ios`
Verdict: BLOCKED_ENVIRONMENT

## What Passed

- `pnpm --filter @repo/mobile cap:add:ios` generated `apps/mobile/ios/`.
- `pnpm --filter @repo/mobile sync:self-test` copied the mock-auth Web build into the iOS wrapper.
- `pnpm --filter @repo/mobile run doctor` reported Capacitor iOS dependencies as healthy:
  - `@capacitor/cli: 8.4.0`
  - `@capacitor/core: 8.4.0`
  - `@capacitor/ios: 8.4.0`
  - `@capacitor/android: 8.4.0`

## Blocker

The machine does not currently have a full Xcode developer directory selected, and `simctl` is unavailable.

Commands:

```bash
xcodebuild -version
xcrun simctl list devices available
xcode-select -p
ls -1 /Applications | rg '^Xcode' || true
```

Observed:

```text
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance
xcrun: error: unable to find utility "simctl", not a developer tool or in PATH
/Library/Developer/CommandLineTools
```

No `Xcode*.app` entry was found under `/Applications`.

## Unlock Criteria

Install Xcode, then select it:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
xcodebuild -downloadPlatform iOS
```

Then rerun:

```bash
pnpm --filter @repo/mobile sync:self-test
xcodebuild -project apps/mobile/ios/App/App.xcodeproj -scheme App -configuration Debug -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 16' build
```

PASS requires the simulator build to succeed and the app to launch without a blank WebView.
