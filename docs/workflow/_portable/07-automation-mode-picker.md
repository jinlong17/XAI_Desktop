# 07 — Automation Mode Picker (cross-cutting spec)

> **Source:** `_portable/04-automation-loop.md` §3 (8-variant matrix) +
> `_portable/02-handoff-and-state.md` §3.3 (Universal Next Step Contract) +
> `_portable/06-roadmap-orchestration.md` §A6 (manifest schema).
>
> This file is the **single source of truth** for *how* an Automation Mode is chosen at runtime.
> Three meta-orchestrators consume it (`feature-full-loop`, `bugfix-full-loop`, `<skill_prefix>roadmap-loop`);
> they reference §2 and §3 verbatim rather than redefining the picker.

---

## 1. Position in the workflow

`04-automation-loop.md` §3 defines **what** the 8 variants are. This file defines **how** an
Automation Mode is acquired when one is not already supplied. Three trigger sites:

| Site | When this file fires |
|------|----------------------|
| `feature-full-loop` Phase 0 INTAKE (fresh start) | invocation prompt has no `Automation Mode:` field, or the value is not one of the 8 legal variants |
| `bugfix-full-loop` Phase 0 INTAKE (fresh start) | same, but C-* variants are also rejected (phase-granularity does not apply to bugfix) |
| `<skill_prefix>roadmap-loop` init mode | per-row, while drafting the manifest (see §5) |

Resume mode is **never** a trigger — the Mode is already on the dev_log Status Panel and is read,
not re-asked.

---

## 1A. Precondition — Requirement/Bug presence gate (hard stop, fires BEFORE the picker)

§2/§3 assume a fresh-start invocation already carries a `Requirement:` (feature) /
`Bug:` (bugfix) free-text block. That assumption is now **enforced**, not assumed —
it is the first thing Phase 0 INTAKE checks, before any picker:

| Condition | Behaviour |
|-----------|-----------|
| Fresh start AND no `Requirement:`/`Bug:` line (or empty/whitespace) AND no resume target (no dev_log Status Panel) | **STOP `BLOCKED` before the picker.** Blocker: `Requirement missing — a free-text requirement cannot be acquired via a picker.` Next Step: a re-run line with an explicit `Requirement:`/`Bug:` block (+ optional `Automation Mode:` / `Verify Cross-vendor:`). Do **not** fire AskUserQuestion. |
| Resume invocation (dev_log Status Panel exists) | Exempt — Requirement was captured at first plan/diagnose write. |
| Fresh start WITH a non-empty `Requirement:`/`Bug:` | Proceed to §3 trigger evaluation, then §2 picker. |

**Why a hard stop and not a question:** Automation Mode and Verify Cross-vendor
are closed sets → pickable via AskUserQuestion. A requirement is open free-text →
a picker cannot capture it. The only correct missing-field behaviour is a hard
BLOCKED with a precise re-run instruction. This is the single asymmetry in Phase 0
INTAKE's three fields:

| Field | Missing-field behaviour |
|-------|-------------------------|
| Requirement / Bug | **BLOCKED** (free-text — never a picker) |
| Automation Mode | Ask (picker §2 Q1); host can't ask → **BLOCKED** (no safe default) |
| Verify Cross-vendor | Ask (picker §2.6 Q2); host can't ask → default `yes` (strict), **proceed** (safe default exists) |

---

## 2. The picker — single AskUserQuestion, 4 options

### 2.1 Options table (feature flavor)

| # | label (1-5 words) | variant written |
|---|---|---|
| 1 | A-Claude (single IDE) | `A-Claude` |
| 2 | D-Codex+Cursor (resilient) | `D-Codex+Cursor` |
| 3 | D-Codex (single delegate) | `D-Codex` |
| 4 | D-Cursor (single delegate) | `D-Cursor` |

No "Other" option. Experimental variants (`B-Codex` / `B-Cursor` / `C-Codex` / `C-Cursor`) are
reachable only via explicit invocation — see §2.3.

### 2.2 Options table (bugfix flavor)

