# Mobile Native Thin Shell MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the mobile line to an active self-test lane, make the existing Web app usable as a mobile PWA, then wrap the same Web build with a Capacitor iOS/Android thin shell for fast personal testing.

**Architecture:** Keep `apps/web` as the source of truth for product UI and business behavior. Add only mobile-safe shell metadata, runtime detection, safe-area/touch layout fixes, and a new `apps/mobile` Capacitor wrapper that points at the Web production build. Do not fork Web features into a separate native UI codebase during this MVP.

**Tech Stack:** React 19, Vite 7, pnpm 9, Capacitor, iOS Simulator/Xcode, Android Studio/Gradle, existing Turborepo workspace.

---

## Current Branch And Route

- Branch: `codex/mobile/native-thin-shell-mvp`
- Base: latest `origin/web` at `64cdf9a2`
- Operator decision: mobile native line is unfrozen for rapid self-test development.
- Routing result: promote mobile from `future_surfaces` planning-only into an active `mobile` self-test lane, while keeping reusable UI ownership in `web`.
- Merge target: do not merge into `dev`; this branch should eventually merge toward `web` for shared PWA work and keep native mobile wrapper review separate until the new lane is documented.

## Scope

In scope:

- Governance update so future agent/workflow runs stop blocking iPhone/Android work as planning-only.
- PWA manifest, mobile metadata, basic offline shell behavior, and installability checks.
- Mobile viewport/safe-area/touch target fixes for the existing Web shell.
- `apps/mobile` Capacitor wrapper using `apps/web/dist`.
- iOS Simulator smoke, optional iPhone device smoke, Android emulator/debug APK smoke.
- Personal self-test matrix for core modules.

Out of scope for this MVP:

- SwiftUI rewrite.
- React Native rewrite.
- Push notifications, widgets, share sheet, biometric unlock, deep native settings, App Store/TestFlight release.
- Cloud account sync expansion unless a specific tested feature already uses `syncScope: account-sync`.

## File Structure

Governance and routing:

- Modify `CLAUDE.md`: add `mobile` as operator-unfrozen active self-test lane and preserve `web -> app` D3 wording.
- Modify `AGENTS.md`: mirror the mobile route so Codex sessions classify mobile work correctly.
- Modify `.cursor/rules/product-module-routing.mdc`: mirror routing for Cursor.
- Modify `docs/PRODUCT_MODULE_MAP.md`: add mobile row and branch/workflow guidance.
- Modify `docs/MODULE_BOUNDARIES.md`: define mobile as thin native shell over Web, not a separate feature rewrite.
- Modify `docs/planning/LONG_TERM_PRODUCT_ROADMAP.md`: move iPhone/Android thin shell from planning-only to active self-test lane, leaving Watch/iPad dedicated native as later.
- Modify `docs/workflow/project/module-classification.json`: add `mobile` module and update `future_surfaces`.
- Modify `docs/workflow/project/dashboard-state.json`: reflect mobile active self-test lane after running dashboard sync/generation.
- Modify `docs/workflow/project/release-log.md`: record mobile lane unfreeze and branch creation.

Web/PWA:

- Modify `apps/web/index.html`: add mobile/PWA meta tags and manifest links.
- Create `apps/web/public/manifest.webmanifest`: install metadata.
- Create `apps/web/public/icons/xai-mobile-icon.svg`: temporary self-test icon.
- Create `apps/web/src/mobile/runtime.ts`: detect mobile/PWA/Capacitor contexts.
- Create `apps/web/src/mobile/runtime.test.ts`: deterministic runtime tests.
- Modify `apps/web/src/styles/global.css`: safe-area, touch, viewport, and overflow defaults.
- Modify `apps/web/public/sw.js`: bump cache name and include manifest/icon shell assets.
- Modify `apps/web/src/__tests__/pwa-manifest.test.ts`: assert manifest exists and has required fields.

Native wrapper:

- Create `apps/mobile/package.json`: mobile scripts and Capacitor dependencies.
- Create `apps/mobile/capacitor.config.ts`: app id, app name, `webDir`, scheme, and server settings.
- Create `apps/mobile/README.md`: local iOS/Android runbook.
- Generate `apps/mobile/ios/` via `pnpm --filter @repo/mobile cap:add:ios`.
- Generate `apps/mobile/android/` via `pnpm --filter @repo/mobile cap:add:android`.
- Modify root `package.json`: add convenience scripts only if useful, for example `mobile:sync`, `mobile:ios`, `mobile:android`.

