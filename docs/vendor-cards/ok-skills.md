# ok-skills (gh-fix-ci) Vendor Card

- vendor card status: REFERENCE_ONLY

The `gh-fix-ci` public skill is wired in as a description-triggered shim
under `docs/workflow/_portable/skills/gh-fix-ci/SKILL.md`. The upstream body
(from `mxyhi/ok-skills`, path `gh-fix-ci`) is not vendored into the tree.

## R-1 声称对应

- 声称位置：
  - `features/portable-public-skills-library/docs/design.md` §2 / §3 — names `gh-fix-ci` with `license: MIT` and `vendor_card: docs/vendor-cards/ok-skills.md`.
  - `docs/reviews/portable-public-skills-library/20260517-discovery-review.md` §2 row 7 — names upstream `github.com/mxyhi/ok-skills` (path `gh-fix-ci`), license MIT.
  - `docs/workflow/_portable/skills/gh-fix-ci/SKILL.md` — frontmatter `upstream:` + `license:` lines this card vouches for.
- 实际 vendor 形态：reference-only shim. No upstream content copied.
- vendor 路径或 dep 行：None.

## R-2 vendor 引入方式

- **command**: N/A — reference-only shim.
- **license**: MIT, per the upstream repository LICENSE file at <https://github.com/mxyhi/ok-skills> (verified 2026-05-17 during feature-build).
- **legal review status**: reference-only — MIT permits unmodified reference + URL pointers without sign-off.

## R-3 sync 记录

- **first introduced commit**: this Phase 2 implementation commit.
- **first introduced date**: 2026-05-17.
- **last upstream sync commit**: N/A — reference only.
- **last upstream sync date**: 2026-05-17.
- **sync owner**: `global_ai@innopeaktech.com`.
- **sync cadence**: revisit on each `a2k-workflow-migrate resync` run that touches the shim.

## 切换路径估算

If a future round decides to vendor the upstream skill bodies, update R-2 and
preserve the MIT copyright notice. The repo bundles multiple sibling skills;
this card only vouches for `gh-fix-ci`.

## 显式排除项

no.
