import { createBrowserRouter, Outlet } from "react-router";
import { LandingPage } from "../pages/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { AppRouteElement, AuthRouteElement } from "./RouteGateElements";
import { RouteErrorBoundary } from "./RouteErrorBoundary";

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
            path: "*",
            element: <AppRouteElement />,
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
