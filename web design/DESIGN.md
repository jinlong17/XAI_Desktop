# XAI Web Design System

Status: active Web console design contract
Scope: `apps/web`, `packages/plugin-web-*`, `packages/xai-web-*` used by the Web shell
References: Apple Calendar, Apple Reminders, iOS Timer, Linear

## Product Feel

XAI Web is a quiet productivity console. It should feel precise, readable, and calm before it feels decorative.

Design keywords:

- Quiet
- Clear
- Premium
- Low noise
- Strong hierarchy
- Calibrated color
- Refined typography
- Useful density
- Lightweight micro-motion

Avoid:

- Generic AI dashboard styling
- Neon color accents
- Heavy gradients
- Decorative blobs, orbs, and visual effects without information value
- Stacked cards inside cards
- Tiny labels in calendar, task, timeline, chart, or number-heavy views

## Theme Model

The source of truth is `packages/plugin-web-tokens/src/tokens.css`.

Light mode:

- Use a cool neutral app canvas, not a saturated mint or cream field.
- Panels should be near-white with clear but soft borders.
- Sidebar and rail surfaces should create orientation without dominating content.
- Shadows should be subtle and mostly used for interactive elevation.

Dark mode:

- Use neutral graphite surfaces, not green-black or blue-black.
- Avoid harsh glass highlights and diagonal shine.
- Borders must remain visible enough to separate cards, grids, and overlays.
- Accent color is used sparingly for selection, focus, and primary actions.

Token guidelines:

- Use `--bg-app`, `--bg-panel`, `--bg-panel-2`, `--bg-hover`, `--bg-selected`.
- Use `--text-1` through `--text-4` for hierarchy.
- Use `--border-1`, `--border-2`, `--border-strong`.
- Use semantic tokens (`--red`, `--amber`, `--blue`, `--violet`, `--pink`) for meaning, not decoration.
- Do not add raw color values in module components unless the module already has an explicit token test contract.

## Color Governance

Raw color literals are controlled by a static gate:

```bash
pnpm web:check-colors
```

The gate scans Web CSS under `apps/web/src`, `packages/plugin-web-*`, and `packages/xai-web-*`.
New module work must not introduce raw `#hex`, `rgb(...)`, `rgba(...)`, `hsl(...)`, `oklch(...)`, `white`, or `black` values outside `packages/plugin-web-tokens/src/tokens.css`.

Current legacy literals are quarantined in:

```text
docs/workflow/project/web-color-literal-baseline.json
```

Rules:

- New UI colors must be added as semantic tokens in `packages/plugin-web-tokens/src/tokens.css`.
- Module CSS should reference tokens through `var(--token-name)` or token-derived `color-mix(...)`.
- Do not refresh the baseline to accept new color debt unless the change is explicitly reviewed as a legacy exception.
- When removing old raw colors, refresh the baseline after review so the debt count only moves down.
- `pnpm lint` includes this color gate; feature branches should pass it before commit.

## Typography

Default stack:

```css
var(--font-sans)
```

Scale:

- Captions and metadata: `--fs-xs` or larger.
- Dense labels: `--fs-sm` when repeated or data-heavy.
- Body and task text: `--fs-md`.
- Section headings: `--fs-lg` or `--fs-xl`.
- Page/module headings: `--fs-2xl`.
- Timer, clock, and KPI values may use larger fixed or clamped sizes.

Rules:

- Do not use viewport-width typography.
- Keep letter spacing at `0` by default.
- Avoid uppercase labels unless the surface truly benefits from scanning shorthand.
- Use tabular numerals for dates, times, KPIs, prices, and counts.
- Calendar dates, task names, event chips, timeline labels, and chart labels must not fall below `--fs-xs`.

## Spacing

The spacing scale is 4px based. Prefer:

- `--s-2` for tight internal gaps.
- `--s-3` and `--s-4` for card padding and toolbar rhythm.
- `--s-5` and `--s-6` for page-level separation.

Layout rules:

- Keep module roots padded enough that the shell never feels cramped.
- Avoid nested card frames. Use one panel boundary per logical surface.
- Use borders and spacing before shadows to express hierarchy.
- Dense views should keep scan paths clear rather than simply shrinking text.

## Shape And Elevation

Radii:

- Controls: `--r-md`.
- Cards and panels: `--r-lg`.
- Prominent dashboard widgets and dialogs: `--r-xl`.
- Pills only for segmented controls, badges, and circular/timer UI.

Elevation:

- Default panels use `--shadow-1`.
- Hover or floating surfaces may use `--shadow-2`.
- Dialogs and popovers may use `--shadow-3`.
- Avoid glass blur on large scrolling regions.

## Components

Shell:

- Rail targets should be at least 42px on desktop and 44px on mobile.
- Topbar controls should remain readable and reachable at tablet and mobile widths.
- Search is a quiet utility surface, not a visual centerpiece.

Panels:

- Panels use the global panel treatment unless a module has a specific data visualization need.
- Panel headings should be clear, short, and visually stronger than metadata.

Buttons:

