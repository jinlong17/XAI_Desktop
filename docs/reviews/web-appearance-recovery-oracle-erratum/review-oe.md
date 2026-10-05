# Appearance oracle disputes OE-1 and OE-2: adjudication and corrected oracle (CP-APPEARANCE-01, batch 41)

**Verdict.**

| Dispute | Frozen case | Verdict | Fixed implementation |
| --- | --- | --- | --- |
| OE-1 | `continuity-export` case 006 (`../web-appearance-recovery-sol/continuity-export.test.tsx:180–193`) | **Oracle defect** | Correct (contract-conformant) |
| OE-2 | `continuity-export` case 007 (`:195–221`) | **Oracle defect** | Correct (contract-conformant) |

Both disputes are construction defects of the frozen oracle, as the controller's preliminary reading said; this review reaches that result independently. The corrected copy changes three lines. It passes 26/26 at `24073b5`. At `5cd63ff` its corrected case 006 still passes, as an invariant should, and its corrected case 007 still fails on the same early business assertion as the frozen file. The other 24 cases have identical outcomes and identical first failure lines in both files at both SHAs. The frozen original at `24073b5` reproduces Terra's 24/26. No implementation FAIL, nothing BLOCKED.

This is evidence only. It changes no product code, contract, frozen oracle, fixture, runner, log, ledger or control plane. It does not decide how E7 is judged; that is the controller's ruling (control plane "下一步" item 2).

## Identity

| Item | Value |
| --- | --- |
| Executor | Independent Claude Opus 5.5 instance, Sol role. It is not the batch-37 oracle author, not Terra (batch 40) and not a contract author. Isolated worktree `.claude/worktrees/agent-acea97ec4ae5b4fae`, detached |
| Docs base (detached HEAD) | `3552631c8accc9b0b2b8af1b6d2bfbc1bcadb2fd` (control plane registering batch 41) |
| Before product | `5cd63ff652f02a2c726187fe12cbc796218d31c0`, tree `404bf819a42e20b3e4d372c18a981832ccd54954` |
| Fixed product | `24073b522262d8b4bec0abfa29347db28adbdd9e`, tree `95b4aaff59927eee82248a6133e357e9c70e04ec` |
| Contract | r3 `706c9a3`, SHA-256 `ef1b573c9f1366ec0fc342d8960eb5a2975a8d1c75904da04134edb57212d90d` (re-derived) |
| Frozen inputs (read only, `bd09456`) | `continuity-export.test.tsx` `776da524f7479e03d067c2426345df1fb30e518581c7bbfd33a0f1d0838e79ce`; `fixture.tsx` `acd26ad860c90e1a688232db2f8da4b2d016b7a537d53afb3fea528f584666e3`; `verify-fixed.mjs` `a451df6aa05fcae5b6fb77266d6ef8d990b4e97b91755c0723f442239fbf5c1e`; `continuity-export-before3-5cd63ff.log` `2582df8f5cacf0939b5ca39f04269eb7e2d4f5ced54967e6b1b5aa832d22178a`. All re-derived; the first three are pinned in the runner and asserted before every run |
| Lockfile gate | `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`, equal for `XAI_DEPS_ROOT`, both committed lockfiles and both extracted archives (recorded in every log header) |
| Engine equality | `git diff --stat 5cd63ff 24073b5 -- packages/plugin-web-storage packages/plugin-web-tokens packages/core` is empty, so every engine line cited below is the same at both SHAs |
| Diagnostic iterations | Required units: 2 each (`oe1` superseded, `oe2` authoritative). Replay units: 1 each (`oe2`). Within the cap of 3 |

## 1. OE-1: case 006, "INV §7 an unrelated held account lifecycle lock never delays a device edit or a reset"

### What the frozen case does

1. It holds `accountLifecycleLockName(OWNER_A)`, mounts the standalone pane, and commits accent 295 (`:181–186`).
2. **After the mount**, it writes `xai_rail_pos=top` and `xai_bg_tone=peach` with `seedValue` (`:187–188`). `seedValue` is a native `Storage.setItem` (`fixture.tsx:358–362`) and dispatches no `StorageEvent`. The fixture's `external()` (`fixture.tsx:681–690`) is the helper that simulates another document's write: native bytes, then a `StorageEvent`. The case does not use it.
3. It accepts Reset and expects all three keys absent (`:189–191`).

### What the contract requires

