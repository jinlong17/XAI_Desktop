# Discovery Review — xai-web-dashboard-stickies-create

- Date: 2026-05-28
- Author: claude-opus-4-8 — feature-plan
- Authority: ADR-0010 Accepted 2026-05-26 §D4 — P0 carve-out commit `baaf3e1` (`docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md`)
- Audit trigger: `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` Top-10 #6 (Dashboard stickies `+`, `StickiesWidget.tsx:24-27`) + per-route §dashboard row D-21
- Closest blueprint: `xai-web-calendar-event-create` (store-from-scratch + new registry key) — see §2
- Owning package: `@repo/plugin-web-dashboard-widgets` (SHIPPED 2026-05-23, `packages/xai-web-dashboard-widgets/`) — EXTENSION only
- Branch: `web` (NOT `dev`)
- External research: **No external research required** — this is purely internal business logic. No new npm dependency, no technology selection, no open-source alternative comparison. All decisions are internal-architecture picks (store shape, composer-vs-inline, fixture disposition, i18n source) resolved below against existing in-repo precedent.

---

## 0. TL;DR — Recommendation

Build a **from-scratch sticky store** inside the SHIPPED `@repo/plugin-web-dashboard-widgets` package, mirroring the `xai-web-calendar` event-store architecture (pure CRUD module + `usePref`-backed hook + id helper), persist it under a **new authorized registry key `xai_dashboard_stickies`**, and wire the StickiesWidget `+` to a **native `<dialog>` StickyComposer** (text + color preset). Scope is **CREATE + DELETE** (delete is in-scope for v1 — justified §6 Q1). Fixture is **merged as a dismissable sample** until the first user sticky exists, then replaced. Sticky text is a **single string** (not bilingual). i18n uses **a local STR table** (not `plugin-web-tokens`). 4-phase build mirroring Calendar.

---

## 1. Problem framing

The Dashboard StickiesWidget renders a hard-coded fixture (`internal/fixtures.ts` `STICKIES`, 3 notes) and its `+` button has `aria-label` + `data-no-drag` but **no `onClick`** (`StickiesWidget.tsx:24-27`). There is **no persistence key, no store, no reducer** for stickies anywhere in the repo. A user cannot create a sticky note. This is the **last of the Audit Top-10** no-op buttons; #1-#5 and #7-#10 are SHIPPED.

Unlike #3 Tasks (`xai_task_cols` existed) and #4 Matrix (`xai_matrix_state` existed), Stickies has **zero data layer**. The structurally-closest precedent is `xai-web-calendar-event-create` (commits `e108607` → `90ca6d8`), which built a `Record<string, Entity>` store from scratch under a new `xai_calendar_events` key. This plan reuses that architecture almost verbatim, scaled down to the much simpler sticky model.

### Constraints (from carve-out §2 + §3)

- New `xai_dashboard_stickies` registry key in `packages/plugin-web-storage/src/internal/registry.ts` — **authorized** (additive; codec `json`, owner `xai-web-dashboard-widgets`, category `module`, schemaVersion 1).
- MUST NOT touch: `packages/core/src/types/events.ts` (no new event channel — React state lift); other `plugin-web-*` packages; SHIPPED archives / ADR-0010 / ADR-0007; the `dev` branch. NO Supabase. NO new npm dep. NO IndexedDB.
- `plugin-web-tokens` MAY be edited only if planner chooses tokens-based i18n (narrow exception). **This plan does NOT edit it** — see §6 Q3.

---

## 2. Blueprint analysis — why Calendar, not Tasks/Matrix

