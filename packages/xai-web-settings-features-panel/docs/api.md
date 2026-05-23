# API — xai-web-settings-features-panel

> Package barrel: `@repo/plugin-web-settings-features-panel` (the only allowed import path)
> Source of truth for surface shape. Pane substitution composes with `paneRegistry` from `@repo/plugin-web-settings-shell`.

## 1. Types

```ts
/** The 8 user-toggleable feature ids. */
export type FeatureId =
  | "tasks"
  | "board"
  | "dashboard"
  | "calendar"
  | "matrix"
  | "pomodoro"
  | "habits"
  | "meditation";

/** Map of feature id → enabled boolean (default true for every id). */
export type FeaturePrefs = Readonly<Record<FeatureId, boolean>>;

/** Stable display order for the pane (matches DESIGN.md §4.12 ordering). */
export const featureIdOrder: readonly FeatureId[];

/** Pane component — exported for direct test mounting; production uses `featuresPane.render`. */
export interface FeaturesPaneProps { readonly lang: Lang }
export function FeaturesPane(props: FeaturesPaneProps): React.ReactElement;

/** Pane object — substitute into paneRegistry per settings-shell api.md §8. */
export const featuresPane: Pane;

/** Hook that reads all 8 prefs and returns a stable snapshot. */
export function useFeaturePrefs(): FeaturePrefs;

/** Pure filter helper. Removes modules whose moduleId is in FeatureId AND has prefs[id] === false. */
export function filterModulesByFeaturePrefs<T extends { moduleId: string }>(
  modules: readonly T[],
  prefs: FeaturePrefs,
): T[];

/** Empty state component shown when a route under a disabled feature is reached. */
export interface DisabledFeatureFallbackProps {
  readonly moduleId: FeatureId;
  readonly lang: Lang;
}
export function DisabledFeatureFallback(
  props: DisabledFeatureFallbackProps,
): React.ReactElement;

/**
 * Adapter that wraps each child render of a slot registration with a
 * disabled-feature guard. Reads `usePref(xai_pref_features_<id>)`; when
 * `false`, returns `<DisabledFeatureFallback>` in place of the original
 * render.
 */
export function withDisabledFallback(
  reg: WebModuleSlotRegistration,
  moduleId: FeatureId,
): WebModuleSlotRegistration;
```

## 2. Storage contract

