# Seed Brief — xai-web-settings-account-delete-wire

| 字段 | 值 |
|---|---|
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #9 (W2) |
| 父 Brief | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 6 (split-6c) |
| 父 ADR | ADR-0009 §D2-G3 |
| 候选包 | packages/plugin-web-settings-rest (#24 SHIPPED) — wire to web-auth-device-session (SHIPPED platform spine) |

## Requirement (1-3 sentences)

Replace the Account-delete confirm modal's current no-op (emits `web:settings:rest:account-delete-confirmed` event with no listener) with a real deletion flow that calls `web-auth-device-session`'s account-delete endpoint, clears all local `xai_*` storage keys, and redirects to landing page. The confirm modal must require typing "DELETE" (case-sensitive) before the destructive button enables.

## Hard Constraints

- Use `web-auth-device-session` SHIPPED platform spine for the actual deletion call. Do NOT introduce a parallel auth path.
- Confirm modal: 2-step gate — (1) "Are you sure?" with cancel/continue; (2) type-the-word gate ("Type DELETE to confirm"). Cancel button on both steps; submit only enabled on step 2 after exact match.
- On successful deletion: (a) call `web-auth-device-session` delete endpoint; (b) on 200: clear all `xai_*` localStorage keys (use the registered key list from `plugin-web-storage`'s registry, not a wildcard wipe — to avoid clearing unrelated browser data); (c) clear IndexedDB caches (`web-encrypted-indexeddb-cache` SHIPPED — call its `clearAll()`); (d) redirect to `/` (landing page).
- On failure: surface error (network / 401 / 403 / 500) with clear messaging; do NOT proceed to local-clear if backend deletion failed.
- The existing `web:settings:rest:account-delete-confirmed` event should be DEPRECATED — emit it for one release for backward compat, then remove in P1.
- Mock-auth mode (`VITE_WEB_AUTH_MODE=mock-authenticated` per ADR-0008): skip the real backend call, just do local-clear + redirect. Display a banner "Mock-auth delete (no real backend)".
- Per ADR-0009 D4: P0 work. Smallest of the 6a/6b/6c sub-rows.

## Acceptance Signal

- Click "Delete Account" → step 1 modal → click "Continue" → step 2 modal.
- Type "delete" (lowercase) → submit button stays disabled.
- Type "DELETE" → submit button enables.
- Submit (in mock-auth mode) → local-clear → redirect to `/` → reload → auth state is clean.
- Submit (in real auth mode) → calls backend delete endpoint → on success behaves as above.
- Network failure mid-deletion shows clear error; localStorage NOT cleared.
- All 81/15 existing settings-rest tests still PASS; new tests cover 2-step gate + type-match + mock-auth path + failure path.
- Verify Cross-vendor: Codex cold-read confirms (a) no localStorage wipe before backend confirms success, (b) type-match is case-sensitive, (c) IndexedDB clear is comprehensive.
