# AI-02 canonical receipt migration: parent source inventory

Read-only inventory at daff8ef; no product implementation. Supports Astra's architecture review. Search candidate lines are not coverage totals; comments/types and read-only references remain in key-candidates.txt for traceability.

| Surface | Current behavior | Migration gate |
|---|---|---|
| Storage registry/codec/getPref/setPref | Tasks array and Calendar event-map JSON accepted directly | Envelope schema must expose only data to ordinary callers, preserve receipts on ordinary writes, reject malformed or unsupported envelopes without overwriting. |
| usePref StorageEvent path | Decodes event.newValue directly using registry codec | Must apply same envelope decode as initial/same-tab reads; otherwise cross-tab UI receives metadata object instead of domain data. |
| TaskLinkCommand | Direct scoped raw read then loadTaskColsOrSeed; identity comparison rejects substituted shapes | Explicitly decode envelope domain data before validation, preserving envelope receipts when creating linked task; rerun TASK-02 native partial-write/link idempotency gates. |
| useUserCalEvents | Direct raw JSON equals events snapshot before save | Compare decoded domain data consistently while preserving whole-raw/revision conflict protection; wrapping raw alone currently causes false conflict on every save. |
| Account migration validators | Tasks isTaskColsArray; Calendar event-map validator | Inspect raw validation boundary and support new schema without accepting arbitrary metadata as business entities. Legacy unmapped data, import/Undo and account delete/export must retain intended contents. |
| AI contextProvider | getPref Tasks/Calendar → domain narrowing | Envelope metadata must not appear as task/event or disappear from persistence on ordinary edits. |
| Statistics | usePref Tasks → completion counting | Domain projections must retain original counts/dates and not count receipts. |
| Mail/MiniCal/Upcoming/StatTasks widgets | usePref stores → separate domain readers | Exercise all projections with envelope and legacy input through actual hooks, not merely isolated codec tests. |
| CmdK search | readModuleStates getPref Tasks then adapter | Search entries remain domain tasks; no receipt metadata leaks. |
| StickyComposer and Board module | usePref Tasks for existing linkage | Preserve domain shape and original linked ids. |
| Six AI CRUD subscribers | getPref/setPref plus page-lifetime receipt cache | Perform data + successful receipt in one canonical write, including delete when no entities remain; failed writes do not create committed receipts. |

Generic export/delete/reset paths can access these keys without literal names; keyword search alone cannot certify completeness. Inspect accountOwnership/lifecycle enumeration and raw backup/restore before shipping the format migration. Receipts remain account-owned content, not a device/global cache.

Do not claim cross-tab atomic execution merely because data and receipt share one setItem: competing read-modify-write operations still require coordination covering ordinary writers. Do not independently write receipts to a second key. Task-link and Calendar raw baselines are concrete compatibility blockers, not optional documentation.

This is an input to Astra planning. It neither authorizes a new sync module nor closes AI-02, REL-04, REL-08 or schema recovery requirements. Implementation ownership must be assigned before changes.
