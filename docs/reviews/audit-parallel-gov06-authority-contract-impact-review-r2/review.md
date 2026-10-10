# GOV-06 whole independent authority-contract impact review 2

## Verdict and fixed scope

**REVISE.** The complete GOV06 proposal is not ready for technical adoption. Three documentary defects remain: an unacknowledged consumed status/count delta, incomplete G1/Organizer parity in App-to-Plugin instructions, and incomplete qualification of release-branch existence claims. These are source-grounded contract corrections; they require neither a new product decision nor an implementation grant. This reviewer does not repair the proposal or any target.

Reviewer: /root/parallel_d_gov06_whole_contract_review_r2, fresh independent reviewer2/3, not the discovery/contract author or reviewer1. Workflow D for original workflow B; module web, project-system. Task-card role/model is Astra / gpt-6-astra; a configuration label is not separate provider attestation. No children.

Owned worktree: /Users/lijinlong/.codex/worktrees/audit-gov06-review2-20261010/XAI_Desktop.
Dispatch parent: b27b38fa924feaecf9766f9aa81fae0ee5d2c246.
Frozen integration: 2736a112964974d6ed17b88025feb66c50a68846.
Original reviewed source: 327e5006cc2511f0faec8b61d638576eb96501b5.
Product reference: f9eb4b1f207bc4b46f547b90afc250424b3c8695.
Read-only dev source: 343cc5f1002559291b3f8fd1511b93c6e1196082.

The reviewed source is docs/reviews/audit-parallel-gov06-authority-source-contract-impact-r1/contract.md: complete 106913 bytes / 916 lines, SHA-256 23ff90f518e2cc356b7818520d44a64ed98966086e253ab0849b5ac84b789114. Its complete inputs.sha256 is 595e9c51244b85713326f27f50ce8cde29e003e2a10d98dd731de65cfcf212d9. Its complete bytes are separately bound at original, frozen integration and this actual dispatch parent. Registered card SHA-256: 9fd2aabf291aaeb6559b2be38ade1e4227fc167fe59e38f9fada9d66712881a2.

Original GOV-06 remains P2 / 文档 / web（project-system） / 当前范围:

- Action: 统一六模块、分支存在性、G1与Organizer冻结例外的authority镜像.
- Acceptance: CLAUDE/AGENTS/Cursor/模块图一致；独立web/dev正常分叉不当错误合并.
- Source: 01-inventory-governance.md;05-visual-ux-audit.md.
- TODO status: 待复核/待办. EXECUTION status: pending; evidence: [].

The current frozen parent has 312 items, 13 completed / 3 verification_pending / 3 in_progress / 293 pending, 299 unclosed, and 939 ordered evidence references. No row, original action/acceptance, count, evidence, policy, authority, runtime source or root-control state is changed. The review is documentary; neither its successful integrity check nor its eventual reception is caller acceptance, before evidence, qualification, shipment, release or closure.

## Findings

Locations labelled contract refer to the full original source above. Target source locations refer to 741be24e8937b8ca86d6f70217fdeeb600fbbd5a; the same target bytes were acquired at b27b38f and show no drift. These findings come from current source inspection, not from treating reviewer1's failed attempt or its two leads as accepted evidence.

### GOV06-R2-01 [P1] Account for T39's actual parser and count payload delta

Contract lines 144 and 177 claim the priority-only edit leaves plugin entries untouched; lines 95–112 and 166–177 describe preserved derived counts/projection and regressions. T39 at contract lines 549–555 changes PLUGIN_MAP.md:17, including the **Status** cell from `Paused until P1 beta` to `Paused until G1 SHIPPED`, as well as the Packages cell.

That priority table is consumed. generate-state.mjs:1507–1524 accepts every table with a Status/状态 header and maps Tier to name, Packages to path, and Status to status/raw_status. The table at PLUGIN_MAP.md:13–17 satisfies those exact conditions. normalizeStatus at :1478–1488 consequently changes this P2 entry's scalar status from `PAUSED_UNTIL_P1_BETA` to `PAUSED_UNTIL_G1_SHIPPED`. Its raw_status and path also change. The authored plugin regex at dashboard-state.json: product_lines[key=plugin].tracking.plugin_path_regex matches both the old and proposed Packages strings through clipboard/widgets/pet; buildProductLines at :1643–1648 therefore carries the renamed status bucket into the plugin module. Global plugin_map.status_counts changes too; status_summary includes the renamed key via :1588–1603. Product Structure renders status_counts at product-flow.js:263, and Overview renders them at overview.js:430.

