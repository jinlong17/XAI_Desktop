# Discovery Review — xai-web-settings-features-panel

> Roadmap row #23 · W4b · 2026-05-23 · Settings (split) — Features pane
> Source PRD: web design/DESIGN.md §4.12 Features
> Source code: web design/module-settings.jsx lines 156-301 (FeaturesPane + FeatureThumb)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## 1. Problem framing

Settings → Features pane is one of the 13 settings panes in the prototype. It lets a user enable / disable individual "modules" (rail-visible feature areas). Toggling off must:

1. Persist the choice locally so the rail keeps that module hidden across reloads.
2. Remove the module's rail entry (and any deep-link route) without deleting persisted module data — re-enable must restore the rail entry with all data intact.
3. Render an **original SVG thumbnail** preview for every module (no external image fetch).
4. Provide a bilingual on/off list following DESIGN.md §4.12 wording.

The 8-module set (per user prompt + roadmap row #23 dependency edges) is:

| # | Module id | Slot pkg (READY_TO_SHIP) | Thumbnail kind |
|---|-----------|--------------------------|----------------|
| 1 | tasks | @repo/plugin-web-tasks | "tasks" (new) |
| 2 | board | @repo/plugin-web-board-core (via workspaces) | "board" (port) |
| 3 | dashboard | @repo/plugin-web-dashboard-grid | "dash" (new) |
| 4 | calendar | @repo/plugin-web-calendar | "cal" (port) |
| 5 | matrix | @repo/plugin-web-matrix | "matrix" (port) |
| 6 | pomodoro | @repo/plugin-web-pomodoro | "pomo" (port) |
| 7 | habits | @repo/plugin-web-habits | "habits" (port) |
| 8 | meditation | @repo/plugin-web-meditation | "med" (port) |

NB: The prototype `module-settings.jsx` FeaturesPane uses `countdown / board / pet` instead of `tasks / dashboard`. We follow the **user-stated 8-module set + roadmap row #23 deps** because:
- All 8 are READY_TO_SHIP at plan time.
- `pet` is a floating overlay (not a rail module) — toggling it is the existing `xai_pet_on` channel already used by `web:shell:pet-toggle`, NOT the rail-visibility channel.
- `countdown` is intentionally deferred to xai-web-settings-rest (#24) per W4 split.
- `tasks` and `dashboard` are first-class rail modules that need user-level opt-out.

The 6 ported thumbnails (`cal/matrix/pomo/habits/board/med`) reuse the source SVGs from `module-settings.jsx` lines 197-300; the 2 new ones (`tasks/dash`) follow the same visual idiom (tokens.css palette, 280×130 viewBox).

## 2. Candidate options

### Option A — Persist via individual `xai_pref_features_<id>` boolean keys (selected)

- Pros:
  - 1 key per module → line-disjoint editing during the parallel-Agent wave (siblings #22/#24 touch their own pref keys).
  - Trivial migration when 9th/10th module joins (just add a new entry, no schema bump).
  - `usePref` already handles boolean codec.
  - Reset semantics are obvious: clear 8 keys → all enabled (default = true).
- Cons:
  - 8 entries in `PREF_REGISTRY` instead of 1 — minor noise.
- Verdict: Selected.

### Option B — Single `xai_pref_features_enabled: Record<id, boolean>` JSON key

- Pros:
  - Atomic; one localStorage entry.
- Cons:
  - JSON codec → any sibling editing the registry triggers a merge conflict.
  - Type narrowing harder (Record is loose).
  - Reset semantics force special-case "delete this key" rather than "delete all matching prefix".
- Verdict: Rejected.

### Option C — Reuse one of the existing `proposed` keys

- Pros:
  - Zero new keys.
- Cons:
  - No reserved slot matches "features on/off". `xai_ai_insights` is closest but `category="module"` + owner=`xai-web-ai-chat` — wrong owner.
- Verdict: Rejected.

## 3. Tradeoffs

- 8 new prefs vs 1 JSON blob → opt for 8 (line-disjoint + simpler reset).
- Hook composition in `apps/web/src/App.tsx` (where rail filter applies) needs to read all 8 prefs. We expose `useFeaturePrefs(): Record<FeatureId, boolean>` and `filterModulesByFeaturePrefs(modules, prefs)` from this package.
- Cross-tab updates: `usePref` already reacts to `storage` events in the same window's React tree on `setPref`. For other tabs, an `useWebEventListener('web:settings:preference-changed', ...)` re-read could be added, but is **not required** for v1 acceptance (single-tab).

## 4. Recommendation

Ship Option A:

- Add 8 `xai_pref_features_*` boolean entries to `PREF_REGISTRY` (codec: boolean, default: true, owner: xai-web-settings-features-panel, category: pref).
- Build `FeaturesPane` as a sibling pane that imports `Toggle/SettingRow/SectionBlock/SettingsFooter` from `@repo/plugin-web-settings-shell` per api.md §8.
- Expose `useFeaturePrefs()` + `filterModulesByFeaturePrefs()` + `featuresPane: Pane` from `index.ts`.
- Wire `apps/web/src/App.tsx` to call `useFeaturePrefs()` → derive filtered `modules` → pass to `<WebShellProvider>`.
- Wire `apps/web/src/routes/modules/settingsPaneComposition.ts` (new file) to substitute the `features` pane in `paneRegistry` (siblings #22/#24 share this file, each touching their own pane entry).
- Add a "module-disabled" empty-state component, mounted in the route subtree of each toggleable module (each module's existing slot registration is left untouched; the wrapper inspects the pref and renders the empty state when off). For v1 we keep the empty-state inside this plugin and let `apps/web` route `*` paths inside each module slot to a `<DisabledFeatureFallback>` only when the pref is off.

### Composition seam (line-disjoint)

`apps/web/src/routes/modules/settingsPaneComposition.ts`:

```ts
import type { Pane } from "@repo/plugin-web-settings-shell";
import { paneRegistry } from "@repo/plugin-web-settings-shell";
import { featuresPane } from "@repo/plugin-web-settings-features-panel"; // mine (row #23)
// Sibling rows will add their own imports below this row (line-disjoint).

export function composeSettingsPaneRegistry(): readonly Pane[] {
  return paneRegistry.map((p) => {
    if (p.id === "features") return featuresPane;
    return p;
  });
}
```

`apps/web/src/App.tsx` filter call (one line addition before `useMemo(modules)`):

```ts
const featurePrefs = useFeaturePrefs(); // mine (row #23)
const modules = useMemo<WebModuleSlotRegistration[]>(
  () => filterModulesByFeaturePrefs(webShellModuleRegistrations, featurePrefs),
  [featurePrefs],
);
```

The sibling rows (#22 appearance, #24 rest) do not need to touch the App.tsx modules array — only my row #23 does. Siblings touch `settingsPaneComposition.ts` in their own pane-substitution branch (line-disjoint switch cases on `p.id === "appearance"` / etc.).

## 5. Risks + open questions

- **R1 — Concurrent sibling edits to PREF_REGISTRY**: registry.ts will receive new entries from rows #22/#24 (appearance, rest) at the same time. Mitigation: append 8 entries at the bottom of the registry under a clearly labeled `// ---- Features panel (§S8 — declared by xai-web-settings-features-panel #23) ----` block; siblings open separate blocks. Each block is line-disjoint.
- **R2 — Module-disabled deep-link**: when a user navigates directly to `/board/foo-id` while `xai_pref_features_board === false`, the slot will mount. The minimal-scope fix is to route-wrap each toggleable module so that when its pref is off, it returns `<DisabledFeatureFallback moduleId="board" lang={lang} />`. For row #23 we ship the fallback component + wire it only on the 8 toggleable modules. Friendly empty state per the seed.
- **R3 — Cross-tab persistence visibility**: outside acceptance; documented as a future enhancement.
- **R4 — Pet toggle drift**: pet toggle is owned by `web:shell:pet-toggle` event, **not** by features-panel. We document the boundary and explicitly do NOT ship a pet feature toggle here (the rail-bottom pet toggle from xai-web-shell row #5 stays canonical).
- **R5 — i18n**: we add `settings.features_intro` (description text) + 8 module names if missing. Current i18n already has `settings.features = "Features"` + `nav.*` for all 8 modules; we re-use `nav.*` for module names. Add `settings.features_intro` + `settings.features_off_title` + `settings.features_off_body` keys.

## 6. Web research

No external research required — purely internal port + new persistence channel scoped to PREF_REGISTRY.

## 7. References

- Source: `web design/module-settings.jsx` lines 156-301 (FeaturesPane + FeatureThumb)
- Spec: `web design/DESIGN.md` §4.12
- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map) + §S7 (events) + §S8 (storage)
- Chassis: `packages/xai-web-settings-shell/docs/api.md` §5.2 + §8
- Sibling row seeds: `docs/reviews/xai-web-settings-appearance/20260523-roadmap-seed.md`, `docs/reviews/xai-web-settings-rest/20260523-roadmap-seed.md`
