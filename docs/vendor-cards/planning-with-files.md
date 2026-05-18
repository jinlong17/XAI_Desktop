# Planning-with-Files Vendor Card

- vendor card status: REFERENCE_ONLY

The `planning-with-files` public skill is wired in as a description-triggered
shim under `docs/workflow/_portable/skills/planning-with-files/SKILL.md`. The
upstream body is not vendored into the tree; the shim points at the upstream
URL and pulls heavy reference material on demand.

## R-1 声称对应

- 声称位置：
  - `features/portable-public-skills-library/docs/design.md` §2 / §3 — names `planning-with-files` with `license: MIT` and `vendor_card: docs/vendor-cards/planning-with-files.md`.
  - `docs/reviews/portable-public-skills-library/20260517-discovery-review.md` §2 row 2 — names upstream `github.com/OthmanAdi/planning-with-files`, license MIT.
  - `docs/workflow/_portable/skills/planning-with-files/SKILL.md` — frontmatter `upstream:` + `license:` lines this card vouches for.
- 实际 vendor 形态：reference-only shim. No upstream content copied.
- vendor 路径或 dep 行：None. The only in-tree artifacts are the shim SKILL.md + the three generated wrappers (`.claude/skills/skill-planning-with-files/SKILL.md`, `.codex/agents/skill-planning-with-files.toml`, `.cursor/rules/skill-planning-with-files.mdc`).

## R-2 vendor 引入方式

- **command**: N/A — reference-only shim.
- **license**: MIT, per the upstream repository LICENSE file at <https://github.com/OthmanAdi/planning-with-files> (verified 2026-05-17 during feature-build).
- **legal review status**: reference-only — MIT permits unmodified reference + URL pointers without sign-off. Vendoring the upstream body would require a follow-up review under the same MIT terms.

## R-3 sync 记录

- **first introduced commit**: this Phase 2 implementation commit (feature `portable-public-skills-library`).
- **first introduced date**: 2026-05-17.
- **last upstream sync commit**: N/A — reference only.
- **last upstream sync date**: 2026-05-17.
- **sync owner**: `global_ai@innopeaktech.com`.
- **sync cadence**: revisit on each `a2k-workflow-migrate resync` run that touches the shim.

## 切换路径估算

If a future round decides to vendor the upstream `SKILL.md` body, update R-2
to `vendor` with the exact upstream commit hash; MIT requires preserving the
upstream copyright notice in the vendored file.

## 显式排除项

no.
