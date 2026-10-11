# GOV-01 + GOV-02 full independent source-contract impact review 1

## Verdict and authority

REVISE — the whole two-item source contract is not yet ready for technical adoption or an implementation/before grant. Two contract defects below require a fresh authorized author; this reviewer has made no repair. The source and impact scope was reviewed in full, not merely for input availability. Documentary integrity/static-check success, if recorded in the final process receipt, does not change this semantic REVISE.

Workflow D; module web, original_module web（project-system）. Reviewer: /root/parallel_d_gov_source_contract_full_review_r1, independent of the source author and discovery author. Owned checkout is /Users/lijinlong/.codex/worktrees/audit-parallel-gov-source-contract-review1-20261010/XAI_Desktop, detached at dispatch parent 6f5910ea036ee6f54a26f25c4faba63389aac496. Exact frozen source-contract integration is 46b6d12067c3f348e250751dff8a3c80b31b4382; original source author commit is 3ae8bd48502131a8d30bfaa38b04de3d733de97a. Source contract SHA-256 cb16049ea6f61372aa941f38dea9de983b7551697f9c1f08ad7fd1ae28b7f3b6; its input-index SHA-256 f4b7e8325cefa0372c9856dee73734a2514b8e6052cff66ba64146b6d141f2e8.

The complete task-gov01-gov02-source-contract-impact-review-r1.json, control plane, authority overlay, task registry, execution-state and reception receipt are bound at the actual dispatch parent. They are not required to have existed at an older product/source SHA. The human parallel overlay authorizes routine independent work within existing bounds; it does not grant a product decision, weaker acceptance, a budget reset, a parser run or another writer's paths.

## Original acceptance and unchanged global scope

GOV-01 action: 修dev_log解析器遗漏19项并保留不可解析记录
GOV-01 acceptance: 表格/bullet/纯文本/Status标题和多迭代fixture通过；discovered/parsed/unparsed逐文件对账
GOV-02 action: 修roadmap解析器漏3份AI文档，表头#可选
GOV-02 acceptance: 全部167个slug可解析；Slug/Status/Source/Depends On结构校验可见

Both remain pending with empty GOV evidence. Historical 19 omissions, three excluded AI manifests, 164 included rows and 167 expected identities belong to the original audit, not to an executed current parser. Current semantic omissions, parsed/unparsed, unique slugs and conflict totals remain UNKNOWN. Current Git filename inventory is 121 immediate package dev_log files and 35 top-level roadmap Markdown files. These are source-file inventory counts only.

The original nine fields (id, priority, kind, action, acceptance, status, module, gate, source) remain exact across all 312 TODO tasks and the scope-map when original_module is restored. Preserve 39 normalized-versus-literal module distinctions and the 150 nonempty gate_obligations item count; TODO.gated=118 has a different policy meaning. TODO.sections[].tasks[], EXECUTION.items[], and execution-state.tasks[] LIST retain their shapes. Formal state stays 13 completed / 3 verification_pending / 3 in_progress / 293 pending, 299 unclosed. Retained original/scope evidence has 933 references; actual-parent EXECUTION has 939, with the six additions confined to TT-08 and old ordered arrays preserved.

P0 product remains f9eb4b1f207bc4b46f547b90afc250424b3c8695. The four packages/plugin-web-time-tracker/docs/{design,api,test,dev_log}.md differences are documentary and stay separate from runtime. No audit/control document equality against P0 is imposed. Canonical Clock r2 is bound in full at 8bf613962517ee9b80bf51373e8ad88960c570cc and the current parent, SHA-256 214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae. Its whole contract, G1 contiguous E1–E25 checklist, A1–A9, fixed-before sequence, accepted judging copies C-FB002/C-RD1/OE with C-FD1 recorded, host/native/focus/capacity rules and protected boundaries are unchanged; this GOV task neither executes nor discharges any of them.

## Findings requiring revision

### GOV-R1 — error results cannot satisfy the universal byte-reconstruction oracle

Priority P1. Exact source-contract anchors: lines 56–58, 70, fixture I07–I09 in §9, and line 175. SourceInput admits arbitrary Uint8Array and strict UTF-8 decoding. FileResult.raw_source is only valid decoded text; for decode/read errors §4 retains a hash or read-error identity and no invented text. It does not define a raw-byte/base64 payload or immutable recoverable byte reference in that result. Yet §9 requires raw source byte reconstruction for every vector, including invalid UTF-8, hash mismatch and failed read. A digest alone cannot reconstruct invalid bytes; for a failed read no source bytes were obtained at all. E_HASH also has no declared split between supplied/untrusted hash and computed actual-byte identity. A future author cannot satisfy the written oracle without inventing an error representation or silently excluding the error fixtures.

Required correction, in the author's contract only: make successful-read/invalid-decode/hash-mismatch/unreadable-file/invalid-input results an explicit finite union. Preserve actual captured bytes or an exact immutable byte reference whenever bytes exist; distinguish supplied and computed hashes. Specify byte spans and reconstruction for captured bytes, and identity/error conservation with an explicit unavailable-bytes reason for failed reads, rather than pretending those bytes were read. Define empty-file and no-source-input outcomes separately. Give literal independently reviewed I07/I08/I09 expected results showing each branch, including no false parsed success and no empty-corpus substitution. This changes no business authority and needs no product status rewrite. No failing product execution is alleged: this is a documentary contradiction.

### GOV-R2 — conservation graph and generated projection types are not closed

Priority P2. Exact anchors: contract lines 60–70, 107–109 and 175; current generate-state.mjs lines 1488–1501, 1531–1554, 1579–1585 and 2170–2196; tasks.js lines 6–24. The contract requires uniquely identified atoms and every parsed record to point to a discovered atom, but its named BlockResult has no atom collection, FieldOccurrence has no identity/disposition, and DevRecord/RoadmapRecord has block_id but no atom reference. Coverage sets can name atoms with no defined result object or raw-field endpoint. Record IDs have no defined relation to multi-field atoms or synthetic error records. Consequently two implementations can satisfy the prose counters while emitting incompatible evidence graphs, and a verifier cannot traverse the required record-to-atom invariant from the declared schema.

The same interface gap crosses the consumer boundary: RoadmapRecord says every cell is CellValue, including status and slug, while StatusValue is separately defined without saying where it lives; §7 retains rows/status_counts and says task items become the full DevRecord projection without an exact projection shape. Current countByStatus/normalizeStatus consume status strings and tasks.js compares item.status directly with SHIPPED. Simply forwarding the declared cells/StatusValue objects would not preserve those contracts. The prose permits a projection but does not specify which exact fields are raw cells, normalized status claims, display strings, or null on duplicate Status. This is an implementation choice that affects counts and ambiguity, not a harmless private variable name.