## Task 1: Governance Promotion

**Files:**
- Modify: `CLAUDE.md`
- Modify: `AGENTS.md`
- Modify: `.cursor/rules/product-module-routing.mdc`
- Modify: `docs/PRODUCT_MODULE_MAP.md`
- Modify: `docs/MODULE_BOUNDARIES.md`
- Modify: `docs/planning/LONG_TERM_PRODUCT_ROADMAP.md`
- Modify: `docs/workflow/project/module-classification.json`
- Modify: `docs/workflow/project/release-log.md`

- [ ] **Step 1: Record the route decision**

Add one clear rule everywhere routing is mirrored:

```text
Mobile native thin shell is operator-unfrozen for self-test MVP work. It lives on `codex/mobile/<feature>` branches, starts from `web`, reuses `apps/web` UI/build output, and may create `apps/mobile` as a Capacitor wrapper. Mobile work must not be routed through `dev` or the Mac desktop `app` lane unless a Mac-specific change is required.
```

- [ ] **Step 2: Add `mobile` to `module-classification.json`**

Add a module object after `web`:

```json
{
  "key": "mobile",
  "name": "Mobile native thin shell",
  "surface": ["apps/mobile/", "apps/web/ mobile PWA metadata"],
  "main_branch": "mobile self-test lane",
  "short_branch": "codex/mobile/<feature>",
  "status": "operator-unfrozen-self-test",
  "signals": ["iPhone", "Android", "Capacitor", "PWA installability", "mobile WebView", "mobile safe-area", "touch-first layout"],
  "form": "thin native shell over the Web build",
  "data": "reuse Web storage first; account-sync only for explicitly syncable entities"
}
```

Update the `future_surfaces.rule` so iPhone/Android native thin shell is excluded from planning-only only for this self-test lane. Keep Apple Watch and dedicated iPad native as planning-only.

- [ ] **Step 3: Generate dashboard state**

Run:

```bash
pnpm dashboard
pnpm dashboard:verify-static
pnpm dashboard:verify-modules
```

Expected:

- `pnpm dashboard` updates `docs/prototypes/dev-dashboard/state.generated.js` if the registry is consumed there.
- `dashboard:verify-static` passes.
- `dashboard:verify-modules` passes or reports only a known dashboard schema gap that must be fixed before commit.

- [ ] **Step 4: Commit governance**

Run:

```bash
git status --short
git add CLAUDE.md AGENTS.md .cursor/rules/product-module-routing.mdc docs/PRODUCT_MODULE_MAP.md docs/MODULE_BOUNDARIES.md docs/planning/LONG_TERM_PRODUCT_ROADMAP.md docs/workflow/project/module-classification.json docs/workflow/project/release-log.md docs/workflow/project/dashboard-state.json docs/prototypes/dev-dashboard/state.generated.js
git commit -m "docs(mobile): unfreeze native thin shell self-test lane"
```

Expected:

- Commit succeeds.
- No product source is changed in this commit.

## Task 2: PWA Metadata And Install Shell

**Files:**
- Modify: `apps/web/index.html`
- Create: `apps/web/public/manifest.webmanifest`
- Create: `apps/web/public/icons/xai-mobile-icon.svg`
- Modify: `apps/web/public/sw.js`
- Create: `apps/web/src/__tests__/pwa-manifest.test.ts`

- [ ] **Step 1: Add manifest test**

Create `apps/web/src/__tests__/pwa-manifest.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("PWA manifest", () => {
  it("declares installable mobile shell metadata", () => {
    const manifestPath = resolve(process.cwd(), "public/manifest.webmanifest");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("/app");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1);
    expect(manifest.icons[0].purpose).toContain("maskable");
  });
});
```

- [ ] **Step 2: Run test and confirm it fails before implementation**

Run:

```bash
pnpm --filter @repo/web test -- src/__tests__/pwa-manifest.test.ts
```

Expected:

