/**
 * BoardDashboardView — 4 KPI cards + 2 horizontal bar charts (per-list,
 * per-label). Pure CSS divs — no chart library.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §5
 */

import type { BoardLabel, BoardListData } from "@repo/plugin-web-board-core";
import { DEFAULT_BOARD_LABELS, getBoardCardDateMeta } from "@repo/plugin-web-board-core";
import type { Lang } from "./internal/i18n.js";

export interface BoardDashboardViewProps {
  lists: readonly BoardListData[];
  lang: Lang;
  /** Board label catalog; must match the other views so per-label stats agree. */
  labelCatalog?: readonly BoardLabel[];
}

interface KpiProps {
  label: string;
  value: number;
  color: string;
}

function KpiCard({ label, value, color }: KpiProps) {
  return (
    <div className="bd-kpi panel" data-testid="bd-kpi">
      <span
        className="kpi-ico"
        style={{ color, background: `color-mix(in oklch, ${color} 14%, transparent)` }}
        aria-hidden="true"
      />
      <div>
        <div className="bd-kpi-val mono" data-testid="bd-kpi-val">
          {value}
        </div>
        <div className="bd-kpi-label" data-testid="bd-kpi-label">
          {label}
        </div>
      </div>
    </div>
  );
}

export function BoardDashboardView({
  lists,
  lang,
  labelCatalog = DEFAULT_BOARD_LABELS,
}: BoardDashboardViewProps) {
  const total = lists.reduce((n, l) => n + l.cards.length, 0);
  const allCards = lists.flatMap((l) => l.cards);
  const now = new Date();
  const dateMetas = allCards.map((c) => getBoardCardDateMeta(c, { now }));
  const overdue = dateMetas.filter((meta) => meta.isOverdue).length;
  const dueToday = dateMetas.filter((meta) => meta.isDueToday).length;

  // Per-label counts
  const labelCounts: Record<string, number> = {};
  allCards.forEach((c) => {
    (c.labels ?? []).forEach((id) => {
      labelCounts[id] = (labelCounts[id] ?? 0) + 1;
    });
  });

  const labelData = labelCatalog.map((l) => ({
    label: l,
    count: labelCounts[l.id] ?? 0,
  })).filter((d) => d.count > 0);

  const maxLabelCount = Math.max(1, ...labelData.map((d) => d.count));

  const KPIs = [
    {
      label: lang === "zh" ? "卡片总数" : "Total cards",
      value: total,
      color: "var(--accent)",
    },
    {
      label: lang === "zh" ? "今日到期" : "Due today",
      value: dueToday,
      color: "var(--amber, oklch(72% 0.16 85))",
    },
    {
      label: lang === "zh" ? "逾期" : "Overdue",
      value: overdue,
      color: "var(--red, oklch(60% 0.18 25))",
    },
    {
      label: lang === "zh" ? "列数" : "Lists",
      value: lists.length,
      color: "var(--blue, oklch(60% 0.14 245))",
    },
  ];

  return (
    <div className="board-dash" data-testid="board-dash">
      <div className="bd-kpis" data-testid="bd-kpis">
        {KPIs.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} color={kpi.color} />
        ))}
      </div>

      <div className="bd-row">
        {/* Per-list bar chart */}
        <div className="bd-card panel" data-testid="bd-per-list">
          <h3>{lang === "zh" ? "按列分布" : "Cards per list"}</h3>
          <div className="bd-bars">
            {lists.map((l) => {
              const name = l.key ?? (l.customName?.[lang] ?? "");
              const color = l.color
                ? `var(--board-list-color-${l.color})`
                : "var(--accent)";
              const pct = Math.round((100 * l.cards.length) / Math.max(1, total));
              return (
                <div key={l.id} className="bd-bar-row" data-testid="bd-bar-row-list">
                  <div className="bd-bar-label">{name}</div>
                  <div className="bd-bar-track">
                    <div
                      className="bd-bar-fill"
                      style={{ width: pct + "%", background: color }}
                      data-testid="bd-bar-fill-list"
                    />
                  </div>
                  <div className="bd-bar-val mono">{l.cards.length}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-label bar chart */}
        <div className="bd-card panel" data-testid="bd-per-label">
          <h3>{lang === "zh" ? "按标签分布" : "Cards by label"}</h3>
          <div className="bd-bars">
            {labelData.map(({ label, count }) => {
              const pct = (count / maxLabelCount) * 100;
              return (
                <div key={label.id} className="bd-bar-row" data-testid="bd-bar-row-label">
                  <div className="bd-bar-label">
                    <span className="bc-label" style={{ background: label.color }}>
                      {label.name[lang]}
                    </span>
                  </div>
                  <div className="bd-bar-track">
                    <div
                      className="bd-bar-fill"
                      style={{ width: pct + "%", background: label.color }}
                      data-testid="bd-bar-fill-label"
                    />
                  </div>
                  <div className="bd-bar-val mono">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
