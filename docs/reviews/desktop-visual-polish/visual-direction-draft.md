# Visual Direction — desktop-visual-polish (DRAFT)

| 字段 | 值 |
|---|---|
| 状态 | DRAFT(pre-brief 草案,等待 owner 拍板后纳入 Step 0 brief 作为 P0 锚点) |
| 日期 | 2026-05-22 |
| 范围 | 桌面 overlay:AI Cube + Control 窗口 + Settings 面板 + SmartContainer + GridItem + 右键菜单 + resize handle |
| 不在范围 | Console 独立版 + Web 版(归 console/web roadmap,参照滴答清单,不在本 feature) |
| 参照 | **腾讯桌面整理(统一设计语言,Cube 也用同语言)** |
| 关联 | `docs/reviews/desktop-ux-rebuild-audit-2026-05-21.md`(上一程序审计) · `docs/reviews/desktop-ux-rebuild/20260521-feature-brief.md` |

---

## 1. 视觉性格(Mood)

用一行话定位:**"macOS 原生玻璃质感 × 腾讯桌面整理的容器秩序"**。

关键词(每个都是设计决策时的判据):

- **有秩序**(orderly)—— 容器边界清晰,内容分区明确,**不**追求活泼装饰
- **半透明、轻盈**(translucent · light)—— 用 macOS vibrancy 而非 Windows acrylic;不堆叠重影
- **克制**(restrained)—— 单一品牌色 + 灰阶,**不**用彩色按钮 / 渐变背景 / 多色 emoji 做功能图标
- **真实**(material-honest)—— 不假装拟物,但容器/按键的层级靠真实的 elevation 而不是边框堆
- **macOS 原生感**(at home on macOS)—— SF Symbols、SF Pro、原生 vibrancy material、HIG 的命中区与间距

视觉**不**做的事(do-not list):

- ❌ 复刻腾讯桌面的 Windows acrylic 浅蓝渐变质感
- ❌ 用 emoji(🔒🔓⌄⌃🪟🧹📂)做功能图标
- ❌ 容器叠加多层粗描边或多色边框
- ❌ 红色 ✕ 关闭按钮始终可见(放右键菜单或 hover 才出现)
- ❌ 醒目白色圆点 resize handle(IX5)
- ❌ 调试 telemetry / prototype panel 任何残留(已清,持续守护)

---

## 2. 借鉴腾讯桌面的"什么",**不**借鉴"什么"

**借鉴(structure / concept)**:

| 来自腾讯桌面 | 落在 XAI |
|---|---|
| 桌面分区容器(圆角、标题头、容器内 icon grid) | SmartContainer 主形态 |
| 标题头 + 右上控件区 | Grid 头部布局 |
| 拖拽吸附边缘 + 收纳到边的"隐藏栏" | FR-DT-10(已实现,视觉收敛) |
| 简洁文件 chip(图标 + 文件名 2 行截断) | GridItem |
| 一键整理入口 | OrganizerOneClick(已有,样式对齐) |

**不**借鉴(visual material):

| 腾讯桌面是 Windows 风 | XAI 用 macOS 风替换 |
|---|---|
| 浅蓝/白 acrylic 渐变 | macOS vibrancy `hudWindow` / `popover` |
| 直角 8px 圆角 | squircle 风 10–14px |
| 像素级图标(自家图标集) | SF Symbols + 自家 brand mark |
| 默认浅色、对深色桌面失重 | 明/暗双套,默认跟随系统 |

---

## 3. 设计语言(具体值,token 候选)

### 3.1 Color tokens

**Light(浅色 / 跟随系统 light)**

| Token | Value | 用途 |
|---|---|---|
| `surface.elevated` | `rgba(255,255,255,0.72)` + macOS `popover` vibrancy | SmartContainer / SettingsPanel / 右键菜单 |
| `surface.muted` | `rgba(255,255,255,0.5)` | 容器内分区底 |
| `border.subtle` | `rgba(0,0,0,0.06)` | 容器/按钮默认描边 |
| `border.emphasis` | `rgba(0,0,0,0.12)` | hover/focus 描边 |
| `text.primary` | `#1A1B22` | 标题/正文 |
| `text.secondary` | `#5E6470` | 副信息 |
| `text.tertiary` | `#9AA0AB` | 占位/弱提示 |
| `accent` | `#2F7BFF` | 主品牌色(克制蓝,候选 `#3478F6` iOS 蓝) |
| `accent.muted` | `rgba(47,123,255,0.12)` | accent 背景态 |
| `state.danger` | `#E5484D` | 删除/危险 |
| `state.warning` | `#F5A623` | |
| `state.success` | `#3DB87A` | |
| `overlay.scrim` | `rgba(15,18,28,0.36)` | 弹层背景蒙板(罕用) |

