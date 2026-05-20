# Codex Fix Brief — plugin-console

> You are a Codex agent. You have **no memory of any prior conversation**. Read this brief fully, then read the referenced review file, then execute. **Touch only files under `packages/plugin-console/`.**

## Working context

- **Working dir**: `/tmp/codex-fix-plugin-console` (git worktree)
- **Branch**: `codex/track-b-fix-console` (from `codex/track-b-productivity-console`)
- **Full review**: `docs/reviews/track-b-cross-review/claude-review.md` → "Plugin: plugin-console" section
- **Parallel sessions**: other Codex sessions touch `plugin-{labels,productivity,clipboard,project}` in their own worktrees — do not modify those here.

## Scope — files you may modify

- `packages/plugin-console/src/**`
- `packages/plugin-console/docs/dev_log.md`

## DO NOT TOUCH

- Other `packages/plugin-*/`
- `apps/`, `packages/core/`, `packages/core-data/`, `packages/ui/`
- `docs/contracts/`, `docs/SYSTEM_*`, `docs/PLUGIN_MAP.md`

## Issues to fix

### P0 — `NotificationStoreProvider` adapter default-arg infinite render loop

**File**: `packages/plugin-console/src/hooks/useNotificationStore.tsx:67-70`

**Pattern to replace**:
```tsx
export function NotificationStoreProvider({
  adapter = new LocalStorageAdapter<ConsoleNotification>(STORAGE_KEY, seedNotifications),
  children,
}: NotificationStoreProviderProps) {
```

**Required fix**: use a `useState` lazy initializer for the default and rename internal references to a stable variable:
```tsx
export function NotificationStoreProvider({
  adapter,
  children,
}: NotificationStoreProviderProps) {
  const [defaultAdapter] = useState(
    () => new LocalStorageAdapter<ConsoleNotification>(STORAGE_KEY, seedNotifications),
  );
  const stableAdapter = adapter ?? defaultAdapter;
  // refresh / persist / markRead etc. all use stableAdapter, with [stableAdapter] in useCallback deps
```

### P1.1 — `ConsoleDesktopBridge` module-singleton conflicts with red line #2/#3

**File**: `packages/plugin-console/src/bridge/ConsoleDesktopBridge.ts:46`

**Issue**: `export const consoleDesktopBridge = new ConsoleDesktopBridge()` exposes a module-level singleton. If `plugin-organizer` (Track A) imports it directly to push grid events, that violates red line #2 (cross-plugin direct import) and #3 (Plugin-to-plugin must go through `@repo/core/events`).