Required correction: publish one exact atom/result/reference graph (including error/synthetic atoms, ID derivation, dispositions, spans and record-to-atom links) and one exact compatible generated DTO for task_progress.items and roadmap_manifests.rows. State how CellValue, StatusValue, raw_status and nullable duplicate fields coexist. Specify which successful atoms in a partial file are exposed/countable and which malformed/duplicate records are diagnostic-only; preserve original occurrence records and never select a business winner. Add literal expected result objects to the already proposed identity/error and roadmap fixture files, and exact generator/consumer projection assertions so string consumers do not accidentally receive objects. Do not repair this by loosening conservation or deduplicating away a source occurrence.

## Full contract and impact assessment

| Obligation | Independent disposition and source reasoning |
|---|---|
| Complete discovery | Accept proposed boundary: immediate real package directories + exact docs/dev_log.md, no package.json prerequisite; top-level regular roadmap .md files only. Bind every complete file, including non-manifests. Explicit enumeration/read/containment diagnostics prevent missing roots becoming empty success. Git filenames do not establish runtime parse totals. |
| Table grammar | Field/Value header normalization, reordered/extra columns, exact row width, bad separators, duplicate required headers and preserved raw cells address the current split-on-every-pipe/short-row filtering failure. This does not permit changing parsePluginMap's shared reader. |
| Bullet/plain/heading | Anchored bullet and key/value runs plus ATX Status headings cover the original Plugin Project, Time Tracker and Metric Tracker forms. Work Log/peer-heading boundaries and explicit context keep quoted/fenced fake statuses from controlling a workflow claim. Narrative status-like text remains visible rather than silently overwriting. |
| Multi-iteration and identity | Independent sections/runs/tables, Target/Iteration occurrences, heading context and exact spans retain AI lineage and the three TT documentary/history sections. Repeated metadata and Status stay visible; no package-name identity, newest-position/date selection or inferred SHIPPED. Raw absent/ambiguous Target is acceptable, not a GOV-03 latest-row decision. |
| Empty/malformed/unknown | Empty/no-panel/non-manifest sources have synthetic unparsed identities; malformed neighbors coexist with extracted rows; unknown nonempty status stays visible as a source claim. R1 must complete byte-error branches; R2 must make the synthetic and partial graph traversable. |
| Embedded pipes and raw bytes | Escaped pipes and matching code-span delimiters are distinguished from unescaped width-changing pipes; unmatched delimiters fail visibly. CRLF/BOM/Unicode and source spans are required. R1 is blocking for invalid bytes and failed reads; no lossy replacement decode is an acceptable repair. |
| Per-file/block/atom conservation | Exact disjoint ID sets and union equality are stronger than cardinality checks and are necessary. Raw parts must reconstruct the entire captured source including excluded context. R1/R2 close missing error/atom representation; byte collection alone is not semantic conservation proof. |
| GOV-02 headers/schema | All tables, required Slug+Status, optional # and explicit absent-number state fix the first-matching-table and # predicate constraints. Missing/duplicate headers, short/long rows, empty required cells and extra fields must survive. Source/Depends On present/raw/text remain distinct from explicit '-'. |
| Source/Depends On references | Rich descriptions and dependency annotations remain unresolved text, not readiness claims. Exact-path inspection may use a supplied fixed repository inventory, but the four proposed API signatures do not yet name that inventory input. Before implementation, the author should either add its explicit immutable shape/ref to the interface or explicitly keep existence resolution out of scope; never imply filesystem/network access from a pure parser or call a missing bounded-corpus path nonexistent. This is a clarification attached to R2, not a product-policy decision. |
| Duplicate slugs/conflicts | Keep every same-file/cross-file occurrence and related IDs; distinguish occurrence counts from unique slugs, with no overwritten Map winner. NEEDS_REVIEW versus SHIPPED remains a raw-source conflict, not authority to rewrite either document. |
| Historical expected set | feature-inventory.json contains 167 historical roadmap_features identities and 19 named omitted logs. Require identity-by-identity current/historical delta accounting, including moved/removed/duplicate/unparsed/unresolved cases. A fixed length assertion, min-size guard or today's parser output as its own oracle cannot meet original acceptance. |
| All three AI rows | Exact files xai-web-ai-tool-{layer,edit-delete,openai-compatible}.md have optional-# headers and NEEDS_REVIEW; AI chat Target panels preserve SHIPPED at lines 686/1135/1494. This source evidence is visible without running the parser. Registry association remains separate from recognition. |
| Three-file registry gap | Authored web.tracking.roadmap_manifests omits those three exact filenames. Only a separately reviewed/root-granted append to that exact Web field is a candidate. Existing intentional multiple module associations, including web-ticktick-parity.md in Web/Site, remain authored memberships. No naming-based assignment or manual status adjustment. |
| Pure API | Four named exports isolate interpretation from generator side effects. Finite diagnostic codes, nullable/unknown claims and no network/HTML evaluation are suitable boundaries. R1/R2 must complete executable meaning before independent test authors can establish fixed expected objects. |
| Task Progress Owner | tasks.js is the existing dev_log detail Owner; full source/error/ambiguity details and accessible shipped claims belong there. Existing all-shipped empty-state wording cannot represent unknown/partial coverage. Escape raw values with h(), preserve source links and document the proposed roadmap-inspection expansion. |
| Product Structure / Overview | Product Structure owns modules; Overview mirrors its product_lines/overview_modules and shared source summary. Product counts/progress derive via buildProductLines; they are source claims, not acceptance. Reuse summaries/vocabulary, link to Task Progress details and preserve compact drawer versus full detail distinction. R2 must settle the compatible scalar projection before execution. |
| Maintained versus generated | dashboard-state.json is authored registry; state.generated.js is disposable local generation. No source parser writes back dev_logs, roadmaps, authority, formal state, risk/priority/ship decisions or test verdicts. Legacy snapshots show UNKNOWN, not zero failures or fully parsed. |
| Regression boundary | Preserve product module keys/order/authored fields, plugin-map semantics, testing/release/Skill-Agent registries, branch/server behavior and unrelated UI. Generator-driven source counts can change only with reviewed projection semantics, never by silently changing module state. |
| GOV-03/04/05 | GOV-03 owns latest Target/iteration reconciliation and stale manifest corrections; GOV-04 status/log-field calibration; GOV-05 missing canonical PRDs. This proposal captures provenance/conflict only. It does not close those or GOV-08/09/10/12/14/SK-05. |
| A/B/C/D locks | Root serializes dashboard-parser/schema/Owner writers. A Clock/grid runtime/CSS remains protected; B TT/AI/product callers and C roadmap/proposal bytes are inputs, not cleanup targets; D reviews a fixed source and never repairs. Independent two-file review is lawful while implementation stays ungranted. |

## Exact future paths and fixture obligations

The complete finite candidate table from source §8 is retained below as review input, not authorization. All existing paths are hash-bound; new paths remain absent at dispatch. Conditional UI, registry, machine-contract, canonical skill and Cursor deltas require explicit exact scope. Symlink aliases remain canonical .teams mirrors; do not stage a nonexistent .codex child blob. No index mount/server/package/lockfile or broad policy/agent changes are granted.

