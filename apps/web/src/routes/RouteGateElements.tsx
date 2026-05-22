import { AppRouteGate, AuthRouteGate } from "@repo/web-auth-device-session";
import { useLocation, useNavigate } from "react-router";
import { AppShellPage } from "../pages/AppShellPage";
import { AuthPage } from "../pages/AuthPage";

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

  return (
    <AppRouteGate
      path={`${location.pathname}${location.search}`}
      fallback={<main className="host-page"><p>Checking session...</p></main>}
      navigate={(path) => navigate(path, { replace: true })}
    >
      <AppShellPage path={`${location.pathname}${location.search}`} />
    </AppRouteGate>
  );
}
