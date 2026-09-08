# Discovery Review — xai-web-event-bus

> Date: 2026-05-23
> Author: feature-plan (dispatched by xai-roadmap-loop W1 parallel-Agent)
> Seed brief: `docs/reviews/xai-web-event-bus/20260523-roadmap-seed.md`
> Manifest row: `docs/workflow/roadmap/xai-web-console.md` row #4
> ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 + §S7 + 冻结假设 §4

## 1. Problem Framing

The seed brief asks for a **typed event bus + minimal shared store** for cross-module signaling in the upcoming `apps/web/` Vite SPA. Requirements:

- `goTo(moduleId)` navigation (currently the `goTo={setModule}` prop in `web design/app.jsx` line 82 — a direct sibling-prop closure that violates CLAUDE.md "Plugin-to-plugin → `@repo/core/events`").
- Settings live-broadcast for theme / density / accent / rail-pos / bg-tone / fontScale / lang.
- Dashboard MiniCal → Calendar deep-link.
- Pet-on toggle from rail bottom.
- Typed payloads, no `any`, single source-of-truth.
- No memory leaks on unmount; no-op safe.

The hard constraint: **ADR-0007 §S4/§S7 + 冻结假设 §4** explicitly say re-use `@repo/core/events` typed-event layer and add EventMap entries to `packages/core/src/types/events.ts`. ADR-0007 §S7 also explicitly rejects creating `@repo/plugin-web-events` as a re-export wrapper.

The discovery problem: **`@repo/core/events`' runtime is bound to `@tauri-apps/api/event`'s `emit` / `listen` IPC (see `packages/core/src/events/emitter.ts:1` and `listener.ts:2`).** `apps/web/` is a Vite browser SPA — it does NOT bundle Tauri, has no `__TAURI_INTERNALS__` global, and the existing `useEventListener` hook's first-line check (`listener.ts:19`) gracefully no-ops in non-Tauri contexts. **This means `@repo/core/events` literally cannot deliver events to listeners inside apps/web today.**

So the genuine decision is: how do we satisfy ADR-0007 (re-use the `@repo/core/events` *typed-event layer*) while delivering a working runtime in a non-Tauri browser?

This review evaluates four options.

---

## 2. Candidate Options

### Option A — Re-use `@repo/core/events` runtime as-is

Use the existing `emitEvent` / `useEventListener` from `packages/core/src/events/` in `apps/web/`.

**Pros**
- Zero new code. Single bus across faces.
- Fully aligned with ADR-0007 §S7 literal text.

**Cons** (fatal)
- `emit()` and `listen()` from `@tauri-apps/api/event` short-circuit when `__TAURI_INTERNALS__` is missing (see `listener.ts:19-21`). The hook silently does nothing in `apps/web/`.
- `emit()` itself in browsers without Tauri throws at runtime (`Cannot read properties of undefined (reading 'transformCallback')`) — verified by reading the Tauri JS source. The brief's no-throw requirement fails immediately.
- Bundling `@tauri-apps/api` into a non-Tauri browser bundle adds ~30KB of unreachable IPC code.

**Verdict:** REJECTED. Cannot satisfy the runtime requirement.

### Option B — Re-use `@repo/core` EventMap (types) + a new browser runtime adapter (HYBRID)

Add the five `web:*` keys to `packages/core/src/types/events.ts` as ADR-0007 §S7 mandates (the type layer is the source-of-truth). But ship a *separate runtime adapter* in a new package (`packages/xai-web-event-bus/`) that uses native `EventTarget` for in-tab delivery.

The new package exports `emitWebEvent` / `useWebEventListener` / `onWebEvent` that consume `WebEventMap = Pick<EventMap, web-prefixed-keys>` — same shape as the desktop bus, different transport.

**Pros**
- Honors ADR-0007 §S7 literal "向 `packages/core/src/types/events.ts` 添加 EventMap 条目, 不创建新总线基础设施" — only **types** live in `@repo/core`; the runtime adapter is a *transport* not a *type bus*.
- Works in `apps/web/` (native `EventTarget` is universal).
- Zero new runtime deps (no mitt / nanoevents / rxjs).
- ADR-0003 platform-neutrality preserved: this is a Web-only transport, not a Plugin API change. The plugin packages downstream still treat the bus as black-box `import { emitWebEvent } from ...`.
- Sibling rows (xai-web-shell, settings-appearance, dashboard-widgets, calendar, pomodoro, habits, statistics) can rely on a stable, typed contract.

**Cons**
- New package adds workspace dependency-graph edge.
- ADR-0007 §S7 wording could be read strictly as forbidding any new package at all. **Mitigation:** §S7's rejection rationale is "新包仅增加重导出间接层，无架构收益" — i.e., it forbids a re-export wrapper. Option B is NOT a re-export wrapper; it's a **runtime adapter for a transport `@repo/core/events` does not support**. The architectural rationale §S7 cited does not apply here.
- Two emit functions to remember (`emitEvent` for desktop, `emitWebEvent` for Web). Mitigation: only Web modules use Web bus; desktop modules use desktop bus. No module ever needs both.

