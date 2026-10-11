# AI Chat REL05 author fix and verification

Web module only. Product commits `d8fb98d` and `650f59c`; final native snapshot `650f59ce183ce875b20c44c99a45e27b98d4a477`. This is author verification, not independent acceptance or closure of all REL05/AI-02.

## Diagnosis contract preserved

Parent owns `../web-ai-save-recovery/save-contract.test.tsx`, its config and before log. Neither assertion was changed. Both now pass (`original-contract-after.log`). The second expectation is valid: after failed initial seed, sending another message after storage recovers must save the same conversation with complete messages. Returning an empty array when the active id is missing had hidden the failure.

## Implementation

- Package-local conversation recovery retains an exact pending record snapshot and raw baseline. A failed seed is kept under its original id; streaming updates and later sends extend the same pending transcript. Retry never calls the provider again or duplicates the conversation.
- A captured editing baseline includes the first write, not only retries. An external write before its storage event arrives cannot be paired with stale React data and overwritten. Conflict retains draft/export and original external bytes. Explicit discard refreshes canonical conversation rows, including when the external event has not arrived. No atomic cross-tab CAS is claimed.
- Failed delete/select retains the current UI and advances only after successful persistence. New/select/delete are blocked while there is unresolved recovery, a running stream, or unsent composer data. Latest input and attachment metadata remain exportable.
- Native JSON download includes pending records, latest messages/input, attachment metadata and pending preference choices; no auth/BYOK data. Captured account scope guards retry/export and existing stream callbacks. Account replacement aborts the old stream and clears private visible content.
- Device insights/voice toggles separately retain a failed desired boolean and baseline; Retry does not toggle twice. They remain device keys, with captured-account callback guards.
- Bilingual alert provides Retry, Export and explicit Discard. Discard is disabled during generation. The recovery row uses theme tokens and 44px controls.

## Evidence

- Full package: 32 files / 278 tests PASS, including 11 new focused cases. Types and lint PASS. Logs are stored here. This total is not independent coverage.
- Original parent regression: 2 unchanged assertions PASS.
- Fixed Git archive native Chrome 152 at 390 and 1440 pixels: actual AiChatModule, token/layout/module CSS, native Storage quota errors, actual downloaded JSON files parsed from disk. Each run verifies two failed sends and four exact message strings under one id; latest unsent input retained when New chat is attempted; Retry writes one id; a later successful send extends to six messages; conflict retry leaves external bytes unchanged; another real export contains the latest conflict response; A→B old retry/export cannot write B or create a file.
- Native screenshots and geometry: recovery controls 44px; recovery remains above composer at both widths. 390px screenshot was visually inspected. This is recovery-panel validation, not a complete AI Chat visual/accessibility audit.

The native harness replaces only `claudeStreamAdapter.ts` with a deterministic synthetic stream during bundling. All other workspace imports use the fixed Git archive. No real provider, server account, token or user browser profile is used. Component tests cover delete/select/late-stream and preference failure semantics; those are not asserted as native pointer end-to-end flows. The original native preliminary run at `d8fb98d` was superseded by both final fixed runs.

## Reproduction

```sh
pnpm --filter @repo/plugin-web-ai-chat test
pnpm --filter @repo/plugin-web-ai-chat typecheck
pnpm --filter @repo/plugin-web-ai-chat lint
node packages/plugin-web-ai-chat/node_modules/vitest/vitest.mjs run --config docs/reviews/web-ai-save-recovery/verify.config.mjs
AI_REF=650f59c AI_LOG=native-390.log AI_SCREENSHOT=390px.png node docs/reviews/web-ai-save-fix/verify-native.mjs
AI_REF=650f59c AI_WIDTH=1440 AI_LOG=native-1440.log AI_SCREENSHOT=1440px.png node docs/reviews/web-ai-save-fix/verify-native.mjs
```

## Open boundaries

Recovery is mounted memory. Closing/reloading, a crash or leaving through the host route can lose unsaved drafts; there is no durable journal/import flow here. Browser closure stops browser-side AI work. Synchronous baseline checking does not solve cross-tab atomic races. Initial read failures/malformed schema repair remain separate; the recovery writer refuses destructive repair. Tool execution confirmation is not a business persistence receipt: no successful Tasks/Calendar write acknowledgement is established by this change. Provider, production deployment, cross-vendor workflow and complete AI feature acceptance remain unverified.
