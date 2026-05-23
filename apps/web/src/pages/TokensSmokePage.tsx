/**
 * TokensSmokePage — dev-only smoke route at /_smoke/tokens
 *
 * Renders:
 * - A 2-column panel with EN + ZH bundle text samples.
 * - A token-swatch grid (15 sentinel CSS vars).
 * - Toolbar: Light/Dark/System buttons, Compact/Comfortable, accent-hue slider.
 *
 * Gated behind import.meta.env.DEV — returns null in production.
 */

import { useState } from "react";
import {
  applyAccentHue,
  applyDensity,
  applyTheme,
  useI18n,
  type Lang,
} from "@repo/plugin-web-tokens";

// Sentinel CSS variables to display (from design.md token inventory)
const SENTINEL_TOKENS = [
  "--bg-app",
  "--bg-rail",
  "--accent-hue",
  "--accent-chroma",
  "--accent",
  "--text-1",
  "--fs-md",
  "--s-4",
  "--r-md",
  "--shadow-2",
  "--dur-fast",
  "--ease-out",
  "--rail-w",
  "--topbar-h",
  "--font-sans",
] as const;

function TokenSwatch({ varName }: { varName: string }) {
  const value = typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    : "";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid var(--border-1)" }}>
      <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", minWidth: 180, flexShrink: 0 }}>{varName}</code>
      <span style={{ fontSize: 11, color: "var(--text-2)", wordBreak: "break-all" }}>{value || "(computed)"}</span>
    </div>
  );
}

function TextSamples({ lang }: { lang: Lang }) {
  const { t } = useI18n(lang);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: "var(--fs-xl)", fontWeight: 700, color: "var(--text-1)" }}>{t.app_name}</div>
      <div style={{ color: "var(--text-2)" }}>{t.dashboard.good_morning}</div>
      <div style={{ color: "var(--text-2)" }}>{t.habits.title}</div>
      <div style={{ color: "var(--text-2)" }}>{t.matrix.urgent_important}</div>
      <div style={{ color: "var(--text-2)" }}>{t.settings.appearance}</div>
      <div style={{ color: "var(--text-3)", fontStyle: "italic" }}>{t.quotes[0]?.text}</div>
      <div style={{ color: "var(--text-3)", fontSize: "var(--fs-sm)" }}>— {t.quotes[0]?.author}</div>
      <div style={{ color: "var(--accent-ink)", fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}>{t.nav.tasks} / {t.nav.habits} / {t.nav.pomodoro}</div>
      <div style={{ color: "var(--text-2)" }}>{t.pomo.focus}</div>
      <div style={{ color: "var(--text-2)" }}>{t.common.today}</div>
    </div>
  );
}

export function TokensSmokePage() {
  if (!import.meta.env.DEV) return null;

  const [hue, setHue] = useState(165);

  return (
    <div style={{ padding: 24, fontFamily: "var(--font-sans)", color: "var(--text-1)", background: "var(--bg-app)", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: 700, marginBottom: 4 }}>Token Smoke Route</h1>
      <p style={{ color: "var(--text-3)", marginBottom: 24, fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}>/_smoke/tokens — DEV only</p>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn ghost" onClick={() => applyTheme("light")}>Light</button>
        <button className="btn ghost" onClick={() => applyTheme("dark")}>Dark</button>
        <button className="btn ghost" onClick={() => applyTheme("system")}>System</button>
        <span style={{ margin: "0 8px", color: "var(--border-strong)" }}>|</span>
        <button className="btn ghost" onClick={() => applyDensity("comfortable")}>Comfortable</button>
        <button className="btn ghost" onClick={() => applyDensity("compact")}>Compact</button>
        <span style={{ margin: "0 8px", color: "var(--border-strong)" }}>|</span>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)", fontSize: "var(--fs-sm)" }}>
          Accent Hue: {hue}°
          <input
            type="range" min={0} max={360} value={hue}
            onChange={(e) => { const v = Number(e.target.value); setHue(v); applyAccentHue(v); }}
            style={{ width: 160 }}
          />
        </label>
      </div>

      {/* 2-column text samples */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", color: "var(--text-3)", marginBottom: 12 }}>lang=en</div>
          <TextSamples lang="en" />
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", color: "var(--text-3)", marginBottom: 12 }}>lang=zh</div>
          <TextSamples lang="zh" />
        </div>
      </div>

      {/* Token swatch grid */}
      <div className="panel" style={{ padding: 16 }}>
        <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, marginBottom: 12 }}>Sentinel Tokens ({SENTINEL_TOKENS.length})</h2>
        <div>
          {SENTINEL_TOKENS.map((v) => (
            <TokenSwatch key={v} varName={v} />
          ))}
        </div>
      </div>
    </div>
  );
}