The case's own business requirement is §7: "An unrelated held account lifecycle lock must not delay a device edit or reset" (`contract.md:681`; gate 4 at `:1128`, "an unrelated held account lock does not serialize"). Conflicts are not part of it.

The setup step, however, puts bytes under rail and bg that the binding never observed. For those bytes the contract is explicit:

- **§5 Interface** (`:481`, `:483–484`). The shared queue must keep its "exact baseline and readback". Callers must not add "a caller storage preflight" or "a forced rebase".
- **§5 item 6** (`:536–537`). "An external replacement or removal stays a preserved conflict", and "Repeated Retry never gains authority to overwrite".
- **§6** (`:636`, `:646`, `:661`, `:665`):
  - Reset success requires verified absence.
  - An unchanged failed reset "does not rebase".
  - "A conflict preserves the external bytes and the reset draft".
  - "Defaults restored." appears only when all six resets complete.
- **A2.3** (`:334`). "A conflict is never overwritten".

Nothing in the contract makes Reset authority to remove bytes the binding has not observed. A Reset that removed them anyway would need exactly the preflight or rebase that §5 forbids. So the frozen expectation that rail and bg end up absent contradicts §5 items 5–6 and §6. The case reached this conflict by accident, through its setup step.

### What the source does

**The engine is byte-identical at both SHAs.**

- The binding's baseline `controller.raw` is read when the binding is created (`packages/plugin-web-storage/src/internal/usePrefAsync.ts:61–68`, `:102–105`).
- After that, the baseline changes only three ways:
  - the binding's own success (`:205–206`);
  - a same-tab publication;
  - a `storage` event, which reaches `project()` (`:156–167` → `:142–154`).
- Every reset and absolute set is sent with `expectedRaw = controller.raw` (`:177`, `:184`).
- `mutatePref` refuses a reset whose current bytes differ from `expectedRaw`. It returns `conflict` and touches nothing (`prefMutation.ts:199–202`).
- Device keys never take the account lifecycle lock (`prefMutation.ts:243–244`).

**Fixed product (`24073b5`).**

- Reset admits six reset intents through each binding's own `reset()` (`packages/xai-web-settings-appearance/src/internal/appearanceController.tsx:425–462`, `submit` at `:272–281`), with no preflight read.
- A refused reset settles as a failed reset draft (`settle` `:231–247`; field state `not-reset` `:557–560`), which keeps Retry and Discard.

**Before product (`5cd63ff`).**

- `handleResetAppearance` calls the legacy `removePref` for the three registered keys (`AppearancePane.tsx@5cd63ff:170–183`). `removePref` removes unconditionally (`packages/plugin-web-storage/src/internal/storage.ts:242–266`, removal at `:257–258`).
- The before product therefore purged the unobserved bytes. That is the only reason the frozen INV passed at `5cd63ff`: it passed on behaviour that §5 item 6 and §6 retire, not on the invariant it names.

### Evidence

- **Frozen original at `24073b5`** (`frozen-oe2-24073b5.log` L137–138, full diff L79–87). Received `{ accent: null, bg: "peach", rail: "top" }`. The observed accent was removed; the unobserved rail and bg bytes were preserved.
- **Diagnostic replay at `24073b5`** (`replay-oe2-24073b5.log`). It runs the case's steps unchanged and only records what follows:
  - L37, after Reset:
    - the only write attempt is `remove:xai_accent_hue`;
    - rail and bg keep `top` and `peach`;
    - both rows display the default with "Sidebar position/Background palette was not reset to its default.", plus Retry and Discard;
    - the status line reads `2 appearance changes are not saved.`, so there is no false "Defaults restored.";
    - the unload warning is active.
  - L40, Retry Sidebar position: zero writes; the bytes stay `top`.
  - L43, Discard Sidebar position: zero writes; the row rereads `top`; the count drops to 1.

  This is the behaviour that `contract.md:661`, `:536–537`, `:665` and §5 item 8 require.
- **Diagnostic replay at `5cd63ff`** (`replay-oe2-5cd63ff.log` L37). Reset attempted `remove:xai_accent_hue`, `remove:xai_rail_pos` and `remove:xai_bg_tone`, and all three keys became absent: the before product purged bytes it had never observed.
- **Internal consistency of the frozen suite.** Five frozen cases encode the same rule for external writes:
  - `reset.test.tsx:330–346`: "an external replacement during a held reset is a preserved conflict; Retry never overwrites it";
  - `queues.test.tsx:236–267` (Q6) and `:269–294` (Q7);
  - `queues.test.tsx:700–723`;
  - `retry-all.test.tsx:345–365`.

  Case 006's setup step contradicts that rule for an external write made before the reset was admitted.

