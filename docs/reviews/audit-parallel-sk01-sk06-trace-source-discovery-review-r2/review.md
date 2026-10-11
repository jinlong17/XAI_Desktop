# SK-01–SK-06 whole source and process review — D2/3

Source factual verdict: **REVISE**. Source process admission: **BLOCKED / FORENSIC_ONLY_FAILED_PROCESS_ADMISSION**. These are separate judgments. This review does not repair the source, retroactively accept process failures, or grant implementation admission.

## Fixed scope and authority

Module: web / project-system. Dispatch parent: a4c4eefa181540025bdea5b3613f07fdb5158064. Frozen input: d4ef588af67ac6cc49afe75c0afd42ea01c126b9. Reviewed source: 56de3d65d9619e93c27c69c06a382ea0382f3aa5, based on 41111042c093c2110770d1e12829d377242d4c74. Product baseline: f9eb4b1f207bc4b46f547b90afc250424b3c8695. Whole scope is the six original source-discovery items, not the four provisional leads.

All 69 original bindings were acquired as complete bytes. Complete current rules/card/state, frozen state, source report/index, relevant portable and project templates, generated platform files and dashboard consumers are also bound individually in inputs.sha256. Historical and current identities remain separate. Input acquisition is not execution or independent qualification.

The immutable external goal and current authority-overlay authorize parallel scheduling while preserving reviewer-never-repairs, evidence, module and release boundaries. This task card permits exactly review.md and inputs.sha256. No audited skill is invoked: skill files are audit data. No tests, build, lint, audited parser/import/generator, browser/native/runtime, provider/vendor/network, qualification, children or push. A fresh Codex review is not cross-vendor evidence. The card configures Astra; actual provider attestation is unavailable.

Current state retains completed13 / verification_pending3 / in_progress3 / pending293 =312; 299 unclosed; 939 registered evidence references. No control/ledger, canonical/product, skill or registry change occurs.

## Original-item coverage

| Item | Original action | Original acceptance | State |
|---|---|---|---|
| SK-01 | xai-feature-brief固定feature_id、范围及失败/恢复验收 | 后续dossier和迭代能追溯原brief | pending; retained evidence empty; not closed |
| SK-02 | xai-feature-full-loop逐阶段输出Target/commit/验证receipt | 收口检查registry解析和dossier增量，不只更新包状态 | pending; retained evidence empty; not closed |
| SK-03 | xai-roadmap-loop以统一manifest schema驱动并核对对应Target | emit/serial后不显示旧迭代状态 | pending; retained evidence empty; not closed |
| SK-04 | xai-release-log分change_kind、source/deployed commit、环境与artifact | 纯文档更新不改变产品验证健康，SHIPPED不等deploy | pending; retained evidence empty; not closed |
| SK-05 | xai-dev-dashboard-sync加源集合与生成集合覆盖断言 | 漏项/冲突/当前commit验证范围可见，关联GOV-01至03 | pending; retained evidence empty; not closed |
| SK-06 | xai-consistency-audit串联稳定ID与PRD/package/test/deploy双向映射 | 代码问题与记录漂移分别给证据 | pending; retained evidence empty; not closed |

The original audit is more specific than its shortened card: 01-inventory-governance.md:75–80 includes SK-04 feature_ids and SK-06 JSON-registry linkage. Lines67 and94–98 keep implemented, workflow-verified, runtime-tested and deployed dimensions separate and require matching Target/iteration evidence. Historical counts of19 logs,3 manifests and167 slugs are not newly proven counts.

## Findings

### R2-01 — P2: wrong SK-03 manifest-shape claim

Source discovery SK-03 calls the three AI-tool manifests “no-table-header consumers” and proposes an “Optional table header” fixture. Each actual file has a header at line18, separator19, row20. They have Slug and Status, omit the # column, and use Automation rather than Automation Mode. generate-state.mjs:1535–1539 requires # AND slug AND status. Original audit G02:29 explicitly requires Slug+Status recognition with # optional. Revise the finding and fixture to header-present/#-absent, preserve the # form, and surface malformed/unknown formats separately. Headerless support is not an established requirement. Exact corresponding Target/iteration reconciliation remains a separate obligation.

### R2-02 — P2: incomplete SK-04 identity and isolation account

The source omits feature_ids from SK-04’s candidate field/evidence chain, although original audit:78 explicitly requires it. The proposed release→feature→test→deploy contract cannot satisfy the whole original action without this identity. Include missing/unknown/duplicate/multi-feature cases.

Existing source already separates project-system in releaseModuleMeta:1077–1081, prioritizes it in releaseEntryModule:1139–1157, and filters testing records by related_modules:1374–1377. release-log.md:120–127 records that earlier correction. The source is right that a typed change_kind/source/deployed-commit/feature_ids validation contract is absent, but must acknowledge and preserve this existing guard. Mixed product_line/impact can add product related_modules, and buildTestingState has no change_kind filter before aggregation. That is a source-derived risk, not a reproduced health regression. Future evidence must include docs-only labelled web or mixed web/project-system, document-check visibility, and unchanged product-health evidence. Pure project-system routing does not prove complete change-kind isolation.

### R2-03 — P2: decision boundaries and dependency holds are incomplete

The report defers stable-ID/slug, receipts, source-set authority, change-kind vocabulary and dossier writer to the owner as one blanket hold. Accepted rules already give feature-plan technical design/canonical naming, while dev-dashboard.md:129–131 reserves operator decisions for genuine roadmap/release/branch/priority/product-governance changes. The accepted six audit actions permit a versioned technical proposal with finite scope; field-name/shape choices need not become new owner questions. No missing user-product rule is established here.

Preserve portable06 A6.3: slug is immutable once dev_log exists. The source’s “key survives slug rename” fixture must mean pre-canonical naming or explicitly recorded historical aliases unless a separately reviewed migration changes that rule.

Actual process holds remain binding: current GOV01/GOV02 parser provenance census is EXHAUSTED3/3; documentary technical contract is conditionally adopted but parser/source qualification/before/code/consumer/caller admission is held. GOV05 is EXHAUSTED3/3, with no lawful complete artifact and no fourth author. GOV06 final review3 ended EPIPE/completionUNKNOWN and exhausted3/3; source2 is UNADOPTED. A future registry canonical writer must serialize with GOV06. SK may describe these dependencies; it cannot recreate their source censuses, reset caps, launch duplicate dossier work, or treat unknown receipts as success.

### R2-04 — P2: finite producer/consumer closure is incomplete

The source names broad candidate groups but omits manual feature-build/review producers, platform generated consumers, several UI consumers and exact protected blocks. Complete source shows .agents templates feed the platform generator. Full-loop/roadmap skills separately render from portable appendices under lint rule8. Public-skill shim generation is not proof of that parity. A future contract needs exact path/block ownership, upstream resync, preserved state-writer rights, compatible consumer fields and fixtures. The finite matrix below is review guidance, not edit permission.

## SK-01 acceptance matrix — brief, dossier and iteration

| Aspect | Whole-item assessment |
|---|---|
| Original obligation | Stable feature_id, explicit scope/non-goals, failure/recovery acceptance; later dossier/iterations trace to the original brief. |
| Existing source | feature-brief:68–120 captures/saves input; QA:143–161 includes scope, testability and applicable rollback. Portable03:265–271 leaves canonical slug and solution to feature-plan. Dossier:92–140 requires real Source and acceptance→test IDs but lacks stable identity. |
| Gap | Identity is not carried through brief, PRD schema, Target and subsequent iteration. Failure/recovery needs explicit applicable criteria or reasoned N/A/TBD. |
| Minimal future proposal | Version a stable key and original brief reference; retain scope, non-goals and acceptance IDs. Preserve planner naming and post-dev_log slug immutability, with explicit intake alias mapping. Requirements cannot be reconstructed from code. |
| Owned future blocks | feature-brief QA/Required Output/Storage; portable03 schema/handoff via upstream resync or approved project overlay; feature-plan Target/Increment/Required Output; dossier Traceability/Schema/QA under GOV05 writer. |
| Future evidence | Brief→plan→dossier→two iterations; missing/duplicate key/source; pre-canonical alias; scope continuity; failure/recovery or TBD. No fixture ran; canonical dossier writes remain held. |

## SK-02 acceptance matrix — phase receipts and closeout

