# desktop-tauri-web-dist-normal-window — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | desktop-tauri-web-dist-normal-window |
| Title | 桌面打包产物与 dev 分支 apps/web 浏览器版不一致（多出 Organizer / Boards 空状态） |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | ship (claude-sonnet-4-6) |
| Updated | 2026-05-30 09:00 PDT |
| Prior Feature State | FEATURE_DEV / SHIPPED (ship Codex, 2026-05-27 10:29 PDT) — see history below |
| Risks | Full authenticated/offline `/app` entry remains deferred to `desktop-web-auth-offline-mode`; optional font/map tile network degradation remains deferred to `web-external-runtime-offline-gates`; default DMG packaging remains deferred to `desktop-phase1-build-packaging-pipeline`; reusable legacy overlay/control/grid implementation must stay quarantined for P3+ reuse rather than deleted. |

## Phase Plan

### Phase 1 — Repoint Tauri to `apps/web`

Status: DONE (2026-05-27, commit `afb8295`).

- Switch Tauri dev/build ownership from the legacy desktop Vite app to `apps/web`.
- Update desktop package scripts so Tauri is a host wrapper, not the primary frontend bundle owner.
- Reduce `apps/desktop/src/App.tsx` to a minimal fallback that cannot restart organizer overlay behavior.

### Phase 2 — Remove Overlay Startup

Status: DONE (2026-05-27, commit `94df0ef`).

- Stop overlay-specific `main` window configuration in `lib.rs`.
- Stop control/grid startup and related monitor-filling assumptions.
- Reduce `window_ext.rs` to a normal-window macOS seam.

### Phase 3 — Narrow the Native Surface

Status: DONE (2026-05-27, commit `3a65d62`).

- Remove or unregister legacy window lifecycle commands from the active Phase 1 invoke surface.
- Narrow capability files to the minimum Phase 1 main-window scope.
- Validate that startup launches only one normal window and bundled static assets still boot offline.

## Review Notes

**Verdict: APPROVED** — 0 blockers, 3 recommendations (non-blocking).

### Strengths

- **Scope discipline.** Plan correctly carves out the other 3 Phase 1 blockers as deferred follow-ons (`design.md:24-27`, `feature-brief.md:37`). Does not contradict ADR-0011 §S6 legacy-retention discipline.
- **Authority alignment.** Frozen Assumptions cite ADR-0011 §D1 + audit `2026-05-26-web-completeness-and-p1-redefinition.md` §2.4 + patch-roadmap row 1.
- **Discovery quality.** 3 candidate options (A: repoint; B: port; C: iframe) are properly compared in `discovery-review.md:24-67`. Option A is justified against the operator-confirmed PIVOT and ADR-0011 §D1.
- **Contract completeness.** `api.md` covers (a) `apps/web` build inputs, (b) Tauri main window state target (all 6 transparent-overlay fields in `tauri.conf.json:22-31` plus `frontendDist`), (c) Rust startup contract (`lib.rs:135-200` `configure_main_overlay` + control + monitor-fill must go), (d) macOS adapter contract (`window_ext.rs:32-50` overlay helpers neutralized), (e) command-surface narrowing for `grid_*`/`console`/`control` lifecycle, (f) capability scope narrowing.
- **Phase plan reviewability.** 3 phases (Dist Handoff → Normal Window Startup → Surface Narrowing) each have clear file boundaries, are independently committable, and map cleanly to feature-build's one-phase-per-run rule.
- **Documentation contract compliance.** All four docs (design/api/test/dev_log) exist with Decision Snapshot fields, Frozen Assumptions, Status Panel, Phase Plan, Work Log. dev_log has `Automation Mode = D-Codex` + `Verify Cross-vendor = yes` per portable V2 Phase 0 contract.
- **Legacy retention discipline.** Plan correctly says "unregister / reduce to fallback" not "delete" (e.g. `discovery-review.md:92-94`), aligning with ADR-0011 §S6 ("legacy code under `apps/desktop/src-tauri/` is NOT deleted in this ADR").
- **Test strategy carves Phase 1 exit gate.** `test.md:41-51` explicitly distinguishes acceptable Phase 1 outcomes (static shell, login gate, OR full `/app`) from the next feature's responsibility — a missing bundle is unacceptable here, but a login gate is.