### Verdict and correction

**Oracle defect.** The correction seeds rail and bg **before the mount**, so the bindings observe them and the reset has known bytes to remove. The case keeps its intent:

- the account lock is still held from the first line until after the final assertion;
- the device edit and the reset still run under it;
- the reset now performs three real removals (accent, rail, bg) and three verified no-ops.

The assertion keeps its power: had either been serialized behind the account lock, the bytes would still be present and the case would fail.

Alternative considered: emulate an observed write with `await external(RAIL.key, "top")`, which adds a `StorageEvent`. It is equivalent, but it also changes the import list, so it is less minimal and was not chosen.

## 2. OE-2: case 007, "§7.3 §7.6 unmount removes the unload listener and detaches old callbacks; committed writes and removals are never undone"

### What the frozen case does

1. Rail is seeded `top` before the mount, and Reset removes it (`:196–201`).
2. Accent 295 is committed (`:202–204`).
3. A quota fault is armed on `xai_bg_tone` only, and Mist is chosen (`:205–208`).
4. The case checks the unload warning, unmounts, and clicks the detached Retry: zero attempts, no download (`:209–218`).
5. It then expects `xai_accent_hue` to still be `"295"` (`:219`) and rail absent (`:220`).

### What the contract requires

- **§2.** The accent is "also written by a background choice" (`contract.md:161`), and "A background choice writes two fields: the tone and the tone's hue as the accent" (`:175`).
- **§5 item 4.** A background choice "establishes two intents synchronously in one handler, `bgTone` then `accentHue` (the tone's hue). They settle independently" (`:521`).
- **§5 item 7.**
  - "A field's success never retries, rewrites, discards or rereads a sibling" (`:539`).
  - The required coverage includes "a background choice whose accent write fails while its tone write succeeds, and the reverse" (`:544`). Case 007 is that reverse.
- **Other sections that pair the tone with its hue:** §5 item 9 scope (`:566`), §8 shape 3 and §10 item 1 (`:872`, "each background with its paired accent bytes").
- **Mist's hue is 230** (`packages/xai-web-settings-appearance/src/constants.ts:25`, unchanged between the SHAs).
- **The case's intent** is §7 item 6, "Committed writes are not undone" (`:711`).

The last committed accent write before the unmount is therefore 230, written by the Mist choice. The frozen expectation of 295 contradicts §2, §5 item 4 and §5 item 7.

### What the source does

- **Fixed (`24073b5`).**
  - The pane's `handleBgToneChange` calls `controller.chooseBgTone(toneId, hue)` (`AppearancePane.tsx:134–137`, tone cards `:298–303`).
  - That runs `edit("bgTone", tone)` and then `edit("accentHue", hue)` (`appearanceController.tsx:335–339`). Each becomes its own draft and request (`:258–291`) and settles independently (`:231–247`).
  - Unmount only detaches (`:579–589`), so committed writes stay.
- **Before (`5cd63ff`).**
  - `handleBgToneChange` calls `setPref("xai_bg_tone")` and then `setPref("xai_accent_hue", hue)` (`AppearancePane.tsx@5cd63ff:110–117`).
  - `setPref` swallows the tone's quota error (`storage.ts:204–214`), so the accent write proceeds at `5cd63ff` too.

### Evidence

- **Frozen original at `24073b5`** (`frozen-oe2-24073b5.log` L139–140, detail L101–104): expected `"295"`, received `"230"`.
- **Diagnostic replay at both SHAs** (`replay-oe2-24073b5.log` L47–48; `replay-oe2-5cd63ff.log` L43–44):
  - **Both products.** The Mist choice attempts `set:xai_bg_tone=mist!threw`, then `set:xai_accent_hue=230`. The accent bytes are `"230"` before and after the unmount, with zero attempts after the unmount.
  - **Fixed only.** The accent has no draft. The tone has a draft with "Background palette was not saved.", Retry and Discard, and the count is 1.

  "295" was therefore never the committed accent on either product.
- **Internal consistency of the frozen suite:**
  - `fields.test.tsx:415–425` asserts, for exactly this sequence (tone fails, accent succeeds), `bytes(ACCENT)` = `"230"` ("the accent write committed");
  - `fields.test.tsx:390–413`;
  - `retry-all.test.tsx:532–543` ("the background choice is the latest accent intent", `"230"`);
  - `bytes.test.tsx:358–375` ("pairs its accent bytes").
