# 文件拖入测试清单

> **Task 4.2: 真实文件拖入 (OS File Drop)**  
> **状态**: 配置已完成，等待实现 Hook  
> **测试日期**: ___________

---

## 配置检查

### ✅ 已完成的配置

- ✅ `tauri.conf.json`: `fileDropEnabled: true`
- ✅ 待实现: `useFileDrop` Hook
- ✅ 待实现: 文件权限配置

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

