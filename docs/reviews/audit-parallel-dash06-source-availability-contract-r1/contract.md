# DASH-06 finite source-availability contract r1

**Technical contract proposal — PROPOSED / UNQUALIFIED; NEEDS FRESH FULL INDEPENDENT REVIEW1.** Select impact alternative **A16**, the additive public read-only observer, with a deliberately restricted opt-in key domain. This author neither adopts this contract nor grants API/product writes. Complete conditional S remains the root-adopted documentary display basis; all sixteen original D06 obligations and the full canonical G1 remain mandatory.

## Documentary closure authority and failed-checker record

Additional authority is **b9ed5f63256620b1135ba9e782f08992923bd3c4**, `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-dash06-source-availability-contract-r1-doc-closure.json`, SHA-256 **a7e57e64c56b64298c0908e721391ffe3e01f2fa2688d86da27a48115a98ceef**. Its fixed documentary input is **711cfd8d7a587468d4ff133eb6d5911ad4dd79ef**. This author still uses original parent53a961a and fixed inputccf2ee5: no silent repin, new author iteration or running-unit reset.

Original static allowance **1**; actual static invocations **2**, **both FAILED**, permanent overrun **1**. Invocation1 refused the inventory comparison at GOV-01; invocation2 refused it at QA-01. Both stopped before output writes. An earlier non-UTF-8 command-transport refusal preceded execution. Root's stop instruction arrived after the second invocation; further semantic/static acceptance runs stopped. This continuation grants only deterministic preservation of the existing draft plus input/output/parent/scope/hash identity closure. It does not retroactively authorize the overrun or convert either failure to PASS.

The full649 and8472 inherited digest comparisons completed before those failing assertions, but the full original-row comparison,39-normalization assertion, readiness-appendix comparison, execution evidence-prefix/count assertions, DASH status assertion, D06-ID/allowlist/census completeness assertions and remaining semantic acceptance checks did not complete and are **UNRUN**, not PASS. A targeted metadata read found30 literal `web（project-system）` and9 literal `web（跨模块验证索引）` labels projected to web with original_module retained; this is source metadata, not successful whole-inventory verification.

The technical proposal below is preserved as drafted; its proposed requirements and inherited source claims are not author acceptance evidence. Fresh full independent review1 must evaluate the entire contract, all original obligations, preserved histories and every failed/unrun preservation check before any root adoption. No new semantic/static acceptance assertion was executed during this closure.

## 1. Fixed authority and current scope

- Module **web**, workflow **C**, sole controller root A-Codex. Fresh contract author `/root/parallel_c_dash06_availability_contract_r1`; requested `gpt-6-astra` is task metadata, not independent provider attestation.
- Direct clean dispatch parent **53a961aaa4ae87e1453f27d91af3c8edd6ddaeeb**; registered fixed input **ccf2ee5b4980393e5b506eb6ebaeede9604fbd48**. Card: `docs/reviews/20260908-full-product-audit/parallel-control-r1/task-dash06-source-availability-contract-r1.json`.
- Product P0 **f9eb4b1f207bc4b46f547b90afc250424b3c8695**, original audit **e041c2bc293b70db367444c62c4300231976dbf7**.
- Accepted technical basis: impact **309483d66397a1e4bc83760de032321bd1f01432**, independent review **ab1ea42c09a055a599902d4d2b42d7c42d77e252**; full **649**-identity review corpus preserved and rehashed. Its APPROVED verdict grants contract preparation only.
- Complete conditional S: **dbc818c01045637104fa3ed2f833a77b758ff55d**, independent review **a441a0b0022deb856edac3ef2751fb9ebce7be0d**; full **8,472**-identity review corpus preserved and rehashed. Root's pinned checkpoint adopted it as documentation only; historical “unadopted” headings in its source do not undo that receipt.
- Only current writes: ADD this `contract.md` and adjacent `inputs.sha256`. Own worktree only: `/Users/lijinlong/.codex/worktrees/audit-parallel-dash06-availability-contract-20261010/XAI_Desktop`. No other worktree access, children, runtime, tests, probes or global writes.
- Original goal attachment SHA-256 **40f9dcad8a5930725ce16685bac45b7bebfd0e4b2a5e30ba912c69441f20b615**, AGENTS/CLAUDE, workflow/multi-machine rules, authority overlay, goal-C and adopted r2 recurring controller resource apply. Root alone preserves source remotely, receives/integrates, adopts, registers budgets, changes controls, appends ledgers and refreshes inventory. Worker does not acquire its resource or push/fetch/sync-check.

DASH-06 remains P2 / 决策 / pending, evidence `[]`; action **Stat Pomos的8点展示与真实目标接线或标为刻度**; acceptance **超目标/未设目标可理解，统计使用当地日**. Existing accepted count/local-day/read-only rules and original explicit scale remedy support S. No new S/G owner question, default daily goal, owner command, storage key or schema is created. G remains inactive future work. This is a technical design under existing honesty requirements.

All312 original ordered rows/fields remain, including39 reversible original module-label→web projections with original_module (30 project-system labels and9 cross-module validation-index labels), all299 unclosed and118 gated items. Original933 ordered evidence prefixes remain; six TT-08 documentary additions make939. States **13 completed /3 verification_pending /3 in_progress /293 pending**, attribution A29/B117/C126/D40, remain unchanged. Original TODO/EXECUTION, full scope map and readiness appendix are retained as inputs; their failed/unrun preservation checks are explicitly listed above. No inventory or ledger is edited.

## 2. Source-grounded choice and API domain

P0 `storage.ts:getPref/readRawPref` collapses denial/invalidity into defaults/null; `usePref` combines separate physical reads and may adopt event payloads. `usePrefAsync` already exposes source/raw, but its error/conflict branch retains old source and retry may write. `sameTabBus.subscribeSameTab` can silently bind no listener while physicalKey is denied. Owner snapshot.available means Web Locks availability, and lastCommitted is not full history. These are explicit reasons for A, not a claim that source classification is new infrastructure.

Proposed new internal file `plugin-web-storage/src/internal/usePrefRead.ts` owns its pure read helper and scoped subscription lifecycle; the existing package index adds exports only. It reuses unchanged registry/JSON codec/accountScope/marker helpers/same-tab bus. It imports no owner UI/controller, migration-registration side effect, mutation engine, writer controller or CSS. Legacy readers and their public signatures/defaults/meta remain byte-identical.

Freeze a **sessions-only registered domain** for this finite version:

```ts
type PrefReadKey = "xai_pomodoro_sessions";
type PrefReadSnapshot<T> =
  | Readonly<{ source: "valid"; value: T; raw: string }>
  | Readonly<{ source: "absent"; value: null; raw: null }>
  | Readonly<{ source: "invalid"; value: null; raw: string }>
  | Readonly<{ source: "unavailable"; value: null; raw: null }>;
type PrefReadResult<T> = PrefReadSnapshot<T> & Readonly<{
  key: PrefReadKey;
  scope: AccountScope;
  refresh: () => void;
}>;
function usePrefRead<T extends WebPrefValue<PrefReadKey>>(
  key: PrefReadKey,
  validate: (candidate: unknown) => candidate is T
): PrefReadResult<T>;
```

This is a proposed declaration, not executable implementation. The mandatory stable pure validator certifies the complete decoded array; parse success alone is insufficient. No defaultOverride, codec override, open string/autosave key, arbitrary physical key, writer/reset/retry/owner command or asynchronous return is exposed. `refresh` performs one bounded read observation/rebind transaction for its captured live binding; it is not usePrefAsync.retry/reload and cannot write. A stale/unmounted closure performs no read, publication or mutation and cannot refresh B using an A closure.

Type-level rejection of other keys plus a runtime unsupported-key guard before any storage access is required (for JavaScript/casts). Unsupported keys throw a descriptive programmer-contract error without reading/writing; they never appear as absent. Missing/nonfunction validator is likewise a programmer-contract error. A thrown validly supplied validator yields invalid with original raw, rather than empty or a propagated storage callback error.

Registry key metadata remains JSON/default[]/schemaVersion1/owner xai-web-pomodoro, including its historical proposed flag; metadata does not establish schema validation. Value is derived only from the same observed history raw string. Absent has no fabricated T; StatPomos explicitly maps proven absence to0. Invalid/unavailable expose no fallback array or old value. Raw is local in-memory provenance only: no telemetry, logging, new export/download, diagnostic business event, account-history upload or persistence is added.

**Canonical task/calendar compatibility is by exclusion.** `xai_task_cols` and `xai_calendar_events`, device prefs and xai_pref_* are outside this public version. Existing `decodeStoredPrefValue` and canonical command envelope behavior remain unchanged; do not raw-decode their envelopes through the new observer. Type/runtime negative controls must reject both canonical keys. Supporting another key later requires its own finite domain/decode/validator review; this contract does not imply all-WebPrefKey support.

## 3. One history read, coherent publication and ownership proof