### Non-blocking recommendations for feature-build

1. **`apps/desktop/src/main.tsx` is not in `feature-brief.md:25-31` scope but currently registers 5 plugins (`registerAccountPlugin`, `registerAiCubePlugin`, `registerProductivityPlugin`, `registerLabelsPlugin`, `registerConsolePlugin`) and routes to `GridWindow`/`ControlWindow`/`ConsoleWindow`.** Once Tauri repoints to `apps/web`, `apps/desktop/src/main.tsx` is no longer the active entry, so this is implicit — but the build phase should explicitly document whether `main.tsx` is reduced (matching `App.tsx` reduction in Phase 1) or left dormant as desktop-frontend fallback. Recommend: reduce both in the same Phase 1 commit for consistency.
2. **`commands::menubar::install_sync_menubar` at `lib.rs:140` is called unconditionally during setup.** Phase 2 of the plan ("Remove Overlay Startup") says "Stop overlay-specific `main` window configuration" but does not explicitly list the menubar tray install. Per `audit/2026-05-26-web-completeness-and-p1-redefinition.md:163-164`, Phase 1 does not require a full macOS app menu, but the existing sync tray is acceptable to leave intact. Recommend: build phase decides explicitly (keep inert vs remove startup call) and documents in the Phase 2 commit body. Phase 2 status-bar scope creep is the risk to avoid.
3. **`PLUGIN_MAP.md` §Roadmap/CI Gate Anchors row for this feature is not yet present.** Per ADR-0011 §S6 and the precedent set by G0/G1 rows (`window-ground-truth`, `grid-window-prototype`, …), this feature qualifies as a "roadmap workflow anchor" (not a plugin — no `manifest.json` required). Per SOP_NEW_FEATURE §Phase 8 step 3, the PLUGIN_MAP row update happens at ship-time, not plan-time, so this is OK to defer — but feature-build / ship should add a row (suggested status: `Active` during build → `Shipped` after merge) to keep audit traceability.

### Risks (already captured in Status Panel)

- Auth/offline `/app` entry is intentionally deferred to `desktop-web-auth-offline-mode`. Verified.
- Capability narrowing must not leave hidden legacy callers. Verified — `discovery-review.md:87,93` flags this for build phase confirmation.
- Tray/status startup removal decision must stay Phase 1 only and not drift into Phase 2 scope. Verified — recommendation #2 above.

### Authority cross-check verified

- `tauri.conf.json:22-31` — all 6 overlay flags identified by the plan are present in actual code.
- `tauri.conf.json:10` — `frontendDist: "../dist"` confirmed; plan correctly targets repointing to `apps/web/dist`.
- `lib.rs:135-198` — `configure_main_window` (renamed from `configure_main_overlay` in code) + monitor-fill resize + control window startup all present; plan covers all.
- `window_ext.rs:32-75` — `configure_main_window` + `configure_control_window` + `configure_grid_window` overlay-specific behaviors confirmed; plan covers neutralization.
- `App.tsx:1-30` — `OrganizerLayer` + `GridSystemProvider` + `pointerEvents: "none"` confirmed; plan covers reduction to non-overlay fallback.
- `apps/desktop/src-tauri/capabilities/default.json:4-5` — `["main", "control", "console", "grid_*"]` confirmed; plan covers narrowing to `main` only.
- `apps/web/package.json:6-9` — `dev` + `build` scripts confirmed available for Tauri to consume.

## BUGFIX — desktop/web UI divergence (2026-05-30, bug-diagnose)

### Bug context
- Title: 桌面打包产物与 dev 分支 apps/web 浏览器版不一致
- Feature/module: desktop-tauri-web-dist-normal-window（构建配置层；现象表现在共享 web 代码）
- Scenario: 把打包出的 macOS App UI 与 dev 分支 `apps/web` 浏览器版（web-live profile）逐项对比
- Severity: P2（呈现/数据一致性，非崩溃；影响 Phase-1「与 web 一致」验收基线）

