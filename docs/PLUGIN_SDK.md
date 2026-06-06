# PLUGIN_SDK.md — Plugin 接口契约表(统一定义)

> 本文档是 XAI_Desktop Plugin 体系的 **"API Schema"** —— 类似前后端分离里的 OpenAPI / GraphQL Schema。
> 所有 Plugin 与宿主、Plugin 之间的接口都在这里**单点定义**;违反本文档的代码会破坏 plugin 独立性。
>
> 配套文档:
> - `SYSTEM_ARCHITECTURE.md` — 系统宪法(架构红线)
> - `TECHNICAL_REQUIREMENTS.md` — 技术实施标准
> - `CORE_INFRA.md` — 基础设施 API 文件路径
> - `PLUGIN_MAP.md` — 各 Plugin 当前状态
>
> 最后更新:2026-05-14 · 对齐 PRD v1.6 / SYSTEM_ARCHITECTURE v2

---

## 目录

1. SDK 总览(三个契约层)
2. Plugin manifest.json 完整规范
3. PluginRegistry / PluginHost 公开 API
3.5. PluginInstance / PluginCenter / AddToDesktop 契约（桌面入口模型）
4. EventMap — 跨 Plugin 事件契约表
5. Tauri Commands 契约
6. Plugin 内部标准目录结构
7. Plugin 独立测试要求
8. "如何新增一个 Plugin" SOP
9. 各模块 manifest 声明示例(16 模块)

---

## 1. SDK 总览(三个契约层)

Plugin 体系存在三类接口契约,**任何 Plugin 与外部交互必须经过其中之一**,禁止直接 import 别人的 src 内部模块:

```
┌──────────────────────────────────────────────────────────┐
│ 契约层 1:Plugin manifest.json                            │
│ ────────────────────────────────────────────────────     │
│ 静态声明:我是谁、我消费什么、我提供什么、我用了什么权限     │
└──────────────────────────────────────────────────────────┘
                            ↓ 启动时被 Host 扫描
┌──────────────────────────────────────────────────────────┐
│ 契约层 2:PluginRegistry API                              │
│ ────────────────────────────────────────────────────     │
│ register(manifest, components) → 把组件挂到 Host 的渲染槽 │
│ Host 通过 PluginHost 拿到所有已注册组件渲染               │
└──────────────────────────────────────────────────────────┘
                            ↓ 运行时通信
┌──────────────────────────────────────────────────────────┐
│ 契约层 3:EventMap + Tauri Commands                       │
│ ────────────────────────────────────────────────────     │
│ Plugin 间 / 跨窗口:走 EventMap 中定义的类型化事件         │
│ Plugin ↔ Rust:走 Tauri Commands(在 manifest 声明)        │
└──────────────────────────────────────────────────────────┘
```

类比前后端分离:
- **manifest.json** ≈ 服务的 service manifest(K8s 中的 Service / Deployment yaml)
- **PluginRegistry API** ≈ 服务注册中心(Eureka / Consul)的 register/discover
- **EventMap** ≈ 消息队列的 topic schema(Kafka schema registry)
- **Tauri Commands** ≈ RPC 调用接口(gRPC proto)

---

## 2. Plugin manifest.json 完整规范

每个 Plugin 包根目录必须有一个 `manifest.json`,这是该 Plugin **对外的唯一静态声明**。

### 2.1 完整字段定义

```jsonc
{
  // 必填:身份
  "name": "string",                 // kebab-case,与目录名 plugin-<name> 对应
  "version": "string",              // semver,如 "1.0.0"
  "displayName": "string",          // 用户可见名(支持 i18n key)
  "description": "string",          // 一句话描述
  "author": "string",
  "license": "MIT",

  // 必填:启用控制
  "enabled": true,                  // 编译期开关;false 时不会被注册

  // 可选:外部依赖
  "dependencies": [
    "@repo/core",                   // 必有
    "@repo/ui",
    "@repo/plugin-labels"           // 可声明对其他 Stable plugin 的依赖
  ],

  // 必填:提供的 ContentType(让其他 plugin / Host 知道我能渲染什么)
  "contentTypes": ["file-grid", "app-grid", "folder-grid"],

  // 必填:声明在哪些窗口出现
  "windows": {
    "overlay": true,                // 是否在 main(透明 overlay)窗口渲染
    "control": true,                // 是否在 control 窗口提供 widget
    "grid": true,                   // 是否提供 Grid 窗口内容(每 Grid 窗口承载哪个 plugin 的内容)
    "console": false,               // 是否在 Console 三栏中提供模块入口(Phase 2.5)
    "web": false,                   // 是否在网页版渲染(Phase 4.5)
    "dedicated": null               // 是否需要独立窗口("clipboard" / "meditation" / "settings"...)
  },

  // 必填:事件契约
  "events": {
    "emit": [                       // 我会 emit 的事件(必须在 EventMap §4 中定义)
      "organizer:grid-update",
      "organizer:file-drop"
    ],
    "listen": [                     // 我会 listen 的事件
      "organizer:create-grid-request",
      "labels:assigned"
    ]
  },

  // 可选:Tauri Commands(我用了哪些后端命令)
  "tauriCommands": [
    "create_grid_window",
    "update_grid_window"
  ],

  // 可选:全局快捷键(在 core-shortcuts 注册)
  "shortcuts": [
    { "id": "new-grid", "default": "Cmd+Shift+N", "description": "新建格子" }
  ],

  // 可选:全局 Label 支持(声明本 plugin 的 entity 可被 Label)
  "labelableEntityTypes": ["todo", "grid_item"],

  // 可选:数据访问声明(读写哪些 SQLite 表 / 后端 endpoint)
  "data": {
    "tables": ["todos", "todo_reminders"],   // SQLite 表(本 plugin 拥有 / 读写)
    "endpoints": ["/api/todos"]              // Web 后端(Phase 4.5)
  },

  // 可选:macOS / 沙箱权限需求
  "permissions": {
    "accessibility": false,
    "screenRecording": false,
    "fullDiskAccess": false,
    "notifications": true,
    "sandboxEntitlements": [
      "com.apple.security.files.user-selected.read-write"
    ]
  },

  // 可选:平台支持矩阵
  "platforms": {
    "macos": "full",                // full / sandbox / web / both
    "web": "subset",                // 网页版是否支持(plugin-clipboard / plugin-widgets 通常是 'none')
    "windows": "planned",           // Phase 5+
    "linux": "planned"
  },

  // 可选:UI Slot(自定义渲染位置,例如在控制台 sidebar 出现)
  "ui": {
    "consoleSidebar": {
      "icon": "list-checks",
      "order": 10
    }
  }
}
```