One observation is one bounded synchronous transaction for a captured immutable AccountScope object (kind/id/generation/epoch) and binding generation. There is **at most one physical getItem of the history key** per transaction; metadata reads and subscription physical-key resolution are separately counted, never mislabeled as extra history reads or hidden probes.

1. Capture the current scope object; reject SSR/no window, missing/throwing localStorage getter, locked/missing identity or generation. Catch all access failures. SSR returns unavailable/null/null with no subscription or storage access.
2. With current scope asserted, resolve unchanged `accountScope.physicalKey`: its deletion tombstone lookup must succeed and find no tombstone. Read `generationMarkerKey` through that same storage object; require unchanged `hasCommittedGenerationMarker(raw, captured.generation)`. Absent, malformed, mismatched or denied marker means unavailable. isReady alone is not marker proof. Do not invoke migration or activate/lock accountScope from this reader.
3. Read the resolved history key exactly once. Successful null is the candidate absent state. Otherwise decode using the unchanged registered JSON codec and require Array.isArray plus the supplied whole-array guard. JSON null/malformed/wrong root or guard false/throw is candidate invalid with the exact raw bytes, not a filtered subset.
4. Before publication, reassert captured scope identity and binding liveness; resolve physicalKey again to check tombstone/current identity, and reread the committed marker. Require the same physical key and unchanged valid marker bytes/generation. Any failure or detected transition discards candidate value/raw and publishes unavailable/null/null for the live binding, or nothing for a disposed binding. Do not reread history to manufacture a matching pair.
5. Publish source/value/raw together. Never call getPref or readRawPref as a fallback or as a second source check. No partial update can expose a valid value with raw/source from another transaction. Invalid raw is retained only while its binding is current; epoch/unmount revocation clears it from the exposed view.

A successful observation proves those bytes under that captured identity at that observation, not a multi-key linearizable transaction or continuous availability. localStorage provides no atomic marker-plus-history transaction; concurrent other-document changes after the bracket are handled on invalidation. No write-lock acquisition, polling, timestamp freshness SLA or claim of undetectable-event detection is introduced. The qualified instrument must record all metadata/history read attempts and inject changes at each bracket seam. Old complete-count publication must be revoked on processed invalidation/scope change before any next render can reuse it.

The real host matters: `AccountDataGate` locks synchronously on marker/clear events and keys its business subtree by kind/id/generation/epoch; `AccountStorageGate.invalidateAccountIdentity` locks before identity publication. The reader does not replace that policy. A bare hook additionally uses synchronous accountScope subscription and checks captured scope against the current object at render/publication. On A→locked→B→A, including identical accountId with a new generation/epoch, first frame is the new binding's coherent result or unavailable; it can never expose the previous binding's value/raw. Passive-effect cleanup alone is insufficient. Late notifications/queued React work/refresh closures and StrictMode remount cleanup must be fenced by binding generation and disposed flag.

## 4. Finite invalidation, rebind and repair progress

Install accountScope subscription plus window storage/focus/pageshow and document visibilitychange listeners independently of whether storage is presently readable. No handler setup may require a successful physicalKey first. These listeners are removed on unmount. The same-tab bus subscription is separate, captured-scope-bound and replaceable; always dispose the previous one before one rebind attempt. Because its existing API hides binding failure, do not infer subscription success merely from a returned unsubscribe.

For initial mount, after listener installation perform one catch-up observation/rebind to close the render→subscription gap. Each subsequent declared trigger permits at most one transaction and one same-tab rebind attempt; rebind adds no history read and emits no event. Duplicate independently delivered events may each produce one transaction; qualification records them. No loop on source=error/unavailable, render, timer, count tick, queueMicrotask, promise completion or internal state update. Rebind cannot recursively schedule itself. The source contract permits finite coalescing only if it preserves final authoritative reread and per-trigger attribution; a silent dropped repair is failure.

| Trigger | Filter, action and result |
| --- | --- |
| Same-tab bus set/remove | Existing bus scoped subscription; ignore published value, invalidate then read current durable bytes. Even default[] notification is not proof of removal. Actual setPref/removePref producers and refusal paths are exercised. |
| Owner changed(scope) | Actual owner's scoped synthetic StorageEvent with storageArea localStorage; process as notification only. It is not required to be trusted; only user product actions require trusted input. No new emitWebEvent listener or owner command. |
| Real second-document update/removal | Matching current physical history key and local storage area invalidates; fresh successful null may yield absent. Stale event.newValue/oldValue cannot overwrite a newer store. |
| clear / marker / deletion tombstone | clear or exact current namespace metadata invalidates immediately and rechecks proof. Clear normally removes marker and is unavailable, not empty. Only externally restored valid current marker plus successful null history permits absent. Reader never repairs metadata. Host may lock/remount concurrently; stale result is suppressed. |
| Foreign key/account/generation/demo/sessionStorage | Ignore without adopting data or changing account state. Construct expected identities from captured scope using unchanged pure helpers; never read foreign history. Catch storageArea comparison getter denial and fail this live view unavailable without throwing; a later declared recovery trigger must retry proof. |
| Storage denial during matching event / null removal payload | Unavailable and old count revoked, even when event claims a valid update/removal. Preserve disk untouched; do not count a successful notification as a successful read. |
| AccountScope notification | Synchronously revoke old binding; fresh capture/new binding or locked unavailable. Rebind exactly once after new listeners mount, with catch-up. No stale callback activation. |
| Explicit public refresh / window focus / pageshow / visibility becomes visible | One read-only rebind and fresh observation for current live binding. These recover denied-at-mount inert bus subscriptions and invalid→valid repair. Successful valid/absent replaces error immediately on publication; continued denial remains unavailable with no self-reschedule. |
| Ordinary rerender/day tick/language/theme/hidden visibility | No new physical history read just for rerender/tick. Count may recompute on the stored qualified value using actual current local Date. Scope identity must still be synchronously checked; hidden visibility does not trigger refresh. |
| Unmount, real drag ghost and remount | Each real/ghost instance is an independent read observer with its own cleanup/fence. No global clearAllListeners. Remount observes current source and rebinds; old refresh/late handler is inert. |

No new focusable widget recovery control is added. Natural remount/real reload/focus/pageshow/visibility and actual source events drive recovery; tests may exercise the public refresh surface directly. If access is repaired without any event, remount or declared refresh, there is no promised autonomous update. This explicit limit avoids hidden polling and an invented SLA. The mounted widget's parent one-second date tick is not an availability polling channel. Failed initial bus binding can recover through the always-installed window/lifecycle listeners or explicit refresh; the next actual same-tab write after rebind must be observed. If these bounds cannot meet a required real-host case, preserve the failure and return for finite technical review, not a writer retry/host edit.

## 5. Whole-owner-array validation and visible truth

Keep existing `isPomodoroSession`, `PomodoroSessionMinimal`, `countTodaysFocus` and `localDateKey` behavior unchanged. Add separately named full row/array guard(s) in the already proposed `isPomodoroSession.ts`; types are local structural types assignable to the registry value. No production deep import from owner validate.ts and no Pomodoro index import for lazy validator registration.

The new array guard is exactly Array.isArray and every row passes the existing owner validation semantics:

| Owner field | Required parity |
| --- | --- |
| row / id / mode | Non-null object; nonempty string id (no trim/UUID policy); focus, short-break or long-break. |
| startedAt / finishedAt | Strings with finite Date.parse result. Preserve current runtime parser semantics, including parseable non-ISO forms; no ISO-only or ordering restriction. |
| durationMs | Finite number greater than0. |
| elapsedMs | Finite number at least0 and no greater than durationMs; completed=true does not create a new equality requirement. |
| completed | Boolean. |
| recordedAt / deadline | Undefined/missing permitted; otherwise string with finite Date.parse. Null or invalid value is invalid. |
| extra fields / version | Extra properties tolerated, including unknown version fields. No v1/v2 version discriminator/rejection, new schema or migration; optional v2 fields retain current semantics. |

Invalid break or old-day row invalidates the **whole source**, even when it would contribute0. No partial-total display, duplicate removal, ID normalization, duration/25 conversion, future-date cutoff, row rewriting, sort or owner-schema change. Existing duplicates count as existing selector dictates; settlement uniqueness is an owner proof, not Dashboard deduplication. Invalid raw remains byte-identical in storage.

For parity qualification, independently load the frozen owner guard in the isolated test/oracle fixture (not a product import) and compare both guards on: genuine owner v1/v2 output; missing/empty/whitespace id; all modes; malformed and parseable non-ISO dates; NaN/Infinity/nonpositive duration; negative/oversize elapsed; wrong boolean; optional undefined/null/invalid/valid timestamps; tolerated extras/version; duplicate IDs; valid breaks/partial/other-day/future-today; malformed mixed arrays and invalid excluded rows. Golden outcomes are reviewed against owner source first, not auto-generated by the candidate. Owner-valid integration fixtures include all required fields. Frozen original P0 minimal-three-field tests stay in the immutable before corpus; unchanged low-level selector tests remain. Revised component fixtures and explicit invalid-source characterizations need independent oracle review; don't quietly turn P0's misleading0 characterization into acceptance.