This is a deterministic source-level impact inference, not an executed parser result or a claimed current count. T39 does not change the number of this table's rows, the regex membership of this P2 row, or either status token's zero contribution to progressFromCounts at :1606–1617. It still changes consumed status/count **payloads**. Preserving the algorithm is different from preserving those payloads.

Required correction: make this precise source-driven entry/bucket/display delta explicit in the contract, protected-field exceptions and future before/fixed/integrated consumer oracle, or redesign the documentary proposal so its preservation claims are actually true. Keep real plugin/roadmap entries, statuses, raw source and parser implementation protected. Do not expand to editing parsePluginMap/shared helpers to hide the impact. This matters to the whole consumer contract even though it needs no runtime/code fix in this review.

### GOV06-R2-02 [P1] Complete the G1/Organizer rule across App-to-Plugin mirrors

T15 at contract lines 332–339 correctly changes PRODUCT_MODULE_MAP.md:206 to distinguish active G1 runtime, delivered Organizer and unfinished packages awaiting G1. Appendix B does not carry the corresponding correction into dashboard-state.json:1245, `/product_lines/1/transitions/0/note`, which still ends “注意 P2 插件线在 G1 SHIPPED 前仍为 paused,需操作者解冻。”

The same broader freeze survives in both PRODUCT_MODULE_MAP.md:217 and dashboard-state.json:1281, `/product_lines/1/impacts/3/action`. Those entries tell an App host/SDK/window-command caller how to update the plugin platform and affected plugins; their blanket P2-plugin-line warning fails to distinguish the active runtime from unfinished package work and the shipped Organizer exception.

This is visible operational copy. The generator spreads authored product objects at :1679–1698; product-flow.js:194–210 and :274–275 renders both transition notes and impact actions. The proposed map row and generated dashboard detail would therefore disagree after exactly the registered A/B changes. The generic summary corrections elsewhere do not repair the literal copied/rendered instructions.

Required correction: add finite literal proposals for the remaining map impact action and both exact registry pointers, preserving active G1, Organizer's existing delivered status, unfinished-package freeze, D3 and operator/dev gates. Review every corresponding App-to-Plugin occurrence together. This is factual mirror parity under the already accepted authorities; no new freeze/unfreeze decision is needed.

### GOV06-R2-03 [P2] Qualify remaining active release-branch existence claims

The proposal expressly adopts “not observed in the frozen P54 snapshot,” rather than a present-tense absence assertion (contract lines 62–70, 166–170, T11/T27/J12). Its finite replacements miss active Site routing and copyable prompts:
- PRODUCT_MODULE_MAP.md:32, :424, :442 and :453 retain `defined-not-yet-created` for release/desktop/<version>.
- dashboard-state.json:1786 (`/product_lines/4/routing/1`), :1816 (`/product_lines/4/prompts/0/text`) and :1831 (`/product_lines/4/workflow/3`) retain the same unqualified claim.

These are active routing/workflow/prompt mirrors, not ADR-0013's dated 2026-05-30 history. product-flow.js:180–191, :267–274 and :289–290 displays and copies them. Reading the top-level qualification does not ensure a copied Site prompt carries it. A P54 non-observation does not prove that a branch has never been created or is currently absent.

Required correction: include these exact current mirrors in the finite proposed change records, use the existing P54 versioned fact, and retain Site PROPOSED, release-only artifact sourcing, D3/W4 and all operator gates. Leave ADR-0010/0013 historical observations untouched. Do not fetch or silently repin remote refs.

## Whole authority and scope assessment

The review considered the full original action/acceptance and all source contract sections, all literal replacements, both authored registries and the separately held H01 consumer obligation. Findings above are the complete blocking set from this review; the assessment is not limited to reviewer1's leads.

