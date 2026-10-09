/**
 * Features native HOST-MATRIX fixture, Settings host composition: CP-FEATURES-01 batch 28, contract §14 E12
 * (contract §9 host matrix rows a–n and beforeunload). Parent-role native verifier; verification only. It
 * repairs nothing, accepts nothing and changes no product file. The earlier fixtures in this directory and the
 * accepted Sticky host fixture (../web-sticky-recovery-native/native-host.tsx) are not modified; this file
 * follows their composition.
 *
 * Bundled by ./verify-native-host.mjs (through ./native-host-harness.mjs) from stdin with resolveDir = an
 * immutable `git archive` of the fixed revision; every product module imported below comes from that archive
 * (pinned `@repo/*` exports, guarded against any checkout module).
 *
 * Composition ("actual composition, full Shell", contract §9):
 *   - the production Shell (AppRail, Topbar) inside WebShellProvider, whose modules are the production
 *     webShellModuleRegistrations filtered by the production useFeaturePrefs + filterModulesByFeaturePrefs
 *     exactly as apps/web/src/App.tsx:179-183 derives them, so a committed "off" leaves the rail;
 *   - the production ComposedSettings (composedSettingsRegistration: DepartureCoordinator, settingsDeparture,
 *     sidebar and detail) under React Router's production createBrowserRouter, mounted through RouterProvider
 *     from "react-router/dom" as in apps/web/src/main.tsx;
 *   - module routes (/app/:moduleId/*): for the 8 toggleable modules the production withDisabledFallback guard
 *     (its real legacy usePref reader and the real DisabledFeatureFallback) wraps a placeholder module body, so
 *     a held release to a module that was turned off shows exactly what the production wrapper decides (row n);
 *     other module ids render a plain placeholder destination;
 *   - the real fixed Features pane, usePrefAutosaveAsync bindings, mutatePref engine, registry, codec and the
 *     real accountScope, driven through real activate/lock transitions (synthetic account ids; no auth gate);
 *   - sign-out through the real departure preflight requestSettingsDeparture("sign-out") (contract §15
 *     retained exclusion: sign-out through the direct preflight).
 *
 * Instruments live in ./native-host-prelude.js (window.__native); this module only adds archive-backed facts:
 * the router, its location and commit trace, real lock names, scope transitions, sign-out results and unmount.
 */
import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, useParams } from "react-router";
// The production entry (apps/web/src/main.tsx) mounts RouterProvider from "react-router/dom".
import { RouterProvider } from "react-router/dom";
import { accountScope, generationMarkerKey, prefMutationLockName } from "@repo/plugin-web-storage";
import { WebShellProvider, Shell } from "@repo/xai-web-shell";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import {
  featureIdOrder,
  featurePrefKey,
  filterModulesByFeaturePrefs,
  useFeaturePrefs,
  withDisabledFallback,
} from "@repo/plugin-web-settings-features-panel";
import type { FeatureId } from "@repo/plugin-web-settings-features-panel";
import { webShellModuleRegistrations } from "./apps/web/src/routes/modules/shellRegistrations";
import { composedSettingsRegistration } from "./apps/web/src/routes/modules/composedSettingsRegistration";
import { requestSettingsDeparture } from "./apps/web/src/routes/modules/settingsDeparture";
import "@repo/plugin-web-tokens";
import "./apps/web/src/styles/global.css";

type NativeHooks = { next: () => number; mark: () => number; native: { set: (key: string, value: string) => void; get: (key: string) => string | null; remove: (key: string) => void } };
const hooks = (window as unknown as { __native?: NativeHooks }).__native;
if (!hooks) throw new Error("native-host-prelude.js must run before the fixture bundle");

const OWNER_A = "features-host-A";
const OWNER_B = "features-host-B";
const LOCKED_ID = "features-host-locked";
const GENERATION = "g1";
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;

// ---------------------------------------------------------------------------------------------------
// Real accountScope transitions (device keys must not care; the host decision must renew)
// ---------------------------------------------------------------------------------------------------
type ScopeView = { kind: string; accountId: string | null; generation: string | null; epoch: number };
const viewScope = (scope: ReturnType<typeof accountScope.capture>): ScopeView =>
  ({ kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch });
const scopeLog: Array<ScopeView & { seq: number }> = [];
accountScope.subscribe(() => { scopeLog.push({ seq: hooks.next(), ...viewScope(accountScope.capture()) }); });
/** Real transition; the marker is written with the uninstrumented native setter (never an app attempt). */
function activate(owner: string): ScopeView {
  hooks.native.set(generationMarkerKey(owner), JSON.stringify({ generation: GENERATION, migrationId: "features-host", previous: null }));
  return viewScope(accountScope.activate(accountScope.lock(owner), GENERATION));
}
activate(OWNER_A);