| Candidate path | Planned technical responsibility / condition |
|---|---|
| scripts/dashboard/source-contract.mjs (NEW) | Four pure exports and lossless lexical/record/coverage/association functions from §§4–6; no generator side effects. |
| scripts/dashboard/source-contract.test.mjs (NEW) | Node built-in test runner harness importing only the pure module; semantic fixtures and failure/conservation assertions. Root package already supports Node >=18; no new dependency or lockfile modification. |
| scripts/dashboard/fixtures/gov-source/dev-log-formats.json (NEW) | Explicit literal-source vectors for table/bullet/plain/heading/context grammar. |
| scripts/dashboard/fixtures/gov-source/dev-log-identity-errors.json (NEW) | Multi-iteration, duplicate identity/fields, read/decode/hash errors and byte conservation vectors. |
| scripts/dashboard/fixtures/gov-source/roadmap-formats.json (NEW) | Required/optional headers, row width, Source/Depends On and non-manifest vectors. |
| scripts/dashboard/fixtures/gov-source/roadmap-associations.json (NEW) | Three exact AI source conflicts, missing/duplicate/intentional multiple registry associations. |
| scripts/dashboard/fixtures/gov-source/frozen-source-index.json (NEW) | Exact source refs/hash/path/range and expected semantic record IDs authored from the complete frozen corpus; historic 167 membership plus current delta inventory, with raw provenance. No snapshots generated from the parser under test as its own oracle. |
| scripts/dashboard/generate-state.mjs (MOD) | Bounded discovery/I/O errors, call pure module, emit source_parsing and compatible task/roadmap/product projections. Protect unrelated collectors and parsePluginMap. |
| scripts/dashboard/verify-static.mjs (MOD) | Add structural set-partition, complete coverage identity, caller-reference and schema assertions after lawful generation; preserve all current checks. Does not replace semantic tests. |
| docs/prototypes/dev-dashboard/js/tasks.js (MOD) | Single source-detail Owner, safe raw record/error display and shared summary function. |
| docs/prototypes/dev-dashboard/js/overview.js (conditional MOD) | Only existing roadmap/task/product summary coverage/units and Owner link; no GOV-09 broad verification/online-SHA dashboard. |
| docs/prototypes/dev-dashboard/js/product-flow.js (conditional MOD) | Only affected module projection coverage/conflict/association summary and Owner link. |
| docs/prototypes/dev-dashboard/js/state.js (conditional MOD) | Missing new sub-schema => UNKNOWN fallback only. |
| docs/prototypes/dev-dashboard/styles.css (conditional MOD) | Only exact new diagnostic/source-row classes if existing classes cannot wrap raw text; fresh selector lock and UI proof required. No global theme/geometry changes. |
| docs/workflow/project/dashboard-state.json (SEPARATE conditional MOD) | Only product_lines entry key=web, tracking.roadmap_manifests append of the three exact AI filenames after explicit root grant; preserve all other values and order. |
| docs/workflow/project/dev-dashboard.md (conditional MOD) | Document the approved new source sub-schema, coverage units, unknown/error semantics and current glob discovery vs stale “whitelisted” wording. |
| docs/prototypes/dev-dashboard/BOUNDARIES.md (conditional MOD) | Describe exact Task Progress source-inspection detail and related Mirrors; no unrelated Owner changes. |
| docs/prototypes/dev-dashboard/TEMPLATE.md (conditional MOD) | Reusable lossless source-coverage pattern only if approved behavior is intentionally reusable. |
| docs/prototypes/dev-dashboard/README.md (conditional MOD) | Operator-visible source-coverage behavior/opening instructions only if changed. |
| .teams/skills/xai-dev-dashboard-sync/SKILL.md (conditional MOD) | Require new approved source coverage/schema checks in bounded future sync workflow; retain human decisions. |
| .cursor/rules/xai-dev-dashboard-sync.mdc (conditional MOD) | Mirror only the approved skill delta. |
| docs/workflow/project/release-log.md (conditional MOD) | Future truthful project-system/dev-dashboard entry after actual implementation verification, using the release-log skill; no current append. |

Review covered the whole finite §9 fixture matrix: D01–D14; I01–I09; R01–R11; A01–A05; C01–C03. The exact five proposed JSON fixtures are dev-log-formats.json, dev-log-identity-errors.json, roadmap-formats.json, roadmap-associations.json, frozen-source-index.json under scripts/dashboard/fixtures/gov-source/. No fixture/test/parser was executed or written. D covers all four formats, wrappers/case/extra cells, unknown status, escaped/code/unescaped pipes, bad separator, context, narrative and empty input; I covers repeated/absent Targets and iterations, duplicate fields, whole TT/AI lineage, byte/read/directory failures; R covers optional #, reordered/duplicate/missing headers/cells, malformed structure, Source/Depends On, multiple/non-manifest/empty tables and duplicate slugs; A covers all three raw AI conflicts and exact/absent/multiple registry associations; C covers every current source plus each historical expected identity and deltas.

Independent expected fixture objects must be reviewed before a writer runs tests; fixtures generated from the implementation are not an independent oracle. R1/R2 need exact result objects, not only this matrix of descriptions. Later fixed/integrated projection checks include every unresolved file/block, correctly named count units, accessible shipped claims, raw escaping/source navigation, old-snapshot UNKNOWN, and unchanged protected registries. If UI changes, actual owned Task Progress, Overview and Product Structure must receive desktop/390px long-text/error/unknown/conflict/keyboard/link/console verification. Screenshot totals do not establish acceptance.

## Provenance, inherited evidence and process boundaries

All 534 source-contract input identities were read as complete Git blobs, not truncated prefixes; the complete original 41 discovery bindings at 28ba1cf444f2545fb93dd0340204530e07f8f6f6 remain included. Their available 6db2aef8d316835e2aea2d469073e25899d6e1fd versions, 3459614e6bf410b52bf1cf2f7c4035f2054e5be1 integration versions, author-parent 19c55bad0a7d5a002a262e47c79c1a3ff74f21a3 versions and product/original-ledger versions are distinct immutable identities. The discovery outputs are bound at original 3b1633722b1f84efeaa29d110e5c37b7704b5f92, integration and current author/dispatch parents. This review additionally binds the whole contract.md and inputs.sha256 at original 3ae8bd4, frozen 46b6d12 and actual 6f5910e. Every used complete output Markdown is present at every SHA used for it.

Discovery.md SHA-256 3c4179d9476f3d4aec9090ad1df05b29be91922e93a7d56b503a443a81b63494 and discovery inputs.sha256 dc83df671cb64715c17cb49ccab83020f898dec082b1a5d1dfbb8961e0705191 remain unchanged. The root receipt's original alias lookup failure and corrected canonical lookup remain historical metadata; WHITESPACE_ONLY1 plus checksum-metadata1 does not establish semantic coverage, and prewrite proof for that discovery remains NOT_ESTABLISHED_FROM_HANDOFF. Source-author static1 PASS is documentary only, not parser qualification.

