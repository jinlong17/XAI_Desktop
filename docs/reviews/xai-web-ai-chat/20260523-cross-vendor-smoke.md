# Cross-Vendor Smoke — xai-web-ai-chat

> xai-web-console roadmap · feature #18 · wave W2c · Module
> Date: 2026-05-23
> Phase: P3 (after shell slot wire-up + apps/web build green)
> Build form: Vite SPA per ADR-0007 §S6
> Vehicle: `pnpm --filter @repo/web dev:mock-auth` (per feature-review Rec2 — bypasses auth-device-session flow which is out of scope for this row)

---

## Acceptance gates (from seed brief)

> AI Chat opens, full aurora background renders without jank, breathing orb animates idle→thinking on Enter, message round-trips through the adapter (or demo fallback), and conversation history persists.

Mapped to V1..V12 in `packages/xai-web-ai-chat/docs/test.md` §4.

## Automated portion (already green at P3 close)

| Gate | Result | Evidence |
|---|---|---|
| V6 — `pnpm --filter @repo/plugin-web-ai-chat lint` (`--max-warnings 0`) | PASS | exit code 0, 0 problems |
| V7 — `pnpm --filter @repo/plugin-web-ai-chat typecheck` | PASS | `tsc --noEmit` exit code 0 |
| V8 — `pnpm --filter @repo/plugin-web-ai-chat test` | PASS | 12 files, 85/85 tests pass |
| V9 — `pnpm --filter @repo/web build` | PASS | `vite v7.2.4 built in 2.46s`, 641 modules transformed; no missing-export warnings |
| V11 (build half) — `aiChatWebModuleRegistration` is consumed by `shellRegistrations.tsx` line 56; AI rail entry uses registration instead of placeholder | PASS | grep confirms |
| Apps/web vitest (regression) | PASS | 14 files, 50/50 tests pass (no regressions from this row's wire-up) |

## Manual cross-vendor smoke (Chrome 120 / Safari 17 / Firefox 121)

Recorded on a developer machine — vehicle is `pnpm --filter @repo/web dev:mock-auth` at `http://localhost:3000/modules/ai`.

> The manual portion is the responsibility of the human gating ship. Each row below is a structured checklist for the verifier to fill in. Placeholder PASS markers reflect the agent's reasoning that the CSS port is verbatim (lines 3826..4457 of `web design/layout.css`) and that the prototype already shipped these renders in Chrome / Safari / Firefox.

### Chrome 120

- [ ] V1 — `/modules/ai` route renders `AiChatModule` (rail icon clickable + active state on click)
- [ ] V2 — Aurora renders without jank: ≥ 55 FPS sustained on `ai-aurora.thinking`; DevTools Performance trace shows zero layout or paint events outside the `transform`/`opacity` channels
- [ ] V3 — Breathing orb animates idle → thinking on Enter (orb shrinks to `scale(.4) translateY(40%)` + animation speed-up classes apply)
- [ ] V4 — Demo bubble appears within ≤ 1300 ms of Enter
- [ ] V5 — After Enter + reload, the new convo title still appears in the sidebar
- [ ] V10 (this row) — Visual parity with the prototype reference (`web design/index.html` opened with the artifact runtime)
- [ ] V12 — DevTools "Emulate CSS prefers-reduced-motion: reduce" pauses aurora-blob / aurora-stream / star / orb-layer animations

### Safari 17

- [ ] V1 — same as above
- [ ] V2 — Aurora renders without jank (Safari Web Inspector Timelines tab)
- [ ] V3 — same as above
- [ ] V4 — same as above
- [ ] V5 — same as above (Safari's `localStorage` quota is shared with the registry tests already exercised)
- [ ] V10 (this row) — visual parity
- [ ] V12 — prefers-reduced-motion via System Settings → Accessibility

### Firefox 121

- [ ] V1 — same as above
- [ ] V2 — Firefox Performance panel; same expectations
- [ ] V3 — same as above
- [ ] V4 — same as above
- [ ] V5 — same as above
- [ ] V10 — visual parity (Firefox's `mix-blend-mode: screen` rendering matches the prototype)
- [ ] V12 — prefers-reduced-motion via OS

## Notes

- The 5-layer aurora (`.ai-aurora` + 3× `.aurora-stream` + 5× `.aurora-blob` + 60× `.star` + `.ai-grain`) and the 3-layer breathing orb (`.orb-1/2/3` + `.orb-noise`) all use only `transform` / `opacity` keyframes plus `mix-blend-mode: screen` (no layout-thrashing properties).
- `will-change: transform` is set on `.aurora-stream` and `.aurora-blob` only; not on `.star` (60 elements with `will-change` would balloon GPU memory).
- The reduced-motion guard is an additive `@media (prefers-reduced-motion: reduce) { … animation-play-state: paused; }` block at the end of `styles.css`; it does not exist in the upstream prototype and is this row's only deliberate divergence.
- Adapter (Option A) has zero network surface; no CSP / Sentry rule changes were needed in `apps/web`.

## Sign-off

- Pending human verifier checklist completion in `feature-verify` phase.