// ---------------------------------------------------------------------------------------------------
// Actual composition
// ---------------------------------------------------------------------------------------------------
const Composed = composedSettingsRegistration.children[0]!.render as unknown as () => React.ReactElement;
function placeholder(moduleId: string): WebModuleSlotRegistration {
  function PlaceholderBody(): React.ReactElement {
    return <div className="native-destination" data-module-id={moduleId}>Destination outside Settings ({moduleId})</div>;
  }
  return {
    moduleId: moduleId as never,
    label: moduleId,
    defaultChildPath: "",
    children: [{ path: "", render: PlaceholderBody }, { path: "*", render: PlaceholderBody }],
    showInRail: false,
  } as unknown as WebModuleSlotRegistration;
}
const guardedModules = new Map<string, WebModuleSlotRegistration>(
  featureIdOrder.map((id) => [id, withDisabledFallback(placeholder(id), id)]),
);
function ModuleDestination(): React.ReactElement {
  const params = useParams();
  const moduleId = params.moduleId ?? "";
  const registration = guardedModules.get(moduleId);
  const Render = registration?.children[0]?.render as unknown as ((props: Record<string, unknown>) => React.ReactElement) | undefined;
  if (Render) return <Render moduleId={moduleId} childPath="" capabilities={{}} />;
  return <div className="native-destination" data-module-id={moduleId}>Destination outside Settings ({moduleId})</div>;
}
const router = createBrowserRouter([
  {
    path: "/app",
    element: <Shell lang="en" setLang={() => {}} theme="light" setTheme={() => {}} density="comfortable" setDensity={() => {}} />,
    children: [
      { path: "settings/*", element: <Composed /> },
      { path: ":moduleId/*", element: <ModuleDestination /> },
    ],
  },
]);
const originalNavigate = router.navigate;

// Router trace: every notification, and a commit whenever the router location key changes.
type Commit = { seq: number; key: string; pathname: string; search: string; hash: string; state: unknown; action: string };
const routerLog: Array<{ seq: number; key: string; path: string; action: string; navigation: string; blockers: string[] }> = [];
const commits: Commit[] = [];
let lastKey = router.state.location.key;
router.subscribe((state) => {
  const seq = hooks.next();
  routerLog.push({ seq, key: state.location.key, path: state.location.pathname, action: String(state.historyAction), navigation: state.navigation.state, blockers: [...state.blockers.values()].map((blocker) => blocker.state) });
  if (state.location.key !== lastKey) {
    lastKey = state.location.key;
    commits.push({ seq, key: state.location.key, pathname: state.location.pathname, search: state.location.search, hash: state.location.hash, state: clone(state.location.state ?? null), action: String(state.historyAction) });
  }
});

function HostRoot(): React.ReactElement {
  // apps/web/src/App.tsx:179-183: the rail shows only modules whose committed feature pref is not false.
  const featurePrefs = useFeaturePrefs();
  const modules = React.useMemo(() => filterModulesByFeaturePrefs(webShellModuleRegistrations, featurePrefs), [featurePrefs]);
  return (
    <WebShellProvider modules={modules} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
      <RouterProvider router={router} />
    </WebShellProvider>
  );
}

// ---------------------------------------------------------------------------------------------------
// Geometry helpers for row h (offscreen recovery)
// ---------------------------------------------------------------------------------------------------
const scrollContainerOf = (element: Element): Element => {
  let node: Element | null = element.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) return node;
    node = node.parentElement;
  }
  return document.scrollingElement ?? document.documentElement;
};
const recoveryBlock = (id: FeatureId): Element | null => document.querySelector(`.features-pane [data-feature-id="${id}"] .features-recovery-field`);

const app = createRoot(document.getElementById("root")!);
let mounted = true;
const signouts: Record<string, string> = {};

