# API Contract — xai-web-shell

> The single public surface for the shell. Consumers (`apps/web/src/App.tsx`
> and, indirectly, the 14 W2 module rows that register through it) MUST go
> through `index.ts`. Direct imports from `src/internal/` are forbidden.

## §0 Public Surface (index.ts)

```ts
// Components
export { Shell }                  from "./Shell";
export { AppRail }                from "./AppRail";
export { Topbar }                 from "./Topbar";
export { AvatarMenu }             from "./AvatarMenu";

// Registry (provider + hooks)
export { WebShellProvider }       from "./registry";
export { useWebShell }            from "./registry";
export { useWebModuleRegistry }   from "./registry";

// Types
export type {
  WebModuleSlotRegistration,
  WebShellProviderProps,
  ShellProps,
  AppRailProps,
  TopbarProps,
  AvatarMenuProps,
} from "./types";

// App-scoped rail-order controller (CP-APPRAIL-01; additive)
export { RailOrderProvider, useRailOrderController } from "./internal/railOrderController";
export { RailOrderStatus }                           from "./internal/RailOrderStatus";
export type {
  RailOrderController,
  RailOrderControllerOptions,
  RailOrderProviderProps,
  RailOrderStatusKind,
  RailOrderStatusProps,
} from "./types";

// Side effect: the rail-order status stylesheet (selectors begin with .rail-order-status)
import "./railOrderStatus.css";
```

Nothing else is exported. `internal/` is package-private: the pure rail-order
model, the copy and the drag helper (`reorderArray`) stay unexported.

---

## §1 Slot Registry Contract

### §1.1 `WebModuleSlotRegistration`

```ts
import type { ConsoleModuleId, WebModuleRouteRegistration } from "@repo/core/types";

/**
 * A single module slot — the contract every W2 module satisfies in order to
 * appear in the AppRail and be routed by the host.
 *
 * Extends WebModuleRouteRegistration (already in @repo/core/types) additively
 * with shell-specific display + ordering fields.
 *
 * Owner of the type: @repo/xai-web-shell (this package).
 * Owner of the concrete array: apps/web/src/routes/modules/registrations.tsx.
 */
export interface WebModuleSlotRegistration extends WebModuleRouteRegistration {
  /** Icon glyph name (matches src/icons.tsx). */
  icon: WebShellIconName;
  /** Rail order — lower numbers render first. Ties resolved by id alphabetical. */
  railOrder: number;
  /** i18n key used for the tooltip + AvatarMenu label. Format: "nav.<id>". */
  i18nKey: string;
  /** Visible in the rail? Settings is hidden (reachable via Topbar / Avatar). */
  showInRail: boolean;
}

export type WebShellIconName =
  | "sparkle"    // ai
  | "check"      // tasks
  | "kanban"     // board
  | "layout"     // dashboard
  | "calendar"   // calendar
  | "grid4"      // matrix
  | "timer"      // pomodoro
  | "pin"        // habits
  | "leaf"       // meditation
  | "countdown"  // countdown
  | "search"     // search
  | "chart"      // statistics
  | "sliders"    // settings
  | "paw"        // pet (rail bottom)
  | "sync"
  | "bell"
  | "help"
  | "sun"
  | "moon"
  | "monitor"
  | "star"
  | "download";
```

