import { AuthRouteGate, WebAuthPage } from "@repo/web-auth-device-session";

export interface AuthPageProps {
  path: string;
  search: string;
}

export function AuthPage({ path, search }: AuthPageProps) {
  return (
    <AuthRouteGate fallback={<main className="host-page"><p>Redirecting...</p></main>}>
      <WebAuthPage path={path} search={search} />
    </AuthRouteGate>
  );
}