| Area | Assessment |
|---|---|
| Accepted authority precedence | ADR-0010's May 30 amendment permits normal Web work and an independent App lane. ADR-0013 D2/D3/D4/D5 owns topology, sharing, account-sync and normal divergence. ADR-0015:5, :20–43 supplies the accepted Web Organizer/pet decisions. Correcting current Web mirrors is supported; editing ADR decisions is outside the proposal. |
| Dev reconciliation | Full dev343 ADR-0011, ADR-0013 and ADR-0015 bytes are bound. ADR-0011:96–130 still supersedes the legacy active G0/G1 direction and demotes overlay/Organizer on dev. ADR-0015 retains accepted Web decisions and the separate operator-gated dev reconciliation. Preserve these different branch states, not an implicit Web supersession of dev. |
| Six modules | Web remains active; App is the Web container/native shell; plugin product owns G1 runtime even when host implements it; shipped Organizer remains outside unfinished-package freeze; pet stays independent. Sync remains paused/account-sync-only, Site proposed, Admin operator-activated but roadmap-gated. Personal dashboard belongs to web/project-system. R2-02 prevents complete mirror parity approval. |
| Branch and D3/D5 | P54 advertises desktop-plugin-next/dev/web/main at the fixed recorded SHAs. desktop-next/release are unobserved there. No new remote observation, parity or creation/promotion permission is inferred. D3 W0–W4, owner-scheduled main and healthy web/dev divergence remain. R2-03 prevents complete current-copy approval. |
| Organizer closeout and planned packages | Delivered Organizer does not imply its Finder-tags/pin closeout, new Plugin Center, package MVP or feature rows are shipped. Plugin PRD §3/§5/§7 gates survive. Clipboard/widgets/pet/meditation planned/stub and sync-v1/G2 freezes stay intact. No test result or feature status is promoted. |
| Ownership/code boundary | Shell/native chrome versus plugin product ownership stays distinct from physical Tauri command implementation. Plugins consume host commands; no native command implementation moves into plugin packages. Existing entry/window-versus-content contract is preserved, with no new architecture policy. |
| Future surfaces | T49 clarifies an active-column ambiguity against the roadmap's existing planning-only hard gate. It does not activate a seventh module, mobile/Watch/extension work, reorder the roadmap or create a branch. |
| Historical documents | ADR-0010/0013 historical observations remain byte-protected. The proposed current factual mirror changes do not purport to supersede dev ADR-0011. Historical current-priority table input is nevertheless parsed by today's generator: R2-01 must be represented honestly. |
| Scope precision | Nine documentary target files and two authored registries form the candidate envelope; inspected files are not automatic writable paths. H01 remains separate protected-code copy only. Corrections must remain versioned proposals, never edits to these sources by this reviewer. |
| State/evidence | GOV06 remains pending with no evidence; formal 13/3/3/293 and all 939 references persist. Source discovery, source contract, independent review, technical adoption, qualification/before, implementation, verification, full caller acceptance and formal audit status remain distinct. |

## Source graph, consumer compatibility and freshness

The actual source chain is: accepted routing/ADRs → current documentation and module-classification.json for classification; separately authored dashboard-state.json.product_lines → buildProductLines → generated product_lines → identical overview_modules → Product Structure Owner / compact Overview Mirror. module-classification.json is not automatically merged into generated product_lines. Branch policy comes from branch-policy.json; state.js:201–211 is an absent-policy fallback. Snapshot data remains generated/disposable and is not a tracked cross-machine authority.

Full generator and consumer bytes, index.html, README/TEMPLATE/BOUNDARIES/DESIGN, canonical dashboard skill and mirrors, classifier/consistency skills, registry, branch-policy, sync-registry, release/testing sources were acquired. Source-only inspection maps the affected fields as follows:

| Source/consumer | Impact and limits |
|---|---|
| Product Structure | order/key/title/subtitle/badge/status/branch/dependency/next, goal/features/routing/points/skills/prompts/workflow/transitions/impacts/related_docs are retained except the finite proposal. Status split on “ · ” makes J18's semicolon wording visible as one clause. R2-02/R2-03 matter because this Owner renders and copies the omitted strings. |
| Overview | The same generated products supply phase, progress, running, recent_update, todo, status_counts and target. moduleStage reads progress plus blocked/risk words; “Organizer shipped” alone does not set the module to done. T39 changes count keys/status summary, not the weighted formula; this needs the explicit R2-01 oracle. |
| state.js / Branch page | products comes from product_lines; overviewModules can fall back to overview_modules. Do not generalize that fallback to products itself. Primary Branch policy already protects independent lines. H01 at state.js:210 corrects the fallback's “故意落后于 web” under a separate string-only grant. No fallback logic or branch-list expansion is proposed. |
| Testing | key-based lookups, categories/pipelines/records and verdicts remain protected. Existing plugin testing conclusion debt belongs to GOV11; none of the copy proposals proves current testing success. |
| Deployment and Release | labels/aliases/targets and existing records stay unchanged. Deployment “未创建” version text is not itself a branch-presence fact. No shipment/deployment record is written or verified. |
| Docs library / Skill-Agent | Existing paths/navigation and dynamically viewed source bytes remain. Classifier rules use the separate registry; J25–J27 are descriptive factual changes, not a new status-enum API. No parser or undocumented consumer compatibility is assumed verified at runtime. |
| Fallback/UI oracles | Full later evidence needs normal/missing-policy contexts if H01 is granted, long copy at desktop/390px, keyboard/navigation/copied-prompt/source-link behavior and actual raw tool receipts. Merely displaying six keys or running existing structural checks cannot prove authority parity. |

