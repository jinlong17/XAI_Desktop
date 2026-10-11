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
export interface FeaturesPaneProps {
  readonly lang: Lang;
  /** Optional host departure-guard bridge (type from @repo/plugin-web-settings-shell). */
  readonly registerDepartureGuard?: PaneDepartureGuardRegistration;
}
export function FeaturesPane(props: FeaturesPaneProps): React.ReactElement;

/** Pane object — substitute into paneRegistry per settings-shell api.md §8. `render(props)` forwards every render prop. */
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

Reset semantics: `resetAllPrefs()` already iterates over every registered key — adding 8 entries automatically participates in reset. No production path calls it for these keys: the Features pane's own "Reset to defaults" (§5) is a pane-scoped, per-key engine reset of exactly these 8 keys.

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
- `useFeaturePrefs()` returns the same object reference within a render. Across renders the object identity changes when ANY of the 8 keys changes.
- `filterModulesByFeaturePrefs` is pure: same inputs → same output array (by value, not reference); referential stability is the caller's responsibility (memoize with `useMemo`).
- `featuresPane` matches `Pane`: `{ id: "features", icon: "sliders", i18nKey: "settings.features", render: (props) => <FeaturesPane {...props} /> }`; the object identity is unchanged.

### 5.1 FeaturesPane recovery caller

Contract: `docs/reviews/web-features-recovery-contract/contract.md` (CP-FEATURES-01). The operation model lives in `src/internal/featuresRecovery.ts`, the EN/ZH wording in `src/internal/featuresRecoveryCopy.ts`.

- **Bindings.** One `usePrefAutosaveAsync` binding per key in `featureIdOrder` (fixed count and hook order) with a strict `typeof value === "boolean"` validator. The 8 keys stay unscoped device keys: the pane never touches an account key, account lifecycle lock, generation marker or tombstone. Valid and absent mounts and rerenders write nothing; absence displays the default "on".
- **Toggles.** A switch inverts the latest intent (its draft), not the rendered value, and the choice displays at once (`aria-checked`, `on` class), even behind a held per-key lock; switches stay enabled. Each valid edit becomes a field-local draft created before it is enqueued, and only that exact draft's own verified success clears the field. Turning a module back on stores `true`, never a removal.
- **Failures.** A failure (quota, read or lock fault, missing or rejected Web Lock, conflict, readback uncertainty) keeps the latest choice with `<Label> was not saved.`, `Retry <Label>` and `Discard <Label>`; pending work reads `<Label> is saving.`. Retry re-runs the field's own failed request with its kind and uncertainty grant, is inert while pending, and never gains authority over an external conflict. Recovering a failed predecessor never acknowledges a newer draft. Siblings settle independently.
- **Source truth.** Bytes other than exactly `true`/`false`, or a throwing read, show `Saved <Label> is unavailable. Reload it; this is not a new unsaved change.` with `Reload <Label>` only, display the default and are never rewritten, purged or normalized. Reload refuses at invocation time while the field holds a draft and never claims a save by itself.
- **Discard.** `Discard <Label>` and `Discard all changes` detach the drafts first, then reread only those fields with zero writes; a late completion never revives discarded work. Keyboard focus lands on the field's switch after Discard or Reload, and stays in the pane after Discard all.
- **Reset to defaults** is a Features-local control (`data-testid="features-reset-defaults"`, same visible label `Reset to defaults` / `恢复默认`); the shared `SettingsFooter` and its "Save & apply" are not rendered. It first asks `window.confirm("Turn all 8 modules back on? This only changes which modules are shown; your data is kept.")` (ZH: `将全部 8 个模块恢复为开启？这只改变显示哪些模块，数据会保留。`); declining touches no key. Accepting synchronously admits 8 reset drafts and one batch identity, then runs one engine reset per key: verified absence (or the engine's verified no-op for an absent key), never writing `true`, with no rollback of successful fields and no broadcast of any kind (the pane dispatches no `StorageEvent`; same-tab readers learn of each committed removal through the engine's publication). A refused, conflicting, uncertain, invalid or unavailable field keeps a reset draft (`<Label> is being reset to its default.` / `<Label> was not reset to its default.`) whose Retry only re-attempts its own removal. A duplicate activation while the batch has unresolved fields enqueues no duplicate removal (pending resets continue; failed ones re-attempt only their own removal). A newer edit is a new intent; a later batch adopts any still-unresolved reset with its own request and authority instead of rebasing it.
- **Status.** `Features settings saved.` appears only after a genuine success in this mount, and `Defaults restored.` only when all 8 resets of the latest batch completed with no newer edit; both are suppressed while any draft, pending operation or source error exists. `Export failed. Please retry.` reports an export setup failure.
- **Departure guard.** The pane registers the optional `registerDepartureGuard` bridge whenever the host provides the hook, including in a clean state, and blocks only while actual set or reset drafts exist (pending or failed). The guard label is `settings.features` (Features / 功能). An account epoch change renews the decision token: the old guard and inline callbacks refuse at once, even before rerender, while a fresh guard protects the surviving device drafts. A `beforeunload` warning is registered only while drafts exist and makes no storage call. Unmount removes the guard and the listener and never undoes committed writes or removals.
- **Export.** `Export Features draft` downloads a memory-only `features-draft.json`: `{"version":1,"kind":"features-draft","changes":{"device":{…}}}` where each unresolved field appears once as `{"operation":"set","value":<boolean>}` or `{"operation":"reset"}`; no account bucket, key or timestamp, no saved, default or source-only field, and no empty download. Permission is rechecked before setup, after Blob and URL creation and after append (just before the click); the anchor is removed and the URL revoked on a best-effort basis.
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
- `@repo/plugin-web-storage workspace:*` — usePref (readers), usePrefAutosaveAsync + accountScope (FeaturesPane), PREF_REGISTRY edits
- `@repo/plugin-web-settings-shell workspace:*` — Toggle, SectionBlock, Pane, PaneRenderProps, PaneDepartureGuard types (FeaturesPane no longer renders SettingsFooter)
- `@repo/xai-web-event-bus workspace:*` — optional v1 (NOT a hard dep in plan; included for symmetry)
- `@repo/xai-web-shell workspace:*` — WebModuleSlotRegistration

DevDeps: `@repo/eslint-config`, `@repo/typescript-config`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest`, `jsdom`.

## 9. References

- ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 + §S7 + §S8
- Chassis: `packages/xai-web-settings-shell/docs/api.md` §5.2 + §8
- DESIGN.md §4.12
- Source: `web design/module-settings.jsx` lines 156-301
