/**
 * Billing (订阅 / 计费) — KPI metric tiles + plan distribution bars + a recent
 * transactions table. All read-only this slice (real Stripe state is row #3).
 * Reads through `billingReadSeam` (../adapters). No inline mock data.
 */
import { useEffect, useState } from "react";
import { billingReadSeam } from "../adapters";
import type { BillingMetrics, PlanShare, TxnRow } from "../adapters/types";
import { Badge, DataTable, MiniBar, PlanTag, statusTone, Panel, type Column } from "../components/primitives";

const EMPTY_METRICS: BillingMetrics = {
  mrr: "$0",
  activeOrgs: 0,
  failedPayments: 0,
  arpu: "$0",
};

export function BillingPage(): React.ReactElement {
  const [metrics, setMetrics] = useState<BillingMetrics>(EMPTY_METRICS);
  const [dist, setDist] = useState<PlanShare[]>([]);
  const [txns, setTxns] = useState<TxnRow[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      billingReadSeam.metrics(),
      billingReadSeam.planDistribution(),
      billingReadSeam.transactions(),
    ]).then(([metricsRes, distRes, txnsRes]) => {
      if (!alive) return;
      setMetrics(metricsRes.ok ? metricsRes.data : EMPTY_METRICS);
      setDist(distRes.ok ? distRes.data : []);
      setTxns(txnsRes.ok ? txnsRes.data : []);
    });
    return () => {
      alive = false;
    };
  }, []);

  const cols: Column<TxnRow>[] = [
    { header: "组织", cell: (t) => <b>{t.org}</b> },
    { header: "套餐", cell: (t) => <PlanTag plan={t.plan} /> },
    { header: "金额", align: "right", cell: (t) => <b className="mono">{t.amount}</b> },
    { header: "状态", cell: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
    { header: "日期", cell: (t) => <span className="mono muted">{t.date}</span> },
  ];

  return (
    <div className="page page--billing">
      <div className="grid-kpi">
        <div className="kpi">
          <div className="kpi-label">月度经常性收入</div>
          <div className="kpi-value">{metrics.mrr}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">活跃组织</div>
          <div className="kpi-value">{metrics.activeOrgs}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">付款失败</div>
          <div className="kpi-value">{metrics.failedPayments}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">客单价 (ARPU)</div>
          <div className="kpi-value">{metrics.arpu}</div>
        </div>
      </div>

      <div className="grid-2">
        <Panel title="套餐分布">
          <div className="dist-list">
            {dist.map((d) => (
              <div className="dist-row" key={d.plan}>
                <PlanTag plan={d.plan} />
                <MiniBar pct={d.share} />
                <span className="dist-pct">{d.share}%</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="近期账单">
          <DataTable columns={cols} rows={txns} rowKey={(t, i) => `${t.org}-${i}`} />
        </Panel>
      </div>
    </div>
  );
}
