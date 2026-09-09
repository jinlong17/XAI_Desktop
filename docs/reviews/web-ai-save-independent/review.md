# AI conversation save recovery — independent acceptance

**PASS for mounted-page conversation recovery at 650f59c.** Includes d8fb98d. Source fixed with git archive; parent did not author these product edits. Actual AiChatModule, native Storage and real disk downloads; only remote completion stream is synthetic, with no provider request.

Replayed author infrastructure/oracles in a separate directory at 390 and 1440 CSS px and added an independent native delete-failure sequence. Both runs exited 0 with final PASS. These widths are repeated acceptance of the same feature, not independent suite totals.

- Initial seed failure preserves a stable conversation id and the complete latest transcript; a second send during failure updates it rather than persisting an empty store.
- New Chat cannot replace the unsaved transcript/input. Actual JSON file has the latest unsent input and four expected messages.
- Retry persists exactly one conversation with the same id; a subsequent send adds the expected two messages.
- Added check: failed deletion leaves original persisted bytes and all six bubbles visible; retry after recovery persists [] and only then clears the transcript.
- External newer data survives obsolete retry, while actual exported JSON contains the newer local draft.
- After switching A to B, stale retry/export changes neither account and creates no file; export error is visible.
- Recovery controls are at least 44px high and sit above the input without overlap. Actual 390/1440 screenshots were inspected.

Separate UI finding: at 390px, the fixed Insights/top controls overlap the first user bubble. This was visibly present in the fixed product screenshot and is assigned as a separate responsive fix; no claim of complete UI acceptance. Desktop recovery panel is readable. Device insights/voice preference failure behavior is not independently exercised by this native sequence and is not included in its PASS.

Run: `AI_WIDTH=390 AI_LOG=native-390.log node docs/reviews/web-ai-save-independent/verify-native.mjs`; repeat with AI_WIDTH=1440, AI_LOG=native-1440.log and AI_SCREENSHOT=1440px.png. Default product ref is fixed650f59c.

Boundaries: current mounted page only, no reload/crash/background continuation guarantee, no actual provider/tool execution, no atomic cross-tab transaction and no comprehensive accessibility certification. AI-02 business receipts remain separate ongoing work; whole REL-05 is open.
