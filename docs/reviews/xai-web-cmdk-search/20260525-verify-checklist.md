# xai-web-cmdk — Feature Verify Checklist

**Feature**: xai-web-cmdk-search (gap-closure row #3)
**Date**: 2026-05-25
**Author**: feature-auto-build (Claude Sonnet 4.6) — P5 deliverable
**Status**: FOR FEATURE-VERIFY AGENT

---

## Gate Matrix (G1..G14)

| Gate | Description | Evidence Source | Pass Criteria | Status |
|---|---|---|---|---|
| **G1** | Unit tests: all P1..P5 tests pass | `pnpm --filter @repo/xai-web-cmdk test` | 137+ tests, exit 0 | Pending |
| **G2** | Lint: xai-web-cmdk exits 0 | `pnpm --filter @repo/xai-web-cmdk lint` | 0 errors, 0 warnings | Pending |
| **G3** | Typecheck: xai-web-cmdk exits 0 | `pnpm --filter @repo/xai-web-cmdk typecheck` | tsc --noEmit, exit 0 | Pending |
| **G4** | Shell tests green (R6 invariance) | `pnpm --filter @repo/xai-web-shell test` | 85 tests pass (no regressions from TP5a/TP5b/TP7 split) | Pending |
| **G5** | apps/web tests green (CI1..CI5) | `pnpm --filter @repo/web test` | 106+ tests pass, exit 0 | Pending |
| **G6** | apps/web typecheck exits 0 | `pnpm --filter @repo/web check-types` | tsc --noEmit, exit 0 | Pending |
| **G7** | Perf budget: PB1 p95 < 50 ms | perfBudget.test.ts output | p95 logged; value < 50 ms | Pending |
| **G8** | HC1: overlay-only — no rail entry | Check shellRegistrations.tsx | No `xai-web-cmdk` registration; `showInRail` not applicable | Pending |
| **G9** | HC2: no new localStorage keys | Check diff of `@repo/plugin-web-storage` PREF_REGISTRY | 0 new `xai_*` keys added by this row | Pending |
| **G10** | HC4: EventMap typed | `packages/core/src/types/events.ts` | `web:search:invoked` + `web:search:jump` present with correct payload shapes | Pending |
| **G11** | HC5: keyboard contract | keyboardCombo.test.ts (8 cases) | Cmd+K mac / Ctrl+K non-mac; rejects textarea/contentEditable/Alt/Shift | Pending |
| **G12** | HC6: DESIGN.md §6 frozen UI tokens | styles.css inspection | `.cmdk-scrim` uses `--bg-overlay`; `.cmdk-modal` uses `--bg-panel`; `.cmdk-input` uses `--font-mono`; zero hex literals | Pending |
| **G13** | HC7: XSS safe highlight pipeline | escapeHtml.test.ts (12 cases) + PaletteResultRow.test.tsx (PR3, PR4) | No unescaped `<script>` in rendered DOM; `innerHTML` contains `&lt;script&gt;` not `<script>` | Pending |
| **G14** | Codex cold-read XSS audit (HC8) | Codex `gpt-5.5-thinking` audit output | Output: "NONE" (no unescaped render paths found in escapeHtml.ts + highlightMatch.ts + PaletteResultRow.tsx) | Pending |

---

## Supporting Evidence Checklist

### Commit History Verification

Verify 4 phase commits are present and distinct:

- [ ] P1: `74ce9bb` — `feat(xai-web-cmdk): P1 scaffold + types + adapter registry + EventMap extension`
- [ ] P2: `59d7989` — `feat(xai-web-cmdk): P2 — 11 module adapters + buildIndex + per-adapter tests`
- [ ] P3: `1b3efda` — `feat(xai-web-cmdk): P3 — palette modal + DESIGN §6 UI + keyboard nav + XSS-safe highlight`
- [ ] P4: `6575054` — `feat(xai-web-shell+apps/web): P4 — topbar input→button + palette mount + apps/web wire-up`
- [ ] P5: _[to be filled]_ — `feat(xai-web-cmdk): P5 — PLUGIN_MAP row + perf-budget test + cross-vendor verify checklist + Codex audit`

### Documentation Drift Check

| Doc | Expected State | Actual |
|---|---|---|
| `packages/xai-web-cmdk/docs/design.md` | 20 frozen assumptions; §Component graph matches implemented files | Pending |
| `packages/xai-web-cmdk/docs/api.md` | Public surface matches `src/index.ts` exports | Pending |
| `packages/xai-web-cmdk/docs/test.md` | Test IDs match actual test files (EH1-EH12, BI1-BI8, CP1-CP18, etc.) | Pending |
| `docs/PLUGIN_MAP.md` | `@repo/xai-web-cmdk` row present under "Web Platform Shims", status In-Dev | Pending |
| `docs/reviews/xai-web-cmdk-search/20260525-cross-vendor-smoke.md` | Template exists | Done |

### Architecture Boundary Check

- [ ] `packages/xai-web-cmdk/src/index.ts` is the only public surface (no direct `src/internal/*` imports from consumers)
- [ ] `apps/web/src/App.tsx` imports from `@repo/xai-web-cmdk` (barrel), not from internal paths
- [ ] `@repo/xai-web-shell` does NOT import from `@repo/xai-web-cmdk` (one-way dep via callback prop only)
- [ ] `@repo/xai-web-cmdk` does NOT register in `apps/web/src/routes/modules/shellRegistrations.tsx`
- [ ] No Tauri APIs (`@tauri-apps/api`) imported in any xai-web-cmdk source file
- [ ] No third-party `cmdk` npm package in `packages/xai-web-cmdk/package.json`

### Hard Constraint Sign-Off

| HC | Description | Evidence | Status |
|---|---|---|---|
| HC1 | Overlay-only, no rail registration | G8 | Pending |
| HC2 | No new localStorage/xai_* keys | G9 | Pending |
| HC3 | 11 pure adapter functions | 11 adapter test files in P2 | Pending |
| HC4 | EventMap typed | G10 | Pending |
| HC5 | Keyboard contract | G11 | Pending |
| HC6 | DESIGN.md §6 frozen UI | G12 | Pending |
| HC7 | XSS-safe highlight | G13 | Pending |
| HC8 | Cross-vendor verify + Codex audit | G14 + cross-vendor-smoke.md | Pending |
| HC9 | PLUGIN_MAP row | `docs/PLUGIN_MAP.md` row present | Pending |
| no-cmdk-lib | No third-party cmdk library | package.json dependency list | Pending |

---

## Verdict

After all gates above are confirmed:

- If all 14 gates pass: `Status = READY_TO_SHIP`
- If any gate fails: `Status = BLOCKED`; record specific gate failure(s) in dev_log Work Log

---

## Codex Cold-Read Audit Prompt (G14)

```
Read these three files in the xai-web-cmdk package:
1. packages/xai-web-cmdk/src/internal/escapeHtml.ts
2. packages/xai-web-cmdk/src/internal/highlightMatch.ts
3. packages/xai-web-cmdk/src/PaletteResultRow.tsx

Identify any code path where user-provided string content (e.g., search hit label,
query string, or any data from module adapters) could reach a `dangerouslySetInnerHTML`
or similar DOM injection WITHOUT first passing through `escapeHtml()`.

If such a path exists, describe it precisely.
If no such path exists, output only: NONE
```

Expected output: `NONE`

Rationale: `highlightMatch` calls `escapeHtml(text)` BEFORE regex matching, and `PaletteResultRow` uses `dangerouslySetInnerHTML={{ __html: highlightMatch(label, query) }}` exclusively.
