# dev_log.md — xai-admin-dashboard-shell

> Workflow state machine + breakpoint continuity. Top panel = overwrite; Work Log = append-only.

## Status Panel

| Field | Value |
|---|---|
| **Workflow** | FEATURE_DEV |
| **Target** | xai-admin-dashboard-shell |
| **Title** | Admin Dashboard Shell (isolated admin surface + permission boundary) |
| **Current Phase** | FEATURE_REVIEW |
| **Status** | APPROVED |
| **Executor** | claude-opus-4-8 (feature-review) |
| **Updated** | 2026-06-06 |
| **Suggested Next** | feature-build |
| **Blockers** | — |
| **Module** | `admin` (#6) · operator-activated whole line 2026-06-06 · slice #1 of 6 |
| **Branch** | `codex/admin/<feature>` |
| **D3** | W0 (web-only) — no `dev` promotion |

## Phase Plan (for feature-build — ONE phase per run)

> `feature-build` runs exactly one phase per invocation, then stops for human confirmation.
> Phases are ordered to prove the boundary first (shell + guard), then read-only pages, then guard tests.

| Phase | Goal | Key deliverables | Acceptance gate | Est. commits |
|---|---|---|---|---|
| **P1 — Scaffold isolated app + deploy boundary** | Stand up `apps/admin/` as an isolated Vite app with its own deploy/CSP target | `package.json` (`@repo/admin`), `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `index.html`, `wrangler.toml` (separate Pages project), `public/_headers` (tight CSP), env scaffolding; ADR-0008 cross-ref note for the admin `_headers` | TT-CSP-GUARD green; TT-BUILD green; `apps/web` build unaffected | 1–2 |
| **P2 — Admin auth gate (the core boundary)** | Admin-claim predicate + route gate composing the read-only session | `src/auth/adminClaim.ts` (interface + mock impl, fails closed), `src/auth/AdminRouteGate.tsx` + `resolveAdminRouteGuard`, `src/App.tsx` wiring | TT-PREDICATE-* + TT-GUARD-* green (AC-1 negative+positive) | 1–2 |
| **P3 — Typed read-model interfaces + mock adapters + fixtures** | Define the 10 typed read-model interfaces; port prototype fixtures into typed adapters | `src/adapters/types.ts`, `src/adapters/*` (10 mock adapters), `src/adapters/commands.ts` (no-op), `src/fixtures/*` | TT-ADAPTER-* + TT-CMD-NOOP + TT-PROVIDERS-NO-KEY green | 2–3 |
| **P4 — Page port (structural) + destructive UI** | Structural port of the 10 pages reading only through adapters; preserve type-to-confirm UI wired to no-op commands | `src/pages/*` (10), `ConfirmModal` reuse/port, navigation/layout (OKLCH tokens + @repo/ui) | TT-NO-INLINE-MOCK + TT-CONFIRM-RENDERS green; all 10 render behind guard | 2–4 |
| **P5 — Security + build guards** | Lock the no-secret + build invariants | `src/__tests__/no-secret.test.ts` (src + dist), final TT-CSP-GUARD, build green | TT-NO-SECRET-SRC + TT-NO-SECRET-BUNDLE + TT-BUILD green (AC-3, AC-5) | 1 |

> Phase order rationale: P1→P2 establishes the **boundary that is the whole point of slice #1** before
> any page content; P3 (contracts) precedes P4 (UI) per the roadmap "contracts before UI data" gate;
> P5 hardens the security invariants last over the full surface.

## Risks (carry into review)

- **R1 (HIGH)** admin code/secret leaking into `apps/web` bundle → mitigated by physical isolation (separate Vite app + Pages project + origin) + TT-NO-SECRET-BUNDLE.
- **R2 (HIGH)** guard failing open → mitigated by fail-closed predicate + mandatory TT-GUARD-DENY / TT-PREDICATE-NULL negatives.
- **R3 (MED)** mock claim diverging from row-#2 real claim → mitigated by predicate-as-interface; row #2 swaps implementation only.
- **R4 (MED)** Tailwind/Tremor dependency forking the repo design system → rejected for slice #1 (Option A: OKLCH tokens + @repo/ui).
- **R5 (LOW)** TanStack Table v8 staleness → headless-only, pinned, hand-built fallback; decision deferrable to review.

## Open questions for feature-review

- OQ1: headless `@tanstack/react-table` v8 vs fully hand-built tables (recommend allow; not a blocker).
- OQ2: dedicated subdomain naming + custom-domain/DNS (defer to row #6; ship at `*.pages.dev`).
- OQ3: real admin-claim source (row #2; mock only this slice).
- OQ4: server secret backend shape (row #2/#4; assert browser absence only this slice).
- OQ5: real Supabase auth vs `mock-authenticated` posture for admin surface (recommend `mock-authenticated` parity with ADR-0008 D2).

## Review Notes (feature-review · 2026-06-06 · APPROVED)

Verdict: **APPROVED** — 0 blockers, 3 non-blocking recommendations. The plan is executable
with no blocking ambiguity. All 8 review gates pass; all 6 brief Acceptance Criteria are
covered and mapped to named binary tests; scope, security, and boundary discipline are tight.

Gate results:
1. **Requirement fidelity — PASS.** AC-1..AC-6 each map to a named binary test in test.md §1 and
   to a phase gate in the Phase Plan (AC-1→P2, AC-2→P4, AC-3/AC-5→P5, AC-4→P3/P4, AC-6→P2/P3).
   No AC dropped or weakened. 10-page count consistent across brief, discovery §8.5, design
   (assumptions #5/#8), api.md §4 (10 typed read-model interfaces), test.md (10 TT-ADAPTER-*).
2. **Scope discipline — PASS.** Slice stays "shell + permission boundary": commands are no-op
   `NoOpResult` (api.md §5, TT-CMD-NOOP); no real RBAC/audit/billing/provider — all deferred to
   rows #2–#6 (test.md §6, design assumption #8); type-to-confirm UI preserved but wired to
   no-op (TT-CONFIRM-RENDERS); Tweaks panel explicitly excluded. No bleed of rows #2–#6 scope;
   manifest dependency order preserved.
3. **Security boundary — PASS.** Predicate fails closed (mandatory negatives TT-PREDICATE-NULL +
   TT-PREDICATE-NON-ADMIN); guard fails closed (TT-GUARD-DENY core negative + TT-GUARD-ALLOW
   positive); no-secret over BOTH src and built bundle (TT-NO-SECRET-SRC + TT-NO-SECRET-BUNDLE
   over dist/); providers expose key STATUS only (TT-PROVIDERS-NO-KEY). Service-role/provider
   secret material provably kept out of the browser bundle.
4. **Boundary / three-faces — PASS.** Verified against source: `@repo/web-auth-device-session`
   `index.ts` exports `useWebAuthSession` + `resolveAppRouteGuard`/`AppRouteGate` + `GuardResolution`;
   `WebAuthSessionContextValue` exposes `state` (exact 4-state union) + `session: Session | null`
   with NO admin claim modeled — confirming the read-only consume + mock-claim premise. The
   admin `AdminGuardResolution` cleanly extends `GuardResolution` (adds `"not_admin"`). No upstream
   change to the session package → D3 = W0; no new `@repo/core/src/events`; no Tauri changes; no
   logic in core/web.
5. **Mock strategy — PASS.** Typed Contract Mock: one typed read-model interface per page (api.md §4)
   with mock adapters swappable for contract-backed services without UI change; no inline mock
   globals (TT-NO-INLINE-MOCK source-text guard).
6. **ADR-lite quality — PASS.** Both decisions recorded with rationale in design.md §ADR-lite.
   Deploy decision (Option A: separate Vite app + own Cloudflare Pages project + own `public/_headers`)
   is a clean **extension** of ADR-0008's Pages+`_headers` mechanism (tighter `connect-src 'self'`,
   no provider/OAuth/Stripe/OSM origins), explicitly NOT an amendment to `apps/web`'s `_headers`;
   ADR-0008 §S3 binding-precedent extension protocol correctly inherited for future admin `_headers`
   edits. UI decision (Option A: reuse `@repo/plugin-web-tokens` + `@repo/ui`; reject Tailwind/
   Tremor-as-dependency) is sound; both target packages verified to exist.
7. **Phasing — PASS.** 5 phases, dependency-correct (P1 scaffold+deploy → P2 guard → P3 contracts →
   P4 page port → P5 security hardening); contracts before UI data per roadmap gate; guard/shell
   before page ports. Each phase has its own acceptance gate; feature-build can do ONE phase per run.
8. **Doc-contract completeness — PASS.** design/api/test/dev_log are internally consistent;
   dev_log maintains Workflow/Executor/Updated/Suggested Next/Work Log.

Non-blocking recommendations (carry into feature-build, do NOT require a revise pass):
- **REC-1 (doc-accuracy nit).** test.md TT-NO-SECRET-SRC and ADR-0008 cite the precedent as
  "`apps/web` `no-stripe-secret-key.test.ts`", but the real precedent lives at
  `packages/plugin-web-settings-rest/src/__tests__/no-stripe-secret-key.test.ts` (+
  `no-stripe-js-bundle.test.ts`). The precedent is real and clone-able; just fix the path
  locator when the build agent clones it.
- **REC-2 (resolve at build, not a blocker).** OQ1 (headless `@tanstack/react-table` v8 vs
  hand-built tables): APPROVED to allow headless v8 (pinned), with the hand-built fallback as
  recorded. Adding the dep is acceptable since headless = no visual/secret surface; the build
  agent may pick either and should record the choice in design.md if v8 is added (keep it out of
  P1 scaffold deps unless P4 needs it).
- **REC-3 (auth posture).** OQ5: confirm `mock-authenticated` parity with ADR-0008 D2 for slice #1
  (no admin secrets in build). If real Supabase device-session auth is later wired, the Supabase
  host is the only candidate `connect-src` addition and MUST follow the ADR-0008 extension protocol
  (amend record → extend `_headers` → update snippet → write csp guard test). Keep slice #1 mock.

## Work Log (append-only)

### Round 2 — 2026-06-06 · feature-review (APPROVED)
- **Executor**: claude-opus-4-8 (feature-review)
- **Action**: Reviewed discovery report + design/api/test/dev_log against the feature brief,
  INTEGRATION_PLAN §3/§4, roadmap manifest (row #1), ADR-0008, ADR-0013 (W0), and PLUGIN_MAP
  dependency states. Cross-checked plan claims against real source: verified
  `@repo/web-auth-device-session` public surface (`useWebAuthSession`, `resolveAppRouteGuard`/
  `AppRouteGate`/`GuardResolution`, `session: Session | null`, no admin claim), the
  `apps/web/src/__tests__/csp.test.ts` CSP-guard precedent, the no-stripe-secret-key source-text
  guard precedent (located in plugin-web-settings-rest), and the existence of `@repo/plugin-web-tokens`
  + `packages/ui`. Applied all 8 review gates.
- **Verdict**: APPROVED — 0 blockers, 3 non-blocking recommendations (REC-1 path-locator nit,
  REC-2 headless TanStack allow, REC-3 keep mock-auth posture). All 6 ACs covered + test-mapped;
  scope/security/boundary discipline tight; ADR-lite decisions are clean ADR-0008-consistent
  extensions; phasing is dependency-correct and one-phase-per-run executable.
- **Commits**: — (review only; no code; worktree `claude/frosty-nash-c4bf16`)
- **Tests**: — (none run; review phase)
- **Next step**: feature-build — implement Phase 1 (scaffold isolated `apps/admin/` app + deploy
  boundary); or feature-auto-build / feature-dev-loop for batch execution.

### Round 1 — 2026-06-06 · feature-plan (Fresh)
- **Executor**: claude-opus-4-8
- **Goal**: Plan slice #1 (`xai-admin-dashboard-shell`) from the READY_FOR_FEATURE_PLAN brief; resolve the two ADR-lite topics; initialize the doc four-piece set for the new `apps/admin/` surface.
- **Done**:
  - Read brief + INTEGRATION_PLAN + prototype README + index.html (10 `data-view` pages + inline fixtures confirmed) + roadmap manifest (row #1) + ADR-0008 (deploy/CSP precedent) + PRODUCT_MODULE_MAP §6 + SOP_NEW_FEATURE.
  - Verified the only shared seam: `@repo/web-auth-device-session` public surface (`useWebAuthSession` → `{state, session}`, NO admin claim) → confirms mock-claim approach; D3 = W0.
  - Web research (queries 2026-06): TanStack Table v8 (React-19 compat, headless, v8 stale-but-stable), Tremor (Vercel-acquired, copy-paste pivot → legacy dep), shadcn/ui (React 19 + Vite + Tailwind v4, copy-paste). → recommended reuse OKLCH tokens + @repo/ui (Option A), reject Tailwind/Tremor-as-dependency for slice #1.
  - Resolved ADR-lite #1 (deploy isolation = separate Vite app + own Cloudflare Pages project + own `_headers` CSP + subdomain; clean ADR-0008 extension) and #2 (UI stack = reuse OKLCH/@repo/ui + structural prototype port; headless TanStack Table allowed/deferrable).
  - Chose doc landing `apps/admin/docs/` (new app surface, not a `packages/plugin-*` slice; plugin-docs path N/A).
  - Wrote: discovery review + design.md (decision snapshot + ADR-lite records + frozen assumptions + directory shape) + api.md (claim/guard/read-model/command contracts + security semantics) + test.md (AC→test mapping + guard coverage) + this dev_log.
- **Commits**: — (planning artifacts only; no code branch; operating in worktree `claude/frosty-nash-c4bf16`)
- **Tests**: — (none run; planning phase)
- **Risks**: see Risks section (R1/R2 HIGH).
- **Handoff / Next step**: feature-review — review discovery report + design/api/test/dev_log; verify the two ADR-lite resolutions, the W0 boundary, the fail-closed guard contract, and the AC→test mapping; give APPROVED or REVISE.
