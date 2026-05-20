# Discovery Review — spaces-multimonitor-matrix

## Summary

This feature is a manual macOS behavior validation task. The repository's `window_ext.rs` currently sets windows to join all Spaces and be stationary, but acceptance requires observing the actual runtime behavior under Mission Control, fullscreen apps, and multiple displays.

## Recommendation

Do safe prep only. Do not change `NSWindowCollectionBehavior`, window levels, or rect restoration before manual evidence exists.

## Required Human Evidence

- Single display behavior.
- Dual display behavior with rect write/restore.
- Mission Control behavior.
- Multi-Space switching behavior.
- Fullscreen app behavior.
- Recovery path if a Grid is hidden, lost, or placed on the wrong display/Space.