| Source | StatPomos visual/AX truth |
| --- | --- |
| absent with all current proof | Number0; existing empty dots plus S's visible localized eight-dot scale/not-goal explanation. Never seed[]. |
| valid[] | Number0, same scale explanation, source remains distinct from absent. |
| valid full array | Unchanged selector on completed focus + browser-local finishedAt day; true N including above8, bounded eight dots and truthful localized AX under S. |
| invalid | Number replaced by neutral em dash; visible EN “Saved focus history could not be read; today's count is unknown.” / ZH “已保存的专注记录无法读取，今天的数量未知。” No counted subset or0 claim. |
| unavailable / SSR / revoked | Number replaced by neutral em dash; EN “Focus history is unavailable; today's count is unknown.” / ZH “专注记录暂不可用，今天的数量未知。” No old account count or successful-empty claim. |

For invalid/unavailable, decorative dots may remain unfilled only if aria-hidden and paired with the visible unknown statement; no independent “0 of8”, progress/achievement or empty-history description. S's visible scale/not-a-daily-goal explanation still applies. Do not hide the explanatory text, add goal/retry/repair controls or change CSS to fit. Copy may be equivalently localized and reviewed for fit without removing unknown/scale truth; a fit failure becomes a separately bounded visual issue. No live-region churn each parent tick; no new interactive stop.

## 6. Exact conditional file map and single-writer locks

**Proposed protected exceptions only; none is writable in this author task.** A16 is exactly:

| # | Exact path | Finite delta |
| --- | --- | --- |
| 1 | `packages/plugin-web-storage/src/internal/usePrefRead.ts` (ADD) | Restricted read-only API implementation and private observer helper. |
| 2 | `packages/plugin-web-storage/src/index.ts` | Additive hook/result/key exports only. |
| 3 | `packages/plugin-web-storage/src/__tests__/usePrefRead.test.tsx` (ADD) | Public API domain, coherent source, scope/rebind/SSR and zero-attempt controls. |
| 4 | `packages/xai-web-persistence-contract/docs/design.md` | Read-only technical decision and compatibility. |
| 5 | `packages/xai-web-persistence-contract/docs/api.md` | Exact public result, restricted key domain and refresh lifetime. |
| 6 | `packages/xai-web-persistence-contract/docs/test.md` | Whole matrix, evidence and inherited history. |
| 7 | `packages/xai-web-persistence-contract/docs/dev_log.md` | Pending implementation/independent gates only. |
| 8 | `packages/xai-web-dashboard-widgets/src/widgets/StatPomos.tsx` | Opt in with stable full-array guard; count only proven source; unknown view. |
| 9 | `packages/xai-web-dashboard-widgets/src/internal/dataReads/isPomodoroSession.ts` | Add full guard; retain existing minimal behavior. |
| 10 | `packages/xai-web-dashboard-widgets/src/__tests__/StatPomos.test.tsx` | Truth state transitions and owner-valid component fixtures. |
| 11 | `packages/xai-web-dashboard-widgets/src/internal/dataReads/__tests__/pomoStats.test.ts` | Whole-source guard parity versus unchanged selector controls. |
| 12 | `packages/xai-web-dashboard-widgets/src/internal/strings.ts` | Add only localized source-state/approved S copy. |
| 13 | `packages/xai-web-dashboard-widgets/docs/design.md` | Honest source boundary plus S. |
| 14 | `packages/xai-web-dashboard-widgets/docs/api.md` | Complete/unknown count semantics. |
| 15 | `packages/xai-web-dashboard-widgets/docs/test.md` | All16 D06/G1 traceability. |
| 16 | `packages/xai-web-dashboard-widgets/docs/dev_log.md` | Bounded work, failures and pending review. |

The full S set is exactly9: A's StatPomos/strings/component test/four widget docs, plus `packages/xai-web-dashboard-widgets/src/internal/PomoDots.tsx` and `packages/xai-web-dashboard-widgets/src/__tests__/PomoDots.test.tsx`. Thus **A∪S =18**, with one author owning every shared source/test/doc path for the combined candidate. No B/C cumulative allowance: B11's adapter is not selected; owner-public C still lacks a separately reviewed dependency/export-map/route-order allowance; global D is excluded.

Storage documentation belongs to **xai-web-persistence-contract/docs**, not a new plugin-web-storage/docs tree. All other paths remain protected: legacy storage.ts/usePref/usePrefAsync/autosave/mutation/codec/registry/bus/accountScope/ownership/lifecycle, canonical tasks/calendar/schema, owner controller/settlement/types/validate/keys/bytes, App/host/account gates/auth/routes/registration, pomoStats count/date formula, CSS/tokens/layout/inline or injected style escape hatches, other widgets/callers, config/manifests/lockfile, original evidence/runners/failures/hash receipts, root controls/three ledgers/inventory and other worktrees. Future runner/fixture/log/image/report outputs require exact separately registered paths, not this allowlist or a directory wildcard.

Lock storage API/source/docs exclusively for its writer and read-lock exact codec/scope/marker/bus/owner/host inputs. Widget source/strings/docs overlap S and potential Clock/WorldClocks work: isolation in different worktrees is not permission for concurrent semantic writers. A later integrated candidate pins the exact combined SHA and affected source closure; any changed read dependency invalidates corresponding reuse. Runtime tasks separately reserve exclusive worktree/server/port/origin/profile/output/device/timezone/instrument resources with finite cleanup; no shared browser or main-checkout server. Root receipt/adoption/inventory remains under its recurring exclusive controller resource, never delegated to a worker.

## 7. Complete supplemental case and producer matrix

The full original D06-01…16 table in Appendix A is binding in addition to this matrix. For **every** case record requested/resolved SHA, instrument/fixture/owner hashes, captured scope/epoch/physical key, raw-before/after with local synthetic-data-only retention, source/value/DOM/AX at each render, actual event order, reads, runtime errors, PRECONDITION, outcome/exit and immutable artifact hashes. Every case asserts **zero observer/StatPomos-attributed setItem/removeItem/clear attempts on every key, zero new network or owner/business attempts**, including rejected attempts. Fixture setup, actual owner and grid writes have separate action boundaries/counters, not blanket exclusions. Instrument setup is never product PASS.

Producers: **U** = fresh Sol public API/component/parity evidence executor; **H** = independent real archived App integration executor; **N** = independent native executor with qualified method; **R** = independent package/affected/final verifier; **Q** = independently reviewed instrument qualification executor; **V** = actual cross-vendor verifier; **A** = fresh Astra full-original acceptance. These are future finite registrations, not launched roles or run budgets.

