/**
 * Features native BEFORE fixture: CP-FEATURES-01 batch 24, contract §14 E4 (parent-role native verifier).
 * Verification only; it repairs nothing, accepts nothing and changes no product file.
 *
 * Bundled by ./verify-native-before.mjs from stdin with resolveDir = an immutable `git archive` of the
 * revision under test; every product module imported below comes from that archive (pinned, guarded).
 *
 * Composition = apps/web/src/main.tsx, i.e. the production App composition:
 *   - the same module (and therefore stylesheet) order as main.tsx: AppProviders, the router module,
 *     @repo/plugin-web-tokens, apps/web/src/styles/global.css;
 *   - the production router INSTANCE exported by apps/web/src/routes/router.tsx
 *     (createBrowserRouter(webHostRouteObjects)) rendered by RouterProvider from "react-router/dom", so
 *     /app/* renders ProtectedAppRouteElement -> App (AccountStorageGate -> AccountDataGate ->
 *     CommandPaletteProvider -> WebShellProvider + Shell with AppRail and Topbar, DesktopPet,
 *     CommandPalette) and /app/settings/features renders AppRouteElement -> ComposedSettings with the
 *     real Features pane, its shared SettingsFooter and legacy usePref bindings;
 *   - the production WebAuthSessionProvider with onIdentityChange = the production
 *     invalidateAccountIdentity, as AppProviders passes it.
 *
 * The ONLY synthetic input is the auth session (contract §12 "Native before"): the provider receives a
 * client object whose auth.getSession resolves one fixed authenticated session for a synthetic account
 * (the shape of the product's own mock client in AppProviders.tsx). useWebAuthSession() therefore serves
 * App, AccountStorageGate and the route gates from the real provider and context. Differences from
 * main.tsx: AppProviders' component (its AccountDeletionRecoveryBridge and TodoWebRuntimeBridge) is not
 * mounted because there is no network client; bootstrapObservability() and registerServiceWorker() are
 * not called; StrictMode is not used (development build; contract §15 retained exclusion).
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
import { accountScope, generationMarkerKey, PREF_REGISTRY } from "@repo/plugin-web-storage";
import { featureIdOrder, featurePrefKey } from "@repo/plugin-web-settings-features-panel";
import { I18N } from "@repo/plugin-web-tokens";
import { webShellModuleRegistrations } from "./apps/web/src/routes/modules/shellRegistrations";

type NativeHooks = { next: () => number };
const hooks = (window as unknown as { __native?: NativeHooks }).__native;
if (!hooks) throw new Error("native-prelude.js must run before the fixture bundle");

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
  owner: OWNER,
  markerKey: generationMarkerKey(OWNER),
  featureIds: [...featureIdOrder],
  featureKeys: featureIdOrder.map((id) => featurePrefKey(id)),
  railIds: webShellModuleRegistrations.filter((entry) => entry.showInRail !== false).map((entry) => entry.moduleId),
  railDefault: [...(PREF_REGISTRY.xai_rail_order.default as readonly string[])],
  nav: { en: nav("en"), zh: nav("zh") },
  scope: () => {
    const scope = accountScope.capture();
    return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch };
  },
  scopeAfter: (mark: number) => scopeLog.filter((entry) => entry.seq > mark),
  authCalls: () => ({ ...authCalls }),
  location: () => ({ pathname: router.state.location.pathname, key: router.state.location.key }),
};
(window as unknown as { verify: typeof verify }).verify = verify;

createRoot(document.getElementById("root")!).render(
  <WebAuthSessionProvider client={syntheticClient as never} onIdentityChange={invalidateAccountIdentity}>
    <RouterProvider router={router} />
  </WebAuthSessionProvider>,
);
