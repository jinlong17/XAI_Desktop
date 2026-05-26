# Discovery Review — xai-web-settings-account-delete-wire (gap-closure row #9)

> **Roadmap row**: `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #9 (W2 LAST)
> **Source brief**: `docs/reviews/xai-web-settings-account-delete-wire/20260524-roadmap-seed.md`
> **Parent ADR**: ADR-0009 §D2-G3 (P0 gap-closure; ≥5/9 known gaps SHIPPED to unblock P1 Desktop launch)
> **Date**: 2026-05-26
> **Executor**: Claude Opus 4.7 (1M context) — feature-plan
> **Dispatched by**: `xai-roadmap-loop` SERIAL — Wave 2 LAST row (after row #8 SHIPPED `00580dd` 2026-05-26)
> **Status**: planning (this doc) → feature-review next

---

## §1. Problem framing

The Account pane (`packages/plugin-web-settings-rest/src/panes/accountPane.tsx`) currently exposes a "Delete Account" button that opens a single-step native `<dialog>` confirm modal (SHIPPED in row #24). On confirm, the modal emits the typed event `web:settings:rest:account-delete-confirmed` **with no listener anywhere in the codebase** — it is a declaration-only no-op.

Gap-closure row #9 wires this no-op into a real deletion flow that:

1. Strengthens the modal into a **2-step gate** (Step 1 "Are you sure?" + Step 2 "Type DELETE to confirm" with case-sensitive exact-match input).
2. Calls a real backend deletion endpoint when running in `live` auth mode.
3. Clears registered `xai_*` localStorage keys + IndexedDB databases ON BACKEND SUCCESS ONLY.
4. Redirects the user to `/` (landing page) after local cleanup.
5. Surfaces a clear error UI on backend failure without clearing any local state.
6. Falls back to local-clear + redirect when running in `mock-authenticated` mode, with an unmissable "Mock-auth delete (no real backend)" banner.
7. Continues to emit the deprecated `web:settings:rest:account-delete-confirmed` event for one release for back-compat.

This is the **smallest of the three Gap-6 sub-rows** (6a / 6b / 6c) per the seed brief and the manifest note. No new package introduced; no new top-level component graph. The work is concentrated in `DeleteAccountConfirmModal.tsx` (rewrite) + `accountPane.tsx` (handler wire-up) + a new `useAccountDeleteOrchestrator` hook + new disclosure/i18n + a small SHIPPED-platform-spine extension for the actual backend call.

---

## §2. Hard-constraint reality check (CRITICAL FINDING)

### §2.1 Seed brief HC1 (use SHIPPED platform spine) — partial reality mismatch

The seed brief HC1 says:

> "Use `web-auth-device-session` SHIPPED platform spine for the actual deletion call. Do NOT introduce a parallel auth path."

**Reality check (verified at planning time)**:

- `packages/web-auth-device-session/src/index.ts` exports `signUpWithEmail`, `signInWithEmail`, `requestPasswordReset`, `completePasswordReset`, `startOAuthLogin`, `handleAuthCallback`, session/device hooks. **There is NO `deleteAccount` / `deleteUser` / `account-delete` / `signOut` export.** A repo-wide grep for `deleteAccount|delete-account` returns zero source matches outside this row's seed brief and the plugin-web-settings-rest docs.
- `packages/web-auth-device-session/docs/design.md` lines 41 ("account export/delete/privacy flows") explicitly lists "account export/delete/privacy flows" under the package's **non-scope** ("This feature does not own"). This was an intentional scope carve-out at v1 — account-delete was deferred to a later row.
- Supabase's `auth.admin.deleteUser` requires the `service_role` key, which **MUST NEVER be in a browser bundle** (per ADR-0008 §S6 + general OWASP guidance + Supabase docs verified via WebSearch 2026-05-26: "Admin auth functions require they be run on a server or edge function and need the service_role key to execute them"). The browser-side client can ONLY call a server endpoint (Supabase Edge Function or a custom Worker route).

**Conclusion (this row's interpretation of HC1)**:

HC1 is satisfied at the **integration-contract level** (the deletion flow is owned by `web-auth-device-session` as the canonical auth/session boundary — we extend that package with the new endpoint client + helper) but NOT by reusing an existing literal exported function. Row #9 therefore introduces:

- **One new function** `deleteAccount(client, options)` inside `packages/web-auth-device-session/src/auth-actions.ts` that wraps `supabase.functions.invoke("account-delete")` plus session sign-out. This is a **scope extension** of the SHIPPED package, not a parallel path. It keeps the `web-auth-device-session` boundary as the only auth API surface — `accountPane.tsx` never touches `supabase` directly.
- The backend Edge Function itself (`account-delete`) is **NOT in scope for this row** — it is documented as a v1 stub-trust requirement in §10 below and operationally deferred to a Worker/Edge Function provisioning row tracked separately. For client-side dev/test we mock `client.functions.invoke()` to return a 200; in real deploys the operator runbook (P5) documents the required Edge Function shape.

This deviation from a literal reading of HC1 is the central planning decision of row #9 and is explicitly surfaced in §8 Open Questions Q1 for `feature-review` confirmation.

### §2.2 Seed brief HC2 (2-step modal + DELETE type-match)

No reality mismatch. The existing `DeleteAccountConfirmModal.tsx` is single-step; we extend it to 2-step in place. Step 2 requires case-sensitive exact-match against the literal string "DELETE" (capital D-E-L-E-T-E). Submit button disabled until match. Cancel button on both steps. Backdrop click cancels.

### §2.3 Seed brief HC3 (local-clear sequencing)

Order (real-auth success path):

1. Call backend delete endpoint → wait for 200.
2. Sign out current session (clears in-memory `WebAuthSessionContext`).
3. Iterate `Object.keys(PREF_REGISTRY)` from `@repo/plugin-web-storage` and call `localStorage.removeItem(key)` for each — **NEVER wildcard-wipe `localStorage`**. The registered key list at row-#9-time is **42 keys** (20 SHIPPED + 22 row-#24 expansions + 3 row-#7 OAuth prefs + 2 row-#8 Premium prefs — verified via `Object.keys(PREF_REGISTRY).length`).
4. Also clear the `device.id` IDB store via `createDeviceIdentityStore().clear()` (or equivalent — see §3.2 for the API extension).
5. Clear durable encrypted IndexedDB databases via `indexedDB.deleteDatabase()` for each known database name. Known DBs at row-#9-time (verified via repo grep): `web-encrypted-cache-<prefix>`, `xai-web-ai-secrets`, `xai-web-auth`. The exact list is enumerated in a new constant `ACCOUNT_LOCAL_WIPE_IDB_NAMES` exported from `web-auth-device-session` (see §3.3).
6. `window.location.assign("/")`.

**Real-auth failure path** stops at step 1 — NO localStorage wipe, NO IndexedDB clear, NO redirect. The modal stays open showing the error.

### §2.4 Seed brief HC4 (failure UX)

Error message bilingual; surfaces network errors (`TypeError: fetch failed` style), 401 (session expired — distinct message), 403 (permission denied — distinct message), 500 (server error). All errors retry-able from the same modal (Step 2 stays mounted; submit re-enabled on retry). Generic catch-all for unknown shapes.

### §2.5 Seed brief HC5 (deprecation strategy)

The existing event `web:settings:rest:account-delete-confirmed` is still emitted on Step 1 → Continue click (NOT on actual deletion) for one release for back-compat. JSDoc on the event entry in `packages/core/src/types/events.ts` is annotated `@deprecated since 2026-05-26 (gap-closure row #9); will be removed in P1 desktop pivot.`

### §2.6 Seed brief HC6 (mock-auth fallback)

When `import.meta.env.VITE_WEB_AUTH_MODE === "mock-authenticated"` (per ADR-0008 § environment-variable contract; verified at `apps/web/src/providers/AppProviders.tsx:66`), skip steps 1-2 of the success flow and proceed directly to local-clear (steps 3-6). Display a banner above the step 2 type-match input: "Mock-auth delete (no real backend) — this will only clear local data."

### §2.7 Seed brief HC7-HC10 (P0 + cross-vendor + append-only + Step 0 brief is input)

Standard wave-2 binding precedent (rows #7 + #8). All preserved.

### §2.8 Session-added HC8/HC9/HC10 (append-only / Step 0 input / no new CSP)

CSP check: the new backend call goes to `${VITE_SUPABASE_URL}/functions/v1/account-delete`. The Supabase URL is already in `connect-src` (covered by the SHIPPED `web-auth-device-session` package's existing usage of `supabase.auth.signInWithPassword` etc.). Verified via repo grep for `VITE_SUPABASE_URL` in CSP context: the URL is read at runtime; `connect-src` does NOT enumerate specific Supabase URLs (host trust is via app config, not `_headers`). **Conclusion: no `_headers` edit, no ADR-0008 amendment, no CSP test case for row #9.**

---

## §3. Candidate options analysis (6 axes A..F)

### §3.A Modal structure (2-step UX)

| Option | Description | Pros | Cons |
|---|---|---|---|
| **A1 ★** | Single `<dialog>` element, internal `step` state (`"step1" \| "step2" \| "submitting" \| "failure"`) | Focus management trivial (dialog opens/closes once); aria-labelledby updates on step transition; matches row #5 native-dialog pattern; minimal DOM churn | Slightly more complex JSX (4 visual states inside 1 root) |
| A2 | Two separate `<dialog>` elements (one per step) | Each step has independent JSX tree | Focus management nightmare on transition (close + open creates flash; aria announcements duplicate); 2x the showModal/close ceremony |
| A3 | Inline (no `<dialog>`) — render in the pane as a panel | Simpler React tree | Loses native focus-trap + ESC-to-cancel + backdrop click semantics; deviates from row #24 pattern |

**Selected: A1** — single dialog with step state. Matches the existing row #24 pattern and the row #5 `<dialog>` precedent for new dialogs.

### §3.B Type-match input behavior

| Option | Description | Pros | Cons |
|---|---|---|---|
| **B1 ★** | Controlled `<input>` with `useState`; submit disabled when `value !== "DELETE"`; case-sensitive exact match (no `trim()`, no case-fold) | Deterministic; testable; matches GitHub's pattern | None for this scope |
| B2 | Uncontrolled `<input>` with `ref.current.value` check on submit | Slightly less React state | submit-disabled gate impossible without onChange → controlled anyway |
| B3 | Allow lowercase "delete" + case-fold | More user-friendly | Violates the seed brief acceptance signal "Type 'delete' (lowercase) → submit disabled"; weakens security signaling |

**Selected: B1** — controlled, case-sensitive exact match. Acceptance-signal compliance is non-negotiable.

### §3.C State machine

```
Closed
  │
  ▼
Step1 ─ Cancel ──────► Closed
  │                       ▲
  │ Continue              │
  ▼                       │
Step2 ─ Cancel ───────────┤
  │                       │
  │ submit (input==DELETE)│
  ▼                       │
Submitting (real-auth mode: backend call in-flight)
  │                       │
  ├─ success ─► LocalClear ─► Redirect
  │                       │
  └─ failure ─► Failure ───┘
                  │
                  └─ Retry → Submitting (loop) / Cancel → Closed
```

Mock-auth bypass: `Step2 → submit → Submitting (skip backend) → LocalClear → Redirect`. The Submitting state exists transiently so the banner can show "Clearing local data…" even in mock-auth.

States stored in a single `useReducer` (cleaner than multiple `useState`s when transitions are constrained). Reducer is internal to `DeleteAccountConfirmModal.tsx`.

### §3.D Banner placement (mock-auth disclosure)

| Option | Description | Pros | Cons |
|---|---|---|---|
| **D1 ★** | Top of Step 2 panel only, persistent until Step 2 closes | Highest signal-to-noise (only relevant during the type-match step); doesn't waste Step 1 vertical space | Mock-auth banner not visible during Step 1 |
| D2 | Persistent banner across both steps | User sees it earlier | Step 1 is generic "are you sure?" — banner clutters the UX before it's relevant |
| D3 | Inline next to submit button | Adjacent to the destructive action | Easy to miss; smaller text |

**Selected: D1** — Step 2 top, persistent on Step 2 + Submitting + Failure states. Row #7 / row #8 banner pattern reused (non-dismissible, amber/yellow OKLCH).

### §3.E Local-clear orchestration (registry list + IDB + redirect)

| Option | Description | Pros | Cons |
|---|---|---|---|
| **E1 ★** | New internal hook `useAccountDeleteOrchestrator()` inside `plugin-web-settings-rest` that orchestrates: backend call → sign-out → planWipe (registry-list + IDB) → redirect. Pure orchestration; no UI state. | Single-place reasoning; testable in isolation; modal stays UI-only | One more file |
| E2 | Inline orchestration in the modal | Fewer files | Modal becomes hard to test; mixes UI state with side-effects |
| E3 | Orchestration in `web-auth-device-session` (push into platform spine) | Centralized | Cross-boundary concern (modal needs to react to each step's progress for the banner copy); platform spine should not own UI concerns like "Clearing local data…" status |

**Selected: E1** — internal orchestrator hook in `plugin-web-settings-rest`. Calls into `web-auth-device-session.deleteAccount()` (new) + the wipe primitives.

### §3.F Backwards-compat event lifecycle

| Option | Description | Pros | Cons |
|---|---|---|---|
| **F1 ★** | Emit `web:settings:rest:account-delete-confirmed` on Step 1 → Continue click (NOT on actual deletion). JSDoc `@deprecated`. Remove in P1. | One-release notice; matches row #2 EventMap deprecation pattern | Misleading event name (Continue is not "confirm") — mitigated by the @deprecated note |
| F2 | Emit on actual deletion success | Semantically truer | No existing consumer; future P1 desktop pivot wants to remove this event entirely; emitting later moves the deprecation closer to a no-op |
| F3 | Remove immediately | Cleaner | Breaks the "one release for back-compat" hard constraint |

**Selected: F1** — emit on Step 1 → Continue (early signal; the modal's own "the user expressed intent to delete" milestone). Documented in api.md §8.5.

---

## §4. Recommendation (composite)

**Composite α**: A1 (single `<dialog>` step machine) + B1 (case-sensitive controlled input) + C-state-machine + D1 (mock-auth banner on Step 2) + E1 (`useAccountDeleteOrchestrator` internal hook) + F1 (early deprecated-event emit on Continue) + G1 (extend `web-auth-device-session` with `deleteAccount()` + `ACCOUNT_LOCAL_WIPE_IDB_NAMES` const — see §3.2 below).

The 1-line summary: **Replace the SHIPPED row-#24 single-step modal with a 2-step modal whose Step 2 contains a controlled type-match input gating a `useAccountDeleteOrchestrator` call that (in live mode) invokes a new `deleteAccount()` helper in `web-auth-device-session`, then on 200 wipes the registered `xai_*` localStorage keys + known IndexedDB databases + redirects; in mock-auth mode the same wipe runs without the backend call and a disclosure banner is shown.**

---

## §5. Frozen Assumptions (preview — full list in `design.md` §2026-05-26 Extension)

1. **FA-1**. Modal is a single `<dialog>` with internal `useReducer` step state.
2. **FA-2**. Type-match is case-sensitive, exact "DELETE" (no trim, no fold).
3. **FA-3**. Real-auth flow: backend call → 200 → local-clear → redirect. NO local mutation before backend confirms success.
4. **FA-4**. Real-auth failure: error banner inside Step 2 (state=Failure), modal stays open, Retry re-enables submit. localStorage / IDB untouched.
5. **FA-5**. Mock-auth flow (`VITE_WEB_AUTH_MODE=mock-authenticated`): skip backend, run local-clear + redirect, show non-dismissible amber banner "Mock-auth delete (no real backend)".
6. **FA-6**. Local-clear uses **registered key list** (`Object.keys(PREF_REGISTRY)` from `@repo/plugin-web-storage`), NEVER wildcard `localStorage.clear()` or prefix-match. The registry is the source of truth.
7. **FA-7**. IDB clear iterates a known-database list constant `ACCOUNT_LOCAL_WIPE_IDB_NAMES` exported from `web-auth-device-session` (added in this row). The list at row-#9-time is: `web-encrypted-cache`, `xai-web-ai-secrets`, `xai-web-auth`. `indexedDB.databases()` is NOT used (Safari and older browsers don't implement it consistently).
8. **FA-8**. Redirect: `window.location.assign("/")` — same-tab full-page navigation. Forces a clean React tree on the next session.
9. **FA-9**. Deprecated event `web:settings:rest:account-delete-confirmed` emitted on Step 1 → Continue click (NOT on deletion). JSDoc `@deprecated since 2026-05-26 (row #9); will be removed in P1`.
10. **FA-10**. NEW function `deleteAccount(client, { onProgress? })` added to `web-auth-device-session` (`auth-actions.ts`). Wraps `supabase.functions.invoke("account-delete", { ... })`, then `supabase.auth.signOut()`. Throws typed `AccountDeleteError` with `kind: "network" | "unauthorized" | "forbidden" | "server" | "unknown"` discriminator.
11. **FA-11**. NEW const `ACCOUNT_LOCAL_WIPE_IDB_NAMES` exported from `web-auth-device-session/index`. Used by orchestrator hook to iterate `indexedDB.deleteDatabase(name)`.
12. **FA-12**. NEW hook `useAccountDeleteOrchestrator()` internal to `plugin-web-settings-rest` (NOT exported via barrel). Returns `{ submit: () => Promise<void>, state: "idle" | "submitting" | "wiping" | "success" | "failure", error: AccountDeleteError | null }`.
13. **FA-13**. The Edge Function `account-delete` itself is **NOT shipped** in row #9 — it is a v1 trust-the-shape stub. Operator runbook documented in `apps/web/deploy/README.md` (extend with §"Account-Delete Edge Function" section). Real-auth path is verified only by mocking `client.functions.invoke()` in tests. Production deploys MUST provision the Edge Function before flipping any traffic to the new flow.
14. **FA-14**. **NO new CSP amendment.** `connect-src` already covers `VITE_SUPABASE_URL` via the SHIPPED platform spine. No `_headers` edit. No ADR-0008 amendment. (This is the FIRST gap-closure row since row #5 that does NOT touch ADR-0008.)
15. **FA-15**. **Append-only doc discipline.** `design.md` gains ONE new section; `api.md` gains ONE new §8; `test.md` gains ONE new §7; `dev_log.md` gains ONE new "## Bugfix-Extension Lineage — gap-closure row #9 (2026-05-26)" block. 3 prior dev_log blocks (#24 + row #7 + row #8) preserved verbatim.

---

## §6. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Backend returns 200 but local-clear partially fails (e.g. IDB.deleteDatabase blocked by an open transaction) → user stuck with stale data appearing "deleted" upstream | Medium | High | Sequence `localStorage` clear BEFORE `IDB.deleteDatabase()`; treat IDB-blocked as best-effort + log; redirect anyway (the upstream account is gone, the user must re-auth — stale local data will fail on first read). DEL-WIPE-1/2 tests assert sequencing. |
| R2 | User closes the tab mid-deletion (between backend 200 and local-clear completing) | Medium | Medium | On next session, the user will fail to re-authenticate (account gone) → existing auth-redirect handles → app loads in `unauthenticated` state. Local stale `xai_*` keys are harmless without a session. Documented as "best-effort local cleanup" in api.md. |
| R3 | Backend returns 200 on first call; user clicks Retry; second call returns 404 (idempotency) → modal shows confusing "not found" | Medium | Low | Treat 404 as terminal success (account is gone). Distinct branch in `deleteAccount()` error mapping: `kind: "already_deleted"` → orchestrator proceeds to local-clear + redirect. DEL-IDEM-1 test. |
| R4 | Wildcard `localStorage.clear()` accidentally wipes unrelated browser data (extensions / iframes / other apps on same origin) | High (if accidentally implemented) | High | DEL-WILDCARD-GUARD source-text test: greps `src/internal/useAccountDeleteOrchestrator.ts` for the literal substring `localStorage.clear()` and asserts ZERO matches. Always iterate `Object.keys(PREF_REGISTRY)`. |
| R5 | `indexedDB.deleteDatabase(name)` requires schema knowledge — if a new database is added later (e.g. P1 desktop pivot) and we forget to extend `ACCOUNT_LOCAL_WIPE_IDB_NAMES`, the new DB persists after delete | Medium | Medium | Document the const in `web-auth-device-session/docs/api.md` (extension) + `apps/web/deploy/README.md` runbook + JSDoc on the const itself stating "Append new IDB databases here on creation". Sourced from the same registry-discipline pattern as `plugin-web-storage`. DEL-IDB-LIST-1 test asserts the constant has expected entries at row-#9-time. |
| R6 | Mock-auth banner missed → user clicks delete expecting real deletion → confusion when they re-load and the account still exists | Medium | Low (mock-auth is dev-only) | Banner is non-dismissible + amber OKLCH (high contrast) + bilingual + tested by DEL-MOCK-BANNER-1/2/3 (rendered in EN, ZH, non-dismissible — same gates as row #8 PB-BANNER-1..3). |
| R7 | Type-match accepts whitespace / unicode lookalikes (e.g. zero-width chars, fullwidth D-E-L-E-T-E) → user types something that looks like DELETE but isn't, submit stays disabled, user confused | Low | Low | Exact-match via `=== "DELETE"` — no normalization. Lowercase / whitespace / lookalikes all fail. Acceptance signal "type 'delete' lowercase → submit disabled" passes by definition. Test DEL-TYPEMATCH-1..6. |
| R8 | Backend Edge Function not provisioned at deploy time → live-mode users hit network errors → bad UX | Medium | High | Runbook in `apps/web/deploy/README.md` §"Account-Delete Edge Function" with: (a) Edge Function shape, (b) RLS / service_role config, (c) deploy gate "must exist before flipping flag". `feature-verify` cross-vendor cold-read flags this as a deployment prerequisite. Live-mode tests use a `vi.spyOn(client.functions, "invoke")` mock so CI/test never depend on the real function. |
| R9 | Session sign-out fails between backend success and local-clear → user has stale session token in memory but no account → next API call returns 401 | Low | Low | `signOut()` is called between backend success and local-clear; failure is logged but does not abort. Once `xai-web-auth` IDB is deleted (step 5 of §2.3), the next page load has no session. Documented in api.md §8.6. |
| R10 | Deprecated event still emitted causes confusion for code-readers ("what does this event mean now?") | Low | Low | JSDoc `@deprecated since 2026-05-26 (row #9); will be removed in P1.` on the EventMap entry. Removal scheduled in P1 desktop pivot row. |
| R11 | Verify cycle catches lint warning on unused `error` state in mock-auth path (the failure path is unreachable in mock-auth) | Low | Low | Use `// eslint-disable-next-line @typescript-eslint/no-unused-vars` or restructure the reducer to omit `error` from mock-auth state. Preempt with explicit lint-clean implementation. Same prevention as row #7 cycle-2 B1.a + B2 lessons. |

---

## §7. WebSearch evidence (external research)

WebSearch queries performed at planning time (2026-05-26):

1. `"Supabase delete user account auth.admin.deleteUser client browser security 2026"` — confirmed `auth.admin.deleteUser` requires `service_role` key + server/edge-function execution; cannot be called from browser. [Supabase Docs — Delete a user](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser); [GitHub discussion #21274](https://github.com/orgs/supabase/discussions/21274).
2. `"Supabase user self-delete account edge function client browser pattern 2025"` — confirmed Edge Function is the recommended client-callable pattern; client invokes via `supabase.functions.invoke()`; Edge Function creates user-context client with RLS applied. [Mansueli blog — User Self-Deletion via Edge Functions](https://blog.mansueli.com/supabase-user-self-deletion-empower-users-with-edge-functions); [Supabase Edge Functions guide](https://supabase.com/docs/guides/functions).

Both searches confirm the §2.1 architectural decision: row #9 introduces a thin `deleteAccount()` client wrapper around `supabase.functions.invoke("account-delete")` inside the SHIPPED `web-auth-device-session` boundary; the Edge Function itself is provisioned operationally (deployment prerequisite, not in row-#9 code scope).

No other external research required (the UX patterns — type-DELETE gate, 2-step modal, local wipe order — are well-established and have in-repo precedents in row #5 / row #7 / row #8).

---

## §8. Open questions for `feature-review`

| # | Question | Recommended default | Decision required |
|---|---|---|---|
| Q1 | Is extending `web-auth-device-session` with `deleteAccount()` an acceptable interpretation of seed brief HC1 "use SHIPPED platform spine"? (Reality: the SHIPPED package has NO existing delete endpoint per design.md scope carve-out.) | YES — extension is the only HC1-compliant path. The alternative (parallel auth path in plugin-web-settings-rest) violates HC1 and the 3-layer boundary. | feature-review APPROVE / REVISE |
| Q2 | Should the Edge Function be implemented in this row, or deferred to a separate "operational" row? | DEFER — row #9 is "wire the client"; Edge Function provisioning is a deploy-time concern documented in operator runbook. Real-auth tested via `vi.spyOn(client.functions, "invoke")` mock. | feature-review APPROVE / REVISE |
| Q3 | Should the 30-day premium tier (row #8) be cleared on account delete? (User account is gone → tier flag is meaningless but technically persists in localStorage.) | YES — Option E1's registry-list iteration sweeps ALL registered `xai_*` keys including `xai_pref_premium_tier` and `xai_pref_premium_started_at`. No special-case logic. | feature-review confirm (already handled by FA-6) |
| Q4 | Mock-auth banner copy: "Mock-auth delete (no real backend)" — confirm wording / ZH translation? | EN: "Mock-auth delete (no real backend) — this will only clear local data." / ZH: "演示模式删除（无真实后端） — 仅清除本地数据。" Matches row #7 / row #8 banner pattern + lengths. | feature-review confirm |
| Q5 | Step 1 → Continue emits deprecated event; is the event payload `{ confirmedAt: string }` still correct? (No payload schema change; only timing change.) | YES — same payload, different semantic timing. JSDoc updated to reflect new timing. | feature-review confirm |

---

## §9. Phase plan (4 phases — smallest scope of wave 2)

The seed brief explicitly notes row #9 is "smallest of 6a/6b/6c sub-rows". Phase count drops from row #7/#8's 5 to **4** because there is no ADR-0008 amendment + no CSP test + no new EventMap entry.

### Extension-P1 — 2-step modal + type-match input + step state machine (UI only)

**Scope**:
- `src/internal/DeleteAccountConfirmModal.tsx` — REWRITE in place. Replace single-step UI with `useReducer` step machine + Step 1 panel + Step 2 panel + type-match input + bilingual labels.
- `src/internal/localI18n.ts` — +14 bilingual entries (`deleteModal.step1_title`, `deleteModal.step1_body`, `deleteModal.continue`, `deleteModal.step2_title`, `deleteModal.step2_body`, `deleteModal.type_prompt`, `deleteModal.input_placeholder`, `deleteModal.confirm_disabled_tooltip`, `deleteModal.delete_now`, `deleteModal.submitting`, `deleteModal.error_network`, `deleteModal.error_unauthorized`, `deleteModal.error_forbidden`, `deleteModal.error_server`, `deleteModal.error_unknown`, `deleteModal.retry`, `deleteModal.mock_banner`).
- `src/styles.css` — extend `.delete-account-modal` rules; add `.dam-input` + `.dam-mock-banner` + `.dam-error` + `.dam-actions-row` (all OKLCH, no hex).
- `src/__tests__/DeleteAccountConfirmModal.test.tsx` — REWRITE. Preserve existing AC4/AC5/AC6/AC7 behavioral intent under new tests:
  - DEL-STEP-1..3 (step transitions: closed → step1 → step2; cancel on both)
  - DEL-TYPEMATCH-1..6 (case-sensitive: "DELETE"=enabled, "delete"=disabled, "Delete"=disabled, ""=disabled, "DELETEX"=disabled, "DELETE "=disabled, ZWS=disabled)
  - DEL-CANCEL-1..2 (cancel on step1 / step2 closes modal; clears input)
  - DEL-BILINGUAL-1..2 (EN / ZH labels on both steps)
- `src/__tests__/accountPane.test.tsx` — EDIT to keep AC1/AC2/AC3/AC4/AC8 (preserved) + adjust AC5..AC7 (modal opens; click Continue triggers Step 2; verifying old confirm path becomes new Step 1 → Continue flow).
- **Suggested commit**: `feat(xai-web-settings-account-delete-wire): P1 — 2-step modal + type-DELETE gate + bilingual i18n (gap-closure row #9)`

### Extension-P2 — Wire to web-auth-device-session real-auth call + failure handling

**Scope**:
- `packages/web-auth-device-session/src/auth-actions.ts` — ADD `deleteAccount(client, { onProgress? })` function + `AccountDeleteError` class (named export with `kind` discriminator).
- `packages/web-auth-device-session/src/index.ts` — export `deleteAccount`, `AccountDeleteError`, type `AccountDeleteErrorKind`.
- `packages/web-auth-device-session/docs/{design.md, api.md}` — append a small "Account Delete Helper (extension 2026-05-26 — gap-closure row #9)" section to each.
- `packages/web-auth-device-session/src/auth-actions.test.ts` — extend with new test block: `deleteAccount`:
  - DAA-1: invokes `client.functions.invoke("account-delete")` with correct body.
  - DAA-2: on success, calls `client.auth.signOut()`.
  - DAA-3: on network error, throws `AccountDeleteError` with `kind: "network"`.
  - DAA-4: on 401 from invoke, throws with `kind: "unauthorized"`.
  - DAA-5: on 403 from invoke, throws with `kind: "forbidden"`.
  - DAA-6: on 500 from invoke, throws with `kind: "server"`.
  - DAA-7: on 404 from invoke, throws with `kind: "already_deleted"` (idempotency — see R3).
  - DAA-8: on signOut failure AFTER successful invoke, does NOT throw — sign-out failure is downgraded (the account is gone).
- **Suggested commit**: `feat(xai-web-settings-account-delete-wire): P2 — deleteAccount() helper + AccountDeleteError in web-auth-device-session (gap-closure row #9)`

### Extension-P3 — Mock-auth fallback + local-clear orchestration + redirect

**Scope**:
- `packages/web-auth-device-session/src/index.ts` — export `ACCOUNT_LOCAL_WIPE_IDB_NAMES` constant (`["web-encrypted-cache", "xai-web-ai-secrets", "xai-web-auth"]` as `readonly string[]`).
- `packages/web-auth-device-session/src/storage.ts` (or new `wipe.ts`) — add `wipeRegisteredIDB()` helper that iterates the constant + calls `indexedDB.deleteDatabase(name)` per entry; resolves on all settled. Used by the orchestrator hook in plugin-web-settings-rest.
- `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts` (NEW) — hook orchestrating: detect auth mode → (live: call `deleteAccount()`) → wipe registered keys via `removePref` loop over `Object.keys(PREF_REGISTRY)` → call `wipeRegisteredIDB()` → `window.location.assign("/")`.
- `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx` — wire the orchestrator into the Submitting state; pass `onProgress` callback for "Clearing local data…" UI; failure routes update reducer state.
- `packages/plugin-web-settings-rest/src/panes/accountPane.tsx` — handle the deprecated event emit on Step 1 Continue; pass `lang` to modal.
- Tests:
  - `useAccountDeleteOrchestrator.test.tsx` (NEW) — DEL-ORCH-1 (live mode happy path: backend → sign-out → localStorage wiped via registry list → IDB delete called → redirect), DEL-ORCH-2 (mock-auth: skip backend, do wipe + redirect), DEL-ORCH-3 (backend failure: NO wipe, NO redirect, throws), DEL-ORCH-4 (404 idempotency: wipe + redirect), DEL-WIPE-1 (registry list iterated; one removePref per key), DEL-WIPE-2 (IDB list iterated; `indexedDB.deleteDatabase` called per name), DEL-WILDCARD-GUARD source-text test (no `localStorage.clear()` literal in src).
  - `DeleteAccountConfirmModal.test.tsx` — extend with DEL-WIRE-1 (clicking "Delete Now" in mock-auth triggers orchestrator), DEL-WIRE-2 (failure shows error banner with bilingual copy), DEL-WIRE-3 (retry re-enables submit), DEL-MOCK-BANNER-1/2/3 (mock-auth banner EN/ZH/non-dismissible).
  - `accountPane.test.tsx` — DEL-EVENT-DEP-1 (Step 1 Continue still emits deprecated event for one release).
- **Suggested commit**: `feat(xai-web-settings-account-delete-wire): P3 — useAccountDeleteOrchestrator + ACCOUNT_LOCAL_WIPE_IDB_NAMES + mock-auth fallback + redirect (gap-closure row #9)`

### Extension-P4 — Cross-vendor verify checklist + PLUGIN_MAP + JSDoc deprecation + operator runbook + EventMap @deprecated

**Scope**:
- `packages/core/src/types/events.ts` — annotate `web:settings:rest:account-delete-confirmed` with `@deprecated since 2026-05-26 (gap-closure row #9); will be removed in P1.`
- `apps/web/deploy/README.md` — append §"Account-Delete Edge Function" section: function name `account-delete`, request shape, response shape, RLS/service_role config notes, deploy-gate "must exist before flipping live traffic".
- `docs/PLUGIN_MAP.md` — append "(Extension 2026-05-26 — Account-delete wire gap-closure row #9)" to `plugin-web-settings-rest` row + small note on `web-auth-device-session` row.
- `packages/web-auth-device-session/docs/dev_log.md` — small APPEND-ONLY "Bugfix-Extension Lineage" block tracking the row-#9-introduced helper (preserves SHIPPED dev_log there).
- Cross-vendor verify checklist (owned by `feature-verify`):
  1. No-wildcard guard: `localStorage.clear()` substring count = 0 across `packages/plugin-web-settings-rest/src/**` AND `packages/web-auth-device-session/src/**`.
  2. Type-match case-sensitivity: cold-read DEL-TYPEMATCH-1..6 + visual JSX inspection.
  3. Sequencing: backend success MUST precede any local mutation in live mode (cold-read `useAccountDeleteOrchestrator.ts`).
  4. IDB clear completeness: `ACCOUNT_LOCAL_WIPE_IDB_NAMES` covers all known IDB databases (cold-read; current list = 3 entries; new DBs require manual extension).
  5. Mock-auth banner unmissable: cold-read JSX + CSS contrast (amber OKLCH).
  6. Deprecated event still emitted: cold-read `accountPane.tsx` Step 1 Continue handler.
- **Suggested commit**: `feat(xai-web-settings-account-delete-wire): P4 — JSDoc @deprecated + apps/web/deploy/README extension + PLUGIN_MAP + dev_log lineage close (gap-closure row #9)`

---

## §10. Acceptance signals (mapped from seed brief)

| # | Seed brief acceptance | Mapped test(s) |
|---|---|---|
| 1 | Click "Delete Account" → step 1 modal → click "Continue" → step 2 modal | DEL-STEP-1, DEL-STEP-2, DEL-STEP-3 |
| 2 | Type "delete" (lowercase) → submit button stays disabled | DEL-TYPEMATCH-2 |
| 3 | Type "DELETE" → submit button enables | DEL-TYPEMATCH-1 |
| 4 | Submit (mock-auth) → local-clear → redirect to `/` → reload → clean auth state | DEL-ORCH-2, DEL-WIPE-1, DEL-WIPE-2, DEL-WIRE-1 |
| 5 | Submit (real-auth) → backend call → on success behaves as above | DEL-ORCH-1 |
| 6 | Network failure mid-deletion shows clear error; localStorage NOT cleared | DEL-ORCH-3, DEL-WIRE-2 |
| 7 | All 208/88/86/116 = 498 existing tests still PASS; new tests cover 2-step gate + type-match + mock-auth + failure | all P1..P3 tests are additive; existing AC1..AC8 (with AC5..AC7 adjusted for new semantics) preserved |
| 8 | Cross-vendor verify: (a) no localStorage wipe before backend success, (b) type-match case-sensitive, (c) IndexedDB clear comprehensive | P4 cross-vendor checklist items 1, 2, 3, 4 |

---

## §11. Test coverage summary

| Phase | New tests | Total new |
|---|---|---|
| P1 | DEL-STEP-1..3, DEL-TYPEMATCH-1..6, DEL-CANCEL-1..2, DEL-BILINGUAL-1..2 (modal); AC5/6/7 adjusted in accountPane | ~13 |
| P2 | DAA-1..8 (web-auth-device-session) | 8 |
| P3 | DEL-ORCH-1..4, DEL-WIPE-1..2, DEL-WILDCARD-GUARD, DEL-WIRE-1..3, DEL-MOCK-BANNER-1..3, DEL-EVENT-DEP-1, DEL-IDEM-1, DEL-IDB-LIST-1 | ~15 |
| P4 | — (documentation phase) | 0 |
| **Total** | | **~36 new tests** |

Baseline preserved (post-#8): plugin-web-settings-rest 208, plugin-web-storage 88, xai-web-shell 86, web 116, web-auth-device-session existing baseline (TBD by feature-build P2 — likely ~30 tests preserved + 8 added).

---

## §12. Rollback path

If row #9 ships and a production issue surfaces:

1. **Revert path**: `git revert <P3 commit>` undoes the orchestrator hook + modal wiring; modal reverts to Step 1 only + deprecated-event no-op (the row #24 SHIPPED behavior is recoverable by reverting P3 alone).
2. **Partial revert**: `git revert <P2 commit>` undoes the `deleteAccount()` helper but leaves the new 2-step modal in place — in this state, real-auth deletes fail with "deleteAccount is not a function" (build error). NOT recommended; full revert preferred.
3. **Edge Function disable**: if the Edge Function `account-delete` itself misbehaves in prod, disable it in the Supabase dashboard; client gets 500 → user sees error banner → no local-clear → no user-visible regression.
4. **Mock-auth-only deploy**: emergency option — flip `VITE_WEB_AUTH_MODE=mock-authenticated` in Cloudflare Pages env vars + redeploy → users can delete-locally without backend; backend cleanup deferred.

All four rollback paths are documented in `apps/web/deploy/README.md` §"Account-Delete Rollback".

---

## §13. Out-of-scope (explicit non-goals for row #9)

- The Edge Function `account-delete` implementation (deferred to operational provisioning; documented in runbook).
- Account export / GDPR-compliant data dump (separate feature; ADR-0009 P1).
- 30-day grace period / undo-delete UX (deferred to P1 desktop pivot).
- Soft-delete vs hard-delete decision at the database level (operator/DBA concern; the client cannot determine this from the 200 response).
- Mass-delete admin UI (out of scope; this is user-self-delete only).
- Token revocation propagation to other tabs (BroadcastChannel cleanup) — sign-out + IDB wipe handles the local tab; other tabs get a 401 on next sync attempt (acceptable v1).

---

## §14. Decision summary (one-paragraph executive)

Row #9 rewrites the SHIPPED row-#24 single-step Account-Delete confirm modal into a 2-step gate (`Are you sure?` → `Type DELETE to confirm`) with case-sensitive type-match, wires it via a new `useAccountDeleteOrchestrator` hook to a new `deleteAccount()` helper in the SHIPPED `web-auth-device-session` platform spine (HC1-compliant scope extension since the SHIPPED package's `design.md` explicitly carved out account-delete in v1), and on backend success clears all 42 registered `xai_*` localStorage keys (via `Object.keys(PREF_REGISTRY)` iteration — never wildcard) + 3 known IndexedDB databases (via a new `ACCOUNT_LOCAL_WIPE_IDB_NAMES` constant) then redirects to `/`. Mock-auth mode skips the backend call but runs the same local wipe with a non-dismissible amber disclosure banner. The existing `web:settings:rest:account-delete-confirmed` event is preserved for one-release backwards-compat (annotated `@deprecated`) and emitted on Step 1 → Continue click. **No ADR-0008 amendment, no `_headers` edit, no CSP test case** — first wave-2 gap-closure row without those. 4 phases, ~36 new tests, ~498 baseline tests preserved.

---

## §15. Sources

- [Supabase Docs — JavaScript: Delete a user (`auth.admin.deleteUser`)](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
- [Supabase GitHub Discussion #21274 — How to delete a user from Authentication](https://github.com/orgs/supabase/discussions/21274)
- [Mansueli — Supabase User Self-Deletion: Empower Users with Edge Functions](https://blog.mansueli.com/supabase-user-self-deletion-empower-users-with-edge-functions)
- [Supabase Docs — Edge Functions guide](https://supabase.com/docs/guides/functions)
- [Supabase Docs — Discussion #1066: How to let a user delete their own account?](https://github.com/orgs/supabase/discussions/1066)
- Internal: `packages/web-auth-device-session/docs/design.md` line 41 (account export/delete/privacy carve-out)
- Internal: `packages/plugin-web-storage/src/internal/registry.ts` — `PREF_REGISTRY` keyset (42 keys at row-#9-time)
- Internal: `packages/core-data/src/indexeddb-sync-blob.ts` — `WEB_CACHE_DB_PREFIX = "web-encrypted-cache"`
- Internal: `packages/xai-web-ai-chat/docs/test.md:398` — `xai-web-ai-secrets` + `xai-web-auth` IDB database names
- Internal: `docs/adr/0008-cloudflare-deploy-target-and-csp.md` §S3 D3 (post FOURTH amendment) — confirms no new amendment needed for row #9
- Internal: `apps/web/src/providers/AppProviders.tsx:66` — `VITE_WEB_AUTH_MODE` env variable handling
