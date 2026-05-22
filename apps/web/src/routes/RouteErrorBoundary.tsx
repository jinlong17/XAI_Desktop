import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { reportRouteError } from "../observability/reporting";

export interface RouteErrorBoundaryProps {
  scope: "root" | "auth" | "app" | "module";
}

function resolveErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "unknown_route_error";
}

export function RouteErrorBoundary({ scope }: RouteErrorBoundaryProps) {
  const error = useRouteError();
  useEffect(() => {
    reportRouteError(scope, error);
  }, [error, scope]);

  return (
    <main className="host-page">
      <h1>Route Error ({scope})</h1>
      <p>{resolveErrorMessage(error)}</p>
    </main>
  );
}
