# Proposed Contract Changes: Create Task From Grid

## EventMap

Add to `@repo/core/types` `EventMap`:

```ts
"organizer:grid:create-task": {
  gridItemId: string;
  title: string;
  path?: string;
};
```

Organizer is the emitter. Productivity is the listener and creates a Todo. Plugins must not import each other directly.
