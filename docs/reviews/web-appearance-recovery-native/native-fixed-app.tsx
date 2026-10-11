/**
 * Appearance native FIXED fixture, production App composition: CP-APPEARANCE-01 batch 43, contract r3 §14 E9
 * (controls), E10 (reset) and E11 (export). Parent-role native verifier; verification only. It repairs nothing,
 * accepts nothing and changes no product file. The before-stage ./native-app.tsx is not modified; this file follows
 * its composition exactly and only adds archive-backed facts for the fixed stage.
 *
 * Bundled by ./verify-native-fixed.mjs from stdin with resolveDir = an immutable `git archive` of the fixed
 * revision; every product module imported below comes from that archive (pinned, guarded).
 *
 * Composition = apps/web/src/main.tsx, i.e. the production App composition (contract §9 "Composition"):
 *   - the same module (and therefore stylesheet) order as main.tsx: the observability runtime, AppProviders,
 *     the router module, the service-worker module, @repo/plugin-web-tokens, apps/web/src/styles/global.css.
 *     Importing only evaluates them; bootstrapObservability() and registerServiceWorker() are not called;
 *   - the production router INSTANCE exported by apps/web/src/routes/router.tsx
 *     (createBrowserRouter(webHostRouteObjects)) rendered by RouterProvider from "react-router/dom", as in
 *     main.tsx, so /app/* renders ProtectedAppRouteElement -> App (AccountStorageGate -> AccountDataGate ->
 *     CommandPaletteProvider -> AppInner with the ONE App-scoped Appearance controller -> AppearanceProvider ->
 *     WebShellProvider + Shell with AppRail and Topbar (and its appearanceStatus slot), DesktopPet,
 *     CommandPalette) under the production `app` route error boundary, and /app/settings/appearance renders
 *     AppRouteElement -> ComposedSettings (DepartureCoordinator, settingsDeparture) -> the real fixed Appearance
 *     pane (a view of the App controller), its bottom action area, usePrefAutosaveAsync, mutatePref, registry
 *     and codecs;
 *   - the production WebAuthSessionProvider with onIdentityChange = the production invalidateAccountIdentity,
 *     as AppProviders passes it.
 *
 * The ONLY synthetic input is the auth session (contract §9, §12): the provider receives a client object whose
 * auth.getSession resolves one fixed authenticated session for a synthetic account (the shape of the product's
 * own mock client in AppProviders.tsx). Not mounted, as in the before fixture: AppProviders' component
 * (AccountDeletionRecoveryBridge, TodoWebRuntimeBridge; no network client), StrictMode (development build;
 * contract §15 retained exclusion).
 *
 * Instruments live in ./native-fixed-prelude.js (window.__native). window.verify exposes read-only facts: product
 * labels from the archive's own I18N and Appearance constants, the real prefMutationLockName and physical key of
 * every Appearance key, lifecycle classification, the account-scope transition log, the auth call counters, the
 * production router location and a per-document instance id.
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
import { accountScope, generationMarkerKey, prefMutationLockName, lifecycleForKey } from "@repo/plugin-web-storage";
import { I18N } from "@repo/plugin-web-tokens";
import { BG_TONES, HUE_PRESETS, RAIL_POSITIONS, appearanceDefaults } from "@repo/plugin-web-settings-appearance";

type NativeHooks = { next: () => number };
const hooks = (window as unknown as { __native?: NativeHooks }).__native;
if (!hooks) throw new Error("native-fixed-prelude.js must run before the fixture bundle");

const OWNER = "appearance-native-A";
const now = new Date("2026-10-05T00:00:00.000Z").toISOString();
const session = {
  access_token: "appearance-native-access-token",
  refresh_token: "appearance-native-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: OWNER,
    aud: "authenticated",
    role: "authenticated",
    email: "appearance-native-a@example.invalid",
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

const KEYS = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_pref_font_scale", "xai_accent_hue", "xai_rail_pos", "xai_bg_tone"] as const;
const labelSet = (lang: "en" | "zh") => {
  const settings = I18N[lang].settings as unknown as Record<string, string>;
  const nav = I18N[lang].nav as unknown as Record<string, string>;
  const avatar = I18N[lang].avatar as unknown as Record<string, string>;
  return {
    appearance: settings.appearance, about: settings.about, language: settings.language, theme: settings.theme, density: settings.density,
    accent: settings.accent_color, bg: settings.bg_palette, rail: settings.sidebar_position, font: settings.font_scale,
    light: settings.light, dark: settings.dark, system: settings.system, comfortable: settings.comfortable, compact: settings.compact,
    pet: nav.pet, calendar: nav.calendar, settingsNav: nav.settings, signOut: avatar.sign_out,
  };
};
const verify = {
  composition: "production-app",
  instance: crypto.randomUUID(),
  owner: OWNER,
  markerKey: generationMarkerKey(OWNER),
  keys: [...KEYS],
  /** The physical key and the real per-key lock name the engine uses for each Appearance key (device keys). */
  physicalKeys: () => Object.fromEntries(KEYS.map((key) => [key, accountScope.physicalKey(key, accountScope.capture())])),
  lockNames: () => Object.fromEntries(KEYS.map((key) => [key, prefMutationLockName(accountScope.physicalKey(key, accountScope.capture()))])),
  lifecycle: Object.fromEntries(KEYS.map((key) => [key, lifecycleForKey(key)])),
  labels: {
    en: labelSet("en"),
    zh: labelSet("zh"),
    presets: HUE_PRESETS.map((preset) => ({ id: preset.id, hue: preset.hue, en: preset.name.en, zh: preset.name.zh })),
    tones: BG_TONES.map((tone) => ({ id: tone.id, hue: tone.hue, en: tone.name.en, zh: tone.name.zh })),
    rails: RAIL_POSITIONS.map((rail) => ({ id: rail.id, en: rail.label.en, zh: rail.label.zh })),
    defaults: { ...appearanceDefaults },
  },
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
  rail: () => [...document.querySelectorAll(".app-rail .rail-items .rail-btn")].map((button) => button.getAttribute("aria-label")),
};
(window as unknown as { verify: typeof verify }).verify = verify;

createRoot(document.getElementById("root")!).render(
  <WebAuthSessionProvider client={syntheticClient as never} onIdentityChange={invalidateAccountIdentity}>
    <RouterProvider router={router} />
  </WebAuthSessionProvider>,
);
