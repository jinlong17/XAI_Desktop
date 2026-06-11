# XAI Mobile Self-Test Shell

This app is a Capacitor thin shell over `apps/web/dist`. It exists for fast iOS and Android self-testing and does not fork Web product UI.

## First Install

```bash
pnpm install
pnpm --filter @repo/mobile cap:add:ios
pnpm --filter @repo/mobile cap:add:android
```

## Sync Latest Web Build

Live-auth build:

```bash
pnpm --filter @repo/mobile sync
```

Self-test build that enters the app shell with mock auth:

```bash
pnpm --filter @repo/mobile sync:self-test
```

## iOS Simulator

```bash
pnpm --filter @repo/mobile open:ios:self-test
```

In Xcode, select an iPhone simulator and Run.

## Android

```bash
pnpm --filter @repo/mobile open:android:self-test
```

In Android Studio, select an emulator and Run.

## Verification Targets

- App launches without a blank WebView.
- `/app/ai`, `/app/tasks`, `/app/dashboard`, `/app/settings` render in the native shell.
- No root-level horizontal scroll at phone width.
- Status bar does not overlay Web content.
- Offline shell assets load after one successful launch.
