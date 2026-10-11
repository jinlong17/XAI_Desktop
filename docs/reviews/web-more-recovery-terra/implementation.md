# More15 caller implementation evidence

Implementation target: `packages/plugin-web-settings-rest/src/panes/morePane.tsx` under Astra's `fc56d5e` More15 contract.

## Scope

- Replaced all fifteen legacy `usePref` mutations with the public `usePrefAutosaveAsync` caller interface.
- Maintained owner separation: thirteen device fields and the two scoped account fields (`default_tag`, `default_list`).
- Added local per-field set/reset intent identity, retry/discard/source reload, sparse `more-draft.json` export, departure guard and beforeunload behavior.
- Reset Default now admits a captured active pane scope once, creates all fifteen typed `reset` intents before submission, and uses bound async `reset()` operations. It does not call raw `removePref` or write registry defaults.
- Added More-scoped recovery/control CSS and converted the two custom checkboxes to native buttons with names and pressed state.

## Author validation

Run after implementation:

```text
pnpm --filter @repo/plugin-web-settings-rest test -- --run src/__tests__/morePane.test.tsx
15 passed

pnpm --filter @repo/plugin-web-settings-rest typecheck
passed

pnpm --filter @repo/plugin-web-settings-rest lint
passed
```

The direct pane suite includes physical device/account removal, failed-remove recovery while the UI displays the default, stale reset refusal, account-B and unowned-byte preservation, and keyboard-accessible checkbox controls. Parent and Sol retain independent host/native acceptance ownership.