- FAIL because `public/manifest.webmanifest` does not exist yet.

- [ ] **Step 3: Create manifest**

Create `apps/web/public/manifest.webmanifest`:

```json
{
  "name": "XAI Mobile",
  "short_name": "XAI",
  "description": "XAI mobile self-test shell",
  "start_url": "/app",
  "scope": "/",
  "display": "standalone",
  "background_color": "#f7f7f2",
  "theme_color": "#111314",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/xai-mobile-icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 4: Create temporary icon**

Create `apps/web/public/icons/xai-mobile-icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="XAI">
  <rect width="512" height="512" rx="112" fill="#111314"/>
  <path d="M150 156h64l45 70 47-70h60l-74 101 78 111h-64l-49-78-53 78h-62l82-111-74-101Z" fill="#f7f7f2"/>
</svg>
```

- [ ] **Step 5: Add mobile metadata to HTML**

In `apps/web/index.html`, add inside `<head>`:

```html
<meta name="theme-color" content="#111314" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="XAI" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="icon" href="/icons/xai-mobile-icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/icons/xai-mobile-icon.svg" />
```

- [ ] **Step 6: Update service worker cache**

In `apps/web/public/sw.js`, change:

```js
const CACHE_NAME = "xai-web-shell-v2";
const APP_SHELL_URLS = ["/", "/index.html", "/manifest.webmanifest", "/icons/xai-mobile-icon.svg"];
```

- [ ] **Step 7: Verify Web PWA shell**

Run:

```bash
pnpm --filter @repo/web test -- src/__tests__/pwa-manifest.test.ts
pnpm --filter @repo/web build
```

Expected:

- Test passes.
- Build succeeds.
- `apps/web/dist/manifest.webmanifest` exists.
- `apps/web/dist/icons/xai-mobile-icon.svg` exists.

- [ ] **Step 8: Commit PWA metadata**

Run:

```bash
git add apps/web/index.html apps/web/public/manifest.webmanifest apps/web/public/icons/xai-mobile-icon.svg apps/web/public/sw.js apps/web/src/__tests__/pwa-manifest.test.ts
git commit -m "feat(web): add mobile pwa install shell"
```

## Task 3: Mobile Runtime Detection And CSS Baseline

**Files:**
- Create: `apps/web/src/mobile/runtime.ts`
- Create: `apps/web/src/mobile/runtime.test.ts`
- Modify: `apps/web/src/styles/global.css`

- [ ] **Step 1: Add runtime tests**

Create `apps/web/src/mobile/runtime.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getMobileRuntimeFlags } from "./runtime";

describe("getMobileRuntimeFlags", () => {
  it("detects standalone display mode", () => {
    const flags = getMobileRuntimeFlags({
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      maxTouchPoints: 5,
      standalone: true,
      displayModeStandalone: true,
      capacitorNative: false,
    });

    expect(flags.isMobileLike).toBe(true);
    expect(flags.isStandalone).toBe(true);
    expect(flags.isCapacitor).toBe(false);
  });

  it("detects Capacitor native shell", () => {
    const flags = getMobileRuntimeFlags({
      userAgent: "Mozilla/5.0 (Linux; Android 15)",
      maxTouchPoints: 5,
      standalone: false,
      displayModeStandalone: false,
      capacitorNative: true,
    });

    expect(flags.isMobileLike).toBe(true);
    expect(flags.isStandalone).toBe(true);
    expect(flags.isCapacitor).toBe(true);
  });
});
```

- [ ] **Step 2: Run test and confirm it fails**

Run:

```bash
pnpm --filter @repo/web test -- src/mobile/runtime.test.ts
```

Expected:

- FAIL because `runtime.ts` does not exist.

- [ ] **Step 3: Implement runtime helper**

Create `apps/web/src/mobile/runtime.ts`:

```ts
export type MobileRuntimeProbe = {
  userAgent: string;
  maxTouchPoints: number;
  standalone: boolean;
  displayModeStandalone: boolean;
  capacitorNative: boolean;
};

export type MobileRuntimeFlags = {
  isMobileLike: boolean;
  isStandalone: boolean;
  isCapacitor: boolean;
};