**Fix (scaffold-stage minimum)**:
1. **Remove** `export const consoleDesktopBridge = ...` line entirely.
2. **Remove** `consoleDesktopBridge` from `index.ts` exports.
3. Keep the `ConsoleDesktopBridge` **class** exported (it's a valid type/constructor that the Host can instantiate per-Console).
4. Keep `gridItemToTask` and `ConsoleDesktopEventHandler` type exports.
5. In `packages/plugin-console/docs/dev_log.md`, add a "Known gaps" note: `Bridge instantiation should be owned by Host via @repo/core/events when contract stabilizes.`

After the fix, `index.ts` should still export:
- `ConsoleDesktopBridge` (the class)
- `gridItemToTask` (the helper)
- `ConsoleDesktopEventHandler` (the type)

…but NOT `consoleDesktopBridge` (the singleton).

### P1.2 — `ConsoleSearch` and `CommandPalette` duplicate state

**Files**: `src/components/ConsoleSearch.tsx`, `src/components/CommandPalette.tsx`, `src/components/ConsoleLayout.tsx`

**Issue**: `ConsoleLayout` mounts both, each with independent query state and different result scoring. Pick one as canonical.

**Decision for this fix**: Keep `ConsoleSearch` as a thin inline header that **opens the full `CommandPalette`** on focus. Replace its inline result rendering with an `onFocus` handler that calls a callback to open the palette. Drop the standalone search dropdown.

**Minimal change** in `ConsoleSearch.tsx`:
```tsx
export interface ConsoleSearchProps {
  onOpenPalette?: () => void;
  placeholder?: string;
}

export function ConsoleSearch({ onOpenPalette, placeholder = "Search… (⌘K)" }: ConsoleSearchProps) {
  return (
    <button
      aria-label="Open command palette"
      onClick={() => onOpenPalette?.()}
      style={{ /* same styling as input but a button */ }}
      type="button"
    >
      <span style={{ color: "#9ca3af" }}>{placeholder}</span>
    </button>
  );
}
```

In `ConsoleLayout.tsx`, wire the new prop:
```tsx
const paletteRef = useRef<CommandPaletteController | null>(null);
// ...
<ConsoleSearch onOpenPalette={() => paletteRef.current?.open()} />
// ... and pass paletteRef into <CommandPalette ref={paletteRef} />
```

…or simpler: lift `useCommandPalette()` to `ConsoleLayout`, pass `palette.open` to `ConsoleSearch`, and pass `palette` to `CommandPalette` as a `controller` prop. Choose whichever requires less new API surface.

**Backward compat**: the `ConsoleSearch` `entities` and `onOpen` props are removed. Update `index.ts` type export accordingly.

### P1.3 — `useCommandPalette` `defaultEntities` hardcoded; wire to `PluginSlotRegistry`

**File**: `packages/plugin-console/src/hooks/useCommandPalette.ts:4-10, 45-71`

**Issue**: `defaultEntities` is a static module-level constant. Real Cmd+K must aggregate from `PluginSlotRegistry.getSearchEntities()`.

**Fix**: add an optional `registry?: PluginSlotRegistry` option to `UseCommandPaletteOptions`. When provided, fetch via `registry.getSearchEntities()` (async — useEffect + state). Fall back to the static `defaultEntities` when registry is absent. Pseudocode:

```tsx
export interface UseCommandPaletteOptions {
  entities?: SearchableEntity[];
  registry?: PluginSlotRegistry;
  onExecute?: ...;
}

export function useCommandPalette({ entities, registry, onExecute }: UseCommandPaletteOptions = {}) {
  const [registered, setRegistered] = useState<SearchableEntity[]>([]);
  useEffect(() => {
    if (!registry) return;
    let cancelled = false;
    void registry.getSearchEntities().then((next) => {
      if (!cancelled) setRegistered(next);
    });
    return () => { cancelled = true; };
  }, [registry]);

  const effectiveEntities = entities ?? (registry ? registered : defaultEntities);
  // rest unchanged
}
```

### P2.1 — Remove `ConsoleSlotRegistry` module-level singleton from public surface

**File**: `packages/plugin-console/src/registry/PluginSlotRegistry.ts:29`

Singleton is fine for a single-Console app, but exposes shared mutable state if Console renders in two windows. **Remove** `export const ConsoleSlotRegistry = new PluginSlotRegistry()` and its export from `index.ts`. Keep the class export. Callers create their own instance per window.

### P2.2 — Memoize `setQuery` in `useCommandPalette`

**File**: `packages/plugin-console/src/hooks/useCommandPalette.ts:92-95`

The returned object's `setQuery` is created fresh per call to the hook. Wrap in `useCallback`:
```tsx
const setQueryStable = useCallback((nextQuery: string) => {
  setQuery(nextQuery);
  setActiveIndex(0);
}, []);
```

Use `setQueryStable` in the returned object.

### P2.3 — Memoize `open` / `toggle` similarly

Same file. Wrap `open` and `toggle` in `useCallback`.

### P2.4 — Document `console:*` event emission gap

In `packages/plugin-console/docs/dev_log.md`, add a "Known gaps" note: `Pending: emit console:nav-opened / console:command-executed / console:notification-read once @repo/core/events stabilizes.`

## Acceptance criteria

1. `pnpm --filter @repo/plugin-console check-types` → **PASS**
2. `git diff --stat` confirms only `packages/plugin-console/**` modified.
3. Public API: `index.ts` exports the **set** changes documented above (lose `consoleDesktopBridge` const, lose `ConsoleSlotRegistry` const, lose `ConsoleSearchProps.entities` / `onOpen`). Document the diff in the commit body.
4. `apps/desktop/src/main.tsx` (not in scope to read here) does not import `consoleDesktopBridge` or `ConsoleSlotRegistry` today — if you find it does, STOP and update `dev_log.md` Status to `BLOCKED` and explain.

## Commit plan

One commit per group:

```
fix(plugin-console): stop NotificationStoreProvider adapter default-arg loop

(same template as plugin-labels P0)
```

```
refactor(plugin-console): remove ConsoleDesktopBridge / ConsoleSlotRegistry singletons

Why: module-level singletons violate red line #2 if cross-plugin imported.
What: keep classes as exported types; remove default const instances; require
callers to instantiate per Console.
Scope: src/bridge/ConsoleDesktopBridge.ts, src/registry/PluginSlotRegistry.ts,
       src/index.ts
Risk: breaking — any caller previously importing consoleDesktopBridge or
ConsoleSlotRegistry must instantiate. No current caller does (verified).
Docs: dev_log.md Known gaps
Tests: pnpm --filter @repo/plugin-console check-types
```

```
refactor(plugin-console): unify search through CommandPalette

Why: ConsoleSearch and CommandPalette had duplicate query/results state.
What: ConsoleSearch becomes a trigger button that opens CommandPalette;
useCommandPalette accepts a PluginSlotRegistry to aggregate cross-plugin
entities; static defaultEntities kept as fallback for storybook/tests.
Scope: src/components/ConsoleSearch.tsx, src/components/ConsoleLayout.tsx,
       src/hooks/useCommandPalette.ts, src/index.ts
Risk: breaking — ConsoleSearch props changed.
Tests: pnpm --filter @repo/plugin-console check-types
```

```
chore(plugin-console): memoize palette callbacks and document event-emit gap

Why: setQuery/open/toggle returned fresh per render; manifest events unimplemented.
What: useCallback wrap; dev_log.md Known gaps entry.
Scope: src/hooks/useCommandPalette.ts, docs/dev_log.md
Risk: none
Tests: pnpm --filter @repo/plugin-console check-types
```

## After commits

`packages/plugin-console/docs/dev_log.md`:
- Status: `READY_FOR_VERIFY`
- Suggested Next: `Cross-review verification (claude-review-fix-pass)`
- Add Work Log entries for each commit.

**Do not push.** Dispatcher merges back later.
