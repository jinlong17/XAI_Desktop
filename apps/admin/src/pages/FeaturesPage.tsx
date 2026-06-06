/**
 * Features (功能管理) — feature-flag table with search/category filter and a
 * status toggle whose "take offline" path is a destructive type-to-confirm flow
 * wired through the guarded command seam.
 * Reads through `featuresReadSeam` (../adapters). No inline mock data.
 */
import { useEffect, useState } from "react";
import { featuresAdapter, featuresReadSeam } from "../adapters";
import type { FeatureFlag, FeatureCategory } from "../adapters/types";
import { useAdminUi } from "../components/AdminUiContext";
import { Badge, DataTable, type Column } from "../components/primitives";

const SCOPE_LABEL: Record<string, { label: string; tone: "success" | "warning" | "muted" }> = {
  on: { label: "全量", tone: "success" },
  beta: { label: "灰度", tone: "warning" },
  off: { label: "已下线", tone: "muted" },
};

function qLabel(v: number): string {
  return v === -1 ? "无限" : v === 0 ? "—" : String(v);
}

export function FeaturesPage(): React.ReactElement {
  const { requestConfirm, toast, commands } = useAdminUi();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<FeatureCategory | "">("");
  const categories = featuresAdapter.categories();
  const [rows, setRows] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    void featuresReadSeam.list({ text, category }).then((res) => {
      if (res.ok) setRows(res.data);
    });
  }, [text, category]);

  function takeOffline(f: FeatureFlag): void {
    requestConfirm({
      title: `下线「${f.name}」？`,
      body: "下线后所有套餐用户将不可见该功能,可随时重新上线。此操作会被审计记录。",
      tone: "warning",
      confirmLabel: "下线",
      onConfirm: async () => {
        await commands.setFeatureRollout({ key: f.key, rollout: 0 });
        toast(`已下线 ${f.name}`);
      },
    });
  }

  const columns: Column<FeatureFlag>[] = [
    {
      header: "功能",
      cell: (f) => (
        <div className="u">
          <div className="fic" aria-hidden>
            {f.icon}
          </div>
          <div>
            <div className="nm">{f.name}</div>
            <div className="em">
              {f.category} · {f.key}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "状态",
      cell: (f) => {
        const scope = SCOPE_LABEL[f.status]!;
        const on = f.status !== "off";
        return (
          <button
            type="button"
            className={`toggle ${on ? "on" : ""}`}
            aria-label={`${f.name} 开关`}
            onClick={(e) => {
              e.stopPropagation();
              if (on) takeOffline(f);
              else toast(`已上线 ${f.name}`);
            }}
          >
            <span className="toggle-knob" />
          </button>
        );
      },
    },
    {
      header: "范围",
      cell: (f) => (
        <Badge tone={SCOPE_LABEL[f.status]!.tone}>
          {SCOPE_LABEL[f.status]!.label}
          {f.status === "beta" ? ` ${f.rollout}%` : ""}
        </Badge>
      ),
    },
    { header: "Free", align: "center", cell: (f) => qLabel(f.quota.free) },
    { header: "Pro", align: "center", cell: (f) => qLabel(f.quota.pro) },
    { header: "Team", align: "center", cell: (f) => qLabel(f.quota.team) },
    { header: "用量", align: "right", cell: (f) => `${f.uses.toLocaleString()} 次` },
  ];

  return (
    <div className="page page--features">
      <div className="toolbar">
        <input
          className="search"
          placeholder="搜索功能名 / key…"
          value={text}
          aria-label="搜索功能"
          onChange={(e) => setText(e.target.value)}
        />
        <select
          className="select"
          value={category}
          aria-label="按分类筛选"
          onChange={(e) => setCategory(e.target.value as FeatureCategory | "")}
        >
          <option value="">全部分类</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <DataTable columns={columns} rows={rows} empty="没有符合条件的功能" rowKey={(f) => f.key} />
    </div>
  );
}
