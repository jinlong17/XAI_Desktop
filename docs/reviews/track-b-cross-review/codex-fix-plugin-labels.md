# Codex Fix Brief — plugin-labels

> You are a Codex agent. You have **no memory of any prior conversation**. Read this brief fully, then read the referenced review file, then execute. **Touch only files under `packages/plugin-labels/`.**

## Working context

- **Working dir**: `/tmp/codex-fix-plugin-labels` (this is a git worktree the dispatcher created for you)
- **Branch**: `codex/track-b-fix-labels` (already checked out; created from `codex/track-b-productivity-console`)
- **Full review** (read first): `docs/reviews/track-b-cross-review/claude-review.md` — "Plugin: plugin-labels" section
- **Sibling plugins**: do not touch `packages/plugin-{productivity,clipboard,console,project}/` — other Codex sessions are fixing those in parallel-but-isolated worktrees.

## Scope — files you may modify

- `packages/plugin-labels/src/**`
- `packages/plugin-labels/docs/dev_log.md` (workflow state only)

## DO NOT TOUCH

- Any other `packages/plugin-*/`
- `apps/`, `packages/core/`, `packages/core-data/`, `packages/ui/`
- `docs/contracts/`, `docs/SYSTEM_*`, `docs/PLUGIN_MAP.md`
- `docs/reviews/track-b-cross-review/claude-review.md` (read-only)

## Issues to fix

### P0 — `LabelStoreProvider` adapter default-arg infinite render loop

**File**: `packages/plugin-labels/src/hooks/useLabelStore.tsx:52–55`

**Current code (BROKEN)**:
```tsx
export function LabelStoreProvider({
  adapter = new LocalStorageAdapter<Label>(STORAGE_KEY, seedLabels),
  children,
}: LabelStoreProviderProps) {
```

**Why it loops**: when the caller renders `<LabelStoreProvider>{...}</LabelStoreProvider>` without an explicit `adapter` prop, the destructured default expression evaluates fresh on every render. New adapter instance → `useCallback([adapter])` produces new `refresh` → `useEffect([refresh])` re-fires → setState → re-render → loop.

**Required fix pattern**:
```tsx
export function LabelStoreProvider({
  adapter,
  children,
}: LabelStoreProviderProps) {
  const [defaultAdapter] = useState(
    () => new LocalStorageAdapter<Label>(STORAGE_KEY, seedLabels),
  );
  const stableAdapter = adapter ?? defaultAdapter;

  const [labels, setLabels] = useState<Label[]>([]);
  // ... (rest unchanged, but every reference to `adapter` becomes `stableAdapter`)
  const refresh = useCallback(async () => {
    // ... uses stableAdapter
  }, [stableAdapter]);
```

The `useState(() => ...)` lazy initializer runs exactly once for the Provider's lifetime. If consumer passes `adapter`, we use theirs (and if THEY swap it, a reload is the correct response). If not, the once-created `defaultAdapter` keeps `stableAdapter` stable across renders.

**Acceptance**: after fix, `<LabelStoreProvider>{children}</LabelStoreProvider>` mounted once renders **without** an infinite update cycle in React DevTools / console.

### P1.1 — `LabelPicker` `activeIndex` off-by-one when `canCreate` true

**File**: `packages/plugin-labels/src/components/LabelPicker.tsx:61`

**Current**:
```tsx
setActiveIndex((index) => Math.min(index + 1, filteredLabels.length + (canCreate ? 0 : -1)));
```

**Bug**: when `canCreate` is true, the "Create '<query>'" button is at index `filteredLabels.length`, so the upper bound should be `filteredLabels.length` (i.e., `+ 0` when there IS a create button, `- 1` when there isn't). The current logic is inverted.

**Fix**:
```tsx
const upperBound = filteredLabels.length - (canCreate ? 0 : 1);
setActiveIndex((index) => Math.min(index + 1, Math.max(upperBound, 0)));
```

**Regression check**: ArrowDown should be able to land on the Create button when canCreate is true; ArrowDown should not navigate past the last filtered label when canCreate is false.

### P1.2 — `updateLabel` doesn't refresh `recentLabelIds` ordering on rename

**File**: `packages/plugin-labels/src/hooks/useLabelStore.tsx:97-111`

**Issue**: when a label is renamed, its position in the sorted `labels` list shifts (because `labels` is sorted by `name`), but its position in `recentLabelIds` is unaffected (which is fine — recency, not name). However, the `labels` setState call doesn't re-sort.

**Fix**: in `updateLabel`, the `setLabels` call should re-sort:
```tsx
setLabels((prev) =>
  prev.map((label) => (label.id === id ? next : label))
      .sort((a, b) => a.name.localeCompare(b.name)),
);
```

### P2.1 — Remove glyph for label badge

**File**: `packages/plugin-labels/src/components/LabelBadge.tsx:59`

Replace the literal `"x"` (lowercase letter, read aloud as "ex" by screen readers) with `"×"` (U+00D7 multiplication sign).

### P2.2 — Emit `labels:*` events declared in manifest

**File**: `packages/plugin-labels/manifest.json` declares `events.emit: ["labels:created", "labels:updated", "labels:deleted"]` but the store never publishes them.

**Decision for this fix**: This requires `@repo/core/events` which is owned by Track A and not yet stable. **Document** the gap in `packages/plugin-labels/docs/dev_log.md` under "Known gaps" — do not import core events yet. Sample line: `- Pending: emit labels:created|updated|deleted once @repo/core/events stabilizes.`

## Acceptance criteria

After all fixes:

1. `pnpm install --prefer-offline` (only if node_modules missing in worktree)
2. `pnpm --filter @repo/plugin-labels check-types` → **PASS**
3. `git diff --stat` confirms only `packages/plugin-labels/**` modified (plus dev_log.md)
4. Public API surface unchanged: `index.ts` exports list identical before/after.
5. No new entries in `dependencies` / `devDependencies` of `packages/plugin-labels/package.json`.

## Commit plan

One commit per P0/P1/P2 group, in this order:

```
fix(plugin-labels): stop adapter default-arg infinite render loop

Why: <one line>
What: replace destructured-default `new LocalStorageAdapter()` with
useState lazy initializer so the adapter reference is stable across renders.
Scope: packages/plugin-labels/src/hooks/useLabelStore.tsx
Risk: behavioural — consumers passing an adapter prop and swapping it
mid-flight will now trigger a refresh (intentional).
Docs: none
Tests: pnpm --filter @repo/plugin-labels check-types
```

```
fix(plugin-labels): correct LabelPicker arrow-key bounds and rename re-sort

Why: ArrowDown could navigate past Create button when canCreate true;
renamed labels stayed in old sort position.
What: invert canCreate offset in setActiveIndex; re-sort after updateLabel.
Scope: src/components/LabelPicker.tsx, src/hooks/useLabelStore.tsx
Risk: low
Tests: pnpm --filter @repo/plugin-labels check-types
```

```
chore(plugin-labels): swap remove glyph and document event-emit gap

Why: x glyph reads as letter; manifest declares events the store never emits.
What: × (U+00D7); add Known-gaps note to dev_log.md.
Scope: src/components/LabelBadge.tsx, docs/dev_log.md
Risk: none
Tests: pnpm --filter @repo/plugin-labels check-types
```

## After commits

Update `packages/plugin-labels/docs/dev_log.md`:
- Status: `READY_FOR_VERIFY`
- Suggested Next: `Cross-review verification (claude-review-fix-pass)`
- Add Work Log entries for each commit.

**Do not push.** The dispatcher will merge `codex/track-b-fix-labels` back into `codex/track-b-productivity-console` after verification.
