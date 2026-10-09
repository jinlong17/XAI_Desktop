/**
 * AppRail order native BEFORE fixture, production App composition: CP-APPRAIL-01 batch 58, contract r1 §12
 * "Native before" and §15 E4. Parent-role native verifier; verification only. It repairs nothing, accepts nothing
 * and changes no product file. It follows the composition of ../web-appearance-recovery-native/native-fixed-app.tsx
 * (read, not imported or modified) exactly and only adds archive-backed facts for the rail-order key.
 *
 * Bundled by ./verify-native-before.mjs from stdin with resolveDir = an immutable `git archive` of the revision
 * under test; every product module imported below comes from that archive (pinned, guarded).
 *
 * Composition = apps/web/src/main.tsx, i.e. the production App composition (contract §9 "Composition"):
 *   - the same module (and therefore stylesheet) order as main.tsx: the observability runtime, AppProviders,
 *     the router module, the service-worker module, @repo/plugin-web-tokens, apps/web/src/styles/global.css.
 *     Importing only evaluates them; bootstrapObservability() and registerServiceWorker() are not called;
 *   - the production router INSTANCE exported by apps/web/src/routes/router.tsx rendered by RouterProvider from
 *     "react-router/dom", as in main.tsx, so /app/* renders ProtectedAppRouteElement -> App (AccountStorageGate ->
 *     AccountDataGate -> CommandPaletteProvider -> AppInner with the App-scoped Appearance controller, the Features
 *     filter (useFeaturePrefs + filterModulesByFeaturePrefs) -> WebShellProvider + Shell with the real AppRail (legacy
 *     usePref("xai_rail_order") binding, HTML5 drag handlers), AvatarMenu, SignOutConfirmDialog and Topbar, DesktopPet,
 *     CommandPalette) under the production `app` route error boundary, and /app/settings/* renders ComposedSettings
 *     (DepartureCoordinator, settingsDeparture) with the real Features pane;
 *   - the production WebAuthSessionProvider with onIdentityChange = the production invalidateAccountIdentity.
 *
 * The ONLY synthetic input is the auth session (contract §9, §12): the provider receives a client object whose
 * auth.getSession resolves one fixed authenticated session for a synthetic account (the shape of the product's
 * own mock client in AppProviders.tsx). App.handleSignOut therefore takes its fallback (no coordinator) branch.
 * Not mounted: AppProviders' component (AccountDeletionRecoveryBridge, TodoWebRuntimeBridge; no network client) and
 * StrictMode (development build; contract §17 retained exclusion).
 *
 * Instruments live in ./native-before-prelude.js (window.__native). window.verify exposes read-only facts: the
 * production rail registrations (ids, railOrder, showInRail), the archive's own nav labels (EN/ZH) and Features-pane
 * labels, the registry default of xai_rail_order, the real prefMutationLockName and physical key of xai_rail_order,
 * its lifecycle classification, the account-scope transition log, the auth call counters, the production router
 * location and a per-document instance id.
 */
import "./apps/web/src/observability/runtime";
import "./apps/web/src/providers/AppProviders";
import { router } from "./apps/web/src/routes/router";
import "./apps/web/src/service-worker/register";
import "@repo/plugin-web-tokens";
import "./apps/web/src/styles/global.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { WebAuthSessionProvider } from "@repo/web-auth-device-session/web";
import { invalidateAccountIdentity } from "./apps/web/src/providers/AccountStorageGate";
import { webShellModuleRegistrations } from "./apps/web/src/routes/modules/shellRegistrations";
import { accountScope, generationMarkerKey, prefMutationLockName, lifecycleForKey, PREF_REGISTRY } from "@repo/plugin-web-storage";
import { I18N } from "@repo/plugin-web-tokens";

type NativeHooks = { next: () => number };
const hooks = (window as unknown as { __native?: NativeHooks }).__native;
if (!hooks) throw new Error("native-before-prelude.js must run before the fixture bundle");

const OWNER = "apprail-native-A";
const now = new Date("2026-10-09T00:00:00.000Z").toISOString();
const session = {
  access_token: "apprail-native-access-token",
  refresh_token: "apprail-native-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: OWNER,
    aud: "authenticated",
    role: "authenticated",
    email: "apprail-native-a@example.invalid",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: false,
  },
};
const authCalls: Array<{ seq: number; call: string }> = [];
const syntheticClient = {
  auth: {
    getSession: async () => { authCalls.push({ seq: hooks.next(), call: "getSession" }); return { data: { session }, error: null }; },
    onAuthStateChange: () => { authCalls.push({ seq: hooks.next(), call: "onAuthStateChange" }); return { data: { subscription: { unsubscribe: () => {} } } }; },
    signOut: async () => { authCalls.push({ seq: hooks.next(), call: "signOut" }); return { error: null }; },
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

const RAIL_KEY = "xai_rail_order";
type Registration = { moduleId: string; showInRail?: boolean; railOrder?: number };
const registrations = (webShellModuleRegistrations as unknown as Registration[]).map((entry) => ({
  moduleId: entry.moduleId, showInRail: entry.showInRail !== false, railOrder: typeof entry.railOrder === "number" ? entry.railOrder : null,
}));
const navOf = (lang: "en" | "zh") => ({ ...(I18N[lang].nav as unknown as Record<string, string>) });
const settingsOf = (lang: "en" | "zh") => I18N[lang].settings as unknown as Record<string, string>;
const avatarOf = (lang: "en" | "zh") => I18N[lang].avatar as unknown as Record<string, string>;
const verify = {
  composition: "production-app",
  instance: crypto.randomUUID(),
  owner: OWNER,
  markerKey: generationMarkerKey(OWNER),
  railKey: RAIL_KEY,
  registrations,
  registryDefault: (PREF_REGISTRY as unknown as Record<string, { default: unknown; codec: string }>)[RAIL_KEY]?.default ?? null,
  registryCodec: (PREF_REGISTRY as unknown as Record<string, { default: unknown; codec: string }>)[RAIL_KEY]?.codec ?? null,
  lifecycle: lifecycleForKey(RAIL_KEY),
  /** The physical key and the real per-key lock name the engine uses for xai_rail_order (a device key). */
  physicalKey: () => accountScope.physicalKey(RAIL_KEY as never, accountScope.capture()),
  lockName: () => prefMutationLockName(accountScope.physicalKey(RAIL_KEY as never, accountScope.capture())),
  labels: {
    nav: { en: navOf("en"), zh: navOf("zh") },
    features: { en: settingsOf("en").features ?? null, zh: settingsOf("zh").features ?? null },
    signOut: { en: avatarOf("en").sign_out, zh: avatarOf("zh").sign_out },
  },
  scope: () => {
    const scope = accountScope.capture();
    return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch };
  },
  scopeAfter: (mark: number) => scopeLog.filter((entry) => entry.seq > mark),
  authCalls: () => authCalls.map((entry) => entry.call),
  authAfter: (mark: number) => authCalls.filter((entry) => entry.seq > mark).map((entry) => entry.call),
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
