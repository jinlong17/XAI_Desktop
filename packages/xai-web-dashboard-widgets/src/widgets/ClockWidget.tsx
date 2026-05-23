/**
 * ClockWidget — 4 styles (Classic / Split / Minimal / Analog) + 12 timezones.
 *
 * Style persisted to xai_clock_style; timezone persisted to xai_clock_tz.
 * Analog clock SVG renders 60 minor ticks (skipping multiples of 5) + 12 major
 * ticks + 12 numerals + 3 hands per design.md §1.1 frozen-assumption 7.
 *
 * Per row #10 api.md §S4, the .clock-toolbar carries data-no-drag so drag
 * doesn't start from the popover/style-toggle area.
 *
 * Ported from `web design/module-dashboard.jsx` lines 209-364.
 */
import { useState } from "react";

import { usePref } from "@repo/plugin-web-storage";
import type { ClockStyle } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { CITY_LIBRARY, findCity } from "../internal/cityLibrary.js";
import { Icon } from "../internal/Icon.js";
import type { IconName } from "../internal/Icon.js";

interface StyleSpec {
  id: ClockStyle;
  icon: IconName;
}

const STYLES: readonly StyleSpec[] = [
  { id: "classic", icon: "clock" },
  { id: "split", icon: "list" },
  { id: "minimal", icon: "type" },
  { id: "analog", icon: "timer" },
] as const;

const VALID_STYLES: ReadonlySet<ClockStyle> = new Set<ClockStyle>(
  STYLES.map((s) => s.id),
);

function isValidStyle(s: string): s is ClockStyle {
  return VALID_STYLES.has(s as ClockStyle);
}

export interface ClockWidgetProps {
  lang: Lang;
  now: Date;
}

