import { useEffect, type PropsWithChildren, type ReactElement } from "react";
import { usePref } from "@repo/plugin-web-storage";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import {
  refreshDesktopStatusbarSnapshot,
  subscribeDesktopStatusbarQuickActions,
} from "./runtime";
import type { DesktopStatusbarQuickAction } from "./types";

function navigateWithinSpa(path: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function navigateForAction(action: DesktopStatusbarQuickAction): void {
  if (action === "open-app") {
    navigateWithinSpa("/app");
    return;
  }

  if (action === "start-pomodoro") {
    emitWebEvent("web:shell:module-change", {
      moduleId: "pomodoro",
      source: "programmatic",
    });
    navigateWithinSpa("/app/pomodoro?desktopAction=start-focus");
    return;
  }

  emitWebEvent("web:shell:module-change", {
    moduleId: "tasks",
    source: "programmatic",
  });
  navigateWithinSpa("/app/tasks?smart=today");
}

export function DesktopStatusbarQuickActionsBridge({
  children,
}: PropsWithChildren): ReactElement {
  const [tasksEnabled] = usePref("xai_pref_features_tasks");
  const [pomodoroEnabled] = usePref("xai_pref_features_pomodoro");

  useEffect(() => {
    void refreshDesktopStatusbarSnapshot({
      tasksFeatureEnabled: Boolean(tasksEnabled),
      pomodoroFeatureEnabled: Boolean(pomodoroEnabled),
    });
  }, [pomodoroEnabled, tasksEnabled]);

  useEffect(() => {
    const unsubscribe = subscribeDesktopStatusbarQuickActions((action) => {
      navigateForAction(action);
      void refreshDesktopStatusbarSnapshot({
        tasksFeatureEnabled: Boolean(tasksEnabled),
        pomodoroFeatureEnabled: Boolean(pomodoroEnabled),
      });
    });

    return unsubscribe;
  }, [pomodoroEnabled, tasksEnabled]);

  return <>{children}</>;
}
