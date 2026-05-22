import type { ConsoleModuleId, WebModuleRouteRegistration } from "@repo/core/types";

export interface ModuleRouteMatch {
  moduleId: ConsoleModuleId;
  childPath: string;
  registration: WebModuleRouteRegistration;
}

function normalizeSegment(value: string | undefined): string {
  if (!value) {
    return "";
  }

  return value
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join("/");
}

function matchesDynamicPattern(pattern: string, value: string): boolean {
  const normalizedPattern = normalizeSegment(pattern);
  const normalizedValue = normalizeSegment(value);
  const patternSegments = normalizedPattern ? normalizedPattern.split("/") : [];
  const valueSegments = normalizedValue ? normalizedValue.split("/") : [];

  if (patternSegments.length !== valueSegments.length) {
    return false;
  }

  return patternSegments.every((segment, index) => segment.startsWith(":") || segment === valueSegments[index]);
}

export function assertUniqueModuleRegistrations(registrations: WebModuleRouteRegistration[]): void {
  const seen = new Set<string>();

  for (const registration of registrations) {
    if (seen.has(registration.moduleId)) {
      throw new Error(`duplicate_module_registration:${registration.moduleId}`);
    }
    seen.add(registration.moduleId);
  }
}

export function resolveDefaultModulePath(registrations: WebModuleRouteRegistration[]): string {
  const first = registrations[0];

  if (!first) {
    return "/app";
  }

  const suffix = normalizeSegment(first.defaultChildPath);
  return suffix ? `/app/${first.moduleId}/${suffix}` : `/app/${first.moduleId}`;
}

export function resolveModuleRouteMatch(
  registrations: WebModuleRouteRegistration[],
  moduleId: string,
  wildcardPath: string | undefined
): ModuleRouteMatch | null {
  const registration = registrations.find((entry) => entry.moduleId === moduleId);

  if (!registration) {
    return null;
  }

  const childPath = normalizeSegment(wildcardPath);
  const hasExact = registration.children.some((child) => {
    const pattern = normalizeSegment(child.path);
    return pattern === childPath || matchesDynamicPattern(pattern, childPath);
  });
  const hasWildcard = registration.children.some((child) => child.path === "*");
  const hasIndex = registration.children.some((child) => normalizeSegment(child.path) === "");

  if (!hasExact && !(hasWildcard || (childPath === "" && hasIndex))) {
    return null;
  }

  return {
    moduleId: registration.moduleId,
    childPath,
    registration,
  };
}