const verify = {
  composition: "settings-host-matrix",
  instance: crypto.randomUUID(),
  owners: { A: OWNER_A, B: OWNER_B, locked: LOCKED_ID },
  featureIds: [...featureIdOrder],
  featureKeys: featureIdOrder.map((id) => featurePrefKey(id)),
  physicalKeys: featureIdOrder.map((id) => accountScope.physicalKey(featurePrefKey(id), accountScope.capture())),
  lockName: (id: FeatureId) => prefMutationLockName(accountScope.physicalKey(featurePrefKey(id), accountScope.capture())),
  router,
  physical: () => Object.fromEntries(featureIdOrder.map((id) => [id, hooks.native.get(featurePrefKey(id))])),
  /** Fixture seeding with the uninstrumented native functions (never counted as application attempts). */
  seedRaw: (id: FeatureId, raw: string | null) => {
    if (raw === null) hooks.native.remove(featurePrefKey(id));
    else hooks.native.set(featurePrefKey(id), raw);
    return hooks.native.get(featurePrefKey(id));
  },
  scope: () => viewScope(accountScope.capture()),
  scopeAfter: (mark: number) => scopeLog.filter((entry) => entry.seq > mark),
  activateA: () => activate(OWNER_A),
  activateB: () => activate(OWNER_B),
  lockScope: () => viewScope(accountScope.lock(LOCKED_ID)),
  location: () => ({
    pathname: router.state.location.pathname,
    key: router.state.location.key,
    search: router.state.location.search,
    hash: router.state.location.hash,
    state: clone(router.state.location.state ?? null),
  }),
  windowPath: () => location.pathname,
  commitsAfter: (mark: number) => commits.filter((entry) => entry.seq > mark),
  routerAfter: (mark: number) => routerLog.filter((entry) => entry.seq > mark),
  navigateWrapped: () => router.navigate !== originalNavigate,
  paneId: () => document.querySelector(".settings-detail")?.getAttribute("data-pane") ?? null,
  featuresMounted: () => Boolean(document.querySelector('.settings-detail[data-pane="features"] .features-pane')),
  rail: () => [...document.querySelectorAll(".app-rail .rail-items .rail-btn")].map((button) => button.getAttribute("aria-label")),
  destination: () => {
    const fallback = document.querySelector(".disabled-feature-fallback");
    const placeholderBody = document.querySelector(".native-destination");
    return {
      fallback: fallback ? { featureId: fallback.getAttribute("data-feature-id"), title: (fallback.querySelector("h2")?.textContent ?? "").trim(), role: fallback.getAttribute("role") } : null,
      placeholder: placeholderBody ? placeholderBody.getAttribute("data-module-id") : null,
    };
  },
  sidebarRows: () => [...document.querySelectorAll(".settings-sidebar .list-row")].map((row) => {
    const rect = row.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return { label: (row.textContent ?? "").trim(), active: row.getAttribute("data-active"), uncovered: Boolean(hit && row.contains(hit)) };
  }),
  visibility: () => document.visibilityState,
  /** Measures one field's recovery block against its scroll container and the viewport. */
  recoveryGeometry: (id: FeatureId) => {
    const block = recoveryBlock(id);
    if (!block) return null;
    const container = scrollContainerOf(block);
    const rect = block.getBoundingClientRect();
    const box = container === document.scrollingElement || container === document.documentElement ? { top: 0, bottom: innerHeight } : container.getBoundingClientRect();
    const visibleTop = Math.max(box.top, 0);
    const visibleBottom = Math.min(box.bottom, innerHeight);
    return {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      visibleTop: Math.round(visibleTop),
      visibleBottom: Math.round(visibleBottom),
      container: container === document.scrollingElement ? "document" : `${container.tagName.toLowerCase()}.${[...container.classList].join(".")}`,
      scrollTop: Math.round(container.scrollTop),
      offscreen: rect.bottom <= visibleTop || rect.top >= visibleBottom,
    };
  },
  /** Scrolls the Features pane's scroll container to its end (recovery blocks in the first card row leave view). */
  scrollPaneToEnd: () => {
    const pane = document.querySelector(".features-pane");
    if (!pane) return null;
    const container = scrollContainerOf(pane);
    container.scrollTop = container.scrollHeight;
    return { container: container === document.scrollingElement ? "document" : `${container.tagName.toLowerCase()}.${[...container.classList].join(".")}`, scrollTop: Math.round(container.scrollTop), scrollHeight: container.scrollHeight, clientHeight: container.clientHeight };
  },
  signouts,
  signout(tag: string) {
    signouts[tag] = "pending";
    void requestSettingsDeparture("sign-out").then((value) => { signouts[tag] = String(value); });
  },
  mounted: () => mounted,
  unmount: () => {
    app.unmount();
    mounted = false;
    return document.getElementById("root")?.childElementCount ?? -1;
  },
};
(window as unknown as { verify: typeof verify }).verify = verify;

app.render(<HostRoot />);
