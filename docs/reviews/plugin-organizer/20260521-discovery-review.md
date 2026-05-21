# Discovery Review — plugin-organizer F3

## Problem Framing

F3 is a bounded UX rebuild on top of a live organizer runtime, not a reset. The plan has to improve visual quality and interaction smoothness without breaking three already-live seams:

1. Multi-window grid lifecycle commands already used by TypeScript and Rust.
2. Bookmark-gated Finder/open-path commands added during G3.
3. G3 carry-forward work that still overlaps organizer window ownership.

Repo evidence anchors the current debt:

- `packages/plugin-organizer/src/OrganizerGridContent.tsx` still carries G0 fallback/debug telemetry UI.
- `packages/plugin-organizer/src/SmartContainer.tsx` emits position updates on `onDrag`, while `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts` forwards frequent updates cross-window.
- PRD §5.1 gaps remain open for menu completeness, edge snap/hide, and real thumbnails.

## Constraints

- Keep organizer business logic in `packages/plugin-organizer/`.
- Preserve typed event payload schemas.
- Preserve the live window-command payloads:
  - `create_grid_window({ gridId, rect })`
  - `update_grid_window({ gridId, rect })`
  - `close_grid_window({ gridId })`
- Preserve Finder/open-path bookmark semantics:
  - TS callers send `{ input: { path } }`
  - Rust requires lexical validation plus `BookmarkRegistry` authorization
- Preserve `PersistedLayout` compatibility.
- Preserve the G3 snapshot and carry-forward TODOs in `packages/plugin-organizer/docs/dev_log.md`.

## Candidate Decision Area 1 — Thumbnail Strategy (`FR-DT-11`)

| Option | Approach | Evidence | Pros | Cons | Verdict |
|---|---|---|---|---|---|
| A | Pure web preview (`<img>`, `<video>`, PDF.js for PDFs) | MDN video poster docs; Mozilla PDF.js official repo/API docs | no Rust seam for images/videos; faster UI iteration | PDF preview adds heavy runtime and inconsistent rendering vs. Finder-quality previews | rejected as primary path |
| B | Native Quick Look thumbnail command for supported file types | Apple Quick Look Thumbnailing docs for `QLThumbnailGenerator` and the “Creating Quick Look Thumbnails…” guide | one macOS-native pipeline for image/PDF/video; better preview parity; avoids PDF.js weight | adds Tauri/Rust work, authorization/cache complexity, real-hardware verification | recommended |
| C | Hybrid: web-native for image/video, native command only for PDFs/fallback types | same Apple + MDN sources | smaller native scope than full Option B | two pipelines, inconsistent visuals, more branching | fallback only if review rejects full native seam |

### Recommendation

Use **Option B** as the planning baseline:

- add a new thumbnail command only as an additive seam
- keep organizer UI resilient with placeholder/icon fallback while thumbnails load or fail
- do not persist thumbnail blobs inside `PersistedLayout`
- do not change any existing window/finder command signature to support thumbnails

## Candidate Decision Area 2 — Drag Architecture

| Option | Approach | Evidence | Pros | Cons | Verdict |
|---|---|---|---|---|---|
| A | Unify all organizer dragging onto `@dnd-kit` | official `dnd-kit` repo/docs emphasize extensibility, sensors, accessibility, and performance | one conceptual drag system | high migration risk for free-position container/window drag; scope explosion for F3 | defer |
| B | Keep `react-draggable` for free-position container drag and `@dnd-kit` for item/drop semantics; fix emit hot path instead | official `react-draggable` docs and official `dnd-kit` docs | minimal churn; targets the real bottleneck instead of re-platforming | two libraries remain | recommended |
| C | Unify onto `react-draggable` and custom drop logic | official `react-draggable` repo | smaller dependency surface | loses existing item-drop semantics and adds custom collision/drop work | reject |

### Recommendation

Use **Option B** for F3:

- keep the current split of responsibilities
- move container drag to local optimistic state
- emit cross-window rect updates on commit, not every pointer frame
- leave drag-library unification as a separate future ADR if still needed

## Recommended Build Shape And Ownership

