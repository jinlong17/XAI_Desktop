/**
 * Audit log (审计日志) — read-only filtered log table (text + type + range).
 * Reads through `auditAdapter` (../adapters). No inline mock data.
 * (Real append-on-mutation audit is row #5; this is a read-only view.)
 */
import { useMemo, useState } from "react";
import { auditAdapter } from "../adapters";
import type { AuditRow, AuditType } from "../adapters/types";
import { Badge, DataTable, type Column } from "../components/primitives";

const TYPE_LABEL: Record<AuditType, string> = {
  create: "创建",
  config: "配置",
  danger: "高危",
  auth: "认证",
  billing: "计费",
};
const TYPE_TONE: Record<AuditType, "success" | "info" | "danger" | "warning" | "muted"> = {
  create: "success",
  config: "info",
  danger: "danger",
  auth: "warning",
  billing: "muted",
};

export function AuditPage(): React.ReactElement {
  const [text, setText] = useState("");
  const [type, setType] = useState<AuditType | "">("");
  const [range, setRange] = useState<"" | "today" | "7d" | "30d">("");
  const rows = useMemo(() => auditAdapter.query({ text, type, range }), [text, type, range]);

  const cols: Column<AuditRow>[] = [
    { header: "时间", cell: (a) => <span className="mono">{a.time}</span> },
    { header: "操作者", cell: (a) => a.who },
    { header: "动作", cell: (a) => <Badge tone={TYPE_TONE[a.type]}>{a.action}</Badge> },
    { header: "对象", cell: (a) => a.object },
    { header: "IP", cell: (a) => <span className="mono">{a.ip}</span> },
    {
      header: "结果",
      cell: (a) => <Badge tone={a.ok ? "success" : "danger"}>{a.ok ? "成功" : "失败"}</Badge>,
    },
  ];

  return (
    <div className="page page--audit">
      <div className="toolbar">
        <input
          className="search"
          placeholder="搜索操作者 / 动作 / 对象…"
          value={text}
          aria-label="搜索审计日志"
          onChange={(e) => setText(e.target.value)}
        />
        <select className="select" value={type} aria-label="按类型筛选" onChange={(e) => setType(e.target.value as AuditType | "")}>
          <option value="">全部类型</option>
          {(Object.keys(TYPE_LABEL) as AuditType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={range}
          aria-label="按时间范围筛选"
          onChange={(e) => setRange(e.target.value as "" | "today" | "7d" | "30d")}
        >
          <option value="">全部时间</option>
          <option value="today">今天</option>
          <option value="7d">近 7 天</option>
          <option value="30d">近 30 天</option>
        </select>
      </div>
      <DataTable columns={cols} rows={rows} empty="没有符合条件的日志" rowKey={(a, i) => `${a.time}-${i}`} />
    </div>
  );
}
