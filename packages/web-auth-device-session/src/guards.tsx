import { useEffect, type PropsWithChildren, type ReactNode } from "react";
import { resolveSafeNextPath } from "./redirects";
import { useWebAuthSession } from "./session";

export interface GuardResolution {
  allow: boolean;
  redirectTo?: string;
  reason?: "auth_required" | "already_authenticated";
}

export function resolveAuthRouteGuard(state: "loading" | "authenticated" | "unauthenticated" | "unconfigured"): GuardResolution {
  if (state === "authenticated") {
    return {
      allow: false,
      redirectTo: "/app",
      reason: "already_authenticated"
    };
  }

  return { allow: true };
}

export function resolveAppRouteGuard(
  state: "loading" | "authenticated" | "unauthenticated" | "unconfigured",
  nextPath: string
): GuardResolution {
  if (state === "authenticated") {
    return { allow: true };
  }

  if (state === "loading") {
    return { allow: false };
  }

  const safeNext = resolveSafeNextPath(nextPath).path;
  return {
    allow: false,
    redirectTo: `/auth/login?next=${encodeURIComponent(safeNext)}`,
    reason: "auth_required"
  };
}

function maybeRedirect(target: string | undefined, navigate?: (path: string) => void): void {
  if (!target) {
    return;
  }

  if (navigate) {
    navigate(target);
    return;
  }

  if (typeof window !== "undefined") {
    window.location.assign(target);
  }
}

export interface AuthRouteGateProps extends PropsWithChildren {
  fallback?: ReactNode;
  navigate?: (path: string) => void;
}

export function AuthRouteGate({ children, fallback = null, navigate }: AuthRouteGateProps) {
  const { state } = useWebAuthSession();
  const guard = resolveAuthRouteGuard(state);

  useEffect(() => {
    maybeRedirect(guard.redirectTo, navigate);
  }, [guard.redirectTo, navigate]);

  if (!guard.allow) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export interface AppRouteGateProps extends PropsWithChildren {
  path?: string;
  fallback?: ReactNode;
  navigate?: (path: string) => void;
}

function resolvePath(path?: string): string {
  if (path) {
    return path;
  }

  if (typeof window !== "undefined") {
    return `${window.location.pathname}${window.location.search}`;
  }

  return "/app";
}

export function AppRouteGate({ children, path, fallback = null, navigate }: AppRouteGateProps) {
  const { state } = useWebAuthSession();
  const guard = resolveAppRouteGuard(state, resolvePath(path));

  useEffect(() => {
    maybeRedirect(guard.redirectTo, navigate);
  }, [guard.redirectTo, navigate]);

  if (!guard.allow) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