### 2.2 字段必填性总表

| 字段 | 必填 | 默认值 |
|---|---|---|
| name | ✅ | — |
| version | ✅ | — |
| displayName | ✅ | — |
| description | ✅ | — |
| enabled | ✅ | — |
| dependencies | ✅ | 至少 `["@repo/core"]` |
| contentTypes | ✅(可空数组) | `[]` |
| windows | ✅ | 至少声明一个 true |
| events | ✅ | `{emit:[], listen:[]}` 可空 |
| tauriCommands | ❌ | `[]` |
| shortcuts | ❌ | `[]` |
| labelableEntityTypes | ❌ | `[]` |
| data | ❌ | `{tables:[], endpoints:[]}` |
| permissions | ❌ | 默认全 false |
| platforms | ❌ | `{macos:"full"}` |
| ui | ❌ | — |

### 2.3 manifest 治理规则

- **每次发版 bump version** —— Plugin 间通过 manifest 声明的依赖检查最低版本
- **manifest 是 Plugin 的契约,改字段视为破坏性变更** —— 必须 commit message 标 `BREAKING`
- **CI 校验**(Phase 0 末)—— 启动时检测每个 plugin 的 manifest schema 合法 + emit/listen 事件在 EventMap 中定义
- **manifest 永远先于代码** —— 新功能必须先在 manifest 声明 emit/listen,代码实现才能加

---

## 3. PluginRegistry / PluginHost 公开 API

### 3.1 类型定义

```typescript
// packages/core-registry/src/types.ts

export interface PluginManifest {
  name: string;
  version: string;
  displayName: string;
  description: string;
  enabled: boolean;
  dependencies: string[];
  contentTypes: string[];
  windows: {
    overlay?: boolean;
    control?: boolean;
    grid?: boolean;
    console?: boolean;
    web?: boolean;
    dedicated?: string | null;
  };
  events: {
    emit: string[];
    listen: string[];
  };
  tauriCommands?: string[];
  shortcuts?: Array<{ id: string; default: string; description: string }>;
  labelableEntityTypes?: string[];
  data?: { tables?: string[]; endpoints?: string[] };
  permissions?: Partial<Record<PermissionKey, boolean>> & { sandboxEntitlements?: string[] };
  platforms?: Partial<Record<'macos' | 'web' | 'windows' | 'linux', 'full' | 'subset' | 'sandbox' | 'planned' | 'none'>>;
  ui?: { consoleSidebar?: { icon: string; order: number } };
}

export interface PluginComponents {
  /** 渲染在主窗口 overlay 上的层 */
  OverlayLayer?: React.ComponentType;
  /** 渲染在控制窗口(AI Cube 托盘)中的 widget */
  ControlWidget?: React.ComponentType;
  /** Grid 窗口内的内容渲染器,根据 contentType 选 */
  GridContent?: React.ComponentType<{ gridId: string; contentType: string }>;
  /**
   * 控制台三栏窗口中的模块视图(Phase 2.5)。
   * **必须**接 `ConsoleViewProps<TRoute>`,不再是裸 ComponentType。
   * 完整契约见 `docs/planning/sub-prds/console/PRD.md §7.2.1`。
   * 声明 `windows.console=true` 的 plugin 必须导出 ConsoleView,manifest CI 强校验。
   */
  ConsoleView?: React.ComponentType<ConsoleViewProps<unknown>>;
  /** 网页版中的模块视图(Phase 4.5,与 ConsoleView 同源,数据 driver 不同) */
  WebView?: React.ComponentType<ConsoleViewProps<unknown>>;
  /** 独立窗口内容(剪贴板面板 / 冥想全屏 / 设置...) */
  DedicatedWindow?: React.ComponentType;
  /** 设置面板模块(单个 section)。多 section 由 plugin 返回数组,见 §3.1.3。 */
  SettingsSection?: React.ComponentType<SettingsSectionProps>;
}

export interface PluginRegistration {
  manifest: PluginManifest;
  components: PluginComponents;

  /** Cmd+K 搜索 provider — 可选;不提供则 plugin 的实体不可被搜索 */
  searchProvider?: SearchProvider;

  /** Label 详情聚合 — 可选;若 plugin 的实体可被打 Label,**必须**提供 */
  labelEntityResolver?: LabelEntityResolver;

  /** 通知中心 tab — 可选;plugin-ai 等 plugin 用此动态注册 */
  notificationTab?: NotificationTab;
}
```

### 3.1.1 ConsoleViewProps(Phase 2.5 完整契约)

**source of truth**:`docs/planning/sub-prds/console/PRD.md §7.2.1`。
本节按 PRD §7.2.1 同步;若两处不一致以 PRD 为准。

