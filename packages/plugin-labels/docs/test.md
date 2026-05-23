# Plugin Labels Test Notes

## Gates

- `pnpm --filter @repo/plugin-labels check-types`
- `pnpm --filter @repo/plugin-labels test`
- `pnpm --filter @repo/core check-types` (covers the additive `EventMap` keys)

## Manual Coverage

- Select and remove multiple labels.
- Use arrow keys and Enter in `LabelPicker`.
- Create a new label from a query.
- Confirm recent labels sort ahead of older labels.

## W0.B Test Strategy — labels:* typed events emit (2026-05-23)

Co-located vitest file: `packages/plugin-labels/src/hooks/useLabelStore.test.tsx`. Environment header `// @vitest-environment jsdom` (the store mounts under React 19 `createRoot`).

### Mock strategy

`vi.mock("@repo/core/events", () => ({ emitEvent: vi.fn(() => Promise.resolve()), useEventListener: vi.fn() }))` at the top of the test file. This is the same pattern used by `packages/plugin-productivity/src/hooks/useTodoStore.test.tsx` and verified by `vitest.config.ts`' alias map.

In-memory adapter (`makeMemAdapter`) mirrors sibling tests — a `Map<string, Label>` exposing `getAll` / `getById` / `save` / `delete`. Seed labels per test as needed.

### Acceptance criteria → binary tests

| AC ID | Trigger | Expected emit | Payload assertions |
|---|---|---|---|
| AC-L-C1 | `createLabel({ name: "Focus", color: "#2563eb" })` succeeds | One `labels:created` emit | `event === "labels:created"`; payload has `id` (truthy), `name === "Focus"`, `color === "#2563eb"`, `entityType === "labels.label"`, `version === 1`, `createdAt` parseable ISO. |
| AC-L-C2 | `createLabel({ name: "  Focus  " })` (whitespace) succeeds | One `labels:created` emit | `payload.name === "Focus"` (trimmed); `color` is a non-empty hex string (fallback path). |
| AC-L-C3 | `createLabel({ name: "" })` throws | No emit | `emitEventMock` not called. |
| AC-L-C4 | `createLabel` after `adapter.save` rejects | No emit | `adapter.save` mocked to throw; await rejects; `emitEventMock` not called. |
| AC-L-U1 | `updateLabel(id, { name: "Renamed" })` succeeds | One `labels:updated` emit | `payload.id` matches; `payload.name === "Renamed"`; `payload.version === current.version + 1`; `payload.updatedAt` parseable ISO; `payload.color` reflects post-update color. |
| AC-L-U2 | `updateLabel("missing-id", {...})` — pre-read returns `null` | No emit | `emitEventMock` not called (silent no-op). |
| AC-L-D1 | `deleteLabel(id)` for a live label | One `labels:deleted` emit | `payload.id` matches; `payload.version === current.version` (pre-read version); `payload.deletedAt` parseable ISO. |
| AC-L-D2 | `deleteLabel("missing-id")` — pre-read returns `null` | No emit | `emitEventMock` not called (silent no-op). |
| AC-L-G1 | Two successive `createLabel` calls | Two `labels:created` emits | `emitEventMock` called twice with distinct `id`s. (Confirms no spurious dedup.) |
| AC-L-G2 | Provider re-renders (parent state change) without action | No emit | `emitEventMock` not called between two `root.render(...)` calls (no `useEffect` emit path). |
| AC-L-G3 | Non-Tauri runtime: `emitEvent` rejects | Operation still succeeds | Mock `emitEvent` to return `Promise.reject(new Error("not tauri"))`; `createLabel` resolves; no unhandled rejection (verified by absence of test failure). |

Total: 11 binary scenarios across the three mutation outlets + 3 guards.

### Test harness sketch

```tsx
// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/core/events", () => ({
  emitEvent: vi.fn(() => Promise.resolve()),
  useEventListener: vi.fn(),
}));

import { emitEvent } from "@repo/core/events";
import { LabelStoreProvider, useLabelStore } from "./useLabelStore";
import type { DataAdapter, Label, LabelStore } from "../types";

const emitEventMock = vi.mocked(emitEvent);

function makeMemAdapter(seed: Label[] = []): DataAdapter<Label> { /* … */ }
function makeLabel(overrides: Partial<Label> = {}): Label { /* … */ }

let container: HTMLDivElement;
let root: Root;
let capturedStore: LabelStore | null = null;
function Capture() { capturedStore = useLabelStore(); return null; }
function renderProvider(adapter: DataAdapter<Label>) {
  act(() => { root.render(<LabelStoreProvider adapter={adapter}><Capture /></LabelStoreProvider>); });
}
```

### What is intentionally **not** tested

- The `EventMap` declaration itself — type-level only, covered by `pnpm --filter @repo/core check-types`.
- `LabelPicker` / `LabelBadge` UI — out of scope for this row.
- Repo round-trip via `RepoAdapter` — covered by `RepoAdapter.test.ts`; this row doesn't change adapter behaviour.
- Cross-window receive — requires real Tauri runtime; handled by manual verification + downstream consumer rows.

### Cross-window / real-hardware verification

Per Step 0 brief: **not required** for this row (no multi-window navigation, no native API, no Tauri command signature change). Standard `pnpm --filter @repo/plugin-labels test` + `check-types` is the gate. Sibling rows (Console, Project, future) that *subscribe* to these events will own their own real-hardware verification when they ship.
