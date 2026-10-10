# GOV-06 authority source discovery — proposal only

## Result and boundary

This is one bounded, source-only discovery at the assigned worktree HEAD 56fe7e8e4eae4d3d46efa1aed0fcea23e6d3cc50. The task card’s fixed input is 6f5910ea036ee6f54a26f25c4faba63389aac496; the product reference SHA remains f9eb4b1f207bc4b46f547b90afc250424b3c8695. All card read paths and the current root-control inputs are hash-bound in inputs.sha256. No source, authority mirror, ledger, generated dashboard, branch, or product file was changed by this discovery.

The original item is GOV-06, P2 documentation, module web / project-system, pending, with acceptance “CLAUDE/AGENTS/Cursor/模块图一致；独立web/dev正常分叉不当错误合并.” The source card lists no existing evidence and the retained execution entry is pending with an empty evidence array. This pass found no accepted GOV-06 batch evidence to reuse or rerun.

## Six-module routing model found in the sources

The six keys and current routing labels agree across the main routing table in CLAUDE.md §Product module map, AGENTS.md §3, .cursor/rules/product-module-routing.mdc, and docs/PRODUCT_MODULE_MAP.md §0:

| Key | Responsibility documented at the fixed source |
|---|---|
| web | Web SPA, Web packages, browser persistence and UI; P0 active on web / codex/web/<feature>. Desktop-impacting changes require D3 before promotion. |
| app | macOS/Tauri shell, Web container, native chrome and host commands; active App lane through desktop-next to dev, with branch/promotion gates. |
| plugin | Desktop plugin platform/runtime and plugin packages; multi-window, overlay, grid persistence and window-command product ownership is plugin even when code is physically in the host. G1 platform-runtime work is the active gate; concrete packages are paused. |
| sync | Account cloud-sync protocol; only syncScope account-sync entities sync, while device-local stays local; currently paused. |
| site | Official website/download/updater surface; PROPOSED and owner-confirmed before opening a work branch. |
| admin | Admin dashboard/control plane; operator-activated and roadmap-gated, starting with xai-admin-dashboard-shell. |

Dashboard automation remains web/project-system work. The dashboard machine contract says the personal developer dashboard is not the proposed Admin Dashboard and does not replace the routing authorities (dev-dashboard.md lines 32-50). It identifies dashboard-state.json product_lines as the registry rendered by the dashboard (lines 57-77, 90-95). The supplied read set does not include dashboard-state.json or the consuming JavaScript modules, so this pass does not claim the actual rendered registry values are aligned or fresh.

## Source findings

### Branch statements conflict with the frozen remote observation

The P54 observation is metadata from a recorded git ls-remote --heads origin at 2026-10-10T17:09:13.909182+00:00, control SHA 6f5910ea036ee6f54a26f25c4faba63389aac496, raw-output SHA-256 43846b92a9dd41c4ddd13271b2ed85e033e403a767a6a238d5f5d1483e1a1abc. It records refs/heads/desktop-plugin-next at ae72888f4c50d8d678eef670c9bff4c27b3e373d, dev at 343cc5f1002559291b3f8fd1511b93c6e1196082, main at 9a61669b1f67197f6f75f341c79ef35be8a6d0e4, and web at 9257be40c03216b1006691bfa289bd29d6dfe839 (gov06-branch-observation-p54.json lines 572-588). The observation expressly limits itself to advertised remote Git identities; it does not prove machine/runtime parity, shipment, deployment, or permission to advance. desktop-next and release branches are not listed in this snapshot; that is reported as “not observed in this snapshot,” not as proof of absence.

Current mirrors agree that desktop-plugin-next exists at the time of their own wording: CLAUDE.md lines 73-74 and 208-210, AGENTS.md lines 208-210, Cursor routing rule lines 47-50, and PRODUCT_MODULE_MAP.md lines 20 and 235. However, CLAUDE.md lines 26-33 says all topology branches, including desktop-plugin-next, are not yet created and “none exist yet.” PRODUCT_MODULE_MAP.md line 248 also says desktop-plugin-next and desktop-next are both not yet created, contradicting its own line 235 and line 20.

