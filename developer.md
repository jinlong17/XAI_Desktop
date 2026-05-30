# XAI_Desktop — Developer Onboarding

> **First time on this repo?** Read this top-to-bottom once. After that, `CLAUDE.md` is your daily
> reference; this file is the map.

XAI_Desktop is a macOS transparent desktop overlay that organizes files, folders, and apps into
floating Smart Containers (grids), built with Tauri 2 + React 19 in a Turborepo + pnpm monorepo.

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| macOS | 13+ (Ventura or newer) | The product is macOS-only; multi-window behaviour can only be verified on real hardware. |
| Node | 20+ | `nvm use 20` is fine |
| pnpm | 9+ | `corepack enable && corepack prepare pnpm@latest --activate` |
| Rust | stable | Tauri 2 backend. `curl https://sh.rustup.rs -sSf \| sh` |
| Xcode CLT | latest | `xcode-select --install` — required for native compilation |
| Tauri CLI | optional | `cargo install tauri-cli` (otherwise use `pnpm tauri` proxy) |

Optional but recommended:

- [Claude Code](https://code.claude.com) for the V2 workflow
- [Codex CLI](https://developers.openai.com/codex) for cross-vendor verify
- [Cursor](https://cursor.com) for IDE-side agent execution

---

## 2. Local Setup

```bash
git clone <repo>
cd XAI_Desktop
pnpm install                          # installs all workspace packages
pnpm --filter desktop tauri dev       # runs the desktop app (host + Rust backend)
```

For non-desktop packages:

```bash
pnpm --filter @repo/core build        # build core types/events
pnpm --filter @repo/ui build          # build the UI library
pnpm --filter @repo/core test         # vitest
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Restart helpers (in `scripts/`):

```bash
./scripts/restart.sh                  # safely restart the running desktop app
./scripts/clean-and-restart.sh        # nuke build artifacts + restart
./scripts/build-mac.sh                # produce a notarized .app
./scripts/verify-transparency.sh      # smoke-test the overlay transparency
```

---

## 3. Repository Layout

```
XAI_Desktop/
├── apps/
│   ├── desktop/                       ← Tauri host (PRIMARY PRODUCT)
│   │   ├── src/                       ← React host shell — routing/providers/window shells
│   │   │   ├── main.tsx               ← entry; registers all plugins here
│   │   │   ├── App.tsx                ← hash-based multi-window router
│   │   │   ├── hooks/                 ← cross-window sync (useMultiWindowGrids)
│   │   │   ├── components/
│   │   │   │   ├── GridWindow/        ← per-grid native window app
│   │   │   │   └── ControlWindow/     ← AI Cube + Settings
│   │   │   ├── context/               ← global providers (Settings, …)
│   │   │   └── plugins/               ← thin host-side bridges (OrganizerLayer)
│   │   └── src-tauri/                 ← Rust backend
│   │       └── src/
│   │           ├── commands/          ← Tauri command handlers (typed Result<T,String>)
│   │           ├── platform/macos/    ← Cocoa / NSWindow / native APIs
│   │           └── lib.rs             ← window lifecycle + tray
│   ├── web/                           ← Next.js scaffolding (not the product)
│   └── docs/                          ← Next.js docs site scaffold
│
├── packages/                          ← business code lives here
│   ├── core/                          ← shared infrastructure (zero business logic)
│   │   └── src/
│   │       ├── types/                 ← canonical global types
│   │       ├── events/                ← typed event layer (cross-window contracts)
│   │       ├── hooks/                 ← shared React hooks
│   │       └── PluginRegistry.ts      ← static-import plugin registry (ADR-0001)
│   ├── ui/                            ← generic React components (no business logic)
│   └── plugin-organizer/              ← first real plugin slice
│       ├── manifest.json              ← name / entry / dependencies / version
│       ├── src/
│       │   ├── index.ts               ← only public surface
│       │   ├── SmartContainer.tsx     ← the grid component (~477 lines)
│       │   ├── useGridSystem.tsx      ← state mgmt + localStorage
│       │   ├── hooks/                 ← useFileDrop, useCustomResize, …
│       │   ├── internal/              ← OFF-LIMITS to external importers
│       │   └── types.ts               ← plugin-local types
│       └── docs/                      ← 四件套 (see §5)
│
├── docs/                              ← global documentation
│   ├── SYSTEM_ARCHITECTURE.md         ← 12 编码红线 (MUST READ)
│   ├── PLUGIN_MAP.md                  ← global state of every plugin (Planned/In-Dev/…/Production)
│   ├── PLUGIN_SDK.md                  ← plugin author API reference
│   ├── CORE_INFRA.md                  ← infrastructure exports
│   ├── TECHNICAL_REQUIREMENTS.md      ← non-functional requirements
│   ├── adr/                           ← architecture decision records (read these!)
│   ├── conventions/                   ← commit + code conventions
│   ├── planning/                      ← PRDs + refactor plans
│   ├── reviews/                       ← per-feature discovery / brief artifacts
│   ├── vendor-cards/                  ← upstream-skill provenance + license
│   └── workflow/
│       ├── SUBAGENT_WORKFLOW_V2.md    ← V2 pipeline (entry point)
│       ├── SOP_NEW_FEATURE.md         ← project-side feature SOP
│       ├── SOP_BUGFIX.md              ← project-side bugfix SOP
│       └── _portable/                 ← portable workflow spec (DO NOT EDIT in target)
│
├── scripts/
│   ├── setup_subagents_v2.sh          ← regenerate Claude/Codex/Cursor agent configs
│   ├── cowork/                        ← event-driven automation dispatch scripts
│   ├── restart.sh / build-mac.sh / …  ← dev helpers
│
├── .agents/                           ← V2 subagent template source
│   ├── templates/                     ← 15 templates (one per workflow role)
│   └── project_background.md          ← injected into every generated agent
├── .claude/agents/                    ← rendered Claude Code agents
├── .codex/agents/ + config.toml       ← rendered Codex agents
├── .cursor/agents/                    ← rendered Cursor agents
├── .cursor/rules/                     ← public-skill Project Rules
├── .claude/skills/                    ← public-skill SKILL.md (Anthropic format)
└── .teams/skills/                     ← XAI project-layer skills (xai-feature-brief, xai-roadmap-loop)
```

> Single biggest rule: **business logic lives only in `packages/plugin-*/`**.  
> Host (`apps/desktop/src/`) and Core (`packages/core/`) must stay infrastructure-only.

---

## 3.5 Branch Map (ADR-0011, Proposed)

> Added 2026-05-30. Branch topology + Web→Desktop sync flow. Authority: `docs/adr/0011-branch-sync-governance.md`.

`web` leads, `dev` lags — **by design** (Web first, App follows). The lag is managed by
the catch-up lanes + the D3 sync gate, not "fixed" by force-merging `dev` forward:

```
web                        Web mainline / Web release source (the line you develop on)
  │  (D3 sync gate: classify each Web change W0–W4, emit a parity receipt)
  ▼
desktop-next               Web→App sync integration + Desktop next-step
  │                        desktop-plugin-next ⇆ (App plugin platform / SDK, isolated)
  ▼
dev                        Desktop stable / App release candidate (intentionally lags web)
  │
  ▼
release/desktop/<version>  ephemeral, freeze-only (sign / notarize / dmg / updater metadata)
```

**Product lines** (ADR-0011 §D1) — importance ≠ current dev-focus: web (P0·maintenance) ·
mac App (P1·**active**) · organizer plugins (P2·paused) · account cloud-sync (P2·paused) ·
official website (PROPOSED) · admin-dashboard (PROPOSED).

## 4. Three-Faces Architecture

Per `docs/adr/0003-three-faces-architecture.md`:

| Face | Where | Role | Can depend on |
|---|---|---|---|
| **Host** | `apps/desktop/src/` | Tauri shell — routing, providers, window registration | Core, Plugins |
| **Core** | `packages/core/` | Shared infrastructure — types, typed events, PluginRegistry, hooks | nothing else in this repo |
| **Plugin** | `packages/plugin-<name>/` | A self-contained feature slice | Core only — NEVER another plugin directly |

Dependency rules (also in CLAUDE.md):

1. Host → (Core, Plugins). Never the reverse.
2. Plugin → Core. Never another Plugin directly — go through `@repo/core/events` (typed events).
3. `index.ts` is the only public surface of a Plugin. Importing from `plugin-*/src/internal/` is
   forbidden.
4. Tauri commands live in `apps/desktop/src-tauri/src/commands/`; macOS-specific code in
   `platform/macos/`. The Rust side returns typed `Result<T, String>`.

---

## 5. The Plugin Documentation Contract

Every plugin (`packages/plugin-<name>/docs/`) must carry the 四件套:

| File | Purpose | Owner |
|---|---|---|
| `design.md` | Decision snapshot — `Selected Option` / `Review Doc Path` / `Frozen Assumptions` | `feature-plan` |
| `api.md` | Interface contracts — exports, typed events, Tauri commands, error semantics | `feature-plan` |
| `test.md` | Test strategy, mock strategy, acceptance criteria | `feature-plan` |
| `dev_log.md` | **Workflow state machine** — Status Panel + Work Log | every writer subagent |

`dev_log.md` is the single source of truth for workflow state. Its Status Panel write-authority
matrix is defined in `docs/workflow/SUBAGENT_WORKFLOW_V2.md` — main session is **read-only**.

Discovery artifacts (one-off, not part of 四件套):

- `docs/reviews/<feature>/<YYYYMMDD>-feature-brief.md` — Step 0 brief
- `docs/reviews/<feature>/<YYYYMMDD>-discovery-review.md` — 调研主文档

---

## 6. Workflow V2 — Quickstart

The full V2 pipeline lives at `docs/workflow/SUBAGENT_WORKFLOW_V2.md`. TL;DR for daily work:

**New feature (manual):**

```text
1. /xai-feature-brief                                       (Step 0 — normalize the idea)
2. Start the feature-plan agent. (attach the brief)
3. Start the feature-review agent for <feature>.            (cross-vendor reviewer)
4. Start the feature-build agent for <feature>.             (one phase per run)
5. (repeat 4 until Status = READY_FOR_VERIFY)
6. Start the feature-verify agent for <feature>.            (cross-vendor verifier)
7. Start the ship agent for <feature>.                      (human-triggered ship)
```

**New feature (auto):**

```text
1. /xai-feature-brief
2. Start the feature-plan agent. (attach the brief)
3. Start the feature-review agent for <feature>.
4. Start the feature-dev-loop agent for <feature>.          (auto: build + verify, max 3 retries)
5. Start the ship agent for <feature>.
```

**Bugfix:**

```text
1. Start the bug-diagnose agent. (attach bug report)
2. Start the bug-fix agent for <feature>.   /   Start the bugfix-loop agent for <feature>.
3. Start the bug-verify agent for <feature>.                (auto-loop skips this step)
4. Start the ship agent for <feature>.
```

**Roadmap orchestration** (Level 3 — many features at once):

```text
/xai-roadmap-loop mode: init source: docs/planning/<roadmap>.md
(review the generated manifest at docs/workflow/roadmap/<roadmap>.md)
/xai-roadmap-loop manifest: docs/workflow/roadmap/<roadmap>.md
(skill emits one prompt block per eligible feature; open each in a fresh session)
```

Default dispatch is **emit-dispatch** — the skill tracks; you dispatch. See
`docs/workflow/_portable/06-roadmap-orchestration.md` for spawn-dispatch opt-in.

Reading `dev_log.md` to decide the next step:

| Status | Suggested Next |
|---|---|
| `NEEDS_REVIEW` → `feature-review` | `feature-review` |
| `NEEDS_REVIEW` → `feature-plan` | `feature-plan` (revise) |
| `APPROVED` | `feature-build` (manual) or `feature-dev-loop` (auto) |
| `READY_FOR_VERIFY` | `feature-verify` |
| `FIX_READY` | `bug-fix` |
| `FIX_READY_FOR_VERIFY` | `bug-verify` |
| `READY_TO_SHIP` | `ship` (human) |
| `BLOCKED` | read Blockers, return to upstream role |

---

## 7. Adding a New Plugin

```text
1. mkdir packages/plugin-<name>/ + package.json + tsconfig.json + manifest.json
2. src/index.ts (public surface) + components + hooks
3. docs/ 四件套 (start with design.md, then api.md, test.md, dev_log.md)
4. apps/desktop/src/main.tsx — add the plugin's import registration
5. docs/PLUGIN_MAP.md — add a row with Status: Planned (then In-Dev → Testing → Stable)
6. follow SOP_NEW_FEATURE.md from Phase 1 onward
```

`packages/plugin-organizer/` is the canonical reference — clone its shape.

---

## 8. Public Skills (description-triggered)

`.claude/skills/skill-*`, `.cursor/rules/skill-*.mdc`, `.codex/agents/skill-*` ship 8 public skills
that load on demand based on the conversation. Triggers:

| Skill | Trigger phrases |
|---|---|
| `codebase-explorer` | "explore this codebase" / "orientation map" / "where does X live" |
| `composition-patterns` | "React composition" / "compound components" / "render prop pattern" |
| `frontend-dev` | "build a frontend page" / "Tailwind UI" / "frontend polish" |
| `gh-fix-ci` | "fix CI" / "PR checks failing" / "GitHub Actions log" |
| `planning-with-files` | "persistent plan" / "task_plan.md" / "long-running task plan" |
| `security-skills-claude-code` | "STRIDE" / "attack surface" / "security review" |
| `skill-creator` | "create a new skill" / "edit a skill" / "SKILL.md frontmatter" |
| `superpowers` | "plan first" / "design before code" / "subagent-driven" |

Project-layer skills under `.teams/skills/`:

- `xai-feature-brief` — Step 0 brief normalization
- `xai-roadmap-loop` — Layer 3.5 roadmap orchestration (emit-dispatch default)

The 8 public skills come from the portable layer (`docs/workflow/_portable/skills/`); the project-
layer skills are XAI-specific. ADR-0006 keeps the public-skill set in sync with the source project.

---

## 9. Where to Look When …

| Problem | Look here |
|---|---|
| "What can I depend on?" | `docs/PLUGIN_MAP.md` — only Stable / Production plugins. Mock the rest. |
| "What's the 红线?" | `docs/SYSTEM_ARCHITECTURE.md` §4 (12 条编码红线) |
| "How do windows talk?" | `packages/core/src/events/` (typed event layer) |
| "How does Rust talk to React?" | `apps/desktop/src-tauri/src/commands/` (typed `Result<T,String>`) |
| "Why was X decided this way?" | `docs/adr/` |
| "How do I run the V2 workflow?" | `docs/workflow/SUBAGENT_WORKFLOW_V2.md` + `CLAUDE.md` §How to Use |
| "What's the commit format?" | `docs/conventions/COMMIT_CONVENTION.md` |
| "I'm adding a new plugin — what's the checklist?" | `docs/workflow/SOP_NEW_FEATURE.md` |
| "I found a bug — what's the SOP?" | `docs/workflow/SOP_BUGFIX.md` |
| "I want to write a new skill" | `/skill-creator` + `docs/workflow/_portable/skills/` |

---

## 10. Common Commands

```bash
# Desktop dev (PRIMARY)
pnpm --filter desktop tauri dev
./scripts/restart.sh

# Build artifacts
pnpm build                            # all packages
pnpm --filter desktop tauri build     # signed .app
./scripts/build-mac.sh                # full notarization flow

# Tests
pnpm --filter @repo/core test         # vitest (unit)
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml

# Lint / typecheck
pnpm lint
pnpm typecheck

# Regenerate agent configs after editing .agents/templates/ or .agents/project_background.md
./scripts/setup_subagents_v2.sh                                  # writes to .claude/agents-v2/ (safe)
./scripts/setup_subagents_v2.sh --replace-claude --force         # promote to .claude/agents/
./scripts/setup_subagents_v2.sh --include-skills --force         # also re-render the 8 public skills

# Run V2 portable lint (optional — verifies _portable/ stays project-agnostic)
python3 docs/workflow/_portable/scripts/setup_subagents_v2.py --dry-run
```

---

## 11. Daily Cadence Checklist

- [ ] Read `dev_log.md` Status Panel before touching a plugin
- [ ] Check `docs/PLUGIN_MAP.md` for upstream plugin status before adding a dependency
- [ ] Run the V2 pipeline for new work — don't hand-write business code without `feature-plan`
- [ ] Test multi-window behaviour on real macOS hardware before marking READY_TO_SHIP
- [ ] Update `dev_log.md` Work Log with `Commits` field after each round
- [ ] Commit messages follow `type(scope): summary` + Why/What/Scope/Risk/Docs/Tests body
- [ ] Subagent commits carry the right `Co-authored-by: <agent> <workflow-v2@local>` trailer

---

**Welcome to XAI_Desktop.** Start by reading `CLAUDE.md` end-to-end, then open
`packages/plugin-organizer/` and trace its 四件套 to see how a real slice is shaped. After that,
you're ready to run the workflow for real.