```typescript
export interface ConsoleViewProps<TRoute = object> {
  /** Host 注入的能力面;ConsoleView 与外壳间唯一通道 */
  host: ConsoleHostCapabilities;
  /** 当前模块的子路由(从 console.nav_state.modulePath 投影) */
  route: TRoute;
  /** 写回子路由 */
  setRoute(updater: Partial<TRoute> | ((prev: TRoute) => TRoute), opts?: { replace?: boolean }): void;
  /** 三栏 slot:ConsoleView 选哪栏填什么 */
  slots: ConsoleSlotApi;
  /** 焦点 API */
  focusApi: FocusApi;
  /** 多选 API */
  selectionApi: SelectionApi;
  /** 错误边界 */
  errorBoundary: { reportError(err: Error, ctx?: object): void };
  /** Loading 边界 */
  loadingBoundary: { setLoading(loading: boolean): void };
  /** Telemetry */
  telemetry: TelemetryApi;
}

export interface ConsoleHostCapabilities {
  openModule<TR>(module: string, route?: TR): void;
  openSearch(opts?: { query?: string; providerFilter?: string[] }): void;
  showDialog(props: { title: string; body: React.ReactNode; actions: DialogAction[] }): Promise<DialogResult>;
  showToast(props: { kind: "info" | "success" | "warning" | "error"; message: string; ttlMs?: number; action?: { label: string; onClick: () => void } }): void;
  notify(props: { tabId: string; payload: unknown }): void;
  appearance: Readonly<{ theme: Theme; density: Density; accent: string; fontSize: "S" | "M" | "L" }>;
  t(key: string, params?: Record<string, unknown>): string;
  locale: Readonly<{ lang: "zh-CN" | "zh-TW" | "en-US"; dateFormat: string }>;
  data: CoreDataDriver;
  events: CoreEvents;
  account: Readonly<{ id: string; displayName: string; syncState: "idle" | "syncing" | "failed" }>;
}

export interface ConsoleSlotApi {
  setMid(component: React.ReactNode): void;
  setDetail(component: React.ReactNode | null): void;
  setListToolbar(component: React.ReactNode | null): void;
  setDetailToolbar(component: React.ReactNode | null): void;
  setFullCanvas(component: React.ReactNode | null): void;
}

export interface FocusApi {
  reportFocus(pane: "list" | "detail"): void;
  focusPane(pane: "list" | "detail"): void;
  onPaneBlur(cb: () => void): () => void;
}

export interface SelectionApi {
  setSelection(selection: { entityIds: string[]; entityType: string }): void;
  /**
   * v1 仅 "delete"(批删除);"addLabel" / "moveList" / "complete" 等批改字段动作
   * 已降 P2-Later(对齐父 PRD §5.2 line 189 "Todo 不做批量操作"),
   * 移交未来 plugin-bulk-ops。联合类型预留 string 不写死,避免 BREAKING。
   */
  onBatchAction(handler: (action: "delete" | string, payload: unknown) => Promise<void>): () => void;
}

export interface TelemetryApi {
  mark(name: string): void;
  measure(name: string, startMark: string, endMark: string): void;
  reportError(err: Error, ctx?: object): void;
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
}
```

### 3.1.2 SearchProvider(Cmd+K)

```typescript
export interface SearchProvider {
  providerId: string;            // "todo" | "label" | "project_card" | "settings" | ...
  displayName: string;
  group: number;
  enabled: boolean;
  search(query: string, opts: SearchOptions): Promise<SearchHit[]>;
}

export interface SearchOptions {
  limit: number;                 // 默认 5
  timeoutMs: number;             // 默认 200ms;超时 plugin-console 自动 abort
  signal: AbortSignal;
}

export interface SearchHit {
  providerId: string;
  entityId: string;
  title: string;
  subtitle?: string;
  matchScore: number;            // 0..1;v1 不用,跨 provider 排序留 v1.x
  navigate: { module: string; route: object };
}
```

### 3.1.3 SettingsSection

```typescript
export interface SettingsSection {
  sectionId: string;             // "appearance" | "account" | "sync" | ...
  order: number;
  group: "user" | "system" | "data" | "advanced";
  displayName: string;
  icon: string;
  Component: React.ComponentType<SettingsSectionProps>;
  searchKeywords?: string[];     // 给设置搜索(P1)用
}

export interface SettingsSectionProps {
  host: ConsoleHostCapabilities;
  onDirty: (dirty: boolean) => void;
  onClose: () => void;
}
```

### 3.1.4 NotificationTab(通知中心,动态注册)

```typescript
export interface NotificationTab {
  tabId: string;
  displayName: string;
  order: number;
  enabledWhen: () => boolean;    // plugin-ai 未启用时返回 false,tab 不渲染
  unreadCount: () => number;
  Component: React.ComponentType<NotificationTabProps>;
}

export interface NotificationTabProps {
  host: ConsoleHostCapabilities;
  onMarkAllRead: () => void;
  onClearUiState: () => void;    // 仅清 UI 已读标记,不动底层审计日志
}
```

### 3.1.5 LabelEntityResolver(Label 详情聚合)

```typescript
export interface LabelEntityResolver {
  entityType: string;            // "todo" | "habit" | "board_card" | ...
  displayName: string;
  resolve(labelId: string, opts: { limit: number; offset: number }): Promise<LabelEntityHit[]>;
  count(labelId: string): Promise<number>;
}

export interface LabelEntityHit {
  entityType: string;
  entityId: string;
  displayTitle: string;
  displaySubtitle?: string;
  navigate: { module: string; route: object };
}
```

### 3.2 PluginRegistry 公开 API

