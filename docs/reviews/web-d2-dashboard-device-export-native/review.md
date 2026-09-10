# Device-only Dashboard recovery export: native before/after

Parent independent fixed git archives, real Chrome/CDP input, actual DashHeader with project CSS, isolated profile and download directory. No note editor is opened. A real mouse drag changes device position by 40; a scoped fault denies its setItem while the account note remains `Original note`.

- Fixed `f532ad5`: the recovery alert appears, but Export creates no JSON file. [Before](native-f532ad5.log), exit 1.
- Fixed `d129950`: Export creates a real JSON file, parsed from disk: kind `dashboard-note-draft`, note `Original note`, noteOffset `40`. Persistent device offset remains `0` because saving failed, and account bytes remain unchanged. [After](native-d129950.log), exit 0.

[Runner](verify-native.mjs), [fixture](native.tsx). This independently verifies the concrete position-only export regression and physical downloaded payload. It does not claim account cloud export, process-reopen persistence of unsaved position, or full-shell/device migration acceptance. Temporary profile/download files are cleaned after parsing; logs retain their payload, not user data.
