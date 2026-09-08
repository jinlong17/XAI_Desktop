import { AppRouteGate, AuthRouteGate } from "@repo/web-auth-device-session/web";
import type { PropsWithChildren } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { createWebConsoleCapabilities } from "../host/capabilities";
import { AuthPage } from "../pages/AuthPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { resolveModuleRouteMatch } from "./modules/buildModuleRoutes";
import { webModuleRouteRegistrations } from "./modules/shellRegistrations";
// AppShellPage is kept in place for row #21 (settings-shell) to delete later.
// P4: AppRouteElement no longer routes to AppShellPage; module content renders directly.

export function AuthRouteElement() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AuthRouteGate
      fallback={<main className="host-page"><p>Redirecting...</p></main>}
      navigate={(path) => navigate(path, { replace: true })}
    >
      <AuthPage path={location.pathname} search={location.search} />
    </AuthRouteGate>
  );
}

export function AppRouteElement() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const moduleId = params.moduleId ?? "";
  const wildcard = params["*"];
  const match = resolveModuleRouteMatch(webModuleRouteRegistrations, moduleId, wildcard);

  if (!match) {
    return <NotFoundPage />;
  }

  const child = match.registration.children.find((entry) => entry.path === match.childPath)
    ?? match.registration.children.find((entry) => entry.path === "*")
    ?? match.registration.children.find((entry) => entry.path === "");

  const ModuleRouteContent = child?.render;
  const capabilities = createWebConsoleCapabilities({
    navigateTo: (path, replace = false) => navigate(path, { replace }),
    onOpenSearch: (query) => {
      const next = query ? `/app/${match.moduleId}?q=${encodeURIComponent(query)}` : `/app/${match.moduleId}`;
      navigate(next);
    },
  });

  // P4: render module content directly — <Shell> (from <App>) provides the chrome.
  // AppShellPage is kept for row #21 (settings-shell) cleanup; not used here anymore.
  return (
    <AppRouteGate
      path={`${location.pathname}${location.search}`}
      fallback={<main className="host-page"><p>Checking session...</p></main>}
      navigate={(path) => navigate(path, { replace: true })}
    >
      {ModuleRouteContent ? (
        <ModuleRouteContent
          moduleId={match.moduleId}
          childPath={match.childPath}
          capabilities={capabilities}
        />
      ) : null}
    </AppRouteGate>
  );
}

export function ProtectedAppRouteElement({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppRouteGate
      path={`${location.pathname}${location.search}`}
      fallback={<main className="host-page"><p>Checking session...</p></main>}
      navigate={(path) => navigate(path, { replace: true })}
    >
      {children}
    </AppRouteGate>
  );
}
