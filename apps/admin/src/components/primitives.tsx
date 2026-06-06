/**
 * apps/admin/src/components/primitives.tsx — admin-business presentational primitives.
 *
 * ADR-lite #2: the admin surface reuses the @repo/plugin-web-tokens OKLCH token
 * layer (imported globally in main.tsx). The @repo/ui package's components are
 * Turborepo starter stubs (Button alerts; Card is an external link), so the
 * admin-BUSINESS primitives (Panel/Badge/PlanTag/MiniBar/DataTable) live here,
 * inside the owning surface, per the code-boundary rule "business components →
 * inside the owning surface". They are styled by the admin stylesheet using
 * token CSS vars (CSP-clean: no inline <style>).
 */
import type { ReactNode } from "react";

export function Panel({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}): React.ReactElement {
  return (
    <section className="panel">
      <header className="panel-head">
        <h3>{title}</h3>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export type BadgeTone = "success" | "warning" | "danger" | "info" | "muted";

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }): React.ReactElement {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function PlanTag({ plan }: { plan: string }): React.ReactElement {
  const cls = plan.toLowerCase();
  return <span className={`plan plan--${cls}`}>{plan}</span>;
}

export function MiniBar({ pct, tone = "accent" }: { pct: number; tone?: string }): React.ReactElement {
  return (
    <div className="minibar" role="presentation">
      <i style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} data-tone={tone} />
    </div>
  );
}

export interface Column<T> {
  header: string;
  /** cell renderer */
  cell: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
}

export function DataTable<T>({
  columns,
  rows,
  empty = "没有符合条件的数据",
  onRowClick,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
  onRowClick?: (row: T) => void;
  rowKey: (row: T, i: number) => string;
}): React.ReactElement {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{ textAlign: c.align ?? "left" }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="table-empty" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr
                key={rowKey(row, ri)}
                className={onRowClick ? "row-clickable" : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c, ci) => (
                  <td key={ci} style={{ textAlign: c.align ?? "left" }}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const TONE_BY_STATUS: Record<string, BadgeTone> = {
  活跃: "success",
  待验证: "warning",
  已封禁: "danger",
  休眠: "muted",
  active: "success",
  overage: "warning",
  dunning: "danger",
  已付: "success",
  失败: "danger",
  重试中: "warning",
};

export function statusTone(status: string): BadgeTone {
  return TONE_BY_STATUS[status] ?? "muted";
}
