# Codebase-Explorer Vendor Card

- vendor card status: REFERENCE_ONLY

The `codebase-explorer` public skill is wired in as a description-triggered
shim under `docs/workflow/_portable/skills/codebase-explorer/SKILL.md`. The
upstream body is not vendored into the tree.

## R-1 声称对应

- 声称位置：
  - `features/portable-public-skills-library/docs/design.md` §2 / §3 — names `codebase-explorer` with `license: MIT` and `vendor_card: docs/vendor-cards/codebase-explorer.md`.
  - `docs/reviews/portable-public-skills-library/20260517-discovery-review.md` §2 row 4 — names upstream `github.com/quicksilversurfer/codebase-explorer`, license "to be confirmed in vendor card" (R4 license gate, resolved here).
  - `docs/workflow/_portable/skills/codebase-explorer/SKILL.md` — frontmatter `upstream:` + `license:` lines this card vouches for.
- 实际 vendor 形态：reference-only shim. No upstream content copied.
- vendor 路径或 dep 行：None.

## R-2 vendor 引入方式

- **command**: N/A — reference-only shim.
- **license**: MIT — **license evidence**:
  - The upstream README at <https://github.com/quicksilversurfer/codebase-explorer> declares "License: MIT" in plain text at the recorded upstream commit `3b7dbb25a01fddfc319e08603724f5e6294863bb`.
  - The GitHub license API for the same repository reports "no LICENSE file" (i.e., the repo lacks a top-level `LICENSE` file, only the README declaration).
  - **Resolution (R4 gate)**: this card records the README declaration as the license attestation. Because the upstream does not commit a LICENSE file, we treat the relationship as **reference-only with no vendoring** — we link the README and the upstream URL but do not copy code or text into this repo. If a future round decides to vendor any upstream content, the human owner must contact the upstream maintainer to obtain a LICENSE file or a written authorization before the vendoring lands.
- **legal review status**: reference-only — accepted under R4 because no upstream content is copied. Vendoring is BLOCKED until the upstream LICENSE file is materialized or written authorization is in hand.

## R-3 sync 记录

- **first introduced commit**: this Phase 2 implementation commit.
- **first introduced date**: 2026-05-17.
- **last upstream sync commit**: pinned at `3b7dbb25a01fddfc319e08603724f5e6294863bb` (the commit at which the README MIT declaration was observed).
- **last upstream sync date**: 2026-05-17.
- **sync owner**: `global_ai@innopeaktech.com`.
- **sync cadence**: revisit on each `a2k-workflow-migrate resync` run that touches the shim. If the upstream repo adds a LICENSE file later, update R-2 with the SPDX text.

## 切换路径估算

If the upstream adds a LICENSE file and a future round wants to vendor content,
follow standard MIT obligations (copy the LICENSE file inline, preserve the
copyright notice). Until that happens, vendor adoption is BLOCKED.

## 显式排除项

no — `codebase-explorer` is on the approved list for this feature. The R4
license gate is resolved with this card (MIT per README, no-vendor posture).
