/**
 * apps/web/src/App.tsx — Host root state for XAI Web Console.
 *
 * Owns the root state pieces:
 *   petOn (useState)
 *   the seven Appearance dimensions — lang, theme, density, fontScale,
 *   accentHue, railPos, bgTone — through ONE App-scoped Appearance controller
 *   (CP-APPEARANCE-01) created here, inside AccountStorageGate.
 *
 * The controller persists every Appearance change through the accepted async
 * engine, applies the display values to <html>, keeps the unload warning and
 * owns the sign-out step; the Settings pane and the Topbar quick switcher are
 * its views. Wires <WebShellProvider> + <Shell> from @repo/xai-web-shell.
 *
 * Port of web design/app.jsx (lines 6-88), re-implemented in TSX using
 * the W1 shipped packages instead of CDN globals.
 *
 * Phase plan: packages/xai-web-shell/docs/dev_log.md P1 (Topbar + root state)
 *
 * xai-web-cmdk P4: App is split into App (provider) + AppInner (consumer).
 * App wraps AppInner in <CommandPaletteProvider>; AppInner reads the context
 * via useCommandPalette() and passes onOpenSearch to <Shell>.
 *
 * Bugfix Tb-02/Tb-03/Tb-04 (superseded by CP-APPEARANCE-01): stored
 * lang/theme/density/fontScale are read by the controller's strict bindings;
 * readLocalPref stays exported, byte-identical, for its existing tests.
 */

import { useState, useMemo, useCallback } from "react";
import { Outlet, useNavigate } from "react-router";
import { accountScope } from "@repo/plugin-web-storage";
import { AccountStorageGate, invalidateAccountIdentity } from "./providers/AccountStorageGate.js";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import {
  Shell,
  WebShellProvider,
  type WebModuleSlotRegistration,
} from "@repo/xai-web-shell";
// xai-web-pet: top-level mount (D1 Option B — sibling of <Shell> per ADR-0007 §S6)
import { DesktopPet } from "@repo/plugin-web-pet";
// CP-APPEARANCE-01 — the App-scoped Appearance controller and its Topbar status
import {
  AppearanceProvider,
  AppearanceStatus,
  useAppearanceController,
} from "@repo/plugin-web-settings-appearance";
import { webShellModuleRegistrations } from "./routes/modules/shellRegistrations";
import { requestSettingsDeparture } from "./routes/modules/settingsDeparture.js";
// xai-web-settings-features-panel row #23 — rail filter driven by xai_pref_features_*
import {
  useFeaturePrefs,
  filterModulesByFeaturePrefs,
} from "@repo/plugin-web-settings-features-panel";
// xai-web-cmdk gap-closure row #3 — global Cmd+K command palette
import {
  CommandPaletteProvider,
  CommandPalette,
  useCommandPalette,
} from "@repo/xai-web-cmdk";
// Extension 2026-05-26 — Premium tier badge for Topbar (gap-closure row #8 F1)
import { PremiumTierBadge } from "@repo/plugin-web-settings-rest";
// Bugfix: Audit Top-10 #1 / Rail-10 — sign-out handler wired from auth session
import { useWebAuthSession } from "@repo/web-auth-device-session/web";
// AI tool layer — always-on write subscribers (P4 xai-web-ai-tool-layer).
// Mounted as Shell-siblings (route-independent liveness per OQ2 resolution).
// Per DesktopPet / CommandPalette precedent (ADR-0007 §S6 Option B).
import { useTaskCreateRequestSubscriber } from "@repo/plugin-web-tasks";
import { useCalendarCreateRequestSubscriber } from "@repo/plugin-web-calendar";
// AI tool layer mutate subscribers (P2 xai-web-ai-tool-edit-delete).
// Same Shell-sibling pattern; delete + update channels.
import { useTaskMutateRequestSubscriber } from "@repo/plugin-web-tasks";
import { useCalendarMutateRequestSubscriber } from "@repo/plugin-web-calendar";
// DEV-only: seed AI provider config + key from gitignored .env.local into the
// runtime stores (single local source of truth). Tree-shaken out of prod builds
// (import.meta.env.DEV gate). Carve-out: 20260529-gemini-provider-enablement §6.
import { useDevAiConfigSeed } from "./dev/seedAiConfigFromEnv.js";