**Dark(深色 / 跟随系统 dark)**

| Token | Value | 用途 |
|---|---|---|
| `surface.elevated` | `rgba(28,30,38,0.78)` + macOS `underWindowBackground` vibrancy | 同 light |
| `surface.muted` | `rgba(28,30,38,0.56)` | |
| `border.subtle` | `rgba(255,255,255,0.08)` | |
| `border.emphasis` | `rgba(255,255,255,0.16)` | |
| `text.primary` | `#EDEFF3` | |
| `text.secondary` | `#A8AEBA` | |
| `text.tertiary` | `#6B7280` | |
| `accent` | `#4C90FF` | dark 下提亮 |
| `state.danger` | `#F26E72` | |
| `state.warning` | `#FFB840` | |
| `state.success` | `#52C28C` | |

### 3.2 Typography

家族:`SF Pro Text` / `SF Pro Display`(系统) + `PingFang SC`(中文,系统默认)。**不引入自定义字体**。

| Token | Size | Weight | Line | 用途 |
|---|---|---|---|---|
| `text.titleLg` | 14 | 600 | 20 | SmartContainer 标题 |
| `text.titleMd` | 13 | 600 | 18 | SettingsPanel section header |
| `text.body` | 13 | 400 | 18 | 正文 |
| `text.label` | 12 | 500 | 16 | GridItem 标题、按钮 label |
| `text.caption` | 11 | 400 | 14 | 副信息、类型、路径 |
| `text.mono` | 11 | 400 | 14 | 路径/code(SF Mono) |

数字字 tabular-nums。

### 3.3 Radius

| Token | Value | 用途 |
|---|---|---|
| `radius.xs` | 4 | 微小 chip |
| `radius.sm` | 6 | 输入框、小标签 |
| `radius.md` | 8 | 按钮、icon-button |
| `radius.lg` | 10 | GridItem chip |
| `radius.xl` | 14 | SmartContainer / SettingsPanel |
| `radius.cube` | 18 | AI Cube(略 squircle) |
| `radius.pill` | 999 | switch / pill 按钮 |

### 3.4 Elevation

容器主要靠 frosted glass 区分,**不**靠堆叠多层阴影。阴影只用在 hover / dragging / menu。

| Token | Shadow | 用途 |
|---|---|---|
| `elev.0` | none | 休态、嵌入容器内的元素 |
| `elev.1` | `0 1px 2px rgba(0,0,0,0.06), 0 1px 6px rgba(0,0,0,0.04)` | 容器休态(可选) |
| `elev.2` | `0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.10)` | hover / 活态 |
| `elev.3` | `0 6px 16px rgba(0,0,0,0.14), 0 24px 60px rgba(0,0,0,0.18)` | dragging / popover menu |

dark 模式下阴影 alpha 加倍以保留分层感。

### 3.5 Spacing

base 4。允许刻度:`4, 6, 8, 12, 16, 20, 24, 32`(`6` 仅用于精细控件内填充,不用于容器主结构)。

| Token | Value | 典型用途 |
|---|---|---|
| `space.xs` | 4 | icon 与文字间隙 |
| `space.sm` | 8 | 按钮内填充 |
| `space.md` | 12 | 容器内分区间距 |
| `space.lg` | 16 | 容器 padding |
| `space.xl` | 24 | section 之间 |

### 3.6 Motion

允许的曲线 + 时长。**所有过渡只能从这里挑**,不允许自由组合。

| Token | Curve | Duration | 用途 |
|---|---|---|---|
| `motion.fade` | `ease-out` | 160ms | 显示/隐藏 |
| `motion.pop` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | 180ms | 按钮按下/弹起 |
| `motion.spring` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 220ms | 主 UI 状态切换 |
| `motion.springLong` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 280ms | 容器开合 |
| `motion.snap` | `cubic-bezier(0.32, 0.72, 0, 1)` | 280ms | 边缘吸附、释放回弹 |

**拖拽期间不带 transition**(避免延迟感),释放回弹用 `motion.snap`。

### 3.7 Iconography

- **SF Symbols** 作为功能图标主集合(`xmark` / `lock` / `lock.open` / `chevron.up` / `chevron.down` / `square.grid.2x2` / `list.bullet` / `ellipsis` / `arrow.up.left.and.arrow.down.right` / `doc` / `folder` / `photo` / `app`)。
- line weight `medium` / size 16,按钮内 size 14。
- 文件类型图标用 SF Symbols 同一族 + macOS 原生 NSWorkspace icon(真实文件时)。
- **不**用 emoji 做功能图标。emoji 仅在用户自定义 Grid 标题前缀这种"用户输入"场景允许。