Identical to §2.1. Bugfix never reaches a C-* variant because `bugfix-full-loop.md` Inputs already
rejects phase-granularity at the input gate; the picker therefore lists the same 4 options without
extra B/C entries. The B-* variants are still reachable for bugfix via explicit invocation (§2.3).

### 2.3 B/C variants — explicit invocation only

A user who needs `B-Codex` / `B-Cursor` / `C-Codex` / `C-Cursor` invokes the meta-orchestrator with
the variant on the first line of the prompt:

```
Start the feature-full-loop agent for <feature>.
Automation Mode: C-Codex
Requirement: <text>
```

This is intentional — B/C require infrastructure (hook scripts, post-commit hook, dispatch
scripts; for C also `feature-phase-review` registered) and should not be a one-click choice. The
question text in §2.4 includes a one-line pointer so users know how to reach them.

**What B-* covers (2026-05-16 scope).** The post-commit hook is now a **multi-state dispatcher** —
not just a build trigger. With the right infrastructure (`dispatch_<vendor>.sh` +
`git-post-commit` + project-layer helpers in `lib_hook_helpers.sh`):

| Status transition | Auto-dispatch |
|---|---|
| `NEEDS_REVIEW` | `feature-review` dispatched to the OTHER vendor (§16.3 #3 STRICT) |
| `APPROVED` | `feature-auto-build` dispatched to the lead vendor (B-* only; C-* uses the per-phase marker path) |
| `READY_FOR_VERIFY` + `Verify Cross-vendor: yes` | `feature-verify` dispatched to the OTHER vendor |
| `READY_FOR_VERIFY` + `Verify Cross-vendor: no` | notify only (lead-handle or direct-ship) |
| `REVISE` / `BLOCKED` | notify only (manual intervention) |
| `READY_TO_SHIP` / `SHIPPED` | notify only (manual ship gate) |

Net result: B-* happy-path interactions drop to **0** between Step 0 and ship. See
`_portable/04-automation-loop.md` §3.4 for the full state machine.

### 2.4 Question text

```
Pick an Automation Mode for this <feature|bugfix>.
(Experimental variants — B-Codex / B-Cursor / C-Codex / C-Cursor — require extra
 infrastructure; invoke them by passing `Automation Mode: <variant>` on the start
 prompt, see `_portable/04-automation-loop.md` §3.4 / §3.5 / §3.7.)
```

### 2.5 Per-option preview content (markdown, 5-section)

Each preview follows the same 5-section structure so users can compare side by side. Length target:
≤ 250 words per option so preview rendering stays within typical UI bounds.

#### Option 1 — A-Claude (single IDE)

```markdown
**A-Claude — single-IDE loop**

- **执行模型:** 同步。整个 step 0 → plan → review → dev-loop 全部在 one IDE
  session 里跑,native sub-agent spawn 派生子 agent。
- **Executor 分工:** plan / review / build / verify 全部 Claude;遇到 strong-tier
  quota 上限 → workers 降到 fast tier(reviewer / verify 仍 strong tier)。无外部 CLI。
- **Phase 粒度:** feature-dev-loop 一次跑完全部 phases + verify,中间不停。
- **何时停下来:** Phase 5(verify PASS 后),输出 READY_TO_SHIP,等你手动跑 `ship`。
  整个 pipeline 只 2 次用户交互:启动 + ship 确认。
- **额外依赖:** 无。最稳的 variant,推荐新团队第一个 feature 用。
- **不要选 A-Claude 当:** fast-tier 也耗尽 quota / 你想观察外部 executor 怎么协作。
```

#### Option 2 — D-Codex+Cursor (resilient)

```markdown
**D-Codex+Cursor — lead-and-delegate with 3-layer fallback**

- **执行模型:** 同步,无 hook。lead 的 build worker 在每个 phase **内联**地把实现
  交给外部 CLI;外部失败时 worker 自己实现。
- **Executor 分工:** plan / review / verify 由 lead 跑;build 的每个 phase 由 worker
  决定 **delegate 还是 self**:schema / design 类 Claude 自己做,机械大改类 delegate。
  Fallback chain:`codex exec` → `cursor-agent` → lead self。**Status Panel 的写入者
  始终是 lead worker**(`feature-auto-build`),trailer 不挂 Codex / Cursor。
- **Phase 粒度:** dev-loop 一次跑完全部 phases + verify,中间不停。
- **何时停下来:** Phase 5,等你手动 ship。0 次额外交互。
- **额外依赖:** `codex` CLI(需 `--sandbox workspace-write`)**和** `cursor-agent`
  CLI;macOS 上 `gtimeout`(brew install coreutils)、`flock`(brew install util-linux)。
- **选 D-Codex+Cursor 当:** 任务量大、单 executor 经常 quota cap、想要"任一 executor
  上限不影响整体进度"的最稳路径。8 个 variant 里**最抗 quota** 的。
```

#### Option 3 — D-Codex (single delegate Codex)

```markdown
**D-Codex — lead-and-delegate to codex exec only**

- **执行模型:** 同步,无 hook。和 D-Codex+Cursor 同结构,但 fallback chain 只有 2 层:
  `codex exec` → lead self(没有 Cursor 中间层)。
- **Executor 分工:** plan / review / verify lead;build 内联 delegate 给
  `codex exec --sandbox workspace-write --cd <repo>` headless。
  Status Panel 写入者:lead worker(`feature-auto-build`)。
- **Phase 粒度:** 全 phase + verify 一次跑完。
- **何时停下来:** Phase 5,等你手动 ship。0 次额外交互。
- **额外依赖:** `codex` CLI;macOS 上 `gtimeout`。
- **选 D-Codex 当:** 你装了 / 只想用 Codex CLI;Cursor 没装或不想用。
- **1-1 对比 vs A-Claude:** D-Codex 把大改的机械 phase 外推给 Codex,lead context
  压力小;A-Claude 全 lead 跑,简单但 lead quota 压力大。
```

#### Option 4 — D-Cursor (single delegate Cursor)

```markdown
**D-Cursor — lead-and-delegate to cursor-agent only**

- **执行模型:** 同步,无 hook。和 D-Codex 同结构,但 delegate 给 `cursor-agent` 而
  不是 `codex exec`。Fallback chain:`cursor-agent` → lead self。
- **Executor 分工:** plan / review / verify lead;build 内联 delegate 给
  `cursor-agent --headless` 或等价 CLI。Status Panel 写入者:lead worker。
- **Phase 粒度:** 全 phase + verify 一次跑完。
- **何时停下来:** Phase 5,等你手动 ship。0 次额外交互。
- **额外依赖:** `cursor-agent` CLI;macOS 上 `gtimeout`。
- **选 D-Cursor 当:** 你装了 / 只想用 Cursor CLI;Codex 没装或不想用。
- **vs D-Codex+Cursor:** D-Cursor 是 2 层 fallback;D-Codex+Cursor 是 3 层,quota
  压力大时优先 D-Codex+Cursor。
```

### 2.6 Verify Cross-vendor companion question (same AskUserQuestion call)

When the picker fires on a fresh start AND the invocation prompt has **no**
`Verify Cross-vendor:` line, the picker carries a **second question in the SAME
AskUserQuestion call** — Q1 = Automation Mode (§2.1, 4 options), Q2 = Verify
Cross-vendor (2 options). One call, two questions. Never two sequential pickers.

| # | label | value written | meaning |
|---|---|---|---|
| 1 | Yes — strict cross-vendor verify | `yes` | build via `feature-auto-build` (stops before verify); `feature-verify` runs separately in a different executor lineage |
| 2 | No — same-lineage (allow feature-dev-loop) | `no` | build+verify run in one executor lineage via `feature-dev-loop` |

Question text:

```
Verify Cross-vendor for this <feature|bugfix>? (Yes = stricter — build and
verify run in different executor lineages, catches lineage-specific blind
spots. No = faster — feature-dev-loop runs build+verify in one lineage.)
```

Don't-ask / fallback (note: differs from Mode — Verify HAS a safe default):

| Situation | Behaviour |
|-----------|-----------|
| Resume mode | Read from dev_log Status Panel `Verify Cross-vendor:`; never re-ask |
| Explicit `Verify Cross-vendor:` value on the prompt | Use as-is; do **not** add Q2 |
| Host tool lacks `AskUserQuestion` | Default `Verify Cross-vendor: yes` (strict) and **proceed** — NOT a BLOCKED. Only Requirement (§1A) and Automation Mode hard-block; Verify has a safe strict default. |
| `A-Claude` (single-vendor) selected in Q1 | Q2 is still asked (per the always-ask design) but is effectively **moot**: cross-vendor verify is physically impossible single-vendor, so `feature-plan` treats `yes` as best-effort same-vendor verify and never blocks on it. |

Write-authority unchanged (§6): the meta-orchestrator appends a Work Log line
only; `feature-plan` / `bug-diagnose` write the Status Panel
`Verify Cross-vendor:` field — exactly as for `Automation Mode:`.

---

## 3. Trigger conditions — when to ask, when not to

### 3.1 Ask

**Precondition:** §1A Requirement/Bug presence gate must have passed (a fresh start
with no `Requirement:`/`Bug:` STOPs `BLOCKED` and never reaches here).

Fire the picker (§2) **if and only if** all of these hold:

1. The invocation is a **fresh start** (Phase 0 INTAKE has a non-empty
   `Requirement:`/`Bug:` per §1A, not a resume cue).
2. Invocation prompt has **no** `Automation Mode:` field, OR the field's value is not one of the 8
   legal variants.
3. The host tool **supports `AskUserQuestion`**.

When firing, if the prompt also has no `Verify Cross-vendor:` line, the picker
carries the §2.6 companion question as Q2 in the same call (Mode = Q1). If
condition 3 fails: Automation Mode → BLOCKED (no safe default); Verify
Cross-vendor → default `yes` and proceed (§2.6).

### 3.2 Don't ask

| Situation | Behaviour |
|-----------|-----------|
| Resume mode (the `Start the <name> agent for <feature>.` short form) | Read Mode from dev_log Status Panel; never re-ask |
| Invocation prompt has a legal `Automation Mode:` value | Use it as-is |
| Caller is `<skill_prefix>roadmap-loop` run mode dispatch (`emit` / `bg` / `serial` / `spawn`) | The generated feature prompt or inline recipe is required to include a resolved `Automation Mode:` value (§4 layer 1-3); the Automation Mode picker never fires here. The separate dispatch-mode confirmation question lives in `06` §A7.3. |
| Fresh start, no `Requirement:`/`Bug:` | Handled earlier by §1A — STOP `BLOCKED` before §3 is even evaluated (never reaches the picker) |
| Invocation prompt has a legal `Verify Cross-vendor:` value | Use it as-is; the §2.6 Q2 is not added |
| Host tool does not support `AskUserQuestion` | **Automation Mode:** STOP with Handoff `Status: BLOCKED`, Blocker `Automation Mode missing and AskUserQuestion not available in this tool.`, Next Step `Re-run with: Start the <agent> agent. Requirement: <text>. Automation Mode: <one of the 8 — see 04 §3>`. **Verify Cross-vendor:** do NOT block — default `yes` (strict) and proceed (§2.6). |

---

## 4. 5-layer fallback — run-time resolution (roadmap-loop preflight)

When `<skill_prefix>roadmap-loop` `run` mode starts, it resolves the Automation Mode for every
PENDING row **before** entering the main loop, in this order (high → low precedence):

```
1. row['Automation Mode'] ∈ {8 legal variants}                       → use row value
2. row['Automation Mode'] == '(default)' AND
   header['Default Automation Mode'] ∈ {8 legal variants}            → use header value
3. row['Automation Mode'] == '(default)' AND header invalid AND
   a run_time_fallback was already set this session                  → use run_time_fallback
4. row['Automation Mode'] == '(default)' AND header invalid AND
   run_time_fallback not set                                         → fire picker §2 ONCE
                                                                       (per session, not per row),
                                                                       store as run_time_fallback,
                                                                       loop back to layer 3
5. row['Automation Mode'] is neither '(default)' nor a legal variant → row Status = BLOCKED,
                                                                       Note = "invalid Automation
                                                                       Mode '<value>' in manifest",
                                                                       skip in main loop
```

**Key invariant:** the run_time_fallback set at layer 4 is **session-local and never written back
to the manifest**. Persistence requires a human hand-edit of the manifest header (or a re-run of
`init`). Rationale: the manifest is the human audit trail; a `run` that silently writes back loses
that trail and confuses the next reader.

By the time `run` reaches the main loop, every spawn of `<feature-full-loop|bugfix-full-loop>`
gets a concrete legal variant in its prompt — the picker never re-fires inside the loop.

---

## 5. Per-feature asking — roadmap-loop init flow

`<skill_prefix>roadmap-loop` `init` mode walks the source doc (parse path) or decomposes a PRD
(decompose path) and produces one row per feature. While drafting, it asks per row, with a smart
inheritance shortcut so the common "all features same Mode" case stays fast.

### 5.1 Flow

```
For row #1:
  Fire picker §2 (full 4-option). Result = Mode_1.
  Write manifest:
    header 'Default Automation Mode: <Mode_1>'
    row #1 'Automation Mode: (default)'

For row #2..N:
  Ask:
    Question: "Feature #<i> <slug> — Automation Mode?"
    Option 1: "Same as Default (<Mode_1>)"  → write row 'Automation Mode: (default)'
    Option 2: "Pick a different Mode"        → fire picker §2,
                                                write row 'Automation Mode: <variant>' (explicit)
```

**Result for a homogeneous Round-6-like roadmap (13 features, all same Mode):** 1 full picker + 12
single-clicks = 13 interactions, manifest has 1 header + 13 rows all reading `(default)`.

**Result for a mixed roadmap (e.g. 11 same Mode + 2 explicit overrides):** 1 full picker + 11
single-clicks + 2 full pickers = 13 interactions of varying weight, manifest has 1 header + 11
`(default)` rows + 2 explicit rows. The override rows are visually distinct in the manifest, easy
to spot.

### 5.2 Variant — strict per-row picker (no inheritance shortcut)

Projects that want every row to go through the full picker (no "Same as Default") can disable the
shortcut by setting a project-layer flag (e.g. `init.shortcut_inheritance = false` in the project's
roadmap-loop spec). Default is **on**.

### 5.3 Decompose path interaction

The decompose-path step "ask before guessing" (`06` §A7.2 step 4) and the per-row picker here are
two separate ask rounds with different purposes:

- **Decompose ask** = about the *shape* of the manifest (one feature or two? real dependency or
  parallelisable?). Batch these into one focused round before any row is written.
- **Per-row picker** = about Mode selection per row, after the shape is settled.

Don't conflate them. If a decompose-path ambiguity round confirms a row's Mode (because the user
chose to specify it during decomposition), record it and **skip** that row's per-row picker.

---

## 6. Write-authority — who writes the resolved Mode + Verify Cross-vendor where

This section is a strict subset of the canonical write-authority matrix in
`02-handoff-and-state.md` §2.6 (hereafter **02 §2.6** — not to be confused with
this file's §2.6, which is the Verify Cross-vendor companion question) — do not
extend it here.

| Actor | What it writes | Why |
|-------|----------------|-----|
| `feature-full-loop` / `bugfix-full-loop` | Append-only Work Log lines: `[<ts>] Automation Mode selected via picker = <variant>` and (if asked) `[<ts>] Verify Cross-vendor selected via picker = <yes\|no>` | Allowed (Work Log is append-only, not a state mutation). Never writes Status Panel. |
| `feature-plan` | Status Panel `Automation Mode: <variant>` **and** `Verify Cross-vendor: <yes\|no>` on first NEEDS_REVIEW write | feature-plan is in 02 §2.6's write list for NEEDS_REVIEW; both fields are carried in as part of the row write |
| `bug-diagnose` | Status Panel `Automation Mode: <variant>` **and** `Verify Cross-vendor: <yes\|no>` on first NEEDS_DIAGNOSIS write | Bugfix analogue of the above |
| `<skill_prefix>roadmap-loop` init | manifest header `Default Automation Mode:` and per-row `Automation Mode:` cells | Manifest is the skill's own state file; not a dev_log Status Panel |
| `<skill_prefix>roadmap-loop` run | nothing in the manifest related to Mode; `run_time_fallback` is session-local | See §4 invariant |

**Failure mode if violated:** if `feature-full-loop` writes Status Panel directly, the State
Verification lint(`scripts/lint/check_state_verification_compliance.py`)rejects the commit because
`feature-full-loop` is not in the Status Panel writer list (02 §2.6).

> **B-* / C-* hook scope (2026-05-16 reminder).** B-* variants now cover the full review → build →
> verify cycle via hook auto-dispatch — see §2.3 table above and `_portable/04-automation-loop.md`
> §3.4 for the full state machine. Setting up requires `dispatch_<vendor>.sh` +
> `git-post-commit` installed in `<cowork_scripts_dir>` + `.git/hooks/post-commit` installed as a
> chained wrapper (backs up/runs any previous hook; **not** a symlink) + a project-layer
> `lib_hook_helpers.sh` defining `determine_other_vendor` /
> `determine_lead_from_variant` / `render_review_prompt` / `render_build_prompt` /
> `render_verify_prompt`. Without those helpers the hook degrades to notify-only (pre-2026-05-16
> behaviour).

---

## 7. Common failure modes

1. **Asking per-feature inside roadmap-loop `run`.** §4 forbids it; the picker is for `init` and
   for the run-time fallback (once-per-session). If you find yourself spawning `feature-full-loop`
   and discovering Mode is `(default)` with header invalid, **stop and re-run init** rather than
   silently asking.

2. **preview content over-length, key info clipped.** Keep each option's preview ≤ 250 words. Put
   "choose X when / don't choose X when" at the **top**, detailed CLI / install commands at the
   **bottom** with a `_portable/04` deep link. The 5-section structure in §2.5 is the template.

3. **User picks Mode but it's never persisted.** `feature-full-loop` must append a Work Log line
   immediately after the picker resolves. The Status Panel write happens later when `feature-plan`
   runs Phase 2 — but if the orchestrator forgets the Work Log, a session restart sees an empty
   dev_log and re-fires the picker.

4. **`feature-full-loop` writes Status Panel directly.** Violates §6 / 02 §2.6. State Verification
   lint rejects the commit. Fix: only `feature-plan` / `bug-diagnose` write Status Panel.

5. **`run` writes the run-time fallback back to the manifest.** Loses human audit trail (§4
   invariant). Fix: keep `run_time_fallback` session-local, and at wrap-up print a Notice:
   "This wave used run-time fallback Mode = <X> for rows whose Default was missing. To make this
   persistent, edit the manifest header 'Default Automation Mode' or re-run init."

---

## 8. Universal Next Step Contract compatibility (`02` §3.3)

`AskUserQuestion` is an in-session interaction, **not** an agent termination. The Output Contract
only requires a `Next Step` block on STOP. Therefore:

- During picker interaction: no Handoff block emitted; the agent is still mid-run.
- After picker resolves: agent continues to the next step (no Handoff).
- On any STOP path (host tool doesn't support AskUserQuestion / user cancels) the picker site must
  emit a fully compliant Handoff per `02` §3.3 with a Next Step that tells the user how to specify
  Mode on the next invocation.

This file's spec is consistent with `02` §3.3 — adding picker behaviour does not change termination
contracts. The three meta-orchestrators that consume this file keep their own termination contracts
(Handoff template + Output Contract) intact.

---

## 9. Consumers of this file

- `_portable/templates/feature-full-loop.md` — Phase 0 INTAKE references §2 + §3.
- `_portable/templates/bugfix-full-loop.md` — Phase 0 INTAKE references §2 + §3 (notes bugfix flavor in §2.2).
- `_portable/06-roadmap-orchestration.md` Appendix SKILL.md — init mode references §5; run mode references §4.
- `_portable/04-automation-loop.md` §3 — pointer at the top of §3 noting "for how a Mode is picked at runtime, see `07-automation-mode-picker.md`".
- `_portable/usage-guide.md` §4.2 — pointer below the 8-variant table noting the picker.

If you change the picker (option count, option labels, fallback layers, write-authority), update
this file first and consumers second — never the other way around.
