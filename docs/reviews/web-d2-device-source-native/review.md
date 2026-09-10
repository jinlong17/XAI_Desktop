# Device position source recovery: native before/after

Parent fixed git archives, actual DashHeader with project CSS in isolated Chrome. Two independently mounted scenarios: stored JSON `null`, and getItem denied for a valid physical `70`. The fixture counts application writes to the device key; the explicit external repair uses the original storage method separately.

- `68ea7a3`: both scenarios retain bytes with zero application writes, but no recovery alert appears. [Invalid before](native-68ea7a3-invalid.log), [unavailable before](native-68ea7a3-unavailable.log), both exit 1.
- `a572381`: both display recovery. After external repair to80 and explicit Reload note position, the alert clears, visual position is80px, physical bytes are80, and application writes stay0. [Invalid after](native-a572381-invalid.log), [unavailable after](native-a572381-unavailable.log), both exit 0.

[Runner](verify-native.mjs), [fixture](native.tsx). This confirms the real user recovery action is a reread, not default seeding, reset, or overwrite. It does not claim to repair corrupted data automatically. The original five native drag/account/lock cases also PASS at a572381, including four saved-position Page.reload checks: [log](../web-d2-device-offset-native/native-a572381.log). No whole-process survival of an unsaved drag is claimed.

Astra's unchanged source3/device13/account-note11 and full contract acceptance remain separate. No numbered item is closed by these native results alone.
