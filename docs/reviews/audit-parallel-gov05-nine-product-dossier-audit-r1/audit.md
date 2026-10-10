# GOV-05 Nine Product Dossier Traceability Audit

Mode: audit (read-only dossier reconciliation)
Scope: nine user-visible Web features from GOV-05
Product source: f9eb4b1f207bc4b46f547b90afc250424b3c8695
Audit parent: ed125e1b3ea0a8db4c53c43a45d57b910af43d67
Inputs: see inputs.sha256; P0 hashes bind product docs/code, and HEAD hashes bind parent policy and the current Time Tracker documentation delta.

This report maps requirement sources to documented design/API, implementation entry points, test plans and historical ship/deploy evidence. Source code is used only to identify implementation. Requirements without an allowed originating source are explicitly marked 待确认. No canonical PRD was drafted or edited.

## Scope and current canonical PRDs

The nine features are AI Chat, Countdown, Habits, Matrix, Meditation, Metric Tracker, Pet, Statistics and Time Tracker. The package-to-feature grouping follows the existing feature map and Web shell registrations; infrastructure packages are excluded.

At the audit parent, only docs/product/time-tracker/prd.md exists among these nine. It is a bounded TT08 mode/session documentation candidate, dated 2026-10-10, and says independent verification and full-chain acceptance remain pending. It does not complete the broader Time Tracker dossier. The other eight canonical paths are missing.

The current release log has no feature-specific ship entries for these nine. Historical SHIPPED or READY_TO_SHIP labels below come from their feature dev logs and remain historical workflow evidence. No deployment state is inferred from those labels.

## Feature matrices

### AI Chat

| ID | Requirement and Source | Design / API | Implementation | Test mapping | Ship / deploy and gap |
|---|---|---|---|---|---|
| R1 | Port the conversation sidebar, composer, model choice, voice toggle, starter prompts, aurora/orb presentation and explicit demo reply. Source: xai-web-ai-chat discovery review §§1, 6; xai-web-ai-chat dev_log Work Log 2026-05-23. | xai-web-ai-chat docs/design.md and api.md; plugin-web-ai-chat docs/design.md and api.md. | packages/plugin-web-ai-chat/src/AiChatModule.tsx; apps/web/src/routes/modules/shellRegistrations.tsx. | Both feature test plans map module/composer/sidebar/orb behavior; historical initial verify records 84 plugin tests. | Base feature is historically SHIPPED on 2026-05-23; the send-while-thinking fix was separately verified and shipped 2026-05-24. No canonical PRD or feature-specific release/deploy entry. |
| R2 | BYO provider settings, encrypted key handling, streamed responses and visible categorized errors. Source: xai-web-ai-chat-real-llm-adapter discovery review §9 and dev_log extension Work Log 2026-05-25. | 2026-05-25 extension in xai-web-ai-chat design/API/test docs. | AiChatModule and provider/stream adapters in packages/plugin-web-ai-chat; provider settings are in plugin-web-settings-rest. | Extension test plan covers key secrecy, stream parsing, errors and settings; historical dev_log records a SHIPPED result. This audit did not exercise a provider. | Historical feature ship is recorded 2026-05-25. No current provider/runtime, credential, production or deployment claim is made. |
| R3 | Read bounded task/calendar context and present proposed create/update/delete actions for explicit user confirmation before writes. Source: xai-web-ai-tool-layer and xai-web-ai-tool-edit-delete discovery reviews, plus the corresponding AI-chat dev_log Work Log entries dated 2026-05-29. | AI tool extension sections in AI-chat design/API/test docs; confirmation and tool-registry contracts. | packages/plugin-web-ai-chat/src/AiChatModule.tsx and related internal tool/confirmation modules; task/calendar modules own the eventual writes. | AI-chat test plan lists context-provider, tool protocol/registry and confirmation coverage; historical dev_log records independent verification and ship. | Historical SHIPPED entry exists. This trace does not establish current provider behavior or live task/calendar execution. No canonical PRD or release-log entry. |
| R4 | Support the documented OpenAI-compatible tool-call protocol as an additional provider path. Source: xai-web-ai-tool-openai-compatible discovery review and its AI-chat dev_log Work Log entry. | OpenAI protocol extension in AI-chat design/API/test docs. | packages/plugin-web-ai-chat provider and protocol modules. | Test plan includes OpenAI protocol, round-trip and anti-drift cases; historical dev_log records SHIPPED. | Historical SHIPPED entry exists; no live provider or deployment verification in this audit. |

