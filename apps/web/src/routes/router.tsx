import { Navigate, createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { LandingPage } from "../pages/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage";
// Dev-only smoke route — statically imported but gated by import.meta.env.DEV inside the component
import { TokensSmokePage } from "../pages/TokensSmokePage.js";
import { AppRouteElement, AuthRouteElement } from "./RouteGateElements";
import { RouteErrorBoundary } from "./RouteErrorBoundary";
import { assertUniqueModuleRegistrations, resolveDefaultModulePath } from "./modules/buildModuleRoutes";
import { webModuleRouteRegistrations } from "./modules/registrations";

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
        path: "app",
        element: <Outlet />,
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
