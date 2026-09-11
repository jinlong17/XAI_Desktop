# Direct preference binding refresh at afbfb24

Same TypeScript AST scanner and tracked packages/**/*.tsx boundary as611062e; tests excluded. Every file read from fixed Git revision, not dirty workspace. Command: `node docs/reviews/web-d2-pref-binding-inventory/scan.mjs afbfb24`.

Counts: 27 files /72 binding sites /50 distinct literal keys /2 dynamic sites /52 setter bindings (49 direct,3 downstream-only) /20 read-only bindings.

Delta from611062e: exactly the eight Notifications rows removed; no additions, no unrelated removed rows. Dynamic sites and read-only count unchanged.

- xai_pref_notif_done_sound (`setDoneSound`)
- xai_pref_notif_enabled (`setEnabled`)
- xai_pref_notif_push_habit (`setPushHabit`)
- xai_pref_notif_push_pomo (`setPushPomo`)
- xai_pref_notif_push_task (`setPushTask`)
- xai_pref_notif_quiet (`setQuiet`)
- xai_pref_notif_quiet_end (`setQuietEnd`)
- xai_pref_notif_quiet_start (`setQuietStart`)

This tracks direct legacy usePref bindings only. It excludes wrapper/indirect/raw/ordinary/timer/secret/non-TSX writers and is neither a full writer count nor52 confirmed bugs. It does not accept Notifications or close D2/REL/full312; independent requirement evidence owns acceptance. Use the JSON rows as subsequent full-caller scheduling input after the current caller is accepted.
