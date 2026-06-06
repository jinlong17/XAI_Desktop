/**
 * Billing (订阅 / 计费) — KPI metric tiles + plan distribution bars + a recent
 * transactions table. All read-only this slice (real Stripe state is row #3).
 * Reads through `billingAdapter` (../adapters). No inline mock data.
 */
import { billingAdapter } from "../adapters";
import type { TxnRow } from "../adapters/types";
import { Badge, DataTable, MiniBar, PlanTag, statusTone, Panel, type Column } from "../components/primitives";

export function BillingPage(): React.ReactElement {
  const metrics = billingAdapter.metrics();
  const dist = billingAdapter.planDistribution();
  const txns = billingAdapter.transactions();

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
