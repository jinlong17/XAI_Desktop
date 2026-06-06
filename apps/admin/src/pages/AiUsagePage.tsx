/**
 * AI usage & quota (AI 用量 & 配额) — top spenders table (with a destructive-free
 * "adjust quota" no-op) + per-plan routing policy table.
 * Reads through `aiUsageAdapter` (../adapters). No inline mock data.
 */
import { aiUsageAdapter } from "../adapters";
import type { SpenderRow, QuotaPolicy } from "../adapters/types";
import { useAdminUi } from "../components/AdminUiContext";
import { Badge, DataTable, MiniBar, PlanTag, type Column } from "../components/primitives";

const OVER_BADGE: Record<string, { label: string; tone: "danger" | "warning" | "info" }> = {
  block: { label: "阻断", tone: "danger" },
  throttle: { label: "降速", tone: "warning" },
  alert: { label: "仅告警", tone: "info" },
};

export function AiUsagePage(): React.ReactElement {
  const { toast, commands } = useAdminUi();
  const spenders = aiUsageAdapter.topSpenders();
  const policies = aiUsageAdapter.quotaPolicies();

  async function adjustQuota(s: SpenderRow): Promise<void> {
    await commands.setQuota({ subject: s.name, quota: s.quotaM });
    toast(`配额面板（mock）· ${s.name}`);
  }

  const spenderCols: Column<SpenderRow>[] = [
    {
      header: "消费方",
      cell: (s) => (
        <div className="u">
          <div className="av" style={{ background: s.color }}>
            {s.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="nm">{s.name}</div>
        </div>
      ),
    },
    { header: "套餐", cell: (s) => <PlanTag plan={s.plan} /> },
    {
      header: "用量",
      cell: (s) => {
        const pct = Math.round((s.usedM / s.quotaM) * 100);
        return (
          <div className="usage">
            {s.usedM}M / {s.quotaM}M · {pct}%
            <MiniBar pct={pct} tone={pct >= 100 ? "danger" : pct >= 80 ? "warning" : "success"} />
          </div>
        );
      },
    },
    {
      header: "状态",
      cell: (s) => {
        const pct = (s.usedM / s.quotaM) * 100;
        return pct >= 100 ? (
          <Badge tone="danger">已超额</Badge>
        ) : pct >= 80 ? (
          <Badge tone="warning">接近上限</Badge>
        ) : (
          <Badge tone="success">正常</Badge>
        );
      },
    },
    { header: "成本", align: "right", cell: (s) => <b>{s.cost}</b> },
    {
      header: "",
      align: "right",
      cell: (s) => (
        <button type="button" className="btn btn--sm" onClick={() => void adjustQuota(s)}>
          调整配额
        </button>
      ),
    },
  ];

  const policyCols: Column<QuotaPolicy>[] = [
    { header: "套餐", cell: (p) => <PlanTag plan={p.plan} /> },
    { header: "默认模型", cell: (p) => <span className="mono">{p.model}</span> },
    { header: "降级模型", cell: (p) => <span className="mono muted">{p.fallback}</span> },
    { header: "成本上限", cell: (p) => <b>{p.cap}</b> },
    { header: "请求上限", cell: (p) => <span className="mono">{p.requests}</span> },
    {
      header: "超限行为",
      cell: (p) => <Badge tone={OVER_BADGE[p.overage]!.tone}>{OVER_BADGE[p.overage]!.label}</Badge>,
    },
  ];

  return (
    <div className="page page--ai">
      <h2 className="section-head">高消费方 Top</h2>
      <DataTable columns={spenderCols} rows={spenders} rowKey={(s) => s.name} />
      <h2 className="section-head">套餐路由与配额策略</h2>
      <DataTable columns={policyCols} rows={policies} rowKey={(p) => p.plan} />
    </div>
  );
}