```typescript
// packages/core-registry/src/plugin-registry.ts

export interface PluginRegistry {
  /** 注册一个 Plugin —— Plugin 的 register.ts 入口调用 */
  register(manifest: PluginManifest, components: PluginComponents): void;

  /** 按 name 拿单个 Plugin */
  get(name: string): PluginRegistration | undefined;

  /** 拿所有 enabled = true 的 Plugin */
  getAllEnabled(): PluginRegistration[];

  /** 拿所有提供 OverlayLayer 的 Plugin(给主窗口用) */
  getOverlayLayers(): Array<{ name: string; Component: React.ComponentType }>;

  /** 拿所有提供 ControlWidget 的 Plugin(给 Control 窗口用) */
  getControlWidgets(): Array<{ name: string; Component: React.ComponentType }>;

  /** 拿所有声明 contentType X 的 Plugin */
  getByContentType(contentType: string): PluginRegistration[];

  /** 拿提供指定 dedicated window 的 Plugin(如 "clipboard") */
  getDedicatedWindowProvider(label: string): PluginRegistration | undefined;

  /** 拿所有出现在控制台 sidebar 的 Plugin(Phase 2.5,按 order 排序) */
  getConsoleSidebarEntries(): Array<{ name: string; manifest: PluginManifest; Component: React.ComponentType }>;

  /** 检查 manifest schema 合法性(CI / 启动期) */
  validateManifest(manifest: PluginManifest): { ok: true } | { ok: false; errors: string[] };
}

export const pluginRegistry: PluginRegistry;
```

### 3.3 PluginHost 渲染器

Host(`apps/desktop` 和 `apps/web`)**永远不感知具体 Plugin**,只通过下面这些 PluginHost 组件渲染:

```typescript
// packages/core-registry/src/plugin-host.tsx

/** 主窗口 overlay 用:渲染所有 OverlayLayer */
export function OverlayHost(): JSX.Element;

/** Control 窗口用:渲染所有 ControlWidget */
export function ControlHost(): JSX.Element;

/** Grid 窗口用:按 contentType 找到匹配 plugin,渲染其 GridContent */
export function GridHost(props: { gridId: string; contentType: string }): JSX.Element;

/** 控制台三栏窗口用:渲染 sidebar 导航 + 当前选中模块的 ConsoleView */
export function ConsoleHost(): JSX.Element;

/** 网页版用:与 ConsoleHost 同名同接口,但传入 REST data driver */
export function WebHost(): JSX.Element;

/** 独立窗口用(剪贴板面板 / 冥想全屏 / 设置...):按 label 找到匹配 plugin */
export function DedicatedHost(props: { windowLabel: string }): JSX.Element;
```

### 3.4 Plugin 注册示例(plugin-organizer)

```typescript
// packages/plugin-organizer/src/register.ts

import { pluginRegistry } from '@repo/core-registry';
import manifest from '../manifest.json';
import { OrganizerOverlay } from './components/OrganizerOverlay';
import { OrganizerControlWidget } from './components/ControlWidget';
import { GridContentRouter } from './components/GridContentRouter';

pluginRegistry.register(manifest, {
  OverlayLayer: OrganizerOverlay,
  ControlWidget: OrganizerControlWidget,
  GridContent: GridContentRouter,
});
```

```typescript
// apps/desktop/src/main.tsx —— Host 静态 import 所有 plugin 的 register

import '@repo/plugin-organizer/register';
import '@repo/plugin-labels/register';
import '@repo/plugin-productivity/register';
import '@repo/plugin-clipboard/register';
import '@repo/plugin-widgets/register';
import '@repo/plugin-calendar/register';
import '@repo/plugin-console/register';
import '@repo/plugin-project/register';
import '@repo/plugin-account/register';
import '@repo/plugin-ai/register';
// Host 此后只通过 PluginHost 渲染,不直接知道有哪些 plugin
```

### 3.5 PluginInstance / PluginCenter / AddToDesktop 契约（桌面入口模型）

> 本节定义未来 `桌面插件` 入口的 SDK 语义。它是**设计 / contract 层**，不是当前运行时实现。G1 SHIPPED 前保持文档对齐，不开插件功能开发。

#### 3.5.1 归属边界

| 能力 | Owner | 规则 |
|---|---|---|
| Mac App 控制面板的 `桌面插件` 入口 | `app` | App owns entry、窗口创建、位置、点击穿透、pin、权限提示 |
| Plugin Center 的内容目录 | `plugin` | 从 manifest / `PluginCenterEntry` 读取可添加插件、状态、settings schema |
| `添加到桌面` | `app` + `plugin` | App 创建窗口和 `PluginInstance`；插件只渲染实例内容 |
| 实例配置 schema | `plugin` | 插件声明可配置项；App 持久化 device-local 实例记录 |
| 第三方插件市场 | Future | MVP 不做 marketplace、远程安装、第三方包 |

#### 3.5.2 类型定义

```typescript
export type PluginInstanceStatus = "enabled" | "disabled" | "hidden";
export type PluginInstanceSize = "small" | "medium" | "large";
export type PluginWindowKind = "overlay" | "grid" | "dedicated";
export type PluginStyleMode = "system" | "light" | "dark" | "minimal";

export interface PluginPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  displayId?: string;
  spaceId?: string;
}

export interface PluginDataSource {
  /**
   * Plugin-owned selector, for example:
   * - time-progress.today
   * - countdown.<id>
   * - organizer.grid.<id>
   * - clipboard.local-history
   */
  type: string;
  params?: Record<string, unknown>;
}

export interface PluginInstanceBehavior {
  clickAction?: "open-app" | "open-plugin-center" | "none";
  clickThrough?: boolean;
  pinned?: boolean;
  visibleOnAllSpaces?: boolean;
}

export interface PluginInstanceStyle {
  mode: PluginStyleMode;
  opacity: number; // 0.35..1
  accent?: string;
}

export interface PluginInstance {
  id: string;
  pluginName: string;             // manifest.name
  contentType: string;            // manifest.contentTypes[n]
  windowKind: PluginWindowKind;
  status: PluginInstanceStatus;
  size: PluginInstanceSize;
  placement: PluginPlacement;
  dataSource: PluginDataSource;
  style: PluginInstanceStyle;
  behavior: PluginInstanceBehavior;
  schemaVersion: 1;
  syncScope: "device-local";
  createdAt: string;
  updatedAt: string;
}

export interface PluginSettingField {
  key: string;
  label: string;
  type: "select" | "toggle" | "slider" | "color" | "data-source";
  defaultValue: unknown;
  options?: Array<{ label: string; value: string }>;
}

export interface PluginCenterEntry {
  pluginName: string;
  displayName: string;
  description: string;
  status: "available" | "enabled" | "disabled" | "unavailable";
  maturity: "stable" | "planned" | "stub";
  category: "organizer" | "widgets" | "clipboard" | "pet" | "meditation";
  primaryAction: "add-to-desktop" | "enable" | "configure" | "unavailable";
  permissionWarnings?: string[];
  nativeRequirements?: string[];
  settingsSchema: PluginSettingField[];
}

export interface AddToDesktopRequest {
  pluginName: string;
  contentType: string;
  size?: PluginInstanceSize;
  dataSource?: PluginDataSource;
  style?: Partial<PluginInstanceStyle>;
  behavior?: Partial<PluginInstanceBehavior>;
}

export interface AddToDesktopResult {
  instance: PluginInstance;
  createdWindowLabel: string;
}
```

