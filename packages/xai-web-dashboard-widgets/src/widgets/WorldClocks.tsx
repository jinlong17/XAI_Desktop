/**
 * WorldClocks — list / analog / grid view of world clocks for selected cities.
 *
 * Zones persisted to xai_zones; default ["shanghai","london","new_york","tokyo"]
 * per design.md §1.1 #9. Add/remove via picker + per-row remove button.
 *
 * Per row #10 api.md §S4: .tz-view-toggle + .tz-picker carry data-no-drag.
 *
 * Ported from `web design/module-dashboard.jsx` lines 584-727.
 */
import { useState } from "react";

import { usePref } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import type { IconName } from "../internal/Icon.js";
import { TzClock } from "../internal/TzClock.js";
import { CITY_LIBRARY, findCity } from "../internal/cityLibrary.js";

export interface WorldClocksProps {
  lang: Lang;
  now: Date;
}

const DEFAULT_ZONES: readonly string[] = ["shanghai", "london", "new_york", "tokyo"];
type TzView = "list" | "analog" | "grid";

interface ViewSpec {
  id: TzView;
  icon: IconName;
}
const VIEW_SPECS: readonly ViewSpec[] = [
  { id: "list", icon: "list" },
  { id: "analog", icon: "clock" },
  { id: "grid", icon: "grid4" },
];

