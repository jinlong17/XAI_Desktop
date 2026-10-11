# Targeted Pomodoro recovery: real Chrome before/after

Parent fixed archives use actual Pomodoro, project CSS and isolated Chrome/CDP without an account marker.

- Source isolation: invalid sound plus two theme choices under a theme quota fault leaves latest violet locally and coral physically. External fixture repair changes sound to bell. Explicit Reload preferences must project bell with zero application writes while preserving violet and its recovery; restoring quota and actual Retry must save violet. Fixed [2b666ed FAIL](native-2b666ed-source.log) loses the unrelated theme; unchanged [7785e92 PASS](native-7785e92-source.log) preserves it.
- Conflict recovery: hold the real theme key Web Lock, select violet, replace raw with blue from another same-origin iframe, then release. Actual Discard conflicting preferences must adopt blue, clear this conflict and perform zero application writes. Fixed [2b666ed FAIL](native-2b666ed-conflict.log) has no recovery control; unchanged [7785e92 PASS](native-7785e92-conflict.log) supports the explicit discard.

[Fixture](native.tsx), [runner](verify-native.mjs). These targeted user recovery checks neither assert running-timer behavior nor durable unsaved drafts after process exit. Source repair is an external test action, not an application overwrite. Astra's component matrix and final contract review remain separate.

CSS scope clarification: this functional fixture imports token/layout CSS but directly imports PomodoroModule, bypassing the package-index import of Pomodoro styles.css. Its storage/control/download assertions do not constitute full-module layout evidence. The separate web-d2-pomo-recovery-visual fixture explicitly includes the module stylesheet. Original raw logs remain unchanged.
