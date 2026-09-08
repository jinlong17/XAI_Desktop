/**
 * ViewPicker — 6-button view switcher for the Board module header.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §2
 */

import type { BoardViewId, ViewPickerEntry } from "./types.js";
import type { Lang } from "./internal/i18n.js";

export interface ViewPickerProps {
  activeView: BoardViewId;
  onChange: (next: BoardViewId) => void;
  lang: Lang;
}

const VIEW_ENTRIES: ViewPickerEntry[] = [
  { id: "board",     labelEn: "Board",     labelZh: "看板",   icon: "kanban"   },
  { id: "table",     labelEn: "Table",     labelZh: "表格",   icon: "grid"     },
  { id: "calendar",  labelEn: "Calendar",  labelZh: "日历",   icon: "calendar" },
  { id: "dashboard", labelEn: "Dashboard", labelZh: "仪表盘", icon: "barchart" },
  { id: "timeline",  labelEn: "Timeline",  labelZh: "时间轴", icon: "gantt"    },
  { id: "map",       labelEn: "Map",       labelZh: "地图",   icon: "globe"    },
];

export function ViewPicker({ activeView, onChange, lang }: ViewPickerProps) {
  return (
    <div className="view-picker" data-testid="view-picker" role="toolbar" aria-label={lang === "zh" ? "视图切换" : "Switch view"}>
      {VIEW_ENTRIES.map((entry) => {
        const isActive = entry.id === activeView;
        const label = lang === "zh" ? entry.labelZh : entry.labelEn;
        return (
          <button
            key={entry.id}
            type="button"
            className={"vp-btn" + (isActive ? " active" : "")}
            aria-pressed={isActive}
            data-view={entry.id}
            data-testid={`vp-btn-${entry.id}`}
            onClick={() => onChange(entry.id)}
            title={label}
          >
            <span className={`vp-icon vp-icon-${entry.icon}`} aria-hidden="true" />
            <span className="vp-label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
