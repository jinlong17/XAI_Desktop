# Time Tracker Design

Source: `/Users/lijinlong/Desktop/AI_Desktop/web design/module-timetrack.jsx`, `tt-shared.jsx`, `tt-insights.jsx`.

This implementation ports the releasable Time Tracker surface from the Claude Design prototype:

- Category-based start flow with Study, Work, Life, and Rest defaults.
- Single-task and multi-task modes, including switch confirmation when a single-task session is already active.
- Category subcategory picker before starting categories such as Study and Life.
- Active tray with pause, resume, end, and edit.
- Date navigation across previous, next, today, and selected-day history.
- Manual record creation plus record edit and delete confirmation.
- Category creation/editing, color and icon selection, goal minutes, subcategory add/remove/reorder, and soft delete.
- Category detail modal with total, last activity, goal progress, and recent records.
- Side insights panel with selected-day total, seven-day trend, clickable bars, and category distribution.
- Configurable Insights board with range tabs, reset, add/remove widgets, drag reorder, and persisted layout.
- Shared localStorage data model for the main module and dashboard widget.

The prototype's full grouped/searchable icon library is represented by a curated local icon set for this release so the package remains self-contained.
