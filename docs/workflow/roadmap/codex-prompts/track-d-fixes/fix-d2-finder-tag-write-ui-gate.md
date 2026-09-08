# Track D Fix — D2: Gate Finder-Tag Write UI

## 背景

Claude Code 对 `codex/track-d-repo-integration` 的审查发现 **P1 issue**：

> **`write_finder_tags` is a no-op** — `apps/desktop/src-tauri/src/commands/finder.rs:343-358` validates input and returns `Ok(())` without touching `kMDItemUserTags`. The `TagPicker` UI in `GridItem.tsx:59` calls it, so end-users see "save" succeed silently.
>
> **`read_finder_tags` / `write_finder_tags` not registered in `lib.rs`** — the new commands will throw "command not found" at runtime. Outside Track D's file ownership (cross-track handoff needed).

## 目标

把 Finder-Tag UI 的"写"路径在前端 gate 起来，避免用户在 `write_finder_tags` 真正落地（含 lib.rs 注册 + xattr 实现）前误以为 tag 已经保存。

**读路径保留**（虽然 `read_finder_tags` 也未注册，但读失败只是空数组，不会误导用户）。

## 实施要求

### 方案：在 `TagPicker` 加 `readOnly` prop，GridItem 默认传 `true`

#### 1. 修改 `packages/plugin-organizer/src/TagPicker.tsx`

加一个 `readOnly?: boolean` prop，默认 false（不破坏 API），当 true 时：
- 隐藏输入框（不能添加 tag）
- 移除 tag 按钮变成纯展示徽章（不能删除 tag）
- 在底部加一行 dim 文案：`"Finder tag write is disabled until the platform command lands."`

#### 2. 修改 `packages/plugin-organizer/src/GridItem.tsx`

把 TagPicker 实例显式传 `readOnly={true}`，并把 `updateTags` 改为 noop（不再调 `finderClient.writeFinderTags`）：

```ts
// 删除这块
const updateTags = (nextTags: DesktopItem["finderTags"]) => {
  onUpdate?.(item.id, { finderTags: nextTags });
  if (item.filepath) {
    void finderClient.writeFinderTags(item.filepath, nextTags ?? []).catch(() => undefined);
  }
};

// 改为
const updateTags = undefined; // write path is disabled until contract lands
```

`<TagPicker tags={tags} onChange={updateTags} />` 改为 `<TagPicker tags={tags} readOnly />`（onChange 设为 no-op 或省略，看 TagPicker 签名调整）。

需要让 TagPicker 在 `readOnly=true` 时把 `onChange` 设为 optional。

#### 3. 加注释解释为什么 gate

在 GridItem.tsx 的 updateTags 处加一行注释（必须解释 WHY）：

```ts
// Write path gated: write_finder_tags is a no-op in Rust and is not yet
// registered in lib.rs. Re-enable once both the xattr implementation and
// the command registration land. See docs/reviews/finder-tag-read-write/
// proposed-contract-changes.md.
```

### 4. 保留 read 路径

GridItem.tsx 现有的 `useEffect` 读 tag 流程不动。读失败会被 `.catch(() => undefined)` 吞掉，不会污染 UI。

### 5. 测试

- 修改 `packages/plugin-organizer/src/hooks/useFileDrop.test.ts` 不需要 — 它跟 Tag 无关。
- 新增 `packages/plugin-organizer/src/TagPicker.test.tsx`：
  - 当 `readOnly=true` 时，输入框不渲染
  - 当 `readOnly=true` 时，点击 tag 不触发 onChange
  - 当 `readOnly=true` 时，渲染"disabled"文案
  - 当 `readOnly=false`（或省略）时，原有行为保持

### 6. 验证

```bash
pnpm --filter @repo/plugin-organizer check-types
pnpm --filter @repo/plugin-organizer test
pnpm --filter desktop build
```

### 7. 提交

```
fix(organizer): gate Finder tag write UI until command lands

Why: write_finder_tags is a validation-only no-op in Rust and is not
registered in lib.rs (cross-vendor review P1). Letting users mutate the
TagPicker creates a silent-success illusion.
What: TagPicker gains readOnly prop; GridItem passes readOnly=true and
disables the write call; read path is preserved (failures swallowed).
Re-enable once the platform write lands.
Scope: plugin-organizer UI only.
Tests: pnpm --filter @repo/plugin-organizer test
```

## 红线

- **禁止**修改 `apps/desktop/src-tauri/src/lib.rs`（contract owner 是别的 track）。
- **禁止**修改 `apps/desktop/src-tauri/src/commands/finder.rs` 的 write 行为（属于 Track E / platform owner）。
- **禁止**删除 `TagPicker.tsx` 或 `finderClient.writeFinderTags` —— 只 gate，不删。
- **禁止**改 `packages/core/src/types/`、`docs/contracts/`。

## 输出

50 字以内中文摘要，确认 check-types + 单元测试 + desktop build 全绿，附 commit hash。
