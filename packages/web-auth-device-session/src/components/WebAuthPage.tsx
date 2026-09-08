import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  completePasswordReset,
  requestPasswordReset,
  signInWithEmail,
  signUpWithEmail,
  startOAuthLogin
} from "../auth-actions";
import { AuthCallbackError, handleAuthCallback } from "../callback";
import { resolveSafeNextPath } from "../redirects";
import { useWebAuthSession } from "../session";

type AuthCompletionRoute = "oauth-callback" | "email-verify" | null;

export function resolveAuthCompletionRoute(path: string): AuthCompletionRoute {
  if (path === "/auth/callback") {
    return "oauth-callback";
  }

  if (path === "/auth/verify") {
    return "email-verify";
  }

  return null;
}

function getRoutePath(path?: string): string {
  if (path) {
    return path;
  }

  if (typeof window !== "undefined") {
    return window.location.pathname;
  }

  return "/auth/login";
}

function getSearch(search?: string): string {
  if (search !== undefined) {
    return search;
  }

  if (typeof window !== "undefined") {
    return window.location.search;
  }

  return "";
}

function navigateTo(path: string): void {
  if (typeof window !== "undefined") {
    window.location.assign(path);
  }
}

export interface WebAuthPageProps {
  path?: string;
  search?: string;
}

export function WebAuthPage({ path, search }: WebAuthPageProps) {
  const { client, setSession } = useWebAuthSession();
  const [mode, setMode] = useState<"login" | "signup" | "reset" | "reset-complete">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPath = getRoutePath(path);
  const searchParams = useMemo(() => new URLSearchParams(getSearch(search)), [search]);
  const safeNext = resolveSafeNextPath(searchParams.get("next")).path;
  const completionRoute = resolveAuthCompletionRoute(currentPath);

  useEffect(() => {
    if (!client || !completionRoute) {
      return;
    }

    let active = true;
    const requirePkceState = completionRoute === "oauth-callback";
    void handleAuthCallback(client, undefined, { requirePkceState })
      .then(({ session, nextPath }) => {
        if (!active) {
          return;
        }

        setSession(session);
        navigateTo(nextPath);
      })
      .catch((callbackError: unknown) => {
        if (!active) {
          return;
        }

        if (callbackError instanceof AuthCallbackError) {
          setError(callbackError.code);
          return;
        }

        setError("pkce_exchange_failed");
      });

    return () => {
      active = false;
    };
  }, [client, completionRoute, setSession]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) {
      setError("auth_unconfigured");
      return;
    }

    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        await signInWithEmail(client, email, password);
        navigateTo(safeNext);
        return;
      }

      if (mode === "signup") {
        await signUpWithEmail(client, email, password, safeNext);
        setMessage("signup_verification_sent");
        return;
      }

      if (mode === "reset") {
        await requestPasswordReset(client, email, safeNext);
        setMessage("password_reset_email_sent");
        return;
      }

      await completePasswordReset(client, password);
      setMessage("password_reset_complete");
      navigateTo("/auth/login");
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "auth_unknown_error");
    }
  }

  async function onOAuth(provider: "google" | "apple") {
    if (!client) {
      setError("auth_unconfigured");
      return;
    }

    setError(null);
    try {
      await startOAuthLogin(client, provider, safeNext);
    } catch (oauthError: unknown) {
      setError(oauthError instanceof Error ? oauthError.message : "oauth_start_failed");
    }
  }

  return (
    <main className="host-page">
      <h1>Authentication</h1>
      <p>Route: {currentPath}</p>
      <form onSubmit={onSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === "reset-complete" ? "new-password" : "current-password"}
        />
        <button type="submit">
          {mode === "signup"
            ? "Sign up"
            : mode === "reset"
              ? "Send reset"
              : mode === "reset-complete"
                ? "Set password"
                : "Sign in"}
        </button>
      </form>
      <div className="auth-actions">
        <button type="button" onClick={() => setMode("login")}>Login</button>
        <button type="button" onClick={() => setMode("signup")}>Signup</button>
        <button type="button" onClick={() => setMode("reset")}>Reset</button>
        <button type="button" onClick={() => setMode("reset-complete")}>Complete reset</button>
      </div>
      <div className="auth-actions">
        <button type="button" onClick={() => onOAuth("google")}>Continue with Google</button>
        <button type="button" onClick={() => onOAuth("apple")}>Continue with Apple</button>
      </div>
      {message ? <p>{message}</p> : null}
      {error ? <p>{error}</p> : null}
    </main>
  );
}
