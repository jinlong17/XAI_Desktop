# Complete caller: Settings Appearance, its seven dimensions, the Topbar quick switcher and the App root-preference writer

**Revision log** (newest first).
- **r3 (2026-10-04, batch 36): user decision two (always shown, disabled when nothing can be retried) and controller ruling 5.** The product owner decided that Retry all is always shown and is disabled when nothing can be retried. Controller ruling 5 requires a Sol oracle for the inherited ordering of Features follow-up 2 that asserts both the transient write sequence and the final bytes (control plane `51db323`, CP-APPEARANCE-01 rows "用户决定二" and "总控裁定（r2 开放问题 2–6）"). Rulings 1–3 (the copy, a non-sticky area and a start-aligned area) and the Retry-all-only pet gate stay as in r2. No evidence depended on r2. Changed sections:

  | Section | Change | Reason |
  | --- | --- | --- |
  | Header | This entry, with the log now newest first and the r2 entry given its commit; the designer line; the r3 docs head with an empty product diff; source rows for three newly cited protected files; Status and Authority name decision two and the rulings | Record the decision and pin the new citations |
  | A2 (decision text) | One bullet records decision two | It refines the product owner's B-2 decision |
  | A2.1 | `aria-describedby` only while the button is enabled or a pass is open; the label never changes when disabled | The button now also renders while the status line is empty or unrelated |
  | A2.2 | Rewritten: always rendered; enabled if and only if E is non-empty; disabled through `aria-disabled="true"`, never `disabled`; a Tab stop in every state; inert while disabled; no description outside a pass; one neutral, legible and hit-testable disabled look with a visible focus ring | Decision two, with accessibility semantics precise enough to freeze oracles |
  | A2.4 rule 2 | The export-failure line applies only while a draft exists | Otherwise a clean state could show a failure line beside the always-visible disabled button |
  | A2.5 | Focus stays on Retry all when a pass disables it; no enabled/disabled transition moves focus | The button no longer unmounts, and native `disabled` would drop focus to `<body>` |
  | A2.7 | A Tab stop and a focus indicator in both states; inert while disabled; the description rule | Accessibility of the disabled state |
  | A2.8 | The gate runs in every state, enabled and disabled | The button always renders |
  | §5 | Item 7 precedence wording; item 9 render states, clean-state status line, feedback, focus and the ruling-5 ordering; the Retry all selector; a wording note | Testable requirements and frozen copy rules for the disabled state |
  | §9 | Host row o (focus); new host row s (disabled states and transitions); the presentation states; the R-PET clause; sizing and the disabled rule set; a measured disabled presentation; screenshots; keyboard | Host, visual and keyboard coverage of the disabled state |
  | §11 | The AC-SAVE-1/2 replacement and the required Appearance-local tests | The clean state now renders a disabled Retry all |
  | §12 | The `queues` and `retry-all` rows; the inherited-ordering oracle with four named cases; the parent host baseline; native before; validity; new H17 | Before evidence for the disabled state, and ruling 5 |
  | §13 | Gates 3, 5 and 9; acceptance conditions | Gate coverage of the disabled state and of ruling 5 |
  | §14 | E2, E3, E4, E7, E8, E12, E14, E15 and E26 | One contiguous checklist, still E1–E27 |
  | §15 | The R-PET, D3, follow-up 2 and focus rows; one new row for r2's disabled-state concern | Lessons converted for decision two and ruling 5 |
  | §16 | Retry all limits | Bounds decision two |

  Unchanged: §1–§3; the texts of A1 and A3–A9, byte-identical to r2; A2's terms, A2.3, A2.6 and A2.9; the D-notes; §6, §7, §8 and §10. A8 still follows §11, and A9 still follows §9, where only the Retry-all-only R-PET clause changes. Counts: H1–H17 (H17 is new), gates 1–10, E1–E27.
- **r2 (2026-10-04, batch 35, `b2e5eb2`): B-2 resolved by the product owner as option (ii).** Autosave stays. The bottom button stays, but it changes from the no-op "Save & apply", which always flashes "Saved", into a real "Retry all" (control plane `2f728f1`, CP-APPEARANCE-01 user-decision row). No evidence depended on r1. Changed sections:

  | Section | Change | Reason |
  | --- | --- | --- |
  | Header | r2 docs head with an empty product diff; source rows for the protected files that A2 cites; A2 recorded as the product owner's decision; the decision added to Authority | B-2 is no longer an assumption, and the new citations need fixed hashes |
  | §1 | Order step 2 and the parent role confirm A1 and A3–A9 only. One risk bullet for Retry all. The final regression runs §13 row 10 and writes E27 | A2 needs no controller confirmation; one gate and one evidence item were added |
  | §3 items 4, 9, 12 | Exact facts of today's bottom button (what it emits, what App writes, the unconditional flash, its sticky inline-end placement) and of the pet's geometry | Option (ii) repurposes that button, so its before behaviour and placement must be ready for oracles |
  | §4 heading and A2 | The heading now separates A2 from the assumptions. A2 is rewritten: autosave is kept, and "Save & apply" becomes a real Retry all, defined in A2.1–A2.9 | The product owner chose option (ii) |
  | §5 | Interface and item 7 notes; new item 9 (Retry all coverage); two selectors; new wording | Testable requirements and frozen copy for Retry all |
  | §6 | Reset sits in the A2.8 bottom action area; the "Retry of a reset draft … never writes" sentence is scoped to failed removals, with the inherited follow-up 2 exception named; new paragraph on Retry all over reset drafts | Failed reset items are in Retry all's scope, Reset shares the bottom area, and the scoping removes a contradiction with the inherited ordering |
  | §7 | Lifetime and protection items 2, 3, 4 and 6 cover an open Retry all pass | Retry all meets the Topbar status, unload, sign-out and unmount |
  | §8 | Export during an open pass | Pending members are unresolved intents |
  | §9 | Host rows o–r; Retry all states, placement gate, sizing, screenshots and keyboard | The host, native, visual and keyboard layers of Retry all |
  | §10 items 7, 9 | Retry all joins the isolation list; the package must contain no `SettingsFooter` and no `pane-footer` or `pane-save` class | Retry all must not broadcast, the shared footer must be gone, and its sticky classes must not return |
  | §11 | A fourth internal module; the docs requirement; the AC-SAVE-1/2 dispositions; required Retry all tests | A pane-local vehicle; the Save tests are replaced by Retry all tests |
  | §12 | New Sol mode `retry-all`; host and native before cases; H14 revised; H15 and H16 added; a validity note | Before-failure evidence for today's button and for Retry all |
  | §13 | Gate 1 wording; gate 5 covers rows a–r; new gate 9 (Retry all); the final regression becomes gate 10; acceptance conditions | One gate collects every Retry all item |
  | §14 | E2, E3, E4, E7, E12, E14 and E15 extended; new E26 (native Retry all); the receipt becomes E27; gate columns updated | One contiguous checklist that covers Retry all at every layer |
  | §15 | Rows for R-PET, Features follow-ups 2 and 3, focus and the D3 contrast | Lessons converted for Retry all |
  | §16 | Retry all exclusions | Bounds the decision |

  §2 and the texts of A1 and A3–A9 are unchanged. A8 follows §11 and A9 follows §9, as before; §9's R-PET block gains one Retry-all-only clause that A2.8 introduces, and the rule for every other control is unchanged.
- **r1 (2026-10-04, batch 34, `e9fbdb7`).** First draft, written for B-2 option (i): autosave, with the bottom button removed.

Contract designer: Astra role (risk, design and final decision), executed by an independent Claude Opus 5.5 instance in an isolated detached worktree. Module `web`, 2026-10-04, control-plane batch 34. Revised as r2 in batch 35 by a different independent Claude Opus 5.5 instance (Astra role), and as r3 in batch 36 by another independent Claude Opus 5.5 instance (Astra role). Control-plane item: `CP-APPEARANCE-01`, registered at `a4aff57` in state `diagnosis_needed`; it takes effect as an execution item only once the controller confirms this revision.

**Fixed product and source equality.**
- Fixed product: `5cd63ff652f02a2c726187fe12cbc796218d31c0` (`5cd63ff`, tree `404bf819a42e20b3e4d372c18a981832ccd54954`). The contract was authored at docs HEAD `ead985d` and revised at docs HEADs `2f728f1` (r2) and `51db323` (r3). For each of these heads, `git diff --name-only 5cd63ff <head> -- apps packages package.json pnpm-lock.yaml` is empty.
- Lockfile SHA-256: `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`.
- From `f359be6` to `5cd63ff` only 11 files under `packages/xai-web-settings-features-panel/` changed. The Appearance package, `xai-web-shell`, `apps/web`, `plugin-web-storage`, `plugin-web-tokens`, `plugin-web-settings-shell`, `core`, `xai-web-event-bus`, `xai-web-pet` and `xai-web-cmdk` are byte-identical between the two products.
- The unit's source at `5cd63ff`:

| File | SHA-256 | Last change |
| --- | --- | --- |
| `packages/xai-web-settings-appearance/src/AppearancePane.tsx` | `552eb224c5103d1c0d0ee878420f8a586ee91575dd8461f908de1147cf2b08c3` | `61f6177` (2026-05-23) |
| `…/src/internal/appearancePane.tsx` | `34b938200d1a43a9e73b1e5e6397ed7014ca763abb5082040d72cd309f43309c` | |
| `…/src/types.ts` | `18d5894e6603427f933100f9030d6e403c03abc57d9bd561f372b0b4f559f6d6` | |
| `…/src/index.ts` | `10bfbed11749e9c65fc3c2d40d0a50e177154254ef83a2e0690c693aeb4dc776` | |
| `…/src/styles.css` | `1b17d1f442905e255eae53e4e16a01c02b4a912ed6a1482231e8db5e50d5927c` | |
| `apps/web/src/App.tsx` | `5d10dba6a879cf0d42f224e58ef70637bd82b71dc1318ee99c4567977638fb59` | `ef97c1f` (2026-09-09, after web-auth `cfc2d6d` and `10a90ce`) |
| `packages/xai-web-shell/src/Topbar.tsx` | `70ba299e4d8a088ba0d085272fbc4cfe95933265bd6066fb59ae5cdae3de5297` | `ea234c0` (2026-06-02) |
| `packages/xai-web-shell/src/Shell.tsx` | `7d46423f40adc5412f54b701c2c93ab4f7529e329dc22766f387d78f614f8df0` | |
| `packages/xai-web-shell/src/types.ts` | `92b68b2ba5da830bd8dcdfe33652b2b440eaef72b8665ccd868d5f49d82b73de` | `ce391ea` (2026-06-09) |
| `apps/web/src/routes/modules/departureCoordinator.tsx` (protected) | `0844a697b146b07fceb1835da7c4410db8812bc07bdea362f3386e991a2bc075` | F1 repair `f359be6` |
| `packages/plugin-web-settings-shell/src/SettingsFooter.tsx` (protected; cited by A2) | `afecc734e7a96a8f7d289de2c3f6def5a1391c72e59f2fa61700f67a691c76ce` | `f637a3d` (2026-05-23) |
| `packages/plugin-web-settings-shell/src/types.ts` (protected; cited by A2) | `513f90fd05ef66f6f8fb1aaa230e9a6844407ae44cf3d7a1d8508c4eabfb4522` | `2bbc696` (2026-09-09) |
| `packages/plugin-web-settings-shell/src/styles.css` (protected; cited by A2) | `e5369cc7ed3a20650465e001537c7714a3715834d678ea17ff3960fbd3992166` | `8df4813` (2026-06-09) |
| `packages/xai-web-pet/src/DesktopPet.tsx` (protected; cited by A2) | `35edb0e686bf6682192ba1bbe7842d159e161a6593b7ccd13a432d59fe58ad6f` | `7a3d712` (2026-06-03) |
| `packages/xai-web-pet/src/pet.css` (protected; cited by A2) | `6326d822b654a22bcad361e57d02413d4569eadf8058f89d90fc3dd43249dcfe` | `8df4813` (2026-06-09) |
| `packages/plugin-web-storage/src/internal/usePrefAsync.ts` (protected; cited by A2) | `541fae97413104b8db90c20d7b565a5492f17fc74d79b3e975f954d7189a4491` | `b9ae2d9` (2026-09-10) |
| `packages/plugin-web-tokens/src/tokens.css` (protected; cited by A2.2) | `7c6eddebd1d826f939862ef75ba8159e966f0c76b0b9d34a0911f6b47265615d` | `1be1107` (2026-06-04) |
| `packages/plugin-web-countdown/src/internal/CountdownEditDialog.tsx` (protected; cited by A2.2 as precedent) | `6bcf6295989381101f99a53c1624db8f491c845c1d6debc6e550d7e04a1afdae` | `179e6d5` (2026-09-09) |
| `packages/plugin-web-ai-chat/src/ErrorBanner.tsx` (protected; cited by A2.2 as precedent) | `7cf751dd321f3cdd490984d62ce49c563a3d1aaecf0b229d8fa203e39bb1fbc2` | `9209aa4` (2026-05-25) |

  Package trees: Appearance `ce183d17e8606067c3bc97d7e3b6645ee656fe9e`, `xai-web-shell` `0f0fed40fe94a9de5c79eb273d1103757a807a9c`, `apps/web` `2fbf99f3ebea93b2ac136727267639790ecf3f4a`.