| Phase | Owned files/modules | Outcome | Guardrails |
|---|---|---|---|
| F3-P1 | `packages/plugin-organizer/src/OrganizerGridContent.tsx`, `packages/plugin-organizer/src/SmartContainer.tsx`, `packages/plugin-organizer/src/GridItem.tsx`, `packages/plugin-organizer/src/resize-handles.css` | remove G0 fallback/telemetry/banner/count residue, remove stray debug styling/logs, align baseline visuals to F1 tokens/icons | no hook, host, or Rust edits; no event/command contract changes |
| F3-P2 | `packages/plugin-organizer/src/SmartContainer.tsx`, `packages/plugin-organizer/src/GridItem.tsx`, `packages/plugin-organizer/src/OrganizerGridContent.tsx` | rebuild header hierarchy, direct close affordance, PRD §5.1.2 grid/item menus, visual/action parity | no `useMultiWindowGrids` churn; no host bridge or Rust work |
| F3-P3 | `packages/plugin-organizer/src/SmartContainer.tsx`, `packages/plugin-organizer/src/OrganizerLayer.tsx`, `packages/plugin-organizer/src/hooks/useMultiWindowGrids.ts`, `packages/plugin-organizer/src/hooks/useGridWindow.ts`, `packages/plugin-organizer/src/OrganizerGridContent.tsx`, `apps/desktop/src/windows/GridWindow.tsx`, `apps/desktop/src/windows/ControlWindow.tsx` | smooth drag/resize/fold behavior, commit-only or throttled event budget, host bridge parity with live `{ gridId, rect }` window contract | do not change event payload shape; do not change `create_grid_window` / `update_grid_window` / `close_grid_window` signatures |
| F3-P4 | `packages/plugin-organizer/src/GridItem.tsx`, `packages/plugin-organizer/src/OrganizerGridContent.tsx`, `packages/plugin-organizer/src/SmartContainer.tsx`, additive organizer thumbnail helper(s), additive Rust seam under `apps/desktop/src-tauri/src/commands/`, `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/src-tauri/capabilities/AUDIT.md`, `docs/contracts/tauri-commands-v0.md` | `FR-DT-10` edge snap/hide plus `FR-DT-11` real thumbnails with fallback | additive only; preserve live window/finder command signatures and bookmark-gated finder semantics |

## Recommendation

Proceed with the four-phase plan above. It keeps F3 executable one reviewable phase at a time, names the overlap files explicitly, and protects the live organizer/finder/window contracts already in use.

## Risks

1. `@repo/ui` dependency truth still differs between parent-session handoff and local `docs/PLUGIN_MAP.md`, so build work must treat current exported entrypoints as the source of truth.
2. Thumbnail generation touches Tauri/macOS seams and therefore also touches capability/audit/contract docs when approved.
3. `SmartContainer.tsx`, `OrganizerGridContent.tsx`, and `useMultiWindowGrids.ts` are shared pressure points between G3 carry-forward and F3; phase ownership must stay narrow.

## Open Questions

1. Whether feature-review wants the thumbnail command approved in the same wave as edge snap/hide, or split after P4 contract review.
2. Whether retained development logging should use a thin debug logger wrapper or be removed entirely in F3-P1.
3. Whether edge snap/hide can stay plugin-driven first, or needs additional native positioning support during P4.

## Web Research Evidence

- Query: `site:developer.apple.com QLThumbnailGenerator class documentation QuickLookThumbnailing`
  - Source: https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailgenerator
- Query: `site:developer.apple.com Creating Quick Look Thumbnails to Preview Files in Your App`
  - Source: https://developer.apple.com/documentation/quicklookthumbnailing/creating-quick-look-thumbnails-to-preview-files-in-your-app
- Query: `site:github.com/mozilla/pdf.js official pdf.js repository`
  - Source: https://github.com/mozilla/pdf.js/
- Query: `site:developer.mozilla.org HTMLVideoElement poster`
  - Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/poster
- Query: `site:github.com clauderic/dnd-kit GitHub repository`
  - Source: https://github.com/clauderic/dnd-kit
- Query: `site:github.com react-grid-layout/react-draggable repository`
  - Source: https://github.com/react-grid-layout/react-draggable
