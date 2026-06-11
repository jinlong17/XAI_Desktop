# Mobile Native Thin Shell MVP - PWA Mobile Smoke

Date: 2026-06-11
Branch: `codex/mobile/native-thin-shell-mvp`
Scope: `apps/web` PWA/mobile baseline before Capacitor wrapper
Verdict: PASS for Web/PWA mobile self-test baseline

## Build Inputs

- Live-auth production build: `pnpm --filter @repo/web build`
- Mock-auth self-test build: `VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build`
- Preview target: `http://localhost:4173/`
- Browser viewport checks: 393x852, 360x800, 768x1024

## Live Auth Gate

Production preview with default live auth redirects `/app` to:

`/auth/login?next=%2Fapp%2Fai`

Evidence:

- 393x852, 360x800, 768x1024 all rendered the login route.
- `rootChildren` was non-zero.
- `manifest.webmanifest`, `theme-color`, and `apple-mobile-web-app-capable` were present.
- `scrollWidth === clientWidth` on all three auth-gate checks.
- Browser console error log was empty.

## Mock Auth App Shell

Mock-auth production build was used only for self-test entry into the app shell.

393x852 full route matrix:

- `/app` -> `/app/ai`
- `/app/ai`
- `/app/tasks`
- `/app/board`
- `/app/dashboard`
- `/app/calendar`
- `/app/matrix`
- `/app/pomodoro`
- `/app/timetrack`
- `/app/bookkeeping`
- `/app/metrics`
- `/app/habits`
- `/app/meditation`
- `/app/countdown`
- `/app/statistics`
- `/app/settings`

All routes rendered non-blank app shell content, detected `main`, and had no console error logs.

Responsive spot checks:

- 360x800: `/app/ai`, `/app/dashboard`, `/app/settings`
- 768x1024: `/app/ai`, `/app/dashboard`, `/app/settings`

All spot checks rendered non-blank app shell content with no console error logs.

## Mobile Overflow Finding And Fix

Initial mock-auth smoke found root-level horizontal overflow:

- 393x852 app shell reported `scrollWidth: 678`, `clientWidth: 393`.
- 360x800 app shell reported `scrollWidth: 628`, `clientWidth: 360`.
- The overflow came from bottom rail scroll content and an unstyled floating pet layer.

Fix applied:

- Web host explicitly imports `@repo/plugin-web-pet/pet.css`.
- `@repo/plugin-web-pet` exports `./pet.css` and marks nested CSS side effects.
- Web global mobile CSS constrains root horizontal overflow and isolates rail scroll painting.

Post-fix evidence:

- 393x852 full route matrix: no failures.
- 360x800 `/app/ai`: `scrollWidth: 360`, `clientWidth: 360`, `railItemsScrollWidth: 750`.
- 393x852 `/app`: `scrollWidth: 393`, `clientWidth: 393`, `railItemsScrollWidth: 750`.
- 768x1024 `/app/ai`: `scrollWidth: 768`, `clientWidth: 768`.
- Floating pet CSS is active on mobile: `petWidth: 56` at 360/393 and `petWidth: 72` at 768.

## Commands Run

```bash
pnpm --filter @repo/web test -- src/__tests__/pwa-manifest.test.ts src/mobile/runtime.test.ts
pnpm --filter @repo/web check-types
pnpm --filter @repo/plugin-web-pet check-types
VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build
rg -n "pet-wrap|pet-bubble|pet-body" apps/web/dist/assets/index-*.css apps/web/dist/assets/*.css
```

Results:

- Web focused tests: PASS, 2 files, 4 tests.
- Web typecheck: PASS.
- Pet package typecheck: PASS.
- Mock-auth production build: PASS.
- Dist CSS contains `.pet-wrap`, `.pet-bubble`, `.pet-body`: PASS.

## Remaining Work

- Capacitor native wrapper not verified in this receipt.
- iOS Simulator and Android debug build remain separate validation steps.
- Bundle warning remains: `index-*.js` is larger than 500 kB. This is not blocking the MVP self-test lane.
