# xai-web-build-form-adr — Verification Strategy

> No unit tests, no integration tests, no E2E tests, no Rust tests. This
> feature ships a markdown ADR. Verification is documentation review +
> traceability check + cross-ADR consistency check.

## Test surfaces

- **TS1 — ADR structural completeness** (manual review against api.md
  acceptance criteria S1..S10).
- **TS2 — Port-mapping traceability** (every prototype file → mapped row;
  every mapped row exists in the roadmap manifest).
- **TS3 — Cross-ADR consistency** (ADR-0007 does not conflict with ADR-0003
  / ADR-0006).
- **TS4 — Cross-vendor verify** (Verify Cross-vendor=yes per manifest).

## Test cases

### TC-T1 — ADR sections present (TS1)

Verify each section S1..S10 in `api.md` exists in the ADR with its acceptance
criteria met. Scriptable as a grep against the ADR file:

```text
For each S in {S1..S10}:
  - Required heading text present (e.g. "## 背景" for S2, "## 方案" for S3, etc.)
  - Section-specific binary AC verified by reading content
```

Pass = all 10 sections present AND all AC bullets in api.md tick green
on manual reviewer read.

### TC-T2 — ADR status is Accepted, not Draft (TS1)

```text
Grep "状态" line in ADR header table.
PASS if line reads "| 状态 | Accepted |"
FAIL if it reads "Draft" or "Proposed" at the end of Phase 2.
```

Hard constraint from seed brief.

### TC-T3 — Next ADR number is 0007 (TS1)

```text
Glob docs/adr/*.md
Confirm 0006 is the current max (excluding TEMPLATE).
Confirm new ADR file is docs/adr/0007-xai-web-console-build-form.md.
Confirm no 0007-* exists at draft time.
```

### TC-T4 — All prototype files mapped (TS2)

```text
1. Glob "web design/*.{jsx,js,css,html,md}" → 18 files per DESIGN.md §10.1
   (board-data.js, i18n.js, index.html, layout.css, tokens.css, app.jsx,
   icons.jsx, shell.jsx, pet.jsx, module-tasks.jsx, module-board.jsx,
   module-dashboard.jsx, module-calendar.jsx, module-matrix.jsx,
   module-pomodoro.jsx, module-habits.jsx, module-countdown.jsx,
   module-settings.jsx, module-meditation.jsx, module-statistics.jsx,
   module-ai.jsx). DESIGN.md itself is the source, not a port target.
2. Read ADR §S7 table.
3. Confirm every prototype file appears in the "Prototype file" column.
4. Confirm every "Target path" cell uses a real package layout (validated
   against design.md frozen list of 20 new packages).
```

PASS = every prototype file is mapped to a target path and an owning row.

### TC-T5 — Owning rows exist in manifest (TS2)

```text
1. Read ADR §S7 "Owning row" column distinct values.
2. Read docs/workflow/roadmap/xai-web-console.md "Features" table.
3. Confirm every owning row slug appears in the manifest #2..#24.
```

Distinct owning rows expected:
`xai-web-shell`, `xai-web-tokens-and-i18n`, `xai-web-tasks`,
`xai-web-board-core`, `xai-web-board-views`, `xai-web-board-workspaces`,
`xai-web-dashboard-grid`, `xai-web-dashboard-widgets`,
`xai-web-calendar`, `xai-web-matrix`, `xai-web-pomodoro`,
`xai-web-habits`, `xai-web-meditation`, `xai-web-countdown`,
`xai-web-statistics`, `xai-web-ai-chat`, `xai-web-pet`,
`xai-web-settings-shell`, `xai-web-settings-appearance`,
`xai-web-settings-features-panel`, `xai-web-settings-rest`.
21 distinct owning row values. PASS = every value found in manifest.

### TC-T6 — Persistence keys complete (TS1)

```text
1. Read DESIGN.md §9.2 → enumerate 24 keys (4 shell + 2 pet + 13 module
   + xai_pref_* family + 2 proposed = 21 explicit + 1 prefix family + 2
   proposed = 24 total per seed brief count).
2. Read ADR §S8 persistence appendix.
3. Confirm every DESIGN.md §9.2 key appears in the appendix.
4. Confirm xai_pomodoro_sessions / xai_countdowns are labelled "proposed".
5. Confirm appendix names xai-web-persistence-contract (row #3) as the
   future owner.
```