**Compatibility note**: `WebModuleRouteRegistration` already exists in
`@repo/core/types` and carries `moduleId: ConsoleModuleId`, `label: string`,
`defaultChildPath`, `children: WebModuleRouteChild[]`. The shell extends it;
existing consumers (productivity's `todoWebModuleRegistration`) continue to
satisfy the narrower base type unaffected. The shell relaxes its requirement
to `Partial<{icon, railOrder, i18nKey, showInRail}>` by computing safe
fallbacks when the four shell-only fields are absent — discovery review §5 Q1
flagged this as a candidate for promoting the extension into `@repo/core/types`
itself; feature-review confirms during P3 review.

### §1.2 `WebShellProvider`

```ts
export interface WebShellProviderProps {
  /** Full list of registered modules. Order is preserved here; AppRail sorts by railOrder. */
  modules: WebModuleSlotRegistration[];
  /** Active language — drives useI18n inside the shell. */
  lang: Lang;
  /** Active rail position — drives AppRail data-pos + AvatarMenu popover anchor. */
  railPos: RailPos;
  /** Pet toggle state — bound to the rail-bottom Pet button's active style. */
  petOn: boolean;
  /** Setter for petOn — invoked by the rail-bottom Pet button BEFORE the event emit. */
  setPetOn: (next: boolean) => void;
  children: React.ReactNode;
}

export function WebShellProvider(props: WebShellProviderProps): JSX.Element;
```

- The provider is React Context-only — no side effects.
- `lang` / `railPos` / `petOn` are passed in (host-owned state). The shell
  does not subscribe to those keys itself; the host is responsible.
- `modules` is a stable array (memoize at host).

### §1.3 `useWebShell()` / `useWebModuleRegistry()`

```ts
/** Returns the active shell context (lang, railPos, petOn, setPetOn). Throws outside <WebShellProvider>. */
export function useWebShell(): {
  lang: Lang;
  railPos: RailPos;
  petOn: boolean;
  setPetOn: (next: boolean) => void;
};

/**
 * Returns the sorted, rail-visible module list.
 * - Filters by showInRail === true.
 * - Sorts by railOrder ascending (ties by id alphabetical).
 * - The returned array is referentially stable across renders unless `modules`
 *   changes — implementations memoize via useMemo.
 */
export function useWebModuleRegistry(): readonly WebModuleSlotRegistration[];
```

---

## §2 Component Contracts

### §2.1 `<Shell>`

```ts
export interface ShellProps {
  /** Active language. */
  lang: Lang;
  setLang: (next: Lang) => void;
  /** Theme mode. */
  theme: Theme;
  setTheme: (next: Theme) => void;
  /** Density preset. */
  density: Density;
  setDensity: (next: Density) => void;
  /** Optional render-prop for the main pane — defaults to <Outlet/> from react-router. */
  children?: React.ReactNode;
}

export function Shell(props: ShellProps): JSX.Element;
```

Renders `<AppRail>` + `<Topbar>` + a `<main className="app-main">` wrapper.
The `<main>` contains either `props.children` (when explicitly provided —
useful for fixtures + tests) or `<Outlet/>` from `react-router`.

**Layout**: applies `className="app"` and `data-rail-pos={railPos}` on the
outer div, matching the prototype `web design/app.jsx` line 61.

### §2.2 `<AppRail>`

```ts
export interface AppRailProps {
  /** Currently-active module id, used to highlight the matching button. Derived from useParams() in App.tsx. */
  activeModuleId: ConsoleModuleId | null;
  /** Click handler — called with the module id BEFORE navigation. */
  onModuleClick: (moduleId: ConsoleModuleId) => void;
  /** Rail-bottom Pet click handler — called BEFORE the event emit. */
  onPetToggle: () => void;
}

export function AppRail(props: AppRailProps): JSX.Element;
```

**Behavior** (CP-APPRAIL-01; contract
`docs/reviews/web-apprail-order-recovery-contract/contract.md` r1)

1. Reads `lang` + `railPos` + `petOn` from `useWebShell()`.
2. Reads the modules from `useWebModuleRegistry()` (already sorted/filtered):
   the visible set R.
3. **The rail order belongs to the App-scoped rail-order controller.** AppRail
   reads the provided controller (`<RailOrderProvider>`); without a provider it
   creates its own (`useRailOrderController({ lang })`, standalone use such as
   tests and hosts that mount `Shell` without App). In the production App there
   is exactly one controller. AppRail makes no storage call of its own.
4. **Display** D(S, R): every id of the controller's order S (the draft, else
   the committed bytes, else `DEFAULT_RAIL_ORDER`) that is visible, in S order,
   then the visible ids S lacks, in R order. Unchanged from before; unknown,
   non-rail and Features-hidden ids are skipped for display only.
