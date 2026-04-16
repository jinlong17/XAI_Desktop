# 文件拖入测试清单

> Document Status: OUTDATED (historical draft)
> Current Reality: `useFileDrop` hook already exists at `packages/plugin-organizer/src/hooks/useFileDrop.ts`
> **Task 4.2: 真实文件拖入 (OS File Drop)**  
> **状态**: 本文档描述的是“Hook 实现前”阶段  
> **测试日期**: ___________

---

## 配置检查

### ✅ 历史配置记录（已过时）

- ⚠️ 本文档中的 `fileDropEnabled` 配置说明与当前实现口径不一致
- ✅ 当前代码已存在 `useFileDrop` Hook（HTML5 drag/drop 方案）
- ✅ 实际联调请优先参考 `docs/development/PROGRESS_SNAPSHOT.md`

---

## 测试清单（实现 Hook 后执行）

### Test 1: 单文件拖入
- [ ] 从 Finder 拖拽一个 .txt 文件到 Box 上
- [ ] 预期: 文件被添加到 Box

### Test 2: 多文件拖入
- [ ] 拖拽 3 个文件到 Box
- [ ] 预期: 所有文件都被添加

### Test 3: 文件夹拖入
- [ ] 拖拽一个文件夹到 Box
- [ ] 预期: 文件夹被添加

---

**注意**: 此任务需要后续实现 `useFileDrop` Hook 和相关逻辑才能完成测试。