- **At `5cd63ff`** the case fails earlier, on `§7.3: beforeunload warns while a draft exists` (frozen `continuity-export-before3-5cd63ff.log` L456–457). The 295 expectation was never executed, so the defect stayed latent until a product reached it.

### Verdict and correction

**Oracle defect.** The correction expects `"230"`: Mist's hue, the last committed accent. The assertion keeps its power. A product that undid the write at unmount would leave `"295"` or null, and a product that did not write the tone's hue at all would leave `"295"`. Both would now fail.

Alternative considered: choose Lavender, whose hue is 295. That changes a correct step rather than the defective expectation, so it was not chosen.

## 3. The corrected copy and its diff

`continuity-export.corrected.test.tsx` is the frozen file with exactly this diff applied (`continuity-export.corrected.diff`, verbatim):

```diff
--- a/docs/reviews/web-appearance-recovery-sol/continuity-export.test.tsx
+++ b/docs/reviews/web-appearance-recovery-oracle-erratum/continuity-export.corrected.test.tsx
@@ -179,13 +179,13 @@
 
 it("INV §7 an unrelated held account lifecycle lock never delays a device edit or a reset", async () => {
   const accountLock = await hold(accountLifecycleLockName(OWNER_A));
+  seedValue(RAIL, "top");
+  seedValue(BG, "peach");
   standalone();
   await flush();
   choose(ACCENT, 295);
   await flush();
   expect(bytes(ACCENT), "§7: a device edit is not serialized behind an unrelated account lock").toBe("295");
-  seedValue(RAIL, "top");
-  seedValue(BG, "peach");
   clickReset(true, "en");
   await flush(24);
   expect({ accent: bytes(ACCENT), rail: bytes(RAIL), bg: bytes(BG) }, "§7: a device reset is not serialized behind an unrelated account lock").toStrictEqual({ accent: null, rail: null, bg: null });
@@ -216,7 +216,7 @@
   await flush();
   expect(attempts(from), "§7.6: detached callbacks make zero storage attempts").toEqual([]);
   expect(harness.created.length + harness.clicks.length, "a detached export never downloads").toBe(0);
-  expect(bytes(ACCENT), "unmount never undoes committed writes").toBe("295");
+  expect(bytes(ACCENT), "unmount never undoes committed writes").toBe("230");
   expect(bytes(RAIL), "unmount never undoes committed removals").toBeNull();
 });
```

Line by line:

1. **Case 006, frozen `:187–188`.** The lines `seedValue(RAIL, "top");` and `seedValue(BG, "peach");` move, unchanged, to just after the account-lock hold and before `standalone();`. They become corrected `:182–183`.
2. **Case 007, `:219`.** The literal `"295"` becomes `"230"`. The assertion message is unchanged.

Nothing else changes: no test title, import, helper, assertion message or other step. The file keeps 444 lines, so every line outside `:182–190` keeps its frozen line number.

The corrected file imports the frozen `fixture.tsx` unchanged. The runner stages a byte-identical copy of it next to the corrected file inside the temporary archive, and asserts its hash (`acd26ad8…`) both at the source and in the archive. A harness check in every `corrected` run applies the committed diff with `/usr/bin/patch` to a copy of the frozen file, inside the temporary archive, and requires the result to equal the corrected file. The result was `EQUAL` (`corrected_diff_check` line in both `corrected-oe2` logs).

## 4. Runs

The runner is `verify-erratum.mjs`, derived from the frozen runner `verify-fixed.mjs`; the frozen runner could not be used because it writes its logs into the frozen directory. The derived runner keeps the frozen runner's conventions unchanged:

- an immutable `git archive` of the requested SHA;
- the lockfile gate;
- private `node_modules` with `@repo` links into the archive;
- 75 exact-match aliases and the pin guard plugin, which fails any module loaded from the dependency checkout or any unaliased `@repo` import resolving outside it;
- the 22 required product modules loaded from the archive;
- requested and resolved SHA recorded in each log;
- refusal to overwrite (checked before archiving, before writing, and with an exclusive create);
- nonzero exit codes preserved;
- the same Appearance test semantics (jsdom, globals, its `vitest.setup.ts`).

The frozen inputs are read only and hash-pinned. Every log header records:

- the frozen-input hashes;
- the erratum file hashes;
- the staged-copy hashes;
- 19 archive product-file hashes, including `appearanceController.tsx` at `24073b5`;
- versions: Vitest 3.2.7, Vite 7.3.6, jsdom 26.1.0, Node v24.16.0.

