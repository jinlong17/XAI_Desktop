# web-console-host-router — API / Contract Notes

## Runtime Surface

This row owns host/router contracts only. It does not introduce business-domain APIs.

## Upstream Interfaces

| Surface | Assumption |
|---|---|
| `apps/web/src/providers/AppProviders.tsx` | remains the canonical mount point for auth/session/device and later host providers |
| `@repo/web-auth-device-session` | owns `WebAuthSessionProvider`, `AuthRouteGate`, `AppRouteGate`, `WebAuthPage`, and device-bound request/session semantics |
| `packages/plugin-console` | owns shared Console shell and module-slot contracts; this row consumes them |
| `packages/core/src/types/plugin.ts` | remains the shared contract owner for `ConsoleRouteState`, `ConsoleThemeState`, `ConsoleViewProps`, `ConsoleViewCapabilities`, and the new Web module-route registration helpers required by this row |
| `packages/web-encrypted-indexeddb-cache` | later provides route-level cache state without letting route code own IndexedDB schemas |

## Downstream Interfaces

| Consumer | Contract this row must preserve |
|---|---|
| `web-todo-first-slice` | can register or mount under `/app/:moduleId/*` without reopening top-level routing |
| `web-productivity-habits-pomodoro` | can add child module routes and host-capability usage without importing native/Desktop APIs |
| `web-project-label-calendar` | can attach project/label/calendar module children under the same app shell |
| `web-search-keyboard-theme` | can plug search/settings/shortcut behavior into one host-capability surface |
| `web-security-csp-sentry` | can attach error/reporting hooks to stable route families and boundaries |

## Router Contract

Ownership split:

- `apps/web/src/routes/router.tsx`
  - owns the fixed top-level browser route tree for `/`, `/auth/*`, `/app/*`, and not-found
- `apps/web/src/routes/modules/registrations.ts`
  - is the only host-owned composition seam for later module registrations and placeholder fallbacks
- owning packages
  - export browser-safe module registration contracts from `index.ts`
- `@repo/core`
  - owns the shared registration type used between the packages and the host

### Top-level families

- `/`
  - public landing route
- `/auth/*`
  - public auth family
- `/app/*`
  - authenticated app shell family
- `*`
  - not-found route

### App family

- `/app`
  - redirect to default module path
- `/app/:moduleId/*`
  - stable parent route for later module rows
- later module rows add child segments by exporting a `WebModuleRouteRegistration` keyed to their `moduleId`
- the host converts those registrations into child `RouteObject` trees under the fixed parent seam
- route-derived identity that must survive refresh belongs in params/search, not component-only local state

### Module registration contract

Frozen rule:

- the host does not accept ad hoc business route definitions directly inside `apps/web/src/routes/router.tsx`
- later rows extend the module subtree only through the shared registration contract plus the host composition seam
- placeholder fallbacks while dependencies remain mock-first must use the same registration contract rather than a second static host map

Planned shared shape in `@repo/core`:

```ts
type WebModuleRouteRegistration = {
  moduleId: ConsoleModuleId;
  label: string;
  defaultChildPath?: string;
  children: {
    path: string;
    render: ComponentType<{
      moduleId: ConsoleModuleId;
      childPath: string;
      capabilities: ConsoleViewCapabilities;
    }>;
  }[];
};
```

Required semantics:

- `moduleId` must match the Console shell/module identity used by `ConsoleViewRegistration`
- duplicate `moduleId` registrations are a build/test failure
- missing registrations degrade to a host-owned placeholder or not-found module boundary, not an unhandled crash
- the default `/app` redirect resolves from the registration list instead of a separate hard-coded module map

### Guard contract

- `/auth/*` routes wrap `AuthRouteGate`
- `/app/*` routes wrap `AppRouteGate`
- host code must not duplicate auth/session ownership already provided by `@repo/web-auth-device-session`

### Error-boundary contract

Required route-level boundaries:

- root bootstrap boundary
- auth family boundary
- app family boundary
- module child-route boundary

Error ownership rule:

- host boundaries own host/bootstrap/router/capability failures
- module business errors should degrade through module-level boundaries, not collapse the whole app shell

## Host Capability Contract

Browser-rendered modules must receive host actions through shared `ConsoleViewCapabilities` rather than through a parallel Web-only public type.

### Shared capability ownership

- public contract owner: `@repo/core`
- browser implementation owner: `apps/web`
- consuming owner: `plugin-console` shell and later module packages through `ConsoleViewProps.capabilities`

