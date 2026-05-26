/**
 * apps/web/src/App.tsx — Host root state for XAI Web Console.
 *
 * Owns the 8 root state pieces:
 *   lang, theme, density, fontScale, petOn (useState)
 *   accentHue, railPos, bgTone (usePref — persisted)
 *
 * Calls apply* helpers from @repo/plugin-web-tokens on each state change.
 * Wires <WebShellProvider> + <Shell> from @repo/xai-web-shell.
 *
 * Port of web design/app.jsx (lines 6-88), re-implemented in TSX using
 * the W1 shipped packages instead of CDN globals.
 *
 * Phase plan: packages/xai-web-shell/docs/dev_log.md P1 (Topbar + root state)
 *
 * xai-web-cmdk P4: App is split into App (provider) + AppInner (consumer).
 * App wraps AppInner in <CommandPaletteProvider>; AppInner reads the context
 * via useCommandPalette() and passes onOpenSearch to <Shell>.
 */

import { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate } from "react-router";
import {
  applyTheme,
  applyDensity,
  applyFontScale,
  applyAccentHue,
  applyBgTone,
  applyRailPos,
} from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import { emitWebEvent, onWebEvent } from "@repo/xai-web-event-bus";
import {
  Shell,
  WebShellProvider,
  type WebModuleSlotRegistration,
} from "@repo/xai-web-shell";
// xai-web-pet: top-level mount (D1 Option B — sibling of <Shell> per ADR-0007 §S6)
import { DesktopPet } from "@repo/plugin-web-pet";
import type { Lang, Theme, Density, BgTone } from "@repo/plugin-web-tokens";
import { webShellModuleRegistrations } from "./routes/modules/shellRegistrations";
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

// ---- AppInner — consumes CommandPaletteProvider context --------------------

function AppInner() {
  const { open: openPalette } = useCommandPalette();

  // ---- useState state pieces -----------------------------------------------
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [fontScale, setFontScale] = useState<number>(1);
  const [petOn, setPetOn] = useState<boolean>(true);

  // ---- usePref state pieces (persisted) ------------------------------------
  const [accentHue]      = usePref("xai_accent_hue");   // setter dropped — pane writes via setPref directly
  const [railPos]        = usePref("xai_rail_pos");     // setter dropped — pane writes via setPref directly
  const [bgToneRaw]      = usePref("xai_bg_tone");      // setter dropped — pane writes via setPref directly
  // plugin-web-tokens BgTone is a strict subset of plugin-web-storage's BgTone
  // (storage adds "sage" which tokens doesn't know yet). Cast to BgTone for apply*.
  const bgTone: BgTone = bgToneRaw as BgTone;

  // xai-web-settings-appearance row #22 — subscribe to live binding bus.
  // AppearancePane emits web:settings:preference-changed on every onChange + on Save + on Reset.
  // The 3 persisted dims (accentHue/railPos/bgTone) auto-rerender via usePref;
  // the 4 useState dims (theme/density/fontScale/lang) need explicit setters here.
  useEffect(() => {
    const off = onWebEvent("web:settings:preference-changed", (d) => {
      switch (d.key) {
        case "theme":     setTheme(d.value); break;
        case "density":   setDensity(d.value); break;
        case "fontScale": setFontScale(d.value); break;
        case "lang":      setLang(d.value); break;
        // accentHue / railPos / bgTone auto-rerender via usePref — no setter needed.
      }
    });
    return () => off();
  }, []);

  // ---- apply* useEffects (B1: matchMedia cleanup before re-attach) ----------
  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { applyDensity(density); }, [density]);
  useEffect(() => { applyFontScale(fontScale); }, [fontScale]);
  useEffect(() => { applyAccentHue(accentHue); }, [accentHue]);
  useEffect(() => { applyBgTone(bgTone); }, [bgTone]);
  useEffect(() => { applyRailPos(railPos); }, [railPos]);

  // system theme: matchMedia listener — B1: cleanup MUST clear before re-attach
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  // xai-web-settings-features-panel row #23 — derive feature-prefs-aware module list.
  // The full registrations array is stable; the filter result re-derives only when
  // one of the 8 xai_pref_features_* booleans changes.
  const featurePrefs = useFeaturePrefs();
  const modules = useMemo<WebModuleSlotRegistration[]>(
    () => filterModulesByFeaturePrefs(webShellModuleRegistrations, featurePrefs),
    [featurePrefs],
  );

  return (
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
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        density={density}
        setDensity={setDensity}
        onOpenSearch={() => openPalette({ source: "topbar-click" })}
        premiumBadge={<PremiumTierBadge lang={lang} />}
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
  );
}

// ---- App component — wraps AppInner in CommandPaletteProvider --------------

export function App() {
  return (
    <CommandPaletteProvider>
      <AppInner />
    </CommandPaletteProvider>
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