### Reproduction protocol
- Env:
  - 桌面构建：`apps/desktop/src-tauri/tauri.conf.json` 的 `beforeBuildCommand`/`beforeDevCommand` 注入
    `VITE_WEB_AUTH_MODE=mock-authenticated VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`，
    `frontendDist: ../../web/dist`。
  - 浏览器基线：dev 分支 `apps/web` 默认构建（无 `VITE_WEB_RUNTIME_PROFILE` → 回落 `web-live`）。
- Steps / Actual:
  1. 桌面 App → 侧边栏多出「整理」(Organizer)；进入 Boards 显示
     “暂无离线看板缓存数据 / No offline board cache is available yet”。
  2. 浏览器版 web → 无「整理」；Boards 显示默认看板。
- Expected: 桌面与 dev 分支 web-live 逐像素一致（无 Organizer、Boards 有默认看板）。
- 已确认：`apps/web/dist` 为 2026-05-29 新构建，非陈旧；现象 = 当前源码在 offline profile 下的设计行为。

### Impact analysis（boundary + 全仓 offline-profile 引用盘点，去重）
桌面端无独立业务 UI；差异 100% 来自构建期注入的 `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`，
由 `packages/core/src/utils/runtime-profile.ts`（core 基础设施边界，零业务逻辑）读取。受门控行为：
1. Organizer 可见性 — `apps/web/src/App.tsx:122-129`（offline 显示；web-live 过滤 `organizer`）。
2. Boards 数据源 — `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx:139-203`
   （offline 只读 `xai_boards_v2` 缓存、无缓存即空 + 跳过默认播种；web-live 走 `loadBoardsOrDefault`→`makeDefaultBoards()`）。
3. Tasks 离线空状态 — `packages/xai-web-tasks/src/TasksModule.tsx:54-58`。
4. Habits 离线空状态 — `packages/xai-web-habits/src/HabitsModule.tsx:39-43`。
5. Last-data-cache badge — `packages/desktop-last-data-cache-polish/src/web.tsx:45-48`（仅 offline 渲染；Topbar premiumBadge，`App.tsx:153`）。
6. AI provider policy/secret/stream — `packages/plugin-web-ai-chat/src/internal/*`（offline 本地降级；web-live 在线 provider）。
7. Settings online-only 面板 — `packages/plugin-web-settings-rest/*`（integrations / premium / aiPane / delete-account 编排；offline fail-closed）。
8. OAuth callback / checkout success+cancel fail-closed — `apps/web/src/routes/router.integration.test.tsx` 的 RR1 / RR-PREMIUM-1/2。
9. Landing 根路由跳转 — `apps/web/src/pages/LandingPage.tsx:12-14`（offline 下 `/`→`<Navigate to="/app">`；web-live 渲染落地占位页）。
10. AppProviders 桌面 runtime 桥 + transport 抑制 — `apps/web/src/providers/AppProviders.tsx:294-363`（offline 挂 `__XAI_DESKTOP_*__`、抑制 RPC transport）。

结论：路线 A（去掉 offline profile → 回落 web-live）会让上述 10 项全部回到 web-live 行为。
其中 #1/#2 正是要修目标；#3-#10 为顺带变化，且方向（= web-live 真实行为）与「对齐 web」基准一致。

### Root cause
- 类别：**配置 / Profile 设计取舍**（非代码缺陷）。桌面刻意启用 `desktop-phase1-offline`，该 profile 在共享 web 代码里
  按设计写入了整套「离线降级」分支。验收基线改为「桌面 = web-live 逐像素一致」后，这些按设计写入的分支即变成「与基线不符」。

### Fix rationale（路线 A — 最小改动面）
- 仅改构建配置：从 `apps/desktop/src-tauri/tauri.conf.json` 的 `beforeBuildCommand` + `beforeDevCommand`
  去掉 `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`（`resolveWebRuntimeProfile` 缺省回落 `web-live`）。
  不改任何共享 web/core 代码，离线分支与其测试全部保留备用。

