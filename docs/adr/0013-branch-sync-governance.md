# ADR-0013 — Branch Topology, Web→Desktop Sync Gate & Account Cloud-Sync Governance

## S1 — 概述 / Header

| 字段 / Field | 值 / Value |
|---|---|
| ADR # | 0013 |
| Title | Branch Topology, Web→Desktop Sync Gate & Account Cloud-Sync Governance |
| 状态 / Status | **Proposed** — 2026-05-30 (operator will flip to Accepted) |
| 日期 / Date | 2026-05-30 |
| 决策者 / Author | Claude Opus 4.8 (1M context) — drafted at operator (Jinlong) request |
| Supersedes | none |
| Builds on / Extends | ADR-0009 §D1–§D4 (priority order + surface scope matrix), ADR-0010 §D1/§D4 (P0/P1/P2 model + P0 carve-out rule), `docs/contracts/data-repository-v0.md` (syncScope model), `docs/workflow/roadmap/sync-v1.md` (account-sync roadmap) |
| Related | ADR-0003 (three-faces architecture), ADR-0006 (web-face hybrid reuse boundary), ADR-0007 (xai-web-console build form), ADR-0008 (cloudflare deploy + CSP), `docs/TECHNICAL_REQUIREMENTS.md` (sync protocol), `docs/PLUGIN_SDK.md` |

---

This ADR is **governance-layer**, not a priority pivot. It does **not** change the
P0/P1/P2 active-focus order set by ADR-0010 (P1 Desktop ACTIVE; P0 Web
MAINTENANCE-ONLY; P2 paused). It adds three things the project has been running
informally and now needs a stable authority anchor for:

1. A **product-line map** (six lines) reconciled with the existing P0/P1/P2
   model, separating *product-line importance* from *current active dev focus*.
2. A **branch topology** that codifies the already-observed `web ⊇ dev`
   ("Web leads, Desktop follows") reality as an intentional design rule, with
   structured catch-up lanes and a release branch pattern.
3. A **Web→Desktop sync gate** + **account cloud-sync per-feature contract**,
   both built on top of `data-repository-v0`'s `syncScope` model (not a
   redefinition of it).

Five sub-decisions:

| Sub-decision | Summary |
|---|---|
| **D1** — Six product lines + priority reconciled with P0/P1/P2 | Product-line importance ≠ current active dev focus; mapped in one table |
| **D2** — Branch topology + promotion / hotfix paths | `web` / `desktop-next` / `desktop-plugin-next` / `dev` + ephemeral `release/desktop/<version>` |
| **D3** — Web→Desktop sync GATE (spec for the future `xai-web-to-desktop-sync` skill) | W0–W4 classification + parity-receipt output contract |
| **D4** — Account cloud-sync model (build on `syncScope`) | Web ⇄ account cloud ⇄ App; per-feature `account-sync` completeness checklist |
| **D5** — `web`-leads / `dev`-lags codified as a design rule | The lag is managed via D2 lanes + D3 gate, NOT drift to be eliminated |

---

## S2 — 背景 / Context

### Problem

The repo now carries three product surfaces (Web Console, macOS Desktop App,
desktop organizer plugins) plus an emerging account cloud-sync layer, an
official-website need (download + auto-update host), and an admin-dashboard
prototype. ADR-0009 and ADR-0010 governed *which surface is the active dev
focus over time*. They did **not** govern:

- how the six product lines relate to each other as **products** (importance)
  vs. as **current work** (active focus) — these two orderings genuinely differ
  (Web is the most complete product, but Desktop is the currently ACTIVE focus
  per ADR-0010);
- how the long-lived **branches** relate, and how a Web change is supposed to
  flow into the Desktop App;
- how Web and App **share an account cloud** without syncing to each other.

### Confirmed ground-truth facts (used as given, not re-litigated)

- **`web ⊇ dev` is BY DESIGN.** `git rev-list --left-right --count
  origin/web...origin/dev` on 2026-05-30 reads **`134  0`** (web ahead 134,
  dev ahead 0). This is the **intended steady state**: `web` is the
  primary/most-current dev line (Web-first); `dev` is the desktop/App candidate
  line that intentionally lags and receives Web work through a gate. This is
  NOT drift or a migration/cleanup problem.