Skill mode is source-only check. No generator/Overview regeneration or freshness PASS occurred. Future freshness remains stale when generated commit differs, dirty count differs, relevant source changed after generated_at, or the operator requests refresh. Generated facts cannot change priority, branch authorization, roadmap/ship status or accepted decisions. The README/template/boundary roles stay unchanged; historical DESIGN/GOV12 and testing/GOV11 debt remain disclosed.

## GOV01/02 dependency and serialization

The full committed corrected sibling source d116728b145a9a4608ca0be1b6504163038574e5 (contract hash f52592359f98fc357a42cfce8d9ea235b6b751a51eeada57dc9132e2fb33e68e), its complete inputs.sha256, whole independent review 5045c5556a13b23ec96c156deb7a761a701fbd6d (review hash 081a9378653ec48553237f164bc460863926c296f9bf847580644d941149ca8b), and its complete inputs.sha256 were acquired. Root P63 adoption is separately bound at 878570a6307308a2853067f0fe58af8747093488 and the actual dispatch parent.

Current status is conditional technical DOCUMENT-only adoption of source2, with historical source1/review1 REVISE retained. GOV06 §7 describes its older author-time source1 dependency accurately but is not a current permission source. Source2's complete API, error/byte/graph/DTO/fixture contract is a proposal; its approval does not permit code, method, qualification, before, parser or registry execution here.

The sibling specifically protects parsePluginMap and its shared helper (source2 §3/§8; independent review2:89, :98). R2-01 therefore cannot be “solved” by changing those protected semantics. Exact appended Web AI roadmap memberships are a separate conditional sibling delta. GOV06's descriptive pointers and GOV01/02's memberships still share dashboard-state.json and generated consumer meaning. Root must serialize writers, freeze chosen contract versions, rebind exact patches after whichever lands first and obtain full integrated consumer verification. Separate worktrees do not remove the logical lock.

Sibling manifests are read and hash-bound as complete documents. Their inherited 1028/1288 labels are not claimed as newly expanded or independently rechecked by this GOV06 review. The GOV06 source's own 127 declared bindings were all independently acquired and hash-matched. No uncommitted sibling work or failed reviewer memory is a passing input.

## Immutable provenance and retained failures

The manifest uses the actual grammar: SHA-256, two spaces, then fullCommit:path, or external:absolutePath. Every actually acquired version is distinct even when bytes match. Complete bytes, not a displayed prefix, are hashed. The registered card/current controls belong to b27b38f; current audit documents are not incorrectly required to match product P0.

The complete external original goal is bound at its supplied absolute path, hash 40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615. The original goal plus parallel authority overlay preserves the sole controller. All three ledgers, task state, original source, failures and sibling worktrees remain protected.

Original discovery a9346fc1efd565833bbc715d848b9a414a87175d and both complete outputs remain SOURCE_ONLY. Its body says control-plane 6f5910ea, while its manifest header binds 56fe7e8e. Both actual complete CP identities remain separately bound, with different hashes. Source-contract1 discloses this correctly and does not rewrite the old body. Original six wrong-workdir process-creation rejections/PID-session UNKNOWN and source-author transport/path errors remain retained historical facts.

Reviewer1 consumed iteration1/3 and static1 FAILED: PID64175, chunk8c81b1, numeric exit1, session status UNKNOWN, AssertionError concerning sibling document-only approval/protected helper. It produced no accepted report/commit. Its two leads are not evidence by themselves; this review independently establishes R2-01/R2-02/R2-03 from actual sources. No retry/reset of reviewer1 occurs.