Canonical .teams/skills/xai-dev-dashboard-sync/SKILL.md was read completely and its use announced in bounded source-check mode; SHA-256 641e38f01a42978107e345bd90447b285c5bc12011de260194d133de5beb04fa. .codex/skills/xai-dev-dashboard-sync and .claude/skills/xai-dev-dashboard-sync are tracked symlink entries, while the alias SKILL.md is not an independent Git child blob. The exact canonical skill, symlink blobs and Cursor rule are bound. Explicit task constraints override refresh/generator/tests/registry-writing steps, so there was no routine permission stop.

The original static/dashboard PASS remains at web/9257be4 with its recorded six modules, 17 testing records and 66 skill entries; it proves that historical structural/freshness scope only. No current GOV before/implementation/frozen acceptance is inferred. Source-purpose costs whose histories are not reconciled remain UNKNOWN, including current parser-purpose prior costs.

P53 corrective provenance is read at dispatch: source-impact artifact 309483d66397a1e4bc83760de032321bd1f01432 has 633 raw / 633 unique input labels; impact-review artifact ab1ea42c09a055a599902d4d2b42d7c42d77e252 has 649 / 649. They are different artifacts, with their own whole Markdown and indices bound. This review does not compare one artifact's headline against the other's count. No headline/minimum-length/cardinality adequacy guard is used. Shared source collection3/3 and independent review3/3 exhausted; full integrity remains unqualified. Outer impact2 BLOCKED/unadopted, Clock retention visual3, M8 REL purpose UNKNOWN, BRD final author3 failed and CD full review3 REVISE/exhausted remain local holds; no global stop or fourth attempt is implied.

## Required continuation

Root may receive/preserve this review only as full-scope REVISE. Register a fresh bounded contract corrector within the existing author cap to address GOV-R1 and GOV-R2 across the whole contract, with every original acceptance and unaffected rule intact. Re-review the whole corrected source contract independently within the existing review cap; do not treat a narrow diff or this review as approval. Root technical adoption is required before a product/before grant.

After technical approval, root must reconcile UNKNOWN per-purpose histories, register exact actor/worktree/source+integrated SHA/path/semantic locks and lawful budgets, then obtain complete valid fixed-before evidence. Only then may a fresh author implement exact approved code/fixtures/UI and conditional registry/contract/skill deltas. Independent full frozen and integrated verification must cover semantic fixtures, complete source identity/conservation, affected generator/consumers/regressions and actual UI if changed. Preserve true cross-vendor verification; another Codex instance is not another vendor. Fresh uninvolved Astra must accept both whole original GOV actions/acceptance, including historical-set reconciliation and remaining conditional obligations. Root alone appends evidence/reconciles with unchanged formal states, refreshes inventory, preserves remote ancestry and runs applicable sync. No caller/SHIPPED/release/implementation/source-qualified/parser grant is made here.

## Prewrite and cost receipt contract

This is reviewer iteration1/3 and source-author-used1/3, not a reset. One sole concluding documentary static invocation is allowed. Every complete bound input and both complete review/index buffers must be checked before any file write; actual failure freezes the task without retry, materialization, commit or amend. Only after prewrite checks pass may the exact two ADD paths be written, read back and staged. A successful document checker can coexist with semantic REVISE. Its actual numeric PID/exit, stdout/stderr completion, tool result and final commit receipt are retained externally in this task's tool trail and final Handoff.

All parser/generator/runtime/tests/build/typecheck/lint/browser/native/server/qualification/probes/vendor/children/push/fetch/sync counts for this reviewer are 0. Source-byte reads, JSON governance inspection and document checks are not production parser executions. No target parser or repository generator module is imported. Input Git reads use synchronous spawnSync and capture each numeric child PID/status/signal/stderr; no persistent cat-file process, stdin writer, background thread, server or owned process remains. Some UI tool displays were truncated; complete source buffers were read directly from immutable blobs and remain bound, so display truncation is not promoted to source omission. No input lookup failure, checker retry, unauthorized write or correction of author artifacts occurred in this review.

Only review.md and inputs.sha256 in docs/reviews/audit-parallel-gov01-gov02-source-contract-impact-review-r1/ may be added. One exact-stage hooks-disabled commit uses real newline Why/What/Scope/Risk/Docs/Tests. No amend, push, fetch, merge/rebase, sync, branch promotion, release or other-worktree mutation. Root owns reception and remote preservation.

## Appendix A — full original two-item records

```json
[
  {
    "id": "GOV-01",
    "priority": "P1",
    "kind": "修复",
    "action": "修dev_log解析器遗漏19项并保留不可解析记录",
    "acceptance": "表格/bullet/纯文本/Status标题和多迭代fixture通过；discovered/parsed/unparsed逐文件对账",
    "status": "待复核/待办",
    "module": "web",
    "gate": "当前范围",
    "source": "01-inventory-governance.md;05-visual-ux-audit.md",
    "primary_workflow": "B",
    "original_module": "web（project-system）",
    "formal_state": "pending",
    "retained_execution_record": {
      "id": "GOV-01",
      "status": "pending",
      "evidence": []
    },
    "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
    "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
    "gate_obligations": [],
    "source_section": "GOV",
    "acceptance_evidence": {
      "business_acceptance": "表格/bullet/纯文本/Status标题和多迭代fixture通过；discovered/parsed/unparsed逐文件对账",
      "existing": [],
      "required_future": [
        "fixed-source contract and before evidence",
        "implementation commit and exact scoped patch where needed",
        "independent frozen verification and affected regressions",
        "independent Astra full-scope acceptance",
        "controller evidence reconciliation with unchanged formal states",
        "inventory refresh and remote ancestry/sync receipt"
      ]
    },
    "tasks": [
      "GOV-01/prepare",
      "GOV-01/contract-review",
      "GOV-01/before",
      "GOV-01/implement",
      "GOV-01/verify",
      "GOV-01/accept",
      "GOV-01/reconcile",
      "GOV-01/inventory"
    ],
    "execution_state": "needs_fixed_scope_discovery"
  },
  {
    "id": "GOV-02",
    "priority": "P2",
    "kind": "修复",
    "action": "修roadmap解析器漏3份AI文档，表头#可选",
    "acceptance": "全部167个slug可解析；Slug/Status/Source/Depends On结构校验可见",
    "status": "待复核/待办",
    "module": "web",
    "gate": "当前范围",
    "source": "01-inventory-governance.md;05-visual-ux-audit.md",
    "primary_workflow": "B",
    "original_module": "web（project-system）",
    "formal_state": "pending",
    "retained_execution_record": {
      "id": "GOV-02",
      "status": "pending",
      "evidence": []
    },
    "fixed_input_sha": "e041c2bc293b70db367444c62c4300231976dbf7",
    "product_sha": "f9eb4b1f207bc4b46f547b90afc250424b3c8695",
    "gate_obligations": [],
    "source_section": "GOV",
    "acceptance_evidence": {
      "business_acceptance": "全部167个slug可解析；Slug/Status/Source/Depends On结构校验可见",
      "existing": [],
      "required_future": [
        "fixed-source contract and before evidence",
        "implementation commit and exact scoped patch where needed",
        "independent frozen verification and affected regressions",
        "independent Astra full-scope acceptance",
        "controller evidence reconciliation with unchanged formal states",
        "inventory refresh and remote ancestry/sync receipt"
      ]
    },
    "tasks": [
      "GOV-02/prepare",
      "GOV-02/contract-review",
      "GOV-02/before",
      "GOV-02/implement",
      "GOV-02/verify",
      "GOV-02/accept",
      "GOV-02/reconcile",
      "GOV-02/inventory"
    ],
    "execution_state": "needs_fixed_scope_discovery"
  }
]
```