- **Two machines, two independent branch lines.** Development runs on **two
  physical computers** that work **independently**: this machine drives `web`
  (Web-first, leading); the other machine drives `dev` (Desktop/App, lagging).
  Each authors its own commits, branch docs, and ADRs on its own line; the two
  reconcile only when work flows `web → … → dev` (forward, per D2/D5) or at a
  `main` merge. This is already borne out: a `git fetch` on 2026-05-30 shows
  `origin/dev` has **committed** `ADR-0011` (P1 React+Tauri+Local-first) and
  `ADR-0012` (Phase-3 local-first storage), which `web` had **not** synced — so
  the independently-authored numbers **0011 and 0012 are already taken on `dev`**
  (this is what the external `ADR-0012` reference + `/Users/jinlong/...` path in
  pasted context pointed at). Consequence: ADR numbers (and roadmap/shared docs)
  must be a **repo-wide reserved space**, never per-branch — see §S7 #1.
- **Active-focus order is unchanged from ADR-0010** (Accepted 2026-05-26): P1
  Desktop client ACTIVE (G1 native foundation, `apps/desktop/`); P0 Web Console
  MAINTENANCE-ONLY (`apps/web/`); P2 organizer plugins + sync-v1 + G2 paused
  until G1 ships.
- The `syncScope: "device-local" | "account-sync"` model already exists in
  `docs/contracts/data-repository-v0.md` §2 + §6 and must be **built on**, not
  redefined.
