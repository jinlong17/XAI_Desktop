# Superpowers Vendor Card

- vendor card status: REFERENCE_ONLY

The `superpowers` public skill is wired in as a description-triggered shim under
`docs/workflow/_portable/skills/superpowers/SKILL.md`. The upstream body is
**not** vendored into the tree; the shim points at the upstream URL and pulls
heavy reference material on demand. This card records the legal and sync
posture for that reference relationship.

## R-1 声称对应

- 声称位置：
  - `features/portable-public-skills-library/docs/design.md` §2 / §3 — names `superpowers` as a description-triggered shim with `license: MIT` and `vendor_card: docs/vendor-cards/superpowers.md`.
  - `docs/reviews/portable-public-skills-library/20260517-discovery-review.md` §2 row 1 — names upstream `github.com/obra/superpowers`, license MIT.
  - `docs/workflow/_portable/skills/superpowers/SKILL.md` — frontmatter `upstream:` + `license:` lines this card vouches for.
- 实际 vendor 形态：reference-only shim. No upstream content is copied into the tree.
- vendor 路径或 dep 行：None. The only in-tree artifacts are the shim SKILL.md (frontmatter + trigger description + upstream link) and the three generated outputs (`.claude/skills/skill-superpowers/SKILL.md`, `.codex/agents/skill-superpowers.toml`, `.cursor/rules/skill-superpowers.mdc`).

## R-2 vendor 引入方式

- **command**: N/A — reference-only shim. The generator (`docs/workflow/_portable/scripts/setup_subagents_v2.py --include-skills`) emits per-vendor wrappers whose body is the shim body, not the upstream SKILL.md.
- **license**: MIT, per the upstream repository <https://github.com/obra/superpowers> (LICENSE file at the repository root, observed 2026-05-17 by feature-build).
- **legal review status**: reference-only — MIT permits unmodified reference + URL pointers without sign-off. Vendoring the upstream body would require a follow-up legal review under the same MIT terms, but that path is not taken in this feature.

## R-3 sync 记录

- **first introduced commit**: this Phase 1 implementation commit (feature `portable-public-skills-library`).
- **first introduced date**: 2026-05-17.
- **last upstream sync commit**: N/A — no upstream content vendored. Upstream URL pin only; record the upstream HEAD here once a sync convention is decided.
- **last upstream sync date**: 2026-05-17 (initial card landing).
- **sync owner**: `global_ai@innopeaktech.com`.
- **sync cadence**: revisit on each `a2k-workflow-migrate resync` run that touches `_portable/skills/superpowers/`. No pinned cadence while reference-only.

## 切换路径估算

If a future round decides to vendor the upstream `SKILL.md` body into the tree,
update R-2 to `vendor` with the exact upstream commit hash and a `last upstream
sync commit` line; the MIT license obligation is to preserve the upstream
copyright notice in the vendored file. The shim model in `api.md` §3.3 and
`design.md` §1.1 must then be amended.

## 显式排除项

no — `superpowers` is not on any hard-exclusion list in the reviewed planning
artifacts. It is the recommended Phase 1 PoC for this feature.
