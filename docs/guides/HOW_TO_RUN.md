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
cd /Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop

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
cd /Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/desktop

# 2. 构建生产版本
pnpm tauri build

# 3. 安装包位置
# macOS: apps/desktop/src-tauri/target/release/bundle/dmg/
# 或: apps/desktop/src-tauri/target/release/bundle/macos/
```

---

## 🧪 当前主线功能测试

启动应用后，按以下步骤验证当前实现：

### 1️⃣ Grid 创建与基础交互
```
1. 在桌面区域创建一个 Grid（通过设置面板或拖入文件触发）
2. 拖动 Grid 到不同位置
3. 调整 Grid 大小
4. ✅ 预期: 位置和尺寸变化生效
```

### 2️⃣ 文件拖入（主流程）
```
1. 从 Finder 拖一个或多个文件到主窗口
2. 若落点无 Grid，系统应创建新 Grid
3. 若落点在已有 Grid 区域，文件应加入该 Grid
4. ✅ 预期: 文件条目出现在目标 Grid 中
```

### 3️⃣ 多窗口行为（当前架构）
```
1. 创建多个 Grid
2. 观察它们以独立窗口方式存在
3. ✅ 预期: 状态提示显示 active grid windows 数量
```

### 4️⃣ 阻塞问题复核（窗口层级）
```
1. 尝试点击 Grid 外的桌面图标
2. 观察点击穿透行为是否符合预期
3. ✅ 说明: 该项为当前 blocker，结果请记录到技术状态文档
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

### 问题 4: Grid 或文件拖入行为异常

**可能原因**:
- 拖放监听未成功挂载
- 窗口层级行为与当前实验配置不一致

**检查方法**:
```bash
# 查看控制台错误
打开开发者工具 (Cmd+Option+I)
查看 Console 是否有报错

# 常见错误:
# - HTML5 drag/drop 事件未触发
# - create-grid-request 事件未监听
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
│   └── plugin-organizer/     # Grid 与组织能力插件
│       └── src/
│           ├── SmartContainer.tsx
│           ├── useGridSystem.tsx
│           └── hooks/
│               └── useFileDrop.ts
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
// 示例：按需加载较重的窗口管理模块
const MultiWindowManager = lazy(() =>
  import('../hooks/useMultiWindowGrids')
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
4. ✅ **记录 blocker**: 将窗口层级与点击穿透测试结果更新到 `docs/development/TECHNICAL_STATUS.md`

---

**文档版本**: v1.1  
**更新时间**: 2026-03-02  
**适用版本**: XAI Desktop current desktop branch

---

## 💡 提示

- 首次运行可能需要较长时间编译 Rust 代码
- 开发模式下，修改代码会自动刷新
- 按 `Cmd+Q` 退出应用
- 按 `Cmd+Option+I` 打开开发者工具
- 所有数据保存在 `localStorage`，清除浏览器缓存会丢失数据

祝使用愉快！🎉
