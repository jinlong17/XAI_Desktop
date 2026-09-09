# B2 null-source repair — Astra independent acceptance

Module: Web. Fixed product `aca01933c70bb700b4b497786181b47a3dfe06a9`. This follow-up uses a git archive and the unchanged reviewer runner/assertions from `b20c7ea`. Concurrent C/storage changes were excluded. No product code changed.

**Bounded verdict: accept B2 compatibility including this repair.** The two original null-source preservation failures are fixed without weakening their assertions. Full AI-02, ordinary canonical writes, durable replay, public activation, REL-05 and whole Board remain open.

Run: `node docs/reviews/web-board-workspace-astra-review/verify-b2.mjs aca0193`.

| Suite | Result | New evidence |
| --- | --- | --- |
| Original independent B2 contracts | 19/19 PASS | `b2-independent-aca0193.log` |
| Calendar migration + hook | 12/12 PASS | `b2-calendar-aca0193.log` |
| Tasks migration | 2/2 PASS | `b2-task-migration-aca0193.log` |
| Board task link | 9/9 PASS | `b2-board-link-aca0193.log` |
| Account lifecycle | 7/7 PASS | `b2-lifecycle-aca0193.log` |

Both JSON `null` and envelope `data:null` now return `{ok:false,phase:'intent'}` with the recovery message. The independent log records `taskBytesPreserved:true` and `boardBytesPreserved:true` for each case. The same positive test still creates a link from physically absent Tasks, then wraps the created valid task dataset in an envelope and acknowledges the existing linked task successfully without changing the receipt-bearing Tasks bytes.

Source review confirms `taskLinkCommand.ts:33–46` reads physical raw bytes before parsing. Only actual missing bytes produce `absent`; all non-absent projected data must survive the Tasks loader's domain check unchanged. Null therefore no longer obtains seed eligibility. Storage read/JSON parse failures still exit the surrounding command catch before intent publication. Captured owner validation remains before this read and subsequent writes.

The other original 17 independent checks remain passing: Calendar low-year/leap-day migration, invalid date rejection, owner shape/identity boundaries, actual selected import with exact raw envelopes, raw export and captured-owner deletion, invalid import preservation, nonempty Calendar envelope projection and staged protected write refusal, and stale/corrupt baseline protection.

The `5c13fec` logs and [original finding](20260909-b2-compatibility-review.md) are retained unchanged. This evidence is independent jsdom component/storage verification, not a native-browser run or production rollout result. C/D must still deliver full domain validation at canonical mutation boundaries, serialized receipt-preserving writers and honest failures/reset behavior. The [old-client activation gate](20260909-runtime-activation-gate-diagnosis.md) remains unresolved; no public envelope activation is authorized by this B2 acceptance.