### TC-T7 — Cross-ADR consistency (TS3)

Reviewer reads ADR-0003, ADR-0006, and ADR-0007 together:

- ADR-0003 says "Plugin 代码 100% 平台无关 — 禁止直接 import Tauri API".
  ADR-0007 must not contradict (it doesn't — packages/plugin-web-* are
  browser-only, no Tauri imports).
- ADR-0006 says "Web 可以独立实现 Vite SPA host shell 与浏览器 view
  layer". ADR-0007 extends this with a specific package layout, no
  contradiction.
- ADR-0006 says "Web feature 不得自行发明新的数据契约". ADR-0007 must
  affirm this — durable data flows through the shipped platform spine
  (`web-ticktick-parity`). PASS = ADR-0007 §S6 (Implementation Rules)
  explicitly cites and respects this rule.

### TC-T8 — Roadmap-row pause recommendation is present (TS2)

```text
1. Read ADR (search for "BLOCKED_EXTERNAL" or "superseded by xai-web-console").
2. Confirm the four PENDING parity rows are named explicitly:
   - web-productivity-habits-pomodoro
   - web-project-label-calendar
   - web-search-keyboard-theme
   - web-statistics-views
3. Confirm the recommendation is to hand-edit them to BLOCKED_EXTERNAL with
   the canonical Note text.
4. Confirm ADR does NOT itself edit docs/workflow/roadmap/web-ticktick-parity.md.
```

### TC-T9 — Citation surface (TS2 / TS1)

```text
1. Pick three downstream seed briefs at random
   (e.g. xai-web-tokens-and-i18n, xai-web-shell, xai-web-board-core).
2. For each, identify the section(s) of ADR-0007 that constrain it.
3. Confirm the ADR has a heading at that depth that the seed brief could
   cite by anchor.
```

PASS if every randomly-selected seed brief has at least one citable ADR
section.

### TC-T10 — Cross-vendor verify (TS4)

Per manifest `Verify Cross-vendor: yes`. After Claude `feature-review`
returns APPROVED, an independent vendor (Codex or Cursor) reads
`docs/adr/0007-xai-web-console-build-form.md` cold and confirms:

- No internal contradictions.
- No conflict with ADR-0003 / ADR-0006.
- The port mapping table is unambiguous (a vendor unfamiliar with the
  prototype can determine, for each prototype file, where it ports to).
- The four PENDING `web-ticktick-parity` rows recommended for pause are
  identifiable in the manifest of that roadmap.

PASS = cross-vendor reviewer returns the same verdict.

## Mock strategy

N/A. No code, no tests. The ADR is the artifact; review is the verification.

## Acceptance criteria summary

| ID | Statement | Verified by |
|---|---|---|
| AC-1 | ADR file exists at `docs/adr/0007-xai-web-console-build-form.md` with Status=Accepted | TC-T2, TC-T3 |
| AC-2 | All 10 ADR sections (S1..S10) present and meet api.md AC | TC-T1 |
| AC-3 | All prototype files (web design/*) mapped to target paths in §S7 | TC-T4 |
| AC-4 | All §S7 owning-row slugs exist in xai-web-console manifest | TC-T5 |
| AC-5 | All 24 DESIGN.md §9.2 keys listed in §S8, owner = row #3 | TC-T6 |
| AC-6 | ADR-0007 does not contradict ADR-0003 or ADR-0006 | TC-T7 |
| AC-7 | 4 SUPERSEDED PENDING rows on web-ticktick-parity named, hand-edit recommended | TC-T8 |
| AC-8 | Downstream seed briefs can cite ADR sections by anchor | TC-T9 |
| AC-9 | Cross-vendor verify returns same verdict | TC-T10 |

`feature-verify` runs TC-T1..TC-T9 on the Claude side; the Cross-vendor
verify (TC-T10) is dispatched via the standard verify-cross-vendor protocol
defined in manifest header. If any AC fails, `feature-verify` returns
BLOCKED with the failing TC named.