#### 3.5.3 MVP 行为规则

1. `PluginInstance.syncScope` 默认且必须为 `device-local`。升为 `account-sync` 只能经 sync 线 D4 gate。
2. `AddToDesktopRequest` 不直接创建原生能力；它只请求 App 使用现有窗口命令创建实例窗口。
3. MVP 只支持内置插件；不支持 marketplace、远程安装、第三方 bundle、拖拽到桌面作为主路径。
4. MVP 添加方式是点击 `添加到桌面` 后自动落位；拖拽添加、多显示器 Space 绑定和复杂布局编辑器延后。
5. 禁用实例保留配置；删除实例才移除配置。
6. Clipboard MVP 前必须统一实体命名：core-data 当前以 `clipboard.item` 表达 device-local 剪贴板实体，`plugin-clipboard` 内出现的 `clipboard.entry` 需在实现前 reconcile。

#### 3.5.4 Plugin Center 信息架构

| 区域 | 数据来源 | MVP 内容 |
|---|---|---|
| 推荐 / 可添加 | `PluginCenterEntry[]` | 内置插件卡片、maturity、权限提示、主按钮 |
| 已启用 | `PluginInstance[]` | 实例名、插件名、尺寸、位置、状态 |
| 插件详情 | manifest + `PluginCenterEntry` | 预览、简介、`添加到桌面`、依赖、权限 |
| 实例设置 | `PluginInstance` + `settingsSchema` | 尺寸、位置、透明度、样式、数据来源、行为 |
| 全局偏好 | App Settings | 默认透明度、默认点击穿透、显示/隐藏所有桌面插件 |

---

## 4. EventMap — 跨 Plugin 事件契约表

所有跨 Plugin / 跨窗口事件**必须**在 `@repo/core-events/EventMap` 中定义类型,emit/listen 编译期检查。

### 4.1 EventMap 总览(按 plugin 分组)

```typescript
// packages/core-events/src/event-map.ts

export interface EventMap {
  // ─── app:* 全局/Host ─────────────────────────
  'app:interactive-mode-changed': { interactive: boolean };
  'app:theme-changed': { theme: ThemeConfig };
  'app:overlay-visibility-toggled': { visible: boolean };
  'app:screen-being-recorded': { isRecording: boolean };

  // ─── organizer:* 智能桌面整理 ─────────────────
  'organizer:grid-created': { gridId: string; rect: Rect };
  'organizer:grid-update': { gridId: string; changes: Partial<GridBox> };
  'organizer:grid-close': { gridId: string };
  'organizer:grid-window-ready': { gridId: string };
  'organizer:file-drop': { gridId: string; paths: string[] };
  'organizer:auto-classify-requested': { ruleId?: string };

  // ─── productivity:* Todo + 番茄 + 习惯 ────────
  'productivity:todo-created': { todoId: string };
  'productivity:todo-updated': { todoId: string; changes: Partial<Todo> };
  'productivity:todo-completed': { todoId: string; completedAt: number };
  'productivity:todo-deleted': { todoId: string };
  'productivity:pomodoro-started': { sessionId: string; taskId: string | null; duration: number };
  'productivity:pomodoro-completed': { sessionId: string; interruptions: number };
  'productivity:pomodoro-cancelled': { sessionId: string };
  'productivity:habit-logged': { habitId: string; loggedAt: number; count: number };

  // ─── clipboard:* 剪贴板 ───────────────────────
  'clipboard:item-added': { itemId: string; type: ClipboardItemType };
  'clipboard:item-pinned': { itemId: string; pinned: boolean };
  'clipboard:item-deleted': { itemId: string };
  'clipboard:recording-paused': { paused: boolean };
  'clipboard:panel-toggled': { visible: boolean };

  // ─── labels:* 全局 Label ──────────────────────
  'labels:created': { labelId: string };
  'labels:updated': { labelId: string };
  'labels:deleted': { labelId: string };
  'labels:assigned': { labelId: string; entityType: string; entityId: string };
  'labels:unassigned': { labelId: string; entityType: string; entityId: string };

  // ─── widgets:* 时钟/天气/便签/进度条/桌宠/冥想 ─
  'widgets:clock-tick': { utc: number };
  'widgets:weather-updated': { cityId: string };
  'widgets:note-saved': { noteId: string };
  'widgets:progress-updated': { trackerId: string; percent: number };
  'widgets:meditation-started': { duration: number };
  'widgets:meditation-ended': { reason: 'completed' | 'user-exit' };
  'pet:state-changed': { state: 'idle' | 'thinking' | 'happy' | 'sleeping' };
  'pet:hatched': { petId: string };                  // Phase 4

  // ─── calendar:* 桌面日历 ──────────────────────
  'calendar:view-changed': { view: 'year' | 'month' | 'week' | 'day' | 'agenda' };
  'calendar:aggregated-refresh': { from: number; to: number };

  // ─── console:* 整体控制台 ─────────────────────
  'console:navigate-module': { module: string };
  'console:sidebar-toggled': { collapsed: boolean };

  // ─── project:* 项目管理 ───────────────────────
  'project:board-created': { boardId: string };
  'project:card-created': { cardId: string; listId: string };
  'project:card-moved': { cardId: string; fromListId: string; toListId: string };
  'project:card-archived': { cardId: string };

  // ─── account:* 账号 + 同步 ────────────────────
  'account:logged-in': { userId: string };
  'account:logged-out': { userId: string };
  'account:sync-started': { kind: 'push' | 'pull' };
  'account:sync-completed': { kind: 'push' | 'pull'; durationMs: number };
  'account:sync-failed': { kind: 'push' | 'pull'; error: string };

  // ─── ai:* AI Cube ─────────────────────────────
  'ai:query-sent': { queryId: string };
  'ai:query-response': { queryId: string; text: string };
  'ai:cost-warning': { monthlyUsedUsd: number; budgetUsd: number };

  // ─── web:* 网页版专属(Phase 4.5)─────────────
  'web:realtime-connected': { userId: string };
  'web:realtime-disconnected': { reason: string };
}
```

