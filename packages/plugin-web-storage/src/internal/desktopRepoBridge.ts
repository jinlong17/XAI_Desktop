import {
  createTauriRepo,
  NOTES_UNSUPPORTED_ERROR,
  type DesktopBridgeError,
  type DesktopBridgeWriteResult,
  type HabitsStateEntity,
  type PetStateEntity,
  type PomodoroSessionsEntity,
  type ProjectWorkspaceStateEntity,
  type Repo,
  type RepoRecord,
  type SettingsPrefEntity,
  type TasksStateEntity,
} from "@repo/core-data";

type BridgedValue = unknown;

const DESKTOP_REPO_NAMESPACE = "xai-web-desktop-local-first-bridge";

const BOARD_WORKSPACE_KEYS = new Set([
  "xai_boards_v2",
  "xai_active_board",
  "xai_board_panels",
  "xai_board_inbox",
  "xai_board_view_by_id",
]);

const PET_KEYS = new Set(["xai_pet_id", "xai_pet_pos"]);

type BridgedSurface =
  | "tasks"
  | "habits"
  | "pomodoro"
  | "board-workspace"
  | "pet"
  | "settings";

type BridgeRecord =
  | TasksStateEntity
  | HabitsStateEntity
  | PomodoroSessionsEntity
  | ProjectWorkspaceStateEntity
  | PetStateEntity
  | SettingsPrefEntity;

type BridgeStatus = "disabled" | "active";

type TauriInternals = {
  invoke?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
};

type BridgeState = {
  status: BridgeStatus;
  repo: Repo<RepoRecord> | null;
  cache: Map<string, BridgedValue>;
  errors: Map<string, DesktopBridgeError>;
  hydratePromise: Promise<void> | null;
  publish: ((key: string, value: unknown) => void) | null;
};

const state: BridgeState = {
  status: "disabled",
  repo: null,
  cache: new Map<string, BridgedValue>(),
  errors: new Map<string, DesktopBridgeError>(),
  hydratePromise: null,
  publish: null,
};

export function mountDesktopRepoBridge(options: {
  enabled: boolean;
  publish: (key: string, value: unknown) => void;
}): void {
  const { enabled, publish } = options;
  if (!enabled || typeof window === "undefined") {
    resetBridgeState();
    return;
  }

  const tauriInternals = (window as Window & {
    __TAURI_INTERNALS__?: TauriInternals;
  }).__TAURI_INTERNALS__;

  if (!tauriInternals?.invoke) {
    state.status = "active";
    state.repo = null;
    state.cache.clear();
    state.publish = publish;
    state.hydratePromise = null;
    state.errors.set("bridge", {
      kind: "repo_unavailable",
      surface: "pomodoro",
      message: "Desktop repository bridge is unavailable (missing invoke).",
    });
    return;
  }

  state.status = "active";
  state.repo = createTauriRepo<RepoRecord>(tauriInternals.invoke, {
    namespace: DESKTOP_REPO_NAMESPACE,
    schemaVersion: 1,
  });
  state.publish = publish;
  state.errors.clear();
  state.hydratePromise = hydrateCacheFromRepo();
}

export function unmountDesktopRepoBridge(): void {
  resetBridgeState();
}

export function readDesktopRepoValue(key: string): {
  hasValue: boolean;
  value?: unknown;
} {
  if (state.status !== "active") {
    return { hasValue: false };
  }
  if (!isBridgedKey(key)) {
    return { hasValue: false };
  }
  if (!state.cache.has(key)) {
    return { hasValue: false };
  }
  return { hasValue: true, value: state.cache.get(key) };
}

export function readDesktopRepoError(key: string): DesktopBridgeError | null {
  return state.errors.get(key) ?? null;
}

export async function writeDesktopRepoValue(
  key: string,
  value: unknown,
): Promise<DesktopBridgeWriteResult> {
  if (key.startsWith("xai_note_")) {
    state.errors.set(key, NOTES_UNSUPPORTED_ERROR);
    return {
      status: "degraded",
      error: NOTES_UNSUPPORTED_ERROR,
    };
  }
  if (state.status !== "active" || !isBridgedKey(key)) {
    return { status: "ok" };
  }
  if (!state.repo) {
    const error: DesktopBridgeError = {
      kind: "repo_unavailable",
      surface: surfaceForKey(key),
      message: `Desktop repository unavailable for key "${key}".`,
    };
    state.errors.set(key, error);
    return { status: "degraded", error };
  }

  try {
    const existing = await state.repo.get(key);
    const expectedEntityType = entityTypeForKey(key);

    if (
      existing &&
      existing.entityType !== expectedEntityType
    ) {
      const mismatch: DesktopBridgeError = {
        kind: "contract_mismatch",
        surface: surfaceForKey(key),
        message: `Expected "${expectedEntityType}" for "${key}" but got "${existing.entityType}".`,
      };
      state.errors.set(key, mismatch);
      return { status: "degraded", error: mismatch };
    }

    const nowIso = new Date().toISOString();
    const base = {
      id: key,
      schemaVersion: 1,
      createdAt: existing?.createdAt ?? nowIso,
      updatedAt: nowIso,
      syncScope: "device-local" as const,
    };

    const record = toBridgeRecord(key, value, base);
    await state.repo.put(record as RepoRecord);
    state.cache.set(key, value);
    state.publish?.(key, value);
    state.errors.delete(key);
    return { status: "ok" };
  } catch (error) {
    const failed: DesktopBridgeError = {
      kind: "write_failed",
      surface: surfaceForKey(key),
      message: error instanceof Error ? error.message : String(error),
    };
    state.errors.set(key, failed);
    return { status: "degraded", error: failed };
  }
}

