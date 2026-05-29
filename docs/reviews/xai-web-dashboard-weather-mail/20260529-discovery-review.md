# Discovery Review — xai-web-dashboard-weather-mail

- **Date:** 2026-05-29
- **Executor:** claude-opus-4-8 (1M context) — feature-plan
- **Mode:** Fresh (new §G extension on the SHIPPED `@repo/plugin-web-dashboard-widgets` four-pack)
- **Authority:** ADR-0010 §D4 — P0 carve-out `docs/reviews/_p0-carve-outs/20260529-dashboard-weather-mail.md` (commit `43ba6f8`)
- **Branch:** `web` (NOT `dev`)
- **Closest precedents:** Weather manual ≈ §E stickies-create (in-package store + `usePref` + composer/editor); Mail notifications ≈ §F real-data (read-only cross-module aggregation via `usePref` + key string + local predicate, NO plugin import)
- **External research:** **None required.** This is a pure local-data feature — manual-entry store (Weather) + read-only aggregation of pre-existing local stores (Mail). No library decision, no external API, no new dep. (A weather/email API would VIOLATE the carve-out's no-new-dep / no-CSP discipline — which is precisely why the operator repurposed both widgets to local sources.)

---

## §0. Problem framing

Two of the SHIPPED 10 dashboard widgets render hardcoded fiction with no local source:

- `WeatherWidget.tsx` → `WEATHER` fixture (`city[lang]` / `temp` / `condition[lang]` / `icon` / `hi` / `lo` / `forecast[5]`).
- `MailWidget.tsx` → `MAILS` fixture (`{id, from, subj[lang], time, unread}`; unread badge = `MAILS.filter(m => m.unread).length`).

Neither can fetch real data without an external API. Per operator decision (carve-out §1), both are **repurposed to REAL LOCAL widgets**:

- **Weather → manual-entry**: the user types their own city + temperature + condition; persisted locally; honest empty state when unset.
- **Mail → local notifications digest**: read-only aggregation of REAL in-app signals (overdue tasks + today's calendar events) rendered as notification rows; honest "all clear" empty state; **NEVER mutates** the task/calendar stores.

This is item-3 cluster **#5** (4 of the local cluster already SHIPPED: stickies-create §E, dashboard-real-data §F, smart-list, statistics-real-aggregation). After #5 only **3e AI** remains (last, largest).

### §0.1 Why this is a §G APPEND, not a new package

The SHIPPED `@repo/plugin-web-dashboard-widgets` package already owns both widget bodies + the §E in-package store pattern (`internal/stickiesStore/` + `useStickies` + `internal/strings.ts` local STR) + the §F read-only cross-module-read pattern (`internal/dataReads/` selectors + predicates over `usePref` keys). **Both Weather and Mail are EXTENSIONS of existing widgets that this package already owns** — Weather mirrors §E (store), Mail mirrors §F (read-only aggregation). A new package would split widget ownership. So §G appends to the four-pack, preserving the SHIPPED row #11 + §E + §F lineage verbatim.

### §0.2 Two natural phases = two independent widget transforms

Weather (manual store, WRITE) and Mail (read-only aggregation, READ) share NO code and NO store. They are 2 independent transforms → **2 natural phases** (Phase A Weather / Phase B Mail). This mirrors §F's "group by store-backed concern" rationale.

---

## §1. Cross-module-read law (re-confirmed for Mail) + write law (re-confirmed for Weather)

The repo has a SHIPPED, twice-reviewed cross-module-read law (Statistics api.md §0 "usePref only — NO direct imports of plugin-web-{tasks,pomodoro,habits} internals"; §F real-data; Cmd-K adapters):

> A widget reads another module's data by `usePref("<key>")` + a LOCAL narrowing predicate over the registry-default `unknown`. It NEVER imports the owning plugin package, NEVER reaches into `plugin-*/src/internal/`, and (for read-only consumers) NEVER calls the `usePref` setter.

**Mail obeys the READ law** (read-only aggregation; the setter tuple member is never called). **Weather obeys the WRITE law for its OWN key only** (`xai_dashboard_weather`, owner = this package — same as §E stickies owning `xai_dashboard_stickies`). Weather NEVER writes a foreign key.

---

## §2. Recon — current widget source (read end-to-end)

### §2.1 WeatherWidget (`src/widgets/WeatherWidget.tsx`)

```tsx
export function WeatherWidget({ lang }: { lang: Lang }) {
  const { s } = useI18n(lang);
  return (
    <div className="widget-content w-weather-body">
      <div className="ww-head"><span>{s("dashboard.weather")} · {WEATHER.city[lang]}</span></div>
      <div className="ww-now">
        <div className="ww-temp mono">{WEATHER.temp}°</div>
        <div className="ww-info">
          <Icon name={WEATHER.icon} size={28} ... />
          <div><div className="ww-cond">{WEATHER.condition[lang]}</div>
               <div className="ww-hilo mono">{WEATHER.hi}° / {WEATHER.lo}°</div></div>
        </div>
      </div>
      <div className="ww-forecast">{WEATHER.forecast.map(...5 days...)}</div>
    </div>
  );
}
```

CSS classes in play: `.w-weather-body`, `.ww-head`, `.ww-now`, `.ww-temp`, `.ww-info`, `.ww-cond`, `.ww-hilo`, `.ww-forecast`, `.wwf-day`, `.wwf-d`, `.wwf-t`. `WEATHER.icon` is one of `"sun" | "cloud" | "rain"` (the only weather icons in `Icon.tsx`).

### §2.2 MailWidget (`src/widgets/MailWidget.tsx`)

```tsx
export function MailWidget({ lang }: { lang: Lang }) {
  const { s } = useI18n(lang);
  const unreadCount = MAILS.filter((m) => m.unread).length;
  return (
    <div className="widget-content w-mail-body">
      <div className="wgt-h"><Icon name="mail" size={14} /><span>{s("dashboard.mail")}</span>
        <span className="grow" /><span className="mail-badge" data-mail-badge>{unreadCount}</span></div>
      <ul className="mail-list">{MAILS.map((m) => (
        <li className={"mail-row" + (m.unread ? " unread" : "")} data-mail-id={m.id}>
          {m.unread && <span className="mail-dot" />}
          <div className="mail-body"><div className="mail-from">{m.from}</div><div className="mail-subj">{m.subj[lang]}</div></div>
          <div className="mail-time mono">{m.time}</div>
        </li>))}</ul>
    </div>
  );
}
```

CSS classes in play: `.w-mail-body`, `.wgt-h`, `.grow`, `.mail-badge` (`data-mail-badge`), `.mail-list`, `.mail-row`, `.unread`, `.mail-dot`, `.mail-body`, `.mail-from`, `.mail-subj`, `.mail-time`. **No interactive children** (no `data-no-drag` needed today — read-only stays that way for the notifications digest; no buttons).

### §2.3 registrations.tsx — current entry wiring (the 10-entry array)

```tsx
{ id: "weather", span: "w-weather", ariaLabel: { en: "Weather widget", zh: "天气组件" },
  render: (ctx) => <WeatherWidget lang={ctx.lang} /> },
...
{ id: "mail", span: "w-mail", ariaLabel: { en: "Inbox", zh: "收件箱" },
  render: (ctx) => <MailWidget lang={ctx.lang} /> },
```

Both entries pass only `lang`. **Mail needs `now`** (to compute "today" + "overdue"); like §F's Upcoming, this is a 1-line additive `now={ctx.now}` thread (`ctx.now` already available — used by clock/mini-cal/timezones). **NOT a `WidgetRenderContext` change** (row #10's type stays frozen). Weather does NOT need `now` (manual values, no time math). Ids/spans/ariaLabels stay byte-stable.

---

## §3. Recon — data sources (read end-to-end against owner canonical types)

### §3.1 Weather store — NEW key `xai_dashboard_weather` (owned by this package)

No existing key holds manual weather. The carve-out **AUTHORIZES one additive registry key** `xai_dashboard_weather` (codec json, default `null`/empty, owner `xai-web-dashboard-widgets`, schemaVersion 1, category module). Byte-parallel to the §E `xai_dashboard_stickies` entry (registry.ts:959) — same owner, same additive-authorized pattern.

**Singleton, not a record.** Unlike stickies (a `Record<id, UserSticky>` of many notes), weather is ONE current-conditions object. So the store shape is a single object or `null` (unset → honest empty state). Default = `null` (the carve-out says "default null/empty"); a `null` read = honest "set your weather" empty state.

### §3.2 Mail signal source #1 — overdue tasks (`xai_task_cols`, read-only)

Verified owner `TaskCol` (`packages/xai-web-tasks/src/types.ts:67-80`):
- `BucketId = "overdue" | "next7" | "later" | "nodate"` (line 17).
- `TaskCol = { id: BucketId; key; count; tasks: ReadonlyArray<TaskCard>; completed?: ReadonlyArray<TaskCard> }`.
- `TaskCard = { id; title: TaskTitleBundle; sub?; tag?; date?; dateZh?; dateLabel?; inbox?; done?: boolean }` — `title` is bilingual `{en, zh}`; `done?` absent === false (T-10).

**Mail's overdue signal** = cards in the **`overdue` bucket's `tasks`** (+ `completed?`) with `done !== true`, labelled by `title[lang]`. The store is keyed by `BucketId`: `store["overdue"].tasks`. **This is exactly the bucket the Tasks "today" smart-list shows** (verified `xai-web-tasks/src/internal/strings.ts:22,46-49`: "today → shows the **overdue** bucket (past-due / needs-attention-now)"; empty copy "No overdue tasks").

**§F already built `isTaskColsRecord`** (`internal/dataReads/isTaskColsRecord.ts`) narrowing `xai_task_cols` → `Record<string, {tasks; completed?}>`, but its `TaskCardMinimal` only narrows `done?` (it powers `countDone` which flattens ALL buckets). Mail needs (a) the **`overdue` bucket specifically** and (b) the card **`title`**. So §G adds a NEW selector (`overdueTasks`) + WIDENS the narrowed card shape to include `title: {en; zh}`. **Reuse vs new:** reuse the `isTaskColsRecord` predicate's bucket-shape narrowing concept, but a dedicated `notifications` selector is cleaner than overloading `taskStats.countDone` (which is frozen by §F's StatTasks ACs). See §6 Q-Mail-source.