| Dimension | Tasks / Matrix (#3 / #4) | Calendar (event-create) | **Stickies (this)** |
|---|---|---|---|
| Pre-existing store | YES (`xai_task_cols` / `xai_matrix_state`) | NO — built from scratch | **NO — built from scratch** |
| Registry edit | none (reused key) | +1 key `xai_calendar_events` | **+1 key `xai_dashboard_stickies`** |
| Data shape | reducer over columns | `Record<id, UserCalEvent>` | **`Record<id, UserSticky>`** |
| Store module | reducer in `internal/` | `internal/eventStore/{eventStore,ids,useUserCalEvents}.ts` | **`internal/stickiesStore/{stickiesStore,ids,useStickies}.ts`** |
| Host integration | full module | full module (`CalendarModule` lifts state) | **widget render-fn (no module to lift into)** |
| Composer | `TaskComposer` (native `<dialog>`) | `EventComposer` (native `<dialog>`) | **`StickyComposer` (native `<dialog>`)** |

**Key structural divergence from Calendar**: Calendar is a full route module (`CalendarModule.tsx`) that owns state and renders `<EventComposer>` as a sibling. Stickies is a **widget render function** (`registrations.tsx:69-73` calls `render: (ctx) => <StickiesWidget lang={ctx.lang} />`). The grid re-invokes `render(ctx)` on every parent tick, but `StickiesWidget` is a real React component that holds its own hooks across re-renders (exactly like `ClockWidget` holds `usePref` ×2). **Therefore the `useStickies` hook + composer open/close state live INSIDE `StickiesWidget` — nothing lifts to a module, and no `WidgetRenderContext` field is added.** This is simpler than Calendar.

The pure CRUD store + id helper are otherwise a near-verbatim port of `packages/xai-web-calendar/src/internal/eventStore/{eventStore.ts,ids.ts,useUserCalEvents.ts}`.

---

## 3. Candidate options + tradeoffs

### Axis A — Store location & shape

- **A1 (CHOSEN)** — `Record<string, UserSticky>` keyed by id, in `src/internal/stickiesStore/` (sub-dir mirroring Calendar `eventStore/`). Pure CRUD (`createSticky`, `deleteSticky`, `listStickies`) + `useStickies()` hook wrapping `usePref("xai_dashboard_stickies")`.
- A2 — flat `UserSticky[]` array. Rejected: array delete is O(n) splice + index-fragile; the Record form matches the SHIPPED Calendar store, gets free dedup-by-id, and `deleteSticky` is a clean key-omit (mirrors `deleteEvent`). Ordering is recovered by a `listStickies` sort on `createdAt`.
- A3 — co-locate CRUD in a single `internal/stickiesStore.ts` flat file (no sub-dir). Acceptable but A1's sub-dir keeps the 3 files (store/ids/hook) grouped exactly like Calendar, easing cross-vendor cold-read.

**Verdict: A1.** Record store + sub-dir, pure-CRUD + hook, verbatim Calendar architecture.

### Axis B — Sticky model: bilingual vs single string

- **B1 (CHOSEN)** — `text: string` (single string, stores exactly what the user typed). `color: StickyColor` (preset union). `id`, `createdAt`.
- B2 — `text: { en: string; zh: string }` (bilingual, mirroring the fixture `StickyFixture.text`). Rejected: a user types ONE note in ONE language; forcing dual-language input is a poor UX (carve-out Q5 explicitly leans single-string). The fixture is bilingual only because it is canned sample copy. User stickies render `sticky.text` directly (no `[lang]` index).
- Migration note: the fixture render path (`n.text[lang]`) and the user render path (`s.text`) differ by one indexer — the widget branches on whether the item is a fixture or a user sticky (see §5 render plan).

**Verdict: B1.** `text: string`. Color from a preset palette (so it round-trips as a stable token, not a raw hex — see Axis F).

### Axis C — Persistence default: `{}` vs `[]`

- **C1 (CHOSEN)** — default `{}` (empty Record), matching `xai_calendar_events` (registry default `{}`). Codec `json`.
- C2 — default `[]`. Rejected: inconsistent with the Record shape (A1) and with the Calendar precedent the reviewer will diff against.

**Verdict: C1.** `default: {} as Record<string, unknown>`, codec `json`, owner `xai-web-dashboard-widgets`, category `module`, schemaVersion 1, `proposed: false`. Byte-identical entry shape to `xai_calendar_events` (registry.ts:943-950).

### Axis D — id generator

- **D1 (CHOSEN)** — `createStickyId()` in `internal/stickiesStore/ids.ts`: `crypto.randomUUID()` when present, else `sticky-<base36ts>-<rnd>` fallback. Verbatim port of `createEventId` (calendar ids.ts:22-32) with the `evt-` prefix swapped to `sticky-`.

**Verdict: D1.**

### Axis E — Composer pattern: native `<dialog>` (consistent) vs inline `<textarea>` (domain-natural)

This is **Planner's Call Q2** (carve-out §2). Tradeoffs:

- **E1 (CHOSEN) — native `<dialog>` `StickyComposer`**, mirroring SHIPPED `TaskComposer` / `EventComposer` / `MatrixComposer`. Single `<textarea>` for text + a `role="radiogroup"` color-preset picker + Save/Cancel. ESC / backdrop / Cancel close; autofocus textarea; `aria-modal` + `aria-labelledby`.
- E2 — inline-add: a `<textarea>` that expands inside the widget body on `+` click, save-on-blur or save-on-Enter.

**Verdict: E1 (dialog), with justification for the divergence the carve-out invited:** Inline-add (E2) is genuinely tempting for stickies, BUT:
1. **The widget body is a drag handle.** The dashboard grid makes every widget body draggable; interactive children must carry `data-no-drag` (api.md §S4). An always-present inline `<textarea>` inside the drag surface is a pointer-event minefield (textarea selection vs drag-start) — exactly the R3/R4 class of bug the SHIPPED widgets fought. A modal `<dialog>` renders in the top layer **outside** the grid's pointer tree, sidestepping drag entirely.
2. **The widget is tiny** (`w-stickies` span). An inline composer would crowd the 3-sticky stack; a modal has room for a textarea + color row + delete affordances.
3. **Consistency + reviewer cold-read.** Three SHIPPED composers (Task/Event/Matrix) are native `<dialog>`; a fourth that matches is a near-verbatim template (lower build + review cost) and cross-vendor smoke is a known quantity.
4. The carve-out's own acceptance anchor says "click `+`, type a note, pick a color, **save**" — a save-gated modal, not blur-commit inline.

Inline-add deferred; flagged for `feature-review` to override if it prefers the lighter inline UX (see §6 Q2).

### Axis F — Color model: preset token vs raw hex

- **F1 (CHOSEN)** — a fixed preset palette of 5 named colors `{ sun, mint, peach, sky, lilac }` → hex resolved at render. `UserSticky.color` stores the **token** (e.g. `"sun"`), not the hex. The fixture's raw hex values (`#fff7c0` etc.) are mapped onto the nearest preset for display consistency, OR kept as-is for fixtures only (fixtures render their literal `n.color`; user stickies resolve `STICKY_COLORS[s.color]`).
- F2 — store raw hex string. Rejected: a raw-hex free-field needs a color picker (scope creep) and won't theme cleanly in dark mode. Note `xai_pref_sticky_color` (registry.ts:811, a Settings pref, default `"sun"`) already uses named color tokens — F1 aligns the data vocabulary with the existing settings pref even though we do NOT read that pref in v1.

**Verdict: F1.** 5-preset radiogroup; default `sun`. (We do NOT wire `xai_pref_sticky_color` as the default in v1 — that cross-pref read is deferred; default is hard-coded `sun`.)

### Axis G — Fixture disposition (mirror Calendar Q9/Q10)

This is **Planner's Call Q4**. Calendar's resolution: keep sample data with a "Sample" badge until the user creates their first real entity, then the user data takes over (sample never persists). Stickies options:

- **G1 (CHOSEN) — merge as dismissable sample**: when `xai_dashboard_stickies` is empty (no user stickies yet), render the 3 fixture notes as **read-only samples** (visually marked, e.g. a `data-sample="true"` attribute + subtle "sample" treatment) AND show the live empty-create affordance. Once the user creates ≥1 sticky, render **only** user stickies (fixtures drop out). Fixtures never get written to storage.
- G2 — replace fixture entirely on first paint (empty widget until user creates). Rejected: an empty widget on a fresh dashboard looks broken; the sample gives the feature a self-explaining first impression (matches Calendar's reasoning).
- G3 — always merge fixture + user (fixtures permanent). Rejected: fixtures would pile on top of real notes forever — clutter; and "delete" on a fixture would be a no-op surprise.

**Verdict: G1.** Empty store → 3 read-only fixture samples + create affordance. Non-empty store → user stickies only. This mirrors Calendar Q9 (`SAMPLE_BADGE`) / Q10 (sample-until-first-real) verbatim in intent. Fixtures stay in `internal/fixtures.ts` unchanged (no fixture file edit needed beyond possibly adding nothing — the widget decides disposition at render).

### Axis H — Where composer + hook state lives

- **H1 (CHOSEN)** — inside `StickiesWidget`. The widget holds `useStickies()` + `useState` for composer open/close. No `WidgetRenderContext` change, no module, no state lift. (Justified §2 — the widget is a stable React component across grid re-renders, like `ClockWidget`.)
- H2 — lift to a new dashboard module wrapper. Rejected: there is no sticky "module"; the widget IS the surface. Adding a wrapper contradicts the row #10/#11 render-fn contract.

**Verdict: H1.** Zero `packages/core/` edit, zero render-context edit (honors carve-out constraint).

---

## 4. Registry key — exact shape (authorized edit)

Add to `packages/plugin-web-storage/src/internal/registry.ts` (after the `xai_calendar_events` block at lines 943-950), byte-parallel to that precedent:

```ts
// ---- Dashboard stickies (extension 2026-05-28 by xai-web-dashboard-stickies-create) ----
// User-created sticky notes. Indexed by sticky.id (UUID).
// Owner xai-web-dashboard-widgets (extension to row #11 SHIPPED).
// Category "module" — NOT in the xai_pref_* chassis-reset family.
// proposed: false. Authority: ADR-0010 §D4 + docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md.
// Value shape: Record<string, UserSticky> — `UserSticky` declared in
// @repo/plugin-web-dashboard-widgets; not imported here (registry stays plugin-dep-free).
xai_dashboard_stickies: {
  key: "xai_dashboard_stickies",
  codec: "json",
  default: {} as Record<string, unknown>,
  schemaVersion: 1,
  owner: "xai-web-dashboard-widgets",
  category: "module",
} satisfies PrefEntry<Record<string, unknown>>,
```

Two parity-test arrays MUST also gain the key (both already list `xai_calendar_events` as the last owner-row addition):
- `packages/plugin-web-storage/src/__tests__/registry.test.ts:230` (`OWNER_ROW_ADDITIONS`) — bumps the `AC-REG-8` count assertion automatically (`20 + OWNER_ROW_ADDITIONS.length`).
- `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts:165` (the §9.2 parity exclusion list).
- A new `AC-REGISTRY-STICKIES-1/2` block in `registry.test.ts` mirroring `AC-REGISTRY-CREATE-1/2` (entry-shape + round-trip).

**Caution flagged for feature-review**: `parity-design-md.test.ts` cross-checks registry keys against `web design/DESIGN.md §9.2`. The existing `xai_calendar_events` is in the exclusion list precisely because it is an owner-row addition NOT in §9.2. `xai_dashboard_stickies` is the same case → it goes in the exclusion list. The reviewer should confirm whether DESIGN.md §9.2 must also be touched (the calendar extension did NOT touch DESIGN.md — it relied on the exclusion list). **Plan default: follow the calendar precedent exactly — exclusion-list only, no DESIGN.md edit.** This is in scope of the carve-out's "registry edit + its registry test" authorization.

---

## 5. Render plan for StickiesWidget (post-wire)

```
StickiesWidget({ lang })
  const { list, create, remove } = useStickies();   // list: UserSticky[] sorted createdAt ASC
  const [composerOpen, setComposerOpen] = useState(false);

  header:  <button + onClick={() => setComposerOpen(true)} />   // wire the no-op +
  body:
    if list.length === 0:
       render 3 FIXTURE samples (read-only, data-sample="true", n.text[lang], n.color)
       + empty hint "Click + to create your first note"
    else:
       render user stickies: s.text (single string), background = STICKY_COLORS[s.color],
       each with a per-sticky × delete button (data-no-drag) → remove(s.id)
  <StickyComposer
     open={composerOpen}
     lang={lang}
     onSave={(draft) => { create(draft); setComposerOpen(false); }}
     onClose={() => setComposerOpen(false)} />
```

- `+` header button: drop `aria-label={s("dashboard.sticky_notes")}` → `aria-label` from local STR `add_sticky` (more accurate than reusing the title key), add `onClick`. Keeps `data-no-drag`.
- Per-sticky delete `×`: native `<button>` (auto drag-excluded) + `data-no-drag` for belt-and-braces; `aria-label` = `"Delete note: <text>"`.
- The fixture render keeps `n.text[lang]` (bilingual fixture); user render uses `s.text` (string). One `if/else` branch — covered by tests.

---

## 6. Planner's Calls — decisions + justification (5 items)

### Q1 — Delete sticky: IN SCOPE (CREATE + DELETE)

**Decision: INCLUDE delete in v1.** Carve-out §2 explicitly flagged delete as a "STRONGER case than tasks/matrix" because notes pile up and a create-only sticky board is a poor v1. Concretely:
- Delete is **cheap** here: `deleteSticky(store, id)` is a 4-line pure key-omit (verbatim `deleteEvent`, calendar eventStore.ts:69-79); the UI is one `×` button per sticky.
- A sticky you can create but never remove is actively worse than the current fixture (the fixture at least doesn't grow).
- Scope stays small: **create + delete only. NO edit, NO reorder, NO pin.** Edit is deferred (Q-defer below).

This DIVERGES from the Matrix plan (which deferred delete) — justified because (a) the sticky domain's value collapses without delete, and (b) the per-sticky `×` is trivial whereas Matrix's card had join-semantics concerns. Flagged for `feature-review` to confirm the create+delete scope (it may still narrow to create-only if it wants the absolute-minimum slice).

### Q2 — Modal vs inline-add: MODAL (native `<dialog>`)

**Decision: native `<dialog>` `StickyComposer`** (Axis E1). Justified §3 Axis E: the widget body is a drag surface (inline textarea = pointer-event hazard), the widget is tiny, and three SHIPPED composers make the dialog a low-risk template. Inline-add deferred; reviewer may override.

### Q3 — i18n: local STR table (NOT plugin-web-tokens)

**Decision: introduce a local `internal/strings.ts` STR table** (`STR_STICKY_COMPOSER` + empty-state hint + delete label), mirroring `xai-web-tasks/src/internal/strings.ts` and `xai-web-calendar/src/internal/strings.ts`.

Justification (the carve-out asked for the lower-churn option):
- The widget already imports `useI18n` from `plugin-web-tokens` for the existing `dashboard.sticky_notes` title — that single existing key is REUSED (no token edit for the header label).
- All NEW strings (composer title, field labels, color names, Save/Cancel/Delete, empty hint, delete aria) go in a **local STR table**. This is the SHIPPED precedent for every composer in the repo (Task/Event/Matrix all use local STR, explicitly to avoid `plugin-web-tokens` churn) and keeps the diff inside the owning package.
- Editing `plugin-web-tokens` would touch a shared cross-package file (sibling-concurrency + parity-test surface) for 8-10 keys that only this composer uses — higher churn, worse locality.

Net: **0 new `plugin-web-tokens` keys; 0 edits to `plugin-web-tokens`.** Lower churn than the tokens path. (The carve-out authorized the tokens path as an exception; this plan declines it in favor of the strictly-lower-churn local-STR path.)

### Q4 — Fixture disposition: merge-as-sample-until-first-user-sticky

**Decision: G1** (Axis G). Empty store → 3 read-only fixture samples + create hint; non-empty → user stickies only; fixtures never persist. Mirrors Calendar Q9/Q10.

### Q5 — Sticky text model: single string

**Decision: B1** (Axis B). `text: string`. Stores exactly what the user typed; renders directly without a `[lang]` index. Bilingual reserved for the canned fixture only.

### Deferred (recorded for reviewer)

- **Edit sticky text** — deferred (carve-out: "lower priority; defer unless cheap"). Not cheap enough to fold in alongside delete without growing the composer to an edit-mode dialog; deferred to a follow-up increment.
- **Drag-reorder / rich text / reminders / pin / sync / IndexedDB** — explicitly out of scope (carve-out §2).
- **Reading `xai_pref_sticky_color` as the composer default** — deferred; v1 default is hard-coded `sun`.

---

## 7. Phase plan (4 phases, mirroring Calendar's store-from-scratch shape)

| Phase | Scope | Cross-vendor |
|---|---|---|
| **SP1 — data layer + registry** | `internal/stickiesStore/{types.ts, ids.ts, stickiesStore.ts, useStickies.ts}` (pure CRUD create/delete/list + `useStickies` hook + `createStickyId`) + `UserSticky`/`StickyColor`/`NewStickyDraft` types + `STICKY_COLORS` palette. **Edit** `plugin-web-storage` registry.ts (add `xai_dashboard_stickies`) + 2 parity arrays + new `AC-REGISTRY-STICKIES-1/2` test. Unit tests for store + ids. | no (data layer) |
| **SP2 — StickyComposer** | `StickyComposer.tsx` native `<dialog>` (textarea + 5-preset color radiogroup + Save/Cancel; ESC/backdrop/autofocus/a11y) + `internal/strings.ts` (`STR_STICKY_COMPOSER` + empty hint + delete label) + composer CSS appended to `styles.css`. RTL coverage (open/close/save/validation/a11y + bilingual). | same-vendor smoke |
| **SP3 — wire + render + persist** | Wire StickiesWidget `+` onClick → composer; render user stickies (single-string text + preset color) with per-sticky `×` delete; fixture-as-sample-until-first disposition; persistence round-trip. Integration: create→persist→refresh; delete→persist→refresh. | smoke recommended |
| **SP4 — docs + barrel + final** | Final docs sync (design/api/test/dev_log) + any barrel export decision (likely NONE — `StickyComposer` stays internal; public surface remains `dashboardWidgetRegistrations` only) + index-barrel test still asserts the single export + full suite green + cross-vendor cold-read OR formal ADR-0008 §S3 deferral. Flip to READY_FOR_VERIFY. | **Codex cold-read OR formal defer** |

Reviewer may compress SP4 into SP3 if the barrel surface truly does not change (likely). Kept separate by default to match Calendar's 4-phase cadence and isolate the docs/verify gate.

### Public surface note

`src/index.ts` currently exports ONLY `dashboardWidgetRegistrations` (api.md §S1, asserted by `index-barrel.test.ts`). This plan **keeps that surface unchanged** — `StickyComposer`, `useStickies`, the store, and `UserSticky` all stay internal. The barrel test must continue to pass with the single export. (If the reviewer wants `UserSticky` exported for a future consumer, that is an additive barrel change + a barrel-test update — but no current consumer needs it, so default = keep internal.)

---

## 8. Risks + open questions

| ID | Risk | Mitigation | Phase |
|---|---|---|---|
| RS1 | Registry parity tests fail because new key not added to BOTH enumerated arrays (`registry.test.ts:230` + `parity-design-md.test.ts:165`) | SP1 adds to both + new entry-shape test; AC-REG-8 count auto-derives | SP1 |
| RS2 | `parity-design-md` expects key in DESIGN.md §9.2 | Follow calendar precedent: key goes in the exclusion list (owner-row addition), NOT §9.2. Flagged for reviewer to confirm no DESIGN.md edit. | SP1 |
| RS3 | Inline `<textarea>` vs drag conflict (if reviewer overrides to inline) | Default is modal (dialog renders in top layer, no drag surface). If inline chosen, `data-no-drag` on the textarea + `e.stopPropagation` on pointerdown. | SP2 |
| RS4 | Fixture vs user render branch leaks bilingual indexer onto user sticky (`s.text[lang]` crash — string has no `.en`) | Explicit `if (list.length === 0)` branch; types enforce `UserSticky.text: string` vs `StickyFixture.text: {en,zh}`; covered by a render test in each branch | SP3 |
| RS5 | Composer state survives grid re-render? (grid calls `render(ctx)` each tick) | `StickiesWidget` is a stable component instance across re-renders (same as ClockWidget's `usePref`); `useState` persists. Covered by a "composer stays open across a ctx.now tick" test. | SP3 |
| RS6 | Delete of a fixture sample (samples are read-only) | Samples render WITHOUT a delete button (only user stickies get `×`); covered by a test asserting fixture-sample rows have no `.sticky-del`. | SP3 |
| RS7 | `xai_dashboard_stickies` clobbered by chassis `resetAllPrefs()` `xai_` filter | Intended — reset SHOULD clear user stickies (same as `xai_calendar_events`). Documented, not a bug. | SP1 |
| RS8 | New CSS class collision in `styles.css` | New classes namespaced `.sticky-composer*` + `.sticky-del` + `.sticky--sample`; grep-check no redefinition of `.sticky` base (keep base, add modifiers). | SP2 |

### Open questions for feature-review

- **OQ1 (Q1 scope)**: Confirm CREATE + DELETE for v1 (plan recommends include-delete). Could narrow to create-only.
- **OQ2 (Q2 modal)**: Confirm native `<dialog>` over inline-add. Reviewer may prefer inline for the sticky domain.
- **OQ3 (RS2)**: Confirm exclusion-list-only registry parity (no DESIGN.md §9.2 edit), per calendar precedent.
- **OQ4 (SP3/SP4)**: Confirm 4-phase vs compressing to 3 (SP4→SP3 fold if barrel unchanged).
- **OQ5 (barrel)**: Confirm public surface stays `dashboardWidgetRegistrations`-only (no `UserSticky` export).

---

## 9. References

- P0 carve-out: `docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md` (commit `baaf3e1`)
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Audit trigger: `docs/reviews/_web-noop-audit/20260527-button-action-inventory.md` Top-10 #6 / D-21
- Closest blueprint (store-from-scratch): `packages/xai-web-calendar/src/internal/eventStore/{eventStore,ids,useUserCalEvents}.ts` + `packages/xai-web-calendar/src/EventComposer.tsx` + registry.ts:931-950 (`xai_calendar_events`)
- Composer templates: `packages/xai-web-tasks/src/TaskComposer.tsx`, `packages/xai-web-matrix/src/MatrixComposer.tsx`, `packages/xai-web-calendar/src/EventComposer.tsx`
- Local-STR precedent: `packages/xai-web-calendar/src/internal/strings.ts`, `packages/xai-web-tasks/src/internal/strings.ts`
- SHIPPED baseline being extended: `packages/xai-web-dashboard-widgets/docs/{design,api,test,dev_log}.md` + `src/widgets/StickiesWidget.tsx` + `src/internal/fixtures.ts`
- Registry parity tests to update: `packages/plugin-web-storage/src/__tests__/registry.test.ts` + `parity-design-md.test.ts`
- Workflow: `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0008 §S3 cross-vendor deferral: `docs/adr/0008-cloudflare-pages-deploy-recipe.md`
