# Codex Fix Brief — plugin-clipboard

> Codex agent — cold start. **Touch only `packages/plugin-clipboard/`.** Read this brief then the review file first.

## Working context

- **Working dir**: `/tmp/codex-fix-plugin-clipboard` (worktree)
- **Branch**: `codex/track-b-fix-clipboard`
- **Full review**: `docs/reviews/track-b-cross-review/claude-review.md` → "Plugin: plugin-clipboard"

## Scope

- `packages/plugin-clipboard/src/**`
- `packages/plugin-clipboard/docs/dev_log.md`

## DO NOT TOUCH

- Other `packages/plugin-*/`
- `apps/`, `packages/core/`, `packages/core-data/`, `packages/ui/`

## Issues to fix

### P0 — `ClipboardStoreProvider` adapter default-arg loop

**File**: `packages/plugin-clipboard/src/hooks/useClipboardStore.tsx:116-119`

Apply the `useState(() => new LocalStorageAdapter(...))` lazy-initializer pattern (see plugin-labels brief P0 for the exact shape).

### P1.1 — Redact-on-store (CRITICAL SECURITY)

**File**: `packages/plugin-clipboard/src/hooks/useClipboardStore.tsx`

**Issue**: today `applyRedactions` runs only inside `renderContent` (display). The raw secret (email, SSN-shaped pattern) stays in `localStorage` forever. A user who enables redaction expects the on-disk copy to be sanitized too.

**Fix** — redact at WRITE time:
1. In `addMockEntry`, apply redaction to `content` before persisting:
   ```tsx
   const content = applyRedactions(input.content.trim(), privacy);
   ```
2. In `updateEntry`, if the patch includes `content`, redact it too:
   ```tsx
   const sanitizedPatch = patch.content
     ? { ...patch, content: applyRedactions(patch.content, privacy) }
     : patch;
   ```
3. **renderContent stays as-is** as a defense-in-depth layer (so existing stored entries — pre-fix — are still rendered redacted on read).
4. Add a **migration on hydrate**: when `privacy.redactEnabled` is true, run a one-time pass over hydrated entries that rewrites any entry whose content still matches a pattern. Place this in the `refresh` callback after the initial `getAll`:
   ```tsx
   if (privacy.redactEnabled) {
     for (const entry of next) {
       const redacted = applyRedactions(entry.content, privacy);
       if (redacted !== entry.content) {
         await stableAdapter.save({ ...entry, content: redacted });
       }
     }
   }
   ```
5. When the user **toggles redactEnabled ON** via `updatePrivacy`, run the same backfill pass over current entries.
6. **Document the irreversibility**: in `ClipboardPrivacy.tsx` near the redact toggle, add a small `<span style="color: #6b7280; font-size: 11px">` warning: `"Redaction rewrites stored content. Originals cannot be recovered."`

### P1.2 — Auto-clear effect re-runs on every entry change

**File**: `packages/plugin-clipboard/src/hooks/useClipboardStore.tsx:143-156`

**Issue**: `useEffect([adapter, entries, privacy.autoClearMinutes])` tears down + restarts the 30-second timer every time `entries` changes. If the user captures items faster than 30s, the sweep never fires.

**Fix**: hold `entries` in a ref so the effect only depends on `privacy.autoClearMinutes`:
```tsx
const entriesRef = useRef<ClipboardEntry[]>(entries);
useEffect(() => { entriesRef.current = entries; }, [entries]);

useEffect(() => {
  const autoClearMinutes = privacy.autoClearMinutes;
  if (!autoClearMinutes) return undefined;
  const interval = window.setInterval(() => {
    const cutoff = Date.now() - autoClearMinutes * 60_000;
    const stale = entriesRef.current.filter(
      (e) => !e.pinned && new Date(e.createdAt).getTime() < cutoff,
    );
    if (stale.length === 0) return;
    stale.forEach((e) => void stableAdapter.delete(e.id));
    setEntries((prev) =>
      prev.filter((e) => e.pinned || new Date(e.createdAt).getTime() >= cutoff),
    );
  }, 30_000);
  return () => window.clearInterval(interval);
}, [stableAdapter, privacy.autoClearMinutes]);
```

### P1.3 — `inferType` over-classifies prose as code

**File**: `packages/plugin-clipboard/src/hooks/useClipboardStore.tsx:60-64`

**Issue**: regex `/function\s|const\s|let\s|=>|class\s/` matches everyday phrases like "Let me think" or "→ tomorrow" or "first class flight".

