# Track D Fix — D1: RepoAdapter Contract Tests

## 背景

Claude Code 对 `codex/track-d-repo-integration` 分支（commit 1d3e718）做了跨厂商审查，verdict 为 REVISE。其中 **P1 issue**：

> **No RepoAdapter tests** — `packages/plugin-{labels,productivity,clipboard,console,project,widgets,calendar,pet,ai-cube,organizer}/src/data/*.ts` have zero tests. Risk: a regression in seeding (re-entrant `getAll` after `this.seeded = true`) or soft-delete filter would not be caught.

## 目标

为以下 9 个 plugin 的 `RepoAdapter` 增加 vitest 单元测试。每个测试文件覆盖 5 个不变量：

1. **save → getAll**：保存的 record 出现在 `getAll()` 返回
2. **save → getById**：通过 id 能读回 record
3. **delete → getAll**：删除后从 `getAll()` 中消失
4. **delete → getById**：删除后 `getById()` 返回 null
5. **seed-once 不变量**：第一次 `getAll()` 在 repo 为空时种入 seed；第二次 `getAll()` 不重复种入

涉及 plugin：
- `packages/plugin-labels/src/data/RepoAdapter.ts`
- `packages/plugin-productivity/src/data/RepoAdapter.ts`
- `packages/plugin-clipboard/src/data/RepoAdapter.ts`
- `packages/plugin-console/src/data/RepoAdapter.ts`
- `packages/plugin-project/src/data/RepoAdapter.ts`
- `packages/plugin-widgets/src/data/RepoAdapter.ts`
- `packages/plugin-calendar/src/data/RepoAdapter.ts`
- `packages/plugin-pet/src/data/RepoAdapter.ts`
- `packages/plugin-ai-cube/src/data/RepoAdapter.ts`

## 实施要求

### 1. 复用 in-memory mock Repo

`@repo/core-data` 已经提供 `createInMemoryRepo<T>()`（位于 `packages/core-data/src/testing.ts`）。所有测试 MUST 使用这个 mock，**禁止**自己再造一个 in-memory 实现。

```ts
import { createInMemoryRepo } from "@repo/core-data/testing";
```

如果该路径不能直接 import（取决于 package.json exports），先读 `packages/core-data/package.json` 与 `packages/core-data/src/index.ts`，确认正确的 import 路径；如有必要，从 `@repo/core-data` 主入口 re-export `createInMemoryRepo`（这是一次性内部 testing utility，不算 contract 改动）。

### 2. 每个 plugin 一个测试文件

文件名：`packages/plugin-<name>/src/data/RepoAdapter.test.ts`

模板（以 plugin-labels 为例）：

```ts
import { describe, expect, it } from "vitest";
import { createInMemoryRepo } from "@repo/core-data/testing";
import { RepoAdapter } from "./RepoAdapter";
import type { Label } from "../types";

function makeLabel(overrides: Partial<Label> = {}): Label {
  const now = new Date("2026-05-20T00:00:00.000Z").toISOString();
  return {
    id: "lab-1",
    entityType: "labels.label",
    schemaVersion: 1,
    syncScope: "account-sync",
    name: "Focus",
    color: "#2563eb",
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides,
  };
}

describe("plugin-labels RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<Label>({ namespace: "test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);
    const label = makeLabel();
    await adapter.save(label);
    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("lab-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<Label>({ namespace: "test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);
    await adapter.save(makeLabel());
    expect((await adapter.getById("lab-1"))?.id).toBe("lab-1");
  });

  it("delete removes the record from getAll and getById", async () => {
    const repo = createInMemoryRepo<Label>({ namespace: "test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);
    await adapter.save(makeLabel());
    await adapter.delete("lab-1");
    expect(await adapter.getAll()).toEqual([]);
    expect(await adapter.getById("lab-1")).toBeNull();
  });

  it("seed runs once when repo is empty and never again", async () => {
    const repo = createInMemoryRepo<Label>({ namespace: "test", schemaVersion: 1 });
    const seed = [makeLabel({ id: "seed-1" }), makeLabel({ id: "seed-2", name: "Waiting" })];
    const adapter = new RepoAdapter(repo, { seed });
    const first = await adapter.getAll();
    expect(first).toHaveLength(2);
    await adapter.delete("seed-1");
    const second = await adapter.getAll();
    expect(second).toHaveLength(1);
    expect(second.map((l) => l.id)).toEqual(["seed-2"]);
  });
});
```

注意：每个 plugin 的 `RepoAdapter` 构造签名不同（有的接 `seed` 数组、有的接 options 对象、productivity 有 `entityType + orderBy` 选项、ai-cube/project/widgets 有泛型）。**先读源文件再写测试**，按实际签名调整。

### 3. 添加 vitest 配置（如果 plugin 还没有）

检查每个 plugin 的 `package.json` — 如果没有 `test` script，添加：

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

并确保 `vitest` 在 devDependencies 中（如已有 workspace 级 vitest 则 reuse）。

### 4. 验证

完成后必须运行并通过：

```bash
# 每个 plugin 单独
pnpm --filter @repo/plugin-labels test
pnpm --filter @repo/plugin-productivity test
pnpm --filter @repo/plugin-clipboard test
pnpm --filter @repo/plugin-console test
pnpm --filter @repo/plugin-project test
pnpm --filter @repo/plugin-widgets test
pnpm --filter @repo/plugin-calendar test
pnpm --filter @repo/plugin-pet test
pnpm --filter @repo/plugin-ai-cube test

# 类型检查保持绿
pnpm --filter @repo/plugin-labels check-types
# ... (同样对所有 9 个)
```

### 5. 提交

完成后执行一次提交：

```
test(track-d): add RepoAdapter contract tests for 9 plugins

Why: cross-vendor review (Track D REVISE) flagged zero test coverage on the
Repository v0 adapters introduced in commit 1d3e718.
What: adds vitest unit tests covering save→getAll, save→getById,
delete→getAll/getById, and the seed-once invariant for plugin-labels,
plugin-productivity, plugin-clipboard, plugin-console, plugin-project,
plugin-widgets, plugin-calendar, plugin-pet, plugin-ai-cube.
Scope: tests-only — no production code change.
Tests: pnpm --filter <each plugin> test
```

## 红线

- **禁止**修改任何 production source（`RepoAdapter.ts` / `RepoProvider.tsx` 本身）。这一项只补测试。
- **禁止**修改 `packages/core-data/src/types.ts`（Repository 接口冻结）。
- **禁止**修改 `docs/contracts/`。
- 如果发现 `RepoAdapter` 源码 bug，先**写出失败测试**，把 bug 描述加入 commit message 的 `Known follow-ups` 段（不要在这一 commit 修源码）。

## 输出

最后给出一个 50 字以内中文摘要，确认所有 9 个 plugin 的测试通过 + 提交 hash。