- The account-sync **protocol** is already specified in
  `docs/TECHNICAL_REQUIREMENTS.md` (`/sync/push` Edge Function, per-device
  `encryption_device_id`, JWT device match, AES-256-GCM + deterministic-CBOR
  AAD, server nonce lease) and `docs/workflow/roadmap/sync-v1.md` (push/pull
  engines #26/#27, encrypted-blob protocol). This ADR records the **governance
  rule** for that protocol, not the crypto.

### Codebase context (read 2026-05-30 on branch `web`)

- On `web`, ADRs *appeared* to top out at 0010, but a 2026-05-30 `git fetch`
  shows `origin/dev` has **committed `0011` + `0012`**
  (`0011-p1-react-tauri-local-first-hybrid.md`,
  `0012-phase3-local-first-storage.md`) that `web` has not synced. The next free
  **repo-wide** number is therefore **0013** — this ADR (see §S7 #1).
- Branches present: `web` (current), `dev`, `main`, plus `origin/{web,dev,main}`
  and historical `origin/spike/window-ground-truth`. No `desktop-next`,
  `desktop-plugin-next`, or `release/*` branch exists yet.
- No `xai-web-to-desktop-sync` skill exists yet — D3 is its **spec**, marked
  PLANNED.
- admin-dashboard prototype exists at `docs/prototypes/admin-dashboard/index.html`.

---

## S3 — 方案 / Options Analyzed

### Option A — One governance ADR codifying topology + gate + sync model (CHOSEN)

Write a single ADR that (a) maps the six product lines onto P0/P1/P2, (b)
defines the branch topology and promotion/hotfix paths, (c) specifies the
Web→Desktop sync gate as the future skill's contract, and (d) records the
account cloud-sync per-feature rule on top of `syncScope`.

**Pros:**
- One authority anchor for "how do branches relate" / "how does a Web change
  reach the App" / "what makes an account-sync feature complete".
- Codifies the `web ⊇ dev` reality so future readers stop treating it as drift.
- Extends — does not contradict — ADR-0009 / ADR-0010 / `data-repository-v0`.
- Defining the topology on paper is zero-risk; actually creating branches is a
  separate, operator-gated step.

**Cons:**
- Branch topology committed in an ADR is harder to change later (needs a
  follow-up ADR/amendment).
- Some slots (official website, admin-dashboard) are PROPOSED, not yet
  operator-confirmed, so the ADR carries open items.

### Option B — Leave topology + sync flow as informal convention

Keep relying on tribal knowledge ("web leads, dev lags", "merge web into dev
when ready") without an anchor.

**Pros:** zero ADR overhead; maximum flexibility.

**Cons:** every new contributor / AI session re-derives (or mis-derives) the
`web ⊇ dev` relationship and the Web→App flow; the next person who sees
`web` 134 ahead of `dev` "fixes" it by force-merging dev forward, destroying the
intended lag. No contract for what an account-sync feature must ship.

### Option C — Create the new branches now as part of this ADR

Define the topology AND immediately create `desktop-next`,
`desktop-plugin-next`, `release/desktop/<version>`.

**Pros:** topology becomes real immediately.

**Cons:** violates this task's hard constraint (no branch ops, especially
anything touching `dev`); branch creation is an operational act that deserves
its own operator confirmation and a clean base-commit decision; premature —
the lanes are only needed when the first post-ADR Web→Desktop sync actually
runs.

**Decision: A.** Document the model now; defer branch creation to an explicit,
operator-confirmed step.

---

## S4 — 决策 / Decisions

### D1 — Six product lines + priority, reconciled with P0/P1/P2

The operator defines six product lines in rough product-importance order.
**Product-line importance ≠ current active dev focus.** Web is the most complete
*product* (line 1), but per ADR-0010 the currently ACTIVE *dev focus* is the P1
Desktop client (line 2). Both statements are true simultaneously; the table
below keeps them in separate columns so they never get conflated again.

| # | Product line | Surface / where | Packages (representative) | Product-priority | Current dev-status (per ADR-0010) |
|---|---|---|---|---|---|
| 1 | **web** — most complete feature product | `apps/web/` (Vite SPA) | `packages/xai-web-*`, `packages/plugin-web-*` | P0 | **maintenance** — bug-fix only; new features need a P0 carve-out commit citing ADR-0010 §D4. It is also the **primary UI source** the App is built from. |
| 2 | **mac desktop App** (built on web) | `apps/desktop/` (Tauri 2 + React 19) | `packages/plugin-{account, console, productivity, ai-cube, calendar, labels, project}` + G0/G1 anchors | P1 | **active** — G1 native foundation (`docs/workflow/roadmap/xai-g1-native-foundation.md`). |
| 3 | **desktop organizer plugins / widgets** | `apps/desktop/` plugin slots | `packages/plugin-{organizer, clipboard, widgets, meditation, pet}` | P2 | **paused** — resumes when G1 ships (ADR-0010 §D2). |
| 4 | **account cloud-sync layer** (3 surfaces → one account) | sync-v1 stack + server | sync-v1 crypto stack (~50 pkgs), `@repo/core-data` `syncScope`, `plugin-account` push/pull engines | P2 | **paused** — post-G1 per ADR-0010 §D2 (sync-v1 stays PAUSED until G1 SHIPPED). Contract governed by D4 below. |
| 5 | **official website** (marketing + download + auto-update host) | NEW line — not yet a package | proposed: reuse P0 Cloudflare deploy infra (`apps/web/deploy/*`, `wrangler.toml`) + a `release/*`-fed download/updater surface | **PROPOSED** (gates App distribution) | **proposed** — see Open Questions §S7; tie to `release/desktop/<version>` (D2) + ADR-0008 deploy target. |
| 6 | **admin-dashboard** | NEW line — prototype only | prototype at `docs/prototypes/admin-dashboard/index.html` | **PROPOSED** (lowest of the six) | **proposed** — no package, no roadmap yet. |

Rules attached to D1:

- Lines 1–4 inherit their dev-status from ADR-0010 verbatim; this ADR does
  **not** change any active-focus decision.
- Lines 5 and 6 are **PROPOSED**: their exact priority slot and start trigger
  require operator confirmation (Open Questions §S7). Until confirmed they
  carry no active-focus claim and no new-work authorization.
- "Product-priority" answers *how important is this product*; "current
  dev-status" answers *are we allowed to do new work on it right now*. Cite the
  right column for the right question.

### D2 — Branch topology

Long-term branches (4) + one ephemeral pattern. This **defines** the topology;
it does **not create** any branch (see the "creation is a separate step" rule
below).

| Branch | Responsibility | Promotes-to | Receives-from |
|---|---|---|---|
| `web` | Web mainline / Web release source. Most-current dev line (Web-first). | Web release (Cloudflare Pages per ADR-0008); and `desktop-next` via the D3 sync gate | `codex/web/<feature>` short-lived feature branches; release/web hotfix cherry-picks |
| `desktop-next` | Web→App sync **integration** branch + Desktop next-step work. Where the D3 gate runs and App deltas are added. | `dev` (App RC), once an integration cycle is green | `web` (through the D3 gate); `desktop-plugin-next` (when a plugin-platform cycle is READY); short-lived single-plugin branches |
| `desktop-plugin-next` | App **plugin platform / SDK** line. Separate so plugin-platform churn cannot destabilize the App release candidate. | `desktop-next` (merge back when READY) | `desktop-next` (rebases onto it); plugin-platform feature branches |
| `dev` | Desktop **stable mainline / App release candidate (RC)**. Intentionally **lags** `web`. | `release/desktop/<version>` (freeze) | `desktop-next` (promoted integration cycles); `release/*` hotfix back-merge |
| `release/desktop/<version>` (ephemeral) | **Freeze-only** branch: version bump, changelog, signing/notarization, `.dmg`, updater metadata, download-page artifacts, and **release-blocker hotfix only**. No feature work. | tag `vX.Y.Z`; back-merge to `dev` | `dev` (cut from it at freeze) |

**Promotion paths (forward flow):**

```
codex/web/<feature>  →  web  →  (Web release: Cloudflare Pages, ADR-0008)
web  →  desktop-next  (run the D3 Web→Desktop sync gate)
        →  补 App delta (native/runtime work classified W2/W3/W4)
        →  dev  (App RC)
desktop-next  ↔  desktop-plugin-next   (plugin platform; merge back when READY)
        small single plugins: short-lived branch off desktop-next, merge back to desktop-next
dev  →  release/desktop/<version>  →  tag vX.Y.Z
```

**Hotfix back-merge path (reverse flow):**

```
release/desktop/<version>  →  dev  →  desktop-next
        →  (if the hotfix touches plugin platform/SDK)  desktop-plugin-next
        →  (if the hotfix is web/shared code)  cherry-pick → web
```

**Creation is a SEPARATE step (hard rule):** This ADR **defines** the topology
only. Actually creating `desktop-next`, `desktop-plugin-next`, and any
`release/desktop/<version>` branch is a separate operational step requiring
**explicit operator confirmation** — especially any operation that touches
`dev`. **None of these branches are created by this ADR.** The first creation
should also decide each new branch's base commit (expected: branch
`desktop-next` from `dev`'s current tip, then run the first D3 gate to pull
`web` forward — but that base decision is the operator's, not this ADR's).

### D3 — Web→Desktop sync GATE

D3 is the **specification** that the future `xai-web-to-desktop-sync` skill
(PLANNED — does not exist yet) implements. Every Web change, **before** it flows
`web → desktop-next`, is classified into exactly one tier:

| Tier | Name | Meaning | Required action |
|---|---|---|---|
| **W0** | web-only | No App impact (e.g. Cloudflare deploy config, web-only marketing copy, a `plugin-web-*` view with no shared code). | **Record only.** No merge to `desktop-next` required; log the classification. |
| **W1** | shared-ui-safe | Touches shared UI / shared `@repo/core` seams in a way that is App-safe. | Merge to `desktop-next`; run **Web build gate + desktop `tauri build` gate**. |
| **W2** | desktop-runtime-affected | Behaves differently under the desktop runtime (offline/runtime/profile-sensitive). Note the existing `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` split. | Merge to `desktop-next`; run desktop **offline / runtime / profile** tests in addition to W1 gates. |
| **W3** | native-bridge-needed | Needs a Tauri/Rust delta (new command, capability, NSWindow/native behavior). | Route the native delta to **`/xai-feature-full-loop`** (full Workflow V2 on `desktop-next` / `desktop-plugin-next`); the App delta is real new work, not a merge. |
| **W4** | release-risk | RC/release-gating change (touches signing, updater, versioned distribution, or otherwise needs sign-off before an App release). | RC / release gate **including manual macOS smoke** before promotion to `dev` and before `release/desktop/<version>`. |

**Parity receipt — output contract.** Every run of the gate (manual or, later,
the `xai-web-to-desktop-sync` skill) emits a **parity receipt** with exactly
these fields:

```
Parity Receipt
  Verdict:          NO_APP_CHANGE | GATE_ONLY | DESKTOP_DELTA_REQUIRED | BLOCKED
  Web delta:        <commits / PRs / surface summary being synced>
  Desktop impact:   auth:    yes|no
                    offline: yes|no
                    storage: yes|no
                    native:  yes|no
                    window:  yes|no
                    release: yes|no
  Required desktop work:  <none | W1 gate | W2 tests | W3 native delta via /xai-feature-full-loop | W4 release gate>
  Verification gates:     <web build · tauri build · offline/runtime/profile tests · manual macOS smoke — as applicable>
  Next workflow:          <record-only | merge-to-desktop-next | /xai-feature-full-loop | RC/release gate>
  Parity status:          aligned | degraded | blocked | not-applicable
```

Mapping between tier and verdict (guidance, not a hard lock): W0 → `NO_APP_CHANGE`
(`not-applicable`); W1 → `GATE_ONLY` (`aligned` on green); W2 → `GATE_ONLY` or
`DESKTOP_DELTA_REQUIRED` (`aligned`/`degraded`); W3 → `DESKTOP_DELTA_REQUIRED`
(`degraded` until the native delta ships); W4 → `DESKTOP_DELTA_REQUIRED` or
`BLOCKED` until the release gate passes.

### D4 — Account cloud-sync model (build on `data-repository-v0` / `syncScope`)

**This builds on `docs/contracts/data-repository-v0.md` §2/§6 and
`docs/TECHNICAL_REQUIREMENTS.md`. It does NOT redefine the record model, the
`syncScope` enum, or the crypto protocol.**

**Topology:** Web and App do **not** sync to each other. **Both sync to one
account cloud layer.** Data link:

```
Web IndexedDB  ⇄  Sync API  ⇄  server encrypted blobs  ⇄  App SQLite (SQLCipher)
                (/sync/push, /sync/pull)   (encrypted_blobs, client read-only)
```

**Governance rules (recorded here; crypto lives in sync-v1 + TECHNICAL_REQUIREMENTS):**

- **Device identity:** each install registers a `device_id` (and is assigned a
  server `encryption_device_id`) per `docs/TECHNICAL_REQUIREMENTS.md`.
- **Transport:** push/pull encrypted blobs over `/sync/push` and `/sync/pull`
  with `Authorization` (JWT) + `X-Device-Id` + a protocol-version header. Server
  enforces JWT-device ↔ envelope match (already specified in sync-v1).
- **Cadence:** **near-real-time eventual** sync, NOT realtime. Triggers:
  post-write push; app/web **start** pull; **focus** pull; **network-recover**
  replay; a **15–60s light pull** loop; and a **manual Sync** action.
- **Conflict policy:** **NOT silent last-write-wins.** A conflict is either
  flagged (conflict shadow / surfaced to the user) or resolved by an explicit
  merge rule per entity. (Consistent with `data-repository-v0` §6 "Conflict
  resolution 必须 deterministic" + sync-v1 conflict-shadow design.)
- **Scope filter:** **only `syncScope: "account-sync"` entities sync.**
  `syncScope: "device-local"` entities (e.g. `clipboard.item`, `widgets.widget`)
  **never** enter the remote outbox (re-states `data-repository-v0` §6, does not
  change it).

**Per-feature completeness rule (the contract).** Any **new `account-sync`
feature** is **incomplete** unless it defines all of:

1. `entityType` (the `^[a-z]+\.[a-z_]+$` dotted slug, registered in
   `packages/core-data/src/entities.ts`);
2. `schemaVersion` (+ migration plan if changing an existing entity);
3. local store mapping (Web IndexedDB ↔ App SQLite columns);
4. push mutation format (outbox entry → `/sync/push` envelope);
5. pull apply rule (`/sync/pull` PullRecord → local upsert / conflict route);
6. conflict policy (flag or explicit-merge — never silent LWW);
7. a **Web IndexedDB** test;
8. an **App SQLite / outbox** test;
9. a **two-device sync smoke** (device A write → device B converges).

A feature that defines `syncScope: "device-local"` is exempt from items 4–6 and
8–9 (it must NOT sync) but still defines items 1–3 and 7.

### D5 — `web`-leads / `dev`-lags codified as a design rule

**`web ⊇ dev` is the intended steady state of "Web first, App follows."** The
lag between `web` and `dev` is **not drift to be eliminated**; it is the natural
consequence of Web being the primary dev line and the App being a downstream
candidate that ingests Web work deliberately. The lag is **managed**, not
removed, via:

- the **D2 catch-up lanes** (`web → desktop-next → dev`, with
  `desktop-plugin-next` isolating plugin-platform churn), and
- the **D3 sync gate** (every Web change classified W0–W4 before it flows
  forward, with a parity receipt).

Operational corollaries:

- Seeing `web` ahead of `dev` (e.g. `134  0` on 2026-05-30) is **expected** and
  must **not** be "fixed" by force-merging `dev` forward or by rebasing `web`
  onto `dev`.
- `dev` advances **only** through D2 promotion (`desktop-next → dev`) or D2
  hotfix back-merge — never by an ad-hoc `web → dev` merge that skips the gate.
- A future "catch-up" effort is a **sequence of D3 gate runs through
  `desktop-next`**, not a single big merge.

---

## S5 — 后果 / Consequences

### Positive

- **Single anchor for branch + sync governance.** Future contributors/AI cite
  ADR-0013 instead of re-deriving the `web ⊇ dev` model or the Web→App flow.
- **Protects the intended lag.** D5 explicitly prevents the "web is 134 ahead,
  let me fix that" failure mode that would destroy the App RC's stability.
- **The future sync skill has a spec.** D3 is a ready-made contract for
  `xai-web-to-desktop-sync`; the parity receipt is its output format.
- **Account-sync features become checkable.** D4's 9-item rule turns "is this
  sync feature done?" into a mechanical check, on top of (not duplicating)
  `data-repository-v0`.
- **Extends, never rewrites.** ADR-0009 / ADR-0010 active-focus decisions and
  `data-repository-v0` / sync-v1 contracts are untouched.

### Negative

- **Topology is now ADR-committed.** Renaming/restructuring branches later needs
  a follow-up ADR or amendment.
- **Carries open items.** Lines 5–6 (official website, admin-dashboard) and the
  branch-creation timing are PROPOSED/deferred; the ADR is Proposed until the
  operator resolves §S7 and flips Status.
- **Two-place discipline for account-sync.** D4 must stay consistent with
  `data-repository-v0` and sync-v1; if `syncScope` or the protocol changes there,
  D4's wording must be revisited.

### Neutral

- **No branches created, no code touched.** This ADR is docs-only; the topology
  is latent until the operator creates the branches.
- **sync-v1 stays PAUSED.** D4 is a governance contract for when line-4 work
  resumes (post-G1 per ADR-0010); it does not unpause anything.

---

## S6 — References

- `docs/adr/0009-web-to-desktop-pivot-plan.md` — priority order + surface scope
  matrix (D1–D4) that this ADR extends.
- `docs/adr/0010-p1-desktop-resume-plan.md` — P0/P1/P2 model + §D4 P0 carve-out
  rule that this ADR reconciles the six product lines against.
- `docs/contracts/data-repository-v0.md` — `syncScope: device-local |
  account-sync` record model that D4 builds on.
- `docs/workflow/roadmap/sync-v1.md` — account-sync roadmap (push/pull engines,
  encrypted-blob protocol) that D4 governs.
- `docs/TECHNICAL_REQUIREMENTS.md` — `/sync/push` protocol, per-device
  `encryption_device_id`, JWT device match, AES-256-GCM + CBOR AAD.
- `docs/adr/0008-cloudflare-deploy-target-and-csp.md` — Web release target that
  line 5 (official website) ties into.
- `developer.md` §3 (Repository Layout), `CLAUDE.md` "Current Priority" block,
  `docs/workflow/project/usage-guide.md` — updated in the same working-tree
  change as this ADR.
- `docs/prototypes/admin-dashboard/index.html` — line-6 prototype.

---

## S7 — Open Questions (operator-tracked)

1. **Cross-machine ADR / doc numbering — RESOLVED 2026-05-30: repo-wide reserved
   numbers (no per-branch reuse).** Root cause is structural: the **two machines
   author independently** (§S2), so both compute the same "next number" and
   collide. **Verified** (`git fetch`, 2026-05-30): `origin/dev` has already
   **committed** `0011-p1-react-tauri-local-first-hybrid.md` and
   `0012-phase3-local-first-storage.md`; `origin/web` has neither. So `0011` and
   `0012` are **taken**. This governance ADR was first drafted as `0011` (a live
   collision) and has been **renumbered to `0013`** — the next free repo-wide
   number.

   **DECISION — one repo-wide reserved number space.** Never reuse a number on
   another branch, even for an unrelated topic. Next ADR on either machine =
   **0014**. (The earlier "Convention A — dev reserves a `0090+` block" is
   **void**: dev already authored 0011/0012 in the main sequence.)

   **Recommended sync (operator).** Bring dev's two ADR **files** onto `web` so
   refs resolve. Do **not** `git cherry-pick` — verified `5af1f786` also edits
   `CLAUDE.md`/`docs/PLUGIN_MAP.md`/`0010` (diverged on `web` → conflicts) and
   `a83c3d7c` touches `packages/desktop-local-first-storage-adr/` (absent on
   `web` → fails). Use **file-only** checkout:
   `git checkout origin/dev -- docs/adr/0011-p1-react-tauri-local-first-hybrid.md docs/adr/0012-phase3-local-first-storage.md`
   then commit on `web`. (Tracked as §S7 #6.)

   **Content-supersession flag (NOT resolved here).** dev's `ADR-0011` =
   *"P1 Desktop Redefined as React+Tauri+Local-first; demote overlay/file-organizer
   to **P3 Future**"* (2026-05-27, **after** ADR-0010). That **partially
   supersedes ADR-0010 §D1**, which **this ADR's D1 table still cites**
   (organizer = P2; P1 = "mac desktop App"). Reconciling D1 is a **separate
   round** (§S7 #7); it does not block this numbering fix.
2. **Official-website priority + start trigger (line 5).** **Owner-deferred —
   out of scope for this governance round; stays PROPOSED; does NOT block
   ADR-0013 Acceptance.** It gates App distribution (download + auto-update host)
   and should tie to `release/desktop/<version>` (D2) + the ADR-0008 Cloudflare
   deploy target. Revisit its priority slot + start trigger in a later round.
3. **Admin-dashboard priority (line 6).** **Owner-deferred — out of scope for
   this governance round; stays PROPOSED (lowest of the six); does NOT block
   ADR-0013 Acceptance.** Prototype at `docs/prototypes/admin-dashboard/index.html`;
   revisit whether/when it becomes a real package + roadmap in a later round.
4. **When to actually create `desktop-next` / `desktop-plugin-next` /
   `release/*`.** D2 defines them but creates none. **Open:** operator confirms
   the creation step, each branch's base commit, and the first D3 gate run
   (anything touching `dev` needs explicit confirmation).
5. **`VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` authority location.** D3
   W2 references this offline-profile split as the existing runtime-profile
   mechanism. **Open:** confirm the canonical doc/config that owns this profile
   string so D3 W2 can link it precisely (it was not found in `docs/*.md` on
   this branch).
6. **Sync dev's ADR files onto `web`.** File-only checkout of
   `0011-p1-react-tauri-local-first-hybrid.md` + `0012-phase3-local-first-storage.md`
   from `origin/dev` (command in §S7 #1). Operator-gated; not done by this ADR.
7. **Reconcile D1 against dev's ADR-0011 (P1 redefinition / organizer→P3).**
   dev's ADR-0011 partially supersedes ADR-0010 §D1; this ADR's D1 table predates
   that knowledge. A later round updates D1 (+ handbook / dev-dashboard product-line
   map). Out of scope for the numbering fix.

---

## S8 — Acceptance / Review

- **Proposed by:** Claude Opus 4.8 (1M context) on 2026-05-30 at operator
  (Jinlong) request.
- **Status:** **Proposed.** §S7 **#1** (numbering) is **RESOLVED** — renumbered
  **0013**, convention = "repo-wide reserved numbers". Remaining gate = **operator
  final confirmation of this governance round**. §S7 **#2–#3** (official-website /
  admin-dashboard), **#4** (branch creation), **#5** (runtime-profile authority),
  **#6** (sync dev's ADR files), **#7** (reconcile D1 vs dev's ADR-0011) are all
  **deferred follow-ups, NOT Acceptance blockers**.
- **Two-machine note:** because `web` and `dev` are authored on independent
  machines (§S2), this ADR lives on the `web` line; its decisions reach `dev`
  through the D2 lanes like any other Web work. The numbering convention (#1)
  should be relayed to the `dev` machine once chosen.
- **Does not change** any ADR-0010 active-focus decision; it is additive
  governance. Creating the D2 branches (`desktop-next` / `desktop-plugin-next` /
  `release/*`) happens **only after the operator confirms the full governance
  round is final**, as a separate operator-gated step — anything touching `dev`
  needs explicit authorization.