5. **Drag-reorder, one write per drop.** HTML5 DnD on `.rail-btn` elements.
   `dragstart` captures the displayed order D0 and starts an in-memory preview
   P; `dragover` on another button moves the dragged id there in P (the
   `dragging` class marks the source). `dragstart`, `dragenter`, `dragover`
   and `dragend` make **zero storage attempts**. A `drop` anywhere inside
   `.rail-items` (a button, the dragged button itself or a gap) admits exactly
   one set intent, and only when P differs from D0 and is still a permutation
   of D(S, R) at drop time. A gesture that ends without a drop (Escape, a
   release outside the rail, a drop on a text field, a cancelled drag) is
   cancelled: the preview reverts and nothing is written. An external drop
   (no rail `dragstart` in this document) is ignored. If R or S changes
   mid-drag so that P is no longer a permutation, the preview is discarded.
6. **R-1 (product-owner decision): hidden modules keep their stored
   positions.** The admitted value is the index-slot merge
   `merge(S, R, P)`: walk S; an element in R is replaced by the next element
   of P, an element not in R (Features-hidden, `settings`, unknown ids) stays
   at its index; leftover elements of P are appended. A module hidden by
   Features therefore returns to its previous place when re-enabled; with all
   modules visible the stored bytes equal P exactly (today's bytes).
7. Click: calls `onModuleClick(id)` (host handles `emit` + `navigate`);
   suppressed while a drag gesture is in progress. Rail drafts never hold
   navigation (no route guard).
7. Bottom-row buttons (Pet/Sync/Notif/Help): Pet calls `onPetToggle()` then
   the host emits `web:shell:pet-toggle`; Sync/Notif/Help are visual-only
   placeholders for W1 (no handler beyond logging).

**The rail-order controller** (`useRailOrderController`, `RailOrderController`)

- **Binding.** `usePrefAutosaveAsync("xai_rail_order", { validate })` on the
  registered path (`json` codec, registry default, today's exact bytes) with
  the strict A5 domain: a JSON array of strings with no string twice (`[]`,
  unknown ids and `settings` are valid). No registry, codec, default,
  ownership or lifecycle change; device key, so no account machinery.
- **Invalid or unreadable bytes are source-only**: objects, numbers,
  booleans, strings, `null`, unparsable bytes, non-string elements and
  repeated ids display D(`DEFAULT_RAIL_ORDER`, R) without throwing on any
  `/app` route; the Topbar status offers Reload only; mount, Reload and
  Discard never rewrite, purge or normalize the bytes. A drag over such a
  source is a set the engine refuses: a failed draft (Retry refused again,
  Discard, Export).
- **Drafts.** Each admitted drop is the field's exact draft object: it
  displays at once (also while the per-key lock is held) and only the
  matching latest success clears it (verified bytes or the engine's verified
  no-op). A newer drop supersedes. Failures (quota, throwing `getItem` /
  `setItem`, missing or rejected Web Lock, conflict, readback uncertainty,
  invalid or unavailable source) keep the dropped order displayed.
- **Retry** re-runs the held failed request exactly once with its own kind
  and token (inert while pending); **Discard** detaches the draft before the
  safe reload (zero set or remove attempts); **Reload** exists only for a
  source issue and refuses while a draft exists; **Export** downloads
  `rail-order-draft.json` from memory only:
  `{"version":1,"kind":"rail-order-draft","changes":{"device":{"railOrder":{"operation":"set","value":[…]}}}}`
  (the full merged order, hidden and unknown ids included).
- **Unload.** A `beforeunload` warning while a draft exists (pending or
  failed); none when clean or source-only. Zero storage attempts in the
  handler.
- **Sign-out step** `confirmSignOut(): Promise<boolean>`: no draft → `true`
  without a prompt; a draft → one `window.confirm` ("Your sidebar order
  change is not saved. Sign out and discard it?" / ZH). Cancel → `false`,
  draft kept; OK → draft discarded with zero writes, `true`. The host awaits
  it immediately **before** the Appearance step in both auth branches, so with
  both drafts the prompts are [rail, Appearance].
- **Lifetime.** Drafts live as long as the controller (App lifetime: route
  changes, Settings panes, popovers); a scope change remounts App and drops
  them (REL-09). Unmount detaches callbacks; late completions never revive
  discarded state.

**DOM contract** (preserved from prototype for CSS compatibility):

- Outer `<aside className="app-rail" data-pos={railPos}>`.
- Inner `.rail-avatar-wrap` (contains `<AvatarMenu/>` trigger button).
- Inner `.rail-items` (the 11 module buttons, including `search`).
- Inner `.rail-bottom` (the 4 utility buttons).
- Each button: `.rail-btn` + `.has-tip` + `data-tip="<label>"` + optional
  `.active` + `.dragging`.

### §2.3 `<Topbar>`

```ts
export interface TopbarProps {
  lang: Lang;
  setLang: (next: Lang) => void;
  theme: Theme;
  setTheme: (next: Theme) => void;
  density: Density;
  setDensity: (next: Density) => void;
  /** Called when the Settings gear icon is clicked. Host emits + navigates. */
  onOpenSettings: () => void;
  /** Optional command-palette opener (xai-web-cmdk P4). */
  onOpenSearch?: () => void;
  /** Optional premium tier badge node (gap-closure row #8 F1). */
  premiumBadge?: React.ReactNode;
  /**
   * Optional Appearance status node (CP-APPEARANCE-01), rendered immediately
   * after `premiumBadge` in `.topbar-controls`, before the appearance popover.
   */
  appearanceStatus?: React.ReactNode;
  /**
   * Optional rail-order status node (CP-APPRAIL-01), rendered immediately
   * after `appearanceStatus` in `.topbar-controls`, before the appearance popover.
   */
  railOrderStatus?: React.ReactNode;
}

export function Topbar(props: TopbarProps): JSX.Element;
```

**Behavior**

- Renders `web design/shell.jsx` lines 168-200 verbatim (modulo TSX +
  s(key) calls via `useI18n(lang)`).
- The search input is decorative — no `onChange` handler in v1. The
  `⌘K` `<span className="kbd">` is decorative too. (Deferred to a future
  search row per DESIGN.md §11.)
- Each option activation (`menuitemradio`) calls the matching `setLang` /
  `setTheme` / `setDensity` prop **exactly once** with the option's value and
  makes **zero Storage attempts** (CP-APPEARANCE-01). Persistence, failure
  recovery and the unsaved-change status belong to the host: `apps/web`
  passes the App-scoped Appearance controller's edits as these setters, and
  its display values as `lang` / `theme` / `density`. The former raw
  `persistAndSet` write path (which swallowed write failures) is removed.
- `appearanceStatus` (optional `ReactNode`, also on `ShellProps`, which only
  passes it through) is rendered immediately after `premiumBadge` in
  `.topbar-controls`. The shell never inspects it; the host passes the
  Appearance package's `<AppearanceStatus onReview>`, which renders nothing
  unless an Appearance change has a settled failure, so the clean-state
  Topbar markup is unchanged.
- `railOrderStatus` (optional `ReactNode`, also on `ShellProps`, which only
  passes it through) is rendered immediately after the `appearanceStatus`
  slot and before `.topbar-pref` (CP-APPRAIL-01). The host passes
  `<RailOrderStatus />`, which renders nothing (no DOM node) unless the
  current rail draft has been settled unsuccessful (it stays while a Retry of
  that draft is pending) or no draft exists and the stored order is invalid
  or unreadable. When rendered it is one `.rail-order-status` root holding a
  native disclosure button (`data-testid="rail-order-status"`,
  `aria-expanded`, `aria-controls="rail-order-panel"`, at least 44×44, icon
  only at 767 px and below) and, while open, a non-modal labelled panel
  (`role="dialog"`, `id="rail-order-panel"`) after it in DOM order: the
  message, then Retry, Discard and Export for a draft, or Reload only for a
  source issue. Escape closes it and returns focus to the button; a mousedown
  outside closes it. When the status unmounts while it holds focus (verified
  success, Discard, a Reload repair), focus moves to `.topbar-pref-trigger`.
  It never navigates and never retries by itself. Without a provider it
  renders nothing.
- Settings icon click → `props.onOpenSettings()`.

### §2.4 `<AvatarMenu>`

```ts
export interface AvatarMenuProps {
  /** Whether the menu popover is open. */
  open: boolean;
  /** Called when the scrim is clicked or Escape is pressed. */
  onClose: () => void;
  /** Settings entry handler — host emits + navigates. */
  onOpenSettings: () => void;
  /** Statistics entry handler — host emits + navigates. */
  onOpenStatistics: () => void;
  /** Sign-out handler — defaults to a placeholder (no v1 wiring). */
  onSignOut?: () => void;
}

export function AvatarMenu(props: AvatarMenuProps): JSX.Element | null;
```

**Behavior**

- Reads `lang` + `railPos` from `useWebShell()`.
- Renders nothing when `open === false`.
- Renders a scrim (`.avatar-menu-scrim`) for click-outside, plus the menu
  card (`.avatar-menu`).
- **Popover direction** (DESIGN.md §4.14):
  - `railPos === "left"`  → `.avatar-menu[data-anchor="left-top-right"]` (top-right展开)
  - `railPos === "right"` → `.avatar-menu[data-anchor="right-top-left"]`  (top-left展开)
  - `railPos === "top"`   → `.avatar-menu[data-anchor="top-bottom-left"]` (左下展开)
  - `railPos === "bottom"`→ `.avatar-menu[data-anchor="bottom-top-left"]` (左上展开)
- The actual offset values come from CSS in `packages/plugin-web-tokens/src/layout.css`
  (`.app-rail[data-pos="right"] .avatar-menu` etc., lines 105-171). The TSX
  only needs to set the parent rail's `data-pos`; the CSS handles
  positioning. The `data-anchor` attribute on `.avatar-menu` is an additive
  hook for future popover refinement and is not required by the existing CSS.
- Items:
  1. `Settings` → `props.onOpenSettings()` then `props.onClose()`.
  2. `Statistics` → `props.onOpenStatistics()` then `props.onClose()`.
  3. Divider.
  4. `Sign Out` → `props.onSignOut?.()` then `props.onClose()`. v1 default
     is to log a warning ("[xai-web-shell] sign-out not wired") and close.
- Escape key closes the menu (`document.addEventListener("keydown", ...)`
  inside `useEffect`, cleanup on unmount).

---

## §3 Host Integration Contract

The host (`apps/web/src/App.tsx`) is **not** part of this package's public
surface, but the shell's behavior depends on the host wiring it correctly.
This section describes the expected host shape.

### §3.1 Host state shape

```ts
// apps/web/src/App.tsx
function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [fontScale, setFontScale] = useState<number>(1);
  const [petOn, setPetOn] = useState<boolean>(true);
  const [accentHue, setAccentHue] = usePref("xai_accent_hue");
  const [railPos, setRailPos]     = usePref("xai_rail_pos");
  const [bgTone, setBgTone]       = usePref("xai_bg_tone");

  // useEffects fire apply* on every state change
  useEffect(() => applyTheme(theme), [theme]);
  useEffect(() => applyDensity(density), [density]);
  useEffect(() => applyFontScale(fontScale), [fontScale]);
  useEffect(() => applyAccentHue(accentHue), [accentHue]);
  useEffect(() => applyBgTone(bgTone), [bgTone]);
  useEffect(() => applyRailPos(railPos), [railPos]);

  // theme="system" listens to OS preference change
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <WebShellProvider modules={webModuleSlotRegistrations} lang={lang} railPos={railPos} petOn={petOn} setPetOn={setPetOn}>
      <Shell lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} density={density} setDensity={setDensity}>
        <Outlet />
      </Shell>
    </WebShellProvider>
  );
}
```

### §3.2 Module-click flow

```ts
// AppRail's onModuleClick prop wiring (inside Shell → AppRail)
const navigate = useNavigate();
const onModuleClick = (moduleId: ConsoleModuleId) => {
  emitWebEvent("web:shell:module-change", { moduleId, source: "app-rail" });
  navigate(`/app/${moduleId}`);
};
```

### §3.3 Pet toggle flow

```ts
const onPetToggle = () => {
  const next = !petOn;
  setPetOn(next);  // local state update (host)
  emitWebEvent("web:shell:pet-toggle", { on: next, source: "rail-bottom" });
};
```

### §3.4 Topbar Settings flow

```ts
const onOpenSettings = () => {
  emitWebEvent("web:shell:module-change", { moduleId: "settings", source: "shortcut" });
  navigate("/app/settings");
};
```

---

## §4 Persistence Contract (consumes `@repo/plugin-web-storage`)

| Pref key | Owner row | Used here for |
|---|---|---|
| `xai_rail_order` | xai-web-shell (this row) | AppRail drag-reorder through the App-scoped rail-order controller (`usePrefAutosaveAsync`, strict domain, one write per drop, R-1 merge; CP-APPRAIL-01) |
| `xai_rail_pos`   | xai-web-settings-appearance #22 (read here in v1) | host App.tsx; until #22 ships, this row owns runtime read/write |
| `xai_accent_hue` | xai-web-settings-appearance #22 (read here in v1) | host App.tsx |
| `xai_bg_tone`    | xai-web-settings-appearance #22 (read here in v1) | host App.tsx |

**Note on temporary ownership**: `xai_rail_pos`, `xai_accent_hue`, and
`xai_bg_tone` are owned conceptually by row #22 (Settings → Appearance). For
the W1 ship, the shell *reads* and *writes* them via `usePref` because no
Settings UI exists yet. When row #22 ships its Settings panel, it will
manage those values; the shell's read remains unchanged because the
persistence key is the contract.

---

## §5 Cross-Module Event Contract (consumes `@repo/xai-web-event-bus`)

This row EMITS the following typed events (already declared in
`packages/core/src/types/events.ts` by SHIPPED row #4):

| Event key | When emitted | Payload |
|---|---|---|
| `web:shell:module-change` | AppRail click; Topbar Settings click; AvatarMenu Settings/Statistics click | `{ moduleId, source: "app-rail" \| "shortcut", focusDate?, detailId? }` |
| `web:shell:pet-toggle`     | Rail-bottom Pet button click | `{ on: boolean, source: "rail-bottom" }` |

This row SUBSCRIBES to none. (Subscribers — statistics row #20, AI Chat row
#18 — listen via `useWebEventListener` in their own packages.)

---

## §6 Permissions / Idempotency / Ordering

- **Emit idempotency**: each user click → exactly one `web:shell:module-change`.
  Drag-reorder during navigation does NOT emit `web:shell:module-change`
  (it persists `xai_rail_order` only, exactly once per drop, and dispatches no
  `StorageEvent` and no `web:settings:preference-changed`).
- **Emit ordering**: emit fires BEFORE `navigate()` so subscribers can record
  the intent even if navigation is aborted by a guard.
- **Cross-tab**: `usePref` keys auto-sync across tabs via the `storage` event
  (verified in row #3 acceptance). When tab A reorders the rail, an idle rail
  in tab B follows the committed order; a drafted rail in tab B becomes a
  preserved conflict (Retry never overwrites; Discard adopts the committed
  order).
- **SSR**: this row is browser-only. The `Shell` component will no-op on
  `document.documentElement` mutations (the `apply*` helpers from row #2
  already guard `typeof document === "undefined"`).
- **Strict-mode**: every `useEffect` in the host pattern is idempotent
  (re-calling `applyTheme(theme)` twice is safe). The shell's own components
  do not register listeners that could leak under StrictMode double-mount.

---

## §7 Error Semantics

| Scenario | Behavior |
|---|---|
| `useWebShell()` called outside `<WebShellProvider>` | Throws `TypeError("[xai-web-shell] useWebShell must be inside <WebShellProvider>")`. |
| `useWebModuleRegistry()` called outside the provider | Throws the same TypeError. |
| `xai_rail_order` contains an id not in the registry (unknown id, `settings`, Features-hidden id) | Skipped for display; kept at its stored index by every drop (R-1 merge). |
| `xai_rail_order` holds malformed bytes or `getItem` throws | Source-only: the default display, the Topbar rail status with Reload; never a throw, never a rewrite (CP-APPRAIL-01). |
| A rail write fails (quota, lock, conflict, readback uncertainty) | The dropped order stays displayed as a draft; the Topbar status offers Retry, Discard and Export; the unload warning and the sign-out step protect it. |
| Registry module missing `icon` / `railOrder` / `i18nKey` | Falls back: `icon = "kanban"`, `railOrder = Number.MAX_SAFE_INTEGER` (sorted last), `i18nKey = "nav." + moduleId`. Warns once in DEV. |
| `emitWebEvent` throws (impossible per bus contract) | Caught by the bus; not the shell's concern. |
| HTML5 DnD `dataTransfer.setData` blocked (some browsers in iframes with sandbox) | Click handler still fires; drag silently no-ops. Documented but not blocking. |
| `applyTheme("system")` in non-`window` env | `apply*` is SSR-safe per row #2; no-op. |

---

## §8 Versioning

This package follows additive semantic versioning. Public surface changes
(adding a field to `WebModuleSlotRegistration`, adding an event emit)
require a minor bump and a coordinated W2 row update. Removing or renaming
a field requires a major bump and an ADR amendment.

The five `web:*` events this row emits are FROZEN by ADR-0007 §S7 and
declared in `@repo/core/types/events`. Adding a new event requires
appending to that EventMap (additive); this row does NOT modify the
EventMap.

---

## §9 Upstream Dependencies (consumed APIs)

| API | Source | Version |
|---|---|---|
| `useI18n(lang)` | `@repo/plugin-web-tokens` | workspace:* |
| `applyTheme` / `applyDensity` / `applyFontScale` / `applyAccentHue` / `applyBgTone` / `applyRailPos` | `@repo/plugin-web-tokens` | workspace:* |
| `usePref` / `WebPrefKey` / `PREF_REGISTRY` | `@repo/plugin-web-storage` | workspace:* |
| `emitWebEvent` / `useWebEventListener` | `@repo/xai-web-event-bus` | workspace:* |
| `WebModuleId` / `RailPos` / `EventMap` / `WebModuleRouteRegistration` types | `@repo/core/types` | workspace:^ |
| `useNavigate` / `useParams` / `<Outlet/>` | `react-router` | peer ^7.15 |

---

## §10 Downstream Consumers (who consumes this package)

- `apps/web/src/App.tsx` — host, mandatory.
- W2 module rows #6..#24 — indirectly via the `webModuleSlotRegistrations`
  array in `apps/web/src/routes/modules/registrations.tsx`. Each W2 row
  satisfies `WebModuleSlotRegistration` for its own slot.
- Statistics row #20, AI Chat row #18 — subscribe to `web:shell:module-change`
  via `@repo/xai-web-event-bus` (not via this package).
- Pet row #19 — subscribes to `web:shell:pet-toggle` (not via this package).
