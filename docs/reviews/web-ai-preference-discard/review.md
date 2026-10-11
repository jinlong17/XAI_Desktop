# AI preference discard refresh

Parent discovered a separate preference recovery defect while independently accepting conversation recovery. At 650f59c the actual module can display Insights on while raw xai_ai_insights is false: external change without a delivered StorageEvent, toggle detects conflict, Discard clears the error but leaves the stale usePref value rendered.

The correct UI assertion in save-contract.test.tsx failed before and passes after unchanged. Device preference recovery now keeps a local displayed value synchronized with ordinary usePref updates, updates it on successful retry, and explicitly rereads it when discarding. Discard does not write storage. Scope assertion still precedes access; no account/device ownership change.

Validation: original diagnostic 1FAIL→1PASS; AI package32files278tests, typecheck and lint PASS. These package checks ran in the shared workspace while unrelated tool-receipt files were being edited; they are regression checks, not independent acceptance of that work. This commit includes only the preference hook and its diagnosis evidence. A fixed snapshot independent follow-up remains necessary before marking device preference recovery accepted.

No browser-close durability, tool receipt or complete REL-05 claim. Conversation recovery has separate parent independent evidence3491540; narrow-screen toolbar overlap is separately being corrected.
