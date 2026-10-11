import * as React from "react";
import { UNSAFE_DataRouterContext, resolvePath, useBlocker, useLocation } from "react-router";
import type { Blocker, DataRouter } from "react-router";

/** Structurally typed feature capability consumed by the Web host. */
export interface DepartureGuard {
  readonly token: object;
  readonly label?: string;
  readonly isBlocking: () => boolean;
  readonly isCurrent: () => boolean;
  readonly exportDraft: () => void;
  readonly discardDraft: () => void;
}

type SignOutDepartureDelegate = {
  readonly requestDeparture: (reason: "sign-out") => Promise<boolean>;
};

export type DepartureCoordinatorRenderProps = {
  readonly registerDepartureGuard: (guard: DepartureGuard) => () => void;
  readonly isDeparturePending: () => boolean;
};

export type DepartureCoordinatorProps = {
  readonly lang: "en" | "zh";
  readonly registerSignOutDelegate: (delegate: SignOutDepartureDelegate) => () => void;
  readonly children: (props: DepartureCoordinatorRenderProps) => React.ReactNode;
};

type RouteIntent = {
  readonly kind: "route";
  readonly guard: DepartureGuard;
  /** The POP blocker this intent settles; null while unbound and for a held programmatic navigation. */
  blocker: Blocker | null;
  proceed: (() => void) | null;
  reset: (() => void) | null;
};

type SignOutIntent = {
  readonly kind: "sign-out";
  readonly guard: DepartureGuard;
  readonly resolve: (allow: boolean) => void;
  readonly promise: Promise<boolean>;
};

type DepartureIntent = RouteIntent | SignOutIntent;

/**
 * Whether `blocker` is the router's live "blocked" blocker. React Router 7
 * hands blocker updates to React inside a transition and replaces the blocker
 * object on every state change, so a render can still hold a "blocked"
 * snapshot that the router has already proceeded, reset or replaced.
 */
function isLiveBlocked(router: DataRouter | null, blocker: Blocker): blocker is Extract<Blocker, { state: "blocked" }> {
  if (router === null || blocker.state !== "blocked") return false;
  for (const live of router.state.blockers.values()) {
    if (live === blocker) return true;
  }
  return false;
}

/**
 * Owns the Web host's single first-intent arbitration for guarded route and
 * sign-out departures. Feature modules only register a guard; router replay,
 * focus handling, and sign-out mutual exclusion remain host responsibilities.
 */
