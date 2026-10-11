/**
 * Features native FIXED fixture, Settings host composition: CP-FEATURES-01 batch 27, contract §14 E11 (on-disk
 * export). Parent-role native verifier; verification only. It repairs nothing, accepts nothing and changes no
 * product file.
 *
 * Bundled by ./verify-native-fixed.mjs from stdin with resolveDir = an immutable `git archive` of the fixed
 * revision; every product module imported below comes from that archive (pinned, guarded).
 *
 * Why a second composition: contract §8 shapes 7 and 8 need a fresh locked export after A -> locked and a fresh B
 * export after A -> B while the Features pane stays mounted (§7 "Survival while mounted"). In the production App
 * the AccountDataGate keys its business subtree by scope kind, account, generation and epoch, so every scope
 * change unmounts the pane by design (forced-authentication durability is REL-09, contract §7 and §16). This
 * fixture therefore follows the accepted Sticky native export composition (../web-sticky-recovery-native/
 * native.tsx, not modified), the "actual composition, full Shell" of contract §9:
 *   - the production Shell (AppRail, Topbar) inside WebShellProvider with the production
 *     webShellModuleRegistrations;
 *   - the production ComposedSettings (composedSettingsRegistration: DepartureCoordinator, settingsDeparture,
 *     sidebar and detail) under React Router's production createBrowserRouter, starting under /app/settings;
 *   - the real fixed Features pane, usePrefAutosaveAsync bindings, mutatePref engine, registry, codec and the real
 *     accountScope, driven through real activate/lock transitions (synthetic account ids, no auth gate).
 *
 * Instruments live in ./native-fixed-prelude.js (window.__native); this module adds archive-backed facts only.
 */
import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { accountScope, generationMarkerKey, prefMutationLockName } from "@repo/plugin-web-storage";
import { WebShellProvider, Shell } from "@repo/xai-web-shell";
import { featureIdOrder, featurePrefKey } from "@repo/plugin-web-settings-features-panel";
import type { FeatureId } from "@repo/plugin-web-settings-features-panel";
import { webShellModuleRegistrations } from "./apps/web/src/routes/modules/shellRegistrations";
import { composedSettingsRegistration } from "./apps/web/src/routes/modules/composedSettingsRegistration";
import "@repo/plugin-web-tokens";
import "./apps/web/src/styles/global.css";

type NativeHooks = { next: () => number; native: { set: (key: string, value: string) => void } };
const hooks = (window as unknown as { __native?: NativeHooks }).__native;
if (!hooks) throw new Error("native-fixed-prelude.js must run before the fixture bundle");

const OWNER_A = "features-native-A";
const OWNER_B = "features-native-B";
const LOCKED_ID = "features-native-locked";
const GENERATION = "g1";

type ScopeView = { kind: string; accountId: string | null; generation: string | null; epoch: number };
const viewScope = (scope: ReturnType<typeof accountScope.capture>): ScopeView =>
  ({ kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch });
const scopeLog: Array<ScopeView & { seq: number }> = [];
accountScope.subscribe(() => { scopeLog.push({ seq: hooks.next(), ...viewScope(accountScope.capture()) }); });
/** Real transition; the marker is written with the uninstrumented native setter (never an app attempt). */
function activate(owner: string): ScopeView {
  hooks.native.set(generationMarkerKey(owner), JSON.stringify({ generation: GENERATION, migrationId: "features-native", previous: null }));
  return viewScope(accountScope.activate(accountScope.lock(owner), GENERATION));
}
activate(OWNER_A);

if (!location.pathname.startsWith("/app/")) history.replaceState(null, "", "/app/settings/about");
const Composed = composedSettingsRegistration.children[0]!.render;
function Destination(): React.ReactElement {
  return <div className="native-destination">Destination outside Settings</div>;
}
const router = createBrowserRouter([
  {
    path: "/app",
    element: <Shell lang="en" setLang={() => {}} theme="light" setTheme={() => {}} density="comfortable" setDensity={() => {}} />,
    children: [
      { path: "settings/*", element: <Composed /> },
      { path: ":moduleId/*", element: <Destination /> },
    ],
  },
]);

const verify = {
  composition: "settings-host",
  instance: crypto.randomUUID(),
  owners: { A: OWNER_A, B: OWNER_B, locked: LOCKED_ID },
  featureIds: [...featureIdOrder],
  featureKeys: featureIdOrder.map((id) => featurePrefKey(id)),
  physicalKeys: featureIdOrder.map((id) => accountScope.physicalKey(featurePrefKey(id), accountScope.capture())),
  lockName: (id: FeatureId) => prefMutationLockName(accountScope.physicalKey(featurePrefKey(id), accountScope.capture())),
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
    state: router.state.location.state ?? null,
  }),
};
(window as unknown as { verify: typeof verify }).verify = verify;

createRoot(document.getElementById("root")!).render(
  <WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={() => {}}>
    <RouterProvider router={router} />
  </WebShellProvider>,
);