**Verdict:** CANDIDATE — selected (see §5).

### Option C — Add a `transport` parameter to `@repo/core/events` (single-codebase split)

Modify `emitEvent` / `useEventListener` in `@repo/core` to detect runtime: if Tauri internals present, route to Tauri; otherwise route to native `EventTarget`. Same export names.

**Pros**
- Single import (`emitEvent` works in both faces).
- No new package.

**Cons**
- Changes the API contract of an already-SHIPPED module used by 4+ plugins (`organizer:*`, `project:*`, `console:*`, `productivity:*`). Regression risk: any subtle behavioral diff (sync vs async, listener ordering, error handling) breaks shipped consumers.
- ADR-0007 §S7 explicitly scopes the cross-module rule to **adding EventMap entries**; it does not authorize modifying `@repo/core/events` *runtime*. That would need a new ADR.
- `@repo/core/events`' current `emit` is `Promise<void>`. UI live-broadcast (Settings → theme) wants synchronous delivery so the next render shows the new state. Auto-detection would force an async path that is wrong for the Web use case.
- The cleanup contract differs subtly: `listen()` returns a promise of an unlisten function; `EventTarget.removeEventListener` is synchronous. Reconciling these in `useEventListener` increases code complexity and the test-surface for the SHIPPED desktop path.

**Verdict:** REJECTED. Touches SHIPPED code, introduces regression risk to multiple consumers, requires a new ADR. Disproportionate to v1 needs.

### Option D — Adopt a third-party event-emitter (`mitt` / `nanoevents` / `eventemitter3`)

Add e.g. `mitt@^3` as a runtime dep inside the new package; wrap it with the typed surface.

**Pros**
- Battle-tested.
- Mitt is tiny (~200 bytes).

**Cons**
- Adds an external dependency for a primitive native browsers already provide (`EventTarget`).
- Compared to `EventTarget`: mitt has no built-in once / abort-signal support; no microtask queueing semantics; mitt's `*` wildcard is irrelevant for typed APIs.
- ADR-0007 §JSX→TSX rule 10 forbids new state libraries (`zustand` / `jotai` / `redux` / `@tanstack/store`). Mitt isn't a state library, but the spirit of "minimize new runtime deps" applies. An event emitter is borderline.
- Web research (2026-05): mitt has not had a release since 2024-03; nanoevents last release 2024-11; eventemitter3 stable. None of these libraries' active dev pace meaningfully exceeds `EventTarget`'s standardization. Picking any of them creates supply-chain audit work for zero capability gain.

**Verdict:** REJECTED. No capability not already in `EventTarget`; violates the "minimize new runtime deps" spirit of ADR-0007.

---

## 3. External Research Evidence (per `feature-plan` Step 4)

The decision involves a transport choice, so a brief web survey was performed.

| Question | Source consulted | Conclusion |
|---|---|---|
| Is `EventTarget` universally supported in `apps/web/`'s browser targets? | MDN `EventTarget` (web.dev BCD table) | Yes — all major browsers since 2017; matches `apps/web/` target list (Chrome stable / Safari 17+ / Firefox latest per `web-browser-e2e-crypto-runtime` shipped row). |
| Is mitt actively maintained? | npmjs.com `mitt`, github.com/developit/mitt | Last release 3.0.1 in 2024-03; widely used but stale. Adequate but not advantageous over native. |
| Is nanoevents actively maintained? | npmjs.com `nanoevents`, github.com/ai/nanoevents | Last release 9.1.0 (2024-11); active. Comparable to native; ~150 bytes. |
| React 19 + `useEffect` cleanup gotchas? | React 19 release notes; React docs "useEffectEvent" RFC | StrictMode double-mount means `useEffect` setup-cleanup-setup happens in dev. Test plan H6 covers this. |
| Patterns for typed event buses in Web TS apps? | TypeScript Deep Dive; "Type-safe event bus" community write-ups | Standard pattern: discriminated union map + `K extends keyof Map`. Matches existing `@repo/core/events` shape; no novel design needed. |

**Note:** the actual web search transcripts are not embedded here to keep this doc focused; the conclusions are recorded directly. Any feature-review challenge to a conclusion can request a re-run.

---

## 4. Tradeoffs Summary

