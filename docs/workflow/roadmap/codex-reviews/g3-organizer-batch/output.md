## Codex Cross-vendor Review

**Feature**: g3-organizer-batch
**Commit(s)**: 533391e
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- Strong boundary discipline overall: TS Finder client stays on injected `invoke`, Rust command registration remains in host, and new plugin surfaces are exported through `packages/plugin-organizer/src/index.ts`.
- `createUrlGridItem` and `evaluateItemHealth` are typed, additive seams with useful deterministic test hooks (`nowIso`, `newId`) and good happy/error-path unit coverage.
- Auto-classification is implemented as a rule array rather than hard-coded branching, which is the right extensibility seam for later Repository-backed rules.
- Commit hygiene at the message level is solid: `Why/What/Scope/Risk/Tests` are explicit and easy to audit.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] G3-E1 folder inference does not match real Finder payloads. `inferKindFromPath` only returns `folder` for trailing `/`, but the recorded G0.4 evidence for folders is an absolute path without a trailing slash. The new bulk adapter will misclassify real folder drops as `file`.
- [P1] G3-E3 does not enforce the documented “user-authorized path only” boundary. `reveal_in_finder` / `open_path` check only window label + empty/NUL; any allowed window can pass an arbitrary absolute path. That violates the contract text and the test checklist for path authorization.
- [P1] Workflow V2 hygiene is incomplete. `packages/plugin-organizer/docs/dev_log.md` was not updated with a Status Panel / Work Log row for this run, and five features were bundled into one `feature-build` commit despite the project’s one-phase-per-run rule.
- [P2] Contract/audit docs are only partially updated. `tauri-commands-v0.md` was changed, but the capability audit table was not extended for the new Finder surface, and the organizer public API contract still does not reflect the newly exported non-UI public helpers.
- [P2] Coverage misses important boundary cases: no regression test for real folder-path shape, no explicit `data:` / custom-scheme rejection test, no multi-grid same-rule stability test, and no test around command blocking / shell failure behavior.

### Concrete next-phase targets (max 6 bullets)
- Fix folder inference using authoritative drop metadata or a non-trailing-slash folder heuristic, and add a regression test from the recorded G0.4 folder path form.
- Add provenance/root enforcement for Finder commands so only user-dropped, picker-selected, or authorized-bookmark paths can be opened/revealed; add cargo tests for reject/allow cases.
- Add a dedicated Finder capability/audit entry and update `docs/contracts/tauri-commands-v0.md` + `apps/desktop/src-tauri/capabilities/AUDIT.md` together.
- Repair Workflow V2 bookkeeping in `packages/plugin-organizer/docs/dev_log.md` and keep follow-up fixes split into small commits.
- Add URL rejection tests for `data:` and one custom non-http scheme, plus classifier determinism tests with multiple matching grids.
- Decide and document tie-break behavior and whether extension groups remain code-defined or become settings/repository data.

### Out of scope confirmed
- Actual UI cut-over in `SmartContainer.tsx` / `OrganizerGridContent.tsx` remains deferred and was correctly not reviewed here as shipped behavior.
- Real macOS manual runtime smoke for Finder commands and two-Grid interaction remains a valid deferred gate.
- MAS sandbox / security-scoped bookmark validation remains deferred external under the existing G0.6 / G1.3 tracks.