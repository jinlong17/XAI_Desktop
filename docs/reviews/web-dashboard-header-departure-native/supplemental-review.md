# Dashboard Header native supplemental review

Independent executor: Sol. The runner and fixture extensions are commits `eb2e3a8` and `ac32efe`; they bundle the requested immutable product object with pinned workspace package aliases and drive a separate headless Chrome profile through CDP. Parent-owned native modes and `review.md` remain separate.

## Fixed 9193353 result

Product object `9193353` passes the following added real-browser boundaries with zero captured runtime errors:

- offset conflict: physical raw changes from `0` to `35` after native pointerdown; the visible desired coordinate reaches `60px`, the physical `35` is preserved, and route departure stays on Dashboard with a dialog.
- full-denial export: both note and position remain in memory while all Storage reads and writes throw; the actual disk file is exactly `{version:1, kind:"dashboard-note-draft", note:"Latest denied memory note", noteOffset:75}`.
- device owner/lock: a position write waits on its real physical-key Web Lock, crosses A to B to locked, then fails; A's note is masked and the disk export is exactly `{version:1, kind:"dashboard-note-draft", note:"", noteOffset:70}`.
- source-only EN and ZH: unavailable offset source plus a native no-move pointer has no beforeunload warning or host dialog. At 375/414/768/1024/1440 the localized recovery message and Reload button are contained, have no horizontal overflow, and the button is physically hit-testable with 44px height.
- ordinary Tab blur: writable storage persists `Ordinary blur saved note` without a departure dialog.

Two added slow-pointer departure cases correctly FAIL at `9193353`:

- AppRail Tasks: after pointerdown is held for 120ms, blur persists `Slow pointer unsaved note`; pointerup navigates to `/app/tasks` with no dialog.
- mini-calendar widget: the same hold persists the note, leaves the path on Dashboard after the shifted click target, and shows no dialog.

These are product failures at the blur/reservation boundary, not Chrome startup or fixture failures. The positive ordinary-blur control shows blur persistence itself remains required. Final acceptance needs the same immutable slow-pointer cases to retain original physical bytes and open the departure dialog after the author fix.

## Before evidence

At `41fb4d1`, the real offset-conflict route escaped to Tasks without a dialog, and unavailable-source plus a no-move native pointer produced a false beforeunload warning in both languages. Full-denial memory export and A to B to locked device export were already positive controls. Early `sol-before` files that failed before reaching product assertions were fixture-development output and are intentionally excluded.
