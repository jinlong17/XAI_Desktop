# Pomodoro device migration: native baseline

Parent fixed archive `a2cdaa9`, real PomodoroModule in isolated Chrome with native Web Locks. [Before result](native-a2cdaa9-before.json): both planned cases fail. Mount seeds all six physical device keys; actual mute click writes while its physical-key lock is held. This corroborates the earlier component baseline and preserves the existing JSON representations.

[Probe](native-probe.ts), [runner](verify-native.mjs). This is preparatory evidence for Dv2, not implementation or acceptance. When both initial cases pass, the runner will close the complete Chrome process, reopen its isolated profile, and verify one final six-key device checkpoint. That final checkpoint is deliberately separate from the mount-absence case: later legitimate preference writes change the same device keys. The failing baseline has no reopen acceptance.

No running-timer or rollover behavior is tested here. The second case contains only idle account active/session byte controls after the device write; it does not replace the Dv2 completion/reset/partial-success contract. CSS is omitted. No product changed or timer/REL/D2 item closed.
