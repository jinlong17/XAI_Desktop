# AI local account isolation — REL-03

This source-package amendment accompanies the historical feature design in `../../xai-web-ai-chat/docs/design.md`. It owns only BYOK and asynchronous AI lifecycle; REL-03 host, storage, migration UI and other repositories remain separate work.

API keys use IndexedDB `xai-web-ai-secrets/secrets` with v2 composite identity `[account|demo, accountId, generation, provider]`. AES-GCM additionalData binds that exact tuple plus envelope version; random salt/IV and existing device PBKDF2 derivation remain. Encryption at rest is not an authorization boundary: current immutable storage scope and committed-generation marker are required before loading/writing, with revalidation after asynchronous boundaries.

Locked scopes return no key; revoked operations reject AccountScopeError. Provider-only v1 ciphertext is quarantined, never an automatic fallback and never deleted on parse/decrypt failure. Corrupt scoped rows likewise remain available for explicit recovery. Demo and account namespaces are distinct.

Host uses the public migration participant to copy previous-generation keys and optionally adopt v1 keys. Adoption is separately explicit and prohibited in demo. Conflicts between an owned provider and a legacy provider block rather than overwrite. Stage re-encrypts with new generation AAD, stores a ciphertext-only receipt, and verify rereads/decrypts every staged row. Originals remain byte-identical. The storage owner commits the sole generation marker after all participants pass; this module cannot expose uncommitted candidates or commit the marker. Rollback selects the retained previous generation.

Each stream generator and key connection test subscribes to scope invalidation and aborts transport. Key KDF/encryption/decryption, fetch and yielded chunks revalidate ownership. AiChatModule captures its mount owner; invalidation clears pending prompts, plaintext bubbles, errors and tool confirmation and rejects subsequent old callbacks, including a transport that ignores abort. Host must remount an identity-keyed subtree before another account interacts; this package cannot authenticate or remount the shell.

New local persistence is not cloud account synchronization and does not change server, RLS, or encryption-sync protocol.

Explicit Settings account erasure is the sole deliberate epoch exception: clearAccountAiSecrets requires an explicit captured owner, may run after automatic sign-out, and only deletes that frozen account/demo prefix across generations. It never reads plaintext or selects the current account dynamically.
