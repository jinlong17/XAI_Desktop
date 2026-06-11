# Mobile Native Thin Shell MVP - Android Debug Smoke

Date: 2026-06-11
Branch: `codex/mobile/native-thin-shell-mvp`
Scope: `apps/mobile/android`
Verdict: BLOCKED_ENVIRONMENT

## What Passed

- `pnpm --filter @repo/mobile cap:add:android` generated `apps/mobile/android/`.
- `pnpm --filter @repo/mobile sync:self-test` copied the mock-auth Web build into the Android wrapper.
- Native assets exist at `apps/mobile/android/app/src/main/assets/public/index.html`.
- `pnpm --filter @repo/mobile run doctor` reported Capacitor Android dependencies as healthy:
  - `@capacitor/cli: 8.4.0`
  - `@capacitor/core: 8.4.0`
  - `@capacitor/android: 8.4.0`
  - `@capacitor/ios: 8.4.0`

## Blocker

The machine does not currently have a Java Runtime available, and no Android SDK path was detected.

Commands:

```bash
java -version
/usr/libexec/java_home -V
cd apps/mobile/android && ./gradlew --version
ls -d "$HOME/Library/Android/sdk" "$ANDROID_HOME" "$ANDROID_SDK_ROOT" 2>/dev/null || true
```

Observed:

```text
The operation couldn’t be completed. Unable to locate a Java Runtime.
Please visit http://www.java.com for information on installing Java.
```

No Android SDK path was found from the checked locations or environment variables.

## Unlock Criteria

Install a JDK and Android Studio or Android command-line SDK, then set:

```bash
export JAVA_HOME=$(/usr/libexec/java_home)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH"
```

Then rerun:

```bash
pnpm --filter @repo/mobile sync:self-test
cd apps/mobile/android
./gradlew assembleDebug
```

PASS requires `app/build/outputs/apk/debug/app-debug.apk` to be created and installable on an emulator or attached Android device.
