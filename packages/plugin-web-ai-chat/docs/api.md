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