**Fix**: require at least two code-shaped signals OR a leading code indicator. Pragmatic heuristic:
```tsx
function inferType(content: string): ClipboardEntryType {
  const trimmed = content.trim();
  if (/^https?:\/\//.test(trimmed)) return "url";
  // Require a code-like structural signal AND a syntactic token to reduce
  // false positives on prose containing words like "let" or "class".
  const hasStructural = /[{};]|=>|\bfunction\b|\bclass\b/.test(trimmed);
  const looksMultilineCode = trimmed.includes("\n") && /^\s{2,}|\t/.test(trimmed);
  if (hasStructural && (looksMultilineCode || /^[{[]/.test(trimmed))) return "code";
  return "text";
}
```

(Adjust if you have a better idea — the only requirement is that "Let me know" and "→ tomorrow" must classify as `text`.)

### P2.1 — `usePasteQueue.start` doesn't drive itself

**File**: `packages/plugin-clipboard/src/hooks/usePasteQueue.ts:48-50`

The current `start()` only flips status to `"running"`; the caller must implement the loop. The name promises more.

**Fix (lightweight)**: add a `delayMs` option to `UsePasteQueueOptions` and an internal `useEffect` that, when `status === "running"`, calls `pasteCurrent()` every `delayMs` until `completed`. Default `delayMs = 800`. The effect deps are `[status, currentEntry, delayMs]`. Cleanup the timer.

If you prefer not to add automatic stepping, **rename** `start` to `arm` and document in `index.ts` JSDoc that the caller is responsible for the pacing loop. Pick whichever you find cleaner; document choice in the commit body.

### P2.2 — `ClipboardList` URL entries shown as plain text

**File**: `packages/plugin-clipboard/src/components/ClipboardList.tsx:85`

Wrap URL-type entries in an `<a>` tag with `rel="noopener noreferrer" target="_blank"`. React escapes the href, so safe.
```tsx
{entry.type === "url" ? (
  <a href={renderContent(entry)} rel="noopener noreferrer" target="_blank">
    {renderContent(entry)}
  </a>
) : (
  <pre>{renderContent(entry)}</pre>
)}
```

### P2.3 — Document event-emit gaps

In `docs/dev_log.md`: `Pending: emit clipboard:entry-created / paste-queued / ocr-requested via @repo/core/events.`

## Acceptance criteria

1. `pnpm --filter @repo/plugin-clipboard check-types` → **PASS**
2. `git diff --stat` confirms only `packages/plugin-clipboard/**` modified.
3. Manual sanity: set seed entry content to `"contact alice@example.com"` and confirm:
   - With `redactEnabled: true` from the start → localStorage entry stores `"contact [redacted]"`.
   - With `redactEnabled: false` → stores raw, displays raw.
   - Toggle ON → backfill rewrites the stored content.
4. `index.ts` public surface unchanged (only behavior changes).

## Commit plan

```
fix(plugin-clipboard): stop ClipboardStoreProvider adapter default-arg loop
fix(plugin-clipboard): redact clipboard content at write time, not just on display

Why: previously sensitive patterns stayed in localStorage; redaction was
display-only — a user who toggled redaction ON still leaked secrets via
DevTools / future sync. Now redaction runs on addMockEntry, updateEntry,
hydrate (one-time backfill), and on privacy toggle ON.
What: applyRedactions threaded through write paths; backfill loop; UI warning.
Scope: src/hooks/useClipboardStore.tsx, src/components/ClipboardPrivacy.tsx
Risk: data-mutating — existing entries with sensitive patterns will be
rewritten irreversibly on next hydrate when redactEnabled true. Warning
surfaced in UI.
Docs: dev_log.md note.
Tests: pnpm --filter @repo/plugin-clipboard check-types
```

```
fix(plugin-clipboard): stabilize auto-clear interval against entry churn
fix(plugin-clipboard): tighten inferType to avoid prose-as-code misclassification
feat(plugin-clipboard): auto-step paste queue with configurable delay  (or rename start→arm)
feat(plugin-clipboard): render URL entries as clickable anchors
chore(plugin-clipboard): document event-emit gaps in dev_log
```

## After commits

`docs/dev_log.md`:
- Status: `READY_FOR_VERIFY`
- Suggested Next: `Cross-review verification (claude-review-fix-pass)`
- Work Log entries per commit.

**Do not push.**