---

## 4. 组件方向(每个组件的视觉方案)

### 4.1 AI Cube(60×60,radius 18)

```
休态:
  - background: surface.elevated 浅,加 1px inner stroke rgba(255,255,255,0.5)(light) / rgba(255,255,255,0.1)(dark)
  - 内容:品牌图标(SF symbol 或 brand mark,16px),text.primary
  - 阴影:elev.1
  - 微 squircle (radius 18)
hover:
  - scale 1.02, elev.2, 内部高光带渐显
panel-open:
  - accent 2px ring(`accent.muted` 内描边)
  - 不变形,只加 ring
状态态射(thinking / error):
  - 环边色变 accent / state.danger,呼吸动画 motion.spring 循环
```

**不**用纯文字 "AI"(audit V9 已记)。需要 brand mark asset(open question)。

### 4.2 SmartContainer(Grid 卡)

```
容器:
  - radius xl(14),surface.elevated + vibrancy
  - border 1px border.subtle
  - elevation:elev.0 休态、elev.2 hover、elev.3 dragging
  - 不再有红色 debug 边框/opacity-50(已清)
标题头(height 36):
  - padding 12/8
  - 标题字 titleLg,左可选 16px symbol(空可缺省)
  - 右上 3 个常用按键(28×28 icon-button,radius md):
      [折叠 chevron] [锁 lock] [关闭 xmark]
  - "···" 溢出菜单挪到右键(audit IA5,…只装 Close 太浪费)
按钮态:
  - 休态:无背景,只有 icon(text.secondary)
  - hover:背景 border.subtle,icon 升至 text.primary
  - 关闭按钮 hover 才出 state.danger 色,不常驻红色
内容区(grid view):
  - padding 12,gridTemplateColumns: repeat(auto-fill, minmax(96, 1fr)),gap 12
内容区(list view):
  - row 32,gap 8
拖动:
  - 容器整体 opacity 1(不淡化),elev.3,光标变 grabbing
```

### 4.3 GridItem(文件 chip)

```
休态:
  - radius lg(10),padding 8,minHeight 76
  - 缩略图区 32×32(图片/PDF/视频真实缩略图,落 FR-DT-11)
    fallback:SF Symbol(`photo` / `doc` / `folder` / `app`)
  - 标题 label(12/500),2 行 ellipsis(已修)
  - 副信息 caption(11/400),text.secondary
hover:
  - 背景 rgba(0,0,0,0.04)(light)/ rgba(255,255,255,0.06)(dark)
selected / drop-target:
  - 2px accent ring
dragging:
  - opacity 0.85, elev.2
按钮(Task/Tags 等):
  - chip(radius sm)无背景,只在 hover 时显出
  - 不是常驻小按钮(audit IA8 风格不统一)
```

### 4.4 SettingsPanel

```
布局:
  - 改用 List + Section(audit IA2 单卡混装 5 类),分:
      [画布操作](新建 Grid / 清空)→ 单独区块,顶部
      [外观 - AI Cube](颜色/文字色/不透明度/尺寸/字号)
      [外观 - Grid](背景不透明度/玻璃)
      [偏好]
  - section header:caption + uppercase letter-spacing 0.5,text.tertiary
  - row height 36,padding 12
控件(macOS 风):
  - slider:macOS 原生外观(已用 input range,套 accent-color)
  - switch:pill 风
  - color picker:圆形 swatch(28px),点击展开 macOS picker
顶部关闭:
  - 12×12 SF symbol xmark,右上,无背景
mock 调试块:
  - 已删(adfaff7 已清 .debug-note)
```

### 4.5 右键菜单(Grid + Item)

```
形态:
  - popover vibrancy + 1px border.subtle,radius md
  - 行高 28,padding 12/6
  - icon(14px) + label(text.body) + 快捷键(caption right)
  - 分隔线:1px border.subtle,marginY 4
内容(Grid · PRD §5.1.2 全集):
  - 重命名 · 删除 · 锁定/解锁 · 设置
内容(Item · PRD §5.1.2 全集):
  - 在 Finder 显示 · 打开 · 移除
hover 行:
  - 背景 accent.muted,文字 accent(macOS HIG 风,而非全 highlight 蓝底白字)
```

### 4.6 Resize Handle

