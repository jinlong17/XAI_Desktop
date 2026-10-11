/**
 * Appearance native BEFORE fixture: CP-APPEARANCE-01 batch 39, contract r3 §14 E4 (parent-role native verifier).
 * Verification only; it repairs nothing, accepts nothing and changes no product file.
 *
 * Bundled by ./verify-native-before.mjs from stdin with resolveDir = an immutable `git archive` of the
 * revision under test; every product module imported below comes from that archive (pinned, guarded).
 *
 * Composition = apps/web/src/main.tsx, i.e. the production App composition (contract §9 "Composition"):
 *   - the same module (and therefore stylesheet) order as main.tsx: the observability runtime, AppProviders,
 *     the router module, the service-worker module, @repo/plugin-web-tokens, apps/web/src/styles/global.css.
 *     Importing only evaluates them; bootstrapObservability() and registerServiceWorker() are not called;
 *   - the production router INSTANCE exported by apps/web/src/routes/router.tsx
 *     (createBrowserRouter(webHostRouteObjects)) rendered by RouterProvider from "react-router/dom", as in
 *     main.tsx, so /app/* renders ProtectedAppRouteElement -> App (AccountStorageGate -> AccountDataGate ->
 *     CommandPaletteProvider -> WebShellProvider + Shell with AppRail and Topbar, DesktopPet, CommandPalette)
 *     under the production `app` route error boundary, and /app/settings/appearance renders AppRouteElement
 *     -> ComposedSettings (DepartureCoordinator, settingsDeparture) with the real Appearance pane, its shared
 *     SettingsFooter ("Save & apply", "Reset to defaults"), legacy usePref/setPref and the event bus;
 *   - the production WebAuthSessionProvider with onIdentityChange = the production invalidateAccountIdentity,
 *     as AppProviders passes it.
 *
 * The ONLY synthetic input is the auth session (contract §12 "Native before"): the provider receives a client
 * object whose auth.getSession resolves one fixed authenticated session for a synthetic account (the shape of
 * the product's own mock client in AppProviders.tsx). useWebAuthSession() therefore serves App,
 * AccountStorageGate and the route gates from the real provider and context. Differences from main.tsx:
 * AppProviders' component (AccountDeletionRecoveryBridge, TodoWebRuntimeBridge) is not mounted because there is
 * no network client; StrictMode is not used (development build; contract §15 retained exclusion).
 *
 * window.verify exposes read-only facts for the runner: product labels taken from the archive's own I18N and
 * Appearance constants, the account-scope transition log, the auth call counters and a real Web Lock holder
 * (navigator.locks, exclusive) used to prove that a write ignores a held per-key lock.
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
if (!hooks) throw new Error("native-prelude.js must run before the fixture bundle");

const OWNER = "appearance-native-A";
const now = new Date("2026-10-04T00:00:00.000Z").toISOString();
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

// Real Web Lock holder (exclusive; navigator.locks of this document).
const heldLocks = new Map<string, () => void>();
const holdLock = (name: string): Promise<boolean> => new Promise<boolean>((resolve) => {
  void navigator.locks.request(name, { mode: "exclusive" }, () => new Promise<void>((release) => {
    heldLocks.set(name, release);
    resolve(true);
  }));
});
const releaseLock = (name: string): boolean => {
  const release = heldLocks.get(name);
  if (!release) return false;
  heldLocks.delete(name);
  release();
  return true;
};

const KEYS = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_pref_font_scale", "xai_accent_hue", "xai_rail_pos", "xai_bg_tone"] as const;
const labelSet = (lang: "en" | "zh") => {
  const settings = I18N[lang].settings as unknown as Record<string, string>;
  const nav = I18N[lang].nav as unknown as Record<string, string>;
  const avatar = I18N[lang].avatar as unknown as Record<string, string>;
  const common = I18N[lang].common as unknown as Record<string, string>;
  return {
    appearance: settings.appearance, language: settings.language, theme: settings.theme, density: settings.density,
    accent: settings.accent_color, bg: settings.bg_palette, rail: settings.sidebar_position, font: settings.font_scale,
    light: settings.light, dark: settings.dark, system: settings.system, comfortable: settings.comfortable, compact: settings.compact,
    pet: nav.pet, signOut: avatar.sign_out, search: common.search_placeholder,
  };
};
const verify = {
  owner: OWNER,
  markerKey: generationMarkerKey(OWNER),
  keys: [...KEYS],
  lockNames: Object.fromEntries(KEYS.map((key) => [key, prefMutationLockName(key)])),
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
  location: () => ({ pathname: router.state.location.pathname, key: router.state.location.key }),
  holdLock,
  releaseLock,
  heldLockNames: () => [...heldLocks.keys()],
  queryLocks: async () => {
    const state = await navigator.locks.query();
    return { held: (state.held ?? []).map((lock) => lock.name), pending: (state.pending ?? []).map((lock) => lock.name) };
  },
};
(window as unknown as { verify: typeof verify }).verify = verify;

createRoot(document.getElementById("root")!).render(
  <WebAuthSessionProvider client={syntheticClient as never} onIdentityChange={invalidateAccountIdentity}>
    <RouterProvider router={router} />
  </WebAuthSessionProvider>,
);