### §3.3 Mail signal source #2 — today's calendar events (`xai_calendar_events`, read-only)

Verified owner `UserCalEvent` via §F's `isUserCalEventMap` (`internal/dataReads/isUserCalEventMap.ts`) + calendar `eventStore/types.ts`:
- `xai_calendar_events` = `Record<string, UserCalEvent>` (id-keyed; default `{}`).
- `UserCalEvent.startISO` = `"YYYY-MM-DDTHH:MM"` **LOCAL-clock, no TZ suffix**; `title: string`; `colorPreset`; `recurrence: {kind: "daily"|"weekly"} | null`.

**Mail's today signal** = events whose `startISO` date-prefix === today's LOCAL date key (`YYYY-MM-DD`), INCLUDING recurring instances that land on today. Label = `title` + time (`startISO` HH:MM suffix).

**§F already built the reusable read layer** for this exact key:
- `listValidCalEvents(store)` (`isUserCalEventMap.ts`) — narrows + drops non-conforming, returns `UserCalEventMin[]`.
- `monthDots(store, viewYear, viewMonth)` (`calMonthDots.ts`) + `upcomingEvents(store, now, days, max)` (`calUpcoming.ts`) — both already expand recurrence (non-recurring + daily + weekly) with the owner's "advance-date-prefix, keep-HH:MM, UTC-noon window math" semantics.

