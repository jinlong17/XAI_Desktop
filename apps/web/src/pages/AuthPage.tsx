import { WebAuthPage } from "@repo/web-auth-device-session";

export interface AuthPageProps {
  path: string;
  search: string;
}

export function AuthPage({ path, search }: AuthPageProps) {
  return <WebAuthPage path={path} search={search} />;
}