ADR-0013 contains a dated 2026-05-30 codebase snapshot at lines 105-117 that says neither desktop-next nor desktop-plugin-next existed then; its D2 lines 275-282 says the ADR defined topology but created no branches and requires separate explicit operator confirmation for creation, especially anything touching dev. These dated statements and the frozen P54 observation describe different times. The observation confirms later remote presence of desktop-plugin-next, but does not establish when or under what authorization it was created. Branch presence never grants permission to create, modify, merge, rebase, promote, or write dev/main/web.

### G1 and Organizer descriptions need one contract-level reconciliation

The newer routing descriptions distinguish the plugin platform runtime from concrete packages: CLAUDE.md lines 8-9 and 57-60, AGENTS.md lines 195-196, Cursor rule lines 28-34, and PRODUCT_MODULE_MAP.md lines 223-236/247-250 say G1 runtime work is active and belongs to plugin while concrete packages remain paused until G1 ships. ADR-0013 D1 also describes the P2 line as paused until G1 ships (lines 91-94 and 187-202).

The narrower package list is inconsistent. CLAUDE.md line 9 and PLUGIN_MAP.md line 89 describe Organizer as a shipped flagship outside the P2-paused freeze, citing ADR-0015; MODULE_BOUNDARIES.md line 89 says the same. Yet MODULE_BOUNDARIES.md line 31 calls the “entire line” paused, and PLUGIN_MAP.md line 17 explicitly includes plugin-organizer in the P2 paused package list. MODULE_BOUNDARIES.md lines 30-34 and 87-95 contain both the platform/package split and the Organizer exception, so those paragraphs are not a single unambiguous mirror.

The supplied read set does not include ADR-0015 or the dev-side ADR-0011 reconciliation record. The listed mirrors state that ADR-0015 is accepted on the web side while dev ADR-0011 reconciliation remains pending. ADR-0010’s accepted D1 row still groups organizer among P2 plugins and says work resumes when P1 enters beta (docs/adr/0010-p1-desktop-resume-plan.md lines 65-73); ADR-0013’s later accepted D1 and the current routing mirrors use G1 shipped. This discovery does not decide which Organizer/P2 rule controls or alter either accepted ADR. That requires a fresh whole-contract impact review with the missing authority inputs.

### The web/dev divergence rule is consistently represented

ADR-0013 D5 states web and dev have independent product focus, expected divergence, on-demand sharing, and main as the scheduled reconciliation point (lines 378-405). CLAUDE.md lines 20-25, AGENTS.md lines 169-170, Cursor rule lines 26-31, and multi-machine-development.md lines 14-15 and 42-43 preserve that rule. ADR-0013 D3 requires W0-W4 classification before a specific change is shared; it is not a one-way mechanism to make dev a subset of web (lines 284-300). The dashboard source does not authorize bulk alignment or alter this rule.

### Dashboard inspection is source-only

dev-dashboard.md names PRODUCT_MODULE_MAP.md as the routing-signal source and dashboard-state.json product_lines as the rendered Product Module Registry (lines 43-77). index.html provides the product-structure page and says its full rules are in PRODUCT_MODULE_MAP.md (lines 117-136); it loads state.generated.js and product-flow.js (lines 704-722). The actual registry JSON, generator, and consumer scripts are outside the card read set and protected from writes here. No generator, Overview freshness, browser, or runtime check was performed.

## Existing evidence and control-plane status

The current task card and GOV-06 row in scope-map.json lines 10181-10224 both show pending status, empty existing/retained evidence, fixed item input e041c2bc293b70db367444c62c4300231976dbf7, and execution_state needs_fixed_scope_discovery. EXECUTION.json lines 1875-1878 also show GOV-06 pending with no evidence. The card’s “existing” array is empty. The original documented accepted callers are unrelated to GOV-06 and are not rerun by this pass.

The formal counts remain 13 completed, 3 verification_pending, 3 in_progress, 293 pending; 299 remain unclosed (scope-map.json lines 18-24; current root control plane line 884). No ledger or status was changed.