// ---- readLocalPref — safe localStorage reader (retained, byte-identical) ------
//
// Reads a JSON-encoded string value from localStorage with a typed fallback.
// No longer used by App itself: since CP-APPEARANCE-01 the App-scoped
// Appearance controller reads "xai_pref_lang" | "xai_pref_theme" |
// "xai_pref_density" | "xai_pref_font_scale" through strict engine bindings.
// Kept unchanged as the reference reader of today's root bytes.
//
// Exported for unit tests in apps/web/src/__tests__/App.lazy-init.test.tsx.
export function readLocalPref<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // JSON.parse failure (corrupt value) — use fallback silently.
    return fallback;
  }
}

// ---- AppInner — consumes CommandPaletteProvider context --------------------

function AppInner({ onSignOutError }: { onSignOutError: (failed: boolean) => void }) {
  const { open: openPalette } = useCommandPalette();

  // ---- AI tool layer: always-on write subscribers (P4 xai-web-ai-tool-layer) --
  // Zero-UI hooks — mounted here as Shell-siblings so they are live regardless of
  // the active route (R4 mitigation: even when user is on /app/ai, the tasks and
  // calendar modules may not be mounted, so writes would be lost without these).
  // Precedent: DesktopPet (L191) + CommandPalette (L197) Shell-siblings.
  useTaskCreateRequestSubscriber();
  useCalendarCreateRequestSubscriber();
  // P2 xai-web-ai-tool-edit-delete: mutate (delete + update) subscribers.
  useTaskMutateRequestSubscriber();
  useCalendarMutateRequestSubscriber();
  // DEV-only: seed AI config + key from .env.local (no-op in production).
  useDevAiConfigSeed();

  // ---- useState state pieces -----------------------------------------------
  const [petOn, setPetOn] = useState<boolean>(true);

  // ---- CP-APPEARANCE-01: the ONE App-scoped Appearance controller ----------
  // Created once here, inside AccountStorageGate (so a scope change remounts it
  // with the committed bytes — REL-09). It owns the seven strict bindings, the
  // operation and recovery model, DOM application (apply* + the system-theme
  // listener), the unload warning and the sign-out step. The Settings pane and
  // the Topbar are its views: the Topbar's setLang/setTheme/setDensity are its
  // edits. The web:settings:preference-changed write path is retired.
  const appearance = useAppearanceController();
  const { lang, theme, density, railPos } = appearance.values;

  // Topbar status → Review: the existing shortcut event (as Shell does for
  // Settings), then one navigation to the Appearance pane.
  const navigate = useNavigate();
  const reviewAppearance = useCallback(() => {
    emitWebEvent("web:shell:module-change", { moduleId: "settings", source: "shortcut" });
    void navigate("/app/settings/appearance");
  }, [navigate]);

  // xai-web-settings-features-panel row #23 — derive feature-prefs-aware module list.
  // The full registrations array is stable; the filter result re-derives only when
  // one of the 8 xai_pref_features_* booleans changes.
  const featurePrefs = useFeaturePrefs();
  const modules = useMemo<WebModuleSlotRegistration[]>(
    () => filterModulesByFeaturePrefs(webShellModuleRegistrations, featurePrefs),
    [featurePrefs],
  );

  // Bugfix: Audit Top-10 #1 / Rail-10 — sign-out handler.
  // Reads from WebAuthSessionProvider (already mounted in AppProviders via main.tsx).
  // Steps: 1) best-effort Supabase backend sign-out  2) clear React session state
  //        3) hard-redirect to "/" so AuthRouteGate takes over.
  const { client, clearSessionStorage, coordinator, reportSignOutFailure } = useWebAuthSession();
  // CP-APPEARANCE-01 sign-out step: no drafts → true without a prompt; drafts →
  // one window.confirm (Cancel → false, OK → drafts discarded with zero writes).
  const confirmAppearanceSignOut = appearance.confirmSignOut;
  const handleSignOut = useCallback(async () => {
    onSignOutError(false);
    const capturedScope = accountScope.capture();
    if (coordinator) {
      const captured = coordinator.capture();
      if (!captured) { onSignOutError(true); return; }
      if (!await confirmAppearanceSignOut()) return;
      if (!await requestSettingsDeparture("sign-out")) return;
      const current = coordinator.capture();
      if (accountScope.capture() !== capturedScope || !current || current.owner !== captured.owner || current.generation !== captured.generation) return;
      invalidateAccountIdentity(null);
      const result = await coordinator.signOut(captured);
      if (result.status === 'failed') { reportSignOutFailure?.(); onSignOutError(true); return; }
      if (result.status === 'applied') window.location.assign('/');
      return;
    }
    if (!await confirmAppearanceSignOut()) return;
    if (!await requestSettingsDeparture("sign-out")) return;
    if (accountScope.capture() !== capturedScope) return;
    invalidateAccountIdentity(null);
    try {
      if (client && typeof client.auth?.signOut === "function") {
        await client.auth.signOut();
      }
    } catch {
      // best-effort: network error should not block the state clear + redirect
    }
    await clearSessionStorage();
    window.location.assign("/");
  }, [client, clearSessionStorage, confirmAppearanceSignOut, coordinator, onSignOutError, reportSignOutFailure]);

  return (
    <AppearanceProvider controller={appearance}>
      <WebShellProvider
        modules={modules}
        lang={lang}
        railPos={railPos}
        petOn={petOn}
        setPetOn={setPetOn}
      >
        {/*
         * xai-web-cmdk P4: Shell receives onOpenSearch from the palette context.
         * When the topbar search box is clicked, openPalette fires with source="topbar-click".
         */}
        <Shell
          lang={lang}
          setLang={appearance.setLang}
          theme={theme}
          setTheme={appearance.setTheme}
          density={density}
          setDensity={appearance.setDensity}
          onOpenSearch={() => openPalette({ source: "topbar-click" })}
          premiumBadge={<PremiumTierBadge lang={lang} />}
          appearanceStatus={<AppearanceStatus onReview={reviewAppearance} />}
          onSignOut={handleSignOut}
        >
          <Outlet />
        </Shell>
        {/* xai-web-pet: floats over all routes (position:fixed); not a routed module */}
        <DesktopPet on={petOn} lang={lang} />
        {/*
         * xai-web-cmdk P4: CommandPalette is mounted as a sibling of <Shell>.
         * It reads from CommandPaletteProvider context (above) and uses
         * position:fixed to overlay the full viewport. HC1: not a rail entry.
         */}
        <CommandPalette />
      </WebShellProvider>
    </AppearanceProvider>
  );
}

