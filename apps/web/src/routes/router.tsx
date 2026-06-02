import { Navigate, createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { LandingPage } from "../pages/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage";
// Dev-only smoke route — statically imported but gated by import.meta.env.DEV inside the component
import { TokensSmokePage } from "../pages/TokensSmokePage.js";
import { App } from "../App";
import { AppRouteElement, AuthRouteElement, ProtectedAppRouteElement } from "./RouteGateElements";
import { RouteErrorBoundary } from "./RouteErrorBoundary";
import { assertUniqueModuleRegistrations, resolveDefaultModulePath } from "./modules/buildModuleRoutes";
import { webModuleRouteRegistrations } from "./modules/shellRegistrations";
// Extension 2026-05-25 — OAuth callback page (gap-closure row #7)
// Extension 2026-05-26 — Premium Stripe Checkout stub callback pages (gap-closure row #8)
import { CallbackPage, CheckoutSuccessPage, CheckoutCancelPage } from "@repo/plugin-web-settings-rest";

assertUniqueModuleRegistrations(webModuleRouteRegistrations);
const defaultModulePath = resolveDefaultModulePath(webModuleRouteRegistrations);

export const webHostRouteObjects: RouteObject[] = [
  {
    path: "/",
    element: <Outlet />,
    errorElement: <RouteErrorBoundary scope="root" />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "auth",
        element: <Outlet />,
        errorElement: <RouteErrorBoundary scope="auth" />,
        children: [
          {
            path: "*",
            element: <AuthRouteElement />,
          },
        ],
      },
      {
        // P4: <App> is now the layout for all /app/* routes.
        // <App> provides WebShellProvider + Shell with <Outlet/> for module content.
        path: "app",
        element: <App />,
        errorElement: <RouteErrorBoundary scope="app" />,
        children: [
          {
            index: true,
            element: <Navigate to={defaultModulePath} replace />,
          },
          {
            // Literal path MUST come before :moduleId/* to win the match.
            // gap-closure row #7 — Integrations OAuth PKCE callback
            path: "settings/integrations/callback",
            element: <ProtectedAppRouteElement><CallbackPage /></ProtectedAppRouteElement>,
            errorElement: <RouteErrorBoundary scope="oauth-callback" />,
          },
          {
            // Literal path MUST come before :moduleId/* to win the match.
            // gap-closure row #8 — Premium Stripe Checkout success callback
            path: "settings/premium/checkout/success",
            element: <ProtectedAppRouteElement><CheckoutSuccessPage /></ProtectedAppRouteElement>,
            errorElement: <RouteErrorBoundary scope="premium-checkout" />,
          },
          {
            // Literal path MUST come before :moduleId/* to win the match.
            // gap-closure row #8 — Premium Stripe Checkout cancel callback
            path: "settings/premium/checkout/cancel",
            element: <ProtectedAppRouteElement><CheckoutCancelPage /></ProtectedAppRouteElement>,
            errorElement: <RouteErrorBoundary scope="premium-checkout" />,
          },
          {
            path: ":moduleId/*",
            element: <AppRouteElement />,
            errorElement: <RouteErrorBoundary scope="module" />,
          },
        ],
      },
      {
        path: "_smoke/tokens",
        element: <TokensSmokePage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(webHostRouteObjects);