async function hydrateCacheFromRepo(): Promise<void> {
  if (!state.repo) {
    return;
  }

  try {
    const rows = await state.repo.list({ syncScope: "device-local" });
    for (const row of rows) {
      const key = row.id;
      if (!isBridgedKey(key)) {
        continue;
      }
      if (row.entityType !== entityTypeForKey(key)) {
        state.errors.set(key, {
          kind: "contract_mismatch",
          surface: surfaceForKey(key),
          message: `Hydration mismatch for "${key}": expected "${entityTypeForKey(key)}", got "${row.entityType}".`,
        });
        continue;
      }
      const decoded = readBridgeRecordValue(row as BridgeRecord);
      state.cache.set(key, decoded);
      state.publish?.(key, decoded);
    }
  } catch (error) {
    state.errors.set("bridge", {
      kind: "repo_unavailable",
      surface: "pomodoro",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function resetBridgeState(): void {
  state.status = "disabled";
  state.repo = null;
  state.cache.clear();
  state.errors.clear();
  state.hydratePromise = null;
  state.publish = null;
}

function isBridgedKey(key: string): boolean {
  return (
    key === "xai_task_cols" ||
    key === "xai_habits_state" ||
    key === "xai_pomodoro_sessions" ||
    BOARD_WORKSPACE_KEYS.has(key) ||
    PET_KEYS.has(key) ||
    /^xai_pref_/.test(key)
  );
}

function entityTypeForKey(key: string): BridgeRecord["entityType"] {
  if (key === "xai_task_cols") return "productivity.tasks_state";
  if (key === "xai_habits_state") return "productivity.habits_state";
  if (key === "xai_pomodoro_sessions") return "productivity.pomodoro_sessions";
  if (BOARD_WORKSPACE_KEYS.has(key)) return "project.workspace_state";
  if (PET_KEYS.has(key)) return "pet.state";
  return "settings.pref";
}

function surfaceForKey(key: string): BridgedSurface {
  if (key === "xai_task_cols") return "tasks";
  if (key === "xai_habits_state") return "habits";
  if (key === "xai_pomodoro_sessions") return "pomodoro";
  if (BOARD_WORKSPACE_KEYS.has(key)) return "board-workspace";
  if (PET_KEYS.has(key)) return "pet";
  return "settings";
}

function toBridgeRecord(
  key: string,
  value: unknown,
  base: {
    id: string;
    schemaVersion: number;
    createdAt: string;
    updatedAt: string;
    syncScope: "device-local";
  },
): BridgeRecord {
  const entityType = entityTypeForKey(key);

  if (entityType === "productivity.tasks_state") {
    return {
      ...base,
      entityType,
      storageKey: "xai_task_cols",
      value,
    };
  }

  if (entityType === "productivity.habits_state") {
    return {
      ...base,
      entityType,
      storageKey: "xai_habits_state",
      value,
    };
  }

  if (entityType === "productivity.pomodoro_sessions") {
    return {
      ...base,
      entityType,
      storageKey: "xai_pomodoro_sessions",
      sessions: Array.isArray(value) ? value : [],
    };
  }

  if (entityType === "project.workspace_state") {
    return {
      ...base,
      entityType: "project.workspace_state",
      storageKey: key as ProjectWorkspaceStateEntity["storageKey"],
      value,
    };
  }

  if (entityType === "pet.state") {
    return {
      ...base,
      entityType: "pet.state",
      storageKey: key as PetStateEntity["storageKey"],
      value,
    };
  }

  return {
    ...base,
    entityType: "settings.pref",
    storageKey: key as SettingsPrefEntity["storageKey"],
    value,
  };
}

function readBridgeRecordValue(record: BridgeRecord): unknown {
  if (record.entityType === "productivity.pomodoro_sessions") {
    return record.sessions;
  }
  return record.value;
}