### Authoritative runs (`oe2`, runner `354c220b…`)

| # | Run | Requested → resolved | Log | SHA-256 | Exit | Cases (pass / fail / PRECONDITION) | Harness |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | corrected, whole mode | `5cd63ff` → `5cd63ff652f0…` | `corrected-oe2-5cd63ff.log` | `2deda71954de56b640fed2846ef9d74a4870cda206a63c98b8e49122e22babf7` | 1 | 26 (4 / 22 / 0) | PASS 8/8, diff check EQUAL |
| 2 | corrected, whole mode | `24073b5` → `24073b522262…` | `corrected-oe2-24073b5.log` | `f573263793f1bef6e5c418533a7afbf0b97dc207f3f58755c1cbbe7ccab52935` | 0 | 26 (26 / 0 / 0) | PASS 8/8, diff check EQUAL |
| 3 | frozen original, whole mode | `24073b5` → `24073b522262…` | `frozen-oe2-24073b5.log` | `aa689afb7021e36f9bd6888d2802ed4aca14e6f9a4af2940ca67d24d2122095f` | 1 | 26 (24 / 2 / 0), reproducing Terra's 24/26 | PASS 7/7 |
| 4 | diagnostic replay (not an oracle) | `5cd63ff` → `5cd63ff652f0…` | `replay-oe2-5cd63ff.log` | `10e2bdde8e22ff88075ed2f97cab721997632e6ca14052287b2c2d4caffbfe2f` | 0 | 2 (2 / 0 / 0) | PASS 7/7 |
| 5 | diagnostic replay (not an oracle) | `24073b5` → `24073b522262…` | `replay-oe2-24073b5.log` | `f1599bccc686f0543925490b7cd75b52254b9063d0b0bf5fff228d1889050241` | 0 | 2 (2 / 0 / 0) | PASS 7/7 |

All five logs record:

- `pin_unaliased_repo_imports=0` and `pin_required_provenance_missing=none`;
- zero suite errors and zero unhandled-error lines;
- the same third-party (448) and workspace (281) link counts as the frozen runner;
- `tsconfig_extends_unresolved=none` (46 checked).

### Superseded iteration (`oe1`), kept and labelled

`corrected-oe1-5cd63ff.log` (`81a965f1e08ac02eb83be8c663bce5507d63979d3dfca6fec142e080b0b25c21`), `corrected-oe1-24073b5.log` (`3ec6b66dd460dc17f94248214bdd04da9dbf0524ee12ecda22a03f4676c3c265`) and `frozen-oe1-24073b5.log` (`48485177dbedf1124202b140b8cefc72e431e938ecfca430d07877d13c3e7701`).

- **Producer.** An earlier, never-committed revision of the runner (`d48b1039e27d4bfeae95f44c72e204e219f5340a21ef24cc8c2b56543b788276`). It lacked the `replay` mode, the diff-check harness check and the matching header fields. Staging, archive, guard and Vitest configuration were otherwise identical.
- **Why rerun.** The runs were repeated as `oe2` only so that every authoritative log carries the committed runner's hash.
- **Outcome.** Their case lines (status and first failure line, all 26 cases) are identical to `oe2`, checked mechanically.

### Per-case outcomes

Source: `analysis-oe2.log` Part A. The `frozen@5cd63ff` column is the frozen E2 log `continuity-export-before3-5cd63ff.log` (batch 37).

| Case | frozen @ `5cd63ff` | corrected @ `5cd63ff` | frozen @ `24073b5` | corrected @ `24073b5` | Title (abridged) |
| --- | --- | --- | --- | --- | --- |
| 001 | PASS | PASS | PASS | PASS | FIXTURE F-B002 self-check |
| 002 | FAIL | FAIL | PASS | PASS | H1 H8 §7 A→B→locked→A |
| 003 | FAIL | FAIL | PASS | PASS | H8 H12 §7 same-account epoch change |
| 004 | FAIL | FAIL | PASS | PASS | H8 H9 §7 admitted reset batch across A→B |
| 005 | PASS | PASS | PASS | PASS | INV §7 no account keys, markers or locks |
| **006** | PASS | **PASS** | **FAIL** | **PASS** | INV §7 unrelated account lock never delays a device edit or a reset |
| **007** | FAIL (§7.3) | **FAIL (§7.3, same line)** | **FAIL ("230" vs "295")** | **PASS** | §7.3 §7.6 unmount; committed writes never undone |
| 008–016 | FAIL | FAIL | PASS | PASS | §8 shapes 1–8 and exclusions |
| 017 | PASS | PASS | PASS | PASS | INV §8 no Export or Discard all without a draft |
| 018–026 | FAIL | FAIL | PASS | PASS | §8 setup failures, ZH, unmount during setup, export after A→B |