The source-hashes.json file is itself bound at its current SHA-256 in inputs.sha256. Its parent field is e041c2bc and its current-control-plane digest is a historical digest for that parent. The current root control plane was read and hash-bound at the actual task parent 6f5910ea036ee6f54a26f25c4faba63389aac496. A digest difference across these source SHAs is historical versioning, not evidence of corruption and not authority to repin the task.

## Finite proposal for a future review

Before any repair, commission a fresh independent full-contract impact review and root-bounded grant. It should add read-only coverage for ADR-0015, the dev-side ADR-0011 reconciliation status, dashboard-state.json product_lines, and the exact dashboard consumer/source files needed to assess rendered-map parity. The review should resolve only the documented conflicts above and preserve the original GOV-06 action, D3/D5, module ownership, operator gates, and formal counts.

If that review authorizes mirror edits, the finite candidate mirror paths are:
- CLAUDE.md: branch-topology statements and the six-module/plugin status paragraphs.
- AGENTS.md: §3 six-module branch/status summary.
- .cursor/rules/product-module-routing.mdc: table and hard-rule branch/status statements.
- docs/PRODUCT_MODULE_MAP.md: §0 branch note, plugin-module branch workflow, and only any additional exact D3/branch references identified by the review.
- docs/MODULE_BOUNDARIES.md: plugin runtime/package split and Organizer status statements.
- docs/PLUGIN_MAP.md: Current Priority P2 package list and plugin status banner.
- docs/workflow/project/dashboard-state.json: only if the review proves a registry mirror change is required; read-only dependency first because this is a protected/shared source.
- docs/prototypes/dev-dashboard/js/product-flow.js and scripts/dashboard/generate-state.mjs: read-only consumer dependencies only if the review confirms they are needed; no generated refresh or source change is proposed here.

Those are candidate paths only, not an edit grant. Keep ADR-0010/0013 immutable unless a separately authorized ADR decision changes the governance itself. The follow-up evidence sequence is: fixed-source contract and before record; narrowly approved implementation; independent frozen static verification with source/mirror coverage and any specifically affected dashboard regression; actual cross-vendor check by a distinct vendor runtime if required (a fresh Codex run is not cross-vendor evidence); full independent caller acceptance; root evidence append with unchanged formal states; inventory refresh and remote ancestry/sync receipt.

## Minimum unresolved decisions and limits

1. Which accepted authority resolves the Organizer exception while the cited ADR-0015 web-side acceptance and dev ADR-0011 reconciliation have different states?
2. Should branch mirrors state only the P54-observed desktop-plugin-next ref while preserving existing create/use/promotion gates, and what current binding source should own future branch-presence facts?

No contract, policy, branch state, parser/dashboard behavior, caller acceptance, or audit status is adopted by this proposal. No tests, builds, lint, browser, native, server, runtime, vendor review, or qualification were run. The six earlier process-launch rejections targeted the misspelled worktree path containing “authority-source”; they were rejected before process creation and are not checker attempts. Source reads and the concluding static checker for this pass use the exact assigned worktree path.

## Read-set coverage

All 16 read_paths from the frozen GOV-06 task card are listed below and hash-bound in inputs.sha256:

- AGENTS.md
- CLAUDE.md
- .cursor/rules/product-module-routing.mdc
- docs/PRODUCT_MODULE_MAP.md
- docs/MODULE_BOUNDARIES.md
- docs/PLUGIN_MAP.md
- docs/adr/0010-p1-desktop-resume-plan.md
- docs/adr/0013-branch-sync-governance.md
- docs/planning/LONG_TERM_PRODUCT_ROADMAP.md
- docs/workflow/project/workflow.md
- docs/workflow/project/multi-machine-development.md
- docs/workflow/project/dev-dashboard.md
- docs/prototypes/dev-dashboard/index.html
- docs/reviews/20260908-full-product-audit/parallel-control-r1/gov06-branch-observation-p54.json
- docs/reviews/20260908-full-product-audit/parallel-control-r1/scope-map.json
- docs/reviews/20260908-full-product-audit/parallel-control-r1/execution-state.json
