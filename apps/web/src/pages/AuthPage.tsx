import { WebAuthPage } from "@repo/web-auth-device-session/web";

export interface AuthPageProps {
  path: string;
  search: string;
}

export function AuthPage({ path, search }: AuthPageProps) {
  return <WebAuthPage path={path} search={search} />;
}