Gap/backfill: create docs/product/ai-chat/prd.md. Preserve the dated progression from demo adapter to live provider and tool-assisted actions; state that tool actions require confirmation and keep provider/runtime readiness separate from historical ship records.

### Countdown

| ID | Requirement and Source | Design / API | Implementation | Test mapping | Ship / deploy and gap |
|---|---|---|---|---|---|
| R1 | Create, edit and delete countdown cards; render until/since day counts from local dates; persist cards and update the day count across midnight/visibility changes. Source: xai-web-countdown discovery review §§1, 3 and roadmap seed; dev_log initial W2 Work Log. | packages/xai-web-countdown/docs/design.md and api.md. | packages/plugin-web-countdown/src/CountdownModule.tsx and CountdownEditDialog.tsx. | Test plan maps date calculation, modal CRUD, persistence and registration; historical initial verify records 110 tests and a later ship entry. | Base module historically SHIPPED 2026-05-23. |
| R2 | Add the later preset and expanded edit/presentation options recorded in the V2 and V2.1 entries, including pin/hide, style/layout and list/timeline/calendar/history navigation. Source: xai-web-countdown dev_log Work Log 2026-06-04 04:35 and 13:35. | The baseline design/API/test docs describe the original feature; the dev_log records later deltas. | Same Countdown module and its later P0 source. | Existing test plan and historical initial verification do not by themselves establish complete independent acceptance of these later deltas. | Later P0 changes are present in product history, but a feature-specific release/deploy receipt and complete V2/V2.1 acceptance link were not found. Keep these deltas separately labeled until their evidence is reconciled. |

Gap/backfill: create docs/product/countdown/prd.md. Include original requirements and the two dated later increments as separate revisions; do not treat the initial SHIPPED record as proof that every later P0 change shipped.

### Habits

| ID | Requirement and Source | Design / API | Implementation | Test mapping | Ship / deploy and gap |
|---|---|---|---|---|---|
| R1 | Add habits and toggle current/recent check-ins with immediate persistence. Source: habits-basics feature brief and xai-web-habits discovery review §7. | packages/xai-web-habits/docs/design.md and api.md. | packages/xai-web-habits/src/HabitsModule.tsx and add/toggle state helpers. | Test plan maps AC-ADD and AC-TOGGLE; historical verification records 118 cases. | Historically SHIPPED 2026-05-23; cross-vendor manual smoke was deferred in the historical record. |
| R2 | Show monthly counts/rate, consecutive streak and year progress, with calendar navigation. Source: xai-web-habits discovery review §§7–8. | Same design/API docs; accepted C1 streak, E1 year progress and monthly denominator are documented. | HabitsModule plus internal compute/calendar modules. | Test plan maps AC-STAT, AC-STREAK, AC-PROGRESS and calendar coverage. | No canonical PRD or feature-specific release/deploy entry. |
| R3 | Persist one diary entry per habit per displayed month and restore it when returning to that month. Source: xai-web-habits discovery review §§3, 7–8 and habits-basics feature brief. | Diary granularity and persistence behavior are documented in design/API. | HabitsModule and DiaryCard persistence path. | Test plan maps AC-DIARY round-trip cases. | Historical ship record does not establish a new deployment receipt. |

Gap/backfill: create docs/product/habits/prd.md. Record only the discovery-approved monthly diary and streak/stat semantics; future changes to those semantics need their own sourced revision.

### Matrix