Representative shared extension:

```ts
type ConsoleCapabilityStatus = "supported" | "unsupported" | "blocked";

type ConsoleCapabilityErrorCode =
  | "unsupported_in_browser"
  | "permission_denied"
  | "not_configured"
  | "build_blocked";

type ConsoleCapabilityResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: ConsoleCapabilityErrorCode; message: string };

type ConsoleShortcutBinding = {
  id: string;
  combo: string;
  scope: "route" | "app";
};

type ConsoleDownloadRequest = {
  filename: string;
  mimeType?: string;
  blob: Blob;
};

type ConsoleNotificationRequest = {
  title: string;
  body?: string;
  tag?: string;
};

type ConsoleViewCapabilities = {
  navigate(route: ConsoleRouteState): void;
  openSettings(section?: string): void;
  openCommandPalette(query?: string): void;
  focusPane(pane: "sidebar" | "list" | "detail"): void;
  persistState(partial: Partial<ConsoleRouteState>): Promise<void>;
  requestReconcile(reason?: string): Promise<void>;
  download(request: ConsoleDownloadRequest): Promise<ConsoleCapabilityResult<void>>;
  notify(request: ConsoleNotificationRequest): Promise<ConsoleCapabilityResult<void>>;
  registerShortcut(
    binding: ConsoleShortcutBinding,
    handler: () => void
  ): ConsoleCapabilityResult<() => void>;
  beginDrag(payload: unknown): Promise<ConsoleCapabilityResult<void>>;
  invokeNativeCapability(name: string, payload?: unknown): Promise<ConsoleCapabilityResult<void>>;
  status(capability: string): ConsoleCapabilityStatus;
};
```

### Required capability families

- `download`
  - supported in browser through host-owned implementation
- `notification`
  - may degrade when permission is missing
- `shortcut`
  - browser-safe subset only
- `beginDrag`
  - browser-safe subset only; Finder/Desktop-native drag flows remain unsupported
- settings navigation
  - uses the existing shared `navigate(...)` contract into a settings route/module path
- search / command palette
  - uses the existing shared `openCommandPalette(...)` entry rather than a second Web-only API

### Unsupported-native contract

These capabilities are never directly available to Web-rendered modules:

- Tauri window/frame/tray/menu-bar actions
- overlay/desktop-surface actions
- native file-system drag/drop integration beyond browser-safe subset
- macOS-only capability toggles

Required rule:

- unsupported actions must return a typed unsupported result or remain unreachable from the browser bundle because they are not part of `ConsoleViewCapabilities`
- silent no-op fallback is not allowed

Implementation note:

- browser host uses `apps/web/src/host/capabilities.ts#createWebConsoleCapabilities(...)` as the injection seam, and placeholder module routes consume the same shared capability object passed through `WebModuleRouteRegistration.children[].render` props.

## Browser-Safety / Build Guard Contract

- `apps/web` and browser-shared packages must not import `@tauri-apps/*`.
- browser-route files may only enter package code through public `index.ts` exports participating in the shared module registration contract.
- if a capability cannot be implemented in-browser, the module must consume the shared capability seam and handle `ConsoleCapabilityResult.ok === false`.
- the browser-safety guard lives at the `apps/web` host boundary and applies transitively to files imported through module route registrations.
- later build work may choose lint, dedicated import-scan, or both, but the guard ownership/location is frozen in this row.

## Idempotency And Navigation Notes

- repeated visits to `/app` must deterministically redirect to the same default module path
- repeated calls to settings/search navigation through `navigate(...)` / `openCommandPalette(...)` should converge on one visible target route or shell state
- re-registering the same route-scope shortcut must be safe to replace or unsubscribe
- refreshing a valid module deep link must preserve the same route-derived module identity

## Error Semantics

| Error | Meaning | Required reaction |
|---|---|---|
| `auth_required` | unauthenticated access to `/app/*` | redirect through `AppRouteGate` semantics |
| `already_authenticated` | authenticated access to auth-only route | redirect through `AuthRouteGate` semantics |
| `unsupported_in_browser` | capability exists only on Desktop/native | show explicit degrade UI or disable the action |
| `permission_denied` | browser permission gate rejected a supported capability | show recoverable degrade UI |
| `build_blocked` | a forbidden native import or browser-unsafe path is detected | fail build or lint gate rather than shipping silent runtime drift |
| `route_not_found` | unmatched path or missing module child route | render not-found or module fallback boundary |
