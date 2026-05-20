import type { ReactNode } from "react";

export function ResponsiveLayout({ children }: { children: ReactNode }) {
  return <div className="responsive-console">{children}</div>;
}