export function getBrowserMobileRuntimeProbe(): MobileRuntimeProbe {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const capacitorNative = Boolean((window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());

  return {
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    standalone: Boolean(nav.standalone),
    displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
    capacitorNative,
  };
}

export function getMobileRuntimeFlags(probe: MobileRuntimeProbe): MobileRuntimeFlags {
  const ua = probe.userAgent.toLowerCase();
  const isMobileLike = probe.maxTouchPoints > 1 || /iphone|ipad|android|mobile/.test(ua);
  const isStandalone = probe.standalone || probe.displayModeStandalone || probe.capacitorNative;

  return {
    isMobileLike,
    isStandalone,
    isCapacitor: probe.capacitorNative,
  };
}
```

- [ ] **Step 4: Add CSS baseline**

Append to `apps/web/src/styles/global.css`:

```css
html {
  min-height: 100%;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

body {
  min-width: 320px;
  min-height: 100dvh;
  overscroll-behavior-y: none;
  -webkit-tap-highlight-color: transparent;
}

button,
a,
input,
select,
textarea {
  touch-action: manipulation;
}

@supports (padding: max(0px)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-right: env(safe-area-inset-right);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
  }
}

@media (max-width: 767px) {
  body {
    font-size: var(--fs-md, 14.5px);
  }

  [role="button"],
  button,
  input,
  select,
  textarea {
    min-height: 44px;
  }
}
```

- [ ] **Step 5: Verify runtime and baseline**

Run:

```bash
pnpm --filter @repo/web test -- src/mobile/runtime.test.ts
pnpm --filter @repo/web check-types
pnpm --filter @repo/web build
```

Expected:

- Runtime tests pass.
- Typecheck passes.
- Build passes.

- [ ] **Step 6: Commit runtime baseline**

Run:

```bash
git add apps/web/src/mobile/runtime.ts apps/web/src/mobile/runtime.test.ts apps/web/src/styles/global.css
git commit -m "feat(web): add mobile runtime and touch baseline"
```

## Task 4: Mobile Visual Smoke On Web/PWA

**Files:**
- No required source changes unless smoke finds layout breakage.
- If fixes are needed, modify the specific package CSS file that owns the broken module.

- [ ] **Step 1: Start production preview**

Run:

```bash
pnpm --filter @repo/web build
pnpm --filter @repo/web preview -- --host 0.0.0.0
```

Expected:

- Preview prints a local URL, usually `http://localhost:4173/`.

- [ ] **Step 2: Desktop browser mobile viewport smoke**

Open `http://localhost:4173/app` in Chrome or the in-app browser and test viewports:

```text
iPhone SE: 375 x 667
iPhone 15 Pro: 393 x 852
iPad mini portrait: 768 x 1024
Android compact: 360 x 800
```

Pass criteria:

- App shell loads without blank screen.
- Primary navigation is reachable.
- No horizontal page scroll at 360px width.
- Buttons are tappable and not clipped.
- Text does not overlap in the first screen of each tested module.

- [ ] **Step 3: Module self-test matrix**

Test these routes or module entries in mobile viewport:

```text
Auth / app entry: loads and reaches authenticated shell in mock/self-test mode.
Tasks: create, edit, complete, refresh.
Board: open board, move/open card if available, refresh.
Calendar: open month/week/day view, create or inspect item if available.
Pomodoro: start, pause, reset.
Habits: check in one habit, refresh.
Time tracker: start/stop or add sample entry.
Bookkeeping: add sample record if module supports local entry.
AI chat: open panel, verify empty/provider state does not break layout.
Settings: open appearance/features/rest panes.
Command palette: open and select a module.
```

Pass criteria:

- Each module opens on a phone viewport.
- Any unsupported action fails gracefully with visible UI, not console crash.
- Local changes survive a refresh when the module already supports browser persistence.

- [ ] **Step 4: Record smoke result**

Create or update a review note:

```bash
mkdir -p docs/reviews/mobile-native-thin-shell
```

File name:

```text
docs/reviews/mobile-native-thin-shell/20260611-pwa-mobile-smoke.md
```

Minimum content:

```markdown
# PWA Mobile Smoke Result — 2026-06-11

Branch: codex/mobile/native-thin-shell-mvp
Build: pnpm --filter @repo/web build
Preview URL: http://localhost:4173/app

## Verdict

PASS | PARTIAL | BLOCKED

## Viewports

- iPhone SE:
- iPhone 15 Pro:
- iPad mini:
- Android compact:

## Module Matrix

- Tasks:
- Board:
- Calendar:
- Pomodoro:
- Habits:
- Time tracker:
- Bookkeeping:
- AI chat:
- Settings:
- Command palette:

## Issues

- None, or list exact module + viewport + symptom.
```

- [ ] **Step 5: Commit smoke evidence**

Run:

```bash
git add docs/reviews/mobile-native-thin-shell/20260611-pwa-mobile-smoke.md
git commit -m "test(mobile): record pwa mobile smoke"
```

## Task 5: Capacitor Mobile Wrapper

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/capacitor.config.ts`
- Create: `apps/mobile/README.md`
- Modify: `package.json` if adding root shortcuts.
- Modify: `pnpm-lock.yaml` after install.

- [ ] **Step 1: Add mobile package**

Create `apps/mobile/package.json`:

```json
{
  "name": "@repo/mobile",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build:web": "pnpm --filter @repo/web build",
    "cap": "cap",
    "cap:add:ios": "cap add ios",
    "cap:add:android": "cap add android",
    "sync": "pnpm run build:web && cap sync",
    "sync:ios": "pnpm run build:web && cap sync ios",
    "sync:android": "pnpm run build:web && cap sync android",
    "open:ios": "pnpm run sync:ios && cap open ios",
    "open:android": "pnpm run sync:android && cap open android"
  },
  "dependencies": {
    "@capacitor/android": "^7.0.0",
    "@capacitor/core": "^7.0.0",
    "@capacitor/ios": "^7.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^7.0.0",
    "typescript": "5.9.2"
  }
}
```

- [ ] **Step 2: Add Capacitor config**

Create `apps/mobile/capacitor.config.ts`:

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jinlong.xai.mobile",
  appName: "XAI",
  webDir: "../web/dist",
  bundledWebRuntime: false,
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
```

