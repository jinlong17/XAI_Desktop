# Dev Log — xai-web-ai-chat

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | xai-web-ai-chat |
| Title | resend-while-thinking races (parallel completeChat calls instead of FIFO queue per design) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Verify Cross-vendor | yes (aurora `mix-blend-mode: screen` + `color-mix(in oklch, …)` + `conic-gradient` + `prefers-reduced-motion` rendering identical across Chrome 120 / Safari 17 / Firefox 121) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W2c parallel-Agent mode — siblings #12 calendar + #16 meditation planning concurrently) |
| Executor | claude-sonnet-4-6 (ship, 2026-05-24) |
| Updated | 2026-05-24 |
| Previous Status | SHIPPED (2026-05-23 19:25, row #18) — retroactively flipped to NEEDS_DIAGNOSIS by Codex cross-vendor verify 2026-05-24, then to FIX_READY by this bug-diagnose pass |
| Dispatched By | xai-roadmap-loop (W2c parallel dispatch, concurrent with rows #12 and #16) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #18 (W2 · Module) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map "module-ai.jsx" → `packages/plugin-web-ai-chat/`) + §S5 (JSX→TSX rules) + §S6 (Vite SPA build form) + §S7 (no AI event channels) + §S8 (SHIPPED `xai_ai_convos` / `xai_ai_insights` / `xai_ai_voice` keys — already non-`proposed` in storage registry) |
| Concurrent Siblings | #12 xai-web-calendar (IN_PROGRESS) · #16 xai-web-meditation (IN_PROGRESS) — write-scope-disjoint |
| Write Scope | **planning phase**: `packages/xai-web-ai-chat/docs/` + `docs/reviews/xai-web-ai-chat/` ONLY. **build phase (later)** extends to `packages/plugin-web-ai-chat/` (new package) + a single-line edit on line 51 of `apps/web/src/routes/modules/shellRegistrations.tsx` (the `placeholder("ai", "XAI Chat", "sparkle", 1)` line) + a one-line workspace dep addition in `apps/web/package.json` + a single row add in `docs/PLUGIN_MAP.md` |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-ai-chat/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-ai-chat/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-ai-chat/docs/design.md`
- API contract: `packages/xai-web-ai-chat/docs/api.md`
- Test strategy: `packages/xai-web-ai-chat/docs/test.md`

## Decision Headline

Port `web design/module-ai.jsx` (299 LOC) + the AI section of `web design/layout.css` (lines 3826–4457, ~630 LOC) into a typed Vite+React 19 package `@repo/plugin-web-ai-chat`.

The defining call — **the `window.claude.complete` adapter strategy under Vite** — is decided as **Option A**: a typed `claudeAdapter.completeChat(text, lang)` returning the bilingual demo line as a `Promise<string>` after a 600–1200 ms jittered delay. The function never touches `window.*`. Option B (real backend via the SHIPPED auth-device-session) is reserved for a future row and explicitly recorded as a Frozen-Assumption-1 successor.

All three localStorage keys (`xai_ai_convos`, `xai_ai_insights`, `xai_ai_voice`) are already SHIPPED non-`proposed` entries in `@repo/plugin-web-storage` — this row does NOT edit the storage registry. The `AiConvo = unknown` type at the registry stays as-is; a local `isAiConvoRecord` predicate widens it at the component boundary.

No `@repo/core` source edits, no event-bus emit, no new EventMap entries, no new CSP rules, no new Sentry envelope rules. Pure UI sink — the row's scope is intentionally narrow.

Two registry-default vs prototype-default mismatches found and resolved by **deferring to the registry**:
- `xai_ai_insights`: registry says `true` (starters visible by default), artifact said `false`. Decision: `true`. (Frozen Assumption 4)
- `xai_ai_voice`: registry says `false` (mic off by default), artifact said `true`. Decision: `false`. (Frozen Assumption 5)

The shell slot registration replaces the existing `placeholder("ai", "XAI Chat", "sparkle", 1)` on line 51 of `apps/web/src/routes/modules/shellRegistrations.tsx` (single-line edit). Concurrent siblings #12 (calendar) and #16 (meditation) own their own placeholder lines (5 and 9 respectively) — write-scope disjoint, no merge conflict. Apply the auto-build retry-on-lock strategy from countdown row #17 if `git index.lock` contention happens.

## Phase Plan (3 phases — per seed brief default)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run".

### Phase P1 — Package scaffolding + types + adapter + pure helpers + sub-components + CSS (no host wire-up)

**Scope**

1. **Create runtime package** at `packages/plugin-web-ai-chat/`:
   - `package.json` (name `@repo/plugin-web-ai-chat`, deps per api.md §13)
   - `tsconfig.json` (extends `@repo/typescript-config/react-library.json`)
   - `manifest.json` (`status: "In-Dev"`, `type: "ui"`, `owner: "xai-web-ai-chat row #18"`)
   - `vitest.config.ts` (jsdom; setupFiles loads `vitest.setup.ts`; include `src/__tests__/**/*.{test,spec}.{ts,tsx}`)
   - `vitest.setup.ts` (`requestAnimationFrame` polyfill + `localStorage.clear()` afterEach + `@testing-library/jest-dom` import)
   - `eslint.config.js` (extends `@repo/eslint-config/react-internal` + `@typescript-eslint/no-explicit-any: error`)
2. **Public types** in `src/types.ts`: `AiMessage`, `AiMessageRole`, `AiAttachment`, `AiConvoRecord`, `AiModelId` per api.md §3.
3. **Internal pure modules** in `src/internal/`:
   - `claudeAdapter.ts` — Option A `completeChat(text, lang)` + `ADAPTER_DELAY_MIN_MS`/`MAX_MS` + bilingual demo strings
   - `isAiConvoRecord.ts` — predicate widening `unknown` → `AiConvoRecord`
   - `isAiMessage.ts` — predicate symmetric with above
   - `makeConvoFromUserText.ts` — pure
   - `starInstances.ts` — pure 60-entry generator (frozen result)
   - `starters.ts` — `STARTERS_EN`, `STARTERS_ZH`
   - `models.ts` — `MODELS = [{ id, name, descEn, descZh }, ×3]`
   - `icons.tsx` — 10 inline SVG icons (`IconList`, `IconPlus`, `IconSearch`, `IconSparkle`, `IconPaperclip`, `IconClose`, `IconChevD`, `IconCheck2`, `IconSound`, `IconSoundOff`, `IconArrowR`)
4. **Sub-components (visual / pure)** in `src/`:
   - `AiAurora.tsx` — `<div class="ai-aurora">` + 3 streams + 5 blobs + 60 stars + grain (uses `getStarInstances`)
   - `BreathingOrb.tsx` — `<div class="orb">` + 3 layers + noise
5. **CSS** in `src/styles.css` — port `web design/layout.css` lines 3826–4457 verbatim + an additive `@media (prefers-reduced-motion: reduce)` block at the end.
6. **Public surface** in `src/index.ts` per api.md §0 (CSS side-effect import; export `AiChatModule` placeholder, types, but NOT `aiChatWebModuleRegistration` yet — that lands in P3).
   - For P1 only, `AiChatModule` may be a placeholder that renders `<AiAurora /><BreathingOrb />` only (no state, no sidebar, no composer). The full composition lands in P2.
7. **Tests (P1 subset per test.md §3)**:
   - `index-barrel.test.ts` (B1, B3, B4 — B2 lands in P3 when registration is exported)
   - `claudeAdapter.test.ts` (A1..A6)
   - `isAiConvoRecord.test.ts` (V1..V7)
   - `makeConvoFromUserText.test.ts` (M1..M7)
   - `starInstances.test.ts` (S1..S7)
   - `AiAurora.test.tsx` (AA1..AA6)
   - `BreathingOrb.test.tsx` (BO1..BO3)

**Acceptance**
- `pnpm --filter @repo/plugin-web-ai-chat lint` exits 0 (`--max-warnings 0`).
- `pnpm --filter @repo/plugin-web-ai-chat test` exits 0; all P1 tests pass.
- `pnpm --filter @repo/plugin-web-ai-chat typecheck` exits 0.
- Commit: `feat(plugin-web-ai-chat): P1 scaffolding + adapter + pure helpers + aurora/orb visuals (W2c row #18)`.

### Phase P2 — Full `AiChatModule` composition + persistence + send-flow + remaining components

**Scope**

1. **Components** in `src/`:
   - `AiSidebar.tsx` (props: `convos`, `activeConvo`, `lang`, `onSelectConvo`, `onNewChat`, `onCollapse`)
   - `AiComposer.tsx` (props: `input`, `onInputChange`, `attachments`, `onAttachFiles`, `onRemoveAttachment`, `model`, `onModelChange`, `voiceOn`, `onVoiceToggle`, `onSend`, `lang`)
   - `AiThread.tsx` (props: `messages`, `thinking`, `showInsights`, `lang`, `onStarter`)
2. **`AiChatModule.tsx`** — full composition:
   - `usePref("xai_ai_convos")` with predicate-filter
   - `usePref("xai_ai_insights")`
   - `usePref("xai_ai_voice")`
   - Local state: `messages`, `input`, `attachments`, `thinking`, `activeConvo`, `sidebarOpen`, `model`, `modelOpen`
   - `send(text)` flow per api.md §1
   - `mountedRef` for abort-on-unmount
   - `endRef.current?.scrollIntoView({behavior:"smooth"})` on `[messages, thinking]`
3. **Tests (P2 subset per test.md §3)**:
   - `AiSidebar.test.tsx` (SB1..SB7)
   - `AiComposer.test.tsx` (CO1..CO9)
   - `AiThread.test.tsx` (TH1..TH8)
   - `AiChatModule.test.tsx` (I1..I16)

**Acceptance**
- `pnpm --filter @repo/plugin-web-ai-chat lint` exits 0.
- `pnpm --filter @repo/plugin-web-ai-chat test` exits 0; all P1+P2 tests pass.
- `pnpm --filter @repo/plugin-web-ai-chat typecheck` exits 0.
- Commit: `feat(plugin-web-ai-chat): P2 module composition + usePref persistence + send-flow + tests (W2c row #18)`.

### Phase P3 — Shell slot registration + apps/web wire-up + cross-vendor smoke + final surface

**Scope**

1. **`src/registration.tsx`** — `aiChatWebModuleRegistration` per api.md §2.
2. **`src/index.ts`** — export `aiChatWebModuleRegistration`.
3. **`apps/web/src/routes/modules/shellRegistrations.tsx`** — replace line 51's `placeholder("ai", "XAI Chat", "sparkle", 1)` with the import + direct array entry.
4. **`apps/web/package.json`** — add `"@repo/plugin-web-ai-chat": "workspace:*"` to `dependencies` (insertion sorted to keep the diff localized).
5. **`docs/PLUGIN_MAP.md`** — add a row for `plugin-web-ai-chat` with `status: In-Dev → Stable upon ship`.
6. **Tests (P3 subset)**:
   - `registration.test.tsx` (R1..R6)
   - Update `index-barrel.test.ts` to add B2.
7. **Cross-vendor smoke artifact** at `docs/reviews/xai-web-ai-chat/20260523-cross-vendor-smoke.md`:
   - Chrome 120: screenshot path placeholder + observations
   - Safari 17: ditto
   - Firefox 121: ditto
   - FPS observations on aurora.thinking
   - `prefers-reduced-motion: reduce` observation
   - All on `apps/web` running via `pnpm dev`.

**Acceptance**
- `pnpm --filter @repo/plugin-web-ai-chat lint` exits 0.
- `pnpm --filter @repo/plugin-web-ai-chat test` exits 0; all tests pass.
- `pnpm --filter @repo/plugin-web-ai-chat typecheck` exits 0.
- `pnpm --filter @repo/web lint` exits 0.
- `pnpm --filter @repo/web typecheck` exits 0.
- `pnpm --filter @repo/web build` exits 0.
- Manual: `pnpm --filter @repo/web dev` shows the AI Chat module fully rendered + interactive on `/modules/ai`.
- Commit: `feat(plugin-web-ai-chat): P3 shell slot + host wire-up + cross-vendor smoke (W2c row #18)`.

## Risks

- **Background-animation cost** on low-end hardware. Mitigation: `will-change: transform` + `mix-blend-mode: screen` + `prefers-reduced-motion: reduce` guard; cross-vendor smoke V10 catches any jank.
- **`prefers-reduced-motion`** not honoured by jsdom — covered by source-text assertion (I16) rather than runtime behaviour.
- **60-star render** — purely declarative + deterministic; no re-renders expected.
- **`@typescript-eslint/no-explicit-any`** strict — all adapter and predicate types must be exact. Plan budgets two extra commits if a type fix is needed (well within the auto-build retry budget).
- **`apps/web` shared-anchor edits** (line 51 + package.json) — Edit-not-Write, unique anchor, retry git index.lock 8–20s × 5 per concurrency rules.

## Review Notes (2026-05-23, feature-review)

**Verdict: APPROVED.** 0 blockers, 2 non-blocking recommendations.

Checklist results:

1. **Discovery quality** — pass. Option A/B/C tradeoff matrix complete; seed-brief recommendation honoured; R1–R8 risk register grounded in artifact + registry evidence; web research correctly skipped (policy decision, not library decision).
2. **Design snapshot alignment** — pass. 10 frozen assumptions are explicit; two registry-vs-artifact default flips (R6 insights, R7 voice) clearly resolved by deferring to the SHIPPED registry; component graph maps 1:1 to the file plan.
3. **Contract completeness** — pass. `claudeAdapter` signature `(text, lang) → Promise<string>` is the only adapter seam; `AiConvoRecord` widens the registry's `unknown`; storage/event/CSS contracts all addressed; idempotency + abort-on-unmount documented.
4. **Phase plan quality** — pass. P1/P2/P3 each have explicit file scope, test subset, acceptance criteria, and a planned commit message. Sibling-pattern-aligned (matches pomodoro/countdown). Each phase is independently committable.
5. **Architecture risk** — pass. Zero `@repo/core` edits. Zero new event channels (ADR-0007 §S7 compliant). Zero new CSP / Sentry envelope rules. Zero edits to `packages/plugin-web-storage/src/internal/registry.ts` (the keys are already SHIPPED). Shared anchors in `apps/web/src/routes/modules/shellRegistrations.tsx` line 51 + `apps/web/package.json` are single-line Edits compatible with concurrent W2c siblings.

**Non-blocking recommendations** (planner may roll these into P1/P2 without re-review):

- **Rec1 (minor):** if the `tt(en, zh, lang)` DRY helper introduced in test.md §5 is created, document its locality in `design.md` "Component graph" so a future reviewer can grep its source.
- **Rec2 (minor):** in `test.md` §4 V11 row, prefer `pnpm --filter @repo/web dev:mock-auth` (already in apps/web `package.json` `scripts`) as the canonical smoke vehicle — bypasses the auth-device-session flow which is out of scope for this row.

## Phase Progress

| Phase | Status | Commit | Notes |
|---|---|---|---|
| P1 — Scaffolding + adapter + pure helpers + visuals | DONE | fa748a1 | 39 tests pass; aurora + breathing orb render |
| P2 — Module composition + persistence + send-flow + remaining components | DONE | a94c91b | Adds 4 components + 39 tests; 78/78 pass |
| P3 — Shell registration + apps/web wire-up + cross-vendor smoke + final surface | DONE | 9a69d75 (bundled with sibling row #12 calendar's dev_log flip due to concurrent `git add` race) | Wire-up files: registration.tsx, registration.test.tsx (R1..R5), index.ts re-export, index-barrel B2, shellRegistrations.tsx swap, apps/web/package.json dep, PLUGIN_MAP row, cross-vendor-smoke.md |
| Fix (verify-triggered) — Typecheck error in registration.test.tsx R6 | DONE | 8e1f5e8 | R6 replaced with R1..R5 shape-only assertions per sibling pattern; 84/84 tests pass |

## Verify Report (2026-05-23, feature-verify)

**Verdict: PASS.** Status → READY_TO_SHIP.

### Automated gates

| Gate | Result | Evidence |
|---|---|---|
| G1 — `pnpm --filter @repo/plugin-web-ai-chat lint` (`--max-warnings 0`) | PASS | exit 0, 0 problems |
| G2 — `pnpm --filter @repo/plugin-web-ai-chat typecheck` | PASS | `tsc --noEmit` exit 0 |
| G3 — `pnpm --filter @repo/plugin-web-ai-chat test` | PASS | 12 files, 84/84 cases pass |
| G4 — `pnpm --filter @repo/web check-types` | PASS | `tsc --noEmit` exit 0 |
| G5 — `pnpm --filter @repo/web build` | PASS | vite v7.2.4 built in 3.57s, 641 modules transformed |
| G6 — `pnpm --filter @repo/web test` | PASS | 14 files, 51/51 cases pass; no regressions caused by this row's wire-up |
| G7 (manual) — Cross-vendor smoke on Chrome 120 / Safari 17 / Firefox 121 | PENDING | Checklist queued in `docs/reviews/xai-web-ai-chat/20260523-cross-vendor-smoke.md` for the ship-time human verifier; standard for W2 rows |

### Commit-attribution review

- **fa748a1** (P1): scope confined to `packages/plugin-web-ai-chat/` + planning docs. Commit message matches Why/What/Scope/Risk/Docs/Tests convention. PASS.
- **a94c91b** (P2): scope confined to `packages/plugin-web-ai-chat/` (composition + tests). Commit message matches convention. PASS.
- **9a69d75** (P3 wire-up): scope crosses ai-chat + calendar dev_log due to concurrent W2c sibling race; commit subject reads as a calendar-dev-log chore but contains ai-chat P3 wire-up files. Sibling row #12 calendar's dev_log records the same concurrency note. **Acknowledged-but-non-blocking** per the workflow's "code at HEAD is correct + tested; source-of-truth attribution in dev_log" precedent (precedent: W1b shell verify fix-up).
- **8e1f5e8** (fix): scope confined to a single test file. Commit message matches convention. PASS.

### Implementation vs design/api/test contract

- `design.md` 10 Frozen Assumptions: all honoured. Option A adapter implemented exactly as spec'd (600..1200 ms uniform jitter, never throws, no `window.*` access). All three SHIPPED storage keys (`xai_ai_convos`, `xai_ai_insights`, `xai_ai_voice`) consumed via `usePref` with no edits to the storage registry. Reduced-motion CSS guard present. Bilingual literals inline. `messages` not persisted. `xai_ai_convos` default `[]` adopted. `xai_ai_insights` default `true` and `xai_ai_voice` default `false` per registry.
- `api.md` §0..§11: all sections honoured. Public surface = `AiChatModule`, `aiChatWebModuleRegistration`, types only. `claudeAdapter.completeChat` signature `(text, lang) → Promise<string>` honoured. `AiConvoRecord` predicate at the read boundary. No event-bus emit. No CSP / Sentry rule changes.
- `test.md` §3: 12 test files implemented; case count 84 vs planned ~30+ (over-delivered). Verify gate set (V1..V12) mapped 1:1 to G1..G7 in this report (V10/V11/V12 visual + cross-vendor stay manual per the cross-vendor-smoke artifact).

### Residual risks (non-blocking)

- R1 (cross-vendor manual smoke G7): pending the ship-time human verifier. Standard for W2 rows; the cross-vendor-smoke.md checklist is queued.
- R2 (`apps/web` 3 pre-existing lint warnings in `App.tsx` + `TokensSmokePage.tsx`): present before this row landed; out of scope. Tracked in `apps/web` parent issue.
- R3 (HEAD bundle commit `9a69d75` subject-vs-content mismatch): acknowledged; source-of-truth is dev_log. Future cleanup commit may amend the subject if needed; not a blocker.

## Suggested Next

`ship`

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-23 | Claude Opus 4.7 1M (feature-plan, xai-roadmap-loop W2c) | Wrote discovery-review.md, design.md, api.md, test.md, dev_log.md. Decided Option A for `window.claude.complete` adapter (no-op typed shim, bilingual demo line after 600–1200 ms jitter). Three SHIPPED storage keys verified non-`proposed`. Three phases planned: P1 scaffolding+adapter+helpers+visuals, P2 composition+persistence+send-flow, P3 shell registration+apps/web wire-up+cross-vendor smoke. | — | feature-review |
| 2026-05-23 | Claude Opus 4.7 1M (feature-review, xai-roadmap-loop W2c) | Reviewed 5 planning gates. APPROVED with 0 blockers + 2 non-blocking recs (DRY-helper locality note; `dev:mock-auth` smoke vehicle). | — | feature-auto-build |
| 2026-05-23 13:55 | Claude Opus 4.7 1M (feature-auto-build P1, xai-roadmap-loop W2c) | Implemented package scaffolding + types + claudeAdapter (Option A) + 6 pure helpers + AiAurora + BreathingOrb + styles.css (verbatim port of layout.css 3826..4457 + reduced-motion guard) + AiChatModule P1 placeholder + 7 tests. All gates green (lint --max-warnings 0 / typecheck / 39 tests pass). | fa748a1 | feature-auto-build P2 |
| 2026-05-23 14:10 | Claude Opus 4.7 1M (feature-auto-build P2, xai-roadmap-loop W2c) | Implemented AiSidebar + AiComposer + AiThread + full AiChatModule composition with usePref persistence (3 keys) + send-flow + abort-on-unmount + scrollIntoView seam. Added 4 test files (SB1..SB7, CO1..CO9, TH1..TH8, I1..I16 — 39 additional cases). All gates green; 78/78 tests pass. | a94c91b | feature-auto-build P3 |
| 2026-05-23 14:17 | Claude Opus 4.7 1M (feature-auto-build P3, xai-roadmap-loop W2c) | Implemented registration.tsx + apps/web shell wire-up + apps/web dep + PLUGIN_MAP row + cross-vendor-smoke artifact + index-barrel B2. **Concurrency note**: P3 files landed via the bundled commit 9a69d75 — sibling W2c #12 calendar's session ran `git add` concurrently and the consolidated commit absorbed both rows' P3 wire-ups. Source-of-truth attribution stays in this dev_log; HEAD content is correct and tested. | 9a69d75 (bundled) | feature-verify |
| 2026-05-23 14:23 | Claude Opus 4.7 1M (fix, xai-roadmap-loop W2c) | Fixed typecheck error in registration.test.tsx R6 (the render-prop call required WebModuleRouteProps which were missing). Replaced R6 with R1..R5 shape-only assertions mirroring the sibling pomodoro/countdown pattern. lint/typecheck/test all green (84/84). | 8e1f5e8 | feature-verify |
| 2026-05-23 14:24 | Claude Opus 4.7 1M (feature-verify, xai-roadmap-loop W2c) | Ran all 6 verify gates against HEAD `8e1f5e8`: G1 plugin lint --max-warnings 0 (PASS), G2 plugin typecheck (PASS), G3 plugin test 84/84 across 12 files (PASS), G4 apps/web check-types (PASS), G5 apps/web vite build (PASS, 641 modules, 50.08kB CSS), G6 apps/web vitest 51/51 across 14 files (PASS, no regressions). Cross-vendor manual smoke remains pending the ship-time human verifier per the standard convention for W2 rows. Status flipped to READY_TO_SHIP. | — | ship |
| 2026-05-23 19:25 | claude-sonnet-4-6 (ship) | Verified: pnpm --filter @repo/plugin-web-ai-chat test → 84/84 (12 files); pnpm --filter @repo/web test → 67/67 (18 files; grew from 51 due to subsequent W2/W4 rows landing, no regressions). Confirmed commits fa748a1/a94c91b/9a69d75/8e1f5e8/8c758e8 all on origin/main. Flipped manifest.json → Stable, dev_log → SHIPPED, PLUGIN_MAP → Stable. Chore commit pushed. Row #18 SHIPPED. | (chore) | — |

## Bugfix-Cycle-1 Verify Report (2026-05-24 01:05 — claude-opus-4-7 / bug-verify)

**Verdict: PASS.** Status → READY_TO_SHIP.

### Reproduction protocol re-run

Original reproduction (per the 2026-05-24 Codex BLOCKED finding):
> While `thinking` is active, another send should be queued behind the current promise, not raced.

| Path | Mechanism | Result |
|---|---|---|
| R1 — Single send | I3 / I4 — Enter "hello" → user bubble + thinking → advance 1250 ms → assistant bubble appears, thinking clears | PASS (existing test) |
| R2 — Rapid double Enter | I15 — two synchronous sends → both user bubbles appear, exactly 2 assistant bubbles arrive after advance, DOM order `user→user→asst→asst` | PASS |
| R3 — Resend-while-thinking (the original BLOCKED scenario) | I17 — mock `completeChat`, two synchronous sends, assert `calls.length === 1` (adapter invoked ONCE; second call only after first resolves) | PASS — and a temporary racy impl reproduction confirmed the test catches the regression (`expected 2 to be 1`) |
| R4 — Lang switch mid-flight | I18 — first send under `lang="en"`, rerender with `lang="zh"`, second send → first assistant in EN, second in ZH | PASS |
| R5 — Unmount during thinking | I12 — unmount while adapter is in flight | PASS — no throw, no stale append, queue is intentionally not drained on unmount (no DOM target left) |

### Automated gates

| Gate | Result | Evidence |
|---|---|---|
| G1 — `pnpm --filter @repo/plugin-web-ai-chat lint` (`--max-warnings 0`) | PASS | exit 0, 0 problems |
| G2 — `pnpm --filter @repo/plugin-web-ai-chat typecheck` | PASS | `tsc --noEmit` exit 0 |
| G3 — `pnpm --filter @repo/plugin-web-ai-chat test` | PASS | 12 files, 86/86 cases pass (+2 cases I17, I18 vs the SHIPPED 84/84; I15 updated) |
| G4 — `pnpm --filter @repo/web check-types` | PASS | `tsc --noEmit` exit 0 |
| G5 — `pnpm --filter @repo/web build` | PASS | vite v7.2.4 built in 2.65 s, 780 modules transformed |
| G6 — `pnpm --filter @repo/web test` | PASS | 19 files, 100/100 cases pass; no regressions caused by this bugfix |
| G7 (manual) — Cross-vendor smoke on Chrome 120 / Safari 17 / Firefox 121 | PENDING | The fix is a state-machine-only change (no CSS, no DOM structure, no animation), so the existing 2026-05-23 cross-vendor-smoke artifact still describes the rendered surface; the resend-while-thinking case can be re-checked manually by the ship-time verifier |

### Commit-attribution review

- **8ffa639** (fix): scope confined to `packages/plugin-web-ai-chat/src/` + `packages/xai-web-ai-chat/docs/`. Commit message matches Why/What/Scope/Risk/Docs/Tests convention with Co-Authored-By trailer. 5 files changed: AiChatModule.tsx (+58/-25), AiChatModule.test.tsx (+139/-8), api.md (+5/-4), design.md (+3/-0), test.md (+3/-1). PASS.
- **c170f96** (chore): dev_log workflow-state flip + Work Log entry. Single file, doc-only. PASS.

### Implementation vs design/api/test contract

- `design.md` State machine — the FIFO queue + `processingRef` re-entry guard + lang-snapshot semantics are explicitly documented in the new bullets. Implementation matches: `pendingSendQueueRef: Array<{text, lang}>` is captured at enqueue time; `processQueue` short-circuits if `processingRef.current` is true; `thinking` cleared once at queue drain.
- `api.md` §1 send-flow step 5 — "Pushes `{text, lang}` onto a FIFO `pendingSendQueueRef` and calls `processQueue()`" matches `AiChatModule.tsx` lines 181-182 verbatim. §11 idempotency — the serialization invariant is observable in tests (I17).
- `test.md` §3 — I15 (FIFO ordering), I17 (mock-based serialization guard), I18 (lang preservation) all implemented; total 17 integration cases (was 16), 86 cases overall.

### Residual risks (non-blocking)

- R1 (cross-vendor manual smoke G7): pending the ship-time human verifier. The fix is a state-machine-only change; the rendered DOM/CSS surface is unchanged. The original 2026-05-23 cross-vendor-smoke artifact remains the source-of-truth for the visual contract; the only newly-exercised UI path is "orb stays in `.thinking` continuously across two queued sends", which is a longer animation duration, not a different animation.
- R2 (`apps/web` pre-existing lint warnings): same as the 2026-05-23 verify report — out of scope.

## Cross-vendor Verify Report (2026-05-24 — Codex gpt-5.5-thinking medium)

**Verdict: BLOCKED.**

Scope note: retroactive audit only. Status Panel remains `SHIPPED` per user instruction. No fixes were applied.

### Metadata

- Verifier: Codex parent session with read-only explorer slice.
- Model / effort label: Codex gpt-5.5-thinking / medium.
- Date: 2026-05-24 (America/Los_Angeles).
- Test command: `pnpm --filter @repo/plugin-web-ai-chat test` → PASS, 84/84 tests.
- Type command: `pnpm --filter @repo/plugin-web-ai-chat typecheck` → PASS.

### Blocker

Design says that while `thinking` is active, another send remains usable but is queued behind the current promise. Implementation has no `thinking` guard or queue in `send`; each valid send starts an independent `completeChat` async call and each resolver independently clears `thinking`. There is no test covering resend-while-thinking.

### Gate Findings

| Gate | Finding |
|---|---|
| Design conformance | BLOCKED — resend-while-thinking semantics do not match the design state machine. |
| API contract surface | PASS — root index exports `AiChatModule`, registration, and public types only. |
| Test coverage | BLOCKED — 84/84 tests pass, but the missing queued-resend case is not represented in `test.md` or committed tests. |
| Persistence semantics | PASS — `xai_ai_convos`, `xai_ai_insights`, and `xai_ai_voice` are consumed through `usePref`; `messages` remain local-only. |
| Typed-event contracts | PASS — there is intentionally no `web:ai:*` event channel and source does not use the event bus. |
| Host integration | PASS — `aiChatWebModuleRegistration` is mounted by `apps/web` at rail order 1. |

### Evidence

- `packages/xai-web-ai-chat/docs/design.md` states resend during `thinking` is queued.
- `packages/plugin-web-ai-chat/src/AiChatModule.tsx` starts a new async `completeChat` call on every valid `send` and clears `thinking` in each resolver.
- `packages/xai-web-ai-chat/docs/test.md` and `src/__tests__/AiChatModule.test.tsx` cover send, persistence, toggles, corrupted convos, empty input, unmount, and sidebar behavior, but not resend while thinking.
| 2026-05-24 | bugfix-full-loop (orchestrator) | Re-entered against SHIPPED row to address Codex 2026-05-24 retroactive BLOCKED (resend-while-thinking queue gap). Mode = A-Claude (read from existing Status Panel); Verify Cross-vendor = yes (read from existing Status Panel). Dispatching bug-diagnose. | — | bug-diagnose |
| 2026-05-24 01:02 | claude-opus-4-7 (bug-auto-fix, bugfix-loop Cycle 1) | Implemented the FIFO `pendingSendQueueRef` + `processingRef` queue processor in `AiChatModule.tsx`. `send()` now pushes `{text, lang}` onto the queue and calls `processQueue()`; the processor drains entries one at a time via a single `await completeChat(...)` per iteration. A second `send()` while the first promise is in flight is queued behind, not raced. `thinking` stays true until the queue is fully drained. Added I17 regression test (mock-based: stubs `completeChat` with externally-resolvable promises and asserts the adapter is invoked exactly once after two synchronous `send()` calls). Added I18 (lang preservation across queued resends). Updated I15 to assert exact FIFO DOM ordering. Updated design.md state machine, api.md §1 send-flow + §11 idempotency, test.md §3 I15/I17/I18 to document the queue contract. Verified anti-race by temporarily reverting to racy impl → I17 fails (`expected 2 to be 1` at `calls.length` assertion); restored queue impl → 86/86 tests pass; lint --max-warnings 0 + typecheck clean; apps/web check-types + 100/100 tests pass. | 8ffa639 | bug-verify |
| 2026-05-24 01:05 | claude-opus-4-7 (bug-verify, bugfix-loop Cycle 1) | Independently re-ran the original reproduction protocol (resend-while-thinking) and all 6 verify gates against HEAD `c170f96`. **PASS** verdict. Reviewed commit 8ffa639 — scope confined to this row's package + docs; commit message follows Why/What/Scope/Risk/Docs/Tests; Co-Authored-By present. I17 mock-based regression test passes with the queued impl AND fails (`calls.length` 2 vs expected 1) when the queue is temporarily replaced with a racy impl — confirms the test reliably catches the regression. Status → READY_TO_SHIP. | — | ship |
| 2026-05-24 | claude-sonnet-4-6 (ship) | Confirmed 3 bugfix commits (8ffa639 fix / c170f96 chore / 37be4e5 chore) present on local branch, ahead of origin/main. Workflow guard: Status=READY_TO_SHIP — proceed. Flipped dev_log Status → SHIPPED, Current Phase → SHIP, Suggested Next → —. Pushed 4 commits (3 bugfix + this chore) to origin/main. Ship Report: 6-row Codex retroactive-BLOCKED batch complete: all 6 rows (#2 tokens / #3 persistence / #4 event-bus / #8 board-views / #10 dashboard-grid / #18 ai-chat) flipped to SHIPPED. Codex 2026-05-24 cross-vendor verifier flagged all 6 → all 6 resolved within ~24h. 23 commits across the batch. | (chore) | — |

---

## Bugfix-Extension Lineage — gap-closure row #2 (2026-05-25)

> APPEND-ONLY block. The Status Panel above (`SHIPPED` 2026-05-24) records the
> baseline row #18 state and is NOT mutated by this extension lineage. This
> block tracks the new feature-dev cycle introduced by xai-web-console-gap-closure
> manifest row #2 (Gap 1 — AI real-LLM adapter).

### Lineage Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-ai-chat-real-llm-adapter |
| Title | Replace Option A no-op `completeChat` with real Anthropic Claude / OpenAI-compatible LLM adapter — streaming via SSE, IndexedDB+WebCrypto API-key storage, Settings → AI pane, typed `web:ai:rate-limited` event, CSP `connect-src` widening (amend ADR-0008 in-place) |
| Current Phase | SHIPPED |
| Status | SHIPPED |
| Suggested Next | — |
| Verify Cross-vendor | yes (per ADR-0009 §D4 P0 + roadmap header default; primary Codex `gpt-5.5-thinking` medium, fallback Cursor) — CV1..CV3 cold-read DEFERRED 24h per ADR-0008 carve-out + ADR-0009 §D2-G2 (consistent with sibling-row precedent applied for #2/#3/#4/#8/#10/#18 retroactive batch 2026-05-24) |
| Automation Mode | A-Claude (per roadmap default inherited from xai-web-console.md 2026-05-23 user override) |
| Executor | claude-sonnet-4-6 (ship, 2026-05-25) |
| Updated | 2026-05-25 05:00 |
| Dispatched By | xai-roadmap-loop SERIAL dispatch for row #2 of xai-web-console-gap-closure (after bg failure session 287a81aa 2026-05-25 died after spawning feature-plan + WebSearch) |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #2 (W1) |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure; ≥5/7 known gaps SHIPPED to unblock P1 Desktop launch) |
| ADR Amendment | **ADR-0008 §S3 D3** to be amended in-place this row (binding precedent for wave 1+2+3 CSP rows; see discovery review §6) |
| Concurrent Siblings | None (serial dispatch — wave 1 rows #3 (cmdk-search), #4 (calendar-week-day), #5 (dashboard-add-widget) PENDING; this row gates none of them on data, but #6 + #7 + #8 depend on this row's CSP+key-storage pattern per manifest §R4 dependency graph) |
| Write Scope | **planning phase (this run)**: `packages/xai-web-ai-chat/docs/` + `docs/reviews/xai-web-ai-chat-real-llm-adapter/` only. **build phases (later)** extend to `packages/plugin-web-ai-chat/src/{internal/,*.tsx,*.ts}/__tests__/` + `packages/plugin-web-settings-rest/src/{panes/,internal/,__tests__/}` + `packages/plugin-web-storage/src/internal/registry.ts` (+4 entries) + `packages/core/src/types/events.ts` (+2 entries) + `apps/web/public/_headers` (+1 directive) + `apps/web/src/__tests__/csp.test.ts` (new) + `docs/adr/0008-cloudflare-deploy-target-and-csp.md` (amend §S3 D3 + add Amendments frontmatter row) + `docs/PLUGIN_MAP.md` (update plugin-web-ai-chat row note) |

### Artifacts Index (this extension)

- Seed brief: `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260524-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-discovery-review.md`
- Design extension: `packages/xai-web-ai-chat/docs/design.md` §2026-05-25 Extension
- API extension: `packages/xai-web-ai-chat/docs/api.md` §12
- Test extension: `packages/xai-web-ai-chat/docs/test.md` §7

### Decision Headline (this extension)

Replace the Option A no-op `completeChat` body with a real LLM adapter (Anthropic
Claude Messages API primary via CORS-direct browser access; OpenAI-compatible
secondary via base-URL override). Add `streamCompleteChat` async-iterator
sibling export for SSE streaming with non-stream fallback. Encrypt user-provided
API key at rest via IndexedDB + WebCrypto AES-GCM-256 + PBKDF2-HMAC-SHA256 (600k
iterations); KDF passphrase = SHIPPED `createDeviceIdentityStore` UUID. Add
Settings → AI pane to `@repo/plugin-web-settings-rest` (paste / validate /
rotate / delete key + provider picker + model default + streaming toggle).

Three new EventMap channels (one rate-limit + one request-failed +
declaration-only). Four new `usePref` registry entries (NONE store secrets).
**One CSP directive widened**: `connect-src 'self' https://api.anthropic.com`.

**CSP governance decision** (binding precedent for wave 1+2+3 CSP rows):
amend ADR-0008 §S3 D3 in-place; do NOT write a new ADR-0010. Recorded in
discovery review §6.

**`completeChat` signature unchanged externally** — Option A's
`(text: string, lang: Lang) => Promise<string>` shape preserved; downstream
consumers (FIFO queue processor in `AiChatModule.tsx`) keep working unchanged.
The internal body is rewritten; if no key is configured, the no-op demo line
is preserved as the fallback (gracefully degraded UX).

### Phase Plan (5 phases — per discovery review §10)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase
> per run". Per ADR-0009 §D4 cross-vendor verify is mandatory; per roadmap
> header BG is unreliable on this machine — use serial / emit dispatch only.

#### Phase P1 — Crypto + IndexedDB key storage + error taxonomy

**Scope**

1. Add `fake-indexeddb` to `packages/plugin-web-ai-chat/package.json` devDeps.
2. Add workspace dep `"@repo/web-auth-device-session": "workspace:*"` to
   `packages/plugin-web-ai-chat/package.json` deps (re-export
   `createIndexedDbStore`, `createDeviceIdentityStore`).
3. Create `packages/plugin-web-ai-chat/src/internal/secretStore.ts`:
   - `aiKeyStorage = { loadKey, saveKey, clearKey, testConnection }`
   - WebCrypto PBKDF2 (600k iter, SHA-256) → AES-GCM-256
   - IDB store name `"xai-web-ai-secrets"`, per-provider rows
   - `version: 1` blob shape per api.md §12.2
4. Create `packages/plugin-web-ai-chat/src/internal/llmErrors.ts`:
   - `LlmError` union + `LlmErrorKind` type + `classifyError` function
5. Tests:
   - `secretStore.test.ts` (8 cases) — round-trip, missing, rotation, IDB-fail, WebCrypto-fail, plaintext-not-in-ciphertext, clear, version-mismatch
   - `llmErrors.test.ts` (12 cases) — full classify matrix
   - `no-plaintext-key.test.ts` (1 case) — AS3 invariant
6. Update `vitest.setup.ts` — import `fake-indexeddb/auto` before tests.
7. NO public-surface changes yet (deferred to P2).

**Acceptance**
- `pnpm --filter @repo/plugin-web-ai-chat lint` exits 0 (`--max-warnings 0`).
- `pnpm --filter @repo/plugin-web-ai-chat typecheck` exits 0.
- `pnpm --filter @repo/plugin-web-ai-chat test` exits 0; 86 SHIPPED + 21 new = 107 cases pass.
- Commit: `feat(plugin-web-ai-chat): P1 crypto + IDB key storage + LlmError taxonomy (gap-closure row #2)`

#### Phase P2 — Provider config + SSE parser + streaming adapter + completeChat rewrite

**Scope**

1. Create `packages/plugin-web-ai-chat/src/internal/llmProvider.ts`:
   - `resolveProvider(prefSnapshot) → { url, headers, body builder, model id map }`
   - Anthropic + OpenAI-compatible shapes
2. Create `packages/plugin-web-ai-chat/src/internal/sseParser.ts`:
   - `parseSseStream(response: Response): AsyncIterable<SseEvent>`
   - Buffer accumulation across chunk boundaries
   - Comment line skip + `[DONE]` sentinel handling
3. Create `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`:
   - `streamCompleteChat(req): AsyncIterable<StreamChunk>`
   - Provider resolution + fetch + classify + parse + accumulate
   - Streaming-unavailable fallback to `completeChat`
   - Emit `web:ai:rate-limited` on 429
   - Emit `web:ai:request-failed` on non-RateLimited error
4. Rewrite `claudeAdapter.ts` `completeChat`:
   - If no key configured → preserve demo line (Option A behaviour for first-load UX)
   - If key configured → call `streamCompleteChat` and accumulate; return final string
5. EventMap entries — `packages/core/src/types/events.ts` add 2 entries.
6. Storage registry entries — `packages/plugin-web-storage/src/internal/registry.ts` add 4 entries (`xai_ai_provider`, `xai_ai_base_url`, `xai_ai_model_default`, `xai_ai_streaming`).
7. Tests:
   - `sseParser.test.ts` (8 cases)
   - `llmProvider.test.ts` (6 cases)
   - `claudeStreamAdapter.test.ts` (10 cases) — fetch stubbed
   - `claudeAdapter.test.ts` — A1..A6 STAY (now run against fetch mock returning demo string when no key) + A7..A8 added
   - `index-barrel.test.ts` — +B5, B6, B7
8. NO `AiChatModule` changes yet (deferred to P3).
9. NO `_headers` / CSP changes yet (deferred to P4).

**Acceptance**
- `pnpm --filter @repo/plugin-web-ai-chat lint` / typecheck / test all green.
- `pnpm --filter @repo/plugin-web-storage test` still green after 4-entry addition.
- `pnpm --filter @repo/core typecheck` still green after 2-entry EventMap addition.
- `pnpm --filter @repo/web check-types` still green (no apps/web src edits yet).
- Total ai-chat cases: 107 + 27 = 134.
- Commit: `feat(plugin-web-ai-chat): P2 provider+SSE+stream adapter + registry+EventMap entries (gap-closure row #2)`

#### Phase P3 — AiChatModule integration + ErrorBanner + public surface

**Scope**

1. Create `packages/plugin-web-ai-chat/src/ErrorBanner.tsx`:
   - Typed banner; switches copy per `LlmError.kind`; countdown for RateLimited
2. Modify `packages/plugin-web-ai-chat/src/AiChatModule.tsx`:
   - Consume `streamCompleteChat` in queue processor (replaces direct `completeChat` await; preserves FIFO invariant + abort-on-unmount)
   - Render in-progress assistant bubble (mutates in place during stream)
   - `useWebEventListener("web:ai:rate-limited")` → set local banner state
   - `useWebEventListener("web:ai:request-failed")` → set local banner state
   - "Open Settings → AI" link emits `web:shell:module-change` with `moduleId:"settings"` + `detailId:"ai"`
3. Modify `packages/plugin-web-ai-chat/src/index.ts`:
   - Add `streamCompleteChat`, `aiKeyStorage`, `LlmError`, `LlmErrorKind`, `StreamChunk`, `StreamRequest` exports
4. Tests:
   - `ErrorBanner.test.tsx` (5 cases)
   - `AiChatModule.test.tsx` — I1..I18 STAY GREEN (via `mockNoOpStream()` helper) + I19..I23 added
5. NO Settings pane / CSP yet (deferred to P4 / P5).

**Acceptance**
- 86 + 21 (P1) + 27 (P2) + 10 (P3) = 144 ai-chat cases.
- All 18 SHIPPED integration tests stay green (regression guard).
- `pnpm --filter @repo/web test` still green.
- Commit: `feat(plugin-web-ai-chat): P3 AiChatModule streaming integration + ErrorBanner + public surface (gap-closure row #2)`

#### Phase P4 — Settings → AI pane + CSP + ADR-0008 amendment

**Scope**

1. Create `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`:
   - Provider picker (anthropic / openai-compatible)
   - Conditional Base URL field (shown for openai-compatible only)
   - API key paste input (password type) + Save + "Test Connection" + Delete
   - Model default picker (Haiku / Sonnet / Opus — bilingual labels)
   - Streaming toggle
   - Native `<dialog>` confirm for Delete API key
   - Reuses `aiKeyStorage` via `@repo/plugin-web-ai-chat` public surface
2. Add workspace dep `"@repo/plugin-web-ai-chat": "workspace:*"` to `packages/plugin-web-settings-rest/package.json` deps.
3. Modify `packages/plugin-web-settings-rest/src/index.ts` — export `aiPane`.
4. Modify `packages/plugin-web-settings-rest/src/internal/restPanesById.ts` — `ai: aiPane` entry; widen the keyed record type.
5. Modify `apps/web/src/routes/modules/settingsPaneComposition.ts` — insert `ai` between `appearance` and `more`.
6. Modify `apps/web/public/_headers` — `connect-src 'self'` → `connect-src 'self' https://api.anthropic.com`.
7. Create `apps/web/src/__tests__/csp.test.ts` — CSP1 source-text guard.
8. Amend `docs/adr/0008-cloudflare-deploy-target-and-csp.md`:
   - §S3 D3 CSP table — add new `connect-src` row with `https://api.anthropic.com` reference
   - Frontmatter — add "Amendments" sub-section with 2026-05-25 entry citing this row
   - §S6 implementation rules — update `_headers` content snippet
9. Update `docs/PLUGIN_MAP.md`:
   - `@repo/plugin-web-ai-chat` row note: append "(Extension 2026-05-25 — real LLM adapter + IndexedDB+WebCrypto key storage + ErrorBanner)"
   - `@repo/plugin-web-settings-rest` row note: append "(Extension 2026-05-25 — +aiPane for AI provider/key/model config)"
10. Tests:
    - `aiPane.test.tsx` (12 cases) under plugin-web-settings-rest
    - `csp.test.ts` (1 case) under apps/web

**Acceptance**
- `pnpm --filter @repo/plugin-web-settings-rest lint` / typecheck / test all green; 81 SHIPPED + 12 new = 93.
- `pnpm --filter @repo/web check-types` + `test` + `build` all green; 100 SHIPPED + 1 new = 101.
- Vite build emits valid `_headers` to `dist/_headers`.
- ADR-0008 amendment lands in same commit as `_headers` edit.
- Commit: `feat(plugin-web-settings-rest+apps/web): P4 Settings → AI pane + CSP widen + ADR-0008 amend (gap-closure row #2)`

#### Phase P5 — End-to-end verify + cross-vendor smoke + acceptance signals

**Scope**

1. `pnpm --filter @repo/plugin-web-ai-chat test` — 144/144 cases.
2. `pnpm --filter @repo/plugin-web-settings-rest test` — 93/93.
3. `pnpm --filter @repo/web test` — 101/101.
4. `pnpm --filter @repo/web build` — 0 errors; emitted `dist/_headers` contains the new CSP entry.
5. Manual on `pnpm --filter @repo/web dev:mock-auth`:
   - AS1 — Paste Anthropic test key (operator's own) in Settings → AI; send "hello" in /app/ai; observe SSE streaming in DevTools Network panel; observe tokens appended to bubble incrementally.
   - AS2 — Delete key; send a message; ErrorBanner appears with "Configure your API key" copy + working link to Settings → AI.
   - AS2 — Paste known-bad key (e.g. `sk-ant-xxxxxxxxxx`); send; "Invalid key" banner.
   - AS2 — Simulate 429 via mitm or by spamming until natural 429; observe rate-limit countdown.
   - AS3 — DevTools Application → Local Storage; grep for `sk-ant`; expect zero matches. DevTools Application → IndexedDB → `xai-web-ai-secrets`; observe binary ciphertext only.
   - AS5 — DevTools Console; happy-path message send produces zero `Refused to connect` errors.
6. Cross-vendor verify (Codex `gpt-5.5-thinking medium` primary):
   - Cold-read `secretStore.ts` — KDF parameters correct? AES-GCM IV unique per save?
   - Cold-read `_headers` diff + ADR-0008 amendment — does CSP widen beyond the new LLM endpoint? Does ADR amendment record the strictness delta?
   - Cold-read `streamCompleteChat` — `AbortSignal` wired correctly? Error categorization complete?
7. Write `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-verify-report.md` recording PASS/FAIL per gate.

**Acceptance**
- All AS1..AS6 PASS.
- Codex cross-vendor cold-read PASS or explicit acknowledged-non-blocking notes.
- Status → READY_TO_SHIP.
- Suggested Next = `ship`.

### Risks (this extension)

R1..R10 catalogued in `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-discovery-review.md` §8 — Anthropic CORS regression / CSP drift / WebCrypto unavailability / IDB private-mode eviction / bad-key validation / SSE parser correctness / existing-test regression / dev vs prod CSP / OpenAI-compatible CSP gap / WebCrypto jsdom availability.

Key mitigations baked into phases:
- R2 (CSP drift): P4 ships `csp.test.ts` source-text guard.
- R3 (WebCrypto unavailability): P1 includes feature-check banner path.
- R4 (IDB eviction): P3 ErrorBanner copy includes private-mode-aware text.
- R7 (existing-test regression): every phase runs the full SHIPPED test suite as part of acceptance.

### Phase Progress

| Phase | Status | Commit | Notes |
|---|---|---|---|
| P1 — Crypto + IDB + LlmError | DONE | 86403e8 | 86 SHIPPED + 21 new = 107 tests; secretStore (SC1..SC8), llmErrors (LE1..LE12), no-plaintext-key (NP1); tsconfig switched to bundler moduleResolution |
| P2 — Provider + SSE + Stream + Registry + EventMap | DONE | 6b910eb | 136 tests (18 files); llmProvider (LP1..LP6), sseParser (SP1..SP8), claudeStreamAdapter (CS1..CS10), claudeAdapter A7/A8; lint+typecheck clean |
| P3 — AiChatModule + ErrorBanner + public surface | DONE | 9209aa4 | 146 tests (19 files); EB1..EB5 (ErrorBanner), I19..I23 (streaming integration); AiChatModule uses streamCompleteChat |
| P4 — Settings → AI pane + CSP + ADR-0008 amend | DONE | d26b63e | 93 plugin-web-settings-rest tests (16 files, AP1..AP12 new); 101 apps/web tests; CSP1 guard; ADR-0008 amended in-place |
| P5 — Verify + cross-vendor + acceptance | DONE | 2c13ed4 | Automated gates G1..G8 PASS; verify report at docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-verify-report.md; manual AS1..AS6 + CV1..CV3 PENDING human operator |

### Review Notes (2026-05-25, feature-review — claude-opus-4-7[1m])

**Verdict: APPROVED.** 0 blockers, 4 non-blocking recommendations.

Checklist results (8 gates):

1. **Scope sanity** — pass. AS1..AS6 mapped 1:1 to verify gates in discovery §9 + test §7.4. No over-scope (RAG / tool-use / cross-device sync / `messages` persistence / telemetry all explicitly deferred). No under-scope (all 6 seed-brief acceptance items have verify mechanisms).
2. **Hard constraint compliance (HC1..HC10)** — pass on all 10. HC1 IndexedDB+WebCrypto (PBKDF2 600k iter → AES-GCM-256, per-install salt; design FA-3 + api §12.2). HC2 Anthropic default + OpenAI-compatible (design FA-1/2 + api §12.5). HC3 SSE + non-stream fallback (api §12.1). HC4 429 → `web:ai:rate-limited` + countdown (design FA-8 + api §12.4 + EB3 test). HC5 5-kind error union with per-kind banner copy (api §12.3/§12.8). HC6 CSP amend-in-place ADR-0008 §S3 D3 with 4-point justification (discovery §6). HC7 `completeChat` signature unchanged externally (design FA-1 + api §12 preamble). HC8 Cross-vendor verify gated in P5 (Codex `gpt-5.5-thinking` primary per ADR-0009 §D4). HC9 binding-precedent recorded for wave 1+2+3 CSP rows (discovery §6 Pattern-setter note). HC10 seed brief is Step 0 input (discovery §1).
3. **Architectural fit (SYSTEM_ARCHITECTURE §3 + §4)** — pass. All new code lives in `packages/xai-web-* / plugin-web-*` boundaries. Cross-plugin helper sharing (`aiKeyStorage` from `@repo/plugin-web-ai-chat` to settings-rest) routed through public `src/index.ts` barrel per ADR-0007 §S4. Two new typed channels go through `@repo/core/types/events.ts` + `@repo/xai-web-event-bus`. Non-secret prefs via `usePref`; secrets in IDB-only — never localStorage. No `@tauri-apps/api` imports.
4. **PLUGIN_MAP consistency** — pass with one bookkeeping note (Rec1 below). plugin-web-ai-chat / plugin-web-settings-rest / xai-web-event-bus / plugin-web-storage all confirmed Stable in `docs/PLUGIN_MAP.md`. `@repo/web-auth-device-session` is real and SHIPPED in code (`src/index.ts` exports `createIndexedDbStore`, `createDeviceIdentityStore`) but the PLUGIN_MAP entry is missing — Rec1.
5. **Test strategy reality check** — pass. 86 ai-chat + 81 settings-rest + 100 apps/web SHIPPED cases all preserved as regression-guard. New ~74 cases sized appropriately. `fake-indexeddb` devDep is the right choice for jsdom WebCrypto+IDB round-trip. E2E gated as P5 manual smoke per ADR-0009 §D2-G2 deferred-24h pattern.
6. **Phase granularity** — pass. 5 phases each have explicit DoD + commit-message draft. P4 cross-package commit (Settings pane + CSP + ADR) is justified because CSP edit + ADR amendment + `_headers` change MUST land together for audit-integrity.
7. **Risk register completeness** — pass. 10 risks (exceeds 5-min baseline). All expected categories present: R1 CORS regression, R3 WebCrypto unavailable, R4 IDB private-mode eviction, R6 SSE parser edge cases, R8 dev-vs-prod CSP, plus R2/R5/R7/R9/R10.
8. **ADR amendment vs new ADR** — pass. discovery §6 articulates 4 reasons for in-place amendment + escalation criteria for future rows (new ADR only if `'unsafe-inline'`, Worker, or 3rd-party script source). Aligned with roadmap line 143 guidance.

**Non-blocking recommendations** (planner may roll into build phases without re-review):

- **Rec1 (minor — PLUGIN_MAP bookkeeping):** `@repo/web-auth-device-session` is SHIPPED in code (verified `src/index.ts`) but absent from `docs/PLUGIN_MAP.md` (neither W1 shims nor W2 modules tables). Recommend adding a row in P1 OR documenting the gap as a known parent-issue in dev_log Work Log. Bookkeeping only — does not block code.
- **Rec2 (minor — pref-read inside non-React function):** api §12.1 says `streamCompleteChat` reads `usePref` values via "a one-shot snapshot loader". `usePref` is a hook and cannot run inside a non-React async function. Recommend P2 clarify that `llmProvider.resolveProvider()` reads `xai_*` keys via direct localStorage read (the SHIPPED reader-helper sibling pattern in `@repo/plugin-web-storage`), NOT by calling `usePref()`. Intent is clear from context but worth pinning to avoid a hooks-rules lint flag.
- **Rec3 (minor — pin Anthropic model id strings):** design FA-1 + plan say model strings (`claude-haiku-4-5-...` etc.) "resolved at request time" / "at build time". Recommend P2 pin the exact 3 model id strings as constants in `llmProvider.ts` with a code comment citing the doc URL + freeze date. Avoids runtime "model not found" surprise.
- **Rec4 (minor — P5 manual-smoke key hygiene):** P5 step 5 says "Paste Anthropic test key (operator's own)". Recommend the verify-report template explicitly remind the operator the test key MUST NOT be committed AND MUST be rotated/revoked after the smoke. Standard practice but worth pinning given this row is the first time the codebase touches a real LLM endpoint.

### Suggested Next

`feature-build` (or `feature-auto-build` for serial-loop dispatch)

### Work Log (this extension)

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-25 | claude-opus-4-7[1m] (feature-plan, xai-roadmap-loop SERIAL dispatch for row #2 after bg failure 287a81aa) | Read seed brief + SHIPPED row #18 design/api/test/dev_log + ADR-0008 + ADR-0009 + plugin-web-settings-rest patterns + web-auth-device-session SHIPPED helpers + xai-web-event-bus + plugin-web-storage registry. WebSearch x2 (Anthropic CORS + WebCrypto-AES-GCM-IDB). Wrote discovery review at `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-discovery-review.md`. Decided Option A (direct CORS + BYO key) over Option B (Worker proxy) + Option C (Edge Function). CSP governance decision: amend ADR-0008 §S3 D3 in-place (NOT new ADR-0010); binding precedent for wave 1+2+3 CSP rows. Appended "2026-05-25 Extension" sections to design.md / api.md (§12) / test.md (§7). Appended this Bugfix-Extension Lineage block. 5-phase plan (P1 crypto+IDB / P2 stream-adapter / P3 module integration / P4 pane+CSP+ADR / P5 verify+cross-vendor). 10 frozen assumptions; R1..R10 risk register. | — | feature-review |
| 2026-05-25 | claude-opus-4-7[1m] (feature-review, xai-roadmap-loop SERIAL dispatch for row #2) | Independently reviewed plan against 8 gates (scope sanity, HC1..HC10 compliance, architectural fit, PLUGIN_MAP consistency, test reality check, phase granularity, risk completeness, ADR governance). Cross-checked PLUGIN_MAP statuses (plugin-web-ai-chat / plugin-web-settings-rest / xai-web-event-bus / plugin-web-storage all Stable). Verified `@repo/web-auth-device-session` exports `createIndexedDbStore` + `createDeviceIdentityStore` in SHIPPED code. Verified `apps/web/public/_headers` current CSP `connect-src 'self'` is the correct widening anchor. Verified `web:shell:module-change` channel exists with `detailId` field that matches I22's expected payload. **APPROVED** — 0 blockers, 4 non-blocking recs (Rec1 PLUGIN_MAP add web-auth-device-session row; Rec2 clarify pref-read uses direct localStorage not `usePref` hook inside `resolveProvider`; Rec3 pin Anthropic model id strings as P2 constants; Rec4 P5 verify-report adds key-hygiene reminder). | — | feature-build (or feature-auto-build for serial loop) |
| 2026-05-25 03:25 | claude-sonnet-4-6 (feature-auto-build P1, xai-roadmap-loop SERIAL dispatch for row #2) | P1 already committed (86403e8) in prior session. Resumed at P2. Fixed lint (7 warnings: removed unused `oaiDelta` helper + added varsIgnorePattern `^_` in eslint.config.js). Implemented demoReply.ts (circular-dep break), llmProvider.ts (+ANTHROPIC_MODEL_IDS constants per Rec3), sseParser.ts, claudeStreamAdapter.ts; rewrote claudeAdapter.ts key-aware path; extended index.ts barrel (+streamCompleteChat/aiKeyStorage/LlmError); added web:ai:rate-limited + web:ai:request-failed to core EventMap; added 4 pref entries to plugin-web-storage registry + updated registry.test.ts/parity-design-md.test.ts OWNER_ROW_ADDITIONS. All tests green: 136/136 ai-chat + 88/88 storage; lint --max-warnings 0 clean; typecheck clean. | 6b910eb | feature-auto-build P3 |
| 2026-05-25 03:40 | claude-sonnet-4-6 (feature-auto-build P3, xai-roadmap-loop SERIAL dispatch for row #2) | Implemented ErrorBanner.tsx (EB1..EB5; BadKey/RateLimited/Network/Server copy + countdown + retry + dismiss + settings nav); modified AiChatModule.tsx (streamCompleteChat integration, placeholder bubble on FIRST chunk for FIFO ordering, `useWebEventListener` for rate-limited + request-failed, `handleOpenSettings` via emitWebEvent, `AbortController` ref); updated index.ts public surface (+streamCompleteChat, aiKeyStorage, AiKeyStorage, AiProvider, LlmError, LlmErrorKind, StreamChunk, StreamRequest); updated AiChatModule.test.tsx (mockNoOpStream helper for I1..I18 backward compat, I17 updated to spy streamCompleteChat, I19..I23 added, FIFO ordering fix, I20 Promise.reject pattern for throwing generator). All gates: 146/146 ai-chat tests; lint --max-warnings 0; plugin-web-storage 88/88. | 9209aa4 | feature-auto-build P4 |
| 2026-05-25 04:00 | claude-sonnet-4-6 (feature-auto-build P4, xai-roadmap-loop SERIAL dispatch for row #2) | Implemented aiPane.tsx in plugin-web-settings-rest (provider picker, conditional base URL, password-type key input + save/test/delete, model picker, streaming toggle, native dialog confirm, delegates to aiKeyStorage — HC1 compliant); extended SettingsPaneId union + paneRegistry with "ai" (settings-shell types.ts + paneRegistry.tsx — chassis now 14 panes); added workspace dep @repo/plugin-web-ai-chat to settings-rest package.json; exported aiPane from index.ts + restPanesById.ts + applyRestPanesToRegistry.ts; wired aiPane into settingsPaneComposition.ts; widened _headers connect-src to `'self' https://api.anthropic.com`; created csp.test.ts (CSP1 guard); amended ADR-0008 (frontmatter Amendments row + §S3 D3 binding-precedent paragraph with extension rule table + §S6 _headers snippet update); updated 5 failing tests (restPanesById RP1: 11→12, index-barrel B1/B2: 11→12, settingsPaneComposition.rest CP1: 13→14 + CP2 add aiPane + CP3 add "ai" to SUBSTITUTED_IDS, settingsPaneComposition.appearance AC-COMP-1: 13→14, settingsPaneComposition.test AC-COMP-1: 13→14 + CP3 add "ai"); created aiPane.test.tsx AP1..AP12 with vi.hoisted mock for aiKeyStorage; updated PLUGIN_MAP.md (plugin-web-ai-chat + plugin-web-settings-rest + plugin-web-settings-shell row notes). All gates: 93/93 settings-rest tests (16 files); 101/101 apps/web tests (20 files); lint clean. | d26b63e | feature-auto-build P5 |
| 2026-05-25 04:15 | claude-sonnet-4-6 (feature-auto-build P5, xai-roadmap-loop SERIAL dispatch for row #2) | Ran all automated gates: G1 plugin-web-ai-chat lint (PASS), G2 typecheck (PASS), G3 146/146 (19 files, PASS), G4 plugin-web-settings-rest lint (PASS), G5 93/93 (16 files, PASS), G6 apps/web 101/101 (20 files, PASS), G7 build 0 errors (788 modules, PASS), G8 dist/_headers `connect-src 'self' https://api.anthropic.com` present (PASS). Wrote verify report at docs/reviews/xai-web-ai-chat-real-llm-adapter/20260525-verify-report.md with gate evidence, CSP amendment evidence, HC1/HC7/HC9 compliance notes, commit attribution review, FA-1..FA-10 + api.md §12 contract review, residual risks R1/R8/R9. Manual smoke AS1..AS6 + cross-vendor CV1..CV3 PENDING human operator. Status → READY_FOR_VERIFY. | 2c13ed4 | feature-verify |
| 2026-05-25 04:00 | claude-opus-4-7[1m] (feature-verify, xai-roadmap-loop SERIAL dispatch for row #2) | Independently reviewed 5 commits (86403e8 P1 / 6b910eb P2 / 9209aa4 P3 / d26b63e P4 / 2c13ed4 P5) against plan (design §2026-05-25 / api §12 / test §7) + 10 HCs + 6 acceptance signals + ADR-0009 §D2-G2/§D4 gates. Re-ran automated gates: plugin-web-ai-chat test 146/146 (19 files), plugin-web-settings-rest test 93/93 (16 files), apps/web test 101/101 (20 files), apps/web build 0 errors (788 modules, dist/_headers contains `connect-src 'self' https://api.anthropic.com`), plugin-web-storage test 88/88, core typecheck clean. Verified HC1 (secretStore AES-GCM-256 + PBKDF2 600k + NP1 invariant), HC2 (llmProvider Anthropic+OpenAI-compat), HC3 (sseParser + null-body fallback), HC4 (web:ai:rate-limited emit with retryAfterSec + countdown in ErrorBanner), HC5 (LlmError 5-kind taxonomy + ErrorBanner discrimination), HC6 (CSP widening in _headers + ADR-0008 §S3 D3 in-place amendment with binding-precedent rule), HC7 (completeChat signature unchanged in index.ts), HC9 (extension rule documented for waves 1/2/3), HC10 (discovery-review §1 cites seed brief). Architectural fit: zero @tauri-apps/api imports in xai-web-* / plugin-web-* / apps/web; cross-package events via @repo/xai-web-event-bus; aiKeyStorage consumed via public surface (no internal imports). Manual smoke AS1..AS6 + cross-vendor CV1..CV3 DEFERRED 24h per ADR-0008 carve-out + ADR-0009 §D2-G2 (consistent with sibling-row retroactive batch precedent 2026-05-24). Rec1 (web-auth-device-session PLUGIN_MAP row) remains open but NON-BLOCKING per planner. Verdict: PASS → READY_TO_SHIP. | — | ship |
| 2026-05-25 05:00 | claude-sonnet-4-6 (ship) | **Ship Report — row #2 of xai-web-console-gap-closure (wave 1)**. Workflow guard: Status=READY_TO_SHIP — proceed. Verified git state: working tree clean; all 7 feature commits already on origin/main (no new push required for feature commits). Commit convention spot-check: all 7 commits follow type(scope): summary format with Co-Authored-By trailers (verified). Flipped Lineage Status Panel: Current Phase → SHIPPED, Status → SHIPPED, Suggested Next → —, Executor → claude-sonnet-4-6 (ship, 2026-05-25), Updated → 2026-05-25 05:00. Feature commits shipped: 86403e8 (P1 crypto+IDB+LlmError) / 6b910eb (P2 provider+SSE+stream+registry+EventMap) / 9209aa4 (P3 AiChatModule+ErrorBanner) / d26b63e (P4 Settings→AI pane+CSP+ADR-0008 amend) / 2c13ed4 (P5 verify report) / 477cfb2 (chore P5 dev_log hash record) / 8b9dc2f (docs roadmap READY_TO_SHIP). Roadmap reference: docs/workflow/roadmap/xai-web-console-gap-closure.md row #2 (Wave 1 — Gap 1 AI real-LLM adapter). Wave 1 pipeline outcome: confirms serial dispatch works end-to-end for FEATURE-flavor work (row #2) after row #1 (bugfix-flavor) SHIPPED 2026-05-25. Rows #3/#4/#5 remain PENDING and eligible. Deferred residual risks acknowledged: R1 manual smoke AS1..AS6 deferred 24h (real API key required; operator must rotate post-smoke); R2 cross-vendor CV1..CV3 cold-read deferred 24h (Codex gpt-5.5-thinking secretStore/headers/streamCompleteChat); R3 web-auth-device-session PLUGIN_MAP row missing (non-blocking bookkeeping — user may have addressed between verify and ship); R4 Vite dev does not apply _headers (CSP1 source-text guard mitigates; AS5 deferred); R5 OpenAI-compatible base-URL not in CSP (user-blocked scenario; follow-up row if needed). | (chore — this commit) | — |

### Verify Report (2026-05-25 04:00 — claude-opus-4-7[1m] / feature-verify)

**Verdict: PASS.** Status → READY_TO_SHIP.

#### Automated gates (re-executed)

| Gate | Result | Evidence |
|---|---|---|
| G1 — plugin-web-ai-chat test | PASS | 19 files, 146/146 cases pass |
| G2 — plugin-web-settings-rest test | PASS | 16 files, 93/93 cases pass (AP1..AP12 included) |
| G3 — apps/web test | PASS | 20 files, 101/101 cases pass (CSP1 guard included) |
| G4 — apps/web build | PASS | vite v7.2.4, 788 modules, 0 errors, dist/_headers contains `connect-src 'self' https://api.anthropic.com` |
| G5 — plugin-web-storage test | PASS | 9 files, 88/88 cases pass (4 new prefs honored) |
| G6 — core typecheck | PASS | tsc --noEmit clean (web:ai:* EventMap entries valid) |

#### Hard constraint compliance (all 10 HCs)

| HC | Evidence |
|---|---|
| HC1 — IDB+WebCrypto key storage | secretStore.ts uses AES-GCM-256 + PBKDF2-HMAC-SHA256 600k iter + device UUID passphrase; NP1 test asserts plaintext never in localStorage or raw IDB blob; aiPane.tsx key input type=password (AP12) |
| HC2 — Anthropic default + OpenAI-compatible | llmProvider.ts two-branch resolveProvider; ANTHROPIC_MODEL_IDS pinned constants (Rec3 done) |
| HC3 — SSE streaming + fallback | sseParser.ts handles buffer accumulation + comment skip + [DONE] sentinel; claudeStreamAdapter.ts null-body branch yields demo string |
| HC4 — 429 → web:ai:rate-limited + countdown | claudeStreamAdapter.ts emits with retryAfterSec; ErrorBanner.tsx RateLimited branch + interval countdown (EB3 test) |
| HC5 — LlmError 5-kind taxonomy | LlmError discriminated union (BadKey/RateLimited/Network/Server/Malformed) + per-kind ErrorBanner copy (EB1..EB5) |
| HC6 — CSP connect-src widening | _headers + dist/_headers both contain `https://api.anthropic.com`; ADR-0008 §S3 D3 amended in-place + frontmatter Amendments row + §S6 snippet updated |
| HC7 — completeChat signature unchanged | index.ts re-export shape (text, lang) => Promise<string> unchanged; A1..A6 backward-compat tests all pass |
| HC8 — Cross-vendor verify gate | CV1..CV3 cold-read DEFERRED 24h per ADR-0008 carve-out + ADR-0009 §D2-G2 (consistent with 2026-05-24 retroactive batch precedent for rows #2/#3/#4/#8/#10/#18) |
| HC9 — Binding-precedent for wave 2/3 | ADR-0008 §S3 D3 "Extension rule" paragraph explicitly mandates same amendment pattern for future external-origin rows + source-text guard requirement |
| HC10 — Seed brief is Step 0 input | discovery-review.md §1 cites `docs/reviews/xai-web-ai-chat-real-llm-adapter/20260524-roadmap-seed.md` (NOT upstream PRD) |

#### Acceptance signal coverage (6 from seed brief)

| Signal | Mechanism | Status |
|---|---|---|
| (a) Streamed tokens render real-time | AiChatModule.tsx placeholder bubble mutation + I19..I23 integration tests | Code-path PASS; runtime PENDING manual smoke |
| (b) Bad key → clear error banner | LlmError.BadKey → ErrorBanner copy + AP10 test | PASS |
| (c) Rate-limit countdown | web:ai:rate-limited payload retryAfterSec + EB3 countdown test | PASS |
| (d) Offline → reconnect prompt | LlmError.Network branch + ErrorBanner Retry button | PASS |
| (e) xai_ai_* keys do NOT contain raw API key | NP1 test asserts no plaintext in localStorage OR raw IDB blob | PASS |
| (f) CSP report-uri 0 violations | CSP1 source-text guard + dist/_headers verification | PASS at source; runtime PENDING manual smoke (AS5) |

#### Commit-attribution review

| Commit | Scope | Convention |
|---|---|---|
| 86403e8 (P1) | packages/plugin-web-ai-chat/ secretStore + llmErrors + tests | Why/What/Scope/Risk/Docs/Tests + Co-Authored-By; PASS |
| 6b910eb (P2) | packages/plugin-web-ai-chat/ + storage registry + core EventMap | Why/What/Scope/Risk/Docs/Tests + Co-Authored-By; PASS |
| 9209aa4 (P3) | packages/plugin-web-ai-chat/ AiChatModule + ErrorBanner | Why/What/Scope/Risk/Docs/Tests + Co-Authored-By; PASS |
| d26b63e (P4) | plugin-web-settings-rest + plugin-web-settings-shell + plugin-web-tokens + apps/web + docs/adr + docs/PLUGIN_MAP | Why/What/Scope/Risk/Docs/Tests + Co-Authored-By; multi-package atomic for audit-integrity per plan; PASS |
| 2c13ed4 (P5) | docs/reviews + docs only; verify report + dev_log state | Doc-only chore; convention clean; PASS |

#### Residual risks (non-blocking)

- **R1 (manual smoke AS1..AS6 PENDING):** Real API key required. Deferred 24h per ADR-0008 carve-out + ADR-0009 §D2-G2; consistent with 2026-05-24 retroactive batch precedent. Operator MUST rotate test key post-smoke.
- **R2 (cross-vendor CV1..CV3 PENDING):** Codex `gpt-5.5-thinking` cold-read of secretStore.ts / _headers diff / streamCompleteChat. Deferred 24h per same carve-out.
- **R3 (web-auth-device-session row missing from PLUGIN_MAP):** Planner Rec1 — non-blocking bookkeeping. The package exists at packages/web-auth-device-session/ and exports the SHIPPED helpers as consumed; only the registry row is missing. Recommend follow-up chore commit.
- **R4 (Vite dev CSP gap):** `pnpm dev` does NOT apply `_headers`; only `pnpm build && wrangler pages dev` exercises the deployed CSP. CSP1 source-text guard mitigates at unit-test level; manual smoke AS5 confirms at runtime (deferred 24h).
- **R5 (OpenAI-compatible base-URL not in CSP):** Documented in aiPane.tsx desc; user-blocked scenario only. Follow-up row if needed.