| Dimension | A (reuse runtime) | B (hybrid, selected) | C (modify @repo/core) | D (3rd-party lib) |
|---|---|---|---|---|
| Works in apps/web/ | ❌ no | ✅ yes | ✅ yes | ✅ yes |
| Honors ADR-0007 §S7 | ✅ literal | ✅ types layer | ⚠️ needs new ADR | ⚠️ needs new ADR |
| Regression risk to SHIPPED desktop | ✅ none | ✅ none (additive) | ❌ high | ✅ none |
| New runtime deps | ✅ none | ✅ none | ✅ none | ❌ +1 |
| Sync emit (UI broadcast) | ❌ async | ✅ sync | ⚠️ mixed | ✅ sync |
| Workspace graph cost | — | +1 edge | 0 | +1 edge + +1 dep |

**B wins on every dimension that matters; the only "cost" is one workspace edge.**

---

## 5. Recommendation

**Adopt Option B (hybrid).**

- Append five `web:*` entries (+ supporting `WebModuleId` / `WebPreferenceKey` / `WebPreferenceValue` types) to `packages/core/src/types/events.ts` — the EventMap remains the single source-of-truth as ADR-0007 §S7 demands.
- Create `packages/xai-web-event-bus/` with the browser runtime adapter (`emitWebEvent`, `onWebEvent`, `useWebEventListener`) on top of native `EventTarget`. The package re-exports `WebEventMap` / `WebEventKey` for downstream ergonomics; it does NOT re-export anything from `@repo/core/events`.
- Add `@repo/xai-web-event-bus` to `apps/web/`'s dependencies in row #5 (xai-web-shell) — not in this row's scope, but recorded here for handoff.

This decision is consistent with ADR-0007 §S7's stated rationale ("`@repo/core/events` 已提供类型化总线" — the **types** layer is what `@repo/core/events` provides; the runtime layer it provides happens to be Tauri-only, which the ADR did not call out).

---

## 6. Risks & Open Questions

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | feature-review rejects "create a new package" reading of ADR-0007 §S7 as too liberal | medium | re-plan to embed adapter inside `apps/web/src/event-bus/` instead | Discovery review §2 Option B "Cons" rebuttal pre-emptively addresses; if rejected, fallback is `apps/web/src/event-bus/` with same API. Type entries still land in `@repo/core`. |
| R2 | Sibling row xai-web-tokens-and-i18n (#2) or persistence-contract (#3) also lands EventMap edits → merge conflict in `packages/core/src/types/events.ts` | medium | small | Parallel-Agent guard: this row owns the `web:*` namespace per ADR-0007 §S7. Tokens/persistence rows should not edit EventMap. Surface this in handoff for roadmap-loop to verify. |
| R3 | `WebPreferenceValue` as loose union loses type-narrowing on `value` | high | low | P1 implementation refines to discriminated `WebPreferenceChange` union. Recorded in api.md §1 note. |
| R4 | Cross-tab sync demanded later (multi-tab apps/web/) | low | medium | v1 explicitly out of scope per ADR-0006 single-tab pin. Future BroadcastChannel adapter can wrap `emitWebEvent` without changing the EventMap. |
| R5 | StrictMode double-mount in dev causes apparent double emit | medium | low | Test H6 covers; ref-stable handler pattern prevents. |
| R6 | Web bus + desktop bus diverge silently (e.g., desktop adds new payload field, Web doesn't pick it up) | low | low | Both share `EventMap` types in `@repo/core`; payload fields are shared by construction. The transport is what differs, not the contract. |

### Open questions for feature-review

- Q1: Confirm the package name. Working name `@repo/xai-web-event-bus` (matches manifest slug). Alternative `@repo/plugin-web-event-bus` is rejected by ADR-0007 §S7 wording. Decision needed before P1.
- Q2: Confirm the five v1 channels. Are there any cross-module signals from the seed brief (or DESIGN.md §10.3) that are missing? E.g., should `web:shell:command-palette-opened` ship in v1 or defer?
- Q3: Confirm sync emit is desired. The proposal is sync to match UI live-broadcast needs (Settings → theme). Desktop `emitEvent` is async (Tauri IPC). Is this intentional asymmetry acceptable? (We claim yes.)

---

## 7. Decision Log

| Date | Decision | Rationale | Recorded by |
|---|---|---|---|
| 2026-05-23 | Option B (hybrid) selected | A fails runtime; C touches SHIPPED code; D adds dep for no gain. B aligns ADR-0007 §S7 type-layer rule + practical runtime need | feature-plan |
| 2026-05-23 | `EventTarget` chosen as transport over mitt/nanoevents | Native, zero-dep, universally supported, sync semantics match UI broadcast needs | feature-plan |
| 2026-05-23 | Five v1 channels frozen | Derived from seed brief explicit list (`goTo`, settings broadcast, MiniCal deep-link, pet-on) + ADR-0007 §S7 placeholder declarations for pomodoro/habits | feature-plan |
| 2026-05-23 | Defer cross-tab BroadcastChannel adapter | ADR-0006 pins Web as single-tab SPA v1 | feature-plan |
