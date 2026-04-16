# XAI Desktop Documentation Index

> **Quick Navigation for Project Documentation**
>
> This document provides a complete mapping of all documentation in the project, organized by category for easy access.

**Last Updated**: 2026-03-02

---

## Quick Links

| Category | Purpose | Key Documents |
|----------|---------|---------------|
| [Start Here](#start-here-authoritative-docs) | Current truth first | PROGRESS_SNAPSHOT, ARCHITECTURE_AND_DEV_GUIDE |
| [Guides](#guides) | Getting started & how-to | HOW_TO_RUN, BUILD_GUIDE |
| [Architecture](#architecture) | System design & features | ARCHITECTURE_AND_DEV_GUIDE |
| [Development](#development) | Plans & status | PROGRESS_SNAPSHOT, DEV_PLAN_V2 |
| [Reports](#reports) | Historical implementation records | Various reports (status-tagged) |
| [Testing](#testing) | Historical testing tracks | Debug & verification logs (status-tagged) |
| [Reference](#reference) | Code structure | codebase_tree |

---

## Start Here (Authoritative Docs)

Read these first for current project status:

1. [development/PROGRESS_SNAPSHOT.md](development/PROGRESS_SNAPSHOT.md) - **Single source of truth** for current progress and blockers
2. [architecture/ARCHITECTURE_AND_DEV_GUIDE.md](architecture/ARCHITECTURE_AND_DEV_GUIDE.md) - Current architecture baseline
3. [development/TECHNICAL_STATUS.md](development/TECHNICAL_STATUS.md) - Technical details and root-cause analysis

Status legend used below:

- `ACTIVE`: currently valid and recommended
- `HISTORICAL`: useful for traceability, not the latest source of truth
- `OUTDATED`: retained for context; may conflict with current implementation

---

## Guides

**Path**: `docs/guides/`

User and developer guides for getting started and building the project.

| Document | Status | Description |
|----------|--------|-------------|
| [HOW_TO_RUN.md](guides/HOW_TO_RUN.md) | `ACTIVE` | Complete guide to running the XAI Desktop application |
| [BUILD_GUIDE.md](guides/BUILD_GUIDE.md) | `ACTIVE` | Instructions for building the project |
| [QUICK_START.md](guides/QUICK_START.md) | `ACTIVE` | Quick start guide for developers |

**When to use**: Starting development, setting up the project, or building for production.

---

## Architecture

**Path**: `docs/architecture/`

System architecture and feature design documentation.

| Document | Status | Description |
|----------|--------|-------------|
| [ARCHITECTURE_AND_DEV_GUIDE.md](architecture/ARCHITECTURE_AND_DEV_GUIDE.md) | `ACTIVE` | Overall system architecture and development guidelines |
| [system_feature.md](architecture/system_feature.md) | `ACTIVE` | System feature specifications |

**When to use**: Understanding the system design, planning new features, or making architectural decisions.

---

## Development

**Path**: `docs/development/`

Development plans, status tracking, and technical documentation.

| Document | Status | Description |
|----------|--------|-------------|
| [PROGRESS_SNAPSHOT.md](development/PROGRESS_SNAPSHOT.md) | `ACTIVE` | Canonical progress baseline and blocker summary |
| [CURRENT_STATUS.md](development/CURRENT_STATUS.md) | `ACTIVE` | Quick status bridge to the canonical snapshot |
| [TECHNICAL_STATUS.md](development/TECHNICAL_STATUS.md) | `ACTIVE` | Detailed technical status |
| [DEV_PLAN_V2.md](development/DEV_PLAN_V2.md) | `HISTORICAL` | Development plan and architecture alternatives |
| [STEP_1_CANVAS.md](development/STEP_1_CANVAS.md) | `HISTORICAL` | Early canvas implementation stage notes |

**When to use**: Checking project status, planning next steps, or understanding ongoing work.

---

## Reports

**Path**: `docs/reports/`

Implementation reports, summaries, and change logs.

| Document | Status | Description |
|----------|--------|-------------|
| [BATCH_EXECUTION_SUMMARY.md](reports/BATCH_EXECUTION_SUMMARY.md) | `HISTORICAL` | Batch execution summary |
| [CLEANUP_SUMMARY.md](reports/CLEANUP_SUMMARY.md) | `HISTORICAL` | Codebase cleanup summary |
| [CLOSED_LOOP_UPGRADE.md](reports/CLOSED_LOOP_UPGRADE.md) | `HISTORICAL` | Closed-loop upgrade documentation |
| [COMPLETE_RESET_AND_VERIFY.md](reports/COMPLETE_RESET_AND_VERIFY.md) | `HISTORICAL` | Reset and verification report |
| [EFFICIENCY_SUITE_IMPLEMENTATION.md](reports/EFFICIENCY_SUITE_IMPLEMENTATION.md) | `OUTDATED` | Historical implementation narrative that no longer matches current code layout |
| [QUICK_FIX.md](reports/QUICK_FIX.md) | `HISTORICAL` | Quick fix documentation |

**When to use**: Reviewing past work, understanding implementation decisions, or tracking changes.

---

## Testing

**Path**: `docs/testing/`

Test documentation, debug logs, and verification reports.

| Document | Status | Description |
|----------|--------|-------------|
| [CLICK_THROUGH_DEBUG.md](testing/CLICK_THROUGH_DEBUG.md) | `HISTORICAL` | Click-through debugging |
| [CLICK_THROUGH_FIX.md](testing/CLICK_THROUGH_FIX.md) | `HISTORICAL` | Click-through fix documentation |
| [CRITICAL_FIXES_TEST.md](testing/CRITICAL_FIXES_TEST.md) | `HISTORICAL` | Critical fixes test report |
| [FINAL_FIXES_TEST.md](testing/FINAL_FIXES_TEST.md) | `HISTORICAL` | Final fixes test report |
| [FINAL_VERIFICATION.md](testing/FINAL_VERIFICATION.md) | `HISTORICAL` | Final verification checklist |
| [METHOD_3_TEST.md](testing/METHOD_3_TEST.md) | `HISTORICAL` | Method 3 test documentation |
| [RECOVERY_SUMMARY.md](testing/RECOVERY_SUMMARY.md) | `HISTORICAL` | Recovery summary |
| [TEST_WINDOW_LEVEL.md](testing/TEST_WINDOW_LEVEL.md) | `HISTORICAL` | Window level testing |
| [THREE_CRITICAL_FIXES.md](testing/THREE_CRITICAL_FIXES.md) | `HISTORICAL` | Three critical fixes documentation |
| [VERIFY_CLICK_AND_DROP.md](testing/VERIFY_CLICK_AND_DROP.md) | `HISTORICAL` | Click and drop verification |
| [WINDOW_LEVEL_DEBUG.md](testing/WINDOW_LEVEL_DEBUG.md) | `HISTORICAL` | Window level debugging |
| [manual_check_list.md](testing/manual_check_list.md) | `HISTORICAL` | Manual testing checklist |
| [test_file_drop.md](testing/test_file_drop.md) | `OUTDATED` | Legacy file-drop test draft created before hook integration |
| [test_resize_and_empty.md](testing/test_resize_and_empty.md) | `HISTORICAL` | Resize and empty state test |

**When to use**: Running tests, debugging issues, or verifying functionality.

---

## Reference

**Path**: `docs/reference/`

Reference documentation and code structure.

| Document | Description |
|----------|-------------|
| [codebase_tree.md](reference/codebase_tree.md) | Project codebase structure |

**When to use**: Understanding code organization or navigating the codebase.

---

## Project Root Documents

These documents are typically kept at the project root for standard conventions:

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Project overview (Turborepo starter) |
| [HANDOFF.md](../HANDOFF.md) | Workflow state machine for agent handoffs (if present in your current branch) |

---

## App-Specific Documentation

Each app and package has its own README:

| Location | Description |
|----------|-------------|
| [apps/desktop/README.md](../apps/desktop/README.md) | Desktop app (Tauri) documentation |
| [apps/web/README.md](../apps/web/README.md) | Web app (Next.js) documentation |
| [apps/docs/README.md](../apps/docs/README.md) | Docs app documentation |
| [packages/eslint-config/README.md](../packages/eslint-config/README.md) | ESLint config package documentation |

---

## Startup & Scripts

The project includes helpful scripts in `scripts/`:

| Script | Description |
|--------|-------------|
| `scripts/start.sh` | Main startup script with conda environment |
| `scripts/restart.sh` | Quick restart script |
| `scripts/clean-and-restart.sh` | Clean cache and restart |
| `scripts/build-mac.sh` | macOS build script |
| `scripts/verify-transparency.sh` | Verify window transparency |

**Usage**:
```bash
# Start development server
./scripts/start.sh

# Build for production
./scripts/start.sh build

# Show help
./scripts/start.sh help
```

---

## Tech Stack Reference

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | >= 18 | JavaScript runtime |
| pnpm | 9.x | Package manager |
| Turborepo | 2.x | Monorepo build system |
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Tauri | 2.x | Desktop framework |
| Rust | Latest | Native backend |
| Next.js | 16.x | Web framework |

---

## Conda Environment

The project uses a conda environment for consistent Node.js version:

```bash
# Create environment
conda create -n ai-desktop nodejs=20 -c conda-forge -y

# Activate environment
conda activate ai-desktop

# Install dependencies
pnpm install
```

---

**Document Version**: v1.0  
**Maintainer**: Development Team
