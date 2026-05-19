# Discovery Review — click-through-matrix

## Summary

This feature is a manual/native validation task. The execution pack requires actual hit-test behavior with `macOSPrivateApi=true` and `false`; automated typecheck/build cannot prove click-through behavior.

## Recommendation

Do not modify window constants or Tauri config during unattended execution. Prepare the matrix and mark the feature BLOCKED until a human can run the real desktop app and record evidence.

## Required Human Evidence

- macOS version and display setup.
- `macOSPrivateApi=true` behavior:
  - transparent blank area click falls through to Finder/Desktop;
  - Grid item area receives React pointer event;
  - resize handle receives pointer event.
- `macOSPrivateApi=false` behavior for the same three hit-test regions.
- Whether native hit-test forwarding is needed.
- Fallback decision if behavior is unstable.