#### 三项评估结论（按 bug 报告要求）
1. 其它被一并改变的 offline 行为：见 Impact #3-#10，均回落 web-live，方向与「对齐 web」一致，符合预期；无需逐个抵消。
2. **`VITE_WEB_AUTH_MODE=mock-authenticated` 必须保留。**
   - 依据：`apps/web/src/routes/router.tsx` + `RouteGateElements.tsx` — `/app/*` 受 `AppRouteGate` 保护，
     需要已认证 session；`AppProviders.tsx:88-92,297` 中 auth-mode 与 runtime-profile 是**正交**两个变量。
   - 若同时去掉 mock-authenticated：无网桌面回落 web-live 真实鉴权 → 无 session → `AppRouteGate` 把 `/app` 重定向到 `/auth/login`，
     **卡在登录页进不去**，破坏 Phase-1「无网进入」基本可用性。`desktop-web-auth-offline-mode` 已 SHIPPED 该契约，其 Risk 明确警告
     “env injection must remain canonical or launches silently fall back to live auth and redirect to /auth/login”。
   - 路线 A 正确形态：**只删 RUNTIME_PROFILE，保留 AUTH_MODE=mock-authenticated**。
   - 副作用提示 a：保留 mock-authenticated 但删 RUNTIME_PROFILE 后，`LandingPage` 的 offline→`/app` 自动跳转会消失
     （LandingPage 只看 runtime-profile）。桌面冷启动落 `/` 会看到 web-live 落地占位页“XAI Web Host”，需手动进 `/app`。
     若要求「启动即进 /app」，bug-fix 可让 LandingPage 在 mock-auth 时也跳转，或把桌面窗口初始 URL 指向 `/app`（衍生 sub-fix，建议 auto-fix 覆盖）。
   - 副作用提示 b：保留 mock-authenticated 时 `AppProviders` 仍构造 mockClient（authMode≠live），transport 恒为 null，无网不发起 RPC —— 无网可用性不受影响。
3. 受影响测试：源码不动 → 现有断言 offline 行为的测试**全部不受影响**（均用 `runtimeProfileOverride` / `vi.stubEnv` 显式注入 offline，
   不读 `tauri.conf.json`）：`router.integration.test.tsx`(RR1/RR-PREMIUM-1/2)、`AppProviders.test.tsx`、
   `BoardWorkspacesModule.test.tsx`、`xai-web-tasks/desktopOfflineCache.test.tsx`、`xai-web-habits/HabitsModule.desktopOffline.test.tsx`、
   `desktop-last-data-cache-polish/web.test.tsx`、`plugin-web-ai-chat/__tests__/*`、`plugin-web-settings-rest/__tests__/*`。
   结论：路线 A 只改 `tauri.conf.json`，无单测直接断言该文件 → 预期零测试破坏。建议 bug-fix 补一条轻量配置断言：
   `beforeBuildCommand` 不含 `desktop-phase1-offline` 且仍含 `mock-authenticated`。

### Suggested fix scope（for bug-fix）
- Core fix（必做）：`tauri.conf.json` 的 `beforeBuildCommand` + `beforeDevCommand` 去掉 `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`，
  保留 `VITE_WEB_AUTH_MODE=mock-authenticated`；重新 `pnpm --filter @repo/web build` 产出新 `apps/web/dist`。
- Derived（可选 sub-fix）：处理桌面冷启动落地页 → 让 mock-auth 也自动进入 `/app`（LandingPage 或窗口初始 URL）。
- Regression（建议）：新增配置断言（见上）。
- 红线：不动 `packages/core` runtime-profile、不动共享 web 业务代码；离线 profile 与其测试全部保留。

## Previous Verification Summary