## Appendix B — complete current bounded corpus

Every following full file is bound at actual dispatch SHA 6f5910ea036ee6f54a26f25c4faba63389aac496 in inputs.sha256, in addition to inherited source identities. This is an inventory of complete source bytes; it reports no runtime parsed/unparsed result.

- packages/account-signup-login/docs/dev_log.md — e3e4629ff5a3e689d99a101a3a165e6daff49c8c65cf4caaa3069bf67e4ebccb
- packages/aes-gcm-aead-core/docs/dev_log.md — 059fbebc373a91e64c38e02a95f70ee04fe771e0d9e4c4ad7fd9f27c65bce8a6
- packages/audit-log-integrity/docs/dev_log.md — b4b7ca76e85199647c5cd41a47502baee171a0123cf5a701ed0c09a4c845494f
- packages/bip39-mnemonic-24w/docs/dev_log.md — 11b7a184f11af9a6c85b9a4f61dd3743e11a4f586a724c2f15c440ce21b43778
- packages/cipher-envelope-codec/docs/dev_log.md — 8a7a824cc2b435020801f915f8c060d5f80572ab78e2ceaf33beb1a079d6fb0d
- packages/click-through-matrix/docs/dev_log.md — 9c7f5924ead924ddde5ed243fb9bf77cf414e939c1154ccf1d14535493ec458d
- packages/commit-seq-authority/docs/dev_log.md — 07f153f891b3a2904251900436b7fdf4dc133620451b64964d78c836ca3fa68f
- packages/core-data-sqlite-driver/docs/dev_log.md — 2645455e345c49fcd0d509072da5f2624156d29f860bfcac7502fa361175c0e5
- packages/crypto-deps-lockdown/docs/dev_log.md — 2be770c1786c248407f385fa56215980ca6d355ffbfd706f2ee82ca559827423
- packages/crypto-tauri-commands/docs/dev_log.md — 5c874ae5e3d73a7375cd2d982ed7e0da8081ee0714937a2530c0de101006e428
- packages/deterministic-cbor-aad/docs/dev_log.md — 298277a5fdf4592df9a8a1e78f6a2dfc8a9b130a5d6ec0cd119a8afca14f27fd
- packages/ed25519-recovery-signing/docs/dev_log.md — 2281caf28b634c32b549c2080061e6f24489489908cd7bcb754ab419b3f579c5
- packages/finder-dnd-path/docs/dev_log.md — 0c5e2588c6ee955e8d178dc0a9e7b38f62ee11e8adb330393561a81535a6221b
- packages/grid-persistence/docs/dev_log.md — 502bc4d4d5d8e82358c1bed5e06072b1b6134e479f6d0e1f3fda1a4cb92d74bb
- packages/grid-shell-organizer-content/docs/dev_log.md — 85c400b369f4b95fa29b378f0df52f6b8db5aa4dcc84cfeedb912fd74c35cf31
- packages/grid-window-prototype/docs/dev_log.md — 61f195e16df5ae95b29a528e1903faa8dd72cb57951ff58777ed6be36121ce5b
- packages/host-business-residuals/docs/dev_log.md — 552d33ca19783808d6f14a350647858bebc2f8a4b2de6389fec413453db25976
- packages/hpke-per-device-wrap/docs/dev_log.md — 83501b76c0ad74d61c6f02c3c414011a082eb4c4c815b81edd993bcad21ec411
- packages/kdf-primitives/docs/dev_log.md — cc71537f1e2ea1e61b1e0f488a21a652f7eafc1e52731b85f54cc032385b54d1
- packages/keychain-bridge-macos/docs/dev_log.md — e317f07e3da6164911eb8035ac5f18e275c6eeaaea82b8cd47384bc32b2cfce2
- packages/keychain-opaque-handle/docs/dev_log.md — 05e8bec60aa885199457f100f55ee1b236f5248a81e47f08388352f8d8a8ea2c
- packages/localstorage-migration/docs/dev_log.md — 560da4c2fa87482a0e7c8e91cbdb8c9ff57cc8f6e5a620af319a66a95c484559
- packages/mas-sandbox-dry-run/docs/dev_log.md — cba25c8c7aaaf36d6da29161f6199d0f6d6b5cbfc5b2df95087686f83d0681bb
- packages/menubar-sync-status-icon/docs/dev_log.md — ece62adade12f5c154c48064d3ea40a98c2aac0102ef44f1080df60301269814
- packages/multi-grid-event-scope/docs/dev_log.md — 37fd30cc055f2b58e233c222841f45e17480775632d8084ca1b2ddee22a21a77
- packages/native-dnd-path-first/docs/dev_log.md — e66e7f738eb101c9849e7a618712257d5ce038cb3dcd70fbcbf2545b62da333d
- packages/nonce-lease-server/docs/dev_log.md — dd962c7f530310a5724d77de2a9b53426c9812aea24d78667c11676c31b8bb43
- packages/onboarding-backfill-ui/docs/dev_log.md — 2838201a152325327c37974bfc691fc9e1e47abcacf62c88e7dfb99cde8c8743
- packages/plugin-account/docs/dev_log.md — 95e06c6dd52b6342a2b1f1050415f47044f6c4ba4a4c59d92ecb92d0ac3ea32c
- packages/plugin-ai-cube/docs/dev_log.md — ecb2f01c8962cf603d49bc3f580ec40d3da682ef2e4c57340d026849eb6432f1
- packages/plugin-calendar/docs/dev_log.md — dc2d5a713aa33c4fe5a92fa3eaa61220116ff27f97d5762aa3f15aa061e79d49
- packages/plugin-clipboard/docs/dev_log.md — a9596c4c8d50e032d40359c94b51ae58c2ced346741212fe357e76d7f7743c36
- packages/plugin-console/docs/dev_log.md — 94a556db22b3eb4bd8b1b944c758f07762400975e4921eca7575932f9604e566
- packages/plugin-labels/docs/dev_log.md — 3dfbee0bb03742d9eb2fbabf8924b4c6802695eb4f7bb02792cb8910e4c82652
- packages/plugin-organizer/docs/dev_log.md — c22b3c07e180c47a2bcefa7054d6749e13e87284491d8279a3759080f9ba3db8
- packages/plugin-pet/docs/dev_log.md — 34fc73a2ddcc4ce41488a94e70270b8bdcc0424cd4464a5552d761020319eae2
- packages/plugin-productivity/docs/dev_log.md — 1afc05654ea97c12d8b5da0a264325e988cfcd7eb92e2d2f67dd55482b890ece
- packages/plugin-project/docs/dev_log.md — 5a92afdc160b210028daeddf917f2a8bdb8ba4030d1ed260fe864deb4022a579
- packages/plugin-web-ai-chat/docs/dev_log.md — 37317e03ac4f28e3f65e6eea7f15ae50eaaf76106b6d6b603ed54afaf5cacca5
- packages/plugin-web-board-core/docs/dev_log.md — 7534db30b26c4e02ae250c5fb0a50669cbcaa9d46197619c454f6bab716a751a
- packages/plugin-web-board-views/docs/dev_log.md — f85d48b3bb37dd479a5c08d4eee7ee0d78bf43dd0c2bc2264aaaf8133e69a50d
- packages/plugin-web-board-workspaces/docs/dev_log.md — 07b0d3a892337f4a7f32b500b68503b6aee8fa9419aef569292ab094adf5943d
- packages/plugin-web-bookkeeping/docs/dev_log.md — 14a1479194553eccbf72354a98cdc333efc7384d8cb25fde2328806db68b9031
- packages/plugin-web-metric-tracker/docs/dev_log.md — 48aa74eea05eff6f64cf8c3fc9bb272d000758e2c25d640a4ca7760db9d6af46
- packages/plugin-web-pomodoro/docs/dev_log.md — d43f00dc99b4f6811567d4ab671910439e771d1319e3fac3ba2d721b93ccc9d9
- packages/plugin-web-settings-rest/docs/dev_log.md — 1f3373c8d2cd55cd5fa192a63268c1b521ed0ce3739d38a9ff7dea9c37cc6ede
- packages/plugin-web-settings-shell/docs/dev_log.md — 748c43f6c81e67abd831b0ed3d14f392f8e6337b4a63cc0b8dabb3a31ad2c8d3
- packages/plugin-web-time-tracker/docs/dev_log.md — 1eab6611b01f9a3622544b8da2147d14bb78ce1916d722e4dd5aab242aeb28ad
- packages/plugin-widgets/docs/dev_log.md — 57afc9170aba08d878004c6c6084aede3f9f7bb8f38460e5ddbb98abce08af49
- packages/protocol-integrity-integration-tests/docs/dev_log.md — 5d3e08b44e569cfa31236b5450fe128779b42a0fe656d667215b026190084707
- packages/push-edge-function/docs/dev_log.md — 9425797883180b467202e7a0b2c543a0a76923e9ef8e215ad4c4f2b5afd75679
- packages/realtime-private-channel-config/docs/dev_log.md — 7ae9f432f7d107d49d099e0f6e026c6692277558a6529f064ed0ce0edbaeab3f
- packages/recovery-proof-edge-function/docs/dev_log.md — 2cc734a08fdd5aa3be0b764c5ce5769ddf79e3c663faf0eae51a3ad5395f2281
- packages/recovery-rehearsal-3-rekey-kill9/docs/dev_log.md — 032b0cc48b86d0cd04c1773aedef2a8161ea8824a36ca70851ead5e3821b3071
- packages/rekey-two-phase/docs/dev_log.md — ac4ca8b6937276be881211f71525f7522811b50141052c14627a0771039d5ce3
- packages/repository-v0-contract/docs/dev_log.md — 8c36757387d32b32597a4b03c261725d911cc2a80f08fbadb1a160be83f0db7d
- packages/rfc-test-vectors-gate/docs/dev_log.md — 6605ed6198efa0886e4dda7ec1d4e4ec6fbe0f59687cfa62e88c19971da61a7a
- packages/rls-fuzz-property/docs/dev_log.md — c2b1628e8ad4b5596d7a1b50f672bb52d842953a03cdf7f74edaac7acd39b66f
- packages/rls-policies-and-tests/docs/dev_log.md — 89dc71d2ff4769ea63c6feb9817c6a37ea66849731f96497dcb5a9078ff26198
- packages/roadmap-kickoff/docs/dev_log.md — d817c8168101559480bc96dd63076c99eb09c9ea92eb68297f08b11c2476a88a
- packages/rust-keyvault-opaque-handle/docs/dev_log.md — 99d0ae8ef244c49734a1cbe136c896252005e8c23aee1f0bf57de76dba8b3601
- packages/single-table-todos-e2e/docs/dev_log.md — b628e8b609b746c58b60d1e1192cec2b6054089064ce397dfd59d0bfd9ab231b
- packages/spaces-multimonitor-matrix/docs/dev_log.md — f4c57f70cf7e44740097497b7c25074534b3aa9d41002955a14ac4dede415a14
- packages/sqlcipher-local-db/docs/dev_log.md — dfc882f71cbe49d8be73b0fe207e6481b43b1c97f8659a3f49dc0d15d0e3a50f
- packages/supabase-schema-migrations/docs/dev_log.md — d68c9de6e7f024575bd36859ac72ee34046ff5dadcc8f02ff715d385bfd72063
- packages/sync-engine-pull/docs/dev_log.md — f6f1d5a44e4871dfcb1143d9555bdfbee54b425913507e052c210fd27e4f567e
- packages/sync-engine-push/docs/dev_log.md — 355348f641b7bfa2cc25d88e9b146b718da8653d9db44ef3b22555c5728f91a0
- packages/tauri-capability-allowlist/docs/dev_log.md — 91890f1a44b31ec0321105ce96c6792735aa237d22967c74369c021aa371fc7e
- packages/tla-protocol-model/docs/dev_log.md — 076842bd2f5a0e389aed5eabd8f5d54325c33a602873d3dbefa129f32b416f7b
- packages/ui/docs/dev_log.md — 7b1a340629d759d43877958c9b0a7c971b65b793c6b8a29be3ea948cdff97aa6
- packages/web-architecture-adr-lite/docs/dev_log.md — 082d58a4bf49c954477f1af57f0100abbc766180b4f6af326787e01ae5851ed1
- packages/web-auth-device-session/docs/dev_log.md — 49297bbc8c192e65b8580ca3c8d23342a443ad277b5d95c60b969c95bbd3b585
- packages/web-browser-e2e-crypto-runtime/docs/dev_log.md — fc8f68914bb9e0bc7b6354481b8554534b743b61ce69f7fac707a81cd04d65e8
- packages/web-console-host-router/docs/dev_log.md — 23aed847f2f59bb321e257083daafb3e2c0784e7178ec1136c50642741e07a55
- packages/web-encrypted-indexeddb-cache/docs/dev_log.md — 5a5d537bdb86ee3c7f0e98b0ad62d60d5e9b578833c60d1188c59dbe2d9aeea9
- packages/web-plugin-map-contract-reconcile/docs/dev_log.md — fc6727ef8ce87f5c648a4a3589a746d9d45e74a76e6db0b0151fa4430e7136ed
- packages/web-release-site-archive-vite-shell/docs/dev_log.md — f3ac3a1141976692389132732ac32bba7345f1e4ef92143027a95f9b94f91b14
- packages/web-security-csp-sentry/docs/dev_log.md — e3f521e71b0e24190c80dbc19052ab6db5aaf0d238ab7dee7f5fb42cd6853ffa
- packages/web-sync-blob-driver/docs/dev_log.md — 60457e57971d70c468448b7aaaac51ef6182c576217636c9547ea6885951a9ff
- packages/web-sync-crypto-contract-preflight/docs/dev_log.md — 056070c296b7fdb79321411f445d6fba469f424f6d146aaeafce5b2d3b2f1970
- packages/web-todo-first-slice/docs/dev_log.md — 7abf567a97e6e569c1cccabb3f9997decc573946efa5110934db8b599cb5d7e7
- packages/window-command-contract/docs/dev_log.md — b1fbee6a6a25874be1f7d13f95cbd61528e8567e9a36188b575229de4f9c10a1
- packages/window-ground-truth/docs/dev_log.md — 6bda45736c6e764cb31683556c9e819dfcf1a13870a60657727242c784072568
- packages/x25519-device-keypair/docs/dev_log.md — 78c78b3653a119a43a20606285d52cfeefe60804b19cc82af835ac1c61a60d67
- packages/xai-web-ai-chat/docs/dev_log.md — 7e48c806083f1e402941b63d38911f6b5209cd9003f243298fb8ab052dab08e7
- packages/xai-web-board-automation-lite/docs/dev_log.md — 3113c7a9d0c88adacaf115a60754b44517af09c45bac0f662887a4e1585ff9ff
- packages/xai-web-board-calendar-feed/docs/dev_log.md — 9be116fde0dec5310f696574eb2282edccaa94293206867f4de0adee3a13cb31
- packages/xai-web-board-card-crud/docs/dev_log.md — 0f217bb414a47551f60d1f0f10c605dd2bf75ccbd439bc21c586632190b1cbcd
- packages/xai-web-board-card-detail/docs/dev_log.md — 562460dc14daa66cb9313effef641c4af2cb848dc70efc65428cb58328f5be9d
- packages/xai-web-board-checklist-editor/docs/dev_log.md — e1a4854a7886af238f219b978549f6271f5e4aab9ed34888d61fe995c3fde6b6
- packages/xai-web-board-comments-activity/docs/dev_log.md — e21aae9dbfd0f4cd5b6e45d99e2d193baae09291207b85ab2559ec068e451eb8
- packages/xai-web-board-date-model/docs/dev_log.md — 212b0c17087aeb965d3082f0c8096de6e2dc87a8e6ad89fa78e88381a0fa4c93
- packages/xai-web-board-export-import/docs/dev_log.md — 5f07fe2dec9627c85b12a1aa69eed11b8f4e46c1670e3211acd8211f4a26112a
- packages/xai-web-board-integrations/docs/dev_log.md — 79262ceef382ff6bc4c8a7f1627d441ad4ac11bdade4e83687189c9514d3403c
- packages/xai-web-board-list-crud/docs/dev_log.md — 70af2c34f2fcc5b5d73c73462a38ca0bb69ceb1f9d5e7498a2d5f5032412ff10
- packages/xai-web-board-permissions/docs/dev_log.md — 41956370975328fee75c2ef3c2e21ff495e3544bbd269635dc552579c11b4a90
- packages/xai-web-board-responsive-smoke/docs/dev_log.md — 86e430268e886afe249635c74bbfb62e4d67fb10a29b58613ec3c90c40feb316
- packages/xai-web-board-saved-filters/docs/dev_log.md — 0ff01986b5168dbb50061c9d742efdfc5385a0ced76c59c54a4a21bec12223d4
- packages/xai-web-board-share-contract/docs/dev_log.md — 2163b1aad763ae7e37dd02215d21c0d349944781d82d4c685961793171c8819b
- packages/xai-web-board-storage-contract/docs/dev_log.md — 16e82a34d78c05f3729cb4b561185870306c03c0db5818cbb302cf94c9e20de2
- packages/xai-web-board-task-link/docs/dev_log.md — 95efb2e3815cfbd36156e76e8b3fd00d73131c9538526ef466cd7e084573970c
- packages/xai-web-board-workspaces/docs/dev_log.md — 01f36ab5708f32fa50c1ea70c160fe0a83c69e7cede5d4c5bab474f40cd6e4f6
- packages/xai-web-build-form-adr/docs/dev_log.md — 43843f43811b57c96a6bb328d6bc9d5b6296401a0807e171c9fe909ff25af859
- packages/xai-web-calendar/docs/dev_log.md — 0bd60584d5766d21edf5795bcf13f900cd0d7f66ed29e83d5cbdb05774485431
- packages/xai-web-cmdk/docs/dev_log.md — ca39960c445e59fa55c6676770ca465e40b918895b25ae55d84ba831da671b16
- packages/xai-web-countdown/docs/dev_log.md — 9cdd3a573f87dde59b20d4f73fa22e261ee21035bdc434b19261383581dbe231
- packages/xai-web-dashboard-grid/docs/dev_log.md — 6711a6784a1dfddfba19604475352f0abce0eb528f9d7438c98b7bbb5ffddc19
- packages/xai-web-dashboard-widgets/docs/dev_log.md — 8248fc97271ec557c93188cd25d32c1dad02f94030bc3962899afc01428dfcaa
- packages/xai-web-deploy-cloudflare/docs/dev_log.md — cab11f3ee2ed3bf4781d7ad59de274f265619e576469553edaa29a9a21da548a
- packages/xai-web-event-bus/docs/dev_log.md — 8eb4fb7fe5ebc6e2de8c25cd4f298c1d8863836d1fe113f9b926b3f3e3f1fbfb
- packages/xai-web-habits/docs/dev_log.md — dffe4c14943d71495ac18ddbc8472558551c8a0faae1ebc180b1c31fc479f725
- packages/xai-web-matrix/docs/dev_log.md — 22d41513a5929e26fc53006fda3e93989f9c4fb104020f52d6a641f8ce96a9b2
- packages/xai-web-meditation/docs/dev_log.md — 44d6dcb801f55e4db2a2ca5f60a4ba8fd1205ba3a8ed4abcd1e76d2bc918019a
- packages/xai-web-persistence-contract/docs/dev_log.md — c1f8b995c1c4739611b97432dc1a453a490632659ee88906f6af578fa4c51e4d
- packages/xai-web-pet/docs/dev_log.md — 5b49686077c8ef16f764a327dafc3c1dddac2c237a876a98d9ed01edc4125e30
- packages/xai-web-settings-appearance/docs/dev_log.md — 18e56cb94d6efbadab8f51485fe14a08042b1c46ad1d229d6858a6e1c6baae57
- packages/xai-web-settings-features-panel/docs/dev_log.md — 2d48a629c91044405a178ca4b0f39fa39c3460c0cbb8dd17df95624bfdd9e5fe
- packages/xai-web-shell/docs/dev_log.md — 540abf75ebe94ff52e39226c738f15cd18867293945bb033329b8361aad8a04b
- packages/xai-web-statistics/docs/dev_log.md — eceb71d24841f000754f1920fa14646149fd56a4abaf3d103bb1971542b93da2
- packages/xai-web-tasks/docs/dev_log.md — c94732062197bba8e5e9a9ea51a99393fe719ee714406435ad868d4f302aa023
- packages/xai-web-tokens-and-i18n/docs/dev_log.md — fc8f24a1f24b8ac24d5c90ee630cf0489d3bd3fa26f0bf89368eb453b3b77300
- docs/workflow/roadmap/account-cloud-sync-foundation.md — 153be6649b66bc69cbfd51eff927bbba94b7ffa907dea74d96b24a9437fe3eed
- docs/workflow/roadmap/sync-v1.autorun-20260519.md — cd1419bf10ef60e8dd2d974c2e6f86aa76457eca847d02cdf61ec753d69bcd6f
- docs/workflow/roadmap/sync-v1.deferred-gates.md — 520f24a896728637ecf6341ac871f4b5405d4952f4265724cc2cd9ec4f145295
- docs/workflow/roadmap/sync-v1.incidents.md — 7fb629dbf4dbe28ae206abc48aa1bdc55b4f675dd1676ec6692ecbb3827002be
- docs/workflow/roadmap/sync-v1.md — 5125196d742c21849b17bdaa8055c8ae9bf2b1599bd6377f6faea66be7f65f89
- docs/workflow/roadmap/sync-v1.tasks.md — 2a8255b96f36a66330a5334624e6003861dca5c4683973c6c8025bf7727d6d32
- docs/workflow/roadmap/web-ticktick-parity.md — 6159bc594f1698f27d18b3344debffdfef33e3ad6bb7618c505c5ad27f063201
- docs/workflow/roadmap/xai-admin-dashboard-system-integration.md — b068afd2fb376975c6a0e77647f8276713e93ca32d67203a5708ce9cd9e4630b
- docs/workflow/roadmap/xai-g0-window-spike.md — 4a3b71733e65c139de0ff02041a7b72e8eefb1f45d6990d36ad4c2a40494a5c5
- docs/workflow/roadmap/xai-g1-native-foundation.md — 3699e2ca27e341e2064f999981c47aee380ee7cb6936c8c1085803c28a57fbb6
- docs/workflow/roadmap/xai-g2-data-security-foundation.md — 1a031b307ec06ddc34cb3b46aa1fd4f906aaaf23d9c014d3fbce2c9d8fdb0f1e
- docs/workflow/roadmap/xai-v1.autorun-20260519.md — 6e9927c80f82ce0f633c407fc7481771d68f30a03c7339e5fb81c13b5a3358ff
- docs/workflow/roadmap/xai-v1.deferred-gates.md — 7892422b4fa27cd4165edfaf0601124d2c0e62ceb79e464a2d8a1111fdb8f0c0
- docs/workflow/roadmap/xai-v1.incidents.md — f4d1f345c3dbdc112db670208803a80832d0dbe2d784ce149b76cf8928e7a3fa
- docs/workflow/roadmap/xai-v1.next-phase-targets.md — 44239936274dd65266d2b3861a09ba4b1fd7862ac5dd37094af638bb9fdbd651
- docs/workflow/roadmap/xai-v1.parallel-wave-plan.md — f76b018088c4d99065aceaebee7f0f9c4f8eccdec5f478cef38507f01f985219
- docs/workflow/roadmap/xai-v1.track-b-log.md — 1b46881b575a1dd4893b8e1b3937e937e96faf2a54e8919691c94c219eb7c561
- docs/workflow/roadmap/xai-v1.track-c-log.md — 915d931939eb5ff59b36e4c6234d2e347c0fcdbb62fc6136afd87150907d33ca
- docs/workflow/roadmap/xai-v1.track-d-log.md — 6299aa7d937b6aeabcfbde4d88dfe052c93409e2edd6d4217ffd2948d076e049
- docs/workflow/roadmap/xai-v1.track-e-log.md — 937eea0937c6cdcf392d4896f55a72319a4c3cdf9c65465df16de3551a5be3d6
- docs/workflow/roadmap/xai-v1.track-f-log.md — f536284215e220ed899f1f78faf480ef44395a3383a25749a9de8540270a0ec7
- docs/workflow/roadmap/xai-web-ai-tool-edit-delete.md — 4230fa5f22277bc4fd01883d80192d97eb8a302a1e9bbaa5c4659706707c36bd
- docs/workflow/roadmap/xai-web-ai-tool-layer.md — 1512a168c7edfff03079ec255c9edf98316d225b53ad809f6722f19beedc352d
- docs/workflow/roadmap/xai-web-ai-tool-openai-compatible.md — 3f6535fb7e30712fc39851c352a79a9c14dbc2433e94e41cdadeac88323806f3
- docs/workflow/roadmap/xai-web-calendar-event-create.md — cd979b33e17d0a6b796018448d2d0411891ae2d13324dd123d05ae55ba531198
- docs/workflow/roadmap/xai-web-console-gap-closure.md — fbded5500ab8c6ecca74d0a623d6bbecc9cd895a5cc18e1033472745b2dc9d4c
- docs/workflow/roadmap/xai-web-console.md — 2fcb985a7e890600660c3513c73c21921c58f097013485795d8cbc1a6548aeba
- docs/workflow/roadmap/xai-web-dashboard-real-data.md — 53d14493510ca21be2bf985ad458309c2278aaf185bce267fc8651f048ca5698
- docs/workflow/roadmap/xai-web-dashboard-stickies-create.md — 4601cec5a49906815531d5d4b0e348cfd2ad18642462ef5ece030676646c8e5c
- docs/workflow/roadmap/xai-web-dashboard-weather-mail.md — 017533f61b386997478f79bddd87d07a252b40dce69064b4b0aa5466b77089e4
- docs/workflow/roadmap/xai-web-matrix-card-create.md — 2497ce3cdc61ee957c2e8e52d3856f3856df32ad3539664b53d50c10f90f1e94
- docs/workflow/roadmap/xai-web-project-module.md — 487e79d19e15412c1233a61678e55408b0f20e6c1501a54d29259603ef2991ec
- docs/workflow/roadmap/xai-web-statistics-real-aggregation.md — 9fed780a2aa33a75a4848f13eb52398e9c339bf82df4259c553b803d7b09eac4
- docs/workflow/roadmap/xai-web-tasks-card-create.md — f14f5e33c16c160153ecde3861b449e44591d9a71460b3f5a19b9a21aafb9e4b
- docs/workflow/roadmap/xai-web-tasks-smartlist-filter.md — a8d58f423a0249c17098434a76a3d3635687741b56ba28a81e95dd9cdf83bf91

## Appendix C — immutable input index interpretation

inputs.sha256 contains SHA-256 followed by two spaces and fullCommit:path, one complete immutable blob per identity. The explicitly labelled external goal attachment uses external:absolutePath. Same path at different SHAs is intentionally separate; aliases are not fabricated Git children. This index is not a local sha256sum pathname manifest. No product semantic success follows from checksum equality.