| Aspect | Whole-item assessment |
|---|---|
| Original obligation | Each phase has Target/commit/verification receipt; closeout checks registry parse and dossier delta. |
| Existing source | full-loop:35–37 reads real dev_log; recipe:70–94 preserves review/independent verify/human ship. feature-build:126–136 and auto-build:157–158 record phase commits; verify:104–108 reads phase histories. |
| Gap | Existing evidence is not a normalized phase/Target/iteration/commit/result/artifact record; parent output lacks parse+dossier-delta closeout. |
| Minimal future proposal | Feature key, Target+iteration+phase, commit/range, verified scope/result/artifact and executor; unknown/not-run explicit. Consume the single admitted registry parser and evidence-backed dossier delta/N/A. Preserve role-scoped Status writers. |
| Owned future blocks | Portable04 appendix/canonical full-loop inter-worker reads and Output; project/portable plan, review, build, auto-build, verify and compatibility full-loop; dossier consumer and serialized registry writer. |
| Future evidence | Manual/auto paths, two Targets in one package, wrong iteration/commit, missing receipt, parse failure, omitted dossier delta, READY_TO_SHIP without ship action. Dependency holds remain. |

## SK-03 acceptance matrix — manifest and exact Target

| Aspect | Whole-item assessment |
|---|---|
| Original obligation | Unified verifiable schema; corresponding Target; emit/serial cannot show stale iteration. |
| Existing source | Portable06 A6 has slug/source/dependencies/status/mode/last-run/note. Roadmap §3.1 separates queue and dev_log execution; preserves blocked/external/shipped and monotonic progress. emit never marks IN_PROGRESS; serial may. Generator emits slug/status/last_run after # gate. |
| Gap | Header-shape error R2-01; absent exact Target/iteration/receipt contract. Historical intermediate statuses need explicit compatibility, not forced conversion from package SHIPPED. |
| Minimal future proposal | Version header schema with optional # and explicit legacy Automation mapping; bind Target/iteration/receipt; preserve queue semantics, slug immutability and paused/external gates. Display mismatch/unknown rather than adopt unrelated newer package status. |
| Owned future blocks | Portable06 A6/appendix reconciliation+emit+serial; rendered roadmap skill; shared GOV parser blocks and tasks consumer; three exact AI-tool manifests as fixtures/reference until a separate migration grant. |
| Future evidence | Both header forms, malformed/unknown visibility, missing/duplicate Target, multi-iteration package, stale unrelated iteration, crash/in-progress handling and blocked gate preservation. No emit/serial execution. |

## SK-04 acceptance matrix — change, tests and deployment

| Aspect | Whole-item assessment |
|---|---|
| Original obligation | change_kind/source_commit/deployed_commit/feature_ids/environment/artifact; docs-only preserves product health; SHIPPED differs from deploy. |
| Existing source | Release Entry Format has branch/commit and free-text Verification; prohibits invented shipping. release-testing text classification and project-system routing exist. Testing/deployment objects are separate. |
| Gap | No typed, validated feature/commit/evidence join or per-record health eligibility; no required deployed artifact/environment/source relation. |
| Minimal future proposal | Version document checks, runtime test receipts, workflow shipment and deployment facts separately. Preserve project-system isolation; unknown stays unknown. Product health binds feature+commit+environment+artifact, not latest doc timestamp. |
| Owned future blocks | Release skill and entry schema; generate-state normalization/parsing/test conversion/aggregation; release-testing compatibility; testing/release/deployment/product/overview consumers and machine/template docs. |
| Future evidence | Docs-only web/mixed classification, retained prior runtime failure, docs results visible, feature/commit/env/artifact mismatch, SHIPPED without deploy receipt, historical versus current result. No deployment/readiness grant. |

## SK-05 acceptance matrix — coverage and verification scope

| Aspect | Whole-item assessment |
|---|---|
| Original obligation | Source/generated coverage, visible omission/conflict/current-commit verification scope, GOV01–03 coordination. |
| Existing source | Six-surface dashboard skill; generator filters absent skills, records metadata/backfill and mirror path presence. Snapshot freshness, display completeness and source completeness are already different concepts. |
| Gap | No complete discovered/parsed/missing/emitted/conflicting identity reconciliation or per-feature tested commit/range. Tracked symlink presence cannot be decided via directory.isDirectory alone. |
| Minimal future proposal | Finite tracked source inventory and keys, per-path parse outcome, emitted identity and exact verification scope; explicit omitted/duplicate/conflicting sets. Keep generated backfill visible. Use GOV01/02 parser and GOV03 coverage, no second writer. |
| Owned future blocks | Dashboard-sync inventory/Workflow/Receipt; generator source inventory/registry/task/roadmap/testing/sync output; static consumer assertions; tasks/overview/skills/testing/state consumers; docs. |
| Future evidence | Missing source, symlink, regular-copy mismatch, malformed log, duplicate ID, fresh snapshot with unparsed item, stale commit, partial scope, generated backfill. Runtime census and consumer UI admission remain held. |

## SK-06 acceptance matrix — bidirectional evidence

| Aspect | Whole-item assessment |
|---|---|
| Original obligation | Stable JSON-registry ID across PRD/package/Target/test/deploy; forward/reverse coverage; separate code and record-drift evidence. |
| Existing source | consistency:12–18 delegates writers, report/apply and finding classes are explicit. Check table covers boundary/feature/registration; dossier has Source/test-ID matrix. |
| Gap | Existence/status checks cannot prove exact typed graph, test result or deployed evidence. |
| Minimal future proposal | Typed directional edges support one feature→many packages/iterations; detect dangling/ambiguous/conflicting/missing reverse edges. Code violation cites code+contract; record drift cites contradictory records. Only actual protected decision is needs-operator. |
| Owned future blocks | Consistency feature checks/report; consistency-checks feature/report fields; dossier via sole GOV05 writer; registry via GOV06 serialization; SK01/02/04 evidence schema and dashboard consumers. |
| Future evidence | PRD-only/package-only, missing/duplicate key, one-to-many, wrong Target, missing test result, deploy mismatch, separate evidence classes, no auto-repair/state promotion. |

## Ownership and finite prospective scope

Within the original six, five Claude/Codex aliases are tracked Git symlinks mode120000 into .teams. consistency-audit is a regular tracked copy mode100644 with the same Git blob as canonical. Dossier adds another symlink-backed skill. Cursor copies are separately tracked. Preserve symlinks; synchronize regular copies and Cursor body when canonical changes. usage-guide’s blanket symlink wording needs the exception.

workflow.md §2 forbids direct local _portable edits except through resync. check_portable_sync.py:616–777 reads and renders full-loop/roadmap appendices. setup_subagents_v2.py:54–58 reads project .agents templates/background and emits Claude agents/agents-v2, Codex and Cursor. setup_subagents_v2_skills.py handles public-skill shims. These were read as text, not executed.

The following finite set is an impact proposal. Author2 remains report-only. A later implementation card must select exact rows/blocks and freeze hashes; this is not wildcard edit or generator --force permission.

