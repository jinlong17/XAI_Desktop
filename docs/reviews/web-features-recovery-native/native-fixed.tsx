/**
 * Features native FIXED fixture, production App composition: CP-FEATURES-01 batch 27, contract §14 E9 (controls)
 * and E10 (reset). Parent-role native verifier; verification only. It repairs nothing, accepts nothing and changes
 * no product file. The before-stage ./native-app.tsx is not modified; this file follows its composition.
 *
 * Bundled by ./verify-native-fixed.mjs from stdin with resolveDir = an immutable `git archive` of the fixed
 * revision; every product module imported below comes from that archive (pinned, guarded).
 *
 * Composition = apps/web/src/main.tsx, i.e. the production App composition:
 *   - the module (and therefore stylesheet) order of main.tsx: AppProviders, the router module,
 *     @repo/plugin-web-tokens, apps/web/src/styles/global.css;
 *   - the production router INSTANCE exported by apps/web/src/routes/router.tsx under RouterProvider from
 *     "react-router/dom": /app/settings/features renders ProtectedAppRouteElement -> App (AccountStorageGate ->
 *     AccountDataGate -> CommandPaletteProvider -> WebShellProvider + Shell with AppRail and Topbar, DesktopPet,
 *     CommandPalette) -> AppRouteElement -> ComposedSettings (DepartureCoordinator, settingsDeparture) -> the real
 *     fixed Features pane with its usePrefAutosaveAsync bindings, mutatePref engine, registry and codec;
 *   - the production WebAuthSessionProvider with onIdentityChange = the production invalidateAccountIdentity.
 *
 * The ONLY synthetic input is the auth session: a client object whose auth.getSession resolves one fixed
 * authenticated session for a synthetic account (the shape of the product's own mock client in AppProviders.tsx).
 * Not mounted, as in the before fixture: AppProviders' component (no network client), bootstrapObservability(),
 * registerServiceWorker(), StrictMode (development build; contract §15 retained exclusion).
 *
 * Instruments live in ./native-fixed-prelude.js (window.__native); this module only adds archive-backed facts:
 * the real prefMutationLockName of every Features key, the real featurePrefKey/accountScope physical key, the
 * accountScope transition log and the production router location.
 */
import "./apps/web/src/providers/AppProviders";
import { router } from "./apps/web/src/routes/router";
import "@repo/plugin-web-tokens";
import "./apps/web/src/styles/global.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { WebAuthSessionProvider } from "@repo/web-auth-device-session/web";
import { invalidateAccountIdentity } from "./apps/web/src/providers/AccountStorageGate";
import { accountScope, generationMarkerKey, prefMutationLockName } from "@repo/plugin-web-storage";
import { featureIdOrder, featurePrefKey } from "@repo/plugin-web-settings-features-panel";
import type { FeatureId } from "@repo/plugin-web-settings-features-panel";
import { I18N } from "@repo/plugin-web-tokens";
import { webShellModuleRegistrations } from "./apps/web/src/routes/modules/shellRegistrations";

type NativeHooks = { next: () => number };
const hooks = (window as unknown as { __native?: NativeHooks }).__native;
if (!hooks) throw new Error("native-fixed-prelude.js must run before the fixture bundle");

const OWNER = "features-native-A";
const now = new Date("2026-10-04T00:00:00.000Z").toISOString();
const session = {
  access_token: "features-native-access-token",
  refresh_token: "features-native-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: OWNER,
    aud: "authenticated",
    role: "authenticated",
    email: "features-native-a@example.invalid",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: false,
  },
};
const authCalls = { getSession: 0, onAuthStateChange: 0, signOut: 0 };
const syntheticClient = {
  auth: {
    getSession: async () => { authCalls.getSession += 1; return { data: { session }, error: null }; },
    onAuthStateChange: () => { authCalls.onAuthStateChange += 1; return { data: { subscription: { unsubscribe: () => {} } } }; },
    signOut: async () => { authCalls.signOut += 1; return { error: null }; },
  },
};

// Account-scope transitions (the real accountScope from the archive), sequence-stamped.
type ScopeEntry = { seq: number; kind: string; accountId: string | null; generation: string | null; epoch: number };
const scopeLog: ScopeEntry[] = [];
const recordScope = (): void => {
  const scope = accountScope.capture();
  scopeLog.push({ seq: hooks.next(), kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch });
};
recordScope();
accountScope.subscribe(recordScope);

const nav = (lang: "en" | "zh"): Record<string, string> => I18N[lang].nav as unknown as Record<string, string>;
const verify = {
  composition: "production-app",
  instance: crypto.randomUUID(),
  owner: OWNER,
  markerKey: generationMarkerKey(OWNER),
  featureIds: [...featureIdOrder],
  featureKeys: featureIdOrder.map((id) => featurePrefKey(id)),
  physicalKeys: featureIdOrder.map((id) => accountScope.physicalKey(featurePrefKey(id), accountScope.capture())),
  lockName: (id: FeatureId) => prefMutationLockName(accountScope.physicalKey(featurePrefKey(id), accountScope.capture())),
  railIds: webShellModuleRegistrations.filter((entry) => entry.showInRail !== false).map((entry) => entry.moduleId),
  nav: { en: nav("en"), zh: nav("zh") },
  rail: () => [...document.querySelectorAll(".app-rail .rail-items .rail-btn")].map((button) => button.getAttribute("aria-label")),
  scope: () => {
    const scope = accountScope.capture();
    return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch };
  },
  scopeAfter: (mark: number) => scopeLog.filter((entry) => entry.seq > mark),
  authCalls: () => ({ ...authCalls }),
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
  <WebAuthSessionProvider client={syntheticClient as never} onIdentityChange={invalidateAccountIdentity}>
    <RouterProvider router={router} />
  </WebAuthSessionProvider>,
);
