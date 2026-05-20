# Codex Fix Brief — plugin-productivity

> Codex agent — cold start. Read this fully, then read the review file, then execute. **Touch only `packages/plugin-productivity/`.**

## Working context

- **Working dir**: `/tmp/codex-fix-plugin-productivity` (worktree)
- **Branch**: `codex/track-b-fix-productivity` (from `codex/track-b-productivity-console`)
- **Full review**: `docs/reviews/track-b-cross-review/claude-review.md` → "Plugin: plugin-productivity"
- **Parallel sessions**: do not touch other plugins.

## Scope

- `packages/plugin-productivity/src/**`
- `packages/plugin-productivity/docs/dev_log.md`

## DO NOT TOUCH

- Other `packages/plugin-*/`
- `apps/`, `packages/core/`, `packages/core-data/`, `packages/ui/`

## Issues to fix

### P0 — Adapter default-arg loop in TodoStoreProvider AND HabitStoreProvider

**Files**:
- `packages/plugin-productivity/src/hooks/useTodoStore.tsx:90-93`
- `packages/plugin-productivity/src/hooks/useHabitStore.tsx:69-72`

**Pattern** (same as plugin-labels):
Replace destructured-default `adapter = new LocalStorageAdapter<...>(...)` with:
```tsx
export function TodoStoreProvider({ adapter, children }: TodoStoreProviderProps) {
  const [defaultAdapter] = useState(
    () => new LocalStorageAdapter<Todo>(STORAGE_KEY, seedTodos),
  );
  const stableAdapter = adapter ?? defaultAdapter;
  // rest of hooks use stableAdapter
```

Apply identically to `HabitStoreProvider`.

### P1.1 — `PomodoroStoreProvider` has zero persistence

**File**: `packages/plugin-productivity/src/hooks/usePomodoroStore.tsx`

**Issue**: settings, `cyclesCompleted`, `activeTodoId`, `lastCompletedAt` — all in-memory only. Reload wipes them.

**Fix**: add a `DataAdapter<PomodoroState>` and persist on every state change. Pattern:

1. Add to types.ts: nothing new — `PomodoroState` already exists.
2. Wrap state in a single record:
   ```ts
   interface PomodoroRecord extends PomodoroState { id: string }
   // id: "pomodoro-session-current" (single-row table)
   ```
3. Refactor `usePomodoroStore.tsx`:
   ```tsx
   const STORAGE_KEY = "xai.plugin-productivity.pomodoro";
   const SESSION_ID = "pomodoro-session-current";

   const defaultState: PomodoroState = {
     mode: "focus",
     status: "idle",
     activeTodoId: null,
     remainingSeconds: secondsForMode("focus", DEFAULT_SETTINGS),
     cyclesCompleted: 0,
     lastCompletedTodoId: null,
     lastCompletedAt: null,
     settings: DEFAULT_SETTINGS,
   };

   export interface PomodoroStoreProviderProps {
     adapter?: DataAdapter<PomodoroRecord>;
     children: ReactNode;
   }

   export function PomodoroStoreProvider({ adapter, children }: PomodoroStoreProviderProps) {
     const [defaultAdapter] = useState(() => new LocalStorageAdapter<PomodoroRecord>(STORAGE_KEY, []));
     const stableAdapter = adapter ?? defaultAdapter;
     const [state, setState] = useState<PomodoroState>(defaultState);
     const hydratedRef = useRef(false);

     // hydrate once
     useEffect(() => {
       void stableAdapter.getById(SESSION_ID).then((row) => {
         if (row) {
           // ignore "running" status on hydrate; we don't know wall-clock; resume as paused
           const status: PomodoroStatus = row.status === "running" ? "paused" : row.status;
           setState({ ...row, status });
         }
         hydratedRef.current = true;
       });
     }, [stableAdapter]);

     // persist on change (skip the first pre-hydrate state)
     useEffect(() => {
       if (!hydratedRef.current) return;
       void stableAdapter.save({ id: SESSION_ID, ...state });
     }, [stableAdapter, state]);

     // rest of timer effect / start / pause / resume / reset / etc. unchanged
   ```
4. Export `PomodoroStoreProviderProps` from `index.ts` so consumers can inject a different adapter (e.g., for tests).