| ID | Requirement and Source | Design / API | Implementation | Test mapping | Ship / deploy and gap |
|---|---|---|---|---|---|
| R1 | Present four priority quadrants, move cards between quadrants with persistent state, provide bilingual labels and keyboard movement. Source: xai-web-matrix discovery review §§7–8 and roadmap seed. | packages/xai-web-matrix/docs/design.md and api.md. | packages/xai-web-matrix/src/MatrixModule.tsx and persisted move helpers. | Test plan maps render, persistence, DnD, keyboard, i18n and accessibility cases; historical initial verify records 54 tests. | Base module historically SHIPPED 2026-05-23. |
| R2 | Create a card from the header or target-quadrant add action, choose title/tag/quadrant and retain it after reload. Source: xai-web-matrix-card-create discovery review §5 and Matrix dev_log extension Work Log 2026-05-28. | Matrix design/API/test extension §E; create is documented as a separate create-only increment. | MatrixModule, MatrixComposer and internal create reducer. | Test plan extension maps composer/create/persistence and integration cases; historical dev_log records verification and ship on 2026-05-28. | Historical create increment is SHIPPED. Edit/delete were expressly deferred; no canonical PRD or release-log entry. |

Gap/backfill: create docs/product/matrix/prd.md. Keep the existing local-state model and create-only scope; do not silently add task-store linkage, edit or delete promises.

### Meditation

| ID | Requirement and Source | Design / API | Implementation | Test mapping | Ship / deploy and gap |
|---|---|---|---|---|---|
| R1 | Select and persist scene, clock style, ambient sound and duration; start a full-screen timed session with progress/remaining time and allow exit. Source: xai-web-meditation discovery review §§1.1–1.3 and §8; 20260523 roadmap seed. | packages/xai-web-meditation/docs/design.md and api.md. Active player state is documented as not persisted. | packages/xai-web-meditation/src/MeditationModule.tsx and player/clock components. | Test plan maps picker, preview, player, persistence, i18n, accessibility and shell cases; historical verification records 95 tests. | Historically SHIPPED 2026-05-23. A 2026-05-28 test-only repair was later verified/shipped; it does not add product behavior. No feature-specific release/deploy receipt. |

Gap/backfill: create docs/product/meditation/prd.md. Keep active-session restore out of scope unless a sourced product decision adds it.

### Metric Tracker

| ID | Requirement and Source | Design / API | Implementation | Test mapping | Ship / deploy and gap |
|---|---|---|---|---|---|
| R1 | The 2026-06-08 Work Log says the Web module adds V1 weight tracking, BMI/statistics helpers, local persistence, the selected option-3 UI and route/Cmd-K integration. Source: packages/plugin-web-metric-tracker/docs/dev_log.md, Work Log 2026-06-08. This is the only qualifying feature-origin summary located; precise user acceptance criteria remain 待确认. | packages/plugin-web-metric-tracker/docs/design.md and api.md, including later REL-01 and REL-05 amendments. | packages/plugin-web-metric-tracker/src/MetricTrackerModule.tsx. | Test plan documents module, metrics, date and save-recovery cases. These docs are not an independent acceptance result. | Dev log is READY_FOR_VERIFY; REL-01 has an independent correction pending recheck and REL-05 requests independent review. No SHIPPED/deploy evidence or feature-specific release-log entry. |

Gap/backfill: create docs/product/metric-tracker/prd.md only after the original product acceptance is sourced/confirmed. Limit any sourced baseline to the documented weight-tracking slice; do not infer additional metric types, medical interpretations or acceptance policy.

### Pet

| ID | Requirement and Source | Design / API | Implementation | Test mapping | Ship / deploy and gap |
|---|---|---|---|---|---|
| R1 | Render the eight documented pets; let users pick one, drag it with bounded position persistence, and show a happy state/tip on click. Source: pet-basics feature brief and xai-web-pet discovery review §§1, 7, 12. | packages/xai-web-pet/docs/design.md and api.md. | packages/xai-web-pet/src/DesktopPet.tsx and PetPicker. | Test plan maps AC-PET-1..16 across rendering, picker, drag, persistence, tips and language. | Historically SHIPPED 2026-05-23; manual cross-vendor smoke was deferred. |
| R2 | Show/hide the floating pet through the existing shell pet-toggle event. Source: xai-web-pet discovery review §§1, 8 and the dated feature dev_log. | Event-consumer boundary is documented in design/API. | DesktopPet listener and the existing shell rail toggle. | Test plan maps event and shell behavior. | No canonical PRD or feature-specific release/deploy entry. |

