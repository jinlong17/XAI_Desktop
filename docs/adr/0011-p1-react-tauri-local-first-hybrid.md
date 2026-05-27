# ADR-0011 — P1 Desktop Redefined as React+Tauri+Local-first Hybrid App

## S1 — Header

| Field | Value |
|---|---|
| ADR # | 0011 |
| Title | P1 Desktop redefined as React+Tauri+Local-first hybrid app; legacy overlay / file-organizer plan demoted to P3 Future |
| Status | **Accepted** — 2026-05-26 (operator-confirmed product PIVOT during web-completeness audit) |
| Date | 2026-05-26 |
| Author | Claude Opus 4.7 (1M context) — drafted from operator-confirmed PIVOT + Codex web-completeness audit `docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md` |
| Supersedes | ADR-0010 §S4 D1 (P1 surface definition) + ADR-0010 §S4 D2 (xai-g0/g1 unfreeze direction) + CLAUDE.md §Current Priority P1 row + PLUGIN_MAP.md §Current Priority P1 row + `xai-g1-native-foundation.md` RESUMED banner |
| Builds on | ADR-0007 (web build form) · ADR-0008 (CSP / 24h-evidence) · ADR-0009 §D2 (web→desktop gating) · ADR-0010 §S4 D3 (SYSTEM_ARCHITECTURE rules) · ADR-0010 §S4 D4 (operational cross-cut rules) |
| Related | Codex audit: `docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`; patch roadmap source: `docs/audit/2026-05-26-patch-roadmap-source.md` |

---

## S2 — Background

ADR-0010 (Accepted 2026-05-26) re-prioritised the project to P1 = macOS Desktop client and unfroze `xai-g0-window-spike.md` / `xai-g1-native-foundation.md` whose product definition was "Tauri overlay shell + Smart Container file organizer + transparent click-through main window + `plugin-{organizer, clipboard, widgets, meditation, pet}` desktop plugins."

On 2026-05-26 (same day as ADR-0010 Acceptance), during a web-completeness audit triggered by the operator's `/workflow-router` request to plan a parallel two-machine branch strategy, the operator confirmed a product **PIVOT**:

> "Mac 软件 = React Web UI + Tauri 原生能力 + local-first 数据层 的混合桌面应用,不是单纯网页套壳,也不是全原生重写,普通窗口(非透明 click-through overlay)。"

This redefinition is incompatible with ADR-0010's P1 surface description. The Codex audit (`docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`) confirmed:

- `apps/web/` Web parity is mature enough (12 modules + Web shell + token/i18n/storage/event contracts all SHIPPED) to be the canonical UI source for Mac Phase 1 wrapping.
- `apps/desktop/` current Tauri scaffold (`tauri.conf.json`, `lib.rs`, `App.tsx`, `window_ext.rs`, capabilities) still encodes the legacy transparent-overlay product, and must be rewritten before any Phase 1 milestone can ship.
- 4 Phase-1 blockers exist (normal window, offline auth, external-runtime offline gates, build-packaging pipeline).
- Web parity itself is GO for use as wrap source; the blocker is desktop scaffold + offline launch policy.

ADR-0011 records the redefinition formally so that:

1. `dev` branch (machine A — desktop) starts Phase 1 against the right product target.
2. `web` branch (machine B — web) can continue WEB-B non-blockers without contract drift.
3. Legacy overlay artifacts (G0/G1 anchors, `plugin-{organizer, ...}`, transparent-overlay Tauri config) are explicitly demoted to P3 Future and not mis-consumed as P1 dependencies.

---

## S3 — Options Analyzed

### Option A — React+Tauri+Local-first hybrid, 3-phase delivery (CHOSEN)

Phase 1: Tauri wraps `apps/web` static dist, normal Mac window, basic native shell, offline UI launch.
Phase 2: System notifications + status bar + global hotkeys + local-data cache + auto-update + full macOS menu.
Phase 3: Local-first data layer with offline-capable surfaces (tasks, board, habits, pomodoro, notes, pet basic state, local settings) and explicit "needs network" surfaces (multi-device sync, account, cloud collab).

**Pros:**
- Matches the operator-confirmed product definition exactly.
- Reuses `apps/web` parity (12 SHIPPED modules + 9/9 gap-closure) — Phase 1 deliverable target of 1–2 weeks is realistic.
- Clean three-phase delivery line, each phase has a verifiable exit gate.
- Honours `.dmg` shippability without first solving local-first data architecture (Phase 3 gets its own ADR).

