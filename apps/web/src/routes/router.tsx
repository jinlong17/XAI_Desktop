import { Navigate, createBrowserRouter, Outlet } from "react-router";
import { LandingPage } from "../pages/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { AppRouteElement, AuthRouteElement } from "./RouteGateElements";
import { RouteErrorBoundary } from "./RouteErrorBoundary";
import { assertUniqueModuleRegistrations, resolveDefaultModulePath } from "./modules/buildModuleRoutes";
import { webModuleRouteRegistrations } from "./modules/registrations";

assertUniqueModuleRegistrations(webModuleRouteRegistrations);
const defaultModulePath = resolveDefaultModulePath(webModuleRouteRegistrations);

export const router = createBrowserRouter([
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
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