### 4.2 emit / listen 类型化封装

```typescript
// packages/core-events/src/emitter.ts

import { emit, listen } from '@tauri-apps/api/event';
import type { EventMap } from './event-map';

/** 编译期保证 event name 和 payload 类型匹配 */
export async function emitEvent<K extends keyof EventMap>(
  event: K,
  payload: EventMap[K]
): Promise<void> {
  await emit(event, payload);
}

/** Hook 监听某事件 */
export function useEventListener<K extends keyof EventMap>(
  event: K,
  handler: (payload: EventMap[K]) => void
): void {
  // useEffect + listen + cleanup
}

/** 非 hook 监听(适合 Rust 后端 callback) */
export function on<K extends keyof EventMap>(
  event: K,
  handler: (payload: EventMap[K]) => void
): () => void;
```

### 4.3 事件命名规则(强制)

- 格式:`<plugin>:<verb-or-noun>`,如 `organizer:grid-update`、`labels:assigned`
- **禁止** 跨 plugin 用别人的前缀
- 一个事件只能被一个 plugin 拥有(`organizer:` 只能由 plugin-organizer emit;别人只能 listen)
- 大小写:全小写 + 短横分隔
- 新增事件必须**先**在 EventMap 加类型,**再**在 manifest 的 `events.emit / listen` 声明,**最后**才能在代码里用

---

## 5. Tauri Commands 契约

### 5.1 命名规则

- 格式:`<domain>_<verb>`,如 `create_grid_window`、`read_file_metadata`
- 每个命令在 manifest `tauriCommands` 声明
- Rust 侧实现在 `src-tauri/src/commands/<domain>.rs`
- 类型化 invoke 走 `@repo/core/hooks/useTauriInvoke`

### 5.2 命令契约表(示例 — 完整表在 CORE_INFRA.md 维护)

| Command | 输入 | 输出 | 错误 | 归属 |
|---|---|---|---|---|
| `create_grid_window` | `{id, rect, title}` | `{ok: true}` | `WindowAlreadyExists` | window |
| `update_grid_window` | `{id, rect?, title?, isLocked?}` | `{ok: true}` | `WindowNotFound` | window |
| `close_grid_window` | `{id}` | `{ok: true}` | `WindowNotFound` | window |
| `read_file_metadata` | `{path}` | `FileMetadata` | `AccessDenied / NotFound` | fs |
| `clipboard_read_current` | `{}` | `ClipboardContent` | `PasteboardEmpty` | clipboard |
| `notify` | `{title, body, ...}` | `{ok: true}` | `PermissionDenied` | notification |

### 5.3 错误统一格式

```rust
#[derive(Serialize, thiserror::Error)]
pub enum AppError {
    #[error("E1001 window not found: {0}")]
    WindowNotFound(String),
    #[error("E2001 access denied: {0}")]
    AccessDenied(String),
    #[error("E3001 sync failed: {0}")]
    SyncFailed(String),
    // ...
}
```

Error code 分级:`E1xxx` 系统 / `E2xxx` 业务 / `E3xxx` 同步 / `E4xxx` AI(详见 TECHNICAL_REQUIREMENTS §3.3.2)。

---

## 6. Plugin 内部标准目录结构

```
packages/plugin-<name>/
├── package.json                    # "name": "@repo/plugin-<name>"
├── tsconfig.json
├── manifest.json                   # ★ Plugin 唯一对外声明(§2)
├── src/
│   ├── index.ts                    # ★ Plugin 唯一公开出口(barrel + re-export)
│   ├── register.ts                 # ★ PluginRegistry.register() 调用
│   ├── components/                 # 组件(包括 Overlay/Control/Grid/Console/Web/Dedicated 各 view)
│   │   ├── <Name>Overlay.tsx
│   │   ├── <Name>ControlWidget.tsx
│   │   ├── <Name>ConsoleView.tsx
│   │   └── ...
│   ├── hooks/                      # Plugin 私有 hooks
│   ├── store/                      # Plugin 私有 Zustand slice
│   ├── repo/                       # 数据访问(走 core-data,不直接 SQL)
│   ├── types.ts                    # Plugin 局部类型(全局类型在 core-types)
│   └── i18n/                       # 文案(zh-CN / zh-TW / en)
├── docs/
│   ├── design.md                   # ★ 业务流 + 架构蓝图
│   ├── api.md                      # ★ 接口契约(emit/listen/tauri commands)
│   ├── test.md                     # ★ 测试大纲
│   └── dev_log.md                  # ★ 开发日志(AI 短期记忆)
└── tests/
    ├── components/
    ├── hooks/
    ├── store/
    └── integration/
```