**Reuse decision (confirmed):** §G's Mail "today's events" selector REUSES `listValidCalEvents` (the predicate + list helper are already the package's internal read surface). For recurrence-into-today, the cleanest reuse is `upcomingEvents(store, todayStart, 1, large)` filtered to today's date-prefix, OR a dedicated `eventsOnDay(store, dayKey)` that mirrors `calMonthDots`'s single-day expansion. The recurrence math is already factored in `calUpcoming`/`calMonthDots` as private file-local helpers (NOT exported). See §6 Q-Mail-source for the reuse-vs-new-selector call.

### §3.4 Mail signal source #3 (candidate) — expiring countdowns (`xai_countdowns`) — DEFERRED

A countdown store **DOES exist**: `xai_countdowns` (registry.ts:358-366; owner `xai-web-countdown`; default `[]`; `proposed: true`; type `Countdown = unknown` — opaque). The owning plugin `@repo/plugin-web-countdown` is SHIPPED/Stable (PLUGIN_MAP row #17). **But:** the registry type is `unknown` (no canonical shape declared at the registry; the real shape lives in the countdown plugin's internal types). Reading it read-only would require recon of the countdown plugin's internal `Countdown` shape + a new local predicate.

**Planner's call (Q-Mail-countdown): DEFER countdowns from v1.** Rationale:
1. The carve-out §2 explicitly marks countdowns as **"Planner's call: … IF it exists + is trivial; else defer."** It exists but the read is NOT trivial (opaque `unknown` registry type → must recon the plugin's internal shape + build a 3rd predicate + decide "expiring" window semantics).
2. The 2 named signals (overdue tasks + today's events) fully satisfy the carve-out §5 acceptance anchor ("overdue tasks + today's events as notification rows").
3. Adding a 3rd source widens Phase B's surface for marginal value; a future increment can add it (the notifications selector is designed source-additive — see §4 Mail shape).

**This is flagged for `feature-review` override (OQ-Mail-2).** If the reviewer wants countdowns in v1, Phase B gains a `xai_countdowns` predicate + `expiringCountdowns` selector + an additive signal-type. (Not recommended for v1.)

---

## §4. Planner's-calls (carve-out §2 hands the planner 4) + decisions

### Q1 — Weather editor: inline-edit vs small `<dialog>`; keep hi/lo + manual forecast?

**Decision: native `<dialog>` editor (`WeatherEditor`), current-conditions only (drop the 5-day forecast), KEEP optional hi/lo.**

| Option | Verdict |
|---|---|
| **A. Native `<dialog>` `WeatherEditor`** (mirror §E `StickyComposer` / calendar `EventComposer`) | **CHOSEN** — the widget body is a drag surface (row #10's whole-shell `pointerdown` drag); an inline-edit form on the body fights the drag pipeline (would need `data-no-drag` on every field + risks pointer leaks — exactly the R4 hazard WorldClocks/MiniCal mitigate). A `<dialog>` renders in the top layer, OUTSIDE the drag surface — the SHIPPED §E pattern, proven across `StickyComposer`/`TaskComposer`/`EventComposer`/`MatrixComposer`. |
| B. Inline edit on the widget body | Rejected — drag-surface conflict; more `data-no-drag` plumbing; no top-layer isolation. |
| C. Inline "edit mode" toggle (swap body → form in place) | Rejected — same drag-surface issue + a stateful body that fights the grid 1Hz `render(ctx)` tick. |

**Forecast: DROP the 5-day forecast (current conditions only).** The carve-out §2 default + reasoning: a user cannot realistically hand-maintain 5 future days. v1 = current city + temp + condition (+ optional hi/lo). The `WEATHER` fixture's `forecast` array is KEPT as an export (back-compat + `fixtures.test.ts` stays green per the §F RD9 precedent) but the live path stops rendering it.

**hi/lo: KEEP as OPTIONAL fields.** They are trivially user-typeable (today's high/low) and the SHIPPED `.ww-hilo` CSS already renders them. The editor offers optional hi/lo number inputs; if unset, the `.ww-hilo` row is omitted (honest — no "—/—" fiction).

### Q2 — condition: preset enum mapped to existing `Icon` name

**Decision: a closed `WeatherCondition` preset enum, each mapped to an EXISTING `Icon` name + a bilingual local-STR label. NO new icons added in v1.**

The `Icon.tsx` library has exactly **3 weather glyphs**: `sun`, `cloud`, `rain` (IconName union line 28-30). The carve-out says "condition 用 preset enum 映射现有 `Icon` name." So:

```
WeatherCondition         → Icon name   → STR label (en / zh)
"sunny"                  → "sun"       → Sunny / 晴
"cloudy"                 → "cloud"     → Cloudy / 多云
"rainy"                  → "rain"      → Rainy / 雨
```

**3-preset closed enum** (sunny/cloudy/rainy) — each maps 1:1 to an existing icon. This is the minimal honest set that needs zero `Icon.tsx` edit. A wider enum (snowy/windy/foggy/etc.) would require either (a) adding new icons to `Icon.tsx` (a larger, exhaustiveness-guarded edit — the `IconName` union has a `never`-check default branch) or (b) mapping multiple conditions onto the same 3 icons (misleading: "snowy" → cloud icon is a lie). **v1 = 3 presets, 3 icons, zero icon edit.** Flagged for reviewer (OQ-Weather-1): if a 4th/5th condition is wanted, Phase A adds the corresponding icon(s) to `Icon.tsx`'s union + switch + exhaustiveness guard (a known, additive edit). Default condition for a new entry = `"sunny"`.

### Q3 — i18n: local STR vs existing token key

**Decision: existing `dashboard.weather` / `dashboard.mail` token keys stay for the widget TITLE (via `useI18n`); ALL new copy (editor fields, condition labels, signal labels, empty states) = LOCAL STR in `internal/strings.ts`. ZERO `plugin-web-tokens` edit.**

This mirrors §E (Q3 — `STR_STICKY_COMPOSER`) + §F (Q-i18n — `STR_WIDGET_EMPTY`) + the carve-out §2 default ("keep existing token keys for the title, add any NEW copy via LOCAL STR"). The existing `internal/strings.ts` already has `STR_STICKY_COMPOSER` + `STR_WIDGET_EMPTY` + `str()`/`strEmpty()` accessors. §G adds 2 NEW dedicated tables (NOT stuffing into the existing ones — the §F N2 review note):
- `STR_WEATHER` — editor title, city/temp/condition/hi/lo field labels, 3 condition names, Save/Cancel, empty-state "Set your weather" + edit aria + validation errors.
- `STR_NOTIFICATIONS` — Mail/Notifications widget title-suffix (if any), source-type labels ("Overdue" / "Today"), the honest "All clear / 暂无通知" empty state.

The widget titles `dashboard.weather` ("Weather"/"天气") + `dashboard.mail` ("Mail"/"收件箱") already ship in `plugin-web-tokens` — REUSED. **Mail's title may keep saying "Mail"** (the carve-out leaves the display label open — see Q-Mail-rename); if a "Notifications" label is wanted, it comes from `STR_NOTIFICATIONS` LOCAL (no token edit), not by editing `dashboard.mail`.

### Q4 — Mail signal shape (each row: label + source-type + time/relative; badge = signal count)

**Decision: a unified `NotificationSignal` discriminated by `sourceType`.**

```ts
type NotificationSourceType = "task-overdue" | "calendar-today";
interface NotificationSignal {
  id: string;            // stable key (e.g. "task:<cardId>" / "event:<eventId>|<startISO>")
  sourceType: NotificationSourceType;
  label: string;         // task title[lang] / event title
  time?: string;         // event "HH:MM"; overdue tasks may carry the card's display date string or omit
  sortKey: string;       // for deterministic ordering (overdue-first, then today by time)
}
```

- The notifications selector returns `NotificationSignal[]` (overdue tasks first, then today's events sorted by time). The widget renders each as a `.mail-row` (REUSING the SHIPPED mail CSS): icon/source-dot + `label` + `time`.
- **Badge = signals.length** (replaces the fixture `unreadCount`).
- **Honest empty state**: `signals.length === 0` → "All clear / 暂无通知" via `STR_NOTIFICATIONS` local STR (NOT a fixture sample — the §F OQ3 honest-empty divergence applies: fake mail rows would re-introduce the fiction this carve-out removes).
- `sourceType` drives a small visual distinction (e.g. a colored source dot or an icon) so the user can tell an overdue-task row from a today-event row. Source-additive: a future `"countdown-expiring"` member slots in without reshaping the row.

### Q-Mail-rename — widget-id rename strategy (stable `mail` id vs clean rename + migration)

**Decision: KEEP the registry/widget id `mail` (stable); change only the DISPLAY label + internal semantics.**

| Option | Verdict |
|---|---|
| **A. Keep id `mail`, repurpose body → notifications** | **CHOSEN** — the widget `id: "mail"` is FROZEN per api.md §S2 ("Adding/removing/renaming any [of the 10 ids] requires an ADR amendment") AND it is the persisted key in `xai_dash_order` (row #10's layout order array). Renaming `mail` → `notifications` would (a) need an ADR amendment and (b) break saved dashboard layouts (the sanitize-on-mount would DROP the unknown `mail` id + APPEND `notifications` at the end — reordering every user's dashboard). Keeping `mail` is zero-migration + zero-ADR. The `ariaLabel` can shift `Inbox`/`收件箱` → `Notifications`/`通知` (additive, not an id change). |
| B. Clean rename `mail` → `notifications` + migration note | Rejected — needs ADR amendment (frozen id) + a `xai_dash_order` migration + breaks layouts. Disproportionate to a body-content change. |

So Phase B keeps `id: "mail"`, `span: "w-mail"`, reuses the `.mail-*` CSS, and only swaps the body data source (fixture → real signals) + the `ariaLabel` + the title label. **Verified safe** against api.md §S2 (frozen ids) + the §F precedent (rewired widget bodies WITHOUT touching ids/spans).

### Q-Mail-source — reuse §F dataReads vs new selectors; max rows

**Decision: ADD a new `internal/dataReads/notifications.ts` selector that REUSES §F's `listValidCalEvents` (calendar) + a NEW `overdueTasks` task reader; max **6** notification rows.**

- **Calendar today's events:** reuse `listValidCalEvents(store)` from §F's `isUserCalEventMap.ts` (already the package's internal calendar read surface) + filter to today's local date-prefix WITH recurrence expansion. The recurrence helpers in `calUpcoming.ts`/`calMonthDots.ts` are file-local (not exported); §G's `eventsOnDay` either (i) calls `upcomingEvents(store, todayMidnight, 1, large)` and filters to today, or (ii) adds a small `eventsOnDay(store, dayKey, now)` mirroring `calMonthDots`'s single-day expansion. Build picks (i) if `upcomingEvents`'s window semantics cleanly yield today's instances; else (ii). Either way NO new recurrence math is invented — it reuses the §F-proven "advance-date-prefix/keep-HH:MM/UTC-noon-window" logic (N3 hygiene).
- **Overdue tasks:** §F's `taskStats.countDone` flattens all buckets + only narrows `done?` — NOT reusable for "the overdue bucket's titled cards." So §G adds `overdueTasks(store, lang)` reading `store["overdue"].tasks` (+ `.completed?`) filtering `done !== true`, returning `{ id, title }`. The card-shape narrow widens §F's `TaskCardMinimal` to include `title: {en; zh}` (additive — does not change `countDone`'s behavior).
- **Max rows = 6** (overdue-first, then today-by-time, capped). The SHIPPED `.mail-list` rendered 4 fixture rows; 6 gives headroom for a real overdue+today mix without overflowing the `w-mail` span. (Reviewer may pick 4/5/8 — OQ-Mail-3.)

### Q-Mail-readonly — confirm Mail NEVER mutates task/calendar stores

**Confirmed.** Mail uses `usePref("xai_task_cols")` + `usePref("xai_calendar_events")` for their REACTIVITY (re-render when the owning module writes) but NEVER calls the `setValue` tuple member — identical to the §F read-only contract (api.md §F.5: "the `setValue` tuple member is NEVER called"). NO new registry key for Mail (read-only — contrast Weather which adds one). A Phase-B AC explicitly asserts no write (seed → render → assert the seeded store value is byte-unchanged after render + interaction).

---

## §5. Recommendation (the plan in one paragraph)

**§G APPEND** to `@repo/plugin-web-dashboard-widgets`. **Phase A (Weather manual-entry):** add ONE authorized registry key `xai_dashboard_weather` (codec json, default `null`, owner this package, schemaVersion 1, category module) + its parity-array entries + `AC-REGISTRY-WEATHER-1/2`; build an in-package `internal/weatherStore/` (types + pure get/set + `useWeather` hook over `usePref` — mirroring §E `stickiesStore`, but a SINGLETON object not a record) + a native `<dialog>` `WeatherEditor` (city text + temp number + 3-preset condition radiogroup + optional hi/lo) + `STR_WEATHER` local STR; rewire `WeatherWidget` to render user values (current conditions only, optional hi/lo) with an honest "Set your weather" empty state + an edit button (opens the editor); drop the 5-day forecast on the live path (keep the fixture export). **Phase B (Mail → Notifications):** keep the widget id `mail` (stable; no ADR/migration); add `internal/dataReads/notifications.ts` (REUSE §F `listValidCalEvents` for today's events + a new `overdueTasks` reader over `xai_task_cols["overdue"]`) + `STR_NOTIFICATIONS` local STR; rewire `MailWidget` to render `NotificationSignal[]` rows (overdue tasks + today's events, max 6, badge = count) with an honest "All clear" empty state; thread `now` into the mail entry in `registrations.tsx` (1-line additive); **READ-ONLY** (never writes task/calendar). Both phases: local STR only (no `plugin-web-tokens` edit), public surface unchanged (`dashboardWidgetRegistrations`-only), no `packages/core` edit, no event channel, no host edit, no `dev` branch.

---

## §6. Frozen assumptions (16) — feed design.md §G.1

1. Owning package = `@repo/plugin-web-dashboard-widgets` (§G EXTENSION; no new package). Manifest stays `status: Stable`.
2. Two independent widget transforms → **2 phases** (Phase A Weather manual-entry / Phase B Mail notifications digest).
3. **Phase A — Weather** is a WRITE feature on its OWN new key; **Phase B — Mail** is a READ-ONLY aggregation of 2 foreign keys (NO new key for Mail).
4. **New authorized registry key `xai_dashboard_weather`** (codec json, default `null`, owner `xai-web-dashboard-widgets`, category module, schemaVersion 1, proposed false) — byte-parallel to §E `xai_dashboard_stickies` (registry.ts:959). + `OWNER_ROW_ADDITIONS` entry + parity exclusion-list entry + `AC-REGISTRY-WEATHER-1/2`. **Mail adds NO key.**
5. Weather store = a SINGLETON object (`UserWeather | null`), NOT a record (contrast stickies' `Record<id, …>`). `null` = honest empty state.
6. Weather model: `UserWeather = { city: string; temp: number; condition: WeatherCondition; hi?: number; lo?: number; updatedAt: string }`. `WeatherCondition = "sunny" | "cloudy" | "rainy"`. `NewWeatherDraft = { city; temp; condition; hi?; lo? }`.
7. `WeatherCondition` → existing `Icon` name map: `sunny→"sun"`, `cloudy→"cloud"`, `rainy→"rain"`. **No `Icon.tsx` edit** (3 presets, 3 existing glyphs).
8. Weather editor = native `<dialog>` `WeatherEditor` (city `<input>` + temp number `<input>` + condition `role="radiogroup"` (3 chips) + optional hi/lo number `<input>`s + Save/Cancel; ESC/backdrop/autofocus/`aria-modal`/`aria-labelledby`) per §E `StickyComposer`. WRITE-only (no edit-mode/delete in v1; "Save" overwrites the singleton).
9. `WeatherWidget` renders current conditions ONLY (city + temp + condition icon/label + optional hi/lo). 5-day forecast DROPPED on the live path; `WEATHER` fixture export KEPT (back-compat + `fixtures.test.ts` green — §F RD9 precedent). Honest empty state ("Set your weather" + edit affordance) when the store is `null`.
10. **Mail keeps widget id `mail`** (frozen per api.md §S2; persisted in `xai_dash_order`) — NO rename, NO ADR amendment, NO layout migration. Only the body data source + `ariaLabel` + title label change. Reuses `.mail-*` CSS.
11. Mail signal shape: `NotificationSignal = { id; sourceType: "task-overdue" | "calendar-today"; label; time?; sortKey }`. Badge = `signals.length`. Source-additive (future `"countdown-expiring"` slots in without reshape).
12. Mail sources (v1): (a) overdue tasks = `xai_task_cols["overdue"].tasks`(+`.completed?`) with `done !== true`, label `title[lang]`; (b) today's events = `xai_calendar_events` filtered to today's LOCAL date-prefix WITH recurrence expansion. **Max 6 rows** (overdue-first, then today-by-time). **Countdowns DEFERRED** (Q-Mail-countdown; flagged OQ-Mail-2).
13. Mail read pattern = `usePref(<key>)` + LOCAL predicate, NEVER a plugin import, NEVER the `usePref` setter. **READ-ONLY — never writes `xai_task_cols`/`xai_calendar_events`.** Reuses §F's `listValidCalEvents` for the calendar source; adds a new `overdueTasks` task reader (widens §F's card-narrow to include `title`).
14. Mail entry threads `now`: `registrations.tsx` `mail` entry gains `now={ctx.now}` (1-line additive, like §F's Upcoming) so "today"/"overdue" are computed against `ctx.now`. NOT a `WidgetRenderContext` change.
15. i18n = LOCAL STR only. 2 new dedicated tables in `internal/strings.ts`: `STR_WEATHER` + `STR_NOTIFICATIONS` (NOT stuffed into `STR_STICKY_COMPOSER`/`STR_WIDGET_EMPTY` — §F N2). Titles reuse existing `dashboard.weather`/`dashboard.mail` token keys via `useI18n`. **0 `plugin-web-tokens` keys.**
16. Public surface UNCHANGED — `src/index.ts` exports `dashboardWidgetRegistrations` only; store/editor/selectors stay `internal/`; `index-barrel.test.ts` (AC-PKG-4) stays green. NO `packages/core` edit, NO `packages/core/src/types/events.ts` event channel, NO host edit, NO `dev` branch, NO SHIPPED-archive/ADR edit.

---

## §7. Risks + mitigations

| ID | Risk | Mitigation | Phase |
|---|---|---|---|
| RW1 | Weather store as a record (copying §E stickies blindly) instead of a singleton | Design pins `UserWeather \| null` SINGLETON; `useWeather` returns `{ weather, set, clear }` not a list; AC-WSTORE asserts single-object round-trip | A |
| RW2 | Editor on the drag surface leaks pointer events / fights the grid `pointerdown` | Native `<dialog>` top-layer (§E `StickyComposer` proof); the only body button (Edit) carries `data-no-drag`; AC-WEDITOR asserts `<dialog>` open/close | A |
| RW3 | `WeatherCondition` enum maps to a missing Icon glyph | 3-preset enum maps 1:1 to existing `sun`/`cloud`/`rain`; a typed `Record<WeatherCondition, IconName>` makes a bad map a compile error; AC asserts each preset renders its icon | A |
| RW4 | Dropping the 5-day forecast breaks `fixtures.test.ts` (AC-FIXTURES-1 checks `forecast` len 5) | KEEP the `WEATHER` fixture export verbatim; only the live render path drops the forecast (RD9 precedent); `fixtures.test.ts` untouched-green | A |
| RW5 | New `xai_dashboard_weather` key breaks registry parity tests (AC-REG-8 count + §9.2 parity) | Add to BOTH `OWNER_ROW_ADDITIONS` (registry.test.ts:162) + parity exclusion list (parity-design-md.test.ts:167) — same dual-array as §E stickies; AC-REG-8 auto-derives; AC-REGISTRY-WEATHER-1/2 mirror AC-REGISTRY-STICKIES-1/2 | A |
| RW6 | Weather widget loses editor-open state on grid 1Hz `render(ctx)` tick | Widget is a stable React component (ClockWidget + §E proof); `useState(editorOpen)` survives re-render; AC asserts editor stays open across a re-render | A |
| RM1 | Mail accidentally mutates a foreign store | Read-only: never call the `usePref` setter; AC-MAIL-READONLY seeds `xai_task_cols`+`xai_calendar_events`, renders, asserts both store values byte-unchanged | B |
| RM2 | Overdue read copies §F's flattened `countDone` (wrong bucket / no title) | New `overdueTasks` selector reads `store["overdue"].tasks` specifically + widens the card-narrow to include `title`; AC-RD-OVERDUE asserts only the overdue bucket + `done!==true` + title surfaced | B |
| RM3 | "Today's events" misses recurring instances OR mis-parses local-vs-UTC date | REUSE §F's `listValidCalEvents` + the proven recurrence/local-date helpers (advance-date-prefix/keep-HH:MM); AC-RD-TODAY asserts a daily-recurring event lands on today + a non-today event is excluded + local date basis | B |
| RM4 | Renaming widget id `mail` breaks `xai_dash_order` layouts / needs ADR | KEEP id `mail` (Q-Mail-rename); only body+ariaLabel+label change; verified against api.md §S2 frozen-ids; AC asserts the `mail` entry id/span unchanged | B |
| RM5 | `now` thread for Mail mistaken for a `WidgetRenderContext` change | Add `now` to `MailWidgetProps` (additive) + thread `ctx.now` in `registrations.tsx` (1-line); row #10's `WidgetRenderContext` untouched (the §F N1 precedent); AC-MAIL-REAL uses a fixed `now` | B |
| RM6 | Empty "All clear" mistaken for a loading/error state | Honest empty state copy via `STR_NOTIFICATIONS`; AC-MAIL-EMPTY asserts the "all clear" label renders (not a fixture row) when both sources are empty | B |
| RG1 | Stuffing new strings into `STR_STICKY_COMPOSER`/`STR_WIDGET_EMPTY` (the §F N2 anti-pattern) | 2 NEW dedicated tables `STR_WEATHER` + `STR_NOTIFICATIONS` with their own accessors; bilingual grep-assert each key has en+zh | A+B |
| RG2 | Barrel surface accidentally widened | `index-barrel.test.ts` keeps asserting single `dashboardWidgetRegistrations` export; store/editor/selectors stay `internal/` | A+B |
| RG3 | Defensive read of a foreign store couples to its schema | Predicates DEFENSIVE (drop non-conforming, degrade to empty/honest, never throw) — §F RD12 discipline | B |

---

## §8. Open questions for `feature-review`

- **OQ-Weather-1 (condition enum size):** 3 presets (sunny/cloudy/rainy → existing sun/cloud/rain icons, zero `Icon.tsx` edit)? Reviewer may want a 4th/5th condition (snowy/windy/foggy) — that requires adding icon(s) to `Icon.tsx`'s union + switch + exhaustiveness guard (additive, known). Recommendation: 3 presets for v1.
- **OQ-Weather-2 (hi/lo):** Keep optional hi/lo number inputs in the editor (omit the `.ww-hilo` row when unset)? Or drop hi/lo entirely (city + temp + condition only)? Recommendation: keep optional.
- **OQ-Weather-3 (editor vs inline):** Native `<dialog>` `WeatherEditor` (drag-surface-safe, §E proof)? Reviewer may prefer inline-on-body. Recommendation: `<dialog>`.
- **OQ-Mail-1 (display label):** Keep the widget TITLE as "Mail"/"收件箱" (existing token) or shift to "Notifications"/"通知" (local STR, no token edit)? The id stays `mail` either way. Recommendation: shift the label to "Notifications" via local STR (more honest for the new content) while keeping the `mail` id + `dashboard.mail` token unused-but-available.
- **OQ-Mail-2 (countdowns):** DEFER expiring countdowns from v1 (opaque `unknown` registry type → non-trivial recon + 3rd predicate)? Or include them (adds a `xai_countdowns` predicate + `expiringCountdowns` selector + a `"countdown-expiring"` signal type to Phase B)? Recommendation: DEFER; the 2 named sources satisfy the carve-out §5 anchor; the signal shape is source-additive for a later increment.
- **OQ-Mail-3 (max rows):** 6 notification rows (overdue-first, then today-by-time)? Reviewer may pick 4/5/8. Recommendation: 6.
- **OQ-Mail-4 (overdue done-filter + completed bucket):** Overdue signal = `overdue` bucket's `tasks` + `completed?` filtered `done !== true`? (i.e., a completed overdue card is NOT a notification.) Recommendation: yes — only `done !== true` cards in the overdue bucket are "needs attention now."
- **OQ-Phase (split):** 2 phases (A Weather / B Mail)? They share no code/store; 2 is the natural split. Reviewer may fold docs into a 3rd phase — not recommended (the §F 3rd "polish/docs" phase folded cleanly; here each widget is self-contained so A and B each end READY-able, with docs synced in B).

---

## §9. Evidence index (source files read end-to-end)

| Topic | Source |
|---|---|
| Carve-out authority | `docs/reviews/_p0-carve-outs/20260529-dashboard-weather-mail.md` (commit `43ba6f8`) |
| Priority authority | `docs/adr/0010-p1-desktop-resume-plan.md` §D4 (Accepted 2026-05-26) |
| Weather widget body | `packages/xai-web-dashboard-widgets/src/widgets/WeatherWidget.tsx` |
| Mail widget body | `packages/xai-web-dashboard-widgets/src/widgets/MailWidget.tsx` |
| 10-entry registrations | `packages/xai-web-dashboard-widgets/src/registrations.tsx` (weather/mail pass only `lang`; `ctx.now` available) |
| Fixtures (WEATHER/MAILS shapes) | `packages/xai-web-dashboard-widgets/src/internal/fixtures.ts` |
| Icon library (weather glyphs sun/cloud/rain) | `packages/xai-web-dashboard-widgets/src/internal/Icon.tsx` (IconName union :10-30) |
| §E store template (singleton-ify for Weather) | `packages/xai-web-dashboard-widgets/src/internal/stickiesStore/{types,useStickies,stickiesStore,ids}.ts` |
| §E local STR template | `packages/xai-web-dashboard-widgets/src/internal/strings.ts` (`STR_STICKY_COMPOSER` + `STR_WIDGET_EMPTY` + `str`/`strEmpty`) |
| §F calendar read layer (REUSE for Mail today's events) | `packages/xai-web-dashboard-widgets/src/internal/dataReads/{isUserCalEventMap,calUpcoming,calMonthDots}.ts` |
| §F task read layer (widen for Mail overdue) | `packages/xai-web-dashboard-widgets/src/internal/dataReads/{isTaskColsRecord,taskStats}.ts` |
| Owner task types (overdue bucket + title + done) | `packages/xai-web-tasks/src/types.ts` (`BucketId`:17, `TaskCard`:38-61, `TaskCol`:67-80) |
| Tasks "today" = overdue bucket (framing) | `packages/xai-web-tasks/src/internal/strings.ts` (:22,46-49) |
| Registry — new-key template + sources | `packages/plugin-web-storage/src/internal/registry.ts` (`xai_task_cols`:197, `xai_countdowns`:358, `xai_calendar_events`:943, `xai_dashboard_stickies`:959) |
| Registry parity tests (dual-array to extend) | `packages/plugin-web-storage/src/__tests__/registry.test.ts` (`OWNER_ROW_ADDITIONS`:162, AC-REGISTRY-STICKIES:301-340, AC-REG-8:235) + `parity-design-md.test.ts` (exclusion list :167) |
| SHIPPED four-pack lineage being extended | `packages/xai-web-dashboard-widgets/docs/{design,api,test,dev_log}.md` (row #11 + §E stickies + §F real-data — all SHIPPED) |
| Sibling cluster manifest (format template) | `docs/workflow/roadmap/xai-web-dashboard-real-data.md` |