**Cons:**
- Invalidates parts of ADR-0010 §S4 D1/D2 within 1 day of its Acceptance.
- The `apps/desktop/` scaffold must be rewritten (transparent → normal window, overlay setup → standard app shell).
- Short-term cross-surface coupling: `dev` (desktop) reuses `plugin-web-*` namespace until Phase 3 introduces a shared layer.

### Option B — Keep ADR-0010 P1 (overlay shell) + add a separate "Mac wrap" P1.5 surface

Treat the new hybrid app as a parallel P1.5 product alongside the existing overlay P1.

**Pros:** No supersession of ADR-0010 needed; legacy overlay can continue.
**Cons:**
- Two active P1 surfaces compete for the same engineering bandwidth on the same monorepo.
- Operator's PIVOT is explicit that the new product replaces, not augments, the overlay vision.
- Doubles the documentation surface (PLUGIN_MAP, CLAUDE.md, both roadmaps stay live).

### Option C — Full rewrite to native (no React, no Tauri reuse of web)

Build a native Mac app from scratch, separate from `apps/web`.

**Pros:** Maximum native fidelity long-term.
**Cons:**
- Throws away the entire 24/24 + 9/9 web SHIPPED investment.
- Phase 1 timeline blows out from 1–2 weeks to months.
- Operator-PIVOT explicitly excludes this: "不是全原生重写".

**Decision: A.** Matches operator PIVOT; uses Web parity as Phase 1 foundation; supersedes the conflicting overlay portions of ADR-0010 without invalidating its operational cross-cut rules (D3/D4).

---

## S4 — Decisions

### D1 — P1 Desktop is now a 3-phase React+Tauri+Local-first hybrid app

Architecture: **React Web UI (from `apps/web` dist) + Tauri native capabilities + local-first data layer**. Normal Mac window — not a transparent click-through overlay.