`analysis-oe2.log` Part A machine-checks the following, all PASS:

- every run reports 26 cases;
- the 26 titles are identical and in the same order in all four runs;
- zero PRECONDITION failures;
- the 24 non-disputed cases have the same outcome and the same first failure line in the frozen and corrected files, at `5cd63ff` and again at `24073b5`;
- all 24 non-disputed cases pass at `24073b5`;
- corrected case 006 passes at both SHAs, while frozen case 006 passed at `5cd63ff` and fails at `24073b5`;
- corrected case 007 fails at `5cd63ff` with the frozen first line `§7.3: beforeunload warns while a draft exists` (`corrected-oe2-5cd63ff.log` L461–462), and passes at `24073b5`.

The 22 before failures are every first failure line of the frozen E2 log, verbatim. They are listed in `analysis-oe2.log`.

## 5. Scan: the same construction issues elsewhere (report only)

**Method.** `analyze-oe.mjs` (read only; it executes nothing) scans every `it`/`it.each` block of:

- the seven Sol oracle files (`bytes`, `fields`, `reset`, `queues`, `continuity-export`, `host`, `retry-all`);
- the Sol `fixture.tsx`;
- the parent host oracle `../web-appearance-recovery-independent/host.test.tsx`.

It lists the candidates; each was then classified by reading it. Full listing: `analysis-oe2.log` Part B, with every candidate's subsequent operations and assertions.

### P1: a native write on an Appearance key after a mount, with no event, then an expected removal or overwrite

| # | Site | Write | What follows | Classification |
| --- | --- | --- | --- | --- |
| 1 | `continuity-export.test.tsx:187` | `seedValue(RAIL, "top")` | Reset, then rail expected absent | **Defect (OE-1)** |
| 2 | `continuity-export.test.tsx:188` | `seedValue(BG, "peach")` | Reset, then bg expected absent | **Defect (OE-1)** |
| 3 | `fields.test.tsx:160` | repaired bytes for a source-only field | an explicit **Reload** (reread) first; then display of the repaired value with zero writes | Consistent: Reload observes the bytes; no removal or overwrite is expected |
| 4 | `queues.test.tsx:243` (Q6) | external replacement during a held write | expected a **preserved conflict**; Retry never overwrites; Discard rereads | Consistent: deliberate external write (§5 item 6) |
| 5 | `queues.test.tsx:276` (Q7) | external removal during a held write | expected a preserved removal; Retry never recreates the key | Consistent (§5 item 6) |
| 6 | `queues.test.tsx:306` (Q8) | external **restoration of the binding's own baseline bytes** after an uncertain write | expected a preserved conflict for Retry; then a distinct new choice overwrites (`:317–320`) | Consistent. The restored bytes equal the binding's observed baseline (seeded before the mount), so the new choice's `expectedRaw` equals the current bytes. §5 item 6 says "A distinct new choice is a new operation" (`contract.md:537`) |
| 7 | `queues.test.tsx:707` | external rail replacement during a held write | expected a preserved conflict; an unrelated theme Retry succeeds | Consistent (§5 items 6 and 7) |
| 8 | `host.test.tsx:466` (Sol) | repair of malformed rail bytes | an explicit **Reload** (`:467`) before any later Reset or choice; only isolation assertions follow | Consistent: Reload observes the bytes |
| 9 | `retry-all.test.tsx:353` | external theme replacement during a held write | expected a conflict, kept and never overwritten | Consistent (A2.3) |

Other post-mount native writes on non-Appearance keys:

- `host.test.tsx:307` (Sol): the identity channel, followed by its own `StorageEvent`. Not P1.
- The parent host oracle seeds only before mounting.
- The fixture's only mounting helper, `runRuling5`, seeds before `mountApp`.

### P2: an unchanged accent expected after a background choice

There are 23 background-choice sites, 13 of them with an accent assertion later in the same test:

