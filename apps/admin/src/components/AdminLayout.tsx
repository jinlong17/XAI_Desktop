/**
 * apps/admin/src/components/AdminLayout.tsx — admin shell chrome (Phase 4).
 *
 * Sidebar nav rail + topbar (breadcrumb) + active-page outlet. Page switching is
 * local state (no router dependency needed for the structural port; react-router
 * remains available for a later multi-route split). Wraps the page tree in the
 * `AdminUiProvider` so destructive flows reach the type-to-confirm modal + the
 * NO-OP command adapter.
 */
import { useState } from "react";
import { ADMIN_PAGES } from "../pages";
import { AdminUiProvider } from "./AdminUiContext";

export function AdminLayout(): React.ReactElement {
  const [active, setActive] = useState(ADMIN_PAGES[0]!.key);
  const current = ADMIN_PAGES.find((p) => p.key === active) ?? ADMIN_PAGES[0]!;
  const Page = current.Component;

  return (
    <AdminUiProvider>
      <div className="admin-layout">
        <nav className="admin-rail" aria-label="管理导航">
          <div className="rail-brand">XAI Admin</div>
          <ul className="rail-nav">
            {ADMIN_PAGES.map((p) => (
              <li key={p.key}>
                <button
                  type="button"
                  className={`nav-item ${active === p.key ? "active" : ""}`}
                  aria-current={active === p.key ? "page" : undefined}
                  onClick={() => setActive(p.key)}
                >
                  <span className="nav-ic" aria-hidden>
                    {p.icon}
                  </span>
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="admin-main">
          <header className="admin-topbar">
            <span className="crumb">{current.title}</span>
          </header>
          <main className="admin-content" aria-label={current.title}>
            <Page />
          </main>
        </div>
      </div>
    </AdminUiProvider>
  );
}
