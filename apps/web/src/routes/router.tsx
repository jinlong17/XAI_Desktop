import { Navigate, createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { LandingPage } from "../pages/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage";
// Dev-only smoke route — statically imported but gated by import.meta.env.DEV inside the component
import { TokensSmokePage } from "../pages/TokensSmokePage.js";
import { App } from "../App";
import { AppRouteElement, AuthRouteElement } from "./RouteGateElements";
import { RouteErrorBoundary } from "./RouteErrorBoundary";
import { assertUniqueModuleRegistrations, resolveDefaultModulePath } from "./modules/buildModuleRoutes";
import { webModuleRouteRegistrations } from "./modules/shellRegistrations";

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