- [ ] **Step 3: Add mobile runbook**

Create `apps/mobile/README.md`:

```markdown
# XAI Mobile Self-Test Shell

This app is a Capacitor thin shell over `apps/web/dist`.

## First install

```bash
pnpm install
pnpm --filter @repo/mobile cap:add:ios
pnpm --filter @repo/mobile cap:add:android
```

## Sync latest Web build

```bash
pnpm --filter @repo/mobile sync
```

## iOS Simulator

```bash
pnpm --filter @repo/mobile open:ios
```

In Xcode, select an iPhone simulator and Run.

## Android

```bash
pnpm --filter @repo/mobile open:android
```

In Android Studio, select an emulator and Run.
```
```

- [ ] **Step 4: Install dependencies**

Run:

```bash
pnpm install
```

Expected:

- `pnpm-lock.yaml` updates with Capacitor packages.
- `apps/mobile/node_modules` may be linked by pnpm.

- [ ] **Step 5: Generate native projects**

Run:

```bash
pnpm --filter @repo/mobile cap:add:ios
pnpm --filter @repo/mobile cap:add:android
```

Expected:

- `apps/mobile/ios/` exists.
- `apps/mobile/android/` exists.

- [ ] **Step 6: Sync Web into native wrappers**

Run:

```bash
pnpm --filter @repo/mobile sync
```

Expected:

- Web build succeeds.
- Capacitor copies `apps/web/dist` into iOS and Android native assets.

- [ ] **Step 7: Commit mobile wrapper**

Run:

```bash
git add apps/mobile package.json pnpm-lock.yaml
git commit -m "feat(mobile): add capacitor thin shell"
```

## Task 6: iOS Simulator Verification

**Files:**
- Create: `docs/reviews/mobile-native-thin-shell/20260611-ios-simulator-smoke.md`
- Native generated files may change if Xcode updates project metadata.

- [ ] **Step 1: Confirm Xcode tools**

Run:

```bash
xcodebuild -version
xcrun simctl list devices available | rg "iPhone"
```

Expected:

- Xcode version prints.
- At least one available iPhone simulator is listed.

- [ ] **Step 2: Build iOS debug app from CLI**

Run:

```bash
pnpm --filter @repo/mobile sync:ios
xcodebuild -workspace apps/mobile/ios/App/App.xcworkspace -scheme App -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 16' build
```

If `iPhone 16` is not available, replace it with an exact simulator name from `simctl`.

Expected:

- `xcodebuild` exits 0.
- No signing error for simulator build.

- [ ] **Step 3: Run in simulator**

Run:

```bash
pnpm --filter @repo/mobile open:ios
```

In Xcode:

- Select an available iPhone simulator.
- Press Run.

Pass criteria:

- App launches to XAI Web shell.
- No permanent white screen after 10 seconds.
- Safe area is respected at top and bottom.
- Navigation and module entry work by touch.
- Refresh/relaunch preserves local state for modules that already persist in Web.

- [ ] **Step 4: Record iOS evidence**

Create `docs/reviews/mobile-native-thin-shell/20260611-ios-simulator-smoke.md`:

```markdown
# iOS Simulator Smoke Result — 2026-06-11

