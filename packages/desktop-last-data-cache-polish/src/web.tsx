import {
  WEB_RUNTIME_PROFILE_WEB_LIVE,
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
  type WebRuntimeProfile,
} from "@repo/core";
import { readDesktopBoardCacheStatusFromStorage } from "@repo/plugin-web-board-workspaces/desktop-cache";
import { readDesktopHabitsCacheStatusFromStorage } from "@repo/plugin-web-habits/desktop-cache";
import { readDesktopTaskCacheStatusFromStorage } from "@repo/plugin-web-tasks/desktop-cache";

export type DesktopTrackedCacheSurface =
  | "tasks"
  | "boards"
  | "habits"
  | "pomodoro"
  | "countdown"
  | "ai";

export type DesktopUnreadableCacheSurface = "tasks" | "boards" | "habits";

export interface DesktopLastDataCacheSnapshot {
  runtime: WebRuntimeProfile;
  hasAnyTrackedKey: boolean;
  hasReadableCachedData: boolean;
  readableSurfacesPresent: DesktopTrackedCacheSurface[];
  unreadableSurfaces: DesktopUnreadableCacheSurface[];
  bannerMode: "hidden" | "cached" | "empty" | "unreadable";
}

const TRACKED_KEYS: Readonly<Record<DesktopTrackedCacheSurface, string>> = {
  tasks: "xai_task_cols",
  boards: "xai_boards_v2",
  habits: "xai_habits_state",
  pomodoro: "xai_pomodoro_sessions",
  countdown: "xai_countdowns",
  ai: "xai_ai_convos",
};

export function readDesktopLastDataCacheSnapshot(
  env: Record<string, string | undefined> | undefined = {},
  storage: Pick<Storage, "getItem"> | null | undefined = typeof window === "undefined"
    ? null
    : window.localStorage,
): DesktopLastDataCacheSnapshot {
  const runtime = resolveWebRuntimeProfile(env);
  if (!isDesktopPhase1OfflineRuntime(runtime)) {
    return {
      runtime: WEB_RUNTIME_PROFILE_WEB_LIVE,
      hasAnyTrackedKey: false,
      hasReadableCachedData: false,
      readableSurfacesPresent: [],
      unreadableSurfaces: [],
      bannerMode: "hidden",
    };
  }

  if (!storage) {
    return {
      runtime,
      hasAnyTrackedKey: false,
      hasReadableCachedData: false,
      readableSurfacesPresent: [],
      unreadableSurfaces: [],
      bannerMode: "empty",
    };
  }

  let hasAnyTrackedKey = false;
  const readableSurfacesPresent: DesktopTrackedCacheSurface[] = [];

  for (const [surface, key] of Object.entries(TRACKED_KEYS) as Array<
    [DesktopTrackedCacheSurface, string]
  >) {
    try {
      const raw = storage.getItem(key);
      if (raw !== null) {
        hasAnyTrackedKey = true;
        if (surface === "pomodoro" || surface === "countdown" || surface === "ai") {
          readableSurfacesPresent.push(surface);
        }
      }
    } catch {
      continue;
    }
  }

  const unreadableSurfaces: DesktopUnreadableCacheSurface[] = [];
  const taskStatus = readDesktopTaskCacheStatusFromStorage(storage);
  const boardStatus = readDesktopBoardCacheStatusFromStorage(storage);
  const habitsStatus = readDesktopHabitsCacheStatusFromStorage(storage);

  if (taskStatus === "unreadable") {
    unreadableSurfaces.push("tasks");
  } else if (taskStatus === "readable") {
    readableSurfacesPresent.push("tasks");
  }

  if (boardStatus === "unreadable") {
    unreadableSurfaces.push("boards");
  } else if (boardStatus === "readable") {
    readableSurfacesPresent.push("boards");
  }

  if (habitsStatus === "unreadable") {
    unreadableSurfaces.push("habits");
  } else if (habitsStatus === "readable") {
    readableSurfacesPresent.push("habits");
  }

  const hasReadableCachedData = readableSurfacesPresent.length > 0;
  let bannerMode: DesktopLastDataCacheSnapshot["bannerMode"] = "empty";

  if (unreadableSurfaces.length > 0) {
    bannerMode = "unreadable";
  } else if (hasAnyTrackedKey || hasReadableCachedData) {
    bannerMode = "cached";
  }

  return {
    runtime,
    hasAnyTrackedKey,
    hasReadableCachedData,
    readableSurfacesPresent,
    unreadableSurfaces,
    bannerMode,
  };
}

const BADGE_COPY: Record<
  "en" | "zh",
  Record<Exclude<DesktopLastDataCacheSnapshot["bannerMode"], "hidden">, string>
> = {
  en: {
    cached: "Offline: showing cached local data",
    empty: "Offline: no cached data yet",
    unreadable: "Offline: some cached data could not be read",
  },
  zh: {
    cached: "离线模式：正在显示本地缓存数据",
    empty: "离线模式：尚无本地缓存数据",
    unreadable: "离线模式：部分本地缓存数据无法读取",
  },
};

export function DesktopLastDataCacheBadge({
  lang = "en",
  runtimeEnv = {},
}: {
  lang?: "en" | "zh";
  runtimeEnv?: Record<string, string | undefined>;
}) {
  const snapshot = readDesktopLastDataCacheSnapshot(runtimeEnv);
  if (snapshot.bannerMode === "hidden") {
    return null;
  }

  const unreadableHint =
    snapshot.unreadableSurfaces.length > 0
      ? snapshot.unreadableSurfaces.join(", ")
      : undefined;

  return (
    <span
      className="desktop-last-data-cache-badge"
      data-mode={snapshot.bannerMode}
      data-testid="desktop-last-data-cache-badge"
      title={unreadableHint}
    >
      {BADGE_COPY[lang][snapshot.bannerMode]}
    </span>
  );
}