- Verdict at 2026-05-27 10:14 PDT: PASS before the later overlay-preservation constraint was added.
- Superseded state: the 2026-05-27 10:19 PDT preservation change introduced new code/docs, so this feature is back in `READY_FOR_VERIFY` until the next verify pass.
- Commits reviewed: `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff`, `e4a1b05`, `795e065`.
- Independent checks re-run by verify: `pnpm --filter @repo/web build` PASS; `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS (47/47); `pnpm --filter desktop tauri build --debug --bundles app` PASS.
- Artifact/doc cross-check: `apps/web/dist` contains the expected static payload, `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app` exists, feature docs/review artifacts are tracked in git, and `20260527-offline-launch-smoke.md` matches the accepted app-bundle/offline-static scope.
- Status Panel consistency at that time: before that verify pass, the tree correctly advertised `FEATURE_VERIFY / READY_FOR_VERIFY / feature-verify`; after successful verification it advanced to `FEATURE_VERIFY / READY_TO_SHIP / ship`.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-27 00:58 PDT | feature-plan (gpt-5.3-codex) | Fresh plan: created Step 0 brief, discovery review, and docs quartet for the Phase 1 normal-window `apps/web` dist handoff. | — | feature-review |
| 2026-05-27 01:42 PDT | feature-review (claude-opus-4-7) | APPROVED — 0 blockers, 3 non-blocking recommendations recorded. Cross-checked all 6 transparent-overlay fields in tauri.conf.json:22-31, lib.rs:135-198, window_ext.rs:32-75, App.tsx:1-30, default.json:4-5 against plan scope. Scope discipline holds; ADR-0011 §S6 legacy-retention respected. Phase plan is reviewable with clear file boundaries per phase. | — | feature-build |
| 2026-05-27 02:11 PDT | feature-build (gpt-5.3-codex) | Phase 1 implemented: repointed Tauri build/dev contract to `apps/web` (`beforeDevCommand`, `devUrl`, `beforeBuildCommand`, `frontendDist`), changed `apps/desktop` scripts to web-wrapper role, and replaced legacy overlay `App.tsx` with an explicit non-overlay fallback view. Validation run: `pnpm --filter @repo/web build` failed on unresolved `@repo/xai-web-cmdk`; `pnpm --filter desktop exec tsc --noEmit` failed on existing unused-symbol TS errors; `pnpm --filter desktop tauri build --debug` failed at the same web build step. | `afb8295` | feature-build |
| 2026-05-27 02:17 PDT | feature-build (gpt-5.3-codex) | Phase 2 implemented: removed overlay-era startup assumptions from Rust/macOS path by deleting control-window auto-start and monitor-fill logic in `lib.rs`, applying normal-window runtime chrome defaults, and replacing macOS desktop-level/click-through window configuration with standard-window behavior in `window_ext.rs`. Validation run: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passed (47 tests); `pnpm --filter @repo/web build` still fails on unresolved `@repo/xai-web-cmdk`; `pnpm --filter desktop tauri build --debug` fails at the same known web build blocker. | `94df0ef` | feature-build |
| 2026-05-27 02:23 PDT | feature-build (gpt-5.3-codex) | Phase 3 implemented: removed legacy grid/console window lifecycle commands from active `invoke_handler`, dropped legacy grid/console runtime state wiring from startup, and narrowed capability JSON window scopes to Phase 1 `main` only (`default`, `plugin-account-crypto`, `plugin-account-keychain`, `plugin-data-database`) with matching `capabilities/AUDIT.md` updates. Validation run: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passed (47 tests); `pnpm --filter @repo/web build` still fails on unresolved `@repo/xai-web-cmdk`; `pnpm --filter desktop tauri build --debug` fails at the same web build blocker before bundled/offline launch smoke can proceed. | `3a65d62`, `997aee3` | feature-verify |
| 2026-05-27 02:27 PDT | feature-verify (Codex gpt-5.4 inline) | Verification BLOCKED after reviewing commits `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, and `643d0ff` against the approved brief/discovery/design/api/test/dev_log artifacts and current tree. Commit bodies follow the repo convention and phase boundaries are clean, `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passes (47/47), but ship readiness fails on three hard gates: `pnpm --filter @repo/web build` still fails on unresolved `@repo/xai-web-cmdk`, `pnpm --filter desktop tauri build --debug` fails at the same `beforeBuildCommand` step so bundled/offline launch cannot be verified, `apps/desktop/src-tauri/tauri.conf.json` still advertises overlay-era main-window flags (`resizable: false`, `transparent: true`, `decorations: false`, `skipTaskbar: true`, `hiddenTitle: true`, `titleBarStyle: "Overlay"`) instead of the approved normal-window contract, and required feature docs (`docs/reviews/...`, `design.md`, `api.md`, `test.md`) are present on disk but not tracked in git. | `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff` | feature-build |
| 2026-05-27 09:37 PDT | feature-auto-build (Codex gpt-5.4 inline fix) | Fixed the three verify blockers: restored workspace dependency links with `pnpm install --frozen-lockfile` so `@repo/xai-web-cmdk` resolves for `@repo/web`, changed `tauri.conf.json` main window flags to normal-window values (`resizable: true`, `transparent: false`, `decorations: true`, `shadow: true`, `skipTaskbar: false`, `hiddenTitle: false`, `titleBarStyle: "Visible"`, `dragDropEnabled: true`), and staged required workflow docs for git tracking. Validation run: `pnpm --filter @repo/web build` passed; `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passed (47 tests); `pnpm --filter desktop tauri build --debug --bundles app` passed and produced `target/debug/bundle/macos/X Desktop.app`. Full default `pnpm --filter desktop tauri build --debug` now gets past web build/app bundling but still fails in DMG bundling, which is deferred to `desktop-phase1-build-packaging-pipeline`. | `e4a1b05` | feature-verify |
| 2026-05-27 10:09 PDT | feature-auto-build (Codex gpt-5.4 inline fix) | Closed the second verify blocker set by aligning `test.md` with the app-bundle acceptance scope (`pnpm --filter desktop tauri build --debug --bundles app`) and documenting that default DMG packaging is deferred to `desktop-phase1-build-packaging-pipeline`. Added `docs/reviews/desktop-tauri-web-dist-normal-window/20260527-offline-launch-smoke.md` with app-bundle/static-dist evidence, including the `feature-verify` launch observation of a standard `AI Smart Desktop` window on local `tauri://localhost` content and explicit external-origin degradation notes for fonts/map tiles. | `795e065` | feature-verify |
| 2026-05-27 10:06 PDT | feature-verify (Codex gpt-5.4 inline) | Verification BLOCKED after independently re-running the repaired checks on `e4a1b05`, reviewing commits `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff`, and `e4a1b05`, and launching the built `X Desktop.app`. `pnpm --filter @repo/web build` passes, `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passes (47/47), `pnpm --filter desktop tauri build --debug --bundles app` passes, and the bundled app opens as a single standard `AI Smart Desktop` window with rendered local `tauri://localhost` content. Ship readiness still fails because `packages/desktop-tauri-web-dist-normal-window/docs/test.md` continues to require full `pnpm --filter desktop tauri build --debug`, but that command still fails in DMG bundling while `design.md` and the prior dev_log entry defer DMG packaging to `desktop-phase1-build-packaging-pipeline`; offline/network-disabled launch evidence also remains unrecorded. | `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff`, `e4a1b05` | feature-build |
| 2026-05-27 10:14 PDT | feature-verify (Codex GPT-5 inline) | Verification PASS after independently reviewing all phase and repair commits against the approved brief/discovery/design/api/test/dev_log contract, rerunning the scoped acceptance checks, and reconciling the repaired docs/evidence set. Commit intent remains phase-clean, the Status Panel and tracked docs are now consistent, `@repo/web` build + Rust tests + Tauri app bundling all pass, and the offline/app-bundle acceptance scope is explicitly closed by the tracked smoke evidence. | `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff`, `e4a1b05`, `795e065` | ship |
| 2026-05-27 10:19 PDT | feature-auto-build (Codex gpt-5.4 inline fix) | Added the post-verify preservation constraint: Phase 1 removes overlay/control/grid from default launch and active capabilities but must not erase reusable future overlay assets. Quarantined reusable control-window bootstrap/state wiring in `apps/desktop/src-tauri/src/legacy_overlay.rs` and restored macOS desktop-level/click-through overlay helpers under `platform::macos::legacy_overlay`, leaving Phase 1 startup on normal-window helpers only. Updated design/api docs to make the preservation boundary explicit. | `5771b0a` | feature-verify |
| 2026-05-27 10:26 PDT | feature-verify (Codex GPT-5 inline) | Verification PASS after independently re-reading the feature brief/discovery/docs quartet, auditing all phase and repair commits (`afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff`, `e4a1b05`, `795e065`, `5771b0a`), and rerunning the scoped gates. Phase boundaries and commit bodies remain clean, `apps/web` build + Rust tests + Tauri app-bundle build all pass, the active launch path stays single-window/main-only, and the preservation repair keeps reusable overlay/control/grid assets quarantined under inactive `legacy_overlay` boundaries instead of reactivating or deleting them. | `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff`, `e4a1b05`, `795e065`, `5771b0a` | ship |
| 2026-05-27 10:29 PDT | ship (Codex, gpt-5.3-codex) | Ship gate passed: validated READY_TO_SHIP status panel, verified commit completeness against verify handoff and local history, pushed verified commit series to `origin/dev`, and marked workflow state as SHIPPED. | `afb8295`, `1121978`, `94df0ef`, `3839e40`, `3a65d62`, `997aee3`, `643d0ff`, `e4a1b05`, `795e065`, `5771b0a`, `84dd9df` | workflow complete |
| 2026-05-30 00:25 PDT | bug-diagnose (Claude Opus) | BUGFIX 诊断：复现确认（桌面多出 Organizer + Boards 空状态，基线 = dev 分支 apps/web web-live）。全仓盘点 `desktop-phase1-offline` 门控行为（去重 10 项）。根因 = profile 设计取舍而非代码缺陷。修复策略路线 A：仅改 `tauri.conf.json` 去掉 `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`、**保留 `VITE_WEB_AUTH_MODE=mock-authenticated`**（否则无网卡登录页）。评估：鉴权必须保留、源码不动→现有 offline 测试零破坏、副作用为 LandingPage 自动跳转消失（可选衍生 sub-fix）。Status → FIX_READY。 | — | bug-fix |
| 2026-05-30 00:45 PDT | bug-auto-fix (claude-sonnet-4-6) | **S1 核心修复**：从 `apps/desktop/src-tauri/tauri.conf.json` 的 `beforeBuildCommand` + `beforeDevCommand` 删除 `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`，保留 `VITE_WEB_AUTH_MODE=mock-authenticated`。`resolveWebRuntimeProfile` 缺省回落 `web-live`；Organizer 过滤恢复，Boards 走 `loadBoardsOrDefault` 显示默认看板。 | `2bf1f64d` | S2 |
| 2026-05-30 00:45 PDT | bug-auto-fix (claude-sonnet-4-6) | **S2 衍生修复**：更新 `apps/web/src/pages/LandingPage.tsx`，新增 `isMockAuthenticated(env)` 守卫（读 `VITE_WEB_AUTH_MODE`）。原有 offline profile 守卫不变；当 `mock-authenticated` 为真时同样 `<Navigate to="/app" replace />`，确保桌面冷启动直接进 `/app` 而非停在占位页。 | `f9470967` | S3 |
| 2026-05-30 00:45 PDT | bug-auto-fix (claude-sonnet-4-6) | **S3 回归测试**：新增 `apps/web/src/__tests__/tauri-conf-build-profile.test.ts`（TC-TAURI-CONF-1/2/3/4，断言 `tauri.conf.json` 不含 `desktop-phase1-offline`、仍含 `mock-authenticated`）；在 `router.integration.test.tsx` 补 RR-LANDING-MOCK-AUTH-1（`mock-authenticated` 无 offline profile 时 LandingPage 重定向到 `/app`）。全套 129/129 PASS。 | `8cbb0633` | S4 |
| 2026-05-30 00:45 PDT | bug-auto-fix (claude-sonnet-4-6) | **S4 重建 dist**：`VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build`（951 modules，4.03s）。产物中 `VITE_WEB_RUNTIME_PROFILE` 未注入→ runtime 回落 web-live，Organizer 不再出现。`sourcemaps-assert-clean` PASS，`browser-safety-assert-dist` PASS。dist 为 gitignore 产物，不提交。Status → FIX_READY_FOR_VERIFY，Suggested Next → bug-verify。 | — | bug-verify |