| Phase | Goal | Exit gate |
|---|---|---|
| **Phase 1 — Quick desktopisation** (target: shippable Mac app, 1–2 weeks) | Tauri wraps `apps/web` React static assets. Dock icon, normal native window, `.dmg` installer, basic macOS app menu, app config archive, local cache, login-state persistence. UI must launch offline (no network needed for `/app` entry). | A `.dmg` (or local Tauri build) launches the full Web shell from bundled static assets, enters `/app` without network, and shows clear offline degradation for online-only panels. |
| **Phase 2 — Desktop experience polish** (target: "not a web wrapper feel", weeks) | System notifications (tasks reminders, pomodoro end, schedule). Status-bar icon (quick app open, start pomodoro, view today's tasks). Global hotkey (summon app). Local cache of last-session data (open offline showing prior state). Auto-update path. Full File/Edit/View/Window/Help macOS menu. | Phase-2 native slice gated by a fresh ADR (will be drafted at Phase 2 entry). |
| **Phase 3 — Local-first / offline-capable data** (largest, own ADR) | Offline-capable surfaces: tasks, board, habits, pomodoro, notes, pet basic state, local settings. Degradable: AI agent (show "needs network" or accept local LLM config), third-party calendar sync, online analytics. Network-required: multi-device sync, account system, cloud collaboration. Local-first sync pattern: edit offline → sync when online. | Phase 3 architecture (storage, sync log, conflict strategy) gated by a fresh ADR — see `desktop-local-first-storage-adr` row in patch roadmap. |

### D2 — Supersession scope

This ADR **supersedes**:

- **ADR-0010 §S4 D1** P1 row ("macOS Desktop client (Tauri overlay shell)"). New P1 definition is D1 of this ADR.
- **ADR-0010 §S4 D2** entries for `xai-g0-window-spike.md` (Unfreeze — primary P1 entry) and `xai-g1-native-foundation.md` (Unfreeze, gated on G0 SHIPPED). Both legacy roadmaps are now SUPERSEDED-BY-ADR-0011; their G0.1–G0.6 / G1.1–G1.6 anchors stay in their `Shipped` PLUGIN_MAP rows as historical evidence but are no longer the active P1 work surface.
- **CLAUDE.md §Current Priority P1 row** describing "Tauri overlay shell" + G0/G1 active work surface.
- **PLUGIN_MAP.md §Current Priority P1 row** + `Roadmap / CI Gate Anchors` heading line "G0/G1 ACTIVE" (anchors stay Shipped; ACTIVE description retracted).
- **`docs/workflow/roadmap/xai-g1-native-foundation.md` top banner** ("RESUMED ... primary P1 active work surface"). A SUPERSEDED banner is added in this ADR's implementation commit.

This ADR **does NOT supersede**:

- ADR-0010 §S4 D3 (SYSTEM_ARCHITECTURE.md §3–§12 enforcement on P1 work) — still active for the new Phase 1 desktop work.
- ADR-0010 §S4 D4 (operational cross-cut rules for P1/P0 split, bugfix workflow, PLUGIN_MAP discipline) — still active.
- ADR-0010 §S4 D5 (G2 evidence acceptance protocol). The web P0 carve-outs remain owned by ADR-0010 / ADR-0008 §S3.
- ADR-0007 (web build form) — `apps/web` is now also the canonical Phase 1 UI source for desktop.
- ADR-0008 §S3 (CSP / 24h-evidence) — `apps/web` CSP/connect-src governance unchanged.
- ADR-0009 (web→desktop pivot history) — referenced as background.

### D3 — Legacy artifacts demoted to P3 Future

The following are removed from P1 scope and re-tagged **P3 Future** (re-evaluated only after Phase 3 local-first SHIPPED):

- Transparent overlay shell + click-through main window. Code evidence:
  - `apps/desktop/src-tauri/tauri.conf.json:22-31` (transparent / decorations false / shadow false / skipTaskbar / hiddenTitle / Overlay titleBarStyle).
  - `apps/desktop/src/App.tsx:17-30` (pointer-events none + OrganizerLayer mount).
  - `apps/desktop/src-tauri/src/lib.rs:135-187` (overlay setup + control window startup).
  - `apps/desktop/src-tauri/src/platform/macos/window_ext.rs:32-50` (all-spaces / ignore-cursor-events extension).
- Per-grid native windows + Smart Container file-organizer product concept.
- Plugins: `plugin-organizer`, `plugin-clipboard`, `plugin-widgets`, `plugin-meditation`, `plugin-pet` (legacy desktop-overlay versions).
- Roadmap anchors (codebase artifacts stay; descriptions reframed):
  - `xai-g0-window-spike.md` G0.1–G0.6 (window-ground-truth / grid-window-prototype / click-through-matrix / finder-dnd-path / spaces-multimonitor-matrix / mas-sandbox-dry-run) — Shipped/Blocked PLUGIN_MAP rows retained as evidence; active-work narrative retracted.
  - `xai-g1-native-foundation.md` G1.1–G1.6 (window-command-contract / grid-shell-organizer-content / native-dnd-path-first / multi-grid-event-scope / grid-persistence / host-business-residuals) — same treatment.

The legacy artifact code under `apps/desktop/src-tauri/` and `packages/plugin-{organizer, ...}/` is **NOT** deleted in this ADR. Deletion or refactor is scoped per Phase 1 patch features (`desktop-tauri-web-dist-normal-window`, `desktop-basic-macos-menu-config-store`) and Phase 3 plugin re-evaluation.

### D4 — Legacy P1 7-plugin disposition

ADR-0010 listed 7 plugins as part of P1 scope. Under ADR-0011 each is re-evaluated against the new Phase 1/2/3 product line:

| Plugin | New disposition | Reason |
|---|---|---|
| `plugin-account` | **Keep, redefined** | Phase 1 needs login-state persistence + local session only; multi-device sync + cloud-account collaboration → Phase 3. Crypto stack work under `sync-v1` remains P3-scoped (was already P2 paused per ADR-0010). |
| `plugin-console` | **Merge / demote** | Phase 1 uses `apps/web` shell as the UI. No need for a separate desktop console package as the core UI. Any console-specific desktop affordances fold into the Phase 2 native shell. |
| `plugin-productivity` | **Keep concept, reuse Web** | tasks/habits/pomodoro already SHIPPED on Web (`plugin-web-tasks`, `plugin-web-habits`, `plugin-web-pomodoro`). Desktop reuses these in Phase 1. Phase 3 local-first repository binds these surfaces to a desktop store. |
| `plugin-ai-cube` | **Demote / merge** | New P1 uses Web AI Chat (`plugin-web-ai-chat`) with offline degradation. The legacy native AI Cube control window is not part of Phase 1 / 2. Revisit at Phase 3 if a native AI surface becomes valuable. |
| `plugin-calendar` | **Keep, reuse Web** | Phase 1 reuses `plugin-web-calendar`. Notifications → Phase 2. Third-party sync → Phase 3 (degradable). |
| `plugin-labels` | **Merge** | Labels collapse into tasks/board/project data models. No standalone Phase 1 desktop plugin. |
| `plugin-project` | **Keep concept, reuse Web** | Project/workspace surface comes from `plugin-web-board-workspaces` + `plugin-web-board-core` / `plugin-web-board-views` in Phase 1. Local-first repository abstraction is Phase 3. |

The 5 legacy organizer/clipboard/widgets/meditation/pet desktop plugins are **NOT** in this 7-plugin table because they were ADR-0010 §D1 P2-tier, not P1. Their P2 → P3 Future demotion is recorded in D3 above.

### D5 — Phase 3 local-first storage pre-selection (advisory)

Phase 3 will have its own ADR. As an advisory pre-selection, Phase 3 candidates:

| Candidate | Strengths | Weaknesses |
|---|---|---|
| **SQLite via `tauri-plugin-sql` / Rust layer** | Durable, queryable, suitable for sync logs and conflict handling, mature migration story, observability. | Schema/migration/repository layer investment; needs a Rust-side adapter. |
| IndexedDB | Continues to serve pure Web; lowest migration cost. | Weaker for desktop backup, cross-process control, queries, observability. |
| Local JSON files | Fastest to implement; good for config / export. | Concurrency, indexing, migration, conflict merge all weak — not main data source. |

**Advisory recommendation (Phase 3 ADR will confirm):** Use SQLite as the desktop primary store; keep IndexedDB / localStorage for the Web browser fallback path; provide a one-time import/migration bridge between the two on first desktop launch.

This is **not** a binding decision in ADR-0011 — Phase 3 ADR will lock storage selection, sync log format, conflict policy, and account-boundary integration after Phase 1 / 2 evidence is collected.

---

## S5 — Consequences

### Positive

- `dev` branch can start Phase 1 immediately with a correct product target.
- `web` branch (machine B) keeps its existing role unchanged (`apps/web` + `plugin-web-*` SHIPPED maintenance + WEB-B non-blockers).
- 24/24 + 9/9 Web SHIPPED investment is reused as the Phase 1 UI source — no rewrite.
- Three-phase delivery line gives operator + future-AI a clear roadmap, each phase with a verifiable exit gate.
- Legacy overlay work-in-progress (G0/G1 PLUGIN_MAP Shipped rows) becomes historical evidence rather than active-work debt.

### Negative

- ADR-0010 (Accepted 2026-05-26) is supersded in parts by this ADR within 1 day. Anyone reading ADR-0010 must also read ADR-0011 to understand the active P1.
- `apps/desktop/` scaffold (transparent overlay) is now mismatched with the new P1 product. Phase 1 first feature (`desktop-tauri-web-dist-normal-window`) carries the cleanup.
- Short-term cross-surface coupling: `dev` reuses `plugin-web-*` directly until Phase 3 introduces a shared layer or local-first repository. This is an intentional tradeoff documented in Codex audit Part 3a.
- Legacy `plugin-{organizer, clipboard, widgets, meditation, pet}` source remains in `packages/` until Phase 3 cleanup decides per-plugin fate. Until then, PLUGIN_MAP must clearly mark them as P3 Future (deferred), not P2 active.
- The `xai-g0-window-spike.md` / `xai-g1-native-foundation.md` roadmaps need superseded banners (this ADR's commit applies them). Workflow V2 must not dispatch new work against G0/G1 features.

### Neutral

- ADR-0010 §D3 (SYSTEM_ARCHITECTURE.md enforcement) + §D4 (operational rules) + §D5 (G2 evidence protocol for the web carve-out) survive intact.
- Web Console P0 maintenance-only status is unchanged. Web bug-fix workflow continues without ADR citation.
- `apps/web` CSP / connect-src / external-provider governance unchanged.

---

## S6 — Implementation notes (this ADR's commit set)

This ADR is committed alongside the following same-commit documentation updates so the project's source-of-truth files reflect ADR-0011 from the moment it is Accepted:

1. **`docs/adr/0011-p1-react-tauri-local-first-hybrid.md`** — this file (new).
2. **`docs/adr/0010-p1-desktop-resume-plan.md`** — Header S1 + Acceptance Note appended with a "Superseded-in-part by ADR-0011 (2026-05-26)" notice; §D1 + §D2 affected rows marked Superseded.
3. **`CLAUDE.md`** — §Current Priority P1 row replaced with Phase 1/2/3 hybrid description + ADR-0011 authority citation.
4. **`docs/PLUGIN_MAP.md`** — §Current Priority P1 row + §Roadmap/CI Gate Anchors banner replaced; legacy desktop plugins re-tagged P3 Future under §Plugins.
5. **`docs/workflow/roadmap/xai-g1-native-foundation.md`** — top banner changed from RESUMED → SUPERSEDED-BY-ADR-0011 with anchor evidence retained as historical.
6. (Same commit set) Codex audit artifacts already staged:
   - `docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`
   - `docs/audit/2026-05-26-patch-roadmap-source.md`

Files **NOT** modified in this commit (deliberately scoped out, to keep the ADR change minimal and reversible):

- `docs/workflow/roadmap/xai-g0-window-spike.md` — left unchanged; ADR-0011 §D3 carries the demotion narrative. A separate doc-housekeeping commit may add a SUPERSEDED banner if needed.
- `docs/SYSTEM_ARCHITECTURE.md` §5 (multi-window) / §6 (cross-window) descriptions — left as documentation of the *legacy overlay* multi-window pattern; Phase 1 normal-window introduces a new shell but the existing constitution language is still factually accurate as historical reference. The Phase 1 feature `desktop-tauri-web-dist-normal-window` is the right place to introduce updated constitution language if it diverges materially.
- Code under `apps/desktop/src-tauri/` and `packages/plugin-{organizer,clipboard,widgets,meditation,pet}/` — code rewrite/deletion is scoped to per-feature `feature-build` runs, not this ADR.

---

## S7 — Acceptance / Review

**Acceptance basis:** Operator explicitly confirmed the P1 three-phase PIVOT during the 2026-05-26 `/workflow-router` exchange that produced the Codex audit and this ADR. The Codex audit itself was operator-staged (`git add` but not commit) and serves as the evidence base for this ADR's decisions.

**Cross-vendor review:** Optional Codex cold-read of this ADR per ADR-0008 §S3 D3 binding-precedent pattern. Recommended but not blocking. Queue as a Category 5 operator item if formal sign-off is wanted before the first Phase 1 commit lands.

**Reversal protocol:** If Phase 1 execution surfaces evidence that the Tauri-wrap approach is unworkable (e.g., a hard offline-launch blocker that cannot be closed without rewriting Web auth), the project owner may:

1. Pause `dev` Phase 1 work.
2. Author ADR-0012 reverting ADR-0011 D1 (or replacing it with a different architecture).
3. Cite the specific Phase 1 blocker that triggered reversal.

Until then, ADR-0011 is the authoritative P1 surface definition for the project.

---

## Acceptance Note

**Accepted 2026-05-26 — operator-confirmed PIVOT.**

This ADR was drafted at operator request after a `/workflow-router`-triggered web-completeness audit confirmed that:

- `apps/web/` parity is sufficient to serve as the Phase 1 UI source.
- `apps/desktop/` legacy scaffold needs rewrite per ADR-0011 §D1 Phase 1 exit gate.
- The operator's PIVOT to "React Web UI + Tauri native + local-first hybrid app" is incompatible with ADR-0010's overlay-based P1 definition.

The Codex audit (`docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`) gave a **CONDITIONAL_GO** with 4 Phase-1 blockers; this ADR confirms the new product direction and the patch roadmap (`docs/audit/2026-05-26-patch-roadmap-source.md`) carries the per-blocker feature decomposition.

**First Phase 1 wave (per Codex audit Part 4):**

1. `desktop-tauri-web-dist-normal-window` — convert `apps/desktop` to a normal Tauri app window loading `apps/web` dist.
2. `desktop-web-auth-offline-mode` — desktop session policy so `/app` opens offline.
3. `desktop-phase1-build-packaging-pipeline` — Tauri build wired to `apps/web` dist + `.dmg` artifact + offline smoke.
4. `web-external-runtime-offline-gates` — AI/OSM/OAuth/Stripe/Supabase RPC offline capability gates.

Exit gate for wave 1: a `.dmg` or local Tauri build launches the full Web shell from bundled static assets, enters `/app` without network, shows clear offline degradation for online-only panels.

**Branch map (operator-confirmed 2026-05-26):**

- Machine A — `dev` — desktop Phase 1 (this ADR's primary consumer).
- Machine B — `web` — Web optimisation + WEB-B non-blockers in parallel.

**Status:** ADR-0011 is **Accepted** from this commit forward; the same commit set updates ADR-0010 / CLAUDE.md / PLUGIN_MAP / xai-g1-native-foundation banners so a fresh clone on either machine reads the new P1 definition consistently.