Gap/backfill: create docs/product/pet/prd.md. Record the floating companion and picker behavior; keep cross-vendor deferrals visible.

### Statistics

| ID | Requirement and Source | Design / API | Implementation | Test mapping | Ship / deploy and gap |
|---|---|---|---|---|---|
| R1 | Derive the documented range views, KPIs, charts and bilingual insights from persisted productivity data, with deterministic 26-week heatmap and honest empty states. Source: xai-web-statistics discovery review §§1, 7, 9. | packages/xai-web-statistics/docs/design.md and api.md. | packages/plugin-web-statistics/src/StatisticsModule.tsx and internal aggregators. | Test plan maps ranges, aggregators, visual components, registration and empty states; initial historical verification records 124 tests. | Initial module historically SHIPPED 2026-05-23. |
| R2 | Replace the task-completion proxy with an honest current-board completed-task count and visibly label its range-invariant semantics; keep focus and habit metrics intact. Source: xai-web-statistics-real-aggregation discovery review §§4–5 and Statistics dev_log SRA Work Log. | SRA extension in design/API/test docs; source explicitly forbids task writes and fabricated time splits. | StatisticsModule and read-only task-column aggregation. | Test plan SRA cases map narrowing, count, KPI marker and task bar; historical dev_log records a later SHIPPED result. | Historical SRA ship is recorded 2026-05-29. No canonical PRD or feature-specific release/deploy entry. |

Gap/backfill: create docs/product/statistics/prd.md. Preserve which metrics are range-derived versus current-state; do not imply live cross-module or deployment verification from historical tests.

### Time Tracker

| ID | Requirement and Source | Design / API | Implementation | Test mapping | Ship / deploy and gap |
|---|---|---|---|---|---|
| R1 | The current TT08 dossier documents Single/Multi mode, session start/pause/resume/end invariants, protected source edits, report projections and local civil-day behavior. Source: 待确认 for the original product requirement; the existing canonical PRD is a later accepted documentation artifact, not an allowed upstream requirement source under this audit rule. | Current parent docs/product/time-tracker/prd.md plus plugin-web-time-tracker docs/design.md and api.md carry the bounded TT08/TT02/TT01/TT03/REL01 contracts. | P0 packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx and internal session/storage/time helpers. | Current test plan maps sessionController, sessionInvariants, sessionEditor, module, window accounting/consumers and local-date/day-rollover tests. The TT08 PRD explicitly says the selector UI has static correspondence only and was not tested. | Historical dev_log says READY_TO_SHIP as of 2026-06-01, not SHIPPED. TT01/02/03/REL01 are bounded historical technical acceptances, not full product release/deploy evidence. Current PRD remains pending independent verification/full-chain acceptance. |
| R2 | Full original Time Tracker user-facing scope beyond the bounded TT08 slice. Source: 待确认; no qualifying original feature brief/discovery or dated dev_log iteration was located. | Existing design/API/test docs describe broader implementation and later changes but do not supply missing user-origin requirements. | TimeTrackerModule and related Insights/category/session source identify implementation only. | Existing test plan is historical coverage, not proof of the missing requirement source or full acceptance. | Keep this broader dossier gap open. Multi-to-Single conversion behavior is explicitly not an accepted policy in the current TT08 PRD. |

Gap/backfill: retain docs/product/time-tracker/prd.md and its bounded status. Expand it only after the missing original requirement source is recovered and the independent TT08/full-chain gates are resolved. Do not add a conversion rule or promote historical test results to a release claim.

## Cross-feature gap summary

