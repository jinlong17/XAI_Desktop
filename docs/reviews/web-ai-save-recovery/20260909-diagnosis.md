# AI conversation save failure diagnosis

Module: web. Product snapshot: 88fd5c1. Actual AiChatModule and account-scoped localStorage run in jsdom; only the response stream is synthetic. No provider/network call is made.

Two correct business assertions fail (before.log, runner exit 1):

1. A quota failure on the initial xai_ai_convos write leaves rendered messages but no visible unsaved alert.
2. After removing the fault and sending a second message, persisted conversations remain empty instead of containing the conversation and latest message.

The test first verifies real .ai-msg bubbles and an empty physical account key. A preliminary diagnostic used an incorrect .msg selector; that setup error was corrected before collecting this evidence and is not counted as a product defect.

Source: AiChatModule ignores setRawConvos results while seeding a conversation and sets activeConvo anyway. Subsequent persistConvoMessages returns the unchanged array when that id is absent. Storage recovery therefore cannot recover the missing seed through ordinary subsequent sends. New/select/delete callbacks also require review because they clear or replace local state around unchecked writes.

Reproduce: node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-ai-save-recovery/verify.config.mjs

This is component-level failure evidence, not native browser acceptance or background execution verification. Repair must preserve latest content, expose failure/retry/export, avoid duplicate ids, reject stale-account callbacks and newer-data conflicts. Full REL-05 remains open.