**Status.**
- This contract specifies the next ordered implementation unit after the accepted Features caller (`ec55f9e`).
- It does not authorize implementation. It accepts nothing, changes no formal count and closes no 312 item.
- Its scoping decisions A1 and A3–A9 (§4) are **assumptions awaiting controller confirmation**. They correspond to the (a) pre-decisions B-1 and B-3 … B-9 of the selection memo.
- A2 records **two product-owner decisions** of 2026-10-04. B-2 (SET-02's "统一自动保存或编辑后保存语义") was resolved as option (ii), and decision two makes Retry all always shown and disabled when nothing can be retried (A2.2). The controller checks that this revision implements them; it does not re-decide them.

**Authority.**
- **Product-owner decision:** control plane `2f728f1`, CP-APPEARANCE-01 table, user-decision row (B-2, option (ii): keep autosave, keep a bottom button, make it a real "全部重试").
- **Product-owner decision two and controller rulings:** control plane `51db323`, CP-APPEARANCE-01 table. The "用户决定二" row makes Retry all always shown and disabled when nothing can be retried. The "总控裁定（r2 开放问题 2–6）" row keeps r2's copy, non-sticky area and start-aligned area (rulings 1–3), and its ruling 5 requires a Sol oracle for the inherited ordering of Features follow-up 2 (§12).
- **Selection:** [selection-5cd63ff.md](../web-next-caller-selection/selection-5cd63ff.md), candidate B; §7.2 B-2 lists the three options.
- **Scheduling:** [remaining-writers.md](../web-date-time-recovery-contract/remaining-writers.md). Line 16 requires Appearance's "read-only hook bindings … explicit `setPref`/`removePref`, local shell application and reset across dimensions" to be audited across normal, reset and application flows. Line 25 requires genuinely shared producers in one contract.
- **Inventory:** [refresh-5cd63ff.md](../web-d2-pref-binding-inventory/refresh-5cd63ff.md) and `bindings-5cd63ff.json`: the pane's three read-only rows (`AppearancePane.tsx:52, 53, 55`). Every other writer and reader in §2 lies outside the scanner's boundary.
- **Precedents:**
  - The [Features contract](../web-features-recovery-contract/contract.md) is the structural template: device-only, a pane-scoped recoverable reset, and native evidence in the production `App` composition.
  - The [Sticky contract](../web-sticky-recovery-contract/contract.md) supplies device continuity.
  - The [More contract](../web-notifications-recovery-astra/next-more-contract.md) supplies the set/reset export envelope.
  - The [F1 impact review](../web-sticky-recovery-f1/impact-review.md) supplies the coordinator regression oracle.
  - [`blocked-f359be6.md`](../web-sticky-recovery-acceptance/blocked-f359be6.md) §4 is the G1 lesson (§14 here).
  - [`review-fb002.md`](../web-more-recovery-fb002/review-fb002.md) is the F-B002 lesson (§12, E24).
  - [Features acceptance](../web-features-recovery-acceptance/acceptance-5cd63ff.md) §5.1 is the R-PET ruling (§9, A2.8), §5.4 the D3 ruling that A2 departs from by the product owner's decision (§15), §5.5 the E6 lesson (§11), and §8 the follow-ups converted in §15. The R-PET reproduction is [review-visual-keyboard-5cd63ff.md](../web-features-recovery-native/review-visual-keyboard-5cd63ff.md) §10.

## 1. Roles, order and risk

| Role | Executor | Boundary |
| --- | --- | --- |
| Parent / controller | Claude controller | Scheduling and the contract check, including confirming A1 and A3–A9 and checking A2 against the product owner's decision. Also runs the production-App jsdom host baseline, native/browser verification, the Appearance F1-shape runner, the frozen F1 runners, the affected-caller native rerun and the ledgers. |
| Sol | New independent Opus-class instance | Freezes business oracles against an immutable `5cd63ff` archive before any implementation, then reruns them unchanged on the fixed product. |
| Terra | Implementation instance; Opus-class recommended at this risk | The complete caller, inside the §11 files only. Starts after every before baseline (E1–E5) is frozen and the controller authorizes it. Records its own test run at the reserved path (§11, E6). |
| Final regression | New instance, distinct from Terra and Sol | Runs §13 row 10 and writes the §14 E27 receipt. |
| Final acceptance | New instance, distinct from this author, Terra, Sol and the final-regression verifier | Reconciles every §13 row and every §14 item: source → correct before failure → fixed independent result → actual surface. |

**Exclusions by role.** Luna gets no task: persistence, the async queue, the host, the shell, cross-module isolation and acceptance are its forbidden zones. Spark is never assigned.

**Order.**
1. Contract.
2. Controller check of this revision, confirmation of A1 and A3–A9 (A2 is the product owner's decision, selection memo §7.2 B-2 option (ii)), and registration.
3. Frozen before baselines (E1–E5): Sol oracles, the parent production-App host baseline, native before, and the Appearance F1-shape before log.
4. Terra implementation.
5. Sol fixed reruns.
6. Parent host, native, F1-shape and frozen F1 verification.
7. Affected-caller reruns and the final regression receipt.
8. Independent acceptance.

Do not run another caller concurrently.

**Risk: high (confirmed).**
- **What device-only ownership removes:** account-scoped physical keys, the account lifecycle lock, private-owner admission, committed-marker, tombstone and recovery admission, the private-draft disposal boundary and mixed-owner reset batches. All seven keys are explicit device keys.
- **What still makes this unit high risk:**
  - **whole-application failure:** one malformed root byte may make every `/app` route render the route error boundary (H6), and Settings, the repair surface, lives inside that route;
  - **three genuinely shared producers** in three places (pane, App subscriber, Topbar), including the protected host sign-out preflight;
  - **App-lifetime drafts** with no existing route-independent host seam; a Topbar draft can exist on any route;
  - **global re-rendering:** a language draft re-renders the whole application, and theme, density, font scale, accent, background and rail position restyle every page;
  - **cross-document** live updates, which the root keys have never had;
  - asynchronous same-field queue attribution across two surfaces, a dual-field background choice and slider streams;
  - a bulk Retry all over up to seven fields, whose attempts, attribution and status must stay per field (A2);
  - a six-field reset batch;
  - host and shell edits that every accepted caller renders inside;
  - memory-only export under total storage denial;
  - native evidence in the production `App` composition, including the App-level DesktopPet (R-PET).

## 2. Exact ownership inventory

**The unit.** It consists of:
- `packages/xai-web-settings-appearance/src/AppearancePane.tsx`: seven dimensions, their live handlers, "Save & apply" and Reset (`:48–426`);
- the App root-preference state and writer in `apps/web/src/App.tsx`: raw reader `readLocalPref` (`:86–96`), raw writer `writeLocalPref` (`:98–105`), lazy root state (`:128–131`), legacy reads of the three registered keys (`:135–140`), the `web:settings:preference-changed` subscriber (`:146–157`), DOM application (`:160–174`) and the sign-out preflight (`:189–217`);
- the Topbar quick switcher in `packages/xai-web-shell/src/Topbar.tsx` (`persistAndSet`, `:26–39`; choices `:102–104`) and its pass-through in `Shell.tsx` (`:73–83`).

**Naming and sources.**
- Field ids are the `WebPreferenceChange` keys (`packages/core/src/types/events.ts:20–27`).
- Ownership comes from `accountOwnership.ts:5, 14, 48, 62, 66, 104, 107`. For a device key the physical key equals the logical key (`accountScope.ts:66–67`).
- Registry entries exist only for the three registered keys (`registry.ts:146–171`).
- Labels come from `plugin-web-tokens` (`i18n.ts` EN `:98–101, 119, 121, 123`; ZH `:415–418, 436, 438, 440`).

| Field id | Controls | Label EN / ZH | Physical key | Codec and exact bytes | Strict domain | Default |
| --- | --- | --- | --- | --- | --- | --- |
| `lang` | Pane segments English / 简体中文 (`AppearancePane.tsx:225–240`); Topbar `menuitemradio` English / 中文 (`Topbar.tsx:160–179`) | Language / 语言 | `xai_pref_lang` | JSON: `"en"`, `"zh"` (with quotes) | `"en"`, `"zh"` | `"en"` |
| `theme` | Pane `.theme-card` ×3 (`:248–267`); Topbar ×3 (`:181–203`) | Theme / 主题 | `xai_pref_theme` | JSON: `"light"`, `"dark"`, `"system"` | those 3 | `"light"` |
| `density` | Pane segments ×2 (`:275–290`); Topbar ×2 (`:205–226`) | Density / 密度 | `xai_pref_density` | JSON: `"comfortable"`, `"compact"` | those 2 | `"comfortable"` |
| `fontScale` | Pane range 0.85–1.15, step 0.05 (`:401–416`) | Font scale / 字体大小 | `xai_pref_font_scale` | JSON number, `JSON.stringify(v)`; slider stops `0.85`, `0.9`, `0.95`, `1`, `1.05`, `1.1`, `1.15` | finite number with 0.85 ≤ v ≤ 1.15 | `1` |
| `accentHue` | Pane swatches ×6 and range 0–360, step 1 (`:298–331`); also written by a background choice | Accent color / 主题色 | `xai_accent_hue` | Registry `number` codec, `String(n)`, for example `230` | integer with 0 ≤ n ≤ 360 | `165` |
| `railPos` | Pane `.rail-pos-card` ×4 (`:368–393`) | Sidebar position / 侧栏位置 | `xai_rail_pos` | Registry `string` codec, raw, for example `left` | `left`, `right`, `top`, `bottom` | `"left"` |
| `bgTone` | Pane `.bg-tone-card` ×6 (`:339–360`) | Background palette / 背景调子 | `xai_bg_tone` | Registry `string` codec, raw | `default`, `cream`, `mist`, `lavender`, `peach`, `graphite` | `"default"` |

**Domain enforcement is caller-only.**
- The JSON codec decodes any JSON, and the legacy decode is codec-only (`storage.ts:29–38`).
- `validateRegisteredPrefValue` checks only the primitive type (`prefMutation.ts:42–47`), and returns `true` for unregistered keys.
- Strict validators therefore come from the caller and are composed with the codec boundary (`usePrefAutosaveAsync.ts:37–44`).
- Storage's `BgTone` type also admits `"sage"` (`registry.ts:46–53`), and so does the core event payload (`events.ts:26`). The tokens `BgTone` does not (`plugin-web-tokens/src/types.ts:16–22`), no CSS rule exists for it, and no control can submit it. No version of the pane has ever written it: since the original pane (`61f6177`) the Sage tone's id is `default`, and `sage` is only a hue-preset id (`constants.ts:23, 32`). It is outside the strict domain.
- Do not add domains to the registry, codec or engine.

**Hidden or conditional inputs.**
- All seven pane rows always render. Topbar options exist only while its popover is open.
- Two controls submit DOM-provided values: the accent range and the font-scale range. The pane clamps both and rounds the hue (`:95–96`, `:129–130`). Every other control submits a closure-bound value.
- A background choice writes two fields: the tone and the tone's hue as the accent (`:110–117`; hues in `constants.ts:22–29`).

**Writers and readers outside the unit.** A search at `5cd63ff` over `apps/` (including `apps/desktop`, the service worker and `apps/web/src/host`) and `packages/`, all extensions, excluding `docs/` and tests, found:
- **Writers:** none besides the pane, the App subscriber and the Topbar. Outside the readers below, the literal keys occur only in `accountOwnership.ts` (all seven) and `registry.ts` (the three registered keys).
- **Readers:**
  1. `apps/web/src/pages/NotFoundPage.tsx:3–13` reads `xai_pref_theme` raw, accepts only `"dark"`/`"system"` and otherwise uses `"light"`.
  2. `apps/web/src/providers/AccountStorageGate.tsx:59` reads `xai_pref_lang` raw for the account gate screen (`"zh"` or English).
  3. Display consumers of App state: `WebShellProvider` (`lang`, `railPos`; `xai-web-shell/src/registry.tsx:16–38`) → Shell `data-rail-pos` (`Shell.tsx:64`), AppRail, CmdK (`CommandPalette.tsx:58–60`), DesktopPet (`App.tsx:245`) and every module and pane that receives `lang`.
- **Event channel:** `web:settings:preference-changed` (`events.ts:193–196`). Emitters: the pane (`AppearancePane.tsx:77–152, 185–203`), `SettingsFooter.handleSave` (`SettingsFooter.tsx:41–74`) and `resetAllPrefs` (`resetAllPrefs.ts:47–67`, no production caller). The only subscriber is `App.tsx:146–157`.
- **Lifecycle** (`lifecycleDeclaration.ts:25–37`): all seven are device-preference, export scope `device-recovery`, `retain` on account deletion and `retain-on-device` in migration, derived from ownership with no per-key entry.

**Preserve:**
- pane id `appearance`, icon `sun`, i18nKey `settings.appearance` (`internal/appearancePane.tsx:15–20`) and the `appearancePane` object identity used by composition (`settingsPaneComposition.ts:48`), asserted at `apps/web/src/__tests__/settingsPaneComposition.appearance.test.ts:22–29`;
- the pane title and the seven `SettingRow`s in today's order, with their labels and descriptions;
- every option set and accessible name in the table above, the swatch and tone `aria-label`s, the slider attributes (`min`, `max`, `step`) and `aria-label`s ("Accent hue"/"主题色色相", "Font scale"/"字体大小"), and the `°` and `%` readouts;
- `BG_TONES`, `HUE_PRESETS`, `RAIL_POSITIONS` and `appearanceDefaults`;
- **immediate apply** on both surfaces, and **language excluded from Reset**;
- the visible label "Reset to defaults"/"恢复默认";
- the Topbar popover: trigger, `prefSummary`, roles (`dialog`, `menuitemradio`), option labels, the Settings link, outside-click and Escape closing, and the `premiumBadge` slot;
- every existing public export of the Appearance package (additions only) and of `App.tsx` (`readLocalPref` byte-identical, `createPetToggleHandler`, `createSettingsOpenHandler`, `App`).

## 3. As-is behavior at `5cd63ff`

These are facts only. Suspected defects appear solely as hypotheses in §12.

1. **Registered dimensions.** The pane reads accent, rail and background through legacy `usePref` (`AppearancePane.tsx:52–56`), and so does App (`App.tsx:135–140`). The pane writes them with synchronous `setPref` (`:103, 111, 113, 122` → `storage.ts:161–227`): compare-before-write, then `localStorage.setItem`, with no Web Lock, expected baseline or readback. On failure `setPref` returns `false` and publishes nothing; the pane ignores the result.
2. **Root dimensions.**
   - App seeds `lang`, `theme`, `density` and `fontScale` once, through `readLocalPref` (raw `getItem` + `JSON.parse`, any value accepted, `:86–96, 128–131`).
   - The pane keeps its own mirrors of theme, density and font scale, seeded once from the DOM (`AppearancePane.tsx:59–73`). It applies the change to the DOM and emits an event (`:77–92, 129–152`). Language is emitted only (`:149–152`).
   - App's subscriber writes the value raw with `writeLocalPref`, swallowing every failure, and then sets its state (`App.tsx:98–105, 146–157`).
   - The Topbar calls App's setter first and then writes raw, swallowing failures (`Topbar.tsx:26–39, 102–104`). It emits nothing, so the pane's mirrors do not follow a Topbar change.
3. **No result channel.** The event payload carries no result (`events.ts:193–196`), so no surface can learn whether a root write succeeded.
4. **The bottom action button: "Save & apply".**
   - **Markup.** `SettingsFooter` renders `.pane-footer` with "Reset to defaults"/"恢复默认" (`btn ghost`, `data-testid="settings-footer-reset"`) followed by "Save & apply"/"保存生效" (`btn primary pane-save`, `data-testid="settings-footer-save"`) (`SettingsFooter.tsx:108–126`). Both labels are hard-coded bilingual strings (`:98, 101–102`).
   - **Activation.** `handleSave` (`:41–83`) calls the pane's `onSave`, which returns the seven current values, taking theme, density and font scale from the pane's mirrors (`AppearancePane.tsx:156–166`). It emits one `web:settings:preference-changed` per value (`SettingsFooter.tsx:55–74`) and then sets `saved` unconditionally (`:75`). For 1.8 s the button reads "Saved"/"已保存" and carries `.is-saved` (`:21, 79–82, 101, 120, 124`). The shell's own type documents that the flash shows even for an empty array (`plugin-web-settings-shell/src/types.ts:104–107`).
   - **Effect.** App's subscriber rewrites the four root keys raw from the emitted values and swallows failures (`App.tsx:146–157`). Nothing writes the three registered keys in response (`:153`).
   - **Consequence.** The button re-attempts nothing for a failed accent, background or sidebar write. For the root keys it rewrites all four, whether or not they failed, without the per-key lock: theme, density and font scale from the pane's mirrors, language from its `lang` prop (`AppearancePane.tsx:158`). No per-field result exists (H15).
   - **No other retry path** exists anywhere in the unit.
   - **Props.** `SettingsFooterProps` is `{ onSave, onReset?, lang }`, where `onSave` is synchronous and returns the change array (`plugin-web-settings-shell/src/types.ts:103–116`). There is no prop for a label, visibility, enabled state, asynchronous result or focus.
5. **Reset path.**
   - The footer's confirmation reads "Reset every preference to defaults? This clears saved theme, layout, and module toggles." (`SettingsFooter.tsx:85–96`).
   - Then `handleResetAppearance` (`AppearancePane.tsx:170–206`) calls `removePref` for the three registered keys inside a `try/catch` (`:172–183`). `removePref` reports failure by returning `false` and never throws (`storage.ts:242–265`), so failures are invisible.
   - It emits defaults for six dimensions; App then writes the *values* `"light"`, `"comfortable"` and `1` for the root keys rather than removing them. The pane applies the DOM defaults itself. Language is excluded (`:205`).
6. **Throwing consumers.**
   - `useI18n` throws for an unsupported language (`i18n.ts:727–733`).
   - `applyFontScale` throws for a non-finite or non-positive scale (`apply.ts:64–69`), and `Number.isFinite` does not coerce strings.
   - `applyAccentHue` throws for a non-finite hue (`:83–88`); the legacy number codec decodes `Infinity` (`codec.ts:48–52`).
   - App calls these in effects (`App.tsx:160–165`). `<App/>` is under the `app` route error boundary (`router.tsx:41–43`).
7. **Pass-through of registered strings.** A stored `xai_rail_pos` or `xai_bg_tone` string outside the domain is decoded and applied as-is (`App.tsx:164–165`, `Shell.tsx:64`).
8. **Cross-document.** Legacy `usePref` follows storage events for the three registered keys (`usePref.ts:156–186`). The four root keys are read once at mount and never subscribed.
9. **No protection or recovery.**
   - `appearancePane.render` forwards only `lang` (`internal/appearancePane.tsx:19`), although the host passes `registerDepartureGuard` (`composedSettingsRegistration.tsx:105`).
   - The Topbar is on every route. `requestDeparture` resolves `true` when no coordinator is mounted (`settingsDeparture.ts:14–16`), and only Settings, Pomodoro and Dashboard mount one.
   - There is no `beforeunload` listener, export, Retry, Retry all, Discard, Reload or truthful status.
10. **App lifetime.** `AccountDataGate` keys the whole App subtree, including Shell, Topbar, DesktopPet and CmdK, by `kind:accountId:generation:epoch` (`AccountDataGate.tsx:99`), so App state remounts on every scope change. A second document can force that through the identity channel (`AccountStorageGate.tsx:8, 39`).
11. **Sign-out.**
    - `handleSignOut` (`App.tsx:189–217`) calls `requestSettingsDeparture("sign-out")` in both the auth-coordinator branch (`:196`) and the fallback branch (`:205`), re-checks scope and owner afterwards (`:197–198, 206`), then invalidates identity, signs out and redirects.
    - It is covered by `App.signout.test.tsx` (7 cases).
    - The other `signOut` call, in the account-deletion recovery bridge (`AppProviders.tsx:17–24`), is a lifecycle path, not a voluntary sign-out.
12. **Presentation.**
    - The pane ends with the shared footer, Reset on the left and "Save & apply" on the right (`AppearancePane.tsx:419–423`).
    - **Footer placement.** Above 640 px the footer is `position: sticky; bottom: 0` with `justify-content: flex-end` (`plugin-web-settings-shell/src/styles.css:131–142`). The same rule exists globally for any `.pane-footer`, together with the `.pane-save` rules (`plugin-web-tokens/src/layout.css:1283–1304`). So "Save & apply" is the inline-end control of a bar pinned to the bottom of the scroll container. At 640 px and below the footer is static, `column-reverse` and stretched to full width (`styles.css:338, 423–433`).
    - At 760 px and below the Topbar hides its summary and shows a 44×44 icon trigger (`layout.css:1832–1839`). `.search-box` is `flex: 1; min-width: 0` (`:294–296`).
    - **DesktopPet geometry** (R-PET):
      - The default position is `(innerWidth − 108, innerHeight − 108)`: `PET_BODY_PX` 84 plus a 24 px inset (`DesktopPet.tsx:43–58`, `internal/timing.ts:38`). The clamp only bounds it at `innerWidth − 92` (`internal/drag.ts:31–38`), so the default left edge is `innerWidth − 108` at every width: 267, 306, 660, 916 and 1332 px at 375, 414, 768, 1024 and 1440.
      - `.pet-wrap` is fixed and hit-testable. It is 84×84 above 1024 px, 72×72 from 761 to 1024 px and 56×56 at 760 px and below (`pet.css:128–140, 289–310`). Above 1024 px its swap button extends 10 px above and to the right of it (`:269–287`).
      - The tip bubble is `pointer-events: none` unless the pet is hovered or contains focus (`:194–220`). It is hidden at 760 px and below (`:312–314`) and clipped by `overflow: hidden` from 761 to 1024 px (`:289–294`).
      - At 768×1024 the measured box is 660–732 × 916–988 (Features acceptance §5.1).
    - The Appearance stylesheet is global (side-effect import, `index.ts:13`) and has no sibling or child combinators.
13. **Existing tests that encode current behavior** (dispositions in §11):
    - Appearance package: AC-SAVE-1/2, AC-RESET-1–6 and AC-I18N-4 (footer); AC-LIVE-1–8 (event emissions, synchronous writes); AC-RENDER-3/8 (mirrors seeded from the DOM).
    - Shell: `Topbar.test.tsx` TP1-Persist … TP3b-Persist and TP-Persist-Quota-Safe (`:160–209`), which assert the raw write and its silent swallow.
14. **Accepted async interface to reuse.** Everything in Features contract §3 item 11 applies (`usePrefAutosaveAsync` `{ value, edit, retry, reset, meta }`, the same-field queue and coalescing, refusal before enqueue, a failed request blocking the queue and keeping its token, the reset branch with verified absence and a verified no-op, same-tab publication). In addition:
    - **Open-ended suffix path.** `usePrefAutosaveAsync("<suffix>", { codec, defaultValue, validate })` binds `xai_pref_<suffix>` (`usePrefAutosaveAsync.ts:61–79`). For `lang`, `theme`, `density` and `font_scale` the ownership resolves to the explicit device entries. The `json` codec encodes with `JSON.stringify` and decodes with `JSON.parse` (`codec.ts:28–29, 57–62`), which reproduces today's root bytes exactly.
    - **No accepted caller uses this branch yet.** Storage contract tests cover it only for account-defaulted dynamic keys (`usePrefAsync.contract.test.tsx:297–322`).
    - **Locking.** Device keys skip the account lock (`prefMutation.ts:244`). Every write takes the per-key lock `prefMutationLockName(<key>)`. Without `navigator.locks` every write is refused (`accountCoordination.ts:12–16`).
    - **Invalid sources** are refused before both the set and the reset branch (`prefMutation.ts:198`).

## 4. Scoping decisions (A1 and A3–A9 await controller confirmation; A2 is the product owner's decision)

**A1 — Host- and shell-inclusive scope (selection B-1).**
- The unit includes `App.tsx`, `Topbar.tsx`, `Shell.tsx`, the shell `types.ts` and `Topbar.test.tsx`, exactly as §11 lists them.
- The departure coordinator, router, `settingsDeparture`, composition, registrations, providers, storage, tokens, settings shell, core and every other package stay protected.
- Affected-caller reruns are E16, E24 and E25, and the clean-state chrome-invariance gate (§10 item 6) bounds visual re-verification of other callers.

**A2 — Autosave, with the bottom button turned into a real "Retry all" (selection B-2; product-owner decision, option (ii)).**

*Decision.* The product owner chose option (ii) on 2026-10-04 (control plane `2f728f1`), over (i) autosave with the button removed and (iii) edit-then-save. This is not an assumption awaiting controller confirmation.
- **Autosave stays.** Every change applies and persists immediately on both surfaces, as today. Nothing is buffered for a button, and no edit-then-save state exists.
- **The old button goes.** Appearance stops rendering `SettingsFooter`. "Save & apply"/"保存生效", its re-emission of seven values (§3 item 4) and its unconditional "Saved"/"已保存" flash (`SettingsFooter.tsx:75`) disappear.
- **A bottom button stays.** Its place is taken by **Retry all**, inside a pane-local bottom action area (A2.8).
- **Always shown (decision two).** On 2026-10-04 the product owner also decided that Retry all is always shown and is disabled when nothing can be retried (control plane `51db323`), rather than shown only while there is something to retry, as r2 had proposed. A2.2 defines the disabled state, and A2.5 its focus.
- **Shared code untouched.** `SettingsFooter`, `confirmAction` and `resetAllPrefs` stay byte-unchanged. After this caller no production pane mounts the footer.
- Unlike Features D3, which removed its Save button, Appearance repurposes its button, as the product owner decided.

*Terms used below.*
- A field's draft is **settled unsuccessful** when all three hold:
  - the field has an actual current draft, set or reset;
  - no operation for the field is in flight or runnable;
  - the field's queue is held by a failed request: quota, a throwing `getItem` or `setItem`, missing or rejected Web Lock, conflict, readback uncertainty, or an invalid or unavailable source.

  This includes a latest intent queued behind a failed predecessor, because a held failure stops the queue (`usePrefAsync.ts:170, 195–202`). It is exactly the condition that renders the Topbar status (§7 item 2).
- **E** is the set of fields whose draft is settled unsuccessful.
  - **Pending** fields are never in E: in flight, queued and runnable, or held behind the per-key lock.
  - **Source-only** fields are never in E: they have no draft and show Reload only.
- A **pass** is the set of fields that one Retry all activation retries. Each member is recorded as (field, the exact draft object current at activation). A pass is **open** while at least one member is still attached and pending.

**A2.1 Labels.**
- Visible label and accessible name: EN `Retry all`, ZH `全部重试` (meaning "retry all"), in every state. It has no count, no icon-only form and no label change during a pass or when disabled.
- `aria-describedby` points to the pane status line (A2.4) exactly while the button is enabled or a pass is open, and the line is never empty then (A2.4 rules 1–3). While the button is disabled outside a pass, it has no `aria-describedby` (A2.2).
- "Save & apply", "保存生效", "Saved" and "已保存" never appear in the pane.

**A2.2 Visibility and enabled state** (decision two).
- **Always rendered.** While the pane is mounted, Retry all is rendered in every state: clean, pending only, source only, with failures and during a pass.
- **Enabled if and only if E is non-empty**, whether or not a pass is open. Otherwise it is **disabled**. That covers the clean state (no draft, pending operation or source issue), the pending-only state (including an open pass whose attached members are all pending, a pending Reset batch and writes held behind the per-key lock), the source-only state and any combination of these.
- **Disabled means `aria-disabled="true"`, never the native `disabled` attribute.**
  - It stays a focusable `<button type="button">` in the Tab order in every state. It never carries `disabled`, `inert`, `hidden`, `aria-hidden` or `tabindex="-1"`.
  - Activation while disabled, by pointer, Enter or Space, is inert: zero operations and no state change. Keyboard activation keeps focus, and Space does not scroll the page. The handler does not rely on the attribute: A2.3 derives E live at activation, so an activation with E empty is inert in every case.
  - When enabled, it carries no `aria-disabled` attribute; oracles also accept `aria-disabled="false"`.
  - The state is derived from E and the pass on every render and is never stored separately.
  - **Why not `disabled`.** A focused button that becomes `disabled` is no longer focusable, so the HTML focus fixup moves focus to the document and `document.activeElement` becomes `<body>`. That would happen whenever a pass succeeds while the user is on the button (A2.5). A `disabled` button also leaves the Tab order, so keyboard and screen reader users could not reach it. The product has no single convention to follow: the Countdown dialog's Save uses `aria-disabled` alone, with an early return (`CountdownEditDialog.tsx:186–188, 337`), and the AI chat Retry uses both attributes (`ErrorBanner.tsx:129–137`).
- **Accessible name and description.** The name never changes (A2.1). The description is the status line exactly while the button is enabled or a pass is open. While the button is disabled outside a pass it has no description, so no count, export error or success line is ever presented as the reason it is disabled.
- **Disabled presentation.** One neutral treatment, the same in every disabled state. The product has no shared disabled rule for `.btn` (`tokens.css:344–365`), so it is one additive rule set under `.appearance-pane`, keyed on `[aria-disabled="true"]` (§9).
  - **Same box.** The rule set changes only colours, opacity and the cursor. Position, size (at least 44×44, A2.7), padding, border width and label stay those of the enabled button.
  - **Legible.** The label's contrast ratio against the button's effective background is at least 3:1, in both themes with every tone (§9). WCAG 1.4.3 exempts inactive controls, but this one is always visible and stays in the Tab order.
  - **Distinct.** At least one of the computed `color`, `background-color`, `border-color` and `opacity` differs from the enabled state in the same theme, tone and accent.
  - **Neutral.** Its colours do not depend on the accent hue, and it uses no danger, warning or success colour. It has no icon, badge, count, check mark, `title` tooltip or animation, and it never takes the `.is-saved` class. So it suggests neither a failure nor a success.
  - **Hit-testable.** `pointer-events` is never `none`, so the A2.8 (b) hit-tests reach the button; its activation is inert anyway.
  - **Focus visible.** The global `button:focus-visible` ring (`tokens.css:246–253`) is not suppressed: a focused disabled button shows the same 2 px outline as an enabled one.
- **During a pass.** With E empty, the button is disabled and described by `Retrying unsaved appearance changes…` (A2.4 rule 1). A member that fails again makes E non-empty and enables the button, which then retries only newly eligible fields (A2.3).
- **Never a success state.** It never changes its label, never flashes and never claims success. Becoming disabled after a pass is not a success signal; results are reported only by the status line under A2.4.
- **Rationale.**
  1. Disabled whenever E is empty, the button can never perform the no-op that the first decision removed: every enabled activation has real work (H17 records today's clean-state no-op).
  2. `aria-disabled` keeps focus and the Tab order stable across every transition between enabled and disabled, including a pass that succeeds while the user is on the button (A2.5).
  3. The neutral look, the absence of a description and the clean-state status rule (A2.4 rule 2, §5 item 9) answer r2's concern that an always-present "Retry all" could suggest a failure that did not happen.
  4. Export, Discard all and the Topbar status still render only while they are relevant (§7 item 2, §8).

**A2.3 Retry scope and attempts.**
- **Activation.** The controller synchronously computes E from live operation state, never from the last render.
  - If E is empty, activation is inert: no pass, zero operations.
  - Otherwise it creates a pass with its own identity and invokes each member's per-field Retry action (§5 item 8, §6) exactly once, before any asynchronous settlement. The order is the pane's display order: Language, Theme, Density, Accent color, Background palette, Sidebar position, Font scale.
- **Covered:** every settled unsuccessful set or reset draft across the seven fields, including:
  - set drafts from the pane and from the Topbar (language, theme, density);
  - each field of a background choice, independently;
  - the latest value of a slider stream;
  - **the failed items of a Reset batch**;
  - a valid edit over malformed bytes (§5 item 2);
  - a conflict, an uncertain write, and a latest intent queued behind a failed predecessor.
- **Excluded:**
  - pending fields, including members of an open pass, pending Reset batch members and fields being retried individually;
  - source-only fields;
  - fields without a draft.
- **Exactly one attempt.**
  - Each member's held failed request is re-attempted exactly once, with its own kind and token (`usePrefAsync.ts:262–276`).
  - With a write-level fault armed, that is exactly one `setItem` (for a set request) or `removeItem` (for a reset request) on the member's key, and zero write or remove attempts on any other key.
  - A reset draft whose own removal failed is re-attempted as one removal and never writes. No reset draft ever reaches the hook's no-failed-request set path (`:278`; §6).
  - A latest intent queued behind a failed predecessor then proceeds as its own first attempt (§5 item 5). In the inherited ordering of Features follow-up 2, the held request is the superseded predecessor set, so it runs once before the queued removal (§6).
  - Nothing is attempted twice, and a member whose attempt fails is not retried again automatically.
  - Uncertainty keeps its grant and reconciles with exactly one total write or remove (§5 item 6, §6).
  - A conflict is never overwritten. Retry all gains no authority that a per-field Retry lacks, and it never writes a field without a failed request, so it cannot revert another surface's choice (the H5 class).
- **No duplicates while pending.**
  - A second activation while members are pending re-attempts none of them, whether it comes in the same turn, by double click, by Enter then Space, by key auto-repeat or later. It retries only fields that have newly become eligible.
  - A per-field Retry on a pending member is inert (`usePrefAsync.ts:265`), and Retry all skips a field whose per-field Retry is pending.
- **Attribution.** A member's completion counts only if its draft object is still the field's current draft (§5 item 4). Each member ends in one of four outcomes:
  - **succeeded:** verified bytes, verified absence or a verified no-op;
  - **failed again:** settled unsuccessful;
  - **superseded:** a newer intent replaced it (a pane edit, a Topbar edit, a background choice for either of its two fields, or Reset);
  - **detached:** Discard, Discard all, sign-out OK, or controller disposal.

  Only succeeded and failed outcomes feed A2.4.
- **Latest choice.** A newer intent supersedes the member's draft. The old completion never makes the newer intent look saved, and the hook's conflict settlement of superseded queued sets (`usePrefAsync.ts:284`) never surfaces as the newer intent's failure.
- **Late completions.** A completion that arrives after its member was superseded or detached, or after unmount, changes no draft, recovery block, export entry, Topbar status, unload warning, status line or focus. If the engine write had already started and commits, the field shows the committed bytes like any other commit, with no draft and no success claim.
- **No storage path of its own.** Retry all only calls per-field Retry: no raw storage, `StorageEvent`, `web:settings:preference-changed`, lock layer or rebase.

**A2.4 Feedback.**
- **Per field.** Each member's existing recovery block reports its own state:
  - "<Label> is saving." or "<Label> is being reset to its default." while pending;
  - removed on success;
  - kept, with "<Label> was not saved." or "<Label> was not reset to its default.", after a failed attempt.
- **Pane status line.** It has `data-testid="appearance-status-line"` and `role="status"` (polite), and it is always rendered, empty when nothing applies. The first matching rule wins:
  1. A pass is open: `Retrying unsaved appearance changes…`/`正在重试未保存的外观更改…`.
  2. At least one draft exists (so Export is rendered, §8), and the most recent pane-level action was a failed Export: `Export failed. Please retry.`/`导出失败，请重试。` (unchanged). The next pane-level action clears it: an edit, a per-field Retry, Discard or Reload, an enabled Retry all, Discard all, Reset or Export. The last draft clearing also clears it, so a clean state never shows it.
  3. E is non-empty: `1 appearance change is not saved.` or `<n> appearance changes are not saved.`, ZH `<n> 项外观更改未保存。`, where n = |E|.
  4. Otherwise the existing success rules apply unchanged (§5 item 7, §6). For a pass that has just settled, ignore superseded and detached members. If at least one member succeeded and none failed again, the line is `Defaults restored.` when every succeeded member was a reset intent and the §6 condition holds, and `Appearance settings saved.` otherwise. In both cases the §5 item 7 conditions must also hold. The line stays until the next pane-level action or operation.
  5. Otherwise empty.
- **No unconditional success.** No success line appears while any draft, pending operation or source issue exists, or while a pass is open. Superseded or detached members never count as successes. A pass that settles while the pane is unmounted makes no success claim on remount (§5 item 7).

**A2.5 Focus.**
- Activation does not move focus.
- **No transition moves focus.** While the pane is mounted, Retry all never unmounts and never becomes unfocusable (A2.2), so a change between enabled and disabled leaves focus where it is.
- **The pass settles with E empty** (full success, or every remaining member superseded or detached): the button stays rendered and becomes disabled. If focus was on it, focus stays on it: never on `<body>`, and never moved to Reset to defaults. The status line announces the result (A2.4), and the button loses its description (A2.2).
- **Partial or no success:** E is non-empty after settlement, so the button stays enabled and focus stays on it.
- **Open pass with E empty:** the button is disabled, and focus stays on it.
- **A member fails again during a pass:** the button becomes enabled, and focus stays on it.
- **Why focus stays.** It keeps the user's place. A repeated Enter or Space on the now-disabled button is inert, whereas on Reset to defaults it would open the reset confirmation. No programmatic focus move is needed, because the native `disabled` attribute is never used; an implementation that sets `disabled`, even briefly, fails A2.2 and this item.
- Focus is moved only away from an element that unmounts; focus the user placed elsewhere is never taken. A recovery block that unmounts while focused follows §9, and Discard all follows §9 (focus to Reset).

**A2.6 Interactions.**
- **Per-field Retry.** Retry all invokes the same action. Whichever starts first owns the attempt; the other is inert for that field.
- **Per-field Discard** (§5 item 8). On a pending member it detaches that member, and the pass continues for the others. On an eligible field it removes the field from E.
- **Discard all.** It detaches every member, so the pass closes, the status line falls to rules 3–5 and focus goes to Reset.
- **Reset to defaults.**
  - A declined confirmation makes zero attempts and leaves the pass untouched.
  - An accepted Reset during a pass supersedes the members on its six fields; a language member continues.
  - Over a batch, Retry all retries failed items once each and skips pending ones. It never turns a reset into a set and never duplicates a removal (§6).
- **Topbar status.** It depends only on E (§7 item 2). It is hidden while all unsuccessful drafts are pending members and returns if a member fails again. It never retries and never offers Retry all. A Topbar choice during a pass is a newer intent.
- **`beforeunload`.** Members are drafts, so the listener stays registered throughout a pass. It is removed when the drafts clear after full success and kept after partial success. The handler still makes zero storage attempts.
- **Sign-out step.** Pending members are drafts, so the step prompts once.
  - **Cancel** resolves `false`, and the pass continues.
  - **OK** discards every draft and detaches the members, with zero set or remove attempts by the step; late completions are ignored and the sequence continues as in §7 item 4.

  Retry all never blocks or delays sign-out and adds no confirmation.
- **Export** is unchanged (§8). **Forced transitions** and App remounts dispose the controller and detach members (REL-09).

**A2.7 Accessibility.**
- A native `<button type="button">`, reached by Tab in DOM order in every state, enabled or disabled. It never carries the `disabled` attribute (A2.2).
- Enter and Space each activate the enabled button exactly once: one pass, one attempt per eligible field, and no page scroll on Space.
- While it is `aria-disabled`, a pointer click, Enter and Space make zero operations; Enter and Space keep focus and do not scroll.
- At least 44×44 CSS px at every width in EN and ZH and in both states, sized to its content (never stretched), with a visible focus indicator in both states.
- EN/ZH copy as in §5, in the language currently displayed. The accessible name equals the visible label in both states. The description is the status line while the button is enabled or a pass is open, and absent otherwise (A2.2).

**A2.8 Placement (a gate).**
- **The area.** The bottom action area is a pane-local block at the end of `.appearance-pane`, where `SettingsFooter` was.
  - It is in normal flow: not sticky and not fixed.
  - It is start-aligned (`justify-content: flex-start`) and wraps.
  - It must not use the `.pane-footer` or `.pane-save` classes, which carry sticky, inline-end styling globally (§3 item 12).
- **Order:**
  1. the status line (A2.4);
  2. the recovery action group: **Retry all first, at the inline start**, then Export, then Discard all;
  3. Reset to defaults, at the inline start of its own line.
- **Why** (R-PET).
  - The pet's default box sits in the bottom-right corner, with its left edge at `innerWidth − 108` at every width (§3 item 12).
  - Today's primary button sits at the inline end of a footer pinned to the bottom of the scroll container. At 768×1024 that places it inside the pet's box at every scroll position (H14 b).
  - At the inline start the bound is simple. A pane of width P begins at most at `innerWidth − P`, so a button of at most 140 px at its inline start ends at most at `innerWidth − P + 140`.
  - With the shared `.settings-detail` content widths measured in the Features E14 receipt ([review-visual-keyboard-5cd63ff.md](../web-features-recovery-native/review-visual-keyboard-5cd63ff.md) §5, §10; P = 289, 328, 604, 608 and 674 px), that bound is 226, 226, 304, 556 and 906 px. The pet's left edge is 267, 306, 660, 916 and 1332 px at 375, 414, 768, 1024 and 1440.
  - No viewport height, scroll position or enabled state can therefore bring the pet over Retry all: the disabled look keeps the enabled box (A2.2).
- **Gate (blocking).** It applies to Retry all only and is stricter than A9's uncovered-center rule; A9 governs every other control unchanged. It runs at 375, 414, 768 (including 768×1024), 1024 and 1440, in EN and ZH, and in every state, enabled and disabled, because Retry all is always rendered (A2.2). It requires all of:
  - **(a) Geometric separation.** The button's border-box right edge is at least 8 px left of the default-position pet's left edge, measured live as the union of `.pet-wrap` and `.pet-swap-btn`.
  - **(b) Hit-test with the pet on** at its default position, both after scrolling the button into view (§9 protocol) and with `.module-settings` scrolled to the end of its range. The center and four inset points must land on the button, and its box must not intersect the pet box.
  - **(c) Size and containment.** At least 44×44, contained in `.settings-detail` and the viewport, and no horizontal scroll (§9).

  During the probes the pet is neither hovered nor focused, because its bubble becomes hit-testable only then (§3 item 12). The pet itself is never moved, hidden, restyled or repositioned (A9).

**A2.9 Implementation vehicle.**
- **Pane-local.** A new Appearance-internal component renders the bottom action area (§11).
- **Logic in the controller.** Eligibility from live state, pass records, attribution and status derivation belong to the App-scoped controller (A3). So a pass survives pane unmount and route changes, and the Topbar status reads the same E.
- **No shared change.** `SettingsFooter`, `confirmAction` and `resetAllPrefs` stay byte-unchanged. Retry all cannot be expressed through the shared footer:
  - `onSave` is synchronous and returns an array;
  - the flash is unconditional by design (`SettingsFooter.tsx:41–83`; `plugin-web-settings-shell/src/types.ts:104–107`);
  - there is no label, visibility, enabled-state, result or focus channel (§3 item 4).

  Changing it would alter a protected shared component that no other production pane mounts.
- **Consequences.** No file outside A1's existing list is needed. A1 is unchanged, no D2 shared-layer change is involved, and no affected-caller rerun is added; the settings-shell suite stays in E24 as an unchanged control.

**A3 — One App-scoped Appearance controller (selection B-3).**
- The Appearance package exports a controller that App creates exactly once (inside `AccountStorageGate`) and provides to its descendants.
- The controller owns:
  - the seven bindings;
  - the operation and recovery model;
  - DOM application (the `apply*` calls and the system-theme listener now in `App.tsx:160–174`);
  - the unload warning;
  - the sign-out step.
- The pane and the Topbar are views of it. App passes the controller's edits as the Topbar's existing `setLang`/`setTheme`/`setDensity` props, whose types do not change.
- A standalone `<AppearancePane lang>` (no provider) creates its own controller, so the package stays usable and testable alone. In the production App there must never be a second controller.
- The `web:settings:preference-changed` path is retired for these writes: the pane emits nothing and App subscribes to nothing. The event type stays declared in core.

**A4 — Root keys through the open-ended suffix path (selection B-4).**
- `lang`, `theme`, `density` and `font_scale` use `usePrefAutosaveAsync(<suffix>, { codec: "json", defaultValue, validate })`. The three registered keys use the registered path.
- No registry, ownership, codec or lifecycle change.
- This is the first device-classified production consumer of that engine branch. A defect found there is a shared defect (§11).

**A5 — Protection model (selection B-5).**
- Drafts live as long as App does. They survive route changes, Settings pane switches, the popover and pane unmount.
- So:
  - **no Settings route guard**: the pane registers no departure guard;
  - a **Topbar status** through an additive optional render slot, for settled failures;
  - an App-level **`beforeunload`** while drafts exist;
  - a **sign-out step** (native confirm) immediately before each `requestSettingsDeparture("sign-out")`.
- Forced transitions are never blocked.

**A6 — Strict domains; refuse, never repair (selection B-6).**
- The domains are those of §2.
- Invalid or unreadable bytes display and apply the field's default, never throw anywhere, show a source alert with Reload only in the pane, and are never rewritten.
- A valid edit over them is a failed draft (`prefMutation.ts:198`). This is the retained REL-07 limitation (§16).

**A7 — Reset (selection B-7).**
- A pane-local Reset of six fields by verified removal.
- Language is kept.
- The confirmation text is truthful.
- Root keys move from "write default value" to "remove". Every reader falls back to the same default, so the display is unchanged.

**A8 — Test dispositions (selection B-8)** exactly as §11.

**A9 — R-PET hit-test rule (selection B-9)** exactly as §9.

**D-notes.**
- *Counts match.* Three read-only inventory rows stand for three of seven fields. The App reads (`apps/`), the raw writers and the event path are outside the scanner. Inventory rows are not defect counts.
- *Not a Features change.* The Features readers (`useFeaturePrefs`, `withDisabledFallback`, CmdK) and the Features pane are untouched; §10 item 7 proves isolation.
- *Controller notes (non-blocking).*
  - The shared number codec decodes an empty string as `0`, a valid hue, so empty `xai_accent_hue` bytes are a valid `0`. This is an engine quirk; there is no change here.
  - Font-size tokens are fixed `px` (`tokens.css:98–103`), so the font-scale setting has little visible effect on body text (SET-02 remainder, §16).

## 5. All seven fields: edit, source and operation requirements

**Interface.**
- Use the accepted `usePrefAutosaveAsync` edit, retry, reset and meta interface: seven bindings in a fixed order with a stable hook order and strict validators per §2.
- Preserve the shared queue and coalescing, result semantics, exact baseline and readback, and uncertainty grants.
- Do not add:
  - raw storage calls or a caller storage preflight;
  - a forced rebase or a manual lock layer;
  - any `StorageEvent` dispatch or `web:settings:preference-changed` emission;
  - any change to legacy `usePref`/`setPref` behavior for other callers;
  - any registry, ownership, codec or lifecycle change.
- Call `reset` only for Reset to defaults (§6). A failed set or reset is retried through `retry`, which keeps the failed request's kind and token (`usePrefAsync.ts:262–279`).
- Retry all (A2) adds no storage path. It only invokes the per-field Retry action of item 8 once per eligible field.

1. **Zero-write mounts.**
   - Loading the production App on any route, mounting the pane, opening and closing the Topbar popover, and reloading make zero set or remove attempts on all seven keys and on every other key.
   - Absence displays and applies the default.
2. **Source truth.**
   - Each of these makes its field *unavailable*:

     | Key | Malformed bytes |
     | --- | --- |
     | `xai_pref_lang` | `"fr"`, `en` (unquoted), an empty string, `null`, `1`, `"EN"` |
     | `xai_pref_theme` | `"neon"`, `dark` (unquoted), `"Dark"`, `123` |
     | `xai_pref_density` | `"cozy"`, `{}`, `compact` (unquoted) |
     | `xai_pref_font_scale` | `0`, `-1`, `null`, `"big"`, `2`, `0.5`, `"1"` |
     | `xai_accent_hue` | `abc`, `Infinity`, `-5`, `361`, `12.5` |
     | `xai_rail_pos` | `diagonal`, `Left`, an empty string, ` left` |
     | `xai_bg_tone` | `sage`, `neon`, `Mist`, an empty string |

     So is a key whose `getItem` throws.
   - An unavailable field displays and applies its default and **never throws anywhere**: App renders and every `/app` route works.
   - The pane shows that field's localized source message with **Reload only**, and makes no Saved claim.
   - No draft, export entry, Topbar status or unload warning is created.
   - Mount, Reload and Discard never rewrite, purge or normalize those bytes.
   - A valid edit over such a source is actual work: keep it as a failed draft with Retry, Discard, export, Topbar status and unload warning, and never silently overwrite.
3. **DOM-provided inputs.**
   - The two range inputs keep today's clamp and rounding (`AppearancePane.tsx:95–96, 129–130`), then validate.
   - A non-finite result is ignored: no operation, no state change and no message.
   - Oracles must not fabricate private calls to reach values the UI cannot submit.
4. **Identity and latest authority.**
   - Each valid edit establishes its field, session and operation identity before it is enqueued.
   - The edit displays and **applies** immediately, even while the per-key lock is held: the `active` classes, `aria-selected`/`aria-checked`, slider values, `<html>` attributes and inline style, and for language the whole application's strings. Controls stay enabled while an operation is pending.
   - **One sequence per field across surfaces.** A pane edit and a Topbar edit of the same field are successive intents of the same field. The latest wins, and both surfaces always show the same state.
   - **Background choice.** It establishes two intents synchronously in one handler, `bgTone` then `accentHue` (the tone's hue). They settle independently. A later accent edit supersedes only the accent intent.
   - **Slider streams.** Every input event is a new latest intent, and the queue may coalesce. The final bytes equal the last value. An earlier completion never makes a later value look saved.
   - Completion authority belongs to the exact draft object. It does not come from value equality, `meta.value`, `meta.status`, an earlier success or failure, or a predecessor Promise.
   - Only the matching latest success clears a field's work. Choosing a value equal to the default stores it; it is never converted to removal.
5. **Failures keep the latest choice, displayed and applied.**
   - Covered failures: quota, a throwing `getItem` or `setItem`, missing or rejected Web Lock capability, conflict, and readback uncertainty.
   - Each keeps the latest choice with accurate pending or failed feedback. None may produce an unhandled rejection or a false Saved.
   - A Retry while the field is pending is inert or idempotent.
   - Cover these orderings:
     - the predecessor succeeds and the latest fails;
     - the predecessor fails while the latest stays queued, and Retry advances the predecessor without acknowledging the latest;
     - repeated failed-predecessor recovery;
     - a later failure of the latest.
6. **Uncertainty and conflict.**
   - An unchanged uncertain Retry keeps its grant across temporarily denied reads or locks. It reconciles with exactly one total write, and readback must match the intended bytes.
   - An external replacement or removal stays a preserved conflict, including restoration of the original baseline bytes.
   - Repeated Retry never gains authority to overwrite. A distinct new choice is a new operation.
7. **Independent settlement and truthful status.**
   - A field's success never retries, rewrites, discards or rereads a sibling.
   - Cover:
     - several, and all seven, fields unresolved at once;
     - a conflict coexisting with an unrelated quota failure;
     - one field's set failing while another field's reset succeeds, and the reverse;
     - a background choice whose accent write fails while its tone write succeeds, and the reverse.
   - The pane's "Appearance settings saved." requires all of:
     - a genuine latest success that completed while the pane is mounted;
     - no current drafts, pending operations or source issues.
   - A source-only Reload repair clears its alert but does not by itself claim a save.
   - The pane status line follows the precedence of A2.4: an open Retry all pass, then an export failure while a draft exists, then the not-saved count, then these success rules.
8. **Recovery actions.** Each field has its own Retry, Discard and, for source-only issues, Reload, each localized and labelled with the field name.
   - Reload refuses, at invocation time, to erase the same field's actual draft.
   - Discard detaches the field's work before the safe `meta.reload()`. It makes zero set/remove attempts and rereads only that field. The display and the document return to the committed value; for language, the whole application returns to the committed language.
   - "Discard all changes" visits only actual current drafts.
   - A late completion after discard, reload or unmount never revives discarded state or clears newer work.
   - Source repair never acknowledges failed actual work.
9. **Retry all** (A2.1–A2.7). A2 is the definition; this item lists what must be covered.
   - **Render and enabled state** (A2.2). The button is rendered in every state below:
     - clean, pending only (a write held behind the lock) and source only: disabled, that is `aria-disabled="true"` with no `disabled` attribute, a Tab stop with no `aria-describedby`; a pointer click, Enter and Space each make zero operations;
     - one failed field and all seven failed fields: enabled and described by the status line;
     - an open pass with E empty: disabled, described by the in-flight line, inert;
     - an open pass plus a newly failed field: enabled, retrying only that field;
     - every transition between enabled and disabled leaves focus where it is.
   - **Clean-state status line.** With the button disabled and no draft, pending operation or source issue, the status line is empty or shows a rule 4 success line (`Appearance settings saved.` or `Defaults restored.`) after a genuine verified completion. It never shows the in-flight line, a not-saved count or `Export failed. Please retry.` (A2.4 rule 2), and the button never references it.
   - **Scope:**
     - set drafts from the pane and from the Topbar;
     - a background choice with both writes failing, and with either one failing;
     - a slider stream's latest value;
     - failed Reset items;
     - a valid edit over malformed bytes (refused again and kept);
     - a conflict (kept, never overwritten);
     - an uncertain write (one total write);
     - a failed predecessor with a queued latest (the predecessor once, then the latest's own attempt).
   - **Exclusions:** pending fields, pending Reset batch members, source-only fields and fields without drafts get zero attempts.
   - **Attempts and duplicates.** Attempt-level counters show exactly one write or remove per member and none elsewhere. A same-turn double activation, an activation while members are pending, a per-field Retry during a pass and a Retry all during a per-field Retry add zero attempts for the fields already pending.
   - **Attribution and latest choice.** A pane edit, a Topbar edit, a background choice (for either of its two fields), or Reset during a pass supersedes the member. The old completion never acknowledges the newer intent.
   - **Late completions** after Discard, Discard all, sign-out OK, unmount and App remount are ignored.
   - **Feedback.** Every A2.4 line appears in EN and ZH with the right n. There is no success line while a member is pending or failed, and the precedence after a settled pass holds. The disabled state adds no text and no failure or success cue (A2.2).
   - **Focus** follows A2.5, including focus kept on the button when a pass disables it.
   - **No old button.** No control is named "Save & apply"/"保存生效", and "Saved"/"已保存" never appears.
   - **Orderings to cover:**
     - one member succeeds while another fails;
     - a member fails again, then its per-field Retry succeeds;
     - two passes, the second retrying only fields that failed after the first began;
     - Retry all during a Reset batch with one failed item and others pending;
     - a member held behind the real lock, superseded by a Topbar edit, then released;
     - Discard all during an open pass, followed by the late completion;
     - the Features follow-up 2 ordering for `theme` and `railPos` (the §12 ruling-5 cases).

**Stable selectors** (fixed now so that oracles can be frozen):
- the existing control selectors and accessible names of §2;
- each recovery block: `[data-appearance-recovery="<fieldId>"]`;
- Reset `data-testid="appearance-reset-defaults"`, Export `data-testid="appearance-export-draft"`, Discard all `data-testid="appearance-discard-all"`, Retry all `data-testid="appearance-retry-all"` (always rendered while the pane is mounted, A2.2);
- the pane status line: `data-testid="appearance-status-line"` with `role="status"`, inside the bottom action area of `.appearance-pane`, always rendered;
- the Topbar status button: `data-testid="appearance-status"`.

**Normative wording.** It is fixed here so that oracles can be frozen beforehand.

| Element | EN / ZH wording |
| --- | --- |
| Field labels (existing `settings.*`) | `Language`/`语言`, `Theme`/`主题`, `Density`/`密度`, `Accent color`/`主题色`, `Background palette`/`背景调子`, `Sidebar position`/`侧栏位置`, `Font scale`/`字体大小` |
| Per-field actions (accessible names) | `Retry <Label>`/`重试 <Label>`, `Discard <Label>`/`放弃 <Label>`, `Reload <Label>`/`重新读取 <Label>` |
| Pane actions | `Reset to defaults`/`恢复默认` (existing label), `Export Appearance draft`/`导出外观草稿`, `Discard all changes`/`放弃全部更改`, `Retry all`/`全部重试` (visible label and accessible name, enabled or disabled) |
| Field messages | `<Label> is saving.`/`<Label>正在保存。`; `<Label> is being reset to its default.`/`<Label>正在恢复默认。`; `<Label> was not saved.`/`<Label>未保存。`; `<Label> was not reset to its default.`/`<Label>未恢复默认。`; `Saved <Label> is unavailable. Reload it; this is not a new unsaved change.`/`已保存的<Label>不可用。请重新读取；这不是新的未保存更改。` |
| Status lines | `Appearance settings saved.`/`外观设置已保存。`; `Defaults restored.`/`已恢复默认设置。`; `Export failed. Please retry.`/`导出失败，请重试。`; `Retrying unsaved appearance changes…`/`正在重试未保存的外观更改…` (the ellipsis is U+2026); `1 appearance change is not saved.`/`1 项外观更改未保存。`; `<n> appearance changes are not saved.`/`<n> 项外观更改未保存。` (n ≥ 2 in EN; ZH uses one form for every n ≥ 1) |
| Reset confirmation (`window.confirm`) | `Reset theme, density, font scale, accent color, background palette and sidebar position to their defaults? Language is kept.` / `将主题、密度、字体大小、主题色、背景调子和侧栏位置恢复为默认值？语言保持不变。` |
| Topbar status | Accessible name `Appearance changes not saved. Review them in Settings.` / `外观更改未保存，前往设置查看。`; visible text `Not saved`/`未保存` where the Topbar summary is visible (above 760 px), icon only otherwise |
| Sign-out confirmation (`window.confirm`) | `Some appearance changes are not saved. Sign out and discard them?` / `部分外观更改尚未保存。仍要退出并放弃这些更改吗？` |

All wording appears in the language currently displayed. The disabled Retry all adds no wording of its own: no hint, tooltip, replacement label or description (A2.2).

## 6. Reset to defaults: a recoverable remove operation

**Meaning.**
- A pane-scoped removal of exactly six physical keys: `xai_pref_theme`, `xai_pref_density`, `xai_pref_font_scale`, `xai_accent_hue`, `xai_rail_pos` and `xai_bg_tone`. After verified absence the UI and the document return to the defaults.
- It is not writing default values, a global reset, or Discard.
- It never reads, writes or removes `xai_pref_lang` or any other key: Features toggles, pet, rail order, other panes or account data.

**Control.** A pane-local button replaces the footer's Reset:
- visible label `Reset to defaults`/`恢复默认`;
- `data-testid="appearance-reset-defaults"`;
- placed in the A2.8 bottom action area, at the inline start of its own line after the recovery action group;
- keyboard operable, at least 44×44 at every width, and subject to the R-PET rule for new controls (§9).

**Confirmation.**
- `window.confirm` with the §5 normative text runs before any intent exists.
- **Declined:** from activation until the declined action returns, zero get, set or remove attempts on every key, and no state change.
- **Accepted:** the batch below.

**Batch admission.**
- On acceptance, synchronously establish six typed reset intents and a batch identity before any asynchronous settlement. Each intent uses its binding's accepted `reset`.
- This is not a cross-key transaction: no rollback of successful fields and no all-or-nothing promise.
- There is no account gate. The batch works with an account, a demo or while locked, and continues if the pane unmounts.

**Per-field reset truth.**
- Track set and reset as distinct draft intents, even when their displayed values are equal.
- Reset success requires verified absence.
- A failed remove keeps a **reset draft**. It displays and applies the default with the "was not reset" message, and keeps Retry, Discard, export, Topbar status and the unload warning.
- Retry of a reset draft whose removal failed re-attempts removal only and never writes. When the hook holds no failed request, its `retry` performs a *set* of the displayed value (`usePrefAsync.ts:278`); a reset draft's Retry must never reach that path. (The one inherited exception, where the held request is a superseded set, is the Features follow-up 2 ordering under "Retry all over reset drafts" below; this scoping matches Features acceptance §3.)
- An already-absent field completes through the engine's verified no-op (`prefMutation.ts:203–205`). No default bytes are seeded.
- An invalid or unavailable source follows the shared refusal (`:198`). The reset intent is kept until legitimate recovery or Discard. Reset is never authority to purge malformed or unreadable bytes.

**Partial reset and queue behavior.**
- Only unresolved fields remain drafts, export entries, Topbar status reasons and unload reasons.
- Retry targets only those fields. Successful fields are not removed again.
- A duplicate Reset to defaults while the batch is pending enqueues no duplicate removes.
- Repeating an unchanged failed reset keeps its refusal or uncertainty authority and does not rebase.
- A clean completed batch may later receive a fresh reset. An intervening edit is a new intent.

**Ordering.** Cover:
- pending set → reset, pending reset → set, and reset → set → reset;
- a **Topbar** theme or density edit during a pending batch, which supersedes that field's reset intent;
- equal displayed default values;
- a successful and a failed predecessor, each with the latest in both directions;
- an in-flight predecessor set + Reset + predecessor failure, for one root and one registered field (Features follow-up 2);
- discard → new same-field work.

The latest set or reset's own completion governs the result. An old set or reset success cannot make a newer one appear saved. The hook's `reset()` settles superseded queued sets with a `conflict` refusal (`usePrefAsync.ts:284`); those results must not surface as failures of the latest intent.

**Uncertainty.**
- When a remove succeeds but readback is denied, Retry verifies absence with exactly one total remove and a single reconciliation.
- A conflict preserves the external bytes and the reset draft.
- An unrelated field can still save while reset recovery is blocked.
- Never clear the whole batch because one remove succeeded or because the handler returned.

**Status.** "Defaults restored." appears only when all six matching reset operations have completed (verified absence or verified no-op) and no newer contrary edit has superseded any of them.

**Retry all over reset drafts** (A2.3, A2.6).
- Every failed item of a batch is eligible. For an item whose removal failed, Retry all re-attempts that removal exactly once and never writes.
- Items still pending are excluded, so Retry all never enqueues a duplicate removal.
- A Reset accepted while a pass is open supersedes the members on its six fields, and a language member continues.
- When a pass consisting only of reset members completes the batch, the status line reads "Defaults restored." under the condition above (A2.4 rule 4).
- The ordering of Features follow-up 2 (an in-flight predecessor set, then Reset, then the predecessor's failure) is inherited. A per-field Retry or a Retry all over such a field first re-runs the superseded set and then the queued removal, so the final bytes are the reset's verified absence. This transient write is recorded, not changed, and is covered in `retry-all` and `queues`.

**No global wiring.** `resetAllPrefs`, `SettingsFooter`, `confirmAction` and `RESET_DEFAULTS` stay untouched.

## 7. Device continuity, App lifetime and protection

**No account machinery.**
- The seven keys stay unscoped device keys.
- For these fields, the controller never reads, writes or acquires any account physical key (`xai:account:v1:*`, `xai:demo:v1:*`), account lifecycle lock, generation marker, tombstone or recovery admission. Prove this with spies on lock names and keys that follow the F-B002 rule (§12).
- An unrelated held account lifecycle lock must not delay a device edit or reset.

**Lifetime.**
- **Inside one App mount** drafts and operations survive route changes, Settings pane switches, opening and closing the popover, pane unmount and remount, and a held per-key lock. So does an open Retry all pass: it lives in the controller (A2.9), and a remounted pane shows its current state.
- **Sol layer.** With the controller mounted under a real `accountScope` without the gate, drafts, reset drafts and held operations survive A→B, A→locked, locked→A and same-account epoch changes, and an admitted reset batch continues.
- **Production App.** A scope change remounts the App subtree (§3 item 10), and in-memory drafts are lost. After the remount the controller displays the committed bytes, with no Saved claim and no runtime error. This is the retained REL-09 limitation, documented by host row k.

**Protection.**
1. **No Settings route guard.** The pane registers no departure guard. Sidebar, AppRail, Back, Forward and relative navigation are never held by Appearance drafts. The drafts stay owned by App and visible through the Topbar status.
2. **Topbar status.**
   - App passes an Appearance-package status component through a new optional `appearanceStatus` slot (`ShellProps`, `TopbarProps`). The Topbar renders it immediately after `premiumBadge` in `.topbar-controls`.
   - **When it renders.** It renders **nothing** (no DOM node) unless at least one field has a settled unsuccessful draft: not saved, not reset, conflict or uncertain. A field that is only pending does not render it; the pane shows "is saving." and the unload warning still protects it.
   - **What it is.** A button, at least 44×44 at every width, with the §5 accessible name and visible text.
   - **What it does.** Activation by pointer, Enter or Space navigates exactly once to `/app/settings/appearance` through an App callback. The callback emits the existing `web:shell:module-change` shortcut event, as Shell does for Settings, then calls `navigate`.
   - It never touches storage, never retries and offers no Retry all.
   - **During a Retry all pass** its members are pending, so they do not render the status by themselves. The status returns as soon as a member fails again, and stays hidden after a full success (A2.6).
3. **Unload.**
   - The controller registers a `beforeunload` listener only while at least one draft exists, pending or unresolved, set or reset.
   - It warns synchronously, with zero storage attempts in the handler.
   - It is removed when the drafts clear and on unmount.
   - It stays registered throughout an open Retry all pass, because members are drafts. It is removed after a full success and kept after a partial one.
   - There is no warning in a clean or source-only state. This is a cancelable warning, not crash durability.
4. **Voluntary sign-out.** `handleSignOut` awaits the controller's sign-out step immediately before each `requestSettingsDeparture("sign-out")` (`App.tsx:196`, `:205`).
   - **No drafts:** it resolves `true` with zero `window.confirm` calls and zero storage attempts.
   - **Drafts:** one `window.confirm` with the §5 text.
     - **Cancel** resolves `false`: drafts, status and warning are kept, nothing is invalidated, and there are zero history mutations.
     - **OK** discards every Appearance draft with zero set/remove attempts, removes the unload listener and resolves `true`. The existing sequence then continues unchanged: the Settings, Pomodoro or Dashboard coordinator step, the auth coordinator, identity invalidation and the redirect.
   - The existing re-checks after the awaits (`App.tsx:197–198, 206`) stay in place and still run after both steps.
   - **During a Retry all pass** the pending members are drafts, so the step prompts. Cancel lets the pass continue. OK detaches the members with zero set or remove attempts by the step, and their late completions change nothing (A2.3, A2.6).
5. **Forced transitions** — a scope change from another document, an auth loss, the account-deletion bridge (`AppProviders.tsx:17–24`) — are never blocked by Appearance.
6. **Unmount** removes the listener, subscriptions and callbacks. Old callbacks refuse, based on live disposal state, and open Retry all passes are detached. Committed writes are not undone.

## 8. Sparse memory export

**Format.** The filename is `appearance-draft.json`. It uses the set/reset envelope, so that a requested removal can never read as a saved default:

```json
{"version":1,"kind":"appearance-draft","changes":{"device":{"theme":{"operation":"set","value":"dark"},"accentHue":{"operation":"reset"}}}}
```

- Field ids: `lang`, `theme`, `density`, `fontScale`, `accentHue`, `railPos`, `bgTone`.
- Each field appears at most once, as its latest actual unresolved intent:
  - a set as `{"operation":"set","value":<strictly validated value>}`;
  - a reset as `{"operation":"reset"}`, with no invented value.
- A pending reset of all six contains six reset entries. A partially successful batch contains only unresolved entries.
- Never include an account bucket, account ID, physical key or timestamp.
- Never include saved, default or source-only fields.
- There is no empty download; Export and Discard all render only while drafts exist.
- An export during an open Retry all pass includes the pending members as their latest unresolved intents. Retry all itself never exports.
- This is a recovery file. It is not an import feature and not proof of saving or resetting.

**Behavior.**
- **Memory only.** Export reads captured drafts and makes zero `getItem`, `setItem` or `removeItem` attempts on any key. This holds while every Storage operation throws, while operations are held, and during a partial reset.
- **Liveness rechecks.** Recheck that the controller is live and not disposed before setup, after Blob creation, after URL creation and after append, immediately before the click. Unmount during setup cancels the click.
- **Failure handling.**
  - A Blob, URL, append or click error shows the localized export error and keeps drafts, tokens, the Topbar status and the unload warning.
  - The anchor is removed and the URL revoked on a best-effort basis, including after a late setup failure.
- **No side effects.** Export never saves, resets, discards or retries.

**Native disk evidence.** Use actual Chrome downloads, parsed from disk and compared to the whole expected envelope with deep equality.

Required shapes:
1. a sparse set left by a **Topbar** failure (theme);
2. a sparse registered set (accent);
3. a background choice with both writes failing (`bgTone` and `accentHue` entries);
4. mixed set and reset;
5. **all six pending resets**;
6. all seven sets, including language;
7. an export while one operation is held behind a real lock;
8. an export after navigating away from the pane and back (App-lifetime drafts).

Every export runs under total storage denial, and each must show:
- attempt-level counters, recorded before delegating to Storage, at zero for reads, writes and removes;
- exactly one object URL created, and that same URL revoked;
- the anchor removed;
- afterwards, the unload warning still active and, for settled failures, the Topbar status still shown.

Additionally, one native setup failure (`createObjectURL` or the click throwing) must meet the same assertions and show the localized error. Unmount during Blob, URL or append time may remain Sol evidence (jsdom with real storage, hook and engine).

## 9. Actual host, keyboard and responsive presentation

**Composition.**
- Every host, native and visual row runs in the production `App` composition: the `apps/web/src/main.tsx` module order and the production router, `AccountStorageGate`, `AccountDataGate`, Shell (AppRail, Topbar), DesktopPet, CmdK, ComposedSettings with the coordinator and `settingsDeparture`, and the real Appearance package, hooks, engine, registry and codecs.
- **The only synthetic input is the auth session.** Bundle provenance must show every module comes from the archive under test (pattern: `../web-features-recovery-native/native-app.tsx`).

**Host matrix.**

| | Scenario | Required behavior |
| --- | --- | --- |
| a | Topbar success | For every Topbar value: exact bytes; no status; `aria-checked`, the summary, `<html>` and (if mounted) the pane show the same value |
| b | Topbar failure | The choice stays displayed and applied; the status appears at every width; Review navigates exactly once to the pane, which shows the field message with Retry and Discard; a successful Retry removes the status |
| c | Held Topbar write | While the write is held behind the real `prefMutationLockName("xai_pref_theme")` lock: no status and controls enabled. After release: exactly one write and no status |
| d | Pane failure, then the sidebar to another pane | Not held, no dialog, status shown; on return the drafts are intact |
| e | Pane failure, then AppRail or programmatic navigation | Not held, status shown, drafts intact |
| f | Back and Forward with drafts | Not held. Compare `{pathname,key,state}` with deep equality against an ordinary navigation; drafts intact; zero runtime errors |
| g | Sign-out with drafts | From `/app/tasks`, from the Appearance pane, and from the More pane with a More draft: one confirm. Cancel resolves `false` with zero history mutations and identity intact. OK discards with zero writes; in the More case the coordinator dialog then appears exactly as before, and Stay resolves `false`. History counters and runtime-error gates on every run |
| h | Sign-out without drafts | Zero confirm calls; outcome identical to `5cd63ff` in both auth branches |
| i | `beforeunload` | Warns only with drafts; zero storage attempts in the handler; none in clean or source-only states |
| j | Cross-document | An idle second document updates live: `<html>` attributes, Topbar and pane. A drafted field in it becomes a preserved conflict |
| k | Forced scope change | Driven through the identity channel from a second document (`AccountStorageGate.tsx:8, 39`): remount, committed values displayed, no Saved claim, zero runtime errors |
| l | Malformed bytes at load | For every §5 item 2 value: no route error, the default displayed and applied, the pane source alert with Reload only, zero writes |
| m | Status navigation held by another caller | With a More draft held by the Settings coordinator, activating the status shows the coordinator dialog. A successful More Retry releases **exactly once** to `/app/settings/appearance`: one live `proceed()`, zero non-live blocker calls, one router location commit, zero runtime errors |
| n | Cross-surface latest intent | A pane theme edit then a Topbar theme edit, and the reverse, with the first held behind the real lock. The latest wins, both surfaces show the same state in every sampled frame, and each edit makes exactly one per-key lock request |
| o | Retry all across surfaces | A failed Topbar theme choice, a failed pane accent edit and a failed Reset item, then one trusted Retry all on the pane. Exactly one write or remove per failed key and zero on every other key. The Topbar status is hidden while the pass is open and absent after full success; `beforeunload` is removed; Retry all stays rendered and becomes disabled with no description, and focus stays on it (never `<body>`); "Appearance settings saved." appears only after the last member's verified completion. History counters show zero mutations; zero runtime errors |
| p | Partial Retry all | As row o with one key still denied. The status line reads "1 appearance change is not saved."; the Topbar status returns; `beforeunload` still warns; Export contains only the unresolved entry; focus stays on Retry all, which stays enabled |
| q | Open pass, held and superseded | One member held behind the real `prefMutationLockName(<key>)` lock. A second trusted activation by click, Enter and Space adds zero attempts. Leaving the pane by the sidebar and returning keeps the pass, the `aria-disabled` button and the in-flight line. A Topbar choice for the held field then supersedes it: after release, the old completion does not mark the new choice saved, and the final bytes equal the Topbar choice |
| r | Sign-out during an open pass | One confirm. Cancel resolves `false` and the pass continues to settle. OK discards with zero set or remove attempts by the step; the held member's late completion changes no draft, status line or Topbar status; identity is invalidated as in row g; zero runtime errors |
| s | Disabled Retry all across states | <ul><li>In each of three runs, a clean load, a pane theme write held behind the real `prefMutationLockName("xai_pref_theme")` lock (pending only) and `xai_rail_pos` = `diagonal` at load (source only): Retry all is rendered with `aria-disabled="true"`, no `disabled` attribute and no `aria-describedby`. After a trusted Tab to it, Enter and Space each make zero set or remove attempts on every key and keep focus; so does a trusted click. The status line shows no failure line.</li><li>From the clean state, a failed Topbar theme choice enables it on the pane, described by the count line.</li><li>During an open pass whose only member is held behind the real lock with a write fault armed, and with focus on the disabled button, the member's failure on release enables it; focus stays, and the count line becomes its description.</li><li>History counters show zero mutations; zero runtime errors; `document.activeElement` is never `<body>`.</li></ul> |

**Responsive presentation.** EN and ZH, at 375, 414, 768, 1024 and 1440.

States to check:
- clean: Retry all disabled and Reset to defaults, with no Export, Discard all or "Save & apply" and no Saved claim;
- all seven unresolved: 7 recovery blocks (14 Retry/Discard buttons), Retry all enabled, Export and Discard all;
- a partial reset, with Retry all enabled because failed reset items are eligible;
- a partial Retry all result: one field still failed, the count line shown and Retry all enabled;
- one source-only Reload, with Retry all disabled;
- the Topbar status visible, from a Topbar failure, on the pane and on `/app/tasks`;
- at 768 only (EN and ZH): an open pass held behind the real lock, with Retry all disabled.

For each control, after scrolling it into view:
- a center hit-test lands on the control;
- it is not covered;
- pane controls are contained horizontally within `.settings-detail`, and Topbar controls within `.topbar` and the viewport;
- neither the document nor the detail scrolls horizontally;
- with the status visible, every Topbar control stays inside the viewport, center-hit and at least 44×44.

**DesktopPet and other App-level overlays (R-PET rule).**
- **Gated run.** All checks above run with the pet hidden through the product's own rail pet toggle (trusted, hit-tested click), as in the accepted Sticky and Features compositions.
- **Pet-on run.** Every width and language is repeated with the pet on at its default position (`resolveDefaultPetPos`), and the occlusion of each control is recorded.
  - **Blocking:** a control that this caller adds or moves — the pane recovery blocks, Retry all, Reset to defaults, Export, Discard all and the Topbar status — must have an uncovered center.
  - **Retry all, additionally (A2.8):** it must meet the A2.8 gate. That means geometric separation of at least 8 px from the pet's left edge, center and four inset points on the button, and zero intersection with the pet box. The pet-on probes are taken both after scrolling it into view and with `.module-settings` scrolled to the end of its range, in every state of the list above in which the pane is shown, enabled and disabled, including 768×1024. This clause applies to Retry all only.
  - **Recorded, not blocking:** coverage of a control left unchanged in place is appended under UX-03/SHELL-05 with before and after evidence.
  - A caller may not move a functional control into the default pet band. Mitigations are layout inside `.appearance-pane`, such as the start-aligned bottom action area of A2.8 or bottom clearance.
  - The pet is neither hovered nor focused during probes.
  - The pet itself is never moved, hidden, restyled or repositioned by this caller's code.
- The sign-out and reset prompts are browser-native and are not hit-tested. CmdK is closed in every run.

**Sizing and CSS.**
- Recovery, Retry all (enabled and disabled), reset and status targets are at least 44×44 at every width.
- The bottom action area follows A2.8: normal flow, start-aligned and wrapping, with no `.pane-footer` or `.pane-save` class.
- The disabled Retry all uses one rule set under `.appearance-pane`, keyed on `[aria-disabled="true"]`, that declares only colours, opacity and the cursor (A2.2). The CSS audit records its declarations: colours from neutral `--text-*`, `--bg-*` and `--border-*` tokens only, with no `--accent*`, `--red*` or `--danger` token and no `pointer-events: none`.
- Existing control geometry may not shrink.
- New CSS adds selectors only under `.appearance-pane`, `.appearance-recovery-*` and `.appearance-status*`, in the Appearance stylesheet.
- Existing Appearance rules stay byte-unchanged: the fixed file begins with the before file.
- `plugin-web-tokens` CSS (`layout.css`, `tokens.css`) and the settings-shell stylesheet are not edited.
- Any containment fix for 375 px is a `.appearance-pane`-scoped override.

**Disabled Retry all presentation (measured, A2.2).** Natively, with the pet hidden, and in the clean state unless a check says otherwise:
- **Contrast.** At 1440 in EN, in the light and dark themes with each of the six tones (12 loads from seeded bytes), the label's contrast ratio is at least 3:1. It is computed in sRGB from the rendered colours of the label and the button background, with the element's effective opacity applied over the nearest opaque ancestor background.
- **Accent independence.** In the light theme with the default tone, the computed `color`, `background-color` and `border-color` are equal with `xai_accent_hue` absent (165) and with it seeded as `25`.
- **Distinction.** In the same theme and tone, at least one of the computed `color`, `background-color`, `border-color` and `opacity` differs between the clean state and the state with one failed sidebar-position write, where the button is enabled.
- **Focus ring.** After a trusted Tab to the disabled button, `:focus-visible` matches and the computed `outline-style` is `solid` with an `outline-width` of at least 2 px, at 375 and 1440 in EN and ZH.
- **Attributes.** `aria-disabled="true"`, no `disabled`, `title` or `aria-describedby` attribute, computed `pointer-events` other than `none`, and an accessible name equal to the visible label.

**Screenshots,** all reviewed manually:
- ten all-seven-unresolved screenshots (EN/ZH × five widths);
- the Topbar status at 375 and 1440 (EN/ZH);
- the partial-reset state at 375 (EN/ZH);
- the partial Retry all result at 375 (EN/ZH);
- the clean state with Retry all disabled and keyboard-focused, at 375 and 1440 (EN/ZH), reviewed for legibility, a visible focus ring and the absence of any failure or success cue;
- the pet-on 768 captures (EN/ZH): before, with the pet over "Save & apply" at the top and the end of the scroll range (H14 b); fixed, with the all-seven bottom action area and Retry all clear of the pet at the end of the scroll range, and with the clean-state disabled Retry all clear of it.

**Keyboard.**
- Trusted Tab reaches every control in DOM order with visible focus, including the Topbar status, before the appearance trigger. In the bottom action area the order is Retry all, Export, Discard all, then Reset to defaults. Export and Discard all exist only while drafts exist, so the clean order is Retry all, then Reset to defaults. Retry all is a Tab stop in every state, enabled or disabled.
- Enter and Space each activate a card, segment, swatch or button exactly once: one operation, no double firing, no page scroll on Space. They open the reset confirmation exactly once.
- **Retry all by keyboard** (A2.7):
  - Enter and Space each start exactly one pass, with exactly one attempt per eligible field.
  - A second Enter or Space while members are pending adds zero attempts.
  - While the button is `aria-disabled` (clean, pending only, source only, or an open pass with E empty), Enter and Space make zero operations, focus stays and Space does not scroll.
- On the sliders, each arrow key step is one edit, Home and End reach the bounds, and the final bytes equal the last value.
- Focus targets:
  - after a keyboard per-field Discard or Reload, focus lands on the field's selected control (or its slider);
  - a recovery block that unmounts after a successful Retry returns focus to the same place;
  - after Discard all, focus stays inside `.appearance-pane`, on Reset to defaults, never on `<body>`;
  - after an accepted reset, focus stays on Reset;
  - after a keyboard Retry all that fully succeeds, focus stays on Retry all, now disabled, never on `<body>` and never moved to Reset; after a partial result it stays on Retry all, enabled (A2.5).
- The popover's keyboard behavior is unchanged: Escape closes it.

## 10. Downstream consistency, crash safety and cross-module isolation

**Nothing changes in:**
- keys, defaults, registry codecs, ownership or lifecycle;
- dual writes, aliases or migrations;
- the readers outside the unit: `NotFoundPage`, `AccountStorageGate`, `WebShellProvider`, Shell, AppRail, CmdK, DesktopPet;
- `readLocalPref` (byte-identical, still exported);
- the tokens `apply*` helpers, the core event types and the settings shell.

Readers must reflect **committed bytes**; display consumers reflect the controller's display values.

Required evidence:
1. **Exact bytes** for every value at the Sol layer and natively: 33 pane values (language 2, theme 3, density 2, font scale 7, accent 6 presets plus slider values 0, 220 and 360, rail 4, background 6, each background with its paired accent bytes) and 7 Topbar values.
2. **Byte compatibility.** Every root value written by the fixed product is read back identically by the unchanged `readLocalPref`, by `NotFoundPage` (theme) and by `AccountStorageGate` (language) in a new document. A value written by `5cd63ff` is read identically by the fixed product.
3. **Display truth.**
   - These reflect display values, and after Discard or Reload the committed bytes:
     - `<html>` `data-theme`, including the `system` resolution and its media-query listener, `data-density`, inline `font-size`, `--accent-hue`, `data-bg-tone` presence or absence, and `data-rail-pos`;
     - `.app[data-rail-pos]`;
     - the Topbar's `aria-checked` and summary;
     - the pane's active state;
     - the language of every string.
   - **Exactly one controller in production:** a pane edit is visible in the Topbar, and a Topbar edit in the pane, in the same frame.
4. **Crash safety (SHELL-04).**
   - Every §5 item 2 value at load leaves App rendering without the route error boundary, with defaults and zero writes.
   - A malformed value written by a second document while the app is running leaves the idle field in its source state without a throw.
5. **Cross-document.** Language, theme, density and font scale now propagate live to an idle second document, and accent, rail and background still do. A drafted field becomes a preserved conflict.
6. **Chrome invariance in the clean state.**
   - With no drafts, for the same seeded bytes, these are identical between `5cd63ff` and the fixed product:
     - the Topbar `outerHTML` (EN and ZH, at 1440 and 375, popover closed and open);
     - the `<html>` attributes after load, with the inline style compared as a property → value map (declaration order may differ);
     - the `.app` attributes.
   - This proves that other accepted callers' native visual evidence stays valid without rerunning it.
7. **Cross-module isolation.**
   - During and after every Appearance operation — edit, Retry, Retry all (full and partial), Discard, Discard all, Reload, full and partial reset, export, the sign-out step with Cancel and OK — the product dispatches zero `StorageEvent`s and zero `web:settings:preference-changed` events. Count these with an instrumented `window.dispatchEvent` and bus spy.
   - The bytes of every localStorage key other than the seven are unchanged (snapshot), including the eight Features keys, pet id and position, and rail order.
   - The Features rail, route and search truth and the DesktopPet id and position are unchanged.
8. **Protected paths unchanged.** `git diff 5cd63ff <fixed>` is empty for:
   - `packages/plugin-web-storage`, `packages/plugin-web-settings-shell`, `packages/plugin-web-tokens`, `packages/core`, `packages/xai-web-event-bus`, `packages/xai-web-pet`, `packages/xai-web-cmdk`, `packages/xai-web-settings-features-panel`, `packages/plugin-web-settings-rest`, `packages/xai-web-dashboard-grid` and `packages/xai-web-dashboard-widgets`;
   - every `packages/xai-web-shell` path except the §11 shell files;
   - every `apps/` path except `apps/web/src/App.tsx` and new `apps/web/src/__tests__/App.appearance*.test.tsx` files;
   - every Appearance-package path not listed in §11;
   - `package.json` and `pnpm-lock.yaml`.
9. **Search repeated at the fixed SHA.** Repeat §2's writer and reader search; new hits may appear only in §11 files. In addition:
   - the Appearance package's product source contains zero `localStorage`, `setPref(`, `removePref(`, `usePref(`, `emitWebEvent(`, `new StorageEvent`, `dispatchEvent(` and `SettingsFooter`, and no `pane-footer` or `pane-save` class (A2, A2.8);
   - `Topbar.tsx` contains zero `localStorage`;
   - `App.tsx` contains no `writeLocalPref`, no `localStorage.setItem`, no `onWebEvent("web:settings:preference-changed"` and no `usePref(`. The only remaining storage access is `readLocalPref`, byte-identical.
10. **Unchanged host and reader tests pass from the fixed archive and from `5cd63ff`** (G1):
    - `apps/web`: `App.lazy-init` (APP-LP1–5 and three `readLocalPref` unit tests), `App.signout` (7), `shell.smoke`, `shell.theme`, the three composition tests, `cmdkIntegration`, `railFeatureFilter`, `departureCoordinator.blocker` and the router tests;
    - `xai-web-shell`: every test file except the dispositions of §11;
    - the Appearance tests marked "unchanged" in §11.
11. **Storage and lifecycle.** Storage check-types passes, and `lifecycleForKey` still classifies the seven keys as device-preference, device-recovery, retain and retain-on-device.
12. **Isolation from accepted callers.** E24 and E25 counts equal their accepted receipts.

## 11. Protected surface and Terra's files

**Terra may edit only:**
- **Appearance package** (`packages/xai-web-settings-appearance/`):
  - `src/AppearancePane.tsx`;
  - `src/types.ts`, additive types only;
  - `src/index.ts`, additive exports only: the provider, the Topbar status component and the controller hook with their types; existing exports unchanged;
  - at most four new local modules under `src/internal/`:
    - the controller: bindings, the operation and recovery model including Retry all passes, DOM application, unload and the sign-out step;
    - the EN/ZH recovery copy;
    - the Topbar status component;
    - the pane-local bottom action area: status line, Retry all, Export, Discard all and Reset (A2.8, A2.9);
  - additive selectors in `src/styles.css`, scoped as §9 requires;
  - test files under `src/__tests__/`, per the dispositions below, plus new Appearance-local test files, including a local Web Lock fixture and the Retry all tests required below;
  - the Appearance sections of `docs/api.md` and `docs/test.md`. They must describe the App-scoped controller, the absence of a route guard, the Topbar slot, the sign-out step, the retired event path and Retry all (A2).
- **Web shell** (`packages/xai-web-shell/`):
  - `src/Topbar.tsx`: each option activation calls its setter exactly once with the option's value and makes zero Storage attempts; render the optional `appearanceStatus` node immediately after `premiumBadge` in `.topbar-controls`. Nothing else.
  - `src/Shell.tsx`: pass `appearanceStatus` through. Nothing else.
  - `src/types.ts`: an additive optional `appearanceStatus?: ReactNode` on `ShellProps` and `TopbarProps`, with doc comments. Nothing else.
  - `src/__tests__/Topbar.test.tsx`, per the dispositions below.
  - The Topbar section of `docs/api.md`.
- **App** (`apps/web/`):
  - `src/App.tsx`:
    - create and provide the controller once inside `AccountStorageGate`;
    - feed its display values to `WebShellProvider`, Shell and DesktopPet, and its edits to the Topbar setters;
    - remove `writeLocalPref`, the preference-changed subscriber, the root `useState`s, the three legacy `usePref` reads and the `apply*` and media-query effects;
    - pass `appearanceStatus` and the review callback;
    - await the sign-out step before each `requestSettingsDeparture("sign-out")`.

    Everything else is unchanged: `readLocalPref`, `petOn`, the feature filter, the AI subscribers, the DEV seed, CmdK, the remaining sign-out sequence and `App()`.
  - New files `src/__tests__/App.appearance*.test.tsx`. Existing App tests stay unchanged.
- **Terra's run record (E6):** new files under `docs/reviews/web-appearance-recovery-terra/` only: `implementation.md` (commands, exit codes, per-file counts, deviations and open questions) and the raw logs of Terra's own package runs. They may be committed with the product change or in the immediately following commit, and they are additions only.

The fixed-product diff (`git diff --name-only 5cd63ff <fixed> -- apps packages package.json pnpm-lock.yaml`) must list only the product files above.

**Test dispositions.**

| Existing tests | Disposition |
| --- | --- |
| AC-RENDER-1, -2, -4, -5, -6, -7; AC-I18N-1–3; AC-DEF-1–9; AC-CONST-*; AC-REG-1–4 | Unchanged |
| AC-RENDER-3, AC-RENDER-8 | Seed stored bytes instead of DOM state (`xai_pref_theme` = `"dark"`; `xai_pref_font_scale` = `1.1`). Same assertions |
| AC-LIVE-1, -2, -7 | Keep the DOM assertions; may install the Web Lock fixture and await real completion; drop the emission assertion |
| AC-LIVE-3, -4, -5, -6 | Keep the byte assertions after awaiting real completion with the lock fixture; drop the emission assertions |
| AC-LIVE-8 | Replaced: choosing 简体中文 persists `"zh"` and marks it selected; still no `data-lang` attribute |
| AC-SAVE-1, AC-SAVE-2 | Retired with the footer (A2). Replaced by Retry all tests: with no settled unsuccessful draft the pane renders Retry all disabled (`aria-disabled="true"`, no `disabled` attribute) and no "Save & apply" or "Saved"/"已保存", and one activation makes zero storage attempts; with a failed draft, Retry all is enabled and one activation re-attempts exactly the failed field once; no Saved claim without a genuine latest success |
| AC-RESET-1 | Adapted to the pane-local button: six verified absences, DOM defaults, and `xai_pref_lang` bytes unchanged |
| AC-RESET-2 | Replaced: six reset intents, zero preference-changed emissions, language untouched |
| AC-RESET-3 | Same meaning: declined means zero storage attempts (counting injector) and no state change |
| AC-RESET-4, -5, -6 | Same meaning; the locator becomes the role and name "Reset to defaults" |
| AC-I18N-4 | Replaced: the pane-local Reset shows 恢复默认 in ZH |
| Topbar TP0–TP7, TB-PREMIUM-1 | Unchanged |
| Topbar TP1-Persist … TP3b-Persist (7) | Replaced: each choice calls its setter once with its value and makes zero Storage attempts. Persistence is asserted at App level in the new App test |
| Topbar TP-Persist-Quota-Safe | Replaced by an App-level test: a failing write keeps the choice displayed and applied and shows the Topbar status |
| New Appearance-local tests (required) | Terra's own Retry all coverage at the hook layer, with the real engine and the lock fixture: A2.2 render, enabled and disabled states (attributes, Tab order, inert activation, the description rule); A2.3 scope, exclusions, one attempt per member and no duplicates; attribution and late completions; the A2.4 lines in EN and ZH, including the clean-state rule; A2.5 focus, including focus kept when a pass disables the button. These complement, and never replace, Sol's frozen `retry-all` oracle |

**Implementation expectations.**
- Use one coherent local operation model. Retry all is part of it: a controller method over the per-field Retry actions, not a separate retry engine.
- Do not extract a generic recovery framework, and do not refactor an accepted pane.
- The pane stays usable standalone (A3).

**Protected.**
- In the Appearance package: `src/internal/appearancePane.tsx`, `src/constants.ts`, `src/appearanceDefaults.ts`, `package.json`, `manifest.json`, configs (`tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, `eslint.config.js`), `docs/design.md` and `docs/dev_log.md`.
- In `xai-web-shell`: AppRail, AvatarMenu, SignOutConfirmDialog, `registry.tsx`, `icons.tsx`, `index.ts`, `internal/*`, fixtures, all other tests, `package.json`, configs, `docs/design.md` and `docs/dev_log.md`.
- In `apps/web`: everything except `App.tsx` and the new test files: routes (coordinator, `settingsDeparture`, composition, registrations, router), providers, pages, `main.tsx`, `dev/`, styles and existing tests.
- The shared storage hook, engine, registry, ownership, codec and lifecycle code, including legacy `usePref`.
- The settings shell (`SettingsFooter`, `confirmAction`, `resetAllPrefs`, `defaults.ts`, `SettingRow`, types), tokens (`apply.ts`, `i18n.ts`, CSS), core types, the event bus, pet, CmdK and `apps/desktop`.
- The accepted Date & Time, Notifications, More, Sticky, Smart Lists, Collaborate, Pomodoro, Header and Features callers.
- Reviewer evidence, including every frozen F1 runner, fixture, prelude and log and the F-B002 files; the ledgers; and the control plane.

**Shared defects.** This includes any defect in the engine's open-ended branch for device keys (A4). A correct new shared defect requires all of the following before any product repair:
- a frozen before oracle;
- an Astra-role impact review;
- explicitly revised ownership;
- affected accepted-caller reruns (precedent: F1, `0ba68d7` → `f359be6` → `3ea0310`/`f3a3c82`).

## 12. Before-failure oracles (Sol and parent, before Terra)

**Runner requirements.**
- Use an immutable `git archive 5cd63ff` behind a lockfile-hash gate.
- Copy the oracle into the archive.
- Record both the requested and the resolved SHA.
- Refuse to overwrite an existing log.
- Preserve nonzero exit codes.
- Freeze the oracle files and their SHA-256s with the logs.

**F-B002 rule (spies never re-enter storage).**
- A Storage spy or attempt-counting injector records and then delegates exactly once.
- Inside a spy, never call `accountScope.physicalKey`, `getPref`, `readRawPref`, any `localStorage`/`Storage` method other than the delegated one, or any product helper.
- Compute every physical key before installing the spy. Device keys are their logical keys; account keys named in isolation assertions are precomputed for the captured scope.
- Each oracle file asserts, in a self-check, that its spies make no nested Storage call.

**Sol jsdom modes** (real storage, hooks and engine):

| Mode | Coverage |
| --- | --- |
| `bytes` | All 40 values of §10 item 1 with exact bytes. Root keys through the production App, via the pane and the Topbar. Absent defaults; zero-write mount of App, pane and Topbar; lifecycle classification of the seven keys; byte compatibility with the unchanged `readLocalPref`, `NotFoundPage` and `AccountStorageGate` readers |
| `fields` | Per field ×7: latest-choice failure and Retry, source truth (§5 item 2 and a throwing `getItem`), Saved truth, targeted Discard/Reload, Discard all, the background dual intent, late completions ignored |
| `reset` | All of §6, including one run under a demo scope |
| `queues` | §5 items 4–6 and the §6 orderings, cross-surface latest intent, slider streams, and the in-flight predecessor + Reset + predecessor failure ordering recovered by per-field Retry, in the ruling-5 cases `fu2-retry-theme` and `fu2-retry-railPos` (below) |
| `continuity-export` | §7 Sol-layer lifetime and unmount refusal; §8 apart from the native disk shapes |
| `host` | Production `App` with only the auth-session hook substituted: the §7 protection model (no route guard, Topbar status, `beforeunload`, the sign-out step with a `window.confirm` recorder in both auth branches, forced remount), §10 items 3, 4 and 7 at the hook layer |
| `retry-all` | Production `App` with only the auth-session hook substituted, driven through the pane and the Topbar. **At `5cd63ff`:** H15, today's bottom button after denied writes on each surface, and H17, the same button in the clean state, each with attempt counters, bytes and the flash. **On both products (H16, H17):** §5 item 9 and A2.2–A2.7: <ul><li>render and enabled states, including the disabled state in the clean, pending-only, source-only and open-pass states: `aria-disabled="true"`, no `disabled` attribute, a Tab stop, no description outside a pass, and zero operations for a click, Enter and Space;</li><li>the clean-state status line (§5 item 9);</li><li>scope and exclusions;</li><li>exactly one write or remove per member and none elsewhere;</li><li>no duplicates: a same-turn double activation, an activation while members are pending, and per-field Retry in both orders;</li><li>exact-draft attribution and supersession by a pane edit, a Topbar edit and Reset;</li><li>late completions after Discard, Discard all, sign-out OK and unmount;</li><li>every A2.4 line in EN and ZH, with its precedence;</li><li>A2.5 focus, including focus kept on the button when a full success disables it, `aria-disabled` and `aria-describedby`;</li><li>the §5 item 9 orderings, including the Features follow-up 2 ordering through Retry all in the ruling-5 cases `fu2-retry-all-theme` and `fu2-retry-all-railPos` (below).</li></ul> |
| `original` | The archive's own Appearance package tests and `Topbar.test.tsx`, plus `App.lazy-init`, `App.signout`, `shell.theme` and `shell.smoke` |

- Install a Web Lock fixture with exclusive semantics (pattern: `xai-web-settings-features-panel/src/__tests__/featuresLockFixture.ts`).
  - A pass-through stub cannot prove a held lock.
  - An accidental `lock-unavailable` result is a fixture failure, except in the cases that test lock unavailability on purpose.
- Use an attempt-counting Storage injector that is proven to fire.
- Stub `window.confirm` with a recorder.
- Drive real `accountScope` transitions.
- Select controls only through the §5 stable selectors and accessible names.

**Inherited-ordering oracle (controller ruling 5).** A Sol oracle covers the Features follow-up 2 ordering that §6 and A2.3 inherit, and asserts both the transient write sequence and the final bytes. The ordering: a set is still in flight when Reset is accepted; that set then fails; Retry or Retry all re-writes the superseded value; then the removal runs, and the final bytes are the reset result. This fills, for this caller, the oracle gap that Features follow-up 2 named; the accepted Features oracles stay frozen and unchanged.

| Case | Mode | Field and key | Seeded baseline → pane choice | Recovery action |
| --- | --- | --- | --- | --- |
| `fu2-retry-theme` | `queues` | `theme`, `xai_pref_theme` (root, JSON codec) | `"system"` → Dark, `"dark"` | `Retry Theme` |
| `fu2-retry-railPos` | `queues` | `railPos`, `xai_rail_pos` (registered, string codec) | `bottom` → Right, `right` | `Retry Sidebar position` |
| `fu2-retry-all-theme` | `retry-all` | as `fu2-retry-theme` | as `fu2-retry-theme` | Retry all |
| `fu2-retry-all-railPos` | `retry-all` | as `fu2-retry-railPos` | as `fu2-retry-railPos` | Retry all |

Each case runs in EN in the production `App` with the exclusive Web Lock fixture, the attempt-level Storage injector and the `window.confirm` recorder. The injector's attempt log records every `setItem` and `removeItem` attempt in order, with its key, value and outcome. The other five Reset keys start absent, `xai_pref_lang` holds `"en"`, and every key is snapshotted first. The oracle reads bytes outside its spies, and those reads are not counted. Steps and assertions:
1. **A set in flight.** The fixture holds `prefMutationLockName(<key>)` (`prefMutation.ts:153`), and the pane choice is made. Assert: the bytes are still the baseline; zero set or remove attempts on `<key>`; the field shows "<Label> is saving."
2. **Reset accepted while the set is in flight.** Activate Reset to defaults; the recorder returns `true`. Assert: the field displays and applies the default (`<html>` `data-theme` = `light`, or `data-rail-pos` = `left`), and the five absent keys complete as verified no-ops without a `removeItem` call (`prefMutation.ts:203–206`).
3. **The set fails.** Arm a one-shot `QuotaExceededError` on `setItem(<key>)` and release the hold. Assert: exactly one `setItem(<key>, <choice bytes>)` attempt, which threw (`prefMutation.ts:232`); zero `removeItem(<key>)`; the bytes are still the baseline; the field shows "<Label> was not reset to its default." and still displays and applies the default; the Topbar status is shown; there is no success line. In the `retry-all` cases, Retry all is enabled.
4. **Recovery.** Program the fixture to grant the next acquisition of the key's lock and to hold the one after it. Activate the recovery action.
5. **Transient write sequence.** While the queued removal is held: the attempt log since step 4 is exactly [`setItem(<key>, <choice bytes>)`, returning normally]; the bytes equal the choice bytes, which are the superseded value; the field still displays and applies the default and shows "<Label> is being reset to its default."; there is no success line. In the `retry-all` cases the pass is open: the status line reads `Retrying unsaved appearance changes…`, and Retry all is disabled.
6. **Final bytes.** Release the hold. The attempt log since step 4 is exactly [`setItem(<key>, <choice bytes>)` returning normally, then `removeItem(<key>)` returning normally], with zero set or remove attempts on every other key; over the whole case the log for `<key>` is exactly [failed set, set, removal]. `<key>` is absent, the reset's verified absence (`prefMutation.ts:207–215`); the other five Reset keys are absent; `xai_pref_lang` and every other key equal the snapshot. The draft is cleared. No success line appeared before this point; now `Appearance settings saved.` never appears, `Defaults restored.` is the only permitted success line, and in the `retry-all` cases it appears (A2.4 rule 4). There is no Topbar status, and `beforeunload` is removed. In the `retry-all` cases the pass has closed, Retry all is disabled, and focus has not moved.

At `5cd63ff` each case is a correct FAIL at its first business assertion, in step 1: the pane write ignores the held lock and changes the bytes immediately (H8), and neither Retry control exists (H12, H16). A business FAIL ends the case, so the preconditions of later steps, such as the armed fault being observed, are not evaluated, and the outcome is never a precondition failure. The four cases rerun unchanged on the fixed product and must PASS.

**Parent host baseline** (`web-appearance-recovery-independent/`, jsdom, production `App`):
- each field's failed edit with its sidebar route outcome and its sign-out outcome;
- each Topbar field's failed choice with an AppRail outcome and a sign-out-from-`/app/tasks` outcome;
- a failed reset with its route outcome;
- a failed Topbar theme choice and a failed pane accent edit, then the expected Retry all, with its Topbar-status, `beforeunload` and sign-out outcomes (H16; at `5cd63ff` the control is absent, which is a correct FAIL);
- the clean state: the expected Retry all, rendered and disabled (`aria-disabled="true"`, no `disabled` attribute, a Tab stop), with zero storage attempts for a click, Enter and Space (H17; at `5cd63ff` the control is absent, which is a correct FAIL);
- one clean positive control.

**Native before** (parent, Chrome, production `App`):
- H3 and H5;
- H6 for every crashing value, with a capture of the route error boundary;
- H10 across two documents;
- H14 in EN and ZH: (a) overflow at 375 px; (b) the default-position pet at 768×1024 over "Save & apply"/"保存生效", at the top and at the end of the scroll range;
- H15 in EN and ZH: a denied accent write and a denied Topbar theme write, then a trusted "Save & apply" activation, with attempt-level counters and a capture of the "Saved"/"已保存" flash;
- H17 in EN and ZH: in the clean state, "Save & apply" reached by Tab and activated by a trusted click, with attempt-level counters (four root `setItem` attempts and none on the registered keys) and a capture of the flash;
- provenance: every reader module comes from the archive.

Only the auth-session context may be synthetic.

**Appearance F1-shape before** (parent). A new runner `web-appearance-recovery-f1/verify-f1-appearance.mjs` and host fixture reuse the frozen F1 prelude read-only and hash-checked. Its `selfcheck` mode must be harness-valid. Its `appearance` mode records:

| Case | Scenario | Correct before state |
| --- | --- | --- |
| a1 | Host row m (status navigation released by a More Retry) | `before-absent`: no status control exists |
| a2 | Back from the Appearance pane with a failed Appearance choice | `before-no-indicator`: not held, and no status |
| a3 | Sign-out with Appearance and More drafts | `before-no-appearance-step`: only the coordinator holds |
| a4 | Sign-out from `/app/tasks` with a failed Topbar choice; Cancel at the new step | `before-unprotected`: resolves `true` and invalidates identity |

None of these is an F1 signature.

**Validity and positive controls.**
- Every case asserts its preconditions before its business assertion: control found, seeded bytes present, fault armed and observed.
- A failed precondition is a fixture or selector error. It is never counted as a product failure.
- At `5cd63ff` the absence of a Retry all control is the business failure of H16 and H17, never a precondition failure. The preconditions of a Retry all case are the edit controls it uses, the seeded bytes and the armed, observed faults; a clean-state case arms no fault. The ruling-5 cases follow their own rule above.
- These must pass at `5cd63ff`:
  - zero-write mount;
  - absent defaults;
  - normal persistence and exact bytes for every value through the production App (pane and Topbar);
  - with no fault, "Save & apply" is present and operable, and writes the four root keys with today's exact bytes (the harness drives the current button);
  - a declined reset confirmation makes zero attempts;
  - a working reset removes the three registered keys;
  - APP-LP1–5;
  - the Topbar persistence tests;
  - the §10 item 10 tests;
  - the lifecycle classification.
- No case may use private calls to reach unreachable invalid values.

**Hypotheses to confirm or refute.** None of these is an established defect.

| ID | Hypothesis |
| --- | --- |
| H1 | A failed write of accent, background or sidebar position is silent: the control does not take the choice, and there is no message, Retry, Discard or export. The choice is lost. |
| H2 | A failed write of theme, density, font scale or language made in the pane is silent: the choice is applied while the bytes keep the old value, and it reverts after reload. |
| H3 | Same as H2 for a language, theme or density choice in the Topbar. |
| H4 | "Save & apply" shows "Saved"/"已保存" after a failed write. |
| H5 | With the pane mounted, a Topbar theme or density change is not reflected in the pane, and "Save & apply" then writes the pane's stale value, reverting the Topbar choice. |
| H6 | Each of `xai_pref_lang` `"fr"`, `null`, `1`; `xai_pref_font_scale` `0`, `-1`, `null`, `"big"`, `"1"`; and `xai_accent_hue` `Infinity` makes every `/app` route render the route error boundary instead of the product. |
| H7 | Malformed registered bytes are applied or silently defaulted: `xai_rail_pos` `diagonal` and `xai_bg_tone` `sage`/`neon` reach `<html>`/`.app`, and `xai_accent_hue` `abc` shows 165. There is no source alert or Reload anywhere. |
| H8 | Legacy and raw writes ignore a held `prefMutationLockName(<key>)` lock: the bytes change immediately. |
| H9 | The reset confirmation claims "every preference" and module toggles. A `removeItem` fault on a registered key is swallowed with no feedback. Root fields are reset by writing default values rather than by removal. No "Defaults restored." truth exists. |
| H10 | A committed language, theme, density or font-scale change in another document is not reflected until reload. |
| H11 | With unsaved failed Appearance work, there is no indicator outside the pane, sign-out resolves `true` from any route, and `beforeunload` does not warn. |
| H12 | No Retry, Discard, Reload, export, truthful Saved or "Defaults restored." exists. |
| H13 | A background choice whose accent write fails leaves the tone committed and the hue unsaved, silently. |
| H14 | (a) At 375 px some Appearance controls overflow `.settings-detail` horizontally. (b) At 768×1024 the default-position pet covers the center of "Save & apply"/"保存生效", the inline-end control of the sticky footer, both at the top and at the end of the scroll range. Both are to be confirmed or refuted. |
| H15 | "Save & apply" is not a retry. After denied writes on each surface, activating it: <ul><li>makes zero attempts on a failed accent, background or sidebar key;</li><li>rewrites all four root keys raw, without the per-key lock, from the pane's values (theme, density and font scale from its mirrors, language from its prop). That includes keys that never failed, and can overwrite a Topbar choice the pane did not see;</li><li>swallows any failure;</li><li>shows "Saved"/"已保存" for 1.8 s in every case;</li><li>gives no per-field result.</li></ul> |
| H16 | No real Retry all exists. With several settled failures, including failed Reset items and a Topbar failure, no control re-attempts exactly those drafts once each while skipping pending and source-only fields. There is no truthful bulk status (in flight, the not-saved count, success only after verified completions) and no Retry all focus handling. |
| H17 | In the clean state the pane has no disabled "nothing to retry" state. Its bottom primary action, "Save & apply"/"保存生效", carries neither `disabled` nor `aria-disabled` (`SettingsFooter.tsx:118–125`). With no failed or pending work, one activation: <ul><li>makes exactly four `setItem` attempts, one on each root key, with the pane's values (§3 item 4; `App.tsx:146–152`), so an absent root key gains its default's bytes;</li><li>makes zero attempts on the three registered keys;</li><li>shows "Saved"/"已保存" for 1.8 s (`SettingsFooter.tsx:21, 75–82`) although nothing was unsaved.</li></ul> |

**Freezing and reruns.**
- Freeze oracle files, before logs and SHA-256 hashes before Terra starts.
- If a hypothesis is refuted, record it as PASS. It is not a defect, but its requirement still binds the fixed product.
- Later fixture corrections use a diagnostic suffix, rerun against both archives, and never weaken an assertion.
- Correct FAILs must be preserved through unchanged fixed reruns.

## 13. Gates

The E-numbers refer to §14. A row is complete only when every listed item exists.

| Gate | Required complete evidence | Checklist items |
| --- | --- | --- |
| 1. All seven fields | <ul><li>Every value with exact bytes, default and codec, through both surfaces where they exist.</li><li>Absent zero-write mount.</li><li>Every malformed value and a throwing read per field, with Reload only and no throw.</li><li>Latest-choice failure and Retry per field.</li><li>A value equal to the default is stored.</li><li>Truthful Saved, with no "Save & apply" and no unconditional "Saved" (A2).</li><li>Partial and targeted recovery: several and all seven unresolved; a conflict plus an unrelated quota failure; both set/reset failure directions; the background dual intent; targeted Discard with zero writes and zero sibling reads; Discard all; late completions ignored.</li></ul> | E1, E2, E6, E7, E9 |
| 2. Reset to defaults | <ul><li>Normative confirmation; declining makes zero attempts.</li><li>Six verified absences; an already-absent key is a no-op; never writes; language bytes unchanged.</li><li>Per-field remove refusal ×6, with a reset draft and recovery.</li><li>Partial reset with Retry of only the unresolved fields; no duplicate removes while pending.</li><li>Invalid or unavailable source refusal keeps the intent, with no purge.</li><li>Uncertainty resolved with one remove; conflict preserved.</li><li>Truthful "Defaults restored."</li><li>Unrelated keys unchanged.</li></ul> | E1, E2, E6, E7, E10 |
| 3. Ordering and cross-surface latest intent | <ul><li>§5 items 4–6 for one root and one registered field fully.</li><li>Pane versus Topbar, both directions, with a real held lock.</li><li>Slider streams and keyboard steps.</li><li>Predecessor succeeds while the latest fails; predecessor fails while the latest is queued; repeated failed predecessor; pending Retry is inert.</li><li>Uncertainty with one write; external conflict including restoration and removal.</li><li>set→reset, reset→set, reset→set→reset, a Topbar edit during a batch, and the in-flight predecessor + Reset + failure ordering, recovered by per-field Retry, with the transient write sequence and the final bytes asserted (`fu2-retry-theme`, `fu2-retry-railPos`; ruling 5).</li><li>New work after a discard survives.</li></ul> | E1, E2, E7, E9 |
| 4. Device continuity and export | <ul><li>Sol-layer A→B→locked→A and a same-account epoch change with a real held device-key lock, including during a reset batch.</li><li>No account key, lock or marker touched; an unrelated held account lock does not serialize.</li><li>Unmount refusal of old callbacks.</li><li>Memory-only export under total denial with attempt counters; setup and click failure; unmount cancel.</li><li>Exact native disk JSON for all eight §8 shapes, with the warning and status asserted after each.</li></ul> | E1, E2, E7, E11 |
| 5. Production host and protection | <ul><li>The complete §9 matrix rows a–s in the production App, with history counters and runtime-error gates.</li><li>Trusted input for all 40 values.</li><li>New-document reload with zero mount writes.</li><li>A native held lock and native uncertainty; a second-document conflict.</li><li>The Appearance F1-shape cases a1–a4, before and fixed.</li></ul> | E3, E4, E5, E8, E9, E12, E17 |
| 6. Downstream, crash safety, chrome invariance and isolation | <ul><li>§10 items 1–11.</li><li>H6, H7 and H10 before evidence.</li><li>The before byte, default and reader-test controls PASS at `5cd63ff`.</li></ul> | E2, E4, E7, E13, E18, E19, E20, E21, E22, E23 |
| 7. F1 regression | <ul><li>The 10 frozen F1 invocations and the Features F1 `selfcheck` and `features` modes PASS at the fixed SHA with unchanged runner hashes.</li><li>The Appearance F1-shape mode: before at `5cd63ff` and fixed PASS.</li></ul> | E5, E16, E17 |
| 8. Presentation and keyboard | <ul><li>EN/ZH at five widths: every-control hit-test (pet hidden), the pet-on R-PET run, 44 px targets, Topbar containment with the status visible, the CSS-scope audit, manual screenshots.</li><li>Keyboard, including the focus targets and slider steps.</li></ul> | E4, E14, E15 |
| 9. Retry all (A2) | <ul><li>**Sol:** H15, H16 and H17 correct FAILs at `5cd63ff`, then every §5 item 9 case PASS: <ul><li>render and enabled states, including the disabled state (no `disabled` attribute, a Tab stop, no description outside a pass, inert activation) and the clean-state status line;</li><li>scope, including failed Reset items, and exclusions of pending and source-only fields;</li><li>exactly one write or remove per member and none elsewhere;</li><li>no duplicates;</li><li>exact-draft attribution and supersession;</li><li>late completions ignored;</li><li>every A2.4 line in EN and ZH;</li><li>focus, including focus kept when a pass disables the button, `aria-disabled` and `aria-describedby`;</li><li>no "Save & apply" and no "Saved" flash;</li><li>the ruling-5 cases `fu2-retry-all-theme` and `fu2-retry-all-railPos`, with the transient write sequence and the final bytes.</li></ul></li><li>**Host:** the Topbar status, `beforeunload` and sign-out during and after a pass, and the clean-state disabled control (jsdom), and native host rows o–s.</li><li>**Native controls:** E26.</li><li>**Presentation:** the A2.8 placement gate (geometric separation, pet-on hit-tests including the end of the scroll range, 44×44, containment) at five widths in EN and ZH, in every state, enabled and disabled, and the measured disabled presentation (§9).</li><li>**Keyboard:** a Tab stop in every state, Enter and Space once, a pending second activation inert, `aria-disabled` inert, and the A2.5 focus targets.</li></ul> | E1, E2, E3, E4, E7, E8, E12, E14, E15, E26 |
| 10. Final regression and affected callers | Independent reruns from the fixed archive (runners and commands as in `../web-features-recovery-final/review-final-regressions-5cd63ff.md`): <ul><li>Appearance package test, typecheck and lint.</li><li>Shell package test, typecheck and lint.</li><li>Web package test, check-types and lint.</li><li>Storage check-types.</li><li>Settings-shell and settings-rest package tests.</li><li>Features package test.</li><li>Accepted caller suites per E24, including the More corrected `boundaries` oracle beside the frozen one.</li><li>The Features native downstream rerun (E25).</li></ul> Any selector outside the §9 scopes needs the affected callers' native visual modes. Any shared delta needs impacted engine, hook and caller reruns plus fresh acceptance. | E6, E18–E25, E27 |

**Acceptance condition.**
- Every row must reconcile four things: the source, a correct before failure, fixed independent behavior, and the actual user surface.
- Every §14 item must be cited with its artifact path and SHA-256. A missing item blocks acceptance.
- The caller cannot be closed by any of the following:
  - converting the pane without the App writer and the Topbar;
  - keeping "Save & apply";
  - dropping the bottom Retry all, which is option (i) and not the product owner's decision, or rendering it only while there is something to retry, which decision two replaced;
  - a Retry all that claims success before every member's verified completion, retries a pending or source-only field, attempts a member twice, or is covered by the default-position pet at any of the five widths, enabled or disabled;
  - a disabled Retry all that uses the `disabled` attribute, leaves the Tab order, drops focus to `<body>`, acts on activation, or carries a failure or success cue;
  - keeping any raw write or the event-bus write path;
  - keeping a crash on malformed bytes;
  - shipping recovery without host protection, export, cross-document and chrome-invariance evidence.

## 14. Required evidence checklist

This list is the single source for gate evidence (lesson G1). The final-regression receipt (E27) must list every ID with its producing commit, artifact paths and SHA-256 before acceptance starts.

| ID | Evidence item | Producer | Revision(s) | Gates |
| --- | --- | --- | --- | --- |
| E1 | Sol oracle files and runner frozen with a SHA-256 receipt; lockfile gate recorded; the F-B002 spy self-check | Sol | `5cd63ff` | 1–4, 6, 9 |
| E2 | Sol before logs for the eight §12 modes. They give per-case outcomes for every hypothesis Sol exercises: at least H1–H10, H12, H13 and H15–H17. H11 is in E3; H3, H5, H6, H10, H15 and H17 run again natively in E4; H14 runs natively in E4 only. The four ruling-5 cases are correct FAILs in step 1. Zero precondition failures, and every positive control PASS, including the operable "Save & apply" control | Sol | `5cd63ff` | 1–4, 6, 9 |
| E3 | Parent jsdom host before log (production `App`): per-field and Topbar failures with route and sign-out outcomes, failed reset with route outcome, the expected Retry all after failures on both surfaces with its Topbar-status, `beforeunload` and sign-out outcomes (H16), the expected disabled Retry all in the clean state (H17), clean control | Parent | `5cd63ff` | 5, 9 |
| E4 | Native before, production `App`: H3, H5, H6 (each crashing value, with route-error capture), H10 across two documents, H14 (a) at 375 px and (b) the 768×1024 pet over "Save & apply" at the top and the end of the scroll range, H15 (attempt counters and the "Saved" flash), H17 (the clean-state activation, with attempt counters and the flash), all in EN and ZH; provenance | Parent | `5cd63ff` | 5, 6, 8, 9 |
| E5 | New Appearance F1-shape runner and host fixture (frozen prelude reused read-only, hash-checked); `selfcheck` harness-valid; `appearance` before log (a1–a4) | Parent | `5cd63ff` | 5, 7 |
| E6 | Terra's fixed SHA; `git diff --name-only 5cd63ff <fixed> -- apps packages package.json pnpm-lock.yaml` lists only §11 product files; Terra's own package-run logs and `implementation.md` under `docs/reviews/web-appearance-recovery-terra/`, with SHA-256 | Terra | fixed | all |
| E7 | Sol fixed reruns with unchanged oracle hashes: all eight modes PASS, including `retry-all` and the four ruling-5 cases; zero `PRECONDITION` lines | Sol | fixed | 1–4, 6, 9 |
| E8 | Parent jsdom host fixed rerun PASS, including the Retry all and clean-state disabled cases | Parent | fixed | 5, 9 |
| E9 | Native controls: 40 values by trusted input with exact bytes; new-document reload with zero mount writes; source-only states per key; native held lock; uncertainty with one write; second-document conflict; cross-surface sameness | Parent | fixed | 1, 3, 5 |
| E10 | Native reset: decline makes zero attempts; accept gives six absences and unchanged language bytes; one-key and two-key faults; uncertainty with one remove; conflict; truthful "Defaults restored."; unrelated-key snapshot unchanged | Parent | fixed | 2 |
| E11 | Native export: the eight §8 disk shapes under total denial (counters, URL, anchor, warning, status) plus one setup failure | Parent | fixed | 4 |
| E12 | Native host matrix rows a–s with history counters and runtime-error gates (rows o–s are Retry all) | Parent | fixed | 5, 9 |
| E13 | Native downstream: byte compatibility in new documents, display truth, crash safety for every malformed value, cross-document propagation, clean-state chrome invariance against `5cd63ff`, cross-module isolation | Parent | fixed and `5cd63ff` | 6 |
| E14 | EN/ZH five-width visual: pet-hidden hit-tests, the pet-on R-PET run, 44×44, containment, overflow, Topbar containment with the status visible, a selector audit listing every added selector (with the declarations of the disabled Retry all rule), and the manually reviewed screenshots of §9. Also the A2.8 Retry all gate: geometric separation, pet-on probes after scrolling into view and at the end of the scroll range, at all five widths in the all-seven, partial-reset and partial-pass states (enabled) and in the clean and source-only states (disabled), and the disabled open-pass state at 768. Also the measured disabled presentation of §9: contrast in both themes with each of the six tones, accent independence, the enabled/disabled distinction, the focus ring and the attributes. Viewport heights recorded | Parent | fixed (pet captures also `5cd63ff`) | 8, 9 |
| E15 | Keyboard: Tab order, Enter/Space once, slider steps, the reset confirmation, focus targets after Discard, Reload, Retry, Discard all and Reset, the Topbar status. Also Retry all: a Tab stop in every state; Enter and Space each start one pass; a second activation while pending is inert; while disabled, Enter and Space are inert, keep focus and do not scroll; focus stays on Retry all after a full success, which disables it, and after a partial result | Parent | fixed | 8, 9 |
| E16 | F1 regression: `verify-f1.mjs` sticky, more and collaborate; `verify-f1-callers.mjs` selfcheck, notifications, date-time, smart-lists, header and pomodoro; `verify-f1-race.mjs` race; `verify-f1-features.mjs` selfcheck and features. All 12 PASS with unchanged runner hashes | Parent or final verifier | fixed | 7 |
| E17 | Appearance F1-shape fixed log PASS for a1–a4: a1 releases exactly once with one live `proceed()` and zero non-live calls; a2 is not held and keeps drafts; a3 has the coordinator hold after OK and Stay resolving `false`; a4 Cancel resolves `false` with identity intact. Zero runtime errors and no `Invalid blocker state transition` | Parent or final verifier | fixed | 5, 7 |
| E18 | §10 item 9 search at the fixed SHA, with per-file counts compared to `5cd63ff` | Final verifier | `5cd63ff` and fixed | 6, 10 |
| E19 | §10 item 8 protected-path empty diff | Final verifier | `5cd63ff..fixed` | 6, 10 |
| E20 | Storage check-types plus the Sol lifecycle assertion for the seven keys | Sol and final verifier | fixed | 6, 10 |
| E21 | Appearance package full test, typecheck and lint from the fixed archive, plus its unchanged tests at `5cd63ff` as a before control | Final verifier | fixed and `5cd63ff` | 6, 10 |
| E22 | Shell package full test, typecheck and lint, plus its unchanged tests at `5cd63ff` as a before control | Final verifier | fixed and `5cd63ff` | 6, 10 |
| E23 | Web package test (including every §10 item 10 test and the new `App.appearance*` tests), check-types and lint | Final verifier | fixed | 6, 10 |
| E24 | Accepted-caller suites with counts compared to their accepted receipts. Features: Sol bytes 17, fields 49, reset 31, queues 40, continuity-export 26, downstream 15, original 6; host 40; package 45. More: Sol fields 22, reset 20, queues 14, owner-export 13; `boundaries` run with **both** oracles, the frozen one recorded as it falls (known nondeterministic) and the corrected one at 10/10 (C-FB002); original 15; host 11. Sticky: Sol 109, original 10, host 28. Notifications: Sol 41, Astra boundaries 24, Astra host 15, parent host 12. Date & Time 7. Settings-shell 54; settings-rest 44 files / 314 tests | Final verifier | fixed | 10 |
| E25 | Affected-caller native rerun: the Features native downstream runner (`../web-features-recovery-native/verify-native-downstream.mjs`) PASS at the fixed SHA, because this caller changes the App-level appearance readers that run observes | Parent or final verifier | fixed | 10 |
| E26 | Native Retry all, production `App`, EN and ZH, trusted pointer and keyboard input. <ul><li>**Failures:** set drafts from the pane and the Topbar, a background choice with both writes denied, failed Reset items, and a failed predecessor with a queued latest.</li><li>**Attempts:** exactly one write or remove per member and zero on non-members, from attempt-level counters; exact bytes afterwards.</li><li>**Status line,** sampled per frame: never a success line while a member is pending or failed.</li><li>**Full success:** Retry all still rendered and now disabled, with no description; focus kept on it, never `<body>`; no Topbar status; `beforeunload` removed.</li><li>**Partial result:** the count line, focus kept, the Topbar status shown.</li><li>**Held and late:** a member held behind a real lock, where a second activation is inert; supersession by a Topbar choice; Discard and Discard all during an open pass, with late completions ignored.</li><li>**No old button:** no "Save & apply" control and no "Saved"/"已保存".</li></ul> | Parent | fixed | 9 |
| E27 | Final-regression receipt enumerating E1–E26: producing commit, artifact paths, SHA-256, verdict | Final verifier | — | 10 |

**Rules.**
- E1–E5 must be committed before Terra starts.
- E26 is produced before E27, which enumerates it.
- A later item cannot substitute for a missing earlier one.
- Acceptance re-derives at least one hash per item and BLOCKS on any absent ID.
- A frozen More `boundaries` failure is judged by the corrected oracle (C-FB002); the corrected oracle failing is a regression.

## 15. Lessons and limitations converted

| Lesson or retained limitation (source) | Appearance treatment |
| --- | --- |
| F1: the coordinator regression oracle must keep running (F1 closure, control plane) | **Gate.** All 12 F1 invocations at the fixed SHA (E16). The new Appearance F1-shape mode covers the status navigation released by another caller's Retry and the sign-out ordering (E5, E17). No coordinator change is permitted. |
| G1: a gate item had no scheduled runner (Sticky) | **Gate.** The single §14 checklist and the enumerated E27 receipt; acceptance blocks on any missing ID. |
| F-B002: a test spy re-entered storage; the frozen More oracle is nondeterministic | **Rule.** §12 F-B002 rule with a self-check (E1). E24 runs the corrected More oracle beside the frozen one. |
| R-PET: the App-level pet covered a moved control and the gated runs had excluded it (Features acceptance §5.1) | **Rule.** §9 states how the pet is judged: gated pet-hidden runs, and a pet-on run that blocks only for controls this caller adds or moves. **Gate** for the repurposed bottom button: Retry all moves from the inline end of a sticky footer, which sits in the pet band at 768×1024 (H14 b), to the inline start of a static area. It must be fully uncovered, with geometric separation and pet-on probes at five widths including the end of the scroll range, in every state, enabled and disabled, because it is always rendered (A2.8, E14). |
| D3 contrast: Features removed its "Save & apply" because the unconditional "Saved" was false (Features acceptance §5.4) | **Decision (A2).** Appearance keeps a bottom button by the product owner's choice, but it can no longer claim success on its own. Success lines are bound to verified completions (A2.4). By decision two the button is always rendered, but it is disabled whenever it has no real work (A2.2), so it can never repeat the old no-op (H17). |
| r2's concern: an always-present disabled "Retry all" could suggest a failure that did not happen (r2 A2.2; decision two keeps the button visible) | **Rule.** A neutral, accent-independent disabled look with a label contrast of at least 3:1, no description outside a pass, no wording of its own, and a clean-state status line that is empty or truthful (A2.2, A2.4 rule 2, §5 item 9, §9, E14). |
| E6: the implementer's run existed only as a commit-message self-report (Features acceptance §5.5) | **Rule.** A reserved Terra evidence path (§11); E6 cites its logs with SHA-256. |
| In-flight predecessor set + Reset + predecessor failure was not in the frozen orderings (Features follow-up 2) | **Gate** (controller ruling 5). Four frozen Sol cases, `fu2-retry-theme` and `fu2-retry-railPos` in `queues` (per-field Retry) and `fu2-retry-all-theme` and `fu2-retry-all-railPos` in `retry-all` (Retry all), assert the transient write sequence (the failed set, one re-write of the superseded value, then one removal) and the final bytes (verified absence) (§12). The transient write is asserted, not changed (§6, §16). |
| Status after Discard all re-surfaced an earlier "saved" line (Features follow-up 3, UX-04) | **Retained** for Discard (UX-04, §16). Retry all's own lines follow A2.4 and never claim success while a member is pending or failed. |
| Demo scope was not exercised for Reset (Features follow-up 7) | **Gate.** One Sol `reset` run under a demo scope. |
| Keyboard Discard all left focus on `<body>` (Sticky follow-up 1) | **Gate.** The §9 focus targets (E15), including Retry all: focus stays on it after a full success, when it becomes disabled through `aria-disabled` rather than `disabled`, so focus is never dropped to `<body>`; it also stays after a partial result (A2.5). |
| Host compositions lacked App-level readers | **Gate.** Every host, native and visual row runs in the production `App` (§9). |
| Affected callers' visual modes were not rerun after a shared change (Sticky follow-up 6) | **Rule.** Clean-state chrome invariance (§10 item 6, E13) instead of rerunning every caller's visuals; anything outside the §9 CSS scopes triggers the affected callers' native visual reruns. |
| Export counters counted only successes; no warning check after export; setup failure proved only in jsdom (More) | **Kept as gates** (§8, E11). |
| Retained exclusions: headless Chrome and synthetic accounts; not Tauri; synthetic `beforeunload`; development build without StrictMode; reused dependency trees; script clicks in race windows | Retained. The lockfile gate is a consistency check only. Sign-out now runs through App's real `handleSignOut` (row g), no longer only through the direct preflight. |

## 16. Exclusions

**Not part of this caller:**
- SET-02's body-text scaling: font-size tokens are fixed `px` (`tokens.css:98–103`), and changing them is tokens/CSS work across every module. The caller makes the font-scale *setting* truthful only.
- Any change to the Topbar popover's content (for example adding font scale or accent).
- Resetting language.
- SHELL-05 and SHELL-06 (pet persistence and avoidance), and moving or restyling the pet.
- SET-01 and REL-10: the settings shell, `SettingsFooter`, `resetAllPrefs` and `RESET_DEFAULTS` stay as they are, now without a production mount or caller.
- Removing the `web:settings:preference-changed` type from core.
- Repairing malformed stored bytes (REL-07). A valid edit over malformed bytes stays a failed draft, because the engine refuses an invalid source.
- On a browser without Web Locks every Appearance write is refused and reported, never written unfenced (D2 entry contract item 3).
- A Topbar write that is only pending (held) shows no Topbar status; it is protected by the unload warning and the sign-out step.
- **Retry all limits** (none of these is part of this caller):
  - any Retry all outside the Appearance pane, including in the Topbar status, other panes or a global "retry everything";
  - automatic retry: timers, backoff, `online` or visibility triggers;
  - retrying pending or source-only fields;
  - a second attempt within one activation;
  - removing the inherited transient write of Features follow-up 2, which the §12 ruling-5 cases assert rather than change;
  - a sticky or fixed bottom bar;
  - a hidden or natively disabled Retry all, and any disabled-state wording such as a hint, tooltip, replacement label or explanation (decision two; ruling 1 keeps the copy).
- Cross-pane status semantics after Discard (UX-04) and switch or label copy (UX-05).
- D2, global reset, migration, deletion or data-export changes.
- Tauri and native window capability.
- Production authentication and live logout.
- Crash and forced-authentication durability, and drafts lost when a scope change remounts App (REL-09).

**Not closed by this caller:** SET-01, SET-02, SHELL-04, SHELL-05, SHELL-06, REL-05, REL-07, REL-09, REL-10, UX-03, UX-04, UX-05, QA-01, QA-03, QA-04, QA-09, D2/REL/AI, or any other 312 item.

**Not authorized:** deployment, release, branch promotion or Web→Desktop sync. Any later Desktop flow needs the ADR-0013 D3 gate.

**Recommended evidence directories:** `docs/reviews/web-appearance-recovery-{sol,independent,native,f1,terra,final,acceptance}/`.