**Hydration policy for `running` status**: when reloading mid-running, do NOT auto-resume (we don't know wall-clock drift). Set status to `paused`. The user must explicitly resume.

### P1.2 — `Habit` lacks `createdAt`; `Todo` lacks `updatedAt`

**File**: `packages/plugin-productivity/src/types.ts`

**Changes**:
```ts
export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  streak: number;
  history: HabitHistoryEntry[];
  labels: string[];
  createdAt: string;   // ADD
  updatedAt: string;   // ADD
}

export interface Todo {
  // existing fields...
  updatedAt: string;   // ADD
}
```

**Update sites**:
- `useTodoStore.tsx`: in `createTodo` set `updatedAt: createdAt`; in `persist` set `updatedAt: new Date().toISOString()` (for non-create paths it's the natural moment); in `updateTodo`, `incrementPomodoro`, `setStatus`, `moveToQuadrant` — `persist` already runs, so threading updatedAt through persist suffices. Refactor `persist` signature to set `updatedAt` before write.
- `useHabitStore.tsx`: `createHabit` sets `createdAt: now, updatedAt: now`. `persist` stamps `updatedAt: new Date().toISOString()`.
- `seedTodos`, `seedHabits`: backfill `createdAt` (use existing dates) and `updatedAt: createdAt`.

### P1.3 — `calculateStreak` is timezone-flaky

**File**: `packages/plugin-productivity/src/hooks/useHabitStore.tsx:39-48`

**Issue**: uses local-`new Date()` and slice-by-string. Cross-timezone or DST shifts produce incorrect streaks.

**Fix**: pin to UTC for the day boundary:
```tsx
function todayUtcKey(): string {
  return new Date().toISOString().slice(0, 10);
}
function calculateStreak(history: HabitHistoryEntry[]): number {
  const completed = new Set(history.filter((e) => e.count > 0).map((e) => e.date));
  let streak = 0;
  const cursor = new Date(`${todayUtcKey()}T00:00:00Z`);
  while (completed.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
```

Document the UTC choice in a 1-line code comment.

### P1.4 — `EisenhowerMatrix` re-filters every render

**File**: `packages/plugin-productivity/src/components/EisenhowerMatrix.tsx:17-19, 44`

**Issue**: `byQuadrant(todos, q.id)` runs inline on every render of any child.

**Fix**:
```tsx
const todosByQuadrant = useMemo(() => {
  const buckets: Record<TodoQuadrant, Todo[]> = { do: [], schedule: [], delegate: [], eliminate: [] };
  for (const todo of todos) {
    if (todo.status === "archived") continue;
    buckets[todo.quadrant].push(todo);
  }
  return buckets;
}, [todos]);
```
Then `{todosByQuadrant[quadrant.id].map(...)}` in the JSX.

### P2.1 — `PomodoroTimer` `<select>` of all todos

**File**: `packages/plugin-productivity/src/components/PomodoroTimer.tsx:48-60`

**Fix**: filter to `status !== "archived" && status !== "done"`:
```tsx
const selectableTodos = useMemo(
  () => todos.filter((todo) => todo.status === "open" || todo.status === "in-progress"),
  [todos],
);
```
Render the filtered list. Keep "No task" option.

### P2.2 — Document event-emit gaps

`packages/plugin-productivity/docs/dev_log.md` — add Known gaps entry: `Pending: emit productivity:pomodoro-completed / productivity:todo-due / productivity:habit-reminder once @repo/core/events stabilizes.`

### P2.3 — `PomodoroTimer` "mode" label is raw enum string

**File**: `packages/plugin-productivity/src/components/PomodoroTimer.tsx:37`

Renders `<strong>{pomodoro.mode}</strong>` → shows literal `"short-break"`. Add a small lookup:
```tsx
const modeLabel: Record<PomodoroMode, string> = {
  focus: "Focus",
  "short-break": "Short break",
  "long-break": "Long break",
};
// <strong>{modeLabel[pomodoro.mode]}</strong>
```

## Acceptance criteria

1. `pnpm --filter @repo/plugin-productivity check-types` → **PASS**
2. `git diff --stat` confirms only `packages/plugin-productivity/**` modified.
3. Pomodoro state survives a "reload" — open browser DevTools localStorage `xai.plugin-productivity.pomodoro` shows a single row after the user clicks Start.
4. `index.ts` exports continue to include all existing names. New export: `PomodoroStoreProviderProps`. No new transitive deps.

## Commit plan

```
fix(plugin-productivity): stop Todo+Habit adapter default-arg infinite loop
fix(plugin-productivity): persist Pomodoro session to localStorage
fix(plugin-productivity): add createdAt/updatedAt to Habit and Todo
fix(plugin-productivity): pin habit streak calculation to UTC
perf(plugin-productivity): memoize Eisenhower quadrant bucketing
chore(plugin-productivity): humanize Pomodoro mode labels, filter task list, document event-emit gap
```

Use the same Why/What/Scope/Risk/Docs/Tests body template as the plugin-labels brief.

## After commits

Update `docs/dev_log.md`:
- Status: `READY_FOR_VERIFY`
- Suggested Next: `Cross-review verification (claude-review-fix-pass)`
- Work Log entries per commit.

**Do not push.**
