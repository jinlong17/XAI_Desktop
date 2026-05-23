# Discovery Review — xai-web-countdown

> Date: 2026-05-23
> Author: feature-plan (dispatched by xai-roadmap-loop · W2 Parallel-Agent mode)
> Seed brief: `docs/reviews/xai-web-countdown/20260523-roadmap-seed.md`
> Manifest row: `docs/workflow/roadmap/xai-web-console.md` row #17 (W2 · Module)
> ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map row `module-countdown.jsx` → `packages/plugin-web-countdown/`) + §S5 (JSX→TSX rules) + §S7 (event bus rules) + §S8 (`xai_countdowns` proposed key)
> Verify Cross-vendor: **yes** (per seed brief — countdown grid + add/edit/delete modal + image-variant background gradients must render identically in Chrome / Safari 17+ / Firefox latest)
> Concurrent siblings (W2 parallel): #13 xai-web-matrix · #19 xai-web-pet — **independent**, no shared files (write scope: `packages/xai-web-countdown/` + `docs/reviews/xai-web-countdown/` only).

---

## 1. Problem Framing

The Countdown module is a leaf-position W2 row. Its job is to port one prototype file (`web design/module-countdown.jsx`, 67 LOC) into a typed, build-clean, persistence-real Vite+React 19 module that registers into the shell's slot registry.