// ---- App component — wraps AppInner in CommandPaletteProvider --------------

export function App() {
  const [signOutError, setSignOutError] = useState(false);
  const { coordinator } = useWebAuthSession();
  return (
    <>
    {signOutError && <div role="alert">Sign-out did not complete.
      <button type="button" onClick={() => { setSignOutError(false); void coordinator?.bootstrap(); }}>Recover session and retry</button>
    </div>}
    <AccountStorageGate>
      <CommandPaletteProvider>
        <AppInner onSignOutError={setSignOutError} />
      </CommandPaletteProvider>
    </AccountStorageGate>
    </>
  );
}

// ---- AppPetToggle helper (exported for testing) ----------------------------

export function createPetToggleHandler(
  petOn: boolean,
  setPetOn: (next: boolean) => void,
) {
  return () => {
    const next = !petOn;
    setPetOn(next);
    emitWebEvent("web:shell:pet-toggle", { on: next, source: "rail-bottom" });
  };
}

// ---- AppSettingsOpen helper (exported for testing) -------------------------

export function createSettingsOpenHandler(navigate: ReturnType<typeof useNavigate>) {
  return () => {
    emitWebEvent("web:shell:module-change", { moduleId: "settings", source: "shortcut" });
    void navigate("/app/settings");
  };
}
