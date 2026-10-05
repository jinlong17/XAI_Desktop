/**
 * Appearance native host / downstream / Retry all fixture, production App composition: CP-APPEARANCE-01 batch 45,
 * contract r3 §14 E12 (host matrix rows a–s), E13 (downstream) and E26 (native Retry all). Parent-role native
 * verifier; verification only. It repairs nothing, accepts nothing and changes no product file. It is a new file:
 * ./native-fixed-app.tsx (batch 43) and ./native-app.tsx (batch 39) are not modified; this file follows their
 * composition exactly and adds the router-level facts of ../web-appearance-recovery-f1/f1-appearance-host.tsx
 * (re-implemented here, nothing imported from it).
 *
 * Bundled by ./verify-native-host-retryall.mjs from stdin with resolveDir = an immutable `git archive` of the revision
 * under test (the fixed revision, and 5cd63ff for the E13 chrome-invariance and row h sign-out comparisons); every
 * product module imported below comes from that archive (pinned, guarded). It imports only modules that exist,
 * unchanged in their public shape, in both archives.
 *
 * Composition = apps/web/src/main.tsx, i.e. the production App composition (contract §9 "Composition"):
 *   - the same module (and therefore stylesheet) order as main.tsx: the observability runtime, AppProviders, the
 *     router module, the service-worker module, @repo/plugin-web-tokens, apps/web/src/styles/global.css. Importing
 *     only evaluates them; bootstrapObservability() and registerServiceWorker() are not called;
 *   - the production router INSTANCE of apps/web/src/routes/router.tsx (createBrowserRouter(webHostRouteObjects))
 *     rendered by RouterProvider from "react-router/dom", as in main.tsx, so /app/* renders ProtectedAppRouteElement ->
 *     App (AccountStorageGate -> AccountDataGate -> CommandPaletteProvider -> AppInner -> Shell with AppRail (avatar
 *     menu and sign-out dialog) and Topbar, DesktopPet, CommandPalette) under the production `app` route error
 *     boundary, and /app/settings/* renders the production ComposedSettings with the DepartureCoordinator and the
 *     settingsDeparture delegate that App.handleSignOut awaits;
 *   - the production WebAuthSessionProvider with onIdentityChange = the production invalidateAccountIdentity.
 *
 * The ONLY synthetic input is the auth session (contract §9, §12): the provider receives a client object whose
 * auth.getSession resolves one fixed authenticated session for a synthetic account (the legacy provider branch, so
 * App.handleSignOut takes its fallback branch). For the row h coordinator branch the runner bundles a variant in which
 * the auth-session CONTEXT that App and AccountStorageGate read through `@repo/web-auth-device-session/web` carries a
 * synthetic `coordinator` (see the runner's coordinator wrapper); the provider, the route gates and everything else are
 * unchanged. Not mounted, as in the earlier fixtures: AppProviders' component (AccountDeletionRecoveryBridge,
 * TodoWebRuntimeBridge; no network client), StrictMode (development build; contract §15 retained exclusion).
 *
 * Instruments live in ./native-host-retryall-prelude.js (window.__native). This file adds archive-backed facts only:
 *   - a router-level navigate trace installed on the production router BEFORE RouterProvider renders, so the
 *     DepartureCoordinator's own navigate wrapper delegates to it (a held programmatic intent reaches it once, on
 *     release); a router.subscribe trace of location commits and blocker states; proceed()/reset() wrappers on every
 *     blocked blocker that record the blocker's id and the router's LIVE blocker immediately before delegating;
 *   - the archive's readLocalPref (exported by apps/web/src/App.tsx), product labels (I18N, Appearance constants), the
 *     real prefMutationLockName and physical key of every Appearance key, the account-scope transition log, auth call
 *     counters, the production router location and a per-document instance id.
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
import { readLocalPref } from "./apps/web/src/App";
import { accountScope, generationMarkerKey, prefMutationLockName, lifecycleForKey } from "@repo/plugin-web-storage";
import { I18N } from "@repo/plugin-web-tokens";
import { BG_TONES, HUE_PRESETS, RAIL_POSITIONS, appearanceDefaults } from "@repo/plugin-web-settings-appearance";

declare const __NATIVE_VARIANT__: string;
type Native = {
  next: () => number;
  idOf: (object: unknown) => number | null;
  liveBlocker: () => { id: number | null; state: string } | null;
  router: unknown;
};
const hooks = (window as unknown as { __native?: Native }).__native;
if (!hooks) throw new Error("native-host-retryall-prelude.js must run before the fixture bundle");
const next = (): number => hooks.next();
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;

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
const authLog: Array<{ seq: number; call: string }> = [];
const syntheticClient = {
  auth: {
    getSession: async () => { authLog.push({ seq: next(), call: "getSession" }); return { data: { session }, error: null }; },
    onAuthStateChange: () => { authLog.push({ seq: next(), call: "onAuthStateChange" }); return { data: { subscription: { unsubscribe: () => {} } } }; },
    signOut: async () => { authLog.push({ seq: next(), call: "signOut" }); return { error: null }; },
  },
};

// Account-scope transitions (the real accountScope from the archive), sequence-stamped.
type ScopeEntry = { seq: number; kind: string; accountId: string | null; generation: string | null; epoch: number };
const scopeLog: ScopeEntry[] = [];
const recordScope = (): void => {
  const scope = accountScope.capture();
  scopeLog.push({ seq: next(), kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch });
};
recordScope();
accountScope.subscribe(recordScope);

// ---------------------------------------------------------------------------------------------------
// The production router instance: navigate trace, router trace and blocker wrappers (installed before render)
// ---------------------------------------------------------------------------------------------------
hooks.router = router;
type NavigateCall = { seq: number; to: string; toPath: string | null; replace: boolean; path: string };
const navigateCalls: NavigateCall[] = [];
const routerNavigate = router.navigate;
router.navigate = function routerLevelNavigateTrace(this: unknown, ...args: unknown[]) {
  const [to, options] = args as [unknown, { replace?: boolean } | undefined];
  const toPath = typeof to === "string" ? to.split(/[?#]/)[0] ?? null
    : to !== null && typeof to === "object" && typeof (to as { pathname?: unknown }).pathname === "string" ? (to as { pathname: string }).pathname : null;
  navigateCalls.push({ seq: next(), to: typeof to === "number" ? `delta:${to}` : typeof to === "string" ? to : JSON.stringify(to), toPath, replace: Boolean(options?.replace), path: location.pathname });
  return Reflect.apply(routerNavigate, router, args);
} as typeof router.navigate;
type Blocker = { state: string; proceed?: (...args: unknown[]) => unknown; reset?: (...args: unknown[]) => unknown };
type BlockerCall = { seq: number; op: "proceed" | "reset"; blocker: number | null; liveBlocker: number | null; liveState: string | null; path: string; threw?: string };
const blockerCalls: BlockerCall[] = [];
const wrappedBlockers = new WeakSet<object>();
const wrapBlocker = (blocker: Blocker): void => {
  if (blocker.state !== "blocked" || wrappedBlockers.has(blocker)) return;
  wrappedBlockers.add(blocker);
  const id = hooks.idOf(blocker);
  for (const op of ["proceed", "reset"] as const) {
    const original = blocker[op];
    if (typeof original !== "function") continue;
    blocker[op] = function wrappedBlockerMethod(this: unknown, ...args: unknown[]): unknown {
      const live = hooks.liveBlocker();
      const entry: BlockerCall = { seq: next(), op, blocker: id, liveBlocker: live?.id ?? null, liveState: live?.state ?? null, path: location.pathname };
      blockerCalls.push(entry);
      try {
        return original.apply(this, args);
      } catch (error) {
        entry.threw = String((error as Error)?.message ?? error).slice(0, 200);
        throw error;
      }
    };
  }
};
type Commit = { seq: number; key: string; pathname: string; state: unknown; action: string };
type RouterTrace = { seq: number; key: string; path: string; action: string; blockers: string[] };
const routerLog: RouterTrace[] = [];
const commits: Commit[] = [];
let lastKey = router.state.location.key;
router.subscribe((state) => {
  state.blockers.forEach((blocker) => wrapBlocker(blocker as unknown as Blocker));
  const entry: RouterTrace = { seq: next(), key: state.location.key, path: state.location.pathname, action: String(state.historyAction), blockers: [...state.blockers.values()].map((blocker) => `${hooks.idOf(blocker)}:${blocker.state}`) };
  routerLog.push(entry);
  if (state.location.key !== lastKey) {
    lastKey = state.location.key;
    commits.push({ seq: entry.seq, key: state.location.key, pathname: state.location.pathname, state: clone(state.location.state ?? null), action: String(state.historyAction) });
  }
});

const KEYS = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_pref_font_scale", "xai_accent_hue", "xai_rail_pos", "xai_bg_tone"] as const;
const text = (element: Element | null | undefined): string => (element?.textContent ?? "").replace(/\s+/g, " ").trim();
const nameOf = (element: Element): string => (element.getAttribute("aria-label") ?? element.textContent ?? "").replace(/\s+/g, " ").trim();
const after = <T extends { seq: number }>(list: readonly T[], mark: number): T[] => list.filter((entry) => entry.seq > mark);
const labelSet = (lang: "en" | "zh") => {
  const settings = I18N[lang].settings as unknown as Record<string, string>;
  const nav = I18N[lang].nav as unknown as Record<string, string>;
  const avatar = I18N[lang].avatar as unknown as Record<string, string>;
  const common = I18N[lang].common as unknown as Record<string, string>;
  return {
    appearance: settings.appearance, about: settings.about, more: settings.more, language: settings.language, theme: settings.theme, density: settings.density,
    accent: settings.accent_color, bg: settings.bg_palette, rail: settings.sidebar_position, font: settings.font_scale,
    light: settings.light, dark: settings.dark, system: settings.system, comfortable: settings.comfortable, compact: settings.compact,
    pet: nav.pet, calendar: nav.calendar, tasks: nav.tasks, settingsNav: nav.settings, signOut: avatar.sign_out, search: common.search_placeholder,
    nav: { ...nav },
  };
};
const verify = {
  composition: "production-app",
  variant: __NATIVE_VARIANT__,
  instance: crypto.randomUUID(),
  owner: OWNER,
  markerKey: generationMarkerKey(OWNER),
  keys: [...KEYS],
  /** The physical key and the real per-key lock name the engine uses for each Appearance key (device keys). */
  physicalKeys: () => Object.fromEntries(KEYS.map((key) => [key, accountScope.physicalKey(key, accountScope.capture())])),
  lockNames: () => Object.fromEntries(KEYS.map((key) => [key, prefMutationLockName(accountScope.physicalKey(key, accountScope.capture()))])),
  lifecycle: Object.fromEntries(KEYS.map((key) => [key, lifecycleForKey(key)])),
  /** The archive's unchanged reader (contract §10 item 2). */
  readLocalPref: (key: string, fallback: unknown) => clone(readLocalPref(key, fallback)),
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
  authCalls: () => ({
    getSession: authLog.filter((entry) => entry.call === "getSession").length,
    onAuthStateChange: authLog.filter((entry) => entry.call === "onAuthStateChange").length,
    signOut: authLog.filter((entry) => entry.call === "signOut").length,
  }),
  location: () => ({
    pathname: router.state.location.pathname,
    key: router.state.location.key,
    search: router.state.location.search,
    hash: router.state.location.hash,
    state: clone(router.state.location.state ?? null),
  }),
  rail: () => [...document.querySelectorAll(".app-rail .rail-items .rail-btn")].map((button) => button.getAttribute("aria-label")),
  paneId: () => document.querySelector(".settings-detail")?.getAttribute("data-pane") ?? null,
  dialog: () => {
    const dialog = document.querySelector('.settings-departure-dialog[role="dialog"]');
    return dialog ? { label: dialog.getAttribute("aria-label"), text: text(dialog.querySelector("p")), buttons: [...dialog.querySelectorAll("button")].map(text), html: dialog.outerHTML } : null;
  },
  signOutDialogOpen: () => Boolean((document.querySelector("dialog.xai-sign-out-dialog") as HTMLDialogElement | null)?.open),
  avatarMenuOpen: () => Boolean(document.querySelector(".avatar-menu")),
  gate: () => {
    const gate = document.querySelector(".account-data-gate");
    return gate ? { text: text(gate).slice(0, 300), heading: text(gate.querySelector("h1")) || null, status: text(gate.querySelector('[role="status"]')) || null } : null;
  },
  detailText: () => text(document.querySelector(".settings-detail")),
  alerts: () => [...document.querySelectorAll('.settings-detail [role="alert"],.settings-detail [role="status"]')].map(text),
  buttons: (scope = ".settings-detail") => [...(document.querySelector(scope)?.querySelectorAll("button") ?? [])].map(nameOf),
  window: (mark: number) => ({
    navigateCalls: after(navigateCalls, mark),
    blockerCalls: after(blockerCalls, mark),
    commits: after(commits, mark),
    router: after(routerLog, mark),
    scope: after(scopeLog, mark),
    auth: after(authLog, mark),
  }),
};
(window as unknown as { verify: typeof verify }).verify = verify;

createRoot(document.getElementById("root")!).render(
  <WebAuthSessionProvider client={syntheticClient as never} onIdentityChange={invalidateAccountIdentity}>
    <RouterProvider router={router} />
  </WebAuthSessionProvider>,
);
