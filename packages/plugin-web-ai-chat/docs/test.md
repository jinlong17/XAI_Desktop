# REL-03 AI test evidence

- `pnpm --filter @repo/plugin-web-ai-chat test`: 31 files / 267 tests PASS (2026-09-09).
- `accountSecrets.test.ts`: A/B/demo isolation; committed-marker enforcement; corrupt envelope preservation; delayed KDF save/load invalidation; prior-generation copy+rollback; verification fault retention; explicit v1 adoption; demo rejection; conflicts; connection-test abort.
- `accountAsync.test.tsx`: owner changes during key loading cause no fetch; pending confirmation cannot emit an old tool; delayed chunks from an abort-ignoring transport do not render under B.
- Existing adapter/protocol/module tests now initialize explicit test-account scopes and seed/read the physical scoped keys. Their prior behavior scenarios and assertions are retained; production never auto-activates this fixture scope.
- `no-plaintext-key.test.ts` checks v2 ciphertext and localStorage for absence of the synthetic plaintext, including owner metadata.

Tests use fake IndexedDB plus actual WebCrypto, synthetic keys and mocked HTTP. They do not prove real Supabase identities, browser-level cross-tab behavior, migration UI, all-repository isolation, or overall REL-03 completion. Parent/independent verification must exercise the combined storage/host/AI integration and commit marker faults.
