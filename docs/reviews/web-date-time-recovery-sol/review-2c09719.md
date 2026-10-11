# Independent Date & Time recovery review — 2c09719

Independent verifier: Sol. Fixed product object: `2c09719`.

Original 6/6, core 5/5 and recovery 5/5 pass. The corrected advanced public matrix passes 7/8. Equal-value succession, pending Retry, real-lock conflict, targeted zero-write discard, source repair isolation, locked fresh owner export and full-denial all-five export pass.

One contract defect remains: after Time Zone physically commits `false` but its immediate readback throws, an external actor restores physical raw `true`. Clicking the public Retry action overwrites that newer `true` with stale `false`. The UI remains false, but the required changed-token conflict preservation is lost. This is a real-hook/physical-key failure; no private hook state is mocked.

The earlier queued equal-value version did not reliably force an intervening physical operation because the engine may coalesce pending intents. The committed test now performs Sunday success, Saturday success and later Sunday failure sequentially through public controls. It correctly fails at the old baseline and passes at this product object.
