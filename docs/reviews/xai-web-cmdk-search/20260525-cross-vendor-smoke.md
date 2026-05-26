# xai-web-cmdk — Cross-Vendor Smoke Checklist

**Feature**: xai-web-cmdk-search (gap-closure row #3)
**Date**: 2026-05-25
**Author**: feature-auto-build (Claude Sonnet 4.6) — P5 deliverable
**Status**: TEMPLATE — deferred to feature-verify real-browser sweep

---

## Browser Matrix

| Browser | Version | OS | Status |
|---|---|---|---|
| Chrome | 120+ | macOS 14 | Pending |
| Safari | 17+ | macOS 14 | Pending |
| Firefox | 121+ | macOS 14 | Pending |
| Safari | 17+ | iOS 17 | Pending |
| Chrome | 120+ | Windows 11 | Deferred (future) |

---

## Section A — Open / Close Mechanics

| ID | Check | Chrome | Safari | Firefox |
|---|---|---|---|---|
| A1 | Press Cmd+K (mac) → palette modal opens (role="dialog" visible) | — | — | — |
| A2 | Press Ctrl+K (non-mac / Windows) → palette modal opens | — | — | — |
| A3 | Press Escape → palette closes, focus returns to document | — | — | — |
| A4 | Click the scrim (outside the modal) → palette closes | — | — | — |
| A5 | Press Cmd+K again when already open → palette remains open (idempotent) | — | — | — |
| A6 | Click Topbar search button → palette opens with source="topbar-click" | — | — | — |

## Section B — Search Input

| ID | Check | Chrome | Safari | Firefox |
|---|---|---|---|---|
| B1 | Input has `autoFocus` — cursor is in input immediately on open | — | — | — |
| B2 | Input renders with `font-family: var(--font-mono, 'JetBrains Mono', ...)` (monospace per HC6) | — | — | — |
| B3 | Typing "task" → hits appear (Tasks adapter returns results) | — | — | — |
| B4 | Typing "tomato" → pomodoro hits appear (alias matching) | — | — | — |
| B5 | Typing "买" (Chinese) → ZH label hits appear (bilingual search) | — | — | — |
| B6 | Clearing input → all module-jump hits appear (empty query path) | — | — | — |

## Section C — Keyboard Navigation

| ID | Check | Chrome | Safari | Firefox |
|---|---|---|---|---|
| C1 | ArrowDown → next result becomes aria-selected="true" | — | — | — |
| C2 | ArrowUp from first item → wraps to last item | — | — | — |
| C3 | ArrowDown from last item → wraps to first item | — | — | — |
| C4 | Enter → navigates to the active result's route; palette closes | — | — | — |
| C5 | Cmd+Enter → treated identically to Enter (HC5 alias) | — | — | — |

## Section D — Search Result Rendering

| ID | Check | Chrome | Safari | Firefox |
|---|---|---|---|---|
| D1 | Matched query term highlighted with `<mark>` in label | — | — | — |
| D2 | Non-matching text shown without highlight (no spurious marks) | — | — | — |
| D3 | Sub-label rendered when present | — | — | — |
| D4 | Hit count capped at 50 (no DOM overflow) | — | — | — |
| D5 | Result list scrolls; scrollIntoView keeps active row visible | — | — | — |

## Section E — XSS Surface (HC7)

| ID | Payload | Expected Render | Chrome | Safari | Firefox |
|---|---|---|---|---|---|
| E1 | `<script>alert(1)</script>` as task title | Visible escaped text; no `<script>` in DOM; no alert fires | — | — | — |
| E2 | `<img src=x onerror=alert(1)>` as card title | Visible escaped text; no `<img>` injection | — | — | — |
| E3 | `<svg onload=alert(1)>` as habit name | Escaped text only | — | — | — |
| E4 | XSS in query string (search for `<script>`) | No injection; highlight wraps escaped text only | — | — | — |
| E5 | Null byte in task title (`"foo\x00<script>"`) | Visible text; NUL stripped; no script | — | — | — |

**Codex cold-read audit (G14):**

Prompt: "Read packages/xai-web-cmdk/src/internal/escapeHtml.ts, packages/xai-web-cmdk/src/internal/highlightMatch.ts, and packages/xai-web-cmdk/src/PaletteResultRow.tsx. Identify any rendering path that does not escape user-provided content before injecting into innerHTML. Output 'NONE' or list the specific code paths."

Expected output: `NONE`

Actual output: _[to be filled at feature-verify]_

## Section F — Theme × Density × BgTone Matrix

4 representative combos (out of 3 themes × 2 densities × 7 bgTones = 42):

| Combo | Theme | Density | BgTone | Modal visible | Contrast OK | No color leaks |
|---|---|---|---|---|---|---|
| F1 | light | comfortable | default | — | — | — |
| F2 | dark | comfortable | slate | — | — | — |
| F3 | system | compact | sage | — | — | — |
| F4 | dark | compact | stone | — | — | — |

**Token verification**: Open DevTools → Inspect `.cmdk-modal` → confirm:
- `background-color` resolves via `--bg-panel` (no hard-coded hex)
- `border-color` resolves via `--border-1`
- `.cmdk-input` uses `--font-mono`

## Section G — CSP / Network

| ID | Check | Result |
|---|---|---|
| G1 | DevTools Network tab: opening palette makes 0 network requests | — |
| G2 | `_headers` `connect-src` unchanged (xai-web-cmdk adds no new endpoints) | — |
| G3 | No new `xai_*` localStorage keys created when palette is opened | — |

## Section H — iOS Safari

| ID | Check | iOS Safari |
|---|---|---|
| H1 | Topbar search button opens the palette because hardware Cmd+K may be unavailable. | — |
| H2 | Typing query text filters results and keeps the input visible above the software keyboard. | — |
| H3 | Tapping a result navigates to the selected module and closes the palette. | — |
| H4 | Tap outside / browser back path does not leave an inert backdrop over the app. | — |

---

## How to Execute

1. `pnpm --filter @repo/web dev` → navigate to `http://localhost:3000/app/dashboard`
2. Press Cmd+K (mac) or Ctrl+K
3. Run each check; mark Pass/Fail/NA
4. For XSS checks: inject payload as a test task title via the Tasks module, then search

---

## Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Auto-build | Claude Sonnet 4.6 | 2026-05-25 | Template created |
| Feature-verify | _pending_ | — | — |
| Ship | _pending_ | — | — |
