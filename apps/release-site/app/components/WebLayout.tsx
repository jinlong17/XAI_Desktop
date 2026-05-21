import Link from "next/link";
import type { ReactNode } from "react";
import { ErrorBoundary } from "./error-boundary";

export type WebRoute =
  | "home"
  | "login"
  | "console"
  | "settings"
  | "devices"
  | "data"
  | "docs"
  | "legal";

const navItems: readonly { href: string; label: string; route: WebRoute }[] = [
  { href: "/", label: "Home", route: "home" },
  { href: "/console", label: "Console", route: "console" },
  { href: "/devices", label: "Devices", route: "devices" },
  { href: "/export", label: "Export", route: "data" },
  { href: "/docs", label: "Docs", route: "docs" },
  { href: "/settings", label: "Settings", route: "settings" },
  { href: "/login", label: "Login", route: "login" },
];

export function WebLayout({ active, children }: { active: WebRoute; children: ReactNode }) {
  return (
    <div className="web-shell">
      <aside className="side-nav" aria-label="Primary navigation">
        <strong className="brand">XAI</strong>
        <nav>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={item.route === active ? "active" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-surface">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map((item) => (
          <Link key={item.href} href={item.href} className={item.route === active ? "active" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