Current read-phase disclosures:

- Initial guessed optional path docs/reviews/audit-parallel-gov06-authority-contract-r1/contract.md did not exist; Git returned 128 in chunk d18480. Exact paths were resolved from the source commit's diff-tree. No required input was silently omitted or failure relabelled PASS.
- Large tool displays were truncated. Complete input buffers were acquired independently, then relevant sections read in bounded displays; truncation is not source corruption or a successful complete display.
- An in-memory acquisition command incorrectly attempted set + set and raised TypeError before the additional reads. It was corrected to set union during source acquisition; no concluding checker or file write had occurred.
- One report-buffer assembly expression had an escaped-quote SyntaxError before evaluation; the in-memory expression was corrected before the concluding check, with no file write or checker attempt.
- The lightweight memory registry was used only to orient the historical 312-control-plane context. No current verdict, SHA or authority derives from that memory; frozen repository sources above control this review.

## Required completion chain and holds

A fresh authorized author may correct the entire versioned proposal within the remaining author-family cap; a fresh independent whole reviewer must assess that complete revision within the cumulative review cap. This REVISE does not authorize either dispatch itself. Do not rewrite the reviewed source1, reviewer1 failure, before logs or this review.

After a whole approved contract and separate root technical adoption: exact input/actor/worktree/allowed-path/semantic-lock/purpose-budget grant; independently valid complete before (including consumed T39 data and all current mirror occurrences); narrow documentary implementation plus separately granted H01 if needed; fixed implementation and integrated-SHA full verification; affected generator/consumer/structural/UI regressions with independent literal oracles; actual distinct-vendor verification where required; uninvolved Astra acceptance of the entire original GOV06 action/acceptance; root-only evidence append without changing formal states; inventory refresh; original-source/integration remote ancestry and actual push/sync receipt.

Current holds remain: GOV06 technical adoption, valid before, authority/registry/code/fixture/parser/helper changes, any runtime qualification, full consumer/caller acceptance, ledger closure, branch promotion/D3/dev reconciliation, deployment/release and unresolved external credentials/hardware/vendor evidence. No accepted Web decision needs to be asked again. Any genuinely new product decision remains the controller's minimum decision queue. Unrelated ready work need not stop.

## Documentary check and process limits

All required inputs and both complete output buffers are assembled in memory before any draft, manifest or artifact write. The one concluding static operation validates captured immutable input hashes against fresh Git-object/explicit external-byte reads, actual manifest grammar, the registered parent/card/clean scope, both complete UTF-8/LF output buffers and explicit coverage of the source's actual replacement records. It does not use guessed minimum sizes/counts/headlines, combined prose witnesses or P0 audit-document parity. Source prose and business judgments are explained above, not manufactured as literal-string assertions.

The check is an own-document integrity check. No author checker, historical business validator, generator, project module, test, fixture or qualification program is imported/executed. Actual concluding failure means immediate freeze: no rerun, materialization, commit or amend. A successful documentary integrity result can accompany this REVISE verdict; it does not convert the proposal to APPROVED.

Costs: cumulative reviewer2/3, one concluding documentary static allowance, wall cap30min, static cap120sec, owned child drain cap30sec. Runtime/tests/build/lint/browser/native/server/qualification/product probes/vendor/network/child agents/project module imports/fetch/push/sync = 0. Read-only Git/standard-library source operations are disclosed separately. Historical UNKNOWN/exhausted costs remain UNKNOWN/exhausted.

Persistent source-buffer process PID66946, exec session96532, startup chunk85bd40. Git child reads capture raw stdout bytes into the indexed buffers, stderr, numeric exit and communicate-to-EOF receipt. The concluding separate process's exact PID/numeric exit/stdout/stderr/tool chunk and final EOF drain are supplied in the final handoff/tool trail, not invented inside these prevalidated buffers. Only the two assigned ADDs may be written after success, then staged explicitly for one hooks-disabled commit with real-newline Why/What/Scope/Risk/Docs/Tests. No amend or push; reception/remote preservation/global reconciliation belongs to root.

## Complete literal replacement assessment

All actual 49 Appendix A BEFORE spans occur once in their bound complete sources; all actual 27 Appendix B old values match their exact JSON pointers, and H01 occurs once. These observations establish patch applicability, not semantic approval. The separately indexed source hashes and current-parent bytes support this without an assumed minimum count. Every actual replacement record is covered below.