- Canonical PRDs: eight missing; Time Tracker exists but records only a bounded TT08 slice and remains pending independent verification/full-chain acceptance.
- Requirement provenance: discovery/brief sources exist for AI Chat, Countdown, Habits, Matrix, Meditation, Pet and Statistics. Metric Tracker has one broad dated Work Log source but lacks precise user acceptance. Time Tracker lacks a qualifying original feature-origin source in the inspected material; both are marked 待确认 where needed.
- Design/API/test mapping: the relevant package docs exist for all nine. The matrices identify their owning source modules and historical test-plan mappings. This static audit does not certify implementation conformance, test execution or browser/native behavior.
- Ship/deploy: historical per-feature SHIPPED entries exist for the seven initial modules and several documented increments; Metric Tracker remains READY_FOR_VERIFY and Time Tracker's old status is READY_TO_SHIP. The release log has no feature-specific entry for any of the nine, and this audit found no per-feature deployment receipt. Do not infer current deployment from a historical status.
- Acceptance gaps needing explicit evidence: Countdown V2/V2.1; Metric Tracker REL-01/REL-05 and initial independent acceptance; Time Tracker original feature requirement and full-chain acceptance; manual cross-vendor items deferred in historical records.
- No design-drift verdict is asserted from this documentary pass. No source requirement was inferred from code.

## Backfill plan

Order is a documentary sequencing proposal based on scope and data impact; it does not change product priority or authorize canonical writes.

| Order | Feature | Canonical path | Backfill boundary and hold |
|---|---|---|---|
| 1 | AI Chat | docs/product/ai-chat/prd.md | Create from the sourced demo, provider, tool-confirmation and protocol increments; keep external provider readiness separate. |
| 2 | Time Tracker | docs/product/time-tracker/prd.md | Extend the existing bounded candidate only after original requirement provenance and independent TT08/full-chain gates are resolved; keep mode-conversion policy pending. |
| 3 | Metric Tracker | docs/product/metric-tracker/prd.md | Create only from the weight-tracking source; precise user acceptance and independent verification remain pending. |
| 4 | Statistics | docs/product/statistics/prd.md | Create from initial aggregation and the accepted task-count correction; preserve honest range/source semantics. |
| 5 | Habits | docs/product/habits/prd.md | Create from sourced add/check-in, streak/calendar/stat and monthly diary contracts. |
| 6 | Countdown | docs/product/countdown/prd.md | Create from original CRUD/date behavior and separately dated V2/V2.1 entries; reconcile later acceptance before labeling them shipped. |
| 7 | Matrix | docs/product/matrix/prd.md | Create quadrant/move/create scope; keep task linkage and edit/delete deferred. |
| 8 | Meditation | docs/product/meditation/prd.md | Create picker, persisted preferences and fullscreen timer scope; no session auto-resume. |
| 9 | Pet | docs/product/pet/prd.md | Create eight-pet, picker, positioning, tips and visibility-toggle scope; retain manual-smoke hold. |

Pending owner/source decisions are limited to recovering Metric Tracker's precise accepted criteria, recovering Time Tracker's original user requirement source, and confirming Countdown V2/V2.1 acceptance evidence. No question was sent to the user and no behavior was chosen to fill these gaps.

## Audit boundaries and outcome

One documentary static pass is planned after materializing this report and its hash receipt. No tests, runtime, build, lint, browser/native, server, qualification or provider probes were run. No code, canonical PRD, global control, ledger, release log or product status was changed. All original formal counts and held source-validation purposes remain untouched.

## Handoff

- Features audited: all nine GOV-05 user-visible features.
- Mode: audit.
- Gap summary: eight canonical PRDs missing; Time Tracker PRD present but partial and pending; nine feature-specific release-log/deployment links absent; precise requirement provenance remains pending for Metric Tracker and Time Tracker.
- Files written: this audit report and inputs.sha256 only.
- Next step: independent full-scope review; then obtain a separate bounded grant before any canonical PRD create/append. Keep original AI05 source-validation units held.