Branch: codex/mobile/native-thin-shell-mvp
Command: xcodebuild -workspace apps/mobile/ios/App/App.xcworkspace -scheme App -configuration Debug -destination 'platform=iOS Simulator,name=<device>' build

## Verdict

PASS | PARTIAL | BLOCKED

## Device

- Simulator:
- iOS version:
- Xcode version:

## Checks

- Launch:
- No white screen:
- Safe area:
- Navigation:
- Tasks:
- Board:
- Calendar:
- Pomodoro:
- Settings:
- Relaunch persistence:

## Issues

- None, or exact symptom.
```

- [ ] **Step 5: Commit iOS evidence**

Run:

```bash
git add docs/reviews/mobile-native-thin-shell/20260611-ios-simulator-smoke.md apps/mobile/ios
git commit -m "test(mobile): record ios simulator smoke"
```

## Task 7: Android Debug Verification

**Files:**
- Create: `docs/reviews/mobile-native-thin-shell/20260611-android-debug-smoke.md`
- Native generated files may change if Android Studio updates project metadata.

- [ ] **Step 1: Confirm Android tools**

Run:

```bash
java -version
adb devices
```

Expected:

- Java prints a version compatible with Android Gradle plugin.
- `adb devices` lists an emulator or attached debug device.

- [ ] **Step 2: Build Android debug APK**

Run:

```bash
pnpm --filter @repo/mobile sync:android
cd apps/mobile/android
./gradlew assembleDebug
```

Expected:

- Build exits 0.
- APK exists at `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

- [ ] **Step 3: Install and launch**

Run:

```bash
adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.jinlong.xai.mobile 1
```

Pass criteria:

- App launches to XAI Web shell.
- Android back button does not trap the user on a blank route.
- Touch navigation works.
- Local state survives force close/reopen for modules that already persist in Web.

- [ ] **Step 4: Record Android evidence**

Create `docs/reviews/mobile-native-thin-shell/20260611-android-debug-smoke.md`:

```markdown
# Android Debug Smoke Result — 2026-06-11

Branch: codex/mobile/native-thin-shell-mvp
APK: apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk

## Verdict

PASS | PARTIAL | BLOCKED

## Device

- Emulator/device:
- Android version:
- Java version:

## Checks

- APK build:
- Install:
- Launch:
- Navigation:
- Tasks:
- Board:
- Calendar:
- Pomodoro:
- Settings:
- Relaunch persistence:

## Issues

- None, or exact symptom.
```

- [ ] **Step 5: Commit Android evidence**

Run:

```bash
git add docs/reviews/mobile-native-thin-shell/20260611-android-debug-smoke.md apps/mobile/android
git commit -m "test(mobile): record android debug smoke"
```

## Task 8: Final Validation Gate

**Files:**
- Modify: `docs/workflow/project/release-log.md`
- Modify: `docs/workflow/project/dashboard-state.json`
- Modify: `docs/prototypes/dev-dashboard/state.generated.js`

- [ ] **Step 1: Run repo checks**

Run:

```bash
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test
pnpm --filter @repo/web build
pnpm --filter @repo/mobile sync
pnpm lint
pnpm check-types
git diff --check
```