| Path | Relevant block | Ownership |
|---|---|---|
| `.agents/templates/feature-auto-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | project template instantiation |
| `.agents/templates/feature-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | project template instantiation |
| `.agents/templates/feature-full-loop.md` | orchestration state reads; phase handoff/closeout output | project template instantiation |
| `.agents/templates/feature-plan.md` | Target Feature Protocol; State Write Rules; Increment; Required Output | project template instantiation |
| `.agents/templates/feature-review.md` | Target Feature Protocol; review checks; verdict evidence | project template instantiation |
| `.agents/templates/feature-verify.md` | Target Feature Protocol; Verification Duties; Required Output | project template instantiation |
| `.claude/agents-v2/feature-auto-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents-v2/feature-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents-v2/feature-full-loop.md` | orchestration state reads; phase handoff/closeout output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents-v2/feature-plan.md` | Target Feature Protocol; State Write Rules; Increment; Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents-v2/feature-review.md` | Target Feature Protocol; review checks; verdict evidence | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents-v2/feature-verify.md` | Target Feature Protocol; Verification Duties; Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents/feature-auto-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents/feature-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents/feature-full-loop.md` | orchestration state reads; phase handoff/closeout output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents/feature-plan.md` | Target Feature Protocol; State Write Rules; Increment; Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents/feature-review.md` | Target Feature Protocol; review checks; verdict evidence | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.claude/agents/feature-verify.md` | Target Feature Protocol; Verification Duties; Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.codex/agents/feature-auto-build.toml` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.codex/agents/feature-build.toml` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.codex/agents/feature-full-loop.toml` | orchestration state reads; phase handoff/closeout output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.codex/agents/feature-plan.toml` | Target Feature Protocol; State Write Rules; Increment; Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.codex/agents/feature-review.toml` | Target Feature Protocol; review checks; verdict evidence | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.codex/agents/feature-verify.toml` | Target Feature Protocol; Verification Duties; Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.cursor/agents/feature-auto-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.cursor/agents/feature-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.cursor/agents/feature-full-loop.md` | orchestration state reads; phase handoff/closeout output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.cursor/agents/feature-plan.md` | Target Feature Protocol; State Write Rules; Increment; Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.cursor/agents/feature-review.md` | Target Feature Protocol; review checks; verdict evidence | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `.cursor/agents/feature-verify.md` | Target Feature Protocol; Verification Duties; Required Output | generated consumer; regenerate scoped role only, preserve unrelated role configuration |
| `docs/workflow/_portable/templates/feature-auto-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | upstream portable change then resync; no direct local portable edit |
| `docs/workflow/_portable/templates/feature-build.md` | Target Feature Protocol; Phase Progress/Work Log; commit and tests in Required Output | upstream portable change then resync; no direct local portable edit |
| `docs/workflow/_portable/templates/feature-full-loop.md` | orchestration state reads; phase handoff/closeout output | upstream portable change then resync; no direct local portable edit |
| `docs/workflow/_portable/templates/feature-plan.md` | Target Feature Protocol; State Write Rules; Increment; Required Output | upstream portable change then resync; no direct local portable edit |
| `docs/workflow/_portable/templates/feature-review.md` | Target Feature Protocol; review checks; verdict evidence | upstream portable change then resync; no direct local portable edit |
| `docs/workflow/_portable/templates/feature-verify.md` | Target Feature Protocol; Verification Duties; Required Output | upstream portable change then resync; no direct local portable edit |

| Path | Prospective exact block |
|---|---|
| .teams/skills/xai-feature-brief/SKILL.md | Structured Brief; QA Gate; Required Output; Storage/Planner Handoff |
| .teams/skills/xai-feature-full-loop/SKILL.md | Runtime Recipe inter-worker reads/closeout; Output; rendered portable04 appendix |
| .teams/skills/xai-roadmap-loop/SKILL.md | §3.1 exact-Target reconcile; emit/serial outputs; rendered portable06 |
| .teams/skills/xai-release-log/SKILL.md | Entry Workflow/Format/Quality Rules |
| .teams/skills/xai-dev-dashboard-sync/SKILL.md | Alignment Scope; source/testing inventory; Sync Receipt |
| .teams/skills/xai-consistency-audit/SKILL.md | Feature reconciliation; Findings/output; owning writer delegation |
| .teams/skills/xai-feature-dossier-sync/SKILL.md | Traceability Matrix; PRD Schema; QA; GOV05 sole writer |
| docs/workflow/_portable/03-step0-brief-spec.md | Brief/handoff schema, preserve §10 design ownership; upstream resync |
| docs/workflow/_portable/04-automation-loop.md | Phase receipt contract and full-loop appendix; upstream resync |
| docs/workflow/_portable/06-roadmap-orchestration.md | A6 schema and reconciliation/emit/serial appendix; upstream resync |
| docs/workflow/_portable/02-handoff-and-state.md | Additive shared receipt fields only if chosen; §2.6 writer rights protected |
| docs/workflow/_portable/00-PORTABLE-MANIFEST.md | New shared placeholders/references only if upstream schema requires |
| docs/workflow/project/consistency-checks.json | feature_reconciliation checks; report_artifact fields; apply_targets ownership |
| docs/workflow/project/dashboard-state.json | product_lines feature references; testing.records/deployment.records; operator fields protected; GOV06 serialization |
| docs/workflow/project/release-log.md | New entry schema/examples; preserve historical claims as historical |
| scripts/dashboard/generate-state.mjs | listSkillSet/buildSkillAgentRegistry; parseRoadmapManifest/listRoadmapManifests; parseTaskProgress; release normalization/parsing/test conversion/buildTestingState; coverage/sync output |
| scripts/dashboard/release-testing.mjs | Text compatibility and typed-record eligibility interface, if owned by future card |
| scripts/dashboard/verify-static.mjs | Admitted output/coverage consumers; no execution in source review |
| docs/prototypes/dev-dashboard/js/state.js | testingState/syncStatus/skillAgentRegistry/releaseEntries/task data bindings |
| docs/prototypes/dev-dashboard/js/tasks.js | renderTaskProgress exact Target/iteration and unparsed/conflict display |
| docs/prototypes/dev-dashboard/js/overview.js | snapshotFreshness/renderOverviewSyncStatus; scoped evidence summary |
| docs/prototypes/dev-dashboard/js/skill-agent.js | Source completeness/backfill/mirror and coverage presentation |
| docs/prototypes/dev-dashboard/js/testing.js | testingRecords/testingSummary/renderReleaseEntryTesting; feature+commit scope |
| docs/prototypes/dev-dashboard/js/release-log.js | renderReleaseRows; release module/test joins |
| docs/prototypes/dev-dashboard/js/deployment.js | renderDeploymentRecord commit/environment/artifact, independent test badge |
| docs/prototypes/dev-dashboard/js/product-flow.js | setProduct test/deploy references; renderFeatures identity |
| docs/workflow/project/dev-dashboard.md | Source of Truth; Allowed Updates; testing/skill registry; coverage/verification scope |
| docs/prototypes/dev-dashboard/README.md | Trustworthy source/consumer and refresh instructions |
| docs/prototypes/dev-dashboard/TEMPLATE.md | Reusable coverage/evidence schema and surface ownership |
| docs/prototypes/dev-dashboard/BOUNDARIES.md | Owner/Mirror/Shared-Widget; testing/release/deployment data boundaries |
| docs/prototypes/dev-dashboard/DESIGN.md | Historical/current/proposed design labels |
| docs/workflow/project/usage-guide.md | Mirror exception; receipt/exact-Target examples |
| docs/workflow/roadmap/xai-web-ai-tool-layer.md | Existing Feature table18–20; fixture/reference; separate migration grant |
| docs/workflow/roadmap/xai-web-ai-tool-edit-delete.md | Existing Feature table18–20; fixture/reference; separate migration grant |
| docs/workflow/roadmap/xai-web-ai-tool-openai-compatible.md | Existing Feature table18–20; fixture/reference; separate migration grant |

Handoff-display changes, if actually needed, require synchronized AGENTS.md §1 / CLAUDE.md Handoff / .cursor/rules/handoff.mdc. Module-routing changes require CLAUDE.md / AGENTS.md §3 / .cursor/rules/product-module-routing.mdc / PRODUCT_MODULE_MAP.md; none is needed merely to add receipts. Preserve protected routing/priority/release/owner fields and existing Spark configuration. Finite skill mirrors below were taken from actual Git tree, not guessed paths.

| Git mode/blob/path at dispatch parent |
|---|
| 100644 blob e4436ae3f3f9f6bb2601f19f01559f1c2a129a5e / .claude/skills/xai-consistency-audit/SKILL.md |
| 120000 blob c083903dd7cffb421e8be4e05be0850a6435bd24 / .claude/skills/xai-dev-dashboard-sync |
| 120000 blob baaa76ef784e76468219e49418fd3ebbc2147b1e / .claude/skills/xai-feature-brief |
| 120000 blob e16bda5606898295d057c23b0741c772ed0ffbc1 / .claude/skills/xai-feature-dossier-sync |
| 120000 blob cc36e69fbbf8700facb6a6a1835ba0e14fd1f84e / .claude/skills/xai-feature-full-loop |
| 120000 blob 25cea6760713a03412d274bcb535e5272b9e6929 / .claude/skills/xai-release-log |
| 120000 blob 50c5bcd4eebcde15d4ed51f7445d86f7f4caaa72 / .claude/skills/xai-roadmap-loop |
| 100644 blob e4436ae3f3f9f6bb2601f19f01559f1c2a129a5e / .codex/skills/xai-consistency-audit/SKILL.md |
| 120000 blob c083903dd7cffb421e8be4e05be0850a6435bd24 / .codex/skills/xai-dev-dashboard-sync |
| 120000 blob baaa76ef784e76468219e49418fd3ebbc2147b1e / .codex/skills/xai-feature-brief |
| 120000 blob e16bda5606898295d057c23b0741c772ed0ffbc1 / .codex/skills/xai-feature-dossier-sync |
| 120000 blob cc36e69fbbf8700facb6a6a1835ba0e14fd1f84e / .codex/skills/xai-feature-full-loop |
| 120000 blob 25cea6760713a03412d274bcb535e5272b9e6929 / .codex/skills/xai-release-log |
| 120000 blob 50c5bcd4eebcde15d4ed51f7445d86f7f4caaa72 / .codex/skills/xai-roadmap-loop |
| 100644 blob bcbcb84cb7d82ae09a9603944180b8cf6165d146 / .cursor/rules/xai-consistency-audit.mdc |
| 100644 blob f7be93cfeee62ff7d205c12b94ce192732d1b10a / .cursor/rules/xai-dev-dashboard-sync.mdc |
| 100644 blob 43d6e5a12430ccb3c4acde79d15f93b0654c0745 / .cursor/rules/xai-feature-brief.mdc |
| 100644 blob b9019639dc9c21460dc144d6e13492719f338378 / .cursor/rules/xai-feature-dossier-sync.mdc |
| 100644 blob 8178b144cc09d46c7a6fed13dc3291dc6ea3dba0 / .cursor/rules/xai-feature-full-loop.mdc |
| 100644 blob d1978a5f0b2389a17ac380fc44146659ecf46e2a / .cursor/rules/xai-release-log.mdc |
| 100644 blob a01c5fc0b4f0cbe28d73f59a09c66f4db0c5dd13 / .cursor/rules/xai-roadmap-loop.mdc |

## Dependency disposition and lawful next unit

GOV01/02: conditionally adopted technical documentation is not actual parser admission; source census EXHAUSTED3/3, historical counts currently UNKNOWN. GOV03 shares parser+coverage. GOV05: one nine-feature dossier writer, EXHAUSTED3/3; no canonical PRD output approved. GOV06: registry authority single writer must be serialized; review3 EPIPE outcome UNKNOWN, source2 UNADOPTED, exhausted3/3. Historical cross-vendor/external/deploy gates remain separate. No fourth iteration or renamed family is authorized.

A minimum lawful next proposal is source-author2/3 for the SAME whole SK01–06 discovery purpose, in a fresh assigned writer context, with exact report+input-index scope, preserving source1/failed evidence. Correct R2-01–04, retain all six matrices and propose compatible versioned technical choices plus dependency holds. Do not run or reproduce old checkers, import validators, perform source qualification, or materialize old failed buffers. Prepare all input bytes and both complete final buffers before any write, one own static <=120s and strict STOP on FAIL/UNKNOWN. This is a proposal for controller dispatch, not a dispatched or approved implementation contract. After a lawful complete author2 result, remaining fresh whole review3/3 is reserved; no cap reset. If provenance is needed for source1 admission, that admission stays BLOCKED: missing history cannot be reconstructed by new hashes. New-author prospective compliance cannot repair source1 retrospectively.

## Process history: established facts and UNKNOWN

Source1: three actual prewrite validation failures in preserved order: incomplete real-newline buffers; manifest grammar copied63hex; report newline missing. Raw failed commands/PID/numeric exit/session/chunk/EOF are UNKNOWN; actor cannot establish whether concluding checker processes or pure assembly checks. Subsequent complete-input prewrite/materialization and reported postwrite PASS occurred. Successful path PIDs82837,82849,82861,82873,82885,82897,82909,82922,82934,82946,82958 and numeric exits0 are retained in reception. Those later successes do not satisfy the original strict failure-STOP obligation retrospectively. Source1 remains FORENSIC_ONLY.

Review1: initial pretool NUL rejection; corrected same-phase one actual checker launch was awaited but receipt binding/printer failed with staticReceipt undefined. Result/PID/exit/EOF/session/chunk UNKNOWN; no artifacts/materialization/commit; review1/3 and static1 consumed. Prior leads were unvalidated; this reviewer reevaluated them against whole source and originals. No old review receipt was retried.

Current review acquisition: initial shell read commands returned numeric exit0 and chunks1e250a/20739b/d72f95/22a44d/03d495/901a88; some output was truncated, so complete bytes were reacquired into memory. Shell child PIDs and explicit EOF flags were not captured and remain UNKNOWN. Two Node acquisition-helper attempts failed with process is not defined before spawning any Node child; a fresh uniquely named helper then acquired source successfully. One report-assembly functions call was rejected as SyntaxError before tool execution, without checker/write. These are disclosed assembly/read faults, not omitted attempts or runtime tests. All successful owned Node Git child receipts retain PID, numeric exit, stdout/stderr, both EOF flags, close/drain and elapsed time. A tool chunk/session identifier is not exposed for Node calls and remains UNKNOWN.

Current reviewer concluding static is exactly one read-only Python process. The actual result is assigned to skStaticReceipt before printing; complete stdout/stderr and child receipts are preserved by the tool. It verifies immutable Git/file bytes, original source manifest grammar and hashes, current clean parent, six original actions/acceptances, all used input identities, and both complete final UTF-8 buffers before any output file/directory or commit-message write. Findings are prose judgments, not guessed word/headline/minsize/cardinality guards. No historical business checker or source module is imported. Actual FAIL/UNKNOWN freezes this unit without output materialization, retry or commit. Final actual PID/result/exit/EOF/drain and commit receipts are reported in Handoff; this prevalidated report does not fabricate a future process result.

The supplied two output buffers are immutable after that check. Exact2ADD materialization and one hooks-disabled commit follow only a preserved successful result. No amend/push; controller decides later scoped document adoption/correction dispatch. No product, registry, skill, canonical, before, qualification, full-caller or release grant follows from this review.

## Additional source closure

GOV06 source2 contract (c103a93602736652c08e6ca71d6b6c070e63f4f2):181 expressly requires root serialization of exact path/field/consumer locks across GOV06, GOV01/02, GOV04/07 and SK01–06. It remains unadopted; this is overlap evidence, not authority to execute it. Its registry counterparts include authored dashboard product_lines fields. No new standalone registry filename is invented. Future identity fields must be assigned to the accepted owning schema after admission, and existing module-classification rules remain a protected consumer.

## Successful acquisition process receipts

Every owned child below closed and both streams reached EOF; stdout bytes are immutable source bytes bound by inputs.sha256 (or Git tree inventory), retained in the acquisition tool state. Explicit Node tool chunk/session IDs were unavailable, UNKNOWN. No repository code was executed.

| PID | numeric exit | stdout/stderr EOF | drained | milliseconds | stdout SHA256 | stderr | errors |
|---|---|---|---|---|---|---|---|
| 9382 | 0 | true/true | true | 299 | a820506eff1dd9e1c7c2c3ead622d26249b348b13b356fdcd036a1f513b4a404 | empty | none |
| 9394 | 0 | true/true | true | 28 | e3d360554aa3c1d2ee64841b3a6c62b1f60860cf12a9a6ec5fb3a1b01b573fa5 | empty | none |
| 9406 | 0 | true/true | true | 15 | 519c72bcbdd1018af9a369614b9db04a674bf91870d99dcca03665dabe162100 | empty | none |
| 9418 | 0 | true/true | true | 13 | 6597e484cb5bde938fadb3c728f2e76c6228364584306a453655eeebd1e61ffb | empty | none |
| 9430 | 0 | true/true | true | 16 | 99bb429d2a9facd7cebfbcb52e97c7ccea648d19953e05e10f824189f6b9f050 | empty | none |
| 9442 | 0 | true/true | true | 14 | 92572a6ea33865753d3a461d96830d38e1dbcded58e684114eab450c81ab4b59 | empty | none |
| 9454 | 0 | true/true | true | 15 | 1b5b4d5bd4c71a3792ba8f9951c6955659faa28a679eff9b41be39992b6ef9ec | empty | none |
| 9466 | 0 | true/true | true | 13 | b0b6e5d6ac4f9fa89f99a47028d7b8f905f746d2e0ed83fd91ea1d2dde1cea5a | empty | none |
| 9478 | 0 | true/true | true | 12 | 5865e7986bcc866488b9d1839403c155411b8e450369b56bbb35ed49a48bcbb8 | empty | none |
| 9490 | 0 | true/true | true | 16 | 16ce699c23da5e1da8a464bfc9c41eb28bae1b53855160026853e13e8f59466d | empty | none |
| 9502 | 0 | true/true | true | 15 | 3ac7d8e90fb70f5fe2fca09bb309034064a46c3d22a1d77c121210689a250160 | empty | none |
| 9514 | 0 | true/true | true | 14 | 3875f0505c162a306491870c426f9c921a358e88f19fd0506ca10f5cad4dd1c1 | empty | none |
| 9526 | 0 | true/true | true | 13 | ce2b2cb16a10f21c7c79a8e1567fc71b411bf3c6a8eab7adff63bc3baafa3eb8 | empty | none |
| 9538 | 0 | true/true | true | 12 | 7c24f90c4276af62d1379f0fb60668d33dc95c416250fae1a01e40f0d9861b54 | empty | none |
| 9550 | 0 | true/true | true | 24 | 03bed7bfa4d12fd50f3720d49e32e66547c98d6a2ce6c3f326b8af552f1cce38 | empty | none |
| 9562 | 0 | true/true | true | 29 | 56333ea33ec873a4c82a8a8174debd72a58d144d5ec9996014788bb1c7ed8959 | empty | none |
| 9574 | 0 | true/true | true | 12 | 8f788bc898504ea8c8dc85d0625116fa537f1dc99c8429b0d39d7395702360a0 | empty | none |
| 9586 | 0 | true/true | true | 13 | efd036ee4ddd626b493b62a2fd256d2976288f26c85a51d28c6f7133eab0ebf7 | empty | none |
| 9598 | 0 | true/true | true | 12 | 4add53cd754f971c7ce997529ee769a617ac1803ef95133266b740731906d98b | empty | none |
| 9610 | 0 | true/true | true | 13 | c3f1065ef5f9a3524d95618c530bc2a9a665350dd3730acdf5507081e1269756 | empty | none |
| 9622 | 0 | true/true | true | 13 | d5c9827160d934f629ca8b3f265e3b24d22fb21234e78d86eaa375d9a26a3942 | empty | none |
| 9634 | 0 | true/true | true | 12 | d728fda963fe339db090f42c873fff6f3484715e9682de51963b45e4c3da9498 | empty | none |
| 9646 | 0 | true/true | true | 12 | 04f85a9de65fb0107dab7617c45438e3025adb0d13225d72f342e05a9fc007f5 | empty | none |
| 9658 | 0 | true/true | true | 12 | 420ed1f8cff58cf3b06df8c2e040796f02debaec5b197af49721a5dacbd22746 | empty | none |
| 9670 | 0 | true/true | true | 12 | 4093e4c3a844273eb21791976b9a45caddb127f6eaa5f792a639bc11be12b769 | empty | none |
| 9682 | 0 | true/true | true | 14 | 5d7f7e7cf51961897dea8522ba73538f1d41be2db3a3a588321c35600cdb9c0c | empty | none |
| 9694 | 0 | true/true | true | 13 | b0d217a230e7403cae11838bb5587628a3d7cff96c1442471b1e9bd63d992940 | empty | none |
| 9706 | 0 | true/true | true | 13 | 1d938027b25200ae4111adcc5efbe06dfa3c9594acd3a8791674261b60922d9a | empty | none |
| 9718 | 0 | true/true | true | 12 | a3835c40dfac30bb91836bb1a90d47d0a1323fcfafa9ecfa36198b2c61ce472d | empty | none |
| 9730 | 0 | true/true | true | 11 | 47a4657ef69b8c116e8cb6cb9f2177e53ec8783bd1ad81a7b04d1f24aefae2e0 | empty | none |
| 9742 | 0 | true/true | true | 12 | 730aa6d4f0cd693734cb9143b908b1a4b00a5d09175d1cba8f3c4d530045a4e0 | empty | none |
| 9754 | 0 | true/true | true | 12 | 6fa2f119d6be89154b0c548f2c871d649d2d79a8ad434cc3d58a061b79422e79 | empty | none |
| 9766 | 0 | true/true | true | 11 | abad4dc91756c1b214646c0d2f63469b8d83380f195c96851dde7148262145db | empty | none |
| 9778 | 0 | true/true | true | 12 | 896e01507f771656c6162bfa8e09383c714e958c0f4df62b3a910c77804e1a6a | empty | none |
| 9790 | 0 | true/true | true | 12 | 5ee238e0d7e8e1bef208f29dd78af49730776ea2edea77ceecab0c68edb20349 | empty | none |
| 9802 | 0 | true/true | true | 11 | 890009df9fc8f1e331fc07b258dfb40a0d4bcbd353106c95c37999daff49e467 | empty | none |
| 9814 | 0 | true/true | true | 11 | eb772023600ac81fafa373e82222ca835e0f79b9c129d1875525dc88baa5efab | empty | none |
| 9826 | 0 | true/true | true | 12 | 1512a168c7edfff03079ec255c9edf98316d225b53ad809f6722f19beedc352d | empty | none |
| 9838 | 0 | true/true | true | 11 | 4230fa5f22277bc4fd01883d80192d97eb8a302a1e9bbaa5c4659706707c36bd | empty | none |
| 9850 | 0 | true/true | true | 12 | 3f6535fb7e30712fc39851c352a79a9c14dbc2433e94e41cdadeac88323806f3 | empty | none |
| 9862 | 0 | true/true | true | 12 | ebdee2403be7d51aa1d250bc870822b3ec7fac8c07b77c75683281bced86419f | empty | none |
| 9874 | 0 | true/true | true | 12 | 9da84f470a67235816286acfcba0d2d22e07ba708af1d63d353dfc379b9a1a20 | empty | none |
| 9886 | 0 | true/true | true | 12 | 4988e62670bf4390ea7e7912a24c2e513c59e4c39778b1b4efbfdeef005d6cff | empty | none |
| 9898 | 0 | true/true | true | 11 | 516b840e6fcbb82881a32d4bb7109a303bc97a47a33b0e8a8cf30813256936d8 | empty | none |
| 9910 | 0 | true/true | true | 12 | 3fdd924f6fc05037e994d3f1025df9e20a3d5f9e15d2ffe43f7a2841205966b7 | empty | none |
| 9922 | 0 | true/true | true | 11 | 641e38f01a42978107e345bd90447b285c5bc12011de260194d133de5beb04fa | empty | none |
| 9934 | 0 | true/true | true | 12 | 8439c863d7f9cb62a07dd874645d804245b553e0d078a01ba664f8d1abb9ad0f | empty | none |
| 9946 | 0 | true/true | true | 13 | fa18cb9a9215f60e717d95607cd9d47b42306978a5f85f90afb56002d99eb34c | empty | none |
| 9958 | 0 | true/true | true | 11 | a0bd853e08ce1d29b3085f8e7442debbf61feeda93bf376b8781355ecb8edac1 | empty | none |
| 9970 | 0 | true/true | true | 12 | 243539f9a6f3006e9227fe1be50c20e6838398826a2d8105d61d6608a48681aa | empty | none |
| 9982 | 0 | true/true | true | 12 | 9dcf5f1ab6b2d826e17575bd74fb88ecfda3d45bd688127d7bbcd87f79801d33 | empty | none |
| 9994 | 0 | true/true | true | 11 | 8a649fe51a4fca671297dd68fb2f3f0a919b97cd928b89d2aa6094cb013c7644 | empty | none |
| 10006 | 0 | true/true | true | 12 | f03c903ffe0ad44632dd2f3512bfd93bdb48ca6e78225f72204b1eb8ce4421d4 | empty | none |
| 10018 | 0 | true/true | true | 12 | 8bce397a763490013d9a780b1c2a93e2b49398b9d521effd8294c89d2d2b39ba | empty | none |
| 10030 | 0 | true/true | true | 13 | 16ce699c23da5e1da8a464bfc9c41eb28bae1b53855160026853e13e8f59466d | empty | none |
| 10042 | 0 | true/true | true | 14 | 16ce699c23da5e1da8a464bfc9c41eb28bae1b53855160026853e13e8f59466d | empty | none |
| 10054 | 0 | true/true | true | 12 | fc265c2c5709f449353c4f69c014a51d675b022ad57619713f60f03841a57890 | empty | none |
| 10066 | 0 | true/true | true | 11 | fc265c2c5709f449353c4f69c014a51d675b022ad57619713f60f03841a57890 | empty | none |
| 10078 | 0 | true/true | true | 11 | 6245fd1665edfccae4210567e72e4aaa59b698c92ff3f21c3e1495ed10256229 | empty | none |
| 10090 | 0 | true/true | true | 12 | 6245fd1665edfccae4210567e72e4aaa59b698c92ff3f21c3e1495ed10256229 | empty | none |
| 10102 | 0 | true/true | true | 12 | 993a188faa1aacb4afe0117210a68dd8ffd4cffd4f470514690d3aec97046690 | empty | none |
| 10114 | 0 | true/true | true | 11 | 993a188faa1aacb4afe0117210a68dd8ffd4cffd4f470514690d3aec97046690 | empty | none |
| 10126 | 0 | true/true | true | 12 | 4089d4ed476942a90bceafd3878798c0be44893cc9450eac5637dd69326afaa9 | empty | none |
| 10138 | 0 | true/true | true | 10 | 4089d4ed476942a90bceafd3878798c0be44893cc9450eac5637dd69326afaa9 | empty | none |
| 10150 | 0 | true/true | true | 12 | afec03169073acd0d21885c15ad524f16ad7588cd5fd4664aac031c2988da7a4 | empty | none |
| 10162 | 0 | true/true | true | 11 | afec03169073acd0d21885c15ad524f16ad7588cd5fd4664aac031c2988da7a4 | empty | none |
| 10174 | 0 | true/true | true | 12 | ff9a6cf3657baef59a9f61a5e0a36c75cf32ec06c1fe37e4b58afac5b48f140d | empty | none |
| 10186 | 0 | true/true | true | 11 | ff9a6cf3657baef59a9f61a5e0a36c75cf32ec06c1fe37e4b58afac5b48f140d | empty | none |
| 10198 | 0 | true/true | true | 11 | 8439c863d7f9cb62a07dd874645d804245b553e0d078a01ba664f8d1abb9ad0f | empty | none |
| 10210 | 0 | true/true | true | 11 | 8439c863d7f9cb62a07dd874645d804245b553e0d078a01ba664f8d1abb9ad0f | empty | none |
| 10279 | 0 | true/true | true | 14 | 519c72bcbdd1018af9a369614b9db04a674bf91870d99dcca03665dabe162100 | empty | none |
| 10291 | 0 | true/true | true | 14 | 6597e484cb5bde938fadb3c728f2e76c6228364584306a453655eeebd1e61ffb | empty | none |
| 10304 | 0 | true/true | true | 14 | 99bb429d2a9facd7cebfbcb52e97c7ccea648d19953e05e10f824189f6b9f050 | empty | none |
| 10316 | 0 | true/true | true | 13 | 92572a6ea33865753d3a461d96830d38e1dbcded58e684114eab450c81ab4b59 | empty | none |
| 10328 | 0 | true/true | true | 14 | 184ebab89778a4ebfd837d72bd299f882d8b121893c1b897e8ba8482c3f49583 | empty | none |
| 10340 | 0 | true/true | true | 14 | 930c45a356360f66ee3dc6c0e766a3c132d19421f7b3d3ae0804aa53a38ed1d4 | empty | none |
| 10352 | 0 | true/true | true | 14 | 3d0cedd11921553b4e03ab69bee99fa9367caf2c4a57fabc9038a9925e88f79e | empty | none |
| 10364 | 0 | true/true | true | 14 | cbb8afb58a64721157fe9eae256c046801a45bed0e15edb63a6051b1b9ddc753 | empty | none |
| 10376 | 0 | true/true | true | 14 | fb3d88aaeea3c17245ff6af2351e0d4ab992503296ea6c0709cdf19b59b0738a | empty | none |
| 10388 | 0 | true/true | true | 13 | a745d4cab78d8c1cbe52d1b7313712eb954fde049c15071633866d4c016b4f34 | empty | none |
| 10400 | 0 | true/true | true | 14 | af37e88f8521d9a88317b4ce20cd7bdb6ffeb4963ff5160a8c59aaed0240d7ec | empty | none |
| 10412 | 0 | true/true | true | 14 | 764ac7ef7051a4283c0e2269fde2f66c21ac4963952b2aa6f759524d0e4da11d | empty | none |
| 10424 | 0 | true/true | true | 13 | 55a8dd4119eb9cbb482606e7d351d7a40b5604f479d3f50e6fdc253c2e4e8fe4 | empty | none |
| 10436 | 0 | true/true | true | 13 | 792febf26b6c05c852b1b79579c9e2bcb46514a84e22b042bf94a7bbbeae331f | empty | none |
| 10448 | 0 | true/true | true | 14 | 8a2533f1315bd772fd20a5f4856bbe8f84c9ef3695b9055ac038ee0a7c758291 | empty | none |
| 10460 | 0 | true/true | true | 13 | 933e31d32c093a9b6e0811998d8c359ad246f96cb57185141970dcc5ef34780f | empty | none |
| 10472 | 0 | true/true | true | 13 | 0d63c747adf78adbe72dfea7ed22e697695147b4491b3a1dfc9e80ff71886087 | empty | none |
| 10484 | 0 | true/true | true | 13 | 5dda63745e100283f2341f127cbfeb03bd837b3a84f84c86dd32d620b5423bc6 | empty | none |
| 10496 | 0 | true/true | true | 12 | d0b2471c903b124251905a71b4d7b5d82ad8a2ee19c372aed4172454bcc25f74 | empty | none |
| 10508 | 0 | true/true | true | 14 | 68fa21c48160956f802946383014ab50be7bd74aad6d1426d035791cbdf920cb | empty | none |
| 10520 | 0 | true/true | true | 14 | 04bf85326a5ae431bf9be2d7e328b2a4271d4414634ceb13d7ce3cc802bfae89 | empty | none |
| 10532 | 0 | true/true | true | 15 | 72b64e1d8875fb1ac53454f1fb30df6e5a6fb78d77c8598f8ce0db5f8957d527 | empty | none |
| 10544 | 0 | true/true | true | 16 | 62a781e2e811e88bef2147726ab01463b795ab7506958305a08c46fbf8c6ef75 | empty | none |
| 10556 | 0 | true/true | true | 19 | 22c085e45c14e46ead2eadef7678f09214f37992b39a3ab19aee1eb702b1501e | empty | none |
| 10568 | 0 | true/true | true | 13 | e3d360554aa3c1d2ee64841b3a6c62b1f60860cf12a9a6ec5fb3a1b01b573fa5 | empty | none |
| 10622 | 0 | true/true | true | 20 | ef0895f720143e0381f67d70e7b00efae26864cc8f7be52ec3185cf3be1bcb55 | empty | none |
| 10634 | 0 | true/true | true | 13 | eb772023600ac81fafa373e82222ca835e0f79b9c129d1875525dc88baa5efab | empty | none |
| 10646 | 0 | true/true | true | 16 | 6a2e7aa4295400e49d83f0a53d0ee3ba945dca48bf00ec91aeb235c699a37279 | empty | none |
| 10658 | 0 | true/true | true | 12 | 72fcc7f01cd2d33ff4eb8057972c6263dd78994869e92bb1b322e16b7ea62dfe | empty | none |
| 10670 | 0 | true/true | true | 14 | f14ad57deed8091e05e1b7c2944ece85b0eda0c8a7519e901474f4f288cbf6c8 | empty | none |
| 10682 | 0 | true/true | true | 12 | ff522633da769d0daf9b133eed098b308124d9f44de5b7a8e5f31864d34a50c3 | empty | none |
| 10694 | 0 | true/true | true | 14 | f135d00f03f240ed5834c878f20049e9a97f491465c72b9e2bc57d35191eb7ff | empty | none |
| 10706 | 0 | true/true | true | 12 | 2b7cfa79f547c5fca60ccf852a76c75faef1c6956d7242ad2971e37bb995a982 | empty | none |
| 10718 | 0 | true/true | true | 13 | d00b06a13da37081b5147fc618e830bc9ff61ec55ac4d14e1b9bea72dfd9db8e | empty | none |
| 10730 | 0 | true/true | true | 11 | 72fcc7f01cd2d33ff4eb8057972c6263dd78994869e92bb1b322e16b7ea62dfe | empty | none |
| 10742 | 0 | true/true | true | 11 | f14ad57deed8091e05e1b7c2944ece85b0eda0c8a7519e901474f4f288cbf6c8 | empty | none |
| 10754 | 0 | true/true | true | 12 | ff522633da769d0daf9b133eed098b308124d9f44de5b7a8e5f31864d34a50c3 | empty | none |
| 10766 | 0 | true/true | true | 13 | f135d00f03f240ed5834c878f20049e9a97f491465c72b9e2bc57d35191eb7ff | empty | none |
| 10778 | 0 | true/true | true | 12 | 2b7cfa79f547c5fca60ccf852a76c75faef1c6956d7242ad2971e37bb995a982 | empty | none |
| 10790 | 0 | true/true | true | 12 | d00b06a13da37081b5147fc618e830bc9ff61ec55ac4d14e1b9bea72dfd9db8e | empty | none |
| 10802 | 0 | true/true | true | 12 | e5db8a68bef26ddbf8ad307a78638e2dfd669a21fa6bf9f4d12193cae146cd25 | empty | none |
| 10814 | 0 | true/true | true | 12 | fd09cb98ac3e60032d6ea7f817582a11b8d80beeca8b0bf37fc015d2fac47829 | empty | none |
| 10826 | 0 | true/true | true | 12 | 014a481d8dfb3cc6b8babf57a0fe6371c24b138d9f3cb38e74e94f700c2f0b32 | empty | none |
| 10838 | 0 | true/true | true | 14 | 6224dd23ece684eb3d435d6e26e017c7d70445ae72b6980dc7e6e106c86d8259 | empty | none |
| 10850 | 0 | true/true | true | 12 | ecd4a43a27768b084fa343b1cb43941cd1f4d28d9a0dc9c7e25fe977f3f6e978 | empty | none |
| 10862 | 0 | true/true | true | 12 | 2f4391e2afc91bec9ceebab6e654bae1b35ff661319842c29d8267f761bd84e9 | empty | none |
| 10875 | 0 | true/true | true | 11 | 333473d313a2e8d0fbe5d2fd3111f353003a40972046e222dda0f899204b528f | empty | none |
| 10888 | 0 | true/true | true | 12 | 05f0cd0a9a0df3da845bdc097d3718c252cdb1f7da681edf29e68b15fb4d0f36 | empty | none |
| 10900 | 0 | true/true | true | 12 | acb7f925ca84e8be75d612649e3bab7b90b2a51a387f136c1d17a292c488e6bd | empty | none |
| 10912 | 0 | true/true | true | 11 | b3eb8850b64fa3526ba99fe5e37275d7e26136f913e5ca5ce1a8df9143b5d1d8 | empty | none |
| 10924 | 0 | true/true | true | 12 | 9129e78507830010767b484ad2e3676c1438c6f69bcd3b7c9ad5975041397400 | empty | none |
| 10937 | 0 | true/true | true | 14 | 5661b30f4f7c034387582cd7faa005d9a39b56cba900d6e10e73a56c0e59bf4b | empty | none |
| 10949 | 0 | true/true | true | 13 | e2baf855be9c7facc8c41294ad9ac9cbf6fed5f6d18d2db27588d9bc69304498 | empty | none |
| 10961 | 0 | true/true | true | 12 | 6af869a2efa20a418660dbcc08dddcaeac670587fcf867381bd9f6c44c025d61 | empty | none |
| 10974 | 0 | true/true | true | 11 | 197cdd7db601957fb87ffa0306718ac4d6fdbdb99c575e14f9c7751d954dc6a0 | empty | none |
| 10993 | 0 | true/true | true | 19 | 47a4657ef69b8c116e8cb6cb9f2177e53ec8783bd1ad81a7b04d1f24aefae2e0 | empty | none |
| 11005 | 0 | true/true | true | 18 | d44123f97a1d96e462113b0e0e357ccfe1e5627cd134d21b58b173f68bccbe99 | empty | none |
| 11044 | 0 | true/true | true | 15 | c3f1065ef5f9a3524d95618c530bc2a9a665350dd3730acdf5507081e1269756 | empty | none |
| 11056 | 0 | true/true | true | 12 | f82d7729b34039381037208f894f347cd198eff5d047095a34029d539b4a9668 | empty | none |
| 11068 | 0 | true/true | true | 12 | c18109cd79bbcdea60dd599a0e83b3d3485094b153a118d89b3287d0f03dda4c | empty | none |
| 11080 | 0 | true/true | true | 13 | 4e68eec7c21bbf8d507d0022ea5e8e272bac97b6afda1fc0a131198395fdc6ad | empty | none |
| 11092 | 0 | true/true | true | 12 | bda13662e944f7d124c29f1cde2525192bddae8f685e74095663813e766c8405 | empty | none |
| 11104 | 0 | true/true | true | 13 | d5c9827160d934f629ca8b3f265e3b24d22fb21234e78d86eaa375d9a26a3942 | empty | none |
| 11204 | 0 | true/true | true | 18 | 1b5b4d5bd4c71a3792ba8f9951c6955659faa28a679eff9b41be39992b6ef9ec | empty | none |
| 11216 | 0 | true/true | true | 15 | b0b6e5d6ac4f9fa89f99a47028d7b8f905f746d2e0ed83fd91ea1d2dde1cea5a | empty | none |
| 11228 | 0 | true/true | true | 15 | 5865e7986bcc866488b9d1839403c155411b8e450369b56bbb35ed49a48bcbb8 | empty | none |
| 11240 | 0 | true/true | true | 16 | 16ce699c23da5e1da8a464bfc9c41eb28bae1b53855160026853e13e8f59466d | empty | none |
| 11252 | 0 | true/true | true | 18 | 3ac7d8e90fb70f5fe2fca09bb309034064a46c3d22a1d77c121210689a250160 | empty | none |
| 11266 | 0 | true/true | true | 33 | ce2b2cb16a10f21c7c79a8e1567fc71b411bf3c6a8eab7adff63bc3baafa3eb8 | empty | none |
| 11278 | 0 | true/true | true | 15 | 7c24f90c4276af62d1379f0fb60668d33dc95c416250fae1a01e40f0d9861b54 | empty | none |
| 11290 | 0 | true/true | true | 14 | 03bed7bfa4d12fd50f3720d49e32e66547c98d6a2ce6c3f326b8af552f1cce38 | empty | none |
| 11302 | 0 | true/true | true | 15 | 56333ea33ec873a4c82a8a8174debd72a58d144d5ec9996014788bb1c7ed8959 | empty | none |
| 11314 | 0 | true/true | true | 14 | 8f788bc898504ea8c8dc85d0625116fa537f1dc99c8429b0d39d7395702360a0 | empty | none |
| 11326 | 0 | true/true | true | 16 | efd036ee4ddd626b493b62a2fd256d2976288f26c85a51d28c6f7133eab0ebf7 | empty | none |
| 11339 | 0 | true/true | true | 13 | 4add53cd754f971c7ce997529ee769a617ac1803ef95133266b740731906d98b | empty | none |
| 11352 | 0 | true/true | true | 15 | d728fda963fe339db090f42c873fff6f3484715e9682de51963b45e4c3da9498 | empty | none |
| 11366 | 0 | true/true | true | 18 | 04f85a9de65fb0107dab7617c45438e3025adb0d13225d72f342e05a9fc007f5 | empty | none |
| 11378 | 0 | true/true | true | 19 | 420ed1f8cff58cf3b06df8c2e040796f02debaec5b197af49721a5dacbd22746 | empty | none |
| 11390 | 0 | true/true | true | 14 | 4093e4c3a844273eb21791976b9a45caddb127f6eaa5f792a639bc11be12b769 | empty | none |
| 11402 | 0 | true/true | true | 16 | 5d7f7e7cf51961897dea8522ba73538f1d41be2db3a3a588321c35600cdb9c0c | empty | none |
| 11415 | 0 | true/true | true | 14 | b0d217a230e7403cae11838bb5587628a3d7cff96c1442471b1e9bd63d992940 | empty | none |
| 11428 | 0 | true/true | true | 18 | 1d938027b25200ae4111adcc5efbe06dfa3c9594acd3a8791674261b60922d9a | empty | none |
| 11440 | 0 | true/true | true | 14 | a3835c40dfac30bb91836bb1a90d47d0a1323fcfafa9ecfa36198b2c61ce472d | empty | none |
| 11452 | 0 | true/true | true | 17 | 730aa6d4f0cd693734cb9143b908b1a4b00a5d09175d1cba8f3c4d530045a4e0 | empty | none |
| 11464 | 0 | true/true | true | 13 | 6fa2f119d6be89154b0c548f2c871d649d2d79a8ad434cc3d58a061b79422e79 | empty | none |
| 11476 | 0 | true/true | true | 16 | abad4dc91756c1b214646c0d2f63469b8d83380f195c96851dde7148262145db | empty | none |
| 11488 | 0 | true/true | true | 19 | 896e01507f771656c6162bfa8e09383c714e958c0f4df62b3a910c77804e1a6a | empty | none |
| 11500 | 0 | true/true | true | 16 | 5ee238e0d7e8e1bef208f29dd78af49730776ea2edea77ceecab0c68edb20349 | empty | none |
| 11512 | 0 | true/true | true | 14 | 890009df9fc8f1e331fc07b258dfb40a0d4bcbd353106c95c37999daff49e467 | empty | none |
| 11524 | 0 | true/true | true | 15 | 1512a168c7edfff03079ec255c9edf98316d225b53ad809f6722f19beedc352d | empty | none |
| 11536 | 0 | true/true | true | 13 | 4230fa5f22277bc4fd01883d80192d97eb8a302a1e9bbaa5c4659706707c36bd | empty | none |
| 11548 | 0 | true/true | true | 16 | 3f6535fb7e30712fc39851c352a79a9c14dbc2433e94e41cdadeac88323806f3 | empty | none |
| 11560 | 0 | true/true | true | 14 | ebdee2403be7d51aa1d250bc870822b3ec7fac8c07b77c75683281bced86419f | empty | none |
| 11572 | 0 | true/true | true | 18 | 9da84f470a67235816286acfcba0d2d22e07ba708af1d63d353dfc379b9a1a20 | empty | none |
| 11584 | 0 | true/true | true | 15 | 4988e62670bf4390ea7e7912a24c2e513c59e4c39778b1b4efbfdeef005d6cff | empty | none |
| 11596 | 0 | true/true | true | 14 | 516b840e6fcbb82881a32d4bb7109a303bc97a47a33b0e8a8cf30813256936d8 | empty | none |
| 11608 | 0 | true/true | true | 16 | 3fdd924f6fc05037e994d3f1025df9e20a3d5f9e15d2ffe43f7a2841205966b7 | empty | none |
| 11620 | 0 | true/true | true | 16 | 641e38f01a42978107e345bd90447b285c5bc12011de260194d133de5beb04fa | empty | none |
| 11632 | 0 | true/true | true | 17 | 8439c863d7f9cb62a07dd874645d804245b553e0d078a01ba664f8d1abb9ad0f | empty | none |
| 11644 | 0 | true/true | true | 26 | fa18cb9a9215f60e717d95607cd9d47b42306978a5f85f90afb56002d99eb34c | empty | none |
| 11656 | 0 | true/true | true | 24 | a0bd853e08ce1d29b3085f8e7442debbf61feeda93bf376b8781355ecb8edac1 | empty | none |
| 11668 | 0 | true/true | true | 13 | 243539f9a6f3006e9227fe1be50c20e6838398826a2d8105d61d6608a48681aa | empty | none |
| 11680 | 0 | true/true | true | 14 | 9dcf5f1ab6b2d826e17575bd74fb88ecfda3d45bd688127d7bbcd87f79801d33 | empty | none |
| 11692 | 0 | true/true | true | 13 | 8a649fe51a4fca671297dd68fb2f3f0a919b97cd928b89d2aa6094cb013c7644 | empty | none |
| 11704 | 0 | true/true | true | 13 | f03c903ffe0ad44632dd2f3512bfd93bdb48ca6e78225f72204b1eb8ce4421d4 | empty | none |
| 11716 | 0 | true/true | true | 14 | 8bce397a763490013d9a780b1c2a93e2b49398b9d521effd8294c89d2d2b39ba | empty | none |
| 11728 | 0 | true/true | true | 17 | fc265c2c5709f449353c4f69c014a51d675b022ad57619713f60f03841a57890 | empty | none |
| 11740 | 0 | true/true | true | 14 | fc265c2c5709f449353c4f69c014a51d675b022ad57619713f60f03841a57890 | empty | none |
| 11752 | 0 | true/true | true | 14 | 6245fd1665edfccae4210567e72e4aaa59b698c92ff3f21c3e1495ed10256229 | empty | none |
| 11764 | 0 | true/true | true | 13 | 6245fd1665edfccae4210567e72e4aaa59b698c92ff3f21c3e1495ed10256229 | empty | none |
| 11776 | 0 | true/true | true | 15 | 993a188faa1aacb4afe0117210a68dd8ffd4cffd4f470514690d3aec97046690 | empty | none |
| 11788 | 0 | true/true | true | 14 | 993a188faa1aacb4afe0117210a68dd8ffd4cffd4f470514690d3aec97046690 | empty | none |
| 11800 | 0 | true/true | true | 14 | 4089d4ed476942a90bceafd3878798c0be44893cc9450eac5637dd69326afaa9 | empty | none |
| 11812 | 0 | true/true | true | 16 | 4089d4ed476942a90bceafd3878798c0be44893cc9450eac5637dd69326afaa9 | empty | none |
| 11824 | 0 | true/true | true | 14 | afec03169073acd0d21885c15ad524f16ad7588cd5fd4664aac031c2988da7a4 | empty | none |
| 11836 | 0 | true/true | true | 16 | afec03169073acd0d21885c15ad524f16ad7588cd5fd4664aac031c2988da7a4 | empty | none |
| 11848 | 0 | true/true | true | 14 | ff9a6cf3657baef59a9f61a5e0a36c75cf32ec06c1fe37e4b58afac5b48f140d | empty | none |
| 11860 | 0 | true/true | true | 15 | ff9a6cf3657baef59a9f61a5e0a36c75cf32ec06c1fe37e4b58afac5b48f140d | empty | none |
| 11872 | 0 | true/true | true | 15 | 8439c863d7f9cb62a07dd874645d804245b553e0d078a01ba664f8d1abb9ad0f | empty | none |
| 11884 | 0 | true/true | true | 13 | 8439c863d7f9cb62a07dd874645d804245b553e0d078a01ba664f8d1abb9ad0f | empty | none |
| 11897 | 0 | true/true | true | 14 | 056ccbceb0244c671c415d798fccef396fcbd897b203949102704b1eb34c337a | empty | none |
| 11909 | 0 | true/true | true | 14 | 4df47860d238168ebc522bcdba4c07c02176b575d641f649be09d270b1878033 | empty | none |
| 11921 | 0 | true/true | true | 13 | f3ceb9b648bc2b88d26d4406d0913111f2ac159aba709893af03c038e667a416 | empty | none |
| 11933 | 0 | true/true | true | 15 | 30636d63fdc3390c0620bb28f7d914e80c4293bbfd8fcd95d24d67c41ce17ffa | empty | none |
| 11946 | 0 | true/true | true | 17 | d92e55ac282bedb28c847eb45e64b512972cf26dfe691fce818647f87b0c1e32 | empty | none |
| 11958 | 0 | true/true | true | 19 | 22c085e45c14e46ead2eadef7678f09214f37992b39a3ab19aee1eb702b1501e | empty | none |
| 11970 | 0 | true/true | true | 22 | e3d360554aa3c1d2ee64841b3a6c62b1f60860cf12a9a6ec5fb3a1b01b573fa5 | empty | none |
| 20126 | 0 | true/true | true | 30 | c9b117a9a815086de901f04ccd015e4bda3dd2425f3b5d666e6463d4aa003f18 | empty | none |
