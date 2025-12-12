# 🚀 XAI Desktop 运行指南

## 📋 前置要求

### 1. 系统要求
- **操作系统**: macOS 10.14+ (需要支持透明窗口)
- **Node.js**: v18+ 
- **pnpm**: v8+
- **Rust**: 最新稳定版
- **Tauri CLI**: v2.x

### 2. 检查环境
```bash
# 检查 Node.js 版本
node --version  # 应该 >= v18

# 检查 pnpm 版本
pnpm --version  # 应该 >= v8

# 检查 Rust 版本
rustc --version

# 检查 Tauri CLI
cargo tauri --version
```

---

## 🎯 快速启动

### 方法 1: 开发模式（推荐测试新功能）

```bash
# 1. 进入项目根目录
cd /Users/jinlong/Desktop/jinlong_project/XAI_Desktop

# 2. 安装依赖（首次运行或 package.json 变更后）
pnpm install

# 3. 启动开发服务器
cd apps/desktop
pnpm tauri dev
```

**预期结果**:
- ✅ Vite 开发服务器启动在 `http://localhost:1420`
- ✅ Tauri 应用窗口自动打开
- ✅ 支持热重载（修改代码自动刷新）

---

### 方法 2: 生产构建（正式使用）

```bash
# 1. 进入桌面应用目录
cd /Users/jinlong/Desktop/jinlong_project/XAI_Desktop/apps/desktop

# 2. 构建生产版本
pnpm tauri build

# 3. 安装包位置
# macOS: apps/desktop/src-tauri/target/release/bundle/dmg/
# 或: apps/desktop/src-tauri/target/release/bundle/macos/
```

---

## 🧪 测试效率助手套件功能

启动应用后，按以下步骤测试新功能：

### 1️⃣ 测试便利贴创建
```
1. 右键点击左上角的 AI Cube (浮动图标)
2. 点击菜单中的 "📝 Add Note"
3. 应该在鼠标位置出现一个黄色便利贴
```

### 2️⃣ 测试便利贴编辑
```
1. 点击便利贴内部 → 进入编辑模式
2. 输入文本: "测试任务：完成项目报告"
3. 点击便利贴外部 → 自动保存
4. 右键点击便利贴:
   - 🎨 切换颜色 (黄→粉→蓝→绿)
   - 📁 折叠/展开
   - 🗑️ 删除
```

### 3️⃣ 测试拖拽转任务（核心功能）
```
1. 确保便利贴有内容
2. 拖拽便利贴到右下角的四象限矩阵
3. 悬停在任意象限上（背景会高亮）
4. 松开鼠标
5. ✅ 预期结果:
   - 便利贴从桌面消失
   - 任务出现在目标象限中
   - 任务内容与便利贴一致
   - 可以点击 Checkbox 标记完成
```

### 4️⃣ 测试四象限任务管理
```
1. 右下角显示四象限矩阵:
   - 左上: 紧急且重要 (红色)
   - 右上: 重要不紧急 (蓝色)
   - 左下: 紧急不重要 (黄色)
   - 右下: 不紧急不重要 (绿色)
2. 点击任务的 Checkbox → 任务显示删除线
3. 点击任务右侧的 × → 删除任务
```

### 5️⃣ 测试番茄时钟
```
1. 右上角显示番茄时钟组件
2. 点击 "开始" → 倒计时从 25:00 开始
3. 观察进度条实时更新
4. 点击 "暂停" → 停止倒计时
5. 点击 "重置" → 恢复到 25:00
```

### 6️⃣ 测试持久化
```
1. 创建 2-3 个便利贴，输入不同内容
2. 拖拽 1 个便利贴到四象限
3. 标记 1 个任务为完成
4. 开始番茄时钟
5. 关闭应用（Cmd+Q）
6. 重新启动应用
7. ✅ 预期结果: 所有状态都保持不变
```

---

## 🐛 故障排除

### 问题 1: 端口 1420 已被占用

**错误信息**:
```
Error: Port 1420 is already in use
```

**解决方法**:
```bash
# 查找占用端口的进程
lsof -ti:1420

# 结束该进程
kill -9 $(lsof -ti:1420)

# 或者修改端口（在 apps/desktop/vite.config.ts）
server: {
  port: 1421  // 改成其他端口
}
```

---

### 问题 2: 依赖安装失败

**错误信息**:
```
Cannot install with "frozen-lockfile"
```

**解决方法**:
```bash
# 使用 --no-frozen-lockfile 强制更新
pnpm install --no-frozen-lockfile
```

---

### 问题 3: 窗口背景不透明（全白）