| Case | Positive and negative truth / exact evidence purpose | Producer and stage |
| --- | --- | --- |
| AV01 domain/codec/SSR | Supported registered sessions + mandatory guard; reject tasks/calendar/device/autosave/unknown keys before access. SSR unavailable, no subscription/storage. Valid parse is not domain validation; no canonical envelope consumed. | U/Q qualification; R public type/barrel/bundle/SSR before/fixed compatibility. |
| AV02 absent vs stored empty | Valid current marker/no tombstone + history null => absent0; raw[] => valid0. Missing/invalid marker, throwing getter/metadata/history read or locked scope => unavailable/unknown, never0. | U/H; P0 before actual limitation, fixed candidate and integrated. |
| AV03 malformed whole source | Malformed JSON/null/object/scalar/all-invalid/mixed-invalid rows, including owner-invalid old-day/break/optional fields => invalid/unknown with exact raw; no subset claim or mount repair. | U/H and N representative genuine-source display; before/fixed. |
| AV04 parity/count positives | Complete owner v1/v2 records, accepted extras/parser semantics and all §5 boundaries; full counts0/1/7/8/9/10 and valid partial/break/other-day exclusions. Frozen minimal tests and new integration oracles distinguished. | U/Q and R; candidate guard unavailable at P0 is not PRECONDITION business FAIL. |
| AV05 one-read and seam fences | Recorder alternates return data/throws on a second history read: candidate must use exactly first read once. Change scope/tombstone/marker at pre/read/validation/post/publication seams; no mixed raw/source/value or stale published count. Marker postcheck failure discards even successfully read raw. | U/Q qualification positive/negative; source-aware new API fixed proof; P0 existing split-read limitation separately observed. |
| AV06 same-tab bus | Actual scoped setPref/removePref notifications after fixture/setup boundary; stale payload and default[] payload with durable valid/denied current data. Fresh reread wins, refused producer doesn't fabricate a commit. | U/H before/fixed and integrated. |
| AV07 owner settlement | Actual SessionHost/controller trusted Start with qualified clock seam; dashboard-first/pomodoro-first/re-entry. C1 pending write denial and C2 history denial add0 committed records; C3 cleanup denial after commit displays1 if source readable. After owner Retry/reconcile/reload/two tabs retain one stable id and first finishedAt/recordedAt/local-day assignment. Notification failure after history commit does not erase durable record; next declared refresh reads it. | H/N; original owner purposes and attempts inherited, before/fixed, owner command proof separate from observer proof. |
| AV08 true second document | Actual second document commits update/remove/clear; marker persists on remove => absent0; full clear => unavailable until external lifecycle restore. Delayed old payload after new store cannot roll count back. Denied reread after null event => unknown. | H/N before/fixed; synthetic dispatch alone insufficient cross-document proof. |
| AV09 foreign/filter denial | Foreign account/generation/demo/unrelated key/sessionStorage events never publish data; localStorage getter denial inside filtering catches and revokes rather than throwing. No foreign history read. | U/H before/fixed. |
| AV10 repair/rebind | Denied at mount => failed bus bind but live window/lifecycle listeners; restore access plus focus/pageshow/visible/public refresh or actual scoped storage event => one finite rebind/read, then subsequent bus update works. Invalid→valid and valid→denied→valid handled; repeated denial never loops/writes. | U/H; native natural focus/pageshow/visibility/reload in N; before/fixed. |
| AV11 first frame/account | Actual App/AccountStorageGate/AccountDataGate A→locked→B→A, same id new generation, demo isolation, deletion tombstone/marker replacement/clear. Every render and queued closure fenced. Late A queued owner settlement/stale retry/export cannot affect B; direct reader has no owner APIs. | U hook scope; H/N real host first-frame and owner queue before/fixed. |
| AV12 lifecycle/ghost | Mount/catch-up/rerender/language/theme/day tick/remove-add/reload/unmount/StrictMode/real drag ghost. Old callbacks inert; no listener leak; live ghost sees current scoped truth. No clock tick polling; source repair only declared trigger. Real grid/neighbors remain functional. | U/H/N; before/fixed/combined. |
| AV13 calendar time | Original predetermined midnight/DST/timezone oracles and real Dashboard one-second parent render/background/pageshow behavior. Count uses finishedAt browser-local day and full N. Storage refresh isn't a new day policy; REL six other consumers not StatPomos proof. | U/H/N, retains D06-04/05 and inherited instruments. |
| AV14 display/accessibility | Full S0/1/7/8/9/10 plus invalid/unavailable visible unknown states in both languages; no hidden empty/achievement/8-of8 AX or new tab stop. Full original visual/focus viewports/themes/zoom/neighbor/pet requirements remain, with unknown state fit additionally checked. | N with qualified pixel method; exact captures/output set registered before launch. |
| AV15 compatibility | Actual storage legacy/public types/bundle/SSR; widgets/grid/Web/owner/Statistics/CmdK/AI/account and accepted caller/G1 source and execution comparisons, unchanged-test P0 controls and exact integrated SHA. No replacement of full suites by this matrix. | R with per-unit inheritance and lawful reuse. |
| AV16 instrument trust | Reject wrong SHA/@repo/lock/origin, missing/replaced outputs, unavailable-as-empty, partial-as-total, mismatched raw/value, stale scope first frame, double read, uncounted attempted write, fake second document/owner commit, wrong date, fake trusted input and absent required case. Each rejection paired with a true positive control. | Q source qualification before judging; V raw independent result; A full-original final verdict after every gate. |

Native/full-host D06-12/13 uses all20 default language/theme/viewport configurations and40 N0/N10 captures plus8 compact200% configurations, actual effective CSS viewport/DPR, real font/token bytes, clipping/overflow/neighbor/pet-hidden center hits and separate pet-on R-PET. Unknown-source states add evidence without reducing these original cases. Keyboard retains full-host pointer/Tab/Shift+Tab/Enter/Space once, per-stop qualified pixel evidence and localized AX, not screenshot geometry alone or an AX-only certification.

## 8. Consumer and source compatibility

The impact's full **82-file candidate census** is retained verbatim in Appendix D and every P0 blob remains bound. It includes comments/definitions/wrappers and is **not82 active call sites**. A migrates only StatPomos (including real drag ghost), not that global reader surface. Record actual call/import dispositions for affected additions; a future global API migration would need the whole semantic census anew.

| Actual consumer/dependency | Required preserved behavior |
| --- | --- |
| PomodoroModule/historyFor/controller | Module's existing display filtering and controller's strict whole-history refusal stay; C1/C2/C3 exactly-once settlement, timers and owner error/retry/export retain original tests/history. |
| StatisticsModule/narrow projection | Measured duration/partial-session semantics are distinct from completed-focus count; no count policy propagated into Statistics. |
| CmdK readModuleStates/pomodoro adapter | Legacy getPref and existing stale completedAt projection untouched; it is no count oracle. Preserve affected tests/bytes and register a separate defect if evidenced. |
| AI contextProvider | Existing getPref projection and outbound payload boundary unchanged; no raw/source/account metadata added to AI or network. |
| Account migration/deletion/export/settings reset | Same registry/ownership/key identities, marker/tombstone/schema/export retention and no-reset-of-entities rules; lazy Pomodoro validation registration is not used as this hook's guard. |
| Storage public package | Additive exports, unchanged legacy return/default/meta semantics; source/barrel/types/ESM resolution, actual app bundle and SSR compatibility independently proved without package/config edits. |
| Grid/App/tick/neighbor/Clock/WorldClocks | Actual route, remount, ghost, date tick, account gating and existing strings/docs consumers; no host/route/CSS changes. Combined source and all original G1/accepted-caller tests remain. |

Full storage original imperative/usePref/accountHooks/async/autosave/SSR/canonical tests are unchanged controls; actual new API tests cannot replace them. Widgets/grid full tests/types/lint and unchanged-test P0 controls; Web test/types/lint; owner validation/counter/durable settlement/account recovery; Statistics/CmdK/AI relevant projections; all accepted callers and full canonical G1 are mandatory or explicitly justified unchanged evidence reuse. An absent new export in P0 is expected, not a business failure: P0 business before must execute actual old StatPomos/host via an instrument that can observe both revisions. New API conformance/parity tests run only where it exists, while frozen existing tests run at both; no fabricated P0 shim or replacement implementation.

## 9. Permanent actual-purpose history and finite admission

The genuinely new semantic purpose is **Dashboard complete-count truth conditional on a current scoped source result, refusing denied/malformed/partial history while preserving bytes**. P0 StatPomos/pomoStats tests and defensive-empty docs lack this assertion; A16 impact/review established that comparison. New S localized scale/above-eight AX is separately source-grounded. Existing async source-state classification, count/day, account/lifecycle, owner, package, host, native and vendor machinery are old purposes. This contract does not call them new merely because this hook, actor or filename is new.

Appendix C retains the complete S permanent-history table without resetting it. Additionally retain impact author1/3 and impact review1/3; this availability contract author1/3/static1 is a distinct registered documentary unit. Availability contract fresh review1 is not yet launched. Conditional S author1 REVISE/author2 and review1 REVISE/review2 APPROVED remain consumed. Every later source author/reviewer/qualification/before/fixed/mixed package/native/vendor/final unit needs a permanent purpose register containing original actor, source/test assertions, commands/mode/arguments, all actual launches/refusals/calibrations/probes, known count or unknown, remaining cap≤3, exact input/output identities and dependencies.

No “DASH-06 overall0/3”, inferred zero from evidence[], aggregate assertion-to-iteration conversion, fresh-worktree reset, label/version/transport reset or split-suite reset. Unknown old actual counts remain unknown and block that corresponding invocation; exhausted units have no next launch. Development probes are separately disclosed and bounded, never renamed fourth formal attempts. New source purpose can proceed statically while an old mixed runtime unit remains held.

Actual retained histories include widgets185/185→215/215 plus quality failure/repair/reverify; owner stale-revision/competing-Start failures and140/143/8 reproduction/3 native summaries (not remaining counts); REL six-consumer/four-zone evidence with StatPomos absent; B70 fields/source2 each/departure1/responsive3/3/focus EN2 and ZH2 with third source unlaunched; native12 formal6432 plus40 development4884; F1 selfcheck1+clock1=2/180 plus3 development302; Q1 focus-controls1/3 and six explicitly registered others0/3 plus2 development83; retention i1/i2/i3=3/3,145 assertions,41/42 cases, REVISE/UNQUALIFIED with no valid remaining path absent separate authorization; TT actual vendor3 is not DASH-06 vendor PASS. Full frozen sources/refusals/raw logs are inputs. Their corresponding units remain held until root reconciles actual purpose and lawful remaining cap, not globally blocked preparation.

## 10. Required chain, local holds and stopping conditions

