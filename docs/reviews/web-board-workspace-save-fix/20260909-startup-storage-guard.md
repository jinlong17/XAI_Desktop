# Board startup storage guard — author evidence

## Fixed product snapshot

Product commit `034ef46` fixes the initialization path left open after
`1053463`. The Module had rendered a fallback board for a present invalid
payload, then allowed its defensive seed, automatic automation, manual
automation, or implicit active-board correction to persist that fallback.

The Module now captures the mounting account owner, physical board key, and
initial raw-key baseline. A seed is allowed only when that physical key was
absent at capture time and remains absent for the same owner. Before any
automation or implicit active-selection write, the shared guard checks the
captured owner/key, current physical bytes, `readBoardStorage` validity, and
equality with the rendered source. Present `null`, `[]`, parse failures, and
schema-invalid records remain untouched. Failed seed or automation writes show
an alert and do not mark automation as applied.

The existing Board behavior remains intentionally bounded: no cross-tab
compare-and-swap claim, no automatic board migration when deleting a workspace,
and no change to BoardCreator, card/list composer, Calendar, or AI paths.

## Package verification

| Check | Result |
| --- | --- |
| Focused Module regression | 89/89 passed |
| `pnpm --filter @repo/plugin-web-board-workspaces test` | 26 files / 309 tests passed |
| `pnpm --filter @repo/plugin-web-board-workspaces typecheck` | passed |
| `pnpm --filter @repo/plugin-web-board-workspaces lint --max-warnings 0` | passed |
| Existing author workspace recovery contract | 10/10 passed |

`BWM18b` stores each of the four corruption classes before mount, carries an
existing active-board id, and verifies byte preservation through mount,
automatic automation, and manual automation. It also verifies that the active
id is not replaced by the rendered default.

## Fixed-snapshot Chrome replay

The reviewer-owned Chrome runners were used without editing their fixtures or
assertions. All runs archive product commit `034ef46`; their output is retained
in this author evidence directory.

| Log | Result |
| --- | --- |
| `native-boot-corruption-034ef46.log` | 4 pre-mount invalid board payloads, 8 preservation assertions passed; board bytes and the empty workspace directory remained unchanged |
| `native-selection-source-034ef46.log` | corrupt source preserved and `valuable-board` active id remained unchanged |
| `native-astra-counterexamples-034ef46.log` | reviewer malformed workspace-create and malformed membership-delete plus recolor/delete retry: 4 passed |
| `native-author-contract-034ef46.log` | author create/rename/ordinary pick/A-to-B recovery contract: 4 passed |

These runs use an isolated local Chrome fixture and synthetic DOM events. They
are component-level browser evidence, not production SPA, account-sync, or
full REL-05 acceptance. Astra retains ownership of its independent assertions
and the broader release conclusion.
