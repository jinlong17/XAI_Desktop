# D1 ordinary writer: independent initial regression findings

Web; fixed product `3a764a16d8da3df91e00ed2e9a7cd3925fec57ac`. The runner imports an immutable git archive, excluding ongoing UI/subscriber edits. Run `node docs/reviews/web-canonical-ordinary-writer-review/verify-fixed.mjs 3a764a1`.

**3 correct FAIL / 1 positive-control PASS**, process exit 1. This is jsdom production-function evidence, not native UI acceptance. Shared writer acceptance is pending repair and independent rerun.

1. **Activation is bypassed by the ordinary writer.** With `setCanonicalCommandActivationForTests(false)`, an ordinary update returns success and converts the physical legacy record into an envelope. The approved D1 contract keeps first envelope activation closed. The command API's separate guard does not protect this new entry point.
2. **In-place mutation can falsely report success.** The mutator appends to the validated input array and returns that data. Because `changed` compares input/output after mutation, the same modified object compares equal to itself. The function returns success/unchanged while physical bytes still contain the empty array. The assertion allows explicit refusal with unchanged original bytes; successful return must mean the changed domain was actually persisted.
3. **No-op success precedes final account validation.** A mutator invalidates the captured owner and returns unchanged data. The early no-op branch returns success despite the account change. It must perform the final owner/marker/tombstone checks before any successful return, including unchanged results.

The positive control enables activation and performs an immutable update; it correctly writes revision 1 with the expected value. The tests use the real persisted generation marker and physical localStorage key, with an injected serial lock. They do not claim cross-tab concurrency.

Minimum repair remains within Terra's shared-storage ownership: consistent activation guard, a pre-mutation snapshot or explicit mutation refusal instead of a post-mutation same-object comparison, and final checks on the no-op path. Preserve the fixed failure log and rerun these same business oracles. The current C primitive bounded acceptance is unchanged; ordinary-writer/UI/D1 and full AI-02 remain open.

## Fixed follow-up

Product `151982b` was tested through the identical independent runner and four business assertions. Result **4/4 PASS**, `independent-151982b.log`; original `3a764a1` failure evidence is retained. The three demonstrated activation/false-save/no-op-owner defects are repaired within this bounded scope. This is not a full shared-writer, UI, D1 or AI-02 acceptance. Terra continues actual Calendar/Tasks/Board caller integration.

## Activated synchronous bypass follow-up

The D1 contract also forbids old synchronous setters/removers once the coordinated protocol is enabled, including before the first envelope exists. `verify-sync-guard.mjs 151982b` produces **3 correct FAIL / 1 control PASS**: activated setPref writes physical absence or valid legacy `{}`, and activated removePref deletes legacy `{}`. The unchanged four assertions against repair `3e0b611` produce **4/4 PASS**. Disabled legacy setter behavior remains the positive control. Both fixed logs are retained.

These are actual storage API assertions, not a native Web Locks concurrency test or permission to activate production. Calendar UI author commit `496039f` is a separate batch pending Astra review; it is not accepted by these four storage checks.