- Use icon buttons for tools.
- Primary buttons use `--accent`.
- Destructive buttons use `--red`.
- Touch targets must be at least 44px on mobile.

Badges and chips:

- Use `--fs-xs` minimum.
- Keep chip color soft and semantically meaningful.
- Avoid high-chroma backgrounds in dark mode.

Dialogs:

- Dialogs use `--r-xl`, `--shadow-3`, and a clear header/content/action structure.
- Inputs and action buttons should be at least 40px desktop, 44px mobile.

## Page Standards

Workbench and dashboard:

- Widgets should read as a quiet grid, not glass cards.
- Widget titles and captions use regular case and readable sizes.
- Sticky/note controls are secondary and should not compete with dashboard content.

Calendar:

- Day numbers, week numbers, event chips, and time labels must remain legible.
- Month grid cards use subtle panel boundaries.
- Today state uses accent clearly, but not aggressively.
- Dark mode event chips must remain calibrated and non-neon.

Tasks and lists:

- Task names use `--fs-md` with comfortable line-height.
- Metadata uses `--fs-sm` where it affects decision making.
- Columns should not shrink below readable card widths on desktop/tablet.
- Mobile falls to one primary column.

Projects and boards:

- Toolbar, board panels, card detail, and dialogs use the same panel hierarchy.
- Badges, labels, and due-date rows must avoid compressed uppercase microtext.

Time tracking:

- Session rows, timer values, category chips, and reports use tabular numerals.
- Reports should increase chart and label readability before adding more decoration.

Habits:

- Week cells should be targetable and legible.
- Habit rows should use clear title/meta hierarchy.
- Avoid blur on habit lists and detail panels.

Bookkeeping:

- Financial values should be the primary visual anchors.
- Account, category, and ledger controls need clear contrast in both themes.
- Semantic red/amber should indicate status, never decoration.

Meditation and Pomodoro:

- Timer values are prominent and calm.
- Supporting stats and records should stay readable without overpowering the timer.
- Motion must respect `prefers-reduced-motion`.

Settings:

- Settings is an operational surface: keep it quiet, clear, and scannable.
- Toggles and action rows must meet mobile touch target rules.
- Long explanatory copy should use `--fs-sm` minimum with 1.5 line-height.

Overview and statistics:

- KPI values should be large and stable.
- Chart labels use `--fs-xs` minimum.
- Use color for data meaning, not ornament.

Docs, Skill, and Workflow related pages:

- Treat documentation and workflow panes as reading surfaces.
- Prioritize line length, heading hierarchy, and stable side navigation.
- Avoid dense card grids when the content is primarily text.

## Responsive Rules

Desktop:

- Prefer 12-column or grid-based layouts.
- Maintain readable minimum column widths for task, board, and dashboard cards.

Tablet:

- Collapse 4-column data boards to 2 columns.
- Keep sidebars only when they do not compress primary content.
- Wrap toolbar groups before shrinking text.

Mobile:

- Use one primary content column.
- Keep main actions within thumb reach.
- Controls must be at least 44px tall.
- Hide secondary sidebars before shrinking primary content.
- Calendar grids may become denser, but labels must stay readable.

## Motion

Use `--dur-fast`, `--dur-med`, and `--ease-out`.

Allowed:

- Small hover elevation.
- Short panel entry transitions.
- Timer/progress animations that communicate state.

Avoid:

- Continuous decorative motion.
- Large parallax effects.
- Motion that blocks or delays repeated workflows.

Always honor `prefers-reduced-motion`.

## Persistence Contract

### 9.2 LocalStorage Keys

The Web shell persists user-visible state through the typed preference registry
in `@repo/plugin-web-storage`. These are the original explicit keys that remain
part of the design contract; later owner-row additions are documented by their
own package API files and registry entries.

| Key | Owner |
| --- | --- |
| `xai_accent_hue` | Settings appearance |
| `xai_rail_pos` | Settings appearance |
| `xai_bg_tone` | Settings appearance |
| `xai_rail_order` | Web shell |
| `xai_pet_pos` | Pet module |
| `xai_pet_id` | Pet module |
| `xai_task_cols` | Tasks module |
| `xai_boards_v2` | Board core |
| `xai_active_board` | Board core |
| `xai_board_panels` | Board workspaces |
| `xai_board_inbox` | Board workspaces |
| `xai_dash_order` | Dashboard |
| `xai_clock_style` | Dashboard clock |
| `xai_clock_tz` | Dashboard clock |
| `xai_zones` | Time zones |
| `xai_ai_convos` | AI chat |
| `xai_ai_insights` | AI chat |
| `xai_ai_voice` | AI chat |

## Implementation Checklist

Before shipping a Web UI change:

- Check light and dark mode.
- Check desktop, tablet, and mobile.
- Verify text does not clip, overlap, or shrink below the standard.
- Confirm touch targets are valid on mobile.
- Use tokens instead of hard-coded colors.
- Run `pnpm web:check-colors`; do not add new raw color literals.
- Keep component and module CSS scoped to the owning package.
- Update this document when introducing a reusable visual rule.
