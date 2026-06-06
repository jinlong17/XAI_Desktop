/**
 * Orgs / spaces (组织 / 空间 — nav key "boards") — org table with seats/usage and
 * a detail drawer carrying the destructive transfer-ownership flow (type-to-confirm,
 * wired to NO-OP commands).
 * Reads through `orgsAdapter` (../adapters). No inline mock data.
 */
import { useState } from "react";
import { orgsAdapter } from "../adapters";
import type { OrgRow } from "../adapters/types";
import { useAdminUi } from "../components/AdminUiContext";
import { Badge, DataTable, MiniBar, PlanTag, statusTone, type Column } from "../components/primitives";

const STATUS_LABEL: Record<string, string> = { active: "正常", overage: "超额", dunning: "催款中" };

export function OrgsPage(): React.ReactElement {
  const { requestConfirm, toast, commands } = useAdminUi();
  const [detail, setDetail] = useState<OrgRow | null>(null);
  const rows = orgsAdapter.list();

  function transferOwnership(o: OrgRow): void {
    requestConfirm({
      title: "转移所有权？",
      body: `组织 ${o.name} 的所有权将被转移,原所有者降级为管理员。高危操作需输入确认。`,
      tone: "danger",
      requireType: "TRANSFER",
      confirmLabel: "转移",
      onConfirm: async () => {
        await commands.transferOwnership({ org: o.name, toMember: "" });
        setDetail(null);
        toast("已发起所有权转移");
      },
    });
  }

  const columns: Column<OrgRow>[] = [
    {
      header: "组织",
      cell: (o) => (
        <div className="u">
          <div className="av av--sq" style={{ background: o.color }}>
            {o.short}
          </div>
          <div className="nm">{o.name}</div>
        </div>
      ),
    },
    { header: "套餐", cell: (o) => <PlanTag plan={o.plan} /> },
    {
      header: "席位",
      cell: (o) => {
        const over = o.seatsUsed > o.seatsCap;
        return (
          <div className="seat">
            {o.seatsUsed} / {o.seatsCap} 席位 {over ? <b className="cost-high">· 超员</b> : null}
            <MiniBar pct={(o.seatsUsed / o.seatsCap) * 100} tone={over ? "danger" : "accent"} />
          </div>
        );
      },
    },
    { header: "本月成本", align: "right", cell: (o) => <b>{o.cost}</b> },
    {
      header: "状态",
      cell: (o) => <Badge tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</Badge>,
    },
    { header: "所有者", cell: (o) => <span className="muted">{o.owner}</span> },
  ];

  return (
    <div className="page page--orgs">
      <DataTable columns={columns} rows={rows} onRowClick={(o) => setDetail(o)} rowKey={(o) => o.name} />

      {detail ? (
        <div className="drawer-scrim" role="presentation" onClick={() => setDetail(null)}>
          <aside className="drawer" role="dialog" aria-label="组织详情" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="drawer-close" aria-label="关闭" onClick={() => setDetail(null)}>
              ×
            </button>
            <div className="drawer-head">
              <div className="av av--lg av--sq" style={{ background: detail.color }}>
                {detail.short}
              </div>
              <div>
                <h2>{detail.name}</h2>
                <div className="drawer-meta">
                  <PlanTag plan={detail.plan} />
                  <span className="muted">所有者 {detail.owner}</span>
                  <Badge tone={statusTone(detail.status)}>{STATUS_LABEL[detail.status]}</Badge>
                </div>
              </div>
            </div>
            <dl className="kv">
              <div>
                <dt>组织 ID</dt>
                <dd>{orgsAdapter.get(detail.name)?.orgId}</dd>
              </div>
              <div>
                <dt>创建时间</dt>
                <dd>{detail.created}</dd>
              </div>
              <div>
                <dt>本月请求</dt>
                <dd>{detail.requests}</dd>
              </div>
              <div>
                <dt>Token 用量</dt>
                <dd>{detail.tokens}</dd>
              </div>
            </dl>
            <div className="drawer-actions">
              <button type="button" className="btn btn--danger" onClick={() => transferOwnership(detail)}>
                转移所有权
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
