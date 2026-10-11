# REL-01: Time Tracker idle day rollover

Independent diagnosis `58e2757` pins `58f4076` and demonstrates the actual six-consumer page: other consumers resample the date, while idle Time Tracker retains yesterday after midnight, focus and pageshow. The parent also added four rendered-module assertions before changing the product: midnight/focus/pageshow failed with `TodayJun 11h 00m · 1` after the clock had moved to June 2; explicit historical selection was the passing control (3 FAIL / 1 PASS).

Cause: TimeTrackerModule only updated nowMs during an active session's one-second interval or an explicit action. It had no idle day or browser-resume subscription.

Fix: subscribe to the existing useLocalDayClock (midnight, focus, pageshow, visible-page resume and periodic clock/timezone calibration), keeping the active-session one-second display updates. When the local day changes, a selection that followed today advances to the new today; an explicitly selected historical day remains selected. No persisted entry or interval is rewritten.

Parent validation: Time Tracker full package **11 files / 82 tests PASS**, including the original four new assertions unchanged (now 4 PASS); typecheck and lint exit 0. The existing range-delete test emitted React act warnings but passed; this does not claim native browser acceptance. Independent native after-verification is pending with the same verifier that recorded the before failure. REL-01 remains open until the entire numbered contract has sufficient evidence.
