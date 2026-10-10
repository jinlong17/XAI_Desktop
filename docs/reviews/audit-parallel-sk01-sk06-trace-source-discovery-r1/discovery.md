# SK-01–SK-06 source discovery (iteration 1)

## Scope and state

Fixed-source, source-only discovery at dispatch parent `41111042c093c2110770d1e12829d377242d4c74` for the six original SK rows in the registered card. At that pinned execution-state source, SK-01–SK-06 remain `pending`, each with empty retained evidence and `needs_fixed_scope_discovery`. No implementation, runtime result, qualification, or acceptance is established. Batch counts, ownership, gates, and all other audit rows remain unchanged. Requirements are grounded in `01-inventory-governance.md:75-80`; related GOV-01–03 findings are at lines 28–30. Exact original action/acceptance and future evidence remain in the task card. Historical statements, current source behavior, and proposed contract are separate.

## Shared ownership and dependencies

Six canonical skills are tracked under `.teams/skills`. Five Claude/Codex mirror directories are symlinks into those sources; `xai-consistency-audit` is a regular tracked copy whose Git blob matches canonical. Seven related Cursor rules are separately tracked. The blanket symlink statement in `docs/workflow/project/usage-guide.md:99` is stale for this exception. Generator path-presence checks do not establish mirror identity.

Portable owners: full-loop `docs/workflow/_portable/04-automation-loop.md`; roadmap `docs/workflow/_portable/06-roadmap-orchestration.md`. Project skills render from those appendices, so shared changes need declared resync and consumer/mirror review. Feature-brief names portable `03-step0-brief-spec.md` canonical until a project overlay exists. Dossier PRD schema lives inside `xai-feature-dossier-sync`; it requires source and test IDs but has no stable feature-ID field.

GOV-01–03 are shared dependencies: G01 dev-log format discovery/parse visibility; G02 manifest discovery and state-to-Target reconciliation; G03 source/generated coverage plus freshness/current verification range. SK-05 consumes these, not a second parser. GOV-05 is one nine-feature dossier audit, not nine SK rows. SK-01/SK-06 share its dossier schema/writer and preserve the no-code-only-source rule.

## SK-01 — brief identity and failure/recovery acceptance

**Original item:** `xai-feature-brief` fixes `feature_id`, scope and failure/recovery acceptance; later dossier and iterations trace to original brief. Pending; evidence empty.

**Source/gap:** Brief skill collects scope/non-goals, risk, testable acceptance and QA gate; recovery is addressed when applicable. Portable Step 0 reserves canonical slug choice to feature-plan (`03-step0-brief-spec.md:265+`). Dossier requires real `Source:` per requirement and acceptance criteria→test IDs, but PRD schema has no stable ID. This is a handoff seam, not proof of runtime failure.

**Candidate scope/owners:** Owner decides whether `feature_id` is distinct from/aliases/derives from canonical slug, assignment point, and rename behavior. Carry one key, scope, non-goals and applicable failure/recovery acceptance brief→dossier→iteration. Keep slug choice with feature-plan unless portable boundary changes; keep unknowns TBD and preserve no-code-only-source. Candidate: feature-brief skill, `.agents/templates/feature-plan.md`, dossier skill; portable `03` only if shared schema changes, then regenerate. Platform symlink and Cursor impacts apply.

**Future evidence/fixtures:** Owner-reviewed key semantics; key survives slug rename; scope/non-goal across iterations; missing key/source; failure/recovery applicable vs TBD. None ran.

## SK-02 — phase Target, commit, verification receipt, closeout

**Original item:** `xai-feature-full-loop` emits Target/commit/verification receipt per phase; closeout checks registry parse and dossier delta, not package status alone. Pending; evidence empty.

**Source/gap:** Full-loop reads `dev_log.md` between workers and reports Status Panel/workers/blockers/next step. Portable build template records phase commit/test/work log; verify has its own verdict. Parent loop lacks normalized per-phase receipt and parse+dossier-delta closeout. Exact registry authority/path is undecided; none guessed.

**Candidate scope/owners:** Bind stable feature/Target/iteration to commits, scoped verification evidence/result, and same iteration status. Closeout reconciles authorized registry parse and dossier delta, surfacing missing/ambiguous links. Preserve independent verify and human ship gate. Candidate: portable `04`, generated full-loop skill, `feature-auto-build.md`/`feature-verify.md`; dossier writes remain with dossier skill. Coordinate with GOV-01–03.

**Future evidence/fixtures:** Two Targets/package with different commits; missing/duplicate Target; wrong-commit receipt; parse failure; omitted dossier delta; READY_TO_SHIP without ship action. No stage/dispatch/worker/parse/dossier update/skill action ran.

## SK-03 — roadmap schema and Target identity

**Original item:** `xai-roadmap-loop` uses unified manifest schema and checks corresponding Target; emit/serial cannot show stale iteration. Pending; evidence empty.

**Source/gap:** Portable A6 has slug/source/dependencies/status/automation mode/cross-vendor/last run/note (`06-roadmap-orchestration.md:220-273`), not stable Target/iteration plus commit/verification receipt. Skill reconciles manifest queue status with `dev_log`; package Status Panel remains separately owned. Three actual AI-tool manifest examples are no-table-header consumers noted by GOV-02. Manifest and iteration status are separate facts.

**Candidate scope/owners:** Define Target/iteration and receipt fields that reconcile exact row to exact iteration. Preserve queue semantics/no-package-Status-writer boundary; surface mismatch with IDs/paths. Candidate: portable `06`, rendered roadmap skill, roadmap consumers; coordinate parser with GOV-02 and receipt with SK-02.