| Records | Independent assessment |
|---|---|
| T01 T02 T07 T09 T11 T16 T17 T18 T19 T20 T21 T22 T23 T24 T25 T26 T27 T28 T29 T30 | Branch paragraphs/routes preserve D2/D3/dev gates and qualify current observed facts. They are individually applicable at their bound source; completeness is blocked by R2-03's unlisted Site occurrences. |
| T03 T04 | Shell identity and physical host/plugin ownership are clarified without native behavior or runtime/status changes. |
| T05 T06 T08 T10 T12 T13 T14 | Routing/plugin summaries add the accepted Organizer exception and independent pet, retaining active G1 and unfinished-package freeze. |
| T15 | Its corrected map transition is supported, but its registry counterpart is absent: R2-02. |
| T31 T32 T33 T34 T35 T36 T37 T38 | MODULE_BOUNDARIES authority/header/table/decision-flow copy follows accepted Web ADR0015 and the runtime/package split; no source package implementation or dev reconciliation. |
| T39 | Consumed priority Status/Packages change must be explicitly represented in entry/count/display oracle: R2-01. Grammar/header/real package rows stay protected. |
| T40 T41 T42 | Personal developer cockpit remains web/project-system; Admin activation and dated branch/freshness distinctions are factual. No refresh or registry source change is implied. |
| T43 T44 T45 T46 T47 T48 | Plugin PRD reconciles Web accepted Organizer/pet/current observed branch facts while preserving dated code inventory, unimplemented closeout, entry/MVP and operator gates. |
| T49 | Planning-only browser-extension clarification follows the existing hard boundary, without changing priorities or granting future work. |
| J01 J02 J03 J04 J05 J06 J07 J08 J09 J10 J11 J12 J13 J14 J15 J16 | Exact branch/copy fields match their actual old values and preserve shape, array ordering, module keys and owner gates. R2-02/R2-03 identify the additional corresponding fields still missing. |
| J17 J18 J19 J20 J21 J22 | Plugin badge/status/next and Overview phase/running/fallback text distinguish active G1, delivered Organizer and unfinished package work. No feature-status, progress-weight or shipped-total grant; real UI wrapping remains unrun. |
| J23 J24 | Plugin attribution and points preserve physical/product split, accepted Organizer/pet and held dev reconciliation. |
| J25 J26 J27 | Classifier main_branch/status/frozen_lines factual descriptions change; six keys, signals, submodule state, classification_flow/drift_checks and account-sync/future gates remain. No undiscovered literal consumer ABI is assumed tested. |
| H01 | Exact state.js:210 fallback string occurs once and is supported by D5. Separate protected-code string-only root grant is mandatory; without it whole fallback acceptance remains held. |

## Complete acquisition inventory

Observed complete input identities: 231. Total captured input bytes across those identities: 10867691. The complete index preserves equal-byte sources separately at each acquired SHA. All declared source bindings match; acquisition counts are observed metadata and never a business acceptance guard.

| Immutable version | Complete identities |
|---|---|
| 0348f1e73725991e3bb2cc402b2d5aac95918b23 | 25 |
| 2736a112964974d6ed17b88025feb66c50a68846 | 26 |
| 327e5006cc2511f0faec8b61d638576eb96501b5 | 2 |
| 343cc5f1002559291b3f8fd1511b93c6e1196082 | 3 |
| 3ae8bd48502131a8d30bfaa38b04de3d733de97a | 1 |
| 46b6d12067c3f348e250751dff8a3c80b31b4382 | 1 |
| 5045c5556a13b23ec96c156deb7a761a701fbd6d | 2 |
| 56fe7e8e4eae4d3d46efa1aed0fcea23e6d3cc50 | 25 |
| 61ca9c77e183a94bb4a3c58d5bee1eec35f5e230 | 1 |
| 6f5910ea036ee6f54a26f25c4faba63389aac496 | 1 |
| 741be24e8937b8ca86d6f70217fdeeb600fbbd5a | 70 |
| 878570a6307308a2853067f0fe58af8747093488 | 2 |
| a9346fc1efd565833bbc715d848b9a414a87175d | 2 |
| b27b38fa924feaecf9766f9aa81fae0ee5d2c246 | 67 |
| d116728b145a9a4608ca0be1b6504163038574e5 | 2 |
| external | 1 |
