# REL-04: durable timer lifecycle follow-up

Product snapshot: `6887879`. Parent review found documentation drift: the original inventory lists 114 keys (38 account, 76 device); the current ownership source has 116 (40 account, 76 device). The two additions are `xai_pomodoro_active` and `xai_meditation_active`. Both already have typed registry and account ownership declarations. No runtime omission was found in their raw export or local deletion routing.

Added two business-boundary regression cases to `accountDataLifecycle.test.ts`, one per new key. Each verifies that captured A exports only current-generation bytes, including damaged JSON unchanged; deletion erases current and prior A generations; B remains ready with unchanged timer bytes; unassigned timer originals and device audio preferences remain; and deleted A cannot obtain a new writable account key. This uses the real lifecycle APIs with jsdom localStorage. It is not a native download, a live timer-controller race or production account-deletion test.

Validation: `pnpm --filter @repo/plugin-web-storage test -- src/__tests__/accountDataLifecycle.test.ts` — 1 file, 6 tests passed, exit 0 (the four existing cases plus the two added cases). Current ownership JSON was generated directly from the pinned source declarations. Historical inventory JSON and its 38-key probe remain unchanged; they are not asserted as current acceptance evidence.

REL-04 remains open. Validated legacy adoption, the complete deletion participant chain and failure/concurrency handling require their own evidence. This change reconciles the inventory and adds specific export/erasure regression coverage; it does not close those wider contracts.