| # | Site | Accent assertion | Classification |
| --- | --- | --- | --- |
| 1 | `continuity-export.test.tsx:206` | `:219` expects `"295"` | **Defect (OE-2)** |
| 2 | `bytes.test.tsx:368` (each tone) | `:371` accent = the tone's hue | Consistent |
| 3 | `bytes.test.tsx:407` (default tone) | `:411` accent `"165"` (Sage) | Consistent |
| 4 | `fields.test.tsx:352` (all seven) | `:356`, `:367` per field; the accent's latest intent comes from the Mist choice (230), equal to `CHOICE.accentHue` (the pairing is stated at `:58`) | Consistent |
| 5 | `fields.test.tsx:376` (all seven) | `:384` no sibling write | Consistent |
| 6 | `fields.test.tsx:394` | accent 230, then `"230"` | Consistent |
| 7 | `fields.test.tsx:418` | `bytes(ACCENT)` = `"230"`: **the same sequence as case 007** | Consistent; contradicts the frozen case 007 |
| 8 | `fields.test.tsx:430` | accent 230 displayed and failed | Consistent |
| 9 | `continuity-export.test.tsx:264` (shape 3) | export `accentHue: SET(230)` | Consistent |
| 10 | `continuity-export.test.tsx:302` (shape 6) | export `accentHue: SET(230)` | Consistent |
| 11 | `retry-all.test.tsx:241` (all seven) | one write per key in display order | Consistent |
| 12 | `retry-all.test.tsx:280` | `set:xai_accent_hue=230`, `set:xai_bg_tone=mist` | Consistent |
| 13 | `retry-all.test.tsx:538` | accent `"230"`, "the background choice is the latest accent intent" | Consistent |

The other 10 sites have no accent assertion after them in their test, so neither assumes an unchanged accent:

- `fields.test.tsx:98, 131, 176, 212`;
- `queues.test.tsx:359`;
- `continuity-export.test.tsx:172`;
- `host.test.tsx:460` (Sol);
- `retry-all.test.tsx:291`;
- the parent host `host.test.tsx:279, 295`.

Two of those tests assert on writes or drafts in ways that require the accent intent to settle independently, which the contract mandates:

- `retry-all.test.tsx:291–298` expects Retry all to write only the failed tone;
- `fields.test.tsx:208–225` expects no unload warning after discarding the held tone while the accent committed.

**Scan result.** Only the two disputed cases have either construction issue. No other frozen Sol oracle and no parent host oracle needs an erratum for these patterns. These modes were not rerun here; that is E7/E8 in batch 42. Terra's own pre-check, whose logs were not committed, reported the other Sol modes and the parent host at full pass (`../web-appearance-recovery-terra/implementation.md` §7.2).

## 6. Files and SHA-256

Every new file except this receipt, which cannot carry its own hash. All files are under `docs/reviews/web-appearance-recovery-oracle-erratum/`.

| File | Role | SHA-256 |
| --- | --- | --- |
| `continuity-export.corrected.test.tsx` | Corrected oracle (frozen file + diff) | `6e9c7def13a5128534a245653c90414c805a5af7597e7a12644189a258a5909a` |
| `continuity-export.corrected.diff` | Verbatim unified diff against the frozen file | `354bf6561db0ba238212f554597e1a9c23065a2b8e6a36d053f8c13cd2b030c1` |
| `verify-erratum.mjs` | Runner (modes `corrected`, `frozen`, `replay`) | `354c220b0cddb6997486a52afe88182c11d622d490d00da7fd2cabd3fddf81d8` |
| `oe-replay.test.tsx` | Diagnostic replay; not an oracle, gates nothing | `6261aa76d3b934d2d614876ecf7b96c0900388d76778875b2606d181b796ce18` |
| `analyze-oe.mjs` | Read-only comparison and scan | `d72c484c979b59a8595eab412bf2ae02ef656bcf38ff174c87e5397203003aa3` |
| `analysis-oe2.log` | Part A comparison and Part B scan output | `a677aff6258931f8d6876b0f10ccf937c3df586ba0675a5ad855467b33fa9e18` |
| `corrected-oe2-5cd63ff.log` | Authoritative | `2deda71954de56b640fed2846ef9d74a4870cda206a63c98b8e49122e22babf7` |
| `corrected-oe2-24073b5.log` | Authoritative | `f573263793f1bef6e5c418533a7afbf0b97dc207f3f58755c1cbbe7ccab52935` |
| `frozen-oe2-24073b5.log` | Authoritative | `aa689afb7021e36f9bd6888d2802ed4aca14e6f9a4af2940ca67d24d2122095f` |
| `replay-oe2-5cd63ff.log` | Diagnostic | `10e2bdde8e22ff88075ed2f97cab721997632e6ca14052287b2c2d4caffbfe2f` |
| `replay-oe2-24073b5.log` | Diagnostic | `f1599bccc686f0543925490b7cd75b52254b9063d0b0bf5fff228d1889050241` |
| `corrected-oe1-5cd63ff.log` | Superseded | `81a965f1e08ac02eb83be8c663bce5507d63979d3dfca6fec142e080b0b25c21` |
| `corrected-oe1-24073b5.log` | Superseded | `3ec6b66dd460dc17f94248214bdd04da9dbf0524ee12ecda22a03f4676c3c265` |
| `frozen-oe1-24073b5.log` | Superseded | `48485177dbedf1124202b140b8cefc72e431e938ecfca430d07877d13c3e7701` |

