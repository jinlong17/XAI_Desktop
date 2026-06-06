/**
 * Roles & permissions (角色与权限 RBAC) — role cards + a permission × role matrix.
 * Reads through `rolesAdapter` (../adapters). No inline mock data.
 * (Real RBAC enforcement is row #2; this is a read-only display this slice.)
 */
import { rolesAdapter } from "../adapters";

export function RolesPage(): React.ReactElement {
  const roles = rolesAdapter.roles();
  const matrix = rolesAdapter.rbacMatrix();

  return (
    <div className="page page--roles">
      <div className="role-cards">
        {roles.map((r) => (
          <div className="role-card" key={r.key}>
            <div className="role-ic" style={{ background: r.color }}>
              {r.icon}
            </div>
            <h4>{r.name}</h4>
            <div className="role-mc">{r.members} 名成员</div>
            <div className="role-ds">{r.description}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>权限点</th>
              {roles.map((r) => (
                <th key={r.key} style={{ textAlign: "center" }}>
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.permission}>
                <td className="perm-name">{row.permission}</td>
                {roles.map((r) => (
                  <td key={r.key} style={{ textAlign: "center" }}>
                    <span className={`check ${row.grants[r.key] ? "on" : ""}`}>
                      {row.grants[r.key] ? "✓" : ""}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