8 entries appended to `PREF_REGISTRY` (line-disjoint with siblings #22/#24):

| Key | Codec | Default | schemaVersion | owner | category |
|-----|-------|---------|---------------|-------|----------|
| `xai_pref_features_tasks` | boolean | `true` | 1 | xai-web-settings-features-panel | pref |
| `xai_pref_features_board` | boolean | `true` | 1 | xai-web-settings-features-panel | pref |
| `xai_pref_features_dashboard` | boolean | `true` | 1 | xai-web-settings-features-panel | pref |
| `xai_pref_features_calendar` | boolean | `true` | 1 | xai-web-settings-features-panel | pref |
| `xai_pref_features_matrix` | boolean | `true` | 1 | xai-web-settings-features-panel | pref |
| `xai_pref_features_pomodoro` | boolean | `true` | 1 | xai-web-settings-features-panel | pref |
| `xai_pref_features_habits` | boolean | `true` | 1 | xai-web-settings-features-panel | pref |
| `xai_pref_features_meditation` | boolean | `true` | 1 | xai-web-settings-features-panel | pref |

Insertion point: append at the bottom of `PREF_REGISTRY` after `xai_meditation_prefs`, under a header comment block clearly labeled `// ---- Features panel (§S8 — declared by xai-web-settings-features-panel #23) ----`.

Reset semantics: `resetAllPrefs()` already iterates over every registered key — adding 8 entries automatically participates in reset.

## 3. Composition seam

`apps/web/src/routes/modules/settingsPaneComposition.ts` (NEW file owned by row #23 boundary):

```ts
import type { Pane } from "@repo/plugin-web-settings-shell";
import { paneRegistry } from "@repo/plugin-web-settings-shell";
import { featuresPane } from "@repo/plugin-web-settings-features-panel";
// Sibling rows #22 (appearance) and #24 (rest) will add their own imports
// + cases below. Each row inserts only its own branch — line-disjoint.

export function composeSettingsPaneRegistry(): readonly Pane[] {
  return paneRegistry.map((p) => {
    if (p.id === "features") return featuresPane;
    // siblings extend this switch (one extra `if (p.id === "<theirs>") return <theirs>Pane;` each)
    return p;
  });
}
```

`apps/web/src/App.tsx` filter — exactly one anchor edit by row #23:

```ts
import { useFeaturePrefs, filterModulesByFeaturePrefs } from "@repo/plugin-web-settings-features-panel";

// inside App():
const featurePrefs = useFeaturePrefs();
const modules = useMemo<WebModuleSlotRegistration[]>(
  () => filterModulesByFeaturePrefs(webShellModuleRegistrations, featurePrefs),
  [featurePrefs],
);
```

`apps/web/src/routes/modules/shellRegistrations.tsx` deep-link guards — wrap the 8 toggleable registrations with `withDisabledFallback(reg, "<id>")`. This is a single batch edit by row #23 (line-disjoint with siblings).

## 4. i18n keys

Added to `packages/plugin-web-tokens/src/i18n.ts` under `en.settings` and `zh.settings`:

- `features_intro` — "Toggle modules on or off. Disabled modules are hidden from the rail and their routes show a friendly empty state. Your data is preserved." / "开启或关闭模块。关闭后将从侧栏隐藏并显示空状态，数据会被保留。"
- `features_off_title` — "{module} is turned off" / "{module} 已关闭"
- `features_off_body` — "Re-enable it in Settings → Features." / "在 设置 → 功能 中重新开启。"
- `features_desc_<id>` × 8 — short description per module (EN + ZH).

Module display names reuse `settings.title` and `nav.<id>` to stay consistent with the rail/topbar.

## 5. Behavioral contract

- Default state: all 8 toggles on. Reading `usePref(xai_pref_features_<id>)` before any write returns `true`.
- Toggling a row writes `setPref(xai_pref_features_<id>, !current)` synchronously. `usePref` re-renders subscribers in the same React tree.
- `useFeaturePrefs()` returns the same object reference within a render. Across renders the object identity changes when ANY of the 8 keys changes.
- `filterModulesByFeaturePrefs` is pure: same inputs → same output array (by value, not reference); referential stability is the caller's responsibility (memoize with `useMemo`).
- `featuresPane` matches `Pane`: `{ id: "features", icon: "sliders", i18nKey: "settings.features", render: ({ lang }) => <FeaturesPane lang={lang} /> }`.
- `withDisabledFallback` mutation: returned `WebModuleSlotRegistration` keeps `moduleId/label/icon/railOrder/i18nKey/showInRail` identical; only `children[*].render` is wrapped. The wrapper reads the pref via `usePref` and returns `<DisabledFeatureFallback>` when off, else delegates to original render.

## 6. Error semantics

- Unknown FeatureId in `withDisabledFallback` (TypeScript prevents at compile time; at runtime it returns the registration unchanged + DEV `console.warn`).
- `filterModulesByFeaturePrefs` is total: if a moduleId in the input array is NOT a FeatureId, it always passes through.
- `DisabledFeatureFallback` with unknown moduleId falls back to a generic "This module is turned off." copy.

## 7. Stability + versioning

- `FeatureId` is CLOSED. Adding a 9th feature is a SemVer minor.
- Storage keys MUST keep the literal `xai_pref_features_<id>` shape (DESIGN.md §9.2 family).
- `featuresPane.id === "features"` is frozen — must match `SettingsPaneId.features`.

## 8. Dependencies

- `react ^19.2.0` (peerDep)
- `react-dom ^19.2.0` (peerDep)
- `@repo/core workspace:*` — types only
- `@repo/plugin-web-tokens workspace:*` — useI18n + Lang
- `@repo/plugin-web-storage workspace:*` — usePref, PREF_REGISTRY edits, setPref
- `@repo/plugin-web-settings-shell workspace:*` — Toggle, SettingRow, SectionBlock, SettingsFooter, paneRegistry, Pane
- `@repo/xai-web-event-bus workspace:*` — optional v1 (NOT a hard dep in plan; included for symmetry)
- `@repo/xai-web-shell workspace:*` — WebModuleSlotRegistration

DevDeps: `@repo/eslint-config`, `@repo/typescript-config`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest`, `jsdom`.

## 9. References

- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 + §S7 + §S8
- Chassis: `packages/xai-web-settings-shell/docs/api.md` §5.2 + §8
- DESIGN.md §4.12
- Source: `web design/module-settings.jsx` lines 156-301