export function ClockWidget({ lang, now }: ClockWidgetProps) {
  const { s } = useI18n(lang);
  const [rawStyle, setStyle] = usePref("xai_clock_style");
  const [tz, setTz] = usePref("xai_clock_tz");
  const [tzOpen, setTzOpen] = useState(false);

  // Defensive: storage may hold a legacy value not in our 4-style union.
  const style: ClockStyle = isValidStyle(rawStyle) ? rawStyle : "classic";

  // Compute displayed time for the active timezone.
  let displayTime: Date;
  let locationLabel: string;
  if (tz === "local") {
    displayTime = now;
    locationLabel = s("dashboard.widgets.clock.local_time");
  } else {
    const city = findCity(tz);
    if (city) {
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
      displayTime = new Date(utcMs + city.tz * 3600 * 1000);
      locationLabel = city.city[lang];
    } else {
      // Unknown city id — fall back to local without writing storage.
      displayTime = now;
      locationLabel = s("dashboard.widgets.clock.local_time");
    }
  }

  const hh = String(displayTime.getHours()).padStart(2, "0");
  const mm = String(displayTime.getMinutes()).padStart(2, "0");
  const ss = String(displayTime.getSeconds()).padStart(2, "0");
  const h12 = displayTime.getHours() % 12 || 12;
  const ampm = displayTime.getHours() >= 12 ? "PM" : "AM";

  let content;
  if (style === "classic") {
    content = (
      <div className="clock-time mono" data-testid="clock-classic">
        {hh}
        <span className="clk-colon">:</span>
        {mm}
        <span className="clk-sec mono">:{ss}</span>
      </div>
    );
  } else if (style === "split") {
    content = (
      <div className="clock-split mono" data-testid="clock-split">
        <span className="cs-hour">{hh}</span>
        <span className="cs-colon">:</span>
        <span className="cs-min">{mm}</span>
        <span className="cs-colon cs-dim">:</span>
        <span className="cs-dim">{ss}</span>
      </div>
    );
  } else if (style === "minimal") {
    content = (
      <div className="clock-min mono" data-testid="clock-minimal">
        <span>{String(h12).padStart(2, "0")}</span>
        <span className="cm-dim">{mm}</span>
        <span className="cm-ampm">{ampm}</span>
      </div>
    );
  } else {
    // analog
    const h = displayTime.getHours();
    const m = displayTime.getMinutes();
    const sec = displayTime.getSeconds();
    const hAng = ((h % 12) + m / 60) * 30;
    const mAng = (m + sec / 60) * 6;
    const sAng = sec * 6;
    content = (
      <svg
        viewBox="0 0 100 100"
        width="180"
        height="180"
        className="clock-analog"
        data-testid="clock-analog"
        role="img"
        aria-label={s("dashboard.widgets.clock.analog")}
      >
        <circle cx="50" cy="50" r="47" fill="var(--bg-panel-2)" stroke="var(--border-1)" strokeWidth="1" />
        {/* 60 minute ticks — skip multiples of 5 to avoid overlap with major */}
        {Array.from({ length: 60 }).map((_, i) => {
          if (i % 5 === 0) return null;
          const a = (i * 6 * Math.PI) / 180;
          const x1 = 50 + Math.sin(a) * 45;
          const y1 = 50 - Math.cos(a) * 45;
          const x2 = 50 + Math.sin(a) * 46.5;
          const y2 = 50 - Math.cos(a) * 46.5;
          return (
            <line
              key={"m" + i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--text-3)"
              strokeWidth="0.4"
              strokeLinecap="round"
              opacity="0.5"
              data-tick="minor"
            />
          );
        })}
        {/* 12 hour ticks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x1 = 50 + Math.sin(a) * 42;
          const y1 = 50 - Math.cos(a) * 42;
          const x2 = 50 + Math.sin(a) * 46.5;
          const y2 = 50 - Math.cos(a) * 46.5;
          return (
            <line
              key={"h" + i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--text-1)"
              strokeWidth="1.4"
              strokeLinecap="round"
              data-tick="major"
            />
          );
        })}
        {/* 12 numerals */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x = 50 + Math.sin(a) * 36;
          const y = 50 - Math.cos(a) * 36 + 2.4;
          return (
            <text
              key={"n" + n}
              x={x}
              y={y}
              fontSize="6.2"
              fill="var(--text-1)"
              textAnchor="middle"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              data-numeral={n}
            >
              {n}
            </text>
          );
        })}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="26"
          stroke="var(--text-1)"
          strokeWidth="3.2"
          strokeLinecap="round"
          transform={`rotate(${hAng} 50 50)`}
          data-hand="hour"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="14"
          stroke="var(--text-1)"
          strokeWidth="2.0"
          strokeLinecap="round"
          transform={`rotate(${mAng} 50 50)`}
          data-hand="minute"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke="var(--accent)"
          strokeWidth="1.0"
          strokeLinecap="round"
          transform={`rotate(${sAng} 50 50)`}
          data-hand="second"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="58"
          stroke="var(--accent)"
          strokeWidth="1.0"
          strokeLinecap="round"
          transform={`rotate(${sAng} 50 50)`}
          data-hand="second-tail"
        />
        <circle cx="50" cy="50" r="2.8" fill="var(--text-1)" />
        <circle cx="50" cy="50" r="1.2" fill="var(--accent)" />
      </svg>
    );
  }

  return (
    <div className="widget-content w-clock-body">
      <div className="clock-toolbar" data-no-drag>
        <button
          type="button"
          className="clk-tz-btn"
          onClick={() => setTzOpen((o) => !o)}
          title={s("dashboard.widgets.clock.timezone")}
          aria-expanded={tzOpen}
        >
          <Icon name="globe" size={11} />
          <span>{locationLabel}</span>
          <Icon name="chevD" size={10} />
        </button>
        <div className="clk-style-toggle">
          {STYLES.map((st) => (
            <button
              type="button"
              key={st.id}
              aria-selected={style === st.id}
              onClick={() => setStyle(st.id)}
              title={s("dashboard.widgets.clock." + st.id)}
              data-clock-style={st.id}
            >
              <Icon name={st.icon} size={11} />
            </button>
          ))}
        </div>
        {tzOpen && (
          <>
            <div
              className="popover-scrim"
              data-no-drag
              onClick={() => setTzOpen(false)}
            />
            <div className="popover clk-tz-popover" data-no-drag>
              <div className="popover-list">
                <button
                  type="button"
                  className={"popover-item" + (tz === "local" ? " active" : "")}
                  onClick={() => {
                    setTz("local");
                    setTzOpen(false);
                  }}
                  data-tz-id="local"
                >
                  <Icon name="pin" size={13} />
                  <span>{s("dashboard.widgets.clock.local_time")}</span>
                  {tz === "local" && (
                    <Icon
                      name="check2"
                      size={13}
                      color="var(--accent)"
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </button>
                <div className="popover-divider" />
                {CITY_LIBRARY.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={"popover-item" + (tz === c.id ? " active" : "")}
                    onClick={() => {
                      setTz(c.id);
                      setTzOpen(false);
                    }}
                    data-tz-id={c.id}
                  >
                    <Icon name="globe" size={13} />
                    <span>{c.city[lang]}</span>
                    <span
                      className="mono"
                      style={{ marginLeft: "auto", fontSize: 11, opacity: 0.65 }}
                    >
                      UTC{c.tz >= 0 ? "+" : ""}
                      {c.tz}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {content}
      <div className="clock-sub">{locationLabel}</div>
    </div>
  );
}
