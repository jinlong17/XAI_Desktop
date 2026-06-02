import { formatDuration, getTimeTrackerSnapshot } from "@repo/plugin-web-time-tracker";
import type { Lang } from "@repo/plugin-web-tokens";

export interface TimeTrackerWidgetProps {
  readonly lang: Lang;
  readonly now: Date;
  readonly goTo: (moduleId: string) => void;
}

export function TimeTrackerWidget({ lang, now, goTo }: TimeTrackerWidgetProps) {
  const snapshot = getTimeTrackerSnapshot(now.getTime());
  const title = lang === "zh" ? "时间追踪" : "Time tracked";
  const running = lang === "zh" ? "计时中" : "running";
  const open = lang === "zh" ? "打开追踪" : "Open tracker";
  const top = snapshot.topCategoryName?.[lang] ?? (lang === "zh" ? "暂无分类记录" : "No category yet");

  return (
    <button
      type="button"
      className="widget-content tt-widget"
      onClick={() => goTo("timetrack")}
      data-no-drag
    >
      <span className="ws-label">{title}</span>
      <span className="ttw-row">
        <strong className="ttw-total mono">{formatDuration(snapshot.todayTotalMs)}</strong>
        <span className={`ttw-live${snapshot.runningCount > 0 ? " is-on" : ""}`}>
          {snapshot.runningCount} {running}
        </span>
      </span>
      <span className="ttw-meta">{top}</span>
      <span className="ttw-open">{open}</span>
    </button>
  );
}