1. Root validates exact two ADD files/fixed parent/full closure/clean/cost, remotely preserves original commit and records source→integration identity under its exclusive resource. This receipt is not adoption.
2. A **fresh complete independent contract reviewer** challenges this entire A16 design plus full S/all16/G1/history and exact files. No author self-adoption, partial D06-08-only review or reviewer repair. REVISE routes to fresh author2 within original cap, retaining source1 and failures.
3. Root separately adopts approved technical contract and registers exact A16 or combined18 protected exceptions, one writer, inputs/semantic locks and per-unit budgets. No owner/default question is introduced. An actual conflicting product mandate is preserved as a precise evidence-backed question only if discovered.
4. Fresh instrument/source author receives exact runner/fixture/log/image/receipt paths and producer mapping; independent source review; complete paired positive/negative qualification; fresh independent qualification review and root method adoption. Hash equality or a green selfcheck does not qualify an oracle.
5. Complete valid **P0 before** through actual product/host and qualified instruments, with positive controls, correct expected business failures and no precondition substitution. All original16 rows remain accounted for. No implementation before required lawful before evidence; unavailable new API is classified correctly as in §8.
6. Fresh independent implementation author, exact candidate allowance and bounded tests; separate source review and frozen fixed evidence; then independently pinned affected combined-source evidence. A new product/oracle defect freezes actual reproduction and routes to a separate owner repair actor within the original counter.
7. Full native/visual/focus/owner/account/package/accepted-caller/G1 evidence, actual cross-vendor raw verdict and fresh independent Astra **full original acceptance**, including every residual and budget. Fresh Codex is not cross-vendor. A green count unit, public hook or docs approval cannot accept DASH-06.
8. Only after caller acceptance root appends evidence to all three ledgers without changing formal312 states/counts, then independent inventory refresh, remote ancestry and sync receipt. No release/deploy/D3/branch promotion or goal-complete inference.

Runtime evidence uses immutable streamed git archive, fixed requested/resolved full SHA, archive size/hash, lock hash **df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9**, actual @repo archive resolution guard/dependency provenance, own server and isolated profile/origin. Reject overwrites, preserve nonzero exits, all PRECONDITION and partial artifacts. Native uses CDP pipe/trusted user input/isTrusted audit/passive key audit, never nativeVirtualKeyCode/DOM-click/forced-focus substitutes. Instrumented fixture/source reads do not pretend to be trusted product actions.

Clock MGB dependency remains full seven-unit M qualification → independent Q2/root adoption → complete valid original P0 before → only authorized two Clock CSS geometry repairs → independent geometry acceptance → versioned addendum/E1–E5 → full original Clock recovery/fixed/native/affected/final acceptance. Retention3/3 and unusable pixel method hold actual measurement-dependent rows; source contract work remains admissible. No whole-host/own-region-only shortcut or weakened pixel standard. A blocked/exhausted inherited caller unit holds its dependent gate, not all new static purposes.

Stop affected work on exact parent/input/hash/scope drift, unknown dirty ownership, unsupported product tradeoff, runtime need in this static task, required protected write, actual product failure without its independent repair path, unqualified measurement, irreproducibility or unknown/exhausted inherited runtime unit. Do not invent a product question to avoid technical design; do not change host/storage/schema/CSS/owner to satisfy this proposal. Preserve the failed evidence and continue unrelated authorized preparation through root.

## 11. Documentary validation and cost

All input identities and both complete output buffers are validated **before either write**. Inputs include the full649 and8472 corpora plus exact source/index/governance/card/product dependencies; duplicate labels must have equal digests. Git blobs, raw tree bytes, decoded embedded JSON/NDJSON strings and exact source slices use the manifest's explicit namespaces. Two inherited external identities are goal authority and historical MEMORY.md navigation provenance; the latter is hashed only, not product authority or acceptance evidence.

The manifest retains every inherited identity unchanged, never hashes itself or this new output as an input, and reports full unique count below. Exact S all16 table and canonical G1 block are copied without reducing clauses. Canonical Clock full contract hash **214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae**; G1 block hash **08adf950bc01f825ac5c0b18553bdd1d6358fb5770b7632bfbe2dfcb3df5d976**,10,159 bytes, is checked byte-for-byte.

Current cost: **same availability contract author1/3; static allowance1, actual invocations2, both FAILED, permanent overrun1; this closure adds0 semantic/static acceptance runs**; product/runtime/tests/build/typecheck/lint/browser/native/qualification/probes/vendor/formal diagnostic/historical reruns0; children0; push/fetch/sync-check0. Standard-library JSON/identity/hash/text/scope checks and a local exact-path hooks-disabled documentation commit are documentary operations. Some broad terminal views truncated and initial bus/account-gate path guesses returned no file; actual source paths were then located/read. The initial document-assembly command refused non-UTF-8 transport before execution; ASCII-escaped source corrected the transport. Invocation1 then failed at GOV-01 and invocation2 failed at QA-01 before any write, as retained above. The draft remains PROPOSED/UNQUALIFIED. Additional authority permits this exact documentary finalization only; no new static acceptance pass, product run, test or probe resulted.

Hash verification is not exhaustive semantic review of every historical leaf, source qualification, visual interpretation or behavioral evidence. No live denial/account switch/owner settlement/DOM/native/browser test occurred. This proposal is not proof usePrefRead works. Final commit/parent/output SHA-256/input count/clean status are supplied in the Handoff; root remote preservation and fresh full review remain outstanding.


Verified input closure: **8548 unique identities**, including every full649 and8472 entry, zero digest mismatches. Namespace counts: embedded=63, file=2, git=8475, git-tree=4, slice=4.

## Appendix A. Complete approved conditional S D06 matrix

Verbatim from dbc818c, interpreted with approved review a441a0b and this additive technical proposal. Its internal section references remain references to the original full S contract, which is retained as a full hashed input. P0 before and future fixed/integrated evidence remain unrun here.

