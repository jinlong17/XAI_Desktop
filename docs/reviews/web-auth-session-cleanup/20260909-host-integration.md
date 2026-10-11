# Generation-owned authentication host integration

Live Supabase configuration now selects the generation coordinator in the React session provider. The config-less injected client remains the explicit mock-auth path. Login, signup, OAuth, reset and callback UI call the coordinator rather than mutating a shared SDK session. The host memoizes its build-time configuration so ordinary renders do not replace the coordinator.

Business identity is gated before asynchronous cleanup. Cleanup captures the originating generation and owner; a stale A completion neither clears B nor redirects B. An error hides authenticated clients and business routes, preserves stored data and offers explicit recovery. The error latch is tested after delayed SDK callbacks, not only immediately after a failed operation. Sign-out failure is displayed above the account storage gate, whose children can unmount during cleanup.

DeviceSessionBridge invalidates both rendered fetch context and already captured fetch functions when auth status, token or generation-bound cleanup changes. It checks again after asynchronous context construction, immediately before network dispatch, and after the response. Already sent requests cannot be undone. The five independent component assertions in `independent-device-bridge/` cover these boundaries; they do not establish production device-service acceptance.

## Parent verification, 2026-09-09

- Auth package: 18 files, 137 tests PASS, including two managed-provider tests using the actual SDK with synthetic HTTP and IndexedDB fault injection.
- Web package: 27 files, 146 tests PASS, including captured cleanup, failed logout visibility and superseded completion behavior.
- Auth and Web type checks, Web lint, `git diff --check`, and Web Vite production build PASS.
- Coordinator dependency: `d895b0b`, with native coordinator evidence in `23c3423`. Root UI/provider integration has not yet received independent native full-page acceptance.

Counts overlap focused checks and are not a total coverage measure. No production deployment or real account/provider flow was exercised. OAuth code consumption followed by failed local persistence remains an explicit recovery failure, not a fabricated successful login. Complete REL-06 deletion/result-query and cleanup-participant acceptance remains open. UI styling and localization are not closed by these functional changes.

## Follow-up: outer route error ownership

Independent actual-host verification found that the router's AppRouteGate unmounts the whole App on an auth error. Keeping sign-out failure state above AccountStorageGate inside App was insufficient: the user only saw a generic restore failure. The failure marker now belongs to the session provider above both gates. A late host result reports into that provider and the protected route displays “Sign-out did not complete.” Recovery or a newly published non-error auth state clears the marker. Focused provider tests include the outer gate and verify failure after protected children are removed, then successful recovery; 3 managed-provider and 7 host sign-out tests, Web types/lint pass. Original native explicit-message assertion remains pending independent rerun, not weakened to accept generic text.