export function DepartureCoordinator({
  lang,
  registerSignOutDelegate,
  children,
}: DepartureCoordinatorProps): React.ReactElement {
  const location = useLocation();
  const dataRouterContext = React.useContext(UNSAFE_DataRouterContext);
  const routerRef = React.useRef<DataRouter | null>(dataRouterContext?.router ?? null);
  const settledBlockersRef = React.useRef(new WeakSet<Blocker>());
  const guardRef = React.useRef<DepartureGuard | null>(null);
  const [guardVersion, setGuardVersion] = React.useState(0);
  const intentRef = React.useRef<DepartureIntent | null>(null);
  const [intentVersion, setIntentVersion] = React.useState(0);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const priorFocusRef = React.useRef<HTMLElement | null>(null);

  const registerDepartureGuard = React.useCallback((guard: DepartureGuard) => {
    guardRef.current = guard;
    setGuardVersion(version => version + 1);
    return () => {
      if (guardRef.current?.token === guard.token) {
        guardRef.current = null;
        setGuardVersion(version => version + 1);
      }
    };
  }, []);
  const canBlock = React.useCallback(() => {
    const guard = guardRef.current;
    return Boolean(guard && guard.isCurrent() && guard.isBlocking());
  }, []);
  const isDeparturePending = React.useCallback(() => intentRef.current !== null, []);
  const reserveRouteIntent = React.useCallback((guard: DepartureGuard): RouteIntent | null => {
    if (intentRef.current) return null;
    const intent: RouteIntent = { kind: "route", guard, blocker: null, proceed: null, reset: null };
    intentRef.current = intent;
    return intent;
  }, []);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (currentLocation.pathname === nextLocation.pathname || !canBlock()) return false;
    const guard = guardRef.current;
    if (guard && !intentRef.current) reserveRouteIntent(guard);
    return true;
  });

  const publishIntent = React.useCallback((next: DepartureIntent | null) => {
    intentRef.current = next;
    setIntentVersion(version => version + 1);
  }, []);
  const finishIntent = React.useCallback((intent: DepartureIntent, allow: boolean) => {
    if (intentRef.current !== intent) return;
    intentRef.current = null;
    setIntentVersion(version => version + 1);
    if (intent.kind === "route") {
      if (allow) intent.proceed?.();
      else intent.reset?.();
    } else {
      intent.resolve(allow);
    }
  }, []);

  // A second same-turn navigate() replaces React Router's blocked transition.
  // Reserve the first programmatic call before the blocker and replay that
  // exact invocation after permission. Browser POP continues through blocker.
  React.useLayoutEffect(() => {
    const router = dataRouterContext?.router;
    if (!router) return;
    const originalNavigate = router.navigate;
    const callOriginal = (to: Parameters<typeof router.navigate>[0], options?: Parameters<typeof router.navigate>[1]) =>
      Reflect.apply(originalNavigate, router, options === undefined ? [to] : [to, options]) as Promise<void>;
    const wrappedNavigate = ((to: Parameters<typeof router.navigate>[0], options?: Parameters<typeof router.navigate>[1]) => {
      const guard = guardRef.current;
      const targetLeavesPane = typeof to === "number"
        || (to !== null && resolvePath(to, location.pathname).pathname !== location.pathname);
      if (!targetLeavesPane || !guard || !guard.isCurrent() || !guard.isBlocking()) {
        return callOriginal(to, options);
      }
      if (intentRef.current) return Promise.resolve();
      const intent = reserveRouteIntent(guard);
      if (!intent) return Promise.resolve();
      intent.proceed = () => { void callOriginal(to, options); };
      intent.reset = () => {};
      setIntentVersion(version => version + 1);
      return Promise.resolve();
    }) as typeof router.navigate;
    router.navigate = wrappedNavigate;
    return () => {
      if (router.navigate === wrappedNavigate) router.navigate = originalNavigate;
    };
  }, [dataRouterContext, location.pathname, reserveRouteIntent]);

  React.useEffect(() => registerSignOutDelegate({
    requestDeparture: () => {
      if (!canBlock()) return Promise.resolve(true);
      const existing = intentRef.current;
      if (existing) return existing.kind === "sign-out" ? existing.promise : Promise.resolve(false);
      const guard = guardRef.current;
      if (!guard || !guard.isCurrent() || !guard.isBlocking()) return Promise.resolve(true);
      let resolve!: (allow: boolean) => void;
      const promise = new Promise<boolean>(next => { resolve = next; });
      publishIntent({ kind: "sign-out", guard, resolve, promise });
      return promise;
    },
  }), [canBlock, publishIntent, registerSignOutDelegate]);
  React.useLayoutEffect(() => {
    routerRef.current = dataRouterContext?.router ?? null;
  }, [dataRouterContext]);
  // Guard registrations render at default priority while blocker updates
  // arrive in a router transition, so this effect can run with a fresh
  // guardVersion and a stale "blocked" snapshot. Bind, publish, proceed or
  // reset a blocker only while it is the router's live blocked blocker, and
  // settle each blocker at most once.
  React.useEffect(() => {
    const router = routerRef.current;
    const settledBlockers = settledBlockersRef.current;
    if (settledBlockers.has(blocker) || !isLiveBlocked(router, blocker)) return;
    const settle = (action: "proceed" | "reset") => () => {
      if (settledBlockers.has(blocker) || !isLiveBlocked(router, blocker)) return;
      settledBlockers.add(blocker);
      if (action === "proceed") blocker.proceed();
      else blocker.reset();
    };
    const proceed = settle("proceed");
    const reset = settle("reset");
    const guard = guardRef.current;
    const existing = intentRef.current;
    if (existing) {
      if (existing.kind === "sign-out") reset();
      else if (!existing.proceed || (existing.blocker && existing.blocker !== blocker)) {
        // Bind a reserved POP intent, or rebind one whose blocker a newer POP replaced.
        existing.blocker = blocker;
        existing.proceed = proceed;
        existing.reset = reset;
        setIntentVersion(version => version + 1);
      }
      return;
    }
    if (!guard || !guard.isCurrent()) {
      reset();
      return;
    }
    if (!guard.isBlocking()) {
      proceed();
      return;
    }
    publishIntent({ kind: "route", guard, blocker, proceed, reset });
  }, [blocker, guardVersion, publishIntent]);
  React.useEffect(() => {
    const intent = intentRef.current;
    if (!intent) return;
    if (!intent.guard.isCurrent()) {
      finishIntent(intent, false);
      return;
    }
    if (!intent.guard.isBlocking()) finishIntent(intent, true);
  }, [finishIntent, guardVersion, intentVersion]);

  const stay = React.useCallback(() => {
    const intent = intentRef.current;
    if (intent) finishIntent(intent, false);
  }, [finishIntent]);
  const exportCurrentDraft = React.useCallback(() => {
    const intent = intentRef.current;
    if (intent?.guard.isCurrent() && intent.guard.isBlocking()) intent.guard.exportDraft();
  }, []);
  const discardAndLeave = React.useCallback(() => {
    const intent = intentRef.current;
    if (!intent || !intent.guard.isCurrent() || !intent.guard.isBlocking()) {
      if (intent) finishIntent(intent, false);
      return;
    }
    intent.guard.discardDraft();
    finishIntent(intent, true);
  }, [finishIntent]);

  const departureLabel = guardRef.current?.label ?? (lang === "zh" ? "智能列表" : "Smart Lists");
  const promptOpen = intentRef.current !== null;
  React.useEffect(() => {
    if (promptOpen) {
      priorFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialogRef.current?.focus();
    } else {
      priorFocusRef.current?.focus();
      priorFocusRef.current = null;
    }
  }, [promptOpen]);
  React.useEffect(() => () => {
    const intent = intentRef.current;
    intentRef.current = null;
    if (intent?.kind === "sign-out") intent.resolve(false);
    else intent?.reset?.();
  }, []);

  const handleDialogKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      stay();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ));
    if (controls.length === 0) {
      event.preventDefault();
      dialogRef.current.focus();
      return;
    }
    const first = controls[0]!;
    const last = controls[controls.length - 1]!;
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [stay]);

  return (
    <>
      {children({ registerDepartureGuard, isDeparturePending })}
      {promptOpen && (
        <div ref={dialogRef} className="settings-departure-dialog" role="dialog" aria-modal="true" aria-label={lang === "zh" ? `未保存的${departureLabel}草稿` : `Unsaved ${departureLabel} draft`} onKeyDown={handleDialogKeyDown} tabIndex={-1}>
          <p>{lang === "zh" ? `${departureLabel}有未保存的更改。` : `${departureLabel} has unsaved changes.`}</p>
          <button type="button" onClick={stay}>{lang === "zh" ? "留下" : "Stay"}</button>
          <button type="button" onClick={exportCurrentDraft}>{lang === "zh" ? "导出当前草稿" : "Export current draft"}</button>
          <button type="button" onClick={discardAndLeave}>{lang === "zh" ? "放弃本地更改并离开" : "Discard local changes and leave"}</button>
        </div>
      )}
    </>
  );
}