## 7. Commands

All commands run from the worktree root. The dependency root is read only: nothing is written, installed, built, served or checked out there.

```sh
DEPS=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop
git fetch origin codex/web/full-product-audit-20260908
git checkout --detach 3552631c8accc9b0b2b8af1b6d2bfbc1bcadb2fd
# iteration 1 (superseded): earlier runner revision d48b1039…
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs 24073b5 frozen oe1
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs 5cd63ff corrected oe1
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs 24073b5 corrected oe1
# authoritative (runner 354c220b…)
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs 24073b5 replay oe2
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs 5cd63ff replay oe2
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs 5cd63ff corrected oe2
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs 24073b5 corrected oe2
XAI_DEPS_ROOT=$DEPS node docs/reviews/web-appearance-recovery-oracle-erratum/verify-erratum.mjs 24073b5 frozen oe2
node docs/reviews/web-appearance-recovery-oracle-erratum/analyze-oe.mjs oe2
```

## 8. Boundary record

- **Additions only.** `git status --porcelain --untracked-files=all` before the commit lists only additions under this directory. The frozen directory, contract, product, ledgers and control plane are byte-unchanged.
- **Dependency root untouched.** The main checkout served only as `XAI_DEPS_ROOT`, read only. There was no install and no dev server, and no git command targeted it. After the runs, `find … -newer <first erratum file>` over its `node_modules` top level and `.vite` caches found no modified entry.
- **Temporary archives deleted.** No `xai-appearance-erratum-*` directory remains.
- **No branch operations.** No push, merge, rebase, branch or subagent.

## 9. Limitations

- **jsdom only, synthetic input.** The Sol README limitations apply unchanged: the fixture's Web Lock manager is not browser timing, and keyboard and pointer input are synthetic. Cases 006 and 007 are Sol-layer cases; no native evidence was produced or needed.
- **The replay is diagnostic.** It asserts nothing about the product. Its `SOL-OBS` lines are evidence for this adjudication only and gate nothing.
- **The scan is textual plus manual classification.** Tests are located by their `it`/`it.each` heads and closing lines. Writes and choices are matched by helper name (`seed`, `seedValue`, `seedKey`, `seedAll`, `seedOver`, `nativeSet.call`, `nativeRemove.call`, the pane, Topbar and fail helpers). Parameter sets are resolved from the `it.each` head, a named `it.each` array, or the nearest enclosing `describe`.

  The scan does not cover the F1-shape runner, the native runners or the parent host fixture's internal helpers beyond `seed`.
- **Only the requested runs were made.** The other Sol modes and the parent host were not rerun, and no affected-caller suite was run (batch 42).
- **Runner differences from the frozen runner.** It makes one Vitest run per invocation, adds two harness checks (staged-fixture identity, corrected = frozen + diff) and hashes `appearanceController.tsx` in the header. Staging, archive, guard and Vitest configuration otherwise follow the frozen runner.
- **Interpretation for OE-1.** The contract does not say "unobserved same-document write" in so many words. The reading rests on:
  - §5 item 6, an external replacement stays a preserved conflict;
  - the §5 Interface rules: exact baseline, no preflight, no rebase;
  - §6 `:661`, a conflict preserves the external bytes and the reset draft.

  §6 "Meaning" ("A pane-scoped removal of exactly six physical keys", `:614`) is not authority to remove bytes the binding has not observed. Reading it that way would require the preflight or rebase that §5 forbids, and it would contradict `reset.test.tsx:330–346` in the same frozen suite.
- **Both OE-1 corrections are acceptable.** The correction moves the seed before the mount. The equivalent `external()` correction would keep the post-mount position at the cost of an import change. The controller may prefer either; both preserve the case's intent and both make the reset remove known bytes.