Expected:

- All commands pass.
- If repo-wide `pnpm lint` or `pnpm check-types` fails due unrelated existing debt, record exact failing package/test and still require the scoped Web/mobile checks above to pass.

- [ ] **Step 2: Run native build checks**

Run iOS if Xcode is installed:

```bash
xcodebuild -workspace apps/mobile/ios/App/App.xcworkspace -scheme App -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 16' build
```

Run Android if Android tooling is installed:

```bash
cd apps/mobile/android
./gradlew assembleDebug
```

Expected:

- iOS simulator build passes or is documented as `BLOCKED_ENVIRONMENT` with exact missing tool/device.
- Android debug build passes or is documented as `BLOCKED_ENVIRONMENT` with exact missing tool/device.

- [ ] **Step 3: Update release log**

Add a short entry to `docs/workflow/project/release-log.md`:

```markdown
## 2026-06-11 — Mobile native thin shell MVP self-test lane

- Branch: `codex/mobile/native-thin-shell-mvp`
- Status: PASS | PARTIAL | BLOCKED
- Added mobile self-test lane governance, Web PWA install shell, and Capacitor iOS/Android thin shell.
- Evidence:
  - `docs/reviews/mobile-native-thin-shell/20260611-pwa-mobile-smoke.md`
  - `docs/reviews/mobile-native-thin-shell/20260611-ios-simulator-smoke.md`
  - `docs/reviews/mobile-native-thin-shell/20260611-android-debug-smoke.md`
```

- [ ] **Step 4: Regenerate dashboard**

Run:

```bash
pnpm dashboard
pnpm dashboard:verify-static
pnpm dashboard:verify-modules
```

Expected:

- Dashboard reflects mobile lane status.
- Dashboard verification passes.

- [ ] **Step 5: Commit final verification**

Run:

```bash
git add docs/workflow/project/release-log.md docs/workflow/project/dashboard-state.json docs/prototypes/dev-dashboard/state.generated.js
git commit -m "docs(mobile): record thin shell verification"
```

## Final Acceptance Criteria

The branch is ready for personal self-testing when all required items are true:

- Governance files classify mobile as active self-test lane.
- `apps/web` builds with PWA metadata.
- Mobile viewport smoke has a written result.
- `apps/mobile` exists and Capacitor sync succeeds.
- iOS simulator launches or is explicitly `BLOCKED_ENVIRONMENT`.
- Android debug APK builds/launches or is explicitly `BLOCKED_ENVIRONMENT`.
- Scoped commands pass:

```bash
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test
pnpm --filter @repo/web build
pnpm --filter @repo/mobile sync
git diff --check
```

Optional but preferred:

```bash
pnpm lint
pnpm check-types
```

## Self-Test Checklist For The Operator

Use this after the first mobile build is installed:

- Launch app from home screen.
- Open app, close app, reopen app.
- Switch between main modules.
- Create one task.
- Complete one task.
- Open board/project view.
- Open calendar.
- Start and pause pomodoro.
- Check in one habit.
- Add one time tracking or bookkeeping sample if available.
- Open AI chat and verify provider/key empty state is usable.
- Open settings and change appearance if supported.
- Turn network off, reopen app, confirm shell still loads.
- Turn network on, refresh, confirm no stale white screen.

## Commit Strategy

Use small commits in this order:

1. `docs(mobile): unfreeze native thin shell self-test lane`
2. `feat(web): add mobile pwa install shell`
3. `feat(web): add mobile runtime and touch baseline`
4. `test(mobile): record pwa mobile smoke`
5. `feat(mobile): add capacitor thin shell`
6. `test(mobile): record ios simulator smoke`
7. `test(mobile): record android debug smoke`
8. `docs(mobile): record thin shell verification`

## Risk Controls

- Do not touch `dev` for this work.
- Do not route Web-to-Mac changes outside D3.
- Do not rewrite feature modules for native during MVP.
- Treat native simulator/device gaps as `BLOCKED_ENVIRONMENT`, not PASS.
- If a mobile layout issue is inside a package, fix that package's CSS rather than adding global overrides that hide desktop regressions.
- If adding account/cloud sync becomes necessary, run `xai-account-sync-scope-check` before changing entities.