**检查清单**:
```bash
# 1. 验证配置
./scripts/verify-transparency.sh

# 2. 检查 macOS 系统设置
系统设置 → 辅助功能 → 显示 → 确保"降低透明度"已关闭

# 3. 清理重新编译
cd apps/desktop
pnpm tauri clean
pnpm tauri dev
```

---

### 问题 4: 便利贴或四象限不显示

**可能原因**:
- EfficiencyStoreProvider 未正确包装
- DndContext 配置错误

**检查方法**:
```bash
# 查看控制台错误
打开开发者工具 (Cmd+Option+I)
查看 Console 是否有报错

# 常见错误:
# - "useEfficiencyStore must be used within EfficiencyStoreProvider"
# - 解决: 检查 App.tsx 是否包含 EfficiencyStoreProvider
```

---

### 问题 5: TypeScript 类型错误

**检查类型**:
```bash
# 检查 plugin-organizer
cd packages/plugin-organizer
pnpm check-types

# 如果有错误，查看具体信息并修复
```

---

## 📦 项目结构

```
XAI_Desktop/
├── apps/
│   └── desktop/              # 主应用
│       ├── src/
│       │   ├── App.tsx       # 应用入口
│       │   ├── components/
│       │   │   └── AiAssistant/
│       │   │       └── AiCube.tsx  # AI 控制中心
│       │   └── plugins/
│       │       └── OrganizerLayer.tsx  # 插件层
│       └── src-tauri/        # Tauri 后端
│           ├── src/
│           │   └── lib.rs    # Rust 代码
│           └── tauri.conf.json  # Tauri 配置
├── packages/
│   └── plugin-organizer/     # 效率助手插件
│       └── src/
│           ├── efficiency/   # 🆕 效率助手套件
│           │   ├── types.ts
│           │   ├── useEfficiencyStore.tsx
│           │   └── components/
│           │       ├── StickyNoteCard.tsx
│           │       ├── StickyNotesLayer.tsx
│           │       ├── TaskCard.tsx
│           │       ├── EisenhowerMatrix.tsx
│           │       └── PomodoroTimer.tsx
│           └── ...
└── pnpm-workspace.yaml       # Monorepo 配置
```

---

## 🔧 开发工具

### 热重载
- ✅ 前端代码 (React/TypeScript): 自动刷新
- ✅ Rust 代码: 保存后自动重新编译

### 开发者工具
```bash
# 在应用中按 Cmd+Option+I 打开
# 或在 tauri.conf.json 中配置:
{
  "build": {
    "devPath": "http://localhost:1420",
    "beforeDevCommand": "pnpm dev"
  }
}
```

### 调试日志
```typescript
// 在代码中添加
console.log('Debug info:', data);

// 在 Rust 中
println!("Debug: {:?}", data);
```

---

## 📊 性能优化建议

### 1. 生产构建
```bash
# 生产构建会:
# - 压缩代码
# - 移除调试信息
# - 优化性能
pnpm tauri build --release
```

### 2. 减少重渲染
- 使用 `React.memo` 包装组件
- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 缓存函数

### 3. 代码分割
```typescript
// 懒加载组件
const EisenhowerMatrix = lazy(() => 
  import('./efficiency/components/EisenhowerMatrix')
);
```

---

## 📝 常用命令速查

```bash
# 安装依赖
pnpm install

# 开发模式
cd apps/desktop && pnpm tauri dev

# 生产构建
cd apps/desktop && pnpm tauri build

# 类型检查
cd packages/plugin-organizer && pnpm check-types

# 清理构建缓存
cd apps/desktop && pnpm tauri clean

# 查看 Tauri 信息
cd apps/desktop && pnpm tauri info
```

---

## 🎯 下一步

1. ✅ **启动应用**: `cd apps/desktop && pnpm tauri dev`
2. ✅ **测试功能**: 按照上面的测试步骤逐项验证
3. ✅ **反馈问题**: 如有问题，参考故障排除部分
4. ✅ **配置通知**: 完善番茄钟通知功能（参考 EFFICIENCY_SUITE_IMPLEMENTATION.md）

---

**文档版本**: v1.0  
**更新时间**: 2024-12-10  
**适用版本**: XAI Desktop v2.2+

---

## 💡 提示

- 首次运行可能需要较长时间编译 Rust 代码
- 开发模式下，修改代码会自动刷新
- 按 `Cmd+Q` 退出应用
- 按 `Cmd+Option+I` 打开开发者工具
- 所有数据保存在 `localStorage`，清除浏览器缓存会丢失数据

祝使用愉快！🎉
