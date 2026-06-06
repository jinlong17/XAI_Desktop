/**
 * Providers (Provider 配置) — provider cards (KEY STATUS ONLY, never key material)
 * + a model × plan availability matrix, with a guarded routing-policy command.
 * Reads through `providersReadSeam` (../adapters). No inline mock data.
 *
 * SECURITY: renders `keyStatus` (configured / not-configured) ONLY. There is no
 * key, mask, or secret-shaped string anywhere on this page (api.md §6).
 */
import { useEffect, useState } from "react";
import { providersReadSeam } from "../adapters";
import type { ModelPlanCell, ProviderCard } from "../adapters/types";
import { useAdminUi } from "../components/AdminUiContext";
import { Badge, DataTable, Panel, type Column } from "../components/primitives";

export function ProvidersPage(): React.ReactElement {
  const { requestConfirm, toast, commands } = useAdminUi();
  const [cards, setCards] = useState<ProviderCard[]>([]);
  const [matrix, setMatrix] = useState<ModelPlanCell[]>([]);

  useEffect(() => {
    void providersReadSeam.list().then((res) => {
      if (res.ok) setCards(res.data);
    });
    void providersReadSeam.modelPlanMatrix().then((res) => {
      if (res.ok) setMatrix(res.data);
    });
  }, []);

  function manageRouting(p: ProviderCard): void {
    requestConfirm({
      title: `更新「${p.name}」默认路由？`,
      body: "将 Pro 套餐默认模型切换到当前提供商的默认模型。此操作会被审计记录。",
      tone: "warning",
      confirmLabel: "更新路由",
      requireType: "ROUTING",
      onConfirm: async () => {
        await commands.setProviderRouting({ plan: "Pro", model: p.defaultModel });
        toast(`已提交 ${p.name} 路由策略`);
      },
    });
  }

  const matrixCols: Column<ModelPlanCell>[] = [
    { header: "模型", cell: (m) => <span className="mono">{m.modelId}</span> },
    {
      header: "提供商",
      cell: (m) => (
        <span>
          <span className="dot" style={{ background: m.providerColor }} /> {m.providerName}
        </span>
      ),
    },
    { header: "标签", cell: (m) => <Badge tone="muted">{m.tag}</Badge> },
    { header: "Free", align: "center", cell: (m) => (m.tiers.free ? "✓" : "") },
    { header: "Pro", align: "center", cell: (m) => (m.tiers.pro ? "✓" : "") },
    { header: "Team", align: "center", cell: (m) => (m.tiers.team ? "✓" : "") },
  ];

  return (
    <div className="page page--providers">
      <div className="provider-cards">
        {cards.map((p) => (
          <div className={`pcard ${p.enabled ? "" : "off"}`} key={p.key}>
            <div className="pc-head">
              <div className="pc-nm">
                <span className="dot" style={{ background: p.color }} />
                {p.name}
              </div>
              <span className={`toggle ${p.enabled ? "on" : ""}`} aria-hidden>
                <span className="toggle-knob" />
              </span>
            </div>
            {/* KEY STATUS ONLY — never key material */}
            <div className="pc-key">
              🔑 密钥{" "}
              <Badge tone={p.keyStatus === "configured" ? "success" : "muted"}>
                {p.keyStatus === "configured" ? "已配置" : "未配置"}
              </Badge>
            </div>
            <div className="pc-stats">
              <span>
                本月 <b>{p.usage}</b> tokens
              </span>
              <span>
                成本 <b>{p.cost}</b>
              </span>
              <span>
                默认 <b>{p.defaultModel}</b>
              </span>
            </div>
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => manageRouting(p)}
            >
              管理限速与默认模型
            </button>
          </div>
        ))}
      </div>

      <Panel title="模型 × 套餐可用性矩阵">
        <DataTable columns={matrixCols} rows={matrix} rowKey={(m) => m.modelId} />
      </Panel>
    </div>
  );
}