export function WorldClocks({ lang, now }: WorldClocksProps) {
  const { s } = useI18n(lang);
  const [persistedZones, setPersistedZones] = usePref("xai_zones");
  const [view, setView] = useState<TzView>("list");
  const [picker, setPicker] = useState(false);

  // If storage is empty (registry default is []), seed with the four prototype
  // defaults for first render. Do NOT write back here — the user may have
  // intentionally cleared zones; first-mount effect could be surprising.
  const zones: string[] =
    persistedZones && persistedZones.length > 0
      ? persistedZones.filter((id) => findCity(id))
      : Array.from(DEFAULT_ZONES);

  const items = zones.map((id) => findCity(id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const hereOffset = -now.getTimezoneOffset() / 60;

  const addZone = (id: string) => {
    if (!zones.includes(id)) setPersistedZones([...zones, id]);
    setPicker(false);
  };
  const removeZone = (id: string) => {
    // Prevent removing the last zone (AC-WORLDCLOCKS-7).
    if (zones.length <= 1) return;
    setPersistedZones(zones.filter((z) => z !== id));
  };

  return (
    <div className="widget-content w-timezones-body">
      <div className="wgt-h">
        <Icon name="globe" size={14} />
        <span>{s("dashboard.timezones")}</span>
        <span className="grow" />
        <div className="tz-view-toggle" data-no-drag>
          {VIEW_SPECS.map((v) => (
            <button
              type="button"
              key={v.id}
              aria-selected={view === v.id}
              onClick={() => setView(v.id)}
              title={s("dashboard.widgets.world_clocks." + v.id)}
              data-tz-view={v.id}
            >
              <Icon name={v.icon} size={11} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setPicker((p) => !p)}
          title={s("dashboard.widgets.world_clocks.add_city")}
          data-no-drag
          data-tz-add
        >
          <Icon name="plus" size={14} />
        </button>
      </div>

      <div className={"tz-body tz-body-" + view}>
        {items.map((z) => {
          const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
          const local = new Date(utcMs + z.tz * 3600 * 1000);
          const h24 = local.getHours();
          const h12 = h24 % 12 || 12;
          const m = String(local.getMinutes()).padStart(2, "0");
          const ampm = h24 >= 12 ? "PM" : "AM";
          const isNight = h24 < 6 || h24 >= 19;
          const dayDelta = computeDayDelta(now, local, s);
          const offsetDelta = z.tz - hereOffset;
          const offsetStr = (offsetDelta >= 0 ? "+" : "") + offsetDelta + "h";
          const removeAriaLabel = s("dashboard.widgets.world_clocks.remove");

          if (view === "analog") {
            return (
              <div key={z.id} className="tz-row tz-row-analog" data-tz-id={z.id}>
                <TzClock h={h24} m={local.getMinutes()} s={local.getSeconds()} size={56} />
                <div className="tz-info">
                  <div className="tz-city">{z.city[lang]}</div>
                  <div className="tz-meta">
                    <span className="tz-day">{dayDelta}</span>
                    <span className="tz-offset mono">{offsetStr}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="tz-remove"
                  onClick={() => removeZone(z.id)}
                  aria-label={removeAriaLabel}
                  data-tz-remove={z.id}
                >
                  <Icon name="close" size={11} />
                </button>
              </div>
            );
          }
          if (view === "grid") {
            return (
              <div
                key={z.id}
                className={"tz-card" + (isNight ? " night" : "")}
                data-tz-id={z.id}
              >
                <div className="tz-card-head">
                  <span className="tz-city">{z.city[lang]}</span>
                  <button
                    type="button"
                    className="tz-remove"
                    onClick={() => removeZone(z.id)}
                    aria-label={removeAriaLabel}
                    data-tz-remove={z.id}
                  >
                    <Icon name="close" size={11} />
                  </button>
                </div>
                <div className="tz-card-time mono">
                  {String(h24).padStart(2, "0")}
                  <span className="tz-colon">:</span>
                  {m}
                </div>
                <div className="tz-card-foot">
                  <span>{dayDelta}</span>
                  <span className="tz-offset mono">{offsetStr}</span>
                </div>
              </div>
            );
          }
          // list
          return (
            <div key={z.id} className="tz-row tz-row-list" data-tz-id={z.id}>
              <div className="tz-info">
                <div className="tz-city">{z.city[lang]}</div>
                <div className="tz-meta">
                  <span className="tz-day">{dayDelta}</span>
                  <span className="tz-divider">·</span>
                  <span className="tz-offset mono">{offsetStr}</span>
                </div>
              </div>
              <div className="tz-big mono">
                <span className="tz-h">{String(h12).padStart(2, "0")}</span>
                <span className="tz-colon">:</span>
                <span className="tz-h">{m}</span>
                <span className="tz-ampm">{ampm}</span>
              </div>
              <button
                type="button"
                className="tz-remove"
                onClick={() => removeZone(z.id)}
                aria-label={removeAriaLabel}
                data-tz-remove={z.id}
              >
                <Icon name="close" size={11} />
              </button>
            </div>
          );
        })}
      </div>

      {picker && (
        <div className="tz-picker" data-no-drag>
          <div className="tz-picker-h">{s("dashboard.widgets.world_clocks.add_city")}</div>
          <div className="tz-picker-list">
            {CITY_LIBRARY.filter((c) => !zones.includes(c.id)).map((c) => (
              <button
                type="button"
                key={c.id}
                className="tz-picker-row"
                onClick={() => addZone(c.id)}
                data-tz-add-id={c.id}
              >
                <span>{c.city[lang]}</span>
                <span className="tz-offset mono">
                  UTC{c.tz >= 0 ? "+" : ""}
                  {c.tz}
                </span>
              </button>
            ))}
            {CITY_LIBRARY.filter((c) => !zones.includes(c.id)).length === 0 && (
              <div className="tz-picker-empty">
                {s("dashboard.widgets.world_clocks.all_added")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function computeDayDelta(now: Date, local: Date, s: (k: string) => string): string {
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d2 = new Date(local.getFullYear(), local.getMonth(), local.getDate());
  const diff = Math.round((d2.getTime() - d1.getTime()) / 86_400_000);
  if (diff === 0) return s("dashboard.widgets.world_clocks.today");
  if (diff === 1) return s("dashboard.widgets.world_clocks.tomorrow");
  if (diff === -1) return s("dashboard.widgets.world_clocks.yesterday");
  return (diff > 0 ? "+" : "") + diff + "d";
}
