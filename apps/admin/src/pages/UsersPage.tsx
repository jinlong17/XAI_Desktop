/**
 * Users (用户管理) — dense table with saved views, filter chips, search, a user
 * detail drawer, and the destructive ban / bulk-ban flows (type-to-confirm,
 * wired through AdminUiContext commands).
 * Reads table rows through `usersReadSeam`; sync UI config stays on
 * `usersAdapter` (../adapters). No inline mock data.
 */
import { useEffect, useState } from "react";
import { usersAdapter, usersReadSeam } from "../adapters";
import type { UserRow } from "../adapters/types";
import { useAdminUi } from "../components/AdminUiContext";
import {
  Badge,
  DataTable,
  MiniBar,
  PlanTag,
  statusTone,
  type Column,
} from "../components/primitives";

export function UsersPage(): React.ReactElement {
  const { requestConfirm, toast, commands } = useAdminUi();
  const views = usersAdapter.savedViews();
  const chips = usersAdapter.filterChips();
  const [view, setView] = useState("all");
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<UserRow | null>(null);
  const [rows, setRows] = useState<UserRow[]>([]);

  useEffect(() => {
    let alive = true;
    usersReadSeam.list({ view, chips: activeChips, text }).then((res) => {
      if (!alive) return;
      setRows(res.ok ? res.data : []);
    });
    return () => {
      alive = false;
    };
  }, [view, activeChips, text]);

  function toggleChip(key: string): void {
    setActiveChips((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  }

  function toggleSelect(email: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  function banUser(u: UserRow): void {
    requestConfirm({
      title: `封禁该用户？`,
      body: `用户 ${u.name} 将立即失去访问权限,可随时恢复。此操作会被审计记录。`,
      tone: "danger",
      confirmLabel: "封禁",
      onConfirm: async () => {
        await commands.banUser({ email: u.email });
        setDetail(null);
        toast(`已封禁 ${u.name}`);
      },
    });
  }

  function bulkBan(): void {
    const emails = [...selected];
    requestConfirm({
      title: `批量封禁 ${emails.length} 个用户？`,
      body: "这些用户将立即失去访问权限。批量高危操作需输入确认词。",
      tone: "danger",
      requireType: "BAN",
      confirmLabel: "全部封禁",
      onConfirm: async () => {
        await commands.bulkBan({ emails });
        setSelected(new Set());
        toast(`已批量封禁 ${emails.length} 个用户`);
      },
    });
  }

  const columns: Column<UserRow>[] = [
    {
      header: "",
      cell: (u) => (
        <input
          type="checkbox"
          aria-label={`select ${u.name}`}
          checked={selected.has(u.email)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleSelect(u.email)}
        />
      ),
    },
    {
      header: "用户",
      cell: (u) => (
        <div className="u">
          <div className="av" style={{ background: u.color }}>
            {initials(u.name)}
          </div>
          <div>
            <div className="nm">{u.name}</div>
            <div className="em">{u.email}</div>
          </div>
        </div>
      ),
    },
    { header: "状态", cell: (u) => <Badge tone={statusTone(u.status)}>{u.status}</Badge> },
    { header: "套餐", cell: (u) => <PlanTag plan={u.plan} /> },
    {
      header: "用量",
      cell: (u) => (
        <div className="usage">
          {fmtM(u.usageM)} tokens {u.over ? <Badge tone="warning">超额</Badge> : null}
          <MiniBar pct={(u.usageM / 5) * 100} />
        </div>
      ),
    },
    {
      header: "成本",
      align: "right",
      cell: (u) => <span className={u.cost >= 100 ? "cost-high" : undefined}>${u.cost}</span>,
    },
    { header: "最后活跃", cell: (u) => <span className="muted">{u.lastActive}</span> },
  ];

  return (
    <div className="page page--users">
      <div className="toolbar">
        <input
          className="search"
          placeholder="搜索用户名 / 邮箱…"
          value={text}
          aria-label="搜索用户"
          onChange={(e) => setText(e.target.value)}
        />
        <div className="view-tabs">
          {views.map((v) => (
            <button
              key={v.key}
              type="button"
              className={`view-tab ${view === v.key ? "on" : ""}`}
              onClick={() => setView(v.key)}
            >
              {v.label} <span className="vc">{usersAdapter.list({ view: v.key }).length}</span>
            </button>
          ))}
        </div>
        <div className="chips">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`fchip ${activeChips.includes(c.key) ? "on" : ""}`}
              onClick={() => toggleChip(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 ? (
        <div className="bulkbar">
          <span>已选 {selected.size} 个</span>
          <button type="button" className="btn btn--danger" onClick={bulkBan}>
            批量封禁
          </button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        empty="没有符合条件的用户"
        onRowClick={(u) => setDetail(u)}
        rowKey={(u) => u.email}
      />

      {detail ? (
        <div className="drawer-scrim" role="presentation" onClick={() => setDetail(null)}>
          <aside className="drawer" role="dialog" aria-label="用户详情" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="drawer-close" aria-label="关闭" onClick={() => setDetail(null)}>
              ×
            </button>
            <div className="drawer-head">
              <div className="av av--lg" style={{ background: detail.color }}>
                {initials(detail.name)}
              </div>
              <div>
                <h2>{detail.name}</h2>
                <div className="muted">{detail.email}</div>
                <div className="drawer-meta">
                  <Badge tone={statusTone(detail.status)}>{detail.status}</Badge>
                  <PlanTag plan={detail.plan} />
                  <span className="muted">角色 {detail.role}</span>
                </div>
              </div>
            </div>
            <dl className="kv">
              <div>
                <dt>本月用量</dt>
                <dd>{fmtM(detail.usageM)} tokens</dd>
              </div>
              <div>
                <dt>本月成本</dt>
                <dd>${detail.cost}</dd>
              </div>
              <div>
                <dt>两步验证</dt>
                <dd>{detail.mfa ? "已开启" : "未开启"}</dd>
              </div>
              <div>
                <dt>最后活跃</dt>
                <dd>{detail.lastActive}</dd>
              </div>
            </dl>
            <div className="drawer-actions">
              <button type="button" className="btn">
                模拟登录
              </button>
              <button type="button" className="btn">
                重置密码
              </button>
              <button type="button" className="btn btn--danger" onClick={() => banUser(detail)}>
                封禁
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0]![0]! + parts[1]![0]! : name.slice(0, 2)).toUpperCase();
}

function fmtM(u: number): string {
  return u >= 1 ? `${u.toFixed(2)}M` : `${(u * 1000).toFixed(0)}K`;
}
