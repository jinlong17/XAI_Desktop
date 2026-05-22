import { AppRouteGate, AuthRouteGate } from "@repo/web-auth-device-session/web";
import { useLocation, useNavigate, useParams } from "react-router";
import { createWebConsoleCapabilities } from "../host/capabilities";
import { AppShellPage } from "../pages/AppShellPage";
import { AuthPage } from "../pages/AuthPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { resolveModuleRouteMatch } from "./modules/buildModuleRoutes";
import { webModuleRouteRegistrations } from "./modules/registrations";

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

  return (
    <AppRouteGate
      path={`${location.pathname}${location.search}`}
      fallback={<main className="host-page"><p>Checking session...</p></main>}
      navigate={(path) => navigate(path, { replace: true })}
    >
      <AppShellPage
        moduleId={match.moduleId}
        childPath={match.childPath}
        modules={webModuleRouteRegistrations.map((entry) => ({
          moduleId: entry.moduleId,
          label: entry.label,
        }))}
        capabilities={capabilities}
        content={ModuleRouteContent ? (
          <ModuleRouteContent
            moduleId={match.moduleId}
            childPath={match.childPath}
            capabilities={capabilities}
          />
        ) : null}
      />
    </AppRouteGate>
  );
}
