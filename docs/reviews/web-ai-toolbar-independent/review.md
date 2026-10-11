# AI toolbar spacing — parent independent check

PASS for the reported first-message/toolbar overlap correction at fixed8865d17. Parent source diff review confirms CSS-only changes; no conversation or tool logic changes. Parent inspected author's390px after screenshot and768px measured evidence, then reran the original native geometry/scroll oracle independently at390px in this directory.

Observed toolbar bottom56, scroll viewport top74 and first bubble top86. Recovery/input/send targets are44px high, recovery and composer do not overlap, page width remains390. Added long conversation actually scrolls to at least50 while the clipping viewport remains below controls. Fixed snapshot source uses git archive; remote stream is synthetic. Real native Chrome screenshots and structured log retained.

Parent replay uses the author's original assertions, not an independently invented second suite. Author's768/1440 checks remain author evidence; parent independently re-executed the failing390px case. Narrow CSS correction is accepted, not complete AI UX or mobile keyboard/platform coverage. Original before geometry/image is retained in web-ai-mobile-toolbar-fix.

Run: AI_REF=8865d17 AI_WIDTH=390 AI_LOG=native-390.log AI_SCREENSHOT=390px.png node docs/reviews/web-ai-toolbar-independent/verify-native.mjs
