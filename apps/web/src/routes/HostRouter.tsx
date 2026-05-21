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

function resolveHostRoute(pathname: string, search: string) {
  const path = normalizePath(pathname);

  if (path === "/") {
    return <LandingPage />;
  }

  if (path.startsWith("/auth")) {
    return <AuthPage path={path} search={search} />;
  }

  if (path.startsWith("/app")) {
    return <AppShellPage path={`${path}${search}`} />;
  }

  return <NotFoundPage />;
}

export function HostRouter() {
  const route = useMemo(
    () => resolveHostRoute(window.location.pathname, window.location.search),
    []
  );
  return route;
}