## BUGFIX Verification Summary (2026-05-30, bug-verify)

**Verdict: PASS → READY_TO_SHIP.** Independently verified route A fix against the
"desktop == dev-branch apps/web web-live" baseline. No new fixes implemented.

### Commits reviewed
- `2bf1f64d` (S1) — tauri.conf.json: removed `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` from both `beforeBuildCommand` + `beforeDevCommand`; retained `VITE_WEB_AUTH_MODE=mock-authenticated`. Diff is 2 lines, scope = config only. Commit body follows Why/What/Scope/Risk/Docs/Tests convention.
- `f9470967` (S2) — LandingPage.tsx: additive `isMockAuthenticated()` guard; offline guard preserved unchanged; same `<Navigate to="/app" replace />` output. Scope = single file.
- `8cbb0633` (S3) — new `tauri-conf-build-profile.test.ts` (TC-TAURI-CONF-1/2/3/4) + RR-LANDING-MOCK-AUTH-1 in router.integration.test.tsx. Read-only/additive; no production code touched.
- `2c471182` (Docs) — dev_log + test.md writeback; docs only.

### Checks run
1. **Original reproduction path (Organizer + Boards).** `App.tsx:122-129` — with the profile env gone, `resolveWebRuntimeProfile` falls back to `web-live`, `showDesktopOnlyModules=false`, so the `module.moduleId !== "organizer"` filter drops Organizer from the rail. `BoardWorkspacesModule.tsx:112-115` — web-live branch calls `loadBoardsOrDefault()` (default boards) instead of `loadOfflineBoardsNoDefault()` (empty offline state). Confirmed via source + green guards.
2. **Boundary (mock-auth cold start + browser non-regression).** LandingPage redirects to `/app` when `VITE_WEB_AUTH_MODE=mock-authenticated` even without offline profile (RR-LANDING-MOCK-AUTH-1 PASS); browser builds without the env var fall through to the landing placeholder and normal auth (guard is purely additive). `mock-authenticated` retained in tauri.conf (TC-TAURI-CONF-3/4 PASS) — the critical no-network-login constraint holds.
3. **Cross sub-fix integration + regression.** `pnpm --filter @repo/web exec vitest run` → **129/129 PASS** (25 files), including the 5 new guards (`tauri-conf-build-profile.test.ts` 4 tests + router.integration.test.tsx now 8 tests). The 5 guards really cover "no desktop-phase1-offline injection / mock-authenticated retained / landing redirect under mock-auth". Pre-existing offline-profile tests (RR1, RR-PREMIUM-1/2, AppProviders, etc.) still green — they inject the profile via vi.stubEnv, unaffected by the config change.
4. **Minimal scope / no stray edits.** Full diff `f7ae1f9f..2c471182` = 6 files: tauri.conf.json, LandingPage.tsx, 2 test files, dev_log.md, test.md. No changes to `packages/core` runtime-profile, shared offline business code, or existing offline tests. Offline profile + its tests preserved for future reuse.
5. **mock-authenticated retention confirmed** in current `tauri.conf.json` (both commands) — critical constraint satisfied.

