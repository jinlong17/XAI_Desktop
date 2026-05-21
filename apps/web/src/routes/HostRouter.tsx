import { useMemo } from "react";
import { AppShellPage } from "../pages/AppShellPage";
import { AuthPage } from "../pages/AuthPage";
import { LandingPage } from "../pages/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage";

function normalizePath(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  return pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
}

function resolveHostRoute(pathname: string) {
  const path = normalizePath(pathname);

  if (path === "/") {
    return <LandingPage />;
  }

  if (path.startsWith("/auth")) {
    return <AuthPage />;
  }

  if (path.startsWith("/app")) {
    return <AppShellPage />;
  }

  return <NotFoundPage />;
}

export function HostRouter() {
  const route = useMemo(() => resolveHostRoute(window.location.pathname), []);
  return route;
}