**强制规则**:
- `index.ts` 是 Plugin 唯一公开面 —— 外部只能从 `@repo/plugin-<name>` 顶层 import,不允许深路径 `@repo/plugin-<name>/src/components/Foo`
- `register.ts` 是注册副作用 —— Host 通过 `import '@repo/plugin-<name>/register'` 触发
- Plugin 内部目录其他文件 **不暴露**

---

## 7. Plugin 独立测试要求

### 7.1 必备测试集

每个 Plugin **必须**:
- Components 单测 ≥ 60%(组件渲染 + 关键交互)
- Hooks 单测 ≥ 80%
- Store 单测 ≥ 80%(action / selector / 持久化)
- 至少 1 个集成测试(emit → listen 跨事件流)

详见 TECHNICAL_REQUIREMENTS §1.1。

### 7.2 独立可测(关键)

> Plugin 必须能**在没有 Tauri、没有别的 plugin** 的环境下单独 `pnpm test` 跑通。

实现办法:
1. Plugin 代码 **零 import** `@tauri-apps/api`(走 `@repo/core/hooks` 封装)
2. 测试时给 `@repo/core` mock 一个空实现(`vitest.config` setupFiles)
3. 跨 Plugin 事件用 `@repo/core-events` 的 in-memory test driver,而非 Tauri event

**示例:**

```typescript
// packages/plugin-productivity/tests/setup.ts
import { vi } from 'vitest';

vi.mock('@repo/core-events', async () => {
  const { createInMemoryEventBus } = await import('@repo/core-events/testing');
  return createInMemoryEventBus();
});

vi.mock('@repo/core-data', async () => {
  const { createInMemoryRepo } = await import('@repo/core-data/testing');
  return createInMemoryRepo();
});
```

这样 plugin-productivity 完全离线、无 Tauri、不依赖任何其他 plugin,就可以独立 `pnpm --filter @repo/plugin-productivity test` 跑通。

### 7.3 跨 Plugin 契约测试

通过 EventMap 联动的 Plugin 需要写**契约测试**:
- 我 emit 的事件 payload 符合 EventMap 类型
- 我 listen 的事件能 mock 触发并断言状态变化

不需要真把别的 Plugin 启动起来。

---

## 8. "如何新增一个 Plugin" SOP

> 这就是你最初想要的 **"傻瓜式新增 feature"** 流程。给 AI Coding 工具喂这一节 + 一个现有 plugin 作为参考样板,就能产出新 Plugin。

### 步骤

```
1. 取名字 → plugin-<name>(kebab-case)

2. 复制模板:
   cp -r packages/plugin-organizer packages/plugin-<name>
   # 或从 docs/templates/plugin-template/ 复制(Phase 0 末提供)

3. 改 manifest.json:
   - name / displayName / description
   - contentTypes
   - windows.{overlay|control|grid|console|web|dedicated}
   - events.{emit|listen} —— 先写,代码后实现
   - tauriCommands(如需新 Rust 命令,同步开 PR)
   - shortcuts / labelableEntityTypes / data / permissions / platforms

4. 写四件套 docs/(必须):
   - design.md  业务流 + 架构蓝图
   - api.md     emit/listen/tauri commands 详细
   - test.md    测试大纲
   - dev_log.md 状态:Planned → In-Dev → Testing → Stable

5. 实现 src/:
   - register.ts —— pluginRegistry.register(manifest, components)
   - components/<Name>OverlayLayer.tsx + ControlWidget.tsx + ...
   - hooks / store / repo / types

6. 写测试 tests/:
   - 至少覆盖到 §7.1 要求

7. 在 apps/desktop/src/main.tsx 加一行:
   import '@repo/plugin-<name>/register';

8. (可选)在 apps/web/main.tsx 也加一行(网页版)

9. 更新 docs/PLUGIN_MAP.md:
   - Plugins 表加一行,状态 Planned

10. 提 PR:
    - 自动 lint / typecheck / 测试
    - manifest schema 验证(CI)
    - EventMap 类型一致性(CI)
    - 真机自测(每 Phase 验收以此为准)
```

**给 AI Coding 工具的"喂养包"**(对应你最初的"简化版 A + B 的 prompt"模式):

```
- docs/SYSTEM_ARCHITECTURE.md   (宪法)
- docs/PLUGIN_SDK.md            (本文档,接口契约)
- docs/CORE_INFRA.md            (基础设施 API 路径)
- packages/plugin-organizer/    (一个完整可用的样板 plugin)
- docs/templates/plugin-template/(空白模板,Phase 0 末提供)
- 新 Plugin 的 design.md(你的需求)
```

→ AI Coding 能输出一份独立可测的新 Plugin,你只需 review 后合并。

---

## 9. 各模块 manifest 声明示例(16 模块)

> 每个新建 Plugin 时,在自己包根目录写 manifest.json。下面是 16 个模块的关键字段速查。

### 9.1 智能桌面整理(plugin-organizer)

```jsonc
{
  "name": "organizer",
  "contentTypes": ["file-grid", "app-grid", "folder-grid", "url-grid"],
  "windows": { "overlay": true, "control": true, "grid": true },
  "events": {
    "emit": ["organizer:grid-created", "organizer:grid-update", "organizer:file-drop", ...],
    "listen": ["app:overlay-visibility-toggled", "labels:assigned"]
  },
  "tauriCommands": ["create_grid_window", "update_grid_window", "close_grid_window", "read_file_metadata"],
  "shortcuts": [{ "id": "new-grid", "default": "Cmd+Shift+N" }, { "id": "toggle-overlay", "default": "Cmd+Shift+D" }],
  "labelableEntityTypes": ["grid_item"],
  "permissions": { "fullDiskAccess": true }
}
```

### 9.2 待办 Todo + 番茄 + 习惯(plugin-productivity)

