# Proposed Contract Changes: Finder Tag Read/Write

## Commands

Track D added command bodies under `commands/finder.rs`:

- `read_finder_tags({ path }) -> FinderTag[]`
- `write_finder_tags({ path, tags }) -> void`

Needed follow-up outside Track D file ownership:

- Register both commands in `apps/desktop/src-tauri/src/lib.rs`.
- Define canonical color mapping for macOS Finder labels.
- Replace write mock/no-op with a platform implementation that updates `com.apple.metadata:_kMDItemUserTags`.
