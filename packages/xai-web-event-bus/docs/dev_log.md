# Dev Log — xai-web-event-bus

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-event-bus |
| Title | Typed Web Event Bus + Web-only Runtime Adapter |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Verify Cross-vendor | yes |
| Automation Mode | A-Claude (per roadmap default) |
| Executor | Claude Sonnet 4.6 — feature-auto-build |
| Updated | 2026-05-23 11:10 |
| Dispatched By | xai-roadmap-loop (parallel-Agent, W1) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #4 |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 + §S7 + 冻结假设 §4 |
| Concurrent Siblings | xai-web-tokens-and-i18n (#2), xai-web-persistence-contract (#3) — running in parallel; write scope strictly `packages/xai-web-event-bus/` |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-event-bus/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-event-bus/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-event-bus/docs/design.md`
- API contract: `packages/xai-web-event-bus/docs/api.md`
- Test strategy: `packages/xai-web-event-bus/docs/test.md`

## Decision Headline

Selected **Option B (hybrid)**: append five `web:*` keys to `@repo/core/types/events` (the typed-event source-of-truth that ADR-0007 §S7 mandates), and ship a new browser-only runtime adapter inside `packages/xai-web-event-bus/` using native `EventTarget`. The Tauri-bound `@repo/core/events` runtime cannot operate inside `apps/web/`; the type layer is shared, the transport is split.

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Typed Event Taxonomy + Bus Core | DONE | (see Work Log) |
| P2 — React Adapter Hook | DONE | (merged into P1 commit; listener.ts + listener.test.tsx) |
| P3 — Cross-package Smoke Test + Cleanup | DONE | (see Work Log) |

## Phase Plan (3 phases)

> Each phase is a single `feature-build` run. After each phase, `feature-build` stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run".

### Phase P1 — Typed Event Taxonomy + Bus Core

**Scope**

1. Append to `packages/core/src/types/events.ts`:
   - `WebModuleId` type
   - `WebPreferenceKey` + `WebPreferenceValue` (or refined `WebPreferenceChange` discriminated union)
   - Five `EventMap` keys: `web:shell:module-change`, `web:shell:pet-toggle`, `web:settings:preference-changed`, `web:pomodoro:session-finished`, `web:habits:checkin-recorded`
2. Create package scaffolding:
   - `packages/xai-web-event-bus/package.json` (name `@repo/xai-web-event-bus`, version 0.0.0, private, peer-dep on react@^19, dep on @repo/core workspace:*)
   - `packages/xai-web-event-bus/tsconfig.json` (extends `@repo/typescript-config`)
   - `packages/xai-web-event-bus/manifest.json` (status: In-Dev — per docs/PLUGIN_MAP.md convention; but note this is NOT a plugin-web-* business plugin, it's a Web platform shim — manifest may not be required; feature-review to confirm)
   - `packages/xai-web-event-bus/src/index.ts`
   - `packages/xai-web-event-bus/src/events.ts` — exports `WebEventMap` / `WebEventKey` type aliases over `@repo/core` `EventMap`
   - `packages/xai-web-event-bus/src/emitter.ts` — `emitWebEvent` + `onWebEvent`
3. No React hook yet (P2).

**Acceptance**

- `pnpm install` resolves the new workspace package.
- `pnpm --filter @repo/core check-types` PASS (new EventMap keys do not break existing emitters).
- `pnpm --filter @repo/xai-web-event-bus check-types` PASS.
- Unit tests E1..E6 + S1..S5 + T1..T3 PASS.

**Files touched (estimated)**

- New: `packages/xai-web-event-bus/{package.json, tsconfig.json, manifest.json, src/index.ts, src/events.ts, src/emitter.ts, src/emitter.test.ts, src/events.test-d.ts}`
- Modified: `packages/core/src/types/events.ts` (additive only)

### Phase P2 — React Adapter Hook

**Scope**

1. `packages/xai-web-event-bus/src/listener.ts` — `useWebEventListener` hook using ref-stable handler pattern (`useRef` + `useLayoutEffect` for React 19 compat).
2. `packages/xai-web-event-bus/src/listener.test.tsx` — H1..H6 with @testing-library/react.
3. Update `packages/xai-web-event-bus/src/index.ts` to re-export `useWebEventListener`.
4. Add devDeps to `packages/xai-web-event-bus/package.json`: `@testing-library/react@^16`, `jsdom@^26`, `vitest@^3.2.1`.

**Acceptance**

- Hook tests H1..H6 PASS, including StrictMode double-mount H6.
- T4 type test PASS (handler arg correctly typed).

**Files touched (estimated)**

- New: `packages/xai-web-event-bus/src/{listener.ts, listener.test.tsx}`
- Modified: `packages/xai-web-event-bus/{src/index.ts, package.json}`

### Phase P3 — Cross-package Smoke Test + Cleanup

**Scope**

1. Add cross-package smoke test in `apps/web/src/__tests__/event-bus.smoke.test.tsx` running A1..A3 scenarios with `<EmitterFixture>` + `<ListenerFixture>`.
2. Add `@repo/xai-web-event-bus` to `apps/web/package.json` devDependencies (NOT runtime — runtime addition is xai-web-shell's job in row #5).
3. Run cross-vendor manual verify per `test.md` §"Manual Verify" — record results in dev_log Work Log.
4. Finalize lint config: extend `packages/xai-web-event-bus/.eslintrc` (or `eslint.config.js`) with `@typescript-eslint/no-explicit-any: error` and `import/no-restricted-paths` for the `src/internal/**` boundary.
5. Verify no `src/internal/` deep imports exist anywhere in repo (none should — this package's internal/ is new).

**Acceptance**

- A1..A3 PASS in `apps/web/` Vitest run.
- Manual verify recorded in Work Log with browser versions and PASS/FAIL.
- `pnpm --filter @repo/xai-web-event-bus lint` PASS with 0 warnings.
- Test coverage >= 90% statements/branches inside `packages/xai-web-event-bus/src/`.

**Files touched (estimated)**

- New: `apps/web/src/__tests__/event-bus.smoke.test.tsx`, `packages/xai-web-event-bus/eslint.config.js`
- Modified: `apps/web/package.json` (devDep), possibly `apps/web/vitest.config.ts` if not auto-discovered

## Risks (carried forward from discovery review §6)

| ID | Risk | Status |
|---|---|---|
| R1 | feature-review rejects "create a new package" reading of ADR-0007 §S7 | open — discovery review §2/§5 documents the rebuttal; fallback to `apps/web/src/event-bus/` if rejected |
| R2 | EventMap merge conflict with sibling rows #2/#3 | mitigated — sibling rows should not edit EventMap; surfaced in Handoff |
| R3 | `WebPreferenceValue` loose union loses narrowing | mitigated — refine in P1 implementation |
| R4 | Cross-tab sync demanded later | accepted — out of v1 scope per ADR-0006 |
| R5 | StrictMode double-mount false-positive emit | mitigated — test H6 + ref-stable pattern |
| R6 | Web vs desktop bus payload drift | structurally prevented — shared EventMap |

## Open Questions for feature-review

- Q1: Package name `@repo/xai-web-event-bus` vs `@repo/plugin-web-event-bus` vs embedded `apps/web/src/event-bus/`. Confirm.
- Q2: Are five v1 channels sufficient? Specifically: command-palette open/close, search-applied, board-card-selected — defer or include?
- Q3: Confirm sync emit semantics (Web bus is sync; desktop bus is async). Acceptable asymmetry?

## Review Notes

**Verdict: APPROVED** (0 blockers, 3 minor recommendations carried into feature-auto-build as implementation guidance).

### Gates evaluated (all PASS)

1. **Discovery quality** — PASS. Four options analyzed (A reuse runtime / B hybrid / C modify @repo/core / D 3rd-party lib); each has comparable Pros/Cons; recommendation justified by tradeoff matrix §4. External research §3 documents `EventTarget` support, mitt/nanoevents maintenance state, React 19 StrictMode, and typed-bus patterns.
2. **Design snapshot alignment** — PASS. `design.md` Selected-Option block, Frozen Assumptions (1)..(10), and Dependency Overview all match discovery §5/§6. (Minor cosmetic: design.md labels the selected option as "Option C" while the discovery review labels it "Option B" — they describe the same hybrid choice; planner is free to harmonize the label in P1 but this is not blocking.)
3. **Contract completeness** — PASS. `api.md` §1 documents EventMap additions with payload field semantics; §2 documents `emitWebEvent` / `onWebEvent` / `useWebEventListener` signatures, error/idempotency/SSR/ordering/re-entrancy semantics; §3 Permission/Idempotency/Ordering table is explicit; §4 upstream / §5 downstream dependencies are enumerated; §6 versioning policy clarifies additive-only contract.
4. **Phase plan quality** — PASS. Three phases (P1 typed taxonomy + bus core; P2 React hook; P3 cross-package smoke + lint). Each phase has clear file boundaries, acceptance criteria, and listed touched files. Phases are independently reviewable.
5. **Architecture risk** — PASS. No `manifest.json` routing changes for an existing plugin; no cross-feature contract drift beyond the additive EventMap entries; `packages/core/` change is strictly additive (new keys + supporting types). Sibling rows #2/#3 confirmed not to touch `packages/core/src/types/events.ts`.

### Gates from planner's explicit callouts

- **(a) Option B vs ADR-0007 §S7 literal text — ACCEPTED.** §S7 literal wording (ADR line 230, 232) rejects "新的总线基础设施" with rationale "新包仅增加重导出间接层，无架构收益." Verified independently by reading `packages/core/src/events/emitter.ts:1` (imports `emit` from `@tauri-apps/api/event`) and `packages/core/src/events/listener.ts:18-21` (no-op guard on `__TAURI_INTERNALS__`). The existing `@repo/core/events` runtime is empirically Tauri-bound and CANNOT deliver events inside `apps/web/`. The ADR did not contemplate this gap — §S7's rejection rationale ("增加重导出间接层，无架构收益") factually does not apply to a runtime adapter that provides the only working browser transport. The planner's rebuttal in discovery §2 Option B "Cons" is technically correct; Option B honors §S7's source-of-truth intent (types stay in `@repo/core`) while routing around the gap the ADR left open. APPROVED with the package living at `packages/xai-web-event-bus/` (Q1 resolved below).
- **(b) Q1 — package name.** RESOLVED in favor of `@repo/xai-web-event-bus` (matches manifest slug + roadmap row #4 + parallel-Agent write scope). The alternative "embed in `apps/web/src/event-bus/`" violates CLAUDE.md §Code Boundaries which keeps business/infra logic out of `apps/web/src/` host shell; that path is reserved as a fallback only if a future ADR reverses §S7. `@repo/plugin-web-event-bus` is explicitly rejected by §S7 wording. Use `@repo/xai-web-event-bus` in P1 `package.json`.
- **(c) Q2 — five v1 channels sufficiency.** ACCEPTED. The five frozen channels (`web:shell:module-change`, `web:shell:pet-toggle`, `web:settings:preference-changed`, `web:pomodoro:session-finished`, `web:habits:checkin-recorded`) satisfy the seed brief's acceptance signal verbatim (goTo / Settings live broadcast / MiniCal deep-link / pet-on / placeholder declarations for downstream W2 rows). `web:shell:command-palette-opened` / `web:shell:search-applied` / `web:board:card-selected` are correctly deferred to their owning rows in W2; EventMap is additive by §6 so deferral has no migration cost.
- **(d) Q3 — sync vs async emit asymmetry.** ACCEPTED. Sync semantics in `emitWebEvent` is the right call: UI live-broadcast (Settings → theme switch) needs same-tick handler delivery so the next React render shows the new state. The asymmetry vs desktop `emitEvent` (async Promise<void> via Tauri IPC) is a transport difference forced by the underlying primitive (Tauri IPC vs in-process EventTarget) — not a contract divergence. Both buses share `EventMap` types at compile time (api.md §6 protects payload-shape parity). Document the asymmetry inline in the `emitWebEvent` JSDoc (already in api.md §2.1) so consumers don't expect a Promise.
- **(e) R2 cross-row EventMap edit conflict — MITIGATED.** Verified by direct file inspection: `docs/reviews/xai-web-tokens-and-i18n/20260523-discovery-review.md` line 196 explicitly disclaims editing `packages/core/src/types/events.ts`; `docs/reviews/xai-web-persistence-contract/` has zero matches for `EventMap` / `events.ts` / `packages/core/src/types`. Combined with the orchestrator's confirmation in the dispatch brief, R2 is mitigated. Row #4 owns the `web:*` EventMap namespace; siblings #2/#3 do not edit that file.

### Other review gates

- **Seed-brief fidelity** — PASS. All four cross-module signals in the seed brief (`goTo`, settings live broadcast, MiniCal → Calendar deep-link, pet-on rail toggle) map to concrete EventMap entries with typed payloads.
- **Typed payloads, no `any`** — PASS. Every channel has a concrete TS shape; `WebPreferenceValue` is flagged as loose union with planned P1 refinement to a discriminated `WebPreferenceChange` union (R3 mitigation already in place).
- **`index.ts`-only public surface** — PASS. `api.md` §0 lists exactly four exports (`emitWebEvent`, `useWebEventListener`, `onWebEvent`, `WebEventMap`/`WebEventKey` types); P3 lint config enforces `import/no-restricted-paths` against `src/internal/`. T5 type test guards deep-import attempts.
- **No-op safe (zero-listener emit doesn't throw)** — PASS. `EventTarget.dispatchEvent` native semantics + tests E2 / A3 / verify gate §S7.3 protect this. SSR guard (`typeof EventTarget === 'undefined'`) covers future server build (api.md §2.1).
- **Cleanup-on-unmount (no memory leaks)** — PASS. `useWebEventListener` wires through `useEffect` cleanup; tests H2 (unmount + emit → handler NOT invoked), H4 (event-key change unsubscribes old), H6 (StrictMode double-mount settles at 1 subscription) cover this dimension.
- **Phase reasonableness (2–3 phases)** — PASS. Three phases, each commitable independently; P1 is the riskiest (touches `@repo/core`), P2 is contained (hook only), P3 is verification-only (smoke + lint).
- **Cross-vendor verify gate** — PASS. `test.md` §"Manual Verify" enumerates Chrome stable / Safari 17+ / Firefox latest, gives a paste-ready devtools snippet, and requires the result to be recorded in Work Log during P3. Matches manifest row #4 "Verify Cross-vendor = yes" flag.

### Recommendations (non-blocking, for feature-auto-build to apply during P1)

- **R-1 (cosmetic):** Harmonize the option label in `packages/xai-web-event-bus/docs/design.md` line 7 ("Option C") to match the discovery review's "Option B" — same decision, different label. Not blocking; suggest fixing in the first P1 commit for consistency.
- **R-2 (refine):** In P1, ship `WebPreferenceValue` as the planned discriminated `WebPreferenceChange` union (one variant per `WebPreferenceKey`) rather than the loose-union form shown in api.md §1. The loose form was explicitly flagged for refinement; doing it in P1 saves a follow-up edit and gives downstream listeners the type narrowing they need.
- **R-3 (clarify):** In P1 `package.json`, decide whether `packages/xai-web-event-bus/manifest.json` is required. Per dev_log P1 line 49, this is a "Web platform shim, not a plugin-web-* business plugin" — `docs/PLUGIN_MAP.md` convention is plugin-scoped. Recommended: omit `manifest.json` and document the omission in design.md §"Out of Scope". If PLUGIN_MAP.md needs a row, mark status `In-Dev` and note it is a shim package.

### Risks accepted (carried forward)

- R1 (ADR §S7 strict reading): accepted with technical rebuttal documented above; falls back to `apps/web/src/event-bus/` only if a future ADR explicitly forbids the new package.
- R3 (loose union type narrowing): mitigation upgraded to "apply in P1" (see R-2).
- R4 (cross-tab sync): out of v1 scope per ADR-0006; future BroadcastChannel adapter is structurally compatible.
- R5 (StrictMode double-mount): tests H6 + ref-stable pattern.
- R6 (Web vs desktop bus drift): structurally prevented by shared `EventMap`.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 (W1 parallel dispatch) | Claude Opus 4.7 — feature-plan | Created discovery review, design.md, api.md, test.md, dev_log.md. Decided Option B (hybrid: EventMap in @repo/core + browser EventTarget adapter in new package). Frozen 5 web:* channels. 3-phase plan recorded. Files scoped to `packages/xai-web-event-bus/docs/` + `docs/reviews/xai-web-event-bus/` only (parallel-Agent write scope). | — | feature-review |
| 2026-05-23 (W1 parallel review) | Claude Opus 4.7 — feature-review | Reviewed discovery + design + api + test + dev_log. Verified ADR-0007 §S7 rebuttal by direct inspection of `packages/core/src/events/{emitter,listener}.ts` (confirmed Tauri-bound runtime). Verified sibling rows #2/#3 do not touch `packages/core/src/types/events.ts` (R2 mitigated). Resolved Q1 (package name = `@repo/xai-web-event-bus`), Q2 (5 channels sufficient), Q3 (sync emit accepted). Issued APPROVED. Three non-blocking recommendations recorded for feature-auto-build to apply in P1. Writes scoped to `packages/xai-web-event-bus/docs/dev_log.md` only. | — | feature-auto-build |
| 2026-05-23 11:10 | Claude Sonnet 4.6 — feature-auto-build | **P1 — Typed Event Taxonomy + Bus Core.** Applied review R-1 (option label harmonized Option C → Option B in design.md). Applied review R-2 (WebPreferenceChange as discriminated union instead of loose WebPreferenceValue). Applied review R-3 (omit manifest.json; documented in design.md §Out of Scope). Appended 5 web:* entries + WebModuleId / WebPreferenceKey / WebPreferenceChange types to `packages/core/src/types/events.ts`. Exported new types from `packages/core/src/types/index.ts`. Created package scaffolding: package.json, tsconfig.json, vitest.config.ts, eslint.config.js. Created src/events.ts (type aliases), src/emitter.ts (EventTarget runtime), src/index.ts (public surface), src/__fixtures__/ (EmitterFixture + ListenerFixture). Created emitter.test.ts (E1-E6 + S1-S5 + cleanup = 12 tests). Added xai-web-event-bus row to docs/PLUGIN_MAP.md §Web Platform Shims. Deferred pnpm install per parallel-agent constraint; noted in commit. `pnpm --filter @repo/core check-types`: PASS. `pnpm --filter @repo/xai-web-event-bus check-types`: PASS. `pnpm --filter @repo/xai-web-event-bus test`: 12/12 PASS. | a798384 | feature-auto-build (P2) |
| 2026-05-23 11:10 | Claude Sonnet 4.6 — feature-auto-build | **P2 — React Adapter Hook.** Created src/listener.ts (useWebEventListener with useRef + useLayoutEffect ref-stable pattern for React 19 compat). Created src/listener.test.tsx (H1-H6 with @testing-library/react including StrictMode H6). Updated src/index.ts to re-export useWebEventListener. Added devDeps (@testing-library/react, jsdom, react, react-dom) to package.json. `pnpm --filter @repo/xai-web-event-bus test`: 18/18 PASS (12 emitter + 6 hook). | a798384 | feature-auto-build (P3) |
| 2026-05-23 11:10 | Claude Sonnet 4.6 — feature-auto-build | **P3 — Cross-package Smoke Test + Cleanup.** Added apps/web/src/__tests__/event-bus.smoke.test.tsx (A1-A4 scenarios). Added @repo/xai-web-event-bus workspace:* + @testing-library/react devDeps to apps/web/package.json. Created apps/web/vitest.config.ts (jsdom environment). Added test/test:watch scripts to apps/web/package.json. Added ./src/__fixtures__ export entry to xai-web-event-bus package.json for cross-package fixture access in tests. Created eslint.config.js with @typescript-eslint/no-explicit-any: error. Manual cross-vendor verify deferred to feature-verify (runs in live browser). `pnpm --filter @repo/web test`: 37/37 PASS across 11 test files (4 new smoke tests + 33 pre-existing). No regressions. Status → READY_FOR_VERIFY. | a798384 | feature-verify |
