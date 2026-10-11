# REL-03 AI ownership APIs

Historical feature API: `../../xai-web-ai-chat/docs/api.md`.

- `aiKeyStorage.loadKey(provider): Promise<string|null>`: current committed owner only; locked returns null; revoked or missing committed marker rejects. Malformed/undecryptable ciphertext returns null without deletion.
- `saveKey(provider,plaintext)` / `clearKey(provider)`: capture current owner and operate exclusively on its provider row. Revocation rejects; an already issued IDB mutation can finish only in the captured old namespace, never the next account.
- `testConnection(provider)`: captures owner throughout key load, provider configuration and HTTP result; account invalidation aborts fetch and rejects the stale result.
- `inspectLegacyAiSecrets(): Promise<AiProvider[]>`: returns provider names only for retained provider-only ciphertext. No decryption/content exposure. The host should inspect this as well as legacy localStorage so secret-only installations receive the explicit migration choice.
- `aiSecretMigrationParticipant: SecretMigrationParticipant`: public storage participant with `stage(context)` and `verify(context)`. Context includes accountId, generation, previousGeneration, migrationId, demo, adoptLegacy. Requires a current locked scope for that account. Stage copies owned previous rows even when adoptLegacy=false. Original ciphertext and failed candidates are retained. An explicit host retry/rollback coordinates through the storage migration lock and generation marker.

Importing the AI public index registers the owner validator for `xai_ai_convos` using `isAiConvoRecord`; malformed selected archives cannot silently lose rows during migration.

v2 envelopes contain version, owner, ciphertext, iv, salt, kdfIterations=600000 and algo=AES-GCM. No plaintext is persisted in migration receipts, exports or logs. The ciphertext-only receipt deliberately duplicates candidate ciphertext for verification; deletion/compaction policies are separate explicit operations.

`clearAccountAiSecrets(capturedScope: AccountScope): Promise<void>` is the explicit account-erasure endpoint for Settings. Capture the authenticated owner before server deletion/sign-out and pass it explicitly. Unlike normal reads/writes, this authorized erasure accepts a revoked epoch because successful server deletion may already have signed out; it freezes kind/accountId and deletes only matching scoped ciphertext and migration receipts across that owner's generations. It never resolves the current account dynamically, never decrypts, and preserves other accounts, separate demo data, legacy provider rows and malformed quarantined keys. Locked/unidentified inputs reject.

## REL05 mounted-page save recovery (2026-09-09)

Conversation writes observe the storage boolean. A failed seed retains its stable conversation id and complete latest messages in a pending snapshot. Subsequent sends extend that same snapshot and try persistence again; Retry saves the existing snapshot without reissuing the AI request. Failed delete/selection apply their UI transition only after successful persistence. New/select/delete cannot replace an unresolved draft, active stream, or unsubmitted composer input. Explicit discard is available after generation stops and refreshes the canonical conversation list.

The exact observed raw baseline is retained across failures. A changed baseline, including an external write before its storage event arrives, refuses overwrite. This is synchronous conflict detection, not an atomic cross-tab transaction. Malformed canonical rows are not silently filtered and rewritten by the recovery writer.

The visible bilingual recovery panel provides Retry, Export draft and explicit Discard. JSON export includes conversation records, latest normalized messages, current input, attachment metadata and pending insights/voice preferences. No BYOK credentials or auth tokens are included. Export and late writes require the captured account scope to remain current. Insights and voice remain device preferences; their failed toggles retain the exact desired boolean for retry.

Recovery is in mounted memory, not a durable journal. Closing/reloading the page or navigating away through the host can lose unsaved content. Streaming still runs in the browser, and stopping the browser does not continue an AI task. This change does not establish tool-write business receipts, cloud backup or production-provider acceptance.