| ID / permanent purpose | Finite required evidence and oracle |
| --- | --- |
| D06-01 real count | At local noon seed valid owner-schema histories containing 0,1,7,8,9,10 completed focus records today; separate prior/next local date, both break modes and early-ended focus controls. Compare widget number to independent fixture truth. Count is full N, never duration/25, dot count, event count, prototype6, recordedAt or stale completedAt. Valid empty is 0; early endings don't increment although owner's duration view may include them. B/F unchanged count positives retained. |
| D06-02 display and no-goal claim | Eight bounded dots, true N at 0/1/7/8/9/10 and visible EN/ZH scale-not-daily-goal explanation from §3, including saturation explanation above8. No assertion user set eight, no target-achieved/100%/percentage claim and no goal inferred from missing data. There is no configured goal; explain the display scale honestly. Existing P0 ambiguous explanation is an expected source-level gap to reproduce, not yet a runtime FAIL. G is inactive and supplies no runtime oracle. |
| D06-03 above-scale AX | Count10 remains10 and accessible text communicates10 completed focus sessions today plus scale capped8/not a daily goal, or hides decorative dots while equivalent truthful text remains exposed. Never independently announce misleading8-of8. EN/ZH names, descriptions and reading order match §3 and actual N; verify0/1/7/8/9/10. New semantics are distinct from inherited true-number/dot-clamp assertions; mixed invocation costs still inherit their histories. |
| D06-04 local-date oracle | Same known instant `2026-09-09T06:30:00Z`: Los Angeles local Sep8 versus UTC/Shanghai/Lord Howe Sep9. Seed unique IDs on both sides of exact known local midnight; check finishedAt assignment including finishedAt yesterday/recordedAt today. Use predetermined UTC bounds for Pacific spring23h/fall25h and Lord Howe23.5h/24.5h; no division by86400000 or oracle calling the product selector. Source fields remain unchanged. No new global timezone behavior. |
| D06-05 actual rollover/resume | Real Dashboard route with stat-pomos mounted across local23:59:59→00:00:01, real parent tick observed; separately hidden-to-visible/pageshow/background timer resumption. Old-day count drops, new-day committed count appears at next real resumed render. Record timer/visibility events rather than imposing an invented500ms SLA. Also direct route reload and remove/re-add via real WidgetShell/AddWidgetPicker. P0 registry ignoring ctx.now is disclosed; no test-only `now` prop substitutes for host proof. |
| D06-06 owner-produced data | Actual archived PomodoroSessionHost/controller + product module completes one short controlled focus session using declared synthetic clock seam and trusted Start; then actual Dashboard displays one. Completion created through owner, not only raw fixture seeding. Visit-order independence: dashboard-first/pomodoro-first and re-entry retain count; no sample data created by dashboard. End-early/break positive exclusions. Exact duration seam is qualified and identified, not fake production outcome. |
| D06-07 settlement/error/recovery | Three scoped cuts: pending-active write denied (no committed record/count), history write denied (no count, owner error/recovery retained), active cleanup denied after history commit (count1 despite cleanup error). Restore and owner Retry/reconcile/reload yields exactly one same ID and first finishedAt/recordedAt, including two tabs. Export/refusal follows existing owner semantics. Widget never writes/retries/clears sessions itself and must not count in-memory uncommitted intention. Preserve related historical POMO results and failures; new same-purpose runs inherit budgets. |
| D06-08 source unavailable/malformed | Distinguish verified absent/valid[] from denied getItem, malformed JSON, wrong root/object, invalid finishedAt/mode/completed, mixed valid+invalid records. Snapshot original bytes; no mount repair/reset/discard. P0 may show default0 or valid subset: record that actual limitation, never call it confirmed empty/complete. Unknown/partial availability must not assert target achieved or successful recovery. Any required display/read repair outside §5 requires fresh source-bound impact, independent review and a separate exact grant before affected admission/acceptance. Display-only S success cannot establish full caller acceptance while unavailable or partial reads masquerade as empty or complete. This row does not authorize replacing storage or weakening its oracle. |
| D06-09 reactive source | Same-tab actual owner settlement, second-tab history update/removal, unrelated-account StorageEvent, unrelated key; read current account generation only. New valid committed data updates visible true count; foreign data cannot replace it. Removed confirmed source becomes honest zero; revoked/unreadable source is not equivalent to removal. Real event sequencing and raw storage establish causality. |
| D06-10 account/lifecycle | Actual App/AccountStorageGate A→locked→B→A with synthetic accounts, current-generation sentinels and actual remount; late A settlement queued behind lock cannot mutate/publish into B; stale export/retry revoked. Test demo and account namespace identities distinctly. A direct component mock is not a whole-host account proof. No real auth credentials, production data or cloud sync claim. |
| D06-11 readonly/ghost and neighbors | Count/dots mount, rerender, real drag ghost, language/theme/date change and reload attempt zero StatPomos-attributed set/remove on any key, zero new network/business event. Exclude fixture setup and precisely recorded owner/grid writes by settled action boundary; never assert whole App has zero writes. Grid remove/re-add/reorder/resize and nearby StatTasks/StatStreak/Clock remain functional with actual trusted input where claimed. No goal activation from clicks/Enter/Space on informational dots. |
| D06-12 visual | Actual full App, EN/ZH × light/dark × CSS375×812,414×896,768×1024,1024×768,1440×900, at default density100% =20 configurations and40 captures (true0 and10 separately); extra EN/ZH compact200% at375/1440 light/dark =8 configurations. Record effective CSS viewport after zoom/DPR; no silent substitution. True count and explanation legible/unclipped; bounded dots, visible neighbors, document overflow and pet-hidden center hits, separately pet-on R-PET baseline. Real CSS/font/token bytes preserved; no screenshot-only geometry claim or layout relaxation. |
| D06-13 trusted keyboard/AX | EN/ZH × light/dark ×375/768/1440 full-host walks, no interactive stop added for decorative dots; test neighboring widget controls pointer/Tab/Shift+Tab/Enter/Space once, real focus pixels every applicable stop. AX communicates localized true count, scale/not-a-daily-goal and above-scale saturation. Don't claim complete assistive-technology certification from AX snapshots. Frozen pixelFocusWalk or adopted independently-qualified successor only; full-cycle refusal remains refusal. |
| D06-14 affected tests/source | Widgets full tests/check-types/lint, grid full tests/check-types/lint, unchanged-test P0 controls; Pomodoro actual existing owner/settlement/recovery/account/counter tests, storage check-types/account/reactivity controls, Web test/check-types/lint, CmdK/Statistics projections relevant to source; complete inherited accepted-caller/final G1 list in §9. Package tests execute real APIs, don't mirror a hand-coded selector. Protected path diff and full source/import hash audit required. |
| D06-15 instrumentation | Qualified source/seed/attempt recorder rejects wrong SHA, wrong @repo root, unexpected write, wrong account/generation, stale count/8-of8, wrong local-day comparison, unavailable-as-empty assertion and synthetic click substituted for trusted input. Positive controls must pass. Fixture mutations only in isolated oracle qualification; never injected into product PASS. Separate source author, fresh reviewer and root adoption before runtime evidence. |
| D06-16 acceptance | Actual cross-vendor raw result (not another Codex instance) then fresh independent Astra reconciles every original clause, B/F row, source/account/error/recovery/visual/native/final regression, residual and permanent counter. A numeric-count unit PASS cannot close the decision. Caller acceptance distinct from formal item completion and deployment. |

A missing or failed required row blocks that row's acceptance and descendants. Freeze actual reproduction/source/oracle before repair; reviewer never fixes. Shared existing defects go to separate authorized owner fix actors. Do not relabel failure “outside scope” while claiming full caller acceptance; retain exact blocked prerequisite and continue independent tasks.

## Appendix B. Full canonical G1, E1–E25 and every E24 judging row

Verbatim canonical dependency block. Original producer names and section references belong to Clock r2; no fresh launch or allowance is inferred. E25 must enumerate every original ID with full producing commit/artifact/hash/verdict and lawful reuse or affected rerun.