### Notes / non-blocking
- Build/Tauri app-bundle smoke was already validated in the prior feature-verify PASS; the bugfix is a build-config + UI-gate change with no Rust/native surface impact, so re-running the heavy Tauri bundle is not warranted for ship. `dist` is gitignored and regenerated by `beforeBuildCommand` at package time.
| 2026-05-30 00:52 PDT | bug-verify (claude-opus-4-8) | Verification PASS. Reviewed S1-S4 commits (`2bf1f64d`, `f9470967`, `8cbb0633`, `2c471182`) — all minimal-scope, convention-compliant, no stray core/web/offline-test edits. Reproduction path confirmed via App.tsx organizer filter + BoardWorkspacesModule web-live branch; boundary (mock-auth cold-start redirect + browser non-regression) confirmed; `pnpm --filter @repo/web exec vitest run` = 129/129 PASS incl. 5 new guards; mock-authenticated retained in tauri.conf (critical no-network-login constraint). Status → READY_TO_SHIP. | `2bf1f64d`, `f9470967`, `8cbb0633`, `2c471182` | ship |
| 2026-05-30 09:00 PDT | ship (claude-sonnet-4-6) | Ship gate passed: validated READY_TO_SHIP status (bug-verify PASS), verified 4 BUGFIX commits (`2bf1f64d`, `f9470967`, `8cbb0633`, `2c471182`) against dev_log and convention (type(scope): summary + Why/What/Scope/Risk/Docs/Tests present in all bodies), committed bug-verify dev_log writeback as supplementary docs commit, pushed dev branch to origin/dev. Status → SHIPPED. | `2bf1f64d`, `f9470967`, `8cbb0633`, `2c471182` + ship doc commit | workflow complete |
