# Dev Log — xai-web-ai-chat

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-ai-chat |
| Title | Web Console AI Chat Module — collapsible 248px conversation sidebar + 5-layer aurora background (90px blur + screen blend) + 3 conic gradients (40/55/70s rotate) + 60 twinkling stars + SVG grain + 4-layer accent floor + breathing 3-layer orb (9/11/13s idle → 3.5/4.2/5s thinking) + composer pill (attach + input + Haiku/Sonnet/Opus picker + voice toggle + Enter to send) + starter-prompts panel gated by top-right Insights pill. LLM call goes through a no-op typed `claudeAdapter` returning bilingual demo line after 600–1200 ms jitter (Option A — Option B reserved for a future row). Conversations persist to `xai_ai_convos`; insights toggle to `xai_ai_insights`; voice toggle to `xai_ai_voice` — all three SHIPPED non-`proposed` entries in `@repo/plugin-web-storage`. |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-build (or feature-auto-build / feature-dev-loop) |
| Verify Cross-vendor | yes (aurora `mix-blend-mode: screen` + `color-mix(in oklch, …)` + `conic-gradient` + `prefers-reduced-motion` rendering identical across Chrome 120 / Safari 17 / Firefox 121) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W2c parallel-Agent mode — siblings #12 calendar + #16 meditation planning concurrently) |
| Executor | Claude Opus 4.7 1M (feature-review, 2026-05-23) |
| Updated | 2026-05-23 |
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

## Suggested Next

`feature-build` (or `feature-auto-build` / `feature-dev-loop`)

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-23 | Claude Opus 4.7 1M (feature-plan, xai-roadmap-loop W2c) | Wrote discovery-review.md, design.md, api.md, test.md, dev_log.md. Decided Option A for `window.claude.complete` adapter (no-op typed shim, bilingual demo line after 600–1200 ms jitter). Three SHIPPED storage keys verified non-`proposed`. Three phases planned: P1 scaffolding+adapter+helpers+visuals, P2 composition+persistence+send-flow, P3 shell registration+apps/web wire-up+cross-vendor smoke. | — | feature-review |
| 2026-05-23 | Claude Opus 4.7 1M (feature-review, xai-roadmap-loop W2c) | Reviewed 5 planning gates. APPROVED with 0 blockers + 2 non-blocking recs (DRY-helper locality note; `dev:mock-auth` smoke vehicle). | — | feature-auto-build |
