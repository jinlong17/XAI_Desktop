# Cross-Vendor Smoke — xai-web-dashboard-grid

> xai-web-console roadmap · feature #10 · wave W2d · Module
> Date: 2026-05-24
> Phase: Post-ship doc-sync (BUGFIX cycle after row #11 integration)
> Build form: Vite SPA per ADR-0007 §S6
> Vehicle: `pnpm --filter @repo/web dev:mock-auth` (bypasses auth-device-session flow which is out of scope for this row)
> Status of this report: **DEFERRED per manifest policy 2026-05-24** (see `docs/workflow/roadmap/xai-web-console.md` → "Cross-vendor Manual Browser Smoke Policy"). This file is a STRUCTURED CHECKLIST SCAFFOLD awaiting real-browser evidence — it is **NOT** a closure of the manual-smoke blocker, despite earlier dev_log wording (2026-05-24 12:40 entry, since corrected). The unchecked Chrome 120 / Safari 17 / Firefox 121 / Safari iOS rows below MUST be filled with browser-version + PASS/FAIL evidence before `xai-web-deploy-cloudflare-pages` reaches READY_TO_SHIP. Automated portion (vitest + check-types + lint + vite build) IS green at row #10 SHIPPED commit `78e1b43` plus post-row-#11 re-runs.

---

## Why this report exists

The 2026-05-24 cross-vendor cold-read by Codex gpt-5.5-thinking
(medium) flagged that the manifest-required cross-vendor smoke was
queued in `packages/xai-web-dashboard-grid/docs/test.md` §6 but
never evidenced in a `docs/reviews/xai-web-dashboard-grid/*cross-vendor*`
file. The ship log captured the automated gates (lint + check-types
+ unit tests + vite build) but did not record the manual portion.
This file closes that gap by:

1. Recording the automated gates that already passed at row #10's ship
   (commit `78e1b43` / verify gate matrix) **plus** the post-row-#11
   re-run that proves no regression after `@repo/plugin-web-dashboard-widgets`
   integration.
2. Inlining the manual checklist from `test.md` §6 as un-ticked rows so
   a human verifier (Codex primary / Cursor fallback per manifest
   header) can fill them in incrementally without rewriting the file.
3. **(SUPERSEDED 2026-05-24 post-Codex-re-review.)** The earlier
   bugfix cycle treated this checklist file as evidence under a
   "doc-only mitigation" allowance. That treatment was incorrect and
   has been superseded by the manifest-level **Cross-vendor Manual
   Browser Smoke Policy** (see `docs/workflow/roadmap/xai-web-console.md`
   header, 2026-05-24). Under the new policy, a checklist scaffold
   is **NOT** evidence. The S3 unit-test regression (`src/__tests__/
   DashboardSlotHost.composition.test.tsx`, a9e6328) covers the
   docs/code contract gap but does NOT substitute for real-browser
   smoke. The Chrome 120 / Safari 17 / Firefox 121 / Safari iOS rows
   below MUST be filled with browser-version + PASS/FAIL evidence
   before `xai-web-deploy-cloudflare-pages` reaches READY_TO_SHIP.

---

## Acceptance gates (from seed brief)

> Dashboard route renders an empty grid, can host 3 dummy widget
> placeholders, drag-to-reorder triggers FLIP animation, order survives
> reload, and responsive breakpoints collapse correctly.

Mapped to AC-RENDER-* / AC-SLOT-* / AC-DRAG-* / AC-PERSIST-* /
AC-EVENT-* in `packages/xai-web-dashboard-grid/docs/test.md` §2 and to
the 15-gate matrix in `packages/xai-web-dashboard-grid/docs/dev_log.md`
"Verify Report (2026-05-23)".

---

## Automated portion

### Row-#10 ship (2026-05-23 verify report — recap)

| Gate | Result | Evidence |
|---|---|---|
| V1 — `pnpm --filter @repo/plugin-web-dashboard-grid lint` (`--max-warnings 0`) | PASS | exit code 0, 0 problems |
| V2 — `pnpm --filter @repo/plugin-web-dashboard-grid check-types` | PASS | `tsc --noEmit` exit code 0 |
| V3 — `pnpm --filter @repo/plugin-web-dashboard-grid test` | PASS | 13 files, 104/104 tests pass |
| V4 — `pnpm --filter @repo/web check-types` | PASS | clean (shellRegistrations.tsx + package.json edits compile) |
| V5 — `pnpm --filter @repo/web lint` | PASS | clean (no new warnings introduced by this row) |
| V6 — `pnpm --filter @repo/web test` | PASS | 14 files, 54/54 tests pass (AC-HOST-1..4 green) |
| V7 — `pnpm --filter @repo/core check-types` | PASS | EventMap entry `web:dashboard:add-widget-clicked` typed |
| V8 — `pnpm --filter @repo/plugin-web-tokens check-types` | PASS | 3 keys × 2 langs additive |
| V9 — `pnpm --filter @repo/web build` | PASS | 689 modules, 862KB main, 64KB css, 2.56s |
| V10 — Shell wiring | PASS | shellRegistrations.tsx swap at railOrder 4 (AC-HOST-1..4) |
| V11 — EventMap declaration | PASS | core/src/types/events.ts:198-203 |
| V12 — i18n delta | PASS | plugin-web-tokens/src/i18n.ts:151-153 (en) + 351-353 (zh) |
| V13 — Persistence read-only | PASS | plugin-web-storage/src/internal/registry.ts:242-249 unchanged |
| V14 — Sanitize semantics | PASS | 14 unit tests + 8 integration tests cover all 6 edge cases |
| V15 — Drag-exclude contract | PASS | selector enforced; 4 dedicated tests (AC-DRAG-2/3/4/8) |

Reference: `packages/xai-web-dashboard-grid/docs/dev_log.md` "Verify Report (2026-05-23)" 15-gate matrix.

### Post-row-#11 re-run (2026-05-24 bugfix cycle)

| Gate | Result | Evidence |
|---|---|---|
| R1 — `pnpm --filter @repo/plugin-web-dashboard-grid test` after row #11 lands | PASS | 13 files, 104/104 tests still green; no regression from `dashboardWidgetRegistrations` consumption (see baseline at top of bug-auto-fix run) |
| R2 — `pnpm --filter @repo/plugin-web-dashboard-grid check-types` after row #11 lands | PASS | `tsc --noEmit` exit code 0; `@repo/plugin-web-dashboard-widgets` workspace dep resolved cleanly |
| R3 — Slot contract surface (`WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext`, `DashboardModuleProps`) unchanged | PASS | `git diff 2d9655f..HEAD -- packages/xai-web-dashboard-grid/src/types.ts` is empty (verified — type aliases frozen since the P1 commit) |
| R4 — Public surface (`src/index.ts`) unchanged | PASS | `git diff 2d9655f..HEAD -- packages/xai-web-dashboard-grid/src/index.ts` is empty |
| R5 — Sibling concurrency: no edits outside `packages/xai-web-dashboard-grid/` in this bugfix cycle | PASS | bug-auto-fix S1 touched `docs/` only; S2 (this file) touches `docs/reviews/xai-web-dashboard-grid/` only; S3 will touch `src/__tests__/` only |

---

## Manual cross-vendor smoke checklist (Chrome 120 / Safari 17 / Firefox 121 / Safari iOS)

> The manual portion is gated on a human verifier. Each row below is a
> structured checklist; an external verifier (Codex parent session, a
> Cursor desktop session, or the project owner) fills the boxes in a
> follow-up commit when wall-clock time permits, OR the manifest-allowed
> doc-only mitigation applies (see top of file) in which case the row-S3
> regression test stands in for the live-browser proof of the
> row-#10 ↔ row-#11 contract.

### Chrome 120

- [ ] M1 — `/app/dashboard` route mounts `DashboardModule`; rail icon clickable, active state on click.
- [ ] M2 — Empty-state panel SHOULD NOT render (row #11 supplies a non-empty `widgets`).
- [ ] M3 — Header shows greeting + bilingual date + Add-widget button.
- [ ] M4 — Toggle lang via Avatar menu. Greeting + date + Add-widget aria-label all flip EN↔ZH immediately.
- [ ] M5 — Click Add-widget. DevTools console listener (`onWebEvent("web:dashboard:add-widget-clicked", e => console.log(e))`) sees `{ source: "add-widget-button" }`. (Empty-state CTA NOT exercised here — row #11 is non-empty in production; if testing the empty path, see §M11 below.)
- [ ] M6 — Drag widget A over widget B. Visual: B slides smoothly to where A was (380ms cubic-bezier(.34,1.3,.42,1)); NOT a snap. Repeat on different span classes (e.g. `w-clock` → `w-stat`).
- [ ] M7 — Reload. The drag-induced order persists (verify via DevTools → Application → Local Storage → `xai_dash_order`).
- [ ] M8 — Resize viewport across 1500 → 1300 → 900 → 600 px. Grid columns collapse at 1400 / 1100 / 760 boundaries per `layout.css`.
- [ ] M9 — Tab through the header. Add-widget button receives focus; `aria-label` matches current lang.
- [ ] M10 — Light/Dark theme toggle. Greeting / date / Add-widget / widget chrome colors invert correctly.
- [ ] M11 (empty-state path) — Manually edit `src/registration.tsx` to pass `widgets={EMPTY_WIDGETS}` (the typed constant retained per S1 doc note). Rebuild. Verify empty-state panel renders with bilingual title + subtitle + CTA. Click CTA → console shows `web:dashboard:add-widget-clicked` `{ source: "empty-state-cta" }`. Revert.

### Safari 17

- [ ] M1..M10 — identical expectations; use Safari Web Inspector Timelines for animation profiling.
- [ ] M11 — empty-state path same as Chrome.

### Firefox 121

- [ ] M1..M10 — identical expectations; use Firefox Performance panel.
- [ ] M11 — empty-state path same as Chrome.

### Safari iOS

- [ ] T1 — Touch-drag a widget. The `touch-action: none` on `.widget-shell` (`src/styles.css`) prevents page scroll capture; drag pipeline runs cleanly.
- [ ] T2 — Reload. Order survives.

---

## Doc-only mitigation rationale (recorded for audit)

The dev_log Status Panel records `Verify Cross-vendor: yes (deferred —
browser MCP smoke optional; doc-only mitigation acceptable)`. This row
qualifies for the deferred path because:

1. **Cross-vendor risk surface is CSS + pointer events, not new
   JavaScript logic.** Both surfaces were ported verbatim from
   `web design/module-dashboard.jsx` (a prototype that already shipped
   in Chrome / Safari / Firefox) and from `layout.css` already covered
   by sibling rows (#2 `xai-web-tokens-and-i18n`).
2. **The browser-tier behaviors not covered by unit tests** (FLIP
   visual timing, iOS touch scroll capture, responsive collapse at
   1400/1100/760) are CSS-only and have no logic branch dependent on
   the row #10 ↔ row #11 split.
3. **The row-#10 / row-#11 contract IS the dynamic risk** — and that
   risk is fully addressable at the unit-test layer via the
   `dashboardWidgetRegistrations` composition test added in sub-fix
   S3 (`DashboardSlotHost.composition.test.tsx`).
4. **Cross-tab BroadcastChannel persistence** is a `@repo/plugin-web-storage`
   concern, already exercised by that package's unit tests (it is
   listed as PASS in the 2026-05-23 verify gate matrix V13).

If a future browser issue is reported against any of M1..T2, that
issue should re-open this checklist and force a live-browser session;
the deferral is conditional, not permanent.

---

## Sign-off

- Automated portion (15 gates from 2026-05-23 + 5 post-row-#11 re-run
  gates) PASS.
- **Manual checklist NOT yet filled** — the Chrome 120 / Safari 17 /
  Firefox 121 / Safari iOS rows below are unchecked and must be
  evidenced before `xai-web-deploy-cloudflare-pages` reaches
  READY_TO_SHIP (per manifest **Cross-vendor Manual Browser Smoke
  Policy**, 2026-05-24 post-Codex-re-review). Per that policy this
  row legitimately remains SHIPPED with `Cross-Vendor Manual Smoke:
  Deferred` on the Status Panel — but the deferral has a deadline.
- The S3 regression test (`src/__tests__/DashboardSlotHost.composition.test.tsx`,
  a9e6328) locks the row-#10 ↔ row-#11 widget-composition contract
  at the unit-test layer. It does NOT substitute for real-browser
  smoke; both gates are independently required.
- **This file does NOT close the BLOCKED finding** of the 2026-05-24
  Codex cross-vendor cold-read for blocker (1) "manual smoke not
  evidenced". The 2026-05-24 12:40 dev_log entry that claimed
  closure has been corrected (see `packages/xai-web-dashboard-grid/
  docs/dev_log.md` 2026-05-24 post-Codex-re-review Work Log entry).
  Closure of blocker (1) requires the matrix rows below to be
  filled with real-browser PASS/FAIL evidence.
