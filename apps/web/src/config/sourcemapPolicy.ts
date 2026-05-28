export type WebBuildSourcemapPolicy = false | "hidden";

function isTruthy(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

/**
 * Browser-safety default:
 * - regular build artifacts ship without sourcemaps
 * - secure release flow can opt in hidden sourcemaps for Sentry upload only
 */
export function resolveWebBuildSourcemapPolicy(
  envValue = process.env.XAI_WEB_ENABLE_HIDDEN_SOURCEMAP,
): WebBuildSourcemapPolicy {
  return isTruthy(envValue) ? "hidden" : false;
}