```
休态:
  - 隐藏(无视觉)
hover 容器边缘 8px 内:
  - 鼠标变 resize 光标
  - 右下角显出 1 个 14×14 SF symbol "arrow.up.left.and.arrow.down.right",text.tertiary
  - 八向命中区:invisible 8px hot zone 四边 + 14px 四角
拖动:
  - 显示尺寸提示 chip(`240 × 320`,radius sm,surface.elevated,elev.2),容器右下角浮出
释放:
  - 提示淡出 motion.fade 160ms
```

**不**保留 20px 醒目白圆 + 绿 hover(IX5 收敛)。

---

## 5. 明/暗 + 桌面背景适应策略

**默认**:跟随系统 `prefers-color-scheme`(`prefersColorScheme` listener)。

**用户手动 override**:SettingsPanel 内一个 segmented control —— `跟随系统 / 浅 / 深`。

**背景适应**(可选 P2 升级):

| 选项 | 实现成本 | 效果 |
|---|---|---|
| A · 仅跟随系统 | 极低 | 深色桌面 + light 主题会失重 |
| B · 跟随系统 + 用户手动(推荐) | 低 | 用户兜底 |
| C · 自适应桌面壁纸平均亮度 | 高,需 Rust 取桌面采样 | 体验最丝滑,但触及屏幕捕获权限 |

**推荐 B**;C 作为 future enhancement,不在本 feature 内。

---

## 6. 视觉验收 AC 草拟(将进入 Step 0 brief 强制清单)

| AC | 标准 | 验证方式 |
|---|---|---|
| AC-V1 | 与腾讯桌面同尺寸 Grid 并排截图,容器结构(标题头/内容区/按键区)可识别为同源 | 人工截图对比 + design-critique skill |
| AC-V2 | 与 macOS 原生控制中心并排,质感(vibrancy/字体/圆角)看起来属同一平台 | 人工截图对比 |
| AC-V3 | 任何按钮 hit area ≥ 28×28 | grep style + 人工 |
| AC-V4 | 文本对比度 ≥ 4.5:1(light 和 dark 各一次) | `design:accessibility-review` skill |
| AC-V5 | 全部颜色 / 圆角 / 间距 / 阴影 / 动效使用 token,无字面 hex/rgba(测试除外) | grep 守卫 + CI(可选) |
| AC-V6 | 所有过渡时长 ∈ {160, 180, 220, 240, 280} ms | grep + 单元测试可机检 |
| AC-V7 | 浅 / 深桌面壁纸各截图,文本与容器边界仍清晰可读 | 真机截图 |
| AC-V8 | `design:design-critique` 输出"达标"(无 P0/P1 缺陷) | 跑 skill |
| AC-V9 | 单帧拖拽 60fps(无明显掉帧) | macOS Instruments / 主观 |
| AC-V10 | 与上一程序的 Grid 截图前后对比,视觉跃迁可见(主观但有图) | 截图存档 |

---

## 7. 给你拍板的 Open Questions(P0 brief 之前需要答)

| # | 决策点 | 默认建议 |
|---|---|---|
| Q1 | accent 色 `#2F7BFF` vs 腾讯偏蓝 `#3478F6` vs 你点名 | `#2F7BFF`(克制) |
| Q2 | 明暗策略 A/B/C | **B**(跟随系统 + 手动 override) |
| Q3 | AI Cube 形态:方形 squircle(radius 18)vs 圆形(radius 999) | squircle —— 与 Grid 容器同语言 |
| Q4 | 是否有 brand mark / logo asset 给 Cube;若无是否接受 SF symbol 作占位 | 无则用 `sparkles` SF symbol 占位 |
| Q5 | 是否允许用户自定义主题色(色板预设 × N)还是固定一套 | 固定一套(后续再扩) |
| Q6 | resize handle 是否完全隐藏到 hover 才出,还是常驻一个低调小角标 | hover 才出(更克制) |
| Q7 | 容器关闭按钮:常驻 vs hover 才出 | hover 才出(避免误关) |
| Q8 | 是否需要"密度"开关(Comfortable / Compact) | 不做,固定 Comfortable |

---

## 8. 不在本草案内的事(给你心理预期)

- 真实的 mood board 图片拼贴(我无法在文件里嵌图)。如果你要看图,**你拍 2-3 张腾讯桌面截图 + 2-3 张 macOS 控制中心截图**贴进同一目录,我把它们整理成对照表写进这份 doc。
- Figma / 高保真 mockup:本 feature 不出 Figma,直接用 token + 组件代码作为"实时 mockup"——P1 实化 token 后会出一个 token 预览页(`packages/ui/preview/`)给你看实物。
- console / web 端视觉(滴答清单参照)归 web/console roadmap。
