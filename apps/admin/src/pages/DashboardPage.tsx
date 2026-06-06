/**
 * Dashboard (总览看板) — KPIs, operational queues, feature ranking, usage heatmap.
 * Reads through `overviewAdapter` (../adapters). No inline mock data.
 */
import { useState } from "react";
import { overviewAdapter, featuresAdapter } from "../adapters";
import { Panel, MiniBar } from "../components/primitives";

export function DashboardPage(): React.ReactElement {
  const kpis = overviewAdapter.getKpis();
  const queues = overviewAdapter.getOpsQueue();
  const ranking = overviewAdapter.getFeatureRanking();
  const features = featuresAdapter.list();
  const [heatFeat, setHeatFeat] = useState("");
  const heat = overviewAdapter.getUsageHeatmap(heatFeat || undefined);
  const maxUses = Math.max(...ranking.map((r) => r.uses), 1);

  return (
    <div className="page page--dashboard">
      <div className="grid-kpi">
        {kpis.map((k) => (
          <div className="kpi" key={k.key}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-spark" aria-hidden>
              {k.spark.map((v, i) => (
                <i key={i} style={{ height: `${(v / Math.max(...k.spark)) * 100}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-head">运营队列</h2>
      <div className="grid-queues">
        {queues.map((q) => (
          <div className={`queue queue--${q.tone}`} key={q.key}>
            <div className="queue-head">
              <span className="q-ico" aria-hidden>
                {q.icon}
              </span>
              <div className="qh">
                <b>{q.title}</b>
                <span>{q.sub}</span>
              </div>
              <div className="qbig">{q.count}</div>
            </div>
            {q.rows.map((r, i) => (
              <div className="qrow" key={i}>
                <div className="qr-main">
                  <b>{r.title}</b>
                  <span>{r.detail}</span>
                </div>
                <span className="qr-meta">{r.meta}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <Panel title="功能使用排行">
          <div className="rank-list">
            {ranking.map((f, i) => (
              <div className="rank" key={f.key}>
                <span className="rk">{i + 1}</span>
                <span className="rk-nm">
                  {f.icon} {f.name}
                </span>
                <div className="rk-bar">
                  <MiniBar pct={(f.uses / maxUses) * 100} />
                </div>
                <span className="rk-v">{f.uses.toLocaleString()} 次</span>
                <span className={`rk-h ${f.trend >= 0 ? "up" : "down"}`}>
                  {f.trend >= 0 ? "▲" : "▼"}
                  {Math.abs(f.trend)}%
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="使用热力图"
          actions={
            <select
              className="select"
              value={heatFeat}
              aria-label="按功能筛选热力图"
              onChange={(e) => setHeatFeat(e.target.value)}
            >
              <option value="">全部功能(汇总)</option>
              {features.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.icon} {f.name}
                </option>
              ))}
            </select>
          }
        >
          <div className="heatmap" role="img" aria-label="使用强度热力图">
            {heat.map((row, d) =>
              row.map((cell, s) => (
                <div
                  key={`${d}-${s}`}
                  className="heat-cell"
                  data-intensity={cell}
                  title={`强度 ${cell}/4`}
                />
              )),
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
