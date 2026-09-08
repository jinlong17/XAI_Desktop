# Track D Fix — D3: Soft-delete Consistency

## 背景

Claude Code 对 `codex/track-d-repo-integration` 的审查发现 **P2 issue**：

> **Soft-delete inconsistency** — every RepoAdapter filters `!record.deletedAt` on read but calls `this.repo.delete(id)` (hard delete) on write. The filter is dead code locally and only activates if sync replicas push tombstones.

## 决策：tombstone-on-delete

选 tombstone 方案（不删 filter），原因：
- 同步层 v1 需要 tombstone 才能正确做"我把 record A 删了"的远端复制。如果本地直接 hard-delete，sync 拉到一个"无 A"的状态，会和一个"曾经有过 A 但被删了"的状态混淆。
- 当前 9 个 plugin 的 read filter 已经准备好接 tombstone，只需要让 delete 写 tombstone 即可。

## 目标

把以下 9 个 RepoAdapter 的 `delete(id)` 实现改成 tombstone 写入：

```ts
async delete(id: string): Promise<void> {
  const current = await this.repo.get(id);
  if (!current) return;
  const tombstone = {
    ...current,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await this.repo.put(tombstone);
}
```

涉及文件（**每个文件单独编辑，因为每个 adapter 签名/类型不同**）：

1. `packages/plugin-labels/src/data/RepoAdapter.ts`
2. `packages/plugin-productivity/src/data/RepoAdapter.ts`（**generic** `RepoAdapter<T extends RepoRecord & { deletedAt?: string }>`）
3. `packages/plugin-clipboard/src/data/RepoAdapter.ts`
4. `packages/plugin-console/src/data/RepoAdapter.ts`
5. `packages/plugin-project/src/data/RepoAdapter.ts`（**generic**）
6. `packages/plugin-widgets/src/data/RepoAdapter.ts`
7. `packages/plugin-calendar/src/data/RepoAdapter.ts`
8. `packages/plugin-pet/src/data/RepoAdapter.ts`
9. `packages/plugin-ai-cube/src/data/RepoAdapter.ts`（**generic**）

## 实施细节

### 1. 类型层确保 `deletedAt` 是 optional

每个 plugin 的 entity type 已经声明了 `deletedAt?: string`（read filter 依赖这个）。如果哪个 plugin 的 entity 缺这个字段，加上：

```ts
deletedAt?: string;
```

### 2. 注意 version 字段

`plugin-labels`, `plugin-productivity` 等 entity 有 `version: number` 字段。tombstone 也应该 bump version：

```ts
const tombstone = {
  ...current,
  deletedAt: now,
  updatedAt: now,
  version: typeof current.version === "number" ? current.version + 1 : 1,
};
```

但**只对真正声明了 `version` 字段的 entity** 这么做。`plugin-pet`, `plugin-widgets`, `plugin-calendar`, `plugin-console`, `plugin-clipboard`, `plugin-ai-cube` 等需要先读 types.ts 确认是否有 `version`。

### 3. 复用 `repo.put` 而不是 `repo.delete`

新实现里**完全不调** `this.repo.delete(id)`。tombstone 永久留在底层 repo 里。这是 v0 设计选择 — sync gc 是后续 milestone 的事。

### 4. 处理 `getById` 对 tombstone 的判断

`getById` 已经过滤 `!record.deletedAt`，行为正确（删除后 `getById` 返回 null）。无需改 read path。

### 5. 更新现有单元测试

如果 D1 (RepoAdapter contract tests) 这一 fix 已经合入（或并行进行），D3 的 PR 要保证那些测试仍然绿（delete → getAll/getById 不变量必须继续成立）。

如果 D1 还未合入，自己在每个 plugin 加一个最小回归测试：

```ts
it("delete writes a tombstone — record disappears from getAll and getById", async () => {
  const repo = createInMemoryRepo<Label>({ namespace: "test", schemaVersion: 1 });
  const adapter = new RepoAdapter(repo);
  await adapter.save(makeLabel({ id: "x" }));
  await adapter.delete("x");
  expect(await adapter.getAll()).toEqual([]);
  expect(await adapter.getById("x")).toBeNull();

  // tombstone is still present at the repo level (proves we did NOT hard delete)
  const raw = await repo.get("x");
  expect(raw?.deletedAt).toBeDefined();
});
```

### 6. 验证

```bash
pnpm --filter @repo/plugin-labels check-types
pnpm --filter @repo/plugin-productivity check-types
pnpm --filter @repo/plugin-clipboard check-types
pnpm --filter @repo/plugin-console check-types
pnpm --filter @repo/plugin-project check-types
pnpm --filter @repo/plugin-widgets check-types
pnpm --filter @repo/plugin-calendar check-types
pnpm --filter @repo/plugin-pet check-types
pnpm --filter @repo/plugin-ai-cube check-types
pnpm --filter desktop build
```

并跑所有相关 plugin 的 test（如果有 D1 的测试）。

### 7. 提交

一个 commit 覆盖 9 个 adapter：

```
refactor(track-d): tombstone-on-delete across 9 RepoAdapters

Why: cross-vendor review (Track D REVISE) flagged inconsistency — read path
filters out records with deletedAt, but write path hard-deleted via
repo.delete. The filter was dead code locally and would conflict with
sync v1 tombstone semantics.
What: delete() now sets deletedAt/updatedAt (and bumps version where the
entity has it) and writes via repo.put. Read path unchanged. Tombstones
persist in the underlying Repo for future sync gc.
Scope: 9 plugin RepoAdapters; no contract / core / docs change.
Tests: pnpm -r check-types + plugin tests + desktop build.
```

## 红线

- **禁止**修改 `packages/core-data/src/types.ts`、`docs/contracts/`、`apps/desktop/src/**`。
- **禁止**更改 `getAll` / `getById` 的 read filter（保留现状）。
- **禁止**在 RepoProvider/LocalStorageAdapter 里复制 tombstone 逻辑（LocalStorage 可以保留 hard-delete，因为它是 fallback v0）。

## 输出

50 字以内中文摘要，确认 9 个 plugin check-types + desktop build 全绿，附 commit hash。