**Future evidence/fixtures:** Optional table header; duplicate/missing Target; multiple iterations/package; stale manifest vs newer iteration; emit/serial preserve owned fields. No roadmap command/emit/serial/manifest write ran.

## SK-04 — release kind versus product/deployment health

**Original item:** `xai-release-log` distinguishes change_kind/source commit/deployed commit/environment/artifact; docs-only must not change product verification health; SHIPPED is not deploy. Pending; evidence empty.

**Source/gap:** Skill/log use product line, branch/commit, delta, free-text Verification and risks; prohibit invented evidence and calling docs shipped. Dashboard `release-testing.mjs` classifies free text pass/fail/partial/unknown. No typed split exists for docs checks vs product health or joined source/deploy receipt. This is a schema gap, not proof current output is wrong.

**Candidate scope/owners:** Owner defines change-kind vocabulary/field requirements. Bind source commit to delta, deployment receipt to deployed commit/environment/immutable artifact. Separate documentation check, product runtime health, SHIPPED and deployment. Do not infer enum/health rules from regex. Candidate: release-log skill/log, dashboard release parser, `generate-state.mjs`, contract/template consumers.

**Future evidence/fixtures:** Doc-only pass; runtime failure; SHIPPED not deployed; mismatched deploy commit/artifact/environment; missing receipt. No release edit/deploy check ran.

## SK-05 — source/generated coverage and verification range

**Original item:** `xai-dev-dashboard-sync` asserts source/generated coverage; omissions/conflicts/current-commit range visible; link GOV-01–03. Pending; evidence empty.

**Source/gap:** Dashboard contract separates authored `dashboard-state.json` from generated facts; generator reads Git, roadmaps, skills/agents, docs, release logs and dev logs. Explicit/generated field notes/counts are field provenance, not identity equality. `listSkillSet` omits absent paths; mirror status checks presence, not content identity. No discovered/parsed/emitted/unparsed/duplicate/conflict sets or per-feature verified commit range are emitted. Snapshot freshness is not coverage. UI consumes skill and Testing Registries separately; static verifier was not run.

**Candidate scope/owners:** Inventory finite source sets/authoritative keys first. Emit identity sets/paths plus exact verification range/commit; keep freshness, coverage and verification separate; surface unknown formats. Consume GOV-01/02 parser contracts; add GOV-03 coverage boundary. Candidate: dashboard-sync skill, `generate-state.mjs`, `verify-static.mjs` consumer only, `dev-dashboard.md`, dashboard state, `skill-agent.js`, template/boundary docs.

**Future evidence/fixtures:** Missing source; duplicate identity; conflicting mirror; malformed format; stale snapshot; clean snapshot with unparsed source; stale verified commit. Choose source-set authority and single writer first. No generator/parser/verifier/import/refresh ran.

## SK-06 — stable ID and split evidence

**Original item:** `xai-consistency-audit` maps stable ID bidirectionally across PRD/package/test/deploy; code issues and record drift get separate evidence. Pending; evidence empty.

**Source/gap:** Skill separates read-only detection, confirm-before-apply, `code_violation`, `record_drift`, `needs-operator`, with path/line evidence. Checks reconcile dashboard/PRD/package/dev-log presence/status; table names ghost/missing/status/cross-surface/PRD-code mismatch. PRD has test-ID traceability but no stable key; no chain through Target/iteration, test result and deploy receipt.

**Candidate scope/owners:** After SK-01 and GOV-05 decide identity/dossier ownership, define stable-ID edges across PRD requirement/revision, packages, Target/iteration, test ID/result and release/deploy receipt. Identify source/direction and surface missing/ambiguous/conflicting links. Preserve finding/write authority; do not infer requirements from code or auto-edit code/priority/release/deploy/roadmap. Candidate: consistency skill/check table, module-classification only for boundary authority, dashboard state, shared SK-01/02/04/GOV-05 schemas.

**Future evidence/fixtures:** PRD-only/package-only; missing/duplicate ID; one-to-many packages; missing test; deploy mismatch; code violation path/line vs record-drift evidence. No report/apply ran.

## Shared design holds

Owner review is needed for stable ID vs slug, Target/iteration receipt, source-set authority/coverage, change-kind/deployment vocabulary, dossier map/writer. Candidate paths identify ownership, not edit authorization. A future packet should bind before/after hashes, paths and fixtures to each SK; cover cross-platform rules and portable rendering; share GOV-05 writer and reconcile GOV-01–03 without duplicating/closing them. Keep code/documentation, workflow/product verification, SHIPPED/deploy, and discovery/qualification separate.

No owner decision on these contracts appears in pinned inputs. No independent review, implementation, runtime, test, mirror regeneration, qualification, deploy, remote sync or root admission evidence exists. Do not mark items complete, accepted, implementation-ready or qualified.

## Process and limits

Source acquisition used Node REPL after shell process creation reported ENOENT in surrounding task context. Earlier helpers did not retain raw child PIDs, numeric exits, tool chunk/session IDs or EOF/drain receipts; these remain UNKNOWN, not zero. Surfaced errors: initial wrong worktree-path ENOENT and invalid Git tree-object expression; neither changed files or yielded evidence. Later correct-path reads confirmed fixed HEAD and clean status. No skill action, product execution, test/build/lint/import/generator/parser/browser/native/server/network/vendor/qualification/probe or child agent ran.

Budgets remain discovery iteration 1/3; one static check ≤120s; total ≤30m; zero runtime/tests/build/lint/browser/native/server/qualification/probes/vendor/network/children.