```jsonc
{
  "name": "productivity",
  "contentTypes": ["todo-list", "pomodoro-capsule", "habit-tracker", "matrix-view"],
  "windows": { "control": true, "grid": true, "console": true, "web": true },
  "events": {
    "emit": ["productivity:todo-*", "productivity:pomodoro-*", "productivity:habit-*"],
    "listen": ["labels:assigned", "calendar:view-changed"]
  },
  "shortcuts": [{ "id": "quick-add-todo", "default": "Cmd+Shift+T" }, { "id": "toggle-pomodoro", "default": "Cmd+Shift+P" }],
  "labelableEntityTypes": ["todo", "habit"],
  "data": { "tables": ["todos", "lists", "todo_reminders", "pomodoro_sessions", "habits", "habit_logs"] }
}
```

### 9.3 剪贴板(plugin-clipboard)

```jsonc
{
  "name": "clipboard",
  "contentTypes": ["clipboard-item"],
  "windows": { "dedicated": "clipboard" },
  "events": { "emit": ["clipboard:*"], "listen": ["app:screen-being-recorded"] },
  "tauriCommands": ["clipboard_read_current", "clipboard_subscribe_changes", "vision_ocr"],
  "shortcuts": [{ "id": "open-panel", "default": "Cmd+Shift+V" }],
  "permissions": { "screenRecording": true, "accessibility": true },
  "platforms": { "macos": "full", "web": "none" }
}
```

### 9.4 全局 Label(plugin-labels)

```jsonc
{
  "name": "labels",
  "windows": { "console": true, "web": true },
  "events": {
    "emit": ["labels:created", "labels:updated", "labels:deleted", "labels:assigned", "labels:unassigned"],
    "listen": ["organizer:grid-close", "productivity:todo-deleted", "clipboard:item-deleted", "project:card-archived"]
  },
  "data": { "tables": ["labels", "label_assignments"] }
}
```

### 9.5 桌面日历(plugin-calendar)

```jsonc
{
  "name": "calendar",
  "contentTypes": ["calendar-month", "calendar-week", "calendar-agenda"],
  "windows": { "control": false, "grid": true, "console": true, "web": true },
  "events": { "emit": ["calendar:*"], "listen": ["productivity:todo-*", "productivity:habit-logged", "productivity:pomodoro-completed"] },
  "dependencies": ["@repo/core", "@repo/plugin-productivity"]
}
```

### 9.6 整体控制台(plugin-console)

```jsonc
{
  "name": "console",
  "windows": { "dedicated": "console", "web": true },
  "events": { "emit": ["console:*"], "listen": [] },
  "shortcuts": [{ "id": "open-console", "default": "Cmd+Shift+Space" }],
  "ui": { "consoleSidebar": null },
  "dependencies": ["@repo/core", "@repo/ui"]
}
```

### 9.7 项目管理(plugin-project)

```jsonc
{
  "name": "project",
  "contentTypes": ["kanban-board", "board-card", "board-table"],
  "windows": { "console": true, "grid": true, "web": true },
  "events": { "emit": ["project:*"], "listen": ["labels:assigned", "productivity:todo-completed"] },
  "labelableEntityTypes": ["board_card"],
  "data": { "tables": ["boards", "board_lists", "board_cards", "board_card_checklist"] }
}
```

### 9.8 网页版(apps/web,非 plugin)

```jsonc
// apps/web/manifest 不严格遵 plugin 格式,但要在 console 模式下复用 plugin-* 的 ConsoleView/WebView
// 详见 ADR-0003 三个面架构
```

### 9.9 AI 桌面宠物(独立包 plugin-pet — ADR-0015)

> **决策 ADR-0015(web 侧 Accepted 2026-06-02):桌宠是独立插件包 `packages/plugin-pet`,不是 plugin-widgets 的子模块。** 该包代码已存在(stateMachine / PetAvatar / PetBubble / PetPanel / PetAiReaction);它有自己的状态机 + AI persona 生命周期(FR-PET-09~11 依赖 ai-cube)+ 数据表 `pets` / `pet_memory`(主 PRD §5.16)。`desktop-pet` 不再列在 plugin-widgets 的 contentTypes 内。

```jsonc
{
  "name": "pet",
  "windows": { "overlay": true },
  "contentTypes": ["desktop-pet"],
  "events": { "emit": ["pet:*"], "listen": ["productivity:pomodoro-*", "account:sync-*", "ai:query-*"] },
  "dependencies": ["@repo/core"]
}
```

### 9.10 AI Cube(plugin-ai)

```jsonc
{
  "name": "ai",
  "contentTypes": ["ai-chat", "ai-action"],
  "windows": { "overlay": true, "console": true, "web": true },
  "events": { "emit": ["ai:*"], "listen": ["clipboard:item-added", "organizer:file-drop", "pet:state-changed"] },
  "dependencies": ["@repo/core", "@repo/plugin-widgets"]
}
```

### 9.11 账号 + 云同步(plugin-account)

```jsonc
{
  "name": "account",
  "windows": { "console": true, "web": true },
  "events": { "emit": ["account:*"], "listen": ["productivity:*", "organizer:*", "labels:*", "project:*", "widgets:note-saved"] },
  "permissions": { "sandboxEntitlements": ["com.apple.security.network.client"] },
  "data": { "tables": ["accounts", "sync_state"], "endpoints": ["/auth/*", "/sync/*"] }
}
```

> plugin-widgets 的 sub-widget(时钟 / 天气 / 便签 / 时间进度条 / 冥想)在其 manifest 用 contentTypes 列(`["clock","weather","note","progress-tracker","meditation"]`);**桌宠 desktop-pet 已移出 widgets,改由独立包 plugin-pet 承载**(见上 §9.9 / ADR-0015)。

---

## 10. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v1.0 | 首版,9 章:SDK 总览 + manifest 规范 + Registry API + EventMap + Tauri Commands + 目录结构 + 测试要求 + SOP + 16 模块示例 |

— END —