This list is the single source for gate evidence (lesson G1). It is contiguous, E1–E25. The final-regression receipt (E25) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; the lockfile gate recorded; the archive byte count and streaming or buffer method; the F-B002 spy self-check; the in-domain seed table; the §12 consistency matrix with case references | Sol | `f9eb4b1` | 1–4 |
| E2 | Sol before logs for the six §12 modes. Per-case outcomes for H1–H6 as exercised; positive controls PASS (H7, H8, D1, D10; D5's zero-confirm recorder). Zero precondition failures | Sol | `f9eb4b1` | 1–4, 6 |
| E3 | Parent jsdom host before log (production `App`): <ul><li>Correct FAILs: rows b–h, j, k, m and n, the drafted half of row i, and the OK half of row q.</li><li>PASS: rows a, l, o and p, the idle half of row i, the lock-independence run of row c, the Cancel half of row q, and a clean control.</li><li>Every row's Topbar census and recorder.</li><li>The cross-caller domain scan (§12).</li></ul> | Parent | `f9eb4b1` | 3, 5 |
| E4 | Native before, production `App`, pipe transport: H1–H5 in EN and ZH; H9 per-stop focus measurements with the frozen `pixelFocusWalk` (identity hashes asserted); H10 sizes; widget and pet geometry at every width, including 768×1024; provenance; the K-1 key audit | Parent | `f9eb4b1` | 5, 6, 8 |
| E5 | The new Clock F1-shape runner and host fixture (the frozen prelude reused read-only and hash-checked; pipe transport; no `nativeVirtualKeyCode`; key audit; streamed archive); `selfcheck` harness-valid; the `clock` before log, c1–c5 | Parent | `f9eb4b1` | 5, 7 |
| E6 | Terra's fixed SHA. `git diff --name-only f9eb4b1 <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files. Terra's own package-run logs and `implementation.md` in the reserved `docs/reviews/web-dashboard-clock-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all six modes PASS, with zero `PRECONDITION` lines | Sol | fixed | 1–4, 6 |
| E8 | Parent jsdom host fixed rerun PASS: every row a–q and the clean control | Parent | fixed | 3, 5 |
| E9 | Native controls: 17 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only per key with Reload; a native held lock; uncertainty with one write; a second-document conflict; per-field failure, Retry and Discard | Parent | fixed | 1, 2, 5 |
| E10 | Native export: the seven §8 disk shapes under total denial (counters, URL, anchor, unload warning, hold, and absent Topbar statuses), plus one setup failure | Parent | fixed | 4 |
| E11 | Native host matrix rows a–q with history counters, runtime-error gates, the Topbar census, the CDP dialog recorder, the trusted-drag record (row q) and the K-1 key audit; rows g and q in both auth branches | Parent | fixed | 3, 5 |
| E12 | Native downstream and isolation: CmdK committed bytes; zero Clock-attributed `StorageEvent` and bus events, with navigation-caused events equal to `f9eb4b1`; the other-key snapshot unchanged, including `xai_rail_order`; clean-state `.module-dashboard`, `.app-rail` and `.topbar` invariance against `f9eb4b1` (EN/ZH; 375 and 1440; popover closed and open; frozen page clock) | Parent | fixed and `f9eb4b1` | 6 |
| E13 | EN/ZH five-width visual: pet-hidden hit-tests (narrow widths via the resize procedure, with pet-hidden asserted after the resize); the pet-on R-PET run; 44×44 for new targets; containment; overflow; the selector audit (append-only, scopes, class-usage control, non-collision with shell selectors); the manually reviewed screenshots of §9; viewport heights recorded | Parent | fixed (pet captures also `f9eb4b1`) | 8 |
| E14 | Keyboard and focus: Tab order, Enter/Space once, the focus targets, the per-stop `pixelFocusWalk` comparison in walk states 1–4 across selection states and themes (F-APP-1/2), the recorded open-popover Tab-out probe (§9), the K-1 audit | Parent | fixed | 8 |
| E15 | **F1 regression**, 16 invocations: <ul><li>`verify-f1.mjs` sticky, more and collaborate;</li><li>`verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro;</li><li>`verify-f1-race.mjs` race;</li><li>`verify-f1-features.mjs` selfcheck and features;</li><li>the Appearance F1-shape `selfcheck` and `appearance` modes through the K-1 copy `../web-native-keyinput-k1/verify-f1-appearance-k1.mjs` (`e9fbc590…`; at `f9eb4b1`, 135/135 harness-valid and a1–a4 `fixed-pass`, 123/123);</li><li>**the rail F1-shape** `../web-apprail-order-recovery-f1/verify-f1-railorder.mjs` (`6385b648…`) `selfcheck` (harness-valid, 165 checks at `f9eb4b1`) and `railorder` (`verdict=fixed-pass`, f1–f3, 104 checks at `f9eb4b1`).</li></ul> All PASS with no `Invalid blocker state transition`. Runner hashes are unchanged, except where the capacity rule applies (Rules) | Parent or final verifier | fixed | 7 |
| E16 | Clock F1-shape fixed log PASS for c1–c5 under the release-once reading: one release per expected release, zero non-live blocker calls, one location commit per navigation release, one identity invalidation per sign-out release, zero runtime errors, no `Invalid blocker state transition`, and the c5 ordering (rail confirm first; zero Clock calls on Cancel) | Parent or final verifier | fixed | 5, 7 |
| E17 | **Header affected-caller rerun,** at the fixed SHA and, as a control, at `f9eb4b1`. Counts and record sequences must equal the accepted receipts: <ul><li>**Host suite:** departure 5/5, advanced 5/5, followon 2/2. The frozen `../web-dashboard-header-departure-independent/verify-fixed.mjs` (`840225ac…`) refuses with `ENOBUFS` at 100 MiB, so the judging runner is the accepted buffer copy `../web-apprail-order-recovery-final/host-suites/web-dashboard-header-departure-independent/verify-fixed.mjs` (`56645cbb…`).</li><li>**Native suite:** `../web-dashboard-header-departure-native/verify-native.mjs` (`7af1a8fd…`), the 18 modes of `affected-callers-f359be6.md` §3.7, with record sequences equal to the accepted ones.</li><li>**Astra and Sol suites,** as unchanged controls with counts equal to their accepted receipts: `../web-dashboard-header-departure-astra/verify-fixed.mjs` (`30e3f804…`) and `../web-dashboard-header-departure-sol/verify-fixed.mjs` (`bb5f8937…`).</li><li>The native, Astra and Sol runners also use 100 MiB buffers. Each runs first as frozen; on refusal it runs through a **pre-registered buffer copy** (Rules) under `web-dashboard-clock-recovery-final/header-copies/`.</li></ul> | Parent or final verifier | fixed and `f9eb4b1` | 3, 9 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `f9eb4b1` | Final verifier | `f9eb4b1` and fixed | 6, 9 |
| E19 | §10 item 8 protected-path empty diff against `f9eb4b1` | Final verifier | `f9eb4b1..fixed` | 6, 9 |
| E20 | Storage check-types plus the Sol lifecycle assertion for both keys | Sol and final verifier | fixed | 6, 9 |
| E21 | `xai-web-dashboard-widgets` full test, typecheck and lint from the fixed archive, plus its unchanged tests at `f9eb4b1` as a before control | Final verifier | fixed and `f9eb4b1` | 9 |
| E22 | `xai-web-dashboard-grid` full test, typecheck and lint, plus its unchanged tests at `f9eb4b1` as a before control. The package tree is identical to `73b4eb9`'s, where it was 25 files / 228 tests | Final verifier | fixed and `f9eb4b1` | 9 |
| E23 | Web package test (30 files / 196 tests at `f9eb4b1`, including `App.railorder` 18 and every §10 item 10 web test), check-types and lint; CmdK package test | Final verifier | fixed | 9 |
| E24 | **Accepted-caller suites,** with counts compared to the AppRail final regression at `f9eb4b1` (`review-final-regressions-f9eb4b1.md` §3–§6; runners and commands as there). Each judging copy runs beside its frozen original as §12 predicts. The rows are listed after this table | Final verifier | fixed | 9 |
| E25 | Final-regression receipt enumerating E1–E24: producing commit, artifact paths, SHA-256, verdict; the §12 prediction table filled with observed outcomes; every capacity copy with its diff and its refusal transcript | Final verifier | — | 9 |

**E24 rows** (each count is the AppRail final regression at `f9eb4b1`):
- **AppRail (new in r2):**
  - Sol eight modes through `../web-apprail-order-recovery-sol/verify-fixed.mjs` (`e944cb22…`): `bytes` 26, `domain` 31, `merge` 21, `drag` 18, `field` 24, `continuity-export` 22, `host` 33 and `original` 123;
  - parent host through `../web-apprail-order-recovery-independent/verify-fixed.mjs` (`646bf047…`): 31/31;
  - **C-RD1** 15/15, judging Features `downstream` case 014.
- **Appearance:**
  - Sol `bytes` 65, `fields` 89, `reset` 34, `queues` 56, `host` 33, `retry-all` 48 and `original` 187;
  - `continuity-export`: frozen 24/26 (006, 007), recorded, **and** the OE copy `../web-appearance-recovery-oracle-erratum/verify-erratum.mjs … corrected` 26/26, judging;
  - parent host 33; package 11 files / 137.
- **Features:**
  - Sol `bytes` 17, `fields` 49, `reset` 31, `queues` 40, `continuity-export` 26 and `original` 6;
  - `downstream` three ways: frozen 13/15 and C-FD1 14/15, both recorded, and C-RD1 15/15, judging;
  - host 40; package 7 files / 45; reader tests 5 files / 17.
- **More:**
  - Sol `fields` 22, `reset` 20, `queues` 14 and `owner-export` 13; `original` 15; host 11;
  - `boundaries`: frozen, recorded as it falls, **and** the C-FB002 copy `../web-more-recovery-fb002/verify-fb002.mjs … corrected full` 10/10, judging.
- **Others:**
  - Sticky: Sol 109, original 10, host 28;
  - Notifications: Sol 41, Astra boundaries 24, Astra host 15, parent host 12;
  - Date & Time 7;
  - the Smart Lists, Collaborate and Pomodoro host suites through the accepted buffer copies in `../web-apprail-order-recovery-final/host-suites/`, with the per-mode counts of that receipt's §6;
  - settings-shell 11 files / 54; settings-rest 44 files / 314.

## Appendix C. Complete inherited S permanent-history correspondence

Verbatim dbc818c history table; its “this correction”/“current” terms describe that historical author2, not this contract author1. A16 impact/review and this contract counters are additionally specified in §9. No known failure/refusal/unknown count is erased by copying this table.

| Permanent family | Actual retained history at dispatch | DASH-06 consequence |
| --- | --- | --- |
| DASH-06/PREPARE and contract review | Source1 author1/3 and review1/3 REVISE remain consumed; this fresh correction is author2/3 with one static pass. | Next fresh independent review2/3; reads, hashes and commit do not create extra author rounds or reset history. |
| New visible scale/no-goal semantics and truthful localized AX, D06-02/03 | Actual P0 `StatPomos.test.tsx` covers true10/dots8 and bilingual widget labels; `PomoDots.test.tsx` covers shape/fill/clamp/negative. Accepted real-data design/API/test/dev_log records count/localday/read-only, not visible EN/ZH scale/no-goal or truthful localized above8 AX. Actual helper uses English clamped `safeCount of safeTotal`. No corresponding old semantic-purpose unit was found in this compared source/history. | Root may register the first finite source-author/review/qualification tasks for these genuinely new semantic purposes after review/adoption; no extra owner decision or generic caller-wide unknown barrier. This is source novelty, not runtime lifetime0. A mixed package/host/native invocation inherits every corresponding old purpose and count; evidence[] alone proves neither zero nor unknown for all new work. |
| Count/source/date, D06-01/04 | P0 `pomoStats`/predicate tests, AC-RD-POMO and AC-STATS-REAL-POMO; widgets dev_log F1 author185/185, verification215/215 with typecheck/lint failure, repair and reverify215/215. | Preserve original source, actors, failures and formal attempts. Aggregate assertions do not establish remaining package tries. Unknown old unit counts remain unknown and nonzero where prior execution is evidenced; never reset by adding new text assertions. |
| Actual rollover/resume, D06-05 | Dashboard real1s tick/registration without ctx.now; REL-01 independent six actual consumers plus four-zone calculations. StatPomos is absent from that six-consumer receipt. | No transitive PASS; match actual shared host/instrument purposes and inherit those counters. Do not charge unrelated six-consumer failures to a newly added StatPomos-specific assertion. Register the bounded source difference, not a renamed whole runtime matrix. |
| Owner data/settlement/account, D06-06/07/09/10 | POMO independent receipt at4868d0a retains stale-revision/competing-start failures, pending/history/clear cuts, two tabs, process-close/reopen, lock/account queue and stale export. | Bind corresponding original source/log/refusal/actor records and remaining counts before actual execution. Existing owner behavior is inherited; a fresh actor/path cannot reopen exhausted or unknown units. |
| Read unavailable/partial source, D06-08 | getPref/readRawPref fallback, usePref scope/decoding, defensive selector filtering and existing storage/account tests. No availability channel is a demonstrated source ambiguity. | Fresh impact must trace the actual attempted purpose and separate exact allowance; unknown old read/account runtime counts block that unit. Never convert fallback0/subset into a successful empty/complete oracle. |
| Ghost/read-only/neighbors/host/package, D06-11/14 | Owning widgets/grid/App/package and accepted caller regressions, original readonly real-data contract. | Preserve actual invoking suite families, failures and P0 controls; no new budget for renamed mixed suite. Root maps before/fixed and combined-source invocation identities. |
| Visual/keyboard/AX, D06-12/13 | New explanation/AX content is compared above; existing full-host/pixel machinery and Clock responsive/focus/retention histories remain shared dependencies. | Isolate new content purpose from inherited method qualification; hold method-dependent rows. New content or a new runner label cannot reset full-host/Clock counters. |
| Instrument source/qualification/vendor/final acceptance, D06-15/16 | Existing instrument, measurement, accepted-caller and vendor-purpose histories; genuinely new DASH-06 judgment is separately scoped to the newly added semantics. No DASH-06 runner exists here. | Root registers each finite purpose with source correspondence, inputs, exact outputs, actor, count evidence and remaining cap before formal launch. No aggregate final-regression0/3; unknown/exhausted old units block only their corresponding nodes. Fresh Codex is not cross-vendor. |
| Clock B70 fields/source | Each before1 and before2 included two language matrices; first source snapshots unavailable → preserved diagnostic-only; both families used2 iterations. Departure1 used one bilingual invocation. | No retry/reset authorized by this contract. Preserve exact raw historical attribution. |
| Clock B70 responsive | visual1, geometry2, modal3; **3/3 exhausted**. geometry48 pet-hidden failures/12 passes, overflow60/60. | Cannot rerun as DASH-06 “new visual”. New StatPomos surface purpose must be isolated from this inherited Clock matrix, while whole-host dependent gate stays explicit. |
| Clock B70 focus | EN2/3, ZH2/3, initial setup refusals plus full-cycle before2 refusal; supplemental before3 source existed but was **never launched**. | No implied third launch or substitute own-region-only PASS. |
| B70 totals / F1 | Native12 formal /6432 checks;40 development /4884. Clock F1 selfcheck1 and clock1:2 formal /180;3 development /302. | Totals retained alongside family counts, not12 iterations against a single cap, not transferred to a fresh caller budget. |
| Clock Q1 seven qualification units | focus-controls1/3; reload-controls, appearance-fapp1, appearance-fapp2, appearance-accepted, apprail-accepted, geometry-reload-p0 each0/3 in actual frozen registry. Development2/83. | These six explicit historical zeros have source authority; they are not invented zeros for other units. Same matrix successor inherits each count. |
| Clock retention validation | i1 exit1/39 assertions/13 of14 cases; i2 exit0/51/14 of14; i3 exit0/55/14 of14 =3/3,145 assertions,41/42 cases. Source review cbf18b4 REVISE R1–R6; impact44d04c8 says no valid remaining path. | **BLOCKED**, pending separate exception in parent state; no fourth/renamed retry here. Method still UNQUALIFIED; current i2/i3 green does not qualify it. |
| Accepted caller/full G1/focus/vendor histories | Original Clock checklist, AppRail final receipt, canonical copies, actual source-review/input indexes retained in manifest. Fixed control receipt records3 actual TT vendor runs and34 static receipts (37 total); none is a DASH-06 PASS. | Each corresponding inherited regression/vendor purpose needs its actual source-bound history, not one aggregate “final regression0/3”. Unknown counts block that unit's dispatch. Fresh vendor for a genuinely different DASH-06 question is separately registered only with this mapping. |

## Appendix D. Full frozen broader API-impact candidate census

Verbatim impact census. This is a source-text candidate list, not active-call count or migration authorization.

Source-text search of apps/packages .ts/.tsx for getPref/readRawPref/usePref/usePrefAsync/usePrefAutosaveAsync, excluding __tests__, .test., .spec., vitest paths. Includes comments/type documentation/definitions; **82 candidate files, not active-call count**. This bounded conservative list and each P0 byte identity preserve the global-change impact surface; option A does not migrate them.

- `packages/plugin-web-ai-chat/src/AiChatModule.tsx`
- `packages/plugin-web-ai-chat/src/internal/claudeAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/contextProvider.ts`
- `packages/plugin-web-ai-chat/src/internal/llmProvider.ts`
- `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
- `packages/plugin-web-ai-chat/src/internal/useChatPreference.ts`
- `packages/plugin-web-ai-chat/src/internal/useConversationRecovery.ts`
- `packages/plugin-web-board-core/src/BoardModule.tsx`
- `packages/plugin-web-board-core/src/internal/persistence.ts`
- `packages/plugin-web-board-core/src/internal/seed/board-data.ts`
- `packages/plugin-web-board-views/src/BoardModule.tsx`
- `packages/plugin-web-board-views/src/internal/persistence.ts`
- `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`
- `packages/plugin-web-countdown/src/internal/useCountdownSaveRecovery.ts`
- `packages/plugin-web-pomodoro/src/PomodoroModule.tsx`
- `packages/plugin-web-pomodoro/src/internal/durations.ts`
- `packages/plugin-web-pomodoro/src/internal/notifications.ts`
- `packages/plugin-web-pomodoro/src/internal/sessionsReducer.ts`
- `packages/plugin-web-pomodoro/src/internal/validate.ts`
- `packages/plugin-web-pomodoro/src/types.ts`
- `packages/plugin-web-settings-rest/src/CallbackPage.tsx`
- `packages/plugin-web-settings-rest/src/internal/usePremiumTier.ts`
- `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`
- `packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx`
- `packages/plugin-web-settings-rest/src/panes/dateTimePane.tsx`
- `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`
- `packages/plugin-web-settings-rest/src/panes/morePane.tsx`
- `packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx`
- `packages/plugin-web-settings-rest/src/panes/smartListsPane.tsx`
- `packages/plugin-web-settings-rest/src/panes/stickyPane.tsx`
- `packages/plugin-web-settings-shell/src/internal/defaults.ts`
- `packages/plugin-web-statistics/src/StatisticsModule.tsx`
- `packages/plugin-web-statistics/src/internal/narrowTaskCols.ts`
- `packages/plugin-web-storage/src/index.ts`
- `packages/plugin-web-storage/src/internal/storage.ts`
- `packages/plugin-web-storage/src/internal/usePref.ts`
- `packages/plugin-web-storage/src/internal/usePrefAsync.ts`
- `packages/plugin-web-storage/src/internal/usePrefAutosave.ts`
- `packages/plugin-web-storage/src/internal/usePrefAutosaveAsync.ts`
- `packages/xai-web-calendar/src/CalendarModule.tsx`
- `packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.ts`
- `packages/xai-web-cmdk/src/CommandPalette.tsx`
- `packages/xai-web-cmdk/src/internal/readModuleStates.ts`
- `packages/xai-web-dashboard-grid/src/DashHeader.tsx`
- `packages/xai-web-dashboard-grid/src/DashboardModule.tsx`
- `packages/xai-web-dashboard-grid/src/internal/useDashOrder.ts`
- `packages/xai-web-dashboard-widgets/src/StickyComposer.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/calMonthDots.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/calUpcoming.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/habitStreak.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/isHabitsState.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/isTaskColsRecord.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/isUserCalEventMap.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/notifications.ts`
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/pomoStats.ts`
- `packages/xai-web-dashboard-widgets/src/internal/stickiesStore/useStickies.ts`
- `packages/xai-web-dashboard-widgets/src/internal/weatherStore/useWeather.ts`
- `packages/xai-web-dashboard-widgets/src/internal/weatherStore/weatherStore.ts`
- `packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/MailWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/MiniCalWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatPomos.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatStreak.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatTasks.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/UpcomingWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/WorldClocks.tsx`
- `packages/xai-web-habits/src/internal/usePersistedHabits.ts`
- `packages/xai-web-matrix/src/MatrixModule.tsx`
- `packages/xai-web-matrix/src/internal/usePersistedMatrix.ts`
- `packages/xai-web-meditation/src/internal/useMeditationPrefs.ts`
- `packages/xai-web-meditation/src/internal/validate.ts`
- `packages/xai-web-meditation/src/types.ts`
- `packages/xai-web-pet/src/DesktopPet.tsx`
- `packages/xai-web-settings-appearance/src/internal/appearanceController.tsx`
- `packages/xai-web-settings-appearance/src/types.ts`
- `packages/xai-web-settings-features-panel/src/internal/featuresRecovery.ts`
- `packages/xai-web-settings-features-panel/src/useFeaturePrefs.ts`
- `packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx`
- `packages/xai-web-shell/src/internal/railOrderController.tsx`
- `packages/xai-web-tasks/src/TasksModule.tsx`
- `packages/xai-web-tasks/src/internal/validate.ts`
