/**
 * AppRail order native DOWNSTREAM and VISUAL fixture, production App composition: CP-APPRAIL-01 batch 62, contract r1
 * §15 E12 and E13. Parent-role native verifier; verification only. It repairs nothing, accepts nothing and changes no
 * product file. It is a new file: the text of ./native-fixed-app.tsx (batch 61; read only, hash-checked by the runner)
 * with this header and exactly two added read-only readers on `window.verify` (`legacyGetPref` and `deviceRecovery`,
 * contract §10 item 2); the composition and every other line are that fixture's, unchanged.
 *
 * Bundled by ./verify-native-downstream-visual.mjs from stdin with resolveDir = an immutable `git archive` of the
 * revision under test (the fixed revision f9eb4b1, and 419e56d for the byte-compatibility, chrome-invariance and
 * before-capture references); every product module imported below comes from that archive (pinned, guarded).
 *
 * Composition = apps/web/src/main.tsx, i.e. the production App composition (contract §9 "Composition"):
 *   - the same module (and therefore stylesheet) order as main.tsx: the observability runtime, AppProviders, the router
 *     module, the service-worker module, @repo/plugin-web-tokens, apps/web/src/styles/global.css. Importing only
 *     evaluates them; bootstrapObservability() and registerServiceWorker() are not called;
 *   - the production router INSTANCE exported by apps/web/src/routes/router.tsx rendered by RouterProvider from
 *     "react-router/dom", as in main.tsx, so /app/* renders ProtectedAppRouteElement -> App (AccountStorageGate ->
 *     AccountDataGate -> CommandPaletteProvider -> AppInner with the App-scoped Appearance controller and, at the fixed
 *     revision, the ONE App-scoped rail-order controller provided to Shell (AppRail and the Topbar RailOrderStatus
 *     slot), the Features filter, DesktopPet and CommandPalette) under the production `app` route error boundary, and
 *     /app/settings/* renders ComposedSettings (DepartureCoordinator, settingsDeparture) with the real Features and
 *     More panes;
 *   - the production WebAuthSessionProvider with onIdentityChange = the production invalidateAccountIdentity.
 *
 * The ONLY synthetic input is the auth session (contract §9, §12): the provider receives a client object whose
 * auth.getSession resolves one fixed authenticated session for a synthetic account. App.handleSignOut takes its
 * fallback (no coordinator) branch, except in the "-coord" variants, where the runner substitutes one virtual module for
 * the package's ./web entry that returns the real context value plus a synthetic generation coordinator (the native
 * counterpart of the precedent's coordinator variant; recorded in provenance). Not mounted: AppProviders' component
 * (bridges; no network client) and StrictMode (development build; contract §17 retained exclusion).
 *
 * window.verify exposes read-only facts: the variant, the production rail registrations, the archive's own labels, the
 * registry default of xai_rail_order, the real prefMutationLockName and physical key, the lifecycle classification,
 * the account-scope transition log, the auth call log, the production router location and its commit, navigate and
 * blocker traces, and a per-document instance id. Added for E12 byte compatibility: the archive's own unchanged legacy
 * reader `getPref("xai_rail_order")` and its device recovery export `exportDeviceRecoveryData()` (both from the
 * @repo/plugin-web-storage barrel of the revision under test), called only when the runner asks; neither writes.
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
import { accountScope, generationMarkerKey, prefMutationLockName, lifecycleForKey, PREF_REGISTRY, getPref, exportDeviceRecoveryData } from "@repo/plugin-web-storage";
import { I18N } from "@repo/plugin-web-tokens";

declare const __NATIVE_VARIANT__: string;
type Native = {
  next: () => number;
  idOf: (object: unknown) => number | null;
  liveBlocker: () => { id: number | null; state: string } | null;
  router: unknown;
};
const hooks = (window as unknown as { __native?: Native }).__native;
if (!hooks) throw new Error("native-fixed-prelude.js must run before the fixture bundle");
const next = (): number => hooks.next();
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null)) as T;

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
// The production router instance: navigate trace, router commits and blocker wrappers (installed before render)
// ---------------------------------------------------------------------------------------------------
hooks.router = router;
type NavigateCall = { seq: number; to: string; replace: boolean; path: string };
const navigateCalls: NavigateCall[] = [];
const routerNavigate = router.navigate;
router.navigate = function routerLevelNavigateTrace(this: unknown, ...args: unknown[]) {
  const [to, options] = args as [unknown, { replace?: boolean } | undefined];
  navigateCalls.push({ seq: next(), to: typeof to === "number" ? `delta:${to}` : typeof to === "string" ? to : JSON.stringify(to), replace: Boolean(options?.replace), path: location.pathname });
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
const commits: Commit[] = [];
let lastKey = router.state.location.key;
router.subscribe((state) => {
  state.blockers.forEach((blocker) => wrapBlocker(blocker as unknown as Blocker));
  if (state.location.key !== lastKey) {
    lastKey = state.location.key;
    commits.push({ seq: next(), key: state.location.key, pathname: state.location.pathname, state: clone(state.location.state ?? null), action: String(state.historyAction) });
  }
});

const RAIL_KEY = "xai_rail_order";
type Registration = { moduleId: string; showInRail?: boolean; railOrder?: number };
const registrations = (webShellModuleRegistrations as unknown as Registration[]).map((entry) => ({
  moduleId: entry.moduleId, showInRail: entry.showInRail !== false, railOrder: typeof entry.railOrder === "number" ? entry.railOrder : null,
}));
const after = <T extends { seq: number }>(list: readonly T[], mark: number): T[] => list.filter((entry) => entry.seq > mark);
const labelSet = (lang: "en" | "zh") => {
  const settings = I18N[lang].settings as unknown as Record<string, string>;
  const avatar = I18N[lang].avatar as unknown as Record<string, string>;
  return {
    nav: { ...(I18N[lang].nav as unknown as Record<string, string>) },
    settings: { appearance: settings.appearance, about: settings.about, more: settings.more, features: settings.features, theme: settings.theme, light: settings.light, dark: settings.dark },
    avatar: { settings: avatar.settings, signOut: avatar.sign_out },
  };
};
const verify = {
  composition: "production-app",
  variant: __NATIVE_VARIANT__,
  instance: crypto.randomUUID(),
  owner: OWNER,
  markerKey: generationMarkerKey(OWNER),
  railKey: RAIL_KEY,
  registrations,
  registryDefault: (PREF_REGISTRY as unknown as Record<string, { default: unknown; codec: string }>)[RAIL_KEY]?.default ?? null,
  registryCodec: (PREF_REGISTRY as unknown as Record<string, { default: unknown; codec: string }>)[RAIL_KEY]?.codec ?? null,
  lifecycle: lifecycleForKey(RAIL_KEY),
  physicalKey: () => accountScope.physicalKey(RAIL_KEY as never, accountScope.capture()),
  lockName: () => prefMutationLockName(accountScope.physicalKey(RAIL_KEY as never, accountScope.capture())),
  labels: { en: labelSet("en"), zh: labelSet("zh") },
  scope: () => {
    const scope = accountScope.capture();
    return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation, epoch: scope.epoch };
  },
  authCalls: () => authLog.map((entry) => entry.call),
  location: () => ({
    pathname: router.state.location.pathname,
    key: router.state.location.key,
    state: clone(router.state.location.state ?? null),
  }),
  /** E12 byte compatibility (contract §10 item 2): the archive's unchanged legacy reader and device recovery export. */
  legacyGetPref: () => clone((getPref as unknown as (key: string) => unknown)(RAIL_KEY)),
  deviceRecovery: () => clone(exportDeviceRecoveryData()),
  window: (mark: number) => ({
    navigateCalls: after(navigateCalls, mark),
    blockerCalls: after(blockerCalls, mark),
    commits: after(commits, mark),
    scope: after(scopeLog, mark),
    auth: after(authLog, mark).map((entry) => entry.call),
  }),
};
(window as unknown as { verify: typeof verify }).verify = verify;

createRoot(document.getElementById("root")!).render(
  <WebAuthSessionProvider client={syntheticClient as never} onIdentityChange={invalidateAccountIdentity}>
    <RouterProvider router={router} />
  </WebAuthSessionProvider>,
);