Three W1 packages are SHIPPED (`READY_TO_SHIP` per `xai-web-console.md` rows #2/#3/#4/#5) and constitute the primitives this row consumes:

| Primitive | Shipped W1 package | Surface used by countdown |
|---|---|---|
| Tokens + i18n + apply* helpers | `@repo/plugin-web-tokens` | `useI18n(lang)` for `countdown.title` / `countdown.days_until` / `countdown.days_since` / `common.cancel` / `common.save` / `common.delete` (re-use existing keys; no new bundle entries required for v1) |
| Typed localStorage persistence | `@repo/plugin-web-storage` | `usePref("xai_countdowns")` returns `[Countdown[], setter]`; registry entry already declared as `proposed: true` with `default: []` |
| Typed cross-module event bus | `@repo/xai-web-event-bus` | EventMap currently has no `web:countdown:*` channels — discovery decides whether to add any |
| Module slot registry | `@repo/xai-web-shell` | `WebModuleSlotRegistration` — host's `apps/web/src/routes/modules/shellRegistrations.tsx` currently has a `placeholder("countdown", ...)`; this row swaps the placeholder for the real route |

The seed brief sets a small but interlocking decision surface:

1. **Card schema shape** — `{id, title:{en,zh}, target_date, variant, cover_url|null}` — the ADR §S8 registry currently declares `Countdown = unknown`. We must lock the concrete type inside `@repo/plugin-web-countdown` without mutating `@repo/plugin-web-storage` (out of scope).
2. **Direction handling** — prototype's MOCK shows both `until` (countdown) and `since` (count-up); seed brief only mentions "remaining-days countdown" but the existing MOCK and i18n keys carry both. We must decide whether v1 ships count-up too.
3. **Variant model** — prototype mixes `tone:"light"|"dark"`, free-form `bg:` gradient, optional `color`, and id-keyed emoji. Seed brief consolidates to a 2-variant model (`image-background` + `light-background`) with `cover_url|null`. We must define the visual mapping precisely.
4. **Live remaining-days** — "computed from current local date". We must decide between (a) compute once at mount, (b) recompute on visibility change / hook re-render, (c) midnight rollover via setTimeout. The seed brief's "updates daily" is the acceptance signal.
5. **Cross-module events** — Are `web:countdown:*` events worth declaring in W1? Statistics (#20) and Settings (#23) are the potential subscribers; both are downstream and unbuilt. ADR §S7 is permissive but not prescriptive.
6. **Add/Edit/Delete UX surface** — prototype's `AddCountdownCard` is a no-op stub. The acceptance signal requires real add/edit/delete. We must choose between (a) modal dialog, (b) inline form, (c) right-side drawer.
7. **Image placeholders** — seed brief defers user-upload to §13 Future and permits "placeholder images". Source of placeholders must be decided (bundled gradients vs. canned CSS gradients vs. SVG seeds).

This row also has to avoid touching files owned by sibling rows (#13 matrix, #19 pet) currently planning in parallel. The shell registrations file (`apps/web/src/routes/modules/shellRegistrations.tsx`) and ADR-declared EventMap (`packages/core/src/types/events.ts`) are both touched by multiple W2 rows — the **build phase**, not this plan, decides how to coordinate. This discovery records what would be touched and tags it for `feature-build` to handle defensively.

---

## 2. Candidate Options (Module Mount + Schema + Live-Days)

### 2.1 Module mount

The shell already chose Option C (slot/registry + URL routing) per row #5's discovery. This row has no choice here — it must produce a `WebModuleSlotRegistration` whose `children` mount the Countdown component. No further analysis needed; the mechanism is settled.

### 2.2 Card schema — three variants of the seed-brief skeleton

The seed brief gives `{id, title:{en,zh}, target_date, variant, cover_url|null}`. Three concrete encodings considered:

#### Option S-A — `target_date: string` (ISO `YYYY-MM-DD`) + computed `kind`

```ts
type CountdownCard = {
  id: string;
  title: { en: string; zh: string };
  target_date: string;          // ISO 8601 calendar date — "2026-10-01"
  variant: "image" | "light";   // image-background | light-background
  cover_url: string | null;     // null for "light", URL/data-URI for "image"
};
type CountdownDisplay =
  | { kind: "until"; days: number; label: string /* localized date */ }
  | { kind: "since"; days: number; label: string };
```

`kind` derives at render time from `Date.now() < new Date(target_date)`. Same field carries past/future targets — count-up emerges naturally.

**Pros**
- Single source of truth for the target moment.
- Past anniversaries (prototype's `Using XAI / 2/20/20`) and future events both fit `target_date`.
- `Date.parse("YYYY-MM-DD")` is well-defined in all 3 target browsers; no timezone surprises in ISO 8601 calendar-date form (parsed as UTC midnight, then we normalize to user-local via `floor((target_local - today_local) / 86400000)`).
- Tightest JSON shape — straight to localStorage with no codec extension.

**Cons**
- Display label "5/23" vs "10/1" vs "2/6 正月初一" (prototype's compound CJK lunar label) must be re-derived; loses the prototype's hand-crafted compound strings.
- Year ambiguity if input form omits year (prototype's `5/23` is implicitly current-year).

**Verdict:** SELECTED — see §3.

#### Option S-B — Discriminated union: `{kind: "until" | "since", target: string}`

```ts
type CountdownCard =
  | { id; title; kind: "until"; target_date: string; variant; cover_url }
  | { id; title; kind: "since"; target_date: string; variant; cover_url };
```

**Pros**
- Explicit intent; UI doesn't have to flip dynamically when target crosses today.

**Cons**
- Past-but-not-yet-passed targets become awkward (an "until" card whose date is yesterday goes negative; a "since" card whose date is tomorrow is a contradiction).
- Two extra union variants in storage; migration when `kind` flips becomes a user-facing surprise ("you didn't change anything but the counter switched").

**Verdict:** REJECTED. Auto-flip behavior in Option S-A is correct semantically and removes a degree of freedom from the form UI.

#### Option S-C — Two timestamps `start_date` + `target_date`

For "Using XAI" style elapsed-since, store the anchor date and (optionally) an end date.

**Pros**
- Could represent "from X until Y" durations.

**Cons**
- Seed brief doesn't ask for ranges; the prototype's MOCK has only a single date per card.
- Schema bloat unmotivated by current acceptance signal.

**Verdict:** REJECTED.

### 2.3 Live remaining-days strategy

Computing `days = floor((targetMidnightLocal - todayMidnightLocal) / 86400000)`:

#### Option D-A — Compute once at mount (status quo of prototype)

`const days = computeDays(card.target_date)` inside the component body, no effect.

**Pros**
- Simplest; matches prototype semantics.

**Cons**
- Fails the "updates daily" acceptance signal: if the SPA stays open across midnight, the card still shows yesterday's number.

**Verdict:** Insufficient — fails acceptance.

#### Option D-B — Recompute on `visibilitychange` event

When the browser tab becomes visible, recompute. Plus initial compute.

**Pros**
- Cheap; one global event listener.
- Catches the common case (user closes laptop, opens next morning).

**Cons**
- Doesn't catch midnight rollover *while* the tab is open and visible — a SPA left open over midnight stays stale.

**Verdict:** Partial fit; combine with D-C.

#### Option D-C — `setTimeout` until next local midnight + recompute (selected)

On mount: schedule `setTimeout(() => recompute(), msUntilLocalMidnight + 1000)`. On callback: recompute, reschedule for next 24h. On unmount: clear timeout.

**Pros**
- Deterministic across midnight rollover; no polling.
- Single timer for the whole module covers all cards.
- Combined with D-B: covers both the "tab open all night" and "tab closed overnight" cases.

**Cons**
- Edge case: system clock changes (DST, manual time change) require recompute. We rely on `visibilitychange` to absorb DST since DST happens at ~3am when most users are away.

**Verdict:** SELECTED. Combine D-B + D-C.

### 2.4 Cross-module events

Three potential `web:countdown:*` channels:

| Channel | Payload | Subscriber candidate | Necessity for v1 |
|---|---|---|---|
| `web:countdown:created` | `{id, title, target_date, variant}` | Dashboard widgets (could surface upcoming) | NO — Dashboard #10/#11 not shipped; statistics #20 doesn't need create events |
| `web:countdown:reached` | `{id, title, target_date}` | Notifications | NO — `web-notifications` not in this roadmap; deferred to §13 Future |
| `web:countdown:deleted` | `{id}` | Dashboard widgets, statistics | NO — same as above |

**Decision:** No `web:countdown:*` channels declared in v1. The ADR §S7 contract (`web:<module>:<verb>-<noun>`) is reserved as a possibility for a future row; no downstream consumer exists today and ADR §S4 forbids editing `packages/core/src/types/events.ts` outside the owning row's needs.

This keeps the v1 build small and avoids contention with sibling rows (#13/#19) which similarly are not emitting `web:*` events in v1.

### 2.5 Add/Edit/Delete UX surface

#### Option U-A — Modal dialog overlaid on grid (selected)

Click the placeholder "Add Countdown" card → modal opens with form (title EN + ZH, target date, variant radio, cover URL when variant=image). "Save" persists to `usePref("xai_countdowns")`. Edit: click on an existing card → same modal pre-filled. Delete: trash icon inside edit modal.

**Pros**
- Single component handles both create and edit paths (one source of truth).
- Modal pattern is consistent with how Settings dialogs work (DESIGN.md §4.12).
- Reachable from existing AddCountdownCard slot in the prototype — no rail changes.

**Cons**
- Requires a portal/backdrop. We use native `<dialog>` with `showModal()` for accessible focus-trap (supported in all 3 target browsers since 2022).

**Verdict:** SELECTED.

#### Option U-B — Inline form inside the card

Card flips to edit mode on click.

**Pros**
- Smaller surface; no modal.

**Cons**
- Form crowds the card visually; the prototype's cards are only 120px tall.
- Doesn't fit the "Add" affordance (where does the new card appear before save?).

**Verdict:** REJECTED.

#### Option U-C — Right-side drawer

**Pros**
- Generous form real-estate.

**Cons**
- Drawer pattern not established elsewhere in the prototype; would set a precedent before Settings ships (Settings #21 owns the drawer/panel pattern).

**Verdict:** REJECTED to avoid usurping Settings's UX precedent.

### 2.6 Image placeholders

Per seed brief: user-upload deferred. Three sources for `cover_url`:

#### Option I-A — Curated set of bundled CSS gradients shipped with the package (selected)

Define `IMAGE_PRESETS: { id, label_en, label_zh, gradient: string }[]` inside `@repo/plugin-web-countdown`. The variant=image picker is a one-of-N choice; the persisted `cover_url` stores the preset id (e.g. `"preset:dusk"`) NOT a URL. The card renders `background: <gradient>` keyed by the preset id.

**Pros**
- Zero network. Zero asset pipeline. Zero binary assets in the repo.
- Maps cleanly to the prototype's MOCK which already uses linear-gradient strings.
- Cover_url field can later evolve to an actual URL when §13 Future lands user-upload — the preset prefix lets us discriminate.

**Cons**
- "Cover_url" is now a misnomer for the preset case. We address by treating it as an opaque string and documenting both formats in api.md.

**Verdict:** SELECTED.

#### Option I-B — Static image files bundled under `packages/plugin-web-countdown/src/assets/`

**Pros**
- Real photographic textures possible.

**Cons**
- Adds binary assets. Cross-vendor source-map / Sentry concerns about asset URLs. No acceptance signal asks for photos.

**Verdict:** REJECTED for v1.

#### Option I-C — External URLs (e.g. Unsplash)

**Cons**
- Network dependency violates DESIGN.md §2 "local-first" rule.
- CSP nonces complicate it.

**Verdict:** REJECTED.

---

## 3. Recommendation

**Selected stack:**

- **Schema:** Option S-A — single `target_date: string` (ISO `YYYY-MM-DD`), `variant: "image" | "light"`, `cover_url: string | null`. Direction (until/since) derived at render time.
- **Live days:** Option D-B + Option D-C combined — on-mount compute, midnight `setTimeout`, plus `visibilitychange` listener.
- **Events:** No `web:countdown:*` channels in v1.
- **UX:** Option U-A — native `<dialog>` modal for create + edit + delete.
- **Images:** Option I-A — bundled CSS gradient presets, persisted as `"preset:<id>"`.

**Why this combination:**

1. Smallest reviewable diff (one module package, four components, two hooks, one preset table).
2. Stays inside the row's write scope — no edits to `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`, or `@repo/core` source files.
3. Honors the seed-brief schema fields exactly; tightens the existing `Countdown = unknown` placeholder via local `CountdownCard` type without breaking the registry contract.
4. The acceptance signals (add/edit/delete works · both variants render · days update daily · persistence round-trips) each have one clean test path.

---

## 4. Risks & Open Questions

### R1 — Registry type widening surface (`@repo/plugin-web-storage`)

The registry declares `Countdown = unknown` for the `xai_countdowns` entry. Our v1 keeps that intentionally — `usePref("xai_countdowns")` returns `unknown[]`. Inside our package we cast at the boundary via `CountdownCard[] = (raw as CountdownCard[])` and validate shape on read. **Mitigation:** add a tiny `isCountdownCard(x: unknown): x is CountdownCard` predicate in our internal `validate.ts`. If a stored entry fails the predicate (post-migration or hand-edited localStorage), it's filtered out with a DEV console warn. **Open question:** should the persistence-contract row (#3) eventually narrow `Countdown` to our shape? Out of scope for this row; recorded as a future row.

### R2 — Time zone & DST edge cases

`target_date: "2026-10-01"` parsed via `new Date("2026-10-01")` is UTC midnight. We must compute remaining-days in **user-local** time. The implementation: `const targetLocal = new Date(y, m-1, d)` constructed from the parsed parts, NOT `new Date(target_date)`. **Mitigation:** dedicated `computeDaysUntil(target_date, now)` pure function with explicit test cases covering DST forward + backward + leap day + year-boundary.

### R3 — Modal accessibility on Safari 17

Native `<dialog>` has been broadly supported since Safari 15.4, but `::backdrop` styling differed historically. **Mitigation:** the modal uses a plain semi-opaque scrim div underneath the dialog rather than `::backdrop`. Cross-vendor verify (gate per row) catches this.

### R4 — Concurrent W2 sibling write to `shellRegistrations.tsx`

Rows #13 (matrix), #17 (countdown), #19 (pet) all need to swap their `placeholder(...)` call in `apps/web/src/routes/modules/shellRegistrations.tsx` for a real registration. Three rows planning in parallel may produce three feature-build runs that race on the same file. **Mitigation:** during the build phase, `feature-build` for each row must (a) read the file fresh, (b) edit only its own row's line, (c) leave the others untouched. The phase plan in `dev_log.md` explicitly calls this out. **Open question for the orchestrator:** if all three siblings reach P3 simultaneously, who lands first? Decision deferred to `feature-build` — first-mover lands; second mover rebases the single-line edit. No real merge conflict because each row owns a distinct line.

### R5 — i18n bundle coverage

`@repo/plugin-web-tokens/src/i18n.ts` already has:
- EN: `countdown.title`, `countdown.days_until`, `countdown.days_since`
- ZH: `countdown.title`, `countdown.days_until`, `countdown.days_since`

The Add/Edit modal needs new keys: form labels (Title EN, Title ZH, Target date, Variant, Cover preset), buttons (Save/Cancel/Delete), and the placeholder card label. `common.add`/`common.cancel`/`common.save` already exist in the bundle (lines 24, 27 EN; 222, 225 ZH). Missing: `common.delete` (NOT in the existing bundle). **Mitigation:** Option (a) reuse `common.trash` ("Trash" / "回收站") — semantically wrong. Option (b) hard-code the literal in the modal via `lang === "zh" ? "删除" : "Delete"` — matches the prototype's `<AddCountdownCard>` pattern ("Add Countdown" / "新建倒计时" hard-coded). **Selected:** Option (b) — bundle extension would touch `@repo/plugin-web-tokens` (out of scope) and the inline ternary stays consistent with prototype style. Recorded in api.md §3 i18n.

### R6 — Cover preset id format collision with future user-upload

If a future row lands user-upload, `cover_url` will hold real URLs. We must distinguish presets ("preset:dusk") from URLs ("https://...") or data-URIs ("data:image/..."). **Mitigation:** the renderer detects: `if cover_url?.startsWith("preset:")` → look up the preset table; else use `cover_url` directly in CSS `background-image: url(...)`. The boundary is robust and well-documented.

### R7 — `setTimeout` accuracy beyond 24 days

`setTimeout(callback, ms)` clamps to `2^31 - 1` ms (~24.8 days). For cards whose `target_date` is more than 24 days away, we only ever schedule the *next midnight* (always < 24h ahead), so we never approach the clamp. Confirmed safe.

### R8 — StrictMode double-mount in dev

React 19 StrictMode runs effects twice in dev. The midnight timer effect must clean up cleanly on each unmount. **Mitigation:** standard `return () => clearTimeout(id)` pattern; covered by the timer unit test.

---

## 5. Web research

No external research required. The feature is purely internal: it composes types from `@repo/plugin-web-tokens` + `@repo/plugin-web-storage` + `@repo/xai-web-shell`, all of which are workspace-internal SHIPPED packages. The browser primitives used (`<dialog>`, `setTimeout`, `visibilitychange`, `Intl.DateTimeFormat`) are all baseline-supported across Chrome 109+ / Safari 17+ / Firefox 110+ — the same matrix declared by ADR-0007 §S5.

---

## 6. References

- Seed brief: `docs/reviews/xai-web-countdown/20260523-roadmap-seed.md`
- ADR-0007: `docs/adr/0007-xai-web-console-build-form.md` (port mapping §S4 row 17, JSX→TSX rules §S5, persistence §S8 line `xai_countdowns proposed`)
- Source: `web design/module-countdown.jsx` (67 LOC, 2193 bytes)
- DESIGN spec: `web design/DESIGN.md` §4.10 (lines 178–182)
- Prototype CSS: `web design/layout.css` lines 950–1019 (cd-card, cd-num, cd-foot, cd-overlay, cd-add styles — ported as-is)
- Prototype mock data: `web design/i18n.js` lines 500–506 (`window.MOCK.countdowns` — used to derive cover preset seed list)
- Persistence registry: `packages/plugin-web-storage/src/internal/registry.ts` lines 311–319 (`xai_countdowns` entry, `proposed: true`, owner `xai-web-countdown`, `default: []`)
- Shell slot type: `packages/xai-web-shell/src/types.ts` lines 57–66 (`WebModuleSlotRegistration`)
- Shell registration array: `apps/web/src/routes/modules/shellRegistrations.tsx` line 53 (`placeholder("countdown", "Countdown", "countdown", 10)` — the line this row eventually replaces)
- i18n existing keys: `packages/plugin-web-tokens/src/i18n.ts` lines 74–78 (EN `countdown.*`) + 268–272 (ZH `countdown.*`)
- Sibling concurrent rows (write-scope respected): `docs/reviews/xai-web-matrix/20260523-roadmap-seed.md`, `docs/reviews/xai-web-pet/20260523-roadmap-seed.md`
